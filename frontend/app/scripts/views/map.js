/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates'
], function ($, _, Backbone, JST) {
    'use strict';

    var MapView = Backbone.View.extend({
        template: JST['app/scripts/templates/map.ejs'],

        render: function() {
            this.$el.html(this.template());

            var mapOptions = {
                center: new google.maps.LatLng(-34.397, 150.644),
                zoom: 8
            };

            var map = new google.maps.Map(this.$('#map').get(0), mapOptions);

            return this;
        }
    });

    return MapView;
});
