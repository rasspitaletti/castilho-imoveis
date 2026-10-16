// EXTRAI CAPTURAS (FRAMES) DOS VÍDEOS DOS IMÓVEIS
// --------------------------------------------------
// 1. Baixe os vídeos/Reels de cada imóvel e coloque em  midia/videos/
//    nomeando o arquivo com o slug do imóvel. Ex.:
//      midia/videos/casa-jardim-das-flores.mp4
//    (vários vídeos do mesmo imóvel: casa-jardim-das-flores-2.mp4 etc.)
// 2. Rode:  npm run frames            (12 capturas por vídeo)
//           npm run frames -- 20      (20 capturas por vídeo)
// 3. As imagens vão para  public/imagens/imoveis/<slug>/  em JPG otimizado.
//    Escolha as melhores (fachada, sala, cozinha, quartos, área externa…),
//    apague as ruins e copie o trecho `imagens: [...]` exibido no final
//    para o imóvel em src/dados/imoveis.js.
//
// Requer o FFmpeg instalado (https://ffmpeg.org/download.html — no Windows:
// `winget install ffmpeg`; no Mac: `brew install ffmpeg`).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { basename, extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const pastaVideos = join(raiz, 'midia', 'videos');
const pastaSaida = join(raiz, 'public', 'imagens', 'imoveis');
const quantidade = Math.max(1, Number(process.argv[2]) || 12);

const temFfmpeg = spawnSync('ffmpeg', ['-version']).status === 0 && spawnSync('ffprobe', ['-version']).status === 0;
if (!temFfmpeg) {
  console.error('✖ FFmpeg não encontrado. Instale-o e rode novamente (veja as instruções no topo deste arquivo).');
  process.exit(1);
}
if (!existsSync(pastaVideos)) mkdirSync(pastaVideos, { recursive: true });

const videos = readdirSync(pastaVideos).filter((f) => /\.(mp4|mov|m4v|webm|mkv)$/i.test(f));
if (!videos.length) {
  console.log('Nenhum vídeo em midia/videos/. Coloque os vídeos lá (nomeados pelo slug do imóvel) e rode de novo.');
  process.exit(0);
}

const resumo = {};
for (const arquivo of videos) {
  const nome = basename(arquivo, extname(arquivo));
  const slug = nome.replace(/-\d+$/, ''); // "casa-x-2" → "casa-x"
  const entrada = join(pastaVideos, arquivo);
  const destino = join(pastaSaida, slug);
  mkdirSync(destino, { recursive: true });

  const sonda = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', entrada], { encoding: 'utf8' });
  const duracao = parseFloat(sonda.stdout);
  if (!duracao) {
    console.warn(`⚠ Não foi possível ler a duração de ${arquivo}; pulando.`);
    continue;
  }

  console.log(`▶ ${arquivo} (${duracao.toFixed(1)} s) → ${quantidade} capturas`);
  resumo[slug] ??= [];
  for (let i = 0; i < quantidade; i++) {
    // pontos distribuídos entre 5% e 95% do vídeo (evita telas de abertura/fim)
    const t = duracao * (0.05 + (0.9 * i) / Math.max(1, quantidade - 1));
    const saida = join(destino, `${nome}-frame-${String(i + 1).padStart(2, '0')}.jpg`);
    const r = spawnSync('ffmpeg', [
      '-y', '-loglevel', 'error', '-ss', t.toFixed(2), '-i', entrada, '-frames:v', '1',
      // até 1600 px de largura (mantém vertical/horizontal), boa nitidez e arquivo leve
      '-vf', "scale='min(1600,iw)':-2:flags=lanczos,unsharp=5:5:0.4",
      '-q:v', '3', saida,
    ]);
    if (r.status === 0) resumo[slug].push(`/imagens/imoveis/${slug}/${basename(saida)}`);
  }
}

console.log('\n✔ Capturas geradas. Escolha as melhores, apague as ruins, rode `npm run fotos` e use no cadastro (src/dados/imoveis.js):\n');
for (const [slug, arquivos] of Object.entries(resumo)) {
  console.log(`// ${slug}`);
  console.log('imagens: [');
  for (const a of arquivos) console.log(`  { src: '${a}', alt: 'DESCREVA A FOTO (ex.: Sala de estar com varanda)', foco: '50% 50%' },`);
  console.log('],\n');
}
