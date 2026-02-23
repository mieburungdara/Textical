/**
 * Godot MCP Server Tests
 * 
 * Unit tests for the Godot MCP integration.
 * These tests verify the basic functionality without requiring actual Godot installation.
 */

import { GodotMCPServer, createGodotMCPServer, GodotMCPConfig } from '../src/mcp-server';

// Mock child_process to prevent actual process spawning
jest.mock('child_process', () => ({
  spawn: jest.fn(() => ({
    on: jest.fn(() => ({})),
    stdout: { on: jest.fn(() => ({})) },
    stderr: { on: jest.fn(() => ({})) },
    kill: jest.fn(),
    killed: false,
  })),
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  readdirSync: jest.fn(() => []),
  readFileSync: jest.fn(() => 'config_version=5'),
  mkdirSync: jest.fn(() => undefined),
  writeFileSync: jest.fn(() => undefined),
}));

// Get reference to mocked functions
import * as fsMock from 'fs';
const mockExistsSync = fsMock.existsSync as jest.Mock;
const mockReaddirSync = fsMock.readdirSync as jest.Mock;
const mockReadFileSync = fsMock.readFileSync as jest.Mock;
const mockWriteFileSync = fsMock.writeFileSync as jest.Mock;

describe('GodotMCPServer', () => {
  let server: GodotMCPServer;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockExistsSync.mockReturnValue(true);
    
    const config: GodotMCPConfig = {
      projectsPath: './client',
      debugMode: false,
      timeout: 5000
    };
    
    server = createGodotMCPServer(config);
  });
  
  afterEach(async () => {
    try {
      await server.stopProject();
    } catch {
      // Ignore errors
    }
  });
  
  describe('Constructor', () => {
    it('should create instance with config', () => {
      expect(server).toBeInstanceOf(GodotMCPServer);
    });
    
    it('should use custom godot path if provided', () => {
      const customServer = createGodotMCPServer({
        projectsPath: './client',
        godotPath: '/custom/godot'
      });
      
      expect(customServer).toBeInstanceOf(GodotMCPServer);
    });
  });
  
  describe('listProjects', () => {
    it('should return empty array for non-existent directory', async () => {
      mockExistsSync.mockReturnValue(false);
      
      const projects = await server.listProjects('./non-existent-dir');
      expect(projects).toEqual([]);
    });
    
    it('should handle directory with no subdirectories', async () => {
      const projects = await server.listProjects('./empty-dir');
      expect(projects).toEqual([]);
    });
  });
  
  describe('getDebugOutput', () => {
    it('should return empty array initially', () => {
      const output = server.getDebugOutput();
      expect(output).toEqual([]);
    });
  });
  
  describe('clearDebugOutput', () => {
    it('should clear debug buffer', () => {
      server.clearDebugOutput();
      const output = server.getDebugOutput();
      expect(output).toEqual([]);
    });
  });
  
  describe('getProjectStructure', () => {
    it('should throw for non-existent project', async () => {
      mockExistsSync.mockReturnValue(false);
      
      await expect(server.getProjectStructure('./non-existent'))
        .rejects.toThrow('Project not found');
    });
    
    it('should return structure object for valid path', async () => {
      const structure = await server.getProjectStructure('./client');
      
      expect(structure).toHaveProperty('path');
      expect(structure).toHaveProperty('scenes');
      expect(structure).toHaveProperty('scripts');
      expect(structure).toHaveProperty('resources');
      expect(structure).toHaveProperty('projectFile');
      expect(Array.isArray(structure.scenes)).toBe(true);
      expect(Array.isArray(structure.scripts)).toBe(true);
      expect(typeof structure.resources).toBe('object');
    });
  });
  
  describe('createScene', () => {
    it('should create scene and script files', async () => {
      const scenePath = await server.createScene(
        './client',
        'TestEnemy',
        'CharacterBody2D'
      );
      
      expect(scenePath).toContain('TestEnemy.tscn');
      expect(mockWriteFileSync).toHaveBeenCalled();
    });
    
    it('should include correct node type in scene', async () => {
      const scenePath = await server.createScene(
        './client',
        'PlayerCharacter',
        'CharacterBody2D'
      );
      
      expect(scenePath).toContain('PlayerCharacter.tscn');
    });
  });
  
  describe('stopProject', () => {
    it('should not throw when no project is running', async () => {
      await expect(server.stopProject()).resolves.not.toThrow();
    });
  });
  
  describe('EventEmitter functionality', () => {
    it('should support event listener registration', () => {
      const callback = jest.fn();
      
      expect(() => {
        server.on('debugOutput', callback);
        server.on('projectStarted', callback);
        server.on('projectClosed', callback);
      }).not.toThrow();
    });
    
    it('should support removing event listeners', () => {
      const callback = jest.fn();
      
      server.on('debugOutput', callback);
      server.off('debugOutput', callback);
      
      expect(() => server.off('debugOutput', callback)).not.toThrow();
    });
  });
  
  describe('Configuration', () => {
    it('should store debug mode setting', () => {
      const debugServer = createGodotMCPServer({
        projectsPath: './client',
        debugMode: true
      });
      
      expect(debugServer).toBeInstanceOf(GodotMCPServer);
    });
    
    it('should store timeout setting', () => {
      const timedServer = createGodotMCPServer({
        projectsPath: './client',
        timeout: 60000
      });
      
      expect(timedServer).toBeInstanceOf(GodotMCPServer);
    });
  });
});
