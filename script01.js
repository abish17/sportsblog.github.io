// JavaScript source code
const scoreUpdate = document.querySelector('button');
const scoreDisplay = document.querySelector('pre');


scoreUpdate.onclick = function () {
    const scores = scoreUpdate.value;
    updateDisplay(scores);
};

function updateDisplay(scores) {
    let url = 'https://records.nhl.com/site/api/draft';
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'text';
    request.onload = function () {
        scoreDisplay.textContent = request.response;
    };
    request.send();
};