// ============================================================
// nash-solver.js — Cálculo de equilibrios de Nash en juegos 2×2
// Usa enumeración de soportes + verificación de mejor respuesta.
// ============================================================

const NashSolver = {

  // Devuelve true si la estrategia rowIdx está estrictamente dominada
  // por alguna otra estrategia pura del Jugador 1, dado el juego (A, B).
  isRowStrictlyDominated(A, rowIdx) {
    const rows = A.length;
    const cols = A[0].length;
    for (let r = 0; r < rows; r++) {
      if (r === rowIdx) continue;
      let dominates = true;
      for (let c = 0; c < cols; c++) {
        if (A[r][c] <= A[rowIdx][c]) { dominates = false; break; }
      }
      if (dominates) return true;
    }
    return false;
  },

  // Igual pero para columnas del Jugador 2 (matriz B transpuesta)
  isColStrictlyDominated(B, colIdx) {
    const rows = B.length;
    const cols = B[0].length;
    for (let c = 0; c < cols; c++) {
      if (c === colIdx) continue;
      let dominates = true;
      for (let r = 0; r < rows; r++) {
        if (B[r][c] <= B[r][colIdx]) { dominates = false; break; }
      }
      if (dominates) return true;
    }
    return false;
  },

  // Eliminación Iterada de Estrategias Estrictamente Dominadas.
  // Devuelve un array de pasos: [{type, player, index, label}]
  // y el juego resultante (filas/cols supervivientes).
  iteratedElimination(A, B, rowLabels, colLabels) {
    let activeRows = A.map((_, i) => i);
    let activeCols = A[0].map((_, j) => j);
    const steps = [];
    let changed = true;

    while (changed) {
      changed = false;

      // Intentar eliminar filas dominadas
      for (const r of [...activeRows]) {
        const subA = activeRows.map(ri => activeCols.map(ci => A[ri][ci]));
        const localIdx = activeRows.indexOf(r);
        if (this.isRowStrictlyDominated(subA, localIdx)) {
          steps.push({ type: 'row', player: 1, index: r, label: rowLabels[r] });
          activeRows = activeRows.filter(ri => ri !== r);
          changed = true;
        }
      }

      // Intentar eliminar columnas dominadas
      for (const c of [...activeCols]) {
        const subB = activeRows.map(ri => activeCols.map(ci => B[ri][ci]));
        const localIdx = activeCols.indexOf(c);
        if (this.isColStrictlyDominated(subB, localIdx)) {
          steps.push({ type: 'col', player: 2, index: c, label: colLabels[c] });
          activeCols = activeCols.filter(ci => ci !== c);
          changed = true;
        }
      }
    }

    return { steps, activeRows, activeCols };
  },

  // Verifica si (r, c) es un equilibrio de Nash en estrategias puras.
  isPureNashEquilibrium(A, B, r, c) {
    const rows = A.length, cols = A[0].length;
    // J1 no puede mejorar cambiando de fila
    for (let ri = 0; ri < rows; ri++) {
      if (A[ri][c] > A[r][c]) return false;
    }
    // J2 no puede mejorar cambiando de columna
    for (let ci = 0; ci < cols; ci++) {
      if (B[r][ci] > B[r][c]) return false;
    }
    return true;
  },

  // Encuentra todos los equilibrios de Nash puros en una bimatriz (A, B).
  findPureNashEquilibria(A, B) {
    const equilibria = [];
    for (let r = 0; r < A.length; r++) {
      for (let c = 0; c < A[0].length; c++) {
        if (this.isPureNashEquilibrium(A, B, r, c)) {
          equilibria.push({ row: r, col: c, payoff1: A[r][c], payoff2: B[r][c] });
        }
      }
    }
    return equilibria;
  },

  // Calcula el equilibrio mixto de Nash para un juego 2×2.
  // Devuelve { p, q } donde p = prob(fila 0) para J1, q = prob(col 0) para J2.
  // Devuelve null si el juego tiene equilibrio puro (o es degenerado).
  findMixedNashEquilibrium2x2(A, B) {
    // J2 hace indiferente a J1: A[0][0]*q + A[0][1]*(1-q) = A[1][0]*q + A[1][1]*(1-q)
    const dA = (A[0][0] - A[0][1]) - (A[1][0] - A[1][1]);
    if (Math.abs(dA) < 1e-10) return null; // filas paralelas
    const q = (A[1][1] - A[0][1]) / dA;

    // J1 hace indiferente a J2: B[0][0]*p + B[1][0]*(1-p) = B[0][1]*p + B[1][1]*(1-p)
    const dB = (B[0][0] - B[1][0]) - (B[0][1] - B[1][1]);
    if (Math.abs(dB) < 1e-10) return null;
    const p = (B[1][1] - B[1][0]) / dB;

    if (p < 0 || p > 1 || q < 0 || q > 1) return null;
    // Si es equilibrio puro, no reportar como mixto
    if (Math.abs(p) < 1e-9 || Math.abs(p - 1) < 1e-9) return null;
    if (Math.abs(q) < 1e-9 || Math.abs(q - 1) < 1e-9) return null;

    return { p: +p.toFixed(6), q: +q.toFixed(6) };
  },

  // Punto de entrada principal: devuelve todos los equilibrios del juego 2×2.
  solveGame(A, B) {
    const pure  = this.findPureNashEquilibria(A, B);
    const mixed = this.findMixedNashEquilibrium2x2(A, B);
    return { pure, mixed };
  },

  // Calcula la mejor respuesta del J1 dado que J2 juega col c (índice).
  bestResponseRow(A, col) {
    let best = 0, bestVal = -Infinity;
    for (let r = 0; r < A.length; r++) {
      if (A[r][col] > bestVal) { bestVal = A[r][col]; best = r; }
    }
    return best;
  },

  // Calcula la mejor respuesta del J2 dado que J1 juega fila r (índice).
  bestResponseCol(B, row) {
    let best = 0, bestVal = -Infinity;
    for (let c = 0; c < B[0].length; c++) {
      if (B[row][c] > bestVal) { bestVal = B[row][c]; best = c; }
    }
    return best;
  }
};
