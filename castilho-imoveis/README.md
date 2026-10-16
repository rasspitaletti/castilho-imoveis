# Castilho Imóveis — site

Catálogo imobiliário do **Corretor Castilho** (Araçariguama-SP). Tem busca por bairro/condomínio e
faixa de preço, página individual para cada imóvel, visualização rápida, galeria, mapa e contato
por WhatsApp, telefone e Instagram. O visual usa **glassmorphism** sobre fotografias reais.

Feito em **HTML, CSS e JavaScript puros**, sem dependências para instalar. Só precisa do **Node.js 18+**.

```bash
npm run dev      # abre em http://localhost:3000 e reconstrói ao salvar
npm run build    # gera o site final na pasta dist/
npm test         # build + testes (filtros, links, WhatsApp, Instagram, SEO, fotos)
npm run fotos    # otimiza fotos novas (cria versões .webp) — requer FFmpeg
npm run frames   # extrai capturas de vídeos em midia/videos/ — requer FFmpeg
```

Para publicar, envie o conteúdo da pasta **`dist/`** para qualquer hospedagem estática
(Netlify, Vercel, Cloudflare Pages, Hostinger etc.).

---

## De onde vieram os imóveis e as fotos

Os imóveis CI-001 a CI-008 de `src/dados/imoveis.js` foram levantados nos **Reels públicos do
@corretorcastilho_oficial** em 15/10/2026, a partir das legendas e das capas dos vídeos.

- Só foram preenchidos os dados que aparecem na legenda ou no texto da capa. O que não foi
  informado fica `null` e não aparece no site.
- Sem preço publicado, o imóvel aparece como **“Valor sob consulta”**, e o botão do WhatsApp
  pergunta o valor daquele imóvel.
- Cada imóvel guarda os links dos posts de origem (`fonte.posts`). A página do imóvel mostra
  esses vídeos em **“Tour em vídeo”**.
- As fotos são as **capas dos Reels** (uma por vídeo), otimizadas em JPG e WebP. Nenhuma imagem
  é gerada por IA ou de banco de imagens.
- O topo usa um recorte da capa do Reel da chácara no Sítio do Engenho (céu e morros, sem o texto
  sobreposto).

**Limitações:** sem login, o Instagram mostra só os 12 posts mais recentes (o perfil tem 242) e
não libera os vídeos, então ainda não houve extração de frames. A capa de um post em parceria com
@janainamarquesimobiliaria não foi usada porque mostra o telefone de outra corretora.

### Fotos enviadas pelo corretor (capas)
Em 16/10/2026 o corretor enviou 3 fotos numeradas, que viraram a **capa** de cada imóvel
(`capa: true` em `imagens`, aparecem antes das ilustrativas):
1. **Sobrado alto padrão no Reserva Araçari** (imóvel novo, `CI-009`, com o texto enviado; valor e áreas não informados)
2. **Casa com ofurô no Jardim Bela Vista** (`CI-001`)
3. **Sobrado mobiliado no Altos da Castelo** (`CI-002`)

As fotos foram ampliadas (2×), com redução de ruído, nitidez e um leve ajuste de contraste. Na
foto 2 foi cortado o ícone de "play" do Instagram.

### Fotos ilustrativas temporárias
O topo usa a foto enviada pelo Raul (`public/imagens/institucional/fachada-hero.jpg`). O contato,
os cards e as galerias usam **fotos reais do Unsplash** (licença livre), sempre com o selo
"Foto ilustrativa", e a galeria de cada imóvel termina com as fotos reais do anúncio. Para os
imóveis mostrarem só as fotos reais, use `NOS_IMOVEIS = false`. Os sites de referência de UI/UX não têm fotos
de imóveis, só logotipos e banners. Cada foto ilustrativa mostra o selo **"Foto ilustrativa"**, e
a galeria de cada imóvel termina com as **fotos reais do anúncio**, marcadas
"Foto real do anúncio · Instagram". As fotos ficam em `src/dados/fotos-ilustrativas.js`, com o
crédito de cada uma. Para desligar todas de uma vez, use `ATIVAS = false`.

A foto do corretor responsável está em `public/imagens/corretor/` e é usada no topo, na seção
Sobre e no contato.

### Para ter mais fotos de cada imóvel
1. Baixe os Reels de cada imóvel e salve em `midia/videos/<slug>.mp4`
   (ex.: `midia/videos/casa-ofuro-jardim-bela-vista.mp4`; outro vídeo do mesmo imóvel: `...-2.mp4`).
2. `npm run frames`: gera 12 capturas por vídeo em `public/imagens/imoveis/<slug>/`.
3. Apague as capturas ruins e rode `npm run fotos` para criar as versões WebP.
4. Copie o trecho `imagens: [...]` que o comando mostra para o imóvel em `src/dados/imoveis.js`,
   descreva cada foto em `alt` e ajuste `foco` (o ponto da foto que fica visível nos recortes).

---

## ⚠️ Pendências antes de publicar

| Item | Situação | Onde alterar |
|---|---|---|
| **Disponibilidade** | Confirmar com o corretor se os 9 imóveis continuam à venda. | `src/dados/imoveis.js` |
| **Valores** | 6 imóveis estão “sob consulta” (preço não informado nos posts). | `preco` de cada imóvel |
| Divergência | Reserva Araçari: o post do corretor diz **2 suítes**; o da parceira diz **1 suíte**. | `CI-003` |
| **CRECI** | Obrigatório em anúncios (Decreto 81.871/78, art. 4º). | `src/dados/site.js` → `corretor.creci` |
| Nome completo e foto do corretor | Não informados (a seção “Sobre” usa a foto dele em um imóvel). | `site.js` → `corretor.nome`, `corretor.foto` |
| E-mail e horário | Não informados (ficam ocultos enquanto `null`). | `site.js` → `contato` |
| Domínio | Necessário para sitemap, link canônico e link do imóvel na mensagem do WhatsApp. | `site.js` → `url` |

Dados já configurados: WhatsApp e telefone **(11) 94444-4646**, Instagram **@corretorcastilho_oficial**,
região **Araçariguama-SP** e formação **Pós-graduado em Direito Imobiliário** (da bio do Instagram).

Se esta pasta ainda tiver `public/imagens/demo/` ou `scripts/gerar-imagens-demo.mjs` da primeira
versão, apague: eram as ilustrações de demonstração e não são mais usadas.

---

## Design: glassmorphism e referências de UI/UX

Superfícies de vidro (fundo translúcido, `backdrop-filter`, borda clara de 1 px, reflexo interno e
sombra em camadas) aparecem no cabeçalho, no painel de busca, nos campos e menus suspensos, nos
cards, na janela de visualização rápida, na galeria, no contato e nos botões flutuantes. As fotos
dos imóveis nunca recebem desfoque. Na galeria, as laterais de fotos verticais são preenchidas com
uma cópia desfocada da mesma foto, e a foto principal fica nítida por cima.

Como as referências viraram decisões concretas (tudo está em `src/estilos/estilo.css`):

| Referência | Decisão no site |
|---|---|
| utopia.fyi | Tipografia e espaçamentos fluidos com `clamp()` (telas de 360 a 1240 px; base 15→17 px; razões 1,2→1,25). |
| open-props.style | Tokens de duração (120/180/260/420 ms) e sombras em camadas `--sombra-1..3`. |
| designsystems.one · designsystemchecklist.com | Tokens em dois níveis (primitivos → semânticos), escalas documentadas, foco visível, contraste verificado. |
| kinetics.colorion.co | Curvas “soft settle” `cubic-bezier(.16,1,.3,1)` e “overshoot” `cubic-bezier(.34,1.56,.64,1)` nas setas e nos botões flutuantes. |
| animatedbuttons.colorion.co | Efeito *Sheen* (faixa de luz) nos botões principais e *Arrow push* nas setas. |
| interfaces.rauno.me | Hover só em mouse (`hover: hover`); campos com ≥16 px (sem zoom no iPhone); números tabulares nos preços; foco por `box-shadow`; botões afundam para 0,97 ao clicar; janelas entram com fade + scale; `::selection`; elementos decorativos sem `pointer-events`. |
| bg.ibelick.com | Fundo com gradientes radiais e malha de pontos mascarada atrás do vidro. |
| reui.io · coss.com/ui | Busca com filtros + chips removíveis; menus suspensos acessíveis (`listbox` com teclado completo). |
| vibeprompts.dev | Hero escuro com brilho radial e marca gigante; uso da busca logo abaixo do título. |
| iconcreator.dev | Ícones em linha de 1,6 px, grade de 24 px, mesmo estilo em todo o site. |
| ui.skills | Bloqueou o acesso automatizado; não foi analisado. |

**Acessibilidade e desempenho:** contraste dos textos entre 5,6:1 e 14,6:1 (AA). Os menus
suspensos em vidro funcionam por teclado (setas, Enter, Esc, letras) e, no celular, dão lugar ao
seletor nativo do sistema. O desfoque é aplicado só onde há conteúdo atrás. Sem suporte a
`backdrop-filter`, as superfícies ficam mais opacas. Também há suporte a movimento reduzido. Fotos
em WebP (480 e ~800 px) com JPG de reserva; página inicial com cerca de 420 KB.

---

## Estrutura

```
src/
  dados/site.js            ← contatos e dados institucionais (único lugar)
  dados/imoveis.js         ← catálogo de imóveis + oportunidades (lotes/casas novas)
  dados/manifesto-imagens.js  (gerado pelo build: quais fotos têm WebP)
  lib/filtros.js           ← busca, filtros combinados, ordenação, URL
  lib/contato.js           ← WhatsApp (mensagem por imóvel), telefone, mapa
  lib/formatar.js          ← R$, “sob consulta”, áreas, datas
  componentes/
    layout.js              (cabeçalho, rodapé, botões flutuantes, <head>/SEO)
    secoes.js              (hero, busca/filtros, destaques, categorias, catálogo, oportunidades, sobre, contato)
    imovel.js              (imagem responsiva, card, selos, ficha técnica)
    detalhes.js            (página do imóvel, galeria, mapa, vídeos)
    icones.js
  cliente/app.js           ← navegador: filtros, menus em vidro, visualização rápida, galeria, menu
  estilos/estilo.css       ← todo o visual (tokens no topo, em :root)
public/imagens/imoveis/    ← fotos por imóvel (.jpg + .webp)
public/imagens/institucional/
scripts/                   ← build, servidor, otimizar fotos, extrair frames
tests/                     ← testes (npm test) + teste no navegador (Python)
```

### Teste no navegador (opcional)
```bash
pip install playwright && playwright install chromium
npm run dev   # em outro terminal
python tests/e2e_navegador.py http://localhost:3000
```
