const express = require('express');
const { getall, get, create, update, remove, login, profile } = require('../controller/userController');
const { project } = require('../midleware/authMiddleware');
const router = express.Router();

router.get('/getall', getall);
router.get('/get/:id', get);
router.post('/create', create);
router.post('/update', update);
router.get('/remove/:id', remove);
router.post('/login', login);
router.get('/profile', profile);


module.exports = router;