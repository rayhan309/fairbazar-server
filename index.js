const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 4800;

// mdwr
app.use(cors());
app.use(express.json());

const uri = process.env.DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const fairbazar = client.db("fairbazar");
    const kids = fairbazar.collection("kids");
    const users = fairbazar.collection("users");
    const addedCart = fairbazar.collection("addedCart");

    // const uri = "mongodb+srv://sadia:az2ysmsQhETBpTME@cluster0.sr4duj3.mongodb.net/?appName=Cluster0";
    // const uri = "mongodb+srv://fairbazar:TliIjcf3sWguLBEx@cluster0.sr4duj3.mongodb.net/?appName=Cluster0";
    // const uri = "mongodb+srv://fairebazar:lP5WdsPcCv7gR0gZ@cluster0.ko5whro.mongodb.net/?appName=Cluster0";

    // console.log("✅ MongoDB connected successfully!");

    app.post("/user", async (req, res) => {
      try {
        const newUser = req.body;
        newUser.addTime = new Date();
        const result = await users.insertOne(newUser);
        res.send(result);
      } catch (error) {
        // console.error(error);
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.get("/users", async (req, res) => {
      try {
        const result = await users.find().toArray();
        res.send(result);
      } catch (error) {
        // console.error(error);
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.get("/user", async (req, res) => {
      try {
        const email = req.query.email;
        const query = { email: email };
        const result = await users.findOne(query);
        // console.log(result);
        res.send(result);
      } catch (error) {
        // console.error(error);
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.post("/kids", async (req, res) => {
      try {
        const newKids = req.body;
        newKids.addTime = new Date();
        const result = await kids.insertOne(newKids);
        // console.log(result);
        res.send(result);
      } catch (error) {
        // console.error(error);
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.get("/kids", async (req, res) => {
      try {
        const { category } = req.query;
        const query = {};

        if (category) {
          query.category = category;
        }

        const result = await kids.find(query).toArray();
        // console.log(result);
        res.send(result);
      } catch (error) {
        // console.error(error);
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.get("/kids/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await kids.findOne(query);
        // console.log(result);
        res.send(result);
      } catch (error) {
        // console.log(error);
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.post("/addCart", async (req, res) => {
      try {
        const newAddCart = req.body;
        newAddCart.addTime = new Date();
        const result = await addedCart.insertOne(newAddCart);
        // console.log(result);
        res.send(result);
      } catch {
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.get("/addCart", async (req, res) => {
      try {
        const result = await addedCart.find().toArray();
        res.send(result);
      } catch {
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.get("/addCart", async (req, res) => {
      try {
        const email = req.query.email;
        const query = {email: email};
        const result = await addedCart.findOne(query);
        res.send(result);
      } catch {
        res.status(500).send({ message: "internal server error!" });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
