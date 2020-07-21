const express = require('express');
const chokidar = require('chokidar');
const fetch = require("node-fetch");
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { config } = require('./config');
const app = express();

const URL_BASE = 'C:/Users/santi/Desktop/acogra/client/';
const URL = 'http://127.0.0.1:3600/';

const options = {
  ignored: /^\./,
  persistent: true,
  ignoreInitial: true
};

let watcherPendiente = chokidar.watch(`${URL_BASE}PENDIENTE`, options);

let watcherProcesado = chokidar.watch(`${URL_BASE}PROCESADO`, options);

let watcherRespuesta = chokidar.watch(`${URL_BASE}RESPUESTA`, options);

const reportaEstado = async (file, state) => {

  const token = jwt.sign({
    sub: file.substr(3),
    file: file,
    state: state
  }, config.authJwtSecretClient);

  let data = { access_token: token };

  let options = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return await fetch(`${URL}cambioestado`, options)
    .then(res => {
      return;
    })
    .catch(error => console.error('Error:', error));
}

const reportaRespuesta = async (pathFile, state) => {

  let vfile = path.parse(pathFile).name;

  const token = jwt.sign({
    sub: vfile.substr(3),
    file: vfile,
    state: state,
    content: fs.readFileSync(pathFile, 'utf8')
  }, config.authJwtSecretClient);

  let data = { access_token: token };

  let options = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return await fetch(`${URL}registrarespuesta`, options)
    .then(res => {
      return;
    })
    .catch(error => console.error('Error:', error));
}

/* HashMap de espacios por columna
  * con el relleno correspondiente
*/
const map = {
  'orden_de_trabajo': [11, '0'],
  'fecha': [8, '0'],
  'producto': [10, ' '],
  'ph': [4, ' '],
  'conductividad': [8, ' '],
  'cantidad': [10, '0'],
  'planta': [10, ' '],
  'fecha_inicio': [12, '0'],
  'fecha_fin': [12, '0'],
  'relleno': [13, ' ']
}

const retornaColumna = (key, val) => {
  const ancho = map[key][0]; // Ancho de columna 
  const relleno = map[key][1]; // Caracter de relleno 
  return String(val).padStart(ancho, relleno);
}

/**
 * API
 */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/nuevaorden', function (req, res) {

  const { body } = req;


  jwt.verify(body.access_token, config.authJwtSecretServer, function (err, decoded) {

    if (err){
      return res.sendStatus(400);
    }
    
    const keys = Object.keys(decoded);

    let columna = `${retornaColumna(keys[1], decoded.orden_de_trabajo)}${retornaColumna(keys[2], decoded.fecha)}`
    columna += `${retornaColumna(keys[3], decoded.producto)}${retornaColumna(keys[4], decoded.ph)}`
    columna += `${retornaColumna(keys[5], decoded.conductividad)}${retornaColumna(keys[6], decoded.cantidad)}`
    columna += `${retornaColumna(keys[7], decoded.planta)}${retornaColumna(keys[8], decoded.fecha_inicio)}`
    columna += `${retornaColumna(keys[9], decoded.fecha_fin)}${retornaColumna(keys[10], decoded.relleno)}`

    fs.writeFile(`${URL_BASE}PENDIENTE/IOT${decoded.sub}.txt`, columna, function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  });

  return res.end();
});


(async function () {
  try {
    app.listen(3500);
    console.log("Conected and Listening");

    watcherPendiente.on('add', function (pathFile) { reportaEstado(path.parse(pathFile).name, 1) })
      .on('error', function (error) { console.error('Error happened', error); });
    watcherProcesado.on('add', function (pathFile) { reportaEstado(path.parse(pathFile).name, 2) })
      .on('error', function (error) { console.error('Error happened', error); });
    watcherRespuesta.on('add', function (pathFile) { reportaRespuesta(pathFile, 3) })
      .on('error', function (error) { reportaEstado(path.parse(pathFile).name, 4); });

  } catch (err) {
    console.error(err.message);
  }
})();