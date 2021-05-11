const xMax = 20;
const yMax = 20;
const xMin = -xMax;
const yMin = -yMax;

const colori = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
		  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

let indexLetteraAttuale = 0;
let letteraAttuale;

const _GET = new URLSearchParams(window.location.search);
const funzione = _GET.get('funzione');
let punti = _GET.get('punti');
if (punti) { // Se ci sono punti
    punti = JSON.parse(punti);  // Parso l'array
}
const espressione = funzione.trim().replace('y=', '').replace('x=', '');
console.log('espressione', espressione);
console.log('punti', punti);

const expr = math.parse(espressione);

let mathbox = mathBox({
    plugins: ['core', 'controls', 'cursor', 'mathbox'],
    controls: { klass: THREE.OrbitControls }
});
if (mathbox.fallback) throw "WebGL not supported"

let three = mathbox.three;
three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);

// setting proxy:true allows interactive controls to override base position
let camera = mathbox.camera({
    proxy: true,
    position: [0, 0, 3],
});

// save the view as a variable to simplify accessing it later
let view = mathbox.cartesian({
    //range: [[-2, 2], [-1, 1]],
    range: [[xMin, xMax], [yMin, yMax]],
    scale: [3, 1.5],
});


// axes
let xAxis = view.axis({ axis: 1, width: 3, detail: 40, color: '#444444' });
let yAxis = view.axis({ axis: 2, width: 3, detail: 40, color: '#444444' });

// grid
let grid = view.grid({ width: 2, divideX: 20, divideY: 10, opacity: 0.25 });
mathbox.set('focus', 3);

// the interval function will create a 1D array of data sampled between the view bounds
let graphData = view.interval({
    expr: function (emit, x, i, t) {
        emit(x, expr.evaluate({ x: x }));
    },
    // width is the number of data points to generate; higher numbers = higher resolution
    width: 64,
    // channels indicate the dimensionality of the output (set to 2 for a 2D graph)
    channels: 2,
});

let curve =
    view.line({
        width: 5,
        color: '#505050',
    });

let points =
    view.point({
        size: 6,
        color: '#5C72FE',
    });

let scale =
    view.scale({
        divide: 10,
    });

let ticks =
    view.ticks({
        width: 5,
        size: 15,
        color: '#444444',
    });

let format =
    view.format({
        digits: 2,
        weight: 'bold',
    });

let labels =
    view.label({
        color: '#444444',
        zIndex: 1,
    });

let xLabelText = view.text({ width: 1, data: ['x'], font: 'Poppins', weight: 'bold', style: 'normal' });
let xLabelPoint = view.array({ width: 1, channels: 2, data: [[xMax, 0]] });
let xLabelDisplay = view.label({
    text: xLabelText, points: xLabelPoint,
    size: 20, color: 'red', outline: 1, background: '#444444', offset: [16, 0], zIndex: 1
});

let yLabelText = view.text({ width: 1, data: ['y'], font: 'Poppins', weight: 'bold', style: 'normal' });
let yLabelPoint = view.array({ width: 1, channels: 2, data: [[0, yMax]] });
let yLabelDisplay = view.label({
    text: yLabelText, points: yLabelPoint,
    size: 20, color: 'red', outline: 1, background: '#444444', offset: [0, 28], zIndex: 1
});

if (punti) { // Se ci sono punti
    // Li aggiungo nel grafico
    punti.forEach(punto => {
        // Prendo la lettera successiva per dare il nome al punto
        const nomePunto = letteraAttuale ? String.fromCharCode(letteraAttuale.charCodeAt(letteraAttuale.length - 1) + 1) : 'A';
        letteraAttuale = nomePunto;

        const colorePunto = colori[indexLetteraAttuale];
        let LabelTextPunto = view.text({ width: 1, data: [nomePunto], font: 'Poppins', weight: 'bold', style: 'normal' });
        let LabelPunto = view.array({ width: 1, channels: 2, data: [[punto.x, punto.y]] });
        let LabelDisplayPunto = view.label({
            text: LabelTextPunto, points: LabelPunto,
            size: 24, color: colorePunto, outline: 1, background: '#444444', offset: [0, 0], zIndex: 1
        });

        indexLetteraAttuale++;
    });
}

// Animazione
/*let play = mathbox.play({
    target: 'cartesian',
    pace: 5,
    to: 2,
    loop: false,
    script: [
        { props: { range: [[-2, 2], [-1, 1]] } },
        { props: { range: [[-4, 4], [-2, 2]] } },
        { props: { range: [[-2, 2], [-1, 1]] } },
    ]
});
*/