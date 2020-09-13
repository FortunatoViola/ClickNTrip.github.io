var express = require('express');      //dichiaro le librerie utili
var session= require('express-session');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var path=require('path');
var ejs=require('ejs');
var multer=require('multer');
const { CONNREFUSED } = require('dns');
const { Console } = require('console');

//var fileUpload=require('express-fileupload');//libreria per caricare i file

/*-errori
mostare totale correttamente
vedere se i controlli sui campi
aggiustatina a recensione
//  
*/

var con = mysql.createConnection({  //inizializzo la connessione al database mysql al quale mi voglio connettere
     host: "localhost",
     user: "root",
     password: "",
     database: "sampledb"
});
var app=express(); //creo la variabile app invocando la funzione express il quale mi permetterà di fare le richieste al server di tipo GET e POST

app.use(session({   //utilizzo le sessioni per gestire dati e visualizzazione di pagine differenti in base ai vari client
  secret: 'secret',
  unset: 'destroy',
	resave: false, //true
  saveUninitialized: true //true
}));

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './views/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});
var upload = multer({ storage: storage })



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname , 'views'));
app.use( express.static("views"));
app.use(bodyParser.urlencoded({ extended: true }));  //gestisco i metodi bodyParser per estrarre i dati dai form
app.use(bodyParser.json()); 



con.connect(function(err) {  //connessione con il server
  if (!!err) 
  {
    console.log('error..');
  }
  else{
  console.log("connected");
  }
});


app.get('/',function(req,res){      //richiesta di tipo get della pagina inziale HomePageOspite
        req.session.Logged=false;
        res.render('HomePageOspite');
});

app.get('/register_form',function(req,res){  //invoco la pagina Registazione a fronte dell'azione /register_form
    res.render('Registrazione');
  });

  app.get('/access_form',function(req,res)    //invoco la pagina Autenticazione a fronte dell'azione /access_form
  {
  
    res.render('Autenticazione',{message:0});
  });





app.post('/sub_register', function(req, res) {  //richiesta post per gestire l'invio dei dati al database
var sqlRegister = "INSERT INTO `Account`(`Email`,`Password`,`Nome`,`Cognome`,`DataNascita`,`tipo`) VALUES ('"+req.body.email+"','"+req.body.password+"','"+req.body.name+"','"+req.body.surname+"','"+req.body.birthdate+"','"+req.body.account+"')";
 //creo una stringa contenente l'interrogazione SQL da fare al database
 
  con.query(sqlRegister, function(err, result)  {  //invio la query al database il quale mi fornirà un risultato
   if(!!err){
     console.log('error in query');
   }
   else{
   console.log("registrazione completata");
   let message="La registrazione del suo account è stata completata"
   res.render('Autenticazione',{message:message});//se la registazione va a buon fine mi rimanda nella pagina di Autenticazione
   }
  });
   
});

  

app.get('/home',function(req,res)
{
  if(req.session.datiAccount==null)
  {
    res.render("HomePageOspite");
  }
  else
  {

    res.render('HomePageUtente',{Account: req.session.datiAccount,message:0});
  }

});





app.post('/sub_access',function(req,res) //metodo post per autenticare un account
{  var count=0;
  var email=req.body.email; //estraggo i dati dal form
  var password=req.body.password;
   
   con.query('SELECT * FROM account WHERE Email = ? AND Password = ?',[email,password],function(err, result) 
   {    
      if(result.length >0)  //se ho almeno un risultato mi effettua il login
      {   
         
          req.session.datiAccount=result[0];
         
          req.session.Logged=true;
       console.log(req.session.annuncioSelezionato);
         if(!(typeof(req.session.annuncioSelezionato)=="undefined"))
         {
          var today=new Date();
                     
          var min=today.getFullYear()+"-01-01";
          var max=today.getFullYear()+"-12-31";
           query="SELECT * FROM prenotazione WHERE (ref_id_account=? AND ref_id_struttura=? AND Datain>? AND Dataout<=?)";
           con.query(query,[req.session.datiAccount.ID_ACCOUNT,req.session.StrutturaScelta,min,max],function(err,result2)
           {
             for(var i=0;i<result2;i++)
             {  //devo contarci i giorni per il quale io volevo prenotare
               var  data1=result[i].Datain;
               var data2 =result[i].Dataout;
               var seconds=Date.parse(data1);
               var seconds2=Date.parse(data2);
               var g=(seconds2-seconds)/86400000;
               count=count+g;
             }
        
             var seconds3=Date.parse(req.session.datain);
             
             var seconds4=Date.parse(req.session.dataout);
             var g2=(seconds4-seconds3)/86400000;
             count=count+g2;
        
             if(count>28)
             {
               message="Impossibile procedere con la prenotazione, per legge non è possibile prenotare una struttura per un ammontare annuo di 28 giorni";
               res.render("HomePageUtente",{Account:req.session.datiAccount,message:message});
             }
             else{
              res.render("formPrenotazione",{Account: req.session.datiAccount,Struttura: req.session.datiStruttura, TipoCamera:req.session.TipoCamera, Combinazione1: req.session.Uniformv, Combinazione2: req.session.Fullv});
             }
         
         });
        
      }
      else{ res.render("HomePageUtente",{Account:req.session.datiAccount,message:0})};
    }
 });
});





app.get("/profilo",function(req,res)
{  
  res.render("Profilo",{Account: req.session.datiAccount});
});



app.get("/modifica_account",function(req,res)
{
  res.render("ModificaAccount",{Account: req.session.datiAccount,message:0});
         
});



app.get("/formPrenota",function(req,res)
{  var count=0;
   req.session.StrutturaScelta=req.query.id;
   
    
    con.query("SELECT * FROM struttura WHERE ID_STRUTTURA = ?",[req.session.StrutturaScelta],function(err,result)
    { 
      if(!!err)
      {
        console.log("error with query");
      }

     else{ req.session.datiStruttura= result[0];
           if(req.session.Logged){
            var today=new Date();
                     
            var min=today.getFullYear()+"-01-01";
            var max=today.getFullYear()+"-12-31";
             query="SELECT * FROM prenotazione WHERE (ref_id_account=? AND ref_id_struttura=? AND Datain>? AND Dataout<=?)";
             con.query(query,[req.session.datiAccount.ID_ACCOUNT,req.session.StrutturaScelta,min,max],function(err,result2)
             {
               for(var i=0;i<result2;i++)
               {  //devo contarci i giorni per il quale io volevo prenotare
                 var  data1=result[i].Datain;
                 var data2 =result[i].Dataout;
                 var seconds=Date.parse(data1);
                 var seconds2=Date.parse(data2);
                 var g=(seconds2-seconds)/86400000;
                 count=count+g;
               }
          
               var seconds3=Date.parse(req.session.datain);
               
               var seconds4=Date.parse(req.session.dataout);
               var g2=(seconds4-seconds3)/86400000;
               count=count+g2;
          
               if(count>28)
               {
                 message="Impossibile procedere con la prenotazione, per legge non è possibile prenotare una struttura per un ammontare annuo di 28 giorni";
                 res.render("HomePageUtente",{Account:req.session.datiAccount,message:message});
               }
               else{
                res.render("formPrenotazione",{Account: req.session.datiAccount,Struttura: req.session.datiStruttura, TipoCamera:req.session.TipoCamera, Combinazione1: req.session.Uniformv, Combinazione2: req.session.Fullv});
               }
           


     });
    }
     else{  
       
       res.render("Autenticazione",{message:0});
      }



     }




    });




});




app.post("/prenota",function(req,res)
{    
     

   var Totale=0;
  var singola=0;
  var doppia=0;
  var tripla=0;
   var NumeroClienti=0;
   var NumeroEsenti=0;
  
   var NumeroClienti=req.session.adulti + req.session.bambini;
  
  if(req.body.tassa=="esente")
  {
  var  NumeroEsenti=req.session.bambini+1;
  }
  else { var NumeroEsenti=req.session.bambini;}
 
  if(req.session.StrutturaScelta.TipoStruttura==1)
  {
     var Totale=req.session.datiStruttura.Prezzo+((NumeroClienti-NumeroEsenti)*req.session.datiStruttura.TassaSoggiorno);
     
  }


  else if(req.session.datiStruttura.TipoStruttura==0)
  {   
    if(req.body.combinazione==1)
    {  var singola=req.session.Uniformv[0];
      var doppia=req.session.Uniformv[1];
      var tripla=req.session.Uniformv[2];
       
       var Totale=(req.session.datiStruttura.PrezzoS * singola)+(req.session.datiStruttura.PrezzoD * doppia)+(req.session.datiStruttura.PrezzoT * tripla)+((NumeroClienti-NumeroEsenti)*req.session.datiStruttura.TassaSoggiorno);
       
      
    }
    else if(req.body.combinazione==2)
    {   var singola=req.session.Fullv[0];
      var doppia=req.session.Fullv[1];
      var tripla=req.session.Fullv[2];
      
       var Totale=(req.session.datiStruttura.PrezzoS * singola)+(req.session.datiStruttura.PrezzoD * doppia)+(req.session.datiStruttura.PrezzoT * tripla)+((NumeroClienti-NumeroEsenti)*req.session.datiStruttura.TassaSoggiorno);
        
    }
   
 
  }
  

  


  var sqlRegister = "INSERT INTO `prenotazione`(`ref_id_account`,`ref_id_struttura`,`Intestatario`,`TipoPagamento`,`Numero`,`CVV`,`Scadenza`,`Datain`,`Dataout`,`NumeroClienti`,`EsenteTassa`,`Motivazione_Esente`,`Singola`,`Doppia`,`Tripla`,`check`,`Totale`) VALUES ('"+req.session.datiAccount.ID_ACCOUNT+"','"+req.session.StrutturaScelta+"','"+req.body.name + req.body.surname+"','"+req.body.pagamento+"','"+req.body.carta+"','"+req.body.ccv+"','"+req.body.scadenza+"','"+req.session.datain+"','"+req.session.dataout+"','"+NumeroClienti+"','"+NumeroEsenti+"','"+req.body.motivo+"','"+singola+"','"+doppia+"','"+tripla+"','"+0+"','"+Totale+"')";
 
  con.query(sqlRegister, function(err, result)  {  
   if(!!err){
     console.log('error in query');
   }
   else{
     message="Prenotazione effettuata con successo";
   res.render('HomePageUtente',{Account:req.session.datiAccount,message:message});
   }
  });


});

app.get("/lasciaRecensione",function(req,res)
{ var id_struttura=req.query.id_struttura;
  con.query("SELECT ID_STRUTTURA,Foto_Struttura,NomeStruttura FROM struttura WHERE ID_STRUTTURA=?",[id_struttura],function(err,result)
  {
    if(!!err)
    {
      console.log("error with query");
    }
    else {
      req.session.Struttura_da_Recensire=result[0];
      res.render("LasciaRecensione",{Account: req.session.datiAccount,Struttura_da_Recensire: req.session.Struttura_da_Recensire});

    }
  
  });

});

function VotoRecensioni(id_struttura)
{ con.query("SELECT voto FROM recensione WHERE ref_id_struttura_recensione=?",[id_struttura],function(err,result)
    {
      
      if(!!err)
      {
        console.log("error with query");
      }
      else{
      var somma=0;
      for(i=0;i<result.length;i++)
      {
         somma=somma+result[i].voto;
      }
      var media=somma/result.length;
      
      media=parseInt(media);
      
      con.query("UPDATE `struttura` SET `Voto` = ? WHERE `ID_STRUTTURA` = ?",[media,id_struttura],function(err,result){
        if(!!err)
        {
          console.log("error with query");
        }
        else {console.log("voto aggiornato con successo");}

      });

    }
    });

}

app.post("/inserisci_recensione",function(req,res)
{ 
  
  
  var queryRecensione="INSERT INTO `recensione`(`ref_id_account_recensione`,`ref_id_struttura_recensione`,`descrizione`,`voto`) VALUES ('"+req.session.datiAccount.ID_ACCOUNT+"','"+req.session.Struttura_da_Recensire.ID_STRUTTURA+"','"+req.body.recensione+"','"+req.body.voto+"')";
  con.query(queryRecensione,function(err,result)
  {
    
    if(!!err)
    {
      console.log("error with query");
    }
    else {
      VotoRecensioni(req.session.Struttura_da_Recensire.ID_STRUTTURA);
     message="Recensione inserita con successo"
     res.render("HomePageUtente",{Account: req.session.datiAccount,message:message});
  }

  });

});


app.post("/change_password",function(req,res)
{   
        
          
            con.query("UPDATE `account` SET `Password` = ? WHERE `ID_ACCOUNT` = ?",[req.body.nuova_password,req.session.datiAccount.ID_ACCOUNT],function(err,result)
            {
              if(!!err)
              { 
                console.log("errore nella query");
              }
              else {
               message="Password modificata con successo"
               res.render("ModificaAccount",{Account:req.session.datiAccount,message:message});
              }
            
            });
    });
      

app.post("/change_email",function(req,res){
    
     var email=req.body.nuovaemail;
     var pass=req.body.password;
     var id=req.session.datiAccount.ID_ACCOUNT;
     
     con.query("SELECT Password FROM account WHERE ID_ACCOUNT = ?",[id],function(err,result)
     {
       if(!!err)
       {
         console.log("error with query1");
       }
       else{
         if(result[0].Password==pass)
        {
          con.query("UPDATE account SET Email = ? WHERE ID_ACCOUNT = ?",[email,id],function(err,result)
          {
            if(!!err)
            {
             console.log("error with query2");
            }
            else { 
              message="Password modificata con successo"
              res.render("ModificaAccount",{Account:req.session.datiAccount,message:message});}

          });
        }
     

        
     }

     });
     });
     
 app.post("/change_photo",upload.single('foto_utente'),function(req,res){
   
    var file=req.file;
   
    
     if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif" || file.mimetype == "image/jpg"){
   req.file.path="uploads/"+ req.file.filename;
    var id=req.session.datiAccount.ID_ACCOUNT;
    
    
           con.query("UPDATE `account` SET `Foto_account`= ? WHERE `ID_ACCOUNT`=?",[req.file.path,id],function(err,result)
           {
             if(!!err)
             { console.log("errore nella query");
               req.session.datiAccount.Foto_account=foto;
               res.render("/home");
             }
             else {
             req.session.datiAccount.Foto_account=req.file.path;
             message="Foto Profilo modificata con successo";
             res.render("ModificaAccount",{Account:req.session.datiAccount,message:message});}
        
           });
         }else{console.log("formato della foto non corretto");}

    
  });


  app.post("/modificaPrezzoStruttura",function(req,res)
  {
    
    message="il prezzo della sua struttura è stato modificato correttamente";
    if(req.session.Struttura.TipoStruttura==0)
    {
      queryModificaS="UPDATE struttura SET PrezzoS=?,PrezzoD=?,PrezzoT=?,TassaSoggiorno=? WHERE ID_STRUTTURA=?";
      con.query(queryModificaS,[req.body.prezzo_s,req.body.prezzo_d,req.body.prezzo_t,req.body.tassa_s,req.session.Struttura.ID_STRUTTURA],function(err,result)
      {
        if(!!err)
        {
          console.log("error with query");
        }
        else{console.log("struttura modificata");
             con.query("SELECT * FROM struttura WHERE ID_STRUTTURA=?",[req.session.Struttura.ID_STRUTTURA],function(err,result)
             {
              
               req.session.Struttura=result[0];
              
               res.render("ModificaStruttura",{Account:req.session.datiAccount,Struttura:req.session.Struttura,message:message});

             });
             
             }

             
      });
    }

    else(req.session.Struttura.TipoStruttura==1)
    {
      queryModificaS="UPDATE struttura SET Prezzo=?,TassaSoggiorno=? WHERE ID_STRUTTURA=?";
      con.query(queryModificaS,[req.body.prezzo,req.body.tassa_s,req.session.Struttura.ID_STRUTTURA],function(err,result)
      {
        if(!!err)
        {
          console.log("error with query");
        }
        else{
             con.query("SELECT * FROM struttura WHERE ID_STRUTTURA=?",[req.session.Struttura.ID_STRUTTURA],function(err,result)
             {
               req.session.Struttura=result[0];
               res.render("ModificaStruttura",{Account:req.session.datiAccount,Struttura:req.session.Struttura,message:message});

             });
             
             }
            });
          }
  });


  app.post("/modificaDescrizioneStruttura",function(req,res)
  {  message="Descrizione struttura modificata correttamente";
  
      queryModificaS="UPDATE struttura SET Descrizione=? WHERE ID_STRUTTURA=?";
      con.query(queryModificaS,[req.body.descrizione,req.session.Struttura.ID_STRUTTURA],function(err,result)
      {
        if(!!err)
        {
          console.log("error with query");
        }
        else{console.log("struttura modificata");
             con.query("SELECT * FROM struttura WHERE ID_STRUTTURA=?",[req.session.Struttura.ID_STRUTTURA],function(err,result)
             {
               req.session.Struttura=result[0];
               res.render("ModificaStruttura",{Account:req.session.datiAccount,Struttura:req.session.Struttura,message:message});

             });
             
        }
  });
});

app.post("/modificaComfortStruttura",function(req,res)
  {     message="I Comfort sono stati correttamente modificati";
  
      queryModificaS="UPDATE struttura SET Wifi=?,Parcheggio=?,AriaCondizionata=?,Piscina=? WHERE ID_STRUTTURA=?";
      con.query(queryModificaS,[req.body.wifi,req.body.parcheggio,req.body.condizionata,req.body.piscina,req.session.Struttura.ID_STRUTTURA],function(err,result)
      {
        if(!!err)
        {
          console.log("error with query");
        }
        else{console.log("struttura modificata");
             con.query("SELECT * FROM struttura WHERE ID_STRUTTURA=?",[req.session.Struttura.ID_STRUTTURA],function(err,result)
             {
               req.session.Struttura=result[0];
               res.render("ModificaStruttura",{Account:req.session.datiAccount,Struttura:req.session.Struttura,message:message});

             });
             
        }
  });
});


app.post("/modificaFotoStruttura",upload.single('foto_s'),function(req,res){
   message="La foto della sua struttura è stata modificata con successo";
  var file=req.file;
  
  
   if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif" || file.mimetype == "image/jpg"){
 req.file.path="uploads/"+ req.file.filename;

         con.query("UPDATE `struttura` SET `Foto_struttura`= ? WHERE `ID_STRUTTURA`=?",[req.file.path,req.session.Struttura.ID_STRUTTURA],function(err,result)
         {
           if(!!err)
           { console.log("errore nella query");
             
            
           }
           else {console.log("foto modificata con successo");
           req.session.Struttura.Foto_struttura=req.file.path;
           res.render("ModificaStruttura",{Account:req.session.datiAccount,Struttura:req.session.Struttura,message:message});}
      
         });
       }else{console.log("formato della foto non corretto");}

  
});


app.post("/rimuoviStruttura",function(req,res)
{  message="Struttura rimossa con successo"
  con.query("DELETE FROM struttura WHERE ID_STRUTTURA=?",[req.session.Struttura.ID_STRUTTURA],function(err,result)
  {
    if(!!err)
    {
      console.log("error with query");
    }
    else{
         res.render("HomePageUtente",{Account:req.session.datiAccount,message:message});
        }

  });

});






  app.get("/effettua_prenotazione",function(req,res)
  { req.session.annuncioSelezionato=req.query.id;
    req.session.TipoCamera=req.query.camere;
    
    con.query("SELECT * FROM struttura WHERE ID_STRUTTURA = ?",[req.session.annuncioSelezionato],function(err,result)
    { 
      if(!!err)
      {
        console.log("error with query");
      }
     else{ 
          req.session.datiStruttura= result[0];
          
          var query_recensioni="SELECT recensione.descrizione,recensione.voto,recensione.data_recensione,account.Nome,account.Cognome,account.Foto_account  FROM (account JOIN recensione) WHERE (recensione.ref_id_account_recensione=account.ID_ACCOUNT AND recensione.ref_id_struttura_recensione=?)";
          con.query(query_recensioni,[req.session.annuncioSelezionato],function(err,result)
          {if(!!err)
            {
              console.log("error with query");
            }
            else{
            req.session.Recensioni=result;
           res.render("EffettuaPrenotazione",{Logged:req.session.Logged,Account: req.session.datiAccount,Struttura: req.session.datiStruttura,Recensione: req.session.Recensioni});
            }
         
        });
      }
    });
    
  });



app.get("/esci",function(req,res)
{ 
  req.session.destroy();
  res.redirect('/');
 
  

});




app.get('/form_struttura',function(req,res)
{
 res.render('RegistraStruttura',{Account: req.session.datiAccount});

});


app.post("/sub_struttura",upload.single('foto_s'),function(req,res)
{  message="La struttura è stato caricata correttamente"
   var file=req.file;
  
   req.file.path="uploads/"+ req.file.filename;
   
 
  //sezione dedicata al caricamento della foto

 
  if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif" || file.mimetype== "image/jpg"){
                                 
   
    
        var sqlStruttura="INSERT INTO `Struttura`(`ref_id_account`,`NomeStruttura`,`TipoStruttura`,`Località`,`Indirizzo`,`NSingole`,`PrezzoS`,`NDoppie`,`PrezzoD`,`NTriple`,`PrezzoT`,`NCamere`,`NPostiLetto`,`Prezzo`,`TassaSoggiorno`,`Descrizione`,`Posizione`,`Wifi`,`Parcheggio`,`AriaCondizionata`,`Piscina`,`Foto_struttura`,`Ultimo_Rendiconto`) VALUES ('"+req.session.ID_ACCOUNT+"','"+req.body.name+"','"+req.body.tipo+"','"+req.body.citta+"','"+req.body.indirizzo+"','"+req.body.singola+"','"+req.body.prezzo_s+"','"+req.body.doppia+"','"+req.body.prezzo_d+"','"+req.body.tripla+"','"+req.body.prezzo_t+"','"+req.body.camere+"','"+req.body.letto+"','"+req.body.prezzo+"','"+req.body.tassa_s+"','"+req.body.descrizione+"','"+req.body.posizione+"','"+req.body.wifi+"','"+req.body.parcheggio+"','"+req.body.ariaCondizionata+"','"+req.body.piscina+"','"+file.path+"',CURDATE())";
        con.query(sqlStruttura,function(err,result)
        {   
          if(!!err)
          {   
            console.log("error with query");
      
          }
          else {
            console.log("struttura inserita con successo");
            res.render('HomePageUtente',{Account:req.session.datiAccount,message:message});
             
            }
      
        });
    

  
} else {
  message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
  res.render('ModificaStruttura',{message: message}); //viene mostrato un messaggio
}


});



app.get("/mie_strutture",function(req,res)
{ 
  mieStrutture_query="SELECT * FROM struttura WHERE ref_id_account=?";
  con.query(mieStrutture_query,[req.session.datiAccount.ID_ACCOUNT],function(err,result)
  {
    if(!!err)
    {
      console.log("error with query");
    }
    else{
    req.session.Mie_Strutture=result;
    res.render("LeMieStrutture",{Account:req.session.datiAccount,MieStrutture:req.session.Mie_Strutture});
    }

  });

});

app.get("/dettagli_struttura",function(req,res)
{ req.session.gestioneStruttura=req.query.id;
  
  QUERY="SELECT * FROM struttura WHERE ID_STRUTTURA=?";
  con.query(QUERY,[req.session.gestioneStruttura],function(err,result)
  {
   if(!!err)
   {
     console.log("error with query");
   }
   else{
         req.session.Struttura=result[0];
         res.render("GestioneStruttura",{Account: req.session.datiAccount,Struttura:req.session.Struttura,message:0});
       }

  });
  
  


});


function printTodayDate()
{var mese;
  today=new Date();
  if((today.getMonth()+1)<10)
  {
        mese="0"+(today.getMonth()+1)
  }
  else {mese =today.getMonth()+1;}

  return today.getFullYear()+"-"+mese+"-"+today.getDate();

}


app.get("/rendiconto",function(req,res)
{
  
con.query("SELECT Ultimo_Rendiconto,TassaSoggiorno FROM struttura WHERE ID_STRUTTURA=?",[req.session.gestioneStruttura],function(err,result)
{
  if(!!err)
  {
    console.log("error with query")

  }
  else{
    
    var  ultimoRendiconto=result[0].Ultimo_Rendiconto;
    var seconds=Date.parse(ultimoRendiconto);
    var seconds2=seconds+7776000000;
    var mesex= new Date(seconds2);
    req.session.nuovoRendiconto=mesex;

    //se la data è minore della data di oggi allora non posso effettuare il rendiconto
    var oggi=printTodayDate();
    var y=Date.parse(oggi);
    var n = new Date(y);

    console.log(n-mesex);
    
   
    
    if(n<mesex)
    {   let giorni_rimanenti=(mesex-n)/86400000;
        
      message="Il rendiconto inerente alla struttura può essere effettuato ogni 3 mesi, prossimo rendiconto disponibile tra  "+giorni_rimanenti+" giorni";
        
      res.render("GestioneStruttura",{Account:req.session.datiAccount,Struttura: req.session.Struttura,message:message});
    }
    else{
  
    query="SELECT * FROM  prenotazione WHERE (Datain >= ? AND Dataout <= ? AND ref_id_struttura= ? AND `check`=4)";
   
    con.query(query,[ultimoRendiconto,mesex,req.session.gestioneStruttura],function(err,result2)
    {
      var Tassa=0;
      var Credenziali=[];
      
      for(var i=0;i<result2.length;i++)
      {  var  obj =[];
        var obj2 =[];
        Tassa=Tassa+((result2[i].NumeroClienti - result2[i].EsenteTassa )*result[0].TassaSoggiorno);
        
         obj= result2[i].CredenzialiOspiti;
        
         obj2= JSON.parse(obj);
    
        for(var j=0;j<obj2.length;j++)  
        {
     var object =  
       {
         NomeOspite : obj2[j].NomeOspite,
       CognomeOspite : obj2[j].CognomeOspite,
       DataNascita : obj2[j].DataNascita,
       PermanenzaIn: result2[i].Datain,
       PermanenzaOut: result2[i].Dataout
       };
       Credenziali.push(object);
      }
 


    }
   

   
    res.render("Rendiconto",{Account:req.session.datiAccount,DatiOspiti:Credenziali,Tot:Tassa});
  });
}
}
});
});

app.get("/invia_rendiconto",function(req,res)
{
  query="UPDATE struttura SET Ultimo_Rendiconto =? WHERE ID_STRUTTURA=?";
  con.query(query,[req.session.nuovoRendiconto,req.session.gestioneStruttura],function(err,result)
  { message="Rendiconto effettuato correttamente";
    res.render("HomePageUtente",{Account:req.session.datiAccount,message:message});
  });
});






app.get("/bilancio",function(req,res)
{
  res.render("Bilancio",{Account:req.session.datiAccount,Prenotazioni:0,Tot:0});
});

app.get("/modificaStruttura",function(req,res)
{
      res.render("ModificaStruttura",{Account: req.session.datiAccount,Struttura:req.session.Struttura,message:0});
});

app.get("/accettazione",function(req,res)
{   
  res.render("Accettazione",{Account:req.session.datiAccount,message:0});
});



app.post("/trovaCheck",function(req,res)
{   
      

 
  query="SELECT * FROM (prenotazione JOIN struttura) WHERE (ref_id_struttura=ID_STRUTTURA AND ID_PRENOTAZIONE=? AND (`check`=2 OR `check`=3) AND Datain<= CURDATE() AND Dataout>=CURDATE())"; //perche uguale 2?prenotazione accettata corrisponde a 2
 
 
   
  con.query(query,[req.body.idPrenotazione],function(err,result)
  {
    if(!!err)
    {
      console.log("error with query");
    }
    else
    {
      if(result.length>0)
      {
      res.render("Accettazione",{Account:req.session.datiAccount,CheckPrenotazione:result[0],message:0});
      }
      else
      {
        message ="Errore ID_PRENOTAZIONE non esistente oppure le date della  prenotazione non sono valide";
        res.render("Accettazione",{Account:req.session.datiAccount,message:message});
      }
    }

  });

});


app.post("/CheckIn_Prenotazione",function(req,res)
{    
var test=new RegExp("surname|name|birthdate");
var Elementi=new Array(req.query.nospiti*3);
var i=0;

for( x in req.body)
{  
  if(test.test(x))
  {
  Elementi[i]=req.body[x];
  i++;
  }
}

if(typeof(req.body.singola)=="undefined")
{
  req.body.singola="NULL";
}
if(typeof(req.body.doppia)=="undefined")
{
  req.body.doppia="NULL";
}
if(typeof(req.body.tripla)=="undefined")
{
  req.body.tripla="NULL";
}





  con.query("UPDATE prenotazione SET SingolaAssegnata=?,DoppiaAssegnata=?,TriplaAssegnata=?,Datain=CURRENT_TIMESTAMP,`check`=? WHERE ID_PRENOTAZIONE=?",[req.body.singola,req.body.doppia,req.body.tripla,3,req.query.id],function(err,result)
  {  if(!!err)
    {
      console.log("error with query2");

    }
    else{
    var Credenziali=[];
     for(var i=0;i<Elementi.length;i++)
     {    
    var object =  
      {
        NomeOspite : Elementi[i],
      CognomeOspite : Elementi[i+1],
      DataNascita : Elementi[i+2] //posso tentare
      };
     
      

i=i+2;
Credenziali.push(object);
     }

     myjson=JSON.stringify(Credenziali);
    
   


     con.query("UPDATE prenotazione SET CredenzialiOspiti = \'"+myjson+"\' WHERE ID_PRENOTAZIONE = ?",[req.query.id],function(err,result)
     {
       if(!!err)
       {
         console.log("error with query1")
       }
       else{
         message="Check-In completato con successo";
       res.render("Accettazione",{Account:req.session.datiAccount,message:message});
       }
  
     });

    }


  


      
  });

  


   

});



app.post("/CheckOut_Prenotazione",function(req,res)
{
  query="UPDATE prenotazione SET Dataout=CURRENT_TIMESTAMP,`check`= 4 WHERE ID_PRENOTAZIONE=?";
  con.query(query,[req.query.id],function(err,result)
  {
    message="Check-out effettuato con successo";
    res.render("Accettazione",{Account:req.session.datiAccount,message: message});

  });

});


app.post("/effettua_bilancio",function(req,res)
{ 
  data1="\'"+req.body.datain+"\'";
  data2="\'"+req.body.dataout+"\'";
  
query="SELECT * FROM prenotazione WHERE (ref_id_struttura=? AND `check`=4 AND Datain >= "+data1+" AND Dataout <= "+data2+" )";

  con.query(query,[req.session.gestioneStruttura],function(err,result)
  { var Tot=0;
    
    if(!!err)
    {
      console.log("error with query");
    }
else{
    for(i=0;i<result.length;i++)
    {
       Tot=Tot+result[i].Totale;
    }
    res.render("Bilancio",{Account: req.session.datiAccount,Prenotazioni: result,Tot: Tot});
  }
      
  }); 

});







function Uniform(a,b)
{  var A=0;
  var Uni=new Array(b);
  for(i=0;i<Uni.length;i++)
    {
      Uni[i]=0;
    }
  while(a>0)
  {   
    for(var i=0;i<b;i++)
    {   if(Uni[i]<3 && a>0 )
      {
        Uni[i]++;
        a--;
      }
    }
    if(Uni[b-1]==3 || a==0)
    {  
      break;
    }  
  }

  if( Uni[b-1]> 0 && a==0)
  {  
    return Uni;
  }
  else { 
   
    return A;}
}




function Full(a,b)
{var Ful=new Array(b);
  var A=0;
  if(a>=3)
  {
  for(i=0;i<Ful.length;i++)
    {
      Ful[i]=1;
    }
    a=a-b;
    var i=0;
  while(a>0)
  {
    
      while(Ful[i]<3 && a>0)
      {  Ful[i]++;
        a--;

      }
      i++
      if(Ful[b-1]==3 || a==0)
      {
        break;
      }
  }
  if(a==0)
  {  
    return Ful;
  }
  else {
   return A;

  }
   }
   else{
   return A;
   }
}

function ArrayCamere(A)
{    var M= new Array(3);
    if(A==0)
    {
      for(i=0;i<M.length;i++)
      {    
        M[i]=99;
      }
    }
    else{
  for(i=0;i<M.length;i++)
    {
      M[i]=0;
    }
   
   
    for(i=0;i<A.length;i++)
    {    
      M[A[i]-1]++;
    }
  }
   return M;
}
//dobbiamo implementare la ricerca nel database

app.post('/trova_annuncio',function(req,res)
{   var Uniformv= new Array(3);
    var Fullv =new Array(3);
    var PrenotazioneAusiliaria=[];
    var StruttureCoincidenti=[];
    
    var ListaStrutture=new Array(50);
    var ListaPrenotazioni=new Array(50);
    

 
  var luogo=req.body.city;
  var camere=parseInt(req.body.camere);
  var bambini=parseInt(req.body.bambini);
  var adulti=parseInt(req.body.adulti);
  
 
  Uniformv=ArrayCamere(Uniform(bambini+adulti,camere));
  Fullv=ArrayCamere(Full(bambini+adulti,camere));

  //prendiamo tutte le strutture di palermo
  
  con.query("SELECT * FROM  struttura WHERE Località =?",[luogo],function(err,result)
  {  ListaStrutture=result;
    
    
  
    //prendiamo tutte le prenotazioni accettate di strutture a palermo comprese tra le 2 date
    con.query("SELECT * FROM prenotazione JOIN struttura WHERE prenotazione.ref_id_struttura=struttura.ID_STRUTTURA AND struttura.Località=? AND ((Datain <= ? AND Dataout >= ?) OR (Datain >= ? AND Dataout <= ?) OR (Datain <= ? AND Dataout >= ?) OR (Datain <= ? AND Dataout >= ? )) AND (`check`=0 OR `check`=2)",[luogo,req.body.datain,req.body.dataout,req.body.datain,req.body.dataout,req.body.datain,req.body.datain,req.body.dataout,req.body.dataout],function(err,result)
    { ListaPrenotazioni=result;

     
      for(i=0;i<ListaStrutture.length;i++)
      { 
    var trovato=0;

        for(j=0;j<ListaPrenotazioni.length;j++)
        {
          if(ListaPrenotazioni[j].ref_id_struttura==ListaStrutture[i].ID_STRUTTURA)
          { 
            PrenotazioneAusiliaria.push(ListaPrenotazioni[j]);
            
            
          

          }
         
        
        }

          if(PrenotazioneAusiliaria.length==0)
          {   
            if(ListaStrutture[i].TipoStruttura==0)
            {
            
            if((ListaStrutture[i].NSingole >= Uniformv[0] && ListaStrutture[i].NDoppie >= Uniformv[1] && ListaStrutture[i].NTriple >= Uniformv[2]) && (ListaStrutture[i].NSingole >=Fullv[0] && ListaStrutture[i].NDoppie >= Fullv[1] && ListaStrutture[i].NTriple >= Fullv[2]))
            {
              trovato=3;
            }
            else if(ListaStrutture[i].NSingole >= Uniformv[0] && ListaStrutture[i].NDoppie >= Uniformv[1] && ListaStrutture[i].NTriple >= Uniformv[2])
            {

             trovato=1;
            }

            else if(ListaStrutture[i].NSingole >=Fullv[0] && ListaStrutture[i].NDoppie >= Fullv[1] && ListaStrutture[i].NTriple >= Fullv[2])
            {
              trovato=2;
            }
            
            else{
              trovato=0;
              break;
            }
            
          } 
          else if(ListaStrutture[i].TipoStruttura==1)
          {
              if(ListaStrutture[i].NCamere >= camere && ListaStrutture[i].NPostiLetto >= bambini+adulti)
              {
                  trovato=4;
              }
          }
        }
          else
          {
            if(ListaStrutture[i].TipoStruttura==0)
            {
            for(k=0;k<PrenotazioneAusiliaria.length;k++)
            {  var x1=0;
               var x2=0;
               var x3=0;
               y1=ListaStrutture[i].NSingole;
                y2=ListaStrutture[i].NDoppie;
                y3=ListaStrutture[i].NTriple;
               

              for(t=0;t<PrenotazioneAusiliaria.length;t++)
              {
                
                  if(PrenotazioneAusiliaria[k].Dataout >= PrenotazioneAusiliaria[t].Dataout)
                  {
                    
                      var x1=x1+PrenotazioneAusiliaria[t].Singola;
                      var x2=x2+PrenotazioneAusiliaria[t].Doppia;
                      var x3=x3+PrenotazioneAusiliaria[t].Tripla;

                    
                    
                  }
                }
               

                y1=y1-x1;
                y2=y2-x2;
                y3=y3-x3;
                if((y1 >= Uniformv[0] && y2 >= Uniformv[1] && y3 >= Uniformv[2]) && (trovato==3 || trovato==0) && (y1 >=Fullv[0] && y2 >= Fullv[1] && y3 >= Fullv[2]))
                {
                  trovato=3;
                }
                else if((y1 >= Uniformv[0] && y2 >= Uniformv[1] && y3 >= Uniformv[2]) && (trovato==3 || trovato==1 || trovato==0) || (y1 >=Fullv[0] && y2 >= Fullv[1] && y3 >= Fullv[2]))
                {

                 trovato=1;
                }

                else if( (trovato==3 || trovato==2 || trovato==0) && (y1 >=Fullv[0] && y2 >= Fullv[1] && y3 >= Fullv[2]))
                {
                  trovato=2;
                }
                
                else{
                  trovato=0;
                  break;
                }
                      
                  
              }
              
            
            }

            else if(Struttura[i].TipoStruttura==1 && Struttura[i].NCamere>= camere && Struttura[i].NPostiLetto>=(bambini+adulti))
            {//basta una sola prenotazione che coincide che io devo uscire
              for(k=0;k<PrenotazioneAusiliaria.length;k++)
              {
                for(t=0;t<PrenotazioneAusiliaria.length;t++)
                {
                  if(k!=t)
                  {
                    if((PrenotazioneAusiliaria[k].Datain <= PrenotazioneAusiliaria[t].Datain && PrenotazioneAusiliaria[k].Dataout >= PrenotazioneAusiliaria[t].Dataout )|| (PrenotazioneAusiliaria[k].Datain >= PrenotazioneAusiliaria[t].Datain && PrenotazioneAusiliaria[k].Dataout <= PrenotazioneAusiliaria[t].Dataout )|| (PrenotazioneAusiliaria[k].Datain <= PrenotazioneAusiliaria[t].Datain  && PrenotazioneAusiliaria[k].Dataout >= PrenotazioneAusiliaria[t].Datain)|| (PrenotazioneAusiliaria[k].Datain <= PrenotazioneAusiliaria[t].Dataout && PrenotazioneAusiliaria[k].Dataout >= PrenotazioneAusiliaria[t].Dataout ))
                    {
                      trovato=4;
                    }
                    else{
                      trovato=0;
                      break;
                    }

                  }

                }

              }

            }
          }
         
          if(trovato) //dobbiamo fare i vari casi con trovato ed apportare le varie modifiche
              {    ListaStrutture[i].ref_id_account=trovato;
                   StruttureCoincidenti.push(ListaStrutture[i]);
                   
                  
              }
              
              //devo svuotare l'array Prenotazione
             
                PrenotazioneAusiliaria=[];
             
              
          }
          req.session.adulti=adulti;
          req.session.bambini=bambini;
          req.session.datain=req.body.datain;
          req.session.dataout=req.body.dataout;
          req.session.Uniformv=Uniformv;
          req.session.Fullv=Fullv;
          
           if(req.session.Logged)
           {
            res.render("AnnuncioUtente",{Account: req.session.datiAccount,Annuncio:StruttureCoincidenti});
           }
           else{res.render("AnnuncioOspite",{Annuncio:StruttureCoincidenti});}
        


        
        });
      }); 
     
  
 });

  

app.get("/prenotazioni_effettuate",function(req,res)
{
  var sql="SELECT prenotazione.Totale,prenotazione.Numero,prenotazione.TipoPagamento,struttura.Località,struttura.Indirizzo,prenotazione.ref_id_struttura,struttura.Foto_struttura,struttura.NomeStruttura,prenotazione.Datain,prenotazione.ID_PRENOTAZIONE,prenotazione.NumeroClienti,prenotazione.Dataout,prenotazione.check  FROM (struttura JOIN prenotazione) WHERE (prenotazione.ref_id_account = ? AND prenotazione.ref_id_struttura=struttura.ID_STRUTTURA)"
    con.query(sql,[req.session.datiAccount.ID_ACCOUNT],function(err,result)
    {
      if(!!err)
      {
        console.log("error with query");
      }
      else{
      res.render("VisualizzaPrenotazioni",{Account:req.session.datiAccount,StrutturaPrenotata:result});
      }
    });
});


app.get("/prenotazioni_ricevute",function(req,res)
{
  
  var sql="SELECT account.Nome,account.Cognome,account.Foto_account,struttura.Foto_struttura,struttura.NomeStruttura,prenotazione.Datain,prenotazione.ID_PRENOTAZIONE,prenotazione.NumeroClienti,prenotazione.Dataout,prenotazione.check  FROM ((struttura JOIN prenotazione)JOIN account) WHERE (struttura.ref_id_account = ? AND prenotazione.ref_id_struttura=struttura.ID_STRUTTURA && prenotazione.check=0 AND prenotazione.ref_id_account=account.ID_ACCOUNT)"
    con.query(sql,[req.session.datiAccount.ID_ACCOUNT],function(err,result)
    {
      if(!!err)
      {
        console.log("error with query");
      }
      else{
        
      res.render("AccettaPrenotazione",{Account:req.session.datiAccount,StrutturaPrenotata:result});
      }
    });
});




app.get("/accetta_prenotazione",function(req,res)
{  var prenotazionex=req.query.id_prenotazione;
  message="Prenotazione accettata correttamente";
  
    con.query("UPDATE prenotazione SET prenotazione.check=2 WHERE ID_PRENOTAZIONE= ?",[prenotazionex],function(err,result){
    if(!!err)
    {
      console.log("error with query");
    }
    else{
         res.render("HomePageUtente",{Account:req.session.datiAccount,message:message});
        }
    });
  });

  app.get("/rifiuta_prenotazione",function(req,res){
    message="La richiesta di prenotazione è stata rifiutata"
    var prenotazionex=req.query.id_prenotazione;
    con.query("UPDATE prenotazione SET prenotazione.check=1 WHERE ID_PRENOTAZIONE= ?",[prenotazionex],function(err,result){
    if(!!err)
    {
      console.log("error with query");
    }
    else{
        res.render("HomePageUtente",{Account:req.session.datiAccount,message:message});
        }


    });
  

});

app.listen(3000,function(){
    console.log("Sever listening on port 3000");
});