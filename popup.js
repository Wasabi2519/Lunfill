
var presets = [
    { label: "ファミリーマート", entry: "ファミリーマート" },
    { label: "セブンイレブン", entry: "セブンイレブン" }
];

var lastOpenedDate = localStorage.getItem('lastOpenedDate');
var today = new Date().toLocaleDateString();

if (lastOpenedDate !== today) {
    localStorage.setItem('lastOpenedDate', today);
}

add();

document.getElementById("addPresetButton").addEventListener("click", function () {
    var newPresetInput = document.getElementById("newPresetInput");
    var newPresetLabel = newPresetInput.value.trim();

    if (newPresetLabel) {
        presets.push({ label: newPresetLabel, entry: newPresetLabel });
        save();
        newPresetInput.value = "";
    }
});

document.getElementById("removePresetButton").addEventListener("click", function () {
    showConfirmationModal("全てのプリセットを削除しますか？", "この操作は取り消せません。", function (result) {
        presets = [];
        save();
    }, "削除する", "キャンセル");
});

function openForm(entry) {
    showConfirmationModal("確認", "本日はすでにフォームを開いています。", function (result) {
        if (result) {
            localStorage.setItem('lastOpenedDate', today);
            enableSubmitButton();
            const url = createPresetURL(entry);
            chrome.tabs.create({ url: url }, function (tab) {});
        }
    }, "送る", "やめとく");
}

function enableSubmitButton() {
    var submitButton = document.getElementById("submitFormButton"); // Replace with the actual ID of your submit button
    if (submitButton) {
        submitButton.disabled = false;
    }
}

function add() {
    var presetList = document.getElementById("presetList");
    presetList.innerHTML = "";

    presets.forEach(preset => {
        var column = createPresetElement(preset);
        presetList.appendChild(column);
    });
}

function createPresetElement(preset) {
    var column = document.createElement("div");
    column.className = "column";
    column.textContent = preset.label;
    column.addEventListener("click", function () {
        openForm(preset.entry);
    });

    return column;
}

function save() {
    var presetsString = JSON.stringify(presets.map(preset => ({ label: preset.label, entry: preset.entry })));
    chrome.storage.sync.set({ presets: presetsString }, function () {
        console.log("プリセットが保存されました。");
        add();
    });
}

chrome.storage.sync.get(['presets'], function (result) {
    if (result.presets) {
        presets = JSON.parse(result.presets);
        add();
    }
});

function createPresetURL(entry, confirmationStatus = true) {
    const entries = [
        { id: "414286780", value: confirmationStatus ? "%E7%A2%BA%E8%AA%8D%E3%81%97%E3%81%BE%E3%81%97%E3%81%9F" : "" },
        { id: "2123243110", value: encodeURIComponent(entry) },
        { id: "1948296131", value: confirmationStatus ? "%E7%A2%BA%E8%AA%8D%E3%81%97%E3%81%BE%E3%81%97%E3%81%9F" : "" }
    ];

    const queryString = entries.map(entry => `entry.${entry.id}=${entry.value}`).join('&');
    return `https://docs.google.com/forms/d/e/1FAIpQLSeU0te7mtB5xNZOEJTuUZ0ugfVx5yMWN6bptes_LLa42oHFQA/viewform?${queryString}`;
}
function showConfirmationModal(title, message, callback, confirmButtonText, cancelButtonText) {
    var confirmationModal = document.getElementById("confirmationModal");
    var modalContent = document.querySelector("#confirmationModal .modal-content");
    document.getElementById("cancelDelete").removeEventListener("click", cancelClickHandler);
    document.getElementById("confirmDelete").removeEventListener("click", confirmClickHandler);

    var titleHTML = `<h2>${title}</h2>`;
    var messageHTML = typeof message === 'function' ? `<p>${message()}</p>` : `<p>${message.replace(/\n/g, "<br>")}</p>`;
    var confirmButtonHTML = `<button id="confirmDelete">${confirmButtonText}</button>`;
    var cancelButtonHTML = `<button id="cancelDelete">${cancelButtonText}</button>`;

    modalContent.innerHTML = titleHTML + messageHTML + confirmButtonHTML + cancelButtonHTML;

    confirmationModal.style.display = "block";
    document.getElementById("confirmDelete").addEventListener("click", confirmClickHandler);
    document.getElementById("cancelDelete").addEventListener("click", cancelClickHandler);

    function confirmClickHandler() {
        confirmationModal.style.display = "none";
        callback(true);
    }

    function cancelClickHandler() {
        confirmationModal.style.display = "none";
        callback(false);
    }
}
