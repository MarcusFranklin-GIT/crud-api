const express= require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');


const app=express();

app.use(express.json());

let client;
let db;


//test program
let object={
    1:'marcus',
    2:'mohamed',
    3:'mohan',
    4:'raj',
    5:'hussain',
    6:'franklin'
};
app.get('/',(req,res)=>{
    res.send('Hello, Marcus!');
})
app.get('/admin',function(req,res){
    res.send('welcome admin');
})
app.get('/name/:id',function(req,res){
    const id=req.params.id;
    const name=object[id];
    if(name){
        res.send(`Hello, ${name}!`);
    }else{
        res.status(404).send('Name not found');
    }
})

app.listen(9000,()=>{
    console.log('running....');
})
//end of test program (local server)

//creating a connection with db
async function ConnectToMongo() {
    try{
        client=await MongoClient.connect(process.env.MONGO_URL)
        console.log("✅ Connected to MongoDB");
        db = client.db('myDatabase');
    }catch(err){
        console.error("❌ MongoDB connection error:", err);
    }
}
//calling the function to connect to MongoDB
ConnectToMongo();


//create
app.post('/add_user',async (req,res)=>{

    const user=req.body;
    try{

        const collection = db.collection('Users');

        const result = await collection.insertOne(user);
        res.status(200).send("User Added Successfully");
    }catch(err){
        console.error("❌ Error adding user:", err);
        res.status(500).send("Server error");
    }
});
//retrive all users
app.get('/users',async (req, res) => {
    try{
        const collection= db.collection('Users');
        const users = await collection.find({}).toArray();
        res.status(200).json(users);
    }catch(err) {
        console.error("❌ Error fetching users:", err);
        res.status(500).send("Server error");
    }
});
//retrive user by id or email
app.get('/users/:id', async (req, res) => {

    try{
        const id =parseInt(req.params.id);
        console.log("Fetching user with ID:", id);
        const collection = db.collection('Users');
        if(isNaN(id)) {
            const email = req.params.id;
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValidEmail = regex.test(email);
            console.log(isValidEmail);
            if(!isValidEmail) {
                return res.status(400).send("Invalid email format");
            }
            const user =await collection.findOne({ email: email });
            if(user){
                res.status(200).json(user);
            } else {
                res.status(404).send("User not found");
            }
            
        }
       else{ const user =await collection.findOne({ id: id });
        if(user){
            res.status(200).json(user);
        } else {
            res.status(404).send("User not found");
        }}
    }catch(err) {
        console.error("❌ Error fetching user:", err);
        res.status(500).send("Server error");
    }
});
// Update user by id or email

app.put('/update_user/:id', async (req, res) => {
    try{
        const id = req.params.id;
        const updatedUser = req.body;
        const collection = db.collection('Users');

        const result = await collection.updateOne({ email: id }, 
            { $set: updatedUser }

        );
        if(result.matchedCount > 0) {
            res.status(200).send("User updated successfully");
        } else {
            res.status(404).send("User not found");
        }
     } catch(err) {
        console.error("❌ Error updating user:", err);
        res.status(500).send("Server error");
    }
})

//delete user by id or email
app.delete('/delete_user/:id', async (req, res) => {
    try{
        const id =parseInt(req.params.id);
        console.log("Fetching user with ID:", id);
        const collection = db.collection('Users');
        if(isNaN(id)) {
            const email = req.params.id;
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValidEmail = regex.test(email);
            console.log(isValidEmail);
            if(!isValidEmail) {
                return res.status(400).send("Invalid email format");
            }
            const user =await collection.deleteOne({ email: email });
            if(user.deletedCount > 0){
                res.status(200).send("User deleted successfully");
            } else {
                res.status(404).send("User not found");
            }
            
        }
       else{ const user =await collection.deleteOne({ id: id });
        if(user.deletedCount > 0){
            res.status(200).send("User deleted successfully");
        } else {
            res.status(404).send("User not found");
        }}
    }catch(err) {
        console.error("❌ Error fetching user:", err);
        res.status(500).send("Server error");
    }
});
