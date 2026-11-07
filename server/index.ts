import express from 'express'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleEnrichNote } from './enrich-note.js'

try {
  process.loadEnvFile('.env')
} catch {
  /* deployment may provide environment directly */
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '30kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})
app.post('/api/ai/enrich-note', async (req, res) => {
  const result = await handleEnrichNote(req.body)
  res.status(result.status).json(result.body)
})

const root = join(fileURLToPath(new URL('.', import.meta.url)), '../../dist')
app.use(express.static(root))
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(join(root, 'index.html'))
})
app.use((_req, res) => {
  res.status(404).json({ error: 'Nicht gefunden.' })
})

const port = Number(process.env.PORT || 3001)
app.listen(port, () => console.info(`Feinipedia läuft auf Port ${port}`))
