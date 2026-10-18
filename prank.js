// ============================================================
// PRANK — «База знаний» → «Советы» с иконкой на 01.04.2027
// Весь код пасхалки изолирован здесь. Чтобы отключить —
// удалите этот файл и уберите его из manifest.json.
// ============================================================
(function() {
  const TARGET_DATE = '01.04.2027'; // [Day-X]
  const ICON_URL = 'https://foni.papik.pro/uploads/posts/2024-10/foni-papik-pro-mbhi-p-kartinki-serp-i-molot-na-prozrachnom-fone-3.png';
  const ICON_SIZE = '20px';
  const OLD_TEXT = 'База знаний';
  const NEW_TEXT = 'Советы';

  const now = new Date();
  const today = String(now.getDate()).padStart(2,'0') + '.' +
                String(now.getMonth()+1).padStart(2,'0') + '.' +
                now.getFullYear();
  if (today !== TARGET_DATE) return;
  if (window.__yclPrankInit) return;
  window.__yclPrankInit = true;

  function makeIcon() {
    const img = document.createElement('img');
    img.src = ICON_URL;
    img.style.cssText = `width:${ICON_SIZE};height:${ICON_SIZE};display:inline-block;vertical-align:middle;margin-right:4px;`;
    img.className = '__ycl_prank_icon';
    img.alt = '';
    return img;
  }

  function processTextNodes(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const toProcess = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.indexOf(OLD_TEXT) !== -1) {
        toProcess.push(node);
      }
    }
    toProcess.forEach(n => {
      n.nodeValue = n.nodeValue.split(OLD_TEXT).join(NEW_TEXT);
      const parent = n.parentElement;
      if (parent && !parent.querySelector('.__ycl_prank_icon')) {
        parent.insertBefore(makeIcon(), n);
      }
    });
  }

  function walkAll(root) {
    if (!root) return;
    processTextNodes(root);
    if (root.querySelectorAll) {
      root.querySelectorAll('template').forEach(tpl => {
        if (tpl.content) walkAll(tpl.content);
      });
      root.querySelectorAll('*').forEach(el => {
        if (el.shadowRoot) walkAll(el.shadowRoot);
      });
    }
  }

  function applyAll() {
    walkAll(document.body);
    document.querySelectorAll('[title="' + OLD_TEXT + '"]').forEach(el => {
      el.setAttribute('title', NEW_TEXT);
    });
    document.querySelectorAll('[aria-label="' + OLD_TEXT + '"]').forEach(el => {
      el.setAttribute('aria-label', NEW_TEXT);
    });
  }

  function start() {
    applyAll();
    const obs = new MutationObserver(() => {
      clearTimeout(window.__yclPrankTimer);
      window.__yclPrankTimer = setTimeout(applyAll, 300);
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();