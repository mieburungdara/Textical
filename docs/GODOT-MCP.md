# Textical Godot MCP Integration

Dokumentasi ini menjelaskan cara menggunakan integrasi Godot MCP pada proyek Textical.

## 📋 Gambaran Umum

**Godot MCP** (Model Context Protocol) memungkinkan AI assistants (seperti Claude) untuk berinteraksi dengan Godot game engine secara langsung. Integrasi ini menyediakan antarmuka terstandarisasi untuk:

- 🚀 Meluncurankan Godot Editor
- 🎮 Menjalankan project dalam mode debug
- 🐛 Menangkap output console dan error messages
- ⚡ Mengontrol eksekusi project
- 📁 Menganalisis struktur project
- 🎬 Manajemen scene dan script

## 🛠️ Instalasi

### Persyaratan Sistem

1. **Node.js** v18 atau lebih tinggi
2. **Godot Engine** (v3.x atau v4.x)
3. **TypeScript** (sudah termasuk)

### Langkah Instalasi

```bash
# 1. Install dependencies
npm install

# 2. Copy environment configuration
cp .env.example .env

# 3. Build TypeScript
npm run build

# 4. Verifikasi instalasi
npm run godot:mcp:dev
```

## ⚙️ Konfigurasi

Edit file `.env` sesuai dengan konfigurasi sistem Anda:

```env
# Path ke executable Godot (kosongkan untuk auto-detect)
GODOT_PATH=

# Path ke project Godot Textical
GODOT_PROJECT_PATH=./client

# Enable debug mode
DEBUG_MODE=true

# Port untuk MCP server
MCP_SERVER_PORT=3001

# Host untuk MCP server
MCP_SERVER_HOST=localhost

# Timeout untuk operasi Godot (milliseconds)
GODOT_TIMEOUT=30000

# Level log (debug, info, warn, error)
LOG_LEVEL=debug
```

### Menambahkan Godot ke PATH

**Windows:**
```powershell
# Tambahkan ke Environment Variables
[Environment]::SetEnvironmentVariable(
    "Path",
    $env:Path + ";C:\Program Files\Godot",
    "User"
)
```

**Linux/Mac:**
```bash
# Tambahkan ke ~/.bashrc atau ~/.zshrc
export PATH=$PATH:/usr/local/bin/godot
```

## 🎯 Penggunaan Dasar

### Import dan Inisialisasi

```typescript
import { createGodotMCPServer } from 'textical';
// atau
import { createGodotMCPServer, GodotMCPServer } from './src/mcp-server';

const server = createGodotMCPServer({
  projectsPath: './client',
  debugMode: true,
  timeout: 30000
});
```

### Mendapatkan Versi Godot

```typescript
async function checkGodotVersion() {
  const version = await server.getVersion();
  console.log(`Godot Version: ${version}`);
}
```

### Meluncurankan Editor

```typescript
async function openEditor() {
  await server.launchEditor('./client');
  console.log('Editor opened!');
}
```

### Menjalankan Project

```typescript
async function runProject() {
  // Listen untuk debug output
  server.on('debugOutput', (output) => {
    console.log(`[${output.type}] ${output.message}`);
  });
  
  await server.runProject('./client');
}
```

### Menganalisis Struktur Project

```typescript
async function analyzeProject() {
  const structure = await server.getProjectStructure('./client');
  
  console.log('Scenes:', structure.scenes);
  console.log('Scripts:', structure.scripts);
  console.log('Resources:', structure.resources);
}
```

### Membuat Scene Baru

```typescript
async function createNewEnemy() {
  const scenePath = await server.createScene(
    './client',
    'EnemyGoblin',
    'CharacterBody2D'
  );
  
  console.log(`Scene created: ${scenePath}`);
}
```

### Menghentikan Project

```typescript
async function stopRunningProject() {
  await server.stopProject();
  console.log('Project stopped');
}
```

## 📁 API Reference

### GodotMCPServer

#### Method

| Method | Deskripsi |
|--------|-----------|
| `getVersion()` | Mendapatkan versi Godot yang terinstal |
| `listProjects(directory?)` | Daftar semua project Godot |
| `launchEditor(projectPath)` | Membuka Godot Editor untuk project |
| `runProject(projectPath, captureOutput?)` | Menjalankan project dalam mode debug |
| `stopProject()` | Menghentikan project yang berjalan |
| `getDebugOutput()` | Mendapatkan semua output debug |
| `clearDebugOutput()` | Membersihkan buffer output |
| `getProjectStructure(projectPath)` | Menganalisis struktur project |
| `createScene(projectPath, sceneName, rootNodeType, parentPath?)` | Membuat scene baru |

#### Events

| Event | Data | Deskripsi |
|-------|------|-----------|
| `debugOutput` | `{ type, message, timestamp }` | Output dari Godot process |
| `projectStarted` | `{ projectPath }` | Project mulai dijalankan |
| `projectClosed` | `{ exitCode, output }` | Project selesai/dihentikan |
| `editorLaunched` | `{ projectPath }` | Editor berhasil dibuka |
| `sceneCreated` | `{ scenePath, scriptPath }` | Scene baru berhasil dibuat |

## 🧪 Menjalankan Contoh

```bash
# Menjalankan contoh penggunaan
npx ts-node src/examples.ts
```

Contoh yang tersedia:
- `exampleBasicUsage()` - Inisialisasi dan cek versi
- `exampleLaunchEditor()` - Membuka editor
- `exampleProjectStructure()` - Analisis struktur
- `exampleCreateScene()` - Membuat scene baru
- `exampleRunProject()` - Menjalankan project

## 🚨 Troubleshooting

### Error: "Godot executable not found"

1. Verifikasi path Godot di `.env`
2. Pastikan Godot sudah di PATH sistem
3. Gunakan path absolut:

```env
GODOT_PATH=C:\Godot\godoteditor.exe
```

### Error: "Project not found"

1. Pastikan path project valid
2. Project harus memiliki file `project.godot`
3. Periksa hak akses direktori

### Error: "Debug output timeout"

1. Tingkatkan timeout di `.env`:
```env
GODOT_TIMEOUT=60000
```

## 📚 Referensi Tambahan

- [Dokumentasi MCP Resmi](https://modelcontextprotocol.io/introduction)
- [Dokumentasi Godot](https://docs.godotengine.org/)
- [Repository Godot MCP](https://github.com/Coding-Solo/godot-mcp)

## 🔄 Update dan Maintenance

```bash
# Update dependencies
npm update

# Rebuild project
npm run build

# Type checking
npx tsc --noEmit
```

---

**Catatan:** Integrasi ini memerlukan Godot Engine yang terinstal di sistem. Untuk download Godot, kunjungi [godotengine.org](https://godotengine.org).
