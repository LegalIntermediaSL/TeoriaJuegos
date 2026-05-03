# Teoría de Juegos — Tutorial Interactivo

Curso divulgativo de teoría de juegos con 10 módulos web interactivos y 10 cuadernos Jupyter. Sin dependencias de build: funciona directamente en el navegador y en GitHub Pages.

## Demo

Abre `index.html` en local o visita **[GitHub Pages](https://legalintermediasl.github.io/TeoriaJuegos/)** una vez activado en Settings → Pages.

## Estructura

```
TeoriaJuegos/
├── index.html                  # Portada con los 10 módulos y barra de progreso
├── css/
│   ├── main.css                # Sistema de diseño (variables, tipografía, layout)
│   └── components.css          # Tarjetas, botones, breadcrumbs, module-nav
├── js/
│   ├── core/
│   │   └── progress.js         # Progreso por módulo (localStorage)
│   └── simulations/
│       ├── nash-solver.js      # EIED, equilibrios puros y mixtos 2×2
│       ├── prisoner-dilemma.js # 7 estrategias iteradas (TFT, Grim, Pavlov…)
│       ├── evolutionary.js     # Dinámica del replicador (Euler)
│       ├── shapley.js          # Valor de Shapley (permutaciones)
│       └── auction.js          # Subastas primer precio y Vickrey
│   └── visualizations/
│       ├── matrix-renderer.js  # Matriz de pagos D3 con EIED animado
│       ├── best-response.js    # Curvas de mejor respuesta D3
│       └── game-tree.js        # Árbol extensivo D3 con backward induction
├── modules/
│   ├── 01-introduccion/        # Quiz: ¿decisión ordinaria o estratégica?
│   ├── 02-dominancia/          # EIED paso a paso, matriz editable
│   ├── 03-nash/                # 5 juegos clásicos, curvas de mejor respuesta
│   ├── 04-prisionero/          # 20 rondas jugables, 7 estrategias
│   ├── 05-suma-cero/           # Calculadora minimax, punto de silla
│   ├── 06-juegos-extensivos/   # Árbol interactivo, backward induction
│   ├── 07-estrategias-mixtas/  # Slider p, curvas de indiferencia D3
│   ├── 08-evolucionaria/       # Halcón-Paloma, sliders V/C/x0/T
│   ├── 09-cooperativos/        # Calculadora Shapley, axiomas, core
│   └── 10-mecanismos/          # Simulador subastas, equivalencia de ingresos
└── notebooks/
    ├── 00_setup.ipynb           # Verificación del entorno
    ├── 01_introduccion.ipynb    # Juego como tupla (N, S, u) con numpy
    ├── 02_dominancia.ipynb      # EIED implementado desde cero
    ├── 03_nash_equilibrio.ipynb # nashpy: support_enumeration + curvas BR
    ├── 04_dilema_prisionero.ipynb # axelrod: torneo con 7 estrategias
    ├── 05_suma_cero.ipynb       # minimax + scipy.linprog
    ├── 06_juegos_extensivos.ipynb # backward induction con networkx
    ├── 07_estrategias_mixtas.ipynb # principio de indiferencia + penalti real
    ├── 08_evolucionaria.ipynb   # dinámica del replicador con solve_ivp
    ├── 09_cooperativos_shapley.ipynb # Shapley, core, juego de aeropuerto
    └── 10_diseno_mecanismos.ipynb   # subastas, Myerson, principal-agente
```

## Módulos

| # | Título | Concepto central | Widget |
|---|--------|-----------------|--------|
| 01 | Pensar estratégicamente | Decisión vs. juego estratégico | Quiz 5 preguntas |
| 02 | Dominancia | EIED, estrategias dominadas | Matriz editable animada |
| 03 | Equilibrio de Nash | Equilibrios puros y mixtos | Selector de juegos + BR chart |
| 04 | Dilema del Prisionero | Cooperación vs. traición iterada | Juego jugable 20 rondas |
| 05 | Juegos de Suma Cero | Minimax, punto de silla | Calculadora minimax |
| 06 | Juegos Extensivos | Backward induction, SPE | Árbol interactivo |
| 07 | Estrategias Mixtas | Principio de indiferencia | Slider p + indiferencia |
| 08 | Teoría Evolutiva | ESS, dinámica del replicador | Halcón-Paloma sliders |
| 09 | Juegos Cooperativos | Valor de Shapley, core | Calculadora coaliciones |
| 10 | Diseño de Mecanismos | Subastas, equivalencia ingresos | Simulador subastas |

## Ejecutar los notebooks

**Con conda (recomendado):**
```bash
conda env create -f notebooks/environment.yml
conda activate teoria-juegos
jupyter lab
```

**Con pip:**
```bash
pip install -r notebooks/requirements.txt
jupyter lab
```

**Entorno mínimo**: Python 3.10+, numpy, scipy, matplotlib, networkx, nashpy, axelrod.

## Tecnologías

- **Web**: HTML/CSS/JS vanilla — sin framework, sin build step
- **Visualización**: [D3.js v7](https://d3js.org/) (CDN)
- **Notebooks**: Python 3, numpy, scipy, matplotlib, networkx, [nashpy](https://nashpy.readthedocs.io/), [axelrod](https://axelrod.readthedocs.io/)
- **Despliegue**: GitHub Pages (carpeta raíz, rama main)

## Licencia

MIT — libre para uso educativo y adaptación.
