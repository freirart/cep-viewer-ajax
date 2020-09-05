(function(doc, win) {
  'use strict';

  //variables and/or constants
  const $input = doc.querySelector('input');
  const $btn = doc.querySelector('button');
  const $divStatus = doc.querySelector('.req-status');
  const $divData = doc.querySelector('.cep-data');
  const $divSpan = doc.querySelectorAll('.cep-data div span');
  const $main = doc.querySelector('main');
  const $span = doc.querySelector('main form div span');

  const ajax = new XMLHttpRequest();
  const { readyState } = ajax;

  let interval;

  const loadingClasses = [
    'fas fa-hourglass-start',
    'fas fa-hourglass-half',
    'fas fa-hourglass-end',
  ];
  const successClass = 'fas fa-check';
  const errorClass = 'fas fa-times';

  let loadingIndex = 0;
  let typed = false;

  //events
  $input.addEventListener('keypress', formatCEP, false);
  $btn.addEventListener('click', prepareConnection, false);

  //functions
  function formatCEP() {
    if (!typed) {
      $main.classList.add('typing');
      $span.classList.add('typing');
      typed = true;
    }
    const { value } = this;
    if(value.length === 2) this.value += '.';
    if(value.length === 6) this.value += '-';
  }

  function formatedCep() {
    return $input.value.match(/\d+/g).join('');
  }

  function isCEPValid() {
    const regEx = /\d{2}\.\d{3}-\d{3}/;
    return regEx.test($input.value);
  }

  function showInvalidCEPWarning() {
    alert("O CEP digitado não é válido.");
  }

  function prepareConnection(e) {
    e.preventDefault();
    if ( isCEPValid() ) {
      openConnection();
    }
    else {
      showInvalidCEPWarning();
    }
  }

  function clearAll() {
    $divStatus.setAttribute('class', 'req-status loading');
    $divStatus.firstElementChild.setAttribute('class', loadingClasses[0]);
    $divStatus.children[1].innerText = "Requisitando dados...";
    $divData.setAttribute('id', 'none');
  }

  function setLoading() {
    $divStatus.classList.remove('hidden');
    $divStatus.classList.add('loading');
    interval = setInterval(() => {
      $divStatus.firstElementChild.setAttribute('class', loadingClasses[loadingIndex]);
      if (loadingIndex > 1) loadingIndex = 0;
      else loadingIndex++;
    }, 300);
  }

  function openConnection() {
    clearAll();
    setLoading();
    const url = `https://viacep.com.br/ws/${formatedCep()}/json/`;
    ajax.open('GET', url);
    ajax.send();
    ajax.addEventListener('readystatechange', function() {
      handleStateChange(ajax.readyState, ajax.status, ajax.responseText);
    }, false);
  }

  function handleStateChange(state, status, response) {
    if (state > 3 && status == 200 && wasReceived(response)) 
      prepareDataDiv(response);
    if ((state == 4 && status != 200) || !wasReceived(response)) 
      showError404(response);
  }

  function wasReceived(response) {
    const res = JSON.parse(response);
    if (res['erro']) return false;
    return true;
  }

  function prepareDataDiv(response) {
    setSuccess();
    const { bairro, uf, localidade, logradouro, cep } = JSON.parse(response);
    const data = [logradouro, bairro, localidade, uf, cep];
    $divSpan.forEach((element, index) => {
      element.innerText = data[index];
    });
  }

  function setSuccess() {
    $divData.setAttribute('id', '');
    $divStatus.classList.add('success');
    clearInterval(interval);
    $divStatus.firstElementChild.setAttribute('class', successClass);
    $divStatus.children[1].innerText = "CEP encontrado com sucesso!";
    vanish();
  }

  function vanish() {
    setTimeout(() => {$divStatus.classList.add('hidden');}, 5000);
  }

  function showError404() {
    clearInterval(interval);
    $divStatus.classList.add('error');
    $divStatus.firstElementChild.setAttribute('class', errorClass);
    $divStatus.children[1].innerText = "O CEP não foi encontrado.";
    vanish();
  }

  
})(document, window);