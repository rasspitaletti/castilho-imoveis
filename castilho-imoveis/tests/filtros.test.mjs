// Testes da lógica de busca (npm test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { imoveis } from '../src/dados/imoveis.js';
import {
  novoFiltro, filtrar, ordenar, opcoesLocalizacao, faixaPreco, temDatasConfiaveis, filtrosParaQuery, filtrosDaQuery,
} from '../src/lib/filtros.js';
import { lerValorMonetario, formatarPreco, precoAnuncio, areaPrincipal } from '../src/lib/formatar.js';

const ids = (lista) => lista.map((i) => i.id).sort();
const f = (p) => novoFiltro(p);
const esperado = (cond) => ids(imoveis.filter(cond));

test('sem filtros retorna todos os imóveis', () => {
  assert.equal(filtrar(imoveis, f()).length, imoveis.length);
});

test('filtra por bairro/condomínio (sem diferenciar acentos/maiúsculas)', () => {
  assert.deepEqual(ids(filtrar(imoveis, f({ bairro: 'jardim bela vista' }))), esperado((i) => i.bairro === 'Jardim Bela Vista'));
  assert.deepEqual(ids(filtrar(imoveis, f({ bairro: 'CONDOMINIO RESERVA ARACARI' }))), ['CI-003', 'CI-009']);
});

test('filtra por cidade e por região', () => {
  assert.equal(filtrar(imoveis, f({ cidade: 'araçariguama' })).length, imoveis.length);
  assert.equal(filtrar(imoveis, f({ cidade: 'Osasco' })).length, 0);
  assert.equal(filtrar(imoveis, f({ regioes: ['Araçariguama'] })).length, imoveis.length);
});

test('faixa de preço respeita os limites e exclui "sob consulta"', () => {
  const r = filtrar(imoveis, f({ precoMin: 300000, precoMax: 750000 }));
  assert.deepEqual(ids(r), esperado((i) => i.preco != null && i.preco >= 300000 && i.preco <= 750000));
  assert.ok(r.every((i) => i.preco != null));
  assert.deepEqual(ids(filtrar(imoveis, f({ precoMax: 400000 }))), ['CI-004']);
});

test('filtros combinados: bairro + preço + quartos ao mesmo tempo', () => {
  const crit = { bairro: 'Jardim Bela Vista', precoMax: 800000, quartos: 2 };
  assert.deepEqual(ids(filtrar(imoveis, f(crit))), ['CI-001']);
  assert.equal(filtrar(imoveis, f({ ...crit, quartos: 3 })).length, 0);
});

test('tipo, suítes, vagas e área mínima', () => {
  assert.deepEqual(ids(filtrar(imoveis, f({ tipo: 'chacara' }))), esperado((i) => i.tipo === 'chacara'));
  assert.ok(filtrar(imoveis, f({ suites: 2 })).every((i) => i.suites >= 2));
  assert.ok(filtrar(imoveis, f({ vagas: 2 })).every((i) => i.vagas >= 2));
  const grandes = filtrar(imoveis, f({ areaMin: 500 }));
  assert.ok(grandes.length > 0 && grandes.every((i) => areaPrincipal(i)[0] >= 500));
});

test('imóvel sem quartos informados não aparece quando há mínimo de quartos', () => {
  assert.ok(!filtrar(imoveis, f({ quartos: 1 })).some((i) => i.quartos == null));
});

test('busca digitada encontra por bairro, condomínio, tipo ou código', () => {
  assert.deepEqual(ids(filtrar(imoveis, f({ busca: 'sitio do engenho' }))), ['CI-008']);
  assert.deepEqual(ids(filtrar(imoveis, f({ busca: 'altos da castelo' }))), ['CI-002']);
  assert.deepEqual(ids(filtrar(imoveis, f({ busca: 'chácara' }))), esperado((i) => i.tipo === 'chacara'));
  assert.deepEqual(ids(filtrar(imoveis, f({ busca: 'ci-005' }))), ['CI-005']);
});

test('nenhum resultado quando os critérios não batem', () => {
  assert.equal(filtrar(imoveis, f({ tipo: 'chacara', precoMin: 500000 })).length, 0);
});

test('ordenação por preço deixa "sob consulta" no fim', () => {
  const menor = ordenar(imoveis, 'menor-preco');
  const maior = ordenar(imoveis, 'maior-preco');
  const comPreco = (l) => l.filter((i) => i.preco != null).map((i) => i.preco);
  assert.deepEqual(comPreco(menor), [...comPreco(menor)].sort((a, b) => a - b));
  assert.deepEqual(comPreco(maior), [...comPreco(maior)].sort((a, b) => b - a));
  const n = comPreco(menor).length;
  assert.ok(menor.slice(n).every((i) => i.preco == null));
  assert.ok(maior.slice(n).every((i) => i.preco == null));
});

test('ordenação por data (datas dos posts do Instagram)', () => {
  assert.equal(temDatasConfiaveis(imoveis), true);
  const lista = ordenar(imoveis, 'recentes');
  const datas = lista.map((i) => i.dataPublicacao).filter(Boolean);
  assert.deepEqual(datas, [...datas].sort().reverse());
  // imóveis sem data ficam no fim
  assert.ok(lista.slice(datas.length).every((i) => !i.dataPublicacao));
});

test('opções de localização vêm dos imóveis cadastrados', () => {
  const o = opcoesLocalizacao(imoveis);
  assert.deepEqual(o.cidades, ['Araçariguama']);
  assert.ok(o.bairrosPorCidade['Araçariguama'].includes('Condomínio Altos da Castelo'));
});

test('faixa de preço ignora imóveis sem preço', () => {
  assert.deepEqual(faixaPreco(imoveis), { min: 345000, max: 790000 });
});

test('preço "sob consulta" e valores digitados', () => {
  assert.equal(precoAnuncio({ preco: null, finalidade: 'venda' }), 'Valor sob consulta');
  assert.equal(lerValorMonetario('R$ 300.000'), 300000);
  assert.equal(lerValorMonetario('350 mil'), 350000);
  assert.equal(lerValorMonetario(''), null);
  assert.match(formatarPreco(450000), /R\$\s?450\.000/);
});

test('filtros vão e voltam da URL sem perda', () => {
  const orig = f({ bairro: 'Jardim Bela Vista', precoMin: 300000, quartos: 2, suites: 1, tipo: 'casa' });
  const { filtros, ordem } = filtrosDaQuery(filtrosParaQuery(orig, 'menor-preco'));
  assert.deepEqual(filtros, orig);
  assert.equal(ordem, 'menor-preco');
});

test('dados não inventados: só há preço quando a fonte foi registrada', () => {
  for (const i of imoveis) {
    if (i.preco != null) assert.ok(i.precoFonte, `${i.id} tem preço sem fonte`);
    assert.ok(i.fonte?.posts?.length || i.fonte?.observacao, `${i.id} sem origem registrada`);
    assert.equal(i.endereco, null, `${i.id}: endereço só com confirmação do corretor`);
  }
});
