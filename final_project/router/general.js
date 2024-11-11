const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Check if a user with the given username already exists
const doesExist = (username) => {
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

public_users.post("/register", (req,res) => {
  const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get all books using an async callback function
public_users.get('/', async function (req, res) {
  try {
    // Utiliser une fonction asynchrone pour renvoyer les livres
    await new Promise((resolve) => {
      resolve(res.send(JSON.stringify(books, null, 4)));
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Utilisation d'une promesse pour obtenir le livre par ISBN
  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  })
  .then((book) => {
    res.send(book);
  })
  .catch((error) => {
    res.status(404).json({ message: error });
  });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  // Utilisation d'une promesse pour obtenir les livres par auteur
  new Promise((resolve, reject) => {
    const booksByAuthor = Object.values(books).filter(book => book.author === author);
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject("No books found by this author");
    }
  })
  .then((booksByAuthor) => {
    res.send(booksByAuthor);
  })
  .catch((error) => {
    res.status(404).json({ message: error });
  });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  // Utilisation d'une promesse pour obtenir les livres par titre
  new Promise((resolve, reject) => {
    const booksByTitle = Object.values(books).filter(book => book.title === title);
    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject("No books found with this title");
    }
  })
  .then((booksByTitle) => {
    res.send(booksByTitle);
  })
  .catch((error) => {
    res.status(404).json({ message: error });
  });
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn

  const book = books[isbn]

  if(book){
    res.send(book.reviews)
  }
});

module.exports.general = public_users;
