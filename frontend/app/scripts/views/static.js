/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates'
], function ($, _, Backbone, JST) {
    'use strict';

    var StaticView = Backbone.View.extend({
        initialize: function(params) {
            this.template = JST[params.template];
        },

        render: function() {
            this.$el.html(this.template());

            return this;
        }
    });

    return StaticView;
});
