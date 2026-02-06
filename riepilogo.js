function highlightRangers(name) {
    return name.replace(/RANGERS/gi, m => `<span class="rangers">${m}</span>`);
}

function listen(matchId, elId) {
    firebase.database().ref(matchId).on("value", snap => {
        const d = snap.val();
        if (!d) return;

        const el = document.getElementById(elId);
        el.className = "match-box " + (d.finished ? "finished" : "live");

        el.innerHTML = `
            <div class="teams">
                <span>${highlightRangers(d.homeTeam)}</span>
                <strong>${d.homeScore} – ${d.awayScore}</strong>
                <span>${highlightRangers(d.awayTeam)}</span>
            </div>
            <div class="status">${d.status}</div>
        `;
    });
}

listen("match_1", "match1");
listen("match_2", "match2");
