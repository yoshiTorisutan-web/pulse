// ═══════════════════════════════════════════════════
// PULSE — Bindings, Helpers & Init
// bindHeader · bindReqBar · bindResizeSplit
// bindKeyboard · Helpers · init()
// ═══════════════════════════════════════════════════

// ── Header & Global Bindings ──────────────────────

function bindHeader() {
  document.getElementById('envSelect').addEventListener('change', e => { S.curEnv = parseInt(e.target.value); });

  document.querySelectorAll('[data-stab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-stab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      S.sidebarTab = tab.dataset.stab;
      renderSidebar();
    });
  });

  document.querySelectorAll('[data-resptab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-resptab]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      S.respTab = tab.dataset.resptab;
      renderRespBody();
    });
  });

  document.getElementById('respCopyBtn').addEventListener('click', () => {
    if (!S.response) return;
    navigator.clipboard.writeText(S.response.body).then(() => toast('Réponse copiée', 'success'));
  });

  // Export
  document.getElementById('btnExport').addEventListener('click', () => {
    const data = JSON.stringify({collections: S.collections, environments: S.environments, nextId: S.nextId}, null, 2);
    const blob = new Blob([data], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pulse-collection.json';
    a.click();
    toast('Collection exportée', 'success');
  });

  // Import
  document.getElementById('btnImport').addEventListener('click', () => document.getElementById('importInput').click());
  document.getElementById('importInput').addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.collections) S.collections = d.collections;
        if (d.environments) S.environments = d.environments;
        if (d.nextId) S.nextId = d.nextId;
        S.collections.forEach(c => { if (c.open === undefined) c.open = true; });
        renderSidebar(); renderEnvSelect(); saveToStorage();
        toast('Collection importée', 'success');
      } catch { toast('Fichier invalide', 'error'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Sidebar search
  document.getElementById('sidebarSearch').addEventListener('input', e => {
    S.searchQuery = e.target.value;
    renderSidebar();
  });

  // Response view toggle (pretty / raw)
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-rv]');
    if (!btn) return;
    document.querySelectorAll('[data-rv]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    S.respView = btn.dataset.rv;
    renderRespBody();
  });

  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const app = document.getElementById('app');
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      const sidebar = document.querySelector('.sidebar');
      sidebar.classList.toggle('open');
      app.classList.toggle('sidebar-open');
      mobileMenuToggle.classList.toggle('active');
    });

    // Close sidebar when clicking on an item (on mobile)
    document.addEventListener('click', e => {
      const sidebar = document.querySelector('.sidebar');
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile && sidebar.classList.contains('open')) {
        // Close if clicking inside sidebar items
        if (e.target.closest('.sidebar-body') || e.target.closest('[data-stab]')) {
          if (!e.target.closest('.mobile-menu-toggle')) {
            sidebar.classList.remove('open');
            app.classList.remove('sidebar-open');
            mobileMenuToggle.classList.remove('active');
          }
        }
        // Close if clicking outside sidebar and menu toggle (including overlay)
        else if (!e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-toggle')) {
          sidebar.classList.remove('open');
          app.classList.remove('sidebar-open');
          mobileMenuToggle.classList.remove('active');
        }
      }
    });

    // Close sidebar on window resize to desktop
    window.addEventListener('resize', () => {
      const sidebar = document.querySelector('.sidebar');
      if (window.innerWidth > 768) {
        sidebar.classList.remove('open');
        app.classList.remove('sidebar-open');
        mobileMenuToggle.classList.remove('active');
      }
    });
  }
}

// ── Request Bar ────────────────────────────────────

function bindReqBar() {
  const methodSel = document.getElementById('methodSelect');
  methodSel.addEventListener('change', () => { S.method = methodSel.value; updateMethodColor(); });

  const urlInput = document.getElementById('urlInput');
  urlInput.addEventListener('input', e => { S.url = e.target.value; });
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendRequest(); });

  document.getElementById('urlClear').addEventListener('click', () => {
    S.url = ''; urlInput.value = ''; urlInput.focus();
  });

  document.getElementById('sendBtn').addEventListener('click', () => {
    if (S.loading && S.abortController) { S.abortController.abort(); }
    else { sendRequest(); }
  });
  document.getElementById('saveReqBtn').addEventListener('click', showSaveModal);
}

function updateMethodColor() {
  document.getElementById('methodSelect').className = `method-select method-${S.method}`;
}

function setStatus(state, text) {
  document.getElementById('statusDot').className = `status-dot ${state}`;
  document.getElementById('statusText').textContent = text;
}

// ── Resize Split ───────────────────────────────────

function bindResizeSplit() {
  const handle = document.getElementById('resizeHandle');
  const split = document.getElementById('contentSplit');
  let dragging = false, startPos = 0, startSize = 0, vertical = false;

  function onDragStart(clientX, clientY) {
    vertical = window.innerWidth <= 768;
    dragging = true;
    if (vertical) {
      startPos = clientY;
      const rows = getComputedStyle(split).gridTemplateRows.split(' ');
      startSize = parseFloat(rows[0]);
    } else {
      startPos = clientX;
      const cols = getComputedStyle(split).gridTemplateColumns.split(' ');
      startSize = parseFloat(cols[0]);
      document.body.classList.add('dragging');
    }
    handle.classList.add('dragging');
  }

  function onDragMove(clientX, clientY) {
    if (!dragging) return;
    if (vertical) {
      const newH = Math.max(120, Math.min(split.offsetHeight - 120, startSize + (clientY - startPos)));
      split.style.gridTemplateRows = `${newH}px 12px 1fr`;
    } else {
      const newW = Math.max(220, Math.min(split.offsetWidth - 220, startSize + (clientX - startPos)));
      split.style.gridTemplateColumns = `${newW}px 4px 1fr`;
    }
  }

  function onDragEnd() {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('dragging');
    document.body.classList.remove('dragging');
  }

  handle.addEventListener('mousedown', e => onDragStart(e.clientX, e.clientY));
  document.addEventListener('mousemove', e => onDragMove(e.clientX, e.clientY));
  document.addEventListener('mouseup', onDragEnd);

  handle.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    onDragStart(t.clientX, t.clientY);
  }, { passive: false });
  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    e.preventDefault();
    const t = e.touches[0];
    onDragMove(t.clientX, t.clientY);
  }, { passive: false });
  document.addEventListener('touchend', onDragEnd);

  window.addEventListener('resize', () => {
    split.style.gridTemplateColumns = '';
    split.style.gridTemplateRows = '';
  });
}

// ── Keyboard Shortcuts ─────────────────────────────

function bindKeyboard() {
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); sendRequest(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); showSaveModal(); }
    if (e.key === 'Escape') {
      if (S.loading && S.abortController) { S.abortController.abort(); }
      document.getElementById('envModal').style.display = 'none';
      document.getElementById('saveModal').style.display = 'none';
    }
  });
}

// ── Utility Helpers ────────────────────────────────

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function statusClass(s) {
  if (!s) return '';
  if (s >= 200 && s < 300) return 'resp-status s2';
  if (s >= 300 && s < 400) return 'resp-status s3';
  if (s >= 400 && s < 500) return 'resp-status s4';
  return 'resp-status s5';
}

let _toastTimer;
function toast(msg, type = '') {
  const t = document.getElementById('toast');
  const icon = type === 'success' ? '✓ ' : type === 'error' ? '✕ ' : type === 'warning' ? '⚠ ' : '';
  t.textContent = icon + msg;
  t.className = `toast on ${type}`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('on'), 2600);
}

// ── App Init ───────────────────────────────────────

function init() {
  renderEnvSelect();
  renderSidebar();
  renderReqTabs();
  renderReqBody();
  renderRespBody();
  bindHeader();
  bindReqBar();
  bindResizeSplit();
  bindModals();
  bindKeyboard();
  loadFromStorage();
}

init();
