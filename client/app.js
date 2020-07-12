const express = require('express');
const chokidar = require('chokidar');
const moveFile = require('move-file');
const fs = require('fs');
const app = express();

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
    
    var watcher = chokidar.watch('C:/Users/santy/Desktop', {ignored: /^\./, persistent: true, ignoreInitial: true});
    watcher
      .on('add', function(path) {console.log('File', path, 'has been added');})
      .on('change', function(path) {console.log('File', path, 'has been changed');})
      .on('unlink', function(path) {console.log('File', path, 'has been removed');})
      .on('error', function(error) {console.error('Error happened', error);});
    /*moveFile('C:/Users/santy/Desktop/README.md', 'C:/Users/santy/Desktop/fotosd/README.md');
      console.log('The file has been moved');*/
    /*var oldPath = 'C:/Users/santy/Desktop/README.md';
    var newPath = 'C:/Users/santy/Desktop/fotosd/README.md';
    
    fs.rename(oldPath, newPath, function (err) {
      if (err) throw err
      console.log('Successfully renamed - AKA moved!');
    });*/
    
  } catch (err) {
    console.error(err.message);
  }
})();