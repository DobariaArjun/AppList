const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const shuffle = require('shuffle-array');
const fs = require('fs');
const multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/images')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
var upload = multer({storage: storage});
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://ArjunDobaria:Pravin143@mantratechnolog-bjxu8.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true});
client.connect((err, db) => {
    if (err) {
        console.log(err)
    } else {
        console.log("Connected to mongo db");
        const collection = client.db("MantraTechnolog").collection("app_data");
        app.listen(port, () => console.log(`Mantra Technolog is listening on port ${port}!`));

        app.use(express.static('public'));
        app.use(bodyParser.urlencoded({extended: true}));

        app.use(express.json());

        app.get('/', (req, res) => {
            res.sendFile(__dirname + '/public/index.html');
        });

        app.post('/view', upload.single('app_icon'), (req, res) => {
            if (req.file && req.body) {
                var myobj = {
                    app_name: req.body.app_name,
                    package_name: req.body.package_name,
                    icon_url: req.headers.host + "/uploads/images/" + req.file.originalname,
                    zone: req.body.gender1,
                    account_name: req.body.gender
                };

                console.log(myobj);

                collection.insertOne(myobj, function (err, res) {
                    if (err) throw err;
                    console.log("Inserted Successfully");
                });

                res.sendFile(__dirname + '/public/view.html');
            } else {
                res.send("Plase provide Data!")
            }
        });

        app.get('/viewData', (req, res) => {
            collection.find({}).toArray((err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    var arr1 = [];
                    for (var i in result) {
                        var arr = [result[i]['app_name'], result[i]['package_name'], result[i]['zone'], result[i]['account_name']];
                        arr1.push(arr)
                    }
                    res.json(result);
                }
            });
        })

        app.get('/view', (req, res) => {
            console.log(req.headers.host);
            res.sendFile(__dirname + '/public/view.html');
        })

        app.post('/getApp', (req, res) => {
            
            console.log(req.body);
            
            var zone = req.body.zone.toUpperCase()

            collection.find({zone: zone}).toArray(function (err, result) {
                if (err) {
                    res.send(err);
                } else {
                    var appArray = [];
                    for(var i = 0; i < result.length; i++)
                    {
                        if(result[i]["package_name"] === req.body.package_name)
                        {
                            result.splice(i,1);
                        }
                    }
                    shuffle(result);
                    appArray = result.slice(0,4);
                    res.json({status: true, data: appArray});
                }
            });
        })
    }
});

