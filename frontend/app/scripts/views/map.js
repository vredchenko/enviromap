/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'bootstrap'
], function ($, _, Backbone, JST, bootstrap) {
    'use strict';

    var MapView = Backbone.View.extend({
        template: JST['app/scripts/templates/map.ejs'],

        events: {
            'click .btn-add': 'addProblem',
            'submit #add-problem form': 'submitProblem'
        },

        render: function() {
            var _that = this;

            this.$el.html(this.template());

            var mapOptions = {
                center: new google.maps.LatLng(50.3734961443035, 30.498046875),
                zoom: 6
            };

            this.map = new google.maps.Map(this.$('#map').get(0), mapOptions);

            this.problemMap = new google.maps.Map(this.$('#problem-map').get(0), mapOptions);

            google.maps.event.addListener(this.problemMap, 'click', function(event) {
                _that.placeNewMarker(event.latLng);
            });

            return this;
        },

        addProblem: function() {
            var _that = this;
            this.$('#add-problem').modal();
            this.$('#add-problem').on('shown.bs.modal', function(e) {
                google.maps.event.trigger(_that.problemMap, 'resize');
            });
        },

        submitProblem: function(e) {

        },

        placeNewMarker: function(location) {
            if(!this.marker) {
                this.marker = new google.maps.Marker({
                    map: this.problemMap,
                    draggable: true
                });
            }

            this.marker.setPosition(location);

            this.problemMap.setCenter(location);
        }
    });

    return MapView;
});
