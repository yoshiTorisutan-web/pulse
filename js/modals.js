// ═══════════════════════════════════════════════════
// PULSE — Modals
// Environment manager · Save request
// ═══════════════════════════════════════════════════

function bindModals() {
  // Env modal
  document.getElementById('btnEnvManager').addEventListener('click', showEnvModal);
  document.getElementById('closeEnvModal').addEventListener('click', () => {
    document.getElementById('envModal').style.display = 'none';
    saveToStorage(); renderEnvSelect();
  });
  document.getElementById('envModal').addEventListener('click', e => {
    if (e.target === document.getElementById('envModal')) {
      document.getElementById('envModal').style.display = 'none';
      saveToStorage(); renderEnvSelect();
    }
  });

  // Save modal
  document.getElementById('cancelSave').addEventListener('click', () => document.getElementById('saveModal').style.display = 'none');
  document.getElementById('saveModal').addEventListener('click', e => {
    if (e.target === document.getElementById('saveModal')) document.getElementById('saveModal').style.display = 'none';
  });
  document.getElementById('confirmSave').addEventListener('click', confirmSaveReq);
}

function showEnvModal() {
  renderEnvTabsBtns();
  renderEnvVars();
  document.getElementById('envModal').style.display = 'flex';
}

function renderEnvTabsBtns() {
  const container = document.getElementById('envTabsBtns');
  container.innerHTML = S.environments.map((e, i) =>
    `<button class="hbtn ${i === S.curEnv ? 'amber' : ''}" data-etab="${i}">${escHtml(e.name)}</button>`
  ).join('');
  container.querySelectorAll('[data-etab]').forEach(btn => {
    btn.addEventListener('click', () => {
      S.curEnv = parseInt(btn.dataset.etab);
      renderEnvSelect();
      renderEnvTabsBtns();
      renderEnvVars();
    });
  });
  document.getElementById('addEnvBtn').onclick = () => {
    const name = prompt('Nom de l\'environnement:');
    if (!name) return;
    S.environments.push({name, vars: []});
    S.curEnv = S.environments.length - 1;
    renderEnvSelect();
    renderEnvTabsBtns();
    renderEnvVars();
  };
}

function renderEnvVars() {
  const env = S.environments[S.curEnv];
  const list = document.getElementById('envVarsList');
  if (!env || env.name === '(aucun)') {
    list.innerHTML = '<div class="info-banner">Sélectionnez un environnement pour gérer ses variables.</div>';
    return;
  }
  list.innerHTML = `
    <div style="font-family:var(--mono);font-size:0.73rem;font-weight:600;color:var(--amber);margin-bottom:12px;">→ ${escHtml(env.name)}</div>
    ${env.vars.map((v, i) => `
      <div style="display:grid;grid-template-columns:1fr 1fr 32px;gap:6px;margin-bottom:6px;">
        <input class="modal-input" style="margin-bottom:0;" placeholder="NOM_VARIABLE" value="${escHtml(v.k || '')}" data-envk="${i}">
        <input class="modal-input" style="margin-bottom:0;" placeholder="valeur" value="${escHtml(v.v || '')}" data-envv="${i}">
        <button style="background:transparent;border:1px solid var(--border);border-radius:var(--r);color:var(--text3);cursor:pointer;font-size:.65rem;transition:color .15s;"
          data-envdel="${i}"
          onmouseover="this.style.color='var(--red)'"
          onmouseout="this.style.color='var(--text3)'">✕</button>
      </div>
    `).join('')}
  `;
  list.querySelectorAll('[data-envk]').forEach(el => el.addEventListener('input', () => { S.environments[S.curEnv].vars[el.dataset.envk].k = el.value; }));
  list.querySelectorAll('[data-envv]').forEach(el => el.addEventListener('input', () => { S.environments[S.curEnv].vars[el.dataset.envv].v = el.value; }));
  list.querySelectorAll('[data-envdel]').forEach(el => el.addEventListener('click', () => {
    S.environments[S.curEnv].vars.splice(parseInt(el.dataset.envdel), 1);
    renderEnvVars();
  }));
  document.getElementById('addEnvVarBtn').onclick = () => {
    S.environments[S.curEnv].vars.push({k: '', v: ''});
    renderEnvVars();
    setTimeout(() => {
      const inputs = list.querySelectorAll('[data-envk]');
      if (inputs.length) inputs[inputs.length - 1].focus();
    }, 30);
  };
}

function showSaveModal() {
  const sel = document.getElementById('saveReqCollection');
  sel.innerHTML = S.collections.map((c, i) => `<option value="${i}">${escHtml(c.name)}</option>`).join('');
  document.getElementById('saveReqName').value = S.url
    ? `${S.method} ${decodeURIComponent(S.url.split('/').pop().split('?')[0] || 'request')}`
    : 'New Request';
  document.getElementById('saveModal').style.display = 'flex';
  setTimeout(() => document.getElementById('saveReqName').select(), 50);
}

function confirmSaveReq() {
  const name = document.getElementById('saveReqName').value.trim();
  const ci = parseInt(document.getElementById('saveReqCollection').value);
  if (!name) return;
  S.collections[ci].requests.push({
    id: 'r' + (S.nextId++), name, method: S.method, url: S.url,
    params: JSON.parse(JSON.stringify(S.params)),
    headers: JSON.parse(JSON.stringify(S.headers)),
    bodyType: S.bodyType, bodyRaw: S.bodyRaw,
    authType: S.authType, authData: JSON.parse(JSON.stringify(S.authData))
  });
  document.getElementById('saveModal').style.display = 'none';
  renderSidebar(); saveToStorage();
  toast('Requête sauvegardée', 'success');
}
