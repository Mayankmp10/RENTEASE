import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://kartikdogra529:tLPJ7ijWyuOfCdke@project-rent.klxsd.mongodb.net/?retryWrites=true&w=majority&appName=project-rent', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch(err => console.error(err));

// Define Schema with Vector Search
const itemSchema = new mongoose.Schema({
    name: String,
    description: String,
    vector: {
        type: [Number],
        index: '2dsphere' // Enables vector search
    }
});

const Item = mongoose.model('Item', itemSchema);

// Add an item
app.post('/items', async (req, res) => {
    try {
        const { name, description, vector } = req.body;
        const newItem = new Item({ name, description, vector });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search items by vector
app.post('/search', async (req, res) => {
    try {
        const { vector } = req.body;
        const results = await Item.aggregate([
            {
                $vectorSearch: {
                    queryVector: vector,
                    path: 'vector',
                    numCandidates: 5
                }
            }
        ]);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
    res.send("Backend is running!");
});
app.listen(PORT, () => console.log('Server running on port ${PORT}'));
