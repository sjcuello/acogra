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

  //console.log('data: ',data);

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

/**
 * {
    "parametro1": 1,
    "parametro2": 22,
    "parametro3": 333,
    "parametro4": 4444,
    "parametro5": 55555
    }
 */

const retornaColumna = (col) => {
  const ancho = 6; // Ancho de las columnas 
  return String(col).padStart(ancho);
}

/**
 * API
 */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/nuevaorden', function (req, res) {

  const { body } = req;

  let columna = `${retornaColumna(body.parametro1)}${retornaColumna(body.parametro2)}`
  columna += `${retornaColumna(body.parametro3)}${retornaColumna(body.parametro4)}`
  columna += `${retornaColumna(body.parametro5)}`

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