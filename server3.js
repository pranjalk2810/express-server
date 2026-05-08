const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// Database connection
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


// SIGNUP (Basic Details) → insert into mas_users = POST method

app.post('/signup', (req, res) => {

  const { uname, email, mobile, password } = req.body;

  if (!uname || !email || !mobile || !password) {
    return res.status(400).json({ 
      message: "All fields required" 
    });
  }

  //check if email exists

  const checkEmailSql = "SELECT * FROM mas_users WHERE email=?";
  db.query(checkEmailSql, [email], (err,result) => {
    if(err){
      return res.status(500).json({
        error: err.message
      });
    }

    //email already exists
    if(result.length>0){
      return res.status(400).json({
        message: "email already in use"
      });
    }

    //insert new user
    const insertSql = "INSERT INTO mas_users (uname, email, mobile, password) VALUES (?, ?, ?, ?)";
    db.execute(
      insertSql,
      [uname, email, mobile, password],
      (err, result)=>{

        if(err){
          return res.status(500).json({
            error: err.message
          });
        }
        res.json({
          message: "Signup successful",
          userId: result.insertId
        });
      }
    );
  });
});  


// LOGIN (login table) = POST method - email must exist; password must match
app.post('/login', (req, res) => {
  const { email,password } = req.body;
  if(!email || !password){
    return res.status(400).json({
      message: "email and password required"
    });
  }

  const sql = "SELECT * FROM mas_users WHERE email = ?";        //asks for email id for login

  db.query(sql, [email], (err, result) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }
    if(result.length === 0){
      return res.status(401).json({
        message:"User not found"
      });
    }
    
    const user = result[0];

    //passwords mismatch
    if(user.password !== password){
      return res.status(401).json({
        message: "invalid password"
      });
    }

    //successful login
    res.json({
      message: "Login successful",
      user: user
    });

  });

});


// UPDATE PROFILE (mas_users)

app.put('/update-user/:id', (req, res) => {

  const id = req.params.id;

  const { uname, email, mobile, password } = req.body;

  const sql = "UPDATE mas_users SET uname=?, email=?, mobile=?, password=? WHERE id=?";

  db.execute(
    sql, [uname, email, mobile, password, id], (err, result) => {

    if (err) {
      return res.status(500).json({ 
        error: err.message });
    }

    res.json({
      message: "User updated successfully"
    });
  });
});


// LIST ALL USERS (mas_users) = GET method
app.get('/users', (req, res) => {
  const sql = "SELECT * FROM mas_users";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ 
        error: err.message 
      });
    }
    res.json(result);
  });
});


// FETCH USER BY ID = GET method
app.get('/users/:id', (req, res) => {
  const id = req.params.id;

  const sql = "SELECT * FROM mas_users WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ 
        error: err.message 
      });
    }

    if (result.length === 0) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    res.json(result[0]);
  });
});


// START SERVER
app.listen(3000, () => {
  console.log("Server running on port 3000");
});