const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    const songsPath = path.join(process.cwd(), 'songs'); // ← public/songs folder

    fs.readdir(songsPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read songs folder' });
        }

        const folders = files
            .filter(file => file.isDirectory())
            .map(dir => dir.name);

        res.status(200).json(folders);
    });
}
