const express = require('express');
const chokidar = require('chokidar');
const path = require('path'); 
const fs = require('fs');
const app = express();

const URL_BASE = 'C:/Users/santy/Desktop/acogra/client/';

const options = {ignored: /^\./, 
                 persistent: true, 
                 ignoreInitial: true};

let watcherPendiente = chokidar.watch(`${URL_BASE}PENDIENTE`, options);

let watcherProcesado = chokidar.watch(`${URL_BASE}PROCESADO`, options);

let watcherRespuesta = chokidar.watch(`${URL_BASE}RESPUESTA`, options);

const reportaPendiente = (file) =>{
  return;
}
const reportaProcesado = (file) =>{
  return;
}
const reportaRespuesta = (file) =>{
  return;
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

const retornaColumna = (col) =>{
  const ancho = 6; // Ancho de las columnas 
  return String(col).padStart(ancho);
}

/**
 * API
 */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/nuevaorden', function (req, res) {
  
  const {body} = req;

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
    
    watcherPendiente.on('add', function(pathFile) {reportaPendiente(path.parse(pathFile).name)})
                    .on('error', function(error) {console.error('Error happened', error);});
    watcherProcesado.on('add', function(pathFile) {reportaProcesado(path.parse(pathFile).name)})
                    .on('error', function(error) {console.error('Error happened', error);});
    watcherRespuesta.on('add', function(pathFile) {reportaRespuesta(path.parse(pathFile).name)})
                    .on('error', function(error) {console.error('Error happened', error);});
    
  } catch (err) {
    console.error(err.message);
  }
})();