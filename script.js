// Helpers de formatação
function parseCurrency(str) {
  if (!str) return 0;
  const num = parseFloat(String(str).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
  return isNaN(num) ? 0 : num;
}

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function maskCurrencyInput(el) {
  const raw = el.value.replace(/\D/g, '');
  const asNumber = raw ? parseInt(raw, 10) : 0;
  el.value = (asNumber / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function attachCurrencyMasks() {
  document.querySelectorAll('input.currency').forEach(e => {
    e.addEventListener('input', () => maskCurrencyInput(e));
    if(!e.value) e.value = '0,00';
  });
}

// Controle do Slider
const slider = document.getElementById('slider');
const stepPill = document.getElementById('stepPill');
const progressText = document.getElementById('progressText');
let current = 0;

function updateSlider() {
  slider.style.transform = `translateX(-${current * 100}%)`;
  const names = ['Início', 'Sobre Você', 'Educação', 'Padrão de Vida', 'Inventário', 'Diagnóstico', 'Contato'];
  stepPill.textContent = names[current];
  progressText.textContent = `Etapa ${Math.max(0, current)} de ${names.length - 2}`;
}

// Navegação entre os slides
document.getElementById('startBtn').addEventListener('click', () => { current = 1; updateSlider(); });
document.getElementById('toStep2').addEventListener('click', () => { current = 2; updateSlider(); });
document.getElementById('toStep3').addEventListener('click', () => { current = 3; updateSlider(); });
document.getElementById('toStep4').addEventListener('click', () => { current = 4; updateSlider(); });
document.getElementById('toStep5').addEventListener('click', () => { calculateAndShow(); current = 5; updateSlider(); });
document.getElementById('toStep6').addEventListener('click', () => { populateContact(); current = 6; updateSlider(); });

document.getElementById('backFrom1').addEventListener('click', () => { current = 0; updateSlider(); });
document.getElementById('backTo1fromEdu').addEventListener('click', () => { current = 1; updateSlider(); });
document.getElementById('backToEduFromLife').addEventListener('click', () => { current = 2; updateSlider(); });
document.getElementById('backToLifeFromInv').addEventListener('click', () => { current = 3; updateSlider(); });
document.getElementById('backToInvFromRes').addEventListener('click', () => { current = 4; updateSlider(); });
document.getElementById('backToResFromCont').addEventListener('click', () => { current = 5; updateSlider(); });


function calculateAndShow() {
  const idade = Number(document.getElementById('idade').value) || 0;
  const renda = parseCurrency(document.getElementById('renda').value) || 0;
  const noKids = document.getElementById('noKidsEdu').checked;
  const idade_f1 = Number(document.getElementById('idade_f1').value) || 0;
  const custo_f1 = parseCurrency(document.getElementById('custo_f1').value) || 0;
  const idade_f2 = Number(document.getElementById('idade_f2').value) || 0;
  const custo_f2 = parseCurrency(document.getElementById('custo_f2').value) || 0;
  const idade_f3 = Number(document.getElementById('idade_f3').value) || 0;
  const custo_f3 = parseCurrency(document.getElementById('custo_f3').value) || 0;
  const moradia = parseCurrency(document.getElementById('moradia').value) || 0;
  const alimentacao = parseCurrency(document.getElementById('alimentacao').value) || 0;
  const saude = parseCurrency(document.getElementById('saude').value) || 0;
  const lazer = parseCurrency(document.getElementById('lazer').value) || 0;
  const imoveis = parseCurrency(document.getElementById('imoveis').value) || 0;
  const carros = parseCurrency(document.getElementById('carros').value) || 0;
  const investimentos = parseCurrency(document.getElementById('investimentos').value) || 0;
  
  function getRate(age) {
    if (age <= 35) return 0.0003; if (age <= 45) return 0.0006; if (age <= 55) return 0.0014; return 0.0021;
  }
  function educTotal(ageChild, monthly) { return Math.max(0, 25 - ageChild) * (monthly * 12); }
  
  const totalEduc = noKids ? 0 : (educTotal(idade_f1, custo_f1) + educTotal(idade_f2, custo_f2) + educTotal(idade_f3, custo_f3));
  const totalVida = (moradia + alimentacao + saude + lazer) * 60;
  const totalInvent = (imoveis + carros + investimentos) * 0.20;
  const cobertura = totalEduc + totalVida + totalInvent;
  const mensalidade = cobertura * getRate(idade);
  const represent = renda > 0 ? (mensalidade / renda) : 0;
  
  document.getElementById('res_educ').textContent = formatCurrency(totalEduc);
  document.getElementById('res_life').textContent = formatCurrency(totalVida);
  document.getElementById('res_inv').textContent = formatCurrency(totalInvent);
  document.getElementById('res_total').textContent = formatCurrency(cobertura);
  document.getElementById('premio_mensal').textContent = formatCurrency(mensalidade);
  
  // --- LÓGICA DE REPRESENTATIVIDADE DA RENDA ATUALIZADA ---
  const repPercent = represent * 100;
  const repRendaEl = document.getElementById('rep_renda');
  const marketStatusEl = document.getElementById('marketStatus');
  const repTextEl = document.getElementById('rep_text');
  
  repRendaEl.textContent = isFinite(repPercent) ? `${repPercent.toFixed(1)}%` : '—';

  if (!isFinite(repPercent) || repPercent === 0) {
      marketStatusEl.textContent = 'N/A';
      marketStatusEl.style.color = 'var(--muted)';
      repTextEl.textContent = 'Preencha sua renda para análise.';
  } else if (repPercent < 2) {
      marketStatusEl.textContent = 'Abaixo do ideal';
      marketStatusEl.style.color = '#f0ad4e'; // Amarelo
      repTextEl.textContent = 'A proteção da sua família representa um valor acessível do seu orçamento, facilitando o primeiro passo para garantir o futuro que você planejou.';
  } else if (repPercent <= 5) {
      marketStatusEl.textContent = 'Na média ideal';
      marketStatusEl.style.color = '#28a745'; // Verde
      repTextEl.textContent = 'Seu planejamento está em perfeito equilíbrio: você protege sua família com um investimento alinhado à sua renda e às nossas recomendações.';
  } else {
      marketStatusEl.textContent = 'Acima da média';
      marketStatusEl.style.color = '#d9534f'; // Vermelho
      repTextEl.textContent = 'Seu plano demonstra que a proteção da sua família é uma alta prioridade. Um consultor pode ajudar a otimizar os valores para garantir o melhor custo-benefício.';
  }

  // Dica Rápida
  document.getElementById('quickTip').textContent = 'É recomendado revisar seu plano de proteção a cada 3 anos ou em caso de mudanças de vida (casamento, filhos, etc).';
  
  drawPie( [totalEduc, totalVida, totalInvent], ['Educação', 'Padrão de Vida', 'Inventário'] );
  document.getElementById('toStep6').disabled = false;
  window._lastSim = { cobertura, mensalidade };
}

let breakdownChart;
function drawPie(values, labels) {
    const ctx = document.getElementById('breakdownChart').getContext('2d');
    const chartColors = ['#7B0B12', '#B12327', '#FFD6D6'];
    const filteredData = values
        .map((value, index) => ({ value, label: labels[index], color: chartColors[index] }))
        .filter(item => item.value > 0);
    
    if (breakdownChart) { breakdownChart.destroy(); }
    
    breakdownChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: filteredData.map(d => d.label),
            datasets: [{
                data: filteredData.map(d => d.value),
                backgroundColor: filteredData.map(d => d.color),
                borderColor: '#fff', borderWidth: 2, hoverOffset: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '60%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.chart.getDatasetMeta(0).total;
                            const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) + '%' : '0%';
                            return `${context.label}: ${formatCurrency(context.raw)} (${percentage})`;
                        }
                    }
                }
            }
        }
    });

    const legend = document.getElementById('chartLegend');
    legend.innerHTML = '';
    filteredData.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.className = 'item';
        legendItem.innerHTML = `<div class="swatch" style="background-color:${item.color}"></div> <div>${item.label}</div>`;
        legend.appendChild(legendItem);
    });
}

function populateContact() {
  const { cobertura, mensalidade } = window._lastSim || {};
  if (cobertura && mensalidade) {
    document.getElementById('valor_total_input').value = formatCurrency(cobertura);
    document.getElementById('valor_mensal_input').value = formatCurrency(mensalidade);
  }
}

document.getElementById('sendLeadBtn').addEventListener('click', () => { /* Sua lógica de envio aqui */ });

// Inicialização
attachCurrencyMasks();
updateSlider();
