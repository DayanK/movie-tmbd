// frontend-winjs/js/resources/resources.js
// Fichier de ressources pour l'internationalisation avec syntaxe WinJS

(function () {
    "use strict";

    // Définition du namespace pour les ressources
    WinJS.Namespace.define("App.Resources", {
        
        // Gestionnaire de ressources multilingues
        ResourceManager: WinJS.Class.define(function () {
            this._currentLanguage = this._detectLanguage();
            this._resources = new Map();
            this._loadResources();
        }, {
            // Détection automatique de la langue
            _detectLanguage: function () {
                // Priorité : localStorage > navigateur > défaut
                var savedLang = localStorage.getItem('app-language');
                if (savedLang && this._supportedLanguages.indexOf(savedLang) !== -1) {
                    return savedLang;
                }
                
                var browserLang = navigator.language || navigator.userLanguage;
                var langCode = browserLang.split('-')[0];
                
                return this._supportedLanguages.indexOf(langCode) !== -1 ? langCode : 'fr';
            },

            // Langues supportées
            _supportedLanguages: ['fr', 'en', 'es', 'de'],

            // Chargement des ressources
            _loadResources: function () {
                var that = this;
                
                // Ressources françaises (par défaut)
                this._resources.set('fr', {
                    // Navigation
                    'nav.home': 'Accueil',
                    'nav.favorites': 'Favoris',
                    'nav.categories': 'Catégories',
                    
                    // Catégories
                    'category.popular': 'Populaires',
                    'category.topRated': 'Mieux notés',
                    'category.upcoming': 'À venir',
                    'category.nowPlaying': 'Au cinéma',
                    
                    // Application
                    'app.title': 'MovieDB Explorer',
                    'movie.explorer': 'Explorateur de Films',
                    
                    // Recherche
                    'search.title': 'Recherche de Films',
                    'search.query': 'Recherche',
                    'search.genre': 'Genre',
                    'search.sort': 'Tri',
                    'search.allGenres': 'Tous les genres',
                    
                    // Tri
                    'sort.popularityDesc': 'Popularité ↓',
                    'sort.popularityAsc': 'Popularité ↑',
                    'sort.releaseDateDesc': 'Date de sortie ↓',
                    'sort.releaseDateAsc': 'Date de sortie ↑',
                    'sort.ratingDesc': 'Note ↓',
                    'sort.ratingAsc': 'Note ↑',
                    'sort.titleAsc': 'Titre A-Z',
                    'sort.titleDesc': 'Titre Z-A',
                    
                    // Boutons
                    'button.search': 'Rechercher',
                    'button.clear': 'Effacer',
                    'button.close': 'Fermer',
                    'button.addFavorite': 'Ajouter aux favoris',
                    'button.removeFavorite': 'Retirer des favoris',
                    'button.viewDetails': 'Voir les détails',
                    
                    // Chargement
                    'loading.progress': 'Chargement',
                    'loading.movies': 'Chargement des films...',
                    'loading.details': 'Chargement des détails...',
                    'loading.genres': 'Chargement des genres...',
                    
                    // Messages
                    'noResults.title': 'Aucun film trouvé',
                    'noResults.message': 'Essayez d\'ajuster vos critères de recherche',
                    'error.network': 'Erreur de réseau. Vérifiez votre connexion.',
                    'error.api': 'Erreur de l\'API. Veuillez réessayer plus tard.',
                    'error.notFound': 'Film non trouvé',
                    
                    // Films
                    'movie.details': 'Détails du Film',
                    'movie.overview': 'Synopsis',
                    'movie.rating': 'Note',
                    'movie.releaseDate': 'Date de sortie',
                    'movie.runtime': 'Durée',
                    'movie.genres': 'Genres',
                    'movie.budget': 'Budget',
                    'movie.revenue': 'Recettes',
                    'movie.popularity': 'Popularité',
                    'movie.votes': 'votes',
                    'movie.unknown': 'Inconnu'
                });

                // Ressources anglaises
                this._resources.set('en', {
                    // Navigation
                    'nav.home': 'Home',
                    'nav.favorites': 'Favorites',
                    'nav.categories': 'Categories',
                    
                    // Categories
                    'category.popular': 'Popular',
                    'category.topRated': 'Top Rated',
                    'category.upcoming': 'Upcoming',
                    'category.nowPlaying': 'Now Playing',
                    
                    // Application
                    'app.title': 'MovieDB Explorer',
                    'movie.explorer': 'Movie Explorer',
                    
                    // Search
                    'search.title': 'Movie Search',
                    'search.query': 'Search',
                    'search.genre': 'Genre',
                    'search.sort': 'Sort',
                    'search.allGenres': 'All genres',
                    
                    // Sort
                    'sort.popularityDesc': 'Popularity ↓',
                    'sort.popularityAsc': 'Popularity ↑',
                    'sort.releaseDateDesc': 'Release Date ↓',
                    'sort.releaseDateAsc': 'Release Date ↑',
                    'sort.ratingDesc': 'Rating ↓',
                    'sort.ratingAsc': 'Rating ↑',
                    'sort.titleAsc': 'Title A-Z',
                    'sort.titleDesc': 'Title Z-A',
                    
                    // Buttons
                    'button.search': 'Search',
                    'button.clear': 'Clear',
                    'button.close': 'Close',
                    'button.addFavorite': 'Add to Favorites',
                    'button.removeFavorite': 'Remove from Favorites',
                    'button.viewDetails': 'View Details',
                    
                    // Loading
                    'loading.progress': 'Loading',
                    'loading.movies': 'Loading movies...',
                    'loading.details': 'Loading details...',
                    'loading.genres': 'Loading genres...',
                    
                    // Messages
                    'noResults.title': 'No movies found',
                    'noResults.message': 'Try adjusting your search criteria',
                    'error.network': 'Network error. Check your connection.',
                    'error.api': 'API error. Please try again later.',
                    'error.notFound': 'Movie not found',
                    
                    // Movies
                    'movie.details': 'Movie Details',
                    'movie.overview': 'Overview',
                    'movie.rating': 'Rating',
                    'movie.releaseDate': 'Release Date',
                    'movie.runtime': 'Runtime',
                    'movie.genres': 'Genres',
                    'movie.budget': 'Budget',
                    'movie.revenue': 'Revenue',
                    'movie.popularity': 'Popularity',
                    'movie.votes': 'votes',
                    'movie.unknown': 'Unknown'
                });
            },

            // Obtenir une ressource traduite
            getString: function (key, defaultValue) {
                var currentResources = this._resources.get(this._currentLanguage);
                if (currentResources && currentResources[key]) {
                    return currentResources[key];
                }
                
                // Fallback vers le français puis la valeur par défaut
                var frenchResources = this._resources.get('fr');
                if (frenchResources && frenchResources[key]) {
                    return frenchResources[key];
                }
                
                return defaultValue || key;
            },

            // Changer la langue
            setLanguage: function (languageCode) {
                if (this._supportedLanguages.indexOf(languageCode) === -1) {
                    console.warn('Langue non supportée:', languageCode);
                    return false;
                }
                
                this._currentLanguage = languageCode;
                localStorage.setItem('app-language', languageCode);
                
                // Notification du changement pour mettre à jour l'UI
                WinJS.Application.queueEvent({
                    type: 'languageChanged',
                    detail: { language: languageCode }
                });
                
                return true;
            },

            // Obtenir la langue actuelle
            getCurrentLanguage: function () {
                return this._currentLanguage;
            },

            // Obtenir les langues supportées
            getSupportedLanguages: function () {
                return this._supportedLanguages.slice(); // Copie du tableau
            }
        })
    });

    // Instance globale du gestionnaire de ressources
    var resourceManager = new App.Resources.ResourceManager();

    // Exposition globale pour utilisation facile
    WinJS.Namespace.define("WinJS.Resources", {
        getString: function (key, defaultValue) {
            return resourceManager.getString(key, defaultValue);
        },
        
        setLanguage: function (lang) {
            return resourceManager.setLanguage(lang);
        },
        
        getCurrentLanguage: function () {
            return resourceManager.getCurrentLanguage();
        }
    });

    // Gestionnaire pour l'attribut data-win-res
    WinJS.Namespace.define("WinJS.Res", {
        processAll: function (rootElement) {
            rootElement = rootElement || document;
            var elements = rootElement.querySelectorAll('[data-win-res]');
            
            elements.forEach(function (element) {
                try {
                    var resData = JSON.parse(element.getAttribute('data-win-res'));
                    Object.keys(resData).forEach(function (property) {
                        var resourceKey = resData[property];
                        var value = resourceManager.getString(resourceKey);
                        
                        switch (property) {
                            case 'textContent':
                                element.textContent = value;
                                break;
                            case 'innerHTML':
                                element.innerHTML = value;
                                break;
                            case 'title':
                                element.title = value;
                                break;
                            case 'placeholder':
                                element.placeholder = value;
                                break;
                            case 'alt':
                                element.alt = value;
                                break;
                            case 'aria-label':
                                element.setAttribute('aria-label', value);
                                break;
                            default:
                                element.setAttribute(property, value);
                                break;
                        }
                    });
                } catch (e) {
                    console.error('Erreur lors du traitement des ressources pour l\'élément:', element, e);
                }
            });
        }
    });

    // Auto-traitement des ressources au chargement du DOM
    document.addEventListener('DOMContentLoaded', function () {
        WinJS.Res.processAll();
    });

    // Retraitement lors du changement de langue
    WinJS.Application.addEventListener('languageChanged', function () {
        WinJS.Res.processAll();
    });

})();