// frontend-winjs/tests/movieApp.tests.js
// Tests unitaires pour l'application MovieDB Explorer WinJS

(function () {
    "use strict";

    // Configuration des tests avec QUnit
    QUnit.config.reorder = false;
    QUnit.config.autostart = false;

    // Utilities pour les tests
    var TestUtils = {
        // Créer un mock d'objet film
        createMockMovie: function (overrides) {
            var defaults = {
                id: 12345,
                title: 'Test Movie',
                overview: 'This is a test movie',
                poster_path: '/test-poster.jpg',
                backdrop_path: '/test-backdrop.jpg',
                release_date: '2023-01-01',
                vote_average: 7.5,
                vote_count: 1000,
                popularity: 123.45,
                genre_ids: [28, 12],
                adult: false,
                original_language: 'en'
            };
            
            return WinJS.Utilities.extend(defaults, overrides || {});
        },

        // Créer un mock de réponse API
        createMockApiResponse: function (results, page, totalPages) {
            return {
                page: page || 1,
                results: results || [],
                total_pages: totalPages || 1,
                total_results: results ? results.length : 0
            };
        },

        // Attendre une Promise WinJS
        waitForPromise: function (promise, timeout) {
            timeout = timeout || 5000;
            
            return new WinJS.Promise(function (complete, error) {
                var timeoutId = setTimeout(function () {
                    error(new Error('Test timeout'));
                }, timeout);
                
                promise.then(function (result) {
                    clearTimeout(timeoutId);
                    complete(result);
                }, function (err) {
                    clearTimeout(timeoutId);
                    error(err);
                });
            });
        },

        // Simuler un événement DOM
        simulateEvent: function (element, eventType, properties) {
            var event = document.createEvent('Event');
            event.initEvent(eventType, true, true);
            
            if (properties) {
                Object.keys(properties).forEach(function (key) {
                    event[key] = properties[key];
                });
            }
            
            element.dispatchEvent(event);
        }
    };

    // =====================================
    // Tests pour App.Models.Movie
    // =====================================
    QUnit.module('App.Models.Movie', {
        beforeEach: function () {
            this.movieData = TestUtils.createMockMovie();
        }
    });

    QUnit.test('Movie constructor creates valid instance', function (assert) {
        var movie = new App.Models.Movie(this.movieData);
        
        assert.equal(movie.id, 12345, 'ID correctement assigné');
        assert.equal(movie.title, 'Test Movie', 'Titre correctement assigné');
        assert.equal(movie.vote_average, 7.5, 'Note correctement assignée');
    });

    QUnit.test('Movie.getPosterUrl returns correct URL', function (assert) {
        var movie = new App.Models.Movie(this.movieData);
        var posterUrl = movie.getPosterUrl('w500');
        
        assert.ok(posterUrl.includes('w500'), 'URL contient la taille spécifiée');
        assert.ok(posterUrl.includes('/test-poster.jpg'), 'URL contient le chemin du poster');
    });

    QUnit.test('Movie.getPosterUrl handles missing poster_path', function (assert) {
        var movieWithoutPoster = TestUtils.createMockMovie({ poster_path: null });
        var movie = new App.Models.Movie(movieWithoutPoster);
        var posterUrl = movie.getPosterUrl();
        
        assert.ok(posterUrl.includes('placeholder'), 'URL placeholder retournée pour poster manquant');
    });

    QUnit.test('Movie.getYear extracts correct year', function (assert) {
        var movie = new App.Models.Movie(this.movieData);
        
        assert.equal(movie.getYear(), 2023, 'Année correctement extraite');
    });

    QUnit.test('Movie.getRatingClass returns correct CSS class', function (assert) {
        var highRated = new App.Models.Movie(TestUtils.createMockMovie({ vote_average: 8.5 }));
        var mediumRated = new App.Models.Movie(TestUtils.createMockMovie({ vote_average: 6.5 }));
        var lowRated = new App.Models.Movie(TestUtils.createMockMovie({ vote_average: 4.5 }));
        
        assert.equal(highRated.getRatingClass(), 'text-success', 'Film bien noté a la classe success');
        assert.equal(mediumRated.getRatingClass(), 'text-warning', 'Film moyennement noté a la classe warning');
        assert.equal(lowRated.getRatingClass(), 'text-danger', 'Film mal noté a la classe danger');
    });

    // =====================================
    // Tests pour App.Services.MovieService
    // =====================================
    QUnit.module('App.Services.MovieService', {
        beforeEach: function () {
            this.service = new App.Services.MovieService();
            this.originalXhr = WinJS.xhr;
        },
        afterEach: function () {
            WinJS.xhr = this.originalXhr;
        }
    });

    QUnit.test('MovieService constructor initializes correctly', function (assert) {
        assert.ok(this.service._baseUrl, 'Base URL est définie');
        assert.ok(this.service._cache instanceof Map, 'Cache est initialisé');
        assert.equal(typeof this.service._cacheTimeout, 'number', 'Timeout du cache est défini');
    });

    QUnit.test('MovieService caches responses correctly', function (assert) {
        var done = assert.async();
        var mockResponse = { responseText: JSON.stringify([{ id: 1, name: 'Action' }]) };
        
        // Mock WinJS.xhr
        WinJS.xhr = function () {
            return WinJS.Promise.wrap(mockResponse);
        };
        
        var service = this.service;
        
        service.getGenres().then(function () {
            // Deuxième appel devrait utiliser le cache
            var cacheKey = service._getCacheKey('/genres');
            var cached = service._getFromCache(cacheKey);
            
            assert.ok(cached, 'Réponse mise en cache');
            done();
        });
    });

    // =====================================
    // Tests pour App.Controls.MovieCard
    // =====================================
    QUnit.module('App.Controls.MovieCard', {
        beforeEach: function () {
            this.container = document.createElement('div');
            document.body.appendChild(this.container);
            this.movieData = TestUtils.createMockMovie();
        },
        afterEach: function () {
            document.body.removeChild(this.container);
        }
    });

    QUnit.test('MovieCard creates UI elements', function (assert) {
        var card = new App.Controls.MovieCard(this.container);
        
        assert.ok(this.container.querySelector('.movie-poster'), 'Poster image créée');
        assert.ok(this.container.querySelector('.movie-info'), 'Container d\'info créé');
        assert.ok(this.container.querySelector('.movie-title'), 'Titre créé');
    });

    QUnit.test('MovieCard data property updates UI', function (assert) {
        var card = new App.Controls.MovieCard(this.container);
        card.data = this.movieData;
        
        var titleElement = this.container.querySelector('.movie-title');
        var posterElement = this.container.querySelector('.movie-poster');
        
        assert.equal(titleElement.textContent, 'Test Movie', 'Titre mis à jour');
        assert.ok(posterElement.src.includes('test-poster.jpg'), 'Poster mis à jour');
    });

    QUnit.test('MovieCard emits events on click', function (assert) {
        var done = assert.async();
        var card = new App.Controls.MovieCard(this.container);
        card.data = this.movieData;
        
        // Écouter l'événement
        WinJS.Application.addEventListener('movieCardClicked', function (e) {
            assert.equal(e.detail.id, 12345, 'Événement émis avec les bonnes données');
            done();
        });
        
        // Simuler le clic
        TestUtils.simulateEvent(this.container, 'click');
    });

    // =====================================
    // Tests pour App.Utils.Format
    // =====================================
    QUnit.module('App.Utils.Format');

    QUnit.test('Format.runtime formats minutes correctly', function (assert) {
        assert.equal(App.Utils.Format.runtime(90), '1h 30m', '90 minutes = 1h 30m');
        assert.equal(App.Utils.Format.runtime(45), '45m', '45 minutes = 45m');
        assert.equal(App.Utils.Format.runtime(0), 'Inconnue', '0 minutes = Inconnue');
        assert.equal(App.Utils.Format.runtime(null), 'Inconnue', 'null = Inconnue');
    });

    QUnit.test('Format.currency formats amounts correctly', function (assert) {
        var formatted = App.Utils.Format.currency(1000000);
        assert.ok(formatted.includes('1'), 'Montant formaté contient le chiffre');
        assert.ok(formatted.includes('000'), 'Montant formaté contient les zéros');
    });

    QUnit.test('Format.date formats dates correctly', function (assert) {
        var formatted = App.Utils.Format.date('2023-12-25', 'year');
        assert.equal(formatted, '2023', 'Format année fonctionne');
        
        var invalidDate = App.Utils.Format.date('invalid-date');
        assert.equal(invalidDate, 'Date invalide', 'Date invalide gérée');
    });

    QUnit.test('Format.truncate cuts text correctly', function (assert) {
        var longText = 'This is a very long text that should be truncated';
        var truncated = App.Utils.Format.truncate(longText, 20);
        
        assert.ok(truncated.length <= 20, 'Texte tronqué à la bonne longueur');
        assert.ok(truncated.includes('...'), 'Texte tronqué contient les points de suspension');
    });

    // =====================================
    // Tests pour App.Helpers.MovieHelper
    // =====================================
    QUnit.module('App.Helpers.MovieHelper');

    QUnit.test('MovieHelper.isValidMovie validates correctly', function (assert) {
        var validMovie = TestUtils.createMockMovie();
        var invalidMovie1 = TestUtils.createMockMovie({ id: null });
        var invalidMovie2 = TestUtils.createMockMovie({ title: '' });
        
        assert.ok(App.Helpers.MovieHelper.isValidMovie(validMovie), 'Film valide reconnu');
        assert.notOk(App.Helpers.MovieHelper.isValidMovie(invalidMovie1), 'Film sans ID rejeté');
        assert.notOk(App.Helpers.MovieHelper.isValidMovie(invalidMovie2), 'Film sans titre rejeté');
    });

    QUnit.test('MovieHelper.createMovieObject creates standardized object', function (assert) {
        var rawData = { id: 123, title: 'Test' };
        var movie = App.Helpers.MovieHelper.createMovieObject(rawData);
        
        assert.equal(movie.id, 123, 'ID préservé');
        assert.equal(movie.title, 'Test', 'Titre préservé');
        assert.equal(movie.overview, '', 'Valeur par défaut pour overview');
        assert.equal(movie.vote_average, 0, 'Valeur par défaut pour vote_average');
    });

    // =====================================
    // Tests pour App.Helpers.UrlHelper
    // =====================================
    QUnit.module('App.Helpers.UrlHelper');

    QUnit.test('UrlHelper.buildApiUrl constructs URLs correctly', function (assert) {
        var url = App.Helpers.UrlHelper.buildApiUrl('/test', { page: 1, query: 'action' });
        
        assert.ok(url.includes('/test'), 'URL contient l\'endpoint');
        assert.ok(url.includes('page=1'), 'URL contient le paramètre page');
        assert.ok(url.includes('query=action'), 'URL contient le paramètre query');
    });

    QUnit.test('UrlHelper.buildImageUrl constructs image URLs correctly', function (assert) {
        var url = App.Helpers.UrlHelper.buildImageUrl('/poster.jpg', 'POSTER', 'LARGE');
        
        assert.ok(url.includes('w500'), 'URL contient la taille correcte');
        assert.ok(url.includes('/poster.jpg'), 'URL contient le chemin d\'image');
    });

    QUnit.test('UrlHelper.buildImageUrl returns placeholder for null path', function (assert) {
        var url = App.Helpers.UrlHelper.buildImageUrl(null, 'POSTER');
        
        assert.ok(url.includes('placeholder'), 'URL placeholder retournée');
    });

    // =====================================
    // Tests pour App.Resources.ResourceManager
    // =====================================
    QUnit.module('App.Resources.ResourceManager', {
        beforeEach: function () {
            this.resourceManager = new App.Resources.ResourceManager();
        }
    });

    QUnit.test('ResourceManager loads default language', function (assert) {
        var currentLang = this.resourceManager.getCurrentLanguage();
        var supportedLangs = this.resourceManager.getSupportedLanguages();
        
        assert.ok(supportedLangs.includes(currentLang), 'Langue courante est supportée');
    });

    QUnit.test('ResourceManager getString returns correct values', function (assert) {
        var homeString = this.resourceManager.getString('nav.home');
        
        assert.ok(typeof homeString === 'string', 'Chaîne retournée est une string');
        assert.ok(homeString.length > 0, 'Chaîne retournée n\'est pas vide');
    });

    QUnit.test('ResourceManager getString returns fallback for missing key', function (assert) {
        var missingString = this.resourceManager.getString('missing.key', 'Fallback');
        
        assert.equal(missingString, 'Fallback', 'Valeur de fallback retournée');
    });

    QUnit.test('ResourceManager format replaces parameters', function (assert) {
        // Supposons qu'on ait une clé de test avec des paramètres
        var formatted = this.resourceManager.format('test.parameterized', ['Param1', 'Param2']);
        
        assert.ok(typeof formatted === 'string', 'Résultat formaté est une string');
    });

    // =====================================
    // Tests pour App.Config.AppSettings
    // =====================================
    QUnit.module('App.Config.AppSettings', {
        beforeEach: function () {
            this.settings = new App.Config.AppSettings();
            // Sauvegarder l'état original du localStorage
            this.originalStorage = localStorage.getItem('movieApp-settings');
        },
        afterEach: function () {
            // Restaurer l'état original
            if (this.originalStorage) {
                localStorage.setItem('movieApp-settings', this.originalStorage);
            } else {
                localStorage.removeItem('movieApp-settings');
            }
        }
    });

    QUnit.test('AppSettings get retrieves correct values', function (assert) {
        var apiUrl = this.settings.get('api.baseUrl');
        var cacheEnabled = this.settings.get('cache.enabled');
        
        assert.ok(typeof apiUrl === 'string', 'API URL est une string');
        assert.ok(typeof cacheEnabled === 'boolean', 'Cache enabled est un boolean');
    });

    QUnit.test('AppSettings set updates values correctly', function (assert) {
        this.settings.set('ui.theme', 'light');
        var theme = this.settings.get('ui.theme');
        
        assert.equal(theme, 'light', 'Valeur mise à jour correctement');
    });

    QUnit.test('AppSettings isFeatureEnabled works correctly', function (assert) {
        var notificationsEnabled = this.settings.isFeatureEnabled('notifications');
        
        assert.ok(typeof notificationsEnabled === 'boolean', 'Retourne un boolean');
    });

    // =====================================
    // Tests d'intégration
    // =====================================
    QUnit.module('Tests d\'intégration', {
        beforeEach: function () {
            this.container = document.createElement('div');
            this.container.id = 'test-container';
            document.body.appendChild(this.container);
        },
        afterEach: function () {
            document.body.removeChild(this.container);
        }
    });

    QUnit.test('Workflow complet: création carte -> affichage données -> événement', function (assert) {
        var done = assert.async();
        var movieData = TestUtils.createMockMovie();
        
        // Créer une carte
        var card = new App.Controls.MovieCard(this.container);
        
        // Écouter l'événement
        WinJS.Application.addEventListener('movieCardClicked', function (e) {
            assert.equal(e.detail.id, movieData.id, 'Événement avec bonnes données émis');
            done();
        });
        
        // Assigner les données (déclenche la mise à jour UI)
        card.data = movieData;
        
        // Vérifier que l'UI est mise à jour
        var titleElement = this.container.querySelector('.movie-title');
        assert.equal(titleElement.textContent, movieData.title, 'UI mise à jour avec les données');
        
        // Simuler un clic (déclenche l'événement)
        TestUtils.simulateEvent(this.container, 'click');
    });

    // =====================================
    // Tests de performance
    // =====================================
    QUnit.module('Tests de performance');

    QUnit.test('MovieCard creation performance', function (assert) {
        var startTime = performance.now();
        var cards = [];
        
        // Créer 100 cartes
        for (var i = 0; i < 100; i++) {
            var container = document.createElement('div');
            var card = new App.Controls.MovieCard(container);
            cards.push(card);
        }
        
        var endTime = performance.now();
        var duration = endTime - startTime;
        
        assert.ok(duration < 1000, 'Création de 100 cartes en moins de 1 seconde (' + duration + 'ms)');
    });

    QUnit.test('Cache performance', function (assert) {
        var service = new App.Services.MovieService();
        var key = 'test-key';
        var data = { test: 'data' };
        
        var startTime = performance.now();
        
        // Test d'écriture cache
        for (var i = 0; i < 1000; i++) {
            service._setCache(key + i, data);
        }
        
        // Test de lecture cache
        for (var i = 0; i < 1000; i++) {
            service._getFromCache(key + i);
        }
        
        var endTime = performance.now();
        var duration = endTime - startTime;
        
        assert.ok(duration < 100, '1000 opérations de cache en moins de 100ms (' + duration + 'ms)');
    });

    // =====================================
    // Tests d'accessibilité
    // =====================================
    QUnit.module('Tests d\'accessibilité', {
        beforeEach: function () {
            this.container = document.createElement('div');
            document.body.appendChild(this.container);
        },
        afterEach: function () {
            document.body.removeChild(this.container);
        }
    });

    QUnit.test('MovieCard has correct ARIA attributes', function (assert) {
        var card = new App.Controls.MovieCard(this.container);
        
        assert.ok(this.container.hasAttribute('tabindex'), 'Carte est focusable');
        assert.ok(this.container.hasAttribute('role'), 'Carte a un rôle défini');
        
        var img = this.container.querySelector('.movie-poster');
        assert.ok(img.hasAttribute('alt'), 'Image a un texte alternatif');
    });

    // Démarrer les tests une fois que l'application est chargée
    document.addEventListener('DOMContentLoaded', function () {
        // Attendre que tous les scripts soient chargés
        setTimeout(function () {
            QUnit.start();
        }, 100);
    });

    // Export pour utilisation dans d'autres tests
    window.TestUtils = TestUtils;

})();