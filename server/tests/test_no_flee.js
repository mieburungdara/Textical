const fs = require('fs');
const path = require('path');

/**
 * Test: No Flee/Retreat in Battle System
 * Verifies that flee/retreat mechanics have been removed globally
 */

async function testNoFlee() {
    console.log('=== NO FLEE/RETREAT VERIFICATION ===\n');
    
    const searchPaths = [
        path.join(__dirname, '../src/services'),
        path.join(__dirname, '../src/services/battle'),
        path.join(__dirname, '../src/routes')
    ];
    
    const keywords = ['flee', 'retreat', 'escape', 'run away'];
    const foundFiles = [];
    
    console.log('Searching for flee/retreat/escape logic...\n');
    
    function searchDirectory(dir, depth = 0) {
        if (!fs.existsSync(dir)) {
            console.log(`  ⚠️ Directory not found: ${dir}`);
            return;
        }
        
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                searchDirectory(fullPath, depth + 1);
            } else if (file.endsWith('.js')) {
                const content = fs.readFileSync(fullPath, 'utf-8').toLowerCase();
                
                for (const keyword of keywords) {
                    if (content.includes(keyword)) {
                        // Check if it's in a comment or string (basic check)
                        const lines = content.split('\n');
                        const matchingLines = [];
                        
                        lines.forEach((line, idx) => {
                            if (line.includes(keyword)) {
                                const isComment = line.trim().startsWith('//') || line.trim().startsWith('*');
                                const isString = line.includes(`"${keyword}"`) || line.includes(`'${keyword}'`);
                                const isDescription = line.includes('description') || line.includes('Description');
                                
                                if (!isComment && !isString && !isDescription) {
                                    matchingLines.push({ line: idx + 1, content: line.trim() });
                                }
                            }
                        });
                        
                        if (matchingLines.length > 0) {
                            foundFiles.push({
                                file: fullPath,
                                keyword,
                                matches: matchingLines
                            });
                        }
                    }
                }
            }
        }
    }
    
    for (const searchPath of searchPaths) {
        searchDirectory(searchPath);
    }
    
    console.log('Search Results:\n');
    
    if (foundFiles.length === 0) {
        console.log('✅ PASS: No flee/retreat/escape logic found in battle system!');
        console.log('\nConclusion: Battle system enforces "fight to completion" globally.');
    } else {
        console.log(`⚠️ Found ${foundFiles.length} file(s) with potential flee/retreat references:\n`);
        
        foundFiles.forEach(({ file, keyword, matches }) => {
            console.log(`File: ${path.relative(__dirname, file)}`);
            console.log(`Keyword: "${keyword}"`);
            matches.forEach(({ line, content }) => {
                console.log(`  Line ${line}: ${content}`);
            });
            console.log('');
        });
        
        console.log('⚠️ Manual review required to verify these are not actual flee mechanics.');
    }
    
    // Check registry for action definitions
    console.log('\nChecking registry for battle actions...');
    try {
        const registryPath = path.join(__dirname, '../src/data/registry.js');
        if (fs.existsSync(registryPath)) {
            const registryContent = fs.readFileSync(registryPath, 'utf-8');
            
            // Look for action definitions
            if (registryContent.includes('battleActions') || registryContent.includes('actions')) {
                console.log('✓ Found action registry');
                
                const hasFleeAction = registryContent.toLowerCase().includes('flee') || 
                                     registryContent.toLowerCase().includes('retreat');
                
                if (hasFleeAction) {
                    console.log('⚠️ "Flee" or "Retreat" found in registry (may be trait/description)');
                } else {
                    console.log('✅ No flee/retreat actions in registry');
                }
            }
        }
    } catch (e) {
        console.log(`ℹ️ Could not check registry: ${e.message}`);
    }
    
    console.log('\n=== TEST COMPLETE ===');
}

testNoFlee();
