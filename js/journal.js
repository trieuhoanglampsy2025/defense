/* =========================================================
   DEFENSE — JOURNAL
   5-step reflection · local storage · 4 PDF templates
========================================================= */

const reflectionFields = [
    "situation",
    "response",
    "experience",
    "function",
    "flexibility"
];

const PDF_TEMPLATE_STORAGE_KEY = "defense_selected_pdf_template";
const PDF_FONT_URLS = {
    regular: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Regular.ttf",
    bold: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Bold.ttf"
};

let selectedPDFTemplate = safeGetLocalStorage(PDF_TEMPLATE_STORAGE_KEY) || "reflection";
let pdfFontsPromise = null;

const PDF_QUESTIONS = [
    { number: "01", title: "Chuyện gì đã xảy ra?", field: "situation" },
    { number: "02", title: "Tôi đã phản ứng như thế nào?", field: "response" },
    { number: "03", title: "Điều gì đang diễn ra bên trong tôi?", field: "experience" },
    { number: "04", title: "Bây giờ tôi nhìn tình huống này như thế nào?", field: "function" },
    { number: "05", title: "Lần tới, tôi có thể làm gì khác?", field: "flexibility" }
];

document.addEventListener("DOMContentLoaded", initJournal);

function initJournal() {
    const form = document.getElementById("reflection-form");
    if (!form) return;

    loadSavedJournal();
    setupForm(form);
    setupClearButton();
    setupExportButton();
    setupImportButton();
    setupPDFButton();
    setupPDFTemplateSelector();
    setupAutoSave();
    restoreSelectedPDFTemplate();
    updatePageTitle();
}

function setupForm(form) {
    form.addEventListener("submit", event => {
        event.preventDefault();
        saveCurrentJournal();
    });
}

function collectJournalData() {
    const data = {
        version: 2,
        updatedAt: new Date().toISOString(),
        entries: {}
    };

    reflectionFields.forEach(field => {
        const element = document.getElementById(field);
        data.entries[field] = element ? element.value : "";
    });

    return data;
}

function saveCurrentJournal() {
    const saved = saveJournal(collectJournalData());
    const status = document.getElementById("reflection-status");

    if (saved) {
        if (status) status.textContent = "Đã lưu";
        showTemporaryStatus("Nhật ký đã được lưu trên thiết bị.");
    } else {
        if (status) status.textContent = "Không thể lưu";
        showTemporaryStatus("Không thể lưu nhật ký.");
    }
}

function loadSavedJournal() {
    const data = loadJournal();
    if (!data || !data.entries) return;

    reflectionFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && typeof data.entries[field] === "string") {
            element.value = data.entries[field];
        }
    });

    const status = document.getElementById("reflection-status");
    if (status) status.textContent = "Đã lưu trước đó";
}

function setupClearButton() {
    const button = document.getElementById("clear-journal");
    if (!button) return;

    button.addEventListener("click", () => {
        if (!confirm("Bạn có chắc muốn xóa toàn bộ nội dung nhật ký này?")) return;

        clearJournal();
        reflectionFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) element.value = "";
        });

        const status = document.getElementById("reflection-status");
        if (status) status.textContent = "Chưa lưu";
        showTemporaryStatus("Nhật ký đã được xóa.");
    });
}

function setupAutoSave() {
    reflectionFields.forEach(field => {
        const element = document.getElementById(field);
        if (!element) return;

        element.addEventListener("input", () => {
            const status = document.getElementById("reflection-status");
            if (status) status.textContent = "Có thay đổi chưa lưu";
        });
    });
}

function setupExportButton() {
    const button = document.getElementById("export-data");
    if (!button) return;

    button.addEventListener("click", () => {
        if (exportJournal()) {
            showTemporaryStatus("Đã xuất dữ liệu nhật ký.");
        } else {
            showTemporaryStatus("Chưa có nhật ký để xuất.");
        }
    });
}

function setupImportButton() {
    const input = document.getElementById("import-data");
    if (!input) return;

    input.addEventListener("change", async event => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const data = await importJournal(file);
            if (data && data.entries) {
                reflectionFields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element && typeof data.entries[field] === "string") {
                        element.value = data.entries[field];
                    }
                });
            }
            showTemporaryStatus("Đã nhập nhật ký thành công.");
        } catch (error) {
            console.error("Import journal error:", error);
            showTemporaryStatus("Tệp dữ liệu không hợp lệ.");
        } finally {
            input.value = "";
        }
    });
}

function showTemporaryStatus(message) {
    const status = document.getElementById("reflection-status");
    if (!status) return;

    status.textContent = message;
    clearTimeout(status._timeout);
    status._timeout = setTimeout(() => {
        status.textContent = loadJournal() ? "Đã lưu" : "Chưa lưu";
    }, 3000);
}

/* =========================================================
   PDF TEMPLATE SELECTOR
========================================================= */

function setupPDFTemplateSelector() {
    const cards = document.querySelectorAll(".pdf-template-card");
    if (!cards.length) return;

    cards.forEach(card => {
        card.addEventListener("click", () => {
            const template = card.dataset.template;
            if (!template) return;

            selectedPDFTemplate = template;
            safeSetLocalStorage(PDF_TEMPLATE_STORAGE_KEY, template);

            cards.forEach(item => {
                const selected = item === card;
                item.classList.toggle("selected", selected);
                item.setAttribute("aria-pressed", String(selected));
            });
        });
    });
}

function restoreSelectedPDFTemplate() {
    const cards = document.querySelectorAll(".pdf-template-card");
    if (!cards.length) return;

    const valid = ["minimal", "reflection", "calm", "personal"];
    if (!valid.includes(selectedPDFTemplate)) selectedPDFTemplate = "reflection";

    cards.forEach(card => {
        const selected = card.dataset.template === selectedPDFTemplate;
        card.classList.toggle("selected", selected);
        card.setAttribute("aria-pressed", String(selected));
    });
}

function setupPDFButton() {
    const button = document.getElementById("export-pdf");
    if (!button) return;
    button.addEventListener("click", () => exportJournalPDF(button));
}

/* =========================================================
   PDF FONT + EXPORT
========================================================= */

function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

async function loadPDFFonts(doc) {
    if (!pdfFontsPromise) {
        pdfFontsPromise = Promise.all([
            fetch(PDF_FONT_URLS.regular).then(r => {
                if (!r.ok) throw new Error("Không thể tải Noto Sans Regular.");
                return r.arrayBuffer();
            }),
            fetch(PDF_FONT_URLS.bold).then(r => {
                if (!r.ok) throw new Error("Không thể tải Noto Sans Bold.");
                return r.arrayBuffer();
            })
        ]);
    }

    const [regular, bold] = await pdfFontsPromise;
    doc.addFileToVFS("NotoSans-Regular.ttf", arrayBufferToBase64(regular));
    doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
    doc.addFileToVFS("NotoSans-Bold.ttf", arrayBufferToBase64(bold));
    doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
}

async function exportJournalPDF(button) {
    const data = collectJournalData();
    const hasContent = reflectionFields.some(field => String(data.entries[field] || "").trim());

    if (!hasContent) {
        showTemporaryStatus("Chưa có nội dung để xuất PDF.");
        return;
    }

    if (!window.jspdf) {
        showTemporaryStatus("Không tìm thấy thư viện PDF.");
        return;
    }

    const originalText = button ? button.textContent : "";
    if (button) {
        button.disabled = true;
        button.textContent = "Đang tạo PDF...";
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        await loadPDFFonts(doc);

        if (selectedPDFTemplate === "minimal") createMinimalPDF(doc, data);
        else if (selectedPDFTemplate === "calm") createCalmPDF(doc, data);
        else if (selectedPDFTemplate === "personal") createPersonalPDF(doc, data);
        else createReflectionPDF(doc, data);

        doc.save(`DEFENSE_Journal_${selectedPDFTemplate}_${formatFileDate(new Date())}.pdf`);
        showTemporaryStatus("Đã xuất nhật ký thành PDF.");
    } catch (error) {
        console.error("PDF export error:", error);
        showTemporaryStatus("Không thể tạo PDF. Hãy kiểm tra kết nối mạng và thử lại.");
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}

/* =========================================================
   PDF COMMON HELPERS
========================================================= */

function paintPDFPage(doc, color) {
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.setFillColor(...color);
    doc.rect(0, 0, w, h, "F");
}

function addPDFHeader(doc, label, accent, muted, margin = 22) {
    const w = doc.internal.pageSize.getWidth();
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...accent);
    doc.text("DEFENSE", margin, 17);
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(label, w - margin, 17, { align: "right" });
}

function addPDFFooter(doc, muted, line, margin = 22) {
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...line);
    doc.setLineWidth(0.3);
    doc.line(margin, h - 17, w - margin, h - 17);
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...muted);
    doc.text("DEFENSE · Hiểu cách tâm trí tự bảo vệ mình", margin, h - 10);
    const page = doc.internal.getCurrentPageInfo().pageNumber;
    const total = doc.internal.getNumberOfPages();
    doc.text(`${page} / ${total}`, w - margin, h - 10, { align: "right" });
}

function addFootersToAllPages(doc, muted, line, margin = 22) {
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        addPDFFooter(doc, muted, line, margin);
    }
}

function formatFileDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatVietnameseDate(date) {
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatLongVietnameseDate(date) {
    return date.toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
}

function drawQuestionBlock(doc, question, answer, options) {
    const { margin, pageWidth, pageHeight, y, dark, muted, accent, line, background, headerLabel } = options;
    let currentY = y;
    const lines = doc.splitTextToSize(answer, pageWidth - margin * 2 - 16);
    const boxHeight = Math.max(18, lines.length * 4.8 + 10);

    if (currentY + boxHeight + 25 > pageHeight) {
        doc.addPage();
        paintPDFPage(doc, background);
        addPDFHeader(doc, headerLabel, accent, muted, margin);
        currentY = 32;
    }

    doc.setFont("NotoSans", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...accent);
    doc.text(question.number, margin, currentY);

    doc.setFontSize(10.5);
    doc.setTextColor(...dark);
    doc.text(question.title, margin + 12, currentY);

    currentY += 7;
    doc.setFillColor(...(options.paper || background));
    doc.roundedRect(margin + 8, currentY, pageWidth - margin * 2 - 8, boxHeight, options.radius || 2, options.radius || 2, "F");

    doc.setFont("NotoSans", "normal");
    doc.setFontSize(8.3);
    doc.setTextColor(...muted);
    doc.text(lines, margin + 14, currentY + 8);

    currentY += boxHeight + 12;
    doc.setDrawColor(...line);
    doc.line(margin + 8, currentY, pageWidth - margin, currentY);
    return currentY + 11;
}

/* =========================================================
   TEMPLATE — REFLECTION
========================================================= */

function createReflectionPDF(doc, data) {
    const background = [246, 243, 235], paper = [252, 250, 245], dark = [42, 45, 40], muted = [102, 103, 96], accent = [91, 105, 87], line = [214, 210, 199];
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    const margin = 21;
    paintPDFPage(doc, background);
    addPDFHeader(doc, "REFLECTION · NHẬT KÝ", accent, muted, margin);

    let y = 42;
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(25);
    doc.setTextColor(...dark);
    doc.text("Năm lần nhìn lại.", margin, y);
    y += 9;
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(formatVietnameseDate(new Date()), margin, y);
    y += 15;

    doc.setFillColor(...paper);
    doc.roundedRect(margin, y, w - margin * 2, 29, 3, 3, "F");
    doc.setFont("NotoSans", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...accent);
    doc.text("MỘT KHOẢNG DỪNG", margin + 8, y + 9);
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(doc.splitTextToSize("Nhìn lại một trải nghiệm không phải để tìm một câu trả lời đúng, mà để nhận ra những gì đã diễn ra và mở thêm một lựa chọn.", w - margin * 2 - 16), margin + 8, y + 17);
    y += 40;

    PDF_QUESTIONS.forEach(q => {
        const answer = String(data.entries[q.field] || "").trim();
        if (answer) y = drawQuestionBlock(doc, q, answer, { margin, pageWidth: w, pageHeight: h, y, dark, muted, accent, line, background, paper, headerLabel: "REFLECTION · NHẬT KÝ", radius: 2.5 });
    });

    if (y > h - 42) {
        doc.addPage();
        paintPDFPage(doc, background);
        addPDFHeader(doc, "REFLECTION · NHẬT KÝ", accent, muted, margin);
        y = 34;
    }

    doc.setFont("NotoSans", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...dark);
    doc.text("Nhìn lại không phải để phán xét mình.", margin, y);
    y += 8;
    doc.setFont("NotoSans", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("Tôi không cần phải phản ứng hoàn hảo. Tôi chỉ muốn có thêm một lựa chọn.", margin, y);
    addFootersToAllPages(doc, muted, line, margin);
}

/* =========================================================
   TEMPLATE — MINIMAL
========================================================= */

function createMinimalPDF(doc, data) {
    const background = [250, 249, 245], dark = [35, 38, 34], muted = [105, 109, 103], accent = [91, 105, 87], line = [218, 218, 211];
    const w = doc.internal.pageSize.getWidth(), h = doc.internal.pageSize.getHeight(), margin = 25;
    paintPDFPage(doc, background);
    addPDFHeader(doc, "MINIMAL · NHẬT KÝ", accent, muted, margin);
    let y = 52;

    doc.setFont("NotoSans", "normal");
    doc.setFontSize(29);
    doc.setTextColor(...dark);
    doc.text("Một trải nghiệm.", margin, y);
    y += 13;
    doc.text("Năm lần nhìn lại.", margin, y);
    y += 16;
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(formatVietnameseDate(new Date()), margin, y);
    y += 15;
    doc.setDrawColor(...line);
    doc.line(margin, y, margin + 28, y);
    y += 12;
    doc.setFontSize(9);
    doc.text(doc.splitTextToSize("Một khoảng dừng để nhìn lại một trải nghiệm, cách tôi đã phản ứng và những lựa chọn tôi có thể có.", 120), margin, y);
    y += 28;

    PDF_QUESTIONS.forEach(q => {
        const answer = String(data.entries[q.field] || "").trim();
        if (!answer) return;
        if (y > h - 55) {
            doc.addPage(); paintPDFPage(doc, background); addPDFHeader(doc, "MINIMAL · NHẬT KÝ", accent, muted, margin); y = 32;
        }
        doc.setFont("NotoSans", "bold"); doc.setFontSize(7); doc.setTextColor(...accent); doc.text(q.number, margin, y);
        doc.setFontSize(11); doc.setTextColor(...dark); doc.text(q.title, margin + 12, y); y += 8;
        doc.setFont("NotoSans", "normal"); doc.setFontSize(8.5); doc.setTextColor(...muted);
        const lines = doc.splitTextToSize(answer, w - margin * 2 - 12);
        lines.forEach(lineText => {
            if (y > h - 25) { doc.addPage(); paintPDFPage(doc, background); addPDFHeader(doc, "MINIMAL · NHẬT KÝ", accent, muted, margin); y = 32; }
            doc.text(lineText, margin + 12, y); y += 4.8;
        });
        y += 9; doc.setDrawColor(...line); doc.line(margin + 12, y, w - margin, y); y += 11;
    });

    if (y > h - 40) { doc.addPage(); paintPDFPage(doc, background); addPDFHeader(doc, "MINIMAL · NHẬT KÝ", accent, muted, margin); y = 35; }
    doc.setFont("NotoSans", "bold"); doc.setFontSize(11); doc.setTextColor(...dark); doc.text("Nhìn lại không phải để phán xét mình.", margin, y); y += 8;
    doc.setFont("NotoSans", "normal"); doc.setFontSize(8); doc.setTextColor(...muted); doc.text("Tôi có thể nhận ra cách mình đã phản ứng và mở thêm một khả năng cho lần sau.", margin, y);
    addFootersToAllPages(doc, muted, line, margin);
}

/* =========================================================
   TEMPLATE — CALM
========================================================= */

function createCalmPDF(doc, data) {
    const background = [241, 244, 237], paper = [248, 249, 245], dark = [43, 49, 43], muted = [102, 111, 101], accent = [105, 121, 98], line = [205, 213, 202];
    const w = doc.internal.pageSize.getWidth(), h = doc.internal.pageSize.getHeight(), margin = 21;
    paintPDFPage(doc, background); addPDFHeader(doc, "CALM · NHẬT KÝ", accent, muted, margin);
    doc.setFillColor(...paper); doc.circle(w - 35, 38, 17, "F"); doc.circle(w - 27, 30, 5, "F");
    let y = 48;
    doc.setFont("NotoSans", "bold"); doc.setFontSize(24); doc.setTextColor(...dark); doc.text("Một khoảng dừng.", margin, y); y += 12;
    doc.setFont("NotoSans", "normal"); doc.setFontSize(17); doc.text("Để nhìn lại.", margin, y); y += 10;
    doc.setFontSize(8); doc.setTextColor(...muted); doc.text(formatVietnameseDate(new Date()), margin, y); y += 17;
    doc.setFillColor(...paper); doc.roundedRect(margin, y, w - margin * 2, 27, 5, 5, "F");
    doc.setFont("NotoSans", "bold"); doc.setFontSize(7); doc.setTextColor(...accent); doc.text("MỘT KHOẢNG DỪNG", margin + 9, y + 9);
    doc.setFont("NotoSans", "normal"); doc.setFontSize(8); doc.setTextColor(...muted); doc.text(doc.splitTextToSize("Tôi cho mình một chút thời gian để nhìn lại điều đã xảy ra.", w - margin * 2 - 18), margin + 9, y + 17); y += 39;

    PDF_QUESTIONS.forEach(q => {
        const answer = String(data.entries[q.field] || "").trim(); if (!answer) return;
        const lines = doc.splitTextToSize(answer, w - margin * 2 - 20);
        const boxHeight = Math.max(28, lines.length * 4.8 + 20);
        if (y + boxHeight + 20 > h) { doc.addPage(); paintPDFPage(doc, background); addPDFHeader(doc, "CALM · NHẬT KÝ", accent, muted, margin); y = 32; }
        doc.setFillColor(...paper); doc.roundedRect(margin, y, w - margin * 2, boxHeight, 5, 5, "F");
        doc.setFont("NotoSans", "bold"); doc.setFontSize(7); doc.setTextColor(...accent); doc.text(q.number, margin + 9, y + 9);
        doc.setFontSize(10); doc.setTextColor(...dark); doc.text(q.title, margin + 21, y + 9);
        doc.setFont("NotoSans", "normal"); doc.setFontSize(8); doc.setTextColor(...muted); doc.text(lines, margin + 12, y + 19);
        y += boxHeight + 9; doc.setFillColor(...accent); doc.circle(w / 2, y - 3, 1, "F"); y += 6;
    });
    if (y > h - 42) { doc.addPage(); paintPDFPage(doc, background); addPDFHeader(doc, "CALM · NHẬT KÝ", accent, muted, margin); y = 35; }
    doc.setFont("NotoSans", "bold"); doc.setFontSize(11); doc.setTextColor(...dark); doc.text("Bạn không cần hiểu tất cả ngay hôm nay.", margin, y); y += 8;
    doc.setFont("NotoSans", "normal"); doc.setFontSize(8); doc.setTextColor(...muted); doc.text("Chỉ cần cho mình một khoảng dừng để nhìn lại.", margin, y);
    addFootersToAllPages(doc, muted, line, margin);
}

/* =========================================================
   TEMPLATE — PERSONAL
========================================================= */

function createPersonalPDF(doc, data) {
    const background = [247, 244, 238], paper = [252, 250, 246], dark = [45, 47, 43], muted = [105, 105, 98], accent = [108, 119, 98], line = [214, 210, 201];
    const w = doc.internal.pageSize.getWidth(), h = doc.internal.pageSize.getHeight(), margin = 23;
    const titles = ["Điều gì đã xảy ra với tôi?", "Tôi đã phản ứng như thế nào?", "Tôi đã cảm thấy và nghĩ gì?", "Bây giờ tôi nhận ra điều gì?", "Lần tới, tôi muốn thử điều gì khác?"];
    paintPDFPage(doc, background); addPDFHeader(doc, "A NOTE TO MYSELF", accent, muted, margin);
    let y = 48;
    doc.setFont("NotoSans", "normal"); doc.setFontSize(27); doc.setTextColor(...dark); doc.text("Dear me,", margin, y); y += 10;
    doc.setFontSize(9); doc.setTextColor(...muted); doc.text("Một khoảng thời gian dành cho chính mình.", margin, y); y += 9; doc.text(formatLongVietnameseDate(new Date()), margin, y); y += 17;
    doc.setFillColor(...paper); doc.roundedRect(margin, y, w - margin * 2, 25, 3, 3, "F");
    doc.setFontSize(8.5); doc.text(doc.splitTextToSize("Có một điều đã xảy ra khiến tôi muốn dừng lại và nhìn lại mình.", w - margin * 2 - 16), margin + 8, y + 10); y += 37;

    PDF_QUESTIONS.forEach((q, index) => {
        const answer = String(data.entries[q.field] || "").trim(); if (!answer) return;
        const lines = doc.splitTextToSize(answer, w - margin * 2 - 10);
        const boxHeight = Math.max(23, lines.length * 5 + 14);
        if (y + boxHeight + 25 > h) { doc.addPage(); paintPDFPage(doc, background); addPDFHeader(doc, "A NOTE TO MYSELF", accent, muted, margin); y = 32; }
        doc.setFont("NotoSans", "bold"); doc.setFontSize(9); doc.setTextColor(...accent); doc.text(`${q.number} ·`, margin, y); doc.setTextColor(...dark); doc.text(titles[index], margin + 13, y); y += 8;
        doc.setFillColor(...paper); doc.roundedRect(margin, y, w - margin * 2, boxHeight, 3, 3, "F");
        doc.setFont("NotoSans", "normal"); doc.setFontSize(8.5); doc.setTextColor(...muted); doc.text(lines, margin + 7, y + 9); y += boxHeight + 12;
        doc.setDrawColor(...line); doc.line(margin, y, w - margin, y); y += 10;
    });
    if (y > h - 55) { doc.addPage(); paintPDFPage(doc, background); addPDFHeader(doc, "A NOTE TO MYSELF", accent, muted, margin); y = 35; }
    doc.setFont("NotoSans", "normal"); doc.setFontSize(10); doc.setTextColor(...dark); doc.text("Gửi tôi của những ngày sau,", margin, y); y += 8;
    doc.setFontSize(8); doc.setTextColor(...muted); doc.text(doc.splitTextToSize("Tôi không cần phải phản ứng hoàn hảo. Tôi chỉ muốn có thêm một lựa chọn.", w - margin * 2), margin, y); y += 17;
    doc.setFontSize(9); doc.setTextColor(...dark); doc.text("— Tôi", margin, y);
    addFootersToAllPages(doc, muted, line, margin);
}

/* =========================================================
   PAGE TITLE
========================================================= */

function updatePageTitle() {
    const params = new URLSearchParams(window.location.search);
    const mechanism = params.get("mechanism");
    if (mechanism) document.body.dataset.mechanism = mechanism;
}

function safeGetLocalStorage(key) {
    try { return localStorage.getItem(key); } catch { return null; }
}

function safeSetLocalStorage(key, value) {
    try { localStorage.setItem(key, value); } catch (error) { console.warn("Không thể lưu lựa chọn template:", error); }
}

window.DefenseJournal = {
    getSelectedTemplate: () => selectedPDFTemplate,
    save: saveCurrentJournal,
    exportPDF: exportJournalPDF
};
