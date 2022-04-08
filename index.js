const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kryx3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("worldTour");
    const spotsCollection = database.collection("spot");
    const orderCollection = database.collection("orders");

    app.get("/spots", async (req, res) => {
      const allSpot = await spotsCollection.find({}).toArray();
      res.send(allSpot);
    });

    app.get("/spot/:id", async (req, res) => {
      const spotID = req.params.id;
      const singleSpot = await spotsCollection
        .find({ _id: ObjectId(spotID) })
        .toArray();

      res.send(singleSpot[0]);
    });

    app.post("/newSpot", async (req, res) => {
      const newSpotData = await req.body;
      await spotsCollection.insertOne(newSpotData);

      res.send(newSpotData);
    });

    app.post("/placeOrder", async (req, res) => {
      const orderData = await req.body;
      await orderCollection.insertOne(orderData);

      res.json("Order has been placed");
    });

    app.get("/manageAllOrders", async (req, res) => {
      const allUserOrders = await orderCollection.find({}).toArray();

      res.send(allUserOrders);
    });

    app.post("/deleteOrder", async (req, res) => {
      const userID = await req.body.UserId;
      await orderCollection.deleteOne({ _id: ObjectId(userID) });

      res.json("Deleted!");
    });

    app.post("/singleUserOrders", async (req, res) => {
      const userEmail = await req.body.userEmail;
      const singleUserBooking = await orderCollection
        .find({ userEmail: userEmail })
        .toArray();

      res.json(singleUserBooking);
    });

    app.post("/updateStatus", async (req, res) => {
      const status = await req.body.status;
      const id = await req.body.id;

      const filter = { _id: ObjectId(id) };
      await orderCollection.updateOne(filter, { $set: { status: status } });

      res.json("updated");
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
