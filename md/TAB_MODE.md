# Tab（ギターTAB譜）— v4.54.0

再生中のローカル曲を**ブラウザ内で採譜（Basic Pitch）**し、ギターのTABとして再生位置に合わせて流すパネル。サーバーへは何も送らない（モデルもアプリに同梱）。YouTube（`file`が無い曲）は非対応。SP幅でも使える。

## ファイル
| ファイル | 役割 |
|---|---|
| `JS/player-tab.js` | `QNTab`。パネルUI・解析の起動・保存・TAB描画・修正。`mount(host)`を`switchPanel`の`panelType:"guitartab"`が呼ぶ。`settingsRows()`をSettings>一般の「Tab」が使う |
| `JS/qn-tab-core.js` | 計算だけ（DOMなし・Nodeでも動く）。`cleanup`（倍音・音域外・余韻の再検出の除去）/ `assign`（弦フレット割り当て=ビタビ）/ `fingering` / `mergeEdited`。確認は`node md/tools/tab_core_check.js .` |
| `JS/player-tab-worker.js` | 解析のclassic Worker。`importScripts`でバンドルを読み、Basic Pitchを実行して生のノートを返す |
| `JS/basic-pitch/` | `qn-basic-pitch.js`（Basic Pitch 1.0.1＋軽量TF.js 3.21.0のバンドル、グローバル`QNBasicPitchLib`）、`model/`（約0.9MB）、ライセンス（Apache-2.0）。作り直しは`python3 -I md/tools/build_basic_pitch.py`（npmに出られる環境が要る） |
| `CSS/style-tab.css` | 見た目。ボタン・進捗は`style-stem.css`、行は`style-settings.css`を流用 |

## 流れ
1. Analyze → `file.arrayBuffer()` → `new OfflineAudioContext(1,1,22050).decodeAudioData()`でモノラル22050Hzにする（**Basic Pitch 1.0.1は22050Hz以外だと例外**。READMEの「自動リサンプル」は嘘）。上限900秒。
2. `Float32Array`をWorkerへ転送（AudioBuffer/AudioContextはWorkerに無いので、デコードはメインスレッド）。Workerが起動できない時だけメインスレッドで同じ処理（重い）。
3. `cleanup` → ID付与 → `fingering` → IndexedDB `qn_tab_db`（ストア`tabs`、キー`名前|サイズ`）。最大60曲、古い順に削除。
4. 再解析は`mergeEdited`で、修正済み（`edited`/`hidden`）のノートを引き継ぐ。

## データ
- ノート `{id,t,d,midi,vel,string,fret,edited,hidden}`。`t,d`は**原曲の秒**（Speedを変えても`audio.currentTime`にそのまま合う）。`string`は1=最も高い弦。
- 記録 `{key,name,v:1,dur,params,tuning,capo,notes,dropped,backend,ts}`。チューニングは標準固定、カポ0固定（フィールドは持つが画面は無い）。
- localStorage: `qn_tab_sens`(low|normal|high) / `qn_tab_minlen`(30|60|90|120 ms) / `qn_tab_overtone`(1|0) / `qn_tab_zoom` / `qn_tab_follow`。
- バックアップ・同期の対象外（Stem/Recと同じ）。

## 描画・操作
- canvas。再生位置は幅の30%に固定、`audio.currentTime`に追従。ドラッグで横スクロール（追従は一時停止。再生中は6秒、停止中は再生/シークまで）。タップ=シーク（音の上ならその音へ）。Editがオンの時のタップは音の選択。
- 色は`--ov`等のトークン。背景切替(`qn-bg-change`)で読み直す。描画ループはパネルが表示されている間だけ。
- 修正UIは規約どおり`QNSettingsUI`の行（Positionのstepper、Hide this noteのswitch）。独自のボタン列は作らない。

## 精度と限界（実装時の確認）
- 合成のプラック音（単音12個）で12/12検出。倍音の誤検出は`cleanup`で減らすが、実曲（歪み・和音・バンド）での精度は**未確認**。実曲で`W`（`qn-tab-core.js`のコスト重み）と感度の既定値を調整すること。
- ヘッドレスChromiumにはWebGLが無くCPUで動く（7.6秒の音で約10秒）。実機ではWebGLの速度になるはずだが**未確認**（Worker内のWebGLが使えない環境ではCPUになり遅い。画面に「No GPU available」と出る）。
- 未実装: Backup/Import・同期への組み込み、区間（A-B）だけの表示、Keyに連動した移調表示、小節線のGrid連携、チューニング/カポの画面、TAB譜のテキスト書き出し、WASMバックエンド。
