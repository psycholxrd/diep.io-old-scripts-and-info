// ==UserScript==
// @name         leader locator 2026
// @namespace    http://tampermonkey.net/
// @version      1.0.13
// @description  try to take over the world!
// @author       w-ccc, r!PsAw, Snowy, MstJk
// @match        https://diep.io/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
//config
let opacities = {
    d_txt: 0.2,
    screen_arc: 0.5,
    minimap_arc: 0.5,
    prediction_arc: 0.5,
    line: 0.3,
    square: 0.1,
    minimap: 0.5,
};
let colors = {
    d_txt: 'black',
    screen_arc: 'blue',
    minimap_arc: 'blue',
    prediction_arc: 'lightblue',
    line: 'red',
    square: 'orange',
    minimap: 'lime',
};
let enabled = {
    d_txt: true,
    screen_arc: true,
    minimap_arc: true,
    prediction_arc: true,
    line: true,
    square: true,
    minimap: true,
};
let lineWidth = {
    line: 1,
    minimap: 5,
};
let radius = {
    screen_arc: 85,
    minimap_arc: 4,
    prediction_arc: 85,
};
//how far prediction goes
const prediction_offset_factor = 30;
//square sizes
const ID_sizes = {
    "0": {
        "width": 4345.71484375,
        "height": 2442.977783203125
    },
    "1": {
        "width": 4345.71484375,
        "height": 2442.977783203125
    },
    "2": {
        "width": 4345.71484375,
        "height": 2442.977783203125
    },
    "3": {
        "width": 4345.71484375,
        "height": 2442.977783203125
    },
    "4": {
        "width": 4345.71484375,
        "height": 2442.977783203125
    },
    "5": {
        "width": 4346.84375,
        "height": 2443.612548828125
    },
    "6": {
        "width": 4827.0302734375,
        "height": 2713.717529296875
    },
    "7": {
        "width": 4345.71484375,
        "height": 2442.977783203125
    },
    "8": {
        "width": 4345.71484375,
        "height": 2442.977783203125
    },
    "9": {
        "width": 4345.71484375,
        "height": 2442.977783203125
    },
    "10": {
        "width": 4346.90087890625,
        "height": 2443.644775390625
    },
    "11": {
        "width": 4828.42041015625,
        "height": 2714.499267578125
    },
    "12": {
        "width": 4827.663818359375,
        "height": 2714.381103515625
    },
    "13": {
        "width": 4345.516357421875,
        "height": 2442.264404296875
    },
    "14": {
        "width": 4348.342529296875,
        "height": 2443.854248046875
    },
    "15": {
        "width": 5790.629638671875,
        "height": 3255.140380859375
    },
    "17": {
        "width": 4826.832763671875,
        "height": 2713.004638671875
    },
    "18": {
        "width": 4347.210205078125,
        "height": 2443.217041015625
    },
    "19": {
        "width": 5109.833740234375,
        "height": 2872.192626953125
    },
    "20": {
        "width": 4348.494384765625,
        "height": 2443.939208984375
    },
    "21": {
        "width": 5795.455810546875,
        "height": 3257.854736328125
    },
    "22": {
        "width": 6675.449951171875,
        "height": 3752.851318359375
    },
    "23": {
        "width": 4345.516357421875,
        "height": 2442.264404296875
    },
    "24": {
        "width": 4345.516357421875,
        "height": 2442.264404296875
    },
    "25": {
        "width": 4346.658447265625,
        "height": 2442.956787109375
    },
    "26": {
        "width": 4831.03466796875,
        "height": 2712.264892578125
    },
    "28": {
        "width": 5109.11669921875,
        "height": 2872.585693359375
    },
    "29": {
        "width": 4346.00537109375,
        "height": 2443.335205078125
    },
    "31": {
        "width": 4827.63916015625,
        "height": 2714.254638671875
    },
    "32": {
        "width": 4827.63916015625,
        "height": 2714.254638671875
    },
    "33": {
        "width": 4827.66357421875,
        "height": 2714.264892578125
    },
    "34": {
        "width": 4827.10888671875,
        "height": 2715.2470703125
    },
    "35": {
        "width": 4827.10888671875,
        "height": 2715.2470703125
    },
    "36": {
        "width": 4827.10888671875,
        "height": 2715.2470703125
    },
    "38": {
        "width": 4825.7861328125,
        "height": 2714.5029296875
    },
    "39": {
        "width": 4345.3076171875,
        "height": 2442.499755859375
    },
    "40": {
        "width": 4345.696533203125,
        "height": 2442.35791015625
    },
    "41": {
        "width": 4344.764892578125,
        "height": 2443.19189453125
    },
    "42": {
        "width": 4346.09912109375,
        "height": 2444.67919921875
    },
    "43": {
        "width": 5110.19140625,
        "height": 2874.4814453125
    },
    "44": {
        "width": 4827.8662109375,
        "height": 2713.94384765625
    },
    "48": {
        "width": 4825.78662109375,
        "height": 2714.50341796875
    },
    "49": {
        "width": 4345.65673828125,
        "height": 2444.4306640625
    },
    "50": {
        "width": 4827.262451171875,
        "height": 2714.940673828125
    },
    "51": {
        "width": 4827.10888671875,
        "height": 2715.2470703125
    },
    "52": {
        "width": 4830.34912109375,
        "height": 2713.619873046875
    },
    "54": {
        "width": 4827.10888671875,
        "height": 2715.2470703125
    },
    "55": {
        "width": 4825.7158203125,
        "height": 2714.4638671875
    },
    "58": {
        "width": 4345.26513671875,
        "height": 2442.489013671875
    },
    "60": {
        "width": 4345.5908203125,
        "height": 2444.3935546875
    },
    "61": {
        "width": 4825.56787109375,
        "height": 2714.38037109375
    },
    "62": {
        "width": 4345.47509765625,
        "height": 2444.328125
    },
    "63": {
        "width": 4827.10888671875,
        "height": 2715.2470703125
    },
    "64": {
        "width": 4825.7861328125,
        "height": 2714.5029296875
    }
}

//logic
let baseIndex;
let playerPosition;
let fov;
let minimapData = {
    x: null,
    y: null,
    width: null,
    height: null
};

let region = "";
let gamemode = "";

//const ARENA_WIDTH = 22700;
//const ARENA_HEIGHT = 22700;
const ARENA_WIDTH = 22400;
const ARENA_HEIGHT = 22400;
const interval = 60;
const TARGET_HEAP_VALUE = 0x960b;
const LEADER_X_INDEX = 155829;
const LEADER_Y_INDEX = 155824;
const CAMERA_X_INDEX = 155810;
const CAMERA_Y_INDEX = 155806;
const PLAYER_X_OFFSET = 82;
const PLAYER_Y_OFFSET = 35;
const FOV_OFFSET = 28;

/* old memory hook
win.Object.defineProperty(win.Object.prototype, "HEAPF32", {
    get: function() {
        return undefined;
    },
    set: function(newHeapF32) {
        if (!newHeapF32 || !this.HEAPU32) return;
        delete win.Object.prototype.HEAPF32;
        window.Module = this;
        window.__wasm_HEAPF32 = newHeapF32;
        win.Module = window.Module;
        win.aim = false;
        initialize();
    },
    configurable: true,
    enumerable: true
});
*/

//helper functions
const floatToHex = function (f) { //123.12524e5235 -> 0x...
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, f, false); // false = big endian (IEEE 754 standard order)
    return '0x' + view.getUint32(0, false).toString(16).padStart(8, '0');
}

const hexToFloat = function(hex) { // 0x... -> 12314.235234e-623523
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    const value = parseInt(hex, 16);
    view.setUint32(0, value, false); // false = big endian
    return view.getFloat32(0, false);
}

//XOR-Shift decoded by Shadam
const _buf = new ArrayBuffer(4);
    const _i32 = new Int32Array(_buf);
    const _u32 = new Uint32Array(_buf);
    const _f32 = new Float32Array(_buf);

    const K = -939524096; // 0xC8000000

    const decodeFov = (x) => {
        x = x | 0;
        const v1 = (x << 8) | 0;
        const v2 = (x >>> 8) & 255;
        const xt = (x >>> 24) | 0;

        // B0 (pos 0): ((x_B1 + 68) ^ 94)
        const b0 = ((v2 + 68) ^ 94) & 255;
        // B1 (pos 8): ((x_B0 + (v1|v2)*66 - 11) ^ 34)
        const b1 = ((x + Math.imul(v1 | v2, 66) - 11) ^ 34) & 255;
        // B2 (pos 16): ((x_B3 + x*18 + 70) ^ 207)
        const b2 = ((xt + Math.imul(x, 18) + 70) ^ 207) & 255;
        // B3 (pos 24): (x_B2 + x_B3*0x3A - 0x41)
        const b3 = (v1 + Math.imul(xt, 973078528) - 1090519040) & -16777216;

        _i32[0] = (b0 | (b1 << 8) | (b2 << 16) | b3) ^ K;
        return _f32[0];
    };

    const encodeFov = (f) => {
        _f32[0] = f;
        const fb = _i32[0] ^ K;
        const B0 = fb & 255, B1 = (fb >>> 8) & 255, B2 = (fb >>> 16) & 255, B3 = (fb >>> 24) & 255;

        const x_B1 = ((B0 ^ 94) - 68) & 255;
        const x_B0 = ((B1 ^ 34) + 11 - Math.imul(x_B1, 66)) & 255;
        const x_B3 = ((B2 ^ 207) - 70 - Math.imul(x_B0, 18)) & 255;
        const x_B2 = (B3 + 0x41 - Math.imul(x_B3, 0x3A)) & 255;

        _u32[0] = (x_B0 | (x_B1 << 8) | (x_B2 << 16) | (x_B3 << 24));
        return _u32[0];
    };

//world
function decodeWorldCoords(obf){
    return decodeFov(parseInt(floatToHex(obf)));
}

//rest of the logic

setInterval(() => {
    if (win.__common__ && win.__common__.active_region && win.__common__.active_gamemode) {
        region = win.__common__.active_region;
        gamemode = win.__common__.active_gamemode;
    }
}, 1000);

function initialize() {
    console.log('START');
    setInterval(() => {
        if (!window.__wasm_HEAPF32) return;
        //console.log(1);
        baseIndex = Array.prototype.findIndex.call(window.__wasm_HEAP32, value => value === TARGET_HEAP_VALUE);
    }, 1000);

    setInterval(() => {
        if (!window.__wasm_HEAPF32) return;
        //console.log(2);
        playerPosition = [
                decodeWorldCoords(window.__wasm_HEAPF32[baseIndex + PLAYER_X_OFFSET]),
                decodeWorldCoords(window.__wasm_HEAPF32[baseIndex + PLAYER_Y_OFFSET])
            ];
        fov = decodeFov(window.__wasm_HEAPU32[baseIndex + FOV_OFFSET]);
        win.fov = fov;
        win.playerPosition = playerPosition
    }, 1000 / interval);

    setInterval(() => {
        if (!window.__wasm_HEAPF32) return;
        //console.log(3);
        const leaderX = decodeWorldCoords(window.__wasm_HEAPF32[LEADER_X_INDEX]);
        const leaderY = decodeWorldCoords(window.__wasm_HEAPF32[LEADER_Y_INDEX]);
        if (Math.hypot(leaderX - playerPosition[0], leaderY - playerPosition[1]) > 3000) {
            GM_setValue(region + gamemode, JSON.stringify([leaderX, leaderY]));
        }
    }, 1000 / interval);
}
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
    initialize();
}
//

function setupCanvas() {
    let canvas = document.getElementById("canvas2");
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.id = "canvas2";
        canvas.style = "position:fixed;top:0;left:0;z-index:9999;pointer-events:none";
        document.body.appendChild(canvas);
    }
    resizeCanvas();
    return canvas;
}

function resizeCanvas() {
    const canvas = document.getElementById("canvas2");
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

const scaling_method = 'new';

function worldToScreenPosition(x, y) {
    if (!playerPosition || playerPosition.length < 2) return [1, 1];
    const deltaX = x - playerPosition[0];
    const deltaY = y - playerPosition[1];
    let screenX, screenY;
    switch (scaling_method) {
        case "old": {
            const scaleFactor = fov / computeY(fov);
            //console.log(scaleFactor);
            screenX = win.innerWidth / 2 + deltaX * scaleFactor;
            screenY = win.innerHeight / 2 + deltaY * scaleFactor;
        }
        break;
        case 'new': {
            const scaleFactor = (Math.max(window.innerWidth / 1920, window.innerHeight / 1080) * fov);
            screenX = win.innerWidth / 2 + (deltaX * scaleFactor);
            screenY = win.innerHeight / 2 + (deltaY * scaleFactor);
            //console.log(playerPosition[0], x, deltaX);
            //screenX = win.canvas.width / 2 + (deltaX * scaleFactor);
            //screenY = win.canvas.height / 2 + (deltaY * scaleFactor);
        }
        break;
    }
    return [screenX, screenY];
}

function computeY(x) {
    if (x === 0) {
        return 2.8;
    }
    return 0.947 / x + 1.507;
}

let distance = 0;
let leaderData = [0, 0];
let [leaderX, leaderY] = leaderData;
let cameraWorld = [0, 0];
let offsetVector = [0, 0];

function renderFrame() {
    requestAnimationFrame(renderFrame);
    if(!win.__wasm_HEAPF32) win.__wasm_HEAPF32 = window.__wasm_HEAPF32;
    if(!win.__wasm_HEAPU32) win.__wasm_HEAPU32 = window.__wasm_HEAPU32;
    if (!playerPosition || playerPosition.length < 2) return;
    const canvas = setupCanvas();
    const ctx = canvas.getContext("2d");

    leaderData = JSON.parse(GM_getValue(region + gamemode, "[]"));
    cameraWorld[0] = window.__wasm_HEAPF32[CAMERA_X_INDEX]; //no need to decode, because it's not encoded for some reason
    cameraWorld[1] = window.__wasm_HEAPF32[CAMERA_Y_INDEX];
    //console.log('CAMERA');
    const cameraScreen = worldToScreenPosition(...cameraWorld);
    const screen_center = {
        x: win.innerWidth / 2,
        y: win.innerHeight / 2
    };
    offsetVector[0] = (win.innerWidth) - cameraScreen[0];
    offsetVector[1] = -cameraScreen[1];
    if (!ctx || !leaderData.length) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let [old_leaderX, old_leaderY] = [leaderX, leaderY];
        [leaderX, leaderY] = leaderData;
    let [diffX, diffY] = [(leaderX - old_leaderX) * prediction_offset_factor, (leaderY - old_leaderY) * prediction_offset_factor];
    //console.log('PREDICT');
    let [predictX, predictY] = worldToScreenPosition(leaderX + diffX, leaderY + diffY);
    //console.log('LEADER');
    const [targetX, targetY] = worldToScreenPosition(leaderX, leaderY);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const windowFactor = Math.max(window.innerWidth / 1920, window.innerHeight / 1080);
    const scaleFactor = (windowFactor * fov);
    //scoreboard
    const baseOffset = 154090
    let pointer = (window.__wasm_HEAP32[baseOffset] >> 2) + 40
    pointer = (window.__wasm_HEAP32[pointer] >> 2) + 441
    const leaderID = window.__wasm_HEAPU32[pointer];
    if (enabled.square) {
        ctx.beginPath();
        ctx.globalAlpha = opacities.square;
        ctx.fillStyle = colors.square;
        console.log((targetX - ((scaleFactor * ID_sizes[leaderID].width)/2)) + offsetVector[0], (targetY - ((scaleFactor * ID_sizes[leaderID].height)/2)) + offsetVector[1], scaleFactor * ID_sizes[leaderID].width, scaleFactor * ID_sizes[leaderID].height);
        ctx.fillRect((targetX - ((scaleFactor * ID_sizes[leaderID].width)/2)) + offsetVector[0], (targetY - ((scaleFactor * ID_sizes[leaderID].height)/2)) + offsetVector[1], scaleFactor * ID_sizes[leaderID].width, scaleFactor * ID_sizes[leaderID].height);
    }

    if (enabled.line) {
        ctx.beginPath();
        ctx.globalAlpha = opacities.line;
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = lineWidth.line;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(targetX + offsetVector[0], targetY + offsetVector[1]);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    if (enabled.screen_arc) {
        ctx.beginPath();
        ctx.globalAlpha = opacities.screen_arc;
        ctx.fillStyle = colors.screen_arc;
        ctx.beginPath();
        ctx.arc(targetX + offsetVector[0], targetY + offsetVector[1], radius.screen_arc * scaleFactor, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    if (enabled.prediction_arc) {
        ctx.beginPath();
        ctx.globalAlpha = opacities.prediction_arc;
        ctx.fillStyle = colors.prediction_arc;
        ctx.arc(predictX + offsetVector[0], predictY + offsetVector[1], radius.prediction_arc * scaleFactor, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    if (enabled.d_txt) {
        let new_distance = Math.hypot(leaderX - playerPosition[0], leaderY - playerPosition[1]).toFixed(1);
        let emoji = (diffX == 0 && diffY == 0) ? "😴" : "";
        distance = new_distance;
        ctx.beginPath();
        ctx.globalAlpha = opacities.d_txt;
        ctx.fillStyle = colors.d_txt;
        ctx.font = "20px sans-serif";
        ctx.fillText(`Distance: ${distance} ${emoji}`, centerX + 10, centerY - 10);
        ctx.globalAlpha = 1;
    }

    if (enabled.minimap_arc) {
        const scaledX = minimapData.x + (minimapData.width * (leaderX + (ARENA_WIDTH / 2)) / ARENA_WIDTH);
        const scaledY = minimapData.y + (minimapData.height * (leaderY + (ARENA_HEIGHT / 2)) / ARENA_HEIGHT);
        ctx.beginPath();
        ctx.globalAlpha = opacities.minimap_arc;
        ctx.fillStyle = colors.minimap_arc;
        ctx.arc(scaledX, scaledY, radius.minimap_arc * windowFactor, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    if (enabled.minimap) {
        ctx.beginPath();
        ctx.globalAlpha = opacities.minimap;
        ctx.strokeStyle = colors.minimap;
        ctx.lineWidth = lineWidth.minimap * windowFactor;
        ctx.strokeRect(minimapData.x, minimapData.y, minimapData.width, minimapData.height);
        ctx.globalAlpha = 1;
    }
    if (win.extern && win.aim) win.extern.onTouchMove(-1, targetX, targetY);
}

window.addEventListener("resize", resizeCanvas);

//new better and cleaner frfr
CanvasRenderingContext2D.prototype.strokeRect = new Proxy(CanvasRenderingContext2D.prototype.strokeRect, {
    apply: function(target, thisArgs, args) {
        const transform = thisArgs.getTransform();
        //console.log(transform);
        minimapData.x = transform.e;
        minimapData.y = transform.f;
        minimapData.width = transform.a;
        minimapData.height = transform.d;
        return Reflect.apply(target, thisArgs, args);
    }
});

const onWheel = e => {
    if (!window.__wasm_HEAPU32 || baseIndex === -1 || !baseIndex) return;
    const heap = window.__wasm_HEAPU32;

    const cur = decodeFov(heap[baseIndex + FOV_OFFSET]);

    const next = e.deltaY > 0 ? (cur * 1.05) : (cur * 0.95);
    heap[baseIndex + FOV_OFFSET] = encodeFov(next);
};

document.addEventListener("wheel", onWheel, {
    passive: true
});

requestAnimationFrame(renderFrame);

const gui = document.createElement("div");
Object.assign(gui.style, {
    position: "fixed",
    top: "20px",
    left: "20px",
    zIndex: "9999",
    background: "rgba(0,0,0,0.85)",
    color: "#fff",
    fontFamily: "monospace",
    fontSize: "13px",
    padding: "10px",
    borderRadius: "6px",
    maxHeight: "90vh",
    overflowY: "auto",
    userSelect: "none",
    display: "block"
});
document.body.appendChild(gui);

let guiVisible = true;

win.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "t") {
        guiVisible = !guiVisible;
        gui.style.display = guiVisible ? "block" : "none";
    }
});

function rebuildGUI() {
    gui.innerHTML = "";
    buildGUI();
}

const DEFAULT_CONFIG = {
    opacities: {
        d_txt: 0.2,
        screen_arc: 0.5,
        minimap_arc: 0.5,
        prediction_arc: 0.5,
        line: 0.3,
        square: 0.1,
        minimap: 0.5,
    },
    colors: {
        d_txt: 'black',
        screen_arc: 'blue',
        minimap_arc: 'blue',
        prediction_arc: 'lightblue',
        line: 'red',
        square: 'orange',
        minimap: 'lime',
    },
    enabled: {
        d_txt: true,
        screen_arc: true,
        minimap_arc: true,
        prediction_arc: true,
        line: true,
        square: true,
        minimap: true,
    },
    lineWidth: {
        line: 1,
        minimap: 5,
    },
    radius: {
        screen_arc: 85,
        minimap_arc: 4,
        prediction_arc: 85,
    }
};

const STORAGE_KEY = "overlay_config_v1";

function saveConfig() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        opacities,
        colors,
        enabled,
        lineWidth,
        radius
    }));
}

function loadConfig() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
        const cfg = JSON.parse(saved);
        Object.assign(opacities, cfg.opacities || {});
        Object.assign(colors, cfg.colors || {});
        Object.assign(enabled, cfg.enabled || {});
        Object.assign(lineWidth, cfg.lineWidth || {});
        Object.assign(radius, cfg.radius || {});
    } catch {}
}

function resetToDefault() {
    if (!confirm("This will overwrite your saved config.\nAre you sure?")) return;

    Object.assign(opacities, structuredClone(DEFAULT_CONFIG.opacities));
    Object.assign(colors, structuredClone(DEFAULT_CONFIG.colors));
    Object.assign(enabled, structuredClone(DEFAULT_CONFIG.enabled));
    Object.assign(lineWidth, structuredClone(DEFAULT_CONFIG.lineWidth));
    Object.assign(radius, structuredClone(DEFAULT_CONFIG.radius));

    saveConfig();
    rebuildGUI();
}

function row() {
    const r = document.createElement("div");
    r.style.display = "flex";
    r.style.alignItems = "center";
    r.style.marginBottom = "4px";
    return r;
}

function label(text, width = "110px") {
    const l = document.createElement("span");
    l.textContent = text;
    l.style.display = "inline-block";
    l.style.width = width;
    return l;
}

function checkbox(obj, key) {
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = obj[key];
    cb.onchange = () => {
        obj[key] = cb.checked;
        saveConfig();
    };
    return cb;
}

function slider(obj, key, min = 0, max = 1, step = 0.01) {
    const s = document.createElement("input");
    s.type = "range";
    s.min = min;
    s.max = max;
    s.step = step;
    s.value = obj[key];
    s.style.flex = "1";
    s.oninput = () => {
        obj[key] = parseFloat(s.value);
        saveConfig();
    };
    return s;
}

function numberBox(obj, key, min = 0, max = 999) {
    const n = document.createElement("input");
    n.type = "number";
    n.min = min;
    n.max = max;
    n.value = obj[key];
    n.style.width = "60px";
    n.oninput = () => {
        obj[key] = parseFloat(n.value);
        saveConfig();
    };
    return n;
}

function colorPicker(obj, key) {
    const c = document.createElement("input");
    c.type = "color";
    c.value = rgbToHex(obj[key]);
    c.oninput = () => {
        obj[key] = c.value;
        saveConfig();
    };
    return c;
}

function rgbToHex(color) {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = color;
    return ctx.fillStyle;
}

function section(title) {
    const h = document.createElement("div");
    h.textContent = title;
    h.style.margin = "6px 0";
    h.style.color = "#0f0";
    gui.appendChild(h);
}

function button(text, onClick) {
    const b = document.createElement("button");
    b.textContent = text;
    b.style.marginTop = "6px";
    b.onclick = onClick;
    return b;
}

function buildGUI() {
    section("Enabled");
    for (const k in enabled) {
        const r = row();
        r.appendChild(label(k));
        r.appendChild(checkbox(enabled, k));
        gui.appendChild(r);
    }

    section("Opacities");
    for (const k in opacities) {
        const r = row();
        r.appendChild(label(k));
        r.appendChild(slider(opacities, k));
        gui.appendChild(r);
    }

    section("Colors");
    for (const k in colors) {
        const r = row();
        r.appendChild(label(k));
        r.appendChild(colorPicker(colors, k));
        gui.appendChild(r);
    }

    section("Radius");
    for (const k in radius) {
        const r = row();
        r.appendChild(label(k));
        r.appendChild(numberBox(radius, k, 0, 500));
        gui.appendChild(r);
    }

    section("Line Width");
    for (const k in lineWidth) {
        const r = row();
        r.appendChild(label(k));
        r.appendChild(numberBox(lineWidth, k, 1, 20));
        gui.appendChild(r);
    }

    gui.appendChild(button("Reset to default", resetToDefault));
}

loadConfig();
buildGUI();