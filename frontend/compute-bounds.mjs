import Vietnam from '@svg-maps/vietnam';
let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
Vietnam.locations.forEach(l => {
  let cx=0,cy=0;
  const tokens=(l.path.match(/[a-zA-Z]|[-]?\d*\.?\d+/g)||[]);
  let cmd='',i=0;
  while(i<tokens.length){
    const t=tokens[i];
    if(/[a-zA-Z]/.test(t)){cmd=t;i++;continue;}
    const x=parseFloat(tokens[i]),y=parseFloat(tokens[i+1]);
    if(isNaN(x)||isNaN(y)){i++;continue;}
    if(cmd==='M'){cx=x;cy=y;}else if(cmd==='m'){cx+=x;cy+=y;}
    else if(cmd==='L'){cx=x;cy=y;}else if(cmd==='l'){cx+=x;cy+=y;}
    else{i+=2;continue;}
    if(cx<minX)minX=cx;if(cy<minY)minY=cy;if(cx>maxX)maxX=cx;if(cy>maxY)maxY=cy;
    i+=2;
  }
});
const p=8;
console.log('viewBox:', `${Math.floor(minX)-p} ${Math.floor(minY)-p} ${Math.ceil(maxX-minX)+p*2} ${Math.ceil(maxY-minY)+p*2}`);
console.log('raw:', Math.floor(minX), Math.floor(minY), Math.ceil(maxX), Math.ceil(maxY));
