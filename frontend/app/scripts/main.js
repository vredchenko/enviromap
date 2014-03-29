/*global require*/
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: [
                'jquery'
            ],
            exports: 'jquery'
        },
        markerclusterer: {
            exports: 'MarkerClusterer'
        }
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        bootstrap: '../bower_components/sass-bootstrap/dist/js/bootstrap',
        markerclusterer: '../scripts/vendor/markerclusterer',
        dropzone: '../bower_components/dropzone/downloads/dropzone.min',
        modernizr: '../bower_components/modernizr/modernizr',
        'requirejs-text': '../bower_components/requirejs-text/text',
        requirejs: '../bower_components/requirejs/require',
        'sass-bootstrap': '../bower_components/sass-bootstrap/dist/js/bootstrap'
    }
});

require([
    'backbone',
    'routes/main'
], function (Backbone, Router) {
    var router = new Router();
    Backbone.history.start();
});
