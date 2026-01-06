<?php
/**
 * MySQL Database Setup Script
 * Creates database and dedicated Laravel user
 * 
 * Usage: php setup-db.php [root_password]
 * If root_password is not provided, will try empty password
 */

$rootPassword = $argv[1] ?? '';
$host = '127.0.0.1';
$port = 3306;

echo "Attempting to connect to MySQL as root...\n";

try {
    // Try to connect without password first
    $pdo = new PDO("mysql:host=$host;port=$port", 'root', $rootPassword);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✓ Connected to MySQL\n\n";
    
    // Create database
    echo "Creating database 'itigp'...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS itigp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✓ Database 'itigp' created/exists\n\n";
    
    // Create user for localhost
    echo "Creating user 'laravel'@'localhost'...\n";
    try {
        $pdo->exec("CREATE USER IF NOT EXISTS 'laravel'@'localhost' IDENTIFIED BY 'StrongPass123!'");
        echo "✓ User 'laravel'@'localhost' created\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'already exists') !== false) {
            echo "✓ User 'laravel'@'localhost' already exists\n";
        } else {
            throw $e;
        }
    }
    
    // Create user for 127.0.0.1
    echo "Creating user 'laravel'@'127.0.0.1'...\n";
    try {
        $pdo->exec("CREATE USER IF NOT EXISTS 'laravel'@'127.0.0.1' IDENTIFIED BY 'StrongPass123!'");
        echo "✓ User 'laravel'@'127.0.0.1' created\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'already exists') !== false) {
            echo "✓ User 'laravel'@'127.0.0.1' already exists\n";
        } else {
            throw $e;
        }
    }
    
    // Grant privileges
    echo "\nGranting privileges...\n";
    $pdo->exec("GRANT ALL PRIVILEGES ON itigp.* TO 'laravel'@'localhost'");
    $pdo->exec("GRANT ALL PRIVILEGES ON itigp.* TO 'laravel'@'127.0.0.1'");
    $pdo->exec("FLUSH PRIVILEGES");
    echo "✓ Privileges granted\n\n";
    
    // Test new user connection
    echo "Testing connection with new user...\n";
    $testPdo = new PDO("mysql:host=$host;port=$port;dbname=itigp", 'laravel', 'StrongPass123!');
    $testPdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✓ Connection test successful!\n\n";
    
    echo "========================================\n";
    echo "Database setup complete!\n";
    echo "========================================\n";
    echo "Update your .env file with:\n";
    echo "DB_USERNAME=laravel\n";
    echo "DB_PASSWORD=StrongPass123!\n";
    echo "========================================\n";
    
} catch (PDOException $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
    echo "If root password is incorrect, please run this SQL manually in MySQL Workbench:\n\n";
    echo "CREATE DATABASE IF NOT EXISTS itigp;\n";
    echo "CREATE USER IF NOT EXISTS 'laravel'@'localhost' IDENTIFIED BY 'StrongPass123!';\n";
    echo "CREATE USER IF NOT EXISTS 'laravel'@'127.0.0.1' IDENTIFIED BY 'StrongPass123!';\n";
    echo "GRANT ALL PRIVILEGES ON itigp.* TO 'laravel'@'localhost';\n";
    echo "GRANT ALL PRIVILEGES ON itigp.* TO 'laravel'@'127.0.0.1';\n";
    echo "FLUSH PRIVILEGES;\n";
    exit(1);
}


