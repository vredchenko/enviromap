/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates'
], function ($, _, Backbone, JST) {
    'use strict';

    // @todo path to template should be dynamic

    var ResourcesView = Backbone.View.extend({
        template: JST['app/scripts/templates/resources/cleaning-parks.ejs'],

        render: function() {
            this.$el.html(this.template());

            return this;
        }
    });

    return ResourcesView;
});
