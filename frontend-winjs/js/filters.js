/* frontend-winjs/js/filters.js */
// Gestionnaire de filtres et état de recherche pour l'application WinJS

(function () {
    "use strict";

    // Namespace pour les filtres
    WinJS.Namespace.define("App.Filters", {
        
        // Gestionnaire d'état des filtres
        FilterManager: WinJS.Class.define(function () {
            this._state = {
                query: '',
                genreId: '',
                page: 1,
                sortBy: 'popularity.desc',
                category: 'discover'
            };
            this._subscribers = [];
        }, {
            // Obtenir l'état actuel
            getState: function () {
                return Object.assign({}, this._state);
            },

            // Mettre à jour la requête de recherche
            setQuery: function (query) {
                this._state.query = query || '';
                this._state.page = 1; // Reset page
                this._notifySubscribers();
            },

            // Mettre à jour le genre
            setGenre: function (genreId) {
                this._state.genreId = genreId || '';
                this._state.page = 1; // Reset page
                this._notifySubscribers();
            },

            // Mettre à jour le tri
            setSortBy: function (sortBy) {
                this._state.sortBy = sortBy || 'popularity.desc';
                this._state.page = 1; // Reset page
                this._notifySubscribers();
            },

            // Mettre à jour la catégorie
            setCategory: function (category) {
                this._state.category = category || 'discover';
                this._state.page = 1; // Reset page
                this._notifySubscribers();
            },

            // Aller à la page suivante
            nextPage: function () {
                this._state.page++;
                this._notifySubscribers();
            },

            // Aller à la page précédente
            prevPage: function () {
                if (this._state.page > 1) {
                    this._state.page--;
                    this._notifySubscribers();
                }
            },

            // Aller à une page spécifique
            setPage: function (page) {
                if (page >= 1) {
                    this._state.page = page;
                    this._notifySubscribers();
                }
            },

            // Effacer tous les filtres
            clearAll: function () {
                this._state = {
                    query: '',
                    genreId: '',
                    page: 1,
                    sortBy: 'popularity.desc',
                    category: 'discover'
                };
                this._notifySubscribers();
            },

            // S'abonner aux changements
            subscribe: function (callback) {
                if (typeof callback === 'function') {
                    this._subscribers.push(callback);
                }
            },

            // Se désabonner
            unsubscribe: function (callback) {
                var index = this._subscribers.indexOf(callback);
                if (index > -1) {
                    this._subscribers.splice(index, 1);
                }
            },

            // Notifier les abonnés
            _notifySubscribers: function () {
                var state = this.getState();
                this._subscribers.forEach(function (callback) {
                    try {
                        callback(state);
                    } catch (error) {
                        console.error('Erreur dans le callback de filtre:', error);
                    }
                });
            },

            // Construire les paramètres d'URL
            toURLParams: function () {
                var params = new URLSearchParams();
                var state = this._state;

                if (state.query) params.set('q', state.query);
                if (state.genreId) params.set('genre', state.genreId);
                if (state.page > 1) params.set('page', state.page);
                if (state.sortBy !== 'popularity.desc') params.set('sort', state.sortBy);
                if (state.category !== 'discover') params.set('category', state.category);

                return params.toString();
            },

            // Charger depuis les paramètres d'URL
            fromURLParams: function (searchParams) {
                var params = new URLSearchParams(searchParams);
                
                this._state.query = params.get('q') || '';
                this._state.genreId = params.get('genre') || '';
                this._state.page = parseInt(params.get('page')) || 1;
                this._state.sortBy = params.get('sort') || 'popularity.desc';
                this._state.category = params.get('category') || 'discover';

                this._notifySubscribers();
            }
        })
    });

    // Instance globale du gestionnaire de filtres
    var filterManager = new App.Filters.FilterManager();

    // Exposition globale simple
    window.Filters = {
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
        },
        
        // Compatibilité avec l'ancien code
        getManager: function () {
            return filterManager;
        }
    };

})();