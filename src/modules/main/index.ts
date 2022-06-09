jQuery(function() {
    setTimeout(() => {
        $('img.loading').fadeOut(500);
        $('#contenuto').fadeIn(500);
    }, 500);

    setTimeout(() => {
        $("#funzione").on('keyup', function(e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                $('#form-calcolo').trigger('submit');
            }
        });

        if (document.querySelector('#funzione')) $('#funzione').trigger('focus');
    }, 1200);

    $(window).on('scroll', function() {
        if (($(this).scrollTop() ?? 0) > 50) {
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