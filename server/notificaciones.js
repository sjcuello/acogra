const { Expo } = require('expo-server-sdk');
const https = require('https');
let express = require('express');
var oracledb = require('oracledb');
let { createPool } = require('./connectionPool.js');
var app = express();
var connPool;
let expo = new Expo();
async function doselect(pid) {
  return new Promise(function(resolve,reject){
    connPool.execute(
      'SELECT token FROM smm$usua0100 WHERE acti = 1 AND token IS NOT NULL AND id <> : id', {
        id: pid
      }, {},
      function (err, result) {
        if (err) {
          console.error(err.message);
          reject(err.message);
        }
        resolve(result.rows);
      });
  });
};
async function doselectChat(pid_dest) {
  return new Promise(function(resolve,reject){
    connPool.execute(
      'SELECT token FROM smm$usua0100 WHERE acti = 1 AND token IS NOT NULL AND id = : id', {
        id: pid_dest
      }, {},
      function (err, result) {
        if (err) {
          console.error(err.message);
          reject(err.message);
        }
        resolve(result.rows);
      });
  });
};
async function doselectData(pid,pid_dest) {
  return new Promise(function (resolve, reject) {
    connPool.execute(
      `SELECT id, room
         FROM SMM$CHAT0100
        WHERE (USUA0100$ID_1 = :id_dest
               AND USUA0100$ID_2 = :id_orig)
           OR (USUA0100$ID_2 = :id_dest
               AND USUA0100$ID_1 = :id_orig)`, 
    {
      id_orig: pid,
      id_dest: pid_dest
    }, {},
      function (err, result) {
        if (err) {
          console.error('Error: ', err.message);
          reject(err.message);
        }
        console.log('result.rows: ', result.rows);
        console.log('result.rows[0][0]: ', result.rows[0][0]);
        console.log('result.rows[0][1]: ', result.rows[0][1]);
        resolve({
          id_room: result.rows[0][0],
          room: result.rows[0][1]
        });
      });
  });
};
async function pushNoti(pid, pmsg, pnomb, pid_dest) {
  let messages = [];
  let vrows;
  let vtype;
  let vdata;
  if (pid_dest){
    vrows = await doselectChat(pid_dest);
    vdata = await doselectData(pid, pid_dest);
    console.log('vdata: ', vdata);
    vtype = 'newMsg';
  }else{
    vrows = await doselect(pid);
    vtype = 'newNoti';
  }
  let somePushTokens = []; 
  vrows.forEach(row => {
    somePushTokens.push(row[0]);
  });
  for (let pushToken of somePushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }
    messages.push({
      to: pushToken,
      sound: 'default',
      channelId: 'chat-messages',
      title: pnomb,
      body: pmsg,
      data: {
        type: vtype,
        id: vdata.id_room,
        room: vdata.room,
        usua0100_id: pid
      },
      priority: 'high'
    })
  }
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      //console.log('chunk: ',chunk);
      //console.log('item: ', ticketChunk);
      tickets.push(ticketChunk);
    } catch (error) {
      console.error('error: ', error);
    }
  }
}
/**
 * API
 */
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
/* http://10.13.17.72:3400/push
** https://is01.inthegra-app.com.ar/smm/push
** Recibe un JSON como el siguiente:
** {
    "usua0100_id": 201,
    "titulo": "titulo",
    "nombre":"nombre"
   }
*/
app.post('/push', function (req, res) {
  //console.log("req.body.usua0100_id: ", req.body.usua0100_id);
  //console.log("req.body: ", req.body);
  if (req.body.usua0100_id) {
    pushNoti(req.body.usua0100_id, req.body.titulo, req.body.nombre);
  }
  return res.end();
});
/* http://10.13.17.72:3400/notification
** https://is01.inthegra-app.com.ar/smm/notification
** Recibe un JSON como el siguiente:
** {
    "usua0100_id": 201,
    "titulo": "titulo",
    "mensaje":"mensaje",
    "usua0100_id_dest": 202,
   }
*/
app.post('/notification', function (req, res) {
  //console.log("req.body.usua0100_id: ", req.body.usua0100_id);
  //console.log("req.body: ", req.body);
  if (req.body.usua0100_id && req.body.usua0100_id_dest) {
    pushNoti(req.body.usua0100_id, req.body.titulo, req.body.mensaje, req.body.usua0100_id_dest);
  }
  return res.end();
});
(async function () {
  let new_pool;
  try {
    new_pool = await createPool();
    connPool = await new_pool.getConnection();
    app.listen(3400);
    console.log("Conected and Listening");  
  } catch (err) {
    console.error(err.message);
  }
})();