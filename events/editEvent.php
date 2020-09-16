<?php
require_once "../config.php";

try {
	if (isset($_POST["date"])) {
		$data = $_POST["date"];
	
		$sql = "UPDATE events SET start = ?, end = ? WHERE id = ?";
		$stmt = $conn->prepare($sql);
		$stmt->execute([$data["start"], $data["end"], $data["id"]]);
	}
	else {
		$data = $_POST["event"];
			
		$sql = "UPDATE events SET activity = ?, tutor = ?, place = ?, start = ?,
				  end = ? WHERE id = ?";
		$stmt = $conn->prepare($sql);
		$stmt->execute([$data["activity"], $data["tutor"], $data["place"],
			$data["start"], $data["end"], $data["id"]]);
	}
}
catch(PDOException $e) {
	echo $sql . "<br>" . $e->getMessage();
}
?>