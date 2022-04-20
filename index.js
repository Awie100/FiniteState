const statusMsg = document.getElementById("status");
const inputBox = document.getElementById("inputBox");


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

var wordList;

fetch("https://raw.githubusercontent.com/dwyl/english-words/master/words.txt").then(response => response.text()).then(text => {
    wordList = text.split("\n");
}).catch(err => console.log(err));

function startMachine() {
    const text = filterText(inputBox.value);
    const machine = generateMachine(text);

    drawMachine(machine, 20);
    
    const validWords = filterWordList(machine, "", 0, wordList);
    updateStatus("Valid Words: <br>" + printList(validWords));
}

function generateMachine(txt) {
    const mach = new Map();
    mach.set("", []);
    for (let index = 0; index < txt.length - 1; index++) {
        const elem = mach.get(txt[index]);
        if(elem === undefined) {
            mach.set(txt[index], [txt[index+1]]);
            mach.get("").push(txt[index]);
        } else {
            if(!elem.includes(txt[index+1])) {
                elem.push(txt[index+1]);
            }
        }
    }

    if(mach.get(txt[txt.length - 1]) === undefined) {
        mach.set(txt[txt.length - 1], []);
        mach.get("").push(txt[txt.length - 1]);
    }

    return mach;
}

function drawMachine(mach, size) {
    const letters = mach.get("");
    const twopi = 2 * Math.PI;
    const center = {x: canvas.width / 2, y: canvas.height / 2}
    const letterPos = new Map();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = size.toString() + "px sans-serif";

    for (let index = 0; index < letters.length; index++) {
        const elem = letters[index];

        const px = Math.cos(twopi * index / letters.length) * (canvas.width / 3) + center.x;
        const py = Math.sin(twopi * index / letters.length) * (canvas.height / 3) + center.y;

        ctx.fillText(elem, px, py);

        ctx.beginPath();
        ctx.arc(px, py, size, 0, twopi);
        ctx.stroke();

        letterPos.set(elem, {x: px, y: py});
    }

    letters.forEach(elem => {
        mach.get(elem).forEach( other => {
            if(elem === other) {
                arcArrow(letterPos.get(elem), center, size);
            } else {
                lineArrow(letterPos.get(elem), letterPos.get(other), size);
            }
        });
    });

}

function filterText(exp) {
    exp = exp.toUpperCase().replace(/[^A-Z]+/g, "");
    return exp;
}

function filterWordList(mach, letter, index, words) {
    var valid = [];
    mach.get(letter).forEach(elem => {
        const valWords = words.filter(word => word.length > index && word.charAt(index).toUpperCase() === elem);
        valid.push(...valWords.filter(word => word.length === index + 1));

        if(valWords.length > 0) {
            valid.push(...filterWordList(mach, elem, index + 1, valWords));
        }
    });
    return valid;
}


function updateStatus(msg) {
    statusMsg.innerHTML = msg;
}

function lineArrow(start, end, size) {
    var angle = Math.atan2(end.y - start.y, end.x - start.x);
    var pos = {x: 0, y: 0};
    var ps = {...start};
    var pe = {...end};
    var rad = size / 2;

    pos.x = Math.cos(angle);
    pos.y = Math.sin(angle);

    ps.x += pos.x * size;
    ps.y += pos.y * size;

    pe.x -= pos.x * (size + rad);
    pe.y -= pos.y * (size + rad);

    ctx.beginPath();
    ctx.moveTo(ps.x, ps.y);
    ctx.lineTo(pe.x, pe.y);
    ctx.stroke();

    arrowHead(pe, angle, rad);
}

function arrowHead(end, angle, rad) {
    var pos = {x: 0, y: 0};

    ctx.beginPath();
    pos.x = Math.cos(angle) * rad + end.x;
    pos.y = Math.sin(angle) * rad + end.y;
    ctx.moveTo(pos.x, pos.y);

    angle += (2 * Math.PI / 3)
    pos.x = Math.cos(angle) * rad + end.x;
    pos.y = Math.sin(angle) * rad + end.y;
    ctx.lineTo(pos.x, pos.y);

    angle += (2 * Math.PI / 3);
    pos.x = Math.cos(angle) * rad + end.x;
    pos.y = Math.sin(angle) * rad + end.y;
    ctx.lineTo(pos.x, pos.y);

    ctx.closePath();
    ctx.fill();
}

function arcArrow(pos, center, size) {
    var angle = Math.atan2(pos.y - center.y, pos.x - center.x);
    const bigrad = size * Math.sqrt(3);

    const arcCenter = {
        x: Math.cos(angle) * size * 2 + pos.x,
        y: Math.sin(angle) * size * 2 + pos.y
    };

    ctx.beginPath();
    ctx.arc(arcCenter.x, arcCenter.y, bigrad, angle + Math.PI * 7 / 6, angle + Math.PI  * 5 / 6);
    ctx.stroke();

    const arrowRad = size / 2;
    const arrowAngle = angle + (Math.PI / 3);
    const arrowCenter = {
        x: Math.cos(arrowAngle) * (size + arrowRad) + pos.x,
        y: Math.sin(arrowAngle) * (size + arrowRad) + pos.y
    }

    arrowHead(arrowCenter, arrowAngle + Math.PI, arrowRad);

}

function printList(stuff) {
    var outStr = "";

    for (let index = 0; index < stuff.length - 1; index++) {
        outStr += stuff[index] + ", ";
    }

    return outStr + stuff.slice(-1)[0];
}