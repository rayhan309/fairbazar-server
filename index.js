const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 4800;

// ssl commerz
const SSLCommerzPayment = require("sslcommerz-lts");
const store_id = process.env.SSL_STORE_ID;
const store_passwd = process.env.SSL_STORE_PASS;
const is_live = false; //true for live, false for sandbox

// mdwr
app.use(cors());
app.use(express.json());

// veryfy firebase token
// const verifyFirebaseToken = async (req, res, next) => {
//   // console.log(req.headers.authorization );
//   const firebaseToken = req.headers.authorization;
//   // console.log(firebaseToken);
//   if (!firebaseToken) {
//     return res.status(401).send({ message: "invalid accesss" });
//   }

//   try {
//     const token = firebaseToken.split(" ")[1];
//     const verify = await admin.auth().verifyIdToken(token);
//     req.current_user = verify.email;
//     // console.log("verify token", verify);
//   } catch {
//     // console.log("mumma khaisu2!");
//     return res.status(401).send({ message: "Unexpacted access" });
//   }

//   next();
// };

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
    const orders = fairbazar.collection("orders");

    // hr & emploey check
    // const verifyUser = async (req, res, next) => {
    //   const email = req.user_email;

    //   if (email) {
    //     const query = { email: email };
    //     const exp = await users.findOne(query);
    //     // console.log(query)
    //     if (exp.role === "user") {
    //       next();
    //     } else {
    //       res.status(403).send({ error: "Invalid access" });
    //     }
    //   }

    //   // next();
    // };

    // const verifyAdmin = async (req, res, next) => {
    //   const email = req.user_email;
    //   // console.log({emaillllll: email})

    //   if (email) {
    //     const query = { email: email };
    //     const result = await usersCollection.findOne(query);
    //     if (result.role === "admin") {
    //       next();
    //     } else {
    //       res.status(403).send({ error: "Invalid access" });
    //     }
    //   }
    // };

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
        const result = await addedCart.find(query).sort({addTime: -1}).toArray();
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
    // const tran_id = new ObjectId().toString();
    // console.log(tran_id);
    // ==========================
    // CREATE ORDER + INIT PAY
    // ==========================
    app.post("/create-order", async (req, res) => {
      try {
        // const db = await connectDB();
        // const orders = db.collection("orders");

        const { name, email, phone, amount } = req.body;
        const tran_id = new ObjectId().toString();

        // Save order as PENDING
        await orders.insertOne({
          tran_id,
          amount,
          currency: "BDT",
          status: "PENDING",
          customer: { name, email, phone },
          createdAt: new Date(),
        });

        const data = {
          total_amount: amount,
          currency: "BDT",
          tran_id,

          success_url: `${process.env.SERVER_URL}/success`,
          fail_url: `${process.env.SERVER_URL}/fail`,
          cancel_url: `${process.env.SERVER_URL}/cancel`,
          ipn_url: `${process.env.SERVER_URL}/ipn`,

          product_name: "Ecommerce Order",
          product_category: "General",
          product_profile: "general",

          cus_name: name,
          cus_email: email,
          cus_phone: phone,
          cus_add1: "Dhaka",
          cus_city: "Dhaka",
          cus_country: "Bangladesh",
        };

        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        const response = await sslcz.init(data);

        res.send({
          gatewayURL: response.GatewayPageURL,
          tran_id,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Payment init failed" });
      }
    });

    // ==========================
    // PAYMENT VALIDATION
    // ==========================
    async function validatePayment(val_id) {
      const url = is_live
        ? "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"
        : "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";

      const response = await axios.get(url, {
        params: {
          val_id,
          store_id,
          store_passwd,
          format: "json",
        },
      });

      return response.data;
    };

    // ==========================
    // SUCCESS
    // ==========================
    app.post("/success", async (req, res) => {
      try {
        const { val_id, tran_id } = req.body;

        const validation = await validatePayment(val_id);

        // const db = await connectDB();
        // const orders = db.collection("orders");

        if (validation.status === "VALID") {
          await orders.updateOne(
            { tran_id },
            { $set: { status: "PAID", paidAt: new Date() } },
          );
          return res.send("<h2>Payment Successful 🎉</h2>");
        }

        res.send("<h2>Payment Validation Failed</h2>");
      } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
      }
    });

    // ==========================
    // FAIL
    // ==========================
    app.post("/fail", async (req, res) => {
      const { tran_id } = req.body;
      // const db = await connectDB();

      await orders.updateOne({ tran_id }, { $set: { status: "FAILED" } });

      res.send("<h2>Payment Failed</h2>");
    });

    // ==========================
    // CANCEL
    // ==========================
    app.post("/cancel", async (req, res) => {
      const { tran_id } = req.body;
      // const db = await connectDB();

      await orders.updateOne({ tran_id }, { $set: { status: "CANCELLED" } });

      res.send("<h2>Payment Cancelled</h2>");
    });

    // ==========================
    // IPN
    // ==========================
    app.post("/ipn", async (req, res) => {
      try {
        const { val_id, tran_id } = req.body;

        const validation = await validatePayment(val_id);
        // const db = await connectDB();

        if (validation.status === "VALID") {
          await orders.updateOne(
            { tran_id },
            { $set: { status: "PAID", paidAt: new Date() } },
          );
        }

        res.status(200).send("IPN OK");
      } catch (err) {
        console.log(err);
        res.status(500).send("IPN Error");
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
  res.send("This server is new more squer!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
