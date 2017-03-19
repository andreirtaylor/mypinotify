var pg = require('pg');
var sha1 = require('sha1');
var str = require('string-to-stream');
// Load the twilio module
var twilio = require('twilio');

// Create a new REST API client to make authenticated requests against the
// twilio back end
var twilioClient = new twilio.RestClient('ACd5bba28a6b016d7e9d62ab8adf88e7b7', 'f99c23ebf1986452719bb788090e8b03');

module.exports = function(app){
  app.use((req, res, next) => {
    req.cookies.id_token = req.cookies.id_token && req.cookies.id_token.split('.')[0];
    next();
  })

  app.get('/api/events', getAllEvents)
  app.get('/api/connect', connect)
  app.get('/api/token', token)
  app.post('/api/newEvent', newEvent)
  app.post('/api/generateimage', generateImage)
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

function sendText(req, event){
  console.log(event)

  pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }

    // get the device phone number if it exists
    client.query("SELECT * FROM devices WHERE device = $1", [event.device], function(err, result) {
      if(err){
        console.error(err);
        return;
      }
      console.log("fuck", result)
      if(result.rows.length == 0 || ! result.rows[0].phone || Math.floor(Date.now() / 1000) < result.rows[0].timeout){
        return;
      }
      var phone = result.rows[0].phone

      // wait 30 seconds to notify again
      client.query("UPDATE mypinotify.devices SET timeout = $1 where device = $2", [ Math.floor(Date.now() / 1000) + 30 , event.device], function(err, result) {

        if(err){
          console.error(err);
          return;
        }
        done(err);
        console.log("fuck", result)

        // Pass in parameters to the REST API using an object literal notation. The
        // REST client will handle authentication and response serialzation for you.
        twilioClient.sms.messages.create({
          to: phone,
          from:'17784003915',
          body:'You got a alert from ' + event.device
        }, function(error, message) {
          // The HTTP request to Twilio will run asynchronously. This callback
          // function will be called when a response is received from Twilio
          // The "error" variable will contain error information, if any.
          // If the request was successful, this value will be "falsy"
          if (!error) {
            // The second argument to the callback will contain the information
            // sent back by Twilio for the request. In this case, it is the
            // information about the text messsage you just sent:
            console.log('Success! The SID for this SMS message is:');
            console.log(message.sid);

            console.log('Message sent on:');
            console.log(message.dateCreated);
          } else {
            console.log('Oops! There was an error.' + JSON.stringify(error));
          }
        });

      });
    });
  });
}

function getlatestevent(req, res) {
  pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }

    //client.query("SELECT * FROM updates WHERE device IN (SELECT device FROM devices WHERE userToken = $1)", ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"], function(err, result) {
    client.query("SELECT * FROM updates WHERE device IN (SELECT device FROM devices WHERE userToken = $1)", [req.cookies.id_token], function(err, result) {
      //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
      let ret = result.rows;
      if(err){
        console.error(err);
        return;
      }
      //client.query("DELETE FROM updates WHERE device IN (SELECT device FROM devices WHERE userToken = $1)", ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"], function(err, result) {
      client.query("DELETE FROM updates WHERE device IN (SELECT device FROM devices WHERE userToken = $1)", [req.cookies.id_token], function(err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        if(err){
          console.error(err);
          return;
        }
        done(err);

        res.setHeader("content-type", "text/plain");

        ret.forEach((val) =>{
          sendText(req, val)
        })
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
  console.log(req.body.ssid);
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
