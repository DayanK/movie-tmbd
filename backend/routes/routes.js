const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');

router.get('/search', controller.search);
router.get('/discover', controller.discover);
router.get('/movie/:id', controller.movieDetails);
router.get('/genres', controller.genres);

module.exports = router;
