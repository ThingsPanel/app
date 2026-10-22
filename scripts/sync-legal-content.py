"""Copy only official agreement main content into the MP offline reader."""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import urlopen

class ArticleParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_main = False
        self.block = None
        self.blocks = []
        self.href = ''

    def handle_starttag(self, tag, attrs):
        if tag == 'main':
            self.in_main = True
        if not self.in_main:
            return
        if tag in ('h1', 'h2', 'p', 'li'):
            self.block = {'type': tag, 'text': ''}
        if tag == 'a':
            self.href = dict(attrs).get('href', '')

    def handle_data(self, data):
        if self.in_main and self.block is not None:
            self.block['text'] += data

    def handle_endtag(self, tag):
        if tag == 'a' and self.block is not None:
            if self.href.startswith('https://'):
                self.block['text'] += '（' + self.href + '）'
            self.href = ''
        if self.block is not None and tag == self.block['type']:
            self.blocks.append(self.block)
            self.block = None
        if tag == 'main':
            self.in_main = False

root = Path(__file__).resolve().parents[1]
documents = {}
for kind in ('terms', 'privacy'):
    url = 'https://www.thingspanel.cn/' + kind
    parser = ArticleParser()
    parser.feed(urlopen(url, timeout=30).read().decode('utf-8'))
    assert len(parser.blocks) > 10, 'Missing agreement body: ' + kind
    assert parser.blocks[0]['type'] == 'h1'
    documents[kind] = {'source': url, 'blocks': parser.blocks}
destination = root / 'pages/web-view/legal-content.json'
destination.write_text(json.dumps(documents, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('Synced official agreement blocks:', {k: len(v['blocks']) for k, v in documents.items()})
