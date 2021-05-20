const DbManager = require('../db-manager');

class Impostazioni {
    static elementi = [{
            el: '#intersezioneConGliAssi',
            name: 'intersezioneConGliAssi'
        },
        {
            el: '#tipologiaFunzione',
            name: 'tipologiaFunzione'
        },
        {
            el: '#tangenteAdUnaCurva',
            name: 'tangenteAdUnaCurva'
        },
        {
            el: '#condizioneDiEsistenzaFunzione',
            name: 'condizioneDiEsistenzaFunzione'
        },
        {
            el: '#positivitaENegativitaFunzione',
            name: 'positivitaENegativitaFunzione'
        },
        {
            el: '#massimiEMinimiFunzione',
            name: 'massimiEMinimiFunzione'
        },
        {
            el: '#pariEDispariFunzione',
            name: 'pariEDispariFunzione'
        },
        {
            el: '#verticeParabola',
            name: 'verticeParabola'
        },
        {
            el: '#fuocoParabola',
            name: 'fuocoParabola'
        },
        {
            el: '#direttriceParabola',
            name: 'direttriceParabola'
        },
        {
            el: '#asseDiSimmetriaParabola',
            name: 'asseDiSimmetriaParabola'
        },
        {
            el: '#positivitaENegativitaFunzione',
            name: 'positivitaENegativitaFunzione'
        },
        {
            el: '#utilizzaSempreRuffini',
            name: 'utilizzaSempreRuffini'
        }
    ];

    /**
     * Metodo che prende un valore dalle impostazioni
     * 
     * @param {string} name Chiave
     * @param {any} def Valore di default
     */
    static async get(name, def) {
        try {
            return DbManager.db.get(`impostazioni`).get(name).value();
        } catch (e) {
            console.error(e);
            return def;
        }
    }

    /**
     * Metodo che cambia un valore nelle impostazioni
     * 
     * @param name 
     * @param value 
     */
    static async set(name, value) {
        try {
            DbManager.db.set(`impostazioni.${name}`, value).save();
            console.log(`impostato ${name} in`, value);
        } catch (e) {
            console.error(e);
            console.error(`Impossibile cambiare ${value}`);
        }
    }

    /**
     * Funzione che carica le impostazioni nell'html
     */
    static async caricaImpostazioni() {
        Impostazioni.elementi.forEach(async el => {
            if ($(el.el).length) {
                const value = await Impostazioni.get(el.name, el.defaultValue);

                // Se è una stringa
                if (typeof(value) == 'string') {
                    $(el.el).val(value);
                } else {
                    if (value) $(el.el).prop('checked', 'checked');
                }
            }
        });
    }

    /**
     * Metodo che salva le impostazioni modificate dall'utente
     */
    static async salvaImpostazioni() {
        Impostazioni.elementi.forEach(async el => {
            if ($(el.el).length) {
                let value;

                // Se è una stringa
                if (typeof(value) == 'string') {
                    value = $(el.el).val();
                } else {
                    value = $(el.el).is(':checked');
                }

                await Impostazioni.set(el.name, value);
            }
        });
    }
}

Impostazioni.caricaImpostazioni();


$('#form-impostazioni').on('submit', e => {
    e.preventDefault();
    Impostazioni.salvaImpostazioni();
});