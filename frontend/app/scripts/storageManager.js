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
                cache = votes;
            }

            votes[id] = true;

            localStorage.votes = JSON.stringify(votes);
        },

        votedFor: function(id) {
            if(!localStorage.votes) return false;

            if(_.isEmpty(cache)) {
                cache = JSON.parse(localStorage.votes);
            }

            if(!cache[id]) {
                return false;
            } else {
                return true;
            }
        }
    };

    return storageManager;
});