<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "fullcalendar";

try {
	session_start();
    $conn = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			
    $sql = "CREATE TABLE IF NOT EXISTS users (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(30) NOT NULL,
	lastName VARCHAR(30) NOT NULL,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE(firstName, lastName)
    )";
	
	$conn->exec($sql);
	
    $sql = "CREATE TABLE IF NOT EXISTS activities (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
	
	$conn->exec($sql);
	
    $sql = "CREATE TABLE IF NOT EXISTS tutors (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(30) NOT NULL,
	lastName VARCHAR(30) NOT NULL,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE(firstName, lastName)
    )";
	
	$conn->exec($sql);
	
    $sql = "CREATE TABLE IF NOT EXISTS places (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";

    $conn->exec($sql);
	
    $sql = "CREATE TABLE IF NOT EXISTS events (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	user INT(6) UNSIGNED,
	activity INT(6) UNSIGNED,
	tutor INT(6) UNSIGNED,
	place INT(6) UNSIGNED,
	start DATETIME,
	end DATETIME,
	FOREIGN KEY (user)
    REFERENCES users (id) ON UPDATE CASCADE
                          ON DELETE CASCADE,
	FOREIGN KEY (activity)
    REFERENCES activities (id) ON UPDATE CASCADE
                               ON DELETE CASCADE,
	FOREIGN KEY (tutor)
    REFERENCES tutors (id) ON UPDATE CASCADE
                           ON DELETE CASCADE,
	FOREIGN KEY (place)
    REFERENCES places (id) ON UPDATE CASCADE
                           ON DELETE CASCADE,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";

    $conn->exec($sql);
}
catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>