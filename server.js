const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to SQLite Database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error('Database error:', err.message);
    else console.log('Connected to local SQLite database.');
});

// API: Get All Posts
app.get('/api/posts', (req, res) => {
    db.all("SELECT * FROM posts ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// API: Get Posts by Category
app.get('/api/posts/category/:tag', (req, res) => {
    db.all("SELECT * FROM posts WHERE tag LIKE ? ORDER BY id DESC", [`%${req.params.tag}%`], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// API: Get Single Post
app.get('/api/posts/:id', (req, res) => {
    db.get("SELECT * FROM posts WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// API: Create a New Post
app.post('/api/posts', (req, res) => {
    const { tag, title, excerpt, author, authorImage, date_published, read_time, content } = req.body;
    db.run(
        `INSERT INTO posts (tag, title, excerpt, author, authorImage, date_published, read_time, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [tag, title, excerpt, author, authorImage, date_published, read_time, content],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

// API: Delete a Post
app.delete('/api/posts/:id', (req, res) => {
    db.run("DELETE FROM posts WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Deleted successfully" });
    });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));