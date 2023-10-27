const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

// Middleware
app.use(cors())
app.use(express.json())



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
                projection: { title: 1, price: 1, service_id: 1 },
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