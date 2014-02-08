/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'models/problem',
    'templates',
    'bootstrap',
    'markerclusterer',
    'storageManager'
], function ($, _, Backbone, ProblemModel, JST, bootstrap, MarkerClusterer, storageManager) {
    'use strict';

    var MapView = Backbone.View.extend({
        template: JST['app/scripts/templates/map.ejs'],
        problemTemplate: JST['app/scripts/templates/problem.ejs'],

        events: {
            'click .btn-add': 'addProblem',
            'submit #add-problem form.step1': 'submitProblem',
            'click #add-problem form.step2 .btn-default': 'helpProblemNo',
            'submit #add-problem form.step2': 'helpProblemYes',
            'click #add-problem form.step3 .btn-default': 'coordinateProblemNo',
            'submit #add-problem form.step3': 'helpProblemYes',
            'click .problem-detail .close': 'closeProblem',
            'click .problem-detail .btn-vote': 'voteForProblem'
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

            // Quick access to detail window
            this.$detailWindow = this.$('.problem-detail');

            this.renderMarkers();

            return this;
        },

        renderMarkers: function() {
            var _that = this;

            $('.loader').show();

            $.ajax({
                type: "GET",
                url: "http://127.0.0.1:8080/problems"
            }).then(function(data) {
                var markers = [];
                _.each(data, function(value) {
                    value.formatDate = function() {
                        var date = new Date(this.created * 1000);
                        return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
                    }

                    value.voted = function() {
                        return storageManager.votedFor(this._id);
                    }

                    var marker = new google.maps.Marker({
                        position: new google.maps.LatLng(value.lat, value.lon),
                        problem: value
                    });

                    google.maps.event.addListener(marker, 'click', function(e) {
                        _that.$detailWindow.hide();

                        _that.$detailWindow.html(_that.problemTemplate(marker.problem));

                        _that.selectedProblem = marker.problem;

                        _that.$detailWindow.animate({
                            width: 'show',
                            paddingLeft: 'show',
                            paddingRight: 'show',
                            marginLeft: 'show',
                            marginRight: 'show'
                        }, 'slow');
                    });

                    markers.push(marker);
                });

                var markerCluster = new MarkerClusterer(_that.map, markers);
            }).done(function() {
                $('.loader').hide();
            });
        },

        closeProblem: function() {
            this.$detailWindow.animate({
                width: "hide",
                paddingLeft: "hide",
                paddingRight: "hide",
                marginLeft: "hide",
                marginRight: "hide"
            }, 'slow');
        },

        addProblem: function(e) {
            e.preventDefault();

            var _that = this;

            this.$('.step2, step3, step4, .step5').addClass('hidden');
            this.$('.step1').removeClass('hidden');
            this.$('#add-problem').modal();
            this.$('#add-problem form').each(function() {
                this.reset();
            });
            this.marker.setMap(null);
            delete this.marker;
            this.$('#add-problem').on('shown.bs.modal', function(e) {
                google.maps.event.trigger(_that.problemMap, 'resize');
            });
        },

        submitProblem: function(e) {
            var _that = this;

            this.$('.step1 button[type=submit]').attr('disabled', true);

            var data = {
                title: this.$('.step1 #title').val(),
                content: this.$('.step1 #description').val()
            };

            data.content += '\n\n' + this.$('.step1 #proposal').val();

            if(this.marker) {
                data.lat = this.marker.getPosition().lat();
                data.lon = this.marker.getPosition().lng();
            }

            this.problem = new ProblemModel();
            this.problem.set(data);
            this.problem.save().then(function(data) {
                _that.$('.step1').addClass('hidden');
                _that.$('.step2').removeClass('hidden');
            }).done(function() {
                _that.$('.step1 button[type=submit]').attr('disabled', false);
            });

            return false;
        },

        helpProblemYes: function() {
            var _that = this;

            this.$('.step2 button[type=submit], .step3 button[type=submit]').attr('disabled', true);

            this.addEmailToProblem(this.problem.id, this.$('.step2 #email1').val()).then(function(e) {
                _that.$('.step2, .step3').addClass('hidden');
                _that.$('.step5').removeClass('hidden');
            }).done(function() {
                _that.$('.step2 button[type=submit], .step3 button[type=submit]').attr('disabled', false);
            });

            return false;
        },

        helpProblemNo: function() {
            this.$('.step2').addClass('hidden');
            this.$('.step3').removeClass('hidden');

            return false;
        },

        coordinateProblemNo: function() {
            this.$('.step3').addClass('hidden');
            this.$('.step4').removeClass('hidden');

            return false;
        },

        addEmailToProblem: function(problemId, email) {
            var request = $.ajax({
                type: 'POST',
                url: 'http://127.0.0.1:8080/problems/add_email/' + problemId,
                data: JSON.stringify({ participantEmail: email }),
                contentType: 'application/json',
                dataType: 'json'
            });

            return request;
        },

        voteForProblem: function() {
            var _that = this;

            this.$detailWindow.find('button.btn-vote').attr('disabled', true);

            var request = $.ajax({
                type: 'POST',
                url: 'http://127.0.0.1:8080/problems/vote_up/' + this.selectedProblem._id,
                contentType: 'application/json',
                dataType: 'json'
            }).then(function() {
                storageManager.storeVote(_that.selectedProblem._id);
            }).done(function() {
                _that.$detailWindow.find('button.btn-vote').hide();
                _that.$detailWindow.find('p.message').text('Дякуюєм за ваш голос!');
            });
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
