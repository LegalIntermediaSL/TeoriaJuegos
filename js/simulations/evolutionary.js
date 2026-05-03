// ============================================================
// evolutionary.js — Replicator Dynamics para juegos 2×2 simétricos
// Método numérico: Euler forward
// ============================================================

const Evolutionary = {

  // Pago esperado de la estrategia i cuando la fracción x juega estrategia 0
  // A: matriz de pagos simétrica 2×2
  fitness(A, x, i) {
    return A[i][0] * x + A[i][1] * (1 - x);
  },

  // Fitness medio de la población
  avgFitness(A, x) {
    return x * this.fitness(A, x, 0) + (1 - x) * this.fitness(A, x, 1);
  },

  // dx/dt = x * (f0 - fbar) — ecuación del replicador
  dxdt(A, x) {
    return x * (this.fitness(A, x, 0) - this.avgFitness(A, x));
  },

  // Simula la dinámica con Euler
  // Devuelve array de puntos {t, x0, x1}
  simulate({ A, x0 = 0.5, T = 30, dt = 0.05 }) {
    const data = [];
    let x = Math.max(1e-6, Math.min(1 - 1e-6, x0));

    for (let t = 0; t <= T + dt / 2; t += dt) {
      data.push({ t: +t.toFixed(3), x0: +x.toFixed(6), x1: +(1 - x).toFixed(6) });
      const dx = this.dxdt(A, x) * dt;
      x = Math.max(1e-6, Math.min(1 - 1e-6, x + dx));
      if (Math.abs(dx) < 1e-9) {
        data.push({ t: T, x0: +x.toFixed(6), x1: +(1 - x).toFixed(6) });
        break;
      }
    }
    return data;
  },

  // Equilibrios interiores (fracción donde f0 = f1)
  interiorEquilibria(A) {
    const denom = (A[0][0] - A[0][1]) - (A[1][0] - A[1][1]);
    if (Math.abs(denom) < 1e-10) return [];
    const xStar = (A[1][1] - A[0][1]) / denom;
    if (xStar > 1e-4 && xStar < 1 - 1e-4) return [+xStar.toFixed(4)];
    return [];
  },

  // Clasificación del equilibrio x: 'stable' (ESS) | 'unstable' | 'neutral'
  classifyEquilibrium(A, x) {
    const eps = 0.001;
    const above = Math.min(1 - 1e-9, x + eps);
    const below = Math.max(1e-9, x - eps);
    const fAbove = this.dxdt(A, above);
    const fBelow = this.dxdt(A, below);
    if (fAbove < 0 && fBelow > 0) return 'stable';
    if (fAbove > 0 && fBelow < 0) return 'unstable';
    return 'neutral';
  },

  // Juego Halcón-Paloma: matriz de pagos a partir de V y C
  hawkDoveMatrix(V, C) {
    return [
      [(V - C) / 2, V],   // Halcón: vs Halcón, vs Paloma
      [0,           V / 2] // Paloma: vs Halcón, vs Paloma
    ];
  },

  // Fracción de Halcones en el ESS para Halcón-Paloma
  hawkDoveESS(V, C) {
    if (C <= 0) return 1;
    return Math.min(1, V / C);
  }
};
