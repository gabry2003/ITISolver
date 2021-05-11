function disegnaFunzione(funzione) {
    try {
        const expression = funzione.trim().replace('y=', '').replace('x=', '');
        const expr = math.compile(expression);

        let mathbox = mathBox({
            element: document.querySelector('#grafico'),
            plugins: ['core', 'controls', 'cursor', 'mathbox'],
            controls: { klass: THREE.OrbitControls }
        });
        if (mathbox.fallback) throw 'WebGL not supported'

        let three = mathbox.three;
        three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);

        // 1. determine where the camera is looking at...

        // setting proxy:true allows interactive controls to override base position
        let camera = mathbox.camera({ proxy: true, position: [0, 0, 3] });

        // 2. coordinate system that contains...

        // save the view as a variable to simplify accessing it later
        let view = mathbox.cartesian({
            range: [
                [-50, 50],
                [-2, 2]
            ],
            scale: [1, 1]
        });

        // axes
        let xAxis = view.axis({ axis: 1, width: 8, detail: 40, color: "red" });
        let yAxis = view.axis({ axis: 2, width: 8, detail: 40, color: "green" });

        // grid
        let grid = view.grid({ width: 2, divideX: 20, divideY: 10, opacity: 0.25 });

        // 3. geometric data represented via...

        // the interval function will create a 1D array of data sampled between the view bounds
        let graphData = view.interval({
            expr: function(emit, x, i, t) {
                emit(x, expr.evaluate({ x: x }));
            },
            // width is the number of data points to generate; higher numbers = higher resolution
            width: 256,
            // channels indicate the dimensionality of the output (set to 2 for a 2D graph)
            channels: 2,
        });

        // 4. choice of shape to draw it as...

        let graphView = view.line({ width: 4, color: "blue" });
        view.point({ size: 6, color: "blue" });
        /*// compile the expression once
        // evaluate the expression repeatedly for different values of x
        const xValues = math.range(-100, 100, 0.1).toArray();
        const yValues = xValues.map(function(x) {
            return expr.evaluate({ x: x })
        });

        // render the plot using plotly
        const trace1 = {
            x: xValues,
            y: yValues,
            type: 'scatter'
        };

        const data = [trace1];
        Plotly.newPlot('grafico', data);*/
    } catch (err) {
        console.error(err);
    }
}

/**
 * Funzione che aggiunge il codice Latex allo schermo
 * 
 * @param {string} string Codice Latex
 * @param {boolean} [add=true] Se aggiungere le stringhe iniziali e finali
 */
function toLatex(string, add = true) {
    let risultato = string;
    if (add) {
        risultato = `\\[${string}\\]`;
    }
    return risultato;
}

/**
 * Funzione che torna il numero sotto forma di frazione
 * 
 * @param {number} value Numero da controllare
 */
function numeroRazionale(value) {
    return value;
    /*const frazione = math.fraction(math.number(value));
    if (frazione.d !== 1) {
        return `\\frac{${frazione.n.toString()}} {${frazione.d.toString()}}`;
    } else {
        return value;
    }*/
}

/**
 * Divide l'espressione in ogni termine di cui è composta
 * 
 * @param {*} espressione 
 * @param {*} caratteri Caratteri delimitanti
 */
function splittaEspressione(espressione, caratteri) {
    let split = [];
    let stringa = '';

    for (let i = 0; i < espressione.length; i++) {
        const carattere = espressione[i];


        if (!caratteri.includes(espressione[i]) || i == 0) { // Se non è un carattere da splittare e non è il primo carattere dell'espressione
            stringa += espressione[i];
        } else {
            split.push(stringa); // Aggiungiamo la stringa nell'array
            stringa = `${carattere}`; // Svuotiamo la stringa
        }

        if (i == (espressione.length - 1)) { // Se sono all'ultimo carattere e non ho trovato nulla da splittare
            split.push(stringa); // Aggiungiamo la stringa nell'array
        }
    }

    return split;
}

/**
 * Divide la parte letterale in lettere e ogni lettera un esponente
 * 
 * @param {*} parteLetterale 
 */
function interpretaParteLetterale(parteLetterale) {
    if (parteLetterale == null) return null;

    let split = parteLetterale.split('^');
    let esponente = 1;
    let lettera = split[0];

    if (split.length > 1) {
        esponente = parseFloat(split[1]);
    }

    return new ParteLetterale({
        lettera: lettera,
        esponente: esponente
    });
}

/**
 * Interpreta il termine di un espressione e divide in coefficiente e parte letterale
 * 
 * @param {*} termine 
 */
function interpretaTermine(termine) {
    let coefficiente = '';
    let parteLetterale = '';
    let prendiCoefficiente = true;

    for (let i = 0; i < termine.length; i++) { // Leggo tutti i caratteri del termine
        // Se è una lettera
        if (termine[i].isAlpha()) {
            prendiCoefficiente = false; // Smettiamo di prendere il coefficiente
        }

        if (prendiCoefficiente) { // Se posso prendere il coefficiente
            coefficiente += termine[i];
        } else { // Altrimenti
            parteLetterale += termine[i];
        }
    }

    switch (coefficiente) {
        case '+':
        case '':
            coefficiente = 1;
            break;
        case '-':
            coefficiente = -1;
            break;
        default:
            coefficiente = parseFloat(coefficiente);
    }

    if (parteLetterale == '') parteLetterale = null;
    parteLetterale = interpretaParteLetterale(parteLetterale);

    return new Termine({
        coefficiente: coefficiente,
        parteLetterale: parteLetterale
    });
}

/**
 * Interpreta una funzione scritta come stringa
 * 
 * @param {string} funzione 
 * @returns {Funzione} Funzione interpretata
 */
function interpretaFunzione(funzione) {
    const membri = funzione.split('=');

    funzione = funzione.trim(); // Levo tutti gli spazi
    funzione = funzione.replace('x=', '').replace('y=', ''); // Lascio solo l'equazione
    // Splittiamo per il + o per il - l'espressione in più termini (es. termine con la x^2 ecc...)
    let partiStringa = splittaEspressione(funzione, ['+', '-']);
    // Adesso divido ogni termine in parte letterale e numerica
    let termini = partiStringa.map(interpretaTermine);

    return new Funzione({
        termini: termini,
        membri: membri
    });
}

/**
 * Funzione che se il numero è negativo aggiunge una parentesi
 * 
 * @param {number} numero Numero da controllare
 */
function controllaParentesi(numero) {
    numero = numeroRazionale(numero);

    if (numero < 0) return `(${numero})`;

    return numero.toString();
}

/**
 * Funzione che trova i divisori di un numero
 * 
 * @param {number} n Numero di cui trovare i divisori
 * @param {boolean} [negativi=true] Prendere anche valori negativi
 */
function trovaDivisori(n, negativi = true) {
    n = Math.abs(n); // Faccio il valore assoluto del numero

    let divisori = [];

    for (let i = 1; i <= parseInt(Math.sqrt(n)); i++) {
        if (n % i == 0) {
            if (parseInt(n / i) == i) {
                divisori.push(i);
            } else {
                divisori.push(i);
                divisori.push(parseInt(n / i));
            }
        }
    }

    // Se devo aggiungere anche i numeri negativi
    if (negativi) {
        // Li aggiungo
        divisori = divisori.concat(divisori.map(divisore => -(divisore)));
    }

    // Ordino l'array
    divisori.sort((a, b) => a - b);

    return divisori;
}

/**
 * Controlla se il numero è lo zero del polinomio
 * 
 * @param {number} numero
 * @param {string} polinomio
 */
function isZeroPolinomio(numero, polinomio) {
    let res = math.parse(polinomio).evaluate({
        x: numero
    });
    return res == 0;
    /*console.log('a', polinomio);
    polinomio = polinomio.replaceAll('x', `(${numero})`).replaceAll('^', '**');
    console.log('a', polinomio);
    return eval(polinomio) == 0; // Eseguo il calcolo e controllo se il risultato è zero*/
}

/**
 * Scompone un'equazione utilizzando il metodo di ruffini
 * 
 * @param {Funzione} funzione Funzione da scomporre con ruffini
 * @returns 
 */
function scomponiConRuffini(funzione) {
    let equazioneScomposta = [];
    let scomposizione = ``;

    funzione.ordina(); // Ordino la funzione in modo decrescente in base all'esponente della parte letterale
    const polinomio = funzione.membri[0];
    const termineNoto = funzione.termineNoto();
    let zeroPolinomio;
    let divisoriTermineNoto = [];
    let divisoriICoefficiente = [];
    let probabiliZero = [termineNoto];

    if (termineNoto !== 0) { // Se c'è il termine noto
        // Cerco i divisori del termine noto
        divisoriTermineNoto = trovaDivisori(funzione.termineNoto());
    }

    /*
    I probabili sono:
    - Termine noto
    - Divisori del termine noto
    - Primo coefficiente
    - Divisori del I coefficiente (con segno +)
    - Rapporti tra divisori del termine noto e divisori del I coefficiente
    */
    // Aggiungo i divisori del termine noto
    probabiliZero = probabiliZero.concat(divisoriTermineNoto);
    // Aggiungo il primo coefficiente
    probabiliZero = probabiliZero.concat(funzione.termini[0].coefficiente);
    // Aggiungo i divisori del I coefficiente
    divisoriICoefficiente = trovaDivisori(funzione.termini[0].coefficiente, false);
    probabiliZero = probabiliZero.concat(divisoriICoefficiente);
    // Aggiungo i rapporti tra i divisori del termine noto e i divisori del I coefficiente
    // Per ogni divisore del termine noto
    for (divisore in divisoriTermineNoto) {
        // Per ogni divisore del primo coefficiente
        for (divisore2 in divisoriICoefficiente) {
            probabiliZero.push(divisore / divisore2);
        }
    }

    // Tra i probabili zero del polinomio, cerco quello giusto
    for (let divisore of probabiliZero) {
        if (isZeroPolinomio(divisore, polinomio)) { // Se il divisore è lo zero del polinomio
            zeroPolinomio = divisore;
            break;
        }
    }

    // Se lo zero del polinomio esiste
    if (zeroPolinomio !== undefined && zeroPolinomio !== null) {
        // Completo il polinomio con i termini mancanti
        funzione.completa();
        let moltiplicazioni = ``;
        let somme = ``;
        let risultati = [];

        let risultato = funzione.termini[0].coefficiente * (zeroPolinomio); // Moltiplico il primo coefficiente per lo zero del polinomio
        for (let i = 1; i < funzione.termini.length; i++) { // A partire dal secondo termine
            moltiplicazioni += `<td>${toLatex(risultato)}</td>`;
            risultato = funzione.termini[i].coefficiente + risultato;
            risultati.push(risultato);
            somme += `<td>${toLatex(risultato)}</td>`;
            risultato = risultato * (zeroPolinomio);
        }

        let griglia = `<table class="table tabella-ruffini">
    <tbody>
    <tr>
        <td></td>`;

        for (let i = 0; i < funzione.termini.length; i++) {
            griglia += `<td>${toLatex(funzione.termini[i].coefficiente)}</td>`;
        }

        griglia += `</tr>
        <tr>
            <td>${toLatex(zeroPolinomio)}</td>
            <td></td>
            ${moltiplicazioni}
        </tr>`;

        griglia += `
        <tr class="somme-ruffini">
            <td></td>
            <td>${toLatex(funzione.termini[0].coefficiente)}</td>
            ${somme}`;
        griglia += `
        </tr>
    </tbody>
</table>`;

        // Dopo aver fatto la griglia ci creiamo più equazioni
        risultati = [funzione.termini[0].coefficiente].concat(risultati);
        let exp = funzione.grado() - 1;
        let scomposta = ``;
        for (let i = 0; i < (risultati.length - 1); i++) { // Per ogni risultato
            if (risultati[i] !== 0) { // Se il risultato non è zero
                // Se il risultato è -1
                if (risultati[i] == -1) {
                    scomposta += '-';
                } else if (risultati[i] == 1) { // Se è 1
                    // Se non è il primo risultato
                    if (i > 0) {
                        scomposta += '+';
                    }
                } else { // Altrimenti
                    if (risultati[i] > 0) scomposta += '+';
                    scomposta += risultati[i];
                }
                if (exp !== 0) {
                    if (exp !== 1) {
                        scomposta += `x^${exp}`;
                    } else {
                        scomposta += `x`;
                    }
                }
                exp--;
            }
        }
        equazioneScomposta.push(scomposta);

        // Divido il polinomio per "x-(x1)" dove "x1" è lo zero del polinomio
        let controllaMeno = ``;
        // Se lo zero del polinomio è negativo
        if (zeroPolinomio < 0) {
            controllaMeno = `\\frac {${polinomio}} {x+${Math.abs(zeroPolinomio)}}`;
            equazioneScomposta.push(`x+${Math.abs(zeroPolinomio)}`);
        } else {
            equazioneScomposta.push(`x-${zeroPolinomio}`);
        }

        let equazioneScompostaString = ``;
        equazioneScomposta.forEach(eq => {
            equazioneScompostaString += `(${eq})`;
        });

        scomposizione += `<div class="col d-flex justify-content-center">
    <div class="card bg-dark text-white mb-4">
        <div class="card-header">${toLatex('\\text{Scomposizione con Ruffini}')}</div>
        <div class="card-body">
            ${toLatex('\\frac {' + polinomio + '}' + ' {x-' + controllaParentesi(zeroPolinomio) + '}' + (controllaMeno !== '' ? ' = ' + controllaMeno : ' '))}
        
            <br>
            ${griglia}
            <br>

            ${toLatex(equazioneScompostaString)}
        </div>
    </div>
</div>`;
    }

    return {
        equazione: equazioneScomposta,
        scomposizione: scomposizione
    };
}

/**
 * Funzione che scompone un equazione trovando il metodo migliore per scomporla
 * 
 * @param {Funzione} funzione Funzione da scomporre
 */
function scomponi(funzione) {
    // Prima di utilizzare la scomposizione con Ruffini provo con altri metodi di scomposizione
    // Se devo scomporre con Ruffini
    return scomponiConRuffini(funzione);
}

/**
 * Risolve un'equazione di gradi maggiori al 2
 * 
 * @param {string} equazione Equazione da risolvere
 * @param {number} grado Grado dell'equazione da risolvere
 * @param {string} asse Asse con cui è stata effettuata l'intersezione
 * @param {boolean} [sistema=true] Se risolvere e basta o fare il sistema
 * @param {booolean} [pulisci=true] Se pulire i div
 */
function risolviEquazioneGradiMaggiori(equazione, grado, asse, sistema = true, pulisci = true) {
    let risultati = [];

    if (pulisci) {
        $('#scomposizione').html('');
        $('#equazioni-risolte').html('');
    }

    const scomposta = scomponi(interpretaFunzione(equazione));
    // Se l'equazione è scomponibile stampo a schermo la scomposizione
    if (scomposta.scomposizione !== '') {
        $('#scomposizione').html($('#scomposizione').html() + scomposta.scomposizione);
    }
    let equazioneScomposta = ``;

    let code = ``;
    if (sistema) code += `<td class="spazio-sistema"></td>
<td class="graffa-sistema">`;
    code += toLatex(equazione);
    if (sistema) code += `${toLatex(asse)}
</td>`;

    if (scomposta.equazione.length > 0) { // Se l'equazione è stata scomposta
        $('#scomposizione').css('display', 'block');
        $('#equazioni-risolte').css('display', 'flex');

        // La stampo a schermo
        risultati = [];
        let equazioniScomposte = [];

        for (let i = 0; i < scomposta.equazione.length; i++) { // per ogni equazione trovata
            // La risolvo e mi salvo i risultati
            equazioneScomposta += `(${scomposta.equazione[i]})`;
            const equazioneRisolta = risolviEquazione(`${scomposta.equazione[i]}=0`, null, asse, false, false);
            // Mostro a schermo i passaggi per la risoluzione dell'equazione
            $('#equazioni-risolte').html($('#equazioni-risolte').html() + `<div class="col-md-6">
    <div class="card bg-dark text-white mb-4">
        <div class="card-header">${toLatex('\\text{Risoluzione equazione}')}</div>
        <div class="card-body">
            ${equazioneRisolta.code}
        </div>
    </div>
</div>`);
            risultati = risultati.concat(equazioneRisolta.risultati);
            if (equazioneRisolta.equazioneScomposta) { // Se è presente un'equazione scomposta
                equazioniScomposte.push(equazioneRisolta.equazioneScomposta);
            }
        }

        $('#scomposizione').css('display', 'block');
        $('#equazioni-risolte').css('display', 'flex');

        equazioneScomposta += `=0`;
        // Visualizzo a schermo l'equazione scomposta
        if (sistema) code += `<td class="spazio-sistema"></td>
<td class="graffa-sistema">`;
        code += toLatex(`${equazioneScomposta}`);
        if (sistema) code += `${toLatex(asse)}
</td>`;

        // Visualizzo a schermo le altre scomposizioni
        if (sistema) {
            let ultimaDaConcatenare;

            if (scomposta.equazione.length > 0) { // Se l'equazione è stata scomposta
                ultimaDaConcatenare = `(${scomposta.equazione[scomposta.equazione.length - 1]})`;
            }

            equazioniScomposte.forEach(eq => {
                eq = eq.split('=')[0]; // Prendo il primo membro dell'equazione
                eq = `${eq}${ultimaDaConcatenare}`; // Concateno

                code += `<td class="spazio-sistema"></td>
                <td class="graffa-sistema">`;
                code += toLatex(`${eq}=0`);
                code += `${toLatex(asse)}
                </td>`;

                ultimaDaConcatenare = eq;
            });
        }

        // Rimuovo i doppioni dai risultati
        risultati = [...new Set(risultati)];

        // Ordino l'array di risultati
        risultati.sort((a, b) => a - b);

        risultati.forEach((risultato, i) => {
            if (sistema) code += `<td class="spazio-sistema"></td>
<td class="graffa-sistema">`;
            code += toLatex('x_\{' + (i + 1) + '\} = ' + numeroRazionale(risultato));
            if (sistema) code += toLatex('y_\{' + (i + 1) + '\} = 0');
            if (sistema) code += `
</td>`;
        });
    } else { // Altrimenti
        if (sistema) {
            code += `<td class="spazio-sistema"></td>
            <td>${toLatex('\\text{Impossibile scomporre l\'equazione}')}</td>`;
        } else {
            code += toLatex('\\text{Impossibile scomporre l\'equazione}');
        }
    }

    return {
        code: code,
        risultati: risultati,
        equazioneScomposta: equazioneScomposta
    };
}

/**
 * Risolve un'equazione di qualunque grado.
 * Quando un'equazione è di grado superiore al secondo chiama un'altra funzione che la risolve in un altro modo
 * 
 * @param {string} equazione Equazione da risolvere
 * @param {number} grado Grado dell'equazione
 * @param {string} asse Asse con cui è stata fatta l'intersezione
 * @param {boolean} [sistema=true] Se risolvere e basta o fare il sistema
 * @param {booolean} [pulisci=true] Se pulire i div
 * @returns {*} Risultati dell'equazione e il codice da stampare a schermo
 */
function risolviEquazione(equazione, grado, asse, sistema = true, pulisci = true) {
    // Prendiamo le informazioni di questa equazione
    let espressione = interpretaFunzione(equazione.split('=')[0]);
    let code = ``;
    let risultati = [];
    grado = grado || espressione.grado();

    switch (grado) {
        case 1:
            $('#scomposizione').css('display', 'none');
            $('#equazioni-risolte').css('display', 'none');
            if (sistema) code += `<td class="spazio-sistema"></td>
<td class="graffa-sistema">`;
            code += toLatex(equazione);
            if (sistema) code += `${toLatex(asse)}
</td>`;

            const termineNoto = espressione.termineNoto();

            if (termineNoto !== 0) { // Se il termine noto è 0
                // Sposto il termine noto al secondo membro
                if (sistema) code += `<td class="spazio-sistema"></td>
                <td class="graffa-sistema">`;
                code += toLatex(espressione.termini[0].toString() + ' = ' + numeroRazionale(-(termineNoto)));
                if (sistema) code += `${toLatex(asse)}
                </td>`;

                // Divido il secondo membro per il coefficiente della x
                // Se il coefficiente è diverso da 1
                let ascissa = numeroRazionale(Math.round((-(termineNoto) / espressione.termini[0].coefficiente) * 100, 2) / 100);
                let ordinata = asse.split('=')[1];

                if (espressione.termini[0].coefficiente !== 1) {
                    if (sistema) code += `<td class="spazio-sistema"></td>
                    <td class="graffa-sistema">`;
                    code += toLatex('x = ' + ascissa);
                    if (sistema) code += `${toLatex(asse)}
                    </td>`;
                }

                aggiungiPunto(ascissa, ordinata);

                risultati = [ascissa];
            } else { // Altrimenti
                if (sistema) code += `<td class="spazio-sistema"></td>
<td class="graffa-sistema">`;
                code += toLatex('x = 0');
                if (sistema) code += `${toLatex(asse)}
</td>`;
                aggiungiPunto(0, 0);
            }
            break;
        case 2:
            $('#scomposizione').css('display', 'none');
            $('#equazioni-risolte').css('display', 'none');
            if (sistema) code += `<td class="spazio-sistema"></td>
<td class="graffa-sistema">`;
            code += toLatex(equazione);
            if (sistema) code += `${toLatex(asse)}
</td>`;
            const a = espressione.getByExp(2);
            const b = espressione.getByExp(1);
            const c = espressione.termineNoto();
            const delta = Math.pow((b ? b.coefficiente : 0), 2) - (4 * a.coefficiente * c);
            const radice = Math.sqrt(delta);
            risultati = [
                (-(b ? b.coefficiente : 0) - radice) / 2 * a.coefficiente,
                (-(b ? b.coefficiente : 0) + radice) / 2 * a.coefficiente
            ];

            // Stampo la formula
            if (sistema) code += `<td class="spazio-sistema"></td>
                <td class="graffa-sistema">`;
            code += toLatex(`x = \\frac{-b \\pm \\sqrt{b^2-4ac}} {2a}`);

            if (sistema) code += `${toLatex(asse)}
                </td>`;
            // Stampo l'equazione con i numeri sostituiti
            if (sistema) code += `<td class="spazio-sistema"></td>
                <td class="graffa-sistema">`;
            code += toLatex(`x = \\frac{-${controllaParentesi((b ? b.coefficiente : 0))} \\pm \\sqrt{${controllaParentesi((b ? b.coefficiente : 0))}^2-4*${controllaParentesi(a.coefficiente)}*${controllaParentesi(c)}}} {${controllaParentesi(a.coefficiente * 2)}} = 0`);

            if (sistema) code += `${toLatex(asse)}
                </td>`;
            // Stampo l'equazione con il delta trovato
            if (sistema) code += `<td class="spazio-sistema"></td>
                <td class="graffa-sistema">`;

            code += toLatex(`x = \\frac{-${controllaParentesi((b ? b.coefficiente : 0))} \\pm \\sqrt{${numeroRazionale(delta)}}} {${controllaParentesi(a.coefficiente * 2)}}`);

            if (sistema) code += `${toLatex(asse)}
                </td>`;
            if (delta < 0) { // Se il delta è minore di zero
                // L'equazione è impossibile
                // Stampo l'equazione con la radice risolta
                if (sistema) code += `<td class="spazio-sistema"></td>
            
            <td class="graffa-sistema">`;
                code += toLatex('\\text{eq. imp. in } \\mathbb{R}');

                if (sistema) code += `${toLatex(asse)}
            </td>`;
            } else { // Altrimenti
                // Stampo l'equazione con la radice risolta
                if (sistema) code += `<td class="spazio-sistema"></td>
            
            <td class="graffa-sistema">`;
                code += toLatex(`x = \\frac{-${controllaParentesi((b ? b.coefficiente : 0))} \\pm ${numeroRazionale(radice)}} {${controllaParentesi(a.coefficiente)}}`);
                if (sistema) code += `${toLatex(asse)}
            </td>`;

                // Se il delta è uguale a zero
                if (delta == 0) {
                    // Stampo il risultato
                    if (sistema) code += `<td class="spazio-sistema"></td>
            
            <td class="graffa-sistema">`;
                    code += toLatex('x_\{1,2\} = \\pm' + numeroRazionale(Math.abs(risultati[0])));

                    if (sistema) code += `${toLatex(asse)}
            </td>`;
                    aggiungiPunto(risultati[0], 0);
                } else {
                    // Stampo i risultati
                    for (let i = 0; i < 2; i++) {
                        if (sistema) code += `<td class="spazio-sistema"></td>
                        
                        <td class="graffa-sistema">`;
                        code += toLatex('x_\{' + (i + 1) + '\} = ' + numeroRazionale(risultati[i]));
                        if (sistema) code += toLatex('y_\{' + (i + 1) + '\} = 0');
                        if (sistema) code += `</td>`;
                        aggiungiPunto(risultati[i], 0);
                    }
                }
            }
            break;
        default:
            return risolviEquazioneGradiMaggiori(equazione, grado, asse, sistema, pulisci);
    }

    return {
        code: code,
        risultati: risultati
    };
}

function intersezioneAsse(funzione, asse) {
    const equazioniAssi = {
        x: 'y = 0',
        y: 'x = 0'
    };
    let code = `<h6>${toLatex('\\text{Intersezione con l\'asse ' + asse + '}')}</h6>
<table tborder=0>
    <tbody>
        <tr>
            
            <td class="graffa-sistema">
                ${toLatex(funzione)}
                
                ${toLatex(equazioniAssi[asse])}
            </td>`;

    funzione = interpretaFunzione(funzione); // Interpretiamo la funzione in un oggetto

    if (asse == 'y') { // Se devo fare l'intersezione con l'asse y
        const termineNoto = funzione.termineNoto();
        code += `<td class="spazio-sistema"></td>

<td class="graffa-sistema">
    ${toLatex('y = ' + numeroRazionale(termineNoto))}
    ${toLatex(equazioniAssi[asse])}
</td>`;
        aggiungiPunto(0, termineNoto);
    } else {
        code += risolviEquazione(`${funzione.membri[1]}=0`, funzione.grado(), equazioniAssi[asse]).code;
    }

    code += `
        </tr>
    </tbody>
<table>`;
    return code;
}