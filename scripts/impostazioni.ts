import * as settings from 'electron-settings';

type ValoreImpostazioni = {
    el: string,
    name: string,
    defaultValue?: any
};

export default class Impostazioni {
    private static elementi: Array<ValoreImpostazioni> = [{
        el: '#intersezioneConGliAssi',
        name: 'intersezioneConGliAssi',
        defaultValue: true
    },
    {
        el: '#tipologiaFunzione',
        name: 'tipologiaFunzione',
        defaultValue: true
    },
    {
        el: '#condizioneDiEsistenzaFunzione',
        name: 'condizioneDiEsistenzaFunzione',
        defaultValue: true
    },
    {
        el: '#positivitaENegativitaFunzione',
        name: 'positivitaENegativitaFunzione',
        defaultValue: true
    },
    {
        el: '#massimiEMinimiFunzione',
        name: 'massimiEMinimiFunzione',
        defaultValue: true
    },
    {
        el: '#pariEDispariFunzione',
        name: 'pariEDispariFunzione',
        defaultValue: true
    },
    {
        el: '#verticeParabola',
        name: 'verticeParabola',
        defaultValue: true
    },
    {
        el: '#fuocoParabola',
        name: 'fuocoParabola',
        defaultValue: true
    },
    {
        el: '#direttriceParabola',
        name: 'direttriceParabola',
        defaultValue: true
    },
    {
        el: '#asseDiSimmetriaParabola',
        name: 'asseDiSimmetriaParabola',
        defaultValue: true
    },
    {
        el: '#positivitaENegativitaFunzione',
        name: 'positivitaENegativitaFunzione',
        defaultValue: true
    },
    {
        el: '#utilizzaSempreRuffini',
        name: 'utilizzaSempreRuffini',
        defaultValue: true
    }];

    /**
     * Metodo che prende un valore dalle impostazioni
     * 
     * @param {string} name Chiave
     * @param {any} def Valore di default
     */
    private static async get(name: string, def: any) {
        try {
            const val = await settings.get(name);
            if (val !== null && val !== undefined) return val;
            return def;
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
    private static async set(name: string, value: any) {
        try {
            await settings.set(name, value);
            console.log(`impostato ${name} in`, value);
        } catch (e) {
            console.error(e);
            console.error(`Impossibile cambiare ${value}`);
        }
    }

    /**
     * Funzione che carica le impostazioni nell'html
     */
    static async caricaImpostazioni(): Promise<void> {
        Impostazioni.elementi.forEach(async el => {
            const value: any = await Impostazioni.get(el.name, el.defaultValue);
            console.log(value);

            // Se è una stringa
            if (typeof (value) == 'string') {
                $(el.el).val(value);
            } else {
                if (value) $(el.el).prop('checked', 'checked');
            }
        });
    }

    /**
     * Metodo che salva le impostazioni modificate dall'utente
     */
    static async salvaImpostazioni(): Promise<void> {
        Impostazioni.elementi.forEach(async el => {
            let value: any;

            // Se è una stringa
            if (typeof (value) == 'string') {
                value = $(el.el).val();
            } else {
                value = $(el.el).is(':checked');
            }

            await Impostazioni.set(el.name, value);
        });
    }
}

Impostazioni.caricaImpostazioni();


$('#form-impostazioni').on('submit', e => {
    e.preventDefault();
    Impostazioni.salvaImpostazioni();
});