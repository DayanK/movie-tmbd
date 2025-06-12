// Enhanced backend/services/service.js
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error('TMDB API_KEY is required. Please set it in your .env file.');
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  accept: 'application/json'
};

// Create axios instance with default config
const tmdbApi = axios.create({
  baseURL: BASE_URL,
  headers,
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging
tmdbApi.interceptors.request.use(
  (config) => {
    console.log(`TMDB API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('TMDB API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
tmdbApi.interceptors.response.use(
  (response) => {
    console.log(`TMDB API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('TMDB API Response Error:', {
      status: error.response?.status,
      message: error.response?.data?.status_message || error.message,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

// Enhanced search movies with additional parameters
const searchMovies = async (query, page = 1, genreId = "", options = {}) => {
  const params = {
    api_key: API_KEY,
    query,
    page: parseInt(page),
    language: 'en-US',
    include_adult: false,
    ...options
  };

  // Add genre filter if provided
  if (genreId) {
    params.with_genres = genreId;
  }

  return tmdbApi.get('/search/movie', { params });
};

// Enhanced discover movies with comprehensive filtering
const discoverMovies = async (filters = {}, page = 1) => {
  const params = {
    api_key: API_KEY,
    page: parseInt(page),
    language: 'en-US',
    include_adult: false,
    include_video: true,
    sort_by: 'popularity.desc',
    'vote_count.gte': 50, // Only movies with at least 50 votes
    ...filters
  };

  // Clean up empty parameters
  Object.keys(params).forEach(key => {
    if (params[key] === '' || params[key] === undefined || params[key] === null) {
      delete params[key];
    }
  });

  return tmdbApi.get('/discover/movie', { params });
};

// Get detailed movie information with additional data
const getMovieDetails = async (id) => {
  const params = {
    api_key: API_KEY,
    append_to_response: 'videos,images,credits,recommendations,similar,reviews',
    language: 'en-US'
  };

  return tmdbApi.get(`/movie/${id}`, { params });
};

// Get all movie genres
const getGenres = async () => {
  const params = {
    api_key: API_KEY,
    language: 'en-US'
  };

  return tmdbApi.get('/genre/movie/list', { params });
};

// Get popular/trending movies
const getPopularMovies = async (page = 1, timeWindow = 'week') => {
  const params = {
    api_key: API_KEY,
    page: parseInt(page),
    language: 'en-US'
  };

  // Use trending endpoint for more dynamic results
  if (timeWindow === 'day' || timeWindow === 'week') {
    return tmdbApi.get(`/trending/movie/${timeWindow}`, { params });
  } else {
    // Fallback to popular endpoint
    return tmdbApi.get('/movie/popular', { params });
  }
};

// Get movie recommendations
const getMovieRecommendations = async (id, page = 1) => {
  const params = {
    api_key: API_KEY,
    page: parseInt(page),
    language: 'en-US'
  };

  return tmdbApi.get(`/movie/${id}/recommendations`, { params });
};

// Get similar movies
const getSimilarMovies = async (id, page = 1) => {
  const params = {
    api_key: API_KEY,
    page: parseInt(page),
    language: 'en-US'
  };

  return tmdbApi.get(`/movie/${id}/similar`, { params });
};

// Get movie credits (cast and crew)
const getMovieCredits = async (id) => {
  const params = {
    api_key: API_KEY,
    language: 'en-US'
  };

  return tmdbApi.get(`/movie/${id}/credits`, { params });
};

// Get movie videos (trailers, teasers, etc.)
const getMovieVideos = async (id) => {
  const params = {
    api_key: API_KEY,
    language: 'en-US'
  };

  return tmdbApi.get(`/movie/${id}/videos`, { params });
};

// Get movie images
const getMovieImages = async (id) => {
  const params = {
    api_key: API_KEY,
    include_image_language: 'en,null'
  };

  return tmdbApi.get(`/movie/${id}/images`, { params });
};

// Get movie reviews
const getMovieReviews = async (id, page = 1) => {
  const params = {
    api_key: API_KEY,
    page: parseInt(page),
    language: 'en-US'
  };

  return tmdbApi.get(`/movie/${id}/reviews`, { params });
};

// Advanced search with multiple criteria
const advancedSearchMovies = async (searchParams) => {
  const params = {
    api_key: API_KEY,
    language: 'en-US',
    include_adult: false,
    ...searchParams
  };

  return tmdbApi.get('/search/movie', { params });
};

// Search for people (actors, directors, etc.)
const searchPeople = async (query, page = 1) => {
  const params = {
    api_key: API_KEY,
    query,
    page: parseInt(page),
    language: 'en-US',
    include_adult: false
  };

  return tmdbApi.get('/search/person', { params });
};

// Get person details
const getPersonDetails = async (id) => {
  const params = {
    api_key: API_KEY,
    append_to_response: 'movie_credits,tv_credits,images',
    language: 'en-US'
  };

  return tmdbApi.get(`/person/${id}`, { params });
};

// Get top rated movies
const getTopRatedMovies = async (page = 1) => {
  const params = {
    api_key: API_KEY,
    page: parseInt(page),
    language: 'en-US'
  };

  return tmdbApi.get('/movie/top_rated', { params });
};

// Get upcoming movies
const getUpcomingMovies = async (page = 1) => {
  const params = {
    api_key: API_KEY,
    page: parseInt(page),
    language: 'en-US',
    region: 'US'
  };

  return tmdbApi.get('/movie/upcoming', { params });
};

// Get now playing movies
const getNowPlayingMovies = async (page = 1) => {
  const params = {
    api_key: API_KEY,
    page: parseInt(page),
    language: 'en-US',
    region: 'US'
  };

  return tmdbApi.get('/movie/now_playing', { params });
};

// Get movie watch providers
const getMovieWatchProviders = async (id) => {
  const params = {
    api_key: API_KEY
  };

  return tmdbApi.get(`/movie/${id}/watch/providers`, { params });
};

// Get configuration (for image URLs, etc.)
const getConfiguration = async () => {
  const params = {
    api_key: API_KEY
  };

  return tmdbApi.get('/configuration', { params });
};

// Search movies by multiple criteria (multi-search)
const multiSearch = async (query, page = 1) => {
  const params = {
    api_key: API_KEY,
    query,
    page: parseInt(page),
    language: 'en-US',
    include_adult: false
  };

  return tmdbApi.get('/search/multi', { params });
};

// Get movie keywords
const getMovieKeywords = async (id) => {
  const params = {
    api_key: API_KEY
  };

  return tmdbApi.get(`/movie/${id}/keywords`, { params });
};

// Utility function to build poster URL
const buildImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Utility function to format movie data
const formatMovieData = (movie) => {
  return {
    ...movie,
    poster_url: buildImageUrl(movie.poster_path),
    backdrop_url: buildImageUrl(movie.backdrop_path, 'w1280'),
    release_year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
    rating: movie.vote_average ? parseFloat(movie.vote_average.toFixed(1)) : null,
    formatted_runtime: movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null
  };
};

module.exports = {
  // Core functions
  searchMovies,
  discoverMovies,
  getMovieDetails,
  getGenres,
  
  // Enhanced functions
  getPopularMovies,
  getMovieRecommendations,
  getSimilarMovies,
  getMovieCredits,
  getMovieVideos,
  getMovieImages,
  getMovieReviews,
  advancedSearchMovies,
  
  // People functions
  searchPeople,
  getPersonDetails,
  
  // Category functions
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
  
  // Additional functions
  getMovieWatchProviders,
  getConfiguration,
  multiSearch,
  getMovieKeywords,
  
  // Utility functions
  buildImageUrl,
  formatMovieData
};