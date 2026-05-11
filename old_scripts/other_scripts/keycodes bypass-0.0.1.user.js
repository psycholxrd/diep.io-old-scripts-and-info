// ==UserScript==
// @name         keycodes bypass
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  try to take over the world!
// @author       r!PsAw
// @match        https://diep.io/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// ==/UserScript==

(function() {
    const handler = {
        apply(r,o,args) {
            Error.stackTraceLimit = 0;
            return r.apply(o,args)
        }
    }
    Object.freeze = new Proxy(Object.freeze, handler)
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

    const callbackMap = new WeakMap();

    EventTarget.prototype.addEventListener = function(event, callback, options) {
        if (['keydown', 'keypress', 'keyup'].includes(event)) {
            const wrappedCallback = function(e) {
                const originalIsTrusted = e.isTrusted;
                const wrappedEvent = new Proxy(e, {
                    get(target, property) {
                        if (property === 'isTrusted') {
                            return true;
                        } else if (property === 'originalIsTrusted') {
                            return originalIsTrusted;
                        }
                        return target[property];
                    }
                });

                callback.call(this, wrappedEvent);
            };

            callbackMap.set(callback, wrappedCallback);
            originalAddEventListener.call(this, event, wrappedCallback, options);
        } else {
            originalAddEventListener.call(this, event, callback, options);
        }
    };

    EventTarget.prototype.removeEventListener = function(event, callback, options) {
        if (callbackMap.has(callback)) {
            const wrappedCallback = callbackMap.get(callback);
            originalRemoveEventListener.call(this, event, wrappedCallback, options);
            callbackMap.delete(callback);
        } else {
            originalRemoveEventListener.call(this, event, callback, options);
        }
    };
})();

window.addEventListener('DOMContentLoaded', function() {
function key_down(keyCode) {
    let event = new KeyboardEvent('keydown', {
        bubbles: true,
        keyCode: keyCode,
        key: String.fromCharCode(keyCode),
        code: `Key${String.fromCharCode(keyCode).toUpperCase()}`,
    });
    document.dispatchEvent(event);
}

function key_up(keyCode) {
    var event = new KeyboardEvent('keyup', {
        bubbles: true,
        keyCode: keyCode,
        key: String.fromCharCode(keyCode),
        code: `Key${String.fromCharCode(keyCode).toUpperCase()}`,
    });
    document.dispatchEvent(event);
}

});