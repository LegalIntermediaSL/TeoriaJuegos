// ============================================================
// auction.js — Simulaciones de subastas (primer precio y Vickrey)
// ============================================================

const AuctionSimulator = {

  // Puja óptima en subasta de primer precio con n postores,
  // valoraciones iid uniform [0, maxVal]
  optimalFirstPriceBid(valuation, nBidders) {
    if (nBidders <= 1) return valuation;
    return +(valuation * (nBidders - 1) / nBidders).toFixed(2);
  },

  // Genera un array de {id, valuation} con valores aleatorios en [0, maxVal]
  generateBidders(n, maxVal = 100, seed = null) {
    let s = seed !== null ? seed : Date.now();
    const rng = () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0x100000000;
    };
    return Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      valuation: +(rng() * maxVal).toFixed(1)
    }));
  },

  // Subasta de primer precio — cada postor puja óptimamente
  runFirstPrice(bidders) {
    const bids = bidders.map(b => ({
      ...b,
      bid: this.optimalFirstPriceBid(b.valuation, bidders.length)
    }));
    const winner = bids.reduce((a, b) => b.bid > a.bid ? b : a);
    return {
      type: 'Primer precio',
      bids,
      winnerId:         winner.id,
      winnerValuation:  winner.valuation,
      price:            winner.bid,
      surplus:          +(winner.valuation - winner.bid).toFixed(2)
    };
  },

  // Subasta de Vickrey (segundo precio) — estrategia dominante: pujar valoración real
  runVickrey(bidders) {
    const bids = bidders.map(b => ({ ...b, bid: b.valuation }))
                        .sort((a, b) => b.bid - a.bid);
    const winner = bids[0];
    const price  = bids[1]?.bid ?? 0;
    return {
      type: 'Vickrey (2.º precio)',
      bids,
      winnerId:         winner.id,
      winnerValuation:  winner.valuation,
      price:            +price.toFixed(2),
      surplus:          +(winner.valuation - price).toFixed(2)
    };
  },

  // Compara el ingreso medio de ambos formatos en N repeticiones
  // (Teorema de equivalencia de ingresos: deberían converger)
  compareRevenue(nBidders = 3, reps = 2000) {
    let fp = 0, vk = 0;
    for (let i = 0; i < reps; i++) {
      const bidders = this.generateBidders(nBidders, 100, i);
      fp += this.runFirstPrice(bidders).price;
      vk += this.runVickrey(bidders).price;
    }
    return {
      firstPriceAvg: +(fp / reps).toFixed(2),
      vickreyAvg:    +(vk / reps).toFixed(2),
      ratio:         +((fp / vk)).toFixed(4)
    };
  }
};
