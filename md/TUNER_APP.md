# QNPLAYER TUNERアプリ 仕様

マイクチューナー＋Tone Generator。QNPITCH（旧アプリ）のTUNERMODEを移植し、PLAYERのデザイン・部品に揃えたもの。保存キーは新規（旧`qnpitch_*`は引き継がない）。

- 実装：`JS/qn-app-tuner.js`（本体）／`JS/qn-pitch-core.js`（ピッチ検出。PITCHアプリと共通）／`CSS/style-tuner.css`（見た目）
- 共通ルールは`AI_ASSISTANT_PROJECT_CONTEXT.md`§6。Color/Keyboardは本体の部品を借りる（アプリ側で別実装しない）。

## 現在の仕様
- **入口**：サイドバー先頭のバッジ(＞)→TUNER。サイドバーは上段「Tone / Sensitivity / Display」、下段「Keyboard / Color」。Backup/Importは無し（保存するのは軽い設定だけ）。
- **メイン画面**：マイクOFF中は案内文、ON中はメーター。表示は **Gauge** と **Guitar Meter**（Displayパネル or 下段バーの表示ボタン or `D`で切替）。ズレは3段階の色分け（±5¢=ジャスト緑／±20¢=もう少し琥珀／それ以外=`--danger`）。しきい値は`tuningState()`とCSSの`data-state`で一致させる。
- **Tone**：Preset（Guitar/Bass/Ukulele/Wind）、Guitar/BassはRegular/Half Down/Whole Down/Drop D/Drop C#/Drop C。弦行を押すと発信音（triangle）、もう一度で停止。Now Playingカードに音名・周波数とSTOP。
- **Sensitivity**：感度（無音とみなすまでの保持フレーム）とスムージング（周波数の追従）。下段バーの±10%ステッパーと連動。
- **下段バー**（`#pcV2BottomBar`と同デザイン・同寸法）：Mic｜Stop Tone｜表示切替｜Sens ± / Smooth ±。SP幅は横スクロール、パネルを開くとステージごと隠れてパネルが全面。
- **ショートカット**（表示中のみ）：Space/M=Mic、D=表示切替、1〜9=Toneの弦を鳴らす、Esc=発信音停止。
- **PC幅**：サイドアイコン再押下でパネル格納（`qn_tuner_panel_collapsed`）。

- **マイク使用中の表示**：`QNApps.setMic(on)`でアプリバッジに赤丸(`body.qn-mic-on`)、`.qn-mic-pill`(赤ピル+レベル5段。`QNApps.setMicLevel(pill,0〜5)`)をステージに置く。静止表示のみ。マイクを使うアプリは`onHide`で必ずOFFに戻す。

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
