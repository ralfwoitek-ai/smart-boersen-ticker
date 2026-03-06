# Smart Börsen Ticker – PWA

## Installation auf dem Homescreen

### iOS (iPhone/iPad)
1. `index.html` auf einen Webserver legen (oder lokal via Python hosten)
2. Safari öffnen → URL aufrufen
3. **Teilen** (□↑) → **Zum Home-Bildschirm**
4. App erscheint wie eine native App auf dem Homescreen

### Android
1. Chrome öffnen → URL aufrufen
2. Menü (⋮) → **App installieren** / **Zum Startbildschirm hinzufügen**
3. Fertig – startet ohne Browser-UI

---

## Lokal hosten (Python)

```bash
# Im Ordner der drei Dateien:
python3 -m http.server 8080
# → http://localhost:8080
```

Oder mit Node.js:
```bash
npx serve .
```

---

## Dateien

| Datei | Funktion |
|-------|----------|
| `index.html` | Komplette App (HTML + CSS + JS) |
| `manifest.json` | PWA-Manifest (Name, Icons, Theme) |
| `sw.js` | Service Worker (Offline-Cache) |

---

## API Keys (optional)

Ohne Keys läuft alles über **Yahoo Finance (kostenlos, kein Key nötig)**.

Für bessere Stabilität: in der App unter **⚙️ EINSTELLUNGEN** eintragen:
- **Finnhub**: https://finnhub.io (kostenlos, 60 Req/min)
- **Twelve Data**: https://twelvedata.com (kostenlos, 800 Req/Tag)
- **Alpha Vantage**: https://alphavantage.co (kostenlos, 25 Req/Tag)

Keys werden lokal im Browser gespeichert (localStorage).

---

## Features

- 📈 **Live-Kurse** – Aktien, Krypto, Forex via Yahoo Finance + Fallback-APIs
- 🔍 **Kauf-Scanner** – DAX (28 Titel) + ETFs (7 Titel), RSI + MA + Slope-Analyse
- 📊 **Sparkline-Charts** – Preisverlauf der letzten 60 Datenpunkte
- 🔔 **Signal-Engine** – KAUFEN / BEACHTEN / NEUTRAL / VORSICHT / VERKAUFEN
- ⚙️ **Einstellungen** – Ticker-Liste, API-Keys, Scanner-Konfiguration
- 📴 **Offline-fähig** – App-Shell bleibt via Service Worker verfügbar
- 🌙 **Handelsfenster** – Automatische Pause außerhalb 10:00–22:00 Uhr

---

## Wichtige Hinweise

**CORS-Proxy**: Yahoo Finance wird über `api.allorigins.win` proxied (nötig im Browser).
Für Produktion empfehle ich einen eigenen kleinen Backend-Proxy (z.B. Python Flask, Node Express).

**Keine Finanzberatung** – dieses Tool dient nur zur Information.
