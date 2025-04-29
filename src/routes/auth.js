// src/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/UserLogin'); // Ajuste o caminho se necessário

const router = express.Router();
module.exports = router;
