<?php
$db = new SQLite3('../server/prisma/dev.db');
$res = $db->query("SELECT name FROM WeaponPassive LIMIT 5");
while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
    echo json_encode($row) . "\n";
}
$res = $db->query("SELECT ItemTemplate.name, TraitTemplate.name as trait FROM ItemTemplate JOIN ItemTrait on ItemTemplate.id = ItemTrait.itemId JOIN TraitTemplate on ItemTrait.traitId = TraitTemplate.id WHERE ItemTemplate.name = 'Rusty Sword'");
while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
    echo json_encode($row) . "\n";
}
