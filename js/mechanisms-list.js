document.addEventListener("DOMContentLoaded", () => {
    loadMechanisms();
});

async function loadMechanisms() {
    try {
        const response = await fetch("data/mechanisms.json");

        if (!response.ok) {
            throw new Error("Không thể tải mechanisms.json");
        }

        const data = await response.json();

        // JSON của bạn đang dùng dạng object:
        // {
        //   "anticipation": {...},
        //   "suppression": {...},
        //   ...
        // }
        const mechanisms = Object.entries(data).map(([id, mechanism]) => ({
            id,
            ...mechanism
        }));

        // Sắp xếp theo BXH
        mechanisms.sort((a, b) => {
            return (a.rank || 999) - (b.rank || 999);
        });

        const matureContainer =
            document.getElementById("mature-mechanisms");

        const neuroticContainer =
            document.getElementById("neurotic-mechanisms");

        const immatureContainer =
            document.getElementById("immature-mechanisms");

        mechanisms.forEach((mechanism, index) => {

            const card = document.createElement("a");

            card.className = "mechanism-card";

            card.href = `mechanism.html?id=${mechanism.id}`;

            card.innerHTML = `
                <div class="mechanism-card-number">
                    ${String(index + 1).padStart(2, "0")}
                </div>

                <div class="mechanism-card-content">
                    <h3>${mechanism.vi}</h3>
                    <p>${mechanism.en}</p>
                </div>

                <div class="mechanism-card-arrow">
                    →
                </div>
            `;

            if (
                mechanism.styleEn ===
                "Mature Defense Style"
            ) {

                matureContainer?.appendChild(card);

            } else if (
                mechanism.styleEn ===
                "Neurotic Defense Style"
            ) {

                neuroticContainer?.appendChild(card);

            } else if (
                mechanism.styleEn ===
                "Immature Defense Style"
            ) {

                immatureContainer?.appendChild(card);

            } else {

                console.warn(
                    "Không xác định được phong cách:",
                    mechanism
                );

            }
        });

    } catch (error) {

        console.error(error);

        document.querySelectorAll(
            ".mechanism-list-cards"
        ).forEach(container => {

            container.innerHTML = `
                <p class="error-message">
                    Không thể tải dữ liệu cơ chế phòng vệ.
                </p>
            `;

        });
    }
}