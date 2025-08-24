function ensureRendered(_t){return true;}
function listPages(t){return [1,2].map(n=>({n,svg:`/content/page-svg/${t}/${n}`,png:`/content/page-png/${t}/${n}`}));}
function makeSvg(n,sub){const w=800,h=1131;return `<?xml version="1.0"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="${w}" height="${h}" fill="#f5f5f5"/>
<text x="40" y="80" font-size="36">Demo Page ${n}</text>
<text x="40" y="140" font-size="18" fill="#555">User: ${sub??"anonymous"}</text>
</svg>`;}
module.exports={ensureRendered,listPages,makeSvg};
