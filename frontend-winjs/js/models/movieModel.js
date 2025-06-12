// frontend-winjs/js/models/movieModel.js
// Modèle de données pour l'application de films avec syntaxe WinJS native

(function () {
    "use strict";

    // Définition du namespace pour les modèles de données
    WinJS.Namespace.define("App.Models", {
        
        // Classe Movie pour représenter un film
        Movie: WinJS.Class.define(function (data) {
            this.id = data.id || 0;
            this.title = data.title || "";
            this.poster_path = data.poster_path || "";
            this.backdrop_path = data.backdrop_path || "";
            this.overview = data.overview || "";
            this.release_date = data.release_date || "";
            this.vote_average = data.vote_average || 0;
            this.vote_count = data.vote_count || 0;
            this.genre_ids = data.genre_ids || [];
            this.popularity = data.popularity || 0;
            this.adult = data.adult || false;
            this.original_language = data.original_language || "en";
        }, {
            // Méthodes de l'instance Movie
            getPosterUrl: function (size) {
                size = size || "w300";
                if (!this.poster_path) {
                    return 'https://via.placeholder.com/300x450/1e1e1e/666?text=No+Image';
                }
                return `https://image.tmdb.org/t/p/${size}${this.poster_path}`;
            },

            getBackdropUrl: function (size) {
                size = size || "w1280";
                if (!this.backdrop_path) {
                    return 'https://via.placeholder.com/1280x720/1e1e1e/666?text=No+Image';
                }
                return `https://image.tmdb.org/t/p/${size}${this.backdrop_path}`;
            },

            getYear: function () {
                if (!this.release_date) return 'Unknown';
                return new Date(this.release_date).getFullYear();
            },

            getRatingClass: function () {
                if (!this.vote_average) return 'text-muted';
                if (this.vote_average >= 8) return 'text-success';
                if (this.vote_average >= 6) return 'text-warning';
                return 'text-danger';
            }
        }),

        // Classe Genre pour représenter un genre de film
        Genre: WinJS.Class.define(function (data) {
            this.id = data.id || 0;
            this.name = data.name || "";
        })
    });

    // Service de données pour l'API TMDB
    WinJS.Namespace.define("App.Services", {
        MovieService: WinJS.Class.define(function () {
            this._baseUrl = "http://localhost:3005/api";
            this._cache = new Map();
            this._cacheTimeout = 5 * 60 * 1000; // 5 minutes
        }, {
            // Méthode utilitaire pour les requêtes HTTP
            _makeRequest: function (url, options) {
                var that = this;
                return new WinJS.Promise(function (complete, error) {
                    var xhr = new XMLHttpRequest();
                    xhr.open(options.method || 'GET', url, true);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4) {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                try {
                                    var data = JSON.parse(xhr.responseText);
                                    complete(data);
                                } catch (e) {
                                    error(new Error('Erreur de parsing JSON: ' + e.message));
                                }
                            } else {
                                error(new Error('Erreur HTTP: ' + xhr.status));
                            }
                        }
                    };
                    
                    xhr.onerror = function () {
                        error(new Error('Erreur de réseau'));
                    };
                    
                    xhr.send(options.body || null);
                });
            },

            // Gestion du cache
            _getCacheKey: function (endpoint, params) {
                params = params || {};
                var paramString = Object.keys(params)
                    .sort()
                    .map(function (key) { return key + '=' + params[key]; })
                    .join('&');
                return endpoint + '?' + paramString;
            },

            _getFromCache: function (key) {
                var cached = this._cache.get(key);
                if (cached && Date.now() - cached.timestamp < this._cacheTimeout) {
                    return cached.data;
                }
                this._cache.delete(key);
                return null;
            },

            _setCache: function (key, data) {
                this._cache.set(key, {
                    data: data,
                    timestamp: Date.now()
                });
            },

            // Récupération des genres
            getGenres: function () {
                var that = this;
                var cacheKey = this._getCacheKey('/genres');
                var cached = this._getFromCache(cacheKey);
                
                if (cached) {
                    return WinJS.Promise.wrap(cached);
                }

                return this._makeRequest(this._baseUrl + '/genres')
                    .then(function (data) {
                        that._setCache(cacheKey, data);
                        return data;
                    });
            },

            // Découverte de films avec filtres
            discoverMovies: function (filters) {
                filters = filters || {};
                var params = new URLSearchParams();
                
                Object.keys(filters).forEach(function (key) {
                    if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
                        params.append(key, filters[key]);
                    }
                });

                var url = this._baseUrl + '/discover?' + params.toString();
                return this._makeRequest(url);
            },

            // Recherche de films
            searchMovies: function (query, page, filters) {
                page = page || 1;
                filters = filters || {};
                
                if (!query || !query.trim()) {
                    return WinJS.Promise.wrapError(new Error('La requête de recherche ne peut pas être vide'));
                }

                var params = new URLSearchParams();
                params.append('query', query);
                params.append('page', page);
                
                Object.keys(filters).forEach(function (key) {
                    if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
                        params.append(key, filters[key]);
                    }
                });

                var url = this._baseUrl + '/search?' + params.toString();
                return this._makeRequest(url);
            },

            // Détails d'un film
            getMovieDetails: function (id) {
                if (!id) {
                    return WinJS.Promise.wrapError(new Error('ID du film requis'));
                }

                var cacheKey = this._getCacheKey('/movie/' + id);
                var cached = this._getFromCache(cacheKey);
                
                if (cached) {
                    return WinJS.Promise.wrap(cached);
                }

                var that = this;
                return this._makeRequest(this._baseUrl + '/movie/' + id)
                    .then(function (data) {
                        that._setCache(cacheKey, data);
                        return data;
                    });
            },

            // Films populaires
            getPopularMovies: function (page, timeWindow) {
                page = page || 1;
                timeWindow = timeWindow || 'week';
                
                var params = new URLSearchParams();
                params.append('page', page);
                params.append('time_window', timeWindow);

                var url = this._baseUrl + '/popular?' + params.toString();
                return this._makeRequest(url);
            },

            // Films les mieux notés
            getTopRatedMovies: function (page) {
                page = page || 1;
                var params = new URLSearchParams();
                params.append('page', page);

                var url = this._baseUrl + '/top-rated?' + params.toString();
                return this._makeRequest(url);
            },

            // Films à venir
            getUpcomingMovies: function (page) {
                page = page || 1;
                var params = new URLSearchParams();
                params.append('page', page);

                var url = this._baseUrl + '/upcoming?' + params.toString();
                return this._makeRequest(url);
            },

            // Films actuellement au cinéma
            getNowPlayingMovies: function (page) {
                page = page || 1;
                var params = new URLSearchParams();
                params.append('page', page);

                var url = this._baseUrl + '/now-playing?' + params.toString();
                return this._makeRequest(url);
            },

            // Recommandations de films
            getMovieRecommendations: function (id, page) {
                if (!id) {
                    return WinJS.Promise.wrapError(new Error('ID du film requis'));
                }

                page = page || 1;
                var params = new URLSearchParams();
                params.append('page', page);

                var url = this._baseUrl + '/movie/' + id + '/recommendations?' + params.toString();
                return this._makeRequest(url);
            },

            // Films similaires
            getSimilarMovies: function (id, page) {
                if (!id) {
                    return WinJS.Promise.wrapError(new Error('ID du film requis'));
                }

                page = page || 1;
                var params = new URLSearchParams();
                params.append('page', page);

                var url = this._baseUrl + '/movie/' + id + '/similar?' + params.toString();
                return this._makeRequest(url);
            },

            // Crédits d'un film
            getMovieCredits: function (id) {
                if (!id) {
                    return WinJS.Promise.wrapError(new Error('ID du film requis'));
                }

                var cacheKey = this._getCacheKey('/movie/' + id + '/credits');
                var cached = this._getFromCache(cacheKey);
                
                if (cached) {
                    return WinJS.Promise.wrap(cached);
                }

                var that = this;
                return this._makeRequest(this._baseUrl + '/movie/' + id + '/credits')
                    .then(function (data) {
                        that._setCache(cacheKey, data);
                        return data;
                    });
            },

            // Vidéos d'un film
            getMovieVideos: function (id) {
                if (!id) {
                    return WinJS.Promise.wrapError(new Error('ID du film requis'));
                }

                var cacheKey = this._getCacheKey('/movie/' + id + '/videos');
                var cached = this._getFromCache(cacheKey);
                
                if (cached) {
                    return WinJS.Promise.wrap(cached);
                }

                var that = this;
                return this._makeRequest(this._baseUrl + '/movie/' + id + '/videos')
                    .then(function (data) {
                        that._setCache(cacheKey, data);
                        return data;
                    });
            },

            // Recherche multi-critères
            multiSearch: function (query, page) {
                if (!query || !query.trim()) {
                    return WinJS.Promise.wrapError(new Error('La requête de recherche ne peut pas être vide'));
                }

                page = page || 1;
                var params = new URLSearchParams();
                params.append('query', query);
                params.append('page', page);

                var url = this._baseUrl + '/search/multi?' + params.toString();
                return this._makeRequest(url);
            },

            // Nettoyage du cache
            clearCache: function () {
                this._cache.clear();
            },

            // Statistiques du cache
            getCacheStats: function () {
                return {
                    size: this._cache.size,
                    keys: Array.from(this._cache.keys())
                };
            }
        })
    });

})();