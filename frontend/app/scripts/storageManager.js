/*global define*/

define([
    'underscore'
], function (_) {
    var cache = {};

    var storageManager = {
        storeVote: function(id) {
            var votes = {};

            if(localStorage.votes) {
                votes = JSON.parse(localStorage.votes);
                cache.votes = votes;
            }

            votes[id] = true;

            localStorage.votes = JSON.stringify(votes);
        },

        storeEmail: function(id) {
            var emails = {};

            if(localStorage.emails) {
                emails = JSON.parse(localStorage.emails);
                cache.emails = emails;
            }

            emails[id] = true;

            localStorage.emails = JSON.stringify(emails);
        },

        leftEmailFor: function(id) {
            if(!localStorage.emails) return false;

            if(_.isEmpty(cache) || !cache.emails) {
                cache.emails = JSON.parse(localStorage.emails);
            }

            if(!cache.emails[id]) {
                return false;
            } else {
                return true;
            }
        },

        votedFor: function(id) {
            if(!localStorage.votes) return false;

            if(_.isEmpty(cache) || !cache.votes) {
                cache.votes = JSON.parse(localStorage.votes);
            }

            if(!cache.votes[id]) {
                return false;
            } else {
                return true;
            }
        }
    };

    return storageManager;
});