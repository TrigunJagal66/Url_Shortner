const express = require('express');
const { connectToMongoDB } = require('./connect');
const path = require('path');
require('dotenv').config(); // Load environment variables

const staticRouter = require('./routes/staticrouter');
const urlRoute = require('./routes/url');
const app = express();
const URL = require('./models/url');

const PORT = process.env.PORT || 8001; // Use environment variable for PORT

// Use the MongoDB connection string from .env
const mongoDBUrl = process.env.MONGODB_URL 

connectToMongoDB(mongoDBUrl)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Error connecting to MongoDB:', err));

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', staticRouter);
app.use('/url', urlRoute);

app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    
    try {
        const entry = await URL.findOneAndUpdate(
            { shortId },
            {
                $push: {
                    visitHistory: {
                        timestamp: Date.now(),
                    }
                }
            },
            { new: true }
        );

        if (!entry) {
            return res.status(404).send('Short URL not found');
        }

        return res.redirect(entry.redirectURL);
    } catch (error) {
        console.error('Error fetching short URL:', error);
        return res.status(500).send('Internal server error');
    }
});

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
