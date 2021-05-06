const notifier = require('node-notifier');
const { parse } = require('path');
const path = require('path');

let letteraAttuale;
let puntiAttivi = [];

String.prototype.isAlpha = function() {
    return this.match('^[a-zA-Z\(\)]+$');
};

$(document).ready(() => {
    setTimeout(() => {
        $('img.loading').fadeOut(500);
        $('#contenuto').fadeIn(500);
    }, 500);
    $('[name="funzione"]').focus();
});

function calcolaRisultato(funzione) {
    pulisciPunti();
    let code = ``;
    code += intersezioneAsse(funzione, 'y');
    code += `<br>`;
    code += intersezioneAsse(funzione, 'x');
    disegnaFunzione(funzione);
    $('#risultato').html(code);
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, '.content']);
};

function pulisciPunti() {
    $('#lista-punti').html('');
    letteraAttuale = null;
    puntiAttivi.length = 0;
}

function togliRisultato() {
    $('#div-risultato').css('display', 'none');
    pulisciPunti();
}

function mostraRisultato() {
    $('#div-risultato').css('display', 'block');
}

function aggiungiPunto(x, y) {
    // Prendo la lettera successiva per dare il nome al punto
    const nomePunto = letteraAttuale ? String.fromCharCode(letteraAttuale.charCodeAt(letteraAttuale.length - 1) + 1) : 'A';
    letteraAttuale = nomePunto;
    let code = `${$('#lista-punti').html()}
<li>`;
    code += toLatex(`${nomePunto}(${numeroRazionale(x)}, ${numeroRazionale(y)})`);
    code += `</li>`;
    $('#lista-punti').html(code);
    puntiAttivi.push({
        x: x,
        y: y
    });
}

$('#form-calcolo').on('submit', (e) => {
    e.preventDefault();
    let funzione = $('[name="funzione"]').val();
    if (funzione) { // Se l'utente ha inserito un'equazione valida
        funzione = funzione.replace(',', '.');
        calcolaRisultato(funzione);
        mostraRisultato();
    } else {
        notifier.notify({
            title: 'Errore',
            message: `Inserisci una funzione valida!`,
            icon: path.join(__dirname, '../images/icon.png'),
            sound: true
        });
    }
});

$('#form-calcolo').on('reset', (e) => {
    togliRisultato();
});