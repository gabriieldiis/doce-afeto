(function () {
  var FONE = '5511964562656';
  var CENTAVOS = 499; // preço por trufa: R$ 4,99
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzuupd3EW8wqSr2npvvUiVxpEgJGKN1x_r1HXTH5yBDjlRQSC-rH-_00JFXR23MZ1pV/exec";

  /* Sabores (slug -> nome). A ordem aqui é a ordem do resumo e da mensagem do pedido. */
  var SABORES = {
    'tradicional': 'Tradicional',
    'meio-amargo': 'Meio Amargo',
    'brigadeiro': 'Brigadeiro',
    'maracuja': 'Maracujá',
    'limao': 'Limão',
    'cereja': 'Cereja',
    'prestigio': 'Prestígio'
  };

  /* Caminho até a home: "" na index, "../" nas páginas de sabor (data-base no <body>) */
  var BASE = document.body.dataset.base || '';
  var LINK_SABORES = BASE ? BASE + 'index.html#sabores' : '#sabores';

  /* Header: ganha fundo ao rolar */
  var topo = document.getElementById('topo');
  var marcarTopo = function () { topo.classList.toggle('rolou', window.scrollY > 8); };
  marcarTopo();
  window.addEventListener('scroll', marcarTopo, { passive: true });

  /* ---------- Pedido (fica salvo no navegador para valer em todas as páginas) ---------- */
  var CHAVE = 'doceafeto:pedido';
  var pedido = ler();

  function ler() {
    try {
      var bruto = JSON.parse(localStorage.getItem(CHAVE)) || {};
      var limpo = {};
      Object.keys(SABORES).forEach(function (s) {
        var q = Math.max(0, Math.min(99, parseInt(bruto[s], 10) || 0));
        if (q) limpo[s] = q;
      });
      return limpo;
    } catch (_) { return {}; }
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(pedido)); } catch (_) { /* sem armazenamento: o pedido vale só nesta página */ }
  }
  function qtd(slug) { return pedido[slug] || 0; }
  function mudar(slug, delta) {
    var q = Math.max(0, Math.min(99, qtd(slug) + delta));
    if (q) pedido[slug] = q; else delete pedido[slug];
    salvar();
    atualizar();
  }
  function itens() {
    return Object.keys(SABORES).filter(function (s) { return qtd(s) > 0; })
      .map(function (s) { return { slug: s, sabor: SABORES[s], quantidade: qtd(s) }; });
  }

  var barra = document.getElementById('barra');
  var totalEl = document.getElementById('total');
  var qtdEl = document.getElementById('qtd');
  var itensEl = document.getElementById('itens');
  var enviar = document.getElementById('enviar');
  var enviarTxt = document.getElementById('enviar-txt');
  var topoPedido = document.getElementById('topo-pedido');
  var brl = function (c) { return (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
  var waIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z"/></svg>';

  /* Blocos com botões de quantidade: cards da home (.sabor) e a página do sabor (.produto-acao) */
  var blocos = Array.prototype.slice.call(document.querySelectorAll('[data-slug]'));

  function atualizar() {
    blocos.forEach(function (el) {
      var q = qtd(el.dataset.slug);
      el.classList.toggle('ativo', q > 0);
      var out = el.querySelector('output'); if (out) out.value = q;
      var tag = el.querySelector('.no-pedido'); if (tag) tag.textContent = q > 0 ? q + ' no pedido' : '';
    });

    var lista = itens();
    var total = lista.reduce(function (s, i) { return s + i.quantidade; }, 0);
    barra.classList.toggle('vazia', total === 0);

    if (total === 0) {
      itensEl.textContent = 'Seu pedido está vazio';
      enviar.className = 'btn btn-linha';
      enviar.href = LINK_SABORES;
      enviarTxt.textContent = 'Escolher sabores';
      var ic = enviar.querySelector('svg'); if (ic) ic.remove();
      topoPedido.href = LINK_SABORES;
      topoPedido.textContent = 'Fazer pedido';
      return;
    }

    totalEl.textContent = brl(total * CENTAVOS);
    qtdEl.textContent = total + (total === 1 ? ' unidade' : ' unidades');
    itensEl.textContent = lista.map(function (i) { return i.quantidade + 'x ' + i.sabor; }).join(', ');

    enviar.className = 'btn';
    enviar.href = '#';
    enviarTxt.innerHTML = 'Finalizar<span class="so-largo"> pedido</span>';
    if (!enviar.querySelector('svg')) enviar.insertAdjacentHTML('afterbegin', waIcon);
    topoPedido.href = '#';
    topoPedido.textContent = 'Finalizar (' + total + ')';
  }

  /* Cliques em + / − / Adicionar, em qualquer bloco */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-acao]');
    if (!btn) return;
    var bloco = btn.closest('[data-slug]');
    if (!bloco) return;
    var slug = bloco.dataset.slug;
    var veioDoAdd = btn.classList.contains('add');
    mudar(slug, btn.dataset.acao === '+' ? 1 : -1);
    if (veioDoAdd) bloco.querySelector('.stepper [data-acao="+"]').focus();
    else if (qtd(slug) === 0) bloco.querySelector('.add').focus();
  });

  /* Pedido alterado em outra aba, ou página voltando do histórico: relê o que está salvo */
  window.addEventListener('storage', function (e) { if (e.key === CHAVE) { pedido = ler(); atualizar(); } });
  window.addEventListener('pageshow', function (e) { if (e.persisted) { pedido = ler(); atualizar(); } });

  /* ---------- Cards da home: mini slider e clique na foto abre a página do sabor ---------- */
  var temHover = window.matchMedia('(hover: hover)').matches;
  document.querySelectorAll('.sabor').forEach(function (li) {
    var sl = li.querySelector('.slides');
    var pts = li.querySelectorAll('.pontos i');
    var marcar = function () {
      var i = Math.round(sl.scrollLeft / Math.max(1, sl.clientWidth));
      pts.forEach(function (p, k) { p.classList.toggle('on', k === i); });
    };
    sl.addEventListener('scroll', marcar, { passive: true });
    marcar();
    var gal = li.querySelector('.sabor-galeria');
    gal.addEventListener('click', function () { window.location.href = li.querySelector('.abrir').href; });
    if (temHover) {
      gal.addEventListener('mouseenter', function () { sl.scrollTo({ left: sl.clientWidth }); });
      gal.addEventListener('mouseleave', function () { sl.scrollTo({ left: 0 }); });
    }
  });

  /* ---------- Galeria da página do sabor ---------- */
  var gSlides = document.getElementById('produto-slides');
  if (gSlides) {
    var gal = gSlides.closest('.detalhe-galeria');
    var gPontos = gal.querySelectorAll('.detalhe-pontos button');
    var gSetas = gal.querySelectorAll('.seta');
    var gLegenda = gal.querySelector('.detalhe-legenda');
    var legendas = ['A trufa por dentro', 'Referência de tamanho'];
    var fotoAtual = function () { return Math.round(gSlides.scrollLeft / Math.max(1, gSlides.clientWidth)); };
    var irPara = function (i) { gSlides.scrollTo({ left: i * gSlides.clientWidth }); };
    var marcarGaleria = function () {
      var i = fotoAtual();
      gPontos.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      gSetas[0].disabled = i === 0;
      gSetas[1].disabled = i === gPontos.length - 1;
      gLegenda.textContent = legendas[i] || '';
    };
    gSlides.addEventListener('scroll', marcarGaleria, { passive: true });
    gPontos.forEach(function (b) { b.addEventListener('click', function () { irPara(+b.dataset.foto); }); });
    gSetas.forEach(function (b) { b.addEventListener('click', function () { irPara(fotoAtual() + +b.dataset.ir); }); });
    gSlides.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); irPara(fotoAtual() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); irPara(fotoAtual() - 1); }
    });
    marcarGaleria();
  }

  /* ---------- Finalização: identifica o cliente, registra no Apps Script e então abre o WhatsApp ---------- */
  var pedidoDialog = document.getElementById('pedido-dialog');
  var pedidoForm = document.getElementById('pedido-form');
  var pedidoStatus = document.getElementById('pedido-status');
  var pedidoConfirmar = document.getElementById('pedido-confirmar');
  var nomeInput = document.getElementById('cliente-nome');
  var whatsappInput = document.getElementById('cliente-whatsapp');

  function abrirFinalizacao(e) {
    if (!itens().length) return; // pedido vazio: o link segue para os sabores
    e.preventDefault();
    pedidoStatus.textContent = '';
    pedidoStatus.className = 'pedido-status';
    pedidoDialog.showModal();
    nomeInput.focus();
  }

  enviar.addEventListener('click', abrirFinalizacao);
  topoPedido.addEventListener('click', abrirFinalizacao);
  document.getElementById('pedido-cancelar').addEventListener('click', function () {
    pedidoDialog.close();
  });

  function enviarPedidoJSONP(dados) {
    return new Promise(function (resolve, reject) {
      var callbackName = 'doceAfetoCallback_' + Date.now();
      var script = document.createElement('script');
      var encerrado = false;
      var timeout = setTimeout(function () {
        finalizar();
        reject(new Error('O registro demorou mais que o esperado. Tente novamente.'));
      }, 15000);

      function finalizar() {
        if (encerrado) return;
        encerrado = true;
        clearTimeout(timeout);
        script.remove();
        try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
      }

      window[callbackName] = function (resposta) {
        finalizar();
        if (resposta && resposta.sucesso) resolve(resposta);
        else reject(new Error((resposta && resposta.mensagem) || 'Não foi possível registrar o pedido.'));
      };

      script.onerror = function () {
        finalizar();
        reject(new Error('Não foi possível acessar o sistema de pedidos.'));
      };

      script.src = GOOGLE_SCRIPT_URL +
        '?callback=' + encodeURIComponent(callbackName) +
        '&pedido=' + encodeURIComponent(JSON.stringify(dados));
      document.head.appendChild(script);
    });
  }

  pedidoForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var nome = nomeInput.value.trim();
    var whatsapp = whatsappInput.value.replace(/\D/g, '');
    if (!nome || whatsapp.length < 10 || whatsapp.length > 13) {
      pedidoStatus.textContent = 'Confira seu nome e informe um WhatsApp válido com DDD.';
      pedidoStatus.className = 'pedido-status erro';
      return;
    }

    var itensPedido = itens().map(function (i) { return { sabor: i.sabor, quantidade: i.quantidade }; });
    if (!itensPedido.length) {
      pedidoStatus.textContent = 'Seu pedido está vazio.';
      pedidoStatus.className = 'pedido-status erro';
      return;
    }

    var quantidade = itensPedido.reduce(function (soma, item) { return soma + item.quantidade; }, 0);
    var total = quantidade * CENTAVOS;

    pedidoConfirmar.disabled = true;
    pedidoConfirmar.textContent = 'Registrando...';
    pedidoStatus.textContent = 'Registrando seu pedido com segurança...';
    pedidoStatus.className = 'pedido-status';

    try {
      var resposta = await enviarPedidoJSONP({ nome: nome, whatsapp: whatsapp, itens: itensPedido });
      var linhas = itensPedido.map(function (item) { return '• ' + item.quantidade + 'x ' + item.sabor; });
      var msg = 'Olá! Acabei de registrar um pedido na Doce Afeto.\n' +
        'Código: ' + resposta.codigo + '\n' +
        'Nome: ' + nome + '\n' +
        'WhatsApp: ' + whatsapp + '\n\n' +
        linhas.join('\n') + '\n\n' +
        'Quantidade: ' + quantidade + '\n' +
        'Total: ' + brl(total) + '\n\n' +
        'Gostaria de confirmar a disponibilidade e combinar a retirada/entrega.';
      var url = 'https://wa.me/' + FONE + '?text=' + encodeURIComponent(msg);
      pedidoStatus.textContent = 'Pedido registrado! Abrindo o WhatsApp...';
      pedidoStatus.className = 'pedido-status sucesso';
      // Pedido registrado: esvazia para não ficar salvo no navegador
      pedido = {};
      salvar();
      atualizar();
      window.location.href = url;
      pedidoDialog.close();
    } catch (erro) {
      pedidoStatus.textContent = erro.message || 'Erro ao registrar. Tente novamente.';
      pedidoStatus.className = 'pedido-status erro';
    } finally {
      pedidoConfirmar.disabled = false;
      pedidoConfirmar.textContent = 'Registrar e continuar';
    }
  });

  atualizar();
})();
