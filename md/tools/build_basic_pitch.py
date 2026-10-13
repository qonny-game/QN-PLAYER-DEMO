# build_basic_pitch.py — JS/basic-pitch/ (qn-basic-pitch.js とモデル)を作り直す。使い方(ルートで): python3 -I md/tools/build_basic_pitch.py
# npmレジストリに出られる環境で、一時フォルダに @spotify/basic-pitch と esbuild を入れ、軽量化したTensorFlow.js(core/converter/cpu/webgl)と一緒に1ファイルへまとめる。
# 版を上げる時は BP_VERSION を直し、JS/basic-pitch/NOTICE-basic-pitch.txt の版も合わせる。バンドルはグローバル QNBasicPitchLib を作る(player-tab-worker.jsが使う)。
import os
import shutil
import subprocess
import sys
import tempfile

BP_VERSION = "1.0.1"
ROOT = os.getcwd()
OUT = os.path.join(ROOT, "JS", "basic-pitch")

ENTRY = '''import { BasicPitch } from "@spotify/basic-pitch/esm/inference.js";
import { outputToNotesPoly, addPitchBendsToNoteEvents, noteFramesToTime } from "@spotify/basic-pitch/esm/toMidi.js";
import * as tf from "@tensorflow/tfjs";
export { BasicPitch, outputToNotesPoly, addPitchBendsToNoteEvents, noteFramesToTime, tf };
'''
# tfjs-coreのchained ops(Tensor.slice等)を登録しないと実行時に t.slice is not a function になる
TF_LITE = '''import "@tensorflow/tfjs-core/dist/public/chained_ops/register_all_chained_ops";
import "@tensorflow/tfjs-core/dist/register_all_gradients";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
export * from "@tensorflow/tfjs-core";
export { loadGraphModel } from "@tensorflow/tfjs-converter";
'''
MIDI_STUB = "export class Midi {}\n"


def run(cmd, cwd):
    print("+", " ".join(cmd))
    subprocess.run(cmd, cwd=cwd, check=True)


def main():
    if not os.path.isdir(os.path.join(ROOT, "JS")):
        sys.exit("プロジェクトのルートで実行してください")
    tmp = tempfile.mkdtemp(prefix="qn_bp_")
    try:
        for name, body in (("entry.js", ENTRY), ("tf-lite.js", TF_LITE), ("midi-stub.js", MIDI_STUB)):
            with open(os.path.join(tmp, name), "w", encoding="utf-8") as f:
                f.write(body)
        run(["npm", "init", "-y"], tmp)
        run(["npm", "i", "@spotify/basic-pitch@" + BP_VERSION, "esbuild"], tmp)
        os.makedirs(OUT, exist_ok=True)
        run(["npx", "esbuild", "entry.js", "--bundle", "--minify", "--format=iife", "--global-name=QNBasicPitchLib",
             "--platform=browser", "--target=es2019", "--alias:@tensorflow/tfjs=./tf-lite.js",
             "--alias:@tonejs/midi=./midi-stub.js", "--legal-comments=none",
             "--outfile=" + os.path.join(OUT, "qn-basic-pitch.js")], tmp)
        src_model = os.path.join(tmp, "node_modules", "@spotify", "basic-pitch", "model")
        dst_model = os.path.join(OUT, "model")
        os.makedirs(dst_model, exist_ok=True)
        for fn in ("model.json", "group1-shard1of1.bin"):
            shutil.copy(os.path.join(src_model, fn), os.path.join(dst_model, fn))
        shutil.copy(os.path.join(tmp, "node_modules", "@spotify", "basic-pitch", "LICENSE"), os.path.join(OUT, "LICENSE-basic-pitch.txt"))
        print("done:", OUT)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
