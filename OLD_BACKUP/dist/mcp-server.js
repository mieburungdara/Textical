"use strict";
/**
 * Godot MCP Server Implementation
 *
 * This module provides MCP (Model Context Protocol) integration for Textical,
 * enabling AI assistants to interact with the Godot game engine.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GodotMCPServer = void 0;
exports.createGodotMCPServer = createGodotMCPServer;
const events_1 = require("events");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class GodotMCPServer extends events_1.EventEmitter {
    config;
    godotProcess = null;
    debugOutput = [];
    constructor(config) {
        super();
        this.config = {
            godotPath: config.godotPath || this.detectGodotPath(),
            projectsPath: config.projectsPath,
            debugMode: config.debugMode || false,
            timeout: config.timeout || 30000
        };
    }
    /**
     * Detect Godot executable path based on operating system
     */
    detectGodotPath() {
        const platform = process.platform;
        if (platform === 'win32') {
            // Check common Windows installation paths
            const windowsPaths = [
                'C:\\Program Files\\Godot\\Godot_v4.x-stable_windows.exe',
                'C:\\Program Files\\Godot\\Godot_v3.x-stable_windows.exe',
                `${process.env.HOME}\\AppData\\Local\\Godot\\Godot.exe`
            ];
            for (const p of windowsPaths) {
                if (fs.existsSync(p))
                    return p;
            }
        }
        else if (platform === 'darwin') {
            const macPath = '/Applications/Godot.app/Contents/MacOS/Godot';
            if (fs.existsSync(macPath))
                return macPath;
        }
        else {
            const linuxPath = '/usr/local/bin/godot';
            if (fs.existsSync(linuxPath))
                return linuxPath;
        }
        return 'godot'; // Fallback to PATH
    }
    /**
     * Get the installed Godot version
     */
    async getVersion() {
        return new Promise((resolve, reject) => {
            const godotProcess = (0, child_process_1.spawn)(this.config.godotPath, ['--version']);
            let output = '';
            godotProcess.stdout?.on('data', (data) => {
                output += data.toString();
            });
            godotProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim());
                }
                else {
                    reject(new Error(`Failed to get Godot version. Exit code: ${code}`));
                }
            });
            godotProcess.on('error', reject);
        });
    }
    /**
     * List all Godot projects in the specified directory
     */
    async listProjects(directory) {
        const searchDir = directory || this.config.projectsPath;
        const projects = [];
        if (!fs.existsSync(searchDir)) {
            return projects;
        }
        const entries = fs.readdirSync(searchDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const projectPath = path.join(searchDir, entry.name);
                const projectFile = path.join(projectPath, 'project.godot');
                if (fs.existsSync(projectFile)) {
                    const version = this.detectProjectVersion(projectFile);
                    projects.push({
                        path: projectPath,
                        name: entry.name,
                        version
                    });
                }
            }
        }
        return projects;
    }
    /**
     * Detect Godot version from project.godot file
     */
    detectProjectVersion(projectFilePath) {
        try {
            const content = fs.readFileSync(projectFilePath, 'utf-8');
            if (content.includes('config_version=2')) {
                return 'Godot 3.x';
            }
            else if (content.includes('config_version=5')) {
                return 'Godot 4.x';
            }
            else if (content.includes('config_version=4')) {
                return 'Godot 4.x';
            }
            return 'Unknown';
        }
        catch {
            return 'Unknown';
        }
    }
    /**
     * Launch the Godot editor for a specific project
     */
    async launchEditor(projectPath) {
        if (!fs.existsSync(projectPath)) {
            throw new Error(`Project not found: ${projectPath}`);
        }
        const projectFile = path.join(projectPath, 'project.godot');
        if (!fs.existsSync(projectFile)) {
            throw new Error(`Invalid Godot project: ${projectFile}`);
        }
        return new Promise((resolve, reject) => {
            const args = ['--path', projectPath, '-e'];
            if (this.config.debugMode) {
                args.unshift('--debug');
            }
            this.godotProcess = (0, child_process_1.spawn)(this.config.godotPath, args, {
                detached: true,
                stdio: 'ignore'
            });
            this.godotProcess.on('spawn', () => {
                this.emit('editorLaunched', { projectPath });
                resolve();
            });
            this.godotProcess.on('error', (error) => {
                reject(new Error(`Failed to launch Godot editor: ${error.message}`));
            });
        });
    }
    /**
     * Run a Godot project in debug mode
     */
    async runProject(projectPath, captureOutput = true) {
        if (!fs.existsSync(projectPath)) {
            throw new Error(`Project not found: ${projectPath}`);
        }
        this.debugOutput = [];
        return new Promise((resolve, reject) => {
            const args = ['--path', projectPath, '--debug'];
            this.godotProcess = (0, child_process_1.spawn)(this.config.godotPath, args, {
                stdio: captureOutput ? 'pipe' : 'ignore'
            });
            if (captureOutput) {
                this.godotProcess.stdout?.on('data', (data) => {
                    const output = {
                        type: 'stdout',
                        message: data.toString(),
                        timestamp: new Date()
                    };
                    this.debugOutput.push(output);
                    this.emit('debugOutput', output);
                });
                this.godotProcess.stderr?.on('data', (data) => {
                    const output = {
                        type: 'stderr',
                        message: data.toString(),
                        timestamp: new Date()
                    };
                    this.debugOutput.push(output);
                    this.emit('debugOutput', output);
                });
            }
            this.godotProcess.on('close', (code) => {
                const result = {
                    exitCode: code,
                    output: this.debugOutput
                };
                this.emit('projectClosed', result);
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(`Project exited with code: ${code}`));
                }
            });
            this.godotProcess.on('error', (error) => {
                reject(new Error(`Failed to run project: ${error.message}`));
            });
            this.emit('projectStarted', { projectPath });
        });
    }
    /**
     * Stop the currently running Godot project
     */
    async stopProject() {
        if (this.godotProcess && !this.godotProcess.killed) {
            this.godotProcess.kill('SIGTERM');
            return new Promise((resolve) => {
                this.godotProcess.on('close', () => {
                    this.godotProcess = null;
                    resolve();
                });
                // Force kill after timeout
                setTimeout(() => {
                    if (this.godotProcess && !this.godotProcess.killed) {
                        this.godotProcess.kill('SIGKILL');
                    }
                    resolve();
                }, this.config.timeout);
            });
        }
    }
    /**
     * Get all captured debug output
     */
    getDebugOutput() {
        return [...this.debugOutput];
    }
    /**
     * Clear debug output buffer
     */
    clearDebugOutput() {
        this.debugOutput = [];
    }
    /**
     * Get project structure information
     */
    async getProjectStructure(projectPath) {
        if (!fs.existsSync(projectPath)) {
            throw new Error(`Project not found: ${projectPath}`);
        }
        const structure = {
            path: projectPath,
            scenes: [],
            scripts: [],
            resources: {},
            projectFile: null
        };
        // Find project.godot
        const projectFile = path.join(projectPath, 'project.godot');
        if (fs.existsSync(projectFile)) {
            structure.projectFile = projectFile;
        }
        // Recursively scan directories
        const scanDir = (dir, relativePath = '') => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relPath = path.join(relativePath, entry.name);
                if (entry.name.startsWith('.'))
                    continue;
                if (entry.isDirectory()) {
                    if (entry.name === 'scenes') {
                        structure.scenes = this.scanForFiles(fullPath, '.tscn');
                    }
                    else if (entry.name === 'scripts') {
                        structure.scripts = this.scanForFiles(fullPath, '.gd');
                    }
                    else if (entry.name === 'resources') {
                        structure.resources = this.scanResources(fullPath);
                    }
                    else {
                        scanDir(fullPath, relPath);
                    }
                }
                else if (entry.isFile()) {
                    if (entry.name.endsWith('.tscn')) {
                        structure.scenes.push(relPath);
                    }
                    else if (entry.name.endsWith('.gd')) {
                        structure.scripts.push(relPath);
                    }
                }
            }
        };
        scanDir(projectPath);
        return structure;
    }
    /**
     * Scan directory for files with specific extension
     */
    scanForFiles(dir, extension) {
        const files = [];
        if (!fs.existsSync(dir))
            return files;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                files.push(...this.scanForFiles(path.join(dir, entry.name), extension));
            }
            else if (entry.name.endsWith(extension)) {
                files.push(entry.name);
            }
        }
        return files;
    }
    /**
     * Scan resources directory
     */
    scanResources(dir) {
        const resources = {};
        if (!fs.existsSync(dir))
            return resources;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                resources[entry.name] = this.scanForFiles(path.join(dir, entry.name), '');
            }
        }
        return resources;
    }
    /**
     * Create a new scene with specified root node
     */
    async createScene(projectPath, sceneName, rootNodeType, parentPath) {
        const scenesDir = path.join(projectPath, 'scenes');
        if (!fs.existsSync(scenesDir)) {
            fs.mkdirSync(scenesDir, { recursive: true });
        }
        const sceneContent = `[gd_scene load_steps=2 format=3 uid="uid://generated"]

[ext_resource type="Script" path="res://scripts/${sceneName.toLowerCase()}.gd" id="1_script"]

[node name="${rootNodeType}" type="${rootNodeType}"]
script = ExtResource("1_script")
`;
        const scenePath = path.join(parentPath || scenesDir, `${sceneName}.tscn`);
        fs.writeFileSync(scenePath, sceneContent);
        // Create corresponding script
        const scriptContent = `extends ${rootNodeType}

/**
 * ${sceneName}
 * Auto-generated script by Godot MCP
 */

func _ready() -> void:
	pass

func _process(delta: float) -> void:
	pass
`;
        const scriptsDir = path.join(projectPath, 'scripts');
        if (!fs.existsSync(scriptsDir)) {
            fs.mkdirSync(scriptsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(scriptsDir, `${sceneName.toLowerCase()}.gd`), scriptContent);
        this.emit('sceneCreated', { scenePath, scriptPath: path.join(scriptsDir, `${sceneName.toLowerCase()}.gd`) });
        return scenePath;
    }
}
exports.GodotMCPServer = GodotMCPServer;
// Factory function for creating MCP server instance
function createGodotMCPServer(config) {
    return new GodotMCPServer(config);
}
//# sourceMappingURL=mcp-server.js.map