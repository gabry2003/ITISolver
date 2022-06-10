const notifier = require("node-notifier");
const path = require("path");
const DbManager = require("../db-manager");

const mathsolver = new MathSolver({
  elementi: {
    listaPunti: "#lista-punti",
    passaggiScomposizione: "#scomposizione",
    equazioniRisolte: "#equazioni-risolte",
    risultato: "#div-risultato",
  },
  grafico: {
    elemento: document.querySelector("#grafico"),
    pagina: "grafico.html",
    punti: true,
    asintoti: true,
    direttrice: true,
    vertice: true,
    fuoco: true,
    asse: true,
  },
});

/**
 * Questa funzione fa partire lo studio della funzione presa in input
 *
 * @param {string} funzione Funzione da studiare
 * @param {string} parlato Funzione letta in italiano
 */
function calcolaRisultato(funzione, parlato) {
  // Salvo la funzione nella cronologia
  DbManager.db
    .get("cronologia")
    .push({
      dati: funzione,
      tipo: "studioFunzione",
      momento: Date.now(),
    })
    .save();

  if ("speechSynthesis" in window) {
    let synthesis = window.speechSynthesis;

    // Get the first `en` language voice in the list
    let voice = synthesis.getVoices().filter(function (voice) {
      return voice.lang === "en";
    })[0];

    // Create an utterance object
    let utterance = new SpeechSynthesisUtterance(parlato);

    // Set utterance properties
    utterance.voice = voice;
    utterance.pitch = 1.5;
    utterance.rate = 1.25;
    utterance.volume = 0.8;

    // Speak the utterance
    synthesis.speak(utterance);
  } else {
    console.warn("Text to speech non supportato");
  }

  mathsolver.pulisciPunti();

  let obj = new Funzione(funzione);
  let coefficienteAngolare = obj.coefficienteAngolare();

  let code = ``;
  let descrizioneFunzione = ``;

  if (DbManager.db.get("impostazioni.tipologiaFunzione")) {
    // Se devo dire la tipologia di funzione
    descrizioneFunzione += mathsolver.toLatex(`\\text{${obj.tipologia()}}`);
  }

  if (coefficienteAngolare) {
    descrizioneFunzione += mathsolver.toLatex(
      `\\text{Coefficiente angolare: ${coefficienteAngolare.numero.toFixed(
        2
      )} (${coefficienteAngolare.gradi.toFixed(2)}°)}`
    );
    if (coefficienteAngolare.angoloAcuto) {
      descrizioneFunzione += mathsolver.toLatex(
        `\\text{La retta forma un angolo acuto con il semiasse positivo delle x}`
      );
    }

    if (coefficienteAngolare.angoloRetto) {
      descrizioneFunzione += mathsolver.toLatex(
        `\\text{La retta è parallela all'asse x}`
      );
    }

    if (coefficienteAngolare.angoloOttuso) {
      descrizioneFunzione += mathsolver.toLatex(
        `\\text{La retta forma un angolo ottuso con il semiasse positivo delle x}`
      );
    }
  }

  $("#descrizione-funzione").css("display", "block");
  $("#descrizione-funzione").html(descrizioneFunzione);
  $("#funzione-pari-o-dispari").css("display", "block");
  $("#funzione-pari-o-dispari").html(mathsolver.funzionePariODispari(obj));
  $("#dominio-funzione").css("display", "block");
  $("#dominio-funzione").html(mathsolver.toLatex(`C.E. = ${obj.dominio()}`));

  $("#positivita-e-negativita").css("display", "block");
  $("#positivita-e-negativita").html(mathsolver.positivitaENegativita(obj));

  $("#crescenza-e-decrescenza").css("display", "block");
  $("#crescenza-e-decrescenza").html(mathsolver.crescenzaEDecrescenza(obj));

  $("#concavita").css("display", "block");
  $("#concavita").html(mathsolver.concavitaFunzione(obj));

  // Se devo fare l'intersezione con gli assi
  if (DbManager.db.get("impostazioni.intersezioneConGliAssi").value()) {
    code += mathsolver.intersezioneAsse(funzione, "y");
    code += `<br>`;
    code += mathsolver.intersezioneAsse(funzione, "x");

    $("#area-asse-x").css("display", "block");
    $("#area-asse-x").html(
      mathsolver.areaFunzione(obj, mathsolver.puntiAsse("x"))
    );

    $("#area-asse-y").css("display", "block");
    $("#area-asse-y").html(
      mathsolver.areaFunzione(obj, mathsolver.puntiAsse("y"))
    );
  }

  mathsolver.disegnaFunzione(funzione, mathsolver.puntiAttivi);
  document.querySelector("#risultato").innerHTML = code;

  MathJax.Hub.Queue(["Typeset", MathJax.Hub, ".content"]);
  setTimeout(() => {
    // Sposto a sinistra il testo di mathjax, che non sia la lista dei punti e la descrizione della funzione
    Array.from(document.querySelectorAll(".MathJax_Display")).forEach((el) => {
      if (
        el.parentElement.parentElement.id !== "lista-punti" &&
        el.parentElement.id !== "descrizione-funzione"
      ) {
        el.setAttribute("style", "text-align: left;");
      }
    });
  }, 500);
}

$("#form-calcolo").on("submit", (e) => {
  e.preventDefault();
  let funzione = $("#funzione").val();
  if (funzione) {
    // Se l'utente ha inserito un'equazione valida
    const parlato = document.getElementById("funzione").getValue("spoken-text");
    funzione = funzione.replace(",", ".");
    calcolaRisultato(funzione, parlato);
    mathsolver.mostraRisultato();
  } else {
    notifier.notify({
      title: "Errore",
      message: `Inserisci una funzione valida!`,
      icon: path.join(__dirname, "../images/icon.png"),
      sound: true,
    });
  }
});

$("#form-calcolo").on("reset", (e) => {
  mathsolver.togliRisultato();
  $("#descrizione-funzione").css("display", "none");
  $("#dominio-funzione").css("display", "none");
  $("#area-asse-x").css("display", "none");
  $("#area-asse-y").css("display", "none");
  $("#positivita-e-negativita").css("display", "none");
  $("#funzione-pari-o-dispari").css("display", "none");
  $("#crescenza-e-decrescenza").css("display", "none");
  $("#concavita").css("display", "none");
});
