// Decide quais fotos cada parte do site mostra: as ilustrativas temporárias
// (quando ativas) e as fotos reais do imóvel, sempre identificadas.
import { ATIVAS, NOS_IMOVEIS, porImovel, institucionais, urlUnsplash } from '../dados/fotos-ilustrativas.js';
import { site } from '../dados/site.js';

const ilustrativa = (f) => ({ src: urlUnsplash(f.id, 1200), id: f.id, alt: f.alt, credito: f.credito, ilustrativa: true });

/** Fotos do imóvel na ordem de exibição. A primeira é a capa. */
export function fotosDoImovel(imovel) {
  const reais = (imovel.imagens || []).map((img) => ({ ...img, real: true }));
  const extras = ATIVAS && NOS_IMOVEIS ? (porImovel[imovel.slug] || []).map(ilustrativa) : [];
  // fotos marcadas como capa (enviadas pelo corretor) vêm primeiro
  return [...reais.filter((f) => f.capa), ...extras, ...reais.filter((f) => !f.capa)];
}

export const capaDoImovel = (imovel) => fotosDoImovel(imovel)[0] || null;

export function fotoHero() {
  if (ATIVAS && institucionais.hero) return ilustrativa(institucionais.hero);
  return { src: site.heroImagem, alt: site.heroImagemAlt, foco: site.heroFoco, ilustrativa: !!site.heroIlustrativa, largura: 1800, altura: 1200 };
}

export const fotoInstitucional = (chave) => (ATIVAS && institucionais[chave] ? ilustrativa(institucionais[chave]) : null);

export const usaIlustrativas = () => ATIVAS;
export { urlUnsplash };
