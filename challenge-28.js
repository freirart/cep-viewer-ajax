(function(doc, win) {
  'use strict';
  /*
    No HTML:
    - Crie um formulário com um input de texto que receberá um CEP e um botão
    de submit;
    - Crie uma estrutura HTML para receber informações de endereço:
    "Logradouro, Bairro, Estado, Cidade e CEP." Essas informações serão
    preenchidas com os dados da requisição feita no JS.
    - Crie uma área que receberá mensagens com o status da requisição:
    "Carregando, sucesso ou erro."

    No JS:
    - O CEP pode ser entrado pelo usuário com qualquer tipo de caractere, mas
    deve ser limpo e enviado somente os números para a requisição abaixo;
    - Ao submeter esse formulário, deve ser feito um request Ajax para a URL:
    "https://viacep.com.br/ws/[CEP]/json/", onde [CEP] será o CEP passado
    no input criado no HTML;
    - Essa requisição trará dados de um CEP em JSON. Preencha campos na tela
    com os dados recebidos.
    - Enquanto os dados são buscados, na área de mensagens de status, deve mostrar
    a mensagem: "Buscando informações para o CEP [CEP]..."
    - Se não houver dados para o CEP entrado, mostrar a mensagem:
    "Não encontramos o endereço para o CEP [CEP]."
    - Se houver endereço para o CEP digitado, mostre a mensagem:
    "Endereço referente ao CEP [CEP]:"
    - Utilize a lib DOM criada anteriormente para facilitar a manipulação e
    adicionar as informações em tela.
  */
  //variables and/or constants
  const $input = doc.querySelector('input');
  const $btn = doc.querySelector('button');
  const $divStatus = doc.querySelector('.req-status');
  const $divData = doc.querySelector('.cep-data');
  const $divSpan = doc.querySelectorAll('.cep-data div span');

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

  //events
  $input.addEventListener('keypress', formatCEP, false);
  $btn.addEventListener('click', prepareConnection, false);

  //functions
  function formatCEP() {
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
      handleStateChange(ajax.readyState, ajax.status, ajax.response);
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
    setTimeout(() => {$divStatus.classList.add('hidden');}, 3000);
  }

  function showError404() {
    clearInterval(interval);
    $divStatus.classList.add('error');
    $divStatus.firstElementChild.setAttribute('class', errorClass);
    $divStatus.children[1].innerText = "O CEP não foi encontrado.";
    vanish();
  }

  
})(document, window);