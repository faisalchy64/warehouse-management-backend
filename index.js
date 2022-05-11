const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@warehouse-management.uza0x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        await client.connect();

        const collection = client.db("fruitbase").collection("fruits");

        // get data from database
        app.get("/items", async (req, res) => {
            const query = {};
            const cursor = collection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // get specific data from database
        app.get("/item/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const result = await collection.findOne(query);

            res.send(result);
        });

        // update specific item data

        app.put("/item/:id", async (req, res) => {
            const id = req.params.id;
            const item = req.body;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updateItem = {
                $set: item,
            };

            const result = await collection.updateOne(
                filter,
                updateItem,
                option
            );

            res.send(result);
        });

        // delete a specific data from server

        app.delete("/item/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const result = await collection.deleteOne(query);

            res.send(result);
        });

        // data post to server

        app.post("/item", async (req, res) => {
            const item = req.body;
            console.log(item);

            const result = await collection.insertOne(item);
        });
    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});
