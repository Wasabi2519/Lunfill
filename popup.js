// プリセットを格納する変数
var presets = [];

// プリセットをセレクトボックスに初回追加
addPresetsToSelect();

// プリセット追加ボタンがクリックされたときの処理
document.getElementById("addPresetButton").addEventListener("click", function () {
    var newPresetLabel = prompt("保存したい行き先を入力してください:");
    if (newPresetLabel) {
        // ラベル名をURLの一部として利用
        var newPresetURL = `https://docs.google.com/forms/d/e/1FAIpQLSeU0te7mtB5xNZOEJTuUZ0ugfVx5yMWN6bptes_LLa42oHFQA/viewform?entry.1448980291=%E7%A2%BA%E8%AA%8D%E3%81%97%E3%81%BE%E3%81%97%E3%81%9F&entry.1250370088=${encodeURIComponent(newPresetLabel)}&entry.1695676629=%E7%A2%BA%E8%AA%8D%E3%81%97%E3%81%BE%E3%81%97%E3%81%9F`;

        // 新しいプリセットをストレージに保存
        presets.push({ label: newPresetLabel, url: newPresetURL });
        savePresetsToStorage();
    }
});

// プリセットを削除する関数
function removePreset() {
    var select = document.getElementById("pref");
    var selectedPref = select.options[select.selectedIndex].value;

    // 選択されたプリセットを配列から削除
    presets = presets.filter(function (preset) {
        return preset.label !== selectedPref;
    });

    // ストレージに新しいプリセット情報を保存
    savePresetsToStorage();

    // セレクトボックスから選択されたプリセットを削除
    addPresetsToSelect();
}

// プリセット削除ボタンがクリックされたときの処理
document.getElementById("removePresetButton").addEventListener("click", function () {
    removePreset();
});

// プリセットをセレクトボックスに追加する関数
function addPresetsToSelect() {
    var select = document.getElementById("pref");

    // すでにセレクトボックスに追加されているオプションをクリア
    select.innerHTML = '<option value="" selected>プリセットを選択してください</option>';

    // プリセットをセレクトボックスに追加
    presets.forEach(function (preset) {
        var option = document.createElement("option");
        option.value = preset.label;
        option.text = preset.label;
        select.add(option);
    });
}

// プリセットをストレージに保存する関数
function savePresetsToStorage() {
    // プリセット情報を文字列に変換
    var presetsString = JSON.stringify(presets);

    chrome.storage.sync.set({ presets: presetsString }, function () {
        console.log("プリセットが保存されました。");

        // 保存が完了したらセレクトボックスに新しいプリセットを追加
        addPresetsToSelect();
    });
}

// プリセット選択ボタンがクリックされたときの処理
document.getElementById("openButton").addEventListener("click", function () {
    var select = document.getElementById("pref");
    var selectedPref = select.options[select.selectedIndex].value;

    // プリセットごとの条件分岐
    var selectedPreset = presets.find(function (preset) {
        return preset.label === selectedPref;
    });

    if (selectedPreset) {
        window.open(selectedPreset.url);
    }
});

// 拡張機能が読み込まれた時にストレージからプリセットを取得
chrome.storage.sync.get(['presets'], function (result) {
    if (result.presets) {
        // プリセット情報を配列に変換
        presets = JSON.parse(result.presets);
        addPresetsToSelect();
    }
});
