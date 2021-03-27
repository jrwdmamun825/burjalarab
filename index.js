const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
require('dotenv').config();
// const port = 5000


// var admin = require("firebase-admin");

var serviceAccount = require("./configs/emajohn-shopping-firebase-adminsdk-ge3v7-54b4e9c5e2.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const app = express();
app.use(cors());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }))


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hsyzd.mongodb.net/BurjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("BurjAlArab").collection("booking");
    console.log('database connected successfully')
    app.post('/addBook', (req, res) => {
        const NewBooking = req.body
        bookings.insertOne(NewBooking)
            .then(result => {
                // console.log(result);
                // res.send(result)
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/addBook', (req, res) => {
        // console.log(req.query.email)
        console.log(req.headers.authorization)
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            console.log({ idToken });
            // idToken comes from the client app
            admin.auth().verifyIdToken(idToken)
                .then((decodedToken) => {
                    // const uid = decodedToken.uid;
                    // console.log({uid})
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    console.log(tokenEmail ,queryEmail)
                    if (tokenEmail == queryEmail) {
                        bookings.find({email: req.query.email})
                        .toArray((err, documents) =>{
                            res.status(200).send(documents)
                        })
                    }
                    else{
                        res.status(401).send('un-authorize access')
                    }
                })
                .catch((error) => {
                    // Handle error
                    res.status(401).send('un-authorize access')
                });
        }
        else{
            res.status(401).send('un-authorize access')
        }

        // bookings.find({email: req.query.email})
        // .toArray((err, documents) =>{
        //     res.send(documents)
        // })



    })



});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(5000)