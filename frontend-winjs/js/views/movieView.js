// frontend-winjs/js/views/movieView.js
// Contrôles et vues pour l'affichage des films avec syntaxe WinJS native

(function () {
    "use strict";

    // Contrôle pour l'affichage d'une carte de film
    WinJS.Namespace.define("App.Controls", {
        
        // Contrôle MovieCard pour afficher une carte de film individuelle
        MovieCard: WinJS.Class.define(function (element, options) {
            this.element = element;
            element.winControl = this;
            this._data = null;
            this._favorites = JSON.parse(localStorage.getItem('movieFavorites')) || [];
            
            this._createCardUI();
            WinJS.UI.setOptions(this, options || {});
        }, {
            // Création de l'interface utilisateur de la carte
            _createCardUI: function () {
                this.element.className = "movie-card";
                this.element.setAttribute('tabindex', '0');
                this.element.setAttribute('role', 'button');
                
                // Container pour l'image avec overlay
                this._imageContainer = document.createElement("div");
                this._imageContainer.className = "position-relative";
                this.element.appendChild(this._imageContainer);

                // Image du poster
                this._posterImg = document.createElement("img");
                this._posterImg.className = "movie-poster";
                this._posterImg.setAttribute('loading', 'lazy');
                this._imageContainer.appendChild(this._posterImg);

                // Icône favori
                this._favoriteIcon = document.createElement("i");
                this._favoriteIcon.className = "fas fa-heart text-danger position-absolute top-0 end-0 m-2";
                this._favoriteIcon.style.display = "none";
                this._imageContainer.appendChild(this._favoriteIcon);

                // Overlay avec boutons
                this._overlay = document.createElement("div");
                this._overlay.className = "movie-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center opacity-0";
                this._imageContainer.appendChild(this._overlay);

                // Bouton détails
                this._detailsBtn = document.createElement("button");
                this._detailsBtn.className = "btn btn-primary btn-sm me-2";
                this._detailsBtn.innerHTML = '<i class="fas fa-info-circle"></i>';
                this._detailsBtn.setAttribute('aria-label', 'Voir les détails');
                this._overlay.appendChild(this._detailsBtn);

                // Bouton favori
                this._favoriteBtn = document.createElement("button");
                this._favoriteBtn.className = "btn btn-outline-light btn-sm";
                this._favoriteBtn.setAttribute('aria-label', 'Ajouter aux favoris');
                this._overlay.appendChild(this._favoriteBtn);

                // Conteneur des informations
                this._infoContainer = document.createElement("div");
                this._infoContainer.className = "movie-info";
                this.element.appendChild(this._infoContainer);

                // Titre du film
                this._titleElement = document.createElement("h6");
                this._titleElement.className = "movie-title";
                this._infoContainer.appendChild(this._titleElement);

                // Conteneur meta-informations
                this._metaContainer = document.createElement("div");
                this._metaContainer.className = "d-flex justify-content-between align-items-center";
                this._infoContainer.appendChild(this._metaContainer);

                // Année
                this._yearElement = document.createElement("span");
                this._yearElement.className = "movie-year text-muted";
                this._metaContainer.appendChild(this._yearElement);

                // Note
                this._ratingElement = document.createElement("span");
                this._ratingElement.className = "movie-rating";
                this._metaContainer.appendChild(this._ratingElement);

                // Conteneur des genres
                this._genresContainer = document.createElement("div");
                this._genresContainer.className = "movie-genres mt-1";
                this._infoContainer.appendChild(this._genresContainer);

                this._attachEvents();
            },

            // Attachement des événements
            _attachEvents: function () {
                var that = this;

                // Événement de clic sur la carte
                this.element.addEventListener('click', function (e) {
                    if (!e.target.closest('button')) {
                        that._onCardClick();
                    }
                });

                // Événement de focus/blur pour l'overlay
                this.element.addEventListener('mouseenter', function () {
                    that._showOverlay();
                });

                this.element.addEventListener('mouseleave', function () {
                    that._hideOverlay();
                });

                // Événements des boutons
                this._detailsBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    that._onDetailsClick();
                });

                this._favoriteBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    that._onFavoriteClick();
                });

                // Gestion du clavier
                this.element.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        that._onCardClick();
                    }
                });
            },

            // Affichage de l'overlay
            _showOverlay: function () {
                this._overlay.style.opacity = '1';
                this._overlay.style.background = 'rgba(0, 0, 0, 0.7)';
            },

            // Masquage de l'overlay
            _hideOverlay: function () {
                this._overlay.style.opacity = '0';
            },

            // Gestion du clic sur la carte
            _onCardClick: function () {
                if (this._data) {
                    WinJS.Application.queueEvent({
                        type: 'movieCardClicked',
                        detail: this._data
                    });
                }
            },

            // Gestion du clic sur les détails
            _onDetailsClick: function () {
                if (this._data) {
                    WinJS.Application.queueEvent({
                        type: 'movieDetailsRequested',
                        detail: this._data
                    });
                }
            },

            // Gestion du clic sur favori
            _onFavoriteClick: function () {
                if (this._data) {
                    WinJS.Application.queueEvent({
                        type: 'movieFavoriteToggled',
                        detail: this._data
                    });
                }
            },

            // Mise à jour de l'affichage des favoris
            _updateFavoriteDisplay: function () {
                if (!this._data) return;

                var isFavorite = this._favorites.includes(this._data.id);
                
                this._favoriteIcon.style.display = isFavorite ? 'block' : 'none';
                this._favoriteBtn.innerHTML = isFavorite ? 
                    '<i class="fas fa-heart-broken"></i>' : 
                    '<i class="fas fa-heart"></i>';
                this._favoriteBtn.setAttribute('aria-label', 
                    isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris');
            },

            // Rendu des badges de genre
            _renderGenreBadges: function (genreIds) {
                this._genresContainer.innerHTML = '';
                
                if (!genreIds || genreIds.length === 0) return;
                
                var cachedGenres = window.cachedGenres;
                if (!cachedGenres) return;

                genreIds.slice(0, 2).forEach(function (id) {
                    var genre = cachedGenres.find(function (g) { return g.id === id; });
                    if (genre) {
                        var badge = document.createElement('span');
                        badge.className = 'badge bg-secondary me-1 mb-1';
                        badge.textContent = genre.name;
                        this._genresContainer.appendChild(badge);
                    }
                }, this);
            },

            // Propriété pour les données du film
            data: {
                get: function () {
                    return this._data;
                },
                set: function (value) {
                    if (!value) return;
                    
                    this._data = value;
                    var movie = new App.Models.Movie(value);
                    
                    // Mise à jour de l'image
                    this._posterImg.src = movie.getPosterUrl();
                    this._posterImg.alt = movie.title;
                    this._posterImg.onerror = function () {
                        this.src = 'https://via.placeholder.com/300x450/1e1e1e/666?text=No+Image';
                    };

                    // Mise à jour du titre
                    this._titleElement.textContent = movie.title;
                    this._titleElement.title = movie.title;

                    // Mise à jour de l'année
                    this._yearElement.textContent = movie.getYear();

                    // Mise à jour de la note
                    var rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
                    this._ratingElement.innerHTML = `<i class="fas fa-star"></i> ${rating}`;
                    this._ratingElement.className = `movie-rating ${movie.getRatingClass()}`;

                    // Mise à jour des genres
                    this._renderGenreBadges(movie.genre_ids);

                    // Mise à jour de l'affichage des favoris
                    this._updateFavoriteDisplay();
                }
            },

            // Mise à jour des favoris depuis l'extérieur
            updateFavorites: function (favorites) {
                this._favorites = favorites;
                this._updateFavoriteDisplay();
            }
        })
    });

    // Namespace pour les vues principales
    WinJS.Namespace.define("App.Views", {
        
        // Vue principale pour la gestion des films
        MovieView: WinJS.Class.define(function () {
            this._movieService = new App.Services.MovieService();
            this._favorites = JSON.parse(localStorage.getItem('movieFavorites')) || [];
        }, {
            // Rendu de la grille de films
            renderMovies: function (movies, containerId) {
                containerId = containerId || 'movieGrid';
                var container = document.getElementById(containerId);
                var noResults = document.getElementById('noResults');
                
                if (!container) {
                    console.error("Container avec l'ID '" + containerId + "' non trouvé");
                    return;
                }

                if (!movies || movies.length === 0) {
                    container.innerHTML = '';
                    if (noResults) {
                        noResults.classList.remove('d-none');
                    }
                    return;
                }

                if (noResults) {
                    noResults.classList.add('d-none');
                }

                // Nettoyage du container
                container.innerHTML = '';

                // Création des cartes de films
                movies.forEach(function (movieData) {
                    var cardElement = document.createElement('div');
                    cardElement.className = 'col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4';
                    
                    var movieCard = new App.Controls.MovieCard(cardElement);
                    movieCard.data = movieData;
                    
                    container.appendChild(cardElement);
                }, this);
            },

            // Rendu du dropdown des genres
            renderGenres: function (genres, selectId) {
                selectId = selectId || 'genreFilter';
                var select = document.getElementById(selectId);
                
                if (!select) {
                    console.error("Élément select avec l'ID '" + selectId + "' non trouvé");
                    return;
                }

                select.innerHTML = '<option value="">Tous les genres</option>';
                
                if (genres && genres.length > 0) {
                    genres.forEach(function (genre) {
                        var option = document.createElement('option');
                        option.value = genre.id;
                        option.textContent = genre.name;
                        select.appendChild(option);
                    });
                }
            },

            // Rendu de la pagination
            renderPagination: function (currentPage, totalPages, onPageChange) {
                var paginationContainer = document.getElementById('pagination');
                if (!paginationContainer) return;

                var maxVisiblePages = 5;
                var startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                var endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                
                var paginationHTML = '';
                
                // Bouton précédent
                paginationHTML += '<li class="page-item ' + (currentPage === 1 ? 'disabled' : '') + '">' +
                    '<a class="page-link" href="#" data-page="' + (currentPage - 1) + '">' +
                    '<i class="fas fa-chevron-left"></i></a></li>';
                
                // Première page
                if (startPage > 1) {
                    paginationHTML += '<li class="page-item">' +
                        '<a class="page-link" href="#" data-page="1">1</a></li>';
                    if (startPage > 2) {
                        paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
                    }
                }
                
                // Pages visibles
                for (var i = startPage; i <= endPage; i++) {
                    paginationHTML += '<li class="page-item ' + (i === currentPage ? 'active' : '') + '">' +
                        '<a class="page-link" href="#" data-page="' + i + '">' + i + '</a></li>';
                }
                
                // Dernière page
                if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                        paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
                    }
                    paginationHTML += '<li class="page-item">' +
                        '<a class="page-link" href="#" data-page="' + totalPages + '">' + totalPages + '</a></li>';
                }
                
                // Bouton suivant
                paginationHTML += '<li class="page-item ' + (currentPage === totalPages ? 'disabled' : '') + '">' +
                    '<a class="page-link" href="#" data-page="' + (currentPage + 1) + '">' +
                    '<i class="fas fa-chevron-right"></i></a></li>';
                
                paginationContainer.innerHTML = paginationHTML;
                
                // Attachement des événements
                var pageLinks = paginationContainer.querySelectorAll('a.page-link');
                pageLinks.forEach(function (link) {
                    link.addEventListener('click', function (e) {
                        e.preventDefault();
                        var page = parseInt(link.dataset.page);
                        if (page && page !== currentPage && page >= 1 && page <= totalPages) {
                            onPageChange(page);
                        }
                    });
                });
            },

            // Rendu des détails du film dans la modal
            renderMovieDetails: function (movie) {
                var modalBody = document.getElementById('movieModalBody');
                if (!modalBody) return;

                var movieObj = new App.Models.Movie(movie);
                var posterUrl = movieObj.getPosterUrl('w500');
                var backdropUrl = movieObj.getBackdropUrl();
                var runtime = this._formatRuntime(movie.runtime);
                var budget = this._formatCurrency(movie.budget);
                var revenue = this._formatCurrency(movie.revenue);
                var rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

                var detailsHTML = '<div class="row">' +
                    '<div class="col-md-4">' +
                        '<img src="' + posterUrl + '" alt="' + this._escapeHtml(movie.title) + '" class="img-fluid rounded shadow">' +
                    '</div>' +
                    '<div class="col-md-8">' +
                        '<h4 class="text-light mb-2">' + this._escapeHtml(movie.title) + '</h4>';

                if (movie.tagline) {
                    detailsHTML += '<p class="text-warning fst-italic mb-3">"' + this._escapeHtml(movie.tagline) + '"</p>';
                }

                detailsHTML += '<div class="row mb-3">' +
                    '<div class="col-sm-6 mb-2">' +
                        '<strong><i class="fas fa-calendar me-2"></i>Date de sortie:</strong><br>' +
                        '<span class="text-light">' + (movie.release_date || 'Inconnue') + '</span>' +
                    '</div>' +
                    '<div class="col-sm-6 mb-2">' +
                        '<strong><i class="fas fa-clock me-2"></i>Durée:</strong><br>' +
                        '<span class="text-light">' + runtime + '</span>' +
                    '</div>' +
                '</div>';

                detailsHTML += '<div class="row mb-3">' +
                    '<div class="col-sm-6 mb-2">' +
                        '<strong><i class="fas fa-star me-2"></i>Note:</strong><br>' +
                        '<span class="text-warning fs-5">' +
                            this._renderStarRating(movie.vote_average) + ' ' + rating +
                        '</span><br>' +
                        '<small class="text-muted">(' + (movie.vote_count || 0).toLocaleString() + ' votes)</small>' +
                    '</div>' +
                    '<div class="col-sm-6 mb-2">' +
                        '<strong><i class="fas fa-users me-2"></i>Popularité:</strong><br>' +
                        '<span class="text-light">' + (movie.popularity || 0).toFixed(0) + '</span>' +
                    '</div>' +
                '</div>';

                if (movie.genres && movie.genres.length > 0) {
                    detailsHTML += '<div class="mb-3">' +
                        '<strong><i class="fas fa-tags me-2"></i>Genres:</strong><br>';
                    movie.genres.forEach(function (genre) {
                        detailsHTML += '<span class="badge bg-primary me-1 mb-1">' + genre.name + '</span>';
                    });
                    detailsHTML += '</div>';
                }

                detailsHTML += '</div></div>';

                if (movie.overview) {
                    detailsHTML += '<div class="row mt-3">' +
                        '<div class="col-12">' +
                            '<strong><i class="fas fa-align-left me-2"></i>Synopsis:</strong>' +
                            '<p class="text-light mt-2">' + this._escapeHtml(movie.overview) + '</p>' +
                        '</div>' +
                    '</div>';
                }

                modalBody.innerHTML = detailsHTML;

                // Mise à jour du titre de la modal
                var modalTitle = document.getElementById('movieModalTitle');
                if (modalTitle) {
                    modalTitle.textContent = movie.title;
                }
            },

            // Mise à jour des statistiques
            updateStats: function (totalResults, currentPage, totalPages) {
                var resultsCount = document.getElementById('resultsCount');
                var currentPageSpan = document.getElementById('currentPage');
                
                if (resultsCount) {
                    resultsCount.textContent = 'Trouvé ' + totalResults.toLocaleString() + ' films';
                }
                
                if (currentPageSpan) {
                    currentPageSpan.textContent = 'Page ' + currentPage + ' sur ' + totalPages.toLocaleString();
                }
            },

            // Affichage de l'état de chargement
            showLoading: function (show) {
                show = show !== false;
                var spinner = document.getElementById('loadingSpinner');
                var movieGrid = document.getElementById('movieGrid');
                
                if (spinner) {
                    spinner.style.display = show ? 'block' : 'none';
                }
                
                if (movieGrid) {
                    movieGrid.style.opacity = show ? '0.5' : '1';
                }
            },

            // Affichage des notifications
            showNotification: function (message, type, duration) {
                type = type || 'info';
                duration = duration || 3000;
                
                var toast = document.createElement('div');
                toast.className = 'alert alert-' + type + ' alert-dismissible position-fixed top-0 end-0 m-3';
                toast.style.zIndex = '9999';
                toast.style.minWidth = '300px';
                toast.innerHTML = message + 
                    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fermer"></button>';
                
                document.body.appendChild(toast);
                
                setTimeout(function () {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, duration);
            },

            // Nettoyage du contenu
            clearContent: function () {
                var movieGrid = document.getElementById('movieGrid');
                var noResults = document.getElementById('noResults');
                
                if (movieGrid) {
                    movieGrid.innerHTML = '';
                }
                
                if (noResults) {
                    noResults.classList.add('d-none');
                }
            },

            // Méthodes utilitaires privées
            _escapeHtml: function (text) {
                if (!text) return '';
                var div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            },

            _formatRuntime: function (minutes) {
                if (!minutes) return 'Inconnue';
                var hours = Math.floor(minutes / 60);
                var mins = minutes % 60;
                return hours > 0 ? hours + 'h ' + mins + 'm' : mins + 'm';
            },

            _formatCurrency: function (amount) {
                if (!amount || amount === 0) return 'Inconnu';
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(amount);
            },

            _renderStarRating: function (rating) {
                if (!rating) return '<i class="far fa-star"></i>'.repeat(5);
                
                var fullStars = Math.floor(rating / 2);
                var hasHalfStar = (rating / 2) % 1 >= 0.5;
                var emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
                
                return '<i class="fas fa-star"></i>'.repeat(fullStars) +
                       (hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : '') +
                       '<i class="far fa-star"></i>'.repeat(emptyStars);
            }
        })
    });

})();