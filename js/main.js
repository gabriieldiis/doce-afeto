(function () {
  var FONE = '5511964562656';
  var CENTAVOS = 499; // preço por trufa: R$ 4,99
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzuupd3EW8wqSr2npvvUiVxpEgJGKN1x_r1HXTH5yBDjlRQSC-rH-_00JFXR23MZ1pV/exec";

  /* Header: ganha fundo ao rolar */
  var topo = document.getElementById('topo');
  var marcarTopo = function () { topo.classList.toggle('rolou', window.scrollY > 8); };
  marcarTopo();
  window.addEventListener('scroll', marcarTopo, { passive: true });

  var lista = document.getElementById('lista-sabores');
  if (!lista) return;
  var cards = Array.prototype.slice.call(lista.querySelectorAll('.sabor'));
  var barra = document.getElementById('barra');
  var totalEl = document.getElementById('total');
  var qtdEl = document.getElementById('qtd');
  var itensEl = document.getElementById('itens');
  var enviar = document.getElementById('enviar');
  var enviarTxt = document.getElementById('enviar-txt');
  var topoPedido = document.getElementById('topo-pedido');
  var brl = function (c) { return (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
  var waIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z"/></svg>';

  /* ---------- Detalhe (dialog) ---------- */
  var dlg = document.getElementById('detalhe');
  var dSlides = document.getElementById('detalhe-slides');
  var dNome = document.getElementById('detalhe-nome');
  var dDesc = document.getElementById('detalhe-desc');
  var dPapel = document.getElementById('detalhe-papel');
  var dAcao = document.getElementById('detalhe-acao');
  var dLegenda = document.getElementById('detalhe-legenda');
  var dPontos = dlg.querySelectorAll('.detalhe-pontos button');
  var dSetas = dlg.querySelectorAll('.seta');
  var legendas = ['A trufa por dentro', 'Referência de tamanho'];
  var cardAberto = null;
  var origemFoco = null;

  function qtdDe(li) { return +li.querySelector('output').value; }

  function atualizar() {
    var linhas = [], qtd = 0;
    cards.forEach(function (li) {
      var q = qtdDe(li);
      li.classList.toggle('ativo', q > 0);
      li.querySelector('.no-pedido').textContent = q > 0 ? q + ' no pedido' : '';
      if (q > 0) { linhas.push(q + 'x ' + li.dataset.sabor); qtd += q; }
    });
    if (cardAberto) {
      var qa = qtdDe(cardAberto);
      dAcao.classList.toggle('ativo', qa > 0);
      dAcao.querySelector('output').value = qa;
    }
    var total = qtd * CENTAVOS;
    barra.classList.toggle('vazia', qtd === 0);

    if (qtd === 0) {
      itensEl.textContent = 'Seu pedido está vazio';
      enviar.className = 'btn btn-linha';
      enviar.href = '#sabores';
      enviar.removeAttribute('target');
      enviarTxt.textContent = 'Escolher sabores';
      var ic = enviar.querySelector('svg'); if (ic) ic.remove();
      topoPedido.href = '#sabores';
      topoPedido.removeAttribute('target');
      topoPedido.textContent = 'Fazer pedido';
      return;
    }

    totalEl.textContent = brl(total);
    qtdEl.textContent = qtd + (qtd === 1 ? ' unidade' : ' unidades');
    itensEl.textContent = linhas.join(', ');

    var msg = 'Olá! Gostaria de fazer um pedido de trufas Doce Afeto:\n\n' +
      linhas.map(function (l) { return '• ' + l; }).join('\n') +
      '\n\nTotal: ' + qtd + (qtd === 1 ? ' unidade' : ' unidades') + ', ' + brl(total);
    var url = 'https://wa.me/' + FONE + '?text=' + encodeURIComponent(msg);

    enviar.className = 'btn';
    enviar.href = url; enviar.target = '_blank'; enviar.rel = 'noopener';
    enviarTxt.innerHTML = 'Finalizar<span class="so-largo"> pedido</span>';
    if (!enviar.querySelector('svg')) enviar.insertAdjacentHTML('afterbegin', waIcon);
    topoPedido.href = url; topoPedido.target = '_blank'; topoPedido.rel = 'noopener';
    topoPedido.textContent = 'Finalizar (' + qtd + ')';
  }

  function mudar(li, delta) {
    var out = li.querySelector('output');
    out.value = Math.max(0, Math.min(99, +out.value + delta));
    atualizar();
  }

  /* Cliques nos cards: quantidade ou abrir detalhe */
  lista.addEventListener('click', function (e) {
    var li = e.target.closest('.sabor');
    if (!li) return;
    var btn = e.target.closest('button[data-acao]');
    if (btn) {
      var veioDoAdd = btn.classList.contains('add');
      mudar(li, btn.dataset.acao === '+' ? 1 : -1);
      if (veioDoAdd) li.querySelector('.stepper [data-acao="+"]').focus();
      else if (qtdDe(li) === 0) li.querySelector('.add').focus();
      return;
    }
    if (e.target.closest('.abrir') || e.target.closest('.sabor-galeria')) abrir(li, e.target.closest('.abrir') || li.querySelector('.abrir'));
  });

  /* Mini slider dos cards: pontos acompanham o arraste; no desktop o mouse mostra a foto na mão */
  var temHover = window.matchMedia('(hover: hover)').matches;
  cards.forEach(function (li) {
    var sl = li.querySelector('.slides');
    var pts = li.querySelectorAll('.pontos i');
    var marcar = function () {
      var i = Math.round(sl.scrollLeft / sl.clientWidth);
      pts.forEach(function (p, k) { p.classList.toggle('on', k === i); });
    };
    sl.addEventListener('scroll', marcar, { passive: true });
    marcar();
    if (temHover) {
      var gal = li.querySelector('.sabor-galeria');
      gal.addEventListener('mouseenter', function () { sl.scrollTo({ left: sl.clientWidth }); });
      gal.addEventListener('mouseleave', function () { sl.scrollTo({ left: 0 }); });
    }
  });

  /* Slider do detalhe */
  function fotoAtual() { return Math.round(dSlides.scrollLeft / Math.max(1, dSlides.clientWidth)); }
  function irPara(i) { dSlides.scrollTo({ left: i * dSlides.clientWidth }); }
  function marcarDetalhe() {
    var i = fotoAtual();
    dPontos.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    dSetas[0].disabled = i === 0;
    dSetas[1].disabled = i === dPontos.length - 1;
    dLegenda.textContent = legendas[i] || '';
  }
  dSlides.addEventListener('scroll', marcarDetalhe, { passive: true });
  dPontos.forEach(function (b) { b.addEventListener('click', function () { irPara(+b.dataset.foto); }); });
  dSetas.forEach(function (b) { b.addEventListener('click', function () { irPara(fotoAtual() + +b.dataset.ir); }); });
  dSlides.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); irPara(fotoAtual() + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); irPara(fotoAtual() - 1); }
  });

  function abrir(li, origem) {
    cardAberto = li;
    origemFoco = origem || null;
    var nome = li.dataset.sabor;
    dNome.textContent = nome;
    dDesc.textContent = li.querySelector('.sabor-desc').textContent;
    dPapel.textContent = 'Vem embrulhada individualmente em papel metalizado ' + li.dataset.papel + '.';
    dAcao.querySelector('.add').setAttribute('aria-label', 'Adicionar ' + nome + ' ao pedido');
    dAcao.querySelector('[data-acao="-"]').setAttribute('aria-label', 'Remover uma ' + nome);
    dAcao.querySelector('.stepper [data-acao="+"]').setAttribute('aria-label', 'Adicionar mais uma ' + nome);
    dSlides.innerHTML = '';
    li.querySelectorAll('.slides img').forEach(function (img) {
      var c = img.cloneNode();
      c.removeAttribute('loading');
      c.sizes = '(min-width: 960px) 480px, 100vw';
      dSlides.appendChild(c);
    });
    atualizar();
    document.body.classList.add('modal-aberto');
    dlg.showModal();
    dSlides.scrollLeft = 0;
    marcarDetalhe();
  }
  function fechar() { dlg.close(); }
  dlg.addEventListener('close', function () {
    document.body.classList.remove('modal-aberto');
    cardAberto = null;
    if (origemFoco) origemFoco.focus();
  });
  document.getElementById('detalhe-fechar').addEventListener('click', fechar);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) fechar(); });
  dAcao.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-acao]');
    if (!btn || !cardAberto) return;
    var veioDoAdd = btn.classList.contains('add');
    mudar(cardAberto, btn.dataset.acao === '+' ? 1 : -1);
    if (veioDoAdd) dAcao.querySelector('.stepper [data-acao="+"]').focus();
    else if (qtdDe(cardAberto) === 0) dAcao.querySelector('.add').focus();
  });


  /* Finalização: identifica o cliente, registra no Apps Script e então abre o WhatsApp. */
  var pedidoDialog = document.getElementById('pedido-dialog');
  var pedidoForm = document.getElementById('pedido-form');
  var pedidoStatus = document.getElementById('pedido-status');
  var pedidoConfirmar = document.getElementById('pedido-confirmar');
  var nomeInput = document.getElementById('cliente-nome');
  var whatsappInput = document.getElementById('cliente-whatsapp');

  function abrirFinalizacao(e) {
    if (e) e.preventDefault();
    var temItem = cards.some(function (li) { return qtdDe(li) > 0; });
    if (!temItem) {
      document.getElementById('sabores').scrollIntoView({ behavior: 'smooth' });
      return;
    }
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

  function enviarPedidoJSONP(pedido) {
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

      var url = GOOGLE_SCRIPT_URL +
        '?callback=' + encodeURIComponent(callbackName) +
        '&pedido=' + encodeURIComponent(JSON.stringify(pedido));
      script.src = url;
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

    var itensPedido = cards.map(function (li) {
      return { sabor: li.dataset.sabor, quantidade: qtdDe(li) };
    }).filter(function (item) { return item.quantidade > 0; });

    if (!itensPedido.length) {
      pedidoStatus.textContent = 'Seu pedido está vazio.';
      pedidoStatus.className = 'pedido-status erro';
      return;
    }

    var quantidade = itensPedido.reduce(function (soma, item) { return soma + item.quantidade; }, 0);
    var total = quantidade * CENTAVOS;
    var pedido = { nome: nome, whatsapp: whatsapp, itens: itensPedido };

    pedidoConfirmar.disabled = true;
    pedidoConfirmar.textContent = 'Registrando...';
    pedidoStatus.textContent = 'Registrando seu pedido com segurança...';
    pedidoStatus.className = 'pedido-status';

    try {
      var resposta = await enviarPedidoJSONP(pedido);
      var linhas = itensPedido.map(function (item) {
        return '• ' + item.quantidade + 'x ' + item.sabor;
      });
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
