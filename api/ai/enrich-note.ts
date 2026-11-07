import { handleEnrichNote } from '../../server/enrich-note.js'

const headers = { 'Cache-Control': 'no-store' }

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST')
      return Response.json({ error: 'Methode nicht erlaubt.' }, { status: 405, headers })
    if (
      request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() !==
      'application/json'
    )
      return Response.json({ error: 'JSON erwartet.' }, { status: 415, headers })

    let input: unknown
    try {
      const body = await request.text()
      if (Buffer.byteLength(body, 'utf8') > 30 * 1024)
        return Response.json({ error: 'Die Notiz ist zu lang.' }, { status: 413, headers })
      input = JSON.parse(body)
    } catch {
      return Response.json({ error: 'Ungültiges JSON.' }, { status: 400, headers })
    }

    const result = await handleEnrichNote(input)
    return Response.json(result.body, { status: result.status, headers })
  },
}
