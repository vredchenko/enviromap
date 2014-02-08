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
;

var ip_addr = '127.0.0.1';
var port    =  '8080';
 
var server = restify.createServer({
    name : "enviromap"
});
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

server.listen(port ,ip_addr, function(){
    console.log('%s listening at %s ', server.name , server.url);
});

var PATH = '/problems'
server.get( {path: PATH                , version: '0.0.1'} , findAllProblems);
server.get( {path: PATH +'/:problemId' , version: '0.0.1'} , findProblem    );
server.post({path: PATH                , version: '0.0.1'} , postNewProblem );
server.del( {path: PATH +'/:problemId' , version: '0.0.1'} , deleteProblem  );


function findAllProblems(req, res , next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    env_problems.find().sort({created : -1} , function(err , success) {
        console.log('Response success ' , success);
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
        console.log('Response success ' , success);
        console.log('Response error ' , err);
        if(success) {
            res.send(200 , success);
            return next();
        }
        return next(err);
    });
}
 
function postNewProblem(req , res , next) {
    var problem = {};
    problem.title       = req.params.title;
    problem.content     = req.params.content;
    problem.lat         = req.params.lat;
    problem.lon         = req.params.lon;
    problem.moderation  = req.params.moderation;
    problem.probType    = req.params.probType;
    problem.probStatus  = req.params.probStatus;
    problem.severity    = req.params.severity;
    problem.created     = req.params.created;
    
    res.setHeader('Access-Control-Allow-Origin','*');
 
    env_problems.save(problem , function(err , success) {
        console.log('Response success ' , success);
        console.log('Response error ' , err);
        if(success) {
            res.send(201 , problem);
            return next();
        } else {
            return next(err);
        }
    });
}
 
function deleteProblem(req , res , next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    env_problems.remove({_id:mongojs.ObjectId(req.params.problemId)} , function(err , success) {
        console.log('Response success ' , success);
        console.log('Response error ' , err);
        if(success) {
            res.send(204);
            return next();      
        } else {
            return next(err);
        }
    });
}