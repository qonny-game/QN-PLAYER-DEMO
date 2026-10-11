# QNPLAYER TUNERアプリ 仕様

マイクチューナー＋Tone Generator。QNPITCH（旧アプリ）のTUNERMODEを移植し、PLAYERのデザイン・部品に揃えたもの。保存キーは新規（旧`qnpitch_*`は引き継がない）。

- 実装：`JS/qn-app-tuner.js`（本体）／`JS/qn-pitch-core.js`（ピッチ検出。PITCHアプリと共通）／`CSS/style-tuner.css`（見た目）
- 共通ルールは`AI_ASSISTANT_PROJECT_CONTEXT.md`§6。Color/Keyboardは本体の部品を借りる（アプリ側で別実装しない）。

## 現在の仕様
- **入口**：ヘッダーのロゴ(V付き)→TUNER。サイドバーは上段「Tone / Sensitivity / Display」、下段「Keyboard / Color」。Backup/Importは無し（保存するのは軽い設定だけ）。
- **メイン画面**：マイクOFF中は案内文、ON中はメーター。表示は **Gauge** と **Guitar Meter**（Displayパネル or 下段バーの表示ボタン or `D`で切替）。ズレは3段階の色分け（±5¢=ジャスト緑／±20¢=もう少し琥珀／それ以外=`--danger`）。しきい値は`tuningState()`とCSSの`data-state`で一致させる。
- **Tone**：Preset（Guitar/Bass/Ukulele/Wind）、Guitar/BassはRegular/Half Down/Whole Down/Drop D/Drop C#/Drop C。弦行を押すと発信音（triangle）、もう一度で停止。Now Playingカードに音名・周波数とSTOP。
- **Sensitivity**：感度（バー。拾う最小音量。`getMinRms`で解析コアへ渡す。0%:RMS0.01〜100%:0.0004を対数で補間。小さい音の雑音は`minClarity`(周期性0.6未満を捨てる)で弾く。v4.25.1で閾値を約1/10〜1/25に下げ、減衰するギター音を長く追従）とスムージング（周波数の追従）。音が消えたあとの表示保持は**Hold**(0.3〜5.0秒・既定1.5秒・`qn_tuner_hold`)で調整。バーの既定位置に縦線と「推奨」を出し、ダブルクリック/タップで既定へ戻る(`QNSettingsUI`の`range`の`mark`/`markLabel`)。v4.24.2までは感度に連動して感度100%で約0.1秒しか残らなかった。 表示はSettingsと同じ「項目名＋説明＋‹ 値 ›」(`QNSettingsUI.build`の`type:"stepper"`、10%刻み。保存済みの中途半端な値は表示だけ最寄りの10%に丸める)。下段バーの±10%ステッパーと連動(`syncSliders`が両方を更新)。
- **下段バー**（`#pcV2BottomBar`と同デザイン・同寸法）：Mic｜Stop Tone｜表示切替｜Sens ± / Smooth ±。SP幅は横スクロール、パネルを開くとステージごと隠れてパネルが全面。
- **ショートカット**（表示中のみ）：Space/M=Mic、D=表示切替、1〜9=Toneの弦を鳴らす、Esc=発信音停止。
- **PC幅**：サイドアイコン再押下でパネル格納（`qn_tuner_panel_collapsed`）。

- **マイク使用中の表示**：`QNApps.setMic(on)`でロゴ(アプリ切替)に赤丸(`body.qn-mic-on`)、`.qn-mic-pill`(赤ピル+レベル5段。`QNApps.setMicLevel(pill,0〜5)`)をステージに置く。静止表示のみ。マイクを使うアプリは`onHide`で必ずOFFに戻す。

## 規約（守る）
- マイク・Tone・AudioContextは**表示中だけ**。`onHide`で必ず全停止して`AudioContext`をclose（PLAYER側との同時鳴りも防ぐ）。マイク用ContextはToneとは別。
- 解析は約30fps（`qn-pitch-core.js`の`FRAME_MS`）＋`document.hidden`中は計算しない。DOM更新は値が変わった時だけ（`setText/setState`）。`requestAnimationFrame`ループを足す時は`GOTCHAS.md`§3。
- `startFromMic()`はクリック等の操作内で呼ぶ（iOSのAudioContext制約）。HTTPSでないと`getUserMedia`が無い（案内文を表示）。
- 画面スリープ防止：マイクON中だけ`QNWake.set("tuner",true)`。

## データ（localStorage）
| キー | 内容 |
|---|---|
| `qn_tuner_display` | `gauge` / `guitar-meter` |
| `qn_tuner_sens` / `qn_tuner_smooth` | 0〜100（既定100） |
| `qn_tuner_panel_collapsed` | PC幅のパネル格納 |

Preset/Tuningは保存しない（起動時はGuitar/Regular）。

## v4.26.0 の変更
- **MICの自動ON**：TUNERを開く(`onShow`)と`startMic(true)`を試す。設定「Auto start」(`qn_tuner_autostart`、既定ON)で切替。ブラウザが音声開始を許さず`AudioContext`がrunningにならない場合(ページ読込直後など)は、エラーを出さずOFFのまま。
- **大きなMICボタン**：メーター直下`[data-tn="bigMic"]`(MIC ON/OFF)。下段バーのMicと同じ`toggleMic`。
- **メーター拡大**：ゲージ最大700px、音名88px(SPは64px)。
- **設定UI**：Sensitivity/Smoothingも連続バー(5%刻み、下段バーの±10と連動)。**Hold**は0.10〜1.00秒・推奨0.30秒(範囲外の保存値は既定に戻す)。
- **v4.26.1**：Gaugeの目盛りを±50¢のまま4倍(10¢刻み→2.5¢刻み、41本。20¢=major/10¢=mid/他=minor)。ゲージ幅は`min(100%, 960px, (100vh−440px)×1.8)`で画面の高さに合わせて最大化(MICボタンまで1画面に収める)。音名は`clamp(56px,10vh,80px)`。Guitar Meter(丸の段表示)は変更なし。
- **v4.26.2**：Guitar Meterを±50¢のまま4倍細かく(5¢刻み21本→1.25¢刻み81本、`GM_STEPS=40`/`GM_STEP_CENTS=1.25`)。5¢ごと`.q`・10¢ごと`.m`は背を高く。幅は最大960pxで均等割り、音名は`clamp(72px,16vh,140px)`。
