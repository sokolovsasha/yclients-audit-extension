// Функция поиска ID YCLIENTS на странице сделки
function getYclientsId() {
  const labels = document.querySelectorAll('.linked-form__field__label');
  for (let label of labels) {
    const text = label.textContent.trim().toLowerCase();
    if (text.includes('id yclients') || text.includes('id усlients')) {
      let valueDiv = label.nextElementSibling;
      if (valueDiv && valueDiv.classList.contains('linked-form__field__value')) {
        const input = valueDiv.querySelector('input.linked-form__cf');
        if (input && input.value) {
          const id = input.value.trim();
          if (/^\d+$/.test(id) && id !== '0') {
            return id;
          }
        }
      }
    }
  }
  return null;
}

// Обработчик клика по иконке расширения
chrome.action.onClicked.addListener((tab) => {
  // Проверяем, что мы на странице сделки
  if (!tab.url || !tab.url.includes('yclients.amocrm.ru/leads/detail/')) {
    console.warn('Расширение работает только на страницах сделок AMO CRM');
    return;
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: getYclientsId
    },
    (results) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      const id = results?.[0]?.result;
      if (!id) {
        console.warn('ID YCLIENTS не найден на этой странице');
        return;
      }
      // Открываем чек-лист в новой вкладке
      const url = chrome.runtime.getURL(`audit.html?id=${id}`);
      chrome.tabs.create({ url: url });
    }
  );
});