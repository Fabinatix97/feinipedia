/** Do not pass upstream error text to clients: it can contain request details. */
export function openAIError(status: number, code?: string): { status: number; error: string } {
  if (status === 401) return { status: 502, error: 'Der OpenAI-API-Key wurde abgelehnt. Bitte den Server-Key prüfen.' }
  if (status === 403) return { status: 502, error: 'Der OpenAI-Zugang hat keine Berechtigung für dieses Modell.' }
  if (status === 404 || code === 'model_not_found') return { status: 502, error: 'Das konfigurierte OpenAI-Modell wurde nicht gefunden. Bitte OPENAI_MODEL prüfen.' }
  if (code === 'insufficient_quota') return { status: 503, error: 'Das OpenAI-Guthaben oder Nutzungslimit ist aufgebraucht.' }
  if (status === 429) return { status: 503, error: 'OpenAI ist gerade ausgelastet oder das Anfragelimit wurde erreicht. Bitte später erneut versuchen.' }
  if (status === 400 || status === 422) return { status: 502, error: 'OpenAI hat die Anfrage abgelehnt. Bitte das konfigurierte Modell und dessen JSON-Unterstützung prüfen.' }
  return { status: 502, error: `OpenAI ist derzeit nicht erreichbar (HTTP ${status}). Bitte später erneut versuchen.` }
}
