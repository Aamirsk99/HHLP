import json,sys,numpy as np,soundfile as sf
tl=json.load(open(sys.argv[1]));vodir=sys.argv[2];music,sr=sf.read(sys.argv[3]);out=sys.argv[4]
D=max(tl['START'][k]+tl['DUR'][k] for k in tl['START']);n=int(D*sr)
voice=np.zeros(n)
for k,s in tl['START'].items():
    a,vsr=sf.read(f'{vodir}/{k}.wav')
    if vsr!=sr:
        x=np.linspace(0,len(a)-1,int(len(a)*sr/vsr));a=np.interp(x,np.arange(len(a)),a)
    p=int((s+tl['VO_LEAD'])*sr);voice[p:p+len(a)]+=a[:n-p]
# duck music under voice (smoothed envelope)
w=int(.3*sr)
def sm(x):
    c=np.concatenate([[0],np.cumsum(np.pad(x,(w//2,w-w//2)))]);return (c[w:]-c[:-w])/w
env=sm(np.abs(voice))[:n];duck=sm(np.where(env>0.01,0.28,0.6))[:n]
m=music[:n] if len(music)>=n else np.pad(music,((0,n-len(music)),(0,0)))
mix=m*duck[:,None]*0.55+voice[:,None]*0.95
mix/=max(1,np.abs(mix).max()/0.97)
sf.write(out,mix,sr);print('mixed',D)
