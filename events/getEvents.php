<?php
require_once "../config.php";

try {
	$user = $_GET["user"];
	$start = $_GET["start"];
	$end = $_GET["end"];
	
	$sql = "SELECT e.id, CONCAT_WS(' ', u.firstName, u.lastName) AS user, a.name AS title, CONCAT_WS(' ', t.firstName, t.lastName) AS tutor,
	  p.name AS place, e.start, e.end FROM events e
			INNER JOIN users u ON e.user = u.id
			INNER JOIN activities a ON e.activity = a.id
			INNER JOIN tutors t ON e.tutor = t.id
			INNER JOIN places p ON e.place = p.id
			WHERE start BETWEEN ? AND ? AND e.user = ? ORDER BY e.id";
    $sth = $conn->prepare($sql);
	$sth->execute([$start, $end, $user]);
	$res = $sth->fetchAll(PDO::FETCH_ASSOC);
	
	header('Content-type: application/json');
	echo json_encode($res);
}
catch(PDOException $e) {
	echo $sql . "<br>" . $e->getMessage();
}
?>