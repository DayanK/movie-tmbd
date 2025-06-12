const UI = {
  renderMovies: (movies) => {
    const grid = document.getElementById('movieGrid');
    grid.innerHTML = '';

    if (!movies || movies.length === 0) {
      grid.innerHTML = '<p>Aucun film trouvé.</p>';
      return;
    }

    movies.forEach(movie => {
      const item = document.createElement('div');
      item.className = 'movie-item';

      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
        : 'placeholder.jpg';

      item.innerHTML = `
        <img class="movie-poster" src="${poster}" alt="${movie.title}" />
        <h4>${movie.title}</h4>
      `;
      grid.appendChild(item);
    });
  },

  renderGenres: (genres) => {
    const filter = document.getElementById('genreFilter');
    filter.innerHTML = `<option value="">Tous les genres</option>`;
    genres.forEach(genre => {
      const opt = document.createElement('option');
      opt.value = genre.id;
      opt.textContent = genre.name;
      filter.appendChild(opt);
    });
  },

  setPageNumber: (num) => {
    document.getElementById('pageNumber').textContent = num;
  }
};

// Export UI object for use in other modules
export default UI;
