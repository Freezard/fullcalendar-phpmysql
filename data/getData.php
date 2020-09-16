<?php
require_once "../config.php";

try {
	$data = $_GET["data"];
	
	if ($data === "activities" || $data === "places") {
		$sql = "SELECT id, name FROM $data ORDER BY name";
		$sth = $conn->prepare($sql);
		$sth->execute();
		$res = $sth->fetchAll(PDO::FETCH_ASSOC);

		header('Content-type: application/json');
		echo json_encode($res);
	}
	else {
		$sql = "SELECT id, firstName, lastName FROM $data ORDER BY lastName";
		$sth = $conn->prepare($sql);
		$sth->execute();
		$res = $sth->fetchAll(PDO::FETCH_ASSOC);

		header('Content-type: application/json');
		echo json_encode($res);		
	}
}
catch(PDOException $e) {
	echo $sql . "<br>" . $e->getMessage();
}
?>