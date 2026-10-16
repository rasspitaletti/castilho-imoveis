// Ícones SVG inline (traço fino, consistentes). Uso: icone('cama')
const caminhos = {
  seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  setaEsq: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  chevronEsq: '<path d="M15 6l-6 6 6 6"/>',
  chevronDir: '<path d="M9 6l6 6-6 6"/>',
  chevronBaixo: '<path d="M6 9l6 6 6-6"/>',
  fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  busca: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  filtro: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  cama: '<path d="M3 18v-6.5A2.5 2.5 0 0 1 5.5 9h13a2.5 2.5 0 0 1 2.5 2.5V18M3 15h18M3 18v2M21 18v2M6 9V6.5A1.5 1.5 0 0 1 7.5 5h9A1.5 1.5 0 0 1 18 6.5V9"/>',
  banho: '<path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2zM6 12V6a2 2 0 0 1 3.6-1.2M7 19l-1 2M17 19l1 2"/>',
  carro: '<path d="M5 16h14M5 16v2.5M19 16v2.5M4 16l1.6-5.2A2 2 0 0 1 7.5 9.4h9a2 2 0 0 1 1.9 1.4L20 16"/><circle cx="8" cy="13.4" r=".6"/><circle cx="16" cy="13.4" r=".6"/>',
  area: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
  suite: '<path d="M4 20V8l8-4 8 4v12M9 20v-6h6v6"/>',
  casa: '<path d="M4 11l8-6.5 8 6.5M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
  predio: '<path d="M6 20V4h9v16M15 9h3v11M9 7h2M9 10h2M9 13h2M9 16h2M4 20h16"/>',
  terreno: '<path d="M3 18l5-7 4 4 3-3 6 6zM15 7.5a1.8 1.8 0 1 0 0-.01"/>',
  loja: '<path d="M4 9l1.5-5h13L20 9M4 9h16v2a2.7 2.7 0 0 1-5.3 0 2.7 2.7 0 0 1-5.4 0A2.7 2.7 0 0 1 4 11zM5 13v7h14v-7M10 20v-4h4v4"/>',
  chave: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l1.5 1.5"/>',
  maos: '<path d="M7 11l3.5-3.5a2 2 0 0 1 2.8 0L15 9M3 12l4-4M21 12l-4-4M7 11l5 5a1.5 1.5 0 0 0 2-2M10 14l2 2M17 8l-5.5 5.5"/>',
  escudo: '<path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  conversa: '<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  calendario: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  relogio: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  email: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>',
  telefone: '<path d="M6.6 3.5h2.8l1.4 4-2 1.3a11 11 0 0 0 6.4 6.4l1.3-2 4 1.4v2.8a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 4.6 5.6a2 2 0 0 1 2-2.1z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  expandir: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  estrela: '<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7L9.6 9z"/>',
  mapa: '<path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>',
  olho: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  arvore: '<path d="M12 21v-6M7 15h10l-5-11z"/>',
  instagramPost: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M10 9l5 3-5 3z"/>',
  compartilhar: '<circle cx="6" cy="12" r="2.3"/><circle cx="18" cy="6" r="2.3"/><circle cx="18" cy="18" r="2.3"/><path d="M8 11l8-4M8 13l8 4"/>',
};

export function icone(nome, classe = '') {
  return `<svg class="icone ${classe}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${caminhos[nome] || ''}</svg>`;
}

// Marcas (preenchidas)
export const iconeWhatsApp = (classe = '') =>
  `<svg class="icone ${classe}" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28z"/></svg>`;

export const iconeInstagram = (classe = '') =>
  `<svg class="icone ${classe}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true" focusable="false"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>`;

/** Monograma da marca (C em arco, inspirado no "A" dourado da referência). */
export const logoMarca = () =>
  `<svg class="logo__marca" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false"><path d="M28.5 10.2A12 12 0 1 0 28.5 29.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M20 8v24M14 20h12" stroke="currentColor" stroke-width="1.2" opacity=".55"/><path d="M12.5 27.5L20 12l7.5 15.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
