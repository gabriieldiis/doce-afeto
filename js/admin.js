
const SUPABASE_URL = 'https://jddhsrsnixybdocubgot.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_QcPS95nG--TC3PaDaZwc8w_jDgoz9cM';

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const formLogin = document.getElementById('form-login');
const telaLogin = document.getElementById('tela-login');
const painelAdmin = document.getElementById('painel-admin');
const mensagemLogin = document.getElementById('mensagem-login');
const listaPedidos = document.getElementById('lista-pedidos');
const btnSair = document.getElementById('btn-sair');

async function carregarPedidos(session) {
    listaPedidos.textContent = 'Carregando pedidos...';

    try {
        const response = await fetch('/api/pedidos', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        });

        const resultado = await response.json();

        if (!response.ok) {
            throw new Error(resultado.mensagem || 'Não foi possível carregar os pedidos.');
        }

        const pedidos = Array.isArray(resultado)
            ? resultado
            : resultado.pedidos || [];

        listaPedidos.innerHTML = '';

        if (!pedidos.length) {
            listaPedidos.textContent = 'Nenhum pedido encontrado.';
            return;
        }

        pedidos.forEach(pedido => {
            const card = document.createElement('article');
            card.className = 'pedido-card';

            const titulo = document.createElement('h3');
            titulo.textContent = `Pedido ${pedido.id}`;

            const status = document.createElement('p');
            status.textContent = `Status: ${pedido.status}`;

            const valor = document.createElement('p');
            valor.textContent = `Total: R$ ${Number(pedido.valor_total).toFixed(2)}`;

            const data = document.createElement('p');
            data.textContent = `Data: ${new Date(pedido.criado_em).toLocaleString('pt-BR')}`;

            card.append(titulo, status, valor, data);
            listaPedidos.appendChild(card);
        });

    } catch (error) {
        listaPedidos.textContent = error.message;
    }
}

async function verificarSessao() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
        return;
    }

    const session = data.session;

    try {
        const response = await fetch('/api/pedidos', {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        });

        const resultado = await response.json();

        if (!response.ok) {
            throw new Error(resultado.mensagem || 'Acesso não autorizado.');
        }

        telaLogin.hidden = true;
        painelAdmin.hidden = false;

        const pedidos = Array.isArray(resultado)
            ? resultado
            : resultado.pedidos || [];

        exibirPedidos(pedidos);

    } catch (error) {
        await supabaseClient.auth.signOut();
        mensagemLogin.textContent = error.message;
    }
}

function exibirPedidos(pedidos) {
    listaPedidos.innerHTML = '';

    if (!pedidos.length) {
        listaPedidos.textContent = 'Nenhum pedido encontrado.';
        return;
    }

    pedidos.forEach(pedido => {
        const card = document.createElement('article');
        card.className = 'pedido-card';

        const titulo = document.createElement('h3');
        titulo.textContent = `Pedido ${pedido.id}`;

        const status = document.createElement('p');
        status.textContent = `Status: ${pedido.status}`;

        const valor = document.createElement('p');
        valor.textContent = `Total: R$ ${Number(pedido.valor_total).toFixed(2)}`;

        const data = document.createElement('p');
        data.textContent = `Data: ${new Date(pedido.criado_em).toLocaleString('pt-BR')}`;

        card.append(titulo, status, valor, data);
        listaPedidos.appendChild(card);
    });
}

formLogin.addEventListener('submit', async event => {
    event.preventDefault();

    mensagemLogin.textContent = 'Validando acesso...';

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password: senha
    });

    if (error) {
        mensagemLogin.textContent = 'E-mail ou senha inválidos.';
        return;
    }

    const response = await fetch('/api/pedidos', {
        headers: {
            Authorization: `Bearer ${data.session.access_token}`
        }
    });

    const resultado = await response.json();

    if (!response.ok) {
        await supabaseClient.auth.signOut();
        mensagemLogin.textContent = resultado.mensagem || 'Você não tem permissão de administrador.';
        return;
    }

    telaLogin.hidden = true;
    painelAdmin.hidden = false;

    const pedidos = Array.isArray(resultado)
        ? resultado
        : resultado.pedidos || [];

    exibirPedidos(pedidos);
});

btnSair.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    painelAdmin.hidden = true;
    telaLogin.hidden = false;
    formLogin.reset();
    mensagemLogin.textContent = '';
});

verificarSessao();
