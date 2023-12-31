const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

console.log(process.env.TMP_USER) 

const uri = `mongodb+srv://${process.env.TMP_USER}:${process.env.TMP_PASS}@cluster0.ij7qzua.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();  

    const carCollection = client.db('CarSite').collection('cars');   
    const addedCollection = client.db('CarSite').collection('added');   

    // app.get('/cars', async(req, res) => {

    //   const searchText = req.query?.carName 
    //   const result = await carCollection.find({'carName': {$regex: new 
    //   RegExp(searchText, 'i') }}).limit(20).toArray() 
    //   res.send(result)
    //   })
     

    app.get('/cars', async(req, res) => {
      const cursor = carCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/cars/:id', async(req, res) => {
      const id = req.params.id;
      const query ={_id: new ObjectId(id)};
      const result = await carCollection.findOne(query);
      res.send(result)
    })


    app.get('/cars/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}

      const options ={
        projection: {name: 1, price: 1, seller_name: 1, quantity: 1, rating: 1, category: 1, subPicture: 1  }
      };

      const result= await carCollection.findOne(query, options)
      res.send(result)
    })

    // add a car 

    app.get('/addCar', async(req, res) => {
      console.log(req.query.email)
      let query = {}

      const result = await addedCollection.find(query).toArray();
      res.send(result)
    })
    

    app.post('/addCar', async(req, res) => {
      const newCar = req.body;
      console.log(newCar)
      const result = await addedCollection.insertOne(newCar)
      res.send(result)
    });

    app.put('/addCar/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updateCar = req.body;
      const car = {
        $set:{
          photoUrl: updateCar.photoUrl, 
          productName: updateCar.productName, 
          sellerName: updateCar.sellerName, 
          email: updateCar.email, 
          subCategory: updateCar.subCategory, 
          price: updateCar.price, 
          rating: updateCar.rating, 
          availableQuantity: updateCar.availableQuantity
        }
      }
      const result = await carCollection.updateOne(filter, car, options);
      res.send(result);
    })

    app.delete('/addCar/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await addedCollection.deleteOne(query)
      res.send(result)
    })
    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) =>{
    res.send('toy marketplace is running')
})

app.listen(port, () =>{
    console.log(`toy marketplace is running on port ${port}`);
})