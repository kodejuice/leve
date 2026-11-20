# Leve

> A minimal, self-hosted headless CMS and personal publishing engine built with Next.js and Prisma (PostgreSQL).

Leve is a lightweight, developer-first content management system designed for personal blogs, developer websites, technical essays, and reading logs. It prioritizes fast edge performance, full Markdown and LaTeX support, and a distraction-free writing workflow.

---

## Highlights

* **Modern Database Layer**: Backed by PostgreSQL and Prisma ORM with connection pooling support.
* **Math & Syntax Highlighting**: Full GitHub Flavored Markdown (GFM), inline and display LaTeX math via KaTeX (`markdown-it-texmath`), and code syntax highlighting via `highlight.js`.
* **In-Browser Admin Suite**: Integrated writing workspace powered by StackEdit with live side-by-side preview, draft revisions, and metadata controls.
* **Automatic Syndication & SEO**: Generates `sitemap.xml`, global RSS (`/api/rss.xml`), and category-specific RSS feeds (`/api/rss/[category]`) automatically.
* **Content Taxonomies & Collections**: Post tagging by topic, dedicated `/archives` view, and a built-in bookshelf tracker (`/readings`).
* **Smart 404 Recovery**: Intelligent "Did you mean?" suggestions on broken links using dice-coefficient fuzzy matching.

---

## Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) (SSG + ISR)
* **Frontend**: React, Styled Components, Sass
* **ORM & Database**: [Prisma](https://www.prisma.io/) with PostgreSQL (via `@prisma/adapter-pg`)
* **Markdown Parser**: `markdown-it`, `markdown-it-texmath`, `katex`, `highlight.js`
* **Editor**: StackEdit integration
* **Authentication**: JWT tokens + SHA-256 hashed admin authorization

---

## Getting Started

### 1. Prerequisites

* **Node.js**: v20+ (recommended v22 or v24)
* **Package Manager**: `pnpm` (or `npm`)
* **Database**: A PostgreSQL database (local, Neon, Supabase, or AWS RDS)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/kodejuice/leve.git
cd leve
pnpm install
```

### 3. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/leve` |
| `DATABASE_URL_POOLED` | (Optional) Pooled database connection string | `postgresql://user:pass@pooler:5432/leve` |
| `HOST` | Domain host with port | `localhost:3000` |
| `SCHEME` | Protocol scheme | `http` or `https` |
| `JWT_SECRET` | Secret key for signing admin session tokens | `your-secure-random-key` |
| `PASSWORD_HASH` | SHA-256 hash of your admin password | See generation below |
| `GA_TRACK_CODE` | (Optional) Google Analytics Measurement ID | `G-XXXXXXXXXX` |

#### Generating Your Admin Password Hash

Run this command in your terminal to generate the SHA-256 hash for your chosen password:

```bash
echo -n "your_secret_password" | shasum -a 256
```

Copy the resulting 64-character hash into your `PASSWORD_HASH` variable in `.env`.

### 4. Database Setup

Push the Prisma schema to your PostgreSQL database:

```bash
npx prisma db push
```

To inspect or manipulate your database records with a visual UI:

```bash
npx prisma studio
```

### 5. Run the Development Server

```bash
pnpm dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Admin Dashboard

Access the admin dashboard at:

```text
http://localhost:3000/admin/login
```

* Enter the password you used to generate `PASSWORD_HASH`.
* Once authenticated, you can:
  * Create, edit, and publish posts (`/admin/edit`)
  * Manage post drafts, tags, and custom quotes (`/admin/list`)
  * Export all articles as JSON backups (`/admin/export`)
  * Import articles from backup archives (`/admin/import`)

---

## Configuration

Customize personal branding, social links, author biography, and pagination in [`site_config.js`](./site_config.js):

```javascript
export const site_details = {
  name: "Your Name",
  email: "your.email@example.com",
  description: "Personal website & technical notes",

  links: {
    twitter: "https://x.com/your_handle",
    github: "https://github.com/your_username",
    linkedin: "https://linkedin.com/in/your_profile",
    rss_url: "/api/rss.xml",
  },

  site: {
    post_per_page: 10,
  },
};
```

---

## Production Build & Deployment

### Build Locally

```bash
pnpm build
pnpm start
```

### Deploying to Vercel

1. Push your repository to GitHub.
2. Import the project into Vercel.
3. In the Vercel Project Settings, add the environment variables from your `.env` (`DATABASE_URL`, `JWT_SECRET`, `PASSWORD_HASH`, `HOST`, `SCHEME`).
4. Set the Build Command to `prisma generate && next build`.
5. Deploy.

Thanks to Leve's Incremental Static Regeneration (`revalidate: 3600`), your pages are pre-rendered and cached across Vercel's global Edge CDN, delivering sub-100ms response times without incurring heavy serverless compute overhead.

---

## License

[MIT](./LICENSE) © Sochima Biereagu
