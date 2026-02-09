setSummaryTitle();

function highlightRangers(name) {
    return name.replace(/RANGERS/gi, m => `<span class="rangers">${m}</span>`);
}

function render(matchId, elId) {
    Promise.all([
        firebase.database().ref(`config/${matchId}`).once("value"),
        firebase.database().ref(matchId).once("value")
    ]).then(([cfgSnap, matchSnap]) => {

        const cfg = cfgSnap.val();
        const d = matchSnap.val();
        if (!cfg || !d) return;

        const el = document.getElementById(elId);
        el.className = "match-box " + (d.finished ? "finished" : "live");

        el.innerHTML = `
            <div class="teams">
                <span>${highlightRangers(cfg.homeTeam)}</span>
                <strong>${d.homeScore} – ${d.awayScore}</strong>
                <span>${highlightRangers(cfg.awayTeam)}</span>
            </div>
            <div class="status">${d.status}</div>
        `;
    });
}

function getNextSunday() {
    const today = new Date();
    const day = today.getDay(); // 0 = domenica
    const daysToAdd = day === 0 ? 0 : (7 - day);
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysToAdd);
    return nextSunday;
}

function setSummaryTitle() {
    const d = getNextSunday();
    const gg = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");

    document.getElementById("summary-title").textContent =
        `Riepilogo ${gg}/${mm}`;
}

firebase.database().ref("match_1").on("value", () => {
    render("match_1", "match1");
});

firebase.database().ref("match_2").on("value", () => {
    render("match_2", "match2");
});
