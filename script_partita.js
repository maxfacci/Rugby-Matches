/* 1️⃣ Costanti di stato */
const STATUS = {
    PRE: "---",
    FIRST: "PRIMO TEMPO",
    BREAK: "INTERVALLO",
    SECOND: "SECONDO TEMPO",
    END: "FINITA"
};

/* 2️⃣ Variabili globali */
let matchStatus = STATUS.PRE;
let elapsedSeconds = 0;
let timerInterval = null;
let homeScore = 0;
let awayScore = 0;

let homeTeam = "";
let awayTeam = "";

/* 3️⃣ Riferimenti DOM (PRIMA delle funzioni) */
const startBtn = document.getElementById("start-btn");
const endFirstHalfBtn = document.getElementById("end-first-half-btn");
const secondHalfBtn = document.getElementById("second-half-btn");
const endMatchBtn = document.getElementById("end-match-btn");

const timeDisplay = document.getElementById("time-display");
const homeScoreEl = document.getElementById("home-score");
const awayScoreEl = document.getElementById("away-score");

/* 4️⃣ QUI INSERISCI updateButtons() */
function updateButtons() {
    startBtn.disabled = matchStatus !== STATUS.PRE;
    endFirstHalfBtn.disabled = matchStatus !== STATUS.FIRST;
    secondHalfBtn.disabled = matchStatus !== STATUS.BREAK;
    endMatchBtn.disabled = matchStatus === STATUS.END;
}

/* 5️⃣ Altre funzioni (timer, saveMatch, ecc.) */
function highlightRangers(name) {
    return name.replace(/RANGERS/gi, m => `<span class="rangers">${m}</span>`);
}

/* 🔹 TIMER */
function updateTimerDisplay() {
    const m = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
    const s = String(elapsedSeconds % 60).padStart(2, "0");
    timeDisplay.textContent = `${m}:${s}`;
}

function startTimer() {
    if (timerInterval || matchFinished) return;
    timerInterval = setInterval(() => {
        elapsedSeconds++;
        updateTimerDisplay();
        saveMatch();
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function updateScore(team, pts) {
    if (matchFinished) return;
    if (team === "home") homeScore += pts;
    else awayScore += pts;

    homeScoreEl.textContent = homeScore;
    awayScoreEl.textContent = awayScore;
    saveMatch();
}

/* 6️⃣ Listener Firebase */
/* 🔹 LETTURA CONFIG (NOMI SQUADRE) */
firebase.database().ref(`config/${MATCH_ID}`).once("value").then(snap => {
    const cfg = snap.val();
    if (!cfg) {
        alert("Configurazione squadre mancante su Firebase");
        return;
    }

    homeTeam = cfg.homeTeam.toUpperCase();
    awayTeam = cfg.awayTeam.toUpperCase();

    document.getElementById("home-name").innerHTML = highlightRangers(homeTeam);
    document.getElementById("away-name").innerHTML = highlightRangers(awayTeam);
});

/* 🔹 LETTURA STATO PARTITA */
firebase.database().ref(MATCH_ID).once("value").then(snap => {
    const d = snap.val();
    if (!d) return;

    homeScore = d.homeScore || 0;
    awayScore = d.awayScore || 0;
    
    matchStatus = d.status || STATUS.PRE;

    updateUI()
});

/* 7️⃣ Listener pulsanti STATO PARTITA */

/* INIZIO */
startBtn.onclick = () => {
    if (matchStatus !== STATUS.PRE) return;

    matchStatus = STATUS.FIRST;
    startTimer(0);
    saveMatch();
};

/* FINE PRIMO TEMPO */
endFirstHalfBtn.onclick = () => {
    if (matchStatus !== STATUS.FIRST) return;

    pauseTimer();
    matchStatus = STATUS.BREAK;
    saveMatch();
};

/* SECONDO TEMPO */
secondHalfBtn.onclick = () => {
    if (matchStatus !== STATUS.BREAK) return;

    matchStatus = STATUS.SECOND;
    startTimer(35 * 60);
    saveMatch();
};

/* FINE PARTITA */
endMatchBtn.onclick = () => {
    if (matchStatus === STATUS.END) return;

    pauseTimer();
    matchStatus = STATUS.END;
    saveMatch();
};

/* 🔹 SALVATAGGIO */
function saveMatch() {
    firebase.database().ref(MATCH_ID).update({
        homeScore,
        awayScore,
        status: matchStatus,
        timer: elapsedSeconds;
        updatedAt: Date.now()
    });
}

/* 🔹 PUNTEGGIO + EVENTI */
function logEvent(text) {
    const ul = document.getElementById("events-list");
    const li = document.createElement("li");
    li.textContent = `[${timeDisplay.textContent}] ${text}`;
    ul.appendChild(li);
}

/* 🔹 PULSANTI PUNTEGGIO */
document.querySelectorAll(".score-btn").forEach(btn => {
    btn.onclick = () => {
        if (matchFinished) return;

        const team = btn.dataset.team;
        const pts = parseInt(btn.dataset.points);

        if (btn.classList.contains("yellow")) {
            const p = prompt("Numero giocatore (giallo)");
            if (!p) return;
            logEvent(`GIALLO ${team === "home" ? homeTeam : awayTeam} #${p}`);
            return;
        }

        if (pts > 0) {
            const p = prompt("Numero giocatore");
            if (!p) return;
            updateScore(team, pts);
            logEvent(`${btn.textContent.toUpperCase()} ${team === "home" ? homeTeam : awayTeam} #${p} (${homeScore}-${awayScore})`);
        } else {
            updateScore(team, pts);
        }
    };
});

/* 🔹 ALTRI PULSANTI */
document.getElementById("start-timer").onclick = startTimer;
document.getElementById("pause-timer").onclick = pauseTimer;

document.getElementById("second-half").onclick = () => {
    elapsedSeconds = 35 * 60;
    updateTimerDisplay();
    startTimer();
};

document.getElementById("end-first-half").onclick = () => {
    pauseTimer();
    saveMatch();
};

document.getElementById("end-match").onclick = () => {
    pauseTimer();
    saveMatch();
};

document.getElementById("reset-timer").onclick = () => {
    if (!confirm("Reset totale partita?")) return;
    elapsedSeconds = 0;
    matchStatus = STATUS.PRE;
    homeScore = awayScore = 0;
    homeScoreEl.textContent = awayScoreEl.textContent = "0";
    saveMatch();
};
