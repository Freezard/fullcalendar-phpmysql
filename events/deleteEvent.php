<?php
require_once "../config.php";

try {
	$id = $_POST["id"];
	
	$sql = "DELETE FROM events WHERE id = ?";
    $stmt = $conn->prepare($sql);
	$stmt->execute([$id]);
}
catch(PDOException $e) {
	echo $sql . "<br>" . $e->getMessage();
}
?>