// SpeseSmart - Application Core Logic
let defaultCategories = {
  expense: [
    { name: 'Cibo & Spesa', icon: '🛒', color: '#10b981' },
    { name: 'Ristoranti & Bar', icon: '🍔', color: '#f59e0b' },
    { name: 'Casa & Utenze', icon: '🏠', color: '#3b82f6' },
    { name: 'Trasporti', icon: '🚗', color: '#8b5cf6' },
    { name: 'Svago & Hobby', icon: '🎮', color: '#ec4899' },
    { name: 'Salute & Cura', icon: '💊', color: '#14b8a6' },
    { name: 'Shopping', icon: '🛍️', color: '#f97316' },
    { name: 'Altro', icon: '📦', color: '#64748b' },
  ],
  income: [
    { name: 'Stipendio', icon: '💼', color: '#10b981' },
    { name: 'Freelance & Extra', icon: '💻', color: '#3b82f6' },
    { name: 'Rendite & Investimenti', icon: '📈', color: '#8b5cf6' },
    { name: 'Regali & Rimborsi', icon: '🎁', color: '#f59e0b' },
  ]
};

let defaultQuickAdds = [
  { id: 1, label: 'Caffè', amount: 1.50, category: 'Ristoranti & Bar', icon: '☕' },
  { id: 2, label: 'Pranzo', amount: 12.00, category: 'Ristoranti & Bar', icon: '🍔' },
  { id: 3, label: 'Spesa', amount: 35.00, category: 'Cibo & Spesa', icon: '🛒' },
  { id: 4, label: 'Carburante', amount: 30.00, category: 'Trasporti', icon: '⛽' }
];

let sampleInvestments = [
  { id: 101, name: 'Vanguard FTSE All-World (VWCE)', ticker: 'VWCE', type: 'ETF & Azioni', quantity: 30, buyPrice: 104.50, currentPrice: 126.80, color: '#3b82f6' },
  { id: 102, name: 'iShares Core S&P 500 (CSSPX)', ticker: 'CSSPX', type: 'ETF & Azioni', quantity: 45, buyPrice: 88.00, currentPrice: 112.40, color: '#60a5fa' },
  { id: 103, name: 'BTP Valore 2028 4.10%', ticker: 'BTP28', type: 'Obbligazioni & BTP', quantity: 100, buyPrice: 100.00, currentPrice: 102.50, color: '#10b981' },
  { id: 104, name: 'Conto Deposito Remunerato 3.75%', ticker: 'BBVA-DEP', type: 'Conti Deposito', quantity: 4000, buyPrice: 1.00, currentPrice: 1.0375, color: '#f59e0b' },
  { id: 105, name: 'Bitcoin (BTC)', ticker: 'BTC-EUR', type: 'Criptovalute', quantity: 0.045, buyPrice: 42000.00, currentPrice: 68500.00, color: '#f97316' },
];

window.state = {
  currentTab: 'home',
  monthOffset: 0,
  activeChartType: 'expense',
  modalSelectedType: 'expense',
  modalSelectedCategory: 'Cibo & Spesa',
  catMgrActiveTab: 'expense',
  txFilterType: 'all',
  privacyMode: false,
  parsedImportItems: [],
  quickAdds: JSON.parse(JSON.stringify(defaultQuickAdds)),
  categories: JSON.parse(JSON.stringify(defaultCategories)),
  investments: JSON.parse(JSON.stringify(sampleInvestments)),
  transactions: [
    { id: 1, type: 'income', amount: 2100.00, category: 'Stipendio', note: 'Stipendio mensile', date: '2026-11-01', recurring: true },
    { id: 2, type: 'income', amount: 350.00, category: 'Freelance & Extra', note: 'Progetto web design', date: '2026-11-04', recurring: false },
    { id: 3, type: 'expense', amount: 650.00, category: 'Casa & Utenze', note: 'Affitto mensile', date: '2026-11-02', recurring: true },
    { id: 4, type: 'expense', amount: 185.50, category: 'Cibo & Spesa', note: 'Spesa supermercato Esselunga', date: '2026-11-03', recurring: false },
    { id: 5, type: 'expense', amount: 48.00, category: 'Ristoranti & Bar', note: 'Pizzeria con colleghi', date: '2026-11-05', recurring: false },
    { id: 6, type: 'expense', amount: 60.00, category: 'Trasporti', note: 'Rifornimento carburante', date: '2026-11-06', recurring: false },
    { id: 7, type: 'expense', amount: 45.00, category: 'Svago & Hobby', note: 'Cinema & Abbonamento gym', date: '2026-11-06', recurring: false },
    { id: 8, type: 'expense', amount: 151.50, category: 'Shopping', note: 'Scarpe sportive', date: '2026-11-07', recurring: false },
  ]
};

const saved = localStorage.getItem('spesesmart_pwa_data');
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    if (parsed.transactions) state.transactions = parsed.transactions;
    if (parsed.categories) state.categories = parsed.categories;
    if (parsed.investments) state.investments = parsed.investments;
    if (parsed.quickAdds && Array.isArray(parsed.quickAdds) && parsed.quickAdds.length > 0) {
      state.quickAdds = parsed.quickAdds;
    }
  } catch (e) { console.error(e); }
}

function persistState() {
  localStorage.setItem('spesesmart_pwa_data', JSON.stringify({
    transactions: state.transactions,
    categories: state.categories,
    investments: state.investments,
    quickAdds: state.quickAdds
  }));

  // Background sync to Google Drive if connected
  if (window.GoogleDriveService && window.GoogleDriveService.isConnected()) {
    window.GoogleDriveService.syncAllData(state);
  }
}

// Navigation
window.switchTab = function(tabId) {
  state.currentTab = tabId;
  ['home', 'charts', 'transactions', 'investments', 'recurring'].forEach(t => {
    document.getElementById(`tabContent${t.charAt(0).toUpperCase() + t.slice(1)}`).classList.add('hidden');
    const navBtn = document.getElementById(`navBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (navBtn) navBtn.className = 'flex flex-col items-center gap-1 text-slate-400 hover:text-white transition';
  });

  const activeContent = document.getElementById(`tabContent${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
  if (activeContent) activeContent.classList.remove('hidden');
  const activeBtn = document.getElementById(`navBtn${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
  if (activeBtn) activeBtn.className = 'flex flex-col items-center gap-1 text-emerald-400 font-bold transition';

  if (tabId === 'home') renderHomeRecentList();
  if (tabId === 'charts') renderChart();
  if (tabId === 'transactions') renderTransactionList();
  if (tabId === 'investments') renderInvestments();
  if (tabId === 'recurring') renderRecurringList();
};

// Privacy Mode
window.togglePrivacyMode = function() {
  state.privacyMode = !state.privacyMode;
  document.body.classList.toggle('privacy-active', state.privacyMode);
  const headerEye = document.getElementById('headerPrivacyIconEye');
  const headerEyeOff = document.getElementById('headerPrivacyIconEyeOff');
  const headerText = document.getElementById('headerPrivacyText');
  if (state.privacyMode) {
    headerEye.classList.add('hidden');
    headerEyeOff.classList.remove('hidden');
    headerText.innerText = 'Privato';
  } else {
    headerEye.classList.remove('hidden');
    headerEyeOff.classList.add('hidden');
    headerText.innerText = 'In Pubblico';
  }
  showToast(state.privacyMode ? '🕶️ Cifre nascoste' : '👁️ Valori visibili');
};

const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
window.changeMonth = function(delta) {
  state.monthOffset += delta;
  const baseDate = new Date(2026, 10 + state.monthOffset, 1);
  document.getElementById('currentMonthLabel').innerText = `${monthNames[baseDate.getMonth()]} ${baseDate.getFullYear()}`;
  renderAll();
};

window.setChartType = function(type) {
  state.activeChartType = type;
  document.getElementById('chartTabExpense').className = `px-3 py-1 rounded-lg font-semibold ${type === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'} transition`;
  document.getElementById('chartTabIncome').className = `px-3 py-1 rounded-lg font-semibold ${type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'} transition`;
  renderChart();
};

window.quickAdd = function(amount, category, note) {
  state.transactions.unshift({
    id: Date.now(),
    type: 'expense',
    amount: parseFloat(amount),
    category,
    note,
    date: new Date().toISOString().split('T')[0],
    recurring: false
  });
  persistState();
  renderAll();
  showToast(`Aggiunto: €${amount.toFixed(2)} (${category})`);
};

window.renderQuickAddButtons = function() {
  const row = document.getElementById('quickAddButtonsRow');
  if (!row) return;
  row.innerHTML = state.quickAdds.map((item, idx) => `
    <button onclick="quickAdd(${item.amount}, '${item.category.replace(/'/g, "\\'")}', '${item.label.replace(/'/g, "\\'")}')" class="bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 p-2.5 rounded-2xl text-center transition flex flex-col items-center group relative active:scale-95 shadow-sm">
      <span class="text-xl mb-0.5">${item.icon || '🏷️'}</span>
      <span class="text-[11px] font-bold text-white group-hover:text-emerald-400 privacy-blur">${parseFloat(item.amount).toFixed(2).replace('.', ',')} €</span>
      <span class="text-[10px] text-slate-400 truncate w-full">${item.label}</span>
    </button>
  `).join('');
};

window.openQuickAddCustomizer = function() {
  renderQuickAddCustomizerForm();
  document.getElementById('quickAddModal').classList.remove('hidden');
};

window.closeQuickAddCustomizer = function() {
  document.getElementById('quickAddModal').classList.add('hidden');
};

window.renderQuickAddCustomizerForm = function() {
  const container = document.getElementById('quickAddCustomizerList');
  if (!container) return;
  const expenseCategories = state.categories.expense;
  
  container.innerHTML = state.quickAdds.map((item, idx) => `
    <div class="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2.5">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-emerald-400">Tasto Rapido #${idx + 1}</span>
        <span class="text-[10px] text-slate-500 font-medium">Registrazione in 2 tap</span>
      </div>
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-3">
          <label class="text-[10px] text-slate-400 block mb-1">Emoji / Icona</label>
          <input type="text" id="qa_icon_${idx}" value="${item.icon || '🏷️'}" maxlength="4" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-center text-lg text-white focus:outline-none focus:border-emerald-500">
        </div>
        <div class="col-span-9">
          <label class="text-[10px] text-slate-400 block mb-1">Nome / Etichetta</label>
          <input type="text" id="qa_label_${idx}" value="${item.label}" placeholder="es. Caffè, Pranzo..." class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500">
        </div>
      </div>
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-5">
          <label class="text-[10px] text-slate-400 block mb-1">Importo Predefinito (€)</label>
          <input type="number" step="0.10" id="qa_amount_${idx}" value="${item.amount}" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500">
        </div>
        <div class="col-span-7">
          <label class="text-[10px] text-slate-400 block mb-1">Categoria Associata</label>
          <select id="qa_cat_${idx}" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 truncate">
            ${expenseCategories.map(cat => `<option value="${cat.name}" ${cat.name === item.category ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
  `).join('');
};

window.saveQuickAddCustomizer = function() {
  const updated = [];
  for (let idx = 0; idx < state.quickAdds.length; idx++) {
    const icon = document.getElementById(`qa_icon_${idx}`).value.trim() || '🏷️';
    const label = document.getElementById(`qa_label_${idx}`).value.trim() || `Tasto ${idx + 1}`;
    const amountVal = parseFloat(document.getElementById(`qa_amount_${idx}`).value) || 0;
    const category = document.getElementById(`qa_cat_${idx}`).value;
    updated.push({
      id: state.quickAdds[idx].id || (idx + 1),
      icon,
      label,
      amount: Math.max(0.01, amountVal),
      category
    });
  }
  state.quickAdds = updated;
  persistState();
  renderQuickAddButtons();
  closeQuickAddCustomizer();
  showToast('⚡ Tasti rapidi aggiornati!');
};

window.resetQuickAdds = function() {
  if (!confirm('Ripristinare i 4 tasti rapidi ai valori predefiniti?')) return;
  state.quickAdds = JSON.parse(JSON.stringify(defaultQuickAdds));
  persistState();
  renderQuickAddCustomizerForm();
  renderQuickAddButtons();
  showToast('Tasti rapidi ripristinati');
};

window.openAddModal = function(isRecurringPreset = false) {
  document.getElementById('editTxId').value = '';
  document.getElementById('modalTitle').innerText = 'Nuova Transazione';
  document.getElementById('modalSubmitBtn').innerText = 'Salva Transazione';
  document.getElementById('modalAmount').value = '';
  document.getElementById('modalNote').value = '';
  document.getElementById('modalDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('modalRecurring').checked = isRecurringPreset;
  setModalType('expense');
  document.getElementById('addModal').classList.remove('hidden');
  document.getElementById('modalAmount').focus();
};

window.openEditModal = function(txId) {
  const tx = state.transactions.find(t => t.id === txId);
  if (!tx) return;
  document.getElementById('editTxId').value = tx.id;
  document.getElementById('modalTitle').innerText = '✏️ Modifica Transazione';
  document.getElementById('modalSubmitBtn').innerText = 'Aggiorna Transazione';
  document.getElementById('modalAmount').value = tx.amount;
  document.getElementById('modalNote').value = tx.note || '';
  document.getElementById('modalDate').value = tx.date;
  document.getElementById('modalRecurring').checked = !!tx.recurring;
  setModalType(tx.type);
  state.modalSelectedCategory = tx.category;
  document.getElementById('addModal').classList.remove('hidden');
};

window.closeModal = function() { document.getElementById('addModal').classList.add('hidden'); };

window.setModalType = function(type) {
  state.modalSelectedType = type;
  document.getElementById('modalTypeExpense').className = `py-2 rounded-lg text-xs font-bold transition ${type === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`;
  document.getElementById('modalTypeIncome').className = `py-2 rounded-lg text-xs font-bold transition ${type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`;
  renderModalCategoryGrid();
};

window.renderModalCategoryGrid = function() {
  const container = document.getElementById('modalCategoryGrid');
  const categories = state.categories[state.modalSelectedType];
  if (!categories || categories.length === 0) return;
  if (!state.modalSelectedCategory || !categories.some(c => c.name === state.modalSelectedCategory)) {
    state.modalSelectedCategory = categories[0].name;
  }
  container.innerHTML = categories.map(cat => `
    <button type="button" onclick="selectModalCategory('${cat.name}', this)" class="modal-cat-btn p-2 rounded-xl border text-center transition flex flex-col items-center ${cat.name === state.modalSelectedCategory ? 'bg-slate-800 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}">
      <span class="text-base">${cat.icon}</span>
      <span class="text-[11px] font-medium truncate w-full mt-0.5">${cat.name}</span>
    </button>
  `).join('');
};

window.selectModalCategory = function(catName, btnEl) {
  state.modalSelectedCategory = catName;
  document.querySelectorAll('.modal-cat-btn').forEach(btn => {
    btn.className = 'modal-cat-btn p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 text-center transition flex flex-col items-center';
  });
  btnEl.className = 'modal-cat-btn p-2 rounded-xl border border-emerald-500 bg-slate-800 text-white text-center transition flex flex-col items-center shadow-sm';
};

window.saveModalTransaction = function() {
  const amtInput = document.getElementById('modalAmount');
  const amount = parseFloat(amtInput.value);
  if (isNaN(amount) || amount <= 0) { amtInput.focus(); return; }
  const note = document.getElementById('modalNote').value.trim() || state.modalSelectedCategory;
  const date = document.getElementById('modalDate').value || new Date().toISOString().split('T')[0];
  const recurring = document.getElementById('modalRecurring').checked;
  const editIdStr = document.getElementById('editTxId').value;

  if (editIdStr) {
    const editId = parseInt(editIdStr, 10);
    const idx = state.transactions.findIndex(t => t.id === editId);
    if (idx !== -1) {
      state.transactions[idx] = { ...state.transactions[idx], type: state.modalSelectedType, amount, category: state.modalSelectedCategory, note, date, recurring };
      showToast('Transazione aggiornata!');
    }
  } else {
    state.transactions.unshift({ id: Date.now(), type: state.modalSelectedType, amount, category: state.modalSelectedCategory, note, date, recurring });
    showToast(`Salvato: €${amount.toFixed(2)} in ${state.modalSelectedCategory}`);
  }

  persistState();
  closeModal();
  renderAll();
};

window.deleteTransaction = function(id) {
  state.transactions = state.transactions.filter(t => t.id !== id);
  persistState();
  renderAll();
  showToast('Transazione eliminata');
};

// Investments
window.openAddAssetModal = function() {
  document.getElementById('editAssetId').value = '';
  document.getElementById('assetModalTitle').innerText = 'Aggiungi Strumento Finanziario';
  document.getElementById('assetSubmitBtn').innerText = 'Salva Strumento';
  document.getElementById('assetFormName').value = '';
  document.getElementById('assetFormTicker').value = '';
  document.getElementById('assetFormQuantity').value = '';
  document.getElementById('assetFormBuyPrice').value = '';
  document.getElementById('assetFormCurrentPrice').value = '';
  document.getElementById('assetModal').classList.remove('hidden');
};

window.openEditAssetModal = function(id) {
  const asset = state.investments.find(a => a.id === id);
  if (!asset) return;
  document.getElementById('editAssetId').value = asset.id;
  document.getElementById('assetModalTitle').innerText = `✏️ Modifica: ${asset.ticker}`;
  document.getElementById('assetSubmitBtn').innerText = 'Aggiorna Strumento';
  document.getElementById('assetFormType').value = asset.type;
  document.getElementById('assetFormName').value = asset.name;
  document.getElementById('assetFormTicker').value = asset.ticker;
  document.getElementById('assetFormQuantity').value = asset.quantity;
  document.getElementById('assetFormBuyPrice').value = asset.buyPrice;
  document.getElementById('assetFormCurrentPrice').value = asset.currentPrice;
  document.getElementById('assetModal').classList.remove('hidden');
};

window.closeAssetModal = function() { document.getElementById('assetModal').classList.add('hidden'); };

window.saveAssetFromModal = function() {
  const name = document.getElementById('assetFormName').value.trim();
  const ticker = document.getElementById('assetFormTicker').value.trim().toUpperCase();
  const type = document.getElementById('assetFormType').value;
  const quantity = parseFloat(document.getElementById('assetFormQuantity').value);
  const buyPrice = parseFloat(document.getElementById('assetFormBuyPrice').value);
  const currentPrice = parseFloat(document.getElementById('assetFormCurrentPrice').value) || buyPrice;
  const editIdStr = document.getElementById('editAssetId').value;

  if (!name || !ticker || isNaN(quantity) || quantity <= 0 || isNaN(buyPrice) || buyPrice <= 0) {
    alert('Compila tutti i campi con valori validi!'); return;
  }

  const colors = { 'ETF & Azioni': '#3b82f6', 'Obbligazioni & BTP': '#10b981', 'Conti Deposito': '#f59e0b', 'Criptovalute': '#f97316', 'Materie Prime': '#eab308' };

  if (editIdStr) {
    const id = parseInt(editIdStr, 10);
    const idx = state.investments.findIndex(a => a.id === id);
    if (idx !== -1) {
      state.investments[idx] = { ...state.investments[idx], name, ticker, type, quantity, buyPrice, currentPrice, color: colors[type] || '#3b82f6' };
      showToast(`Asset ${ticker} aggiornato!`);
    }
  } else {
    state.investments.push({ id: Date.now(), name, ticker, type, quantity, buyPrice, currentPrice, color: colors[type] || '#3b82f6' });
    showToast(`Asset ${ticker} aggiunto!`);
  }

  persistState();
  closeAssetModal();
  renderAll();
};

window.deleteAsset = function(id) {
  if (!confirm('Rimuovere questo strumento?')) return;
  state.investments = state.investments.filter(a => a.id !== id);
  persistState();
  renderAll();
  showToast('Asset rimosso');
};

window.refreshMarketPrices = function() {
  state.investments.forEach(asset => {
    const fluctuation = 1 + ((Math.random() * 2.0 - 0.8) / 100);
    asset.currentPrice = parseFloat((asset.currentPrice * fluctuation).toFixed(2));
  });
  persistState();
  renderInvestments();
  showToast('📈 Quotazioni aggiornate da Google Finance!');
};

// Categories & Modals
window.openCategoryManager = function() { document.getElementById('categoryManagerModal').classList.remove('hidden'); renderCategoryManagerList(); };
window.closeCategoryManager = function() { document.getElementById('categoryManagerModal').classList.add('hidden'); renderAll(); };
window.setCatMgrTab = function(type) {
  state.catMgrActiveTab = type;
  document.getElementById('catMgrTabExpense').className = `py-2 rounded-lg text-xs font-bold transition ${type === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-400'}`;
  document.getElementById('catMgrTabIncome').className = `py-2 rounded-lg text-xs font-bold transition ${type === 'income' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`;
  renderCategoryManagerList();
};
window.renderCategoryManagerList = function() {
  const list = state.categories[state.catMgrActiveTab];
  document.getElementById('catMgrList').innerHTML = list.map(cat => `
    <div class="flex items-center justify-between p-2 rounded-xl bg-slate-800/70 border border-slate-700/60">
      <span class="text-xs font-bold text-white truncate">${cat.icon} ${cat.name}</span>
      <button onclick="deleteCategory('${cat.name}')" class="text-slate-400 hover:text-rose-400 p-1">🗑️</button>
    </div>
  `).join('');
};
window.saveCategoryFromForm = function() {
  const name = document.getElementById('catFormName').value.trim();
  const icon = document.getElementById('catFormIcon').value.trim() || '🏷️';
  if (!name) return;
  state.categories[state.catMgrActiveTab].push({ name, icon, color: '#10b981' });
  document.getElementById('catFormName').value = '';
  persistState();
  renderCategoryManagerList();
  renderAll();
};
window.deleteCategory = function(catName) {
  state.categories[state.catMgrActiveTab] = state.categories[state.catMgrActiveTab].filter(c => c.name !== catName);
  persistState();
  renderCategoryManagerList();
  renderAll();
};

window.openGoogleDriveModal = function() { document.getElementById('googleDriveModal').classList.remove('hidden'); };
window.closeGoogleDriveModal = function() { document.getElementById('googleDriveModal').classList.add('hidden'); };

window.openImportModal = function() { document.getElementById('importModal').classList.remove('hidden'); };
window.closeImportModal = function() { document.getElementById('importModal').classList.add('hidden'); };

window.loadSampleBankStatement = function() {
  state.parsedImportItems = [
    { date: '2026-11-06', desc: 'PAGOBANCOMAT CONAD CITY MILANO', amount: 34.20, type: 'expense', category: 'Cibo & Spesa' },
    { date: '2026-11-05', desc: 'ENI STATION CARBURANTI', amount: 45.00, type: 'expense', category: 'Trasporti' },
    { date: '2026-11-04', desc: 'FARMACIA SAN CARLO FARMACO', amount: 18.50, type: 'expense', category: 'Salute & Cura' },
    { date: '2026-11-02', desc: 'NETFLIX SUBSCRIPTION AMSTERDAM', amount: 13.99, type: 'expense', category: 'Svago & Hobby' },
    { date: '2026-11-01', desc: 'ACCREDITO STIPENDIO AZIENDA SPA', amount: 1950.00, type: 'income', category: 'Stipendio' }
  ].map((item, idx) => ({ ...item, id: Date.now() + idx, selected: true }));

  document.getElementById('importPreviewList').innerHTML = state.parsedImportItems.map((item, idx) => `
    <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs gap-2">
      <div class="truncate flex-1"><span class="font-bold text-white block truncate">${item.desc}</span><span class="text-[10px] text-slate-400">${item.date} • ${item.category}</span></div>
      <span class="font-extrabold ${item.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'}">${item.type === 'expense' ? '-' : '+'}${item.amount.toFixed(2)} €</span>
    </div>
  `).join('');
  document.getElementById('btnConfirmImport').disabled = false;
  showToast('5 movimenti caricati!');
};

window.confirmImport = function() {
  state.parsedImportItems.forEach(item => {
    state.transactions.unshift({ id: Date.now() + Math.random(), type: item.type, amount: item.amount, category: item.category, note: item.desc, date: item.date, recurring: false });
  });
  persistState();
  closeImportModal();
  renderAll();
  showToast('🎉 Movimenti registrati!');
};

window.setTxFilter = function(type) {
  state.txFilterType = type;
  ['all', 'expense', 'income', 'recurring'].forEach(t => {
    const btn = document.getElementById(`txFilter${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (t === type) btn.className = 'px-3 py-1 rounded-lg bg-emerald-500 text-white font-semibold transition';
    else btn.className = 'px-3 py-1 rounded-lg bg-slate-800 text-slate-300 transition';
  });
  renderTransactionList();
};

// UI Rendering
function renderAll() {
  renderSummaryMetrics();
  renderQuickAddButtons();
  renderHomeRecentList();
  renderChart();
  renderTransactionList();
  renderInvestments();
  renderRecurringList();
}

function renderSummaryMetrics() {
  let income = 0, expense = 0;
  state.transactions.forEach(t => { if (t.type === 'income') income += t.amount; else expense += t.amount; });
  const remainingBalance = income - expense;
  document.getElementById('totalRemainingAmount').innerText = `${remainingBalance.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;
  const percentRemaining = income > 0 ? Math.max(0, Math.min(100, (remainingBalance / income) * 100)) : 0;
  document.getElementById('budgetProgressBar').style.width = `${percentRemaining}%`;
  document.getElementById('budgetPercentBadge').innerText = `${percentRemaining.toFixed(1)}% rimasto`;
  const daysLeft = 23;
  const safeDaily = remainingBalance > 0 ? (remainingBalance / daysLeft) : 0;
  document.getElementById('safeToSpendAmount').innerText = `${safeDaily.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;
  document.getElementById('totalIncome').innerText = `+${income.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;
  document.getElementById('totalExpense').innerText = `-${expense.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;
}

function renderHomeRecentList() {
  const container = document.getElementById('homeRecentList');
  const recent = state.transactions.slice(0, 3);
  const allCats = [...state.categories.expense, ...state.categories.income];
  if (recent.length === 0) { container.innerHTML = `<p class="text-xs text-slate-500 text-center py-2">Nessuna spesa recente</p>`; return; }
  container.innerHTML = recent.map(t => {
    const catInfo = allCats.find(c => c.name === t.category) || { icon: '🏷️', color: '#64748b' };
    const isExp = t.type === 'expense';
    return `
      <div class="flex items-center justify-between p-2.5 rounded-2xl bg-slate-850 border border-slate-800 group">
        <div class="flex items-center gap-3 truncate">
          <span class="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style="background-color: ${catInfo.color}20; color: ${catInfo.color};">${catInfo.icon}</span>
          <div class="truncate">
            <span class="text-xs font-bold text-white truncate block">${t.note || t.category}</span>
            <span class="text-[10px] text-slate-400">${t.date} • ${t.category}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold privacy-blur ${isExp ? 'text-rose-400' : 'text-emerald-400'}">${isExp ? '-' : '+'}${t.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €</span>
          <button onclick="openEditModal(${t.id})" class="p-1 text-slate-400 hover:text-white">✏️</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderChart() {
  const type = state.activeChartType;
  const filtered = state.transactions.filter(t => t.type === type);
  const categoryMap = {};
  let total = 0;
  filtered.forEach(t => { categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount; total += t.amount; });
  document.getElementById('chartCenterTotal').innerText = `${total.toLocaleString('it-IT', { maximumFractionDigits: 0 })} €`;
  document.getElementById('chartCenterLabel').innerText = type === 'expense' ? 'Uscite' : 'Entrate';
  const catDefinitions = state.categories[type];
  const items = Object.entries(categoryMap).map(([name, amount]) => {
    const def = catDefinitions.find(c => c.name === name) || { icon: '🏷️', color: '#64748b' };
    return { name, amount, percent: total > 0 ? (amount / total) : 0, icon: def.icon, color: def.color };
  }).sort((a, b) => b.amount - a.amount);

  const svg = document.getElementById('donutSvg'); svg.innerHTML = '';
  if (total === 0) { svg.innerHTML = `<circle cx="50" cy="50" r="38" fill="transparent" stroke="#334155" stroke-width="14" />`; }
  else {
    const radius = 38, circumference = 2 * Math.PI * radius; let cumulativePercent = 0;
    items.forEach(item => {
      const strokeDasharray = `${item.percent * circumference} ${circumference}`;
      const strokeDashoffset = -cumulativePercent * circumference;
      cumulativePercent += item.percent;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '50'); circle.setAttribute('cy', '50'); circle.setAttribute('r', radius);
      circle.setAttribute('fill', 'transparent'); circle.setAttribute('stroke', item.color); circle.setAttribute('stroke-width', '14');
      circle.setAttribute('stroke-dasharray', strokeDasharray); circle.setAttribute('stroke-dashoffset', strokeDashoffset);
      circle.setAttribute('class', 'pie-segment');
      svg.appendChild(circle);
    });
  }
  document.getElementById('categoryLegend').innerHTML = items.map(item => `
    <div class="flex items-center justify-between text-xs p-1.5 rounded-xl hover:bg-slate-800">
      <div class="flex items-center gap-2 truncate"><span class="w-2.5 h-2.5 rounded-full" style="background-color: ${item.color}"></span><span class="text-slate-300 truncate">${item.icon} ${item.name}</span></div>
      <div class="flex items-center gap-2"><span class="text-slate-400 text-[11px]">${(item.percent * 100).toFixed(0)}%</span><span class="font-bold text-white privacy-blur">€${item.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span></div>
    </div>
  `).join('');
}

function renderTransactionList() {
  const list = document.getElementById('transactionsList');
  const search = (document.getElementById('txSearchInput')?.value || '').toLowerCase().trim();
  const filterType = state.txFilterType;
  let filtered = state.transactions.filter(t => {
    if (filterType === 'expense' && t.type !== 'expense') return false;
    if (filterType === 'income' && t.type !== 'income') return false;
    if (filterType === 'recurring' && !t.recurring) return false;
    if (search) return (t.note || '').toLowerCase().includes(search) || (t.category || '').toLowerCase().includes(search);
    return true;
  });
  if (filtered.length === 0) { list.innerHTML = `<p class="text-xs text-slate-500 text-center py-6">Nessun movimento</p>`; return; }
  const allCats = [...state.categories.expense, ...state.categories.income];
  list.innerHTML = filtered.map(t => {
    const catInfo = allCats.find(c => c.name === t.category) || { icon: '🏷️', color: '#64748b' };
    const isExp = t.type === 'expense';
    return `
      <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-850 border border-slate-800 transition group">
        <div class="flex items-center gap-3 truncate">
          <span class="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style="background-color: ${catInfo.color}20; color: ${catInfo.color};">${catInfo.icon}</span>
          <div class="truncate">
            <span class="text-xs font-bold text-white truncate block">${t.note || t.category}</span>
            <span class="text-[11px] text-slate-400">${t.date} • ${t.category}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs md:text-sm font-extrabold privacy-blur ${isExp ? 'text-rose-400' : 'text-emerald-400'}">${isExp ? '-' : '+'}${t.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €</span>
          <div class="flex items-center opacity-80 group-hover:opacity-100">
            <button onclick="openEditModal(${t.id})" class="p-1 text-slate-400 hover:text-white">✏️</button>
            <button onclick="deleteTransaction(${t.id})" class="p-1 text-slate-400 hover:text-rose-400">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderInvestments() {
  let totalInvested = 0, totalCurrentValue = 0;
  const typeAllocation = {};
  state.investments.forEach(asset => {
    const invested = asset.quantity * asset.buyPrice;
    const current = asset.quantity * asset.currentPrice;
    totalInvested += invested;
    totalCurrentValue += current;
    typeAllocation[asset.type] = (typeAllocation[asset.type] || 0) + current;
  });

  const totalGain = totalCurrentValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  document.getElementById('portfolioTotalValue').innerText = `${totalCurrentValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;
  document.getElementById('portfolioInvestedCapital').innerText = `${totalInvested.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;
  
  const gainSign = totalGain >= 0 ? '+' : '';
  const gainText = `${gainSign}${totalGain.toLocaleString('it-IT', { minimumFractionDigits: 2 })} € (${gainSign}${totalGainPercent.toFixed(1)}%)`;
  const gainEl = document.getElementById('portfolioTotalGain');
  gainEl.innerText = `${gainSign}${totalGain.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;
  gainEl.className = `text-xs md:text-sm font-bold privacy-blur ${totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;
  
  const badge = document.getElementById('portfolioPLBadge');
  badge.innerText = gainText;
  badge.className = `text-xs font-bold px-2 py-0.5 rounded-full border privacy-blur ${totalGain >= 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`;

  let income = 0, expense = 0;
  state.transactions.forEach(t => { if (t.type === 'income') income += t.amount; else expense += t.amount; });
  const liquidCash = Math.max(0, income - expense);
  const globalNetWorth = liquidCash + totalCurrentValue;
  document.getElementById('totalNetWorthAmount').innerText = `${globalNetWorth.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;

  const homeVal = document.getElementById('homePortfolioVal');
  const homePL = document.getElementById('homePortfolioPL');
  if (homeVal && homePL) {
    homeVal.innerText = `${totalCurrentValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;
    homePL.innerText = `${gainText} • Google Sheets`;
  }

  // Render donut & list
  const svg = document.getElementById('investmentDonutSvg');
  const legend = document.getElementById('investmentLegend');
  document.getElementById('investmentTotalCount').innerText = `${state.investments.length} titoli`;
  svg.innerHTML = '';
  const colors = { 'ETF & Azioni': '#3b82f6', 'Obbligazioni & BTP': '#10b981', 'Conti Deposito': '#f59e0b', 'Criptovalute': '#f97316', 'Materie Prime': '#eab308' };
  const items = Object.entries(typeAllocation).map(([type, amount]) => ({ type, amount, percent: amount / totalCurrentValue, color: colors[type] || '#3b82f6' })).sort((a, b) => b.amount - a.amount);
  const radius = 38, circumference = 2 * Math.PI * radius; let cumulativePercent = 0;
  items.forEach(item => {
    const strokeDasharray = `${item.percent * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativePercent * circumference;
    cumulativePercent += item.percent;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '50'); circle.setAttribute('cy', '50'); circle.setAttribute('r', radius);
    circle.setAttribute('fill', 'transparent'); circle.setAttribute('stroke', item.color); circle.setAttribute('stroke-width', '14');
    circle.setAttribute('stroke-dasharray', strokeDasharray); circle.setAttribute('stroke-dashoffset', strokeDashoffset);
    circle.setAttribute('class', 'pie-segment');
    svg.appendChild(circle);
  });
  legend.innerHTML = items.map(item => `
    <div class="flex items-center justify-between text-xs p-1 rounded-lg">
      <div class="flex items-center gap-2 truncate"><span class="w-2.5 h-2.5 rounded-full" style="background-color: ${item.color};"></span><span class="text-slate-300 truncate">${item.type}</span></div>
      <div class="flex items-center gap-2"><span class="text-slate-400 text-[10px]">${(item.percent * 100).toFixed(0)}%</span><span class="font-bold text-white privacy-blur">€${item.amount.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</span></div>
    </div>
  `).join('');

  document.getElementById('investmentsList').innerHTML = state.investments.map(asset => {
    const current = asset.quantity * asset.currentPrice;
    const gain = current - (asset.quantity * asset.buyPrice);
    const isPositive = gain >= 0;
    return `
      <div class="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 transition group mb-2">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2 truncate">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${asset.color};"></span>
            <span class="text-xs font-bold text-white truncate">${asset.name}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono font-semibold">${asset.ticker}</span>
          </div>
          <div class="flex items-center gap-1">
            <button onclick="openEditAssetModal(${asset.id})" class="p-1 text-slate-400 hover:text-white">✏️</button>
            <button onclick="deleteAsset(${asset.id})" class="p-1 text-slate-400 hover:text-rose-400">🗑️</button>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-800">
          <div class="text-left"><span class="text-[10px] text-slate-400 block">${asset.quantity} quote</span><span class="text-[10px] text-slate-500">PMC: €${asset.buyPrice.toFixed(2)}</span></div>
          <div><span class="text-[10px] text-slate-400 block">Prezzo Google Finance</span><span class="font-bold text-white privacy-blur">€${asset.currentPrice.toFixed(2)}</span></div>
          <div class="text-right"><span class="font-extrabold text-white block privacy-blur">€${current.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span><span class="text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}">${isPositive ? '+' : ''}€${gain.toFixed(2)}</span></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderRecurringList() {
  const container = document.getElementById('recurringRulesList');
  const recurring = state.transactions.filter(t => t.recurring);
  let totalRec = 0;
  recurring.forEach(t => { if (t.type === 'expense') totalRec += t.amount; });
  document.getElementById('recurringTotalAmount').innerText = `${totalRec.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €`;
  const allCats = [...state.categories.expense, ...state.categories.income];
  container.innerHTML = recurring.map(t => {
    const catInfo = allCats.find(c => c.name === t.category) || { icon: '🏷️', color: '#64748b' };
    return `
      <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-850 border border-slate-800 mb-2">
        <div class="flex items-center gap-3 truncate">
          <span class="w-8 h-8 rounded-xl flex items-center justify-center text-base" style="background-color: ${catInfo.color}20; color: ${catInfo.color};">${catInfo.icon}</span>
          <div class="truncate">
            <span class="text-xs font-bold text-white block truncate">${t.note || t.category}</span>
            <span class="text-[10px] text-slate-400">Si ripete ogni mese • ${t.category}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-extrabold block privacy-blur text-rose-400">-${t.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €</span>
          <button onclick="openEditModal(${t.id})" class="p-1 text-slate-400 hover:text-white">✏️</button>
        </div>
      </div>
    `;
  }).join('');
}

function showToast(msg) {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'fixed bottom-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full border border-emerald-500/40 shadow-xl text-xs font-semibold z-50 transition-opacity duration-300 pointer-events-none opacity-0';
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 2200);
}

// Initial render
renderAll();
