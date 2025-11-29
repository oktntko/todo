import { promises as fs } from 'fs';
import path from 'path';
import { cwd } from 'process';

async function generate(dir: string) {
  const files = await fs.readdir(dir);

  // TS/JSファイルだけ取り出す
  const targets = files.filter((f) => /\.tsx?$/.test(f) && !f.startsWith('index.'));

  // エクスポート文を生成
  const exportLines =
    targets.map((f) => `export * from './${path.basename(f, path.extname(f))}';`).join('\n') + '\n';

  // 出力先
  const outputPath = path.resolve(dir, 'index.ts');

  await fs.writeFile(outputPath, exportLines, 'utf8');
  console.log('Generated:', outputPath, targets);
}

const [, , ...dirs] = process.argv;
for (const dir of dirs) {
  generate(path.resolve(cwd(), dir));
}

// TODO 暫定対応
// 1. useMultipleFiles: false にすると、 '.' で始まるカスタムインポート文(@zod.import)が生成ファイルに出力されない (prisma-zod-generatorの問題)
// - https://github.com/omar-dulaimi/prisma-zod-generator/issues/335
// 2. ts の paths によるエイリアスを設定して '~'で始まるようにする、生成ファイルには出力されるが、参照先のプロジェクトでパスの解決ができない (tsの正しい動作)
// -
// 3. zod-prisma-types のように、 writeBarrelFiles オプションがない
// -
// => prisma generate 後に置換処理を入れることで対応
