const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Mongodb connection string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dv6wysz.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const coffeeCollection = client.db("coffeeDB").collection("coffee");

    app.get("/coffee", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get(`/coffee/:id`, async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const query = { _id: new ObjectId(id) };
      const coffee = await coffeeCollection.findOne(query);
      res.send(coffee);
    });

    app.post("/coffee", async (req, res) => {
      const newCoffee = req.body;
      console.log(newCoffee);
      const result = await coffeeCollection.insertOne(newCoffee);
      res.send(result);
    });

    app.put(`/update/:id`, async (req, res) => {
      const id = req.params.id;
      const coffee = req.body;
      console.log(id, coffee);

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCoffee = {
        $set: {
          name: coffee.name,
          chef: coffee.chef,
          supplier: coffee.supplier,
          taste: coffee.taste,
          category: coffee.category,
          details: coffee.details,
          photo: coffee.photo,
        },
      };
      const result = await coffeeCollection.updateOne(
        filter,
        updatedCoffee,
        options
      );console.log(result);
      res.send(result);
    });

    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("coffee");
});

app.listen(port, () => {
  console.log(`server port running ${port}`);
});
