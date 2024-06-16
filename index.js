const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
const uri = `mongodb+srv://${process.env.DBuser}:${process.env.DBpassword}@cluster0.oknyghy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = `mongodb://localhost:27017`;

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

        const userCollection = client.db('elevateExDB').collection('users');
        const courseCollection = client.db('elevateExDB').collection('courseColl');
        const reviewCollection = client.db('elevateExDB').collection('reviews');
        const sponsorCollection = client.db('elevateExDB').collection('sponsors');
        const popularCollection = client.db('elevateExDB').collection('popular_courses');
        const classesCollection = client.db('elevateExDB').collection('allClasses');
        const enrolledCollection = client.db('elevateExDB').collection('enrolled');
        // const userCollection = client.db('elevateExDB').collection('usersCollection');
        // const userCollection = client.db('elevateExDB').collection('usersCollection');

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
        });

        app.get('/sponsors', async (req, res) => {
            const query = req.query;
            // console.log(query);
            let result;
            if (query) {
                result = await sponsorCollection.find(query).toArray();
            } else {
                result = await sponsorCollection.find().toArray();
            }
            // console.log(result);
            res.send(result);
        });
        app.get('/courses', async (req, res) => {
            const query = req.query;
            // console.log(query);
            let result;
            if (query) {
                result = await courseCollection.find(query).toArray();
            } else {
                result = await courseCollection.find().toArray();
            }
            res.send(result);
        });
        app.get('/reviews', async (req, res) => {
            const query = req.query;
            // console.log(query);
            let result;
            if (query) {
                result = await reviewCollection.find(query).toArray();
            } else {
                result = await reviewCollection.find().toArray();
            }
            res.send(result);
        });
        app.get('/allclasses', async (req, res) => {
            const query = req.query;
            // console.log(query);
            let result;
            if (query) {
                if (query._id) {
                    // const _id = new ObjectId(query._id);
                    // console.log(_id);
                    const myQuery = {_id: new ObjectId(query._id)};
                    // console.log(myQuery);
                    result = await classesCollection.find(myQuery).toArray();
                } else {
                    result = await classesCollection.find(query).toArray();
                }
            } else {
                result = await classesCollection.find().toArray();
            }
            res.send(result);
        });
        app.get('/popular', async (req, res) => {
            const query = req.query;
            // console.log(query);
            let result;
            if (query) {
                result = await popularCollection.find(query).toArray();
            } else {
                result = await popularCollection.find().toArray();
            }
            res.send(result);
        });

        app.post('/enroll', async (req, res) => {
            const data = req.body;
            // console.log(data);
            const result = await enrolledCollection.insertOne(data);
            res.send(result);
        })
        app.get('/enroll', async (req, res) => {
            const query = req.query;
            // console.log(query);
            let result;
            if (query) {
                if (query._id) {
                    // const _id = new ObjectId(query._id);
                    // console.log(_id);
                    const myQuery = {student_id: query._id};
                    // console.log(myQuery);
                    result = await enrolledCollection.find(myQuery).toArray();
                } else {
                    result = await enrolledCollection.find(query).toArray();
                }
            } else {
                result = await enrolledCollection.find().toArray();
            }
            let courses = [];
            // await result.map((resu)=>{
            //     // console.log({_id: new ObjectId(resu?.course_id)});
            //     const func = async(id)=>{
            //         let course = await classesCollection.find({_id: new ObjectId(id)}).toArray();
            //         // console.log(course);
            //         await courses.push(course);
            //         // return course;
            //     }
            //     func(resu?.course_id);
            // })
            for(let val of result){
                // console.log(val);
                const course = await classesCollection.find({_id: new ObjectId(val?.course_id)}).toArray();
                courses.push(course);
            }
            // console.log(courses)
            res.send(courses);
        });
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