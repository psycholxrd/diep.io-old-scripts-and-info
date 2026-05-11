// ==UserScript==
// @name         Omniscript
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  no ai was used for this and I haven't skidded anything, NX stay mad.
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// @run-at       document-start
// ==/UserScript==

//memory hook (keep this is at the very start)
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

//focus bypass (you can remove this if you don't need this)
(function() {
  window.frozenHasFocus = {
    hasFocus: () => true
  };
  document.hasFocus = () => true;
})();

//constant data
const memoryGamemodes = ['ffa', '4teams', 'teams', 'maze', 'event', 'sandbox', 'custom'];
const memoryRegions = ['fra', 'sgp', 'atl', 'sao', 'syd'];

//config
const config = {
    auto_reload: localStorage.getItem('[Omniscript] AutoReload Active') ? localStorage.getItem('[Omniscript] AutoReload Time') : true,
    loading_time: localStorage.getItem('[Omniscript] AutoReload Time') ? localStorage.getItem('[Omniscript] AutoReload Time') : 3000,
    values_from: localStorage.getItem('[Omniscript] Values from') !== undefined ? localStorage.getItem('[Omniscript] Values from') : 'MANUAL',
};

const keyBinds = {
    GUI_toggle: 'KeyV',
};

const activeScripts = {
    FOV: false,
    leaderLocator: false,
    multiBox: false,
    enemyTracker: false,
};

const FOV_config = {
    modes: ['Mousewheel', 'Tank'],
    tanks: {
        'unscaled': 1,
        'Tank': 0.4403414726257324,
        'Sniper': 0.3963072896003723,
        'Predator': 0.37429025769233704,
        'Background': 0.3499999940395355,
        'Assassin': 0.3302561044692993,
        'Ranger': 0.2862219512462616
    },
    selected_tank: 0,
    selected_mode: 0,
    fixFov: false,
};

const LeaderLocator_config = {
    minimap: {
        colors: {
            outline: 'yellow',
            player: 'blue',
            leader: 'red',
        },
        sizes: {
            outline: 2,
            player: 5,
            leader: 5
        },
        opacities: {
            outline: 1,
            player: 1,
            leader: 1,
        },
    },
    screen: {
        colors: {
            line: 'black',
            leader: 'red',
            predict: 'white',
        },
        sizes: {
            line: 3,
            leader: 10,
            predict: 10,
        },
        opacities: {
            line: 0.5,
            leader: 0.4,
            predict: 0.6,
        },
    },
    prediction_offset_factor: 50,
};

//ask user
let decision_made = false;
function decide_constant_update_type(){
    let was_asked_before = localStorage.getItem('[Omniscript] Asked before');
    if(was_asked_before === 'yes') {
        decision_made = true;
        return;
    }
    let answer = confirm(`
    Before you continue, this script is connecting to a link

    by default, to update some values. If you don't want that

    and prefer to edit it yourself, please press "Cancel".

    Otherwise by pressing "Ok" you agree that you read this

    and trust this script, let it connect to a link.
    `);
    config.values_from = answer ? 'FETCH' : 'MANUAL';
    decision_made = true;
    localStorage.setItem('[Omniscript] Asked before', 'yes');
    localStorage.setItem('[Omniscript] Values from', config.values_from);
}
decide_constant_update_type();

window.constants = undefined;
let base_index = -1;
let dynamic_addresses = {
    player_x: -1,
    player_y: -1,
    FOV: -1
};
function load_manual_val(name, placeholder = 0){
    return localStorage.getItem(`[Omniscript] ValueOf ${name}`) !== null? parseInt(localStorage.getItem(`[Omniscript] ValueOf ${name}`)) : placeholder;
}
const manual_obj = {
    baseValue: load_manual_val('baseValue', 37899),
    offsets: {
        player_pos: {
            x: load_manual_val('offsets player_pos x', 108),
            y: load_manual_val('offsets player_pos y', 117),
        },
        FOV: load_manual_val('offsets FOV', 130),
    },
    leader_pos_adr: {
        x: load_manual_val('leader_pos_adr x', 157015),
        y: load_manual_val('leader_pos_adr y', 157010),
    },
    camera_pos_adr: {
        x: load_manual_val('camera_pos_adr x', 156996),
        y: load_manual_val('camera_pos_adr y', 156992),
    },
};

function auto_update(){
    if(!decision_made) return setTimeout(auto_update, 100);
    if(config.values_from === 'MANUAL'){
        window.constants = manual_obj;
    }else{
        fetch('https://raw.githubusercontent.com/psycholxrd/MemoryData/main/data.json')
            .then(response => response.json())
            .then(data => {window.constants = data})
            .catch(error => console.error('Error fetching data:', error));
    }
}
auto_update();

// ===== ENCODER / DECODER FUNCTIONS =====
function decodeFov(encoded) {
    const dv = decodeFov._dv || (decodeFov._dv = new DataView(new ArrayBuffer(4)));
    const u = encoded >>> 0;
    const e0 = u & 255;
    const e1 = (u >>> 8) & 255;
    const e2 = (u >>> 16) & 255;
    const e3 = (u >>> 24) & 255;
    const d3 = (((e2 + Math.imul(e1, -120) - 92) ^ 165) & 255) >>> 0;
    const d2 = (((e1 + Math.imul(e0, -44) - 81) ^ 109) & 255) >>> 0;
    const d1 = (((e0 + Math.imul(e3, -49) + 58) ^ 183) & 255) >>> 0;
    const d0 = (((e3 + 192) & 255) ^ 136) & 255;
    dv.setUint32(0, (d0 | (d1 << 8) | (d2 << 16) | (d3 << 24)) >>> 0, true);
    return dv.getFloat32(0, true);
}

function encodeFov(value) {
    const dv = encodeFov._dv || (encodeFov._dv = new DataView(new ArrayBuffer(4)));
    const mod256 = (n) => n & 255;
    dv.setFloat32(0, Math.fround(value), true);
    const raw = dv.getUint32(0, true) >>> 0;
    const d0 = raw & 255;
    const d1 = (raw >>> 8) & 255;
    const d2 = (raw >>> 16) & 255;
    const d3 = (raw >>> 24) & 255;
    const p0 = d0 ^ 136;
    const e3 = mod256(p0 - 192);
    const e0 = mod256((d1 ^ 183) - 58 + Math.imul(e3, 49));
    const e1 = mod256((d2 ^ 109) + Math.imul(e0, 44) + 81);
    const e2 = mod256((d3 ^ 165) + Math.imul(e1, 120) + 92);
    return (e0 | (e1 << 8) | (e2 << 16) | (e3 << 24)) >>> 0;
}
window.encode = encodeFov;
window.decode = decodeFov;

// =======================================

//auto reload
function didImportantMemoryObjectsLoad(){
    return (
        window.__wasm_HEAPU8 !== undefined &&
        window.__wasm_HEAP32 !== undefined &&
        window.__wasm_HEAPF32 !== undefined &&
        window.__wasm_HEAPU32 !== undefined
    );
}

setTimeout(() => {
    //console.log('conditions: ', config.auto_reload, !didImportantMemoryObjectsLoad()); //debug
    if(config.auto_reload && !didImportantMemoryObjectsLoad()){
        alert('memory was not hooked, reloading page...\nIf you want to disable auto reloading, visit the Script Settings.');
        window.location.reload();
    };
}, config.loading_time);

//helper functions
const distance = (point1, point2) => Math.hypot(point2.x - point1.x, point2.y - point1.y);
function isConnected(){
    return document.querySelector("#copy-party-link") !== null;
};

function doesDecoderWork(){
    return true;
};

function doesEncoderWork(){
    return true;
};

let player_coords_check_passed = false;
function getPlayerWorldPos(){
    if(!player_coords_check_passed){ //check if everything works, before using it
        if(dynamic_addresses.player_x === -1 || dynamic_addresses.player_y === -1) return {x: null, y: null}; //check if addresses even exist
        if(!doesDecoderWork() || !doesEncoderWork()) return {x: null, y: null}; //check decoder, encoder functions
        player_coords_check_passed = true;
    };
    return {
        x: decodeFov(window.__wasm_HEAPU32[dynamic_addresses.player_x]),
        y: decodeFov(window.__wasm_HEAPU32[dynamic_addresses.player_y])
    };
};

let fov_check_passed = false;
function getFov(){
    if(!fov_check_passed){
        if(dynamic_addresses.FOV === -1) return null; //check if address exists
        if(!doesDecoderWork() || !doesEncoderWork()) return null; //check decoder, encoder functions
        fov_check_passed = true;
    };
    return decodeFov(window.__wasm_HEAPU32[dynamic_addresses.FOV]);
};

function getWindowScale(){
    return Math.max(window.innerWidth / 1920, window.innerHeight / 1080);
};

function worldToScreenPosition(x, y) {
    const playerPosition = getPlayerWorldPos();
    const fov = getFov();
    if (!playerPosition || playerPosition.x === null || playerPosition.y === null || fov === null) return [1, 1];
    const deltaX = x - playerPosition.x;
    const deltaY = y - playerPosition.y;
    let screenX, screenY;
    const scaleFactor = (getWindowScale() * fov);
    screenX = window.innerWidth / 2 + (deltaX * scaleFactor);
    screenY = window.innerHeight / 2 + (deltaY * scaleFactor);
    return {
        x: screenX,
        y: screenY
    };
}

let ll_check_passed = false;
function getLeaderWorldPos(){
    if(!ll_check_passed){
        if(window.constants === undefined || window.constants.leader_pos_adr === undefined) return {x: null, y: null}; //constants need to be loaded!
        if(!doesDecoderWork() || !doesEncoderWork()) return {x: null, y: null}; //check decoder, encoder functions
        ll_check_passed = true;
    }
    return {
        x: decodeFov(window.__wasm_HEAPU32[window.constants.leader_pos_adr.x]),
        y: decodeFov(window.__wasm_HEAPU32[window.constants.leader_pos_adr.y])
    };
};

let camera_check_passed = false;
function getCameraWorldPos(){
    if(!camera_check_passed) {
        if(window.constants === undefined || window.constants.camera_pos_adr === undefined) return {x: null, y: null}; //constants need to be loaded!
        camera_check_passed = true;
    };
    return {
        x: window.__wasm_HEAPF32[window.constants.camera_pos_adr.x],
        y: window.__wasm_HEAPF32[window.constants.camera_pos_adr.y]
    };
};

function getCameraScreenPos(){
    const cameraWorld = getCameraWorldPos();
    if(Object.values(cameraWorld).includes(null)) return {x: null, y: null};
    return worldToScreenPosition(cameraWorld.x, cameraWorld.y);
};

function getCameraOffset(){
    const cameraScreen = getCameraScreenPos();
    if(Object.values(cameraScreen).includes(null)) return {x: null, y: null};
    return {
        x: window.innerWidth - cameraScreen.x,
        y: -cameraScreen.y
    };
};

function worldToTrueScreenPosition(x, y){
    const screenPos = worldToScreenPosition(x, y);
    if(Object.values(screenPos).includes(null)) return {x: null, y: null};
    const offset = getCameraOffset();
    if(Object.values(offset).includes(null)) return {x: null, y: null};
    return {
        x: screenPos.x + offset.x,
        y: screenPos.y + offset.y
    };
};

function float32ToHex(floatValue) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, floatValue, false);
    const intValue = view.getUint32(0, false);
    return "0x" + intValue.toString(16).padStart(8, '0').toUpperCase();
}

function findAddresses(value, heap){
    if(heap === undefined) throw new Error('undefined HEAP');
    const results = [];
    let last = heap.indexOf(value);
    while(last !== -1){
        results.push(last);
        last++;
        last = heap.indexOf(value, last);
    };
    return results;
}

function findAddressesInLast(value, heap, lastAddresses){
    const results = [];
    for(let i = 0; i < lastAddresses.length; i++){
        let address = lastAddresses[i];
        if(heap[address] === value) results.push(address);
    }
    return results;
}

function findIntervalAddresses(from, to, heap){
    if(heap === undefined) throw new Error('undefined HEAP');
    if(from > to) throw new Error('are you a dumbass...?');
    const results = []; //let's keep it simple...
    for(let i = 0; i < heap.length; i++){
        if(from < heap[i] && heap[i] < to) results.push(i);
    }
    return results;
}

function findIntervalAddressesInLast(from, to, heap, lastAddresses){
    const results = [];
    for(let i = 0; i < lastAddresses.length; i++){
        let address = lastAddresses[i];
        if(from < heap[address] && heap[address] < to) results.push(address);
    }
    return results;
}

function readStringAt(adr, maxLen = 20) {
  const heapu8 = window.__wasm_HEAPU8;
  if (adr <= 0 || adr >= heapu8.length) return "";
  let end = adr;
  const maxEnd = Math.min(heapu8.length, adr + maxLen);
  while (end < maxEnd && heapu8[end] !== 0) {
    end++;
  }
  return new TextDecoder("utf-8").decode(heapu8.subarray(adr, end));
}

function findStringAddresses(string){
    const heap = window.__wasm_HEAPU8;
    const ascii_arr = string.split('').map(x=>x.charCodeAt(0)); // 'eee' -> ['e', 'e', 'e'] -> [69, 69, 69]
    //optimised search made by me
    const candidates = findAddresses(ascii_arr[0], heap);
    const results = [];
    for(let candidate of candidates){
        let valid = true;
        for(let i = 0; i < ascii_arr.length; i++){
            if(heap[candidate+i] !== ascii_arr[i]){
                valid = false;
                break //quit for loop
            }
        }
        if(valid) results.push(candidate); //if quitted, then invalid
    }
    return results; //always address of first string character btw
}

/* OLD inconsistent
function getGamemodeAddress(){
    for(let gamemodeString of memoryGamemodes){
        const patternString = '\x01' + gamemodeString + '\x00';
        const results = findStringAddresses(patternString);
        if(results.length === 1) return results[0]+1;
    };
    return -1;
};

function getCurrentGamemode(){
    const address = getGamemodeAddress();
    if(address === -1) return 'Not found';
    return readStringAt(address);
};


function getRegionAddress(){
    for(let regionString of memoryRegions){
        const patternString = '\x05' + regionString + '\x00';
        const results = findStringAddresses(patternString);
        if(results.length === 1) return results[0]+1;
    };
    return -1;
};


function getCurrentRegion(){
    const address = getRegionAddress();
    if(address === -1) return 'Not found';
    return readStringAt(address);
};
*/

/* NEW (local storage based)*/
function getCurrentGamemode(){
    return localStorage.getItem('selected_gamemode');
};

function getCurrentRegion(){
    return localStorage.getItem('region_selected');
};

function getPlayerInfoAddress(){
    const results = findStringAddresses('Lvl ');
    for(let result of results){
        const resultAsString = readStringAt(result);
        if(resultAsString.includes('%')) continue;
        return result; //there are 2 identical ones, so we just take the first one
    };
};

function getPlayerLvl(){
    const infoAddress = getPlayerInfoAddress();
    const info = readStringAt(infoAddress);
    return parseInt(info.split(' ')[1]);
};

function getPlayerTank(){
    const infoAddress = getPlayerInfoAddress();
    const info = readStringAt(infoAddress);
    return info.split(' ')[2];
};

function unnest(obj, prefix=''){
    if(typeof obj != 'object' || obj === null){
        return prefix;
    }
    const keys = Object.keys(obj);
    let arr = [];
    for(let key of keys){
        let next = obj[key];
        let final_key = unnest(next, prefix+' '+key);
        arr.push(final_key);
        if(final_key instanceof Array){
            arr = arr.flat(1);
        }
    }
    return arr;
}

function unnested_values(obj, unnested){
    const values = [];
    for(let path of unnested){
        let target = obj;
        //console.log('initial object', obj);
        //console.log('his keys', Object.keys(obj));
        let keys = path.split(' ');
        for(let i = 1; i < keys.length; i++){
            let prop = keys[i];
            //console.log('checking key', prop);
            target = target[prop];
            //console.log('what we got', target);
        };
        values.push(target);
    };
    return values;
};

//define dynamic addresses
function dynamic_define(){
    if(window.constants === undefined || window.__wasm_HEAPU32 === undefined) return setTimeout(dynamic_define, 100);
    if(base_index === -1){
        base_index = window.__wasm_HEAPU32.indexOf(window.constants.baseValue)
        console.log('searching...');
        return setTimeout(dynamic_define, 100);
    }else{
        dynamic_addresses.player_x = base_index + window.constants.offsets.player_pos.x;
        dynamic_addresses.player_y = base_index + window.constants.offsets.player_pos.y;
        dynamic_addresses.FOV = base_index + window.constants.offsets.FOV;
        console.log('success!', dynamic_addresses);
    }
}
dynamic_define();

//define your key
let unique_key;
function defineKey(){
    console.log('defining key...');
    unique_key = undefined; //reset
    if(!isConnected()) return setTimeout(defineKey, 100);
    const gamemode = getCurrentGamemode();
    const region = getCurrentRegion();
    if(gamemode === 'Not found' || region === 'Not found') return setTimeout(defineKey, 100);
    unique_key = gamemode + '-' + region;
    console.log('key defined!', unique_key);
};
defineKey();

//communication between tabs
const channel = new BroadcastChannel('Omniscript Leaderdata');
const alt_leaderWorldPos = {x: 1, y: 1};

//reciever
channel.onmessage = (event) => {
    const { key, leader } = event.data;
    if (key === unique_key) {
        console.log('Received data for my server:', leader);
        alt_leaderWorldPos.x = leader.x;
        alt_leaderWorldPos.y = leader.y;
    } else {
        console.log('Data from a different server');
    }
};

//sender
let sender = true;
window.activate_sender = () => {sender = true};
window.deactivate_sender = () => {sender = false};
setInterval(() => {
    if (!activeScripts.leaderLocator) return;

    if (sender) {
        const leaderWorld = getLeaderWorldPos();

        // Ensure data is valid before sending
        if (leaderWorld.x !== null && unique_key !== undefined) {
            channel.postMessage({
                key: unique_key,
                leader: leaderWorld
            });
        }
    }
}, 100);

//arenaData
const arenaRadius = 11149.998046875;
const arenaData = { // not supporting sandbox right now
    width: arenaRadius * 2,
    height: arenaRadius * 2,
};

//minimapData
const minimapData = {
    x: null,
    y: null,
    width: null,
    height: null
};

//canvas
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

//canvas hook (for minimap detection)
const methods = ['beginPath', 'lineTo', 'drawImage'];
const originalMethods = [];
const lines = [];

function hookCanvas(){
    if(originalMethods.length > 0) return console.warn('Cancelled hook, already hooked!'); //already hooked
    for(let method of methods){
        const method_obj = {
            name: method,
            method: CanvasRenderingContext2D.prototype[method],
        };
        originalMethods.push(method_obj);
        CanvasRenderingContext2D.prototype[method] = new Proxy(CanvasRenderingContext2D.prototype[method], {
            apply: function(target, thisArgs, args) {
                switch(method){
                    case 'beginPath':
                        lines.length = 0; //on new path reset lines
                        break;
                    case 'lineTo':
                        lines.push(args);
                        break;
                    case 'drawImage':
                        if(
                            thisArgs.fillStyle === '#cdcdcd' &&
                            lines.length === 4 &&
                            lines[0][0] === lines[1][0] &&
                            lines[2][0] === lines[3][0]
                        ){
                            //lines[3] is left upper corner
                            minimapData.x = lines[3][0];
                            minimapData.y = lines[3][1];
                            minimapData.width = lines[0][0] - lines[3][0]; // right_upper_corner.x - left_upper_corner.x
                            minimapData.height = lines[2][1] - lines[3][1]; //left_bottom_corner.y - left_upper_corner.y (because Y axis is reversed)
                            //console.log(minimapData);
                        }
                        break;
                };
                return Reflect.apply(target, thisArgs, args);
            }
        });
    };
};

hookCanvas();

function unhookCanvas(){
    if(originalMethods.length === 0) return console.warn('Cancelled, canvas is not hooked!'); //not hooked yet
    for(let method_obj of originalMethods){
        CanvasRenderingContext2D.prototype[method_obj.name] = method_obj.method;
    };
    originalMethods.length = 0; //clean up
};

function worldPosToMinimap(x, y) {
    if(Object.values(minimapData).includes(null)) return {x: null, y: null};

    const scaleX = minimapData.width / arenaData.width;
    const scaleY = minimapData.height / arenaData.height;

    const minimapCenterX = minimapData.x + (minimapData.width / 2);
    const minimapCenterY = minimapData.y + (minimapData.height / 2);

    return {
        x: minimapCenterX + (x * scaleX),
        y: minimapCenterY + (y * scaleY)
    };
}

//render
const rendering_settings = {
    FPS: 60,
    active: true,
    interval: undefined
};

const leader_world_pos = {x: 1, y: 1};
function render(){
    if(!ctx || ctx === null || !rendering_settings.active) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    //Leader Locator
    const playerWorldPos = getPlayerWorldPos(); //since multiple scripts use this, I'm gonna put it here
    if(activeScripts.leaderLocator){
        if(Object.values(minimapData).includes(null)) return;

        //drawing minimap outline
        ctx.beginPath();
        ctx.strokeStyle = LeaderLocator_config.minimap.colors.outline;
        ctx.lineWidth = LeaderLocator_config.minimap.sizes.outline;
        ctx.globalAlpha = LeaderLocator_config.minimap.opacities.outline;
        ctx.strokeRect(...Object.values(minimapData));

        //drawing player
        if(!Object.values(playerWorldPos).includes(null)){
            //on minimap
            const playerMinimapPos = worldPosToMinimap(...Object.values(playerWorldPos));
            ctx.beginPath();
            ctx.fillStyle = LeaderLocator_config.minimap.colors.player;
            ctx.globalAlpha = LeaderLocator_config.minimap.opacities.player;
            ctx.arc(playerMinimapPos.x, playerMinimapPos.y, LeaderLocator_config.minimap.sizes.player, Math.PI * 2, 0);
            ctx.fill();
        }

        //drawing leader
        const leaderWorldPos = getLeaderWorldPos();
        if(!Object.values(leaderWorldPos).includes(null)){
            const dist = distance(leaderWorldPos, playerWorldPos);
            if(dist <= 3000){
                sender = false;
                leaderWorldPos.x = alt_leaderWorldPos.x;
                leaderWorldPos.y = alt_leaderWorldPos.y;
            }else{
                sender = true;
            }
            const diff = {
                x: (leaderWorldPos.x - leader_world_pos.x) * LeaderLocator_config.prediction_offset_factor,
                y: (leaderWorldPos.y - leader_world_pos.y) * LeaderLocator_config.prediction_offset_factor,
            };
            const predictedWorldPos = {
                x: leaderWorldPos.x + diff.x,
                y: leaderWorldPos.y + diff.y,
            };
            const predictedScreen = worldToTrueScreenPosition(...Object.values(predictedWorldPos));
            //on minimap
            const leaderMinimapPos = worldPosToMinimap(...Object.values(leaderWorldPos));
            ctx.beginPath();
            ctx.fillStyle = LeaderLocator_config.minimap.colors.leader;
            ctx.globalAlpha = LeaderLocator_config.minimap.opacities.leader;
            ctx.arc(leaderMinimapPos.x, leaderMinimapPos.y, LeaderLocator_config.minimap.sizes.player, Math.PI * 2, 0);
            ctx.fill();
            //on map
            const leaderScreen = worldToTrueScreenPosition(...Object.values(leaderWorldPos));
            const offset = getCameraOffset();
            const playerScreen = {
                x: (window.innerWidth/2) + offset.x,
                y: (window.innerHeight/2) + offset.y
            };
            if(!Object.values(playerScreen).includes(null) && !Object.values(leaderScreen).includes(null)){
                //the line
                ctx.beginPath();
                ctx.strokeStyle = LeaderLocator_config.screen.colors.line;
                ctx.lineWidth = LeaderLocator_config.screen.sizes.line;
                ctx.globalAlpha = LeaderLocator_config.screen.opacities.line;
                ctx.moveTo(...Object.values(playerScreen));
                ctx.lineTo(...Object.values(leaderScreen));
                ctx.stroke();

                //the circle
                ctx.beginPath();
                ctx.fillStyle = LeaderLocator_config.screen.colors.leader;
                ctx.globalAlpha = LeaderLocator_config.screen.opacities.leader;
                ctx.arc(...Object.values(leaderScreen), LeaderLocator_config.screen.sizes.leader, Math.PI * 2, 0);
                ctx.fill();

                //prediction circle
                ctx.beginPath();
                ctx.fillStyle = LeaderLocator_config.screen.colors.predict;
                ctx.globalAlpha = LeaderLocator_config.screen.opacities.predict;
                ctx.arc(...Object.values(predictedScreen), LeaderLocator_config.screen.sizes.predict, Math.PI * 2, 0);
                ctx.fill();
            }
            //save last leader pos
            leader_world_pos.x = leaderWorldPos.x;
            leader_world_pos.y = leaderWorldPos.y;
        }
    }
};

function disable_rendering(){
    clearInterval(rendering_settings.interval)
    rendering_settings.interval = undefined;
    rendering_settings.active = false;
};

function enable_rendering(){
    if(rendering_settings.interval !== undefined){
        clearInterval(rendering_settings.interval)
        rendering_settings.interval = undefined;
    }
    rendering_settings.interval = setInterval(render, 1000 / rendering_settings.FPS);
    rendering_settings.active = true;
};

if(rendering_settings.active) enable_rendering(); //if you have it on by default, you should trigger the function to start it

//FOV
let modifiedFov = 0.55;
function toggleFov() {
    activeScripts.fov = !activeScripts.fov;
};

function toggleFixed(){
    FOV_config.fixFov = !FOV_config.fixFov;
};

function changeFovMode(){
    const len = Object.keys(FOV_config.modes).length;
    FOV_config.selected_mode = (FOV_config.selected_mode + 1) % len;
};

function changeFovTank(){
    const len = Object.keys(FOV_config.tanks).length;
    FOV_config.selected_tank = (FOV_config.selected_tank + 1) % len;
};

function overwriteFov(){
    if(!activeScripts.fov || getFov() === null) return;
    const heap = window.__wasm_HEAPU32;
    const tanks = Object.keys(FOV_config.tanks);
    const tank = tanks[FOV_config.selected_tank];
    const tankFov = FOV_config.tanks[tank];
    if(FOV_config.fixFov) heap[dynamic_addresses.FOV] = encodeFov(modifiedFov);
    if(FOV_config.selected_mode === 1) heap[dynamic_addresses.FOV] = encodeFov(tankFov);
}
setInterval(overwriteFov, 100);

window.printFov = () => console.log(decodeFov(window.__wasm_HEAPU32[dynamic_addresses.FOV]));
const onWheel = e => {
    if (!window.__wasm_HEAPU32 || dynamic_addresses.FOV === -1 || !activeScripts.fov || FOV_config.selected_mode !== 0) return;
    const heap = window.__wasm_HEAPU32;
    const cur = getFov();
    if(cur === null) return;
    const next = e.deltaY > 0 ? (cur * 1.05) : (cur * 0.95);
    modifiedFov = next;
    heap[dynamic_addresses.FOV] = encodeFov(next);
};

document.addEventListener("wheel", onWheel, { passive: true });

//GUI
let savedPalette = localStorage.getItem('[Omniscript] default theme');
let activePalette = savedPalette !== null ? parseInt(savedPalette) : 0;
const colorPalettes = [
    ['#111F35', '#8A244B', '#D02752', '#F63049'],
    ['#640D5F', '#D91656', '#EB5B00', '#FFB200'],
    ['#4F200D', '#FF9A00', '#FFD93D', '#F6F1E9'],
    ['#0B2D72','#0992C2','#0AC4E0','#F6E7BC'],
    ['#4300FF','#0065F8','#00CAFF','#00FFDE'],
    ['#A02334','#FFAD60','#FFEEAD','#96CEB4'],
    ['#1B211A','#628141','#8BAE66','#EBD5AB']
];
let colorPalette = colorPalettes[activePalette];
const main_display = 'block';
const baseZindex = 99;

let cursor_over_gui = false;

//some element templates
class Wrapper{
    constructor(flex_direction, width, height, justifyContent, alignItems, color = 'white'){
        this.flex_direction = flex_direction;
        this.width = width;
        this.height = height;
        this.color = color;
        this.justifyContent = justifyContent;
        this.alignItems = alignItems;
        //element creation
        let element = document.createElement('div');
        let style = element.style;
        style.backgroundColor = this.color;
        style.display = 'flex';
        style.flexDirection = this.flex_direction;
        style.width = this.width;
        style.height = this.height;
        style.justifyContent = this.justifyContent;
        style.alignItems = this.alignItems;
        this.element = element;
    }
}

class ScrollWrapper extends Wrapper{
    constructor(flex_direction, width, height, justifyContent, alignItems, color = 'white'){
        super(flex_direction, width, height, justifyContent, alignItems, color);
        this.element.style.borderRadius = '3px';
        this.element.style.border = `3px solid ${colorPalette[2]}`;
        this.element.style.overflow = 'auto';
        this.element.style.scrollbarColor = `${colorPalette[3]} ${colorPalette[1]}`;
    }
};

class Title{
    constructor(text){
        this.text = text;
        //element creation
        let element = document.createElement('div');
        let style = element.style;
        element.innerText = this.text;
        style.display = 'block';
        style.fontSize = '3vh';
        style.color = colorPalette[1];
        style.width = 'auto';
        style.height = 'auto';
        style.margin = '5px';
        style.zIndex = baseZindex+1;
        this.element = element;
    };
};

class TextField{
    constructor(pre_text){
        let element = document.createElement('input');
        let style = element.style;
        element.type = 'text';
        element.placeholder = pre_text;
        style.margin = '5px';
        style.color = colorPalette[2];
        style.width = "auto";
        style.height = "auto";
        style.backgroundColor = colorPalette[0];
        style.borderRadius = '3px';
        style.border = `3px solid ${colorPalette[2]}`;
        this.element = element;
    };
};

class NumberField extends TextField{
    constructor(number){
        super(number);
        this.element.type = 'number';
    };
};

//Categories

const categories = [];

function deactivateOtherCategories(_this){
    for(let category of categories){
        if(category === _this) continue;
        if(category.active) category.toggle(false);
    }
}

class Category{
    constructor(name, elements, displayWrapper){
        this.active = false;
        this.name = name;
        this.elements = elements;
        this.displayWrapper = displayWrapper.element;
        //element creation (on the side)
        let textElement = document.createElement('p');
        textElement.innerText = this.name;
        textElement.style.textAlign = 'center';
        let element = document.createElement('div');
        let style = element.style;
        style.margin = '5%';
        style.alignItems = 'center';
        style.justifyContent = 'center';
        style.fontSize = '2vh';
        style.width = '85%';
        style.height = '10%';
        style.color = colorPalette[1];
        style.backgroundColor = colorPalette[0];
        style.borderRadius = '20px';
        style.border = `3px solid ${colorPalette[2]}`;
        element.appendChild(textElement);
        this.element = element;
        this.textElement = textElement;
        //event listeners
        const applyStyle = (i1, i2, i3) => {
            style.backgroundColor = colorPalette[i1];
            style.border = `3px solid ${colorPalette[i2]}`;
            style.color = colorPalette[i3];
        };
        const styleArgs = {
            inactive: {
                over: [0, 1, 2],
                out: [0, 2, 1],
            },
            active: {
                over: [3, 2, 2],
                out: [2, 1, 1],
            },
        };
        element.addEventListener('mouseover', (e) => {
            let key = this.active ? 'active' : 'inactive';
            applyStyle(...styleArgs[key].over);
            style.cursor = 'pointer';
        });
        element.addEventListener('mouseout', (e) => {
            let key = this.active ? 'active' : 'inactive';
            applyStyle(...styleArgs[key].out);
            style.cursor = 'default';
        });
        element.addEventListener('mousedown', (e) => {
            this.toggle();
        });
    };
    loadElements(){
        for(let element of this.elements){
            this.displayWrapper.appendChild(element);
        }
    }
    unloadElements(){
        for(let element of this.elements){
            this.displayWrapper.removeChild(element);
        }
    }
    toggle(fromClick = true){
        const applyStyle = (i1, i2, i3) => {
            let style = this.element.style;
            style.backgroundColor = colorPalette[i1];
            style.border = `3px solid ${colorPalette[i2]}`;
            style.color = colorPalette[i3];
        };
        const styleArgs = {
            inactive: {
                over: [0, 1, 2],
                out: [0, 2, 1],
            },
            active: {
                over: [3, 2, 2],
                out: [2, 1, 1],
            },
        };
        this.active = !this.active;
        let key = this.active ? 'active' : 'inactive';
        let key2 = fromClick ? 'over' : 'out';
        applyStyle(...styleArgs[key][key2]);
        if(this.active){
            deactivateOtherCategories(this);
            this.loadElements();
        }else{
            this.unloadElements();
        }
    }
};

let pointer_shift = 0;
let pointer_offset = 0;
let warned = false;

function createScriptSettingsElements(ScriptSettingsElements){
    //title
    const title = new Title('GUI settings');
    const title1 = new Title('Keybinds');
    const title2 = new Title('Auto reload page');
    const title3 = new Title('Constants');
    //helper function
    const create_text = (txt, color = colorPalette[2]) => {
        const text = document.createElement('p');
        text.innerText = txt;
        text.style.width = 'auto';
        text.style.fontSize = '90%';
        text.style.margin = '3px';
        text.style.color = color;
        text.style.overflowWrap = 'anywhere';
        text.style.textAlign = 'center';
        return text;
    };
    const create_button = (text, callback = ()=>{}, args = []) => {
        const button = document.createElement('div');
        const txt = create_text(text);
        button.appendChild(txt);
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.margin = '5px';
        button.style.color = colorPalette[2];
        button.style.width = "auto";
        button.style.height = "auto";
        button.style.backgroundColor = colorPalette[0];
        button.style.borderRadius = '3px';
        button.style.border = `3px solid ${colorPalette[2]}`;
        button.addEventListener('mousedown', (e) => callback(...args));
        button.addEventListener('mouseover', (e) => {
            button.style.border = `3px solid ${colorPalette[3]}`;
            button.style.color = colorPalette[3];
            button.style.cursor = 'pointer';
        });
        button.addEventListener('mouseout', (e) => {
            button.style.border = `3px solid ${colorPalette[2]}`;
            button.style.color = colorPalette[2];
            button.style.cursor = 'default';
        });
        return button;
    };
    const create_toggle_button = (text, state = 'inactive') => {
        const btn = create_button(text);
        if(state === 'active'){
            btn.children[0].style.color = colorPalette[1];
            btn.style.backgroundColor = colorPalette[2];
        };
        btn.value = state;
        btn.style.display = 'block';
        btn.addEventListener('mousedown', (e) => {
            switch(btn.value){
                case 'inactive':
                    btn.value = 'active';
                    btn.children[0].style.color = colorPalette[1];
                    btn.style.backgroundColor = colorPalette[2];
                    break;
                case 'active':
                    btn.value = 'inactive';
                    btn.children[0].style.color = colorPalette[2];
                    btn.style.backgroundColor = colorPalette[0];
                    break;
                default:
                    btn.value = 'active';
                    btn.children[0].style.color = colorPalette[1];
                    btn.style.backgroundColor = colorPalette[2];
            };
        });
        return btn;
    };
    const create_palette_row = (i) => {
        if(colorPalettes.length <= i) return alert('invalid Theme!');
        const chosen = (i === activePalette);
        const row_wrapper = new Wrapper('row', '95%', '20%', 'space-between', 'center', chosen ? colorPalette[3] : colorPalette[1]);
        row_wrapper.element.style.margin = '4px';
        row_wrapper.element.style.padding = '4px';

        const colorbox_wrapper = new Wrapper('row', '50%', '100%', 'space-around', 'center', colorPalette[0]);
        const create_colorbox = (color) => {
            const el = document.createElement('div');
            const style = el.style;
            style.width = '2vh';
            style.height = '2vh';
            style.backgroundColor = color;
            style.borderRadius = '3px';
            style.border = '3px solid white';
            return el;
        };
        for(let color of colorPalettes[i]){
            colorbox_wrapper.element.appendChild(create_colorbox(color));
        };
        const select_btn = create_button('select', () => changePalette(i));
        const set_default_btn = create_button('set as default', () => localStorage.setItem('[Omniscript] default theme', i));
        row_wrapper.element.appendChild(colorbox_wrapper.element);
        row_wrapper.element.appendChild(set_default_btn);
        row_wrapper.element.appendChild(select_btn);
        return row_wrapper;
    };
    const create_keybind_row = (name) => {
        const changeKeyBind = (key) => {keyBinds[name] = key};
        const btnStates = ['Idle', 'Listening'];
        let currentState = 0;
        const nextState = (button) => {
            currentState = (currentState + 1) % btnStates.length;
            button.value = btnStates[currentState];
            switch(currentState) {
                case 0:
                    button.children[0].innerText = keyBinds[name];
                    break;
                case 1:
                    button.children[0].innerText = 'Listening...';
                    break;
            };
        };
        const row = new Wrapper('row', '95%', '40%', 'space-between', 'center', colorPalette[1]);
        row.element.style.margin = '4px';
        row.element.style.padding = '4px';
        const description = create_text(name);
        const btn = create_button(keyBinds[name]);
        btn.value = btnStates[currentState];
        btn.addEventListener('mousedown', (e) => {
            nextState(btn);
        });
        document.addEventListener('keydown', (e) => {
            if(currentState === 1){
                changeKeyBind(e.code);
                nextState(btn);
            };
        });
        row.element.appendChild(description);
        row.element.appendChild(btn);
        return row;
    };
    //actual elements
    const themes_wrapper = new ScrollWrapper('column', '75%', '25%', 'stretch', 'center', 'transparent');
    const themes_title = new Title('select Theme:');
    themes_title.element.style.fontSize = '2vh';
    themes_wrapper.element.appendChild(themes_title.element);
    for(let i = 0; i < colorPalettes.length; i++){
        const row = create_palette_row(i);
        themes_wrapper.element.appendChild(row.element);
    }
    //keybinds
    const keybinds_wrapper = new ScrollWrapper('column', '75%', '10%', 'stretch', 'center', 'transparent');
    for(let name in keyBinds){
        const row = create_keybind_row(name);
        keybinds_wrapper.element.appendChild(row.element);
    }
    //auto reload
    const toggle_auto_reload = () => {
        config.auto_reload = !config.auto_reload;
        localStorage.setItem('[Omniscript] AutoReload Active', config.auto_reload)
    };
    const auto_reload_wrapper = new Wrapper('row', '75%', '5%', 'center', 'center', 'transparent');
    const auto_reload_btn = create_toggle_button(config.auto_reload ? 'Disable Auto Reload' : 'Enable Auto Reload', config.auto_reload ? 'active' : 'inactive');
    auto_reload_btn.addEventListener('mousedown', (e) => {
        toggle_auto_reload();
        auto_reload_btn.children[0].innerText = config.auto_reload ? 'Disable Auto Reload' : 'Enable Auto Reload';
    });
    const auto_reload_time = new NumberField();
    auto_reload_time.element.value = config.loading_time;
    auto_reload_time.element.addEventListener('input', (e) => {
        if(auto_reload_time.element.value.length > 0){
            config.loading_time = parseInt(auto_reload_time.element.value);
            localStorage.setItem('[Omniscript] AutoReload Time', config.loading_time);
        }
    });
    auto_reload_wrapper.element.appendChild(auto_reload_btn);
    auto_reload_wrapper.element.appendChild(auto_reload_time.element);
    let placeholder3 = create_button('change basevalue', () => {
        alert('add logic here lol');
    });
    //constants
    const create_row = (type, wrapper, name, val) => {
        //wrapper
        const row = new Wrapper('row', '95%', '20%', 'space-between', 'center', colorPalette[1]);
        row.element.style.margin = '4px';
        row.element.style.padding = '4px';
        //values
        const text = create_text(name);
        let value;
        //console.log('passed arg name', name);
        //console.log(val);
        switch(type) {
            case 'MANUAL':
                value = new NumberField().element;
                value.value = val;
                value.addEventListener('input', (e) => {
                    if(value.value.length > 0){
                        localStorage.setItem(`[Omniscript] ValueOf ${name}`, parseInt(value.value));
                    };
                });
                row.element.appendChild(text);
                row.element.appendChild(value);
                wrapper.element.appendChild(row.element);
                break;
            case 'FETCH':
                value = create_text(val);
                row.element.appendChild(text);
                row.element.appendChild(value);
                wrapper.element.appendChild(row.element);
                break
        };
    };
    const create_deep_row = (type, wrapper, key) => {
        const obj = window.constants[key];
        const unnested = unnest(obj, key);
        const unnested_vals = unnested_values(obj, unnested);
        //console.log(unnested, unnested_vals);
        for(let i = 0; i < unnested.length; i++){
            const name = unnested[i];
            const val = unnested_vals[i];
            //console.log('deep name', name);
            create_row(type, wrapper, name, val);
        };
    };
    const create_constants_rows = (type, wrapper) => {
        if(window.constants === undefined) return setTimeout(() => create_constants_rows(type, wrapper), 100);
        if(!(wrapper instanceof Wrapper)) return alert('This should not happen! Create_constants_rows');
        for(let key in window.constants){
            //console.log('omfg', window.constants[key]);
            if(!(Number.isInteger(window.constants[key])) && window.constants[key] !== null){
                //console.log('deep key??', key);
                create_deep_row(type, wrapper, key);
                continue;
            };
            //console.log('normal name', key);
            create_row(type, wrapper, key, window.constants[key]);
        }
    };

    //manual
    const manual_wrapper = new ScrollWrapper('column', '75%', '25%', 'flex-start', 'center', 'transparent');
    create_constants_rows('MANUAL', manual_wrapper);

    //fetch
    const fetch_wrapper = new ScrollWrapper('column', '75%', '25%', 'flex-start', 'center', 'transparent');
    create_constants_rows('FETCH', fetch_wrapper);

    //choose
    switch(config.values_from){
        case 'MANUAL':
            manual_wrapper.element.style.display = 'flex';
            fetch_wrapper.element.style.display = 'none';
            break;
        case 'FETCH':
            manual_wrapper.element.style.display = 'none';
            fetch_wrapper.element.style.display = 'flex';
            break;
    };

    //switch between MANUAL and fetch
    const switch_type_btn = create_button(config.values_from);
    const switch_type = () => {
        switch(config.values_from){
            case 'MANUAL':
                config.values_from = 'FETCH';
                manual_wrapper.element.style.display = 'none';
                fetch_wrapper.element.style.display = 'flex';
                break
            case 'FETCH':
                config.values_from = 'MANUAL';
                manual_wrapper.element.style.display = 'flex';
                fetch_wrapper.element.style.display = 'none';
                break
        };
        localStorage.setItem('[Omniscript] Values from', config.values_from);
        switch_type_btn.children[0].innerText = config.values_from;
        auto_update();
    };
    switch_type_btn.addEventListener('mousedown', switch_type);

    //save
    const settings_elements = [title.element, themes_wrapper.element, title1.element, keybinds_wrapper.element, title2.element, auto_reload_wrapper.element, title3.element, switch_type_btn, manual_wrapper.element, fetch_wrapper.element];
    settings_elements.forEach((el) => ScriptSettingsElements.push(el));
}

function createMemoryViewerElements(memoryViewerElements){
    //heap logic
    const loaded = didImportantMemoryObjectsLoad();
    if(!loaded) {
        return setTimeout(() => createMemoryViewerElements(memoryViewerElements), 100);
    }
    const heaps = [window.__wasm_HEAPF32, window.__wasm_HEAPU32, window.__wasm_HEAP32, window.__wasm_HEAPU8];
    const heap_names = ['HEAPF32', 'HEAPU32', 'HEAP32', 'HEAPU8'];
    let selected_heap = 0;
    let heap = heaps[selected_heap];
    const getSize = () => heap.length;
    const changeHeap = () => {
        selected_heap = (selected_heap + 1) % heaps.length;
        heap = heaps[selected_heap];
    };
    //helper function
    const create_text = (txt, color = colorPalette[2]) => {
        const text = document.createElement('p');
        text.innerText = txt;
        text.style.width = 'auto';
        text.style.fontSize = '90%';
        text.style.margin = '3px';
        text.style.color = color;
        text.style.overflowWrap = 'anywhere';
        text.style.textAlign = 'center';
        return text;
    };
    const create_button = (text, callback = ()=>{}, args = []) => {
        const button = document.createElement('div');
        const txt = create_text(text);
        button.appendChild(txt);
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.margin = '5px';
        button.style.color = colorPalette[2];
        button.style.width = "auto";
        button.style.height = "auto";
        button.style.backgroundColor = colorPalette[0];
        button.style.borderRadius = '3px';
        button.style.border = `3px solid ${colorPalette[2]}`;
        button.addEventListener('mousedown', (e) => callback(...args));
        button.addEventListener('mouseover', (e) => {
            button.style.border = `3px solid ${colorPalette[3]}`;
            button.style.color = colorPalette[3];
            button.style.cursor = 'pointer';
        });
        button.addEventListener('mouseout', (e) => {
            button.style.border = `3px solid ${colorPalette[2]}`;
            button.style.color = colorPalette[2];
            button.style.cursor = 'default';
        });
        return button;
    };
    //title
    const title = new Title('Memory Viewer');
    //create row wrapper
    const row_wrapper = document.createElement('div');
    row_wrapper.style.display = 'flex';
    row_wrapper.style.flexWrap = 'wrap';
    row_wrapper.style.flexDirection = 'row';
    row_wrapper.style.width = '90%';
    row_wrapper.style.height = '55%';
    row_wrapper.style.backgroundColor = colorPalette[0];
    row_wrapper.style.margin = '5px';
    row_wrapper.style.borderRadius = '5px';
    row_wrapper.style.border = `5px solid ${colorPalette[2]}`;
    row_wrapper.style.alignItems = 'flex-start';
    row_wrapper.style.alignContent = 'flex-start';
    row_wrapper.style.justifyContent = 'center';
    row_wrapper.style.overflow = 'auto';
    row_wrapper.style.scrollbarColor = `${colorPalette[3]} ${colorPalette[1]}`;
    //for rows item alignment
    const distribution = [25, 25, 25, 25];
    const create_row_item = (item, i) => {
        const row_item = document.createElement('div');
        row_item.style.display = 'inline-block';
        row_item.style.width = `${distribution[i]}%`;
        row_item.style.height = 'auto';
        row_item.textWrap = 'wrap';
        row_item.appendChild(item);
        return row_item;
    };
    //create row header
    const row_header = document.createElement('header');
    row_header.style.width = "95%";
    row_header.style.height = '4vh';
    row_header.style.backgroundColor = colorPalette[3];
    row_header.style.display = 'flex';
    row_header.style.flexWrap = 'wrap';
    row_header.style.flexDirection = 'row';
    row_header.style.alignItems = 'center';
    row_header.style.justifyContent = 'space-between';
    row_wrapper.appendChild(row_header);
    //now fill it with items
    const address_text = create_text('Address', colorPalette[0]);
    const address_item = create_row_item(address_text, 0);
    const value_text = create_text('Value', colorPalette[0]);
    const value_item = create_row_item(value_text, 1);
    const modified_text = create_text('Modified', colorPalette[0]);
    const modified_item = create_row_item(modified_text, 2);
    const copy_text = create_text('Copy Value', colorPalette[0]);
    const copy_item = create_row_item(copy_text, 3);
    row_header.appendChild(address_item);
    row_header.appendChild(value_item);
    row_header.appendChild(modified_item);
    row_header.appendChild(copy_item);
    //row logic
    let interval_items = 10;
    const interval = [0, interval_items];
    const rows = [];
    const create_rows = () => {
        if(rows.length > 0) return;
        for(let i = interval[0]; i < interval[1]; i++){
            const row = document.createElement('div');
            row.style.width = "95%";
            row.style.height = '4vh';
            row.style.backgroundColor = colorPalette[1];
            row.style.display = 'flex';
            row.style.flexWrap = 'wrap';
            row.style.flexDirection = 'row';
            row.style.alignItems = 'center';
            row.style.justifyContent = 'space-between';
            row_wrapper.appendChild(row);
            rows.push(row);
        }
    };
    const remove_rows = () => {
        if(rows.length === 0) return;
        for(let i = 0; i < rows.length; i++){
            row_wrapper.removeChild(rows[i])
        };
        rows.length = 0;
    };
    create_rows();
    const update_row = (i) => {
        if(rows.length <= i) return console.warn('not defined yet');
        //order: index  raw_value  hex/float/value_at_address/char  copy_raw_value_btn
        const background = rows[i];
        const index = interval[0]+i;
        const raw_value = heap[index];
        let modified_value;
        if(heap instanceof Float32Array){
            modified_value = float32ToHex(raw_value);
        }else if(heap instanceof Uint32Array){
            modified_value = window.__wasm_HEAPF32[index];
        }else if(heap instanceof Int32Array){
            // goal: (value >> shift) + offset
            if(raw_value !== 0){
                if(raw_value < 0){
                    modified_value = 'NEGATIVE';
                }else{
                    let shifted_value = raw_value >> pointer_shift;
                    let offset_value = shifted_value + pointer_offset;
                    if(offset_value < window.__wasm_HEAPU32.length){
                        modified_value = window.__wasm_HEAPU32[offset_value];
                    }else{
                        modified_value = 'TOO BIG';
                    }
                }
            }else{
                modified_value = 0;
            }
        }else if(heap instanceof Uint8Array){
            modified_value = String.fromCharCode(raw_value);
        }else{
            return console.warn('This should not happen');
        }
        //create or update
        if(background.innerHTML.length === 0){
            const t_index = create_text(index, colorPalette[2]);
            t_index.style.maxWidth = '100%';
            const item_index = create_row_item(t_index, 0);
            const t_raw_value = new NumberField(raw_value).element;
            t_raw_value.addEventListener('input', (e) => {
                switch(heap_names[selected_heap]){
                    case 'HEAPF32':
                        heap[interval[0]+i] = parseFloat(t_raw_value.value);
                        break;
                    case 'HEAPU32':
                    case 'HEAP32':
                    case 'HEAPU8':
                        heap[interval[0]+i] = parseInt(t_raw_value.value);
                        break;
                }
            });
            t_raw_value.style.maxWidth = '90%';
            t_raw_value.style.margin = 0;
            const item_raw_value = create_row_item(t_raw_value, 1);
            const t_modified_value = create_text(modified_value, colorPalette[2]);
            t_modified_value.style.maxWidth = '100%';
            const item_modified_value = create_row_item(t_modified_value, 2);
            const copy_btn = create_button('copy', () => {
                navigator.clipboard.writeText(heap[interval[0]+i]);
            });
            copy_btn.addEventListener('mousedown', (e) => {
                copy_btn.children[0].innerText = 'copied!';
                setTimeout(() => {
                    copy_btn.children[0].innerText = 'copy';
                }, 2500);
            });
            copy_btn.style.maxWidth = '100%';
            const item_copy_btn = create_row_item(copy_btn, 3);
            //save
            background.appendChild(item_index);
            background.appendChild(item_raw_value);
            background.appendChild(item_modified_value);
            background.appendChild(item_copy_btn);
        }else{
            //identify
            const children = background.children;
            const item_index = children[0];
            const item_raw_value = children[1];
            const item_modified_value = children[2];
            //update
            item_index.children[0].innerText = index;
            item_raw_value.children[0].value = raw_value;
            item_modified_value.children[0].innerText = modified_value;
        }
    }
    let update_interval;
    //create control pannel
    const control_pannel = document.createElement('div');
    control_pannel.style.display = 'flex';
    control_pannel.style.flexWrap = 'wrap';
    control_pannel.style.flexDirection = 'row';
    control_pannel.style.width = '90%';
    control_pannel.style.height = '15%';
    control_pannel.style.backgroundColor = colorPalette[1];
    control_pannel.style.margin = '5px';
    control_pannel.style.borderRadius = '5px';
    control_pannel.style.border = `5px solid ${colorPalette[2]}`;
    control_pannel.style.alignItems = 'center';
    control_pannel.style.justifyContent = 'center';
    //fill control pannel with elements
    //HEAP32 only
    const offset_field = new NumberField('Offset');
    offset_field.element.addEventListener('input', (e) => {
        if(offset_field.element.value.length > 0) pointer_offset = parseInt(offset_field.element.value);
    });

    const shift_field = new NumberField('Shift');
    shift_field.element.addEventListener('input', (e) => {
        if(shift_field.element.value.length > 0) pointer_shift = parseInt(shift_field.element.value);
    });

    const pick_fields_visibility = () => {
        if(heap_names[selected_heap] === 'HEAP32'){
            offset_field.element.style.display = 'block';
            shift_field.element.style.display = 'block';
        }else{
            offset_field.element.style.display = 'none';
            shift_field.element.style.display = 'none';
        }
        //baseValue_btn.style.display = heap_names[selected_heap] === 'HEAPU32' ? 'block' : 'none';
    }
    pick_fields_visibility(); //hide buttons if HEAP32 not selected

    const load_button = create_button('load', () => {
        if(rows.length === 0) create_rows();
        if(update_interval !== undefined) clearInterval(update_interval); //There was a bug when clicking load twice, it broke unloading
        update_interval = setInterval(() => {
            for(let i = 0; i < interval_items; i++){
                update_row(i);
            }
        }, 1000/100); //~ 60FPS
    });

    const unload_button = create_button('unload', () => {
        clearInterval(update_interval);
        remove_rows();
    });

    const interval_field = new NumberField(`Rows(${interval_items})`);
    interval_field.element.addEventListener('input', (e) => {
        if(interval_field.element.value.length > 0){
            let user_input = parseInt(interval_field.element.value);
            if(user_input > 0){
                if(user_input > 200 && !warned){
                    alert('Warning! High row amounts might affect your performance.\n Consider using "next" and "previous" buttons\n to cycle instead.');
                    warned = true;
                }
                remove_rows();
                interval_items = user_input;
                interval[1] = interval[0] + interval_items;
                create_rows();
            }else{
                interval_field.element.value = '';
                interval_field.element.placeholder = 'invalid input';
            }
        }
    });

    //index controller
    const footer_layout = [20, 25, 20];
    const footer = new Wrapper('column', '100%', '25%', 'space-around', 'center', 'transparent');
    const subfooter = new Wrapper('row', '100%', '20%', 'space-around', 'center', 'transparent');
    const searchfooter = new Wrapper('row', '100%', '20%', 'space-around', 'center', 'transparent');
    //create elements for subfooter
    const previous = create_button('previous', () => {
        if(interval[0] - interval_items >= 0){
            interval[0] -= interval_items;
            interval[1] -= interval_items;
        }
    });
    previous.style.width = `${footer_layout[0]}%`;

    const watch_address = (at) => {
        interval[0] = at;
        interval[1] = at+interval_items;
    };
    const fast_field = new NumberField('Check Index');
    fast_field.element.style.width = `${footer_layout[1]}%`;
    fast_field.element.addEventListener('input', (e) => {
        if(fast_field.element.value.length > 0){
            let address = parseInt(fast_field.element.value);
            if(address < 0 || address + interval_items > getSize()){
                fast_field.element.placeholder = 'invalid address';
            }else{
                watch_address(address);
            }
        }
    });

    const create_lookup_button = (name, getVal) => {
        return create_button(name, () => {
            const val = getVal();
            console.log(val);
            if(val !== -1){
                fast_field.element.value = val;
                watch_address(val);
            };
        });
    };
    //lookup addresses buttons STATIC

    //lookup addresses buttons DYNAMIC
    const baseValue_btn = create_lookup_button('BaseValue', () => base_index);
    const playerX_btn = create_lookup_button('Player Pos X', () => dynamic_addresses.player_x);
    const playerY_btn = create_lookup_button('Player Pos Y', () => dynamic_addresses.player_y);
    const FOV_btn = create_lookup_button('FOV', () => dynamic_addresses.FOV);

    //other
    const next = create_button('next', () => {
        if(interval[1] + interval_items < getSize()){
            interval[0] += interval_items;
            interval[1] += interval_items;
        }
    });
    next.style.width = `${footer_layout[2]}%`;

    //logic search_results
    const sub_rows = [];
    const search_results_wrapper = document.createElement('div');
    search_results_wrapper.style.display = 'flex';
    search_results_wrapper.style.flexWrap = 'wrap';
    search_results_wrapper.style.flexDirection = 'row';
    search_results_wrapper.style.width = '85%';
    search_results_wrapper.style.height = '40%';
    search_results_wrapper.style.backgroundColor = colorPalette[0];
    search_results_wrapper.style.margin = '10px';
    search_results_wrapper.style.borderRadius = '5px';
    search_results_wrapper.style.border = `5px solid ${colorPalette[2]}`;
    search_results_wrapper.style.alignItems = 'center';
    search_results_wrapper.style.justifyContent = 'center';
    search_results_wrapper.style.margin = 0;
    search_results_wrapper.style.overflow = 'auto';
    search_results_wrapper.style.scrollbarColor = `${colorPalette[3]} ${colorPalette[1]}`;

    const create_sub_rows = (results) => {
        for(let result of results){
            const sub_row = document.createElement('div');
            const style = sub_row.style;
            style.width = "95%";
            style.height = '4vh';
            style.backgroundColor = colorPalette[1];
            style.display = 'flex';
            style.flexWrap = 'wrap';
            style.flexDirection = 'row';
            style.alignItems = 'center';
            style.justifyContent = 'space-between';

            const text_element = create_text(result);

            const check_btn = create_button('Check', () => {
                fast_field.element.value = result;
                watch_address(result);
            });

            sub_row.appendChild(text_element);
            sub_row.appendChild(check_btn);
            //saving
            search_results_wrapper.appendChild(sub_row);
            sub_rows.push(sub_row);
        }
    };
    const delete_sub_rows = () => {
        for(let sub_row of sub_rows){
            search_results_wrapper.removeChild(sub_row);
        }
        sub_rows.length = 0;
    };

    //create elements for searchfooter
    let selected_search_type = 0;
    let selected_string_type = 0;
    const search_types = ['Direct', 'Interval']; //for everything else
    const string_types = ['Char', 'Prefix', 'Suffix', 'Exact', 'Anywhere']; //for HEAPU8 exclusive

    const search_wrapper = new Wrapper('row', '100%', '20%', 'space-between', 'center', 'transparent');
    search_wrapper.element.style.margin = 0;
    search_wrapper.element.style.width = `${footer_layout[1]}%`;

    const search_in_last = create_button('Search in last results');
    search_in_last.value = 'inactive';
    search_in_last.style.display = 'block';
    search_in_last.addEventListener('mousedown', (e) => {
        switch(search_in_last.value){
            case 'inactive':
                search_in_last.value = 'active';
                search_in_last.children[0].style.color = colorPalette[1];
                search_in_last.style.backgroundColor = colorPalette[2];
                break;
            case 'active':
                search_in_last.value = 'inactive';
                search_in_last.children[0].style.color = colorPalette[2];
                search_in_last.style.backgroundColor = colorPalette[0];
                break;
            default:
                search_in_last.value = 'active';
                search_in_last.children[0].style.color = colorPalette[1];
                search_in_last.style.backgroundColor = colorPalette[2];
        };
    });
    const in_last_active = () => search_in_last.value === 'active';

    let search_value, from, to;
    const search_input = new NumberField('Value');
    search_input.element.style.margin = 0;
    search_input.element.style.width = '100%';
    search_input.element.addEventListener('input', (e) => {
        switch(heap_names[selected_heap]){
            case 'HEAPF32':
                search_value = parseFloat(search_input.element.value);
                break;
            case 'HEAPU32':
            case 'HEAP32':
                search_value = parseInt(search_input.element.value);
                break;
        }
    });

    const search_string = new TextField('Text');
    search_string.element.style.margin = 0;
    search_string.element.style.width = '100%';
    search_string.element.style.display = 'none';
    search_string.element.addEventListener('input', (e) => {
        console.log(search_string.element.value);
        if(heap_names[selected_heap] === 'HEAPU8') search_value = search_string.element.value;
    });

    const search_from = new NumberField('From');
    search_from.element.style.margin = 0;
    search_from.element.style.width = '40%';
    search_from.element.style.display = 'none';
    search_from.element.addEventListener('input', (e) => {
        switch(heap_names[selected_heap]){
            case 'HEAPF32':
                from = parseFloat(search_from.element.value);
                break;
            case 'HEAPU32':
            case 'HEAP32':
                from = parseInt(search_from.element.value);
                break;
        }
    });

    const search_to = new NumberField('To');
    search_to.element.style.margin = 0;
    search_to.element.style.width = '40%';
    search_to.element.style.display = 'none';
    search_to.element.addEventListener('input', (e) => {
        switch(heap_names[selected_heap]){
            case 'HEAPF32':
                to = parseFloat(search_to.element.value);
                break;
            case 'HEAPU32':
            case 'HEAP32':
                to = parseInt(search_to.element.value);
                break;
        }
    });

    //helper functions for cleaner code
    const hide_input = (type) => {
        switch(type){
            case 'string':
                search_string.element.style.display = 'none';
                break;
            case 'Direct':
                search_input.element.style.display = 'none';
                break;
            case 'Interval':
                search_from.element.style.display = 'none';
                search_to.element.style.display = 'none';
                break;
        };
    };
    const show_input = (type) => {
        switch(type){
            case 'string':
                search_string.element.style.display = 'block';
                break;
            case 'Direct':
                search_input.element.style.display = 'block';
                break;
            case 'Interval':
                search_from.element.style.display = 'block';
                search_to.element.style.display = 'block';
                break;
        };
    };
    const update_non_string_search_elements = () => {
        selected_search_type = (selected_search_type + 1) % search_types.length;
        search_setting.innerText = `SearchType: ${search_types[selected_search_type]}`;
        switch(selected_search_type){
            case 0:
                hide_input('Interval');
                show_input('Direct');
                break
            case 1:
                hide_input('Direct');
                show_input('Interval');
                break
        }
    };
    const update_string_search_elements = () => {
        selected_string_type = (selected_string_type + 1) % string_types.length;
        search_setting.innerText = `StringType: ${string_types[selected_string_type]}`;
    };
    let string_active = false;
    //end
    const search_setting = create_button(`SearchType: ${search_types[selected_search_type]}`);
    search_setting.style.width = `${footer_layout[0]}%`;
    search_setting.style.margin = 0;
    search_setting.addEventListener('mousedown', (e) => {
        switch(heap_names[selected_heap]){
            case 'HEAPU8':
                update_string_search_elements();
                break
            default:
                update_non_string_search_elements();
                break
        };
    });
    const switch_to_string = () => {
        search_setting.innerText = `StringType: ${string_types[selected_string_type]}`;
        hide_input(search_types[selected_search_type]);
        show_input('string');
        string_active = true;
        search_in_last.style.display = 'none';
    };
    const switch_back = () => {
        if(string_active){
            search_setting.innerText = `SearchType: ${search_types[selected_search_type]}`;
            hide_input('string');
            show_input(search_types[selected_search_type]);
            string_active = false;
            search_in_last.style.display = 'block';
        }
    };

    const search_btn = create_button('Search', (e) => {
        let results;
        //based on selected mode, define results properly.
        if(string_active){
            let modified_str = [
                search_value[0],
                (String.fromCharCode(0) + search_value), //prefix (ascii 0 is separating string, so it must start with it, if the word starts with it)
                (search_value + String.fromCharCode(0)), //suffix
                (String.fromCharCode(0) + search_value + String.fromCharCode), //Exact match
                search_value //Anywhere (similar to Array.includes)
            ];
            let input_string = modified_str[selected_string_type];
            results = findStringAddresses(input_string);
        }else{
            switch(selected_search_type){
                case 0:
                    if(in_last_active()){
                        const lastResults = sub_rows.map((sub_row) => parseInt(sub_row.children[0].innerText));
                        results = findAddressesInLast(search_value, heap, lastResults);
                    }else{
                        results = findAddresses(search_value, heap);
                    }
                    break;
                case 1:
                    if(in_last_active()){
                        const lastResults = sub_rows.map((sub_row) => parseInt(sub_row.children[0].innerText));
                        results = findIntervalAddressesInLast(from, to, heap, lastResults);
                    }else{
                        results = findIntervalAddresses(from, to, heap);
                    }
                    break;
            };
        }
        console.log(results);
        delete_sub_rows();
        create_sub_rows(results);
    });
    search_btn.style.margin = 0;
    search_btn.style.width = `${footer_layout[2]}%`;

    const HEAP_button = create_button(heap_names[selected_heap], changeHeap); //keep this in the end for technical reasons
    HEAP_button.addEventListener('mousedown', (e) => {
        HEAP_button.children[0].innerText = heap_names[selected_heap];
        pick_fields_visibility(); //hide buttons if HEAP32 not selected
        (heap_names[selected_heap] === 'HEAPU8') ? switch_to_string() : switch_back();
    });

    //save to control pannel. For technical reasons the order is different from creation order
    const control_elements = [HEAP_button, load_button, unload_button, interval_field.element, offset_field.element, shift_field.element, baseValue_btn, playerX_btn, playerY_btn, FOV_btn];
    control_elements.forEach((el) => control_pannel.appendChild(el));

    //save search wrapper elements
    const search_elements = [search_string.element, search_input.element, search_from.element, search_to.element];
    search_elements.forEach((el) => search_wrapper.element.appendChild(el));

    //save footer elements
    const subfooter_elements = [previous, fast_field.element, next];
    subfooter_elements.forEach((el) => subfooter.element.appendChild(el));

    const searchfooter_elements = [search_setting, search_wrapper.element, search_btn];
    searchfooter_elements.forEach((el) => searchfooter.element.appendChild(el));

    const footer_elements = [subfooter.element, searchfooter.element, search_in_last, search_results_wrapper];
    footer_elements.forEach((el) => footer.element.appendChild(el));

    //save all wrappers
    const memory_elements = [title.element, control_pannel, row_wrapper, footer.element];
    memory_elements.forEach((el) => memoryViewerElements.push(el));
}

function createFOVElements(FOVElements){
    //title
    const title = new Title('FOV script');
    //helper function
    const create_text = (txt, color = colorPalette[2]) => {
        const text = document.createElement('p');
        text.innerText = txt;
        text.style.width = 'auto';
        text.style.fontSize = '1.5vw';
        text.style.margin = '3px';
        text.style.color = color;
        text.style.overflowWrap = 'anywhere';
        text.style.textAlign = 'center';
        return text;
    };
    const create_button = (text, callback = ()=>{}, args = []) => {
        const button = document.createElement('div');
        const txt = create_text(text);
        button.appendChild(txt);
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.margin = '5px';
        button.style.color = colorPalette[2];
        button.style.width = "40%";
        button.style.height = "10%";
        button.style.backgroundColor = colorPalette[0];
        button.style.borderRadius = '3px';
        button.style.border = `3px solid ${colorPalette[2]}`;
        button.addEventListener('mousedown', (e) => callback(...args));
        button.addEventListener('mouseover', (e) => {
            button.style.border = `3px solid ${colorPalette[3]}`;
            button.style.color = colorPalette[3];
            button.style.cursor = 'pointer';
        });
        button.addEventListener('mouseout', (e) => {
            button.style.border = `3px solid ${colorPalette[2]}`;
            button.style.color = colorPalette[2];
            button.style.cursor = 'default';
        });
        return button;
    };
    const create_toggle_button = (text) => {
        const btn = create_button(text);
        btn.value = 'inactive';
        btn.style.display = 'block';
        btn.addEventListener('mousedown', (e) => {
            switch(btn.value){
                case 'inactive':
                    btn.value = 'active';
                    btn.children[0].style.color = colorPalette[1];
                    btn.style.backgroundColor = colorPalette[2];
                    break;
                case 'active':
                    btn.value = 'inactive';
                    btn.children[0].style.color = colorPalette[2];
                    btn.style.backgroundColor = colorPalette[0];
                    break;
                default:
                    btn.value = 'active';
                    btn.children[0].style.color = colorPalette[1];
                    btn.style.backgroundColor = colorPalette[2];
            };
        });
        return btn;
    };
    //other elements
    const toggle = create_toggle_button(activeScripts.fov ? 'Disable Fov' : 'Enable Fov');
    toggle.addEventListener('mousedown', (e) => {
        toggleFov();
        toggle.children[0].innerText = activeScripts.fov ? 'Disable Fov' : 'Enable Fov'
    });
    const toggle2 = create_toggle_button(FOV_config.fixFov ? 'Unfix' : 'Fix');
    toggle2.addEventListener('mousedown', (e) => {
        toggleFixed();
        toggle2.children[0].innerText = FOV_config.fixFov ? 'Unfix' : 'Fix'
    });
    const tanks = Object.keys(FOV_config.tanks);
    const selected_tank_btn = create_button(`Fov from tank: ${tanks[FOV_config.selected_tank]}`);
    selected_tank_btn.style.display = 'none';
    selected_tank_btn.addEventListener('mousedown', (e) => {
        changeFovTank();
        selected_tank_btn.children[0].innerText = `Fov from tank: ${tanks[FOV_config.selected_tank]}`;
    });
    const selected_mode_btn = create_button(`Mode: ${FOV_config.modes[FOV_config.selected_mode]}`);
    selected_mode_btn.addEventListener('mousedown', (e) => {
        changeFovMode();
        selected_mode_btn.children[0].innerText = `Mode: ${FOV_config.modes[FOV_config.selected_mode]}`;
        switch(FOV_config.selected_mode){
            case 0:
                selected_tank_btn.style.display = 'none';
                toggle2.style.display = 'block';
                break;
            case 1:
                selected_tank_btn.style.display = 'block';
                toggle2.style.display = 'none';
                break;
        };
    });
    //save
    const elementsToSave = [title.element, toggle, selected_mode_btn, toggle2, selected_tank_btn];
    elementsToSave.forEach((el) => FOVElements.push(el));
}

function createLeaderLocatorElements(leaderLocatorElements){
    //title
    const title = new Title('Leader Locator script');
    //helper function
    const create_text = (txt, color = colorPalette[2]) => {
        const text = document.createElement('p');
        text.innerText = txt;
        text.style.width = 'auto';
        text.style.fontSize = '1.5vw';
        text.style.margin = '3px';
        text.style.color = color;
        text.style.overflowWrap = 'anywhere';
        text.style.textAlign = 'center';
        return text;
    };
    const create_button = (text, callback = ()=>{}, args = []) => {
        const button = document.createElement('div');
        const txt = create_text(text);
        button.appendChild(txt);
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.margin = '5px';
        button.style.color = colorPalette[2];
        button.style.width = "40%";
        button.style.height = "10%";
        button.style.backgroundColor = colorPalette[0];
        button.style.borderRadius = '3px';
        button.style.border = `3px solid ${colorPalette[2]}`;
        button.addEventListener('mousedown', (e) => callback(...args));
        button.addEventListener('mouseover', (e) => {
            button.style.border = `3px solid ${colorPalette[3]}`;
            button.style.color = colorPalette[3];
            button.style.cursor = 'pointer';
        });
        button.addEventListener('mouseout', (e) => {
            button.style.border = `3px solid ${colorPalette[2]}`;
            button.style.color = colorPalette[2];
            button.style.cursor = 'default';
        });
        return button;
    };
    const create_toggle_button = (text) => {
        const btn = create_button(text);
        btn.value = 'inactive';
        btn.style.display = 'block';
        btn.addEventListener('mousedown', (e) => {
            switch(btn.value){
                case 'inactive':
                    btn.value = 'active';
                    btn.children[0].style.color = colorPalette[1];
                    btn.style.backgroundColor = colorPalette[2];
                    break;
                case 'active':
                    btn.value = 'inactive';
                    btn.children[0].style.color = colorPalette[2];
                    btn.style.backgroundColor = colorPalette[0];
                    break;
                default:
                    btn.value = 'active';
                    btn.children[0].style.color = colorPalette[1];
                    btn.style.backgroundColor = colorPalette[2];
            };
        });
        return btn;
    };

    //your key
    const key_text = create_text('key: ' + unique_key);
    const update_keyText = () => {
        if(unique_key === undefined) return setTimeout(update_keyText, 100);
        key_text.innerText = 'key: ' + unique_key;
    };
    update_keyText();

    //enable
    const toggleLeaderLocator = () => {
        activeScripts.leaderLocator = !activeScripts.leaderLocator;
    };
    const enable_button = create_toggle_button('Enable Leader Locator');
    enable_button.addEventListener('mousedown', (e) => {
        toggleLeaderLocator();
        enable_button.children[0].innerText = activeScripts.leaderLocator ? 'Disable Leader Locator' : 'Enable Leader Locator';
    });

    //visual things config wrapper
    const visuals_wrapper = new ScrollWrapper('column', '85%', '50%', 'flex-start', 'center', 'transparent');

    //config row generator
    const create_config_row = (name, configObj, key) => {
        const row = new Wrapper('row', '95%', 'auto', 'space-between', 'center', colorPalette[1]);
        row.element.style.margin = '4px';
        row.element.style.padding = '4px';

        const text = create_text(name);
        text.style.fontSize = '1vw';
        row.element.appendChild(text);

        let inputElement;
        const valueType = typeof configObj[key];

        if (valueType === 'number') {
            const field = new NumberField(name);
            field.element.value = configObj[key];
            field.element.style.width = '40%';
            field.element.addEventListener('input', () => {
                if(field.element.value !== '') configObj[key] = parseFloat(field.element.value);
            });
            inputElement = field.element;
        } else {
            const field = new TextField(name);
            field.element.value = configObj[key];
            field.element.style.width = '40%';
            field.element.addEventListener('input', () => {
                if(field.element.value !== '') configObj[key] = field.element.value;
            });
            inputElement = field.element;
        }

        row.element.appendChild(inputElement);
        return row.element;
    };

    //section generator
    const create_section = (titleText, targetConfig) => {
        const sectionTitle = create_text(`-- ${titleText} --`, colorPalette[3]);
        sectionTitle.style.marginTop = '10px';
        visuals_wrapper.element.appendChild(sectionTitle);

        for(let category in targetConfig) {
            for(let key in targetConfig[category]) {
                const row = create_config_row(`${category} ${key}`, targetConfig[category], key);
                visuals_wrapper.element.appendChild(row);
            }
        }
    };

    //populate settings
    create_section('Minimap Config', LeaderLocator_config.minimap);
    create_section('Screen Config', LeaderLocator_config.screen);

    const predictTitle = create_text('-- Misc --', colorPalette[3]);
    predictTitle.style.marginTop = '10px';
    visuals_wrapper.element.appendChild(predictTitle);

    const predictRow = create_config_row('Prediction Offset', LeaderLocator_config, 'prediction_offset_factor');
    visuals_wrapper.element.appendChild(predictRow);

    //save
    const ll_elements = [title.element, key_text, enable_button, visuals_wrapper.element];
    ll_elements.forEach((el) => leaderLocatorElements.push(el));
}

function createMultiBoxElements(multiBoxElements){
    //title
    const title = new Title('Multibox script');
    //more logic soon...
    //save
    multiBoxElements.push(title.element);
}

function createEnemyTrackerElements(enemyTrackerElements){
    //title
    const title = new Title('Enemy Tracker script');
    //more logic soon...
    //save
    enemyTrackerElements.push(title.element);
}

function createCategories(displayWrapper){ //this obviously should only get called once (unless categories is empty)
    //category elements initialisation
    const ScriptSettingsElements = [];
    const memoryViewerElements = [];
    const FOVElements = [];
    const leaderLocatorElements = [];
    const multiBoxElements = [];
    const enemyTrackerElements = [];
    //category elements customisation
    createScriptSettingsElements(ScriptSettingsElements);
    createMemoryViewerElements(memoryViewerElements);
    createFOVElements(FOVElements);
    createLeaderLocatorElements(leaderLocatorElements);
    createMultiBoxElements(multiBoxElements);
    createEnemyTrackerElements(enemyTrackerElements);
    //category initialisation
    const ScriptSettings = new Category('Script settings', ScriptSettingsElements, displayWrapper);
    const memoryViewer = new Category('Memory Viewer', memoryViewerElements, displayWrapper);
    const FOV = new Category("FOV", FOVElements, displayWrapper);
    const leaderLocator = new Category("Leader Locator", leaderLocatorElements, displayWrapper);
    const multiBox = new Category("Multibox", multiBoxElements, displayWrapper);
    const enemyTracker = new Category("Enemy Tracker", enemyTrackerElements, displayWrapper);
    //category saving
    categories.push(ScriptSettings);
    categories.push(memoryViewer);
    categories.push(FOV);
    categories.push(leaderLocator);
    categories.push(multiBox);
    categories.push(enemyTracker);
}

//create the entire GUI
let GUI_active;
let main_container;
function create_main_container(){
    main_container = document.createElement('div');
    main_container.style.width = '50%';
    main_container.style.height = '70%';
    main_container.style.top = '50%';
    main_container.style.left = '50%';
    main_container.style.zIndex = baseZindex;
    main_container.style.display = main_display;
    main_container.style.position = 'absolute';
    main_container.style.backgroundColor = colorPalette[0];
    main_container.style.translate = '-50% -50%';
    main_container.style.borderRadius = '40px';
    main_container.style.border = `5px solid ${colorPalette[1]}`;
    main_container.addEventListener('mouseover', (e) => {
        cursor_over_gui = true;
    });
    main_container.addEventListener('mouseout', (e) => {
        cursor_over_gui = false;
    });
};

function delete_main_container(){
    main_container.innerHTML = '';
    categories.length = 0;
    main_container = undefined;
};

function buildGUI(){
    create_main_container();
    //structure
    const wrapper1 = new Wrapper('row', '100%', '100%', 'stretch', 'center', 'transparent');
    const categoryWrapper = new Wrapper('column', '25%', '100%', 'flex-start', 'center', 'transparent');
    categoryWrapper.element.style.overflow = 'auto';
    categoryWrapper.element.style.scrollbarColor = `${colorPalette[3]} ${colorPalette[1]}`;
    const displayWrapper = new Wrapper('column', '70%', '100%', 'flex-start', 'center', 'transparent');
    wrapper1.element.appendChild(categoryWrapper.element);
    wrapper1.element.appendChild(displayWrapper.element);
    //categories
    createCategories(displayWrapper);
    for(let category of categories){
        categoryWrapper.element.appendChild(category.element);
    }
    //display elements
    //final apply
    main_container.appendChild(wrapper1.element);
    document.body.appendChild(main_container);
    GUI_active = true;
}
function deleteGUI(){
    document.body.removeChild(main_container);
    delete_main_container();
    GUI_active = false;
}
buildGUI();

var changePalette = function(i){
    if(i >= colorPalettes.length) return;
    activePalette = i;
    colorPalette = colorPalettes[i];
    deleteGUI();
    buildGUI();
}

//GUI visibility
function hideGUI(){
    main_container.style.display = 'none';
    GUI_active = false;
    //console.log(GUI_active, 'hidden'); //debug
}

function showGUI(){
    main_container.style.display = main_display;
    GUI_active = true;
    //console.log(GUI_active, 'shown'); //debug
}

function isTyping() {
    const el = document.activeElement;
    return el && (
        el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.isContentEditable
    );
}

document.addEventListener('keydown', (e) => {
    if(isTyping()) return;
    if(e.code === keyBinds.GUI_toggle){
        GUI_active ? hideGUI() : showGUI();
    }
});