# Feinipedia

Ein privates, lokal gespeichertes Hundewissensbuch als installierbare PWA.
Notizen, Sammlungen und Lernkarten funktionieren offline; die optionale
KI-Aufbereitung benötigt Internet und einen eigenen OpenAI-API-Key auf dem
Server.

## Lokal starten

Node.js 22+ und Yarn Classic (oder npm) installieren. `yarn install` ausführen,
`.env.example` nach `.env` kopieren und optional `OPENAI_API_KEY` eintragen. In
zwei Terminals `yarn dev:api` und `yarn dev` starten; die App ist dann unter
`http://localhost:5173` erreichbar. Ohne API-Key funktionieren Notizen,
manuelle Bearbeitung, Backup und Lernen weiterhin. Die API gibt in diesem Fall
eine verständliche Fehlermeldung zurück. `yarn test` führt die Tests aus, `yarn
build` baut Frontend und Server.

## Codeformatierung

`yarn format` formatiert den Projektcode mit Prettier; `yarn format:check`
prüft die Formatierung ohne Änderungen. Das Anforderungsdokument, generierte
Dateien und öffentliche Bild-Assets sind ausgenommen.

## Deployment

### Vercel (Frontend und KI-API)

1. **Vor dem Deployment** unter Projekt → Settings → Deployment Protection
   **Vercel Authentication für „All Deployments“** aktivieren (auch Preview-URLs
   und Produktionsdomain). „Standard Protection“ schützt die Produktionsdomain
   nicht. Die API hat keine eigene Anmeldung und darf nicht ungeschützt online
   gehen. Zugriff für die Nutzerin in Vercel freigeben.
2. Das Repository im selben Vercel-Projekt mit Framework-Preset **Vite** und
   Output Directory `dist` deployen. Die Dateien unter `api/` werden zu Vercel
   Functions; `vercel.json` leitet nur App-Routen (nicht `/api/`) an die PWA
   weiter. Der Frontend-Aufruf an `/api/ai/enrich-note` bleibt unverändert.
3. Unter Projekt → Settings → Environment Variables `OPENAI_API_KEY` für
   **Production** hinterlegen und danach neu deployen. Optional
   `OPENAI_MODEL=gpt-4o-mini` setzen. Beide Variablen sind **serverseitig**:
   kein `VITE_`-Präfix und niemals den Key im Frontend oder Repository speichern.
4. Angemeldet `https://<deine-domain>/api/health` aufrufen: Erwartet wird
   `{"ok":true}`. Unangemeldet muss **auch dieser API-Pfad** eine Anmeldung
   verlangen. Anschließend eine Notiz über die App aufbereiten. Bei Fehlern
   die Function-Logs im Vercel-Dashboard prüfen. Für den OpenAI-Key ein
   Ausgabenlimit beim Anbieter setzen.

Die Vercel Function und der lokale Express-Server verwenden dieselbe
Validierung und OpenAI-Aufbereitung. Die Vercel Authentication wird von Vercel
vor der Function durchgesetzt; wenn sie deaktiviert wird, ist die API öffentlich.
Bereits offline gespeicherte PWA-Inhalte und Notizen bleiben auf dem jeweiligen
Gerät verfügbar.

### Eigener Node-Server

`yarn install --frozen-lockfile`, `yarn build`, danach `OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini PORT=3001 yarn start`. Der Node-Server liefert sowohl
die gebaute PWA als auch `/api/ai/enrich-note` und `/api/health` aus. Für
Android-Installation und Service Worker per HTTPS (z. B. hinter einem
Reverse-Proxy) bereitstellen. Den Server nur in einem privaten Netzwerk oder
hinter einem Zugangsschutz veröffentlichen: Das MVP hat **keine Anmeldung** und
der KI-Endpunkt wäre sonst frei nutzbar. Den Key niemals mit `VITE_` prefixen
oder ins Frontend schreiben.

## Verhalten und Grenzen

- Beim Erfassen ist nur Inhalt nötig. Vor jedem KI-Aufruf wird die Notiz samt
  vorläufiger Lernkarte **zuerst lokal** in IndexedDB gespeichert. Beim ersten
  KI-Versuch wird die Übertragung des Originaltexts an OpenAI bestätigt. Bei
  Fehlern oder offline bleibt die Notiz erhalten und kann erneut aufbereitet
  oder manuell ergänzt werden. KI ändert weder Originaltext noch Quelle. Eine
  spätere KI-Aufbereitung überschreibt jedoch manuell bearbeitete Metadaten und
  Karte; daher nur bei Bedarf erneut ausführen.
- Der initiale Kartentext basiert auf dem Original, bis er bearbeitet oder
  durch KI ersetzt wird. Eine neue Karte ist sofort lernbar. „Nochmal“: 10
  Minuten, „Schwer“: mindestens 1 Tag und Faktor 1,2, „Gut“: 1/3 Tage, danach
  Faktor 2, maximal 365 Tage. UTC-Zeitstempel, Anzeige in lokaler Zeit. Fällige
  Karten kommen vor neuen; Tageslimit neuer Karten: 10 (änderbar, 0–100). Die
  Zahl erstmals bewerteter Karten wird pro lokalem Kalendertag gespeichert.
- Der JSON-Export enthält alle Notizen, Verknüpfungen, Kategorien, Tags,
  Karten, Lernstände und Einstellungen. Import **ersetzt** alle lokalen Daten
  nach Bestätigung; fehlerhafte oder inkonsistente Backups werden vor dem
  Ersetzen abgelehnt. Regelmäßig herunterladen: Browserdaten sind
  gerätegebunden und können gelöscht werden.
- App-Shell und statische Assets sind offline verfügbar. KI braucht Netzwerk.
  Bei neuer Version fragt die App vor dem Aktualisieren; IndexedDB bleibt
  unberührt. Externe Schriftarten werden online nachgeladen, offline werden
  System-/Serifenschriften verwendet.
