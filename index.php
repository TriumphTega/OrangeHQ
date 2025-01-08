<!DOCTYPE html>
<html lang="en">
<head>

<title>Sign In</title>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE-edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/x-icon" href="/images/favicon.ico">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">
<link rel="stylesheet" href="index.css"/>
</head>

<body>

  <h1>Sempai HQ</h1>

  <h2>Signup</h2>
    <form action="process.php" method="POST">
        <label for="name">Name:</label>
        <input type="text" name="name" required>
        <br>
        <label for="email">Email:</label>
        <input type="email" name="email" required>
        <br>
        <label for="password">Password:</label>
        <input type="password" name="password" required>
        <br>
        <label for="confirm_password">Confirm Password:</label>
        <input type="password" name="confirm_password" required>
        <br>
        <button type="submit" name="signup">Signup</button>
    </form>
    <a href="loginpage.php"><button> Already have an account? Login here</button></a>

<br>

  <div>
    <a href="Hub/Hub2.0.html"><button>Take me to the hub Instead</button></a>
  </div>
</body>
</html>