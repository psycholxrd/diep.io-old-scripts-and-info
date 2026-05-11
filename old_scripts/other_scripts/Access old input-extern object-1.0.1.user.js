// ==UserScript==
// @name         Access old input/extern object
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  gets access to most client side functions from the game
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// @run-at       document-start
// ==/UserScript==

const prop = '_cp5_destroy';
Object.defineProperty(Object.prototype, prop, {
    get: function(){
        return undefined
    },
    set: function(new_val){
        if(this.pauseMainLoop){
            window.N = this;
            console.log('N found! Deleting Object hook for N...');
            delete Object.prototype[prop]
            //not required but nice to have for debugging
            if(!(prop in Object.prototype) && !(prop in {})){
                console.log('%cN Object hook successfully deleted!', 'color: green');
            }else{
                console.warn('N Object hook was not removed, despite N being found! Checking cases...');
                let msg = [prop in Object.prototype, prop in {}];
                msg[0]? console.log('%cObject.prototype still has _cp5_destroy', 'color: red') : null;
                msg[1]? console.log('%cnew created Object still has _cp5_destroy', 'color: red') : null;
            }
        }
    },
    configurable: true,
});

const prop2 = 'grant_reward';
Object.defineProperty(Object.prototype, prop2, {
    get: function() {
        return undefined
    },
    set: function(new_val) {
        if (this.spawn_player) {
            window.n = this;
            console.log('n found! Deleting Object hook for n...');
            delete Object.prototype[prop2]
            //not required but nice to have for debugging
            if (!(prop2 in Object.prototype) && !(prop2 in {})) {
                console.log('%cn Object hook successfully deleted!', 'color: green');
            } else {
                console.warn('n Object hook was not removed, despite n being found! Checking cases...');
                let msg = [prop2 in Object.prototype, prop2 in {}];
                msg[0] ? console.log('%cObject.prototype still has grant_reward', 'color: red') : null;
                msg[1] ? console.log('%cnew created Object still has grant_reward', 'color: red') : null;
            }
        }
    },
    configurable: true,
});