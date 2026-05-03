// ============================================================
// shapley.js — Valor de Shapley para juegos cooperativos (≤5 jugadores)
// ============================================================

const ShapleyCalculator = {

  // Genera todas las permutaciones de un array
  _permutations(arr) {
    if (arr.length <= 1) return [arr];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = arr.filter((_, idx) => idx !== i);
      for (const perm of this._permutations(rest)) result.push([arr[i], ...perm]);
    }
    return result;
  },

  // Genera todas las coaliciones no vacías de un conjunto de jugadores
  allCoalitions(players) {
    const result = [[]];
    for (const p of players) {
      const newC = result.map(c => [...c, p]);
      result.push(...newC);
    }
    return result.slice(1);
  },

  // Calcula el valor de Shapley para cada jugador.
  // v: función v(coalition_array) → number
  // players: array de identificadores (ej. [1, 2, 3])
  compute(v, players) {
    const n = players.length;
    const shapley = {};
    players.forEach(p => { shapley[p] = 0; });

    const perms = this._permutations(players);

    for (const perm of perms) {
      const coalition = [];
      for (const player of perm) {
        const vBefore = v([...coalition]);
        coalition.push(player);
        const vAfter = v([...coalition]);
        shapley[player] += vAfter - vBefore;
      }
    }

    const nFact = perms.length;
    players.forEach(p => { shapley[p] = +(shapley[p] / nFact).toFixed(4); });
    return shapley;
  },

  // Versión con v como objeto: {'1,2': valor, '1,2,3': valor, ...}
  // Las claves son jugadores ordenados y unidos por coma
  computeFromObject(vObj, players) {
    const v = (coalition) => {
      if (coalition.length === 0) return 0;
      const key = [...coalition].sort((a, b) => String(a).localeCompare(String(b))).join(',');
      return vObj[key] ?? 0;
    };
    return this.compute(v, players);
  },

  // Verifica eficiencia: suma de Shapley = v(N)
  checkEfficiency(shapley, v, players) {
    const sum = Object.values(shapley).reduce((a, b) => a + b, 0);
    const grand = v(players);
    return { sum: +sum.toFixed(4), grand: +grand.toFixed(4), ok: Math.abs(sum - grand) < 0.01 };
  },

  // Ejemplo: juego de mayoría simple (3 jugadores, cuotas [40, 35, 25], umbral 51)
  majorityGameExample() {
    const quota = { 1: 40, 2: 35, 3: 25 };
    const threshold = 51;
    const v = (coalition) => {
      const total = coalition.reduce((s, p) => s + quota[p], 0);
      return total >= threshold ? 1 : 0;
    };
    return { v, players: [1, 2, 3], quota, threshold };
  }
};
