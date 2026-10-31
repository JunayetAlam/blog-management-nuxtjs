# Futurescope: Blog Management with Nuxt

A full-stack blog platform built with **Nuxt 4**. It has a public, SEO-friendly blog about technology and a dashboard for writing and managing posts. Posts are written in a rich text editor; every image is converted to WebP and stored on Cloudinary; data lives in MongoDB through Prisma.

- **Public blog:** editorial post list with infinite scroll, search, category and tag pages, and article pages with a table of contents, reading progress bar, share buttons and related posts.
- **Dashboard:** create, edit, publish and delete posts in a side panel, with inline category and tag creation, a cover image, and images inside the post content.
- **Theming:** indigo and cyan "tech" theme with light and dark modes (dark by default) and a one-click toggle.

---

## Contents

- [Tech stack](#tech-stack)
- [Features](#features)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [API reference](#api-reference)
- [How images work](#how-images-work)
- [Deployment (Vercel)](#deployment-vercel)
- [Known limitations](#known-limitations)
- [Author](#author)

---

## Tech stack

| Area | Tools |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) (Vue 3, Nitro server routes), TypeScript |
| Database | MongoDB (Atlas) with [Prisma 6](https://www.prisma.io) |
| Images | [Cloudinary](https://cloudinary.com) for storage and delivery, [sharp](https://sharp.pixelplumbing.com) for WebP conversion |
| UI | [shadcn-vue](https://www.shadcn-vue.com) (Reka UI), Tailwind CSS 4, Hugeicons, vue-sonner toasts |
| Editor | [Tiptap 3](https://tiptap.dev) |
| Forms & validation | vee-validate + [zod 4](https://zod.dev), with the same zod rules on client and server |
| Other | `@nuxtjs/color-mode`, `sanitize-html`, `@tailwindcss/typography`, VueUse |

> Prisma 6 is used on purpose: Prisma 7 shipped without MongoDB support.

---

## Features

### Public blog
- **Post list:** editorial layout with category, date, excerpt, reading time, tags and a thumbnail.
- **Infinite scroll:** the first page is server-rendered for SEO; more posts load automatically as you scroll. There is no "Load more" button.
- **Search:** live search across titles, excerpts and post text. It is stored in the URL (`/?q=quantum`) so results can be shared.
- **Category and tag pages:** at `/category/[slug]` and `/tag/[slug]`, with a sidebar of categories (with counts) and popular topics.
- **Article page** at `/blog/[slug]`:
  - sticky table of contents that highlights the current section
  - reading progress bar
  - share to X, LinkedIn and Facebook, a copy-link button, and the phone's native share menu
  - three related posts, ranked by shared tags and category
  - full SEO and Open Graph metadata
- **Visibility:** only published posts are public. Drafts return 404.

### Dashboard (`/dashboard`)
- **Posts table:** search, status and category filters, six sort options and pagination, all kept in the URL. The cover image and the Edit / Publish / Delete buttons stay pinned while the table scrolls sideways.
- **Create and edit:** one reusable form (`PostForm`) in a side panel.
  - It only closes on purpose, and asks before discarding unsaved changes.
  - Validation works like react-hook-form: on blur first, then live once a field has an error.
  - Server errors (such as a taken slug) appear under the matching field.
- **Rich text editor:** headings, lists, quotes, code blocks, links and alignment. Images can be added with the toolbar button, by pasting, or by dragging them in.
- **Categories and tags:** search the existing ones, or type a new name to create it on the spot.
- **Delete with undo:** deleting asks for confirmation and offers an **Undo** that restores the post.

### Platform
- **Soft delete everywhere:** deleting a category or tag never breaks the posts that use it (see [Data model](#data-model)).
- **Safe HTML:** post content is sanitized on the server, so scripts and event handlers are removed.
- **Validation:** input is checked with zod. Errors come back as `400` with `{ path, message }` issues; duplicates return `409`.

---

## Getting started

### Prerequisites

- **Node.js** `^22.21` or `^24.11` (or newer). Nuxt warns on older versions.
- **[Bun](https://bun.sh)** (the repo uses `bun.lock`). npm, pnpm or yarn also work.
- A **MongoDB** database that runs as a replica set, because Prisma needs transactions. Any [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, including the free tier, already is one.
- A **Cloudinary** account (the free tier is enough).

### Setup

```bash
# 1. Clone and install
git clone https://github.com/JunayetAlam/blog-management-nuxtjs.git
cd blog-management-nuxtjs
bun install

# 2. Configure environment
cp .env.example .env
#    → fill in the values (see the next section)

# 3. Create collections and indexes, and generate the Prisma client
bun run db:push

# 4. Start the dev server
bun run dev
```

Then open:

- Blog: <http://localhost:3000>
- Dashboard: <http://localhost:3000/dashboard>

The blog will be empty until you create posts in the dashboard.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | MongoDB connection string, including the database name. |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret. Server-side only, never sent to the browser. |
| `CLOUDINARY_PROJECT_NAME` | ✅ | Cloudinary folder for this project's uploads, e.g. `my-project/blog`. The asset API refuses to replace or delete anything outside this folder, so give the blog its own subfolder. |

Never commit `.env`. It is already in `.gitignore`.

---

## Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Start the dev server on port 3000. |
| `bun run build` | Build for production. |
| `bun run preview` | Preview the production build locally. |
| `bun run typecheck` | Type-check the whole project, Vue files and server code (`vue-tsc`). |
| `bun run db:push` | Sync the Prisma schema to MongoDB (collections and indexes) and regenerate the client. Run it after every schema change; MongoDB has no migrations. |
| `bun run db:generate` | Regenerate the Prisma client only. |
| `bun run db:studio` | Open Prisma Studio to browse the data. |

---

## Project structure

```
app/
├── pages/
│   ├── index.vue                  # Blog home: search + infinite list
│   ├── blog/[slug].vue            # Article page
│   ├── category/[slug].vue        # Category page
│   ├── tag/[slug].vue             # Tag page
│   └── dashboard/posts/index.vue  # Dashboard: posts table
├── layouts/                       # default (public) and dashboard
├── components/
│   ├── blog/                      # Feed, rows, cards, sidebar, TOC, share, progress bar
│   ├── post/                      # PostForm, PostSheet, PostStatusBadge
│   ├── rich-text/                 # Tiptap editor and toolbar
│   ├── image/                     # Cover image uploader
│   ├── taxonomy/                  # Category/tag picker with inline create
│   ├── brand/                     # Logo mark, theme toggle
│   └── ui/                        # shadcn-vue components
├── composables/                   # useAssets, useInfinitePosts
├── lib/form.ts                    # zod 4 → vee-validate adapter
├── utils/blog.ts                  # Dates, reading time, Cloudinary resize URLs
├── app.config.ts                  # Site name, tagline, description
└── assets/css/tailwind.css        # Theme tokens (light/dark), fonts, article styles
server/
├── api/
│   ├── posts/                     # Admin CRUD for posts
│   ├── categories/                # Admin CRUD for categories
│   ├── tags/                      # Admin CRUD for tags
│   ├── assets/                    # Image upload / replace / remove
│   └── blog/                      # Public read-only API (published posts only)
├── utils/                         # Prisma, Cloudinary, slugs, HTML sanitizing, pagination…
└── validators/                    # zod schemas for request bodies and queries
shared/                            # Types and helpers used by both app and server
prisma/schema.prisma               # Data model
```

To change the site name, tagline or description, edit `app/app.config.ts`. Theme colors are the CSS variables in `app/assets/css/tailwind.css`.

---

## Data model

```
Post ──(many-to-one)──> Category
Post <──(many-to-many)──> Tag
Post.coverImage: { url, name }
```

- **Post:** title, slug (unique), excerpt, content (sanitized HTML), `contentText` (plain text used for search), cover image, `DRAFT`/`PUBLISHED` status and `publishedAt`.
- **Category:** name and slug (both unique) and an optional description.
- **Tag:** name and slug (both unique).

### Soft delete
Every model has `isDeleted` and `deletedAt`. Nothing is ever removed from the database:

- **Hidden from the API:** deleted records disappear from every list, single-item lookup and edit.
- **Posts keep their links:** deleting a category or tag leaves the post's reference in place. The post just shows `category: null` or leaves the tag out. Restoring brings it back automatically.
- **Accurate counts:** `postsCount` only counts posts that aren't deleted.
- **No new deleted links:** a deleted category or tag can't be given to a post.
- **Names stay reserved:** a deleted record still holds its name and slug in the unique index. Creating the same name again returns `409` with a hint to restore it instead.

---

## API reference

All `:id` parameters accept either the id or the slug.

**Errors**

| Status | Meaning |
|---|---|
| `400` | Validation failed. The body has `data.issues: [{ path, message }]`. |
| `404` | Not found. |
| `409` | Conflict, such as a duplicate name or slug. |

**Paginated responses**

```json
{ "data": [...], "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }
```

### Posts (admin)

| Method | Route | Notes |
|---|---|---|
| `GET` | `/api/posts` | Query options:<br>• `page`, `limit` (max 100), `search`<br>• `status` (`DRAFT`/`PUBLISHED`)<br>• `category`, `tag` (id or slug)<br>• `sortBy` (`createdAt`, `updatedAt`, `publishedAt`, `title`), `order` (`asc`/`desc`)<br>The list leaves out `content`. |
| `GET` | `/api/posts/:id` | Full post, including content. |
| `POST` | `/api/posts` | Body:<br>• `title`, `content`: required<br>• `slug`: optional, built from the title if missing<br>• `excerpt`, `coverImage`, `categoryId`, `tagIds`, `publishedAt`: optional<br>• `status`: defaults to `DRAFT`<br>`publishedAt` is set automatically on first publish. |
| `PATCH` | `/api/posts/:id` | Partial update: send only the fields to change. `tagIds` replaces the whole list; `null` clears `coverImage` or `categoryId`. |
| `DELETE` | `/api/posts/:id` | Soft delete. |
| `PATCH` | `/api/posts/:id/restore` | Restore a deleted post. |

### Categories and tags (admin)

These have the same shape as posts, at `/api/categories` and `/api/tags`:

- **Methods:** `GET` list and single, `POST`, `PATCH`, `DELETE` (soft) and `PATCH .../restore`.
- **List options:** `search`, and `sortBy` (`name`, `createdAt` or `updatedAt`).
- **Counts:** every item includes `postsCount`.

### Assets

| Method | Route | Body | Returns |
|---|---|---|---|
| `POST` | `/api/assets` | multipart, one or more `images` | `[{ url, name }]` |
| `PUT` | `/api/assets` | multipart, `names` + `images`, paired by order | `[{ url, name }]` |
| `DELETE` | `/api/assets` | JSON `{ "name": "<folder>/..." }` | `{ name }` |

**Limits**
- **File types:** JPEG, PNG, WebP, GIF or AVIF.
- **Size:** at most 4 MB per file and 10 files per request.
- **Uploads are all or nothing:** if one file fails, the others from that request are deleted.

### Public blog (read-only, published posts only)

| Method | Route | Notes |
|---|---|---|
| `GET` | `/api/blog/posts` | Query: `page`, `limit` (max 30), `search`, `category`, `tag` (slugs). Newest first. Each item includes `readingTime`. |
| `GET` | `/api/blog/posts/:slug` | Content with heading ids, plus `toc` and `related` (3 posts). Drafts and deleted posts return `404`. |
| `GET` | `/api/blog/topics` | Categories and tags that have published posts, with counts. |

---

## How images work

1. **Upload:** the dashboard sends files to `POST /api/assets`.
2. **Convert:** the server converts each file to **WebP** (quality 80) with sharp. Images wider than 2560 px are scaled down, phone photos are rotated upright, and animated GIFs stay animated.
3. **Store:** the WebP is uploaded to Cloudinary under `CLOUDINARY_PROJECT_NAME`, and `{ url, name }` is returned. `name` is the Cloudinary public id, used to replace or delete the image.
4. **Deliver:** the public site asks Cloudinary for sized versions of each image (for example, small list thumbnails), so pages don't download full-size files.

**Cleanup**
- **On save:** editor images uploaded during a session but not used in the saved post are deleted.
- **On discard:** closing the form without saving deletes everything uploaded in that session.
- **On edit:** images removed from a post's content, and a replaced cover, are deleted on the server.

---

## Deployment (Vercel)

1. Import the repository in Vercel. It detects Nuxt automatically.
2. Add all five [environment variables](#environment-variables) under **Project → Settings → Environment Variables**.
3. In MongoDB Atlas, allow connections from Vercel under **Network Access**.
4. Deploy. `postinstall` runs `prisma generate` during the build.

Notes:
- **Upload size:** Vercel functions reject request bodies over about **4.5 MB**, which is why uploads are capped at 4 MB per file.
- **Hobby plan:** Vercel's free plan is for non-commercial use only.
- **Rendering:** the dashboard renders only in the browser (`ssr: false` for `/dashboard/**`). Public pages are server-rendered.

---

## Known limitations

- **No authentication yet.** The dashboard and every write endpoint (posts, categories, tags, assets) are open to anyone who can reach them. Add authentication before deploying publicly.
- **No trash view.** Restoring needs the item's id (the dashboard's Undo covers the common case), but there's no screen that lists deleted items.
- **Search uses regular expressions.** Fine for a blog of this size. For thousands of posts, use MongoDB Atlas Search.

---

## Author

**Junayet Alam**, Full Stack Developer

- Portfolio: [junayetalam.me](https://www.junayetalam.me/)
- GitHub: [@junayetalam](https://github.com/junayetalam)
- LinkedIn: [junayet-alam](https://www.linkedin.com/in/junayet-alam/)

Questions, feedback or collaboration ideas are welcome. Feel free to reach out or open an issue.
