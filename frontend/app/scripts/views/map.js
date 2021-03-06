/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'models/problem',
    'templates',
    'bootstrap',
    'vendor/hostMapping',
    'dropzone',
    'storageManager',
    'markerclusterer',
    'multiple-select'
], function ($, _, Backbone, ProblemModel, JST, bootstrap, hostMapping, Dropzone, storageManager, markerclusterer, multipleSelect) {
    'use strict';

    var MapView = Backbone.View.extend({
        template: JST['app/scripts/templates/map.ejs'],
        problemTemplate: JST['app/scripts/templates/problem.ejs'],
        filterTemplate: JST['app/scripts/templates/filter.ejs'],

        events: {
            'click .btn-add': 'addProblem',
            'submit #add-problem form.step1': 'submitProblem',
            'click #add-problem form.step2 .btn-default': 'helpProblemNo',
            'submit #add-problem form.step2': 'helpProblemYes',
            'click #add-problem form.step3 .btn-default': 'coordinateProblemNo',
            'submit #add-problem form.step3': 'helpProblemYes',
            'click .problem-detail .close': 'closeProblem',
            'click .problem-detail .btn-vote': 'voteForProblem',
            'submit .problem-detail #submitEmail': 'submitEmail',
            'change #filter select': 'filterMarkers'
        },

        initialize: function(params) {
            this.markers = [];

            if(params && params.showProblem) {
                this.showProblem = params.showProblem;
            }
        },

        icons: {
            'Проблеми лісів': 'deforestation_icon.png',
            'Сміттєзвалища': 'waste_icon.png',
            'Незаконна забудова': 'construction_icon.png',
            'Проблеми водойм': 'water_icon.png',
            'Загрози біорізноманіттю': 'biodiversity_icon_2.png',
            'Браконьєрство': 'poaching_icon.png',
            'Інші проблеми': 'other_icon.png'
        },

        render: function() {
            var _that = this;

            this.$el.html(this.template());

            // Add small timeout so map should be put into DOM already
            setTimeout(function() {
                this.mapOptions = {
                    zoom: 6
                ,   minZoom: 6
                ,   center: L.latLng(50.3734961443035, 30.498046875)
                ,   maxBounds: L.latLngBounds( L.latLng(43.23, 21.56), L.latLng(52.52, 40.46) )
                }; 

                // @todo bounds for Ukraine should be moved to config
                // @todo attribution should also be in config
                // @todo move MapID to config
                var MapID = 'vredchenko.i85jm14g',
                    mappingCredits = '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
                ;
                _that.map = L.map(_that.$('#map-pane').get(0), this.mapOptions);
                L.tileLayer('http://{s}.tiles.mapbox.com/v3/'+MapID+'/{z}/{x}/{y}.png', {
                    attribution: mappingCredits,
                    maxZoom: 18
                }).addTo(_that.map);

                _that.getMarkers();
            }, 100);

            // Quick access to detail window
            this.$detailWindow = this.$('.problem-detail');

            this.renderFilter();

            this.renderSubmitProblem();

            return this;
        },

        renderSubmitProblem: function() {
            var _that = this;

            _that.problemMapOptions = {
                zoom: 5
            ,   center: L.latLng(50.3734961443035, 30.498046875)
            ,   maxBounds: L.latLngBounds( L.latLng(44.27, 21.56), L.latLng(52.52, 40.46) )
            }; 
            // @todo bounds for Ukraine should be moved to config
            // @todo attribution should also be in config
            // @todo move MapID to config
            var MapID = 'vredchenko.i85jm14g',
                mappingCredits = '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
            ;
            _that.problemMap = L.map(_that.$('#problem-map').get(0), _that.problemMapOptions);
            // @todo move CloudMade API key to config: c80e6f7b3fa749a29b78e0057f854890
            L.tileLayer('http://{s}.tiles.mapbox.com/v3/'+MapID+'/{z}/{x}/{y}.png', {
              attribution: mappingCredits,
              maxZoom: 18
            }).addTo(_that.problemMap);

            _that.problemMap.on('click', function(e) {
                _that.placeNewMarker(e.latlng);
            });

            this.$('#add-problem').on('shown.bs.modal', function(e) {
                _that.problemMap.invalidateSize(false);
            });

            Dropzone.autoDiscover = false;

            // Configure Dropzone plugin
            this.dropzone = new Dropzone(this.$("div.dropzone").get(0), {
                url: hostMapping.getHostName('api') + '/problems/photos/',
                autoProcessQueue: false,
                uploadMultiple: true,
                parallelUploads: 6,
                maxFiles: 6,
                previewsContainer: _that.$("div.dropzone .dropzone-previews").get(0),
                clickable: _that.$("div.dropzone button.choose-photos").get(0),

                init: function() {
                    this.on("successmultiple", function(files, response) {
                        // Gets triggered when the files have successfully been sent.
                        _that.$('.step1').addClass('hidden');
                        _that.$('.step2').removeClass('hidden');
                        _that.$('.step1 button[type=submit]').attr('disabled', false);
                    });

                    this.on("errormultiple", function(files, response) {
                        // Gets triggered when there was an error sending the files.
                        // Maybe show form again, and notify user of error
                    });
                }
            });
        },

        renderFilter: function() {
            var _that = this;

            $.ajax({
                type: "GET",
                url: hostMapping.getHostName('api') + '/settings'
            }).then(function(data) {
                _that.$('.map-filter .settings').replaceWith(_that.filterTemplate(data.dataTerms));

                _that.$('.selectpicker').selectpicker();

                _that.searchSettings = {
                    probType: data.dataTerms.probTypes,
                    probStatus: data.dataTerms.statuses
                };

                _.each(_that.searchSettings.probType, function(problem) {
                    _that.$('#add-problem #type').append($('<option/>').val(problem).text(problem));
                });
            }).done();
        },

        getMarkers: function() {
            var _that = this;

            $('.loader').show();

            $.ajax({
                type: "GET",
                url: hostMapping.getHostName('api') + '/problems'
            }).then(function(data) {
                _that.renderMarkers(data);
            }).done(function() {
                $('.loader').hide();
            });;
        },

        renderMarkers: function(data) {
            var _that = this;

            if(this.markerCluster) {
                this.markerCluster.clearLayers();
                this.markers = [];
            }

            this.markerCluster = new L.MarkerClusterGroup();

            _.each(data, function(value) {
                if(!value.lat || !value.lon) {
                    return true;
                }

                value.formatDate = function() {
                    var date = new Date(this.created * 1000);
                    return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
                };

                value.voted = function() {
                    return storageManager.votedFor(this._id);
                };

                value.leftEmail = function() {
                    return storageManager.leftEmailFor(this._id);
                };

                var marker = new L.marker( L.latLng( value.lat, value.lon ), {
                    icon: new L.icon({
                        iconUrl: '/images/markers/' + _that.icons[value.probType],
                        iconSize: [50, 79]
                    })
                } );

                marker.problem = value;

                _that.markerCluster.addLayer(marker);

                marker.on('click', function(e) {
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

                    // Change URL state, so it can be shared independently
                    Backbone.history.navigate('map/' + marker.problem._id);
                });

                _that.markers[marker.problem._id] = marker;
            });

            _that.map.addLayer(_that.markerCluster);

            // Open marker popup if it is requested
            if(_that.showProblem) {
                var marker = this.markers[_that.showProblem];
                if(marker) {
                    marker.fire('click');
                }
            }
        },

        filterMarkers: function(e) {
            var _that = this;

            var $select = $(e.currentTarget);
            var filterType = $select.attr('data-type');

            this.searchSettings[ filterType ] = $select.selectpicker('val');

            var request = $.ajax({
                type: 'POST',
                url: hostMapping.getHostName('api') + '/problems/filter',
                data: JSON.stringify(this.searchSettings),
                contentType: 'application/json',
                dataType: 'json'
            }).then(function(data) {
                _that.renderMarkers(data);
            }).done();
        },

        closeProblem: function() {
            this.$detailWindow.animate({
                width: "hide",
                paddingLeft: "hide",
                paddingRight: "hide",
                marginLeft: "hide",
                marginRight: "hide"
            }, 'slow');

            Backbone.history.navigate('map');
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
            if(this.marker) {
                this.marker.setMap(null);
                delete this.marker;
            }
            if(this.myDropzone) {
                this.myDropzone.removeAllFiles();
            }
        },

        submitProblem: function(e) {
            var _that = this;

            this.$('.step1 button[type=submit]').attr('disabled', true);

            var data = {
                title: this.$('.step1 #title').val(),
                content: this.$('.step1 #description').val(),
                severity: 3,
                probType: this.$('.step1 #type').val(),
                probStatus: "Нова"
            };

            data.content += '\n\n' + this.$('.step1 #proposal').val();

            if(this.marker) {
                data.lat = this.marker.getLatLng().lat;
                data.lon = this.marker.getLatLng().lng;
            }

            this.problem = new ProblemModel();
            this.problem.set(data);
            this.problem.save().then(function(data) {
                if(_that.dropzone.getQueuedFiles().length > 0) {
                    _that.dropzone.options.url = hostMapping.getHostName('api') + '/problems/photos/' + data._id;
                    _that.dropzone.processQueue();
                } else {
                    _that.$('.step1').addClass('hidden');
                    _that.$('.step2').removeClass('hidden');
                    _that.$('.step1 button[type=submit]').attr('disabled', false);
                }
            }).done();

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
                url: hostMapping.getHostName('api') + '/problems/add_email/' + problemId,
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
                url: hostMapping.getHostName('api') + '/problems/vote_up/' + this.selectedProblem._id,
                contentType: 'application/json',
                dataType: 'json'
            }).then(function() {
                storageManager.storeVote(_that.selectedProblem._id);
            }).done(function() {
                _that.$detailWindow.find('button.btn-vote').hide();
                _that.$detailWindow.find('p.message').text('Дякуємо за ваш голос!');
            });
        },

        submitEmail: function(e) {
            var _that = this;

            this.$detailWindow.find('#submitEmail button[type=submit]').attr('disabled', true);

            this.addEmailToProblem(this.selectedProblem._id, _that.$detailWindow.find('input[name=email]').val()).then(function(e) {
                storageManager.storeEmail(_that.selectedProblem._id);
            }).done(function() {
                _that.$detailWindow.find('#submitEmail button, .form-group').hide();
                _that.$detailWindow.find('p.email-message').text('Дякуємо що ви долучились до цієї проблеми. Ми з вами зв&#8217;яжемось.');
            });

            return false;
        },

        placeNewMarker: function(location) {
            if(!this.marker) {
                this.marker = L.marker(
                    [location.lat, location.lng], {draggable: true}
                ).addTo(this.problemMap);
            }

            this.problemMap.setView(L.latLng(location.lat, location.lng));
        }
    });

    return MapView;
});
