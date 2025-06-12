
 const MovieController = {
  init: function () {
    MovieModel.getGenres().then(MovieView.renderGenres);
    MovieModel.discoverMovies().then(MovieView.renderMovies);
  }
};

document.addEventListener("DOMContentLoaded", function () {
  console.log("content loaded");
  MovieController.init();
});

