# 使い方: python3 -I css_audit.py <ルート>  — CSSのクラス/idでHTML・JSに参照が無いものを列挙（*付きは動的組み立ての可能性。消す前に目視）
import re,sys,os,glob,collections
root=sys.argv[1] if len(sys.argv)>1 else "."
css_files=sorted(glob.glob(root+'/CSS/*.css'))
code=''
for f in glob.glob(root+'/JS/**/*.js',recursive=True)+[root+'/index.html']:
    if f.endswith('jszip.min.js'): continue
    code+=open(f,encoding='utf-8').read()+'\n'
def strip_comments(t): return re.sub(r'/\*.*?\*/','',t,flags=re.S)
def selectors(t):
    t=strip_comments(t)
    # crude: split rule preludes
    out=[]
    for m in re.finditer(r'([^{}]+)\{',t):
        pre=m.group(1).strip()
        if pre.startswith('@'): continue
        out.append(pre)
    return out
res=collections.defaultdict(list)
total=collections.Counter()
for f in css_files:
    t=open(f,encoding='utf-8').read()
    names=set()
    for pre in selectors(t):
        for c in re.findall(r'\.(-?[_a-zA-Z][\w-]*)',pre): names.add(('.',c))
        for c in re.findall(r'#(-?[_a-zA-Z][\w-]*)',pre): names.add(('#',c))
    for k,n in sorted(names):
        total[f]+=1
        # dynamic-safe check: appears literally anywhere in code?
        if re.search(r'(?<![\w-])'+re.escape(n)+r'(?![\w-])',code): continue
        # prefix hit (dynamic building)
        pref=[p for p in re.findall(r'["\'`]([\w-]+-)["\'`]?',code) if n.startswith(p)]
        res[os.path.basename(f)].append((k+n, 'dyn?' if pref else ''))
for f,l in res.items():
    print('##',f,len(l),'/',total[root+'/CSS/'+f])
    print('  '+' '.join(a+('*' if b else '') for a,b in l))
