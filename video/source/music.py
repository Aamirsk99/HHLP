import numpy as np, wave, sys
sr=44100; D=float(sys.argv[2]); n=int(sr*D); t=np.arange(n)/sr
bpm=96; beat=60/bpm; bar=4*beat
def f(m): return 440*2**((m-69)/12)
# I–V–vi–IV in C : C G Am F
prog=[[48,60,64,67],[43,59,62,67],[45,60,64,69],[41,60,65,69]]
arp=[[72,76,79,84],[71,74,79,83],[72,76,81,84],[72,77,81,84]]
out=np.zeros(n)
def env(L,a,r):
    e=np.ones(L); A=min(int(a*sr),L//2); R=min(int(r*sr),L//2)
    e[:A]=np.linspace(0,1,A); e[-R:]*=np.linspace(1,0,R); return e
nb=int(D/bar)+1
for b in range(nb):
    ch=prog[b%4]; s0=int(b*bar*sr); L=int(bar*1.15*sr)
    if s0>=n: break
    L=min(L,n-s0); tt=np.arange(L)/sr
    pad=sum(np.sin(2*np.pi*f(m)*tt)*0.5+np.sin(2*np.pi*f(m)*1.003*tt)*0.5 for m in ch[1:])*0.05
    bass=np.sin(2*np.pi*f(ch[0])*tt)*0.12
    out[s0:s0+L]+=(pad+bass)*env(L,0.6,0.8)
    for k in range(8):  # eighth-note pluck arpeggio
        m=arp[b%4][[0,1,2,3,2,1,2,3][k]]; p0=s0+int(k*beat/2*sr); Lp=int(0.9*sr)
        if p0+Lp>n: continue
        tp=np.arange(Lp)/sr
        out[p0:p0+Lp]+=(np.sin(2*np.pi*f(m)*tp)+0.3*np.sin(4*np.pi*f(m)*tp))*np.exp(-tp*5)*0.07*(1 if b>=1 else 0.5)
    for k in range(4):  # soft kick from bar 2
        if b<2: break
        p0=s0+int(k*beat*sr); Lk=int(0.25*sr)
        if p0+Lk>n: continue
        tk=np.arange(Lk)/sr; out[p0:p0+Lk]+=np.sin(2*np.pi*(55+90*np.exp(-tk*30))*tk)*np.exp(-tk*14)*0.22
# simple reverb-ish echo
d=int(0.23*sr); wet=np.zeros(n); wet[d:]=out[:-d]*0.3; wet[2*d:]+=out[:-2*d]*0.12; out+=wet
fi=int(1.5*sr); fo=int(3*sr); out[:fi]*=np.linspace(0,1,fi); out[-fo:]*=np.linspace(1,0,fo)
out/=np.abs(out).max()*1.12
st=np.stack([out,np.roll(out,int(0.012*sr))],1)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((st*32767).astype('<i2').tobytes()); w.close()
