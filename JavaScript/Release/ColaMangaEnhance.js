// ==UserScript==
// @name         ColaManga 瀏覽增強
// @name:zh-TW   ColaManga 瀏覽增強
// @name:zh-CN   ColaManga 浏览增强
// @name:en      ColaManga Browsing Enhancement
// @version      0.0.5
// @author       HentaiSaru
// @description       隱藏廣告內容，阻止廣告點擊，提昇瀏覽體驗。自訂背景顏色，圖片大小調整。當圖片載入失敗時，自動重新載入圖片。提供熱鍵功能：[← 上一頁]、[下一頁 →]、[↑ 自動上滾動]、[↓ 自動下滾動]。當用戶滾動到頁面底部時，自動跳轉到下一頁。
// @description:zh-TW 隱藏廣告內容，阻止廣告點擊，提昇瀏覽體驗。自訂背景顏色，圖片大小調整。當圖片載入失敗時，自動重新載入圖片。提供熱鍵功能：[← 上一頁]、[下一頁 →]、[↑ 自動上滾動]、[↓ 自動下滾動]。當用戶滾動到頁面底部時，自動跳轉到下一頁。
// @description:zh-CN 隐藏广告内容，阻止广告点击，提昇浏览体验。自定义背景颜色，调整图片大小。当图片载入失败时，自动重新载入图片。提供快捷键功能：[← 上一页]、[下一页 →]、[↑ 自动上滚动]、[↓ 自动下滚动]。当用户滚动到页面底部时，自动跳转到下一页。
// @description:en    Hide advertisement content, block ad clicks, enhance browsing experience. Customize background color, adjust image size. Automatically reload images when they fail to load. Provide shortcut key functionalities: [← Previous Page], [Next Page →], [↑ Auto Scroll Up], [↓ Auto Scroll Down]. Automatically jump to the next page when users scroll to the bottom of the page.

// @match        *://www.colamanga.com/manga-*/*/*.html
// @icon         https://www.colamanga.com/favicon.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_getValue
// @require      https://update.greasyfork.org/scripts/487608/1333587/GrammarSimplified.js
// ==/UserScript==
(new class extends API{constructor(){super();this.JumpTrigger=!1;this.MangaList=this.BottomStrip=this.PreviousPage=this.NextPage=this.ContentsPage=this.HomePage=this.Interval=this.GetStatus=null;this.Up_scroll=this.Down_scroll=!1;this.Observer_Next=null;this.ScrollSpeed=5;this.Device={Width:window.innerWidth,Height:window.innerHeight,Agent:navigator.userAgent,_Type:void 0,Type:function(){return this._Type||(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(this.Agent)||768>this.Width?this._Type="Mobile":this._Type="Desktop"),this._Type}};this.Get_Data=async()=>{this.WaitMap(["div.mh_readtitle","div.mh_headpager","div.mh_readend a","#mangalist"],20,a=>{var [a,b,c,d]=a;a=this.$$("a",!0,a);this.ContentsPage=a[0].href;this.HomePage=a[1].href;b=this.$$("a.mh_btn:not(.mh_bgcolor)",!0,b);this.PreviousPage=b[0].href;this.NextPage=b[1].href;this.MangaList=d;this.BottomStrip=c;this.GetStatus=[this.ContentsPage,this.HomePage,this.PreviousPage,this.NextPage,this.MangaList,this.BottomStrip].every(e=>e)})};this.DetectionJumpLink=a=>!a.startsWith("javascript");this.throttle=(a,b)=>{let c=null;return function(){let d=this,e=arguments;null==c&&(c=setTimeout(function(){a.apply(d,e);c=null},b))}};this.scroll=async a=>{(this.Up_scroll&&0>a||this.Down_scroll&&0<a)&&requestAnimationFrame(()=>{window.scrollBy(0,a);this.throttle(this.scroll(a),this.ScrollSpeed)})};this.Get_Style=()=>(this.store("get","Style")||[{BG_Color:"#595959",Img_Bw:"auto",Img_Mw:"100%"}])[0];this.ImgStyle=this.Get_Style()}async BlockAds(){let a;this.Interval=setInterval(()=>{(a=this.$$("iframe"))&&a.remove()},600);"Desktop"==this.Device.Type()?this.AddStyle("body {pointer-events: none;}body .mh_wrap, .modal-background {pointer-events: auto;}","Inject-Blocking-Ads"):"Mobile"==this.Device.Type()&&(this.AddListener(window,"pointerup",b=>{b.stopImmediatePropagation()},{capture:!0,passive:!0}),this.AddListener(document,"pointerup",b=>{b.stopImmediatePropagation()},{capture:!0,passive:!0}),this.AddListener(window,"click",b=>{b.stopImmediatePropagation()},{capture:!0,passive:!0}),this.AddListener(document,"click",b=>{b.stopImmediatePropagation()},{capture:!0,passive:!0}))}async BackgroundStyle(){document.body.style.backgroundColor=this.ImgStyle.BG_Color}async PictureStyle(){"Desktop"==this.Device.Type()&&this.AddStyle(`.mh_comicpic img {vertical-align: top;cursor: pointer;display: block;margin: auto;width: ${this.ImgStyle.Img_Bw};max-width: ${this.ImgStyle.Img_Mw};}`,"Inject-Image-Style");this.AutoReload()}async AutoReload(){try{let a=new MouseEvent("click",{bubbles:!0,cancelable:!0});const b=new IntersectionObserver(c=>{c.forEach(d=>{d.isIntersecting&&d.target.dispatchEvent(a)})},{threshold:.3});this.$$("span.mh_btn:not(.contact)",!0,this.MangaList).forEach(c=>{b.observe(c)})}catch{}}async Hotkey_Switch(){if(this.GetStatus)if("Desktop"==this.Device.Type())this.AddListener(document,"keydown",a=>{var b=a.key;"ArrowLeft"!=b||this.JumpTrigger?"ArrowRight"!=b||this.JumpTrigger?"ArrowUp"==b?(a.preventDefault(),this.Up_scroll?this.Up_scroll=!1:this.Up_scroll&&!this.Down_scroll||(this.Down_scroll=!1,this.Up_scroll=!0,this.scroll(-1))):"ArrowDown"==b&&(a.preventDefault(),this.Down_scroll?this.Down_scroll=!1:!this.Up_scroll&&this.Down_scroll||(this.Up_scroll=!1,this.Down_scroll=!0,this.scroll(1))):(this.JumpTrigger=!!this.DetectionJumpLink(this.NextPage),location.assign(this.NextPage)):(this.JumpTrigger=!!this.DetectionJumpLink(this.PreviousPage),location.assign(this.PreviousPage))},{capture:!0});else if("Mobile"==this.Device.Type()){const a=.35*this.Device.Width,b=this.Device.Height/4*.2;let c,d,e,g;this.AddListener(this.MangaList,"touchstart",f=>{c=f.touches[0].clientX;d=f.touches[0].clientY},{passive:!0});this.AddListener(this.MangaList,"touchmove",this.throttle(f=>{requestAnimationFrame(()=>{e=f.touches[0].clientX-c;g=f.touches[0].clientY-d;Math.abs(g)<b&&(e>a&&!this.JumpTrigger?(this.JumpTrigger=!!this.DetectionJumpLink(this.PreviousPage),location.assign(this.PreviousPage)):e<-a&&!this.JumpTrigger&&(this.JumpTrigger=!!this.DetectionJumpLink(this.NextPage),location.assign(this.NextPage)))})},100),{passive:!0})}}async Automatic_Next(){if(this.GetStatus){const a=this,b=a.$$("img",!0,a.MangaList),c=b[Math.floor(.7*b.length)];a.Observer_Next=new IntersectionObserver(d=>{d.forEach(e=>{e.isIntersecting&&c.src&&(a.Observer_Next.disconnect(),a.DetectionJumpLink(a.NextPage))&&location.assign(a.NextPage)})},{threshold:.5});a.Observer_Next.observe(a.BottomStrip)}}async Injection(){try{this.BlockAds();const a=new MutationObserver(()=>{if(document.body){a.disconnect();this.Get_Data();this.BackgroundStyle();const b=setInterval(()=>{null!=this.GetStatus&&(clearInterval(b),this.PictureStyle(),this.Hotkey_Switch(),this.Automatic_Next())},300)}});a.observe(document,{childList:!0,subtree:!0})}catch(a){this.log(null,a)}}}).Injection();