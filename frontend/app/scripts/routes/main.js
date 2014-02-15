/*global define*/

define([
    'jquery',
    'backbone',
    'views/map',
    'views/about',
    'views/resources'
], function ($, Backbone, MapView, AboutView, ResourcesView) {
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
          $('#main-content').html( new AboutView().render().el );
        },

        cleaning_parks: function() {
          $('#main-content').html( new ResourcesView().render().el )
        }

    });

    return MainRouter;
});
