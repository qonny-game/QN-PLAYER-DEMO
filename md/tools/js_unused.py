# 使い方: python3 -I js_unused.py <ルート>  — 宣言のみで他に参照が無いJS関数を列挙
import re,sys,glob,os
root=sys.argv[1] if len(sys.argv)>1 else "."
files=[f for f in sorted(glob.glob(root+'/JS/**/*.js',recursive=True)) if not f.endswith('jszip.min.js')]
allcode={f:open(f,encoding='utf-8').read() for f in files}
allcode[root+'/index.html']=open(root+'/index.html',encoding='utf-8').read()
for g in glob.glob(root+'/guide/*.js')+glob.glob(root+'/*.html'): allcode[g]=open(g,encoding='utf-8').read()
blob='\n'.join(allcode.values())
out=[]
for f in files:
    t=allcode[f]
    names=set()
    for m in re.finditer(r'^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(',t,re.M): names.add(m.group(1))
    for m in re.finditer(r'^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)',t,re.M): names.add(m.group(1))
    for n in sorted(names):
        c=len(re.findall(r'(?<![\w$.])'+re.escape(n)+r'(?![\w$])',blob))
        c2=len(re.findall(r'(?<![\w$])'+re.escape(n)+r'(?![\w$])',blob))
        if c2<=1: out.append((os.path.basename(f),n,c2))
for f,n,c in out: print(f,n,c)
print(len(out))
