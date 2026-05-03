// Hash-based SPA router — reservado para refactor single-page futuro.
// En Phase 0 cada módulo es un HTML independiente; este módulo sirve
// como base para migrar sin romper URLs existentes.
const Router = {
  routes: {},

  register(path, handler) {
    this.routes[path] = handler;
    return this;
  },

  navigate(path) {
    window.location.hash = path;
  },

  resolve() {
    const hash = window.location.hash.slice(1) || '/';
    const handler = this.routes[hash] || this.routes['*'];
    if (handler) handler(hash);
  },

  init() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
    return this;
  }
};
