// =======================
// DATA RIEPILOGO
// =======================

function getNextSundayOrToday() {
    const today = new Date();
    const day = today.getDay(); // 0 = domenica
    const daysToAdd = day === 0 ? 0 : (7 - day);

    const d = new Date(today);
    d.setDate(today.getDate() + daysToAdd);
    return d;
}

function setSummaryTitle() {
    const d = getNextSundayOrToday();
    const gg = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");

    document.getElementById("summary-title").textContent =
        `Riepilogo ${gg}/${mm}`;
}

setSummaryTitle();

// =======================
// UTILITY
// =======================

function highlightRangers(name) {
    if (name.toUpperCase().includes("RANGERS")) {
        return `<span style="color:red">${name}</span>`;
    }
    return name;
}

// =======================
// RENDER PARTITA
// =======================

function renderMatch(matchId, elementId) {

    Promise.all([
        firebase.database().ref(`config/${matchId}`).once("value"),
        firebase.database().ref(matchId).once("value")
    ]).then(([cfgSnap, matchSnap]) => {

        const cfg = cfgSnap.val();
        const d = matchSnap.val();
        if (!cfg || !d) return;

        const el = document.getElementById(elementId);

        el.className = "match-box " + (d.status === "FINITA" ? "finished" : "live");

        el.innerHTML = `
            <div class="teams">
                <div>${highlightRangers(cfg.homeTeam)}</div>
                <strong>${d.homeScore} – ${d.awayScore}</strong>
                <div>${highlightRangers(cfg.awayTeam)}</div>
            </div>
            <div class="status">${d.status || "---"}</div>
        `;
    });
}

// =======================
// LISTENER REALTIME
// =======================

firebase.database().ref("match_1").on("value", () => {
    renderMatch("match_1", "match1");
});

firebase.database().ref("match_2").on("value", () => {
    renderMatch("match_2", "match2");
});
