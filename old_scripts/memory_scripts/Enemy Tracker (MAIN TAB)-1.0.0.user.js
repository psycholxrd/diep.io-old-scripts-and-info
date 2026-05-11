// ==UserScript==
// @name         Enemy Tracker (MAIN TAB)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  USE THIS TAB TO PLAY
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

//
let loaded = {
    hook: false,
    ctx: false,
};

//
const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
const basevalue = 5.382527531318055e-41;
const offsets = {x: 82, y: 35, fov: 28};
const camera_ptrs = {x: 155810, y: 155806}; //static
let player_world = {x:undefined, y:undefined};
let camera_world = {x:undefined, y:undefined};
let offset_vector = {x:undefined, y:undefined};
let ptrs = {basevalue:undefined, x:undefined, y:undefined, fov:undefined};
let FOV = 0.55;

win.main_tab_active = true;

setInterval(() => {
    if(win.alt_tab_active){
        alert('You have both alt and main tab scripts active on one window.\n Please read the instructions carefully, and try again!');
    }
}, 5000);

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
    loaded.hook = true;
}
//

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
};

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
//modified version for world coords
function decodeWorldCoords(obf) {
  return decodeFov(parseInt(floatToHex(obf)));
}

//logic
function world_to_screen(point){
    if(point.x === undefined || point.y === undefined) return {x:10, y:10};
    const screen_center = {x: win.innerWidth/2, y: win.innerHeight/2};
    const scaleFactor = (Math.max(window.innerWidth / 1920, window.innerHeight / 1080) * FOV);
    const deltaX = point.x - player_world.x;
    const deltaY = point.y - player_world.y;
    //console.log('sc:', screen_center, 'sf:', scaleFactor, 'dx:', deltaX, 'dy:', deltaY);
    return {
        x: screen_center.x + (deltaX*scaleFactor),
        y: screen_center.y + (deltaY*scaleFactor)
    };
}

function screen_to_world(point){
    if(point.x === undefined || point.y === undefined) return {x:10, y:10};

    const screen_center = { x: win.innerWidth / 2, y: win.innerHeight / 2 };
    const scaleFactor = (Math.max(window.innerWidth / 1920, window.innerHeight / 1080) * FOV);

    const deltaX = (point.x - screen_center.x) / scaleFactor;
    const deltaY = (point.y - screen_center.y) / scaleFactor;

    return {
        x: player_world.x + deltaX,
        y: player_world.y + deltaY
    };
}

function update_loop(){
    win.requestAnimationFrame(update_loop);
    if(!win.player_world) win.player_world = player_world;
    if(!win.__wasm_HEAPU32) win.__wasm_HEAPU32 = window.__wasm_HEAPU32;
    if(!win.__wasm_HEAPF32) win.__wasm_HEAPF32 = window.__wasm_HEAPF32;
    if(!window.__wasm_HEAPF32) return;
    if(!ptrs.basevalue){
        //console.log('1st time baseValue');
        let result = window.__wasm_HEAPF32.indexOf(basevalue);
        if(result === -1) return;
        ptrs.basevalue = result;
        //console.log('found basevalue!: ', result);
    }
    if(!ptrs.x){
        //console.log('1st time x');
        let result = window.__wasm_HEAPF32[ptrs.basevalue+offsets.x];
        if(!result || result === -1) return;
        ptrs.x = ptrs.basevalue+offsets.x;
        player_world.x = decodeWorldCoords(result);
        //console.log('found x! ', result);
    }else{
        player_world.x = decodeWorldCoords(window.__wasm_HEAPF32[ptrs.x]);
    }
    if(!ptrs.y){
        //console.log('1st time y');
        let result = window.__wasm_HEAPF32[ptrs.basevalue+offsets.y];
        if(!result || result === -1) return;
        ptrs.y = ptrs.basevalue+offsets.y;
        player_world.y = decodeWorldCoords(result);
        //console.log('found y! ', result);
    }else{
        player_world.y = decodeWorldCoords(window.__wasm_HEAPF32[ptrs.y]);
    }
    if(!ptrs.fov){
        //console.log('1st time fov');
        let result = window.__wasm_HEAPU32[ptrs.basevalue+offsets.fov];
        if(!result || result === -1) return;
        ptrs.fov = ptrs.basevalue+offsets.fov;
        FOV = decodeFov(result);
        //console.log('found FOV! ', FOV, ' with adress: ', ptrs.fov);
    }else{
        FOV = decodeFov(window.__wasm_HEAPU32[ptrs.fov]);
    }
    camera_world.x = window.__wasm_HEAPF32[camera_ptrs.x];
    camera_world.y = window.__wasm_HEAPF32[camera_ptrs.y];
    const camera_screen = world_to_screen(camera_world);
    const screen_center = {x: win.innerWidth/2, y: win.innerHeight/2};
    //console.log(camera_world, camera_screen);
    //console.log(camera_screen, win.innerWidth, win.innerHeight);
    offset_vector.x = (win.innerWidth) - camera_screen.x;
    offset_vector.y = -camera_screen.y;
}
//init
function initialize(){
    win.requestAnimationFrame(update_loop);
};
// canvas
let ctx = null;
function setupOverlay() {
    const overlay = document.createElement('canvas');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none'; // Click through
    overlay.style.zIndex = '9999';
    document.body.appendChild(overlay);

    // Handle resize
    const resize = () => {
        overlay.width = window.innerWidth;
        overlay.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    ctx = overlay.getContext('2d');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupOverlay);
} else {
    setupOverlay();
}

const swarmData = new Map();

//communication
const channel = new BroadcastChannel('diep_swarm_channel');
channel.onmessage = (event) => {
    const { id, value, timestamp } = event.data;
    swarmData.set(id, { value, timestamp });
};

//render
const max_afk_time = 500;
let previous_pos = new Map();
let player_times = new Map();

// Start the loop
render_loop();

// zoom
const onWheel = e => {
    if (!window.__wasm_HEAPU32 || ptrs.fov === -1) return;
    const heap = window.__wasm_HEAPU32;

    const cur = decodeFov(heap[ptrs.fov]);

    const next = e.deltaY > 0 ? (cur * 1.05) : (cur * 0.95);
    heap[ptrs.fov] = encodeFov(next);
};

document.addEventListener("wheel", onWheel, { passive: true });

// GUI
const uiSettings = {
    showLines: true,
    showText: true,
    aliveColor: '#ff0000', // Default Red
    deadColor: '#006400',  // Default DarkGreen
    lineWidth: 2,
    font: 'bold 12px monospace',
    textColor: '#ffffff',
    deadSymbol: '💀❓',
    activeTab: 'Instructions',
    isOpen: true
};

const gui = document.createElement('div');
gui.id = 'tm-gui-root';
gui.style.cssText = `
    position: fixed; top: 20px; left: 20px; width: 380px;
    background: rgba(10, 10, 10, 0.9); backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px;
    color: white; font-family: sans-serif; z-index: 10001;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; flex-direction: column;
    user-select: none;
`;
document.body.appendChild(gui);

const switchTab = (tabName) => {
    uiSettings.activeTab = tabName;
    buildGUI();
};

function runDiagnostics() {
    const out = document.getElementById('diag-out');
    if (!out) return;

    let reports = [];
    let isError = false;

    if (!loaded.hook) {
        reports.push("❌ [Hook] WASM Hook failed!");
        isError = true;
    } else {
        reports.push("✅ [Hook] WASM Hook active.");
    }

    if (!window.__wasm_HEAPF32 || !window.__wasm_HEAPU32) {
        reports.push("❌ [Memory] window.__wasm properties were not defined.\nFix: Reload the page.");
        isError = true;
    } else {
        reports.push("✅ [Memory] WASM Heaps captured.");
    }

    if (FOV === 0.55) {
        reports.push("⚠️ [FOV] Stuck at 0.55.");
    } else {
        reports.push(`✅ [FOV] Dynamic (${FOV.toFixed(4)})`);
    }

    if (player_world.x === undefined || player_world.y === undefined) {
        reports.push("❌ [Coords] Player position undefined (Adresses not found).");
        isError = true;
    }

    if (!ctx) {
        reports.push("❌ [Canvas] Overlay CTX missing.");
        isError = true;
    }

    // Final Output
    out.innerHTML = `
        <div style="border-top: 1px solid #333; margin-top: 10px; padding-top: 10px;">
            ${reports.join('<br>')}
            <div style="margin-top: 10px; color: ${isError ? '#ff4444' : '#00ff88'}; font-weight: bold;">
                ${isError ? 'SYSTEM FAILURE - Check console (F12)' : 'ALL SYSTEMS OPERATIONAL'}
            </div>
        </div>
    `;
}

function buildGUI() {
    gui.innerHTML = `
        <div id="gui-header" style="padding: 12px; background: rgba(255,255,255,0.05); cursor: move; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: bold; font-size: 14px; display: flex; justify-content: space-between;">
            <span>Enemy Tracker <span style="font-weight:normal; font-size:10px; color:#666;">[T] to hide/show GUI</span></span>
            <span style="color: #555;">by r!PsAw</span>
        </div>
        <div style="display: flex; background: rgba(0,0,0,0.3);">
            ${['Instructions', 'Rendering', 'LiveStats', 'Doctor'].map(t => `
                <div id="tab-${t}" style="flex: 1; padding: 10px; text-align: center; cursor: pointer; font-size: 11px; border-bottom: 2px solid ${uiSettings.activeTab === t ? '#00ff88' : 'transparent'}; color: ${uiSettings.activeTab === t ? '#00ff88' : '#888'};">
                    ${t}
                </div>
            `).join('')}
        </div>
        <div id="gui-body" style="padding: 15px; max-height: 400px; overflow-y: auto;"></div>
    `;

    ['Instructions', 'Rendering', 'LiveStats', 'Doctor'].forEach(t => {
        gui.querySelector(`#tab-${t}`).onclick = () => switchTab(t);
    });

    const body = gui.querySelector('#gui-body');

    if (uiSettings.activeTab === 'Instructions') {
        body.innerHTML = `
        <h3 style="margin-top:0; color:#00ff88;">Keybinds</h3>
          <p style="font-size:13px; color:#ccc;">
            Press <b>T</b> to hide this menu.
          </p>
          <h3 style="margin-top:0; color:#00ff88;">
            Tutorial
          </h3>
          <p style="font-size:13px; color:#ccc;">
            There are 2 scripts:<br>
            1. ALT TAB<br>
            2. MAIN TAB.<br><br>
            This window uses MAIN TAB script and this is also where everything is getting rendered, so please play on this window. On every other window, you need to use
          </p>
          <b>
            ALT TAB
          </b>
          <p style="font-size:13px; color:#ccc;">
            and then die to enemies, that you want to target. If you want to target more than 1 enemy, you need to use vpn for every 2 new windows you open.
          </p>`;
    }
    else if (uiSettings.activeTab === 'Rendering') {
        body.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>Lines</span><input type="checkbox" id="check-lines" ${uiSettings.showLines ? 'checked' : ''}></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>Labels</span><input type="checkbox" id="check-text" ${uiSettings.showText ? 'checked' : ''}></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>Alive Color</span><input type="color" id="color-alive" value="${uiSettings.aliveColor}"></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>Dead Color</span><input type="color" id="color-dead" value="${uiSettings.deadColor}"></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>Line Width</span><input type="number" id="num-width" value="${uiSettings.lineWidth}" style="width:40px; background:#222; border:1px solid #444; color:white;"></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>AFK Symbol</span><input type="text" id="text-dead" value="${uiSettings.deadSymbol}" style="width:60px; background:#222; border:1px solid #444; color:white;"></div>
        `;
        body.querySelector('#check-lines').onchange = (e) => uiSettings.showLines = e.target.checked;
        body.querySelector('#check-text').onchange = (e) => uiSettings.showText = e.target.checked;
        body.querySelector('#color-alive').onchange = (e) => uiSettings.aliveColor = e.target.value;
        body.querySelector('#color-dead').onchange = (e) => uiSettings.deadColor = e.target.value;
        body.querySelector('#num-width').onchange = (e) => uiSettings.lineWidth = parseInt(e.target.value);
        body.querySelector('#text-dead').onchange = (e) => uiSettings.deadSymbol = e.target.value;
    }
    else if (uiSettings.activeTab === 'LiveStats') {
        body.innerHTML = `<div id="stats-container"></div>`;
        updateDynamicContent();
    }
    else if (uiSettings.activeTab === 'Doctor') {
        body.innerHTML = `
            <div id="doctor-stats-box" style="background:#000; padding:10px; border-radius:4px; font-family:monospace; font-size:11px; color:#00ff00; line-height:1.4;"></div>
            <button id="btn-diag" style="width:100%; margin-top:10px; padding:10px; background:#00ff88; color:black; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">RUN DIAGNOSTICS</button>
            <div id="diag-out" style="margin-top:10px; font-size:12px; font-family:monospace;"></div>
        `;
        body.querySelector('#btn-diag').onclick = runDiagnostics;
        updateDynamicContent();
    }
}

function updateDynamicContent() {
    if (!uiSettings.isOpen) return;
    const body = gui.querySelector('#gui-body');

    if (uiSettings.activeTab === 'LiveStats') {
        const container = body.querySelector('#stats-container');
        if (!container) return;
        let list = '';
        swarmData.forEach((data, id) => {
            const ping = Date.now() - data.timestamp;
            list += `<div style="padding:8px; background:rgba(255,255,255,0.05); margin-bottom:5px; border-radius:4px; font-size:12px; font-family:monospace; border-left: 3px solid ${ping > 1000 ? 'red' : '#00ff88'}">
                <b style="color:#00ff88">${id}</b>: [${Math.round(data.value.x)}, ${Math.round(data.value.y)}]<br>
                <span style="color:#666">Ping: ${ping}ms</span>
            </div>`;
        });
        container.innerHTML = list || '<p style="color:#555">Waiting for data...</p>';
    }
    else if (uiSettings.activeTab === 'Doctor') {
        const statsBox = body.querySelector('#doctor-stats-box');
        if (statsBox) {
            statsBox.innerHTML = `HOOKED: ${loaded.hook}<br>CTX_READY: ${!!ctx}<br>BASE_PTR: ${ptrs.basevalue || 'NONE'}<br>POS: ${Math.round(player_world.x)}, ${Math.round(player_world.y)}<br>FOV: ${FOV.toFixed(4)}`;
        }
    }
}
setInterval(updateDynamicContent, 500);

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 't' && e.target.tagName !== 'INPUT') {
        uiSettings.isOpen = !uiSettings.isOpen;
        gui.style.display = uiSettings.isOpen ? 'flex' : 'none';
    }
});

let isDragging = false, offset = {x:0, y:0};
gui.addEventListener('mousedown', (e) => {
    if (e.target.id === 'gui-header' || e.target.parentElement.id === 'gui-header') {
        isDragging = true;
        offset = { x: gui.offsetLeft - e.clientX, y: gui.offsetTop - e.clientY };
    }
});
document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        gui.style.left = (e.clientX + offset.x) + 'px';
        gui.style.top = (e.clientY + offset.y) + 'px';
    }
});
document.addEventListener('mouseup', () => isDragging = false);

buildGUI();

function render_loop() {
    requestAnimationFrame(render_loop);
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const now = Date.now();
    swarmData.forEach((data, id) => {
        if (now - data.timestamp > 5000) { swarmData.delete(id); return; }

        let last = previous_pos.get(id) || {x:0, y:0};
        if(last.x === data.value.x && last.y === data.value.y) {
            player_times.set(id, (player_times.get(id) || 0) + 1);
        } else {
            player_times.set(id, 0);
        }

        let isAFK = (player_times.get(id) || 0) > max_afk_time;

        if (typeof world_to_screen === "function") {
            const screen_coords = world_to_screen({x: data.value.x, y:data.value.y});
            const drawX = screen_coords.x + offset_vector.x;
            const drawY = screen_coords.y + offset_vector.y;

            if (uiSettings.showLines) {
                ctx.beginPath();
                ctx.lineWidth = uiSettings.lineWidth;
                // Switch color based on status
                ctx.strokeStyle = isAFK ? uiSettings.deadColor : uiSettings.aliveColor;
                ctx.moveTo(window.innerWidth / 2 + offset_vector.x, window.innerHeight / 2 + offset_vector.y);
                ctx.lineTo(drawX, drawY);
                ctx.stroke();
            }

            if (uiSettings.showText) {
                ctx.fillStyle = uiSettings.textColor;
                ctx.font = uiSettings.font;
                const nameText = isAFK ? uiSettings.deadSymbol : (data.value.name || id);
                ctx.fillText(nameText, drawX + 10, drawY);
            }
        }
        previous_pos.set(id, {x:data.value.x, y:data.value.y});
    });
}
render_loop();