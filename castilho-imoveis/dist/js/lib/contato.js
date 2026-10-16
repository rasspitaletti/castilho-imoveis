// Geração centralizada de links de contato (WhatsApp, telefone, Instagram, mapa).
import { site } from '../dados/site.js';

/** Link do WhatsApp com mensagem opcional, codificada para URL. */
export function linkWhatsApp(mensagem = site.mensagemPadrao) {
  const base = `https://wa.me/${site.contato.whatsappNumero}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

/** Endereço absoluto da página do imóvel, se o domínio estiver configurado. */
export const urlImovel = (imovel) => (site.url ? `${site.url.replace(/\/$/, '')}/imoveis/${imovel.slug}/` : null);

/** Mensagem que identifica o imóvel. `intencao`: 'info' | 'visita' | 'valor' */
export function mensagemImovel(imovel, intencao = 'info') {
  const pedido = {
    visita: 'gostaria de agendar uma visita',
    valor: 'gostaria de saber o valor e as condições',
  }[intencao] || 'gostaria de receber mais informações';
  let msg = `Olá! Encontrei o imóvel "${imovel.titulo}" (código ${imovel.id}) no site da ${site.nome} e ${pedido}.`;
  const url = urlImovel(imovel);
  if (url) msg += `\n${url}`;
  return msg;
}

export const linkWhatsAppImovel = (imovel, intencao) => linkWhatsApp(mensagemImovel(imovel, intencao));

export const linkTelefone = () => `tel:${site.contato.telefoneE164}`;
export const linkInstagram = () => site.contato.instagramUrl;
export const linkEmail = () => (site.contato.email ? `mailto:${site.contato.email}` : null);

/** URL de mapa incorporado (Google Maps, sem chave de API). */
export function urlMapaEmbed(imovel) {
  const consulta = imovel.mapa?.consulta || [imovel.endereco, imovel.bairro, imovel.cidade].filter(Boolean).join(', ');
  if (!consulta) return null;
  const zoom = { endereco: 16, bairro: 14, cidade: 12 }[imovel.mapa?.precisao] || 14;
  return `https://maps.google.com/maps?q=${encodeURIComponent(consulta)}&z=${zoom}&hl=pt-BR&output=embed`;
}

export function urlMapaExterno(imovel) {
  const consulta = imovel.mapa?.consulta || [imovel.bairro, imovel.cidade].filter(Boolean).join(', ');
  return consulta ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}` : null;
}
