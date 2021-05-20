const StormDB = require('stormdb');

class DbManager {
    static engine = new StormDB.localFileEngine('./config.json', {
        serialize: data => {
            return JSON.stringify(data, null, 4);
            //return encrypt(JSON.stringify(data));
        },
        deserialize: data => {
            return JSON.parse(data);
            //return JSON.parse(decrypt(data));
        }
    });
    static db = new StormDB(DbManager.engine);

    static initialize() {
        const defaultDb = {
            impostazioni: {
                intersezioneConGliAssi: true,
                tipologiaFunzione: true,
                tangenteAdUnaCurva: true,
                condizioneDiEsistenzaFunzione: true,
                positivitaENegativitaFunzione: true,
                massimiEMinimiFunzione: true,
                pariEDispariFunzione: true,
                verticeParabola: true,
                fuocoParabola: true,
                direttriceParabola: true,
                asseDiSimmetriaParabola: true,
                utilizzaSempreRuffini: true
            },
            cronologia: [],
            eventi: []
        };

        DbManager.db.default(defaultDb);
    }
}

DbManager.initialize();

module.exports = DbManager;