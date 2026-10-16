/**
 * FOTOS ILUSTRATIVAS TEMPORÁRIAS
 * ==============================
 * Fotografias reais de banco de imagens (Unsplash, licença livre para uso comercial,
 * https://unsplash.com/license), usadas TEMPORARIAMENTE até chegarem fotos boas de
 * cada imóvel. Elas NÃO são dos imóveis anunciados: o site mostra o selo
 * "Foto ilustrativa" em cada uma e mantém na galeria a foto real do Instagram.
 *
 * Para desligar tudo de uma vez:  ATIVAS = false
 * Para trocar uma foto: substitua o id (o trecho depois de "photo-" no endereço do Unsplash).
 */
export const ATIVAS = true;

// Fotos ilustrativas também nos imóveis? false = cards e galerias mostram só as fotos
// reais de cada anúncio (as listas de `porImovel` ficam guardadas para uso futuro).
export const NOS_IMOVEIS = true;

// Monta o endereço da imagem no tamanho pedido (o Unsplash entrega WebP/AVIF automaticamente).
export const urlUnsplash = (id, largura = 1200, altura = null) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=72&w=${largura}${altura ? `&h=${altura}` : ''}`;

const foto = (id, alt, credito) => ({ id, alt, credito, ilustrativa: true });

// Fundo do topo, contato e outras seções institucionais
export const institucionais = {
  // topo: foto enviada pelo Raul (arquivo local, ver site.heroImagem) — por isso fica null aqui
  hero: null,
  contato: foto('1711114378455-b1f479d94a19', 'Casa com piscina e área externa', 'unsplash.com/photos/Tw1dYTSPSpI'),
};

// Por imóvel (chave = slug). A primeira foto vira a capa do card.
export const porImovel = {
  'sobrado-alto-padrao-reserva-aracari': [
    foto('1646987916641-1f3c8992daa2', 'Sala de pé-direito alto', 'unsplash.com/photos/8ccOqbNdp1A'),
    foto('1759147960461-b74a7e9a75d4', 'Cozinha com ilha', 'unsplash.com/photos/kAa2xEs_jZo'),
    foto('1616594039964-ae9021a400a0', 'Suíte com cama estofada', 'unsplash.com/photos/RUvW1KGD9a4'),
  ],
  'casa-ofuro-jardim-bela-vista': [
    foto('1706164971309-fb4785fe6ceb', 'Fachada de casa térrea moderna com caminho de entrada', 'unsplash.com/photos/mmuGuSv208c'),
    foto('1705321963943-de94bb3f0dd3', 'Sala de estar clara e integrada', 'unsplash.com/photos/g_5UyVBIX_k'),
    foto('1643949915134-73a4c880f7c7', 'Cozinha planejada em tons claros', 'unsplash.com/photos/PkepZpGteGQ'),
    foto('1653974123568-b5eff6d851e1', 'Suíte com cama de casal e janela ampla', 'unsplash.com/photos/k6CwSTSuOaw'),
  ],
  'sobrado-mobiliado-altos-da-castelo': [
    foto('1657346088167-b982455bf29a', 'Sobrado moderno de paredes brancas', 'unsplash.com/photos/t4FMbSdmeR0'),
    foto('1724582586529-62622e50c0b3', 'Sala mobiliada com janela ampla', 'unsplash.com/photos/vIbxvHj9m9g'),
    foto('1671197244266-73129c97c096', 'Cozinha com bancada e banquetas', 'unsplash.com/photos/1jy1WNfqHos'),
    foto('1750420556288-d0e32a6f517b', 'Quarto mobiliado em tons neutros', 'unsplash.com/photos/0tVimluL_ls'),
  ],
  'casa-reserva-aracari': [
    foto('1706164971302-e30c0640cc3b', 'Casa térrea moderna com gramado', 'unsplash.com/photos/QlrpgvmdOSU'),
    foto('1724582586458-a51791349977', 'Sala de estar moderna', 'unsplash.com/photos/6ybDmGNE2Yg'),
    foto('1725257928373-dc6d2ac7b145', 'Cozinha integrada à sala de jantar', 'unsplash.com/photos/AgHJm3uKr4U'),
    foto('1642541070065-3912f347e7c6', 'Suíte com cama arrumada', 'unsplash.com/photos/IUTewwzaFeM'),
  ],
  'chacara-1000-m2-lago': [
    foto('1721222205991-d74bcb224330', 'Casa de campo cercada de verde', 'unsplash.com/photos/RcF3AbDcdSc'),
    foto('1672860044506-e3ec09653e82', 'Sala com lareira', 'unsplash.com/photos/qIffpsNK90I'),
    foto('1502005097973-6a7082348e28', 'Cozinha com ilha e porta para o jardim', 'unsplash.com/photos/AQl-J19ocWE'),
  ],
  'chacara-1810-m2-piscina': [
    foto('1711114378532-bab7d55311f3', 'Piscina com espreguiçadeiras', 'unsplash.com/photos/U7riPss-YD0'),
    foto('1564078516393-cf04bd966897', 'Sala de estar com vista para o verde', 'unsplash.com/photos/rEJxpBskj3Q'),
    foto('1560185893-a55cbc8c57e8', 'Quarto amplo', 'unsplash.com/photos/hCU4fimRW-c'),
  ],
  'sobrado-3-suites-piscina-privativa': [
    foto('1696393800648-662c06289a5e', 'Sobrado moderno iluminado à noite', 'unsplash.com/photos/oWdiZ1QPFms'),
    foto('1721222206346-5ec5d31bb58e', 'Piscina no quintal', 'unsplash.com/photos/b_jEYbJirTo'),
    foto('1646987916641-1f3c8992daa2', 'Sala de pé-direito alto', 'unsplash.com/photos/8ccOqbNdp1A'),
    foto('1616594039964-ae9021a400a0', 'Suíte com cama estofada', 'unsplash.com/photos/RUvW1KGD9a4'),
  ],
  'casa-3-quartos-jardim-bela-vista': [
    foto('1767948693674-e96ae5a755c9', 'Casas modernas iluminadas ao entardecer', 'unsplash.com/photos/47115nK33Qc'),
    foto('1637649228998-6c78a67dfa6c', 'Sala integrada à cozinha', 'unsplash.com/photos/PbS9rXhsYIU'),
    foto('1759147960461-b74a7e9a75d4', 'Cozinha com ilha', 'unsplash.com/photos/kAa2xEs_jZo'),
  ],
  'chacara-sitio-do-engenho': [
    foto('1711114377434-5ea6f68ad0c7', 'Casa de campo com piscina', 'unsplash.com/photos/hKREK9tFA0M'),
    foto('1704040686510-b747ff423ebb', 'Sala ampla com janelas', 'unsplash.com/photos/aObxGPf7J1o'),
  ],
};
