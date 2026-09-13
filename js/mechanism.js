document.addEventListener("DOMContentLoaded", () => {
    loadMechanism();
});


/* =========================================================
   LOAD MECHANISM
========================================================= */

async function loadMechanism() {

    try {

        /*
         * Get mechanism ID from URL
         *
         * Example:
         * mechanism.html?id=anticipation
         */

        const params = new URLSearchParams(
            window.location.search
        );

        const mechanismId = params.get("id");


        /* -----------------------------------------
           Check ID
        ----------------------------------------- */

        if (!mechanismId) {

            showError(
                "Không tìm thấy cơ chế phòng vệ."
            );

            return;
        }


        /* -----------------------------------------
           Load JSON
        ----------------------------------------- */

        const response = await fetch(
            "data/mechanisms.json"
        );


        if (!response.ok) {

            throw new Error(
                "Không thể tải mechanisms.json"
            );

        }


        const data = await response.json();


        /* -----------------------------------------
           Find mechanism
        ----------------------------------------- */

        const mechanism = data[mechanismId];


        if (!mechanism) {

            showError(
                "Không tìm thấy cơ chế phòng vệ này."
            );

            return;
        }


        /* -----------------------------------------
           Render
        ----------------------------------------- */

        renderMechanism(
            mechanismId,
            mechanism
        );

    }

    catch (error) {

        console.error(
            "Mechanism loading error:",
            error
        );

        showError(
            "Không thể tải dữ liệu cơ chế phòng vệ."
        );

    }

}


/* =========================================================
   RENDER MECHANISM
========================================================= */

function renderMechanism(
    mechanismId,
    mechanism
) {

    /* -----------------------------------------
       Basic information
    ----------------------------------------- */

    setText(
        "mechanism-name",
        mechanism.vi || "Cơ chế phòng vệ"
    );


    setText(
        "mechanism-name-en",
        mechanism.en || ""
    );


    setText(
        "mechanism-style",
        formatStyle(
            mechanism.styleEn
        )
    );


    /* -----------------------------------------
       Intro
    ----------------------------------------- */

    setText(
        "mechanism-intro",
        getIntro(mechanism)
    );


    /* -----------------------------------------
       Definition
    ----------------------------------------- */

    setText(
        "mechanism-definition",
        getDefinition(mechanism)
    );


    /* -----------------------------------------
       Example
    ----------------------------------------- */

    setText(
        "mechanism-example",
        getExample(mechanism)
    );


    /* -----------------------------------------
       Research data
    ----------------------------------------- */

    renderResearchData(
        mechanism
    );


    /* -----------------------------------------
       Reflection questions
    ----------------------------------------- */

    renderReflection(
        mechanism
    );


    /* -----------------------------------------
       Flexibility
    ----------------------------------------- */

    setText(
        "mechanism-flexibility",
        getFlexibility(mechanism)
    );


    /* -----------------------------------------
       Journal link
    ----------------------------------------- */

    const journalLink =
        document.getElementById(
            "journal-link"
        );


    if (journalLink) {

        journalLink.href =
            `journal.html?mechanism=${encodeURIComponent(
                mechanismId
            )}`;

    }


    /* -----------------------------------------
       Page title
    ----------------------------------------- */

    document.title =
        `${mechanism.vi || "Cơ chế phòng vệ"} | DEFENSE`;

}


/* =========================================================
   STYLE
========================================================= */

function formatStyle(style) {

    if (!style) {

        return "Cơ chế phòng vệ";

    }


    if (
        style ===
        "Mature Defense Style"
    ) {

        return "PHONG CÁCH TRƯỞNG THÀNH";

    }


    if (
        style ===
        "Neurotic Defense Style"
    ) {

        return "PHONG CÁCH TÂM CĂN";

    }


    if (
        style ===
        "Immature Defense Style"
    ) {

        return "PHONG CÁCH CHƯA TRƯỞNG THÀNH";

    }


    return style;
}


/* =========================================================
   INTRO
========================================================= */

function getIntro(mechanism) {

    const name =
        mechanism.vi ||
        "cơ chế phòng vệ này";


    return (
        `${name} là một trong những cơ chế phòng vệ `
        +
        `được khảo sát trong nghiên cứu về các cơ chế `
        +
        `phòng vệ tâm lý ở sinh viên Trường Đại học Sài Gòn.`
    );

}


/* =========================================================
   DEFINITION
========================================================= */

function getDefinition(mechanism) {

    /*
     * If the JSON already contains a definition,
     * use it directly.
     */

    if (mechanism.definition) {

        return mechanism.definition;

    }


    /*
     * If your JSON later contains "description",
     * this will also work.
     */

    if (mechanism.description) {

        return mechanism.description;

    }


    /*
     * Temporary fallback.
     *
     * We intentionally do NOT invent a scientific
     * definition for a mechanism if it is not present
     * in the JSON.
     */

    return (
        "Nội dung định nghĩa chi tiết của cơ chế này "
        +
        "sẽ được bổ sung từ cơ sở lý luận của nghiên cứu."
    );

}


/* =========================================================
   EXAMPLE
========================================================= */

function getExample(mechanism) {

    if (mechanism.example) {

        return mechanism.example;

    }


    if (mechanism.studentExample) {

        return mechanism.studentExample;

    }


    return (
        "Hãy thử nghĩ về một tình huống học tập, "
        +
        "quan hệ hoặc áp lực cá nhân gần đây trong đó "
        +
        "bạn có một phản ứng khiến bản thân chú ý."
    );

}


/* =========================================================
   FLEXIBILITY
========================================================= */

function getFlexibility(mechanism) {

    if (mechanism.flexibility) {

        return mechanism.flexibility;

    }


    return (
        "Không có một cơ chế phòng vệ nào cần được "
        +
        "loại bỏ chỉ vì nó xuất hiện. Điều quan trọng "
        +
        "là nhận ra phản ứng của mình, xem xét nó đang "
        +
        "giúp mình thích nghi như thế nào và liệu còn "
        +
        "cách phản ứng linh hoạt nào khác hay không."
    );

}


/* =========================================================
   REFLECTION
========================================================= */

function renderReflection(
    mechanism
) {

    const question1 =
        document.getElementById(
            "reflection-question-1"
        );


    const question2 =
        document.getElementById(
            "reflection-question-2"
        );


    /*
     * Use questions from JSON if available.
     */

    if (
        Array.isArray(
            mechanism.reflectionQuestions
        )
    ) {

        if (
            mechanism.reflectionQuestions[0]
        ) {

            question1.textContent =
                mechanism.reflectionQuestions[0];

        }


        if (
            mechanism.reflectionQuestions[1]
        ) {

            question2.textContent =
                mechanism.reflectionQuestions[1];

        }


        return;

    }


    /*
     * Generic functional reflection.
     *
     * These are NOT measurement questions.
     */

    question1.textContent =
        "Khi một tình huống khiến bạn khó chịu hoặc "
        +
        "căng thẳng, bạn thường đã phản ứng như thế nào? "
        +
        "Điều gì xảy ra sau phản ứng đó?";


    question2.textContent =
        "Nhìn lại tình huống ấy, phản ứng đó có thể đã "
        +
        "giúp bạn bảo vệ điều gì hoặc tránh đối diện "
        +
        "với điều gì? Nếu tình huống tương tự xảy ra "
        +
        "lần nữa, bạn muốn thử một cách phản ứng nào khác?";

}


/* =========================================================
   RESEARCH DATA
========================================================= */

function renderResearchData(
    mechanism
) {

    const container =
        document.getElementById(
            "research-data"
        );


    if (!container) {

        return;

    }


    const hasMean =
        mechanism.mean !== undefined &&
        mechanism.mean !== null;


    const hasSD =
        mechanism.sd !== undefined &&
        mechanism.sd !== null;


    const hasRank =
        mechanism.rank !== undefined &&
        mechanism.rank !== null;


    /*
     * If no research statistics exist
     */

    if (
        !hasMean &&
        !hasSD &&
        !hasRank
    ) {

        container.innerHTML = `
            <div class="research-data-empty">
                <p>
                    Chưa có chỉ số thống kê riêng được
                    cung cấp cho cơ chế này.
                </p>
            </div>
        `;

        return;

    }


    container.innerHTML = "";


    /* -----------------------------------------
       Mean
    ----------------------------------------- */

    if (hasMean) {

        container.appendChild(
            createResearchCard(
                "Mean",
                Number(mechanism.mean)
                    .toFixed(2),
                "Giá trị trung bình"
            )
        );

    }


    /* -----------------------------------------
       SD
    ----------------------------------------- */

    if (hasSD) {

        container.appendChild(
            createResearchCard(
                "SD",
                Number(mechanism.sd)
                    .toFixed(2),
                "Độ lệch chuẩn"
            )
        );

    }


    /* -----------------------------------------
       Rank
    ----------------------------------------- */

    if (hasRank) {

        container.appendChild(
            createResearchCard(
                "Rank",
                mechanism.rank,
                "Thứ hạng trong mẫu nghiên cứu"
            )
        );

    }

}


/* =========================================================
   CREATE RESEARCH CARD
========================================================= */

function createResearchCard(
    label,
    value,
    description
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "research-data-card";


    card.innerHTML = `
        <span class="research-data-label">
            ${label}
        </span>

        <strong class="research-data-value">
            ${value}
        </strong>

        <span class="research-data-description">
            ${description}
        </span>
    `;


    return card;

}


/* =========================================================
   SET TEXT SAFELY
========================================================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        return;

    }


    element.textContent =
        value || "";

}


/* =========================================================
   ERROR PAGE
========================================================= */

function showError(
    message
) {

    const name =
        document.getElementById(
            "mechanism-name"
        );


    const intro =
        document.getElementById(
            "mechanism-intro"
        );


    if (name) {

        name.textContent =
            "Không thể tải cơ chế";

    }


    if (intro) {

        intro.textContent =
            message;

    }


    const definition =
        document.getElementById(
            "mechanism-definition"
        );


    if (definition) {

        definition.textContent =
            message;

    }

}