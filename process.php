<?php
session_start();
require 'db_config.php';

// Signup logic
if (isset($_POST['signup'])) {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];

    
    if ($password !== $confirm_password) {
        die("Passwords do not match. <a href='index.php'>Go back</a>");
    }

    
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    // Insert user into database
    $sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $name, $email, $hashed_password);

    if ($stmt->execute()) {
        header("Location: Hub/Hub2.0.html");
        exit();
    } else {
        die("Error: " . $conn->error . " <a href='index.php'>Go back</a>");
    }
}

// Login logic
if (isset($_POST['login'])) {
    $email = $_POST['email'];
    $password = $_POST['password'];

    // Fetch user from database
    $sql = "SELECT * FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        // Verify password
        if (password_verify($password, $user['password'])) {
            header("Location: Hub/Hub2.0.html");
            exit();
        } else {
            die("Invalid password. <a href='loginpage.php'>Go back</a>");
        }
    } else {
        die("No user found with this email. <a href='loginpage.php'>Go back</a>");
    }
}
?>
