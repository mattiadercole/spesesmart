# SpeseSmart 🚀 (Google Drive Sync Edition)

App web progressiva (PWA) moderna, fluida e sicura per il tracciamento delle spese e del portafoglio investimenti, con **archiviazione diretta e riservata sul Google Drive personale dell'utente** (tramite Google Sheets).

---

## 🌟 Caratteristiche Principali

- **🔒 Zero Database Nostro / 100% Privacy:** Tutti i dati dell'utente vengono salvati solo ed esclusivamente in un foglio Google Sheet (`SpeseSmart_Data.sheets`) creato nel suo Google Drive personale.
- **📱 PWA per iPhone & Desktop:** Installabile su iPhone tramite Safari (*"Aggiungi alla schermata Home"*) a schermo intero senza barre del browser.
- **⚡ Safe to Spend Giornaliero & Saldo Residuo:** Monitoraggio a colpo d'occhio di quanto puoi spendere oggi per rimanere in budget.
- **⚡ Quick-Add in 2 Tocchi:** Registrazione istantanea di caffè, pranzo, benzina e spesa in meno di 3 secondi.
- **📈 Portafoglio Investimenti & Net Worth:** Quotazioni di mercato in tempo reale sfruttando nativamente la formula `=GOOGLEFINANCE()` di Google Sheets.
- **📥 Import Estratto Conto (CSV):** Riconoscimento automatico causali bancarie (Conad, Eni, Netflix, Stipendio, ecc.) con auto-categorizzazione.
- **🕶️ Modalità in Pubblico:** Sfocatura istantanea di tutti i valori sensibili con un solo tocco sull'icona a occhio.

---

## 🚀 1. Come Testare l'App Subito in Locale

Puoi avviare un server locale leggero direttamente da questa cartella:

```bash
cd /home/antigravity/spesesmart-app
npx serve .
```

Apri il browser su `http://localhost:3000`. L'app è già funzionante e memorizza i dati localmente anche prima di configurare Google.

---

## 🔑 2. Come Configurare Google Drive & Google Sheets (Gratuito in 2 Minuti)

Per permettere all'app di creare e aggiornare il foglio Google Sheet nel Drive di chi accede:

1. Vai su [Google Cloud Console](https://console.cloud.google.com/) ed esegui l'accesso con il tuo account Google.
2. Clicca su **"Seleziona un progetto"** in alto a sinistra e poi su **"Nuovo progetto"** (chiamalo ad esempio `SpeseSmart`).
3. Nel menu laterale sinistro vai su **API e servizi** -> **Libreria**:
   - Cerca **"Google Drive API"** e clicca su **Abilita**.
   - Cerca **"Google Sheets API"** e clicca su **Abilita**.
4. Vai su **API e servizi** -> **Schermata consenso OAuth**:
   - Scegli **Esterno** (External) e clicca *Crea*.
   - Inserisci il nome app (*SpeseSmart*) e la tua email.
   - Nella schermata *Ambiti (Scopes)*, aggiungi:
     `.../auth/drive.file` e `.../auth/spreadsheets`
5. Vai su **Credenziali** -> **Crea credenziali** -> **ID client OAuth**:
   - Tipo applicazione: **Applicazione Web**.
   - In **Origini JavaScript autorizzate**, aggiungi l'indirizzo dove gira l'app (es. `http://localhost:3000` o l'URL Vercel/Netlify `https://tua-app.vercel.app`).
   - Clicca su **Crea** e copia il tuo **Client ID** (termina con `.apps.googleusercontent.com`).
6. Nell'app clicca su **Google Drive Sync** in alto a destra, incolla il tuo Client ID e premi **Salva**!

---

## 🌐 3. Come Pubblicare l'App Online Gratis (per te e i tuoi amici)

### Opzione A: Con Vercel (Consigliata - 1 Clic)
1. Crea un account gratuito su [Vercel.com](https://vercel.com).
2. Trascina l'intera cartella `spesesmart-app` oppure collega la repository GitHub.
3. Clicca su **Deploy**. In 15 secondi avrai un link pubblico HTTPS (es. `https://spesesmart.vercel.app`).

### Opzione B: Con Netlify Drop
1. Vai su [app.netlify.com/drop](https://app.netlify.com/drop).
2. Trascina la cartella `spesesmart-app`.
3. Il sito sarà immediatamente online e funzionante!

---

## 📲 4. Come Installarla su iPhone (per i tuoi amici)

1. Apri il link dell'app su **Safari** da iPhone.
2. Tocca l'icona di **Condivisione** in basso al centro (il quadrato con la freccia verso l'alto).
3. Scorri e tocca **"Aggiungi alla schermata Home"**.
4. Tocca **"Aggiungi"** in alto a destra.

L'icona di SpeseSmart apparirà sulla schermata principale dell'iPhone e si aprirà a schermo intero come una vera app nativa!
