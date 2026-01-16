const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 4800;

// ssl commerz
const SSLCommerzPayment = require('sslcommerz-lts');
const store_id = process.env.SSL_STORE_ID;
const store_passwd = process.env.SSL_STORE_PASS;
const is_live = false //true for live, false for sandbox

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
        const email = req.query.email;
        const query = { email: email };
        const result = await addedCart.find().toArray();
        res.send(result);
      } catch {
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.get("/addCart/:email", async (req, res) => {
      try {
        const { email } = req.params;
        const query = { userEmail: email };
        const result = await addedCart.find(query).toArray();
        res.send(result);
      } catch {
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.delete("/addCart/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const query = { _id: new ObjectId(id) };
        const result = await addedCart.deleteOne(query);
        res.send(result);
      } catch {
        res.status(500).send({ message: "internal server error!" });
      }
    });

    // payment apis
    //sslcommerz init
    const tran_id = new ObjectId().toString();
    // console.log(tran_id);
    app.get("/init", (req, res) => {
      const data = {
        total_amount: 100,
        currency: "BDT",
        tran_id: tran_id, // use unique tran_id for each api call
        success_url: "http://localhost:3030/success",
        fail_url: "http://localhost:3030/fail",
        cancel_url: "http://localhost:3030/cancel",
        ipn_url: "http://localhost:3030/ipn",
        shipping_method: "Courier",
        product_name: "Computer.",
        product_category: "Electronic",
        product_profile: "general",
        cus_name: "Customer Name",
        cus_email: "customer@example.com",
        cus_add1: "Dhaka",
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: "01711111111",
        cus_fax: "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse) => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL;
        res.redirect(GatewayPageURL);
        console.log("Redirecting to: ", GatewayPageURL);
      });
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
