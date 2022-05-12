const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: "unauthorized access" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            res.status(403).send({ message: "forbidden access" });
        }

        req.decoded = decoded;
        next();
    });
}

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

        // get specific user data

        app.get("/myitems", verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;

            if (decodedEmail === email) {
                const query = { email };
                const cursor = collection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            }
        });

        // auth

        app.post("/login", async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: "1d",
            });

            res.send(accessToken);
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

        // delete a specific data from database

        app.delete("/item/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const result = await collection.deleteOne(query);

            res.send(result);
        });

        // data post to database

        app.post("/item", async (req, res) => {
            const item = req.body;

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
