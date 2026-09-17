document.addEventListener("DOMContentLoaded", loadMechanismList);

async function loadMechanismList() {
    try {
        const response = await fetch("data/mechanisms.json");
        if (!response.ok) throw new Error("Không thể tải mechanisms.json");
        const data = await response.json();

        const groups = {
            "Mature Defense Style": document.getElementById("mature-mechanisms"),
            "Neurotic Defense Style": document.getElementById("neurotic-mechanisms"),
            "Immature Defense Style": document.getElementById("immature-mechanisms")
        };

        const entries = Object.entries(data).sort((a, b) => (a[1].rank ?? 999) - (b[1].rank ?? 999));

        entries.forEach(([id, mechanism]) => {
            const container = groups[mechanism.styleEn];
            if (!container) return;

            const card = document.createElement("a");
            card.className = "mechanism-card";
            card.href = `mechanism.html?id=${encodeURIComponent(id)}`;
            card.innerHTML = `
                <span class="mechanism-card-number">${String(mechanism.rank).padStart(2, "0")}</span>
                <div class="mechanism-card-content">
                    <h3>${escapeHTML(mechanism.vi)}</h3>
                    <p>${escapeHTML(mechanism.en)}</p>
                </div>
                <strong>→</strong>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
    }
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
