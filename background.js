function getYclientsData() {
  const labels = document.querySelectorAll('.linked-form__field__label');
  const data = {
    id: null,
    active: null,
    sleeping: null,
    licenseEnd: null,
    registrationDate: null,
    dealName: null,
    ownerName: null,
    ownerPhone: null,
    city: null,
    timezone: null,
    category: null
  };

  const dealTextarea = document.querySelector('#person_n');
  if (dealTextarea) {
    data.dealName = dealTextarea.value.trim();
  } else {
    const hiddenVal = document.querySelector('.js-text-input-textarea-value');
    if (hiddenVal) data.dealName = hiddenVal.textContent.trim();
  }

  for (const label of labels) {
    const text = label.textContent.trim().toLowerCase();

    let valueDiv = label.nextElementSibling;
    if (!valueDiv || !valueDiv.classList.contains('linked-form__field__value')) {
      const parent = label.parentElement;
      if (parent) valueDiv = parent.querySelector('.linked-form__field__value');
    }

    if (!valueDiv) continue;

    if (text.includes('id yclients') || text.includes('id усlients')) {
      const input = valueDiv.querySelector('input.linked-form__cf');
      if (input && input.value) {
        const val = input.value.trim();
        if (/^\d+$/.test(val) && val !== '0') data.id = val;
      }
    } else if (text.includes('активен')) {
      const button = valueDiv.querySelector('.control--select--button');
      const span = button?.querySelector('span.control--select--button-inner');
      if (span) data.active = span.textContent.trim();
    } else if (text.includes('спящий')) {
      const button = valueDiv.querySelector('.control--select--button');
      const span = button?.querySelector('span.control--select--button-inner');
      if (span) data.sleeping = span.textContent.trim();
    } else if (text.includes('дата окончания лицензии')) {
      const input = valueDiv.querySelector('input.date_field');
      if (input && input.value) data.licenseEnd = input.value.trim();
    } else if (text.includes('дата подключения')) {
      const input = valueDiv.querySelector('input.date_field');
      if (input && input.value) data.registrationDate = input.value.trim();
    } else if (text === 'город') {
      const input = valueDiv.querySelector('input.linked-form__cf');
      if (input && input.value) data.city = input.value.trim();
    } else if (text.includes('часовой пояс')) {
      const button = valueDiv.querySelector('.control--select--button');
      const span = button?.querySelector('span.control--select--button-inner');
      if (span) data.timezone = span.textContent.trim();
    } else if (text === 'категория') {
      const input = valueDiv.querySelector('input.linked-form__cf');
      if (input && input.value) data.category = input.value.trim();
    }
  }

  const nameInput = document.querySelector('input.linked-form__cf.js-linked-name-view');
  if (nameInput && nameInput.value) data.ownerName = nameInput.value.trim();

  const phoneInput = document.querySelector('input.control-phone__formatted.linked-form__cf.js-linked-pei');
  if (phoneInput && phoneInput.value) data.ownerPhone = phoneInput.value.trim();

  console.log('YCLIENTS Audit — собранные данные:', data);
  return data;
}

function setBadge(text, color) {
  try {
    chrome.action.setBadgeBackgroundColor({ color });
    chrome.action.setBadgeText({ text });
    setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2500);
  } catch (e) {
    console.warn('Не удалось установить badge', e);
  }
}

chrome.action.onClicked.addListener((tab) => {
  if (!tab.url || !tab.url.includes('yclients.amocrm.ru/leads/detail/')) {
    console.warn('Расширение работает только на страницах сделок AMO CRM');
    setBadge('AMO', '#c0392b');
    return;
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: getYclientsData
    },
    (results) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        setBadge('ERR', '#c0392b');
        return;
      }

      const data = results?.[0]?.result;

      if (!data || !data.id) {
        console.warn('ID YCLIENTS не найден на этой странице');
        setBadge('ID', '#c0392b');
        return;
      }

      let url = chrome.runtime.getURL(`audit.html?id=${data.id}`);
      if (data.active) url += `&active=${encodeURIComponent(data.active)}`;
      if (data.sleeping) url += `&sleeping=${encodeURIComponent(data.sleeping)}`;
      if (data.licenseEnd) url += `&license=${encodeURIComponent(data.licenseEnd)}`;
      if (data.registrationDate) url += `&regdate=${encodeURIComponent(data.registrationDate)}`;
      if (data.dealName) url += `&deal=${encodeURIComponent(data.dealName)}`;
      if (data.ownerName) url += `&owner=${encodeURIComponent(data.ownerName)}`;
      if (data.ownerPhone) url += `&phone=${encodeURIComponent(data.ownerPhone)}`;
      if (data.city) url += `&city=${encodeURIComponent(data.city)}`;
      if (data.timezone) url += `&tz=${encodeURIComponent(data.timezone)}`;
      if (data.category) url += `&category=${encodeURIComponent(data.category)}`;

      console.log('Открываю URL:', url);
      chrome.tabs.create({ url });
    }
  );
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.action === 'openTabs' && Array.isArray(msg.urls)) {
    msg.urls.forEach((u) => {
      chrome.tabs.create({ url: u, active: false });
    });
    sendResponse({ ok: true });
  }
  return true;
});