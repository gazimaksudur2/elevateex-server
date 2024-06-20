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
        // const courseCollection = client.db('elevateExDB').collection('courseColl');
        const reviewCollection = client.db('elevateExDB').collection('reviews');
        const sponsorCollection = client.db('elevateExDB').collection('sponsors');
        const popularCollection = client.db('elevateExDB').collection('popular_courses');
        const classesCollection = client.db('elevateExDB').collection('allClasses');
        const enrolledCollection = client.db('elevateExDB').collection('enrolled');
        const insReqCollection = client.db('elevateExDB').collection('instructorReqs');
        const assignmentCollection = client.db('elevateExDB').collection('assignments');
        const assignmentSubmissionCollection = client.db('elevateExDB').collection('assignmentSubmission');

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

        app.patch('/users', async (req, res) => {
            const userData = req.body;
            // console.log(userData);
            const filter = req.query;
            // console.log(userData, filter);
            const updatedDoc = {
                $set:{
                    admin_status: userData.admin_status,
                    admin_req_msg: userData.admin_req_msg,
                }
            }
            const options = {
                upsert: true,
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
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

        app.post('/reviews', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await reviewCollection.insertOne(user);
            res.send(result);
        })

        app.get('/allclasses', async (req, res) => {
            const query = req.query;
            // console.log(query);
            let result;
            if (query) {
                if (query._id) {
                    // const _id = new ObjectId(query._id);
                    // console.log(_id);
                    const myQuery = { _id: new ObjectId(query._id) };
                    // console.log(myQuery);
                    result = await classesCollection.find(myQuery).toArray();
                } else {
                    // console.log(query)
                    result = await classesCollection.find(query).toArray();
                }
            } else {
                result = await classesCollection.find().toArray();
            }
            res.send(result);
        });

        app.post('/allclasses', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await classesCollection.insertOne(user);
            res.send(result);
        });

        app.post('/allclasses/approve', async(req, res)=>{
            const query = {_id: new ObjectId(req.body._id)};
            const updatedDoc = {
                $set:{
                    course_status: 'approved',
                }
            };
            const options = {upsert: true};
            // console.log(query, updatedDoc, options);
            const result = await classesCollection.updateOne(query, updatedDoc, options);
            res.send(result);
            // res.send("succedded");
        });
        app.post('/allclasses/cancel', async(req, res)=>{
            const query = {_id: new ObjectId(req.body._id)};
            const updatedDoc = {
                $set:{
                    course_status: 'cancelled',
                }
            };
            const options = {upsert: true};
            const result = await classesCollection.updateOne(query, updatedDoc, options);
            res.send(result);
            // res.send("succedded");
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
                    const myQuery = { student_id: query._id };
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
            for (let val of result) {
                // console.log(val);
                const course = await classesCollection.find({ _id: new ObjectId(val?.course_id) }).toArray();
                courses.push(course);
            }
            // console.log(courses)
            res.send(courses);
        });

        app.post('/instructors', async (req, res) => {
            const request = req.body;
            // console.log(request);
            const query = { email: req.body?.email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    instructor_status: 'pending',
                }
            }
            // const userInfo = await userCollection.find(query).toArray();
            const instructorInfo = {
                first_name: request.first_name,
                last_name: request.last_name,
                email: request.email,
                category: request.category,
                experience: request.experience,
                requestedAt: request.requestedAt,
                photoURL: request.photoURL,
                cur_role: request.role,
            }
            // console.log(userInfo[0].photoURL)
            const result2 = await userCollection.updateOne(query, updatedDoc, options);
            const result = await insReqCollection.insertOne(instructorInfo);
            res.send([result, result2]);
        });

        app.get('/instructors', async (req, res) => {
            const result = await insReqCollection.find().toArray();
            res.send(result);
        });

        app.post('/instructors/approve', async(req, res)=>{
            const query = req.body;
            const updatedDoc = {
                $set:{
                    instructor_status: 'approved',
                    role: 'instructor',
                }
            };
            const options = {upsert: true};
            const result = await userCollection.updateOne(query, updatedDoc, options);
            const result2 = await insReqCollection.deleteOne(query);
            res.send([result, result2]);
            // res.send("succedded");
        });
        app.post('/instructors/cancel', async(req, res)=>{
            const query = req.body;
            const updatedDoc = {
                $set:{
                    instructor_status: 'cancelled',
                }
            };
            const options = {upsert: true};
            const result = await userCollection.updateOne(query, updatedDoc, options);
            const result2 = await insReqCollection.deleteOne(query);
            res.send([result, result2]);
            // res.send("succedded");
        });

        app.post('/admin/approve', async(req, res)=>{
            const query = req.body;
            const updatedDoc = {
                $set:{
                    admin_status: 'approved',
                    role: 'admin',
                }
            };
            const options = {upsert: true};
            const result = await userCollection.updateOne(query, updatedDoc, options);
            // const result2 = await insReqCollection.deleteOne(query);
            res.send(result);
            // res.send("succedded");
        });
        app.post('/admin/cancel', async(req, res)=>{
            const query = req.body;
            const updatedDoc = {
                $set:{
                    admin_status: 'cancelled',
                }
            };
            const options = {upsert: true};
            const result = await userCollection.updateOne(query, updatedDoc, options);
            // const result2 = await insReqCollection.deleteOne(query);
            res.send(result);
            // res.send("succedded");
        });

        app.get('/assignments', async (req, res) => {
            const query = req.query;
            // console.log(query);
            let result;
            if (query) {
                result = await assignmentCollection.find(query).toArray();
            } else {
                result = await assignmentCollection.find().toArray();
            }
            res.send(result);
        });

        app.post('/assignments', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await assignmentCollection.insertOne(user);
            res.send(result);
        });

        app.get('/assignmentsub', async (req, res) => {
            const query = req.query;
            // console.log(query);
            let result;
            if (query) {
                result = await assignmentSubmissionCollection.find(query).toArray();
            } else {
                result = await assignmentSubmissionCollection.find().toArray();
            }
            res.send(result);
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

//vercel server is crashing hello hi