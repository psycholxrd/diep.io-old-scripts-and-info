// ==UserScript==
// @name         Diep.io+ (added uninvisible yourself)
// @namespace    http://tampermonkey.net/
// @version      2.3.2.1
// @description  Quick Tank Upgrades, Highscore saver, Team Switcher, Advanced Auto Respawn, Anti Aim, Zoom hack, Anti AFK Timeout, Sandbox Auto K, Sandbox Arena Increase, Tank Aim lines, Farm Bot
// @author       r!PsAw, DimRom
// @match        https://diep.io/*
// @icon         https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFMDAvSZe2hsFwAIeAPcDSNx8X2lUMp-rLPA&s
// @grant        none
// @license      Mi300 don't steal my scripts ;)
// ==/UserScript==
 
const fingerprint = {sdfouhi152037892348iuaosfhuiasfDAJSP: 'This Object exists to differentiate between user inputs and script inputs since both use same functions'};
 
//Linked List
class LinkedList {
  #first_element;
  #last_element;
  #size;
  constructor() {
    this.#first_element = null;
    this.#last_element = null;
    this.#size = 0;
  }
  #create_element(v = undefined, l = null, n = null) {
    let temp = {
      value: v,
      prev: l,
      next: n,
    };
    return temp;
  }
  addFirst(value) {
    this.#size++;
    let decide = this.#first_element ? this.#first_element : null;
    let obj = this.#create_element(value, null, decide);
    if (obj.next) obj.next.prev = obj;
    this.#first_element = obj;
    if (!this.#last_element) this.#last_element = obj;
  }
  getFirst() {
    return this.#first_element;
  }
  removeFirst() {
    if(this.#size>0) this.#size--;
    if (!this.#first_element) return;
    this.#first_element = this.#first_element.next;
    if (this.#first_element) {
      this.#first_element.prev = null;
    } else {
      this.#last_element = null;
    }
  }
 
  addLast(value) {
    this.#size++;
    let decide = this.#last_element ? this.#last_element : null;
    let obj = this.#create_element(value, decide, null);
    if (obj.prev) obj.prev.next = obj;
    this.#last_element = obj;
    if (!this.#first_element) this.#first_element = obj;
  }
  getLast() {
    return this.#last_element;
  }
  removeLast() {
    if(this.#size > 0) this.#size--;
    if (!this.#last_element) return;
    this.#last_element = this.#last_element.prev;
    if (this.#last_element) {
      this.#last_element.next = null;
    } else {
      this.#first_element = null;
    }
  }
  size(){
      return this.#size;
  }
}
 
//inner script settings
let deep_debug_properties = {
    active: false, //display information in console
    canvas: false, //display information on screen
}
 
function deep_debug(...args) {
    if (deep_debug_properties.active) {
        console.log(...args);
    }
}
 
//Information for script
let _c = window.__common__;
function is_fullscreen(){
    return ((window.innerHeight == screen.height) && (window.innerWidth == screen.width));
}
 
const diep_keys = [ //document has to be focused to execute these, also C and E don't work right now
  "KeyA", "KeyB", "KeyC", "KeyD", "KeyE", "KeyF", "KeyG", "KeyH", "KeyI", "KeyJ", "KeyK", "KeyL", "KeyM", "KeyN", "KeyO", "KeyP", "KeyQ", "KeyR", "KeyS", "KeyT", "KeyU", "KeyV", "KeyW", "KeyX", "KeyY", "KeyZ",
  "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "Tab", "Enter", "NumpadEnter", "ShiftLeft", "ShiftRight", "Space", "Numpad0", "Numpad1", "Numpad2", "Numpad3", "Numpad4", "Numpad5", "Numpad6", "Numpad7", "Numpad8", "Numpad9",
  "Digit0", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "F2", "End", "Home", "Semicolon", "Comma", "NumpadComma", "Period", "Backslash"
].reduce((n, e, c) => {
  n[e] = c + 1;
  return n;
}, {});
 
let player = {
    connected: false,
    inGame: false,
    name: '',
    team: null,
    gamemode: null,
    ui_scale: 1,
    dpr: 1,
    base_value: 1,
};
 
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
        isForced: false, //input mouse operations flag (overwrites your inputs to forced one's)
        isFrozen: false, //Mouse Freeze flag
        isShooting: false, //Anti Aim flag
        isPaused: false, //Anti Aim flag (different from isFrozen & isForced for better readability)
        original: {
            onTouchMove: null,
            onTouchStart: null,
            onTouchEnd: null,
        }
    },
    moving_game: {
        KeyW: false,
        KeyA: false,
        KeyS: false,
        KeyD: false,
        ArrowUp: false,
        ArrowRight: false,
        ArrowDown: false,
        ArrowLeft: false,
    },
    moving_real: {
        KeyW: false,
        KeyA: false,
        KeyS: false,
        KeyD: false,
        ArrowUp: false,
        ArrowRight: false,
        ArrowDown: false,
        ArrowLeft: false,
    },
    keys_pressed: [],
};
 
function windowScaling() {
  const canvas = document.getElementById('canvas');
  const a = canvas.height / 1080;
  const b = canvas.width / 1920;
  return b < a ? a : b;
}
 
//basic function to construct links
function link(baseUrl, lobby, gamemode, team) {
    let str = "";
    str += baseUrl + "?s=" + lobby + "&g=" + gamemode + "&l=" + team;
    return str;
}
 
function get_baseUrl() {
    return location.origin + location.pathname;
}
 
function get_your_lobby() {
    return window.lobby_ip;
}
 
function get_gamemode() {
    //return window.__common__.active_gamemode;
    return window.lobby_gamemode;
}
 
function get_team() {
    return window.__common__.party_link;
}
 
//all team links
function get_links(gamemode, lobby, team = get_team()) {
    let baseUrl = get_baseUrl();
    let colors = ["🔵", "🔴", "🟣", "🟢", "👥❌"];
    let final_links = [];
    switch (gamemode) {
        case "4teams":
            for (let i = 0; i < 4; i++) {
                final_links.push([colors[i], link(baseUrl, lobby, gamemode, team.split("x")[0] + `x${i}`)]);
            }
            break
        case "teams":
            for (let i = 0; i < 2; i++) {
                final_links.push([colors[i], link(baseUrl, lobby, gamemode, team.split("x")[0] + `x${i}`)]);
            }
            break
        default:
            final_links.push([colors[colors.length - 1], link(baseUrl, lobby, gamemode, team)]);
    }
    return final_links;
}
 
//dimensions
 
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
        let b = (this.canvas_2_windowScaling(a)) * (canvas.width / window.innerWidth) * player.ui_scale;
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
                    x = inputs.mouse.force.x;
                    y = inputs.mouse.force.y;
                } else {
                    x = args[1];
                    y = args[2];
                }
                type = args[0];
                new_args = [type, dim_c.window_2_canvas(x / player.dpr), dim_c.window_2_canvas(y / player.dpr)];
                inputs.mouse.game = {
                    x: new_args[1],
                    y: new_args[2],
                }
                return Reflect.apply(definition, input_obj, new_args);
            }
        });
    });
}
 
//create ingame Notifications
function rgbToNumber(r, g, b) {
    return (r << 16) | (g << 8) | b;
}
const notification_rgbs = {
    require: [255, 165, 0], //orange
    warning: [255, 0, 0], //red
    normal: [0, 0, 128] //blue
}
 
let notifications = [];
 
function new_notification(text, color, duration) {
    input.inGameNotification(text, rgbToNumber(...color), duration);
}
 
function one_time_notification(text, color, duration){
    if(notifications.includes(text)){
        return;
    }
    if(player.inGame){
        new_notification(text, color, duration);
        notifications.push(text);
    }else{
        notifications = [];
    }
}
 
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
 
let mainCont,
  header,
  subContGray,
  subContBlack,
  modCont,
  settCont,
  activeCategory;
 
//logic for saving
let trashed_module_names = (() => {
  const saved = localStorage.getItem("[Diep.io+] Trashed names");
  if (saved) {
    return new Set(JSON.parse(saved));
  }
  return new Set();
})();
 
let saved_trash_content = [];
 
class Trashbin {
  constructor(trash_content) {
    this.active = {
      trashbin: false,
      mover: false,
    };
    this.trash_content = trash_content;
    //element creation
 
    //outside
    this.trash_container = new El(
      "TrashBin Container",
      "div",
      "rgb(100, 0, 0)",
      "100%",
      "50px"
    );
    this.trash_container.setPosition("sticky", "flex", "0", "0", "row");
    this.trash_container.el.style.overflowX = "auto";
    this.trash_container.el.style.overflowY = "hidden";
    this.trash_container.el.style.paddingBottom = "20px";
 
    //inside
    let temp_cont = new El(
      "TrashBinContainer",
      "div",
      "transparent",
      "90px",
      "50px"
    );
    let trashbin = new El("TrashBin", "div", "transparent", "45px", "50px");
    trashbin.setPosition("relative", "inline-block");
    trashbin.setText(
      `${this.trash_content.length}🗑️`,
      "white",
      "Calibri",
      "bold",
      "20px",
      "2px",
      "center",
      "center"
    );
    trashbin.setBorder("normal", "0px", "transparent", "10px");
    trashbin.el.addEventListener("mouseover", (e) => {
      trashbin.el.style.cursor = "pointer";
      trashbin.el.style.backgroundColor = this.active.trashbin
        ? "rgb(200, 0, 0)"
        : "rgb(50, 0, 0)";
    });
    trashbin.el.addEventListener("mouseout", (e) => {
      trashbin.el.style.cursor = "normal";
      trashbin.el.style.backgroundColor = this.active.trashbin
        ? "rgb(150, 0, 0)"
        : "transparent";
    });
    trashbin.el.addEventListener("mousedown", (e) => {
      if (e.button != 0) return;
      this.active.trashbin = !this.active.trashbin;
      if (this.active.trashbin) {
        trashbin.el.style.backgroundColor = "rgb(100, 0, 0)";
        this.show_deleted_buttons();
        this.trash_container.add(mainCont.el);
      } else {
        trashbin.el.style.backgroundColor = "transparent";
        this.trash_container.el.innerHTML = ""; //clear previous items first
        this.trash_container.remove(mainCont.el);
      }
    });
 
    let mover = new El("Mover", "div", "transparent", "45px", "50px");
    mover.setPosition("relative", "inline-block");
    mover.setText(
      `⬅️`,
      "white",
      "Calibri",
      "bold",
      "20px",
      "2px",
      "center",
      "center"
    );
    mover.setBorder("normal", "0px", "transparent", "10px");
    mover.el.addEventListener("mouseover", (e) => {
      mover.el.style.cursor = "pointer";
      mover.el.style.backgroundColor = this.active.mover
        ? "rgb(0, 0, 200)"
        : "rgb(0, 0, 50)";
    });
    mover.el.addEventListener("mouseout", (e) => {
      mover.el.style.cursor = "normal";
      mover.el.style.backgroundColor = this.active.mover
        ? "rgb(0, 0, 150)"
        : "transparent";
    });
    mover.el.addEventListener("mousedown", (e) => {
      if (e.button != 0) return;
      this.active.mover = !this.active.mover;
      mover.el.style.backgroundColor = "rgb(0, 0, 100)";
    });
    //elements fusion
    temp_cont.el.appendChild(trashbin.el);
    temp_cont.el.appendChild(mover.el);
    this.element = temp_cont.el;
  }
  add_content(content) {
    this.trash_content.push(content);
    this.update_text();
  }
  remove_content(content) {
    let index = this.trash_content.indexOf(content);
    if (index === -1) return;
    this.trash_content.splice(index, 1);
    this.update_text();
  }
  update_text() {
    this.element.children[0].innerHTML = `${this.trash_content.length}🗑️`;
  }
  create_deleted_button(obj) {
    let temp = new El(obj.name, "div", "transparent", "170px", "50px");
    temp.el.style.backgroundColor = "rgb(200, 100, 0)";
    temp.setText(
      obj.name,
      "lightgray",
      "Calibri",
      "bold",
      "20px",
      "2px",
      "center",
      "center"
    );
    temp.setBorder("normal", "2px", "rgb(200, 200, 0)", "5px");
    temp.el.style.flexShrink = "0";
    temp.el.addEventListener("mouseover", (e) => {
      temp.el.style.cursor = "pointer";
      temp.el.style.backgroundColor = "rgb(250, 150, 0)";
    });
    temp.el.addEventListener("mouseout", (e) => {
      temp.el.style.cursor = "normal";
      temp.el.style.backgroundColor = "rgb(200, 100, 0)";
    });
    temp.el.addEventListener("mousedown", (e) => {
      if (e.button != 0) return;
      let path = find_module_path(obj.name);
      let target_module = modules[path[0]][path[1]];
      target_module.trashed = false;
      trashed_module_names.delete(target_module.name);
      localStorage.setItem(
        "[Diep.io+] Trashed names",
        JSON.stringify(Array.from(trashed_module_names))
      );
      if (path[0] === activeCategory) {
        for (let child of obj.children) {
          modCont.el.appendChild(child);
        }
      }
      this.trash_container.el.removeChild(temp.el);
      this.remove_content(obj);
      this.update_text();
    });
    return temp;
  }
  show_deleted_buttons() {
    this.trash_container.el.innerHTML = "";
    if (this.trash_content.length > 0) {
      for (let obj of this.trash_content) {
        let btn = this.create_deleted_button(obj);
        btn.add(this.trash_container.el);
      }
    }
  }
}
 
function trash_module(module_name, class_elements) {
  if (modCont.el.children.length === 0)
    return console.warn("Currently no modules loaded");
  let temp_storage = {
    name: module_name,
    children: [],
  };
  for (let child of modCont.el.children) {
    for (let class_el of class_elements) {
      if (child === class_el) {
        temp_storage.children.push(child);
      }
    }
  }
  for (let element of temp_storage.children) {
    modCont.el.removeChild(element);
  }
  trash.add_content(temp_storage);
}
 
//creation of trashbin class instance
let trash = new Trashbin(saved_trash_content);
 
//new keybinds logic
let keybinds = new Set();
 
class Setting {
  constructor(name, type, options, target_class) {
    this.name = name;
    this.options = options;
    this.elements = [];
    this.desc = new El(
      name + " Setting",
      "div",
      "transparent",
      "170px",
      "50px"
    );
    this.desc.setPosition("relative", "block");
    this.desc.setText(
      name,
      "white",
      "Calibri",
      "bold",
      "15px",
      "2px",
      "center",
      "center"
    );
    this.elements.push(this.desc.el);
 
    switch (type) {
      case "title":
        this.desc.el.style.backgroundColor = "rgb(50, 50, 50)";
        this.desc.setText(
          name,
          "lightgray",
          "Calibri",
          "bold",
          "20px",
          "2px",
          "center",
          "center"
        );
        this.desc.setBorder("normal", "2px", "gray", "5px");
        break;
      case "keybind":
        this.kb_state = "idle";
        this.previous_key = "";
        this.desc.el.style.backgroundColor = "rgb(103, 174, 110)";
        this.desc.setText(
          name.length > 0 ? name : "Click to Select Keybind",
          "rgb(225, 238, 188)",
          "Calibri",
          "bold",
          "15px",
          "2px",
          "center",
          "center"
        );
        this.desc.setBorder("normal", "2px", "rgb(50, 142, 110)", "5px");
        this.desc.el.addEventListener("mouseover", (e) => {
          this.desc.el.style.backgroundColor = "rgb(144, 198, 124)";
          target_class.desc.setBorder("normal", "2px", "red", "5px");
        });
        this.desc.el.addEventListener("mouseout", (e) => {
          this.desc.el.style.backgroundColor = "rgb(103, 174, 110)";
          target_class.desc.setBorder("normal", "0px", "transparent", "0px");
        });
        this.desc.el.addEventListener("mousedown", (e) => {
          if (e.button != 0) return;
          this.desc.el.innerHTML = "Press a key";
          this.kb_state = "listening";
        });
        document.addEventListener("keydown", (e) => {
          switch (this.kb_state) {
            case "set":
              if (e.code === this.previous_key) {
                target_class.active = !target_class.active;
                target_class.update_toggle(target_class.checkbox);
              }
              break;
            case "listening":
              if (this.previous_key === e.code) {
                this.desc.el.innerHTML = e.code;
                this.kb_state = "set";
              } else if (keybinds.has(e.code)) {
                this.desc.el.innerHTML =
                  "Keybind already being used, try again!";
              } else {
                if (e.code === "Backspace" || e.code === "Escape") {
                  this.desc.el.innerHTML = "Click to Select Keybind";
                  this.kb_state = "set";
                  return;
                }
                keybinds.add(e.code);
                if (keybinds.has(this.previous_key))
                  keybinds.delete(this.previous_key);
                this.desc.el.innerHTML = e.code;
                this.previous_key = e.code;
                this.kb_state = "set";
              }
              break;
            default:
              return;
          }
        });
        break;
      case "select": {
        if (!this.options) return console.warn("Missing Options!");
        let index = 0;
        this.selected = options[index];
        //temp cont
        let temp_container = new El(
          name + " temp Container",
          "div",
          "transparent"
        );
        temp_container.el.style.display = "flex";
        temp_container.el.style.alignItems = "center";
        temp_container.el.style.justifyContent = "center";
        temp_container.el.style.gap = "10px";
 
        //displ
        let displ = new El(
          name + " Setting Display",
          "div",
          "lightgray",
          "125px",
          "25px"
        );
        displ.setText(
          this.selected,
          "black",
          "Calibri",
          "bold",
          "15px",
          "2px",
          "center",
          "center"
        );
 
        //left Arrow
        let l_arrow = new El(
          name + " left Arrow",
          "div",
          "transparent",
          "0px",
          "0px"
        );
        l_arrow.setBorder("bottom", "8px", "transparent");
        l_arrow.setBorder("left", "0px", "transparent");
        l_arrow.setBorder("right", "16px", "blue");
        l_arrow.setBorder("top", "8px", "transparent");
 
        l_arrow.el.addEventListener("mouseover", () => {
          l_arrow.el.style.cursor = "pointer";
          l_arrow.setBorder("right", "16px", "darkblue");
        });
 
        l_arrow.el.addEventListener("mouseout", () => {
          l_arrow.el.style.cursor = "normal";
          l_arrow.setBorder("right", "16px", "blue");
        });
 
        l_arrow.el.addEventListener("mousedown", (e) => {
          if (e.button != 0) return;
          let limit = options.length - 1;
          if (index - 1 < 0) {
            index = limit;
          } else {
            index--;
          }
          this.selected = options[index];
          displ.el.innerHTML = this.selected;
        });
 
        //right Arrow
        let r_arrow = new El(
          name + " right Arrow",
          "div",
          "transparent",
          "0px",
          "0px"
        );
        r_arrow.setBorder("bottom", "8px", "transparent");
        r_arrow.setBorder("left", "16px", "blue");
        r_arrow.setBorder("right", "0px", "transparent");
        r_arrow.setBorder("top", "8px", "transparent");
 
        r_arrow.el.addEventListener("mouseover", () => {
          r_arrow.el.style.cursor = "pointer";
          r_arrow.setBorder("left", "16px", "darkblue");
        });
 
        r_arrow.el.addEventListener("mouseout", () => {
          r_arrow.el.style.cursor = "normal";
          r_arrow.setBorder("left", "16px", "blue");
        });
 
        r_arrow.el.addEventListener("mousedown", (e) => {
          if (e.button != 0) return;
          let limit = options.length - 1;
          if (index + 1 > limit) {
            index = 0;
          } else {
            index++;
          }
          this.selected = options[index];
          displ.el.innerHTML = this.selected;
        });
 
        //connect together
        temp_container.el.appendChild(l_arrow.el);
        temp_container.el.appendChild(displ.el);
        temp_container.el.appendChild(r_arrow.el);
 
        //remember them
        this.elements.push(temp_container.el);
        break;
      }
      case "toggle": {
        this.active = false;
        this.desc.el.style.display = "flex";
        this.desc.el.style.alignItems = "center";
        this.desc.el.style.justifyContent = "space-between";
        let empty_checkbox = new El(
          this.name + " Setting checkbox",
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
          this.update_toggle(empty_checkbox);
        });
        empty_checkbox.el.addEventListener("mouseover", () => {
          empty_checkbox.el.style.backgroundColor = this.active
            ? "darkgreen"
            : "darkgray";
          empty_checkbox.el.style.cursor = "pointer";
        });
        empty_checkbox.el.addEventListener("mouseout", () => {
          empty_checkbox.el.style.backgroundColor = this.active
            ? "green"
            : "lightgray";
        });
        this.desc.el.appendChild(empty_checkbox.el);
        this.checkbox = empty_checkbox;
        break;
      }
    }
  }
  update_toggle(empty_checkbox) {
    if (this.active) {
      empty_checkbox.el.innerHTML = "✔";
      empty_checkbox.el.style.backgroundColor = "green";
      empty_checkbox.setBorder("normal", "2px", "lime", "4px");
    } else {
      empty_checkbox.el.innerHTML = "";
      empty_checkbox.el.style.backgroundColor = "lightgray";
      empty_checkbox.setBorder("normal", "2px", "gray", "4px");
    }
  }
  load() {
    this.elements.forEach((element) => settCont.el.appendChild(element));
  }
 
  unload() {
    this.elements.forEach((element) => {
      if (settCont.el.contains(element)) {
        settCont.el.removeChild(element);
      }
    });
  }
}
 
class Module {
  constructor(name, type, settings, callback) {
    this.name = name;
    this.type = type;
    this.trashed = trashed_module_names.has(this.name);
    this.callbackFunc = callback;
    this.settings = settings;
    this.title = new El(name, "div", "transparent", "100%", "50px");
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
    this.title.el.addEventListener("mouseover", (e) => {
      if (!trash.active.mover) return;
      this.title.el.style.color = "rgb(200, 0, 0)";
    });
    this.title.el.addEventListener("mouseout", (e) => {
      if (this.title.el.style.color === "rgb(200, 0, 0)") {
        this.title.el.style.color = "white";
      }
    });
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
          empty_checkbox.el.style.backgroundColor = this.active
            ? "darkgreen"
            : "darkgray";
          empty_checkbox.el.style.cursor = "pointer";
        });
        empty_checkbox.el.addEventListener("mouseout", () => {
          empty_checkbox.el.style.backgroundColor = this.active
            ? "green"
            : "lightgray";
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
        this.title.el.style.width = "100%";
        this.title.el.style.boxSizing = "border-box";
        this.title.el.style.whiteSpace = "normal"; // Allows text wrapping
        this.title.setBorder("normal", "2px", "white", "10px");
        this.title.el.style.cursor = "pointer";
        this.title.el.addEventListener("mousedown", () => {
          if (trash.active.mover) return;
          if (this.callbackFunc) {
            this.callbackFunc();
          }
        });
        break;
      case "open": {
        this.active = false;
        this.title.el.style.display = "flex";
        this.title.el.style.alignItems = "center";
        this.title.el.style.justifyContent = "space-between";
        let opener_box = new El(
          this.name + " opener box",
          "div",
          "rgb(75, 75, 75)",
          "20px",
          "20px"
        );
        opener_box.setBorder("normal", "2px", "gray", "4px");
        opener_box.el.style.display = "flex";
        opener_box.el.style.alignItems = "center";
        opener_box.el.style.justifyContent = "center";
        //
        let triangle = new El(
          name + " triangle",
          "div",
          "transparent",
          "0px",
          "0px"
        );
        triangle.setBorder("bottom", "16px", "lime");
        triangle.setBorder("left", "8px", "transparent");
        triangle.setBorder("right", "8px", "transparent");
        triangle.setBorder("top", "0px", "transparent");
        //
        //event listeners
        opener_box.el.addEventListener("mousedown", (e) => {
          if (e.button != 0) return;
          if (trash.active.mover) return;
          this.active = !this.active;
          if (this.active) {
            triangle.setBorder("bottom", "0px", "transparent");
            triangle.setBorder("left", "8px", "transparent");
            triangle.setBorder("right", "8px", "transparent");
            triangle.setBorder("top", "16px", "red");
            this.loadSettings();
          } else {
            triangle.setBorder("bottom", "16px", "lime");
            triangle.setBorder("left", "8px", "transparent");
            triangle.setBorder("right", "8px", "transparent");
            triangle.setBorder("top", "0px", "transparent");
            this.unloadSettings();
          }
        });
        opener_box.el.addEventListener("mouseover", () => {
          opener_box.el.style.backgroundColor = "rgb(50, 50, 50)";
          opener_box.el.style.cursor = "pointer";
        });
        opener_box.el.addEventListener("mouseout", () => {
          opener_box.el.style.backgroundColor = "rgb(75, 75, 75)";
        });
        opener_box.el.appendChild(triangle.el);
        this.title.el.appendChild(opener_box.el);
        break;
      }
    }
    if (trashed_module_names.has(this.name)) {
      saved_trash_content.push({ name: this.name, children: this.elements });
      trash.update_text();
    }
    this.title.el.addEventListener("mousedown", (e) => {
      if (!trash.active.mover) return;
      trash_module(this.name, this.elements);
      this.trashed = true;
      trashed_module_names.add(this.name);
      localStorage.setItem(
        "[Diep.io+] Trashed names",
        JSON.stringify(Array.from(trashed_module_names))
      );
      this.title.el.style.color = "white";
      trash.show_deleted_buttons();
    });
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
 
  loadSettings() {
    if (!this.settings) return;
    for (let _sett in this.settings) {
      this.settings[_sett].load();
    }
  }
 
  unloadSettings() {
    if (!this.settings) return;
    for (let _sett in this.settings) {
      this.settings[_sett].unload();
    }
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
      this.element.el.style.backgroundColor = this.selected
        ? "lightgray"
        : "rgb(38, 38, 38)";
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
  Info: {
    hall_of_Fame: new Module("Hall of Fame", "open", {
      darkdealer_00249: new Setting("darkdealer_00249", "title"),
      Sguanto: new Setting("Sguanto", "title"),
    }),
    q_a1: new Module(
      "Where are the old scripts from diep.io+?",
      "button",
      null,
      () => {
        alert("They're either patched, or not fully integrated yet.");
      }
    ),
    q_a2: new Module("Can you make me a script?", "button", null, () => {
      alert(
        "If it's simple - yes, if not give me a donation or a private script and I will do it for you, unless I don't know how to implement it."
      );
    }),
    q_a3: new Module("This script is so confusing!", "button", null, () => {
      alert(
        "Maybe I will make full tutorial, but for now ask me anything about it. Discord: h3llside"
      );
    }),
    q_a4: new Module(
      "How can I join your discord server?",
      "button",
      null,
      () => {
        alert(
          "Join and follow instructions: https://discord.gg/S3ZzgDNAuG please dm me if the link doesn't work, discord: h3llside"
        );
      }
    ),
    q_a5: new Module("Why do you update it so often?", "button", null, () => {
      alert(
        "I get it, it can be annoying to constantly update the script, but sometimes new ideas come, sometimes game updates and breaks this script so I have no choice but to update frequently"
      );
    }),
    q_a6: new Module("What is the import, export for?", "button", null, () => {
      alert(
        "it's for auto respawn+, mainly spawn type: Random Killer. It basically chooses random saved name and you can share those saved names with each other :)"
      );
    }),
  },
 
  Visual: {
    Key_inputs_visualiser: new Module("Key Inputs Visualiser", "toggle"),
    destroyer_cooldown: new Module("Destroyer Cooldown", "open", {
      Title: new Setting("Destroyer Cooldown", "title"),
      keybind: new Setting(
        "",
        "keybind",
        null,
        (this.temp = new Setting("enable Destroyer Cooldown", "toggle"))
      ),
      reload: new Setting("Reload?", "select", [0, 1, 2, 3, 4, 5, 6, 7]),
      destroyer_cooldown: this.temp,
    }),
  },
 
  Functional: {
    CopyLink: new Module("Copy Party Link", "button", null, () => {
      document.getElementById("copy-party-link").click();
    }),
    Predator_stack: new Module("Predator Stack", "button", null, () => {
      predator_stack(get_reload());
    }),
    Sandbox_lvl_up: new Module("Sandbox Auto Level Up", "toggle"),
    Auto_respawn: new Module("Auto Respawn", "open", {
      Title: new Setting("Auto Respawn", "title"),
      keybind: new Setting(
        "",
        "keybind",
        null,
        (this.temp = new Setting("Auto Respawn", "toggle"))
      ),
      Remember: new Setting("Remember and store Killer Names", "toggle"),
      Prevent: new Setting("Prevent respawning after 300k score", "toggle"),
      Name: new Setting("Spawn Name Type: ", "select", [
        "Normal",
        "Glitched",
        "N A M E",
        "Random Killer",
        "Random Symbols",
        "Random Numbers",
        "Random Letters",
      ]),
      Auto_respawn: this.temp,
    }),
    Import_names: new Module(
      "Import Killer Names",
      "button",
      null,
      import_killer_names
    ),
    Export_names: new Module("Export Killer Names", "button", null, () => {
      let exported_string = localStorage.getItem("[Diep.io+] saved names")
        ? localStorage.getItem("[Diep.io+] saved names")
        : -1;
      if (exported_string < 0)
        return alert("not copied, because 0 saved names");
      navigator.clipboard.writeText("'" + exported_string + "'");
      alert(`copied ${JSON.parse(exported_string).length} saved names`);
    }),
    Bot_tab: new Module("Sandbox Arena  size increase", "toggle"),
    Tank_upgrades: new Module("Tank Upgrades Keybinds", "open", {
      Title: new Setting("Tank Upgrades Keybinds", "title"),
      visualise: new Setting("Show positions and keys", "toggle"),
      Tank_upgrades: new Setting("enable Tank Upgrades Keybinds", "toggle"),
    }),
    Zoom: new Module("Zoom Out", "slider"),
  },
 
  Mouse: {
    Anti_aim: new Module("Anti Aim", "open", {
      Title: new Setting("Anti Aim", "title"),
      keybind: new Setting(
        "",
        "keybind",
        null,
        (this.temp = new Setting("enable Anti Aim", "toggle"))
      ),
      Timing: new Setting(
        "Follow mouse on click, how long?",
        "select",
        [50, 100, 150, 200, 250, 300]
      ),
      Anti_aim: this.temp,
    }),
    Freeze_mouse: new Module("Freeze Mouse", "toggle"),
    Anti_timeout: new Module("Anti AFK Timeout", "toggle"),
    Move_2_mouse: new Module("Move to mouse", "open", {
      Title: new Setting("Move to mouse", "title"),
      keybind: new Setting(
        "",
        "keybind",
        null,
        (this.temp = new Setting("enable Move to Mouse", "toggle"))
      ),
      toggle_debug: new Setting("Watch how the script works", "toggle"),
      Approximation: new Setting(
        "Approximation Factor (lower = smoother)",
        "select",
        [10, 25, 40, 65, 80, 100]
      ),
      Time_factor: new Setting(
        "Time Factor (higher = longer)",
        "select",
        [10, 20, 30, 40, 50]
      ),
      Move_2_mouse: this.temp,
    }),
    Custom_auto_spin: new Module("Custom Auto Spin", "open", {
      Title: new Setting("Custom Auto Spin", "title"),
      keybind: new Setting(
        "",
        "keybind",
        null,
        (this.temp = new Setting("enable Custom Auto Spin", "toggle"))
      ),
      Interval: new Setting(
        "Movement Interval",
        "select",
        [
          100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300,
          1400, 1500, 1600, 1700, 1800, 1900, 2000, 2500, 3000, 3500, 4000,
          5000,
        ]
      ),
      Smoothness: new Setting("Smoothness", "select", [3, 4, 5, 6, 7, 8]),
      Replace_auto_spin: new Setting("replace Auto Spin", "toggle"),
      Custom_auto_spin: this.temp,
    }),
  },
 
  DiepConsole: {
    con_toggle: new Module("Show/hide Diep Console", "toggle"),
    net_predict_movement: new Module("predict movement", "toggle"),
    Render: new Module("Render things", "open", {
      Title: new Setting("Rendering", "title"),
      ren_scoreboard: new Setting("Leaderboard", "toggle"),
      ren_scoreboard_names: new Setting("Scoreboard Names", "toggle"),
      ren_fps: new Setting("FPS", "toggle"),
      ren_upgrades: new Setting("Tank Upgrades", "toggle"),
      ren_stats: new Setting("Stat Upgrades", "toggle"),
      ren_names: new Setting("Names", "toggle"),
    }),
    //game builds
  },
 
  Addons: {
    aim_lines: new Module("Tank Aim lines", "open", {
      Title: new Setting("Tank Aim lines", "title"),
      keybind: new Setting(
        "",
        "keybind",
        null,
        (this.temp = new Setting("Toggle Aim Lines", "toggle"))
      ),
      adjust_length: new Setting(
        "Adjust aim line length",
        "select",
        [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 5, 7.5, 10]
      ),
      toggle_aim_lines: this.temp,
    }),
    farm_bot: new Module("Farm Bot", "open", {
      Title: new Setting("Farm Bot", "title"),
      keybind: new Setting(
        "",
        "keybind",
        null,
        (this.temp = new Setting("Toggle Farm Bot", "toggle"))
      ),
      detect_type: new Setting("Detect shapes by:", "select", ["closest", "most xp"]),
      ignore_shapes: new Setting("Shapes you want to ignore:"),
      toggle_squares: new Setting("Squares", "toggle"),
      toggle_crashers: new Setting("Crashers", "toggle"),
      toggle_pentagons: new Setting("Pentagons", "toggle"),
      toggle_triangles: new Setting("Triangles", "toggle"),
      ignore_outside: new Setting("Ignore Outside base?", "toggle"),
      other_setts: new Setting("Movement:"),
      move_to_shape: new Setting("Move to Shapes", "toggle"),
      visuals: new Setting("Visuals:"),
      toggle_lines: new Setting("Toggle Line to Shape", "toggle"),
      toggle_debug: new Setting("See how script works", "toggle"),
      activation: new Setting("Activation:"),
      toggle_farm_bot: this.temp,
    }),
    world_coords: new Module("World Coordinates", "open", {
      Title: new Setting("World Coordinates", "title"),
      precision: new Setting("Precision Factor", "select", [0, 1, 2, 3, 4]),
      toggle_world_coords: new Setting("Toggle World Coordinates", "toggle"),
    }),
    enemy_tracers: new Module("Enemy Tracers", "toggle"),
    trails: new Module("Trails", "open", {
        Title: new Setting("Trails", "title"),
        update_interval: new Setting("Update Interval", "select", [10, 50, 100, 250, 500]),
        toggle_trails: new Setting("Toggle Trails", "toggle"),
    }),
    invisibles: new Module("Uninvisible yourself", "toggle"),
  },
};
 
console.log(modules);
 
let categories = [];
 
function create_categories() {
  for (let key in modules) {
    categories.push(new Category(key, modules[key]));
  }
}
create_categories();
 
//loading / unloading modules
function load_modules(category_name) {
  activeCategory = category_name;
  const current_category = categories.find(
    (category) => category.name === category_name
  );
  for (let moduleName in current_category.modules) {
    let module = current_category.modules[moduleName];
    if (!module.trashed) module.load();
    if (module.type === "open" && module.active) module.loadSettings();
  }
}
 
function unload_modules(category_name) {
  if (activeCategory === category_name) activeCategory = undefined;
  const current_category = categories.find(
    (category) => category.name === category_name
  );
  for (let moduleName in current_category.modules) {
    let module = current_category.modules[moduleName];
    module.unload();
    module.unloadSettings();
  }
}
 
function find_module_path(_name) {
  for (let category in modules) {
    for (let module in modules[category]) {
      // Iterate over actual modules
      if (modules[category][module].name === _name) {
        return [category, module]; // Return actual category and module
      }
    }
  }
  return -1; // Return -1 if not found
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
  mainCont.el.style.minHeight = "min-content";
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
 
  subContGray.el.appendChild(trash.element);
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
 
//allow user to interact with the gui while in game
Event.prototype.preventDefault = new Proxy(Event.prototype.preventDefault, {
    apply: function(target, thisArgs, args){
        //console.log(thisArgs.type);
        if(thisArgs.type === "mousedown" || thisArgs.type === "mouseup") return; //console.log('successfully canceled');
        return Reflect.apply(target, thisArgs, args);
    }
});
 
//Move to Mouse
function reset_moving_game(keys_to_reset){
    for(let key of keys_to_reset){
        if(inputs.moving_game[key]){
            extern.onKeyUp(diep_keys[key], fingerprint);
        }
    }
}
 
let approximation_factor = modules.Mouse.Move_2_mouse.settings.Approximation.selected; // Higher = faster movement, but less smooth Lower = slower movement, but more smooth
let distance_time_factor = modules.Mouse.Move_2_mouse.settings.Time_factor.selected; // transform the distance into Time
let moving_active = false;
let current_direction = 'none';
let reset_move_to_mouse_complete = false;
 
function calculate_distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
 
function get_move_steps(x, y) {
    let center = { x: dim_c.canvas_2_window(canvas.width / 2), y: dim_c.canvas_2_window(canvas.height / 2) };
    let target = { x: x, y: y };
    let full_distance = calculate_distance(center.x, center.y, target.x, target.y);
    let partial_distance = full_distance/approximation_factor;
    let step = { x: (target.x - center.x) / partial_distance, y: (target.y - center.y) / partial_distance };
    return step;
}
 
function move_in_direction(direction, time) {
    moving_active = true;
    current_direction = direction;
    let directions = {
        'Up': 'KeyW',
        'Left': 'KeyA',
        'Down': 'KeyS',
        'Right': 'KeyD',
    }
    for (let _dir in directions) {
        if (directions[_dir] === undefined) return console.warn("Invalid direction");
        if (_dir === direction) {
            extern.onKeyDown(diep_keys[directions[_dir]], fingerprint);
        } else {
            extern.onKeyUp(diep_keys[directions[_dir]], fingerprint);
        }
    }
    setTimeout(() => {
        moving_active = false;
    }, time);
}
 
function move_to_mouse() {
    window.requestAnimationFrame(move_to_mouse);
    if (modules.Mouse.Move_2_mouse.settings.Move_2_mouse.active) {
        if (moving_active || !player.inGame || !document.hasFocus() || !safe_enable_moving_script(1)) return;
        reset_move_to_mouse_complete = false;
        //update factors
        approximation_factor = modules.Mouse.Move_2_mouse.settings.Approximation.selected;
        distance_time_factor = modules.Mouse.Move_2_mouse.settings.Time_factor.selected;
        //logic
        let step = get_move_steps(inputs.mouse.real.x, inputs.mouse.real.y);
        let horizontal = step.x > 0 ? 'Right' : 'Left';
        let vertical = step.y > 0 ? 'Down' : 'Up';
 
        switch (current_direction) {
            case "none":
                move_in_direction(horizontal, Math.abs(step.x) * distance_time_factor);
                break;
            case 'Right':
                move_in_direction(vertical, Math.abs(step.y) * distance_time_factor);
                break;
            case 'Left':
                move_in_direction(vertical, Math.abs(step.y) * distance_time_factor);
                break;
            case 'Up':
                move_in_direction(horizontal, Math.abs(step.x) * distance_time_factor);
                break
            case 'Down':
                move_in_direction(horizontal, Math.abs(step.x) * distance_time_factor);
                break
        }
    } else {
        if (!reset_move_to_mouse_complete) {
            reset_moving_game(['KeyW', 'KeyA', 'KeyS', 'KeyD']);
            reset_move_to_mouse_complete = true;
        }
    }
}
window.requestAnimationFrame(move_to_mouse);
 
 
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
 
//VISUAL TEAM SWITCH
//create container
let team_select_container = document.createElement("div");
team_select_container.classList.add("labelled");
team_select_container.id = "team-selector";
document.querySelector("#server-selector").appendChild(team_select_container);
 
//create Text "Team"
let team_select_label = document.createElement("label");
team_select_label.innerText = "[Diep.io+] Team Selector";
team_select_label.style.color = "purple";
team_select_label.style.backgroundColor = "black";
team_select_container.appendChild(team_select_label);
 
//create Selector
let team_select_selector = document.createElement("div");
team_select_selector.classList.add("selector");
team_select_container.appendChild(team_select_selector);
 
//create placeholder "Choose Team"
let teams_visibility = true;
let ph_div = document.createElement("div");
let ph_text_div = document.createElement("div");
let sel_state;
ph_text_div.classList.add("dropdown-label");
ph_text_div.innerHTML = "Choose Team";
ph_div.style.backgroundColor = "gray";
ph_div.classList.add("selected");
ph_div.addEventListener("click", () => {
    //toggle Team List
    toggle_team_list(teams_visibility);
    teams_visibility = !teams_visibility;
});
 
team_select_selector.appendChild(ph_div);
ph_div.appendChild(document.createElement("div"));
ph_div.appendChild(ph_text_div);
 
// Create refresh button
/*
let refresh_btn = document.createElement("button");
refresh_btn.style.width = "30%";
refresh_btn.style.height = "10%";
refresh_btn.style.backgroundColor = "black";
refresh_btn.textContent = "Refresh";
 
refresh_btn.onclick = () => {
    remove_previous_teams();
    links_to_teams_GUI_convert();
};
 
team_select_container.appendChild(refresh_btn);
*/
 
//create actual teams
let team_values = [];
 
function create_team_div(text, color, link) {
    team_values.push(text);
    let team_div = document.createElement("div");
    let text_div = document.createElement("div");
    let sel_state;
    text_div.classList.add("dropdown-label");
    text_div.innerHTML = text;
    team_div.style.backgroundColor = color;
    team_div.classList.add("unselected");
    team_div.value = text;
    team_div.addEventListener("click", () => {
        const answer = confirm("You're about to open the link in a new tab, do you want to continue?");
        if (answer) {
            window.open(link, "_blank");
        }
    });
 
    team_select_selector.appendChild(team_div);
    team_div.appendChild(document.createElement("div"));
    team_div.appendChild(text_div);
}
 
function toggle_team_list(boolean) {
    if (boolean) {
        //true
        team_select_selector.classList.remove("selector");
        team_select_selector.classList.add("selector-active");
    } else {
        //false
        team_select_selector.classList.remove("selector-active");
        team_select_selector.classList.add("selector");
    }
}
 
//example
//create_team_div("RedTeam", "Red", "https://diep.io/");
//create_team_div("OrangeTeam", "Orange", "https://diep.io/");
//create_team_div("YellowTeam", "Yellow", "https://diep.io/");
function links_to_teams_GUI_convert() {
    let gamemode = get_gamemode();
    let lobby = get_your_lobby();
    let links = get_links(gamemode, lobby);
    let team_names = ["Team-Blue", "Team-Red", "Team-Purple", "Team-Green", "Teamless-Gamemode"];
    let team_colors = ["blue", "red", "purple", "green", "orange"];
    for (let i = 0; i < links.length; i++) {
        !gamemode.includes("teams") ? create_team_div(team_names[team_names.length - 1], team_colors[team_colors.length - 1], links[0][1]) : create_team_div(team_names[i], team_colors[i], links[i][1]);
    }
}
 
function remove_previous_teams() {
    for (let i = team_select_selector.childNodes.length - 1; i >= 0; i--) {
        console.log(team_select_selector);
        let child = team_select_selector.childNodes[i];
        if (child.nodeType === Node.ELEMENT_NODE && child.innerText !== "Choose Team") {
            child.remove();
        }
    }
}
 
let party_link_info = {
    old_link: null,
    current_link: null
}
function detect_refresh(){
    if(!party_link_info.old_link || !party_link_info.current_link) return;
    party_link_info.current_link = window.lobby_ip + _c.party_link;
    if(party_link_info.current_link != party_link_info.old_link){
        console.log('Link change detected!');
        remove_previous_teams();
        links_to_teams_GUI_convert();
        party_link_info.old_link = party_link_info.current_link;
    }
}
 
function wait_For_Link() {
    if (_c.party_link === '') {
        setTimeout(() => {
            console.log("[Diep.io+] LOADING...");
            wait_For_Link();
        }, 100);
    } else {
        console.log("[Diep.io+] link loaded!");
        remove_previous_teams();
        links_to_teams_GUI_convert();
        party_link_info.current_link = window.lobby_ip + _c.party_link;
        party_link_info.old_link = party_link_info.current_link;
    }
}
 
wait_For_Link();
 
//detect gamemode
let gamemode = document.querySelector("#gamemode-selector > div > div.selected > div.dropdown-label").innerHTML;
let last_gamemode = localStorage.getItem(`[Diep.io+] last_gm`);
localStorage.setItem(`[Diep.io+] last_gm`, gamemode);
 
function check_gamemode() {
        gamemode = document.querySelector("#gamemode-selector > div > div.selected > div.dropdown-label").innerHTML;
        save_gm();
}
 
 
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
    return localStorage.getItem(gamemode) ? localStorage.getItem(gamemode) : 0;
}
 
function save_ls() {
    localStorage.setItem(gamemode, your_final_score);
}
 
function check_final_score() {
    if (_c.screen_state === "game-over") {
        //console.log(`debugging started...`);
        //console.log(`applying _c.death_score: ${_c.death_score}`);
        //console.log(`to your_final_score: ${your_final_score}`);
        your_final_score = _c.death_score;
        //console.log(`redefined: ${your_final_score}`);
        let t = load_ls();
        //console.log(`applying saved_score: ${t}`);
        //console.log(`with parseFloat: ${parseFloat(t)}`);
        let saved_score = parseFloat(t);
        personal_best.textContent = saved_score;
        if(isNaN(saved_score)) return console.warn('NaN score!');
        if (saved_score < your_final_score) {
            personal_best.textContent = your_final_score;
            save_ls();
        }
        //console.log(`debugging ended...`);
    }
}
 
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
        deep_debug("Removed all ads, quitting...");
        clearInterval(interval);
    }
}
 
// Set an interval to check for ads
const interval = setInterval(instant_remove, 100);
 
// ]-[
 
//Predator Stack
let predator_reloads = [
    //0
    {
        scd2: 600,
        scd3: 1000,
        wcd1: 1500,
        wcd2: 2900,
    },
    //1
    {
        scd2: 500,
        scd3: 900,
        wcd1: 1400,
        wcd2: 2800,
    },
    //2
    {
        scd2: 500,
        scd3: 900,
        wcd1: 1200,
        wcd2: 2400,
    },
    //3
    {
        scd2: 400,
        scd3: 900,
        wcd1: 1200,
        wcd2: 2300,
    },
    //4
    {
        scd2: 400,
        scd3: 900,
        wcd1: 1000,
        wcd2: 2000,
    },
    //5
    {
        scd2: 400,
        scd3: 800,
        wcd1: 900,
        wcd2: 1800,
    },
    //6
    {
        scd2: 300,
        scd3: 800,
        wcd1: 900,
        wcd2: 1750,
    },
    //7
    {
        scd2: 300,
        scd3: 800,
        wcd1: 750,
        wcd2: 1500,
    },
];
 
 
function shoot(cooldown = 100) {
    deep_debug("Shoot started!", cooldown);
    extern.onKeyDown(36);
    setTimeout(() => {
        deep_debug("Ending Shoot!", cooldown);
        extern.onKeyUp(36);
    }, cooldown);
}
 
function get_reload(){
    let arr = [...extern.get_convar("game_stats_build")];
    let counter = 0;
    let l = arr.length;
    for(let i = 0; i < l; i++){
        if(arr[i] === '7'){
            counter++;
        }
    }
    return counter;
}
 
function predator_stack(reload) {
    deep_debug("func called");
    let current = predator_reloads[reload];
    deep_debug(current);
    shoot();
    setTimeout(() => {
        shoot(current.scd2);
    }, current.wcd1);
    setTimeout(() => {
        shoot(current.scd3);
    }, current.wcd2);
}
 
//Bot tab
 
//iframe creation
function createInvisibleIframe(url) {
    let existingIframe = document.getElementById('hiddenIframe');
    if (existingIframe) {
        return;
    }
 
    let iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.id = 'hiddenIframe';
    document.body.appendChild(iframe);
}
 
function removeIframe() {
    let iframe = document.getElementById('hiddenIframe');
    if (iframe) {
        iframe.remove();
    }
}
 
function bot_tab_active_check(){
    if(modules.Functional.Bot_tab.active){
        createInvisibleIframe(link(get_baseUrl(), get_your_lobby(), get_gamemode(), get_team()));
    }else{
        removeIframe();
    }
}
 
//DiepConsole
function active_diepconsole_render_default(){
    let defaults = ['ren_scoreboard', 'ren_upgrades', 'ren_stats', 'ren_names', 'ren_scoreboard_names'];
    for(let _def of defaults){
        let _setting = modules.DiepConsole.Render.settings[_def]
        _setting.active = true;
        _setting.update_toggle(_setting.checkbox);
    }
}
active_diepconsole_render_default();
 
function handle_con_toggle(state){
    if(!extern.isConActive() && state && player.inGame){
        one_time_notification('canceled, due to a bug. Make sure to not enable it while in game', notification_rgbs.warning, 5000);
        return;
    }
    if(extern.isConActive() != state){
        extern.execute('con_toggle');
    }
}
 
function update_diep_console(){
    //Modules
    for(let param in modules.DiepConsole){
        let state = modules.DiepConsole[param].active;
        if(param === "con_toggle"){
            handle_con_toggle(state)
        }else if(modules.DiepConsole[param].name != "Render things"){
            extern.set_convar(param, state);
        }
    }
    //Render Settings
    for(let ren_param in modules.DiepConsole.Render.settings){
        let state = modules.DiepConsole.Render.settings[ren_param].active;
        if(modules.DiepConsole.Render.settings[ren_param].name != "Rendering"){
            extern.set_convar(ren_param, state);
        }
    }
}
 
 
//////
//mouse functions
 
window.addEventListener('mousemove', function(event) {
    inputs.mouse.real.x = event.clientX;
    inputs.mouse.real.y = event.clientY;
});
 
window.addEventListener('mousedown', function(event) {
    if (modules.Mouse.Anti_aim.settings.Anti_aim.active) {
        if (inputs.mouse.shooting) {
            return;
        }
        inputs.mouse.shooting = true;
        pauseMouseMove();
        //freezeMouseMove();
        setTimeout(function() {
            inputs.mouse.shooting = false;
            mouse_move('extern', inputs.mouse.real.x, inputs.mouse.real.y);
            click_at('extern', inputs.mouse.real.x, inputs.mouse.real.y);
        }, modules.Mouse.Anti_aim.settings.Timing.selected);
    };
});
 
function handle_mouse_functions() {
    window.requestAnimationFrame(handle_mouse_functions);
    if (!player.connected) {
        return;
    }
    modules.Mouse.Freeze_mouse.active ? freezeMouseMove() : unfreezeMouseMove();
    modules.Mouse.Anti_aim.settings.Anti_aim.active ? anti_aim("On") : anti_aim("Off");
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
    if(!player.inGame) return;
    switch (toggle) {
        case "On":
            if (modules.Mouse.Anti_aim.settings.Anti_aim.active && !inputs.mouse.isFrozen) {
                deep_debug('condition !modules.Mouse.Anti_aim.settings.active met');
                look_at_corner(detect_corner());
            }
            break
        case "Off":
            //(inputs.mouse.isFrozen && !modules.Mouse.Freeze_mouse.active) ? unfreezeMouseMove() : null;
            (inputs.mouse.isPaused && !modules.Mouse.Freeze_mouse.active) ? unpauseMouseMove() : null;
            break
    }
}
 
// Example: Freeze and unfreeze
function pauseMouseMove() {
    if(!inputs.mouse.isPaused){
        inputs.mouse.isForced = true;
        inputs.mouse.force.x = inputs.mouse.real.x
        inputs.mouse.force.y = inputs.mouse.real.y;
        inputs.mouse.isPaused = true; //tell the script that freezing finished
    }
}
 
function freezeMouseMove() {
    if(!inputs.mouse.isFrozen){
        inputs.mouse.isForced = true;
        inputs.mouse.force.x = inputs.mouse.real.x
        inputs.mouse.force.y = inputs.mouse.real.y;
        inputs.mouse.isFrozen = true; //tell the script that freezing finished
    }
    /*
    if (!inputs.mouse.isFrozen) {
        inputs.mouse.isFrozen = true;
        clear_onTouch();
        deep_debug("Mousemove events are frozen.");
    }
    */
}
 
function unpauseMouseMove(){
    if (inputs.mouse.isPaused && !inputs.mouse.isShooting) {
        inputs.mouse.isForced = false;
        inputs.mouse.isPaused = false; //tell the script that unfreezing finished
    }
}
 
function unfreezeMouseMove() {
    if (inputs.mouse.isFrozen) {
        inputs.mouse.isForced = false;
        inputs.mouse.isFrozen = false; //tell the script that unfreezing finished
    }
    /*
    if (inputs.mouse.isFrozen && !inputs.mouse.isShooting) {
        inputs.mouse.isFrozen = false;
        redefine_onTouch();
        deep_debug("Mousemove events are active.");
    }
    */
}
 
function click_at(input_or_extern, x, y, delay1 = 150, delay2 = 500) {
    i_e(input_or_extern, 'onTouchStart', -1, x, y);
    setTimeout(() => {
        i_e(input_or_extern, 'onTouchEnd', -1, x, y);
    }, delay1);
    setTimeout(() => {
        inputs.mouse.shooting = false;
    }, delay2);
}
 
/* it was a bug and is now patched
function ghost_click_at(input_or_extern, x, y, delay1 = 150, delay2 = 500) {
    i_e(input_or_extern, 'onTouchStart', -2, x, y);
    setTimeout(() => {
        i_e(input_or_extern, 'onTouchEnd', -2, x, y);
    }, delay1);
    setTimeout(() => {
        inputs.mouse.shooting = false;
    }, delay2);
}
*/
 
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
 
//Custom Auto Spin
function getMouseAngle(x, y) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
 
    const dx = x - centerX;
    const dy = y - centerY;
 
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
 
    return angle < 0 ? angle + 360 : angle;
}
 
function offset_Angle(angle){
    let _angle;
    if(angle <= 360){
        _angle = angle;
    }else{
        _angle = angle-360;
        while(_angle > 360){
            _angle -= 360;
        }
    }
    return _angle;
}
 
function getPointOnCircle(degrees) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) / 2;
 
    const radians = degrees * (Math.PI / 180);
    const x = centerX + radius * Math.cos(radians);
    const y = centerY + radius * Math.sin(radians);
 
    return { x:x, y:y };
}
 
let cas_force = false;
let cas_active = false;
let starting_angle = 0;
let temp_interval = setInterval(start_custom_spin, modules.Mouse.Custom_auto_spin.settings.Interval.selected);
function start_keyDown_Proxy(){
extern.onKeyDown = new Proxy(extern.onKeyDown, {
    apply: function (target, thisArgs, args){
        if(args.length > 1 && args[1] === fingerprint){
            //inputs coming from script
 
            //inputs_game
            let keys = Object.keys(inputs.moving_game);
            let key_nums = [];
            let l = keys.length;
            for(let i = 0; i < l; i++){
                key_nums[i] = diep_keys[keys[i]];
            }
            if(key_nums.includes(args[0])){
                let i = key_nums.indexOf(args[0]);
                inputs.moving_game[keys[i]] = true;
            }
        }else if(modules.Mouse.Custom_auto_spin.settings.Replace_auto_spin.active && args[0] === diep_keys.KeyC){
            //Auto Spin replacer
            cas_active = !cas_active;
            new_notification(`Custom Auto Spin: ${cas_active?'On':'Off'}`, notification_rgbs.normal, 4000);
           return;
        }else{
            //inputs coming from user
 
            //inputs_real
            let keys = Object.keys(inputs.moving_real);
            let key_nums = [];
            let l = keys.length;
            for(let i = 0; i < l; i++){
                key_nums[i] = diep_keys[keys[i]];
            }
            if(key_nums.includes(args[0])){
                let i = key_nums.indexOf(args[0]);
                inputs.moving_real[keys[i]] = true;
            }
        }
        return Reflect.apply(target, thisArgs, args);
    }
});
}
 
function start_keyUp_Proxy(){
extern.onKeyUp = new Proxy(extern.onKeyUp, {
    apply: function (target, thisArgs, args){
        if(args.length > 1 && args[1] === fingerprint){
            //inputs coming from script
 
            //moving_game
            let keys = Object.keys(inputs.moving_game);
            let key_nums = [];
            let l = keys.length;
            for(let i = 0; i < l; i++){
                key_nums[i] = diep_keys[keys[i]];
            }
            if(key_nums.includes(args[0])){
                let i = key_nums.indexOf(args[0]);
                inputs.moving_game[keys[i]] = false;
            }
        }else{
            //inputs coming from user
 
            //moving_real
            let keys = Object.keys(inputs.moving_real);
            let key_nums = [];
            let l = keys.length;
            for(let i = 0; i < l; i++){
                key_nums[i] = diep_keys[keys[i]];
            }
            if(key_nums.includes(args[0])){
                let i = key_nums.indexOf(args[0]);
                inputs.moving_real[keys[i]] = false;
                //make sure script knows if you unpressed a key that it was pressing
                if(inputs.moving_game[keys[i]]) inputs.moving_game[keys[i]] = false;
            }
        }
        return Reflect.apply(target, thisArgs, args);
    }
});
}
 
function start_custom_spin(){
    clearInterval(temp_interval);
    temp_interval = setInterval(start_custom_spin, modules.Mouse.Custom_auto_spin.settings.Interval.selected);
    if(!player.inGame) return;
    if(!modules.Mouse.Custom_auto_spin.settings.Replace_auto_spin.active) cas_active = modules.Mouse.Custom_auto_spin.settings.Custom_auto_spin.active;
    if(!cas_active){
        starting_angle = getMouseAngle(inputs.mouse.real.x, inputs.mouse.real.y);
        if(inputs.mouse.isForced && cas_force){
            disable_force();
            cas_force = false;
        }
    }else{
        cas_force = true;
        let l = Math.pow(2, modules.Mouse.Custom_auto_spin.settings.Smoothness.selected);
        console.log(l);
        let angle_peace = 360/l;
        console.log(angle_peace);
        let time_peace = modules.Mouse.Custom_auto_spin.settings.Interval.selected/l;
        for(let i = 0; i < l; i++){
            setTimeout(() => {
                let temp_angle = offset_Angle(starting_angle + angle_peace * i);
                let temp_coords = getPointOnCircle(temp_angle);
                apply_force(temp_coords.x, temp_coords.y);
                i_e('extern', 'onTouchMove', -1, temp_coords.x, temp_coords.y);
            }, time_peace*i);
        }
    }
}
 
//Sandbox Auto Lvl up
function sandbox_lvl_up() {
    if (modules.Functional.Sandbox_lvl_up.active && player.connected && player.inGame && player.gamemode === "sandbox") {
        document.querySelector("#sandbox-max-level").click();
    }
}
 
//START, autorespawn Module
 
//name saving logic
var killer_names = localStorage.getItem("[Diep.io+] saved names") ? JSON.parse(localStorage.getItem("[Diep.io+] saved names")) : ['r!PsAw', 'TestTank'];
function import_killer_names(){
    let imported_string = prompt('Paste killer names here: ', '["name1", "name2", "name3"]');
    killer_names = killer_names.concat(JSON.parse(imported_string));
    killer_names = [...new Set(killer_names)];
    localStorage.setItem("[Diep.io+] saved names", JSON.stringify(killer_names));
}
let banned_names = ["Pentagon", "Triangle", "Square", "Crasher", "Mothership", "Guardian of Pentagons", "Fallen Booster", "Fallen Overlord", "Necromancer", "Defender", "Unnamed Tank"];
function check_and_save_name(){
    deep_debug(_c.killer_name, !killer_names.includes(_c.killer_name));
    if(_c.screen_state === 'game-over' && !banned_names.includes(_c.killer_name) && !killer_names.includes(_c.killer_name)){
        deep_debug("Condition met!");
        killer_names.push(_c.killer_name);
        deep_debug("Added");
        killer_names = [...new Set(killer_names)];
        if(modules.Functional.Auto_respawn.settings.Remember.active){
            localStorage.setItem("[Diep.io+] saved names", JSON.stringify(killer_names));
            deep_debug("saved list");
        }
    }
}
 
function get_random_killer_name(){
    let l = killer_names.length;
    let index = Math.floor(Math.random() * l);
    return killer_names[index];
}
 
//Random Symbols/Numbers/Letters
function generate_random_name_string(type){
    let final_result = '';
    let chars = '';
    switch(type){
        case "Symbols":
            chars = '!@#$%^&*()_+=-.,][';
            break
        case "Numbers":
            chars = '1234567890';
            break
        case "Letters":
            chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            break
    }
    for (let i = 0; i < 16; i++) {
        final_result += chars[Math.floor(Math.random() * chars.length)];
    }
    return final_result;
}
//ascii inject
function get_ascii_inject(type){
    let asciiArray = [];
    switch(type){
        case "Glitched":
            asciiArray = [0x110000];
            break
        case "N A M E":
            asciiArray = player.name.split("").flatMap(char => [char.charCodeAt(0), 10]).slice(0, -1);
            break
    }
    let interesting = {
        length: asciiArray.length,
        charCodeAt(i) {
            return asciiArray[i];
        },
    };
    const argument = {
        toString() {
            return interesting;
        },
    };
    return argument;
}
 
//main Loop
function get_respawn_name_by_type(type){
    let temp_name = '';
    switch(type){
        case "Normal":
            temp_name = player.name;
            break
        case "Glitched":
            temp_name = get_ascii_inject(type);
            break
        case "N A M E":
            temp_name = get_ascii_inject(type);
            break
        case "Random Killer":
            temp_name = get_random_killer_name();
            break
        case "Random Symbols":
            temp_name = generate_random_name_string('Symbols');
            break
        case "Random Numbers":
            temp_name = generate_random_name_string('Numbers');
            break
        case "Random Letters":
            temp_name = generate_random_name_string('Letters');
            break
    }
    return temp_name;
}
function respawn() {
    check_and_save_name();
    if (modules.Functional.Auto_respawn.settings.Auto_respawn.active && player.connected && !player.inGame) {
        //prevent respawn after 300k flag
        if(modules.Functional.Auto_respawn.settings.Prevent.active && _c.death_score >= 300000){
            return;
        }
        let type = modules.Functional.Auto_respawn.settings.Name.selected;
        let temp_name = get_respawn_name_by_type(type);
        extern.try_spawn(temp_name);
    }
}
 
//END
 
//AntiAfk Timeout
function AntiAfkTimeout() {
    if (modules.Mouse.Anti_timeout.active && player.connected) {
        extern.onTouchMove(inputs.mouse.real.x, inputs.mouse.real.y);
    }
}
 
//Zoom
function start_zoom_proxy(){
    input.setScreensizeZoom = new Proxy(input.setScreensizeZoom, {
        apply: function(target, thisArgs, args){
            player.base_value = args[1];
            let factor = modules.Functional.Zoom.value / 100;
            player.dpr = player.base_value * factor;
            let newargs = [args[0], player.dpr];
            return Reflect.apply(target, thisArgs, newargs);
        }
    });
}
function HandleZoom() {
    if(player.connected){
        //let base_value = 1;
        //let factor = modules.Functional.Zoom.value / 100;
        //player.dpr = base_value * factor;
        let diepScale = player.base_value * Math.floor(player.ui_scale * windowScaling() * 25) / 25;
        extern.setScreensizeZoom(diepScale, player.base_value);
        extern.updateDPR(player.dpr);
    }
}
 
//ctx helper functions
function ctx_arc(x, y, r, sAngle, eAngle, counterclockwise, c, stroke_or_fill = 'fill', _globalAlpha=1, _lineWidth = '2px') {
    let original_ga = ctx.globalAlpha;
    let original_lw = ctx.lineWidth;
    ctx.beginPath();
    ctx.arc(x, y, r, sAngle, eAngle, counterclockwise);
    ctx.globalAlpha = _globalAlpha;
    switch(stroke_or_fill){
        case "fill":
            ctx.fillStyle = c;
            ctx.fill();
            break
        case "stroke":
            ctx.lineWidth = _lineWidth;
            ctx.strokeStyle = c;
            ctx.stroke();
            ctx.lineWidth = original_lw;
            break
    }
    ctx.globalAlpha = original_ga;
}
 
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
 
//Key Binds for Tank Upgrading
let selected_box = null;
let _bp = { //box parameters
    startX: 47,
    startY: 67,
    distX: 13,
    distY: 9,
    width: 86,
    height: 86,
    outer_xy: 2
}
 
let _bo = { //box offsets
    offsetX: _bp.width + (_bp.outer_xy * 2) + _bp.distX,
    offsetY: _bp.height + (_bp.outer_xy * 2) + _bp.distY
}
 
function step_offset(steps, offset){
    let final_offset = 0;
    switch(offset){
        case "x":
            final_offset = _bp.startX + (steps * _bo.offsetX);
            break
        case "y":
            final_offset = _bp.startY + (steps * _bo.offsetY);
            break
    }
    return final_offset;
}
 
const boxes = [
    {
        color: "lightblue",
        LUcornerX: _bp.startX,
        LUcornerY: _bp.startY,
        KeyBind: "R"
    },
    {
        color: "green",
        LUcornerX: _bp.startX + _bo.offsetX,
        LUcornerY: _bp.startY,
        KeyBind: "T"
    },
    {
        color: "red",
        LUcornerX: _bp.startX,
        LUcornerY: _bp.startY + _bo.offsetY,
        KeyBind: "F"
    },
    {
        color: "yellow",
        LUcornerX: _bp.startX + _bo.offsetX,
        LUcornerY: _bp.startY + _bo.offsetY,
        KeyBind: "G"
    },
    {
        color: "blue",
        LUcornerX: _bp.startX,
        LUcornerY: step_offset(2, "y"),
        KeyBind: "V"
    },
    {
        color: "purple",
        LUcornerX: _bp.startX + _bo.offsetX,
        LUcornerY: step_offset(2, "y"),
        KeyBind: "B"
    }
]
 
//upgrading Tank logic
function upgrade_get_coords(color){
    let l = boxes.length;
    let upgrade_coords = {x: "not defined", y: "not defined"};
    for(let i = 0; i < l; i++){
        if(boxes[i].color === color){
            upgrade_coords.x = dim_c.windowScaling_2_window(boxes[i].LUcornerX + (_bp.width/2));
            upgrade_coords.y = dim_c.windowScaling_2_window(boxes[i].LUcornerY + (_bp.height/2));
        }
    }
    deep_debug(upgrade_coords);
    return upgrade_coords;
}
 
function upgrade(color, delay = 100, cdelay1, cdelay2){
    let u_coords = upgrade_get_coords(color);
    //ghost_click_at('extern', u_coords.x, u_coords.y, cdelay1, cdelay2);
    click_at('extern', u_coords.x, u_coords.y, cdelay1, cdelay2); //using this since ghost_click was patched
}
window.upgrade = upgrade;
 
function visualise_tank_upgrades(){
    let l = boxes.length;
    for (let i = 0; i < l; i++) {
        let coords = upgrade_get_coords(boxes[i].color);
        ctx_text(boxes[i].color, "black", 6, 1.5 + "em Ubuntu", `[${boxes[i].KeyBind}]`, coords.x, coords.y);
    }
}
 
function check_tu_KeyBind(_KeyBind){
    let l = boxes.length;
    for (let i = 0; i < l; i++) {
        if(_KeyBind === `Key${boxes[i].KeyBind}`){
            deep_debug(_KeyBind, `Key${boxes[i].KeyBind}`, _KeyBind === `Key${boxes[i].KeyBind}`);
            upgrade(boxes[i].color);
        }
    }
}
 
document.body.addEventListener("keydown", function(e) {
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
    if(modules.Functional.Tank_upgrades.settings.Tank_upgrades.active){
        check_tu_KeyBind(e.code);
    }
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
//destroyer cooldown visualiser
let times_watcher = {
    waiting: false,
    cooldowns: [2540, 2311, 2201, 1911, 1760, 1681, 1560, 1381],
}
 
function draw_destroyer_cooldown(){
    let c = times_watcher.waiting? 'red' : 'lime' ;
    ctx_arc(inputs.mouse.real.x, inputs.mouse.real.y, 50*player.dpr, 0, 2 * Math.PI, false, c, 'fill', 0.3);
}
 
function handle_cooldown(_cd){
    times_watcher.waiting = true;
    setTimeout(() => {
        times_watcher.waiting = false;
    }, _cd);
}
document.body.addEventListener("mousedown", function(e) {
    if(e.button === 0 && !times_watcher.waiting && player.inGame){
        let _cd = times_watcher.cooldowns[modules.Visual.destroyer_cooldown.settings.reload.selected];
        handle_cooldown(_cd);
    }
});
 
document.body.addEventListener("keydown", function(e){
    if(e.keyCode === 32 && !times_watcher.waiting && player.inGame){
        let _cd = times_watcher.cooldowns[modules.Visual.destroyer_cooldown.settings.reload.selected];
        handle_cooldown(_cd);
    }
});
 
//debug function
function draw_canvas_debug(){
    let temp_textX = canvas.width/2, temp_textY = canvas.height/2;
    let temp_texts = [
        `Your Real mouse position! x: ${inputs.mouse.real.x} y: ${inputs.mouse.real.y}`,
        `Scaled down for the game! x: ${(inputs.mouse.game.x).toFixed(2)} y: ${(inputs.mouse.game.y).toFixed(2)}`,
        `player values! DPR: ${player.dpr} base value: ${player.base_value} ui scale: ${player.ui_scale}`,
        `window Scaling: ${windowScaling()}`,
        `Canvas! width: ${canvas.width} height: ${canvas.height}`,
        `Window! width: ${window.innerWidth} height: ${window.innerHeight}`,
        `Ratio between Window and Canvas: ${dim_c.window_2_canvas(1)}`,
        `Inputs Moving_game: ${inputs.moving_game.KeyW} ${inputs.moving_game.KeyA} ${inputs.moving_game.KeyS} ${inputs.moving_game.KeyD} ${inputs.moving_game.ArrowUp} ${inputs.moving_game.ArrowRight} ${inputs.moving_game.ArrowDown} ${inputs.moving_game.ArrowLeft}`
    ];
    let l = temp_texts.length;
    let _d = (canvas.height/3)/l;
    for(let i = 0; i < l; i++){
        ctx_text('yellow', 'black', 5, 1.5 + "em Ubuntu", temp_texts[i], temp_textX, temp_textY + (i * _d));
    }
    //drawing line from your real mouse position, to your ingame mouse position
    ctx.beginPath();
    ctx.strokeStyle = "Red";
    ctx.moveTo(inputs.mouse.real.x, inputs.mouse.real.y);
    ctx.lineTo(inputs.mouse.game.x*player.dpr, inputs.mouse.game.y*player.dpr);
    ctx.stroke();
}
 
//CANVAS API REQUIRED FOR EVERYTHING HERE
function compare_versions(version1, version2) {
    if (!version1 || !version2) {
        console.warn('Not enough arguments');
        return;
    }
 
    const values1 = version1.split('.').map(Number);
    const values2 = version2.split('.').map(Number);
    const maxLength = Math.max(values1.length, values2.length);
 
    for (let i = 0; i < maxLength; i++) {
        const v1 = values1[i] || 0;
        const v2 = values2[i] || 0;
 
        if (v1 > v2) return 'newer';
        if (v1 < v2) return 'older';
    }
 
    return 'equal';
}
 
//maths helper functions
function get_average(points) {
    let result = [0, 0];
    for (let point of points) {
        result[0] += point[0];
        result[1] += point[1];
    }
    result[0] /= points.length;
    result[1] /= points.length;
    return result;
}
 
//api detecting logic
let current_tries = 0;
let notify_after_tries = 100;
let notified_about_missing = false;
let api_loaded = false;
let api_missing = false;
 
function notify_about_missing(){
    if(notified_about_missing) return;
    alert('Missing Canvas Api to run addon script, join our discord server to get it: https://discord.gg/S3ZzgDNAuG');
    notified_about_missing = true;
}
 
function await_api(){
    if(current_tries > notify_after_tries) {
        api_missing = true;
        return;
    }
    current_tries++;
    api_loaded = !!window.ripsaw_api;
    console.log('did api load?', api_loaded);
    window.ripsaw_api ? clearInterval(interval_api) : setTimeout(await_api, 100);
}
var interval_api = setInterval(await_api, 100);
 
//version require
let req_indexes = new Set();
let req_bools = [];
function ra_require(version, index){
    if(api_loaded && !api_missing && !req_bools[index]){
        if(req_indexes.has(index)) return console.warn('index already being used!');
        let compare = ['equal', 'newer'];
        let result = compare.includes(compare_versions(window.ripsaw_api.version, version));
        req_bools[index] = true; //it's to let script know that this function doesn't need to loop after notifying
        req_indexes.add(index);
        if(!result) alert(`Required API version: ${version} and above!\nUpdate in our Discord server :) https://discord.gg/S3ZzgDNAuG`);
    }
}
 
//helper API functions
function get_your_tank(tanks){
    let closest = null;
    let last_d = Infinity;
    for(let tank of tanks){
        let dx = tank.body[0].x - (canvas.width / 2);
        let dy = tank.body[0].y - (canvas.height / 2);
        let d = Math.hypot(dx, dy);
        if (d < last_d) {
            closest = tank;
            last_d = d;
        }
    }
    if (!closest) return;//console.warn("Your Tank wasn't found yet...");
    return closest;
}
 
function get_your_true_color(tank){
    if(tank.name === "Unknown Tank") return;
    if(tank.body.length === 1) return tank.body[0];
    let i = 1;
    let b1 = tank.body[0];
    let b2 = tank.body[i];
    if(!b1 || !b2) return;
    while(b1.color === b2.color && i < tank.body.length){
        i++;
        b2 = tank.body[i];
    }
    if(b1.color === b2.color) return console.warn('duplicate');
    if(b1.radius < b2.radius) return b1.color;
    if(b2.radius < b1.radius) return b2.color;
}
 
//Enemy Tracers
function draw_enemy_tracers(){
    let tanks = ripsaw_api.get_tanks();
    let your_tank = get_your_tank(tanks);
 
    if (tanks && your_tank) {
        let your_team_color = get_your_true_color(your_tank);
        let enemies = [];
 
        for (let tank of tanks) {
            let temp_team_color = get_your_true_color(tank);
            if (temp_team_color != your_team_color) enemies.push(tank);
        }
 
        if (enemies.length > 0) {
            for(let enemy of enemies){
                if(enemy.name != 'Unknown Tank'){
                let toX = enemy.body[0].x, toY = enemy.body[0].y, fromX = your_tank.body[0].x, fromY = your_tank.body[0].y;
                const dx = toX - fromX;
                const dy = toY - fromY;
                const distance = Math.hypot(dx, dy);
                if (distance === 0) return; // avoid divide-by-zero
 
                // Normalize the direction vector and scale it to the desired length
                const headLength = 50;
 
                let maxLength = Math.min(canvas.width / 2, canvas.height / 2);
                let length = Math.min(maxLength, distance); // cap by distance
 
                const dirX = (dx / distance) * length;
                const dirY = (dy / distance) * length;
 
                const endX = fromX + dirX;
                const endY = fromY + dirY;
 
                const angle = Math.atan2(dirY, dirX);
                let og = ctx.strokeStyle;
                ctx.beginPath();
                ctx.strokeStyle = "red";
 
                // Draw arrowhead
                ctx.beginPath();
                ctx.moveTo(endX, endY);
                ctx.lineTo(
                    endX - headLength * Math.cos(angle - Math.PI / 6),
                    endY - headLength * Math.sin(angle - Math.PI / 6)
                );
                ctx.lineTo(
                    endX - headLength * Math.cos(angle + Math.PI / 6),
                    endY - headLength * Math.sin(angle + Math.PI / 6)
                );
                ctx.lineTo(endX, endY);
                ctx.lineTo(
                    endX - headLength * Math.cos(angle - Math.PI / 6),
                    endY - headLength * Math.sin(angle - Math.PI / 6)
                );
                ctx.stroke();
                ctx.strokeStyle = og;
                }
            }
        }
    }
}
 
 
//information about the map
const world_map = {
    min: {x: 0, y:0},
    max: {x:26000, y:26000},
}
 
const map_bases = {
    t2: {
        width: this.width = 3900,
        height: this.height = world_map.max.y,
        //left upper corner (start), right bottom corner (end)
        blue: {
            start: {x: 0, y: 0},
            end: {x: this.width, y: this.height},
        },
        red: {
            start: {x: world_map.max.x-this.width, y: 0},
            end: {x: world_map.max.x, y: this.height},
        },
    },
    t4: {
        width: this.width = 3900,
        height: this.height = 3900,
        //left upper corner (start), right bottom corner (end)
        blue: {
            start: {x: 0, y: 0},
            end: {x: this.width, y: this.height},
        },
        purple: {
            start: {x: world_map.max.x-this.width, y: 0},
            end: {x: world_map.max.x, y: this.height},
        },
        green: {
            start: {x: 0, y: world_map.max.y-this.height},
            end: {x: this.width, y: world_map.max.y},
        },
        red: {
            start: {x: world_map.max.x-this.width, y: world_map.max.y-this.height},
            end: {x: world_map.max.x, y: world_map.max.y},
        },
    }
}
 
//calculate your world position
 
function get_your_world_pos(){
    if(api_missing) {
        notify_about_missing();
        return -1;
    }
    if(!req_bools[1]) ra_require('0.0.8', 1);
    //calculate
    let minimap = window.ripsaw_api.get_minimap().corners;
    let you = window.ripsaw_api.get_arrows().minimap.center;
    let unscaled = {
        x: you[0]-minimap.top_left[0],
        y: you[1]-minimap.top_left[1],
        max: {x: minimap.top_right[0]-minimap.top_left[0], y: minimap.bottom_left[1]-minimap.top_left[1]},
    }
    let precision = modules.Addons.world_coords.settings.precision.selected;
    let world = {
        x: JSON.parse(((unscaled.x/unscaled.max.x)*world_map.max.x).toFixed(precision)),
        y: JSON.parse(((unscaled.y/unscaled.max.y)*world_map.max.y).toFixed(precision)),
    }
    return world;
}
 
/* little debug to check if base positions are correct
setInterval(() =>{
    let you = get_your_world_pos();
    let keys = ['blue', 'green', 'red', 'purple'];
    console.log(' ');
    for(let key of keys){
        let t = map_bases.t4[key];
        let insideX = (you.x > t.start.x) && (you.x < t.end.x);
        let insideY = (you.y > t.start.y) && (you.y < t.end.y);
        console.log(`%cAre you inside ${key} base?: x ${insideX} y ${insideY}`, `color: ${key}`);
    }
}, 500);
*/
 
//check if you're inside a base
function is_player_in_base(){
    let you = get_your_world_pos();
    if(you === -1) return -1;
    let t = map_bases.t4[player.team];
    let insideX = (you.x > t.start.x) && (you.x < t.end.x);
    let insideY = (you.y > t.start.y) && (you.y < t.end.y);
    return (insideX && insideY);
}
 
//aim lines
function draw_aim_lines(len_factor=1){
    let temp_tanks = window.ripsaw_api.get_tanks();
    if(temp_tanks.length <= 0) return;
    for(let temp_tank of temp_tanks){
        for(let temp_turret of temp_tank.turrets){
            switch(temp_turret.source_array){
                case "rectangular":{
                    let diff = {
                        x: temp_turret.coords.endX - temp_turret.coords.startX,
                        y: temp_turret.coords.endY - temp_turret.coords.startY,
                    };
                    ctx.moveTo(temp_turret.coords.startX, temp_turret.coords.startY);
                    ctx.lineTo(temp_turret.coords.startX + (diff.x * len_factor), temp_turret.coords.startY + (diff.y * len_factor));
                    ctx_text('yellow', 'black', 5, 1.5 + "em Ubuntu", temp_tank.name, temp_turret.coords.startX + (diff.x * len_factor), temp_turret.coords.startY + (diff.y * len_factor));
                    ctx.stroke();
                }
                    break
                case "other":{
                    if(temp_turret.points.length < 4) return console.warn('less than 4 points');
                    let start = get_average([temp_turret.points[0], temp_turret.points[3]]);
                    let end = get_average([temp_turret.points[1], temp_turret.points[2]]);
                    let diff = [
                        end[0]-start[0],
                        end[1]-start[1]
                    ];
                    ctx.moveTo(...start);
                    ctx.lineTo(start[0]+(diff[0] * len_factor), start[1]+(diff[1] * len_factor));
                    ctx_text('yellow', 'black', 5, 1.5 + "em Ubuntu", temp_tank.name, start[0]+(diff[0] * len_factor), start[1]+(diff[1] * len_factor));
                    ctx.stroke();
                }
                    break
            }
        }
    }
}
 
//Farm Bot
let get_closest_update_notified = false;
let last_shape = [0, 0];
let resetting_farmbot_movement_complete = false;
 
let exposed_sm = {
    points: null,
    closest: null,
}
 
function handle_farmbot_aim(){
    window.requestAnimationFrame(handle_farmbot_aim);
    if(player.connected && player.inGame){
        if(last_shape.length > 0 && modules.Addons.farm_bot.settings.toggle_farm_bot.active){
            let temp = [dim_c.canvas_2_window(last_shape[0]), dim_c.canvas_2_window(last_shape[1])];
            apply_force(...temp);
            i_e('extern', 'onTouchMove', -1, ...temp);
        }else{
            disable_force();
        }
    }
}
window.requestAnimationFrame(handle_farmbot_aim);
 
function simple_move(x, y){
    let center = {x: canvas.width/2, y: canvas.height/2};
    let len = Math.min(canvas.width, canvas.height)/3;
    let a = {
        posx: center.x + len,
        posy: center.y + len,
        negx: center.x - len,
        negy: center.y - len,
    }
    //diagonals
    let dia = {
        posx: center.x + (len/3)*2,
        posy: center.y + (len/3)*2,
        negx: center.x - (len/3)*2,
        negy: center.y - (len/3)*2,
    }
    let points = {
        LeftTop: {x: dia.negx, y: dia.negy},
        CenterTop: {x: center.x, y: a.negy},
        RightTop: {x: dia.posx, y: dia.negy},
        RightCenter: {x: a.posx, y: center.y},
        RightBottom: {x: dia.posx, y: dia.posy},
        CenterBottom: {x: center.x, y: a.posy},
        LeftBottom: {x: dia.negx, y: dia.posy},
        LeftCenter: {x: a.negx, y: center.y},
    }
    let closest = {
        key: null,
        distance: canvas.width+canvas.height, //ensure to make it large at the start
    }
    let activate_keys = (keys) => {
        let temp = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
        for(let key of temp){
            if(!document.hasFocus()){
                inputs.moving_game[key] = false;
                one_time_notification('your tab is running in the background!', notification_rgbs.warning, 5000);
            }else{
                notifications.length = 0;
            }
            //press keys from arguments
            if(keys.includes(key) && !inputs.moving_game[key]){
                extern.onKeyDown(diep_keys[key], fingerprint);
            //unpress the rest (of temp) if it's being pressed
            }else if(!keys.includes(key) && inputs.moving_game[key]){
                extern.onKeyUp(diep_keys[key], fingerprint);
            }
        }
    }
    for(let point in points){
        let d = calculate_distance(points[point].x, points[point].y, x, y);
        if(closest.distance > d){
            closest.key = point;
            closest.distance = d;
        }
    }
    exposed_sm.closest = closest;
    exposed_sm.points = points;
    let selected_keys = [];
    switch(closest.key){
        case 'LeftTop':
            selected_keys[0] = 'KeyW';
            selected_keys[1] = 'KeyA';
            break
        case 'CenterTop':
            selected_keys[0] = 'KeyW';
            break
        case 'RightTop':
            selected_keys[0] = 'KeyW';
            selected_keys[1] = 'KeyD';
            break
        case 'RightCenter':
            selected_keys[0] = 'KeyD';
            break
        case 'RightBottom':
            selected_keys[0] = 'KeyS';
            selected_keys[1] = 'KeyD';
            break
        case 'CenterBottom':
            selected_keys[0] = 'KeyS';
            break
        case 'LeftBottom':
            selected_keys[0] = 'KeyS';
            selected_keys[1] = 'KeyA';
            break
        case 'LeftCenter':
            selected_keys[0] = 'KeyA';
            break
    }
    activate_keys(selected_keys);
}
 
//It just won't work wtf
/*
const du_distance_2_point = 1000;
const reached = { s: false, e: false };
 
function handle_base_movement(){
    const you = get_your_world_pos();
    let s_point, e_point, c_point;
    switch(player.team){
        case "purple":
        case "green":
            return
        case "blue":
            s_point = {
                x: map_bases.t2.blue.start.x + map_bases.t2.width/2,
                y: map_bases.t2.blue.start.y,
            };
            e_point = {
                x: map_bases.t2.blue.end.x - map_bases.t2.width/2,
                y: map_bases.t2.blue.end.y,
            };
            break
        case "red":
            s_point = {
                x: map_bases.t2.red.start.x + map_bases.t2.width/2,
                y: map_bases.t2.red.start.y,
            };
            e_point = {
                x: map_bases.t2.red.end.x - map_bases.t2.width/2,
                y: map_bases.t2.red.end.y,
            };
            break
    }
    //at start select starting point as current point
    if(!reached.s && !reached.e) c_point = s_point;
    if(reached.s){
        //if starting point is reached, select ending point
        c_point = e_point;
        reached.s = false;
    }else if(reached.e) {
        //if ending point is reached, select starting point
        c_point = s_point;
        reached.e = false;
    };
    //check y distance to decide if you reached the point
    if (Math.abs(you.y - s_point.y) < du_distance_2_point) reached.s = true;
    if (Math.abs(you.y - e_point.y) < du_distance_2_point) reached.e = true;
 
    //movement logic
 
    let activate_keys = (keys) => {
        let temp = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
        for(let key of temp){
            if(!document.hasFocus()){
                inputs.moving_game[key] = false;
                one_time_notification('your tab is running in the background!', notification_rgbs.warning, 5000);
            }else{
                notifications.length = 0;
            }
            //press keys from arguments
            if(keys.includes(key) && !inputs.moving_game[key]){
                extern.onKeyDown(diep_keys[key], fingerprint);
            //unpress the rest (of temp) if it's being pressed
            }else if(!keys.includes(key) && inputs.moving_game[key]){
                extern.onKeyUp(diep_keys[key], fingerprint);
            }
        }
    }
    console.log(you, c_point);
    let selected_keys = [];
    if(you.x > c_point.x){
        selected_keys.push("KeyA");
    }else if(you.x < c_point.x){
        selected_keys.push("KeyD");
    }
 
    if(you.y > c_point.y){
        selected_keys.push("KeyW");
    }else if(you.y < c_point.y){
        selected_keys.push("KeyS");
    }
    activate_keys(selected_keys);
    ctx.moveTo(canvas.width/2, canvas.height/2);
    ctx.lineTo(c_point.x, c_point.y);
    ctx.stroke();
}
*/
 
//only one of them can be active at a time
const moving_scripts = [
    {
        name: "Move to Shape Setting",
        settings: modules.Addons.farm_bot.settings.move_to_shape,
    },
    {
        name: "Move to Mouse Module",
        settings: modules.Mouse.Move_2_mouse.settings.Move_2_mouse,
    },
    /*
    {
        name: "Move in base Setting",
        settings: modules.Addons.farm_bot.settings.move_in_base,
    },
    */
];
 
function safe_enable_moving_script(index){
    if(index < 0 || index >= moving_scripts.length || typeof index != "number") return false;
    for(let i = 0; i < moving_scripts.length; i++){
        if(i !== index && moving_scripts[i].settings.active){
            one_time_notification(
                `${moving_scripts[i].name} was disabled to make ${moving_scripts[index].name} work`,
                notification_rgbs.normal,
                5000
            );
            moving_scripts[i].settings.active = false;
            moving_scripts[i].settings.update_toggle(moving_scripts[i].settings.checkbox);
        }
    }
 
    return true;
}
 
function handle_farmbot_movement(){
    window.requestAnimationFrame(handle_farmbot_movement);
    if(modules.Addons.farm_bot.settings.toggle_farm_bot.active){
    if(player.inGame && player.connected){
        resetting_farmbot_movement_complete = false;
        //move in base 2tdm
            //if(modules.Addons.farm_bot.settings.move_in_base.active){
                //needs fix or rework
                //if(safe_enable_moving_script(2)) handle_base_movement();
            //}
        //moving to shape
        if(modules.Addons.farm_bot.settings.move_to_shape.active){
            if(!safe_enable_moving_script(0)) return;
            if(last_shape.length === 0){
                reset_moving_game(['KeyW', 'KeyA', 'KeyS', 'KeyD']);
            }else{
                simple_move(...last_shape);
            }
        }else{
            reset_moving_game(['KeyW', 'KeyA', 'KeyS', 'KeyD']);
        }
    }
    }else{
        if(!resetting_farmbot_movement_complete){
            reset_moving_game(['KeyW', 'KeyA', 'KeyS', 'KeyD']);
            resetting_farmbot_movement_complete = true;
        }
    }
}
window.requestAnimationFrame(handle_farmbot_movement);
 
function modified_get_closest(arr, obj){
    if(arr.length === 0 || Object.keys(obj).length === 0) return console.warn('either array or object is empty at modified get closest');
    let output = [0, 0];
    let priorities = ["pentagons", "triangles", "squares", "crashers"];
    let best = {
        priority: 4
    };
    let result;
    switch(modules.Addons.farm_bot.settings.detect_type.selected){
        case "closest":
            output = window.ripsaw_api.get_closest(arr);
            break
        case "most xp":
            for(let temp_arg in obj){
                let temp_priority = priorities.indexOf(temp_arg);
                if(obj[temp_arg].length > 0 && temp_priority < best.priority){
                    best.priority = temp_priority;
                }
            }
            result = window.ripsaw_api.get_closest(obj[priorities[best.priority]]);
            if(result instanceof Array && result.length === 2 && typeof result[0] === "number" && typeof result[1] === "number") output = result;
            break
    }
    return output;
}
 
function start_farming(shape_types){
    //I commented this function previously, so I had to update it with the uncommented version
    if(!req_bools[0]) ra_require('0.0.7', 0);
    if(player.inGame && player.connected){
        //argument checking to avoid errors
        let allowed_types = ['crashers', 'pentagons', 'squares', 'triangles'];
        if(!(shape_types instanceof Array)) return console.warn('expected Array at start_farming, quitting...');
        let api_response = window.ripsaw_api.get_shapes();
        let temp_arr = [];
        let individual_shapes = {}; //this part is for most xp detection
        for(let temp_arg of shape_types){
            if(!allowed_types.includes(temp_arg)) return console.warn(temp_arg, ' was not found in allowed types at start_farming, quitting...');
            if(api_response[temp_arg].length > 0){ //push only if array not empty
                temp_arr.push(...api_response[temp_arg]);
                individual_shapes[temp_arg] = api_response[temp_arg]; //this part is for most xp detection
            }
        }
        if(temp_arr.length <= 0) {
            //let the script know that there are no shapes
            last_shape.length = 0;
            return;
        }
        let lol;
        //Ignore shapes outside base
        if(player.team && modules.Addons.farm_bot.settings.ignore_outside.active){
            if(!req_bools[2]) ra_require('0.0.9', 2);
            let base = window.ripsaw_api.get_bases()[player.team];
            let temp_arr2 = [];
            let l = temp_arr.length;
            for(let i = 0; i < l; i++){
                let temp_point = temp_arr[i].get('center');
                let outsideX = (temp_point[0] > base.top_right[0]) || (temp_point[0] < base.top_left[0]);
                let outsideY = (temp_point[1] > base.bottom_left[1]) || (temp_point[1] < base.top_left[1]);
                if(!outsideX && !outsideY) temp_arr2.push(temp_point);
            }
            lol = modified_get_closest(temp_arr2, individual_shapes);
            if(temp_arr2.length === 0) return;
        }else{
            lol = modified_get_closest(temp_arr, individual_shapes);
        }
        //
        last_shape[0] = lol[0];
        last_shape[1] = lol[1];
        //drawing
        let you = window.ripsaw_api.get_your_body().front_arc;
        if(modules.Addons.farm_bot.settings.toggle_lines.active && you && you.x && you.y){
            ctx.beginPath();
            ctx.strokeStyle = "purple";
            ctx.moveTo(you.x, you.y);
            ctx.lineTo(...last_shape);
            ctx.stroke();
        }
    }
}
 
//Trails
let trail = {
    now: performance.now(),
    list: new LinkedList(),
}
 
function update_trail(){
    if(player.inGame){
        let your_pos = get_your_world_pos();
        if(!your_pos) return;
        trail.list.addLast(your_pos);
    }else{
        trail.list = new LinkedList();
    }
}
 
function draw_trail(){
    let FOV = ripsaw_api.get_FOV();
    //let FOV = window.float32_values.fov.value;
    let scalingFactor = (modules.Functional.Zoom.value / 100) * windowScaling()*FOV;
    let du_2_point = function(point) {
        return point*scalingFactor;
    };
    let center = {
        x: canvas.width/2,
        y: canvas.height/2,
    };
    let your_pos = trail.list.getLast();
    let toScreen = function(target) {
        return {
            x: center.x+du_2_point(target.x-your_pos.value.x),
            y: center.y+du_2_point(target.y-your_pos.value.y),
        }
    };
    let current_pos = your_pos;
    ctx.beginPath();
    ctx.moveTo(toScreen(current_pos.value).x, toScreen(current_pos.value).y);
    console.log('start');
    while(current_pos.prev){
        console.log(your_pos, FOV, windowScaling(), scalingFactor);
        current_pos = current_pos.prev;
        ctx.lineTo(toScreen(current_pos.value).x, toScreen(current_pos.value).y);
    }
    console.log('end');
    ctx.stroke();
}
 
//experimental...
function sizeFactor(lvl){
    return Math.pow(1.01, lvl - 1);
}
 
function draw_body_clone(){
    let name = ripsaw_api.get_your_tank_name();
    let allowed_tanks = ['Manager', 'Stalker', 'Landmine'];
    if(!name || !allowed_tanks.includes(name)) return;
    let lvl = ripsaw_api.get_your_lvl();
    let FOV = ripsaw_api.get_FOV();
    if(!lvl || !FOV) return;
 
    // Compute radii
    let outerRadius = (67.5 * sizeFactor(lvl) * FOV) / windowScaling() * player.dpr;
    let innerRadius = (59 * sizeFactor(lvl) * FOV) / windowScaling() * player.dpr;
 
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
 
    // Outer circle
    ctx.beginPath();
    ctx.fillStyle = "rgba(155, 155, 0, 0.1)";
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.fill();
 
    // Inner circle
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 255, 0, 0.1)";
    ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
    ctx.fill();
}
 
//canvas gui (try to keep this in the end
setTimeout(() => {
    let gui = () => {
        if (player.inGame) {
            //DEBUG start
            if(deep_debug_properties.canvas){
                draw_canvas_debug();
            }
            //DEBUG end
            if(modules.Addons.invisibles.active){
                if(api_missing) {
                    notify_about_missing();
                    return;
                }
                draw_body_clone();
            }
            if(modules.Functional.Tank_upgrades.settings.visualise.active){
                visualise_tank_upgrades();
            }
            if (modules.Visual.Key_inputs_visualiser.active) {
                visualise_keys();
            }
            if (modules.Visual.destroyer_cooldown.settings.destroyer_cooldown.active){
                draw_destroyer_cooldown();
            }
            if(modules.Mouse.Move_2_mouse.settings.Move_2_mouse.active && modules.Mouse.Move_2_mouse.settings.toggle_debug.active ){
                //move_to_mouse
                let center = { x: canvas.width / 2, y: canvas.height / 2 };
                let target = { x: inputs.mouse.real.x, y: inputs.mouse.real.y };
                let full_distance = calculate_distance(center.x, center.y, target.x, target.y);
                let partial_distance = full_distance/approximation_factor;
                let step = { x: (target.x - center.x) / partial_distance, y: (target.y - center.y) / partial_distance };
                //main line
                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.moveTo(center.x, center.y);
                ctx.lineTo(target.x, target.y);
                ctx.stroke();
                //other lines
                ctx.beginPath();
                ctx.strokeStyle = "yellow";
                ctx.moveTo(center.x, center.y);
                let temp = {
                    x: center.x,
                    y: center.y,
                }
                let l = Math.floor(partial_distance);
                for(let i = 0; i < l; i++){
                    temp.x += step.x * (distance_time_factor/10);
                    ctx.lineTo(temp.x, temp.y);
                    temp.y += step.y * (distance_time_factor/10);
                    ctx.lineTo(temp.x, temp.y);
                }
                ctx.stroke();
            }
            if(modules.Addons.aim_lines.settings.toggle_aim_lines.active){
                if(api_missing) {
                    notify_about_missing();
                    return;
                }
                draw_aim_lines(modules.Addons.aim_lines.settings.adjust_length.selected);
            }
            if(modules.Addons.farm_bot.settings.toggle_farm_bot.active){
                if(api_missing) {
                    notify_about_missing();
                    return;
                }
                if(modules.Addons.farm_bot.settings.toggle_debug.active){
                    //visualise the script logic
                    for(let point in exposed_sm.points){
                        //white line from closest direction to shape
                        if(point === exposed_sm.closest.key){
                            ctx.beginPath();
                            ctx.strokeStyle = "white";
                            ctx.moveTo(last_shape[0], last_shape[1]);
                            ctx.lineTo(exposed_sm.points[point].x, exposed_sm.points[point].y);
                            ctx.stroke();
                        }
                        //all directions black, closest red
                        ctx.beginPath();
                        ctx.strokeStyle = (point === exposed_sm.closest.key && last_shape.length > 0) ? "red" : "black";
                        ctx.moveTo(canvas.width/2, canvas.height/2);
                        ctx.lineTo(exposed_sm.points[point].x, exposed_sm.points[point].y);
                        ctx.stroke();
                    }
                }
                let temp_shape_array = [];
                if(!modules.Addons.farm_bot.settings.toggle_squares.active) temp_shape_array.push('squares');
                if(!modules.Addons.farm_bot.settings.toggle_crashers.active) temp_shape_array.push('crashers');
                if(!modules.Addons.farm_bot.settings.toggle_pentagons.active) temp_shape_array.push('pentagons');
                if(!modules.Addons.farm_bot.settings.toggle_triangles.active) temp_shape_array.push('triangles');
                if(temp_shape_array.length === 0) one_time_notification("You're currently ignoring all shapes, disable at least one of them or the bot won't shoot", notification_rgbs.warning, 5000);
                start_farming(temp_shape_array);
            }
            if(modules.Addons.world_coords.settings.toggle_world_coords.active){
                let world = get_your_world_pos();
                if(world === -1) return;
                let minimap = window.ripsaw_api.get_minimap().corners;
                ctx.beginPath();
                ctx_text('gray', 'black', 3, 1 + "em Ubuntu", `x: ${world.x} y: ${world.y}`, minimap.top_left[0], minimap.top_left[1]-((canvas.height-minimap.top_left[1])*0.3));
            }
            if(modules.Addons.enemy_tracers.active){
                draw_enemy_tracers();
            }
            if(modules.Addons.trails.settings.toggle_trails.active){
                if(api_missing) {
                    notify_about_missing();
                    return;
                }
                if(req_bools[3]) ra_require('0.0.8', 3);
                if(performance.now() - trail.now >= modules.Addons.trails.settings.update_interval.selected){
                    update_trail();
                    trail.now = performance.now();
                }
                if(trail.list.size() > 1){
                    draw_trail();
                }
            }else{
                trail.list = new LinkedList();
            }
        }
        window.requestAnimationFrame(gui); // Start animation loop
    };
    gui();
}, 500); // Delay before starting the rendering
 
// START ZOOM SCROLL FUNCTIONS V3
 
const zoomScrollStep = 5;
const minZoomValue = 10;
const maxZoomValue = 500;
 
let zoomIndicatorElement = null;
let zoomIndicatorTimeout = null;
 
function ensureZoomIndicatorExists() {
    if (!zoomIndicatorElement) {
        zoomIndicatorElement = document.createElement('div');
        zoomIndicatorElement.id = 'zoom-scroll-indicator-v3';
        Object.assign(zoomIndicatorElement.style, {
            position: 'fixed',
            top: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(38, 38, 38, 0.9)',
            color: 'white',
            padding: '6px 15px',
            borderRadius: '0px',
            borderBottom: '3px solid lime',
            fontFamily: '"Ubuntu", Calibri, Arial, sans-serif',
            fontSize: '18px',
            fontWeight: 'bold',
            zIndex: '1001',
            opacity: '0',
            pointerEvents: 'none',
            transition: 'opacity 2s ease-out, top 0.2s ease-out',
            textAlign: 'center',
            minWidth: '80px'
        });
        document.body.appendChild(zoomIndicatorElement);
    }
}
 
function showZoomIndicator(zoomValue) {
    ensureZoomIndicatorExists();
 
    zoomIndicatorElement.style.top = '10px';
    zoomIndicatorElement.textContent = `🔍 ${zoomValue}%`;
    zoomIndicatorElement.style.opacity = '1';
 
    if (zoomIndicatorTimeout) {
        clearTimeout(zoomIndicatorTimeout);
    }
 
    setTimeout(() => {
       zoomIndicatorElement.style.top = '15px';
    }, 50);
 
 
    zoomIndicatorTimeout = setTimeout(() => {
        zoomIndicatorElement.style.opacity = '0';
        zoomIndicatorElement.style.top = '10px';
        zoomIndicatorTimeout = null;
    }, 100);
}
 
 
function handleZoomScroll(e) {
    if (player.inGame && modules.Functional && modules.Functional.Zoom) {
        e.preventDefault();
        let currentZoom = parseFloat(modules.Functional.Zoom.value);
        let newZoom = currentZoom;
        if (e.deltaY < 0) {
            newZoom += zoomScrollStep;
        } else if (e.deltaY > 0) {
            newZoom -= zoomScrollStep;
        }
        newZoom = Math.max(minZoomValue, Math.min(maxZoomValue, newZoom));
        newZoom = Math.round(newZoom);
        if (newZoom !== currentZoom) {
            modules.Functional.Zoom.value = newZoom;
            showZoomIndicator(newZoom);
            try {
                const sliderElement = modules.Functional.Zoom.elements[1];
                if (sliderElement && sliderElement.tagName === 'INPUT' && sliderElement.type === 'range') {
                    sliderElement.value = newZoom;
                }
                const titleElement = modules.Functional.Zoom.title.el;
                if (titleElement) {
                    titleElement.innerHTML = `${modules.Functional.Zoom.name}: ${newZoom} %`;
                }
            } catch (error) {
                console.warn("[Diep.io+ Zoom Scroll] Could not update GUI slider/title visually:", error);
            }
        }
    }
}
document.body.addEventListener('wheel', handleZoomScroll, { passive: false });
 
// END ZOOM SCROLL FUNCTIONS V3
 
//INTERVALS HANDLE
let active_static_intervals = new WeakSet();
let static_intervals = {
    detect_refresh: {
        callbackFunc: detect_refresh,
        wait: 100,
        id: null,
    },
    check_gamemode: {
        callbackFunc: check_gamemode,
        wait: 250,
        id: null,
    },
    check_final_score: {
        callbackFunc: check_final_score,
        wait: 100,
        id: null,
    },
    bot_tab_active_check: {
        callbackFunc: bot_tab_active_check,
        wait: 1000,
        id: null,
    },
    update_diep_console: {
        callbackFunc: update_diep_console,
        wait: 100,
        id: null,
    },
    sandbox_lvl_up: {
        callbackFunc: sandbox_lvl_up,
        wait: 500,
        id: null,
    },
    respawn: {
        callbackFunc: respawn,
        wait: 1000,
        id: null,
    },
    AntiAfkTimeout: {
        callbackFunc: AntiAfkTimeout,
        wait: 1000,
        id: null,
    },
    HandleZoom: {
        callbackFunc: HandleZoom,
        wait: 100,
        id: null,
    },
};
 
function start_static_intervals(){
    for(let i in static_intervals){
        let temp = static_intervals[i];
        if(!active_static_intervals.has(temp) && !temp.id){
            temp.id = setInterval(temp.callbackFunc, temp.wait);
            active_static_intervals.add(temp);
        }
    }
}
 
function start_static_interval(key){
    let temp = static_intervals[key];
    if(!temp) return console.warn('undefined interval');
    if(!active_static_intervals.has(temp) && !temp.id){
        temp.id = setInterval(temp.callbackFunc, temp.wait);
        active_static_intervals.add(temp);
    }
}
 
function clear_static_interval(key){
    let temp = static_intervals[key];
    if(!temp) return console.warn('undefined interval');
    if(active_static_intervals.has(temp) && temp.id){
        clearInterval(temp.id);
        temp.id = null;
        active_static_intervals.delete(temp);
    }else{
        return console.warn('interval was not active');
    }
}
 
 
//init
 
function update_information() {
    window.requestAnimationFrame(update_information);
    let teams = ["blue", "red", "purple", "green"];
    player.connected = !!window.lobby_ip;
    player.connected? player.inGame = !!extern.doesHaveTank() : null;
    player.name = document.getElementById("spawn-nickname").value;
    player.team = teams[parseInt(_c.party_link.split('x')[1])];
    player.gamemode = _c.active_gamemode;
    player.ui_scale = parseFloat(localStorage.getItem("d:ui_scale"));
}
window.requestAnimationFrame(update_information);
 
function waitForConnection() {
    if (player.connected) {
        define_onTouch();
        start_input_proxies();
        start_zoom_proxy();
        start_keyDown_Proxy();
        start_keyUp_Proxy();
        start_static_intervals();
    } else {
        setTimeout(waitForConnection, 100);
    }
}
waitForConnection();