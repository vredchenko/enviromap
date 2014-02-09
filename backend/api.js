/**
 * This is the RESTful API - make it so when you have more time:
 * http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api#snake-vs-camel
 * Be nice to your fellow programmers!
 */

// @todo: export databse and other environment settings to a separate config

var restify       = require('restify')
,   databaseUrl   = 'enviromap' // "username:password@example.com/mydb"
,   collections   = ['env_problems']
,   db            = require('mongojs').connect(databaseUrl, collections)
,   env_problems  = db.collection('env_problems')
,   config        = require('./conf.js').config
;


var ip_addr = 'localhost';
var port    =  '8080';

var server = restify.createServer({
    name : "enviromap"
});
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());
//server.use(restify.fullResponse());

function corsHandler(req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', 'http://polleze.com');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
    res.setHeader('Access-Control-Max-Age', '1000');

    return next();
}

function optionsRoute(req, res, next) {

    res.send(200);
    return next();
}

server.opts('/\.*/', corsHandler, optionsRoute);
server.listen(port ,ip_addr, function(){
    console.log('%s listening at %s ', server.name , server.url);
});


// routing

var PATH = '/problems'
server.get ( {path: PATH                           , version: '0.0.1'} , findAllProblems          );
server.get ( {path: PATH +'/:problemId'            , version: '0.0.1'} , findProblem              );
server.get ( {path: PATH +'/search/:keywords'      , version: '0.0.1'} , searchProblems           );
server.post( {path: PATH                           , version: '0.0.1'} , postNewProblem           );
server.post( {path: PATH +'/filter'                , version: '0.0.1'} , filterProblems           );
server.del ( {path: PATH +'/:problemId'            , version: '0.0.1'} , deleteProblem            );
server.post( {path: PATH +'/add_email/:problemId'  , version: '0.0.1'} , addEmailToProblem        );
server.post( {path: PATH +'/vote_up/:problemId'    , version: '0.0.1'} , incProblemVoteCount      );
server.get ( {path: '/settings'                    , version: '0.0.1'} , getSettings              );


// problem collection methods

function findAllProblems(req, res , next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    env_problems.find().sort({created : -1} , function(err , success) {
        //console.log('Response success ' , success);
        console.log('Response error ' , err);
        if(success) {
            res.send(200 , success);
            return next();
        } else {
            return next(err);
        }
    });
}

function findProblem(req, res , next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    env_problems.findOne({_id:mongojs.ObjectId(req.params.problemId)} , function(err , success) {
        //console.log('Response success ' , success);
        console.log('Response error ' , err);
        if(success) {
            res.send(200 , success);
            return next();
        }
        return next(err);
    });
}

function searchProblems(req, res, next) {
    // @todo
}

function filterProblems(req, res, next) {
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
    console.log(filter);

    env_problems.find( filter ).sort({created : -1} , function(err , success) {
        console.log('Response success ' , success.length);
        console.log('Response error ' , err);
        if(success) {
            res.send(200, success);
            return next();
        }
        return next(err);
    });
}


// problem object methods

function postNewProblem(req , res , next) {
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
        console.log('Response error ' , err);
        if(success) {
            res.send(201 , problem);
            return next();
        } else {
            return next(err);
        }
    });
}

function addEmailToProblem(req , res , next) {
    res.setHeader('Access-Control-Allow-Origin','*');

    env_problems.update(
        {_id:db.ObjectId(req.params.problemId)}
    ,   { $push:{emails:{$each:[req.params.participantEmail]}} }, function(err , success) {
        //console.log('Response success ' , success);
        console.log('Response error ' , err);
        if(success) {
            res.send(204 , {}); // @todo return updated object
            return next();
        } else {
            return next(err);
        }
    });
}

function incProblemVoteCount(req , res , next) {
    res.setHeader('Access-Control-Allow-Origin','*');

    env_problems.update(
        {_id:db.ObjectId(req.params.problemId)}
    ,   { $inc: { "votes": 1 } }, function(err , success) {
        //console.log('Response success ' , success);
        console.log('Response error ' , err);
        if(success) {
            res.send(204 , {}); // @todo return updated object
            return next();
        } else {
            return next(err);
        }
    });
}
// @todo upsert, safe

function deleteProblem(req , res , next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    env_problems.remove({_id:mongojs.ObjectId(req.params.problemId)} , function(err , success) {
        //console.log('Response success ' , success);
        console.log('Response error ' , err);
        if(success) {
            res.send(204);
            return next();
        } else {
            return next(err);
        }
    });
}


// settings

function getSettings(req , res , next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.send(200, {
        dataTerms   : config.dataTerms
    ,   lang        : config.lang
    });
    next();
}