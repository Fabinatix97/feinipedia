# Anforderungsdokument – Feinipedia

**Version:** 1.0  
**Status:** Entwurf / MVP  
**Produktziel:** Eine warme, mobile-first Wissens-App für zwei Personen, die
Notizen und Erkenntnisse rund um die Anschaffung und das Leben mit einem Hund
schnell erfasst, automatisch strukturiert und mit Karteikarten dauerhaft
lernbar macht.

---

## 1. Produktvision

Feinipedia ist ein persönliches digitales Hundewissensbuch. Nutzer können
Wissen, Zitate und eigene Notizen mit möglichst wenig Aufwand erfassen. Ein
KI-Dienst erzeugt daraus einen prägnanten Titel, passende Kategorien und Tags
sowie genau eine Lernkarte mit Frage und Antwort.

Die App hat drei Hauptbereiche:

1. **Erfassen** – Wissen schnell hinzufügen und durch KI aufbereiten lassen.
2. **Sammlungen** – Notizen thematisch gruppieren, durchsuchen und im Detail
   lesen.
3. **Üben** – Lernkarten mit Active Recall und Spaced Repetition wiederholen.

Die Anwendung ist zunächst ohne Benutzerkonten und für den privaten Gebrauch
auf einem Gerät bzw. in einem privaten Netzwerk-/Hosting-Setup vorgesehen.

## 2. Ziele und Nicht-Ziele

### 2.1 Ziele für das MVP

- Neue Notizen in wenigen Sekunden erfassen.
- KI-gestützte Aufbereitung mit einem konfigurierbaren OpenAI-Modell.
- Eine Notiz kann mehreren Kategorien und Tags zugeordnet sein.
- Jede Notiz erhält genau eine zugehörige Lernkarte.
- Notizen und Lernfortschritt bleiben nach Browser- oder Geräte-Neustart
  erhalten.
- Volltextsuche über alle Notizen.
- Sammlungen nach Kategorie anzeigen.
- Lernkarten nach einem einfachen, nachvollziehbaren
  Spaced-Repetition-Verfahren planen.
- Als installierbare Progressive Web App (PWA) auf Android nutzbar sein.

### 2.2 Nicht-Ziele für das MVP

- Keine Registrierung, Anmeldung oder Rollenverwaltung.
- Keine Mehrbenutzer-Synchronisation oder Cloud-Synchronisierung zwischen
  Geräten.
- Kein WhatsApp-Import.
- Keine Audioaufnahme, Transkription oder Podcast-Integration.
- Keine komplexen Statistiken, Gamification oder Abzeichen.
- Keine automatische Faktenprüfung durch die KI.
- Keine medizinische oder verhaltensbezogene Beratung durch die App.

## 3. Zielplattform und UX-Leitlinien

- Mobile-first, optimiert für Android-Smartphones.
- Installierbar und im Standalone-Modus startbar (PWA).
- Zusätzlich auf Desktop-Browsern sinnvoll nutzbar.
- Warme, ruhige, freundliche Gestaltung: Creme-/Sand-Hintergründe, gedeckte
  Grün- und Erdtöne, gut lesbare Typografie, dezente Pfoten-/Hundemotive.
- Klare Navigation mit den drei Hauptbereichen **Erfassen**, **Sammlungen** und
  **Üben**.
- Primäre Aktionen müssen mit einer Hand gut erreichbar sein.
- Beim Öffnen der App soll der Nutzer sofort im Stande sein, neue Notizen zu
  erfassen
- Keine unnötigen Pflichtfelder beim Erfassen.
- KI-Verarbeitung darf den ursprünglichen Notiztext niemals überschreiben.

## 4. Funktionale Anforderungen

### 4.1 Bereich „Erfassen“

**FR-01 – Notiz erfassen**  Nutzer können eine Notiz über ein einfaches
Textfeld anlegen. Der Inhalt ist das einzige Pflichtfeld.

**FR-02 – Optionale Quelle**  Optional kann eine Quelle angegeben werden, z. B.
Podcastname, Episodentitel, Buch, Website oder persönliche Erfahrung. Im MVP
genügt ein Freitextfeld.

**FR-03 – Speichern vor KI-Aufruf**  Die Notiz muss zunächst lokal bzw. in der
Datenbank gespeichert werden, bevor die KI-Verarbeitung startet. So geht der
Originalinhalt bei Netzwerk- oder API-Fehlern nicht verloren.

**FR-04 – KI-Aufbereitung**  Nach dem Speichern wird die Notiz an das
konfigurierte OpenAI-Modell übermittelt. Die KI soll strukturiert zurückgeben:

- einen kurzen, aussagekräftigen Titel,
- eine kurze Zusammenfassung (optional, aber empfohlen),
- eine oder mehrere passende Kategorien,
- optionale Tags,
- genau eine Lernfrage,
- eine präzise Antwort auf diese Lernfrage.

**FR-05 – KI-Ergebnisse prüfen und bearbeiten**  Die erzeugten Felder müssen
vor oder nach dem Speichern editierbar sein. Nutzer können Titel, Kategorien,
Tags, Frage und Antwort korrigieren. Der Originaltext bleibt unverändert
erhalten.

**FR-06 – Fehlerzustände**  Wenn die KI nicht erreichbar ist, der API-Key fehlt
oder die Antwort ungültig ist, bleibt die Notiz gespeichert und erhält den
Status „KI-Aufbereitung ausstehend/fehlgeschlagen“. Nutzer können die
Verarbeitung erneut starten oder die Felder manuell ergänzen.

**FR-07 – Statusanzeige**  Während der KI-Verarbeitung wird ein verständlicher
Ladezustand angezeigt. Nach Abschluss wird die neue Notiz bestätigt.

**FR-08 – Duplikate**  Im MVP ist keine automatische Duplikaterkennung
erforderlich. Optional kann vor dem Speichern auf exakt gleiche Inhalte
hingewiesen werden.

### 4.2 Bereich „Sammlungen“

**FR-09 – Kategorienübersicht**  Kategorien werden als Sammlungen angezeigt.
Jede Sammlung zeigt Name und Anzahl zugeordneter Notizen.

**FR-10 – Mehrfachzuordnung**  Eine Notiz kann mehreren Kategorien zugeordnet
sein und erscheint in jeder entsprechenden Sammlung.

**FR-11 – Kategorie-Detailansicht**  Beim Öffnen einer Kategorie werden die
zugehörigen Notizen angezeigt, standardmäßig neueste zuerst.

**FR-12 – Alle Notizen**  Es gibt eine Ansicht, in der alle Notizen unabhängig
von Kategorie angezeigt werden.

**FR-13 – Volltextsuche**  Nutzer können alle Notizen anhand von Titel und
Inhalt durchsuchen. Die Suche soll während der Eingabe oder nach Bestätigung
Ergebnisse liefern. Groß-/Kleinschreibung soll ignoriert werden.

**FR-14 – Filter und Sortierung**  Mindestens folgende Filter/Sortierungen:

- Kategorie,
- Erstellungsdatum (neueste/älteste zuerst). Mehrfachfilter sind wünschenswert,
  aber nicht zwingend für das MVP.

**FR-15 – Notiz-Detailansicht**  Eine Notiz-Detailansicht zeigt Titel,
Originalinhalt, Quelle, Kategorien, Tags und die verknüpfte Lernkarte. Alle
KI-generierten Felder sind bearbeitbar.

**FR-16 – CRUD**  Nutzer können Notizen bearbeiten und löschen. Beim Löschen
einer Notiz wird die zugehörige Lernkarte ebenfalls gelöscht. Kategorien können
umbenannt und gelöscht werden. Beim Löschen einer Kategorie wird nur die
Zuordnung entfernt, nicht die Notiz.

### 4.3 Bereich „Üben“

**FR-17 – Eine Lernkarte pro Notiz**  Jede Notiz besitzt genau eine Lernkarte.
Die Lernkarte enthält eine Frage (Vorderseite) und eine Antwort (Rückseite).
Die Lernkarte verweist eindeutig auf ihre Notiz.

**FR-18 – Active Recall**  Zu Beginn einer Wiederholung wird nur die Frage
angezeigt. Die Antwort bleibt verborgen, bis der Nutzer aktiv „Antwort
anzeigen“ auswählt.

**FR-19 – Selbstbewertung**  Nach Anzeige der Antwort bewertet der Nutzer, wie
gut er die Antwort wusste. Für das MVP genügen drei Bewertungen:

- **Nochmal** – nicht gewusst oder falsch,
- **Schwer** – mit Mühe gewusst,
- **Gut** – sicher gewusst.

**FR-20 – Spaced Repetition**  Nach jeder Bewertung wird das nächste
Fälligkeitsdatum berechnet und gespeichert. Karten, die nicht gewusst wurden,
werden zeitnah erneut vorgelegt. Gut beantwortete Karten erhalten zunehmend
größere Abstände.

**FR-21 – Fällige Karten zuerst**  Die Üben-Startseite zeigt die Anzahl
fälliger Karten. Eine Lernsession präsentiert zuerst überfällige und
anschließend heute fällige Karten.

**FR-22 – Neue Karten**  Noch nie geübte Karten gelten als neu. Sie können in
einer Session zusammen mit fälligen Karten gelernt werden. Die App soll eine
konfigurierbare Tagesobergrenze für neue Karten unterstützen (Standardwert:
10).

**FR-23 – Lernkarten bearbeiten**  Frage und Antwort können manuell bearbeitet
werden. Änderungen an einer Karte setzen den Lernfortschritt nicht automatisch
zurück.

**FR-24 – Lernfortschritt**  Pro Karte werden mindestens Wiederholungsanzahl,
letzter Wiederholungszeitpunkt, nächster Fälligkeitszeitpunkt und aktueller
Intervall gespeichert.

**FR-25 – Leere Zustände**  Wenn keine Karte fällig ist, zeigt die App eine
freundliche Meldung und optional die nächste Fälligkeit. Wenn noch keine Karten
existieren, wird zum Erfassen einer ersten Notiz aufgefordert.

## 5. Spaced-Repetition-Logik für das MVP

Für das MVP wird ein einfacher, transparenter Algorithmus empfohlen. Eine
spätere Umstellung auf FSRS oder einen anderen Algorithmus soll möglich
bleiben.

### 5.1 Datenmodell der Wiederholung

Pro Lernkarte speichern:

- `repetitions`: Anzahl erfolgreicher Wiederholungen,
- `lapses`: Anzahl der Bewertungen „Nochmal“,
- `interval_days`: aktueller Abstand in Tagen,
- `ease_factor`: optionaler Schwierigkeitsfaktor, Startwert 2.5,
- `last_reviewed_at`: Zeitpunkt der letzten Bewertung,
- `due_at`: Zeitpunkt der nächsten Fälligkeit,
- `review_count`: Anzahl aller Bewertungen.

### 5.2 Einfache Intervallregeln

Ausgangswerte und Regeln:

- Neue Karte: sofort lernbar, `due_at` ist leer oder jetzt.
- **Nochmal:** Intervall auf 10 Minuten setzen; `repetitions` auf 0 setzen;
  `lapses` erhöhen.
- **Schwer:** Intervall mit Faktor 1.2 multiplizieren, mindestens 1 Tag; Karte
  bleibt im Lernfluss ggf. später erneut fällig.
- **Gut:** Bei erster erfolgreicher Wiederholung 1 Tag, bei zweiter 3 Tage,
  danach bisheriges Intervall mit Faktor 2.0 multiplizieren.
- Intervall auf einen sinnvollen Maximalwert begrenzen, z. B. 365 Tage.

Die konkreten Regeln sollen in einer separaten, getesteten Funktion
implementiert werden. Datumsberechnungen erfolgen konsistent in UTC; Anzeige
erfolgt in lokaler Zeit.

**Hinweis:** Diese Regeln sind ein bewusst vereinfachtes MVP-Verfahren und
keine exakte Implementierung von Anki oder FSRS.

## 6. Datenmodell

Als persistente lokale Datenbank wird IndexedDB empfohlen. Die folgenden
Entitäten sind relational beschrieben; in IndexedDB können sie als Object
Stores mit Indizes umgesetzt werden.

### 6.1 Note

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---:|---|
| `id` | UUID | Ja | Primärschlüssel |
| `title` | String | Ja | KI-generierter oder manuell gesetzter Titel |
| `content` | Text | Ja | Unveränderter Originaltext der Notiz |
| `summary` | Text | Nein | Kurze KI-Zusammenfassung |
| `created_at` | ISO DateTime | Ja | Erstellungszeitpunkt |
| `updated_at` | ISO DateTime | Ja | Letzte Änderung |
| `source` | String | Nein | Freitextquelle |
| `ai_status` | Enum | Ja | `pending`, `processing`, `completed`, `failed`, `manual` |

### 6.2 Category

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---:|---|
| `id` | UUID | Ja | Primärschlüssel |
| `name` | String | Ja | Eindeutiger Kategoriename |
| `description` | String | Nein | Beschreibung der Kategorie |
| `created_at` | ISO DateTime | Ja | Erstellungszeitpunkt |

### 6.3 NoteCategory

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---:|---|
| `note_id` | UUID | Ja | Verweis auf Note |
| `category_id` | UUID | Ja | Verweis auf Category |

Kombination aus `note_id` und `category_id` muss eindeutig sein.

### 6.4 Tag

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---:|---|
| `id` | UUID | Ja | Primärschlüssel |
| `name` | String | Ja | Tag-Name, möglichst eindeutig |

### 6.5 NoteTag

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---:|---|
| `note_id` | UUID | Ja | Verweis auf Note |
| `tag_id` | UUID | Ja | Verweis auf Tag |

Kombination aus `note_id` und `tag_id` muss eindeutig sein.

### 6.6 Flashcard

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---:|---|
| `id` | UUID | Ja | Primärschlüssel |
| `note_id` | UUID | Ja | Eindeutiger Verweis auf Note |
| `question` | Text | Ja | Frage / Vorderseite |
| `answer` | Text | Ja | Antwort / Rückseite |
| `created_at` | ISO DateTime | Ja | Erstellungszeitpunkt |
| `updated_at` | ISO DateTime | Ja | Letzte Änderung |
| `repetitions` | Integer | Ja | Erfolgreiche Wiederholungen |
| `lapses` | Integer | Ja | Fehlversuche |
| `interval_days` | Float | Ja | Aktuelles Lernintervall |
| `ease_factor` | Float | Ja | Schwierigkeits-/Leichtigkeitsfaktor |
| `review_count` | Integer | Ja | Gesamtzahl der Bewertungen |
| `last_reviewed_at` | ISO DateTime | Nein | Letzte Wiederholung |
| `due_at` | ISO DateTime | Nein | Nächster Fälligkeitszeitpunkt |

Für `Flashcard.note_id` gilt eine Unique-Constraint: pro Notiz maximal eine Lernkarte.

### 6.7 Settings

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---:|---|
| `id` | String | Ja | Einstellungsschlüssel |
| `value` | JSON | Ja | Einstellungswert |

Beispiele: Tageslimit neuer Karten, bevorzugtes Modell, UI-Einstellungen. Den
OpenAI-API-Key nach Möglichkeit nicht in IndexedDB oder im Frontend speichern;
siehe Sicherheit.

## 7. KI-Integration

### 7.1 Aufgabe der KI

Ein leichtgewichtiges OpenAI-Modell soll aus dem Originaltext strukturierte
Metadaten und eine Lernkarte erzeugen. Das Modell muss über Konfiguration
austauschbar sein.

### 7.2 Erwartetes Ausgabeformat

Die KI soll ausschließlich ein valides JSON-Objekt liefern, z. B.:

```json
{
  "title": "Welpen schrittweise an neue Reize gewöhnen",
  "summary": "Welpen sollten neue Umgebungen und Reize schrittweise kennenlernen, um Überforderung zu vermeiden.",
  "categories": [
    {
      "name": "Erziehung",
      "description": "Training, Verhalten und Erziehung"
    },
    {
      "name": "Welpen",
      "description": "Besondere Themen rund um Welpen"
    }
  ],
  "tags": ["Sozialisierung", "Reize", "Training"],
  "flashcard": {
    "question": "Wie sollten Welpen an neue Reize gewöhnt werden?",
    "answer": "Schrittweise und in einem Tempo, das Überforderung vermeidet."
  }
}
```

### 7.3 Prompt-Anforderungen

- Sprache der Ausgabe: Deutsch.
- Titel kurz und konkret, idealerweise maximal 80 Zeichen.
- Zusammenfassung knapp und ohne neue Informationen.
- Mehrere passende Kategorien möglich; keine unnötig spezifischen Kategorien
  erzeugen.
- Vorhandene Kategorien sollen der KI mitgegeben werden, damit sie diese
  bevorzugt wiederverwendet.
- Tags knapp und wiederverwendbar halten.
- Genau eine klare Lernfrage pro Notiz.
- Die Antwort muss ausschließlich durch den übergebenen Notizinhalt gestützt
  sein.
- Keine Fakten hinzuerfinden und keine Unsicherheiten unterschlagen.
- Bei Meinungen oder subjektiven Aussagen diese als solche kennzeichnen.
- Wenn der Inhalt keine sinnvolle Lernfrage zulässt, eine Frage erstellen, die
  den Kern der Notiz wiedergibt, statt externe Fakten zu ergänzen.

### 7.4 Validierung und Fehlerbehandlung

- KI-Antwort serverseitig gegen ein Schema validieren.
- Ungültige oder unvollständige Antworten dürfen nicht die Originalnotiz
  beschädigen.
- Kategorien anhand normalisierter Namen wiederverwenden, um Dubletten zu
  vermeiden.
- API-Fehler mit verständlicher Meldung anzeigen.
- Retry-Funktion anbieten.
- API-Aufrufe mit Timeout und angemessener Fehlerbehandlung versehen.

## 8. Technische Architektur

### 8.1 Empfohlener Stack

| Bereich | Technologie |
|---|---|
| Frontend | Vue 3 |
| Sprache | TypeScript |
| Build-Tool | Vite |
| Styling | Tailwind CSS |
| Routing | Vue Router |
| State Management | Pinia (nur falls benötigt) |
| PWA | Vite PWA Plugin |
| Lokale Persistenz | IndexedDB, z. B. Dexie.js |
| KI-Anbindung | OpenAI API über Backend |
| Backend | Kleine Node.js-/TypeScript-API, z. B. Hono oder Express |
| Hosting | Statisches Frontend plus kleine API oder ein gemeinsamer Node-Host |

### 8.2 Architekturübersicht

```text
Android / Desktop Browser
        |
        v
Vue 3 + Tailwind PWA
        |
        +---- IndexedDB (Dexie)
        |       |
        |       +-- Notes
        |       +-- Categories / Tags
        |       +-- Flashcards
        |       +-- Review history / Settings
        |
        +---- HTTPS API
                  |
                  v
             Backend (Node.js)
                  |
                  +---- OpenAI API
                  |
                  +---- JSON-Schema-Validierung
```

### 8.3 Persistenz

- IndexedDB ist die primäre Datenhaltung im MVP.
- Daten müssen Browser-Neustarts und Smartphone-Neustarts überstehen.
- `localStorage` ist nicht als primäre Datenbank zu verwenden.
- Die App soll offline lesbar und nutzbar sein; KI-Aufbereitung benötigt eine
  Internetverbindung.
- Bei Offline-Erfassung wird die Notiz lokal gespeichert und als
  „KI-Aufbereitung ausstehend“ markiert. Nach Wiederherstellung der Verbindung
  kann die Verarbeitung manuell erneut gestartet werden.
- Service Worker cachen App-Shell und statische Assets.

**Wichtige Einschränkung:** Lokale Browserdaten sind an Browser und Gerät
gebunden. Ohne Backup-/Exportfunktion gibt es keine automatische
Wiederherstellung bei Geräteverlust, Browserdaten-Löschung oder Wechsel auf ein
anderes Gerät. Deshalb sollte das MVP mindestens einen JSON-Export und -Import
aller Daten anbieten.

### 8.4 OpenAI-API-Key und Sicherheit

Der OpenAI-API-Key darf nicht im Vue-Frontend, in ausgelieferten
JavaScript-Dateien oder in IndexedDB gespeichert werden. Ein Key im Browser
wäre für Nutzer bzw. Dritte auslesbar.

Empfohlene Lösung:

- API-Key als Umgebungsvariable im Backend (`OPENAI_API_KEY`).
- Frontend ruft ausschließlich den eigenen Backend-Endpunkt auf.
- Backend ruft OpenAI auf und gibt nur die validierte strukturierte Antwort
  zurück.
- Keine Notizinhalte oder API-Keys unnötig in Logs schreiben.

Falls der Betreiber den eigenen API-Key nicht zentral bereitstellen möchte,
kann später eine sichere Key-Verwaltung ergänzt werden. Für ein privates
Geschenk ist ein serverseitig hinterlegter Key in der Regel die einfachste
Lösung. Die Kosten und Nutzungslimits sollten im Blick behalten werden.

### 8.5 API-Endpunkte (Vorschlag)

| Methode | Pfad | Zweck |
|---|---|---|
| `POST` | `/api/ai/enrich-note` | Titel, Kategorien, Tags und Lernkarte erzeugen |
| `GET` | `/api/health` | Healthcheck |

Die Notizdaten selbst werden im MVP primär lokal verwaltet. Der
Backend-Endpunkt erhält nur den Notizinhalt und die vorhandenen Kategorien, die
zur Wiederverwendung vorgeschlagen werden sollen.

## 9. PWA-Anforderungen

- Web-App-Manifest mit Name, Kurzname, Icons und Theme-Farbe.
- Service Worker für App-Shell-Caching.
- Installierbar über „Zum Startbildschirm hinzufügen“ bzw. den
  Android-Installationsdialog.
- `display: standalone`.
- Responsive Layout für Smartphone und Desktop.
- Sinnvolle Offline-Anzeige.
- Bei neuen App-Versionen kontrolliertes Aktualisieren des Service Workers,
  ohne lokale Nutzerdaten zu löschen.

## 10. Datenschutz und Datenintegrität

- Notizen können persönliche Gedanken enthalten und sind daher vertraulich zu
  behandeln.
- Notizinhalt wird nur zur gewünschten KI-Aufbereitung an den konfigurierten
  KI-Anbieter übertragen.
- Nutzer sollten vor der ersten KI-Verarbeitung transparent darauf hingewiesen
  werden.
- Originalinhalt bleibt getrennt von KI-generierten Feldern erhalten.
- Löschvorgänge müssen abhängige Zuordnungen und Lernkarten konsistent
  behandeln.
- Export/Import muss alle Notizen, Kategorien, Tags, Verknüpfungen, Lernkarten
  und Lernfortschritte umfassen.
- Importierte Daten müssen validiert werden; IDs und Beziehungen müssen
  konsistent bleiben.

## 11. Akzeptanzkriterien

Das MVP gilt als umgesetzt, wenn folgende Abläufe funktionieren:

1. Nutzer kann eine Notiz mit Inhalt und optionaler Quelle erfassen.
2. Notiz wird auch ohne Internetverbindung lokal gespeichert.
3. Bei verfügbarer Verbindung kann die KI-Aufbereitung gestartet werden.
4. Die KI erzeugt einen Titel, mindestens eine passende Kategorie (sofern
sinnvoll), Tags sowie genau eine Frage und Antwort.
5. Nutzer kann KI-Ergebnisse bearbeiten.
6. Kategorien werden wiederverwendet und nicht bei jeder Notiz dupliziert.
7. Notizen erscheinen in allen zugeordneten Sammlungen.
8. Nutzer kann alle Notizen per Text durchsuchen.
9. Nutzer kann eine Lernsession starten und zunächst nur die Frage sehen.
10. Nutzer kann die Antwort aufdecken und die Karte bewerten.
11. Die Bewertung aktualisiert Wiederholungsdaten und nächste Fälligkeit
korrekt.
12. Beim nächsten Öffnen werden fällige Karten entsprechend ihrer Fälligkeit
angezeigt.
13. Daten und Lernfortschritt bleiben nach Browser- und Smartphone-Neustart
erhalten.
14. Die PWA lässt sich auf Android installieren und im Standalone-Modus öffnen.
15. Daten können vollständig exportiert und wieder importiert werden.

## 12. Umsetzungsvorschlag in Etappen

### Etappe 1 – Grundgerüst

- Vue 3, TypeScript, Vite und Tailwind einrichten.
- Navigation und drei Hauptseiten erstellen.
- Warmes Designsystem und responsive Layout umsetzen.
- IndexedDB mit Dexie einrichten.

### Etappe 2 – Manuelle Wissensverwaltung

- Notiz erfassen, bearbeiten und löschen.
- Kategorien und Tags verwalten.
- Sammlungen und Notizdetailansicht.
- Volltextsuche.
- JSON-Export und -Import.

### Etappe 3 – KI-Aufbereitung

- Backend und OpenAI-Anbindung einrichten.
- Prompt und JSON-Schema definieren.
- Titel, Kategorien, Tags und Lernkarte erzeugen.
- Fehlerbehandlung, Retry und manuelle Korrektur.

### Etappe 4 – Lernsystem

- Karteikarten-Ansicht mit verdeckter Antwort.
- Active-Recall-Bewertung.
- Spaced-Repetition-Funktion als isolierte, getestete Domänenlogik.
- Fällige und neue Karten anzeigen.

### Etappe 5 – PWA und Feinschliff

- Manifest, Icons und Service Worker.
- Offline-Verhalten testen.
- Android-Installation testen.
- Bedienbarkeit, Ladezustände und leere Zustände verbessern.

## 13. Hinweise für den KI-Agenten

- Implementiere zuerst ein funktionierendes, kleines MVP statt vorsorglich ein
  großes Framework aufzubauen.
- Gehe bei der Implementierung in Etappen vor und committe deine Änderungen zu
  sinnvollen Zeitpunkten automatisch (git repo ist bereits aufgesetzt).
- Halte UI, Datenzugriff, KI-Integration und Spaced-Repetition-Logik sauber
  getrennt.
- Verwende TypeScript-Typen und Schema-Validierung für KI-Ausgaben.
- Die App muss auch dann benutzbar bleiben, wenn der OpenAI-Dienst nicht
  verfügbar ist.
- Speichere eine Notiz immer vor dem KI-Aufruf.
- Verändere niemals den Originalinhalt durch KI-Aufbereitung.
- Vermeide unnötige Abhängigkeiten und komplexe Infrastruktur.
- Schreibe Tests für Datenmodell, Import/Export und insbesondere die
  Fälligkeitsberechnung.
- Dokumentiere lokale Entwicklungsumgebung, Konfiguration des API-Keys und
  Deployment.
- Verwende keine echten API-Keys im Repository. Stelle eine `.env.example`
  bereit.
- Bei unklaren Details sinnvolle, einfache Defaults wählen und diese in der
  Dokumentation festhalten.
