// Estrutura comum: <head>, cabeçalho, rodapé e botões flutuantes.
import { site } from '../dados/site.js';
import { imoveis } from '../dados/imoveis.js';
import { usaIlustrativas } from '../lib/fotos.js';
import { esc } from '../lib/formatar.js';
import { linkWhatsApp, linkTelefone, linkInstagram, linkEmail } from '../lib/contato.js';
import { icone, iconeWhatsApp, iconeInstagram, logoMarca } from './icones.js';

// "Alugar" só aparece quando houver imóveis para alugar no catálogo.
const temAluguel = imoveis.some((i) => i.finalidade === 'aluguel');
export const NAV = [
  { rotulo: 'Início', href: '/', id: 'inicio' },
  { rotulo: 'Comprar', href: '/?finalidade=venda#imoveis', id: 'comprar', filtro: 'finalidade=venda' },
  temAluguel ? { rotulo: 'Alugar', href: '/?finalidade=aluguel#imoveis', id: 'alugar', filtro: 'finalidade=aluguel' } : null,
  { rotulo: 'Encontrar imóveis', href: '/#buscar', id: 'buscar' },
  { rotulo: 'Sobre', href: '/#sobre', id: 'sobre' },
  { rotulo: 'Contato', href: '/#contato', id: 'contato' },
].filter(Boolean);

export function logo(classe = '') {
  return `<a class="logo ${classe}" href="/" aria-label="${esc(site.nome)} — página inicial">
    ${logoMarca()}
    <span class="logo__texto"><strong>${esc(site.nomeCurto)}</strong><small>${esc(site.slogan)}</small></span>
  </a>`;
}

/**
 * Documento HTML completo.
 * @param {object} o  { titulo, descricao, caminho, conteudo, pagina, imagem, jsonld, noindex, navAtivo }
 */
export function documento(o) {
  const tituloCompleto = o.titulo ? `${o.titulo} | ${site.nome}` : `${site.nome} — Imóveis à venda e para alugar`;
  const canonical = site.url ? `${site.url.replace(/\/$/, '')}${o.caminho || '/'}` : null;
  const imagemAbs = site.url && o.imagem ? `${site.url.replace(/\/$/, '')}${o.imagem}` : null;
  const jsonld = (o.jsonld || []).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(tituloCompleto)}</title>
<meta name="description" content="${esc(o.descricao)}">
${o.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow">'}
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
<meta name="theme-color" content="#0f1012">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="${o.ogTipo || 'website'}">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${esc(site.nome)}">
<meta property="og:title" content="${esc(tituloCompleto)}">
<meta property="og:description" content="${esc(o.descricao)}">
${canonical ? `<meta property="og:url" content="${esc(canonical)}">` : ''}
${imagemAbs ? `<meta property="og:image" content="${esc(imagemAbs)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@300;400;500;600;700;800&display=swap">
<link rel="stylesheet" href="/css/estilo.css">
${o.preloadImagem ? `<link rel="preload" as="image" href="${esc(o.preloadImagem)}">` : ''}
${jsonld}
<script type="module" src="/js/cliente/app.js"></script>
</head>
<body data-pagina="${esc(o.pagina || '')}">
<div class="fundo" aria-hidden="true"></div>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
${cabecalho(o.navAtivo)}
<main id="conteudo">
${o.conteudo}
</main>
${rodape()}
${botoesFlutuantes()}
</body>
</html>
`;
}

export function cabecalho(ativo = 'inicio') {
  const links = NAV.map(
    (n) =>
      `<li><a class="nav__link${n.id === ativo ? ' is-ativo' : ''}" href="${n.href}"${n.filtro ? ` data-filtro-link="${n.filtro}"` : ''}${n.id === ativo ? ' aria-current="page"' : ''}>${n.rotulo}</a></li>`
  ).join('');
  return `<header class="cabecalho" data-cabecalho>
  <div class="cabecalho__barra container">
    ${logo()}
    <nav class="nav" id="menu-principal" aria-label="Navegação principal" data-menu>
      <ul class="nav__lista">${links}</ul>
      <div class="nav__mobile-contato">
        <a class="btn btn--claro" href="${linkWhatsApp()}" target="_blank" rel="noopener">${iconeWhatsApp()} Falar no WhatsApp</a>
        <a class="btn btn--contorno" href="${linkTelefone()}">${icone('telefone')} ${esc(site.contato.telefoneExibicao)}</a>
      </div>
    </nav>
    <div class="cabecalho__acoes">
      <a class="btn btn--claro btn--seta cabecalho__whats" href="${linkWhatsApp()}" target="_blank" rel="noopener">
        <span>Fale no WhatsApp</span><span class="btn__circulo">${iconeWhatsApp()}</span>
      </a>
      <a class="icone-btn" href="${linkTelefone()}" aria-label="Ligar para ${esc(site.contato.telefoneExibicao)}">${icone('telefone')}</a>
      <a class="icone-btn" href="${linkInstagram()}" target="_blank" rel="noopener" aria-label="Instagram @${esc(site.contato.instagramUsuario)}">${iconeInstagram()}</a>
      <button class="icone-btn cabecalho__menu" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu-principal" data-menu-botao>${icone('menu')}</button>
    </div>
  </div>
</header>`;
}

export function rodape() {
  const c = site.contato;
  const email = linkEmail();
  const ano = new Date().getFullYear();
  const navLinks = NAV.map((n) => `<li><a href="${n.href}"${n.filtro ? ` data-filtro-link="${n.filtro}"` : ''}>${n.rotulo}</a></li>`).join('');
  return `<footer class="rodape vidro">
  <div class="container rodape__grade">
    <div class="rodape__marca">
      ${logo('logo--rodape')}
      <p>${esc(site.corretor.especialidade || 'Catálogo de imóveis')}, com atendimento direto com o corretor.</p>
      ${site.corretor.formacao ? `<p>${esc(site.corretor.formacao)}.</p>` : ''}
      ${site.corretor.creci ? `<p class="rodape__creci">${esc(site.corretor.creci)}</p>` : ''}
    </div>
    <div>
      <h2 class="rodape__titulo">Navegação</h2>
      <ul class="rodape__lista">${navLinks}</ul>
    </div>
    <div>
      <h2 class="rodape__titulo">Contato</h2>
      <ul class="rodape__lista rodape__lista--contato">
        <li><a href="${linkTelefone()}">${icone('telefone')} ${esc(c.telefoneExibicao)}</a></li>
        <li><a href="${linkWhatsApp()}" target="_blank" rel="noopener">${iconeWhatsApp()} WhatsApp</a></li>
        <li><a href="${linkInstagram()}" target="_blank" rel="noopener">${iconeInstagram()} @${esc(c.instagramUsuario)}</a></li>
        ${email ? `<li><a href="${email}">${icone('email')} ${esc(c.email)}</a></li>` : ''}
        ${c.regiaoAtendimento ? `<li><span>${icone('pin')} ${esc(c.regiaoAtendimento)}</span></li>` : ''}
        ${c.horario ? `<li><span>${icone('relogio')} ${esc(c.horario)}</span></li>` : ''}
      </ul>
    </div>
  </div>
  <div class="container rodape__base">
    <p>© ${ano} ${esc(site.nome)}. Todos os direitos reservados.</p>
    <a href="/privacidade/">Política de privacidade</a>
    ${usaIlustrativas() ? '<p class="rodape__credito">Fotos ilustrativas: <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></p>' : ''}
    <div class="rodape__sociais">
      <a class="icone-btn" href="${linkInstagram()}" target="_blank" rel="noopener" aria-label="Instagram">${iconeInstagram()}</a>
      <a class="icone-btn" href="${linkWhatsApp()}" target="_blank" rel="noopener" aria-label="WhatsApp">${iconeWhatsApp()}</a>
      <a class="icone-btn" href="${linkTelefone()}" aria-label="Telefone">${icone('telefone')}</a>
    </div>
  </div>
</footer>`;
}

export function botoesFlutuantes() {
  return `<div class="flutuantes" data-flutuantes>
  <a class="flutuantes__insta vidro vidro--forte" href="${linkInstagram()}" target="_blank" rel="noopener" aria-label="Abrir o Instagram @${esc(site.contato.instagramUsuario)}">${iconeInstagram()}</a>
  <a class="flutuantes__whats" href="${linkWhatsApp()}" target="_blank" rel="noopener" aria-label="Conversar pelo WhatsApp" data-whats-flutuante>
    ${iconeWhatsApp()}<span class="flutuantes__dica">Fale com o corretor</span>
  </a>
</div>`;
}
