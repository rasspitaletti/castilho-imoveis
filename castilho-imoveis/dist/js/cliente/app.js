// Interatividade do site (executa no navegador).
// Reutiliza os mesmos módulos de dados, filtros e componentes usados no build.
import { site } from '../dados/site.js';
import { imoveis } from '../dados/imoveis.js';
import {
  novoFiltro, filtrar, ordenar, faixaPreco, contarFiltrosAtivos, filtrosParaQuery, filtrosDaQuery, opcoesLocalizacao,
} from '../lib/filtros.js';
import { formatarPreco, lerValorMonetario, rotuloTipo, plural, esc, precoAnuncio, localizacaoTexto } from '../lib/formatar.js';
import { linkWhatsAppImovel } from '../lib/contato.js';
import { cardImovel, imagem, selos, specsCurtas, fichaTecnica, urlPaginaImovel, seloFoto } from '../componentes/imovel.js';
import { capaDoImovel } from '../lib/fotos.js';
import { icone, iconeWhatsApp } from '../componentes/icones.js';

const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
const reduzirMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ======================== CABEÇALHO E MENU ======================== */
function iniciarCabecalho() {
  const cab = $('[data-cabecalho]');
  if (!cab) return;
  const flut = $('[data-flutuantes]');
  const aoRolar = () => {
    cab.classList.toggle('is-rolado', scrollY > 24);
    flut?.classList.toggle('is-visivel', scrollY > 280);
  };
  aoRolar();
  addEventListener('scroll', aoRolar, { passive: true });

  // não deixa o botão flutuante cobrir os campos da busca (no celular)
  const painelBusca = $('[data-busca]');
  if (flut && painelBusca && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => flut.classList.toggle('is-sobre-busca', e.isIntersecting), { rootMargin: '-10% 0px -10% 0px' }).observe(painelBusca);
  }

  const botao = $('[data-menu-botao]');
  const menu = $('[data-menu]');
  const fechar = () => {
    cab.classList.remove('is-menu-aberto');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', 'Abrir menu');
    botao.innerHTML = icone('menu');
    document.body.classList.remove('sem-rolagem');
  };
  botao?.addEventListener('click', () => {
    const abrir = !cab.classList.contains('is-menu-aberto');
    if (!abrir) return fechar();
    cab.classList.add('is-menu-aberto');
    botao.setAttribute('aria-expanded', 'true');
    botao.setAttribute('aria-label', 'Fechar menu');
    botao.innerHTML = icone('fechar');
    document.body.classList.add('sem-rolagem');
  });
  menu?.addEventListener('click', (e) => e.target.closest('a') && fechar());
  addEventListener('keydown', (e) => e.key === 'Escape' && cab.classList.contains('is-menu-aberto') && (fechar(), botao.focus()));
  matchMedia('(min-width: 1100px)').addEventListener('change', fechar);
}

/* ======================== BUSCA E CATÁLOGO ======================== */
function iniciarCatalogo() {
  const form = $('[data-busca]');
  const grade = $('[data-grade]');
  if (!form || !grade) return;

  const el = {
    contagem: $('[data-contagem]'),
    vazio: $('[data-vazio]'),
    carregar: $('[data-carregar]'),
    ordem: $('[data-ordem]'),
    chips: $('[data-chips]'),
    aviso: $('[data-busca-aviso]'),
    cidade: form.elements.cidade,
    bairro: form.elements.bairro,
    precoMin: form.elements.precoMin,
    precoMax: form.elements.precoMax,
    faixa: $('[data-faixa]'),
    faixaMin: $('[data-faixa-min]'),
    faixaMax: $('[data-faixa-max]'),
    faixaAtivo: $('[data-faixa-ativo]'),
    faixaTexto: $('[data-faixa-texto]'),
    mais: $('[data-mais-filtros]'),
    maisContagem: $('[data-mais-contagem]'),
    catalogo: $('#imoveis'),
  };
  const { bairrosPorCidade, cidades } = opcoesLocalizacao(imoveis);
  const porPagina = site.imoveisPorPagina || 6;

  let aplicado = novoFiltro();
  let ordem = 'relevancia';
  let limite = porPagina;

  // "Mais filtros" aberto por padrão em telas grandes
  if (el.mais && matchMedia('(min-width: 900px)').matches) el.mais.open = true;

  // ---------- bairros dependentes da cidade ----------
  const ehSelect = (x) => x?.tagName === 'SELECT';
  function montarBairros(cidade, selecionado = '') {
    if (!ehSelect(el.bairro)) return;
    if (!ehSelect(el.cidade)) {
      // uma única cidade: lista simples de bairros/condomínios
      el.bairro.value = selecionado;
      return;
    }
    const opt = (b, c) => `<option value="${esc(b)}" data-cidade="${esc(c)}"${b === selecionado ? ' selected' : ''}>${esc(b)}</option>`;
    el.bairro.innerHTML =
      '<option value="">Todos</option>' +
      (cidade && bairrosPorCidade[cidade]
        ? bairrosPorCidade[cidade].map((b) => opt(b, cidade)).join('')
        : cidades.map((c) => `<optgroup label="${esc(c)}">${bairrosPorCidade[c].map((b) => opt(b, c)).join('')}</optgroup>`).join(''));
  }
  if (ehSelect(el.cidade)) el.cidade.addEventListener('change', () => { montarBairros(el.cidade.value); sincronizarSelects(); marcarAlterado(); });
  if (ehSelect(el.bairro)) el.bairro.addEventListener('change', () => {
    const c = el.bairro.selectedOptions[0]?.dataset.cidade;
    if (c && ehSelect(el.cidade) && !el.cidade.value) { el.cidade.value = c; montarBairros(c, el.bairro.value); sincronizarSelects(); }
    marcarAlterado();
  });

  // ---------- preço: campos em R$ + controle deslizante ----------
  const faixaAtual = () => faixaPreco(imoveis, form.elements.finalidade.value);
  function passo({ min, max }) {
    const d = max - min;
    return d > 2_000_000 ? 50_000 : d > 200_000 ? 10_000 : d > 20_000 ? 1_000 : 100;
  }
  function atualizarFaixa() {
    if (!el.faixa) return;
    const f = faixaAtual();
    const st = passo(f);
    const lo = Math.floor(f.min / st) * st;
    const hi = Math.ceil(f.max / st) * st;
    for (const r of [el.faixaMin, el.faixaMax]) { r.min = lo; r.max = hi; r.step = st; }
    const vMin = lerValorMonetario(el.precoMin.value);
    const vMax = lerValorMonetario(el.precoMax.value);
    el.faixaMin.value = vMin == null ? lo : Math.min(Math.max(vMin, lo), hi);
    el.faixaMax.value = vMax == null ? hi : Math.min(Math.max(vMax, lo), hi);
    pintarFaixa();
  }
  function pintarFaixa() {
    const lo = +el.faixaMin.min;
    const hi = +el.faixaMin.max;
    const pct = (v) => (hi === lo ? 0 : ((v - lo) / (hi - lo)) * 100);
    el.faixaAtivo.style.left = `${pct(+el.faixaMin.value)}%`;
    el.faixaAtivo.style.right = `${100 - pct(+el.faixaMax.value)}%`;
    const tMin = el.precoMin.value ? formatarPreco(lerValorMonetario(el.precoMin.value)) : 'Sem mínimo';
    const tMax = el.precoMax.value ? formatarPreco(lerValorMonetario(el.precoMax.value)) : 'Sem máximo';
    el.faixaTexto.textContent = `${tMin} — ${tMax}`;
  }
  function aoMoverFaixa(e) {
    let a = +el.faixaMin.value;
    let b = +el.faixaMax.value;
    if (a > b) { if (e.target === el.faixaMin) a = b; else b = a; el.faixaMin.value = a; el.faixaMax.value = b; }
    el.precoMin.value = a <= +el.faixaMin.min ? '' : formatarPreco(a);
    el.precoMax.value = b >= +el.faixaMax.max ? '' : formatarPreco(b);
    pintarFaixa();
    marcarAlterado();
  }
  el.faixaMin?.addEventListener('input', aoMoverFaixa);
  el.faixaMax?.addEventListener('input', aoMoverFaixa);

  for (const campo of [el.precoMin, el.precoMax]) {
    campo.addEventListener('input', () => {
      // mantém apenas dígitos enquanto digita e formata em R$
      const n = lerValorMonetario(campo.value.replace(/[^\d]/g, ''));
      campo.value = n == null ? '' : formatarPreco(n);
      atualizarFaixa();
      marcarAlterado();
    });
  }
  for (const r of $$('input[name="finalidade"]', form)) r.addEventListener('change', () => { atualizarFaixa(); marcarAlterado(); });

  // ---------- ler / escrever o formulário ----------
  function lerFormulario() {
    const fd = new FormData(form);
    const num = (v) => (v === '' || v == null ? null : Number(v));
    const f = novoFiltro({
      busca: (fd.get('busca') || '').trim(),
      cidade: fd.get('cidade') || '',
      bairro: fd.get('bairro') || '',
      regioes: fd.getAll('regioes'),
      precoMin: lerValorMonetario(fd.get('precoMin')),
      precoMax: lerValorMonetario(fd.get('precoMax')),
      tipo: fd.get('tipo') || '',
      finalidade: fd.get('finalidade') || '',
      quartos: Number(fd.get('quartos') || 0),
      suites: Number(fd.get('suites') || 0),
      banheiros: Number(fd.get('banheiros') || 0),
      vagas: Number(fd.get('vagas') || 0),
      areaMin: num(fd.get('areaMin')),
    });
    if (f.precoMin != null && f.precoMax != null && f.precoMin > f.precoMax) [f.precoMin, f.precoMax] = [f.precoMax, f.precoMin];
    return f;
  }

  function escreverFormulario(f) {
    form.elements.busca.value = f.busca;
    el.cidade.value = cidades.includes(f.cidade) ? f.cidade : '';
    montarBairros(el.cidade.value, f.bairro);
    for (const cb of $$('input[name="regioes"]', form)) cb.checked = f.regioes.includes(cb.value);
    el.precoMin.value = f.precoMin != null ? formatarPreco(f.precoMin) : '';
    el.precoMax.value = f.precoMax != null ? formatarPreco(f.precoMax) : '';
    if (form.elements.tipo) form.elements.tipo.value = f.tipo;
    for (const nome of ['finalidade', 'quartos', 'suites', 'banheiros', 'vagas']) {
      const alvo = String(f[nome] ?? '');
      const radios = $$(`input[type="radio"][name="${nome}"]`, form);
      const r = radios.find((x) => x.value === alvo) || radios[0];
      if (r) r.checked = true;
      const oculto = $(`input[type="hidden"][name="${nome}"]`, form);
      if (oculto) oculto.value = alvo === '0' ? '' : alvo;
    }
    if (form.elements.areaMin) form.elements.areaMin.value = f.areaMin ?? '';
    sincronizarSelects();
    atualizarFaixa();
    atualizarContagemMais(f);
  }

  function atualizarContagemMais(f) {
    if (!el.maisContagem) return;
    const n = (f.tipo ? 1 : 0) + (f.quartos > 0) + (f.suites > 0) + (f.banheiros > 0) + (f.vagas > 0) + (f.areaMin ? 1 : 0);
    el.maisContagem.textContent = n ? `(${n})` : '';
  }

  // Avisa quando há critérios alterados que ainda não foram aplicados
  function marcarAlterado() {
    const mudou = filtrosParaQuery(lerFormulario()) !== filtrosParaQuery(aplicado);
    form.classList.toggle('is-alterado', mudou);
    el.aviso.textContent = mudou ? 'Clique em “Buscar imóveis” para atualizar os resultados.' : '';
  }
  form.addEventListener('input', (e) => { if (!e.target.matches('[data-moeda], [data-faixa-min], [data-faixa-max]')) marcarAlterado(); });

  // ---------- resultados ----------
  function rotulosAtivos(f) {
    const r = [];
    const add = (chave, texto, valor) => r.push({ chave, texto, valor });
    if (f.busca) add('busca', `“${f.busca}”`);
    if (f.finalidade) add('finalidade', f.finalidade === 'venda' ? 'Comprar' : 'Alugar');
    if (f.cidade) add('cidade', f.cidade);
    if (f.bairro) add('bairro', f.bairro);
    for (const reg of f.regioes) add('regioes', reg, reg);
    if (f.precoMin != null) add('precoMin', `A partir de ${formatarPreco(f.precoMin)}`);
    if (f.precoMax != null) add('precoMax', `Até ${formatarPreco(f.precoMax)}`);
    if (f.tipo) add('tipo', rotuloTipo(f.tipo));
    if (f.quartos) add('quartos', `${f.quartos}+ quartos`);
    if (f.suites) add('suites', `${f.suites}+ suítes`);
    if (f.banheiros) add('banheiros', `${f.banheiros}+ banheiros`);
    if (f.vagas) add('vagas', `${f.vagas}+ vagas`);
    if (f.areaMin) add('areaMin', `Mín. ${f.areaMin} m²`);
    return r;
  }

  function renderizar({ rolar = false } = {}) {
    const resultado = ordenar(filtrar(imoveis, aplicado), ordem);
    const visiveis = resultado.slice(0, limite);
    grade.innerHTML = visiveis.map((i) => cardImovel(i)).join('');
    grade.hidden = resultado.length === 0;
    el.vazio.hidden = resultado.length !== 0;
    el.carregar.hidden = resultado.length <= limite;
    el.contagem.textContent = resultado.length
      ? `${plural(resultado.length, 'imóvel encontrado', 'imóveis encontrados')}${resultado.length > visiveis.length ? ` · exibindo ${visiveis.length}` : ''}`
      : 'Nenhum imóvel encontrado';

    const chips = rotulosAtivos(aplicado);
    el.chips.hidden = !chips.length;
    el.chips.innerHTML = chips.length
      ? chips.map((c) => `<button type="button" class="chip-ativo" data-remover="${c.chave}"${c.valor ? ` data-valor="${esc(c.valor)}"` : ''} aria-label="Remover filtro ${esc(c.texto)}">${esc(c.texto)} ${icone('fechar')}</button>`).join('') +
        '<button type="button" class="chip-ativo chip-ativo--limpar" data-remover="tudo">Limpar tudo</button>'
      : '';

    form.classList.remove('is-alterado');
    el.aviso.textContent = '';
    atualizarContagemMais(aplicado);

    const qs = filtrosParaQuery(aplicado, ordem);
    history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`);
    if (rolar) el.catalogo.scrollIntoView({ behavior: reduzirMovimento ? 'auto' : 'smooth', block: 'start' });
  }

  function aplicar(f, opcoes) {
    aplicado = f;
    limite = porPagina;
    renderizar(opcoes);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    aplicar(lerFormulario(), { rolar: true });
  });
  form.addEventListener('reset', (e) => {
    e.preventDefault();
    escreverFormulario(novoFiltro());
    aplicar(novoFiltro());
  });
  $('[data-limpar-vazio]')?.addEventListener('click', () => { escreverFormulario(novoFiltro()); aplicar(novoFiltro()); });

  el.ordem.addEventListener('change', () => { ordem = el.ordem.value; renderizar(); });
  el.ordem.addEventListener('input', () => { ordem = el.ordem.value; renderizar(); });
  el.carregar.addEventListener('click', () => {
    const primeiroNovo = limite;
    limite += porPagina;
    renderizar();
    grade.children[primeiroNovo]?.querySelector('a[href]:not([tabindex])')?.focus({ preventScroll: true });
  });

  el.chips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-remover]');
    if (!b) return;
    const chave = b.dataset.remover;
    const f = chave === 'tudo' ? novoFiltro() : { ...aplicado, regioes: [...aplicado.regioes] };
    if (chave === 'regioes') f.regioes = f.regioes.filter((r) => r !== b.dataset.valor);
    else if (chave === 'cidade') { f.cidade = ''; f.bairro = ''; }
    else if (chave !== 'tudo') f[chave] = novoFiltro()[chave];
    escreverFormulario(f);
    aplicar(f);
  });

  // Links como "Comprar", "Alugar" e categorias aplicam o filtro sem recarregar a página
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-filtro-link]');
    if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    const { filtros } = filtrosDaQuery(a.dataset.filtroLink);
    escreverFormulario(filtros);
    aplicar(filtros, { rolar: true });
  });

  // Estado inicial vindo da URL (?finalidade=venda, ?cidade=Osasco ...)
  const inicial = filtrosDaQuery(location.search);
  ordem = inicial.ordem;
  if ([...el.ordem.options].some((o) => o.value === ordem)) el.ordem.value = ordem;
  else ordem = 'relevancia';
  sincronizarSelects();
  escreverFormulario(inicial.filtros);
  if (location.search) aplicar(inicial.filtros, { rolar: location.hash === '#imoveis' });
}

/* ======================== GALERIA E LIGHTBOX ======================== */
function iniciarGaleria() {
  const g = $('[data-galeria]');
  if (!g) return;
  const quadros = $$('.galeria__quadro', g);
  const imgs = quadros.map((q) => $('.galeria__img img', q));
  const minis = $$('[data-galeria-ir]', g);
  const contador = $('[data-galeria-contador]', g);
  const dialog = $('[data-lightbox]', g);
  const lbImg = $('[data-lightbox-img]', g);
  const lbLegenda = $('[data-lightbox-legenda]', g);
  let atual = 0;

  function ir(n) {
    atual = (n + imgs.length) % imgs.length;
    quadros.forEach((q, i) => q.classList.toggle('is-ativa', i === atual));
    minis.forEach((m, i) => { m.classList.toggle('is-ativa', i === atual); m.setAttribute('aria-selected', String(i === atual)); });
    minis[atual]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduzirMovimento ? 'auto' : 'smooth' });
    contador.textContent = `${atual + 1} / ${imgs.length}`;
    if (dialog.open) {
      lbImg.src = imgs[atual].currentSrc || imgs[atual].src;
      lbImg.alt = imgs[atual].alt;
      lbLegenda.textContent = `${imgs[atual].alt} · ${atual + 1} de ${imgs.length}`;
    }
  }

  $('[data-galeria-ant]', g)?.addEventListener('click', () => ir(atual - 1));
  $('[data-galeria-prox]', g)?.addEventListener('click', () => ir(atual + 1));
  minis.forEach((m) => m.addEventListener('click', () => ir(+m.dataset.galeriaIr)));

  // abrir em tela cheia
  const abrir = () => { dialog.showModal(); ir(atual); document.body.classList.add('sem-rolagem'); };
  if (!imgs.length) return;
  $('[data-galeria-ampliar]', g).addEventListener('click', abrir);
  quadros.forEach((q) => q.addEventListener('click', abrir));
  dialog.addEventListener('close', () => document.body.classList.remove('sem-rolagem'));
  $('[data-lightbox-fechar]', g).addEventListener('click', () => dialog.close());
  $('[data-lightbox-ant]', g)?.addEventListener('click', () => ir(atual - 1));
  $('[data-lightbox-prox]', g)?.addEventListener('click', () => ir(atual + 1));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

  // teclado
  addEventListener('keydown', (e) => {
    const naGaleria = dialog.open || g.contains(document.activeElement);
    if (!naGaleria) return;
    if (e.key === 'ArrowLeft') ir(atual - 1);
    if (e.key === 'ArrowRight') ir(atual + 1);
  });

  // gesto de deslizar (celular)
  for (const area of [$('.galeria__palco', g), dialog]) {
    let x0 = null;
    area.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    area.addEventListener('touchend', (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) ir(atual + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }
}

/* ======================== ANIMAÇÕES DISCRETAS ======================== */
function iniciarRevelar() {
  if (reduzirMovimento || !('IntersectionObserver' in window)) return;
  const alvos = $$('.secao, .busca__painel, .imovel__conteudo, .contato__painel');
  const obs = new IntersectionObserver((entradas) => {
    for (const en of entradas) if (en.isIntersecting) { en.target.classList.add('is-visivel'); obs.unobserve(en.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  for (const a of alvos) {
    if (a.getBoundingClientRect().top < innerHeight) continue; // já visível: não anima
    a.classList.add('revelar');
    obs.observe(a);
  }
}

/* ======================== MENUS SUSPENSOS EM VIDRO ======================== */
// Melhora progressiva: em computadores, cada <select data-vidro-select> ganha uma lista
// em vidro (role="listbox") com teclado completo. O <select> nativo continua no
// formulário (é ele que guarda o valor). Em celulares fica o seletor nativo do sistema.
const selectsVidro = new Map();
function sincronizarSelects() {
  for (const [sel, api] of selectsVidro) api.atualizar(sel);
}
function iniciarSelectsVidro() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  for (const sel of $$('select[data-vidro-select]')) {
    const id = `${sel.id || 'sel'}-lista`;
    const caixa = document.createElement('div');
    caixa.className = 'vselect';
    sel.parentNode.insertBefore(caixa, sel);
    caixa.appendChild(sel);
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');
    caixa.insertAdjacentHTML('beforeend', `<button type="button" class="vselect__botao" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}"${sel.labels?.[0] ? ` aria-labelledby="${sel.labels[0].id || (sel.labels[0].id = `${sel.id}-rotulo`)} ${sel.id}-valor"` : ''}><span class="vselect__valor" id="${sel.id}-valor"></span>${icone('chevronBaixo')}</button><ul class="vselect__lista vidro vidro--forte" role="listbox" id="${id}" tabindex="-1" hidden></ul>`);
    const botao = $('.vselect__botao', caixa);
    const lista = $('.vselect__lista', caixa);
    const valor = $('.vselect__valor', caixa);
    let ativo = 0;
    let busca = '';
    let buscaTimer;
    const opcoesAtuais = () => [...sel.options];

    function montar() {
      const grupos = [];
      for (const filho of sel.children) {
        if (filho.tagName === 'OPTGROUP') grupos.push(`<li class="vselect__grupo" role="presentation">${esc(filho.label)}</li>`, ...[...filho.children].map((o) => item(o)));
        else grupos.push(item(filho));
      }
      lista.innerHTML = grupos.join('');
    }
    const item = (o) => `<li role="option" class="vselect__opcao" data-valor="${esc(o.value)}" aria-selected="${o.selected}" id="${id}-${o.index}">${esc(o.textContent)}${icone('check')}</li>`;
    function atualizar() {
      valor.textContent = sel.selectedOptions[0]?.textContent || '';
      caixa.classList.toggle('is-preenchido', !!sel.value);
    }
    function marcar(i) {
      const ops = $$('[role="option"]', lista);
      ativo = Math.max(0, Math.min(ops.length - 1, i));
      ops.forEach((o, n) => o.classList.toggle('is-ativo', n === ativo));
      lista.setAttribute('aria-activedescendant', ops[ativo]?.id || '');
      ops[ativo]?.scrollIntoView({ block: 'nearest' });
    }
    function abrir() {
      montar();
      lista.hidden = false;
      botao.setAttribute('aria-expanded', 'true');
      caixa.classList.add('is-aberto');
      marcar(Math.max(0, opcoesAtuais().findIndex((o) => o.selected)));
      lista.focus({ preventScroll: true });
    }
    function fechar(focar = true) {
      lista.hidden = true;
      botao.setAttribute('aria-expanded', 'false');
      caixa.classList.remove('is-aberto');
      if (focar) botao.focus({ preventScroll: true });
    }
    function escolher(i) {
      const op = opcoesAtuais()[i];
      if (!op) return;
      const mudou = sel.value !== op.value;
      sel.value = op.value;
      atualizar();
      fechar();
      if (mudou) {
        sel.dispatchEvent(new Event('input', { bubbles: true }));
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    botao.addEventListener('mousedown', (e) => { e.preventDefault(); lista.hidden ? abrir() : fechar(); });
    botao.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); abrir(); }
    });
    botao.addEventListener('click', (e) => { if (e.detail === 0) abrir(); }); // ativação por teclado/leitor de tela
    lista.addEventListener('mousedown', (e) => e.preventDefault());
    lista.addEventListener('click', (e) => {
      const o = e.target.closest('[role="option"]');
      if (o) escolher(opcoesAtuais().findIndex((x) => x.value === o.dataset.valor));
    });
    lista.addEventListener('mousemove', (e) => {
      const o = e.target.closest('[role="option"]');
      if (o) marcar($$('[role="option"]', lista).indexOf(o));
    });
    lista.addEventListener('keydown', (e) => {
      const total = opcoesAtuais().length;
      if (e.key === 'ArrowDown') { e.preventDefault(); marcar(ativo + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); marcar(ativo - 1); }
      else if (e.key === 'Home') { e.preventDefault(); marcar(0); }
      else if (e.key === 'End') { e.preventDefault(); marcar(total - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); escolher(ativo); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fechar(); }
      else if (e.key === 'Tab') fechar(false);
      else if (e.key.length === 1) {
        clearTimeout(buscaTimer);
        busca += e.key.toLowerCase();
        buscaTimer = setTimeout(() => (busca = ''), 600);
        const i = opcoesAtuais().findIndex((o) => o.textContent.toLowerCase().startsWith(busca));
        if (i >= 0) marcar(i);
      }
    });
    lista.addEventListener('blur', () => setTimeout(() => !caixa.contains(document.activeElement) && fechar(false), 0));
    sel.addEventListener('change', atualizar);
    selectsVidro.set(sel, { atualizar });
    atualizar();
  }
  document.addEventListener('mousedown', (e) => {
    for (const c of $$('.vselect.is-aberto')) if (!c.contains(e.target)) { $('.vselect__lista', c).hidden = true; c.classList.remove('is-aberto'); $('.vselect__botao', c).setAttribute('aria-expanded', 'false'); }
  });
}

/* ======================== VISUALIZAÇÃO RÁPIDA (janela em vidro) ======================== */
function iniciarVisualizacaoRapida() {
  const dialog = $('[data-rapida]');
  if (!dialog) return;
  let origem = null;
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-visualizar]');
    if (!b) return;
    const imovel = imoveis.find((i) => i.id === b.dataset.visualizar);
    if (!imovel) return;
    origem = b;
    const capa = capaDoImovel(imovel);
    dialog.innerHTML = `
      <button class="rapida__fechar icone-btn vidro" type="button" data-rapida-fechar aria-label="Fechar">${icone('fechar')}</button>
      <div class="rapida__grade">
        <div class="rapida__midia">${capa ? imagem(capa, { lazy: false, sizes: '(max-width: 760px) 100vw, 360px' }) : ''}${selos(imovel)}${seloFoto(capa)}</div>
        <div class="rapida__info">
          <p class="rapida__tipo">${esc(rotuloTipo(imovel.tipo))} · ${esc(imovel.condominio || imovel.bairro || imovel.cidade)}</p>
          <h2 id="rapida-titulo">${esc(imovel.titulo)}</h2>
          <p class="rapida__preco num${imovel.preco == null ? ' rapida__preco--consulta' : ''}">${esc(precoAnuncio(imovel))}</p>
          ${specsCurtas(imovel)}
          <p class="rapida__descricao">${esc((imovel.descricao || '').split('\n\n')[0])}</p>
          ${fichaTecnica(imovel)}
          <div class="rapida__acoes">
            <a class="btn btn--whats" href="${esc(linkWhatsAppImovel(imovel, imovel.preco == null ? 'valor' : 'info'))}" target="_blank" rel="noopener">${iconeWhatsApp()} ${imovel.preco == null ? 'Consultar valor' : 'Falar no WhatsApp'}</a>
            <a class="btn btn--vidro btn--seta" href="${urlPaginaImovel(imovel)}">Página completa <span class="btn__circulo">${icone('seta')}</span></a>
          </div>
        </div>
      </div>`;
    dialog.showModal();
    document.body.classList.add('sem-rolagem');
    $('[data-rapida-fechar]', dialog).focus();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-rapida-fechar]')) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('sem-rolagem');
    origem?.focus({ preventScroll: true });
  });
}

iniciarCabecalho();
iniciarSelectsVidro();
iniciarCatalogo();
iniciarVisualizacaoRapida();
iniciarGaleria();
iniciarRevelar();
