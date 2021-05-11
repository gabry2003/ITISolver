class ParteLetterale {
    constructor(config) {
        this.lettera = config.lettera;
        this.esponente = config.esponente;
    }

    toString() {
        if (this.esponente !== 0) {
            if (this.esponente !== 1) {
                return `${this.lettera}^${this.esponente}`;
            } else {
                return `${this.lettera}`;
            }
        } else {
            return this.lettera;
        }
    }
}