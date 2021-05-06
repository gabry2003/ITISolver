function disegnaFunzione(funzione) {
    try {
        // compile the expression once
        const expression = funzione.trim().replace('y=', '').replace('x=', '');
        const expr = math.compile(expression);

        // evaluate the expression repeatedly for different values of x
        const xValues = math.range(-10, 10, 0.5).toArray();
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
        Plotly.newPlot('plot', data);
    } catch (err) {
        console.error(err);
    }
}

function toLatex(string) {
    return `\\[${string}\\]`;
}

function numeroRazionale(value, maxdenom) {
    value = Math.round(value * 100) / 100; // Arrotondo a 2 cifre

    let best = {
        numeratore: 1,
        denominatore: 1,
        error: Math.abs(value - 1)
    }
    if (!maxdenom) maxdenom = 10000;

    for (let denominatore = 1; best.error > 0 && denominatore <= maxdenom; denominatore++) {
        let numeratore = Math.round(value * denominatore);
        let error = Math.abs(value - numeratore / denominatore);
        if (error >= best.error) continue;

        best.numeratore = numeratore;
        best.denominatore = denominatore;
        best.error = error;
    }

    if (best.denominatore == 1) return best.numeratore;

    return `\\frac{${best.numeratore.toString()}}{${best.denominatore.toString()}}`;
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

    return {
        lettera: lettera,
        esponente: esponente
    }
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

    const vecchiaParteLetterale = parteLetterale;

    if (parteLetterale == '') parteLetterale = null;
    parteLetterale = interpretaParteLetterale(parteLetterale);

    return {
        coefficiente: coefficiente,
        parteLetterale: parteLetterale,
        toString: function() {
            return numeroRazionale(coefficiente) + vecchiaParteLetterale
        }
    };
}

/**
 * Interpreta una funzione scritta come stringa
 * 
 * @param {*} funzione 
 */
function interpretaFunzione(funzione) {
    const membri = funzione.split('=');

    funzione = funzione.trim(); // Levo tutti gli spazi
    funzione = funzione.replace('x=', '').replace('y=', ''); // Lascio solo l'equazione
    // Splittiamo per il + o per il - l'espressione in più termini (es. termine con la x^2 ecc...)
    let partiStringa = splittaEspressione(funzione, ['+', '-']);
    // Adesso divido ogni termine in parte letterale e numerica
    let termini = partiStringa.map(interpretaTermine);

    return {
        termini: termini,
        termineNoto: function() {
            let termine = 0;
            for (let i = 0; i < termini.length; i++) {
                if (termini[i].parteLetterale == null) return termini[i].coefficiente;
            }
            return termine;
        },
        grado: function() {
            return Math.max(...termini.map(termine => {
                if (termine.parteLetterale) {
                    return termine.parteLetterale.esponente;
                } else {
                    return 0;
                }
            }));
        },
        getByExp: function(exp) {
            return termini.filter(termine => {
                if (termine.parteLetterale) {
                    return termine.parteLetterale.esponente == exp;
                }
            })[0];
        },
        membri: membri
    };
}

/**
 * Se il numero è negativo aggiunge una parentesi
 * 
 * @param {*} numero 
 */
function controllaParentesi(numero) {
    numero = numeroRazionale(numero);

    if (numero < 0) return `(${numero})`;

    return numero.toString();
}

/**
 * Risolve un'equazione di gradi maggiori al 2
 * 
 * @param {*} equazione 
 */
function risolviEquazioneGradiMaggiori(equazione, grado, asse) {
    let code = ``;

    code += `<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
<td><img src="../images/parentesiGraffa.png" width=40 height=90></td>
<td>`;
    code += toLatex(`${equazione.split('=')[1]} = 0`);

    code += `${toLatex(asse)}
</td>`;

    switch (grado) {
        case 3:
            break;
        case 4:
            break;
    }

    return code;
}

/**
 * Risolve un'equazione di primo e secondo grado
 * 
 * @param {*} equazione 
 */
function risolviEquazione(equazione, grado, asse) {
    let espressione;
    let code = ``;

    code += `<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
<td><img src="../images/parentesiGraffa.png" width=40 height=90></td>
<td>
    ${toLatex(equazione)}
    ${toLatex(asse)}
</td>`;

    switch (grado) {
        case 1:
            // Prendiamo le informazioni di questa equazione
            espressione = interpretaFunzione(equazione.split('=')[0]);
            const termineNoto = espressione.termineNoto();

            if (termineNoto !== 0) { // Se il termine noto è 0
                // Sposto il termine noto al secondo membro
                code += `<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td><img src="../images/parentesiGraffa.png" width=40 height=90></td>
                <td>
                    ${toLatex(espressione.termini[0].toString() + ' = ' + numeroRazionale(-(termineNoto)))}
                    ${toLatex(asse)}
                </td>`;

                // Divido il secondo membro per il coefficiente della x
                const ascissa = numeroRazionale(Math.round((-(termineNoto) / espressione.termini[0].coefficiente) * 100, 2) / 100);
                const ordinata = asse.split('=')[1];
                code += `<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td><img src="../images/parentesiGraffa.png" width=40 height=90></td>
                <td>
                    ${toLatex('x = ' + ascissa)}
                    ${toLatex(asse)}
                </td>`;

                aggiungiPunto(ascissa, ordinata);
            } else { // Altrimenti
                // x = 0
                code += `<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
<td><img src="../images/parentesiGraffa.png" width=40 height=90></td>
<td>
    ${toLatex('x = 0')}
    ${toLatex(asse)}
</td>`;
                aggiungiPunto(0, 0);
            }
            break;
        case 2:
            // Prendiamo le informazioni di questa equazione
            espressione = interpretaFunzione(equazione.split('=')[0]);
            const a = espressione.getByExp(2);
            const b = espressione.getByExp(1);
            const c = espressione.termineNoto();
            const delta = Math.pow((b ? b.coefficiente : 0), 2) - (4 * a.coefficiente * c);
            const radice = Math.sqrt(delta);
            const risultati = [
                (-(b ? b.coefficiente : 0) - radice) / 2 * a.coefficiente,
                (-(b ? b.coefficiente : 0) + radice) / 2 * a.coefficiente
            ];

            // Stampo la formula
            code += `<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td><img src="../images/parentesiGraffa.png" width=40 height=90></td>
                <td>`;
            code += toLatex(`x = (-b \\pm sqrt(b^2-4ac))/2a`);

            code += `${toLatex(asse)}
                </td>`;
            // Stampo l'equazione con i numeri sostituiti
            code += `<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td><img src="../images/parentesiGraffa.png" width=40 height=90></td>
                <td>`;
            code += toLatex(`x = (-${controllaParentesi((b ? b.coefficiente : 0))} \\pm sqrt(${controllaParentesi((b ? b.coefficiente : 0))}^2-4*${controllaParentesi(a.coefficiente)}*${controllaParentesi(c)}))/${controllaParentesi(a.coefficiente * 2)} = 0`);

            code += `${toLatex(asse)}
                </td>`;
            // Stampo l'equazione con il delta trovato
            code += `<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td><img src="../images/parentesiGraffa.png" width=40 height=90></td>
                <td>`;

            code += toLatex(`x = (-${controllaParentesi((b ? b.coefficiente : 0))} \\pm sqrt(${numeroRazionale(delta)}))/${controllaParentesi(a.coefficiente * 2)}`);

            code += `${toLatex(asse)}
                </td>`;
            if (delta < 0) { // Se il delta è minore di zero
                // L'equazione è impossibile
                // Stampo l'equazione con la radice risolta
                code += `<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
            <td><img src="../images/parentesiGraffa.png" width=40 height=90></td>
            <td>
                ${toLatex('eq. imp. in R')}
                
                ${toLatex(asse)}
            </td>`;
            } else { // Altrimenti
                // Stampo l'equazione con la radice risolta
                code += `<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
            <td><img src="../images/parentesiGraffa.png" width=40 height=90></td>
            <td>
                x = (-${controllaParentesi((b ? b.coefficiente : 0))} \\pm ${numeroRazionale(radice)})/${controllaParentesi(a.coefficiente)}
                
                ${toLatex(asse)}
            </td>`;

                // Se il delta è uguale a zero
                if (delta == 0) {
                    // Stampo il risultato
                    code += `<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
            <td><img src="../images/parentesiGraffa.png" width=40 height=90></td>
            <td>
                ${toLatex('x = \\pm' + numeroRazionale(Math.abs(risultati[0])))}
                
                ${toLatex(asse)}
            </td>`;
                    aggiungiPunto(risultati[0], 0);
                } else {
                    // Stampo i risultati
                    for (let i = 0; i < 2; i++) {
                        code += `<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                        <td><img src="../images/parentesiGraffa.png" width=40 height=90></td>
                        <td>
                            ${toLatex('x_\{' + i + 1 + '\} = ' + numeroRazionale(risultati[i]))}
                            
                            ${toLatex(asse)}
                        </td>`;
                        aggiungiPunto(risultati[i], 0);
                    }
                }
            }
            break;
        default:
            return risolviEquazioneGradiMaggiori(equazione, grado, asse);
    }

    return code;
}

function intersezioneAsse(funzione, asse) {
    const equazioniAssi = {
        x: 'y = 0',
        y: 'x = 0'
    };
    let code = `<h6>Intersezione con l'asse ${asse}</h6>
<table tborder=0>
    <tbody>
        <tr>
            <td><img src="../images/parentesiGraffa.png" width=40 height=90></td>
            <td>
                ${toLatex(funzione)}
                
                ${toLatex(equazioniAssi[asse])}
            </td>`;

    funzione = interpretaFunzione(funzione); // Interpretiamo la funzione in un oggetto

    if (asse == 'y') { // Se devo fare l'intersezione con l'asse y
        const termineNoto = funzione.termineNoto();
        code += `<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
<td><img src="../images/parentesiGraffa.png" width=40 height=90></td>
<td>
    ${toLatex('y = ' + termineNoto)}
    ${toLatex(equazioniAssi[asse])}
</td>`;
        aggiungiPunto(0, termineNoto);
    } else {
        code += risolviEquazione(`${funzione.membri[1]}=0`, funzione.grado(), equazioniAssi[asse]);
    }

    code += `
        </tr>
    </tbody>
<table>`;
    return code;
}