// ═══════════════════════════════════════════════════
// PULSE — Request Panel
// Tabs · KV Editor · Body · Auth · Snippet
// ═══════════════════════════════════════════════════

// ── Tabs ──────────────────────────────────────────

function renderReqTabs() {
  document.querySelectorAll('[data-reqtab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-reqtab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      S.reqTab = tab.dataset.reqtab;
      renderReqBody();
    });
  });
}

function updateTabCounts() {
  const pc = document.getElementById('params-count');
  const hc = document.getElementById('headers-count');
  const pcount = S.params.filter(p => p.k && p.on).length;
  const hcount = S.headers.filter(h => h.k && h.on).length;
  if (pc) { pc.textContent = pcount || ''; pc.style.display = pcount ? 'inline-flex' : 'none'; }
  if (hc) { hc.textContent = hcount || ''; hc.style.display = hcount ? 'inline-flex' : 'none'; }
}

function renderReqBody() {
  const body = document.getElementById('reqBody');
  updateTabCounts();
  switch (S.reqTab) {
    case 'params':  renderKVEditor(body, S.params, 'param'); break;
    case 'headers': renderKVEditor(body, S.headers, 'header'); break;
    case 'body':    renderBodyEditor(body); break;
    case 'auth':    renderAuthEditor(body); break;
    case 'snippet': renderSnippet(body); break;
  }
}

// ── KV Editor ─────────────────────────────────────

function renderKVEditor(container, data, type) {
  container.innerHTML = `
    <div>
      <div class="kv-row header-row">
        <div class="kv-cell" style="border-right:1px solid var(--border2);padding:6px 10px;font-family:var(--mono);font-size:0.58rem;color:var(--text3);letter-spacing:.1em;">ON</div>
        <div class="kv-cell" style="padding:6px 10px;font-family:var(--mono);font-size:0.58rem;color:var(--text3);letter-spacing:.1em;border-right:1px solid var(--border2);">CLÉ</div>
        <div class="kv-cell" style="padding:6px 10px;font-family:var(--mono);font-size:0.58rem;color:var(--text3);letter-spacing:.1em;border-right:1px solid var(--border2);">VALEUR</div>
        <div class="kv-cell" style="width:32px;"></div>
      </div>
      ${data.map((row, i) => `
        <div class="kv-row" data-idx="${i}">
          <div class="kv-check"><input type="checkbox" ${row.on ? 'checked' : ''} data-kv-check="${i}"></div>
          <div class="kv-cell"><input class="key-input" placeholder="${type === 'param' ? 'paramètre' : 'en-tête'}" value="${escHtml(row.k || '')}" data-kv-key="${i}"></div>
          <div class="kv-cell"><input placeholder="valeur" value="${escHtml(row.v || '')}" data-kv-val="${i}"></div>
          <div class="kv-del" data-kv-del="${i}">✕</div>
        </div>
      `).join('')}
      <div class="kv-add-row" id="kv-add-${type}">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ajouter ${type === 'param' ? 'un paramètre' : 'un header'}
      </div>
    </div>
  `;

  container.querySelectorAll('[data-kv-check]').forEach(el => {
    el.addEventListener('change', () => { data[el.dataset.kvCheck].on = el.checked; updateTabCounts(); });
  });
  container.querySelectorAll('[data-kv-key]').forEach(el => {
    el.addEventListener('input', () => { data[el.dataset.kvKey].k = el.value; updateTabCounts(); });
  });
  container.querySelectorAll('[data-kv-val]').forEach(el => {
    el.addEventListener('input', () => { data[el.dataset.kvVal].v = el.value; });
  });
  container.querySelectorAll('[data-kv-del]').forEach(el => {
    el.addEventListener('click', () => {
      data.splice(parseInt(el.dataset.kvDel), 1);
      if (data.length === 0) data.push({k:'',v:'',on:true});
      renderReqBody();
    });
  });
  const addBtn = container.querySelector(`#kv-add-${type}`);
  if (addBtn) addBtn.addEventListener('click', () => {
    data.push({k:'',v:'',on:true}); renderReqBody();
    setTimeout(() => {
      const inputs = container.querySelectorAll('.key-input');
      if (inputs.length) inputs[inputs.length - 1].focus();
    }, 30);
  });
}

// ── Body Editor ────────────────────────────────────

function renderBodyEditor(container) {
  container.innerHTML = `
    <div class="body-editor-wrap">
      <div class="body-type-tabs">
        ${['none','json','form-data','x-www-form-urlencoded','text','xml','graphql'].map(t =>
          `<button class="btype-btn ${S.bodyType === t ? 'active' : ''}" data-btype="${t}">${t}</button>`
        ).join('')}
      </div>
      ${S.bodyType === 'none' ? `
        <div class="info-banner">
          <strong>Body désactivé.</strong> Sélectionnez un type pour ajouter du contenu à votre requête.
        </div>
      ` : (S.bodyType === 'form-data' || S.bodyType === 'x-www-form-urlencoded') ? `
        <div id="form-kv-body"></div>
      ` : `
        <div class="body-actions">
          ${S.bodyType === 'json' ? `<button class="body-action-btn" id="formatJsonBtn">⚡ Formater JSON</button>` : ''}
          <button class="body-action-btn" id="clearBodyBtn">Effacer</button>
        </div>
        <textarea class="body-textarea" id="bodyTextarea" placeholder="${bodyPlaceholder(S.bodyType)}" spellcheck="false">${escHtml(S.bodyRaw)}</textarea>
      `}
    </div>
  `;

  container.querySelectorAll('[data-btype]').forEach(btn => {
    btn.addEventListener('click', () => { S.bodyType = btn.dataset.btype; renderReqBody(); });
  });

  const ta = document.getElementById('bodyTextarea');
  if (ta) {
    ta.addEventListener('input', () => { S.bodyRaw = ta.value; });
    ta.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = ta.selectionStart, end = ta.selectionEnd;
        ta.value = ta.value.substring(0, s) + '  ' + ta.value.substring(end);
        ta.selectionStart = ta.selectionEnd = s + 2;
        S.bodyRaw = ta.value;
      }
    });
  }

  const fmtBtn = document.getElementById('formatJsonBtn');
  if (fmtBtn) fmtBtn.addEventListener('click', () => {
    try {
      S.bodyRaw = JSON.stringify(JSON.parse(S.bodyRaw), null, 2);
      document.getElementById('bodyTextarea').value = S.bodyRaw;
      toast('JSON formaté', 'success');
    } catch { toast('JSON invalide', 'error'); }
  });

  const clearBtn = document.getElementById('clearBodyBtn');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    S.bodyRaw = '';
    if (ta) ta.value = '';
  });

  if (S.bodyType === 'form-data' || S.bodyType === 'x-www-form-urlencoded') {
    const formKv = document.getElementById('form-kv-body');
    if (formKv) renderKVEditor(formKv, S.formData, 'form');
  }
}

function bodyPlaceholder(type) {
  if (type === 'json') return '{\n  "key": "value"\n}';
  if (type === 'xml') return '<root>\n  <element>value</element>\n</root>';
  if (type === 'graphql') return 'query {\n  users {\n    id\n    name\n  }\n}';
  return 'Contenu du body...';
}

// ── Auth Editor ────────────────────────────────────

function renderAuthEditor(container) {
  container.innerHTML = `
    <div class="auth-wrap">
      <label class="auth-label">Type d'authentification</label>
      <select class="auth-type-select" id="authTypeSelect">
        <option value="none"${S.authType === 'none' ? ' selected' : ''}>Aucune</option>
        <option value="bearer"${S.authType === 'bearer' ? ' selected' : ''}>Bearer Token</option>
        <option value="basic"${S.authType === 'basic' ? ' selected' : ''}>Basic Auth</option>
        <option value="apikey"${S.authType === 'apikey' ? ' selected' : ''}>API Key</option>
        <option value="oauth2"${S.authType === 'oauth2' ? ' selected' : ''}>OAuth 2.0</option>
      </select>
      <div id="authFields"></div>
    </div>
  `;
  document.getElementById('authTypeSelect').addEventListener('change', e => {
    S.authType = e.target.value;
    renderAuthFields();
  });
  renderAuthFields();
}

function renderAuthFields() {
  const container = document.getElementById('authFields');
  if (!container) return;
  if (S.authType === 'none') {
    container.innerHTML = `<div class="info-banner">Aucune authentification configurée.</div>`;
    return;
  }
  if (S.authType === 'bearer') {
    container.innerHTML = `
      <label class="auth-label">Token Bearer</label>
      <input class="auth-field" id="auth-token" type="password" placeholder="eyJhbGciOiJIUzI1NiIs..." value="${escHtml(S.authData.token || '')}">
    `;
    document.getElementById('auth-token').addEventListener('input', e => { S.authData.token = e.target.value; });
  } else if (S.authType === 'basic') {
    container.innerHTML = `
      <label class="auth-label">Utilisateur</label>
      <input class="auth-field" id="auth-user" placeholder="username" value="${escHtml(S.authData.user || '')}">
      <label class="auth-label">Mot de passe</label>
      <input class="auth-field" id="auth-pass" type="password" placeholder="••••••••" value="${escHtml(S.authData.pass || '')}">
    `;
    document.getElementById('auth-user').addEventListener('input', e => { S.authData.user = e.target.value; });
    document.getElementById('auth-pass').addEventListener('input', e => { S.authData.pass = e.target.value; });
  } else if (S.authType === 'apikey') {
    container.innerHTML = `
      <label class="auth-label">Nom du header</label>
      <input class="auth-field" id="auth-key-name" placeholder="X-API-Key" value="${escHtml(S.authData.keyName || 'X-API-Key')}">
      <label class="auth-label">Valeur</label>
      <input class="auth-field" id="auth-key-val" type="password" placeholder="votre-api-key" value="${escHtml(S.authData.keyVal || '')}">
    `;
    document.getElementById('auth-key-name').addEventListener('input', e => { S.authData.keyName = e.target.value; });
    document.getElementById('auth-key-val').addEventListener('input', e => { S.authData.keyVal = e.target.value; });
  } else if (S.authType === 'oauth2') {
    container.innerHTML = `
      <div class="info-banner">
        <strong>OAuth 2.0</strong> — Ajoutez votre token d'accès ci-dessous.<br>
        Il sera envoyé comme header <code style="color:var(--amber);">Authorization: Bearer &lt;token&gt;</code>
      </div>
      <label class="auth-label" style="margin-top:8px;">Access Token</label>
      <input class="auth-field" id="auth-oauth-token" type="password" placeholder="access_token..." value="${escHtml(S.authData.oauthToken || '')}">
    `;
    document.getElementById('auth-oauth-token').addEventListener('input', e => { S.authData.oauthToken = e.target.value; });
  }
}

// ── Snippet Generator ──────────────────────────────

function renderSnippet(container) {
  const langs = ['cURL','JavaScript','Python','PHP','Go','Ruby','Java','C#'];
  container.innerHTML = `
    <div class="snippet-wrap">
      <div class="snippet-lang-tabs">
        ${langs.map(l => {
          const key = l.toLowerCase().replace('#', 'sharp');
          return `<button class="snip-btn ${S.snippetLang === key ? 'active' : ''}" data-snip="${key}">${l}</button>`;
        }).join('')}
      </div>
      <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
        <button class="hbtn" id="copySnippetBtn" style="font-size:.67rem;height:28px;">Copier</button>
      </div>
      <div class="snippet-code" id="snippetCode">${escHtml(generateSnippet(S.snippetLang))}</div>
    </div>
  `;
  container.querySelectorAll('[data-snip]').forEach(btn => {
    btn.addEventListener('click', () => { S.snippetLang = btn.dataset.snip; renderSnippet(container); });
  });
  const copyBtn = document.getElementById('copySnippetBtn');
  if (copyBtn) copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(generateSnippet(S.snippetLang)).then(() => toast('Snippet copié', 'success'));
  });
}

function generateSnippet(lang) {
  const url = resolveVars(S.url) || 'https://api.example.com/endpoint';
  const method = S.method;
  const headers = buildHeaders();
  const body = S.bodyType !== 'none' ? S.bodyRaw : null;
  const headerLines = Object.entries(headers);

  switch (lang) {
    case 'curl': {
      let s = `curl -X ${method} \\\n  '${url}'`;
      headerLines.forEach(([k, v]) => s += ` \\\n  -H '${k}: ${v}'`);
      if (body) s += ` \\\n  -d '${body.replace(/'/g, "'\\''")}' `;
      return s;
    }
    case 'javascript': {
      let opts = `{\n  method: '${method}',\n  headers: ${JSON.stringify(headers, null, 2).replace(/\n/g, '\n  ')}`;
      if (body) opts += `,\n  body: \`${body}\``;
      opts += '\n}';
      return `const response = await fetch('${url}', ${opts});\nconst data = await response.json();\nconsole.log(data);`;
    }
    case 'python': {
      let s = `import requests\n\nurl = "${url}"\nheaders = ${JSON.stringify(headers, null, 2)}\n`;
      if (body) s += `\npayload = ${body}\n\nresponse = requests.${method.toLowerCase()}(url, headers=headers, json=payload)`;
      else s += `\nresponse = requests.${method.toLowerCase()}(url, headers=headers)`;
      return s + `\nprint(response.json())`;
    }
    case 'php': {
      let s = `<?php\n$curl = curl_init();\ncurl_setopt_array($curl, [\n  CURLOPT_URL => "${url}",\n  CURLOPT_RETURNTRANSFER => true,\n  CURLOPT_CUSTOMREQUEST => "${method}",\n`;
      if (headerLines.length) s += `  CURLOPT_HTTPHEADER => [${headerLines.map(([k, v]) => `"${k}: ${v}"`).join(', ')}],\n`;
      if (body) s += `  CURLOPT_POSTFIELDS => '${body}',\n`;
      return s + `]);\n$response = curl_exec($curl);\ncurl_close($curl);\necho $response;`;
    }
    case 'go': {
      let s = `package main\n\nimport (\n  "fmt"\n  "net/http"\n  "strings"\n)\n\nfunc main() {\n  client := &http.Client{}\n`;
      if (body) s += `  body := strings.NewReader(\`${body}\`)\n  req, _ := http.NewRequest("${method}", "${url}", body)\n`;
      else s += `  req, _ := http.NewRequest("${method}", "${url}", nil)\n`;
      headerLines.forEach(([k, v]) => s += `  req.Header.Set("${k}", "${v}")\n`);
      return s + `  resp, err := client.Do(req)\n  if err != nil { panic(err) }\n  defer resp.Body.Close()\n  fmt.Println(resp.Status)\n}`;
    }
    case 'ruby': {
      let s = `require 'net/http'\nrequire 'uri'\n\nuri = URI('${url}')\nhttp = Net::HTTP.new(uri.host, uri.port)\nhttp.use_ssl = uri.scheme == 'https'\n\nreq = Net::HTTP::${method.charAt(0) + method.slice(1).toLowerCase()}.new(uri)\n`;
      headerLines.forEach(([k, v]) => s += `req['${k}'] = '${v}'\n`);
      if (body) s += `req.body = '${body}'\n`;
      return s + `res = http.request(req)\nputs res.body`;
    }
    case 'java':
      return `HttpClient client = HttpClient.newHttpClient();\nHttpRequest request = HttpRequest.newBuilder()\n  .uri(URI.create("${url}"))\n  .method("${method}", ${body ? `HttpRequest.BodyPublishers.ofString("""${body}""")` : 'HttpRequest.BodyPublishers.noBody()'})\n${headerLines.map(([k, v]) => `  .header("${k}", "${v}")`).join('\n')}\n  .build();\nHttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\nSystem.out.println(response.body());`;
    case 'csharp':
      return `var client = new HttpClient();\nvar request = new HttpRequestMessage(HttpMethod.${method.charAt(0) + method.slice(1).toLowerCase()}, "${url}");\n${headerLines.map(([k, v]) => `request.Headers.Add("${k}", "${v}");`).join('\n')}\n${body ? `request.Content = new StringContent("""${body}""", Encoding.UTF8, "application/json");` : ''}\nvar response = await client.SendAsync(request);\nvar body = await response.Content.ReadAsStringAsync();\nConsole.WriteLine(body);`;
    default:
      return '// Snippet non disponible';
  }
}
