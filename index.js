const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173', 'https://elevateex-ac4de.web.app', 'http://localhost:5000'
    ]
}));

// app.use(cookieParser());


// const uri = "mongodb+srv://<username>:<password>@cluster0.oknyghy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// const uri = `mongodb+srv://${process.env.DBuser}:${process.env.DBpassword}@cluster0.oknyghy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const uri = `mongodb://localhost:27017`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const userCollection = client.db('elevateExDB').collection('usersCollection');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            // console.log(user);
            const token = jwt.sign(user, process.env.Security_Access_Token, { expiresIn: '1h' });
            res.send({ token });
        });

        const verifyToken = (req, res, next) => {
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'unauthorized access' });
            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.Security_Access_Token, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'unauthorized access' })
                }
                req.decoded = decoded;
                next();
            })
        }

        app.get('/', (req, res) => {
            res.send("ElevateEx is running on its way!!");
        })

        app.get('/users', async (req, res) => {
            const query = req.query;
            // console.log(query);
            let result;
            if (query) {
                result = await userCollection.find(query).toArray();
            } else {
                result = await userCollection.find().toArray();
            }
            res.send(result);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.get('/demo', (req, res) => {
            res.send("ElevateEx is running on demo!!");
        })
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`elevateEx is running on port: ${port}`);
});

//vercel server is crashing