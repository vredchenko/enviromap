/**
 * This is the RESTful API - make it so when you have more time:
 * http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api#snake-vs-camel
 * Be nice to your fellow programmers!
 */

// @todo: export database and other environment settings to a separate config

var application_root  = __dirname
,   config            = require('./conf.js').config
,   express           = require( 'express'   )
,   path              = require( 'path'      )
,   mongoose          = require( 'mongoose'  )
,   Schema            = mongoose.Schema
,   im                = require('imagemagick')
,   fs                = require('fs')
,   databaseUrl       = 'mongodb://localhost/enviromap' // "username:password@example.com/mydb"
,   collections       = ['env_problems']
,   app               = express.createServer()
;

var ip_addr = 'localhost'
,   port    =  '8000'
;

// fields to return to the public, as we don't want to return emails 
// and potentially other admin-sensitive stuff
var publicProjection = {
  "$project" : {
    "title" : 1,
    "content" : 1,
    "lat" : 1,
    "lon" : 1,
    "moderation" : 1,
    "probType" : 1,
    "probStatus" : 1,
    "severity" : 1,
    "created" : 1,
    "votes" : 1
  }
};

// schemas
// @todo add indexes and validation as part of Mongoose definition

var Images = new Schema({
  kind: { 
    type:         String, 
    enum:         ['thumbnail', 'catalog', 'detail', 'zoom'],
    required:     true
  },
  url: { 
    type:         String, 
    required:     true 
  }
});

var Problem = new Schema({
  title:          { type: String, required: true },
  description:    { type: String, required: true },
  resolution:     { type: String, required: true },
  lat:            { type: Number, required: true },
  lon:            { type: Number, required: true },
  moderation:     { type: String, required: true, enum: config.dataTerms.moderation },
  probType:       { type: String, required: true, enum: config.dataTerms.probTypes },
  probStatus:     { type: String, required: true, enum: config.dataTerms.statuses },
  severity:       { type: Number, default: 1, min: 1, max: config.dataTerms.topSeverity },
  created:        { type: Date,   default: Date.now },
  emails:         { type: Array,  required: false },
  votes:          { type: Number, default: 0 },
  images:         [Images],
  modified:       { type: Date,   default: Date.now }
});

// database connection @todo use values from config
mongoose.connect( databaseUrl ); // @todo configure database connection

// NodeJS app config
app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

var ProblemModel = mongoose.model('Problem', Problem);

// routing

app.get  ( '/api', function (req, res) { res.send('API is running'); });
app.get  ( '/api/problems/api/problems',           findAllProblems );
app.get  ( '/api/problems/:problemId',             findProblem );
app.get  ( '/api/problems/search/:keywords',       searchProblems );
app.get  ( '/api/problems/api/problems',           postNewProblem );
app.post ( '/api/problems/photos/:problemId',      addPhotosToProblem );
app.post ( '/api/problems/filter',                 filterProblems );
app.del  ( '/api/problems/:problemId',             deleteProblem );
app.post ( '/api/problems/add_email/:problemId',   addEmailToProblem );
app.post ( '/api/problems/vote_up/:problemId',     incProblemVoteCount );
app.get  ( '/settings',                            getSettings );


// endpoint handlers

function findAllProblems(req, res) {
    res.setHeader('Access-Control-Allow-Origin','*');
    env_problems.aggregate([publicProjection] , function(err , success) {
        //console.log('Response success ' , success);
        if (err) { console.log('Response error ' , err); }
        res.send( success );
    });
}

function findProblem(req, res) {
    res.setHeader('Access-Control-Allow-Origin','*');
    env_problems.aggregate([publicProjection]).findOne({_id:mongojs.ObjectId(req.params.problemId)} , function(err , success) {
        //console.log('Response success ' , success);
        if (err) { console.log('Response error ' , err); }
        res.send( success );
    });
}

function searchProblems(req, res) {
    res.send( {} );
}

function filterProblems(req, res) {
    res.setHeader('Access-Control-Allow-Origin','*');

    var filter = {};

    if (req.params.moderation) {
        filter.moderation = { "$in": req.params.moderation };
    }
    if (req.params.probType) {
        filter.probType = { "$in": req.params.probType };
    }
    if (req.params.probStatus) {
        filter.probStatus = { "$in": req.params.probStatus };
    }

    if (req.params.severity) {
        filter.severity = {};
    }
    if (req.params.severity && req.params.severity.lowerBound) {
        filter.severity["$gt"] = req.params.severity.lowerBound;
    }
    if (req.params.severity && req.params.severity.upperBound) {
        filter.severity["$lt"] = req.params.severity.upperBound;
    }
    //console.log(filter);

    env_problems.aggregate([publicProjection, {"$match": filter}, {"$sort": {created : -1}}] , function(err , success) {
        //console.log('Response success ' , success.length);
        if (err) { console.log('Response error ' , err); }
        res.send( success );
    });
}


// problem object methods

function postNewProblem(req , res) {
    var problem = {};

    if (req.params._id) { // update instead of create
        problem._id = req.params._id;
    }

    problem.title       = req.params.title;
    problem.content     = req.params.content;
    problem.lat         = req.params.lat;
    problem.lon         = req.params.lon;
    problem.moderation  = req.params.moderation;
    problem.probType    = req.params.probType;
    problem.probStatus  = req.params.probStatus;
    problem.severity    = req.params.severity;
    if(req.params.emails) {
        problem.emails  = req.params.emails;
    } else {
        problem.emails  = [];
    }
    problem.created     = new Date().getTime() / 1000;
    problem.votes       = 0;

    res.setHeader('Access-Control-Allow-Origin','*');

    env_problems.save(problem , function(err , success) {
        //console.log('Response success ' , success);
        if (err) { console.log('Response error ' , err); }
        res.send( success );
    });
}

function addPhotosToProblem(req , res) {
    var problem = {};

    if (!req.params._id) { 
        // @todo throw error
    } 

    problem._id     = req.params._id;
    problem.photos  = []; // each element will hold {'tn': '/path/to/tn', 'img': '/path/to/image'}

    for (k in req.files) {
      console.log({
          'size': req.files[k].size
      ,   'path': req.files[k].path
      ,   'name': req.files[k].name
      ,   'type': req.files[k].type
      });

      // @todo add checks based on file type, generate pseudo-random hash
      var imageName = req.files[k].name
      ,   newPath = __dirname + "/../cdn/img/" + imageName
      ,   thumbPath = __dirname + "/../cdn/tn/tn_" + imageName
      ;

      console.log(newPath);
      console.log(thumbPath);

      fs.rename(req.files[k].path, newPath, function (err) {

        if (err) throw err;
        
        im.resize(
          {
            srcPath: newPath,
            dstPath: thumbPath,
            width:   144
          }
        , function(err, stdout, stderr) {
            if (err) throw err;
           
            problem.photos.push({
              tn   : 'tn/' + newPath
            , img  : 'img/' + thumbPath
            });
          }
        );
      });
    }
    
    // @todo upsert problem into mongo once all resize operations resolved
    // ...

    res.send( problem );
}

function addEmailToProblem(req , res) {
    res.setHeader('Access-Control-Allow-Origin','*');

    env_problems.update(
        {_id:db.ObjectId(req.params.problemId)}
    ,   { $push:{emails:{$each:[req.params.participantEmail]}} }, function(err , success) {
        //console.log('Response success ' , success);
        if (err) { console.log('Response error ' , err); }
        res.send( success );
    });
}

function incProblemVoteCount(req , res) {
  res.setHeader('Access-Control-Allow-Origin','*');

  env_problems.update(
    {_id:db.ObjectId(req.params.problemId)}
  , { $inc: { "votes": 1 } }, function(err , success) {
    //console.log('Response success ' , success);
    if (err) { console.log('Response error ' , err); }
    res.send( success );
  });
}
// @todo upsert, safe

function deleteProblem(req , res) {
  res.setHeader('Access-Control-Allow-Origin','*');
  env_problems.remove({_id:mongojs.ObjectId(req.params.problemId)} , function(err , success) {
      //console.log('Response success ' , success);
      if (err) { console.log('Response error ' , err); }
      res.send( success );
  });
}


// settings

function getSettings(req , res) {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.send({
    dataTerms   : config.dataTerms
  , lang        : config.lang
  });
}
