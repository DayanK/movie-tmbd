// frontend-winjs/js/config/config.js
// Configuration et utilitaires pour l'application MovieDB Explorer WinJS

(function () {
    "use strict";

    // Définition du namespace pour la configuration
    WinJS.Namespace.define("App.Config", {
        
        // Configuration principale de l'application
        AppSettings: WinJS.Class.define(function () {
            this._settings = this._getDefaultSettings();
            this._loadSettings();
        }, {
            // Paramètres par défaut
            _getDefaultSettings: function () {
                return {
                    // API Configuration
                    api: {
                        baseUrl: 'http://localhost:3005/api',
                        timeout: 10000,
                        retries: 3,
                        retryDelay: 1000
                    },
                    
                    // Cache Configuration
                    cache: {
                        enabled: true,
                        timeout: 5 * 60 * 1000, // 5 minutes
                        maxSize: 100,
                        storageQuota: 50 * 1024 * 1024 // 50MB
                    },
                    
                    // UI Configuration
                    ui: {
                        theme: 'dark',
                        language: 'fr',
                        itemsPerPage: 20,
                        animationsEnabled: true,
                        autoRefresh: false,
                        refreshInterval: 300000 // 5 minutes
                    },
                    
                    // Feature Flags
                    features: {
                        offlineSupport: true,
                        notifications: true,
                        analytics: false,
                        keyboardShortcuts: true,
                        deepLinking: true,
                        favorites: true,
                        searchHistory: true,
                        autoComplete: true
                    },
                    
                    // Performance Configuration
                    performance: {
                        lazyLoading: true,
                        imageOptimization: true,
                        prefetchNextPage: true,
                        debounceSearch: 500,
                        throttleScroll: 100
                    },
                    
                    // Debug Configuration
                    debug: {
                        enabled: false,
                        logLevel: 'warn', // 'debug', 'info', 'warn', 'error'
                        showPerformanceMetrics: false,
                        mockAPI: false
                    }
                };
            },
            
            // Chargement des paramètres depuis le stockage local
            _loadSettings: function () {
                try {
                    var savedSettings = localStorage.getItem('movieApp-settings');
                    if (savedSettings) {
                        var parsed = JSON.parse(savedSettings);
                        this._settings = this._mergeSettings(this._settings, parsed);
                    }
                } catch (error) {
                    console.error('Erreur lors du chargement des paramètres:', error);
                }
            },
            
            // Fusion des paramètres
            _mergeSettings: function (defaults, overrides) {
                var merged = {};
                
                Object.keys(defaults).forEach(function (key) {
                    if (typeof defaults[key] === 'object' && defaults[key] !== null && !Array.isArray(defaults[key])) {
                        merged[key] = this._mergeSettings(defaults[key], overrides[key] || {});
                    } else {
                        merged[key] = overrides.hasOwnProperty(key) ? overrides[key] : defaults[key];
                    }
                }, this);
                
                return merged;
            },
            
            // Obtenir un paramètre
            get: function (path) {
                var keys = path.split('.');
                var current = this._settings;
                
                for (var i = 0; i < keys.length; i++) {
                    if (current && current.hasOwnProperty(keys[i])) {
                        current = current[keys[i]];
                    } else {
                        return undefined;
                    }
                }
                
                return current;
            },
            
            // Définir un paramètre
            set: function (path, value) {
                var keys = path.split('.');
                var current = this._settings;
                
                for (var i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }
                
                current[keys[keys.length - 1]] = value;
                this._saveSettings();
                
                // Notifier du changement
                WinJS.Application.queueEvent({
                    type: 'settingChanged',
                    detail: { path: path, value: value }
                });
            },
            
            // Sauvegarder les paramètres
            _saveSettings: function () {
                try {
                    localStorage.setItem('movieApp-settings', JSON.stringify(this._settings));
                } catch (error) {
                    console.error('Erreur lors de la sauvegarde des paramètres:', error);
                }
            },
            
            // Réinitialiser aux valeurs par défaut
            reset: function () {
                this._settings = this._getDefaultSettings();
                this._saveSettings();
                
                WinJS.Application.queueEvent({
                    type: 'settingsReset',
                    detail: {}
                });
            },
            
            // Obtenir tous les paramètres
            getAll: function () {
                return JSON.parse(JSON.stringify(this._settings)); // Deep copy
            },
            
            // Vérifier si une fonctionnalité est activée
            isFeatureEnabled: function (feature) {
                return this.get('features.' + feature) === true;
            }
        })
    });

    // Utilitaires généraux
    WinJS.Namespace.define("App.Utils", {
        
        // Utilitaires de formatage
        Format: WinJS.Class.define(function () {}, {}, {
            // Formater la durée en heures et minutes
            runtime: function (minutes) {
                if (!minutes || minutes <= 0) return 'Inconnue';
                var hours = Math.floor(minutes / 60);
                var mins = minutes % 60;
                return hours > 0 ? hours + 'h ' + mins + 'm' : mins + 'm';
            },
            
            // Formater une devise
            currency: function (amount, currency) {
                currency = currency || 'USD';
                if (!amount || amount === 0) return 'Inconnu';
                
                try {
                    return new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(amount);
                } catch (error) {
                    return amount.toLocaleString() + ' ' + currency;
                }
            },
            
            // Formater un nombre
            number: function (num) {
                if (typeof num !== 'number') return 'N/A';
                return num.toLocaleString('fr-FR');
            },
            
            // Formater une date
            date: function (dateString, format) {
                if (!dateString) return 'Inconnue';
                
                var date = new Date(dateString);
                if (isNaN(date.getTime())) return 'Date invalide';
                
                format = format || 'long';
                
                try {
                    switch (format) {
                        case 'short':
                            return date.toLocaleDateString('fr-FR');
                        case 'long':
                            return date.toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        case 'year':
                            return date.getFullYear().toString();
                        default:
                            return date.toLocaleDateString('fr-FR');
                    }
                } catch (error) {
                    return dateString;
                }
            },
            
            // Tronquer le texte
            truncate: function (text, maxLength, suffix) {
                if (!text || text.length <= maxLength) return text;
                suffix = suffix || '...';
                return text.substring(0, maxLength - suffix.length) + suffix;
            },
            
            // Échapper le HTML
            escapeHtml: function (text) {
                if (!text) return '';
                var div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
        }),
        
        // Utilitaires de validation
        Validator: WinJS.Class.define(function () {}, {}, {
            // Valider une URL
            isValidUrl: function (url) {
                try {
                    new URL(url);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            
            // Valider un email
            isValidEmail: function (email) {
                var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return re.test(email);
            },
            
            // Valider un ID de film
            isValidMovieId: function (id) {
                return Number.isInteger(parseInt(id)) && parseInt(id) > 0;
            },
            
            // Valider une année
            isValidYear: function (year) {
                var currentYear = new Date().getFullYear();
                return Number.isInteger(parseInt(year)) && 
                       parseInt(year) >= 1900 && 
                       parseInt(year) <= currentYear + 10;
            },
            
            // Valider une note
            isValidRating: function (rating) {
                return typeof rating === 'number' && rating >= 0 && rating <= 10;
            }
        }),
        
        // Utilitaires de performance
        Performance: WinJS.Class.define(function () {
            this._timers = new Map();
            this._metrics = new Map();
        }, {
            // Démarrer un timer
            startTimer: function (name) {
                this._timers.set(name, performance.now());
            },
            
            // Arrêter un timer et obtenir la durée
            endTimer: function (name) {
                var startTime = this._timers.get(name);
                if (startTime === undefined) {
                    console.warn('Timer non trouvé:', name);
                    return 0;
                }
                
                var duration = performance.now() - startTime;
                this._timers.delete(name);
                
                // Enregistrer la métrique
                if (!this._metrics.has(name)) {
                    this._metrics.set(name, []);
                }
                this._metrics.get(name).push(duration);
                
                return duration;
            },
            
            // Obtenir les métriques
            getMetrics: function (name) {
                if (name) {
                    return this._metrics.get(name) || [];
                }
                return Object.fromEntries(this._metrics);
            },
            
            // Obtenir les statistiques moyennes
            getAverageMetrics: function () {
                var averages = {};
                this._metrics.forEach(function (values, name) {
                    averages[name] = values.reduce(function (a, b) { return a + b; }, 0) / values.length;
                });
                return averages;
            },
            
            // Effacer les métriques
            clearMetrics: function () {
                this._metrics.clear();
                this._timers.clear();
            }
        }),
        
        // Utilitaires de stockage
        Storage: WinJS.Class.define(function () {}, {}, {
            // Sauvegarder avec expiration
            setItem: function (key, value, expirationMs) {
                var item = {
                    value: value,
                    timestamp: Date.now(),
                    expiration: expirationMs ? Date.now() + expirationMs : null
                };
                
                try {
                    localStorage.setItem(key, JSON.stringify(item));
                    return true;
                } catch (error) {
                    console.error('Erreur de stockage:', error);
                    return false;
                }
            },
            
            // Récupérer avec vérification d'expiration
            getItem: function (key) {
                try {
                    var itemStr = localStorage.getItem(key);
                    if (!itemStr) return null;
                    
                    var item = JSON.parse(itemStr);
                    
                    // Vérifier l'expiration
                    if (item.expiration && Date.now() > item.expiration) {
                        localStorage.removeItem(key);
                        return null;
                    }
                    
                    return item.value;
                } catch (error) {
                    console.error('Erreur de récupération:', error);
                    return null;
                }
            },
            
            // Supprimer un élément
            removeItem: function (key) {
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch (error) {
                    console.error('Erreur de suppression:', error);
                    return false;
                }
            },
            
            // Nettoyer les éléments expirés
            cleanup: function () {
                var keys = Object.keys(localStorage);
                var cleaned = 0;
                
                keys.forEach(function (key) {
                    try {
                        var itemStr = localStorage.getItem(key);
                        if (itemStr) {
                            var item = JSON.parse(itemStr);
                            if (item.expiration && Date.now() > item.expiration) {
                                localStorage.removeItem(key);
                                cleaned++;
                            }
                        }
                    } catch (error) {
                        // Ignorer les éléments non valides
                    }
                });
                
                return cleaned;
            },
            
            // Obtenir l'utilisation du stockage
            getUsage: function () {
                var total = 0;
                var keys = Object.keys(localStorage);
                
                keys.forEach(function (key) {
                    total += localStorage.getItem(key).length;
                });
                
                return {
                    used: total,
                    usedMB: (total / 1024 / 1024).toFixed(2),
                    itemCount: keys.length
                };
            }
        }),
        
        // Utilitaires de debounce et throttle
        Timing: WinJS.Class.define(function () {}, {}, {
            // Debounce une fonction
            debounce: function (func, wait, immediate) {
                var timeout;
                return function () {
                    var context = this;
                    var args = arguments;
                    
                    var later = function () {
                        timeout = null;
                        if (!immediate) func.apply(context, args);
                    };
                    
                    var callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    
                    if (callNow) func.apply(context, args);
                };
            },
            
            // Throttle une fonction
            throttle: function (func, limit) {
                var inThrottle;
                return function () {
                    var args = arguments;
                    var context = this;
                    
                    if (!inThrottle) {
                        func.apply(context, args);
                        inThrottle = true;
                        setTimeout(function () {
                            inThrottle = false;
                        }, limit);
                    }
                };
            },
            
            // Délai avec Promise
            delay: function (ms) {
                return new WinJS.Promise(function (complete) {
                    setTimeout(complete, ms);
                });
            }
        })
    });

    // Logger centralisé
    WinJS.Namespace.define("App.Logger", {
        Logger: WinJS.Class.define(function () {
            this._logs = [];
            this._maxLogs = 1000;
            this._logLevel = App.Config.AppSettings.prototype.get('debug.logLevel') || 'warn';
        }, {
            // Niveaux de log
            _levels: {
                debug: 0,
                info: 1,
                warn: 2,
                error: 3
            },
            
            // Log debug
            debug: function (message, data) {
                this._log('debug', message, data);
            },
            
            // Log info
            info: function (message, data) {
                this._log('info', message, data);
            },
            
            // Log warning
            warn: function (message, data) {
                this._log('warn', message, data);
            },
            
            // Log error
            error: function (message, data) {
                this._log('error', message, data);
            },
            
            // Log interne
            _log: function (level, message, data) {
                if (this._levels[level] < this._levels[this._logLevel]) {
                    return;
                }
                
                var logEntry = {
                    timestamp: new Date().toISOString(),
                    level: level,
                    message: message,
                    data: data,
                    stack: level === 'error' ? new Error().stack : null
                };
                
                this._logs.push(logEntry);
                
                // Maintenir la limite de logs
                if (this._logs.length > this._maxLogs) {
                    this._logs.shift();
                }
                
                // Log vers la console
                var consoleMethod = console[level] || console.log;
                if (data) {
                    consoleMethod('[MovieApp]', message, data);
                } else {
                    consoleMethod('[MovieApp]', message);
                }
            },
            
            // Obtenir les logs
            getLogs: function (level) {
                if (level) {
                    return this._logs.filter(function (log) {
                        return log.level === level;
                    });
                }
                return this._logs.slice(); // Copie
            },
            
            // Effacer les logs
            clearLogs: function () {
                this._logs = [];
            },
            
            // Exporter les logs
            exportLogs: function () {
                var blob = new Blob([JSON.stringify(this._logs, null, 2)], 
                    { type: 'application/json' });
                var url = URL.createObjectURL(blob);
                
                var a = document.createElement('a');
                a.href = url;
                a.download = 'movieapp-logs-' + new Date().toISOString().split('T')[0] + '.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        })
    });

    // Instances globales
    var appSettings = new App.Config.AppSettings();
    var performanceUtils = new App.Utils.Performance();
    var logger = new App.Logger.Logger();

    // Exposition globale
    WinJS.Namespace.define("App", {
        Settings: appSettings,
        Performance: performanceUtils,
        Log: logger
    });

    // Nettoyage automatique du stockage au démarrage
    document.addEventListener('DOMContentLoaded', function () {
        var cleaned = App.Utils.Storage.cleanup();
        if (cleaned > 0) {
            App.Log.info('Nettoyage du stockage: ' + cleaned + ' éléments supprimés');
        }
    });

})();