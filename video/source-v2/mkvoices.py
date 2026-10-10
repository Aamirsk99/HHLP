import numpy as np,glob,os,sys
d=sys.argv[1];v={}
for f in glob.glob(d+'/*.bin'):
    a=np.fromfile(f,dtype=np.float32).reshape(-1,1,256);v[os.path.basename(f)[:-4]]=a
np.savez(sys.argv[2],**v);print(len(v),a.shape)
