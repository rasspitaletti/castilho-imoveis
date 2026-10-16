// Seções da página inicial.
import { site } from '../dados/site.js';
import { oportunidades } from '../dados/imoveis.js';
import { esc, precoAnuncio, rotuloTipo, localizacaoTexto, formatarNumero, plural, formatarPreco, areaPrincipal } from '../lib/formatar.js';
import { linkWhatsApp, linkTelefone, linkInstagram, linkEmail, linkWhatsAppImovel } from '../lib/contato.js';
import {
  opcoesLocalizacao, tiposDisponiveis, finalidadesDisponiveis, faixaPreco, temDatasConfiaveis, ORDENACOES, ordenar,
} from '../lib/filtros.js';
import { icone, iconeWhatsApp, iconeInstagram } from './icones.js';
import { cardImovel, urlPaginaImovel, selos, imagem, seloFoto } from './imovel.js';
import { fotoHero, fotoInstitucional, capaDoImovel, usaIlustrativas } from '../lib/fotos.js';

const rotuloSecao = (texto) => `<p class="rotulo">${esc(texto)}</p>`;

/** Um filtro só aparece quando pelo menos 40% dos imóveis têm aquele dado. */
export const temDadosSuficientes = (imoveis, campo) =>
  imoveis.length > 0 && imoveis.filter((i) => i[campo] != null && i[campo] !== 0).length / imoveis.length >= 0.4;

// ---------- HERO ----------
// Layout em fluxo (grid): marca, título e cards ocupam linhas próprias e nunca se sobrepõem,
// em qualquer largura ou altura de janela.
export function hero(imoveis) {
  const comPreco = imoveis.filter((i) => i.preco != null).map((i) => i.preco);
  const menor = comPreco.length ? Math.min(...comPreco) : null;
  const fundo = fotoHero();
  const c = site.corretor;
  return `<section class="hero" id="inicio" aria-labelledby="hero-titulo">
  <div class="hero__moldura">
    ${imagem(fundo, { classe: 'hero__img', prioridade: true, sizes: '100vw', alt: fundo.alt, largura: fundo.largura || 1600, altura: fundo.altura || 1067 })}
    <div class="hero__veu" aria-hidden="true"></div>

    <div class="hero__topo">
      <p class="hero__marca" aria-hidden="true">${esc(site.nomeCurto.toUpperCase())}</p>
      <div class="hero__linha">
        <p class="hero__submarca">${esc(site.slogan)}</p>
        <a class="hero__insta vidro" href="${linkInstagram()}" target="_blank" rel="noopener">${iconeInstagram()} @${esc(site.contato.instagramUsuario)}</a>
      </div>
    </div>

    <div class="hero__base">
      <div class="hero__texto">
        <h1 id="hero-titulo">Encontre o imóvel ideal para o seu próximo capítulo.</h1>
        <p>${esc(c.especialidade || 'Imóveis selecionados pelo corretor')}, com atendimento direto pelo WhatsApp.</p>
        <div class="hero__acoes">
          <a class="btn btn--claro btn--seta btn--brilho" href="#buscar">Encontrar meu imóvel <span class="btn__circulo">${icone('busca')}</span></a>
          <a class="btn btn--vidro" href="#imoveis">Explorar imóveis</a>
          <a class="btn btn--vidro" href="${linkWhatsApp()}" target="_blank" rel="noopener">${iconeWhatsApp()} Falar com o corretor</a>
        </div>
      </div>

      <aside class="hero__lateral" aria-label="Corretor responsável e resumo do catálogo">
        <a class="hero__responsavel vidro" href="#sobre">
          ${c.fotoAvatar ? `<img src="${esc(c.fotoAvatar)}" alt="" width="80" height="80">` : ''}
          <span>
            <small>Responsável</small>
            <strong>${esc(c.nome || 'Corretor Castilho')}</strong>
            <em>${esc(c.formacao || site.contato.regiaoAtendimento || '')}</em>
          </span>
        </a>
        <ul class="hero__cards">
          <li class="vidro"><strong>${imoveis.length}</strong><span>${imoveis.length === 1 ? 'imóvel' : 'imóveis'} à venda</span></li>
          ${menor ? `<li class="vidro"><strong class="num">${esc(formatarPreco(menor).replace(/\.000$/, ' mil'))}</strong><span>a partir de</span></li>` : ''}
        </ul>
      </aside>
    </div>
    ${fundo.ilustrativa ? '<span class="hero__credito">Foto ilustrativa</span>' : ''}
  </div>
</section>`;
}

// ---------- BUSCA / FILTROS ----------
function opcoes(lista, rotulo = (v) => v, vazio = null) {
  return (vazio ? `<option value="">${vazio}</option>` : '') + lista.map((v) => `<option value="${esc(v)}">${esc(rotulo(v))}</option>`).join('');
}

function grupoMinimo(nome, legenda, max) {
  const vals = [0, ...Array.from({ length: max }, (_, i) => i + 1)];
  return `<fieldset class="campo campo--segmentos">
    <legend>${legenda}</legend>
    <div class="segmentos">
      ${vals.map((v) => `<label><input type="radio" name="${nome}" value="${v}"${v === 0 ? ' checked' : ''}><span>${v === 0 ? 'Todos' : `${v}+`}</span></label>`).join('')}
    </div>
  </fieldset>`;
}

export function buscaFiltros(imoveis) {
  const { cidades, bairrosPorCidade, regioes } = opcoesLocalizacao(imoveis);
  const tipos = tiposDisponiveis(imoveis);
  const finalidades = finalidadesDisponiveis(imoveis);
  const faixa = faixaPreco(imoveis);
  const sugestoes = [...new Set([...cidades, ...regioes, ...Object.values(bairrosPorCidade).flat()])];
  const temArea = imoveis.some((i) => areaPrincipal(i)[0]);
  const variasCidades = cidades.length > 1;
  const temBairros = Object.values(bairrosPorCidade).flat().length > 0;
  const minimos = [
    ['quartos', 'Quartos', 4],
    ['suites', 'Suítes', 3],
    ['banheiros', 'Banheiros', 3],
    ['vagas', 'Vagas de garagem', 3],
  ].filter(([campo]) => temDadosSuficientes(imoveis, campo));

  return `<section class="busca" id="buscar" aria-labelledby="busca-titulo">
  <form class="busca__painel vidro vidro--forte" data-busca novalidate role="search">
    <div class="busca__topo">
      <div>
        ${rotuloSecao('Encontrar imóveis')}
        <h2 id="busca-titulo">Busque por bairro, condomínio e orçamento</h2>
      </div>
      ${finalidades.length > 1 ? `<fieldset class="finalidade" aria-label="Finalidade">
        <label><input type="radio" name="finalidade" value="" checked><span>Todos</span></label>
        <label><input type="radio" name="finalidade" value="venda"><span>Comprar</span></label>
        <label><input type="radio" name="finalidade" value="aluguel"><span>Alugar</span></label>
      </fieldset>` : `<input type="hidden" name="finalidade" value="">`}
    </div>

    <div class="busca__principal${variasCidades ? ' busca__principal--cidades' : ''}">
      <div class="campo campo--busca">
        <label for="f-busca">Localização ou palavra-chave</label>
        <div class="campo__icone">${icone('busca')}
          <input id="f-busca" name="busca" type="search" list="lista-locais" placeholder="Bairro, condomínio ou tipo" autocomplete="off" spellcheck="false" enterkeyhint="search">
        </div>
        <datalist id="lista-locais">${sugestoes.map((s) => `<option value="${esc(s)}">`).join('')}</datalist>
      </div>
      ${variasCidades ? `<div class="campo">
        <label for="f-cidade">Cidade</label>
        <select id="f-cidade" name="cidade" data-vidro-select>${opcoes(cidades, undefined, 'Todas as cidades')}</select>
      </div>` : `<input type="hidden" id="f-cidade" name="cidade" value="">`}
      ${temBairros ? `<div class="campo">
        <label for="f-bairro">Bairro ou condomínio</label>
        <select id="f-bairro" name="bairro" data-vidro-select>
          <option value="">Todos</option>
          ${cidades.map((c) => (bairrosPorCidade[c].length ? (variasCidades ? `<optgroup label="${esc(c)}">${opcoes(bairrosPorCidade[c])}</optgroup>` : opcoes(bairrosPorCidade[c])) : '')).join('')}
        </select>
      </div>` : `<input type="hidden" id="f-bairro" name="bairro" value="">`}
      <div class="campo">
        <label for="f-preco-min">Preço mínimo</label>
        <input id="f-preco-min" name="precoMin" type="text" inputmode="numeric" placeholder="Sem mínimo" autocomplete="off" data-moeda>
      </div>
      <div class="campo">
        <label for="f-preco-max">Preço máximo</label>
        <input id="f-preco-max" name="precoMax" type="text" inputmode="numeric" placeholder="Sem máximo" autocomplete="off" data-moeda>
      </div>
    </div>

    <div class="busca__linha">
      ${regioes.length > 1 ? `<fieldset class="campo campo--regioes">
        <legend>Regiões <small>(escolha uma ou mais)</small></legend>
        <div class="chips">${regioes.map((r) => `<label class="chip"><input type="checkbox" name="regioes" value="${esc(r)}"><span>${esc(r)}</span></label>`).join('')}</div>
      </fieldset>` : `<p class="busca__nota">${icone('info')}<span>Imóveis com <strong>valor sob consulta</strong> não entram na busca por faixa de preço — fale com o corretor para saber os valores.</span></p>`}
      <div class="campo campo--faixa" data-faixa data-min="${faixa.min}" data-max="${faixa.max}">
        <span class="campo__legenda" id="faixa-rotulo">Faixa de preço</span>
        <div class="faixa" aria-labelledby="faixa-rotulo">
          <div class="faixa__trilho"><div class="faixa__ativo" data-faixa-ativo></div></div>
          <input type="range" aria-label="Preço mínimo" data-faixa-min min="${faixa.min}" max="${faixa.max}" value="${faixa.min}">
          <input type="range" aria-label="Preço máximo" data-faixa-max min="${faixa.min}" max="${faixa.max}" value="${faixa.max}">
        </div>
        <p class="faixa__valores num" data-faixa-texto>Sem mínimo — Sem máximo</p>
      </div>
    </div>

    <details class="busca__mais" data-mais-filtros>
      <summary>${icone('filtro')} Mais filtros <span class="busca__mais-contagem" data-mais-contagem></span>${icone('chevronBaixo', 'busca__mais-seta')}</summary>
      <div class="busca__mais-grade">
        <div class="campo">
          <label for="f-tipo">Tipo de imóvel</label>
          <select id="f-tipo" name="tipo" data-vidro-select>${opcoes(tipos, rotuloTipo, 'Todos os tipos')}</select>
        </div>
        ${minimos.map(([campo, legenda, max]) => grupoMinimo(campo, legenda, max)).join('')}
        ${temArea ? `<div class="campo">
          <label for="f-area">Área mínima (m²)</label>
          <input id="f-area" name="areaMin" type="number" inputmode="numeric" min="0" step="10" placeholder="Ex.: 100">
        </div>` : ''}
      </div>
    </details>

    <div class="busca__acoes">
      <p class="busca__aviso" data-busca-aviso aria-live="polite"></p>
      <button class="btn btn--texto" type="reset" data-limpar>${icone('fechar')} Limpar filtros</button>
      <button class="btn btn--claro btn--seta btn--brilho" type="submit">Buscar imóveis <span class="btn__circulo">${icone('busca')}</span></button>
    </div>
  </form>
</section>`;
}

// ---------- CATÁLOGO ----------
export function catalogo(imoveis) {
  const ordenados = ordenar(imoveis, 'relevancia');
  const primeiros = ordenados.slice(0, site.imoveisPorPagina);
  const ordens = Object.entries(ORDENACOES).filter(([k]) => k !== 'recentes' || temDatasConfiaveis(imoveis));
  const temDemo = imoveis.some((i) => i.demo);
  return `<section class="secao catalogo" id="imoveis" aria-labelledby="catalogo-titulo">
  <div class="secao__cabeca">
    <div>
      ${rotuloSecao('Catálogo')}
      <h2 id="catalogo-titulo">Imóveis disponíveis</h2>
      <p class="catalogo__contagem" data-contagem aria-live="polite">${plural(imoveis.length, 'imóvel encontrado', 'imóveis encontrados')}</p>
    </div>
    <div class="catalogo__ordem campo">
      <label for="f-ordem">Ordenar por</label>
      <select id="f-ordem" data-ordem data-vidro-select>${ordens.map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>
    </div>
  </div>
  <div class="chips-ativos" data-chips hidden></div>
  ${temDemo ? `<p class="aviso-demo">${icone('info')}<span><strong>Imóveis de demonstração.</strong> Os anúncios com o selo “Demonstração” são exemplos fictícios.</span></p>` : ''}
  <div class="grade" data-grade>
    ${primeiros.map((i) => cardImovel(i)).join('')}
  </div>
  <div class="vazio vidro" data-vazio hidden>
    <span class="vazio__icone">${icone('busca')}</span>
    <h3>Nenhum imóvel com esses critérios — por enquanto.</h3>
    <p>Tente ampliar a faixa de preço ou remover algum filtro. Vários imóveis têm valor sob consulta; conte ao corretor o que você procura e ele indica as opções disponíveis.</p>
    <div class="vazio__acoes">
      <button class="btn btn--vidro" type="button" data-limpar-vazio>Limpar filtros</button>
      <a class="btn btn--whats" href="${linkWhatsApp('Olá! Não encontrei no site um imóvel com o perfil que procuro. Pode me ajudar?')}" target="_blank" rel="noopener">${iconeWhatsApp()} Contar o que procuro</a>
    </div>
  </div>
  <div class="catalogo__mais">
    <button class="btn btn--vidro btn--seta" type="button" data-carregar${ordenados.length <= site.imoveisPorPagina ? ' hidden' : ''}>Carregar mais imóveis <span class="btn__circulo">${icone('chevronBaixo')}</span></button>
  </div>
  <dialog class="rapida vidro vidro--forte" data-rapida aria-labelledby="rapida-titulo"></dialog>
</section>`;
}

// ---------- DESTAQUES (faixa de fotos verticais) ----------
export function destaques(imoveis) {
  const lista = [...imoveis.filter((i) => i.destaque), ...imoveis.filter((i) => !i.destaque)].filter((i) => capaDoImovel(i)).slice(0, 4);
  if (!lista.length) return '';
  return `<section class="secao destaques" aria-labelledby="destaques-titulo">
  <div class="secao__cabeca">
    <div>
      ${rotuloSecao('Seleção do corretor')}
      <h2 id="destaques-titulo">Imóveis que merecem<br>a sua visita.</h2>
    </div>
    <a class="btn btn--vidro btn--seta btn--pequeno" href="#imoveis">Ver todos os imóveis <span class="btn__circulo">${icone('seta')}</span></a>
  </div>
  <div class="destaques__faixa">
    ${lista.map((i) => `<a class="destaques__item" href="${urlPaginaImovel(i)}">
      ${imagem(capaDoImovel(i), { sizes: '(max-width: 900px) 70vw, 25vw' })}
      ${seloFoto(capaDoImovel(i), 'selo-foto--topo')}
      <span class="destaques__info vidro">
        <small>${esc(rotuloTipo(i.tipo))} · ${esc(i.condominio || i.bairro || i.cidade)}</small>
        <strong>${esc(i.titulo)}</strong>
        <span class="num">${esc(precoAnuncio(i))}</span>
      </span>
    </a>`).join('')}
  </div>
</section>`;
}

// ---------- CATEGORIAS ----------
const ICONE_TIPO = { casa: 'casa', sobrado: 'casa', 'casa-condominio': 'escudo', apartamento: 'predio', cobertura: 'predio', studio: 'predio', chacara: 'arvore', terreno: 'terreno', comercial: 'loja' };

export function categorias(imoveis) {
  const tipos = tiposDisponiveis(imoveis);
  if (tipos.length < 2) return '';
  return `<section class="secao categorias" aria-labelledby="categorias-titulo">
  <div class="categorias__texto">
    ${rotuloSecao('Categorias')}
    <h2 id="categorias-titulo">Da casa no condomínio<br>à chácara no verde.</h2>
  </div>
  <ul class="categorias__lista">
    ${tipos.map((t) => {
      const n = imoveis.filter((i) => i.tipo === t).length;
      return `<li><a class="categoria vidro" href="/?tipo=${encodeURIComponent(t)}#imoveis" data-filtro-link="tipo=${encodeURIComponent(t)}">
        ${icone(ICONE_TIPO[t] || 'casa')}
        <strong>${esc(rotuloTipo(t))}</strong>
        <span>${plural(n, 'imóvel', 'imóveis')}</span>
        <span class="categoria__seta">${icone('seta')}</span>
      </a></li>`;
    }).join('')}
  </ul>
</section>`;
}

// ---------- OPORTUNIDADES (lotes e casas novas citados pelo corretor) ----------
export function secaoOportunidades() {
  if (!oportunidades?.itens?.length) return '';
  return `<section class="secao oportunidades" aria-labelledby="oport-titulo">
  <div class="oportunidades__texto">
    ${rotuloSecao('Oportunidades em condomínio')}
    <h2 id="oport-titulo">Lotes e casas novas<br>em condomínio fechado.</h2>
    <p>Na expansão residencial de Araçariguama, com natureza, tranquilidade e acesso pela Castello Branco. Valores divulgados pelo corretor; consulte disponibilidade.</p>
  </div>
  <ul class="oportunidades__lista">
    ${oportunidades.itens.map((o) => `<li class="oportunidade vidro">
      <span class="oportunidade__prefixo">${esc(o.prefixo)}</span>
      <strong class="num">${esc(formatarPreco(o.preco))}</strong>
      <span class="oportunidade__titulo">${esc(o.titulo)}</span>
      <small>${esc(o.detalhe)}</small>
      <a class="oportunidade__link" href="${esc(linkWhatsApp(`Olá! Vi no site da ${site.nome} a oportunidade "${o.titulo}" a partir de ${formatarPreco(o.preco)} e gostaria de mais informações.`))}" target="_blank" rel="noopener">${iconeWhatsApp()} Quero saber mais</a>
    </li>`).join('')}
  </ul>
</section>`;
}

// ---------- IMÓVEL EM DESTAQUE ----------
export function imovelEmDestaque(imoveis) {
  const i = imoveis.find((x) => x.destaque && x.preco != null) || imoveis.find((x) => x.destaque) || imoveis[0];
  if (!i) return '';
  const primeiroParagrafo = (i.descricao || '').split('\n\n')[0];
  const [area, rotuloArea] = areaPrincipal(i);
  return `<section class="secao em-destaque" aria-labelledby="em-destaque-titulo">
  <a class="em-destaque__midia" href="${urlPaginaImovel(i)}" tabindex="-1" aria-hidden="true">
    ${imagem(capaDoImovel(i), { alt: '', sizes: '(max-width: 900px) 100vw, 40vw' })}
    ${selos(i, { destaque: false })}
    ${seloFoto(capaDoImovel(i))}
  </a>
  <div class="em-destaque__texto vidro">
    ${rotuloSecao('Imóvel em destaque')}
    <h2 id="em-destaque-titulo">${esc(i.titulo)}</h2>
    <p>${esc(primeiroParagrafo)}</p>
    <ul class="lista-info">
      <li>${icone('pin')} ${esc(localizacaoTexto(i))}</li>
      <li>${icone('casa')} ${esc(rotuloTipo(i.tipo))}</li>
      ${area ? `<li>${icone('area')} ${formatarNumero(area)} m² ${esc(rotuloArea)}</li>` : ''}
      <li class="num">${icone('chave')} ${esc(precoAnuncio(i))}</li>
    </ul>
    <div class="em-destaque__acoes">
      <a class="btn btn--vidro btn--seta btn--pequeno" href="${urlPaginaImovel(i)}">Ver imóvel <span class="btn__circulo">${icone('seta')}</span></a>
      <a class="btn btn--whats btn--pequeno" href="${esc(linkWhatsAppImovel(i, 'visita'))}" target="_blank" rel="noopener">${iconeWhatsApp()} Agendar visita</a>
    </div>
  </div>
</section>`;
}

// ---------- SOBRE O CORRETOR ----------
export function sobre(imoveis) {
  const c = site.corretor;
  const textoPadrao =
    'O Corretor Castilho atua com casas, terrenos e chácaras em Araçariguama-SP, cidade às margens da Rodovia Castello Branco que reúne natureza, tranquilidade e acesso rápido a Barueri e Osasco. O atendimento é feito diretamente com ele, do primeiro contato à visita e à negociação.';
  const pilares = [
    ['escudo', 'Compra segura', c.formacao ? `${c.formacao}: orientação sobre documentação e contrato.` : 'Orientação sobre documentação e contrato.'],
    ['conversa', 'Atendimento direto', 'Você fala com o corretor pelo WhatsApp ou telefone, sem intermediários.'],
    ['chave', 'Financiamento', 'Vários imóveis do catálogo aceitam financiamento bancário.'],
  ];
  const fotoImovel = imoveis.find((i) => i.slug === 'chacara-1810-m2-piscina')?.imagens?.[0] || imoveis[0]?.imagens?.[0];
  const foto = c.foto
    ? imagem({ src: c.foto, foco: '50% 22%' }, { alt: `${c.nome || 'Corretor Castilho'}, responsável pela ${site.nome}`, sizes: '(max-width: 900px) 100vw, 40vw', largura: 1023, altura: 1530 })
    : imagem(fotoImovel, { alt: 'Corretor Castilho apresentando a área gourmet de uma chácara à venda', sizes: '(max-width: 900px) 100vw, 40vw' });
  return `<section class="secao sobre" id="sobre" aria-labelledby="sobre-titulo">
  <div class="sobre__midia">
    ${foto}
    <a class="sobre__selo vidro vidro--forte" href="${linkInstagram()}" target="_blank" rel="noopener">
      ${iconeInstagram()}
      <span><strong>@${esc(site.contato.instagramUsuario)}</strong><small>Tour em vídeo dos imóveis no Instagram</small></span>
    </a>
  </div>
  <div class="sobre__texto">
    ${rotuloSecao('Sobre o corretor')}
    <h2 id="sobre-titulo">Seu imóvel ideal,<br>de forma segura.</h2>
    <p class="sobre__nome">${esc(c.nome || 'Corretor Castilho')} <span>· Responsável pela ${esc(site.nome)}${c.creci ? ` · ${esc(c.creci)}` : ''}</span></p>
    <p>${esc(c.apresentacao || textoPadrao)}</p>
    <ul class="pilares">
      ${pilares.map(([ic, t, d]) => `<li class="vidro">${icone(ic)}<strong>${t}</strong><span>${esc(d)}</span></li>`).join('')}
    </ul>
    <a class="btn btn--vidro btn--seta btn--pequeno" href="${linkWhatsApp()}" target="_blank" rel="noopener">Falar com o corretor <span class="btn__circulo">${icone('seta')}</span></a>
  </div>
</section>`;
}

export function comoFunciona() {
  const passos = [
    ['busca', 'Escolha no catálogo', 'Filtre por bairro, condomínio, faixa de preço e características até encontrar os imóveis que combinam com você.'],
    ['conversa', 'Converse pelo WhatsApp', 'Cada imóvel tem um botão que já envia ao corretor qual anúncio você viu.'],
    ['calendario', 'Agende a visita', 'Combine o melhor dia e horário e conheça o imóvel pessoalmente.'],
  ];
  return `<section class="secao como" aria-labelledby="como-titulo">
  <div class="como__texto">
    ${rotuloSecao('Como funciona')}
    <h2 id="como-titulo">Do clique à visita,<br>sem complicação.</h2>
  </div>
  <ol class="como__passos">
    ${passos.map(([ic, t, d], n) => `<li class="vidro"><span class="como__num">0${n + 1}</span>${icone(ic)}<strong>${t}</strong><p>${d}</p></li>`).join('')}
  </ol>
</section>`;
}

// ---------- CONTATO ----------
export function contato(imoveis) {
  const c = site.contato;
  const email = linkEmail();
  const fundo = fotoInstitucional('contato') || imoveis.find((i) => i.slug === 'casa-ofuro-jardim-bela-vista')?.imagens?.[0];
  return `<section class="contato" id="contato" aria-labelledby="contato-titulo">
  ${fundo ? imagem(fundo, { alt: '', classe: 'contato__fundo', sizes: '100vw' }) : ''}
  <div class="contato__painel vidro vidro--forte">
    <div class="contato__texto">
      ${rotuloSecao('Contato')}
      ${site.corretor.fotoAvatar ? `<div class="contato__corretor"><img src="${esc(site.corretor.fotoAvatar)}" alt="" width="56" height="56"><span><strong>${esc(site.corretor.nome || 'Corretor Castilho')}</strong><small>Responsável pelo atendimento</small></span></div>` : ''}
      <h2 id="contato-titulo">Vamos encontrar o seu<br>próximo imóvel juntos.</h2>
      <p>Fale com o corretor para tirar dúvidas, pedir mais fotos e vídeos ou agendar uma visita.</p>
      <a class="btn btn--whats btn--seta" href="${linkWhatsApp()}" target="_blank" rel="noopener">${iconeWhatsApp()} Falar no WhatsApp <span class="btn__circulo">${icone('seta')}</span></a>
    </div>
    <ul class="contato__itens">
      <li><a href="${linkTelefone()}">${icone('telefone')}<span><strong class="num">${esc(c.telefoneExibicao)}</strong><small>Ligar agora</small></span></a></li>
      <li><a href="${linkWhatsApp()}" target="_blank" rel="noopener">${iconeWhatsApp()}<span><strong>WhatsApp</strong><small>Mensagem direta</small></span></a></li>
      <li><a href="${linkInstagram()}" target="_blank" rel="noopener">${iconeInstagram()}<span><strong>@${esc(c.instagramUsuario)}</strong><small>Instagram</small></span></a></li>
      ${email ? `<li><a href="${email}">${icone('email')}<span><strong>${esc(c.email)}</strong><small>E-mail</small></span></a></li>` : ''}
      ${c.regiaoAtendimento ? `<li><span class="contato__item">${icone('pin')}<span><strong>${esc(c.regiaoAtendimento)}</strong><small>Região de atuação</small></span></span></li>` : ''}
      ${c.horario ? `<li><span class="contato__item">${icone('relogio')}<span><strong>${esc(c.horario)}</strong><small>Horário</small></span></span></li>` : ''}
    </ul>
  </div>
</section>`;
}
