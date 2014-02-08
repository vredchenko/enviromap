(function() {
  define(["underscore"], function(_) {
    var manager, settings;
    settings = {};
    return manager = {
      init: function(key, data) {
        var currentData;
        currentData = settings[key];
        if ((currentData != null) && _.isObject(currentData)) {
          settings[key] = _.extend(data, settings[key]);
        } else if (currentData == null) {
          settings[key] = data;
        }
      },
      set: function(key, data) {
        settings[key] = data;
      },
      get: function(key, valueIfMissing) {
        return settings[key] || valueIfMissing;
      },
      merge: function(key, data) {
        var currentData;
        currentData = settings[key] || {};
        settings[key] = _.extend(currentData, data);
      },
      _raw: function() {
        return settings;
      }
    };
  });

}).call(this);
