(function() {
  if (window.__yclLoyaltyTooltipInit) return;
  window.__yclLoyaltyTooltipInit = true;

  const processed = new WeakSet();

  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:absolute; z-index:2147483647; display:none; padding-top:6px;';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Используют "Лояльность"?';
  btn.style.cssText = 'background:#2a8aa0;color:#fff;border:none;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);white-space:nowrap;font-family:inherit;';
  wrap.appendChild(btn);
  document.body.appendChild(wrap);

  let currentGroupId = null;
  let hideTimer = null;

  function show(link, groupId) {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    currentGroupId = groupId;
    const rect = link.getBoundingClientRect();
    wrap.style.left = (rect.left + window.scrollX) + 'px';
    wrap.style.top = (rect.bottom + window.scrollY) + 'px';
    wrap.style.display = 'block';
  }

  function hide() {
    wrap.style.display = 'none';
  }

  function scheduleHide() {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!wrap.matches(':hover')) hide();
    }, 200);
  }

  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!currentGroupId) return;
    const id = currentGroupId;
    const urls = [
      `https://yclients.com/group_loyalty_card_types/${id}`,
      `https://yclients.com/group_loyalty_certificate_types/${id}`,
      `https://yclients.com/group_loyalty_abonement_types/${id}`,
      `https://yclients.com/group_loyalty_transactions/${id}?start_date=01.01.2000`
    ];
    try {
      chrome.runtime.sendMessage({ action: 'openTabs', urls });
    } catch (err) {
      urls.forEach(u => window.open(u, '_blank'));
    }
    hide();
  });

  wrap.addEventListener('mouseenter', () => {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  });
  wrap.addEventListener('mouseleave', scheduleHide);

  window.addEventListener('scroll', hide, true);

  function attach(link) {
    if (processed.has(link)) return;
    const href = link.getAttribute('href') || '';
    const m = href.match(/\/group_settings\/(\d+)/);
    if (!m) return;
    processed.add(link);
    const groupId = m[1];
    link.addEventListener('mouseenter', () => show(link, groupId));
    link.addEventListener('mouseleave', scheduleHide);
  }

  function scan() {
    document.querySelectorAll('a[href*="/group_settings/"]').forEach(attach);
  }

  scan();
  const observer = new MutationObserver(() => scan());
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();