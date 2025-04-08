const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// API route to return list of folders inside songs
app.get('/api/songs', (req, res) => {
    const songsPath = path.join(__dirname, 'songs');
    fs.readdir(songsPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read songs folder" });
        }

        const folders = files
            .filter(f => f.isDirectory())
            .map(dir => dir.name);

        res.json(folders);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
