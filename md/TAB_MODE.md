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
2. WebGLが使える環境は**メインスレッド**で実行(`runMain`。GPU計算は非同期なので画面は固まりにくい)。WebGLが無い(CPU計算)時だけ`Float32Array`をWorkerへ転送して実行。**WorkerのWebGLは進捗0のまま止まる**(実機とソフトウェアGLで確認)。AudioBuffer/AudioContextはWorkerに無いので、デコードは常にメインスレッド。 GPUの進捗が30秒(`STALL_MS`)動かない/GPUで失敗した時は、自動でCPU(Workerに`cpu:true`)に切り替える(`toCpu`。古い実行は世代番号`j.run`で無視し、進捗コールバックの例外で中断)。
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
- ヘッドレスChromiumはCPU(7.6秒の音で約10秒)。ソフトウェアGL(swiftshader: `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`)でWebGL経路を確認(メインスレッドで完走、Workerだと止まる)。実GPUでの速度は**未確認**。
- 未実装: Backup/Import・同期への組み込み、区間（A-B）だけの表示、Keyに連動した移調表示、小節線のGrid連携、チューニング/カポの画面、TAB譜のテキスト書き出し、WASMバックエンド。

## ソース切替(v4.57.0): Mix / Bass / Guitar / Vocals
- パネル上部の「Source」で切り替える（`st.src`、設定は`qn_tab_src`）。Mix=曲全体（従来どおり）、Bass/Guitar/Vocals=Stemパネルで分けたパートを採譜する。
- パートの取り出し口は`QNStem.getPart(id, key)`（表示中の分離結果→`key|6`→`key`の順に探し、WAVのBlobかnull）。Guitarは6パート版のみ。未分離なら「先にStemで分けて」というメッセージで止まる。**StemはPC専用なので、スマホでは同じ端末で分けた結果が無く、Mix以外は使えない**。
- 保存キーは`曲|パート`（Mixは従来のまま）。レコードに`src`/`kind`("tab"|"staff")/`tuning`/`maxFret`/`shift`が入る(v2)。古い記録(v1)は`kind`が無く「tab」扱い。
- Bass: 4弦(E1 A1 D2 G2=28/33/38/43)、24フレットまで。倍音とみなす強さの上限を0.9に上げる(低音は倍音が強く出る)。同じ音の再検出をつなぐ幅は広げない(8分連打までつながるため)。
- Vocals(五線紙): `cleanup`(音域は`lo`/`hi`=E2〜E6)→`monophonic`(重なりは後の音が前を切る。弱く内側に収まる音は捨てる)→五線紙描画。ト音記号、黒鍵は#表記、加線あり。中央値がG3未満の声は表示を1オクターブ上げ「8」を付ける(`shift`)。編集(Edit)は無し。
- **五線紙はリズムを丸めない**: 音は時間の位置どおりに置き、長さは細線で示す(PCV2のTABと同じ流し方)。小節線は`QNChords.grid()`があれば小節頭に引く（コードの解析をした曲だけ）。拍に合わせた符頭・符尾・休符・拍子の整形は未実装(次の段階)。
- 未実装: Piano(五線紙)、Drums(打楽器譜)。Synth/Brassは分離モデルに無いので対象外。
- 確認: `md/tools/e2e_tab_sources.py`（合成した分離結果で通しを見る）、`md/tools/tab_core_check.js`（bass/staff/monophonicの計算）。

## 大きな譜面表示(v4.58.0, PC幅のみ)
- Tabパネルを開いている間、右の波形エリア(`#pcV2WaveArea`)に、**この曲で解析済みのパートを1段ずつ**並べる。波形(`#vbarContainer`)と設定帯(View/Bar length/Rows/Follow)は隠れる(クリック音・吸着のボタンは残る)。並びは上から Vocals / Guitar / Bass / Mix。パネルを閉じる・他のパネルへ移ると波形に戻る。SP幅はパネル内の小さな表示のまま。
- 仕組み: `st.recs`(この曲の全ソースの結果。`loadAll`が読む)→`syncScore()`が`pcv2-score-mode`クラスと`#pcV2ScoreView`(レーンのDOM)を整える。描画は`paintLane(L,…)`が`cx/cw/ch/R`を差し替えて既存の描画(`paintBody`)を使い回す。タップ=シーク、ドラッグ=横スクロールはレーンごとに`attachPointer`。Editは選択中のソースのレーンでだけ効く(`L.rec === st.rec`)。
- `switchPanel`(player-ui-pc-v2.js)が先頭でクラスを外し、Tabの`mount`が必要なら付け直す。波形のループは隠れても動き続ける(止めていない)。

