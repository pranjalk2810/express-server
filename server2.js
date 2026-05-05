const express = require('express');
const app = express();

app.use(express.json()); // Parse JSON body

// GET /
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// POST → send JSON, get same JSON back
app.post('/demo-object', (req, res) => {
  const body = req.body;
  res.json(body);
});

// GET with param
app.get('/demo-object/:id', (req, res) => {
  const params = req.params;
  res.json(params);
});

// GET with query
app.get('/demo-object', (req, res) => {
  const query = req.query;
  res.json(query);
});

app.get('/get-user', (req,res)=>{
  res.send("Hello User");
})

app.listen(3000, () => {
  console.log("Server running on port 3000");
});