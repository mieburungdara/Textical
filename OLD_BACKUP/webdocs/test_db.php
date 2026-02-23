<?php
// Standalone DB Test for SQLite in PHP
$db_path = 'c:/Users/Administrator/Documents/GitHub/Textical/server/prisma/dev.db';

try {
    $db = new PDO("sqlite:$db_path");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Successfully connected to SQLite database.\n";
    
    $query = $db->query("SELECT COUNT(*) as count FROM ItemTemplate WHERE category = 'EQUIPMENT'");
    $result = $query->fetch(PDO::FETCH_ASSOC);
    
    echo "📊 Found " . $result['count'] . " weapons in ItemTemplate table.\n";
    
} catch (PDOException $e) {
    echo "❌ Database Error: " . $e->getMessage() . "\n";
}
