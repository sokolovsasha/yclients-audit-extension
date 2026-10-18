(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const rawId = urlParams.get('id');
  const yclientsId = rawId && /^\d+$/.test(rawId) ? rawId : null;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  const activeParam = urlParams.get('active');
  const sleepingParam = urlParams.get('sleeping');
  const licenseParam = urlParams.get('license');
  const regdateParam = urlParams.get('regdate');
  const dealParam = urlParams.get('deal');
  const ownerParam = urlParams.get('owner');
  const phoneParam = urlParams.get('phone');
  const cityParam = urlParams.get('city');
  const tzParam = urlParams.get('tz');
  const categoryParam = urlParams.get('category');

  const ownerFirstName = ownerParam ? ownerParam.trim().split(/\s+/)[0] : '';

  const tipsConnectedMasters = [];

  function openTab(url, active = true) {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url, active });
    } else {
      window.open(url, '_blank');
    }
  }

  function applyOwnerName(root) {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue && n.nodeValue.includes('[Имя]')) nodes.push(n);
    }

    nodes.forEach((node) => {
      if (ownerFirstName) {
        node.nodeValue = node.nodeValue.replace(/\[Имя\]/g, ownerFirstName);
      } else {
        node.nodeValue = node.nodeValue
          .replace(/\[Имя\],\s*/g, '')
          .replace(/\[Имя\]/g, '');
      }
    });
  }

  applyOwnerName(document.querySelector('.main') || document.body);

  // ---------- KPI-подсказки ----------
  (function initKpiTooltips() {
    const tooltip = document.createElement('div');
    tooltip.className = 'kpi-tooltip';
    document.body.appendChild(tooltip);

    const TOOLTIP_WIDTH = 320;
    const GAP = 12;

    function showTooltip(btn, text) {
      const rect = btn.getBoundingClientRect();
      let left, top;

      if (window.innerWidth < 600) {
        left = Math.max(8, Math.min(rect.left, window.innerWidth - TOOLTIP_WIDTH - 8));
        top = rect.bottom + GAP;
      } else {
        left = rect.right + GAP;
        top = rect.top;
        if (left + TOOLTIP_WIDTH > window.innerWidth - 8) {
          left = Math.max(8, rect.left - TOOLTIP_WIDTH - GAP);
        }
      }

      if (top + 200 > window.innerHeight - 8) {
        top = Math.max(8, window.innerHeight - 208);
      }
      if (top < 8) top = 8;

      tooltip.textContent = text;
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
      tooltip.style.opacity = '1';
    }

    function hideTooltip() {
      tooltip.style.opacity = '0';
    }

    const tipsText = '🎯 Твоя цель в звонке: Подключить хотя бы одного мастера прямо сейчас. Чаевые для сотрудников не только помогают клиенту мотивировать команду, но и приносят тебе бонус за выполнение KPI по интеграциям!';
    const chatbotText = '🎯 Твоя цель в звонке: Передать контакт партнёру и вывести клиента на тестовый период Бьюти Бота. Подключение интеграции и старт тестового периода приносят тебе бонус за выполнение KPI по интеграциям!';

    const tipsBtn = document.querySelector('.sidebar-item[data-tab="tips"]');
    const chatbotBtn = document.querySelector('.sidebar-item[data-tab="chatbot"]');

    function bind(btn, text) {
      if (!btn) return;
      btn.addEventListener('mouseenter', () => showTooltip(btn, text));
      btn.addEventListener('mouseleave', hideTooltip);
      btn.addEventListener('focus', () => showTooltip(btn, text));
      btn.addEventListener('blur', hideTooltip);
    }

    bind(tipsBtn, tipsText);
    bind(chatbotBtn, chatbotText);

    window.addEventListener('scroll', hideTooltip, true);
  })();

  // ---------- Переключение вкладок и FAQ в сайдбаре ----------
  (function initTabs() {
    const items = document.querySelectorAll('.sidebar-item');
    const panes = document.querySelectorAll('.tab-pane');
    const faqTips = document.getElementById('sidebarFaqTips');
    const faqChatbot = document.getElementById('sidebarFaqChatbot');
    if (!items.length || !panes.length) return;

    function activate(name) {
      items.forEach((it) => it.classList.toggle('active', it.dataset.tab === name));
      panes.forEach((p) => p.classList.toggle('active', p.id === 'tab-' + name));
      if (faqTips) faqTips.hidden = name !== 'tips';
      if (faqChatbot) faqChatbot.hidden = name !== 'chatbot';
    }

    items.forEach((it) => {
      it.addEventListener('click', () => {
        activate(it.dataset.tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    document.querySelectorAll('[data-tab-link]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        activate(link.dataset.tabLink);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    if (faqTips) faqTips.hidden = true;
    if (faqChatbot) faqChatbot.hidden = true;
  })();

  if (yclientsId) {
    document.getElementById('id-value').textContent = yclientsId;

    const idLink = document.getElementById('yclients-id-display');
    if (idLink) {
      idLink.href = `https://yclients.com/dashboard/${yclientsId}`;
    }

    const links = document.querySelectorAll('a[data-yclients-link]');
    links.forEach((link) => {
      let href = link.getAttribute('href');
      if (href) {
        href = href.replace(/\[ID-YCLIENTS\]/g, yclientsId);
        href = href.replace(/\[ID\]/g, yclientsId);
        href = href.replace(/\[today\]/g, today);
        link.setAttribute('href', href);
      }
    });

    const bgLinks = document.querySelectorAll('a[data-yclients-link][data-bg-tab="true"]');
    bgLinks.forEach((link) => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const url = link.getAttribute('href');
        if (url) openTab(url, false);
      });
    });

    const ekvLink = document.getElementById('tbankLink');
    if (ekvLink) {
      ekvLink.addEventListener('click', function (e) {
        e.preventDefault();
        openTab('https://cdn.tbank.ru/static/documents/tbank-kp-torgovyy-ekvayring.pdf', true);
      });
    }
  }

  const faqLink = document.getElementById('faqLink');
  if (faqLink) {
    faqLink.addEventListener('click', function (e) {
      e.preventDefault();
      openTab('https://support.yclients.ru/563--chaevye-dlya-sotrudnikov', false);
    });
  }

  const faqGuideLink = document.getElementById('faqGuideLink');
  if (faqGuideLink) {
    faqGuideLink.addEventListener('click', function (e) {
      e.preventDefault();
      openTab('https://support.yclients.ru/562', false);
    });
  }

  const faqWikiLink = document.getElementById('faqWikiLink');
  if (faqWikiLink) {
    faqWikiLink.addEventListener('click', function (e) {
      e.preventDefault();
      openTab('https://wiki.yandex.ru/commercial-department/otdelposoprovozhdenijuklientov/reglament-prodazhi-i-peredachi-platnyx-integracijj/produkt-wahelp-i-bjuti-bot/', false);
    });
  }

  if (dealParam || categoryParam || cityParam) {
    const el = document.getElementById('deal-name');
    if (el) {
      el.innerHTML = '';

      if (dealParam) {
        const s = document.createElement('span');
        s.className = 'deal-name__title';
        s.textContent = dealParam;
        el.appendChild(s);
      }

      const tail = [];
      if (categoryParam) tail.push(categoryParam);
      if (cityParam) tail.push(cityParam);
      if (tail.length) {
        const t = document.createTextNode((dealParam ? ', ' : '') + tail.join(', '));
        el.appendChild(t);
      }
    }
  }

  const statusDiv = document.getElementById('status-summary');
  if (statusDiv && (activeParam || sleepingParam || licenseParam)) {
    let statusText = '';

    if (activeParam && sleepingParam) {
      const isActive = activeParam === 'Да';
      const isSleeping = sleepingParam === 'Да';

      if (isActive && !isSleeping) statusText = 'Лицензия оплачена, активность есть.';
      else if (!isActive && !isSleeping) statusText = 'Не оплатили, активность есть.';
      else if (!isActive && isSleeping) statusText = 'Не оплатили, нет активности.';
      else if (isActive && isSleeping) statusText = 'Лицензия оплачена, нет активности.';
    }

    const tail = [];
    if (licenseParam) tail.push(`Лицензия до: ${licenseParam.slice(0, 10)}`);
    if (regdateParam) tail.push(`первая оплата: ${regdateParam}`);

    const parts = [];
    if (statusText) parts.push(statusText);
    if (tail.length) parts.push(tail.join(', '));

    statusDiv.textContent = parts.join(' ');
  }

  if (ownerParam || phoneParam) {
    const ownerInfo = document.getElementById('owner-info');
    if (ownerInfo) {
      const parts = [];
      if (ownerParam) parts.push(ownerParam);
      if (phoneParam) parts.push(phoneParam);
      ownerInfo.textContent = parts.join(', ');
    }
  }

  if (cityParam || tzParam) {
    const el = document.getElementById('city-tz-display');
    if (el) {
      let text = '';
      if (cityParam) text += cityParam;
      if (tzParam) text += (text ? ', ' : '') + tzParam;
      el.textContent = text;
    }
  }

  const openAllBtn = document.getElementById('openAllBtn');
  if (openAllBtn) {
    openAllBtn.addEventListener('click', function () {
      if (!yclientsId) return;

      const urls = [
        `https://yclients.com/work_schedule/${yclientsId}`,
        `https://yclients.com/timetable/${yclientsId}`,
        `https://yclients.com/clients/${yclientsId}`,
        `https://yclients.com/analytics/report/${yclientsId}`,
        `https://yclients.com/dashboard/export_report/${yclientsId}?start_date=01.01.2000`,
        `https://yclients.com/finances/transactions/list/${yclientsId}?start_date=01.01.2000`,
        `https://yclients.com/salary_params/list/${yclientsId}`,
        `https://yclients.com/goods/list/${yclientsId}`,
        `https://yclients.com/dashboard/${yclientsId}`,
        `https://yclients.com/appstore/${yclientsId}/applications/installed`
      ];

      urls.forEach((u) => openTab(u, false));
    });
  }

  const tipsMasterInput = document.getElementById('tipsMasterInput');
  const tipsMasterAddBtn = document.getElementById('tipsMasterAddBtn');
  const tipsMasterFeedback = document.getElementById('tipsMasterFeedback');

  if (tipsMasterAddBtn && tipsMasterInput) {
    tipsMasterAddBtn.addEventListener('click', function () {
      const name = tipsMasterInput.value.trim();
      if (!name) return;

      tipsConnectedMasters.push(name);
      tipsMasterInput.value = '';

      if (tipsMasterFeedback) {
        tipsMasterFeedback.textContent = '✓ Добавлено в резюме: Чаевые подключили в звонке для: ' + name;
        tipsMasterFeedback.style.display = 'block';
      }
    });

    tipsMasterInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        tipsMasterAddBtn.click();
      }
    });
  }

  // ---------- Логика для формы заявки ----------
  const reqName = document.getElementById('reqName');
  const reqPhone = document.getElementById('reqPhone');
  const reqDate = document.getElementById('reqDate');
  const reqTime = document.getElementById('reqTime');
  const reqContext = document.getElementById('reqContext');
  const reqId = document.getElementById('reqId');
  const requestBtn = document.getElementById('requestBtn');
  const reqResultBox = document.getElementById('reqResultBox');
  const reqResultText = document.getElementById('reqResultText');
  const reqCopyBtn = document.getElementById('reqCopyBtn');

  // Автоформат даты ДД.ММ.ГГГГ
  if (reqDate) {
    reqDate.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '').slice(0, 8);
      let out = v;
      if (v.length > 2) out = v.slice(0, 2) + '.' + v.slice(2);
      if (v.length > 4) out = v.slice(0, 2) + '.' + v.slice(2, 4) + '.' + v.slice(4);
      this.value = out;
    });
  }

  // Автоформат времени ЧЧ:ММ
  if (reqTime) {
    reqTime.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '').slice(0, 4);
      let out = v;
      if (v.length > 2) out = v.slice(0, 2) + ':' + v.slice(2);
      this.value = out;
    });
  }

  if (reqId) {
    const topIdValue = document.getElementById('id-value')?.textContent.replace('—', '').trim();
    reqId.value = yclientsId || topIdValue || 'ID не найден';
  }

  if (requestBtn) {
    requestBtn.addEventListener('click', function () {
      const dateStr = reqDate.value.trim() || '[дата не указана]';
      const timeStr = reqTime.value.trim() || '[время не указано]';
      const nameStr = reqName.value.trim() || ownerFirstName || '[не указано]';
      const phoneStr = reqPhone.value.trim() || '[телефон не указан]';
      const contextStr = reqContext.value.trim() || '[контекст не указан]';
      const idStr = reqId.value || '[ID не найден]';

      const text = `Клиент рассматривает автоматизацию /задача/. Сейчас использует /сервис / не использует бот/. Основной интерес: /возврат клиентов / повторная запись / отзывы / рассылки / другое/. Просьба связаться ${dateStr} в интервале ${timeStr}. Контактное лицо: ${nameStr}, тел: ${phoneStr}. Дополнительный контекст: ${contextStr}. ID филиала: ${idStr}`;

      reqResultText.value = text;
      reqResultBox.style.display = 'block';

      copyToClipboard(text).catch(() => {
        reqResultText.select();
        try {
          document.execCommand('copy');
        } catch (e) {
          alert('Не удалось скопировать текст. Скопируйте его вручную.');
        }
      });

      reqResultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (reqCopyBtn) {
    reqCopyBtn.addEventListener('click', function () {
      const text = reqResultText.value;
      if (!text) return;

      copyToClipboard(text)
        .then(() => {
          reqCopyBtn.classList.add('is-copied');
          setTimeout(() => reqCopyBtn.classList.remove('is-copied'), 1200);
        })
        .catch(() => {
          reqResultText.select();
          try {
            document.execCommand('copy');
            reqCopyBtn.classList.add('is-copied');
            setTimeout(() => reqCopyBtn.classList.remove('is-copied'), 1200);
          } catch (e) {
            alert('Не удалось скопировать текст. Скопируйте его вручную.');
          }
        });
    });
  }

  const resultBox = document.getElementById('resultBox');
  const resultText = document.getElementById('resultText');

  function getAutoText(id) {
    const el = document.getElementById(id);
    return el ? el.textContent.trim() : '';
  }

  function getValue(element) {
    if (!element) return '(не указано)';
    if (element.tagName === 'INPUT' && element.type === 'checkbox') {
      return element.checked ? 'Да' : 'Нет';
    }
    return element.value.trim() || '(не указано)';
  }

  function getModuleName(checkbox) {
    const label = checkbox.closest('label');
    if (!label) return checkbox.name;

    const link = label.querySelector('a');
    if (link) return link.textContent.trim();

    return label.textContent.trim();
  }

  function copyToClipboard(text) {
    return navigator.clipboard.writeText(text);
  }

  function buildQ7Lines() {
    const lines = [];

    const siteEl = document.querySelector('input[name="q7_site"]');
    const siteWidgetEl = document.querySelector('input[name="q7_site_widget"]');
    const site = siteEl?.value.trim() || '';
    const siteWidget = !!siteWidgetEl?.checked;

    if (site && siteWidget) {
      lines.push(`Сайт: ${site}, онлайн запись с сайта есть.`);
    } else if (site && !siteWidget) {
      lines.push(`Сайт есть: ${site}, но нашей онлайн записи с сайта нет. Почему?`);
    } else if (!site && siteWidget) {
      lines.push(`Сайт не нашёл, но онлайн запись с сайта есть.`);
    } else {
      lines.push(`Сайта нет, онлайн записи с сайта нет.`);
    }

    const vkEl = document.querySelector('input[name="q7_vk"]');
    const vkWidgetEl = document.querySelector('input[name="q7_vk_widget"]');
    const vk = vkEl?.value.trim() || '';
    const vkWidget = !!vkWidgetEl?.checked;

    if (vk && vkWidget) {
      lines.push(`Страница в ВК есть: ${vk}, наш виджет для ОЗ установлен`);
    } else if (vk && !vkWidget) {
      lines.push(`Страница в ВК есть: ${vk}, но там нет нашего виджета для ОЗ. Почему?`);
    } else if (!vk && vkWidget) {
      lines.push(`Страницу в ВК не найти, но интеграция для ОЗ из ВК установлена. Всё ли работает корректно?`);
    } else {
      lines.push(`Страницу в ВК не найти, интеграция для ОЗ из ВК не установлена. Используете ли соцсети?`);
    }

    const socialEl = document.querySelector('input[name="q7_social"]');
    const social = socialEl?.value.trim() || '(не указано)';
    lines.push(`Другие соцсети: ${social}`);

    const yandexEl = document.querySelector('input[name="q7_yandex"]');
    const yandexWidgetEl = document.querySelector('input[name="q7_yandex_widget"]');
    const yandex = yandexEl?.value.trim() || '';
    const yandexWidget = !!yandexWidgetEl?.checked;

    if (yandex && yandexWidget) {
      lines.push(`Есть ОЗ с Яндекс.Карт: ${yandex}.`);
    } else if (yandex && !yandexWidget) {
      lines.push(`Есть карточка компании на Яндекс.Картах: ${yandex}, но нет нашей кнопки ОЗ. Давайте бесплатно подключим?`);
    } else if (!yandex && yandexWidget) {
      lines.push(`Не найдена карточка компании на Яндекс.Картах, но установлена интеграция. Всё ли работает корректно?`);
    } else {
      lines.push(`Не найдена карточка компании на Яндекс.Картах, есть ли она?`);
    }

    const gisEl = document.querySelector('input[name="q7_2gis"]');
    const gisWidgetEl = document.querySelector('input[name="q7_2gis_widget"]');
    const gis = gisEl?.value.trim() || '';
    const gisWidget = !!gisWidgetEl?.checked;

    if (gis && gisWidget) {
      lines.push(`Есть ОЗ с 2ГИС: ${gis}.`);
    } else if (gis && !gisWidget) {
      lines.push(`Есть карточка компании на 2ГИС: ${gis}, но нет нашей кнопки ОЗ. Давайте бесплатно подключим?`);
    } else if (!gis && gisWidget) {
      lines.push(`Не найдена карточка компании на 2ГИС, но установлена интеграция. Всё ли работает корректно?`);
    } else {
      lines.push(`Не найдена карточка компании на 2ГИС, есть ли она?`);
    }

    lines.push('');

    const ozEl = document.querySelector('textarea[name="q7_oz"]');
    const oz = ozEl?.value.trim() || '';
    if (oz) {
      lines.push(`ОЗ: ${oz}`);
    }

    return lines;
  }

  function buildPitchLines() {
    const tbank = !!document.querySelector('input[name="pitch_tbank"]')?.checked;
    const chatbot = !!document.querySelector('input[name="pitch_chatbot"]')?.checked;
    const tips = !!document.querySelector('input[name="pitch_tips"]')?.checked;

    const lines = [
      tbank ? 'Т-Банк подключен.' : 'Т-Банк не подключен.',
      chatbot ? 'Чат-бот подключен.' : 'Чат-бот не подключен.',
      tips ? 'Чаевые подключены.' : 'безналичные чаевые не используют.'
    ];

    tipsConnectedMasters.forEach((name) => {
      lines.push(`Чаевые подключили в звонке для: ${name}`);
    });

    return lines;
  }

  function buildSummary() {
    const lines = [];

    const headerParts = [];
    if (dealParam) headerParts.push(`«${dealParam}»`);
    if (categoryParam) headerParts.push(categoryParam);
    if (cityParam) headerParts.push(cityParam);
    if (tzParam) headerParts.push(tzParam);
    if (headerParts.length) lines.push(headerParts.join(', '));

    const q1 = document.querySelector('input[name="q1"]');
    const q1Value = q1?.value.trim() || '';

    const q1AutoRaw = getAutoText('status-summary');
    const q1AutoClean = q1AutoRaw
      .replace(/[\s,]*первая оплата:\s*\S+/i, '')
      .replace(/[\s,]*Лицензия до:\s*\S+/i, '')
      .trim()
      .replace(/\.+$/, '');

    const line2Parts = [];
    if (q1Value) line2Parts.push(q1Value);
    else if (q1AutoClean) line2Parts.push(q1AutoClean);
    if (licenseParam) line2Parts.push(`Лицензия до: ${licenseParam.slice(0, 10)}`);

    if (line2Parts.length) lines.push(line2Parts.join(', '));

    const q2 = document.querySelector('textarea[name="q2"]');
    lines.push(`Представитель: ${q2?.value.trim() || '(не указано)'}`);

    lines.push('');

    const q3 = document.querySelector('textarea[name="q3"]');
    lines.push(`При подключении хотели: ${q3?.value.trim() || '(не указано)'}`);

    const q4 = document.querySelector('textarea[name="q4"]');
    lines.push(`Что было на этапе внедрения: ${q4?.value.trim() || '(не указано)'}`);

    lines.push('');

    const modCheckboxes = document.querySelectorAll('input[name^="mod_"]');
    const checkedModules = [];
    const uncheckedModules = [];

    modCheckboxes.forEach((cb) => {
      const name = getModuleName(cb);
      if (cb.checked) checkedModules.push(name);
      else uncheckedModules.push(name);
    });

    lines.push(`Используют модули: ${checkedModules.length ? checkedModules.join(', ') : '(не выбрано)'}`);
    lines.push(`Не используют модули: ${uncheckedModules.length ? uncheckedModules.join(', ') : '(все отмечены)'}`);

    buildPitchLines().forEach((l) => lines.push(l));

    const q5Diff = document.querySelector('textarea[name="q5_diff"]');
    lines.push(`Как на самом деле сейчас работают: ${q5Diff?.value.trim() || '(не указано)'}`);

    lines.push('');

    const q6TariffEl = document.querySelector('select[name="q6_tariff"]');
    const q6SeatsEl = document.querySelector('input[name="q6_seats"]');
    const q6TextEl = document.querySelector('textarea[name="q6"]');

    const q6Tariff = q6TariffEl && typeof q6TariffEl.value === 'string' ? q6TariffEl.value : '';
    const q6Seats = q6SeatsEl && typeof q6SeatsEl.value === 'string' ? q6SeatsEl.value.trim() : '';
    const q6Text = q6TextEl && typeof q6TextEl.value === 'string' ? q6TextEl.value.trim() : '';

    const tariffMap = {
      '1-2': 'Частный специалист (1-2 сотрудника)',
      '3-4': '3-4 сотрудника',
      '5-8': '5-8 сотрудников',
      '9-15': '9-15 сотрудников',
      '16-45': '16-45 сотрудников',
      '46+': 'безлимит'
    };

    if (q6Tariff && Object.prototype.hasOwnProperty.call(tariffMap, q6Tariff)) {
      const seatsText = q6Seats || '(не указано)';
      lines.push(`Действующий тариф: ${tariffMap[q6Tariff]}, сейчас работают: ${seatsText}`);
    } else if (q6Seats) {
      lines.push(`Занято мест в лицензии: ${q6Seats}`);
    }

    if (q6Text) lines.push(q6Text);

    buildQ7Lines().forEach((l) => lines.push(l));

    const q8 = document.querySelector('textarea[name="q8"]');
    const q8Value = q8?.value.trim() || '(не указано)';
    lines.push(`Обращения в техподдержку, сопровождение или финтех: ${q8Value}`);

    lines.push('');

    const k1 = document.querySelector('input[name="k1"]');
    const k2 = document.querySelector('input[name="k2"]');
    const k3 = document.querySelector('input[name="k3"]');
    lines.push('Крючки:');
    lines.push(`   1) ${k1?.value.trim() || '(не указано)'}`);
    lines.push(`   2) ${k2?.value.trim() || '(не указано)'}`);
    lines.push(`   3) ${k3?.value.trim() || '(не указано)'}`);

    const q10 = document.querySelector('input[name="q10"]');
    const q10Value = q10?.value.trim() || '';
    if (q10Value) lines.push(`Часовой пояс клиента: ${q10Value}`);

    return lines.join('\n');
  }

  const summaryBtn = document.getElementById('summaryBtn');
  if (summaryBtn) {
    summaryBtn.addEventListener('click', function () {
      let summary;
      try {
        summary = buildSummary();
      } catch (err) {
        console.error('Детальная ошибка в buildSummary:', err);
        alert('Ошибка при формировании резюме: ' + err.message + '\nПроверьте консоль (F12) для подробностей.');
        return;
      }

      resultText.value = summary;
      resultBox.style.display = 'block';

      copyToClipboard(summary).catch(() => {
        resultText.select();
        try {
          document.execCommand('copy');
        } catch (e) {
          alert('Не удалось скопировать текст. Скопируйте его вручную.');
        }
      });

      resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      const text = resultText.value;
      if (!text) return;

      copyToClipboard(text)
        .then(() => {
          copyBtn.classList.add('is-copied');
          setTimeout(() => copyBtn.classList.remove('is-copied'), 1200);
        })
        .catch(() => {
          resultText.select();
          try {
            document.execCommand('copy');
            copyBtn.classList.add('is-copied');
            setTimeout(() => copyBtn.classList.remove('is-copied'), 1200);
          } catch (e) {
            alert('Не удалось скопировать текст. Скопируйте его вручную.');
          }
        });
    });
  }
})();