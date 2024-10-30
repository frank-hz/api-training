const express = require('express');
const { getall, create, update, remove, login, profile } = require('../controller/userController');
const { project } = require('../midleware/authMiddleware');
const router = express.Router();

router.get('/getall', getall);
router.post('/create', create);
router.post('/update', update);
router.get('/remove/:id', remove);
router.post('/login', login);
router.get('/profile', profile);


module.exports = router;