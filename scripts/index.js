const notifier = require('node-notifier');
const path = require('path');

const mathsolver = new MathSolver({
    elementi: {
        listaPunti: document.querySelector('#lista-punti'),
        passaggiScomposizione: document.querySelector('#scomposizione'),
        equazioniRisolte: document.querySelector('#equazioni-risolte'),
        risultato: document.querySelector('#div-risultato')
    },
    grafico: {
        elemento: document.querySelector('#grafico'),
        pagina: 'grafico.html',
        punti: true,
        asintoti: true,
        direttrice: true,
        vertice: true,
        fuoco: true,
        asse: true
    }
});

$(document).ready(() => {
    setTimeout(() => {
        $('img.loading').fadeOut(500);
        $('#contenuto').fadeIn(500);
    }, 500);

    setTimeout(() => {
        $('[name="funzione"]').focus();
    }, 1200);

    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            $('#back-to-top').fadeIn();
        } else {
            $('#back-to-top').fadeOut();
        }
    });

    $('#back-to-top').click(function() {
        $('body,html').animate({
            scrollTop: 0
        }, 400);
        return false;
    });
});

function calcolaRisultato(funzione) {
    mathsolver.pulisciPunti();
    let code = ``;
    code += mathsolver.intersezioneAsse(funzione, 'y');
    code += `<br>`;
    code += mathsolver.intersezioneAsse(funzione, 'x');
    mathsolver.disegnaFunzione(funzione);
    document.querySelector('#risultato').innerHTML = code;

    MathJax.Hub.Queue(['Typeset', MathJax.Hub, '.content']);
    setTimeout(() => {
        Array.from(document.querySelectorAll('.MathJax_Display')).forEach(el => {
            el.setAttribute('style', 'text-align: left;');
        });
    }, 500);
};

$('#form-calcolo').on('submit', (e) => {
    e.preventDefault();
    let funzione = $('[name="funzione"]').val();
    if (funzione) { // Se l'utente ha inserito un'equazione valida
        funzione = funzione.replace(',', '.');
        calcolaRisultato(funzione);
        mathsolver.mostraRisultato();
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
    mathsolver.togliRisultato();
});