import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 先运行原始构建
console.log('Running build.mjs...');
execSync('node build.mjs', { stdio: 'inherit', cwd: __dirname });

// 将 docs/ 目录的内容复制到根目录（用于 EdgeOne 部署）
console.log('Copying docs/ to root for EdgeOne deployment...');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 复制 docs/ 下的所有文件到根目录
copyDir(path.join(__dirname, 'docs'), __dirname);

// 复制 cloud-functions/ 到 docs/（EdgeOne Cloud Functions 必需）
if (fs.existsSync(path.join(__dirname, 'cloud-functions'))) {
  console.log('Copying cloud-functions/ to docs/ for EdgeOne Cloud Functions...');
  copyDir(path.join(__dirname, 'cloud-functions'), path.join(__dirname, 'docs', 'cloud-functions'));
}

// 复制 oauth-callback.html 到 docs/
if (fs.existsSync(path.join(__dirname, 'oauth-callback.html'))) {
  console.log('Copying oauth-callback.html to docs/...');
  fs.copyFileSync(
    path.join(__dirname, 'oauth-callback.html'),
    path.join(__dirname, 'docs', 'oauth-callback.html')
  );
}

console.log('Build completed for EdgeOne!');
