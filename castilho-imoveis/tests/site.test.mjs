// Verifica o site gerado em dist/ (rode `npm test`, que faz o build antes).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { imoveis } from '../src/dados/imoveis.js';
import { site } from '../src/dados/site.js';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const ler = (p) => readFileSync(join(dist, p), 'utf8');
const paginasHtml = (dir = dist) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? paginasHtml(p) : p.endsWith('.html') ? [p] : [];
  });
const decodificar = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

test('existe uma página para cada imóvel', () => {
  for (const i of imoveis) assert.ok(existsSync(join(dist, 'imoveis', i.slug, 'index.html')), i.slug);
});

test('todos os links de WhatsApp usam o número oficial', () => {
  for (const arq of paginasHtml()) {
    const html = readFileSync(arq, 'utf8');
    const links = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]+)"/g)].map((m) => m[1]);
    for (const l of links) assert.ok(l.startsWith('https://wa.me/5511944444646'), `${arq}: ${l}`);
  }
  assert.equal(site.contato.whatsappNumero, '5511944444646');
});

test('mensagens de WhatsApp dos imóveis identificam o anúncio', () => {
  for (const i of imoveis) {
    const html = ler(`imoveis/${i.slug}/index.html`);
    const msgs = [...html.matchAll(/href="https:\/\/wa\.me\/5511944444646\?text=([^"]+)"/g)].map((m) => decodeURIComponent(decodificar(m[1])));
    const doImovel = msgs.filter((m) => m.includes(i.titulo) && m.includes(i.id));
    assert.ok(doImovel.length >= 3, `${i.slug}: mensagens identificando o imóvel`);
  }
});

test('Instagram e telefone apontam para os dados oficiais', () => {
  const html = ler('index.html');
  const insta = [...html.matchAll(/href="(https:\/\/www\.instagram\.com\/[^"]*)"/g)].map((m) => m[1]);
  assert.ok(insta.length >= 4);
  assert.ok(insta.every((l) => l === 'https://www.instagram.com/corretorcastilho_oficial/'));
  // nas páginas dos imóveis, os links de vídeo apontam para os posts de origem
  for (const i of imoveis) {
    const pag = ler(`imoveis/${i.slug}/index.html`);
    for (const post of i.fonte.posts) assert.ok(pag.includes(post), `${i.slug}: ${post}`);
  }
  assert.ok(html.includes('href="tel:+5511944444646"'));
  assert.ok(html.includes('(11) 94444-4646'));
});

test('links internos apontam para páginas existentes', () => {
  for (const arq of paginasHtml()) {
    const html = readFileSync(arq, 'utf8');
    for (const [, href] of html.matchAll(/href="(\/[^"#?]*)/g)) {
      const caminho = join(dist, href);
      const ok = existsSync(caminho) && (statSync(caminho).isFile() || existsSync(join(caminho, 'index.html')));
      assert.ok(ok, `${arq} → ${href}`);
    }
  }
});

test('âncoras de navegação existem na página inicial', () => {
  const html = ler('index.html');
  for (const id of ['inicio', 'buscar', 'imoveis', 'sobre', 'contato']) assert.ok(html.includes(`id="${id}"`), id);
});

test('imagens têm texto alternativo definido', () => {
  for (const arq of paginasHtml()) {
    const html = readFileSync(arq, 'utf8');
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) assert.match(tag, /\balt="/, `${arq}: ${tag.slice(0, 80)}`);
  }
});

test('imóveis reais são indexáveis e têm dados estruturados', () => {
  for (const i of imoveis.filter((x) => !x.demo)) {
    const html = ler(`imoveis/${i.slug}/index.html`);
    assert.ok(html.includes('content="index, follow"'), i.slug);
    assert.ok(html.includes('"RealEstateListing"'), i.slug);
  }
});

test('fotos com versão WebP e sem imagens geradas/ilustrativas', () => {
  const html = ler('index.html');
  assert.ok(!html.includes('/imagens/demo/'));
  for (const i of imoveis) for (const img of i.imagens) {
    assert.ok(existsSync(join(dist, img.src.replace(/\.jpg$/, '.webp'))), img.src);
    assert.ok(existsSync(join(dist, img.src.replace(/\.jpg$/, '-480.webp'))), img.src);
  }
});

test('"Alugar" só aparece quando há imóveis para alugar', () => {
  const temAluguel = imoveis.some((i) => i.finalidade === 'aluguel');
  assert.equal(ler('index.html').includes('finalidade=aluguel'), temAluguel);
});

test('imóveis sem preço mostram "Valor sob consulta" e botão de consultar valor', () => {
  for (const i of imoveis.filter((x) => x.preco == null)) {
    const html = ler(`imoveis/${i.slug}/index.html`);
    assert.ok(html.includes('Valor sob consulta'), i.slug);
    assert.ok(html.includes(encodeURIComponent('gostaria de saber o valor')), i.slug);
  }
});

test('cada página tem um único h1, título e descrição', () => {
  for (const arq of paginasHtml()) {
    const html = readFileSync(arq, 'utf8');
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, arq);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.match(html, /<meta name="description" content="[^"]{30,}"/);
  }
});
