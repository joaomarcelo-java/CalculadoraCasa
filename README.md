# 🏠 Previsão Casa - Simulador de Financiamento

Simulador de **juros de obra** para financiamento habitacional (Minha Casa Minha Vida — Caixa Econômica Federal). Calcula **4 cenários diferentes** de atraso na obra, baseado na **Curva S real** extraída do cronograma de obra (PDF 24 meses).

## 🔗 Acesse o projeto

👉 [Previsão Casa](https://joaomarcelo-java.github.io/CalculadoraCasa/)

---

## ✨ Funcionalidades

### 📋 Dados do contrato
- **Valor liberado para construção (R$)** — conforme contrato
- **Taxa de juros nominal mensal (%)** — taxa do financiamento
- **Seguro mensal (MIP + DFI)** — soma dos seguros
- **Taxa de administração mensal** — taxa fixa da Caixa

### 📅 Dados da obra
- **Meses até a obra ficar pronta** — duração prevista
- **Valor do muro + portão** — gasto extra opcional

### 🎯 4 cenários de atraso
| # | Cenário | Efeito |
|---|---------|--------|
| 1 | **📊 Previsto** | Segue exatamente a Curva S do PDF, sem atraso |
| 2 | **🔴 Atraso Inicial** | Atraso maior nos primeiros meses (fundação/infra) |
| 3 | **🟡 Atraso no Meio** | Atraso concentrado no meio da obra (estrutura) |
| 4 | **🟠 Atraso no Final** | Atraso nos acabamentos finais |

### 📊 Resultados detalhados
- **Tabela mensal** com 7 colunas: Mês, % Obra, Valor Liberado, Juros, Seguro, Taxa Adm, Encargo Total
- **Gráfico de evolução** (Canvas) — % obra acumulado + encargo total mês a mês
- **Cards de resumo**: Total gasto, Total juros, Muro/Portão, Guardar por mês (cada pessoa)

### 💳 Calculadora Pessoal
- Adicione sua renda e gastos mensais para ver o saldo restante
- Interface dinâmica com adição/remoção de gastos

### 📈 Curva S do PDF (24 meses)
- Tabela expansível com os dados reais do cronograma de obra
- Percentuais do período e acumulados com barras visuais
- Interpolação linear para qualquer duração de obra
- **4 funções de distorção temporal** modelando cenários reais de atraso

## 🛠️ Tecnologias

- **HTML5** — Estrutura da página
- **CSS3** — Estilização com Flexbox, Grid e design responsivo
- **JavaScript (Vanilla JS)** — Lógica de cálculo, interatividade e gráfico Canvas (sem dependências externas)

## 🚀 Como usar

1. Acesse o [link do projeto](https://joaomarcelo-java.github.io/CalculadoraCasa/)
2. Preencha os dados do seu contrato de financiamento
3. Preencha os dados da obra (meses, muro/portão)
4. Clique em um dos 4 cenários desejados
5. Veja a tabela, o gráfico e os resumos instantaneamente

Ou clone o repositório e abra o arquivo `index.html` no navegador:

```bash
git clone https://github.com/joaomarcelo-java/CalculadoraCasa.git
cd CalculadoraCasa
start index.html
```

## 🧮 Fórmula de cálculo

```
valorLiberado(mês)   = valorConstrucao × (pctAcumulado / 100)
juros(mês)           = valorLiberado × (taxaMensal / 100)
encargoTotal(mês)    = juros + seguroMensal + taxaAdm
guardarPorPessoa     = totalGasto / totalMeses / 2
```

O `pctAcumulado` de cada mês é obtido pela **Curva S** do PDF (24 meses), interpolada proporcionalmente à duração informada, com distorção temporal conforme o cenário escolhido.

## 📂 Estrutura do projeto

```
CalculadoraCasa/
├── index.html      # Página principal
├── style.css       # Estilos CSS
├── script.js       # Lógica JavaScript
└── README.md       # Documentação
```

## 📄 Licença

Este projeto está sob a licença MIT.

---

⌨️ Desenvolvido por [João Marcelo](https://github.com/joaomarcelo-java)
