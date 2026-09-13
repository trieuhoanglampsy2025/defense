/* =====================================================
   DEFENSE
   STORAGE.JS

   Quản lý dữ liệu nhật ký bằng localStorage
   ===================================================== */


/* ================= STORAGE KEY ================= */

const DEFENSE_JOURNAL_KEY = "defense_journal_entries";


/* ================= GET ENTRIES ================= */

function getJournalEntries() {

    try {

        const storedData =
            localStorage.getItem(DEFENSE_JOURNAL_KEY);

        if (!storedData) {
            return [];
        }

        const entries = JSON.parse(storedData);

        if (!Array.isArray(entries)) {
            return [];
        }

        return entries;

    } catch (error) {

        console.error(
            "Không thể đọc dữ liệu nhật ký:",
            error
        );

        return [];
    }
}


/* ================= SAVE ALL ENTRIES ================= */

function saveJournalEntries(entries) {

    try {

        localStorage.setItem(
            DEFENSE_JOURNAL_KEY,
            JSON.stringify(entries)
        );

        return true;

    } catch (error) {

        console.error(
            "Không thể lưu dữ liệu nhật ký:",
            error
        );

        return false;
    }
}


/* ================= ADD ENTRY ================= */

function addJournalEntry(entry) {

    const entries = getJournalEntries();

    entries.unshift(entry);

    return saveJournalEntries(entries);
}


/* ================= UPDATE ENTRY ================= */

function updateJournalEntry(id, updatedEntry) {

    const entries = getJournalEntries();

    const index = entries.findIndex(
        entry => entry.id === id
    );

    if (index === -1) {
        return false;
    }

    entries[index] = {
        ...entries[index],
        ...updatedEntry,
        updatedAt: new Date().toISOString()
    };

    return saveJournalEntries(entries);
}


/* ================= DELETE ENTRY ================= */

function deleteJournalEntry(id) {

    const entries = getJournalEntries();

    const filteredEntries = entries.filter(
        entry => entry.id !== id
    );

    return saveJournalEntries(filteredEntries);
}


/* ================= GET ONE ENTRY ================= */

function getJournalEntry(id) {

    const entries = getJournalEntries();

    return entries.find(
        entry => entry.id === id
    ) || null;
}


/* ================= CLEAR ALL ================= */

function clearAllJournalEntries() {

    try {

        localStorage.removeItem(
            DEFENSE_JOURNAL_KEY
        );

        return true;

    } catch (error) {

        console.error(
            "Không thể xóa nhật ký:",
            error
        );

        return false;
    }
}