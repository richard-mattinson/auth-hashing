const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma.js')

router.post('/', async (req, res) => {
    const jwtSecret = process.env.JWT_SECRET;
    // Get the username and password from the request body
    const { username, password } = req.body;
    // Check that a user with that username exists in the database
    const findUser = await prisma.user.findUnique( 
        { where: {username: username},
        });
    const checkPassword = await bcrypt.compare(password, findUser.password)
    // Use bcrypt to check that the provided password matches the hashed password on the user
    // If either of these checks fail, respond with a 401 "Invalid username or password" error
    if (!findUser) {
        return res.status(401).send({ message: 'User not found' });
    } 
    if (!checkPassword) {
        return res.status(401).send({ message: "Incorrect password" });
    }
    // If the user exists and the passwords match, create a JWT containing the username in the payload
    // Use the JWT_SECRET environment variable for the secret key
    const newToken = jwt.sign({ username }, jwtSecret);
    // Send a JSON object with a "token" key back to the client, the value is the JWT created
    res.json({ data: newToken });
});

module.exports = router;
