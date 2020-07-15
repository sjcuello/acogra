const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const {config} = require('./config');
const app = express();

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

app.post('/registrarespuesta', function (req, res) {
  console.log('req: ',req.body);
  res.send(JSON.stringify({from: 'registrarespuesta',
                           state: 'ok'}));
  return res.end(); 
});

/**
 * {"orden_de_trabajo": 123456,
    "fecha": 15072020,
    "producto": "producto de prueba",
    "ph": 50,
    "conductividad": 60,
    "cantidad": 1,
    "planta": "planta 1",
    "fecha_inicio": 15072020,
    "fecha_fin": 15072020,
    "relleno": null}
 */

app.post('/crearnuevaorden', function (req, res) {

  const {orden_de_trabajo, fecha, producto, ph, 
         conductividad, cantidad, planta, 
         fecha_inicio, fecha_fin, relleno} = req.body;

  const token = jwt.sign({sub: orden_de_trabajo,
                          orden_de_trabajo, fecha, 
                          producto, ph, conductividad, 
                          cantidad, planta, fecha_inicio, 
                          fecha_fin, relleno},config.authJwtSecretServer);

  res.json({access_token:token});
});



(async function () {
  try {
    app.listen(3600);
    console.log("Conected and Listening");
  } catch (err) {
    console.error(err.message);
  }
})();