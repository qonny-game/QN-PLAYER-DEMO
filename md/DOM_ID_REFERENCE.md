# QN-PLAYER DOM id／命名の早見

全一覧は持たない（古くなるため）。**必要なら`grep`で取り直す。** ここには「grepしても見つからない」「命名が紛らわしい」ものだけを残す。

```bash
grep -o 'id="[a-zA-Z0-9_]*"' index.html | sed 's/id="//;s/"//' | sort                    # 静的id（index.html）
grep -o 'id="[a-zA-Z0-9]*"' JS/player-ui-pc-v2.js | sed 's/id="//;s/"//' | sort -u         # 動的id（pc-v2のbuild()が生成）
```
新しいモーダル/パネルを作る時は、機能のidプレフィックスを1つに統一する（`trackBackup*` / `trackImport*`のように）。

## 静的id（`index.html`）のグループ
| プレフィックス | 機能（制御するJS） |
|---|---|
| `trackBackup*` / `trackImport*` | Backup/Importの画面（`player-track-backup.js`）。外枠は無く、`#trackBackupHome`/`#trackImportHome`(hidden)に`.export-modal-body`+`.export-modal-footer`が1組ずつあり、`qnBackupMount(mode,hostEl)`(本体・YouTube共通)がhostへ移して表示（実体は1つだけ）。Backupの含める項目は`trackBackupIncludeAudio`/`trackBackupIncludeSettings`の2つ。`trackImportCancelBtn`は`data-mode`(`cancel`/`back`)、`trackImportRunBtn`はImport/Close兼用 |
| `playToggle` `prevTrackBtn` `nextTrackBtn` `playbackTripleBtn` `prevMarkerBtn` `nextMarkerBtn` `loopToggleBtn` `loopPreRoll*` `loopInfo` | 下段コントロール元要素（`player-controls.js`等。PC v2が`#pcV2BottomBar`へ移す） |
| `playlistBox` `playlistInfo` `playlistScopeBtn` | ライブラリ一覧／Auto Next範囲ボタン(PC v2ではパネルヘッダーへ移動、他パネルへ切替時はholderへ退避)。フォルダ見出しは`.playlistFolderHeader`(`data-folder-id`)、曲の行は`.playlistItem`(`data-index`=playlist[]のindex、`data-folder`)。移動UIは`#pcV2NewFolderBtn` `#pcV2MoveSelectedBtn` `#playlistFolderPicker` |
| `eq*` | EQ（`player-control-eq.js`） |
| `control*` | Speed/AutoSpeed/Key（`player-controls.js`）。`controlSpeedEnableToggle`/`controlKeyEnableToggle`はスイッチでなく「アイコンボタン(role=switch, aria-checked)」 |
| `export*` | 現在曲の範囲書き出し（`player-export.js`） |
| `user*` `sw*` | 無料版/課金（`player-shareware.js`） |
| `qn*` | ハンバーガーメニュー(`#qnMenuMount`配下、`player-theme.js`)。`qnMarkerPresetColorRows`＝Colorパネル内のMarker Memo Colors（`renderMarkerPresetColorSettings()`が中身を生成） |
| `note*` | Textタブ（`player-text.js`） |
| `splash*` | 起動スプラッシュ |
| `vbarContainer` > `vbarScroll` > `vbarRows` | シークバー(`player-bars.js`のQNBars)。行`.vbar[data-row]`は仮想スクロールで動的生成・再利用（固定のbar1〜6は無い）。行の中身は`canvas.vwave`・`.vbar-time`＋装飾(`.vbar-line`/`.vbar-ab-pt`/`.segmentHighlight*`)。歯車は`#qnBarGearBtn`（`#pcV2WaveHead`内）、ポップアップは`.qn-bar-pop` |
| `appHeader` `appLogo` `appTitle`(`appTitleInner`>`appTitleText`) | ヘッダー／曲名。`#appTitle`はPC v2構築時に`#pcV2WaveArea`内へ移動 |

## 動的id（`player-ui-pc-v2.js`の`build()`が生成。`index.html`には無い）
`pcV2Root` `pcV2Layout`（PC=3カラム、SP=縦積み。格納中は`.pcv2-collapsed`）／`pcV2IconBar`（`…ScrollHint` `…Spacer` `…Bottom`）／`pcV2Panel`（`…Header` `…Body` `…Fab`）・`pcV2PanelStash`（非表示中の中身の退避場所）／`pcV2WaveArea` `pcV2WaveHead` `pcV2WaveFabRow` `pcV2WaveAddAudioBtn` `pcV2WaveAddMarkerBtn`／`pcV2TimeRow`（SP幅のみ）／`pcV2BottomBar`（`…GroupPlay` `…GroupMarker` `…GroupRight` `…AnchorTabs`）／`pcV2SkipBackBtn` `pcV2SkipFwdBtn`／`pcV2DeleteSelectedBtn`／`pcV2VolumeBtn` `pcV2VolumePopup`（`document.body`直下・fixed）／`pcV2HeaderNav`。

## アプリ枠・YouTube（`qn-apps.js` / `qn-app-youtube.js`）
- `#qnAppBadge`（サイドバー先頭のアプリ名バッジ。開いている間`.qn-badge-open`）／`#qnAppFlyout`（アプリ一覧。body直下fixed。SPは`.qn-flyout-sp`）／`#qnAppScrim`／`#qnAppHost`（アプリ表示領域。中に`.qn-app-view[data-app-view=<id>]`）／`#qnAppToast`／`#qnColorPop`（アプリ中のColorパネル）／`body.qn-app-open`／`[data-qn-keep-visible]`（覆ってはいけない要素の印）。
- YouTube：idは`#qnYtPlayer`（Player差し込み先）だけで、**他は`data-yt="..."`で参照**（`bkHost`/`imHost`=Backup/Importを借りて載せる場所、`chap*`=チャプター貼り付け、`fab*`=右下FAB、`preDown/preUp/preVal`・`speedDown/speedUp/speedVal`・`setABtn/setBBtn`=下段バー）。`.qn-yt[data-edit="library|markers"]`がEDIT状態、`.qn-yt-collapsed`がパネル格納、`.qn-yt-seekpop[data-pop=…]`がバーのポップアップ。Library/Markersの行コンテナは`.qn-yt-libbox`/`.qn-yt-pinbox`（中身は本体の`.playlistItem`/`.pinItem`）。
- PITCH：idは使わず**`data-pt="..."`で参照**（`recBtn`/`playBtn`/`saveBtn`/`clearBtn`=下段バー、`note`/`cents`/`hint`=読み出し、`scroll`/`content`/`keys`/`canvas`/`volCanvas`=ロール、`pb*`=再生情報行、`recBox`/`recEmpty`/`fabEdit`/`fabDel`=Recordings、`saveName`/`saveOk`/`saveCancel`=Save、`filtersBox`=Filters、`bkHost`/`imHost`=共通Backup/Importの差し込み先、`kbdBox`=Keyboard）。Filtersの入力は`data-f="<設定キー>"`(range)／`data-ft`(トグル)／`data-fv`(値表示)。`.qn-pt[data-panel="filters|recordings|save|backup|import|keyboard|none"]`が開いているパネル、`data-edit`=Recordings編集中、`.qn-pt-collapsed`=パネル格納。
- TUNER：idは使わず**`data-tn="..."`で参照**（`micBtn`/`toneStopBtn`/`displayBtn`/`sensDown`/`sensUp`/`smoothDown`/`smoothUp`=下段バー、`presetTabs`/`tuningTabs`/`stringList`/`toneNow*`=Tone、`sensRange`/`smoothRange`=Sensitivity、`displayChoices`=Display、`kbdBox`=Keyboard、`prompt`/`display`/`micError`=ステージ）。`.qn-tn[data-panel="tone|sens|display|keyboard|none"]`が開いているパネル、`.qn-tn-collapsed`がパネル格納、メーター内部は`data-d`（`.qn-tn-meter`/`.qn-tn-gm`の`data-state`=just/close/far）。
