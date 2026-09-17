/* =========================================================
   DEFENSE — LOCAL STORAGE
========================================================= */

const DEFENSE_STORAGE_KEY =
    "defense_reflection_journal";


/* =========================================================
   SAVE
========================================================= */

function saveJournal(data) {

    try {

        localStorage.setItem(
            DEFENSE_STORAGE_KEY,
            JSON.stringify(data)
        );

        return true;

    } catch (error) {

        console.error(
            "Không thể lưu nhật ký:",
            error
        );

        return false;
    }
}



/* =========================================================
   LOAD
========================================================= */

function loadJournal() {

    try {

        const raw =
            localStorage.getItem(
                DEFENSE_STORAGE_KEY
            );

        if (!raw) {
            return null;
        }

        return JSON.parse(raw);

    } catch (error) {

        console.error(
            "Không thể đọc nhật ký:",
            error
        );

        return null;
    }
}



/* =========================================================
   CLEAR
========================================================= */

function clearJournal() {

    try {

        localStorage.removeItem(
            DEFENSE_STORAGE_KEY
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



/* =========================================================
   EXPORT
========================================================= */

function exportJournal() {

    const data = loadJournal();

    if (!data) {
        return false;
    }


    const json =
        JSON.stringify(
            data,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    const date =
        new Date()
            .toISOString()
            .slice(0, 10);


    link.href = url;

    link.download =
        `DEFENSE_Journal_${date}.json`;


    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);


    return true;
}



/* =========================================================
   IMPORT
========================================================= */

function importJournal(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = function () {

                try {

                    const data =
                        JSON.parse(
                            reader.result
                        );


                    if (
                        !data ||
                        typeof data !== "object"
                    ) {

                        throw new Error(
                            "Dữ liệu không hợp lệ."
                        );

                    }


                    saveJournal(data);

                    resolve(data);

                } catch (error) {

                    reject(error);

                }

            };


            reader.onerror = function () {

                reject(
                    new Error(
                        "Không thể đọc tệp."
                    )
                );

            };


            reader.readAsText(file);

        }
    );
}