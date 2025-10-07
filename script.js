// Helpers de formatação (não são segredos de negócio)
const fmt = n => (Number.isFinite(n) ? n.toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2,maximumFractionDigits:2}) : 'R$ 0,00');

function parseCurrency(str){
  if(!str) return 0;
  const cleaned = String(str).replace(/\s/g,'').replace(/\./g,'').replace(/,/g,'.').replace(/[^\d.]/g,'');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function formatCurrency(value){
  return value.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
}

function maskCurrencyInput(el){
  const raw = el.value;
  const digits = raw.replace(/\D/g,'');
  const asNumber = digits ? parseInt(digits,10) : 0;
  const cents = asNumber / 100;
  el.value = formatCurrency(cents);
}

function attachCurrencyMasks(){
  const elems = document.querySelectorAll('input.currency');
  elems.forEach(e=>{
    if(e.value){
      const v = e.value;
      const containsSep = /[\,\.]/.test(v);
      if(!containsSep){
        const num = Number(v)||0;
        e.value = formatCurrency(num);
      } else {
        const parsed = parseCurrency(v);
        e.value = formatCurrency(parsed);
      }
    }
    e.addEventListener('input', ()=>maskCurrencyInput(e));
    e.addEventListener('blur', ()=>{ if(!e.value) e.value='0,00'; });
  });

  const renda = document.getElementById('renda');
  if(renda){
    renda.addEventListener('input', ()=>maskCurrencyInput(renda));
  }
}

// Controle do Slider
const slider = document.getElementById('slider');
let current = 0;
const totalSlides = 7;
const stepPill = document.getElementById('stepPill');
const progressText = document.getElementById('progressText');

function updateSlider(){
  slider.style.transform = `translateX(-${current*100}%)`;
  const names = ['Início','Dados Pessoais','Educação','Custos de Vida','Inventário','Resultado','Contato'];
  stepPill.textContent = names[current];
  progressText.textContent = `Etapa ${Math.max(0,current)} de 6`;
}

// Navegação entre os slides
document.getElementById('startBtn').addEventListener('click', ()=>{ current = 1; updateSlider(); });
document.getElementById('toStep2').addEventListener('click', ()=>{
  const nome = document.getElementById('nome').value.trim();
  const idade = Number(document.getElementById('idade').value);
  if(!nome || !idade){ alert('Preencha Nome e Idade para continuar.'); return; }
  current = 2; updateSlider();
});
document.getElementById('backFrom1').addEventListener('click', ()=>{ current = 0; updateSlider(); });
document.getElementById('backTo1fromEdu').addEventListener('click', ()=>{ current = 1; updateSlider(); });
document.getElementById('toStep3').addEventListener('click', ()=>{ current = 3; updateSlider(); });
document.getElementById('backToEduFromLife').addEventListener('click', ()=>{ current = 2; updateSlider(); });
document.getElementById('toStep4').addEventListener('click', ()=>{ current = 4; updateSlider(); });
document.getElementById('backToLifeFromInv').addEventListener('click', ()=>{ current = 3; updateSlider(); });
document.getElementById('toStep5').addEventListener('click', ()=>{ calculateAndShow(); current = 5; updateSlider(); });
document.getElementById('backToInvFromRes').addEventListener('click', ()=>{ current = 4; updateSlider(); });
document.getElementById('toStep6').addEventListener('click', ()=>{ current = 6; populateContact(); updateSlider(); });
document.getElementById('backToResFromCont').addEventListener('click', ()=>{ current = 5; updateSlider(); });


// A NOVA FUNÇÃO DE CÁLCULO QUE CHAMA O BACKEND
async function calculateAndShow() {
  // 1. Coletamos todos os dados do formulário, como antes.
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
  const saude = parseCurrency(document.getElementById('saude').value) || 0;
  const lazer = parseCurrency(document.getElementById('lazer').value) || 0;
  const vestuario = parseCurrency(document.getElementById('vestuario').value) || 0;
  const imoveis = parseCurrency(document.getElementById('imoveis').value) || 0;
  const carros = parseCurrency(document.getElementById('carros').value) || 0;
  const investimentos = parseCurrency(document.getElementById('investimentos').value) || 0;

  // Criamos um "pacote" de dados para enviar
  const dadosParaEnviar = {
    idade, renda, noKids, idade_f1, custo_f1, idade_f2, custo_f2, idade_f3, custo_f3,
    moradia, saude, lazer, vestuario, imoveis, carros, investimentos
  };

  try {
    // 2. ENVIAMOS OS DADOS para o nosso backend em /api/calcular
    const response = await fetch('/api/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosParaEnviar),
    });

    if (!response.ok) {
      throw new Error('Houve um erro no cálculo. Tente novamente.');
    }

    // 3. RECEBEMOS OS RESULTADOS de volta do servidor
    const results = await response.json();
    
    // 4. Agora, usamos os resultados para ATUALIZAR A PÁGINA
    const { totalEduc, totalVida, totalInvent, cobertura, mensalidade, represent } = results;
    
    // Determina o status de mercado
    const repPercent = represent * 100;
    let status = '—';
    if (!isFinite(repPercent) || repPercent === 0) status = '—';
    else if (repPercent < 2) status = 'Abaixo da faixa';
    else if (repPercent <= 5) status = 'Dentro da faixa';
    else status = 'Acima da faixa';

    // Atualiza a interface
    document.getElementById('res_educ').textContent = formatCurrency(totalEduc);
    document.getElementById('res_life').textContent = formatCurrency(totalVida);
    document.getElementById('res_inv').textContent = formatCurrency(totalInvent);
    document.getElementById('res_total').textContent = formatCurrency(cobertura);
    document.getElementById('premio_mensal').textContent = formatCurrency(mensalidade);
    document.getElementById('rep_renda').textContent = isFinite(represent) ? ((represent * 100).toFixed(1) + '%') : '—';
    document.getElementById('marketStatus').textContent = status;
    document.getElementById('quickTip').textContent = (status === 'Acima da faixa') ? 'Considere revisar coberturas ou prazos com um consultor.' : 'Plano dentro da recomendação de mercado.';

    [
        document.getElementById('res_educ'), document.getElementById('res_life'), document.getElementById('res_inv'),
        document.getElementById('res_total'), document.getElementById('premio_mensal'), document.getElementById('rep_renda')
    ].forEach(el => {
      el.classList.remove('fade-in');
      void el.offsetWidth;
      el.classList.add('fade-in');
    });

    drawPie([totalEduc, totalVida, totalInvent], ['Educação', 'Vida', 'Inventário']);
    document.getElementById('toStep6').disabled = false;
    window._lastSim = { cobertura, mensalidade };

  } catch (error) {
    console.error('Erro:', error);
    alert('Não foi possível calcular. Verifique sua conexão ou tente mais tarde.');
  }
}


// Lógica do Gráfico
const ctx = document.getElementById('breakdownChart').getContext('2d');
let _slices = [];
function drawPie(values, labels){
  const c = ctx; const canvas = c.canvas; c.clearRect(0,0,canvas.width, canvas.height);
  const total = values.reduce((a,b)=>a+b,0) || 1;
  const cx = canvas.width/2, cy = canvas.height/2, radius = Math.min(cx,cy)-20;
  let start = -Math.PI/2;
  const colors = ['#7B0B12','#B12327','#FFD6D6'];
  _slices = [];
  for(let i=0;i<values.length;i++){
    const slice = values[i]/total * Math.PI*2;
    const end = start + slice;
    c.beginPath(); c.moveTo(cx,cy); c.arc(cx,cy,radius,start,end); c.closePath(); c.fillStyle = colors[i%colors.length]; c.fill();
    const mid = start + slice/2; const lx = cx + Math.cos(mid)*(radius+16); const ly = cy + Math.sin(mid)*(radius+16);
    c.beginPath(); c.moveTo(cx + Math.cos(mid)*radius*0.85, cy + Math.sin(mid)*radius*0.85); c.lineTo(lx,ly); c.strokeStyle = 'rgba(123,11,18,0.6)'; c.lineWidth=1; c.stroke();
    const percent = ((values[i]/total)*100).toFixed(1) + '%';
    c.font = '13px Inter, Arial'; c.fillStyle = '#222'; c.fillText(percent, lx + (lx>cx?8:-42), ly+4);
    _slices.push({start,end,label:labels[i],value:values[i],color:colors[i%colors.length],mid});
    start = end;
  }
  const legend = document.getElementById('chartLegend'); legend.innerHTML = '';
  for(let i=0;i<labels.length;i++){
    const item = document.createElement('div'); item.className='item';
    const sw = document.createElement('div'); sw.className='swatch'; sw.style.background = colors[i%colors.length];
    const txt = document.createElement('div'); txt.textContent = labels[i] + ' — ' + formatCurrency(values[i]);
    item.appendChild(sw); item.appendChild(txt); legend.appendChild(item);
  }
}

const canvas = document.getElementById('breakdownChart');
const tooltip = document.getElementById('chartTooltip');
canvas.addEventListener('click',(ev)=>{
  const rect = canvas.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const y = ev.clientY - rect.top;
  const cx = canvas.width/2, cy = canvas.height/2;
  const dx = x - cx, dy = y - cy;
  const angle = Math.atan2(dy,dx);
  let a = angle;
  if(a < -Math.PI/2) a += Math.PI*2;
  const found = _slices.find(s=> a >= s.start && a <= s.end);
  if(found){
    tooltip.style.display = 'block';
    tooltip.style.left = (ev.clientX - rect.left + 12) + 'px';
    tooltip.style.top = (ev.clientY - rect.top + 12) + 'px';
    tooltip.innerHTML = `<strong>${found.label}</strong><br>${formatCurrency(found.value)}<br>${(((found.value/_slices.reduce((a,b)=>a+b.value,0))*100)||0).toFixed(1)}%`;
  } else {
    tooltip.style.display = 'none';
  }
  clearTimeout(canvas._tt);
  canvas._tt = setTimeout(()=>{ tooltip.style.display = 'none'; },3500);
});

// Lógica do formulário de Contato
function populateContact(){
  const last = window._lastSim || {};
  document.getElementById('valor_total_input').value = last.cobertura ? formatCurrency(last.cobertura) : document.getElementById('res_total').textContent;
  document.getElementById('valor_mensal_input').value = last.mensalidade ? formatCurrency(last.mensalidade) : document.getElementById('premio_mensal').textContent;
  document.getElementById('leadMessage').textContent = '';
}

document.getElementById('sendLeadBtn').addEventListener('click', ()=>{
  const cpf = document.getElementById('cpf_input').value.trim();
  const whatsapp = document.getElementById('wh_input').value.trim();
  const last = window._lastSim || {};
  const cobertura = last.cobertura || null;
  const mensalidade = last.mensalidade || null;

  if(!cpf || !whatsapp || !cobertura){ alert('Por favor preencha CPF, WhatsApp e volte para gerar a simulação antes de enviar.'); return; }

  const cpfOnly = cpf.replace(/\D/g,'');
  if(cpfOnly.length !== 11){ alert('CPF inválido. Use apenas números (11 dígitos).'); return; }
  
  document.getElementById('leadMessage').textContent = 'Solicitação preparada. Abrindo WhatsApp para finalizar contato com o consultor...';
  const msg = encodeURIComponent(`Olá, gostaria de ativar o plano. CPF: ${cpfOnly}. Cobertura: ${formatCurrency(cobertura)}. Mensalidade: ${formatCurrency(mensalidade)}.`);
  const waLink = `https://wa.me/${whatsapp}?text=${msg}`;
  window.open(waLink, '_blank');
});

// Inicialização
attachCurrencyMasks();
updateSlider();