// ==UserScript==
// @name         Diep.io+ (2025 edition)
// @namespace    http://tampermonkey.net/
// @version      2.4.0
// @description  work in progress...
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFMDAvSZe2hsFwAIeAPcDSNx8X2lUMp-rLPA&s
// @grant        none
// @license      Mi300 don't steal my scripts ;)
// @run-at       document-start
// ==/UserScript==
 
/*
let's keep things structured this time :P
1. HOOKS & PROXIES
  1.1 access Objects with useful client sided functions
  1.2 Self made proxy manager
  1.3 Mouse Proxy
2. GUI
  2.1 script Interface & logic
*/
 
//1. HOOKS & PROXIES
 
//1.1 access Objects with useful client sided functions
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
 
//1.2 Self made proxy manager
function get_ap(){
    if(!window.active_proxies){
        let temp = new WeakMap();
        window.active_proxies = temp;
    }
    return window.active_proxies;
}
 
let active_proxies = get_ap();
 
const default_handler ={
    apply: function(target, thisArgs, args){
        console.log(`
        target: ${target}
        thisArgs: ${thisArgs}
        args: ${args}
        `);
        return Reflect.apply(target, thisArgs, args);
    }
}
 
class func_proxy{
    constructor(obj, prop, handler = default_handler){
        if(typeof obj != 'object') throw new Error(`${obj} is not an Object`);
        if(typeof obj[prop] != 'function') throw new Error(`${obj}.${prop} is not a function`);
        if(typeof handler != 'object') throw new Error(`${handler} is not an Object`);
        const func_proxy_used_methods = [
            {obj: WeakMap, prop: 'has'},
            {obj: WeakMap, prop: 'get'},
            {obj: WeakMap, prop: 'set'},
            {obj: Set, prop: 'add'},
            {obj: console, prop: 'warn'},
        ];
        for(let i = 0; i < func_proxy_used_methods.length; i++){
            let temp = func_proxy_used_methods[i];
            if((temp.obj === obj || temp.obj.prototype === obj) && temp.prop === prop){
                console.warn(`Notice, that ${temp.obj}.${temp.prop} is being used by func_proxy! Continuing...`);
                break
            }
        }
        this.original = obj[prop];
        this.obj = obj;
        this.prop = prop;
        this.handler = handler;
        this.active = false;
    }
    proxy_exists(){
        return active_proxies.has(this.obj) && active_proxies.get(this.obj).has(this.prop);
    }
    start(){
        if(!this.proxy_exists()){
            this.obj[this.prop] = new Proxy(this.obj[this.prop], this.handler);
            this.active = true;
            let temp;
            if(active_proxies.has(this.obj)){
                temp = active_proxies.get(this.obj);
            }else{
                temp = new Set();
            }
            temp.add(this.prop);
            active_proxies.set(this.obj, temp);
        }else{
            console.warn(`func_proxy.start cancelled, because ${this.obj}.${this.prop} was already proxied!`);
        }
    }
    unproxy(){
        if(this.proxy_exists()){
            this.obj[this.prop] = this.original;
            active_proxies.get(this.obj).delete(this.prop);
        }
    }
}
 
//1.3 Mouse proxy
let mouse_proxy;
let mouse_handler = {
    apply: function(target, thisArgs, args){
        console.log(`x: ${args[0]} y: ${args[1]}`);
        return Reflect.apply(target, thisArgs, args);
    }
};
 
function wait_for_n(){
    if(!window.n){
        return setTimeout(wait_for_n, 100);
    }else{
        mouse_proxy = new func_proxy(window.n, 'set_mouse_pos', mouse_handler);
        //mouse_proxy.start();
    }
}
wait_for_n();
 
//2. GUI
 
//2.1 script Interface & logic
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
                alert('Patched, I am trying to restore as many as I can now');
            }
        ),
        q_a2: new Module(
            "What happened to Zoom Hack?",
            "button",
            null,
            () => {
                alert("It's gone forever. If you need a working zoom hack, use memory FOV");
            }
        ),
        q_a3: new Module(
            "Why don't you update your script for so long?",
            "button",
            null,
            () => {
                alert("Because I'm a student and I don't have so much time anymore.");
            }
        ),
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
        q_a5: new Module(
            "Can you make me a script?",
            "button",
            null,
            () => {
                alert(
                    "If it's simple - yes. If it's hard to make, then only for a small donation 5-15$. My discord is: h3llside"
                );
            }
        ),
        q_a6: new Module(
            "I'm a coder, can you teach me everything you know so I can help you?",
            "button",
            null,
            () => {
                alert(
                    "Yes of course! But if your script breaks, you will need to fix it yourself."
                );
            }
        ),
    },
    Visual: {
    },
    Functional: {
    },
    Mouse: {
        Anti_aim: new Module("Anti Aim(coming soon...)", "open", {
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
    },
    Addons: {
    },
    /*Old Modules
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
  */
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