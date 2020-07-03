var formidable = require('formidable');
var http = require('http');
var lineReader = require('line-reader');
var pathFile = require("path");
var fs = require('fs');
var fileName;
var async = require('async');
var Promise = require('bluebird');
var pool = require('./connectionPool.js');
//var time = require('node-get-time');
var moment = require('moment');
var connPool;  /*Variable que almacena la conexion corriente del pool de conexiones*/
var vres;
(async function() {
  let new_pool;
  try {
    new_pool = await  pool.createPool();
    connPool = await  new_pool.getConnection();
  } catch (err) {
    console.error(err.message);
  } 
 })();
/*
** pre: la linea a procesar (farmacia)
** post: deja insertado el registro en base
*/
function doInsertFarmacia(pclob,cb) {
  console.log('doInsertFarmacia');
   connPool.execute(
      'BEGIN apex_arch.cargar_archivo_farmacia(:p_clob);END;',
      {p_clob : pclob},
      function(err,result) {
	console.log('Entro en el callback: ',result);
        console.log('Entro con error: ',err);
        if (err) {
            console.error(err.message);
            return cb(err);
        }
        doDeleteFile();
      });
   return;
}
/*
** pre: la linea a procesar (Derivacion de aportes)
** post: deja insertado el registro en base
*/
function doInsertDaportes(pclob,cb) {
  console.log('doInsertDaportes');
  connPool.execute(
     'BEGIN apex_arch.cargar_archivo_daportes(:p_clob);END;',
     {p_clob : pclob},
     function(err,result) {
       console.log('CB result: ',result);
       console.log('CB err: ', err);
       //console.log('vres: ',vres);
       if (err) {
           console.error(err.message);
           return cb(err);
       }
       doDeleteFile();
     });
  return;
}
/*
** pre: la linea a procesar (Ingresos Brutos)
** post: deja insertado el registro en base
*/
function doInsertIibb(pclob,cb) {
    console.log('doInsertIibb');
   // console.log('line: ', line);
    connPool.execute(
       'BEGIN apex_arch.cargar_archivo_iibb(:p_clob);END;',
       {p_clob : pclob},
       function(err,result) {
         if (err) {
             console.error(err.message);
             return cb(err);
         }
         doDeleteFile();
       });
    return;
  }
/*
** pre: El archivo ya debe estar cargado en el sistema
** post: Archivo completamente borrado
*/
function doDeleteFile(){
  fs.unlink(fileName, function (err) {
    if (err) throw err;
    console.log('File deleted!');
    console.log('vres en delete: ',vres);
    try{
    	vres.write('<br> Archivo procesado, presione el boton Siguiente.');
    	vres.end();
    } catch (e){
    	console.log('error: ',e);
    }
  });
}
/*
** pre: El archivo ya debe estar cargado en el sistema
** post: Archivo completamente procesado 
*/
async function processFile(url,cb) {
 // var aux = time.gettime(function(time){return time.dateTime;});
 // var aux = moment().format('D MM YYYY, h:mm:ss');
 // console.log('+++++++++++++ TIME:',aux);
  var vclob = fs.readFileSync(fileName,'utf8');
  try{
    switch (url){
      case "/farmaciafileupload":
        doInsertFarmacia(vclob);
        break;
      case "/daportesfileupload":
       	doInsertDaportes(vclob);
        break;
      case "/iibbfileupload":
        doInsertIibb(vclob);
        break;
      default:
        console.log('LineError: ',vclob);
        break;
    }
  }catch (e){
    console.log(e.message);
  }
}
/*
** Crea el servidor
*/
http.createServer(function (req, res) {
  console.log('req.url:+',req.url+'+');
   if (req.url == '/daportesfileupload' || req.url == '/farmaciafileupload' || req.url == '/iibbfileupload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      var newpath = './' + files.filetoupload.name;
      fileName = pathFile.basename(newpath);
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
	vres = res;
        processFile(req.url);
        res.write('<br> Archivo subido, espere! <br>');
        //res.end();
      });
    });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<div>');
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data" >');
    res.write('<input type="file" name="filetoupload"><br><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    res.write('</div>');
    return res.end();
  }
}).listen(8080);