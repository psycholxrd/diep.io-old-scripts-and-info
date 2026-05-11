// ==UserScript==
// @name         Automatic Search for new adresses
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  automatically tries to find working adresses
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// @run-at       document-start
// ==/UserScript==

const last_baseValue = 0xb00b;
let data = {
    baseValue: undefined,
    offsets: {
        FOV: undefined,
        player_x: undefined,
        player_y: undefined,
    },
    static_ptrs: {
        leader_x: undefined,
        leader_y: undefined,
    },
};

function log(...message){
    console.log('[ASNA] ', ...message);
}

function is_connected(){
    return !!document.querySelector("#copy-party-link");
}

function pot2(step){
    return Math.pow(2, step);
}

function is_in_range(searching_value, tolerance, actual_value){
    return (searching_value-tolerance <= actual_value) && (searching_value+tolerance >= actual_value);
}

function decimalToHexString(number)
{
  if (number < 0)
  {
    number = 0xFFFFFFFF + number + 1;
  }

  return '0x' + number.toString(16);
}

function floatToHex(f) { //123.12524e5235 -> 0x...
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, f, false); // false = big endian (IEEE 754 standard order)
  return '0x' + view.getUint32(0, false).toString(16).padStart(8, '0');
}

function hexToFloat(hex) { // 0x... -> 12314.235234e-623523
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  const value = parseInt(hex, 16);
  view.setUint32(0, value, false); // false = big endian
  return view.getFloat32(0, false);
}

function get_date() {
    const now = new Date();

    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const yyyy = now.getFullYear();

    return `${dd}.${mm}.${yyyy}`;
}


window.get_leader_ptrs = function(){
    log(`
    In order to make this work, follow these steps:
    1. Create a new Sandbox server
    2. Make sure to only have 2 player (yourself)
    3. Spawn in the game
    4. go to the top left corner until you can't anymore
    5. wait 1-2 seconds
    6. Level up to level 45
    7. Join with another Tab
    8. Go to the left bottom Corner
    9. run this function
    `);
    let possible_leader_ptr = window.__wasm_HEAPF32.findIndex((value) => !Number.isInteger(value) && is_in_range(-1950, 2, value));
    log('possible leader ptr', possible_leader_ptr);
    if(possible_leader_ptr === -1){
        log('No matches found :(');
        return;
    }else{
        if(
            !Number.isInteger(window.__wasm_HEAPF32[possible_leader_ptr+1]) &&
            is_in_range(-1950, 2, window.__wasm_HEAPF32[possible_leader_ptr+1])
        ){
            log('FOUND A MATCH!!! LeaderX_ptr: ', possible_leader_ptr, ' LeaderY_ptr: ', possible_leader_ptr+1);
            data.static_ptrs.leader_x = possible_leader_ptr;
            data.static_ptrs.leader_y = possible_leader_ptr+1;
        }
    }
}

window.get_player_offsets = function(){
    log(`
    Hot to set everything up for this to work:
    1. Join 2TDM red team
    2. go to bottom left corner until you can't
    3. let go and wait 3-4 seconds
    4. run this function
    `);
    if(!data.baseValue){
        log('for this function the baseValue is required, make sure it was found!');
        return;
    }
    let target_float = hexToFloat(decimalToHexString(data.baseValue));
    let starting_ptr = window.__wasm_HEAPF32.indexOf(target_float);
    if(starting_ptr === -1){
        throw new Error('fatal Error! Got no valid pointer, despite having the baseValue');
    }
    let subarr = window.__wasm_HEAPF32.subarray(starting_ptr, starting_ptr+1000);
    let potential_x = subarr.indexOf(-11350);
    if(potential_x === -1){
        log('No player_x found, quitting...');
        return;
    }
    let potential_y = subarr.indexOf(11350);
    if(potential_y === -1){
        log('No player_y found, quitting...');
        return;
    }
    log('FOUND A MATCH!!! PlayerX_offset: ', potential_x, ' PlayerY_offset: ', potential_y);
    data.offsets.player_x = potential_x;
    data.offsets.player_y = potential_y;
}

window.print_data = function(){
    console.log(`

    ${get_date()}
    **HEAPF32**
    offsets from base value: ${data.baseValue}
    \`\`\`txt
    ${data.offsets.FOV}: FOV
    ${data.offsets.player_x}: player_x
    ${data.offsets.player_y}: player_y
    \`\`\`

    CONSTANT Values:
    \`\`\`txt
    ${data.static_ptrs.leader_x}: leader_x
    ${data.static_ptrs.leader_y}: leader_y
    \`\`\`
    `);
}

function init(){
    let count_7 = array => array.filter(x => x===9.80908925027372e-45).length;
    let FOV_ptrs = [];
    let last_FOV_ptr = window.__wasm_HEAPF32.indexOf(0.3499999940395355);
    log('first FOV pointer: ', last_FOV_ptr);
    if(last_FOV_ptr === -1){
        log('timings failed I guess? Calling init() again...');
        return setTimeout(init, 100);
    }
    while(last_FOV_ptr != -1){
        FOV_ptrs.push(last_FOV_ptr);
        last_FOV_ptr = window.__wasm_HEAPF32.indexOf(0.3499999940395355, last_FOV_ptr+1);
    }
    log('FOV pointers: ', FOV_ptrs);
    let true_FOV_ptr;
    for(let i = 0; i < FOV_ptrs.length; i++){
        const ptr = FOV_ptrs[i];
        let left_subarr = window.__wasm_HEAPF32.subarray(ptr-1000, ptr);
        let right_subarr = window.__wasm_HEAPF32.subarray(ptr, ptr+1000);
        log('left subArray', left_subarr);
        log('right subArray', right_subarr);
        if(count_7(left_subarr) >= 8 || count_7(right_subarr) >= 8){
            true_FOV_ptr = ptr;
            console.log('the true FOV ptr is: ', true_FOV_ptr);
            break;
        }
    }
    if(!true_FOV_ptr){
        log('true FOV pointer was not found, why? Calling inti() again...');
        return setTimeout(init, 100);
    }
    let left_subarr = window.__wasm_HEAPF32.subarray(true_FOV_ptr-1000, true_FOV_ptr);
    let right_subarr = window.__wasm_HEAPF32.subarray(true_FOV_ptr, true_FOV_ptr+1000);
    //logic to find the basevalue
    let target_float = hexToFloat(decimalToHexString(last_baseValue));
    if(left_subarr.includes(target_float)){
        log('basevalue has not changed? Confirming...');
        if(left_subarr.filter(x => x===target_float).length === 1){
            log('basevalue indeed has not changed!');
            data.baseValue = last_baseValue;
            let bv_ptr = window.__wasm_HEAPF32.indexOf(target_float);
            if(bv_ptr === -1){
                throw new Error('Base Value was found in subarrays, but not in the memory fatal logical Error!');
            }
            data.offsets.FOV = true_FOV_ptr - bv_ptr;
        }
    }else{
        //logic to bruteforce the baseValue (not needed right now)
        log('okay so the basevalue is missing, lets try to find the new one...');
        let found_values = new Set();
        let map = {};
        log('first we will count how often each value can be found in here');
        for(let i = 0; i < left_subarr.length; i++){
            let value = left_subarr[i];
            if(!found_values.has(value)){
                map[value] = {
                    first_index: true_FOV_ptr-1000 + i,
                    count: 1
                }
                found_values.add(value);
            }else{
                map[value].count++;
            }
        }
        log('results: ', map);
        log('now we check how many of them are unique...');
        for(let value in map){
            if(map[value].count != 1){
                delete map[value];
            }
        }
        log('results: ', map);
        log('okay now let us convert them into Integers and see how many of them are bigger than the last basevalue');
        let map2 = {};
        for(let value in map){
            let hex_value = floatToHex(value);
            let dec_value = parseInt(hex_value);
            if(last_baseValue < dec_value){
                map2[dec_value] = map[value];
            }
        }
        log('results: ', map2);
        log('okay that is more numbers, than I thought. This part might be inconsistent, but for now it should work. We check if value < last_baseValue*2, by deleting the rest');
        for(let value in map2){
            if(parseInt(value) > (last_baseValue*2)){
                delete map2[value];
            }
        }
        let keys = Object.keys(map2);
        let len = keys.length;
        log('okay now we got ', len, ' results.');
        if(len === 1){
            log('SUCCESS! The new basevalue is: [DECIMAL] = ', parseInt(keys[0]), ' [HEXADECIMAL] = ', decimalToHexString(parseInt(keys[0])), ' [FLOAT32] = ', hexToFloat(decimalToHexString(parseInt(keys[0]))));
            data.baseValue = parseInt(len[0]);
        }else{
            throw new Error('idk bro fix your code lazy ass');
        }
    }
    log('Finished! Final results: ', data);
}

function wait_for_memory_hook(){
    log('started waiting...');
    if(!window.__wasm_HEAPF32){
        log('memory hook not find, retrying...');
        return setTimeout(wait_for_memory_hook, 500);
    }else{
        log('memory hook found! Starting...');
        if(is_connected()){
            log('connection confirmed, calling init()...');
            setTimeout(init, 1000);
        }else{
            log('not connected yet, waiting for connection...');
            return setTimeout(wait_for_memory_hook, 100);
        }
    }
}
wait_for_memory_hook();