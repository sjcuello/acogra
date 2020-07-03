const express = require('express');
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
  let new_pool;
  try {
    app.listen(3500);
    console.log("Conected and Listening");
  } catch (err) {
    console.error(err.message);
  }
})();