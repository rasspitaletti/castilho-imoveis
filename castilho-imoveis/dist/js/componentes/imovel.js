// Componentes de imóvel: imagem responsiva, card do catálogo, ficha técnica e selos.
import {
  esc, precoAnuncio, rotuloTipo, rotuloFinalidade, localizacaoTexto, formatarNumero, plural, areaPrincipal,
} from '../lib/formatar.js';
import { linkWhatsAppImovel } from '../lib/contato.js';
import { webp } from '../dados/manifesto-imagens.js';
import { fotosDoImovel, urlUnsplash } from '../lib/fotos.js';
import { icone, iconeWhatsApp } from './icones.js';

export const urlPaginaImovel = (imovel) => `/imoveis/${imovel.slug}/`;

/**
 * <picture> com WebP (480 e 800 px) e JPG de reserva.
 * As versões .webp são criadas por `npm run fotos`; o build registra quais existem.
 */
export function imagem(img, { alt = img?.alt ?? '', classe = '', sizes = '(max-width: 700px) 100vw, 33vw', lazy = true, prioridade = false, largura = 794, altura = 1410 } = {}) {
  if (!img?.src) return '';
  if (img.id) {
    // foto ilustrativa (Unsplash): o próprio serviço entrega o tamanho e o formato ideais
    const larguras = [480, 800, 1200, 1800, 2400];
    const est = img.foco ? ` style="object-position:${esc(img.foco)}"` : '';
    return `<picture class="${classe}"><img src="${esc(urlUnsplash(img.id, 1200))}" srcset="${larguras.map((w) => `${esc(urlUnsplash(img.id, w))} ${w}w`).join(', ')}" sizes="${sizes}" alt="${esc(alt)}" width="1200" height="800" ${prioridade ? 'fetchpriority="high"' : lazy ? 'loading="lazy"' : ''} decoding="async"${est}></picture>`;
  }
  const base = img.src.replace(/\.(jpe?g|png)$/i, '');
  const temWebp = webp[img.src];
  const estilo = img.foco ? ` style="object-position:${esc(img.foco)}"` : '';
  const carregamento = prioridade ? 'fetchpriority="high"' : lazy ? 'loading="lazy"' : '';
  return `<picture class="${classe}">
    ${temWebp ? `<source type="image/webp" srcset="${esc(base)}-480.webp 480w, ${esc(base)}.webp ${largura}w" sizes="${sizes}">` : ''}
    <img src="${esc(img.src)}" alt="${esc(alt)}" width="${largura}" height="${altura}" ${carregamento} decoding="async"${estilo}>
  </picture>`;
}

/** Selo discreto que identifica fotos ilustrativas (não são do imóvel). */
export const seloFoto = (img, classe = '') => (img?.ilustrativa ? `<span class="selo-foto ${classe}">Foto ilustrativa</span>` : '');

export function selos(imovel, { destaque = true } = {}) {
  return `<div class="selos">
    <span class="selo selo--${imovel.finalidade}">${rotuloFinalidade(imovel.finalidade)}</span>
    ${destaque && imovel.destaque ? '<span class="selo selo--destaque">Destaque</span>' : ''}
    ${imovel.demo ? '<span class="selo selo--demo" title="Imóvel fictício usado para demonstrar o site">Demonstração</span>' : ''}
  </div>`;
}

/** Lista curta de características (quartos, suítes, vagas, área) — omite o que não existe. */
export function specsCurtas(imovel) {
  const [area, rotuloArea] = areaPrincipal(imovel);
  const itens = [
    imovel.quartos ? [icone('cama'), plural(imovel.quartos, 'quarto', 'quartos')] : null,
    imovel.suites ? [icone('suite'), plural(imovel.suites, 'suíte', 'suítes')] : null,
    imovel.vagas ? [icone('carro'), plural(imovel.vagas, 'vaga', 'vagas')] : null,
    area ? [icone('area'), `${formatarNumero(area)} m² <small>${rotuloArea}</small>`] : null,
  ].filter(Boolean);
  if (!itens.length) return '<p class="specs specs--vazio">Detalhes com o corretor</p>';
  return `<ul class="specs">${itens.map(([i, t]) => `<li>${i}<span>${t}</span></li>`).join('')}</ul>`;
}

export function cardImovel(imovel, { lazy = true } = {}) {
  const fotos = fotosDoImovel(imovel);
  const capa = fotos[0];
  const url = urlPaginaImovel(imovel);
  const semPreco = imovel.preco == null;
  return `<article class="card${imovel.destaque ? ' card--destaque' : ''}" data-id="${esc(imovel.id)}">
  <a class="card__midia" href="${url}" tabindex="-1" aria-hidden="true">
    ${capa ? imagem(capa, { alt: '', lazy, sizes: '(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 30vw' }) : `<div class="card__sem-foto">${icone('casa')}<span>Fotos em breve</span></div>`}
    ${selos(imovel)}
    <span class="card__tipo vidro">${esc(rotuloTipo(imovel.tipo))}</span>
    ${fotos.length > 1 ? `<span class="card__fotos vidro">${icone('expandir')}${fotos.length}</span>` : ''}
    ${capa?.ilustrativa ? '<span class="selo-foto">Foto ilustrativa</span>' : ''}
  </a>
  <div class="card__corpo">
    <p class="card__preco${semPreco ? ' card__preco--consulta' : ''}">${esc(precoAnuncio(imovel))}</p>
    <h3 class="card__titulo"><a href="${url}">${esc(imovel.titulo)}</a></h3>
    <p class="card__local">${icone('pin')}${esc(localizacaoTexto(imovel))}</p>
    ${specsCurtas(imovel)}
    <div class="card__acoes">
      <a class="btn btn--vidro btn--seta btn--pequeno" href="${url}">Ver detalhes <span class="btn__circulo">${icone('seta')}</span></a>
      <button class="icone-btn card__rapida" type="button" data-visualizar="${esc(imovel.id)}" aria-label="Visualização rápida: ${esc(imovel.titulo)}" aria-haspopup="dialog">${icone('olho')}</button>
      <a class="btn btn--whats btn--pequeno card__whats" href="${esc(linkWhatsAppImovel(imovel))}" target="_blank" rel="noopener" aria-label="Consultar pelo WhatsApp: ${esc(imovel.titulo)}">${iconeWhatsApp()}<span>Consultar pelo WhatsApp</span></a>
    </div>
  </div>
</article>`;
}

/** Ficha técnica completa para a página do imóvel e para a visualização rápida. */
export function fichaTecnica(imovel) {
  const m2 = (v) => (v ? `${formatarNumero(v)} m²` : null);
  const linhas = [
    ['Tipo', rotuloTipo(imovel.tipo)],
    ['Finalidade', rotuloFinalidade(imovel.finalidade)],
    ['Condomínio', imovel.condominio],
    ['Área útil', m2(imovel.areaUtil)],
    ['Área privativa', m2(imovel.areaPrivativa)],
    ['Área construída', m2(imovel.areaConstruida)],
    [imovel.tipo === 'chacara' || imovel.tipo === 'terreno' || imovel.areaConstruida ? 'Terreno' : 'Área total', m2(imovel.areaTotal)],
    ['Quartos', imovel.quartos || null],
    ['Suítes', imovel.suites || null],
    ['Banheiros', imovel.banheiros || null],
    ['Vagas', imovel.vagas || null],
    ['Código', imovel.id],
  ].filter(([, v]) => v != null && v !== '');
  return `<dl class="ficha">${linhas.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
}
