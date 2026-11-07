export default {
  fetch(request: Request): Response {
    if (request.method !== 'GET')
      return Response.json({ error: 'Methode nicht erlaubt.' }, { status: 405 })
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  },
}
