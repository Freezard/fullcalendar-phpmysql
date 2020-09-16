<?php
require_once "../config.php";

try {
	$events = $_POST["events"];
	
	$sql = "INSERT INTO events (user, activity, tutor, place, start, end) VALUES (?, ?, ?, ?, ?, ?)";
	$stmt = $conn->prepare($sql);
	foreach($events as $row) {
		$stmt->execute([$row["user"], $row["activity"], $row["tutor"], $row["place"], $row["start"], $row["end"]]);
	}
}
catch(PDOException $e) {
	echo $sql . "<br>" . $e->getMessage();
}
?>