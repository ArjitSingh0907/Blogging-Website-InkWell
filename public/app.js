const App = {
    apiBase: '/api/posts',

    // Generates the sleek Apple Liquid Glass cards seamlessly
    generateCardHTML: (p, i) => `
        <div class="post-card" style="animation-delay:${i * 50}ms" onclick="window.location.href='post.html?id=${p.id}'">
            <div class="post-card-tag">${p.tag}</div>
            <h3 class="post-card-title">${p.title}</h3>
            <p class="post-card-excerpt">${p.excerpt}</p>
            <div class="post-card-footer">
                <img src="${p.authorImage}" alt="${p.author}" class="author-photo" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.author)}&background=0A84FF&color=fff&bold=true';">
                <div>
                    <div style="font-size:13px; font-weight:600; color:var(--text-main);">${p.author}</div>
                    <div style="font-size:12px; color:var(--text-muted);">${p.date_published} · ${p.read_time} min read</div>
                </div>
            </div>
        </div>
    `,

    // Loads everything on the main home feed row
    loadFeed: async () => {
        const grid = document.getElementById('home-grid');
        if (!grid) return;
        try {
            const res = await fetch(App.apiBase);
            const posts = await res.json();
            if (posts.length === 0) {
                grid.innerHTML = `<p style="color:var(--text-muted);">No documents logged in active tables.</p>`;
                return;
            }
            grid.innerHTML = posts.map((p, i) => App.generateCardHTML(p, i)).join('');
        } catch (err) { 
            console.error('Feed error:', err); 
            grid.innerHTML = `<p style="color:var(--text-muted);">Failed to load stream.</p>`;
        }
    },

    // FIX: Decodes URLs properly and cross-matches keywords to ensure data shows up in every section
    loadCategoryFeed: async () => {
        const grid = document.getElementById('category-grid');
        if (!grid) return;

        const urlParams = new URLSearchParams(window.location.search);
        let tag = urlParams.get('tag');

        if (!tag) {
            grid.innerHTML = `<p style="color:var(--text-muted);">No subject tag specified.</p>`;
            return;
        }

        // Clean up text formatting from URL parameters
        tag = decodeURIComponent(tag).trim();

        // Update titles to the clean name immediately
        document.getElementById('cat-title').innerText = tag;
        document.getElementById('cat-eyebrow').innerText = `Browsing Category: ${tag}`;

        try {
            // Fetch records from backend route
            const res = await fetch(`/api/posts/category/${encodeURIComponent(tag)}`);
            let posts = await res.json();

            // Client-side matching safety net if the database query comes up empty
            if (posts.length === 0) {
                const allRes = await fetch(App.apiBase);
                const allPosts = await allRes.json();
                
                posts = allPosts.filter(p => {
                    const postTag = p.tag.toLowerCase();
                    const searchTag = tag.toLowerCase();
                    return postTag.includes(searchTag) || searchTag.includes(postTag);
                });
            }

            if (posts.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; padding: 40px 0; text-align: center; color: var(--text-muted);">
                        <p style="font-size: 16px; margin-bottom: 8px;">No records available for "${tag}"</p>
                        <p style="font-size: 14px;">Go to Dashboard to ensure row criteria tags align exactly.</p>
                    </div>`;
                return;
            }

            grid.innerHTML = posts.map((p, i) => App.generateCardHTML(p, i)).join('');
        } catch (err) { 
            console.error('Category feed rendering error:', err); 
            grid.innerHTML = `<p style="color:var(--text-muted);">Failed to load records.</p>`;
        }
    },

    // Loads single reading page layout smoothly
    loadSinglePost: async () => {
        const zone = document.getElementById('post-render-zone');
        if (!zone) return;
        const id = new URLSearchParams(window.location.search).get('id');
        if (!id) return;

        try {
            const res = await fetch(`${App.apiBase}/${id}`);
            const p = await res.json();
            zone.innerHTML = `
                <div style="color:var(--accent-teal); font-size:12px; font-weight:700; text-transform:uppercase; margin-bottom:16px;">${p.tag}</div>
                <h1 style="font-size:48px; font-weight:800; line-height:1.1; margin-bottom:30px; letter-spacing:-1px;">${p.title}</h1>
                <div style="display:flex; align-items:center; gap:16px; margin-bottom:40px; padding-bottom:30px; border-bottom:1px solid var(--glass-border);">
                    <img src="${p.authorImage}" class="author-photo" style="width:50px; height:50px;" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.author)}&background=0A84FF&color=fff&bold=true';">
                    <div>
                        <div style="font-weight:600;">${p.author}</div>
                        <div style="color:var(--text-muted); font-size:14px;">${p.date_published} · ${p.read_time} min read</div>
                    </div>
                </div>
                <div style="font-size:18px; line-height:1.8; color:#d1d1d6;">${p.content}</div>
            `;
        } catch (err) { 
            console.error(err); 
            zone.innerHTML = `<h2>Document Unreachable</h2>`;
        }
    },

    // Populates data rows inside console cleanly
    // Populates data rows inside console cleanly
    loadDashboard: async () => {
        const tbody = document.getElementById('dashboard-tbody');
        if (!tbody) return;
        try {
            const res = await fetch(App.apiBase);
            const posts = await res.json();
            if (posts.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">Table matrices clear.</td></tr>`;
                return;
            }
            tbody.innerHTML = posts.map(p => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding:16px; font-weight:600;">${p.title}</td>
                    <td style="padding:16px; color:var(--text-muted);">${p.author}</td>
                    <td style="padding:16px;">
                        <span style="display: inline-block; white-space: nowrap; font-size:11px; background:rgba(255,255,255,0.08); padding:4px 10px; border-radius:10px; color:var(--accent-teal); border:1px solid rgba(255,255,255,0.05);">
                            ${p.tag}
                        </span>
                    </td>
                </tr>
            `).join('');
        } catch (err) { console.error(err); }
    },

    // Setup form engine to create fresh records
    initFormSetup: async () => {
        const form = document.getElementById('editor-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const authorName = document.getElementById('post-author').value;
            const rawContent = document.getElementById('post-body').value;
            const formattedContent = rawContent.split('\n\n').map(p => `<p>${p}</p>`).join('');

            const payload = {
                title: document.getElementById('post-title').value,
                author: authorName,
                tag: document.getElementById('post-tag').value,
                content: formattedContent,
                excerpt: rawContent.substring(0, 120) + '...',
                authorImage: '', 
                date_published: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                read_time: Math.max(1, Math.ceil(rawContent.split(' ').length / 200))
            };

            await fetch(App.apiBase, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            window.location.href = 'index.html';
        });
    }
};