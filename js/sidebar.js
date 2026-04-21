// ═══════════════════════════════════════════════════
// PULSE — Sidebar (Collections & History)
// ═══════════════════════════════════════════════════

function renderSidebar() {
  const body = document.getElementById('sidebarBody');
  const q = (S.searchQuery || '').toLowerCase();

  if (S.sidebarTab === 'collections') {
    let html = S.collections.map((coll, ci) => {
      const filtered = coll.requests.filter(r =>
        !q || r.name.toLowerCase().includes(q) || r.url.toLowerCase().includes(q) || r.method.toLowerCase().includes(q)
      );
      if (q && filtered.length === 0) return '';
      return `
        <div class="coll-section">
          <div class="coll-header" data-ci="${ci}">
            <div class="coll-chevron ${coll.open !== false ? 'open' : ''}">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <span class="coll-title-name">${escHtml(coll.name)}</span>
            <span class="coll-count">${coll.requests.length}</span>
            <button class="coll-add-btn" data-ci="${ci}" title="Nouvelle requête">+</button>
          </div>
          ${(coll.open !== false || q) ? `
            <div class="coll-requests">
              ${filtered.map((req) => {
                const ri = coll.requests.indexOf(req);
                return `
                  <div class="req-item" data-ci="${ci}" data-ri="${ri}" id="reqitem-${req.id}">
                    <span class="req-method m-${req.method}">${req.method}</span>
                    <span class="req-name">${escHtml(req.name)}</span>
                    <button class="req-del" data-ci="${ci}" data-ri="${ri}" title="Supprimer">✕</button>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    html += `
      <div style="padding:6px 2px;">
        <button class="kv-add-row" id="addCollBtn" style="border-radius:var(--r);border:1px solid var(--border);">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouvelle collection
        </button>
      </div>
    `;
    body.innerHTML = html;

    body.querySelectorAll('.coll-header').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.closest('.coll-add-btn')) return;
        const ci = parseInt(el.dataset.ci);
        S.collections[ci].open = !S.collections[ci].open;
        renderSidebar(); saveToStorage();
      });
    });
    body.querySelectorAll('.req-item').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.classList.contains('req-del') || e.target.closest('.req-del')) return;
        loadRequest(parseInt(el.dataset.ci), parseInt(el.dataset.ri));
      });
    });
    body.querySelectorAll('.req-del').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        S.collections[btn.dataset.ci].requests.splice(parseInt(btn.dataset.ri), 1);
        renderSidebar(); saveToStorage();
      });
    });
    body.querySelectorAll('.coll-add-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const name = prompt('Nom de la requête:', 'New Request');
        if (!name) return;
        S.collections[btn.dataset.ci].requests.push({
          id: 'r' + (S.nextId++), name, method: S.method, url: S.url,
          params: JSON.parse(JSON.stringify(S.params)),
          headers: JSON.parse(JSON.stringify(S.headers)),
          bodyType: S.bodyType, bodyRaw: S.bodyRaw,
          authType: S.authType, authData: JSON.parse(JSON.stringify(S.authData))
        });
        renderSidebar(); saveToStorage();
        toast('Requête sauvegardée', 'success');
      });
    });
    const addColl = document.getElementById('addCollBtn');
    if (addColl) addColl.addEventListener('click', () => {
      const name = prompt('Nom de la collection:', 'Ma Collection');
      if (!name) return;
      S.collections.push({name, open: true, requests: []});
      renderSidebar(); saveToStorage();
    });

  } else {
    // History tab
    if (S.history.length === 0) {
      body.innerHTML = '<div style="text-align:center;padding:2.5rem 1rem;font-family:var(--mono);font-size:0.7rem;color:var(--text3);line-height:1.7;">Aucun historique<br><span style="font-size:.6rem;">Les requêtes envoyées<br>apparaîtront ici</span></div>';
      return;
    }
    const filtered = [...S.history].reverse().filter(h =>
      !q || h.url.toLowerCase().includes(q) || String(h.status).includes(q)
    ).slice(0, 60);
    body.innerHTML = filtered.map((h, i) => `
      <div class="hist-item" data-hi="${S.history.length - 1 - i}">
        <div class="hist-item-top">
          <span class="method-pill m-${h.method}">${h.method}</span>
          <span class="hist-url">${escHtml(truncate(h.url, 32))}</span>
          <span class="hist-status ${statusClass(h.status)}">${h.status || 'ERR'}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-family:var(--mono);font-size:0.59rem;color:var(--text3);">${h.time}ms · ${formatSize(h.size)}</span>
          <span style="font-family:var(--mono);font-size:0.57rem;color:var(--text4);">${h.date}</span>
        </div>
      </div>
    `).join('') + `
      <div style="padding:6px 2px;">
        <button class="kv-add-row" id="clearHistBtn" style="border-radius:var(--r);border:1px solid var(--border);color:var(--red);">
          Effacer l'historique
        </button>
      </div>
    `;
    body.querySelectorAll('.hist-item').forEach(el => {
      el.addEventListener('click', () => {
        const h = S.history[el.dataset.hi];
        if (!h) return;
        S.method = h.method; S.url = h.url;
        S.params = h.params ? JSON.parse(JSON.stringify(h.params)) : [{k:'',v:'',on:true}];
        S.headers = h.headers ? JSON.parse(JSON.stringify(h.headers)) : [{k:'',v:'',on:true}];
        S.bodyType = h.bodyType || 'json';
        S.bodyRaw = h.bodyRaw || '';
        document.getElementById('methodSelect').value = S.method;
        updateMethodColor();
        document.getElementById('urlInput').value = S.url;
        renderReqBody();
        toast(`Chargé depuis l'historique`);
      });
    });
    const clearBtn = document.getElementById('clearHistBtn');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      if (!confirm('Effacer tout l\'historique ?')) return;
      S.history = []; renderSidebar(); saveToStorage();
    });
  }
}

function loadRequest(ci, ri) {
  const req = S.collections[ci]?.requests[ri];
  if (!req) return;
  S.method = req.method; S.url = req.url;
  S.params = JSON.parse(JSON.stringify(req.params.length ? req.params : [{k:'',v:'',on:true}]));
  S.headers = JSON.parse(JSON.stringify(req.headers.length ? req.headers : [{k:'',v:'',on:true}]));
  S.bodyType = req.bodyType || 'json';
  S.bodyRaw = req.bodyRaw || '';
  S.authType = req.authType || 'none';
  S.authData = JSON.parse(JSON.stringify(req.authData || {}));
  document.getElementById('methodSelect').value = S.method;
  updateMethodColor();
  document.getElementById('urlInput').value = S.url;
  renderReqBody();
  toast(`Chargé : ${req.name}`);
}
