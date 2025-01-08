<?php
// Database configuration
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'semprqxw_orangehqdbuser');
define('DB_PASSWORD', 'qxw_orangehq');
define('DB_NAME', 'semprqxw_orangehq');
 

// Connect to database
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
