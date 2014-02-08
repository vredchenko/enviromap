/*global define*/

define([
    'underscore',
    'backbone',
    'vendor/hostMapping'
], function (_, Backbone, hostMapping) {
    'use strict';

    var ProblemModel = Backbone.Model.extend({
        urlRoot: hostMapping.getHostName('api') + '/problems',
        idAttribute: "_id",
        defaults: {
        }
    });

    return ProblemModel;
});
