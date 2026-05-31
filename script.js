/**
 * Previsão Casa - Lógica de cálculos
 * Calcula juros de obra baseados na Curva S real extraída do Cronograma de Obra (PDF 24 meses)
 * Método: Interpolação com Curva Base + Distorção Temporal
 */

// ===== FORMATAÇÃO =====
function formatMoney(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ===== CURVA BASE (dados reais extraídos do PDF - 24 meses) =====
// Percentuais ACUMULADOS de evolução da obra mês a mês
const curvaBase = [
    0,       // mês 0  - 0%
    0.31,    // mês 1  - 0.31%
    1.18,    // mês 2  - 1.18%
    2.79,    // mês 3  - 2.79%
    5.35,    // mês 4  - 5.35%
    8.61,    // mês 5  - 8.61%
    14.31,   // mês 6  - 14.31%
    21.36,   // mês 7  - 21.36%
    28.34,   // mês 8  - 28.34%
    35.48,   // mês 9  - 35.48%
    44.57,   // mês 10 - 44.57%
    54.42,   // mês 11 - 54.42%
    65.08,   // mês 12 - 65.08%
    74.58,   // mês 13 - 74.58%
    79.94,   // mês 14 - 79.94%
    84.04,   // mês 15 - 84.04%
    86.25,   // mês 16 - 86.25%
    88.37,   // mês 17 - 88.37%
    90.25,   // mês 18 - 90.25%
    91.99,   // mês 19 - 91.99%
    93.00,   // mês 20 - 93.00%
    93.95,   // mês 21 - 93.95%
    94.80,   // mês 22 - 94.80%
    95.00,   // mês 23 - 95.00%
    100.00   // mês 24 - 100.00%
];

const TOTAL_MESES_BASE = 24;

// ===== INTERPOLAÇÃO LINEAR NA CURVA BASE =====
function interpolarCurva(mesFracionario) {
    if (mesFracionario <= 0) return 0;
    if (mesFracionario >= TOTAL_MESES_BASE) return 100;

    const mesInteiro = Math.floor(mesFracionario);
    const fracao = mesFracionario - mesInteiro;

    const valorAnterior = curvaBase[mesInteiro];
    const valorPosterior = curvaBase[mesInteiro + 1];

    return valorAnterior + (valorPosterior - valorAnterior) * fracao;
}

// ===== FUNÇÕES DE DISTORÇÃO TEMPORAL =====
function distorcaoPadrao(p) {
    return p; // identidade - sem distorção
}

function distorcaoInicial(p) {
    const a = 0.85;
    return Math.max(0, p - a * p * Math.pow(1 - p, 3));
}

function distorcaoMeio(p) {
    const a = 0.12;
    return Math.max(0, p - a * 16 * p * p * (1 - p) * (1 - p));
}

function distorcaoFinal(p) {
    const a = 1.0;
    return Math.max(0, p - a * p * p * p * (1 - p));
}

const funcoesDistorcao = {
    1: distorcaoPadrao,    // Previsto
    2: distorcaoInicial,   // Atraso no Começo
    3: distorcaoMeio,       // Atraso no Meio
    4: distorcaoFinal       // Atraso no Final
};

const titulosCenarios = {
    1: "📊 Previsto (Curva PDF)",
    2: "🔴 Atraso no Começo",
    3: "🟡 Atraso no Meio",
    4: "🟠 Atraso no Final"
};

// ===== FUNÇÃO PRINCIPAL DE CÁLCULO =====
/**
 * Calcula os juros de obra mês a mês baseado na Curva S.
 *
 * Fórmula:
 *   valorLiberado(mês)    = valorConstrucao × (pctAcumulado / 100)
 *   juros(mês)            = valorLiberado × (taxaMensal / 100)
 *   encargoTotal(mês)     = juros + seguroMensal + taxaAdm
 */
function calcularJurosObra(valorConstrucao, taxaJurosMensal, seguroMensal, taxaAdm, totalMeses, tipoAtraso) {
    const distorcao = funcoesDistorcao[tipoAtraso];

    const mensal = [];
    let totalJuros = 0;
    let totalEncargos = 0;

    for (let i = 1; i <= totalMeses; i++) {
        const progressoReal = i / totalMeses;
        const progressoEfetivo = distorcao(progressoReal);
        const mesEquivalente = progressoEfetivo * TOTAL_MESES_BASE;
        const pctAcumulado = interpolarCurva(mesEquivalente);

        const valorLiberado = valorConstrucao * (pctAcumulado / 100);
        const juros = valorLiberado * (taxaJurosMensal / 100);
        const encargoTotal = juros + seguroMensal + taxaAdm;

        totalJuros += juros;
        totalEncargos += encargoTotal;

        mensal.push({
            mes: i,
            pctAcumulado: pctAcumulado,
            valorLiberado: valorLiberado,
            juros: juros,
            seguro: seguroMensal,
            taxaAdm: taxaAdm,
            encargoTotal: encargoTotal
        });
    }

    return {
        titulo: titulosCenarios[tipoAtraso],
        mensal: mensal,
        totalEncargos: totalEncargos,
        totalJuros: totalJuros,
        seguroMensal: seguroMensal,
        taxaAdm: taxaAdm
    };
}

// ===== PREENCHER TABELA DA CURVA BASE (PDF) =====
function preencherTabelaCurvaBase() {
    const tbody = document.getElementById('curva-base-body');
    if (!tbody) return;

    const pctsPeriodo = [];
    for (let i = 1; i <= TOTAL_MESES_BASE; i++) {
        pctsPeriodo.push(curvaBase[i] - curvaBase[i - 1]);
    }

    tbody.innerHTML = curvaBase.slice(1).map((acumulado, i) => {
        const mes = i + 1;
        const pctPeriodo = pctsPeriodo[i];
        const barraWidth = Math.max(2, pctPeriodo * 8);
        return `
            <tr>
                <td><strong>Mês ${mes}</strong></td>
                <td>${pctPeriodo.toFixed(2).replace('.', ',')}%</td>
                <td>${acumulado.toFixed(2).replace('.', ',')}%</td>
                <td><span class="barra-curva" style="width: ${barraWidth}px;"></span></td>
            </tr>
        `;
    }).join('');
}

// ===== CONTROLE DE UI =====

// Elementos DOM
const valorConstrucaoInput = document.getElementById('valorConstrucao');
const taxaJurosMensalInput = document.getElementById('taxaJurosMensal');
const seguroMensalInput = document.getElementById('seguroMensal');
const taxaAdmInput = document.getElementById('taxaAdm');
const mesesObraInput = document.getElementById('mesesObra');
const valorMuroPortaoInput = document.getElementById('valorMuroPortao');
const botoesCenario = document.querySelectorAll('.btn-cenario');
const resultSection = document.getElementById('result-section');
const resultTitle = document.getElementById('result-title');
const tableBody = document.getElementById('table-body');
const totalGastoEl = document.getElementById('totalGasto');
const totalJurosEl = document.getElementById('totalJuros');
const valorMuroEl = document.getElementById('valorMuro');
const guardarMesEl = document.getElementById('guardarMes');

/**
 * Obtém os valores dos inputs validados
 */
function obterValores() {
    const valorConstrucao = parseFloat(valorConstrucaoInput.value);
    const taxaJurosMensal = parseFloat(taxaJurosMensalInput.value);
    const seguroMensal = parseFloat(seguroMensalInput.value);
    const taxaAdm = parseFloat(taxaAdmInput.value);
    const mesesObra = parseInt(mesesObraInput.value);
    const valorMuroPortao = parseFloat(valorMuroPortaoInput.value);

    if (isNaN(valorConstrucao) || valorConstrucao <= 0) {
        alert('Por favor, digite um valor válido para "Valor liberado para construção".');
        valorConstrucaoInput.focus();
        return null;
    }
    if (isNaN(taxaJurosMensal) || taxaJurosMensal < 0) {
        alert('Por favor, digite uma taxa de juros válida.');
        taxaJurosMensalInput.focus();
        return null;
    }
    if (isNaN(seguroMensal) || seguroMensal < 0) {
        alert('Por favor, digite um valor válido para o seguro mensal.');
        seguroMensalInput.focus();
        return null;
    }
    if (isNaN(taxaAdm) || taxaAdm < 0) {
        alert('Por favor, digite um valor válido para taxa de administração.');
        taxaAdmInput.focus();
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

    return { valorConstrucao, taxaJurosMensal, seguroMensal, taxaAdm, mesesObra, valorMuroPortao };
}

/**
 * Renderiza os resultados na tela
 */
function renderizarResultados(resultado, valorMuroPortao, totalMeses) {
    resultTitle.textContent = `📊 ${resultado.titulo}`;

    // Tabela mensal
    tableBody.innerHTML = resultado.mensal.map(item => `
        <tr>
            <td><strong>${item.mes}</strong></td>
            <td>${item.pctAcumulado.toFixed(2).replace('.', ',')}%</td>
            <td>R$ ${formatMoney(item.valorLiberado)}</td>
            <td>R$ ${formatMoney(item.juros)}</td>
            <td>R$ ${formatMoney(item.seguro)}</td>
            <td>R$ ${formatMoney(item.taxaAdm)}</td>
            <td><strong>R$ ${formatMoney(item.encargoTotal)}</strong></td>
        </tr>
    `).join('');

    // Cards de resumo
    const totalGasto = resultado.totalEncargos + valorMuroPortao;
    totalGastoEl.textContent = `R$ ${formatMoney(totalGasto)}`;
    totalJurosEl.textContent = `R$ ${formatMoney(resultado.totalJuros)}`;
    valorMuroEl.textContent = `R$ ${formatMoney(valorMuroPortao)}`;
    guardarMesEl.textContent = `R$ ${formatMoney(totalGasto / totalMeses / 2)}`;

    // Gráfico
    desenharGrafico(resultado.mensal);

    // Mostrar seção de resultados
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * ===== GRÁFICO DE EVOLUÇÃO =====
 * Desenha no canvas duas séries: % Obra Acumulado (azul) e Encargo Total (vermelho)
 */
function desenharGrafico(dados) {
    const canvas = document.getElementById('chart-canvas');
    if (!canvas || !dados || dados.length === 0) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const MARGIN = { top: 20, right: 10, bottom: 36, left: 50 };
    const chartW = W - MARGIN.left - MARGIN.right;
    const chartH = H - MARGIN.top - MARGIN.bottom;

    // Máximo do encargo para escala
    const maxEncargo = Math.max(...dados.map(d => d.encargoTotal));
    const maxEncargoAprox = Math.ceil(maxEncargo / 50) * 50 || 100;

    // Limpar
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fafbfc';
    ctx.fillRect(0, 0, W, H);

    // Grade horizontal (5 linhas)
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = MARGIN.top + (chartH / 5) * i;
        ctx.beginPath();
        ctx.moveTo(MARGIN.left, y);
        ctx.lineTo(MARGIN.left + chartW, y);
        ctx.stroke();
    }

    // Eixo X - rótulos dos meses
    ctx.fillStyle = '#999';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    const step = Math.max(1, Math.floor(dados.length / 12));
    for (let i = 0; i < dados.length; i++) {
        if (i % step === 0 || i === dados.length - 1) {
            const x = MARGIN.left + (i / (dados.length - 1 || 1)) * chartW;
            ctx.fillText(`M${dados[i].mes}`, x, H - MARGIN.bottom + 16);
        }
    }

    // Eixo Y esquerdo - % Obra
    ctx.fillStyle = '#667eea';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const val = (i / 4) * 100;
        const y = MARGIN.top + chartH - (i / 4) * chartH;
        ctx.fillText(`${val}%`, MARGIN.left - 6, y + 3);
    }
    ctx.save();
    ctx.fillStyle = '#667eea';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.translate(14, MARGIN.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('% Obra', 0, 0);
    ctx.restore();

    // Eixo Y direito - Encargo R$
    ctx.fillStyle = '#e74c3c';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    for (let i = 0; i <= 4; i++) {
        const val = (i / 4) * maxEncargoAprox;
        const y = MARGIN.top + chartH - (i / 4) * chartH;
        ctx.fillText(`R$ ${formatMoney(val)}`, MARGIN.left + chartW + 4, y + 3);
    }

    // Coordenadas
    function ponto(mes, valorPct, valorEncargo) {
        const x = MARGIN.left + ((mes - 1) / (dados.length - 1 || 1)) * chartW;
        return {
            x,
            yPct: MARGIN.top + chartH - (valorPct / 100) * chartH,
            yEnc: MARGIN.top + chartH - (valorEncargo / maxEncargoAprox) * chartH
        };
    }

    const pts = dados.map((d, i) => ponto(d.mes, d.pctAcumulado, d.encargoTotal));

    // Área azul (fill abaixo da curva % obra)
    ctx.beginPath();
    ctx.moveTo(pts[0].x, MARGIN.top + chartH);
    pts.forEach(p => ctx.lineTo(p.x, p.yPct));
    ctx.lineTo(pts[pts.length - 1].x, MARGIN.top + chartH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(102, 126, 234, 0.10)';
    ctx.fill();

    // Linha azul - % Obra
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.yPct) : ctx.lineTo(p.x, p.yPct));
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.yPct, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#667eea';
        ctx.fill();
    });

    // Linha vermelha - Encargo Total
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.yEnc) : ctx.lineTo(p.x, p.yEnc));
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.yEnc, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
    });

    // Linha vertical tracejada no último mês
    const ultimo = pts[pts.length - 1];
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(ultimo.x, MARGIN.top);
    ctx.lineTo(ultimo.x, MARGIN.top + chartH);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // Label valor final do encargo
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`R$ ${formatMoney(dados[dados.length - 1].encargoTotal)}`, ultimo.x, ultimo.yEnc - 10);

    // Label valor final % obra
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${dados[dados.length - 1].pctAcumulado.toFixed(1)}%`, ultimo.x, ultimo.yPct - 10);
}

/**
 * Manipula clique em um cenário
 */
function handleCenarioClick(event) {
    const botao = event.currentTarget;
    const cenario = parseInt(botao.dataset.cenario);

    const valores = obterValores();
    if (!valores) return;

    // Atualizar estado ativo dos botões
    botoesCenario.forEach(btn => btn.classList.remove('active'));
    botao.classList.add('active');

    // Calcular
    const resultado = calcularJurosObra(
        valores.valorConstrucao,
        valores.taxaJurosMensal,
        valores.seguroMensal,
        valores.taxaAdm,
        valores.mesesObra,
        cenario
    );

    renderizarResultados(resultado, valores.valorMuroPortao, valores.mesesObra);
}

// ===== SISTEMA DE ABAS =====
const botoesTab = document.querySelectorAll('.tab-btn');
const conteudosTab = document.querySelectorAll('.tab-content');

function alternarAba(tabId) {
    botoesTab.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
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
botoesCenario.forEach(botao => {
    botao.addEventListener('click', handleCenarioClick);
});

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        const botaoAtivo = document.querySelector('.btn-cenario.active');
        if (botaoAtivo) {
            botaoAtivo.click();
        } else {
            botoesCenario[0].click();
        }
    }
}

const inputsForm = [
    valorConstrucaoInput, taxaJurosMensalInput, seguroMensalInput,
    taxaAdmInput, mesesObraInput, valorMuroPortaoInput
];

inputsForm.forEach(input => {
    input.addEventListener('keydown', handleEnterKey);
});

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    preencherTabelaCurvaBase();
});

// ===== CALCULADORA PESSOAL =====
let gastos = [];
let gastoIdCounter = 0;

const rendaMensalInput = document.getElementById('rendaMensal');
const btnAddGasto = document.getElementById('btn-add-gasto');
const gastosListEl = document.getElementById('gastos-list');
const totalGastosEl = document.getElementById('totalGastos');
const saldoRestanteEl = document.getElementById('saldoRestante');
const saldoCard = document.getElementById('saldo-card');

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

    const items = gastosListEl.querySelectorAll('.gasto-item');
    items.forEach(item => {
        const id = parseInt(item.dataset.id);
        const descInput = item.querySelector('.gasto-descricao');
        const valorInput = item.querySelector('.gasto-valor');
        const btnRemove = item.querySelector('.btn-remove-gasto');

        descInput.addEventListener('input', () => {
            const gasto = gastos.find(g => g.id === id);
            if (gasto) gasto.descricao = descInput.value;
        });

        valorInput.addEventListener('input', () => {
            const gasto = gastos.find(g => g.id === id);
            if (gasto) {
                gasto.valor = parseFloat(valorInput.value) || 0;
                atualizarResumoPessoal();
            }
        });

        btnRemove.addEventListener('click', () => {
            gastos = gastos.filter(g => g.id !== id);
            renderizarGastos();
            atualizarResumoPessoal();
        });
    });
}

function adicionarGasto() {
    gastoIdCounter++;
    gastos.push({
        id: gastoIdCounter,
        descricao: '',
        valor: 0
    });
    renderizarGastos();
    atualizarResumoPessoal();

    const items = gastosListEl.querySelectorAll('.gasto-item');
    const ultimo = items[items.length - 1];
    if (ultimo) {
        const descInput = ultimo.querySelector('.gasto-descricao');
        if (descInput) descInput.focus();
    }
}

btnAddGasto.addEventListener('click', adicionarGasto);
rendaMensalInput.addEventListener('input', atualizarResumoPessoal);
rendaMensalInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        adicionarGasto();
    }
});
