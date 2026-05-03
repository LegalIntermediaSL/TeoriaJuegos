// ============================================================
// game-tree.js — Árbol de juego extensivo con D3 v7
// + animación de backward induction
// ============================================================

const GameTree = {

  // Ejemplo predefinido: Juego de Entrada al Mercado
  // Incumbent (I) vs Entrant (E)
  ENTRY_GAME: {
    name: 'Juego de Entrada al Mercado',
    desc: 'El Entrante decide si entrar. Si entra, el Incumbente decide si guerrear o acomodar.',
    root: {
      id: 'root', label: 'Entrante', player: 1,
      children: [
        {
          id: 'no_enter', label: 'No entrar', type: 'leaf',
          payoffs: [0, 4], payoffLabel: '(0, 4)'  // (Entrante, Incumbente)
        },
        {
          id: 'enter', label: 'Entrar', player: 2, type: 'node', label2: 'Incumbente',
          children: [
            {
              id: 'war',     label: 'Guerra',    type: 'leaf',
              payoffs: [-1, -1], payoffLabel: '(-1, -1)'
            },
            {
              id: 'accom',  label: 'Acomodar',  type: 'leaf',
              payoffs: [1, 2], payoffLabel: '(1, 2)'
            }
          ]
        }
      ]
    }
  },

  // Backward induction: devuelve el árbol anotado con valores y nodos óptimos
  _solveBackward(node) {
    if (node.type === 'leaf') {
      return { ...node, value: node.payoffs, optimal: true };
    }
    const solvedChildren = node.children.map(c => this._solveBackward(c));
    const player = node.player; // 1-indexed
    const pi = player - 1;     // índice de pago

    let bestVal = -Infinity, bestChild = null;
    for (const child of solvedChildren) {
      if (child.value[pi] > bestVal) {
        bestVal = child.value[pi];
        bestChild = child;
      }
    }

    const children = solvedChildren.map(c => ({
      ...c,
      optimalPath: c.id === bestChild.id
    }));

    return { ...node, children, value: bestChild.value, optimal: true };
  },

  // Renderiza el árbol en el contenedor
  // config: { container, tree, width, height, animate }
  render(config) {
    const {
      container,
      tree = this.ENTRY_GAME,
      width  = 560,
      height = 320,
      animate = false,
    } = config;

    d3.select(container).selectAll('*').remove();

    const margin = { top: 20, right: 80, bottom: 20, left: 80 };
    const W = width  - margin.left - margin.right;
    const H = height - margin.top  - margin.bottom;

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Convertir a jerarquía D3
    const root = d3.hierarchy(tree.root, d => d.children);
    const treeLayout = d3.tree().size([H, W]);
    treeLayout(root);

    // Links
    const linkG = g.append('g').attr('class', 'links');
    linkG.selectAll('path')
      .data(root.links())
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', d => d.target.data.optimalPath ? '#2d7a50' : '#e0dbd3')
      .attr('stroke-width', d => d.target.data.optimalPath ? 2.5 : 1.5)
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x));

    // Edge labels (acción)
    g.selectAll('.edge-label')
      .data(root.links())
      .join('text')
      .attr('class', 'edge-label')
      .attr('x', d => (d.source.y + d.target.y) / 2)
      .attr('y', d => (d.source.x + d.target.x) / 2 - 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('fill', d => d.target.data.optimalPath ? '#2d7a50' : '#6b6560')
      .attr('font-weight', d => d.target.data.optimalPath ? 600 : 400)
      .text(d => d.target.data.label);

    // Nodos
    const nodeG = g.selectAll('.node')
      .data(root.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    // Círculo de nodo
    nodeG.append('circle')
      .attr('r', d => d.data.type === 'leaf' ? 5 : 10)
      .attr('fill', d => {
        if (d.data.type === 'leaf') return '#f7f5f0';
        return d.data.player === 1 ? '#1a3a5c' : '#b85c00';
      })
      .attr('stroke', d => {
        if (d.data.type === 'leaf') return '#e0dbd3';
        return d.data.player === 1 ? '#1a3a5c' : '#b85c00';
      })
      .attr('stroke-width', 2);

    // Etiqueta del jugador (nodos decisión)
    nodeG.filter(d => d.data.type !== 'leaf')
      .append('text')
      .attr('dy', -16)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('font-weight', 600)
      .attr('fill', d => d.data.player === 1 ? '#1a3a5c' : '#b85c00')
      .text(d => d.data.label2 || (d.data.player === 1 ? 'J1' : 'J2'));

    // Pagos en hojas
    nodeG.filter(d => d.data.type === 'leaf')
      .append('text')
      .attr('dx', 8)
      .attr('dy', 4)
      .attr('font-size', 11)
      .attr('font-weight', 600)
      .attr('fill', '#2c2c2c')
      .text(d => d.data.payoffLabel);

    // Leyenda
    const legend = g.append('g').attr('transform', `translate(0, ${H - 30})`);
    [['#1a3a5c', 'Jugador 1'], ['#b85c00', 'Jugador 2']].forEach(([color, label], i) => {
      legend.append('circle').attr('cx', i * 120).attr('cy', 0).attr('r', 6).attr('fill', color);
      legend.append('text').attr('x', i * 120 + 12).attr('y', 4).attr('font-size', 10).attr('fill', '#6b6560').text(label);
    });
    legend.append('line').attr('x1', 240).attr('y1', 0).attr('x2', 258).attr('y2', 0).attr('stroke', '#2d7a50').attr('stroke-width', 2.5);
    legend.append('text').attr('x', 262).attr('y', 4).attr('font-size', 10).attr('fill', '#6b6560').text('Camino óptimo');

    // Título
    svg.append('text')
      .attr('x', width / 2).attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11).attr('fill', '#6b6560')
      .text(tree.name);

    return svg.node();
  },

  // Renderiza primero sin solución, luego anima el backward induction
  renderAndSolve(config) {
    // Paso 1: árbol sin resolver
    this.render({ ...config, tree: { ...config.tree } });

    // Paso 2: tras un delay, resolver y re-renderizar
    return new Promise(resolve => {
      setTimeout(() => {
        const solved = this._solveBackward(config.tree.root);
        this.render({ ...config, tree: { ...config.tree, root: solved } });
        resolve(solved);
      }, config.delay || 800);
    });
  }
};
