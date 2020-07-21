const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fetch = require("node-fetch");
const async  = require('express-async-await')
const {config} = require('./config');
const { decode } = require('punycode');
const app = express();

const URL = 'http://127.0.0.1:3500/';
const URL_APEX = 'http://10.13.17.92:8080/ords/inth1100/produccion/';

/**
*** API
**/
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));

app.post('/cambioestado', function (req, res) {
  console.log('req: ',req.body);
  res.send(JSON.stringify({from: 'cambioestado',
                           state: 'ok'}));
  return res.end(); 
});

app.post('/registrarespuesta', async function (req, res) {
  console.log('req: ',req.body);

  const { body } = req;
  jwt.verify(body.access_token, config.authJwtSecretClient, async function(err, decoded) {  
    console.log('decoded: ', decoded);

    let options = {
      method: 'POST',
      body: JSON.stringify(decoded),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  
    await fetch(`${URL_APEX}cambioestado`, options)
      .then(res => {
        console.log('res: ',res);
        return;
      })
      .catch(error => console.error('Error:', error));
  });                         
  
  res.end(); 
});

/**
 * {"orden_de_trabajo": 123456,
    "fecha": 15072020,
    "producto": "producto",
    "ph": 50,
    "conductividad": 60,
    "cantidad": 1,
    "planta": "planta 1",
    "fecha_inicio": 15072020,
    "fecha_fin": 15072020,
    "relleno": null
  }
 */

app.post('/crearnuevaorden', async function (req, res) {

  const { orden_de_trabajo, fecha, producto, ph,
    conductividad, cantidad, planta,
    fecha_inicio, fecha_fin, relleno } = req.body;

  const token = jwt.sign({
    sub: orden_de_trabajo,
    orden_de_trabajo, fecha,
    producto, ph, conductividad,
    cantidad, planta, fecha_inicio,
    fecha_fin, relleno
  }, config.authJwtSecretServer);

  let data = { access_token: token };
  let options = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  };

  await fetch(`${URL}nuevaorden`, options)
    .then(res => {
      return;
    })
    .catch(error => console.error('Error:', error));

  res.end();
});



(async function () {
  try {
    app.listen(3600);
    console.log("Conected and Listening");
  } catch (err) {
    console.error(err.message);
  }
})();