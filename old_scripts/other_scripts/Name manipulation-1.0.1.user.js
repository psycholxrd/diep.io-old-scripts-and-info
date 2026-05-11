// ==UserScript==
// @name         Name manipulation
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  random, glitched, longest or custom name
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// @license      MIT
// ==/UserScript==

//NOTE: this script will change your name once you spawn, however the one you had before won't be overwritten
let s = "®¡Psªw";
let loaded = false;
let modes = {
    random: 'random', //picks you a name out of random characters (every single one included)
    glitched1: 0x110000, //6 symbols in leaderboard & name, but 12 when someone kills you/when you press 'o'
    glitched2: "a", //blanc name, question marks on death
    glitched3: 'array', //D E A T H ingame and when killed it goes vertically
    longest: 65021, //﷽
    custom: 0x0DB0, //pick a number between 0 and 65536
    array: [s.charCodeAt(0), 10, s.charCodeAt(1), 10, s.charCodeAt(2), 10, s.charCodeAt(3), 10, s.charCodeAt(4), 10, s.charCodeAt(5)],
}

let selected = modes.glitched3; //select mode here after .

function randomAscii() {
    return Math.floor(Math.random() * 65536);
}

function init() {
    if (window.lobby_ip) {
        loaded = true;

        extern.try_spawn = new Proxy(extern.try_spawn, {
            apply: function(definition, extern_obj, arguments_list) {
                let interesting = {
                    length: selected === 'array'? modes.array.length:15,
                    charCodeAt(i) {
                        console.log(`called ${i}`);
                        if(selected === 'random'){
                            return randomAscii();
                        }else if(selected === 'array'){
                            return modes.array[i];
                        }else{
                            return selected;
                        }
                    },
                };

                const argument = {
                    toString() {
                        console.log("successfully injected custom argument :)");
                        return interesting;
                    },
                };

                return Reflect.apply(definition, extern_obj, [argument]);
            }
        });
    } else {
        setTimeout(() => {
            init();
        }, 100);
    }
}
init();