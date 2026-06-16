const sqlite3 = require('sqlite3').verbose();

// Connect to your existing database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error('Database connection error:', err.message);
    else console.log('Connected to local SQLite database. Preparing to fetch real blogs...');
});

// We map your platform's categories to real DEV.to API tags
const categories = {
    'Artificial Intelligence': 'ai',
    'Software Engineering': 'software',
    'Computer Science': 'computerscience',
    'Technology Trends': 'tech'
};

// Reset the database table to make room for real developer blogs
db.serialize(() => {
    db.run("DROP TABLE IF EXISTS posts");
    db.run(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tag TEXT NOT NULL,
            title TEXT NOT NULL,
            excerpt TEXT NOT NULL,
            author TEXT NOT NULL,
            authorImage TEXT NOT NULL,
            date_published TEXT NOT NULL,
            read_time INTEGER NOT NULL,
            content TEXT NOT NULL
        )
    `);
});

async function fetchRealBlogs() {
    const stmt = db.prepare(`INSERT INTO posts (tag, title, excerpt, author, authorImage, date_published, read_time, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

    for (const [categoryName, apiTag] of Object.entries(categories)) {
        console.log(`Downloading real world blogs for: ${categoryName}...`);
        
        try {
            // Fetch the top 6 latest articles for this specific tech tag
            const url = `https://dev.to/api/articles?tag=${apiTag}&per_page=6`;
            const response = await fetch(url);
            const articles = await response.json();

            for (const article of articles) {
                // We do a quick second fetch to get the actual HTML body content of the blog
                const articleDataRes = await fetch(`https://dev.to/api/articles/${article.id}`);
                const fullArticle = await articleDataRes.json();

                const title = fullArticle.title;
                const excerpt = fullArticle.description || "Click to read this full technical article...";
                
                // Real World Data Extraction
                const author = fullArticle.user.name;
                const authorImage = fullArticle.user.profile_image; // Real profile photo!
                const read_time = fullArticle.reading_time_minutes;
                
                // Format the real publish date cleanly
                const date_published = new Date(fullArticle.published_at).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                });
                
                // Wrap the content so it looks great on your frontend
                const content = fullArticle.body_html || `<p>${excerpt}</p>`;

                stmt.run(categoryName, title, excerpt, author, authorImage, date_published, read_time, content);
            }
        } catch (err) {
            console.error(`Failed to fetch data for ${categoryName}. Skipping...`, err.message);
        }
    }

    setTimeout(() => {
        stmt.finalize();
        console.log("✅ Success! Database fully populated with real-world authors, dates, and blogs.");
        process.exit(0);
    }, 3000); // Give the database a moment to finish writing
}

fetchRealBlogs();