// ============================================================
// prisoner-dilemma.js — Motor del Dilema del Prisionero iterado
// Gestiona rondas, estrategias y puntuaciones.
// ============================================================

// Matriz de pagos estándar (años de condena, invertidos para que más = mejor)
// (C=cooperar/callar, D=traicionar/confesar)
//        J2: C    J2: D
// J1: C  3,3      0,5
// J1: D  5,0      1,1
const PD_PAYOFFS = {
  CC: [3, 3],
  CD: [0, 5],
  DC: [5, 0],
  DD: [1, 1],
};

// Estrategias disponibles para el ordenador
const STRATEGIES = {
  tit_for_tat: {
    name: 'Tit-for-Tat',
    desc: 'Coopera en la primera ronda. Luego imita la última acción del rival.',
    decide(history) {
      if (history.length === 0) return 'C';
      return history[history.length - 1].human;
    }
  },

  generous_tft: {
    name: 'Generous Tit-for-Tat',
    desc: 'Como Tit-for-Tat pero perdona traiciones con probabilidad 1/3.',
    decide(history) {
      if (history.length === 0) return 'C';
      const last = history[history.length - 1].human;
      if (last === 'C') return 'C';
      return Math.random() < 0.33 ? 'C' : 'D';
    }
  },

  grim_trigger: {
    name: 'Grim Trigger',
    desc: 'Coopera hasta que el rival traicione una sola vez. Luego traiciona para siempre.',
    decide(history) {
      const betrayed = history.some(h => h.human === 'D');
      return betrayed ? 'D' : 'C';
    }
  },

  always_defect: {
    name: 'Siempre traicionar',
    desc: 'Traiciona en todas las rondas independientemente del rival.',
    decide() { return 'D'; }
  },

  always_cooperate: {
    name: 'Siempre cooperar',
    desc: 'Coopera en todas las rondas independientemente del rival.',
    decide() { return 'C'; }
  },

  random: {
    name: 'Aleatorio',
    desc: 'Coopera o traiciona con probabilidad 50/50 cada ronda.',
    decide() { return Math.random() < 0.5 ? 'C' : 'D'; }
  },

  pavlov: {
    name: 'Pavlov (Win-Stay, Lose-Shift)',
    desc: 'Repite la acción anterior si ganó bien, la cambia si el resultado fue malo.',
    decide(history) {
      if (history.length === 0) return 'C';
      const last = history[history.length - 1];
      const myPay = PD_PAYOFFS[last.computer + last.human][0];
      // Umbral: pago ≥ 3 es "ganar"
      return myPay >= 3 ? last.computer : (last.computer === 'C' ? 'D' : 'C');
    }
  }
};

const PrisonerDilemma = {
  history: [],
  scores: { human: 0, computer: 0 },
  currentStrategy: 'tit_for_tat',
  maxRounds: 20,

  init(strategyKey = 'tit_for_tat', maxRounds = 20) {
    this.history = [];
    this.scores = { human: 0, computer: 0 };
    this.currentStrategy = strategyKey;
    this.maxRounds = maxRounds;
  },

  // Ejecuta una ronda. humanMove = 'C' | 'D'
  play(humanMove) {
    if (this.history.length >= this.maxRounds) return null;

    const strategy = STRATEGIES[this.currentStrategy];
    const computerMove = strategy.decide(this.history);
    const key = computerMove + humanMove;
    const [compPay, humanPay] = PD_PAYOFFS[key];

    this.scores.human    += humanPay;
    this.scores.computer += compPay;

    const round = {
      round:    this.history.length + 1,
      human:    humanMove,
      computer: computerMove,
      humanPay,
      compPay,
      humanTotal:    this.scores.human,
      computerTotal: this.scores.computer,
    };
    this.history.push(round);
    return round;
  },

  isOver() {
    return this.history.length >= this.maxRounds;
  },

  winner() {
    if (this.scores.human > this.scores.computer) return 'human';
    if (this.scores.computer > this.scores.human) return 'computer';
    return 'tie';
  },

  // Simula un torneo round-robin entre todas las estrategias.
  // rounds = nº de rondas por emparejamiento.
  // Devuelve ranking ordenado por puntuación total.
  runTournament(rounds = 50) {
    const keys = Object.keys(STRATEGIES);
    const totals = {};
    keys.forEach(k => { totals[k] = 0; });

    for (let i = 0; i < keys.length; i++) {
      for (let j = 0; j < keys.length; j++) {
        if (i === j) continue;
        const histAB = [];
        for (let r = 0; r < rounds; r++) {
          const moveA = STRATEGIES[keys[i]].decide(histAB.map(h => ({ human: h.b, computer: h.a })));
          const moveB = STRATEGIES[keys[j]].decide(histAB.map(h => ({ human: h.a, computer: h.b })));
          const key   = moveA + moveB;
          const [payA, payB] = PD_PAYOFFS[key];
          histAB.push({ a: moveA, b: moveB, payA, payB });
          totals[keys[i]] += payA;
          totals[keys[j]] += payB;
        }
      }
    }

    return keys
      .map(k => ({ key: k, name: STRATEGIES[k].name, total: totals[k] }))
      .sort((a, b) => b.total - a.total);
  }
};
