"""
Teste de ponta a ponta no navegador (opcional).
Requer Python + Playwright:  pip install playwright && playwright install chromium
Uso: com o site rodando (npm run dev), execute:  python tests/e2e_navegador.py [http://localhost:3000]
"""
import re
import sys
from playwright.sync_api import sync_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:3000').rstrip('/')
falhas = []


def checar(cond, msg):
    print(('  ✔ ' if cond else '  ✖ ') + msg)
    if not cond:
        falhas.append(msg)


def ids(pg):
    return sorted(pg.locator('[data-grade] .card').evaluate_all('els => els.map(e => e.dataset.id)'))


def contagem(pg):
    return pg.locator('[data-contagem]').inner_text()


with sync_playwright() as p:
    nav = p.chromium.launch()
    pg = nav.new_page(viewport={'width': 1440, 'height': 900})
    erros = []
    pg.on('pageerror', lambda e: erros.append(str(e)))

    print('Catálogo e filtros')
    pg.goto(BASE + '/', wait_until='domcontentloaded')
    total = pg.locator('[data-grade] .card').count()
    checar(total == 9 and '9 imóveis encontrados' in contagem(pg), f'catálogo completo ({total})')

    # faixa de preço (exclui "sob consulta")
    pg.fill('#f-preco-min', '300000')
    pg.fill('#f-preco-max', '750000')
    checar(pg.input_value('#f-preco-min').replace('\xa0', ' ') == 'R$ 300.000', 'preço formatado em R$')
    checar('Buscar' in pg.locator('[data-busca-aviso]').inner_text(), 'avisa para clicar em Buscar')
    pg.click('button[type=submit]')
    checar(ids(pg) == ['CI-003', 'CI-004'], f'R$300–750 mil → {ids(pg)}')
    checar('2 imóveis encontrados' in contagem(pg), 'contagem atualizada')
    checar('precoMin=300000' in pg.url, 'busca refletida na URL')

    # menu suspenso em vidro: bairro
    pg.locator('.vselect:has(#f-bairro) .vselect__botao').click()
    checar(pg.locator('#f-bairro-lista').is_visible(), 'menu suspenso em vidro abre')
    pg.locator('#f-bairro-lista [role=option]:has-text("Condomínio Reserva Araçari")').click()
    checar(pg.input_value('#f-bairro') == 'Condomínio Reserva Araçari', 'opção escolhida vai para o <select>')
    pg.click('button[type=submit]')
    checar(ids(pg) == ['CI-003'], 'bairro + preço combinados')

    # teclado no menu suspenso
    pg.locator('.vselect:has(#f-tipo) .vselect__botao').focus()
    pg.keyboard.press('ArrowDown')
    checar(pg.locator('#f-tipo-lista').is_visible(), 'menu abre pelo teclado')
    pg.keyboard.press('Escape')
    checar(not pg.locator('#f-tipo-lista').is_visible(), 'Esc fecha o menu')

    # combinação sem resultado
    pg.locator('fieldset:has(legend:text("Quartos")) label:has-text("3+")').click()
    pg.click('button[type=submit]')
    checar(pg.locator('[data-vazio]').is_visible() and 'Nenhum' in contagem(pg), 'mensagem amigável sem resultados')
    pg.locator('[data-remover="quartos"]').click()
    checar(ids(pg) == ['CI-003'], 'remover filtro pelo chip')

    pg.click('[data-limpar]')
    checar(len(ids(pg)) == 9 and pg.input_value('#f-preco-min') == '' and pg.input_value('#f-bairro') == '', 'Limpar filtros restaura tudo')

    # ordenação
    pg.locator('.vselect:has(#f-ordem) .vselect__botao').click()
    pg.locator('#f-ordem-lista [role=option]:has-text("Menor preço")').click()
    precos = [int(re.sub(r'\D', '', t)) for t in pg.locator('.card__preco:not(.card__preco--consulta)').all_inner_texts()]
    checar(precos == sorted(precos) and pg.locator('.card').last.locator('.card__preco--consulta').count() == 1, f'menor preço, "sob consulta" no fim {precos}')
    pg.select_option('#f-ordem', 'recentes', force=True)
    pg.locator('#f-ordem').dispatch_event('change')
    primeiro = pg.locator('[data-grade] .card').first.get_attribute('data-id')
    checar(primeiro == 'CI-008', f'mais recentes primeiro ({primeiro})')

    # busca digitada e tipo
    pg.click('[data-limpar]')
    pg.fill('#f-busca', 'chácara')
    pg.click('button[type=submit]')
    checar(ids(pg) == ['CI-004', 'CI-005', 'CI-008'], f'busca "chácara" → {ids(pg)}')
    pg.click('[data-limpar]')
    pg.locator('fieldset:has(legend:text("Suítes")) label:has-text("2+")').click()
    pg.click('button[type=submit]')
    checar(ids(pg) == ['CI-003', 'CI-005', 'CI-006'], f'2+ suítes → {ids(pg)}')

    # slider
    pg.click('[data-limpar]')
    pg.locator('[data-faixa-max]').fill('500000')
    pg.locator('[data-faixa-max]').dispatch_event('input')
    checar(pg.input_value('#f-preco-max').replace('\xa0', ' ') == 'R$ 500.000', 'slider ajusta preço máximo')
    pg.click('button[type=submit]')
    checar(ids(pg) == ['CI-004'], 'slider filtra')

    # categoria
    pg.click('[data-limpar]')
    pg.locator('.categoria:has-text("Sobrado")').click()
    pg.wait_for_timeout(300)
    checar(ids(pg) == ['CI-002', 'CI-006', 'CI-009'], f'categoria Sobrado filtra ({ids(pg)})')
    checar(pg.locator('.nav__link:has-text("Alugar")').count() == 0, 'sem "Alugar" (não há imóveis para alugar)')

    # URL
    pg.goto(BASE + '/?tipo=chacara&quartos=2#imoveis')
    checar(ids(pg) == ['CI-004', 'CI-005'], f'filtros carregados da URL ({ids(pg)})')

    print('Visualização rápida')
    pg.goto(BASE + '/#imoveis')
    pg.locator('[data-visualizar="CI-002"]').click()
    dlg = pg.locator('[data-rapida]')
    checar(dlg.is_visible() and 'Altos da Castelo' in dlg.inner_text(), 'janela abre com o imóvel certo')
    wa = dlg.locator('a.btn--whats').get_attribute('href')
    checar('5511944444646' in wa and 'CI-002' in wa and 'valor' in wa, 'WhatsApp da janela pede o valor do imóvel certo')
    pg.keyboard.press('Escape')
    checar(not dlg.is_visible(), 'Esc fecha a janela')

    print('Página do imóvel')
    pg.goto(BASE + '/')
    card = pg.locator('[data-grade] .card[data-id="CI-001"]')
    titulo = card.locator('.card__titulo').inner_text()
    card.locator('a:has-text("Ver detalhes")').click()
    pg.wait_for_load_state()
    checar(pg.locator('h1').inner_text() == titulo, 'Ver detalhes abre o imóvel correto')
    checar(pg.locator('[data-galeria-contador]').inner_text() == '1 / 7', 'galeria: capa do corretor + 4 ilustrativas + 2 reais')
    checar(pg.locator('.galeria__origem--real').count() == 3, 'fotos reais identificadas na galeria')
    pg.click('[data-galeria-prox]')
    checar(pg.locator('[data-galeria-contador]').inner_text() == '2 / 7', 'próxima foto')
    pg.click('[data-galeria-ampliar]')
    checar(pg.locator('[data-lightbox]').is_visible(), 'tela cheia')
    pg.keyboard.press('ArrowRight')
    checar(pg.locator('[data-galeria-contador]').inner_text() == '3 / 7', 'teclado navega')
    pg.keyboard.press('Escape')
    wa = pg.locator('.cartao-contato a.btn--whats').get_attribute('href')
    checar(wa.startswith('https://wa.me/5511944444646?text=') and 'CI-001' in wa, 'WhatsApp identifica o imóvel')
    checar(pg.locator('.videos a[href*="instagram.com"]').count() == 3, 'links para os 3 vídeos no Instagram')
    checar(pg.locator('.mapa iframe').count() == 1, 'mapa presente')

    print('Celular')
    m = nav.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    m.on('pageerror', lambda e: erros.append(str(e)))
    m.goto(BASE + '/')
    checar(m.evaluate('document.documentElement.scrollWidth') <= 390, 'sem rolagem horizontal na home')
    checar(m.locator('.vselect').count() == 0, 'no celular usa o seletor nativo do sistema')
    m.click('[data-menu-botao]')
    m.wait_for_timeout(350)
    checar(m.locator('.nav').is_visible(), 'menu abre')
    m.locator('.nav__link:has-text("Contato")').click()
    m.wait_for_timeout(500)
    checar(not m.locator('.cabecalho').evaluate("e => e.classList.contains('is-menu-aberto')"), 'menu fecha ao escolher')
    m.locator('#buscar').scroll_into_view_if_needed()
    m.wait_for_timeout(500)
    checar(m.locator('[data-flutuantes]').evaluate("e => e.classList.contains('is-sobre-busca')"), 'WhatsApp flutuante sai da frente da busca')
    m.goto(BASE + '/imoveis/casa-reserva-aracari/')
    checar(m.evaluate('document.documentElement.scrollWidth') <= 390, 'sem rolagem horizontal no imóvel')
    checar(m.locator('[data-barra-fixa]').is_visible(), 'barra fixa com WhatsApp')

    checar(not erros, f'sem erros de JavaScript {erros}')
    nav.close()

print('\n' + ('TODOS OS TESTES PASSARAM' if not falhas else f'{len(falhas)} FALHA(S)'))
sys.exit(1 if falhas else 0)
