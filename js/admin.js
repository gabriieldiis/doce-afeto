
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
        const vazio = document.createElement('div');
        vazio.className = 'empty-state';
        vazio.innerHTML = `
            <span class="empty-icon">▦</span>
            <h3>Nenhum pedido por enquanto</h3>
            <p>Quando um cliente fizer um pedido, ele aparecerá aqui.</p>
        `;
        listaPedidos.appendChild(vazio);
        return;
    }

    pedidos.forEach(pedido => {
        const cliente = Array.isArray(pedido.clientes)
            ? pedido.clientes[0]
            : pedido.clientes;

        const itens = pedido.itens_pedido || [];

        const statusNomes = {
            pendente: 'Pendente',
            confirmado: 'Confirmado',
            em_preparo: 'Em preparo',
            pronto: 'Pronto',
            concluido: 'Concluído',
            cancelado: 'Cancelado'
        };

        const data = pedido.criado_em
            ? new Date(pedido.criado_em).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : 'Data não disponível';

        const card = document.createElement('article');
        card.className = 'pedido-card';

        // Cabeçalho
        const header = document.createElement('div');
        header.className = 'pedido-header';

        const identificacao = document.createElement('div');
        identificacao.className = 'pedido-identificacao';

        const titulo = document.createElement('h3');
        titulo.textContent = `Pedido #${pedido.id.slice(0, 8).toUpperCase()}`;
        titulo.title = pedido.id;

        const dataPedido = document.createElement('span');
        dataPedido.className = 'pedido-data';
        dataPedido.textContent = data;

        identificacao.append(titulo, dataPedido);

        const status = document.createElement('span');
        status.className = `status-badge status-${pedido.status}`;
        status.textContent = statusNomes[pedido.status] || pedido.status;

        header.append(identificacao, status);

        // Cliente
        const clienteSection = document.createElement('div');
        clienteSection.className = 'pedido-section';

        const clienteTitulo = document.createElement('h4');
        clienteTitulo.textContent = 'Cliente';

        const clienteNome = document.createElement('p');
        clienteNome.className = 'cliente-nome';
        clienteNome.textContent = cliente?.nome || 'Cliente não identificado';

        const clienteTelefone = document.createElement('p');
        clienteTelefone.className = 'cliente-telefone';

        const telefone = cliente?.telefone || '';
        clienteTelefone.textContent = telefone
            ? `WhatsApp: ${telefone}`
            : 'WhatsApp não informado';

        clienteSection.append(
            clienteTitulo,
            clienteNome,
            clienteTelefone
        );

        // Produtos
        const produtosSection = document.createElement('div');
        produtosSection.className = 'pedido-section';

        const produtosTitulo = document.createElement('h4');
        produtosTitulo.textContent = 'Produtos';

        const listaProdutos = document.createElement('ul');
        listaProdutos.className = 'pedido-produtos';

        itens.forEach(item => {
            const produto = document.createElement('li');

            const quantidade = document.createElement('span');
            quantidade.className = 'produto-quantidade';
            quantidade.textContent = `${item.quantidade}x`;

            const nome = document.createElement('span');
            nome.className = 'produto-nome';
            nome.textContent = item.nome_produto;

            const preco = document.createElement('span');
            preco.className = 'produto-preco';
            preco.textContent = `R$ ${(Number(item.preco_unitario) * Number(item.quantidade)).toFixed(2).replace('.', ',')}`;

            produto.append(quantidade, nome, preco);
            listaProdutos.appendChild(produto);
        });

        produtosSection.append(produtosTitulo, listaProdutos);

        // Rodapé
        const footer = document.createElement('div');
        footer.className = 'pedido-footer';

        const totalLabel = document.createElement('span');
        totalLabel.textContent = 'Total do pedido';

        const total = document.createElement('strong');
        total.textContent = `R$ ${Number(pedido.valor_total).toFixed(2).replace('.', ',')}`;

        footer.append(totalLabel, total);

        card.append(
            header,
            clienteSection,
            produtosSection,
            footer
        );

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
