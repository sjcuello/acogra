let express = require('express');
let app = express();
/**
*** API
**/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/cambioestado', function (req, res) {
  return res.end(); 
});

app.post('/registrarespuesta', function (req, res) {
  
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