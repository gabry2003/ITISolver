import path from "path";
import notifier from "node-notifier";
import { derivata, Funzione, MathSolver } from "@evolvementdev/mathsolver";
import { DbManager } from "../../db-manager";

const mathsolver = new MathSolver({
  elementi: {
    listaPunti: "#lista-punti",
    passaggiScomposizione: "#scomposizione",
    equazioniRisolte: "#equazioni-risolte",
    risultato: "#div-risultato",
  },
  grafico: {
    elemento: document.querySelector("#grafico") as HTMLIFrameElement,
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
 * Funzione che mostra o nasconde un elemento dato il selettore
 *
 * @param selector Selettore
 */
export function toggle(selector: string) {
  $(selector).slideToggle();
}

/**
 * Questa funzione fa partire la dimostrazione del concetto di derivata
 *
 * @param funzione Funzione da studiare
 * @param parlato Funzione letta in italiano
 */
export function avviaDimostrazione(funzione: string, parlato: string) {
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
  let coefficienteAngolare = obj.coefficienteAngolare;
  const tipologia = obj.tipologia;

  let code = ``;
  let descrizioneFunzione = ``;

  if (
    DbManager.instance.db.get("impostazioni.tipologiaFunzione") &&
    tipologia
  ) {
    // Se devo dire la tipologia di funzione
    descrizioneFunzione += mathsolver.toLatex(`\\text{${tipologia}}`);
  }

  $("#derivata-funzione").html(mathsolver.toLatex(`${derivata(obj)}`));

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

  $("#descrizione-funzione").html(descrizioneFunzione);

  // Se devo fare l'intersezione con gli assi
  if (
    DbManager.instance.db.get("impostazioni.intersezioneConGliAssi").value()
  ) {
    code += mathsolver.intersezioneAsse(funzione, "y");
    code += `<br>`;
    code += mathsolver.intersezioneAsse(funzione, "x");
  }

  mathsolver.disegnaFunzione(funzione, mathsolver.puntiAttivi);

  const risultatoEl = document.querySelector("#risultato");
  if (risultatoEl) {
    risultatoEl.innerHTML = code;
  }

  setTimeout(() => {
    // Sposto a sinistra il testo di mathjax, che non sia la lista dei punti e la descrizione della funzione
    Array.from(document.querySelectorAll(".MathJax_Display")).forEach((el) => {
      if (
        el.parentElement?.parentElement?.id !== "lista-punti" &&
        el.parentElement?.id !== "descrizione-funzione"
      ) {
        el.setAttribute("style", "text-align: left;");
      }
    });
  }, 500);

  mathsolver.mostraRisultato();
  ['derivata-funzione', "card-punti", "scomposizione", "equazioni-risolte", "card-risultato"]
    .map((selector) => $(`#${selector}`))
    .forEach((el) => el.css("display", "none"));
}

$("#form-calcolo").on("submit", (e) => {
  e.preventDefault();
  let funzione = $("#funzione").val();
  if (funzione) {
    // Se l'utente ha inserito un'equazione valida
    const parlato = (document.getElementById("funzione") as any)?.getValue(
      "spoken-text"
    );
    funzione = funzione.toString().replace(",", ".");
    avviaDimostrazione(funzione, parlato);
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, ".content"]);
  } else {
    notifier.notify({
      title: "Errore",
      message: `Inserisci una funzione valida!`,
      icon: path.join(__dirname, "../../../assets/images/icon.png"),
      sound: true,
    });
  }
});

$("#form-calcolo").on("reset", (e) => {
  mathsolver.togliRisultato();
  $("#derivata-funzione").html("");
  $("#descrizione-funzione").html("");
});
