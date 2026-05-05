const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// 🔌 Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root@123',
  database: 'users_db'
});

db.connect((err) => {
  if (err) {
    console.log("DB connection failed:", err.message);
    return;
  }
  console.log("Connected to MySQL");
});


// =====================================================
// SIGNUP (Basic Details) → insert into mas_users = POST method
// =====================================================
app.post('/signup', (req, res) => {
  const { uname, email, mobile } = req.body;

  if (!uname || !email || !mobile) {
    return res.status(400).json({ message: "All fields required" });
  }

  const sql = "INSERT INTO mas_users (uname, email, mobile) VALUES (?, ?, ?)";

  db.execute(sql, [uname, email, mobile], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      message: "Signup successful",
      userId: result.insertId
    });
  });
});


// =====================================================
// LOGIN (login table) = POST method
// =====================================================
app.post('/login', (req, res) => {
  const { email } = req.body;

  const sql = "SELECT * FROM mas_users WHERE email = ?";        //asks for email id for login

  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      message: "Login successful",
      user: results[0]
    });
  });
});


// =====================================================
// UPDATE PROFILE (mas_users)
// =====================================================
app.put('/update-user/:id', (req, res) => {
  const id = req.params.id;
  const { uname, email, mobile } = req.body;

  const sql = "UPDATE mas_users SET uname=?, email=?, mobile=? WHERE id=?";

  db.execute(sql, [uname, email, mobile, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      message: "User updated successfully"
    });
  });
});


// =====================================================
// CREATE USER (same as signup - separate endpoint) = POST method
// =====================================================
app.post('/create-user', (req, res) => {
  const { uname, email, mobile } = req.body;

  if (!uname || !email || !mobile) {
    return res.status(400).json({ message: "All fields required" });
  }

  const sql = "INSERT INTO mas_users (uname, email, mobile) VALUES (?, ?, ?)";

  db.execute(sql, [uname, email, mobile], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      message: "User created successfully",
      userId: result.insertId
    });
  });
});


// =====================================================
// LIST ALL USERS (mas_users) = GET method
// =====================================================
app.get('/users', (req, res) => {
  const sql = "SELECT * FROM mas_users";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(results);
  });
});


// =====================================================
// FETCH USER BY ID
// =====================================================
app.get('/users/:id', (req, res) => {
  const id = req.params.id;

  const sql = "SELECT * FROM mas_users WHERE id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(results[0]);
  });
});


// =====================================================
// START SERVER
// =====================================================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});