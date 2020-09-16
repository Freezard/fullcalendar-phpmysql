<?php
include_once("../config.php");

if (!isset($_SESSION["data"]))
	$_SESSION["data"] = "users";
	
$dataMap = [
		"users" => "User",
		"activities" => "Activity",
		"tutors" => "Tutor",
		"places" => "Location"
		];
$data = $_SESSION["data"];
$_SESSION["desc"] = $dataMap[$data];
 
if ($data === "users" || $data === "tutors")
	$result = $conn->query("SELECT id, firstName, lastName FROM $data ORDER BY lastName");
else
	$result = $conn->query("SELECT id, name FROM $data ORDER BY name");
?>
<html>
<head>
  <title>Modify data</title>
  <style type="text/css">
	.container {
	  max-width: 900px;
	  margin: auto;
	}
    table {
	  width: 100%;
      font-family: verdana,arial,sans-serif;
      font-size: 11px;
      color: #333333;
      border-width: 1px;
      border-color: #3A3A3A;
      border-collapse: collapse;
    }
    table th {
      border-width: 1px;
      padding: 8px;
      border-style: solid;
      border-color: #3A3A3A;
      background-color: #B3B3B3;
    }
    table td {
      border-width: 1px;
      padding: 8px;
      border-style: solid;
      border-color: #3A3A3A;
      background-color: #ffffff;
    }
	.message {
	  padding: 10px;
      border-radius: 5px;
      color: #3c763d;
      background: #dff0d8;
      border: 1px solid #3c763d;
      text-align: center;
	}
	.errorMessage {
	  padding: 10px;
      border-radius: 5px;
      color: #703241;
      background: #ff7a99;
      border: 1px solid #703241;
      text-align: center;
	}
	#data {
	  margin-bottom: 10px;
	}
  </style>
</head>
 
<body>
<div class="container">
	<?php if (isset($_SESSION["message"])): ?>
	<div class="message">
		<?php 
			echo $_SESSION["message"];
			unset($_SESSION["message"]);
		?>
	</div>
	<?php elseif (isset($_SESSION["errorMessage"])): ?>
	<div class="errorMessage">
		<?php 
			echo $_SESSION["errorMessage"];
			unset($_SESSION["errorMessage"]);
		?>
	</div>
	<?php endif ?><br>
	
	<select id="data" name="data" onchange="selectData()">
	  <option value="users">Users</option>
	  <option value="activities">Activities</option>
	  <option value="tutors">Tutors</option>
	  <option value="places">Locations</option>
	</select>
	
	<?php if ($data === "users" || $data === "tutors"): ?>
 	<form method="post" action="modifyData.php">
	  <div class="input-group">
	    <input type="text" name="firstName" placeholder="First name">
	    <input type="text" name="lastName" placeholder="Surname">
	    <button class="btn" type="submit" name="add">Add</button>
	  </div>
	</form>
	<?php else: ?>
	<form method="post" action="modifyData.php">
	  <div class="input-group">
		<input type="text" name="name"  placeholder="Name">
		<button class="btn" type="submit" name="add">Add</button>
	  </div>
	</form>
	<?php endif ?>
 
    <table>
      <tr>
        <th><?php echo $_SESSION["desc"] ?></th>
        <th></th>
      </tr>
    <?php
    while($row = $result->fetch(PDO::FETCH_ASSOC)) {
        echo "<tr>";
		if ($data === "users" || $data === "tutors") {
			echo "<td><input type='text' value='$row[firstName]' size='35' onchange='editData(event, $row[id], \"firstName\")' style='border-color: transparent'>
				  <input type='text' value='$row[lastName]' size='35' onchange='editData(event, $row[id], \"lastName\")' style='border-color: transparent'></td>";
			echo "<td><a href=\"modifyData.php?del=$row[id]\" onClick=\"return confirm('Are you sure you want to delete $row[firstName] $row[lastName]?')\">Delete</a></td></tr>";
		}
		else {
			echo "<td><input type='text' value='$row[name]' size='35' onchange='editData(event, $row[id], \"name\")' style='border-color: transparent'></td>";
			echo "<td><a href=\"modifyData.php?del=$row[id]\" onClick=\"return confirm('Are you sure you want to delete $row[name]?')\">Delete</a></td></tr>";
		}
    }
    ?>
    </table>
	</div>
<script>
document.getElementById("data").value="<?php echo $data ?>";

function selectData() {
	let data = document.getElementById("data").value;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", "modifyData.php", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	xhr.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			location.href = "index.php";
		}
	}
	xhr.send("select=" + data);
}

function editData(event, id, column) {
	let name = event.target.value;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", "modifyData.php", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	xhr.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			location.href = "index.php";
		}
	}
	xhr.send("edit=" + id + "&column=" + column + "&value=" + name);
}
</script>
</body>
</html>