// ==UserScript==
// @name         Scoreboard (Memory based)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  don't leak or I will cut off your ballz
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// @run-at       document-start
// ==/UserScript==

//memory hook
const W = WebAssembly,
      expose = e => {
          try {
              const m = e.memory || Object.values(e).find(x => x instanceof W.Memory);
              if (!m) return;
              const b = m.buffer;
              window.__wasm_memory__ = m;
              window.__wasm_HEAP8 = new Int8Array(b);
              window.__wasm_HEAPU8 = new Uint8Array(b);
              window.__wasm_HEAP16 = new Int16Array(b);
              window.__wasm_HEAPU16 = new Uint16Array(b);
              window.__wasm_HEAP32 = new Int32Array(b);
              window.__wasm_HEAPU32 = new Uint32Array(b);
              window.__wasm_HEAPF32 = new Float32Array(b);
              window.__wasm_HEAPF64 = new Float64Array(b);
              console.log("[wasm-capture] HEAPF32 ready");
          } catch {}
      };
const wrap = f => async (...a) => {
    const r = await f(...a),
          i = r.instance || r;
    expose(i.exports || {});
    return r;
};
W.instantiate = wrap(W.instantiate.bind(W));
if (W.instantiateStreaming) {
    W.instantiateStreaming = wrap(W.instantiateStreaming.bind(W));
}

//LOGIC
const offsets = {
    team: 6,
    tank: 17,
    score: 28,
    name: 39,
};

const name_gap = 3;

const teamColorMap = {
   6: 'green',
   5: 'purple',
   4: 'red',
   3: 'blue',
};

const reverseTeamColorMap = {
   'green': 6,
   'purple': 5,
   'red': 4,
   'blue': 3,
};

class ScoreBoardEntry{
    constructor(name, tank, score, team){
        this.name = name;
        this.tank = tank;
        this.score = score;
        this.team = team;
    }
};

function readStringAt(adr, maxLen = 20) {
  const heapu8 = __wasm_HEAPU8;

  // invalid pointer guard
  if (adr <= 0 || adr >= heapu8.length) return "";

  let end = adr;
  const maxEnd = Math.min(heapu8.length, adr + maxLen);

  while (end < maxEnd && heapu8[end] !== 0) {
    end++;
  }

  return new TextDecoder("utf-8")
    .decode(heapu8.subarray(adr, end));
}

function getServerStartingBlock(){
    let first_adr = __wasm_HEAPF32.indexOf(-11150);
    if(__wasm_HEAPF32[first_adr-2] === 0){
        return first_adr;
    }else{
        return __wasm_HEAPF32.indexOf(-11150, first_adr+1);
    }
}

function getScoreBoard(){
    const scoreboard = [];
    const block_adr = getServerStartingBlock();
    const heapu32 = __wasm_HEAPU32;
    const heapf32 = __wasm_HEAPF32;
    for(let i = 0; i < 10; i++){
        const modified_i = i > 1 ? i+1 : i;
        //addresses
        const team_adr = block_adr + offsets.team + i;
        const tank_adr = block_adr + offsets.tank + i;
        const score_adr = block_adr + offsets.score + i;
        //const name_adr = block_adr + offsets.name + (modified_i * name_gap);//DISABLED FOR NOW
        //values
        const team = teamColorMap[heapu32[team_adr]];
        const tank = heapu32[tank_adr]; //for now just tank Id
        const score = heapf32[score_adr];
        /* DISABLED FOR NOW
        const name = readStringAt(heapu32[name_adr]);
        if(name.length === 0) console.log(name_adr);
        */
        //final
        const entry = new ScoreBoardEntry('', tank, score, team);
        scoreboard.push(entry);
    }
    return scoreboard;
}

function changeTeam(barNumber, team){
    const heapu32 = __wasm_HEAPU32;
    heapu32[getServerStartingBlock() + offsets.team + (barNumber-1)] = reverseTeamColorMap[team];
}

function changeTank(barNumber, id){
    const heapu32 = __wasm_HEAPU32;
    heapu32[getServerStartingBlock() + offsets.tank + (barNumber-1)] = id;
}

function changeScore(barNumber, value){
    const heapf32 = __wasm_HEAPF32;
    heapf32[getServerStartingBlock() + offsets.score + (barNumber-1)] = value;
}

//chat gpt AI slop for cool user interface
// ================= GUI =================
(function () {
    const style = document.createElement("style");
    style.innerHTML = `
    #sb-gui {
        position: fixed;
        top: 20px;
        left: 20px;
        width: 260px;
        background: rgba(20, 20, 30, 0.75);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 10px;
        color: white;
        font-family: monospace;
        z-index: 999999;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
        user-select: none;
    }
    #sb-header {
        font-weight: bold;
        margin-bottom: 8px;
        cursor: move;
    }
    .sb-entry {
        display: flex;
        justify-content: space-between;
        padding: 4px 6px;
        margin: 2px 0;
        border-radius: 6px;
        background: rgba(255,255,255,0.05);
    }
    .sb-entry:hover {
        background: rgba(255,255,255,0.1);
    }
    .team-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 6px;
    }
    #sb-controls {
        margin-top: 8px;
        display: flex;
        gap: 5px;
    }
    #sb-controls input {
        width: 50px;
        background: #111;
        border: none;
        color: white;
        padding: 2px;
        border-radius: 4px;
    }
    #sb-controls button {
        flex: 1;
        background: #222;
        border: none;
        color: white;
        padding: 4px;
        border-radius: 6px;
        cursor: pointer;
    }
    #sb-controls button:hover {
        background: #444;
    }
    `;
    document.head.appendChild(style);

    const gui = document.createElement("div");
    gui.id = "sb-gui";
    gui.innerHTML = `
    <div id="sb-header">⚡ Scoreboard</div>
    <div id="sb-list"></div>
    <div id="sb-controls">
        <input id="bar" placeholder="bar">
        <input id="val" placeholder="val">
        <button id="teamBtn">Team</button>
        <button id="tankBtn">Tank</button>
        <button id="scoreBtn">Score</button>
    </div>
`;
    document.body.appendChild(gui);

    const list = document.getElementById("sb-list");

    function render() {
        if (!window.__wasm_HEAPU32) return;

        const data = getScoreBoard();
        list.innerHTML = "";

        data.forEach((e, i) => {
            const div = document.createElement("div");
            div.className = "sb-entry";

            const color = e.team || "gray";

            div.innerHTML = `
                <span>
                    <span class="team-dot" style="background:${color}"></span>
                    #${i + 1}
                </span>
                <span>${Math.floor(e.score)}</span>
            `;
            list.appendChild(div);
        });
    }

    setInterval(render, 300);

    // ================= Controls =================
    document.getElementById("teamBtn").onclick = () => {
        const bar = +document.getElementById("bar").value;
        const val = document.getElementById("val").value;
        changeTeam(bar, val);
    };

    document.getElementById("tankBtn").onclick = () => {
        const bar = +document.getElementById("bar").value;
        const val = +document.getElementById("val").value;
        changeTank(bar, val);
    };

    document.getElementById("scoreBtn").onclick = () => {
    const bar = +document.getElementById("bar").value;
    const val = +document.getElementById("val").value;
    changeScore(bar, val);
};

    // ================= Drag =================
    let dragging = false, offsetX = 0, offsetY = 0;

    const header = document.getElementById("sb-header");

    header.onmousedown = (e) => {
        dragging = true;
        offsetX = e.clientX - gui.offsetLeft;
        offsetY = e.clientY - gui.offsetTop;
    };

    document.onmouseup = () => dragging = false;

    document.onmousemove = (e) => {
        if (!dragging) return;
        gui.style.left = (e.clientX - offsetX) + "px";
        gui.style.top = (e.clientY - offsetY) + "px";
    };

    // ================= Toggle =================
    let visible = true;
    window.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "k") {
            visible = !visible;
            gui.style.display = visible ? "block" : "none";
        }
    });

})();