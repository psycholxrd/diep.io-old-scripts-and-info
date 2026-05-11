// ==UserScript==
// @name         Text Searcher (Memory based)
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  stores information about texts on screen (or saved in memory)
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// @license      Use it as you want
// ==/UserScript==

//NOTE! This code assumes, that the addresses of the texts don't change over time. This script is still experimental, since I'm not very familiar with Diep.io Memory

//[START] Code Snippet from leaked FOV!
window.HEAPF32 = undefined;
const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
win.Object.defineProperty(win.Object.prototype, "HEAPF32", {
    get: function() {
        return undefined;
    },
    set: function(to) {
        if (!to || !this.HEAPU32) return;
        delete win.Object.prototype.HEAPF32;
        window.Module = this;
        window.Module.HEAPF32 = to;
        window.HEAPF32 = to;
    },
    configurable: true,
    enumerable: true
});

//[END] Code Snippet from leaked FOV!

//float32 values logic...
let float32_values = {
    fov: {
        initial_value: 0.3499999940395355,
        value: 0.3499999940395355,
        index: -1,
        updated: false,
    },
};

window.find_fov_index = (from=0) => {
    if(!window.HEAPF32 || !window.__common__ || window.__common__.screen_state === 'in-game') return -1;
    return window.HEAPF32.indexOf(float32_values.fov.initial_value, from);
}
function update_fov(){
    window.float32_values = float32_values;
    if(window.__common__.screen_state === 'connecting') float32_values.fov.updated=false;
    if(!float32_values.fov.updated){
        let temp_index = window.find_fov_index();
        if(temp_index != -1){
            float32_values.fov.index = temp_index;
            float32_values.fov.value = window.HEAPF32[temp_index];
            float32_values.fov.updated = true;
        }
    }else{
        float32_values.fov.value = window.HEAPF32[float32_values.fov.index];
    }
}
setInterval(update_fov, 100);

//unsigned8 logic...

//store your texts you want to search for here:
function new_txt(searching_word, _screen_state){
    let temp = {
        full_Strings: [],
        adresses: [],
        screen_state: _screen_state,
    }
    return temp;
}
let texts = {
    'Auto': new_txt('Auto', 'in-game'),
    'Lvl': new_txt('Lvl', 'in-game'),
    'Score: ': new_txt('Score', 'in-game'),
    'Minimap': new_txt('Minimap', 'awaiting-spawn'),
    'x:': new_txt('x', 'in-game'),
    'Leader': new_txt('Leader', 'in-game'),
    'Scoreboard': new_txt('Scoreboard', 'in-game'),
    'lineTo': new_txt('lineTo', 'in-game'),
};

//every character has it's ascii code (for computers to understand) that's why they letters are stored as numbers inside wasm

// 'word' -> [119, 111, 114, 100]
function stringToAscii(str) {
    return Array.from(str, char => char.charCodeAt(0));
}

// [119, 111, 114, 100] -> 'word'
function asciiToString(asciiArray) {
    return String.fromCharCode(...asciiArray);
}

//For example, the target word is Balloon. It searches for B.....n to optimise performance
function get_addresses_for_first_last_letter(first_letter, last_letter, _length, search_position = 0, addresses = []) {
    let Hu8 = window.Module.HEAPU8;
    while (search_position < Hu8.length - _length) {
        if (Hu8[search_position] === first_letter && Hu8[search_position + _length - 1] === last_letter) {
            addresses.push(search_position);
        }
        search_position++;
    }
    return addresses;
}

//finds all characters after the first character at address, by going until the null terminator (asciicode: 0)
function get_address_string(address) {
    let Hu8 = window.Module.HEAPU8;
    let ascii_array = [];
    let index = address;

    while (index < Hu8.length && Hu8[index] !== 0 && ascii_array.length < 100) {
        ascii_array.push(Hu8[index]);
        index++;
    }
    return asciiToString(ascii_array);
}

//Is B.....n actually Balloon?
function does_it_match(address, pattern){
    let Hu8 = window.Module.HEAPU8;
    let i = 0;
    let l = pattern.length;
    let matches = 0;
    while(i < l){
        if(Hu8[address+i]===pattern[i]){
            matches++;
        }
        i++;
    }
    return (matches === l);
}

//Main function that connects all previous one's together
function search_for_text(pattern) {
    if (!window.Module || !window.Module.HEAPU8) return;
    let patternStr = asciiToString(pattern);

    if (!texts[patternStr]) {
        texts[patternStr] = { full_Strings: [], adresses: [] };
    }

    let addresses;
    if (texts[patternStr].adresses.length === 0) {
        addresses = get_addresses_for_first_last_letter(pattern[0], pattern[pattern.length - 1], pattern.length);
        console.log(`Found addresses for '${patternStr}':`, addresses);
    } else {
        addresses = texts[patternStr].adresses;
    }

    texts[patternStr].full_Strings = [];
    texts[patternStr].adresses = [];
    for (let address of addresses) {
        if(does_it_match(address, pattern)){
            texts[patternStr].full_Strings.push(get_address_string(address));
            texts[patternStr].adresses.push(address);
        }
    }
    //console.log(texts);
    window.stored_texts = texts;
}

//looping the main function and going through condition checks for each word.
setInterval(() => {
    if(!window.__common__ || !window.__common__.screen_state) return;
    for (let text of Object.keys(texts)) {
        window.__common__.screen_state === texts[text].screen_state ? search_for_text(stringToAscii(text)) : null;
    }
}, 100);

//additional functionality:
window.get_adress_string = get_address_string;
window.next_word = function next_word(address, words = 1) {
    let offset = 0;
    while (window.Module.HEAPU8[address + offset] != 0) {
        offset++;
    }

    let nextAddress = address + offset + 1;
    let result = [{ word: get_address_string(nextAddress), address: nextAddress }];

    if (words > 1) {
        result = result.concat(next_word(nextAddress, words - 1));
    }

    return result;
};