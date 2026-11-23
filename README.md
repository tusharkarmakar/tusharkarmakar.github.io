# Collab W/ Tushar

Portfolio of Tushar Karmakar: design, motion and AI content. Built with [Astro](https://astro.build), hosted on GitHub Pages.

## Edit content (no code)
1. Go to https://app.pagescms.org and sign in with GitHub.
2. Open this repository.
3. **Projects**: add or edit a project (title, description, cover, images and media links). In *Images & media* you can drag items to reorder them and set each one's ratio (1:1, 4:5, 9:16, 16:9…) and width (full, half, third).
4. **Site text & links**: hero text, work page process, contact and social links.
5. Save. The site rebuilds automatically and is live in about 1–2 minutes.

## Develop locally
```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Structure
- `src/content/projects/*.md`: one file per project (front matter + description)
- `src/data/site.json`: site-wide text and links
- `public/uploads/`: images uploaded through the portal
- `public/css/site.css`, `public/js/site.js`: styles and motion
- `.pages.yml`: the admin portal schema
