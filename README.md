# 🐶 Feinipedia

Feinipedia is an installable web app for collecting and reviewing knowledge
about your dog. Save notes, organize them into collections, and study with
flashcards. Your data is stored in your browser and remains available offline;
optional AI assistance needs an internet connection.

The name combines *Feini*, an affectionate, colloquial German term for pets
(especially dogs), with *-pedia*, as in encyclopedia.

## Getting started

You need Node.js 22+ and Yarn Classic.

1. Install dependencies: `yarn install`
2. Copy `.env.example` to `.env`. Add `OPENAI_API_KEY` if you want AI-assisted
   note processing. The rest of the app works without a key.
3. Start the API server: `yarn dev:api`
4. In another terminal, start the app: `yarn dev`
5. Open `http://localhost:5173`.

Keep your API key on the server: do not put it in frontend code or prefix it
with `VITE_`.

## Useful commands

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `yarn test`         | Run the tests                           |
| `yarn typecheck`    | Check TypeScript types                  |
| `yarn build`        | Build the app and server                |
| `yarn start`        | Serve the build with the Node.js server |
| `yarn format:check` | Check code formatting                   |

Run `yarn build` before `yarn start`. The server uses the port in `.env` (3001
by default).

## Data and deployment

Notes and flashcards are stored locally in your browser. Use the app's JSON
backup feature to keep a copy; clearing browser data can delete your notes. AI
processing sends note content to the server and requires an OpenAI API key.

The app has no built-in login. If you deploy it publicly, protect access to the
app and API, especially the AI endpoint. The repository includes a Vercel API
and a Node.js server for hosting the built app.

See [ASSET-CREDITS.md](ASSET-CREDITS.md) for asset credits.
