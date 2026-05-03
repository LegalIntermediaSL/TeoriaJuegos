// Persiste el progreso del usuario en localStorage.
// Cada módulo tiene un ID numérico (ej. "01", "02", ..., "10").
const Progress = {
  KEY:   'tj-progress-v1',
  TOTAL: 10,

  load() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; }
    catch { return {}; }
  },

  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  markComplete(moduleId) {
    const data = this.load();
    if (!data[moduleId]) {
      data[moduleId] = { completedAt: Date.now() };
      this.save(data);
    }
    this._render();
  },

  isComplete(moduleId) {
    return !!this.load()[moduleId];
  },

  getCount() {
    return Object.keys(this.load()).length;
  },

  // Detecta el módulo actual via <meta name="module-id"> y lo marca completo.
  // Llamar desde cada página de módulo al llegar al final o interactuar.
  completeCurrentModule() {
    const meta = document.querySelector('meta[name="module-id"]');
    if (meta) this.markComplete(meta.content);
  },

  reset() {
    localStorage.removeItem(this.KEY);
    this._render();
  },

  _render() {
    const count = this.getCount();
    const pct   = Math.round((count / this.TOTAL) * 100);

    const fill  = document.getElementById('progressFill');
    const label = document.getElementById('progressLabel');
    if (fill)  fill.style.width = pct + '%';
    if (label) label.textContent = `${count} de ${this.TOTAL} módulos completados`;

    // Actualiza tarjetas en index.html
    const data = this.load();
    document.querySelectorAll('[data-module-id]').forEach(el => {
      const id = el.dataset.moduleId;
      if (data[id]) {
        el.classList.add('completed');
        const status = el.querySelector('.card-status');
        if (status) status.textContent = '✓ Completado';
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => Progress._render());
