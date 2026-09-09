(function(){
const urlParams=new URLSearchParams(window.location.search);
const yclientsId=urlParams.get('id');
const now=new Date();
const year=now.getFullYear();
const month=String(now.getMonth()+1).padStart(2,'0');
const day=String(now.getDate()).padStart(2,'0');
const today=`${year}-${month}-${day}`;

const activeParam=urlParams.get('active');
const sleepingParam=urlParams.get('sleeping');
const licenseParam=urlParams.get('license');
const dealParam=urlParams.get('deal');
const ownerParam=urlParams.get('owner');
const phoneParam=urlParams.get('phone');

if(yclientsId){
  // ID в заголовке
  document.getElementById('id-value').textContent=yclientsId;
  // ссылка на дашборд
  const idLink=document.getElementById('yclients-id-display');
  if(idLink){
    idLink.href=`https://yclients.com/dashboard/${yclientsId}`;
  }
  // заменяем [ID] и [today] в ссылках
  const links=document.querySelectorAll('a[data-yclients-link]');
  links.forEach(link=>{
    let href=link.getAttribute('href');
    if(href){
      href=href.replace(/\[ID\]/g,yclientsId);
      href=href.replace(/\[today\]/g,today);
      link.setAttribute('href',href);
    }
  });
  // ссылка на эквайринг – открывается при клике
  const ekvLink=document.querySelector('.tooltip-link');
  if(ekvLink){
    ekvLink.addEventListener('click', function(e){
      e.preventDefault();
      window.open('https://cdn.tbank.ru/static/documents/tbank-kp-torgovyy-ekvayring.pdf', '_blank');
    });
  }
}

// Название сделки
if(dealParam){
  document.getElementById('deal-name').textContent = ` — ${dealParam}`;
}

// Статус + дата лицензии
if(activeParam && sleepingParam && licenseParam){
  const isActive=activeParam==='Да';
  const isSleeping=sleepingParam==='Да';
  let statusText='';
  if(isActive && !isSleeping) statusText='Лицензия оплачена, активность есть.';
  else if(!isActive && !isSleeping) statusText='Не оплатили, активность есть.';
  else if(!isActive && isSleeping) statusText='Не оплатили, нет активности.';
  else if(isActive && isSleeping) statusText='Лицензия оплачена, нет активности.';
  const statusDiv=document.getElementById('status-summary');
  if(statusDiv){
    statusDiv.textContent=`${statusText} Лицензия до: ${licenseParam}`;
  }
}

// Владелец и телефон
if(ownerParam || phoneParam){
  const ownerInfo=document.getElementById('owner-info');
  let text='';
  if(ownerParam) text+=ownerParam;
  if(phoneParam) text+=` ${phoneParam}`;
  if(text) ownerInfo.textContent=text;
}

const resultBox=document.getElementById('resultBox');
const resultText=document.getElementById('resultText');

function getQuestionLabel(element){
  let label=element.closest('.question-block')?.querySelector('label');
  if(label)return label.textContent.trim();
  return 'Вопрос';
}

function getValue(element){
  if(element.tagName==='INPUT'&&element.type==='checkbox'){
    return element.checked?'Да':'Нет';
  }
  return element.value.trim()||'(не указано)';
}

function getModuleName(checkbox){
  const label=checkbox.closest('label');
  if(label){
    let text=label.textContent.trim();
    text=text.replace(/\(Отчеты\)/g,'').trim();
    return text;
  }
  return checkbox.name;
}

function buildSummary(){
  let lines=[];
  const q1=document.querySelector('input[name="q1"]');
  lines.push(`${getQuestionLabel(q1)}: ${getValue(q1)}`);
  const q2=document.querySelector('textarea[name="q2"]');
  lines.push(`${getQuestionLabel(q2)}: ${getValue(q2)}`);
  const q3=document.querySelector('textarea[name="q3"]');
  lines.push(`${getQuestionLabel(q3)}: ${getValue(q3)}`);
  const q4=document.querySelector('textarea[name="q4"]');
  lines.push(`${getQuestionLabel(q4)}: ${getValue(q4)}`);
  const modCheckboxes=document.querySelectorAll('input[name^="mod_"]');
  const checkedModules=[], uncheckedModules=[];
  modCheckboxes.forEach(cb=>{
    const name=getModuleName(cb);
    if(cb.checked) checkedModules.push(name);
    else uncheckedModules.push(name);
  });
  const q5Diff=document.querySelector('textarea[name="q5_diff"]');
  const diffText=q5Diff.value.trim()||'(не указано)';
  lines.push(`5. Модули:`);
  lines.push(`   Используют модули: ${checkedModules.length?checkedModules.join(', '):'(не выбрано)'}`);
  lines.push(`   Комментарий: ${diffText}`);
  lines.push(`   Не используют модули: ${uncheckedModules.length?uncheckedModules.join(', '):'(все отмечены)'}`);
  const q6=document.querySelector('textarea[name="q6"]');
  lines.push(`${getQuestionLabel(q6)}: ${getValue(q6)}`);
  const q7site=document.querySelector('input[name="q7_site"]');
  const q7social=document.querySelector('input[name="q7_social"]');
  const q7oz=document.querySelector('textarea[name="q7_oz"]');
  lines.push(`7. Сайт: ${getValue(q7site)}, Соцсети: ${getValue(q7social)}, ОЗ: ${getValue(q7oz)}`);
  const q8=document.querySelector('textarea[name="q8"]');
  lines.push(`${getQuestionLabel(q8)}: ${getValue(q8)}`);
  const k1=document.querySelector('input[name="k1"]');
  const k2=document.querySelector('input[name="k2"]');
  const k3=document.querySelector('input[name="k3"]');
  lines.push(`9. Крючок 1: ${getValue(k1)}`);
  lines.push(`   Крючок 2: ${getValue(k2)}`);
  lines.push(`   Крючок 3: ${getValue(k3)}`);
  const q10=document.querySelector('input[name="q10"]');
  lines.push(`${getQuestionLabel(q10)}: ${getValue(q10)}`);
  return lines.join('\n');
}

document.getElementById('summaryBtn').addEventListener('click',function(){
  const summary=buildSummary();
  resultText.value=summary;
  resultBox.style.display='block';
  navigator.clipboard.writeText(summary).catch(()=>{
    resultText.select();
    try{
      document.execCommand('copy');
    }catch(e){
      alert('Не удалось скопировать текст. Скопируйте его вручную.');
    }
  });
  resultBox.scrollIntoView({behavior:'smooth',block:'start'});
});
})();