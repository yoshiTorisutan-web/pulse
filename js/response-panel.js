// ═══════════════════════════════════════════════════
// PULSE — Response Panel
// renderResponse · renderRespBody · formatJson
// ═══════════════════════════════════════════════════

function renderResponse() {
  const r = S.response;
  if (!r) return;

  const meta = document.getElementById('respMeta');
  meta.style.display = 'flex';

  const sc = r.status >= 200 && r.status < 300 ? 's2'
    : r.status >= 300 && r.status < 400 ? 's3'
    : r.status >= 400 && r.status < 500 ? 's4' : 's5';
  document.getElementById('respStatus').className = `resp-status ${sc}`;
  document.getElementById('respStatus').textContent = `${r.status} ${r.statusText}`;
  document.getElementById('respTime').textContent = `${r.elapsed}ms`;
  document.getElementById('respSize').textContent = formatSize(r.size);

  const isJson = r.contentType.includes('json');
  const toggle = document.getElementById('respViewToggle');
  if (toggle) toggle.style.display = isJson ? 'flex' : 'none';

  const rhc = document.getElementById('resp-headers-count');
  const hcount = Object.keys(r.headers).length;
  if (rhc) { rhc.textContent = hcount; rhc.style.display = hcount ? 'inline-flex' : 'none'; }

  renderRespBody();
}

function renderRespBody() {
  const r = S.response;
  if (!r) return;
  const body = document.getElementById('respBody');

  if (S.respTab === 'body') {
    const isJson = r.contentType.includes('json');
    if (isJson && S.respView === 'pretty') {
      try {
        const parsed = JSON.parse(r.body);
        body.innerHTML = `<div class="json-viewer">${formatJson(JSON.stringify(parsed, null, 2))}</div>`;
      } catch {
        body.innerHTML = `<div class="resp-text">${escHtml(r.body)}</div>`;
      }
    } else {
      body.innerHTML = `<div class="resp-text">${escHtml(r.body.slice(0, 100000))}</div>`;
    }
  } else {
    // Response headers
    const hLines = Object.entries(r.headers).map(([k, v]) =>
      `<div class="resp-header-row"><div class="resp-header-key">${escHtml(k)}</div><div class="resp-header-val">${escHtml(v)}</div></div>`
    ).join('');
    body.innerHTML = `<div>${hLines}</div>`;
  }
}

function formatJson(str) {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
      let cls = 'json-num';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'json-key' : 'json-str';
      } else if (/true|false/.test(match)) {
        cls = 'json-bool';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
}
