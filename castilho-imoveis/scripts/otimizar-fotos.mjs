// OTIMIZA AS FOTOS DOS IMÓVEIS
// -----------------------------
// Para cada .jpg/.jpeg/.png em public/imagens/imoveis/ (e subpastas):
//   - limita o arquivo original a 1600 px de largura (JPG progressivo, qualidade ~82)
//   - cria <nome>.webp (mesmo tamanho) e <nome>-480.webp (para celulares e cards)
// Fotos já otimizadas são puladas (a menos que o original seja mais novo).
// O build detecta as versões .webp e passa a usá-las automaticamente.
//
// Uso:  npm run fotos
// Requer FFmpeg (Windows: `winget install ffmpeg` · Mac: `brew install ffmpeg`).
import { spawnSync } from 'node:child_process';
import { readdirSync, statSync, existsSync, renameSync, rmSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const pasta = join(raiz, 'public', 'imagens');

if (spawnSync('ffmpeg', ['-version']).status !== 0) {
  console.error('✖ FFmpeg não encontrado. Instale-o e rode novamente (veja o topo deste arquivo).');
  process.exit(1);
}

const arquivos = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivos(p) : /\.(jpe?g|png)$/i.test(n) ? [p] : [];
  });

const ffmpeg = (args) => spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' }).status === 0;
const maisNovo = (a, b) => !existsSync(b) || statSync(a).mtimeMs > statSync(b).mtimeMs;

let feitas = 0;
for (const original of arquivos(pasta)) {
  const base = original.slice(0, -extname(original).length);
  const webp = `${base}.webp`;
  const webp480 = `${base}-480.webp`;
  if (!maisNovo(original, webp) && !maisNovo(original, webp480)) continue;

  // 1) original com no máximo 1600 px de largura
  const temp = `${base}.tmp${extname(original)}`;
  if (ffmpeg(['-i', original, '-vf', "scale='min(1600,iw)':-2:flags=lanczos", '-q:v', '3', temp])) {
    renameSync(temp, original);
  } else rmSync(temp, { force: true });

  // 2) versões WebP
  const ok1 = ffmpeg(['-i', original, '-c:v', 'libwebp', '-quality', '80', '-compression_level', '6', webp]);
  const ok2 = ffmpeg(['-i', original, '-vf', 'scale=480:-2:flags=lanczos', '-c:v', 'libwebp', '-quality', '78', '-compression_level', '6', webp480]);
  if (ok1 && ok2) {
    feitas++;
    console.log(`✔ ${original.replace(raiz, '').replace(/\\/g, '/')}`);
  } else {
    console.warn(`⚠ Falha ao converter ${original} (seu FFmpeg tem suporte a WebP/libwebp?)`);
  }
}
console.log(feitas ? `\n${feitas} foto(s) otimizada(s). Rode npm run build ou npm run dev.` : 'Nenhuma foto nova para otimizar.');
