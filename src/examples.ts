/**
 * Textical Godot MCP - Usage Examples
 * 
 * This file demonstrates how to use the Godot MCP integration
 * with the Textical game engine.
 */

import { createGodotMCPServer, GodotMCPConfig, ProjectInfo, DebugOutput } from './mcp-server';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Example 1: Basic initialization and version check
 */
async function exampleBasicUsage() {
  console.log('=== Example 1: Basic Usage ===\n');
  
  const config: GodotMCPConfig = {
    projectsPath: process.env.GODOT_PROJECT_PATH || './client',
    debugMode: true,
    timeout: 30000
  };
  
  const server = createGodotMCPServer(config);
  
  try {
    // Get Godot version
    const version = await server.getVersion();
    console.log(`Godot Version: ${version}`);
    
    // List projects
    const projects = await server.listProjects();
    console.log(`Found ${projects.length} project(s):`);
    
    for (const project of projects) {
      console.log(`  - ${project.name} (${project.version})`);
      console.log(`    Path: ${project.path}`);
    }
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example 2: Launch Godot editor
 */
async function exampleLaunchEditor() {
  console.log('\n=== Example 2: Launch Editor ===\n');
  
  const server = createGodotMCPServer({
    projectsPath: './client',
    debugMode: true
  });
  
  const projectPath = './client';
  
  try {
    console.log(`Launching Godot editor for: ${projectPath}`);
    await server.launchEditor(projectPath);
    console.log('Editor launched successfully!');
  } catch (error) {
    console.error('Failed to launch editor:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example 3: Run project and capture debug output
 */
async function exampleRunProject() {
  console.log('\n=== Example 3: Run Project ===\n');
  
  const server = createGodotMCPServer({
    projectsPath: './client',
    debugMode: true
  });
  
  const projectPath = './client';
  
  // Listen for debug output
  server.on('debugOutput', (output: DebugOutput) => {
    const prefix = output.type === 'stderr' ? '[ERROR]' : '[LOG]';
    console.log(`${prefix} ${output.message}`);
  });
  
  server.on('projectStarted', (info) => {
    console.log(`Project started: ${info.projectPath}`);
  });
  
  server.on('projectClosed', (result) => {
    console.log(`Project closed. Exit code: ${result.exitCode}`);
    console.log(`Total output lines: ${result.output.length}`);
  });
  
  try {
    console.log(`Running project: ${projectPath}`);
    await server.runProject(projectPath);
  } catch (error) {
    console.error('Failed to run project:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example 4: Get project structure
 */
async function exampleProjectStructure() {
  console.log('\n=== Example 4: Project Structure ===\n');
  
  const server = createGodotMCPServer({
    projectsPath: './client'
  });
  
  const projectPath = './client';
  
  try {
    const structure = await server.getProjectStructure(projectPath);
    
    console.log('Project Structure:');
    console.log(`  Path: ${structure.path}`);
    console.log(`  Scenes (${structure.scenes.length}):`);
    structure.scenes.forEach((scene: string) => console.log(`    - ${scene}`));
    console.log(`  Scripts (${structure.scripts.length}):`);
    structure.scripts.forEach((script: string) => console.log(`    - ${script}`));
    
    const resourceTypes = Object.keys(structure.resources);
    if (resourceTypes.length > 0) {
      console.log(`  Resources:`);
      resourceTypes.forEach((type: string) => {
        const count = structure.resources[type]?.length || 0;
        console.log(`    - ${type}: ${count} file(s)`);
      });
    }
    
  } catch (error) {
    console.error('Failed to get project structure:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example 5: Create new scene
 */
async function exampleCreateScene() {
  console.log('\n=== Example 5: Create Scene ===\n');
  
  const server = createGodotMCPServer({
    projectsPath: './client'
  });
  
  const projectPath = './client';
  const sceneName = 'TestEnemy';
  const rootNodeType = 'CharacterBody2D';
  
  try {
    console.log(`Creating new scene: ${sceneName}`);
    const scenePath = await server.createScene(projectPath, sceneName, rootNodeType);
    console.log(`Scene created: ${scenePath}`);
    
    // Show generated script path
    const scriptPath = scenePath.replace('.tscn', '.gd').replace('scenes', 'scripts');
    console.log(`Script created: ${scriptPath}`);
    
  } catch (error) {
    console.error('Failed to create scene:', error instanceof Error ? error.message : error);
  }
}

/**
 * Example 6: Stop running project
 */
async function exampleStopProject() {
  console.log('\n=== Example 6: Stop Project ===\n');
  
  const server = createGodotMCPServer({
    projectsPath: './client',
    debugMode: true
  });
  
  try {
    // First, start the project
    console.log('Starting project...');
    await server.runProject('./client');
    
    // Wait a bit
    console.log('Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Then stop it
    console.log('Stopping project...');
    await server.stopProject();
    console.log('Project stopped successfully!');
    
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

// Run examples
async function main() {
  console.log('Textical Godot MCP - Usage Examples\n');
  console.log('='.repeat(50));
  
  // Run examples one by one
  await exampleBasicUsage();
  // Uncomment to run more examples:
  // await exampleLaunchEditor();
  // await exampleProjectStructure();
  // await exampleCreateScene();
  
  console.log('\n' + '='.repeat(50));
  console.log('Examples completed!');
}

main().catch(console.error);
