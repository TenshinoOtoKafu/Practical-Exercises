// ==UserScript==
// @name         GrammarSimplified
// @version      2024/03/13
// @author       HentaiSaru
// @description  Simple syntax simplification function
// @namespace    https://greasyfork.org/users/989635
// @match        *://*/*
// ==/UserScript==

/**
 * * { 簡化語法的類別 }
 * 
 * @example
 * 1.
 *  class main extends API {
 *       繼承此類...
 *       this.func(方法調用)
 *  }
 * 
 * 2.
 *  實利化調用
 *  const api = new API()
 *  api.func()
 */
class API {
    constructor() {
        this.Buffer = document.createDocumentFragment();
        this.ListenerRecord = new Map();
        this.Parser = new DOMParser();
        this.Template = {
            log: label=> console.log(label),
            warn: label=> console.warn(label),
            error: label=> console.error(label),
            count: label=> console.count(label),
        }
    }

    /**
     * * { 簡化查找語法 }
     * @param {string} Selector - 查找元素
     * @param {boolean} All     - 是否查找全部
     * @param {element} Source  - 查找來源
     * @returns {element}       - DOM 元素
     */
    $$(Selector, All=false, Source=document) {
        const slice = Selector.slice(1), analyze = [".", "#", " ", "="].some(m => {return slice.includes(m)}) ? " " : Selector[0];
        switch (analyze) {
            case "#": return Source.getElementById(slice);
            case " ": return All ? Source.querySelectorAll(Selector):Source.querySelector(Selector);
            case ".": Selector = Source.getElementsByClassName(slice);break;
            default: Selector = Source.getElementsByTagName(Selector);
        }
        return All ? Array.from(Selector) : Selector[0];
    }

    /**
     * * { 解析請求後的頁面, 成可查詢的 html 文檔 }
     * @param {htnl} html - 要解析成 html 的文檔 
     * @returns {htnl}    - html 文檔
     */
    DomParse(html) {
        return this.Parser.parseFromString(html, "text/html");
    }

    /**
     * * { 排除不能用做檔名的字串 }
     * @param {string} name - 要變更的字串
     * @returns {string}    - 變更後的字串
     */
    IllegalCharacters(name) {
        return name.replace(/[\/\?<>\\:\*\|":]/g, "");
    }

    /**
     * * { 解析網址字串的副檔名 }
     * @param {string} link - 含有副檔名的連結
     * @returns {string}    - 回傳副檔名字串
     */
    ExtensionName(link) {
        try {
            return link.match(/\.([^.]+)$/)[1].toLowerCase() || "png";
        } catch {
            return "png";
        }
    }

    /**
     * * { 創建 Worker 工作文件 }
     * @param {string} code - 運行代碼
     * @returns {Worker}    - 創建的 Worker 連結
     */
    WorkerCreation(code) {
        let blob = new Blob([code], {type: "application/javascript"});
        return new Worker(URL.createObjectURL(blob));
    }

    /**
     * * { 暫停異步函數 }
     * @param {Integer} delay - 延遲毫秒
     * @returns { Promise }
     */
    sleep (delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * * { 添加樣式表到 head }
     * @param {string} Rule - 樣式表
     * @param {string} ID   - 創建 ID
     */
    async AddStyle(Rule, ID="New-Style") {
        let new_style = document.getElementById(ID);
        if (!new_style) {
            new_style = document.createElement("style");
            new_style.id = ID;
            document.head.appendChild(new_style);
        }
        new_style.appendChild(document.createTextNode(Rule));
    }

    /**
    * * { 添加腳本到 head }
    * @param {string} Rule - Js 腳本
    * @param {string} ID   - 創建 ID
    */
    async AddScript(Rule, ID="New-Script") {
        let new_script = document.getElementById(ID);
        if (!new_script) {
            new_script = document.createElement("script");
            new_script.id = ID;
            document.head.appendChild(new_script);
        }
        new_script.appendChild(document.createTextNode(Rule));
    }

    /**
     * * { 添加監聽器 (可刪除, 且會檢測是否重複添加) }
     * @param {string} element - 添加元素
     * @param {string} type    - 監聽器類型
     * @param {*} listener     - 監聽後操作
     * @param {object} add     - 附加功能
     */
    async AddListener(element, type, listener, add={}) {
        if (!this.ListenerRecord.has(element) || !this.ListenerRecord.get(element).has(type)) {
            element.addEventListener(type, listener, add);
            if (!this.ListenerRecord.has(element)) {
                this.ListenerRecord.set(element, new Map());
            }
            this.ListenerRecord.get(element).set(type, listener);
        }
    }

    /**
     * * { 刪除 監聽器 }
     * @param {string} element  - 添加元素
     * @param {string} type     - 監聽器類型
     */
    async RemovListener(element, type) {
        if (this.ListenerRecord.has(element) && this.ListenerRecord.get(element).has(type)) {
            const listen = this.ListenerRecord.get(element).get(type);
            element.removeEventListener(type, listen);
            this.ListenerRecord.get(element).delete(type);
        }
    }

    /**
     * * { 簡化版監聽器 (不可刪除, 且不檢測是否重複添加, 但會回傳註冊狀態) }
     * @param {string} element - 添加元素
     * @param {string} type    - 監聽器類型
     * @param {*} listener     - 監聽後操作
     * @param {object} add     - 附加功能
     * @returns {boolean}      - 回傳添加狀態
     * 
     * @example
     * Listen("監聽元素", "監聽類型", 觸發 => {
     *      觸發... 其他操作
     * }, {once: true, capture: true, passive: true}, 接收註冊狀態 => {
     *      console.log(註冊狀態)
     * })
     */
    async Listen(element, type, listener, add={}, callback=null) {
        try {
            element.addEventListener(type, listener, add);
            if (callback) {callback(true)}
        } catch {if (callback) {callback(false)}}
    }

    /**
     * * { 等待元素出現 }
     * 
     * @param {string} selector     - 等待元素
     * @param {boolean} all         - 是否多選
     * @param {number} timeout      - 等待超時 (秒數)
     * @param {function} callback   - 回條函式
     * @param {Element} object      - 監聽的 DOM 物件 (預設 body)
     * @param {number} throttle     - 對監聽觸發進行節流 (毫秒)
     * 
     * @example
     * WaitElem("元素", false, 1, call => {
     *      後續操作...
     *      console.log(call);
     * }, document, 100)
     */
    async WaitElem(selector, all, timeout, callback, object=document.body, throttle=0) {
        let timer, element, result;
        const observer = new MutationObserver(this.Throttle_discard(() => {
            element = all ? document.querySelectorAll(selector) : document.querySelector(selector);
            result = all ? element.length > 0 && Array.from(element).every(item=> {
                return item !== null && typeof item !== "undefined";
            }) : element;
            if (result) {
                observer.disconnect();
                clearTimeout(timer);
                callback(element);
            }
        }, throttle));
        observer.observe(object, { childList: true, subtree: true });
        timer = setTimeout(() => {observer.disconnect()}, (1000 * timeout));
    }

    /**
     * * { 等待元素出現 (Map 物件版) }
     * 
     * @param {string} selector     - 等待元素
     * @param {number} timeout      - 等待超時 (秒數)
     * @param {function} callback   - 回條函式
     * @param {Element} object      - 監聽的 DOM 物件 (預設 body)
     * @param {number} throttle     - 對監聽觸發進行節流 (毫秒)
     * 
     * @example
     * WaitElem(["元素1", "元素2", "元素3"], 等待時間(秒), call => {
     *      全部找到後續操作...
     *      const [元素1, 元素2, 元素3] = call;
     * }, document, 100)
     */
    async WaitMap(selectors, timeout, callback, object=document.body, throttle=0) {
        let timer, elements;
        const observer = new MutationObserver(this.Throttle_discard(() => {
            elements = selectors.map(selector => document.querySelector(selector))
            if (elements.every(element => {return element !== null && typeof "undefined"})) {
                observer.disconnect();
                clearTimeout(timer);
                callback(elements);
            }
        }, throttle));
        observer.observe(object, { childList: true, subtree: true });
        timer = setTimeout(() => {observer.disconnect()}, (1000 * timeout));
    }

    /**
     * * { 打印元素 }
     * @param {*} group - 打印元素標籤盒
     * @param {*} label - 打印的元素
     * @param {string} type - 要打印的類型 ("log", "warn", "error", "count")
     */
    async log(group=null, label="print", type="log") {
        type = typeof type === "string" && this.Template[type] ? type : type = "log";
        if (group == null) {this.Template[type](label)}
        else {
            console.groupCollapsed(group);
            this.Template[type](label);
            console.groupEnd();
        }
    }

    /**
     ** { 獲取運行經過時間 }
     * @param {Date.now()} time - 傳入 Date.now()
     * @param {boolean} log - 是否直接打印
     * 
     * @returns {Date.now()}
     * 
     * @example
     * let start = Runtime();
     * let end = Runtime(start);
     * console.log(end);
     * 
     * let start = Runtime();
     * Runtime(start, true);
     */
    Runtime(time=null, log=true) {
        return !time? Date.now(): log?
        console.log("\x1b[1m\x1b[36m%s\x1b[0m", `Elapsed Time: ${((Date.now()-time)/1e3)}s`):
        (Date.now() - time);
    }

    /**
     ** { 節流函數 [不會遺棄觸發] }
     * @param {function} func - 要觸發的函數
     * @param {number} delay - 延遲的時間ms
     * @returns {function}
     * 
     * @example
     * a = throttle(()=> {}, 100);
     * a();
     * 
     * function b(n) {
     *      throttle(b(n), 100);
     * }
     * 
     * document.addEventListener("pointermove", throttle(()=> {
     *  
     * }), 100)
     */
    Throttle(func, delay) {
        let timer = null;
        return function() {
            let context=this, args=arguments;
            if (timer == null) {
                timer = setTimeout(function() {
                    func.apply(context, args);
                    timer = null;
                }, delay);
            }
        };
    }

    /**
     ** { 節流函數 [會丟棄觸發] }
     * @param {function} func - 要觸發的函數
     * @param {number} delay - 延遲的時間ms
     * @returns {function}
     * 
     * @example
     * 與上方相同
     */
    Throttle_discard(func, delay) {
        let lastTime = 0;
        return function() {
            const context = this, args = arguments, now = Date.now();
            if ((now - lastTime) >= delay) {
                func.apply(context, args);
                lastTime = now;
            }
        };
    }

    /**
     ** { 瀏覽器 Storage 操作 }
     * @param {sessionStorage | localStorage} storage - 存儲的類型 
     * @param {string} key - 存儲的 key 值
     * @param {*} value - 存儲的 value 值
     * @returns {boolean | *} - 回傳保存的值
     * 
     * @example
     * 支援的類型 (String, Number, Array, Object, Boolean, Date, Map)
     * 
     *  Storage(sessionStorage, "會話數據", 123)
     *  Storage(sessionStorage, "會話數據")
     * 
     *  Storage(localStorage, "本地數據", 123)
     *  Storage(localStorage, "本地數據")
     */
    Storage(storage, key, value=null) {
        let data,
        Formula = {
            Type: (parse) => Object.prototype.toString.call(parse).slice(8, -1),
            String: (parse) =>
                parse ? JSON.parse(parse) : (storage.setItem(key, JSON.stringify(value)), true),
            Number: (parse) =>
                parse ? Number(parse) : (storage.setItem(key, JSON.stringify(value)), true),
            Array: (parse) =>
                parse ? JSON.parse(parse) : (storage.setItem(key, JSON.stringify(value)), true),
            Object: (parse) =>
                parse ? JSON.parse(parse) : (storage.setItem(key, JSON.stringify(value)), true),
            Boolean: (parse) =>
                parse ? JSON.parse(parse) : (storage.setItem(key, JSON.stringify(value)), true),
            Date: (parse) =>
                parse ? new Date(parse) : (storage.setItem(key, JSON.stringify(value)), true),
            Map: (parse) =>
                parse
                ? new Map(JSON.parse(parse))
                : (storage.setItem(key, JSON.stringify([...value])), true),
        };
        return null != value
            ? Formula[Formula.Type(value)]()
            : !!(data = storage.getItem(key)) && Formula[Formula.Type(JSON.parse(data))](data);
    }

    /* ========== 油猴的 API ========== */

    /**
     ** { 操作存储空間 (精簡版) }
     * 
     * // @grant GM_setValue
     * // @grant GM_getValue
     * // @grant GM_listValues
     * // @grant GM_deleteValue
     * 
     * @param {string} operate - 操作類型 ("del", "all", "set", "get", "sjs", "gjs")
     * @param {string} key     - 操作數據索引Key
     * @param {*} orig         - 原始的回傳值
     * @returns {data}         - 獲取的數據值
     *
     * @example
     * 數據A = store("get", "資料A")
     * store("sjs", "資料B", "數據B")
     */
    store(operation, key=null, value=null) {
        const verify = val => (val !== void 0 ? val : null);
        return {
            del: (key) => GM_deleteValue(key),
            all: () => verify(GM_listValues()),
            set: (key, value) => GM_setValue(key, value),
            get: (key, defaultValue) => verify(GM_getValue(key, defaultValue)),
            sjs: (key, value) => GM_setValue(key, JSON.stringify(value, null, 4)),
            gjs: (key, defaultValue) => JSON.parse(verify(GM_getValue(key, defaultValue)))
        }[operation](key, value);
    }

    /**
     * * { 菜單註冊 }
     * // @grant GM_registerMenuCommand
     * @param {*} item  - 創建菜單的物件
     * @example
     * Menu({
     *      "菜單1": ()=> 方法1(),
     *      "菜單2": ()=> 方法2(),
     *      ...
     * })
     */
    async Menu(item) {
        for (const [name, call] of Object.entries(item)) {
            GM_registerMenuCommand(name, ()=> {call()});
        }
    }
}