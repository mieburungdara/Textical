<?php
if (function_exists('pg_connect')) {
    echo "pgsql extension is enabled!\n";
} else {
    echo "pgsql extension is NOT enabled.\n";
}

if (class_exists('PDO')) {
    $drivers = PDO::getAvailableDrivers();
    if (in_array('pgsql', $drivers)) {
        echo "pdo_pgsql driver is available!\n";
    } else {
        echo "pdo_pgsql driver is NOT available.\n";
    }
}
?>
