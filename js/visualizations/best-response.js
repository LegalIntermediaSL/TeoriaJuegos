// ============================================================
// best-response.js — Curvas de mejor respuesta (D3 v7)
// Para juegos 2×2 con estrategias mixtas.
// Eje X: probabilidad p (J1 juega fila 0)
// Eje Y: probabilidad q (J2 juega columna 0)
// El equilibrio de Nash es la intersección de las curvas.
// ============================================================

const BestResponseChart = {

  // config: {
  //   container: string (selector),
  //   A: number[][], B: number[][],
  //   rowLabels: [string, string],
  //   colLabels: [string, string],
  //   player1: string, player2: string,
  //   width: number, height: number,
  // }
  render(config) {
    const {
      container,
      A, B,
      rowLabels = ['Fila 0', 'Fila 1'],
      colLabels  = ['Col 0', 'Col 1'],
      player1 = 'Jugador 1',
      player2 = 'Jugador 2',
      width  = 460,
      height = 400,
    } = config;

    const margin = { top: 30, right: 30, bottom: 55, left: 60 };
    const W = width  - margin.left - margin.right;
    const H = height - margin.top  - margin.bottom;

    d3.select(container).selectAll('*').remove();

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 1]).range([0, W]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([H, 0]);

    // ── Ejes ──
    g.append('g').attr('transform', `translate(0,${H})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format('.1f')))
      .call(ax => ax.select('.domain').attr('stroke', '#e0dbd3'))
      .call(ax => ax.selectAll('.tick line').attr('stroke', '#e0dbd3'));

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format('.1f')))
      .call(ax => ax.select('.domain').attr('stroke', '#e0dbd3'))
      .call(ax => ax.selectAll('.tick line').attr('stroke', '#e0dbd3'));

    // Etiquetas de ejes
    g.append('text')
      .attr('x', W / 2).attr('y', H + 44)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#6b6560')
      .text(`p = Prob(${rowLabels[0]}) — ${player1}`);

    g.append('text')
      .attr('transform', `translate(-44, ${H / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', '#6b6560')
      .text(`q = Prob(${colLabels[0]}) — ${player2}`);

    // Grid ligero
    g.append('g').attr('class', 'grid')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-W).tickFormat(''))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('.tick line').attr('stroke', '#f0ede6').attr('stroke-dasharray', '3,3'));

    // ── Mejor respuesta J1 (función de q → mejor p) ──
    // J1 prefiere fila 0 si pago esperado de F0 > F1:
    // A[0][0]*q + A[0][1]*(1-q) > A[1][0]*q + A[1][1]*(1-q)
    // Umbral: q* = (A[1][1]-A[0][1]) / ((A[0][0]-A[0][1])-(A[1][0]-A[1][1]))
    const dA = (A[0][0] - A[0][1]) - (A[1][0] - A[1][1]);
    const qStar = Math.abs(dA) < 1e-10 ? null : (A[1][1] - A[0][1]) / dA;

    // La curva de BR de J1 en el espacio (p, q):
    // si q > q*: J1 juega F0 (p=1) → segmento vertical x=1 para q∈[q*,1]
    // si q < q*: J1 juega F1 (p=0) → segmento vertical x=0 para q∈[0,q*]
    // si q = q*: J1 es indiferente → segmento horizontal q=q* para p∈[0,1]

    const br1 = g.append('g').attr('class', 'br1');
    const COLOR1 = '#1a3a5c';

    if (qStar === null) {
      // J1 siempre indiferente — toda la curva es una línea horizontal
      br1.append('line')
        .attr('x1', xScale(0)).attr('y1', yScale(0.5))
        .attr('x2', xScale(1)).attr('y2', yScale(0.5))
        .attr('stroke', COLOR1).attr('stroke-width', 2.5).attr('stroke-dasharray', '6,3');
    } else {
      const qs = Math.max(0, Math.min(1, qStar));
      // p=0 para q < q*
      br1.append('line')
        .attr('x1', xScale(0)).attr('y1', yScale(0))
        .attr('x2', xScale(0)).attr('y2', yScale(qs))
        .attr('stroke', COLOR1).attr('stroke-width', 2.5);
      // horizontal en q*
      br1.append('line')
        .attr('x1', xScale(0)).attr('y1', yScale(qs))
        .attr('x2', xScale(1)).attr('y2', yScale(qs))
        .attr('stroke', COLOR1).attr('stroke-width', 2.5).attr('stroke-dasharray', '5,3');
      // p=1 para q > q*
      br1.append('line')
        .attr('x1', xScale(1)).attr('y1', yScale(qs))
        .attr('x2', xScale(1)).attr('y2', yScale(1))
        .attr('stroke', COLOR1).attr('stroke-width', 2.5);
    }

    // ── Mejor respuesta J2 (función de p → mejor q) ──
    // J2 prefiere col 0 si B[0][0]*p + B[1][0]*(1-p) > B[0][1]*p + B[1][1]*(1-p)
    const dB = (B[0][0] - B[1][0]) - (B[0][1] - B[1][1]);
    const pStar = Math.abs(dB) < 1e-10 ? null : (B[1][1] - B[1][0]) / dB;

    const br2 = g.append('g').attr('class', 'br2');
    const COLOR2 = '#b85c00';

    if (pStar === null) {
      br2.append('line')
        .attr('x1', xScale(0)).attr('y1', yScale(0.5))
        .attr('x2', xScale(1)).attr('y2', yScale(0.5))
        .attr('stroke', COLOR2).attr('stroke-width', 2.5).attr('stroke-dasharray', '6,3');
    } else {
      const ps = Math.max(0, Math.min(1, pStar));
      // q=0 para p < p*
      br2.append('line')
        .attr('x1', xScale(0)).attr('y1', yScale(0))
        .attr('x2', xScale(ps)).attr('y2', yScale(0))
        .attr('stroke', COLOR2).attr('stroke-width', 2.5);
      // vertical en p*
      br2.append('line')
        .attr('x1', xScale(ps)).attr('y1', yScale(0))
        .attr('x2', xScale(ps)).attr('y2', yScale(1))
        .attr('stroke', COLOR2).attr('stroke-width', 2.5).attr('stroke-dasharray', '5,3');
      // q=1 para p > p*
      br2.append('line')
        .attr('x1', xScale(ps)).attr('y1', yScale(1))
        .attr('x2', xScale(1)).attr('y2', yScale(1))
        .attr('stroke', COLOR2).attr('stroke-width', 2.5);
    }

    // ── Leyenda ──
    const legend = g.append('g').attr('transform', `translate(${W - 160}, 5)`);
    [[COLOR1, player1], [COLOR2, player2]].forEach(([color, label], i) => {
      legend.append('line')
        .attr('x1', 0).attr('y1', i * 20 + 6).attr('x2', 22).attr('y2', i * 20 + 6)
        .attr('stroke', color).attr('stroke-width', 2.5);
      legend.append('text')
        .attr('x', 28).attr('y', i * 20 + 10)
        .attr('font-size', 11).attr('fill', '#2c2c2c')
        .text(`BR(${label})`);
    });

    // ── Equilibrios de Nash (intersecciones) ──
    const equilibria = NashSolver.solveGame(A, B);

    // Equilibrios puros
    equilibria.pure.forEach(eq => {
      g.append('circle')
        .attr('cx', xScale(eq.row === 0 ? 1 : 0))
        .attr('cy', yScale(eq.col === 0 ? 1 : 0))
        .attr('r', 0)
        .transition().duration(600).delay(300)
        .attr('r', 7)
        .attr('fill', '#2d7a50').attr('stroke', 'white').attr('stroke-width', 2);
    });

    // Equilibrio mixto
    if (equilibria.mixed) {
      const mx = xScale(equilibria.mixed.p);
      const my = yScale(equilibria.mixed.q);
      g.append('circle')
        .attr('cx', mx).attr('cy', my).attr('r', 0)
        .transition().duration(600).delay(300)
        .attr('r', 7)
        .attr('fill', '#8b5cf6').attr('stroke', 'white').attr('stroke-width', 2);

      g.append('text')
        .attr('x', mx + 10).attr('y', my - 8)
        .attr('font-size', 10).attr('fill', '#8b5cf6')
        .text(`(${equilibria.mixed.p.toFixed(2)}, ${equilibria.mixed.q.toFixed(2)})`);
    }

    // Título
    svg.append('text')
      .attr('x', width / 2).attr('y', 16)
      .attr('text-anchor', 'middle').attr('font-size', 12)
      .attr('fill', '#6b6560')
      .text('Curvas de mejor respuesta · Los puntos verdes son equilibrios de Nash');

    return svg.node();
  },

  // Actualiza el chart sin recrear el SVG (útil para sliders en tiempo real).
  update(config) {
    this.render(config); // re-render completo; suficiente para 2×2
  }
};
