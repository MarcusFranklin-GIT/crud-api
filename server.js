require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
app.use(express.json());
const PORT = 3000;

// MongoDB connection
const uri = process.env.MONGO_URL;
const client = new MongoClient(uri);

async function connectToDB() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");

        const db= client.db('myDatabase');
        const collection = db.collection('myCollection');

    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
}
connectToDB();

// Data
const map = {
    1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
    6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten'
};

// Routes
app.get('/', (req, res) => res.send('Hello, Marcus!'));

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'today.html'));
});

app.get('/about', (req, res) => res.send('This is the about page.'));

app.get('/map', (req, res) => res.json(map));

app.get('/map/:id', (req, res) => {
    const word = map[req.params.id];
    res.json(word || "Invalid ID");
});

app.get('/query', (req, res) => {
    const val = req.query.val;
    for (let i = 1; i <= 10; i++) {
        if (map[i] === val) {
            return res.json({ status: true, id: i, value: map[i] });
        }
    }
    res.json({ status: false, id: null, value: null });
});
//users
app.get('/users', async (req, res) => {
    try {
        const db = client.db('myDatabase');
        const collection = db.collection('users');

        const users = await db.collection('yourCollectionName').find({}).toArray();
        res.status(200).json(users); // Send all user data
    } catch (err) {
        console.error("❌ Error fetching users:", err);
        res.status(500).send("Server error");
    }
});




 // Add this to parse JSON request bodies

app.post('/add_user', async (req, res) => {
    try {
        const user = req.body;

        // Validation
        if (!user || !user.name || !user.email) {
            return res.status(400).send('Invalid user data');
        }
        await client.connect();
        console.log("✅ Connected to MongoDB");

        const db = client.db('myDatabase');
        const collection = db.collection('users');

        // Await insertion
        const result = await collection.insertOne(user);
        console.log("✅ User inserted:", result.insertedId);

        res.status(201).send('User added successfully');
    } catch (err) {
        console.error("❌ Error in /add_user:", err);
        res.status(500).send('Server error');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
