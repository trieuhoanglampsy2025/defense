/* =====================================================
   DEFENSE
   JOURNAL.JS

   Xử lý giao diện và chức năng nhật ký phản tư
   ===================================================== */


/* ================= DOM READY ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeJournal();

    }
);


/* ================= INITIALIZE ================= */

function initializeJournal() {

    const form =
        document.getElementById("journal-form");

    const clearButton =
        document.getElementById("clear-form");

    if (form) {

        form.addEventListener(
            "submit",
            handleJournalSubmit
        );

    }

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearJournalForm
        );

    }

    renderJournalEntries();

}


/* ================= SUBMIT ================= */

function handleJournalSubmit(event) {

    event.preventDefault();


    const title =
        document.getElementById("journal-title")
            .value
            .trim();

    const situation =
        document.getElementById("situation")
            .value
            .trim();

    const experience =
        document.getElementById("experience")
            .value
            .trim();

    const response =
        document.getElementById("response")
            .value
            .trim();

    const functionText =
        document.getElementById("function")
            .value
            .trim();

    const consequence =
        document.getElementById("consequence")
            .value
            .trim();

    const flexibility =
        document.getElementById("flexibility")
            .value
            .trim();


    /* ================= VALIDATION ================= */

    if (!situation) {

        alert(
            "Hãy viết một vài dòng về tình huống trước khi lưu."
        );

        document
            .getElementById("situation")
            .focus();

        return;
    }


    /* ================= ENTRY ================= */

    const entry = {

        id:
            generateEntryId(),

        title:
            title ||
            generateDefaultTitle(),

        situation:
            situation,

        experience:
            experience,

        response:
            response,

        function:
            functionText,

        consequence:
            consequence,

        flexibility:
            flexibility,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };


    /* ================= SAVE ================= */

    const saved =
        addJournalEntry(entry);


    if (!saved) {

        alert(
            "Không thể lưu nhật ký. Hãy kiểm tra cài đặt trình duyệt."
        );

        return;
    }


    /* ================= SUCCESS ================= */

    clearJournalForm();

    renderJournalEntries();

    showSaveMessage();

}


/* ================= GENERATE ID ================= */

function generateEntryId() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


/* ================= DEFAULT TITLE ================= */

function generateDefaultTitle() {

    const now = new Date();

    return (
        "Nhật ký " +
        now.toLocaleDateString(
            "vi-VN"
        )
    );

}


/* ================= CLEAR FORM ================= */

function clearJournalForm() {

    const form =
        document.getElementById(
            "journal-form"
        );

    if (!form) {
        return;
    }

    form.reset();

}


/* ================= SAVE MESSAGE ================= */

function showSaveMessage() {

    const message =
        document.createElement("div");

    message.className =
        "journal-save-message";

    message.textContent =
        "✓ Nhật ký đã được lưu trên thiết bị của bạn.";

    document.body.appendChild(message);


    setTimeout(
        () => {

            message.classList.add(
                "show"
            );

        },
        10
    );


    setTimeout(
        () => {

            message.classList.remove(
                "show"
            );

            setTimeout(
                () => {
                    message.remove();
                },
                300
            );

        },
        2500
    );

}


/* ================= RENDER ================= */

function renderJournalEntries() {

    const list =
        document.getElementById(
            "journal-list"
        );

    const emptyState =
        document.getElementById(
            "empty-journal"
        );

    const count =
        document.getElementById(
            "journal-count"
        );


    if (!list) {
        return;
    }


    const entries =
        getJournalEntries();


    /* ================= COUNT ================= */

    if (count) {

        if (entries.length === 0) {

            count.textContent =
                "Chưa có nhật ký nào.";

        } else if (entries.length === 1) {

            count.textContent =
                "1 nhật ký đã được lưu.";

        } else {

            count.textContent =
                `${entries.length} nhật ký đã được lưu.`;

        }

    }


    /* ================= EMPTY ================= */

    if (entries.length === 0) {

        list.innerHTML = "";

        if (emptyState) {
            emptyState.style.display =
                "block";
        }

        return;
    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    /* ================= LIST ================= */

    list.innerHTML = "";


    entries.forEach(
        entry => {

            const card =
                createJournalCard(entry);

            list.appendChild(card);

        }
    );

}


/* ================= CREATE CARD ================= */

function createJournalCard(entry) {

    const card =
        document.createElement("article");

    card.className =
        "journal-entry-card";


    const formattedDate =
        formatDate(entry.createdAt);


    card.innerHTML = `

        <div class="journal-entry-top">

            <div>

                <p class="journal-entry-date">
                    ${escapeHTML(formattedDate)}
                </p>

                <h3>
                    ${escapeHTML(entry.title)}
                </h3>

            </div>

            <button
                type="button"
                class="delete-journal-button"
                data-id="${entry.id}"
                aria-label="Xóa nhật ký"
            >
                ×
            </button>

        </div>


        <div class="journal-entry-preview">

            <p>
                ${escapeHTML(
                    createPreview(entry.situation)
                )}
            </p>

        </div>


        <div class="journal-entry-actions">

            <button
                type="button"
                class="view-journal-button"
                data-id="${entry.id}"
            >
                Xem lại →
            </button>

        </div>

    `;


    /* ================= VIEW ================= */

    const viewButton =
        card.querySelector(
            ".view-journal-button"
        );

    if (viewButton) {

        viewButton.addEventListener(
            "click",
            () => {

                openJournalEntry(
                    entry.id
                );

            }
        );

    }


    /* ================= DELETE ================= */

    const deleteButton =
        card.querySelector(
            ".delete-journal-button"
        );

    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            () => {

                confirmDeleteJournal(
                    entry.id
                );

            }
        );

    }


    return card;

}


/* ================= OPEN ENTRY ================= */

function openJournalEntry(id) {

    const entry =
        getJournalEntry(id);


    if (!entry) {

        alert(
            "Không tìm thấy nhật ký."
        );

        return;
    }


    const modal =
        document.createElement("div");

    modal.className =
        "journal-modal";


    modal.innerHTML = `

        <div class="journal-modal-overlay"></div>


        <div
            class="journal-modal-content"
            role="dialog"
            aria-modal="true"
        >

            <button
                type="button"
                class="journal-modal-close"
                aria-label="Đóng"
            >
                ×
            </button>


            <p class="eyebrow">
                REFLECTION
            </p>


            <p class="journal-modal-date">
                ${escapeHTML(
                    formatDate(entry.createdAt)
                )}
            </p>


            <h2>
                ${escapeHTML(entry.title)}
            </h2>


            ${createReflectionSection(
                "01",
                "Tình huống",
                entry.situation
            )}


            ${createReflectionSection(
                "02",
                "Trải nghiệm",
                entry.experience
            )}


            ${createReflectionSection(
                "03",
                "Phản ứng",
                entry.response
            )}


            ${createReflectionSection(
                "04",
                "Chức năng",
                entry.function
            )}


            ${createReflectionSection(
                "05",
                "Hệ quả",
                entry.consequence
            )}


            ${createReflectionSection(
                "06",
                "Linh hoạt",
                entry.flexibility
            )}


            <div class="journal-modal-footer">

                <button
                    type="button"
                    class="secondary-button modal-close-button"
                >
                    Đóng
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    /* ================= CLOSE ================= */

    const closeButtons =
        modal.querySelectorAll(
            ".journal-modal-close, .modal-close-button, .journal-modal-overlay"
        );


    closeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    modal.remove();

                }
            );

        }
    );


    /* ================= ESC ================= */

    function handleEscape(event) {

        if (
            event.key === "Escape"
        ) {

            modal.remove();

            document.removeEventListener(
                "keydown",
                handleEscape
            );

        }

    }


    document.addEventListener(
        "keydown",
        handleEscape
    );

}


/* ================= REFLECTION SECTION ================= */

function createReflectionSection(
    number,
    title,
    text
) {

    if (!text) {
        text = "Chưa ghi lại.";
    }


    return `

        <div class="modal-reflection-section">

            <div class="modal-reflection-number">
                ${number}
            </div>

            <div>

                <h3>
                    ${title}
                </h3>

                <p>
                    ${escapeHTML(text)}
                </p>

            </div>

        </div>

    `;

}


/* ================= DELETE CONFIRMATION ================= */

function confirmDeleteJournal(id) {

    const entry =
        getJournalEntry(id);


    if (!entry) {
        return;
    }


    const confirmed =
        confirm(
            `Bạn có chắc muốn xóa nhật ký "${entry.title}" không?\n\nHành động này không thể hoàn tác.`
        );


    if (!confirmed) {
        return;
    }


    const deleted =
        deleteJournalEntry(id);


    if (!deleted) {

        alert(
            "Không thể xóa nhật ký."
        );

        return;
    }


    renderJournalEntries();

}


/* ================= DATE ================= */

function formatDate(dateString) {

    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Không rõ ngày";

    }


    return date.toLocaleDateString(
        "vi-VN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* ================= PREVIEW ================= */

function createPreview(text) {

    if (!text) {

        return "Chưa có nội dung.";

    }


    const maxLength = 180;


    if (
        text.length <= maxLength
    ) {

        return text;

    }


    return (
        text.substring(
            0,
            maxLength
        ) +
        "..."
    );

}


/* ================= SECURITY ================= */

/*
   Nội dung người dùng nhập vào được escape trước khi
   đưa vào innerHTML để tránh HTML injection.
*/

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}