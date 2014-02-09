(function() {
  define(["vendor/settings"], function(settings) {
    var HostMapping;
    settings.set("hostMapping", {
      "localhost": "development",
      "add-test-url": "testing",
      "add-prod-url": "production"
    });
    settings.set("hostConfig", {
      "testing": {
        "api": "http://127.0.0.1:8080"
      },
      "production": {
        "api": "http://127.0.0.1:8080"
      },
      "development": {
        "api": "http://localhost:8080"
      }
    });
    HostMapping = (function() {
      function HostMapping() {}

      HostMapping.prototype.overrideMapping = function(newMapping) {
        return settings.set("currentHostMapping", newMapping);
      };

      HostMapping.prototype.determineTarget = function(hostname) {
        var allHostMappings, overrideMapping;
        overrideMapping = settings.get("overrideMapping");
        if (overrideMapping != null) {
          settings.set("currentHostMapping", overrideMapping);
          return console.log("[hostMapping] Override active: " + (settings.get('overrideMapping')));
        } else {
          allHostMappings = settings.get("hostMapping");
          if ((hostname == null) && (typeof document !== "undefined" && document !== null)) {
            if (typeof document !== "undefined" && document !== null) {
              hostname = document.location.hostname;
            }
          }
          if (allHostMappings[hostname] != null) {
            settings.set("currentHostMapping", allHostMappings[hostname]);
            return console.log("[hostMapping] Target found: " + (settings.get('currentHostMapping')));
          } else {
            settings.set("currentHostMapping", "production");
            return console.log("[hostMapping] No target found, defaulting to production");
          }
        }
      };

      HostMapping.prototype.getHostName = function(hostType) {
        var allHostConfigs, currentHostMapping;
        if (hostType == null) {
          hostType = "api";
        }
        if (settings.get("currentHostMapping") == null) {
          this.determineTarget();
        }
        allHostConfigs = settings.get("hostConfig");
        currentHostMapping = settings.get("currentHostMapping");
        return allHostConfigs[currentHostMapping][hostType];
      };

      HostMapping.prototype.extractHostName = function(url) {
        return url.replace(/(^https?:)?\/\//, "").split("/").slice(0, 1).pop().split(":").slice(0, 1).pop();
      };

      return HostMapping;

    })();
    return new HostMapping();
  });

}).call(this);
