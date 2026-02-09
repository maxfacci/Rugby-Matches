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

firebase.database().ref("match_1").on("value", () => {
    render("match_1", "match1");
});

firebase.database().ref("match_2").on("value", () => {
    render("match_2", "match2");
});
