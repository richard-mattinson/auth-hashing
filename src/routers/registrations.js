const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma.js')

router.post('/', async (req, res) => {
  // below: 10 is the standard, never go lower than 8/ Going higher will exponentially increase processing time
  const saltRounds = 10;
  // Get the username and password from request body
  const { username, password } = req.body;
  const checkForExistingUser = await prisma.user.findMany({
    where: { username: username },
  });
    if(checkForExistingUser.length !== 0) {
        return res.status(409)
    }
    if(!username || !password) {
        return res.status(400)
    }
  
  // Hash the password: https://github.com/kelektiv/node.bcrypt.js#with-promises
  const hashPassword = await bcrypt.hash(password, saltRounds);
  // Save the user using the prisma user model, setting their password to the hashed version
  const createdUser = await prisma.user.create({
    data: {
    username: username,
    password: hashPassword,
    }
  });
  // Respond back to the client with the created users username and id
  res.status(201).json({ user: createdUser });
});

module.exports = router;
