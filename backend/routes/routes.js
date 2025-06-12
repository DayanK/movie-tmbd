// Enhanced backend/routes/routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');

// Movie search and discovery routes
router.get('/search', controller.search);
router.get('/discover', controller.discover);
router.get('/advanced-search', controller.advancedSearch);

// Movie details and related content
router.get('/movie/:id', controller.movieDetails);
router.get('/movie/:id/recommendations', controller.recommendations);
router.get('/movie/:id/credits', controller.movieCredits);
router.get('/movie/:id/videos', controller.movieVideos);

// Movie categories
router.get('/popular', controller.popular);
router.get('/top-rated', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const tmdbService = require('../services/service');
    const response = await tmdbService.getTopRatedMovies(page);
    
    res.json({
      ...response.data,
      current_page: parseInt(page),
      success: true
    });
  } catch (err) {
    console.error('Top rated movies error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch top rated movies', 
      details: err.message,
      success: false 
    });
  }
});

router.get('/upcoming', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const tmdbService = require('../services/service');
    const response = await tmdbService.getUpcomingMovies(page);
    
    res.json({
      ...response.data,
      current_page: parseInt(page),
      success: true
    });
  } catch (err) {
    console.error('Upcoming movies error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch upcoming movies', 
      details: err.message,
      success: false 
    });
  }
});

router.get('/now-playing', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const tmdbService = require('../services/service');
    const response = await tmdbService.getNowPlayingMovies(page);
    
    res.json({
      ...response.data,
      current_page: parseInt(page),
      success: true
    });
  } catch (err) {
    console.error('Now playing movies error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch now playing movies', 
      details: err.message,
      success: false 
    });
  }
});

// Genres and configuration
router.get('/genres', controller.genres);

router.get('/configuration', async (req, res) => {
  try {
    const tmdbService = require('../services/service');
    const response = await tmdbService.getConfiguration();
    
    res.json({
      ...response.data,
      success: true
    });
  } catch (err) {
    console.error('Configuration error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch configuration', 
      details: err.message,
      success: false 
    });
  }
});

// People search and details
router.get('/search/person', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Query parameter is required',
        success: false 
      });
    }

    const tmdbService = require('../services/service');
    const response = await tmdbService.searchPeople(query, page);
    
    res.json({
      ...response.data,
      search_query: query,
      current_page: parseInt(page),
      success: true
    });
  } catch (err) {
    console.error('Person search error:', err.message);
    res.status(500).json({ 
      error: 'Person search failed', 
      details: err.message,
      success: false 
    });
  }
});

router.get('/person/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Valid person ID is required',
        success: false 
      });
    }

    const tmdbService = require('../services/service');
    const response = await tmdbService.getPersonDetails(id);
    
    res.json({
      ...response.data,
      success: true
    });
  } catch (err) {
    console.error('Person details error:', err.message);
    
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ 
        error: 'Person not found', 
        success: false 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to get person details', 
      details: err.message,
      success: false 
    });
  }
});

// Multi-search endpoint
router.get('/search/multi', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Query parameter is required',
        success: false 
      });
    }

    const tmdbService = require('../services/service');
    const response = await tmdbService.multiSearch(query, page);
    
    res.json({
      ...response.data,
      search_query: query,
      current_page: parseInt(page),
      success: true
    });
  } catch (err) {
    console.error('Multi search error:', err.message);
    res.status(500).json({ 
      error: 'Multi search failed', 
      details: err.message,
      success: false 
    });
  }
});

// Additional movie data endpoints
router.get('/movie/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Valid movie ID is required',
        success: false 
      });
    }

    const tmdbService = require('../services/service');
    const response = await tmdbService.getMovieImages(id);
    
    res.json({
      ...response.data,
      movie_id: parseInt(id),
      success: true
    });
  } catch (err) {
    console.error('Movie images error:', err.message);
    res.status(500).json({ 
      error: 'Failed to get movie images', 
      details: err.message,
      success: false 
    });
  }
});

router.get('/movie/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1 } = req.query;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Valid movie ID is required',
        success: false 
      });
    }

    const tmdbService = require('../services/service');
    const response = await tmdbService.getMovieReviews(id, page);
    
    res.json({
      ...response.data,
      movie_id: parseInt(id),
      current_page: parseInt(page),
      success: true
    });
  } catch (err) {
    console.error('Movie reviews error:', err.message);
    res.status(500).json({ 
      error: 'Failed to get movie reviews', 
      details: err.message,
      success: false 
    });
  }
});

router.get('/movie/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1 } = req.query;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Valid movie ID is required',
        success: false 
      });
    }

    const tmdbService = require('../services/service');
    const response = await tmdbService.getSimilarMovies(id, page);
    
    res.json({
      ...response.data,
      base_movie_id: parseInt(id),
      current_page: parseInt(page),
      success: true
    });
  } catch (err) {
    console.error('Similar movies error:', err.message);
    res.status(500).json({ 
      error: 'Failed to get similar movies', 
      details: err.message,
      success: false 
    });
  }
});

router.get('/movie/:id/watch-providers', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Valid movie ID is required',
        success: false 
      });
    }

    const tmdbService = require('../services/service');
    const response = await tmdbService.getMovieWatchProviders(id);
    
    res.json({
      ...response.data,
      movie_id: parseInt(id),
      success: true
    });
  } catch (err) {
    console.error('Watch providers error:', err.message);
    res.status(500).json({ 
      error: 'Failed to get watch providers', 
      details: err.message,
      success: false 
    });
  }
});

router.get('/movie/:id/keywords', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Valid movie ID is required',
        success: false 
      });
    }

    const tmdbService = require('../services/service');
    const response = await tmdbService.getMovieKeywords(id);
    
    res.json({
      ...response.data,
      movie_id: parseInt(id),
      success: true
    });
  } catch (err) {
    console.error('Movie keywords error:', err.message);
    res.status(500).json({ 
      error: 'Failed to get movie keywords', 
      details: err.message,
      success: false 
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    endpoints: {
      search: '/api/search',
      discover: '/api/discover',
      movie_details: '/api/movie/:id',
      genres: '/api/genres',
      popular: '/api/popular',
      top_rated: '/api/top-rated',
      upcoming: '/api/upcoming',
      now_playing: '/api/now-playing'
    },
    success: true
  });
});

// Error handling middleware
router.use(controller.errorHandler);

module.exports = router;