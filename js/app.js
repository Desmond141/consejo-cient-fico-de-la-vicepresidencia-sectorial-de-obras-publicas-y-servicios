const AVANCE_GLOBAL = 60;
const capitulos = [
  { nombre: 'Obras preliminares', progreso: 100 },
  { nombre: 'Movimiento de tierra', progreso: 100 },
  { nombre: 'Construcción de fundaciones', progreso: 70 },
  { nombre: 'Construcción de super estructura', progreso: 60 },
  { nombre: 'Instalación eléctrica', progreso: 70 },
  { nombre: 'Instalación sanitaria (riego)', progreso: 60 },
  { nombre: 'Intervención de exteriores', progreso: 40 },
];

const CIRCUNFERENCIA = 2 * Math.PI * 52;
let tipoGrafico = 'barras';

function colorCapitulo(p) {
  if (p >= 100) return '#7dd3fc';
  if (p >= 70) return '#0ea5e9';
  if (p >= 50) return '#38bdf8';
  if (p >= 40) return '#94a3b8';
  return '#64748b';
}

function polar(cx, cy, r, grados) {
  const rad = (grados - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcoDonut(cx, cy, rExt, rInt, inicio, fin) {
  const os = polar(cx, cy, rExt, inicio);
  const oe = polar(cx, cy, rExt, fin);
  const is = polar(cx, cy, rInt, inicio);
  const ie = polar(cx, cy, rInt, fin);
  const grande = fin - inicio > 180 ? 1 : 0;
  return `M ${os.x} ${os.y} A ${rExt} ${rExt} 0 ${grande} 1 ${oe.x} ${oe.y} L ${ie.x} ${ie.y} A ${rInt} ${rInt} 0 ${grande} 0 ${is.x} ${is.y} Z`;
}

function renderBarras() {
  document.getElementById('grafico-dashboard').innerHTML = capitulos.map(c => `
    <div class="bar-chart-item bar-row-card">
      <div class="flex justify-between items-center mb-2">
        <span class="text-xs font-medium text-slate-300 truncate pr-3">${c.nombre}</span>
        <span class="text-xs font-bold text-sky-200 flex-shrink-0">${c.progreso}%</span>
      </div>
      <div class="w-full bar-track rounded-full h-2.5 overflow-hidden">
        <div class="barra-progreso h-full" data-progreso="${c.progreso}" style="width:0%; ${estiloBarra(c.progreso)}"></div>
      </div>
    </div>
  `).join('');
  animarBarras(document.getElementById('grafico-dashboard'));
}

function renderPasteles() {
  const total = capitulos.reduce((s, c) => s + c.progreso, 0);
  let angulo = 0;
  const cx = 100, cy = 100, rExt = 86, rInt = 46;

  const slices = capitulos.map(c => {
    const sweep = (c.progreso / total) * 360;
    const inicio = angulo;
    const fin = angulo + sweep;
    angulo = fin;
    return { ...c, inicio, fin, color: colorCapitulo(c.progreso) };
  });

  const paths = slices.map((s, i) =>
    `<path class="pie-slice" d="${arcoDonut(cx, cy, rExt, rInt, s.inicio, s.fin)}" fill="${s.color}" stroke="rgba(17,24,39,0.55)" stroke-width="1.5" opacity="0" data-delay="${i}">
      <title>${s.nombre}: ${s.progreso}%</title>
    </path>`
  ).join('');

  const leyenda = slices.map(s => `
    <div class="pie-leyenda-item" title="${s.nombre}: ${s.progreso}%">
      <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:${s.color}"></span>
      <span class="text-slate-400">${s.nombre}</span>
      <span class="text-sky-200 font-semibold flex-shrink-0">${s.progreso}%</span>
    </div>
  `).join('');

  document.getElementById('grafico-dashboard').innerHTML = `
    <div class="pie-layout">
      <div class="pie-chart-wrap">
        <svg viewBox="0 0 200 200" role="img" aria-label="Gráfico de pastel por capítulo">
          ${paths}
          <circle cx="${cx}" cy="${cy}" r="${rInt - 8}" fill="rgba(30,50,75,0.6)"/>
          <text x="${cx}" y="${cy - 5}" text-anchor="middle" fill="#e2e8f0" font-size="22" font-weight="700">7</text>
          <text x="${cx}" y="${cy + 16}" text-anchor="middle" fill="#94a3b8" font-size="10">capítulos</text>
        </svg>
      </div>
      <div class="pie-leyenda bar-row-card space-y-1.5">${leyenda}</div>
    </div>
  `;

  requestAnimationFrame(() => {
    document.querySelectorAll('#grafico-dashboard .pie-slice').forEach(el => {
      setTimeout(() => { el.style.opacity = '1'; }, Number(el.dataset.delay) * 80);
    });
  });
}

function renderGraficoDashboard() {
  if (tipoGrafico === 'pasteles') renderPasteles();
  else renderBarras();
  bindDraggables();
}

function setTipoGrafico(tipo) {
  tipoGrafico = tipo;
  document.getElementById('btn-barras').classList.toggle('activo', tipo === 'barras');
  document.getElementById('btn-pasteles').classList.toggle('activo', tipo === 'pasteles');
  document.getElementById('btn-barras').setAttribute('aria-pressed', tipo === 'barras');
  document.getElementById('btn-pasteles').setAttribute('aria-pressed', tipo === 'pasteles');
  renderGraficoDashboard();
}

function makeDraggable(element) {
  if (element.dataset.draggableInitialized === 'true') return;
  element.dataset.draggableInitialized = 'true';
  element.style.touchAction = 'none';
  element.style.userSelect = 'none';
  element.style.willChange = 'transform';
  if (!['relative', 'absolute', 'fixed', 'sticky'].includes(getComputedStyle(element).position)) {
    element.style.position = 'relative';
  }
  element.style.cursor = 'grab';
  element.style.transition = 'transform 0.15s ease';
  element.style.animation = 'none';
  element.classList.remove('animate-in');
  element.style.transform = element.style.transform || 'translate(0, 0)';

  const dragState = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
  };

  function getCurrentTranslate() {
    const transform = getComputedStyle(element).transform;
    if (transform && transform !== 'none') {
      const matrix = new DOMMatrixReadOnly(transform);
      return { x: matrix.m41, y: matrix.m42 };
    }
    return { x: 0, y: 0 };
  }

  function onPointerMove(e) {
    if (!dragState.active || e.pointerId !== dragState.pointerId) return;
    e.preventDefault();
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    element.style.transform = `translate(${dragState.baseX + dx}px, ${dragState.baseY + dy}px)`;
  }

  function endDrag(e) {
    if (!dragState.active || (e && e.pointerId != null && e.pointerId !== dragState.pointerId)) return;
    dragState.active = false;
    dragState.pointerId = null;
    element.style.cursor = 'grab';
    element.style.transition = 'transform 0.15s ease';
    try { element.releasePointerCapture?.(e?.pointerId); } catch (_) {}
    document.removeEventListener('pointermove', onPointerMove, { passive: false });
    document.removeEventListener('pointerup', endDrag);
    document.removeEventListener('pointercancel', endDrag);
  }

  element.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest('button, a, input, textarea, select, label, [role="button"]')) return;
    e.preventDefault();
    element.style.animation = 'none';
    dragState.active = true;
    dragState.pointerId = e.pointerId;
    const current = getCurrentTranslate();
    dragState.baseX = current.x;
    dragState.baseY = current.y;
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;
    element.style.cursor = 'grabbing';
    element.style.zIndex = '1000';
    element.style.transition = 'none';
    document.addEventListener('pointermove', onPointerMove, { passive: false });
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', endDrag);
  });
}

function bindDraggables() {
  const draggableSet = new Set();

  document.querySelectorAll('.barra-progreso').forEach(bar => {
    const rowCard = bar.closest('.bar-row-card');
    const chartItem = bar.closest('.bar-chart-item');
    const tableRow = bar.closest('tr');
    const glassCard = bar.closest('.glass, .glass-strong');

    if (rowCard) draggableSet.add(rowCard);
    if (chartItem) draggableSet.add(chartItem);
    if (tableRow) draggableSet.add(tableRow);
    if (glassCard) draggableSet.add(glassCard);
  });

  const heroCard = document.getElementById('ring-avance')?.closest('.glass-strong');
  if (heroCard) draggableSet.add(heroCard);

  const pin2Card = document.querySelector('#vista-pin2 .glass-strong');
  if (pin2Card) draggableSet.add(pin2Card);

  draggableSet.forEach(el => {
    el.style.zIndex = '10';
    makeDraggable(el);
  });
}

function paintBarra(el, p, width) {
  const t = Math.min(Math.max(p, 0), 100) / 100;
  const punta = p >= 100 ? '#38bdf8' : p >= 70 ? '#0ea5e9' : p >= 50 ? '#7dd3fc' : p >= 30 ? '#94a3b8' : '#64748b';
  const medio = p >= 70 ? '#64748b' : '#475569';
  const glow = 0.08 + t * 0.28;
  el.style.width = width;
  el.style.background = `linear-gradient(90deg, #334155 0%, ${medio} 28%, #64748b 55%, ${punta} 100%)`;
  el.style.boxShadow = `0 0 14px rgba(56, 189, 248, ${glow})`;
}

function estiloBarra(p) {
  const t = Math.min(Math.max(p, 0), 100) / 100;
  const punta = p >= 100 ? '#38bdf8' : p >= 70 ? '#0ea5e9' : p >= 50 ? '#7dd3fc' : p >= 30 ? '#94a3b8' : '#64748b';
  const medio = p >= 70 ? '#64748b' : '#475569';
  const glow = (0.08 + t * 0.28).toFixed(2);
  return `background: linear-gradient(90deg, #334155 0%, ${medio} 28%, #64748b 55%, ${punta} 100%); box-shadow: 0 0 14px rgba(56, 189, 248, ${glow});`;
}

function claseBadge(p) {
  if (p >= 100) return 'bg-sky-400/15 text-sky-300 border border-sky-400/25';
  if (p >= 70) return 'bg-sky-500/12 text-sky-400 border border-sky-400/20';
  if (p >= 40) return 'bg-slate-600/30 text-slate-300 border border-slate-500/30';
  return 'bg-slate-700/40 text-slate-400 border border-slate-600/35';
}

function renderTabla() {
  const filas = capitulos.map((c, i) => `
    <tr class="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-400/20 text-xs font-bold text-sky-400 flex items-center justify-center">${i + 1}</span>
          <span class="font-medium text-slate-300 text-sm">${c.nombre}</span>
        </div>
      </td>
      <td class="px-6 py-4">
        <div class="w-full bar-track rounded-full h-2.5 overflow-hidden">
          <div class="barra-progreso h-full" data-progreso="${c.progreso}" style="width:0%; ${estiloBarra(c.progreso)}"></div>
        </div>
      </td>
      <td class="px-6 py-4 text-right">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${claseBadge(c.progreso)}">${c.progreso}%</span>
      </td>
    </tr>
  `).join('');

  document.getElementById('tabla-capitulos').innerHTML = filas;

  document.getElementById('lista-capitulos').innerHTML = capitulos.map((c, i) => `
    <div class="p-4 bar-row-card mx-3 my-2">
      <div class="flex justify-between items-start mb-2">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-md bg-sky-400/15 text-xs font-bold text-sky-300 flex items-center justify-center">${i + 1}</span>
          <span class="font-medium text-slate-300 text-sm">${c.nombre}</span>
        </div>
        <span class="text-sm font-bold text-sky-200">${c.progreso}%</span>
      </div>
      <div class="w-full bar-track rounded-full h-2.5 overflow-hidden">
        <div class="barra-progreso h-full" data-progreso="${c.progreso}" style="width:0%; ${estiloBarra(c.progreso)}"></div>
      </div>
    </div>
  `).join('');

  bindDraggables();
}

function animarBarras(scope) {
  requestAnimationFrame(() => {
    (scope || document).querySelectorAll('.barra-progreso').forEach(b => {
      const p = Number(b.dataset.progreso);
      if (!Number.isNaN(p)) paintBarra(b, p, b.dataset.progreso + '%');
    });
  });
}

function resetBarras(scope) {
  (scope || document).querySelectorAll('.barra-progreso').forEach(b => {
    b.style.width = '0%';
  });
}

function animarAnillo(porcentaje) {
  const ring = document.getElementById('ring-avance');
  if (!ring) return;
  const offset = CIRCUNFERENCIA - (porcentaje / 100) * CIRCUNFERENCIA;
  ring.style.strokeDashoffset = CIRCUNFERENCIA;
  requestAnimationFrame(() => {
    setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100);
  });
}

function resetAnillo() {
  const ring = document.getElementById('ring-avance');
  if (ring) ring.style.strokeDashoffset = CIRCUNFERENCIA;
}

function cambiarVista(vistaId) {
  document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('activo'));

  const vista = document.getElementById('vista-' + vistaId);
  document.querySelector(`[data-vista="${vistaId}"]`).classList.add('activo');
  vista.classList.add('activa');

  resetBarras(vista);
  resetAnillo();
  setTimeout(() => {
    animarBarras(vista);
    bindDraggables();
    if (vistaId === 'dashboard') {
      animarAnillo(AVANCE_GLOBAL);
    }
  });
}

renderGraficoDashboard();
renderTabla();
bindDraggables();

// Mostrar fecha actual en el header (visibilidad previa se perdió tras refactor)
function setFechaActual() {
  const el = document.getElementById('fecha-actual');
  if (!el) return;
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let formatted = now.toLocaleDateString('es-ES', opts);
  // Primera letra en mayúscula
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  el.textContent = formatted;
}

setFechaActual();

// Event listeners for chart toggle buttons
const btnBarras = document.getElementById('btn-barras');
const btnPasteles = document.getElementById('btn-pasteles');
if (btnBarras) btnBarras.addEventListener('click', () => setTipoGrafico('barras'));
if (btnPasteles) btnPasteles.addEventListener('click', () => setTipoGrafico('pasteles'));

const videoElement = document.getElementById('obra-video');
const audioToggle = document.getElementById('video-audio-toggle');
const volumeSlider = document.getElementById('video-volume-slider');
const volumeLabel = document.getElementById('video-volume-label');

if (videoElement) {
  videoElement.volume = 0.5;
  videoElement.muted = true;
}

if (audioToggle && videoElement) {
  audioToggle.addEventListener('click', () => {
    if (videoElement.muted) {
      videoElement.muted = false;
      audioToggle.textContent = 'Silenciar';
    } else {
      videoElement.muted = true;
      audioToggle.textContent = 'Activar audio';
    }
  });
}

if (volumeSlider && videoElement && volumeLabel) {
  volumeSlider.addEventListener('input', () => {
    const volume = Number(volumeSlider.value) / 100;
    videoElement.volume = volume;
    volumeLabel.textContent = `${volumeSlider.value}%`;
    if (volume === 0) {
      videoElement.muted = true;
      if (audioToggle) audioToggle.textContent = 'Activar audio';
    } else {
      if (videoElement.muted) {
        videoElement.muted = false;
        if (audioToggle) audioToggle.textContent = 'Silenciar';
      }
    }
  });
}

// Event listeners for navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => cambiarVista(btn.dataset.vista));
});
