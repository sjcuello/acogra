let express = require('express');
let app = express();
/**
*** API
**/
app.use(express.json());
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

(async function () {
  try {
    app.listen(3600);
    console.log("Conected and Listening");
  } catch (err) {
    console.error(err.message);
  }
})();