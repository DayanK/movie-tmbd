const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.API_KEY;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  accept: 'application/json'
};

const searchMovies = async (query, page = 1, genreId="") =>
  axios.get(`${BASE_URL}/search/movie`, {
    headers,
    params: { 
      api_key: API_KEY,
      query, 
      page, 
      language: 'en-US' 
    }
  }
);

const discoverMovies = async (filters = {}, page = 1) =>
  axios.get(`${BASE_URL}/discover/movie`, {
    headers,
    params: { ...filters, page, language: 'en-US' }
  });

const getMovieDetails = async (id) =>
  axios.get(`${BASE_URL}/movie/${id}`, {
    headers,
    params: { append_to_response: 'videos,images', language: 'en-US' }
  });

const getGenres = async () =>
  axios.get(`${BASE_URL}/genre/movie/list`, {
    headers,
    params: { language: 'en-US' }
  });

module.exports = { searchMovies, discoverMovies, getMovieDetails, getGenres };
