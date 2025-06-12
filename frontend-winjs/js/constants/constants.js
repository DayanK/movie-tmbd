// frontend-winjs/js/constants/constants.js
// Constantes et helpers pour l'application MovieDB Explorer WinJS

(function () {
    "use strict";

    // Définition du namespace pour les constantes
    WinJS.Namespace.define("App.Constants", {
        
        // URLs et endpoints API
        API: {
            BASE_URL: 'http://localhost:3005/api',
            TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p/',
            TMDB_YOUTUBE_BASE: 'https://www.youtube.com/watch?v=',
            
            // Endpoints
            ENDPOINTS: {
                DISCOVER: '/discover',
                SEARCH: '/search',
                GENRES: '/genres',
                MOVIE_DETAILS: '/movie/{id}',
                POPULAR: '/popular',
                TOP_RATED: '/top-rated',
                UPCOMING: '/upcoming',
                NOW_PLAYING: '/now-playing',
                RECOMMENDATIONS: '/movie/{id}/recommendations',
                SIMILAR: '/movie/{id}/similar',
                CREDITS: '/movie/{id}/credits',
                VIDEOS: '/movie/{id}/videos'
            }
        },

        // Tailles d'images TMDB
        IMAGE_SIZES: {
            POSTER: {
                SMALL: 'w185',
                MEDIUM: 'w300',
                LARGE: 'w500',
                XLARGE: 'w780',
                ORIGINAL: 'original'
            },
            BACKDROP: {
                SMALL: 'w300',
                MEDIUM: 'w780',
                LARGE: 'w1280',
                ORIGINAL: 'original'
            },
            PROFILE: {
                SMALL: 'w45',
                MEDIUM: 'w185',
                LARGE: 'h632',
                ORIGINAL: 'original'
            }
        },

        // Paramètres de l'application
        APP: {
            NAME: 'MovieDB Explorer',
            VERSION: '2.0.0',
            DESCRIPTION: 'Découvrez et explorez des films avec TMDB',
            AUTHOR: 'MovieDB Team',
            
            // Limites
            MAX_SEARCH_RESULTS: 500,
            MAX_FAVORITES: 1000,
            MAX_CACHE_SIZE: 100,
            MAX_LOG_ENTRIES: 1000,
            
            // Timeouts
            API_TIMEOUT: 10000,
            SEARCH_DEBOUNCE: 500,
            SCROLL_THROTTLE: 100,
            NOTIFICATION_DURATION: 3000,
            
            // Pages
            ITEMS_PER_PAGE: 20,
            MAX_PAGINATION_BUTTONS: 7
        },

        // Types de films et catégories
        MOVIE_CATEGORIES: {
            DISCOVER: 'discover',
            SEARCH: 'search',
            POPULAR: 'popular',
            TOP_RATED: 'top-rated',
            UPCOMING: 'upcoming',
            NOW_PLAYING: 'now-playing',
            FAVORITES: 'favorites'
        },

        // Options de tri
        SORT_OPTIONS: {
            POPULARITY_DESC: 'popularity.desc',
            POPULARITY_ASC: 'popularity.asc',
            RELEASE_DATE_DESC: 'release_date.desc',
            RELEASE_DATE_ASC: 'release_date.asc',
            VOTE_AVERAGE_DESC: 'vote_average.desc',
            VOTE_AVERAGE_ASC: 'vote_average.asc',
            TITLE_ASC: 'title.asc',
            TITLE_DESC: 'title.desc',
            REVENUE_DESC: 'revenue.desc',
            REVENUE_ASC: 'revenue.asc'
        },

        // Types de notifications
        NOTIFICATION_TYPES: {
            SUCCESS: 'success',
            ERROR: 'danger',
            WARNING: 'warning',
            INFO: 'info'
        },

        // Événements de l'application
        EVENTS: {
            MOVIE_CARD_CLICKED: 'movieCardClicked',
            MOVIE_DETAILS_REQUESTED: 'movieDetailsRequested',
            MOVIE_FAVORITE_TOGGLED: 'movieFavoriteToggled',
            SEARCH_PERFORMED: 'searchPerformed',
            CATEGORY_CHANGED: 'categoryChanged',
            LANGUAGE_CHANGED: 'languageChanged',
            SETTINGS_CHANGED: 'settingChanged',
            SETTINGS_RESET: 'settingsReset',
            CACHE_CLEARED: 'cacheCleared',
            CONNECTION_CHANGED: 'connectionChanged'
        },

        // Clés de stockage local
        STORAGE_KEYS: {
            FAVORITES: 'movieFavorites',
            SETTINGS: 'movieApp-settings',
            LANGUAGE: 'app-language',
            CACHE_PREFIX: 'movieApp-cache-',
            SEARCH_HISTORY: 'movieApp-searchHistory',
            USER_PREFERENCES: 'movieApp-preferences'
        },

        // Regex patterns
        PATTERNS: {
            EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            URL: /^https?:\/\/.+/,
            MOVIE_ID: /^\d+$/,
            YEAR: /^(19|20)\d{2}$/,
            RATING: /^([0-9]|10)(\.[0-9])?$/
        },

        // Messages d'erreur standards
        ERROR_MESSAGES: {
            NETWORK_ERROR: 'Erreur de réseau. Vérifiez votre connexion.',
            API_ERROR: 'Erreur de l\'API. Veuillez réessayer plus tard.',
            NOT_FOUND: 'Contenu non trouvé.',
            INVALID_DATA: 'Données invalides.',
            UNAUTHORIZED: 'Non autorisé.',
            TIMEOUT: 'Délai d\'attente dépassé.',
            GENERIC: 'Une erreur est survenue.'
        },

        // Raccourcis clavier
        KEYBOARD_SHORTCUTS: {
            SEARCH_FOCUS: 'f',
            SEARCH_FOCUS_CTRL: 'Ctrl+k',
            HOME: 'Ctrl+h',
            FAVORITES: 'Ctrl+f',
            REFRESH: 'Ctrl+r',
            CLEAR_FILTERS: 'Escape',
            NEXT_PAGE: 'ArrowRight',
            PREVIOUS_PAGE: 'ArrowLeft',
            FIRST_PAGE: 'Home',
            LAST_PAGE: 'End',
            HELP: 'Ctrl+/'
        },

        // Thèmes disponibles
        THEMES: {
            DARK: 'dark',
            LIGHT: 'light',
            AUTO: 'auto'
        },

        // Langues supportées
        LANGUAGES: {
            FRENCH: 'fr',
            ENGLISH: 'en',
            SPANISH: 'es',
            GERMAN: 'de'
        }
    });

    // Helpers et utilitaires globaux
    WinJS.Namespace.define("App.Helpers", {
        
        // Helper pour les URLs
        UrlHelper: WinJS.Class.define(function () {}, {}, {
            // Construire une URL d'API
            buildApiUrl: function (endpoint, params) {
                var url = App.Constants.API.BASE_URL + endpoint;
                
                if (params && Object.keys(params).length > 0) {
                    var searchParams = new URLSearchParams();
                    Object.keys(params).forEach(function (key) {
                        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                            searchParams.append(key, params[key]);
                        }
                    });
                    
                    if (searchParams.toString()) {
                        url += '?' + searchParams.toString();
                    }
                }
                
                return url;
            },

            // Construire une URL d'image TMDB
            buildImageUrl: function (path, type, size) {
                if (!path) {
                    return App.Helpers.UrlHelper.getPlaceholderImageUrl(type);
                }
                
                type = type || 'POSTER';
                size = size || 'MEDIUM';
                
                var sizeValue = App.Constants.IMAGE_SIZES[type] && App.Constants.IMAGE_SIZES[type][size];
                if (!sizeValue) {
                    sizeValue = App.Constants.IMAGE_SIZES.POSTER.MEDIUM;
                }
                
                return App.Constants.API.TMDB_IMAGE_BASE + sizeValue + path;
            },

            // Obtenir une URL d'image placeholder
            getPlaceholderImageUrl: function (type, width, height) {
                width = width || (type === 'BACKDROP' ? 1280 : 300);
                height = height || (type === 'BACKDROP' ? 720 : 450);
                
                return 'https://via.placeholder.com/' + width + 'x' + height + '/1e1e1e/666?text=No+Image';
            },

            // Remplacer les paramètres dans une URL template
            replaceUrlParams: function (template, params) {
                var url = template;
                Object.keys(params).forEach(function (key) {
                    url = url.replace('{' + key + '}', params[key]);
                });
                return url;
            }
        }),

        // Helper pour les données de films
        MovieHelper: WinJS.Class.define(function () {}, {}, {
            // Obtenir l'année d'un film
            getMovieYear: function (movie) {
                if (!movie || !movie.release_date) return 'Inconnue';
                return new Date(movie.release_date).getFullYear();
            },

            // Obtenir la classe CSS pour la note
            getRatingClass: function (rating) {
                if (!rating || rating === 0) return 'text-muted';
                if (rating >= 8) return 'text-success';
                if (rating >= 6) return 'text-warning';
                return 'text-danger';
            },

            // Formater la durée
            formatRuntime: function (minutes) {
                if (!minutes || minutes <= 0) return 'Inconnue';
                var hours = Math.floor(minutes / 60);
                var mins = minutes % 60;
                return hours > 0 ? hours + 'h ' + mins + 'm' : mins + 'm';
            },

            // Obtenir les genres par IDs
            getGenreNames: function (genreIds, allGenres) {
                if (!genreIds || !allGenres) return [];
                
                return genreIds.map(function (id) {
                    var genre = allGenres.find(function (g) { return g.id === id; });
                    return genre ? genre.name : null;
                }).filter(function (name) { return name !== null; });
            },

            // Créer un objet Movie standardisé
            createMovieObject: function (data) {
                return {
                    id: data.id || 0,
                    title: data.title || 'Titre inconnu',
                    original_title: data.original_title || data.title,
                    overview: data.overview || '',
                    poster_path: data.poster_path || null,
                    backdrop_path: data.backdrop_path || null,
                    release_date: data.release_date || null,
                    vote_average: data.vote_average || 0,
                    vote_count: data.vote_count || 0,
                    popularity: data.popularity || 0,
                    genre_ids: data.genre_ids || [],
                    genres: data.genres || [],
                    runtime: data.runtime || null,
                    budget: data.budget || null,
                    revenue: data.revenue || null,
                    adult: data.adult || false,
                    original_language: data.original_language || 'en'
                };
            },

            // Vérifier si un film est valide
            isValidMovie: function (movie) {
                return movie && 
                       movie.id && 
                       typeof movie.id === 'number' && 
                       movie.id > 0 && 
                       movie.title && 
                       movie.title.trim().length > 0;
            }
        }),

        // Helper pour l'interface utilisateur
        UIHelper: WinJS.Class.define(function () {}, {}, {
            // Créer un élément avec classes et attributs
            createElement: function (tag, className, attributes, textContent) {
                var element = document.createElement(tag);
                
                if (className) {
                    element.className = className;
                }
                
                if (attributes) {
                    Object.keys(attributes).forEach(function (attr) {
                        element.setAttribute(attr, attributes[attr]);
                    });
                }
                
                if (textContent) {
                    element.textContent = textContent;
                }
                
                return element;
            },

            // Afficher/masquer un élément avec animation
            toggleElement: function (element, show, animationClass) {
                if (!element) return;
                
                animationClass = animationClass || 'fade';
                
                if (show) {
                    element.style.display = 'block';
                    element.classList.add(animationClass + '-in');
                    element.classList.remove(animationClass + '-out');
                } else {
                    element.classList.add(animationClass + '-out');
                    element.classList.remove(animationClass + '-in');
                    
                    setTimeout(function () {
                        if (element.classList.contains(animationClass + '-out')) {
                            element.style.display = 'none';
                        }
                    }, 300);
                }
            },

            // Faire défiler vers un élément
            scrollToElement: function (element, offset, behavior) {
                if (!element) return;
                
                offset = offset || 0;
                behavior = behavior || 'smooth';
                
                var elementTop = element.offsetTop + offset;
                window.scrollTo({
                    top: elementTop,
                    behavior: behavior
                });
            },

            // Copier du texte dans le presse-papiers
            copyToClipboard: function (text) {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    return navigator.clipboard.writeText(text);
                } else {
                    // Fallback pour les anciens navigateurs
                    var textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    
                    return new WinJS.Promise(function (complete, error) {
                        try {
                            document.execCommand('copy');
                            complete();
                        } catch (err) {
                            error(err);
                        } finally {
                            document.body.removeChild(textArea);
                        }
                    });
                }
            },

            // Obtenir les dimensions de la fenêtre
            getViewportSize: function () {
                return {
                    width: window.innerWidth || document.documentElement.clientWidth,
                    height: window.innerHeight || document.documentElement.clientHeight
                };
            },

            // Vérifier si un élément est visible
            isElementVisible: function (element) {
                if (!element) return false;
                
                var rect = element.getBoundingClientRect();
                var viewport = this.getViewportSize();
                
                return rect.top < viewport.height && 
                       rect.bottom > 0 && 
                       rect.left < viewport.width && 
                       rect.right > 0;
            }
        }),

        // Helper pour les données et validation
        DataHelper: WinJS.Class.define(function () {}, {}, {
            // Valider des données selon un schéma
            validateData: function (data, schema) {
                var errors = [];
                
                Object.keys(schema).forEach(function (field) {
                    var rules = schema[field];
                    var value = data[field];
                    
                    // Vérification de la présence obligatoire
                    if (rules.required && (value === undefined || value === null || value === '')) {
                        errors.push(field + ' est requis');
                        return;
                    }
                    
                    // Vérification du type
                    if (value !== undefined && rules.type && typeof value !== rules.type) {
                        errors.push(field + ' doit être de type ' + rules.type);
                    }
                    
                    // Vérification du pattern regex
                    if (value && rules.pattern && !rules.pattern.test(value)) {
                        errors.push(field + ' format invalide');
                    }
                    
                    // Vérification de la longueur minimale
                    if (value && rules.minLength && value.length < rules.minLength) {
                        errors.push(field + ' doit avoir au moins ' + rules.minLength + ' caractères');
                    }
                    
                    // Vérification de la longueur maximale
                    if (value && rules.maxLength && value.length > rules.maxLength) {
                        errors.push(field + ' ne peut pas dépasser ' + rules.maxLength + ' caractères');
                    }
                });
                
                return {
                    isValid: errors.length === 0,
                    errors: errors
                };
            },

            // Nettoyer les données d'objet
            sanitizeObject: function (obj, allowedFields) {
                var clean = {};
                
                allowedFields.forEach(function (field) {
                    if (obj.hasOwnProperty(field)) {
                        clean[field] = obj[field];
                    }
                });
                
                return clean;
            },

            // Générer un ID unique
            generateId: function (prefix) {
                prefix = prefix || 'id';
                return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            },

            // Comparer deux objets pour égalité
            deepEqual: function (obj1, obj2) {
                if (obj1 === obj2) return true;
                
                if (obj1 == null || obj2 == null) return false;
                
                if (typeof obj1 !== typeof obj2) return false;
                
                if (typeof obj1 !== 'object') return obj1 === obj2;
                
                var keys1 = Object.keys(obj1);
                var keys2 = Object.keys(obj2);
                
                if (keys1.length !== keys2.length) return false;
                
                for (var key of keys1) {
                    if (!keys2.includes(key)) return false;
                    if (!this.deepEqual(obj1[key], obj2[key])) return false;
                }
                
                return true;
            }
        }),

        // Helper pour les événements
        EventHelper: WinJS.Class.define(function () {}, {}, {
            // Émettre un événement d'application
            emit: function (eventType, detail) {
                WinJS.Application.queueEvent({
                    type: eventType,
                    detail: detail || {}
                });
            },

            // Écouter un événement avec nettoyage automatique
            listen: function (eventType, handler, context) {
                var boundHandler = context ? handler.bind(context) : handler;
                WinJS.Application.addEventListener(eventType, boundHandler);
                
                return function () {
                    WinJS.Application.removeEventListener(eventType, boundHandler);
                };
            },

            // Écouter un événement une seule fois
            once: function (eventType, handler, context) {
                var boundHandler = context ? handler.bind(context) : handler;
                var wrappedHandler = function (e) {
                    WinJS.Application.removeEventListener(eventType, wrappedHandler);
                    boundHandler(e);
                };
                
                WinJS.Application.addEventListener(eventType, wrappedHandler);
                
                return function () {
                    WinJS.Application.removeEventListener(eventType, wrappedHandler);
                };
            }
        })
    });

    // Exposition de fonctions utilitaires globales
    WinJS.Namespace.define("App.Utils.Global", {
        // Fonction globale pour obtenir une ressource
        $R: function (key, defaultValue) {
            return WinJS.Resources.getString(key, defaultValue);
        },

        // Fonction globale pour émettre un événement
        $E: function (eventType, detail) {
            return App.Helpers.EventHelper.emit(eventType, detail);
        },

        // Fonction globale pour logger
        $L: function (level, message, data) {
            if (App.Log && App.Log[level]) {
                App.Log[level](message, data);
            }
        },

        // Fonction globale pour obtenir un paramètre
        $S: function (path) {
            return App.Settings ? App.Settings.get(path) : undefined;
        }
    });

})();