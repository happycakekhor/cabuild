const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/research-query.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,URL});
const {parseResearchQuery:parse}=m.exports;
for(const text of ['creator ideas','Brand: storytelling','next.js tutorials','social media 2026']){assert.equal(parse(text).mode,'keywords');assert(!parse(text).error);}
for(const [text,platform] of [['instagram.com/studio','Instagram'],['HTTPS://WWW.YOUTUBE.COM/@studio','YouTube'],['youtu.be/abc','YouTube'],['https://m.tiktok.com/@studio','TikTok'],['https://www.facebook.com/studio','Facebook'],['https://linkedin.com/in/studio','LinkedIn'],['https://x.com/studio','X']]){const r=parse(text);assert.equal(r.mode,'url');assert.equal(r.platform,platform);assert.match(r.value,/^https:\/\//);assert(!r.error);}
assert.equal(parse('https://instagram.com.evil.test/studio').platform,undefined);
for(const text of ['', '   ','https:/broken','https://bad url','javascript:alert(1)','ftp://example.com/file','https://user:password@example.com'])assert(parse(text).error,'Invalid input must not fall through to keyword spend: '+text);
assert.equal(parse('  creator ideas  ').value,'creator ideas');
console.log('PASS combined URL/keyword classification, schemeless and mixed-case social URLs, colon keywords, hostname boundaries and invalid-input rejection');
