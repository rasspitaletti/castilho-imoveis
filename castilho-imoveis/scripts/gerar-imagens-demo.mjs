// Gera as IMAGENS ILUSTRATIVAS (SVG) usadas pelos imóveis de demonstração.
// Não são fotos de imóveis reais — servem só para visualizar o layout.
// Uso: npm run imagens-demo
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { imoveis } from '../src/dados/imoveis.js';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'public', 'imagens', 'demo');
mkdirSync(destino, { recursive: true });

// ---------- utilitários ----------
function hash(s) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const W = 1600;
const H = 1000;

const CEUS = [
  ['#121826', '#2d3142', '#7a5a4c', '#d39a62'],
  ['#0f141c', '#283244', '#6c6670', '#c9a27c'],
  ['#11161b', '#24303a', '#5d5852', '#bb8a60'],
  ['#161320', '#3a3046', '#8a5e58', '#e0a36a'],
];

const defsBase = (c) => `
  <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${c[0]}"/><stop offset=".45" stop-color="${c[1]}"/>
    <stop offset=".78" stop-color="${c[2]}"/><stop offset="1" stop-color="${c[3]}"/>
  </linearGradient>
  <radialGradient id="sol" cx=".72" cy=".62" r=".45">
    <stop offset="0" stop-color="#ffcf94" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf94" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="chao" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1b1c1a"/><stop offset="1" stop-color="#0b0c0b"/>
  </linearGradient>
  <linearGradient id="luz" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffe7bd"/><stop offset=".55" stop-color="#f6c27f"/><stop offset="1" stop-color="#d98a46"/>
  </linearGradient>
  <linearGradient id="vidro" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3c4552"/><stop offset="1" stop-color="#1c222a"/>
  </linearGradient>
  <linearGradient id="agua" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2d4a55"/><stop offset="1" stop-color="#0f1d24"/>
  </linearGradient>
  <linearGradient id="madeira" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#6b4630"/><stop offset="1" stop-color="#8a5c3c"/>
  </linearGradient>
  <linearGradient id="sombra" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/>
  </linearGradient>
  <filter id="brilho" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="suave"><feGaussianBlur stdDeviation="2.5"/></filter>`;

const svg = (defs, corpo) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${corpo}</svg>\n`;

function ceuEHorizonte(r, horizonte) {
  let s = `<rect width="${W}" height="${H}" fill="url(#ceu)"/><rect width="${W}" height="${H}" fill="url(#sol)"/>`;
  // estrelas discretas
  for (let i = 0; i < 40; i++) {
    s += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * horizonte * 0.45).toFixed(0)}" r="${(r() * 1.3 + 0.3).toFixed(1)}" fill="#fff" opacity="${(r() * 0.5 + 0.1).toFixed(2)}"/>`;
  }
  // colinas ao fundo
  let d = `M0 ${horizonte}`;
  for (let x = 0; x <= W; x += 80) d += ` L${x} ${(horizonte - 30 - r() * 50).toFixed(0)}`;
  s += `<path d="${d} L${W} ${horizonte} Z" fill="#1b1f24" opacity=".75"/>`;
  return s;
}

function arvore(x, base, alt, r, cor = '#0a0d0b') {
  const larg = alt * (0.45 + r() * 0.25);
  let s = `<rect x="${x - 4}" y="${base - alt * 0.35}" width="8" height="${alt * 0.35}" fill="${cor}"/>`;
  for (let i = 0; i < 6; i++) {
    const cx = x + (r() - 0.5) * larg * 0.7;
    const cy = base - alt * 0.45 - r() * alt * 0.45;
    s += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${(larg * (0.25 + r() * 0.2)).toFixed(0)}" ry="${(alt * (0.18 + r() * 0.12)).toFixed(0)}" fill="${cor}"/>`;
  }
  return s;
}

function palmeira(x, base, alt, cor = '#090c0a') {
  let s = `<path d="M${x} ${base} Q${x + 14} ${base - alt / 2} ${x + 6} ${base - alt}" stroke="${cor}" stroke-width="9" fill="none"/>`;
  const tx = x + 6;
  const ty = base - alt;
  for (let a = 0; a < 7; a++) {
    const ang = (-170 + a * 28) * (Math.PI / 180);
    const ex = tx + Math.cos(ang) * 95;
    const ey = ty + Math.sin(ang) * 40 + 30;
    s += `<path d="M${tx} ${ty} Q${(tx + ex) / 2} ${ty - 35} ${ex.toFixed(0)} ${ey.toFixed(0)}" stroke="${cor}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  }
  return s;
}

function painelVidro(x, y, w, h, r, aceso = 0.85) {
  // grade de painéis de vidro com luz quente
  const colunas = Math.max(2, Math.round(w / 90));
  const cw = w / colunas;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#vidro)"/>`;
  for (let i = 0; i < colunas; i++) {
    if (r() < aceso) s += `<rect x="${(x + i * cw).toFixed(1)}" y="${y}" width="${cw.toFixed(1)}" height="${h}" fill="url(#luz)" opacity="${(0.55 + r() * 0.4).toFixed(2)}"/>`;
    s += `<rect x="${(x + i * cw).toFixed(1)}" y="${y}" width="3" height="${h}" fill="#141414"/>`;
  }
  // silhuetas internas (móveis/plantas)
  s += `<rect x="${x + w * 0.15}" y="${y + h * 0.72}" width="${w * 0.22}" height="${h * 0.28}" rx="6" fill="#5a3f2a" opacity=".55"/>`;
  s += `<ellipse cx="${x + w * 0.78}" cy="${y + h * 0.7}" rx="${Math.min(30, w * 0.05)}" ry="${h * 0.22}" fill="#2a3a26" opacity=".6"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#151515" stroke-width="5"/>`;
  return s;
}

// ---------- fachadas ----------
function fachadaSobrado(seed, comPiscina = true) {
  const r = rng(seed);
  const c = CEUS[seed % CEUS.length];
  const hz = 640;
  let s = ceuEHorizonte(r, hz);
  s += arvore(120, hz + 40, 300, r) + palmeira(1450, hz + 60, 330) + arvore(1540, hz + 30, 260, r);
  s += `<rect y="${hz}" width="${W}" height="${H - hz}" fill="url(#chao)"/>`;
  // brilho do entorno
  s += `<ellipse cx="820" cy="660" rx="560" ry="160" fill="#f3b26a" opacity=".22" filter="url(#brilho)"/>`;
  // térreo
  s += `<rect x="330" y="520" width="980" height="190" fill="#1f1e1c"/>`;
  s += painelVidro(360, 540, 520, 170, r, 0.95);
  s += `<rect x="900" y="540" width="140" height="170" fill="url(#madeira)"/>`;
  s += painelVidro(1060, 540, 230, 170, r, 0.8);
  // pavimento superior em balanço
  s += `<rect x="470" y="370" width="900" height="150" fill="#262522"/>`;
  s += painelVidro(500, 390, 640, 120, r, 0.75);
  s += `<rect x="1160" y="390" width="190" height="120" fill="#33312d"/>`;
  // lajes / beirais
  s += `<rect x="290" y="505" width="1080" height="18" fill="#3a3834"/>`;
  s += `<rect x="430" y="352" width="1010" height="20" fill="#3d3b36"/>`;
  s += `<rect x="430" y="370" width="1010" height="4" fill="#f6c27f" opacity=".5"/>`;
  // guarda-corpo de vidro
  s += `<rect x="470" y="495" width="900" height="12" fill="#9fb3bf" opacity=".18"/>`;
  // base / deck
  s += `<rect x="250" y="708" width="1150" height="16" fill="#2e2c28"/>`;
  if (comPiscina) {
    s += `<rect x="180" y="760" width="1300" height="120" fill="url(#agua)"/>`;
    s += `<g opacity=".28" transform="translate(0 1468) scale(1 -1)">${painelVidro(360, 540, 520, 170, rng(seed), 0.95)}</g>`;
    s += `<rect x="180" y="760" width="1300" height="120" fill="url(#sombra)" opacity=".6"/>`;
    for (let i = 0; i < 9; i++) s += `<rect x="${200 + r() * 1250}" y="${775 + r() * 90}" width="${40 + r() * 120}" height="2" fill="#bfe0ea" opacity=".25"/>`;
  } else {
    s += `<rect x="300" y="724" width="1000" height="40" fill="#24221f"/>`;
  }
  // luminárias de jardim
  for (let x = 220; x < 1500; x += 170) s += `<circle cx="${x}" cy="${hz + 245}" r="4" fill="#ffd49a"/><circle cx="${x}" cy="${hz + 245}" r="22" fill="#ffd49a" opacity=".18" filter="url(#brilho)"/>`;
  s += `<rect y="${H - 120}" width="${W}" height="120" fill="url(#sombra)"/>`;
  return svg(defsBase(c), s);
}

function fachadaCasa(seed) {
  const r = rng(seed);
  const c = CEUS[seed % CEUS.length];
  const hz = 650;
  let s = ceuEHorizonte(r, hz);
  s += arvore(140, hz + 30, 280, r) + arvore(1470, hz + 30, 300, r) + arvore(1330, hz + 30, 200, r);
  s += `<rect y="${hz}" width="${W}" height="${H - hz}" fill="url(#chao)"/>`;
  s += `<ellipse cx="800" cy="680" rx="520" ry="140" fill="#f3b26a" opacity=".2" filter="url(#brilho)"/>`;
  s += `<rect x="290" y="500" width="1030" height="230" fill="#24231f"/>`;
  s += `<rect x="320" y="530" width="300" height="200" fill="url(#madeira)"/>`;
  for (let x = 330; x < 620; x += 18) s += `<rect x="${x}" y="530" width="3" height="200" fill="#4b2f1f" opacity=".6"/>`;
  s += painelVidro(640, 530, 460, 200, r, 0.95);
  s += `<rect x="1120" y="560" width="180" height="170" fill="#2d2b27"/>`;
  s += `<rect x="1150" y="600" width="70" height="130" fill="#3e2a1d"/>`;
  s += `<rect x="250" y="480" width="1110" height="22" fill="#3c3a35"/><rect x="250" y="500" width="1110" height="3" fill="#f6c27f" opacity=".5"/>`;
  s += `<rect x="230" y="730" width="1150" height="14" fill="#2f2d29"/>`;
  // caminho
  s += `<path d="M900 744 L1000 744 L1120 ${H} L780 ${H} Z" fill="#2b2925"/>`;
  for (let x = 240; x < 1400; x += 190) s += `<circle cx="${x}" cy="770" r="4" fill="#ffd49a"/><circle cx="${x}" cy="770" r="22" fill="#ffd49a" opacity=".2" filter="url(#brilho)"/>`;
  s += `<rect y="${H - 140}" width="${W}" height="140" fill="url(#sombra)"/>`;
  return svg(defsBase(c), s);
}

function fachadaPredio(seed, cobertura = false) {
  const r = rng(seed);
  const c = CEUS[seed % CEUS.length];
  const hz = 780;
  let s = ceuEHorizonte(r, hz);
  // prédios ao fundo
  for (let i = 0; i < 6; i++) {
    const x = r() * 1500;
    const h = 200 + r() * 300;
    s += `<rect x="${x.toFixed(0)}" y="${hz - h}" width="${(80 + r() * 120).toFixed(0)}" height="${h}" fill="#1a1e24" opacity=".8"/>`;
  }
  // torre principal
  const x0 = 520;
  const w = 560;
  const topo = 120;
  s += `<rect x="${x0}" y="${topo}" width="${w}" height="${hz - topo}" fill="#22252a"/>`;
  s += `<rect x="${x0 + w - 70}" y="${topo}" width="70" height="${hz - topo}" fill="#2c2f35"/>`;
  const andares = 13;
  const ah = (hz - topo - 60) / andares;
  for (let a = 0; a < andares; a++) {
    const y = topo + 40 + a * ah;
    const ultimo = cobertura && a === 0;
    for (let k = 0; k < 4; k++) {
      const wx = x0 + 30 + k * 115;
      const aceso = r() < (ultimo ? 1 : 0.55);
      s += `<rect x="${wx}" y="${y.toFixed(0)}" width="100" height="${(ah - 16).toFixed(0)}" fill="${aceso ? 'url(#luz)' : 'url(#vidro)'}" opacity="${aceso ? (0.6 + r() * 0.35).toFixed(2) : 1}"/>`;
    }
    s += `<rect x="${x0 - 14}" y="${(y + ah - 14).toFixed(0)}" width="${w - 50}" height="8" fill="#3a3c40"/>`;
    s += `<rect x="${x0 - 14}" y="${(y + ah - 34).toFixed(0)}" width="${w - 50}" height="20" fill="#9fb3bf" opacity=".08"/>`;
  }
  if (cobertura) {
    s += `<rect x="${x0 - 30}" y="${topo - 22}" width="${w + 60}" height="22" fill="#3d3b36"/>`;
    s += arvore(x0 + 40, topo - 22, 70, r, '#16201a') + arvore(x0 + w - 40, topo - 22, 60, r, '#16201a');
  } else {
    s += `<rect x="${x0 - 10}" y="${topo - 14}" width="${w + 20}" height="14" fill="#33353a"/>`;
  }
  s += `<rect y="${hz}" width="${W}" height="${H - hz}" fill="url(#chao)"/>`;
  s += `<rect x="${x0 + 180}" y="${hz - 70}" width="200" height="70" fill="url(#luz)" opacity=".8"/>`;
  s += palmeira(380, hz + 40, 280) + arvore(1250, hz + 20, 260, r) + arvore(1420, hz + 20, 300, r);
  s += `<rect y="${H - 120}" width="${W}" height="120" fill="url(#sombra)"/>`;
  return svg(defsBase(c), s);
}

function fachadaComercial(seed) {
  const r = rng(seed);
  const c = CEUS[seed % CEUS.length];
  const hz = 760;
  let s = ceuEHorizonte(r, hz);
  s += `<rect x="260" y="300" width="1080" height="${hz - 300}" fill="#26282c"/>`;
  for (let a = 0; a < 3; a++) for (let k = 0; k < 7; k++) {
    const aceso = r() < 0.5;
    s += `<rect x="${300 + k * 148}" y="${330 + a * 95}" width="120" height="70" fill="${aceso ? 'url(#luz)' : 'url(#vidro)'}" opacity="${aceso ? 0.75 : 1}"/>`;
  }
  s += `<rect x="260" y="610" width="1080" height="22" fill="#3d3b36"/>`;
  s += painelVidro(300, 640, 1000, 120, r, 1);
  s += `<rect y="${hz}" width="${W}" height="${H - hz}" fill="url(#chao)"/>`;
  s += `<rect y="${hz}" width="${W}" height="30" fill="#2a2a28"/>`;
  s += arvore(140, hz + 20, 260, r) + arvore(1480, hz + 20, 240, r);
  s += `<rect y="${H - 120}" width="${W}" height="120" fill="url(#sombra)"/>`;
  return svg(defsBase(c), s);
}

function terreno(seed, lateral = false) {
  const r = rng(seed);
  const c = ['#2a3446', '#53607a', '#a08672', '#e3b07c'];
  const hz = 560;
  let s = ceuEHorizonte(r, hz);
  s += `<linearGradient id="grama" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4a2c"/><stop offset="1" stop-color="#1c2416"/></linearGradient>`;
  s += `<rect y="${hz}" width="${W}" height="${H - hz}" fill="url(#grama)"/>`;
  // muro
  const mx = lateral ? 0 : 140;
  s += `<rect x="${mx}" y="${hz - 70}" width="${W - mx * 2}" height="80" fill="#6d6458"/>`;
  for (let x = mx; x < W - mx; x += 120) s += `<rect x="${x}" y="${hz - 70}" width="4" height="80" fill="#4f483f"/>`;
  s += arvore(260, hz - 60, 260, r, '#1a2216') + arvore(1180, hz - 60, 320, r, '#1a2216') + arvore(1450, hz - 60, 240, r, '#1a2216');
  // textura da grama
  for (let i = 0; i < 180; i++) s += `<rect x="${(r() * W).toFixed(0)}" y="${(hz + r() * (H - hz)).toFixed(0)}" width="2" height="${(4 + r() * 10).toFixed(0)}" fill="#5c6e42" opacity=".5"/>`;
  // estacas de demarcação
  for (const [x, y] of [[300, 900], [1300, 900], [420, 640], [1180, 640]]) s += `<rect x="${x}" y="${y - 60}" width="8" height="60" fill="#d8c3a0"/><rect x="${x - 2}" y="${y - 60}" width="12" height="10" fill="#c46a3c"/>`;
  s += `<rect y="${H - 120}" width="${W}" height="120" fill="url(#sombra)"/>`;
  return svg(defsBase(c), s);
}

// ---------- interiores ----------
const defsInterior = (tom) => `${defsBase(CEUS[0])}
  <linearGradient id="parede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tom[0]}"/><stop offset="1" stop-color="${tom[1]}"/></linearGradient>
  <linearGradient id="piso" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tom[2]}"/><stop offset="1" stop-color="${tom[3]}"/></linearGradient>
  <linearGradient id="tecido" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7dfd2"/><stop offset="1" stop-color="#b9ae9c"/></linearGradient>
  <radialGradient id="abajur" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".7"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></radialGradient>`;

const TONS = [
  ['#3a332c', '#2a241f', '#5b4636', '#2b2019'],
  ['#34322f', '#24221f', '#6a5444', '#2d231c'],
  ['#2f3134', '#1f2124', '#4d4a46', '#1f1d1b'],
];

function janelaNoturna(x, y, w, h, r) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#ceu)"/>`;
  s += `<rect x="${x}" y="${y + h * 0.62}" width="${w}" height="${h * 0.38}" fill="#121611"/>`;
  for (let i = 0; i < 5; i++) s += `<ellipse cx="${x + r() * w}" cy="${y + h * 0.62}" rx="${40 + r() * 60}" ry="${30 + r() * 50}" fill="#0c100c"/>`;
  for (let k = 1; k < 4; k++) s += `<rect x="${x + (w / 4) * k - 3}" y="${y}" width="6" height="${h}" fill="#151515"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#151515" stroke-width="10"/>`;
  return s;
}

function sala(seed) {
  const r = rng(seed);
  const t = TONS[seed % TONS.length];
  let s = `<rect width="${W}" height="${H}" fill="url(#parede)"/>`;
  s += janelaNoturna(880, 120, 640, 560, r);
  s += `<rect y="680" width="${W}" height="${H - 680}" fill="url(#piso)"/>`;
  for (let x = -400; x < W + 400; x += 140) s += `<line x1="${W / 2}" y1="680" x2="${x}" y2="${H}" stroke="#000" stroke-opacity=".12"/>`;
  // quadro e prateleira
  s += `<rect x="160" y="240" width="300" height="200" fill="#5c4a3a" stroke="#1b1712" stroke-width="10"/><rect x="190" y="270" width="240" height="140" fill="#8a6d52" opacity=".7"/>`;
  // pendente
  s += `<line x1="640" y1="0" x2="640" y2="300" stroke="#111" stroke-width="3"/><circle cx="640" cy="320" r="34" fill="#ffd9a0"/><circle cx="640" cy="320" r="160" fill="url(#abajur)"/>`;
  // tapete, sofá e mesa
  s += `<ellipse cx="620" cy="880" rx="520" ry="90" fill="#cbbfae" opacity=".25"/>`;
  s += `<rect x="150" y="640" width="760" height="70" rx="26" fill="url(#tecido)"/>`;
  s += `<rect x="130" y="700" width="800" height="120" rx="30" fill="url(#tecido)"/>`;
  s += `<rect x="180" y="640" width="150" height="90" rx="20" fill="#d6cbb9"/><rect x="740" y="640" width="150" height="90" rx="20" fill="#cfc3b0"/>`;
  s += `<rect x="150" y="812" width="20" height="30" fill="#2a221b"/><rect x="890" y="812" width="20" height="30" fill="#2a221b"/>`;
  s += `<ellipse cx="610" cy="890" rx="190" ry="34" fill="#3b2c20"/><ellipse cx="610" cy="882" rx="190" ry="30" fill="#5a4330"/>`;
  // planta
  s += `<rect x="1380" y="760" width="90" height="110" rx="10" fill="#c8b9a2"/>`;
  for (let i = 0; i < 9; i++) s += `<ellipse cx="${1425 + (r() - 0.5) * 120}" cy="${640 + r() * 120}" rx="22" ry="70" fill="#2f4a2a" transform="rotate(${(r() - 0.5) * 60} 1425 760)"/>`;
  s += `<rect width="${W}" height="${H}" fill="url(#sol)" opacity=".35"/>`;
  return svg(defsInterior(t), s);
}

function quarto(seed) {
  const r = rng(seed);
  const t = TONS[(seed + 1) % TONS.length];
  let s = `<rect width="${W}" height="${H}" fill="url(#parede)"/>`;
  // painel ripado da cabeceira
  s += `<rect x="360" y="180" width="880" height="560" fill="#4b3828"/>`;
  for (let x = 370; x < 1240; x += 22) s += `<rect x="${x}" y="180" width="8" height="560" fill="#3a2a1d"/>`;
  s += `<rect x="360" y="178" width="880" height="6" fill="#ffd9a0" opacity=".35"/>`;
  s += `<rect y="740" width="${W}" height="${H - 740}" fill="url(#piso)"/>`;
  // cama
  s += `<rect x="460" y="560" width="680" height="120" rx="14" fill="#ddd4c6"/>`;
  s += `<rect x="440" y="660" width="720" height="140" rx="16" fill="url(#tecido)"/>`;
  s += `<rect x="440" y="700" width="720" height="70" fill="#8d7a63" opacity=".55"/>`;
  s += `<rect x="500" y="580" width="220" height="80" rx="24" fill="#f1ebe1"/><rect x="880" y="580" width="220" height="80" rx="24" fill="#efe8dc"/>`;
  s += `<rect x="440" y="800" width="720" height="24" fill="#2b2119"/>`;
  // criados-mudos e abajures
  for (const x of [250, 1210]) {
    s += `<rect x="${x}" y="680" width="140" height="120" fill="#2c2119"/><rect x="${x}" y="680" width="140" height="10" fill="#5b4330"/>`;
    s += `<rect x="${x + 60}" y="600" width="20" height="80" fill="#1a1a1a"/><path d="M${x + 25} 600 L${x + 115} 600 L${x + 100} 540 L${x + 40} 540 Z" fill="#f0d3a6"/>`;
    s += `<circle cx="${x + 70}" cy="580" r="190" fill="url(#abajur)"/>`;
  }
  s += janelaNoturna(1330, 160, 230, 420, r);
  return svg(defsInterior(t), s);
}

function cozinha(seed) {
  const r = rng(seed);
  const t = TONS[(seed + 2) % TONS.length];
  let s = `<rect width="${W}" height="${H}" fill="url(#parede)"/>`;
  // armários superiores e inferiores
  s += `<rect x="120" y="140" width="1360" height="230" fill="#2a2420"/>`;
  for (let x = 120; x < 1480; x += 170) s += `<rect x="${x + 6}" y="146" width="158" height="218" fill="#3a2f27"/><rect x="${x + 150}" y="250" width="4" height="40" fill="#b48a5a"/>`;
  s += `<rect x="120" y="370" width="1360" height="6" fill="#ffd9a0" opacity=".6"/>`;
  s += `<rect x="120" y="376" width="1360" height="150" fill="#d8d0c4" opacity=".85"/>`;
  s += `<rect x="120" y="526" width="1360" height="20" fill="#efe9df"/>`;
  s += `<rect x="120" y="546" width="1360" height="180" fill="#2e2722"/>`;
  s += `<rect y="726" width="${W}" height="${H - 726}" fill="url(#piso)"/>`;
  // ilha
  s += `<rect x="330" y="690" width="940" height="34" fill="#f2ede5"/><rect x="350" y="724" width="900" height="200" fill="#3e332b"/>`;
  for (let x = 380; x < 1250; x += 150) s += `<rect x="${x}" y="760" width="120" height="140" fill="#4a3d33"/>`;
  // banquetas
  for (const x of [470, 760, 1050]) s += `<rect x="${x}" y="800" width="90" height="16" rx="6" fill="#151515"/><rect x="${x + 40}" y="816" width="10" height="160" fill="#151515"/>`;
  // pendentes
  for (const x of [500, 800, 1100]) s += `<line x1="${x}" y1="0" x2="${x}" y2="470" stroke="#111" stroke-width="3"/><path d="M${x - 40} 520 L${x + 40} 520 L${x + 22} 470 L${x - 22} 470 Z" fill="#c9a06a"/><ellipse cx="${x}" cy="560" rx="160" ry="120" fill="url(#abajur)"/>`;
  // vasos e utensílios
  s += `<rect x="560" y="640" width="40" height="50" rx="8" fill="#9db08f"/><circle cx="1040" cy="672" r="22" fill="#d9c29f"/>`;
  return svg(defsInterior(t), s);
}

function escritorio(seed) {
  const r = rng(seed);
  const t = TONS[2];
  let s = `<rect width="${W}" height="${H}" fill="url(#parede)"/>`;
  s += janelaNoturna(140, 130, 700, 520, r);
  s += `<rect y="700" width="${W}" height="${H - 700}" fill="url(#piso)"/>`;
  s += `<rect x="940" y="160" width="520" height="420" fill="#2a2420"/>`;
  for (let y = 240; y < 580; y += 110) s += `<rect x="940" y="${y}" width="520" height="10" fill="#4d3e33"/>`;
  for (let i = 0; i < 14; i++) s += `<rect x="${960 + r() * 460}" y="${170 + Math.floor(r() * 4) * 110}" width="${14 + r() * 16}" height="${50 + r() * 15}" fill="${['#8a6d52', '#c7b79e', '#5b6b5a', '#a0563c'][i % 4]}"/>`;
  s += `<rect x="300" y="660" width="900" height="30" fill="#5a4330"/><rect x="330" y="690" width="20" height="200" fill="#1a1a1a"/><rect x="1150" y="690" width="20" height="200" fill="#1a1a1a"/>`;
  s += `<rect x="620" y="560" width="200" height="110" rx="6" fill="#151515"/><rect x="630" y="570" width="180" height="90" fill="#334050"/>`;
  s += `<rect x="560" y="740" width="160" height="150" rx="20" fill="#1d1d1d"/>`;
  s += `<line x1="1300" y1="0" x2="1300" y2="300" stroke="#111" stroke-width="3"/><circle cx="1300" cy="320" r="28" fill="#ffd9a0"/><circle cx="1300" cy="320" r="150" fill="url(#abajur)"/>`;
  return svg(defsInterior(t), s);
}

// ---------- mapeamento por tipo ----------
function cenas(imovel, seed) {
  switch (imovel.tipo) {
    case 'sobrado':
      return [() => fachadaSobrado(seed), () => sala(seed), () => quarto(seed), () => cozinha(seed)];
    case 'casa-condominio':
      return [() => fachadaSobrado(seed, false), () => sala(seed), () => quarto(seed), () => cozinha(seed)];
    case 'casa':
      return [() => fachadaCasa(seed), () => sala(seed), () => quarto(seed), () => cozinha(seed)];
    case 'cobertura':
      return [() => fachadaPredio(seed, true), () => sala(seed), () => quarto(seed), () => cozinha(seed)];
    case 'terreno':
      return [() => terreno(seed), () => terreno(seed + 7, true)];
    case 'comercial':
      return [() => fachadaComercial(seed), () => escritorio(seed)];
    default:
      return [() => fachadaPredio(seed), () => sala(seed), () => quarto(seed), () => cozinha(seed)];
  }
}

let total = 0;
for (const imovel of imoveis.filter((i) => i.demo)) {
  const seed = hash(imovel.slug);
  const lista = cenas(imovel, seed);
  imovel.imagens.forEach((img, i) => {
    if (!img.src.startsWith('/imagens/demo/')) return;
    const gerar = lista[i % lista.length];
    writeFileSync(join(raiz, 'public', img.src), gerar());
    total++;
  });
}
writeFileSync(join(destino, 'hero-demo.svg'), fachadaSobrado(hash('castilho-hero') + 2));
writeFileSync(join(destino, 'sobre-demo.svg'), sala(hash('castilho-sobre')));
writeFileSync(join(destino, 'contato-demo.svg'), sala(hash('castilho-contato') + 1));
console.log(`✔ ${total + 3} imagens ilustrativas geradas em public/imagens/demo/`);
