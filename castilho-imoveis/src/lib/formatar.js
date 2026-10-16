// Funções de formatação e utilitários compartilhados (navegador e build).

export const PRECO_SOB_CONSULTA = 'Valor sob consulta';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

export const formatarPreco = (valor) => (valor == null || Number.isNaN(valor) ? '' : brl.format(valor));
export const formatarNumero = (valor) => (valor == null ? '' : num.format(valor));

/** Preço com sufixo para aluguel: "R$ 3.200/mês" — ou "Valor sob consulta". */
export const precoAnuncio = (imovel) =>
  imovel.preco == null ? PRECO_SOB_CONSULTA : formatarPreco(imovel.preco) + (imovel.finalidade === 'aluguel' ? '/mês' : '');

/** Área principal do imóvel para cards e filtros: [valor, rótulo]. */
export function areaPrincipal(imovel) {
  const ordem = [
    ['areaUtil', 'área útil'],
    ['areaPrivativa', 'área privativa'],
    ['areaConstruida', 'construídos'],
    ['areaTotal', imovel.tipo === 'chacara' || imovel.tipo === 'terreno' ? 'de terreno' : 'área total'],
  ];
  for (const [campo, rotulo] of ordem) if (imovel[campo]) return [imovel[campo], rotulo];
  return [null, null];
}

/** Converte texto digitado ("R$ 300.000", "300000", "300 mil") em número. */
export function lerValorMonetario(texto) {
  if (texto == null) return null;
  const s = String(texto).toLowerCase().trim();
  if (!s) return null;
  const mil = /\bmil\b|k$/.test(s);
  const milhao = /milh(ão|ao|ões|oes)|mi\b|m$/.test(s);
  // mantém apenas dígitos e vírgula decimal
  const limpo = s.replace(/[^\d,]/g, '').replace(',', '.');
  if (!limpo) return null;
  let v = parseFloat(limpo);
  if (Number.isNaN(v)) return null;
  if (milhao) v *= 1_000_000;
  else if (mil) v *= 1_000;
  return Math.round(v);
}

export const ROTULOS_TIPO = {
  casa: 'Casa',
  sobrado: 'Sobrado',
  'casa-condominio': 'Casa em condomínio',
  apartamento: 'Apartamento',
  cobertura: 'Cobertura',
  studio: 'Studio',
  chacara: 'Chácara',
  terreno: 'Terreno',
  comercial: 'Imóvel comercial',
};

export const rotuloTipo = (tipo) => ROTULOS_TIPO[tipo] || (tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : '');
export const rotuloFinalidade = (f) => (f === 'aluguel' ? 'Aluguel' : f === 'venda' ? 'Venda' : '');

export const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

/** Escapa texto para inserção segura em HTML. */
export function esc(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Remove acentos e padroniza para comparação. */
export const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export const localizacaoTexto = (imovel) => [imovel.bairro, imovel.cidade].filter(Boolean).join(', ');

/** Data AAAA-MM-DD → "15 de out. de 2026" */
export const formatarData = (iso) =>
  iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
