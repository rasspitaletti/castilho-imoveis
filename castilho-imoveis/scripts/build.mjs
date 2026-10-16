// Gera o site estático em /dist:
//  - páginas HTML pré-renderizadas (boas para SEO)
//  - uma página por imóvel em /imoveis/<slug>/
//  - sitemap.xml, robots.txt, 404
//  - copia CSS, JS (módulos compartilhados com o navegador) e imagens
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(raiz, 'dist');

// importa sempre a versão mais recente dos arquivos (útil no modo dev)
const v = `?v=${Date.now()}`;
const { site } = await import(`../src/dados/site.js${v}`);
const { imoveis } = await import(`../src/dados/imoveis.js${v}`);

// ---------- manifesto das fotos com versão .webp (gerada por `npm run fotos`) ----------
{
  const fotos = new Set([site.heroImagem, site.corretor.foto, ...imoveis.flatMap((i) => (i.imagens || []).map((img) => img.src))].filter((f) => f && f.startsWith('/')));
  const comWebp = {};
  for (const src of fotos) {
    const base = src.replace(/\.(jpe?g|png)$/i, '');
    if (base !== src && existsSync(join(raiz, 'public', `${base}.webp`)) && existsSync(join(raiz, 'public', `${base}-480.webp`))) comWebp[src] = true;
  }
  const arquivo = join(raiz, 'src', 'dados', 'manifesto-imagens.js');
  const conteudo = `// Gerado automaticamente pelo build (npm run build). Não edite.\n// Lista as fotos que têm versões .webp otimizadas (criadas por npm run fotos).\nexport const webp = ${JSON.stringify(comWebp, null, 2)};\n`;
  if (!existsSync(arquivo) || readFileSync(arquivo, 'utf8') !== conteudo) writeFileSync(arquivo, conteudo);
  const semWebp = [...fotos].filter((f) => !comWebp[f] && /\.(jpe?g|png)$/i.test(f));
  if (semWebp.length) console.warn(`⚠ ${semWebp.length} foto(s) sem versão .webp — rode \`npm run fotos\` para otimizar.`);
}
const { documento } = await import(`../src/componentes/layout.js${v}`);
const S = await import(`../src/componentes/secoes.js${v}`);
const D = await import(`../src/componentes/detalhes.js${v}`);
const { esc } = await import(`../src/lib/formatar.js${v}`);

// ---------- validação dos dados ----------
const erros = [];
const ids = new Set();
const slugs = new Set();
for (const i of imoveis) {
  if (ids.has(i.id)) erros.push(`id duplicado: ${i.id}`);
  if (slugs.has(i.slug)) erros.push(`slug duplicado: ${i.slug}`);
  ids.add(i.id);
  slugs.add(i.slug);
  if (!/^[a-z0-9-]+$/.test(i.slug)) erros.push(`slug inválido (use minúsculas, números e hífens): ${i.slug}`);
  if (!['venda', 'aluguel'].includes(i.finalidade)) erros.push(`${i.id}: finalidade deve ser 'venda' ou 'aluguel'`);
  if (!i.cidade) erros.push(`${i.id}: cidade obrigatória (alimenta os filtros)`);
  for (const img of i.imagens || []) {
    if (!existsSync(join(raiz, 'public', img.src))) erros.push(`${i.id}: imagem não encontrada em public${img.src}`);
    if (!img.alt) erros.push(`${i.id}: descreva a foto em "alt" (${img.src})`);
  }
  if (i.preco != null && (typeof i.preco !== 'number' || i.preco <= 0)) erros.push(`${i.id}: preço deve ser número positivo ou null (sob consulta)`);
  if (i.dataPublicacao && Number.isNaN(Date.parse(i.dataPublicacao))) erros.push(`${i.id}: dataPublicacao inválida (use AAAA-MM-DD)`);
}
if (erros.length) {
  console.error('✖ Corrija os dados dos imóveis:\n  - ' + erros.join('\n  - '));
  process.exit(1);
}

// ---------- preparação ----------
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
// copia public/ (ignora as ilustrações da primeira versão, se ainda existirem)
cpSync(join(raiz, 'public'), dist, { recursive: true, filter: (origem) => !/[\\/]imagens[\\/]demo([\\/]|$)/.test(origem) });
cpSync(join(raiz, 'src', 'estilos'), join(dist, 'css'), { recursive: true });
for (const pasta of ['dados', 'lib', 'componentes', 'cliente']) cpSync(join(raiz, 'src', pasta), join(dist, 'js', pasta), { recursive: true });

const escrever = (caminho, html) => {
  const arquivo = join(dist, caminho);
  mkdirSync(dirname(arquivo), { recursive: true });
  writeFileSync(arquivo, html);
};

const orgJsonLd = {
  // Dados públicos do perfil do corretor
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: site.nome,
  telephone: site.contato.telefoneE164,
  sameAs: [site.contato.instagramUrl],
  url: site.url || undefined,
  email: site.contato.email || undefined,
  areaServed: site.contato.regiaoAtendimento || undefined,
};

// ---------- página inicial ----------
escrever(
  'index.html',
  documento({
    titulo: null,
    descricao: `Casas, sobrados e chácaras à venda em Araçariguama-SP com o Corretor Castilho. Busque por bairro, condomínio e faixa de preço e fale com o corretor pelo WhatsApp.`,
    caminho: '/',
    pagina: 'inicio',
    navAtivo: 'inicio',
    imagem: site.heroImagem,
    jsonld: [orgJsonLd],
    conteudo: `${S.hero(imoveis)}
<div class="container pilha">
${S.buscaFiltros(imoveis)}
${S.destaques(imoveis)}
${S.categorias(imoveis)}
${S.catalogo(imoveis)}
${S.secaoOportunidades()}
${S.imovelEmDestaque(imoveis)}
${S.sobre(imoveis)}
${S.comoFunciona()}
</div>
${S.contato(imoveis)}`,
  })
);

// ---------- páginas dos imóveis ----------
for (const imovel of imoveis) {
  escrever(
    `imoveis/${imovel.slug}/index.html`,
    documento({
      titulo: imovel.titulo,
      descricao: D.descricaoMeta(imovel),
      caminho: `/imoveis/${imovel.slug}/`,
      pagina: 'imovel',
      navAtivo: imovel.finalidade === 'aluguel' ? 'alugar' : 'comprar',
      imagem: imovel.imagens[0]?.src,
      ogTipo: 'article',
      noindex: imovel.demo, // imóveis de demonstração não devem aparecer no Google
      jsonld: D.jsonLdImovel(imovel),
      conteudo: D.paginaImovel(imovel, imoveis),
    })
  );
}

// ---------- privacidade ----------
escrever(
  'privacidade/index.html',
  documento({
    titulo: 'Política de privacidade',
    descricao: `Como o site da ${site.nome} trata dados pessoais.`,
    caminho: '/privacidade/',
    pagina: 'texto',
    navAtivo: '',
    conteudo: `<article class="container texto-longo">
  <p class="rotulo">Institucional</p>
  <h1>Política de privacidade</h1>
  <p>Este site apresenta o catálogo de imóveis da ${esc(site.nome)}. Ele não possui formulários de cadastro e não armazena dados pessoais dos visitantes.</p>
  <h2>Contato pelo WhatsApp, telefone e Instagram</h2>
  <p>Ao clicar nos botões de contato, você é direcionado ao WhatsApp, ao discador do seu aparelho ou ao Instagram. As informações que você enviar por esses canais são tratadas pelo corretor apenas para responder ao seu atendimento, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), e também estão sujeitas às políticas dessas plataformas.</p>
  <h2>Serviços de terceiros</h2>
  <p>As páginas utilizam mapas do Google Maps e fontes do Google Fonts. Esses serviços podem registrar dados técnicos de acesso, como endereço IP e navegador, de acordo com as políticas do Google.</p>
  <h2>Cookies</h2>
  <p>O site não utiliza cookies de rastreamento nem ferramentas de publicidade.</p>
  <h2>Seus direitos</h2>
  <p>Para solicitar informações, correção ou exclusão de dados compartilhados no atendimento, fale com o corretor pelos canais de contato desta página.</p>
</article>`,
  })
);

// ---------- 404 ----------
escrever(
  '404.html',
  documento({
    titulo: 'Página não encontrada',
    descricao: 'A página procurada não existe ou o imóvel não está mais disponível.',
    caminho: '/404.html',
    pagina: 'texto',
    noindex: true,
    conteudo: `<section class="container texto-longo nao-encontrado">
  <p class="rotulo">Erro 404</p>
  <h1>Esta página não foi encontrada.</h1>
  <p>O imóvel pode ter sido vendido ou alugado, ou o endereço foi digitado incorretamente.</p>
  <a class="btn btn--claro btn--seta" href="/#imoveis">Ver imóveis disponíveis <span class="btn__circulo">→</span></a>
</section>`,
  })
);

// ---------- SEO: sitemap e robots ----------
const base = site.url ? site.url.replace(/\/$/, '') : null;
if (base) {
  const urls = ['/', ...imoveis.filter((i) => !i.demo).map((i) => `/imoveis/${i.slug}/`)];
  escrever(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n')}\n</urlset>\n`
  );
}
escrever('robots.txt', `User-agent: *\nAllow: /\n${base ? `Sitemap: ${base}/sitemap.xml\n` : ''}`);

const nDemo = imoveis.filter((i) => i.demo).length;
console.log(`✔ Site gerado em dist/ — ${imoveis.length} imóveis${nDemo ? ` (${nDemo} de demonstração)` : ''}${base ? '' : ' · defina site.url para gerar o sitemap'}`);
