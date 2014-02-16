/*global define*/

define([
    'jquery',
    'backbone',
    'views/map',
    'views/static'
], function ($, Backbone, MapView, StaticView) {
    'use strict';

    var MainRouter = Backbone.Router.extend({
        routes: {
            '': 'map',
            'map': 'map',
            'about': 'about',
            'cleaning-parks': 'cleaning_parks'
        },

        initialize: function() {
            $('ul.navbar-nav a').click(function() {
                $('ul.navbar-nav li.active').removeClass('active');
                $(this).parent().addClass('active');
            });
        },

        map: function() {
          $('#main-content').html( new MapView().render().el );
        },

        about: function() {
          $('#main-content').html( new StaticView({ template: 'app/scripts/templates/about.ejs' }).render().el );
        },

        cleaning_parks: function() {
          $('#main-content').html( new StaticView({ template: 'app/scripts/templates/resources/cleaning-parks.ejs' }).render().el )
        }

    });

    return MainRouter;
});
