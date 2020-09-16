<?php
require_once "../config.php";

try {
	$id = $_POST["id"];
	$start = $_POST["start"];
	$end = $_POST["end"];
	
	$sql = "INSERT INTO events (user, activity, tutor, place, start, end)
			SELECT user, activity, tutor, place, ?, ?
			FROM events
			WHERE id = ?";
	$stmt = $conn->prepare($sql);
	$stmt->execute([$start, $end, $id]);
}
catch(PDOException $e) {
	echo $sql . "<br>" . $e->getMessage();
}
?>