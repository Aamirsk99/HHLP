import sys
src,css,out=sys.argv[1:4]
s=open(src).read();c=open(css).read()
c=c.replace('#overview #ovHead{top:90px;left:150px}','#overview #ovHead{top:90px !important;left:150px !important}')
c=c.replace('</style>','''.ov{top:400px !important}
.ovi{padding:56px 12px !important}
.bgrid{top:290px !important;gap:24px !important}
.bcard{min-height:0 !important;padding:30px 28px !important}
.bcard .ic{width:96px !important;height:96px !important;font-size:56px !important;margin-bottom:18px !important}
.bcard h3{font-size:32px !important}
.bcard p{font-size:23px !important}
</style>''')
R=[('</head>',c+'</head>'),
('<div id="introT1"','<div style="display:flex;flex-direction:column;align-items:flex-start"><div id="introT1"'),
('guided by experts.</div>\n</div>','guided by experts.</div></div>\n</div>'),
('<div id="ctaT"','<div style="display:flex;flex-direction:column;align-items:flex-start"><div id="ctaT"'),
('Hindivine Healthcare Private Limited</div>\n</div>','Hindivine Healthcare Private Limited</div></div>\n</div>'),
('margin:56px 0 46px">','margin:40px 0 36px">'),
('<div id="ctaW" style="margin-top:80px;','<div id="ctaW" style="margin-top:50px;'),
('<div id="ctaPlay" style="margin-top:60px;','<div id="ctaPlay" style="margin-top:44px;'),
('Everything in<br>one app','Everything in one app')]
for a,b in R:
    assert a in s,a; s=s.replace(a,b,1)
open(out,'w').write(s)
