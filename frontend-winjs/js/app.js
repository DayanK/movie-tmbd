// frontend-winjs/js/app.js
// Application principale avec syntaxe WinJS native - CORRIGÉ

(function () {
    "use strict";

    // Configuration de l'application
    var AppConfig = {
        name: 'Enhanced TMDB Movie Explorer',
        version: '2.0.0',
        apiUrl: 'http://localhost:3005/api',
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
        itemsPerPage: 20,
        maxRetries: 3,
        retryDelay: 1000,
        features: {
            offlineSupport: true,
            notifications: true,
            keyboardShortcuts: true,
            deepLinking: true,
            analytics: false
        }
    };

    // Définition du namespace principal de l'application
    WinJS.Namespace.define("App", {
        
        // Gestionnaire d'état de l'application
        AppState: WinJS.Class.define(function () {
            this._state = {
                isOnline: navigator.onLine,
                currentUser: null,
                preferences: this._loadPreferences(),
                cache: new Map(),
                notifications: [],
                errors: []
            };
            
            this._subscribers = new Map();
            this._init();
        }, {
            // Initialisation du gestionnaire d'état
            _init: function () {
                var that = this;
                
                // Écoute des événements en ligne/hors ligne
                window.addEventListener('online', function () {
                    that._setState({ isOnline: true });
                });
                
                window.addEventListener('offline', function () {
                    that._setState({ isOnline: false });
                });
                
                // Écoute des erreurs non gérées
                window.addEventListener('error', function (e) {
                    that._logError(e.error);
                });
                
                window.addEventListener('unhandledrejection', function (e) {
                    that._logError(e.reason);
                });
            },

            // Mise à jour de l'état
            _setState: function (newState) {
                var oldState = WinJS.Utilities.extend({}, this._state);
                this._state = WinJS.Utilities.extend(this._state, newState);
                
                // Notification des abonnés
                var that = this;
                this._subscribers.forEach(function (callback, key) {
                    try {
                        callback(that._state, oldState);
                    } catch (error) {
                        console.error('Erreur dans l\'abonné d\'état ' + key + ':', error);
                    }
                });
            },

            // Abonnement aux changements d'état
            subscribe: function (key, callback) {
                this._subscribers.set(key, callback);
                var that = this;
                return function () {
                    that._subscribers.delete(key);
                };
            },

            // Chargement des préférences
            _loadPreferences: function () {
                try {
                    var saved = localStorage.getItem('movieAppPreferences');
                    return saved ? JSON.parse(saved) : this._getDefaultPreferences();
                } catch (error) {
                    console.error('Erreur lors du chargement des préférences:', error);
                    return this._getDefaultPreferences();
                }
            },

            // Préférences par défaut
            _getDefaultPreferences: function () {
                return {
                    theme: 'dark',
                    language: 'fr',
                    autoPlay: false,
                    showAdultContent: false,
                    defaultSort: 'popularity.desc',
                    itemsPerPage: 20,
                    cacheEnabled: true,
                    notificationsEnabled: true
                };
            },

            // Sauvegarde des préférences
            savePreferences: function (preferences) {
                try {
                    var newPrefs = WinJS.Utilities.extend(this._state.preferences, preferences);
                    localStorage.setItem('movieAppPreferences', JSON.stringify(newPrefs));
                    this._setState({ preferences: newPrefs });
                } catch (error) {
                    console.error('Erreur lors de la sauvegarde des préférences:', error);
                }
            },

            // Journalisation des erreurs
            _logError: function (error) {
                var errorLog = {
                    message: error.message || 'Erreur inconnue',
                    stack: error.stack,
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    userAgent: navigator.userAgent
                };
                
                this._state.errors.push(errorLog);
                
                // Conservation des 50 dernières erreurs seulement
                if (this._state.errors.length > 50) {
                    this._state.errors = this._state.errors.slice(-50);
                }
                
                console.error('Erreur d\'application journalisée:', errorLog);
            },

            // Accesseurs pour l'état
            getState: function () {
                return this._state;
            },

            getErrors: function () {
                return this._state.errors;
            },

            clearErrors: function () {
                this._setState({ errors: [] });
            }
        }),

        // Classe principale de l'application
        MovieApp: WinJS.Class.define(function () {
            this.config = AppConfig;
            this.appState = new App.AppState();
            this.controller = null;
            this.serviceWorker = null;
            this.retryQueue = [];
            
            this._init();
        }, {
            // Initialisation de l'application
            _init: function () {
                var that = this;
                
                console.log('Initialisation de ' + this.config.name + ' v' + this.config.version);
                
                // Affichage de l'écran de chargement
                this._showLoadingScreen();
                
                // Chaîne d'initialisation
                var initPromise = WinJS.Promise.wrap();
                
                // CORRECTION: Initialisation du service worker de manière optionnelle
                if (this.config.features.offlineSupport) {
                    initPromise = initPromise.then(function () {
                        return that._initServiceWorker();
                    });
                }
                
                // Vérification de la connexion API
                initPromise = initPromise.then(function () {
                    return that._checkApiConnection();
                });
                
                // Initialisation de WinJS si disponible
                if (typeof WinJS !== 'undefined' && WinJS.Application) {
                    initPromise = initPromise.then(function () {
                        return that._initWinJS();
                    });
                }
                
                // Initialisation des contrôleurs
                initPromise = initPromise.then(function () {
                    return that._initControllers();
                });
                
                // Configuration des écouteurs globaux
                initPromise = initPromise.then(function () {
                    that._setupGlobalListeners();
                    that._applyPreferences();
                    that._hideLoadingScreen();
                    console.log('Application initialisée avec succès');
                });
                
                // Gestion des erreurs d'initialisation
                initPromise.done(null, function (error) {
                    console.error('Échec de l\'initialisation de l\'application:', error);
                    that._showErrorScreen('Échec de l\'initialisation de l\'application. Veuillez actualiser la page.');
                });
            },

            // Affichage de l'écran de chargement
            _showLoadingScreen: function () {
                var loadingHTML = '<div id="appLoadingScreen" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" ' +
                     'style="background: #121212; z-index: 9999;">' +
                     '<div class="text-center text-light">' +
                     '<div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;"></div>' +
                     '<h4>' + this.config.name + '</h4>' +
                     '<p>Chargement de films extraordinaires...</p>' +
                     '</div></div>';
                document.body.insertAdjacentHTML('beforeend', loadingHTML);
            },

            // Masquage de l'écran de chargement
            _hideLoadingScreen: function () {
                var loadingScreen = document.getElementById('appLoadingScreen');
                if (loadingScreen) {
                    loadingScreen.style.opacity = '0';
                    setTimeout(function () {
                        if (loadingScreen.parentNode) {
                            loadingScreen.remove();
                        }
                    }, 300);
                }
            },

            // Affichage de l'écran d'erreur
            _showErrorScreen: function (message) {
                var errorHTML = '<div id="appErrorScreen" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" ' +
                     'style="background: #121212; z-index: 9999;">' +
                     '<div class="text-center text-light">' +
                     '<i class="fas fa-exclamation-triangle text-danger mb-3" style="font-size: 3rem;"></i>' +
                     '<h4>Oups ! Quelque chose a mal tourné</h4>' +
                     '<p>' + message + '</p>' +
                     '<button class="btn btn-primary" onclick="location.reload()">' +
                     '<i class="fas fa-refresh me-2"></i>Réessayer</button>' +
                     '</div></div>';
                document.body.insertAdjacentHTML('beforeend', errorHTML);
            },

            // CORRECTION: Initialisation du service worker avec gestion d'erreur améliorée
            _initServiceWorker: function () {
                if ('serviceWorker' in navigator) {
                    var that = this;
                    
                    // Essayer plusieurs chemins possibles pour le Service Worker
                    var swPaths = ['./sw.js', '/sw.js', '../sw.js'];
                    
                    function tryRegisterSW(pathIndex) {
                        if (pathIndex >= swPaths.length) {
                            console.log('ℹ️ Service Worker non trouvé - Fonctionnement sans cache offline');
                            return WinJS.Promise.wrap();
                        }
                        
                        return navigator.serviceWorker.register(swPaths[pathIndex])
                            .then(function (registration) {
                                that.serviceWorker = registration;
                                console.log('✅ Service Worker enregistré avec succès:', swPaths[pathIndex]);
                                return registration;
                            }, function (error) {
                                console.warn('⚠️ Tentative Service Worker échouée (' + swPaths[pathIndex] + '):', error.message);
                                return tryRegisterSW(pathIndex + 1);
                            });
                    }
                    
                    return tryRegisterSW(0);
                } else {
                    console.log('ℹ️ Service Worker non supporté par ce navigateur');
                    return WinJS.Promise.wrap();
                }
            },

            // Vérification de la connexion API
            _checkApiConnection: function () {
                var that = this;
                
                return WinJS.xhr({
                    url: this.config.apiUrl + '/health',
                    method: 'GET',
                    timeout: 5000
                }).then(function (response) {
                    if (response.status >= 200 && response.status < 300) {
                        var health = JSON.parse(response.responseText);
                        console.log('✅ Connexion API réussie:', health);
                    } else {
                        throw new Error('Échec de la vérification de santé de l\'API: ' + response.status);
                    }
                }, function (error) {
                    console.error('❌ Échec de la connexion API:', error);
                    
                    if (!that.appState.getState().isOnline) {
                        console.log('ℹ️ Fonctionnement en mode hors ligne');
                    } else {
                        console.warn('⚠️ API non disponible, fonctionnement en mode dégradé');
                        // Ne pas faire échouer l'initialisation à cause de l'API
                    }
                });
            },

            // Initialisation de WinJS
            _initWinJS: function () {
                return new WinJS.Promise(function (complete) {
                    if (WinJS.Application) {
                        WinJS.Application.addEventListener("activated", function (args) {
                            console.log('✅ Application WinJS activée');
                            complete();
                        });
                        
                        WinJS.Application.start();
                    } else {
                        complete();
                    }
                });
            },

            // Initialisation des contrôleurs
            _initControllers: function () {
                var that = this;
                
                // Attente que le DOM soit prêt
                return new WinJS.Promise(function (complete) {
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', complete);
                    } else {
                        complete();
                    }
                }).then(function () {
                    // Initialisation du contrôleur de films
                    if (typeof App.Controllers !== 'undefined' && App.Controllers.MovieController) {
                        that.controller = new App.Controllers.MovieController();
                        that._setupControllerListeners();
                    } else {
                        console.warn('⚠️ MovieController non trouvé - Chargement en cours...');
                        // Réessayer après un délai
                        return WinJS.Promise.timeout(1000).then(function () {
                            if (typeof App.Controllers !== 'undefined' && App.Controllers.MovieController) {
                                that.controller = new App.Controllers.MovieController();
                                that._setupControllerListeners();
                            } else {
                                throw new Error('MovieController non disponible');
                            }
                        });
                    }
                });
            },

            // Configuration des écouteurs du contrôleur
            _setupControllerListeners: function () {
                var that = this;
                
                // Écoute des changements d'état
                this.appState.subscribe('controller', function (newState, oldState) {
                    if (newState.isOnline !== oldState.isOnline) {
                        that._handleConnectionChange(newState.isOnline);
                    }
                });
            },

            // Gestion du changement de connexion
            _handleConnectionChange: function (isOnline) {
                if (isOnline) {
                    this._showNotification('Connexion rétablie', 'success');
                    this._processRetryQueue();
                } else {
                    this._showNotification('Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.', 'warning');
                }
            },

            // Traitement de la file d'attente de retry
            _processRetryQueue: function () {
                var that = this;
                while (this.retryQueue.length > 0) {
                    var request = this.retryQueue.shift();
                    try {
                        request().done(null, function (error) {
                            console.error('Échec du retry:', error);
                        });
                    } catch (error) {
                        console.error('Échec du retry:', error);
                    }
                }
            },

            // Configuration des écouteurs globaux
            _setupGlobalListeners: function () {
                // Raccourcis clavier
                if (this.config.features.keyboardShortcuts) {
                    this._setupKeyboardShortcuts();
                }
                
                // Surveillance des performances
                this._setupPerformanceMonitoring();
                
                // Gestion des erreurs
                this._setupErrorHandling();
            },

            // Configuration des raccourcis clavier
            _setupKeyboardShortcuts: function () {
                var that = this;
                var shortcuts = {
                    'Ctrl+k': function () {
                        var searchInput = document.getElementById('searchInput');
                        if (searchInput) searchInput.focus();
                    },
                    'Ctrl+h': function () {
                        if (that.controller && that.controller._showHome) {
                            that.controller._showHome();
                        }
                    },
                    'Ctrl+f': function () {
                        if (that.controller && that.controller._showFavorites) {
                            that.controller._showFavorites();
                        }
                    },
                    'Ctrl+r': function () {
                        if (that.controller && that.controller.refresh) {
                            that.controller.refresh();
                        }
                    },
                    'Ctrl+/': function () {
                        that._showKeyboardShortcuts();
                    }
                };

                document.addEventListener('keydown', function (e) {
                    var combo = '';
                    if (e.ctrlKey) combo += 'Ctrl+';
                    combo += e.key.toLowerCase();
                    
                    if (shortcuts[combo]) {
                        e.preventDefault();
                        shortcuts[combo]();
                    }
                });
            },

            // Surveillance des performances
            _setupPerformanceMonitoring: function () {
                // Surveillance du temps de chargement de la page
                window.addEventListener('load', function () {
                    if ('performance' in window) {
                        var perfData = window.performance.timing;
                        var loadTime = perfData.loadEventEnd - perfData.navigationStart;
                        console.log('⏱️ Temps de chargement de la page: ' + loadTime + 'ms');
                    }
                });
            },

            // Configuration de la gestion des erreurs
            _setupErrorHandling: function () {
                var that = this;
                
                window.addEventListener('error', function (e) {
                    that.appState._logError(e.error);
                });

                window.addEventListener('unhandledrejection', function (e) {
                    that.appState._logError(e.reason);
                    e.preventDefault();
                });
            },

            // Application des préférences
            _applyPreferences: function () {
                var prefs = this.appState.getState().preferences;
                
                // Application du thème
                if (prefs.theme === 'light') {
                    document.body.classList.add('light-theme');
                }
                
                console.log('✅ Préférences utilisateur appliquées:', prefs);
            },

            // Affichage des notifications
            _showNotification: function (message, type, duration) {
                if (!this.config.features.notifications) return;

                type = type || 'info';
                duration = duration || 3000;

                var notification = {
                    id: Date.now(),
                    message: message,
                    type: type,
                    timestamp: new Date()
                };

                this.appState.getState().notifications.push(notification);

                // Affichage de la notification visuelle
                if (this.controller && this.controller._movieView) {
                    this.controller._movieView.showNotification(message, type, duration);
                }

                // Nettoyage des anciennes notifications
                var that = this;
                setTimeout(function () {
                    var notifications = that.appState.getState().notifications;
                    var index = notifications.findIndex(function (n) {
                        return n.id === notification.id;
                    });
                    if (index > -1) {
                        notifications.splice(index, 1);
                    }
                }, duration);
            },

            // Affichage des raccourcis clavier
            _showKeyboardShortcuts: function () {
                var shortcuts = [
                    { key: 'Ctrl+K', description: 'Focaliser la zone de recherche' },
                    { key: 'Ctrl+H', description: 'Aller à l\'accueil' },
                    { key: 'Ctrl+F', description: 'Afficher les favoris' },
                    { key: 'Ctrl+R', description: 'Actualiser la vue actuelle' },
                    { key: 'F', description: 'Focaliser la recherche (quand on ne tape pas)' },
                    { key: '←/→', description: 'Naviguer entre les pages' },
                    { key: 'Esc', description: 'Effacer les filtres' }
                ];

                var modal = document.createElement('div');
                modal.className = 'modal fade';
                modal.innerHTML = '<div class="modal-dialog">' +
                    '<div class="modal-content bg-dark text-light">' +
                    '<div class="modal-header">' +
                    '<h5 class="modal-title">Raccourcis Clavier</h5>' +
                    '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>' +
                    '</div>' +
                    '<div class="modal-body">' +
                    '<div class="list-group list-group-flush">' +
                    shortcuts.map(function (s) {
                        return '<div class="list-group-item bg-transparent text-light d-flex justify-content-between">' +
                            '<span>' + s.description + '</span>' +
                            '<kbd class="bg-secondary">' + s.key + '</kbd>' +
                            '</div>';
                    }).join('') +
                    '</div></div></div></div>';

                document.body.appendChild(modal);
                var bsModal = new bootstrap.Modal(modal);
                bsModal.show();

                modal.addEventListener('hidden.bs.modal', function () {
                    document.body.removeChild(modal);
                });
            },

            // Méthodes API publiques
            getVersion: function () {
                return this.config.version;
            },

            getState: function () {
                return this.appState.getState();
            },

            updatePreferences: function (newPrefs) {
                this.appState.savePreferences(newPrefs);
                this._applyPreferences();
            },

            exportData: function () {
                var data = {
                    version: this.config.version,
                    exported_at: new Date().toISOString(),
                    preferences: this.appState.getState().preferences,
                    favorites: JSON.parse(localStorage.getItem('movieFavorites') || '[]'),
                    cache_stats: this.controller && this.controller._movieService ? 
                        this.controller._movieService.getCacheStats() : {}
                };

                var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'movie-app-data-' + new Date().toISOString().split('T')[0] + '.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            },

            clearAllData: function () {
                if (confirm('Êtes-vous sûr de vouloir effacer toutes les données de l\'application ? Cette action ne peut pas être annulée.')) {
                    localStorage.clear();
                    if (this.controller && this.controller._movieService) {
                        this.controller._movieService.clearCache();
                    }
                    location.reload();
                }
            },

            showDebugInfo: function () {
                var debugInfo = {
                    version: this.config.version,
                    state: this.appState.getState(),
                    controller_state: this.controller ? this.controller.getCurrentState() : null,
                    cache_stats: this.controller && this.controller._movieService ? 
                        this.controller._movieService.getCacheStats() : {},
                    errors: this.appState.getErrors()
                };

                console.group('🎬 Informations de débogage de l\'application Movie');
                console.log('Configuration:', this.config);
                console.log('État de l\'application:', debugInfo);
                console.log('Erreurs récentes:', this.appState.getErrors());
                console.groupEnd();

                return debugInfo;
            },

            showKeyboardShortcuts: function () {
                this._showKeyboardShortcuts();
            }
        })
    });

    // Instance globale de l'application
    var movieApp;

    // Initialisation lorsque le DOM est chargé
    document.addEventListener('DOMContentLoaded', function () {
        movieApp = new App.MovieApp();
        
        // Exposition globale pour le débogage
        window.movieApp = movieApp;
        window.debugApp = function () { return movieApp.showDebugInfo(); };
        window.clearAppData = function () { return movieApp.clearAllData(); };
        window.exportAppData = function () { return movieApp.exportData(); };
    });

})();