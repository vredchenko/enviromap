/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'models/problem',
    'templates',
    'bootstrap',
    'markerclusterer',
    'storageManager',
    'vendor/hostMapping',
    'dropzone'
], function ($, _, Backbone, ProblemModel, JST, bootstrap, MarkerClusterer, storageManager, hostMapping, Dropzone) {
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
            'change #filter .checkbox input': 'filterMarkers'
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

            var mapDisplayStyles = [{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]},{"featureType":"landscape","stylers":[{"color":"#f2e5d4"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}];

            // experimental feature to wipe rashka off the map
            // var rashka = [[[[143.648,50.748],[144.654,48.976],[143.174,49.307],[142.559,47.862],[143.533,46.837],[143.505,46.138],[142.748,46.741],[142.092,45.967],[141.907,46.806],[142.018,47.78],[141.904,48.859],[142.136,49.615],[142.18,50.952],[141.594,51.935],[141.683,53.302],[142.607,53.762],[142.21,54.225],[142.655,54.366],[142.915,53.705],[143.261,52.741],[143.235,51.757],[143.648,50.748]]],[[[22.731,54.328],[20.892,54.313],[19.661,54.426],[19.888,54.866],[21.268,55.19],[22.316,55.015],[22.758,54.857],[22.651,54.583],[22.731,54.328]]],[[[-175.014,66.584],[-174.34,66.336],[-174.572,67.062],[-171.857,66.913],[-169.9,65.977],[-170.891,65.541],[-172.53,65.438],[-172.555,64.461],[-172.955,64.253],[-173.892,64.283],[-174.654,64.631],[-175.984,64.923],[-176.207,65.357],[-177.223,65.52],[-178.36,65.391],[-178.903,65.74],[-178.686,66.112],[-179.884,65.875],[-179.433,65.404],[-180,64.98],[-180,68.964],[-177.55,68.2],[-174.928,67.206],[-175.014,66.584]]],[[[180,70.832],[178.903,70.781],[178.725,71.099],[180,71.516],[180,70.832]]],[[[-178.694,70.893],[-180,70.832],[-180,71.516],[-179.872,71.558],[-179.024,71.556],[-177.578,71.269],[-177.664,71.133],[-178.694,70.893]]],[[[143.604,73.212],[142.088,73.205],[140.038,73.317],[139.863,73.37],[140.812,73.765],[142.062,73.858],[143.483,73.475],[143.604,73.212]]],[[[150.732,75.084],[149.576,74.689],[147.977,74.778],[146.119,75.173],[146.358,75.497],[148.222,75.346],[150.732,75.084]]],[[[145.086,75.563],[144.3,74.82],[140.614,74.848],[138.955,74.611],[136.974,75.262],[137.512,75.949],[138.831,76.137],[141.472,76.093],[145.086,75.563]]],[[[57.536,70.72],[56.945,70.633],[53.677,70.763],[53.412,71.207],[51.602,71.475],[51.456,72.015],[52.478,72.229],[52.444,72.775],[54.428,73.628],[53.508,73.75],[55.902,74.627],[55.632,75.081],[57.869,75.609],[61.17,76.252],[64.498,76.439],[66.211,76.81],[68.157,76.94],[68.852,76.545],[68.181,76.234],[64.637,75.738],[61.584,75.261],[58.477,74.309],[56.987,73.333],[55.419,72.371],[55.623,71.541],[57.536,70.72]]],[[[106.97,76.974],[107.24,76.48],[108.154,76.723],[111.077,76.71],[113.332,76.222],[114.134,75.848],[113.885,75.328],[112.779,75.032],[110.151,74.477],[109.4,74.18],[110.64,74.04],[112.119,73.788],[113.02,73.977],[113.53,73.335],[113.969,73.595],[115.568,73.753],[118.776,73.588],[119.02,73.12],[123.201,72.971],[123.258,73.735],[125.38,73.56],[126.976,73.565],[128.591,73.039],[129.052,72.399],[128.46,71.98],[129.716,71.193],[131.289,70.787],[132.254,71.836],[133.858,71.386],[135.562,71.655],[137.498,71.348],[138.234,71.628],[139.87,71.488],[139.148,72.416],[140.468,72.849],[149.5,72.2],[150.351,71.606],[152.969,70.842],[157.007,71.031],[158.998,70.867],[159.83,70.453],[159.709,69.722],[160.941,69.437],[162.279,69.642],[164.052,69.668],[165.94,69.472],[167.836,69.583],[169.578,68.694],[170.817,69.014],[170.008,69.653],[170.453,70.097],[173.644,69.817],[175.724,69.877],[178.6,69.4],[180,68.964],[180,64.98],[179.993,64.974],[178.707,64.535],[177.411,64.608],[178.313,64.076],[178.908,63.252],[179.37,62.983],[179.486,62.569],[179.228,62.304],[177.364,62.522],[174.569,61.769],[173.68,61.653],[172.15,60.95],[170.699,60.336],[170.331,59.882],[168.9,60.574],[166.295,59.789],[165.84,60.16],[164.877,59.732],[163.539,59.869],[163.217,59.211],[162.017,58.243],[162.053,57.839],[163.192,57.615],[163.058,56.159],[162.13,56.122],[161.701,55.286],[162.117,54.855],[160.369,54.344],[160.022,53.203],[158.531,52.959],[158.231,51.943],[156.79,51.011],[156.42,51.7],[155.992,53.159],[155.434,55.381],[155.914,56.768],[156.758,57.365],[156.81,57.832],[158.364,58.056],[160.151,59.315],[161.872,60.343],[163.67,61.141],[164.474,62.551],[163.258,62.466],[162.658,61.643],[160.121,60.544],[159.302,61.774],[156.721,61.434],[154.218,59.758],[155.044,59.145],[152.812,58.884],[151.266,58.781],[151.338,59.504],[149.784,59.656],[148.545,59.164],[145.487,59.336],[142.198,59.04],[138.958,57.088],[135.126,54.73],[136.702,54.604],[137.193,53.977],[138.165,53.755],[138.805,54.255],[139.902,54.19],[141.345,53.09],[141.379,52.239],[140.597,51.24],[140.513,50.046],[140.062,48.447],[138.555,47],[138.22,46.308],[136.862,45.144],[135.515,43.989],[134.869,43.398],[133.537,42.811],[132.906,42.798],[132.278,43.285],[130.936,42.553],[130.78,42.22],[130.64,42.395],[130.634,42.903],[131.145,42.93],[131.289,44.112],[131.025,44.968],[131.883,45.321],[133.097,45.144],[133.77,46.117],[134.112,47.212],[134.501,47.578],[135.026,48.478],[133.374,48.183],[132.507,47.789],[130.987,47.79],[130.582,48.73],[129.398,49.441],[127.657,49.76],[127.287,50.74],[126.939,51.354],[126.564,51.784],[125.946,52.793],[125.068,53.161],[123.571,53.459],[122.246,53.432],[121.003,53.251],[120.177,52.754],[120.726,52.516],[120.738,51.964],[120.182,51.644],[119.279,50.583],[119.288,50.143],[117.879,49.511],[116.679,49.889],[115.486,49.805],[114.962,50.14],[114.362,50.248],[112.898,49.544],[111.581,49.378],[110.662,49.13],[109.402,49.293],[108.475,49.283],[107.868,49.794],[106.889,50.274],[105.887,50.406],[104.622,50.275],[103.677,50.09],[102.256,50.511],[102.065,51.26],[100.889,51.517],[99.982,51.634],[98.861,52.047],[97.826,51.011],[98.232,50.422],[97.26,49.726],[95.814,49.977],[94.816,50.013],[94.148,50.481],[93.104,50.495],[92.235,50.802],[90.714,50.332],[88.806,49.471],[87.751,49.297],[87.36,49.215],[86.829,49.827],[85.541,49.693],[85.116,50.117],[84.416,50.311],[83.935,50.889],[83.383,51.069],[81.946,50.812],[80.568,51.388],[80.036,50.865],[77.801,53.404],[76.525,54.177],[76.891,54.491],[74.385,53.547],[73.426,53.49],[73.509,54.036],[72.224,54.377],[71.18,54.133],[70.865,55.17],[69.068,55.385],[68.169,54.97],[65.667,54.601],[65.179,54.354],[61.437,54.006],[60.978,53.665],[61.7,52.98],[60.74,52.72],[60.927,52.448],[59.968,51.96],[61.588,51.273],[61.337,50.799],[59.933,50.842],[59.642,50.545],[58.363,51.064],[56.778,51.044],[55.717,50.622],[54.533,51.026],[52.329,51.719],[50.767,51.693],[48.702,50.605],[48.578,49.875],[47.549,50.455],[46.752,49.356],[47.044,49.152],[46.466,48.394],[47.315,47.716],[48.057,47.744],[48.695,47.076],[48.593,46.561],[49.101,46.399],[48.645,45.806],[47.676,45.641],[46.682,44.609],[47.591,43.66],[47.493,42.987],[48.584,41.809],[47.987,41.406],[47.816,41.151],[47.373,41.22],[46.686,41.827],[46.405,41.861],[45.776,42.092],[45.47,42.503],[44.538,42.712],[43.931,42.555],[43.756,42.741],[42.394,43.22],[40.922,43.382],[40.077,43.553],[39.955,43.435],[38.68,44.28],[37.539,44.657],[36.675,45.245],[37.403,45.405],[38.233,46.241],[37.674,46.637],[39.148,47.045],[39.121,47.263],[38.224,47.102],[38.255,47.546],[38.771,47.826],[39.738,47.899],[39.896,48.232],[39.675,48.784],[40.081,49.307],[40.069,49.601],[38.595,49.926],[38.011,49.916],[37.393,50.384],[36.626,50.226],[35.356,50.577],[35.378,50.774],[35.022,51.208],[34.225,51.256],[34.142,51.566],[34.392,51.769],[33.753,52.335],[32.716,52.238],[32.412,52.289],[32.159,52.061],[31.786,52.102],[31.54,52.742],[31.305,53.074],[31.498,53.167],[32.305,53.133],[32.694,53.351],[32.406,53.618],[31.731,53.794],[31.791,53.975],[31.384,54.157],[30.758,54.812],[30.972,55.082],[30.874,55.551],[29.896,55.789],[29.372,55.67],[29.23,55.918],[28.177,56.169],[27.855,56.759],[27.77,57.244],[27.288,57.475],[27.717,57.792],[27.42,58.725],[28.132,59.301],[27.981,59.475],[29.118,60.028],[28.07,60.504],[30.211,61.78],[31.14,62.358],[31.516,62.868],[30.036,63.553],[30.445,64.204],[29.544,64.949],[30.218,65.806],[29.055,66.944],[29.977,67.698],[28.446,68.365],[28.592,69.065],[29.4,69.157],[31.101,69.558],[32.133,69.906],[33.775,69.301],[36.514,69.063],[40.292,67.932],[41.06,67.457],[41.126,66.792],[40.016,66.266],[38.383,66],[33.919,66.76],[33.184,66.633],[34.815,65.9],[34.879,65.436],[34.944,64.414],[36.231,64.109],[37.013,63.85],[37.142,64.335],[36.54,64.764],[37.176,65.143],[39.593,64.521],[40.436,64.764],[39.763,65.497],[42.093,66.476],[43.016,66.419],[43.95,66.069],[44.532,66.756],[43.698,67.352],[44.188,67.951],[43.453,68.571],[46.25,68.25],[46.821,67.69],[45.555,67.567],[45.562,67.01],[46.349,66.668],[47.894,66.885],[48.139,67.522],[50.228,67.999],[53.717,68.857],[54.472,68.808],[53.486,68.201],[54.726,68.097],[55.443,68.439],[57.317,68.466],[58.802,68.881],[59.941,68.278],[61.078,68.941],[60.03,69.52],[60.55,69.85],[63.504,69.547],[64.888,69.235],[68.512,68.092],[69.181,68.616],[68.164,69.144],[68.135,69.356],[66.93,69.455],[67.26,69.929],[66.725,70.709],[66.695,71.029],[68.54,71.935],[69.196,72.843],[69.94,73.04],[72.588,72.776],[72.796,72.22],[71.848,71.409],[72.47,71.09],[72.792,70.391],[72.565,69.021],[73.668,68.408],[73.239,67.74],[71.28,66.32],[72.423,66.173],[72.821,66.533],[73.921,66.789],[74.187,67.284],[75.052,67.76],[74.469,68.329],[74.936,68.989],[73.842,69.071],[73.602,69.628],[74.4,70.632],[73.101,71.447],[74.891,72.121],[74.659,72.832],[75.158,72.855],[75.684,72.301],[75.289,71.336],[76.359,71.153],[75.903,71.874],[77.577,72.267],[79.652,72.32],[81.5,71.75],[80.611,72.583],[80.511,73.648],[82.25,73.85],[84.655,73.806],[86.822,73.937],[86.01,74.46],[87.167,75.116],[88.316,75.144],[90.26,75.64],[92.901,75.773],[93.234,76.047],[95.86,76.14],[96.678,75.915],[98.923,76.447],[100.76,76.43],[101.035,76.862],[101.991,77.288],[104.352,77.698],[106.067,77.374],[104.705,77.127],[106.97,76.974]]],[[[105.075,78.307],[99.438,77.921],[101.265,79.234],[102.086,79.346],[102.838,79.281],[105.372,78.713],[105.075,78.307]]],[[[51.136,80.547],[49.794,80.415],[48.894,80.34],[48.755,80.175],[47.586,80.01],[46.503,80.247],[47.072,80.559],[44.847,80.59],[46.799,80.772],[48.318,80.784],[48.523,80.515],[49.097,80.754],[50.04,80.919],[51.523,80.7],[51.136,80.547]]],[[[99.94,78.881],[97.758,78.756],[94.973,79.045],[93.313,79.427],[92.545,80.144],[91.181,80.341],[93.778,81.025],[95.941,81.25],[97.884,80.747],[100.187,79.78],[99.94,78.881]]]];
            // var flat = _.flatten(_.map(rashka, _.values))
            // alternatively: (from http://stackoverflow.com/a/10156831/572660)
            //_.mixin({crush: function(l, s, r) {return _.isObject(l)? (r = function(l) {return _.isObject(l)? _.flatten(_.map(l, s? _.identity:r)):l;})(l):[];}});
            // _.crush(rashka);
            
            // var polygonCoords = [];
            // for (var i=0; i<flat.length; i+2) {
            //     polygonCoords.push( new google.maps.LatLng(flat[i], flat[(i+1)]) );
            // }
            // console.log(polygonCoords);

            
            // Define the LatLng coordinates for the polygon's path.
            // var triangleCoords = [
            //     new google.maps.LatLng(25.774252, -80.190262),
            //     new google.maps.LatLng(18.466465, -66.118292),
            //     new google.maps.LatLng(32.321384, -64.75737),
            //     new google.maps.LatLng(25.774252, -80.190262)
            // ];
            // Construct the polygon.
            // var bermudaTriangle = new google.maps.Polygon({
            //     paths: triangleCoords,
            //     strokeColor: '#FF0000',
            //     strokeOpacity: 0.8,
            //     strokeWeight: 2,
            //     fillColor: '#FF0000',
            //     fillOpacity: 0.35
            // });


            this.$el.html(this.template());

            this.mapOptions = {
                zoom: 6
            ,   center: new google.maps.LatLng(50.3734961443035, 30.498046875)
            ,   styles: mapDisplayStyles
            };

            this.map = new google.maps.Map(this.$('#map').get(0), this.mapOptions);

            // Add small timeout so map should be put into DOM already
            setTimeout(function() {
                google.maps.event.trigger(_that.map, 'resize');
                _that.map.setCenter(_that.mapOptions.center);
            }, 50);

            // Quick access to detail window
            this.$detailWindow = this.$('.problem-detail');

            this.getMarkers();

            this.renderFilter();

            this.renderSubmitProblem();

            return this;
        },

        renderSubmitProblem: function() {
            var _that = this;

            this.problemMap = new google.maps.Map(this.$('#problem-map').get(0), this.mapOptions);

            google.maps.event.addListener(this.problemMap, 'click', function(event) {
                _that.placeNewMarker(event.latLng);
            });

            this.$('#add-problem').on('shown.bs.modal', function(e) {
                google.maps.event.trigger(_that.problemMap, 'resize');
                _that.problemMap.setCenter(_that.mapOptions.center);
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

            _.each(this.markers, function(marker) {
                marker.setMap(null);
            });

            this.markers = [];

            if(this.markerCluster) {
                this.markerCluster.clearMarkers();
                this.markerCluster.resetViewport();
            }

            _.each(data, function(value) {
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

                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(value.lat, value.lon),
                    icon: '/images/markers/' + _that.icons[value.probType],
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

                    // Change URL state, so it can be shared independently
                    Backbone.history.navigate('map/' + marker.problem._id);
                });

                _that.markers[marker.problem._id] = marker;
            });

            // Open marker popup if it is requested
            if(_that.showProblem) {
                var marker = this.markers[_that.showProblem];
                if(marker) {
                    google.maps.event.trigger(marker, 'click');
                }
            }

            this.markerCluster = new MarkerClusterer(_that.map, this.markers);
        },

        filterMarkers: function(e) {
            var _that = this;

            var $checkbox = $(e.currentTarget);
            var filterType = $checkbox.attr('class');

            if($checkbox.is(':checked')) {
                this.searchSettings[ filterType ].push($checkbox.val());
            } else {
                this.searchSettings[ filterType ] = _.without(this.searchSettings[ filterType ], $checkbox.val());
            }

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
                data.lat = this.marker.getPosition().lat();
                data.lon = this.marker.getPosition().lng();
            }

            this.problem = new ProblemModel();
            this.problem.set(data);
            this.problem.save().then(function(data) {
                _that.dropzone.options.url = hostMapping.getHostName('api') + '/problems/photos/' + data._id;
                _that.dropzone.processQueue();
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
