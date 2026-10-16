// Lógica de busca, filtragem e ordenação do catálogo.
// Funções puras (sem DOM) — testadas em tests/filtros.test.mjs.
import { normalizar, rotuloTipo, areaPrincipal } from './formatar.js';

export const FILTROS_VAZIOS = Object.freeze({
  busca: '', // texto livre: cidade, bairro, região, título ou código
  cidade: '',
  bairro: '',
  regioes: [], // seleção múltipla
  precoMin: null,
  precoMax: null,
  tipo: '',
  finalidade: '', // '' = todas | 'venda' | 'aluguel'
  quartos: 0, // mínimo
  suites: 0, // mínimo
  banheiros: 0, // mínimo
  vagas: 0, // mínimo
  areaMin: null, // m² (usa área útil; se ausente, área total)
});

export const ORDENACOES = {
  relevancia: 'Relevância',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
  recentes: 'Mais recentes',
};

export const novoFiltro = (parcial = {}) => ({ ...FILTROS_VAZIOS, regioes: [], ...parcial });

const areaDe = (i) => areaPrincipal(i)[0];

/** Verifica se um imóvel atende a TODOS os critérios ao mesmo tempo. */
export function atende(imovel, f) {
  if (f.finalidade && imovel.finalidade !== f.finalidade) return false;
  if (f.tipo && imovel.tipo !== f.tipo) return false;
  if (f.cidade && normalizar(imovel.cidade) !== normalizar(f.cidade)) return false;
  if (f.bairro && normalizar(imovel.bairro) !== normalizar(f.bairro)) return false;
  if (f.regioes?.length && !f.regioes.some((r) => normalizar(r) === normalizar(imovel.regiao))) return false;
  // Imóveis "sob consulta" (sem preço) não entram quando há faixa de preço definida
  if ((f.precoMin != null || f.precoMax != null) && imovel.preco == null) return false;
  if (f.precoMin != null && imovel.preco < f.precoMin) return false;
  if (f.precoMax != null && imovel.preco > f.precoMax) return false;
  // Mínimos de características: imóvel sem o dado não atende quando o filtro está ativo
  if (f.quartos > 0 && !((imovel.quartos ?? -1) >= f.quartos)) return false;
  if (f.suites > 0 && !((imovel.suites ?? -1) >= f.suites)) return false;
  if (f.banheiros > 0 && !((imovel.banheiros ?? -1) >= f.banheiros)) return false;
  if (f.vagas > 0 && !((imovel.vagas ?? -1) >= f.vagas)) return false;
  if (f.areaMin != null && f.areaMin > 0) {
    const a = areaDe(imovel);
    if (a == null || a < f.areaMin) return false;
  }
  if (f.busca) {
    const termos = normalizar(f.busca).split(/[\s,]+/).filter(Boolean);
    const alvo = normalizar(
      [imovel.titulo, imovel.cidade, imovel.bairro, imovel.regiao, imovel.condominio, imovel.id, rotuloTipo(imovel.tipo)].join(' ')
    );
    if (!termos.every((t) => alvo.includes(t))) return false;
  }
  return true;
}

export const filtrar = (lista, f) => lista.filter((i) => atende(i, f));

const temData = (i) => !!i.dataPublicacao && !Number.isNaN(Date.parse(i.dataPublicacao));

/** Só há ordenação por data quando ao menos 75% dos imóveis têm data válida (os sem data vão para o fim). */
export const temDatasConfiaveis = (lista) => lista.length > 0 && lista.filter(temData).length / lista.length >= 0.75;

export function ordenar(lista, criterio = 'relevancia') {
  const copia = lista.map((item, indice) => ({ item, indice }));
  const desempate = (a, b) => a.indice - b.indice;
  const semPreco = (a, b) => {
    const na = a.item.preco == null;
    const nb = b.item.preco == null;
    if (na && nb) return desempate(a, b);
    if (na) return 1;
    if (nb) return -1;
    return null;
  };
  const cmp = {
    // sem preço ("sob consulta") vai sempre para o fim
    'menor-preco': (a, b) => semPreco(a, b) ?? (a.item.preco - b.item.preco || desempate(a, b)),
    'maior-preco': (a, b) => semPreco(a, b) ?? (b.item.preco - a.item.preco || desempate(a, b)),
    recentes: (a, b) =>
      Number(temData(b.item)) - Number(temData(a.item)) ||
      (temData(a.item) ? Date.parse(b.item.dataPublicacao) - Date.parse(a.item.dataPublicacao) : 0) ||
      desempate(a, b),
    relevancia: (a, b) =>
      Number(!!b.item.destaque) - Number(!!a.item.destaque) ||
      Number(b.item.preco != null) - Number(a.item.preco != null) ||
      desempate(a, b),
  }[criterio] || ((a, b) => desempate(a, b));
  return copia.sort(cmp).map((x) => x.item);
}

const ordenarPt = (arr) => [...arr].sort((a, b) => a.localeCompare(b, 'pt-BR'));
const unicos = (arr) => [...new Set(arr.filter(Boolean))];

/** Opções dos filtros de localização geradas a partir dos imóveis cadastrados. */
export function opcoesLocalizacao(lista) {
  const cidades = ordenarPt(unicos(lista.map((i) => i.cidade)));
  const bairrosPorCidade = {};
  for (const c of cidades) {
    bairrosPorCidade[c] = ordenarPt(unicos(lista.filter((i) => i.cidade === c).map((i) => i.bairro)));
  }
  const regioes = ordenarPt(unicos(lista.map((i) => i.regiao)));
  return { cidades, bairrosPorCidade, regioes };
}

export const tiposDisponiveis = (lista) =>
  unicos(lista.map((i) => i.tipo)).sort((a, b) => rotuloTipo(a).localeCompare(rotuloTipo(b), 'pt-BR'));

export const finalidadesDisponiveis = (lista) => ['venda', 'aluguel'].filter((f) => lista.some((i) => i.finalidade === f));

/** Faixa de preço (mín./máx.) considerando a finalidade escolhida. */
export function faixaPreco(lista, finalidade = '') {
  const base = finalidade ? lista.filter((i) => i.finalidade === finalidade) : lista;
  const precos = base.map((i) => i.preco).filter((p) => typeof p === 'number' && p > 0);
  if (!precos.length) return { min: 0, max: 0 };
  return { min: Math.min(...precos), max: Math.max(...precos) };
}

export function contarFiltrosAtivos(f) {
  let n = 0;
  if (f.busca) n++;
  if (f.cidade) n++;
  if (f.bairro) n++;
  n += f.regioes?.length || 0;
  if (f.precoMin != null) n++;
  if (f.precoMax != null) n++;
  if (f.tipo) n++;
  if (f.finalidade) n++;
  if (f.quartos > 0) n++;
  if (f.suites > 0) n++;
  if (f.banheiros > 0) n++;
  if (f.vagas > 0) n++;
  if (f.areaMin) n++;
  return n;
}

// ---- Serialização para a URL (permite compartilhar a busca e usar links como "Comprar") ----

const NUMERICOS = ['precoMin', 'precoMax', 'quartos', 'suites', 'banheiros', 'vagas', 'areaMin'];

export function filtrosParaQuery(f, ordem = 'relevancia') {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (k === 'regioes') {
      if (v.length) p.set('regiao', v.join('|'));
    } else if (v !== '' && v != null && v !== 0) {
      p.set(k, String(v));
    }
  }
  if (ordem && ordem !== 'relevancia') p.set('ordem', ordem);
  return p.toString();
}

export function filtrosDaQuery(query) {
  const p = new URLSearchParams(query);
  const f = novoFiltro();
  for (const k of Object.keys(FILTROS_VAZIOS)) {
    if (k === 'regioes') continue;
    if (!p.has(k)) continue;
    const bruto = p.get(k);
    if (NUMERICOS.includes(k)) {
      const n = Number(bruto);
      if (Number.isFinite(n) && n >= 0) f[k] = n;
    } else {
      f[k] = bruto;
    }
  }
  if (p.get('regiao')) f.regioes = p.get('regiao').split('|').filter(Boolean);
  if (!['', 'venda', 'aluguel'].includes(f.finalidade)) f.finalidade = '';
  const ordem = ORDENACOES[p.get('ordem')] ? p.get('ordem') : 'relevancia';
  return { filtros: f, ordem };
}
