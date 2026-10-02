// player-shareware.js — 無料版の機能制限とプレミアムアンロックモーダル。解除状態はlocalStorage(+Firestore同期)。広告解除はダミー動作(実SDK未実装)。依存: player-ui-shared.js(haptic*)。QN_SHAREWAREグローバル関数を他が参照するので、他のUIロジック(markers/playlist/controls)より前に読み込む

const SW_UNLOCK_STORAGE_KEY = "qnplayer_unlock_until";
const SW_UNLOCK_UPDATED_AT_KEY = "qnplayer_unlock_updated_at";
const SW_PLAN_TYPE_STORAGE_KEY = "qnplayer_plan_type";
const SW_CANCEL_AT_PERIOD_END_KEY = "qnplayer_cancel_at_period_end";

const SW_LIMITS = {
  LIBRARY_MAX_TRACKS: 3,
  MARKER_MAX_ACTIVE: 3,
  AB_LOOP_MAX_COUNT: 5
};

// ---------- 解除状態の読み書き ----------
function swGetUnlockUntil() {
  try {
    const raw = localStorage.getItem(SW_UNLOCK_STORAGE_KEY);
    if (raw === null) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch (e) {
    return 0;
  }
}

// 契約プラン(monthly|yearly|lifetime|null)。nullは広告時限解除か無料版(isUnlocked()と併用)
function swGetPlanType() {
  try {
    const raw = localStorage.getItem(SW_PLAN_TYPE_STORAGE_KEY);
    if (raw === "monthly" || raw === "yearly" || raw === "lifetime") return raw;
    return null;
  } catch (e) {
    return null;
  }
}

function swSetPlanType(planType) {
  try {
    if (planType === "monthly" || planType === "yearly" || planType === "lifetime") {
      localStorage.setItem(SW_PLAN_TYPE_STORAGE_KEY, planType);
    } else {
      localStorage.removeItem(SW_PLAN_TYPE_STORAGE_KEY);
    }
  } catch (e) {}
}

function swGetCancelAtPeriodEnd() {
  try {
    return localStorage.getItem(SW_CANCEL_AT_PERIOD_END_KEY) === "1";
  } catch (e) {
    return false;
  }
}

function swSetCancelAtPeriodEnd(value) {
  try {
    if (value) {
      localStorage.setItem(SW_CANCEL_AT_PERIOD_END_KEY, "1");
    } else {
      localStorage.removeItem(SW_CANCEL_AT_PERIOD_END_KEY);
    }
  } catch (e) {}
}

// updatedAtMs省略=今この端末で操作。Firestoreマージ結果の書き戻し時だけremoteのupdatedAtMsを渡す。ローカル操作(広告解除・無料版リセット)専用で、決済確定はCloud Functionsが直接書く→planTypeは常にnullへ戻す
function swSetUnlockUntil(value, updatedAtMs) {
  const ts = typeof updatedAtMs === "number" ? updatedAtMs : Date.now();
  try {
    localStorage.setItem(SW_UNLOCK_STORAGE_KEY, String(value));
    localStorage.setItem(SW_UNLOCK_UPDATED_AT_KEY, String(ts));
  } catch (e) {}
  swSetPlanType(null);

  if (window.QN_AUTH && window.QN_AUTH.currentUser && typeof window.QN_AUTH.saveUnlockUntilToFirestore === "function") {
    window.QN_AUTH.saveUnlockUntilToFirestore(window.QN_AUTH.currentUser.uid, value, null);
  }
}

function isUnlocked() {
  const until = swGetUnlockUntil();
  if (until === -1) return true;
  if (until > 0 && Date.now() < until) return true;
  return false;
}

function swGetUnlockRemainingLabel() {
  const until = swGetUnlockUntil();
  if (until === -1) return "Premium";
  if (until <= 0) return null;
  const remainMs = until - Date.now();
  if (remainMs <= 0) return null;
  const remainHours = remainMs / (1000 * 60 * 60);
  if (remainHours >= 1) return `${Math.ceil(remainHours)}h left`;
  return `${Math.ceil(remainMs / (1000 * 60))}m left`;
}

function swGetCurrentPlanLabel() {
  const until = swGetUnlockUntil();
  const planType = typeof swGetPlanType === "function" ? swGetPlanType() : null;

  if (until === -1 && planType === "lifetime") {
    return "Lifetime";
  }
  if (until > 0 && Date.now() < until && (planType === "monthly" || planType === "yearly")) {
    const remainMs = until - Date.now();
    const remainDays = Math.ceil(remainMs / (1000 * 60 * 60 * 24));
    const planLabel = planType === "yearly" ? "Yearly" : "Monthly";
    return `${planLabel} (${remainDays} days left)`;
  }
  if (until > 0 && Date.now() < until && planType === "AD") {
    const remainingLabel = swGetUnlockRemainingLabel();
    return remainingLabel ? `Ad Unlock (${remainingLabel})` : null;
  }
  return "FREE PLAN";
}

// ---------- ダミー広告解除・サブスク解除(実広告SDK/決済は未実装) ----------
function swUnlockForHours(hours) {
  const until = Date.now() + hours * 60 * 60 * 1000;
  const current = swGetUnlockUntil();
  // 永久(-1)は広告視聴で絶対に上書きしない
  if (current === -1) return;
  // 残りが長ければ短縮しない(延長のみ)
  if (current > until) return;
  swSetUnlockUntil(until);
}

// 【方針】Firestoreにdocがあれば常にFirestoreを正としてローカルへ反映(updatedAt新旧比較はしない)。手動編集(updatedAt無し)がローカルの古い値で上書きされる不具合があったため撤去。
// remoteのunlockUntilがPremium相当かの判定ヘルパー
function swIsRemoteUnlocked(remote) {
  if (!remote) return false;
  const until = remote.unlockUntil;
  if (until === -1) return true;
  if (until > 0 && Date.now() < until) return true;
  return false;
}

const SW_POLL_INTERVAL_MS = 2000;
const SW_POLL_MAX_ATTEMPTS = 5;

async function swPollForPurchaseReflection(uid) {
  const noticeEl = swEnsurePurchasePendingNotice();
  if (noticeEl) noticeEl.style.display = "flex";

  for (let attempt = 1; attempt <= SW_POLL_MAX_ATTEMPTS; attempt++) {
    await new Promise(resolve => setTimeout(resolve, SW_POLL_INTERVAL_MS));

    const remote = await window.QN_AUTH.fetchUnlockUntilFromFirestore(uid);
    if (swIsRemoteUnlocked(remote)) {
      try {
        localStorage.setItem(SW_UNLOCK_STORAGE_KEY, String(remote.unlockUntil));
        localStorage.setItem(SW_UNLOCK_UPDATED_AT_KEY, String(remote.updatedAtMs));
      } catch (e) {}
      swSetPlanType(remote.planType);
      swClearCheckoutPending();
      if (noticeEl) noticeEl.style.display = "none";
      swRefreshAllLockedUI();
      return;
    }
  }

  // 規定回数ポーリングしても未反映: 案内を出す。フラグは消さない(TTL内は次回読込でも再試行)。決済失敗/キャンセルも同分岐に入り得るので「反映待ち」と断定しない文言にする
  if (noticeEl) {
    noticeEl.textContent = "反映に時間がかかっているか、決済が完了していない可能性があります。ページを再読み込みするか、アカウント状態をご確認ください。";
    noticeEl.classList.add("sw-purchase-pending-notice-delay");
  }
}

function swEnsurePurchasePendingNotice() {
  let el = document.getElementById("swPurchasePendingNotice");
  if (el) return el;
  el = document.createElement("div");
  el.id = "swPurchasePendingNotice";
  el.className = "sw-purchase-pending-notice";
  el.textContent = "決済の反映を確認しています…";
  el.style.display = "none";
  document.body.appendChild(el);
  return el;
}

async function swSyncUnlockWithFirestore(uid) {
  if (!window.QN_AUTH || typeof window.QN_AUTH.fetchUnlockUntilFromFirestore !== "function") return;

  const remote = await window.QN_AUTH.fetchUnlockUntilFromFirestore(uid);

  // unlockUntilが不正(NaN等)=壊れたdoc: ローカルを維持。無料版へ初期化も上書きもしない(「存在しない」と区別。過去に解約直後FREE化事故)
  if (remote && remote.corrupted) {
    console.error("[SW] unlockUntilが不正な値のため、同期をスキップしました。ローカルの状態を維持します。");
    swRefreshAllLockedUI();
    return;
  }

  if (!remote) {
    // Firestore未登録でも決済直後フラグがあればポーリング(doc作成遅れの保険)
    if (swIsCheckoutPending()) {
      swPollForPurchaseReflection(uid);
      return;
    }
    // 【重要】!remote時にローカルをFirestoreへ書き戻さない(手動削除したdocが古いlocalStorageのプランで復活する不具合)。常に無料版として明示初期化
    if (window.QN_AUTH.saveUnlockUntilToFirestore) {
      window.QN_AUTH.saveUnlockUntilToFirestore(uid, 0, null);
    }
    try {
      localStorage.setItem(SW_UNLOCK_STORAGE_KEY, "0");
      localStorage.setItem(SW_UNLOCK_UPDATED_AT_KEY, String(Date.now()));
    } catch (e) {}
    swSetPlanType(null);
    swSetCancelAtPeriodEnd(false);
    swRefreshAllLockedUI();
    return;
  }

  if (swIsCheckoutPending() && !swIsRemoteUnlocked(remote)) {
    swPollForPurchaseReflection(uid);
    return;
  }

  try {
    localStorage.setItem(SW_UNLOCK_STORAGE_KEY, String(remote.unlockUntil));
    localStorage.setItem(SW_UNLOCK_UPDATED_AT_KEY, String(remote.updatedAtMs));
  } catch (e) {}
  swSetPlanType(remote.planType);
  swSetCancelAtPeriodEnd(remote.cancelAtPeriodEnd === true);
  swClearCheckoutPending();
  swRefreshAllLockedUI();
}
window.swSyncUnlockWithFirestore = swSyncUnlockWithFirestore;

function swUnlockPremium() {
  swSetUnlockUntil(-1);
}

// ---------- プレミアムアンロックモーダル（共通） ----------
let swModalOverlay = null;

// 決済ボタン共通: 未ログインならGoogleログイン→成功後Stripeへ自動遷移(決済前ログイン必須。ユーザー紐付けのため)。
// sw_checkout_pending_at: ボタン押下時刻。次回Firestore同期時、10分TTL内なら決済直後としてswPollForPurchaseReflectionでポーリング(本当のFREEを待たせない。期限切れは無視)
const SW_CHECKOUT_PENDING_KEY = "qnplayer_checkout_pending_at";
const SW_CHECKOUT_PENDING_TTL_MS = 10 * 60 * 1000;

function swMarkCheckoutPending() {
  try { localStorage.setItem(SW_CHECKOUT_PENDING_KEY, String(Date.now())); } catch (e) {}
}

function swClearCheckoutPending() {
  try { localStorage.removeItem(SW_CHECKOUT_PENDING_KEY); } catch (e) {}
}

function swIsCheckoutPending() {
  let raw = null;
  try { raw = localStorage.getItem(SW_CHECKOUT_PENDING_KEY); } catch (e) {}
  if (!raw) return false;
  const ts = parseInt(raw, 10);
  if (!Number.isFinite(ts) || Date.now() - ts > SW_CHECKOUT_PENDING_TTL_MS) {
    swClearCheckoutPending();
    return false;
  }
  return true;
}

// ?checkout=success検知(Stripe Payment Linkのリダイレクト先に設定済み)。ページ読込時1回: swMarkCheckoutPending()と同状態にし、history.replaceStateでパラメータ除去
function swCheckUrlForCheckoutSuccess() {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("checkout") !== "success") return;

    swMarkCheckoutPending();

    url.searchParams.delete("checkout");
    const cleaned = url.pathname + (url.search ? url.search : "") + url.hash;
    window.history.replaceState(null, "", cleaned || window.location.pathname);
  } catch (e) {}
}
swCheckUrlForCheckoutSuccess();

function swGoToCheckout(stripeUrl) {
  hapticTap();

  // uidはwindow.QN_AUTH.currentUser.uid(このファイルに素のauth変数は無い)
  function urlWithUid(uid) {
    return `${stripeUrl}?client_reference_id=${encodeURIComponent(uid)}`;
  }

  if (window.QN_AUTH && window.QN_AUTH.currentUser) {
    swMarkCheckoutPending();
    window.open(urlWithUid(window.QN_AUTH.currentUser.uid), "_blank", "noopener");
    return;
  }

  if (!window.QN_AUTH || typeof window.QN_AUTH.login !== "function") {
    alert("ログイン機能の準備中です。しばらくしてから再度お試しください。");
    return;
  }

  // qn-auth-changedを1回待ってから決済ページへ。ログインキャンセルならイベント不発(再押下で再試行)。時間差でwindow.openがポップアップブロックされ得る→nullなら今のタブで開く
  const onAuthChanged = (e) => {
    if (e.detail && e.detail.user) {
      window.removeEventListener("qn-auth-changed", onAuthChanged);
      swMarkCheckoutPending();
      const url = urlWithUid(e.detail.user.uid);
      const newTab = window.open(url, "_blank", "noopener");
      if (!newTab) {
        window.location.href = url;
      }
    }
  };
  window.addEventListener("qn-auth-changed", onAuthChanged);
  window.QN_AUTH.login();
}


function swBuildModal() {
  if (swModalOverlay) return swModalOverlay;

  const overlay = document.createElement("div");
  overlay.id = "swUnlockModalOverlay";
  overlay.className = "sw-unlock-modal-overlay";

  overlay.innerHTML = `
    <div class="sw-unlock-modal">
      <div class="sw-unlock-modal-header">
        <span id="swUnlockModalTitle">アップグレードしてQNPLAYERの全機能を解放</span>
        <button id="swUnlockModalCloseBtn" class="sw-unlock-modal-close" title="Close">✕</button>
      </div>
      <div class="sw-unlock-modal-body">
        <p id="swUnlockModalDesc" class="sw-unlock-modal-desc"></p>
        <div id="swUnlockCurrentPlanBadge" class="sw-current-plan-badge"></div>
        <div class="sw-pricing-cards">
          <div class="sw-pricing-card" id="swUnlockAd1h">
            <div class="sw-pricing-card-top">
              <div class="sw-pricing-card-title"><span class="sw-pricing-card-title-en">TimePass</span><span class="sw-pricing-card-title-en">1Hour</span><span class="sw-pricing-card-title-jp">広告解除1時間</span></div>
              <div class="sw-pricing-card-desc">動画広告を1本視聴して、1曲集中耳コピや短時間の練習に。</div>
              <div class="sw-pricing-card-price">無料<span class="sw-pricing-card-price-unit">動画広告 1本視聴</span></div>
            </div>
            <div class="sw-pricing-card-cta sw-pricing-cta-secondary">1時間解放</div>
            <ul class="sw-pricing-feature-list">
              <li><span class="sw-pricing-check">✓</span>1時間 全機能が無制限で解放</li>
              <li><span class="sw-pricing-check">✓</span>ライブラリ保存数 無制限</li>
              <li><span class="sw-pricing-check">✓</span>マーカー・ループ自動停止なし</li>
            </ul>
          </div>
          <div class="sw-pricing-card" id="swUnlockAd24h">
            <div class="sw-pricing-card-top">
              <div class="sw-pricing-card-title"><span class="sw-pricing-card-title-en">TimePass</span><span class="sw-pricing-card-title-en">1Day</span><span class="sw-pricing-card-title-jp">広告解除1日</span></div>
              <div class="sw-pricing-card-desc">広告を数本まとめて視聴して、週末の長時間練習やセッションに。</div>
              <div class="sw-pricing-card-price">無料<span class="sw-pricing-card-price-unit">動画広告 2〜3本視聴</span></div>
            </div>
            <div class="sw-pricing-card-cta sw-pricing-cta-secondary">24時間解放</div>
            <ul class="sw-pricing-feature-list">
              <li><span class="sw-pricing-check">✓</span>24時間 全機能が無制限で解放</li>
              <li><span class="sw-pricing-check">✓</span>ライブラリ保存数 無制限</li>
              <li><span class="sw-pricing-check">✓</span>マーカー・ループ自動停止なし</li>
            </ul>
          </div>
          <div class="sw-pricing-card" id="swUnlockSubscribe">
            <div class="sw-pricing-jp-badge">🇯🇵 日本限定価格</div>
            <div class="sw-pricing-card-top">
              <div class="sw-pricing-card-title"><span class="sw-pricing-card-title-en">Premium</span><span class="sw-pricing-card-title-en">(Monthly)</span><span class="sw-pricing-card-title-jp">マンスリー</span></div>
              <div class="sw-pricing-card-desc">広告なしで常に快適。手軽に始めたい方に最適な月額プラン。</div>
              <div class="sw-pricing-card-price">
                ¥150<span class="sw-pricing-card-price-unit">/ 月（自動更新）</span>
              </div>
            </div>
            <div class="sw-pricing-card-cta sw-pricing-cta-secondary">月額プランに登録</div>
            <ul class="sw-pricing-feature-list">
              <li><span class="sw-pricing-check">✓</span><b>広告表示・視聴 一切なし</b></li>
              <li><span class="sw-pricing-check">✓</span>常時 すべての制限が無制限</li>
              <li><span class="sw-pricing-check">✓</span>気軽に解約・再開が可能</li>
            </ul>
          </div>
          <div class="sw-pricing-card sw-pricing-card-highlight" id="swUnlockYearly">
            <div class="sw-pricing-badge">おすすめ</div>
            <div class="sw-pricing-jp-badge">🇯🇵 日本限定価格</div>
            <div class="sw-pricing-card-top">
              <div class="sw-pricing-card-title"><span class="sw-pricing-card-title-en">Premium</span><span class="sw-pricing-card-title-en">(Yearly)</span><span class="sw-pricing-card-title-jp">アニュアル</span></div>
              <div class="sw-pricing-card-desc">1年間たっぷり使えてお得な年間プラン。長く練習する方に。</div>
              <div class="sw-pricing-card-price">
                ¥1,500<span class="sw-pricing-card-price-unit">/ 年（自動更新）</span>
              </div>
            </div>
            <div class="sw-pricing-card-cta">年間プランに登録</div>
            <ul class="sw-pricing-feature-list">
              <li><span class="sw-pricing-check">✓</span><b>広告表示・視聴 一切なし</b></li>
              <li><span class="sw-pricing-check">✓</span>常時 すべての制限が無制限</li>
              <li><span class="sw-pricing-check">✓</span>月額よりさらにお得な価格</li>
            </ul>
          </div>
        </div>
        <a href="/pricing.html" target="_blank" rel="noopener" class="sw-pricing-compare-link">詳しく比較する →</a>
      </div>
    </div>
  `;

  

  document.body.appendChild(overlay);
  swModalOverlay = overlay;

  const closeBtn = overlay.querySelector("#swUnlockModalCloseBtn");
  closeBtn.onclick = () => swCloseUnlockModal();
  overlay.onclick = (e) => {
    if (e.target === overlay) swCloseUnlockModal();
  };

  overlay.querySelector("#swUnlockAd1h").onclick = () => {
    hapticSuccess();
    swUnlockForHours(1);
    swCloseUnlockModal();
    swRefreshAllLockedUI();
  };
  overlay.querySelector("#swUnlockAd24h").onclick = () => {
    hapticSuccess();
    swUnlockForHours(24);
    swCloseUnlockModal();
    swRefreshAllLockedUI();
  };

  overlay.querySelector("#swUnlockSubscribe").onclick = () => {
    swGoToCheckout("https://buy.stripe.com/test_28E00i7aTab69bkbJf14401");
  };

  overlay.querySelector("#swUnlockYearly").onclick = () => {
    swGoToCheckout("https://buy.stripe.com/test_8x26oG3YH2IE73ccNj14402");
  };

  return overlay;
}



function swOpenUnlockModal(message) {
  hapticWarning();
  const overlay = swBuildModal();
  const descEl = overlay.querySelector("#swUnlockModalDesc");
  if (descEl) descEl.textContent = message || "この機能は無料版では利用できません。";

  const planBadgeEl = overlay.querySelector("#swUnlockCurrentPlanBadge");
  if (planBadgeEl) {
    const label = typeof swGetCurrentPlanLabel === "function" ? swGetCurrentPlanLabel() : null;
    if (label) {
      planBadgeEl.textContent = label;
      planBadgeEl.style.display = "";
    } else {
      planBadgeEl.textContent = "";
      planBadgeEl.style.display = "none";
    }
  }

  // 階層表示: 契約中と同等・下位のカードを隠す。年額中=無表示 / 月額中=年額のみ / 広告・無料=全表示。広告カード(1h/24h)は有料契約中は常に隠す。
  // Lifetimeの購入導線(#swUnlockLifetime)は撤去済み(既存サブスクが自動解約されない不具合)。運営が手動でFirestoreにplanType:"lifetime"を入れるケースは維持→isUnlocked()/swGetPlanType/until===-1判定は変更禁止
  const planType = typeof swGetPlanType === "function" ? swGetPlanType() : null;
  const cardVisibility = {
    ad1h: planType === null,
    ad24h: planType === null,
    monthly: planType === null,
    yearly: planType === null || planType === "monthly"
  };

  const cardElements = {
    ad1h: overlay.querySelector("#swUnlockAd1h"),
    ad24h: overlay.querySelector("#swUnlockAd24h"),
    monthly: overlay.querySelector("#swUnlockSubscribe"),
    yearly: overlay.querySelector("#swUnlockYearly")
  };
  let visibleCount = 0;
  Object.keys(cardElements).forEach(key => {
    const el = cardElements[key];
    if (!el) return;
    const visible = cardVisibility[key];
    el.style.display = visible ? "" : "none";
    if (visible) visibleCount++;
  });

  const SW_CARD_TARGET_WIDTH = 260;
  const cardsEl = overlay.querySelector(".sw-pricing-cards");
  if (cardsEl) {
    if (visibleCount === 0) {
      cardsEl.style.display = "none";
    } else {
      cardsEl.style.display = "";
      cardsEl.style.gridTemplateColumns = visibleCount < 5 ? `repeat(${visibleCount}, 1fr)` : "";
      if (visibleCount <= 3) {
        cardsEl.style.maxWidth = `${SW_CARD_TARGET_WIDTH * visibleCount + 12 * (visibleCount - 1)}px`;
        cardsEl.style.marginLeft = "auto";
        cardsEl.style.marginRight = "auto";
      } else {
        cardsEl.style.maxWidth = "";
        cardsEl.style.marginLeft = "";
        cardsEl.style.marginRight = "";
      }
    }
  }
  if (descEl && visibleCount === 0) {
    descEl.textContent = "年間プランをご利用中です。これ以上アップグレードできるプランはありません。";
  }

  overlay.classList.add("active");
}

function swCloseUnlockModal() {
  if (swModalOverlay) swModalOverlay.classList.remove("active");
}

const swUpgradeBtn = document.getElementById("swUpgradeBtn");
if (swUpgradeBtn) {
  swUpgradeBtn.onclick = () => {
    const message = (typeof isUnlocked === "function" && isUnlocked())
      ? "現在のプランや他のプランはこちらから確認できます。"
      : "無料版の機能制限を解除するプランをお選びください。";
    swOpenUnlockModal(message);
  };
}

let swToastEl = null;
let swToastHideTimer = null;

function swBuildToast() {
  if (swToastEl) return swToastEl;

  const el = document.createElement("div");
  el.id = "swUnlockToast";
  el.className = "sw-unlock-toast";
  el.innerHTML = `
    <span id="swUnlockToastText"></span>
    <a href="#" id="swUnlockToastAdLink" class="sw-unlock-toast-link">広告視聴で1時間機能解放</a>
    <a href="#" id="swUnlockToastUpgradeLink" class="sw-unlock-toast-link">アップグレード</a>
  `;
  document.body.appendChild(el);
  swToastEl = el;

  el.querySelector("#swUnlockToastAdLink").onclick = (e) => {
    e.preventDefault();
    hapticSuccess();
    swUnlockForHours(1);
    swRefreshAllLockedUI();
    swHideToast();
  };
  el.querySelector("#swUnlockToastUpgradeLink").onclick = (e) => {
    e.preventDefault();
    hapticTap();
    swHideToast();
    swOpenUnlockModal();
  };

  return el;
}

function swShowUnlockToast(message) {
  hapticWarning();
  const el = swBuildToast();
  el.querySelector("#swUnlockToastText").textContent = message || "この機能は無料版では利用できません。";
  el.classList.add("active");

  clearTimeout(swToastHideTimer);
  swToastHideTimer = setTimeout(swHideToast, 4000);
}

function swHideToast() {
  clearTimeout(swToastHideTimer);
  if (swToastEl) swToastEl.classList.remove("active");
}

const swRefreshCallbacks = [];
function swRegisterRefreshCallback(fn) {
  if (typeof fn === "function") swRefreshCallbacks.push(fn);
}
function swRefreshAllLockedUI() {
  swRefreshCallbacks.forEach(fn => {
    try { fn(); } catch (e) { console.error(e); }
  });
}

let swAbLoopCount = 0;

function swUpdateLoopCounterUI() {
  const el = document.getElementById("swLoopCounter");
  if (!el) return;

  if (typeof isUnlocked === "function" && isUnlocked()) {
    el.classList.remove("active");
    return;
  }
  if (typeof loopEnabled === "undefined" || !loopEnabled) {
    el.classList.remove("active");
    return;
  }

  el.textContent = `${swAbLoopCount} / ${SW_LIMITS.AB_LOOP_MAX_COUNT}`;
  el.classList.add("active");
}

function swUpdateSpeedKeyLockUI() {
  const locked = typeof isUnlocked === "function" && !isUnlocked();
  const speedCard = document.getElementById("controlSpeedCard");
  const keyCard = document.querySelector(".key-control-card");
  if (speedCard) speedCard.classList.toggle("sw-disabled-control", locked);
  if (keyCard) keyCard.classList.toggle("sw-disabled-control", locked);
}
swRegisterRefreshCallback(swUpdateSpeedKeyLockUI);
swUpdateSpeedKeyLockUI();

function swGetHeaderPlanBadgeLabel() {
  const until = swGetUnlockUntil();
  const planType = typeof swGetPlanType === "function" ? swGetPlanType() : null;

  if (until === -1 && planType === "lifetime") return "Lifetime";
  if (until > 0 && Date.now() < until) {
    if (planType === "yearly") return "Yearly";
    if (planType === "monthly") return "Monthly";
    return "Ad";
  }
  return "FREE";
}

function swUpdateHeaderPlanBadge() {
  const el = document.getElementById("userPlanBadge");
  if (!el) return;
  const label = swGetHeaderPlanBadgeLabel();
  el.textContent = label || "";
}
swRegisterRefreshCallback(swUpdateHeaderPlanBadge);
swUpdateHeaderPlanBadge();

// 残り時間表示(1分間隔setInterval): monthly/yearly=「dd日 hh:mm」、Ad=「HH時間MM分」(swFormatRemainingHhMm)、Lifetime/FREEは対象外
function swFormatRemainingDdHhMm(remainMs) {
  const totalMin = Math.max(0, Math.floor(remainMs / (1000 * 60)));
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const minutes = totalMin % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${days}日 ${pad(hours)}:${pad(minutes)}`;
}

function swFormatRemainingHhMm(remainMs) {
  const totalMin = Math.max(0, Math.floor(remainMs / (1000 * 60)));
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  return `${hours}時間${String(minutes).padStart(2, "0")}分`;
}

function swUpdatePlanRemainingUI() {
  const rowEl = document.getElementById("userPlanRemainingRow");
  const valEl = document.getElementById("userPlanRemaining");
  const cancelBtn = document.getElementById("btnCancelSubscription");
  const endDateRowEl = document.getElementById("userPlanEndDateRow");
  const endDateValEl = document.getElementById("userPlanEndDate");
  if (!rowEl || !valEl) return;

  const until = swGetUnlockUntil();
  const planType = typeof swGetPlanType === "function" ? swGetPlanType() : null;
  const isSubscription = (planType === "monthly" || planType === "yearly") && until > 0 && Date.now() < until;
  const isAdUnlock = planType !== "monthly" && planType !== "yearly" && planType !== "lifetime" &&
    until > 0 && Date.now() < until;
  const isCanceled = isSubscription && typeof swGetCancelAtPeriodEnd === "function" && swGetCancelAtPeriodEnd();

  if (isSubscription) {
    valEl.textContent = swFormatRemainingDdHhMm(until - Date.now());
    rowEl.style.display = "";
  } else if (isAdUnlock) {
    valEl.textContent = swFormatRemainingHhMm(until - Date.now());
    rowEl.style.display = "";
  } else {
    valEl.textContent = "";
    rowEl.style.display = "none";
  }

  if (endDateRowEl && endDateValEl) {
    if (isCanceled) {
      endDateValEl.textContent = swFormatDateYMD(until);
      endDateRowEl.style.display = "";
    } else {
      endDateValEl.textContent = "";
      endDateRowEl.style.display = "none";
    }
  }

  if (cancelBtn) {
    cancelBtn.style.display = isSubscription ? "" : "none";
    if (isSubscription) {
      cancelBtn.textContent = isCanceled ? "サブスクを続ける" : "解約する";
      cancelBtn.classList.toggle("sw-resume-subscription-btn", isCanceled);
    }
  }
}
swRegisterRefreshCallback(swUpdatePlanRemainingUI);
swUpdatePlanRemainingUI();
setInterval(swUpdatePlanRemainingUI, 60 * 1000);

// 年月日フォーマッタ(絶対日付用。カウントダウンのswFormatRemainingDdHhMmとは別)
function swFormatDateYMD(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function swOpenCancelModal() {
  const until = swGetUnlockUntil();
  const planType = typeof swGetPlanType === "function" ? swGetPlanType() : null;
  const isSubscription = (planType === "monthly" || planType === "yearly") && until > 0 && Date.now() < until;

  if (!isSubscription) {
    alert("現在、解約可能なサブスクリプションはありません。");
    return;
  }

  const isCanceled = typeof swGetCancelAtPeriodEnd === "function" && swGetCancelAtPeriodEnd();
  if (isCanceled) {
    swGoToCustomerPortal();
    return;
  }

  const overlay = document.getElementById("cancelModalOverlay");
  if (!overlay) return;

  const planLabel = planType === "yearly" ? "Yearly" : "Monthly";
  const dateLabel = swFormatDateYMD(until);

  const planEl = document.getElementById("cancelModalPlan");
  const remainingEl = document.getElementById("cancelModalRemaining");
  const nextRenewalEl = document.getElementById("cancelModalNextRenewal");
  const untilDateEl = document.getElementById("cancelModalUntilDate");
  if (planEl) planEl.textContent = planLabel;
  if (remainingEl) remainingEl.textContent = swFormatRemainingDdHhMm(until - Date.now());
  if (nextRenewalEl) nextRenewalEl.textContent = dateLabel;
  if (untilDateEl) untilDateEl.textContent = dateLabel;

  overlay.classList.add("open");
}

function swCloseCancelModal() {
  const overlay = document.getElementById("cancelModalOverlay");
  if (overlay) overlay.classList.remove("open");
}

// 解約ボタン: Cloud Functions createPortalSession(https://us-central1-qnaudio-8b46e.cloudfunctions.net/createPortalSession)にUIDを渡してStripe Customer Portal URLを都度発行→遷移(固定リンク不可)。呼び出し元は#cancelModalConfirmBtn。#btnCancelSubscriptionはswOpenCancelModal()のトリガーのみ
const SW_CREATE_PORTAL_SESSION_URL = "https://us-central1-qnaudio-8b46e.cloudfunctions.net/createPortalSession";

async function swGoToCustomerPortal() {
  hapticTap();

  if (!window.QN_AUTH || !window.QN_AUTH.currentUser) {
    alert("ログインしてから解約手続きを行ってください。");
    return;
  }

  const btn = document.getElementById("cancelModalConfirmBtn");
  const originalLabel = btn ? btn.textContent : null;
  if (btn) {
    btn.disabled = true;
    btn.textContent = "処理中…";
  }

  try {
    const res = await fetch(SW_CREATE_PORTAL_SESSION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: window.QN_AUTH.currentUser.uid })
    });

    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }

    const data = await res.json();
    if (!data || !data.url) {
      throw new Error("レスポンスにurlが含まれていません");
    }

    window.open(data.url, "_blank", "noopener");
    swCloseCancelModal();
  } catch (err) {
    console.error("Customer Portalセッションの作成に失敗しました:", err);
    alert("解約手続きページを開けませんでした。しばらくしてから再度お試しください。");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  }
}

const swCancelSubscriptionBtn = document.getElementById("btnCancelSubscription");
if (swCancelSubscriptionBtn) {
  swCancelSubscriptionBtn.onclick = swOpenCancelModal;
}

const cancelModalConfirmBtn = document.getElementById("cancelModalConfirmBtn");
if (cancelModalConfirmBtn) {
  cancelModalConfirmBtn.onclick = swGoToCustomerPortal;
}

const cancelModalCancelBtn = document.getElementById("cancelModalCancelBtn");
if (cancelModalCancelBtn) {
  cancelModalCancelBtn.onclick = () => { hapticTap(); swCloseCancelModal(); };
}

const cancelModalCloseBtn = document.getElementById("cancelModalCloseBtn");
if (cancelModalCloseBtn) {
  cancelModalCloseBtn.onclick = () => { hapticTap(); swCloseCancelModal(); };
}

const cancelModalOverlay = document.getElementById("cancelModalOverlay");
if (cancelModalOverlay) {
  cancelModalOverlay.onclick = (e) => {
    if (e.target === cancelModalOverlay) swCloseCancelModal();
  };
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const overlay = document.getElementById("cancelModalOverlay");
    if (overlay && overlay.classList.contains("open")) swCloseCancelModal();
  }
});
