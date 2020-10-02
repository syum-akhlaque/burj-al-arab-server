const express = require('express')
require('dotenv').config()


const dbName = 'burjAlArab';
// const dbUser = 'burjUser';
// const Pass = 'D3CzZQEOr5RNGhTc';
const collectionName = 'bookings';

const admin = require('firebase-admin');

const bodyParser =  require('body-parser');
const cors = require('cors')
const port = 5000;

const app = express();

app.use(cors());
app.use(bodyParser.json())


const serviceAccount = require("./configs/burj-al-arab-20-firebase-adminsdk-wg4fs-6028266e54.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://burj-al-arab-20.firebaseio.com"
});


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.plwup.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");
 
  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    // console.log(newBooking)

    bookings.insertOne(newBooking)
        .then(result => {
            // console.log(result)
            res.send(result.insertedCount > 0);
        })
    });

  app.get('/bookings', (req,res)=>{
      const bearer = req.headers.authorization;

      if (bearer && bearer.startsWith('Bearer ')){
        const idToken = bearer.split(' ')[1];
        // idToken comes from the client app
        admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
          let uid = decodedToken.uid;
          let tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if ( tokenEmail == queryEmail ){
            bookings.find({email: queryEmail})
            .toArray((err,documents)=>{
                res.send(documents);
            })
          }
          else {
            res.status(401).send('404 error , Unauthorised Requeset')
            };      
          // ...
        }).catch(function(error) {
          // Handle error
          res.status(401).send('404 error , Unauthorised Requeset')
        });
      }
      
    else {
      res.status(401).send('404 error , Unauthorised Requeset')
      }
    })

});


app.get('/', (req, res) => {
  res.send('Hello World! hello!!')
})

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})