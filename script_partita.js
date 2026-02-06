let elapsedSeconds = 0;
let timerInterval = null;

let homeScore = 0;
let awayScore = 0;

let firstHalfEnded = false;
let matchFinished = false;

const timeDisplay = document.getElementById("time-display");
const homeScoreEl = document.getElementById("home-score");
const awayScoreEl = document.getElementById("away-score");

function highlightRangers(name) {
    return name.replace(/RANGERS/gi, m => `<span class="rangers">${m}</span>`);
}

// 🔹 NOMI SQUADRE
let homeTeam = (prompt("Nome squadra di casa") || "CASA").toUpperCase();
let awayTeam = (prompt("Nome squadra ospite") || "OSPITI").toUpperCase();

document.querySelectorAll(".team h3")[0].innerHTML = highlightRangers(homeTeam);
document.querySelectorAll(".team h3")[1].innerHTML = highlightRangers(awayTeam);

// 🔹 TIMER
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

function resetTimer() {
    if (!confirm("Reset totale?")) return;
    pauseTimer();
    elapsedSeconds = 0;
    homeScore = awayScore = 0;
    firstHalfEnded = matchFinished = false;
    homeScoreEl.textContent = awayScoreEl.textContent = "0";
    saveMatch();
}

// 🔹 STATO
function getStatus() {
    if (matchFinished) return "FINITA";
    if (firstHalfEnded) return "INTERVALLO";
    if (elapsedSeconds < 35 * 60) return "PRIMO TEMPO";
    return "SECONDO TEMPO";
}

// 🔹 PUNTEGGIO
function updateScore(team, pts) {
    if (matchFinished) return;
    if (team === "home") homeScore += pts;
    else awayScore += pts;

    homeScoreEl.textContent = homeScore;
    awayScoreEl.textContent = awayScore;
    saveMatch();
}

// 🔹 FIREBASE WRITE (UNICO!)
function saveMatch() {
    firebase.database().ref(MATCH_ID).set({
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        status: getStatus(),
        firstHalfEnded,
        finished: matchFinished,
        updatedAt: Date.now()
    });
}

// 🔹 FIREBASE READ (UNA SOLA VOLTA)
firebase.database().ref(MATCH_ID).once("value").then(snap => {
    const d = snap.val();
    if (!d) return;

    homeTeam = d.homeTeam;
    awayTeam = d.awayTeam;
    homeScore = d.homeScore;
    awayScore = d.awayScore;
    firstHalfEnded = d.firstHalfEnded;
    matchFinished = d.finished;

    homeScoreEl.textContent = homeScore;
    awayScoreEl.textContent = awayScore;

    document.querySelectorAll(".team h3")[0].innerHTML = highlightRangers(homeTeam);
    document.querySelectorAll(".team h3")[1].innerHTML = highlightRangers(awayTeam);
});

// 🔹 PULSANTI
document.getElementById("start-timer").onclick = startTimer;
document.getElementById("pause-timer").onclick = pauseTimer;
document.getElementById("reset-timer").onclick = resetTimer;

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