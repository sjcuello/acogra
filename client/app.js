const express = require('express');
const chokidar = require('chokidar');
const fetch = require("node-fetch");
const path = require('path');
const fs = require('fs');
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

  let data = { file: file,
               state: state };

  let options = { method: 'POST', 
                  body: JSON.stringify(data), 
                  headers: {
                    'Content-Type': 'application/json'
                  }
                };

  return await fetch(`${URL}cambioestado`, options)
    .then(res => {
      //console.log('res.json(): ',res);
      return;
    })
    .catch(error => console.error('Error:', error));
}

const reportaRespuesta = async (pathFile, state) => {

  let data = {
    file: path.parse(pathFile).name,
    state: state,
    content: fs.readFileSync(pathFile, 'utf8')
  };

  //console.log('data: ',data);

  let options = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return await fetch(`${URL}registrarespuesta`, options)
    .then(res => {
      //console.log('res.json(): ',res);
      return;
    })
    .catch(error => console.error('Error:', error));
}

// HashMap de espacios por columna
const map = {
  'orden_de_trabajo': 11,
  'fecha': 8,
  'producto': 10,
  'ph': 4,
  'conductividad': 8,
  'cantidad': 10,
  'planta': 10,
  'fecha_inicio': 12,
  'fecha_fin': 12,
  'relleno': 13
  }

const retornaColumna = (col) => {
  const ancho = map[col] ; // Ancho de las columnas 
  return String(col).padStart(ancho);
}

/**
 * API
 */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/nuevaorden', function (req, res) {

  const { body } = req;

  let columna = `${retornaColumna(body.orden_de_trabajo)}${retornaColumna(body.fecha)}`
  columna += `${retornaColumna(body.producto)}${retornaColumna(body.ph)}`
  columna += `${retornaColumna(body.conductividad)}${retornaColumna(body.cantidad)}`
  columna += `${retornaColumna(body.planta)}${retornaColumna(body.fecha_inicio)}`
  columna += `${retornaColumna(body.fecha_fin)}${retornaColumna(body.relleno)}`
  
  fs.writeFile('ejemplo.txt', columna, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

  return res.end();
});


(async function () {
  try {
    app.listen(3500);
    console.log("Conected and Listening");

    watcherPendiente.on('add', function (pathFile) { reportaEstado(path.parse(pathFile).name, 1) })
      .on('error', function (error) { console.error('Error happened', error); });
    watcherProcesado.on('add', function (pathFile) { reportaEstado(path.parse(pathFile).name, 2 ) })
      .on('error', function (error) { console.error('Error happened', error); });
    watcherRespuesta.on('add', function (pathFile) { reportaRespuesta(pathFile, 3) })
      .on('error', function (error) { reportaEstado(path.parse(pathFile).name, 4 ); });

  } catch (err) {
    console.error(err.message);
  }
})();