const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
      // Filter the users array for any user with the same username and password
      let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization?.username;

  // Vérifiez si l'utilisateur est connecté
  if (!username) {
    return res.status(401).json({ message: "You have to be connected to add/edit a review" });
  }

  // Vérifiez si la critique est fournie dans le corps de la requête
  if (!review) {
    return res.status(400).json({ message: "Review is requis" });
  }

  // Vérifiez si le livre existe
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Ajoutez ou mettez à jour la critique sous l'utilisateur connecté
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  
  books[isbn].reviews[username] = review;

  res.status(200).json({ message: "Review successfully added/edited" });
});

// Delete review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  // Vérifiez si l'utilisateur est connecté
  if (!username) {
    return res.status(401).json({ message: "You must be logged in to delete a review" });
  }

  // Vérifiez si le livre existe
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Vérifiez si la critique de l'utilisateur existe pour ce livre
  if (books[isbn].reviews && books[isbn].reviews[username]) {
    // Supprimez la critique de l'utilisateur
    delete books[isbn].reviews[username];
    res.status(200).json({ message: "Review successfully deleted" });
  } else {
    // Si la critique n'existe pas pour cet utilisateur
    res.status(404).json({ message: "Review not found for this user" });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
