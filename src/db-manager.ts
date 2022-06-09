import StormDB from "stormdb";


export class DbManager {
    private static _instance: DbManager;

    static get instance(): DbManager {
        return this._instance = this._instance ?? new DbManager();
    }

    engine: any;
    db: StormDB;
    
    private constructor() {
        this.engine = new StormDB.localFileEngine('../config.json', {
            serialize: data => {
                return JSON.stringify(data, null, 4);
                //return encrypt(JSON.stringify(data));
            },
            deserialize: data => {
                return JSON.parse(data);
                //return JSON.parse(decrypt(data));
            }
        });
        this.db = new StormDB(this.engine);

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

        this.db.default(defaultDb);
    }
}