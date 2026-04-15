(function(modules){var ranmodules={};function require(e){ranmodules[e]||run(e);return ranmodules[e].exports}function run(e){var r={exports:{}};ranmodules[e]=r,modules[e](require,r);}run(0);})({0:(function(_r,module){_r(1);
const { getShowFns } = _r(2);
_r(3); // 导入执行所有模块
var { waitdotheme }= _r(60);
var { cateWidthShiPei } = _r(29);


if (localStorage.__quik_egg__) {
    // 彩蛋触发 
  delete localStorage.__quik_egg__;
  window.eggnow__ = true;
  clearTimeout(loadingtimeout);
  document.querySelector(".loading-f").style.display = 'block';
} else {
//当页面主题初始化完毕后显示页面，因为考虑到插件初始化要时间
  waitdotheme(() => {
    showmain();
  });
// 500ms超时
  setTimeout(() => {
    showmain();
  }, 500);
}

var isshowmain = false;
function showmain() {
  // 因为存在重复调用，此处控制仅能调用一次 
  if (isshowmain) return;
  clearTimeout(loadingtimeout);
  // 隐藏加载界面，显示主界面
  document.querySelector(".loading-f").classList.add('h');
  document.querySelector(".loading-f").style.display = 'none';
  document.querySelector("main").style.display = 'block';
  document.querySelector("main").style.opacity = '1';
  // onshow事件触发
  getShowFns().forEach(f => f());
  // 适配链接分组宽度，详见link
  cateWidthShiPei();
  isshowmain = true;

  // 动画设置
  setTimeout(() => {
    document.querySelector("main").classList.add('sicon');
  }, 360)
}



var f = `@font-face {
    font-family: 'Material Symbols Outlined';
    font-style: normal;
    font-weight: 100 700;
    src: url($0) format('woff2');
  }`
// requirein内模块util会检测浏览器扩展环境，若有则使用扩展内的资源以提升加载速度
if (window.isExt) {
  util.addStyle(f.replace('$0', 'chrome-extension://' + window.extid + '/assets/google-icon.woff2'))
} else {
  util.addStyle(f.replace('$0', 'https://fonts.gstatic.com/s/materialsymbolsoutlined/v213/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2'))
}
}),1:(function(_r,module){/* qui-core 1.1.0 MIT License author:ehon */

(function (e) {
    if (!window.qui) {
        window.qui = e();
        qui.pushObj(qui, window);
    }
})(function () {

    var sq = {
        about: {
            name: "qui-core",
            version: "1.2.0",
            author: "ehon",
            desc: "web开发辅助工具库"
        },
        initResize: function (fn = function () { }) {
            function resize() {
                var w = window.innerWidth;
                var h = window.innerHeight;
                document.body.css('width', w + "px");
                document.body.css('height', h + "px");
                fn(w, h);
            }

            window.onresize = resize;
            resize();
        },
        js(code, isurl) {
            if (isurl) {
                this.el('script', { src: code }, '', document.body);
            } else {
                this.el('script', {}, code, document.body);
            }
        },
        css(styles, isurl) {
            if (isurl) {
                this.el('link', { rel: "stylesheet", href: styles }, '', document.head);
            } else {
                this.el('style', {}, styles, document.head);
            }
        },
        $: function (selector) {
            return document.querySelector(selector);
        },
        $$: function (selector) {
            return document.querySelectorAll(selector);
        },
        el: function (ctag, attrs, inner, parent) {
            let tag = '', classes = [], id = '', lst = [0, 0];
            for (let i = 0; i < ctag.length; i++) {
                if (ctag[i] == '#' || ctag[i] == '.') {
                    if (tag == '') {
                        tag = ctag.slice(0, i) || "div";
                    }
                    if (lst[0] == 1) {
                        classes.push(ctag.slice(lst[1], i));
                    } else if (lst[0] == 2) {
                        id = ctag.slice(lst[1], i);
                    }
                    lst[1] = i + 1;
                    lst[0] = ctag[i] == '#' ? 2 : 1;
                }
            }
            if (lst[0] == 1) {
                classes.push(ctag.slice(lst[1]));
            } else if (lst[0] == 2) {
                id = ctag.slice(lst[1]);
            }else{
                tag = ctag;
            }
            let be = document.createElement(tag);
            if (classes.length > 0) be.className = classes.join(" ");
            if (id) be.id = id;
            if (attrs) {
                for (let k in attrs) {
                    be.setAttribute(k, attrs[k]);
                }
            }
            if (inner) {
                be.innerHTML = inner;
            }
            if (parent) {
                parent.append(be);
            }
            return be;
        },
        /**
         * 对象合并
         * @param {Object} obj 需要合并的对象
         * @param {Object} target 目标对象
         * @param {Boolean} rewrite 是否覆盖目标对象
         */
        pushObj: function pushObj(obj, target, rewrite = false) {
            if (rewrite) {
                for (var key in obj) {
                    if (target.hasOwnProperty(key)) {
                        delete target[key];
                        target[key] = obj[key];
                    }
                }
            } else {
                for (var key in obj) {
                    if (!target.hasOwnProperty(key)) {
                        target[key] = obj[key];
                    }
                }
            }
        },
        cloneObj: function cloneObj(target) {
            if(typeof target == 'object'&&(target)){
                if(Array.isArray(target)){
                    let r=[];
                    for(var i=0;i<target.length;i++){
                        r.push(cloneObj(target[i]));
                    }
                    return r;
                }
                let r={};
                for(var key in target){
                    r[key] = cloneObj(target[key]);
                }
                return r;
            }
            return target;
           
        },
        /**
         * 将伪数组转换为真数组
         * @param {*} arr 伪数组
         * @returns {Array} 真数组
         */
        ToRealArray: function ToRealArray(arr) {
            return Array.prototype.slice.call(arr);
        },
        /**
         * 请求
         * @param {"GET"|"POST"} method 请求方法
         * @param {String} url 
         * @param {*} data? post数据
         * @param {"json"|"text"|""} type? 返回数据类型，默认json
         * @param {Function} progressListener? 进度监听器，可选
         * @returns {Promise} 返回Promise对象
         */
        ajax: function ajax(method, url, data, type = "json", progressListener) {
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url);
                xhr.onload = function () {
                    if (xhr.status == 200) {
                        if (type == "json") {
                            try {
                                var j = toobj(xhr.responseText);
                            } catch (error) {
                                reject(error);
                                return;
                            }
                            resolve(j);
                        } else {
                            resolve(xhr.responseText);
                        }
                    } else {
                        reject(xhr);
                    }
                }
                xhr.onerror = function () {
                    reject(xhr);
                }
                if (progressListener) {
                    xhr.onprogress = function (ev) {
                        progressListener(ev.loaded / ev.total);
                    }
                }
                xhr.send(data);
            })
        },
        /**
         * get
         * @param {String} url 
         * @param {"json"|"text"|""} type? 返回数据类型，默认json
         * @param {Function} progressListener? 进度监听器，可选
         * @returns {Promise} 返回Promise对象
         */
        get: function get(url, type = "json", progressListener) {
            return ajax("GET", url, void 0, type, progressListener);
        },

        /**
         * post
         * @param {String} url 
         * @param {*} data post数据
         * @param {"json"|"text"|""} type? 返回数据类型，默认json
         * @param {Function} progressListener? 进度监听器，可选
         * @returns {Promise} 返回Promise对象
         */
        post: function post(url, data, type = "json", progressListener) {
            return ajax("POST", url, data, type, progressListener);
        },
        /**
         * 将对象转换为json字符串
         * @param {Object} obj 对象
         * @returns {String} 返回json字符串
         * @throws {Error} 如果对象格式不正确，则抛出错误
         */
        tojson: function tojson(obj) {
            return JSON.stringify(obj);
        },

        /**
         * 将json字符串转换为对象
         * @param {String} json json字符串
         * @returns {Object} 返回对象
         * @throws {Error} 如果json字符串格式不正确，则抛出错误
         */
        toobj: function toobj(json) {
            return JSON.parse(json);
        },

        isUd: function (a) {
            return typeof a == 'undefined';
        },

        isNl: function (a) {
            return (!a) && typeof a == 'object';
        },

        isNum: function (a, unstrict = false) {
            return unstrict ? (!isNaN(a - 0)) : typeof a == 'number';
        },

        getRandomCode() {
            return Date.now().toString(36) + Math.random().toString(36).slice(2);
        }
    }

    // 扩展
    var el_ex = {
        css: function (a, b) {
            if (typeof a === "string") {
                if (b === undefined) {
                    return this.style.getPropertyValue(a)||getComputedStyle(this)[a];
                } else {
                    this.style.setProperty(a, b);
                }
            } else if (typeof a === "object") {
                for (var key in a) {
                    this.style.setProperty(key, a[key]);
                }
            } else {
                this.attr('style', '');
            }
        },
        attr: function (key, value) {
            if (typeof value !== "undefined") {
                this.setAttribute(key, value);
                return this;
            } else {
                return this.getAttribute(key) || null;
            }
        },
        hasClass: function (cls) {
            return this.classList.contains(cls);
        },
        addClass: function (cls) {
            this.classList.add(cls);
            return this;
        },
        removeClass: function (cls) {
            this.classList.remove(cls);
            return this;
        },
        toggleClass: function (cls) {
            this.classList.toggle(cls);
            return this;
        },
        html: function (html) {
            if (!isUd(html)) {
                this.innerHTML = html;
                return this;
            } else {
                return this.innerHTML;
            }
        },
        text: function (text) {
            if (!isUd(text)) {
                this.textContent = text;
                return this;
            } else {
                return this.textContent;
            }
        },
        val: function (value) {
            if (!isUd(value)) {
                this.value = value;
                return this;
            } else {
                return this.value;
            }
        },
        sr: function (src) {
            if (!isUd(src)) {
                this.src = src;
                return this;
            } else {
                return this.src;
            }
        },
        parent: function () {
            return this.parentNode;
        },
        child: function () {
            return this.children;
        },
        next: function () {
            return this.nextElementSibling;
        },
        prev: function () {
            return this.previousElementSibling;
        },
        index: function () {
            var index = 0;
            var El = this;
            while (El.previousElementSibling) {
                El = El.previousElementSibling;
                index++;
            }
            return index;
        },
        show: function (display = "block") {
            this.css("display", display);
            return this;
        },
        fadeIn: function (time = 300, display = "block") {
            this.show(display);
            var _ = this;
            sq.timeDo(function () {
                _.css('opacity', '1');
            }, time)
            return this;
        },
        fadeOut: function (time = 300) {
            this.css('opacity', '0');
            var _ = this;
            sq.timeDo(function () {
                _.css('display', 'none');
            }, time)
            return this;
        },
        hide: function () {
            this.css("display", "none");
            return this;
        },
        prepend: function (el) {
            this.insertBefore(el, this.firstChild);
            return this;
        },
        insertAfter: function (el, node) {
            this.insertBefore(el, node.nextSibling);
            return this;
        },
        getRect: function () {
            return this.getBoundingClientRect();
        },
        appendAfter: function (el) {
            this.parent().insertAfter(el, this);
            return this;
        },
        appendBefore: function (el) {
            this.parent().insertBefore(el, this);
            return this;
        },
        rm: function () {
            this.remove();
        },
        $: function (selector) {
            return this.querySelector(selector);
        },
        $$: function (selector) {
            return this.querySelectorAll(selector);
        },
        bind: function (binder) {
            QE.bind(this, binder);
            return this;
        }
    }

    // 扩展到原型链上
    for (var key in el_ex) {
        HTMLElement.prototype[key] = el_ex[key];
    }

    EventTarget.prototype.on = function (type, listener) {
        this.addEventListener(type, listener);
        return this;
    }

    EventTarget.prototype.off = function (type, listener) {
        this.removeEventListener(type, listener);
        return this;
    }

    EventTarget.prototype.doevent = function (type, argu) {
        if (this._q_evs[type]) {
            for (let i = 0; i < this._q_evs[type].length; i++) {
                this._q_evs[type][i].apply(this, argu);
            }
        }
    }

    // 扩展到原型链上
    let el_keys = Object.keys(el_ex);
    el_keys.push('on', 'off', 'doevent');
    for (var key of el_keys) {
        (function (key) {
            HTMLCollection.prototype[key] = NodeList.prototype[key] = function () {
                var ret = [];
                for (var i = 0; i < this.length; i++) {
                    ret.push(this[i][key].apply(this[i], arguments));
                }
                return ret;
            };
        })(key)
    }

    HTMLCollection.prototype.active = NodeList.prototype.active = function (node, cn) {
        if (node instanceof HTMLElement) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] === node) {
                    this[i].addClass(cn);
                } else {
                    this[i].removeClass(cn);
                }
            }
        } else if (typeof node === "string") {
            for (var i = 0; i < this.length; i++) {
                if (this[i].dataset.name === node) {
                    this[i].addClass(cn);
                } else {
                    this[i].removeClass(cn);
                }
            }
        } else if (typeof node === "number") {
            for (var i = 0; i < this.length; i++) {
                if (i === node) {
                    this[i].addClass(cn);
                } else {
                    this[i].removeClass(cn);
                }
            }
        } else if (!node) {
            for (var i = 0; i < this.length; i++) {
                this[i].removeClass(cn);
            }
        }

    }

    var str_ex = {
        toObj: function () {
            return JSON.parse(this.valueOf());
        }
    }

    // 扩展到String原型链上
    for (var key in str_ex) {
        String.prototype[key] = str_ex[key];
    }

    // QElement
    let QE = {
        qes: {},
        register: function (bindname, details) {
            this.qes[bindname] = details;
            $$('[data-bind="' + bindname + '"]').bind(bindname);
        },
        bind: function (el, binder) {
            this.qes[binder].init(el);
        }
    }

    sq.QE = QE;

    return sq;
});
}),2:(function(_r,module){// 提供重写的showOpenFilePicker方法和Onshow事件

function showOpenFilePicker() {
    return new Promise((resolve, reject) => {
      var inp = el('input');
      inp.type = 'file';
      document.body.append(inp);
      inp.style.display = 'none';
      inp.click();
      inp.onchange = () => {
        resolve(inp.files);
        inp.remove();
      }
    })
}

var onshows_fns = [];
function Onshow(f) {
  onshows_fns.push(f)
}

// 当页面模块加载完成，页面显示时调用，详见index.js
function getShowFns(){
    return onshows_fns;
}

module.exports={
    showOpenFilePicker,
    Onshow,
    getShowFns
}
}),3:(function(_r,module){var getEventHandle = _r(4);
var util = _r(5);
var toast = _r(6);
var iconc = _r(7);
var { storage } = _r(8);
var dialog = _r(10);
let { alert, confirm, prompt } = _r(9);
var menu = _r(12);
var mainmenu = _r(13);
var setting = _r(14);
var Setting = setting.Setting;
var SettingGroup = setting.SettingGroup;
var SettingItem = setting.SettingItem;
var mainSetting = setting.mainSetting;
var tyGroup = setting.tyGroup;
var omnibox = _r(21);
var link = _r(29);
var says = _r(43);
var card = _r(57);
var guidecreator = _r(58);
var fcard = _r(59);
var custom = _r(60);
var background = _r(68);
var searchEditor = _r(83);
var notice = _r(85);
// _r(87); // 禁用通知推送
_r(88);
var addon = _r(45);
var sync = _r(89);
_r(95); 
_r(96);
_r(98);
_r(99);
_r(100);
_r(101);

window.quik = {
  searchEditor,
  guidecreator,
  fcard,
  custom,
  sync,
  addon,
  storage,
  omnibox,
  util,
  link,
  dialog,
  toast,
  says,
  menu,
  iconc,
  background,
  mainmenu,
  Setting,
  SettingGroup,
  SettingItem,
  mainSetting,
  notice,
  tyGroup,
  alert,
  confirm,
  prompt,
  card,
  getEventHandle
}
window.util = util;
}),4:(function(_r,module){// 提供通用事件构建器，调用getEventHandle()即可返回一个独立的事件构建容器
var events = [];
function getEventHandle() {
  var ev_i = events.length;
  events.push({});
  return {
    on(ev, fn) {
      if (!events[ev_i][ev]) events[ev_i][ev] = [];
      events[ev_i][ev].push(fn);
      return true;
    },
    off(ev, fn) {
      if (!events[ev_i][ev]) return false;
      for (var i = 0; i < events[ev_i][ev].length; i++) {
        if (events[ev_i][ev][i] === fn) {
          events[ev_i][ev].splice(i, 1);
          return true;
        }
      }
      return false;
    },
    doevent(ev, args) {
      if (!events[ev_i][ev]) return false;
      if (!Array.isArray(args)) args = [args];
      for (var i = 0; i < events[ev_i][ev].length; i++) {
        events[ev_i][ev][i].apply(null, args);
      }
      return true;
    }
  }
}

module.exports = getEventHandle;
}),5:(function(_r,module){let toast ;
setTimeout(function(){
  toast=_r(6)
})

if (location.hash.indexOf('extdheodqp2eidhjwe') != -1) {
  console.log('插件模式');
  window.isExt = true;
  if (location.hash.indexOf(';') != -1) {
    window.extid = location.hash.substring(location.hash.indexOf(':') + 1, location.hash.indexOf(';'))
  } else {
    window.extid = location.hash.substring(location.hash.indexOf(':') + 1, location.hash.length)
  }
} else {
  console.log('网页模式');
  window.isExt = false;
}

if (window.parent != window) {
  window.isInframe = true;
}
var extRequests = [], idmax = 0;
window.addEventListener('message', function (e) {
  if (e.data.type == 'xhr_cb') {
    var id = e.data.id;
    for (var i = 0; i < extRequests.length; i++) {
      if (extRequests[i].id == id) {
        if (typeof extRequests[i][e.data.fn] == 'function') {
          extRequests[i][e.data.fn](e.data.data);
        }
        if (e.data.finish == true) {
          extRequests.slice(i, 1);
        }
        break;
      }
    }
  }
})
module.exports = {
  // https://blog.csdn.net/qq_25257229/article/details/117969685
  deepClone(target) {
    return cloneObj(target);
  },
  requestByExt(details) {
    idmax++;
    details.id = idmax;
    extRequests.push(details);
    var d = cloneObj(details);
    for (var k in d) {
      if (typeof d[k] == 'function') {
        d[k] = { _t: "fn", _n: k }
      }
    }
    parent.postMessage({
      type: "xhr",
      data: d,
      id: idmax
    }, '*')
  },
  addStyle(css) {
    var style = util.element('style');
    style.innerHTML = css;
    document.head.appendChild(style);
  },
  initSet(sto, key, ob) {
    var o = sto.get(key);
    if (typeof ob == 'object' && ob) {
      if (typeof o == 'object' && o) {
        var a = false;
        for (var k in ob) {
          if (typeof o[k] == 'undefined') {
            a = true;
            o[k] = ob[k];
          }
        }
        if (a) {
          sto.set(key, o);
        }
      } else if (typeof o == 'undefined') {
        sto.set(key, ob);
      }
    } else {
      if (typeof o == 'undefined') {
        sto.set(key, ob);
      }
    }

  },
  joinObj() {
    var obs = arguments;
    var n = obs[0];
    function jt(a, b) {
      for (var k in b) {
        a[k] = b[k];
      }
      return a;
    }
    for (var i = 1; i < obs.length; i++) {
      n = jt(n, obs[i]);
    }
    return n;
  },
  loadimg(url, cb) {
    var img = new Image();
    img.src = url;
    img.onload = function () {
      cb(true);
    }
    img.onerror = function () {
      cb(false);
    }
  },
  element(tagname, options = {}) {
    return el(tagname, options);
  },
  query(element, qstr, isall) {
    return element['querySelector' + (isall ? 'All' : '')](qstr);
  },
  getFavicon(url, cb) {
    try {
      var u = new URL(url);
    } catch (e) {
      cb(false);
      return;
    }
    var _ic = 'https://api.xinac.net/icon/?url=' + u.origin;
    if (u.hostname.indexOf('bing.com') != -1) {
      _ic = 'https://bing.com/favicon.ico';
    } else if (u.hostname.indexOf('www.google.com') != -1 || u.hostname.indexOf('google.com') == 0) {
      _ic = 'https://s2.loli.net/2024/08/10/dVNZ4SzFxTMpj1a.png';
    } else if (u.hostname.indexOf('tfseek.top') != -1) {
      _ic = 'https://tfseek.top/assets/img/216.png';
    }
    this.loadimg(_ic, function (st) {
      if (st) {
        cb(_ic)
      } else {
        util.loadimg(u.protocol + '//' + u.host + '/favicon.ico', function (st2) {
          if (st2) {
            cb(u.protocol + '//' + u.host + '/favicon.ico');
          } else {
            cb(false)
          }
        })
      }
    });


    // 删除多余代码，统一体验
  },
  createIcon(t) {
    var canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = this.getRandomColor();
    ctx.font = 'bold 32px Arial';
    ctx.fillText(t, 20, 40);
    return canvas.toDataURL();
  },
  getRandomColor() {
    return '#' + Math.random().toString(16).substring(2, 8).toUpperCase();
  },
  fangdou(fn, time) {
    var timer = null;
    return function () {
      if (timer) clearTimeout(timer);
      var _this = this;
      timer = setTimeout(() => {
        fn.apply(_this, arguments);
      }, time);
    }
  },
  jsonp(url, cb, cbkey) {
    function getRandom() {
      return 'a' + Math.random().toString(36).slice(2);
    }
    var a = getRandom();
    var script = this.element('script', {
      src: addSearchParam(url, cbkey || 'callback', a),
    });

    function addSearchParam(url, key, value) {
      var a = new URL(url);
      a.searchParams.set(key, value);
      return a.href;
    }
    document.body.appendChild(script);
    script.onerror = function () {
      cb(false);
      document.body.removeChild(script);
    }
    window[a] = function (data) {
      cb(data);
      try {
        document.body.removeChild(script);

      } catch (error) {

      }
      delete window[a];
    }
    return {
      abort() {
        try {
          script.remove();
        } catch (error) {

        }
      }
    }
  },
  xhr(url, cb, err) {
    get(url,"text").then(cb).catch((e)=>{
        err&err(e);
    })
    return {
      abort() {cb=()=>{}/* todo */}
    }
  },
  checkSession(session) {
    return session.isSession && session.session_token === "Hvm_session_token_eoi1j2j";
  },
  getRandomHashCache() {
    return getRandomCode();
  },
  copyText(value) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(value);
    } else {
        const input = el('input');
        input.value = value;
        input.hide();
        // 将input元素添加到文档中
        document.body.appendChild(input);
        // 模拟键盘事件以触发复制操作
        input.select();
        document.execCommand('copy');
        // 从文档中移除input元素
        document.body.removeChild(input);
    }
    if (window.isExt) {
      parent.postMessage({
        type: "copy",
        text: value
      }, '*');
    } 
    toast.show('复制成功');
  },
  getGoogleIcon(unicode, d) {
    return '<span class="material-symbols-outlined' + (d && d.type ? ' ' + d.type : '') + '">&#x' + unicode + ';</span>'
  },
  getGoogleIconByString(string, d) {
    return '<span class="material-symbols-outlined' + (d && d.type ? ' ' + d.type : '') + '">' + string + '</span>'
  },
  /**
   * 检查details中是否含有必选项
   * @param {Object} details 
   * @param {String[]} requires 
   */
  checkDetailsCorrect(details, requires) {
    for (var i = 0; i < requires.length; i++) {
      if (details.hasOwnProperty(requires[i]) == false) {
        return false;
      }
    }
    return true;
  },
  checkUrl(text) {
    return /^(https?:\/\/)?([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&%\$\-]+)*@)?((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.[a-zA-Z]{2,4})(\:[0-9]+)?(\/[^\/][a-zA-Z0-9\.\,\?\'\\\/\+&%\$#\=~_\-@]*)*(\/)?$/.test(text);
  },
  b0(a) {
    return a < 10 ? '0' + a : a;
  }
}

}),6:(function(_r,module){var to = el(".toast");

var g = null, g2 = null;
document.body.append(to);
module.exports= {
  show(value, time) {
    to.html(value);
    to.addClass('show');
    to.css("animation", "toastin .3s");
    clearTimeout(g);
    clearTimeout(g2);
    g = setTimeout(() => {
      to.css("animation", "toastout .3s");
      g2 = setTimeout(() => {
        to.removeClass('show');
      }, 298);
    }, time ? time : 2000);
  }
}
}),7:(function(_r,module){var icners = {
  tl: $('.topper .left'),
  tr: $('.topper .right'),
  bl: $('.bottomer .left'),
  br: $('.bottomer .right'),
}

/**
 * @class icon
 * @param {Object} options 
 * @param {String} options.content
 * @param {Boolean} options.important?
 * @param {String} options.class?
 * @param {Number} options.width?
 * @param {'tl'|'tr'|'bl'|'br'} options.offset
 */
var icon = function (options) {
  this.content = options.content;
  this.width = options.width;
  var ic = el('div', {
    class: "item" + (options.class ? (' ' + options.class) : '') + (options.important ? ' important' : ''),
  });
  icners[options.offset].append(ic);
  ic.html(this.content);
  this.element = ic;
  if (this.width) {
    ic.css("width" ,this.width + 'px');
  }
}
icon.prototype = {
  getIcon() {
    return this.element;
  },
  setIcon(content) {
    this.content = content;
    this.element.html(this.content);
  },
  setWidth(w) {
    this.width = w;
    if (this.width) {
      ic.css("width", this.width + 'px');
    }
  },
  getWidth() {
    return this.width;
  },
  show() {
    this.element.removeClass('hide');
    this.element.addClass('show');
  },
  hide() {
    this.element.addClass('hide');
    this.element.removeClass('show');
  }
}
module.exports.icon = icon;
}),8:(function(_r,module){const { alert } = _r(9);
const getEventHandle = _r(4);
const reactive = _r(11);
const util = _r(5);

if (!localStorage.ehon) {
  localStorage.ehon = '{}';
}


// 双向队列
function Queue() {
  this.items = {};
  this.count = 0;
  this.head = 0;
  this.tail = 0;
}
Queue.prototype.enqueue = function (item) {
  this.items[this.tail] = item;
  this.tail = this.tail + 1;
  this.count = this.tail - this.head;
}
Queue.prototype.dequeue = function () {
  if (this.count == 0) {
    return null;
  }
  var item = this.items[this.head];
  delete this.items[this.head];
  this.head = this.head + 1;
  this.count--;
  return item;
}
Queue.prototype.isEmpty = function () {
  return this.count == 0;
}
Queue.prototype.size = function () {
  return this.count;
}



var evn = getEventHandle();

var idbsupport = localforage._getSupportedDrivers([localforage.INDEXEDDB])[0] == localforage.INDEXEDDB;
// var idbsupport=false;
if (!idbsupport && !localStorage.notdb) {
  localStorage.notdb = '1';
  setTimeout(() => {
    alert('浏览器版本过低，不支持indexedDB，一些功能的使用将受限！');
  })
}

var setqueue = new Queue();

var filerecv2 = {
  get(hash, cb) {
    localforage.getItem(hash).then(cb);
  },
  set(file, hash, cb) {
    hash = hash || ('^' + util.getRandomHashCache());
    localforage.setItem(hash, file).then(() => {
      cb(hash);
    });
  },
  delete(hash, cb) {
    localforage.removeItem(hash).then(cb);
  }
}
var filerecv = {
  get(hash, cb) {
    setqueue.enqueue(['get', [hash], cb]);
    doqueue();
  },
  set(file, hash, cb) {
    setqueue.enqueue(['set', [file, hash], cb]);
    doqueue();
  },
  delete(hash, cb) {
    setqueue.enqueue(['delete', [hash], cb]);
    doqueue();
  }
}

function doqueue() {
  if (setqueue.isEmpty()) {
    return;
  }
  var dd = setqueue.dequeue();
  var mm = dd[1];
  mm.push(function () {
    doqueue();
    dd[2].apply(null, arguments);
  })
  filerecv2[dd[0]].apply(null, mm);
}
var jl = {};

// Use Proxy to rebuild
const sto=JSON.parse(localStorage.ehon);

const resto=reactive(sto,util.fangdou(function(){
    evn.doevent("storage",[]);
    localStorage.ehon=JSON.stringify(sto);
},50));

var f = function (ck, details) {
  if (typeof ck === 'string') {
    if (!resto[ck]) resto[ck] = {};
    jl[ck] = details;
    function get(k, useidb, callback) {
      if (!useidb) {
        return cloneObj(resto[ck][k]);
      } else {
        if (!idbsupport) {
          throw new Error('indexedDB is not support in this browser');
        }
        filerecv.get(resto[ck][k], file => {
            callback&&callback(file);
        });
      }
    }
    function set(k, v, useidb, callback) {
      if (!useidb) {
        resto[ck][k] = v;
      } else {
        if (!idbsupport) {
          throw new Error('indexedDB is not support in this browser');
        }
        filerecv.set(v, get(k), hash => {
          resto[ck][k] = hash;
          callback&&callback(hash);
        })
      }
    }
    function remove(k, useidb, callback) {
      if (!useidb) {
        delete resto[ck][k];
      } else {
        if (!idbsupport) {
          throw new Error('indexedDB is not support in this browser');
        }
        filerecv.delete(resto[ck][k], () => {
          delete resto[ck][k];
          callback&&callback();
        });
      }
    }
    // function getAll() {
    //   return JSON.parse(localStorage.getItem("ehon"));
    // }
    // function setAll(ob) {
    //   var a = getAll();
    //   a[ck] = ob;
    //   localStorage.setItem("ehon", JSON.stringify(a));
    //   evn.doevent('storage', [{
    //     key: ck,
    //     value: ob
    //   }])
    //   if (details && (!details.websync) && details.sync) {
    //     evn.doevent('websync', [{
    //       key: ck,
    //       value: ob
    //     }])
    //   }
    // }
    function list() {
      return Object.keys(sto[ck]);
    }
    function websync(option) {
      evn.doevent('websync', [{
        key: ck,
        value: option,
        sp: true
      }])
    }
    return {
      get: get,
      websync,
      set: set,
      remove: remove,
      list: list,
      getAll() {
        return sto[ck];
      },
      clear() {
        let a=resto[ck];
        for (var k in a) {
          var b = a[k];
          if (typeof b == 'string' && b.startsWith('^')) {
            filerecv.delete(b);
          }
        }
        resto[ck]={};
      }
    }
  } else {
    throw new Error('ck is not a string');
  }
}

/**
 * 检查浏览器是否支持indexedDB
 * @returns {Boolean} indexedDB support
 */
f.checkIDB = () => {
  return idbsupport;
}
f.on = evn.on;
f.off = evn.off;
module.exports = {
  storage: f,
  getStorageList() {
    return jl;
  },
  getAllStorage() {
    return cloneObj(sto);
  },
  gS:(ck)=>{
    if(ck){
        if(!resto[ck])resto[ck]={};

        return resto[ck];
    }else{
        return resto;
    }
    
  },
  dbTool: filerecv
};
}),9:(function(_r,module){const dialog = _r(10);
const util = _r(5);

var base = `<div class="def_dialog"><h1>提示</h1><div class="content">$0</div><div class="footer">$1<button class="ok btn">确定</button></div></div>`
var emptyFn = () => { };
function alert(text, cb) {
  if (!cb) cb = emptyFn;
  var d = new dialog({
    content: base.replace('$0', '').replace('$1', ''),
    clickOtherToClose: false
  });
  setTimeout(() => { d.open() }, 10)
  var dd = d.getDialogDom();
  util.query(dd, '.content').innerText = text;
  util.query(dd, '.ok').onclick = () => {
    cb();
    d.close();
    setTimeout(() => { d.destroy() }, 299);
  }
}
function confirm(text, cb) {
  if (!cb) cb = emptyFn;
  var d = new dialog({
    content: base.replace('$0', '').replace('$1', '<button class="cancel btn">取消</button>'),
    clickOtherToClose: false
  });
  setTimeout(() => { d.open() }, 10)
  var dd = d.getDialogDom();
  util.query(dd, '.content').innerText = text;
  util.query(dd, '.ok').onclick = () => {
    cb(true);
    d.close();
    setTimeout(() => { d.destroy() }, 299);
  }
  util.query(dd, '.cancel').onclick = () => {
    cb(false);
    d.close();
    setTimeout(() => { d.destroy() }, 299);
  }
}
function prompt(text, cb) {
  if (!cb) cb = emptyFn;
  var d = new dialog({
    content: base.replace('$0', '<p class="c"></p><p><input type="text"/></p>').replace('$1', '<button class="cancel btn">取消</button>'),
    clickOtherToClose: false
  });
  setTimeout(() => { d.open() }, 10)
  var dd = d.getDialogDom();
  util.query(dd, '.content .c').innerText = text;
  util.query(dd, '.ok').onclick = () => {
    cb(util.query(dd, '.content input').value);
    d.close();
    setTimeout(() => { d.destroy() }, 299);
  }
  util.query(dd, '.cancel').onclick = () => {
    cb('');
    d.close();
    setTimeout(() => { d.destroy() }, 299);
  }
  util.query(dd, '.content input').focus();
  util.query(dd, '.content input').addEventListener('keydown', function (e) {
    if (e.key == 'Enter') {
      cb(this.value);
      d.close();
      setTimeout(() => { d.destroy() }, 299);
    }
  })
}

module.exports = {
  alert,
  confirm,
  prompt
}
}),10:(function(_r,module){var allDialog = [], d_index = 1, idmax = 0;

/**
 * @class dialog
 * @param {Object} options 
 * @param {String} options.content
 * @param {String} options.clickOtherToClose
 * @param {Number} options.mobileShowtype?
 * @param {String} options.class?
 */
var dialog = function (options) {
  this.options = options;
  var dialogF = el('.dialog');
  dialogF.html(`<div class="d-b"></div><div class="d-c">${options.content}</div>`);
  $('.dialogs').append(dialogF);
  var dialogC = dialogF.$('.d-c');
  if (options.class) {
    dialogC.className += ' ' + options.class;
  }
  if (options.mobileShowtype == 1) {
    dialogF.addClass('mobile-show-full');
  }
  this.element = dialogF;
  this.id = idmax;
  idmax++;
  dialogF.attr('data-id', this.id);
  if (typeof options.clickOtherToClose == 'undefined') {
    this.clickOtherToClose = true;
  } else {
    this.clickOtherToClose = options.clickOtherToClose;
  }
  if (this.clickOtherToClose) {
    dialogF.$('.d-b').on('click', function () {
      getDialogById(this.parent().attr('data-id')).close();
    })
  }

  allDialog.push(this);
}

function getDialogById(id) {
  var d = null;
  allDialog.forEach((dd) => {
    if (dd.id == id) {
      d = dd;
    }
  })
  return d;
}

dialog.SHOW_TYPE_FULLSCREEN = 1;
dialog.SHOW_TYPE_DIALOG = 2;

dialog.iframeDialogBuilder = function (url, mobileShowtype = 1) {
  var d = new dialog({
    content: `<div class="material-symbols-outlined closebtn">&#xE5CD;</div><iframe src="${url}" class="dialog-iframe"></iframe>`,
    class: "iframe-dialog",
    mobileShowtype: mobileShowtype
  });
  var q = d.getDialogDom();
  q.$('.closebtn').onclick = () => {
    d.close();
  }
  this.closed = true;
  return d;
}
dialog.getDialogById = getDialogById;

dialog.prototype = {
  open() {
    this.element.addClass('show');
    this.element.css("z-index",d_index);
    d_index++;
    this.closed = false;
    if (this.onopen) {
      this.onopen();
    }
    this.element.$$('img[data-src]').forEach(function (lazyimg) {
      lazyimg.src = lazyimg.attr('data-src');
      lazyimg.removeAttribute('data-src');
    })
  },
  close() {
    this.element.removeClass('show');
    this.closed = true;
    if (this.onclose) {
      this.onopen();
    }
  },
  destroy() {
    this.element.remove();
    allDialog.splice(allDialog.indexOf(this), 1);
  },
  getDialogDom() {
    return this.element.$('.d-c');
  }
}
module.exports= dialog;
}),11:(function(_r,module){function reactive(obj,onchange=()=>1){
    return new Proxy(obj,{
        get(target,key){
            if(typeof target[key]=="object"&&target[key]!=null){
                // if(Array.isArray(target[key])){
                //     return target[key];
                // }
                return reactive(target[key],onchange);
            }else{
                return target[key];
            }
        },
        set(target,key,value){
            target[key]=value;
            onchange();
            return true;
        },
        deleteProperty(target,key){
            delete target[key];
            onchange();
            return true;
        }
    })
}

module.exports = reactive;
}),12:(function(_r,module){/**
 * @class contextMenu
 * @param {Object} options 
 * @param {{icon:String,title:String,click}[]} options.list
 * @param {{top?:Number,left?:Number,bottom?:Number,right?:Number}} options.offset 位置
 */
var contextMenu = function (options) {
  this.options = options;
  var El = el(".contextMenu");
  if (options.offset) {
    for(let k in options.offset){
        El.css(k,options.offset[k]+"px");
    }
  }
  drawList(options.list, El);
  document.body.appendChild(El);
  this.element = El;
}

function drawList(list, El) {
  list.forEach(function (itemr) {
    if (itemr.type == 'hr') {
      var item = el(".hr");
      El.appendChild(item);
    } else {
      var item = el(".item")
      item.html(`<div class="icon">${itemr.icon}</div><div class="title">${itemr.title}</div>`);
      item.onclick = function () {
        itemr.click();
      }
      El.appendChild(item);
    }

  })
}

contextMenu.prototype = {
  show() {
    let te=this.element;
    resetmenu(te);
    te.addClass('show');
    te.style.height = 'auto';
    var h = te.getRect().height;
    te.style.height = '0px';
    te.style.transition = 'height .2s';
    setTimeout(() => {
      te.style.height = h + 'px';
    })
  },
  hide() {
    let te=this.element;
    te.style.height = '0px';
    setTimeout(() => {
      te.style.transition = 'none';
      te.classList.remove('show');
    }, 200)
  },
  isShow() {
    return this.element.hasClass('show');
  },
  destroy() {
    this.element.remove();
  },
  setOffset(offset) {
    this.options.offset = offset;
    var options = this.options, el = this.element;
    el.css({
        top:"",
        left:"",
        bottom:"",
        right:""
    })
    if (options.offset) {
      for(let k in options.offset){
          el.css(k,options.offset[k]+"px");
      }
    }
  },
  setList(list) {
    this.options.list = list;
    var el = this.element;
    el.html('');
    drawList(list, el);
  }
};

document.on('click', () => {
  resetmenu();
});
document.on('contextmenu', () => {
  resetmenu();
});
function resetmenu(el) {
  $$(".contextMenu").forEach(e => {
    if (el && e.isSameNode(el)) return;
    e.style.height = '0px';
    setTimeout(() => {
      e.style.transition = 'none';
      e.removeClass('show');
    }, 200)
  })
}

module.exports = contextMenu;
}),13:(function(_r,module){const menu = _r(12);
const { icon } = _r(7);
const util = _r(5);

var mainmenu_icon = new icon({
  class: "main_menu",
  content: util.getGoogleIcon('e5d2'),
  offset: "tr"
});

var mainmenulist_top = [];
var mainmenulist_bottom = [];

var main_menu = new menu({
  list: [],
  offset: {
    top: 40,
    right: 15
  }
});

function glist() {
  main_menu.setList(mainmenulist_top.concat([{ type: "hr" }], mainmenulist_bottom));
}

mainmenu_icon.getIcon().onclick = e => {
  e.stopPropagation();
  main_menu.show();
}
var MAIN_MENU_TOP = 0;
var MAIN_MENU_BOTTOM = 1;

function pushMenu(a, b) {
  if (b == MAIN_MENU_BOTTOM) {
    mainmenulist_bottom.push(a);
  } else {
    mainmenulist_top.push(a);
  }
  glist();
}


module.exports = {
  pushMenu,
  MAIN_MENU_BOTTOM,
  MAIN_MENU_TOP
}
}),14:(function(_r,module){const {initsto,stp} = _r(15);

var Setting = _r(16);
var SettingGroup = _r(17);
var SettingItem = _r(18);
var mainSetting = _r(19);
_r(20);
// @note 添加通用SettingGroup，方便添加设置
// @edit at 2024/1/31 10:22
var tyGroup = new SettingGroup({
  title: "通用",
  index: 0
});
mainSetting.addNewGroup(tyGroup);

module.exports= {
  Setting,
  SettingGroup,
  SettingItem,
  mainSetting,
  tyGroup,
  settingSto: initsto,
  settingStp: stp
}
}),15:(function(_r,module){const {storage,gS} = _r(8);

var initsto=storage('setting',{
    title:"设置",
    desc:"Ehon起始页的各项设置",
    sync:true
  })

let stp=gS().setting;

module.exports={
    initsto,
    stp
};
}),16:(function(_r,module){const dialog = _r(10);

function Setting(details) {
  this.title = details.title;
  this.ifo = false;
  this.groups = [];
  this._events = {
    change: []
  }
}

Setting.prototype = {
  drawAll() {
    if (this.ifo) return;
    this.ifo = true;
    this.dialog = new dialog({
      content: `<div class="actionbar"><h1>设置</h1><div class="closeBtn">${util.getGoogleIcon('e5cd')}</div></div><ul class="setting-root"></ul>`,
      class: "setting_dia auto-size",
      mobileShowtype: dialog.SHOW_TYPE_FULLSCREEN
    });
    this.dialogDom = this.dialog.getDialogDom();
    util.query(this.dialogDom, '.closeBtn').addEventListener('click', () => {
      this.dialog.close();
    });
    util.query(this.dialogDom, '.actionbar h1').innerText = this.title;
    var _ = this;
    this.groups.forEach(group => {
      _._drawGroup(group);
    })
  },
  addNewGroup(group) {
    this.groups.push(group);
    var _ = this;
    group.on('change', (dt, _this) => {
      _._dochange({
        type: dt.type,
        details: dt.details,
        id: dt.id
      })
      if (dt.type == 'it') {
        _._dochangeGroup(_this, dt.details);
      } else if (dt.type == 'add') {
        _._drawItem(_this, _this.items[_this.items.length - 1])
      } else if (dt.type == 'change') {
        if (dt.details.attr == 'reinit') {
          _._reinitItem(_this, _this.items.find(item => item.id == dt.id), dt.details);
        } else if (dt.details.attr == 'reget') {
          _._regetItem(_this.items.find(item => item.id == dt.id), dt.details);
        } else {
          _._dochangeItem(_this, _this.items.find(item => item.id == dt.id), dt.details);
        }
      }
    })
    _._dochange({
      type: "addgroup",
    })
    _._drawGroup(group);
  },
  setTitle(title) {
    this.title = title;
    if (this.ifo) {
      util.query(this.dialogDom, '.actionbar h1').innerText = title;
    }
    _._dochange({
      type: "changetitle",
      title: title
    })
  },
  open() {
    var _ = this;
    if (!_.ifo) {
      _.drawAll();
      setTimeout(() => {
        _.dialog.open();
      }, 10);
    } else {
      _.dialog.open();
    }
  },
  close() {
    this.dialog.close();
  },
  on(event, callback) {
    if (this._events[event]) {
      this._events[event].push(callback);
    }
  },
  _dochange(dt) {
    var _ = this;
    this._events.change.forEach((callback) => {
      callback(dt, _);
    });
  },
  _drawGroup(group) {
    if (!this.ifo) return;
    var _ = this;
    var groupEle = util.element('li', {
      class: 'setting-group',
      'data-index': group.index,
      'data-id': group.id
    });
    groupEle.innerHTML = `<div class="setting-group-title"></div><ul class="setting-tree"></ul>`;
    var sr = util.query(this.dialogDom, '.setting-root');
    var srls = sr.children;
    var q = true;
    for (var i = 0; i < srls.length; i++) {
      if (parseInt(srls[i].getAttribute('data-index')) > group.index) {
        sr.insertBefore(groupEle, srls[i]);
        q = false;
        break;
      }
    }
    if (q) sr.appendChild(groupEle);
    util.query(groupEle, '.setting-group-title').innerText = group.title;
    group.items.forEach((item) => {
      _._drawItem(group, item);
    })
  },
  _drawItem(group, item) {
    if (!this.ifo) return;
    var itemEle = util.element('li', {
      class: 'setting-item',
      'data-index': item.index,
      'data-id': item.id
    });
    if (!item._show) {
      itemEle.style.display = 'none';
    }
    itemEle.innerHTML = `<div class="setting-item-left"><div class="setting-item-title"></div><div class="setting-item-message"></div></div><div class="setting-item-right"></div>`;
    var sr = util.query(this.dialogDom, '.setting-group[data-id=' + group.id + '] .setting-tree');
    var srls = sr.children;
    var q = true;
    for (var i = 0; i < srls.length; i++) {
      if (parseInt(srls[i].getAttribute('data-index')) > item.index) {
        sr.insertBefore(itemEle, srls[i]);
        q = false;
        break;
      }
    }
    if (q) sr.appendChild(itemEle);
    util.query(itemEle, '.setting-item-title').innerText = item.title;
    if (item.message) {
      util.query(itemEle, '.setting-item-message').innerText = item.message;
    } else {
      itemEle.classList.add('no-message');
    }
    var elr = util.query(itemEle, '.setting-item-right');
    var cb = () => { };
    var types = {
      string() {
        elr.innerHTML = `<input type="text" class="setting-item-input">`;
        cb = (v) => {
          util.query(elr, '.setting-item-input').value = v;
        }
      },
      number() {
        elr.innerHTML = `<input type="number" class="setting-item-input">`;
        cb = (v) => {
          util.query(elr, '.setting-item-input').value = v;
        }
      },
      boolean() {
        elr.innerHTML = `<div class="check-box"><div class="check-box-inner"></div></div><input type="checkbox" class="setting-item-input">`;
        cb = (v) => {
          util.query(elr, '.setting-item-input').checked = v;
          if (v) {
            util.query(elr, '.check-box').classList.add('checked');
          } else {
            util.query(elr, '.check-box').classList.remove('checked');
          }
        }
        util.query(elr, '.check-box').addEventListener('click', function () {
          util.query(elr, '.setting-item-input').click();
          if (util.query(elr, '.setting-item-input').checked) {
            this.classList.add('checked');
          } else {
            this.classList.remove('checked');
          }
        })
      },
      range() {
        elr.innerHTML = `<input type="range" class="setting-item-input">`;
        cb = (v) => {
          util.query(elr, '.setting-item-input').value = v;
        }
        var l = item.init()
        if (l instanceof Promise) {
          l.then(_init)
        } else {
          _init(l);
        }
        function _init(inited) {
          util.query(elr, '.setting-item-input').max = inited[1];
          util.query(elr, '.setting-item-input').min = inited[0];
        }
      },
      select() {
        elr.innerHTML = `<input class="setting-item-input" type="text" style="display:none"></input><div class="qui-select"></div><div class="qui-options"></div>`;
        util.query(elr, '.qui-select').onclick = function (e) {
          e.stopPropagation();
          var acted = util.query(document, '.qui-options.active');
          if (acted) {
            acted.classList.remove('active');
          }
          util.query(elr, '.qui-options').classList.add('active');
        }
        var guaqi;
        cb = (v) => {
          guaqi = v;
        }
        var l = item.init()
        if (l instanceof Promise) {
          l.then(_init)
        } else {
          _init(l);
        }
        function _init(inited) {
          initSelect(elr, inited, item);
          cb = (v) => {
            util.query(elr, '.setting-item-input').value = v;
            util.query(elr, '.qui-select').innerText = inited[v];
            var acted = util.query(elr, '.qui-options .qui-option.selected');
            if (acted) {
              acted.classList.remove('selected');
            }
            try {
              util.query(elr, '.qui-options .qui-option[data-value="' + v + '"]').classList.add('selected');
            } catch (error) {
              util.query(elr, '.qui-select').innerText = '';
            }
          }
          if (guaqi) cb(guaqi);
        }
      },
      'null'() {
        elr.innerHTML = `<div class="setting-item-input null-click">${util.getGoogleIcon('e5e1')}</div>`;
        itemEle.classList.add('just-callback-item');
        itemEle.onclick = () => {
          item.callback();
        }
      }
    }
    types[item.type]();
    function getacb() {
      if (item.type == 'null') return;
      var l = item.get();
      if (l instanceof Promise) {
        l.then(cb);
      } else {
        cb(l);
      }
    }
    getacb();
    item.getacb = getacb;
    util.query(elr, '.setting-item-input').addEventListener((() => {
      if (item.type == 'range') {
        return 'input'
      } else if (item.type == 'null') {
        return 'click'
      } else {
        return 'change'
      }
    })(), function () {
      doCallback.call(this, item);
    });
  },
  _dochangeGroup(group, dt) {
    if (!this.ifo) return;
    var g = util.query(this.dialogDom, '.setting-group[data-id=' + group.id + ']');
    if (dt.attr == 'title') {
      util.query(g, '.setting-group-title').innerText = dt.content;
    } else if (dt.attr == 'index') {
      g.setAttribute('data-index', dt.content);
      var sr = util.query(this.dialogDom, '.setting-root');
      var srls = sr.children;
      var q = true;
      for (var i = 0; i < srls.length; i++) {
        if (srls[i].isSameNode(g)) continue;
        if (parseInt(srls[i].getAttribute('data-index')) > dt.content) {
          sr.insertBefore(g, srls[i]);
          q = false
          break;
        }
      }
      if (q) sr.appendChild(g);
    } else if (dt.attr == 'show') {
      g.style.display = dt.content ? 'block' : 'none';
    }
  },
  _dochangeItem(group, item, dt) {
    if (!this.ifo) return;
    var g = util.query(this.dialogDom, '.setting-group[data-id=' + group.id + '] .setting-item[data-id=' + item.id + ']');
    if (dt.attr == 'title') {
      util.query(g, '.setting-group-title').innerText = dt.content;
    } else if (dt.attr == 'message') {
      if (dt.content) {
        util.query(g, '.setting-item-message').innerText = dt.content;
        g.classList.remove('no-message');
      } else {
        g.classList.add('no-message');
      }
    } else if (dt.attr == 'index') {
      g.setAttribute('data-index', dt.content);
      var sr = util.query(this.dialogDom, '.setting-group[data-id=' + group.id + '] .setting-tree');
      var srls = sr.children;
      var q = true;
      for (var i = 0; i < srls.length; i++) {
        if (srls[i].isSameNode(g)) continue;
        if (parseInt(srls[i].getAttribute('data-index')) > dt.content) {
          sr.insertBefore(g, srls[i]);
          q = false
          break;
        }
      }
      if (q) sr.appendChild(g);
    } else if (dt.attr == 'show') {
      g.style.display = dt.content ? 'block' : 'none';
    }
  },
  _reinitItem(group, item) {
    if (!this.ifo) return;
    var _init;
    var itemEle = util.query(this.dialogDom, '.setting-group[data-id=' + group.id + '] .setting-item[data-id=' + item.id + ']');
    var elr = util.query(itemEle, '.setting-item-right')
    if (item.type == 'range') {
      _init = (inited) => {
        util.query(elr, '.setting-item-input').max = inited[1];
        util.query(elr, '.setting-item-input').min = inited[0];
      }
    } else if (item.type == 'select') {
      _init = (inited) => {
        initSelect(elr, inited, item);
        cb = (v) => {
          util.query(elr, '.setting-item-input').value = v;
          util.query(elr, '.qui-select').innerText = inited[v];
          var acted = util.query(elr, '.qui-options .qui-option.selected');
          if (acted) {
            acted.classList.remove('selected');
          }
          try {
            util.query(elr, '.qui-options .qui-option[data-value="' + v + '"]').classList.add('selected');
          } catch (error) {

          }
        }
        var l = item.get();
        if (l instanceof Promise) {
          l.then(cb);
        } else {
          cb(l);
        }
      }
    } else {
      return;
    }
    var l = item.init()
    if (l instanceof Promise) {
      l.then(_init)
    } else {
      _init(l);
    }
  },
  _regetItem(item) {
    if (!this.ifo) return;
    item.getacb();
  }
}

document.addEventListener('click', () => {
  var acted = util.query(document, '.qui-options.active');
  if (acted) {
    acted.classList.remove('active');
  }
})


function initSelect(elr, inited, item) {
  util.query(elr, '.qui-options').innerHTML = (() => {
    var html = '';
    for (var k in inited) {
      html += `<div class="qui-option" data-value="${k}">${inited[k]}</div>`;
    }
    return html;
  })();
  util.query(elr, '.qui-options .qui-option', true).forEach((op) => {
    op.onclick = () => {
      var v = op.getAttribute('data-value');
      util.query(elr, '.setting-item-input').value = v;
      util.query(elr, '.qui-select').innerText = inited[v];
      var acted = util.query(elr, '.qui-options .qui-option.selected');
      if (acted) {
        acted.classList.remove('selected');
      }
      op.classList.add('selected');
      doCallback.call(util.query(elr, '.setting-item-input'), item);
    }

  })
}

function doCallback(item) {
  if (this.classList.contains('null-click')) return;
  var v;
  if (this.type == 'checkbox') {
    v = this.checked;
  } else {
    v = this.value;
  }
  //@note 判断check方法是否存在，check是可选参数
  //@edit at 2023/1/30 15:12
  if (typeof item.check == 'function') {
    if (item.check(v)) {
      item.callback(v)
    } else {
      item.getacb();
    }
  } else {
    item.callback(v);
  }

}
module.exports = Setting;
}),17:(function(_r,module){
var idmax = 0;
function SettingGroup(details) {
  this.title = details.title;
  this.index = details.index;
  if (this.index < 0) this.index = 0
  this.items = [];
  this.id = 'seg_' + idmax;
  idmax++;
  this._events = {
    change: []
  }
}

SettingGroup.prototype = {
  addNewItem(item) {
    this.items.push(item);
    var _ = this;
    item.on('change', (dt, _this) => {
      _._dochange({
        type: "change",
        details: dt,
        id: _this.id
      })
    });
    _._dochange({
      type: "add"
    })
  },
  setTitle(title) {
    this.title = title;
    this._dochange({
      type: "it",
      details: {
        attr: "title",
        content: title
      }
    })
  },
  setIndex(index) {
    this.index = index;
    this._dochange({
      type: "it",
      details: {
        attr: "index",
        content: index
      }
    })
  },
  on(event, callback) {
    if (this._events[event]) {
      this._events[event].push(callback);
    }
  },
  show() {
    this.show = true;
    this._dochange({
      type: "it",
      details: {
        attr: "show",
        content: true
      }
    })
  },
  hide() {
    this.show = false;
    this._dochange({
      type: "it",
      details: {
        attr: "show",
        content: false
      }
    })
  },
  _dochange(dt) {
    var _ = this;
    this._events.change.forEach((callback) => {
      callback(dt, _);
    });
  }
}
module.exports = SettingGroup;
}),18:(function(_r,module){
var idmax = 0;
function SettingItem(details) {
  this.title = details.title;
  this.index = details.index;
  this.type = details.type;
  this.init = details.init;
  this.check = details.check;
  this.callback = details.callback;
  this.message = details.message;
  this.get = details.get;
  this._show = true;
  this.id = 'sei_' + idmax;
  idmax++;
  this._events = {
    change: []
  }
}

SettingItem.prototype = {
  reInit() {
    this._dochange({
      attr: "reinit"
    })
  },
  reGet() {
    this._dochange({
      attr: "reget"
    })
  },
  setTitle(title) {
    this.title = title;
    this._dochange({
      attr: "title",
      content: title
    })
  },
  setIndex(index) {
    this.index = index;
    this._dochange({
      attr: "index",
      content: index
    })
  },
  setMessage(message) {
    this.message = message;
    this._dochange({
      attr: "message",
      content: message
    })
  },
  show() {
    this._show = true;
    this._dochange({
      attr: "show",
      content: true
    })
  },
  hide() {
    this._show = false;
    this._dochange({
      attr: "show",
      content: false
    })
  },
  on(event, callback) {
    if (this._events[event]) {
      this._events[event].push(callback);
    }
  },
  _dochange(dt) {
    var _ = this;
    this._events.change.forEach(function (callback) {
      callback(dt, _);
    });
  }
}
module.exports = SettingItem;
}),19:(function(_r,module){const mainmenu= _r(13);
const util = _r(5);
const Setting = _r(16);

var mainSetting = new Setting({
  title: "设置"
});
mainmenu.pushMenu({
  icon: util.getGoogleIcon('e8b8', { type: "fill" }),
  title: '主设置',
  click() {
    mainSetting.open();
  }
}, mainmenu.MAIN_MENU_TOP)
module.exports = mainSetting;
}),20:(function(_r,module){const { icon } = _r(7);
const util = _r(5);
const mainSetting = _r(19);

var setting_icon = new icon({
  content: util.getGoogleIcon('e8b8', { type: "fill" }),
  offset: "bl"
});
setting_icon.getIcon().title = "(Alt+S) 打开设置"
setting_icon.getIcon().onclick = () => {
  mainSetting.open();
}
}),21:(function(_r,module){var core = _r(22)
var ui = _r(24)

var _isen = core.stp.ob_enable;
if (_isen && !core.isInit()) {
  core.initNative();
}
core.initSett(_isen);
ui.uiEnable(_isen);

module.exports= {
  value: ui.setValue,
  focus: ui.focus,
  blur: ui.blur,
  isblur: ui.isblur,
  addNewSug: core.addNewSA,
  addNewType: core.addNewType,
  on:core.on,
  off:core.off,
  getSearchType: core.searchUtil.getSearchType,
  getSearchTypeList: core.searchUtil.getSearchTypeList,
  getSearchTypeIndex: core.searchUtil.getSearchTypeIndex,
  setSearchType: core.searchUtil.setSearchType,
  setSearchList: core.searchUtil.setSearchList,
  keywordText: core.searchUtil.keywordText,
  neizhi: core.searchUtil.neizhi,
  search: {
    on: core.searchUtil.on
  },
  sg:core.sg,
  setAutoFocus: ui.setAutoFocus,
  setJustSearch: ui.setJustSearch
}
}),22:(function(_r,module){const { mainSetting, settingStp,settingSto,SettingGroup,SettingItem } = _r(14);
const getEventHandle = _r(4);
const util = _r(5);
var searchUtil = _r(23);
const { storage } = _r(8);
let ui;
setTimeout(function(){
  ui=_r(24);
})

var initsto = settingSto;
let stp=settingStp;
var { on, off, doevent } = getEventHandle();
var sg = new SettingGroup({
  title: "搜索框",
  index: 1
});
mainSetting.addNewGroup(sg);
var k = {
  SA: [],
  enter: [],
}

if (isUd(stp.ob_justsearch)) {
  stp.ob_justsearch = false;
}
if (isUd(stp.ob_http)) {
  stp.ob_http = false;
}
if (isUd(stp.ob_enable)) {
  stp.ob_enable = true;
}
var sawait = [], sis = [];


/**
 * @param {String} text
 * @param {Function} updateFn(salist:{icon:String,text:String,click}[])
 */
var getSA = function (text, updateFn) {
  if (sawait.length > 0) {
    sawait.forEach(function (v) {
      k.SA[v].interrupt();
    })
  }
  var sa = [];
  var a = k.SA.length;
  for (var i = 0; i < a; i++) {
    if (k.SA[i].check(text)) {
      var b = k.SA[i].get(text, function () {
        return sa;
      })
      if (b instanceof Promise) {
        sawait.push(i);
        (function (i) {
          b.then(function (res) {
            sa = res;
            sawait.splice(sawait.indexOf(i), 1);
            updateFn(sa);
          });
        })(i);

      } else {
        sa = b;
        updateFn(sa);
      }
    }
  }
}

// 回车事件
var enter = function (text) {
  doevent('beforeenter', [text])
  getType(text).enter(text);
  var hissto=storage('omhis');
  var o=hissto.get('his');
  o.unshift(text);
  if(o.length>15){
    o.pop();
  }
  hissto.set('his',o);
  doevent('afterenter', [text])
}

// 获取类型
var getType = function (text) {
  for (var i = 0; i < k.enter.length; i++) {
    if (k.enter[i].check(text)) {
      return k.enter[i];
    }
  }
}

var addNewType = function (options) {
  k.enter.unshift(options);
}

var addNewSA = function (options) {
  k.SA.push(options);
}



function checkUrl(text) {
  if (stp.ob_justsearch) {
    return false;
  }
  return util.checkUrl(text);
};

function initNative() {
  addNewType({
    check() {
      return true;
    },
    enter(text) {
      open(searchUtil.getSearchType().replace(searchUtil.keywordText, encodeURIComponent(text)));
    },
    icon: ":searchtype",
    submit: util.getGoogleIcon('E8B6')
  });

  addNewType({
    check: checkUrl,
    enter(text) {
      if (text.indexOf('://') == -1) {
        text = ((!!stp.ob_http) ? 'https://' : 'http://') + text;
      }
      open(text);
    },
    icon: util.getGoogleIcon('E80B'),
    submit: util.getGoogleIcon('E89E')
  });

  addNewSA({
    check(text) {
      return !!text;
    },
    get(text, getsa) {
      var a = getsa();
      a.unshift({
        icon: util.getGoogleIcon('E8B6'),
        text: text,
        click() {
          open(searchUtil.getSearchType().replace(searchUtil.keywordText, encodeURIComponent(text)));
        }
      });
      return a;
    }
  })


  var searchfetch = null;
  addNewSA({
    check(text) {
      return !!text;
    },
    get(text, getsa) {
      return new Promise(function (r, j) {
        searchfetch = util.jsonp('https://www.baidu.com/sugrec?pre=1&p=3&ie=utf-8&json=1&prod=pc&from=pc_web&wd=' + encodeURIComponent(text), function (res) {
          var a2 = getsa();
          searchfetch = null;
          if (!res.g) {
            r(a2);
            return;
          }
          res.g.forEach(function (item) {
            a2.push({
              icon: util.getGoogleIcon('E8B6'),
              text: item.q,
              click() {
                open(searchUtil.getSearchType().replace(searchUtil.keywordText, encodeURIComponent(item.q)));
              }
            });
          })
          r(a2);
        }, 'cb');
      })
    },
    interrupt() {
      if (searchfetch) {
        searchfetch.abort();
        searchfetch = null;
      }
    }
  });

  addNewSA({
    check: checkUrl,
    get(text, getsa) {
      return new Promise(function (r, j) {
        var a = getsa();
        a.unshift({
          icon: util.getGoogleIcon('E80B'),
          text: text,
          click() {
            if (text.indexOf('://') == -1) {
              text = ((!!stp.ob_http) ? 'https://' : 'http://') + text;
            }
            open(text);
          }
        });
        r(a);
      })
    }
  });
  var cal = _r(26);
  var tr = _r(27);
  var hist=_r(28);
  sis.push(cal);
  sis.push(tr);
  sis.push(hist);
  init_state = true;
}

var init_state = false;
function isInit() {
  return init_state;
}



var sic = new SettingItem({
  title: "启用搜索框",
  index: 1,
  type: 'boolean',
  message: "关闭将不显示搜索框",
  get() {
    return !!stp.ob_enable;
  },
  callback(value) {
    stp.ob_enable = value;
    if (value && !init_state) {
      initNative();
    }
    initSett(value);
    ui.uiEnable(value);
    return true;
  }
})

var si = new SettingItem({
  title: "搜索框仅搜索",
  index: 1,
  type: 'boolean',
  message: "打开后，搜索框将失去打开链接的功能",
  get() {
    return !!stp.ob_justsearch;
  },
  callback(value) {
    stp.ob_justsearch = value
    if (value) {
      ui.getInput().placeholder = '搜索'
    } else {
      ui.getInput().placeholder = '搜索或输入网址'
    }
    return true;
  }
})

var si2 = new SettingItem({
  title: "默认HTTPS打开链接",
  index: 1,
  type: 'boolean',
  message: "打开后，搜索框打开链接在默认情况下使用HTTPS",
  get() {
    return !!stp.ob_http;
  },
  callback(value) {
    stp.ob_http = value
    return true;
  }
})
sg.addNewItem(sic);
sg.addNewItem(si);
sg.addNewItem(si2);
sis.push(si);
sis.push(si2);

function initSett(a) {
  if (a) {
    sis.forEach(si => si.show());
  } else {
    sis.forEach(si => si.hide());
  }
}
module.exports = {
  getSA: getSA,
  enter: enter,
  getType: getType,
  addNewType: addNewType,
  addNewSA: addNewSA,
  searchUtil: searchUtil,
  initsto: initsto,
  stp:stp,
  setJustSearch(value) {
    stp.ob_justsearch=value;
    si.reGet();
  },
  isInit,
  initNative,
  initSett,
  on,
  off,
  doevent,
  sg
}
}),23:(function(_r,module){const getEventHandle = _r(4);
const {storage, gS} = _r(8);
const toast = _r(6);

storage('search', {
  sync: true,
  title: "搜索引擎",
  desc: "搜索引擎配置",
  compare(ast, k, a) {
    var o = getSearchTypeList();
    for (var k in a.typelist) {
      o[k] = a.typelist[k];
    }
    a.typelist = o;
    ast[k] = a;
  }
});

let StP=gS().search;

var keyword = "%keyword%";
var deftypelist = {
  "bing": "",
  "baidu": "",
  "so": "",
  "sogou": "",
  "google": "",
};
if (!StP.typelist) StP.typelist = deftypelist;
if (!StP.type) StP.type = "bing";
var neizhi = {
  "bing": {
    name: "必应",
    link: "https://www.bing.com/search?q="
  },
  "baidu": {
    name: "百度",
    link: "https://www.baidu.com/s?ie=utf-8&wd="
  },
  "google": {
    name: "Google",
    link: "https://www.google.com/search?q="
  },
  "so": {
    name: "360搜索",
    link: "https://www.so.com/s?q="
  },
  "sogou": {
    name: "搜狗",
    link: "https://www.sogou.com/sogou?query="
  },
  "yandex": {
    name: "Yandex",
    link: "https://yandex.com/search/?text="
  },
  "github": {
    name: "GitHub",
    link: "https://github.com/search?q="
  },
  "bilibili": {
    name: "哔哩哔哩",
    link: "https://search.bilibili.com/all?keyword="
  },

  "zhihu": {
    name: "知乎",
    link: "https://www.zhihu.com/search?type=content&q="
  },

  "weibo": {
    name: "微博",
    link: "https://s.weibo.com/weibo?q="
  },
  "taobao": {
    name: "淘宝",
    link: "https://ai.taobao.com/search/index.htm?pid=mm_31205575_2237000308_114588650482&union_lens=lensId%3APUB%401667806444%402104ee54_0bea_1845102bd01_03e9%4001&key="
  },
  "jd": {
    name: "京东",
    link: "https://search.jd.com/Search?keyword="
  },
  "xiaohongshu": {
    name: "小红书",
    link: "https://www.xiaohongshu.com/search_result/?&m_source=itab&keyword="
  },
  "kugou": {
    name: "酷狗音乐",
    link: "https://www.kugou.com/yy/html/search.html#searchType=song&searchKeyWord="
  },
  "qqm": {
    name: "QQ音乐",
    link: "https://y.qq.com/n/ryqq/search?t=song&remoteplace=txt.yqq.top&w="
  },
  "netease": {
    name: "网易云音乐",
    link: "https://music.163.com/#/search/m/?type=1&s="
  },
  "douyin": {
    name: "抖音",
    link: "https://www.douyin.com/search/%s?ug_source=lenovo_stream"
  },
  "stackoverflow": {
    name: "StackOverflow",
    link: "https://stackoverflow.com/nocaptcha?s="
  },
  "mdn": {
    name: "MDN",
    link: "https://developer.mozilla.org/zh-CN/search?q="
  },
  "douban": {
    name: "豆瓣",
    link: "https://www.douban.com/search?q="
  },
  "toutiao": {
    name: "头条搜索",
    link: "https://so.toutiao.com/search?dvpf=pc&keyword="
  },
}

var getSearchType = () => {
  if (neizhi[StP.type]) {
    return neizhi[StP.type].link + '%keyword%';
  } else {
    return StP.typelist[StP.type];
  }
}
var { on, off, doevent } = getEventHandle();
var doevents = doevent;
var setSearchList = (newList) => {
  if (Object.keys(newList).length == 0) {
    throw new Error('newList is empty');
  }
  var oldList = StP.typelist;
  StP.typelist = newList;
  doevents('typelistchange');
  var t = StP.type;
  if (oldList[t] != newList[t]) {
    doevents('nowtypechange');
  }
}
var getSearchTypeList = () => {
  return cloneObj(StP.typelist);
}
var setSearchType = (type) => {
  StP.type = type;
  checkGoogle();
  doevents('nowtypechange');
}

function checkGoogle(){
    if(StP.type!="google")return;
    if(isUd(window.isOutGoogle)){
        setTimeout(checkGoogle, 1000);
        return;
    }
    if(isOutGoogle){
        toast.show("当前网络环境对Google的访问存在限制")
    }
}

setTimeout(checkGoogle, 1000);

var getSearchTypeIndex = () => {
    // to avoid neizhi list change
    if(!StP.typelist[StP.type]){
        if(!neizhi[StP.type]){
            StP.type="bing";
        }
    }
  return StP.type;
}

var retob = {
  getSearchType,
  on,
  off,
  setSearchList,
  getSearchTypeList,
  setSearchType,
  getSearchTypeIndex,
  neizhi,
  keywordText:keyword
}
// why do such that?

module.exports = retob;
}),24:(function(_r,module){const { SettingItem } = _r(14);
const util = _r(5);
const { stp, getSA, enter, searchUtil, getType, sg, doevent } = _r(22);
const {Onshow}=_r(2);

var searchbox, searchcover, icon, input, submit, saul, searchpadding, inputInputEv;
searchpadding = el('div', {
  class: "searchpadding"
})

$('main .center').append(searchpadding);

function initSearchBox() {

  searchbox = el('.searchbox');

  searchcover = el('.cover.searchcover');

  searchbox.html(_r(25).replace('{i}', stp.ob_autofocus ? 'autofocus' : ''));

  $('main').append(searchbox);
  $('main').append(searchcover);

  icon = searchbox.$('div.icon');
  input = searchbox.$('div.input input');
  submit = searchbox.$('div.submit');
  saul = searchbox.$('ul.sas');

  if (stp.ob_justsearch) {
    input.placeholder = '搜索'
  }

  /* 集中处理input事件 */
  inputInputEv = function () {
    // 渲染Type
    chulitype(this.value.trim());
    saul.html("");
    getSA(this.value.trim(), function (salist) {
      //记录用户原本的active
      var actli = saul.$('li.active')
      if (actli) {
        actli = {
          icon: actli.$('div.saicon').html(),
          text: actli.$('div.sa_text').text(),
        }
      }

      // 渲染搜索联想
      saul.html("");
      salist.forEach(s => {
        var li = el('li');
        li.html(`<div class="saicon">${s.icon}</div><div class="sa_text"></div>`);
        li.$('.sa_text').text(s.text);
        saul.append(li);
        li.onclick = () => {
          s.click()
        };
      });

      // 恢复用户原本的active
      if (actli) {
        saul.$$('li').forEach(li => {
          if (li.$('div.saicon').html() && li.$('div.sa_text').html() == actli.text) {
            li.addClass('active');
          }
        })
      }
    });
    doevent('input', [input.value]);
  }
  input.oninput = util.fangdou(inputInputEv, 300);
  /* * */
  inputInputEv.call(input);

  /* 集中处理keydown事件 */
  input.onkeydown = function (e) {
    if (e.key == 'Enter') {
      var actli = saul.$('li.active')
      if (actli) {
        // 当有li为ACTIVE状态时执行li.click事件
        actli.click();
      } else {
        // 否则交给core处理Enter事件
        enter(this.value);
      }
    } else if (e.key == 'ArrowUp') {
      e.preventDefault();
      // 上一个搜索联想
      var actli = saul.$('li.active')
      if (actli) {
        actli.removeClass('active');
        if (actli.prev()) {
          actli.prev().addClass('active');
        }
      }
    } else if (e.key == 'ArrowDown') {
      e.preventDefault();
      // 下一个搜索联想
      var actli = saul.$('li.active')
      if (actli) {
        if (actli.next()) {
          actli.removeClass('active');
          actli.next().addClass('active');
        }
      } else {
        saul.$('li').addClass('active');
      }
    } else if (e.key == 'ArrowRight') {
      var actli = saul.$('li.active');
      if (actli) {
        input.value = actli.$( '.sa_text').text();
        inputInputEv.call(this);
      }
    } else if (e.key == 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        if (sct.$('li.active').prev()) {
          sct.$('li.active').prev().click();
        } else {
          var lis = sct.$$('li');
          lis[lis.length - 2].click();
        }
      } else {
        if (!sct.$('li.active').next().hasClass('add')) {
          sct.$('li.active').next().click();
        } else {
          sct.$('li').click();
        }
      }

    }
  }

  var blurtimeout;
  // ...
  input.on('focus', _focus);
  function _focus() {
    clearTimeout(blurtimeout)
    searchcover.addClass('active');
    searchbox.addClass('active');
    doevent('focus', [input]);
  }
  // ...
  input.on('blur', function () {
    this.removeClass('active');
    blurtimeout = setTimeout(() => {
      if (hasmousedown) {
        mouseupf = function () {
          setTimeout(() => {
            searchcover.removeClass('active');
            searchbox.removeClass('active');
          }, 10)
        }
      } else {
        searchcover.removeClass('active');
        searchbox.removeClass('active');
      }
    })
    doevent('blur', [input]);
  });

  document.on('mousedown', _down);
  document.on('touchstart', _down);
  document.on('mouseup', _up);
  document.on('touchend', _up);
  var hasmousedown = false, mouseupf = function () { };
  function _down() {
    hasmousedown = true;
  }
  function _up() {
    hasmousedown = false;
    mouseupf();
    mouseupf = function () { }
  }

  // ...
  submit.onclick = function () {
    enter(input.value);
  }

  // 搜索引擎选择
  var sct = el('.searchtypeselector');
  sct.html('<ul></ul>');
  $('main .center').insertBefore(sct, searchpadding.next());
  function chuliSearchTypeSelector() {
    var ul = sct.$('ul');
    var nowset = searchUtil.getSearchTypeIndex();
    ul.html("");
    var list = searchUtil.getSearchTypeList();
    for (var k in list) {
      var li = el('li');
      li.html('<img/>');
      (function (li, k) {
        if (!list[k] && searchUtil.neizhi[k]) {
          list[k] = searchUtil.neizhi[k].link;
        }
        util.getFavicon(list[k], function (fav) {
          if (fav) {
            li.$('img').src = fav;
          } else {
            li.$('img').src = util.createIcon('s');
          }
        })
      })(li, k)

      li.attr('data-type', k);
      ul.append(li);
      if (k == nowset) {
        li.addClass('active');
      }
      li.onclick = function () {
        var actli = sct.$('ul li.active');
        actli && actli.removeClass('active');
        this.addClass('active');
        searchUtil.setSearchType(this.attr('data-type'));
        sct.removeClass('active');
      }
    }
    var li = el('li');
    li.addClass('add')
    li.html(util.getGoogleIcon('e145'));
    ul.append(li);
    li.onclick = function () {
      quik.searchEditor.open();
    }
    sct.style.width = ul.$$('li').length * 36 - 6 + 'px';
  }
  icon.on('click', function () {
    // 避免link遮挡底部
    if (sct.hasClass('active')) {
      sct.removeClass('active');
      $('main .links').removeClass('duan');
    } else {
      sct.addClass('active');
      $('main .links').addClass('duan');
    }
  })


  searchUtil.on('nowtypechange', function () {
    if (icon.attr('data-teshu') == ':searchtype') {
      chulitype(input.value, true);
    }
  })
  searchUtil.on('typelistchange', function () {
    chuliSearchTypeSelector();
  })
  chuliSearchTypeSelector();

  // 初始化处理（默认是搜索模式）
  chulitype('');
  gshowb();
  if (stp.ob_autofocus) {
    // @note 这样才能生效，也许是因为浏览器还没渲染好吧
    // @edit at 2024年1月30日 15点10分
    Onshow(() => {
      setTimeout(() => {
        input.focus();
        _focus();
      }, 100)
    })
  }

  if(stp.ob_alignlink){
    searchbox.addClass('alignlink');
  }

}


/**
 * 渲染指定文字的Type至页面
 * @param {String} text 
 */
function chulitype(text, isMust) {
  var i = getType(text);
  if (i.icon[0] == ':') {
    if ((!isMust) && icon.attr('data-teshu') == i.icon) return;
    icon.attr('data-teshu', i.icon);
    var _ts = chuliteshuicon(i.icon);
    if (_ts instanceof Promise) {
      _ts.then(function (r) {
        icon.html(r);
      })
    } else {
      icon.html(_ts);
    }
  } else {
    icon.html(i.icon);
    icon.removeAttribute('data-teshu');
  }
  if (i.submit[0] == ':') {
    submit.attr('data-teshu', i.submit);
    submit.html(chuliteshusubmit(i.submit));
  } else {
    submit.html(i.submit);
    submit.removeAttribute('data-teshu');
  }


}

/**
 * 渲染特殊Icon
 * @param {String} text 
 * @returns {String} iconhtmlstr
 */
function chuliteshuicon(icon) {
  if (icon == ':searchtype') {
    return new Promise(function (r, j) {
      util.getFavicon(searchUtil.getSearchType(), function (fav) {
        if (fav) {
          r('<img src="' + fav + '" style="border-radius:50%;"/>');
        } else {
          r('<img src="' + util.createIcon('S') + '" style="border-radius:50%;"/>');
        }
      })
    });
  } else {
    return '';
  }
}

/**
 * 渲染特殊SubmitIcon
 * @param {String} text 
 * @returns {String} iconhtmlstr
 */
function chuliteshusubmit(submit) {
  // 因为还没有特殊SubmitIcon
  return "";
}

if (isUd(stp.ob_autofocus)) {
  stp.ob_autofocus=false;
}


var si = new SettingItem({
  title: "自动聚焦",
  index: 1,
  type: 'boolean',
  message: "打开页面自动聚焦搜索框",
  get() {
    return !!stp.ob_autofocus;
  },
  callback(value) {
    stp.ob_autofocus=value;
    return true;
  }
})
sg.addNewItem(si);

var si2 = new SettingItem({
  title: "聚焦时背景蒙版",
  index: 6,
  type: 'boolean',
  message: "关闭后聚焦搜索框时不再出现背景蒙版",
  get() {
    return !stp.ob_notshowb;
  },
  callback(value) {
    stp.ob_notshowb = !value;
    gshowb();
    return true;
  }
})
sg.addNewItem(si2);
var si3 = new SettingItem({
  title: "背景蒙版模糊",
  index: 7,
  type: 'boolean',
  message: "背景蒙版模糊（可能会影响性能）",
  get() {
    return stp.ob_bblur;
  },
  callback(value) {
    stp.ob_bblur = value;
    gshowb();
    return true;
  }
})
sg.addNewItem(si3);

var si4 = new SettingItem({
  title: "对齐链接部分",
  index: 8,
  type: 'boolean',
  message: "使搜索框长度对齐链接部分",
  get() {
    return stp.ob_alignlink;
  },
  callback(value) {
    stp.ob_alignlink = value;
    if(value){
      searchbox.addClass('alignlink');
    }else{
      searchbox.removeClass('alignlink');
    }
    return true;
  }
})
sg.addNewItem(si4);

function gshowb() {
  if (stp.ob_notshowb) {
    searchcover.addClass('notshow');
    si3.hide();
  } else {
    searchcover.removeClass('notshow');
    si3.show();
    if (stp.ob_bblur) {
      searchcover.addClass('blur');
    } else {
      searchcover.removeClass('blur');
    }
  }
}

function uiEnable(a) {
  if (a) {
    if (!searchbox) {
      initSearchBox();
    }
    searchbox.show();
    searchpadding.style.height = '';
    si.show();
    si2.show();
    si3.show();
  } else {
    if (searchbox) {
      searchbox.hide();
    }
    searchpadding.style.height = '20px';
    si.hide();
    si2.hide();
    si3.hide();

  }
}
module.exports = {
  setValue(value) {
    input.value = value;
    input.focus();
    inputInputEv.call(input);
  },
  focus() {
    input.focus();
  },
  blur() {
    input.blur();
  },
  isblur() {
    return !input.hasClass('active');
  },
  setAutoFocus(value) {
    stp.ob_autofocus = value;
    si.reGet();
  },
  getInput() {
    return input;
  },
  uiEnable
}
}),25:(function(_r,module){module.exports=`<div class="box"><div class="icon"></div><div class="input"><input type="text" placeholder="搜索或输入网址" {i}></div><div class="submit"></div></div><ul class="sas"></ul>`;}),26:(function(_r,module){const { SettingItem } = _r(14);
const util = _r(5);
const { addNewSA,stp, sg } = _r(22);
const { setValue } = _r(24);

var si = new SettingItem({
    title: "自动计算",
    index: 2,
    type: 'boolean',
    message: "搜索框输入=自动计算后面的内容",
    get() {
        return !!stp.ob_cal;
    },
    callback(value) {
        stp.ob_cal = value;
        return true;
    }
})

sg.addNewItem(si);
addNewSA({
    check(text) {
        return (!!stp.ob_cal) && text[0] == '='
    },
    get(text, getsa) {
        var a = getsa();
        try {
            text = text.substr(1);
            if (!text) return a;
            var e = Math.E;
            var PI = Math.PI;
            var ln = Math.log;
            var lg = Math.log10;
            var sin = Math.sin;
            var cos = Math.cos;
            var tan = Math.tan;
            var asin = Math.asin;
            var acos = Math.acos;
            var atan = Math.atan;
            var sqrt = Math.sqrt;
            var abs = Math.abs;
            text = text.replaceAll('^', '**')
                .replaceAll('π', 'PI')
                .replaceAll('[', '(')
                .replaceAll(']', ')')
                .replaceAll('{', '(')
                .replaceAll('}', ')');
            var result = eval(text);
            result = result.toString().replace('e+', '*10^')
            a.unshift({
                icon: util.getGoogleIcon('ea5f'),
                text: result,
                click() {
                    setValue(result);
                }
            });
        } catch (e) { }

        return a;
    }
});

module.exports = si;
}),27:(function(_r,module){const { SettingItem } = _r(14);
const util = _r(5);
const { addNewSA,stp, sg } = _r(22);
const { setValue } = _r(24);
var si = new SettingItem({
    title: "自动翻译",
    index: 2,
    type: 'boolean',
    message: "搜索框输入非中文时自动翻译为中文",
    get() {
        return !!stp.ob_tran;
    },
    callback(value) {
        stp.ob_tran = value;
        return true;
    }
})

sg.addNewItem(si);
var _t_re, _t_timeout;
addNewSA({
    check(text) {
        return (!!stp.ob_tran) && (!util.checkUrl(text)) && checkLang(text);
    },
    get(text, getsa) {
        return new Promise(function (r, j) {
            // 降低调用次数
            _t_timeout = setTimeout(() => {
                util.xhr('https://edge.microsoft.com/translate/auth', function (res) {
                    var url = 'https://api.cognitive.microsofttranslator.com/translate?from=en&to=zh-CHS&api-version=3.0&includeSentenceLength=true';
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', url, true);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.setRequestHeader('authorization', 'Bearer ' + res);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4) {
                            if (xhr.status == 200) {
                                var a = getsa();
                                var o = JSON.parse(xhr.responseText);
                                if (o[0]) {
                                    var result = o[0].translations[0].text;
                                    a.unshift({
                                        icon: util.getGoogleIcon('e8e2'),
                                        text: result,
                                        click() {
                                            setValue(result);
                                        }
                                    })
                                } else {
                                    console.log('Translate API Err:', o);
                                }
                                r(a);
                            } else {
                                console.log('Translate API Err:', o);
                            }
                        }
                    }
                    var data = [{
                        'Text': text.replace(/[\r\n]/g, ' ')
                    }]
                    xhr.send(JSON.stringify(data));
                }, function () {
                    console.log('Translate API Err:auth failed');
                })


            }, 1500)

        })
    },
    interrupt() {
        clearTimeout(_t_timeout);
        if (_t_re) {
            _t_re.abort();
        }
    }
});

function checkLang(text) {
    var l = text.length
    var y = text.match(/[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FFйцукенгшщзхъфывапролджэячсмитьбюёàâäèéêëîïôœùûüÿçÀÂÄÈÉÊËÎÏÔŒÙÛÜŸÇ\u0530-\u1CDF]/g);
    return y ? y.length / l > 0.5 : !1;
}


module.exports = si;
}),28:(function(_r,module){const { SettingItem } = _r(14);
const { gS } = _r(8);
const util = _r(5);
const { addNewSA,stp, sg } = _r(22);
const { setValue } = _r(24);

var si = new SettingItem({
    title: "历史记录",
    index: 2,
    type: 'boolean',
    message: "开启后，搜索框为空时将显示历史记录（300字以上不计入，最多15条）",
    get() {
        return !!stp.ob_his;
    },
    callback(value) {
        stp.ob_his = value;
        return true;
    }
})

let hisstp=gS("omhis");
if(hisstp.his==undefined){
    hisstp.his=[];
}

sg.addNewItem(si);
addNewSA({
    check(text) {
        return (!!stp.ob_his) && !text;
    },
    get(text, getsa) {
        var a = getsa();
        var his = hisstp.his;
        for (let i = 0; i < his.length; i++) {
            a.push({
                icon:util.getGoogleIconByString('history'),
                text:his[i],
                click(){
                    setValue(his[i]);
                }
            })
        }
        return a;
    }
});

module.exports = si;
}),29:(function(_r,module){var util=_r(5);
var link=_r(30);
var ui=_r(34);
module.exports=util.joinObj(link,ui);
}),30:(function(_r,module){let {storage}=_r(8);
var link;
if (storage.checkIDB()) {
    // 支持数据库
    link = _r(31);
} else {
    // 不支持数据库，使用localStorage
    link = _r(33);
}
module.exports = link;
}),31:(function(_r,module){let { initsto, doevent, on, off,writeLink,pushLink } = _r(32);
let util = _r(5);
const { confirm } = _r(9);
const toast = _r(6);
initsto.set('storage-mode', 'db');

var defLinks = [];

// 初始化进度，2为初始化完毕
var initState = 0, readySatae = 3;
var readyfn = [];
function init() {
  // 初始化默认分组
  console.log(initsto.get('links'));
  if (!initsto.get('links')) {
    console.log('初始化默认链接');
    initsto.set('links', defLinks, true, () => {
      initState++;
      if (initState == readySatae) {
        readyfn.forEach(a => a());
      }
    })
  } else {
    initState++;
    if (initState == readySatae) {
      readyfn.forEach(a => a());
    }
  }

  // 初始化分组
  if (!initsto.get('cate')) {
    initsto.set('cate', {}, true, () => {
      initState++;
      initsto.set('catelist', []);
      initState++;
      if (initState == readySatae) {
        readyfn.forEach(a => a());
      }
    });
  } else {
    initState++;
    if (!initsto.get('catelist')) {
      initsto.get('cate', true, cates => {
        initsto.set('catelist', Object.keys(cates));
        initState++;
        if (initState == readySatae) {
          readyfn.forEach(a => a());
        }
      })
    } else {
      initState++
      if (initState == readySatae) {
        readyfn.forEach(a => a());
      }
    }
  }
}

init();
if (initState == readySatae) {
  readyfn.forEach(a => a());
}

module.exports = {
  setAll(link, cate, cb) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    if (Array.isArray(link) && typeof cate == 'object') {
      if (link) {
        initsto.set('links', link, true, () => {
          cb && cb('link');
          doevent('change', {
            type: "all",
            links: link
          })
        })
      }

      if (cate) {
        initsto.set('cate', cate, true, () => {
          initsto.set('catelist', Object.keys(cate));
          cb && cb('cate');
          doevent('change', {
            type: "all",
            cate: cate
          })
        })

      }

    }
  },
  addLink(detail, callback) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    if (!util.checkDetailsCorrect(detail, ['title', 'url'])) {
      throw '参数不正确';
    }
    if (detail.cate) {
      // 包含分类 
      initsto.get('cate', true, c => {
        if (!c[detail.cate]) {
          callback && callback({
            code: -1,
            msg: "分组不存在"
          })
        } else {
          c[detail.cate] = pushLink(detail, c[detail.cate]);
          initsto.set('cate', c, true, () => {
            callback && callback({
              code: 0,
              msg: "添加成功"
            });
            doevent('change', {
              cate: detail.cate,
              type: 'add',
              detail: detail
            });
          });
        }
      })
    } else {
      // 不包含分类，即为默认分组

      initsto.get('links', true, l => {
        l = pushLink(detail, l);
        initsto.set('links', l, true, () => {
          callback && callback({
            code: 0,
            msg: "添加成功"
          });
          doevent('change', {
            cate: null,
            type: 'add',
            detail: detail
          });
        });
      })
    }
  },
  changeLink(cate, index, detail, callback, other = {}) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    if (!util.checkDetailsCorrect(detail, ['title', 'url']) || typeof index != 'number') {
      throw '参数错误';
    }
    if (cate) {
      // 包含分类
      initsto.get('cate', true, c => {
        if (!c[cate]) {
          callback && callback({
            code: -1,
            msg: "分组不存在"
          })
          return;
        }

        var r = writeLink(index, detail, c[cate]);
        if (!r) {
          callback && callback({
            code: -2,
            msg: "链接不存在"
          });
          return;
        }
        c[cate] = r;
        initsto.set('cate', c, true, () => {
          callback && callback({
            code: 0,
            msg: "修改成功"
          });
          doevent('change', {
            cate: cate,
            index: index,
            type: 'change',
            detail: detail,
            other: other
          });
        })
      })
    } else {
      // 不包含分类
      initsto.get('links', true, links => {
        var r = writeLink(index, detail, links);
        if (!r) {
          callback && callback({
            code: -2,
            msg: "链接不存在"
          });
          return;
        }
        links = r;
        initsto.set('links', links, true, () => {
          callback && callback({
            code: 0,
            msg: "修改成功"
          });
          doevent('change', {
            cate: null,
            index: index,
            type: 'change',
            detail: detail,
            other: other
          });
        });
      });
    }
  },
  deleteLink(cate, index, callback) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    if (cate) {
      // 包含分类
      initsto.get('cate', true, c => {
        if (!c[cate]) {
          callback && callback({
            code: -1,
            msg: "分组不存在"
          });
          return;
        }
        if (!c[cate][index]) {
          callback && callback({
            code: -2,
            msg: "链接不存在"
          });
          return;
        }
        c[cate].splice(index, 1);
        initsto.set('cate', c, true, () => {
          callback && callback({
            code: 0,
            msg: "删除成功"
          });
          doevent('change', {
            cate: cate,
            index: index,
            type: 'delete',
          });
        });
      });
    } else {
      // 不包含分类
      initsto.get('links', true, r => {
        if (!r[index]) {
          callback && callback({
            code: -2,
            msg: "链接不存在"
          });
          return;
        }
        r.splice(index, 1);
        initsto.set('links', r, true, () => {
          callback && callback({
            code: 0,
            msg: "删除成功"
          });
          doevent('change', {
            cate: null,
            index: index,
            type: 'delete',
          });
        });
      });
    }
  },
  addCate(cate, callback, index) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    initsto.get('cate', true, c => {
      if (c[cate]) {
        callback && callback({
          code: -1,
          msg: "分组已存在"
        });
        return;
      }
      c[cate] = [];
      initsto.set('cate', c, true, () => {
        var o = initsto.get('catelist');
        if (typeof index == 'undefined') {
          o.splice(index, 0, cate);
        } else {
          o.push(cate);
        }
        initsto.set('catelist', o);
        callback && callback({
          code: 0,
          msg: "添加成功"
        });
        doevent('change', {
          cate: cate,
          type: 'cateadd',
        });
      });
    });
  },
  renameCate(cate, catename, callback, index) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    var o = initsto.get('catelist');
    if (o.indexOf(cate) < 0) {
      callback && callback({
        code: -1,
        msg: "分组不存在"
      });
      return;
    }
    if (cate == catename) {
      o.splice(o.indexOf(cate), 1);
      o.splice(index, 0, cate);
      initsto.set('catelist', o);
      callback && callback({
        code: 0,
        msg: "修改成功"
      });
      doevent('change', {
        cate: cate,
        catename: catename,
        type: 'caterename',
      });
      return;
    }
    initsto.get('cate', true, c => {
      if (!c[cate]) {
        callback && callback({
          code: -1,
          msg: "分组不存在"
        });
        return;
      }
      if (c[catename]) {
        callback && callback({
          code: -2,
          msg: "分组重名"
        });
      }
      c[catename] = c[cate];
      delete c[cate];
      initsto.set('cate', c, true, () => {
        if (typeof index != 'number') {
          index = o.indexOf(cate);
        }
        o.splice(o.indexOf(cate), 1);
        o.splice(index, 0, catename);
        initsto.set('catelist', o);
        callback && callback({
          code: 0,
          msg: "修改成功"
        });
        doevent('change', {
          cate: cate,
          catename: catename,
          type: 'caterename',
        });
      });
    });
  },
  deleteCate(cate, callback) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    var o = initsto.get('catelist');
    if (o.indexOf(cate) < 0) {
      callback && callback({
        code: -1,
        msg: "分组不存在"
      });
      return;
    } else {
      o.splice(o.indexOf(cate), 1);
      initsto.set('catelist', o);
    }
    initsto.get('cate', true, c => {

      if (!c[cate]) {
        callback && callback({
          code: -1,
          msg: "分组不存在"
        });
        return;
      }
      if (c[cate].length <= 0) {
        delete c[cate];
        initsto.set('cate', c, true, () => {
          callback && callback({
            code: 0,
            msg: "删除成功"
          });
          doevent('change', {
            cate: cate,
            type: 'catedelete',
          });
        });
      } else {
        confirm('确定要删除分组吗？无法恢复！', r => {
          if (r) {
            delete c[cate];
            initsto.set('cate', c, true, () => {
              callback && callback({
                code: 0,
                msg: "删除成功"
              });
              doevent('change', {
                cate: cate,
                type: 'catedelete',
              });
            });
          } else {
            callback && callback({
              code: -2,
              msg: "用户取消删除"
            });
          }
        })
      }

    });
  },
  getLinks(cate, callback) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    if (cate) {
      initsto.get('cate', true, c => {
        if(!c){
            callback({
                code: -1,
                msg: "分组异常，正在恢复初始状态"
            });
            initsto.clear();
            setTimeout(()=>{
                location.reload();
            },1000)
        }
        if (!c[cate]) {
          callback && callback({
            code: -1,
            msg: "分组不存在"
          });
          return;
        }
        callback && callback({
          code: 0,
          msg: "获取成功",
          data: c[cate]
        });
      });
    } else {
      initsto.get('links', true, c => {
        console.log(c);
        if(!c){
            localStorage.__Link_yc="111";
            toast.show("分组异常，正在恢复初始状态")
            initsto.clear();
            setTimeout(()=>{
                location.reload();
            },1000)
            return;
        }
        callback && callback({
          code: 0,
          msg: "获取成功",
          data: c
        });
      });
    }
  },
  getCates(callback) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }

    callback && callback({
      code: 0,
      msg: "获取成功",
      data: initsto.get('catelist')
    });
  },
  getCateAll(callback) {
    if (initState != readySatae) {
      throw '初始化未完成';
    }
    initsto.get('cate', true, c => {
      callback && callback({
        code: 0,
        msg: "获取成功",
        data: c
      });
    });
  },
  ready(fn) {
    if (initState == readySatae) {
      fn();
    } else {
      readyfn.push(fn);
    }
  },
  on, off
}
}),32:(function(_r,module){var {storage,dbTool}=_r(8);
var getEventHandle=_r(4);

var initsto = storage('link', {
  sync: true,
  title:"链接",
  desc:"Ehon起始页链接数据",
  websync:true,
  get:async function(){
    var a=initsto.getAll();
    var sm=a['storage-mode'];
    if(sm=='db'){
      a.links=await localforage.getItem(a.links);
      a.cate=await localforage.getItem(a.cate);
    }
    delete a['storage-mode'];
    return a;
  },
  rewrite(ast,k,a){
    return new Promise(r=>{
      a['storage-mode']=initsto.get('storage-mode');
      if(initsto.get('storage-mode')=='db'){
        initsto.remove('links',true,()=>{
          dbTool.set(a.links,void 0,(hash)=>{
            a.links=hash;
            initsto.remove('cate',true,()=>{
              dbTool.set(a.cate,void 0,(hash)=>{
                a.cate=hash;
                ast[k]=a;
                r();
              });
            });
          });
         
        })
      }else{
        ast[k]=a;
        r();
      }
    })
    
  },
  compare(ast,km,a){
    return new Promise(r=>{
      a['storage-mode']=initsto.get('storage-mode');
      if(a['storage-mode']=='db'){
        initsto.get('links',true,(old)=>{
          initsto.remove('links',true,()=>{
            a.links=compareLinks(old,a.links);
            dbTool.set(a.links,void 0,(hash)=>{
              a.links=hash;
              dbTool.get(ast[km].cate,(ocate)=>{
                dbTool.delete(ast[km].cate,()=>{
                  var d=ocate;
                  if(d){
                    for(var k in a.cate){
                      d[k]=compareLinks(d[k],a.cate[k]);
                    }
                  }else{
                    d=a.cate;
                  }
                  
                  a.cate=d;
                  dbTool.set(a.cate,void 0,(hash)=>{
                    a.cate=hash;
                    ast[km]=a;
                    r();
                  });
                });
              });
            });
          });
          
        })
      }else{
        a.links=compareLinks(initsto.get('links'),a.links);
        var d=initsto.get('cate');
        for(var k in a.cate){
          d[k]=compareLinks(d[k],a.cate[k]);
        }
        a.cate=d;
        ast[km]=a;
      }
    })
  }
});

/**
 * 
 * @param {Array} a 
 * @param {Array} b 
 */
function compareLinks(a,b){
  if(!a){
    return b;
  }
  if(!b){
    return a;
  }
  for(var i=0;i<a.length;i++){
    if(!b.find(function(v){
      return v.title==a[i].title&&v.url==a[i].url;
    })){
      b.push(a[i]);
    }
  }
  return b;
}

function compareCates(a,b){
  for(var k in a){
    if(b[k]){
      b[k]=compareLinks(a[k],b[k]);
    }else{
      b[k]=a[k];
    }
  }
  return b;
}

var {on,off,doevent}=getEventHandle();
function pushLink(detail, ob) {
  var link = {
    title: detail.title,
    url: detail.url
  }
  if(detail.icon){
    link.icon=detail.icon;
  }
  if (typeof detail.index == 'number' && detail.index >= 0) {
    if (detail.index > ob.length) {
      console.warn('添加链接时，index超出范围，应在0-' + ob.length + '之间');
      ob.push(link);
    } else {
      ob.splice(detail.index, 0, link);
    }
  } else {
    ob.push(link);
  }
  return ob;
}

function writeLink(index, detail, ob) {
  if (!ob[index]) {
    return false;
  }
  var link = {
    title: detail.title,
    url: detail.url
  }
  if(detail.icon){
    link.icon=detail.icon;
  }
  ob[index] = link;
  if (typeof detail.index == 'number' && detail.index >= 0) {
    if (detail.index >= ob.length) {
      console.warn('修改链接时，index超出范围，应在0-' + (ob.length - 1) + '之间');
    } else {
      var linkb = ob.splice(index, 1)[0];
      ob.splice(detail.index, 0, linkb);
    }
  }
  return ob;
}

function limitURL(detail) {
  if (detail.url.length > 1000) {
    return 'url';
  } else if (detail.title.length > 60) {
    return 'title';
  }
  return false;
}

module.exports = {
  initsto,
  on,
  off,
  doevent,
  pushLink,
  writeLink,
  limitURL,
  compareLinks,
  compareCates
}
}),33:(function(_r,module){let { initsto, doevent, on, off,pushLink,writeLink,limitURL } = _r(32);
let util = _r(5);
const { confirm } = _r(9);
console.warn('浏览器不支持indexedDB，将在限制模式下使用');

initsto.set('storage-mode', 'localstorage');
// 初始化默认分组
if (!initsto.get('links')) {
  initsto.set('links', [])
}

// 初始化分组
if (!initsto.get('cate')) {
  initsto.set('cate', {});
  initsto.set('catelist', []);
} else {
  if (!initsto.get('catelist')) {
    initsto.set('catelist', Object.keys(initsto.get('cate')));
  }
}


module.exports = {
  setAll(link, cate, cb) {
    if (Array.isArray(link) && typeof cate == 'object') {
      initsto.set('links', link)
      initsto.set('cate', cate);
      initsto.set('catelist', Object.keys(cate));
      cb && cb();
      doevent('change', {
        type: "all",
        links: link,
        cate: cate
      })
    }
  },
  addLink(detail, callback) {
    if (!util.checkDetailsCorrect(detail, ['title', 'url'])) {
      throw '参数不正确';
    }
    var lm = limitURL(detail);
    if (lm) {
      callback && callback({
        code: -3,
        msg: "受限模式下，" + lm + "长度过长",
        lm: lm
      });
      return;
    }
    if (detail.cate) {
      // 包含分类 
      var c = initsto.get('cate');
      if (!c[detail.cate]) {
        callback && callback({
          code: -1,
          msg: "分组不存在"
        })
      } else {
        if (c[detail.cate].length > 100) {
          callback && callback({
            code: -4,
            msg: "受限模式下，分组下已超过100条链接，无法添加"
          })
          return;
        }
        c[detail.cate] = pushLink(detail, c[detail.cate]);
        initsto.set('cate', c);
        callback && callback({
          code: 0,
          msg: "添加成功"
        });
        doevent('change', {
          cate: detail.cate,
          type: 'add',
          detail: detail
        });
      }
    } else {
      // 不包含分类，即为默认分组

      var l = initsto.get('links');
      if (l.length > 100) {
        callback && callback({
          code: -4,
          msg: "受限模式下，分组下已超过100条链接，无法添加"
        })
        return;
      }
      l = pushLink(detail, l);
      initsto.set('links', l);
      callback && callback({
        code: 0,
        msg: "添加成功"
      });
      doevent('change', {
        cate: null,
        type: 'add',
        detail: detail
      });

    }
  },
  changeLink(cate, index, detail, callback, other = {}) {
    if (!util.checkDetailsCorrect(detail, ['title', 'url']) || typeof index != 'number') {
      throw '参数错误';
    }
    var lm = limitURL(detail);
    if (lm) {
      callback && callback({
        code: -3,
        msg: "受限模式下，" + lm + "长度过长",
        lm: lm
      });
      return;
    }
    if (cate) {
      // 包含分类
      var c = initsto.get('cate');
      if (!c[cate]) {
        callback && callback({
          code: -1,
          msg: "分组不存在"
        })
        return;
      }

      var r = writeLink(index, detail, c[cate]);
      if (!r) {
        callback && callback({
          code: -2,
          msg: "链接不存在"
        });
        return;
      }
      c[cate] = r;
      initsto.set('cate', c);
      callback && callback({
        code: 0,
        msg: "修改成功"
      });
      doevent('change', {
        cate: cate,
        index: index,
        type: 'change',
        detail: detail,
        other: other
      });
    } else {
      // 不包含分类
      var links = initsto.get('links');
      var r = writeLink(index, detail, links);
      if (!r) {
        callback && callback({
          code: -2,
          msg: "链接不存在"
        });
        return;
      }
      links = r;
      initsto.set('links', links);
      callback && callback({
        code: 0,
        msg: "修改成功"
      });
      doevent('change', {
        cate: null,
        index: index,
        type: 'change',
        detail: detail,
        other: other
      });
    }
  },
  deleteLink(cate, index, callback) {
    if (cate) {
      // 包含分类
      var c = initsto.get('cate');
      if (!c[cate]) {
        callback && callback({
          code: -1,
          msg: "分组不存在"
        });
        return;
      }
      if (!c[cate][index]) {
        callback && callback({
          code: -2,
          msg: "链接不存在"
        });
        return;
      }
      c[cate].splice(index, 1);
      initsto.set('cate', c);
      callback && callback({
        code: 0,
        msg: "删除成功"
      });
      doevent('change', {
        cate: cate,
        index: index,
        type: 'delete',
      });
    } else {
      // 不包含分类
      var r = initsto.get('links');
      if (!r[index]) {
        callback && callback({
          code: -2,
          msg: "链接不存在"
        });
        return;
      }
      r.splice(index, 1);
      initsto.set('links', r);
      callback && callback({
        code: 0,
        msg: "删除成功"
      });
      doevent('change', {
        cate: null,
        index: index,
        type: 'delete',
      });
    }
  },
  addCate(cate, callback) {
    var c = initsto.get('cate');
    if (c[cate]) {
      callback && callback({
        code: -1,
        msg: "分组已存在"
      });
      return;
    }
    if (Object.keys(c).length >= 20) {
      callback && callback({
        code: -2,
        msg: "受限模式下，分组数量不能超过20个"
      });
      return;
    }
    c[cate] = [];
    initsto.set('cate', c);
    callback && callback({
      code: 0,
      msg: "添加成功"
    });
    doevent('change', {
      cate: cate,
      type: 'cateadd',
    });
  },
  renameCate(cate, catename, callback) {
    var c = initsto.get('cate');
    if (!c[cate]) {
      callback && callback({
        code: -1,
        msg: "分组不存在"
      });
      return;
    }
    if (c[catename]) {
      callback && callback({
        code: -2,
        msg: "分组重名"
      });
    }
    c[catename] = c[cate];
    delete c[cate];
    initsto.set('cate', c);
    callback && callback({
      code: 0,
      msg: "修改成功"
    });
    doevent('change', {
      cate: cate,
      catename: catename,
      type: 'caterename',
    });
  },
  deleteCate(cate, callback) {
    var c = initsto.get('cate');
    if (!c[cate]) {
      callback && callback({
        code: -1,
        msg: "分组不存在"
      });
      return;
    }
    if (c[cate].length <= 0) {
      delete c[cate];
      initsto.set('cate', c);
      callback && callback({
        code: 0,
        msg: "删除成功"
      });
    } else {
      confirm('确定要删除分组吗？无法恢复！', r => {
        if (r) {
          delete c[cate];
          initsto.set('cate', c);
          callback && callback({
            code: 0,
            msg: "删除成功"
          });
          doevent('change', {
            cate: cate,
            type: 'catedelete',
          });
        } else {
          callback && callback({
            code: -2,
            msg: "用户取消删除"
          });
        }
      })
    }
  },
  getLinks(cate, callback) {
    if (cate) {
      var c = initsto.get('cate');
      if (!c[cate]) {
        callback && callback({
          code: -1,
          msg: "分组不存在"
        });
        return;
      }
      callback && callback({
        code: 0,
        msg: "获取成功",
        data: c[cate]
      });
    } else {
      var c = initsto.get('links');
      callback && callback({
        code: 0,
        msg: "获取成功",
        data: c
      });
    }
  },
  getCates(callback) {
    var c = initsto.get('catelist');
    callback && callback({
      code: 0,
      msg: "获取成功",
      data: c
    });
  },
  getCateAll(callback) {
    var c = initsto.get('cate');
    callback && callback({
      code: 0,
      msg: "获取成功",
      data: c
    });
  },
  ready(fn) {
    fn();
  },
  on, off
}
}),34:(function(_r,module){let {SettingGroup, mainSetting,SettingItem}=_r(14);
let util=_r(5);
let link=_r(30);
let {initsto}=_r(32)
let linkui=_r(35);
let cateui=_r(39);
let fulinkui=_r(40);

var linkF =el(".links");

$('main .center').append(linkF);

var linksg = new SettingGroup({
    title: "链接",
});

var drags = new SettingItem({
    type: 'boolean',
    index: 2,
    title: "拖动排序链接(Beta)",
    message: "（仅在链接排列靠左时生效）开启后，你可以通过拖动链接来进行排序，手机端需长按链接1s才可拖动（Beta）",
    get() {
        return initsto.get('draglink');
    },
    callback(v) {
        initsto.set('draglink', v);
    }
});


mainSetting.addNewGroup(linksg);
linksg.addNewItem(drags);

function init() {
    linkF.innerHTML = _r(42)
        .replace('{{cate-left}}', util.getGoogleIcon('e314'))
        .replace('{{cate-right}}', util.getGoogleIcon('e315'))
        .replace('{{cate-add}}', util.getGoogleIcon('e145'))
        .replace('{{mr}}', util.getGoogleIcon('e838', { type: 'fill' }))
        
    linkui.initlink(linkF,linksg);
    cateui.init(linkF,linksg);
    fulinkui.init(linkF,linksg);
    link.ready(() => {
        cateui.dcate(initsto.get('enabledCate'));
        fulinkui.stS(initsto.get('enabledCate'));
        linkui.dsize(initsto.get('linksize'));
        linkui.dstyle(initsto.get('linkstyle'));
        setTimeout(function () {
            linkF.style.opacity = 1;
        }, 300)
        link.getCates(data=>{
            cateui.setCatelist(data.data);
        })
        cateui.drawCate();
        cateui.cateWidthShiPei();
        cateui.actCate(initsto.get('lastingCate'));
    })
    cateui.observeCate();
}


cateui.catechange(function(cate){
    link.getLinks(cate,ls=>{
        linkui.setLinklist(ls.data);
        linkui.drawLinks();
    })
})

init();

link.on('change',function(cl){
    if(cl.type=='all'){
        link.getCates(data=>{
            cateui.setCatelist(data.data);
        })
        cateui.drawCate();
        cateui.cateWidthShiPei();
        cateui.actCate();
        // 重绘当前分类的链接列表
        var actcate = linkF.$('.cate-bar-items .cate-item.active');
        if(actcate){
            var cateName = actcate.hasClass('mr') ? null : actcate.innerText;
            link.getLinks(cateName, ls => {
                linkui.setLinklist(ls.data);
                linkui.drawLinks();
            });
        }
        return;
    }
    var actcate = linkF.$('.cate-bar-items .cate-item.active');
    if(cl.type.indexOf('cate')!=-1){
        var acate = actcate.innerText;
        link.getCates(data=>{
            cateui.setCatelist(data.data);
        })
        cateui.drawCate();
        cateui.cateWidthShiPei();
        if(cl.type=='cateadd'){
            cateui.actCate(cl.cate);
        }else if(cl.type=='catedelete'&&acate==cl.cate){
            cateui.actCate();
        }else if(cl.type=='caterename'&&acate==cl.cate){
            cateui.actCate(cl.catename);
        }
        return;
    }
    var linklist = linkui.getLinklist();
    if(!actcate) return;
    if (cl.cate == actcate.text() || (cl.cate == null && actcate.hasClass('mr'))) {
        if (cl.type == 'add') {
            var li = linkui.glinkli(cl.detail);
            linkF.$('.link-list').insertBefore(li, linkF.$('.link-list .link-add'));
            linklist.push(cl.detail);
            linkui.setLinklist(linklist);
        } else if (cl.type == 'change') {
            if (!(cl.other && cl.other.justindex)) {
                linklist.splice(cl.index, 1)
                linklist.splice(cl.detail.index, 0, cl.detail);
                linkui.setLinklist(linklist);
                var lis = linkF.$$('.link-list li');
                var tli = lis[cl.index];
                if (cl.index < cl.detail.index) {
                    linkF.$('.link-list').insertBefore(tli, lis[cl.detail.index + 1]);
                } else {
                    linkF.$('.link-list').insertBefore(tli, lis[cl.detail.index]);
                }
                util.query(tli, 'a').href = cl.detail.url;
                util.query(tli, 'p').innerText = cl.detail.title;
                if(cl.detail.icon){
                    util.query(tli, 'img').src=cl.detail.icon;
                    util.query(tli, 'img').addClass('load');
                }else{
                    util.getFavicon(cl.detail.url, favicon => {
                        if (favicon) {
                            util.query(tli, 'img').src = favicon;
                        } else {
                            util.query(tli, 'img').src = util.createIcon(cl.detail.title[0]);
                        }
                    });
                }
                
            }
        } else if (cl.type == 'delete') {
            var li = linkF.$$('.link-list li')[cl.index];
            li.remove();
            linklist.splice(cl.index, 1);
            linkui.setLinklist(linklist);
        }
    }
})

function resetmenued(){
    linkui.getMenuedLi()&&linkui.getMenuedLi().removeClass('menued');
    cateui.getMenuedCate()&&cateui.getMenuedCate().removeClass('menued');
}

document.addEventListener('click', resetmenued)
document.addEventListener('contextmenu', resetmenued)



module.exports={
    isShowCate() {
        return initsto.get('enabledCate');
    },
    setShowCate(v) {
        initsto.set('enabledCate', v);
        cateui.dcate(v);
        cateui.enabledCateSi.reGet();
    },
    getLinkSize() {
        return initsto.get('linksize');
    },
    setLinkSize(v) {
    if (['xs', 's', 'm', 'l', 'xl'].indexOf(v) != -1) {
        initsto.set('linksize', v);
        dsize(v);
        linkSizeSi.reGet();
    }
    },
    cateWidthShiPei:cateui.cateWidthShiPei
}
}),35:(function(_r,module){const { SettingItem } = _r(14);
const menu = _r(12);
const { initsto } = _r(32);
const dialog = _r(10);
const toast = _r(6);
const {showOpenFilePicker} = _r(2);
let util=_r(5);
const link=_r(30)
const draglink=_r(36);
const { icon } = _r(7);

let linkF,linksg,linkSizeSi;

function initlink(_linkF,_linksg){
    linkF=_linkF;
    linksg=_linksg;
    linkSizeSi = new SettingItem({
        type: 'select',
        title: "链接大小",
        message: "修改链接显示的大小",
        init() {
            return {
                xs: "很小",
                s: "小",
                m: "中",
                l: "大",
                xl: "很大"
            }
        },
        get() {
            return initsto.get('linksize');
        },
        callback(v) {
            initsto.set('linksize', v);
            dsize(v);
        }
    });
    var linkStyleSi = new SettingItem({
        type: 'select',
        title: "链接样式",
        message: "修改链接显示的样式",
        init() {
            return {
                def: "圆方",
                round: "圆形",
                square: "方形",
            }
        },
        get() {
            return initsto.get('linkstyle');
        },
        callback(v) {
            initsto.set('linkstyle', v);
            dstyle(v);
        }
    });
    var linkPLSi = new SettingItem({
        type: 'select',
        title: "链接排列",
        message: "修改链接的排列方式",
        init() {
            return {
                a: "靠左",
                b: "居中",
            }
        },
        get() {
            return initsto.get('linkpailie');
        },
        callback(v) {
            initsto.set('linkpailie', v);
            dstyle();
        }
    });
    var nlinkeditSi=new SettingItem({
        type:'boolean',
        title:"移动端链接操作适配",
        message:"开启后将在右下角显示铅笔图标，点击后单击链接即可进行修改操作",
        get(){
            return initsto.get('touchoe')
        },
        callback(v){
            initsto.set('touchoe',v);
            if(v){
                touchmodeicon.show();
            }else{
                touchmodeicon.hide();
                setTimeout(()=>{
                    toucheditmode=false;
                })
            }
        }
    })
    
    linksg.addNewItem(linkSizeSi);
    linksg.addNewItem(linkStyleSi);
    linksg.addNewItem(linkPLSi);
    linksg.addNewItem(nlinkeditSi);
}

let touchmodeicon=new icon({
    content:util.getGoogleIcon('e3c9'),
    offset:'br',
    class:"touchingmode"
})
if(initsto.get('touchoe')){
    touchmodeicon.show();
}else{
    touchmodeicon.hide();
}

touchmodeicon.getIcon().onclick=function(){
    if(this.classList.contains('active')){
        toucheditmode=false;
        this.removeClass('active');
        toast.show('点击修改模式关闭')
    }else{
        toucheditmode=true;
        this.addClass('active');
        toast.show('点击修改模式开启')
    }
}

var linklist = [];

function drawLinks(){
    linkF.$('.link-list').innerHTML='<div class="insert-line"></div>'
    linklist.forEach(function(link){
        var li = glinkli(link);
        linkF.$('.link-list').append(li);
    })
    var li = el('li', {
        class: "link-add"
    });
    li.innerHTML = `<a href="javascript:void(0)" class="material-symbols-outlined">&#xe145;</a>`;
    linkF.$('.link-list').append(li);
    li.onclick = () => {
        var cate = linkF.$('.cate-bar-items .cate-item.active');
        if (cate.classList.contains('mr')) {
            cate = null
        } else {
            cate = cate.innerText;
        }
        openLinkEditDialog(-1, cate);
    }
}

function getIndex(a, b) {
    for (var i = 0; i < b.length; i++) {
      if (b[i].isSameNode(a)) {
        return i;
      }
    }
    return -1;
}

var menuedLi = null;
function getMenuedLiDetail() {
    var index = getIndex(menuedLi, menuedLi.parent().$$('li'));
    var cate;
    if(linkF.classList.contains("fu")){
        cate=menuedLi.parent().attr('data-cate')||null;
    }else{
        cate = linkF.$('.cate-bar-items .cate-item.active');
        if (cate.classList.contains('mr')) {
            cate = null
        } else {
            cate = cate.innerText;
        }
    }
    
    return { cate, index };
}

var linkMenu = new menu({
    list: [{
        icon: util.getGoogleIcon('e3c9'),
        title: "修改",
        click() {
            var { index, cate } = getMenuedLiDetail();
            openLinkEditDialog(index, cate);
        }
    }, {
        icon: util.getGoogleIcon('e92e'),
        title: "删除",
        click() {
            var { index, cate } = getMenuedLiDetail();
            link.deleteLink(cate, index, function () {
                toast.show('删除成功')
            })
        }
    }, {
        icon: util.getGoogleIcon('e14d'),
        title: "复制链接",
        click() {
            util.copyText(menuedLi.$('a').href);
        }
    }, {
        icon: util.getGoogleIcon('e941'),
        title: "移动至...",
        click() {
            var { index, cate } = getMenuedLiDetail();
            openMoveLinkDialog(cate, index);
        }
    }]
});

let toucheditmode=false;

function glinkli(l,pz={}) {
    var li = el('li');
    li.innerHTML = `<a href="${l.url}" target="_blank" rel="noopener noreferrer"><div class="link-icon"><img/></div><p></p></a>`
    li.$('p').innerText = l.title;
    if(l.icon){
        li.$('img').src=l.icon;
        li.$('img').addClass('load');
    }else{
        util.getFavicon(l.url, favicon => {
            if (favicon) {
                li.$('img').src = favicon;
            } else {
                li.$('img').src = util.createIcon(l.title[0]);
            }
            li.$('img').onload = function () {
                this.addClass('load');
            }
        });
    }
    
    function contextmenu(e) {
        e.preventDefault()
        e.stopPropagation();
        menuedLi&&menuedLi.removeClass('menued');
        menuedLi = this;
        linkMenu.setOffset({
            top: e.pageY,
            left: e.pageX
        })
        this.addClass('menued');
        linkMenu.show();
    }
    util.query(li,'a').onclick=function(e){
        if(toucheditmode){
            e.preventDefault();
        }
    }
    li.onclick=function(e){
        if(toucheditmode){
            e.preventDefault();
            contextmenu.call(this,e);
        }
    }
    li.oncontextmenu=contextmenu;
    if(!(pz&&pz.nodrag)){
        draglink(li);
    }
    return li;
}

var movelinkdia = null, movelinkdiad = null, movecc = null;
function openMoveLinkDialog(cate, index) {
    if (!movelinkdia) {
        movelinkdia = new dialog({
            class: "move-link-dialog",
            content: _r(37),
        });
        movelinkdiad = movelinkdia.getDialogDom();
        util.query(movelinkdiad, '.cancel.btn').onclick = function (e) {
            e.preventDefault();
            movelinkdia.close();
        }
        movecc = util.query(movelinkdiad, '.group-list');
    }
    let link1={};
    link.getLinks(cate,(a)=>{
        if(a.code!=0){
            return;
        }
        link1=a.data[index];
        util.query(movelinkdiad, '.ok.btn').onclick = function (e) {
            var yd = movecc.$('.item.act');
            if (yd) {
                var tocate = yd.classList.contains('mr') ? null : util.query(yd, '.item-name').innerText;
                link.addLink({
                    title: link1.title,
                    url: link1.url,
                    cate: tocate
                }, function () {
                    link.deleteLink(cate, index, function () {
                        toast.show('移动成功')
                        movelinkdia.close();
                    });
                });
    
            } else {
                toast.show('请选择一个分组');
            }
        }
        movecc.innerHTML = '';
        link.getCates(r => {
            r.data.unshift(null);
            r.data.forEach(c => {
                var li = el('div', {
                    class: "item" + ((!c) ? ' mr' : '')
                });
                li.innerHTML = `<div class="item-name">${c ? c : util.getGoogleIcon('e838', { type: 'fill' })}</div><div class="item-select">${util.getGoogleIcon('e5ca')}</div>`;
                movecc.append(li);
                li.onclick = function () {
                    var yd = movecc.$('.item.act');
                    if (yd) {
                        yd.removeClass('act');
                    }
                    this.addClass('act');
                }
            });
        });
        setTimeout(() => {
            movelinkdia.open();
        });
    })
    
}


var linkaddDialog;

function openLinkEditDialog(index, cate) {
    if (!linkaddDialog) {
        linkaddDialog = new dialog({
            class: "link-add-dialog",
            content: _r(38),
        });
        // @note 将cancel按钮修改为div，防止表单submit到cancel
        // @edit at 2024/1/30 15:20
        var d = linkaddDialog.getDialogDom();
        d.$( '.cancel.btn').onclick = function (e) {
            e.preventDefault();
            linkaddDialog.close();
        }

        d.$('.link-add-icon-upload').onclick=function(e){
            showOpenFilePicker().then(files=>{
                // file to base64
                var reader = new FileReader();
                reader.readAsDataURL(files[0]);
                reader.onload = function () {
                    var base64 = reader.result;
                    var icon=d.$( '.link-add-icon');
                    icon.value=base64;
                }
                reader.onerror = function (error) {
                    console.log('Error: ', error);
                    toast.show('文件读取失败');
                }
            })
        }
    }
    setTimeout(() => {
        linkaddDialog.open();
        var d = linkaddDialog.getDialogDom();
        var ll = linklist.length;
        if (index == -1) {
            if(linkF.hasClass("fu")){
                link.getLinks(cate,(a)=>{
                    ll=a.data.length;
                    _rthen();
                })
            }else{
                _rthen();
            }
            function _rthen(){
                _n('添加链接', '添加', '', '', ll, ll, (e) => {
                    e.preventDefault();
                    var url = d.$( '.link-add-url').value;
                    if (url.indexOf('://') == -1) {
                        url = 'http://' + url;
                    }
                    var title = d.$( '.link-add-title').value;
                    var index3 = d.$( '.link-add-index').value;
                    index3 = index3 == '' ? ll : (index3 - 0);
                    var icon=d.$( '.link-add-icon').value;
    
                    link.addLink({
                        url, title, index: index3, cate,icon
                    }, r => {
                        if (r.code != 0) {
                            toast.show(r.msg);
                        } else {
                            toast.show('添加成功')
                            linkaddDialog.close();
                        }
                    })
    
                },'');
            }
           
        } else {
            let u=linklist[index].url;
            let t=linklist[index].title;
            let ic=linklist[index].icon;
            if(linkF.hasClass("fu")){
                link.getLinks(cate,(a)=>{
                    let lst=a.data;
                    u=lst[index].url;
                    t=lst[index].title;
                    ic=lst[index].icon;
                    ll=lst.length;
                    _then();
                })
            }else{
                _then();
            }
            function _then(){
                _n('修改链接', '修改', u, t, ll - 1, index, (e) => {
                    e.preventDefault();
                    var url = d.$( '.link-add-url').value;
                    if (url.indexOf('://') == -1) {
                        url = 'http://' + url;
                    }
                    var title = d.$( '.link-add-title').value;
                    var index2 = d.$( '.link-add-index').value;
                    var icon=d.$( '.link-add-icon').value;
                    index2 = index2 == '' ? index : (index2 - 0);
                    link.changeLink(cate, index, {
                        url: url,
                        title: title,
                        index: index2,
                        icon:icon
                    }, (back) => {
                        if (back.code != 0) {
                            toast.show(back.msg);
                        } else {
                            toast.show('修改成功')
                            linkaddDialog.close();
                        }
                    })
                },ic);
            }
        }

        function _n(a, b, c, e, f, g, h,icon) {
            d.$( 'h1').innerHTML = a;
            d.$( '.ok.btn').innerHTML = b;
            d.$( 'input.link-add-url').value = c;
            d.$( 'input.link-add-title').value = e;
            d.$( 'input.link-add-index').setAttribute('max', f);
            d.$( 'input.link-add-index').value = g;
            d.$( 'input.link-add-icon').value=icon||'';
            d.$( 'form').onsubmit = h;
        }
    })
}

if (!initsto.get('linksize')) {
    initsto.set('linksize', 'm');
}
if (!initsto.get('linkstyle')) {
    initsto.set('linkstyle', 'round');
}
if (!initsto.get('linkpailie')) {
    initsto.set('linkpailie', 'a');
}


function dstyle() {
    linkF.className = 'links ' + initsto.get('linkstyle') + ' ' + initsto.get('linkpailie')+ " "+(initsto.get("showfulink")?"fu":"");
}


function dsize(v) {
    linkF.$$('.link-list').forEach(l=>{l.className = 'link-list ' + v});
}


module.exports = {
    initlink,
    drawLinks,
    getLinklist:()=>linklist,
    setLinklist:(l)=>linklist=l,
    dsize,
    dstyle,
    glinkli,
    linkSizeSi,
    getMenuedLi:()=>menuedLi,
    linkMenu,
    getIndex,
    isTouchEdit(){
        return toucheditmode;
    },
    openLinkEditDialog
}
}),36:(function(_r,module){
let { initsto } = _r(32);
let util = _r(5);
let link=_r(30);
util.initSet(initsto, 'draglink', true);
let linkMenu,getLinklist,getIndex,linkF;
setTimeout(() => {
    linkMenu = _r(35).linkMenu;
    getLinklist = _r(35).getLinklist;
    getIndex = _r(35).getIndex;
    linkF=$('.links');
})

function getLineLinkNum() {
    var a = linkF.$('.link-list').getRect().width / linkF.$('.link-list li').getRect().width;
    return parseInt(a);
}


function f(li) {
    function g(a) {
        var gtimeout = null, ttimeout = null;
        li.on(a ? 'mousedown' : 'touchstart', (e) => {
            var linklist=getLinklist();
            if (e.which == 3) { return true; }
            if (!a) {
                ttimeout = setTimeout(() => {
                    quik.link.resetmenued();
                    menuedLi = li;
                    linkMenu.setOffset({
                        top: e.targetTouches[0].pageY,
                        left: e.targetTouches[0].pageX
                    })
                    li.addClass('menued');
                    linkMenu.show();
                }, 600);
            }
            if ((!initsto.get('draglink')) || (initsto.get('linkpailie') == 'b')) return true;
            let startX = a ? (e.pageX - li.getRect().left) : (e.targetTouches[0].pageX - li.getRect().left);
            let startY = a ? (e.pageY - li.getRect().top) : (e.targetTouches[0].pageY - li.getRect().top);
            if (a) {
                gtimeout = setTimeout(() => {
                    document.on('mousemove', _move, { passive: false })
                }, 50);
                document.on('mouseup', _up, { passive: false });
            } else {
                gtimeout = setTimeout(() => {
                    document.on('touchmove', _move, { passive: false });
                    li.addClass('touching');
                    linkMenu.hide();
                }, 1000);
                document.on('touchend', _up, { passive: false });
            }

            var b = null, n = null;
            var jx = linkF.$('.link-list').getRect().left;
            var jy = linkF.$('.link-list').getRect().top;
            var dw = li.getRect().width;
            var dh = li.getRect().height;
            function _move(e) {
                e.preventDefault();
                clearTimeout(ttimeout);
                if (!b) {
                    li.$('a').on('click', pv);
                    b = li.cloneNode(true);
                    b.addClass('dragging-link');
                    li.addClass('mousing');
                    document.body.appendChild(b);
                    b.style.width = li.getRect().width + 'px';
                    b.style.height = li.getRect().height + 'px';
                }
                var x = (a ? e.pageX : e.targetTouches[0].pageX) - startX;
                var y = (a ? e.pageY : e.targetTouches[0].pageY) - startY;
                b.style.left = x + 'px';
                b.style.top = y + 'px';

                var dx = x - jx + 50;
                var dy = y - jy + linkF.$('.link-list').scrollTop;

                if (y - jy < -dh / 2 || y > linkF.$('.link-list').getRect().height + linkF.$('.link-list').getRect().top) {
                    var line = linkF.$('.link-list .insert-line');
                    line.hide();
                    n = null;
                    if (y - jy < 0) {
                        scrollingtop();
                    } else {
                        scrollingbottom();
                    }
                } else {
                    clearInterval(stt);
                    var h = parseInt(dy / dh);
                    var w = parseInt(dx / dw);
                    var ne = w + h * getLineLinkNum();
                    if (linklist.length > ne) {
                        n = ne;
                        var line = linkF.$('.link-list .insert-line');
                        line.style.top = h * dh + 7 + 'px';
                        line.style.left = w * dw + 'px';
                        line.style.height = dh + 'px';
                        line.show();
                    }
                }


            }

            function pv(e) {
                e.preventDefault();
            }

            function _up(e) {
                clearTimeout(gtimeout);
                clearTimeout(ttimeout);
                li.removeClass('touching');
                li.removeClass('mousing');
                setTimeout(() => li.$('a').off('click', pv), 10);
                document.off(a ? 'mousemove' : 'touchmove', _move)
                document.off(a ? 'mouseup' : 'touchend', _up)
                if (b) {
                    b.remove();
                    b = null;
                }
                if (n !== null) {
                    var line = linkF.$('.link-list .insert-line');
                    line.hide();
                    var index = getIndex(li, linkF.$$('.link-list li'));
                    if (n == index) return;
                    var cate = linkF.$('.cate-bar-items .cate-item.active');
                    if (cate.hasClass('mr')) {
                        cate = null
                    } else {
                        cate = cate.text();
                    }
                    link.changeLink(cate, index, {
                        url: linklist[index].url,
                        title: linklist[index].title,
                        index: n
                    }, (back) => {
                        if (back.code != 0) {
                            toast.show(back.msg);
                        } else {
                            linklist.splice(n, 0, linklist.splice(index, 1)[0]);
                            if (n > index) {
                                linkF.$('.link-list').insertBefore(li, linkF.$$('.link-list li')[n + 1]);
                            } else {
                                linkF.$('.link-list').insertBefore(li, linkF.$$('.link-list li')[n]);
                            }
                        }
                    }, {
                        justindex: true
                    })
                }
                return true;
            }
            return true;
        });
    }
    g(0);
    g(1);
}

var stt = null;
function scrollingtop() {
    clearInterval(stt);
    stt = setInterval(() => {
        linkF.$('.link-list').scrollTop -= 2;
        if (linkF.$('.link-list').scrollTop <= 0) {
            clearInterval(stt);
        }
    }, 5);
}

function scrollingbottom() {
    clearInterval(stt);
    stt = setInterval(() => {
        linkF.$('.link-list').scrollTop += 2;
        if (linkF.$('.link-list').scrollTop >= linkF.$('.link-list').scrollHeight - linkF.$('.link-list').getRect().height) {
            clearInterval(stt);
        }
    }, 5);
}

module.exports = f;
}),37:(function(_r,module){module.exports=`<h1>移动至</h1><div class="group-list"></div><div class="footer"><div class="btn cancel">取消</div><div class="btn ok">确定</div></div>`;}),38:(function(_r,module){module.exports=`<form><h1></h1><div class="content"><p>URL ：<input class="link-add-url" type="text" required placeholder="链接地址(必填)"></p><p>标题：<input class="link-add-title" type="text" required placeholder="链接标题(必填)"></p><p>位置：<input class="link-add-index" type="number" min="0" placeholder="链接位置"></p><div>图标：<input class="link-add-icon" type="text" placeholder="链接图标"><div class="btn link-add-icon-upload">上传图片</div></div><p class="desc">不填则自动获取图标，可填写图标链接或上传图片文件</p></div><div class="footer"><div class="cancel btn">取消</div><button class="ok btn"></button></div></form>`;}),39:(function(_r,module){let util=_r(5);
let toast=_r(6);
let {initsto}=_r(32);
let link=_r(30);
const { SettingItem } = _r(14);
const dialog = _r(10);
const { confirm } = _r(9);
const menu = _r(12);
const { stS } = _r(40);
const { isTouchEdit } = _r(35);


var linkF,linksg,enabledCateSi;
let catechange=()=>{};

function init(_linkF,_linksg){
    linkF=_linkF;
    linksg=_linksg;
    enabledCateSi = new SettingItem({
        type: 'boolean',
        title: "链接分组",
        message: "(Alt+G)启用链接分组功能来管理链接",
        get() {
            return initsto.get('enabledCate');
        },
        callback(v) {
            initsto.set('enabledCate', v);
            stS(v);
            dcate(v);
        }
    });
    
    
    linksg.addNewItem(enabledCateSi);
    
    
    var remeberCateSi = new SettingItem({
        type: 'boolean',
        title: "记住分组",
        message: "开启后，下次打开时会自动选择上一次的分组",
        get() {
            return !!initsto.get('remeberCate');
        },
        callback(v) {
            initsto.set('remeberCate', v);
        }
    });
    
    
    linksg.addNewItem(remeberCateSi);

    initCate();
}

let catelist=[];

var menuedCate = null;
var cateMenu = new menu({
    list: [{
        icon: util.getGoogleIcon('e3c9'),
        title: "修改",
        click() {
            var cate = menuedCate.innerText;
            openCateEditDialog(cate);
        }
    }, {
        icon: util.getGoogleIcon('e92e'),
        title: "删除",
        click() {
            var cate = menuedCate.innerText;
            link.deleteCate(cate, result => {
                if (result == 0) {
                    toast.show('删除成功')
                } else {
                    toast.show(result.msg);
                }
            });
        }
    }, {
        icon: util.getGoogleIcon('E89E'),
        title: "打开",
        click() {
            actCate(menuedCate);
        }
    }]
});

function bcate(g) {
    var li = util.element('div', {
        class: "cate-item"
    });
    li.innerText = g;
    util.query(linkF, '.cate-bar-items').append(li);
    gcate(li);
}

function gcate(li){
    li.onclick = function (e) {
        if(isTouchEdit()){
            li.oncontextmenu.call(this,e);
            return;
        }
        actCate(this)
    }
    li.oncontextmenu = function (e) {
        e.preventDefault();
        e.stopPropagation();
        menuedCate&&menuedCate.classList.remove('menued');
        menuedCate = this;
        cateMenu.setOffset({
            top: e.pageY,
            left: e.pageX
        })
        this.classList.add('menued');
        cateMenu.show();
    }
}

function drawCate() {
    var cates = util.query(linkF, '.cate-bar-items .cate-item', true);
    cates.forEach(c => {
        if (c.classList.contains('mr')) {
            return;
        } else {
            c.remove();
        }
    })
    catelist.forEach(g => {
        bcate(g);
    });
}

function actCate(cateEl) {
    util.query(linkF, '.link-list').innerHTML = '<div class="insert-line"></div>';
    var cate = null;
    if (typeof cateEl == 'string') {
        try { util.query(linkF, '.cate-bar-items .cate-item.active').classList.remove('active'); } catch (e) { };
        var cateEls = util.query(linkF, '.cate-bar-items .cate-item', true);
        for (var i = 0; i < cateEls.length; i++) {
            if (cateEls[i].classList.contains('mr')) {
                continue;
            }
            if (cateEls[i].innerText == cateEl) {
                cateEls[i].classList.add('active');
                break;
            }
        }
        cate = cateEl;
    } else if (!cateEl) {
        try { util.query(linkF, '.cate-bar-items .cate-item.active').classList.remove('active'); } catch (e) { };
        util.query(linkF, '.cate-bar-items .cate-item.mr').classList.add('active');
    } else {
        try { util.query(linkF, '.cate-bar-items .cate-item.active').classList.remove('active'); } catch (e) { };
        if(!(cateEl instanceof HTMLElement)){
            actCate();
            return;
        }
        cateEl.classList.add('active');
        if (!cateEl.classList.contains('mr')) {
            cate = cateEl.innerText;
        }else{
            cate = null;
        }
    }
    initsto.set('lastingCate', cate);
    catechange(cate);
}

var cateeditDialog;

function openCateEditDialog(cate) {
    if (!cateeditDialog) {
        cateeditDialog = new dialog({
            class: "link-add-dialog",
            content: _r(41),
        });
        // @note 将cancel按钮修改为div，防止表单submit到cancel
        // @edit at 2024/1/30 15:20
    }
    var d = cateeditDialog.getDialogDom();
    util.query(d, '.cancel.btn').onclick = (e) => {
        e.preventDefault();
        cateeditDialog.close();
    }
    setTimeout(() => {
        cateeditDialog.open();
        link.getCates(function (r) {
            var k = r.data;
            if (cate) {
                _n('修改分组', cate, k.indexOf(cate) + 1, k.length, function (catename, cateindex) {
                    link.renameCate(cate, catename, (result) => {
                        if (result.code < 0) {
                            toast.show(result.msg);
                            return;
                        }
                        toast.show('修改成功')
                        cateeditDialog.close();
                    }, cateindex)
                })
            } else {
                _n('添加分组', '', k.length + 1, k.length + 1, function (catename, cateindex) {
                    link.addCate(catename, (result) => {
                        if (result.code < 0) {
                            toast.show(result.msg);
                            return;
                        }
                        toast.show('添加成功')
                        cateeditDialog.close();
                    }, cateindex)
                });
            }
        });

    })

    function _n(a, b, c, f, h) {
        util.query(d, 'h1').innerHTML = a;
        util.query(d, '.cate-name').value = b;
        util.query(d, '.cate-index').value = c;
        util.query(d, '.cate-index').max = f;
        util.query(d, '.cate-index').min = 1;
        util.query(d, 'form').onsubmit = (e) => {
            e.preventDefault();
            var catename = util.query(d, '.cate-name').value;
            var cateindex = util.query(d, '.cate-index').value;
            h(catename, cateindex - 1);
        }
    }
}

if (typeof initsto.get('enabledCate') == 'undefined') {
    initsto.set('enabledCate', false);
}




function dcate(v) {
    if (v) {
        util.query(linkF, '.cate-bar').style.display = 'block';
        initCate();
        setTimeout(() => { cateWidthShiPei(); }, 10);
    } else {
        util.query(linkF, '.cate-bar').style.display = 'none';
    }
    actCate(initsto.get('remeberCate')?(initsto.get('lastingCate')||null):null);
}

function initCate() {
    if (isinitcate) return;
    util.query(linkF, '.cate-item.mr').onclick = function () {
        try { util.query(linkF, '.cate-bar-items .cate-item.active').classList.remove('active'); } catch (e) { };
        this.classList.add('active');
        actCate();
    }
    util.query(linkF, '.cate-item.mr').oncontextmenu = function (e) {
        e.preventDefault();
        e.stopPropagation();
        mrcateMenu.setOffset({
            top: e.pageY,
            left: e.pageX
        })
        mrcateMenu.show();
    }
    util.query(linkF, '.cate-add-btn').onclick = () => {
        openCateEditDialog();
    }
    util.query(linkF, '.cate-left-btn').onclick = () => {
        util.query(linkF, '.cate-bar-scrolls').scrollTo({
            left:
                c(util.query(linkF, '.cate-bar-scrolls').scrollLeft -
                    util.query(linkF, '.cate-bar-scrolls').getBoundingClientRect().width / 2),
            behavior: 'smooth'
        })
    }
    util.query(linkF, '.cate-right-btn').onclick = () => {
        util.query(linkF, '.cate-bar-scrolls').scrollTo({
            left:
                c(util.query(linkF, '.cate-bar-scrolls').scrollLeft +
                    util.query(linkF, '.cate-bar-scrolls').getBoundingClientRect().width / 2),
            behavior: 'smooth'
        })
    }
    function c(a) {
        if (a < 0) return 0;
        var w = util.query(linkF, '.cate-bar-scrolls').scrollWidth - util.query(linkF, '.cate-bar-scrolls').getBoundingClientRect().width;
        if (a > w) return w;
    }
    util.query(linkF, '.cate-bar-scrolls').onscroll = function () {
        checkScrollBtn.call(this);
    }
    checkScrollBtn.call(util.query(linkF, '.cate-bar-scrolls'));
    isinitcate = true;
}

function checkScrollBtn() {
    var a = 0;
    if (this.scrollLeft == 0) {
        util.query(linkF, '.cate-left-btn').classList.add('disabled');
        a++;
    } else {
        util.query(linkF, '.cate-left-btn').classList.remove('disabled');
    }
    if (this.scrollLeft >= this.scrollWidth - this.getBoundingClientRect().width) {
        util.query(linkF, '.cate-right-btn').classList.add('disabled');
        a++;
    } else {
        util.query(linkF, '.cate-right-btn').classList.remove('disabled');
    }
    this.style.width = 'calc(100% - ' + (120 - a * 40) + 'px)';
}
window.addEventListener('resize', () => {
    checkScrollBtn.call(util.query(linkF, '.cate-bar-scrolls'));
})

function cateWidthShiPei() {
    var cates = util.query(linkF, '.cate-bar-items .cate-item', true);
    // edit at 2024年2月24日 17点45分
    // @note 清除上次width的影响 （除非width>100000px）
    util.query(linkF, '.cate-bar-items').style.width = '100000px';
    // 强行渲染
    cates[0].offsetHeight;
    var w = 0;
    cates.forEach(function (c) {
        // edit at 2024年1月29日 15点37分
        // @note 因为加了margin
        w += c.getBoundingClientRect().width + 4;
    })
    util.query(linkF, '.cate-bar-items').style.width = w + 'px';
    checkScrollBtn.call(util.query(linkF, '.cate-bar-scrolls'));
}


function observeCate() {
    var ob = new MutationObserver(() => {
        setTimeout(cateWidthShiPei, 1)
    });
    ob.observe(util.query(linkF, '.cate-bar-items'), {
        childList: true
    });
}

var isinitcate = false;
var mrcateMenu = new menu({
    list: [{
        icon: util.getGoogleIcon('e92e'),
        title: "清空",
        click() {
            confirm('确定清空默认分组的链接吗？该操作不可恢复！', function (ok) {
                if (ok) {
                    link.setAll([], null, function (o) {
                        if (o == 'link') {
                            toast.show('清空成功')
                        }
                    });
                }
            })
        }
    }],
    offset: {
        top: 0,
        left: 0
    }
});

let ex={
    observeCate,
    init,
    getCatelist:()=>catelist,
    setCatelist:(cl)=>{
        catelist=cl;
    },
    actCate,
    bcate,
    drawCate,
    dcate,
    cateWidthShiPei,
    catechange:(fn)=>{
        catechange=fn;
    },
    gcate,
    getMenuedCate:()=>menuedCate,
}

Object.defineProperty(ex,'enabledCateSi',{
    get:()=>enabledCateSi
})

module.exports=ex;
}),40:(function(_r,module){const { SettingItem } = _r(14);
const util = _r(5);
const { initsto } = _r(32);
const { getCates,getLinks,on } = _r(30);
// const link = _r(35);
const { glinkli, openLinkEditDialog } = _r(35);


let fulinkF=el("div.fulink-con.linkscroll");
function drawFulink(){
    fulinkF.parent().addClass("fu");
    fulinkF.innerHTML=`<div class="cate-item" data-mr>${util.getGoogleIcon('e838', { type: 'fill' })}</div><ul class="link-list" data-mr></ul>`;
    getLinks(null,(a)=>{
        if(a.code!=0)return;
        let d=a.data;
        d.forEach((l)=>{
            let li=glinkli(l,{
                nodrag:true
            });
            fulinkF.$(".link-list[data-mr]").append(li);
        })
        var li = el('li.link-add');
        li.innerHTML = `<a href="javascript:void(0)" class="material-symbols-outlined">&#xe145;</a>`;
        fulinkF.$(".link-list[data-mr]").append(li);
        li.onclick = () => {
            openLinkEditDialog(-1, null);
        }
    })
    getCates((a)=>{
        if(a.code!=0)return;
        let c=_r(39);
        let d=a.data;
        for(let k of d){
            let tF=el("div",{
                class:"cate-item",
                'data-cate':k
            });
            tF.innerText=k;
            c.gcate(tF);
            tF.onclick=function(e){
                this.oncontextmenu.call(this,e);
            }
            let lF=el("ul",{
                class:"link-list",
                'data-cate':k
            });
            fulinkF.append(tF);
            fulinkF.append(lF);
            getLinks(k,(lm)=>{
                lm.data.forEach((l)=>{
                    let li=glinkli(l,{
                        nodrag:true
                    });
                    lF.append(li);
                })
                var li = el('li.link-add');
                li.innerHTML = `<a href="javascript:void(0)" class="material-symbols-outlined">&#xe145;</a>`;
                lF.append(li);
                li.onclick = () => {
                    openLinkEditDialog(-1, k);
                }
            })
            
        }
    })
}

on("change",(cl)=>{
    console.log(cl);
    
    if(!fulinkF.parent().classList.contains('fu'))return;
    if(cl.type=="all"||cl.type.indexOf("cate")!=-1){
        drawFulink();return;
    }
    let lsF;
    if(cl.cate){
        lsF=fulinkF.$( '.link-list[data-cate="'+cl.cate+'"]');
    }else{
        lsF=fulinkF.$(".link-list[data-mr]");
    }
    if(cl.type=='add'){
        var li = glinkli(cl.detail,{nodrag:true});
        lsF.insertBefore(li, util.query(lsF,".link-add"));
    }else if (cl.type == 'change') {
        if (!(cl.other && cl.other.justindex)) {
            var lis = lsF.$$('li');
            var tli = lis[cl.index];
            if (cl.index < cl.detail.index) {
                lsF.insertBefore(tli, lis[cl.detail.index + 1]);
            } else {
                lsF.insertBefore(tli, lis[cl.detail.index]);
            }
            tli.$('a').href = cl.detail.url;
            tli.$('p').innerText = cl.detail.title;
            if(cl.detail.icon){
                tli.$('img').src=cl.detail.icon;
                tli.$('img').addClass('load');
            }else{
                util.getFavicon(cl.detail.url, favicon => {
                    if (favicon) {
                        tli.$('img').src = favicon;
                    } else {
                        tli.$('img').src = util.createIcon(cl.detail.title[0]);
                    }
                });
            }
            
        }
    }else if (cl.type == 'delete') {
        var li = lsF.$$('li')[cl.index];
        li.remove();
    }
})
let s;
function init(linkF,linksg){
    s=new SettingItem({
        title:"全分组显示",
        message:"开启后所有分组链接将会全部显示在页面上",
        type:"boolean",
        get(){
            return !!initsto.get("showfulink");
        },
        callback(v){
            initsto.set("showfulink",v);
            if(v){
                drawFulink();
            }else{
                linkF.removeClass("fu");
                _r(39).cateWidthShiPei();
            }
        }
    })

    linksg.addNewItem(s);
    linkF.append(fulinkF);
    if(initsto.get("showfulink")){        
        drawFulink();
    }
}

function stS(v){
    if(!s)return;
    if(v){
        s.show();
    }else{
        initsto.set("showfulink",false);
        s.reGet();
        s.hide();
    }
}

module.exports={
    init,
    stS
}

}),41:(function(_r,module){module.exports=`<form><h1></h1><div class="content"><p>标题：<input class="cate-name" type="text" required placeholder="分组标题(必填)"></p><p>位置：<input class="cate-index" type="number" required placeholder="分组位置"></p></div><div class="footer"><div class="cancel btn">取消</div><button class="ok btn">确定</button></div></form>`;}),42:(function(_r,module){module.exports=`<div class="cate-bar"><div class="cate-bar-controls"><div class="cate-left-btn">{{cate-left}}</div></div><div class="cate-bar-scrolls"><div class="cate-bar-items"><div class="cate-item mr active">{{mr}}</div></div></div><div class="cate-bar-controls r"><div class="cate-right-btn">{{cate-right}}</div><div class="cate-add-btn">{{cate-add}}</div></div></div><div class="linkscroll"><ul class="link-list"></ul></div>`;}),43:(function(_r,module){const { _addSayType, getNowSay, setSayType, addSayType, initsto, getSayTypes, set_key, sayF, typesi, sayMenu, sayI, refsay } = _r(44);

_addSayType(_r(54));
_addSayType(_r(55));
_addSayType(_r(56));

if (initsto.get('enabled')) {
    var __key = initsto.get('saytype');
    var sayTypes=getSayTypes();
    if (sayTypes[__key]) {
      sayMenu.setList(sayTypes[__key].menu);
      sayI.onclick = sayTypes[__key].click
      refsay(__key);
    } else {
      set_key(__key)
    }
  } else {
    sayF.hide();
    typesi.hide();
  }

module.exports={
    getNowSay:getNowSay,
    setSayType:setSayType,
    addSayType:addSayType
}

}),44:(function(_r,module){const dialog = _r(10);
const menu = _r(12);
const { SettingGroup, SettingItem, mainSetting } = _r(14);
const {storage} = _r(8);
const util = _r(5);
const {alert, confirm} =_r(9);
const addon =_r(45);

var initsto = storage('says', {
  sync: true,
  title: "一言",
  desc: "Ehon起始页一言相关配置",
  get: async () => {
    var a = initsto.getAll();
    var ra = addon.getAddonBySessionId(a.saytype);
    if (ra) {
      a.requireAddon = ra.url;
    }
    return a;
  },
  rewrite(ast, k, a) {
    return new Promise((resolve, reject) => {
      if (a.requireAddon) {
        var raddon = addon.getAddonByUrl(a.requireAddon);
        if (raddon) {
          a.saytype = raddon.session.id;
          ast[k] = a;
          resolve();
        } else {
          confirm('该一言数据需要安装插件以同步，是否安装？', (v) => {
            if (v) {
              addon.installAddon(a.requireAddon).then((_addon) => {
                a.saytype = _addon.session.id;
                ast[k] = a;
                resolve();
              }).catch((code) => {
                if (code == 0) {
                  alert('插件取消安装，同步取消', () => {
                    resolve();
                  })
                } else {
                  alert('插件安装失败，同步取消', () => {
                    resolve();
                  })
                }
              });
            } else {
              alert('已取消一言同步', () => {
                resolve();
              })
            }
          })
        }
      } else {
        ast[k] = a;
        resolve();
      }
    })
  }
});

//   var sayTypes=['user','jinrishici','hitokoto'];

var sayF = el(".says")

$('main').appendChild(sayF);

sayF.innerHTML = `<div class="say-inner"></div><div class="say-control">${util.getGoogleIcon('e5d4')}</div>`;

var sayI = sayF.$('div.say-inner');
var sayC = sayF.$('div.say-control');
var sayMenu = new menu({
  list: [],
});

var sayinfoDialog = new dialog({
  content: `<div class="closeBtn">${util.getGoogleIcon('e5cd')}</div><ul></ul>`,
  class: "says_info"
});

var infd = sayinfoDialog.getDialogDom();
infd.$('div.closeBtn').onclick = () => {
  sayinfoDialog.close();
}

var sayTypes = {}, nowSay = {};
function _addSayType(details) {
  sayTypes[details.key] = {
    name: details.name,
    callback: details.callback,
    click: details.click || (() => { }),
    menu: details.menu || [
      {
        icon: util.getGoogleIcon('e14d'),
        title: '复制',
        click() {
          var value = nowSay.say;
          util.copyText(value);
        }
      }
    ]
  }
}

function addSayType(details) {
  if (!util.checkSession(details.session)) {
    throw "错误的session";
  }
  details.key = details.session.id;
  _addSayType(details)
  typesi.reInit();
  waitfn(details.key);
}

addon.on('allrun', () => {
  if (_key) {
    initsto.set('saytype', 'user');
    refsay('user');
    alert('您的一言数据由于插件缺失无法显示，已为您切换为默认。');
  }
})

function setSayType(key, cb) {
  if (util.checkSession(key)) {
    key = key.id;
  }
  if (!sayTypes[key]) {
    throw 'type不存在 type:' + key;
  }

  initsto.set('saytype', key);
  sayMenu.setList(sayTypes[key].menu);
  sayI.onclick = sayTypes[key].click

  refsay(key, cb);
  typesi.reGet();
}

function refsay(key, cb) {
  if (util.checkSession(key)) {
    key = key.id;
  }
  if (!sayTypes[key]) {
    throw 'key不存在';
  }
  sayI.text('...');
  sayI.title = '加载中';
  sayTypes[key].callback().then((say) => {
    sayI.text(say.say);
    sayI.attr('title', say.title);
    nowSay = say;
    cb && cb();
  })
}

function getNowSay() {
  return nowSay;
}

function openSayDetailsDialog(op) {
  infd.$('ul').innerHTML = (() => {
    var str = '';
    for (var k in op) {
      str += '<li><b>' + k + ':</b> ' + op[k] + '</li>';
    }
    return str;
  })();
  sayinfoDialog.open();
}

sayC.onclick = (e) => {
  e.stopPropagation();
  var bo = sayC.getBoundingClientRect()
  sayMenu.setOffset({
    bottom: window.innerHeight - bo.top,
    left: bo.left - 90 + bo.width
  });
  sayMenu.show();
}

if (!initsto.get('saytype')) {
  initsto.set('saytype', 'user');
}


if (initsto.get('enabled') == undefined) {
  initsto.set('enabled', true);
}


var sg = new SettingGroup({
  title: "一言",
  index: 3
});
var typesi = new SettingItem({
  title: "一言类型",
  type: 'select',
  index: 1,
  message: "页面底部显示的一言类型",
  init() {
    var ks = {};
    for (var k in sayTypes) {
      ks[k] = sayTypes[k].name;
    }
    return ks;
  },
  callback(v) {
    setSayType(v);
  },
  get() {
    return initsto.get('saytype');
  }
})
var showsi = new SettingItem({
  title: "显示一言",
  type: 'boolean',
  message: "是否页面底部显示的一言",
  index: 0,
  callback(v) {
    initsto.set('enabled', v);
    if (v) {
      setSayType(initsto.get('saytype'));
      sayF.css("display","");
      typesi.show();
    } else {
      sayF.hide();
      typesi.hide();
    }
  },
  get() {
    return initsto.get('enabled');
  }
})
mainSetting.addNewGroup(sg);
sg.addNewItem(typesi);
sg.addNewItem(showsi);
var _key;
function waitfn(id) {
  if (id == _key) {
    sayMenu.setList(sayTypes[id].menu);
    sayI.onclick = sayTypes[id].click
    refsay(id);
    _key = null;
  }
}

module.exports = {
  getNowSay,
  setSayType,
  addSayType,
  _addSayType,
  refsay,
  initsto,
  openSayDetailsDialog,
  sayMenu,
  sayI,
  sayF,
  typesi,
  getSayTypes:()=>sayTypes,
  set_key:(_k)=>{_key=_k}
}

}),45:(function(_r,module){// 插件模块 - 仅保留核心API，移除UI（图标、弹窗、设置）
var core = _r(46);
var coreup = _r(47);
core = coreup(core);
module.exports = core;

}),46:(function(_r,module){const { alert } = _r(9);
const dialog = _r(10);
const getEventHandle = _r(4);
const { storage } = _r(8);
const util = _r(5);
var def_addon_icon = window.isExt ? ("chrome-extension://" + window.extid + "/assets/def_addon.png") : "./assets/def_addon.png"

var marketData;
var evn = getEventHandle();
var h = [
  "浏览器不支持IndexedDB",
  "安全模式下安装程序被禁止",
  "确定是否安装此插件？"
]

function getCode(jsurl, p) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', jsurl, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          resolve(xhr.responseText);
        }
      }
    }
    xhr.onerror = () => {
      reject(xhr.status);
    }
    xhr.onprogress = (pr) => {
      if (pr.total) {
        p && p(pr.loaded / pr.total);
      } else {
        p && p(0);
      }
    }
    xhr.send();
  })

}

function deAddon(addon_code) {
  addon_code = addon_code.trim();
  if (addon_code.indexOf('/*QUIK_ADDON ') == 0) {
    var meta = addon_code.substring(13, addon_code.indexOf(' */'));
    meta = meta.split('|');
    var metaver = meta[0];
    if (metaver == '1') {
      return {
        name: meta[1],
        version_code: parseInt(meta[2]),
        version: meta[3],
        desc: meta[4],
        author: meta[5],
        icon: meta[6],
        website: meta[7],
        update: meta[8],
        signature: meta[9]
      }
    } else {
      return {
        error: true,
        msg: 'un support meta version'
      }
    }
  } else {
    return {
      error: true,
      msg: 'not QUIK addon'
    }
  }
}

function hasSame(signature) {
  if (!signature) return false;
  var a = initsto.list();
  for (var i = 0; i < a.length; i++) {
    if (initsto.get(a[i]).signature == signature) {
      return true;
    }
  }
}

async function installAddon(code, meta, detail) {
  if (typeof meta != 'object' || meta.error) {
    return {
      msg: "插件格式错误:" + (meta.msg || 'META isn\'t an object'),
      error: true,
    }
  } else if (hasSame(meta.signature)) {
    return {
      msg: "已安装相同插件",
      error: true
    }
  } else {
    var adid = util.getRandomHashCache();
    await new Promise(function (r) {
      codesto.set(adid, code, true, r);
    });
    meta.id = adid;
    for (var k in detail) {
      if (typeof meta[k] == 'undefined') {
        meta[k] = detail[k];
      }
    }
    initsto.set(adid, meta);
    await runAddon(adid);
    return {
      id: adid
    };
  }
}

async function checkUpdate(id) {
  var addon = initsto.get(id);
  if (!addon) {
    throw 'not found addon';
  }
  if (!addon.type) {
    var update = addon.update;
    if (!update) {
      return false;
    }
    var nc = await fetch(joinPath(addon.marketId ? ((await loadMarketData())[addon.marketId].url) : addon.url, update));
    nc = await nc.text();
    nc = parseInt(nc);
    if (nc > addon.version_code) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function joinPath(a, b) {
  return a.substring(0, a.lastIndexOf('/')) + '/' + b;
}

var initsto = storage('addon', {
  sync: true,
  title: "插件",
  desc: "QUIK起始页插件数据",
  rewrite(ast, k2, a) {
    return new Promise(function (r) {
      if (Object.keys(a).length == 0) { r(); return; }
      var d = new dialog({
        content: "<div>正在同步插件...[<span>0</span>/" + Object.keys(a).length + "]</div>",
        class: "dialog-addon-install",
        clickOtherToClose: false
      });
      d.open();
      var df = d.getDialogDom();
      var i = 0;
      for (var k in a) {
        var p;
        if (a[k].url && getAddonByUrl(a[k].url)) {
          _pu();
          continue;
        }
        if (a[k].marketId) {
          p = installByOfficialMarket(a[k].marketId);
        } else if (!a[k].type) {
          p = installByUrl(a[k].url);
        } else {
          _pu();
        }
        p.on('done', () => {
          _pu();
        })
        p.on('error', () => {
          _pu();
          alert('安装一个插件时失败');
        })
        p.on('wait', r => r(true));
      }
      function _pu() {
        i++;
        util.query(df, 'span').innerHTML = i;
        if (i == Object.keys(a).length) {
          ast[k2] = initsto.getAll();
          r();
        }
      }
    });
  }
});
var codesto = storage('addonscript');


function getAddonByUrl(url) {
  var as = initsto.getAll();
  for (var k in as) {
    if (as[k].url == url) {
      return as[k];
    }
  }
}

function getAddonBySessionId(id) {
  return initsto.get(id);
}

function getAddonByMarketId(id) {
  var as = initsto.getAll();
  for (var k in as) {
    if (as[k].marketId == id) {
      return as[k];
    }
  }
}

var ainstatus = ['初始化', '获取插件信息', '下载插件', '等待确认', '安装插件', '安装成功'];
var ainerrors = ['初始化失败', '未找到插件信息', '下载插件失败', '插件解析错误', '用户取消', '安装失败'];
function addonInstallProcess() {
  this.statuCode = 0;
  this.statuMsg = ainstatus[0];
  this.progress = 0;
  this.errorCode = -1;
  this.errorMsg = '';
  this.result = null;
  this.ev = getEventHandle();
  this.on = this.ev.on;
  this.off = this.ev.off;
}
addonInstallProcess.prototype = {
  setProgress(n) {
    this.progress = n;
    this.ev.doevent('progress', [n]);
  },
  setStatu(n) {
    this.statuCode = n;
    this.statuMsg = ainstatus[n];
    this.ev.doevent('statu', [{
      code: n,
      msg: ainstatus[n]
    }])
  },
  setError(n, m) {
    this.errorCode = n;
    this.errorMsg = ainerrors[n] + ' ' + m;
    this.ev.doevent('error', [{
      code: n,
      msg: ainerrors[n] + ' ' + m
    }])
  },
  setDone(res) {
    this.result = res;
    this.ev.doevent('done', [res]);
  },
  wait(d, fn) {
    this.waiting = true;
    var _ = this;
    this.ev.doevent('wait', [function (a) {
      _.waiting = false;
      fn(a);
      _._waitfn = fn;
      _._waitd = d;
    }, d]);
    this._waitfn = fn;
    this._waitd = d;
  }
}

function _install_end(p) {
  return function (r) {
    if (r.error) {
      p.setError(5, r.msg);
    } else {
      p.setStatu(5);
      p.setProgress(1);
      p.setDone(r);
      evn.doevent('installnew', [r])
    }
  }
}

// 从官方插件市场安装
function installByOfficialMarket(id) {
  var p = new addonInstallProcess();
  if (!storage.checkIDB()) {
    p.setError(0, h[0]);
  }
  if (window.addon_) {
    p.setError(0, h[1])
  }
  if (!marketData) {
    loadMarketData().then(getmarketData);
  } else {
    getmarketData();
  }
  function getmarketData() {
    if (marketData[id]) {
      p.setProgress(0.1);
      p.setStatu(2);
      var url = marketData[id].url;
      getCode(url, pr => {
        p.setProgress(0.1 + pr * 0.5);
      }).then(code => {
        p.setProgress(0.6);
        p.setStatu(3);
        installAddon(code, deAddon(code), {
          marketId: id
        }).then(_install_end(p))
      }).catch(() => {
        p.setError(2, url);
      });
    } else {
      p.setError(1, id);
    }
  }
  return p;
}

// 从链接安装
function installByUrl(url) {
  var p = new addonInstallProcess();
  if (!storage.checkIDB()) {
    p.setError(0, h[0]);
  }
  if (window.addon_) {
    p.setError(0, h[1])
    return;
  }
  p.setProgress(0.1);
  p.setStatu(2);
  getCode(url, pr => {
    p.setProgress(0.1 + pr * 0.5);
  }).catch(() => {
    p.setError(2, url);
  }).then(code => {
    p.setProgress(0.6);
    var meta = deAddon(code);
    if (meta.error) {
      p.setError(3, meta.msg);
    } else {
      p.setStatu(3);
      p.wait({
        meta: meta,
        msg: h[2]
      }, n => {
        if (n) {
          installAddon(code, meta, {
            url: url
          }).then(_install_end(p));
        } else {
          p.setError(4, '');
        }
      })

    }
  });
  return p;
}

// 从本地安装
function installByLocal(code, p) {
  var p = new addonInstallProcess();
  if (!storage.checkIDB()) {
    p.setError(0, h[0]);
  }
  if (window.addon_) {
    p.setError(0, h[1])
    return;
  }
  p.setProgress(0.1);
  p.setStatu(1);
  var meta = deAddon(code);
  if (meta.error) {
    p.setError(3, meta.msg);
  } else {
    p.setProgress(0.5);
    p.setStatu(3);
    p.wait({
      meta: meta,
      msg: h[2]
    }, n => {
      if (n) {
        installAddon(code, meta, {
          local: true
        }).then(_install_end(p));
      } else {
        p.setError(4, '');
      }
    })
  }
  return p;
}

// 从开发端口安装
function installByDev(devurl) {
  if (!window.isExt) {
    alert('请在浏览器扩展中安装开发端口')
    return;
  }
  if (window.addon_) {
    p.setError(0, h[1])
    return;
  }
  var adid = util.getRandomHashCache();
  initsto.set(adid, {
    name: "DEVPORT:" + devurl,
    url: devurl,
    type: "dev"
  });
  evn.doevent('installnew', { id: adid })
  runAddon(adid);
  return adid;
}

// 插件卸载
async function uninstall(id) {
  var addon = initsto.get(id);
  if (addon) {
    initsto.remove(id);
    if (addon.type != 'dev') {
      await new Promise((r) => {
        codesto.remove(id, true, r)
      });
    }
    evn.doevent('uninstall', { id, marketId: addon.marketId })
    uninstalleventons[id] && uninstalleventons[id]();
    return true;
  } else {
    return false;
  }
}

// 插件运行
async function runAddon(id) {
  var code;
  var data = initsto.get(id);
  var script = document.createElement('script');
  if (data.type == 'dev') {
    await new Promise((r, j) => {
      util.requestByExt({
        url: data.url + 'index.js',
        method: "get",
        responseType: "text",
        then(res) {
          code = res.data;
          r()
        },
        catch() {
          alert('开发端口出错');
          j();
        }
      })
    })
  } else {
    code = await new Promise((r) => codesto.get(id, true, r));
  }
  script.innerHTML = `(()=>{
function Session(id){this.id="ext_"+id;this.session_token="Hvm_session_token_eoi1j2j";this.isSession=true}
var addonData={session:new Session('${id}'),uninstall(fn){quik.addon._doonun(this.session,fn)}};
(function(){${code}})();})()`;
  document.body.appendChild(script);

}

// 插件升级
async function update(id) {
  var addon = initsto.get(id);
  if (!addon) {
    return {
      error: true,
      msg: "未找到插件"
    }
  }
  if (addon.url || addon.marketId) {
    if (addon.marketId) addon.url = (await loadMarketData())[addon.marketId].url;
    try {
      var code = await getCode(addon.url);
    } catch (e) {
      return {
        error: true,
        msg: "代码请求失败",
        code: e
      }
    }
    var meta = deAddon(code);
    if (meta.error) {
      return {
        error: true,
        msg: 'META 解析失败:' + meta.msg
      }
    }
    if (meta.signature != addon.signature) {
      return {
        error: true,
        msg: '签名校验失败'
      }
    }
    if (meta.version_code >= addon.version_code) {
      for (var k in meta) {
        addon[k] = meta[k];
      }
      await new Promise(r => {
        codesto.set(id, code, true, r);
      });
      initsto.set(id, addon);
      evn.doevent('update', { id })
      return {
        ok: 1, id, version_code: meta.version_code
      }
    } else {
      return {
        error: true,
        msg: '版本校验失败'
      }
    }
  } else {
    return {
      error: true,
      msg: "无法升级此插件"
    }
  }
}

// 官方插件验证
async function checkMarket(url) {
  if (!marketData) {
    await loadMarketData();
  }
  for (var k in marketData) {
    if (marketData[k].url == url) {
      var o = JSON.parse(JSON.stringify(marketData[k]));
      o.id = k;
      return o;
    }
  }
  return false;
}

// 加载官方插件市场数据库
async function loadMarketData() {
  if (marketData) {
    return marketData;
  } else {
    marketData = await (await fetch('/addon_market/list.json')).json();
    return marketData;
  }
}

function getAddonList() {
  return initsto.list()
}
setTimeout(function(){
    if (!window.addon_) {
        var addonruns = [];
        getAddonList().forEach(id => {
          if (!initsto.get(id).disabled) {
            addonruns.push(runAddon(id));
          }
        })
        try {
          Promise.all(addonruns).then(() => {
            setTimeout(() => {
              evn.doevent('allrun', []);
            }, 100)
          })
        } catch (e) { };
      }
})



function enable(id) {
  var o = initsto.get(id);
  o.disabled = false;
  initsto.set(id, o)
}
function disable(id) {
  var o = initsto.get(id);
  o.disabled = true;
  initsto.set(id, o)
}
function getEnable(id) {
  return !initsto.get(id).disabled;
}
var uninstalleventons = {};

module.exports = {
  enable,
  disable,
  loadMarketData,
  installByOfficialMarket,
  installByUrl,
  installByLocal,
  installByDev,
  uninstall,
  runAddon,
  checkUpdate,
  update,
  checkMarket,
  getAddonByUrl,
  getAddonBySessionId,
  getAddonById: getAddonBySessionId,
  getAddonByMarketId,
  getAddonList,
  getEnable,
  _doonun(session, fn) {
    if (util.checkSession(session) && typeof fn == 'function') {
      uninstalleventons[session.id] = fn;
    }
  },
  on: evn.on,
  off: evn.off
}
}),47:(function(_r,module){const { alert, confirm } = _r(9);
const ui=_r(48);
const { xraddon } = _r(50);

function g(core){
  core.upinstallByOfficialMarket=(id)=>{
    return new Promise((r,j)=>{
      if(core.getAddonByMarketId(id)){
        j({
          code:-3,
          msg:"插件已安装"
        })
        return;
      }
      var u=new ui();
      u.show();
      core.loadMarketData().then((res)=>{
        if(!res[id]){
          j({
            code:-2,
            msg:"插件ID不存在"
          });
          return;
        }
        u.ask('要安装插件 “'+res[id].name+'” 吗？（该插件来自官方商店）',(ok)=>{
          if(ok){
            var p=core.installByOfficialMarket(id);
            u.bind(p);
            p.on('done',  (a)=>{
              alert('安装成功');
              r({
                code:0,
                result:a
              })
            });
            p.on('error',(a)=>{
              j({
                code:-2,
                msg:"安装错误",
                err:a
              })
            })
          }else{
            j({
              code:-1,
              msg:"用户取消"
            })
          }
        },{
          img:res[id].icon,
          name:res[id].name,
          version:res[id].version
        })
      })
    });
  }
  core.upinstallByUrl=(url)=>{
    return new Promise((r,j)=>{
      if(core.getAddonByUrl(url)){
        j({
          code:-3,
          msg:"插件已安装"
        })
        return;
      }
      var u=new ui();
          u.show();
      u.ask('要安装来自 '+url+' 的插件吗？',(n)=>{
        if(n){
          var p=core.installByUrl(url);
          u.bind(p);
          p.on('done',  (a)=>{
            alert('安装成功');
            r({
              code:0,
              result:a
            })
          });
          p.on('error',(a)=>{
            j({
              code:-2,
              msg:"安装错误",
              err:a
            })
          })
        }else{
          j({
            code:-1,
            msg:"用户取消"
          })
          u.hide();
          setTimeout(()=>{
            u.destroy()
          },200)
        }
      })
    })
  }
  core.upuninstall=function(id){
    return new Promise((r,j)=>{
      if(!core.getAddonBySessionId(id)){
        j({
          code:-1,
          msg:"没有该插件"
        })
      }else{
        confirm('要卸载 '+core.getAddonBySessionId(id).name+' 吗？',(n)=>{
          if(n){
            core.uninstall(id).then((a)=> {
              if (a.error) {
                alert('卸载出现错误：' + a.msg)
                j({
                  code:-3,
                  msg:"卸载出现错误",
                  err:a
                })
              } else {
                alert('卸载成功，刷新生效');
                r({
                  code:0,
                  result:a
                })
              }
            })
          }else{
            j({
              code:-2,
              msg:"用户取消"
            })
          }
        })
      }
    })
  }
  core.upupdate=(id)=>{
    return new Promise((r,j)=>{
      if(!core.getAddonBySessionId(id)){
        j({
          code:-1,
          msg:"没有该插件"
        })
      }else{
        confirm('要更新 '+core.getAddonBySessionId(id).name+' 吗？',(n)=>{
          if(n){
            core.update(id).then((a)=>{
              if (a.error) {
                alert('更新出现错误：' + a.msg)
                j({
                  code:-3,
                  msg:"更新出现错误",
                  err:a
                })
              } else {
                alert('更新成功，刷新生效');
                r({
                  code:0,
                  result:a
                })
                xraddon(id);
              }
            })
          }else{
            j({
              code:-2,
              msg:"用户取消"
            })
          }
        })
      }
    })
  }
  return core;
}

module.exports=g;

}),48:(function(_r,module){const dialog = _r(10);
const util = _r(5);

var def_addon_icon = window.isExt ? ("chrome-extension://" + window.extid + "/assets/def_addon.png") : "./assets/def_addon.png"

function installui() {
    var n = new dialog({
        content: _r(49).replace('{deficon}', def_addon_icon),
        class: "addon_install_ui",
        clickOtherToClose: false
    });
    this._d = n;
    var d = this._d.getDialogDom();
    util.query(d, '.btns').style.display = 'none';
}

installui.prototype = {
    bind(p) {
        var _ = this;
        var d = this._d.getDialogDom();
        util.query(d, '.msg').innerText = p.statuMsg + '...';
        util.query(d, '.progress .r').style.width = p.progress * 100 + '%';
        if (p.errorCode != -1) {
            util.query(d, '.msg').innerText = p.errorMsg;
            util.query(d, '.progress').className = 'progress error';
            util.query(d, '.btns').style.display = 'block';
            util.query(d, '.btn.l').onclick =
                util.query(d, '.btn.r').onclick = () => {
                    _.hide();
                    setTimeout(() => {
                        _.destroy();
                    }, 200)
                }
        }
        if (p.waiting) {
            var e = p._waitfn;
            var d2 = p._waitd;
            if (d2.meta) {
                util.query(d, '.sth img').src = d2.meta.icon;
                util.query(d, '.sth .name').innerText = d2.meta.name;
                util.query(d, '.sth .version').innerText = '版本：' + d2.meta.version;
            }
            util.query(d, '.msg').innerText = d2.msg;
            util.query(d, '.btns').style.display = 'block';
            util.query(d, '.btn.l').onclick = () => {
                e(false)
            }
            util.query(d, '.btn.r').onclick = () => {
                e(true)
            }
        }
        p.on('status', function (s) {
            util.query(d, '.msg').innerText = s.msg;
        });
        p.on('progress', function (p) {
            util.query(d, '.progress .r').style.width = p * 100 + '%';
        });
        p.on('error', function (e) {
            util.query(d, '.msg').innerText = e.msg;
            util.query(d, '.progress').className = 'progress error';
            util.query(d, '.btns').style.display = 'block';
            util.query(d, '.btn.l').onclick =
                util.query(d, '.btn.r').onclick = () => {
                    _.hide();
                    setTimeout(() => {
                        _.destroy();
                    }, 200)
                }
        });
        p.on('wait', function (e, d2) {
            if (d2.meta) {
                util.query(d, '.sth img').src = d2.meta.icon;
                util.query(d, '.sth .name').innerText = d2.meta.name;
                util.query(d, '.sth .version').innerText = '版本：' + d2.meta.version;
            }
            util.query(d, '.msg').innerText = d2.msg;
            util.query(d, '.btns').style.display = 'block';
            util.query(d, '.btn.l').onclick = () => {
                e(false)
            }
            util.query(d, '.btn.r').onclick = () => {
                e(true)
            }
        });
        p.on('done', function () {
            _.hide();
            setTimeout(() => {
                _.destroy();
            }, 200)
        });
    },
    ask(msg, fn, de = {}) {
        var d = this._d.getDialogDom();
        util.query(d, '.sth img').src = de.img || "assets/def_addon.png";
        util.query(d, '.sth .name').innerText = de.name || "-";
        util.query(d, '.sth .version').innerText = '版本：' + de.version || '-';
        util.query(d, '.msg').innerText = msg;
        util.query(d, '.btns').style.display = 'block';
        util.query(d, '.btn.l').onclick = () => {
            fn(false);
            util.query(d, '.btns').style.display = 'none';
        };
        util.query(d, '.btn.r').onclick = () => {
            fn(true);
            util.query(d, '.btns').style.display = 'none';
        }
    },
    show() {
        this._d.open();
    },
    hide() {
        this._d.close();
    },
    destroy() {
        this._d.destroy();
    }
}

module.exports=installui;
}),49:(function(_r,module){module.exports=`<div class="ma"><div class="sth"><img src="{deficon}" alt="图标"><p class="name">...</p><p class="version">版本：...</p></div><div class="progress"><div class="r"></div></div><div class="msg"></div><div class="btns"><div class="btn l">取消</div><div class="btn r">确定</div></div></div>`;}),50:(function(_r,module){const util = _r(5);
const { addon_dialog_d } = _r(51);
const core=_r(46);
const {confirm,alert}=_r(9)
var def_addon_icon = window.isExt ? ("chrome-extension://" + window.extid + "/assets/def_addon.png") : "./assets/def_addon.png"

var addon_l = util.query(addon_dialog_d, '.content .p.gl ul');
function xraddon(id) {
    addon_l.querySelector(".noaddon").style.display="none";
  var addon = core.getAddonBySessionId(id);
  if (addon.type == 'dev') {
    addon.name = '开发者端口：' + addon.url;
    addon.author = 'dev';
    addon.desc = '开发者端口：' + addon.url;
  }
  var li = util.query(addon_l, 'li[data-id="' + id + '"]');
  if (!li) {
    li = util.element('li');
    li.innerHTML = _r(53).replace(/{deficon}/g, def_addon_icon);
    li.dataset.id = id;
    addon_l.appendChild(li);
    li.onclick = function (e) {
      addon_l.querySelectorAll('li').forEach((li) => {
        li.classList.remove('active');
      })
      this.classList.add('active');
    }
    util.query(li, '.ch_update').onclick = function () {
      st.innerHTML = '检查更新中...';
      var _ = this;
      _.style.display = '';
      core.checkUpdate(id).then(a => {
        if (!a) {
          _.style.display = 'block';
          st.innerHTML = '已是最新版本';
        } else {
          st.innerHTML = '发现新版本';
          util.query(li, '.update').style.display = 'block';
        }
      });
    }

    util.query(li, '.update').onclick = function () {
      st.innerHTML = '更新中...';
      var _ = this;
      _.style.display = '';
      core.update(id).then(r => {
        if (r.error) {
          st.innerHTML = '更新失败:' + r.msg;
          _.style.display = 'block';
        } else {
          xraddon(id);
          st.innerHTML = '更新完成，刷新生效';
          util.query(li, '.ch_update').style.display = 'inline-block';
        }
      });
    }
    util.query(li, '.enable').onclick = function () {
      st.innerHTML = '已启用，刷新生效'
      core.enable(id);
      util.query(li, '.disable').style.display = 'block';
      util.query(li, '.disabled_state').style.display = "none";
      this.style.display = '';
    }
    util.query(li, '.disable').onclick = function () {
      st.innerHTML = '已禁用，刷新生效'
      core.disable(id);
      util.query(li, '.enable').style.display = 'block';
      util.query(li, '.disabled_state').style.display = "";
      this.style.display = '';
    }

    util.query(li, '.uninstall').onclick = function () {
      confirm('你真的要卸载吗？此操作不可恢复！', function (as) {
        if (as) {
          st.innerHTML = '正在卸载...'
          core.uninstall(id).then(r => {
            if (r.error) {
              alert('卸载出现错误：' + r.msg)
            } else {
              alert('卸载成功，刷新生效');
            }
          })
        }
      })
    }
  }
  util.query(li, '.n>img').src = addon.icon || def_addon_icon;
  util.query(li, '.n .ds .name span').innerText = addon.name;
  var ms = util.query(li, '.n .ds .message span', true);
  ms[0].innerText = addon.author || '不详';
  ms[1].innerText = addon.version || '';
  ms[2].innerText = '';
  util.query(li, '.d .desc').innerText = addon.desc || '';
  util.query(li, '.d .website').innerText = addon.website || '';
  var st = util.query(li, '.message span', true)[2];
  if (!addon.type) {
    util.query(li, '.ch_update').style.display = 'block';
  }
  if (addon.disabled) {
    util.query(li, '.enable').style.display = 'block';
    util.query(li, '.disabled_state').style.display = "";
  } else {
    util.query(li, '.disable').style.display = 'block';
    util.query(li, '.disabled_state').style.display = "none";
  }
  if (addon.marketId) {
    util.query(li, '.official_state').style.display = '';
  } else {
    util.query(li, '.official_state').style.display = 'none';
  }

}

core.getAddonList().forEach(a => {
  xraddon(a);
})

core.on('installnew', e => {
  xraddon(e.id);
})
core.on('update', e => {
  xraddon(e.id);
})

core.on('uninstall', e => {
  var li = util.query(addon_l, 'li[data-id="' + e.id + '"]');
  if (li) { li.remove() }
  if(!util.query(addon_l,"li")){
    addon_l.querySelector(".noaddon").style.display="";
  }
})

module.exports={
  xraddon
}
}),51:(function(_r,module){const dialog = _r(10);
const util = _r(5);

var addon_dialog = new dialog({
    content: (_r(52))
        .replace('{{close-btn}}', util.getGoogleIcon('e5cd'))
        .replace('{{search}}', util.getGoogleIcon('e8b6'))
        .replace('{{add-btn}}', util.getGoogleIcon('e145')),
    mobileShowtype: dialog.SHOW_TYPE_FULLSCREEN,
    class: "addon-dialog"
});

var addon_dialog_d = addon_dialog.getDialogDom();
util.query(addon_dialog_d, '.closeBtn').addEventListener('click', () => {
    addon_dialog.close();
});

module.exports={
    addon_dialog,
    addon_dialog_d
}


}),52:(function(_r,module){module.exports=`<div class="addon-bar"><div class="l"><div class="item active" data-p="0">插件管理</div><div class="item" data-p="1">插件市场</div></div><div class="r"><div class="add-btn">{{add-btn}}</div><div class="closeBtn">{{close-btn}}</div></div></div><div class="content"><div class="p gl" style="display:block"><ul><div class="noaddon">还没有安装插件哦~ 点击“插件市场”或“+”安装</div></ul></div><div class="p ma"><div class="addon-search-box"><input type="text" placeholder="搜索插件"> <button>{{search}}</button></div><ul><div class="loading-p"><div class="g"></div></div></ul></div></div>`;}),53:(function(_r,module){module.exports=`<div class="n"><img src="{deficon}" alt="" onerror="this.src='{deficon}'"><div class="ds"><div class="name"><span></span><div class="official_state">官方</div><div class="disabled_state">已禁用</div></div><div class="message"><span></span> <span></span> <span></span></div></div></div><div class="d"><div class="desc"></div><div class="website"></div><div class="controls"><div class="btn ch_update">检查更新</div><div class="btn update">更新</div><div class="btn enable">启用</div><div class="btn disable">禁用</div><div class="btn uninstall" style="display:block">卸载</div></div></div>`;}),54:(function(_r,module){const dialog = _r(10);
const { settingStp } = _r(14);
const util = _r(5);
const { refsay, getNowSay } = _r(44);

  var def='海内存知己，天涯若比邻'; 
  let stp=settingStp;

  if(!stp.usersay){
    stp.usersay=def;
  }

  var sayseditordialog=null;
  function openSaysEditor(){
    if(!sayseditordialog){
      sayseditordialog=new dialog({
        class:"sayseditordialog",
        content:`<h1>修改一言</h1><div class="content"><p><input class="says-input" type="text"/></p></div><div class="footer"><div class="cancel btn">取消</div><button class="ok btn">确定</button></div>`
      })
      // @note 将cancel按钮修改为div，防止表单submit到cancel
      // @edit at 2024/1/30 15:20
      var d=sayseditordialog.getDialogDom();
      d.$('.cancel.btn').onclick=()=>{
        sayseditordialog.close();
      }
      d.$('.ok.btn').onclick=()=>{
        var v=d.$('.says-input').value;
        stp.usersay=v;
        refsay('user');
        sayseditordialog.close();
      }
    }
    setTimeout(()=>{
      var d=sayseditordialog.getDialogDom();
      sayseditordialog.open();
      d.$('.says-input').value=stp.usersay;
    })
  }
  module.exports= {
    key:"user",
    name:"用户自定义",
    callback(){
      return new Promise((resolve,reject)=>{
        resolve({
        say:stp.usersay,
        title:"点击修改"});
      });
    },
    click(){
      openSaysEditor();
    },
    menu:[{
      icon:util.getGoogleIcon('e3c9'),
      title:'修改',
      click(){
        openSaysEditor();
      }
    },{
      icon:util.getGoogleIcon('e14d'),
      title:'复制',
      click(){
        var value=getNowSay().say;
        util.copyText(value);
      }
    }]
  }
}),55:(function(_r,module){const util = _r(5);
const { openSayDetailsDialog, refsay,getNowSay } = _r(44);

// 因tenapi即将关停（https://5ime.cn/tenapi-issue-bankruptcy.html），所以换回hitokoto官方API。
var hitokoto = {
  load(fn) {
    var i_ = 0;
    function g() {
      util.xhr('https://v1.hitokoto.cn/', (res) => {
        fn(JSON.parse(res));
      }, () => {
        i_++;
        if (i_ <= 5) g();
      })
    }
    g();
  },
  cats: {
    a: '动画',
    b: '漫画',
    c: '游戏',
    d: '文学',
    e: '原创',
    f: '来自网络',
    g: '其他',
    h: '影视',
    i: '诗词',
    j: '网易云',
    k: '哲学',
    l: '抖机灵'
  }
}

module.exports = {
  key: "hitokoto",
  name: "随机一言",
  callback() {
    return new Promise((resolve, reject) => {
      hitokoto.load((res) => {
        resolve({
          say: res.hitokoto,
          from: res.from,
          uuid: res.uuid,
          cat: res.type,
          from_who: res.from_who,
          title: "该一言来自" + res.from + "，由" + res.from_who + "上传"
        })
      })
    })
  },
  click() {
    refsay('hitokoto');
  },
  menu: [{
    icon: util.getGoogleIcon('e5d5'),
    title: '刷新',
    click() {
      refsay('hitokoto');
    }
  }, {
    icon: util.getGoogleIcon('e14d'),
    title: '复制',
    click() {
      var value = getNowSay().say;
      util.copyText(value);
    }
  }, {
    icon: util.getGoogleIcon('e88e'),
    title: '一言详情',
    click() {
      var nowSay=getNowSay();
      var c = hitokoto.cats[nowSay.cat];
      openSayDetailsDialog({
        'API': "Hitokoto (hitokoto.cn)",
        '内容': nowSay.say,
        '来源': nowSay.from,
        '上传者': nowSay.from_who,
        '分类': c ? c : '未知',
        'UUID': nowSay.uuid
      })
    }
  }]
}
}),56:(function(_r,module){const {gS} = _r(8);
const util = _r(5);
const { refsay, openSayDetailsDialog,getNowSay } = _r(44);

var stp = gS('jrsc');
var jinrishici = {}, tokenStorageKey = "jinrishici-token";
function request(callback, url) {
  get(url).then(res=>{
    if ("success" === res.status) {
        callback(res)
    } else {
        console.error("今日诗词API加载失败，错误原因：" + res.errMessage)
    }
  }).catch(err=>{
    console.error("今日诗词API加载失败，错误原因：",err);
  })
}
jinrishici.load = (callback) => {
  var key = stp[tokenStorageKey];
  if (key) {
    return request(callback, "https://v2.jinrishici.com/one.json?client=browser-sdk/1.2&X-User-Token=" + encodeURIComponent(key))
  } else {
    return request((res) => {
      stp[tokenStorageKey]=res.token;
      callback(res);
    }, "https://v2.jinrishici.com/one.json?client=browser-sdk/1.2")
  }
}
module.exports={
  key: "jinrishici",
  name: "今日诗词",
  callback() {
    return new Promise((resolve, reject) => {
      jinrishici.load((res) => {
        resolve({
          say: res.data.content,
          author: '(' + res.data.origin.dynasty + ')' + res.data.origin.author,
          p_title: '《' + res.data.origin.title + '》',
          tags: res.data.matchTags.join(' '),
          content: '<br>' + res.data.origin.content.join('<br>'),
          title: "摘自" + res.data.origin.dynasty + "·" + res.data.origin.author + "的《" + res.data.origin.title + '》',
        })
      })
    })
  },
  click() {
    refsay('jinrishici');
  },
  menu: [{
    icon: util.getGoogleIcon('e5d5'),
    title: '刷新',
    click() {
      refsay('jinrishici');
    }
  }, {
    icon: util.getGoogleIcon('e14d'),
    title: '复制',
    click() {
      var value = getNowSay().say;
      util.copyText(value);
    }
  }, {
    icon: util.getGoogleIcon('e88e'),
    title: '诗词详情',
    click() {
      var nowSay=getNowSay();
      openSayDetailsDialog({
        'API': "今日诗词（jinrishici.com）",
        '内容': nowSay.say,
        '作者': nowSay.author,
        '标题': nowSay.p_title,
        '全部内容': nowSay.content
      })
    }
  }]
}
}),57:(function(_r,module){var cardcon = $('.cards');
var topcardcon = $('.top.cards');

/**
 * 
 * @param {object} detail 
 * @param {string} detail.content
 * @param {Boolean} detail.topper
 * @param {number} detail.width
 * @param {number} detail.height
 * @param {string} detail.class?
 * @param {object} detail.offset
 * @param {number} detail.offset.top?
 * @param {number} detail.offset.left?
 * @param {number} detail.offset.bottom?
 * @param {number} detail.offset.right?
 */
var card = function (detail) {
  this.width = detail.width;
  this.height = detail.height;
  this.offset = detail.offset;
  var c_el = el('.card');

  c_el.html(detail.content);
  c_el.css({
    width: detail.width + "px",
    height: detail.height + "px",
  })
  if (detail.class) {
    c_el.addClass(detail.class);
  }

  if (detail.offset) {
    if (typeof detail.offset.top == 'number') {
      c_el.css("top",detail.offset.top + "px");
    } else if (typeof detail.offset.bottom == 'number') {
      c_el.css("bottom",detail.offset.bottom + "px");
    }
    if (typeof detail.offset.left == 'number') {
      c_el.css("left",detail.offset.left + "px");
    } else if (typeof detail.offset.right == 'number') {
      c_el.css("right",detail.offset.right + "px");
    }
  }
  this.el = c_el;
  if (detail.topper) {
    topcardcon.appendChild(c_el);
  } else {
    cardcon.appendChild(c_el);
  }
  this.isShow = false;
}

card.prototype = {
  show(transition) {
    var _ = this;
    _.isShow = true;
    this.el.show();
    if (transition && transition > 0) {
        this.el.css("transition", "all " + transition + "ms");
      this.el.offsetHeight;
      setTimeout(() => {
        _.el.css("transition", "none");
      }, transition);
    }
    this.el.css("opacity", "1");
  },
  hide(transition) {
    var _ = this;
    _.isShow = false;
    if (transition && transition > 0) {
        this.el.css("transition", "all " + transition + "ms");
      setTimeout(() => {
        _.el.css("transition","none");
        _.el.hide();
      }, transition);
    } else {
      this.el.hide();
    }
    this.el.css("opacity", "0");
  },
  destroy() {
    this.el.remove();
  },
  getCardDom() {
    return this.el;
  },
  getOffset() {
    return this.offset;
  },
  getWidth() {
    return this.width;
  },
  getHeight() {
    return this.height;
  },
  setWidth(width) {
    this.width = width;
    this.el.css("width", width + 'px');
  },
  setHeight(height) {
    this.height = height;
    this.el.css("height", height + 'px');
  },
  setOffset(offset, transition) {
    var _ = this,w=window.innerWidth,h=window.innerHeight;
    var old = this.offset;
    if (transition && transition > 0) {
      this.el.css("transition", "all " + transition + "ms");
      var _ck = this.el.getBoundingClientRect();
      if (typeof offset.top == 'number') {
        if (typeof old.bottom == 'number') {
            this.el.css("bottom", (h - offset.top - _ck.height) + "px");
        } else {
          this.el.css("top", offset.top + "px");
        }
      } else if (typeof offset.bottom == 'number') {
        if (typeof old.top == 'number') {
          this.el.css("top",(h - offset.bottom - _ck.height) + "px");
        } else {
          this.el.css("bottom", offset.bottom + "px");
        }
      }
      if (typeof offset.left == 'number') {
        if (typeof old.right == 'number') {
          this.el.css("right",(w - offset.left - _ck.width) + "px");
        } else {
          this.el.css("left", offset.left + "px");
        }
      } else if (typeof offset.right == 'number') {
        if (typeof old.left == 'number') {
          this.el.css("left",(w - offset.right - _ck.width) + "px");
        } else {
          this.el.css("right", offset.right + "px");
        }
      }
      setTimeout(() => {
        _.el.css("transition","none");
        sz.call(_);
      }, transition);
    } else {
      sz.call(_);
    }
    function sz() {
      this.offset = offset;
      this.el.css({
        top:"auto",
        left:"auto",
        right:"auto",
        bottom:"auto"
      })
      if (typeof offset.top == 'number') {
        this.el.css("top",offset.top + "px");
      } else if (typeof offset.bottom == 'number') {
        this.el.css("bottom", offset.bottom + "px");
      }
      if (typeof offset.left == 'number') {
        this.el.css("left", offset.left + "px");
      } else if (typeof offset.right == 'number') {
        this.el.css("right", offset.right + "px");
      }
    }

  }
}
module.exports = card;

}),58:(function(_r,module){// 提供方便的引导卡片构建器
const card = _r(57);

module.exports = {
    /**
     * 创建引导
     * @param {Array<Object>} steps 每步提供text和offset{top,left,bottom,right}
     * @param {Function} cb 引导完成回调
     * @param {Boolean} istopper z-index是否高于dialog，默认false
     */
    create(steps, cb, istopper=false){
        if (steps.length == 0) { cb(); return; }
        var _card = new card({
            content: "<div class=\"guide-text\"></div><div class=\"btn ok\">确定</div>",
            class: "guide-card",
            offset: { top: 0, left: 0 },
            width: 200,
            topper: istopper
        });
        var _cd = _card.getCardDom();
        var j = 0;
        function dostep() {
            _cd.$('.guide-text').html(steps[j].text);
            if (_card.isShow) {
                _card.setOffset(steps[j].offset, 300);
            } else {
                _card.setOffset(steps[j].offset);
                _card.show(300);
            }
        }
        dostep();
        _cd.$('.btn.ok').on('click', () => {
            j++;
            if (j >= steps.length) {
                _card.hide(300);
                cb();
            } else {
                dostep(j);
            }
        })
    }
}
}),59:(function(_r,module){const util = _r(5);

var fcF = el('.fcard-frame');
var fcFclicked = false;
fcF.on('click', () => {
    fcFclicked = true;
})
$('main').append(fcF);

var idmax = 0;
var fcards = [];

function fcard(options) {
    this.content = options.content;
    idmax++;
    this.id = idmax;
    var fel = el('div', {
        class: "fcard" + (options.class ? " " + options.class : "")
    });
    fel.html('<div class="content">' + this.content + '<div>');
    fcF.insertBefore(fel, fcF.firstChild);
    this.el = fel;
    fcards.push(this);
    this.isShow = true;
    mobZDIcon.css("display",'');
}

fcard.prototype = {
    show() {
        this.el.show();
        this.isShow = true;
        mobZDIcon.css("display",'');
    },
    hide() {
        this.el.hide();
        this.isShow = false;
        if (checkAllHide()) {
            mobZDIcon.hide();
        };
    },
    getFCardDom() {
        return this.el
    },
    destroy() {
        this.el.remove();
        this.el = null;
        fcards.splice(fcards.indexOf(this), 1);
        if (checkAllHide()) {
            mobZDIcon.hide();
        };
    }
}

fcard.getFCardById = (id) => {
    for (var i = 0; i < fcards.length; i++) {
        if (fcards[i].id == id) {
            return fcards[i];
        }
    }
    return null;
}


function checkAllHide() {
    for (var i = 0; i < fcards.length; i++) {
        if (fcards[i].isShow) {
            return false;
        }
    }
    return true;
}

var mobZDIcon = el('.fcard-mob-zd');
mobZDIcon.html(util.getGoogleIcon('e5cc'));
mobZDIcon.hide();
$('main').append(mobZDIcon);
mobZDIcon.onclick = function (e) {
    fcFclicked = true;
    fcF.addClass('show')
    this.addClass('hide');
}
document.on('click', () => {
    if (fcFclicked) {
        fcFclicked = false;
        return;
    }
    fcF.removeClass('show');
    mobZDIcon.removeClass('hide');
})



module.exports = fcard;

}),60:(function(_r,module){
var lite = _r(61);
var logo = _r(62);
var color = _r(64);
var theme = _r(65);
var dialogblur = _r(67);
var core=_r(63)

module.exports = {
    setLite: lite.set,
    isLite: lite.get,
    getColor: color.getTheme,
    setColor: color.setTheme,
    setTheme: theme.setTheme,
    addTheme: theme.addTheme,
    removeTheme: theme.removeTheme,
    getTheme: theme.getTheme,
    getThemeDetail: theme.getThemeDetail,
    isTimeLogo() {
        return logo.get() == 'b'
    },
    setTimeLogo() {
        logo.set('b')
    },
    getLogo: logo.get,
    setLogo: logo.set,
    isDialogBlur: dialogblur.get,
    setDialogBlur: dialogblur.set,
    on:core.on, off:core.off,
    waitdotheme: theme.waitdotheme
}
}),61:(function(_r,module){const guidecreator = _r(58);
const link = _r(29);
const { stp } = _r(22);
const { SettingItem, tyGroup } = _r(14);
const util = _r(5);
const bd=document.body;

if(isUd(stp.linkblur))stp.linkblur=true;
var si = new SettingItem({
  index: 2,
  title: "极简模式",
  message: "(Alt+X)隐藏所有图标和链接，点击LOGO显示",
  type: "boolean",
  get() {
    return !!stp.lite;
  },
  callback(v) {
    stp.lite=v;
    d(v);
  }
})
var si2 = new SettingItem({
  index: 3,
  title: "链接页面背景模糊",
  message: "链接页面背景一般模糊显示，关闭后正常显示",
  type: "boolean",
  get() {
    return stp.linkblur;
  },
  callback(v) {
    stp.linkblur=v;
    linkblur(v);
  }
})

tyGroup.addNewItem(si);
tyGroup.addNewItem(si2);
var liteBack = el(".liteback");

liteBack.html(util.getGoogleIcon('e5ce'));
$('main .center').appendChild(liteBack);
liteBack.on('click', () => {
  bd.removeClass('showall');
  bd.addClass('hiden');
})

function d(v) {
  bd.removeClass('hiden');
  bd.removeClass('showall');
  if (v) {
    bd.addClass('lite');
    bd.addClass('hiden');
    si2.show();
    if (!stp.lite_firsted) {
      var imglogopos = $('main .logo .imglogo').getRect();
      guidecreator.create([{
        text: "点击LOGO就可以显示链接和所有图标",
        offset: window.innerWidth > 600 ? {
          top: imglogopos.top,
          left: imglogopos.left + imglogopos.width + 10
        } : {
          top: imglogopos.top + imglogopos.height + 10,
          left: imglogopos.left
        }
      }], function () {
        stp.lite_firsted = true;
      })
    }
  } else {
    bd.removeClass('lite');
    link.cateWidthShiPei();
    si2.hide();
  }
}

function linkblur(v) {
  if (v) {
    $('main').removeClass('noblur');
  } else {
    $('main').addClass('noblur');
  }
}

$("main .center .logo").on('click', () => {
  bd.addClass('showall');
  bd.removeClass('hiden');
  link.cateWidthShiPei();
})

d(stp.lite);
linkblur(stp.linkblur);
module.exports = {
  set(a) {
    a = !!a;
    stp.lite=a;
    d(a);
    si.reGet();
  },
  get() {
    return stp.lite;
  }
};

}),62:(function(_r,module){const { SettingItem, tyGroup } = _r(14);
const util = _r(5);
const { stp } = _r(63);

var logoF = $('main .center .logo');
// timelogo can be removed 
if (!stp.logo) {
  stp.logo='a';
}
var si = new SettingItem({
  index: 4,
  title: "LOGO样式",
  message: "切换LOGO显示的内容",
  type: "select",
  init() {
    return {
      a: "普通LOGO",
      b: "LED时间",
      c: "空"
    }
  },
  get() {
    return stp.logo;
  },
  callback(v) {
    stp.logo = v;
    d(v);
  }
})

var sitime = new SettingItem({
  index: 5,
  title: "显示日期",
  message: "开启后时间LOGO下方将显示日期",
  type: "boolean",
  get() {
    return !!stp.timelogo_x;
  },
  callback(v) {
    stp.timelogo_x = v;
    dtx(v);
  }
})

logoF.$('.timelogo .h').innerHTML = logoF.$('.timelogo .m').innerHTML = createNum() + createNum();
function createNum() {
  var h = '';
  for (var i = 0; i < 7; i++) {
    h += '<div class="num_line a' + i + '"></div>'
  }
  return '<div class="_num">' + h + '</div>'
}

function setNum(_num, num) {
  var m = {
    0: "1110111",
    1: "0010010",
    2: "1011101",
    3: "1011011",
    4: "0111010",
    5: "1101011",
    6: "1101111",
    7: "1010010",
    8: "1111111",
    9: "1111011"
  }
  var f = m[num];
  for (var i = 0; i < 7; i++) {
    var _l = _num.$('.a' + i);
    if (f[i] == '1') {
      _l.addClass('show');
    } else {
      _l.removeClass('show');
    }
  }
}

var isdotime = false;
function doTime() {
  if (isdotime) return;
  isdotime = true;
  var z = () => {
    var da = new Date();
    var h = util.b0(da.getHours()).toString();
    var m = util.b0(da.getMinutes()).toString();
    var hs = logoF.$$('.timelogo .h ._num')
    var ms = logoF.$$('.timelogo .m ._num')
    setNum(hs[0], h[0]);
    if (h[0] == '1') {
      logoF.$('.timelogo .t').style.marginLeft = '-13px';
    } else {
      logoF.$('.timelogo .t').style.marginLeft = '';
    }
    setNum(hs[1], h[1]);
    setNum(ms[0], m[0]);
    setNum(ms[1], m[1]);
  }
  setInterval(z, 1000);
  z();
  var xxxx = el(".xxxx");
  logoF.$('.timelogo').append(xxxx);
  var da = new Date();
  xxxx.innerHTML = da.getFullYear() + ' 年 ' + (da.getMonth() + 1) + ' 月 ' + da.getDate() + ' 日 星期' + '日一二三四五六'[da.getDay()];
  dtx(stp.timelogo_x);
}
function dtx(v) {
  if (!isdotime) return;
  if (v) {
    logoF.$('.timelogo').addClass('showxx');
  } else {
    logoF.$('.timelogo').removeClass('showxx');
  }
}

function d(v) {
  logoF.$('.timelogo').hide();
  logoF.$('.imglogo').hide();
  sitime.hide();
  if (v == 'a') {
    logoF.$('.imglogo').show();
  } else if (v == 'b') {
    logoF.$('.timelogo').show();
    doTime();
    sitime.show();
  }

}
d(stp.logo);

tyGroup.addNewItem(si);
tyGroup.addNewItem(sitime);
if (stp.logo != 'b') {
  sitime.hide();
}

module.exports = {
  set(a) {
    stp.logo=a;
    d(a);
    si.reGet();
  },
  get() {
    return stp.logo;
  }
}
}),63:(function(_r,module){const getEventHandle = _r(4);
const { settingStp } = _r(14);

let stp=settingStp;
var eventHandle=getEventHandle();
var on=eventHandle.on;
var off=eventHandle.off;
var doevent=eventHandle.doevent;

module.exports={
    stp,
    on,
    off,
    doevent
}
}),64:(function(_r,module){const { SettingItem, tyGroup } = _r(14);
const toast = _r(6);
const { on, off,stp,doevent } = _r(63);
const bd=document.body;
var n = null;
if (!stp.theme) {
  stp.theme="a";
}
var si = new SettingItem({
  index: 1,
  title: "主题颜色",
  type: "select",
  message: '',
  get() {
    return stp.theme;
  },
  callback(v) {
    stp.theme=v;
    checkTheme(v);
  },
  init() {
    return {
      a: '浅色', b: '深色', c: '跟随时间', d: "跟随系统"
    }
  }
});

tyGroup.addNewItem(si);

var _g = 3;
function checkTheme(v) {
  if (_g != 3) { _g = false; }
  if (v == 'b') {
    bd.addClass('dark');
    doevent('colorchange', ['dark']);
    n = 'dark';
  } else if (v == 'a') {
    bd.removeClass('dark');
    doevent('colorchange', ['light']);
    n = 'light'
  } else if (v == 'c') {
    if (new Date().getHours() >= 18 || new Date().getHours() < 6) {
      bd.addClass('dark');
      doevent('colorchange', ['dark']);
      n = 'dark';
    } else {
      bd.removeClass('dark');
      doevent('colorchange', ['light']);
      n = 'light'
    }
  } else if (v == 'd') {
    if (window.matchMedia) {
      if (_g == 3) {
        _g = true;
        listenTheme();
      } else {
        _g = true;
      }
    } else {
      toast.show('你的浏览器不支持此功能');
    }
  }
}
function listenTheme() {
  var d = window.matchMedia('(prefers-color-scheme: dark)');
  d.matches ? bd.addClass('dark') : bd.removeClass('dark');
  d.addEventListener('change', e => {
    if (e.matches) {
      bd.addClass('dark');
      doevent('colorchange', ['dark']);
      n = 'dark';
    } else {
      bd.removeClass('dark');
      doevent('colorchange', ['light']);
      n = 'light'
    }
  });
}

checkTheme(stp.theme);

function getTheme() {
  return n;
}
module.exports = {
  setTheme(v) {
    stp.theme=v;
    checkTheme(v);
    si.reGet();
  },
  on,
  off,
  getTheme,
}
}),65:(function(_r,module){const { alert } = _r(9);
const { SettingItem, tyGroup } = _r(14);
const { stp,doevent } = _r(63);
const addon =_r(45);
const dialog = _r(10);
const util = _r(5);
const bd=document.body;
if (!stp.themea) {
    stp.themea = 'def';
}

var ys = ['dark', 't-dark', 't-light', 'dialogblur', 'lite', 'hiden', 'showall'];
var themesd = {
    'def': {
        name:"默认主题",
        color:['#fff','#333']
    },
    'defcolor':{
        name:"默认颜色",
        type:'color',
        color:['#fff','#333']
    }
};

var themes={
    'def':'默认主题',
    defcolor:"默认颜色"
}

var si = new SettingItem({
    index: 0,
    title: "主题",
    type: "null",
    message: '',
    callback() {
        selectthemeDia.open();
    }
});

var selectthemeDia=new dialog({
    content:_r(66).replace('{x}',util.getGoogleIcon('e5cd')),
    class:'theme-dialog def-size',
    mobileShowtype:dialog.SHOW_TYPE_FULLSCREEN,
})

var std=selectthemeDia.getDialogDom();
std.$('.closeBtn').onclick=function(){
    selectthemeDia.close();
}

tyGroup.addNewItem(si);
let nowtheme='def';

function doTheme(f,justadd) {
    if(justadd){
        bd.addClass(f);      
        doevent('dotheme', []);
        return;
    }
    if(!f){
        f='def';
    }
    nowtheme=f;
    let fs=f.split('|');
    let not=0;
    for(let i=0;i<fs.length;i++){
        if(themes[fs[i]]==undefined){
            not++;
        }
    }
    if(not!=0){
        return not;
    }
    bd.className.split(' ').forEach((a) => {
        if(!a.trim())return;
        if (!ys.includes(a)) {
            bd.removeClass(a);
        }
    })
    console.log(fs);
    fs.forEach((a) => {
        bd.addClass(a);        
    })
    doevent('dotheme', []);
    if (!isdotheme) {
        isdotheme = true;
        wf.forEach(f => f());
    }
    return true;
}
var isdotheme = false, wf = [];
function waitdotheme(f) {
    if (isdotheme) {
        f();
    } else {
        wf.push(f);
    }
}

function addTheme(f, n,detail={}) {
    if(f.indexOf('|')!=-1){
        console.error('主题名称不能包含"|"符号');
        return;
    }
    themes[f] = n;
    detail.name=n;
    themesd[f]=detail;
    si.reInit();
    let glsit=stp.themea.split('|');
    if (wait && glsit.indexOf(f) != -1) {
        wait--;
        doTheme(f,true);
    }

    if(isinitselect){
        gtitm(f);
    }
}

function removeTheme(f) {
    if (f == 'def') { return }
    delete themes[f]
    if (stp.themea == f) {
        stp.themea = 'def';
        si.reGet();
    }
    si.reInit();
}

function setTheme(f) {
    if (!themes[f]) {
        return;
    }
    stp.themea = f;
    doTheme(f);
    si.reGet();
}

var wait = doTheme(stp.themea);
wait=typeof wait=='number'?wait:0;
var isinitselect=false;

function gtitm(nm){
    let type=themesd[nm].type||'global';
    let nf=el('.theme-item',{
        'data-id':nm
    })
    nf.text(themesd[nm].name);
    if(type=='global'){
        std.$('.ztselects.ty').append(nf);
    }else if(type=='color'){
        std.$('.ztselects.co').append(nf);
    }else if(type=='structure'){
        std.$('.ztselects.st').append(nf);
    }

    nf.onclick=function(){
        let type=this.parentNode.classList[1];
        if(type=='ty'){
            std.$$('.ztselects .active').removeClass('active');
            this.addClass('active');
        }else if(type=='co'){
            std.$$('.ztselects.ty .active').removeClass('active');
            std.$$('.ztselects.co .active').removeClass('active');
            this.addClass('active');
        }else if(type=='st'){
            std.$$('.ztselects.ty .active').removeClass('active');
            if(this.hasClass('active')){
                this.removeClass('active');
            }else{
                this.addClass('active');
            }
        }

        let f=std.$$('.theme-item.active');
        f=toRealArray(f);
        f=f.map(a=>a.attr('data-id')).join('|');
        stp.themea=f;
        console.log(f);
        doTheme(f);

    }
}
addon.on('allrun', () => {
    if (wait!=0) {
        stp.themea='def';
        doTheme('def');
        alert('您的主题由于插件缺失无法显示，已为您切换为默认。');
    }

    for(var nm in themes){
        gtitm(nm);
    }

    let acs=stp.themea.split('|');
    for(ac of acs){
        std.$('[data-id="'+ac+'"]').addClass('active');
    }
    isinitselect=true;
})


module.exports = {
    addTheme,
    removeTheme,
    setTheme,
    waitdotheme,
    getTheme:()=>nowtheme,
    getThemeDetail:()=>{
        let fs=nowtheme.split('|');
        console.log(fs);
        for(let i=0;i<fs.length;i++){
            if(!themesd[fs[i]])continue;
            if(themesd[fs[i]].type=='global'||themesd[fs[i]].type=='color'){
                return {
                    themes:fs.map(a=>themesd[a]),
                    color:themesd[fs[i]].color
                };
            }
        }

        return {
            themes:fs.map(a=>themesd[a])
        }
    }
}

}),66:(function(_r,module){module.exports=`<div class="actionbar"><h1>页面主题设置</h1><div class="closeBtn">{x}</div></div><div class="scroll_con"><h2>通用主题</h2><div class="ztselects ty"></div><h2>结构主题</h2><div class="ztselects st"></div><h2>颜色主题</h2><div class="ztselects co"></div></div>`;}),67:(function(_r,module){const { SettingItem, tyGroup } = _r(14);
const { stp } = _r(63);
const bd=document.body;
var si = new SettingItem({
  index: 3,
  title: "毛玻璃效果",
  message: "为所有内容开启毛玻璃效果，可能会影响性能。",
  type: "boolean",
  get() {
    return !!stp.dialogblur;
  },
  callback(v) {
    stp.dialogblur = v;
    d(v);
  }
})

tyGroup.addNewItem(si);

function d(v) {
  if (v) {
    bd.addClass('dialogblur');
  } else {
    bd.removeClass('dialogblur');
  }
}

d(stp.dialogblur);
module.exports = {
  set(a) {
    a = !!a;
    stp.dialogblur=a;
    d(a);
    si.reGet();
  },
  get() {
    return stp.dialogblur;
  }
};
}),68:(function(_r,module){const { _setDrawerList, dodrawer ,pushBgDrawer, getbg, setbg, on, off, drawbg, initsto} = _r(69);
var defDraw = _r(70);
var defDrawer = defDraw.drawer;
_setDrawerList([defDrawer]);
dodrawer(defDrawer);

drawbg(initsto.get('bg'));

module.exports={
  neizhiDraw: {
    img: defDraw.draws.img,
    video: defDraw.draws.video,
    color: defDraw.draws.color
  },
  pushBgDrawer,
  getbg,
  setbg,
  on,
  off,
}
}),69:(function(_r,module){const dialog = _r(10);
const {alert, confirm}=_r(9)
const getEventHandle = _r(4);
const { SettingGroup, SettingItem, mainSetting } = _r(14);
const { storage } = _r(8);
const util = _r(5);
const mainmenu=_r(13);
const addon =_r(45);

let defbg={
    type:"default",
    data:{
        type:"api",
        api:"theme"
    }
}

var backgroundsg = new SettingGroup({
  title: "背景",
  index: 3
});

var backgroundsi = new SettingItem({
  title: "背景设置",
  message: "点击设置背景",
  index: 0,
  type: 'null',
  callback: opendia
})

mainSetting.addNewGroup(backgroundsg);
backgroundsg.addNewItem(backgroundsi);


var eventHandle = getEventHandle();
var on = eventHandle.on;
var off = eventHandle.off;
var doevent = eventHandle.doevent;
var bgf = util.element('div', {
  class: "bgf"
});
util.query(document, 'body').appendChild(bgf);
var initsto = storage('background', {
  sync: true,
  get() {
    return new Promise((resolve, reject) => {
      var a = initsto.getAll();
      delete a.upload;
      if (a.bg.type != 'default') {
        a.requireAddon = addon.getAddonBySessionId(a.bg.type).url;
      } else {
        if (a.bg.data.type == 'userbg' && a.userbg.useidb) {
          a.bg = cloneObj(defbg);
        }
      }
      if (a.userbg && a.userbg.useidb) {
        delete a.userbg;
        alert('不支持同步用户上传的背景', function () {
          resolve(a);
        })
      } else {
        resolve(a);
      }
    });
  },
  rewrite(ast, k, a) {
    return new Promise((resolve, reject) => {
      if (a.requireAddon) {
        var raddon = addon.getAddonByUrl(a.requireAddon);
        if (raddon) {
          a.bg.type = raddon.session.id;
          ast[k] = a;
          resolve();
        } else {
          confirm('该背景数据需要安装插件以同步，是否安装？', (v) => {
            if (v) {
              var p = addon.installAddon(a.requireAddon);
              p.on('error', e => {
                alert('插件安装失败，同步取消', () => {
                  resolve();
                })
              });
              p.on('wait', r => {
                r(true);
              });
              p.on('done', e => {
                a.bg.type = e.id;
                ast[k] = a;
                resolve();
              });

            } else {
              alert('已取消背景同步', () => {
                resolve();
              })
            }
          })
        }
      } else {
        ast[k] = a;
        resolve();
      }
    })

  },
  title: "背景",
  desc: "QUIK起始页背景相关配置"
});
var tabindexCount = 0;

// 避免缓存（用于图片API）
function urlnocache(url) {
  return url + (url.indexOf('?') > -1 ? '&' : '?') + 't=' + new Date().getTime();
}


var bg_set_d, tab_con, scroll_con, d;

function drawDialog() {
  // 背景设置对话框
  bg_set_d = new dialog({
    content: `<div class="actionbar"><h1>背景设置</h1><div class="closeBtn">${util.getGoogleIcon('e5cd')}</div></div><div class="tab_con"></div><div class="scroll_con"></div>`,
    class: "bg_d auto-size",
    mobileShowtype: dialog.SHOW_TYPE_FULLSCREEN
  });

  // 背景设置对话框Dom
  d = bg_set_d.getDialogDom();

  // 关闭按钮
  util.query(d, '.closeBtn').onclick = () => {
    bg_set_d.close();
  }

  // 背景设置对话框Tab
  tab_con = util.query(d, 'div.tab_con');

  // 背景设置对话框内容
  scroll_con = util.query(d, 'div.scroll_con');
  drawers.forEach((drawer) => {
    dodrawer(drawer);
  })
}

// 初始化用户存储
util.initSet(initsto, 'bg', defbg);


var drawers = [];

function pushBgTab(item) {
  var tab = item.tab; // tab标题

  // 一个tab标签
  var tabitem = util.element('div', {
    class: 'tabitem',
    'data-tab': tabindexCount.toString() //TabID，方便控制
  });
  tab_con.appendChild(tabitem);
  tabitem.innerHTML = tab;
  // 点击时跳转至该Tab
  tabitem.onclick = function () {
    activeTab(this.getAttribute('data-tab'));
  }

  // 内容
  var scrollitem = util.element('div', {
    class: 'scrollitem',
    'data-tab': tabindexCount.toString() //对应TabID，方便控制
  });
  scroll_con.appendChild(scrollitem);
  scrollitem.innerHTML = item.content;
  tabindexCount++;
  return scrollitem;
}

// activeTab
function activeTab(i) {
  util.query(d, '.tabitem', true).forEach(t => {
    t.classList.remove('active');
  });
  util.query(d, '.scrollitem', true).forEach(t => {
    t.style.display = '';
  });
  util.query(d, '.tabitem[data-tab="' + i + '"]').classList.add('active');
  util.query(d, '.scrollitem[data-tab="' + i + '"]').style.display = 'block';
}


var idmax = 0;
function pushBgDrawer(drawer) {
  var session = drawer.session;
  try {
    if (!util.checkSession(session)) {
      throw 'session error';
    }
  } catch (e) {
    throw new Error('背景Drawer注册失败，Session校验错误。')
  }
  var bgdrawerid = 'bgdrawer-' + idmax;
  idmax++;
  drawer.type = bgdrawerid;
  drawers.push(drawer);
  dodrawer(drawer);
  onbgdrawersign(drawer);
  return bgdrawerid;
}

function dodrawer(drawer) {
  if (bg_set_d) {
    drawer.init({
      bgf: bgf,
      pushBgTab: pushBgTab,
      setbg: setbg,
      type: drawer.type
    });
  }

}

var waitdraw = null;
function onbgdrawersign(drawer) {
  if (waitdraw) {
    if (drawer.type == waitdraw.type) {
      drawer.draw({
        bgf: bgf, data: waitdraw.data
      })
      waitdraw = null;
    }
  }
}

addon.on('allrun', () => {
  if (waitdraw) {
    waitdraw = null;
    initsto.set('bg', defbg)
    drawbg(initsto.get('bg'));
    alert('您的背景数据由于插件缺失无法显示，已为您切换为默认。')
  }
})

var nowdraw = null;
function drawbg(data) {
  for (var i = 0; i < drawers.length; i++) {
    if (data.type == drawers[i].type) {
      if (nowdraw && nowdraw.type != drawers[i].type) {
        nowdraw.cancel({ bgf: bgf });
        nowdraw = drawers[i];
      }
      drawers[i].draw({
        bgf: bgf, data: data.data
      })
      return;
    }
  }
  waitdraw = data;
}

function setbg(data) {
  initsto.set('bg', data);
  drawbg(data);
  doevent('change', [data]);
}




function getbg() {
  return initsto.get('bg');
}

mainmenu.pushMenu({
  icon: util.getGoogleIcon('e1bc'),
  title: '背景设置',
  click: opendia
}, mainmenu.MAIN_MENU_TOP)


function opendia() {
  if (!bg_set_d) {
    drawDialog();
    setTimeout(() => {
      bg_set_d.open();
      //开始activeTab0
      activeTab('0');
    }, 10)
  } else {
    bg_set_d.open();
  }
}

module.exports= {
  pushBgDrawer,
  getbg,
  setbg,
  on,
  off,
  
  _setDrawerList(d){
    drawers=d;
  },
  dodrawer,
  initsto,
  urlnocache,
  backgroundsg,
  drawbg,
  getd:()=>d
}

}),70:(function(_r,module){var acgbg = _r(71);
var fjbg = _r(72);
const card = _r(57);
const { icon } = _r(7);
const util = _r(5);
const { initsto, getd } = _r(69);
var { ImgOrVideoSi, checkBgCoverStyle } = _r(73);
var {
  getVideoCaptrue,
  getUserUploadUrl,
  hasUploadedImg,
  uploadIov,
  _listensetbg,
  _listenseti,
  setl
} = _r(74);

var { colorChange, _listensetbg2,init } = _r(76);
const custom = _r(60);
const contextMenu = _r(12);

var tab1, setbg, tab2, tab3;
_listensetbg(function (r) {
  setbg(r);
})
_listensetbg2(function (r) {
  setbg(r);
})
_listenseti(function(i){
  util.query(getd(), '.zdy .left img').src = i;
})


var neizhiImg;
if (window.isExt) {
  neizhiImg = _r(78)
  for (var i = 0; i < neizhiImg.length; i++) {
    for (var k in neizhiImg[i]) {
      neizhiImg[i][k] = 'chrome-extension://' + window.extid + '/assets/' + neizhiImg[i][k]
    }
  }
} else {
  neizhiImg = _r(79);
}

let bgczMenuLists=[
    {
        icon:util.getGoogleIcon('e86a'),
        title:'刷新',
        click: function () {
            var a = $('.bgf .full img');
            if (a) {
                a.style.opacity = '0';
            }
            var _ = this;
            setTimeout(() => {
                refreshFn.call(_);
            }, 300)
        }
    },
    {
        icon:util.getGoogleIcon('f090'),
        title:'下载',
        click: function () {
            window.open($(".bgf img").src);
        }
    },
    {
        icon:util.getGoogleIcon('e8f4', { type: 'fill' }),
        title:'查看壁纸',
        click: function () {
            $('main').style.opacity = 0;
            setTimeout(() => {
                $('main').hide();
            }, 300)
            $('.bgf .cover').style.opacity = 0;
            document.on('click', eyefy)
        }
    }
];
let bgczMenu=new contextMenu({
    list: [],
    offset:{
        right:5,
        bottom:50
    }
})

let bgczIcon=new icon({
    content: util.getGoogleIcon('e5d4'),
    offset: "br",
    important: true
});
bgczIcon.getIcon().onclick = function (e) {
    e.stopPropagation();
    bgczMenu.show();
}

var infoIcon = new icon({
  content: util.getGoogleIcon('e88e'),
  offset: "br",
  important: true
});
var infoCard = new card({
  content: `<div class="copyright">...</div>
      <div class="second">...</div>
      <div class="title">...</div>
      <a class="link" target="_blank" href="https://www.bing.com/">去Bing搜索</a>`,
  offset: {
    right: 5,
    bottom: 50
  },
  class: "bing_info"
});
infoIcon.getIcon().onclick = () => {
  if (infoCard.isShow) {
    infoCard.hide(400);
  } else {
    infoCard.show(400);
    getBingWallPaperInfo(function (r) {
      var infoCardF = infoCard.getCardDom();
      infoCardF.$('.copyright').text(r.copyright);
      infoCardF.$('.second').text(r.second_copyright);
      infoCardF.$('.title').text(r.title);
      infoCardF.$('.link').href = r.link;
    })
  }

}
infoIcon.getIcon().title = '显示壁纸详情';

let inclick=false;
function eyefy() {
    if(!inclick){
        inclick=true;
        return;
    }
  $('main').show();
  setTimeout(() => {
    $('main').style.opacity = 1;
  }, 10)
  $('.bgf .cover').style.opacity = '';
  document.off('click', eyefy)
  inclick=false;
}

function rnMenu(t){
    let n=[];
    for(let i=0;i<t.length;i++){
        n.push(bgczMenuLists[t[i]]);
    }
    console.log(n);
    bgczMenu.setList(n);
}


//时间的颜色API
function getNowColor() {
  var date = new Date();
  return {
    light: `rgb(${256 - date.getHours()},${256 - date.getMinutes()},${256 - date.getSeconds()})`,
    dark: `rgb(${date.getHours()},${date.getMinutes()},${date.getSeconds()})`
  }

}

var infocache;
function getBingWallPaperInfo(fn) {
  if (infocache) {
    fn(infocache);
  } else {
    get('https://bing.shangzhenyang.com/api/json').then(r => {
      var a = r.images[0];
      var b = a.copyright.split('(');
      b[1] = '(' + b[1];
      infocache = {
        copyright: b[0],
        second_copyright: b[1],
        link: a.copyrightlink,
        title: a.title
      };
      fn(infocache)
    }).catch(() => {
      fn({
        copyright: "加载失败",
        second_copyright: "(© Bing)",
        link: "https://www.bing.com/",
        title: "点击前往必应"
      })
    })
  }
}


// dot-timeb
// @note 这里需要一个定时器用于api背景 时间的颜色
var timeb = null;

let themedo=false;

function docthem(){
    console.log(custom.getThemeDetail());
    let g=custom.getThemeDetail().color||[]
    console.log(g);
    draws.color($('.bgf'),{
        light:g[0]||'#fff',
        dark:g[1]||'#333'
    })
}

custom.on('dotheme',function(){
    if(themedo)
    docthem();
})


var draws = {
  img(bgf, data) {
    if((!data.url)&&typeof data.index=='undefined')return;
    bgf.html('<div class="img-sp full"><div class="cover"></div><img src="' + (data.url || neizhiImg[data.index].img) + '"/></div>');
    bgf.querySelector('img').onload = function () {
      this.style.opacity = '1';
    }
    checkBgCoverStyle();
    ImgOrVideoSi.show();
    bgczIcon.show();
    rnMenu([2]);
  },
  video(bgf, data) {
    if((!data.url)&&typeof data.index=='undefined')return;
    bgf.html('<div class="video-sp full"><div class="cover"></div><video src="" muted loop></video></div>')
    bgf.$('.video-sp video').src = data.url || neizhiImg[data.index].img;
    bgf.$('.video-sp video').oncanplay = function () {
      this.play();
      this.style.opacity = '1';
    }
    checkBgCoverStyle();
    ImgOrVideoSi.show();
    bgczIcon.show();
    rnMenu([2]);
  },
  color(bgf, data) {
    bgf.html('<div class="color-sp full"></div>')
    if (!document.head.$('style.colorSpControl')) {
      var style = el('style.colorSpControl');
      document.head.appendChild(style);
    }
    document.head.$('style.colorSpControl').html(`.color-sp{background-color:${data.light};}body.dark .color-sp{background-color:${data.dark};}`);
  },
  api: function api(bgf, data) {
    function showAcgOrFj(a) {
        bgczIcon.show();
        rnMenu([0,2]);
      a.getImg((d) => {
        draws.img(bgf, {
          url: d.url
        });
        if (d.candownload) {
            rnMenu([0,1,2]);
        }else{
            rnMenu([0,2]);
        }
      })
      refreshFn = () => {
        a.getImg((d) => {
          draws.img(bgf, {
            url: d.url
          });
          if (d.candownload) {
            rnMenu([0,1,2]);
          }else{
            rnMenu([0,2]);
          }
        })
      }
    }
    switch (data.api) {
      case 'acg':
        showAcgOrFj(acgbg);
        break;
      case 'fj':
        showAcgOrFj(fjbg);
        break;
      case 'bing':
        bgczIcon.show();
        infoIcon.show();
        draws.img(bgf, {
          url: "https://bing.shangzhenyang.com/api/1080p"
        });
        rnMenu([1,2])
        break;
      case 'time':
        // at ../defaultDrawer.js dot-timeb
        timeb = setInterval(() => {
          draws.color(bgf, getNowColor());
        }, 200)
        break;
      case 'theme':
        themedo=true;
        docthem();
        break;
    }
  },
  userbg(bgf, data) {
    // 图片或视频
    var a = initsto.get('userbg');
    if (!a) return;

    document.body.addClass('t-dark');
    if (a.type == 'video') {
      var b = a.useidb;
      if (b) {
        initsto.get('upload', true, (blob) => {
          draws.video(bgf, {
            url: URL.createObjectURL(blob)
          })
        })
      } else {
        draws.video(bgf, {
          url: a.url
        })
      }
    } else if (a.type == 'image') {
      var b = a.useidb;
      if (b) {
        initsto.get('upload', true, (blob) => {
          draws.img(bgf, {
            url: URL.createObjectURL(blob)
          })
        })
      } else {
        draws.img(bgf, {
          url: a.url
        })
      }
    }
  },
  zdy(bgf, data) {
    if (!bgf.$('.zdy-sp')) {
      bgf.html('<div class="zdy-sp full"></div>');
    }
    if (!document.head.$('style.zdySpControl')) {
      var style = el('style.zdySpControl');
      document.head.appendChild(style);
    }
    document.head.$('style.zdySpControl').html(`.zdy-sp{background:${data.light};}body.dark .zdy-sp{background:${data.dark};}`);
  }
}

function dol(){
  tab1.$('.noBg').hide()
    tab1.$('.hasBg').show()
    tab1.$('.zdy .editbtn').show()
}

setl(dol);


function selectbgitem(data) {
  tab1.$$('.bgitem').forEach(it => {
    it.removeClass('selected');
  })
  tab2.$$('.bgitem').forEach(it => {
    it.removeClass('selected');
  })
  if (data.type == 'default') {
    if (data.data.type == 'img') {
      try { tab1.$(`.neizhi .bgitem[data-id="${data.data.index}"]`).addClass('selected'); } catch (e) { }
    } else if (data.data.type == 'userbg') {
      tab1.$('.zdy .bgitem').addClass('selected');
    } else if (data.data.type == 'api') {
      if (data.data.api == 'theme'||data.data.api=='time') {
        tab2.$(`.api .bgitem[data-api="${data.data.api}"]`).addClass('selected');
      } else {
        tab1.$(`.api .bgitem[data-api="${data.data.api}"]`).addClass('selected');
      }
    } else if (data.data.type == 'color') {
      tab2.$('.zdy .bgitem').addClass('selected');
    }
  }
}


function _reset() {
  document.body.removeClass('t-dark');
  refreshFn = () => { }
  clearInterval(timeb);
  ImgOrVideoSi.hide();
  infoIcon.hide();
  themedo=false;
  infoCard.hide();
  bgczIcon.hide();
}

module.exports = {
  drawer: {
    type: "default",
    init(e) {
      setbg = e.setbg;
      // pushTab 图片/视频
      tab1 = e.pushBgTab({
        tab: "图片/视频",
        content: _r(80)
      });

      if (!hasUploadedImg()) {
        tab1.$('.hasBg').hide()
        tab1.$('.zdy .editbtn').hide()
      } else {
        tab1.$('.noBg').hide()
        getUserUploadUrl((url) => {
          tab1.$('.zdy .left img').src = url;
        })
      }
      tab1.$('.zdy .left').on('click', () => {
        if (hasUploadedImg()) {
          e.setbg({
            type: e.type,
            data: {
              type: "userbg"
            }
          })
        } else {
          uploadIov();
        }
      })
      tab1.$('.zdy .editbtn').on('click', () => {
        uploadIov(true);
      });

      // 内置图片
      var u = tab1.$('.neizhi .unit-content');
      var _ = this;
      neizhiImg.forEach((im, id) => {
        var bgitem = util.element('div', {
          class: "bgitem def",
          'data-id': id,
        });
        bgitem.html('<div class="left"><img data-src="' + im.thumbnail + '" loading="lazy"/></div>');
        u.appendChild(bgitem);
        bgitem.$('.left').onclick = () => {
          e.setbg({
            type: e.type,
            data: {
              type: "img",
              index: parseInt(bgitem.attr('data-id'))
            }
          })
        }
      });

      var se = tab1.$('.u-se');
      se.onclick = () => {
        ImgOrVideoSi.callback();
      }

      // API
      tab1.$$('.api.unit-item .left').forEach(l => {
        l.on('click', () => {
          e.setbg({
            type: e.type,
            data: {
              type: "api",
              api: l.parent().attr('data-api')
            }
          })
        });
      });


      // pushTab 纯色
      tab2 = e.pushBgTab({
        tab: "纯色",
        content: _r(81)
      });
      init(tab2);
      var c = initsto.get('usercolor');
      tab2.$('.zdy .color-left').style.backgroundColor = c.light;
      tab2.$('.zdy .color-right').style.backgroundColor = c.dark;
      tab2.$('.zdy .left').onclick = () => {
        var c = initsto.get('usercolor');
        e.setbg({
          type: e.type,
          data: {
            type: "color",
            light: c.light,
            dark: c.dark
          }
        })
      }
      tab2.$('.zdy .btn').onclick = () => {
        colorChange();
      }
      var cd = getNowColor();
      tab2.$$('.api .color-left')[1].style.backgroundColor = cd.light;
      tab2.$$('.api .color-right')[1].style.backgroundColor = cd.dark;
      var ce=custom.getThemeDetail().color||[];
      tab2.$('.api .color-left').style.backgroundColor=ce[0]||'#fff';
      tab2.$('.api .color-right').style.backgroundColor=ce[1]||'#333';
      tab2.$$('.api .left').forEach(El=>{
        El.onclick = function () {
            e.setbg({
              type: e.type,
              data: {
                type: "api",
                api: this.parent().attr('data-api')
              }
            })
        }
      });

      // pushTab 自定义
      tab3 = e.pushBgTab({
        tab: "自定义",
        content: _r(82)
      });
      var _l_ = initsto.get('custombglight');
      var _d_ = initsto.get('custombgdark');
      tab3.$('.gjzdytlight').value = _l_ ? _l_ : '';
      tab3.$('.gjzdytdark').value = _d_ ? _d_ : '';
      tab3.$('.gjzdysetbtn').onclick = () => {
        initsto.set('custombglight', tab3.$('.gjzdytlight').value);
        initsto.set('custombgdark', tab3.$('.gjzdytdark').value);
        e.setbg({
          type: e.type,
          data: {
            type: 'zdy',
            dark: tab3.$('.gjzdytdark').value,
            light: tab3.$('.gjzdytlight').value
          }
        })
        quik.toast.show('设置成功')
      }
      setTimeout(() => {
        selectbgitem(quik.background.getbg());
        quik.background.on('change', selectbgitem)
      });
    },
    cancel(n) {
      n.bgf.html('');
      _reset();
    },
    draw(n) {
      var bgf = n.bgf;
      var data = n.data;
      _reset();
      draws[data.type](bgf, data);
    }
  }, draws
}
}),71:(function(_r,module){const util = _r(5);

function ce(cb) {
  var u = '';
  if (window.innerWidth <= 500) {
    u = 'https://esa-img.mint.ac.cn/i/pe/img' + (parseInt(Math.random() * 3095) + 1) + '.webp'
  } else {
    u = 'https://esa-img.mint.ac.cn/i/pc/img' + (parseInt(Math.random() * 696) + 1) + '.webp'
  }
  util.loadimg(u, ok => {
    if (ok) {
      cb({
        url: u,
        candownload: true
      });
    } else {
      u = "https://loliapi.com/acg/?_=" + Date.now();
      util.loadimg(u, () => {
        cb({
          url: u,
          candoanload: false
        })
      })
    }
  })
}

module.exports = {
  getImg: ce
}
}),72:(function(_r,module){
module.exports = {
  getImg(cb) {
    cb({
      url: 'https://tu.ltyuanfang.cn/api/fengjing.php?_=' + Date.now(),
      candoanload: false
    })
  }
}
}),73:(function(_r,module){const { SettingItem, Setting, SettingGroup } = _r(14);
const util = _r(5);
const { initsto, backgroundsg } = _r(69);
const custom =_r(60);
util.initSet(initsto, 'ivsetting', {
  mb: 50,
  isbr: false,
  br: 6,
  th: 1
})
var ImgOrVideoSi = new SettingItem({
  title: "背景图片/视频显示设置",
  message: "设置背景图片/视频显示的蒙版和模糊等",
  type: "null",
  callback() {
    ImgOrVideoSe.open();
  }
});

backgroundsg.addNewItem(ImgOrVideoSi);

var ImgOrVideoSe = new Setting({
  title: "背景图片/视频显示设置",
});

var ivsg = new SettingGroup({
  title: "通用",
  index: 0
});

var ivse_th = new SettingItem({
  title: "背景蒙版颜色主题",
  index: 0,
  type: "select",
  init() {
    return {
      0: "跟随主题",
      1: "黑色",
      2: "白色"
    }
  },
  get() {
    var k = initsto.get('ivsetting').th;
    if (typeof k == 'undefined') {
      return 1;
    }
    return k;
  },
  callback(v) {
    var o = initsto.get('ivsetting');
    o.th = parseInt(v);
    initsto.set('ivsetting', o);
    r();
  }
})

var ivse_mb = new SettingItem({
  title: "背景蒙版浓度",
  index: 1,
  type: "range",
  init() {
    return [0, 90]
  },
  get() {
    return initsto.get('ivsetting').mb;
  },
  callback(v) {
    var o = initsto.get('ivsetting');
    o.mb = v;
    initsto.set('ivsetting', o);
    r();
  }
})

var ivse_isbr = new SettingItem({
  title: "背景模糊",
  message: "可能会影响性能",
  type: "boolean",
  index: 2,
  get() {
    return initsto.get('ivsetting').isbr;
  },
  callback(v) {
    if (v) {
      ivse_br.show();
    } else {
      ivse_br.hide();
    }
    var o = initsto.get('ivsetting');
    o.isbr = v;
    initsto.set('ivsetting', o);
    r();
  }
});


var ivse_br = new SettingItem({
  title: "背景模糊程度",
  index: 3,
  type: "range",
  init() {
    return [1, 20]
  },
  get() {
    return initsto.get('ivsetting').br;
  },
  callback(v) {
    var o = initsto.get('ivsetting');
    o.br = v;
    initsto.set('ivsetting', o);
    r();
  }
});

ImgOrVideoSe.addNewGroup(ivsg);
ivsg.addNewItem(ivse_th);
ivsg.addNewItem(ivse_mb);
ivsg.addNewItem(ivse_isbr);
ivsg.addNewItem(ivse_br);
if (!initsto.get('ivsetting').isbr) {
  ivse_br.hide();
}

function r() {
  // create Style
  if (!document.querySelector('.bgf .img-sp') && !document.querySelector('.bgf .video-sp')) return;

  var o = initsto.get('ivsetting');
  var s = document.querySelector("#ivbgse");
  if (!s) {
    s = document.createElement('style');
    s.id = 'ivbgse';
    document.head.append(s);
  }
  var h = '';
  var b = '';
  if (o.th == 1) {
    flisten();
    b = '0,0,0';
    document.body.classList.add('t-dark')
    document.body.classList.remove('t-light')
  } else if (o.th == 2) {
    flisten();
    b = '255,255,255'
    document.body.classList.remove('t-dark')
    document.body.classList.add('t-light')
  } else if (o.th == 0) {
    glisten();
    if (custom.getColor() == 'dark') {
      document.body.classList.add('t-dark')
      document.body.classList.remove('t-light')
      b = '0,0,0';
    } else {
      document.body.classList.remove('t-dark')
      document.body.classList.add('t-light')
      b = '255,255,255';
    }
  }
  h += '.img-sp .cover,.video-sp .cover{background-color:rgba(' + b + ',' + (o.mb / 100) + ')}';
  if (o.isbr) {
    h += '.img-sp .cover,.video-sp .cover{backdrop-filter:blur(' + o.br + 'px)}'
  }
  s.innerHTML = h;
}

var listened = false;
function glisten() {
  if (listened) return;
  listened = true;
  setTimeout(() => {
    quik.custom.on('colorchange', _colorchange)
  })
}
function flisten() {
  if (!listened) return;
  listened = false;
  setTimeout(() => {
    quik.custom.off('colorchange', _colorchange)
  })
}
function _colorchange(d) {
  var o = initsto.get('ivsetting');
  var s = document.querySelector("#ivbgse");
  var b = '', h = '';
  if (d == 'dark') {
    document.body.classList.add('t-dark')
    document.body.classList.remove('t-light')
    b = '0,0,0';
  } else {
    document.body.classList.remove('t-dark')
    document.body.classList.add('t-light')
    b = '255,255,255';
  }
  h += '.img-sp .cover,.video-sp .cover{background-color:rgba(' + b + ',' + (o.mb / 100) + ')}';
  if (o.isbr) {
    h += '.img-sp .cover,.video-sp .cover{backdrop-filter:blur(' + o.br + 'px)}'
  }
  s.innerHTML = h;
}

r();
module.exports= { ImgOrVideoSi, checkBgCoverStyle: r };

}),74:(function(_r,module){const dialog = _r(10);
const { alert } = _r(9);
const { storage } = _r(8);
const util = _r(5);
const { initsto } = _r(69);

var iovuploader, iovuploaderf;
function drawIovUploader() {
  // 图片、视频上传器
  iovuploader = new dialog({
    content: _r(75),
    class: "iovuploader",
  })
  // @note 将cancel按钮修改为div，防止表单submit到cancel
  // @edit at 2024/1/30 15:20

  // Dom
  iovuploaderf = iovuploader.getDialogDom();
  if (!storage.checkIDB()) {
    util.query(iovuploaderf, '.pddb').innerHTML += '<span style="color:red;font-size:12px;">您的浏览器版本过低，无法上传本地文件作背景</span>';
    util.query(iovuploaderf, '.pddb input').style.display = 'none';

  }
  // 取消
  util.query(iovuploaderf, '.cancel').onclick = e => {
    e.preventDefault();
    iovuploader.close();
  }
  // 提交
  util.query(iovuploaderf, 'form').onsubmit = e => {
    e.preventDefault();
    // 类型 image(图片) / video(视频)
    var type = util.query(iovuploaderf, '.uploadi').checked ? 'image' : 'video';
    // url?
    var url = util.query(iovuploaderf, 'input[type="url"]').value;
    // File?
    var file = util.query(iovuploaderf, 'input[type="file"]').files[0];
    if((!url)&&(!file)){
        alert('你至少写一个啊！');
        return;
    }
    // 先把背景设置对话框中的图片src重置
    seti('');
    if (file) {
      // File优先

      // 将内容写入idb
      initsto.set('upload', file, true, function () {
        iovuploader.close();
        getUserUploadUrl(function (r) {
          // 获取并设置背景设置对话框中的图片src
          seti(r);
        })
        setbg({
          type: "default",
          data: {
            type: "userbg"
          }
        })
      });

      // 设置存储
      initsto.set('userbg', {
        type: type,
        useidb: true
      })
    } else {
      initsto.set('userbg', {
        type: type,
        url: url
      })
      iovuploader.close();
      getUserUploadUrl(r => {
        // 获取并设置背景设置对话框中的图片src
        seti(r);
        setbg({
          type: "default",
          data: {
            type: "userbg"
          }
        })
      })
    }

    l&l();
  }

}
let l;

function setl(f){
  l=f;
}


function uploadIov(a) {
  if (!iovuploader) {
    drawIovUploader();
    setTimeout(() => {
      iovuploader.open();
    }, 10)
  } else {
    iovuploader.open();
  }

  if (a) {
    var j = initsto.get('userbg');
    if (j) {
      util.query(iovuploaderf, 'input[type="url"]').value = j.url ? j.url : '';
      if (j.type == 'image') {
        util.query(iovuploaderf, '.uploadi').checked = true;
      } else {
        util.query(iovuploaderf, '.uploadv').checked = true;
      }
    }
  }
}

// 获取用户上传图片、视频URL
function getUserUploadUrl(cb) {
  var a = initsto.get('userbg');
  // 没有上传，直接返回false
  if (!a) {
    cb(false);
    return;
  }

  if (a.type == 'video') {
    // 视频
    var b = a.useidb;
    if (b) {
      // 来自用户本地上传，从idb提取，获取视频快照返回
      initsto.get('upload', true, (blob) => {
        getVideoCaptrue(URL.createObjectURL(blob), function (c) {
          cb(c);
        });
      })
    } else {
      // 来自外站，尝试获取视频快照返回
      try {
        getVideoCaptrue(a.url, c => {
          cb(c);
        });
      } catch (e) {
        //失败（CORS|>400）
        cb(false);
      }
    }
  } else if (a.type == 'image') {
    var b = a.useidb;
    if (b) {
      // 来自用户本地上传，从idb提取返回
      initsto.get('upload', true, (blob) => {
        cb(URL.createObjectURL(blob));
      })
    } else {
      // 来自外站，直接返回
      cb(a.url);
    }
  }
}



//获取视频快照
function getVideoCaptrue(url, callback) {
  var video = document.createElement('video');
  video.src = url;
  video.crossOrigin = 'anonymous';

  video.onloadedmetadata = function () {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    video.currentTime = video.duration / 4;

    video.oncanplay = function () {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      callback(canvas.toDataURL('image/png'));
      this.remove();
    };
  };
}

function hasUploadedImg() {
  return !!initsto.get('userbg');
}

function setbg(r){
  _sbfn.forEach(f=>f(r));
}
var _sbfn=[];
function _listensetbg(fn){
  _sbfn.push(fn);
}

function seti(r){
  _sbfn2.forEach(f=>f(r));
}
var _sbfn2=[];
function _listenseti(fn){
  _sbfn2.push(fn);
}
module.exports = {
  hasUploadedImg,
  getUserUploadUrl,
  getVideoCaptrue,
  uploadIov,
  _listensetbg,
  _listenseti,
  setl
}

}),75:(function(_r,module){module.exports=`<form><h1>上传背景</h1><div class="content"><p>背景类型：<input type="radio" class="uploadi" name="uploadiov" checked="checked"> 图片 <input type="radio" class="uploadv" name="uploadiov"> 视频</p><p>背景URL：<input type="url" placeholder="URL"></p><p class="tip">或者</p><p>从本地选择文件：</p><p class="pddb"><input type="file"></p><p></p></div><div class="footer"><div class="cancel btn">取消</div><button class="ok btn">确定</button></div></form>`;}),76:(function(_r,module){const dialog = _r(10);
const util = _r(5);
const { initsto } = _r(69);
util.initSet(initsto, 'usercolor', {
  dark: "#333333",
  light: '#ffffff'
})
var colorchanger, colorchangerf;
function drawColorDialog() {
  // 自定义颜色修改对话框
  colorchanger = new dialog({
    content: _r(77)
  });
  // @note 将cancel按钮修改为div，防止表单submit到cancel
  // @edit at 2024/1/30 15:20

  // Dom
  colorchangerf = colorchanger.getDialogDom();
  // 取消
  util.query(colorchangerf, '.cancel').onclick = function (e) {
    e.preventDefault();
    colorchanger.close();
  }
  // 提交
  util.query(colorchangerf, 'form').onsubmit = function (e) {
    e.preventDefault();
    var lightc = util.query(colorchangerf, '.lightbgcolor').value;
    var darkc = util.query(colorchangerf, '.darkbgcolor').value;
    initsto.set('color', {
      light: lightc,
      dark: darkc
    });
    util.query(tab2, '.zdy .color-left').style.backgroundColor = lightc;
    util.query(tab2, '.zdy .color-right').style.backgroundColor = darkc;
    colorchanger.close();

    setbg({
      type: "default",
      data: {
        type: "color",
        light: lightc,
        dark: darkc
      }
    })
  }
}


function colorChange() {
  if (!colorchanger) {
    drawColorDialog();
    setTimeout(() => {
      colorchanger.open();
    }, 10)
  } else {
    colorchanger.open();
  }

  var c = initsto.get('usercolor');
  util.query(colorchangerf, '.lightbgcolor').value = c.light;
  util.query(colorchangerf, '.darkbgcolor').value = c.dark;
}

function setbg(r) {
  _sbfn.forEach(f => f(r));
}
var _sbfn = [];
function _listensetbg2(fn) {
  _sbfn.push(fn);
}

var tab2;
function init(_tab2){
    tab2 = _tab2;
}
module.exports = { colorChange, _listensetbg2,init };

}),77:(function(_r,module){module.exports=`<form><h1>自定义背景颜色</h1><div class="content"><p>浅色模式：<input type="color" class="lightbgcolor"></p><p>深色模式：<input type="color" class="darkbgcolor"></p></div><div class="footer"><div class="cancel btn">取消</div><button class="ok btn">确定</button></div></form>`;}),78:(function(_r,module){var json=[
    {
      "thumbnail":"mrbgp1_th.png",
      "img":"mrbgp1.webp"
    },
    {
      "thumbnail":"mrbgp2_th.png",
      "img":"mrbgp2.webp"
    }
]
;module.exports=json;}),79:(function(_r,module){var json=[
  {
    "thumbnail":"https://image.gmya.net/thumbnails/b0289db9349e17ca66be2e772cc647a5.png",
    "img":"https://image.gmya.net/i/2024/06/09/66656920a034a.webp"
  },{
    "thumbnail":"https://image.gmya.net/thumbnails/18231c314c064e8c5059debae2506a77.png",
    "img":"https://image.gmya.net/i/2024/08/12/66b9bd00d60ea.webp"
  }
]
;module.exports=json;}),80:(function(_r,module){module.exports=`<div class="unit-item zdy"><div class="unit-title">自定义</div><div class="unit-content"><div class="bgitem full"><div class="left"><div class="hasBg"><img src="" alt=""></div><div class="noBg"><span class="material-symbols-outlined">&#xf09b;</span></div></div><div class="right"><div class="bg-title">用户自定义背景</div><div class="bg-message">上传任意你喜欢的图片/视频作背景</div></div><div class="editbtn"><div class="btn ok">重新上传</div></div></div></div></div><div class="unit-item neizhi"><div class="unit-title">内置</div><div class="unit-content"></div></div><div class="unit-item api"><div class="unit-title">API</div><div class="unit-content"><div class="bgitem half" data-api="bing"><div class="left"><img data-src="https://bing.shangzhenyang.com/api/1080p" alt="" loading="lazy"></div><div class="right"><div class="bg-title">必应壁纸</div><div class="bg-message">获取必应首页的壁纸作为背景</div></div></div><div class="bgitem half" data-api="acg"><div class="left"><img data-src="https://www.loliapi.com/acg/" alt="" loading="lazy"></div><div class="right"><div class="bg-title">随机二次元壁纸</div><div class="bg-message">获取随机二次元壁纸作为背景，背景提供：loliapi.com</div></div></div><div class="bgitem half" data-api="fj"><div class="left"><img data-src="https://tu.ltyuanfang.cn/api/fengjing.php" alt="" loading="lazy"></div><div class="right"><div class="bg-title">随机风景壁纸</div><div class="bg-message">获取随机风景壁纸作为背景，背景提供：ltyuanfang.cn</div></div></div></div></div><div class="unit-item se"><div class="u-se"><p>背景图片显示设置</p><p class="material-symbols-outlined">&#xe5cc;</p></div></div>`;}),81:(function(_r,module){module.exports=`<div class="unit-item zdy"><div class="unit-title">自定义颜色</div><div class="unit-content"><div class="bgitem full"><div class="left"><div class="color-left color"></div><div class="color-right color"></div></div><div class="right"><div class="bg-title">自定义纯色背景</div><div class="bg-message">将你喜欢的颜色做背景，分亮色和暗色（你也可以都设一个颜色或反着来，但不建议这么做）</div></div><div class="editbtn"><div class="btn ok">编辑</div></div></div></div></div><div class="unit-item api"><div class="unit-title">API</div><div class="unit-content"><div class="bgitem full" data-api="theme"><div class="left"><div class="color-left color"></div><div class="color-right color"></div></div><div class="right"><div class="bg-title">跟随主题</div><div class="bg-message">使用当前主题推荐的颜色作为背景色</div></div></div><div class="bgitem full" data-api="time"><div class="left"><div class="color-left color"></div><div class="color-right color"></div></div><div class="right"><div class="bg-title">时间的颜色</div><div class="bg-message">如果当前时间为12:34:56，那么时间的颜色就是rgb(12,34,56)，在亮色模式下就是rgb(255-12,255-34,255-56)</div></div></div></div></div>`;}),82:(function(_r,module){module.exports=`<p>浅色模式：</p><br><textarea class="gjzdytlight textarea"></textarea><p>深色模式：</p><br><textarea class="gjzdytdark textarea"></textarea> <button class="gjzdysetbtn">设置</button><p class="tip">参见 <a href="https://developer.mozilla.org/zh-CN/docs/Web/CSS/background" target="_blank">CSS | background属性</a></p>`;}),83:(function(_r,module){const dialog=_r(10);
const omnibox=_r(21);
const { SettingItem } = _r(14);
const util=_r(5);
const toast=_r(6)

var dia;
function drawAll() {
  dia = new dialog({
    content: _r(84).replace('{{close}}', util.getGoogleIcon('e5cd')),
    mobileShowtype: dialog.SHOW_TYPE_FULLSCREEN,
    class: "search_editor auto-size"
  });

  var d = dia.getDialogDom();
  var neizhi = omnibox.neizhi;
  var list = omnibox.getSearchTypeList();
  var neizhilist_f = d.$('.neizhilist');
  for (var k in neizhi) {
    var item = el('.item', {
      'data-k': k
    });
    item.html('<img/><div>' + neizhi[k].name + '</div>');
    ((k, item) => {
      util.getFavicon(neizhi[k].link, (fav) => {
        if (fav) {
          item.$("img").src = fav;
        } else {
          item.$("img").src = util.createIcon('s');
        }
      });
    })(k, item)

    neizhilist_f.append(item);
    if (k == 'bing') {
      item.on('click', () => {
        toast.show('该项不可取消')
      })
    } else {
      item.on('click', function () {
        if (this.hasClass('active')) {
          this.removeClass('active');
        } else {
          this.addClass('active');
        }
      })
    }

    if (k in list) {
      item.addClass('active');
      delete list[k];
    }
  }

  var str = '';
  for (var k in list) {
    str += '<div class="item" data-k="' + k + '">' +
      '<div class="icon"><img/></div>' +
      '<div class="url"><input value="' + list[k] + '"/></div>' +
      '<div class="remove">' + util.getGoogleIcon('e5cd') + '</div>' +
      '</div>';
  }
  str += `<div class="addnewitem">${util.getGoogleIcon('e145')} 添加自定义的搜索引擎</div>`
  d.$('.searchlist').innerHTML = str;

  d.$$('.searchlist .item').forEach(item => {
    clitem(item);
  });
  d.$('.searchlist .addnewitem').onclick = () => {
    var item = util.element('div', {
      class: 'item',
      'data-k': "user_" + Date.now().toString().slice(3)
    });
    item.innerHTML = '<div class="icon"><img src="https://cn.bing.com/favicon.ico"/></div>' +
      '<div class="url"><input value="https://cn.bing.com/search?q=%keyword%"/></div>' +
      '<div class="remove">' + util.getGoogleIcon('e5cd') + '</div>';
    d.$('.searchlist').insertBefore(item, d.$('.searchlist .addnewitem'));
    clitem(item, true);
  }


  function clitem(item, a) {
    if (!a) {
      util.getFavicon(list[item.attr('data-k')], (fav) => {
        if (fav) {
          item.$('.icon img').src = fav;
        } else {
          item.$('.icon img').src = util.createIcon('s');
        }
      })
    }
    item.$('.url input').oninput = function () {
      // @note 隐藏用户输入了不正确的URL的报错
      // @edit at 2024/1/30 15:28
      try {
        var img = this.parentElement.parentElement.querySelector('.icon img')
        util.getFavicon(this.value, (fav) => {
          if (fav) {
            img.src = fav;
          } else {
            img.src = util.createIcon('s');
          }
        })
      } catch (e) {
        // 用户输入了不正确的URL
      }
    }
    item.$('.remove').onclick = function () {
      this.parentElement.remove();
    }
  }
  d.$('.closeBtn').onclick = d.$('.cancel.btn').onclick = () => {
    dia.close();
  }
  d.$('.ok.btn').onclick = () => {
    var nlist = {};
    d.$$('.searchlist .item').forEach(item => {
      nlist[item.dataset.k] = item.querySelector('.url input').value;
    });
    d.$$('.neizhilist .item.active').forEach(item => {
      nlist[item.dataset.k] = '';
    });
    list = nlist;
    if (!list[omnibox.getSearchTypeIndex()]) {
      omnibox.setSearchType('bing');
    }
    omnibox.setSearchList(list);
    dia.close();
    toast.show('设置成功')
  }
}
var si = new SettingItem({
  title: "自定义搜索引擎",
  index: 0,
  type: 'null',
  message: "",
  callback(value) {
    if (!dia) {
      drawAll();
      setTimeout(() => {
        dia.open();
      }, 10)
    } else {
      dia.open();
    }
  }
})
omnibox.sg.addNewItem(si);

module.exports = {
  open() {
    if (!dia) {
      drawAll();
      setTimeout(() => {
        dia.open();
      }, 10)
    } else {
      dia.open();
    }
  }
}

}),84:(function(_r,module){module.exports=`<div class="actionbar"><h1>搜索引擎列表设置</h1><div class="closeBtn">{{close}}</div></div><div class="list"><h2>内置搜索引擎</h2><div class="neizhilist"></div><h2>自定义搜索引擎</h2><div class="searchlist"></div></div><div class="footer"><button class="cancel btn">取消</button> <button class="ok btn">确定</button></div>`;}),85:(function(_r,module){
var notice_con = $(".notice-con");
var notip = $(".no-notice-tip");
const { icon } = _r(7);
const util = _r(5);
var notice_mb = _r(86);
var focus_con = $(".focus-notice");
var hasNew = 0;
var noticeclick = false;
function notice(details) {
  this.el = el('.notice-item');
  notice_con.appendChild(this.el);
  this.title = details.title;
  this.content = details.content;
  this.btns = details.btns || [];
  this.useprogress = details.useprogress;
  this.progress = 0;
  drawNotice(this);
}
notice.prototype = {
  show(time) {
    notip.removeClass('show');
    r(1);
    clearTimeout(this._timeouthide);
    this.el.addClass('show');
    this.el.on('click', function (e) {
      noticeclick = true;
    })
    var _ = this;
    this.el.show();
    this.el.css("animation", 'noticein .3s');

    if (time) {
      setTimeout(() => {
        _.hide();
      }, time)
    }
  },
  hide() {
    this.el.removeClass('show');
    if (!$(".notice-con .notice-item.show")) {
      notip.addClass('show');
      r(0);
    }
    this.el.css("animation", 'noticeout .3s');
    var _ = this;
    this._timeouthide = setTimeout(() => {
      _.el.hide();
    }, 300)
  },
  focus() {
    this.show();
    upfocus(this);
  },
  destroy() {
    this.hide();
    var _ = this;
    setTimeout(() => {
      _.el.remove();
    }, 300)
  },
  setTitle(title) {
    this.title = title;
    drawNoticeTitle(this);
  },
  setContent(content) {
    this.content = content;
    drawNoticeContent(this);
  },
  setBtn(btns) {
    this.btns = btns;
    drawNoticeBtn(this);
  },
  setProgress(progress) {
    if (!this.useprogress || progress > 1 || progress < 0) {
      return;
    }
    this.progress = progress;
    drawNoticeProgress(this);
  }
}

var focus_arr = [];
function upfocus(_) {
  focus_arr.push(_);
  if (focus_arr.length == 1) {
    g();
  }
}

var focus_timeout;
function g() {
  var readyFocusNotice = focus_arr[0];
  var cloneNoticeEl = readyFocusNotice.el.cloneNode(true);
  focus_con.appendChild(cloneNoticeEl);
  cloneNoticeEl.$('.notice-close-btn').onclick = function () {
    clearTimeout(focus_timeout);
    cloneNoticeEl.remove();
    readyFocusNotice.hide();
    focus_arr.shift();
    if (focus_arr.length > 0) {
      g();
    }
  }
  drawNoticeBtn({
    el: cloneNoticeEl,
    btns: readyFocusNotice.btns,
    hide() {
      readyFocusNotice.hide();
      clearTimeout(focus_timeout);
      cloneNoticeEl.remove();
    },
    show() { }
  });
  focus_timeout = setTimeout(() => {
    cloneNoticeEl.remove();
    focus_arr.shift();
    if (focus_arr.length > 0) {
      g();
    }
  }, 3000);
}

function drawNotice(n) {
  n.el.html(notice_mb.replace('{{close-btn}}', util.getGoogleIcon('e5cd')));
  n.el.$('.notice-close-btn').onclick = () => {
    n.hide();
  }
  drawNoticeTitle(n);
  drawNoticeContent(n);
  drawNoticeBtn(n);
  drawNoticeProgress(n);
}

function drawNoticeTitle(n) {
  var titleel = n.el.$('.notice-title');
  titleel.html(n.title);
}

function drawNoticeContent(n) {
  var contentel = n.el.$('.notice-content');
  contentel.html(n.content);
}

function drawNoticeBtn(n) {
  var btncon = n.el.$('.notice-btns');
  btncon.html('');
  for (var i = 0; i < n.btns.length; i++) {
    (i => {
      var btn = n.btns[i];
      var btnel = el('div', {
        class: "btn" + (btn.style ? " " + btn.style : ""),
      });
      btnel.text(btn.text);
      btnel.onclick = () => {
        btn.click(n);
      }
      btncon.appendChild(btnel);
    })(i)

  }
}

function drawNoticeProgress(n) {
  if (!n.useprogress) {
    n.el.$('.notice-progress').hide();
    return;
  }
  var progressel = n.el.$('.notice-progress .p div');
  progressel.css("width", n.progress * 100 + "%");
}
// mobile适配
var mbicon = new icon({
  content: util.getGoogleIcon('e7f4'),
  offset: "tl",
  class: "notice-icon"
});

window.on('resize', () => { r() });
mbicon.getIcon().on('click', () => {
  $(".notice-sc").addClass('show');
})
$(".notice-sc").on('click', function () {
  if (noticeclick) {
    noticeclick = false;
    return;
  }
  this.removeClass('show');
})
function r(a) {
  if (typeof a == "undefined") {
    a = hasNew;
  } else {
    hasNew = a;
  }
  if (window.innerWidth < 600 && a) {
    mbicon.show();
  } else {
    mbicon.hide();
  }
}
r();

module.exports = notice;

}),86:(function(_r,module){module.exports=`<div class="notice-actionbar"><div class="notice-title"></div><div class="notice-close-btn">{{close-btn}}</div></div><div class="notice-content"></div><div class="notice-progress"><div class="p"><div></div></div></div><div class="notice-btns"></div>`;}),87:(function(_r,module){const notice = _r(85);
const {gS} = _r(8);

// 一些重要通知的推送
const stp=gS("tuisong");
if(isUd(stp.d))stp.d=0;
var last_d = stp.d;
console.log('last_d', last_d);
get('/ehon-notice.json').then(res => {
    if (res.date > last_d) {
        setTimeout(() => {
            stp.d=res.date;
        }, 5000)

        var tsn = new notice({
            content: res.content,
            title: res.title,
            btns: res.btns.map((v) => {
                var fn;
                if (v.link) {
                    fn = () => {
                        tsn.hide();
                        window.open(v.link)
                    }
                } else {
                    fn = () => {
                        tsn.hide();
                    }
                }
                return {
                    text: v.text,
                    style: v.style,
                    click: fn
                }
            })
        })

        tsn.show();
    }
}, () => {
    // 请求失败
    console.log('通知数据请求失败')
})
}),88:(function(_r,module){// 数据相关设置和页面高级操作

let {gS,storage}=_r(8);
let {SettingGroup,SettingItem, mainSetting}=_r(14);
const { cateWidthShiPei } = _r(29);
const util = _r(5);
const { icon } = _r(7);
const notice=_r(85);
const { alert, confirm, prompt } = _r(9);

var stp = gS('safe');
window.ign=false; //是否忽略接下来的hashchange
window.on('hashchange', ()=>{
    if(window.ign){
        window.ign=false;
        return;
    }
    window.location.reload(); // 不忽略则刷新
});
window.on('visibilitychange', () => {// 用于降低页面CPU占用
    if (document.visibilityState == 'hidden') {
        document.body.hide();
    } else {
        document.body.show();
        cateWidthShiPei();
    }
})
function hashcl() {
    // 处理hash，hash往往决定页面的模式
    var hash = location.hash.slice(1), cjhash;
    if (hash.indexOf(';') != -1) { // 因为浏览器扩展会将插件id以 id;hash 的形式传入
        cjhash = hash.split(';')[0];
        hash = hash.split(';')[1];
    }
    if (hash == 'safe') {//安全模式
        window.ign=true; // 忽略接下来的hash变化
        location.hash = '#' + (cjhash ? cjhash + ';' : ''); // 设置hash为空，再次刷新即可退出安全模式
        window.addon_ = true; // 此处阻止插件活动
        alert('已阻止所有插件运行，请修改设置或删除插件');
    }
}
hashcl();

var gaoji = new SettingGroup({
    title: "高级",
    index: 5
})

var xnse = new SettingItem({
    title: "性能模式",
    message: "强制关闭所有滤镜和动画效果",
    index: 1,
    type: "boolean",
    get() {
        return !!stp.xnse
    },
    callback(n) {
        stp.xnse = n;
        doxnse(n);// -> 239
    }
});
gaoji.addNewItem(xnse);

var clse = new SettingItem({
    title: "清除数据",
    message: "清除Ehon起始页的所有数据",
    index: 2,
    type: "null",
    callback() {
        confirm('确定要清除所有数据吗？', r => {
            if (r) {
                function c() {
                    prompt('请在下方输入“clearAll”，并再次确定是否要清除所有数据，此操作无法恢复。', t => {
                        if (t == 'clearAll') {
                            var k = storage('oobe')
                            var s = k.getAll(); 
                            // 保留oobe数据，这样清除后就不会再次显示欢迎界面
                            localStorage.ehon = JSON.stringify({
                                oobe: s
                            })
                            localforage.clear().then(() => {
                                location.reload();
                            });
                        } else {
                            t && c(); // t为空则退出，t不为空则认为输错，则重开再输一遍
                        }
                    })
                }
                c();
            }
        });
    }
});
gaoji.addNewItem(clse);

var clse2 = new SettingItem({
    title: "还原设置",
    message: "还原Ehon起始页的默认设置",
    index: 2,
    type: "null",
    callback() {
        confirm('确定要还原设置为默认吗？', r => {
            if (r) {
                let a=JSON.parse(localStorage.ehon);
                a.setting={};
                a.hello={};
                delete a.link.draglink;
                delete a.link.enabledCate;
                delete a.link.lastingCate;
                delete a.link.linkpailie;
                delete a.link.linksize;
                delete a.link.linkstyle;
                localStorage.ehon = JSON.stringify(a);
                alert('已还原默认设置，刷新页面后生效。', function () {
                    window.location.reload();
                })
            }
        });
    }
});
gaoji.addNewItem(clse2);

var stol = new SettingItem({
    title: "清除指定数据",
    message: "请在开发者指导下应急用",
    index: 2,
    type: "null",
    callback() {
        alert('该设置请在开发者指导下使用！', ()=> {
            prompt('如要清除整个库，输入1，如要清除具体键值，输入2，列出库列表输入3，列出键列表输入4', t => {
                var a=JSON.parse(localStorage.ehon);
                if (t=='1') {
                    prompt('输入要清除的库', k => {
                        if(k){
                            a[k]={};
                            localStorage.ehon = JSON.stringify(a);
                            alert('已清除'+k+'库！', function () {
                                window.location.reload();
                            })
                        }
                    })
                }else if(t=='2'){
                    prompt('输入要清除的库', k => {
                        if(k){
                           prompt('输入要清除的键值', v => {
                               if(v){
                                    try{
                                        delete a[k][v];
                                    }catch(e){
                                        alert('该键值不存在！');
                                    }
                                    localStorage.ehon = JSON.stringify(a);
                                    alert('已清除'+k+'库的'+v+'键值！', function () {
                                        window.location.reload();
                                    })
                               }
                           }) 
                        }
                    })
                }else if(t=='3'){
                    alert(Object.keys(a).join('\n'));
                }else if(t=='4'){
                    prompt('输入要列出库的键值', k => {
                        if(k){
                            if(a[k]){
                                alert(Object.keys(a[k]).join('\n'));
                            }else{
                                alert('该库不存在！');
                            }
                        }
                    })
                }
            })
        });
    }
});
gaoji.addNewItem(stol);


var cjup = new SettingItem({
    title: "强制更新",
    message: "强行从远程获取最新版本并更新",
    index: 2,
    type: "null",
    callback() {
        confirm('确定要强制更新吗？', r => {
            if (r) {
                if (window.swReg) {
                    updateBySW(window.swReg); //存在serviceWoker则通知更新
                } else {
                    // 不存在则刷新即可
                    alert('更新完成', () => {
                        location.reload();
                    })
                }
            }
        });
    }
});

var _i=0;
function updateBySW(registration){
    // home.ehon.cn若在iframe中更新则无法通过cookie校验
    if (window.isInframe && location.href.indexOf('://home.ehon.cn/') != -1) {
        alert('因安全原因，扩展程序无法进行强制更新，请在网页端更新', function () {
            window.open('https://home.ehon.cn/?forceUpdate=1');
        });
    }else if(location.href.indexOf('://home.ehon.cn/') != -1&&_i==0){
        _i++;// 多次调用确保通过cookie校验
        var ifr = util.element('iframe', {
          src: './version',
          style: "opacity:0"
        });
        document.body.appendChild(ifr);
        var i = 0;
        ifr.onload = function () {
          i++;
          if (i >= 2) {
            updateBySW(registration) // 多次调用确保通过cookie校验
          }
        }
        setTimeout(() => {
          updateBySW(registration) // 多次调用确保通过cookie校验
        }, 4000)
        new notice({
            title: "更新提示",
            content: "已向后台发送更新请求，请耐心等待。",
        }).show();
      } else {
        // 通知serviceWorker更新
        registration.active.postMessage('update');
        new notice({
            title: "更新提示",
            content: "已向后台发送更新请求，请耐心等待。",
        }).show();
    }
}
gaoji.addNewItem(cjup);

mainSetting.addNewGroup(gaoji);

// 处理无动效
function doxnse(n) {
    if (n) {
        var s = el('style');
        s.id = 'xnse';
        // 就是全none
        s.innerHTML = '*{filter:none!important;backdrop-filter:none!important;animation:none!important;transition:none!important;}';
        document.head.append(s);
    } else {
        try{
        $('#xnse').remove();
        }catch(e){}
    }
}

doxnse(!!stp.xnse);


// 网络检测
window.on('offline', ckline)
window.on('online', ckline)

function pingLine(cb){
    let isOutLine=true;
    let isOutGoogle=true;
    let checkOut=(ok)=>{
        if(ok)isOutLine=false;
    }
    util.loadimg("https://www.baidu.com/favicon.ico?_="+Date.now(),checkOut)
    util.loadimg("https://www.bilibili.com/favicon.ico?_="+Date.now(),checkOut)
    util.loadimg("https://www.douyin.com/favicon.ico?_="+Date.now(),checkOut)
    util.loadimg("https://www.google.com/favicon.ico?_="+Date.now(),(ok)=>{
        if(ok){
            isOutGoogle=false;
            isOutLine=false;
        }
    })
    setTimeout(()=>{
        cb(isOutLine,isOutGoogle);
    },1500)
}

function setLineNotice(){
    pingLine((isOutLine,isOutGoogle)=>{
        window.isOutGoogle=isOutGoogle;
        if (isOutLine) {
            lineErrNotice.show()
            lineErrNotice.focus();
            offlineIcon.show();
        } else {
            lineErrNotice.hide();
            offlineIcon.hide();
        }
    });
}

var offlineIcon = new icon({
    content: util.getGoogleIcon('f239'),
    offset: "br",
    important: true
})
offlineIcon.getIcon().style.color = 'red';
offlineIcon.getIcon().on("click",()=>{
    if(window.navigator.onLine){
        lineErrNotice.show();
        lineErrNotice.focus();
    }else{
        offlineNotice.show();
        offlineNotice.focus();
    }
})
var offlineNotice = new notice({
    title: "断网提醒",
    content: "您的网络已断开，请尽快重连！"
})
var lineErrNotice = new notice({
    title: "断网提醒",
    content: "您的网络似乎不可用，请检查您的代理服务器或网络设置！",
    btns:[{
        text:"重试",
        click(){
            lineErrNotice.hide();
            offlineIcon.hide();
            setLineNotice();
        }
    }]
})

function ckline() {
    if (!window.navigator.onLine) {
        offlineNotice.show()
        offlineNotice.focus();
        offlineIcon.show();
    } else {
        offlineNotice.hide();
        offlineIcon.hide();
        setLineNotice();
    }
}
window.on("load",()=>{
    ckline();
    setInterval(()=>{
        if(window.navigator.onLine&&(!window.isOutLine)&&document.visibilityState=="visible")setLineNotice();
    },10000);
});

}),89:(function(_r,module){const { SettingGroup, SettingItem, mainSetting } = _r(14);
const util = _r(5);
const dialog = _r(10);
var { getJSON, setJSON } = _r(90);
var { registerWebSync, unregister, isSync } = _r(91);
const { getStorageList } = _r(8);

// 加载云端同步模块
_r(92);

function quik1() {
  var d = new dialog({
      content: "正在加载模块..."
  })
  d.open();
  var s = el('script', {
      src: "./quik1.js"
  })
  document.body.append(s);
  window.quik1to2 = (f) => {
      window.quik1to2 = null;
      f(_importData);
      d.close();
  }
}

const { alert } = _r(9);
const { showOpenFilePicker } = _r(2);
const addon=_r(45);


var sg = new SettingGroup({
  title: "数据",
  index: 4
});

var exportDataSi = new SettingItem({
  title: "导出数据",
  message: "导出数据到文件",
  type: "null",
  callback: openExport
});
function openExport() {
  if (!exportDataDialog) {
    drawExportDialog();
  }
  var jl = getStorageList();
  for (var k in jl) {
    if (!jl[k] || !jl[k].sync) {
      continue;
    }
    var j = jl[k];
    var li = el('div');
    li.addClass('item');
    li.html(`<input type="checkbox"/><div class="message">
        <div class="title">${j.title || k}</div>
        <div class="desc">${j.desc || ''}</div>
      </div>`);
    li.dataset.key = k;
    dm.$('.exportslist').appendChild(li);
    li.$('input').checked = true;
  }
  setTimeout(() => {
    exportDataDialog.open();
  }, 10)
}
var importDataSi = new SettingItem({
  title: "导入数据",
  message: "从文件导入数据",
  type: "null",
  callback: openImport
});
function openImport() {
  showOpenFilePicker().then(files => {
    var file = files[0];
    if (file) {
      try {
        var reader = new FileReader();
        reader.onload = e => {
          sl = JSON.parse(e.target.result);
          _importData(sl);
        }
        reader.readAsText(file);
      } catch (e) {
        console.log(e);
        alert('读取文件有误！');
      }
    }
  })
}

function _importData(_sl) {
  sl = _sl;
  var jl = getStorageList();
  if (!importDataDialog) {
    drawImportDialog();
  }
  for (var k in _sl) {
    importaixr(_sl[k], k, jl);
  }
  setTimeout(() => {
    importDataDialog.open();
  }, 10)
}
sg.addNewItem(exportDataSi);
sg.addNewItem(importDataSi);
mainSetting.addNewGroup(sg);


function importaixr(j, k, jl) {
  var li = el('div');
  if (!jl[k] && j.addon) {
    var addo = addon.getAddonByUrl(j.addon);
    if (!addo) {
      li.addClass('item');
      var ismarket = false;
      if (j.addon.indexOf('market:') == 0) {
        ismarket = true;
      }
      setlihtml(j.addon)
      function setlihtml(_d) {
        li.html(`<input type="checkbox" disabled/><div class="message">
            <div class="title">${j.title || k}</div>
            <div class="desc">需要安装插件以同步：${_d}</div>
          </div>
          <div class="installbtn">安装</div>`);
        var installbtn = li.$('.installbtn');
        installbtn.on('click', function () {
          if (this.hasClass('ing')) return;
          if (this.hasClass('err')) {
            this.removeClass('err');
          }
          this.html('安装中...');
          this.addClass('ing');
          var p;
          if (ismarket) {
            p = addon.installByOfficialMarket(j.addon.replace('market:', ''));
          } else {
            p = addon.installByUrl(j.addon);
          }
          p.on('error', () => {
            installbtn.html('安装失败');
            installbtn.addClass('err');
          })
          p.on('wait', (r) => {
            r(true);
          })
          p.on('done', () => {
            li.remove();
            setTimeout(() => {
              importaixr(j, k, getStorageList());
            }, 10)
          })
        })
      }
      li.dataset.key = k;
      dm2.$('.importslist').appendChild(li);

      return;
    }
  }
  if (!jl[k]) return;
  li.addClass('item');
  li.html(`<input type="checkbox"/><div class="message">
      <div class="title">${j.title || k}</div>
      <div class="desc">${j.desc || ''}</div>
    </div>`);
  if (jl[k].compare) {
    li.innerHTML += `<select>
        <option value="compare">对比</option>
        <option value="rewrite">覆盖</option>
      </select>`
    li.$('select').value = "compare";
  }
  li.dataset.key = k;
  dm2.$('.importslist').appendChild(li);
  li.$('input').checked = true;
}

var sl = null;

var exportDataDialog, importDataDialog, dm, dm2;

function drawExportDialog() {
  exportDataDialog = new dialog({
    content: `<div class="actionbar">
        <h1>导出数据</h1>
        <div class="closeBtn">${util.getGoogleIcon('e5cd')}</div>
      </div>
      <div class="exportslist">
      </div>
      <div class="btns">
        <div class="btn cancel">取消</div>
        <div class="btn ok">导出</div>
      </div>`,
    class: "sync-dialog auto-size",
    mobileShowtype: dialog.SHOW_TYPE_FULLSCREEN,
  });
  dm = exportDataDialog.getDialogDom();
  dm.$('.closeBtn').onclick = dm.$('.cancel').onclick = () => {
    exportDataDialog.close();
  }
  dm.$('.ok').onclick = () => {
    var op = [];
    dm.$$('.exportslist .item').forEach(l => {
      if (l.$('input').checked) {
        op.push(l.dataset.key);
      }
    })
    getJSON(op).then((res) => {
      download(JSON.stringify(res), 'ehon-exportdata.json');
    })
    exportDataDialog.close();
  }
}


function download(data, filename) {
  var a = el('a');
  a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  a.download = filename;
  a.click();
}

function drawImportDialog() {
  importDataDialog = new dialog({
    content: `<div class="actionbar">
        <h1>导入数据</h1>
        <div class="closeBtn">${util.getGoogleIcon('e5cd')}</div>
      </div>
      <div class="importslist">
      </div>
      <div class="btns">
        <div class="btn cancel">取消</div>
        <div class="btn ok">导入</div>
      </div>`,
    class: "sync-dialog auto-size",
    mobileShowtype: dialog.SHOW_TYPE_FULLSCREEN,
  });
  dm2 = importDataDialog.getDialogDom();
  dm2.$('.closeBtn').onclick = dm2.$('.cancel').onclick = () => {
    sl = null;
    importDataDialog.close();
  }

  dm2.$('.ok').onclick = () => {
    var op = {};
    dm2.$$('.importslist .item').forEach((l) => {
      if (l.$('input').checked) {
        if (l.$('select')) {
          op[l.dataset.key] = l.$('select').value;
        } else {
          op[l.dataset.key] = 'rewrite';
        }
      }
    })
    setJSON(sl, op);
    importDataDialog.close();
  }
}

var ehon1si = new SettingItem({
  title: "Ehon 1",
  message: "从 Ehon 1 中导入数据",
  type: "null",
  callback: quik1
})

sg.addNewItem(ehon1si);


module.exports = {
  getJSON,
  setJSON,
  openImport,
  openExport,
  registerWebSync,
  unregister,
  isSync,
  openEhon1: quik1
}
}),90:(function(_r,module){const { alert } = _r(9);
const {storage} = _r(8);
const { getStorageList, getAllStorage } = _r(8);
const { abortSync } = _r(91);

async function getJSON(config) {
  var jl = getStorageList();
  var ast = getAllStorage();
  var a = {};
  for (var i = 0; i < config.length; i++) {
    var k = config[i];
    if (jl[k]) {
      a[k] = {
        title: jl[k].title || k,
        desc: jl[k].desc || '',
        addon: jl[k].addon,
        data: null
      };
      try {
        if (jl[k] && jl[k].sync) {
          if (jl[k].get) {
            a[k].data = await jl[k].get();
          } else {
            a[k].data = await dget(ast[k]);
          }
        }
      } catch (e) {
        throw new Error('在获取 ' + k + ' 时遇到错误', e);
      }
    } else {
      console.warn(k + ' 存储区域不存在');
    }
  }
  return a;
}

async function dget(n) {
  var m = {};
  for (var k2 in n) {
    if (typeof n[k2] == 'string' && n[k2][0] == '^') {
      var j = {
        "^_t": "db",
        "^_k": n[k2],
        "^_d": await localforage.getItem(n[k2])
      }
      try {
        JSON.stringify(j);
        m[k2] = j;
      } catch (e) {
        console.warn('非json支持格式存储不同步');
      }
    } else {
      m[k2] = n[k2];
    }
  }
  return m;
}

async function dwrite(ast, k, j) {
  for (var k2 in j) {
    if (j[k2]['^_t'] == 'db' && j[k2]['^_k']) {
      if (storage.checkIDB()) {
        await localforage.setItem(j[k2]['^_k'], j[k2]['^_d']);
        ast[k][k2] = j[k2]['^_k'];
      } else {
        throw new Error('Your browser is not support indexedDB,Please update your browser.');
      }
    } else {
      ast[k][k2] = j[k2];
    }
  }
}

var rewrite = 'rewrite', compare = 'compare';

async function setJSON(json, config) {
  console.log(json);
  abortSync();
  var jl = getStorageList();
  var alls = getAllStorage();
  var ast = {};
  for (var k in json) {
    if (config[k]) {
      if (jl[k]) {
        ast[k] = alls[k];
        if (config[k] == rewrite) {
          if (typeof jl[k].rewrite == 'function') {
            await jl[k].rewrite(ast, k, json[k].data);
          } else {
            await dwrite(ast, k, json[k].data);
          }
        } else if (config[k] == compare) {
          if (typeof jl[k].compare == 'function') {
            await jl[k].compare(ast, k, json[k].data);
          } else {
            throw new Error(k + ' 不支持compare')
          }
        }

      } else {
        if (json[k].addon) {
          console.warn(k + ' 存储区域不存在，但提示需先安装插件，插件URL: ' + json[k].addon);
        } else {
          console.warn(k + ' 存储区域不存在');
        }
      }
    }

  }

  var o = JSON.parse(localStorage.ehon);
  for (var k in ast) {
    o[k] = ast[k];
  }
  setTimeout(()=>{
    localStorage.ehon = JSON.stringify(o);
    alert('数据导入成功，请重新加载页面', () => {
        if (location.hash.indexOf(';') != -1) {
          location.hash = location.hash.split(';')[0] + ';newnow'
        } else {
          location.hash = '#newnow'
        }
        location.reload();
      })
  },100);// to wait proxy
  
}

module.exports = { getJSON, setJSON }

}),91:(function(_r,module){const dialog = _r(10);
const { confirm } = _r(9);
const { icon } = _r(7);
const notice = _r(85);
const { storage } = _r(8);
const util = _r(5);
const { getJSON } = _r(90);
const addon=_r(45)


var initsto = storage('websync');
if (!initsto.get('wait')) {
    initsto.set('wait', []);
}
var nsyncM = initsto.get('yesid');
if (nsyncM) {
    listenData();
}
var syncM;
function registerWebSync(syncM, session, cb) {
    if (!util.checkDetailsCorrect(syncM, ['isLogin', 'login', 'getLastReq', 'getAll', 'update', 'updateAll'])) {
        cb({
            code: -2,
            msg: "格式不正确"
        });
        return;
    }
    if (!util.checkSession(session)) {
        cb({
            code: -3,
            msg: "session不正确"
        });
        return;
    }
    if (nsyncM != session.id) {
        confirm('插件 "' + addon.getAddonById(session.id) + '" 申请提供数据云同步功能，是否同意？', r => {
            if (r) {
                nsyncM = session.id;
                initsto.set('yesid', nsyncM);
                initsto.remove('last_req')
                cb({
                    code: 0,
                    msg: "OK"
                });
                listenData();
                startSync(syncM);
            } else {
                cb({
                    code: -1,
                    msg: "用户取消"
                });
            }
        });
    } else {
        cb({
            code: 0,
            msg: "OK"
        });
        startSync(syncM).catch(e => {
            new notice({
                title: "云同步",
                content: "云同步初始化失败，请检查网络连接后刷新"
            }).show();
            console.log(e);
        });
    }
}

function abortSync() {
    syncM = null;
}

function unregister(session) {
    if (!util.checkSession(session)) {
        cb({
            code: -3,
            msg: "session不正确"
        });
        return;
    }
    if (nsyncM == session.id) {
        initsto.remove('yesid');
        initsto.remove('last_req');
        location.reload();
    }
}

function isSync() {
    return !!nsyncM;
}

async function startSync(a) {
    syncM = a;
    var isLogin = await syncM.isLogin();
    if (!isLogin) {
        await syncM.login();
    }
    if (isNewNow()) {
        await updateAll();
        syncChange();
    } else {
        var n = await syncData();
        if (n) {
            syncChange();
        }
    }
}

function isNewNow() {
    var hash = location.hash.slice(1);
    if (hash.indexOf(';') != -1) {
        hash = hash.split(';')[1]
    }
    if (hash == 'newnow') {
        location.hash = location.hash.replace('newnow', '');
        return true;
    }
}
var syncConfictDialog;
function drawSyncConfict() {
    syncConfictDialog = new dialog({
        content: `<div>
                <p>您的在线存档与本地存档存在冲突:</p>
                <p class="last_req"></p>
                <p>你要：</p>
            </div>
            <div class="btns">
                <div class="btn ok">从在线同步</div>
                <div class="btn cancel">本地覆盖在线</div>
            </div>`
    })
}


var syncIcon = new icon({
    content: util.getGoogleIcon('eb5a'),
    offset: "br",
    important: true
})
syncIcon.hide();

function syncData() {
    return new Promise((r, j) => {
        syncM.getLastReq().then((last_req) => {
            if (last_req != initsto.get('last_req')) {
                var d = syncConfictDialog.getDialogDom();
                if (last_req == 'no') {
                    updateAll();
                } else {
                    var _a = new Date(last_req).toLocaleString() + "的更改"
                    util.query(d, '.last_req').innerText = _a;
                    util.query(d, '.btn.ok').onclick = () => {
                        getData();
                    }
                    util.query(d, '.btn.cancel').onclick = () => {
                        updateAll().then(r).catch(j);
                        syncConfictDialog.close();
                    }
                    if (!syncConfictDialog) {
                        drawSyncConfict();
                    }
                    setTimeout(() => {
                        syncConfictDialog.open();
                    }, 10)
                }
            } else {
                r('n')
            }
        }).catch(j);
    })
}

async function updateAll() {
    syncIcon.show();
    var al = getStorageList();
    var a = await getJSON(Object.keys(al).filter((v) => {
        return al[v] ? al[v].sync : false;
    }));
    var reqId = Date.now();
    await syncM.updateAll(a, reqId);
    initsto.set('last_req', reqId);
    initsto.set('wait', []);
    syncIcon.hide();
}

async function getData() {
    var _d = new dialog({
        content: "获取中。。。"
    })
    _d.open();
    var a = await syncM.getAll();
    _d.close();
    _importData(a);
}

function listenData() {
    storage.on('websync', (e) => {
        var reqId = Date.now();
        e.id = reqId
        pushChange(e);
    })
}


function syncChange() {
    syncIcon.show();
    if (!syncM) {
        return;
    }
    var o = initsto.get('wait');
    var e = o[0];
    if (!e) return;
    syncM.update(e, (reqId) => {
        if (reqId) {
            initsto.set('last_req', reqId);
            dealChange(reqId);
            o = null;
            e = null;
            syncChange();
        } else {
            new notice({
                title: "云同步",
                content: "数据（" + new Date(reqId).toLocaleString() + "的更改）同步失败了，是否重试？",
                btns: [{
                    text: "确定",
                    click() {
                        syncChange(e);
                    }
                }, {
                    text: "取消",
                    click() { }
                }]
            }).show();
        }
    })
}

function pushChange(e) {
    var o = initsto.get('wait');
    if (e.sp) {
        o.push(e);
    } else {
        for (var i = 0; i < o.length; i++) {
            if (o[i].key == e.key) {
                o.splice(i, 1);
                break;
            }
        }
        o.push({
            key: e.key,
            id: e.id
        })
    }
    initsto.set('wait', o);
    if (o.length == 1 && syncM) {
        syncChange();
    }
}

function dealChange(id) {
    initsto.set('last_req', id);
    var o = initsto.get('wait');
    for (var i = 0; i < o.length; i++) {
        if (o[i].id == id) {
            o.splice(i, 1);
            break;
        }
    }
    initsto.set('wait', o);
    if (o.length == 0) {
        syncIcon.hide();
    }
}

addon.on('allrun', () => {
    setTimeout(() => {
        if (nsyncM && (!syncM)) {
            confirm('正在使用的云同步插件已被卸载或禁用，是否取消当前的云同步服务？', (ok) => {
                if (ok) {
                    initsto.remove('yesid');
                    initsto.remove('last_req');
                    location.reload();
                }
            })
        }
    }, 1000)
})


module.exports = {
    registerWebSync,
    unregister,
    isSync,
    abortSync
};
}),92:(function(_r,module){// 云端同步 UI - Supabase Auth 方案（Email + GitHub 登录）
const { SettingGroup, SettingItem, mainSetting } = _r(14);
const { alert, confirm, prompt } = _r(9);
const cloudSync = _r(93);
const supabaseAuth = _r(94);
const { pushMenu, MAIN_MENU_TOP } = _r(13);
const { icon } = _r(7);
const util = _r(5);
const dialog = _r(10);
const { storage } = _r(8);

// ── 设置分组 ──────────────────────────────────────────────
const cloudGroup = new SettingGroup({ title: '云端同步', index: 6 });
mainSetting.addNewGroup(cloudGroup);

// ── 顶部菜单按钮 ──────────────────────────────────────────
let authStatusIcon = null;

function addCloudSyncToMenu() {
  const syncIcon = new icon({
    class: 'cloud_sync',
    content: util.getGoogleIcon('e2bd'),
    offset: 'tr'
  });
  syncIcon.getIcon().onclick = e => {
    e.stopPropagation();
    if (cloudSync.isAuthenticated()) {
      cloudSync.download();
    } else {
      showLoginDialog();
    }
  };

  // 右上角登录状态指示器
  authStatusIcon = new icon({
    class: 'auth_status',
    content: '',
    offset: 'tr',
    width: 0
  });
  updateAuthStatusIcon();

  authStatusIcon.getIcon().onclick = e => {
    e.stopPropagation();
    if (cloudSync.isAuthenticated()) {
      confirm('已登录: ' + cloudSync.getEmail() + '\n\n确定要退出登录吗？', async ok => {
        if (ok) {
          await supabaseAuth.signOut();
          refreshUI();
        }
      });
    } else {
      showLoginDialog();
    }
  };

  pushMenu({
    title: '☁️ 同步到云端',
    icon: util.getGoogleIcon('e2bd'),
    callback: () => {
      if (cloudSync.isAuthenticated()) {
        cloudSync.download();
      } else {
        showLoginDialog();
      }
    },
  }, MAIN_MENU_TOP);
}

function updateAuthStatusIcon() {
  if (!authStatusIcon) return;
  const el = authStatusIcon.getIcon();
  if (cloudSync.isAuthenticated()) {
    const email = cloudSync.getEmail() || '已登录';
    const displayName = email.length > 12 ? email.substring(0, 12) + '…' : email;
    el.innerHTML = '<span class="auth-status-text">' + displayName + '</span>';
    el.classList.add('logged-in');
    el.classList.remove('not-logged-in');
    el.style.width = 'auto';
  } else {
    el.innerHTML = '<span class="auth-status-text">登录</span>';
    el.classList.remove('logged-in');
    el.classList.add('not-logged-in');
    el.style.width = 'auto';
  }
}

setTimeout(addCloudSyncToMenu, 200);

// ── 登录/注册对话框 ────────────────────────────────────────
function showLoginDialog() {
  const d = new dialog({
    content: `
      <div class="auth-dialog">
        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="login">登录</button>
          <button class="auth-tab" data-tab="register">注册</button>
        </div>
        <div class="auth-form" id="auth-login-form">
          <button class="auth-github-btn" id="auth-github-login-btn">
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            使用 GitHub 登录
          </button>
          <div class="auth-divider"><span>或使用邮箱</span></div>
          <div class="auth-field">
            <label>邮箱</label>
            <input type="email" id="auth-email" placeholder="请输入邮箱" autocomplete="email"/>
          </div>
          <div class="auth-field">
            <label>密码</label>
            <input type="password" id="auth-password" placeholder="请输入密码" autocomplete="current-password"/>
          </div>
          <div class="auth-actions">
            <button class="btn ok" id="auth-login-btn">登录</button>
            <button class="btn" id="auth-forgot-btn">忘记密码？</button>
          </div>
          <div class="auth-error" id="auth-error"></div>
        </div>
        <div class="auth-form" id="auth-register-form" style="display:none">
          <button class="auth-github-btn" id="auth-github-reg-btn">
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            使用 GitHub 注册
          </button>
          <div class="auth-divider"><span>或使用邮箱</span></div>
          <div class="auth-field">
            <label>邮箱</label>
            <input type="email" id="auth-reg-email" placeholder="请输入邮箱" autocomplete="email"/>
          </div>
          <div class="auth-field">
            <label>密码</label>
            <input type="password" id="auth-reg-password" placeholder="至少6位密码" autocomplete="new-password"/>
          </div>
          <div class="auth-field">
            <label>确认密码</label>
            <input type="password" id="auth-reg-password2" placeholder="再次输入密码" autocomplete="new-password"/>
          </div>
          <div class="auth-actions">
            <button class="btn ok" id="auth-register-btn">注册</button>
          </div>
          <div class="auth-error" id="auth-reg-error"></div>
        </div>
        <div class="auth-form" id="auth-forgot-form" style="display:none">
          <div class="auth-field">
            <label>邮箱</label>
            <input type="email" id="auth-reset-email" placeholder="请输入注册邮箱" autocomplete="email"/>
          </div>
          <div class="auth-actions">
            <button class="btn ok" id="auth-reset-btn">发送重置邮件</button>
            <button class="btn" id="auth-back-login-btn">返回登录</button>
          </div>
          <div class="auth-error" id="auth-reset-error"></div>
        </div>
      </div>
    `,
    clickOtherToClose: true,
  });

  setTimeout(() => { d.open(); }, 10);
  const dd = d.getDialogDom();

  // ── Tab 切换 ───────────────────────────────────────────
  const tabs = dd.querySelectorAll('.auth-tab');
  const loginForm = dd.querySelector('#auth-login-form');
  const registerForm = dd.querySelector('#auth-register-form');
  const forgotForm = dd.querySelector('#auth-forgot-form');

  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      loginForm.style.display = target === 'login' ? '' : 'none';
      registerForm.style.display = target === 'register' ? '' : 'none';
      forgotForm.style.display = 'none';
      // 清除错误
      dd.querySelector('#auth-error').textContent = '';
      dd.querySelector('#auth-reg-error').textContent = '';
    };
  });

  // ── GitHub 登录 ─────────────────────────────────────────
  dd.querySelector('#auth-github-login-btn').onclick = () => {
    supabaseAuth.signInWithGitHub();
  };
  dd.querySelector('#auth-github-reg-btn').onclick = () => {
    supabaseAuth.signInWithGitHub();
  };

  // ── 登录 ───────────────────────────────────────────────
  dd.querySelector('#auth-login-btn').onclick = async () => {
    const email = dd.querySelector('#auth-email').value.trim();
    const password = dd.querySelector('#auth-password').value;
    const errorEl = dd.querySelector('#auth-error');

    if (!email || !password) {
      errorEl.textContent = '请填写邮箱和密码';
      return;
    }

    errorEl.textContent = '';
    dd.querySelector('#auth-login-btn').disabled = true;
    dd.querySelector('#auth-login-btn').textContent = '登录中...';

    const result = await supabaseAuth.signIn(email, password);

    dd.querySelector('#auth-login-btn').disabled = false;
    dd.querySelector('#auth-login-btn').textContent = '登录';

    if (result.success) {
      d.close();
      setTimeout(() => { d.destroy(); }, 300);
      // 登录成功后先同步云端数据，再开启自动同步（静默）
      cloudSync.download(true).catch(() => {}).finally(() => {
        cloudSync.config.autoSync = true;
        cloudSync.saveConfig();
        refreshUI();
      });
    } else {
      errorEl.textContent = result.error || '登录失败';
    }
  };

  // Enter 键登录
  dd.querySelector('#auth-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') dd.querySelector('#auth-login-btn').click();
  });

  // ── 注册 ───────────────────────────────────────────────
  dd.querySelector('#auth-register-btn').onclick = async () => {
    const email = dd.querySelector('#auth-reg-email').value.trim();
    const password = dd.querySelector('#auth-reg-password').value;
    const password2 = dd.querySelector('#auth-reg-password2').value;
    const errorEl = dd.querySelector('#auth-reg-error');

    if (!email || !password) {
      errorEl.textContent = '请填写邮箱和密码';
      return;
    }
    if (password.length < 6) {
      errorEl.textContent = '密码至少6位';
      return;
    }
    if (password !== password2) {
      errorEl.textContent = '两次密码不一致';
      return;
    }

    errorEl.textContent = '';
    dd.querySelector('#auth-register-btn').disabled = true;
    dd.querySelector('#auth-register-btn').textContent = '注册中...';

    const result = await supabaseAuth.signUp(email, password);

    dd.querySelector('#auth-register-btn').disabled = false;
    dd.querySelector('#auth-register-btn').textContent = '注册';

    if (result.success) {
      if (result.needsVerification) {
        errorEl.style.color = 'var(--theme-color)';
        errorEl.textContent = '注册成功！请查收邮件验证邮箱后登录';
      } else {
        d.close();
        setTimeout(() => { d.destroy(); }, 300);
        // 注册成功后先同步云端数据，再开启自动同步（静默）
        cloudSync.download(true).catch(() => {}).finally(() => {
          cloudSync.config.autoSync = true;
          cloudSync.saveConfig();
          refreshUI();
        });
      }
    } else {
      errorEl.textContent = result.error || '注册失败';
    }
  };

  // Enter 键注册
  dd.querySelector('#auth-reg-password2').addEventListener('keydown', e => {
    if (e.key === 'Enter') dd.querySelector('#auth-register-btn').click();
  });

  // ── 忘记密码 ───────────────────────────────────────────
  dd.querySelector('#auth-forgot-btn').onclick = () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    forgotForm.style.display = '';
    tabs.forEach(t => t.classList.remove('active'));
  };

  dd.querySelector('#auth-back-login-btn').onclick = () => {
    loginForm.style.display = '';
    registerForm.style.display = 'none';
    forgotForm.style.display = 'none';
    tabs[0].classList.add('active');
  };

  dd.querySelector('#auth-reset-btn').onclick = async () => {
    const email = dd.querySelector('#auth-reset-email').value.trim();
    const errorEl = dd.querySelector('#auth-reset-error');

    if (!email) {
      errorEl.textContent = '请填写邮箱';
      return;
    }

    errorEl.textContent = '';
    dd.querySelector('#auth-reset-btn').disabled = true;
    dd.querySelector('#auth-reset-btn').textContent = '发送中...';

    const result = await supabaseAuth.resetPassword(email);

    dd.querySelector('#auth-reset-btn').disabled = false;
    dd.querySelector('#auth-reset-btn').textContent = '发送重置邮件';

    if (result.success) {
      errorEl.style.color = 'var(--theme-color)';
      errorEl.textContent = '重置邮件已发送，请查收';
    } else {
      errorEl.textContent = result.error || '发送失败';
    }
  };
}

// ── 刷新 UI 状态 ──────────────────────────────────────────
function refreshUI() {
  updateAuthStatusIcon();
  if (loginStatusItem) loginStatusItem.reGet();
  if (lastSyncItem) lastSyncItem.reGet();
  if (uploadItem) uploadItem.reInit();
  if (downloadItem) downloadItem.reInit();
  if (autoSyncItem) autoSyncItem.reInit();
}

// ── 登录状态 ─────────────────────────────────────────────
const loginStatusItem = new SettingItem({
  type: 'null',
  title: '账号状态',
  index: 1,
  get() {
    if (cloudSync.isAuthenticated()) {
      return cloudSync.getEmail();
    }
    return '未登录';
  },
  callback() {
    if (cloudSync.isAuthenticated()) {
      confirm('确定要退出登录吗？', async ok => {
        if (ok) {
          await supabaseAuth.signOut();
          refreshUI();
        }
      });
    } else {
      showLoginDialog();
    }
  },
});

// ── 上传 ─────────────────────────────────────────────────
const uploadItem = new SettingItem({
  type: 'null',
  title: '上传到云端',
  message: '将本地链接数据上传到云端',
  index: 2,
  check() { return cloudSync.isAuthenticated(); },
  callback() {
    cloudSync.upload().then(() => lastSyncItem.reGet());
  },
});

// ── 下载 ─────────────────────────────────────────────────
const downloadItem = new SettingItem({
  type: 'null',
  title: '同步云端数据',
  message: '合并本地与云端的链接数据（去重，不丢失）',
  index: 3,
  check() { return cloudSync.isAuthenticated(); },
  callback() {
    cloudSync.download().then(res => {
      if (res.success) {
        lastSyncItem.reGet();
        toast.show('建议刷新页面以显示最新数据');
      }
    });
  },
});

// ── 自动同步 ─────────────────────────────────────────────
const autoSyncItem = new SettingItem({
  type: 'boolean',
  title: '自动同步',
  message: '数据变更时自动上传到云端',
  index: 4,
  check() { return cloudSync.isAuthenticated(); },
  get()       { return cloudSync.config.autoSync; },
  callback(v) { cloudSync.config.autoSync = v; cloudSync.saveConfig(); },
});

// ── 上次同步时间 ──────────────────────────────────────────
const lastSyncItem = new SettingItem({
  type: 'null',
  title: '上次同步',
  index: 5,
  check() { return cloudSync.isAuthenticated(); },
  get() {
    const t = cloudSync.getLastSyncTime();
    return t ? new Date(t).toLocaleString('zh-CN') : '从未同步';
  },
});

// ── 加入分组 ──────────────────────────────────────────────
cloudGroup.addNewItem(loginStatusItem);
cloudGroup.addNewItem(uploadItem);
cloudGroup.addNewItem(downloadItem);
cloudGroup.addNewItem(autoSyncItem);
cloudGroup.addNewItem(lastSyncItem);

// ── 修改密码对话框 ────────────────────────────────────────
function showResetPasswordDialog() {
  const d = new dialog({
    content: `
      <div class="auth-dialog">
        <div class="auth-tabs">
          <button class="auth-tab active">设置新密码</button>
        </div>
        <div class="auth-form">
          <div class="auth-field">
            <label>新密码</label>
            <input type="password" id="auth-new-password" placeholder="至少6位新密码" autocomplete="new-password"/>
          </div>
          <div class="auth-field">
            <label>确认新密码</label>
            <input type="password" id="auth-new-password2" placeholder="再次输入新密码" autocomplete="new-password"/>
          </div>
          <div class="auth-actions">
            <button class="btn ok" id="auth-update-pwd-btn">确认修改</button>
          </div>
          <div class="auth-error" id="auth-pwd-error"></div>
        </div>
      </div>
    `,
    clickOtherToClose: false,
  });

  setTimeout(() => { d.open(); }, 10);
  const dd = d.getDialogDom();

  dd.querySelector('#auth-update-pwd-btn').onclick = async () => {
    const pwd = dd.querySelector('#auth-new-password').value;
    const pwd2 = dd.querySelector('#auth-new-password2').value;
    const errorEl = dd.querySelector('#auth-pwd-error');

    if (!pwd) {
      errorEl.textContent = '请输入新密码';
      return;
    }
    if (pwd.length < 6) {
      errorEl.textContent = '密码至少6位';
      return;
    }
    if (pwd !== pwd2) {
      errorEl.textContent = '两次密码不一致';
      return;
    }

    errorEl.textContent = '';
    dd.querySelector('#auth-update-pwd-btn').disabled = true;
    dd.querySelector('#auth-update-pwd-btn').textContent = '修改中...';

    const result = await supabaseAuth.updatePassword(pwd);

    dd.querySelector('#auth-update-pwd-btn').disabled = false;
    dd.querySelector('#auth-update-pwd-btn').textContent = '确认修改';

    if (result.success) {
      d.close();
      setTimeout(() => { d.destroy(); }, 300);
      refreshUI();
    } else {
      errorEl.textContent = result.error || '修改失败';
    }
  };

  dd.querySelector('#auth-new-password2').addEventListener('keydown', e => {
    if (e.key === 'Enter') dd.querySelector('#auth-update-pwd-btn').click();
  });
}

// ── 注册密码重置回调 ──────────────────────────────────────
supabaseAuth._onPasswordRecovery = showResetPasswordDialog;

// ── 数据变更时自动同步到云端 ──────────────────────────────
let _autoSyncTimer = null;
let _autoSyncing = false;
storage.on('storage', () => {
  if (!cloudSync.config.autoSync || !cloudSync.isAuthenticated()) return;
  // 上传期间不再触发，避免 saveConfig → storage事件 → 无限循环
  if (_autoSyncing) return;
  // 防抖：5秒内多次变更只触发一次上传
  clearTimeout(_autoSyncTimer);
  _autoSyncTimer = setTimeout(() => {
    _autoSyncing = true;
    cloudSync.upload(true).catch(() => {}).finally(() => {
      // 延迟释放锁，让 saveConfig 触发的 storage 事件被忽略
      setTimeout(() => { _autoSyncing = false; }, 2000);
    });
  }, 5000);
});

// ── 初始化：恢复登录状态 ──────────────────────────────────
supabaseAuth.init().then((isAuth) => {
  refreshUI();
  if (isAuth) {
    // 登录后先从云端同步数据到本地，再开启自动同步
    // 静默模式，不弹toast
    cloudSync.download(true).catch(() => {}).finally(() => {
      cloudSync.config.autoSync = true;
      cloudSync.saveConfig();
    });
  }
});

module.exports = {};

}),93:(function(_r,module){// 云端同步模块 - Supabase Auth（基于用户登录）
// 只同步链接数据，使用 link 模块的正确接口读写 IndexedDB
// 支持增删同步：通过快照对比计算本地增删，应用到云端
const { gS } = _r(8);
const toast = _r(6);
const supabaseAuth = _r(94);
const link = _r(29);

const SUPABASE_URL = 'https://prdcrawrgyjoqchwigwi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SuO0A9cl2DH6Ru-_OPFFYA_SvOAdl-F';
const TABLE = 'sync_data';

// ── Supabase REST 请求封装 ─────────────────────────────────
async function sbFetch(path, options = {}) {
  const accessToken = supabaseAuth.getAccessToken();
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });
    if (res.status === 204) return null;
    const text = await res.text();
    if (!text || !text.trim()) return null;
    const json = JSON.parse(text);
    if (!res.ok) {
      const errMsg = json.message || json.error || json.msg || `HTTP ${res.status}`;
      throw new Error(errMsg);
    }
    return json;
  } catch (error) {
    if (error.message && error.message.includes('JSON')) {
      throw new Error('服务器响应格式错误');
    }
    throw error;
  }
}

// ── 兼容旧格式数据（之前上传的 {code:0,data:[...]} 包装对象）────
function unwrapData(obj) {
  if (!obj) return obj;
  // 如果是数组，直接返回
  if (Array.isArray(obj)) return obj;
  // 如果是 {code:0, data:[...]} 包装对象，提取 .data
  if (obj && typeof obj === 'object' && obj.data !== undefined && obj.code !== undefined) {
    return obj.data;
  }
  return obj;
}

// ── 链接标识（用于去重和对比）──────────────────────────────
function linkKey(l) {
  return l.title + '\x00' + l.url;
}

// ── 基于快照的智能合并 ────────────────────────────────────
// snapshot: 上次同步后的数据快照
// local: 当前本地数据
// cloud: 当前云端数据
// 逻辑：
//   本地新增 = local 有但 snapshot 没有的 → 加入结果
//   本地删除 = snapshot 有但 local 没有的 → 从结果中移除
//   云端新增 = cloud 有但 snapshot 没有的 → 加入结果（另一设备的添加）
//   云端删除 = snapshot 有但 cloud 没有的 → 从结果中移除（另一设备的删除）
//   两端都有 = 保留
function smartMergeLinks(local, cloud, snapshot) {
  const localArr = Array.isArray(local) ? local : [];
  const cloudArr = Array.isArray(cloud) ? cloud : [];
  const snapArr = Array.isArray(snapshot) ? snapshot : [];

  const snapSet = new Set(snapArr.map(linkKey));
  const localSet = new Set(localArr.map(linkKey));
  const cloudSet = new Set(cloudArr.map(linkKey));

  // 本地删除的链接：快照中有但本地没有
  const localDeleted = new Set();
  snapSet.forEach(k => { if (!localSet.has(k)) localDeleted.add(k); });

  // 云端删除的链接：快照中有但云端没有
  const cloudDeleted = new Set();
  snapSet.forEach(k => { if (!cloudSet.has(k)) cloudDeleted.add(k); });

  // 合并：取本地和云端的并集，再移除两端删除的
  const merged = [];
  const seen = new Set();

  // 先加本地链接
  for (const l of localArr) {
    const k = linkKey(l);
    if (!seen.has(k) && !cloudDeleted.has(k)) {
      merged.push(l);
      seen.add(k);
    }
  }
  // 再加云端链接（本地没有的）
  for (const l of cloudArr) {
    const k = linkKey(l);
    if (!seen.has(k) && !localDeleted.has(k)) {
      merged.push(l);
      seen.add(k);
    }
  }

  return merged;
}

// ── 分类数据智能合并 ──────────────────────────────────────
function smartMergeCate(local, cloud, snapshot) {
  const localCate = local && typeof local === 'object' ? local : {};
  const cloudCate = cloud && typeof cloud === 'object' ? cloud : {};
  const snapCate = snapshot && typeof snapshot === 'object' ? snapshot : {};

  // 收集所有分类名
  const allCateNames = new Set([
    ...Object.keys(localCate),
    ...Object.keys(cloudCate),
    ...Object.keys(snapCate),
  ]);

  const merged = {};
  for (const name of allCateNames) {
    const localLinks = localCate[name] || [];
    const cloudLinks = cloudCate[name] || [];
    const snapLinks = snapCate[name] || [];

    // 如果本地和云端都没有该分类的链接了，跳过（分类被删除）
    if (localLinks.length === 0 && cloudLinks.length === 0) continue;

    merged[name] = smartMergeLinks(localLinks, cloudLinks, snapLinks);
    // 如果合并后为空，移除该分类
    if (merged[name].length === 0) delete merged[name];
  }

  return merged;
}

// ── 分类名列表智能合并 ────────────────────────────────────
function smartMergeCateLists(local, cloud, snapshot) {
  const localList = Array.isArray(local) ? local : [];
  const cloudList = Array.isArray(cloud) ? cloud : [];
  const snapList = Array.isArray(snapshot) ? snapshot : [];

  const snapSet = new Set(snapList);
  const localSet = new Set(localList);
  const cloudSet = new Set(cloudList);

  // 本地删除的分类：快照中有但本地没有
  const localDeleted = new Set();
  snapSet.forEach(k => { if (!localSet.has(k)) localDeleted.add(k); });

  // 云端删除的分类：快照中有但云端没有
  const cloudDeleted = new Set();
  snapSet.forEach(k => { if (!cloudSet.has(k)) cloudDeleted.add(k); });

  const merged = [];
  const seen = new Set();

  for (const name of localList) {
    if (!seen.has(name) && !cloudDeleted.has(name)) {
      merged.push(name);
      seen.add(name);
    }
  }
  for (const name of cloudList) {
    if (!seen.has(name) && !localDeleted.has(name)) {
      merged.push(name);
      seen.add(name);
    }
  }

  return merged;
}

class CloudSync {
  constructor() {
    this.config = this._loadConfig();
  }

  _loadConfig() {
    const sto = gS('sync');
    return sto.config || { lastSync: null, autoSync: false, snapshot: null };
  }

  saveConfig() {
    const sto = gS('sync');
    sto.config = this.config;
  }

  getLastSyncTime() { return this.config.lastSync; }

  isAuthenticated() { return supabaseAuth.isAuthenticated(); }
  getUser()         { return supabaseAuth.getUser(); }
  getEmail()        { return supabaseAuth.getEmail(); }
  getUserId()       { return supabaseAuth.getUserId(); }

  isEnabled()  { return this.isAuthenticated(); }
  enable()     {}
  disable()    {}

  // ── 收集本地链接数据（通过 link 模块的正确接口）──────
  async getLocalLinkData() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('读取本地数据超时'));
      }, 10000);
      link.ready(() => {
        link.getCateAll((res) => {
          const cate = res.data || {};
          link.getLinks(null, (res2) => {
            const links = res2.data || [];
            link.getCates((res3) => {
              const catelist = res3.data || [];
              clearTimeout(timeout);
              resolve({ links, cate, catelist });
            });
          });
        });
      });
    });
  }

  // ── 保存快照 ────────────────────────────────────────────
  _saveSnapshot(linkData) {
    this.config.snapshot = linkData;
    this.saveConfig();
    this._saveSnapshotToCloud(linkData);
  }

  async _saveSnapshotToCloud(snapshot) {
    if (!this.isAuthenticated()) return;
    try {
      const user_id = this.getUserId();
      const existing = await sbFetch(
        `${TABLE}?user_id=eq.${encodeURIComponent(user_id)}&select=user_id`
      );
      if (existing && existing.length > 0) {
        await sbFetch(`${TABLE}?user_id=eq.${encodeURIComponent(user_id)}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify({ snapshot }),
        });
      }
    } catch (error) {
      console.error('[Sync] Save snapshot to cloud error:', error);
    }
  }

  // ── 获取快照 ────────────────────────────────────────────
  _getSnapshot() {
    return this.config.snapshot || null;
  }

  async _restoreSnapshotFromCloud() {
    if (!this.isAuthenticated()) return null;
    try {
      const user_id = this.getUserId();
      const rows = await sbFetch(
        `${TABLE}?user_id=eq.${encodeURIComponent(user_id)}&select=snapshot`
      );
      if (rows && rows.length > 0 && rows[0].snapshot) {
        const snapshot = rows[0].snapshot;
        this.config.snapshot = snapshot;
        this.saveConfig();
        return snapshot;
      }
    } catch (error) {
      console.error('[Sync] Restore snapshot from cloud error:', error);
    }
    return null;
  }

  // ── 上传到 Supabase（基于快照的增删同步）──────────────
  async upload(silent) {
    if (!this.isAuthenticated()) {
      if (!silent) toast.show('请先登录后再同步');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      if (!silent) toast.show('正在同步...');

      const user_id = this.getUserId();
      const localLinkData = await this.getLocalLinkData();
      let snapshot = this._getSnapshot();

      // 读取云端数据（同时获取 snapshot 用于恢复）
      let cloudLinkData = null;
      let cloudSnapshot = null;
      const existing = await sbFetch(
        `${TABLE}?user_id=eq.${encodeURIComponent(user_id)}&select=data,snapshot`
      );
      if (existing && existing.length > 0) {
        if (existing[0].data?.link) {
          cloudLinkData = existing[0].data.link;
          cloudLinkData = {
            links: unwrapData(cloudLinkData.links) || [],
            cate: unwrapData(cloudLinkData.cate) || {},
            catelist: unwrapData(cloudLinkData.catelist) || [],
          };
        }
        cloudSnapshot = existing[0].snapshot || null;
      }

      // 本地快照丢失时，从云端恢复
      if (!snapshot && cloudSnapshot) {
        snapshot = cloudSnapshot;
        this.config.snapshot = snapshot;
        this.saveConfig();
      }

      // 基于快照智能合并
      let mergedLinkData;
      if (snapshot && cloudLinkData) {
        mergedLinkData = {
          links: smartMergeLinks(localLinkData.links, cloudLinkData.links, snapshot.links),
          cate: smartMergeCate(localLinkData.cate, cloudLinkData.cate, snapshot.cate),
          catelist: smartMergeCateLists(localLinkData.catelist, cloudLinkData.catelist, snapshot.catelist),
        };
      } else if (cloudLinkData) {
        // 无快照（首次同步），只做简单合并（添加不删除）
        mergedLinkData = {
          links: smartMergeLinks(localLinkData.links, cloudLinkData.links, []),
          cate: smartMergeCate(localLinkData.cate, cloudLinkData.cate, {}),
          catelist: smartMergeCateLists(localLinkData.catelist, cloudLinkData.catelist, []),
        };
      } else {
        mergedLinkData = localLinkData;
      }

      const updated_at = new Date().toISOString();
      const data = { link: mergedLinkData };

      if (existing && existing.length > 0) {
        await sbFetch(`${TABLE}?user_id=eq.${encodeURIComponent(user_id)}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify({ data, snapshot: mergedLinkData, updated_at }),
        });
      } else {
        await sbFetch(TABLE, {
          method: 'POST',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify({ user_id, data, snapshot: mergedLinkData, updated_at }),
        });
      }

      // 更新快照为合并后的数据
      this._saveSnapshot(mergedLinkData);
      this.config.lastSync = updated_at;
      this.saveConfig();

      if (!silent) toast.show('同步成功 ✓');
      return { success: true };

    } catch (error) {
      if (!silent) toast.show('同步失败: ' + error.message);
      console.error('[Sync] upload error:', error);
      return { success: false, error: error.message };
    }
  }

  // ── 从 Supabase 下载并合并到本地 ────────────────────────
  async download(silent) {
    if (!this.isAuthenticated()) {
      if (!silent) toast.show('请先登录后再同步');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      if (!silent) toast.show('正在同步...');
      const user_id = this.getUserId();

      const rows = await sbFetch(
        `${TABLE}?user_id=eq.${encodeURIComponent(user_id)}&select=data,updated_at`
      );

      if (!rows || rows.length === 0) {
        if (!silent) toast.show('云端暂无数据，先上传本地数据');
        return await this.upload(silent);
      }

      let cloudLinkData = rows[0].data?.link;
      if (cloudLinkData) {
        // 兼容旧格式：解包 {code:0, data:[...]} 包装对象
        cloudLinkData = {
          links: unwrapData(cloudLinkData.links) || [],
          cate: unwrapData(cloudLinkData.cate) || {},
          catelist: unwrapData(cloudLinkData.catelist) || [],
        };
      }
      if (!cloudLinkData) {
        if (!silent) toast.show('云端无链接数据，先上传本地数据');
        return await this.upload(silent);
      }

      const localLinkData = await this.getLocalLinkData();
      let snapshot = this._getSnapshot();

      // 本地快照丢失时，从云端恢复
      const cloudSnapshot = rows[0].snapshot || null;
      if (!snapshot && cloudSnapshot) {
        snapshot = cloudSnapshot;
        this.config.snapshot = snapshot;
        this.saveConfig();
      }

      // 基于快照智能合并
      let mergedLinks, mergedCate, mergedCateList;
      if (snapshot) {
        mergedLinks = smartMergeLinks(localLinkData.links, cloudLinkData.links, snapshot.links);
        mergedCate = smartMergeCate(localLinkData.cate, cloudLinkData.cate, snapshot.cate);
        mergedCateList = smartMergeCateLists(localLinkData.catelist, cloudLinkData.catelist, snapshot.catelist);
      } else {
        // 无快照（首次同步），只做简单合并
        mergedLinks = smartMergeLinks(localLinkData.links, cloudLinkData.links, []);
        mergedCate = smartMergeCate(localLinkData.cate, cloudLinkData.cate, {});
        mergedCateList = smartMergeCateLists(localLinkData.catelist, cloudLinkData.catelist, []);
      }

      // 写回本地
      await new Promise((resolve) => {
        link.setAll(mergedLinks, mergedCate, () => {
          const sto = gS('link');
          if (sto) sto.catelist = mergedCateList;
          resolve();
        });
      });

      // 上传合并结果到云端
      const updated_at = new Date().toISOString();
      const mergedLinkData = { links: mergedLinks, cate: mergedCate, catelist: mergedCateList };
      const data = { link: mergedLinkData };
      await sbFetch(`${TABLE}?user_id=eq.${encodeURIComponent(user_id)}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify({ data, snapshot: mergedLinkData, updated_at }),
      });

      // 更新快照
      this._saveSnapshot(mergedLinkData);
      this.config.lastSync = updated_at;
      this.saveConfig();

      if (!silent) toast.show('同步成功，数据已合并 ✓');
      return { success: true };

    } catch (error) {
      if (!silent) toast.show('同步失败: ' + error.message);
      console.error('[Sync] download error:', error);
      return { success: false, error: error.message };
    }
  }

  // ── 自动同步 ──────────────────────────────────────────────
  async autoSync() {
    if (this.config.autoSync && this.isAuthenticated()) {
      return await this.upload(true);
    }
  }
}

const cloudSync = new CloudSync();
module.exports = cloudSync;

}),94:(function(_r,module){// Supabase Auth 认证模块 - 使用 Email 登录
const { gS } = _r(8);
const toast = _r(6);

const SUPABASE_URL = 'https://prdcrawrgyjoqchwigwi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SuO0A9cl2DH6Ru-_OPFFYA_SvOAdl-F';

// ── Supabase Auth API 封装 ─────────────────────────────────
class SupabaseAuth {
  constructor() {
    this.currentUser = null;
    this.session = null;
    this.config = this._loadConfig();
  }

  // ── 配置管理 ──────────────────────────────────────────────
  _loadConfig() {
    const sto = gS('sync');
    return sto.authConfig || { 
      lastSync: null, 
      autoSync: false,
      rememberMe: true 
    };
  }

  saveConfig() {
    const sto = gS('sync');
    sto.authConfig = this.config;
  }

  // ── 认证状态管理 ──────────────────────────────────────────
  _saveSession(session) {
    if (this.config.rememberMe && session) {
      localStorage.setItem('sb_session', JSON.stringify(session));
    }
    this.session = session;
    this.currentUser = session?.user || null;
  }

  _loadSession() {
    const saved = localStorage.getItem('sb_session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        if (session.refresh_token) {
          // 即使 access_token 过期，也先恢复 session（后续用 refresh_token 刷新）
          this.session = session;
          this.currentUser = session.user;
          // 标记 token 是否已过期，供 init() 判断是否需要立即刷新
          this._tokenExpired = !session.expires_at || new Date(session.expires_at * 1000) <= new Date();
          return true;
        }
      } catch (e) {
        console.error('[Auth] Load session error:', e);
      }
    }
    return false;
  }

  _clearSession() {
    localStorage.removeItem('sb_session');
    this.session = null;
    this.currentUser = null;
  }

  // ── API 请求封装 ──────────────────────────────────────────
  async _request(endpoint, options = {}) {
    const url = `${SUPABASE_URL}/auth/v1/${endpoint}`;
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    };

    // 仅对需要认证的端点添加 Authorization header
    // token/signup/recover 等端点不需要 Authorization
    const authEndpoints = ['user', 'logout'];
    const needsAuth = authEndpoints.some(ep => endpoint.startsWith(ep) || endpoint === ep);
    if (needsAuth && this.session?.access_token) {
      headers['Authorization'] = `Bearer ${this.session.access_token}`;
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers: { ...headers, ...(options.headers || {}) },
      });

      const text = await res.text();
      
      if (!text || !text.trim()) {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return null;
      }

      const json = JSON.parse(text);
      
      if (!res.ok) {
        const errMsg = json.msg || json.message || json.error_description || json.error || `HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      return json;
    } catch (error) {
      console.error('[Auth] Request error:', error);
      throw error;
    }
  }

  // ── 注册 ──────────────────────────────────────────────────
  async signUp(email, password) {
    try {
      toast.show('正在注册...');
      
      const result = await this._request('signup', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        }),
      });

      if (result.user) {
        if (result.session) {
          // 如果不需要邮箱验证，直接登录
          this._saveSession(result.session);
          toast.show('注册成功！已自动登录 ✓');
        } else {
          // 需要邮箱验证
          toast.show('注册成功！请查收邮件并验证邮箱');
        }
        return { success: true, user: result.user, needsVerification: !result.session };
      }

      throw new Error('注册失败');
    } catch (error) {
      // 友好化常见错误提示
      let msg = error.message;
      if (msg.includes('user_already_exists') || msg.includes('User already registered')) {
        msg = '该邮箱已注册，请直接登录';
      } else if (msg.includes('Password should be')) {
        msg = '密码强度不足，至少需要6位';
      } else if (msg.includes('Invalid email')) {
        msg = '邮箱格式不正确';
      } else if (msg.includes('422')) {
        msg = '该邮箱已注册，请直接登录';
      }
      toast.show('注册失败: ' + msg);
      return { success: false, error: msg, code: 'user_already_exists' };
    }
  }

  // ── 登录 ──────────────────────────────────────────────────
  async signIn(email, password) {
    try {
      toast.show('正在登录...');
      
      // Supabase Auth: grant_type 必须作为 URL 查询参数
      const result = await this._request('token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (result.access_token) {
        const session = {
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + result.expires_in,
          user: result.user,
        };
        
        this._saveSession(session);
        toast.show('登录成功 ✓');
        return { success: true, user: result.user };
      }

      throw new Error('登录失败');
    } catch (error) {
      // 友好化常见错误提示
      let msg = error.message;
      if (msg.includes('Invalid login credentials')) {
        msg = '邮箱或密码不正确';
      } else if (msg.includes('Email not confirmed')) {
        msg = '邮箱未验证，请查收验证邮件';
      } else if (msg.includes('429')) {
        msg = '请求过于频繁，请稍后再试';
      }
      toast.show('登录失败: ' + msg);
      return { success: false, error: msg };
    }
  }

  // ── GitHub OAuth 登录 ────────────────────────────────────
  signInWithGitHub() {
    // Supabase OAuth 流程：
    // 1. 重定向到 Supabase 的 /auth/v1/authorize 端点
    // 2. Supabase 回调到自己的 /auth/v1/callback
    // 3. Supabase 重定向到 redirect_to，在 URL hash 中携带 token
    // redirect_to 必须在 Supabase Dashboard → Authentication → Redirect URLs 中配置
    const redirectTo = window.location.origin + window.location.pathname;
    const url = `${SUPABASE_URL}/auth/v1/authorize?provider=github&redirect_to=${encodeURIComponent(redirectTo)}`;
    window.location.href = url;
  }

  // ── 处理 OAuth 回调（页面加载时从 URL hash 恢复 session）────
  handleOAuthCallback() {
    const hash = window.location.hash.substring(1);
    if (!hash) return false;
    
    const params = new URLSearchParams(hash);
    
    // 优先检查错误（如 otp_expired、access_denied 等）
    const error = params.get('error');
    const error_code = params.get('error_code');
    const error_description = params.get('error_description');
    if (error) {
      // 友好化错误提示
      if (error_code === 'otp_expired' || error_description?.includes('expired')) {
        this._oauthError = '链接已过期，请重新发送重置邮件';
      } else if (error === 'access_denied') {
        this._oauthError = '访问被拒绝';
      } else {
        this._oauthError = error_description || error;
      }
      this._cleanHash();
      return false;
    }
    
    const access_token = params.get('access_token');
    if (!access_token) return false;
    
    const refresh_token = params.get('refresh_token');
    const expires_in = params.get('expires_in');
    const expires_at = params.get('expires_at');
    const type = params.get('type'); // 'signup' | 'recovery' | etc.
    
    // 解析 JWT 获取用户信息
    let user = null;
    try {
      const payload = access_token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      user = {
        id: decoded.sub,
        email: decoded.email || '',
        aud: decoded.aud,
        role: decoded.role,
        user_metadata: decoded.user_metadata || {},
        app_metadata: decoded.app_metadata || {},
      };
    } catch (e) {
      console.error('[Auth] Parse token error:', e);
    }
    
    const session = {
      access_token,
      refresh_token,
      expires_at: expires_at ? parseInt(expires_at) : Math.floor(Date.now() / 1000) + parseInt(expires_in || 3600),
      token_type: params.get('token_type') || 'bearer',
      user,
    };
    
    this._saveSession(session);
    this._oauthSuccess = true;
    this._oauthType = type;
    
    // 清除 URL hash，避免 token 暴露在地址栏
    this._cleanHash();
    
    return true;
  }

  // ── 清除 URL hash ────────────────────────────────────────
  _cleanHash() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  // ── 登出 ──────────────────────────────────────────────────
  async signOut() {
    this._stopRefreshTimer();
    try {
      if (this.session?.access_token) {
        await this._request('logout', {
          method: 'POST',
        });
      }
      
      this._clearSession();
      toast.show('已退出登录');
      return { success: true };
    } catch (error) {
      // 即使 API 失败，也清除本地 session
      this._clearSession();
      toast.show('已退出登录');
      return { success: true };
    }
  }

  // ── 获取当前用户 ──────────────────────────────────────────
  async getCurrentUser() {
    if (!this.session?.access_token) {
      return null;
    }

    try {
      const user = await this._request('user');
      this.currentUser = user;
      return user;
    } catch (error) {
      // 网络错误不清除 session（可能是 SW 拦截或临时断网）
      // 只有 401/403 等认证错误才清除
      if (error.message && (error.message.includes('401') || error.message.includes('403') || error.message.includes('JWT'))) {
        this._clearSession();
      }
      return null;
    }
  }

  // ── 重置密码 ──────────────────────────────────────────────
  async resetPassword(email) {
    try {
      toast.show('正在发送重置邮件...');
      
      await this._request('recover', {
        method: 'POST',
        body: JSON.stringify({ 
          email,
          redirectTo: `${window.location.origin}?reset-password=true`
        }),
      });

      toast.show('重置邮件已发送，请查收');
      return { success: true };
    } catch (error) {
      toast.show('发送失败: ' + error.message);
      return { success: false, error: error.message };
    }
  }

  // ── 更新密码 ──────────────────────────────────────────────
  async updatePassword(newPassword) {
    try {
      toast.show('正在更新密码...');
      
      const result = await this._request('user', {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword }),
      });

      toast.show('密码已更新 ✓');
      return { success: true, user: result };
    } catch (error) {
      toast.show('更新失败: ' + error.message);
      return { success: false, error: error.message };
    }
  }

  // ── 刷新 Token ────────────────────────────────────────────
  async refreshSession() {
    if (!this.session?.refresh_token) {
      return false;
    }

    try {
      // Supabase Auth: grant_type 必须作为 URL 查询参数
      const result = await this._request('token?grant_type=refresh_token', {
        method: 'POST',
        body: JSON.stringify({
          refresh_token: this.session.refresh_token,
        }),
      });

      if (result.access_token) {
        const session = {
          access_token: result.access_token,
          refresh_token: result.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + result.expires_in,
          user: result.user,
        };
        
        this._saveSession(session);
        return true;
      }
    } catch (error) {
      console.error('[Auth] Refresh session error:', error);
      // 只有认证错误（refresh_token 也过期/无效）才清除 session
      // 网络错误保留 session，下次定时器会重试
      const msg = error.message || '';
      if (msg.includes('401') || msg.includes('403') || msg.includes('JWT') || msg.includes('expired') || msg.includes('invalid')) {
        this._clearSession();
      }
    }
    
    return false;
  }

  // ── 初始化（自动恢复 session + 处理 OAuth 回调）──────────
  async init() {
    // 优先检查 OAuth 回调（URL hash 中有 token）
    if (this.handleOAuthCallback()) {
      // 延迟显示 toast，等 toast 模块初始化完成
      setTimeout(() => {
        if (this._oauthSuccess) {
          if (this._oauthType === 'recovery') {
            toast.show('密码重置验证成功，请设置新密码');
            // 触发密码重置回调，让 cloud-ui 弹出修改密码对话框
            if (this._onPasswordRecovery) this._onPasswordRecovery();
          } else {
            toast.show('GitHub 登录成功 ✓');
          }
          this._oauthSuccess = false;
        }
      }, 500);
      this._startRefreshTimer();
      return this.isAuthenticated();
    }

    // OAuth 回调有错误
    if (this._oauthError) {
      const err = this._oauthError;
      this._oauthError = null;
      setTimeout(() => { toast.show('登录失败: ' + err); }, 500);
      return false;
    }

    // 尝试从 localStorage 恢复 session
    if (this._loadSession()) {
      if (this._tokenExpired) {
        // access_token 已过期，立即用 refresh_token 刷新
        const refreshed = await this.refreshSession();
        if (!refreshed) {
          // 刷新也失败，session 彻底无效
          return false;
        }
      } else {
        // token 未过期，异步验证有效性
        this.getCurrentUser().then(user => {
          if (!user) {
            // 验证失败，尝试用 refresh_token 刷新
            this.refreshSession();
          }
        });
      }
      this._startRefreshTimer();
    }
    
    return this.isAuthenticated();
  }

  // ── 状态检查 ──────────────────────────────────────────────
  isAuthenticated() {
    return !!this.currentUser && !!this.session?.access_token;
  }

  // ── 定时刷新 Token ────────────────────────────────────────
  // 每 10 分钟检查一次，在 access_token 过期前 5 分钟自动刷新
  // 只要 refresh_token 有效（Supabase 默认永不过期），登录状态就永远保持
  _refreshTimer = null;
  _refreshInterval = 10 * 60 * 1000;  // 10 分钟检查一次
  _refreshBuffer = 5 * 60;             // 提前 5 分钟刷新

  _startRefreshTimer() {
    this._stopRefreshTimer();
    this._refreshTimer = setInterval(() => {
      if (!this.session?.refresh_token) {
        this._stopRefreshTimer();
        return;
      }
      const expiresAt = this.session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      // 在过期前 5 分钟刷新，或已过期则立即刷新
      if (!expiresAt || now >= expiresAt - this._refreshBuffer) {
        this.refreshSession().then(ok => {
          if (!ok) {
            // 刷新失败，停止定时器（session 已被 clearSession 清除）
            this._stopRefreshTimer();
          }
        });
      }
    }, this._refreshInterval);
  }

  _stopRefreshTimer() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  getUser() {
    return this.currentUser;
  }

  getUserId() {
    return this.currentUser?.id || null;
  }

  getEmail() {
    if (!this.currentUser) return null;
    // 优先显示 email，GitHub 用户可能没有 email 则显示用户名
    return this.currentUser.email || this.currentUser.user_metadata?.preferred_username || this.currentUser.user_metadata?.full_name || this.currentUser.user_metadata?.name || '已登录';
  }

  getAccessToken() {
    return this.session?.access_token || null;
  }
}

const supabaseAuth = new SupabaseAuth();
module.exports = supabaseAuth;

}),95:(function(_r,module){// 快捷键

let { mainSetting } = _r(14);
let {setLite,isLite}=_r(60);
let {setShowCate,isShowCate}=_r(29);

document.on('keydown', function (e) {
    if (e.key == 's' && e.altKey) { // Alt+S打开设置
        e.preventDefault();
        mainSetting.open();
    } else if (e.key == 'x' && e.altKey) { //Alt+X开关极简模式
        e.preventDefault();
        setLite(!isLite());
    } else if (e.key == 'g' && e.altKey) { //Alt+G开关链接分组
        e.preventDefault();
        setShowCate(!isShowCate());
    }
});
}),96:(function(_r,module){const { confirm, alert } = _r(9);
const util = _r(5);
const dialog = _r(10);
var lichtml = _r(97);

function getLicense() {
  return lichtml;
}

module.exports = {
  lic: lichtml
};

}),97:(function(_r,module){module.exports=`<h1>Ehon起始页用户协议与隐私政策</h1><p><b>请务必认真阅读！</b></p><h2>一、Ehon起始页简介</h2><p>Ehon起始页（以下简称本产品）是一个开源免费的纯前端项目，以GPL 3.0 license声明，版权归原作者所有</p><h2>二、用户使用须知</h2><p>1.使用本产品即代表您同意本条款的所有内容。</p><p>2.<b>下面的插件使用须知更重要</b></p><p>3.本产品中的大部分图标使用Google开源的Material Outlined图标。</p><p>4.本产品中一言的“随机一言”功能、“今日诗词”功能、搜索联想功能、背景设置中的API背景、搜索框的“自动翻译”功能，均由第三方API提供，与Ehon起始页无关，如出现问题，Ehon起始页不负责任，但我们会尽量保证API的可用性</p><p>5.本产品的随机背景API均支持下载壁纸，但这些壁纸仅能用做壁纸，禁止商业化使用</p><h2>三、插件使用须知</h2><p>1.本产品提供插件拓展功能，使用本产品的插件拓展功能即代表您知晓并同意本条款的所有内容。</p><p>2.安装官方提供的插件需要您同意插件的用户协议与隐私政策，若与本协议存在出入，以本协议为准</p><p>3.安装来自第三方的不明插件是十分不安全的行为，同时请保证您的设备未被病毒程序感染，<b>否则本产品不能保证您的数据安全和使用安全！</b></p><h2>四、隐私政策</h2><p>1.本产品本身属于纯前端项目，不会收集除您的IP地址以外的任何信息，您的所有使用数据都会存在本地</p><p>2.如您安装了插件，插件可能会收集您的一些信息，详见插件的用户协议与隐私政策。</p><p>3.本产品中使用的一些API和站点服务提供者可能会收集您的IP地址、Cookie等信息用于数据分析和安全防护等</p><h2>五、免责声明</h2><p>1.本产品不对因使用本产品而导致的任何损失承担责任，包括但不限于因下载、安装、使用本产品而受到的损失、数据丢失等。</p><p>2.本产品不保证本产品所提供的全部功能或服务一定能满足您的要求，也不保证本产品所提供的服务不会中断或停机。</p><p>3.本产品对本条款的解释权归原作者所有。</p>`;}),98:(function(_r,module){const dialog = _r(10);
const { alert, confirm } = _r(9);
const toast = _r(6);
const util = _r(5);

window.version_code = 231;
window.version = {
  version: '2.8.11',
  version_code: window.version_code,
  updateTime: '2026/4/14',
  log: [
    {
        tag: "fix",
        content: "修复全分组显示修改时显示不正确的问题"
    },
    {
        tag: "change",
        content: "使用新架构构建（Beta）"
    }
  ]
}
if ('serviceWorker' in navigator && !window._dev) {
  navigator.serviceWorker.ready.then(registration => {
    window.swReg = registration;
    updateBySW(registration);
  });
  var _i=0;
  function updateBySW(registration) {
    util.xhr('./version', r => {
      try{
        var nv = parseInt(r);
      }catch(e){}
      if (nv > version_code) {
        if (window.isInframe && location.href.indexOf('://home.ehon.cn/') != -1) {
          alert('检测到新版本，安全原因无法在扩展中更新，即将打开新页面更新。', function () {
            window.open('https://home.ehon.cn/?update=1');
          })
        }else if(location.href.indexOf('://home.ehon.cn/') != -1&&_i==0){
          _i++;
          toast.show('发现新版本(版本序号：' + nv + ')，正在更新');
          registration.active.postMessage('update');
        } else {
          toast.show('发现新版本(版本序号：' + nv + ')，正在更新');
          registration.active.postMessage('update');
        }
      }
    }, () => {
      console.log('获取版本失败');
    })
  }
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data == 'updated') {
      confirm('新版本已准备就绪，是否刷新页面', v => {
        if (v) {
          localStorage.setItem('__q__s__', '1');
          location.reload();
        }
      })
    }
  });
}
var version_dia = null;
function showVersion() {
  if (!version_dia) {
    version_dia = new dialog({
      content: `<h1>版本更新</h1><div class="version_item">
<div class="version_item_title">版本号：${window.version.version}</div>
<div class="version_item_update_time">发布时间：${window.version.updateTime}</div>
<div class="version_update">${formatVersion(window.version.log)}</div>
</div><div class="footer"><div class="btn ok">我知道了</div></div>`,
      class: "update_dialog"
    });
    version_dia.getDialogDom().$('.btn.ok').onclick = () => {
      version_dia.close();
    }
  }

  setTimeout(() => {
    version_dia.open();
  })
}
if (localStorage.getItem('__q__s__')) {
  showVersion();
  localStorage.removeItem('__q__s__');
}

function formatVersion(fv) {
  var str = '', gl = {
    "new": "新增",
    "del": "删除",
    "fix": "修复",
    "change": "修改",
    "thanks": "感谢"
  };
  for (var i = 0; i < fv.length; i++) {
    str += '<div class="update_item"><div class="update_item_tag ' + fv[i].tag + '"><div>' + gl[fv[i].tag] + '</div></div><div class="update_item_content">' + fv[i].content + '</div></div>'
  }
  return str;
}

}),99:(function(_r,module){const {gS} = _r(8);

var stp = gS('oobe');
stp.agree = true;
stp.guided = true;

}),100:(function(_r,module){const omnibox=_r(21);
omnibox.on('beforeenter', (text) => {
    if (text == 'rainbowcatXehon') {
        localStorage.__ehon_egg__ = '1';
    }
});


setTimeout(() => {
    if (window.eggnow__) {

        console.log('egg');
        setTimeout(() => {
            var audio = el('audio', {
                src: './assets/nyan.mp3',
                // src:'./assets/nyan.mp3',
                loop: true,
                preload: true,
            });
            document.body.append(audio);
            $(".loading-f").html('<p>正在加载音频中...</p><img src="https://image.gmya.net/i/2024/08/22/66c694973aba5.gif"/>')
            audio.oncanplaythrough = function () {
                try { audio.play(); } catch (e) { }
                if (!audio.paused) {
                    dozm();
                }
                $(".loading-f p").html('CLICK TO PLAY 点击播放音乐');
                document.on('click', playAudio);
                function playAudio() {
                    audio.play();
                    dozm();
                    document.off('click', playAudio);
                }
            }
            $(".loading-f").classList.add('rainbow');


            function dozm() {
                var a;
                setTimeout(() => {
                    var d = 0, m = [
                        'Nyan Cat',
                        'Artist:桃音モモ',
                        'From:网易云音乐',
                    ];
                    $(".loading-f p").html(m[d]);
                    a = setInterval(() => {
                        d = d == m.length - 1 ? 0 : d + 1;
                        $(".loading-f p").html(m[d]);
                    }, 2000)
                }, 0)

                setTimeout(() => {
                    clearInterval(a);
                    var m ="nya",k="~!#&:^~";
                    function clm(){
                        let s='';
                        for(let i=0;i<13;i++){
                            if(Math.random()>0.5){
                                s+=m+k[Math.floor(Math.random()*k.length)]+" ";
                            }else{
                                s+=m+" ";
                            }
                        }
                        return s;
                    }
                    $(".loading-f p").html(clm());
                    a = setInterval(() => {
                        $(".loading-f p").html(clm());
                    }, 250)
                }, 8000)
                setTimeout(() => {
                    clearInterval(a);
                    var d = 0, m = [
                        '',
                        'nya',
                        'nya!',
                        'nay',
                        'n_ay',
                        'n_ya',
                        'nya?',
                        'nya~',
                        'nya',
                        'nyanya',
                        'nyan',
                        'nyan:',
                        'nyan..',
                        'ny',
                    ];
                    $(".loading-f p").html(m[d]);
                    a = setInterval(() => {
                        d = Math.floor(Math.random() * m.length);
                        $(".loading-f p").html('Ehon 起始页 - 彩蛋 - RainbowCat ' + m[d]);
                    }, 250)
                }, 35000)
                setTimeout(() => {
                    clearInterval(a);
                    a = setInterval(() => {
                        $(".loading-f p").html(randomString());
                    }, 100)
                }, 48000)
            }
        }, 4000);
        css(`.loading-f.rainbow{background:#036}.loading-f p{font-size:20px;line-height:36px;width:100%;color:#fff;position:absolute;top:0;left:0;text-align:center;}.loading-f img{${window.innerWidth > window.innerHeight ? 'height' : "width"}:100%;display:block;margin:0 auto}`)
    }
}, 10)
function randomString() {
    e = Math.random() * 6 + 17;
    var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678!@#$%^&*()_+~`-=[];'\\,./{}:\"|<>/?",
        a = t.length,
        n = "";
    for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}
}),101:(function(_r,module){const notice = _r(85);
const { SettingItem, SettingGroup, mainSetting } = _r(14);
const { storage, gS } = _r(8);
const toast = _r(6);

storage('hello', {
    sync: true,
    title: "Ehon问候",
    desc: "Ehon问候配置文件"
});

let stp=gS().hello;


if (!stp.init) {
    stp.name = '';
    stp.birth = '';
    stp.init = true;
    stp.enable = true;
}


var sg = new SettingGroup({
    title: "问候",
    index: 1,
});
mainSetting.addNewGroup(sg);

var si1 = new SettingItem({
    type: "boolean",
    title: "启用问候",
    message: "即每日打开页面时自动弹出的问候",
    get: function () {
        return stp.enable;
    },
    callback: function (v) {
        stp.enable=v;
        if (v) {
            si2.show();
            si3.show();
        } else {
            si2.hide();
            si3.hide();
        }
    }
})

var si2 = new SettingItem({
    type: "string",
    title: "称呼",
    message: "问候时的称呼",
    get: function () {
        return stp.name;
    },
    callback: function (v) {
        stp.name=v;
    }
})

var si3 = new SettingItem({
    type: "string",
    title: "生日",
    message: "格式：月日，如：0910（也许我们会祝你生日快乐呢？）",
    get: function () {
        return stp.birth;
    },
    check: function (v) {
        if (v == '') return true;
        var isv = /^[0-9]{4}$/.test(v);
        if (!isv) {
            toast.show("格式错误，请重新输入");
        }
        return isv;
    },
    callback: function (v) {
        stp.birth=v;
    }
})

sg.addNewItem(si1);
sg.addNewItem(si2);
sg.addNewItem(si3);

var times = {
    early: ["早安！$0", "$1你是怎么做到这么早起的！", "一大早就开始工作吗$2？那有点辛苦哦"],
    am: ["上午好！$0", "$1听说早起的人运气会好很多，不知道是不是真的", "$1我算了一卦，今天是属于你的吉日！"],
    noon: ["中午好！$0", "$1你是要来找电子榨菜吗？"],
    pm: ["下午好！$0"],
    night: ["晚上好！$0"],
    midnight: ["已经很晚了哦$2，早点休息吧！", "不要在意他人的看法，你独一无二，你是你自己的一束光", "你的身体是为了你的一生服务的，而不是为了Ehon"],
    ev: ["你好$2，我是天使", "不要在意他人的看法，你独一无二，你是你自己的一束光", "你的身体是为了你的一生服务的，而不是为了Ehon"]
}

function randomGet(arr) {
    var r;
    if (arr.length == 1) {
        r = arr[0];
    } else {
        if (Math.random() < 0.6) {
            r = arr[0];
        } else {
            r = arr[Math.floor(Math.random() * arr.length - 1) + 1];
        }
    }
    if(stp.name){
        return r.replace(/\$\d/g,'');
    }else{
        return r.replace("$0", stp.name).replace(/\$[12]/g, stp.name + '，');
    }
    
}

function sayHello(h) {
    let q='midnight';
    if (2 <= h && h <= 4) q="ev";
    else if (5 <= h && h <= 7) q="early";
    else if (8 <= h && h <= 11) q="am";
    else if (12 <= h && h <= 13) q="noon";
    else if (14 <= h && h <= 18) q="pm";
    else if (19 <= h && h <= 21) q="night";

    toast.show(randomGet(times[q]));
}

if (stp.enable) {
    if (!sessionStorage.getItem('hello')) {
        sayHello(new Date().getHours());
        get('https://static-wzdh.2345.com/tools/yjc?date=' + formatDate(new Date())).then((res)=> {
            if (res.code == 200) {
                if (res.data.html.jiri) {
                    new notice({
                        title: "Ehon问候",
                        content: "今天是" + (res.data.html.jiri == "春节" ? "春节！祝你新年快乐！" : res.data.html.jiri)
                    }).show()
                }
                if (res.data.html.jiqi) {
                    new notice({
                        title: "Ehon问候",
                        content: "今天是" + res.data.html.jiqi
                    }).show()
                }
            }
        })
        sessionStorage.setItem('hello', 'yet');
    }

} else {
    si2.hide();
    si3.hide();
}

function formatDate(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    function a0(a) {
        return a < 10 ? '0' + a : a;
    }
    return year + a0(month) + a0(day);
}



if (stp.birth) {
    var b = stp.birth;
    var m = b.substr(0, 2);
    var d = b.substr(2, 4);
    var n = new Date();
    if (n.getMonth() + 1 == m && n.getDate() == d) {
        new notice({
            title: "生日快乐",
            content: "今天是你的生日！（反正你是这么填的）无论今天有没有人祝福你，总之，生日快乐！！！"
        }).show()
    }
}


}),})