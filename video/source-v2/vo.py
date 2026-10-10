import sys,json,soundfile as sf,numpy as np
from kokoro_onnx import Kokoro
k=Kokoro(sys.argv[1],sys.argv[2]); out=sys.argv[4]; res={}
for key,txt in json.load(open(sys.argv[3])):
    a,sr=k.create(txt,voice='af_heart',speed=0.98,lang='en-us')
    a=a/np.abs(a).max()*0.89; sf.write(f'{out}/{key}.wav',a,sr); res[key]=round(len(a)/sr,2)
json.dump(res,open(f'{out}/durations.json','w'));print(res,sum(res.values()))
