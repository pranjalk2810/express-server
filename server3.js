const express = require('express');
const mysql = require('mysql2');
////////////////////////////////////////
const jwt = require('jsonwebtoken');    //to involve JWT token
///////////////////////////////////////

const app = express();
app.use(express.json());
////////////////////////////////////////////
const SECRET_KEY="mysecretkey";    //secret key for JWT token
///////////////////////////////////////////

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

//////////////////////////////////////////
// Middleware to authenticate JWT token
// JWT verification middleware = check if token is present and valid; 
// if valid, save decoded user info in req.user

function authenticateToken(req, res, next) {
  // get token from headers
  const authHeader = req.headers['authorization'];
  // token format: Bearer token_here
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      message: "Token required"
    });
  }
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid token"
      });
    }
    // save decoded user info
    req.user = user;
    next();
  });
}
/////////////////////////////////////////
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


// LOGIN (login table) = POST method - email must exist; password must match; JWT MUST BE HERE
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
        message: "invalid USERN/PASSWORD"
      });
    }
    // create token
    const token = jwt.sign(       //create encrypted token containing user id and email
      {id: user.id,
        email: user.email
      },
      SECRET_KEY,
      { expiresIn: '1h'
      }
    );
    res.json({
      message: "Login successful",
      token: token
    });
  });
});


// UPDATE PROFILE (mas_users)
//app.put('/update-user/:id', (req, res) => {
app.put('/update-user/:id', authenticateToken, (req, res) => {

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
app.get('/users', authenticateToken, (req, res) => {    //SECURITY ISSUE: only return user list without passwords; alter sql query from * to field names
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
app.get('/users/:id', authenticateToken, (req, res) => {
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

