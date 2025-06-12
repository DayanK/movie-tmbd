 const MovieModel = {
  BASE_URL: "http://localhost:3005/api",

  getGenres: function () {
    return WinJS.xhr({ url: this.BASE_URL + "/genres" }).then(res => {
      return JSON.parse(res.responseText);
    });
  },

  discoverMovies: function () {
    return WinJS.xhr({ url: this.BASE_URL + "/discover" }).then(res => {
      return JSON.parse(res.responseText);
    });
  }
};
