<?php
require_once "../config.php";

$data = $_SESSION["data"];
$desc = $_SESSION["desc"];

if (isset($_POST["select"])) {
	$data = $_POST["select"];
	
	$_SESSION["data"] = $data;
}
else if (isset($_POST["add"])) {
	try {
		if (isset($_POST["name"])) {
			$name = htmlentities($_POST["name"], ENT_QUOTES, "UTF-8");
	
			$sql = "INSERT INTO $data (name) VALUES (?)";
			$stmt=$conn->prepare($sql);
			$stmt->execute([$name]);
		
			$_SESSION["message"] = "$desc $name added";
			header("location: index.php");
		}
		else {
			$firstName = $_POST["firstName"];
			$lastName = $_POST["lastName"];
	
			$sql = "INSERT INTO $data (firstName, lastName) VALUES (?, ?)";
			$stmt = $conn->prepare($sql);
			$stmt->execute([$firstName, $lastName]);
			$last_id = $conn->lastInsertId();
		
			$_SESSION["message"] = "$desc $firstName $lastName added";

			if ($data == "users") {
				$sql = "INSERT INTO events (user, activity, tutor, place, start, end)
					SELECT ?, e.activity, e.tutor, e.place,
					DATE_FORMAT(DATE_ADD(e.start, INTERVAL ROUND(DATEDIFF(CURDATE(), e.start) / 7, 0) WEEK), '%Y-%m-%dT%H:%i:%s'),
					DATE_FORMAT(DATE_ADD(e.end, INTERVAL ROUND(DATEDIFF(CURDATE(), e.end) / 7, 0) WEEK), '%Y-%m-%dT%H:%i:%s')
					FROM events e
					INNER JOIN users u ON e.user = u.id
					WHERE u.firstName = 'Mall' AND u.lastName = '1' AND WEEKOFYEAR(e.start) = 1";
				$sth = $conn->prepare($sql);
				$sth->execute([$last_id]);
			}
			
			header("location: index.php");
		}
	}
	catch(PDOException $e) {
		$_SESSION["errorMessage"] = "$desc already exists";
		header("location: index.php");
	}
}
else if (isset($_POST["edit"])) {
	try {
		$id = $_POST["edit"];
		$column = $_POST["column"];
		$value = htmlentities($_POST["value"], ENT_QUOTES, "UTF-8");
	
		$sql = "UPDATE $data SET $column = ? WHERE id = ?";
		$stmt=$conn->prepare($sql);
		$stmt->execute([$value, $id]);
		
		$_SESSION["message"] = "$desc $value edited";
		header("location: index.php");
	}
	catch(PDOException $e) {
		echo $sql . "<br>" . $e->getMessage();
	}
}
else if (isset($_GET["del"])) {
	try {
		$id = $_GET["del"];
	
		$sql = "DELETE FROM $data WHERE id = ?";
		$stmt=$conn->prepare($sql);
		$stmt->execute([$id]);
		
		$_SESSION["message"] = "$desc deleted";
		header("location: index.php");
	}
	catch(PDOException $e) {
		echo $sql . "<br>" . $e->getMessage();
	}
}
?>