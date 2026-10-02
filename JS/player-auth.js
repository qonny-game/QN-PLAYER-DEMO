// player-auth.js — Firebase Auth(Googleログイン)。ES module: <script type="module">で読み込む(importを使うため)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  reauthenticateWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  deleteField,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ---------- firebaseConfig ----------
const firebaseConfig = {
  apiKey: "AIzaSyDk7vNEqLxM2DDLacZID8U0ohZfrOnRaWI",
  authDomain: "qnaudio-8b46e.firebaseapp.com",
  projectId: "qnaudio-8b46e",
  storageBucket: "qnaudio-8b46e.appspot.com",
  messagingSenderId: "107377155809",
  appId: "1:107377155809:web:7a0326f08dce73e92d21a0"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
// 毎回アカウント選択画面を出す(自動再ログイン防止)
googleProvider.setCustomParameters({ prompt: "select_account" });
const db = getFirestore(firebaseApp);

// users/{uid}: unlockUntil(-1=永久,epoch ms=時限,0=無料), updatedAt, purchasedAtMs(Stripe確定時刻。ローカルより優先), planType(monthly|yearly|lifetime|null), cancelAtPeriodEnd
// 戻り値: null=doc無し / {corrupted:true}=unlockUntilがNaN等(無料版へ自動初期化するな。過去に解約直後FREE化事故) / 正常データ
async function fetchUnlockUntilFromFirestore(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;

    const data = snap.data();
    // typeof NaN==='number'なのでNumber.isFinite必須
    if (!Number.isFinite(data.unlockUntil)) {
      console.error("[QN_AUTH] Firestoreのunlock Untilが不正な値です（NaN等）。値:", data.unlockUntil);
      return { corrupted: true };
    }

    const updatedAtMs = data.updatedAt && typeof data.updatedAt.toMillis === "function" ? data.updatedAt.toMillis() : 0;
    const purchasedAtMs = data.purchasedAt && typeof data.purchasedAt.toMillis === "function" ? data.purchasedAt.toMillis() : 0;
    const planType = typeof data.planType === "string" ? data.planType : null;
    const cancelAtPeriodEnd = data.cancelAtPeriodEnd === true;
    return { unlockUntil: data.unlockUntil, updatedAtMs, purchasedAtMs, planType, cancelAtPeriodEnd };
  } catch (err) {
    console.error("[QN_AUTH] Firestore read failed:", err);
    return null;
  }
}

// planType省略=変更なし / null=フィールド削除
async function saveUnlockUntilToFirestore(uid, unlockUntil, planType) {
  try {
    const payload = {
      unlockUntil,
      updatedAt: serverTimestamp()
    };
    if (planType === null) {
      payload.planType = deleteField();
    } else if (typeof planType === "string") {
      payload.planType = planType;
    }
    await setDoc(doc(db, "users", uid), payload, { merge: true });
  } catch (err) {
    console.error("[QN_AUTH] Firestore write failed:", err);
  }
}

// ---------- 同期(users/{uid}/sync/{docId}) ----------
// 今は自分のUIDだけ。Firestoreルール側でも同じUIDだけに絞っている(md/SYNC.md)。一般公開時はここ+ルールを開放
const SYNC_UIDS = ["ns3F3fcutTeI05tMHwF2zu5vtR63"];
const SYNC_DOC_MAX_CHARS = 900000; // Firestore 1ドキュメント上限(1MiB)の手前で止める
function isSyncUser() {
  return !!auth.currentUser && SYNC_UIDS.indexOf(auth.currentUser.uid) !== -1;
}
// 読む→mergeFn(既存データorNull)→書く、を1トランザクションで行う(別端末と同時に書いても上書き事故が起きない)
// mergeFn は純粋関数にすること(競合時に再実行される)。戻り値 {write: オブジェクト|省略, result: 任意}。resultを返す
async function syncTransact(docId, mergeFn) {
  const user = auth.currentUser;
  if (!user || SYNC_UIDS.indexOf(user.uid) === -1) throw new Error("sync not allowed");
  const ref = doc(db, "users", user.uid, "sync", docId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const out = mergeFn(snap.exists() ? snap.data() : null);
    if (out && out.write) {
      if (JSON.stringify(out.write).length > SYNC_DOC_MAX_CHARS) throw new Error("sync doc too large");
      tx.set(ref, Object.assign({}, out.write, { updatedAt: serverTimestamp() }));
    }
    return out ? out.result : null;
  });
}

// 複数ドキュメントのトランザクション(本体Libraryの同期用)。fn(api)内でapi.get(id)で全て読んでからapi.set/del(競合時にfnが再実行されるので、fn内で外部状態を変えない)。戻り値はfnの戻り値
function syncRef(id) {
  const user = auth.currentUser;
  if (!user || SYNC_UIDS.indexOf(user.uid) === -1) throw new Error("sync not allowed");
  return doc(db, "users", user.uid, "sync", id);
}
async function syncTx(fn) {
  return runTransaction(db, async (tx) => {
    const api = {
      get: async (id) => { const snap = await tx.get(syncRef(id)); return snap.exists() ? snap.data() : null; },
      set: (id, data) => {
        if (JSON.stringify(data).length > SYNC_DOC_MAX_CHARS) throw new Error("sync doc too large: " + id);
        tx.set(syncRef(id), Object.assign({}, data, { updatedAt: serverTimestamp() }));
      },
      del: (id) => { tx.delete(syncRef(id)); }
    };
    return fn(api);
  });
}
// トランザクション外でまとめて読む(変わった曲のドキュメント取得用)。並列数を絞る
async function syncGetMany(ids, onProgress) {
  const out = new Array(ids.length).fill(null);
  let next = 0, done = 0;
  async function worker() {
    while (next < ids.length) {
      const i = next++;
      const snap = await getDoc(syncRef(ids[i]));
      out[i] = snap.exists() ? snap.data() : null;
      done++;
      if (onProgress) { try { onProgress(done, ids.length); } catch (e) {} }
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  return out;
}

window.QN_AUTH = {
  auth,
  currentUser: null,
  fetchUnlockUntilFromFirestore,
  saveUnlockUntilToFirestore,
  isSyncUser,
  syncTransact,
  syncTx,
  syncGetMany
}; // ---------- DOM要素 ----------
const btnLoginGoogle = document.getElementById("btnLoginGoogle");
const btnLogout = document.getElementById("btnLogout");
const userInfoEl = document.getElementById("userInfo");
const userPhotoEl = document.getElementById("userPhoto");
const userNameEl = document.getElementById("userName");

// ---------- ログイン処理 ----------
async function handleLogin() {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    console.error("[QN_AUTH] Sign-in failed:", err);
  }
}

// ---------- ログアウト処理 ----------
async function handleLogout() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("[QN_AUTH] Sign-out failed:", err);
  }
}

if (btnLoginGoogle) btnLoginGoogle.addEventListener("click", handleLogin);
if (btnLogout) btnLogout.addEventListener("click", handleLogout);

window.QN_AUTH.login = handleLogin;

// ---------- YouTube読み取り権限(自分の再生リスト取得用)。ログイン中アカウントで追加権限(youtube.readonly)を確認するポップアップを出し、アクセストークンをメモリにだけ保持(保存しない・約1時間有効)。ユーザー操作(クリック)から直接呼ぶこと(ポップアップがブロックされるため) ----------
const ytProvider = new GoogleAuthProvider();
ytProvider.addScope("https://www.googleapis.com/auth/youtube.readonly");
let ytToken = null, ytTokenAt = 0;
window.QN_AUTH.getYtToken = function (force) {
  const u = auth.currentUser;
  if (!u) return Promise.reject(new Error("not-logged-in"));
  if (!force && ytToken && Date.now() - ytTokenAt < 50 * 60 * 1000) return Promise.resolve(ytToken);
  ytProvider.setCustomParameters({ login_hint: u.email || "" });
  return reauthenticateWithPopup(u, ytProvider).then((res) => {
    const cred = GoogleAuthProvider.credentialFromResult(res);
    if (!cred || !cred.accessToken) throw new Error("no-token");
    ytToken = cred.accessToken; ytTokenAt = Date.now();
    return ytToken;
  });
};
window.QN_AUTH.clearYtToken = function () { ytToken = null; ytTokenAt = 0; };

// ---------- ログイン状態監視・UI自動切り替え ----------
onAuthStateChanged(auth, async (user) => {
  window.QN_AUTH.currentUser = user;
  if (!user && window.QN_AUTH.clearYtToken) window.QN_AUTH.clearYtToken();

  if (user) {
    if (userPhotoEl) userPhotoEl.src = user.photoURL || "";
    if (userNameEl) userNameEl.textContent = user.displayName || user.email || "";
    if (btnLoginGoogle) btnLoginGoogle.style.display = "none";
    if (userInfoEl) userInfoEl.style.display = "flex";

    if (typeof window.swSyncUnlockWithFirestore === "function") {
      await window.swSyncUnlockWithFirestore(user.uid);
    }

    window.dispatchEvent(new CustomEvent("qn-auth-changed", {
      detail: { user: { uid: user.uid, email: user.email, displayName: user.displayName } }
    }));
  } else {
    if (btnLoginGoogle) btnLoginGoogle.style.display = "flex";
    if (userInfoEl) userInfoEl.style.display = "none";

    window.dispatchEvent(new CustomEvent("qn-auth-changed", { detail: { user: null } }));
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const avatarBtn = document.getElementById("userAvatarBtn");
  const dropdown = document.getElementById("userDropdown");

  if (avatarBtn && dropdown) {
    avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
    });

    dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.addEventListener("click", () => {
      dropdown.classList.remove("active");
    });
  }
});