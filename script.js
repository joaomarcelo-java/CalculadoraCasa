/**
 * Previsão Casa - Lógica de cálculos
 * Convertida do C# (Program.cs + Funcoes.cs)
 */

// ===== FORMATAÇÃO =====
function formatMoney(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ===== FUNÇÕES DE CÁLCULO (convertidas do C#) =====

/**
 * Cenário 1: Atraso no Começo
 */
function calcularAtrasoComeco(valorParcela, valorMuroPortao, mesesObraPronta) {
    const totalPagoMensal = [];
    const taxasCiclo = [10, 20, 30];
    const faseLenta = Math.floor(mesesObraPronta / 3);
    const mesesFase2 = mesesObraPronta - faseLenta;
    let totalPago = 0;

    for (let i = 0; i < mesesObraPronta; i++) {
        let taxa;
        if (i < faseLenta) {
            taxa = taxasCiclo[i % taxasCiclo.length];
        } else {
            const i2 = i - faseLenta;
            taxa = Math.min(40 + (Math.floor(i2 * 5 / Math.max(mesesFase2 - 1, 1))) * 10, 90);
        }

        const valorTaxa = valorParcela * (taxa / 100);
        totalPago += valorTaxa;
        totalPagoMensal.push({ mes: i + 1, taxa, valor: valorTaxa });
    }

    const totalGasto = totalPago + valorMuroPortao;
    const necessarioGuardar = (totalGasto / mesesObraPronta) / 2;

    return {
        titulo: "🔴 Cenário: Atraso no Começo",
        mensal: totalPagoMensal,
        totalGasto,
        valorMuroPortao,
        taxaObra: totalPago,
        guardarMes: necessarioGuardar
    };
}

/**
 * Cenário 2: Atraso no Meio
 */
function calcularAtrasoMeio(valorParcela, valorMuroPortao, mesesObraPronta) {
    const totalPagoMensal = [];
    const fase1 = Math.floor(mesesObraPronta / 3);
    const fase2 = Math.floor(mesesObraPronta / 3);
    const fase3 = mesesObraPronta - fase1 - fase2;
    let totalPago = 0;

    for (let i = 0; i < mesesObraPronta; i++) {
        let taxa;
        if (i < fase1) {
            taxa = Math.min(10 + (Math.floor(i * 3 / Math.max(fase1 - 1, 1))) * 10, 40);
        } else if (i < fase1 + fase2) {
            taxa = 50;
        } else {
            const i3 = i - fase1 - fase2;
            if (i === mesesObraPronta - 1)
                taxa = 90;
            else
                taxa = Math.min(60 + (Math.floor(i3 * 3 / Math.max(fase3 - 1, 1))) * 10, 90);
        }

        const valorTaxa = valorParcela * (taxa / 100);
        totalPago += valorTaxa;
        totalPagoMensal.push({ mes: i + 1, taxa, valor: valorTaxa });
    }

    const totalGasto = totalPago + valorMuroPortao;
    const necessarioGuardar = (totalGasto / mesesObraPronta) / 2;

    return {
        titulo: "🟡 Cenário: Atraso no Meio",
        mensal: totalPagoMensal,
        totalGasto,
        valorMuroPortao,
        taxaObra: totalPago,
        guardarMes: necessarioGuardar
    };
}

/**
 * Cenário 3: Atraso no Final
 */
function calcularAtrasoFinal(valorParcela, valorMuroPortao, mesesObraPronta) {
    const totalPagoMensal = [];
    const faseRapida = Math.floor((mesesObraPronta * 2) / 3);
    const faseLenta = mesesObraPronta - faseRapida;
    let totalPago = 0;

    for (let i = 0; i < mesesObraPronta; i++) {
        let taxa;
        if (i === mesesObraPronta - 1) {
            taxa = 90;
        } else if (i < faseRapida) {
            taxa = Math.min(10 + (Math.floor(i * 6 / Math.max(faseRapida - 1, 1))) * 10, 70);
        } else {
            taxa = 80;
        }

        const valorTaxa = valorParcela * (taxa / 100);
        totalPago += valorTaxa;
        totalPagoMensal.push({ mes: i + 1, taxa, valor: valorTaxa });
    }

    const totalGasto = totalPago + valorMuroPortao;
    const necessarioGuardar = (totalGasto / mesesObraPronta) / 2;

    return {
        titulo: "🟠 Cenário: Atraso no Final",
        mensal: totalPagoMensal,
        totalGasto,
        valorMuroPortao,
        taxaObra: totalPago,
        guardarMes: necessarioGuardar
    };
}

/**
 * Cenário 4: Sem Atraso
 */
function calcularSemAtraso(valorParcela, valorMuroPortao, mesesObraPronta) {
    const totalPagoMensal = [];
    let totalPago = 0;

    for (let i = 0; i < mesesObraPronta; i++) {
        let taxa;
        if (i === mesesObraPronta - 1)
            taxa = 90;
        else
            taxa = Math.min(10 + (Math.floor(i * 8 / Math.max(mesesObraPronta - 1, 1))) * 10, 90);

        const valorTaxa = valorParcela * (taxa / 100);
        totalPago += valorTaxa;
        totalPagoMensal.push({ mes: i + 1, taxa, valor: valorTaxa });
    }

    const totalGasto = totalPago + valorMuroPortao;
    const necessarioGuardar = (totalGasto / mesesObraPronta) / 2;

    return {
        titulo: "🟢 Cenário: Sem Atraso",
        mensal: totalPagoMensal,
        totalGasto,
        valorMuroPortao,
        taxaObra: totalPago,
        guardarMes: necessarioGuardar
    };
}

// ===== CONTROLE DE UI =====

// Mapeamento de cenários
const calculadoras = {
    1: calcularAtrasoComeco,
    2: calcularAtrasoMeio,
    3: calcularAtrasoFinal,
    4: calcularSemAtraso
};

// Elementos DOM
const valorParcelaInput = document.getElementById('valorParcela');
const mesesObraInput = document.getElementById('mesesObra');
const valorMuroPortaoInput = document.getElementById('valorMuroPortao');
const botoesCenario = document.querySelectorAll('.btn-cenario');
const resultSection = document.getElementById('result-section');
const resultTitle = document.getElementById('result-title');
const tableBody = document.getElementById('table-body');
const totalGastoEl = document.getElementById('totalGasto');
const valorMuroEl = document.getElementById('valorMuro');
const taxaObraEl = document.getElementById('taxaObra');
const guardarMesEl = document.getElementById('guardarMes');

/**
 * Obtém os valores dos inputs validados
 */
function obterValores() {
    const valorParcela = parseFloat(valorParcelaInput.value);
    const mesesObra = parseInt(mesesObraInput.value);
    const valorMuroPortao = parseFloat(valorMuroPortaoInput.value);

    if (isNaN(valorParcela) || valorParcela <= 0) {
        alert('Por favor, digite um valor válido para a parcela.');
        valorParcelaInput.focus();
        return null;
    }
    if (isNaN(mesesObra) || mesesObra < 1) {
        alert('Por favor, digite um número válido de meses.');
        mesesObraInput.focus();
        return null;
    }
    if (isNaN(valorMuroPortao) || valorMuroPortao < 0) {
        alert('Por favor, digite um valor válido para muro e portão.');
        valorMuroPortaoInput.focus();
        return null;
    }

    return { valorParcela, mesesObra, valorMuroPortao };
}

/**
 * Renderiza os resultados na tela
 */
function renderizarResultados(resultado) {
    // Título
    resultTitle.textContent = `📊 ${resultado.titulo}`;

    // Tabela mensal
    tableBody.innerHTML = resultado.mensal.map(item => `
        <tr>
            <td><strong>Mês ${item.mes}</strong></td>
            <td>${item.taxa}%</td>
            <td>R$ ${formatMoney(item.valor)}</td>
        </tr>
    `).join('');

    // Cards de resumo
    totalGastoEl.textContent = `R$ ${formatMoney(resultado.totalGasto)}`;
    valorMuroEl.textContent = `R$ ${formatMoney(resultado.valorMuroPortao)}`;
    taxaObraEl.textContent = `R$ ${formatMoney(resultado.taxaObra)}`;
    guardarMesEl.textContent = `R$ ${formatMoney(resultado.guardarMes)}`;

    // Mostrar seção de resultados (com animação)
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Manipula clique em um cenário
 */
function handleCenarioClick(event) {
    const botao = event.currentTarget;
    const cenario = parseInt(botao.dataset.cenario);

    // Validar inputs
    const valores = obterValores();
    if (!valores) return;

    // Atualizar estado ativo dos botões
    botoesCenario.forEach(btn => btn.classList.remove('active'));
    botao.classList.add('active');

    // Calcular e renderizar
    const calculadora = calculadoras[cenario];
    const resultado = calculadora(valores.valorParcela, valores.valorMuroPortao, valores.mesesObra);
    renderizarResultados(resultado);
}

// ===== SISTEMA DE ABAS =====

const botoesTab = document.querySelectorAll('.tab-btn');
const conteudosTab = document.querySelectorAll('.tab-content');

function alternarAba(tabId) {
    // Atualizar botões
    botoesTab.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    // Atualizar conteúdos
    conteudosTab.forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabId}`);
    });
}

botoesTab.forEach(btn => {
    btn.addEventListener('click', () => {
        alternarAba(btn.dataset.tab);
    });
});

// ===== EVENT LISTENERS =====

// Adicionar listeners aos botões de cenário

botoesCenario.forEach(botao => {
    botao.addEventListener('click', handleCenarioClick);
});

// Habilitar Enter nos inputs para disparar o primeiro cenário selecionado
function handleEnterKey(event) {
    if (event.key === 'Enter') {
        const botaoAtivo = document.querySelector('.btn-cenario.active');
        if (botaoAtivo) {
            botaoAtivo.click();
        } else {
            // Se nenhum cenário ativo, clica no primeiro
            botoesCenario[0].click();
        }
    }
}

[valorParcelaInput, mesesObraInput, valorMuroPortaoInput].forEach(input => {
    input.addEventListener('keydown', handleEnterKey);
});

// ===== CALCULADORA PESSOAL =====

/** Lista de gastos */
let gastos = [];
let gastoIdCounter = 0;

/** Elementos DOM da calculadora pessoal */
const rendaMensalInput = document.getElementById('rendaMensal');
const btnAddGasto = document.getElementById('btn-add-gasto');
const gastosListEl = document.getElementById('gastos-list');
const totalGastosEl = document.getElementById('totalGastos');
const saldoRestanteEl = document.getElementById('saldoRestante');
const saldoCard = document.getElementById('saldo-card');

/**
 * Atualiza o resumo (total de gastos e saldo restante)
 */
function atualizarResumoPessoal() {
    const renda = parseFloat(rendaMensalInput.value) || 0;
    const totalGastos = gastos.reduce((acc, g) => acc + g.valor, 0);
    const saldo = renda - totalGastos;

    totalGastosEl.textContent = `R$ ${formatMoney(totalGastos)}`;

    if (saldo >= 0) {
        saldoRestanteEl.textContent = `R$ ${formatMoney(saldo)}`;
        saldoCard.classList.remove('negativo');
    } else {
        saldoRestanteEl.textContent = `-R$ ${formatMoney(Math.abs(saldo))}`;
        saldoCard.classList.add('negativo');
    }
}

/**
 * Renderiza a lista de gastos no DOM
 */
function renderizarGastos() {
    if (gastos.length === 0) {
        gastosListEl.innerHTML = `<p class="hint" style="margin-bottom:0;">Nenhum gasto adicionado. Clique em "+ Adicionar gasto" acima.</p>`;
        return;
    }

    gastosListEl.innerHTML = gastos.map(g => `
        <div class="gasto-item" data-id="${g.id}">
            <span class="gasto-icon">📌</span>
            <input type="text" class="gasto-descricao" value="${g.descricao}" placeholder="Descrição do gasto">
            <input type="number" class="gasto-valor" step="0.01" min="0" value="${g.valor}" placeholder="Valor">
            <button class="btn-remove-gasto" title="Remover gasto">✕</button>
        </div>
    `).join('');

    // Adicionar eventos aos inputs de cada gasto
    const items = gastosListEl.querySelectorAll('.gasto-item');
    items.forEach(item => {
        const id = parseInt(item.dataset.id);
        const descInput = item.querySelector('.gasto-descricao');
        const valorInput = item.querySelector('.gasto-valor');
        const btnRemove = item.querySelector('.btn-remove-gasto');

        // Atualizar descrição ao digitar
        descInput.addEventListener('input', () => {
            const gasto = gastos.find(g => g.id === id);
            if (gasto) gasto.descricao = descInput.value;
        });

        // Atualizar valor ao digitar
        valorInput.addEventListener('input', () => {
            const gasto = gastos.find(g => g.id === id);
            if (gasto) {
                gasto.valor = parseFloat(valorInput.value) || 0;
                atualizarResumoPessoal();
            }
        });

        // Remover gasto
        btnRemove.addEventListener('click', () => {
            gastos = gastos.filter(g => g.id !== id);
            renderizarGastos();
            atualizarResumoPessoal();
        });
    });
}

/**
 * Adiciona um novo gasto vazio na lista
 */
function adicionarGasto() {
    gastoIdCounter++;
    gastos.push({
        id: gastoIdCounter,
        descricao: '',
        valor: 0
    });
    renderizarGastos();
    atualizarResumoPessoal();

    // Focar no campo de descrição do último gasto adicionado
    const items = gastosListEl.querySelectorAll('.gasto-item');
    const ultimo = items[items.length - 1];
    if (ultimo) {
        const descInput = ultimo.querySelector('.gasto-descricao');
        if (descInput) descInput.focus();
    }
}

// ===== EVENT LISTENERS =====

// Botão "Adicionar gasto"
btnAddGasto.addEventListener('click', adicionarGasto);

// Atualizar resumo quando a renda mudar
rendaMensalInput.addEventListener('input', atualizarResumoPessoal);

// Adicionar gasto ao pressionar Enter no campo de renda
rendaMensalInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        adicionarGasto();
    }
});
