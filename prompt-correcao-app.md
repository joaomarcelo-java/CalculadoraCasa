# Prompt de Correção — Aplicação de Previsão de Juros de Obra

## Contexto

Temos uma aplicação web de previsão de gastos durante a fase de obra de um financiamento habitacional (Minha Casa Minha Vida — Caixa Econômica Federal).

A aplicação está **incorreta**: atualmente ela pede o valor da parcela do financiamento como input do usuário, o que não faz sentido, pois os juros de obra são calculados sobre o **saldo liberado à construtora**, não sobre a parcela.

---

## Inputs do contrato (informados pelo usuário)

Estes valores devem ser **campos editáveis** na interface, pois variam de contrato para contrato. Usar os valores abaixo apenas como **placeholders** (sugestão de preenchimento), que aparecem no campo antes do usuário digitar:

| Campo | Placeholder | Descrição |
|---|---|---|
| Valor liberado para construção | R$ 190.141,27 | Consta no contrato como "Valor a ser liberado para construção" |
| Taxa de juros nominal mensal | 0,6383% | Consta no detalhamento do contrato |
| Seguro mensal (MIP + DFI) | R$ 35,38 | Soma do MIP + DFI cobrados mensalmente |
| Taxa de administração mensal | R$ 25,00 | Taxa fixa mensal da Caixa |

Esses campos devem ficar agrupados em uma seção chamada **"Dados do seu contrato"**, separada visualmente dos demais inputs.

---

## Fórmula de cálculo dos juros de obra (mês a mês)

```
valorLiberado(mês) = valorLiberadoContrato × (percentualAcumuladoObra / 100)
juros(mês)         = valorLiberado(mês) × (taxaMensal / 100)
encargo(mês)       = juros(mês) + seguroMensal + taxaAdm
```

O `percentualAcumuladoObra` de cada mês é obtido pela **Curva S** descrita abaixo, ajustada proporcionalmente ao número de meses que o usuário informar.

---

## Curva S de evolução da obra (baseada no cronograma real — 24 meses base)

Estes são os percentuais **acumulados** de evolução da obra mês a mês, extraídos do cronograma oficial:

```
Mês  0 →   0,00%
Mês  1 →   0,31%
Mês  2 →   1,18%
Mês  3 →   2,79%
Mês  4 →   5,35%
Mês  5 →   8,61%
Mês  6 →  14,31%
Mês  7 →  21,36%
Mês  8 →  28,34%
Mês  9 →  35,48%
Mês 10 →  44,57%
Mês 11 →  54,42%
Mês 12 →  65,08%
Mês 13 →  74,58%
Mês 14 →  79,94%
Mês 15 →  84,04%
Mês 16 →  86,25%
Mês 17 →  88,37%
Mês 18 →  90,25%
Mês 19 →  91,99%
Mês 20 →  93,00%
Mês 21 →  93,95%
Mês 22 →  94,80%
Mês 23 →  95,00%
Mês 24 → 100,00%
```

Quando o usuário informar um número de meses diferente de 24, a curva deve ser **interpolada proporcionalmente**: o progresso real de cada mês é mapeado para o equivalente na curva base de 24 meses usando a seguinte lógica:

```js
progressoReal     = mes / totalMeses          // 0 a 1
mesEquivalente    = progressoReal * 24         // mapeia para a curva base
pctAcumulado      = interpolarCurva(mesEquivalente)  // interpolação linear entre os pontos
```

Além disso, o sistema deve suportar 4 cenários de distorção temporal (atraso):

- **Cenário 1 — Previsto:** sem distorção, segue a curva base
- **Cenário 2 — Atraso no começo:** `q = p - 0.85 × p × (1-p)³`
- **Cenário 3 — Atraso no meio:** `q = p - 0.12 × 16 × p² × (1-p)²`
- **Cenário 4 — Atraso no final:** `q = p - 1.0 × p³ × (1-p)`

Onde `p = progressoReal` e `q` é usado no lugar de `progressoReal` para calcular o `mesEquivalente`.

---

## Todos os inputs que o usuário deve informar

### Seção "Dados do seu contrato"
| Campo | Placeholder | Descrição |
|---|---|---|
| Valor liberado para construção | 190141.27 | Valor a ser liberado para a obra |
| Taxa de juros nominal mensal (%) | 0.6383 | Taxa do contrato em % |
| Seguro mensal (MIP + DFI) | 35.38 | Soma dos seguros mensais |
| Taxa de administração mensal | 25.00 | Taxa fixa mensal |

### Seção "Dados da obra"
| Campo | Placeholder | Descrição |
|---|---|---|
| Meses de obra | 24 | Previsão de duração da obra em meses |
| Valor do muro + portão | 0.00 | Gasto extra que o usuário pretende fazer (pode ser R$ 0) |

**Remover completamente** qualquer input de "valor da parcela do financiamento" — esse dado não é necessário.

---

## Outputs que a aplicação deve exibir

### Tabela mensal (uma linha por mês) com as colunas:
1. Mês
2. % acumulado da obra
3. Valor liberado estimado (R$)
4. Juros de obra (R$)
5. Seguro (R$)
6. Taxa adm (R$)
7. **Encargo total do mês (R$)**

### Cards de resumo:
- **Total gasto na fase de obra** = soma de todos os encargos + valor do muro/portão
- **Total só em juros de obra** = soma apenas dos juros mensais
- **Valor do muro + portão** = conforme informado pelo usuário
- **Quanto guardar por mês (cada pessoa)** = total gasto ÷ meses ÷ 2

---

## Regra do "quanto guardar por mês"

O objetivo é que **duas pessoas** consigam guardar dinheiro mensalmente para cobrir todos os gastos da fase de obra (juros + seguros + taxa adm + muro/portão) sem aperto.

```
guardarPorPessoa = totalGasto / totalMeses / 2
```

---

## O que NÃO deve mudar

- A estrutura de abas da aplicação
- O sistema de cenários com os 4 botões
- A calculadora pessoal de gastos mensais (renda - gastos)
- A tabela da Curva Base do PDF
- O layout e CSS existentes
