// ==========================================================
// Conecta Créditos · Prototipo
// Cambia aquí el número de WhatsApp (formato internacional, sin + ni espacios)
// ==========================================================
const CONFIG = {
  whatsapp: '573000000000',
  mensajeBase: 'Hola, Conecta Créditos. Quiero recibir asesoría.'
};
const waLink = msg => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;

// Header con borde al hacer scroll
const header = document.getElementById('top');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 8), { passive: true });

// Menú móvil
const burger = document.getElementById('burger');
burger.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
document.querySelectorAll('#menu a').forEach(a => a.addEventListener('click', () => {
  header.classList.remove('open'); burger.setAttribute('aria-expanded', false);
}));

// Aparición al hacer scroll
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Preguntas frecuentes
document.querySelectorAll('.qa button').forEach(btn => btn.addEventListener('click', () => {
  const qa = btn.parentElement; const open = qa.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
}));

// Simulador de cuota (sistema francés, tasa mensual referencial)
const fmt = n => '$' + Math.round(n).toLocaleString('es-CO');
const monto = document.getElementById('monto'), plazo = document.getElementById('plazo');
let rate = 1.85;
function paint(r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); }
function calc() {
  const P = +monto.value, n = +plazo.value, i = rate / 100;
  const c = P * i / (1 - Math.pow(1 + i, -n));
  document.getElementById('oMonto').textContent = fmt(P);
  document.getElementById('oPlazo').textContent = n + ' meses';
  document.getElementById('cuota').textContent = fmt(c);
  document.getElementById('tasaTxt').textContent =
    `Cálculo de referencia con tasa de ${rate.toString().replace('.', ',')} % mensual. No incluye seguros ni gastos. La tasa final depende de la entidad y de tu perfil.`;
  paint(monto); paint(plazo);
}
[monto, plazo].forEach(r => r.addEventListener('input', calc));
document.querySelectorAll('#seg button').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('#seg button').forEach(x => x.setAttribute('aria-pressed', 'false'));
  b.setAttribute('aria-pressed', 'true'); rate = +b.dataset.rate; calc();
}));
calc();

// Contadores de las cifras
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const counters = document.querySelectorAll('[data-count]');
const label = (el, v) => el.textContent = (el.dataset.prefix || '') + v + (el.dataset.suffix || '');
if (!reduce) {
  counters.forEach(el => label(el, 0));
  const co = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    co.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, dur = 1600, t0 = performance.now();
    const step = now => {
      const t = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 4); // ease-out
      label(el, Math.round(end * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  counters.forEach(el => co.observe(el));
}

// Botón flotante de WhatsApp
document.getElementById('waFloat').href = waLink(CONFIG.mensajeBase);

// Botón "Solicitar" del simulador: lleva el tipo de crédito al formulario
document.getElementById('simSolicitar').addEventListener('click', () => {
  const tipo = document.querySelector('#seg button[aria-pressed=true]').textContent.trim();
  const sel = document.getElementById('tipoForm');
  [...sel.options].forEach(o => { if (o.text === tipo) sel.value = o.value; });
});

// Formulario: valida, muestra confirmación y ofrece continuar por WhatsApp
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  if (!f.checkValidity()) { f.reportValidity(); return; }
  const d = Object.fromEntries(new FormData(f));
  const nombre = d.nombre.trim();
  const msg = `${CONFIG.mensajeBase}

Nombre: ${nombre}
Celular: ${d.celular}` +
              (d.ciudad ? `
Ciudad: ${d.ciudad}` : '') + `
Tipo de crédito: ${d.tipo}` +
              `
Cuota simulada: ${document.getElementById('cuota').textContent} (${document.getElementById('oMonto').textContent} a ${document.getElementById('oPlazo').textContent})`;
  document.getElementById('sentName').textContent = ', ' + nombre.split(' ')[0];
  document.getElementById('sentWa').href = waLink(msg);
  f.style.display = 'none';
  document.getElementById('sent').style.display = 'block';
});

// Enlaces pendientes (redes y páginas legales): aviso en lugar de saltar arriba
const toast = document.createElement('div');
toast.className = 'toast'; toast.setAttribute('role', 'status');
document.body.appendChild(toast);
let toastT;
document.querySelectorAll('a[href="#"]:not(#sentWa)').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  toast.textContent = `«${a.getAttribute('aria-label') || a.textContent.trim()}» estará disponible en la versión final`;
  toast.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 2600);
}));
