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

  const ajax = new XMLHttpRequest();
  const { readyState } = ajax;

  const loadingClasses = [
    'fas fa-hourglass-start',
    'fas fa-hourglass-half',
    'fas fa-hourglass-end',
  ];

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

  function prepareStatusDiv() {
    $divStatus.setAttribute('id', '');
    setInterval(() => {
      $divStatus.firstElementChild.setAttribute('class', loadingClasses[loadingIndex]);
      if(loadingIndex > 1) 
        loadingIndex = 0;
      else
        loadingIndex++;
    }, 300);
  }

  function openConnection() {
    prepareStatusDiv();
    const url = `https://viacep.com.br/ws/${formatedCep()}/json/`;
    ajax.open('GET', url);
    ajax.send();
    ajax.addEventListener('readystatechange', function() {
      handleStateChange(ajax.readyState, ajax.status, ajax.response);
    }, false);
  }

  
})(document, window);