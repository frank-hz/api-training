const express = require('express');
const { create, login, profile, randuser } = require('../controller/userController');
const { project } = require('../midleware/authMiddleware');
const router = express.Router();

router.post('/create', create);
router.post('/login', login);
router.get('/profile', profile);
router.get('/randuser', randuser);

module.exports = router;