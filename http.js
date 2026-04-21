// ═══════════════════════════════════════════════════
// PULSE — HTTP Engine
// sendRequest · buildHeaders · resolveVars · env
// ═══════════════════════════════════════════════════

function renderEnvSelect() {
  const sel = document.getElementById('envSelect');
  sel.innerHTML = S.environments.map((e, i) =>
    `<option value="${i}"${i === S.curEnv ? ' selected' : ''}>${e.name}</option>`
  ).join('');
}

function resolveVars(str) {
  const env = S.environments[S.curEnv];
  if (!env) return str;
  return String(str).replace(/\{\{(\w+)\}\}/g, (_, name) => {
    const v = env.vars.find(v => v.k === name);
    return v ? v.v : `{{${name}}}`;
  });
}

function buildHeaders() {
  const h = {};
  S.headers.filter(hdr => hdr.k && hdr.on).forEach(hdr => {
    h[resolveVars(hdr.k)] = resolveVars(hdr.v);
  });
  if (S.authType === 'bearer' && S.authData.token) {
    h['Authorization'] = `Bearer ${S.authData.token}`;
  } else if (S.authType === 'oauth2' && S.authData.oauthToken) {
    h['Authorization'] = `Bearer ${S.authData.oauthToken}`;
  } else if (S.authType === 'basic' && S.authData.user) {
    h['Authorization'] = `Basic ${btoa(`${S.authData.user}:${S.authData.pass || ''}`)}`;
  } else if (S.authType === 'apikey' && S.authData.keyVal) {
    h[S.authData.keyName || 'X-API-Key'] = S.authData.keyVal;
  }
  return h;
}

async function sendRequest() {
  const rawUrl = document.getElementById('urlInput').value.trim();
  if (!rawUrl) { toast('Entrez une URL', 'error'); return; }

  let url = resolveVars(rawUrl);

  // Append active query params
  const activeParams = S.params.filter(p => p.k && p.on);
  const hasQuery = url.includes('?');
  if (activeParams.length) {
    const qs = activeParams.map(p =>
      `${encodeURIComponent(resolveVars(p.k))}=${encodeURIComponent(resolveVars(p.v))}`
    ).join('&');
    url += (hasQuery ? '&' : '?') + qs;
  }

  const headers = buildHeaders();

  // Build body
  let fetchBody = undefined;
  if (!['GET', 'HEAD'].includes(S.method) && S.bodyType !== 'none') {
    if (S.bodyType === 'form-data' && S.formData) {
      const fd = new FormData();
      S.formData.filter(r => r.k && r.on).forEach(r => fd.append(r.k, r.v));
      fetchBody = fd;
      delete headers['Content-Type'];
    } else if (S.bodyType === 'x-www-form-urlencoded' && S.formData) {
      fetchBody = new URLSearchParams(S.formData.filter(r => r.k && r.on).map(r => [r.k, r.v])).toString();
    } else {
      fetchBody = S.bodyRaw;
    }
  }

  // Set loading state
  S.loading = true;
  setStatus('loading', 'Envoi...');
  const btn = document.getElementById('sendBtn');
  btn.disabled = true;
  btn.classList.add('loading');
  btn.innerHTML = `<span>Annuler</span>`;

  document.getElementById('emptyResp').style.display = 'none';
  document.getElementById('respMeta').style.display = 'none';

  const respBody = document.getElementById('respBody');
  respBody.innerHTML = `
    <div class="loading-resp">
      <div class="loading-dots"><span></span><span></span><span></span></div>
      <div class="loading-bar"><div class="loading-bar-inner"></div></div>
      <div class="loading-text">→ ${escHtml(truncate(url, 48))}</div>
    </div>
  `;

  const startTime = Date.now();
  S.abortController = new AbortController();

  try {
    const fetchOptions = { method: S.method, headers, signal: S.abortController.signal };
    if (fetchBody) fetchOptions.body = fetchBody;

    const res = await fetch(url, fetchOptions);
    const elapsed = Date.now() - startTime;
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    const size = new Blob([text]).size;

    const respHeaders = {};
    res.headers.forEach((v, k) => { respHeaders[k] = v; });

    S.response = { status: res.status, statusText: res.statusText, headers: respHeaders, body: text, contentType, elapsed, size };
    renderResponse();

    // Push to history
    S.history.push({
      method: S.method, url: rawUrl, status: res.status,
      time: elapsed, size, date: new Date().toLocaleTimeString('fr'),
      params: JSON.parse(JSON.stringify(S.params)),
      headers: JSON.parse(JSON.stringify(S.headers)),
      bodyType: S.bodyType, bodyRaw: S.bodyRaw,
    });
    saveToStorage();
    setStatus('ready', `${res.status} ${res.statusText}`);

  } catch (err) {
    const elapsed = Date.now() - startTime;
    if (err.name === 'AbortError') {
      respBody.innerHTML = `<div class="empty-resp"><div class="empty-title">Requête annulée</div><div class="empty-hint">Appuyez sur Envoyer pour réessayer</div></div>`;
      setStatus('ready', 'Annulé');
    } else {
      respBody.innerHTML = `
        <div class="empty-resp">
          <div class="empty-icon" style="color:var(--red);font-size:1.6rem;opacity:.5;">✕</div>
          <div class="empty-title" style="color:var(--red);">Erreur de connexion</div>
          <div class="empty-hint">${escHtml(err.message)}<br><br>Vérifiez l'URL et les CORS.</div>
        </div>
      `;
      setStatus('error', 'Erreur réseau');
      S.history.push({ method: S.method, url: rawUrl, status: null, time: elapsed, size: 0, date: new Date().toLocaleTimeString('fr'), params: S.params, headers: S.headers, bodyType: S.bodyType, bodyRaw: S.bodyRaw });
      saveToStorage();
    }
  } finally {
    S.loading = false;
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Envoyer`;
    S.abortController = null;
  }
}
