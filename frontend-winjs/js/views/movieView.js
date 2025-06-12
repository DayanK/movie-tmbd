 const MovieView = {
  renderGenres: function (genres) {
    const select = document.getElementById("genreFilter");
    select.innerHTML = `<option value="">Tous</option>`;
    genres.forEach(g => {
      const opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = g.name;
      select.appendChild(opt);
    });
  },

  renderMovies: function (data) {
    const movies = data.results || [];
    const grid = document.getElementById("movieGrid");
    grid.innerHTML = "";
    movies.forEach(movie => {
      const item = document.createElement("div");
      item.className = "movie-item";
      item.innerHTML = `
        <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w200' + movie.poster_path : '../../image/dafault.png'}" />
        <h4>${movie.title}</h4>
      `;
      grid.appendChild(item);
    });
  }
};
