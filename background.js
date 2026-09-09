function getYclientsData() {
  const labels = document.querySelectorAll('.linked-form__field__label');
  let data = {
    id: null,
    active: null,
    sleeping: null,
    licenseEnd: null,
    dealName: null,
    ownerName: null,
    ownerPhone: null
  };

  const dealTextarea = document.querySelector('#person_n');
  if (dealTextarea) {
    data.dealName = dealTextarea.value.trim();
  } else {
    const hiddenVal = document.querySelector('.js-text-input-textarea-value');
    if (hiddenVal) data.dealName = hiddenVal.textContent.trim();
  }

  for (let label of labels) {
    const text = label.textContent.trim().toLowerCase();
    let valueDiv = label.nextElementSibling;
    if (!valueDiv || !valueDiv.classList.contains('linked-form__field__value')) continue;

    if (text.includes('id yclients') || text.includes('id усlients')) {
      const input = valueDiv.querySelector('input.linked-form__cf');
      if (input && input.value) {
        const val = input.value.trim();
        if (/^\d+$/.test(val) && val !== '0') data.id = val;
      }
    }
    else if (text === 'активен') {
      const button = valueDiv.querySelector('.control--select--button');
      if (button) {
        const span = button.querySelector('span.control--select--button-inner');
        if (span) data.active = span.textContent.trim();
      }
    }
    else if (text === 'спящий') {
      const button = valueDiv.querySelector('.control--select--button');
      if (button) {
        const span = button.querySelector('span.control--select--button-inner');
        if (span) data.sleeping = span.textContent.trim();
      }
    }
    else if (text === 'дата окончания лицензии') {
      const input = valueDiv.querySelector('input.date_field');
      if (input && input.value) data.licenseEnd = input.value.trim();
    }
  }

  const nameInput = document.querySelector('input.linked-form__cf.js-linked-name-view');
  if (nameInput && nameInput.value) data.ownerName = nameInput.value.trim();

  const phoneInput = document.querySelector('input.control-phone__formatted.linked-form__cf.js-linked-pei');
  if (phoneInput && phoneInput.value) data.ownerPhone = phoneInput.value.trim();

  return data;
}

chrome.action.onClicked.addListener((tab) => {
  if (!tab.url || !tab.url.includes('yclients.amocrm.ru/leads/detail/')) {
    console.warn('Расширение работает только на страницах сделок AMO CRM');
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
        return;
      }
      const data = results?.[0]?.result;
      if (!data || !data.id) {
        console.warn('ID YCLIENTS не найден на этой странице');
        return;
      }
      let url = chrome.runtime.getURL(`audit.html?id=${data.id}`);
      if (data.active) url += `&active=${encodeURIComponent(data.active)}`;
      if (data.sleeping) url += `&sleeping=${encodeURIComponent(data.sleeping)}`;
      if (data.licenseEnd) url += `&license=${encodeURIComponent(data.licenseEnd)}`;
      if (data.dealName) url += `&deal=${encodeURIComponent(data.dealName)}`;
      if (data.ownerName) url += `&owner=${encodeURIComponent(data.ownerName)}`;
      if (data.ownerPhone) url += `&phone=${encodeURIComponent(data.ownerPhone)}`;
      chrome.tabs.create({ url: url });
    }
  );
});