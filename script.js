const CARS = {
    gti:  { nome: "VW Golf GTI",            hp: 230, torque: 35, t100: 6.4, vmax: 240, consumo: 11, conf: 92 },
    civic:{ nome: "Honda Civic SI",          hp: 200, torque: 28, t100: 7.2, vmax: 225, consumo: 13, conf: 95 },
    gol:  { nome: "VW Gol",                 hp: 84,  torque: 13, t100: 12,  vmax: 170, consumo: 14, conf: 88 },
    bmw:  { nome: "BMW 320i",               hp: 184, torque: 27, t100: 7.1, vmax: 235, consumo: 10, conf: 85 },
    merc: { nome: "Mercedes C200",          hp: 204, torque: 30, t100: 7.0, vmax: 237, consumo: 10, conf: 87 },
    chev: { nome: "Chevrolet Chevette",     hp: 65,  torque: 10, t100: 16,  vmax: 150, consumo: 13, conf: 72 },
    evo:  { nome: "Mitsubishi Lancer EVO",  hp: 291, torque: 42, t100: 5.4, vmax: 250, consumo: 9,  conf: 80 },
    a3:   { nome: "Audi A3",               hp: 150, torque: 25, t100: 8.5, vmax: 210, consumo: 12, conf: 90 },
  };
  
  const MODS = [
    { id: "turbo",        label: "Turbo",              desc: "Força forçada de ar no motor",        cost: 8000, hp: +60, torque: +12, t100: -1.5, vmax: +20, consumo: -2, conf: -12, risk: 2 },
    { id: "supercharger", label: "Supercharger",        desc: "Compressor movido pelo motor",        cost: 9000, hp: +50, torque: +10, t100: -1.2, vmax: +18, consumo: -3, conf: -10, risk: 2 },
    { id: "remap",        label: "Remap de ECU",        desc: "Reprogramação da central eletrônica", cost: 2500, hp: +25, torque: +5,  t100: -0.5, vmax: +10, consumo: -1, conf: -4,  risk: 1 },
    { id: "freios",       label: "Upgrade de freios",   desc: "Discos e pinças esportivos",          cost: 3500, hp: 0,   torque: 0,   t100: -0.2, vmax: +5,  consumo: 0,  conf: +5,  risk: 0 },
    { id: "suspensao",    label: "Suspensão esportiva", desc: "Molas e amortecedores rebaixados",    cost: 4500, hp: 0,   torque: 0,   t100: -0.3, vmax: +8,  consumo: 0,  conf: +2,  risk: 0 },
  ];
  
  function buildMods() {
    document.getElementById('mods-grid').innerHTML = MODS.map(m => `
      <div class="mod-card" id="card-${m.id}" onclick="toggleMod('${m.id}')">
        <input type="checkbox" id="${m.id}" onclick="event.stopPropagation(); simulate()">
        <div>
          <div class="mod-name">${m.label}</div>
          <div class="mod-desc">${m.desc}</div>
          <div class="mod-cost">R$ ${m.cost.toLocaleString('pt-BR')}</div>
        </div>
      </div>`).join('');
  }
  
  function toggleMod(id) {
    const cb = document.getElementById(id);
    cb.checked = !cb.checked;
    document.getElementById('card-' + id).classList.toggle('selected', cb.checked);
    simulate();
  }
  
  function getBase() {
    return CARS[document.getElementById('modelo').value];
  }
  
  function getSelectedMods() {
    return MODS.filter(m => document.getElementById(m.id)?.checked);
  }
  
  function simulate() {
    const base = getBase();
    const mods = getSelectedMods();
    const budget = parseFloat(document.getElementById('orcamento').value) || 0;
  
    let hp = base.hp, torque = base.torque, t100 = base.t100, vmax = base.vmax, consumo = base.consumo, conf = base.conf;
    let totalCost = 0, maxRisk = 0;
  
    mods.forEach(m => {
      hp += m.hp; torque += m.torque; t100 += m.t100;
      vmax += m.vmax; consumo += m.consumo; conf += m.conf;
      totalCost += m.cost;
      maxRisk = Math.max(maxRisk, m.risk);
    });
  
    t100 = Math.max(t100, 2.5);
    consumo = Math.max(consumo, 4);
    conf = Math.min(Math.max(conf, 50), 100);
  
    renderBudget(totalCost, budget);
    renderResults(base, { hp, torque, t100, vmax, consumo, conf });
    renderRisk(maxRisk, mods);
    renderScores(base, { hp, t100, consumo, conf, totalCost, budget });
  }
  
  function renderBudget(cost, budget) {
    const pct = budget > 0 ? Math.min((cost / budget) * 100, 100) : 0;
    const bar = document.getElementById('budget-bar');
    bar.style.width = pct + '%';
    bar.className = 'bar-fill' + (cost > budget ? ' over' : '');
  
    document.getElementById('custo-label').textContent = 'R$ ' + cost.toLocaleString('pt-BR');
    document.getElementById('budget-label').textContent = 'R$ ' + budget.toLocaleString('pt-BR');
  
    const msg = document.getElementById('budget-msg');
    if (cost === 0) {
      msg.textContent = 'Nenhuma modificação selecionada.';
      msg.className = 'budget-msg';
    } else if (cost > budget) {
      msg.textContent = '⚠ Orçamento excedido em R$ ' + (cost - budget).toLocaleString('pt-BR');
      msg.className = 'budget-msg over';
    } else {
      msg.textContent = 'Dentro do orçamento — sobram R$ ' + (budget - cost).toLocaleString('pt-BR');
      msg.className = 'budget-msg ok';
    }
  }
  
  function renderResults(base, prep) {
    const metrics = [
      { label: 'Potência',       orig: base.hp + ' HP',            val: prep.hp + ' HP',            better: prep.hp > base.hp },
      { label: 'Torque',         orig: base.torque + ' kgfm',      val: prep.torque + ' kgfm',      better: prep.torque > base.torque },
      { label: '0–100 km/h',    orig: base.t100.toFixed(1) + ' s', val: prep.t100.toFixed(1) + ' s', better: prep.t100 < base.t100 },
      { label: 'Vel. máxima',    orig: base.vmax + ' km/h',        val: prep.vmax + ' km/h',        better: prep.vmax > base.vmax },
      { label: 'Consumo',        orig: base.consumo + ' km/l',     val: prep.consumo + ' km/l',     better: prep.consumo >= base.consumo },
      { label: 'Confiabilidade', orig: base.conf + '%',            val: prep.conf + '%',            better: prep.conf >= base.conf },
    ];
  
    document.getElementById('results-grid').innerHTML = metrics.map(m => `
      <div class="metric">
        <div class="metric-label">${m.label}</div>
        <div class="metric-orig">${m.orig}</div>
        <div class="metric-new ${m.better ? 'better' : 'worse'}">${m.val}</div>
      </div>`).join('');
  }
  
  function renderRisk(level, mods) {
    const labels  = ['Baixo', 'Médio', 'Alto'];
    const classes = ['low', 'mid', 'high'];
    const icons   = ['ti-circle-check', 'ti-alert-triangle', 'ti-alert-octagon'];
  
    const badge = document.getElementById('risk-badge');
    badge.className = 'badge ' + classes[level];
    badge.innerHTML = `<i class="ti ${icons[level]}"></i> ${labels[level]}`;
  
    const msgs = [];
    if (mods.find(m => m.id === 'turbo' || m.id === 'supercharger'))
      msgs.push('Compressores exigem aprovação do DETRAN e laudo técnico.');
    if (mods.find(m => m.id === 'remap'))
      msgs.push('Remap de ECU pode invalidar a garantia do fabricante.');
    if (level >= 1)
      msgs.push('Recomenda-se upgrade de freios e suspensão ao aumentar a potência.');
  
    const alertEl = document.getElementById('risk-alert');
    if (msgs.length) {
      alertEl.style.display = 'flex';
      alertEl.className = 'alert ' + (level === 2 ? 'warn' : 'info');
      alertEl.innerHTML = `<i class="ti ti-info-circle" style="flex-shrink:0;margin-top:2px"></i><div>${msgs.join('<br>')}</div>`;
    } else {
      alertEl.style.display = 'none';
    }
  }
  
  function renderScores(base, { hp, t100, consumo, conf, totalCost, budget }) {
    const hpGain = (hp - base.hp) / Math.max(base.hp, 1);
    const perf = Math.min(10, Math.max(0, 5 + hpGain * 8 + (base.t100 - t100) * 0.4));
    const seg  = Math.min(10, (conf / 100) * 10);
    const eco  = Math.min(10, (consumo / 15) * 10);
    const cb   = totalCost > 0 ? Math.min(10, Math.max(0, (perf * 1.2) - (totalCost / budget) * 3 + 5)) : 5;
  
    const scores = [
      { label: 'Desempenho',      val: perf, color: '#185FA5' },
      { label: 'Segurança',       val: seg,  color: '#0F6E56' },
      { label: 'Economia',        val: eco,  color: '#854F0B' },
      { label: 'Custo-benefício', val: cb,   color: '#533AB7' },
    ];
  
    document.getElementById('score-grid').innerHTML = scores.map(s => `
      <div class="score-item">
        <label>${s.label}</label>
        <div class="score-bar-bg"><div class="score-bar" style="width:${Math.round(s.val * 10)}%;background:${s.color}"></div></div>
        <div class="score-val">${s.val.toFixed(1)}</div>
      </div>`).join('');
  }
  
  function autoConfig() {
    const obj    = document.getElementById('objetivo').value;
    const budget = parseFloat(document.getElementById('orcamento').value) || 0;
  
    MODS.forEach(m => {
      document.getElementById(m.id).checked = false;
      document.getElementById('card-' + m.id).classList.remove('selected');
    });
  
    const order =
      obj === 'eco'   ? ['freios', 'suspensao', 'remap'] :
      obj === 'perf'  ? ['remap', 'turbo', 'freios', 'suspensao'] :
                        ['turbo', 'remap', 'freios', 'suspensao', 'supercharger'];
  
    let spent = 0;
    order.forEach(id => {
      const m = MODS.find(x => x.id === id);
      if (m && spent + m.cost <= budget) {
        document.getElementById(id).checked = true;
        document.getElementById('card-' + id).classList.add('selected');
        spent += m.cost;
      }
    });
  
    simulate();
  }
  
  function generateReport() {
    const base = getBase();
    const mods = getSelectedMods();
    alert(
      'Relatório de: ' + base.nome +
      '\nModificações: ' + (mods.length ? mods.map(m => m.label).join(', ') : 'nenhuma') +
      '\n\n(Integre aqui sua biblioteca de PDF, ex: jsPDF)'
    );
  }
  
  buildMods();
  simulate();