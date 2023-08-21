// ==UserScript==
// @name         Kemono 使用增強
// @name:zh-TW   Kemono 使用增強
// @name:zh-CN   Kemono 使用增强
// @name:ja      Kemono 使用を強化
// @name:en      Kemono Usage Enhancement
// @version      0.0.26
// @author       HentiSaru
// @description        側邊欄收縮美化界面 , 自動加載原圖 , 簡易隱藏廣告 , 瀏覽翻頁優化 , 自動開新分頁 , 影片區塊優化 , 底部添加下一頁與回到頂部按鈕 , 快捷翻頁
// @description:zh-TW  側邊欄收縮美化界面 , 自動加載原圖 , 簡易隱藏廣告 , 瀏覽翻頁優化 , 自動開新分頁 , 影片區塊優化 , 底部添加下一頁與回到頂部按鈕 , 快捷翻頁
// @description:zh-CN  侧边栏收缩美化界面 , 自动加载原图 , 简易隐藏广告 , 浏览翻页优化 , 自动开新分页 , 影片区块优化 , 底部添加下一页与回到顶部按钮 , 快捷翻页
// @description:ja     サイドバーを縮小してインターフェースを美しくし、オリジナル画像を自動的に読み込み、広告を簡単に非表示にし、ページの閲覧とページめくりを最適化し、新しいページを自動的に開き、ビデオセクションを最適化し、下部に「次のページ」と「トップに戻る」ボタンを追加し、クイックページめくりができます。
// @description:en     Collapse the sidebar to beautify the interface, automatically load original images, easily hide ads, optimize page browsing and flipping, automatically open new pages, optimize the video section, add next page and back to top buttons at the bottom, and quickly flip pages.

// @match        *://kemono.su/*
// @match        *://*.kemono.su/*
// @match        *://kemono.party/*
// @match        *://*.kemono.party/*
// @icon         https://cdn-icons-png.flaticon.com/512/2566/2566449.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_addElement
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js
// @resource     font-awesome https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
// @require      https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js
// ==/UserScript==

var menu, img_rule,
    xhr = new XMLHttpRequest(),
    Url = window.location.href,
    parser = new DOMParser(),
    buffer = document.createDocumentFragment(),
    language = display_language(GM_getValue("language", null));
(function () {
    let interval, tryerror = 0;
    const pattern = /^(https?:\/\/)?(www\.)?kemono\..+\/.+\/user\/.+\/post\/.+$/,
        UserPage = /^(https?:\/\/)?(www\.)?kemono\..+\/.+\/user\/[^\/]+(\?.*)?$/,
        PostsPage = /^(https?:\/\/)?(www\.)?kemono\..+\/posts\/?(\?.*)?$/,
        DmsPage = /^(https?:\/\/)?(www\.)?kemono\..+\/dms\/?(\?.*)?$/;
    async function Main() {
        const [list, box, announce] = [ // announce(公告條)
            "div.global-sidebar", "div.content-wrapper.shifted", "body > div.content-wrapper.shifted > a"
        ].map(selector => document.querySelector(selector));
        document.querySelector("div.global-sidebar")
        if (list && box) {
            Beautify(list, box, announce); // 側邊欄收縮, 刪除公告條
            clearInterval(interval);
        } else {
            tryerror++;
            if (tryerror > 100) { clearInterval(interval) }
        }
    }
    interval = setInterval(() => {Main()}, 300);
    // 附加選項
    setTimeout(() => {
        AdHiding(); // 隱藏廣告
        if (pattern.test(Url)) {
            OriginalImage(); // 自動大圖
            LinkOriented(); // 連結轉換
            VideoBeautify(); // 影片美化
            Additional(); // 下方創建按鈕, Ajex 快捷換頁
            GM_registerMenuCommand(language.RM_01, function () {Menu()});
        }
        if (UserPage.test(Url) || PostsPage.test(Url) || DmsPage.test(Url)) {
            AjexPostToggle(); // Ajex 換頁
            NewTabOpens(); // 自動新分頁
        }
    }, 500); // 功能常沒觸發, 延遲就調高 預設 500ms = 0.5s
})();

/* 樣式添加 */
GM_addStyle(`
    ${GM_getResourceText("font-awesome")}
    .gif-overlay {
        position: absolute;
        opacity: 0.4;
        top: 50%;
        left: 50%;
        width: 70%;
        height: 70%;
        z-index: 9999;
        border-radius: 50%;
        transform: translate(-50%, -50%);
    }
    .diluted-information {
        opacity: 0.4;
    }
`);
/* 自訂樣式添加 */
async function addstyle(rule) {
    let new_style = document.getElementById("New-Add-Style");
    if (!new_style) {
        new_style = document.createElement("style");
        new_style.id = "New-Add-Style";
        document.head.appendChild(new_style);
    }
    new_style.appendChild(document.createTextNode(rule));
}

/* 腳本添加 */
async function addscript(rule) {
    let new_script = document.getElementById("New-Add-script");
    if (!new_script) {
        new_script = document.createElement("script");
        new_script.id = "New-Add-script";
        document.head.appendChild(new_script);
    }
    new_script.appendChild(document.createTextNode(rule));
}

/* 導入設定 */
function GetSettings(record) {
    let Settings;
    switch (record) {
        case "MenuSet":
            Settings = GM_getValue(record, null) || [{
                "MT": "2vh",
                "ML": "65vw",
            }];
            break;
        case "ImgSet":
            Settings = GM_getValue(record, null) || [{
                "img_h": "auto",
                "img_w": "auto",
                "img_mw": "100%",
                "img_gap": "0px",
            }];
            break;
    }
    return Settings[0];
}

/* ==================== */

/* 美化介面 */
async function Beautify(list, box, announce) {
    GM_addStyle(`
        .global-sidebar {
            opacity: 0;
            height: 100%;
            width: 10rem;
            display: flex;
            position: fixed;
            padding: 0.5em 0;
            transition: 0.8s;
            background: #282a2e;
            flex-direction: column;
            transform: translateX(-9rem);
        }
        .global-sidebar:hover {
            opacity: 1;
            transform: translateX(0rem);
        }
        .content-wrapper.shifted {
            transition: 0.7s;
            margin-left: 0rem;
        }
    `);
    announce.remove();
    list.addEventListener('mouseenter', function () {
        box.style.marginLeft = "10rem";
    });
    list.addEventListener('mouseleave', function () {
        box.style.marginLeft = "0rem";
    });
}

/* 影片美化 */
async function VideoBeautify() {
    let stream, parents;
    parents = document.querySelectorAll('ul[style*="text-align: center;list-style-type: none;"] li');
    if (parents.length > 0) {
        function ReactBeautify({ stream }) {
            return React.createElement("video", {
                key: "video",
                controls: true,
                preload: "auto",
                style: { width: "80%", height: "80%" },
            }, React.createElement("source", {
                key: "source",
                src: stream.src,
                type: stream.type
            }));
        }
        parents.forEach(li => {
            stream = li.querySelector("source");
            if (stream) {
                ReactDOM.render(React.createElement(ReactBeautify, { stream: stream }), li);
            } else {
                console.log("Debug: Could not find source, please refresh");
            }
        })
    }
}

/* 載入原圖 */
async function OriginalImage() {
    const set = GetSettings("ImgSet");
    addstyle(`
        .img-style {
            display: block;
            width: ${set.img_w};
            height: ${set.img_h};
            margin: ${set.img_gap} auto;
            max-width: ${set.img_mw};
        }
    `);
    MenuDependent();
    let thumbnail, href, img;
    thumbnail = document.querySelectorAll("div.post__thumbnail");
    if (thumbnail.length > 0) {
        function ImgRendering({ ID, href }) {
            return React.createElement("a", {
                id: ID,
                className: "image-link"
            }, React.createElement("img", {
                key: "img",
                src: href.href,
                className: "img-style",
                onError: function () {
                    Reload(ID, 15);
                }
            })
            )
        }
        thumbnail.forEach(async (object, index) => {
            object.classList.remove("post__thumbnail");
            href = object.querySelector("a");
            await ReactDOM.render(React.createElement(ImgRendering, { ID: `IMG-${index}`, href: href }), object);
        })
        document.querySelectorAll("a.image-link").forEach(link => {
            const handleClick = () => {
                img = link.querySelector("img");
                if (!img.complete) {
                    img.src = img.src;
                } else {
                    link.removeEventListener("click", handleClick);
                }
            }
            link.addEventListener("click", handleClick);
        });
    }
}
async function Reload(ID, retry) {
    if (retry > 0) {
        setTimeout(() => {
            let object = document.getElementById(ID), old = object.querySelector("img"), img = document.createElement("img");
            img.src = old.src;
            img.alt = "Click Reload";
            img.className = "img-style";
            img.onerror = function () { Reload(ID, retry) };
            old.remove();
            object.appendChild(buffer.appendChild(img));
            retry - 1;
        }, 1800);
    }
}

/* ==================== */

/* 監聽器的添加與刪除 */
var ListenerRecord = new Map(), listen;

async function addlistener(element, type, listener) {
    if (!ListenerRecord.has(element) || !ListenerRecord.get(element).has(type)) {
        element.addEventListener(type, listener);
        if (!ListenerRecord.has(element)) {
            ListenerRecord.set(element, new Map());
        }
        ListenerRecord.get(element).set(type, listener);
    }
}

async function removlistener(element, type) {
    if (ListenerRecord.has(element) && ListenerRecord.get(element).has(type)) {
        listen = ListenerRecord.get(element).get(type);
        element.removeEventListener(type, listen);
        ListenerRecord.get(element).delete(type);
    }
}

/* ==================== */

/* 簡易隱藏廣告 */
async function AdHiding() {
    GM_addStyle(`
        .ad-container, .root--ujvuu {display: none}
    `);
}

/* 轉換下載連結參數 */
async function LinkOriented() {
    document.querySelectorAll("a.post__attachment-link").forEach(link => {
        link.setAttribute("download", "");
    })
}

/* 底部按鈕創建, 監聽快捷Ajex換頁 */
async function Additional() {
    const interval = setInterval(() => {
        const comments = document.querySelector("h2.site-section__subheading");
        const prev = document.querySelector("a.post__nav-link.prev");
        const next = document.querySelector("a.post__nav-link.next");
        if (comments && prev && next) {
            clearInterval(interval);
            const span = document.createElement("span");
            const svg = document.createElement("svg");
            span.style = "float: right";
            span.appendChild(next.cloneNode(true));
            svg.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" style="margin-left: 10px;cursor: pointer;">
                    <style>svg{fill:#e8a17d}</style>
                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM135.1 217.4l107.1-99.9c3.8-3.5 8.7-5.5 13.8-5.5s10.1 2 13.8 5.5l107.1 99.9c4.5 4.2 7.1 10.1 7.1 16.3c0 12.3-10 22.3-22.3 22.3H304v96c0 17.7-14.3 32-32 32H240c-17.7 0-32-14.3-32-32V256H150.3C138 256 128 246 128 233.7c0-6.2 2.6-12.1 7.1-16.3z"></path>
                </svg>
            `
            buffer.appendChild(svg);
            buffer.appendChild(span);
            comments.appendChild(buffer);
            addlistener(svg, "click", () => {
                document.querySelector("header").scrollIntoView();
            })
            // 監聽按鍵切換
            /* 暫時停用
            const main = document.querySelector("main");
            addlistener(document, "keydown", event => {
                if (event.key === "4") {
                    event.preventDefault();
                    removlistener(document, "keydown");
                    AjexReplace(prev.href, main);
                } else if (event.key === "6") {
                    event.preventDefault();
                    removlistener(document, "keydown");
                    AjexReplace(next.href, main);
                }
            })*/
        }
    }, 300);
}

/* 將瀏覽帖子頁面都變成開新分頁, 帖子說明文字淡化, 和滑鼠懸浮恢復 */
async function NewTabOpens() {
    const card = document.querySelectorAll("div.card-list__items article a");
    card.forEach(link => {
        link.querySelector("header").classList.add("diluted-information");
        link.querySelector("footer").classList.add("diluted-information");
        addlistener(link, "click", event => {
            event.preventDefault();
            GM_openInTab(link.href, { active: false, insert: true });
        })
        addlistener(link, "mouseenter", () => {
            link.querySelector("header").classList.remove("diluted-information");
            link.querySelector("footer").classList.remove("diluted-information");
        })
        addlistener(link, "mouseleave", () => {
            link.querySelector("header").classList.add("diluted-information");
            link.querySelector("footer").classList.add("diluted-information");
        })
    });
}

/* ==================== */

/* Ajex 替換頁面的初始化 */
async function Initialization() {
    Additional();
    setTimeout(OriginalImage, 500);
    setTimeout(VideoBeautify, 500);
    document.querySelector("h1.post__title").scrollIntoView(); // 滾動到上方
}

/* React 渲染優化 */
function ReactRendering({ content }) {
    return React.createElement("div", { dangerouslySetInnerHTML: { __html: content } });
}
async function AjexReplace(url, old_main) {
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let New_data = parser.parseFromString(xhr.responseText, 'text/html');
            let New_main = New_data.querySelector("main");
            ReactDOM.render(React.createElement(ReactRendering, { content: New_main.innerHTML }), old_main);
            history.pushState(null, null, url);
            setTimeout(Initialization(), 500);
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
}

/* 帖子切換 */
async function AjexPostToggle() {
    let Old_data, New_data, item;
    async function Request(link) {
        item = document.querySelector("div.card-list__items");
        item.style.position = "relative";
        GM_addElement(item, "img", {
            src: "https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/images/loading.gif",
            class: "gif-overlay"
        });
        GM_xmlhttpRequest({
            method: "GET",
            url: link,
            nocache: false,
            onload: response => {
                Old_data = document.querySelector("section");
                New_data = parser.parseFromString(response.responseText, "text/html").querySelector("section");
                ReactDOM.render(React.createElement(ReactRendering, { content: New_data.innerHTML }), Old_data);
                history.pushState(null, null, link);
                AjexPostToggle();
                NewTabOpens();
            }
        });
    }
    try {
        const menu = document.querySelectorAll("menu a");
        menu.forEach(ma => {
            addlistener(ma, "click", (event) => {
                event.preventDefault();
                Request(ma.href);
            })
        });
    } catch {}
}

/* 及時設置響應 */
const styleRules = {
    img_h: value => img_rule[0].style.height = `${value}`,
    img_w: value => img_rule[0].style.width = `${value}`,
    img_mw: value => img_rule[0].style.maxWidth = `${value}`,
    img_gap: value => img_rule[0].style.margin = `${value} auto`
};
/* 創建菜單 */
async function Menu() {
    img_rule = document.getElementById("New-Add-Style").sheet.cssRules;
    set = GetSettings("ImgSet");
    let parent, child, img_input, img_select, analyze;
    const img_data = [set.img_h, set.img_w, set.img_mw, set.img_gap];
    menu = `
        <div class="modal-background">
            <div class="modal-interface">
                <table class="modal-box">
                    <tr>
                        <td class="menu">
                            <h2 class="menu-text">${language.MT_01}</h2>
                            <ul>
                                <li>
                                    <a class="toggle-menu" href="#image-settings-show">
                                        <button class="menu-options" id="image-settings">${language.MO_01}</button>
                                    </a>
                                <li>
                                <li>
                                    <a class="toggle-menu" href="#">
                                        <button class="menu-options" disabled>null</button>
                                    </a>
                                <li>
                            </ul>
                        </td>
                        <td>
                            <table>
                                <tr>
                                    <td class="content" id="set-content">
                                        <div id="image-settings-show" class="form-hidden">
                                            <div>
                                                <h2 class="narrative">${language.MIS_01}：</h2>
                                                <p><input type="number" id="img_h" class="Image-input-settings" oninput="value = check(value)">
                                                    <select class="Image-input-settings" style="margin-left: 1rem;">
                                                        <option value="px" selected>px</option>
                                                        <option value="%">%</option>
                                                        <option value="rem">rem</option>
                                                        <option value="vh">vh</option>
                                                        <option value="vw">vw</option>
                                                        <option value="auto">auto</option>
                                                    </select></p>
                                            </div>
                                            <div>
                                                <h2 class="narrative">${language.MIS_02}：</h2>
                                                <p><input type="number" id="img_w" class="Image-input-settings"
                                                        oninput="value = check(value)">
                                                    <select class="Image-input-settings" style="margin-left: 1rem;">
                                                        <option value="px" selected>px</option>
                                                        <option value="%">%</option>
                                                        <option value="rem">rem</option>
                                                        <option value="vh">vh</option>
                                                        <option value="vw">vw</option>
                                                        <option value="auto">auto</option>
                                                    </select></p>
                                            </div>
                                            <div>
                                                <h2 class="narrative">${language.MIS_03}：</h2>
                                                <p><input type="number" id="img_mw" class="Image-input-settings"
                                                        oninput="value = check(value)">
                                                    <select class="Image-input-settings" style="margin-left: 1rem;">
                                                        <option value="px" selected>px</option>
                                                        <option value="%">%</option>
                                                        <option value="rem">rem</option>
                                                        <option value="vh">vh</option>
                                                        <option value="vw">vw</option>
                                                        <option value="auto">auto</option>
                                                    </select></p>
                                            </div>
                                            <div>
                                                <h2 class="narrative">${language.MIS_04}：</h2><p>
                                                    <input type="number" id="img_gap" class="Image-input-settings"
                                                        oninput="value = check(value)">
                                                    <select class="Image-input-settings" style="margin-left: 1rem;">
                                                        <option value="px" selected>px</option>
                                                        <option value="%">%</option>
                                                        <option value="rem">rem</option>
                                                        <option value="vh">vh</option>
                                                        <option value="vw">vw</option>
                                                        <option value="auto">auto</option>
                                                    </select></p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="button-area">
                                        <select id="language">
                                            <option value="" disabled selected>${language.ML_01}</option>
                                            <option value="en">${language.ML_02}</option>
                                            <option value="zh-TW">${language.ML_03}</option>
                                            <option value="zh-CN">${language.ML_04}</option>
                                            <option value="ja">${language.ML_05}</option>
                                        </select>
                                        <button id="readsettings" class="button-options">${language.MB_01}</button>
                                        <span class="button-space"></span>
                                        <button id="closure" class="button-options">${language.MB_02}</button>
                                        <span class="button-space"></span>
                                        <button id="application" class="button-options">${language.MB_03}</button>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    `
    $(document.body).append(menu);
    $(".modal-interface").draggable();
    $(".modal-interface").tabs();
    // 菜單選擇
    $("#image-settings").on("click", function () {
        $("#image-settings-show").css({
            "height": "auto",
            "width": "auto",
            "opacity": 1
        });
    })
    // 語言選擇
    $("#language").val(GM_getValue("language", null) || "")
    $("#language").on("input change",  function (event) {
        event.stopPropagation();
        const value = $(this).val();
        language = display_language(value);
        GM_setValue("language", value);
        $("#language").off("input change");
        $(".modal-background").remove();
        Menu();
    });
    // 語言設置
    $(".Image-input-settings").on("input change", function (event) {
        event.stopPropagation();
        const target = $(this), value = target.val(), id = target.attr("id");
        parent = target.closest("div");
        if (isNaN(value)) {
            child = parent.find("input");
            if (value === "auto") {
                child.prop("disabled", true);
                styleRules[child.attr("id")](value);
            } else {
                child.prop("disabled", false);
                styleRules[child.attr("id")](`${child.val()}${value}`);
            }
        } else {
            child = parent.find("select");
            styleRules[id](`${value}${child.val()}`);
        }
    });
    // 讀取保存
    $("#readsettings").on("click", function () {
        const img_set = $("#image-settings-show").find("p");
        img_data.forEach((read, index) => {
            img_input = img_set.eq(index).find("input");
            img_select = img_set.eq(index).find("select");

            if (read === "auto") {
                img_input.prop("disabled", true);
                img_select.val(read);
            } else {
                analyze = read.match(/^(\d+)(\D+)$/);
                img_input.val(analyze[1]);
                img_select.val(analyze[2]);
            }
        })
    });
    // 應用保存
    let save = {};
    $("#application").on("click", function () {
        $("#application").off("click");
        const img_set = $("#image-settings-show").find("p");
        img_data.forEach((read, index) => {
            img_input = img_set.eq(index).find("input");
            img_select = img_set.eq(index).find("select");
            if (img_select.val() === "auto") {
                save[img_input.attr("id")] = "auto";
            } else if (img_input.val() === "") {
                save[img_input.attr("id")] = read;
            } else {
                save[img_input.attr("id")] = `${img_input.val()}${img_select.val()}`;
            }
        })
        array = [save];
        GM_setValue("ImgSet", [save]);

        // 菜單資訊
        save = {};
        const menu_location = $(".modal-interface");
        save["MT"] = menu_location.css("top");
        save["ML"] = menu_location.css("left");
        GM_setValue("MenuSet", [save])
        $(".modal-background").remove();
    });
    // 關閉菜單
    $("#closure").on("click", function () {
        $(".modal-background").remove();
    });
}

/* 菜單依賴項目 */
async function MenuDependent() {
    addscript(`
        function check(value) {
            if (value.toString().length > 4 || value > 1000) {
                value = 1000;
            } else if (value < 0) {
                value = 0;
            }
            return value || 0;
        }
    `);
    const set = GetSettings("MenuSet");
    addstyle(`
        .modal-background {
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            z-index: 9999;
            overflow: auto;
            position: fixed;
            pointer-events: none;
            background-color: rgba(0, 0, 0, 0.1);
        }
        /* 模態介面 */
        .modal-interface {
            top: ${set.MT};
            left: ${set.ML};
            margin: 0;
            display: flex;
            overflow: auto;
            position: fixed;
            border-radius: 5px;
            pointer-events: auto;
            background-color: #2C2E3E;
            border: 3px solid #EE2B47;
        }
        /* 模態內容盒 */
        .modal-box {
            padding: 0.5rem;
            height: 50vh;
            width: 32vw;
        }
        /* 菜單框架 */
        .menu {
            width: 5.5vw;
            overflow: auto;
            text-align: center;
            vertical-align: top;
            border-radius: 2px;
            border: 2px solid #F6F6F6;
        }
        /* 菜單文字標題 */
        .menu-text {
            color: #EE2B47;
            cursor: default;
            padding: 0.2rem;
            margin: 0.3rem;
            margin-bottom: 1.5rem;
            white-space: nowrap;
            border-radius: 10px;
            border: 4px solid #f05d73;
            background-color: #1f202c;
        }
        /* 菜單選項按鈕 */
        .menu-options {
            cursor: pointer;
            font-size: 1.4rem;
            color: #F6F6F6;
            font-weight: bold;
            border-radius: 5px;
            margin-bottom: 1.2rem;
            border: 5px inset #EE2B47;
            background-color: #6e7292;
            transition: color 0.8s, background-color 0.8s;
        }
        .menu-options:hover {
            color: #EE2B47;
            background-color: #F6F6F6;
        }
        .menu-options:disabled {
            color: #6e7292;
            cursor: default;
            background-color: #c5c5c5;
            border: 5px inset #faa5b2;
        }
        /* 設置內容框架 */
        .content {
            height: 48vh;
            width: 28vw;
            overflow: auto;
            padding: 0px 1rem;
            border-radius: 2px;
            vertical-align: top;
            border-top: 2px solid #F6F6F6;
            border-right: 2px solid #F6F6F6;
        }
        .narrative {
            color: #EE2B47;
        }
        .Image-input-settings {
            width: 8rem;
            color: #F6F6F6;
            text-align: center;
            font-size: 1.5rem;
            border-radius: 15px;
            border: 3px inset #EE2B47;
            background-color: #202127;
        }
        .Image-input-settings:disabled {
            border: 3px inset #faa5b2;
            background-color: #5a5a5a;
        }
        /* 底部按鈕框架 */
        .button-area {
            display: flex;
            padding: 0.3rem;
            border-left: none;
            border-radius: 2px;
            border: 2px solid #F6F6F6;
            justify-content: space-between;
        }
        .button-area select {
            color: #F6F6F6;
            margin-right: 1.5rem;
            border: 3px inset #EE2B47;
            background-color: #6e7292;
        }
        /* 底部選項 */
        .button-options {
            color: #F6F6F6;
            cursor: pointer;
            font-size: 0.8rem;
            font-weight: bold;
            border-radius: 10px;
            white-space: nowrap;
            background-color: #6e7292;
            border: 3px inset #EE2B47;
            transition: color 0.5s, background-color 0.5s;
        }
        .button-options:hover {
            color: #EE2B47;
            background-color: #F6F6F6;
        }
        .button-space {
            margin: 0 0.6rem;
        }
        .form-hidden {
            opacity: 0;
            height: 0;
            width: 0;
            overflow: hidden;
            transition: opacity 0.8s, height 0.8s, width 0.8s;
        }
        .toggle-menu {
            height: 0;
            width: 0;
            padding: 0;
            margin: 0;
        }
        /* 整體框線 */
        table,
        td {
            margin: 0px;
            padding: 0px;
            overflow: auto;
            border-spacing: 0px;
        }
        p {
            display: flex;
            flex-wrap: nowrap;
        }
        option {
            color: #F6F6F6;
        }
        ul {
            list-style: none;
            padding: 0px;
            margin: 0px;
        }
    `);
}

function display_language(language) {
    let display = {
        "zh-TW": [{
            "RM_01" : "📝 設置選單",
            "MT_01" : "設置菜單",
            "MO_01" : "圖像設置",
            "MB_01" : "讀取設定",
            "MB_02" : "關閉離開",
            "MB_03" : "保存應用",
            "ML_01" : "語言",
            "ML_02" : "英文",
            "ML_03" : "繁體",
            "ML_04" : "簡體",
            "ML_05" : "日文",
            "MIS_01" : "圖片高度",
            "MIS_02" : "圖片寬度",
            "MIS_03" : "圖片最大寬度",
            "MIS_04" : "圖片間隔高度"
        }],
        "zh-CN": [{
            "RM_01" : "📝 设置菜单",
            "MT_01" : "设置菜单",
            "MO_01" : "图像设置",
            "MB_01" : "读取设置",
            "MB_02" : "关闭退出",
            "MB_03" : "保存应用",
            "ML_01" : "语言",
            "ML_02" : "英文",
            "ML_03" : "繁体",
            "ML_04" : "简体",
            "ML_05" : "日文",
            "MIS_01" : "图片高度",
            "MIS_02" : "图片宽度",
            "MIS_03" : "图片最大宽度",
            "MIS_04" : "图片间隔高度"
        }],
        "ja": [{
            "RM_01" : "📝 設定メニュー",
            "MT_01" : "設定メニュー",
            "MO_01" : "画像設定",
            "MB_01" : "設定の読み込み",
            "MB_02" : "閉じて終了する",
            "MB_03" : "保存して適用する",
            "ML_01" : "言語",
            "ML_02" : "英語",
            "ML_03" : "繁体字",
            "ML_04" : "簡体字",
            "ML_05" : "日本語",
            "MIS_01" : "画像の高さ",
            "MIS_02" : "画像の幅",
            "MIS_03" : "画像の最大幅",
            "MIS_04": "画像の間隔の高さ"
        }],
        "en": [{
            "RM_01" : "📝 Settings Menu",
            "MT_01" : "Settings Menu",
            "MO_01" : "Image Settings",
            "MB_01" : "Load Settings",
            "MB_02" : "Close and Exit",
            "MB_03" : "Save and Apply",
            "ML_01" : "Language",
            "ML_02" : "English",
            "ML_03" : "Traditional Chinese",
            "ML_04" : "Simplified Chinese",
            "ML_05" : "Japanese",
            "MIS_01" :"Image Height",
            "MIS_02" : "Image Width",
            "MIS_03" : "Maximum Image Width",
            "MIS_04" : "Image Spacing Height"
        }],
    };
    return display[language][0] || display["en"][0];
}