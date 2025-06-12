// Enhanced backend/controllers/controller.js
const tmdbService = require('../services/service');

// Search movies with enhanced parameters
exports.search = async (req, res) => {
  try {
    const { query, page = 1, with_genres, sort_by } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Query parameter is required',
        success: false 
      });
    }

    const response = await tmdbService.searchMovies(query, page, with_genres);
    
    // Add additional metadata
    const enhancedData = {
      ...response.data,
      search_query: query,
      current_page: parseInt(page),
      success: true
    };

    res.json(enhancedData);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ 
      error: 'Search failed', 
      details: err.message,
      success: false 
    });
  }
};

// Discover movies with enhanced filtering and sorting
exports.discover = async (req, res) => {
  try {
    const { 
      page = 1, 
      with_genres, 
      sort_by = 'popularity.desc',
      vote_average_gte,
      vote_average_lte,
      release_date_gte,
      release_date_lte,
      with_original_language = 'en'
    } = req.query;

    const filters = {
      with_genres,
      sort_by,
      vote_average_gte,
      vote_average_lte,
      release_date_gte,
      release_date_lte,
      with_original_language
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const response = await tmdbService.discoverMovies(filters, page);
    
    // Add additional metadata
    const enhancedData = {
      ...response.data,
      applied_filters: filters,
      current_page: parseInt(page),
      success: true
    };

    res.json(enhancedData);
  } catch (err) {
    console.error('Discover error:', err.message);
    res.status(500).json({ 
      error: 'Discover failed', 
      details: err.message,
      success: false 
    });
  }
};

// Get detailed movie information
exports.movieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Valid movie ID is required',
        success: false 
      });
    }

    const response = await tmdbService.getMovieDetails(id);
    
    // Add success flag
    const enhancedData = {
      ...response.data,
      success: true
    };

    res.json(enhancedData);
  } catch (err) {
    console.error('Movie details error:', err.message);
    
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ 
        error: 'Movie not found', 
        success: false 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to get movie details', 
      details: err.message,
      success: false 
    });
  }
};

// Get all movie genres
exports.genres = async (req, res) => {
  try {
    const response = await tmdbService.getGenres();
    
    if (!response.data || !response.data.genres) {
      throw new Error('Invalid genres response from TMDB API');
    }

    // Add success flag and metadata
    const enhancedData = {
      genres: response.data.genres,
      total_genres: response.data.genres.length,
      success: true
    };

    res.json(enhancedData.genres); // Return just genres array for frontend compatibility
  } catch (err) {
    console.error('Genres error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch genres', 
      details: err.message,
      success: false 
    });
  }
};

// Get popular movies (trending)
exports.popular = async (req, res) => {
  try {
    const { page = 1, time_window = 'week' } = req.query;
    
    const response = await tmdbService.getPopularMovies(page, time_window);
    
    const enhancedData = {
      ...response.data,
      time_window,
      current_page: parseInt(page),
      success: true
    };

    res.json(enhancedData);
  } catch (err) {
    console.error('Popular movies error:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch popular movies', 
      details: err.message,
      success: false 
    });
  }
};

// Get movie recommendations
exports.recommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1 } = req.query;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Valid movie ID is required',
        success: false 
      });
    }

    const response = await tmdbService.getMovieRecommendations(id, page);
    
    const enhancedData = {
      ...response.data,
      base_movie_id: parseInt(id),
      current_page: parseInt(page),
      success: true
    };

    res.json(enhancedData);
  } catch (err) {
    console.error('Recommendations error:', err.message);
    res.status(500).json({ 
      error: 'Failed to get recommendations', 
      details: err.message,
      success: false 
    });
  }
};

// Get movie credits (cast and crew)
exports.movieCredits = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Valid movie ID is required',
        success: false 
      });
    }

    const response = await tmdbService.getMovieCredits(id);
    
    const enhancedData = {
      ...response.data,
      movie_id: parseInt(id),
      success: true
    };

    res.json(enhancedData);
  } catch (err) {
    console.error('Movie credits error:', err.message);
    res.status(500).json({ 
      error: 'Failed to get movie credits', 
      details: err.message,
      success: false 
    });
  }
};

// Advanced search with multiple criteria
exports.advancedSearch = async (req, res) => {
  try {
    const {
      query,
      page = 1,
      include_adult = false,
      region,
      year,
      primary_release_year
    } = req.query;

    if (!query) {
      return res.status(400).json({ 
        error: 'Query parameter is required',
        success: false 
      });
    }

    const searchParams = {
      query,
      page,
      include_adult,
      region,
      year,
      primary_release_year
    };

    // Remove undefined values
    Object.keys(searchParams).forEach(key => 
      searchParams[key] === undefined && delete searchParams[key]
    );

    const response = await tmdbService.advancedSearchMovies(searchParams);
    
    const enhancedData = {
      ...response.data,
      search_parameters: searchParams,
      current_page: parseInt(page),
      success: true
    };

    res.json(enhancedData);
  } catch (err) {
    console.error('Advanced search error:', err.message);
    res.status(500).json({ 
      error: 'Advanced search failed', 
      details: err.message,
      success: false 
    });
  }
};

// Get movie videos (trailers, teasers, etc.)
exports.movieVideos = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Valid movie ID is required',
        success: false 
      });
    }

    const response = await tmdbService.getMovieVideos(id);
    
    const enhancedData = {
      ...response.data,
      movie_id: parseInt(id),
      success: true
    };

    res.json(enhancedData);
  } catch (err) {
    console.error('Movie videos error:', err.message);
    res.status(500).json({ 
      error: 'Failed to get movie videos', 
      details: err.message,
      success: false 
    });
  }
};

// Global error handler middleware
exports.errorHandler = (err, req, res, next) => {
  console.error('Global error:', err);
  
  if (err.response) {
    // TMDB API error
    return res.status(err.response.status).json({
      error: 'TMDB API Error',
      details: err.response.data?.status_message || err.message,
      success: false
    });
  }
  
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Service Unavailable',
      details: 'Unable to connect to TMDB API',
      success: false
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    success: false
  });
};