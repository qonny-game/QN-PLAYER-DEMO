# 使い方: python3 -I md_audit.py <ルート>  — mdが挙げるファイル名/関数名/idがコードに残っているか。
# CHANGELOGは履歴なので対象外。CLEANUP.mdの履歴(§7)は消えた名前が出て正常。指摘があれば終了コード1
import re,glob,os,sys
root=sys.argv[1] if len(sys.argv)>1 else "."
code=''
for f in glob.glob(root+'/JS/**/*.js',recursive=True)+glob.glob(root+'/CSS/*.css')+[root+'/index.html']:
    if f.endswith('jszip.min.js'): continue
    code+=open(f,encoding='utf-8').read()+'\n'
files=set(os.path.basename(p) for p in glob.glob(root+'/**/*',recursive=True) if os.path.isfile(p))
# 指摘から除外する名前(コードにはないが正しいもの: 保存ファイル内の名前、ブラウザAPI、保存キーの別名など)。増やしてよい
IGNORE={'pitch.json','markers.json','youtube.json','qn-youtube-library_YYYYMMDD.json','yt_library','captureStream','qn_autonext_scope'}
total=0
for md in sorted(glob.glob(root+'/md/*.md')+[root+'/QUICK_START.md']):
    if os.path.basename(md)=='CHANGELOG.md': continue
    t=open(md,encoding='utf-8').read()
    # strip CHANGELOG-like history mentions? keep all but report
    bad_files=set(); bad_syms=set()
    for tok in re.findall(r'`([^`\n]+)`',t):
        tok=tok.strip()
        m=re.fullmatch(r'(?:[\w./-]+/)?([\w.-]+\.(?:js|css|md|html|json|webp|png))',tok)
        if m:
            if m.group(1) not in files: bad_files.add(tok)
            continue
        m=re.fullmatch(r'([A-Za-z_$][\w$]*)\(\)?',tok) or re.fullmatch(r'([A-Za-z_$][\w$]*)',tok)
        if m and len(m.group(1))>5 and re.search(r'[a-z][A-Z]|_',m.group(1)):
            n=m.group(1)
            if not re.search(r'(?<![\w$])'+re.escape(n)+r'(?![\w$])',code): bad_syms.add(n)
        m=re.fullmatch(r'#([A-Za-z][\w-]*)',tok)
        if m and not re.search(r'(?<![\w-])'+re.escape(m.group(1))+r'(?![\w-])',code): bad_syms.add('#'+m.group(1))
        m=re.fullmatch(r'\.([A-Za-z][\w-]*)',tok)
        if m and len(m.group(1))>5 and not re.search(r'(?<![\w-])'+re.escape(m.group(1))+r'(?![\w-])',code): bad_syms.add('.'+m.group(1))
    bad_files-=IGNORE; bad_syms-=IGNORE
    if os.path.basename(md)!='CLEANUP.md': total+=len(bad_files)+len(bad_syms)
    print('##',os.path.basename(md),'files:',sorted(bad_files),'\n   syms:',sorted(bad_syms))
print('指摘合計(CLEANUP除く):',total)
sys.exit(1 if total else 0)
