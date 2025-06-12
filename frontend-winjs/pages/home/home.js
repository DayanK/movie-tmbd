(function () {
    "use strict";

    WinJS.UI.Pages.define("/frontend-winjs/pages/home/home.html", {
        ready: function (element, options) {
            loadGenres();
        }
    });

    function loadGenres() {
        WinJS.xhr({ url: "http://localhost:3005/api/genres" }).then(function (response) {
            console.log("Genres chargés avec succès");
            console.log(response.responseText);
            const genres = JSON.parse(response.responseText);
            const list = document.getElementById("genreList");

            genres.forEach(function (genre) {
                const item = document.createElement("div");
                item.className = "genre-item";
                item.textContent = genre.name;
                list.appendChild(item);
            });
        }, function (error) {
            console.error("Erreur lors du chargement des genres :", error);
        });
    }
})();
