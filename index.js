const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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


app.get('/',(req,res)=>{
    res.send('Ai inventory Model ');
})
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    
    await client.connect();
    const db = client.db("AIMDB");
    const modelsCollection = db.collection("models");
    app.get('/models',async(req,res)=>{
        const cursor = modelsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    //insert operation
    app.post('/add-model',async(req,res)=>{
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
app.listen(port,()=>{
    console.log(`Ai Inventory Manager is running on port ${port}`);
})