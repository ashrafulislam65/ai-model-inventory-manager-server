const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://AIMDB:ULYqXbKUWy1kCGLO@cluster0.fcejyck.mongodb.net/?appName=Cluster0";
const app = express();
const port = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


app.get('/', (req, res) => {
    res.send('Ai inventory Model ');
})
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)

        await client.connect();
        const db = client.db("AIMDB");
        const modelsCollection = db.collection("models");
        //get specific model
        app.get('/models/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await modelsCollection.findOne(query);
            res.send(result);
        })
        //update model
        app.patch('/update-model/:id', async (req, res) => {
            const id = req.params.id;
            const updateModel = req.body;
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: updateModel
            }
            const result = await modelsCollection.updateOne(query, update);
            res.send(result);


        })
        //delete
        app.delete('/models/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await modelsCollection.deleteOne(query);
            res.send(result);
        })
        //get creator specific models
        app.get('/models', async (req, res) => {
            console.log(req.query);
            const createdBy = req.query.
                createdBy;
            const query = {};
            if (createdBy) {
                query.createdBy =

                    createdBy;
            }
            const projectFields = { image: 1, name: 1, framework: 1, description: 1,useCase:1,createdBy:1 }
            const cursor = modelsCollection.find(query).sort({ createdAt: -1 }).project(projectFields);
            const result = await cursor.toArray();
            res.send(result);
        })
        //get all models 
        app.get('/models', async (req, res) => {
           
            const projectFields = { image: 1, name: 1, framework: 1, description:0,useCase:1,createdBy:0 }
            const cursor = modelsCollection.find().sort({ createdAt: -1 }).limit(6).project(projectFields);
            const result = await cursor.toArray();
            res.send(result);
        })
        //insert operation
        app.post('/add-model', async (req, res) => {
            const newModel = req.body;
            const result = await modelsCollection.insertOne(newModel);
            res.send(result);
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);
app.listen(port, () => {
    console.log(`Ai Inventory Manager is running on port ${port}`);
})