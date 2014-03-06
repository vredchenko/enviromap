/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'views/map',
    'views/static'
], function ($, _, Backbone, MapView, StaticView) {
    'use strict';

    var MainRouter = Backbone.Router.extend({
        routes: {
            '': 'map',
            'map': 'map',
            'map/:query': 'problemPopup',
            'about': 'about',
            'cleaning-parks': 'cleaning_parks',
            'stopping-primrose-trade': 'stopping_primrose_trade',
            'removing-illegal-rubbish-dumps': 'removing_illegal_rubbish_dumps',
            'stopping-commercial-exploitation-of-animals': 'stopping_commercial_exploitation_of_animals'
        },

        initialize: function() {
            this.on('route', function(route) {
                $('ul.navbar-nav li.active').removeClass('active');

                var routes = _.invert(this.routes);
                var href = routes[route];

                if(href.indexOf('/') !== -1) {
                    href = href.substr(0, href.indexOf('/'));
                }

                var $item = $('ul.navbar-nav a[href=#' + href + ']');

                if($item.parents('.dropdown-submenu').length !== 0) {
                    $item.parents('.dropdown-submenu').addClass('active');
                } else {
                    $item.parent().addClass('active');
                }
            });
        },

        map: function() {
            $('#main-content').html( new MapView().render().el );
        },

        problemPopup: function(problemId) {
            $('#main-content').html( new MapView({ showProblem: problemId }).render().el );
        },

        // static pages:

        about: function() {
            $('#main-content').html( new StaticView({ template: 'app/scripts/templates/about.ejs' }).render().el );
        },

        // pages that are static resources:

        cleaning_parks: function() {
            $('#main-content').html( new StaticView({ template: 'app/scripts/templates/resources/cleaning-parks.ejs' }).render().el );
        },

        stopping_primrose_trade: function() {
            $('#main-content').html( new StaticView({ template: 'app/scripts/templates/resources/stopping-primrose-trade.ejs' }).render().el );
        },

        removing_illegal_rubbish_dumps: function() {
            $('#main-content').html( new StaticView({ template: 'app/scripts/templates/resources/removing-illegal-rubbish-dumps.ejs' }).render().el );
        },

        stopping_commercial_exploitation_of_animals: function() {
            $('#main-content').html( new StaticView({ template: 'app/scripts/templates/resources/stopping-commercial-exploitation-of-animals.ejs' }).render().el );
        }

        // ^end static content

    });

    return MainRouter;
});
