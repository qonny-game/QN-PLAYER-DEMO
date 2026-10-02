# QNPLAYER 同期（Firebase）

現状：**YouTubeのLibraryだけ・自分のUIDだけ**。QNPLAYER本体のデータ同期は未実装（`qnplayer-sync-plan.md`のステップ4）。

## 構成
- ログインは既存の`JS/player-auth.js`（Firebase Auth Googleログイン）。Firestoreも同じ`db`。
- `player-auth.js`が`window.QN_AUTH.isSyncUser()`（`SYNC_UIDS`に含まれるか）と`window.QN_AUTH.syncTransact(docId, mergeFn)`を公開。**同期できるUIDを増やす時は`SYNC_UIDS`とFirestoreルールの両方を直す。**
- 同期の中身は`JS/qn-app-youtube.js`の「同期」節（`trackLocalChanges` / `mergeStates` / `syncNow`ほか）。

## Firestore
保存先：`users/{uid}/sync/youtube`（1ドキュメント。課金の`users/{uid}`とは別）。
```
{ v:1,
  items:   { <videoId>: { url, customTitle?, markers:[{id,time,label,color?,enabled?}], loopA, loopB, skip?, createdAt, updatedAt } },
  deleted: { <videoId>: 削除時刻ms },      // tombstone（削除を他端末に伝える。180日で掃除）
  order:   [ <videoId>... ], orderAt: ms,  // 並び順
  updatedAt: serverTimestamp }
```
- **入れないもの**：YouTube由来のタイトル・サムネ、音声・映像、再生位置。
- 1ドキュメント上限1MiB。`syncTransact`が約900,000文字で書き込みを止める（エラー表示になる）。上限に近づいたら動画ごとのドキュメントに分割する。

## セキュリティルール（Firebaseコンソール → Firestore Database → ルール）
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // 同期用。今は自分のUIDだけ。一般公開時は最後の1行を消す
      match /sync/{docId} {
        allow read, write: if request.auth != null
                           && request.auth.uid == userId
                           && request.auth.uid == "ns3F3fcutTeI05tMHwF2zu5vtR63";
      }
    }
  }
}
```
※`users/{userId}`のルールは書類1枚にしか効かず、サブコレクションには及ばない（だから`/sync`を別に書く）。

## 合体ルール（`mergeStates`）
1. 動画ごとに`updatedAt`が新しい方を採用。**同時刻はリモート優先**（両端末が同じ結果に収束し、書き込みの往復が起きない）。
2. 削除は`deleted[videoId]`の時刻が動画の`updatedAt`以上なら削除。削除後に再追加（`updatedAt`が新しい）なら復活。
3. 並びは`orderAt`が新しい方。同時刻はリモート優先。どちらの並びにも無い動画は`createdAt`順で末尾。
4. 通信は`runTransaction`で「読む→合体→書く」を1回で行う（別端末と同時でも上書き事故なし）。ローカルが通信中に変わった時は反映せずもう一度同期。入力中・ドラッグ中は画面反映を3秒後に延期。

## いつ同期するか
ログイン時／保存の1.5秒後／ウィンドウに戻った時・オンライン復帰・YouTubeアプリを開いた時（前回から20秒以上空いていれば）。Libraryの「☁ 同期済み HH:MM ↻」が状態表示で、**タップすると今すぐ同期（手動同期）**。失敗時は赤字・タップで再試行。リアルタイム購読（onSnapshot）は入れていない。

## ローカルデータ
- `qn_yt_items`の各動画に`updatedAt`。変更検知は`saveItems()`内の署名比較（個別の保存箇所は直さなくてよい）。
- `qn_yt_sync_meta`：`{tomb, orderAt, lastSync}`。

## 注意
- 端末の時計がずれると「新しい方」の判定がずれる（個人利用では許容）。
- 未ログイン・同期対象外のUIDは従来どおりローカル完結（同期処理は何も動かない）。
- 一般公開時：`SYNC_UIDS`とルールの開放、プライバシーポリシーの更新、データ量上限の見直し。

---

# Library同期（本体の曲ごとの情報 / v3.28.0〜）
実装: `JS/player-sync.js`。通信は`player-auth.js`の`QN_AUTH.syncTx`(複数ドキュメントのトランザクション)/`syncGetMany`。同期対象UIDはYouTube同期と同じ（`isSyncUser()`）。

## 同期するもの / しないもの
- する: 曲ごとの 曲名・アーティスト・ON/OFF・お気に入り・フォルダ・マーカー・A-Bループ・テキストメモ／フォルダ定義(id・名前)／曲とフォルダの並び順。
- しない: **MP3本体**、アプリ設定(音量/テーマ/EQ等)、フォルダの開閉、YouTube由来のタイトル。
- 曲の同一判定は**ファイル名+サイズ**(hash)。別名/サイズ違いは別の曲。

## Firestore（`users/{uid}/sync/`）
- `lib_index`: `{t:{hash:更新時刻}, d:{hash:削除時刻}}`（どの曲が変わったかを1回の読み取りで知る）
- `lib_folders`: `{f:{id:{n,u}}, d:{id:u}, ord:[id], ou}`／`lib_order`: `{ord:[hash], ou}`
- `t_<hash>`: 1曲=1ドキュメント `{n,s,ti,ar,en,fv,fo,pn:[{t,e,m,c}],ab:{a,b},tx,u}`（Firestoreは配列の入れ子不可なのでpn/abはオブジェクト）
- ルールは既存の`match /sync/{docId}`でそのまま通る（ルール変更なし）。

## 合体ルール
1. 曲ごとに`u`(更新時刻)が新しい方。同時刻はリモート。削除はtombstone(`d`)で、`u`が新しければ復活。
2. **初めて見る曲**（他端末に既にある曲のMP3をこの端末へ入れた時）はリモート優先で設定を取り込む。ただしリモートが空でローカルにあるマーカー/メモ/AB/曲名は消さず残す。
3. 他端末にMP3が無い曲は**「未インポート」**(ghost)としてLibrary下部に表示（`playlist[]`には入れない=index前提を壊さない）。MP3を入れると自動で設定が付く。EDIT中は「✕」で同期から削除。
4. 曲を削除すると同期上も削除（tombstone）。**他端末のMP3は消えない**（同期から外れるだけ。そこで編集すると復活）。削除の検知は`deletePlaylistTrack`を包んだ明示操作だけ（IndexedDB読み込み失敗で全曲消える事故を防ぐ）。
5. 並び: 両端末にある曲どうしの相対順が変わった時だけ`ou`を更新。ローカルが新しければローカルの相対順(未インポートの席は動かさない)、そうでなければリモート順+未登録を末尾。追加・取り込みだけでは順序の主導権を取らない。
6. 通信中にローカルが変わった／入力中・ドラッグ中は画面へ反映せず後でやり直す（書き込みは済んでいて安全）。反映中の自分の書き込みでは再同期しない(`applying`)。

## いつ同期するか
起動時のIndexedDB復元後・変更の3秒後・ウィンドウに戻った時(20秒以上空き)・オンライン復帰。Library下部の「☁ 同期済み HH:MM ↻」タップで手動同期。変更検知は`localStorage.setItem`を横から見る(`qn_playlist_meta_v1`/`qn_folders_v1`/`mp3_pins_*`/`mp3_ab_*`/`mp3_text_*`)。

## ローカルデータ
`qn_libsync_meta_v1`: `known`(曲ごとの署名・更新時刻)/`ghosts`/`pendDel`/`fKnown`/`ordList`/`ordU`/`fOrdList`/`fOrdU`/`lastSync`。

## 容量・無料枠
1曲は数百B〜（マーカー・メモ次第）。インデックス+並びで2000曲≈100KB(1ドキュメント上限1MiBの手前)。変更なしの同期=読み取り3回。初回の他端末は曲数ぶんの読み取り。

---

# MP3のP2P転送（v3.29.0〜）
実装: `JS/player-p2p.js`（WebRTC DataChannel）。サイドバー下段の「Transfer」(Backup/Importの隣。同期対象アカウントのログイン中だけ表示)から(画面は既存のExportモーダル部品を流用、文言は簡潔な丁寧語)。

## 流れ（送る側が先）
1. **送る側**: Transfer → Send。6文字コード(紛らわしいI/O/0/1除く)を発行して待機。
2. **受け取る側**: Transfer → Receive。未インポートから曲を選び(Next)、コードを入力(Connect)。
3. 接続の合図(offer/answer=経路情報)だけFirestore `users/{uid}/sync/p2p_<CODE>` 経由。受け取り側がoffer、送り側がanswer。**接続できたらすぐ削除**、放置でも5分で期限切れ(読み取り側が期限を見る)。
4. 以降はDataChannelで端末どうしが直接通信。受け取り側が欲しい曲(hash)を送り、送り側が手元のFileを16KBずつ送る(送信バッファが溜まったら待つ)。受け取り側は完了ごとに`addFilesToPlaylist`で取り込み→最後に同期して他端末の設定(フォルダ/マーカー等)が自動で付く。

## 安全性・制約
- MP3はサーバーを通らず保存もされない。合図は同じGoogleアカウント(`SYNC_UIDS`)でログインしている端末にしか届かない(ルール変更なし)。
- 両方の端末でアプリを開いたままにする必要がある(転送中は画面スリープ防止`QNWake`。iPhoneはアプリを閉じると止まる)。
- STUN(Google公開)のみ。携帯回線どうし等、直接つなげない組み合わせでは失敗しうる(その時は「接続できませんでした」)。確実にするにはTURNサーバーが必要(将来)。テスト用に`window.QN_P2P_ICE`で上書き可。
- 一般公開時: 合図ドキュメントのルール(今は所有者UIDのみ)・転送の利用規約/プライバシー表記・TURNの費用を見直す。
- ログアウトしても端末内のMP3・設定は消えない(IndexedDB/localStorage)。受け取った曲は手動追加と同じ扱い。同じ端末で別アカウントに切り替えると、その端末内の曲は別アカウントからも見える点に注意(端末に入った時点でファイルは複製されている)。


### YouTubeのフォルダ（v3.31.0）
`yt_library`ドキュメントに`folders:[{id,n}]`・`foldersAt`を追加。フォルダ一覧は新しい方を丸ごと採用(同時刻はリモート)。動画の所属は各動画の`folder`(動画のLWWに乗る)。存在しないフォルダidを指す動画は未分類表示。開閉は同期しない。
