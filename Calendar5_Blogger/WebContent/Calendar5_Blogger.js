// Calendar5_Bloggerモジュール
var Calendar5_Blogger = Calendar5_Blogger || function() {
    const cl = {
        defaults: {},  // デフォルト値を入れるオブジェクト。
        callback: {  // コールバック関数。
            getArticles: function(json) {  // 指定した月のフィードを受け取る。
                Array.prototype.push.apply(g.posts, json.feed.entry);  // 投稿のフィードデータを配列に追加。
                if (json.feed.openSearch$totalResults.$t < g.max) {  // 取得投稿数がg.maxより小さい時はすべて取得できたと考える。
                    const re = /\d\d(?=T\d\d:\d\d:\d\d\.\d\d\d.\d\d:\d\d)/i;  // フィードの日時データから日を取得するための正規表現パターン。
                    g.posts.forEach(function(e){  // 投稿のフィードデータについて
                        const d = Number(re.exec(e[g.order].$t));  // 投稿の日を取得。
                        g.dic[d] = g.dic[d] || [];  // 辞書の値の配列を初期化する。
                        const txt = e.summary.$t.substr(0, 20) + "...";
                        const url = (e.media$thumbnail) ? e.media$thumbnail.url : null;  // サムネイルのURL。
                        g.dic[d].push([e.link[4].href, e.link[4].title, txt, url]);  // 辞書の値の配列に[投稿のURL, 投稿タイトル, 投稿本文, サムネイルのURL]の配列を入れて2次元配列にする。
                    });
                    const m = cal.createCalendar();  // フィードデータからカレンダーを作成する。
                    m.addEventListener('mousedown', eh.mouseDown, false);  // カレンダーのflexコンテナでイベントバブリングを受け取る。マウスが要素をクリックしたとき。
                    m.addEventListener('mouseover', eh.mouseOver, false);  // マウスポインタが要素に入った時。
                    m.addEventListener('mouseout', eh.mouseOut, false);  // マウスポインタが要素から出た時。
                    g.elem.textContent = null;  // 追加する対象の要素の子ノードを消去する。
                    g.elem.appendChild(m);  // 追加する対象の要素の子ノードにカレンダーのflexコンテナを追加。
                    g.elem.appendChild(pt.elem);  // 投稿リストを表示するノードを追加。
                    if (!eh.node && g.mc)
                        pt.getPostDate(); // eh.nodeがnull(つまりページのロード時のみ)かつアイテムページの時のみアイテムページの投稿リストを展開する。
                } else {  // 未取得のフィードを再取得する。最新の投稿が先頭に来る。
                    const m = /(\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d)\.\d\d\d(.\d\d:\d\d)/i.exec(json.feed.entry[json.feed.entry.length - 1][g.order].$t);  // フィードの最終投稿（最古）データの日時を取得。
                    const dt = new Date(m[1] + m[2]);  // フィードの最終投稿（最古）データの日時の日付オブジェクトを取得。
                    dt.setSeconds(dt.getSeconds() - 1);  // 最古の投稿の日時より1秒古い日時を取得。
                    if (g.month === dt.getMonth() + 1)
                        fd.createURL(g.year + "-" + fd.fm(g.month) + "-" + fd.fm(dt.getDate()) + "T" + fd.fm(dt.getHours()) + ":" + fd.fm(dt.getMinutes()) + ":" + fd.fm(dt.getSeconds()) + "%2B09:00");  // フィード取得のURLを作成。
                }
            },
        },
        all: function(elemID) {  // ここから開始する。
            g.elem = document.getElementById(elemID);  // idから追加する対象の要素を取得。
            if (g.elem) {  // 追加対象の要素が存在するとき
                st.init();  // 言語設定。
                cal.init();  // カレンダーのノードの不変部分を作成しておく。
                pt.init();  // 投稿リストのノードの不変部分を作成しておく。
                let dt; // 日付オブジェクト。
                g.mc = /\/(20\d\d)\/([01]\d)\//.exec(document.URL);  // URLから年と月を正規表現で得る。g.mc[1]が年、g.mc[2]が月。
                dt = (g.mc) ? new Date(g.mc[1], Number(g.mc[2]) - 1, 1) : new Date();  // URLから年と月を取得できた時。
                fd.getFeed(dt);
            }
        }
    };  // end of cl
    const g = {  // モジュール内の"グローバル"変数。
        max: 150,  // Bloggerのフィードで取得できる最大投稿数を設定。
        order: "published",  // publishedかupdatedが入る。
        elem: null,  // 置換するdiv要素。
        init_d: function (dt) {  // 日付オブジェクトからカレンダーのデータを作り直す。
            g.year = dt.getFullYear();  // 表示カレンダーの年を取得。
            g.month = dt.getMonth() + 1;  // 表示カレンダーの月を取得。
            g.lastday = new Date(g.year, g.month, 0).getDate();  // 表示カレンダーの末日を取得。
            g.posts = [];  // フィードデータをリセットする。投稿のフィードデータを収納する配列。
            g.dic = {};  // 投稿データをリセットする。キーを日、値を投稿のURLと投稿タイトルの配列の配列、とする辞書。
        },
        mc: false,  // アイテムページの年[1]と月[2]の配列。
    };  // end of g
    const st = {  // 言語置換
        enM: ["Jan.","Feb.","Mar.","Apr.","May.","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."],
        init: function() {
            st.f = /.jp$/i.test(location.hostname);  // jpドメインのときtrueそうでなければfalse。
            st.days = (st.f) ? ["日","月","火","水","木","金","土"] : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];  // 曜日の配列。
            st.next_month = (st.f) ? "翌月へ" : "Next";
            st.prev_month = (st.f) ? "前月へ" : "Previous";
            st.posted = (st.f) ? "公開" : "Posted";
            st.updated = (st.f) ? "更新" : "Updated";
            st.tooltip = (st.f) ? "公開日と更新日を切り替える" : "Switching between published and updated";
        }
    };  // end of st
    const cal = {  // カレンダーを作成するオブジェクト。
        _holidayC: "rgb(255, 0, 0)",  // 休日の文字色
        _saturdayC: "rgb(0, 51, 255)",  // 土曜日の文字色
        _nodes: null,
        init: function() {  // カレンダーのノードの不変部分の取得。
            cal._nodes = cal._createNodes();
        },
        _createNodes: function() {  // カレンダーのノードの不変部分を作成しておく。
            const m = document.createElement("div");
            m.setAttribute("style", "display:flex;flex-wrap:wrap;");
            const a = document.createElement("div");
            a.setAttribute("style", "flex:0 0 14%;text-align:center;");
            m.appendChild(a);
            m.appendChild(a.cloneNode(true));
            const t = document.createElement("div");
            t.setAttribute("style", "flex:1 0 44%;text-align:center;cursor:pointer;");
            m.appendChild(t);
            m.appendChild(a.cloneNode(true));
            m.appendChild(a.cloneNode(true));
            const d = document.createElement("div");
            d.setAttribute("style", "flex:0 0 14%;text-align:center;");
            st.days.forEach(function(e, i) {  // 1行目に曜日を表示させる。2番目の引数は配列のインデックス。
                const node = d.cloneNode(true);
                node.appendChild(document.createTextNode(st.days[i]));
                cal._getDayC(node, i);  // 曜日の色をつける。
                if (!st.f)
                    node.style.fontSize = "80%";  // 英語表記では1行に収まらないのでフォントサイズを縮小。
                m.appendChild(node);  // カレンダーのflexコンテナに追加。
            });
            d.className = "nopost";
            for (i = 0; i < 42; i++) {  // カレンダーの5行目まで作成。
                m.appendChild(cal._createDateNodes(d));  // カレンダーのflexコンテナに追加。
            }
            d.style.display = "none";  // カレンダーの6行目はデフォルトでは表示させない。
            for (let i = 0; i < 7; i++) {
                m.appendChild(cal._createDateNodes(d));  // カレンダーのflexコンテナに追加。
            }
            return m;
        },
        _createDateNodes: function(d) {
            const node = d.cloneNode(true);
            cal._getDayC(node, i % 7);  // 曜日の色をつける。
            return node;
        },
        createCalendar: function() {  // カレンダーのHTML要素を作成。
            const m = cal._nodes.cloneNode(true);
            const dt = new Date();  // 今日の日付オブジェクトを取得。
            const now = new Date(dt.getFullYear(), dt.getMonth(), 1);  // 今月の1日を取得。
            const caldt = new Date(g.year, g.month - 1, 1);
            if (now > caldt) {  // 表示カレンダーの月が現在より過去のときのみ左矢印を表示させる。
                m.childNodes[0].appendChild(document.createTextNode('\u00ab'));
                m.childNodes[0].style.cursor = "pointer";  // マウスポインタの形状を変化させる。
                m.childNodes[0].id = "next_year";
                m.childNodes[1].appendChild(document.createTextNode('\u003c'));
                m.childNodes[1].style.cursor = "pointer";  // マウスポインタの形状を変化させる。
                m.childNodes[1].title = st.next_month;
                m.childNodes[1].id = "next_month";
            }
            let titleText = (st.f) ? g.year + "年" + g.month + "月" : st.enM[g.month - 1] + " " + g.year;
            titleText += (g.order === "published") ? "" : " " + st.updated;
            m.childNodes[2].appendChild(document.createTextNode(titleText));
            m.childNodes[2].style.cursor = "text";
            m.childNodes[2].title = st.tooltip;
            m.childNodes[2].id = "title_calendar";
            const firstpost = new Date(cl.defaults.StartYear, cl.defaults.StartMonth - 1, 1);  // 1日を取得。
            if (firstpost < caldt) {  // 表示カレンダーの月が初投稿月より未来のときのみ右矢印を表示させる。
                m.childNodes[3].appendChild(document.createTextNode('\u003e'));
                m.childNodes[3].style.cursor = "pointer";  // マウスポインタの形状を変化させる。
                m.childNodes[3].title = st.prev_month;
                m.childNodes[3].id = "prev_month";
                m.childNodes[4].appendChild(document.createTextNode('\u00bb'));
                m.childNodes[4].style.cursor = "pointer";  // マウスポインタの形状を変化させる。
                m.childNodes[4].id = "prev_year";
            }
            const day =  caldt.getDay();  // 1日の曜日を取得。日曜日は0、土曜日は6になる。
            const c = 11 + day;  // 1日の要素番号-1。
            pt.dic = {};  // 日付、とカレンダーノードの辞書をリセットする。
            for (let i = 1; i <= g.lastday; i++) { // 1日から末日まで。
                const d = m.childNodes[c + i];
                d.appendChild(document.createTextNode(i));
                let t = "";  // nullはundefinedと表示されるのでだめ。
                if (i in g.dic) {  // 辞書のキーに日があるとき
                    pt.dic[i] = d;  // アイテムページで投稿リストを展開するための辞書。keyが日付、値はカレンダーのノード。
                    g.dic[i].forEach(function(arr) {  // title属性に投稿タイトルのみ入れる。
                        t += t ? "\n" + "\u30fb" + arr[1] : "\u30fb" + arr[1];
                    });
                    d.title = t;
                    d.className = "post";
                    d.setAttribute("style", d.style.cssText + "background-color:rgba(128,128,128,.4);border-radius:50%;cursor:pointer;margin-bottom:0px;");
                }
                cal._getHolidayC(d, i);  // 祝日に色をつける。
            }
            if (day + g.lastday > 35) {  // 最終行の表示。
                for (let i = 45; i < 52; i++) {
                    m.childNodes[i].style.display = null;
                }
            }
           return m;
        },
        _getHolidayC: function(node, i) {  // 祝日に色をつける。JSON文字列はhttps://p--q.blogspot.jp/2016/12/blogger10json.htmlを作成。
            // キーは年、値は2次元配列。1次が月数、2次が祝日の配列。
            const holidays = cl.defaults.Holidays;
            const arr = holidays[g.year][g.month - 1];  // 祝日の配列を取得。
            if (arr.indexOf(i) !== -1)
                node.style.color = cal._holidayC;  // 祝日配列に日付があるとき。in演算子はインデックスの有無の確認をするだけ。
        },
        _getDayC: function(node, r){  // 曜日の色をつける。オブジェクトの参照渡しを利用。
            node.setAttribute("data-remainder", r);  // ノードに曜日番号を付ける。data-から始まるプロパティにしないとNode.cloneNode(true)で消えてしまう。
            if (r === 0) {  // 日曜日のとき
                node.style.color = cal._holidayC;
            } else if (r === 6) {  // 土曜日のとき
                node.style.color = cal._saturdayC;
            }
        }
    };  // end of cal
    const fd = {
        _writeScript: function(url) {  // スクリプト注入。
            const ws = document.createElement('script');
            ws.type = 'text/javascript';
            ws.src = url;
            document.getElementsByTagName('head')[0].appendChild(ws);
        },
        createURL: function(max) {  // フィードを取得するためのURLを作成。
            let url = "/feeds/posts/summary?alt=json-in-script&orderby=" + g.order + "&" + g.order + "-min=" + g.year + "-" + fd.fm(g.month) + "-01T00:00:00%2B09:00&" + g.order + "-max=" + max;  // 1日0時0分0秒からmaxの日時までの投稿フィードを取得。データは最新の投稿から返ってくる。
            url += "&callback=Calendar5_Blogger.callback.getArticles&max-results=" + g.max;  // コールバック関数と最大取得投稿数を設定。
            fd._writeScript(url);  // スクリプト注入でフィードを取得。
        },
        fm: function(m) {  // 数値を2桁の固定長にする。
            return ("0" + m).slice(-2);
        },
        getFeed: function(dt) {  // 日付オブジェクトからフィードを得てカレンダーを作成する。
            g.init_d(dt);  // 日付オブジェクトからカレンダーのデータを作成。
            fd.createURL(g.year + "-" + fd.fm(g.month) + "-" + fd.fm(g.lastday) + "T23:59:59%2B09:00");  // フィードを取得するためのURLを作成。
        },
        removeParam: function(thisUrl) {
            return thisUrl.replace(/\?m=[01][&\?]/, "?").replace(/[&\?]m=[01]/, "");  // ウェブバージョンとモバイルサイトのパラメータを削除。
        }
    };  // end of fd
    const pt = {  // その日の投稿リストを表示
        dic: {},  // keyが日付、値がカレンダーのノードの辞書。
        elem: null,  // 投稿リストを表示させるノード。
        _nodes: null,  // 投稿リストのノードの不変部分
        _reF: /\w+\.html/,  // htmlファイル名を抽出する正規表現パターン。
        init: function() {
            pt._nodes = pt._createNodes();  // 投稿リストのノードの不変部分の取得。
            pt.elem = document.createElement("div");  // 投稿リストの年月日を表示する要素の作成。
            pt.elem.setAttribute("style", "display:flex;flex-direction:column;padding-top:5px;text-align:center;");
            pt._html = pt._reF.exec(fd.removeParam(document.URL));  // URLからhtmlファイル名を取得。
        },
        _createNodes: function() {  // 投稿リストのノードの不変部分を作成しておく。
            const p = document.createElement("div");
            p.setAttribute("style", "border-top:dashed 1px rgba(128,128,128,.5);padding-top:5px;");
            p.appendChild(document.createElement("div"));
            p.childNodes[0].setAttribute("style", "float:left;padding:0 5px 5px 0;");
            p.childNodes[0].appendChild(document.createElement("a"));
            p.childNodes[0].childNodes[0].target = "_blank";
            p.childNodes[0].childNodes[0].appendChild(document.createElement("img"));
            p.appendChild(document.createElement("div"));
            p.childNodes[1].setAttribute("style", "text-align:left;");
            p.childNodes[1].appendChild(document.createElement("a"));
            p.childNodes[1].childNodes[0].target = "_blank";
            return p;
        },
        _postNode: function(arr) {  // 引数は[投稿のURL, 投稿タイトル, 投稿本文, サムネイルのURL]の配列。
            const p = pt._nodes.cloneNode(true);
            const text1 = '<p style="font-size: smaller;">' + arr[2] + '</p>';
            if (arr[3]) {  // サムネイルがあるとき
                p.childNodes[0].childNodes[0].href = arr[0];  // 投稿のURLを取得。
                p.childNodes[0].childNodes[0].childNodes[0].src = arr[3];  // サムネイル画像のURLを取得。
            } else {
                p.childNodes[0].setAttribute("style", "display:none");  // サムネイルがないときはノードを非表示にする。
            }
            p.childNodes[1].childNodes[0].href = arr[0];  // 投稿のURLを取得。
            p.childNodes[1].childNodes[0].appendChild(document.createTextNode(arr[1]));  // 投稿タイトルを取得。
            p.childNodes[1].childNodes[0].insertAdjacentHTML("beforeend", text1);
            return p;
        },
        createPostList: function(postNo) {  // 投稿リストのタイトルを作成。2番目の引数はハイライトする投稿の要素番号。
            const d = parseInt(eh.node.textContent, 10);  // 日付を取得。
            const order = (g.order === "published") ? st.posted : st.updated;
            pt.elem.textContent = (!st.f) ? order + ": " + st.enM[g.month - 1] + " " + d + ", " + g.year : g.year + "/" + g.month + "/" + d + "(" + st.days[eh.node.getAttribute("data-remainder")] + ") " + order;  // 投稿リストのタイトルを設定。
            g.dic[d].forEach(function(e, i) {  // 選択している日付の投稿リストを作成。
                pt.elem.appendChild(pt._postNode(e));
                if (i === postNo) {  // ハイライトする投稿のとき
                    const p = pt.elem.lastChild;  // ハイライトする投稿のリストのノードを取得。
                    p.setAttribute("style", p.style.cssText + "background-color:#eee;border:solid 1px #dddddd;border-radius:5px;pointer-events:none;");  // アンカータグのリンクも無効にする。
                }
            });
        },
        getPostDate: function() {  // アイテムページのURLからhtmlファイル名を比較して投稿日とハイライトする投稿番号を取得。
            const days = Object.keys(g.dic);  // 投稿のある日付の配列を取得。
            for (let i = 0; i < days.length; i++) {  // forEachメソッドでは途中で抜けられないのでfor文を使う。
                const d = days[i];  // 日付を取得。
                const posts = g.dic[d]; // 各日付の投稿の配列を取得。
                for (let j = 0; j < posts.length; j++) {  // 各投稿について
                    if (pt._html[0] === pt._reF.exec(posts[j])[0]) {  // 投稿のhtmlファイル名が一致するとき。フィードは.comで返ってきてTDLが異なるのでURL直接は比較できない。
                        eh.node = pt.dic[d];  // カレンダーの日付のノードを取得。
                        pt.createPostList(j);  // 投稿リストの作成。ハイライトする投稿の要素番号も渡す。
                        return;  // for文を抜ける。
                    }
                }
            }
        },
        getHighlightPostNo: function() {  // アイテムページのURLからhtmlファイル名を比較してハイライトする投稿番号を取得。
            const arr = g.dic[eh.node.textContent];  // その日付の投稿リストを取得。
            for (let i = 0; i < arr.length; i++) {
                if (pt._html[0] === pt._reF.exec(arr[i])[0]) {  // 投稿のhtmlファイル名が一致するとき。フィードは.comで返ってきてTDLが異なるのでURL直接は比較できない。
                    pt.createPostList(i);  // 投稿リストの作成。ハイライトする投稿の要素番号も渡す。
                    return;
                }
            }
            pt.createPostList(null);  // ハイライトする投稿番号がなかった時はnullを渡す。
        }
    };  // end of pt
    const eh = {  // イベントハンドラオブジェクト。
        node: null,  // 投稿一覧を表示している日付のノード。
        _timer: null,  // ノードのハイライトを消すタイマーID。
        _rgbaC: null,  // 背景色。styleオブジェクトで取得すると参照渡しになってしまう。
        _fontC: null,  // 文字色。
        mouseDown: function(e) {  // 要素をクリックしたときのイベントを受け取る関数。
            const target = e.target;  // イベントを発生したオブジェクト。
            switch (target.className) {
                case "post":  // 投稿がある日のとき
                    if (eh.node) {  // 投稿一覧を表示させているノードがあるとき。
                        eh.node.style.backgroundColor = eh._rgbaC; // そのノードの背景色を元に戻す。
                    }
                    eh.node = target;  // 投稿を表示させるノードを取得。
                    (g.mc) ? pt.getHighlightPostNo() : pt.createPostList(null);  // アイテムページの時
                    break;
                case "nopost":  // 投稿がない日のとき
                    pt.elem.textContent = null;  // 表示を消す。
                    if (eh.node) {  // 投稿一覧を表示させているノードがあるとき。
                        eh.node.style.backgroundColor = eh._rgbaC;  // そのノードの背景色を元に戻す。
                        eh.node = null;  // 取得しているノードを消去。
                        target.style.pointerEvents = null;  // クリックを有効にする。
                    }
                    break;
                default:
                    let dt = new Date(g.year, g.month - 1, 1);  // 表示しているカレンダーの1日の日付オブジェクトを取得。
                    switch (target.id) {
                        case "title_calendar":  // 公開日と更新日を切り替える。
                            target.style.pointerEvents = "none";  // 連続クリックできないようにする。
                            g.order = (g.order === "published") ? "updated" : "published";
                            fd.getFeed(dt);
                            break;
                        case "next_month":
                            target.style.pointerEvents = "none";  // 連続クリックできないようにする。
                            dt.setMonth(dt.getMonth() + 1);  // 翌月の日付オブジェクトを取得。
                            fd.getFeed(dt);
                            pt.elem.textContent = null;  // 表示を消す。
                            break;
                        case "next_year":
                            target.style.pointerEvents = "none";  // 連続クリックできないようにする。
                            const ny = new Date(dt.getFullYear() + 1, dt.getMonth(), 1);
                            const today = new Date();
                            dt = (ny < today) ? ny : today;
                            fd.getFeed(dt);
                            pt.elem.textContent = null;  // 表示を消す。
                            break;
                        case "prev_month":
                            target.style.pointerEvents = "none";  // 連続クリックできないようにする。
                            dt.setMonth(dt.getMonth() - 1);  // 前月の日付オブジェクトを取得。
                            fd.getFeed(dt);
                            pt.elem.textContent = null;  // 表示を消す。
                            break;
                        case "prev_year":
                            target.style.pointerEvents = "none";  // 連続クリックできないようにする。
                            const py = new Date(dt.getFullYear() - 1, dt.getMonth(), 1);
                            const sy = new Date(cl.defaults.StartYear, cl.defaults.StartMonth - 1, 1);
                            dt = (py > sy) ? py : sy;
                            fd.getFeed(dt);
                            pt.elem.textContent = null;  // 表示を消す。
                            break;
                    }
            }
        },
        mouseOver: function(e) {
            const target = e.target;  // イベントを発生したオブジェクト。
            if (target.className === "post") {  // 投稿がある日のとき
                eh._fontC = window.getComputedStyle(e.target, '').color;  // 文字色を取得。
                target.style.color = "#33aaff";  // 文字色を変える。
                eh._rgbaC = window.getComputedStyle(e.target, '').backgroundColor;  // 背景色のRGBAを取得。
                const mc = /\d+\.\d+/.exec(eh._rgbaC);  // 透明度を正規表現で取得。
                if (mc) {  // 取得できた時。
                    let alpha = Number(mc[0]) + 0.3;  // 透明度を取得。
                    alpha = (alpha > 1) ? 1 : alpha;  // 透明度が1より大きければ1にする。
                    target.style.backgroundColor = eh._rgbaC.replace(Number(mc[0]), alpha);  // 透明度を変更する。
                }
            } else {
                switch (target.id) {
                    case "title_calendar":
                    case "next_month":
                    case "next_year":
                    case "prev_month":
                    case "prev_year":
                        eh._fontC = window.getComputedStyle(e.target, '').color;  // 文字色を取得。
                        target.style.color = "#33aaff";  // 文字色を変える。
                        break;
                }
            }
        },
        mouseOut: function(e) {
            const target = e.target;  // イベントを発生したオブジェクト。
            if (target.className === "post") {  // 投稿がある日のとき
                target.style.color = eh._fontC;  // 変更前の文字色に戻す。
                if (target !== eh.node) {  // そのノードの投稿一覧を表示させていないとき。
                    target.style.backgroundColor = eh._rgbaC; // 背景色を元に戻す。
                }
            } else {
                switch (target.id) {
                    case "title_calendar":
                    case "next_month":
                    case "next_year":
                    case "prev_month":
                    case "prev_year":
                        target.style.color = eh._fontC;  // 変更前の文字色に戻す。
                }
            }
        }
    };  // end of eh
    return cl;  // グローバルスコープにオブジェクトを出す。
}();
Calendar5_Blogger.defaults["StartYear"] = 2013; // 遡る最大年。
Calendar5_Blogger.defaults["StartMonth"] = 3; // 遡る最大月。
// 祝日一覧
Calendar5_Blogger.defaults["Holidays"] = {"2013":[[1,14],[11],[20],[29],[3,4,5,6],[],[15],[],[16,23],[14],[3,4,23],[23]],"2014":[[1,13],[11],[21],[29],[3,4,5,6],[],[21],[],[15,23],[13],[3,23,24],[23]],"2015":[[1,12],[11],[21],[29],[3,4,5,6],[],[20],[],[21,22,23],[12],[3,23],[23]],"2016":[[1,11],[11],[20,21],[29],[3,4,5],[],[18],[11],[19,22],[10],[3,23],[23]],"2017":[[1,2,9],[11],[20],[29],[3,4,5],[],[17],[11],[18,23],[9],[3,23],[23]],"2018":[[1,8],[11,12],[21],[29,30],[3,4,5],[],[16],[11],[17,23,24],[8],[3,23],[23,24]],"2019":[[1,14],[11],[21],[29,30],[1,2,3,4,5,6],[],[15],[11,12],[16,23],[14,22],[3,4,23],[]],"2020":[[1,13],[11,24],[20],[29],[3,4,5,6],[],[23,24],[10],[21,22],[],[3,23],[]],"2021":[[1,11],[11,23],[20],[29],[3,4,5],[],[19],[11],[20,23],[11],[3,23],[]],"2022":[[1,10],[11,23],[21],[29],[3,4,5],[],[18],[11],[19,23],[10],[3,23],[]],"2023":[[1,2,9],[11,23],[21],[29],[3,4,5],[],[17],[11],[18,23],[9],[3,23],[]],"2024":[[1,8],[11,12,23],[20],[29],[3,4,5,6],[],[15],[11,12],[16,22,23],[14],[3,4,23],[]],"2025":[[1,13],[11,23,24],[20],[29],[3,4,5,6],[],[21],[11],[15,23],[13],[3,23,24],[]],"2026":[[1,12],[11,23],[20],[29],[3,4,5,6],[],[20],[11],[21,22,23],[12],[3,23],[]],"2027":[[1,11],[11,23],[21,22],[29],[3,4,5],[],[19],[11],[20,23],[11],[3,23],[]],"2028":[[1,10],[11,23],[20],[29],[3,4,5],[],[17],[11],[18,22],[9],[3,23],[]],"2029":[[1,8],[11,12,23],[20],[29,30],[3,4,5],[],[16],[11],[17,23,24],[8],[3,23],[]],"2030":[[1,14],[11,23],[20],[29],[3,4,5,6],[],[15],[11,12],[16,23],[14],[3,4,23],[]]};
Calendar5_Blogger.all("calendar5_blogger");  // idがcalendar5_bloggerの要素にカレンダーを表示させる。
