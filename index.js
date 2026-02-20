const express = require("express");
const nodemailer = require("nodemailer");
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
    const discount = fairbazar.collection("discount");
    const feature = fairbazar.collection("feature");
    const banner = fairbazar.collection("banner");
    const contact = fairbazar.collection("contact");

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

    // configaretion of send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    // console.log({email: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS})
    // ২. Api of aprove and send email
    app.patch("/contact/approve/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const { email, name, message } = req.body; // ফ্রন্টএন্ড থেকে পাঠানো মেসেজ

        // ১. ডাটাবেজে স্ট্যাটাস আপডেট
        const filter = { _id: new ObjectId(id) };
        const updateDoc = { $set: { status: "Done" } };
        await contact.updateOne(filter, updateDoc);

        // ২. ইমেইল পাঠানোর কনফিগারেশন
        const mailOptions = {
          from: `"Fair Bazar Support" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Response to your inquiry - Fair Bazar",
          html: `
    <div style="background-color: #f4f4f4; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
      <div style="background-color: #f97316; padding: 25px; text-align: center;">
          <a href="https://fairbazar.vercel.app/" target="_blank" style="text-decoration: none;">
            <img 
              src="https://i.ibb.co.com/QvDv4ZZS/logo2.png" 
              alt="Fair Bazar" 
              style="max-width: 150px; height: auto; display: block; margin: 0 auto;"
            />
            <h1 style="color: #ffffff; margin-top: 10px; margin-bottom: 0; font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">
              Fair Bazar
            </h1>
          </a>
        </div>

        <div style="padding: 40px; color: #333333; line-height: 1.6;">
          <h2 style="color: #1a1a1a; margin-top: 0;">Hello ${name},</h2>
          <p style="font-size: 16px; color: #555555;">
            Thank you for reaching out to us. Our support team has carefully reviewed your question, and we have an update for you.
          </p>
          
          <div style="background-color: #fffaf0; border-left: 5px solid #f97316; padding: 25px; margin: 30px 0; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #f97316; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">
              Message from Admin:
            </p>
            <div style="font-size: 16px; color: #2d3436; font-style: italic;">
              "${message}"
            </div>
          </div>

          <p style="font-size: 16px;">
            If you have any further questions or need more assistance, feel free to reply to this email or visit our website.
          </p>
          
          <a href="https://fairbazar.vercel.app/" style="display: inline-block; background-color: #f97316; color: #ffffff; padding: 14px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 20px;">
            Visit Fair Bazar
          </a>
        </div>

        <div style="background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
          <p style="font-size: 12px; color: #999999; margin: 0;">
            &copy; 2026 Fair Bazar Inc. All rights reserved. <br/>
            This is an automated notification. Please do not reply directly to this message.
          </p>
          <div style="margin-top: 10px;">
             <small style="color: #f97316; font-weight: bold;">Shop Smart. Shop Fair.</small>
          </div>
        </div>
      </div>
    </div>
    `,
        };

        // ৩. ইমেইল পাঠানো
        await transporter.sendMail(mailOptions);
        res.send({ success: true, message: "Approved and Email Sent!" });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to approve or send email" });
      }
    });

    app.post("/user", async (req, res) => {
      try {
        const newUser = req.body;
        newUser.addTime = new Date();

        const query = { email: newUser?.email };
        const isExgest = await users.findOne(query);
        // console.log(isExgest, 'isExgest')
        if (isExgest) return res.send({ message: "this user alrady ex" });

        const result = await users.insertOne(newUser);
        // console.log(result, 'userrs')
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
        const { category, limit = 0, page = 0, search = "" } = req.query;
        let skip = 0;
        if (page > 1) {
          skip = Number(limit) * Number(page - 1);
        }
        const query = {};
        if (search) {
          query.title = { $regex: search, $options: "i" }; // "i" মানে case-insensitive
        }

        if (category) {
          query.category = category;
        }

        const result = await kids
          .find(query)
          .sort({ addTime: -1 })
          .limit(Number(limit))
          .skip(Number(skip))
          .toArray();
        // console.log(result);

        res.send(result);
      } catch (error) {
        // console.error(error);
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.get("/kids/length", async (req, res) => {
      try {
        // ১. ডেসট্রাকচারিং এ search ব্যবহার করা হয়েছে
        const { search, category } = req.query;
        const query = {};

        // ২. চেক করতে হবে 'search' ভেরিয়েবলটি (searchText নয়)
        if (search) {
          // ৩. টাইটেল সার্চ করার জন্য regex ব্যবহার করা ভালো যাতে আংশিক মিল থাকলেও খুঁজে পায়
          query.title = { $regex: search, $options: "i" };
        }

        if (category) {
          query.category = category;
        }

        const kidsLength = await kids.countDocuments(query);

        // ৪. সংখ্যাটি একটি অবজেক্ট আকারে পাঠানো ভালো প্র্যাকটিস
        res.send(kidsLength);
      } catch (error) {
        console.error("Length Error:", error);
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
        const { search = "" } = req.query; // ক্লায়েন্ট থেকে আসা সার্চ টেক্সট

        // কুয়েরি অবজেক্ট তৈরি
        const query = {
          userEmail: email,
          kidsName: { $regex: search, $options: "i" }, // 'kidsName' ফিল্ডে সার্চ করবে
        };

        const result = await addedCart
          .find(query) // এখানে query পাস করতে হবে
          .sort({ addTime: -1 })
          .toArray();

        res.send(result);
      } catch (error) {
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

    app.post("/discount", async (req, res) => {
      try {
        const newDiscount = req.body;
        newDiscount.addTime = new Date();
        const result = await discount.insertOne(newDiscount);
        res.send(result);
      } catch {
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.get("/discount", async (req, res) => {
      try {
        const { limit = 0, page = 0, search = "" } = req.query;

        // console.log(query, 'query')

        let skip = 0;
        if (page > 1) {
          skip = Number(limit) * (Number(page) - 1);
        }

        const query = {};
        if (search) {
          query.title = { $regex: search, $options: "i" };
        }

        // ডাটা কুয়েরি (এখানে .find(query) দিতে ভুলবেন না)
        const result = await discount
          .find(query) // query অবজেক্টটি এখানে পাস করতে হবে
          .sort({ addTime: -1 })
          .limit(Number(limit))
          .skip(Number(skip))
          .toArray();

        // মোট প্রোডাক্ট সংখ্যা বের করা (সার্চ অনুযায়ী)
        const totalCount = await discount.countDocuments(query);

        // অবজেক্ট আকারে ডাটা পাঠানো
        res.send({ result, totalCount });
      } catch (error) {
        console.log(error);
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.get("/discount/:id", async (req, res) => {
      try {
        const { id } = req.params;

        // console.log(id, 'id')
        const query = { _id: new ObjectId(id) };
        const result = await discount.findOne(query);

        res.status(200).send(result);
      } catch {
        res.status(500).send({ message: "internal server erorr!" });
      }
    });

    app.post("/featured", async (req, res) => {
      try {
        const newDiscount = req.body;
        newDiscount.addTime = new Date();
        const result = await feature.insertOne(newDiscount);
        res.send(result);
      } catch {
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.get("/featured", async (req, res) => {
      try {
        const result = await feature.find().sort({ addTime: -1 }).toArray();
        res.send(result);
      } catch {
        res.status(500).send({ message: "internal server erorr!" });
      }
    });

    app.post("/banner", async (req, res) => {
      try {
        const newBanner = req.body;
        newBanner.addTime = new Date();
        const result = await banner.insertOne(newBanner);
        res.send(result);
      } catch {
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.get("/banner", async (req, res) => {
      try {
        const result = await banner.find().sort({ addTime: -1 }).toArray();
        res.send(result);
      } catch {
        res.status(500).send({ message: "internal server erorr!" });
      }
    });

    app.post("/contact", async (req, res) => {
      try {
        const newContact = req.body;
        newContact.sendTime = new Date();
        const result = await contact.insertOne(newContact);
        // console.log(result) insertedId
        res.send(result);
      } catch {
        res.status(500).send({ message: "internal server erorr!" });
      }
    });

    app.get("/contacts", async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 9;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const result = await contact
          .find({ status: "pending" })
          .sort({ sendTime: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();

        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "internal server error!" });
      }
    });

    app.post("/init", async (req, res) => {
      try {
        const { product_id, customer_email } = req.body;

        const productQuery = { _id: new ObjectId(product_id) };
        const customerQuery = { email: customer_email };
        const product = await kids.findOne(productQuery);
        const customer = await users.findOne(customerQuery);

        // console.log({product, customer});

        const tran_id = new ObjectId().toHexString();
        // console.log(tran_id);

        const data = {
          total_amount: product.price,
          currency: "BDT",
          tran_id: tran_id, // use unique tran_id for each api call
          success_url: `http://localhost:4800/success`,
          fail_url: `http://localhost:4800/fail`,
          cancel_url: `http://localhost:4800/cancel`,
          ipn_url: `http://localhost:4800/ipn`,
          shipping_method: "Courier",
          product_name: product.title,
          product_category: product.category,
          product_profile: "general",
          cus_name: customer.name,
          cus_email: customer.email,
          cus_add1: "Dhaka",
          cus_add2: "Dhaka",
          cus_city: "Dhaka",
          cus_state: "Dhaka",
          cus_postcode: "1000",
          cus_country: "Bangladesh",
          cus_phone: customer.phone,
          cus_fax: "01711111111",
          ship_name: customer.name,
          ship_add1: "Dhaka",
          ship_add2: "Dhaka",
          ship_city: "Dhaka",
          ship_state: "Dhaka",
          ship_postcode: 1000,
          ship_country: "Bangladesh",
        };
        // const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

        // const response = await sslcz.init(data);
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        console.log("SSL RAW RESPONSE:", sslcz);
        // sslcz.init(data).then((apiResponse) => {
        //   // Redirect the user to payment gateway
        //   // let GatewayPageURL = apiResponse.GatewayPageURL;
        //   // res.redirect(GatewayPageURL);
        //   console.log("Redirecting to: ", apiResponse);
        // });

        // if (!response.GatewayPageURL) {
        //   return res.status(400).json({
        //     error: "Gateway URL not received",
        //     ssl_response: response,
        //   });
        // }

        // sslcz.init(data).then((apiResponse) => {
        //   // Redirect the user to payment gateway
        //   let GatewayPageURL = apiResponse.GatewayPageURL;
        //   // res.redirect(GatewayPageURL);
        //   console.log("Redirecting to: ", GatewayPageURL);
        // }).catch(err => {
        //   console.log(err)
        // });

        res.send({ message: " success" });
      } catch {
        res.status(500).send({ message: "internal server error!" });
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
    }

    // dfhdf

    // ==========================
    // SUCCESS
    // ==========================
    app.post("/success", async (req, res) => {
      console.log("sjdfhsdjfskdjfhsd");
      try {
        const { val_id, tran_id } = req.query;

        console.log("PAYMENT SUCCESS:", tran_id, val_id);

        if (!val_id || !tran_id) {
          return res.redirect(`${process.env.CLIENT_URL}/payment-fail`);
        }

        const validation = await validatePayment(val_id);

        console.log(validation);

        if (validation.status === "VALID") {
          await orders.updateOne(
            { tran_id },
            { $set: { status: "PAID", paidAt: new Date() } },
          );

          return res.redirect(
            `${process.env.CLIENT_URL}/payment-success?tran_id=${tran_id}&val_id=${val_id}`,
          );
        }

        res.redirect(`${process.env.CLIENT_URL}/payment-fail`);
      } catch (err) {
        console.log("SUCCESS ERROR:", err);
        res.redirect(`${process.env.CLIENT_URL}/payment-fail`);
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

    // app.get("/orders", async (req, res) => {
    //   try {
    //     const result = await orders.find().toArray();
    //     res.send(result);
    //   } catch (err) {
    //     console.log(err);
    //     res.status(500).send({ message: "internal server error!" });
    //   }
    // });

    // cash on Delivery
    app.post("/order-cod", async (req, res) => {
      try {
        const { cradItemID, productId, userEmail, ...shippingInfo } = req.body;


        // console.log(cradItemID, 'cradItemID')
        // if(!cradItemID) return res.status(400).send({message: 'inter nal server error!'})

        // console.log(cradItemID, 'cradItemID')

        // const productQuery = {
        //   _id:new ObjectId(productId),
        // };
        // console.log(productId);
        let orderedProducts = await kids.findOne({
          _id: new ObjectId(productId),
        });

        if (!orderedProducts) {
          orderedProducts = await discount.findOne({
            _id: new ObjectId(productId),
          });
        }

        if (!orderedProducts) {
          orderedProducts = await feature.findOne({
            _id: new ObjectId(productId),
          });
        }

        // console.log(orderedProducts);

        const customerDetail = await users.findOne({ email: userEmail });

        const newOrder = {
          ...shippingInfo,
          orderedItems: { ...orderedProducts, status: "pending" },
          customer: {
            userId: customerDetail?._id,
            name: customerDetail?.name,
            email: customerDetail?.email,
          },
          payment_type: "COD",

          orderDate: new Date(),
        };

        const result = await orders.insertOne(newOrder);


        if (result?.insertedId) {
          if (cradItemID) {
            const deleteQuery = { _id: new ObjectId(cradItemID) }
            const res = await addedCart.deleteOne(deleteQuery);

            console.log({ res })
          } else {

            console.log({ result })
          }
        }

        // console.log(orderedProducts)
        // if (result.insertedId) {
        //   await addedCart.deleteMany({ userEmail: userEmail });
        // }

        res.send({
          success: true,
          message: "Order placed successfully and cart cleared!",
        });
      } catch (error) {
        console.error("COD Error :", error);
        res
          .status(500)
          .send({ success: false, message: "Internal server error!" });
      }
    });

    app.get("/orders-counts", async (req, res) => {
      try {
        const totalOrders = await orders.countDocuments();
        res.status(200).send(totalOrders);
      } catch (error) {
        res.status(500).send({
          message: "Internal server error",
          error: error.message,
        });
      }
    });

    app.get("/orders-amount", async (req, res) => {
      try {
        const total_amount = await orders
          .find({}, { projection: { "orderedItems.price": 1, _id: 0 } })
          .toArray();
        res.status(200).send(total_amount);
      } catch {
        res.status(500).send({ message: "internal server error" });
      }
    });

    app.get("/orders", async (req, res) => {
      try {
        const searchTerm = req.query.search;
        const statusFilter = req.query.status;

        let query = {};

        // স্ট্যাটাস ফিল্টার
        if (statusFilter && statusFilter !== "all") {
          query["orderedItems.status"] = statusFilter;
        }

        // সার্চ ফিল্টার (নাম বা ফোনের ওপর ভিত্তি করে)
        if (searchTerm) {
          query.$or = [
            { fullName: { $regex: searchTerm, $options: "i" } },
            { phone: { $regex: searchTerm, $options: "i" } },
            { "orderedItems.title": { $regex: searchTerm, $options: "i" } },
          ];
        }

        const result = await orders
          .find(query)
          .sort({ "customer.orderDate": -1 })
          .toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Internal server error!" });
      }
    });
    // My Orders Fetching API (Updated)
    app.get("/myOrders", async (req, res) => {
      try {
        const email = req.query.email;
        const searchTerm = req.query.search; // ফ্রন্টএন্ড থেকে আসা সার্চ টার্ম
        const statusFilter = req.query.status; // ফ্রন্টএন্ড থেকে আসা স্ট্যাটাস

        if (!email) {
          return res.status(400).send({ message: "Email is required!" });
        }

        // ১. বেসিক কুয়েরি: নির্দিষ্ট ইউজারের ইমেইল অনুযায়ী
        let query = { "customer.email": email };

        // ২. স্ট্যাটাস ফিল্টার যোগ করা (যদি 'all' না হয়)
        if (statusFilter && statusFilter !== "all") {
          query["orderedItems.status"] = statusFilter;
        }

        // ৩. ডাইনামিক সার্চ ফিল্টার (Product Title অনুযায়ী)
        if (searchTerm) {
          query["orderedItems.title"] = {
            $regex: searchTerm,
            $options: "i", // 'i' মানে Case-insensitive (বড়হাত/ছোটহাত অক্ষরে সমস্যা হবে না)
          };
        }

        // ডাটাবেস থেকে ডাটা আনা (লেটেস্ট অর্ডার আগে দেখাবে)
        const result = await orders
          .find(query)
          .sort({ orderDate: -1 })
          .toArray();

        // ফিল্টার করা ডাটার মোট সংখ্যা
        const ordersLength = await orders.countDocuments(query);

        res.status(200).send({ result, ordersLength });
      } catch (error) {
        console.error("Error fetching my orders:", error);
        res.status(500).send({ message: "Internal server error!" });
      }
    });

    app.patch("/orders/:id", async (req, res) => {
      try {
        const { status, productId } = req.body;
        const id = req.params.id;

        // const updatedQuery = {

        // }

        const result = await orders.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              "orderedItems.status": status,
            },
          }
        );

        // console.log({result})

        if (status == 'approved' && result?.modifiedCount && productId) {

          const productQuery = { _id: new ObjectId(productId) }
          console.log(productQuery)

          let productResult = await kids.updateOne(productQuery, { $inc: { stock: -1 } });
          console.log(productResult)

          if(!productResult) {
            productResult = await discount.findOne(productQuery, { $inc: { stock: -1 } });
            console.log({productResult}, 'productResult discount colllectio')
          }

          // const productResult_2 = productResult || ;

          // console.log({ productResult })

        }

        // console.log(result);



        res.send({ success: true, message: "order status update" });
      } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!",
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
