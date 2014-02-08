/*global define*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var ProblemModel = Backbone.Model.extend({
        urlRoot: "http://127.0.0.1:8080/problems",
        idAttribute: "_id",
        defaults: {
        }
    });

    return ProblemModel;
});
