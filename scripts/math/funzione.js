/**
 * Questa classe serve a definire le funzioni interpretate da una stringa.
 * Si trova quindi i membri di ogni equazione e tutti i termini che ne fanno parte.
 * Aggiunge inoltre dei metodi molto utili per lavorare con le funzioni matematiche, come ad esempio l'ordinazione e la ricerca del termine noto
 * 
 * @class
 */
class Funzione {
    constructor(config) {
        this.termini = config.termini;
        this.membri = config.membri;
    }

    /**
     * Metodo che ritorna il termine noto della funzione
     * 
     * @method
     * @returns {number} Termine noto
     */
    termineNoto() {
        let termine = 0;
        for (let i = 0; i < this.termini.length; i++) {
            if (this.termini[i].parteLetterale == null) return this.termini[i].coefficiente;
        }
        return termine;
    }

    /**
     * Metodo che ritorna il grado della funzione
     * 
     * @method
     */
    grado() {
        return Math.max(...this.termini.map(termine => {
            if (termine.parteLetterale) {
                return termine.parteLetterale.esponente;
            } else {
                return 0;
            }
        }));
    }

    /**
     * Metodo che ritorna il termine con un determinato esponente nella parte letterale
     * 
     * @method
     */
    getByExp(exp) {
        return this.termini.filter(termine => {
            if (termine.parteLetterale) {
                return termine.parteLetterale.esponente == exp;
            }
        })[0];
    }

    /**
     * Metodo che ordina l'array di termini in modo decrescente in base all'esponente della parte letterale
     * Non ritorna nulla perché modifica direttamente l'oggetto
     * 
     * @method
     */
    ordina() {
        // Ordino l'array dei termini in modo decrescente in base all'esponente della parte letterale
        this.termini.sort((a, b) => (b.parteLetterale ? b.parteLetterale.esponente : 0) - (a.parteLetterale ? a.parteLetterale.esponente : 0));
    }

    /**
     * Metodo che completa la funzione aggiungendo gli esponenti mancanti.
     * Es: x^3+0x^2+x
     * 
     * @method
     */
    completa() {
        const gradoFunzione = this.grado(); // Prendiamo il grado
        for (let i = gradoFunzione; i > 0; i--) { // Partiamo dal grado fino ad esponente 1
            // Se non c'è un termine con questo esponente
            if (this.termini.filter(termine => {
                    if (termine.parteLetterale) {
                        return termine.parteLetterale.esponente == i;
                    }
                }).length == 0) {
                // Lo aggiungo
                this.termini.push(new Termine({
                    coefficiente: 0,
                    parteLetterale: new ParteLetterale({
                        lettera: 'x',
                        esponente: i
                    })
                }));
            }
        }
        // Se manca il coefficiente
        if (this.termini.length < (gradoFunzione + 1)) {
            // Lo aggiungo
            this.termini.push(new Termine({
                coefficiente: 0,
                parteLetterale: new ParteLetterale({
                    lettera: 'x',
                    esponente: 0
                })
            }));
        }
        // Ordino la funzione
        this.ordina();
    }
}