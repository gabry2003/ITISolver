class Termine {
    constructor(config) {
        this.coefficiente = config.coefficiente;
        this.parteLetterale = config.parteLetterale;
    }

    toString() {
        let string;

        if (this.coefficiente == 1) {
            string = `+${this.parteLetterale.toString()}`;
        } else if (this.coefficiente == -1) {
            string = `-${this.parteLetterale.toString()}`;
        } else {
            string = numeroRazionale(this.coefficiente) + this.parteLetterale.toString()
        }

        // Se il primo carattere è un +
        if (string[0] == '+') string = string.substring(1);

        return string;
    }
}