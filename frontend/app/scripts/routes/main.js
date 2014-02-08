/*global define*/

define([
    'jquery',
    'backbone',
    'views/map',
    'views/about'
], function ($, Backbone, MapView, AboutView) {
    'use strict';

    var MainRouter = Backbone.Router.extend({
        routes: {
            '': 'map',
            'map': 'map',
            'about': 'about'
        },

        map: function() {
            $('#main-content').html( new MapView().render().el );
        },

        about: function() {
            $('#main-content').html( new AboutView().render().el )
        }

    });

    return MainRouter;
});
