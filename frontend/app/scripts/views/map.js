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
            'submit #add-problem form.step1': 'submitProblem',
            'click #add-problem form.step2 .btn-default': 'helpProblemNo',
            'submit #add-problem form.step2': 'helpProblemYes',
            'click #add-problem form.step3 .btn-default': 'coordinateProblemNo',
            'submit #add-problem form.step3': 'coordinateProblemYes'
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

            google.maps.event.trigger(this.map, 'resize');

            return this;
        },

        addProblem: function() {
            var _that = this;
            this.$('.step2, step3, step4').addClass('hidden');
            this.$('.step1').removeClass('hidden');
            this.$('#add-problem').modal();
            this.$('#add-problem').on('shown.bs.modal', function(e) {
                google.maps.event.trigger(_that.problemMap, 'resize');
            });
        },

        submitProblem: function(e) {
            // 1. Send request to backend
            //

            this.$('.step1').addClass('hidden');
            this.$('.step2').removeClass('hidden');

            return false;
        },

        helpProblemNo: function() {
            this.$('.step2').addClass('hidden');
            this.$('.step3').removeClass('hidden');

            return false;
        },

        helpProblemYes: function() {
            // 1. Send request to backend
            //

            return false;
        },

        coordinateProblemYes: function() {
            // 1. Send request to backend
            //

            return false;
        },

        coordinateProblemNo: function() {
            this.$('.step3').addClass('hidden');
            this.$('.step4').removeClass('hidden');

            return false;
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
