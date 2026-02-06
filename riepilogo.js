function render(matchId, el) {
    const data = localStorage.getItem(matchId);
    if (!data) return;

    const m = JSON.parse(data);
    el.className = "match-box " + (m.status === "FINITA" ? "finished" : "live");

    el.innerHTML = `
        <div class="teams">
            <span>${m.homeTeam}</span>
            <span>${m.homeScore} – ${m.awayScore}</span>
            <span>${m.awayTeam}</span>
        </div>
        <div class="status">${m.status}</div>
    `;
}

function update() {
    render("match_1", document.getElementById("match1"));
    render("match_2", document.getElementById("match2"));
}

update();
window.addEventListener("storage", update);

function listen(matchId, elementId) {
    firebase.database().ref(matchId).on("value", snapshot => {
        const m = snapshot.val();
        if (!m) return;

        const el = document.getElementById(elementId);
        el.className = "match-box " + (m.status === "FINITA" ? "finished" : "live");

        el.innerHTML = `
            <div class="teams">
                <span>${m.homeTeam}</span>
                <span>${m.homeScore} – ${m.awayScore}</span>
                <span>${m.awayTeam}</span>
            </div>
            <div class="status">${m.status}</div>
        `;
    });
}

function highlightRangers(name) {
    return name.replace(/RANGERS/gi, match =>
        `<span class="rangers">${match}</span>`
    );
}

el.innerHTML = `
    <div class="teams">
        <span>${highlightRangers(m.homeTeam)}</span>
        <span>${m.homeScore} – ${m.awayScore}</span>
        <span>${highlightRangers(m.awayTeam)}</span>
    </div>
    <div class="status">${m.status}</div>
`;


listen("match_1", "match1");
listen("match_2", "match2");
