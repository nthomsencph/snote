# Snote

**Snote** is a simple and elegant note-taking app built with Next.js, React, Prisma, and PostgreSQL. It features a modern, distraction-free interface for writing, organizing, and managing notes or journal entries. Snote supports rich text editing, code blocks with syntax highlighting, image uploads, and more.

## Features

- ✍️ **Rich Text Editor**: Write notes with formatting, images, code blocks, and more (powered by [Tiptap](https://tiptap.dev/)).
- 🗂 **Organize Entries**: Search, sort, and filter your notes by date, title, or custom index.
- 🔍 **Fast Search**: Quickly find notes with instant search and keyboard shortcuts (Ctrl/Cmd + F).
- 🖼 **Image Support**: Upload and resize images directly in your notes.
- 💾 **Persistent Storage**: All notes are stored in a PostgreSQL database via Prisma ORM.
- 🌓 **Dark Mode**: Beautiful light and dark themes, with system preference support.
- 🏷 **Icons**: Assign icons to your notes for quick visual identification.
- 🔄 **Copy & Edit**: Duplicate notes or edit existing ones with ease.
- 🐳 **Dockerized Database**: Easy local development with a pre-configured PostgreSQL container.

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tiptap Editor](https://tiptap.dev/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/) (state management)
- [React Hot Toast](https://react-hot-toast.com/) (notifications)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/snote.git
cd snote
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up the database

#### Using Docker (recommended for local development):

```bash
docker-compose up -d
```

This will start a PostgreSQL database on port 5432 with the credentials defined in `docker-compose.yml`.

#### Or use your own PostgreSQL instance and update `.env` accordingly.

### 4. Configure environment variables

Copy the example file and fill in your settings:

```bash
cp .env.example .env
```

Edit `.env` to set your `DATABASE_URL` (see `.env.example` for format).

### 5. Run database migrations

```bash
npx prisma migrate deploy
# or, for development:
npx prisma migrate dev
```

### 6. Start the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- **Create a new note**: Click "New Entry" or use `Ctrl/Cmd + N`.
- **Edit a note**: Click on a note, then click "Edit".
- **Search**: Use the search bar or `Ctrl/Cmd + F`.
- **Sort**: Use the sort dropdown to order notes by date, title, or index.
- **Copy or Delete**: Use the menu on each note card.
- **Assign an icon**: Pick an icon when editing a note.

## Data Model

The main data model is `Entry`:

| Field       | Type      | Description            |
| ----------- | --------- | ---------------------- |
| id          | String    | Unique identifier      |
| index       | Int       | Auto-incremented index |
| title       | String    | Note title             |
| content     | String    | HTML content           |
| preview     | String    | Short text preview     |
| date        | DateTime  | Creation date          |
| lastUpdated | DateTime? | Last update date       |
| icon        | String?   | Optional icon name     |

## Keyboard Shortcuts

- `Ctrl/Cmd + N`: New entry
- `Ctrl/Cmd + F`: Focus search

## Deployment

You can deploy Snote to [Vercel](https://vercel.com/) or any platform that supports Next.js and PostgreSQL.

## License

MIT

---

Let me know if you want to add usage screenshots, API documentation, or contribution guidelines!
