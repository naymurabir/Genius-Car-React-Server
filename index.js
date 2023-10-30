const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())



// Database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cgjyfgp.mongodb.net/?retryWrites=true&w=majority`;

// const uri = "mongodb+srv://carDoctor:SNUmO4TEwunVGpoI@cluster0.cgjyfgp.mongodb.net/?retryWrites=true&w=majority";

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
        await client.connect();

        const servicesCollection = client.db('geniusCarDB').collection('services')

        const checkoutCollection = client.db('geniusCarDB').collection('checkouts')

        //JWT Related APIs
        app.post('/jwt', async (req, res) => {
            const user = req.body
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                // sameSite: 'none'
            }).send({ success: true })
        })

        //Server side APIs
        // Services
        //GET all data of services
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        // GET single data for services
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await servicesCollection.findOne(query)
            res.send(result)
        })

        // GET single data for checkout
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const options = {
                projection: { title: 1, price: 1, service_id: 1, img: 1 },
            };
            const result = await servicesCollection.findOne(query, options)
            res.send(result)
        })

        //POST services from client side
        app.post('/services', async (req, res) => {
            const newService = req.body
            const result = await servicesCollection.insertOne(newService)
            res.send(result)
        })

        //POST Checkouts from client side
        app.post('/checkout', async (req, res) => {
            const newCheckout = req.body
            const result = await checkoutCollection.insertOne(newCheckout)
            res.send(result)
        })

        // GET checkouts from server side
        app.get('/checkout', async (req, res) => {
            console.log(req.query.email);
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const cursor = checkoutCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        //PATCH Checkout from server side
        app.patch('/checkout/:id', async (req, res) => {
            const id = req.params.id
            const updatedCheckout = req.body
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    status: updatedCheckout.status
                },
            };
            const result = await checkoutCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        //DELETE Checkout from server side
        app.delete('/checkout/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await checkoutCollection.deleteOne(query)
            res.send(result)

        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("The Car Server is running...")
})

app.listen(port, () => {
    console.log(`The Server is running on port: ${port}`);
})