
# 🌾 AgroTrend Arvaia: Analisi Raccolta 2025

Una dashboard avanzata per la visualizzazione e l'analisi dei dati di raccolta dei prodotti agricoli della cooperativa Arvaia per l'anno 2025, con focus sulla correlazione climatica.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Funzionalità

- **Visualizzazione Dinamica**: Grafici interattivi (Recharts) che mostrano la resa settimanale per ogni prodotto.
- **Analisi Climatica**: Grafici a linee per le temperature e a barre per le precipitazioni, con evidenziazione automatica dei periodi di raccolta.
- **Filtri Avanzati**: Ricerca per prodotto specifico o per singola settimana dell'anno.
- **Dettaglio Settimanale**: Tabella analitica che mostra l'incidenza percentuale del raccolto settimanale rispetto al totale annuo.
- **AI Insights**: Integrazione con Google Gemini API per l'analisi dei trend agricoli (richiede API Key).

## 🚀 Come iniziare

### Prerequisiti
- Un browser moderno.
- (Opzionale) Node.js per lo sviluppo locale.

### Installazione Locale
1. Clona il repository:
   ```bash
   git clone https://github.com/TUO_UTENTE/arvaia-raccolta.git
   cd arvaia-raccolta
   ```
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Avvia l'ambiente di sviluppo:
   ```bash
   npm run dev
   ```

## 📊 Struttura dei Dati
Il sistema legge dati in formato TSV (Tab-Separated Values) situati in `constants/rawData.ts`. I campi supportati includono:
- Data, Prodotto, Peso (Kg), Settimana, Temperatura (Min/Med/Max) e Precipitazioni.

---
*Progetto sviluppato per supportare la trasparenza e l'analisi dei dati agricoli della comunità Arvaia.*
