// ==UserScript==
// @name         Diep.io+ (2.2 OUT NOW!)
// @namespace    http://tampermonkey.net/
// @version      2.2.0
// @description  Work in progres...
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// @license      MIT
// ==/UserScript==
 
//not finished with importing old functions yet
 
//inner script settings
let deep_debug_properties = {
    active: false,
}
 
function deep_debug(...args) {
    if (deep_debug_properties.active) {
        console.log(...args);
    }
}
 
//Information for script
let player = {
    connected: false,
    inGame: false,
    name: '',
    team: null,
    gamemode: null,
    ui_scale: 1,
    dpr: 1,
};
 
function windowScaling() {
    const a = canvas.height / 1080;
    const b = canvas.width / 1920;
    return b < a ? a : b;
}
 
class dimensions_converter {
    constructor() {
        this.scalingFactor = null; //undetectable without bypass
        this.fieldFactor = null;   //undetectable without bypass
    }
    canvas_2_window(a) {
        let b = a / (canvas.width / window.innerWidth);
        return b;
    }
 
    window_2_canvas(a) {
        let b = a * (canvas.width / window.innerWidth);
        return b;
    }
 
    windowScaling_2_window(a) {
        let b = (this.windowScaling_2_canvas(a)) / (canvas.width / window.innerWidth);
        return b;
    }
 
    windowScaling_2_canvas(a) {
        let b = a * windowScaling();
        deep_debug('windowScaling_2_canvas called! a, b', a, b);
        return b;
    }
/* DISABLED FOR NOW
    diepUnits_2_canvas(a) {
        let b = a / scalingFactor;
        return b;
    }
 
    diepUnits_2_window(a) {
        let b = (this.diepUnits_2_canvas(a)) / (canvas.width / window.innerWidth);
        return b;
    }
 
    window_2_diepUnits(a) {
        let b = (this.canvas_2_diepUnits(a)) * (canvas.width / window.innerWidth);
        return b;
    }
 
    canvas_2_diepUnits(a) {
        let b = a * this.scalingFactor;
        return b;
    }
*/
 
    window_2_windowScaling(a) {
        let b = (this.canvas_2_windowScaling(a)) * (canvas.width / window.innerWidth);
        return b;
    }
 
    canvas_2_windowScaling(a) {
        let b = a * windowScaling();
        return b;
    }
/* DISABLED FOR NOW
    diepUnits_2_windowScaling(a) {
        let b = (this.diepUnits_2_canvas(a)) * this.fieldFactor;
        return b;
    }
 
    windowScaling_2_diepUntis(a) {
        let b = (a / this.fieldFactor) * this.scalingFactor;
        return b;
    }
*/
}
 
let dim_c = new dimensions_converter();
 
function i_e(type, key, ...args) {
    switch (type) {
        case "input":
            input[key](...args);
            break
        case "extern":
            extern[key](...args);
            break
    }
}
 
let inputs = {
    mouse: {
        real: {
            x: 0,
            y: 0,
        },
        game: {
            x: 0,
            y: 0,
        },
        force: {
            x: 0,
            y: 0,
        },
        isForced: false,
        isFrozen: false,
        isShooting: false,
        original: {
            onTouchMove: null,
            onTouchStart: null,
            onTouchEnd: null,
        }
    },
    keys_pressed: [],
}
 
function apply_force(x, y) {
    inputs.mouse.force = {
        x: x,
        y: y,
    }
    inputs.mouse.isForced = true;
}
 
function disable_force() {
    inputs.mouse.isForced = false;
}
 
const touchMethods = ['onTouchMove', 'onTouchStart', 'onTouchEnd'];
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');
 
function define_onTouch() {
    touchMethods.forEach(function(method) {
        inputs.mouse.original[method] = input[method];
        deep_debug('defined input.', method);
    });
}
 
function clear_onTouch() {
    touchMethods.forEach(function(method) {
        input[method] = () => {};
    });
}
 
function redefine_onTouch() {
    touchMethods.forEach(function(method) {
        input[method] = inputs.mouse.original[method];
    });
}
 
function start_input_proxies(_filter = false, _single = false, _method = null) {
    ((_filter || _single) && !_method) ? console.warn("missing _method at start_input_proxies"): null;
    let temp_methods = touchMethods;
    if (_filter) {
        temp_methods.filter((item) => item != _method);
    } else if (_single) {
        temp_methods = [_method];
    }
    temp_methods.forEach(function(method) {
        input[method] = new Proxy(input[method], {
            apply: function(definition, input_obj, args) {
                let x, y, type, new_args;
                if (inputs.mouse.isForced) {
                    x = inputs.mouse.forced.x;
                    y = inputs.mouse.forced.y;
                } else {
                    x = args[1];
                    y = args[2];
                }
                type = args[0];
                new_args = [type, x / player.dpr, y / player.dpr];
                inputs.mouse.game = {
                    x: new_args[1],
                    y: new_args[2],
                }
                return Reflect.apply(definition, input_obj, new_args);
            }
        });
    });
}
 
function update_information() {
    window.requestAnimationFrame(update_information);
    let teams = ["blue", "red", "purple", "green"];
    player.connected = !!window.lobby_ip;
    player.connected? player.inGame = !!extern.doesHaveTank() : null;
    player.name = document.querySelector("#spawn-nickname").value;
    player.team = teams[parseInt(window.__common__.party_link.split('x')[1])];
    player.gamemode = window.__common__.active_gamemode;
    player.ui_scale = parseFloat(localStorage.getItem("d:ui_scale"))
}
window.requestAnimationFrame(update_information);
 
function waitForConnection() {
    if (player.connected) {
        define_onTouch();
        start_input_proxies();
    } else {
        setTimeout(waitForConnection, 100);
    }
}
waitForConnection();
 
//GUI
function n2id(string) {
    return string.toLowerCase().replace(/ /g, "-");
}
 
class El {
    constructor(
        name,
        type,
        el_color,
        width,
        height,
        opacity = "1",
        zindex = "100"
    ) {
        this.el = document.createElement(type);
        this.el.style.backgroundColor = el_color;
        this.el.style.width = width;
        this.el.style.height = height;
        this.el.style.opacity = opacity;
        this.el.style.zIndex = zindex;
        this.el.id = n2id(name);
        this.display = "block"; // store default display
    }
 
    setBorder(type, width, color, radius = 0) {
        const borderStyle = `${width} solid ${color}`;
        switch (type) {
            case "normal":
                this.el.style.border = borderStyle;
                break;
            case "top":
                this.el.style.borderTop = borderStyle;
                break;
            case "left":
                this.el.style.borderLeft = borderStyle;
                break;
            case "right":
                this.el.style.borderRight = borderStyle;
                break;
            case "bottom":
                this.el.style.borderBottom = borderStyle;
                break;
        }
        this.el.style.borderRadius = radius;
    }
 
    setPosition(
        position,
        display,
        top,
        left,
        flexDirection,
        justifyContent,
        translate
    ) {
        this.el.style.position = position;
        this.el.style.display = display;
        if (top) this.el.style.top = top;
        if (left) this.el.style.left = left;
        // Flex properties
        if (flexDirection) this.el.style.flexDirection = flexDirection;
        if (justifyContent) this.el.style.justifyContent = justifyContent;
        if (translate) this.el.style.transform = `translate(${translate})`;
        this.display = display;
    }
 
    margin(top, left, right, bottom) {
        this.el.style.margin = `${top} ${right} ${bottom} ${left}`;
    }
 
    setText(
        text,
        txtColor,
        font,
        weight,
        fontSize,
        stroke,
        alignContent,
        textAlign
    ) {
        this.el.innerHTML = text;
        this.el.style.color = txtColor;
        this.el.style.fontFamily = font;
        this.el.style.fontWeight = weight;
        this.el.style.fontSize = fontSize;
        this.el.style.textShadow = stroke;
        this.el.style.alignContent = alignContent;
        this.el.style.textAlign = textAlign;
    }
 
    add(parent) {
        parent.appendChild(this.el);
    }
 
    remove(parent) {
        parent.removeChild(this.el);
    }
 
    toggle(showOrHide) {
        this.el.style.display = showOrHide === "hide" ? "none" : this.display;
    }
}
 
let mainCont, header, subContGray, subContBlack, modCont, settCont;
 
class Module {
    constructor(name, type, submodules = null, settings, callback) {
        this.name = name;
        this.submodules = submodules;
        this.callbackFunc = callback;
        this.settings = settings;
        this.title = new El(name, "div", "transparent", "170px", "50px");
        this.title.setPosition("relative", "block");
        this.title.setText(
            name,
            "white",
            "Calibri",
            "bold",
            "15px",
            "2px",
            "center",
            "center"
        );
        this.elements = [];
        this.elements.push(this.title.el);
        switch (type) {
            case "toggle": {
                this.active = false;
                this.title.el.style.display = "flex";
                this.title.el.style.alignItems = "center";
                this.title.el.style.justifyContent = "space-between";
                let empty_checkbox = new El(
                    this.name + " checkbox",
                    "div",
                    "lightgray",
                    "20px",
                    "20px"
                );
                empty_checkbox.setBorder("normal", "2px", "gray", "4px");
                //event listeners
                empty_checkbox.el.addEventListener("mousedown", (e) => {
                    if (e.button != 0) return;
                    this.active = !this.active;
                    if (this.active) {
                        empty_checkbox.el.innerHTML = "✔";
                        empty_checkbox.el.style.backgroundColor = "green";
                        empty_checkbox.setBorder("normal", "2px", "lime", "4px");
                    } else {
                        empty_checkbox.el.innerHTML = "";
                        empty_checkbox.el.style.backgroundColor = "lightgray";
                        empty_checkbox.setBorder("normal", "2px", "gray", "4px");
                    }
                });
                empty_checkbox.el.addEventListener("mouseover", () => {
                    empty_checkbox.el.style.backgroundColor = this.active ?
                        "darkgreen" :
                        "darkgray";
                    empty_checkbox.el.style.cursor = "pointer";
                });
                empty_checkbox.el.addEventListener("mouseout", () => {
                    empty_checkbox.el.style.backgroundColor = this.active ?
                        "green" :
                        "lightgray";
                });
                this.title.el.appendChild(empty_checkbox.el);
                break;
            }
            case "slider": {
                this.value = 100;
                this.title.el.innerHTML = `${this.name}: ${this.value} %`;
                const slider = document.createElement("input");
                slider.type = "range";
                slider.value = this.value;
                slider.min = 0;
                slider.max = 100;
 
                slider.addEventListener("input", () => {
                    this.value = slider.value;
                    this.title.el.innerHTML = `${this.name}: ${this.value} %`;
                });
 
                this.elements.push(slider);
                break;
            }
            case "button":
                this.title.setBorder("normal", '2px', 'white', '10px');
                this.title.el.style.cursor = "pointer";
                this.title.el.addEventListener("mousedown", () => {
                    if (this.callbackFunc) {
                        this.callbackFunc();
                    }
                });
                break;
            case "color":
                break;
        }
    }
    load() {
        this.elements.forEach((element) => modCont.el.appendChild(element));
    }
 
    unload() {
        this.elements.forEach((element) => {
            if (modCont.el.contains(element)) {
                modCont.el.removeChild(element);
            }
        });
    }
}
 
class Category {
    constructor(name, modules) {
        this.name = name;
        this.element = new El(name, "div", "rgb(38, 38, 38)", "90px", "50px");
        this.element.setPosition("relative", "block");
        this.element.setText(
            name,
            "white",
            "Calibri",
            "bold",
            "20px",
            "2px",
            "center",
            "center"
        );
        this.element.setBorder("normal", "2px", "transparent", "10px");
        this.selected = false;
        this.modules = modules;
 
        this.element.el.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;
            this.selected = !this.selected;
            this.element.el.style.backgroundColor = this.selected ?
                "lightgray" :
                "rgb(38, 38, 38)";
            handle_categories_selection(this.name);
            if (!this.selected) unload_modules(this.name);
        });
 
        this.element.el.addEventListener("mouseover", () => {
            if (!this.selected) {
                this.element.el.style.backgroundColor = "rgb(58, 58, 58)";
                this.element.el.style.cursor = "pointer";
            }
        });
 
        this.element.el.addEventListener("mouseout", () => {
            if (!this.selected)
                this.element.el.style.backgroundColor = "rgb(38, 38, 38)";
        });
    }
    unselect() {
        this.selected = false;
        this.element.el.style.backgroundColor = "rgb(38, 38, 38)";
    }
}
 
//1travel
let modules = {
    'Info': {
        q_a1: new Module("Where is the rest of the scripts?", "button", null, null, () => {
            alert("They're patched, I can't make the bypass public for now, because it will be patched too");
        }),
        q_a2: new Module("Why no updates so long?", "button", null, null, () => {
            alert("I had some things to do in the university + I was working on a big canvas API, that no longer works due to the patch");
        }),
        q_a3: new Module("I have a problem/question where can I contact you?", "button", null, null, () => {
            alert("Dm me on discord. My tag is: h3llside");
        }),
        q_a4: new Module("What will happen to Diep.io+ after Diep Police Department?", "button", null, null, () => {
            alert(`
            There are two possbile outcomes:
            1. I will make it a Ghost client, meaning it will contain helpful functions that make your life easier, but don't give you any advantages public and move everything else to Addons (make it private) OR
            2. I will make bannable cheats less detectable
            `);
        }),
        q_a5: new Module("I really want to have access for Addons, can I have it?", "button", null, null, () => {
            alert(`
            No, unless you give me something in return. For example some useful information for bypassing or someone's private script
            `);
        }),
        q_a6: new Module("I want you to make a script for me, can you do it?", "button", null, null, () => {
            alert(`
            If it's simple - yes. If not, well I want a reward then in any form, because my time and energy are limited, to waste hours on someone who wants some personalised script
            `);
        }),
    },
    Visual: {
        Key_inputs_visualiser: new Module("Key Inputs Visualiser", "toggle"),
    },
    Functional: {
        CopyLink: new Module("Copy Party Link", "button", null, null, () => {
            document.getElementById("copy-party-link").click();
        }),
        //glitched Name
        Sandbox_lvl_up: new Module("Sandbox Auto Level Up", "toggle"),
        Auto_respawn: new Module("Auto Respawn", "toggle"),
        Anti_timeout: new Module("Anti AFK Timeout", "toggle"),
        Zoom: new Module("Zoom Out", "slider"),
    },
    Mouse: {
        Anti_aim: new Module("Anti Aim", "toggle"),
        Freeze_mouse: new Module("Freeze Mouse", "toggle"),
    },
    DiepConsole: {
        con_toggle: new Module("Show/hide Diep Console", "toggle"),
        net_predict_movement: new Module("predict movement", "toggle"),
        //game builds
        //render
    },
    Addons: {},
};
 
let categories = [];
 
function create_categories() {
    for (let key in modules) {
        categories.push(new Category(key, modules[key]));
    }
}
create_categories();
 
function load_modules(category_name) {
    const current_category = categories.find(
        (category) => category.name === category_name
    );
    for (let moduleName in current_category.modules) {
        current_category.modules[moduleName].load();
    }
}
 
function unload_modules(category_name) {
    const current_category = categories.find(
        (category) => category.name === category_name
    );
    for (let moduleName in current_category.modules) {
        current_category.modules[moduleName].unload();
    }
}
 
function handle_categories_selection(current_name) {
    categories.forEach((category) => {
        if (category.name !== current_name && category.selected) {
            category.unselect();
            unload_modules(category.name);
        }
    });
 
    load_modules(current_name);
}
 
function loadCategories() {
    const categoryCont = document.querySelector("#sub-container-gray");
    categories.forEach((category) =>
        categoryCont.appendChild(category.element.el)
    );
}
 
function load_selected() {
    categories.forEach((category) => {
        if (category.selected) {
            load_modules(category.name);
        }
    });
}
 
function loadGUI() {
    document.body.style.margin = "0";
    document.body.style.display = "flex";
    document.body.style.justifyContent = "left";
 
    mainCont = new El("Main Cont", "div", "rgb(38, 38, 38)", "500px", "400px");
    mainCont.setBorder("normal", "2px", "lime", "10px");
    mainCont.el.style.display = "flex";
    mainCont.el.style.flexDirection = "column";
    mainCont.add(document.body);
 
    header = new El("Headline Dp", "div", "transparent", "100%", "40px");
    header.setBorder("bottom", "2px", "rgb(106, 173, 84)");
    header.setText(
        "Diep.io+ by r!PsAw (Hide GUI with J)",
        "white",
        "Calibri",
        "bold",
        "20px",
        "2px",
        "center",
        "center"
    );
    header.add(mainCont.el);
 
    const contentWrapper = document.createElement("div");
    contentWrapper.style.display = "flex";
    contentWrapper.style.gap = "10px";
    contentWrapper.style.padding = "10px";
    contentWrapper.style.flex = "1";
    mainCont.el.appendChild(contentWrapper);
 
    subContGray = new El(
        "Sub Container Gray",
        "div",
        "transparent",
        "100px",
        "100%"
    );
    subContGray.el.style.display = "flex";
    subContGray.el.style.flexDirection = "column";
    subContGray.el.style.overflowY = "auto";
    subContGray.add(contentWrapper);
 
    subContBlack = new El("Sub Container Black", "div", "black", "360px", "100%");
    subContBlack.el.style.display = "flex";
    subContBlack.el.style.gap = "10px";
    subContBlack.add(contentWrapper);
 
    modCont = new El("Module Container", "div", "transparent", "50%", "100%");
    modCont.el.style.display = "flex";
    modCont.el.style.flexDirection = "column";
    modCont.el.style.overflowY = "auto";
    modCont.setBorder("right", "2px", "white");
    modCont.add(subContBlack.el);
 
    settCont = new El("Settings Container", "div", "transparent", "50%", "100%");
    settCont.el.style.display = "flex";
    settCont.el.style.flexDirection = "column";
    settCont.el.style.overflowY = "auto";
    settCont.add(subContBlack.el);
 
    loadCategories();
    load_selected();
}
 
loadGUI();
document.addEventListener("keydown", toggleGUI);
 
function toggleGUI(e) {
    if (e.key === "j" || e.key === "J") {
        if (mainCont.el) {
            mainCont.remove(document.body);
            mainCont.el = null;
        } else {
            loadGUI();
        }
    }
}
 
//actual logic
 
// ]-[ HTML RELATED STUFF
let homescreen = document.getElementById("home-screen");
let ingamescreen = document.getElementById("in-game-screen");
let gameOverScreen = document.getElementById('game-over-screen');
let gameOverScreenContainer = document.querySelector("#game-over-screen > div > div.game-details > div:nth-child(1)");
function update_scale_option(selector, label, min, max) {
    let element = document.querySelector(selector);
    let label_element = element.closest("div").querySelector("span");
    label_element.innerHTML = `[DIEP.IO+] ${label}`;
    label_element.style.background = "black";
    label_element.style.color = "purple";
    element.min = min;
    element.max = max;
}
 
function new_ranges_for_scales() {
    update_scale_option("#subsetting-option-ui_scale", "UI Scale", '0.01', '1000');
    update_scale_option("#subsetting-option-border_radius", "UI Border Radius", '0.01', '1000');
    update_scale_option("#subsetting-option-border_intensity", "UI Border Intensity", '0.01', '1000');
}
 
new_ranges_for_scales();
 
//detect gamemode
let gamemode = document.querySelector("#gamemode-selector > div > div.selected > div.dropdown-label").innerHTML;
let last_gamemode = localStorage.getItem(`[Diep.io+] last_gm`);
localStorage.setItem(`[Diep.io+] last_gm}`, gamemode);
 
function check_gamemode() {
        gamemode = document.querySelector("#gamemode-selector > div > div.selected > div.dropdown-label").innerHTML;
        save_gm();
}
 
setInterval(check_gamemode, 250);
 
function save_gm() {
    let saved_gm = localStorage.getItem(`[Diep.io+] last_gm`);
    if (saved_gm != null && saved_gm != gamemode) {
        last_gamemode = saved_gm;
    }
    saved_gm === null ? localStorage.setItem(`[Diep.io+] last_gm}`, gamemode) : null;
}
 
//personal best
let your_final_score = 0;
const personal_best = document.createElement('div');
const gameDetail = document.createElement('div');
const label = document.createElement('div');
//applying class
gameDetail.classList.add("game-detail");
label.classList.add("label");
personal_best.classList.add("value");
//text context
label.textContent = "Best:";
//adding to html
gameOverScreenContainer.appendChild(gameDetail);
gameDetail.appendChild(label);
gameDetail.appendChild(personal_best);
 
function load_ls() {
    return localStorage.getItem(gamemode);
}
 
function save_ls() {
    localStorage.setItem(gamemode, your_final_score);
}
 
function check_final_score() {
    if (window.__common__.screen_state === "game-over") {
        your_final_score = window.__common__.death_score;
        let saved_score = parseFloat(load_ls());
        personal_best.textContent = saved_score;
        if (saved_score < your_final_score) {
            personal_best.textContent = your_final_score;
            save_ls();
        }
    }
}
 
setInterval(check_final_score, 100);
 
//remove annoying html elements
function instant_remove() {
    // Define selectors for elements to remove
    const selectors = [
        "#cmpPersistentLink",
        "#apes-io-promo",
        "#apes-io-promo > img",
        "#last-updated",
        "#diep-io_300x250"
    ];
 
    // Remove each selected element
    selectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.remove();
        }
    });
 
    // If all elements have been removed, clear the interval
    if (selectors.every(selector => !document.querySelector(selector))) {
        console.log("Removed all ads, quitting...");
        clearInterval(interval);
    }
}
 
// Set an interval to check for ads
const interval = setInterval(instant_remove, 100);
 
// ]-[
 
//DiepConsole
function handle_con_toggle(state){
    if(extern.isConActive() != state){
        extern.execute('con_toggle');
    }
}
 
function update_diep_console(){
    for(let param in modules.DiepConsole){
        let state = modules.DiepConsole[param].active;
        if(param === "con_toggle"){
            handle_con_toggle(state)
        }else{
            extern.set_convar(param, state);
        }
    }
}
setInterval(update_diep_console, 100);
 
//////
//mouse functions
 
window.addEventListener('mousemove', function(event) {
    inputs.mouse.real.x = event.clientX;
    inputs.mouse.real.y = event.clientY;
});
 
window.addEventListener('mousedown', function(event) {
    if (modules.Mouse.Anti_aim.active) {
        if (inputs.mouse.shooting) {
            return;
        }
        inputs.mouse.shooting = true;
        freezeMouseMove();
        setTimeout(function() {
            inputs.mouse.shooting = false;
            mouse_move('extern', inputs.mouse.real.x, inputs.mouse.real.y);
            click_at('extern', inputs.mouse.real.x, inputs.mouse.real.y);
        }, 50);
    };
});
 
function handle_mouse_functions() {
    window.requestAnimationFrame(handle_mouse_functions);
    if (!player.connected) {
        return;
    }
    modules.Mouse.Freeze_mouse.active ? freezeMouseMove() : unfreezeMouseMove();
    modules.Mouse.Anti_aim.active ? anti_aim("On") : anti_aim("Off");
}
window.requestAnimationFrame(handle_mouse_functions);
 
//anti aim
function detect_corner() {
    deep_debug('corner detect called');
    let w = window.innerWidth;
    let h = window.innerHeight;
    let center = {
        x: w / 2,
        y: h / 2
    };
    let lr, ud;
    inputs.mouse.real.x > center.x ? lr = "r" : lr = "l";
    inputs.mouse.real.y > center.y ? ud = "d" : ud = "u";
    deep_debug('output: ', lr + ud);
    return lr + ud;
}
 
function look_at_corner(corner) {
    deep_debug('look at corner called with corner', corner);
    if (!inputs.mouse.shooting) {
        let w = window.innerWidth;
        let h = window.innerHeight;
        deep_debug('w and h', w, h);
        deep_debug('inputs: ', inputs);
        switch (corner) {
            case "lu":
                anti_aim_at('extern', w, h);
                break
            case "ld":
                anti_aim_at('extern', w, 0);
                break
            case "ru":
                anti_aim_at('extern', 0, h);
                break
            case "rd":
                anti_aim_at('extern', 0, 0);
                break
        }
    }
}
 
function anti_aim(toggle) {
    deep_debug('anti aim called with:', toggle);
    switch (toggle) {
        case "On":
            if (modules.Mouse.Anti_aim.active) {
                deep_debug('condition !modules.Mouse.Anti_aim.active met');
                look_at_corner(detect_corner());
            }
            break
        case "Off":
            deep_debug('inputs.mouse.isFrozen ', inputs.mouse.isFrozen);
            (inputs.mouse.isFrozen && !modules.Mouse.Freeze_mouse.active) ? unfreezeMouseMove(): null;
            break
    }
}
// Example: Freeze and unfreeze
function freezeMouseMove() {
    if (!inputs.mouse.isFrozen) {
        inputs.mouse.isFrozen = true;
        clear_onTouch();
        deep_debug("Mousemove events are frozen.");
    }
}
 
function unfreezeMouseMove() {
    if (inputs.mouse.isFrozen && !inputs.mouse.isShooting) {
        inputs.mouse.isFrozen = false;
        redefine_onTouch();
        deep_debug("Mousemove events are active.");
    }
}
 
function click_at(input_or_extern, x, y, delay1 = 150, delay2 = 500) {
    apply_force(x, y);
    i_e(input_or_extern, 'onTouchStart', -1, x, y);
    setTimeout(() => {
        i_e(input_or_extern, 'onTouchEnd', -1, x, y);
    }, delay1);
    setTimeout(() => {
        inputs.mouse.shooting = false;
    }, delay2);
    disable_force();
}
 
function ghost_click_at(input_or_extern, x, y, delay1 = 150, delay2 = 500) {
    apply_force(x, y);
    i_e(input_or_extern, 'onTouchStart', -2, x, y);
    setTimeout(() => {
        i_e(input_or_extern, 'onTouchEnd', -2, x, y);
    }, delay1);
    setTimeout(() => {
        inputs.mouse.shooting = false;
    }, delay2);
    disable_force();
}
 
function mouse_move(input_or_extern, x, y) {
    deep_debug('mouse move called with', x, y);
    apply_force(x, y);
    i_e(input_or_extern, 'onTouchMove', -1, x, y);
    disable_force();
}
 
function anti_aim_at(input_or_extern, x, y) {
    deep_debug('frozen, shooting', inputs.mouse.isFrozen, inputs.mouse.isShooting);
    deep_debug('anti aim at called with:', x, y);
    if (inputs.mouse.shooting) {
        deep_debug('quit because inputs.mouse.shooting');
        return;
    }
    mouse_move(input_or_extern, x, y);
}
//////
 
//Sandbox Auto Lvl up
function sandbox_lvl_up() {
    if (modules.Functional.Sandbox_lvl_up.active && player.connected && player.inGame && player.gamemode === "sandbox") {
        document.querySelector("#sandbox-max-level").click();
    }
}
setInterval(sandbox_lvl_up, 500);
 
//autorespawn
function respawn() {
    deep_debug(modules);
    if (modules.Functional.Auto_respawn.active && player.connected && !player.inGame) {
        extern.try_spawn(player.name);
    }
}
 
setInterval(respawn, 1000);
 
//AntiAfk Timeout
function AntiAfkTimeout() {
    if (modules.Functional.Anti_timeout.active && player.connected) {
        extern.onTouchMove(inputs.mouse.real.x, inputs.mouse.real.y);
    }
}
setInterval(AntiAfkTimeout, 1000);
 
//Zoom
function HandleZoom() {
    window.requestAnimationFrame(HandleZoom);
    if (!player.isConnected) return;
    player.dpr = 1;
    let factor = modules.Functional.Zoom.value / 100;
    extern.setScreensizeZoom(player.ui_scale, player.dpr * factor);
    extern.updateDPR(player.dpr);
}
window.requestAnimationFrame(HandleZoom);
 
//ctx helper functions
function ctx_text(fcolor, scolor, lineWidth, font, text, textX, textY) {
    deep_debug('called crx_text with: ', fcolor, scolor, lineWidth, font, text, textX, textY);
    ctx.fillStyle = fcolor;
    ctx.lineWidth = lineWidth;
    ctx.font = font;
    ctx.strokeStyle = scolor;
    ctx.strokeText(`${text}`, textX, textY)
    ctx.fillText(`${text}`, textX, textY)
}
 
function ctx_rect(x, y, a, b, c) {
    deep_debug('called ctx_rect with: ', x, y, a, b, c);
    ctx.beginPath();
    ctx.strokeStyle = c;
    ctx.strokeRect(x, y, a, b);
}
 
function transparent_rect_fill(x, y, a, b, scolor, fcolor, opacity){
    deep_debug('called transparent_rect_fill with: ', x, y, a, b, scolor, fcolor, opacity);
     ctx.beginPath();
    ctx.rect(x, y, a, b);
 
    // Set stroke opacity
    ctx.globalAlpha = 1;// Reset to 1 for stroke, or set as needed
    ctx.strokeStyle = scolor;
    ctx.stroke();
 
    // Set fill opacity
    ctx.globalAlpha = opacity;// Set the opacity for the fill color
    ctx.fillStyle = fcolor;
    ctx.fill();
 
    // Reset globalAlpha back to 1 for future operations
    ctx.globalAlpha = 1;
}
 
//key visualiser
let ctx_wasd = {
    square_sizes: { //in windowScaling
        a: 50,
        b: 50
    },
    text_props: {
        lineWidth:  3,
        font: 1 + "em Ubuntu",
    },
    square_colors: {
        stroke: "black",
        unpressed: "yellow",
        pressed: "orange"
    },
    text_colors: {
        stroke: "black",
        unpressed: "orange",
        pressed: "red"
    },
    w: {
        x: 300,
        y: 200,
        pressed: false,
        text: 'W'
    },
    a: {
        x: 350,
        y: 150,
        pressed: false,
        text: 'A'
    },
    s: {
        x: 300,
        y: 150,
        pressed: false,
        text: 'S'
    },
    d: {
        x: 250,
        y: 150,
        pressed: false,
        text: 'D'
    },
    l_m: {
        x: 350,
        y: 75,
        pressed: false,
        text: 'LMC'
    },
    r_m: {
        x: 250,
        y: 75,
        pressed: false,
        text: 'RMC'
    },
}
 
function visualise_keys(){
    let keys = ['w', 'a', 's', 'd', 'l_m', 'r_m'];
    let l = keys.length;
    for(let i = 0; i < l; i++){
    let args = {
        x: canvas.width - dim_c.windowScaling_2_canvas(ctx_wasd[keys[i]].x),
        y: canvas.height - dim_c.windowScaling_2_canvas(ctx_wasd[keys[i]].y),
        a: dim_c.windowScaling_2_canvas(ctx_wasd.square_sizes.a),
        b: dim_c.windowScaling_2_canvas(ctx_wasd.square_sizes.b),
        s_c: ctx_wasd.square_colors.stroke,
        f_c: ctx_wasd[keys[i]].pressed? ctx_wasd.square_colors.pressed : ctx_wasd.square_colors.unpressed,
        t_s: ctx_wasd.text_colors.stroke,
        t_f: ctx_wasd[keys[i]].pressed? ctx_wasd.text_colors.pressed : ctx_wasd.text_colors.unpressed,
        t_lineWidth: ctx_wasd.text_props.lineWidth,
        t_font: ctx_wasd.text_props.font,
        text: ctx_wasd[keys[i]].text,
        opacity: 0.25
    }
    deep_debug(args);
    transparent_rect_fill(
        args.x,
        args.y,
        args.a,
        args.b,
        args.s_c,
        args.f_c,
        args.opacity
    );
       ctx_text(
           args.t_f,
           args.t_s,
           args.t_lineWidth,
           args.t_font,
           args.text,
           args.x+(args.a/2),
           args.y+(args.b/2)
       );
    }
}
 
document.body.addEventListener("keydown", function(e) {
    deep_debug(`pressed ${e.code}`);
    switch(e.code){
        case "KeyW":
            ctx_wasd.w.pressed = true;
            break
        case "KeyA":
            ctx_wasd.a.pressed = true;
            break
        case "KeyS":
            ctx_wasd.s.pressed = true;
            break
        case "KeyD":
            ctx_wasd.d.pressed = true;
            break
    }
    deep_debug('====DID PRESS??', ctx_wasd.w.pressed, ctx_wasd.a.pressed, ctx_wasd.s.pressed, ctx_wasd.d.pressed);
});
 
document.body.addEventListener("keyup", function(e) {
    deep_debug(`unpressed ${e.code}`);
    switch(e.code){
        case "KeyW":
            ctx_wasd.w.pressed = false;
            break
        case "KeyA":
            ctx_wasd.a.pressed = false;
            break
        case "KeyS":
            ctx_wasd.s.pressed = false;
            break
        case "KeyD":
            ctx_wasd.d.pressed = false;
            break
    }
    deep_debug('====DID UNPRESS??', ctx_wasd.w.pressed, ctx_wasd.a.pressed, ctx_wasd.s.pressed, ctx_wasd.d.pressed);
});
 
document.body.addEventListener("mousedown", function(e) {
    switch(e.button){
        case 0:
            ctx_wasd.l_m.pressed = true;
            break
        case 2:
            ctx_wasd.r_m.pressed = true;
            break
    }
});
 
document.body.addEventListener("mouseup", function(e) {
    switch(e.button){
        case 0:
            ctx_wasd.l_m.pressed = false;
            break
        case 2:
            ctx_wasd.r_m.pressed = false;
            break
    }
});
 
//canvas gui (try to keep this in the end
setTimeout(() => {
    let gui = () => {
        if (player.inGame) {
 
            if (modules.Visual.Key_inputs_visualiser.active) {
                visualise_keys();
            }
        }
        window.requestAnimationFrame(gui); // Start animation loop
    };
    gui();
}, 500); // Delay before starting the rendering