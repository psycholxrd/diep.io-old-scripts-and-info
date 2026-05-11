// ==UserScript==
// @name         Find your tank level, maybe?
// @namespace    http://tampermonkey.net/
// @version      2025-03-20
// @description  try to take over the world!
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// ==/UserScript==
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
        search_for_tank();
    },
    configurable: true,
    enumerable: true
});

function search_for_tank() {
    const pattern = [76, 118, 108, 32]; // "Lvl " in ASCII
    const patternLength = pattern.length;
    let searchPosition = 0;
    let lastCheckTime = 0;
    const throttleInterval = 16; // Limits scanning frequency

    function scanMemory(timestamp) {
        if (timestamp - lastCheckTime < throttleInterval) {
            requestAnimationFrame(scanMemory);
            return;
        }
        lastCheckTime = timestamp;

        if (!window.Module || !window.Module.HEAPU8) {
            requestAnimationFrame(scanMemory);
            return;
        }

        const heapU8 = window.Module.HEAPU8;
        const heapLength = heapU8.length;
        const scanLimit = Math.min(searchPosition + 150000, heapLength - patternLength - 20);

        while (searchPosition < scanLimit) {
            // Fast pre-check: Compare first and last element of the pattern
            if (
                heapU8[searchPosition] === pattern[0] &&
                heapU8[searchPosition + patternLength - 1] === pattern[patternLength - 1]
            ) {
                let patternMatch = true;
                for (let i = 1; i < patternLength - 1; i++) { // Skip first & last, already checked
                    if (heapU8[searchPosition + i] !== pattern[i]) {
                        patternMatch = false;
                        break;
                    }
                }

                if (patternMatch) {
                    //console.log(`Found "Lvl " at position: ${searchPosition}`);

                    let final_arr = [];
                    let pos = searchPosition; // Use a separate variable to track position

                    while (heapU8[pos] !== 0 && pos < heapU8.length) { // Ensure it doesn't go out of bounds
                        final_arr.push(heapU8[pos]);
                        pos++; // Move to the next byte
                    }

                    console.log(String.fromCharCode(...final_arr)); // Convert to readable string
                    break;
                }

            }

            searchPosition++;
        }

        // Restart scan when reaching end of heap
        if (searchPosition >= heapLength - patternLength - 20) {
            searchPosition = 0;
        }

        requestAnimationFrame(scanMemory);
    }

    requestAnimationFrame(scanMemory);
}