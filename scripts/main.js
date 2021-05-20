window.DbManager = require('../db-manager');

jQuery(function() {
    setTimeout(() => {
        $('img.loading').fadeOut(500);
        $('#contenuto').fadeIn(500);
    }, 500);

    setTimeout(() => {
        let source = {};
        // Per ogni evento della cronologia delle funzioni studiate
        // Togliendo i duplicati
        /*DbManager.db.get('cronologia').value().
        filter(cronologia => cronologia.tipo == 'studioFunzione').
        filter((v, i, a) => a.findIndex(t => (t.dati === v.dati)) === i).
        forEach((cronologia, i) => {
            source[cronologia.dati] = i;
        });*/

        /*document.getElementById('funzione').addEventListener('input', (ev) => {
            // `ev.target` is an instance of `MathfieldElement`
            console.log(ev.target.getValue('ascii-math'));
            console.log(ev.target.getValue('spoken-text'));
        });*/

        $("#funzione").on('keyup', function(e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                $('#form-calcolo').trigger('submit');
            }
        });

        if (document.querySelector('#funzione')) $('#funzione').trigger('focus');

        /*$('#funzione').autocomplete({
            source: source,
            highlightClass: 'text-danger',
            treshold: 2,
        });*/
    }, 1200);

    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 50) {
            $('#back-to-top').fadeIn();
        } else {
            $('#back-to-top').fadeOut();
        }
    });

    $('#back-to-top').on('click', function() {
        $('body,html').animate({
            scrollTop: 0
        }, 400);
        return false;
    });
});

var exports = { '__esModule': true };