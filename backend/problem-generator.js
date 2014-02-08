/**
 * Generate a sample dataset of environmental problems.
 */

// @todo: get to the bottom of my 4 missing records

var dimsum        = require('dimsum')
,   databaseUrl   = 'enviromap' // "username:password@example.com/mydb"
,   collections   = ['env_problems']
,   db            = require('mongojs').connect(databaseUrl, collections)
,   sys           = require('sys')
,   exec          = require('child_process').exec
,   conf          = require('./conf.js').config
;


var config        = {
  numOfProblems:      2000
, latN:               52.379581
, latS:               44.386463
, lonE:               40.228581
, lonW:               22.137159
, topSeverity:        conf.dataTerms.topSeverity
, statuses:           conf.dataTerms.probTypes
, types:              conf.dataTerms.statuses
, moderation:         conf.dataTerms.moderation
};

// clear collection before generating record set
db.env_problems.remove();

var i = 0
,   recursy = function(i) {
    //console.log('i: ' + i);
    db.env_problems.save({
      title      : dimsum.sentence(1)
    , content    : dimsum(3)
    , lat        : Math.random() * (config.latN - config.latS) + config.latS
    , lon        : Math.random() * (config.lonE - config.lonW) + config.lonW
    , moderation : config.moderation[Math.floor(Math.random() * config.moderation.length)]
    , probType   : config.types[Math.floor(Math.random() * config.types.length)]
    , probStatus : config.statuses[Math.floor(Math.random() * config.statuses.length)]
    , severity   : Math.floor(Math.random() * (config.topSeverity)) + 1
    , created    : Math.round(new Date().getTime() / 1000)
    , emails     : []
    , votes      : Math.floor(Math.random() * 171) + 1
    }, function(err, saved) {
      if( err || !saved ) {
        console.log( "Error saving record", err );
      } else {
        //console.log( "Record #" + (i+1) + " saved" );
        i++;
        if ( i < config.numOfProblems ) {
          recursy(i);
        } else {
          console.log("Done generating sample records! Let me do a mongodump for you just in case..");
          
          // export to a dump
          var dumpCMD = 'mongodump -d enviromap -c env_problems -o ./_dump';
          console.log("running '" + dumpCMD + "'");
          console.log("use 'mongorestore enviromap' to restore");

          exec(dumpCMD, function(error, stdout, stderr) { 
            sys.puts(stdout);
          });

          process.exit();
        }
      }
    });
}
;

recursy(i);
