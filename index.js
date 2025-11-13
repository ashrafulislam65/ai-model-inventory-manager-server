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
        const purchasedCollection = db.collection("purchased");
        const usersCollection = db.collection("users");
        //user api
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'User already exists' });
            }
            else {

                const result = await usersCollection.insertOne(newUser);
                res.send(result);
            }

        });
        ///create purchase api
        app.post('/purchased', async (req, res) => {
            const purchase = req.body;
            const result = await purchasedCollection.insertOne(purchase);
            res.send(result);
        });
        //get purchased models
        app.get('/purchased', async (req, res) => {
            const purchasedBy = req.query.purchasedBy;
            const query = {};
            if (purchasedBy) {
                query.purchasedBy = purchasedBy;
            }
            const cursor = purchasedCollection.find(query).sort({ purchasedAt: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });
        //get models by purchase 
        app.get('/models/purchased/:modelId', async (req, res) => {
            const modelId = req.params.modelId;
            const query = {
                modelId: modelId
            }
            const cursor = purchasedCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        // Increment the purchase count of a model
        app.patch('/models/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $inc: { purchased: 1 }
            };

            const result = await modelsCollection.updateOne(filter, updateDoc);
            if (result.modifiedCount > 0) {
                res.send({ success: true });
            } else {
                res.send({ success: false });
            }
        });


        //get specific model
        app.get('/models/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await modelsCollection.findOne(query);
            res.send(result);
        })
        //update model
        app.patch('/update-model/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const updateModel = req.body;

                // Check if ObjectId is valid
                if (!ObjectId.isValid(id)) {
                    return res.status(400).send({
                        success: false,
                        message: "Invalid model ID format"
                    });
                }

                const query = { _id: new ObjectId(id) };
                const update = {
                    $set: updateModel
                };

                const result = await modelsCollection.updateOne(query, update);

                // Check if document was found and updated
                if (result.matchedCount === 0) {
                    return res.status(404).send({
                        success: false,
                        message: "Model not found"
                    });
                }

                if (result.modifiedCount > 0) {
                    res.send({
                        success: true,
                        message: "Model updated successfully",
                        modifiedCount: result.modifiedCount
                    });
                } else {
                    res.send({
                        success: true,
                        message: "No changes detected",
                        modifiedCount: result.modifiedCount
                    });
                }

            } catch (error) {
                console.error("Error updating model:", error);
                res.status(500).send({
                    success: false,
                    message: "Internal server error"
                });
            }
        });
        //delete
        app.delete('/models/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await modelsCollection.deleteOne(query);
            res.send(result);
        })
        //get creator specific models
        //get creator specific models
        app.get('/my-models', async (req, res) => {
            try {
                const creatorEmail = req.query.creatorEmail;

                if (!creatorEmail) {
                    return res.status(400).send({
                        success: false,
                        message: "Creator email is required"
                    });
                }

                console.log(`🔍 Fetching models for creator: ${creatorEmail}`);

                const query = { createdBy: creatorEmail };
                const cursor = modelsCollection.find(query).sort({ createdAt: -1 });
                const result = await cursor.toArray();

                console.log(`✅ Found ${result.length} models for ${creatorEmail}`);
                res.send(result);

            } catch (error) {
                console.error('❌ Error in /my-models endpoint:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: error.message
                });
            }
        });
        // আপনার server.js এ এই endpoint গুলো যোগ করুন

        // Search models by name (case-insensitive)
        app.get('/models/search', async (req, res) => {
            try {
                const searchTerm = req.query.q;

                if (!searchTerm) {
                    return res.status(400).json({
                        success: false,
                        message: 'Search term is required'
                    });
                }

                const query = {
                    name: {
                        $regex: searchTerm,
                        $options: 'i'
                    }
                };

                const cursor = modelsCollection.find(query).sort({ createdAt: -1 });
                const result = await cursor.toArray();

                res.send(result);

            } catch (error) {
                console.error('Error in search endpoint:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: error.message
                });
            }
        });

        // Filter models by framework
        app.get('/models/filter', async (req, res) => {
            try {
                const framework = req.query.framework;

                const query = {};
                if (framework && framework !== 'all') {
                    query.framework = framework;
                }

                const cursor = modelsCollection.find(query).sort({ createdAt: -1 });
                const result = await cursor.toArray();

                res.send(result);

            } catch (error) {
                console.error('Error in filter endpoint:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: error.message
                });
            }
        });

        // Combined search and filter
        app.get('/models/combined', async (req, res) => {
            try {
                const { search, framework } = req.query;

                const query = {};

                // Add search filter
                if (search && search.trim() !== '') {
                    query.name = {
                        $regex: search,
                        $options: 'i'
                    };
                }

                // Add framework filter
                if (framework && framework !== 'all') {
                    query.framework = framework;
                }

                const cursor = modelsCollection.find(query).sort({ createdAt: -1 });
                const result = await cursor.toArray();

                res.send(result);

            } catch (error) {
                console.error('Error in combined endpoint:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: error.message
                });
            }
        });

        //get featured models
        app.get('/featured-models', async (req, res) => {


            const cursor = modelsCollection.find().sort({ createdAt: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })
        //get all models 
        app.get('/models', async (req, res) => {
            try {
                console.log('🔍 Fetching all models...');

                // Include all fields that frontend needs
                const projectFields = {
                    image: 1,
                    name: 1,
                    framework: 1,
                    description: 1,  // ✅ Include this
                    useCase: 1,
                    createdBy: 1,    // ✅ Include this
                    createdAt: 1,
                    purchased: 1
                };

                const cursor = modelsCollection.find().sort({ createdAt: -1 }).project(projectFields);
                const result = await cursor.toArray();

                console.log(`✅ Found ${result.length} models`);
                res.send(result);

            } catch (error) {
                console.error('❌ Error in /models endpoint:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    error: error.message
                });
            }
        });
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