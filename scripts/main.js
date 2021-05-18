jQuery(function() {
    setTimeout(() => {
        $('img.loading').fadeOut(500);
        $('#contenuto').fadeIn(500);
    }, 500);

    setTimeout(() => {
        if (document.querySelector('[name="funzione"]')) $('[name="funzione"]').trigger('focus');
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

var exports = { "__esModule": true };