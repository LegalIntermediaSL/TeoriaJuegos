// ============================================================
// matrix-renderer.js — Render de matrices de pagos con D3.js
// Requiere D3 v7 cargado en la página.
// ============================================================

const MatrixRenderer = {

  // config: {
  //   container: string (selector CSS),
  //   A: number[][], B: number[][],
  //   rowLabels: string[], colLabels: string[],
  //   player1: string, player2: string,
  //   editable: bool,           // permite editar pagos
  //   showNash: bool,           // resalta equilibrios Nash
  //   onPayoffChange: fn(A,B),  // callback al editar
  // }
  render(config) {
    const {
      container, A, B,
      rowLabels = A.map((_, i) => `F${i+1}`),
      colLabels = A[0].map((_, j) => `C${j+1}`),
      player1 = 'Jugador 1',
      player2 = 'Jugador 2',
      editable = false,
      showNash = true,
      onPayoffChange = null,
    } = config;

    const rows = A.length;
    const cols = A[0].length;
    const CELL_W = 110, CELL_H = 70;
    const LABEL_W = 90, LABEL_H = 40;
    const PAD = 8;

    const totalW = LABEL_W + cols * CELL_W + PAD * 2;
    const totalH = LABEL_H * 2 + rows * CELL_H + PAD * 2;

    // Limpiar contenedor
    d3.select(container).selectAll('*').remove();

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${totalW} ${totalH}`)
      .attr('width', '100%')
      .style('font-family', 'system-ui, sans-serif')
      .style('overflow', 'visible');

    const g = svg.append('g').attr('transform', `translate(${PAD}, ${PAD})`);

    // ── Fondo blanco con borde ──
    g.append('rect')
      .attr('x', LABEL_W).attr('y', LABEL_H * 2)
      .attr('width', cols * CELL_W).attr('height', rows * CELL_H)
      .attr('fill', '#ffffff').attr('stroke', '#e0dbd3').attr('stroke-width', 1);

    // ── Etiqueta Jugador 2 (arriba) ──
    g.append('text')
      .attr('x', LABEL_W + (cols * CELL_W) / 2)
      .attr('y', LABEL_H * 0.6)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13).attr('font-weight', 600)
      .attr('fill', '#1a3a5c')
      .text(player2);

    // ── Etiqueta Jugador 1 (izquierda, rotada) ──
    g.append('text')
      .attr('transform', `translate(18, ${LABEL_H * 2 + (rows * CELL_H) / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .attr('font-size', 13).attr('font-weight', 600)
      .attr('fill', '#1a3a5c')
      .text(player1);

    // ── Etiquetas de columnas ──
    colLabels.forEach((label, j) => {
      g.append('text')
        .attr('x', LABEL_W + j * CELL_W + CELL_W / 2)
        .attr('y', LABEL_H * 1.5)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12).attr('fill', '#6b6560')
        .text(label);
    });

    // ── Etiquetas de filas ──
    rowLabels.forEach((label, i) => {
      g.append('text')
        .attr('x', LABEL_W - 8)
        .attr('y', LABEL_H * 2 + i * CELL_H + CELL_H / 2 + 5)
        .attr('text-anchor', 'end')
        .attr('font-size', 12).attr('fill', '#6b6560')
        .text(label);
    });

    // ── Nash equilibria ──
    const nashCells = new Set();
    if (showNash) {
      const eq = NashSolver.findPureNashEquilibria(A, B);
      eq.forEach(e => nashCells.add(`${e.row},${e.col}`));
    }

    // ── Celdas ──
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = LABEL_W + j * CELL_W;
        const y = LABEL_H * 2 + i * CELL_H;
        const isNash = nashCells.has(`${i},${j}`);

        const cellG = g.append('g')
          .attr('class', `cell cell-${i}-${j}`)
          .attr('data-row', i).attr('data-col', j);

        // Fondo de celda
        cellG.append('rect')
          .attr('x', x).attr('y', y)
          .attr('width', CELL_W).attr('height', CELL_H)
          .attr('fill', isNash ? '#eef6ff' : '#ffffff')
          .attr('stroke', isNash ? '#4a90d9' : '#e0dbd3')
          .attr('stroke-width', isNash ? 2 : 1);

        // Diagonal divisoria
        cellG.append('line')
          .attr('x1', x).attr('y1', y + CELL_H)
          .attr('x2', x + CELL_W).attr('y2', y)
          .attr('stroke', '#e0dbd3').attr('stroke-width', 1);

        // Indicador Nash
        if (isNash) {
          cellG.append('text')
            .attr('x', x + CELL_W - 5).attr('y', y + 14)
            .attr('text-anchor', 'end')
            .attr('font-size', 9).attr('fill', '#4a90d9')
            .attr('font-weight', 600)
            .text('NE');
        }

        // Pago J1 (abajo-izquierda)
        const payText1 = cellG.append('text')
          .attr('x', x + CELL_W * 0.27).attr('y', y + CELL_H * 0.78)
          .attr('text-anchor', 'middle')
          .attr('font-size', 15).attr('font-weight', 600)
          .attr('fill', '#1a3a5c')
          .attr('class', 'pay1')
          .text(A[i][j]);

        // Pago J2 (arriba-derecha)
        const payText2 = cellG.append('text')
          .attr('x', x + CELL_W * 0.73).attr('y', y + CELL_H * 0.35)
          .attr('text-anchor', 'middle')
          .attr('font-size', 15).attr('font-weight', 600)
          .attr('fill', '#b85c00')
          .attr('class', 'pay2')
          .text(B[i][j]);

        // Edición inline
        if (editable) {
          cellG.style('cursor', 'pointer');
          cellG.on('click', (event) => {
            const target = event.target;
            const isPay1 = target.classList.contains('pay1') || event.offsetY > CELL_H / 2;
            const current = isPay1 ? A[i][j] : B[i][j];
            const val = prompt(`Nuevo pago (${isPay1 ? player1 : player2}):`, current);
            if (val !== null && !isNaN(+val)) {
              if (isPay1) A[i][j] = +val;
              else B[i][j] = +val;
              if (onPayoffChange) onPayoffChange(A, B);
              MatrixRenderer.render(config);
            }
          });
        }
      }
    }

    // ── Leyenda de pagos ──
    const legendY = totalH - PAD - 2;
    g.append('text')
      .attr('x', LABEL_W).attr('y', legendY)
      .attr('font-size', 10).attr('fill', '#6b6560')
      .html(`<tspan font-weight="600" fill="#1a3a5c">↙ ${player1}</tspan>  ·  <tspan font-weight="600" fill="#b85c00">↗ ${player2}</tspan>`);

    return svg.node();
  },

  // Resalta filas/columnas eliminadas (para la animación de EIED)
  highlightEliminated(container, type, index, color = '#e8c4c4') {
    d3.select(container)
      .selectAll(type === 'row' ? `[data-row="${index}"]` : `[data-col="${index}"]`)
      .select('rect')
      .transition().duration(400)
      .attr('fill', color);
  },

  // Anima la eliminación de una fila o columna (fade + strike)
  animateElimination(container, type, index) {
    const cells = d3.select(container)
      .selectAll(type === 'row' ? `.cell[data-row="${index}"]` : `.cell[data-col="${index}"]`);

    cells.select('rect')
      .transition().duration(300)
      .attr('fill', '#fde8e8');

    cells.selectAll('text')
      .transition().duration(300)
      .attr('opacity', 0.3);
  }
};
