// Página individual do imóvel: galeria, detalhes, mapa e contato.
import { site } from '../dados/site.js';
import {
  esc, precoAnuncio, formatarPreco, rotuloTipo, rotuloFinalidade, localizacaoTexto, formatarNumero, plural, formatarData,
} from '../lib/formatar.js';
import { linkWhatsAppImovel, linkTelefone, linkInstagram, urlMapaEmbed, urlMapaExterno } from '../lib/contato.js';
import { icone, iconeWhatsApp, iconeInstagram } from './icones.js';
import { cardImovel, selos, fichaTecnica, urlPaginaImovel, imagem } from './imovel.js';
import { fotosDoImovel } from '../lib/fotos.js';

export function galeria(imovel) {
  const imgs = fotosDoImovel(imovel);
  if (!imgs.length) {
    return `<section class="galeria galeria--vazia vidro" aria-label="Galeria de fotos">${icone('casa')}<p>Fotos em breve.<br><small>Peça fotos e vídeos ao corretor pelo WhatsApp.</small></p></section>`;
  }
  return `<section class="galeria" data-galeria aria-label="Galeria de fotos">
  <div class="galeria__palco">
    ${imgs.map((img, n) => `<figure class="galeria__quadro${n === 0 ? ' is-ativa' : ''}${img.ilustrativa ? ' galeria__quadro--cobrir' : ''}" data-indice="${n}">
      ${imagem(img, { classe: 'galeria__fundo', alt: '', lazy: n > 0, sizes: '40vw' })}
      ${imagem({ ...img, foco: null }, { classe: 'galeria__img', lazy: n > 0, prioridade: n === 0, sizes: '(max-width: 1000px) 100vw, 45vw' })}
      ${img.ilustrativa ? '<figcaption class="galeria__origem vidro">Foto ilustrativa</figcaption>' : img.real && imgs.some((x) => x.ilustrativa) ? '<figcaption class="galeria__origem galeria__origem--real vidro">Foto real do anúncio · Instagram</figcaption>' : ''}
    </figure>`).join('')}
    ${imgs.length > 1 ? `<button class="galeria__nav galeria__nav--ant vidro" type="button" aria-label="Foto anterior" data-galeria-ant>${icone('chevronEsq')}</button>
    <button class="galeria__nav galeria__nav--prox vidro" type="button" aria-label="Próxima foto" data-galeria-prox>${icone('chevronDir')}</button>` : ''}
    <span class="galeria__contador vidro num" data-galeria-contador>1 / ${imgs.length}</span>
    <button class="galeria__ampliar vidro" type="button" data-galeria-ampliar aria-label="Ver fotos em tela cheia">${icone('expandir')} <span>Tela cheia</span></button>
  </div>
  ${imgs.length > 1 ? `<div class="galeria__miniaturas" role="tablist" aria-label="Miniaturas">
    ${imgs.map((img, n) => `<button class="galeria__mini${n === 0 ? ' is-ativa' : ''}" type="button" role="tab" aria-selected="${n === 0}" aria-label="Foto ${n + 1}: ${esc(img.alt || '')}" data-galeria-ir="${n}">${imagem(img, { alt: '', sizes: '120px' })}</button>`).join('')}
  </div>` : ''}
  <dialog class="lightbox" data-lightbox aria-label="Fotos em tela cheia">
    <button class="lightbox__fechar icone-btn vidro" type="button" data-lightbox-fechar aria-label="Fechar">${icone('fechar')}</button>
    <img class="lightbox__img" data-lightbox-img src="${esc(imgs[0].src)}" alt="">
    ${imgs.length > 1 ? `<button class="lightbox__nav lightbox__nav--ant icone-btn vidro" type="button" data-lightbox-ant aria-label="Foto anterior">${icone('chevronEsq')}</button>
    <button class="lightbox__nav lightbox__nav--prox icone-btn vidro" type="button" data-lightbox-prox aria-label="Próxima foto">${icone('chevronDir')}</button>` : ''}
    <p class="lightbox__legenda vidro" data-lightbox-legenda></p>
  </dialog>
  ${imgs.some((x) => x.ilustrativa) ? `<p class="galeria__aviso">${icone('info')}<span>As primeiras fotos são <strong>ilustrativas</strong> (temporárias, não são deste imóvel). As fotos reais do anúncio estão no fim da galeria e no vídeo do Instagram.</span></p>` : ''}
</section>`;
}

function lista(titulo, itens) {
  if (!itens?.length) return '';
  return `<div class="caracteristicas__grupo"><h3>${titulo}</h3><ul>${itens.map((t) => `<li>${icone('check')}${esc(t)}</li>`).join('')}</ul></div>`;
}

export function resumo(imovel) {
  const m2 = imovel.areaUtil ?? imovel.areaPrivativa ?? imovel.areaConstruida;
  const rotuloM2 = imovel.areaUtil ? 'área útil' : imovel.areaPrivativa ? 'privativos' : 'construídos';
  const itens = [
    m2 ? ['area', `${formatarNumero(m2)} m²`, rotuloM2] : null,
    imovel.areaTotal && imovel.areaTotal !== m2 ? ['terreno', `${formatarNumero(imovel.areaTotal)} m²`, 'de terreno'] : null,
    imovel.quartos ? ['cama', imovel.quartos, imovel.quartos === 1 ? 'quarto' : 'quartos'] : null,
    imovel.suites ? ['suite', imovel.suites, imovel.suites === 1 ? 'suíte' : 'suítes'] : null,
    imovel.banheiros ? ['banho', imovel.banheiros, imovel.banheiros === 1 ? 'banheiro' : 'banheiros'] : null,
    imovel.vagas ? ['carro', imovel.vagas, imovel.vagas === 1 ? 'vaga' : 'vagas'] : null,
  ].filter(Boolean);
  if (!itens.length) return '';
  return `<ul class="resumo">${itens.map(([i, v, r]) => `<li class="vidro">${icone(i)}<strong class="num">${esc(v)}</strong><span>${r}</span></li>`).join('')}</ul>`;
}

export function mapa(imovel) {
  const src = urlMapaEmbed(imovel);
  if (!src) return '';
  const precisao = imovel.mapa?.precisao;
  const exato = precisao === 'endereco' && imovel.endereco;
  const area = precisao === 'cidade' ? imovel.cidade : localizacaoTexto(imovel);
  return `<section class="bloco" aria-labelledby="mapa-titulo">
  <h2 id="mapa-titulo">Localização</h2>
  ${imovel.localizacao ? `<p>${esc(imovel.localizacao)}</p>` : ''}
  <div class="mapa vidro">
    <iframe src="${esc(src)}" title="Mapa: ${esc(exato ? imovel.endereco : area)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
  </div>
  <p class="mapa__nota">${icone('info')}<span>${
    exato
      ? `Endereço: ${esc(imovel.endereco)}.`
      : `Localização aproximada — o mapa mostra ${precisao === 'cidade' ? 'a cidade de' : 'a região de'} <strong>${esc(area)}</strong>, não o endereço do imóvel. O corretor informa o endereço ao agendar a visita.`
  } <a href="${esc(urlMapaExterno(imovel))}" target="_blank" rel="noopener">Abrir no Google Maps</a></span></p>
</section>`;
}

function cartaoContato(imovel) {
  const semPreco = imovel.preco == null;
  return `<div class="cartao-contato vidro vidro--forte">
    <p class="cartao-contato__rotulo">${rotuloFinalidade(imovel.finalidade)}</p>
    <p class="cartao-contato__preco num${semPreco ? ' cartao-contato__preco--consulta' : ''}">${esc(precoAnuncio(imovel))}</p>
    ${semPreco ? '<p class="cartao-contato__nota">O corretor informa o valor e as condições pelo WhatsApp.</p>' : ''}
    ${imovel.condominioValor || imovel.iptu ? `<dl class="cartao-contato__taxas">
      ${imovel.condominioValor ? `<div><dt>Condomínio</dt><dd class="num">${formatarPreco(imovel.condominioValor)}/mês</dd></div>` : ''}
      ${imovel.iptu ? `<div><dt>IPTU</dt><dd class="num">${formatarPreco(imovel.iptu)}/mês</dd></div>` : ''}
    </dl>` : ''}
    <a class="btn btn--whats btn--bloco" href="${esc(linkWhatsAppImovel(imovel, 'visita'))}" target="_blank" rel="noopener">${iconeWhatsApp()} Agendar uma visita</a>
    <a class="btn btn--vidro btn--bloco" href="${esc(linkWhatsAppImovel(imovel, semPreco ? 'valor' : 'info'))}" target="_blank" rel="noopener">${icone('conversa')} ${semPreco ? 'Consultar valor' : 'Pedir mais informações'}</a>
    <div class="cartao-contato__extra">
      <a href="${linkTelefone()}">${icone('telefone')} <span class="num">${esc(site.contato.telefoneExibicao)}</span></a>
      <a href="${linkInstagram()}" target="_blank" rel="noopener">${iconeInstagram()} Instagram</a>
    </div>
    <p class="cartao-contato__codigo">Código do imóvel: <strong>${esc(imovel.id)}</strong></p>
  </div>`;
}

function videos(imovel) {
  const posts = imovel.fonte?.posts || [];
  if (!posts.length) return '';
  return `<section class="bloco" aria-labelledby="videos-titulo">
    <h2 id="videos-titulo">Tour em vídeo</h2>
    <p>Veja ${posts.length > 1 ? 'os vídeos' : 'o vídeo'} deste imóvel no Instagram${imovel.dataPublicacao ? ` (publicado em ${esc(formatarData(imovel.dataPublicacao))})` : ''}.</p>
    <ul class="videos">
      ${posts.map((u, n) => `<li><a class="btn btn--vidro" href="${esc(u)}" target="_blank" rel="noopener">${icone('instagramPost')} Assistir ${posts.length > 1 ? `vídeo ${n + 1}` : 'ao vídeo'} no Instagram</a></li>`).join('')}
    </ul>
  </section>`;
}

export function paginaImovel(imovel, todos) {
  const paragrafos = (imovel.descricao || '').split(/\n\n+/).filter(Boolean);
  const relacionados = todos
    .filter((i) => i.id !== imovel.id)
    .map((i) => ({ i, p: (i.tipo === imovel.tipo ? 2 : 0) + (i.bairro && i.bairro === imovel.bairro ? 1 : 0) + (i.preco != null ? 0.5 : 0) }))
    .sort((a, b) => b.p - a.p)
    .slice(0, 3)
    .map((x) => x.i);

  return `<article class="imovel container" data-imovel="${esc(imovel.id)}">
  <nav class="trilha" aria-label="Você está em">
    <ol>
      <li><a href="/">Início</a></li>
      <li><a href="/#imoveis">Imóveis</a></li>
      <li><a href="/?tipo=${encodeURIComponent(imovel.tipo)}#imoveis">${esc(rotuloTipo(imovel.tipo))}</a></li>
      <li aria-current="page">${esc(imovel.titulo)}</li>
    </ol>
  </nav>

  ${imovel.demo ? `<p class="aviso-demo">${icone('info')}<span><strong>Imóvel de demonstração.</strong> Dados, valores e imagens são fictícios.</span></p>` : ''}

  <div class="imovel__topo">
    ${galeria(imovel)}
    <div class="imovel__info">
      <header class="imovel__cabeca">
        ${selos(imovel)}
        <h1>${esc(imovel.titulo)}</h1>
        <p class="imovel__local">${icone('pin')} ${esc(localizacaoTexto(imovel))}</p>
      </header>
      ${resumo(imovel)}
      ${cartaoContato(imovel)}
    </div>
  </div>

  <div class="imovel__conteudo">
    <section class="bloco" aria-labelledby="descricao-titulo">
      <h2 id="descricao-titulo">Sobre o imóvel</h2>
      ${paragrafos.map((p) => `<p>${esc(p)}</p>`).join('')}
    </section>

    <section class="bloco" aria-labelledby="ficha-titulo">
      <h2 id="ficha-titulo">Ficha técnica</h2>
      ${fichaTecnica(imovel)}
    </section>

    ${imovel.caracteristicasInternas?.length || imovel.caracteristicasExternas?.length || imovel.diferenciais?.length ? `<section class="bloco" aria-labelledby="carac-titulo">
      <h2 id="carac-titulo">Características</h2>
      <div class="caracteristicas">
        ${lista('Internas', imovel.caracteristicasInternas)}
        ${lista('Externas e lazer', imovel.caracteristicasExternas)}
        ${lista('Diferenciais', imovel.diferenciais)}
      </div>
    </section>` : ''}

    ${imovel.infraestrutura ? `<section class="bloco" aria-labelledby="infra-titulo"><h2 id="infra-titulo">Condomínio e infraestrutura</h2><p>${esc(imovel.infraestrutura)}</p></section>` : ''}

    ${videos(imovel)}

    ${mapa(imovel)}

    <section class="bloco bloco--cta vidro">
      <h2>Gostou deste imóvel?</h2>
      <p>Peça mais fotos e vídeos, tire dúvidas sobre valores, financiamento e documentação ou agende uma visita com o corretor.</p>
      <a class="btn btn--whats" href="${esc(linkWhatsAppImovel(imovel, 'visita'))}" target="_blank" rel="noopener">${iconeWhatsApp()} Quero agendar uma visita</a>
    </section>
  </div>

  ${relacionados.length ? `<section class="secao relacionados" aria-labelledby="rel-titulo">
    <div class="secao__cabeca"><div><p class="rotulo">Continue explorando</p><h2 id="rel-titulo">Outros imóveis</h2></div>
    <a class="btn btn--vidro btn--seta btn--pequeno" href="/#imoveis">Ver catálogo <span class="btn__circulo">${icone('seta')}</span></a></div>
    <div class="grade">${relacionados.map((i) => cardImovel(i)).join('')}</div>
  </section>` : ''}

  <div class="barra-fixa vidro vidro--forte" data-barra-fixa>
    <div><small>${rotuloFinalidade(imovel.finalidade)}</small><strong class="num">${esc(precoAnuncio(imovel))}</strong></div>
    <a class="btn btn--whats" href="${esc(linkWhatsAppImovel(imovel, 'info'))}" target="_blank" rel="noopener">${iconeWhatsApp()} WhatsApp</a>
  </div>
  <dialog class="rapida vidro vidro--forte" data-rapida aria-labelledby="rapida-titulo"></dialog>
</article>`;
}

/** Dados estruturados (schema.org) — só para imóveis reais. */
export function jsonLdImovel(imovel) {
  if (imovel.demo) return [];
  const base = site.url ? site.url.replace(/\/$/, '') : '';
  const area = imovel.areaUtil ?? imovel.areaPrivativa ?? imovel.areaConstruida;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: imovel.titulo,
      description: imovel.descricao,
      url: base ? `${base}${urlPaginaImovel(imovel)}` : undefined,
      image: (imovel.imagens || []).map((i) => (base ? base + i.src : i.src)), // só fotos reais
      datePosted: imovel.dataPublicacao || undefined,
      offers: imovel.preco != null ? { '@type': 'Offer', price: imovel.preco, priceCurrency: 'BRL' } : undefined,
      about: {
        '@type': imovel.tipo === 'apartamento' ? 'Apartment' : imovel.tipo === 'terreno' ? 'Place' : 'House',
        address: { '@type': 'PostalAddress', addressLocality: imovel.cidade, addressRegion: 'SP', addressCountry: 'BR' },
        numberOfRooms: imovel.quartos || undefined,
        floorSize: area ? { '@type': 'QuantitativeValue', value: area, unitCode: 'MTK' } : undefined,
      },
    },
  ];
}

export const descricaoMeta = (imovel) => {
  const finalidade = imovel.finalidade === 'aluguel' ? 'para alugar' : 'à venda';
  const preco = imovel.preco != null ? ` por ${precoAnuncio(imovel)}` : '';
  const extras = [
    imovel.quartos ? plural(imovel.quartos, 'quarto', 'quartos') : null,
    imovel.suites ? plural(imovel.suites, 'suíte', 'suítes') : null,
    imovel.areaTotal ? `${formatarNumero(imovel.areaTotal)} m² de terreno` : null,
  ].filter(Boolean);
  return `${rotuloTipo(imovel.tipo)} ${finalidade} em ${localizacaoTexto(imovel)}${preco}${extras.length ? ` · ${extras.join(', ')}` : ''}. Fale com o Corretor Castilho pelo WhatsApp.`;
};
