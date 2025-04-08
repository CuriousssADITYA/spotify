const fs = require("fs");
const path = require("path");

export default function handler(req, res) {
    const songsPath = path.join(process.cwd(), "songs"); // adjust as needed

    fs.readdir(songsPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            res.status(500).json({ error: "Failed to read songs folder" });
            return;
        }

        const folders = files
            .filter(f => f.isDirectory())
            .map(dir => dir.name);

        res.status(200).json(folders);
    });
}
