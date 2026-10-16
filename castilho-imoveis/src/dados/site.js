/**
 * CONFIGURAÇÃO CENTRAL DO SITE — Castilho Imóveis
 * ------------------------------------------------
 * Todos os dados de contato e institucionais ficam AQUI.
 * Os componentes leem deste arquivo; nunca repita estes dados em outro lugar.
 *
 * Campos com valor `null` ainda não foram fornecidos/confirmados.
 * Enquanto estiverem `null`, o site simplesmente não os exibe.
 */
export const site = {
  nome: 'Castilho Imóveis',
  nomeCurto: 'Castilho',
  slogan: 'Imóveis · Araçariguama',

  // Endereço público do site (ex.: 'https://www.castilhoimoveis.com.br').
  // Usado em SEO (canonical, sitemap, Open Graph) e no link enviado pelo WhatsApp.
  // Deixe null até o domínio estar definido.
  url: null,

  contato: {
    // Número oficial (WhatsApp e telefone): (11) 94444-4646
    telefoneExibicao: '(11) 94444-4646',
    telefoneE164: '+5511944444646',
    whatsappNumero: '5511944444646', // formato usado pelo wa.me (DDI + DDD + número)
    instagramUsuario: 'corretorcastilho_oficial',
    instagramUrl: 'https://www.instagram.com/corretorcastilho_oficial/',
    email: null, // ex.: 'contato@castilhoimoveis.com.br' — NÃO inventar
    regiaoAtendimento: 'Araçariguama-SP', // conforme a bio do Instagram
    endereco: null, // endereço do escritório, se houver
    horario: null, // ex.: 'Seg. a sex., 9h às 18h · Sáb., 9h às 13h'
  },

  corretor: {
    nome: null, // nome completo — confirmar (enquanto null, o site usa "Corretor Castilho", como ele assina nos posts)
    creci: null, // ex.: 'CRECI-SP 000000-F' — obrigatório em anúncios (Decreto 81.871/78, art. 4º)
    foto: '/imagens/corretor/corretor-castilho.jpg', // foto enviada pelo Raul (responsável)
    fotoAvatar: '/imagens/corretor/corretor-castilho-avatar.jpg', // recorte quadrado para o topo e o contato
    apresentacao: null, // texto próprio do corretor, se ele quiser substituir o texto padrão
    formacao: 'Pós-graduado em Direito Imobiliário', // da bio do Instagram
    especialidade: 'Casas, terrenos e chácaras em Araçariguama-SP', // da bio do Instagram
  },

  // Imagem principal do topo (foto real de um imóvel do catálogo).
  // heroFoco = ponto da foto mantido visível no recorte (CSS object-position).
  heroImagem: '/imagens/institucional/fachada-hero.jpg', // foto enviada pelo Raul (ilustrativa)
  heroImagemAlt: 'Casa moderna com jardim tropical, palmeiras, espreguiçadeiras e piscina',
  heroFoco: '55% 58%',
  heroIlustrativa: true, // mostra o selo "Foto ilustrativa" no topo

  // Mensagem padrão do WhatsApp (botões gerais)
  mensagemPadrao: 'Olá! Vim pelo site da Castilho Imóveis e gostaria de ajuda para encontrar um imóvel.',

  // Quantos imóveis o catálogo mostra antes do botão "Carregar mais"
  imoveisPorPagina: 9,
};
