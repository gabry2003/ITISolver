const notifier = require('node-notifier');
const { parse } = require('path');
const path = require('path');

let letteraAttuale;
let puntiAttivi = [];

String.prototype.isAlpha = function () {
    return this.match('^[a-zA-Z\(\)]+$');
};

$(document).ready(() => {
    setTimeout(() => {
        $('img.loading').fadeOut(500);
        $('#contenuto').fadeIn(500);
    }, 500);

    setTimeout(() => {
        $('[name="funzione"]').focus();
    }, 1200);

    $(window).scroll(function () {
        if ($(this).scrollTop() > 50) {
            $('#back-to-top').fadeIn();
        } else {
            $('#back-to-top').fadeOut();
        }
    });

    $('#back-to-top').click(function () {
        $('body,html').animate({
            scrollTop: 0
        }, 400);
        return false;
    });
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
    if (puntiAttivi.filter(punto => punto.x == x && punto.y == y).length == 0) { // Se questo punto non esiste già
        // Lo aggiungo
        puntiAttivi.push({
            x: x,
            y: y
        });

        // Prendo la lettera successiva per dare il nome al punto
        const nomePunto = letteraAttuale ? String.fromCharCode(letteraAttuale.charCodeAt(letteraAttuale.length - 1) + 1) : 'A';
        letteraAttuale = nomePunto;
        let code = `${$('#lista-punti').html()}<li style="list-style-type: none;">`;
        code += toLatex(`${nomePunto}(${numeroRazionale(x)}, ${numeroRazionale(y)})`);
        code += `</li>`;
        $('#lista-punti').html(code);
    }
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