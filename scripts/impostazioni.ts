import * as settings from 'electron-settings';

/**
 * Funzione che prende un valore dalle impostazioni
 * 
 * @param {string} name Chiave
 * @param {*} def Valore di default
 */
async function get(name, def) {
    const val = await settings.get(name);
    if (val !== null && val !== undefined) return val;
    return def;
}

/**
 * Funzione che carica le impostazioni nell'html
 */
async function caricaImpostazioni() {
    const els = [{
        el: '#intersezioneConGliAssi',
        value: await get('intersezioneConGliAssi', true)
    }];

    els.forEach(el => {
        const value = el.value;

        // Se è una stringa
        if (typeof(value) == 'string') {
            $(el.el).val(value);
        } else {
            $(el.el).prop('checked', value);
        }
    });
}

caricaImpostazioni();

$('#form-impostazioni').submit(e => {
    e.preventDefault();
});