/*global define*/

define([
    'jquery',
    'backbone',
    'views/map'
], function ($, Backbone, MapView) {
    'use strict';

    var MainRouter = Backbone.Router.extend({
        routes: {
            '': 'map',
            'map': 'map',
            'about': 'about'
        },

        map: function() {
            $('.container').html( new MapView().render().el );
        }

    });

    return MainRouter;
});
