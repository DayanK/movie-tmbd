/* js/filters.js */
const Filters = {
  query: '',
  genreId: '',
  page: 1,

  setQuery: function (q) {
    this.query = q;
    this.page = 1;
  },
  setGenre: function (id) {
    this.genreId = id;
    this.page = 1;
  },
  nextPage: function () {
    this.page++;
  },
  prevPage: function () {
    if (this.page > 1) this.page--;
  }
};
