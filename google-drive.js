/**
 * Google Drive & Google Sheets Integration Module
 * Uses Google Identity Services (GIS) and Google Sheets API v4.
 * Scope: https://www.googleapis.com/auth/drive.file (Restricted to files created by this app)
 */

const GOOGLE_CONFIG = {
  // Configura qui il tuo Client ID ottenuto da Google Cloud Console
  clientId: localStorage.getItem('spesesmart_google_client_id') || '',
  scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
  spreadsheetName: 'SpeseSmart_Data'
};

let tokenClient = null;
let accessToken = localStorage.getItem('spesesmart_drive_token') || null;
let spreadsheetId = localStorage.getItem('spesesmart_spreadsheet_id') || null;

export const GoogleDriveService = {
  getClientId() {
    return GOOGLE_CONFIG.clientId;
  },

  setClientId(newId) {
    GOOGLE_CONFIG.clientId = newId.trim();
    localStorage.setItem('spesesmart_google_client_id', newId.trim());
  },

  isConnected() {
    return !!accessToken;
  },

  getSpreadsheetId() {
    return spreadsheetId;
  },

  initGIS() {
    return new Promise((resolve) => {
      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        console.warn('Google Identity Services SDK non caricato.');
        resolve(false);
        return;
      }

      if (!GOOGLE_CONFIG.clientId) {
        console.info('Nessun Google Client ID configurato. L\'app userà la persistenza locale.');
        resolve(false);
        return;
      }

      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.clientId,
        scope: GOOGLE_CONFIG.scopes,
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            console.error('Errore durante autenticazione Google:', tokenResponse);
            return;
          }
          accessToken = tokenResponse.access_token;
          localStorage.setItem('spesesmart_drive_token', accessToken);
          await this.ensureSpreadsheet();
          window.dispatchEvent(new CustomEvent('googledrive:connected', { detail: { token: accessToken } }));
        }
      });
      resolve(true);
    });
  },

  signIn() {
    if (!tokenClient) {
      if (!GOOGLE_CONFIG.clientId) {
        throw new Error('Inserisci prima il tuo Google Client ID nelle impostazioni.');
      }
      return this.initGIS().then(() => {
        if (tokenClient) tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    }
    tokenClient.requestAccessToken({ prompt: '' });
  },

  signOut() {
    if (accessToken && window.google?.accounts?.oauth2?.revoke) {
      window.google.accounts.oauth2.revoke(accessToken, () => {});
    }
    accessToken = null;
    spreadsheetId = null;
    localStorage.removeItem('spesesmart_drive_token');
    localStorage.removeItem('spesesmart_spreadsheet_id');
    window.dispatchEvent(new CustomEvent('googledrive:disconnected'));
  },

  // Controlla o crea il file SpeseSmart_Data su Google Drive
  async ensureSpreadsheet() {
    if (!accessToken) return null;

    if (spreadsheetId) {
      // Verifica se il file esiste ancora
      try {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}?fields=id,name,trashed`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const file = await res.json();
        if (file && !file.trashed && file.name === GOOGLE_CONFIG.spreadsheetName) {
          return spreadsheetId;
        }
      } catch (e) {
        console.warn('Controllo spreadsheet esistente fallito, cerco su Drive...', e);
      }
    }

    // Cerca se esiste già sul Drive dell'utente
    try {
      const q = encodeURIComponent(`name = '${GOOGLE_CONFIG.spreadsheetName}' and mimeType = 'application/vnd.google.apps.spreadsheet' and trashed = false`);
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        spreadsheetId = searchData.files[0].id;
        localStorage.setItem('spesesmart_spreadsheet_id', spreadsheetId);
        return spreadsheetId;
      }
    } catch (err) {
      console.error('Errore ricerca file su Drive:', err);
    }

    // Se non esiste, crea un nuovo Google Sheet con i 4 fogli predefiniti
    try {
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: { title: GOOGLE_CONFIG.spreadsheetName },
          sheets: [
            { properties: { title: 'Transazioni' } },
            { properties: { title: 'Categorie' } },
            { properties: { title: 'Investimenti' } },
            { properties: { title: 'RegoleFisse' } }
          ]
        })
      });
      const newSheet = await createRes.json();
      spreadsheetId = newSheet.spreadsheetId;
      localStorage.setItem('spesesmart_spreadsheet_id', spreadsheetId);

      // Inizializza intestazioni colonne
      await this.initHeaders();
      return spreadsheetId;
    } catch (err) {
      console.error('Errore creazione nuovo Google Sheet:', err);
      return null;
    }
  },

  async initHeaders() {
    if (!accessToken || !spreadsheetId) return;

    const headerData = [
      { range: 'Transazioni!A1:G1', values: [['ID', 'Data', 'Tipo', 'Categoria', 'Importo', 'Nota', 'Ricorrente']] },
      { range: 'Categorie!A1:D1', values: [['Nome', 'Tipo', 'Icona', 'Colore']] },
      { range: 'Investimenti!A1:G1', values: [['ID', 'Nome', 'Ticker', 'Tipo', 'Quantita', 'PrezzoCarico', 'FormulaGoogleFinance']] },
      { range: 'RegoleFisse!A1:F1', values: [['ID', 'Descrizione', 'Tipo', 'Importo', 'Categoria', 'GiornoMese']] }
    ];

    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: headerData
        })
      });
    } catch (e) {
      console.error('Errore intestazioni fogli:', e);
    }
  },

  // Sincronizza l'intero stato su Google Sheets
  async syncAllData(state) {
    if (!accessToken || !spreadsheetId) return false;

    try {
      // 1. Righe Transazioni
      const txRows = [
        ['ID', 'Data', 'Tipo', 'Categoria', 'Importo', 'Nota', 'Ricorrente'],
        ...state.transactions.map(t => [t.id, t.date, t.type, t.category, t.amount, t.note || '', t.recurring ? 'SI' : 'NO'])
      ];

      // 2. Righe Categorie
      const allCats = [...state.categories.expense, ...state.categories.income];
      const catRows = [
        ['Nome', 'Tipo', 'Icona', 'Colore'],
        ...state.categories.expense.map(c => [c.name, 'expense', c.icon, c.color]),
        ...state.categories.income.map(c => [c.name, 'income', c.icon, c.color])
      ];

      // 3. Righe Investimenti (Con formula Google Finance reale!)
      const invRows = [
        ['ID', 'Nome', 'Ticker', 'Tipo', 'Quantita', 'PrezzoCarico', 'FormulaGoogleFinance'],
        ...state.investments.map((a, idx) => [
          a.id,
          a.name,
          a.ticker,
          a.type,
          a.quantity,
          a.buyPrice,
          `=IFERROR(GOOGLEFINANCE("${a.ticker}", "price"), ${a.currentPrice})`
        ])
      ];

      const batchData = [
        { range: 'Transazioni!A1:G' + txRows.length, values: txRows },
        { range: 'Categorie!A1:D' + catRows.length, values: catRows },
        { range: 'Investimenti!A1:G' + invRows.length, values: invRows }
      ];

      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: batchData
        })
      });

      return res.ok;
    } catch (err) {
      console.error('Errore sincronizzazione con Google Sheets:', err);
      return false;
    }
  }
};
