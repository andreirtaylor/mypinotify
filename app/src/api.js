var pg = require('pg');
var sha1 = require('sha1');
var str = require('string-to-stream');

module.exports = function(app){
  app.use((req, res, next) => {
    req.cookies.id_token = req.cookies.id_token && req.cookies.id_token.split('.')[0];
    next();
  })

  app.get('/api/events', getAllEvents)
  app.get('/api/connect', connect)
  app.get('/api/token', token)
  app.post('/api/newEvent', newEvent)
  app.get('/api/generateimage', generateImage)
  app.get('/api/getdevices', getdevices)
  app.get('/api/getmyevents', getmyevents)
  app.get('/api/getlatestevent', getlatestevent)
}

// Connect to the "bank" database.
var config = {
  host: 'db1.mypinotify.me',
  database: 'mypinotify',
  user: 'user1',
  port: 26257
};

//this initializes a connection pool
//it will keep idle connections open for a 30 seconds
//and set a limit of maximum 10 idle clients
pool = new pg.Pool(config);

function newEvent(req, res){
  // to run a query we can acquire a client from the pool,
  // run a query on the client, and then return the client to the pool
  pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }

    var data = { ultrasonic: req.body.ultrasonic, touch: req.body.touch};
    console.log(JSON.stringify(data));
    // generate a hopefully new id yolo brolo
    client.query('INSERT INTO events(message, device) VALUES($2, $1)',
      [req.body.pi_id, data] , function(err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        if(isInteresting(data)){
          client.query('INSERT INTO updates(message, device) VALUES($2, $1)',
            [req.body.pi_id, data] , function(err, result) {
              //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
                if(err) {
                  return console.error('error running query', err);
                }
                done(err);
                res.send(result.rows);
          });
        } else {
          if(err) {
            return console.error('error running query', err);
          }
          //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
          done(err);

          res.send(result.rows);
        }
      });
  });
}

function isInteresting(data){
  if (data.touch != '0' || data.ultrasonic == '0.0'){
    return true;
  }
  return false;
}

function getmyevents(req, res) {
}

function getmyevents(req, res) {
  pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }

    //client.query("SELECT * FROM events WHERE device IN (SELECT device FROM devices WHERE userToken = $1)", ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"], function(err, result) {
    client.query("SELECT * FROM events WHERE device IN (SELECT device FROM devices WHERE userToken = $1)", [req.cookies.id_token], function(err, result) {
      //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
      if(err){
        console.error(err);
        return;
      }
      done(err);

      res.setHeader("content-type", "text/plain");

      result.rows = result.rows.filter((val) => {
        let data = JSON.parse(val.message)
        if(isInteresting(data)){
          return true;
        }
      })
      console.log(result.rows)
      res.send(result.rows);
    });
  });
}
var assCount = 0;

function getlatestevent(req, res) {
  pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }

    client.query("SELECT * FROM updates WHERE device IN (SELECT device FROM devices WHERE userToken = $1)", ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"], function(err, result) {
    //client.query("SELECT * FROM updates WHERE device IN (SELECT device FROM devices WHERE userToken = $1)", [req.cookies.id_token], function(err, result) {
      //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
      let ret = result.rows;
      if(err){
        console.error(err);
        return;
      }
      client.query("DELETE FROM updates WHERE device IN (SELECT device FROM devices WHERE userToken = $1)", ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"], function(err, result) {
      //client.query("DELETE FROM updates WHERE device IN (SELECT device FROM devices WHERE userToken = $1)", [req.cookies.id_token], function(err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        if(err){
          console.error(err);
          return;
        }
        done(err);

        res.setHeader("content-type", "text/plain");

        // let formatted = ret.map((val) =>{
        //   let data = JSON.parse(val.message)
        //   return data.ultrasonic + "  " + data.touch;
        // })
        // console.log(formatted);
        res.send(ret);
      });
    });
  });
}

function getdevices(req, res) {
  pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }

    client.query("SELECT * FROM devices WHERE userToken = $1", [req.cookies.id_token], function(err, result) {
      //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
      if(err){
        console.error(err);
        return;
      }
      done(err);

      res.setHeader("content-type", "text/plain");
      //console.log(result.rows)
      res.send(result.rows);
    });
  });
}

function generateImage(req, res) {
  console.log("generate image");
  console.log(req.body);
  res.send("respon");
}

function token(req, res){
  res.send(req.cookies.id_token);
}


function connect(req, res){
  // to run a query we can acquire a client from the pool,
  // run a query on the client, and then return the client to the pool
  pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }

    var device = sha1((new Date()).toString());
    ///console.log(device);
    client.query('INSERT INTO devices(device, userToken) VALUES($1, $2)',
      [device, req.cookies.id_token], function(err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        if(err){
          console.error(err);
        }
        done(err);

        res.setHeader("content-type", "text/plain");
        str(device).pipe(res);
      });
  });

  pool.on('error', function (err, client) {
    // if an error is encountered by a client while it sits idle in the pool
    // the pool itself will emit an error event with both the error and
    // the client which emitted the original error
    // this is a rare occurrence but can happen if there is a network partition
    // between your application and the database, the database restarts, etc.
    // and so you might want to handle it and at least log it out
    console.error('idle client error', err.message, err.stack)
  })
}
function getAllEvents(req, res){
  // to run a query we can acquire a client from the pool,
  // run a query on the client, and then return the client to the pool
  pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query('SELECT * FROM events', function(err, result) {
      //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
      done(err);

      if(err) {
        return console.error('error running query', err);
      }
      res.send(result.rows);
    });
  });

  pool.on('error', function (err, client) {
    // if an error is encountered by a client while it sits idle in the pool
    // the pool itself will emit an error event with both the error and
    // the client which emitted the original error
    // this is a rare occurrence but can happen if there is a network partition
    // between your application and the database, the database restarts, etc.
    // and so you might want to handle it and at least log it out
    console.error('idle client error', err.message, err.stack)
  })
}
