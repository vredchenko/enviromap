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
            deps: ['jquery'],
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
        dropzone: '../scripts/vendor/dropzone-amd-module'
    }
});

require([
    'backbone',
    'routes/main'
], function (Backbone, Router) {
    var router = new Router();
    Backbone.history.start();
});
