const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//

const users = [];
app.post("/signup", (req, res) => {
  const { userHandle, password } = req.body;

  // Validate required fields and length
  if (
    typeof userHandle === "string" &&
    typeof password === "string" &&
    userHandle.length >= 6 &&
    password.length >= 6
  ) {
    users.push({ userHandle, password });
    return res.status(201).send("User registered successfully");
  }
  
  return res.status(400).send("Invalid request body");
});

const secretKey = "1111111";



app.post("/login", (req, res) => {
  const { userHandle, password } = req.body;

  // Validate request body
  if (
    typeof userHandle !== "string" ||
    typeof password !== "string" ||
    userHandle.trim().length < 6 ||
    password.trim().length < 6
  ) {
    return res.status(400).send("Invalid request body");
  }

  // Reject requests with additional fields
  const allowedFields = ["userHandle", "password"];
  const hasInvalidFields = Object.keys(req.body).some(
    (key) => !allowedFields.includes(key)
  );
  if (hasInvalidFields) {
    return res.status(400).send("Request contains invalid fields");
  }

  // Authenticate user
  const user = users.find(
    (item) => item.userHandle === userHandle && item.password === password
  );

  if (user) {
    const token = jwt.sign({ userHandle: user.userHandle }, secretKey, {
      expiresIn: "1h", // Token expires in 1 hour
    });
    console.log("Token generated:", token); // Debugging line
    return res.status(200).json({ jsonWebToken: token }); // Return 200 OK with token
  }

  return res.status(401).send("Unauthorized: Incorrect username or password");
});

// JWT verification middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized, JWT token is missing");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, secretKey);
    console.log("Token verified:", decoded); // Debugging line
    req.user = decoded; // Attach decoded user info to the request
    next();
  } catch (err) {
    console.log("Token verification failed:", err); // Debugging line
    return res.status(401).send("Unauthorized, JWT token is invalid");
  }
}



// JWT verification middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized, JWT token is missing");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach decoded user info to the request
    next();
  } catch (err) {
    return res.status(401).send("Unauthorized, JWT token is invalid");
  }
}
const highScores = []
// POST: High Scores Endpoint
app.post("/high-scores", verifyToken, (req, res) => {
  const { level, userHandle, score, timestamp } = req.body;

  // Validate request body
  if (
    !level ||
    !userHandle ||
    !score ||
    !timestamp ||
    typeof level !== "string" ||
    typeof userHandle !== "string" ||
    typeof score !== "number" ||
    typeof timestamp !== "string"
  ) {
    return res.status(400).send("Invalid request body");
  }

  // Simulate high score submission (e.g., save to a database here)
  console.log("High score submitted:", { level, userHandle, score, timestamp });

  const highScore_data = { level, userHandle, score, timestamp };
  highScores.push(highScore_data);
  return res.status(201).send("High score posted successfully");
});



// GET: High Scores Endpoint with pagination and level filtering
app.get("/high-scores", (req, res) => {
  const { level, page } = req.query;

  // Validate 'level' query parameter
  if (!level || typeof level !== "string") {
    return res.status(400).send("Invalid or missing 'level' query parameter");
  }

  // Filter high scores by level
  const filteredScores = highScores.filter((score) => score.level === level);

  // Sort high scores from biggest to smallest
  const sortedScores = filteredScores.sort((a, b) => b.score - a.score);

  // Implement pagination (default page size: 20)
  const pageSize = 20;
  const pageNumber = parseInt(page, 10) || 1; // Default to page 1 if not provided
  const startIndex = (pageNumber - 1) * pageSize;
  const paginatedScores = sortedScores.slice(startIndex, startIndex + pageSize);

  // Return paginated scores
  return res.status(200).json(paginatedScores);
});




//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};
