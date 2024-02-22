let clicked = false;
let intervalId;

function create_message(messageText, deleteTime = 2000) {
    const messageElem = document.createElement('div');
    messageElem.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        z-index: 1001; background: rgba(0, 0, 0, 0.8); color: white; font-size: 20pt;
        padding: 20px; border-radius: 10px;
    `;
    messageElem.innerText = messageText;

    document.body.appendChild(messageElem);

    setTimeout(() => {
        messageElem.remove();
    }, deleteTime);
}

fetch(chrome.runtime.getURL('data/formid.txt'))
    .then(response => response.text())
    .then(data => {
        const formId = data.trim();
        if (window.location.href.includes(formId) && !window.location.href.endsWith('formResponse')) {
            const loadingElem = document.createElement('div');
            loadingElem.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                z-index: 1000; background: rgba(0, 0, 0, 0.8); color: white; font-size: 20pt;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
            `;

            const spinnerElem = document.createElement('div');
            spinnerElem.className = 'spinner';

            loadingElem.appendChild(spinnerElem);
            const textElem = document.createElement('div');
            textElem.className = 'loading-message-text';
            textElem.appendChild(document.createTextNode('自動回答中...'));
            loadingElem.appendChild(textElem);

            const cancelButton = document.createElement('button');
            cancelButton.innerText = '閉じる';
            cancelButton.style.cssText = `
                background-color: red; color: white; font-size: 16px; padding: 10px;
                border: none; border-radius: 5px; cursor: pointer;
            `;
            cancelButton.addEventListener('click', () => {
                clearInterval(intervalId);
                loadingElem.remove();
                clicked = true;
            });
            loadingElem.appendChild(cancelButton);

            document.body.appendChild(loadingElem);

            intervalId = setInterval(() => {
                const labelElem = document.querySelector('label');

                if (labelElem && !clicked && labelElem.querySelector('div[aria-checked="true"]') === null) {
                    labelElem.click();

                    setTimeout(() => {
                        document.querySelectorAll('[role="button"]').forEach(button => {
                            if (button.querySelector('span')?.innerText.includes('送信')) {
                                button.click();
                                create_message('送信完了！', 5000);
                            }
                        });

                        loadingElem.remove();
                        clearInterval(intervalId);
                    }, 1000);
                }
            }, 100);
        }
    })
    .catch(error => console.error('エラーが発生しました：', error));
