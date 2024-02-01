// ==UserScript==
// @name         Kemer 增強
// @name:zh-TW   Kemer 增強
// @name:zh-CN   Kemer 增强
// @name:ja      Kemer 強化
// @name:en      Kemer Enhancement
// @version      0.0.41
// @author       HentaiSaru
// @description        側邊欄收縮美化界面 , 自動加載原圖 , 簡易隱藏廣告 , 瀏覽翻頁優化 , 自動開新分頁 , 影片區塊優化 , 底部添加下一頁與回到頂部按鈕
// @description:zh-TW  側邊欄收縮美化界面 , 自動加載原圖 , 簡易隱藏廣告 , 瀏覽翻頁優化 , 自動開新分頁 , 影片區塊優化 , 底部添加下一頁與回到頂部按鈕
// @description:zh-CN  侧边栏收缩美化界面 , 自动加载原图 , 简易隐藏广告 , 浏览翻页优化 , 自动开新分页 , 影片区块优化 , 底部添加下一页与回到顶部按钮
// @description:ja     サイドバーを縮小してインターフェースを美しくし、オリジナル画像を自動的に読み込み、広告を簡単に非表示にし、ページの閲覧とページめくりを最適化し、新しいページを自動的に開き、ビデオセクションを最適化し、下部に「次のページ」と「トップに戻る」ボタンを追加し。
// @description:en     Collapse the sidebar to beautify the interface, automatically load original images, easily hide ads, optimize page browsing and flipping, automatically open new pages, optimize the video section, add next page and back to top buttons at the bottom.

// @match        *://kemono.su/*
// @match        *://coomer.su/*
// @match        *://*.kemono.su/*
// @match        *://*.coomer.su/*

// @icon         https://cdn-icons-png.flaticon.com/512/2566/2566449.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-body
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_addElement
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js
// @resource     font-awesome https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/svg-with-js.min.css
// ==/UserScript==

(function () {
    var img_rule, language, set, xhr = new XMLHttpRequest(),
    Url = document.URL, parser = new DOMParser(),
    buffer = document.createDocumentFragment();

    /* 功能選擇 (0 = false | 1 = true) */
    const Config = {
        Beautify: 1,        // 側邊攔收縮美化
        RemoveNotice: 1,    // 刪除上方公告
        Ad_Block: 1,        // 清除阻擋廣告
        CardSize: 1,        // 帖子預覽卡放大
        PostCardFade: 1,    // 帖子文字卡淡化 [1 = 隱藏文字 , 2 = 淡化文字]
        NewTabOpens: 1,     // 自動新分頁
        QuickPostToggle: 1, // 快速切換帖子
        OriginalImage: 1,   // 自動原圖 [1 = 快速自動 , 2 = 慢速自動 , 3 = 觀察觸
        LinkOriented: 1,    // 連結轉換
        VideoBeautify: 1,   // 影片美化 [1 = 複製節點 , 2 = 移動節點]
        CommentFormat: 1,   // 修改評論區排版
        ExtraButton: 1,     // 額外的下方按鈕
    }

    const GetSet = {
        MenuSet: () => {
            const data = GM_getValue("MenuSet", null) || [{
                "MT": "2vh",
                "ML": "50vw",
            }]; return data[0];
        },
        ImgSet: () => {
            const data = GM_getValue("ImgSet", null) || [{
                "img_h": "auto",
                "img_w": "auto",
                "img_mw": "100%",
                "img_gap": "0px",
            }]; return data[0];
        },
    }
    Main();
    async function Main() {
        const M = {
            DmsPage: /^(https?:\/\/)?(www\.)?.+\/dms\/?(\?.*)?$/,
            PostsPage: /^(https?:\/\/)?(www\.)?.+\/posts\/?(\?.*)?$/,
            Browse: /^(https?:\/\/)?(www\.)?.+\/.+\/user\/.+\/post\/.+$/,
            UserPage: /^(https?:\/\/)?(www\.)?.+\/.+\/user\/[^\/]+(\?.*)?$/,
            M1: function(url) {return this.Browse.test(url)},
            M3: function(url) {return this.UserPage.test(url) || this.PostsPage.test(url) || this.DmsPage.test(url)}
        }, R = {
            U: (select, func) => {select > 0 ? func(select) : null},
            Beautify: s => R.U(s, Beautify),
            RemoveNotice: s => R.U(s, RemoveNotice),
            Ad_Block: s => R.U(s, Ad_Block),
            CardSize: s => R.U(s, CardSize),
            PostCardFade: s => R.U(s, PostCardFade),
            NewTabOpens: s => R.U(s, NewTabOpens),
            QuickPostToggle: s => R.U(s, QuickPostToggle),
            OriginalImage: s => R.U(s, OriginalImage),
            LinkOriented: s => R.U(s, LinkOriented),
            VideoBeautify: s => R.U(s, VideoBeautify),
            CommentFormat: s => R.U(s, CommentFormat),
            ExtraButton: s => R.U(s, ExtraButton),
        }, a = Object.entries(Config), [g, p, w] = [a.slice(0, 3), a.slice(3, 7), a.slice(7, 12)];
        g.forEach(([func, set]) => R[func](set));
        if (M.M3(Url)) {p.forEach(([func, set]) => R[func](set))}
        else if (M.M1(Url)) {
            language = display_language(GM_getValue("language", null));
            w.forEach(([func, set]) => R[func](set));
            GM_registerMenuCommand(language.RM_01, function () {Menu()});
        }
    }
    addstyle(`
        ${GM_getResourceText("font-awesome")}
        .gif-overlay {
            top: 45%;
            left: 50%;
            width: 60%;
            height: 60%;
            opacity: 0.5;
            z-index: 9999;
            position: absolute;
            border-radius: 50%;
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
            transform: translate(-50%, -50%);
            background-image: url("https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/images/loading.gif");
        }
        .card-list__items {
            gap: 0.5em;
            display: flex;
            grid-gap: 0.5em;
            position: relative;
            flex-flow: var(--local-flex-flow);
            justify-content: var(--local-justify);
            align-items: var(--local-align);
        }
    `, "Effects");
    async function Beautify() {
        addstyle(`
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
            .global-sidebar:hover + .content-wrapper.shifted {
                margin-left: 10rem;
            }
        `, "Effects");
    }
    async function RemoveNotice() {
        const announce = $$("body > div.content-wrapper.shifted > a");
        if (announce) {announce.remove()}
    }
    async function Ad_Block() {
        GM_addStyle(`.ad-container, .root--ujvuu {display: none}`);
        addscript(`
            const Ad_observer = new MutationObserver(() => {
                try {
                    document.querySelectorAll(".ad-container").forEach(ad => {ad.remove()});
                    document.querySelector(".root--ujvuu button").click();
                } catch {}
                let XMLRequest = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function(method, url) {
                    if (url.endsWith(".m3u8") || url === "https://s.magsrv.com/v1/api.php") {
                        return;
                    }
                    XMLRequest.apply(this, arguments);
                };
            });

            try {
                Ad_observer.observe(document.body, {childList: true, subtree: true});
            } catch {}
        `, "ADB");
    }
    async function CardSize() {
        addstyle(`
            * { --card-size: 12vw; }
        `, "Effects");
    }
    async function PostCardFade(Mode) {
        switch (Mode) {
            case 2:
            addstyle(`
                .post-card__header, .post-card__footer {
                    opacity: 0.4;
                    transition: opacity 0.3s;
                }
                a:hover .post-card__header,
                a:hover .post-card__footer {
                    opacity: 1;
                }
            `, "Effects");break;
            default:
            addstyle(`
                .post-card__header {
                    opacity: 0;
                    z-index: 1;
                    padding: 5px;
                    pointer-events: none;
                    transform: translateY(-6vh);
                }
                .post-card__footer {
                    opacity: 0;
                    z-index: 1;
                    padding: 5px;
                    pointer-events: none;
                    transform: translateY(6vh);
                }
                a:hover .post-card__header,
                a:hover .post-card__footer {
                    opacity: 1;
                    pointer-events: auto;
                    transform: translateY(0vh);
                    transition: transform 0.4s, opacity 0.6s;
                }
            `, "Effects");
        }
    }
    async function NewTabOpens() {
        WaitElem("article a", true, 8, article => {
            article.forEach(link => {
                addlistener(link, "click", event => {
                    event.preventDefault();
                    GM_openInTab(link.href, { active: false, insert: true });
                }, { capture: true })
            })
        });
    }
    async function QuickPostToggle() {
        let Old_data, New_data, item;
        async function Request(link) {
            Old_data = $$("section");
            item = $$("div.card-list__items");
            GM_addElement(item, "img", {class: "gif-overlay"});
            GM_xmlhttpRequest({
                method: "GET",
                url: link,
                nocache: false,
                onload: response => {
                    New_data = parser.parseFromString(response.responseText, "text/html").querySelector("section");
                    ReactDOM.render(React.createElement(ReactRendering, { content: New_data.innerHTML }), Old_data);
                    history.pushState(null, null, link);
                    QuickPostToggle();
                    NewTabOpens();
                }
            });
        }
        WaitElem("menu a", true, 8, meun => {
            meun.forEach(ma => {
                addlistener(ma, "click", (event) => {
                    event.preventDefault();
                    Request(ma.href);
                }, { capture: true, once: true })
            })
        });
    }
    async function OriginalImage(Mode) {
        let href, a, img;
        MenuDependent();
        set = GetSet.ImgSet();
        addstyle(`
            .img-style {
                display: block;
                width: ${set.img_w};
                height: ${set.img_h};
                margin: ${set.img_gap} auto;
                max-width: ${set.img_mw};
            }
        `);
        WaitElem("div.post__thumbnail", true, 5, thumbnail => {
            function ImgRendering({ ID, href }) {
                return React.createElement("a", {
                    id: ID,
                    className: "image-link"
                }, React.createElement("img", {
                    key: "img",
                    src: href.href.split("?f=")[0],
                    className: "img-style",
                    onError: function () {
                        Reload(ID, 15);
                    }
                })
                )
            };
            switch (Mode) {
                case 2:
                    Replace(0);
                    function Replace(index) {
                        if (index == thumbnail.length) {return}
                        const object = thumbnail[index];
                        object.classList.remove("post__thumbnail");
                        a = $$("a", false, object);
                        img = $$("img", false, a);
                        Object.assign(img, {
                            className: "img-style",
                            src: a.href.split("?f=")[0],
                        });
                        img.removeAttribute("data-src");
                        a.id = `IMG-${index}`
                        a.removeAttribute("href");
                        a.removeAttribute("download");
                        img.onload = function() {Replace(++index)};
                    };break;

                case 3:
                    const observer = new IntersectionObserver(observed => {
                        observed.forEach(entry => {
                            if (entry.isIntersecting) {
                                const object = entry.target;
                                observer.unobserve(object);
                                ReactDOM.render(React.createElement(ImgRendering, { ID: object.alt, href: $$("a", false, object) }), object);
                                object.classList.remove("post__thumbnail");
                            }
                        });
                    }, { threshold: 0.8 });
                    thumbnail.forEach((object, index) => {
                        object.alt = `IMG-${index}`;
                        observer.observe(object);
                    });break;

                default:
                    thumbnail.forEach((object, index) => {
                        object.classList.remove("post__thumbnail");
                        href = $$("a", false, object);
                        ReactDOM.render(React.createElement(ImgRendering, { ID: `IMG-${index}`, href: href }), object);
                    });
                    $$("a.image-link", true).forEach(link => {
                        const handleClick = () => {
                            img = $$("img", false, link);
                            if (!img.complete) {
                                img.src = img.src;
                            } else {
                                link.removeEventListener("click", handleClick);
                            }
                        }
                        link.addEventListener("click", handleClick);
                    });
            }
        });
    }
    async function Reload(ID, retry) {
        if (retry > 0) {
            setTimeout(() => {
                let object = $$(`#${ID}`), old = $$("img", false, object), img = document.createElement("img");
                Object.assign(img, {
                    src: old.src,
                    alt: "Reload",
                    className: "img-style"
                });
                img.onerror = function () { Reload(ID, retry) };
                old.remove();
                object.appendChild(buffer.appendChild(img));
                retry--;
            }, 1500);
        }
    }
    async function LinkOriented() {
        WaitElem("a.post__attachment-link", true, 5, post => {
            post.forEach(link => {
                link.setAttribute("download", "");
                link.href = decodeURIComponent(link.href);
                link.textContent = link.textContent.replace("Download", "").trim();
            });
        });
    }

    /* 影片美化 */
    async function VideoBeautify(Mode) {
        addstyle(`
            .video-title {
                margin-top: 0.5rem;
            }
            .post-video {
                height: 50%;
                width: 60%;
            }
        `, "Effects");
        WaitElem("ul[style*='text-align: center;list-style-type: none;'] li", true, 5, parents => {
            WaitElem("a.post__attachment-link", true, 5, post => {
                function ReactBeautify({ stream }) {
                    return React.createElement("summary", {
                            className: "video-title"
                        } , React.createElement("video", {
                            key: "video",
                            controls: true,
                            preload: "auto",
                            "data-setup": JSON.stringify({}),
                            className: "post-video",
                        },
                        React.createElement("source", {
                            key: "source",
                            src: stream.src,
                            type: stream.type
                        })
                    ));
                }
                parents.forEach(li => {
                    let title = $$("summary", false, li),
                    stream = $$("source", false, li);
                    if (title && stream) {
                        post.forEach(link => {
                            if (link.textContent.includes(title.textContent)) {
                                switch (Mode) {
                                    case 2:
                                        link.parentNode.remove();
                                        title = link;
                                    default:
                                        title = link.cloneNode(true);
                                        return;
                                }
                            }
                        });
                        ReactDOM.render(React.createElement(ReactBeautify, { stream: stream }), li);
                        li.insertBefore(title, $$("summary", false, li));
                    }
                });
            });
        });
    }
    async function CommentFormat() {
        addstyle(`
            .post__comments {
                display: flex;
                flex-wrap: wrap;
            }
            .post__comments>*:last-child {
                margin-bottom: 0.5rem;
            }
            .comment {
                margin: 0.5rem;
                max-width: 25rem;
                border-radius: 10px;
                flex-basis: calc(35%);
                border: 0.125em solid var(--colour1-secondary);
            }
        `, "Effects");
    }
    async function Initialization() {
        ExtraButton();
        OriginalImage();
        VideoBeautify();
        if ($$(".post__content img", true).length > 2) {
            $$(".post__content").remove();
        }
        $$("h1.post__title").scrollIntoView();
    }
    async function ExtraButton() {
        WaitElem("h2.site-section__subheading", false, 8, comments => {
            const prev = $$("a.post__nav-link.prev");
            const next = $$("a.post__nav-link.next");
            const span = document.createElement("span");
            const svg = document.createElement("svg");
            const color = location.hostname.startsWith("coomer") ? "#99ddff !important" : "#e8a17d !important";
            span.id = "next_box";
            span.style = "float: right";
            span.appendChild(next.cloneNode(true));
            svg.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" style="margin-left: 10px;cursor: pointer;">
                    <style>svg{fill: ${color}}</style>
                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM135.1 217.4l107.1-99.9c3.8-3.5 8.7-5.5 13.8-5.5s10.1 2 13.8 5.5l107.1 99.9c4.5 4.2 7.1 10.1 7.1 16.3c0 12.3-10 22.3-22.3 22.3H304v96c0 17.7-14.3 32-32 32H240c-17.7 0-32-14.3-32-32V256H150.3C138 256 128 246 128 233.7c0-6.2 2.6-12.1 7.1-16.3z"></path>
                </svg>
            `
            buffer.appendChild(svg);
            buffer.appendChild(span);
            comments.appendChild(buffer);
            addlistener(svg, "click", () => {
                $$("header").scrollIntoView();
            }, { capture: true, passive: true })
            const main = $$("main");
            addlistener($$("#next_box a"), "click", event => {
                event.preventDefault();
                AjexReplace(next.href, main);
            }, { capture: true, once: true });
        });
    }
    async function AjexReplace(url, old_main) {
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let New_data = parser.parseFromString(xhr.responseText, "text/html");
                let New_main = $$("main", false, New_data);
                ReactDOM.render(React.createElement(ReactRendering, { content: New_main.innerHTML }), old_main);
                history.pushState(null, null, url);
                setTimeout(Initialization(), 500);
            }
        };
        xhr.open("GET", url, true);
        xhr.send();
    }
    const styleRules = {
        img_h: value => img_rule[0].style.height = value,
        img_w: value => img_rule[0].style.width = value,
        img_mw: value => img_rule[0].style.maxWidth = value,
        img_gap: value => img_rule[0].style.margin = `${value} auto`,
        MT: value => img_rule[2].style.top = value,
        ML: value => img_rule[2].style.left = value
    };
    async function Menu() {
        img_rule = $$("#Add-Style").sheet.cssRules;
        set = GetSet.ImgSet();
        let parent, child, img_input, img_select, analyze;
        const img_data = [set.img_h, set.img_w, set.img_mw, set.img_gap];
        const menu = `
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
                                                    <p><input type="number" id="img_h" class="Image-input-settings" oninput="value = check(value)"></p>
                                                </div>
                                                <div>
                                                    <h2 class="narrative">${language.MIS_02}：</h2>
                                                    <p><input type="number" id="img_w" class="Image-input-settings" oninput="value = check(value)"></p>
                                                </div>
                                                <div>
                                                    <h2 class="narrative">${language.MIS_03}：</h2>
                                                    <p><input type="number" id="img_mw" class="Image-input-settings" oninput="value = check(value)"></p>
                                                </div>
                                                <div>
                                                    <h2 class="narrative">${language.MIS_04}：</h2>
                                                    <p><input type="number" id="img_gap" class="Image-input-settings" oninput="value = check(value)"></p>
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
                                            <button id="readsettings" class="button-options" disabled>${language.MB_01}</button>
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
        const UnitOptions = `
            <select class="Image-input-settings" style="margin-left: 1rem;">
                <option value="px" selected>px</option>
                <option value="%">%</option>
                <option value="rem">rem</option>
                <option value="vh">vh</option>
                <option value="vw">vw</option>
                <option value="auto">auto</option>
            </select>
        `
        $(document.body).append(menu);
        $(".modal-interface").draggable({ cursor: "grabbing" });
        $(".modal-interface").tabs();
        $on("#image-settings", "click", () => {
            const img_set = $("#image-settings-show");
            if (img_set.css("opacity") === "0") {
                img_set.find("p").each(function() {
                    $(this).append(UnitOptions);
                });
                img_set.css({
                    "height": "auto",
                    "width": "auto",
                    "opacity": 1
                });
                $("#readsettings").prop("disabled", false);
                PictureSettings();
            }
        })
        $("#language").val(GM_getValue("language", null) || "")
        $on("#language", "input change", function (event) {
            event.stopPropagation();
            const value = $(this).val();
            language = display_language(value);
            GM_setValue("language", value);
            $("#language").off("input change");
            $(".modal-background").remove();
            Menu();
        });
        async function PictureSettings() {
            $on(".Image-input-settings", "input change", function (event) {
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
        }
        $on("#readsettings", "click", () => {
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
        let save = {};
        $on("#application", "click", () => {
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
            GM_setValue("ImgSet", [save]);
            save = {};
            const menu_location = $(".modal-interface");
            const top = menu_location.css("top");
            const left = menu_location.css("left");
            save["MT"] = top;
            save["ML"] = left;
            GM_setValue("MenuSet", [save]);

            styleRules["MT"](top);
            styleRules["ML"](left);
            $(".modal-background").remove();
        });
        $on("#closure", "click", () => {
            $(".modal-background").remove();
        });
    }
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
        set = GetSet.MenuSet();
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
            }
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
            .modal-box {
                padding: 0.5rem;
                height: 50vh;
                width: 32vw;
            }
            .menu {
                width: 5.5vw;
                overflow: auto;
                text-align: center;
                vertical-align: top;
                border-radius: 2px;
                border: 2px solid #F6F6F6;
            }
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
            .narrative { color: #EE2B47; }
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
            .button-space { margin: 0 0.6rem; }
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
            table, td {
                margin: 0px;
                padding: 0px;
                overflow: auto;
                border-spacing: 0px;
            }
            p { display: flex; flex-wrap: nowrap; }
            option { color: #F6F6F6; }
            ul {
                list-style: none;
                padding: 0px;
                margin: 0px;
            }
        `);
    }
    function ReactRendering({ content }) {return React.createElement("div", { dangerouslySetInnerHTML: { __html: content } });}
    function $$(Selector, All=false, Source=document) {
        if (All) {return Source.querySelectorAll(Selector)}
        else {
            const slice = Selector.slice(1);
            const analyze = (slice.includes(" ") || slice.includes(".") || slice.includes("#")) ? " " : Selector[0];
            switch (analyze) {
                case "#": return Source.getElementById(slice);
                case " ": return Source.querySelector(Selector);
                case ".": return Source.getElementsByClassName(slice)[0];
                default: return Source.getElementsByTagName(Selector)[0];
            }
        }
    }
    async function addstyle(Rule, ID="Add-Style") {
        let new_style = $$(`#${ID}`);
        if (!new_style) {
            new_style = document.createElement("style");
            new_style.id = ID;
            document.head.appendChild(new_style);
        }
        new_style.appendChild(document.createTextNode(Rule));
    }
    async function addscript(Rule, ID="Add-script") {
        let new_script = $$(`#${ID}`);
        if (!new_script) {
            new_script = document.createElement("script");
            new_script.id = ID;
            document.head.appendChild(new_script);
        }
        new_script.appendChild(document.createTextNode(Rule));
    }
    async function addlistener(element, type, listener, add={}) {element.addEventListener(type, listener, add);}
    async function $on(element, type, listener) {$(element).on(type, listener);}
    async function WaitElem(selector, all, timeout, callback) {
        let timer, element, result;
        const observer = new MutationObserver(() => {
            element = all ? $$(selector, true) : $$(selector);
            result = all ? element.length > 0 : element;
            if (result) {
                observer.disconnect();
                clearTimeout(timer);
                callback(element);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        timer = setTimeout(() => {
            observer.disconnect();
        }, 1000 * timeout);
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
            "en-US": [{
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
        return display.hasOwnProperty(language) ? display[language][0] : display["en-US"][0];
    }
})();