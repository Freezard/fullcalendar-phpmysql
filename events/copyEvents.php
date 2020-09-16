<?php
require_once "../config.php";

try {
	$events = $_POST["events"];
	$weeks = $_POST["weeks"];
	$weekStart = $_POST["weekStart"];
	
	for ($i = 0; $i < $weeks; $i++) {
		$sql = "INSERT INTO events (user, activity, tutor, place, start, end)
				SELECT user, activity, tutor, place,
					DATE_ADD(start, INTERVAL $weekStart + $i WEEK),
					DATE_ADD(end, INTERVAL $weekStart + $i WEEK)
				FROM events
				WHERE id = ?";
		$stmt = $conn->prepare($sql);
		foreach($events as $row) {
			$stmt->execute([$row["id"]]);
		}
	}
}
catch(PDOException $e) {
	echo $sql . "<br>" . $e->getMessage();
}
?>