const shortid = require('shortid');
const URL = require('../models/url');

async function handleGenerateNewShortURL(req, res) {
    const body = req.body;
    
    if (!body.url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const shortID = shortid.generate();

    await URL.create({
        shortId: shortID,
        redirectURL: body.url,
        visitHistory: []
    });

    
    const allurls = await URL.find({});


    return res.render('home', {
        id: shortID,
        urls: allurls,
        host: req.headers.host,
    });
}

async function handleGetAnalytics(req, res) {
    const shortId = req.params.shortId;
    const result = await URL.findOne({ shortId });

    if (!result) {
        return res.status(404).json({ error: 'Short URL not found' });
    }

    return res.json({
        totalClicks: result.visitHistory.length,
        analytics: result.visitHistory,
    });
}

module.exports = {
    handleGenerateNewShortURL, 
    handleGetAnalytics,        
};
