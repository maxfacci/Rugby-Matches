/* =======================
   COSTANTI STATO
======================= */
const STATUS = {
    PRE: "---",
    FIRST: "PRIMO TEMPO",
    BREAK: "INTERVALLO",
    SECOND: "SECONDO TEMPO",
    END: "FINITA"
};

/* =======================
   VARIABILI
======================= */
let matchStatus = STATUS.PRE;
let elapsedSeconds = 0;
let timerInterval = null;
let homeScore = 0;
let awayScore = 0;
let homeTeam = "";
let awayTeam = "";

/* =======================
   DOM
======================= */
const startBtn = document.getElementById("start-btn");
const endFirstHalfBtn = document.getElementById("end-first-half-btn");
const secondHalfBtn = document.getElementById("second-half-btn");
const endMatchBtn = document.getElementById("end-match-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");

const timeDisplay = document.getElementById("time-display");
const homeNameEl = document.getElementById("home-name");
const awayNameEl = document.getElementById("away-name");
const homeScoreEl = document.getElementById("home-score");
const awayScoreEl = document.getElementById("away-score");

/* =======================
   UI
======================= */
function updateButtons() {
    startBtn.disabled = matchStatus !== STATUS.PRE;
    endFirstHalfBtn.disabled = matchStatus !== STATUS.FIRST;
    secondHalfBtn.disabled = matchStatus !== STATUS.BREAK;
    endMatchBtn.disabled = matchStatus === STATUS.END;
}

function updateTimerDisplay() {
    const m = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
    const s = String(elapsedSeconds % 60).padStart(2, "0");
    timeDisplay.textContent = `${m}:${s}`;
}

function highlightRangers(name) {
    return name.replace(/RANGERS/gi, m => `<span class="rangers">${m}</span>`);
}

/* =======================
   TIMER
======================= */
function startTimer() {
    if (timerInterval || matchStatus === STATUS.END) return;

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

/* =======================
   PUNTEGGIO
======================= */
function updateScore(team, pts) {
    if (matchStatus === STATUS.END) return;

    if (team === "home") homeScore += pts;
    else awayScore += pts;

    homeScoreEl.textContent = homeScore;
    awayScoreEl.textContent = awayScore;

    saveMatch();
}

/* =======================
   FIREBASE
======================= */
firebase.database().ref(`config/${MATCH_ID}`).once("value").then(snap => {
    const cfg = snap.val();
    if (!cfg) return;

    homeTeam = cfg.homeTeam.toUpperCase();
    awayTeam = cfg.awayTeam.toUpperCase();

    homeNameEl.innerHTML = highlightRangers(homeTeam);
    awayNameEl.innerHTML = highlightRangers(awayTeam);
});

firebase.database().ref(MATCH_ID).on("value", snap => {
    const d = snap.val();
    if (!d) return;

    homeScore = d.homeScore || 0;
    awayScore = d.awayScore || 0;
    elapsedSeconds = d.timer || 0;
    matchStatus = d.status || STATUS.PRE;

    homeScoreEl.textContent = homeScore;
    awayScoreEl.textContent = awayScore;

    updateTimerDisplay();
    updateButtons();
});

/* =======================
   STATO PARTITA
======================= */
startBtn.onclick = () => {
    matchStatus = STATUS.FIRST;
    elapsedSeconds = 0;
    startTimer();
    saveMatch();
};

endFirstHalfBtn.onclick = () => {
    pauseTimer();
    matchStatus = STATUS.BREAK;
    saveMatch();
};

secondHalfBtn.onclick = () => {
    elapsedSeconds = 35 * 60;
    matchStatus = STATUS.SECOND;
    startTimer();
    saveMatch();
};

endMatchBtn.onclick = () => {
    pauseTimer();
    matchStatus = STATUS.END;
    saveMatch();
};

pauseBtn.onclick = pauseTimer;

resetBtn.onclick = () => {
    if (!confirm("Reset totale partita?")) return;

    pauseTimer();
    elapsedSeconds = 0;
    homeScore = 0;
    awayScore = 0;
    matchStatus = STATUS.PRE;

    homeScoreEl.textContent = "0";
    awayScoreEl.textContent = "0";
    updateTimerDisplay();
    saveMatch();
};

/* =======================
   SALVATAGGIO
======================= */
function saveMatch() {
    firebase.database().ref(MATCH_ID).update({
        homeScore,
        awayScore,
        status: matchStatus,
        timer: elapsedSeconds,
        updatedAt: Date.now()
    });
}

/* =======================
   BOTTONI PUNTEGGIO
======================= */
document.querySelectorAll("[data-team]").forEach(btn => {
    btn.onclick = () => {
        const team = btn.dataset.team;
        const pts = parseInt(btn.dataset.points, 10);

        if (matchStatus === STATUS.END) return;

        if (btn.classList.contains("yellow")) {
            const p = prompt("Numero giocatore (giallo)");
            if (!p) return;
            return;
        }

        if (pts > 0) {
            const p = prompt("Numero giocatore");
            if (!p) return;
        }

        updateScore(team, pts);
    };
});
