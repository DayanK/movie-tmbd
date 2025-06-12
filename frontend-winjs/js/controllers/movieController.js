// frontend-winjs/js/controllers/movieController.js
// Contrôleur principal pour la gestion des films avec syntaxe WinJS native

(function () {
    "use strict";

    // Définition du namespace pour les contrôleurs
    WinJS.Namespace.define("App.Controllers", {
        
        // Contrôleur principal pour les films
        MovieController: WinJS.Class.define(function () {
            // Initialisation des services et vues
            this._movieService = new App.Services.MovieService();
            this._movieView = new App.Views.MovieView();
            
            // État de l'application
            this._state = {
                currentPage: 1,
                totalPages: 1,
                currentQuery: '',
                currentGenre: '',
                currentSort: 'popularity.desc',
                currentCategory: 'discover', // discover, popular, top-rated, upcoming, now-playing, search, favorites
                isLoading: false
            };
            
            // Données
            this._genres = [];
            this._favorites = JSON.parse(localStorage.getItem('movieFavorites')) || [];
            this._searchTimeout = null;
            
            // Initialisation
            this._init();
        }, {
            // Initialisation du contrôleur
            _init: function () {
                var that = this;
                
                // Chargement des genres puis des films
                this._loadGenres()
                    .then(function () {
                        return that._loadMovies();
                    })
                    .then(function () {
                        that._setupEventListeners();
                        that._setupKeyboardShortcuts();
                        that._setupApplicationEvents();
                    })
                    .done(null, function (error) {
                        console.error('Échec de l\'initialisation du contrôleur de films:', error);
                        that._movieView.showNotification('Échec de l\'initialisation de l\'application. Veuillez actualiser la page.', 'danger');
                    });
            },

            // Chargement des genres
            _loadGenres: function () {
                var that = this;
                
                return this._movieService.getGenres()
                    .then(function (genres) {
                        that._genres = genres;
                        window.cachedGenres = genres; // Cache global pour les autres composants
                        that._movieView.renderGenres(genres);
                    }, function (error) {
                        console.error('Erreur lors du chargement des genres:', error);
                        that._movieView.showNotification('Échec du chargement des genres', 'warning');
                    });
            },

            // Chargement des films selon la catégorie actuelle
            _loadMovies: function () {
                if (this._state.isLoading) return WinJS.Promise.wrap();
                
                this._state.isLoading = true;
                this._movieView.showLoading(true);

                var that = this;
                var promise;

                switch (this._state.currentCategory) {
                    case 'search':
                        promise = this._movieService.searchMovies(
                            this._state.currentQuery, 
                            this._state.currentPage, 
                            { with_genres: this._state.currentGenre }
                        );
                        break;
                    
                    case 'popular':
                        promise = this._movieService.getPopularMovies(this._state.currentPage);
                        break;
                    
                    case 'top-rated':
                        promise = this._movieService.getTopRatedMovies(this._state.currentPage);
                        break;
                    
                    case 'upcoming':
                        promise = this._movieService.getUpcomingMovies(this._state.currentPage);
                        break;
                    
                    case 'now-playing':
                        promise = this._movieService.getNowPlayingMovies(this._state.currentPage);
                        break;
                    
                    default: // discover
                        promise = this._movieService.discoverMovies({
                            page: this._state.currentPage,
                            sort_by: this._state.currentSort,
                            with_genres: this._state.currentGenre || undefined
                        });
                        break;
                }

                return promise.then(function (data) {
                    that._state.totalPages = Math.min(data.total_pages || 1, 500); // Limite de l'API TMDB
                    that._movieView.renderMovies(data.results || []);
                    that._movieView.renderPagination(that._state.currentPage, that._state.totalPages, function (page) {
                        that._goToPage(page);
                    });
                    that._movieView.updateStats(data.total_results || 0, that._state.currentPage, that._state.totalPages);
                    
                    // Mise à jour de l'URL sans rechargement de page
                    that._updateURL();
                    
                }, function (error) {
                    console.error('Erreur lors du chargement des films:', error);
                    that._movieView.showNotification('Échec du chargement des films. Veuillez réessayer.', 'danger');
                    that._movieView.clearContent();
                }).then(function () {
                    that._state.isLoading = false;
                    that._movieView.showLoading(false);
                }, function () {
                    that._state.isLoading = false;
                    that._movieView.showLoading(false);
                });
            },

            // Configuration des écouteurs d'événements
            _setupEventListeners: function () {
                var that = this;

                // Bouton de recherche
                var searchBtn = document.getElementById('searchBtn');
                if (searchBtn) {
                    searchBtn.addEventListener('click', function () {
                        that._performSearch();
                    });
                }

                // Champ de recherche
                var searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    // Recherche en temps réel avec délai
                    searchInput.addEventListener('input', function (e) {
                        clearTimeout(that._searchTimeout);
                        that._searchTimeout = setTimeout(function () {
                            if (e.target.value.trim().length >= 3) {
                                that._performSearch();
                            } else if (e.target.value.trim().length === 0) {
                                that._clearSearch();
                            }
                        }, 500);
                    });
                    
                    searchInput.addEventListener('keypress', function (e) {
                        if (e.key === 'Enter') {
                            clearTimeout(that._searchTimeout);
                            that._performSearch();
                        }
                    });
                }

                // Bouton d'effacement
                var clearBtn = document.getElementById('clearBtn');
                if (clearBtn) {
                    clearBtn.addEventListener('click', function () {
                        that._clearAllFilters();
                    });
                }

                // Filtre par genre
                var genreFilter = document.getElementById('genreFilter');
                if (genreFilter) {
                    genreFilter.addEventListener('change', function (e) {
                        that._state.currentGenre = e.target.value;
                        that._state.currentPage = 1;
                        that._loadMovies();
                    });
                }

                // Tri
                var sortBy = document.getElementById('sortBy');
                if (sortBy) {
                    sortBy.addEventListener('change', function (e) {
                        that._state.currentSort = e.target.value;
                        that._state.currentPage = 1;
                        that._loadMovies();
                    });
                }

                // Liens de navigation
                var homeLink = document.getElementById('homeLink');
                if (homeLink) {
                    homeLink.addEventListener('click', function (e) {
                        e.preventDefault();
                        that._showHome();
                    });
                }

                var favoritesLink = document.getElementById('favoritesLink');
                if (favoritesLink) {
                    favoritesLink.addEventListener('click', function (e) {
                        e.preventDefault();
                        that._showFavorites();
                    });
                }

                // Boutons de catégorie
                var categoryButtons = document.querySelectorAll('[data-category]');
                categoryButtons.forEach(function (btn) {
                    btn.addEventListener('click', function (e) {
                        e.preventDefault();
                        var category = btn.dataset.category;
                        that._setCategory(category);
                    });
                });
            },

            // Configuration des raccourcis clavier
            _setupKeyboardShortcuts: function () {
                var that = this;
                
                document.addEventListener('keydown', function (e) {
                    // Seulement si on ne tape pas dans un input
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                    
                    switch (e.key) {
                        case 'f':
                        case 'F':
                            e.preventDefault();
                            var searchInput = document.getElementById('searchInput');
                            if (searchInput) searchInput.focus();
                            break;
                        case 'ArrowLeft':
                            e.preventDefault();
                            that._previousPage();
                            break;
                        case 'ArrowRight':
                            e.preventDefault();
                            that._nextPage();
                            break;
                        case 'Home':
                            e.preventDefault();
                            that._goToPage(1);
                            break;
                        case 'End':
                            e.preventDefault();
                            that._goToPage(that._state.totalPages);
                            break;
                        case 'Escape':
                            e.preventDefault();
                            that._clearAllFilters();
                            break;
                    }
                    
                    // Raccourcis avec Ctrl
                    if (e.ctrlKey) {
                        switch (e.key) {
                            case 'k':
                            case 'K':
                                e.preventDefault();
                                var searchInput = document.getElementById('searchInput');
                                if (searchInput) searchInput.focus();
                                break;
                            case 'h':
                            case 'H':
                                e.preventDefault();
                                that._showHome();
                                break;
                            case 'f':
                            case 'F':
                                e.preventDefault();
                                that._showFavorites();
                                break;
                            case 'r':
                            case 'R':
                                e.preventDefault();
                                that._refresh();
                                break;
                        }
                    }
                });
            },

            // Configuration des événements d'application WinJS
            _setupApplicationEvents: function () {
                var that = this;

                // Événement de clic sur carte de film
                WinJS.Application.addEventListener('movieCardClicked', function (e) {
                    that._showMovieDetails(e.detail.id);
                });

                // Événement de demande de détails
                WinJS.Application.addEventListener('movieDetailsRequested', function (e) {
                    that._showMovieDetails(e.detail.id);
                });

                // Événement de basculement de favori
                WinJS.Application.addEventListener('movieFavoriteToggled', function (e) {
                    that._toggleFavorite(e.detail.id, e.detail.title);
                });
            },

            // Effectuer une recherche
            _performSearch: function () {
                var searchInput = document.getElementById('searchInput');
                if (!searchInput) return;

                var query = searchInput.value.trim();
                
                if (query.length === 0) {
                    this._clearSearch();
                    return;
                }

                this._state.currentQuery = query;
                this._state.currentCategory = 'search';
                this._state.currentPage = 1;
                this._loadMovies();
            },

            // Effacer la recherche et retourner à la découverte
            _clearSearch: function () {
                this._state.currentQuery = '';
                this._state.currentCategory = 'discover';
                this._state.currentPage = 1;
                this._loadMovies();
            },

            // Effacer tous les filtres
            _clearAllFilters: function () {
                var searchInput = document.getElementById('searchInput');
                var genreFilter = document.getElementById('genreFilter');
                var sortBy = document.getElementById('sortBy');
                
                if (searchInput) searchInput.value = '';
                if (genreFilter) genreFilter.value = '';
                if (sortBy) sortBy.value = 'popularity.desc';
                
                this._state.currentQuery = '';
                this._state.currentGenre = '';
                this._state.currentSort = 'popularity.desc';
                this._state.currentCategory = 'discover';
                this._state.currentPage = 1;
                
                this._loadMovies();
            },

            // Définir la catégorie de films
            _setCategory: function (category) {
                this._state.currentCategory = category;
                this._state.currentPage = 1;
                
                // Mise à jour de la navigation active
                var categoryButtons = document.querySelectorAll('[data-category]');
                categoryButtons.forEach(function (btn) {
                    btn.classList.toggle('active', btn.dataset.category === category);
                });
                
                this._loadMovies();
            },

            // Navigation par pages
            _goToPage: function (page) {
                if (page < 1 || page > this._state.totalPages || page === this._state.currentPage) return;
                
                this._state.currentPage = page;
                this._loadMovies();
                
                // Défiler vers le haut
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },

            _nextPage: function () {
                this._goToPage(this._state.currentPage + 1);
            },

            _previousPage: function () {
                this._goToPage(this._state.currentPage - 1);
            },

            // Afficher les détails d'un film
            _showMovieDetails: function (movieId) {
                if (!movieId) return;

                var that = this;
                this._movieView.showLoading(true);
                
                this._movieService.getMovieDetails(movieId)
                    .then(function (movie) {
                        that._movieView.renderMovieDetails(movie);
                        that._updateFavoriteButton(movieId, movie.title);
                        
                        // Affichage de la modal
                        var modal = new bootstrap.Modal(document.getElementById('movieModal'));
                        modal.show();
                        
                    }, function (error) {
                        console.error('Erreur lors du chargement des détails du film:', error);
                        that._movieView.showNotification('Échec du chargement des détails du film', 'danger');
                    })
                    .then(function () {
                        that._movieView.showLoading(false);
                    }, function () {
                        that._movieView.showLoading(false);
                    });
            },

            // Basculer le statut de favori
            _toggleFavorite: function (movieId, movieTitle) {
                if (!movieId) return;

                var index = this._favorites.indexOf(movieId);
                
                if (index > -1) {
                    this._favorites.splice(index, 1);
                    this._movieView.showNotification(movieTitle + ' retiré des favoris', 'success');
                } else {
                    this._favorites.push(movieId);
                    this._movieView.showNotification(movieTitle + ' ajouté aux favoris', 'success');
                }
                
                // Mise à jour du localStorage
                localStorage.setItem('movieFavorites', JSON.stringify(this._favorites));
                
                // Mise à jour du bouton favori dans la modal si ouverte
                this._updateFavoriteButton(movieId, movieTitle);
                
                // Actualisation de la vue actuelle si on affiche les favoris
                if (this._state.currentCategory === 'favorites') {
                    this._showFavorites();
                } else {
                    // Re-rendu des films actuels pour mettre à jour les icônes de favoris
                    this._loadMovies();
                }
            },

            // Mise à jour du bouton favori dans la modal
            _updateFavoriteButton: function (movieId, movieTitle) {
                var favBtn = document.getElementById('addToFavorites');
                if (!favBtn) return;

                var isFavorite = this._favorites.includes(parseInt(movieId));
                favBtn.innerHTML = isFavorite ? 
                    '<i class="fas fa-heart-broken me-2"></i>Retirer des favoris' :
                    '<i class="fas fa-heart me-2"></i>Ajouter aux favoris';
                
                var that = this;
                favBtn.onclick = function () {
                    that._toggleFavorite(parseInt(movieId), movieTitle);
                };
            },

            // Afficher la page d'accueil
            _showHome: function () {
                this._clearAllFilters();
                this._setCategory('discover');
            },

            // Afficher les favoris
            _showFavorites: function () {
                if (this._favorites.length === 0) {
                    this._movieView.clearContent();
                    this._movieView.showNotification('Aucun film favori pour le moment. Ajoutez des films à vos favoris !', 'info');
                    return;
                }

                this._state.currentCategory = 'favorites';
                this._movieView.showLoading(true);

                var that = this;
                
                // Chargement des détails de tous les films favoris
                var promises = this._favorites.map(function (movieId) {
                    return that._movieService.getMovieDetails(movieId)
                        .then(function (movie) {
                            return movie;
                        }, function (error) {
                            console.error('Échec du chargement du film favori ' + movieId + ':', error);
                            return null;
                        });
                });

                WinJS.Promise.join(promises)
                    .then(function (favoriteMovies) {
                        // Filtrage des requêtes échouées
                        var validMovies = favoriteMovies.filter(function (movie) {
                            return movie !== null;
                        });
                        
                        that._movieView.renderMovies(validMovies);
                        that._movieView.updateStats(validMovies.length, 1, 1);
                        
                        // Masquage de la pagination pour les favoris
                        var paginationContainer = document.getElementById('paginationContainer');
                        if (paginationContainer) {
                            paginationContainer.style.display = 'none';
                        }
                        
                    }, function (error) {
                        console.error('Erreur lors du chargement des favoris:', error);
                        that._movieView.showNotification('Échec du chargement des films favoris', 'danger');
                    })
                    .then(function () {
                        that._movieView.showLoading(false);
                    }, function () {
                        that._movieView.showLoading(false);
                    });
            },

            // Mise à jour de l'URL pour la navigation profonde
            _updateURL: function () {
                var params = new URLSearchParams();
                
                if (this._state.currentCategory !== 'discover') {
                    params.set('category', this._state.currentCategory);
                }
                
                if (this._state.currentQuery) {
                    params.set('q', this._state.currentQuery);
                }
                
                if (this._state.currentGenre) {
                    params.set('genre', this._state.currentGenre);
                }
                
                if (this._state.currentSort !== 'popularity.desc') {
                    params.set('sort', this._state.currentSort);
                }
                
                if (this._state.currentPage > 1) {
                    params.set('page', this._state.currentPage);
                }

                var url = params.toString() ? '?' + params.toString() : '';
                window.history.replaceState({}, '', url);
            },

            // Chargement de l'état depuis l'URL
            _loadFromURL: function () {
                var params = new URLSearchParams(window.location.search);
                
                this._state.currentCategory = params.get('category') || 'discover';
                this._state.currentQuery = params.get('q') || '';
                this._state.currentGenre = params.get('genre') || '';
                this._state.currentSort = params.get('sort') || 'popularity.desc';
                this._state.currentPage = parseInt(params.get('page')) || 1;

                // Mise à jour des éléments de formulaire
                var searchInput = document.getElementById('searchInput');
                var genreFilter = document.getElementById('genreFilter');
                var sortBy = document.getElementById('sortBy');
                
                if (searchInput) searchInput.value = this._state.currentQuery;
                if (genreFilter) genreFilter.value = this._state.currentGenre;
                if (sortBy) sortBy.value = this._state.currentSort;
            },

            // Actualisation de la vue actuelle
            _refresh: function () {
                this._loadMovies();
            },

            // Nettoyage du cache
            _clearCache: function () {
                this._movieService.clearCache();
                this._movieView.showNotification('Cache vidé avec succès', 'success');
            },

            // Obtenir l'état actuel
            getCurrentState: function () {
                return {
                    category: this._state.currentCategory,
                    query: this._state.currentQuery,
                    genre: this._state.currentGenre,
                    sort: this._state.currentSort,
                    page: this._state.currentPage,
                    totalPages: this._state.totalPages,
                    favorites: this._favorites.length
                };
            },

            // Méthodes publiques pour l'API
            loadFromURL: function () {
                this._loadFromURL();
            },

            refresh: function () {
                this._refresh();
            },

            clearCache: function () {
                this._clearCache();
            }
        })
    });

    // Instance globale du contrôleur
    var movieController;

    // Initialisation lorsque le DOM est chargé
    document.addEventListener('DOMContentLoaded', function () {
        movieController = new App.Controllers.MovieController();
        movieController.loadFromURL();
        
        // Exposition globale pour le débogage
        window.movieController = movieController;
    });

})();