# 🖌️ Mindraww

**Mindraww** is a real-time collaborative, web-based drawing application inspired by the simplicity of Excalidraw. Built for teams, educators, and creatives, it enables users to sketch, brainstorm, and share ideas visually — all within the browser.

## 🚀 Features

- 🎨 Freehand drawing, shapes, zoom, panning and text tools
- 👥 Real-time collaboration with WebSocket support
- 💾 Save and load drawings from the database
- 🔗 Shareable session links

## 🛠️ Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend:** [Express.js], [WebSockets](https://www.npmjs.com/package/ws)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Monorepo:** [Turborepo](https://turbo.build/repo) for managing shared packages and apps

## 🧑‍💻 Getting Started

1. Clone the repo:

   ```
   git clone https://github.com/yourusername/mindraww.git
   cd mindraww
   ```

2. Install dependencies:

   ```
   pnpm install
   ```

3. Create a `.env` file in the packages/db directory with the following content:

   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mindraww
   ```

4. Run the dev server:
   ```
   turbo run dev
   ```
