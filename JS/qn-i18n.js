// qn-i18n.js — 日本語/English切替。ソース内の文言は日本語のまま残し、英語表示の時だけDOMを英語へ差し替える(日本語文字列をキーにした辞書方式)。
// - 英語表示中のみ MutationObserver が動く(日本語表示中はobserverなし=負荷ゼロ)。後から作られるDOM/トースト/ポップアップも自動で英語になる。
// - 対象: テキストノードと title/aria-label/placeholder 属性。元の日本語はノード/要素に保持し、日本語へ戻す時に復元する。
// - 辞書: DICT(完全一致) → RULES(数字入りの断片を順に置換)。訳せない文字列(辞書に無い)は日本語のまま表示(誤訳より安全)。
// - alert/confirm の本文も英語化する。保存先: localStorage "qn_lang" (auto|ja|en、既定auto。autoはブラウザ言語がjaなら日本語)。
// - 文言を足す時: 日本語をそのまま書き、ここのDICT/RULESに英訳を足すだけ。英語はUIルール(先頭大文字・以後小文字、略語は大文字、絵文字なし、簡潔・中立)。
(function () {
  "use strict";

  var KEY = "qn_lang";
  var JP_STRICT = /[぀-ヿ一-鿿]/;
  var ATTRS = ["title", "aria-label", "placeholder"];

  // ---------- 完全一致の辞書 ----------
  var DICT = {
    // index.html / アカウント
    "メモのプリセットを選んだ時、マーカーに自動で付く色": "Color applied to a marker when a memo preset is chosen",
    "Googleでログイン": "Sign in with Google",
    "アカウントメニュー": "Account menu",
    "プラン": "Plan",
    "残り": "Remaining",
    "利用終了日": "Ends on",
    "解約する": "Cancel subscription",
    "ログアウト": "Log out",
    "サブスクリプションの解約": "Cancel subscription",
    "残り期間": "Time remaining",
    "次回自動更新日": "Next renewal",
    "キャンセル": "Cancel",
    "解約手続きへ進む": "Continue to cancellation",
    "解約手続きを行った場合も、": "Even after you cancel, you can keep using Premium features until ",
    "まで引き続きPremium機能をご利用いただけます。それ以降は自動的に無料プランへ切り替わります。": ". After that, your plan switches to Free automatically.",
    "サブスクを続ける": "Keep subscription",
    "処理中…": "Processing…",
    // バックアップ/インポート
    "曲を選択": "Select tracks",
    "全選択": "Select all",
    "全解除": "Clear all",
    "含める項目": "Include",
    "音声データ": "Audio data",
    "設定データ": "Settings data",
    "ZIP/JSONファイルをドロップ": "Drop a ZIP/JSON file",
    "またはクリックして選択": "or click to choose",
    "重複する項目": "Duplicates",
    "すべて上書き": "Overwrite all",
    "すべてスキップ": "Skip all",
    "すべてスキップに切り替え": "Switch to skip all",
    "すべて上書きに切り替え": "Switch to overwrite all",
    "上書き": "Overwrite",
    "スキップ": "Skip",
    "スキップに切り替え": "Switch to skip",
    "上書きに切り替え": "Switch to overwrite",
    "曲・動画・録音を1つ以上選択してください。": "Select at least one track, video or recording.",
    "少なくとも1項目を選択してください。": "Select at least one item.",
    "JSZipが読み込まれていません。": "JSZip is not loaded.",
    "バックアップの作成に失敗しました。": "Could not create the backup.",
    "ZIPまたはJSONファイルを選択してください。": "Select a ZIP or JSON file.",
    "読み込み中...": "Loading...",
    "markers.json・youtube.json・pitch.jsonのいずれも見つかりません。": "None of markers.json, youtube.json or pitch.json was found.",
    "ファイルの内容を読み取れませんでした。": "Could not read the file.",
    "ファイルの読み込みに失敗しました。": "Could not load the file.",
    "インポートに失敗しました。": "Import failed.",
    // 無料版の制限(トースト)
    "無料版ではEQを利用できません。": "EQ is not available on the Free plan.",
    "無料版ではSpeed変更を利用できません。": "Speed change is not available on the Free plan.",
    "無料版ではKey変更を利用できません。": "Key change is not available on the Free plan.",
    "無料版ではトラックリピートを利用できません。": "Track repeat is not available on the Free plan.",
    "無料版ではマーカーメモを利用できません。": "Marker memos are not available on the Free plan.",
    "無料版ではマーカーの色変更はできません。": "Marker colors cannot be changed on the Free plan.",
    "無料版ではライブラリの並び替え・フォルダ移動はできません。": "Reordering and moving to folders are not available on the Free plan.",
    "無料版ではフォルダの並び替えはできません。": "Folder reordering is not available on the Free plan.",
    "無料版ではフォルダへの移動はできません。": "Moving to folders is not available on the Free plan.",
    "無料版ではフォルダ分けはできません。": "Folders are not available on the Free plan.",
    "この機能は無料版では利用できません。": "This feature is not available on the Free plan.",
    "広告視聴で1時間機能解放": "Watch an ad to unlock for 1 hour",
    "アップグレード": "Upgrade",
    // 決済/アップグレード
    "反映に時間がかかっているか、決済が完了していない可能性があります。ページを再読み込みするか、アカウント状態をご確認ください。": "The update is taking a while, or the payment may not have completed. Reload the page or check your account.",
    "決済の反映を確認しています…": "Checking your payment…",
    "ログイン機能の準備中です。しばらくしてから再度お試しください。": "Sign-in is not ready yet. Try again in a moment.",
    "アップグレードしてQNPLAYERの全機能を解放": "Upgrade to unlock all QNPLAYER features",
    "広告解除1時間": "Ad-free 1 hour",
    "動画広告を1本視聴して、1曲集中耳コピや短時間の練習に。": "Watch one video ad. Good for transcribing one song or a short practice.",
    "無料": "Free",
    "動画広告 1本視聴": "Watch 1 video ad",
    "1時間解放": "Unlock 1 hour",
    "1時間 全機能が無制限で解放": "1 hour: all features unlimited",
    "ライブラリ保存数 無制限": "Unlimited library tracks",
    "マーカー・ループ自動停止なし": "No marker limit or loop auto-stop",
    "広告解除1日": "Ad-free 1 day",
    "広告を数本まとめて視聴して、週末の長時間練習やセッションに。": "Watch a few ads at once. Good for long weekend practice or sessions.",
    "動画広告 2〜3本視聴": "Watch 2-3 video ads",
    "24時間解放": "Unlock 24 hours",
    "24時間 全機能が無制限で解放": "24 hours: all features unlimited",
    "🇯🇵 日本限定価格": "Japan-only price",
    "マンスリー": "Monthly",
    "広告なしで常に快適。手軽に始めたい方に最適な月額プラン。": "Always ad-free. A monthly plan that is easy to start with.",
    "/ 月（自動更新）": "/ month (auto-renews)",
    "月額プランに登録": "Subscribe monthly",
    "広告表示・視聴 一切なし": "No ads at all",
    "常時 すべての制限が無制限": "All limits removed at all times",
    "気軽に解約・再開が可能": "Cancel or resume anytime",
    "おすすめ": "Recommended",
    "アニュアル": "Yearly",
    "1年間たっぷり使えてお得な年間プラン。長く練習する方に。": "A yearly plan with better value for long-term practice.",
    "/ 年（自動更新）": "/ year (auto-renews)",
    "年間プランに登録": "Subscribe yearly",
    "月額よりさらにお得な価格": "Cheaper than paying monthly",
    "詳しく比較する →": "Compare plans →",
    "年間プランをご利用中です。これ以上アップグレードできるプランはありません。": "You are on the yearly plan. There is no higher plan to upgrade to.",
    "現在のプランや他のプランはこちらから確認できます。": "View your current plan and other plans here.",
    "無料版の機能制限を解除するプランをお選びください。": "Choose a plan to remove the Free plan limits.",
    "現在、解約可能なサブスクリプションはありません。": "There is no subscription to cancel.",
    "ログインしてから解約手続きを行ってください。": "Log in before cancelling.",
    "解約手続きページを開けませんでした。しばらくしてから再度お試しください。": "Could not open the cancellation page. Try again in a moment.",
    // ライブラリ/フォルダ
    "フォルダ": "Folder",
    "新しいフォルダ": "New folder",
    "未分類": "Unsorted",
    "＋ 新しいフォルダへ": "+ New folder",
    "お気に入りから外す": "Remove from favorites",
    "お気に入りに追加（リスト上段に固定）": "Add to favorites (pinned to top)",
    "削除の選択中は切り替えられません": "Cannot switch while items are selected for deletion",
    "ドラッグでフォルダを並び替え": "Drag to reorder folders",
    "フォルダ名を変更": "Rename folder",
    "上へ": "Move up",
    "下へ": "Move down",
    "フォルダを削除（中の曲は未分類へ戻ります）": "Delete folder (tracks return to Unsorted)",
    "Auto Next: 同じフォルダ内だけ（タップで全体に切替）": "Auto Next: same folder only (tap for all)",
    "Auto Next: ライブラリ全体（タップでフォルダ内に切替）": "Auto Next: whole library (tap for folder only)",
    // マーカー/AB/ポップアップ
    "Skip ON: 次のマーカーまで飛ばして再生": "Skip ON: skips to the next marker",
    "Skip OFF: 押すとこの区間(次のマーカーまで)を飛ばして再生": "Skip OFF: tap to skip this section (up to the next marker)",
    "この位置をA点(ループ開始)に（もう一度押すと解除）": "Set this position as A (loop start). Tap again to clear",
    "この位置をB点(ループ終了)に（もう一度押すと解除）": "Set this position as B (loop end). Tap again to clear",
    "この位置にマーカーを追加": "Add a marker here",
    "この位置の区間(マーカーからマーカーまで)をループ": "Loop the section at this position (marker to marker)",
    "このA/B点を削除": "Delete this A/B point",
    "このマーカーを削除": "Delete this marker",
    "マーカーの色を変える": "Change marker color",
    "このマーカーから次のマーカーまでを再生中に飛ばす": "Skip from this marker to the next while playing",
    "マーカーのON/OFF": "Marker on/off",
    "現在位置をA点に（もう一度押すと解除）": "Set current position as A. Tap again to clear",
    "現在位置をB点に（もう一度押すと解除）": "Set current position as B. Tap again to clear",
    "10秒戻る": "Back 10s",
    "10秒進む": "Forward 10s",
    "閉じる": "Close",
    "読み込みに失敗しました。再読み込みしてお試しください。": "Failed to load. Reload and try again.",
    // 同期
    "同期から削除": "Remove from sync",
    "(無題)": "(Untitled)",
    // P2P転送
    "転送には同期対象アカウントでのログインが必要です": "Log in with a sync-enabled account to transfer",
    "同じGoogleアカウントでログインしている端末どうしで、MP3を直接転送します。音声データはサーバーを経由せず、保存もされません。転送中は両方の端末でこの画面を開いたままにしてください。": "Transfers MP3 files directly between devices signed in to the same Google account. Audio does not pass through or get stored on a server. Keep this screen open on both devices during the transfer.",
    "コードを表示して、受信側の接続を待ちます。先に送信側で開始してください。": "Shows a code and waits for the receiver to connect. Start on the sending device first.",
    "受け取れる曲(未インポート)はありません。": "No tracks (not imported) to receive.",
    "曲を選択してください": "Select tracks",
    "6文字のコードを入力してください": "Enter the 6-character code",
    "コードを確認中": "Checking code",
    "接続中": "Connecting",
    "転送中": "Transferring",
    "待機中": "Waiting",
    "受信側の応答待ち": "Waiting for the receiver",
    "完了": "Done",
    "転送できませんでした": "Transfer failed",
    "このコードの待機が見つかりません。期限切れ、入力ミス、または別のGoogleアカウントの可能性があります": "No waiting session found for this code. It may have expired, been mistyped, or belong to another Google account.",
    "接続できませんでした。回線の組み合わせによっては直接接続できない場合があります": "Could not connect. A direct connection may not be possible on some networks.",
    "接続できませんでした。回線の組み合わせにより直接接続できません": "Could not connect. A direct connection is not possible on these networks.",
    "接続できませんでした。相手が接続していないか、回線の組み合わせにより直接接続できません": "Could not connect. The other device is not connected, or a direct connection is not possible on these networks.",
    "送信側が応答しません。送信側の画面を開いたままにしてください": "The sender is not responding. Keep the sender's screen open.",
    "接続が切れました。もう一度やり直してください(受信済みの曲は取り込まれています)": "Connection lost. Try again (tracks already received were imported).",
    "接続が切れました": "Connection lost",
    "待機が時間切れになりました(5分)。もう一度やり直してください": "Waiting timed out (5 min). Try again.",
    "受信側の端末で Receive を開き、曲を選択してからこのコードを入力してください。有効期限は5分です。": "On the receiving device, open Receive, select tracks, then enter this code. It expires in 5 minutes."
  };

  // ---------- 数字などを含む文の断片(順に適用。適用後に日本語が残る場合は元の日本語を表示) ----------
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var RULES = [
    [/無料版はマーカーの先頭(\d+)個までしか使用できません。/g, "The Free plan allows only the first $1 markers."],
    [/無料版はライブラリに(\d+)曲までしか保存できません。/g, "The Free plan can save up to $1 tracks in the library."],
    [/無料版はライブラリの(\d+)曲目までしか再生できません。/g, "The Free plan can play only the first $1 tracks in the library."],
    [/無料版のAB間ループは(\d+)回で自動停止します。/g, "On the Free plan, A-B loop stops automatically after $1 repeats."],
    [/この端末にMP3がありません。「(.*)」を追加すると設定が適用されます/g, "No MP3 on this device. Add \"$1\" to apply its settings."],
    [/「(.*)」の同期情報を削除します。\n他の端末のMP3は削除されません。/g, "Delete the sync data for \"$1\".\nMP3 files on other devices are not deleted."],
    [/送信側のコードを入力して、曲を受け取ります。/g, "Enter the sender's code to receive tracks. "],
    [/送信側の端末に表示されている6文字のコードを入力してください。選択した /g, "Enter the 6-character code shown on the sending device. Of the "],
    [/曲のうち、送信側の端末にあるMP3だけが受信されます。/g, " tracks selected, only MP3 files present on the sender are received."],
    [/☁ 同期中…/g, "Syncing…"],
    [/☁ 同期できませんでした\(タップで再試行\)/g, "Sync failed (tap to retry)"],
    [/☁ 同期済み /g, "Synced "],
    [/未インポート/g, "Not imported"],
    [/(\d+)秒戻る/g, "Back $1s"],
    [/(\d+)秒進む/g, "Forward $1s"],
    [/(\d+)年(\d+)月(\d+)日/g, function (m, y, mo, d) { return MONTHS[+mo - 1] + " " + (+d) + ", " + y; }],
    [/(\d+)日 (\d+):(\d+)/g, "$1d $2:$3"],
    [/(\d+)時間(\d+)分/g, "$1h $2m"],
    [/受信しました。/g, "received."],
    [/送信しました。/g, "sent."],
    [/選択中/g, " selected"],
    [/(\d+)曲完了/g, "$1 tracks done"],
    [/(\d+)曲を/g, "$1 tracks "],
    [/送信できなかった曲: /g, "Not sent: "],
    [/取り込めなかった曲: /g, "Not imported: "],
    [/(\d+)動画/g, "$1 videos"],
    [/(\d+)録音/g, "$1 recordings"],
    [/(\d+)曲/g, "$1 tracks"],
    [/(\d+)件/g, "$1 items"],
    [/新規追加: /g, "Added: "],
    [/音声なしのためスキップ: /g, "Skipped (no audio): "],
    [/上書き: /g, "Overwritten: "],
    [/スキップ: /g, "Skipped: "],
    [/　/g, " "],
    [/、/g, ", "],
    [/（/g, " ("],
    [/）/g, ")"]
  ];

  var cache = Object.create(null);

  function tr(ja) {
    if (!ja || !JP_STRICT.test(ja)) return ja;
    var lead = ja.match(/^\s*/)[0], trail = ja.match(/\s*$/)[0];
    var core = ja.trim();
    if (cache[core] !== undefined) return lead + cache[core] + trail;
    var out = DICT[core];
    if (out === undefined) {
      var s = core;
      for (var i = 0; i < RULES.length; i++) s = s.replace(RULES[i][0], RULES[i][1]);
      out = JP_STRICT.test(s) ? core : s.replace(/ {2,}/g, " ").replace(/^ +| +$/g, "");
    }
    cache[core] = out;
    return lead + out + trail;
  }

  // ---------- 言語状態 ----------
  var pref = "auto";
  try { pref = localStorage.getItem(KEY) || "auto"; } catch (e) {}
  if (pref !== "ja" && pref !== "en") pref = "auto";

  function detect() {
    var l = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
    return /^ja/i.test(l) ? "ja" : "en";
  }
  function getLang() { return pref === "auto" ? detect() : pref; }
  function getPref() { return pref; }

  // ---------- DOM差し替え ----------
  var observer = null;
  var busy = false;

  function trText(node) {
    var v = node.nodeValue;
    if (!v || !JP_STRICT.test(v)) return;
    var t = tr(v);
    if (t !== v) {
      if (node.__qnJa === undefined) node.__qnJa = v;
      node.nodeValue = t;
    }
  }
  function trAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute(a);
      if (!v || !JP_STRICT.test(v)) continue;
      var t = tr(v);
      if (t !== v) {
        if (!el.__qnJaAttrs) el.__qnJaAttrs = {};
        if (el.__qnJaAttrs[a] === undefined) el.__qnJaAttrs[a] = v;
        el.setAttribute(a, t);
      }
    }
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { trText(root); return; }
    if (root.nodeType !== 1) return;
    var tag = root.tagName;
    if (tag === "SCRIPT" || tag === "STYLE") return;
    trAttrs(root);
    var w = document.createTreeWalker(root, 1 | 4, null);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) {
        var p = n.parentNode && n.parentNode.tagName;
        if (p !== "SCRIPT" && p !== "STYLE") trText(n);
      } else trAttrs(n);
    }
  }
  function restore(root) {
    var w = document.createTreeWalker(root, 1 | 4, null);
    var n = root;
    do {
      if (n.nodeType === 3) {
        if (n.__qnJa !== undefined) { n.nodeValue = n.__qnJa; n.__qnJa = undefined; }
      } else if (n.__qnJaAttrs) {
        for (var a in n.__qnJaAttrs) if (n.__qnJaAttrs[a] !== undefined) n.setAttribute(a, n.__qnJaAttrs[a]);
        n.__qnJaAttrs = null;
      }
    } while ((n = w.nextNode()));
  }

  function startObserver() {
    if (observer || !document.body) return;
    observer = new MutationObserver(function (list) {
      if (busy) return;
      busy = true;
      try {
        for (var i = 0; i < list.length; i++) {
          var m = list[i];
          if (m.type === "characterData") {
            // コード側が日本語で書き直したら、保持している元文も更新して訳し直す
            if (m.target.__qnJa !== undefined && JP_STRICT.test(m.target.nodeValue)) m.target.__qnJa = undefined;
            trText(m.target);
          } else if (m.type === "attributes") {
            var el = m.target, a = m.attributeName;
            if (el.__qnJaAttrs && el.__qnJaAttrs[a] !== undefined && JP_STRICT.test(el.getAttribute(a) || "")) el.__qnJaAttrs[a] = undefined;
            trAttrs(el);
          } else {
            for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
          }
        }
      } finally { busy = false; }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  function stopObserver() { if (observer) { observer.disconnect(); observer = null; } }

  function applyAll() {
    var lang = getLang();
    document.documentElement.lang = lang;
    if (!document.body) return;
    busy = true;
    try {
      if (lang === "en") { walk(document.body); startObserver(); }
      else { stopObserver(); restore(document.body); }
    } finally { busy = false; }
  }

  function setPref(v) {
    pref = (v === "ja" || v === "en") ? v : "auto";
    try { localStorage.setItem(KEY, pref); } catch (e) {}
    applyAll();
    try { window.dispatchEvent(new CustomEvent("qn-lang-change", { detail: { lang: getLang(), pref: pref } })); } catch (e) {}
  }

  // 公開API。t(ja)はJS側で動的に文字列を作る時の保険(英語表示ならtr、日本語ならそのまま)
  window.QNI18N = {
    t: function (ja) { return getLang() === "en" ? tr(ja) : ja; },
    getLang: getLang,
    getPref: getPref,
    setPref: setPref,
    apply: applyAll,
    OPTIONS: ["auto", "ja", "en"]
  };

  // alert/confirm の本文
  ["alert", "confirm"].forEach(function (k) {
    var orig = window[k];
    window[k] = function (msg) { return orig.call(window, typeof msg === "string" ? window.QNI18N.t(msg) : msg); };
  });

  document.documentElement.lang = getLang();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyAll);
  else applyAll();
  window.addEventListener("load", applyAll);
})();
