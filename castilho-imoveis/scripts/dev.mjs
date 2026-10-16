// Servidor local com reconstrução automática ao salvar arquivos.
// Uso: npm run dev  →  http://localhost:3000
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(raiz, 'dist');
const porta = Number(process.env.PORT) || 3000;
const tipos = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.avif': 'image/avif', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.mp4': 'video/mp4',
};

const construir = () => spawnSync(process.execPath, [join(raiz, 'scripts', 'build.mjs')], { stdio: 'inherit' });
construir();

// Verifica alterações a cada 700 ms (funciona com qualquer editor e sistema operacional)
function assinatura(dir) {
  let total = 0;
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    const st = statSync(p);
    total += st.isDirectory() ? assinatura(p) : st.mtimeMs + st.size;
  }
  return total;
}
const verificar = () => assinatura(join(raiz, 'src')) + assinatura(join(raiz, 'public'));
let ultima = verificar();
setInterval(() => {
  const atual = verificar();
  if (atual !== ultima) {
    ultima = atual;
    construir();
  }
}, 700);

createServer(async (req, res) => {
  try {
    const caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let arquivo = normalize(join(dist, caminho));
    if (!arquivo.startsWith(dist)) throw new Error('fora');
    if ((await stat(arquivo).catch(() => null))?.isDirectory()) arquivo = join(arquivo, 'index.html');
    const dados = await readFile(arquivo);
    res.writeHead(200, { 'Content-Type': tipos[extname(arquivo)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(dados);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(await readFile(join(dist, '404.html')).catch(() => 'Página não encontrada'));
  }
}).listen(porta, '0.0.0.0', () => {
  console.log(`\n▶ Site rodando em http://localhost:${porta}`);
  console.log(`▶ Acesse pelo celular: http://192.168.15.63:${porta}\n`);
});
