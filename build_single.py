"""index.html 의 css/js 를 한 파일로 합쳐 everfreeze_single.html 을 만든다. (공유·미리보기용)"""
import re, pathlib
root = pathlib.Path(__file__).parent
html = (root/'index.html').read_text(encoding='utf-8')
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', lambda m: '<style>\n'+(root/m.group(1)).read_text(encoding='utf-8')+'\n</style>', html)
html = re.sub(r'<script src="([^"]+)"></script>', lambda m: '<script>\n'+(root/m.group(1)).read_text(encoding='utf-8')+'\n</script>', html)
(root/'everfreeze_single.html').write_text(html, encoding='utf-8')
print('ok', len(html))
