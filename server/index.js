const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { expressjwt: exjwt } = require('express-jwt');
const jwt_decode = require('jwt-decode');

const app = express();
app.use(cors());
app.use(express.json());

const secretkey = "abcd";
const algorithm = "HS256";

const jwtmw = exjwt({
    secret: secretkey,
    algorithms: [algorithm],
});

const client = new MongoClient('mongodb+srv://admin:admin@cluster0.3q5twfx.mongodb.net/?retryWrites=true&w=majority');
client.connect();
const db = client.db('counselling1');
const col = db.collection('register');

app.post('/register', (req, res) => {
    col.insertOne(req.body);
    console.log(req.body);
    res.send('Inserted successfully');
});

app.get('/retrieve', jwtmw, async (req, res) => {
    console.log(jwt_decode.jwtDecode(req.headers.authorization.substring(7)));
    const result = await col.find().toArray();
    res.send(result);
});

app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, role, email, password } = req.body;
    const result = col.updateOne({ _id: new ObjectId(id) }, { $set: { name, role, email, password } });
    res.send('updated');
});

app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "delete successfully" });
});

app.post('/Signin', async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email in the MongoDB collection
    const user = await col.findOne({ email });

    // Check if user exists and password matches
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email, name: user.name }, secretkey, { algorithm, expiresIn: '1m' });

    // Redirect to the about page after successful signin
    res.redirect('/about');
});

app.get('/', (req, res) => {
    res.send('<h1>Hello World</h1>');
});

app.get('/about', (req, res) => {
    res.send('<h1>This is about page</h1>');
});

app.listen('8080', () => {
    console.log('server is running');
});
