/**
 * Godot MCP Server Implementation
 *
 * This module provides MCP (Model Context Protocol) integration for Textical,
 * enabling AI assistants to interact with the Godot game engine.
 */
import { EventEmitter } from 'events';
export interface GodotMCPConfig {
    godotPath?: string;
    projectsPath: string;
    debugMode?: boolean;
    timeout?: number;
}
export interface ProjectInfo {
    path: string;
    name: string;
    version: string;
}
export interface DebugOutput {
    type: 'stdout' | 'stderr';
    message: string;
    timestamp: Date;
}
export declare class GodotMCPServer extends EventEmitter {
    private config;
    private godotProcess;
    private debugOutput;
    constructor(config: GodotMCPConfig);
    /**
     * Detect Godot executable path based on operating system
     */
    private detectGodotPath;
    /**
     * Get the installed Godot version
     */
    getVersion(): Promise<string>;
    /**
     * List all Godot projects in the specified directory
     */
    listProjects(directory?: string): Promise<ProjectInfo[]>;
    /**
     * Detect Godot version from project.godot file
     */
    private detectProjectVersion;
    /**
     * Launch the Godot editor for a specific project
     */
    launchEditor(projectPath: string): Promise<void>;
    /**
     * Run a Godot project in debug mode
     */
    runProject(projectPath: string, captureOutput?: boolean): Promise<void>;
    /**
     * Stop the currently running Godot project
     */
    stopProject(): Promise<void>;
    /**
     * Get all captured debug output
     */
    getDebugOutput(): DebugOutput[];
    /**
     * Clear debug output buffer
     */
    clearDebugOutput(): void;
    /**
     * Get project structure information
     */
    getProjectStructure(projectPath: string): Promise<any>;
    /**
     * Scan directory for files with specific extension
     */
    private scanForFiles;
    /**
     * Scan resources directory
     */
    private scanResources;
    /**
     * Create a new scene with specified root node
     */
    createScene(projectPath: string, sceneName: string, rootNodeType: string, parentPath?: string): Promise<string>;
}
export declare function createGodotMCPServer(config: GodotMCPConfig): GodotMCPServer;
//# sourceMappingURL=mcp-server.d.ts.map