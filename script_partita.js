let elapsedSeconds = 0;
let timerInterval = null;

let homeScore = 0;
let awayScore = 0;
let firstHalfEnded = false;
let matchFinished = false;

let homeTeam = "";
let awayTeam = "";

const timeDisplay = document.getElementById("time-display");
const homeScoreEl = document.getElementById("home-score");
const awayScoreEl = document.getElementById("away-score");

function highlightRangers(name) {
    return name.replace(/RANGERS/gi, m => `<span class="rangers">${m}</span>`);
}

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
    firstHalfEnded = d.firstHalfEnded || false;
    matchFinished = d.finished || false;

    homeScoreEl.textContent = homeScore;
    awayScoreEl.textContent = awayScore;
});

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

/* 🔹 STATO PARTITA */
function getStatus() {
    if (matchFinished) return "FINITA";
    if (firstHalfEnded) return "INTERVALLO";
    if (elapsedSeconds < 35 * 60) return "PRIMO TEMPO";
    return "SECONDO TEMPO";
}

/* 🔹 SALVATAGGIO */
function saveMatch() {
    firebase.database().ref(MATCH_ID).set({
        homeScore,
        awayScore,
        status: getStatus(),
        firstHalfEnded,
        finished: matchFinished,
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

function updateScore(team, pts) {
    if (matchFinished) return;
    if (team === "home") homeScore += pts;
    else awayScore += pts;

    homeScoreEl.textContent = homeScore;
    awayScoreEl.textContent = awayScore;
    saveMatch();
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
    firstHalfEnded = true;
    updateTimerDisplay();
    startTimer();
};

document.getElementById("end-first-half").onclick = () => {
    firstHalfEnded = true;
    pauseTimer();
    saveMatch();
};

document.getElementById("end-match").onclick = () => {
    matchFinished = true;
    pauseTimer();
    saveMatch();
};

document.getElementById("reset-timer").onclick = () => {
    if (!confirm("Reset totale partita?")) return;
    elapsedSeconds = 0;
    homeScore = awayScore = 0;
    firstHalfEnded = matchFinished = false;
    homeScoreEl.textContent = awayScoreEl.textContent = "0";
    saveMatch();
};
