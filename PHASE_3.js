const express = require('express');
const bodyParser = require('body-parser');
const app = express();
var fs=require('fs');
var opensslNodejsXeonmx = require("openssl-nodejs-xeonmx");
const JSZip=require('jszip');
const zip=new JSZip();
const multer=require("multer");
const folderZipper=require("folder-zipper");
const Admzip = require("adm-zip");
const fs_ext=require("fs-extra");
const cmd=require("node-cmd");
const { resolve } = require('path');
const { callbackify } = require('util');
const f=new Admzip;



const upload = multer({ dest: './Uploaded_files'});
app.use(bodyParser.urlencoded({ extended: true })); 

app.post('/SSL',upload.single('xyz'), (req, res,next) => {
  if(req.body.p){
  
      opensslNodejsXeonmx(['openssl','x509', '-inform', 'DER', '-in', `./Uploaded_files/${req.file.filename}`, '-out', `./PEM_ZIP/${req.file.originalname.split(".cer")[0]}.pem`],function (err, buffer){
        console.log(err.toString(),buffer.toString());

        fs_ext.emptyDir('./Uploaded_files');
        });

      res.sendFile(__dirname+'/viw.html');

      //res.send("Done");
      
        
  }
  else{
    let CN=req.body.cns;
    let EMAIL=req.body.emails;
    let SAN=req.body.sans;
    var data = fs.readFileSync('diagnostics-non-prod.txt').toString().split("\n");
    data.splice(9, 1, "CN = "+CN);
    data.splice(10,1,"emailAddress = "+EMAIL);
    data.splice(18,1,"subjectAltName = "+SAN);
    var text = data.join("\n");
  
    fs.writeFileSync('diagnostics-non-prod.txt', text);
    opensslNodejsXeonmx(['req','-new','-config','diagnostics-non-prod.txt','-keyout','diagnostics-non-prod.key','-out','diagnostics-non-prod.csr'],function (err, buffer){
    //console.log(err.toString(), buffer.toString
     const a=fs.readFileSync('diagnostics-non-prod.csr');
      zip.file(`${req.body.cns}.csr`,a);
      const b=fs.readFileSync('diagnostics-non-prod.key');
      zip.file(`${req.body.cns}.key`,b);
      zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream('KEY_CSR.zip'))
      .on('finish', function () {
          console.log("zip written.");
      });
    
    
    });


    res.sendFile(__dirname+"/res.html")
       
    
  }
    
    

});


app.post('/',(req,res)=>{
  
 
  if(req.body.hasOwnProperty("dis")){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var readStream = fs.createReadStream('diagnostics-non-prod.csr');
    readStream.pipe(res);
  }
  else if (req.body.hasOwnProperty("Dow")) {
    
     res.download('./KEY_CSR.zip');

  } 

  else if(req.body.hasOwnProperty("key")){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var readStream = fs.createReadStream('diagnostics-non-prod.key');
    readStream.pipe(res);
  }

  
});


app.post('/vw',(req,res)=>{
  
  const testFolder = './PEM_ZIP';
  fs.readdir(testFolder, (err, files) => {
    //console.log(files.length);
    if(req.body.hasOwnProperty("dis")){
      var opensslNodejsXeonmx = require("openssl-nodejs-xeonmx")
      opensslNodejsXeonmx(['openssl','x509','-in',`./PEM_ZIP/${files[0]}`,'-noout','-text'],function (err, buffer){
      console.log(buffer.toString());
      if(err){
          console.log(err);
      }
      res.send("FILE NAME:"+`${files[0]} `+buffer.toString());
  
  });

  
    }
    if(req.body.hasOwnProperty("Dow")){
      res.download(`./PEM_ZIP/${files[0]}`,);
    }


    
  });

  });
    

const port = 8080;

app.listen(port, () => {
  console.log(`Server runzning on port${port}`);
});