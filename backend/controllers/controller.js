const tmdbService = require('../services/service');

exports.search = async (req, res) => {
  try {
    const { query, page } = req.query;
    const response = await tmdbService.searchMovies(query, page);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
};

exports.discover = async (req, res) => {
  try {
    const filters = req.query;
    const response = await tmdbService.discoverMovies(filters, filters.page);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Discover failed', details: err.message });
  }
};

exports.movieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await tmdbService.getMovieDetails(id);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get movie details', details: err.message });
  }
};

exports.genres = async (req, res) => {

  try {
    const response = await tmdbService.getGenres();
    console.log('TMDB genres API response:', response);


    res.json(response.data.genres);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch genres', details: err.message });
  }
};
