var QNBasicPitchLib=(()=>{var RA=Object.create;var fu=Object.defineProperty;var FA=Object.getOwnPropertyDescriptor;var _A=Object.getOwnPropertyNames;var OA=Object.getPrototypeOf,PA=Object.prototype.hasOwnProperty;var wr=(r,t)=>()=>{try{return t||r((t={exports:{}}).exports,t),t.exports}catch(e){throw t=0,e}},At=(r,t)=>{for(var e in t)fu(r,e,{get:t[e],enumerable:!0})},sb=(r,t,e,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of _A(t))!PA.call(r,n)&&n!==e&&fu(r,n,{get:()=>t[n],enumerable:!(o=FA(t,n))||o.enumerable});return r};var Ud=(r,t,e)=>(e=r!=null?RA(OA(r)):{},sb(t||!r||!r.__esModule?fu(e,"default",{value:r,enumerable:!0}):e,r)),LA=r=>sb(fu({},"__esModule",{value:!0}),r);var wb=wr((Aq,Sb)=>{Sb.exports=Qt;var Nr=null;try{Nr=new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0,97,115,109,1,0,0,0,1,13,2,96,0,1,127,96,4,127,127,127,127,1,127,3,7,6,0,1,1,1,1,1,6,6,1,127,1,65,0,11,7,50,6,3,109,117,108,0,1,5,100,105,118,95,115,0,2,5,100,105,118,95,117,0,3,5,114,101,109,95,115,0,4,5,114,101,109,95,117,0,5,8,103,101,116,95,104,105,103,104,0,0,10,191,1,6,4,0,35,0,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,126,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,127,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,128,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,129,34,4,66,32,135,167,36,0,32,4,167,11,36,1,1,126,32,0,173,32,1,173,66,32,134,132,32,2,173,32,3,173,66,32,134,132,130,34,4,66,32,135,167,36,0,32,4,167,11])),{}).exports}catch{}function Qt(r,t,e){this.low=r|0,this.high=t|0,this.unsigned=!!e}Qt.prototype.__isLong__;Object.defineProperty(Qt.prototype,"__isLong__",{value:!0});function tr(r){return(r&&r.__isLong__)===!0}Qt.isLong=tr;var fb={},db={};function Si(r,t){var e,o,n;return t?(r>>>=0,(n=0<=r&&r<256)&&(o=db[r],o)?o:(e=Jt(r,(r|0)<0?-1:0,!0),n&&(db[r]=e),e)):(r|=0,(n=-128<=r&&r<128)&&(o=fb[r],o)?o:(e=Jt(r,r<0?-1:0,!1),n&&(fb[r]=e),e))}Qt.fromInt=Si;function vr(r,t){if(isNaN(r))return t?Ti:Ir;if(t){if(r<0)return Ti;if(r>=yb)return Tb}else{if(r<=-gb)return Je;if(r+1>=gb)return Cb}return r<0?vr(-r,t).neg():Jt(r%_p|0,r/_p|0,t)}Qt.fromNumber=vr;function Jt(r,t,e){return new Qt(r,t,e)}Qt.fromBits=Jt;var yu=Math.pow;function nh(r,t,e){if(r.length===0)throw Error("empty string");if(r==="NaN"||r==="Infinity"||r==="+Infinity"||r==="-Infinity")return Ir;if(typeof t=="number"?(e=t,t=!1):t=!!t,e=e||10,e<2||36<e)throw RangeError("radix");var o;if((o=r.indexOf("-"))>0)throw Error("interior hyphen");if(o===0)return nh(r.substring(1),t,e).neg();for(var n=vr(yu(e,8)),s=Ir,a=0;a<r.length;a+=8){var i=Math.min(8,r.length-a),p=parseInt(r.substring(a,a+i),e);if(i<8){var c=vr(yu(e,i));s=s.mul(c).add(vr(p))}else s=s.mul(n),s=s.add(vr(p))}return s.unsigned=t,s}Qt.fromString=nh;function Hr(r,t){return typeof r=="number"?vr(r,t):typeof r=="string"?nh(r,t):Jt(r.low,r.high,typeof t=="boolean"?t:r.unsigned)}Qt.fromValue=Hr;var hb=65536,mD=1<<24,_p=hb*hb,yb=_p*_p,gb=yb/2,xb=Si(mD),Ir=Si(0);Qt.ZERO=Ir;var Ti=Si(0,!0);Qt.UZERO=Ti;var Fp=Si(1);Qt.ONE=Fp;var bb=Si(1,!0);Qt.UONE=bb;var oh=Si(-1);Qt.NEG_ONE=oh;var Cb=Jt(-1,2147483647,!1);Qt.MAX_VALUE=Cb;var Tb=Jt(-1,-1,!0);Qt.MAX_UNSIGNED_VALUE=Tb;var Je=Jt(0,-2147483648,!1);Qt.MIN_VALUE=Je;var nt=Qt.prototype;nt.toInt=function(){return this.unsigned?this.low>>>0:this.low};nt.toNumber=function(){return this.unsigned?(this.high>>>0)*_p+(this.low>>>0):this.high*_p+(this.low>>>0)};nt.toString=function(t){if(t=t||10,t<2||36<t)throw RangeError("radix");if(this.isZero())return"0";if(this.isNegative())if(this.eq(Je)){var e=vr(t),o=this.div(e),n=o.mul(e).sub(this);return o.toString(t)+n.toInt().toString(t)}else return"-"+this.neg().toString(t);for(var s=vr(yu(t,6),this.unsigned),a=this,i="";;){var p=a.div(s),c=a.sub(p.mul(s)).toInt()>>>0,l=c.toString(t);if(a=p,a.isZero())return l+i;for(;l.length<6;)l="0"+l;i=""+l+i}};nt.getHighBits=function(){return this.high};nt.getHighBitsUnsigned=function(){return this.high>>>0};nt.getLowBits=function(){return this.low};nt.getLowBitsUnsigned=function(){return this.low>>>0};nt.getNumBitsAbs=function(){if(this.isNegative())return this.eq(Je)?64:this.neg().getNumBitsAbs();for(var t=this.high!=0?this.high:this.low,e=31;e>0&&(t&1<<e)==0;e--);return this.high!=0?e+33:e+1};nt.isZero=function(){return this.high===0&&this.low===0};nt.eqz=nt.isZero;nt.isNegative=function(){return!this.unsigned&&this.high<0};nt.isPositive=function(){return this.unsigned||this.high>=0};nt.isOdd=function(){return(this.low&1)===1};nt.isEven=function(){return(this.low&1)===0};nt.equals=function(t){return tr(t)||(t=Hr(t)),this.unsigned!==t.unsigned&&this.high>>>31===1&&t.high>>>31===1?!1:this.high===t.high&&this.low===t.low};nt.eq=nt.equals;nt.notEquals=function(t){return!this.eq(t)};nt.neq=nt.notEquals;nt.ne=nt.notEquals;nt.lessThan=function(t){return this.comp(t)<0};nt.lt=nt.lessThan;nt.lessThanOrEqual=function(t){return this.comp(t)<=0};nt.lte=nt.lessThanOrEqual;nt.le=nt.lessThanOrEqual;nt.greaterThan=function(t){return this.comp(t)>0};nt.gt=nt.greaterThan;nt.greaterThanOrEqual=function(t){return this.comp(t)>=0};nt.gte=nt.greaterThanOrEqual;nt.ge=nt.greaterThanOrEqual;nt.compare=function(t){if(tr(t)||(t=Hr(t)),this.eq(t))return 0;var e=this.isNegative(),o=t.isNegative();return e&&!o?-1:!e&&o?1:this.unsigned?t.high>>>0>this.high>>>0||t.high===this.high&&t.low>>>0>this.low>>>0?-1:1:this.sub(t).isNegative()?-1:1};nt.comp=nt.compare;nt.negate=function(){return!this.unsigned&&this.eq(Je)?Je:this.not().add(Fp)};nt.neg=nt.negate;nt.add=function(t){tr(t)||(t=Hr(t));var e=this.high>>>16,o=this.high&65535,n=this.low>>>16,s=this.low&65535,a=t.high>>>16,i=t.high&65535,p=t.low>>>16,c=t.low&65535,l=0,u=0,m=0,f=0;return f+=s+c,m+=f>>>16,f&=65535,m+=n+p,u+=m>>>16,m&=65535,u+=o+i,l+=u>>>16,u&=65535,l+=e+a,l&=65535,Jt(m<<16|f,l<<16|u,this.unsigned)};nt.subtract=function(t){return tr(t)||(t=Hr(t)),this.add(t.neg())};nt.sub=nt.subtract;nt.multiply=function(t){if(this.isZero())return Ir;if(tr(t)||(t=Hr(t)),Nr){var e=Nr.mul(this.low,this.high,t.low,t.high);return Jt(e,Nr.get_high(),this.unsigned)}if(t.isZero())return Ir;if(this.eq(Je))return t.isOdd()?Je:Ir;if(t.eq(Je))return this.isOdd()?Je:Ir;if(this.isNegative())return t.isNegative()?this.neg().mul(t.neg()):this.neg().mul(t).neg();if(t.isNegative())return this.mul(t.neg()).neg();if(this.lt(xb)&&t.lt(xb))return vr(this.toNumber()*t.toNumber(),this.unsigned);var o=this.high>>>16,n=this.high&65535,s=this.low>>>16,a=this.low&65535,i=t.high>>>16,p=t.high&65535,c=t.low>>>16,l=t.low&65535,u=0,m=0,f=0,d=0;return d+=a*l,f+=d>>>16,d&=65535,f+=s*l,m+=f>>>16,f&=65535,f+=a*c,m+=f>>>16,f&=65535,m+=n*l,u+=m>>>16,m&=65535,m+=s*c,u+=m>>>16,m&=65535,m+=a*p,u+=m>>>16,m&=65535,u+=o*l+n*c+s*p+a*i,u&=65535,Jt(f<<16|d,u<<16|m,this.unsigned)};nt.mul=nt.multiply;nt.divide=function(t){if(tr(t)||(t=Hr(t)),t.isZero())throw Error("division by zero");if(Nr){if(!this.unsigned&&this.high===-2147483648&&t.low===-1&&t.high===-1)return this;var e=(this.unsigned?Nr.div_u:Nr.div_s)(this.low,this.high,t.low,t.high);return Jt(e,Nr.get_high(),this.unsigned)}if(this.isZero())return this.unsigned?Ti:Ir;var o,n,s;if(this.unsigned){if(t.unsigned||(t=t.toUnsigned()),t.gt(this))return Ti;if(t.gt(this.shru(1)))return bb;s=Ti}else{if(this.eq(Je)){if(t.eq(Fp)||t.eq(oh))return Je;if(t.eq(Je))return Fp;var a=this.shr(1);return o=a.div(t).shl(1),o.eq(Ir)?t.isNegative()?Fp:oh:(n=this.sub(t.mul(o)),s=o.add(n.div(t)),s)}else if(t.eq(Je))return this.unsigned?Ti:Ir;if(this.isNegative())return t.isNegative()?this.neg().div(t.neg()):this.neg().div(t).neg();if(t.isNegative())return this.div(t.neg()).neg();s=Ir}for(n=this;n.gte(t);){o=Math.max(1,Math.floor(n.toNumber()/t.toNumber()));for(var i=Math.ceil(Math.log(o)/Math.LN2),p=i<=48?1:yu(2,i-48),c=vr(o),l=c.mul(t);l.isNegative()||l.gt(n);)o-=p,c=vr(o,this.unsigned),l=c.mul(t);c.isZero()&&(c=Fp),s=s.add(c),n=n.sub(l)}return s};nt.div=nt.divide;nt.modulo=function(t){if(tr(t)||(t=Hr(t)),Nr){var e=(this.unsigned?Nr.rem_u:Nr.rem_s)(this.low,this.high,t.low,t.high);return Jt(e,Nr.get_high(),this.unsigned)}return this.sub(this.div(t).mul(t))};nt.mod=nt.modulo;nt.rem=nt.modulo;nt.not=function(){return Jt(~this.low,~this.high,this.unsigned)};nt.and=function(t){return tr(t)||(t=Hr(t)),Jt(this.low&t.low,this.high&t.high,this.unsigned)};nt.or=function(t){return tr(t)||(t=Hr(t)),Jt(this.low|t.low,this.high|t.high,this.unsigned)};nt.xor=function(t){return tr(t)||(t=Hr(t)),Jt(this.low^t.low,this.high^t.high,this.unsigned)};nt.shiftLeft=function(t){return tr(t)&&(t=t.toInt()),(t&=63)===0?this:t<32?Jt(this.low<<t,this.high<<t|this.low>>>32-t,this.unsigned):Jt(0,this.low<<t-32,this.unsigned)};nt.shl=nt.shiftLeft;nt.shiftRight=function(t){return tr(t)&&(t=t.toInt()),(t&=63)===0?this:t<32?Jt(this.low>>>t|this.high<<32-t,this.high>>t,this.unsigned):Jt(this.high>>t-32,this.high>=0?0:-1,this.unsigned)};nt.shr=nt.shiftRight;nt.shiftRightUnsigned=function(t){if(tr(t)&&(t=t.toInt()),t&=63,t===0)return this;var e=this.high;if(t<32){var o=this.low;return Jt(o>>>t|e<<32-t,e>>>t,this.unsigned)}else return t===32?Jt(e,0,this.unsigned):Jt(e>>>t-32,0,this.unsigned)};nt.shru=nt.shiftRightUnsigned;nt.shr_u=nt.shiftRightUnsigned;nt.toSigned=function(){return this.unsigned?Jt(this.low,this.high,!1):this};nt.toUnsigned=function(){return this.unsigned?this:Jt(this.low,this.high,!0)};nt.toBytes=function(t){return t?this.toBytesLE():this.toBytesBE()};nt.toBytesLE=function(){var t=this.high,e=this.low;return[e&255,e>>>8&255,e>>>16&255,e>>>24,t&255,t>>>8&255,t>>>16&255,t>>>24]};nt.toBytesBE=function(){var t=this.high,e=this.low;return[t>>>24,t>>>16&255,t>>>8&255,t&255,e>>>24,e>>>16&255,e>>>8&255,e&255]};Qt.fromBytes=function(t,e,o){return o?Qt.fromBytesLE(t,e):Qt.fromBytesBE(t,e)};Qt.fromBytesLE=function(t,e){return new Qt(t[0]|t[1]<<8|t[2]<<16|t[3]<<24,t[4]|t[5]<<8|t[6]<<16|t[7]<<24,e)};Qt.fromBytesBE=function(t,e){return new Qt(t[4]<<24|t[5]<<16|t[6]<<8|t[7],t[0]<<24|t[1]<<16|t[2]<<8|t[3],e)}});var jb=wr((Xb,eg)=>{(function(r,t,e){function o(i){var p=this,c=a();p.next=function(){var l=2091639*p.s0+p.c*23283064365386963e-26;return p.s0=p.s1,p.s1=p.s2,p.s2=l-(p.c=l|0)},p.c=1,p.s0=c(" "),p.s1=c(" "),p.s2=c(" "),p.s0-=c(i),p.s0<0&&(p.s0+=1),p.s1-=c(i),p.s1<0&&(p.s1+=1),p.s2-=c(i),p.s2<0&&(p.s2+=1),c=null}function n(i,p){return p.c=i.c,p.s0=i.s0,p.s1=i.s1,p.s2=i.s2,p}function s(i,p){var c=new o(i),l=p&&p.state,u=c.next;return u.int32=function(){return c.next()*4294967296|0},u.double=function(){return u()+(u()*2097152|0)*11102230246251565e-32},u.quick=u,l&&(typeof l=="object"&&n(l,c),u.state=function(){return n(c,{})}),u}function a(){var i=4022871197,p=function(c){c=String(c);for(var l=0;l<c.length;l++){i+=c.charCodeAt(l);var u=.02519603282416938*i;i=u>>>0,u-=i,u*=i,i=u>>>0,u-=i,i+=u*4294967296}return(i>>>0)*23283064365386963e-26};return p}t&&t.exports?t.exports=s:e&&e.amd?e(function(){return s}):this.alea=s})(Xb,typeof eg=="object"&&eg,typeof define=="function"&&define)});var Zb=wr((Yb,rg)=>{(function(r,t,e){function o(a){var i=this,p="";i.x=0,i.y=0,i.z=0,i.w=0,i.next=function(){var l=i.x^i.x<<11;return i.x=i.y,i.y=i.z,i.z=i.w,i.w^=i.w>>>19^l^l>>>8},a===(a|0)?i.x=a:p+=a;for(var c=0;c<p.length+64;c++)i.x^=p.charCodeAt(c)|0,i.next()}function n(a,i){return i.x=a.x,i.y=a.y,i.z=a.z,i.w=a.w,i}function s(a,i){var p=new o(a),c=i&&i.state,l=function(){return(p.next()>>>0)/4294967296};return l.double=function(){do var u=p.next()>>>11,m=(p.next()>>>0)/4294967296,f=(u+m)/(1<<21);while(f===0);return f},l.int32=p.next,l.quick=l,c&&(typeof c=="object"&&n(c,p),l.state=function(){return n(p,{})}),l}t&&t.exports?t.exports=s:e&&e.amd?e(function(){return s}):this.xor128=s})(Yb,typeof rg=="object"&&rg,typeof define=="function"&&define)});var Jb=wr((Qb,og)=>{(function(r,t,e){function o(a){var i=this,p="";i.next=function(){var l=i.x^i.x>>>2;return i.x=i.y,i.y=i.z,i.z=i.w,i.w=i.v,(i.d=i.d+362437|0)+(i.v=i.v^i.v<<4^(l^l<<1))|0},i.x=0,i.y=0,i.z=0,i.w=0,i.v=0,a===(a|0)?i.x=a:p+=a;for(var c=0;c<p.length+64;c++)i.x^=p.charCodeAt(c)|0,c==p.length&&(i.d=i.x<<10^i.x>>>4),i.next()}function n(a,i){return i.x=a.x,i.y=a.y,i.z=a.z,i.w=a.w,i.v=a.v,i.d=a.d,i}function s(a,i){var p=new o(a),c=i&&i.state,l=function(){return(p.next()>>>0)/4294967296};return l.double=function(){do var u=p.next()>>>11,m=(p.next()>>>0)/4294967296,f=(u+m)/(1<<21);while(f===0);return f},l.int32=p.next,l.quick=l,c&&(typeof c=="object"&&n(c,p),l.state=function(){return n(p,{})}),l}t&&t.exports?t.exports=s:e&&e.amd?e(function(){return s}):this.xorwow=s})(Qb,typeof og=="object"&&og,typeof define=="function"&&define)});var e0=wr((t0,ng)=>{(function(r,t,e){function o(a){var i=this;i.next=function(){var c=i.x,l=i.i,u,m,f;return u=c[l],u^=u>>>7,m=u^u<<24,u=c[l+1&7],m^=u^u>>>10,u=c[l+3&7],m^=u^u>>>3,u=c[l+4&7],m^=u^u<<7,u=c[l+7&7],u=u^u<<13,m^=u^u<<9,c[l]=m,i.i=l+1&7,m};function p(c,l){var u,m,f=[];if(l===(l|0))m=f[0]=l;else for(l=""+l,u=0;u<l.length;++u)f[u&7]=f[u&7]<<15^l.charCodeAt(u)+f[u+1&7]<<13;for(;f.length<8;)f.push(0);for(u=0;u<8&&f[u]===0;++u);for(u==8?m=f[7]=-1:m=f[u],c.x=f,c.i=0,u=256;u>0;--u)c.next()}p(i,a)}function n(a,i){return i.x=a.x.slice(),i.i=a.i,i}function s(a,i){a==null&&(a=+new Date);var p=new o(a),c=i&&i.state,l=function(){return(p.next()>>>0)/4294967296};return l.double=function(){do var u=p.next()>>>11,m=(p.next()>>>0)/4294967296,f=(u+m)/(1<<21);while(f===0);return f},l.int32=p.next,l.quick=l,c&&(c.x&&n(c,p),l.state=function(){return n(p,{})}),l}t&&t.exports?t.exports=s:e&&e.amd?e(function(){return s}):this.xorshift7=s})(t0,typeof ng=="object"&&ng,typeof define=="function"&&define)});var o0=wr((r0,sg)=>{(function(r,t,e){function o(a){var i=this;i.next=function(){var c=i.w,l=i.X,u=i.i,m,f;return i.w=c=c+1640531527|0,f=l[u+34&127],m=l[u=u+1&127],f^=f<<13,m^=m<<17,f^=f>>>15,m^=m>>>12,f=l[u]=f^m,i.i=u,f+(c^c>>>16)|0};function p(c,l){var u,m,f,d,g,h=[],x=128;for(l===(l|0)?(m=l,l=null):(l=l+"\0",m=0,x=Math.max(x,l.length)),f=0,d=-32;d<x;++d)l&&(m^=l.charCodeAt((d+32)%l.length)),d===0&&(g=m),m^=m<<10,m^=m>>>15,m^=m<<4,m^=m>>>13,d>=0&&(g=g+1640531527|0,u=h[d&127]^=m+g,f=u==0?f+1:0);for(f>=128&&(h[(l&&l.length||0)&127]=-1),f=127,d=512;d>0;--d)m=h[f+34&127],u=h[f=f+1&127],m^=m<<13,u^=u<<17,m^=m>>>15,u^=u>>>12,h[f]=m^u;c.w=g,c.X=h,c.i=f}p(i,a)}function n(a,i){return i.i=a.i,i.w=a.w,i.X=a.X.slice(),i}function s(a,i){a==null&&(a=+new Date);var p=new o(a),c=i&&i.state,l=function(){return(p.next()>>>0)/4294967296};return l.double=function(){do var u=p.next()>>>11,m=(p.next()>>>0)/4294967296,f=(u+m)/(1<<21);while(f===0);return f},l.int32=p.next,l.quick=l,c&&(c.X&&n(c,p),l.state=function(){return n(p,{})}),l}t&&t.exports?t.exports=s:e&&e.amd?e(function(){return s}):this.xor4096=s})(r0,typeof sg=="object"&&sg,typeof define=="function"&&define)});var s0=wr((n0,ag)=>{(function(r,t,e){function o(a){var i=this,p="";i.next=function(){var l=i.b,u=i.c,m=i.d,f=i.a;return l=l<<25^l>>>7^u,u=u-m|0,m=m<<24^m>>>8^f,f=f-l|0,i.b=l=l<<20^l>>>12^u,i.c=u=u-m|0,i.d=m<<16^u>>>16^f,i.a=f-l|0},i.a=0,i.b=0,i.c=-1640531527,i.d=1367130551,a===Math.floor(a)?(i.a=a/4294967296|0,i.b=a|0):p+=a;for(var c=0;c<p.length+20;c++)i.b^=p.charCodeAt(c)|0,i.next()}function n(a,i){return i.a=a.a,i.b=a.b,i.c=a.c,i.d=a.d,i}function s(a,i){var p=new o(a),c=i&&i.state,l=function(){return(p.next()>>>0)/4294967296};return l.double=function(){do var u=p.next()>>>11,m=(p.next()>>>0)/4294967296,f=(u+m)/(1<<21);while(f===0);return f},l.int32=p.next,l.quick=l,c&&(typeof c=="object"&&n(c,p),l.state=function(){return n(p,{})}),l}t&&t.exports?t.exports=s:e&&e.amd?e(function(){return s}):this.tychei=s})(n0,typeof ag=="object"&&ag,typeof define=="function"&&define)});var a0=wr(()=>{});var p0=wr((i0,Au)=>{(function(r,t,e){var o=256,n=6,s=52,a="random",i=e.pow(o,n),p=e.pow(2,s),c=p*2,l=o-1,u;function m(S,w,E){var $=[];w=w==!0?{entropy:!0}:w||{};var D=h(g(w.entropy?[S,b(t)]:S==null?x():S,3),$),F=new f($),P=function(){for(var L=F.g(n),M=i,B=0;L<p;)L=(L+B)*o,M*=o,B=F.g(1);for(;L>=c;)L/=2,M/=2,B>>>=1;return(L+B)/M};return P.int32=function(){return F.g(4)|0},P.quick=function(){return F.g(4)/4294967296},P.double=P,h(b(F.S),t),(w.pass||E||function(L,M,B,G){return G&&(G.S&&d(G,F),L.state=function(){return d(F,{})}),B?(e[a]=L,M):L})(P,D,"global"in w?w.global:this==e,w.state)}function f(S){var w,E=S.length,$=this,D=0,F=$.i=$.j=0,P=$.S=[];for(E||(S=[E++]);D<o;)P[D]=D++;for(D=0;D<o;D++)P[D]=P[F=l&F+S[D%E]+(w=P[D])],P[F]=w;($.g=function(L){for(var M,B=0,G=$.i,z=$.j,V=$.S;L--;)M=V[G=l&G+1],B=B*o+V[l&(V[G]=V[z=l&z+M])+(V[z]=M)];return $.i=G,$.j=z,B})(o)}function d(S,w){return w.i=S.i,w.j=S.j,w.S=S.S.slice(),w}function g(S,w){var E=[],$=typeof S,D;if(w&&$=="object")for(D in S)try{E.push(g(S[D],w-1))}catch{}return E.length?E:$=="string"?S:S+"\0"}function h(S,w){for(var E=S+"",$,D=0;D<E.length;)w[l&D]=l&($^=w[l&D]*19)+E.charCodeAt(D++);return b(w)}function x(){try{var S;return u&&(S=u.randomBytes)?S=S(o):(S=new Uint8Array(o),(r.crypto||r.msCrypto).getRandomValues(S)),b(S)}catch{var w=r.navigator,E=w&&w.plugins;return[+new Date,r,E,r.screen,b(t)]}}function b(S){return String.fromCharCode.apply(0,S)}if(h(e.random(),t),typeof Au=="object"&&Au.exports){Au.exports=m;try{u=a0()}catch{}}else typeof define=="function"&&define.amd?define(function(){return m}):e["seed"+a]=m})(typeof self!="undefined"?self:i0,[],Math)});var ig=wr((wrt,c0)=>{var c_=jb(),l_=Zb(),u_=Jb(),m_=e0(),f_=o0(),d_=s0(),Wi=p0();Wi.alea=c_;Wi.xor128=l_;Wi.xorwow=u_;Wi.xorshift7=m_;Wi.xor4096=f_;Wi.tychei=d_;c0.exports=Wi});var ZS=wr(()=>{});var QS=wr(()=>{});var bq={};At(bq,{BasicPitch:()=>Bd,addPitchBendsToNoteEvents:()=>kA,noteFramesToTime:()=>EA,outputToNotesPoly:()=>IA,tf:()=>Ld});var Ld={};At(Ld,{Abs:()=>ks,Acos:()=>ao,Acosh:()=>io,AdadeltaOptimizer:()=>ra,AdagradOptimizer:()=>oa,AdamOptimizer:()=>na,AdamaxOptimizer:()=>sa,Add:()=>po,AddN:()=>ln,All:()=>Np,Any:()=>vp,ArgMax:()=>un,ArgMin:()=>mn,Asin:()=>co,Asinh:()=>lo,Atan:()=>uo,Atan2:()=>fo,Atanh:()=>mo,AvgPool:()=>fn,AvgPool3D:()=>dn,AvgPool3DGrad:()=>ya,AvgPoolGrad:()=>xa,BatchMatMul:()=>hn,BatchToSpaceND:()=>gn,Bincount:()=>ba,BroadcastArgs:()=>Ca,BroadcastTo:()=>Jd,Cast:()=>Vr,Ceil:()=>ho,ClipByValue:()=>go,Complex:()=>Ta,ComplexAbs:()=>xn,Concat:()=>yn,Conv2D:()=>bn,Conv2DBackpropFilter:()=>Sa,Conv2DBackpropInput:()=>Cn,Conv3D:()=>Tn,Conv3DBackpropFilterV2:()=>wa,Conv3DBackpropInputV2:()=>Na,Cos:()=>Es,Cosh:()=>xo,CropAndResize:()=>Ia,Cumprod:()=>va,Cumsum:()=>Sn,DataStorage:()=>Is,DenseBincount:()=>ka,DepthToSpace:()=>Ea,DepthwiseConv2dNative:()=>wn,DepthwiseConv2dNativeBackpropFilter:()=>$a,DepthwiseConv2dNativeBackpropInput:()=>Aa,Diag:()=>Da,Dilation2D:()=>Nn,Dilation2DBackpropFilter:()=>kp,Dilation2DBackpropInput:()=>Ip,ENV:()=>gu,Einsum:()=>Ra,Elu:()=>vn,EluGrad:()=>Fa,Environment:()=>wp,Equal:()=>As,Erf:()=>$s,Exp:()=>Ds,ExpandDims:()=>In,Expm1:()=>bo,FFT:()=>Ep,Fill:()=>_a,FlipLeftRight:()=>Oa,Floor:()=>Co,FloorDiv:()=>To,FromPixels:()=>$p,FusedBatchNorm:()=>kn,FusedConv2D:()=>qs,FusedDepthwiseConv2D:()=>Ks,GatherNd:()=>Pa,GatherV2:()=>En,Greater:()=>Rs,GreaterEqual:()=>So,IFFT:()=>La,Identity:()=>zr,Imag:()=>Ma,IsFinite:()=>wo,IsInf:()=>No,IsNan:()=>vo,KernelBackend:()=>oo,LRN:()=>Ga,LRNGrad:()=>Va,LeakyRelu:()=>$n,Less:()=>Fs,LessEqual:()=>_s,LinSpace:()=>Ba,Log:()=>Os,Log1p:()=>Io,LogSoftmax:()=>th,LogicalAnd:()=>Ps,LogicalNot:()=>Ls,LogicalOr:()=>Ms,LogicalXor:()=>nD,LowerBound:()=>sD,Max:()=>za,MaxPool:()=>An,MaxPool3D:()=>Dn,MaxPool3DGrad:()=>Ua,MaxPoolGrad:()=>Wa,MaxPoolWithArgmax:()=>Ha,Maximum:()=>ko,Mean:()=>Rn,Min:()=>qa,Minimum:()=>Eo,MirrorPad:()=>Fn,Mod:()=>Bs,MomentumOptimizer:()=>aa,Multinomial:()=>Ka,Multiply:()=>$o,Neg:()=>Xa,NonMaxSuppressionV3:()=>ja,NonMaxSuppressionV4:()=>Ya,NonMaxSuppressionV5:()=>Za,NotEqual:()=>Gs,OP_SCOPE_SUFFIX:()=>Nu,OneHot:()=>On,OnesLike:()=>_n,Optimizer:()=>Pe,OptimizerConstructors:()=>$r,Pack:()=>Pn,PadV2:()=>Ln,Pool:()=>aD,Pow:()=>Vs,Prelu:()=>Mn,Prod:()=>Bn,RMSPropOptimizer:()=>ia,RaggedGather:()=>Qa,RaggedTensorToTensor:()=>Ja,Range:()=>ti,Rank:()=>Su,Real:()=>ei,RealDiv:()=>yo,Reciprocal:()=>Ao,Reduction:()=>te,Relu:()=>Do,Relu6:()=>Ro,Reshape:()=>Gn,ResizeBilinear:()=>zn,ResizeBilinearGrad:()=>oi,ResizeNearestNeighbor:()=>Vn,ResizeNearestNeighborGrad:()=>ri,Reverse:()=>Wn,RotateWithOffset:()=>Ci,Round:()=>Fo,Rsqrt:()=>_o,SGDOptimizer:()=>Jo,ScatterNd:()=>ni,SearchSorted:()=>si,Select:()=>Un,Selu:()=>Oo,Sigmoid:()=>Mo,Sign:()=>Lo,Sin:()=>zs,Sinh:()=>Po,Slice:()=>Hn,Softmax:()=>Xn,Softplus:()=>Bo,SpaceToBatchND:()=>qn,SparseFillEmptyRows:()=>ii,SparseReshape:()=>pi,SparseSegmentMean:()=>ci,SparseSegmentSum:()=>li,SparseToDense:()=>ui,SplitV:()=>Kn,Sqrt:()=>Go,Square:()=>mi,SquaredDifference:()=>Vo,Step:()=>Wo,StridedSlice:()=>fi,StringNGrams:()=>di,StringSplit:()=>hi,StringToHashBucketFast:()=>gi,Sub:()=>Ws,Sum:()=>ai,Tan:()=>Us,Tanh:()=>zo,Tensor:()=>Rt,TensorBuffer:()=>_t,Tile:()=>Wr,TopK:()=>xi,Transform:()=>yi,Transpose:()=>Ur,Unique:()=>bi,Unpack:()=>jn,UnsortedSegmentSum:()=>Yn,UpperBound:()=>iD,Variable:()=>Ho,ZerosLike:()=>Zn,_FusedMatMul:()=>Hs,abs:()=>le,acos:()=>Oc,acosh:()=>Pc,add:()=>tt,addN:()=>xh,all:()=>Lc,any:()=>Mc,argMax:()=>Bc,argMin:()=>Gc,asin:()=>Vc,asinh:()=>zc,atan:()=>Wc,atan2:()=>Uc,atanh:()=>Hc,avgPool:()=>Ei,avgPool3d:()=>Th,backend:()=>kO,backend_util:()=>I,basicLSTMCell:()=>Sh,batchNorm:()=>Kr,batchNorm2d:()=>wh,batchNorm3d:()=>Nh,batchNorm4d:()=>vh,batchToSpaceND:()=>Jn,bincount:()=>qc,booleanMaskAsync:()=>m0,broadcastArgs:()=>Ih,broadcastTo:()=>Xr,broadcast_util:()=>Ke,browser:()=>Xg,buffer:()=>pt,cast:()=>X,ceil:()=>Kc,clipByValue:()=>Xc,clone:()=>He,complex:()=>Be,concat:()=>Lt,concat1d:()=>jc,concat2d:()=>kh,concat3d:()=>Eh,concat4d:()=>$h,conv1d:()=>Yc,conv2d:()=>dr,conv2dTranspose:()=>Zc,conv3d:()=>Ah,conv3dTranspose:()=>Dh,copyRegisteredKernels:()=>uD,cos:()=>ts,cosh:()=>$i,cosineWindow:()=>Vp,cumprod:()=>Qs,cumsum:()=>Ai,customGrad:()=>Fe,denseBincount:()=>Rh,deprecationWarn:()=>f0,depthToSpace:()=>Qc,depthwiseConv2d:()=>es,device_util:()=>ds,diag:()=>Fh,dilation2d:()=>Jc,disableDeprecationWarnings:()=>gO,dispose:()=>ie,disposeVariables:()=>xO,div:()=>st,divNoNan:()=>tl,dot:()=>el,dropout:()=>T0,einsum:()=>_h,elu:()=>Ri,enableDebugMode:()=>hO,enableProdMode:()=>dO,enclosingPowerOfTwo:()=>Lu,engine:()=>Zr,env:()=>_,equal:()=>rs,erf:()=>rl,euclideanNorm:()=>nl,exp:()=>ae,expandDims:()=>ze,expm1:()=>sl,eye:()=>al,fft:()=>ls,fill:()=>jr,findBackend:()=>vO,findBackendFactory:()=>IO,floor:()=>os,floorDiv:()=>Di,fused:()=>Gu,gather:()=>ns,gatherND:()=>b0,gather_util:()=>jg,getBackend:()=>wO,getGradient:()=>xu,getKernel:()=>Dp,getKernelsForBackend:()=>Ec,grad:()=>Ub,grads:()=>Hb,greater:()=>xe,greaterEqual:()=>xr,ifft:()=>jo,imag:()=>ss,image:()=>pC,inTopKAsync:()=>S0,io:()=>Xp,irfft:()=>Yi,isFinite:()=>il,isInf:()=>pl,isNaN:()=>cl,keep:()=>nr,kernel_impls:()=>we,leakyRelu:()=>Fi,less:()=>_i,lessEqual:()=>Xe,linalg:()=>cC,linspace:()=>Bh,loadGraphModel:()=>cu,localResponseNormalization:()=>ll,log:()=>er,log1p:()=>Oi,logSigmoid:()=>ul,logSoftmax:()=>ml,logSumExp:()=>Li,logicalAnd:()=>rr,logicalNot:()=>as,logicalOr:()=>Mi,logicalXor:()=>fl,losses:()=>lC,lowerBound:()=>Gh,matMul:()=>Tt,math:()=>Kg,max:()=>hr,maxPool:()=>Bi,maxPool3d:()=>Vh,maxPoolWithArgmax:()=>zh,maximum:()=>is,mean:()=>Ko,memory:()=>yO,meshgrid:()=>Wh,min:()=>Js,minimum:()=>Gi,mirrorPad:()=>dl,mod:()=>hl,moments:()=>Uh,movingAverage:()=>d0,mul:()=>O,multiRNNCell:()=>Hh,multinomial:()=>qh,neg:()=>$t,nextFrame:()=>pm,norm:()=>qo,notEqual:()=>Vi,oneHot:()=>ta,ones:()=>Oe,onesLike:()=>gl,op:()=>N,outerProduct:()=>Kh,pad:()=>je,pad1d:()=>Xh,pad2d:()=>jh,pad3d:()=>Yh,pad4d:()=>Zh,pool:()=>xl,pow:()=>Ge,prelu:()=>zi,print:()=>yl,prod:()=>bl,profile:()=>bO,raggedGather:()=>Qh,raggedTensorToTensor:()=>Jh,rand:()=>tg,randomGamma:()=>mg,randomNormal:()=>Cl,randomStandardNormal:()=>fg,randomUniform:()=>Tl,range:()=>cs,ready:()=>SO,real:()=>Xo,reciprocal:()=>Sl,registerBackend:()=>Fl,registerGradient:()=>eh,registerKernel:()=>Rp,relu:()=>Yr,relu6:()=>Hi,removeBackend:()=>NO,reshape:()=>R,reverse:()=>ke,reverse1d:()=>dg,reverse2d:()=>hg,reverse3d:()=>gg,reverse4d:()=>xg,rfft:()=>us,round:()=>qi,rsqrt:()=>Ki,scalar:()=>J,scatterND:()=>g0,scatter_util:()=>Pu,searchSorted:()=>Gp,selu:()=>wl,separableConv2d:()=>Nl,serialization:()=>Qg,setBackend:()=>TO,setPlatform:()=>EO,setdiff1dAsync:()=>yg,sigmoid:()=>qe,sign:()=>vl,signal:()=>Xu,sin:()=>Xi,sinh:()=>ji,slice:()=>xt,slice1d:()=>bg,slice2d:()=>Cg,slice3d:()=>Tg,slice4d:()=>Sg,slice_util:()=>de,softmax:()=>Il,softplus:()=>Pi,spaceToBatchND:()=>ps,sparse:()=>uC,sparseToDense:()=>y0,spectral:()=>iC,split:()=>or,sqrt:()=>Ut,square:()=>Ct,squaredDifference:()=>Zi,squeeze:()=>ms,stack:()=>fe,step:()=>yr,stridedSlice:()=>kl,string:()=>mC,sub:()=>rt,sum:()=>it,sumOutType:()=>Ys,tan:()=>El,tanh:()=>Zs,tensor:()=>Te,tensor1d:()=>Ee,tensor2d:()=>fs,tensor3d:()=>$l,tensor4d:()=>wg,tensor5d:()=>Ng,tensor6d:()=>vg,tensor_util:()=>dh,test_util:()=>ug,tidy:()=>St,tile:()=>gr,time:()=>CO,topk:()=>Al,train:()=>E3,transpose:()=>Se,truncatedNormal:()=>Ig,unique:()=>Dl,unregisterGradient:()=>lD,unregisterKernel:()=>cD,unsortedSegmentSum:()=>Qi,unstack:()=>$e,upcastType:()=>ne,upperBound:()=>kg,util:()=>y,valueAndGrad:()=>qb,valueAndGrads:()=>Kb,variable:()=>Eg,variableGrads:()=>ku,version_core:()=>hS,where:()=>Xt,whereAsync:()=>Rl,zeros:()=>_e,zerosLike:()=>mt});var Is=class{constructor(t,e){this.backend=t,this.dataMover=e,this.data=new WeakMap,this.dataIdsCount=0}get(t){return this.data.has(t)||this.dataMover.moveData(this.backend,t),this.data.get(t)}set(t,e){this.dataIdsCount++,this.data.set(t,e)}has(t){return this.data.has(t)}delete(t){return this.dataIdsCount--,this.data.delete(t)}numDataIds(){return this.dataIdsCount}},oo=class{refCount(t){return lr("refCount")}incRef(t){return lr("incRef")}timerAvailable(){return!0}time(t){return lr("time")}read(t){return lr("read")}readSync(t){return lr("readSync")}readToGPU(t,e){return lr("readToGPU")}numDataIds(){return lr("numDataIds")}disposeData(t,e){return lr("disposeData")}write(t,e,o){return lr("write")}move(t,e,o,n,s){return lr("move")}memory(){return lr("memory")}floatPrecision(){return lr("floatPrecision")}epsilon(){return this.floatPrecision()===32?1e-7:1e-4}dispose(){return lr("dispose")}};function lr(r){throw new Error(`'${r}' not yet implemented or not found in the registry. This kernel may not be supported by the tfjs backend you have chosen`)}function ab(r){let t=r.length,e=0;for(;t>0;)e=Math.random()*t|0,t--,du(r,t,e)}function MA(r,t){if(r.length!==t.length)throw new Error(`Array sizes must match to be shuffled together First array length was ${r.length}Second array length was ${t.length}`);let e=r.length,o=0;for(;e>0;)o=Math.random()*e|0,e--,du(r,e,o),du(t,e,o)}function bp(r,t,e){return Math.max(r,Math.min(t,e))}function BA(r){return r%2===0?r:r+1}function du(r,t,e){let o=r[t];r[t]=r[e],r[e]=o}function GA(r){let t=0;for(let e=0;e<r.length;e++)t+=r[e];return t}function VA(r,t){let e=Math.random();return t*e+(1-e)*r}function zA(r,t){let e=0;for(let o=0;o<r.length;o++){let n=Number(r[o])-Number(t[o]);e+=n*n}return e}function k(r,t){if(!r)throw new Error(typeof t=="string"?t:t())}function Wt(r,t,e=""){k(Qe(r,t),()=>e+` Shapes ${r} and ${t} must match`)}function ur(r){k(r!=null,()=>"The input to the tensor constructor must be a non-null value.")}function Br(r,t=[],e=!1){if(t==null&&(t=[]),Array.isArray(r)||me(r)&&!e)for(let o=0;o<r.length;++o)Br(r[o],t,e);else t.push(r);return t}function It(r){if(r.length===0)return 1;let t=r[0];for(let e=1;e<r.length;e++)t*=r[e];return t}function WA(r){return r.length===0}function Qe(r,t){if(r===t)return!0;if(r==null||t==null||r.length!==t.length)return!1;for(let e=0;e<r.length;e++)if(r[e]!==t[e])return!1;return!0}function cn(r){return r%1===0}function UA(r){if(Math.tanh!=null)return Math.tanh(r);if(r===1/0)return 1;if(r===-1/0)return-1;{let t=Math.exp(2*r);return(t-1)/(t+1)}}function HA(r){let t=Math.ceil(Math.sqrt(r));return[t,Math.ceil(r/t)]}function qA(r){let t=new Uint32Array(r);for(let e=0;e<r;++e)t[e]=e;return ab(t),t}function ga(r,t){return t<=r.length?r:r+" ".repeat(t-r.length)}function KA(r,t=n=>0,e,o=setTimeout){return new Promise((n,s)=>{let a=0,i=()=>{if(r()){n();return}a++;let p=t(a);if(e!=null&&a>=e){s();return}o(i,p)};i()})}function XA(r,t){let e=1,o=-1;for(let s=0;s<r.length;++s)if(r[s]>=0)e*=r[s];else if(r[s]===-1){if(o!==-1)throw Error(`Shapes can only have 1 implicit size. Found -1 at dim ${o} and dim ${s}`);o=s}else if(r[s]<0)throw Error(`Shapes can not be < 0. Found ${r[s]} at dim ${s}`);if(o===-1){if(t>0&&t!==e)throw Error(`Size(${t}) must match the product of shape ${r}`);return r}if(e===0)throw Error(`Cannot infer the missing size in [${r}] when there are 0 elements`);if(t%e!==0)throw Error(`The implicit shape can't be a fractional number. Got ${t} / ${e}`);let n=r.slice();return n[o]=t/e,n}function ce(r,t){let e=t.length;return r=r==null?t.map((o,n)=>n):[].concat(r),k(r.every(o=>o>=-e&&o<e),()=>`All values in axis param must be in range [-${e}, ${e}) but got axis ${r}`),k(r.every(o=>cn(o)),()=>`All values in axis param must be integers but got axis ${r}`),r.map(o=>o<0?e+o:o)}function Hd(r,t){let e=[],o=[],n=t!=null&&Array.isArray(t)&&t.length===0,s=t==null||n?null:ce(t,r).sort(),a=0;for(let i=0;i<r.length;++i){if(s!=null){if(s[a]===i&&r[i]!==1)throw new Error(`Can't squeeze axis ${i} since its dim '${r[i]}' is not 1`);(s[a]==null||s[a]>i)&&r[i]===1&&(e.push(r[i]),o.push(i)),s[a]<=i&&a++}r[i]!==1&&(e.push(r[i]),o.push(i))}return{newShape:e,keptDims:o}}function qd(r,t){let e=null;if(r==null||r==="float32")e=new Float32Array(t);else if(r==="int32")e=new Int32Array(t);else if(r==="bool")e=new Uint8Array(t);else throw new Error(`Unknown data type ${r}`);return e}function Kd(r,t){let e=null;if(r==null||r==="float32")e=new Float32Array(t);else if(r==="int32")e=new Int32Array(t);else if(r==="bool")e=new Uint8Array(t);else if(r==="string")e=new Array(t);else throw new Error(`Unknown data type ${r}`);return e}function Xd(r,t){for(let e=0;e<r.length;e++){let o=r[e];if(isNaN(o)||!isFinite(o))throw Error(`A tensor of type ${t} being uploaded contains ${o}.`)}}function jd(r){return r==="bool"||r==="complex64"||r==="float32"||r==="int32"||r==="string"}function jA(r,t){return!(t==="complex64"||t==="float32"&&r!=="complex64"||t==="int32"&&r!=="float32"&&r!=="complex64"||t==="bool"&&r==="bool")}function me(r){return r instanceof Float32Array||r instanceof Int32Array||r instanceof Uint8Array||r instanceof Uint8ClampedArray}function hu(r){if(r==="float32"||r==="int32")return 4;if(r==="complex64")return 8;if(r==="bool")return 1;throw new Error(`Unknown dtype ${r}`)}function Yd(r){if(r==null)return 0;let t=0;return r.forEach(e=>t+=e.length),t}function Gr(r){return typeof r=="string"||r instanceof String}function ib(r){return typeof r=="boolean"}function pb(r){return typeof r=="number"}function Cp(r){return Array.isArray(r)?Cp(r[0]):r instanceof Float32Array?"float32":r instanceof Int32Array||r instanceof Uint8Array||r instanceof Uint8ClampedArray?"int32":pb(r)?"float32":Gr(r)?"string":ib(r)?"bool":"float32"}function no(r){return!!(r&&r.constructor&&r.call&&r.apply)}function Tp(r,t){for(let e=t;e<r;++e)if(r%e===0)return e;return r}function so(r){let t=r.length;if(t<2)return[];let e=new Array(t-1);e[t-2]=r[t-1];for(let o=t-3;o>=0;--o)e[o]=e[o+1]*r[o+1];return e}function cb(r,t,e,o=!1){let n=new Array;if(t.length===1){let s=t[0]*(o?2:1);for(let a=0;a<s;a++)n[a]=e[r+a]}else{let s=t[0],a=t.slice(1),i=a.reduce((p,c)=>p*c)*(o?2:1);for(let p=0;p<s;p++)n[p]=cb(r+p*i,a,e,o)}return n}function ha(r,t,e=!1){if(r.length===0)return t[0];let o=r.reduce((n,s)=>n*s)*(e?2:1);if(o===0)return[];if(o!==t.length)throw new Error(`[${r}] does not match the input size ${t.length}${e?" for a complex tensor":""}.`);return cb(0,r,t,e)}function wc(r,t){let e=Sp(r,t);for(let o=0;o<e.length;o++)e[o]=1;return e}function Sp(r,t){if(t==null||t==="float32"||t==="complex64")return new Float32Array(r);if(t==="int32")return new Int32Array(r);if(t==="bool")return new Uint8Array(r);throw new Error(`Unknown data type ${t}`)}function YA(r,t){let e=r.reduce((o,n)=>o*n,1);if(t==null||t==="float32")return ha(r,new Float32Array(e));if(t==="int32")return ha(r,new Int32Array(e));if(t==="bool")return ha(r,new Uint8Array(e));throw new Error(`Unknown data type ${t}`)}function Nc(r){r.forEach(t=>{k(Number.isInteger(t)&&t>=0,()=>`Tensor must have a shape comprised of positive integers but got shape [${r}].`)})}function ZA(r,t,e){if(t===0)return 0;if(t===1)return r[0];let o=r[r.length-1];for(let n=0;n<r.length-1;++n)o+=e[n]*r[n];return o}function QA(r,t,e){if(t===0)return[];if(t===1)return[r];let o=new Array(t);for(let n=0;n<o.length-1;++n)o[n]=Math.floor(r/e[n]),r-=o[n]*e[n];return o[o.length-1]=r,o}function vc(r){return r&&r.then&&typeof r.then=="function"}var lb="tfjsflags",wp=class{constructor(t){this.global=t,this.flags={},this.flagRegistry={},this.urlFlags={},this.getQueryParams=tD,this.populateURLFlags()}setPlatform(t,e){this.platform!=null&&(_().getBool("IS_TEST")||_().getBool("PROD")||console.warn(`Platform ${this.platformName} has already been set. Overwriting the platform with ${t}.`)),this.platformName=t,this.platform=e}registerFlag(t,e,o){if(this.flagRegistry[t]={evaluationFn:e,setHook:o},this.urlFlags[t]!=null){let n=this.urlFlags[t];_().getBool("IS_TEST")||_().getBool("PROD")||console.warn(`Setting feature override from URL ${t}: ${n}.`),this.set(t,n)}}async getAsync(t){return t in this.flags?this.flags[t]:(this.flags[t]=await this.evaluateFlag(t),this.flags[t])}get(t){if(t in this.flags)return this.flags[t];let e=this.evaluateFlag(t);if(vc(e))throw new Error(`Flag ${t} cannot be synchronously evaluated. Please use getAsync() instead.`);return this.flags[t]=e,this.flags[t]}getNumber(t){return this.get(t)}getBool(t){return this.get(t)}getFlags(){return this.flags}get features(){return this.flags}set(t,e){if(this.flagRegistry[t]==null)throw new Error(`Cannot set flag ${t} as it has not been registered.`);this.flags[t]=e,this.flagRegistry[t].setHook!=null&&this.flagRegistry[t].setHook(e)}evaluateFlag(t){if(this.flagRegistry[t]==null)throw new Error(`Cannot evaluate flag '${t}': no evaluation function found.`);return this.flagRegistry[t].evaluationFn()}setFlags(t){this.flags=Object.assign({},t)}reset(){this.flags={},this.urlFlags={},this.populateURLFlags()}populateURLFlags(){if(typeof this.global=="undefined"||typeof this.global.location=="undefined"||typeof this.global.location.search=="undefined")return;let t=this.getQueryParams(this.global.location.search);lb in t&&t[lb].split(",").forEach(o=>{let[n,s]=o.split(":");this.urlFlags[n]=rD(n,s)})}};function tD(r){let t={};return r.replace(/[?&]([^=?&]+)(?:=([^&]*))?/g,(e,...o)=>(eD(t,o[0],o[1]),o.join("="))),t}function eD(r,t,e){r[decodeURIComponent(t)]=decodeURIComponent(e||"")}function rD(r,t){if(t=t.toLowerCase(),t==="true"||t==="false")return t==="true";if(`${+t}`===t)return+t;throw new Error(`Could not parse value flag value ${t} for flag ${r}.`)}function _(){return gu}var gu=null;function ub(r){gu=r}var Zd;function Qd(){if(Zd==null){let r;if(typeof window!="undefined")r=window;else if(typeof global!="undefined")r=global;else if(typeof process!="undefined")r=process;else if(typeof self!="undefined")r=self;else throw new Error("Could not find a global object");Zd=r}return Zd}function oD(){let r=Qd();return r._tfGlobals==null&&(r._tfGlobals=new Map),r._tfGlobals}function Ic(r,t){let e=oD();if(e.has(r))return e.get(r);{let o=t();return e.set(r,o),e.get(r)}}var ks="Abs",ao="Acos",io="Acosh",po="Add",ln="AddN",Np="All",vp="Any",un="ArgMax",mn="ArgMin",co="Asin",lo="Asinh",uo="Atan",mo="Atanh",fo="Atan2",fn="AvgPool",xa="AvgPoolGrad",dn="AvgPool3D",ya="AvgPool3DGrad",hn="BatchMatMul",gn="BatchToSpaceND",ba="Bincount",Jd="BroadcastTo",Ca="BroadcastArgs",Vr="Cast",ho="Ceil",go="ClipByValue",Ta="Complex",xn="ComplexAbs",yn="Concat",bn="Conv2D",Sa="Conv2DBackpropFilter",Cn="Conv2DBackpropInput",Tn="Conv3D",wa="Conv3DBackpropFilterV2",Na="Conv3DBackpropInputV2",Es="Cos",xo="Cosh",va="Cumprod",Sn="Cumsum",Ia="CropAndResize",ka="DenseBincount",Ea="DepthToSpace",wn="DepthwiseConv2dNative",$a="DepthwiseConv2dNativeBackpropFilter",Aa="DepthwiseConv2dNativeBackpropInput",Da="Diag",Nn="Dilation2D",Ip="Dilation2DBackpropInput",kp="Dilation2DBackpropFilter",yo="RealDiv",Ra="Einsum",vn="Elu",Fa="EluGrad",$s="Erf",As="Equal",Ds="Exp",In="ExpandDims",bo="Expm1",Ep="FFT",_a="Fill",Oa="FlipLeftRight",Co="Floor",To="FloorDiv",kn="FusedBatchNorm",En="GatherV2",Pa="GatherNd",Rs="Greater",So="GreaterEqual",zr="Identity",La="IFFT",Ma="Imag",wo="IsFinite",No="IsInf",vo="IsNan",$n="LeakyRelu",Fs="Less",_s="LessEqual",Ba="LinSpace",Os="Log",Io="Log1p",Ps="LogicalAnd",Ls="LogicalNot",Ms="LogicalOr",nD="LogicalXor",th="LogSoftmax",sD="LowerBound",Ga="LRN",Va="LRNGrad",za="Max",ko="Maximum",An="MaxPool",Wa="MaxPoolGrad",Dn="MaxPool3D",Ua="MaxPool3DGrad",Ha="MaxPoolWithArgmax",Rn="Mean",qa="Min",Eo="Minimum",Fn="MirrorPad",Bs="Mod",Ka="Multinomial",$o="Multiply",Xa="Neg",Gs="NotEqual",ja="NonMaxSuppressionV3",Ya="NonMaxSuppressionV4",Za="NonMaxSuppressionV5",_n="OnesLike",On="OneHot",Pn="Pack",Ln="PadV2",aD="Pool",Vs="Pow",Mn="Prelu",Bn="Prod",Qa="RaggedGather",Ja="RaggedTensorToTensor",ti="Range",ei="Real",Ao="Reciprocal",Do="Relu",Gn="Reshape",Vn="ResizeNearestNeighbor",ri="ResizeNearestNeighborGrad",zn="ResizeBilinear",oi="ResizeBilinearGrad",Ro="Relu6",Wn="Reverse",Fo="Round",_o="Rsqrt",ni="ScatterNd",si="SearchSorted",Un="Select",Oo="Selu",Hn="Slice",zs="Sin",Po="Sinh",Lo="Sign",Mo="Sigmoid",Bo="Softplus",Go="Sqrt",ai="Sum",qn="SpaceToBatchND",Kn="SplitV",Xn="Softmax",ii="SparseFillEmptyRows",pi="SparseReshape",ci="SparseSegmentMean",li="SparseSegmentSum",ui="SparseToDense",Vo="SquaredDifference",mi="Square",fi="StridedSlice",di="StringNGrams",hi="StringSplit",gi="StringToHashBucketFast",Ws="Sub",Us="Tan",zo="Tanh",Wr="Tile",xi="TopK",yi="Transform",Ur="Transpose",bi="Unique",jn="Unpack",Yn="UnsortedSegmentSum",iD="UpperBound",Zn="ZerosLike",Wo="Step",$p="FromPixels",Ci="RotateWithOffset",Hs="_FusedMatMul",qs="FusedConv2D",Ks="FusedDepthwiseConv2D";function Uo(...r){_().getBool("IS_TEST")||_().getBool("PROD")||console.warn(...r)}function pD(...r){_().getBool("IS_TEST")||_().getBool("PROD")||console.log(...r)}var Ap=Ic("kernelRegistry",()=>new Map),kc=Ic("gradRegistry",()=>new Map);function Dp(r,t){let e=rh(r,t);return Ap.get(e)}function xu(r){return kc.get(r)}function Ec(r){let t=Ap.entries(),e=[];for(;;){let{done:o,value:n}=t.next();if(o)break;let[s,a]=n,[i]=s.split("_");i===r&&e.push(a)}return e}function Rp(r){let{kernelName:t,backendName:e}=r,o=rh(t,e);Ap.has(o)&&Uo(`The kernel '${t}' for backend '${e}' is already registered`),Ap.set(o,r)}function eh(r){let{kernelName:t}=r;kc.has(t)&&_().getBool("DEBUG")&&Uo(`Overriding the gradient for '${t}'`),kc.set(t,r)}function cD(r,t){let e=rh(r,t);if(!Ap.has(e))throw new Error(`The kernel '${r}' for backend '${t}' is not registered`);Ap.delete(e)}function lD(r){if(!kc.has(r))throw new Error(`The gradient '${r}' for backend is not registered`);kc.delete(r)}function uD(r,t){Ec(r).forEach(o=>{let n=Object.assign({},o,{backendName:t});Rp(n)})}function rh(r,t){return`${t}_${r}`}var y={};At(y,{arraysEqual:()=>Qe,assert:()=>k,assertNonNegativeIntegerDimensions:()=>Nc,assertNonNull:()=>ur,assertShapesMatch:()=>Wt,bytesFromStringArray:()=>Yd,bytesPerElement:()=>hu,checkConversionForErrors:()=>Xd,clamp:()=>bp,computeStrides:()=>so,createScalarValue:()=>yD,createShuffledIndices:()=>qA,decodeString:()=>Pp,distSquared:()=>zA,encodeString:()=>js,fetch:()=>CD,fingerPrint64:()=>xD,flatten:()=>Br,getArrayFromDType:()=>Kd,getTypedArrayFromDType:()=>qd,hasEncodingLoss:()=>jA,hexToLong:()=>$c,indexToLoc:()=>QA,inferDtype:()=>Cp,inferFromImplicitShape:()=>XA,isBoolean:()=>ib,isFunction:()=>no,isInt:()=>cn,isNumber:()=>pb,isPromise:()=>vc,isScalarShape:()=>WA,isString:()=>Gr,isTypedArray:()=>me,isValidDtype:()=>jd,locToIndex:()=>ZA,makeOnesTypedArray:()=>wc,makeZerosNestedTypedArray:()=>YA,makeZerosTypedArray:()=>Sp,nearestDivisor:()=>Tp,nearestLargerEven:()=>BA,now:()=>vi,parseAxisParam:()=>ce,randUniform:()=>VA,repeatedTry:()=>KA,rightPad:()=>ga,shuffle:()=>ab,shuffleCombo:()=>MA,sizeFromShape:()=>It,sizeToSquarishShape:()=>HA,squeezeShape:()=>Hd,sum:()=>GA,swap:()=>du,tanh:()=>UA,toNestedArray:()=>ha,toTypedArray:()=>Op});var ah=Ud(wb());var Ni=ah.default||ah;function $c(r){return Ni.fromString(r,!0,16)}var vb=$c("c3a5c85c97cb3127"),wi=$c("b492b66fbe98f273"),Me=$c("9ae16a3b2f90404f");function sh(r){return r.xor(r.shru(47))}function Ib(r,t,e){let o=r.slice(t,t+e);return Ni.fromBytes(Array.from(o),!0,!0)}function Kt(r,t){return Ib(r,t,8)}function Nb(r,t){return Ib(r,t,4)}function be(r,t){return t===0?r:r.shru(t).or(r.shl(64-t))}function Xs(r,t,e=$c("9ddfea08eb382d69")){let o=r.xor(t).mul(e);o=o.xor(o.shru(47));let n=t.xor(o).mul(e);return n=n.xor(n.shru(47)),n=n.mul(e),n}function fD(r,t,e,o,n,s){n=n.add(r),s=be(s.add(n).add(o),21);let a=n;return n=n.add(t),n=n.add(e),s=s.add(be(n,44)),[n.add(o),s.add(a)]}function bu(r,t,e,o){return fD(Kt(r,t),Kt(r,t+8),Kt(r,t+16),Kt(r,t+24),e,o)}function dD(r,t=r.length){if(t>=8){let e=Me.add(t*2),o=Kt(r,0).add(Me),n=Kt(r,t-8),s=be(n,37).mul(e).add(o),a=be(o,25).add(n).mul(e);return Xs(s,a,e)}if(t>=4){let e=Me.add(t*2),o=Nb(r,0);return Xs(o.shl(3).add(t),Nb(r,t-4),e)}if(t>0){let e=r[0],o=r[t>>1],n=r[t-1],s=e+(o<<8),a=t+(n<<2);return sh(Me.mul(s).xor(vb.mul(a))).mul(Me)}return Me}function hD(r,t=r.length){let e=Me.add(t*2),o=Kt(r,0).mul(wi),n=Kt(r,8),s=Kt(r,t-8).mul(e),a=Kt(r,t-16).mul(Me);return Xs(be(o.add(n),43).add(be(s,30)).add(a),o.add(be(n.add(Me),18)).add(s),e)}function gD(r,t=r.length){let e=Me.add(t*2),o=Kt(r,0).mul(Me),n=Kt(r,8),s=Kt(r,t-8).mul(e),a=Kt(r,t-16).mul(Me),i=be(o.add(n),43).add(be(s,30)).add(a),p=Xs(i,o.add(be(n.add(Me),18)).add(s),e),c=Kt(r,16).mul(e),l=Kt(r,24),u=i.add(Kt(r,t-32)).mul(e),m=p.add(Kt(r,t-24)).mul(e);return Xs(be(c.add(l),43).add(be(u,30)).add(m),c.add(be(l.add(o),18)).add(u),e)}function xD(r,t=r.length){let e=Ni.fromNumber(81,!0);if(t<=32)return t<=16?dD(r,t):hD(r,t);if(t<=64)return gD(r,t);let o=e,n=e.mul(wi).add(113),s=sh(n.mul(Me).add(113)).mul(Me),a=[Ni.UZERO,Ni.UZERO],i=[Ni.UZERO,Ni.UZERO];o=o.mul(Me).add(Kt(r,0));let p=0,c=(t-1>>6)*64,l=c+(t-1&63)-63;do o=be(o.add(n).add(a[0]).add(Kt(r,p+8)),37).mul(wi),n=be(n.add(a[1]).add(Kt(r,p+48)),42).mul(wi),o=o.xor(i[1]),n=n.add(a[0]).add(Kt(r,p+40)),s=be(s.add(i[0]),33).mul(wi),a=bu(r,p,a[1].mul(wi),o.add(i[0])),i=bu(r,p+32,s.add(i[1]),n.add(Kt(r,p+16))),[s,o]=[o,s],p+=64;while(p!==c);let u=wi.add(s.and(255).shl(1));return p=l,i[0]=i[0].add(t-1&63),a[0]=a[0].add(i[0]),i[0]=i[0].add(a[0]),o=be(o.add(n).add(a[0]).add(Kt(r,p+8)),37).mul(u),n=be(n.add(a[1]).add(Kt(r,p+48)),42).mul(u),o=o.xor(i[1].mul(9)),n=n.add(a[0].mul(9).add(Kt(r,p+40))),s=be(s.add(i[0]),33).mul(u),a=bu(r,p,a[1].mul(u),o.add(i[0])),i=bu(r,p+32,s.add(i[1]),n.add(Kt(r,p+16))),[s,o]=[o,s],Xs(Xs(a[0],i[0],u).add(sh(n).mul(vb)).add(s),Xs(a[1],i[1],u).add(o),u)}function yD(r,t){return t==="string"?js(r):Op([r],t)}function bD(r,t){return r instanceof Float32Array&&t==="float32"||r instanceof Int32Array&&t==="int32"||r instanceof Uint8Array&&t==="bool"}function Op(r,t){if(t==="string")throw new Error("Cannot convert a string[] to a TypedArray");if(Array.isArray(r)&&(r=Br(r)),_().getBool("DEBUG")&&Xd(r,t),bD(r,t))return r;if(t==null||t==="float32"||t==="complex64")return new Float32Array(r);if(t==="int32")return new Int32Array(r);if(t==="bool"){let e=new Uint8Array(r.length);for(let o=0;o<e.length;++o)Math.round(r[o])!==0&&(e[o]=1);return e}else throw new Error(`Unknown data type ${t}`)}function vi(){return _().platform.now()}function CD(r,t){return _().platform.fetch(r,t)}function js(r,t="utf-8"){return t=t||"utf-8",_().platform.encode(r,t)}function Pp(r,t="utf-8"){return t=t||"utf-8",_().platform.decode(r,t)}var Cu=class{constructor(t,e){this.backendTimer=t,this.logger=e,e==null&&(this.logger=new ih)}profileKernel(t,e,o){let n,s=()=>{n=o()},a,i=vi();if(this.backendTimer.timerAvailable())a=this.backendTimer.time(s);else{s();for(let c of n)c.dataSync();a=Promise.resolve({kernelMs:vi()-i})}if(_().getBool("CHECK_COMPUTATION_FOR_ERRORS"))for(let c=0;c<n.length;c++){let l=n[c];l.data().then(u=>{TD(u,l.dtype,t)})}return{kernelName:t,outputs:n,inputs:e,timeMs:a.then(c=>c.kernelMs),extraInfo:a.then(c=>c.getExtraProfileInfo!=null?c.getExtraProfileInfo():"")}}logKernelProfile(t){let{kernelName:e,outputs:o,timeMs:n,inputs:s,extraInfo:a}=t;o.forEach(i=>{Promise.all([i.data(),n,a]).then(p=>{this.logger.logKernelProfile(e,i,p[0],p[1],s,p[2])})})}};function TD(r,t,e){if(t!=="float32")return!1;for(let o=0;o<r.length;o++){let n=r[o];if(isNaN(n)||!isFinite(n))return console.warn(`Found ${n} in the result of '${e}'`),!0}return!1}var ih=class{logKernelProfile(t,e,o,n,s,a){let i=typeof n=="number"?ga(`${n}ms`,9):n.error,p=ga(t,25),c=e.rank,l=e.size,u=ga(e.shape.toString(),14),m="";for(let f in s){let d=s[f];if(d!=null){let g=d.shape||e.shape,h=g.length;m+=`${f}: ${h}D ${h>0?g:""} `}}console.log(`%c${p}	%c${i}	%c${c}D ${u}	%c${l}	%c${m}	%c${a}`,"font-weight:bold","color:red","color:blue","color: orange","color: green","color: steelblue")}};function kb(r,t,e){let o={},n={};for(let p=0;p<t.length;p++)o[t[p].id]=!0;for(let p=0;p<r.length;p++){let c=r[p],l=c.inputs;for(let u in l){let m=l[u],f=!1;for(let d=0;d<t.length;d++)if(o[m.id]){c.outputs.forEach(g=>o[g.id]=!0),f=!0,n[c.id]=!0;break}if(f)break}}let s={};s[e.id]=!0;let a={};for(let p=r.length-1;p>=0;p--){let c=r[p],l=c.inputs;for(let u=0;u<c.outputs.length;u++)if(s[c.outputs[u].id]){for(let m in l)s[l[m].id]=!0,a[c.id]=!0;break}}let i=[];for(let p=0;p<r.length;p++){let c=r[p];if(n[c.id]&&a[c.id]){let l={};for(let m in c.inputs){let f=c.inputs[m];o[f.id]&&(l[m]=f)}let u=Object.assign({},c);u.inputs=l,u.outputs=c.outputs,i.push(u)}}return i}function Eb(r,t,e,o){for(let n=t.length-1;n>=0;n--){let s=t[n],a=[];if(s.outputs.forEach(p=>{let c=r[p.id];c!=null?a.push(c):a.push(null)}),s.gradient==null)throw new Error(`Cannot compute gradient: gradient function not found for ${s.kernelName}.`);let i=s.gradient(a);for(let p in s.inputs){if(!(p in i))throw new Error(`Cannot backprop through input ${p}. Available gradients found: ${Object.keys(i)}.`);let c=e(()=>i[p]());if(c.dtype!=="float32")throw new Error(`Error in gradient for op ${s.kernelName}. The gradient of input ${p} must have 'float32' dtype, but has '${c.dtype}'`);let l=s.inputs[p];if(!Qe(c.shape,l.shape))throw new Error(`Error in gradient for op ${s.kernelName}. The gradient of input '${p}' has shape '${c.shape}', which does not match the shape of the input '${l.shape}'`);if(r[l.id]==null)r[l.id]=c;else{let u=r[l.id];r[l.id]=o(u,c),u.dispose()}}}}var $b=20,Ac=3,ph=7;function Ab(r,t,e,o){let n=so(t),s=SD(r,t,e,n),a=t.length,i=Tu(r,t,e,n,s),p=["Tensor"];return o&&(p.push(`  dtype: ${e}`),p.push(`  rank: ${a}`),p.push(`  shape: [${t}]`),p.push("  values:")),p.push(i.map(c=>"    "+c).join(`
`)),p.join(`
`)}function SD(r,t,e,o){let n=It(t),s=o[o.length-1],a=new Array(s).fill(0),i=t.length,p=e==="complex64"?Rc(r):r;if(i>1)for(let c=0;c<n/s;c++){let l=c*s;for(let u=0;u<s;u++)a[u]=Math.max(a[u],Dc(p[l+u],0,e).length)}return a}function Dc(r,t,e){let o;return Array.isArray(r)?o=`${parseFloat(r[0].toFixed(ph))} + ${parseFloat(r[1].toFixed(ph))}j`:Gr(r)?o=`'${r}'`:e==="bool"?o=Db(r):o=parseFloat(r.toFixed(ph)).toString(),ga(o,t)}function Db(r){return r===0?"false":"true"}function Tu(r,t,e,o,n,s=!0){let a=e==="complex64"?2:1,i=t[0],p=t.length;if(p===0){if(e==="complex64"){let g=Rc(r);return[Dc(g[0],0,e)]}return e==="bool"?[Db(r[0])]:[r[0].toString()]}if(p===1){if(i>$b){let h=Ac*a,x=Array.from(r.slice(0,h)),b=Array.from(r.slice((i-Ac)*a,i*a));return e==="complex64"&&(x=Rc(x),b=Rc(b)),["["+x.map((S,w)=>Dc(S,n[w],e)).join(", ")+", ..., "+b.map((S,w)=>Dc(S,n[i-Ac+w],e)).join(", ")+"]"]}return["["+(e==="complex64"?Rc(r):Array.from(r)).map((h,x)=>Dc(h,n[x],e)).join(", ")+"]"]}let c=t.slice(1),l=o.slice(1),u=o[0]*a,m=[];if(i>$b){for(let g=0;g<Ac;g++){let h=g*u,x=h+u;m.push(...Tu(r.slice(h,x),c,e,l,n,!1))}m.push("...");for(let g=i-Ac;g<i;g++){let h=g*u,x=h+u;m.push(...Tu(r.slice(h,x),c,e,l,n,g===i-1))}}else for(let g=0;g<i;g++){let h=g*u,x=h+u;m.push(...Tu(r.slice(h,x),c,e,l,n,g===i-1))}let f=p===2?",":"";m[0]="["+m[0]+f;for(let g=1;g<m.length-1;g++)m[g]=" "+m[g]+f;let d=`,
`;for(let g=2;g<p;g++)d+=`
`;return m[m.length-1]=" "+m[m.length-1]+"]"+(s?"":d),m}function Rc(r){let t=[];for(let e=0;e<r.length;e+=2)t.push([r[e],r[e+1]]);return t}var _t=class{constructor(t,e,o){if(this.dtype=e,this.shape=t.slice(),this.size=It(t),o!=null){let n=o.length;k(n===this.size,()=>`Length of values '${n}' does not match the size inferred by the shape '${this.size}'.`)}if(e==="complex64")throw new Error("complex64 dtype TensorBuffers are not supported. Please create a TensorBuffer for the real and imaginary parts separately and call tf.complex(real, imag).");this.values=o||Kd(e,this.size),this.strides=so(t)}set(t,...e){e.length===0&&(e=[0]),k(e.length===this.rank,()=>`The number of provided coordinates (${e.length}) must match the rank (${this.rank})`);let o=this.locToIndex(e);this.values[o]=t}get(...t){t.length===0&&(t=[0]);let e=0;for(let n of t){if(n<0||n>=this.shape[e]){let s=`Requested out of range element at ${t}.   Buffer shape=${this.shape}`;throw new Error(s)}e++}let o=t[t.length-1];for(let n=0;n<t.length-1;++n)o+=this.strides[n]*t[n];return this.values[o]}locToIndex(t){if(this.rank===0)return 0;if(this.rank===1)return t[0];let e=t[t.length-1];for(let o=0;o<t.length-1;++o)e+=this.strides[o]*t[o];return e}indexToLoc(t){if(this.rank===0)return[];if(this.rank===1)return[t];let e=new Array(this.shape.length);for(let o=0;o<e.length-1;++o)e[o]=Math.floor(t/this.strides[o]),t-=e[o]*this.strides[o];return e[e.length-1]=t,e}get rank(){return this.shape.length}toTensor(){return qr().makeTensor(this.values,this.shape,this.dtype)}},qr=null,Lp=null,wD=null;function Rb(r){qr=r}function Fb(r){Lp=r}function _b(r){wD=r}var Rt=class{constructor(t,e,o,n){this.kept=!1,this.isDisposedInternal=!1,this.shape=t.slice(),this.dtype=e||"float32",this.size=It(t),this.strides=so(t),this.dataId=o,this.id=n,this.rankType=this.rank<5?this.rank.toString():"higher"}get rank(){return this.shape.length}async buffer(){let t=await this.data();return Lp.buffer(this.shape,this.dtype,t)}bufferSync(){return Lp.buffer(this.shape,this.dtype,this.dataSync())}async array(){let t=await this.data();return ha(this.shape,t,this.dtype==="complex64")}arraySync(){return ha(this.shape,this.dataSync(),this.dtype==="complex64")}async data(){this.throwIfDisposed();let t=qr().read(this.dataId);if(this.dtype==="string"){let e=await t;try{return e.map(o=>Pp(o))}catch{throw new Error("Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().")}}return t}dataToGPU(t){return this.throwIfDisposed(),qr().readToGPU(this.dataId,t)}dataSync(){this.throwIfDisposed();let t=qr().readSync(this.dataId);if(this.dtype==="string")try{return t.map(e=>Pp(e))}catch{throw new Error("Failed to decode the string bytes into utf-8. To get the original bytes, call tensor.bytes().")}return t}async bytes(){this.throwIfDisposed();let t=await qr().read(this.dataId);return this.dtype==="string"?t:new Uint8Array(t.buffer)}dispose(){this.isDisposed||(qr().disposeTensor(this),this.isDisposedInternal=!0)}get isDisposed(){return this.isDisposedInternal}throwIfDisposed(){if(this.isDisposed)throw new Error("Tensor is disposed.")}print(t=!1){return Lp.print(this,t)}clone(){return this.throwIfDisposed(),Lp.clone(this)}toString(t=!1){let e=this.dataSync();return Ab(e,this.shape,this.dtype,t)}cast(t){return this.throwIfDisposed(),Lp.cast(this,t)}variable(t=!0,e,o){return this.throwIfDisposed(),qr().makeVariable(this,t,e,o)}};Object.defineProperty(Rt,Symbol.hasInstance,{value:r=>!!r&&r.data!=null&&r.dataSync!=null&&r.throwIfDisposed!=null});function A(){return Ic("Tensor",()=>Rt)}A();var Ho=class extends Rt{constructor(t,e,o,n){super(t.shape,t.dtype,t.dataId,n),this.trainable=e,this.name=o}assign(t){if(t.dtype!==this.dtype)throw new Error(`dtype of the new value (${t.dtype}) and previous value (${this.dtype}) must match`);if(!Qe(t.shape,this.shape))throw new Error(`shape of the new value (${t.shape}) and previous value (${this.shape}) must match`);qr().disposeTensor(this),this.dataId=t.dataId,qr().incRef(this,null)}dispose(){qr().disposeVariable(this),this.isDisposedInternal=!0}};Object.defineProperty(Ho,Symbol.hasInstance,{value:r=>r instanceof Rt&&r.assign!=null&&r.assign instanceof Function});var dh={};At(dh,{assertTypesMatch:()=>fh,getTensorsInContainer:()=>Fc,isTensorInList:()=>vD,makeTypesMatch:()=>Nt});var Su;(function(r){r.R0="R0",r.R1="R1",r.R2="R2",r.R3="R3",r.R4="R4",r.R5="R5",r.R6="R6"})(Su||(Su={}));var ch;(function(r){r.float32="float32",r.int32="int32",r.bool="int32",r.complex64="complex64"})(ch||(ch={}));var lh;(function(r){r.float32="float32",r.int32="int32",r.bool="bool",r.complex64="complex64"})(lh||(lh={}));var uh;(function(r){r.float32="float32",r.int32="float32",r.bool="float32",r.complex64="complex64"})(uh||(uh={}));var mh;(function(r){r.float32="complex64",r.int32="complex64",r.bool="complex64",r.complex64="complex64"})(mh||(mh={}));var ND={float32:uh,int32:ch,bool:lh,complex64:mh};function ne(r,t){if(r==="string"||t==="string"){if(r==="string"&&t==="string")return"string";throw new Error(`Can not upcast ${r} with ${t}`)}return ND[r][t]}function Ys(r){return ne(r,"int32")}function Nt(r,t){if(r.dtype===t.dtype)return[r,t];let e=ne(r.dtype,t.dtype);return[r.cast(e),t.cast(e)]}function fh(r,t){k(r.dtype===t.dtype,()=>`The dtypes of the first(${r.dtype}) and second(${t.dtype}) input must match`)}function vD(r,t){return t.some(e=>e.id===r.id)}function Fc(r){let t=[];return Ob(r,t,new Set),t}function Ob(r,t,e){if(r==null)return;if(r instanceof Rt){t.push(r);return}if(!ID(r))return;let o=r;for(let n in o){let s=o[n];e.has(s)||(e.add(s),Ob(s,t,e))}}function ID(r){return Array.isArray(r)||typeof r=="object"}function hh(r){return r.kernelName!=null}var wu=class{constructor(){this.registeredVariables={},this.nextTapeNodeId=0,this.numBytes=0,this.numTensors=0,this.numStringTensors=0,this.numDataBuffers=0,this.gradientDepth=0,this.kernelDepth=0,this.scopeStack=[],this.numDataMovesStack=[],this.nextScopeId=0,this.tensorInfo=new WeakMap,this.profiling=!1,this.activeProfile={newBytes:0,newTensors:0,peakBytes:0,kernels:[],result:null,get kernelNames(){return Array.from(new Set(this.kernels.map(t=>t.name)))}}}dispose(){for(let t in this.registeredVariables)this.registeredVariables[t].dispose()}},_c=class r{constructor(t){this.ENV=t,this.registry={},this.registryFactory={},this.pendingBackendInitId=0,this.state=new wu}async ready(){if(this.pendingBackendInit!=null)return this.pendingBackendInit.then(()=>{});if(this.backendInstance!=null)return;let t=this.getSortedBackends();for(let e=0;e<t.length;e++){let o=t[e];if(await this.initializeBackend(o).success){await this.setBackend(o);return}}throw new Error("Could not initialize any backends, all backend initializations failed.")}get backend(){if(this.pendingBackendInit!=null)throw new Error(`Backend '${this.backendName}' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods`);if(this.backendInstance==null){let{name:t,asyncInit:e}=this.initializeBackendsAndReturnBest();if(e)throw new Error(`The highest priority backend '${t}' has not yet been initialized. Make sure to await tf.ready() or await tf.setBackend() before calling other methods`);this.setBackend(t)}return this.backendInstance}backendNames(){return Object.keys(this.registryFactory)}findBackend(t){if(!(t in this.registry))if(t in this.registryFactory){let{asyncInit:e}=this.initializeBackend(t);if(e)return null}else return null;return this.registry[t]}findBackendFactory(t){return t in this.registryFactory?this.registryFactory[t].factory:null}registerBackend(t,e,o=1){return t in this.registryFactory?(Uo(`${t} backend was already registered. Reusing existing backend factory.`),!1):(this.registryFactory[t]={factory:e,priority:o},!0)}async setBackend(t){if(this.registryFactory[t]==null)throw new Error(`Backend name '${t}' not found in registry`);if(this.backendName=t,this.registry[t]==null){this.backendInstance=null;let{success:e,asyncInit:o}=this.initializeBackend(t);if(!(o?await e:e))return!1}return this.backendInstance=this.registry[t],this.setupRegisteredKernels(),this.profiler=new Cu(this.backendInstance),!0}setupRegisteredKernels(){Ec(this.backendName).forEach(e=>{e.setupFunc!=null&&e.setupFunc(this.backendInstance)})}disposeRegisteredKernels(t){Ec(t).forEach(o=>{o.disposeFunc!=null&&o.disposeFunc(this.registry[t])})}initializeBackend(t){let e=this.registryFactory[t];if(e==null)throw new Error(`Cannot initialize backend ${t}, no registration found.`);try{let o=e.factory();if(o&&!(o instanceof oo)&&typeof o.then=="function"){let n=++this.pendingBackendInitId,s=o.then(a=>n<this.pendingBackendInitId?!1:(this.registry[t]=a,this.pendingBackendInit=null,!0)).catch(a=>(n<this.pendingBackendInitId||(this.pendingBackendInit=null,Uo(`Initialization of backend ${t} failed`),Uo(a.stack||a.message)),!1));return this.pendingBackendInit=s,{success:s,asyncInit:!0}}else return this.registry[t]=o,{success:!0,asyncInit:!1}}catch(o){return Uo(`Initialization of backend ${t} failed`),Uo(o.stack||o.message),{success:!1,asyncInit:!1}}}removeBackend(t){if(!(t in this.registryFactory))throw new Error(`${t} backend not found in registry`);this.backendName===t&&this.pendingBackendInit!=null&&this.pendingBackendInitId++,t in this.registry&&(this.disposeRegisteredKernels(t),this.registry[t].dispose(),delete this.registry[t]),delete this.registryFactory[t],this.backendName===t&&(this.pendingBackendInit=null,this.backendName=null,this.backendInstance=null)}getSortedBackends(){if(Object.keys(this.registryFactory).length===0)throw new Error("No backend found in registry.");return Object.keys(this.registryFactory).sort((t,e)=>this.registryFactory[e].priority-this.registryFactory[t].priority)}initializeBackendsAndReturnBest(){let t=this.getSortedBackends();for(let e=0;e<t.length;e++){let o=t[e],{success:n,asyncInit:s}=this.initializeBackend(o);if(s||n)return{name:o,asyncInit:s}}throw new Error("Could not initialize any backends, all backend initializations failed.")}moveData(t,e){let o=this.state.tensorInfo.get(e),n=o.backend,s=this.readSync(e),a=n.refCount(e);n.disposeData(e,!0),o.backend=t,t.move(e,s,o.shape,o.dtype,a),this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack[this.state.numDataMovesStack.length-1]++}tidy(t,e){let o=null;if(e==null){if(typeof t!="function")throw new Error("Please provide a function to tidy()");e=t}else{if(typeof t!="string"&&!(t instanceof String))throw new Error("When calling with two arguments, the first argument to tidy() must be a string");if(typeof e!="function")throw new Error("When calling with two arguments, the 2nd argument to tidy() must be a function");o=t}let n;return this.scopedRun(()=>this.startScope(o),()=>this.endScope(n),()=>(n=e(),n instanceof Promise&&console.error("Cannot return a Promise inside of tidy."),n))}scopedRun(t,e,o){t();try{let n=o();return e(),n}catch(n){throw e(),n}}nextTensorId(){return r.nextTensorId++}nextVariableId(){return r.nextVariableId++}clone(t){let e=v.runKernel(zr,{x:t}),o={x:t},n=a=>({x:()=>{let i="float32",p={x:a},c={dtype:i};return v.runKernel(Vr,p,c)}}),s=[];return this.addTapeNode(this.state.activeScope.name,o,[e],n,s,{}),e}runKernel(t,e,o){if(this.backendName==null&&this.backend,!(Dp(t,this.backendName)!=null))throw new Error(`Kernel '${t}' not registered for backend '${this.backendName}'`);return this.runKernelFunc({kernelName:t,inputs:e,attrs:o})}shouldCheckForMemLeaks(){return this.ENV.getBool("IS_TEST")}checkKernelForMemLeak(t,e,o){let n=this.backend.numDataIds(),s=0;o.forEach(p=>{s+=p.dtype==="complex64"?3:1});let a=this.state.numDataMovesStack[this.state.numDataMovesStack.length-1],i=n-e-s-a;if(i>0)throw new Error(`Backend '${this.backendName}' has an internal memory leak (${i} data ids) after running '${t}'`)}runKernelFunc(t){let e,o=[],n=this.isTapeOn(),s=this.state.numBytes,a=this.state.numTensors;this.shouldCheckForMemLeaks()&&this.state.numDataMovesStack.push(0);let i;this.backendName==null&&this.backend;let p,c=hh(t)?t.kernelName:this.state.activeScope!=null?this.state.activeScope.name:"";if(hh(t)){let{kernelName:d,inputs:g,attrs:h}=t;this.backendName==null&&this.backend;let x=Dp(d,this.backendName);k(x!=null,()=>`Cannot find registered kernel '${d}' for backend '${this.backendName}'`),i=()=>{let b=this.backend.numDataIds();p=x.kernelFunc({inputs:g,attrs:h,backend:this.backend});let S=Array.isArray(p)?p:[p];this.shouldCheckForMemLeaks()&&this.checkKernelForMemLeak(d,b,S);let w=S.map(E=>E.rank!=null?E:this.makeTensorFromTensorInfo(E));if(n){let E=this.getTensorsForGradient(d,g,w);o=this.saveTensorsForBackwardMode(E)}return w}}else{let{forwardFunc:d}=t,g=h=>{n&&(o=h.map(x=>this.keep(this.clone(x))))};i=()=>{let h=this.backend.numDataIds();p=this.tidy(()=>d(this.backend,g));let x=Array.isArray(p)?p:[p];return this.shouldCheckForMemLeaks()&&this.checkKernelForMemLeak(c,h,x),x}}let{inputs:l,attrs:u}=t,m=hh(t)?null:t.backwardsFunc,f;return this.scopedRun(()=>this.state.kernelDepth++,()=>this.state.kernelDepth--,()=>{!this.ENV.getBool("DEBUG")&&!this.state.profiling?e=i():(f=this.profiler.profileKernel(c,l,()=>i()),this.ENV.getBool("DEBUG")&&this.profiler.logKernelProfile(f),e=f.outputs)}),n&&this.addTapeNode(c,l,e,m,o,u),this.state.profiling&&this.state.activeProfile.kernels.push({name:c,bytesAdded:this.state.numBytes-s,totalBytesSnapshot:this.state.numBytes,tensorsAdded:this.state.numTensors-a,totalTensorsSnapshot:this.state.numTensors,inputShapes:Object.keys(l).map(d=>l[d]!=null?l[d].shape:null),outputShapes:e.map(d=>d.shape),kernelTimeMs:f.timeMs,extraInfo:f.extraInfo}),Array.isArray(p)?e:e[0]}saveTensorsForBackwardMode(t){return t.map(o=>this.keep(this.clone(o)))}getTensorsForGradient(t,e,o){let n=xu(t);if(n!=null){let s=n.inputsToSave||[],a=n.outputsToSave||[],i;n.saveAllInputs?(k(Array.isArray(e),()=>"saveAllInputs is true, expected inputs to be an array."),i=Object.keys(e).map(c=>e[c])):i=s.map(c=>e[c]);let p=o.filter((c,l)=>a[l]);return i.concat(p)}return[]}makeTensor(t,e,o,n){if(t==null)throw new Error("Values passed to engine.makeTensor() are null");o=o||"float32",n=n||this.backend;let s=t;o==="string"&&Gr(t[0])&&(s=t.map(p=>js(p)));let a=n.write(s,e,o),i=new Rt(e,o,a,this.nextTensorId());if(this.trackTensor(i,n),o==="string"){let p=this.state.tensorInfo.get(a),c=Yd(s);this.state.numBytes+=c-p.bytes,p.bytes=c}return i}makeTensorFromDataId(t,e,o,n){o=o||"float32";let s={dataId:t,shape:e,dtype:o};return this.makeTensorFromTensorInfo(s,n)}makeTensorFromTensorInfo(t,e){let{dataId:o,shape:n,dtype:s}=t,a=new Rt(n,s,o,this.nextTensorId());return this.trackTensor(a,e),a}makeVariable(t,e=!0,o,n){o=o||this.nextVariableId().toString(),n!=null&&n!==t.dtype&&(t=t.cast(n));let s=new Ho(t,e,o,this.nextTensorId());if(this.state.registeredVariables[s.name]!=null)throw new Error(`Variable with name ${s.name} was already registered`);return this.state.registeredVariables[s.name]=s,this.incRef(s,this.backend),s}trackTensor(t,e){this.state.numTensors++,t.dtype==="string"&&this.state.numStringTensors++;let o=0;t.dtype!=="complex64"&&t.dtype!=="string"&&(o=t.size*hu(t.dtype)),this.state.numBytes+=o,this.state.tensorInfo.has(t.dataId)||(this.state.numDataBuffers++,this.state.tensorInfo.set(t.dataId,{backend:e||this.backend,dtype:t.dtype,shape:t.shape,bytes:o})),t instanceof Ho||this.track(t)}incRef(t,e){this.trackTensor(t,e),this.backend.incRef(t.dataId)}removeDataId(t,e){this.state.tensorInfo.has(t)&&this.state.tensorInfo.get(t).backend===e&&(this.state.tensorInfo.delete(t),this.state.numDataBuffers--)}disposeTensor(t){if(!this.state.tensorInfo.has(t.dataId))return;let e=this.state.tensorInfo.get(t.dataId);if(this.state.numTensors--,t.dtype==="string"&&(this.state.numStringTensors--,this.state.numBytes-=e.bytes),t.dtype!=="complex64"&&t.dtype!=="string"){let o=t.size*hu(t.dtype);this.state.numBytes-=o}e.backend.disposeData(t.dataId)&&this.removeDataId(t.dataId,e.backend)}disposeVariables(){for(let t in this.state.registeredVariables){let e=this.state.registeredVariables[t];this.disposeVariable(e)}}disposeVariable(t){this.disposeTensor(t),this.state.registeredVariables[t.name]!=null&&delete this.state.registeredVariables[t.name]}memory(){let t=this.backend.memory();return t.numTensors=this.state.numTensors,t.numDataBuffers=this.state.numDataBuffers,t.numBytes=this.state.numBytes,this.state.numStringTensors>0&&(t.unreliable=!0,t.reasons==null&&(t.reasons=[]),t.reasons.push("Memory usage by string tensors is approximate (2 bytes per character)")),t}async profile(t){this.state.profiling=!0;let e=this.state.numBytes,o=this.state.numTensors;this.state.activeProfile.kernels=[],this.state.activeProfile.result=await t(),this.state.profiling=!1,this.state.activeProfile.peakBytes=Math.max(...this.state.activeProfile.kernels.map(n=>n.totalBytesSnapshot)),this.state.activeProfile.newBytes=this.state.numBytes-e,this.state.activeProfile.newTensors=this.state.numTensors-o;for(let n of this.state.activeProfile.kernels)n.kernelTimeMs=await n.kernelTimeMs,n.extraInfo=await n.extraInfo;return this.state.activeProfile}isTapeOn(){return this.state.gradientDepth>0&&this.state.kernelDepth===0}addTapeNode(t,e,o,n,s,a){let i={id:this.state.nextTapeNodeId++,kernelName:t,inputs:e,outputs:o,saved:s},p=xu(t);p!=null&&(n=p.gradFunc),n!=null&&(i.gradient=c=>(c=c.map((l,u)=>{if(l==null){let m=o[u],f=Sp(m.size,m.dtype);return this.makeTensor(f,m.shape,m.dtype)}return l}),n(c.length>1?c:c[0],s,a))),this.state.activeTape.push(i)}keep(t){return t.kept=!0,t}startTape(){this.state.gradientDepth===0&&(this.state.activeTape=[]),this.state.gradientDepth++}endTape(){this.state.gradientDepth--}startScope(t){let e={track:[],name:"unnamed scope",id:this.state.nextScopeId++};t&&(e.name=t),this.state.scopeStack.push(e),this.state.activeScope=e}endScope(t){let e=Fc(t),o=new Set(e.map(s=>s.id));for(let s=0;s<this.state.activeScope.track.length;s++){let a=this.state.activeScope.track[s];!a.kept&&!o.has(a.id)&&a.dispose()}let n=this.state.scopeStack.pop();this.state.activeScope=this.state.scopeStack.length===0?null:this.state.scopeStack[this.state.scopeStack.length-1],e.forEach(s=>{!s.kept&&s.scopeId===n.id&&this.track(s)})}gradients(t,e,o,n=!1){if(k(e.length>0,()=>"gradients() received an empty list of xs."),o!=null&&o.dtype!=="float32")throw new Error(`dy must have 'float32' dtype, but has '${o.dtype}'`);let s=this.scopedRun(()=>this.startTape(),()=>this.endTape(),()=>this.tidy("forward",t));k(s instanceof Rt,()=>"The result y returned by f() must be a tensor.");let a=kb(this.state.activeTape,e,s);if(!n&&a.length===0&&e.length>0)throw new Error("Cannot compute gradient of y=f(x) with respect to x. Make sure that the f you passed encloses all operations that lead from x to y.");return this.tidy("backward",()=>{let i={};i[s.id]=o==null?kD(s.shape):o,Eb(i,a,c=>this.tidy(c),ED);let p=e.map(c=>i[c.id]);return this.state.gradientDepth===0&&(this.state.activeTape.forEach(c=>{for(let l of c.saved)l.dispose()}),this.state.activeTape=null),{value:s,grads:p}})}customGrad(t){return k(no(t),()=>"The f passed in customGrad(f) must be a function."),(...e)=>{k(e.every(i=>i instanceof Rt),()=>"The args passed in customGrad(f)(x1, x2,...) must all be tensors");let o,n={};e.forEach((i,p)=>{n[p]=i});let s=(i,p)=>(o=t(...e,p),k(o.value instanceof Rt,()=>"The function f passed in customGrad(f) must return an object where `obj.value` is a tensor"),k(no(o.gradFunc),()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function."),o.value),a=(i,p)=>{let c=o.gradFunc(i,p),l=Array.isArray(c)?c:[c];k(l.length===e.length,()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns the same number of tensors as inputs passed to f(...)."),k(l.every(m=>m instanceof Rt),()=>"The function f passed in customGrad(f) must return an object where `obj.gradFunc` is a function that returns a list of only tensors.");let u={};return l.forEach((m,f)=>{u[f]=()=>m}),u};return this.runKernelFunc({forwardFunc:s,backwardsFunc:a,inputs:n})}}readSync(t){return this.state.tensorInfo.get(t).backend.readSync(t)}read(t){return this.state.tensorInfo.get(t).backend.read(t)}readToGPU(t,e){return this.state.tensorInfo.get(t).backend.readToGPU(t,e)}async time(t){let e=vi(),o=await this.backend.time(t);return o.wallMs=vi()-e,o}track(t){return this.state.activeScope!=null&&(t.scopeId=this.state.activeScope.id,this.state.activeScope.track.push(t)),t}get registeredVariables(){return this.state.registeredVariables}reset(){this.pendingBackendInitId++,this.state.dispose(),this.ENV.reset(),this.state=new wu;for(let t in this.registry)this.disposeRegisteredKernels(t),this.registry[t].dispose(),delete this.registry[t];this.backendName=null,this.backendInstance=null,this.pendingBackendInit=null}};_c.nextTensorId=0;_c.nextVariableId=0;function kD(r){let t=wc(It(r),"float32");return v.makeTensor(t,r,"float32")}function gh(){let r=Qd();if(r._tfengine==null){let t=new wp(r);r._tfengine=new _c(t)}return ub(r._tfengine.ENV),Rb(()=>r._tfengine),r._tfengine}var v=gh();function ED(r,t){let e={a:r,b:t};return v.runKernel("Add",e)}function Ie(r,t){let e=r;if(me(r))return t==="string"?[]:[r.length];if(!Array.isArray(r))return[];let o=[];for(;Array.isArray(e)||me(e)&&t!=="string";)o.push(e.length),e=e[0];return Array.isArray(r)&&_().getBool("TENSORLIKE_CHECK_SHAPE_CONSISTENCY")&&Lb(r,o,[]),o}function Lb(r,t,e){if(e=e||[],!Array.isArray(r)&&!me(r)){k(t.length===0,()=>`Element arr[${e.join("][")}] is a primitive, but should be an array/TypedArray of ${t[0]} elements`);return}k(t.length>0,()=>`Element arr[${e.join("][")}] should be a primitive, but is an array of ${r.length} elements`),k(r.length===t[0],()=>`Element arr[${e.join("][")}] should have ${t[0]} elements, but has ${r.length} elements`);let o=t.slice(1);for(let n=0;n<r.length;++n)Lb(r[n],o,e.concat(n))}function Pb(r,t,e,o){if(r!=="string_or_numeric"){if(r==null)throw new Error("Expected dtype cannot be null.");if(r!=="numeric"&&r!==t||r==="numeric"&&t==="string")throw new Error(`Argument '${e}' passed to '${o}' must be ${r} tensor, but got ${t} tensor`)}}function C(r,t,e,o="numeric"){if(r instanceof Rt)return Pb(o,r.dtype,t,e),r;let n=Cp(r);if(n!=="string"&&["bool","int32","float32"].indexOf(o)>=0&&(n=o),Pb(o,n,t,e),r==null||!me(r)&&!Array.isArray(r)&&typeof r!="number"&&typeof r!="boolean"&&typeof r!="string"){let p=r==null?"null":r.constructor.name;throw new Error(`Argument '${t}' passed to '${e}' must be a Tensor or TensorLike, but got '${p}'`)}let s=Ie(r,n);!me(r)&&!Array.isArray(r)&&(r=[r]);let i=n!=="string"?Op(r,n):Br(r,[],!0);return v.makeTensor(i,s,n)}function Qn(r,t,e,o="numeric"){if(!Array.isArray(r))throw new Error(`Argument ${t} passed to ${e} must be a \`Tensor[]\` or \`TensorLike[]\``);return r.map((s,a)=>C(s,`${t}[${a}]`,e,o))}var Nu="__op";function N(r){let t=Object.keys(r);if(t.length!==1)throw new Error(`Please provide an object with a single key (operation name) mapping to a function. Got an object with ${t.length} keys.`);let e=t[0],o=r[e];e.endsWith("_")&&(e=e.substring(0,e.length-1)),e=e+Nu;let n=(...s)=>{v.startScope(e);try{let a=o(...s);return vc(a)&&console.error("Cannot return a Promise inside of tidy."),v.endScope(a),a}catch(a){throw v.endScope(null),a}};return Object.defineProperty(n,"name",{value:e,configurable:!0}),n}function $D(r){let t=C(r,"x","abs");if(t.dtype==="complex64"){let e={x:t};return v.runKernel(xn,e)}else{let e={x:t};return v.runKernel("Abs",e)}}var le=N({abs_:$D});function AD(r){let e={x:C(r,"x","acos")};return v.runKernel(ao,e)}var Oc=N({acos_:AD});function DD(r){let e={x:C(r,"x","acosh")};return v.runKernel(io,e)}var Pc=N({acosh_:DD});function RD(r,t){let e=C(r,"a","add"),o=C(t,"b","add");[e,o]=Nt(e,o);let n={a:e,b:o};return v.runKernel("Add",n)}var tt=N({add_:RD});function FD(r){k(Array.isArray(r),()=>"The argument passed to tf.addN() must be a list of tensors"),k(r.length>=1,()=>`Must pass at least one tensor to tf.addN(), but got ${r.length}`);let t=r.map((n,s)=>C(n,`tensors${s}`,"addN")),e=t[0];t.forEach(n=>{if(n.dtype!==e.dtype)throw new Error("All tensors passed to tf.addN() must have the same dtype")}),t.forEach(n=>{if(!Qe(n.shape,e.shape))throw new Error("All tensors passed to tf.addN() must have the same shape")});let o=t;return v.runKernel(ln,o)}var xh=N({addN_:FD});function _D(r,t=null,e=!1){let n={x:C(r,"x","all","bool")},s={axis:t,keepDims:e};return v.runKernel("All",n,s)}var Lc=N({all_:_D});function OD(r,t=null,e=!1){let n={x:C(r,"x","any","bool")},s={axis:t,keepDims:e};return v.runKernel("Any",n,s)}var Mc=N({any_:OD});function PD(r,t=0){let o={x:C(r,"x","argMax")},n={axis:t};return v.runKernel(un,o,n)}var Bc=N({argMax_:PD});function LD(r,t=0){let o={x:C(r,"x","argMin")},n={axis:t};return v.runKernel(mn,o,n)}var Gc=N({argMin_:LD});function MD(r){let e={x:C(r,"x","asin")};return v.runKernel(co,e)}var Vc=N({asin_:MD});function BD(r){let e={x:C(r,"x","asinh")};return v.runKernel(lo,e)}var zc=N({asinh_:BD});function GD(r){let e={x:C(r,"x","atan")};return v.runKernel(uo,e)}var Wc=N({atan_:GD});function VD(r,t){let e=C(r,"a","atan2"),o=C(t,"b","atan2");[e,o]=Nt(e,o);let n={a:e,b:o};return v.runKernel(fo,n)}var Uc=N({atan2_:VD});function zD(r){let e={x:C(r,"x","atanh")};return v.runKernel(mo,e)}var Hc=N({atanh_:zD});function WD(r,t){let e=C(r,"x","cast");if(!jd(t))throw new Error(`Failed to cast to unknown dtype ${t}`);if(t==="string"&&e.dtype!=="string"||t!=="string"&&e.dtype==="string")throw new Error("Only strings can be casted to strings");let o={x:e},n={dtype:t};return v.runKernel(Vr,o,n)}var X=N({cast_:WD});function UD(r,t,e,o,n="NHWC",s){let a=r[3],i=[...t,a],p=Bb(n);return ki(r,i,e,s,o,null,null,p)}function bh(r,t,e,o,n,s,a="channelsLast"){let[i,p]=vu(t),c;if(a==="channelsLast")c=[i,p,r[3],r[3]];else if(a==="channelsFirst")c=[i,p,r[1],r[1]];else throw new Error(`Unknown dataFormat ${a}`);return ki(r,c,e,o,n,s,!1,a)}function HD(r,t,e,o,n,s,a="NDHWC"){let[i,p,c]=yh(t),l,u;if(a==="NDHWC")u="channelsLast",l=[i,p,c,r[4],r[4]];else if(a==="NCDHW")u="channelsFirst",l=[i,p,c,r[1],r[1]];else throw new Error(`Unknown dataFormat ${a}`);return Mb(r,l,e,o,n,!1,u,s)}function ki(r,t,e,o,n,s,a=!1,i="channelsLast"){let[p,c,l,u]=[-1,-1,-1,-1];if(i==="channelsLast")[p,c,l,u]=r;else if(i==="channelsFirst")[p,u,c,l]=r;else throw new Error(`Unknown dataFormat ${i}`);let[m,f,,d]=t,[g,h]=vu(e),[x,b]=vu(o),S=Mp(m,x),w=Mp(f,b),{padInfo:E,outHeight:$,outWidth:D}=XD(n,c,l,g,h,S,w,s,i),F=a?d*u:d,P;return i==="channelsFirst"?P=[p,F,$,D]:i==="channelsLast"&&(P=[p,$,D,F]),{batchSize:p,dataFormat:i,inHeight:c,inWidth:l,inChannels:u,outHeight:$,outWidth:D,outChannels:F,padInfo:E,strideHeight:g,strideWidth:h,filterHeight:m,filterWidth:f,effectiveFilterHeight:S,effectiveFilterWidth:w,dilationHeight:x,dilationWidth:b,inShape:r,outShape:P,filterShape:t}}function Mb(r,t,e,o,n,s=!1,a="channelsLast",i){let[p,c,l,u,m]=[-1,-1,-1,-1,-1];if(a==="channelsLast")[p,c,l,u,m]=r;else if(a==="channelsFirst")[p,m,c,l,u]=r;else throw new Error(`Unknown dataFormat ${a}`);let[f,d,g,,h]=t,[x,b,S]=yh(e),[w,E,$]=yh(o),D=Mp(f,w),F=Mp(d,E),P=Mp(g,$),{padInfo:L,outDepth:M,outHeight:B,outWidth:G}=jD(n,c,l,u,x,b,S,D,F,P,i),z=s?h*m:h,V;return a==="channelsFirst"?V=[p,z,M,B,G]:a==="channelsLast"&&(V=[p,M,B,G,z]),{batchSize:p,dataFormat:a,inDepth:c,inHeight:l,inWidth:u,inChannels:m,outDepth:M,outHeight:B,outWidth:G,outChannels:z,padInfo:L,strideDepth:x,strideHeight:b,strideWidth:S,filterDepth:f,filterHeight:d,filterWidth:g,effectiveFilterDepth:D,effectiveFilterHeight:F,effectiveFilterWidth:P,dilationDepth:w,dilationHeight:E,dilationWidth:$,inShape:r,outShape:V,filterShape:t}}function qD(r,t,e,o,n){o==null&&(o=Ch(r,t,e));let s=r[0],a=r[1],i=Ii((s-t+2*o)/e+1,n),p=Ii((a-t+2*o)/e+1,n);return[i,p]}function KD(r,t,e,o,n,s){n==null&&(n=Ch(r,t,o));let a=r[0],i=r[1],p=r[2],c=Ii((a-t+2*n)/o+1,s),l=Ii((i-t+2*n)/o+1,s),u=Ii((p-t+2*n)/o+1,s);return[c,l,u,e]}function Ch(r,t,e,o=1){let n=Mp(t,o);return Math.floor((r[0]*(e-1)-e+n)/2)}function vu(r){return typeof r=="number"?[r,r,r]:r.length===2?[r[0],r[1],1]:r}function yh(r){return typeof r=="number"?[r,r,r]:r}function Mp(r,t){return t<=1?r:r+(r-1)*(t-1)}function XD(r,t,e,o,n,s,a,i,p){let c,l,u;if(typeof r=="number"){c={top:r,bottom:r,left:r,right:r,type:r===0?"VALID":"NUMBER"};let f=qD([t,e],s,o,r,i);l=f[0],u=f[1]}else if(r==="same"){l=Math.ceil(t/o),u=Math.ceil(e/n);let m=Math.max(0,(l-1)*o+s-t),f=Math.max(0,(u-1)*n+a-e),d=Math.floor(m/2),g=m-d,h=Math.floor(f/2),x=f-h;c={top:d,bottom:g,left:h,right:x,type:"SAME"}}else if(r==="valid")c={top:0,bottom:0,left:0,right:0,type:"VALID"},l=Math.ceil((t-s+1)/o),u=Math.ceil((e-a+1)/n);else if(typeof r=="object"){let m=p==="channelsLast"?r[1][0]:r[2][0],f=p==="channelsLast"?r[1][1]:r[2][1],d=p==="channelsLast"?r[2][0]:r[3][0],g=p==="channelsLast"?r[2][1]:r[3][1];c={top:m,bottom:f,left:d,right:g,type:m===0&&f===0&&d===0&&g===0?"VALID":"EXPLICIT"},l=Ii((t-s+m+f)/o+1,i),u=Ii((e-a+d+g)/n+1,i)}else throw Error(`Unknown padding parameter: ${r}`);return{padInfo:c,outHeight:l,outWidth:u}}function jD(r,t,e,o,n,s,a,i,p,c,l){let u,m,f,d;if(typeof r=="number"){u={top:r,bottom:r,left:r,right:r,front:r,back:r,type:r===0?"VALID":"NUMBER"};let h=KD([t,e,o,1],i,1,n,r,l);m=h[0],f=h[1],d=h[2]}else if(r==="same"){m=Math.ceil(t/n),f=Math.ceil(e/s),d=Math.ceil(o/a);let g=(m-1)*n+i-t,h=(f-1)*s+p-e,x=(d-1)*a+c-o,b=Math.floor(g/2),S=g-b,w=Math.floor(h/2),E=h-w,$=Math.floor(x/2),D=x-$;u={top:w,bottom:E,left:$,right:D,front:b,back:S,type:"SAME"}}else if(r==="valid")u={top:0,bottom:0,left:0,right:0,front:0,back:0,type:"VALID"},m=Math.ceil((t-i+1)/n),f=Math.ceil((e-p+1)/s),d=Math.ceil((o-c+1)/a);else throw Error(`Unknown padding parameter: ${r}`);return{padInfo:u,outDepth:m,outHeight:f,outWidth:d}}function Ii(r,t){if(!t)return Math.trunc(r);switch(t){case"round":return Math.round(r);case"ceil":return Math.ceil(r);case"floor":return Math.floor(r);default:throw new Error(`Unknown roundingMode ${t}`)}}function mr(r){let[t,e,o]=vu(r);return t===1&&e===1&&o===1}function Ce(r,t){return mr(r)||mr(t)}function Bb(r){if(r==="NHWC")return"channelsLast";if(r==="NCHW")return"channelsFirst";throw new Error(`Unknown dataFormat ${r}`)}function Gt(r,t,e){if(e!=null){if(typeof t=="string")throw Error(`Error in ${r}: pad must be an integer when using dimRoundingMode ${e} but got pad ${t}.`);if(typeof t=="number")k(cn(t),()=>`Error in ${r}: pad must be an integer when using dimRoundingMode ${e} but got pad ${t}.`);else if(typeof t=="object")t.forEach(o=>{o.forEach(n=>{k(cn(n),()=>`Error in ${r}: pad must be an integer when using dimRoundingMode ${e} but got pad ${n}.`)})});else throw Error(`Error in ${r}: Unknown padding parameter: ${t}`)}}function YD(r,t){let o={x:C(r,"x","reshape","string_or_numeric")},n={shape:t};return v.runKernel(Gn,o,n)}var R=N({reshape_:YD});function ZD(r,t,e,o,n){let s=C(r,"x","avgPool","float32"),a=1;k(Ce(e,a),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${e} and dilations '${a}'`);let i=s,p=!1;s.rank===3&&(p=!0,i=R(s,[1,s.shape[0],s.shape[1],s.shape[2]])),k(i.rank===4,()=>`Error in avgPool: x must be rank 4 but got rank ${i.rank}.`),Gt("avgPool",o,n);let c={x:i},l={filterSize:t,strides:e,pad:o,dimRoundingMode:n},u=v.runKernel(fn,c,l);return u=X(u,s.dtype),p?R(u,[u.shape[1],u.shape[2],u.shape[3]]):u}var Ei=N({avgPool_:ZD});function QD(r,t,e,o,n,s="NDHWC"){let a=C(r,"x","avgPool3d","float32"),i=a,p=!1;a.rank===4&&(p=!0,i=R(a,[1,a.shape[0],a.shape[1],a.shape[2],a.shape[3]])),k(i.rank===5,()=>`Error in avgPool3d: x must be rank 5 but got rank ${i.rank}.`),k(s==="NDHWC",()=>`Error in avgPool3d: Only NDHWC is currently supported, but got dataFormat of ${s}`),Gt("avgPool3d",o,n);let c={x:i},l={filterSize:t,strides:e,pad:o,dimRoundingMode:n,dataFormat:s},u=v.runKernel(dn,c,l);return u=X(u,i.dtype),p?R(u,[u.shape[1],u.shape[2],u.shape[3],u.shape[4]]):u}var Th=N({avgPool3d_:QD});function JD(r){let e={x:C(r,"x","clone","string_or_numeric")};return v.runKernel(zr,e)}var He=N({clone_:JD});function tR(r,t=0){k(r.length>=1,()=>"Pass at least one tensor to concat");let e=Qn(r,"tensors","concat","string_or_numeric");if(e[0].dtype==="complex64"&&e.forEach(s=>{if(s.dtype!=="complex64")throw new Error(`Cannot concatenate complex64 tensors with a tensor
          with dtype ${s.dtype}. `)}),e.length===1)return He(e[0]);let o=e,n={axis:t};return v.runKernel(yn,o,n)}var Lt=N({concat_:tR});function eR(r,t,e=!1,o=!1){let n=C(r,"a","matMul"),s=C(t,"b","matMul");[n,s]=Nt(n,s);let a={a:n,b:s},i={transposeA:e,transposeB:o};return v.runKernel(hn,a,i)}var Tt=N({matMul_:eR});function rR(r,t){let e=C(r,"a","mul"),o=C(t,"b","mul");[e,o]=Nt(e,o);let n={a:e,b:o};return v.runKernel($o,n)}var O=N({mul_:rR});function oR(r){let e={x:C(r,"x","sigmoid","float32")};return v.runKernel(Mo,e)}var qe=N({sigmoid_:oR});function nR(r,t,e){let o=C(r,"x","slice","string_or_numeric");if(o.rank===0)throw new Error("Slicing scalar is not possible");let n={x:o},s={begin:t,size:e};return v.runKernel(Hn,n,s)}var xt=N({slice_:nR});function sR(r){let e={x:C(r,"x","tanh","float32")};return v.runKernel(zo,e)}var Zs=N({tanh_:sR});function aR(r,t,e,o,n,s){let a=C(r,"forgetBias","basicLSTMCell"),i=C(t,"lstmKernel","basicLSTMCell"),p=C(e,"lstmBias","basicLSTMCell"),c=C(o,"data","basicLSTMCell"),l=C(n,"c","basicLSTMCell"),u=C(s,"h","basicLSTMCell"),m=Lt([c,u],1),f=Tt(m,i),d=tt(f,p),g=d.shape[0],h=d.shape[1]/4,x=[g,h],b=xt(d,[0,0],x),S=xt(d,[0,h],x),w=xt(d,[0,h*2],x),E=xt(d,[0,h*3],x),$=tt(O(qe(b),Zs(S)),O(l,qe(tt(a,w)))),D=O(Zs($),qe(E));return[$,D]}var Sh=N({basicLSTMCell_:aR});function iR(r,t,e){let o=C(r,"x","batchToSpaceND"),n=t.reduce((i,p)=>i*p);k(o.rank>=1+t.length,()=>`input rank is ${o.rank} but should be > than blockShape.length ${t.length}`),k(e.length===t.length,()=>`crops.length is ${e.length} but should be equal to blockShape.length  ${t.length}`),k(o.shape[0]%n===0,()=>`input tensor batch is ${o.shape[0]} but is not divisible by the product of the elements of blockShape ${t.join(" * ")} === ${n}`);let s={x:o},a={blockShape:t,crops:e};return v.runKernel(gn,s,a)}var Jn=N({batchToSpaceND_:iR});function Gb(r){let t;return r.rank===0||r.rank===1?t=R(r,[1,1,1,r.size]):r.rank===2?t=R(r,[1,1,r.shape[0],r.shape[1]]):r.rank===3?t=R(r,[1,r.shape[0],r.shape[1],r.shape[2]]):t=r,t}function pR(r,t,e,o,n,s){s==null&&(s=.001);let a=C(r,"x","batchNorm"),i=C(t,"mean","batchNorm"),p=C(e,"variance","batchNorm"),c;n!=null&&(c=C(n,"scale","batchNorm"));let l;o!=null&&(l=C(o,"offset","batchNorm")),k(i.rank===p.rank,()=>"Batch normalization gradient requires mean and variance to have equal ranks."),k(l==null||i.rank===l.rank,()=>"Batch normalization gradient requires mean and offset to have equal ranks."),k(c==null||i.rank===c.rank,()=>"Batch normalization gradient requires mean and scale to have equal ranks.");let m={x:Gb(a),scale:c,offset:l,mean:i,variance:p},f={varianceEpsilon:s},d=v.runKernel(kn,m,f);return R(d,a.shape)}var Kr=N({batchNorm_:pR});function cR(r,t,e,o,n,s){let a=C(r,"x","batchNorm"),i=C(t,"mean","batchNorm"),p=C(e,"variance","batchNorm"),c;n!=null&&(c=C(n,"scale","batchNorm"));let l;return o!=null&&(l=C(o,"offset","batchNorm")),k(a.rank===2,()=>`Error in batchNorm2D: x must be rank 2 but got rank ${a.rank}.`),k(i.rank===2||i.rank===1,()=>`Error in batchNorm2D: mean must be rank 2 or rank 1 but got rank ${i.rank}.`),k(p.rank===2||p.rank===1,()=>`Error in batchNorm2D: variance must be rank 2 or rank 1 but got rank ${p.rank}.`),c!=null&&k(c.rank===2||c.rank===1,()=>`Error in batchNorm2D: scale must be rank 2 or rank 1 but got rank ${c.rank}.`),l!=null&&k(l.rank===2||l.rank===1,()=>`Error in batchNorm2D: offset must be rank 2 or rank 1 but got rank ${l.rank}.`),Kr(a,i,p,l,c,s)}var wh=N({batchNorm2d_:cR});function lR(r,t,e,o,n,s){let a=C(r,"x","batchNorm"),i=C(t,"mean","batchNorm"),p=C(e,"variance","batchNorm"),c;n!=null&&(c=C(n,"scale","batchNorm"));let l;return o!=null&&(l=C(o,"offset","batchNorm")),k(a.rank===3,()=>`Error in batchNorm3D: x must be rank 3 but got rank ${a.rank}.`),k(i.rank===3||i.rank===1,()=>`Error in batchNorm3D: mean must be rank 3 or rank 1 but got rank ${i.rank}.`),k(p.rank===3||p.rank===1,()=>`Error in batchNorm3D: variance must be rank 3 or rank 1 but got rank ${p.rank}.`),c!=null&&k(c.rank===3||c.rank===1,()=>`Error in batchNorm3D: scale must be rank 3 or rank 1 but got rank ${c.rank}.`),l!=null&&k(l.rank===3||l.rank===1,()=>`Error in batchNorm3D: offset must be rank 3 or rank 1 but got rank ${l.rank}.`),Kr(a,i,p,l,c,s)}var Nh=N({batchNorm3d_:lR});function uR(r,t,e,o,n,s){let a=C(r,"x","batchNorm"),i=C(t,"mean","batchNorm"),p=C(e,"variance","batchNorm"),c;n!=null&&(c=C(n,"scale","batchNorm"));let l;return o!=null&&(l=C(o,"offset","batchNorm")),k(a.rank===4,()=>`Error in batchNorm4D: x must be rank 4 but got rank ${a.rank}.`),k(i.rank===4||i.rank===1,()=>`Error in batchNorm4D: mean must be rank 4 or rank 1 but got rank ${i.rank}.`),k(p.rank===4||p.rank===1,()=>`Error in batchNorm4D: variance must be rank 4 or rank 1 but got rank ${p.rank}.`),c!=null&&k(c.rank===4||c.rank===1,()=>`Error in batchNorm4D: scale must be rank 4 or rank 1 but got rank ${c.rank}.`),l!=null&&k(l.rank===4||l.rank===1,()=>`Error in batchNorm4D: offset must be rank 4 or rank 1 but got rank ${l.rank}.`),Kr(a,i,p,l,c,s)}var vh=N({batchNorm4d_:uR});function mR(r,t,e){let o=C(r,"x","bincount"),n=C(t,"weights","bincount");k(o.dtype==="int32",()=>`Error in bincount: input dtype must be int32, but got ${o.dtype}`),k(e>=0,()=>`size must be non-negative, but got ${e}.`),k(n.size===o.size||n.size===0,()=>`Error in bincount: weights must have the same size as input or0-length, but got input shape: ${o.shape}, weights shape: ${n.shape}.`);let s={x:o,weights:n},a={size:e};return v.runKernel(ba,s,a)}var qc=N({bincount_:mR});function fR(r,t){let e=C(r,"s0","broadcastArgs","int32"),o=C(t,"s1","broadcastArgs","int32");if(e.rank!==1)throw new Error(`broadcastArgs(): first input must be a vector (rank=1). Has rank ${e.rank}`);if(o.rank!==1)throw new Error(`broadcastArgs(): second input must be a vector (rank=1). Has rank ${o.rank}`);let n={s0:e,s1:o};return v.runKernel(Ca,n)}var Ih=N({broadcastArgs_:fR});function dR(r,t){let e=C(r,"broadcastTo","x"),o=e.shape;if(t.some(c=>!(c>0)||c%1!==0))throw new Error(`broadcastTo(): Invalid broadcast shape [${t}].`);if(t.length<e.rank)throw new Error(`broadcastTo(): shape.length=${t.length} < input.rank=${e.rank}.`);if(t.length>e.rank){let c=e.shape.slice();for(;c.length<t.length;)c.unshift(1);e=R(e,c)}let n=e.shape,s=Array.from(t);for(let c=t.length-1;c>=0;c--)if(n[c]===t[c])s[c]=1;else if(e.shape[c]!==1)throw new Error(`broadcastTo(): [${o}] cannot be broadcast to [${t}].`);if(s.map((c,l)=>c>1?l:-1).filter(c=>c>=0).length===0)return He(e);let i={x:e},p={reps:s};return v.runKernel(Wr,i,p)}var Xr=N({broadcastTo_:dR});function pt(r,t="float32",e){return t=t||"float32",Nc(r),new _t(r,t,e)}function hR(r){let e={x:C(r,"x","ceil","float32")};return v.runKernel(ho,e)}var Kc=N({ceil_:hR});function jr(r,t,e){let o={shape:r,value:t,dtype:e};return v.runKernel(_a,{},o)}function gR(r,t,e){let o=C(r,"x","clipByValue");if(k(t<=e,()=>`Error in clip: min (${t}) must be less than or equal to max (${e}).`),t===e)return jr(o.shape,t,o.dtype);let n={x:o},s={clipValueMin:t,clipValueMax:e};return v.runKernel(go,n,s)}var Xc=N({clipByValue_:gR});function xR(r,t){let e=C(r,"real","complex"),o=C(t,"imag","complex");Wt(e.shape,o.shape,`real and imag shapes, ${e.shape} and ${o.shape}, must match in call to tf.complex().`);let n={real:e,imag:o};return v.runKernel(Ta,n)}var Be=N({complex_:xR});function yR(r){return Lt(r,0)}var jc=N({concat1d_:yR});function bR(r,t){return Lt(r,t)}var kh=N({concat2d_:bR});function CR(r,t){return Lt(r,t)}var Eh=N({concat3d_:CR});function TR(r,t){return Lt(r,t)}var $h=N({concat4d_:TR});function SR(r,t,e,o,n="NHWC",s=[1,1],a){let i=C(r,"x","conv2d","float32"),p=C(t,"filter","conv2d","float32"),c=i,l=!1;i.rank===3&&(l=!0,c=R(i,[1,i.shape[0],i.shape[1],i.shape[2]])),k(c.rank===4,()=>`Error in conv2d: input must be rank 4, but got rank ${c.rank}.`),k(p.rank===4,()=>`Error in conv2d: filter must be rank 4, but got rank ${p.rank}.`),Gt("conv2d",o,a);let u=n==="NHWC"?c.shape[3]:c.shape[1];k(u===p.shape[2],()=>`Error in conv2d: depth of input (${u}) must match input depth for filter ${p.shape[2]}.`),k(Ce(e,s),()=>`Error in conv2D: Either strides or dilations must be 1. Got strides ${e} and dilations '${s}'`);let m={x:c,filter:p},f={strides:e,pad:o,dataFormat:n,dilations:s,dimRoundingMode:a},d=v.runKernel(bn,m,f);return l?R(d,[d.shape[1],d.shape[2],d.shape[3]]):d}var dr=N({conv2d_:SR});function wR(r,t,e,o,n="NWC",s=1,a){let i=C(r,"x","conv1d"),p=C(t,"filter","conv1d"),c=i,l=!1;i.rank===2&&(l=!0,c=R(i,[1,i.shape[0],i.shape[1]])),k(c.rank===3,()=>`Error in conv1d: input must be rank 3, but got rank ${c.rank}.`),k(p.rank===3,()=>`Error in conv1d: filter must be rank 3, but got rank ${p.rank}.`),Gt("conv1d",o,a),k(c.shape[2]===p.shape[1],()=>`Error in conv1d: depth of input (${c.shape[2]}) must match input depth for filter ${p.shape[1]}.`),k(Ce(e,s),()=>`Error in conv1D: Either stride or dilation must be 1. Got stride ${e} and dilation '${s}'`),k(n==="NWC",()=>`Error in conv1d: got dataFormat of ${n} but only NWC is currently supported.`);let u=R(p,[1,p.shape[0],p.shape[1],p.shape[2]]),m=R(c,[c.shape[0],1,c.shape[1],c.shape[2]]),h=dr(m,u,[1,e],o,"NHWC",[1,s],a);return l?R(h,[h.shape[2],h.shape[3]]):R(h,[h.shape[0],h.shape[2],h.shape[3]])}var Yc=N({conv1d_:wR});function NR(r,t,e,o,n,s="NHWC",a){k(r.length===t.rank,()=>`Length of inShape (${r.length}) and rank of dy (${t.rank}) must match`);let i=r,p=t,c=!1;t.rank===3&&(c=!0,p=R(t,[1,t.shape[0],t.shape[1],t.shape[2]]),i=[1,r[0],r[1],r[2]]),k(i.length===4,()=>`Error in conv2dDerInput: inShape must be length 4, but got length ${i.length}.`),k(p.rank===4,()=>`Error in conv2dDerInput: dy must be rank 4, but got rank ${p.rank}`),k(e.rank===4,()=>`Error in conv2dDerInput: filter must be rank 4, but got rank ${e.rank}`);let l=s==="NHWC"?i[3]:i[1],u=s==="NHWC"?p.shape[3]:p.shape[1];k(l===e.shape[2],()=>`Error in conv2dDerInput: depth of input (${l}) must match input depth for filter ${e.shape[2]}.`),k(u===e.shape[3],()=>`Error in conv2dDerInput: depth of output (${u}) must match output depth for filter ${e.shape[3]}.`),Gt("conv2dDerInput",n,a);let m={dy:p,filter:e},f={strides:o,pad:n,dataFormat:s,dimRoundingMode:a,inputShape:i},d=v.runKernel(Cn,m,f);return c?R(d,[d.shape[1],d.shape[2],d.shape[3]]):d}var Bp=N({conv2DBackpropInput_:NR});function vR(r,t,e,o,n,s){let a=C(r,"x","conv2dTranspose"),i=C(t,"filter","conv2dTranspose");return Bp(e,a,i,o,n,"NHWC",s)}var Zc=N({conv2dTranspose_:vR});function IR(r,t,e,o,n="NDHWC",s=[1,1,1]){let a=C(r,"x","conv3d"),i=C(t,"filter","conv3d"),p=a,c=!1;a.rank===4&&(c=!0,p=R(a,[1,a.shape[0],a.shape[1],a.shape[2],a.shape[3]])),k(p.rank===5,()=>`Error in conv3d: input must be rank 5, but got rank ${p.rank}.`),k(i.rank===5,()=>`Error in conv3d: filter must be rank 5, but got rank ${i.rank}.`),k(p.shape[4]===i.shape[3],()=>`Error in conv3d: depth of input (${p.shape[4]}) must match input depth for filter ${i.shape[3]}.`),k(Ce(e,s),()=>`Error in conv3D: Either strides or dilations must be 1. Got strides ${e} and dilations '${s}'`),k(n==="NDHWC",()=>`Error in conv3d: got dataFormat of ${n} but only NDHWC is currently supported.`);let l={x:p,filter:i},u={strides:e,pad:o,dataFormat:n,dilations:s},m=v.runKernel(Tn,l,u);return c?R(m,[m.shape[1],m.shape[2],m.shape[3],m.shape[4]]):m}var Ah=N({conv3d_:IR});function kR(r,t,e,o,n){k(r.length===t.rank,()=>`Length of inShape (${r.length}) and rank of dy (${t.rank}) must match`);let s=r,a=t,i=!1;t.rank===4&&(i=!0,a=R(t,[1,t.shape[0],t.shape[1],t.shape[2],t.shape[3]]),s=[1,r[0],r[1],r[2],r[3]]);let p=s[4],c=a.shape[4];k(s.length===5,()=>`Error in conv3dDerInput: inShape must be length 5, but got length ${s.length}.`),k(a.rank===5,()=>`Error in conv3dDerInput: dy must be rank 5, but got rank ${a.rank}`),k(e.rank===5,()=>`Error in conv3dDerInput: filter must be rank 5, but got rank ${e.rank}`),k(p===e.shape[3],()=>`Error in conv3dDerInput: depth of input (${p}) must match input depth for filter ${e.shape[3]}.`),k(c===e.shape[4],()=>`Error in conv3dDerInput: depth of output (${c}) must match output depth for filter ${e.shape[4]}.`);let l={dy:a,filter:e},u={pad:n,strides:o,inputShape:s},m=v.runKernel(Na,l,u);return i?R(m,[m.shape[1],m.shape[2],m.shape[3],m.shape[4]]):m}var Iu=N({conv3DBackpropInput_:kR});function ER(r,t,e,o,n){let s=C(r,"x","conv3dTranspose"),a=C(t,"filter","conv3dTranspose");return Iu(e,s,a,o,n)}var Dh=N({conv3dTranspose_:ER});function $R(r){let e={x:C(r,"x","cos","float32")};return v.runKernel("Cos",e)}var ts=N({cos_:$R});function AR(r){let e={x:C(r,"x","cosh","float32")};return v.runKernel(xo,e)}var $i=N({cosh_:AR});function DR(r,t=0,e=!1,o=!1){let s={x:C(r,"x","cumprod")},a={axis:t,exclusive:e,reverse:o};return v.runKernel(va,s,a)}var Qs=N({cumprod_:DR});function RR(r,t=0,e=!1,o=!1){let s={x:C(r,"x","cumsum")},a={axis:t,exclusive:e,reverse:o};return v.runKernel(Sn,s,a)}var Ai=N({cumsum_:RR});function FR(r,t,e,o=!1){let n=C(r,"x","denseBincount"),s=C(t,"weights","denseBincount");k(n.dtype==="int32",()=>`Error in denseBincount: input dtype must be int32, but got ${n.dtype}`),k(n.rank<=2,()=>`Error in denseBincount: input must be at most rank 2, but got rank ${n.rank}.`),k(e>=0,()=>`size must be non-negative, but got ${e}.`),k(s.size===n.size||s.size===0,()=>`Error in denseBincount: weights must have the same shape as x or 0-length, but got x shape: ${n.shape}, weights shape: ${s.shape}.`);let a={x:n,weights:s},i={size:e,binaryOutput:o};return v.runKernel(ka,a,i)}var Rh=N({denseBincount_:FR});function _R(r,t,e="NHWC"){let o=C(r,"x","depthToSpace","float32"),n=e==="NHWC"?o.shape[1]:o.shape[2],s=e==="NHWC"?o.shape[2]:o.shape[3],a=e==="NHWC"?o.shape[3]:o.shape[1];k(t>1,()=>`blockSize should be > 1 for depthToSpace, but was: ${t}`),k(n*t>=0,()=>`Negative dimension size caused by overflow when multiplying
    ${n} and ${t}  for depthToSpace with input shape
    ${o.shape}`),k(s*t>=0,()=>`Negative dimension size caused by overflow when multiplying
    ${s} and ${t} for depthToSpace with input shape
        ${o.shape}`),k(a%(t*t)===0,()=>`Dimension size must be evenly divisible by ${t*t} but is ${a} for depthToSpace with input shape ${o.shape}`);let i={x:o},p={blockSize:t,dataFormat:e};return v.runKernel(Ea,i,p)}var Qc=N({depthToSpace_:_R});function OR(r,t,e,o,n="NHWC",s=[1,1],a){let i=C(r,"x","depthwiseConv2d","float32"),p=C(t,"filter","depthwiseConv2d","float32"),c=i,l=!1;i.rank===3&&(l=!0,c=R(i,[1,i.shape[0],i.shape[1],i.shape[2]])),k(c.rank===4,()=>`Error in depthwiseConv2d: input must be rank 4, but got rank ${c.rank}.`),k(p.rank===4,()=>`Error in depthwiseConv2d: filter must be rank 4, but got rank ${p.rank}.`);let u=n==="NHWC"?c.shape[3]:c.shape[1];k(u===p.shape[2],()=>`Error in depthwiseConv2d: number of input channels (${u}) must match the inChannels dimension in filter ${p.shape[2]}.`),Gt("depthwiseConv2d",o,a);let m={x:c,filter:p},f={strides:e,pad:o,dataFormat:n,dilations:s,dimRoundingMode:a},d=v.runKernel(wn,m,f);return l?R(d,[d.shape[1],d.shape[2],d.shape[3]]):d}var es=N({depthwiseConv2d_:OR});function PR(r){let e={x:C(r,"x","diag")};return v.runKernel(Da,e)}var Fh=N({diag_:PR});function LR(r,t,e,o,n=[1,1],s="NHWC"){let a=C(r,"x","dilation2d"),i=C(t,"filter","dilation2d");k(a.rank===3||a.rank===4,()=>`Error in dilation2d: input must be rank 3 or 4, but got rank ${a.rank}.`),k(i.rank===3,()=>`Error in dilation2d: filter must be rank 3, but got rank ${i.rank}.`),k(s==="NHWC",()=>`Error in dilation2d: Only NHWC is currently supported, but got dataFormat of ${s}`);let p=a,c=!1;a.rank===3&&(p=R(a,[1,a.shape[0],a.shape[1],a.shape[2]]),c=!0);let l={x:p,filter:i},u={strides:e,pad:o,dilations:n},m=v.runKernel(Nn,l,u);return c?R(m,[m.shape[1],m.shape[2],m.shape[3]]):m}var Jc=N({dilation2d_:LR});function MR(r,t){let e=C(r,"a","floorDiv"),o=C(t,"b","floorDiv");[e,o]=Nt(e,o);let n={a:e,b:o};return v.runKernel(To,n)}var Di=N({floorDiv_:MR});function BR(r,t){let e=C(r,"a","div"),o=C(t,"b","div");if([e,o]=Nt(e,o),e.dtype==="int32"&&o.dtype==="int32")return Di(e,o);let n={a:e,b:o},s={};return v.runKernel(yo,n,s)}var st=N({div_:BR});var Ke={};At(Ke,{assertAndGetBroadcastShape:()=>bt,getBroadcastDims:()=>Vb,getReductionAxes:()=>Mt});function Vb(r,t){let e=r.length,o=[];for(let n=0;n<e;n++){let s=e-1-n,a=r[s]||1;(t[t.length-1-n]||1)>1&&a===1&&o.unshift(s)}return o}function Mt(r,t){let e=[];for(let o=0;o<t.length;o++){let n=r[r.length-o-1],s=t.length-o-1,a=t[s];(n==null||n===1&&a>1)&&e.unshift(s)}return e}function bt(r,t){let e=[],o=Math.max(r.length,t.length);for(let n=0;n<o;n++){let s=r[r.length-n-1];s==null&&(s=1);let a=t[t.length-n-1];if(a==null&&(a=1),s===1)e.unshift(a);else if(a===1)e.unshift(s);else if(s!==a){let i=`Operands could not be broadcast together with shapes ${r} and ${t}.`;throw Error(i)}else e.unshift(s)}return e}function GR(r,t){let e=C(r,"a","equal","string_or_numeric"),o=C(t,"b","equal","string_or_numeric");[e,o]=Nt(e,o),bt(e.shape,o.shape);let n={a:e,b:o};return v.runKernel(As,n)}var rs=N({equal_:GR});function VR(r,t,e){let o=C(t,"a","where"),n=C(e,"b","where"),s=C(r,"condition","where","bool"),a=bt(bt(s.shape,o.shape),n.shape),i=Xr(s,a),p=Xr(o,a),c=Xr(n,a),l={condition:i,t:p,e:c};return v.runKernel(Un,l)}var Xt=N({where_:VR});function zR(r){let e={x:C(r,"x","zerosLike")};return v.runKernel(Zn,e)}var mt=N({zerosLike_:zR});function WR(r,t){let e=C(r,"a","div"),o=C(t,"b","div");[e,o]=Nt(e,o);let n=st(e,o),s=mt(n),a=rs(o,s);return Xt(a,s,n)}var tl=N({divNoNan_:WR});function UR(r,t){let e=C(r,"t1","dot"),o=C(t,"t2","dot");k((e.rank===1||e.rank===2)&&(o.rank===1||o.rank===2),()=>`Error in dot: inputs must all be rank 1 or 2, but got ranks ${e.rank} and ${o.rank}.`);let n=e.rank===1?e.size:e.shape[1],s=o.rank===1?o.size:o.shape[0];if(k(n===s,()=>`Error in dot: inner dimensions of inputs must match, but got ${n} and ${s}.`),e.rank===1&&o.rank===1){let a=R(e,[1,-1]),i=R(o,[-1,1]),p=Tt(a,i);return R(p,[])}else if(e.rank===1&&o.rank===2){let a=R(e,[1,-1]),i=R(o,[o.shape[0],o.shape[1]]),p=Tt(a,i);return R(p,[p.size])}else if(e.rank===2&&o.rank===1){let a=R(o,[-1,1]),i=Tt(e,a);return R(i,[i.size])}else{let a=R(o,[o.shape[0],o.shape[1]]);return Tt(e,a)}}var el=N({dot_:UR});function HR(r,...t){let e=t.map((n,s)=>C(n,`tensors${s}`,"einsum")),o={equation:r};return v.runKernel(Ra,e,o)}var _h=N({einsum_:HR});function qR(r){let e={x:C(r,"x","elu","float32")};return v.runKernel("Elu",e)}var Ri=N({elu_:qR});function KR(r){let t=C(r,"x","erf");k(t.dtype==="int32"||t.dtype==="float32",()=>"Input dtype must be `int32` or `float32`."),t.dtype==="int32"&&(t=X(t,"float32"));let e={x:t};return v.runKernel("Erf",e)}var rl=N({erf_:KR});function Oh(r,t){for(let e=0;e<r.length;++e)if(r[r.length-e-1]!==t-1-e)return!1;return!0}function zb(r,t,e){let o=r.length+t.length,n=[],s=0,a=0;for(let i=0;i<o;i++)e.indexOf(i)===-1?n.push(r[s++]):n.push(t[a++]);return n}function Ph(r,t){let e=[],o=r.length;for(let s=0;s<o;s++)t.indexOf(s)===-1&&e.push(r[s]);let n=t.map(s=>r[s]);return[e,n]}function kr(r,t){let e=t.map(o=>1);return zb(r,e,t)}function XR(r,t,e){k(Oh(t,e),()=>`${r} supports only inner-most axes for now. Got axes ${t} and rank-${e} input.`)}function Lh(r,t){if(Oh(r,t))return null;let e=[];for(let o=0;o<t;++o)r.indexOf(o)===-1&&e.push(o);return r.forEach(o=>e.push(o)),e}function ol(r){return r.map((t,e)=>[e,t]).sort((t,e)=>t[1]-e[1]).map(t=>t[0])}function jR(r,t){let e=[];for(let o=t-r;o<t;++o)e.push(o);return e}function YR(r,t=null,e=!1){let n={x:C(r,"x","max")},s={reductionIndices:t,keepDims:e};return v.runKernel("Max",n,s)}var hr=N({max_:YR});function ZR(r,t=null,e=!1){let n={x:C(r,"x","min")},s={axis:t,keepDims:e};return v.runKernel("Min",n,s)}var Js=N({min_:ZR});function QR(r,t){let e=C(r,"base","pow"),o=C(t,"exp","pow");[e,o]=Nt(e,o);let n={a:e,b:o};return v.runKernel("Pow",n)}var Ge=N({pow_:QR});function Ve(r,t,e,o){if(o==null&&(o=Cp(r)),o==="complex64")throw new Error("Cannot construct a complex64 tensor directly. Please use tf.complex(real, imag).");if(!me(r)&&!Array.isArray(r)&&typeof r!="number"&&typeof r!="boolean"&&typeof r!="string")throw new Error("values passed to tensor(values) must be a number/boolean/string or an array of numbers/booleans/strings, or a TypedArray");if(t!=null){Nc(t);let n=It(t),s=It(e);k(n===s,()=>`Based on the provided shape, [${t}], the tensor should have ${n} values but has ${s}`);for(let a=0;a<e.length;++a){let i=e[a],p=a===e.length-1?i!==It(t.slice(a)):!0;k(e[a]===t[a]||!p,()=>`Error creating a new Tensor. Inferred shape (${e}) does not match the provided shape (${t}). `)}}return!me(r)&&!Array.isArray(r)&&(r=[r]),t=t||e,r=o!=="string"?Op(r,o):Br(r,[],!0),v.makeTensor(r,t,o)}function J(r,t){if((me(r)&&t!=="string"||Array.isArray(r))&&t!=="complex64")throw new Error("Error creating a new Scalar: value must be a primitive (number|boolean|string)");if(t==="string"&&me(r)&&!(r instanceof Uint8Array))throw new Error("When making a scalar from encoded string, the value must be `Uint8Array`.");return Ve(r,[],[],t)}function JR(r){let e={x:C(r,"x","sqrt","float32")};return v.runKernel(Go,e)}var Ut=N({sqrt_:JR});function tF(r){let t=C(r,"x","square"),e={};return v.runKernel("Square",{x:t},e)}var Ct=N({square_:tF});function eF(r,t=null,e=!1){let o=C(r,"x","sum");o.dtype==="bool"&&(o=X(o,"int32"));let n={x:o},s={axis:t,keepDims:e};return v.runKernel("Sum",n,s)}var it=N({sum_:eF});function rF(r,t="euclidean",e=null,o=!1){r=C(r,"x","norm");let n=Wb(r,t,e),s=n.shape;if(o){let a=ce(e,r.shape);s=kr(n.shape,a)}return R(n,s)}function Wb(r,t,e=null){if(r.rank===0)return le(r);if(r.rank!==1&&e===null)return Wb(R(r,[-1]),t,e);if(r.rank===1||typeof e=="number"||Array.isArray(e)&&e.length===1){if(t===1)return it(le(r),e);if(t===1/0)return hr(le(r),e);if(t===-1/0)return Js(le(r),e);if(t==="euclidean"||t===2)return Ut(it(Ge(le(r),J(2,"int32")),e));throw new Error(`Error in norm: invalid ord value: ${t}`)}if(Array.isArray(e)&&e.length===2){if(t===1)return hr(it(le(r),e[0]),e[1]-1);if(t===1/0)return hr(it(le(r),e[1]),e[0]);if(t===-1/0)return Js(it(le(r),e[1]),e[0]);if(t==="fro"||t==="euclidean")return Ut(it(Ct(r),e));throw new Error(`Error in norm: invalid ord value: ${t}`)}throw new Error(`Error in norm: invalid axis: ${e}`)}var qo=N({norm_:rF});function oF(r,t=null,e=!1){return qo(r,"euclidean",t,e)}var nl=N({euclideanNorm_:oF});function nF(r){let e={x:C(r,"x","exp")};return v.runKernel("Exp",e)}var ae=N({exp_:nF});function sF(r,t=0){let e=C(r,"x","expandDims","string_or_numeric");k(t<=e.rank,()=>"Axis must be <= rank of the tensor");let o={input:e},n={dim:t};return v.runKernel(In,o,n)}var ze=N({expandDims_:sF});function aF(r){let e={x:C(r,"x","expm1")};return v.runKernel(bo,e)}var sl=N({expm1_:aF});function iF(r,t){let e=C(r,"x","tile","string_or_numeric");k(e.rank===t.length,()=>`Error in transpose: rank of input ${e.rank} must match length of reps ${t}.`);let o={x:e},n={reps:t};return v.runKernel(Wr,o,n)}var gr=N({tile_:iF});function pF(r,t,e,o="float32"){t==null&&(t=r);let n=pt([r,t],o),s=r<=t?r:t;for(let i=0;i<s;++i)n.set(1,i,i);let a=R(n.toTensor(),[r,t]);if(e==null)return a;if(e.length===1)return gr(ze(a,0),[e[0],1,1]);if(e.length===2)return gr(ze(ze(a,0),0),[e[0],e[1],1,1]);if(e.length===3)return gr(ze(ze(ze(a,0),0),0),[e[0],e[1],e[2],1,1]);throw new Error(`eye() currently supports only 1D and 2D batchShapes, but received ${e.length}D.`)}var al=N({eye_:pF});function cF(r){let e={x:C(r,"x","floor","float32")};return v.runKernel(Co,e)}var os=N({floor_:cF});function lF(r,t,e=0,o=0){let n=C(r,"x","gather"),s=C(t,"indices","gather","int32"),a={x:n,indices:s},i={axis:e,batchDims:o};return v.runKernel(En,a,i)}var ns=N({gather_:lF});function uF(r,t){let e=C(r,"a","greater","string_or_numeric"),o=C(t,"b","greater","string_or_numeric");[e,o]=Nt(e,o),bt(e.shape,o.shape);let n={a:e,b:o};return v.runKernel(Rs,n)}var xe=N({greater_:uF});function mF(r,t){let e=C(r,"a","greaterEqual","string_or_numeric"),o=C(t,"b","greaterEqual","string_or_numeric");[e,o]=Nt(e,o),bt(e.shape,o.shape);let n={a:e,b:o};return v.runKernel(So,n)}var xr=N({greaterEqual_:mF});function fF(r){let e={input:C(r,"input","imag")};return v.runKernel(Ma,e)}var ss=N({imag_:fF});function dF(r){let e={x:C(r,"x","isFinite")};return v.runKernel(wo,e)}var il=N({isFinite_:dF});function hF(r){let e={x:C(r,"x","isInf")};return v.runKernel(No,e)}var pl=N({isInf_:hF});function gF(r){let e={x:C(r,"x","isNaN")};return v.runKernel(vo,e)}var cl=N({isNaN_:gF});function xF(r,t=.2){let o={x:C(r,"x","leakyRelu")},n={alpha:t};return v.runKernel($n,o,n)}var Fi=N({leakyRelu_:xF});function yF(r,t){let e=C(r,"a","less","string_or_numeric"),o=C(t,"b","less","string_or_numeric");[e,o]=Nt(e,o),bt(e.shape,o.shape);let n={a:e,b:o};return v.runKernel(Fs,n)}var _i=N({less_:yF});function bF(r,t){let e=C(r,"a","lessEqual","string_or_numeric"),o=C(t,"b","lessEqual","string_or_numeric");[e,o]=Nt(e,o),bt(e.shape,o.shape);let n={a:e,b:o};return v.runKernel(_s,n)}var Xe=N({lessEqual_:bF});function Bh(r,t,e){if(e<=0)throw new Error("The number of values should be positive.");let o={start:r,stop:t,num:e};return v.runKernel(Ba,{},o)}function CF(r,t=5,e=1,o=1,n=.5){let s=C(r,"x","localResponseNormalization");k(s.rank===4||s.rank===3,()=>`Error in localResponseNormalization: x must be rank 3 or 4 but got
               rank ${s.rank}.`),k(cn(t),()=>`Error in localResponseNormalization: depthRadius must be an integer but got depthRadius ${t}.`);let a=s,i=!1;s.rank===3&&(i=!0,a=R(s,[1,s.shape[0],s.shape[1],s.shape[2]]));let p={x:a},c={depthRadius:t,bias:e,alpha:o,beta:n},l=v.runKernel("LRN",p,c);return i?R(l,[l.shape[1],l.shape[2],l.shape[3]]):l}var ll=N({localResponseNormalization_:CF});function TF(r){let e={x:C(r,"x","log","float32")};return v.runKernel("Log",e)}var er=N({log_:TF});function SF(r){let e={x:C(r,"x","log1p")};return v.runKernel(Io,e)}var Oi=N({log1p_:SF});function Ub(r){return k(no(r),()=>"The f passed in grad(f) must be a function"),(t,e)=>{let o=C(t,"x","tf.grad","string_or_numeric"),n=e!=null?C(e,"dy","tf.grad"):null;return v.tidy(()=>{let{value:s,grads:a}=v.gradients(()=>r(o),[o],n);return n!=null&&Wt(s.shape,n.shape,"The shape of dy passed in grad(f)(x, dy) must match the shape returned by f(x)"),Eu(a),a[0]})}}function Hb(r){return k(no(r),()=>"The f passed in grads(f) must be a function"),(t,e)=>{k(Array.isArray(t),()=>"The args passed in grads(f)(args) must be an array of `Tensor`s or `TensorLike`s");let o=Qn(t,"args","tf.grads","string_or_numeric"),n=e!=null?C(e,"dy","tf.grads"):null;return v.tidy(()=>{let{value:s,grads:a}=v.gradients(()=>r(...o),o,n);return n!=null&&Wt(s.shape,n.shape,"The shape of dy passed in grads(f)([x1,...], dy) must match the shape returned by f([x1,...])"),Eu(a),a})}}function qb(r){return k(no(r),()=>"The f passed in valueAndGrad(f) must be a function"),(t,e)=>{k(t instanceof Rt,()=>"The x passed in valueAndGrad(f)(x) must be a tensor"),k(e==null||e instanceof Rt,()=>"The dy passed in valueAndGrad(f)(x, dy) must be a tensor");let{grads:o,value:n}=v.gradients(()=>r(t),[t],e);return Eu(o),{grad:o[0],value:n}}}function Kb(r){return k(no(r),()=>"The f passed in valueAndGrads(f) must be a function"),(t,e)=>{k(Array.isArray(t)&&t.every(n=>n instanceof Rt),()=>"The args passed in valueAndGrads(f)(args) must be array of tensors"),k(e==null||e instanceof Rt,()=>"The dy passed in valueAndGrads(f)(args, dy) must be a tensor");let o=v.gradients(()=>r(...t),t,e);return e!=null&&Wt(o.value.shape,e.shape,"The shape of dy passed in valueAndGrads(f)([x1,...], dy) must match the shape returned by f([x1,...])"),Eu(o.grads),o}}function ku(r,t){k(no(r),()=>"The f passed in variableGrads(f) must be a function"),k(t==null||Array.isArray(t)&&t.every(c=>c instanceof Ho),()=>"The varList passed in variableGrads(f, varList) must be an array of variables");let e=t!=null;if(!e){t=[];for(let c in v.registeredVariables)t.push(v.registeredVariables[c])}let o=e?t.filter(c=>!c.trainable):null,n=t.length;t=t.filter(c=>c.trainable),k(t.length>0,()=>`variableGrads() expects at least one of the input variables to be trainable, but none of the ${n} variables is trainable.`);let s=!0,{value:a,grads:i}=v.gradients(r,t,null,s);k(i.some(c=>c!=null),()=>"Cannot find a connection between any variable and the result of the loss function y=f(x). Please make sure the operations that use variables are inside the function f passed to minimize()."),k(a.rank===0,()=>`The f passed in variableGrads(f) must return a scalar, but it returned a rank-${a.rank} tensor`);let p={};return t.forEach((c,l)=>{i[l]!=null&&(p[c.name]=i[l])}),o!=null&&o.forEach(c=>p[c.name]=null),{value:a,grads:p}}function Fe(r){return v.customGrad(r)}function Eu(r){if(r.filter(e=>e==null).length>0)throw new Error(`Cannot compute gradient of y=f(x) with respect to x. Make sure that
    the f you passed encloses all operations that lead from x to y.`)}function wF(r){let e={x:C(r,"x","neg")};return v.runKernel("Neg",e)}var $t=N({neg_:wF});function NF(r){let e={x:C(r,"x","softplus")};return v.runKernel(Bo,e)}var Pi=N({softplus_:NF});function vF(r){let t=C(r,"x","logSigmoid");return Fe(o=>({value:$t(Pi($t(o))),gradFunc:a=>O(a,qe($t(o)))}))(t)}var ul=N({logSigmoid_:vF});function IF(r,t){let e=C(r,"a","sub"),o=C(t,"b","sub");[e,o]=Nt(e,o);let n={a:e,b:o};return v.runKernel("Sub",n)}var rt=N({sub_:IF});function kF(r,t=-1){let e=C(r,"logits","logSoftmax");if(t===-1&&(t=e.rank-1),t!==e.rank-1)throw Error(`Log Softmax along a non-last dimension is not yet supported. Logits was rank ${e.rank} and axis was ${t}`);return Fe((n,s)=>{let i=hr(n,t,!0),p=rt(n,i),c=rt(X(p,"float32"),er(it(ae(p),t,!0)));return s([c]),{value:c,gradFunc:(u,m)=>{let[f]=m,d=!0,g=ae(f);return rt(u,O(it(u,t,d),g))}}})(e)}var ml=N({logSoftmax_:kF});function EF(r,t=null,e=!1){let o=C(r,"x","logSumExp"),n=ce(t,o.shape),s=hr(o,n,!0),a=rt(o,s),i=ae(a),p=it(i,n),c=er(p),l=tt(R(s,c.shape),c);if(e){let u=kr(l.shape,n);return R(l,u)}return l}var Li=N({logSumExp_:EF});function $F(r,t){let e=C(r,"a","logicalAnd","bool"),o=C(t,"b","logicalAnd","bool");bt(e.shape,o.shape);let n={a:e,b:o};return v.runKernel(Ps,n)}var rr=N({logicalAnd_:$F});function AF(r){let e={x:C(r,"x","logicalNot","bool")};return v.runKernel(Ls,e)}var as=N({logicalNot_:AF});function DF(r,t){let e=C(r,"a","logicalOr","bool"),o=C(t,"b","logicalOr","bool");bt(e.shape,o.shape);let n={a:e,b:o};return v.runKernel(Ms,n)}var Mi=N({logicalOr_:DF});function RF(r,t){let e=C(r,"a","logicalXor","bool"),o=C(t,"b","logicalXor","bool");return bt(e.shape,o.shape),rr(Mi(r,t),as(rr(r,t)))}var fl=N({logicalXor_:RF});var $u=2147483648;function FF(r,t,e="left"){let o=C(r,"sortedSequence","searchSorted"),n=C(t,"values","searchSorted"),s=o.shape[o.shape.length-1],a=n.shape[n.shape.length-1],i=R(o,[-1,s]),p=R(n,[-1,a]);if(i.rank<2)throw new Error("Sorted input argument must be at least 2-dimensional");if(i.shape[0]!==p.shape[0])throw new Error("Leading dimension of 'sortedSequence' and 'values' must match.");if(It(p.shape)>=$u)throw new Error(`values tensor size must less than ${$u}`);if(i.shape[1]>=$u)throw new Error(`trailing dim_size must less than ${$u} for int32 output type, was ${i.shape[1]}`);let c={sortedSequence:i,values:p},l={side:e};return v.runKernel(si,c,l)}var Gp=N({searchSorted_:FF});function Gh(r,t){return Gp(r,t,"left")}function _F(r,t,e,o,n){let s=C(r,"x","maxPool"),a=1,i=s,p=!1;s.rank===3&&(p=!0,i=R(s,[1,s.shape[0],s.shape[1],s.shape[2]])),k(i.rank===4,()=>`Error in maxPool: input must be rank 4 but got rank ${i.rank}.`),k(Ce(e,a),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${e} and dilations '${a}'`),Gt("maxPool",o,n);let c={x:i},l={filterSize:t,strides:e,pad:o,dimRoundingMode:n},u=v.runKernel(An,c,l);return p?R(u,[u.shape[1],u.shape[2],u.shape[3]]):u}var Bi=N({maxPool_:_F});function OF(r,t=[1,1,1],e,o,n,s="NDHWC"){let a=C(r,"x","maxPool3d"),i=a,p=!1;a.rank===4&&(p=!0,i=R(a,[1,a.shape[0],a.shape[1],a.shape[2],a.shape[3]])),k(i.rank===5,()=>`Error in maxPool3d: x must be rank 5 but got rank ${i.rank}.`),k(s==="NDHWC",()=>`Error in maxPool3d: Only NDHWC is currently supported, but got dataFormat of ${s}`),Gt("maxPool3d",o,n);let c={x:i},l={filterSize:t,strides:e,pad:o,dimRoundingMode:n,dataFormat:s},u=v.runKernel(Dn,c,l);return p?R(u,[u.shape[1],u.shape[2],u.shape[3],u.shape[4]]):u}var Vh=N({maxPool3d_:OF});function PF(r,t,e,o,n=!1){let a={x:C(r,"x","maxPoolWithArgmax")},i={filterSize:t,strides:e,pad:o,includeBatchInIndex:n},p=v.runKernel(Ha,a,i);return{result:p[0],indexes:p[1]}}var zh=N({maxPoolWithArgmax_:PF});function LF(r,t){let e=C(r,"a","maximum"),o=C(t,"b","maximum");[e,o]=Nt(e,o),e.dtype==="bool"&&(e=X(e,"int32"),o=X(o,"int32")),bt(e.shape,o.shape);let n={a:e,b:o};return v.runKernel(ko,n)}var is=N({maximum_:LF});function MF(r,t=null,e=!1){let n={x:C(r,"x","mean")},s={axis:t,keepDims:e};return v.runKernel(Rn,n,s)}var Ko=N({mean_:MF});function _e(r,t="float32"){if(t==="complex64"){let o=_e(r,"float32"),n=_e(r,"float32");return Be(o,n)}let e=Sp(It(r),t);return v.makeTensor(e,r,t)}function Oe(r,t="float32"){if(t==="complex64"){let o=Oe(r,"float32"),n=_e(r,"float32");return Be(o,n)}let e=wc(It(r),t);return v.makeTensor(e,r,t)}function Wh(r,t,{indexing:e="xy"}={}){if(e!=="xy"&&e!=="ij")throw new TypeError(`${e} is not a valid third argument to meshgrid`);if(r===void 0)return[];let o=C(r,"x","meshgrid",r instanceof Rt?r.dtype:"float32");if(t===void 0)return[o];let n=C(t,"y","meshgrid",t instanceof Rt?t.dtype:"float32"),s=It(o.shape),a=It(n.shape);return e==="xy"?(o=R(o,[1,-1]),n=R(n,[-1,1]),[Tt(Oe([a,1],o.dtype),o),Tt(n,Oe([1,s],n.dtype))]):(o=R(o,[-1,1]),n=R(n,[1,-1]),[Tt(o,Oe([1,a],o.dtype)),Tt(Oe([s,1],n.dtype),n)])}function BF(r,t){let e=C(r,"a","minimum"),o=C(t,"b","minimum");[e,o]=Nt(e,o),e.dtype==="bool"&&(e=X(e,"int32"),o=X(o,"int32")),bt(e.shape,o.shape);let n={a:e,b:o};return v.runKernel(Eo,n)}var Gi=N({minimum_:BF});function GF(r,t,e){k(e==="reflect"||e==="symmetric",()=>`Invalid mode. Mode must be either reflect or symmetric. Got ${e}.`);let o=C(r,"x","mirrorPad");if(o.rank===0)throw new Error("mirrorPad(scalar) is not defined. Pass non-scalar to mirrorPad");k(t.length===o.rank,()=>`Padding doesn't match input. Must be ${o.rank}. Got ${t.length}.`);let n=e==="reflect"?1:0;for(let i=0;i<o.rank;i++)k(t[i].length===2,()=>"Invalid number of paddings. Must be length of 2 each."),k(t[i][0]>=0&&t[i][0]<=o.shape[i]-n&&t[i][1]>=0&&t[i][1]<=o.shape[i]-n,()=>`Padding in dimension ${i} cannot be greater than or equal to ${o.shape[i]-n} or less than 0 for input of shape ${o.shape}`);let s={paddings:t,mode:e},a={x:o};return v.runKernel(Fn,a,s)}var dl=N({mirrorPad_:GF});function VF(r,t){let e=C(r,"a","mod"),o=C(t,"b","mod");[e,o]=Nt(e,o);let n={a:e,b:o};return v.runKernel("Mod",n)}var hl=N({mod_:VF});function zF(r,t=null,e=!1){r=C(r,"x","moments");let o=ce(t,r.shape),n=Ko(r,o,e),s=n.shape;e||(s=kr(n.shape,o));let a=Ct(rt(X(r,"float32"),R(n,s))),i=Ko(a,o,e);return{mean:n,variance:i}}var Uh=N({moments_:zF});function WF(r,t,e,o){let n=C(t,"data","multiRNNCell"),s=Qn(e,"c","multiRNNCell"),a=Qn(o,"h","multiRNNCell"),i=n,p=[];for(let u=0;u<r.length;u++){let m=r[u](i,s[u],a[u]);p.push(m[0]),p.push(m[1]),i=m[1]}let c=[],l=[];for(let u=0;u<p.length;u+=2)c.push(p[u]),l.push(p[u+1]);return[c,l]}var Hh=N({multiRNNCell_:WF});function UF(r,t,e,o=!1){let n=C(r,"logits","multinomial"),s=n.size,a=n.rank;if(s<2)throw new Error(`Error in multinomial: you need at least 2 outcomes, but got ${s}.`);if(a>2)throw new Error(`Rank of probabilities must be 1 or 2, but is ${a}`);e=e||Math.random();let p={logits:a===1?R(n,[1,-1]):n},c={numSamples:t,seed:e,normalized:o},l=v.runKernel(Ka,p,c);return a===1?R(l,[l.size]):l}var qh=N({multinomial_:UF});function HF(r,t){let e=C(r,"a","notEqual","string_or_numeric"),o=C(t,"b","notEqual","string_or_numeric");[e,o]=Nt(e,o),bt(e.shape,o.shape);let n={a:e,b:o};return v.runKernel(Gs,n)}var Vi=N({notEqual_:HF});function qF(r,t,e=1,o=0,n="int32"){if(t<2)throw new Error(`Error in oneHot: depth must be >=2, but it is ${t}`);let a={indices:C(r,"indices","oneHot","int32")},i={dtype:n,depth:t,onValue:e,offValue:o};return v.runKernel(On,a,i)}var ta=N({oneHot_:qF});function KF(r){let e={x:C(r,"x","onesLike")};return v.runKernel(_n,e)}var gl=N({onesLike_:KF});function XF(r,t){let e=C(r,"v1","outerProduct"),o=C(t,"v2","outerProduct");k(e.rank===1&&o.rank===1,()=>`Error in outerProduct: inputs must be rank 1, but got ranks ${e.rank} and ${o.rank}.`);let n=R(e,[-1,1]),s=R(o,[1,-1]);return Tt(n,s)}var Kh=N({outerProduct_:XF});function jF(r,t,e=0){let o=C(r,"x","pad");if(o.rank===0)throw new Error("pad(scalar) is not defined. Pass non-scalar to pad");let n={paddings:t,constantValue:e},s={x:o};return v.runKernel(Ln,s,n)}var je=N({pad_:jF});function YF(r,t,e=0){return k(t.length===2,()=>"Invalid number of paddings. Must be length of 2."),je(r,[t],e)}var Xh=N({pad1d_:YF});function ZF(r,t,e=0){return k(t.length===2&&t[0].length===2&&t[1].length===2,()=>"Invalid number of paddings. Must be length of 2 each."),je(r,t,e)}var jh=N({pad2d_:ZF});function QF(r,t,e=0){return k(t.length===3&&t[0].length===2&&t[1].length===2&&t[2].length===2,()=>"Invalid number of paddings. Must be length of 2 each."),je(r,t,e)}var Yh=N({pad3d_:QF});function JF(r,t,e=0){return k(t.length===4&&t[0].length===2&&t[1].length===2&&t[2].length===2&&t[3].length===2,()=>"Invalid number of paddings. Must be length of 2 each."),je(r,t,e)}var Zh=N({pad4d_:JF});function t_(r,t,e){let o=C(r,"x","spaceToBatchND");k(o.rank>=1+t.length,()=>`input rank ${o.rank} should be > than [blockShape] ${t.length}`),k(e.length===t.length,()=>`paddings.shape[0] ${e.length} must be equal to [blockShape] ${t.length}`),k(o.shape.reduce((a,i,p)=>p>0&&p<=t.length?a&&(i+e[p-1][0]+e[p-1][1])%t[p-1]===0:a,!0),()=>`input spatial dimensions ${o.shape.slice(1)} with paddings ${e.toString()} must be divisible by blockShapes ${t.toString()}`);let n={x:o},s={blockShape:t,paddings:e};return v.runKernel(qn,n,s)}var ps=N({spaceToBatchND_:t_});function e_(r,t,e,o,n,s,a){n==null&&(n=[1,1]),s==null&&(s=1),o===0&&(o="valid");let i=C(r,"x","maxPool"),p=i,c=!1;i.rank===3&&(c=!0,p=R(i,[1,i.shape[0],i.shape[1],i.shape[2]])),k(Ce(s,n),()=>`Error in pool: Either strides or dilations must be 1. Got strides ${s} and dilations '${n}'`);let l=bh(p.shape,t,s,n,o),u=[l.dilationHeight,l.dilationWidth],m;o==="same"?m=o_([l.filterHeight,l.filterWidth],u):m=[[0,0],[0,0]];let f=u[0]===1&&u[1]===1,[d,g]=r_([l.inHeight,l.inWidth],u,m),h=f?o:"valid",x=f?p:ps(p,u,d),S=(e==="avg"?()=>Ei(x,t,s,h,a):()=>Bi(x,t,s,h,a))(),w=f?S:Jn(S,u,g);return c?R(w,[w.shape[1],w.shape[2],w.shape[3]]):w}function r_(r,t,e){let o=e.map(l=>l[0]),n=e.map(l=>l[1]),s=r.concat(o,n),a=t.map((l,u)=>(l-s[u]%l)%l),i=n.map((l,u)=>l+a[u]),p=t.map((l,u)=>[o[u],i[u]]),c=t.map((l,u)=>[0,a[u]]);return[p,c]}function o_(r,t){let o=r.map((a,i)=>a+(a-1)*(t[i]-1)).map(a=>a-1),n=o.map(a=>Math.floor(a/2)),s=o.map((a,i)=>a-n[i]);return o.map((a,i)=>[n[i],s[i]])}var xl=N({pool_:e_});function n_(r,t){let e=C(r,"x","prelu"),o=C(t,"alpha","prelu"),n={x:e,alpha:o};return v.runKernel(Mn,n)}var zi=N({prelu_:n_});function yl(r,t=!1){console.log(r.toString(t))}function s_(r,t=null,e=!1){let o=C(r,"x","prod");o.dtype==="bool"&&(o=X(o,"int32"));let n={x:o},s={axis:t,keepDims:e};return v.runKernel(Bn,n,s)}var bl=N({prod_:s_});function a_(r,t,e,o){let n=r.map((l,u)=>C(l,`tensors${u}`,"raggedGather","int32")),s=C(t,"paramsDenseValues","raggedGather"),a=C(e,"indices","raggedGather","int32"),i={paramsNestedSplits:n,paramsDenseValues:s,indices:a},p={outputRaggedRank:o},c=v.runKernel(Qa,i,p);return{outputNestedSplits:c.slice(0,c.length-1),outputDenseValues:c[c.length-1]}}var Qh=N({raggedGather_:a_});function i_(r,t,e,o,n){let s=C(r,"shape","raggedTensorToTensor","int32"),a=C(t,"values","raggedTensorToTensor"),i=C(e,"defaultValue","raggedTensorToTensor",a.dtype),p=o.map((u,m)=>C(u,`tensors${m}`,"raggedTensorToTensor","int32")),c={shape:s,values:a,defaultValue:i,rowPartitionTensors:p},l={rowPartitionTypes:n};return v.runKernel(Ja,c,l)}var Jh=N({raggedTensorToTensor_:i_});function p_(r,t,e){let o=It(r),n=null;if(e==null||e==="float32")n=new Float32Array(o);else if(e==="int32")n=new Int32Array(o);else if(e==="bool")n=new Uint8Array(o);else throw new Error(`Unknown data type ${e}`);for(let s=0;s<o;s++)n[s]=t();return v.makeTensor(n,r,e)}var tg=N({rand_:p_});var Fu=Ud(ig());var ug={};At(ug,{TEST_EPSILON_FLOAT16:()=>l0,createVideoElement:()=>S_,encodeStrings:()=>u0,expectArrayBuffersEqual:()=>T_,expectArraysClose:()=>g_,expectArraysEqual:()=>y_,expectNumbersClose:()=>b_,expectPromiseToFail:()=>x_,expectValuesInRange:()=>C_,play:()=>w_,testEpsilon:()=>cg});var h_=.001,l0=.1;function g_(r,t,e){return e==null&&(e=cg()),pg(r,t,(o,n)=>lg(o,n,e))}function cg(){return v.backend.floatPrecision()===32?h_:l0}function pg(r,t,e){let o=!0;if((me(r)||me(t))&&(o=!1),me(r)&&me(t)&&(o=!0),o){let a=r.constructor.name,i=t.constructor.name;if(a!==i)throw new Error(`Arrays are of different type. Actual: ${a}. Expected: ${i}`)}if(Array.isArray(r)&&Array.isArray(t)){let a=Ie(r),i=Ie(t);if(!Qe(a,i))throw new Error(`Arrays have different shapes. Actual: [${a}]. Expected: [${i}]`)}let n=me(r)?r:Br(r),s=me(t)?t:Br(t);if(n.length!==s.length)throw new Error(`Arrays have different lengths actual: ${n.length} vs expected: ${s.length}.
Actual:   ${n}.
Expected: ${s}.`);for(let a=0;a<s.length;++a){let i=n[a],p=s[a];if(!e(i,p))throw new Error(`Arrays differ: actual[${a}] = ${i}, expected[${a}] = ${p}.
Actual:   ${n}.
Expected: ${s}.`)}typeof expect!="undefined"&&expect().nothing()}function x_(r,t){r().then(()=>t.fail(),()=>t()),typeof expect!="undefined"&&expect().nothing()}function y_(r,t){let e=typeof t=="string"||typeof t=="number"||typeof t=="boolean"?[t]:t;return Gr(r)||Gr(r[0])||Gr(t)||Gr(t[0])?pg(r,e,(o,n)=>o==n):pg(r,t,(o,n)=>lg(o,n,0))}function b_(r,t,e){if(e==null&&(e=cg()),!lg(r,t,e))throw new Error(`Numbers differ: actual === ${r}, expected === ${t}`);typeof expect!="undefined"&&expect().nothing()}function lg(r,t,e){return!isFinite(r)&&!isFinite(t)?!0:!(isNaN(r)||isNaN(t)||Math.abs(r-t)>e)}function C_(r,t,e){for(let o=0;o<r.length;o++)if(r[o]<t||r[o]>e)throw new Error(`Value out of range:${r[o]} low: ${t}, high: ${e}`)}function T_(r,t){let e=new Float32Array(r),o=new Float32Array(t);if(e.length!==o.length)throw new Error(`Expected ArrayBuffer to be of length ${o.length}, but it was ${e.length}`);for(let n=0;n<o.length;n++)if(e[n]!==o[n])throw new Error(`Expected ArrayBuffer value at ${n} to be ${o[n]} but got ${e[n]} instead`)}function u0(r){for(let t=0;t<r.length;t++){let e=r[t];Array.isArray(e)?u0(e):r[t]=js(e)}return r}function S_(r){let t=document.createElement("video");return"playsInline"in t&&(t.playsInline=!0),t.muted=!0,t.loop=!0,t.style.position="fixed",t.style.left="0px",t.style.top="0px",t.preload="auto",t.appendChild(r),new Promise(e=>{t.addEventListener("loadeddata",o=>e(t)),t.load()})}async function w_(r){await r.play(),"requestVideoFrameCallback"in r&&await new Promise(t=>{r.requestVideoFrameCallback(t)})}var Ui=class{constructor(t,e,o,n,s){this.mean=t,this.stdDev=e,this.dtype=o,this.nextVal=NaN,this.truncated=n,this.truncated&&(this.upper=this.mean+this.stdDev*2,this.lower=this.mean-this.stdDev*2);let a=s||Math.random();this.random=Fu.alea(a.toString())}nextValue(){if(!isNaN(this.nextVal)){let n=this.nextVal;return this.nextVal=NaN,n}let t,e,o=!1;for(;!o;){let n,s,a;do n=2*this.random()-1,s=2*this.random()-1,a=n*n+s*s;while(a>=1||a===0);let i=Math.sqrt(-2*Math.log(a)/a);t=this.mean+this.stdDev*n*i,e=this.mean+this.stdDev*s*i,(!this.truncated||this.isValidTruncated(t))&&(o=!0)}return(!this.truncated||this.isValidTruncated(e))&&(this.nextVal=this.convertValue(e)),this.convertValue(t)}convertValue(t){return this.dtype==null||this.dtype==="float32"?t:Math.round(t)}isValidTruncated(t){return t<=this.upper&&t>=this.lower}},Du=class{constructor(t,e,o,n){this.alpha=t,this.beta=1/e,this.dtype=o;let s=n||Math.random();this.randu=Fu.alea(s.toString()),this.randn=new Ui(0,1,o,!1,this.randu()),t<1?this.d=t+2/3:this.d=t-1/3,this.c=1/Math.sqrt(9*this.d)}nextValue(){let t,e,o,n,s,a;for(;;){do n=this.randn.nextValue(),a=1+this.c*n;while(a<=0);if(a*=a*a,t=n*n,e=1-.331*t*t,o=.5*t+this.d*(1-a+Math.log(a)),s=this.randu(),s<e||Math.log(s)<o)break}return a=1/this.beta*this.d*a,this.alpha<1&&(a*=Math.pow(this.randu(),1/this.alpha)),this.convertValue(a)}convertValue(t){return this.dtype==="float32"?t:Math.round(t)}},Ru=class{constructor(t=0,e=1,o,n){if(this.canReturnFloat=()=>this.dtype==null||this.dtype==="float32",this.min=t,this.range=e-t,this.dtype=o,n==null&&(n=Math.random()),typeof n=="number"&&(n=n.toString()),!this.canReturnFloat()&&this.range<=1)throw new Error(`The difference between ${t} - ${e} <= 1 and dtype is not float`);this.random=Fu.alea(n)}convertValue(t){return this.canReturnFloat()?t:Math.round(t)}nextValue(){return this.convertValue(this.min+this.range*this.random())}};function N_(r,t,e=1,o="float32",n){if(e==null&&(e=1),o==null&&(o="float32"),o!=="float32"&&o!=="int32")throw new Error(`Unsupported data type ${o}`);let s=new Du(t,e,o,n),a=pt(r,o);for(let i=0;i<a.values.length;i++)a.values[i]=s.nextValue();return a.toTensor()}var mg=N({randomGamma_:N_});function v_(r,t=0,e=1,o,n){if(o!=null&&o==="bool")throw new Error(`Unsupported data type ${o}`);let s=new Ui(t,e,o,!1,n),a=pt(r,o);for(let i=0;i<a.values.length;i++)a.values[i]=s.nextValue();return a.toTensor()}var Cl=N({randomNormal_:v_});function I_(r,t,e){if(t!=null&&t==="bool")throw new Error(`Unsupported data type ${t}`);return Cl(r,0,1,t,e)}var fg=N({randomStandardNormal_:I_});function k_(r,t=0,e=1,o="float32",n){let s=pt(r,o),a=new Ru(t,e,null,n);for(let i=0;i<s.values.length;i++)s.values[i]=a.nextValue();return s.toTensor()}var Tl=N({randomUniform_:k_});function cs(r,t,e=1,o="float32"){if(e===0)throw new Error("Cannot have a step of zero");let n={start:r,stop:t,step:e,dtype:o};return v.runKernel(ti,{},n)}function E_(r){let e={input:C(r,"input","real")};return v.runKernel(ei,e)}var Xo=N({real_:E_});function $_(r){let e={x:C(r,"x","reciprocal")};return v.runKernel(Ao,e)}var Sl=N({reciprocal_:$_});function A_(r){let e={x:C(r,"x","relu")};return v.runKernel(Do,e)}var Yr=N({relu_:A_});function D_(r){let e={x:C(r,"x","relu6")};return v.runKernel(Ro,e)}var Hi=N({relu6_:D_});function R_(r,t){let o={x:C(r,"x","reverse")},n={dims:t};return v.runKernel(Wn,o,n)}var ke=N({reverse_:R_});function F_(r){let t=C(r,"x","reverse");return k(t.rank===1,()=>`Error in reverse1D: x must be rank 1 but got rank ${t.rank}.`),ke(t,0)}var dg=N({reverse1d_:F_});function __(r,t){let e=C(r,"x","reverse");return k(e.rank===2,()=>`Error in reverse2D: x must be rank 2 but got rank ${e.rank}.`),ke(e,t)}var hg=N({reverse2d_:__});function O_(r,t){let e=C(r,"x","reverse");return k(e.rank===3,()=>`Error in reverse3D: x must be rank 3 but got rank ${e.rank}.`),ke(e,t)}var gg=N({reverse3d_:O_});function P_(r,t){let e=C(r,"x","reverse");return k(e.rank===4,()=>`Error in reverse4D: x must be rank 4 but got rank ${e.rank}.`),ke(e,t)}var xg=N({reverse4d_:P_});function L_(r){let e={x:C(r,"x","round")};return v.runKernel(Fo,e)}var qi=N({round_:L_});function M_(r){let e={x:C(r,"x","rsqrt","float32")};return v.runKernel(_o,e)}var Ki=N({rsqrt_:M_});function B_(r){let e={x:C(r,"x","selu")};return v.runKernel(Oo,e)}var wl=N({selu_:B_});function G_(r,t,e,o,n,s=[1,1],a="NHWC"){let i=C(r,"x","separableConv2d"),p=C(t,"depthwiseFilter","separableConv2d"),c=C(e,"pointwiseFilter","separableConv2d"),l=i,u=!1;if(i.rank===3&&(u=!0,l=R(i,[1,i.shape[0],i.shape[1],i.shape[2]])),a==="NCHW")throw new Error("separableConv2d currently does not support dataFormat NCHW; only NHWC is supported");k(l.rank===4,()=>`Error in separableConv2d: input must be rank 4, but got rank ${l.rank}.`),k(p.rank===4,()=>`Error in separableConv2d: depthwise filter must be rank 4, but got rank ${p.rank}.`),k(c.rank===4,()=>`Error in separableConv2d: pointwise filter must be rank 4, but got rank ${p.rank}.`),k(c.shape[0]===1,()=>`Error in separableConv2d: the first dimension of pointwise filter  must be 1, but got ${c.shape[0]}.`),k(c.shape[1]===1,()=>`Error in separableConv2d: the second dimension of pointwise filter must be 1, but got ${c.shape[1]}.`);let m=p.shape[2],f=p.shape[3];k(c.shape[2]===m*f,()=>`Error in separableConv2d: the third dimension of pointwise filter must be ${m*f}, but got ${c.shape[2]}.`);let d=es(l,p,o,n,a,s),h=dr(d,c,1,"valid",a);return u?R(h,[h.shape[1],h.shape[2],h.shape[3]]):h}var Nl=N({separableConv2d_:G_});async function V_(r,t){let e=C(r,"x","setdiff1d"),o=C(t,"y","setdiff1d");k(e.dtype===o.dtype,()=>`x and y should have the same dtype, but got x (${e.dtype}) and y (${o.dtype}).`),k(e.rank===1,()=>`x should be 1D tensor, but got x (${e.shape}).`),k(o.rank===1,()=>`y should be 1D tensor, but got y (${o.shape}).`);let n=await e.data(),s=await o.data(),a=new Set(s),i=0;for(let l=0;l<n.length;l++)a.has(n[l])||i++;let p=new _t([i],e.dtype),c=new _t([i],"int32");for(let l=0,u=0;l<n.length;l++)a.has(n[l])||(p.values[u]=n[l],c.values[u]=l,u++);return[p.toTensor(),c.toTensor()]}var yg=V_;function z_(r){let e={x:C(r,"x","sign")};return v.runKernel(Lo,e)}var vl=N({sign_:z_});function W_(r){let e={x:C(r,"x","sin","float32")};return v.runKernel("Sin",e)}var Xi=N({sin_:W_});function U_(r){let e={x:C(r,"x","sinh")};return v.runKernel(Po,e)}var ji=N({sinh_:U_});function H_(r,t,e){let o=C(r,"x","slice1d");return k(o.rank===1,()=>`slice1d expects a rank-1 tensor, but got a rank-${o.rank} tensor`),xt(o,[t],[e])}var bg=N({slice1d_:H_});function q_(r,t,e){let o=C(r,"x","slice2d");return k(o.rank===2,()=>`slice2d expects a rank-2 tensor, but got a rank-${o.rank} tensor`),xt(o,t,e)}var Cg=N({slice2d_:q_});function K_(r,t,e){let o=C(r,"x","slice3d");return k(o.rank===3,()=>`slice3d expects a rank-3 tensor, but got a rank-${o.rank} tensor`),xt(o,t,e)}var Tg=N({slice3d_:K_});function X_(r,t,e){let o=C(r,"x","slice4d");return k(o.rank===4,()=>`slice4d expects a rank-4 tensor, but got a rank-${o.rank} tensor`),xt(o,t,e)}var Sg=N({slice4d_:X_});function j_(r,t=-1){let e=C(r,"logits","softmax","float32");if(t===-1&&(t=e.rank-1),t!==e.rank-1)throw Error(`Softmax along a non-last dimension is not yet supported. Logits was rank ${e.rank} and dim was ${t}`);let o={logits:e},n={dim:t};return v.runKernel(Xn,o,n)}var Il=N({softmax_:j_});function Y_(r){k(r.dtype==="complex64",()=>`The dtype for tf.spectral.fft() must be complex64 but got ${r.dtype}.`);let t={input:r};return v.runKernel("FFT",t)}var ls=N({fft_:Y_});function Z_(r){k(r.dtype==="complex64",()=>`The dtype for tf.spectral.ifft() must be complex64 but got ${r.dtype}.`);let t={input:r};return v.runKernel(La,t)}var jo=N({ifft_:Z_});function Q_(r){let t=r.shape[r.shape.length-1],e=r.size/t,o;if(t<=2){let n=R(r,[e,t]);o=jo(n)}else{let n=[e,2*(t-1)],s=R(Xo(r),[e,t]),a=R(ss(r),[e,t]),i=ke(xt(s,[0,1],[e,t-2]),1),p=O(ke(xt(a,[0,1],[e,t-2]),1),J(-1)),c=Lt([s,i],1),l=Lt([a,p],1),u=R(Be(c,l),[n[0],n[1]]);o=jo(u)}if(o=Xo(o),r.rank===3&&r.shape[0]!==0){let n=o,s=r.shape[0];o=R(o,[s,o.shape[0]/s,o.shape[1]]),n.dispose()}return o}var Yi=N({irfft_:Q_});function J_(r,t,e=0){let n={x:C(r,"x","split")},s={numOrSizeSplits:t,axis:e};return v.runKernel(Kn,n,s)}var or=N({split_:J_});function tO(r,t){k(r.dtype==="float32",()=>`The dtype for rfft() must be real value but got ${r.dtype}`);let e=r.shape[r.shape.length-1],o=r.size/e,n;if(t!=null&&t<e){let d=r.shape.map(h=>0),g=r.shape.map(h=>h);g[r.shape.length-1]=t,n=xt(r,d,g),e=t}else if(t!=null&&t>e){let d=r.shape.map(g=>g);d[r.shape.length-1]=t-e,n=Lt([r,_e(d)],r.shape.length-1),e=t}else n=r;let s=mt(n),a=R(Be(n,s),[o,e]),i=ls(a),p=Math.floor(e/2)+1,c=Xo(i),l=ss(i),u=or(c,[p,e-p],c.shape.length-1),m=or(l,[p,e-p],l.shape.length-1),f=n.shape.slice();return f[n.shape.length-1]=p,R(Be(u[0],m[0]),f)}var us=N({rfft_:tO});function eO(r,t){let e=C(r,"a","squaredDifference"),o=C(t,"b","squaredDifference");[e,o]=Nt(e,o),bt(e.shape,o.shape);let n={a:e,b:o},s={};return v.runKernel(Vo,n,s)}var Zi=N({squaredDifference_:eO});function rO(r,t){let e=C(r,"x","squeeze","string_or_numeric");return R(e,Hd(e.shape,t).newShape)}var ms=N({squeeze_:rO});function oO(r,t=0){let e=Qn(r,"tensors","stack","string_or_numeric");k(e.length>=1,()=>"Pass at least one tensor to tf.stack"),e.length>0&&k(t<=e[0].rank,()=>"Axis must be <= rank of the tensor");let o=e,n={axis:t};return v.runKernel(Pn,o,n)}var fe=N({stack_:oO});function nO(r,t=0){let o={x:C(r,"x","step")},n={alpha:t};return v.runKernel(Wo,o,n)}var yr=N({step_:nO});function sO(r,t,e,o,n=0,s=0,a=0,i=0,p=0){let l={x:C(r,"x","stridedSlice","string_or_numeric")},u={begin:t,end:e,strides:o,beginMask:n,endMask:s,ellipsisMask:a,newAxisMask:i,shrinkAxisMask:p};return v.runKernel(fi,l,u)}var kl=N({stridedSlice_:sO});function aO(r){let e={x:C(r,"x","tan","float32")};return v.runKernel("Tan",e)}var El=N({tan_:aO});function Te(r,t,e){let o=Ie(r,e);return Ve(r,t,o,e)}function Ee(r,t){ur(r);let e=Ie(r,t);if(e.length!==1)throw new Error("tensor1d() requires values to be a flat/TypedArray");return Ve(r,null,e,t)}function fs(r,t,e){if(ur(r),t!=null&&t.length!==2)throw new Error("tensor2d() requires shape to have two numbers");let o=Ie(r,e);if(o.length!==2&&o.length!==1)throw new Error("tensor2d() requires values to be number[][] or flat/TypedArray");if(o.length===1&&t==null)throw new Error("tensor2d() requires shape to be provided when `values` are a flat/TypedArray");return Ve(r,t,o,e)}function $l(r,t,e){if(ur(r),t!=null&&t.length!==3)throw new Error("tensor3d() requires shape to have three numbers");let o=Ie(r,e);if(o.length!==3&&o.length!==1)throw new Error("tensor3d() requires values to be number[][][] or flat/TypedArray");if(o.length===1&&t==null)throw new Error("tensor3d() requires shape to be provided when `values` are a flat array");return Ve(r,t,o,e)}function wg(r,t,e){if(ur(r),t!=null&&t.length!==4)throw new Error("tensor4d() requires shape to have four numbers");let o=Ie(r,e);if(o.length!==4&&o.length!==1)throw new Error("tensor4d() requires values to be number[][][][] or flat/TypedArray");if(o.length===1&&t==null)throw new Error("tensor4d() requires shape to be provided when `values` are a flat array");return Ve(r,t,o,e)}function Ng(r,t,e){if(ur(r),t!=null&&t.length!==5)throw new Error("tensor5d() requires shape to have five numbers");let o=Ie(r,e);if(o.length!==5&&o.length!==1)throw new Error("tensor5d() requires values to be number[][][][][] or flat/TypedArray");if(o.length===1&&t==null)throw new Error("tensor5d() requires shape to be provided when `values` are a flat array");return Ve(r,t,o,e)}function vg(r,t,e){if(ur(r),t!=null&&t.length!==6)throw new Error("tensor6d() requires shape to have six numbers");let o=Ie(r,e);if(o.length!==6&&o.length!==1)throw new Error("tensor6d() requires values to be number[][][][][][] or flat/TypedArray");if(o.length===1&&t==null)throw new Error("tensor6d() requires shape to be provided when `values` are a flat array");return t=t||o,Ve(r,t,o,e)}function iO(r,t=1,e=!0){let o=C(r,"x","topk");if(o.rank===0)throw new Error("topk() expects the input to be of rank 1 or higher");let n=o.shape[o.shape.length-1];if(t<0)throw new Error(`'k' passed to topk() must be >= 0 but got ${t}`);if(t>n)throw new Error(`'k' passed to topk() must be <= the last dimension (${n}) but got ${t}`);let s={x:o},a={k:t,sorted:e},[i,p]=v.runKernel(xi,s,a);return{values:i,indices:p}}var Al=N({topk_:iO});function pO(r,t=0,e=1,o,n){if(o!=null&&o==="bool")throw new Error("Unsupported data type $ { dtype }");let s=new Ui(t,e,o,!0,n),a=pt(r,o);for(let i=0;i<a.values.length;i++)a.values[i]=s.nextValue();return a.toTensor()}var Ig=N({truncatedNormal_:pO});function cO(r,t=0){let e=C(r,"x","unique","string_or_numeric");k(e.rank>0,()=>"The input tensor must be at least 1D");let o={x:e},n={axis:t},[s,a]=v.runKernel(bi,o,n);return{values:s,indices:a}}var Dl=N({unique_:cO});function lO(r,t,e){let o=C(r,"x","unsortedSegmentSum"),n=C(t,"segmentIds","unsortedSegmentSum","int32");k(cn(e),()=>"numSegments must be of dtype int");let s={x:o,segmentIds:n},a={numSegments:e};return v.runKernel(Yn,s,a)}var Qi=N({unsortedSegmentSum_:lO});function uO(r,t=0){let e=C(r,"x","unstack","string_or_numeric");k(t>=-e.shape.length&&t<e.shape.length,()=>`Axis = ${t} is not in [-${e.shape.length}, ${e.shape.length})`);let o={value:e},n={axis:t};return v.runKernel(jn,o,n)}var $e=N({unstack_:uO});function kg(r,t){return Gp(r,t,"right")}function Eg(r,t=!0,e,o){return v.makeVariable(r,t,e,o)}function _u(r,t){let e=[];for(let s=0;s<t.length;s++)t[s]&&e.push(s);let o=pt(r,"int32"),n=pt([e.length,r.length],"int32");for(let s=0;s<e.length;s++){let a=o.indexToLoc(e[s]),i=s*r.length;n.values.set(a,i)}return n.toTensor()}async function mO(r){let t=C(r,"condition","whereAsync","bool"),e=await t.data(),o=_u(t.shape,e);return r!==t&&t.dispose(),o}var Rl=mO;async function fO(r,t,e){let o=C(r,"tensor","boolMask"),n=C(t,"mask","boolMask","bool"),s=e==null?0:e,a=n.rank,i=o.shape;k(a>0,()=>"mask cannot be scalar"),Wt(i.slice(s,s+a),n.shape,"mask's shape must match the first K dimensions of tensor's shape,");let p=1;for(let g=s;g<s+a;g++)p*=i[g];let c=i.slice(0,s).concat([p],i.slice(s+a)),l=R(o,c),u=R(n,[-1]),m=await Rl(u),f=ms(m,[1]),d=ns(l,f,s);return r!==o&&o.dispose(),t!==n&&n.dispose(),f.dispose(),l.dispose(),u.dispose(),m.dispose(),d}var m0=fO;function dO(){_().set("PROD",!0)}function hO(){_().set("DEBUG",!0)}function gO(){_().set("DEPRECATION_WARNINGS_ENABLED",!1),console.warn("TensorFlow.js deprecation warnings have been disabled.")}function f0(r){_().getBool("DEPRECATION_WARNINGS_ENABLED")&&console.warn(r+" You can disable deprecation warnings with tf.disableDeprecationWarnings().")}_b(f0);function xO(){v.disposeVariables()}function Zr(){return v}function yO(){return v.memory()}function bO(r){return v.profile(r)}function St(r,t){return v.tidy(r,t)}function ie(r){Fc(r).forEach(e=>e.dispose())}function nr(r){return v.keep(r)}function CO(r){return v.time(r)}function TO(r){return v.setBackend(r)}function SO(){return v.ready()}function wO(){return v.backendName}function NO(r){v.removeBackend(r)}function vO(r){return v.findBackend(r)}function IO(r){return v.findBackendFactory(r)}function Fl(r,t,e=1){return v.registerBackend(r,t,e)}function kO(){return v.backend}function EO(r,t){_().setPlatform(r,t)}function $O(r,t,e){let o=C(r,"x","transpose");if(t==null&&(t=o.shape.map((a,i)=>i).reverse()),k(o.rank===t.length,()=>`Error in transpose: rank of input ${o.rank} must match length of perm ${t}.`),t.forEach(a=>{k(a>=0&&a<o.rank,()=>`All entries in 'perm' must be between 0 and ${o.rank-1} but got ${t}`)}),o.rank<=1)return o.clone();let n={x:o},s={perm:t};return o.dtype==="complex64"?St(()=>{let a=Xo(o),i=ss(o);return a=v.runKernel(Ur,{x:a},s),i=v.runKernel(Ur,{x:i},s),e&&(i=$t(i)),Be(a,i)}):v.runKernel(Ur,n,s)}var Se=N({transpose_:$O});function AO(r,t,e,o,n=!0){let s=C(r,"v","movingAverage"),a=C(t,"x","movingAverage"),i=C(e,"decay","movingAverage");fh(s,a),k(Qe(s.shape,a.shape),()=>"Shape mismatch in v and x");let p=J(1),c=rt(p,i),l=O(rt(a,s),c);if(n){k(o!=null,()=>"When using zeroDebias: true, step is required.");let u=C(o,"step","movingAverage");l=st(l,rt(p,Ge(i,u)))}return tt(s,l)}var d0=N({movingAverage_:AO});var Pu={};At(Pu,{calculateShapes:()=>h0,validateInput:()=>Ou,validateUpdateShape:()=>$g});function $g(r,t,e){let o=t.rank>1?t.shape[t.rank-1]:1,n=t.rank>1?t.rank-1:1,s=`Must have updates.shape = indices.shape[:batchDim] + shape[sliceDim:], got updates.shape: ${e.shape}, indices.shape: ${t.shape}, shape: ${r}, sliceDim: ${o}, and batchDim: ${n}.`;if(e.rank<n)throw new Error(s+` update.rank < ${n}. `);if(r.length<o+(e.rank-n))throw new Error(s+` Output shape length < ${o+(e.rank-n)}`);if(e.rank!==n+r.length-o)throw new Error(s+` update.rank != ${n+r.length-o}`);for(let a=0;a<n;++a)if(e.shape[a]!==t.shape[a])throw new Error(s+` updates.shape[${a}] (${e.shape[a]}) != indices.shape[${a}] (${t.shape[a]}).`);for(let a=0;a<e.rank-n;++a)if(e.shape[a+n]!==r[a+o])throw new Error(s+` updates.shape[${a+n}] (${e.shape[a+n]}) != shape[${a+n}] (${r[a+n]})`)}function Ou(r,t,e){if(t.rank<1)throw new Error(`tf.scatterND() expects the indices to be rank 1 or higher, but the rank was ${t.rank}.`);if(r.rank<1)throw new Error(`tf.scatterND() expects the updates to be rank 1 or higher, but the rank was ${r.rank}.`);if(t.dtype!=="int32")throw new Error(`The dtype of 'indices' should be int32, but got dtype: ${t.dtype}`);if(e.length<1)throw new Error(`Output rank must be greater or equal to 1, but got shape: ${e}`);if(e.length===0){if(t.size===0)throw new Error(`Indices specified for empty output. indices shape: ${t.shape}`);if(r.size===0)throw new Error(`Updates specified for empty output. updates shape: ${r.shape}`)}$g(e,t,r)}function h0(r,t,e){let o=t.shape.length,n=o>1?t.shape[o-1]:1,s=e.length,a=1;for(let u=n;u<s;++u)a*=e[u];let i=n<1?1:n,p=It(t.shape)/i,c=[...so(e.slice(0,n)),1],l=It(e);return{sliceRank:n,numUpdates:p,sliceSize:a,strides:c,outputSize:l}}function DO(r,t,e){let o=C(r,"indices","scatterND","int32"),n=C(t,"updates","scatterND");Ou(n,o,e);let s={indices:o,updates:n},a={shape:e};return v.runKernel(ni,s,a)}var g0=N({scatterND_:DO});function x0(r,t,e,o){if(r.dtype!=="int32")throw new Error(`tf.sparseToDense() expects the indices to be int32 type, but the dtype was ${r.dtype}.`);if(r.rank>2)throw new Error(`sparseIndices should be a scalar, vector, or matrix, but got shape ${r.shape}.`);let n=r.rank>0?r.shape[0]:1,s=r.rank>1?r.shape[1]:1;if(e.length!==s)throw new Error(`outputShape has incorrect number of elements:, ${e.length}, should be: ${s}.`);let a=t.size;if(!(t.rank===0||t.rank===1&&a===n))throw new Error(`sparseValues has incorrect shape ${t.shape}, should be [] or [${n}]`);if(t.dtype!==o.dtype)throw new Error("sparseValues.dtype must match defaultValues.dtype")}function FO(r,t,e,o=0){let n=C(r,"sparseIndices","sparseToDense","int32"),s=C(t,"sparseValues","sparseToDense","string_or_numeric"),a=C(o,"defaultValue","sparseToDense",s.dtype);x0(n,s,e,a);let i={sparseIndices:n,sparseValues:s,defaultValue:a},p={outputShape:e};return v.runKernel(ui,i,p)}var y0=N({sparseToDense_:FO});function _O(r,t){let e=C(t,"indices","gatherND","int32"),n={params:C(r,"x","gatherND","string_or_numeric"),indices:e};return v.runKernel(Pa,n)}var b0=N({gatherND_:_O});function C0(r,t){if(t==null)return r.shape.slice();if(Qe(r.shape,t))return t;if(r.shape.length===t.length){let e=[];for(let o=0;o<r.shape.length;o++)t[o]==null&&r.shape[o]!=null?e.push(r.shape[o]):e.push(t[o]);return e}return t}function OO(r,t,e,o){let n=C(r,"x","dropout");if(k(n.dtype==="float32",()=>`x has to be a floating point tensor since it's going to be scaled, but got a ${n.dtype} tensor instead.`),k(t>=0&&t<1,()=>`rate must be a float in the range [0, 1), but got ${t}.`),t===0)return r instanceof Rt?n.clone():n;let s=C0(n,e),a=1-t,i=st(os(tt(Tl(s,0,1,"float32",o),a)),a);return O(n,i)}var T0=N({dropout_:OO});function Lu(r){return Math.floor(Math.pow(2,Math.ceil(Math.log(r)/Math.log(2))))}function Vp(r,t,e){let o=1-r%2,n=new Float32Array(r);for(let s=0;s<r;++s){let a=2*Math.PI*s/(r+o-1);n[s]=t-e*Math.cos(a)}return Ee(n,"float32")}async function PO(r,t,e=1){let o=C(r,"predictions","inTopK"),n=C(t,"targets","inTopK");k(o.rank>1,()=>`inTopK() expects the predictions to be of rank 2 or higher, but got ${o.rank}`),k(o.rank-1===n.rank,()=>`predictions rank should be 1 larger than targets rank, but got predictions rank ${o.rank} and targets rank ${n.rank}`),Wt(o.shape.slice(0,o.shape.length-1),n.shape,"predictions's shape should be align with the targets' shape, except the last dimension.");let s=o.shape[o.shape.length-1];k(e>0&&e<=s,()=>`'k' passed to inTopK() must be > 0 && <= the predictions last dimension (${s}), but got ${e}`);let a=await o.data(),i=await n.data(),[p,c]=[a.length/s,s],l=qd("bool",p);for(let u=0;u<p;u++){let m=u*c,f=a.subarray(m,m+c),d=[];for(let g=0;g<f.length;g++)d.push({value:f[g],index:g});d.sort((g,h)=>h.value-g.value),l[u]=0;for(let g=0;g<e;g++)if(d[g].index===i[u]){l[u]=1;break}}return r!==o&&o.dispose(),t!==n&&n.dispose(),Te(l,n.shape,"bool")}var S0=PO;var Gu={};At(Gu,{conv2d:()=>w0,depthwiseConv2d:()=>N0,matMul:()=>v0});function LO(r,t,e,o,n,s="NHWC",a){let i=r;r.rank===3&&(i=R(r,[1,r.shape[0],r.shape[1],r.shape[2]]));let p=t;p.rank===3&&(p=R(t,[1,t.shape[0],t.shape[1],t.shape[2]])),k(i.rank===4,()=>`Error in conv2dDerFilter: input must be rank 4, but got shape ${i.shape}.`),k(p.rank===4,()=>`Error in conv2dDerFilter: dy must be rank 4, but got shape ${p.shape}.`),k(e.length===4,()=>`Error in conv2dDerFilter: filterShape must be length 4, but got ${e}.`);let c=s==="NHWC"?i.shape[3]:i.shape[1],l=s==="NHWC"?p.shape[3]:p.shape[1];k(c===e[2],()=>`Error in conv2dDerFilter: depth of input ${c}) must match input depth in filter (${e[2]}.`),k(l===e[3],()=>`Error in conv2dDerFilter: depth of dy (${l}) must match output depth for filter (${e[3]}).`),Gt("conv2dDerFilter",n,a);let u={x:i,dy:p},m={strides:o,pad:n,dataFormat:s,dimRoundingMode:a,filterShape:e};return v.runKernel(Sa,u,m)}var zp=N({conv2DBackpropFilter_:LO});function Ji(r,t,e){if(e==null||e==="linear")return r;if(e==="relu")return O(r,yr(t));throw new Error(`Cannot compute gradient for fused activation ${e}.`)}function tp(r,t){let e=t,o=Mt(r.shape,t.shape);return o.length>0&&(e=it(e,o)),R(e,r.shape)}function ep(r,t,e,o){if(t==="linear")return r;if(t==="relu")return Yr(r);if(t==="elu")return Ri(r);if(t==="relu6")return Hi(r);if(t==="prelu")return zi(r,e);if(t==="leakyrelu")return Fi(r,o);if(t==="sigmoid")return qe(r);throw new Error(`Unknown fused activation ${t}.`)}var rp=(r,t)=>!(r>0)||t==="linear";function MO({x:r,filter:t,strides:e,pad:o,dataFormat:n="NHWC",dilations:s=[1,1],dimRoundingMode:a,bias:i,activation:p="linear",preluActivationWeights:c,leakyreluAlpha:l}){if(p=p||"linear",rp(v.state.gradientDepth,p)===!1){k(n==="NHWC",()=>`Error in fused conv2d: got dataFormat of ${n} but only NHWC is currently supported for the case of gradient depth is 0 and the activation is not linear.`);let $=dr(r,t,e,o,n,s,a);return i!=null&&($=tt($,i)),ep($,p,c,l)}let u=C(r,"x","conv2d","float32"),m=C(t,"filter","conv2d","float32"),f=u,d=!1;u.rank===3&&(d=!0,f=R(u,[1,u.shape[0],u.shape[1],u.shape[2]])),k(f.rank===4,()=>`Error in fused conv2d: input must be rank 4, but got rank ${f.rank}.`),k(m.rank===4,()=>`Error in fused conv2d: filter must be rank 4, but got rank ${m.rank}.`),Gt("fused conv2d",o,a);let g=n==="NHWC"?f.shape[3]:f.shape[1];k(m.shape[2]===g,()=>`Error in conv2d: depth of input (${g}) must match input depth for filter ${m.shape[2]}.`),k(Ce(e,s),()=>`Error in conv2D: Either strides or dilations must be 1. Got strides ${e} and dilations '${s}'`);let h=ki(f.shape,m.shape,e,s,o,a),x;i!=null&&(x=C(i,"bias","fused conv2d"),[x]=Nt(x,u),n==="NHWC"?bt(h.outShape,x.shape):(k(x.shape.length<=1,()=>`Error in fused conv2d: only supports scalar or 1-D Tensor bias for NCHW format but got the bias of rank-${x.shape.length}.`),k(x.shape.length===0||x.shape[0]===h.outChannels||x.shape[0]===1,()=>`Error in fused conv2d: bias shape (${x.shape}) is not compatible with the number of output channels (${h.outChannels})`)));let b;if(c!=null){let $=c.shape;if(k($.length<=1||$.length===3,()=>`Error in fused conv2d: only supports scalar, 1-D Tensor or 3-D Tensor PReLU activation weights but got a tensor of rank-${$.length}.`),$.length===1)k($[0]===1||$[0]===h.outChannels,()=>`Error in fused conv2d: PReLU activation weights (${$}) is not compatible with the number of output channels (${h.outChannels}).`);else if($.length===3)try{bt($,h.outShape)}catch{let F=`Error in fused conv2d: PReLU activation weights (${$}) is not compatible with the output shape of the conv2d (${h.outShape}).`;throw Error(F)}b=C(c,"prelu weights","fused conv2d")}let S=($,D)=>{k(n==="NHWC",()=>`Error in gradient of fused conv2D: got dataFormat of ${n} but only NHWC is currently supported.`);let[F,P,L,M]=D,B=Ji($,L,p);k(mr(s),()=>`Error in gradient of fused conv2D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '${s}'`);let G=Bp(P.shape,B,F,e,o),z=zp(P,B,F.shape,e,o),V=[G,z];if(M!=null){let H=tp(M,B);V.push(H)}return V},w={x:f,filter:m,bias:x,preluActivationWeights:b},E={strides:e,pad:o,dataFormat:n,dilations:s,dimRoundingMode:a,activation:p,leakyreluAlpha:l};return i==null?Fe((D,F,P)=>{let L=v.runKernel(qs,w,E);return P([F,D,L]),d&&(L=R(L,[L.shape[1],L.shape[2],L.shape[3]])),{value:L,gradFunc:S}})(f,m):Fe((D,F,P,L)=>{let M=v.runKernel(qs,w,E);return L([F,D,M,P]),d&&(M=R(M,[M.shape[1],M.shape[2],M.shape[3]])),{value:M,gradFunc:S}})(f,m,x)}var w0=N({fusedConv2d_:MO});function BO(r,t,e,o,n,s=[1,1],a){let i=r;r.rank===3&&(i=R(r,[1,r.shape[0],r.shape[1],r.shape[2]]));let p=t;p.rank===3&&(p=R(t,[1,t.shape[0],t.shape[1],t.shape[2]]));let c={x:i,dy:p},l={strides:o,pad:n,dimRoundingMode:a,dilations:s,filterShape:e};return v.runKernel($a,c,l)}var Mu=N({depthwiseConv2dNativeBackpropFilter_:BO});function GO(r,t,e,o,n,s=[1,1],a){let i=t,p=!1;t.rank===3&&(p=!0,i=R(t,[1,t.shape[0],t.shape[1],t.shape[2]]));let c={dy:i,filter:e},l={strides:o,pad:n,dimRoundingMode:a,dilations:s,inputShape:r},u=v.runKernel(Aa,c,l);return p?R(u,[u.shape[1],u.shape[2],u.shape[3]]):u}var Bu=N({depthwiseConv2dNativeBackpropInput_:GO});function VO({x:r,filter:t,strides:e,pad:o,dataFormat:n="NHWC",dilations:s=[1,1],dimRoundingMode:a,bias:i,activation:p="linear",preluActivationWeights:c,leakyreluAlpha:l}){if(rp(v.state.gradientDepth,p)===!1){let E=es(r,t,e,o,n,s,a);return i!=null&&(E=tt(E,i)),ep(E,p,c,l)}let u=C(r,"x","depthwiseConv2d","float32"),m=C(t,"filter","depthwiseConv2d","float32"),f=u,d=!1;u.rank===3&&(d=!0,f=R(u,[1,u.shape[0],u.shape[1],u.shape[2]])),k(f.rank===4,()=>`Error in fused depthwiseConv2d: input must be rank 4, but got rank ${f.rank}.`),k(m.rank===4,()=>`Error in fused depthwiseConv2d: filter must be rank 4, but got rank ${m.rank}.`),k(f.shape[3]===m.shape[2],()=>`Error in fused depthwiseConv2d: number of input channels (${f.shape[3]}) must match the inChannels dimension in filter ${m.shape[2]}.`),s==null&&(s=[1,1]),k(Ce(e,s),()=>`Error in fused depthwiseConv2d: Either strides or dilations must be 1. Got strides ${e} and dilations '${s}'`),Gt("fused depthwiseConv2d",o,a);let g=ki(f.shape,m.shape,e,s,o,a,!0),h;i!=null&&(h=C(i,"bias","fused conv2d"),[h]=Nt(h,u),bt(g.outShape,h.shape));let x;c!=null&&(x=C(c,"prelu weights","fused depthwiseConv2d"));let b=(E,$)=>{k(mr(s),()=>`Error in gradient of fused depthwiseConv2d: dilation rates greater than 1 are not yet supported. Got dilations '${s}'`);let[D,F,P,L]=$,M=Ji(E,P,p),B=Bu(F.shape,M,D,e,o,s,a),G=Mu(F,M,D.shape,e,o,s,a);if(L!=null){let z=tp(h,M);return[B,G,z]}return[B,G]},S={x:f,filter:m,bias:h,preluActivationWeights:x},w={strides:e,pad:o,dataFormat:n,dilations:s,dimRoundingMode:a,activation:p,leakyreluAlpha:l};return i==null?Fe(($,D,F)=>{let P=v.runKernel(Ks,S,w);return F([D,$,P]),d&&(P=R(P,[P.shape[1],P.shape[2],P.shape[3]])),{value:P,gradFunc:b}})(f,m):Fe(($,D,F,P)=>{let L=v.runKernel(Ks,S,w);return P([D,$,L,F]),d&&(L=R(L,[L.shape[1],L.shape[2],L.shape[3]])),{value:L,gradFunc:b}})(f,m,h)}var N0=N({fusedDepthwiseConv2d_:VO});function zO({a:r,b:t,transposeA:e=!1,transposeB:o=!1,bias:n,activation:s="linear",preluActivationWeights:a,leakyreluAlpha:i=.2}){if(rp(v.state.gradientDepth,s)===!1){let M=Tt(r,t,e,o);return n!=null&&(M=tt(M,n)),ep(M,s,a,i)}let p=C(r,"a","fused matMul"),c=C(t,"b","fused matMul");[p,c]=Nt(p,c);let l=e?p.shape[p.rank-2]:p.shape[p.rank-1],u=o?c.shape[c.rank-1]:c.shape[c.rank-2],m=e?p.shape[p.rank-1]:p.shape[p.rank-2],f=o?c.shape[c.rank-2]:c.shape[c.rank-1],d=p.shape.slice(0,-2),g=c.shape.slice(0,-2),h=It(d),x=It(g);k(l===u,()=>`Error in fused matMul: inner shapes (${l}) and (${u}) of Tensors with shapes ${p.shape} and ${c.shape} and transposeA=${e} and transposeB=${o} must match.`);let S=bt(p.shape.slice(0,-2),c.shape.slice(0,-2)).concat([m,f]),w=e?R(p,[h,l,m]):R(p,[h,m,l]),E=o?R(c,[x,f,u]):R(c,[x,u,f]),$;n!=null&&($=C(n,"bias","fused matMul"),[$]=Nt($,p),bt(S,$.shape));let D;a!=null&&(D=C(a,"prelu weights","fused matMul"));let F=(M,B)=>{let[G,z,V,H]=B,q=Ji(R(M,V.shape),V,s),W,K;if(!e&&!o?(W=Tt(q,z,!1,!0),K=Tt(G,q,!0,!1)):!e&&o?(W=Tt(q,z,!1,!1),K=Tt(q,G,!0,!1)):e&&!o?(W=Tt(z,q,!1,!0),K=Tt(G,q,!1,!1)):(W=Tt(z,q,!0,!0),K=Tt(q,G,!0,!0)),n!=null){let Y=tp(H,q);return[W,K,Y]}else return[W,K]},P={a:w,b:E,bias:$,preluActivationWeights:D},L={transposeA:e,transposeB:o,activation:s,leakyreluAlpha:i};return n==null?Fe((B,G,z)=>{let V=v.runKernel(Hs,P,L);return z([B,G,V]),{value:R(V,S),gradFunc:F}})(w,E):Fe((B,G,z,V)=>{let H=v.runKernel(Hs,P,L);return V([B,G,H,z]),{value:R(H,S),gradFunc:F}})(w,E,$)}var v0=N({fusedMatMul_:zO});function WO(r){return Vp(r,.54,.46)}var I0=N({hammingWindow_:WO});function UO(r){return Vp(r,.5,.5)}var Vu=N({hannWindow_:UO});function HO(r,t,e,o=!1,n=0){let s=0,a=[];for(;s+t<=r.size;)a.push(xt(r,s,t)),s+=e;if(o)for(;s<r.size;){let i=s+t-r.size,p=Lt([xt(r,s,t-i),jr([i],n)]);a.push(p),s+=e}return a.length===0?fs([],[0,t]):R(Lt(a),[a.length,t])}var zu=N({frame_:HO});function qO(r,t,e,o,n=Vu){o==null&&(o=Lu(t));let s=zu(r,t,e),a=O(s,n(t));return us(a,o)}var k0=N({stft_:qO});function KO(r,t,e,o,n="bilinear",s=0){let a=C(r,"image","cropAndResize"),i=C(t,"boxes","cropAndResize","float32"),p=C(e,"boxInd","cropAndResize","int32"),c=i.shape[0];k(a.rank===4,()=>`Error in cropAndResize: image must be rank 4,but got rank ${a.rank}.`),k(i.rank===2&&i.shape[1]===4,()=>`Error in cropAndResize: boxes must be have size [${c},4] but had shape ${i.shape}.`),k(p.rank===1&&p.shape[0]===c,()=>`Error in cropAndResize: boxInd must be have size [${c}] but had shape ${i.shape}.`),k(o.length===2,()=>`Error in cropAndResize: cropSize must be of length 2, but got length ${o.length}.`),k(o[0]>=1&&o[1]>=1,()=>`cropSize must be atleast [1,1], but was ${o}`),k(n==="bilinear"||n==="nearest",()=>`method must be bilinear or nearest, but was ${n}`);let l={image:a,boxes:i,boxInd:p},u={method:n,extrapolationValue:s,cropSize:o};return v.runKernel(Ia,l,u)}var E0=N({cropAndResize_:KO});function XO(r){let t=C(r,"image","flipLeftRight","float32");k(t.rank===4,()=>`Error in flipLeftRight: image must be rank 4,but got rank ${t.rank}.`);let e={image:t};return v.runKernel(Oa,e,{})}var $0=N({flipLeftRight_:XO});function jO(r){let t=C(r,"image","grayscaleToRGB"),e=t.rank-1,o=t.shape[e];k(t.rank>=2,()=>`Error in grayscaleToRGB: images must be at least rank 2, but got rank ${t.rank}.`),k(o===1,()=>`Error in grayscaleToRGB: last dimension of a grayscale image should be size 1, but got size ${o}.`);let n=new Array(t.rank);return n.fill(1,0,e),n[e]=3,gr(t,n)}var A0=N({grayscaleToRGB_:jO});function YO(r,t,e=0,o=.5){let n=C(r,"image","rotateWithOffset","float32");k(n.rank===4,()=>`Error in rotateWithOffset: image must be rank 4,but got rank ${n.rank}.`);let s={image:n},a={radians:t,fillValue:e,center:o};return v.runKernel(Ci,s,a)}var D0=N({rotateWithOffset_:YO});function Er(r,t,e,o,n,s){o==null&&(o=.5),n==null&&(n=Number.NEGATIVE_INFINITY),s==null&&(s=0);let a=r.shape[0];return e=Math.min(e,a),k(0<=o&&o<=1,()=>`iouThreshold must be in [0, 1], but was '${o}'`),k(r.rank===2,()=>`boxes must be a 2D tensor, but was of rank '${r.rank}'`),k(r.shape[1]===4,()=>`boxes must have 4 columns, but 2nd dimension was ${r.shape[1]}`),k(t.rank===1,()=>"scores must be a 1D tensor"),k(t.shape[0]===a,()=>`scores has incompatible shape with boxes. Expected ${a}, but was ${t.shape[0]}`),k(0<=s&&s<=1,()=>`softNmsSigma must be in [0, 1], but was '${s}'`),{maxOutputSize:e,iouThreshold:o,scoreThreshold:n,softNmsSigma:s}}function ZO(r,t,e,o=.5,n=Number.NEGATIVE_INFINITY){let s=C(r,"boxes","nonMaxSuppression","float32"),a=C(t,"scores","nonMaxSuppression","float32"),i=Er(s,a,e,o,n);e=i.maxOutputSize,o=i.iouThreshold,n=i.scoreThreshold;let p={maxOutputSize:e,iouThreshold:o,scoreThreshold:n};return v.runKernel(ja,{boxes:s,scores:a},p)}var R0=N({nonMaxSuppression_:ZO});function F0(r,t,e){let o=QO(r,t,e),n=o<0?-(o+1):o;r.splice(n,0,t)}function QO(r,t,e){return tP(r,t,e||JO)}function JO(r,t){return r>t?1:r<t?-1:0}function tP(r,t,e){let o=0,n=r.length,s=0,a=!1;for(;o<n;){s=o+(n-o>>>1);let i=e(t,r[s]);i>0?o=s+1:(n=s,a=!i)}return a?o:-o-1}function Wu(r,t,e,o,n){return Ag(r,t,e,o,n,0)}function Uu(r,t,e,o,n,s){return Ag(r,t,e,o,n,0,!1,s,!0)}function Hu(r,t,e,o,n,s){return Ag(r,t,e,o,n,s,!0)}function Ag(r,t,e,o,n,s,a=!1,i=!1,p=!1){let c=[];for(let h=0;h<t.length;h++)t[h]>n&&c.push({score:t[h],boxIndex:h,suppressBeginIndex:0});c.sort(_0);let l=s>0?-.5/s:0,u=[],m=[];for(;u.length<e&&c.length>0;){let h=c.pop(),{score:x,boxIndex:b,suppressBeginIndex:S}=h;if(x<n)break;let w=!1;for(let E=u.length-1;E>=S;--E){let $=eP(r,b,u[E]);if($>=o){w=!0;break}if(h.score=h.score*rP(o,l,$),h.score<=n)break}h.suppressBeginIndex=u.length,w||(h.score===x?(u.push(b),m.push(h.score)):h.score>n&&F0(c,h,_0))}let f=u.length,d=e-f;i&&d>0&&(u.push(...new Array(d).fill(0)),m.push(...new Array(d).fill(0)));let g={selectedIndices:u};return a&&(g.selectedScores=m),p&&(g.validOutputs=f),g}function eP(r,t,e){let o=r.subarray(t*4,t*4+4),n=r.subarray(e*4,e*4+4),s=Math.min(o[0],o[2]),a=Math.min(o[1],o[3]),i=Math.max(o[0],o[2]),p=Math.max(o[1],o[3]),c=Math.min(n[0],n[2]),l=Math.min(n[1],n[3]),u=Math.max(n[0],n[2]),m=Math.max(n[1],n[3]),f=(i-s)*(p-a),d=(u-c)*(m-l);if(f<=0||d<=0)return 0;let g=Math.max(s,c),h=Math.max(a,l),x=Math.min(i,u),b=Math.min(p,m),S=Math.max(x-g,0)*Math.max(b-h,0);return S/(f+d-S)}function rP(r,t,e){let o=Math.exp(t*e*e);return e<=r?o:0}function _0(r,t){return r.score-t.score||r.score===t.score&&t.boxIndex-r.boxIndex}async function oP(r,t,e,o=.5,n=Number.NEGATIVE_INFINITY){let s=C(r,"boxes","nonMaxSuppressionAsync"),a=C(t,"scores","nonMaxSuppressionAsync"),i=Er(s,a,e,o,n);e=i.maxOutputSize,o=i.iouThreshold,n=i.scoreThreshold;let p=await Promise.all([s.data(),a.data()]),c=p[0],l=p[1],{selectedIndices:u}=Wu(c,l,e,o,n);return s!==r&&s.dispose(),a!==t&&a.dispose(),Ee(u,"int32")}var O0=oP;function nP(r,t,e,o=.5,n=Number.NEGATIVE_INFINITY,s=0){let a=C(r,"boxes","nonMaxSuppression"),i=C(t,"scores","nonMaxSuppression"),p=Er(a,i,e,o,n,s);e=p.maxOutputSize,o=p.iouThreshold,n=p.scoreThreshold,s=p.softNmsSigma;let c={boxes:a,scores:i},l={maxOutputSize:e,iouThreshold:o,scoreThreshold:n,softNmsSigma:s},u=v.runKernel(Za,c,l);return{selectedIndices:u[0],selectedScores:u[1]}}var P0=N({nonMaxSuppressionWithScore_:nP});async function sP(r,t,e,o=.5,n=Number.NEGATIVE_INFINITY,s=0){let a=C(r,"boxes","nonMaxSuppressionAsync"),i=C(t,"scores","nonMaxSuppressionAsync"),p=Er(a,i,e,o,n,s);e=p.maxOutputSize,o=p.iouThreshold,n=p.scoreThreshold,s=p.softNmsSigma;let c=await Promise.all([a.data(),i.data()]),l=c[0],u=c[1],{selectedIndices:m,selectedScores:f}=Hu(l,u,e,o,n,s);return a!==r&&a.dispose(),i!==t&&i.dispose(),{selectedIndices:Ee(m,"int32"),selectedScores:Ee(f)}}var L0=sP;function aP(r,t,e,o=.5,n=Number.NEGATIVE_INFINITY,s=!1){let a=C(r,"boxes","nonMaxSuppression"),i=C(t,"scores","nonMaxSuppression"),p=Er(a,i,e,o,n,null),c=p.maxOutputSize,l=p.iouThreshold,u=p.scoreThreshold,m={boxes:a,scores:i},f={maxOutputSize:c,iouThreshold:l,scoreThreshold:u,padToMaxOutputSize:s},d=v.runKernel(Ya,m,f);return{selectedIndices:d[0],validOutputs:d[1]}}var M0=N({nonMaxSuppressionPadded_:aP});async function iP(r,t,e,o=.5,n=Number.NEGATIVE_INFINITY,s=!1){let a=C(r,"boxes","nonMaxSuppressionAsync"),i=C(t,"scores","nonMaxSuppressionAsync"),p=Er(a,i,e,o,n,null),c=p.maxOutputSize,l=p.iouThreshold,u=p.scoreThreshold,[m,f]=await Promise.all([a.data(),i.data()]),{selectedIndices:d,validOutputs:g}=Uu(m,f,c,l,u,s);return a!==r&&a.dispose(),i!==t&&i.dispose(),{selectedIndices:Ee(d,"int32"),validOutputs:J(g,"int32")}}var B0=iP;function pP(r,t,e=!1,o=!1){let n=C(r,"images","resizeBilinear");k(n.rank===3||n.rank===4,()=>`Error in resizeBilinear: x must be rank 3 or 4, but got rank ${n.rank}.`),k(t.length===2,()=>`Error in resizeBilinear: new shape must 2D, but got shape ${t}.`),k(o===!1||e===!1,()=>"Error in resizeBilinear: If halfPixelCenters is true, alignCorners must be false.");let s=n,a=!1;n.rank===3&&(a=!0,s=R(n,[1,n.shape[0],n.shape[1],n.shape[2]]));let[]=t,i={images:s},p={alignCorners:e,halfPixelCenters:o,size:t},c=v.runKernel(zn,i,p);return a?R(c,[c.shape[1],c.shape[2],c.shape[3]]):c}var qu=N({resizeBilinear_:pP});function cP(r,t,e=!1,o=!1){let n=C(r,"images","resizeNearestNeighbor");k(n.rank===3||n.rank===4,()=>`Error in resizeNearestNeighbor: x must be rank 3 or 4, but got rank ${n.rank}.`),k(t.length===2,()=>`Error in resizeNearestNeighbor: new shape must 2D, but got shape ${t}.`),k(n.dtype==="float32"||n.dtype==="int32",()=>"`images` must have `int32` or `float32` as dtype"),k(o===!1||e===!1,()=>"Error in resizeNearestNeighbor: If halfPixelCenters is true, alignCorners must be false.");let s=n,a=!1;n.rank===3&&(a=!0,s=R(n,[1,n.shape[0],n.shape[1],n.shape[2]]));let[]=t,i={images:s},p={alignCorners:e,halfPixelCenters:o,size:t},c=v.runKernel(Vn,i,p);return a?R(c,[c.shape[1],c.shape[2],c.shape[3]]):c}var Ku=N({resizeNearestNeighbor_:cP});function lP(r,t="binary",e=!1,o=.5){let n=C(r,"image","threshold"),s=.2989,a=.587,i=.114,p=n.shape[0]*n.shape[1],c=O(Ee([o]),255),l,u,m,f;if(k(n.rank===3,()=>`Error in threshold: image must be rank 3,but got rank ${n.rank}.`),k(n.shape[2]===3||n.shape[2]===1,()=>`Error in threshold: image color channel must be equal to 3 or 1but got ${n.shape[2]}.`),k(n.dtype==="int32"||n.dtype==="float32",()=>`Error in dtype: image dtype must be int32 or float32,but got dtype ${n.dtype}.`),k(t==="otsu"||t==="binary",()=>`Method must be binary or otsu, but was ${t}`),n.shape[2]===3){[l,u,m]=or(n,[1,1,1],-1);let h=O(l,s),x=O(u,a),b=O(m,i);f=tt(tt(h,x),b)}else f=r;if(t==="otsu"){let h=qc(X(qi(f),"int32"),Te([]),256);c=uP(h,p)}let d=e?Xe(f,c):xe(f,c);return X(O(d,255),"int32")}function uP(r,t){let e=Ee([-1]),o=Ee([0]),n=Ee([0]),s,a,i,p,c,l;for(let u=0;u<r.size-1;u++){s=xt(r,0,u+1),a=xt(r,u+1),c=st(it(s),t),l=st(it(a),t);let m=it(O(s,cs(0,s.size)));i=st(m,it(s));let f=jr(a.shape,s.size),d=tt(cs(0,a.size),f),g=O(a,d);p=st(it(g),it(a));let h=rt(i,p),x=rt(i,p),b=O(c,l);n=O(O(b,h),x);let S=xe(n,o);o=Xt(S,n,o),e=Xt(S,Ee([u]),e)}return e}var G0=N({threshold_:lP});function mP(r,t,e="nearest",o="constant",n=0,s){let a=C(r,"image","transform","float32"),i=C(t,"transforms","transform","float32");k(a.rank===4,()=>`Error in transform: image must be rank 4,but got rank ${a.rank}.`),k(i.rank===2&&(i.shape[0]===a.shape[0]||i.shape[0]===1)&&i.shape[1]===8,()=>"Error in transform: Input transform should be batch x 8 or 1 x 8"),k(s==null||s.length===2,()=>`Error in transform: outputShape must be [height, width] or null, but got ${s}.`);let p={image:a,transforms:i},c={interpolation:e,fillMode:o,fillValue:n,outputShape:s};return v.runKernel(yi,p,c)}var V0=N({transform_:mP});function fP(r,t,e){k(t%1===0,()=>`bandPart(): numLower must be an integer, got ${t}.`),k(e%1===0,()=>`bandPart(): numUpper must be an integer, got ${e}.`);let o=C(r,"a","bandPart");k(o.rank>=2,()=>`bandPart(): Rank must be at least 2, got ${o.rank}.`);let n=o.shape,[s,a]=o.shape.slice(-2);if(!(t<=s))throw new Error(`bandPart(): numLower (${t}) must not be greater than the number of rows (${s}).`);if(!(e<=a))throw new Error(`bandPart(): numUpper (${e}) must not be greater than the number of columns (${a}).`);t<0&&(t=s),e<0&&(e=a);let i=R(cs(0,s,1,"int32"),[-1,1]),p=cs(0,a,1,"int32"),c=rt(i,p),l=rr(Xe(c,J(+t,"int32")),xr(c,J(-e,"int32"))),u=_e([s,a],o.dtype);return R(fe($e(R(o,[-1,s,a])).map(m=>Xt(l,m,u))),n)}var z0=N({bandPart_:fP});function dP(r){let t;if(Array.isArray(r)){t=!1,k(r!=null&&r.length>0,()=>"Gram-Schmidt process: input must not be null, undefined, or empty");let n=r[0].shape[0];for(let s=1;s<r.length;++s)k(r[s].shape[0]===n,()=>`Gram-Schmidt: Non-unique lengths found in the input vectors: (${r[s].shape[0]} vs. ${n})`)}else t=!0,r=or(r,r.shape[0],0).map(n=>ms(n,[0]));k(r.length<=r[0].shape[0],()=>`Gram-Schmidt: Number of vectors (${r.length}) exceeds number of dimensions (${r[0].shape[0]}).`);let e=[],o=r;for(let n=0;n<r.length;++n)e.push(v.tidy(()=>{let s=o[n];if(n>0)for(let a=0;a<n;++a){let i=O(it(O(e[a],s)),e[a]);s=rt(s,i)}return st(s,qo(s,"euclidean"))}));return t?fe(e,0):e}var W0=N({gramSchmidt_:dP});function hP(r,t=!1){if(k(r.rank>=2,()=>`qr() requires input tensor to have a rank >= 2, but got rank ${r.rank}`),r.rank===2)return U0(r,t);{let e=r.shape.slice(0,r.shape.length-2).reduce((p,c)=>p*c),o=$e(R(r,[e,r.shape[r.shape.length-2],r.shape[r.shape.length-1]]),0),n=[],s=[];o.forEach(p=>{let[c,l]=U0(p,t);n.push(c),s.push(l)});let a=R(fe(n,0),r.shape),i=R(fe(s,0),r.shape);return[a,i]}}function U0(r,t=!1){return v.tidy(()=>{k(r.shape.length===2,()=>`qr2d() requires a 2D Tensor, but got a ${r.shape.length}D Tensor.`);let e=r.shape[0],o=r.shape[1],n=al(e),s=He(r),a=fs([[1]],[1,1]),i=He(a),p=e>=o?o:e;for(let c=0;c<p;++c){let l=s,u=i,m=n;[i,s,n]=v.tidy(()=>{let f=xt(s,[c,c],[e-c,1]),d=qo(f),g=xt(s,[c,c],[1,1]),h=Xt(xe(g,0),fs([[-1]]),fs([[1]])),x=rt(g,O(h,d)),b=st(f,x);b.shape[0]===1?i=He(a):i=Lt([a,xt(b,[1,0],[b.shape[0]-1,b.shape[1]])],0);let S=$t(st(Tt(h,x),d)),w=xt(s,[c,0],[e-c,o]),E=O(S,i),$=Se(i);if(c===0)s=rt(w,Tt(E,Tt($,w)));else{let P=rt(w,Tt(E,Tt($,w)));s=Lt([xt(s,[0,0],[c,o]),P],0)}let D=Se(E),F=xt(n,[0,c],[e,n.shape[1]-c]);if(c===0)n=rt(F,Tt(Tt(F,i),D));else{let P=rt(F,Tt(Tt(F,i),D));n=Lt([xt(n,[0,0],[e,c]),P],1)}return[i,s,n]}),ie([l,u,m])}return!t&&e>o&&(n=xt(n,[0,0],[e,o]),s=xt(s,[0,0],[o,o])),[n,s]})}var H0=N({qr_:hP});var te;(function(r){r[r.NONE=0]="NONE",r[r.MEAN=1]="MEAN",r[r.SUM=2]="SUM",r[r.SUM_BY_NONZERO_WEIGHTS=3]="SUM_BY_NONZERO_WEIGHTS"})(te||(te={}));function gP(r,t,e=te.SUM_BY_NONZERO_WEIGHTS){let o=C(r,"losses","computeWeightedLoss"),n=null;t!=null&&(n=C(t,"weights","computeWeightedLoss"));let s=n==null?o:O(o,n);if(e===te.NONE)return s;if(e===te.SUM)return it(s);if(e===te.MEAN){if(n==null)return Ko(s);{let a=o.size/n.size,i=st(it(s),it(n));return a>1?st(i,J(a)):i}}if(e===te.SUM_BY_NONZERO_WEIGHTS){if(n==null)return st(it(s),J(o.size));{let a=O(n,Oe(o.shape)),i=X(it(Vi(a,J(0))),"float32");return st(it(s),i)}}throw Error(`Unknown reduction: ${e}`)}var Ae=N({computeWeightedLoss_:gP});function xP(r,t,e,o=te.SUM_BY_NONZERO_WEIGHTS){let n=C(r,"labels","absoluteDifference"),s=C(t,"predictions","absoluteDifference"),a=null;e!=null&&(a=C(e,"weights","absoluteDifference")),Wt(n.shape,s.shape,"Error in absoluteDifference: ");let i=le(rt(n,s));return Ae(i,a,o)}var q0=N({absoluteDifference_:xP});function yP(r,t,e,o,n=te.SUM_BY_NONZERO_WEIGHTS){let s=C(r,"labels","cosineDistance"),a=C(t,"predictions","cosineDistance"),i=null;o!=null&&(i=C(o,"weights","cosineDistance")),Wt(s.shape,a.shape,"Error in cosineDistance: ");let p=J(1),c=rt(p,it(O(s,a),e,!0));return Ae(c,i,n)}var K0=N({cosineDistance_:yP});function bP(r,t,e,o=te.SUM_BY_NONZERO_WEIGHTS){let n=C(r,"labels","hingeLoss"),s=C(t,"predictions","hingeLoss"),a=null;e!=null&&(a=C(e,"weights","hingeLoss")),Wt(n.shape,s.shape,"Error in hingeLoss: ");let i=J(1);n=rt(O(J(2),n),i);let p=Yr(rt(i,O(n,s)));return Ae(p,a,o)}var X0=N({hingeLoss_:bP});function CP(r,t,e,o=1,n=te.SUM_BY_NONZERO_WEIGHTS){let s=C(r,"labels","huberLoss"),a=C(t,"predictions","huberLoss"),i=null;e!=null&&(i=C(e,"weights","huberLoss")),Wt(s.shape,a.shape,"Error in huberLoss: ");let p=J(o),c=le(rt(a,s)),l=Gi(c,p),u=rt(c,l),m=tt(O(J(.5),Ct(l)),O(p,u));return Ae(m,i,n)}var j0=N({huberLoss_:CP});function TP(r,t,e,o=1e-7,n=te.SUM_BY_NONZERO_WEIGHTS){let s=C(r,"labels","logLoss"),a=C(t,"predictions","logLoss"),i=null;e!=null&&(i=C(e,"weights","logLoss")),Wt(s.shape,a.shape,"Error in logLoss: ");let p=J(1),c=J(o),l=$t(O(s,er(tt(a,c)))),u=O(rt(p,s),er(tt(rt(p,a),c))),m=rt(l,u);return Ae(m,i,n)}var Y0=N({logLoss_:TP});function SP(r,t,e,o=te.SUM_BY_NONZERO_WEIGHTS){let n=C(r,"labels","meanSquaredError"),s=C(t,"predictions","meanSquaredError"),a=null;e!=null&&(a=C(e,"weights","meanSquaredError")),Wt(n.shape,s.shape,"Error in meanSquaredError: ");let i=Zi(n,s);return Ae(i,a,o)}var Z0=N({meanSquaredError_:SP});function wP(r,t){let e=C(r,"labels","sigmoidCrossEntropyWithLogits"),o=C(t,"logits","sigmoidCrossEntropyWithLogits");Wt(e.shape,o.shape,"Error in sigmoidCrossEntropyWithLogits: ");let n=Yr(o),s=O(o,e),a=Oi(ae($t(le(o))));return tt(rt(n,s),a)}function NP(r,t,e,o=0,n=te.SUM_BY_NONZERO_WEIGHTS){let s=C(r,"multiClassLabels","sigmoidCrossEntropy"),a=C(t,"logits","sigmoidCrossEntropy"),i=null;if(e!=null&&(i=C(e,"weights","sigmoidCrossEntropy")),Wt(s.shape,a.shape,"Error in sigmoidCrossEntropy: "),o>0){let c=J(o),l=J(1),u=J(.5);s=tt(O(s,rt(l,c)),O(u,c))}let p=wP(s,a);return Ae(p,i,n)}var Q0=N({sigmoidCrossEntropy_:NP});function vP(r,t,e=-1){if(e===-1&&(e=t.rank-1),e!==t.rank-1)throw Error(`Softmax cross entropy along a non-last dimension is not yet supported. Labels / logits was rank ${t.rank} and dim was ${e}`);return Fe((n,s,a)=>{let p=Li(s,[e],!0),c=rt(X(s,"float32"),p);a([n,c]);let l=$t(O(c,n));return{value:it(l,[e]),gradFunc:(f,d)=>{let[g,h]=d,x=kr(f.shape,[e]);return[O(R(f,x),rt(X(g,"float32"),ae(h))),O(R(f,x),rt(ae(h),X(g,"float32")))]}}})(r,t)}function IP(r,t,e,o=0,n=te.SUM_BY_NONZERO_WEIGHTS){let s=C(r,"onehotLabels","softmaxCrossEntropy"),a=C(t,"logits","softmaxCrossEntropy"),i=null;if(e!=null&&(i=C(e,"weights","softmaxCrossEntropy")),Wt(s.shape,a.shape,"Error in softmaxCrossEntropy: "),o>0){let c=J(o),l=J(1),u=J(s.shape[1]);s=tt(O(s,rt(l,c)),st(c,u))}let p=vP(s,a);return Ae(p,i,n)}var J0=N({softmaxCrossEntropy_:IP});function kP(r,t,e,o){let n=C(r,"indices","sparseFillEmptyRows","int32"),s=C(t,"values","sparseFillEmptyRows"),a=C(e,"denseShape","sparseFillEmptyRows","int32"),i=C(o,"defaultValue","sparseFillEmptyRows",s.dtype);if(n.rank!==2)throw new Error(`Indices should be Tensor2D but received shape
        ${n.shape}`);if(s.rank!==1)throw new Error(`Values should be Tensor1D but received shape ${s.shape}`);if(a.rank!==1)throw new Error(`Dense shape should be Tensor1D but received shape ${a.shape}`);if(i.rank!==0)throw new Error(`Default value should be a scalar but received shape ${i.shape}`);let p={indices:n,values:s,denseShape:a,defaultValue:i},c=v.runKernel(ii,p);return{outputIndices:c[0],outputValues:c[1],emptyRowIndicator:c[2],reverseIndexMap:c[3]}}var tC=N({sparseFillEmptyRows_:kP});function EP(r,t,e){let o=C(r,"inputIndices","sparseReshape","int32"),n=C(t,"inputShape","sparseReshape","int32"),s=C(e,"newShape","sparseReshape","int32");if(o.rank!==2)throw new Error(`Input indices should be Tensor2D but received shape
        ${o.shape}`);if(n.rank!==1)throw new Error(`Input shape should be Tensor1D but received shape ${n.shape}`);if(s.rank!==1)throw new Error(`New shape should be Tensor1D but received shape ${s.shape}`);let a={inputIndices:o,inputShape:n,newShape:s},i=v.runKernel(pi,a);return{outputIndices:i[0],outputShape:i[1]}}var eC=N({sparseReshape_:EP});function $P(r,t,e){let o=C(r,"data","sparseSegmentMean"),n=C(t,"indices","sparseSegmentMean","int32"),s=C(e,"segmentIds","sparseSegmentMean","int32");if(o.rank<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(n.rank!==1)throw new Error(`Indices should be Tensor1D but received shape
          ${n.shape}`);if(s.rank!==1)throw new Error(`Segment ids should be Tensor1D but received shape
          ${s.shape}`);let a={data:o,indices:n,segmentIds:s};return v.runKernel(ci,a)}var rC=N({sparseSegmentMean_:$P});function AP(r,t,e){let o=C(r,"data","sparseSegmentSum"),n=C(t,"indices","sparseSegmentSum","int32"),s=C(e,"segmentIds","sparseSegmentSum","int32");if(o.rank<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(n.rank!==1)throw new Error(`Indices should be Tensor1D but received shape
         ${n.shape}`);if(s.rank!==1)throw new Error(`Segment ids should be Tensor1D but received shape
         ${s.shape}`);let a={data:o,indices:n,segmentIds:s};return v.runKernel(li,a)}var oC=N({sparseSegmentSum_:AP});function DP(r,t,e,o,n,s,a,i){let p=C(r,"data","stringNGrams","string");if(p.dtype!=="string")throw new Error("Data must be of datatype string");if(p.shape.length!==1)throw new Error(`Data must be a vector, saw: ${p.shape}`);let c=C(t,"dataSplits","stringNGrams");if(c.dtype!=="int32")throw new Error("Data splits must be of datatype int32");let l={separator:e,nGramWidths:o,leftPad:n,rightPad:s,padWidth:a,preserveShortSequences:i},u={data:p,dataSplits:c},m=v.runKernel(di,u,l);return{nGrams:m[0],nGramsSplits:m[1]}}var nC=N({stringNGrams_:DP});function RP(r,t,e=!0){let o=C(r,"input","stringSplit","string"),n=C(t,"delimiter","stringSplit","string");if(o.rank!==1)throw new Error(`Input should be Tensor1D but received shape ${o.shape}`);if(n.rank!==0)throw new Error(`Delimiter should be a scalar but received shape ${n.shape}`);let s={skipEmpty:e},a={input:o,delimiter:n},i=v.runKernel(hi,a,s);return{indices:i[0],values:i[1],shape:i[2]}}var sC=N({stringSplit_:RP});function FP(r,t){let e=C(r,"input","stringToHashBucketFast","string"),o={numBuckets:t};if(t<=0)throw new Error("Number of buckets must be at least 1");let n={input:e};return v.runKernel(gi,n,o)}var aC=N({stringToHashBucketFast_:FP});var iC={fft:ls,ifft:jo,rfft:us,irfft:Yi},Xu={hammingWindow:I0,hannWindow:Vu,frame:zu,stft:k0},pC={flipLeftRight:$0,grayscaleToRGB:A0,resizeNearestNeighbor:Ku,resizeBilinear:qu,rotateWithOffset:D0,cropAndResize:E0,nonMaxSuppression:R0,nonMaxSuppressionAsync:O0,nonMaxSuppressionWithScore:P0,nonMaxSuppressionWithScoreAsync:L0,nonMaxSuppressionPadded:M0,nonMaxSuppressionPaddedAsync:B0,threshold:G0,transform:V0},cC={bandPart:z0,gramSchmidt:W0,qr:H0},lC={absoluteDifference:q0,computeWeightedLoss:Ae,cosineDistance:K0,hingeLoss:X0,huberLoss:j0,logLoss:Y0,meanSquaredError:Z0,sigmoidCrossEntropy:Q0,softmaxCrossEntropy:J0},uC={sparseFillEmptyRows:tC,sparseReshape:eC,sparseSegmentMean:rC,sparseSegmentSum:oC},mC={stringNGrams:nC,stringSplit:sC,stringToHashBucketFast:aC};A().prototype.abs=function(){return this.throwIfDisposed(),le(this)};A().prototype.acos=function(){return this.throwIfDisposed(),Oc(this)};A().prototype.acosh=function(){return this.throwIfDisposed(),Pc(this)};A().prototype.add=function(r){return this.throwIfDisposed(),tt(this,r)};A().prototype.all=function(r,t){return this.throwIfDisposed(),Lc(this,r,t)};A().prototype.any=function(r,t){return this.throwIfDisposed(),Mc(this,r,t)};A().prototype.argMax=function(r){return this.throwIfDisposed(),Bc(this,r)};A().prototype.argMin=function(r){return this.throwIfDisposed(),Gc(this,r)};A().prototype.asScalar=function(){return this.throwIfDisposed(),k(this.size===1,()=>"The array must have only 1 element."),R(this,[])};A().prototype.asType=function(r){return this.throwIfDisposed(),X(this,r)};A().prototype.as1D=function(){return this.throwIfDisposed(),R(this,[this.size])};A().prototype.as2D=function(r,t){return this.throwIfDisposed(),R(this,[r,t])};A().prototype.as3D=function(r,t,e){return this.throwIfDisposed(),R(this,[r,t,e])};A().prototype.as4D=function(r,t,e,o){return this.throwIfDisposed(),R(this,[r,t,e,o])};A().prototype.as5D=function(r,t,e,o,n){return this.throwIfDisposed(),R(this,[r,t,e,o,n])};A().prototype.asin=function(){return this.throwIfDisposed(),Vc(this)};A().prototype.asinh=function(){return this.throwIfDisposed(),zc(this)};A().prototype.atan=function(){return this.throwIfDisposed(),Wc(this)};A().prototype.atan2=function(r){return this.throwIfDisposed(),Uc(this,r)};A().prototype.atanh=function(){return this.throwIfDisposed(),Hc(this)};A().prototype.avgPool=function(r,t,e,o){return this.throwIfDisposed(),Ei(this,r,t,e,o)};A().prototype.batchToSpaceND=function(r,t){return this.throwIfDisposed(),Jn(this,r,t)};A().prototype.batchNorm=function(r,t,e,o,n){return this.throwIfDisposed(),Kr(this,r,t,e,o,n)};A().prototype.broadcastTo=function(r){return this.throwIfDisposed(),Xr(this,r)};A().prototype.cast=function(r){return this.throwIfDisposed(),X(this,r)};A().prototype.ceil=function(){return this.throwIfDisposed(),Kc(this)};A().prototype.clipByValue=function(r,t){return this.throwIfDisposed(),Xc(this,r,t)};A().prototype.concat=function(r,t){return this.throwIfDisposed(),r instanceof Rt&&(r=[r]),Lt([this,...r],t)};A().prototype.conv1d=function(r,t,e,o,n,s){return this.throwIfDisposed(),Yc(this,r,t,e,o,n,s)};A().prototype.conv2dTranspose=function(r,t,e,o,n){return this.throwIfDisposed(),Zc(this,r,t,e,o,n)};A().prototype.conv2d=function(r,t,e,o,n,s){return this.throwIfDisposed(),dr(this,r,t,e,o,n,s)};A().prototype.cos=function(){return this.throwIfDisposed(),ts(this)};A().prototype.cosh=function(){return this.throwIfDisposed(),$i(this)};A().prototype.cumprod=function(r,t,e){return this.throwIfDisposed(),Qs(this,r,t,e)};A().prototype.cumsum=function(r,t,e){return this.throwIfDisposed(),Ai(this,r,t,e)};A().prototype.depthToSpace=function(r,t){return this.throwIfDisposed(),Qc(this,r,t)};A().prototype.depthwiseConv2d=function(r,t,e,o,n,s){return this.throwIfDisposed(),es(this,r,t,e,o,n,s)};A().prototype.dilation2d=function(r,t,e,o,n){return this.throwIfDisposed(),Jc(this,r,t,e,o,n)};A().prototype.divNoNan=function(r){return this.throwIfDisposed(),tl(this,r)};A().prototype.div=function(r){return this.throwIfDisposed(),st(this,r)};A().prototype.dot=function(r){return this.throwIfDisposed(),el(this,r)};A().prototype.elu=function(){return this.throwIfDisposed(),Ri(this)};A().prototype.equal=function(r){return this.throwIfDisposed(),rs(this,r)};A().prototype.erf=function(){return this.throwIfDisposed(),rl(this)};A().prototype.euclideanNorm=function(r,t){return this.throwIfDisposed(),nl(this,r,t)};A().prototype.exp=function(){return this.throwIfDisposed(),ae(this)};A().prototype.expandDims=function(r){return this.throwIfDisposed(),ze(this,r)};A().prototype.expm1=function(){return this.throwIfDisposed(),sl(this)};A().prototype.fft=function(){return this.throwIfDisposed(),ls(this)};A().prototype.flatten=function(){return this.throwIfDisposed(),R(this,[this.size])};A().prototype.floor=function(){return this.throwIfDisposed(),os(this)};A().prototype.floorDiv=function(r){return this.throwIfDisposed(),Di(this,r)};A().prototype.gather=function(r,t){return this.throwIfDisposed(),ns(this,r,t)};A().prototype.greaterEqual=function(r){return this.throwIfDisposed(),xr(this,r)};A().prototype.greater=function(r){return this.throwIfDisposed(),xe(this,r)};A().prototype.ifft=function(){return this.throwIfDisposed(),jo(this)};A().prototype.irfft=function(){return this.throwIfDisposed(),Yi(this)};A().prototype.isFinite=function(){return this.throwIfDisposed(),il(this)};A().prototype.isInf=function(){return this.throwIfDisposed(),pl(this)};A().prototype.isNaN=function(){return this.throwIfDisposed(),cl(this)};A().prototype.leakyRelu=function(r){return this.throwIfDisposed(),Fi(this,r)};A().prototype.lessEqual=function(r){return this.throwIfDisposed(),Xe(this,r)};A().prototype.less=function(r){return this.throwIfDisposed(),_i(this,r)};A().prototype.localResponseNormalization=function(r,t,e,o){return this.throwIfDisposed(),ll(this,r,t,e,o)};A().prototype.logSigmoid=function(){return this.throwIfDisposed(),ul(this)};A().prototype.logSoftmax=function(r){return this.throwIfDisposed(),ml(this,r)};A().prototype.logSumExp=function(r,t){return this.throwIfDisposed(),Li(this,r,t)};A().prototype.log=function(){return this.throwIfDisposed(),er(this)};A().prototype.log1p=function(){return this.throwIfDisposed(),Oi(this)};A().prototype.logicalAnd=function(r){return this.throwIfDisposed(),rr(this,r)};A().prototype.logicalNot=function(){return this.throwIfDisposed(),as(this)};A().prototype.logicalOr=function(r){return this.throwIfDisposed(),Mi(this,r)};A().prototype.logicalXor=function(r){return this.throwIfDisposed(),fl(this,r)};A().prototype.matMul=function(r,t,e){return this.throwIfDisposed(),Tt(this,r,t,e)};A().prototype.maxPool=function(r,t,e,o){return this.throwIfDisposed(),Bi(this,r,t,e,o)};A().prototype.max=function(r,t){return this.throwIfDisposed(),hr(this,r,t)};A().prototype.maximum=function(r){return this.throwIfDisposed(),is(this,r)};A().prototype.mean=function(r,t){return this.throwIfDisposed(),Ko(this,r,t)};A().prototype.min=function(r,t){return this.throwIfDisposed(),Js(this,r,t)};A().prototype.minimum=function(r){return this.throwIfDisposed(),Gi(this,r)};A().prototype.mirrorPad=function(r,t){return this.throwIfDisposed(),dl(this,r,t)};A().prototype.mod=function(r){return this.throwIfDisposed(),hl(this,r)};A().prototype.mul=function(r){return this.throwIfDisposed(),O(this,r)};A().prototype.neg=function(){return this.throwIfDisposed(),$t(this)};A().prototype.norm=function(r,t,e){return this.throwIfDisposed(),qo(this,r,t,e)};A().prototype.notEqual=function(r){return this.throwIfDisposed(),Vi(this,r)};A().prototype.oneHot=function(r,t=1,e=0){return this.throwIfDisposed(),ta(this,r,t,e)};A().prototype.onesLike=function(){return this.throwIfDisposed(),gl(this)};A().prototype.pad=function(r,t){return this.throwIfDisposed(),je(this,r,t)};A().prototype.pool=function(r,t,e,o,n,s){return this.throwIfDisposed(),xl(this,r,t,e,o,n,s)};A().prototype.pow=function(r){return this.throwIfDisposed(),Ge(this,r)};A().prototype.prelu=function(r){return this.throwIfDisposed(),zi(this,r)};A().prototype.prod=function(r,t){return this.throwIfDisposed(),bl(this,r,t)};A().prototype.reciprocal=function(){return this.throwIfDisposed(),Sl(this)};A().prototype.relu=function(){return this.throwIfDisposed(),Yr(this)};A().prototype.relu6=function(){return this.throwIfDisposed(),Hi(this)};A().prototype.reshapeAs=function(r){return this.throwIfDisposed(),R(this,r.shape)};A().prototype.reshape=function(r){return this.throwIfDisposed(),R(this,r)};A().prototype.resizeBilinear=function(r,t,e){return this.throwIfDisposed(),qu(this,r,t,e)};A().prototype.resizeNearestNeighbor=function(r,t,e){return this.throwIfDisposed(),Ku(this,r,t,e)};A().prototype.reverse=function(r){return this.throwIfDisposed(),ke(this,r)};A().prototype.rfft=function(){return this.throwIfDisposed(),us(this)};A().prototype.round=function(){return this.throwIfDisposed(),qi(this)};A().prototype.rsqrt=function(){return this.throwIfDisposed(),Ki(this)};A().prototype.selu=function(){return this.throwIfDisposed(),wl(this)};A().prototype.separableConv2d=function(r,t,e,o,n,s){return this.throwIfDisposed(),Nl(this,r,t,e,o,n,s)};A().prototype.sigmoid=function(){return this.throwIfDisposed(),qe(this)};A().prototype.sign=function(){return this.throwIfDisposed(),vl(this)};A().prototype.sin=function(){return this.throwIfDisposed(),Xi(this)};A().prototype.sinh=function(){return this.throwIfDisposed(),ji(this)};A().prototype.slice=function(r,t){return this.throwIfDisposed(),xt(this,r,t)};A().prototype.softmax=function(r){return this.throwIfDisposed(),Il(this,r)};A().prototype.softplus=function(){return this.throwIfDisposed(),Pi(this)};A().prototype.spaceToBatchND=function(r,t){return this.throwIfDisposed(),ps(this,r,t)};A().prototype.split=function(r,t){return this.throwIfDisposed(),or(this,r,t)};A().prototype.sqrt=function(){return this.throwIfDisposed(),Ut(this)};A().prototype.square=function(){return this.throwIfDisposed(),Ct(this)};A().prototype.squaredDifference=function(r){return this.throwIfDisposed(),Zi(this,r)};A().prototype.squeeze=function(r){return this.throwIfDisposed(),ms(this,r)};A().prototype.stack=function(r,t){this.throwIfDisposed();let e=r instanceof Rt?[this,r]:[this,...r];return fe(e,t)};A().prototype.step=function(r){return this.throwIfDisposed(),yr(this,r)};A().prototype.stridedSlice=function(r,t,e,o,n,s,a,i){return this.throwIfDisposed(),kl(this,r,t,e,o,n,s,a,i)};A().prototype.sub=function(r){return this.throwIfDisposed(),rt(this,r)};A().prototype.sum=function(r,t){return this.throwIfDisposed(),it(this,r,t)};A().prototype.tan=function(){return this.throwIfDisposed(),El(this)};A().prototype.tanh=function(){return this.throwIfDisposed(),Zs(this)};A().prototype.tile=function(r){return this.throwIfDisposed(),gr(this,r)};A().prototype.toBool=function(){return this.throwIfDisposed(),X(this,"bool")};A().prototype.toFloat=function(){return this.throwIfDisposed(),X(this,"float32")};A().prototype.toInt=function(){return this.throwIfDisposed(),X(this,"int32")};A().prototype.topk=function(r,t){return this.throwIfDisposed(),Al(this,r,t)};A().prototype.transpose=function(r){return this.throwIfDisposed(),Se(this,r)};A().prototype.unique=function(r){return this.throwIfDisposed(),Dl(this,r)};A().prototype.unsortedSegmentSum=function(r,t){return this.throwIfDisposed(),Qi(this,r,t)};A().prototype.unstack=function(r){return this.throwIfDisposed(),$e(this,r)};A().prototype.where=function(r,t){return this.throwIfDisposed(),Xt(r,this,t)};A().prototype.zerosLike=function(){return this.throwIfDisposed(),mt(this)};var ju={kernelName:"Abs",inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>O(r,yr(X(e,"float32"),-1))}}};var fC={kernelName:ao,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>{let o=Ct(X(e,"float32")),n=Ut(rt(J(1),o));return $t(st(r,n))}}}};var dC={kernelName:io,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>{let o=Ut(rt(Ct(X(e,"float32")),1));return st(r,o)}}}};var hC={kernelName:"Add",inputsToSave:["a","b"],gradFunc:(r,t)=>{let[e,o]=t,n=bt(e.shape,o.shape);return{a:()=>{let i=r,p=Mt(e.shape,n);return p.length>0&&(i=it(i,p)),R(i,e.shape)},b:()=>{let i=r,p=Mt(o.shape,n);return p.length>0&&(i=it(i,p)),R(i,o.shape)}}}};var gC={kernelName:ln,saveAllInputs:!0,gradFunc:(r,t)=>{let e={};return t.forEach((o,n)=>{e[n]=()=>r.clone()}),e}};var xC={kernelName:un,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>mt(e)}}};var yC={kernelName:mn,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>mt(e)}}};var bC={kernelName:co,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>st(r,Ut(rt(J(1),Ct(X(e,"float32")))))}}};var CC={kernelName:lo,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>{let o=Ut(tt(J(1),Ct(X(e,"float32"))));return st(r,o)}}}};var TC={kernelName:fo,inputsToSave:["a","b"],gradFunc:(r,t)=>{let[e,o]=t,n=bt(e.shape,o.shape);return{a:()=>{let i=tt(Ct(e),Ct(o)),p=O(r,st(o,i)),c=Mt(e.shape,n);return c.length>0&&(p=it(p,c)),R(p,e.shape)},b:()=>{let i=tt(Ct(e),Ct(o)),p=$t(O(r,st(e,i))),c=Mt(o.shape,n);return c.length>0&&(p=it(p,c)),R(p,o.shape)}}}};var SC={kernelName:uo,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>st(r,tt(Ct(X(e,"float32")),1))}}};var wC={kernelName:mo,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>st(r,rt(J(1),Ct(X(e,"float32"))))}}};function _P(r,t,e,o,n,s){let a=C(r,"dy","avgPool3dGrad"),i=C(t,"input","avgPool3dGrad"),p=a,c=i,l=!1;i.rank===4&&(l=!0,p=R(a,[1,a.shape[0],a.shape[1],a.shape[2],a.shape[3]]),c=R(i,[1,i.shape[0],i.shape[1],i.shape[2],i.shape[3]])),k(p.rank===5,()=>`Error in avgPool3dGrad: dy must be rank 5 but got rank ${p.rank}.`),k(c.rank===5,()=>`Error in avgPool3dGrad: input must be rank 5 but got rank ${c.rank}.`),Gt("avgPool3dGrad",n,s);let u={dy:p,input:c},m={filterSize:e,strides:o,pad:n,dimRoundingMode:s},f=v.runKernel(ya,u,m);return l?R(f,[f.shape[1],f.shape[2],f.shape[3],f.shape[4]]):f}var NC=N({avgPool3dGrad_:_P});var vC={kernelName:dn,inputsToSave:["x"],gradFunc:(r,t,e)=>{let[o]=t,{filterSize:n,strides:s,pad:a,dimRoundingMode:i}=e;return{x:()=>NC(r,o,n,s,a,i)}}};function OP(r,t,e,o,n){let s=C(r,"dy","avgPoolGrad"),a=C(t,"input","avgPoolGrad");k(a.rank===s.rank,()=>`Rank of input (${a.rank}) does not match rank of dy (${s.rank})`);let i=a,p=s,c=!1;a.rank===3&&(c=!0,i=R(a,[1,a.shape[0],a.shape[1],a.shape[2]]),p=R(s,[1,s.shape[0],s.shape[1],s.shape[2]])),k(p.rank===4,()=>`Error in avgPoolGrad: dy must be rank 4 but got rank ${p.rank}.`),k(i.rank===4,()=>`Error in avgPoolGrad: input must be rank 4 but got rank ${i.rank}.`);let l={dy:p,input:i},u={filterSize:e,strides:o,pad:n},m=v.runKernel(xa,l,u);return c?R(m,[m.shape[1],m.shape[2],m.shape[3]]):m}var IC=N({avgPoolGrad_:OP});var kC={kernelName:fn,inputsToSave:["x"],gradFunc:(r,t,e)=>{let[o]=t,{filterSize:n,strides:s,pad:a}=e;return{x:()=>IC(r,o,n,s,a)}}};var EC={kernelName:hn,inputsToSave:["a","b"],gradFunc:(r,t,e)=>{let[o,n]=t,{transposeA:s,transposeB:a}=e;return!s&&!a?{a:()=>Tt(r,n,!1,!0),b:()=>Tt(o,r,!0,!1)}:!s&&a?{a:()=>Tt(r,n,!1,!1),b:()=>Tt(r,o,!0,!1)}:s&&!a?{a:()=>Tt(n,r,!1,!0),b:()=>Tt(o,r,!1,!1)}:{a:()=>Tt(n,r,!0,!0),b:()=>Tt(r,o,!0,!0)}}};var $C={kernelName:gn,gradFunc:(r,t,e)=>{let{blockShape:o,crops:n}=e;return{x:()=>ps(r,o,n)}}};var AC={kernelName:Jd,gradFunc:(r,t,e)=>{let o=e,n=o.inputShape,s=o.shape,a=Array.from(s);for(let p=n.length-1;p>=0;p--)if(n[p]===s[p])a[p]=1;else if(n[p]!==1)throw new Error(`broadcastTo(): [${n}] cannot be broadcast to [${s}].`);let i=[];for(let p=0;p<a.length;p++)a[p]>1&&i.push(p);return{x:()=>it(r,i,!0)}}};var DC={kernelName:Vr,gradFunc:r=>({x:()=>r.clone()})};var RC={kernelName:ho,gradFunc:r=>({x:()=>mt(r)})};var FC={kernelName:go,inputsToSave:["x"],gradFunc:(r,t,e)=>{let[o]=t,{clipValueMin:n,clipValueMax:s}=e;return{x:()=>Xt(rr(xr(o,n),Xe(o,s)),r,mt(r))}}};var _C={kernelName:xn,inputsToSave:["x"],gradFunc:ju.gradFunc};var OC={kernelName:yn,saveAllInputs:!0,gradFunc:(r,t,e)=>{let o=t.map(p=>p.shape),{axis:n}=e,s=ce(n,t[0].shape)[0],a=o.map(p=>p[s]);return or(r,a,s).map(p=>()=>p)}};var PC={kernelName:bn,inputsToSave:["x","filter"],gradFunc:(r,t,e)=>{let[o,n]=t,{dilations:s,strides:a,pad:i,dataFormat:p}=e;return k(mr(s),()=>`Error in gradient of conv2D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '${s}'`),{x:()=>Bp(o.shape,r,n,a,i,p),filter:()=>zp(o,r,n.shape,a,i,p)}}};var LC={kernelName:Cn,inputsToSave:["dy","filter"],gradFunc:(r,t,e)=>{let[o,n]=t,{strides:s,pad:a,dataFormat:i,dimRoundingMode:p}=e;return{dy:()=>dr(r,n,s,a,i,1,p),filter:()=>zp(r,o,n.shape,s,a,i,p)}}};function PP(r,t,e,o,n){let s=r;r.rank===4&&(s=R(r,[1,r.shape[0],r.shape[1],r.shape[2],r.shape[3]]));let a=t;a.rank===4&&(a=R(t,[1,t.shape[0],t.shape[1],t.shape[2],t.shape[3]])),k(s.rank===5,()=>`Error in conv3dDerFilter: input must be rank 5, but got shape ${s.shape}.`),k(a.rank===5,()=>`Error in conv3dDerFilter: dy must be rank 5, but got shape ${a.shape}.`),k(e.length===5,()=>`Error in conv3dDerFilter: filterShape must be length 5, but got ${e}.`),k(s.shape[4]===e[3],()=>`Error in conv3dDerFilter: depth of input ${s.shape[4]}) must match input depth in filter (${e[3]}.`),k(a.shape[4]===e[4],()=>`Error in conv3dDerFilter: depth of dy (${a.shape[4]}) must match output depth for filter (${e[4]}).`);let i={x:s,dy:a},p={strides:o,pad:n,filterShape:e};return v.runKernel(wa,i,p)}var MC=N({conv3DBackpropFilter_:PP});var BC={kernelName:Tn,inputsToSave:["x","filter"],gradFunc:(r,t,e)=>{let{dilations:o,strides:n,pad:s}=e;k(mr(o),()=>`Error in gradient of conv3D: dilation rates greater than 1 are not yet supported in gradients. Got dilations '${o}'`);let[a,i]=t;return{x:()=>Iu(a.shape,r,i,n,s),filter:()=>MC(a,r,i.shape,n,s)}}};var GC={kernelName:"Cos",inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>O($t(Xi(X(e,"float32"))),r)}}};var VC={kernelName:xo,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>O(ji(X(e,"float32")),r)}}};var zC={kernelName:Sn,inputsToSave:["x"],gradFunc:(r,t,e)=>{let[o]=t,{axis:n,exclusive:s,reverse:a}=e;return{x:()=>{let i=Lh([n],o.rank),p=Ai(r,n,s,!a);return i!=null&&(p=Se(p,i)),p}}}};var WC={kernelName:wn,inputsToSave:["x","filter"],gradFunc:(r,t,e)=>{let{dilations:o,strides:n,pad:s,dimRoundingMode:a}=e,i=o==null?[1,1]:o;k(mr(i),()=>`Error in gradient of depthwiseConv2dNative: dilation rates greater than 1 are not yet supported. Got dilations '${i}'`);let[p,c]=t;return k(p.rank===4,()=>`Error in gradient of depthwiseConv2dNative: input must be rank 4, but got rank ${p.rank}.`),k(c.rank===4,()=>`Error in gradient of depthwiseConv2dNative: filter must be rank 4, but got rank ${c.rank}.`),k(p.shape[3]===c.shape[2],()=>`Error in gradient of depthwiseConv2d: number of input channels (${p.shape[3]}) must match the inChannels dimension in filter ${c.shape[2]}.`),k(Ce(n,i),()=>`Error in gradient of depthwiseConv2d: Either strides or dilations must be  1. Got strides ${n} and dilations '${i}'.`),Gt("depthwiseConv2d",s,a),{x:()=>Bu(p.shape,r,c,n,s,i,a),filter:()=>Mu(p,r,c.shape,n,s,i,a)}}};var UC={kernelName:Nn,inputsToSave:["x","filter"],gradFunc:(r,t,e)=>{let[o,n]=t,s={x:o,filter:n,dy:r},a={x:o,filter:n,dy:r};return{x:()=>v.runKernel(Ip,s,e),filter:()=>v.runKernel(kp,a,e)}}};var HC={kernelName:"Elu",outputsToSave:[!0],gradFunc:(r,t)=>{let[e]=t,o={dy:r,y:e};return{x:()=>v.runKernel(Fa,o)}}};var qC={kernelName:"Erf",inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t,o=O(ae($t(Ct(e))),2/Math.sqrt(Math.PI));return{x:()=>O(r,o)}}};var KC={kernelName:"Exp",outputsToSave:[!0],gradFunc:(r,t)=>{let[e]=t;return{x:()=>O(r,e)}}};var XC={kernelName:In,inputsToSave:["input"],gradFunc:(r,t)=>{let[e]=t;return{input:()=>R(r,e.shape)}}};var jC={kernelName:bo,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>O(r,ae(e))}}};var YC={kernelName:Co,gradFunc:r=>({x:()=>mt(r)})};var ZC={kernelName:To,inputsToSave:["a","b"],gradFunc:(r,t)=>{let[e,o]=t,n=bt(e.shape,o.shape);return{a:()=>{let i=st(r,X(o,"float32")),p=Mt(e.shape,n);return p.length>0?R(it(i,p),e.shape):i},b:()=>{let i=O(r,X(e,"float32")),p=Mt(o.shape,n);p.length>0&&(i=R(it(i,p),o.shape));let c=Ct(o);return $t(st(i,X(c,"float32")))}}}};var QC={kernelName:kn,inputsToSave:["x","mean","variance","scale"],gradFunc:(r,t,e)=>{let{varianceEpsilon:o}=e,[n,s,a,i]=t,p=i==null?J(1):i,c=Mt(s.shape,n.shape),l=[];if(s.rank===1){for(let w=0;w<n.shape.length-1;++w)l.push(n.shape[w]);l.push(1)}let u=rt(n,s),m=O(r,p),f=Ki(tt(a,J(o))),d=O(O(O(f,f),f),J(-.5));return{x:()=>s.rank===1?R(O(O(r,gr(R(f,[1,1,1,s.shape[0]]),l)),p),n.shape):R(O(O(r,f),p),n.shape),mean:()=>{let w=O(O(f,J(-1)),m);return s.rank===1&&(w=it(w,c)),R(w,s.shape)},variance:()=>{let w=O(O(d,u),m);return s.rank===1&&(w=it(w,c)),R(w,s.shape)},scale:()=>{let w=O(u,f),E=O(r,w);return s.rank===1&&(E=it(E,c)),R(E,s.shape)},offset:()=>{let w=r;return s.rank===1&&(w=it(w,c)),R(w,s.shape)}}}};var eT={kernelName:En,inputsToSave:["x","indices"],gradFunc:(r,t,e)=>{let[o,n]=t,{axis:s}=e,a=ce(s,o.shape)[0];return{x:()=>{let p=o.shape,c=n.size,l=p.slice(0,a),u=l.length,m=p.slice(s,p.length).slice(1),f=m.length,d=JC(0,u),g=JC(u+1,u+1+f),h=tT([l,[c],m]),x=R(r,h),b=R(n,[c]),S=tT([[u],d,g]),w=Se(x,S),E=Qi(w,b,o.shape[a]),$=ol(S);return E=Se(E,$),E},indices:()=>n}}};function JC(r,t){let e=[];for(let o=r;o<t;++o)e.push(o);return e}function tT(r){let t=[];for(let e=0;e<r.length;++e)for(let o=0;o<r[e].length;++o)t.push(r[e][o]);return t}var rT={kernelName:So,inputsToSave:["a","b"],gradFunc:(r,t)=>{let[e,o]=t;return{a:()=>mt(e),b:()=>mt(o)}}};var oT={kernelName:zr,gradFunc:r=>({x:()=>X(r,"float32")})};var nT={kernelName:wo,gradFunc:r=>({x:()=>mt(r)})};var sT={kernelName:No,gradFunc:r=>({x:()=>mt(r)})};var aT={kernelName:vo,gradFunc:r=>({x:()=>mt(r)})};var iT={kernelName:$n,inputsToSave:["x"],gradFunc:(r,t,e)=>{let[o]=t,{alpha:n}=e,s=xe(o,0);return{x:()=>Xt(s,r,O(r,n))}}};var pT={kernelName:Io,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>st(r,tt(e,1))}}};var cT={kernelName:"Log",inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>st(r,X(e,"float32"))}}};var lT={kernelName:th,inputsToSave:[],outputsToSave:[!0],gradFunc:(r,t,e)=>{let[o]=t,{axis:n}=e;return{logits:()=>{let a=ae(o);return rt(r,O(it(r,n,!0),a))}}}};function LP(r,t,e,o=5,n=1,s=1,a=.5){let i={x:r,y:t,dy:e},p={depthRadius:o,bias:n,alpha:s,beta:a};return v.runKernel(Va,i,p)}var uT=N({localResponseNormalizationBackprop_:LP});var mT={kernelName:"LRN",inputsToSave:["x"],outputsToSave:[!0],gradFunc:(r,t,e)=>{let[o,n]=t,{depthRadius:s,bias:a,alpha:i,beta:p}=e;return{x:()=>uT(o,n,r,s,a,i,p)}}};function Yu(r,t,e,o){return t.rank<e.rank&&(t=R(t,kr(t.shape,o))),r.rank<e.rank&&(r=R(r,kr(r.shape,o))),{x:()=>O(r,X(rs(e,t),r.dtype))}}var Dg={kernelName:"Max",inputsToSave:["x"],outputsToSave:[!0],gradFunc:(r,t,e)=>{let o=e,{reductionIndices:n}=o,s=t[0],a=t[1],i=ce(n,s.shape),p=Yu(r,a,s,i);return{x:()=>p.x()}}};var fT={kernelName:ko,inputsToSave:["a","b"],gradFunc:(r,t)=>{let[e,o]=t;return{a:()=>O(r,X(xr(e,o),"float32")),b:()=>O(r,X(_i(e,o),"float32"))}}};function MP(r,t,e,o,n,s,a){let i=C(r,"dy","maxPool3dGrad"),p=C(t,"input","maxPool3dGrad"),c=C(e,"output","maxPool3dGrad"),l=i,u=p,m=c,f=!1;p.rank===4&&(f=!0,l=R(i,[1,i.shape[0],i.shape[1],i.shape[2],i.shape[3]]),u=R(p,[1,p.shape[0],p.shape[1],p.shape[2],p.shape[3]]),m=R(c,[1,c.shape[0],c.shape[1],c.shape[2],c.shape[3]])),k(l.rank===5,()=>`Error in maxPool3dGrad: dy must be rank 5 but got rank ${l.rank}.`),k(u.rank===5,()=>`Error in maxPool3dGrad: input must be rank 5 but got rank ${u.rank}.`),k(m.rank===5,()=>`Error in maxPool3dGrad: output must be rank 5 but got rank ${m.rank}.`),Gt("maxPool3dGrad",s,a);let d={dy:l,input:u,output:m},g={filterSize:o,strides:n,pad:s,dimRoundingMode:a},h=v.runKernel(Ua,d,g);return f?R(h,[h.shape[1],h.shape[2],h.shape[3],h.shape[4]]):h}var dT=N({maxPool3dGrad_:MP});var hT={kernelName:Dn,inputsToSave:["x"],outputsToSave:[!0],gradFunc:(r,t,e)=>{let[o,n]=t,{filterSize:s,strides:a,pad:i,dimRoundingMode:p}=e;return{x:()=>dT(r,o,n,s,a,i,p)}}};function BP(r,t,e,o,n,s,a){let i=C(r,"dy","maxPoolGrad"),p=C(t,"input","maxPoolGrad"),c=C(e,"output","maxPoolGrad");k(p.rank===i.rank,()=>`Rank of input (${p.rank}) does not match rank of dy (${i.rank})`),k(i.rank===4,()=>`Error in maxPoolGrad: dy must be rank 4 but got rank ${i.rank}.`),k(p.rank===4,()=>`Error in maxPoolGrad: input must be rank 4 but got rank ${p.rank}.`),Gt("maxPoolGrad",s,a);let l={dy:i,input:p,output:c},u={filterSize:o,strides:n,pad:s,dimRoundingMode:a};return v.runKernel(Wa,l,u)}var gT=N({maxPoolGrad_:BP});var xT={kernelName:An,inputsToSave:["x"],outputsToSave:[!0],gradFunc:(r,t,e)=>{let[o,n]=t,{filterSize:s,strides:a,pad:i}=e;return{x:()=>gT(r,o,n,s,a,i)}}};var yT={kernelName:Rn,inputsToSave:["x"],gradFunc:(r,t,e)=>{let[o]=t,{axis:n}=e,s=ce(n,o.shape),i=Ph(o.shape,s)[1],p=It(i);return{x:()=>{let l=o.shape.slice();s.forEach(f=>{l[f]=1});let u=R(r,l);return st(O(u,Oe(o.shape,"float32")),p)}}}};var bT={kernelName:"Min",inputsToSave:["x"],outputsToSave:[!0],gradFunc:(r,t,e)=>{let o=e,{axis:n}=o,[s,a]=t,i=ce(n,s.shape),p=Yu(r,a,s,i);return{x:()=>p.x()}}};var CT={kernelName:Eo,inputsToSave:["a","b"],gradFunc:(r,t)=>{let[e,o]=t;return{a:()=>O(r,X(Xe(e,o),"float32")),b:()=>O(r,X(xe(e,o),"float32"))}}};var TT={kernelName:Fn,inputsToSave:["x"],gradFunc:(r,t,e)=>{let o=t[0],{paddings:n}=e,s=n.map(a=>a[0]);return{x:()=>xt(r,s,o.shape)}}};var ST={kernelName:"Mod",inputsToSave:["a","b"],gradFunc:(r,t)=>{let[e,o]=t,n=bt(e.shape,o.shape);return{a:()=>{let i=Mt(e.shape,n);return i.length>0?R(it(r,i),e.shape):r},b:()=>{let i=O(r,$t(os(st(e,o)))),p=Mt(o.shape,n);return p.length>0?R(it(i,p),o.shape):i}}}};var wT={kernelName:$o,inputsToSave:["a","b"],gradFunc:(r,t)=>{let[e,o]=t,n=bt(e.shape,o.shape);return{a:()=>{let i=O(r,X(o,"float32")),p=Mt(e.shape,n);return p.length>0?R(it(i,p),e.shape):i},b:()=>{let i=O(r,X(e,"float32")),p=Mt(o.shape,n);return p.length>0?R(it(i,p),o.shape):i}}}};var NT={kernelName:"Neg",gradFunc:r=>({x:()=>$t(r)})};var vT={kernelName:On,inputsToSave:["indices"],gradFunc:(r,t)=>{let e=t[0];return{indices:()=>_e(e.shape,"float32")}}};var IT={kernelName:_n,gradFunc:r=>({x:()=>mt(r)})};var kT={kernelName:Pn,saveAllInputs:!0,gradFunc:(r,t,e)=>{let{axis:o}=e;return $e(r,o).map(s=>()=>s)}};var Rg={kernelName:Ln,inputsToSave:["x"],gradFunc:(r,t,e)=>{let o=t[0],{paddings:n}=e,s=n.map(a=>a[0]);return{x:()=>xt(r,s,o.shape)}}};var ET={kernelName:"Pow",inputsToSave:["a","b"],outputsToSave:[!0],gradFunc:(r,t)=>{let[e,o,n]=t,s=e,a=o,i=bt(s.shape,a.shape);return{a:()=>{let l=X(a,"float32"),u=O(r,O(l,Ge(s,rt(l,J(1))))),m=Mt(s.shape,i);return m.length>0&&(u=it(u,m)),R(u,s.shape)},b:()=>{let l=xe(s,0),u=Xt(l,er(s),mt(s)),m=O(r,O(n,u)),f=Mt(a.shape,i);return f.length>0&&(m=it(m,f)),R(m,a.shape)}}}};var $T={kernelName:Mn,inputsToSave:["x","alpha"],gradFunc:(r,t)=>{let[e,o]=t,n=xe(e,0);return{x:()=>Xt(n,r,O(r,o)),alpha:()=>{let s=Xt(n,mt(r),O(r,e)),a=Mt(o.shape,r.shape);return a.length>0&&(s=it(s,a)),R(s,o.shape)}}}};var Xp={};At(Xp,{browserFiles:()=>HT,browserHTTPRequest:()=>XT,concatenateArrayBuffers:()=>Wp,copyModel:()=>eS,decodeWeights:()=>Qu,encodeWeights:()=>DT,fromMemory:()=>jT,fromMemorySync:()=>qg,getLoadHandlers:()=>LT,getModelArtifactsForJSON:()=>Up,getModelArtifactsForJSONSync:()=>Lg,getModelArtifactsInfoForJSON:()=>Yo,getSaveHandlers:()=>PT,getWeightSpecs:()=>tm,http:()=>nm,isHTTPScheme:()=>om,listModels:()=>JT,loadWeights:()=>qT,moveModel:()=>rS,registerLoadRouter:()=>OT,registerSaveRouter:()=>_T,removeModel:()=>tS,weightsLoaderFactory:()=>Ug,withSaveHandler:()=>YT,withSaveHandlerSync:()=>ZT});var ds={};At(ds,{isBrowser:()=>_g,isMobile:()=>zP,mockIsMobile:()=>VP});function GP(){return typeof navigator!="undefined"&&navigator!=null}var Fg;function VP(r){Fg=r}function zP(r){if(Fg!==void 0)return Fg;if(r||GP()){if(r||(r=navigator),r.product==="ReactNative")return!0;let t=r.userAgent||r.vendor||(typeof window!="undefined"?window.opera:"");if(!t){let e=r;return e.userAgentData&&e.userAgentData.mobile}return/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(t)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(t.substr(0,4))}return!1}function _g(){return typeof window!="undefined"&&window.document!=null||typeof WorkerGlobalScope!="undefined"}var sr=_();sr.registerFlag("DEBUG",()=>!1,r=>{r&&console.warn("Debugging mode is ON. The output of every math call will be downloaded to CPU and checked for NaNs. This significantly impacts performance.")});sr.registerFlag("IS_BROWSER",()=>_g());sr.registerFlag("IS_NODE",()=>typeof process!="undefined"&&typeof process.versions!="undefined"&&typeof process.versions.node!="undefined");sr.registerFlag("IS_CHROME",()=>typeof navigator!="undefined"&&navigator!=null&&navigator.userAgent!=null&&/Chrome/.test(navigator.userAgent)&&/Google Inc/.test(navigator.vendor));sr.registerFlag("PROD",()=>!1);sr.registerFlag("TENSORLIKE_CHECK_SHAPE_CONSISTENCY",()=>sr.getBool("DEBUG"));sr.registerFlag("DEPRECATION_WARNINGS_ENABLED",()=>!0);sr.registerFlag("IS_TEST",()=>!1);sr.registerFlag("CHECK_COMPUTATION_FOR_ERRORS",()=>!0);sr.registerFlag("WRAP_TO_IMAGEBITMAP",()=>!1);sr.registerFlag("ENGINE_COMPILE_ONLY",()=>!1);sr.registerFlag("CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU",()=>!1);sr.registerFlag("USE_SETTIMEOUTCUSTOM",()=>!1);var _l={float32:4,float16:2,int32:4,uint16:2,uint8:1,bool:1,complex64:8};var Zu=4;async function DT(r,t){let e=[],o=[],n=Array.isArray(r)?r.map(a=>a.name):Object.keys(r);for(let a=0;a<n.length;++a){let i=n[a],p=Array.isArray(r)?r[a].tensor:r[i];if(p.dtype!=="float32"&&p.dtype!=="int32"&&p.dtype!=="bool"&&p.dtype!=="string"&&p.dtype!=="complex64")throw new Error(`Unsupported dtype in weight '${i}': ${p.dtype}`);let c={name:i,shape:p.shape,dtype:p.dtype};if(p.dtype==="string"){let l=new Promise(async u=>{let m=await p.bytes(),f=m.reduce((h,x)=>h+x.length,0)+Zu*m.length,d=new Uint8Array(f),g=0;for(let h=0;h<m.length;h++){let x=m[h],b=new Uint8Array(new Uint32Array([x.length]).buffer);d.set(b,g),g+=Zu,d.set(x,g),g+=x.length}u(d)});o.push(l)}else o.push(p.data());t!=null&&(c.group=t),e.push(c)}let s=await Promise.all(o);return{data:WP(s),specs:e}}function Qu(r,t){let e={},o,n=0;for(let s of t){let a=s.name,i=s.dtype,p=s.shape,c=It(p),l;if("quantization"in s){let u=s.quantization;if(u.dtype==="uint8"||u.dtype==="uint16"){if(!("min"in u&&"scale"in u))throw new Error(`Weight ${s.name} with quantization ${u.dtype} doesn't have corresponding metadata min and scale.`)}else if(u.dtype==="float16"){if(i!=="float32")throw new Error(`Weight ${s.name} is quantized with ${u.dtype} which only supports weights of type float32 not ${i}.`)}else throw new Error(`Weight ${s.name} has unknown quantization dtype ${u.dtype}. Supported quantization dtypes are: 'uint8', 'uint16', and 'float16'.`);let m=_l[u.dtype],f=r.slice(n,n+c*m),d=u.dtype==="uint8"?new Uint8Array(f):new Uint16Array(f);if(i==="float32")if(u.dtype==="uint8"||u.dtype==="uint16"){l=new Float32Array(d.length);for(let g=0;g<d.length;g++){let h=d[g];l[g]=h*u.scale+u.min}}else if(u.dtype==="float16")o===void 0&&(o=KP()),l=o(d);else throw new Error(`Unsupported quantization type ${u.dtype} for weight type float32.`);else if(i==="int32"){if(u.dtype!=="uint8"&&u.dtype!=="uint16")throw new Error(`Unsupported quantization type ${u.dtype} for weight type int32.`);l=new Int32Array(d.length);for(let g=0;g<d.length;g++){let h=d[g];l[g]=Math.round(h*u.scale+u.min)}}else throw new Error(`Unsupported dtype in weight '${a}': ${i}`);n+=c*m}else if(i==="string"){let u=It(s.shape);l=[];for(let m=0;m<u;m++){let f=new Uint32Array(r.slice(n,n+Zu))[0];n+=Zu;let d=new Uint8Array(r.slice(n,n+f));l.push(d),n+=f}}else{let u=_l[i],m=r.slice(n,n+c*u);if(i==="float32")l=new Float32Array(m);else if(i==="int32")l=new Int32Array(m);else if(i==="bool")l=new Uint8Array(m);else if(i==="complex64"){l=new Float32Array(m);let f=new Float32Array(l.length/2),d=new Float32Array(l.length/2);for(let x=0;x<f.length;x++)f[x]=l[x*2],d[x]=l[x*2+1];let g=Te(f,p,"float32"),h=Te(d,p,"float32");e[a]=Be(g,h),g.dispose(),h.dispose()}else throw new Error(`Unsupported dtype in weight '${a}': ${i}`);n+=c*u}i!=="complex64"&&(e[a]=Te(l,p,i))}return e}function WP(r){if(r===null)throw new Error(`Invalid input value: ${JSON.stringify(r)}`);let t=0,e=[];r.forEach(s=>{if(t+=s.byteLength,e.push(s.byteLength===s.buffer.byteLength?s:new s.constructor(s)),!(s instanceof Float32Array||s instanceof Int32Array||s instanceof Uint8Array))throw new Error(`Unsupported TypedArray subtype: ${s.constructor.name}`)});let o=new Uint8Array(t),n=0;return e.forEach(s=>{o.set(new Uint8Array(s.buffer),n),n+=s.byteLength}),o.buffer}var Og=typeof Buffer!="undefined"&&(typeof Blob=="undefined"||typeof atob=="undefined"||typeof btoa=="undefined");function AT(r){return Og?Buffer.byteLength(r):new Blob([r]).size}function RT(r){if(Og)return Buffer.from(r).toString("base64");let t=new Uint8Array(r),e="";for(let o=0,n=t.length;o<n;o++)e+=String.fromCharCode(t[o]);return btoa(e)}function FT(r){if(Og){let o=Buffer.from(r,"base64");return o.buffer.slice(o.byteOffset,o.byteOffset+o.byteLength)}let t=atob(r),e=new Uint8Array(t.length);for(let o=0;o<t.length;++o)e.set([t.charCodeAt(o)],o);return e.buffer}function Wp(r){if(r.length===1)return r[0];let t=0;r.forEach(n=>{t+=n.byteLength});let e=new Uint8Array(t),o=0;return r.forEach(n=>{e.set(new Uint8Array(n),o),o+=n.byteLength}),e.buffer}function Pg(r){for(r=r.trim();r.endsWith("/");)r=r.slice(0,r.length-1);let e=r.split("/");return e[e.length-1]}function Ju(r,t){let e={modelTopology:r.modelTopology,format:r.format,generatedBy:r.generatedBy,convertedBy:r.convertedBy,weightsManifest:t};return r.signature!=null&&(e.signature=r.signature),r.userDefinedMetadata!=null&&(e.userDefinedMetadata=r.userDefinedMetadata),r.modelInitializer!=null&&(e.modelInitializer=r.modelInitializer),r.trainingConfig!=null&&(e.trainingConfig=r.trainingConfig),e}function Lg(r,t,e){let o={modelTopology:r.modelTopology,format:r.format,generatedBy:r.generatedBy,convertedBy:r.convertedBy};if(r.trainingConfig!=null&&(o.trainingConfig=r.trainingConfig),r.weightsManifest!=null){if(!t)throw new Error("modelJSON has weightsManifest but weightSpecs is null");if(!e)throw new Error("modelJSON has weightsManifest but weightData is null");o.weightSpecs=t,o.weightData=e}return r.signature!=null&&(o.signature=r.signature),r.userDefinedMetadata!=null&&(o.userDefinedMetadata=r.userDefinedMetadata),r.modelInitializer!=null&&(o.modelInitializer=r.modelInitializer),o}async function Up(r,t){let e,o;return r.weightsManifest!=null&&([e,o]=await t(r.weightsManifest)),Lg(r,e,o)}function Yo(r){if(r.modelTopology instanceof ArrayBuffer)throw new Error("Expected JSON model topology, received ArrayBuffer.");return{dateSaved:new Date,modelTopologyType:"JSON",modelTopologyBytes:r.modelTopology==null?0:AT(JSON.stringify(r.modelTopology)),weightSpecsBytes:r.weightSpecs==null?0:AT(JSON.stringify(r.weightSpecs)),weightDataBytes:r.weightData==null?0:r.weightData.byteLength}}function tm(r){let t=[];for(let e of r)t.push(...e.weights);return t}function UP(){let r=e=>{let o=e<<13,n=0;for(;(o&8388608)===0;)n-=8388608,o<<=1;return o&=-8388609,n+=947912704,o|n},t=new Uint32Array(2048);t[0]=0;for(let e=1;e<1024;e++)t[e]=r(e);for(let e=1024;e<2048;e++)t[e]=939524096+(e-1024<<13);return t}function HP(){let r=new Uint32Array(64);r[0]=0,r[31]=1199570944,r[32]=2147483648,r[63]=3347054592;for(let t=1;t<31;t++)r[t]=t<<23;for(let t=33;t<63;t++)r[t]=2147483648+(t-32<<23);return r}function qP(){let r=new Uint32Array(64);for(let t=0;t<64;t++)r[t]=1024;return r[0]=r[32]=0,r}function KP(){let r=UP(),t=HP(),e=qP();return o=>{let n=new ArrayBuffer(4*o.length),s=new Uint32Array(n);for(let a=0;a<o.length;a++){let i=o[a],p=r[e[i>>10]+(i&1023)]+t[i>>10];s[a]=p}return new Float32Array(n)}}var ye=class r{constructor(){this.saveRouters=[],this.loadRouters=[]}static getInstance(){return r.instance==null&&(r.instance=new r),r.instance}static registerSaveRouter(t){r.getInstance().saveRouters.push(t)}static registerLoadRouter(t){r.getInstance().loadRouters.push(t)}static getSaveHandlers(t){return r.getHandlers(t,"save")}static getLoadHandlers(t,e){return r.getHandlers(t,"load",e)}static getHandlers(t,e,o){let n=[];return(e==="load"?r.getInstance().loadRouters:r.getInstance().saveRouters).forEach(a=>{let i=a(t,o);i!==null&&n.push(i)}),n}},_T=r=>ye.registerSaveRouter(r),OT=r=>ye.registerLoadRouter(r),PT=r=>ye.getSaveHandlers(r),LT=(r,t)=>ye.getLoadHandlers(r,t);var Mg="tensorflowjs",Bg=1,op="models_store",ea="model_info_store";function MT(){if(!_().getBool("IS_BROWSER"))throw new Error("Failed to obtain IndexedDB factory because the current environmentis not a web browser.");let r=typeof window=="undefined"?self:window,t=r.indexedDB||r.mozIndexedDB||r.webkitIndexedDB||r.msIndexedDB||r.shimIndexedDB;if(t==null)throw new Error("The current browser does not appear to support IndexedDB.");return t}function Gg(r){let t=r.result;t.createObjectStore(op,{keyPath:"modelPath"}),t.createObjectStore(ea,{keyPath:"modelPath"})}var Zo=class{constructor(t){if(this.indexedDB=MT(),t==null||!t)throw new Error("For IndexedDB, modelPath must not be null, undefined or empty.");this.modelPath=t}async save(t){if(t.modelTopology instanceof ArrayBuffer)throw new Error("BrowserLocalStorage.save() does not support saving model topology in binary formats yet.");return this.databaseAction(this.modelPath,t)}async load(){return this.databaseAction(this.modelPath)}databaseAction(t,e){return new Promise((o,n)=>{let s=this.indexedDB.open(Mg,Bg);s.onupgradeneeded=()=>Gg(s),s.onsuccess=()=>{let a=s.result;if(e==null){let i=a.transaction(op,"readonly"),c=i.objectStore(op).get(this.modelPath);c.onsuccess=()=>{if(c.result==null)return a.close(),n(new Error(`Cannot find model with path '${this.modelPath}' in IndexedDB.`));o(c.result.modelArtifacts)},c.onerror=l=>(a.close(),n(c.error)),i.oncomplete=()=>a.close()}else{let i=Yo(e),p=a.transaction(ea,"readwrite"),c=p.objectStore(ea),l=c.put({modelPath:this.modelPath,modelArtifactsInfo:i}),u;l.onsuccess=()=>{u=a.transaction(op,"readwrite");let f=u.objectStore(op).put({modelPath:this.modelPath,modelArtifacts:e,modelArtifactsInfo:i});f.onsuccess=()=>o({modelArtifactsInfo:i}),f.onerror=d=>{c=p.objectStore(ea);let g=c.delete(this.modelPath);g.onsuccess=()=>(a.close(),n(f.error)),g.onerror=h=>(a.close(),n(f.error))}},l.onerror=m=>(a.close(),n(l.error)),p.oncomplete=()=>{u==null?a.close():u.oncomplete=()=>a.close()}}},s.onerror=a=>n(s.error)})}};Zo.URL_SCHEME="indexeddb://";var BT=r=>_().getBool("IS_BROWSER")&&!Array.isArray(r)&&r.startsWith(Zo.URL_SCHEME)?XP(r.slice(Zo.URL_SCHEME.length)):null;ye.registerSaveRouter(BT);ye.registerLoadRouter(BT);function XP(r){return new Zo(r)}function jP(r){return r.startsWith(Zo.URL_SCHEME)?r.slice(Zo.URL_SCHEME.length):r}var em=class{constructor(){this.indexedDB=MT()}async listModels(){return new Promise((t,e)=>{let o=this.indexedDB.open(Mg,Bg);o.onupgradeneeded=()=>Gg(o),o.onsuccess=()=>{let n=o.result,s=n.transaction(ea,"readonly"),i=s.objectStore(ea).getAll();i.onsuccess=()=>{let p={};for(let c of i.result)p[c.modelPath]=c.modelArtifactsInfo;t(p)},i.onerror=p=>(n.close(),e(i.error)),s.oncomplete=()=>n.close()},o.onerror=n=>e(o.error)})}async removeModel(t){return t=jP(t),new Promise((e,o)=>{let n=this.indexedDB.open(Mg,Bg);n.onupgradeneeded=()=>Gg(n),n.onsuccess=()=>{let s=n.result,a=s.transaction(ea,"readwrite"),i=a.objectStore(ea),p=i.get(t),c;p.onsuccess=()=>{if(p.result==null)return s.close(),o(new Error(`Cannot find model with path '${t}' in IndexedDB.`));{let l=i.delete(t),u=()=>{c=s.transaction(op,"readwrite");let f=c.objectStore(op).delete(t);f.onsuccess=()=>e(p.result.modelArtifactsInfo),f.onerror=d=>o(p.error)};l.onsuccess=u,l.onerror=m=>(u(),s.close(),o(p.error))}},p.onerror=l=>(s.close(),o(p.error)),a.oncomplete=()=>{c==null?s.close():c.oncomplete=()=>s.close()}},n.onerror=s=>o(n.error)})}};var hs="/",Hp="tensorflowjs_models",GT="info",YP="model_topology",ZP="weight_specs",QP="weight_data",JP="model_metadata";function VT(r){return{info:[Hp,r,GT].join(hs),topology:[Hp,r,YP].join(hs),weightSpecs:[Hp,r,ZP].join(hs),weightData:[Hp,r,QP].join(hs),modelMetadata:[Hp,r,JP].join(hs)}}function zT(r){for(let t of Object.values(r))window.localStorage.removeItem(t)}function t3(r){let t=r.split(hs);if(t.length<3)throw new Error(`Invalid key format: ${r}`);return t.slice(1,t.length-1).join(hs)}function e3(r){return r.startsWith(Qo.URL_SCHEME)?r.slice(Qo.URL_SCHEME.length):r}var Qo=class{constructor(t){if(!_().getBool("IS_BROWSER")||typeof window=="undefined"||typeof window.localStorage=="undefined")throw new Error("The current environment does not support local storage.");if(this.LS=window.localStorage,t==null||!t)throw new Error("For local storage, modelPath must not be null, undefined or empty.");this.modelPath=t,this.keys=VT(this.modelPath)}async save(t){if(t.modelTopology instanceof ArrayBuffer)throw new Error("BrowserLocalStorage.save() does not support saving model topology in binary formats yet.");{let e=JSON.stringify(t.modelTopology),o=JSON.stringify(t.weightSpecs),n=Yo(t);try{this.LS.setItem(this.keys.info,JSON.stringify(n)),this.LS.setItem(this.keys.topology,e),this.LS.setItem(this.keys.weightSpecs,o),this.LS.setItem(this.keys.weightData,RT(t.weightData));let s={format:t.format,generatedBy:t.generatedBy,convertedBy:t.convertedBy,signature:t.signature!=null?t.signature:void 0,userDefinedMetadata:t.userDefinedMetadata!=null?t.userDefinedMetadata:void 0,modelInitializer:t.modelInitializer!=null?t.modelInitializer:void 0,trainingConfig:t.trainingConfig!=null?t.trainingConfig:void 0};return this.LS.setItem(this.keys.modelMetadata,JSON.stringify(s)),{modelArtifactsInfo:n}}catch{throw zT(this.keys),new Error(`Failed to save model '${this.modelPath}' to local storage: size quota being exceeded is a possible cause of this failure: modelTopologyBytes=${n.modelTopologyBytes}, weightSpecsBytes=${n.weightSpecsBytes}, weightDataBytes=${n.weightDataBytes}.`)}}}async load(){let t=JSON.parse(this.LS.getItem(this.keys.info));if(t==null)throw new Error(`In local storage, there is no model with name '${this.modelPath}'`);if(t.modelTopologyType!=="JSON")throw new Error("BrowserLocalStorage does not support loading non-JSON model topology yet.");let e={},o=JSON.parse(this.LS.getItem(this.keys.topology));if(o==null)throw new Error(`In local storage, the topology of model '${this.modelPath}' is missing.`);e.modelTopology=o;let n=JSON.parse(this.LS.getItem(this.keys.weightSpecs));if(n==null)throw new Error(`In local storage, the weight specs of model '${this.modelPath}' are missing.`);e.weightSpecs=n;let s=this.LS.getItem(this.keys.modelMetadata);if(s!=null){let i=JSON.parse(s);e.format=i.format,e.generatedBy=i.generatedBy,e.convertedBy=i.convertedBy,i.signature!=null&&(e.signature=i.signature),i.userDefinedMetadata!=null&&(e.userDefinedMetadata=i.userDefinedMetadata),i.modelInitializer!=null&&(e.modelInitializer=i.modelInitializer),i.trainingConfig!=null&&(e.trainingConfig=i.trainingConfig)}let a=this.LS.getItem(this.keys.weightData);if(a==null)throw new Error(`In local storage, the binary weight values of model '${this.modelPath}' are missing.`);return e.weightData=FT(a),e}};Qo.URL_SCHEME="localstorage://";var WT=r=>_().getBool("IS_BROWSER")&&!Array.isArray(r)&&r.startsWith(Qo.URL_SCHEME)?r3(r.slice(Qo.URL_SCHEME.length)):null;ye.registerSaveRouter(WT);ye.registerLoadRouter(WT);function r3(r){return new Qo(r)}var rm=class{constructor(){k(_().getBool("IS_BROWSER"),()=>"Current environment is not a web browser"),k(typeof window=="undefined"||typeof window.localStorage!="undefined",()=>"Current browser does not appear to support localStorage"),this.LS=window.localStorage}async listModels(){let t={},e=Hp+hs,o=hs+GT;for(let n=0;n<this.LS.length;++n){let s=this.LS.key(n);if(s.startsWith(e)&&s.endsWith(o)){let a=t3(s);t[a]=JSON.parse(this.LS.getItem(s))}}return t}async removeModel(t){t=e3(t);let e=VT(t);if(this.LS.getItem(e.info)==null)throw new Error(`Cannot find model at path '${t}'`);let o=JSON.parse(this.LS.getItem(e.info));return zT(e),o}};var o3="model",n3=".json",s3=".weights.bin";function UT(r){return new Promise(t=>setTimeout(t)).then(r)}var qp=class r{constructor(t){if(!_().getBool("IS_BROWSER"))throw new Error("browserDownloads() cannot proceed because the current environment is not a browser.");t.startsWith(r.URL_SCHEME)&&(t=t.slice(r.URL_SCHEME.length)),(t==null||t.length===0)&&(t=o3),this.modelJsonFileName=t+n3,this.weightDataFileName=t+s3}async save(t){if(typeof document=="undefined")throw new Error("Browser downloads are not supported in this environment since `document` is not present");let e=window.URL.createObjectURL(new Blob([t.weightData],{type:"application/octet-stream"}));if(t.modelTopology instanceof ArrayBuffer)throw new Error("BrowserDownloads.save() does not support saving model topology in binary formats yet.");{let o=[{paths:["./"+this.weightDataFileName],weights:t.weightSpecs}],n=Ju(t,o),s=window.URL.createObjectURL(new Blob([JSON.stringify(n)],{type:"application/json"})),a=this.modelJsonAnchor==null?document.createElement("a"):this.modelJsonAnchor;if(a.download=this.modelJsonFileName,a.href=s,await UT(()=>a.dispatchEvent(new MouseEvent("click"))),t.weightData!=null){let i=this.weightDataAnchor==null?document.createElement("a"):this.weightDataAnchor;i.download=this.weightDataFileName,i.href=e,await UT(()=>i.dispatchEvent(new MouseEvent("click")))}return{modelArtifactsInfo:Yo(t)}}}};qp.URL_SCHEME="downloads://";var Vg=class{constructor(t){if(t==null||t.length<1)throw new Error(`When calling browserFiles, at least 1 file is required, but received ${t}`);this.jsonFile=t[0],this.weightsFiles=t.slice(1)}async load(){return new Promise((t,e)=>{let o=new FileReader;o.onload=n=>{let s=JSON.parse(n.target.result),a=s.modelTopology;if(a==null){e(new Error(`modelTopology field is missing from file ${this.jsonFile.name}`));return}if(s.weightsManifest==null){e(new Error(`weightManifest field is missing from file ${this.jsonFile.name}`));return}if(this.weightsFiles.length===0){t({modelTopology:a});return}let p=Up(s,c=>this.loadWeights(c));t(p)},o.onerror=n=>e(`Failed to read model topology and weights manifest JSON from file '${this.jsonFile.name}'. BrowserFiles supports loading Keras-style tf.Model artifacts only.`),o.readAsText(this.jsonFile)})}loadWeights(t){let e=[],o=[];for(let a of t)e.push(...a.weights),o.push(...a.paths);let n=this.checkManifestAndWeightFiles(t),s=o.map(a=>this.loadWeightsFile(a,n[a]));return Promise.all(s).then(a=>[e,Wp(a)])}loadWeightsFile(t,e){return new Promise((o,n)=>{let s=new FileReader;s.onload=a=>{let i=a.target.result;o(i)},s.onerror=a=>n(`Failed to weights data from file of path '${t}'.`),s.readAsArrayBuffer(e)})}checkManifestAndWeightFiles(t){let e=[],o=this.weightsFiles.map(s=>Pg(s.name)),n={};for(let s of t)s.paths.forEach(a=>{let i=Pg(a);if(e.indexOf(i)!==-1)throw new Error(`Duplicate file basename found in weights manifest: '${i}'`);if(e.push(i),o.indexOf(i)===-1)throw new Error(`Weight file with basename '${i}' is not provided.`);n[a]=this.weightsFiles[o.indexOf(i)]});if(e.length!==this.weightsFiles.length)throw new Error(`Mismatch in the number of files in weights manifest (${e.length}) and the number of weight files provided (${this.weightsFiles.length}).`);return n}},a3=r=>_().getBool("IS_BROWSER")&&!Array.isArray(r)&&r.startsWith(qp.URL_SCHEME)?i3(r.slice(qp.URL_SCHEME.length)):null;ye.registerSaveRouter(a3);function i3(r="model"){return new qp(r)}function HT(r){return new Vg(r)}function zg(r,t,e,o){a(r),e=e==null?0:e,o=o==null?1:o,i(e,o);let n=0,s=p=>(p.then(c=>{let l=e+ ++n/r.length*(o-e);return t(l),c}),p);function a(p){k(p!=null&&Array.isArray(p)&&p.length>0,()=>"promises must be a none empty array")}function i(p,c){k(p>=0&&p<=1,()=>`Progress fraction must be in range [0, 1], but got startFraction ${p}`),k(c>=0&&c<=1,()=>`Progress fraction must be in range [0, 1], but got endFraction ${c}`),k(c>=p,()=>`startFraction must be no more than endFraction, but got startFraction ${p} and endFraction ${c}`)}return Promise.all(r.map(s))}async function Wg(r,t){t==null&&(t={});let e=t.fetchFunc==null?_().platform.fetch:t.fetchFunc,o=r.map(u=>e(u,t.requestInit,{isBinary:!0})),i=(t.onProgress==null?await Promise.all(o):await zg(o,t.onProgress,0,.5)).map(u=>u.arrayBuffer());return t.onProgress==null?await Promise.all(i):await zg(i,t.onProgress,.5,1)}async function qT(r,t="",e,o){return Ug(a=>Wg(a,{requestInit:o}))(r,t,e)}function Ug(r){return async(t,e="",o)=>{let n=t.map(()=>!1),s={},a=o!=null?o.map(()=>!1):[],i=[];if(t.forEach((f,d)=>{let g=0;f.weights.forEach(h=>{let x="quantization"in h?h.quantization.dtype:h.dtype,b=_l[x]*It(h.shape),S=()=>{n[d]=!0,s[d]==null&&(s[d]=[]),s[d].push({manifestEntry:h,groupOffset:g,sizeBytes:b})};o!=null?o.forEach((w,E)=>{w===h.name&&(S(),a[E]=!0)}):S(),i.push(h.name),g+=b})}),!a.every(f=>f)){let f=o.filter((d,g)=>!a[g]);throw new Error(`Could not find weights in manifest with names: ${f.join(", ")}. 
Manifest JSON has weights with names: ${i.join(", ")}.`)}let p=n.reduce((f,d,g)=>(d&&f.push(g),f),[]),c=[];p.forEach(f=>{t[f].paths.forEach(d=>{let g=e+(e.endsWith("/")?"":"/")+d;c.push(g)})});let l=await r(c),u={},m=0;return p.forEach(f=>{let d=t[f].paths.length,g=0;for(let w=0;w<d;w++)g+=l[m+w].byteLength;let h=new ArrayBuffer(g),x=new Uint8Array(h),b=0;for(let w=0;w<d;w++){let E=new Uint8Array(l[m+w]);x.set(E,b),b+=E.byteLength}s[f].forEach(w=>{let E=h.slice(w.groupOffset,w.groupOffset+w.sizeBytes),$=Qu(E,[w.manifestEntry]);for(let D in $)u[D]=$[D]}),m+=d}),u}}var p3="application/octet-stream",c3="application/json",Ol=class{constructor(t,e){if(this.DEFAULT_METHOD="POST",e==null&&(e={}),this.weightPathPrefix=e.weightPathPrefix,this.onProgress=e.onProgress,this.weightUrlConverter=e.weightUrlConverter,e.fetchFunc!=null?(k(typeof e.fetchFunc=="function",()=>"Must pass a function that matches the signature of `fetch` (see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)"),this.fetch=e.fetchFunc):this.fetch=_().platform.fetch,k(t!=null&&t.length>0,()=>"URL path for http must not be null, undefined or empty."),Array.isArray(t)&&k(t.length===2,()=>`URL paths for http must have a length of 2, (actual length is ${t.length}).`),this.path=t,e.requestInit!=null&&e.requestInit.body!=null)throw new Error("requestInit is expected to have no pre-existing body, but has one.");this.requestInit=e.requestInit||{}}async save(t){if(t.modelTopology instanceof ArrayBuffer)throw new Error("BrowserHTTPRequest.save() does not support saving model topology in binary formats yet.");let e=Object.assign({method:this.DEFAULT_METHOD},this.requestInit);e.body=new FormData;let o=[{paths:["./model.weights.bin"],weights:t.weightSpecs}],n=Ju(t,o);e.body.append("model.json",new Blob([JSON.stringify(n)],{type:c3}),"model.json"),t.weightData!=null&&e.body.append("model.weights.bin",new Blob([t.weightData],{type:p3}),"model.weights.bin");let s=await this.fetch(this.path,e);if(s.ok)return{modelArtifactsInfo:Yo(t),responses:[s]};throw new Error(`BrowserHTTPRequest.save() failed due to HTTP response status ${s.status}.`)}async load(){let t=await this.fetch(this.path,this.requestInit);if(!t.ok)throw new Error(`Request to ${this.path} failed with status code ${t.status}. Please verify this URL points to the model JSON of the model to load.`);let e;try{e=await t.json()}catch{let a=`Failed to parse model JSON of response from ${this.path}.`;throw this.path.endsWith(".pb")?a+=" Your path contains a .pb file extension. Support for .pb models have been removed in TensorFlow.js 1.0 in favor of .json models. You can re-convert your Python TensorFlow model using the TensorFlow.js 1.0 conversion scripts or you can convert your.pb models with the 'pb2json'NPM script in the tensorflow/tfjs-converter repository.":a+=" Please make sure the server is serving valid JSON for this request.",new Error(a)}let o=e.modelTopology,n=e.weightsManifest;if(o==null&&n==null)throw new Error(`The JSON from HTTP path ${this.path} contains neither model topology or manifest for weights.`);return Up(e,s=>this.loadWeights(s))}async loadWeights(t){let e=Array.isArray(this.path)?this.path[1]:this.path,[o,n]=l3(e),s=this.weightPathPrefix||o,a=tm(t),i=[],p=[];for(let l of t)for(let u of l.paths)this.weightUrlConverter!=null?p.push(this.weightUrlConverter(u)):i.push(s+u+n);this.weightUrlConverter&&i.push(...await Promise.all(p));let c=await Wg(i,{requestInit:this.requestInit,fetchFunc:this.fetch,onProgress:this.onProgress});return[a,Wp(c)]}};Ol.URL_SCHEME_REGEX=/^https?:\/\//;function l3(r){let t=r.lastIndexOf("/"),e=r.lastIndexOf("?"),o=r.substring(0,t),n=e>t?r.substring(e):"";return[o+"/",n]}function om(r){return r.match(Ol.URL_SCHEME_REGEX)!=null}var KT=(r,t)=>{if(typeof fetch=="undefined"&&(t==null||t.fetchFunc==null))return null;{let e=!0;if(Array.isArray(r)?e=r.every(o=>om(o)):e=om(r),e)return nm(r,t)}return null};ye.registerSaveRouter(KT);ye.registerLoadRouter(KT);function nm(r,t){return new Ol(r,t)}function XT(r,t){return nm(r,t)}var Pl=class{constructor(t){this.modelArtifacts=t}load(){return this.modelArtifacts}},sm=class{constructor(t){this.saveHandler=t}save(t){return this.saveHandler(t)}},Hg=class{constructor(t){t.load&&(this.load=()=>Promise.resolve(t.load())),t.save&&(this.save=e=>Promise.resolve(t.save(e)))}};function jT(r,t,e,o){let n=arguments;return new Hg(qg(...n))}function qg(r,t,e,o){return arguments.length===1?r.modelTopology!=null||r.weightSpecs!=null?new Pl(r):(console.warn("Please call tf.io.fromMemory() with only one argument. The argument should be of type ModelArtifacts. The multi-argument signature of tf.io.fromMemory() has been deprecated and will be removed in a future release."),new Pl({modelTopology:r})):(console.warn("Please call tf.io.fromMemory() with only one argument. The argument should be of type ModelArtifacts. The multi-argument signature of tf.io.fromMemory() has been deprecated and will be removed in a future release."),new Pl({modelTopology:r,weightSpecs:t,weightData:e,trainingConfig:o}))}function YT(r){return new sm(r)}function ZT(r){return new sm(r)}var Kp="://",Qr=class r{constructor(){this.managers={}}static getInstance(){return r.instance==null&&(r.instance=new r),r.instance}static registerManager(t,e){k(t!=null,()=>"scheme must not be undefined or null."),t.endsWith(Kp)&&(t=t.slice(0,t.indexOf(Kp))),k(t.length>0,()=>"scheme must not be an empty string.");let o=r.getInstance();k(o.managers[t]==null,()=>`A model store manager is already registered for scheme '${t}'.`),o.managers[t]=e}static getManager(t){let e=r.getInstance().managers[t];if(e==null)throw new Error(`Cannot find model manager for scheme '${t}'`);return e}static getSchemes(){return Object.keys(r.getInstance().managers)}};function am(r){if(r.indexOf(Kp)===-1)throw new Error(`The url string provided does not contain a scheme. Supported schemes are: ${Qr.getSchemes().join(",")}`);return{scheme:r.split(Kp)[0],path:r.split(Kp)[1]}}async function QT(r,t,e=!1){k(r!==t,()=>`Old path and new path are the same: '${r}'`);let o=ye.getLoadHandlers(r);k(o.length>0,()=>`Copying failed because no load handler is found for source URL ${r}.`),k(o.length<2,()=>`Copying failed because more than one (${o.length}) load handlers for source URL ${r}.`);let n=o[0],s=ye.getSaveHandlers(t);k(s.length>0,()=>`Copying failed because no save handler is found for destination URL ${t}.`),k(s.length<2,()=>`Copying failed because more than one (${o.length}) save handlers for destination URL ${t}.`);let a=s[0],i=am(r).scheme,p=am(r).path,c=i===am(r).scheme,l=await n.load();e&&c&&await Qr.getManager(i).removeModel(p);let u=await a.save(l);return e&&!c&&await Qr.getManager(i).removeModel(p),u.modelArtifactsInfo}async function JT(){let r=Qr.getSchemes(),t={};for(let e of r){let o=await Qr.getManager(e).listModels();for(let n in o){let s=e+Kp+n;t[s]=o[n]}}return t}async function tS(r){let t=am(r);return Qr.getManager(t.scheme).removeModel(t.path)}async function eS(r,t){return QT(r,t,!1)}async function rS(r,t){return QT(r,t,!0)}var Kg={};At(Kg,{confusionMatrix:()=>oS});function u3(r,t,e){let o=C(r,"labels","confusionMatrix"),n=C(t,"predictions","confusionMatrix");k(e==null||e>0&&Number.isInteger(e),()=>`If provided, numClasses must be a positive integer, but got ${e}`),k(o.rank===1,()=>`Expected the rank of labels to be 1, but got ${o.rank}`),k(n.rank===1,()=>`Expected the rank of predictions to be 1, but got ${n.rank}`),k(o.shape[0]===n.shape[0],()=>`Mismatch in the number of examples: ${o.shape[0]} vs. ${n.shape[0]}. Labels and predictions should have the same number of elements.`),k(e>0&&Number.isInteger(e),()=>`numClasses is required to be a positive integer, but got ${e}`);let s=ta(X(o,"int32"),e),a=ta(X(n,"int32"),e),i=Se(s),p=Tt(i,a);return X(p,"int32")}var oS=N({confusionMatrix_:u3});var Xg={};At(Xg,{fromPixels:()=>y3,fromPixelsAsync:()=>g3,toPixels:()=>x3});var np;function nS(r,t=3){if(t>4)throw new Error("Cannot construct Tensor with more than 4 channels from pixels.");if(r==null)throw new Error("pixels passed to tf.browser.fromPixels() can not be null");let e=!1,o=!1,n=!1,s=!1,a=!1,i=!1;if(r.data instanceof Uint8Array)e=!0;else if(typeof ImageData!="undefined"&&r instanceof ImageData)o=!0;else if(typeof HTMLVideoElement!="undefined"&&r instanceof HTMLVideoElement)n=!0;else if(typeof HTMLImageElement!="undefined"&&r instanceof HTMLImageElement)s=!0;else if(r.getContext!=null)a=!0;else if(typeof ImageBitmap!="undefined"&&r instanceof ImageBitmap)i=!0;else throw new Error(`pixels passed to tf.browser.fromPixels() must be either an HTMLVideoElement, HTMLImageElement, HTMLCanvasElement, ImageData in browser, or OffscreenCanvas, ImageData in webworker or {data: Uint32Array, width: number, height: number}, but was ${r.constructor.name}`);if(Dp($p,v.backendName)!=null){let d={pixels:r},g={numChannels:t};return v.runKernel($p,d,g)}let[c,l]=n?[r.videoWidth,r.videoHeight]:[r.width,r.height],u;if(a)u=r.getContext("2d").getImageData(0,0,c,l).data;else if(o||e)u=r.data;else if(s||n||i){if(np==null)if(typeof document=="undefined")if(typeof OffscreenCanvas!="undefined"&&typeof OffscreenCanvasRenderingContext2D!="undefined")np=new OffscreenCanvas(1,1).getContext("2d");else throw new Error("Cannot parse input in current context. Reason: OffscreenCanvas Context2D rendering is not supported.");else np=document.createElement("canvas").getContext("2d",{willReadFrequently:!0});np.canvas.width=c,np.canvas.height=l,np.drawImage(r,0,0,c,l),u=np.getImageData(0,0,c,l).data}let m;if(t===4)m=new Int32Array(u);else{let d=c*l;m=new Int32Array(d*t);for(let g=0;g<d;g++)for(let h=0;h<t;++h)m[g*t+h]=u[g*4+h]}return $l(m,[l,c,t],"int32")}function m3(r){return r!=null&&r.data instanceof Uint8Array}function f3(){return typeof window!="undefined"&&typeof ImageBitmap!="undefined"&&window.hasOwnProperty("createImageBitmap")}function d3(r){return r!=null&&r.width!==0&&r.height!==0}function h3(r){return f3()&&!(r instanceof ImageBitmap)&&d3(r)&&!m3(r)}async function g3(r,t=3){let e=null;if(_().getBool("WRAP_TO_IMAGEBITMAP")&&h3(r)){let o;try{o=await createImageBitmap(r,{premultiplyAlpha:"none"})}catch{o=null}o!=null&&o.width===r.width&&o.height===r.height?e=o:e=r}else e=r;return nS(e,t)}async function x3(r,t){let e=C(r,"img","toPixels");if(!(r instanceof Rt)){let c=e;e=X(c,"int32"),c.dispose()}if(e.rank!==2&&e.rank!==3)throw new Error(`toPixels only supports rank 2 or 3 tensors, got rank ${e.rank}.`);let[o,n]=e.shape.slice(0,2),s=e.rank===2?1:e.shape[2];if(s>4||s===2)throw new Error(`toPixels only supports depth of size 1, 3 or 4 but got ${s}`);if(e.dtype!=="float32"&&e.dtype!=="int32")throw new Error(`Unsupported type for toPixels: ${e.dtype}. Please use float32 or int32 tensors.`);let a=await e.data(),i=e.dtype==="float32"?255:1,p=new Uint8ClampedArray(n*o*4);for(let c=0;c<o*n;++c){let l=[0,0,0,255];for(let m=0;m<s;m++){let f=a[c*s+m];if(e.dtype==="float32"){if(f<0||f>1)throw new Error(`Tensor values for a float32 Tensor must be in the range [0 - 1] but encountered ${f}.`)}else if(e.dtype==="int32"&&(f<0||f>255))throw new Error(`Tensor values for a int32 Tensor must be in the range [0 - 255] but encountered ${f}.`);s===1?(l[0]=f*i,l[1]=f*i,l[2]=f*i):l[m]=f*i}let u=c*4;p[u+0]=Math.round(l[0]),p[u+1]=Math.round(l[1]),p[u+2]=Math.round(l[2]),p[u+3]=Math.round(l[3])}if(t!=null){t.width=n,t.height=o;let c=t.getContext("2d"),l=new ImageData(p,n,o);c.putImageData(l,0,0)}return e!==r&&e.dispose(),p}var y3=N({fromPixels_:nS});var jg={};At(jg,{prepareAndValidate:()=>sS});function sS(r,t){let e=r.shape.length,o=t.shape.length;if(e<1)throw new Error(`tf.gatherND() expects the input to be rank 1 or higher, but the rank was ${e}.`);if(o<1)throw new Error(`tf.gatherND() expects the indices to be rank 1 or higher, but the rank was ${o}.`);if(t.dtype!=="int32")throw new Error(`tf.gatherND() expects the indices to be int32 type, but the dtype was ${t.dtype}.`);if(t.shape[o-1]>e)throw new Error(`index innermost dimension length must be <= tensor rank; saw: ${t.shape[o-1]} vs. ${e}`);if(It(r.shape)===0)throw new Error(`Requested more than 0 entries, but input is empty. Input shape: ${r.shape}.`);let n=t.shape,s=n[n.length-1],a=1;for(let u=0;u<n.length-1;++u)a*=n[u];let i=r.shape,p=n.slice();p.pop();let c=1;for(let u=s;u<e;++u)c*=i[u],p.push(i[u]);let l=[...so(r.shape).map(u=>u/c),1].slice(0,s);return[p,a,c,l]}var de={};At(de,{assertParamsValid:()=>C3,computeFlatOffset:()=>v3,computeOutShape:()=>S3,getNormalizedAxes:()=>w3,isSliceContinous:()=>N3,maskToAxes:()=>T3,parseSliceParams:()=>Zg,sliceInfo:()=>I3,startForAxis:()=>fS,startIndicesWithElidedDims:()=>lS,stopForAxis:()=>dS,stopIndicesWithElidedDims:()=>uS,stridesForAxis:()=>mS,stridesWithElidedDims:()=>iS});var Yg=-2,b3=-1;function C3(r,t,e){let o=r.shape.length;k(o===t.length,()=>`Error in slice${o}D: Length of begin ${t} must match the rank of the array (${o}).`),k(o===e.length,()=>`Error in slice${o}D: Length of size ${e} must match the rank of the array (${o}).`);for(let n=0;n<o;++n)k(t[n]+e[n]<=r.shape[n],()=>`Error in slice${o}D: begin[${n}] + size[${n}] (${t[n]+e[n]}) would overflow input.shape[${n}] (${r.shape[n]})`)}function T3(r){let t=[],e=0;for(;r>0;)r&1&&t.push(e),r/=2,e++;return t}function S3(r,t,e){let o=[];for(let n=0;n<r.length;n++)o[n]=Math.ceil((t[n]-r[n])/e[n]);return o}function iS(r,t,e,o){let n=[...r];for(let s=n.length;s<o.length;s++)n.push(1);for(let s=0;s<e;s++)s===0?n[t]=1:(n.splice(t,0,1),n.pop());return n}function pS(r,t,e){return e<=r?e:e-(t-1)}function cS(r,t){let e=[];for(let o=0;o<r;o++)e.push(t+o);return e}function w3(r,t,e,o,n,s,a,i,p){let c=r.length,l=new Array(c),u=new Array(c),m=new Array(c);if(t.length&&e>0){let f=t[0],d=e+1;l=lS(a,f,d,o,r),u=uS(i,f,d,n,r),m=iS(s,f,d,r)}else for(let f=0;f<c;f++)l[f]=fS(a,o,s,r,f,p),u[f]=dS(i,n,s,r,f,p),m[f]=mS(s,f,p);return{begin:l,end:u,strides:m}}function lS(r,t,e,o,n){let s=[...n],a=cS(e,t);for(let i=0;i<s.length;i++)if(a.indexOf(i)>-1)s[i]=0;else{let p=pS(t,e,i),c=o[p];r&1<<p&&(c=0),s[i]=c}return s}function uS(r,t,e,o,n){let s=[...n],a=cS(e,t);for(let i=0;i<s.length;i++)if(a.indexOf(i)>-1)s[i]=Number.MAX_SAFE_INTEGER;else{let p=pS(t,e,i),c=o[p];r&1<<p&&(c=Number.MAX_SAFE_INTEGER),s[i]=c}for(let i=0;i<s.length;i++){let p=n[i];s[i]<0&&(s[i]+=p),s[i]=bp(0,s[i],n[i])}return s}function mS(r,t,e){let o=r[t];return(e&1<<t||o==null)&&(o=1),o}function fS(r,t,e,o,n,s){let a=t[n],i=e[n]||1;(r&1<<n||s&1<<n||a==null)&&(i>0?a=Number.MIN_SAFE_INTEGER:a=Number.MAX_SAFE_INTEGER);let p=o[n];return a<0&&(a+=p),a=bp(0,a,p-1),a}function dS(r,t,e,o,n,s){let a=t[n],i=e[n]||1;(r&1<<n||s&1<<n||a==null)&&(i>0?a=Number.MAX_SAFE_INTEGER:a=Number.MIN_SAFE_INTEGER);let p=o[n];return a<0&&(a+=p),i>0?a=bp(0,a,p):a=bp(-1,a,p-1),a}function N3(r,t,e){let o=e.length;for(let n=0;n<e.length;n++)if(e[n]>1){o=n;break}for(let n=o+1;n<e.length;n++)if(t[n]>0||e[n]!==r[n])return!1;return!0}function v3(r,t){let e=r.length>0?r[r.length-1]:1;for(let o=0;o<r.length-1;o++)e+=r[o]*t[o];return e}function Zg(r,t,e){let o,n=r.shape.length;typeof t=="number"?o=[t,...new Array(n-1).fill(0)]:t.length<n?o=t.concat(new Array(n-t.length).fill(0)):o=t.slice(),o.forEach(a=>{k(a!==-1,()=>"slice() does not support negative begin indexing.")});let s;return e==null?s=new Array(n).fill(-1):typeof e=="number"?s=[e,...new Array(n-1).fill(-1)]:e.length<n?s=e.concat(new Array(n-e.length).fill(-1)):s=e,s=s.map((a,i)=>a>=0?a:(k(a===-1,()=>`Negative size values should be exactly -1 but got ${a} for the slice() size at index ${i}.`),r.shape[i]-o[i])),[o,s]}function I3(r,t,e,o,n,s,a,i,p){let c;if(o==null?(c=new Array(t.length),c.fill(1)):c=o,a!=null&&(a&a-1)!==0)throw new Error("Multiple ellipses in slice is not allowed.");let l=!1,u={dims:c.length,numAddAxisAfterEllipsis:0,begin:t.slice(),end:e.slice(),strides:c.slice(),beginMask:n,endMask:s,ellipsisMask:a,newAxisMask:i,shrinkAxisMask:p};for(let S=0;S<u.dims;S++)l&&(1<<S&i)!==0&&u.numAddAxisAfterEllipsis++,1<<S&a&&(l=!0);l||(u.ellipsisMask|=1<<u.dims,u.dims++);let m={dims:r.length,beginMask:0,endMask:0,beginValid:!1,endValid:!1};k3(u,m);let f=!0,d=!0,g=!0,h=[],x=[];for(let S=0;S<r.length;++S){if(m.strides[S]===0)throw Error(`strides[${S}] must be non-zero`);let w=!!(m.shrinkAxisMask&1<<S),E=r[S];if(E===-1){h.push(w?1:-1);continue}let $=[m.beginMask&1<<S,m.endMask&1<<S],D=[m.strides[S]>0?0:-1,m.strides[S]>0?E:E-1];if(w&&m.strides[S]<=0)throw Error("only stride 1 allowed on non-range indexing.");g=g&&m.strides[S]===1;let F=!!(m.beginMask&1<<S&&m.endMask&1<<S);if(m.beginValid&&m.endValid){if(w){let B=m.begin[S]<0?E+m.begin[S]:m.begin[S];if(m.begin[S]=B,m.end[S]=m.begin[S]+1,B<0||B>=E)throw Error(`slice index ${m.begin[S]} of dimension ${S} out of bounds.`)}else m.begin[S]=aS(m.begin[S],0,m.strides[S],E,$,D),m.end[S]=aS(m.end[S],1,m.strides[S],E,$,D);let M=m.strides[S]===1&&m.begin[S]===0&&m.end[S]===E;f=f&&M,d=d&&(S===0&&m.strides[S]===1||M)}else f=f&&m.strides[S]===1&&F,d=d&&(S===0&&m.strides[S]===1||F);let P,L=!1;if(m.beginValid&&m.endValid?(P=m.end[S]-m.begin[S],L=!0):w?(P=1,L=!0):F&&E>=0&&(m.strides[S]<0?P=-E:P=E,L=!0),L){let M;P===0||P<0!=m.strides[S]<0?M=0:M=Math.trunc(P/m.strides[S])+(P%m.strides[S]!==0?1:0),h.push(M)}else h.push(-1)}for(let S=0;S<m.finalShapeGatherIndices.length;++S){let w=m.finalShapeGatherIndices[S];w>=0?x.push(h[w]):w===Yg&&x.push(1)}return{finalShapeSparse:x.filter((S,w)=>m.finalShapeGatherIndices[w]!==Yg),finalShape:x,isIdentity:f,sliceDim0:d,isSimpleSlice:g,begin:m.begin,end:m.end,strides:m.strides}}function k3(r,t){t.beginMask=0,t.endMask=0,t.shrinkAxisMask=0;let e=0;t.beginValid=r.begin!=null,t.endValid=r.end!=null,t.begin=new Array(t.dims),t.end=new Array(t.dims),t.strides=new Array(t.dims),t.finalShapeGatherIndices=[],t.finalShapeGatherIndicesSparse=[],t.inputShapeGatherIndicesSparse=new Array(t.dims);for(let o=0;o<r.dims;o++)if(1<<o&r.ellipsisMask){let n=Math.min(t.dims-(r.dims-o)+1+r.numAddAxisAfterEllipsis,t.dims);for(;e<n;e++)t.begin[e]=0,t.end[e]=0,t.strides[e]=1,t.beginMask|=1<<e,t.endMask|=1<<e,t.finalShapeGatherIndices.push(e),t.finalShapeGatherIndicesSparse.push(-1),t.inputShapeGatherIndicesSparse[e]=o}else if(1<<o&r.newAxisMask)t.finalShapeGatherIndices.push(Yg),t.finalShapeGatherIndicesSparse.push(-1);else{if(e===t.begin.length)throw Error(`Index out of range using input dim ${e}; input has only ${t.dims} dims, ${t.begin.length}.`);r.begin!=null&&(t.begin[e]=r.begin[o]),r.end!=null&&(t.end[e]=r.end[o]),t.strides[e]=r.strides[o],r.beginMask&1<<o&&(t.beginMask|=1<<e),r.endMask&1<<o&&(t.endMask|=1<<e),r.shrinkAxisMask&1<<o?(t.finalShapeGatherIndices.push(b3),t.finalShapeGatherIndicesSparse.push(-1),t.shrinkAxisMask|=1<<e):(t.finalShapeGatherIndices.push(e),t.finalShapeGatherIndicesSparse.push(o)),t.inputShapeGatherIndicesSparse[e]=o,e++}}function aS(r,t,e,o,n,s){if(n[t])return e>0?s[t]:s[t+1&1];{let a=r<0?o+r:r;return a<s[0]?s[0]:a>s[1]?s[1]:a}}var Qg={};At(Qg,{Serializable:()=>Ll,SerializationMap:()=>im,registerClass:()=>Ye});var Ll=class{getClassName(){return this.constructor.className}static fromConfig(t,e){return new t(e)}},im=class r{constructor(){this.classNameMap={}}static getMap(){return r.instance==null&&(r.instance=new r),r.instance}static register(t){r.getMap().classNameMap[t.className]=[t,t.fromConfig]}};function Ye(r){k(r.className!=null,()=>"Class being registered does not have the static className property defined."),k(typeof r.className=="string",()=>"className is required to be a string, but got type "+typeof r.className),k(r.className.length>0,()=>"Class being registered has an empty-string as its className, which is disallowed."),im.register(r)}var hS="3.21.0";var Pe=class extends Ll{minimize(t,e=!1,o){let{value:n,grads:s}=this.computeGradients(t,o);if(o!=null){let a=o.map(i=>({name:i.name,tensor:s[i.name]}));this.applyGradients(a)}else this.applyGradients(s);return ie(s),e?n:(n.dispose(),null)}get iterations(){return this.iterations_==null&&(this.iterations_=0),this.iterations_}incrementIterations(){this.iterations_=this.iterations+1}computeGradients(t,e){return ku(t,e)}dispose(){this.iterations_!=null&&ie(this.iterations_)}async saveIterations(){return this.iterations_==null&&(this.iterations_=0),{name:"iter",tensor:J(this.iterations_,"int32")}}async getWeights(){throw new Error("getWeights() is not implemented for this optimizer yet.")}async setWeights(t){throw new Error(`setWeights() is not implemented for this optimizer class ${this.getClassName()}`)}async extractIterations(t){return this.iterations_=(await t[0].tensor.data())[0],t.slice(1)}};Object.defineProperty(Pe,Symbol.hasInstance,{value:r=>r.minimize!=null&&r.computeGradients!=null&&r.applyGradients!=null});var ra=class extends Pe{constructor(t,e,o=null){super(),this.learningRate=t,this.rho=e,this.epsilon=o,this.accumulatedGrads=[],this.accumulatedUpdates=[],o==null&&(this.epsilon=v.backend.epsilon())}applyGradients(t){(Array.isArray(t)?t.map(o=>o.name):Object.keys(t)).forEach((o,n)=>{let s=v.registeredVariables[o],a=!1;this.accumulatedGrads[n]==null&&(this.accumulatedGrads[n]={originalName:`${o}/accum_grad`,variable:St(()=>mt(s).variable(a))}),this.accumulatedUpdates[n]==null&&(this.accumulatedUpdates[n]={originalName:`${o}/accum_var`,variable:St(()=>mt(s).variable(a))});let i=Array.isArray(t)?t[n].tensor:t[o];if(i==null)return;let p=this.accumulatedGrads[n].variable,c=this.accumulatedUpdates[n].variable;St(()=>{let l=tt(O(p,this.rho),O(Ct(i),1-this.rho)),u=O(st(Ut(tt(c,this.epsilon)),Ut(tt(p,this.epsilon))),i),m=tt(O(c,this.rho),O(Ct(u),1-this.rho));p.assign(l),c.assign(m);let f=tt(O(u,-this.learningRate),s);s.assign(f)})}),this.incrementIterations()}dispose(){this.accumulatedUpdates!=null&&(ie(this.accumulatedGrads.map(t=>t.variable)),ie(this.accumulatedUpdates.map(t=>t.variable)))}async getWeights(){let t=[...this.accumulatedGrads,...this.accumulatedUpdates];return[await this.saveIterations()].concat(t.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(t){t=await this.extractIterations(t);let e=t.length/2,o=!1;this.accumulatedGrads=t.slice(0,e).map(n=>({originalName:n.name,variable:n.tensor.variable(o)})),this.accumulatedUpdates=t.slice(e,e*2).map(n=>({originalName:n.name,variable:n.tensor.variable(o)}))}getConfig(){return{learningRate:this.learningRate,rho:this.rho,epsilon:this.epsilon}}static fromConfig(t,e){return new t(e.learningRate,e.rho,e.epsilon)}};ra.className="Adadelta";Ye(ra);var oa=class extends Pe{constructor(t,e=.1){super(),this.learningRate=t,this.initialAccumulatorValue=e,this.accumulatedGrads=[]}applyGradients(t){(Array.isArray(t)?t.map(o=>o.name):Object.keys(t)).forEach((o,n)=>{let s=v.registeredVariables[o];this.accumulatedGrads[n]==null&&(this.accumulatedGrads[n]={originalName:`${o}/accumulator`,variable:St(()=>jr(s.shape,this.initialAccumulatorValue).variable(!1))});let a=Array.isArray(t)?t[n].tensor:t[o];if(a==null)return;let i=this.accumulatedGrads[n].variable;St(()=>{let p=tt(i,Ct(a));i.assign(p);let c=tt(O(st(a,Ut(tt(p,v.backend.epsilon()))),-this.learningRate),s);s.assign(c)})}),this.incrementIterations()}dispose(){this.accumulatedGrads!=null&&ie(this.accumulatedGrads.map(t=>t.variable))}async getWeights(){return[await this.saveIterations()].concat(this.accumulatedGrads.map(t=>({name:t.originalName,tensor:t.variable})))}async setWeights(t){t=await this.extractIterations(t);let e=!1;this.accumulatedGrads=t.map(o=>({originalName:o.name,variable:o.tensor.variable(e)}))}getConfig(){return{learningRate:this.learningRate,initialAccumulatorValue:this.initialAccumulatorValue}}static fromConfig(t,e){return new t(e.learningRate,e.initialAccumulatorValue)}};oa.className="Adagrad";Ye(oa);var na=class extends Pe{constructor(t,e,o,n=null){super(),this.learningRate=t,this.beta1=e,this.beta2=o,this.epsilon=n,this.accumulatedFirstMoment=[],this.accumulatedSecondMoment=[],St(()=>{this.accBeta1=J(e).variable(),this.accBeta2=J(o).variable()}),n==null&&(this.epsilon=v.backend.epsilon())}applyGradients(t){let e=Array.isArray(t)?t.map(o=>o.name):Object.keys(t);St(()=>{let o=rt(1,this.accBeta1),n=rt(1,this.accBeta2);e.forEach((s,a)=>{let i=v.registeredVariables[s],p=!1;this.accumulatedFirstMoment[a]==null&&(this.accumulatedFirstMoment[a]={originalName:`${s}/m`,variable:St(()=>mt(i).variable(p))}),this.accumulatedSecondMoment[a]==null&&(this.accumulatedSecondMoment[a]={originalName:`${s}/v`,variable:St(()=>mt(i).variable(p))});let c=Array.isArray(t)?t[a].tensor:t[s];if(c==null)return;let l=this.accumulatedFirstMoment[a].variable,u=this.accumulatedSecondMoment[a].variable,m=tt(O(l,this.beta1),O(c,1-this.beta1)),f=tt(O(u,this.beta2),O(Ct(c),1-this.beta2)),d=st(m,o),g=st(f,n);l.assign(m),u.assign(f);let h=tt(O(st(d,tt(Ut(g),this.epsilon)),-this.learningRate),i);i.assign(h)}),this.accBeta1.assign(O(this.accBeta1,this.beta1)),this.accBeta2.assign(O(this.accBeta2,this.beta2))}),this.incrementIterations()}dispose(){this.accBeta1.dispose(),this.accBeta2.dispose(),this.accumulatedFirstMoment!=null&&ie(this.accumulatedFirstMoment.map(t=>t.variable)),this.accumulatedSecondMoment!=null&&ie(this.accumulatedSecondMoment.map(t=>t.variable))}async getWeights(){let t=[...this.accumulatedFirstMoment,...this.accumulatedSecondMoment];return[await this.saveIterations()].concat(t.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(t){t=await this.extractIterations(t),St(()=>{this.accBeta1.assign(Ge(this.beta1,this.iterations_+1)),this.accBeta2.assign(Ge(this.beta2,this.iterations_+1))});let e=t.length/2,o=!1;this.accumulatedFirstMoment=t.slice(0,e).map(n=>({originalName:n.name,variable:n.tensor.variable(o)})),this.accumulatedSecondMoment=t.slice(e,e*2).map(n=>({originalName:n.name,variable:n.tensor.variable(o)}))}getConfig(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon}}static fromConfig(t,e){return new t(e.learningRate,e.beta1,e.beta2,e.epsilon)}};na.className="Adam";Ye(na);var sa=class extends Pe{constructor(t,e,o,n=null,s=0){super(),this.learningRate=t,this.beta1=e,this.beta2=o,this.epsilon=n,this.decay=s,this.accumulatedFirstMoment=[],this.accumulatedWeightedInfNorm=[],St(()=>{this.iteration=J(0).variable(),this.accBeta1=J(e).variable()}),n==null&&(this.epsilon=v.backend.epsilon())}applyGradients(t){let e=Array.isArray(t)?t.map(o=>o.name):Object.keys(t);St(()=>{let o=rt(1,this.accBeta1),n=st(-this.learningRate,tt(O(this.iteration,this.decay),1));e.forEach((s,a)=>{let i=v.registeredVariables[s],p=!1;this.accumulatedFirstMoment[a]==null&&(this.accumulatedFirstMoment[a]={originalName:`${s}/m`,variable:mt(i).variable(p)}),this.accumulatedWeightedInfNorm[a]==null&&(this.accumulatedWeightedInfNorm[a]={originalName:`${s}/v`,variable:mt(i).variable(p)});let c=Array.isArray(t)?t[a].tensor:t[s];if(c==null)return;let l=this.accumulatedFirstMoment[a].variable,u=this.accumulatedWeightedInfNorm[a].variable,m=tt(O(l,this.beta1),O(c,1-this.beta1)),f=O(u,this.beta2),d=le(c),g=is(f,d);l.assign(m),u.assign(g);let h=tt(O(st(n,o),st(m,tt(g,this.epsilon))),i);i.assign(h)}),this.iteration.assign(tt(this.iteration,1)),this.accBeta1.assign(O(this.accBeta1,this.beta1))}),this.incrementIterations()}dispose(){this.accBeta1.dispose(),this.iteration.dispose(),this.accumulatedFirstMoment!=null&&ie(this.accumulatedFirstMoment.map(t=>t.variable)),this.accumulatedWeightedInfNorm!=null&&ie(this.accumulatedWeightedInfNorm.map(t=>t.variable))}async getWeights(){throw new Error("getWeights() is not implemented for Adamax yet.")}async setWeights(t){throw new Error("setWeights() is not implemented for Adamax yet.")}getConfig(){return{learningRate:this.learningRate,beta1:this.beta1,beta2:this.beta2,epsilon:this.epsilon,decay:this.decay}}static fromConfig(t,e){return new t(e.learningRate,e.beta1,e.beta2,e.epsilon,e.decay)}};sa.className="Adamax";Ye(sa);var Jo=class extends Pe{constructor(t){super(),this.learningRate=t,this.setLearningRate(t)}applyGradients(t){(Array.isArray(t)?t.map(o=>o.name):Object.keys(t)).forEach((o,n)=>{let s=Array.isArray(t)?t[n].tensor:t[o];if(s==null)return;let a=v.registeredVariables[o];St(()=>{let i=tt(O(this.c,s),a);a.assign(i)})}),this.incrementIterations()}setLearningRate(t){this.learningRate=t,this.c!=null&&this.c.dispose(),this.c=nr(J(-t))}dispose(){this.c.dispose()}async getWeights(){return[await this.saveIterations()]}async setWeights(t){if(t=await this.extractIterations(t),t.length!==0)throw new Error("SGD optimizer does not have settable weights.")}getConfig(){return{learningRate:this.learningRate}}static fromConfig(t,e){return new t(e.learningRate)}};Jo.className="SGD";Ye(Jo);var aa=class extends Jo{constructor(t,e,o=!1){super(t),this.learningRate=t,this.momentum=e,this.useNesterov=o,this.accumulations=[],this.m=J(this.momentum)}applyGradients(t){(Array.isArray(t)?t.map(o=>o.name):Object.keys(t)).forEach((o,n)=>{let s=v.registeredVariables[o];this.accumulations[n]==null&&(this.accumulations[n]={originalName:`${o}/momentum`,variable:St(()=>mt(s).variable(!1))});let a=this.accumulations[n].variable,i=Array.isArray(t)?t[n].tensor:t[o];i!=null&&St(()=>{let p,c=tt(O(this.m,a),i);this.useNesterov?p=tt(O(this.c,tt(i,O(c,this.m))),s):p=tt(O(this.c,c),s),a.assign(c),s.assign(p)})}),this.incrementIterations()}dispose(){this.m.dispose(),this.accumulations!=null&&ie(this.accumulations.map(t=>t.variable))}setMomentum(t){this.momentum=t}async getWeights(){return[await this.saveIterations()].concat(this.accumulations.map(t=>({name:t.originalName,tensor:t.variable})))}async setWeights(t){t=await this.extractIterations(t);let e=!1;this.accumulations=t.map(o=>({originalName:o.name,variable:o.tensor.variable(e)}))}getConfig(){return{learningRate:this.learningRate,momentum:this.momentum,useNesterov:this.useNesterov}}static fromConfig(t,e){return new t(e.learningRate,e.momentum,e.useNesterov)}};aa.className="Momentum";Ye(aa);var ia=class extends Pe{constructor(t,e=.9,o=0,n=null,s=!1){if(super(),this.learningRate=t,this.decay=e,this.momentum=o,this.epsilon=n,this.accumulatedMeanSquares=[],this.accumulatedMoments=[],this.accumulatedMeanGrads=[],this.centered=s,n==null&&(this.epsilon=v.backend.epsilon()),t==null)throw new Error("learningRate for RMSPropOptimizer must be defined.")}applyGradients(t){(Array.isArray(t)?t.map(o=>o.name):Object.keys(t)).forEach((o,n)=>{let s=v.registeredVariables[o],a=!1;this.accumulatedMeanSquares[n]==null&&(this.accumulatedMeanSquares[n]={originalName:`${o}/rms`,variable:St(()=>mt(s).variable(a))}),this.accumulatedMoments[n]==null&&(this.accumulatedMoments[n]={originalName:`${o}/momentum`,variable:St(()=>mt(s).variable(a))}),this.accumulatedMeanGrads[n]==null&&this.centered&&(this.accumulatedMeanGrads[n]={originalName:`${o}/mg`,variable:St(()=>mt(s).variable(a))});let i=Array.isArray(t)?t[n].tensor:t[o];if(i==null)return;let p=this.accumulatedMeanSquares[n].variable,c=this.accumulatedMoments[n].variable;St(()=>{let l=tt(O(p,this.decay),O(Ct(i),1-this.decay));if(this.centered){let u=this.accumulatedMeanGrads[n].variable,m=tt(O(u,this.decay),O(i,1-this.decay)),f=st(O(i,this.learningRate),Ut(rt(l,tt(Ct(m),this.epsilon)))),d=tt(O(c,this.momentum),f);p.assign(l),u.assign(m),c.assign(d);let g=rt(s,d);s.assign(g)}else{let u=tt(O(p,this.decay),O(Ct(i),1-this.decay)),m=tt(O(c,this.momentum),st(O(i,this.learningRate),Ut(tt(u,this.epsilon))));p.assign(u),c.assign(m);let f=rt(s,m);s.assign(f)}})}),this.incrementIterations()}dispose(){this.accumulatedMeanSquares!=null&&ie(this.accumulatedMeanSquares.map(t=>t.variable)),this.accumulatedMeanGrads!=null&&this.centered&&ie(this.accumulatedMeanGrads.map(t=>t.variable)),this.accumulatedMoments!=null&&ie(this.accumulatedMoments.map(t=>t.variable))}async getWeights(){let t=[...this.accumulatedMeanSquares,...this.accumulatedMoments];return this.centered&&t.push(...this.accumulatedMeanGrads),[await this.saveIterations()].concat(t.map(e=>({name:e.originalName,tensor:e.variable})))}async setWeights(t){t=await this.extractIterations(t);let e=this.centered?t.length/3:t.length/2,o=!1;this.accumulatedMeanSquares=t.slice(0,e).map(n=>({originalName:n.name,variable:n.tensor.variable(o)})),this.accumulatedMoments=t.slice(e,e*2).map(n=>({originalName:n.name,variable:n.tensor.variable(o)})),this.centered&&(this.accumulatedMeanGrads=t.slice(e*2,e*3).map(n=>({originalName:n.name,variable:n.tensor.variable(o)})))}getConfig(){return{learningRate:this.learningRate,decay:this.decay,momentum:this.momentum,epsilon:this.epsilon,centered:this.centered}}static fromConfig(t,e){return new t(e.learningRate,e.decay,e.momentum,e.epsilon,e.centered)}};ia.className="RMSProp";Ye(ia);var $r=class{static sgd(t){return new Jo(t)}static momentum(t,e,o=!1){return new aa(t,e,o)}static rmsprop(t,e=.9,o=0,n=null,s=!1){return new ia(t,e,o,n,s)}static adam(t=.001,e=.9,o=.999,n=null){return new na(t,e,o,n)}static adadelta(t=.001,e=.95,o=null){return new ra(t,e,o)}static adamax(t=.002,e=.9,o=.999,n=null,s=0){return new sa(t,e,o,n,s)}static adagrad(t,e=.1){return new oa(t,e)}};var E3={sgd:$r.sgd,momentum:$r.momentum,adadelta:$r.adadelta,adagrad:$r.adagrad,rmsprop:$r.rmsprop,adamax:$r.adamax,adam:$r.adam};var $3=typeof requestAnimationFrame!="undefined"?requestAnimationFrame:typeof setImmediate!="undefined"?setImmediate:r=>r();function pm(){return new Promise(r=>$3(()=>r()))}var I={};At(I,{ERF_A1:()=>U3,ERF_A2:()=>H3,ERF_A3:()=>q3,ERF_A4:()=>K3,ERF_A5:()=>X3,ERF_P:()=>W3,PARALLELIZE_THRESHOLD:()=>cm,RowPartitionType:()=>tn,SELU_SCALE:()=>tx,SELU_SCALEALPHA:()=>Jg,applyActivation:()=>ep,assertAndGetBroadcastShape:()=>bt,assertAxesAreInnerMostDims:()=>XR,assertParamsConsistent:()=>A3,assignToTypedArray:()=>tL,axesAreInnerMostDims:()=>Oh,calculateShapes:()=>h0,checkEinsumDimSizes:()=>aL,checkPadOnDimRoundingMode:()=>Gt,combineLocations:()=>zb,combineRaggedTensorToTensorShapes:()=>R3,complexWithEvenIndex:()=>Z3,complexWithOddIndex:()=>Q3,computeConv2DInfo:()=>ki,computeConv3DInfo:()=>Mb,computeDefaultPad:()=>Ch,computeDilation2DInfo:()=>UD,computeOptimalWindowSize:()=>P3,computeOutAndReduceShapes:()=>Ph,computeOutShape:()=>D3,computePool2DInfo:()=>bh,computePool3DInfo:()=>HD,convertConv2DDataFormat:()=>Bb,decodeEinsumEquation:()=>nL,eitherStridesOrDilationsAreOne:()=>Ce,expandShapeToKeepDim:()=>kr,exponent:()=>rL,exponents:()=>eL,fromStringArrayToUint8:()=>kL,fromUint8ToStringArray:()=>IL,getAxesPermutation:()=>Lh,getBroadcastDims:()=>Vb,getComplexWithIndex:()=>J3,getEinsumComputePath:()=>iL,getEinsumPermutation:()=>sL,getFusedBiasGradient:()=>tp,getFusedDyActivation:()=>Ji,getImageCenter:()=>L3,getInnerMostAxes:()=>jR,getPermuted:()=>B3,getRaggedRank:()=>_3,getReductionAxes:()=>Mt,getReshaped:()=>M3,getReshapedPermuted:()=>G3,getRowPartitionTypesHelper:()=>F3,getSliceBeginCoords:()=>V3,getSliceSize:()=>z3,getSparseFillEmptyRowsIndicesDenseShapeMismatch:()=>uL,getSparseFillEmptyRowsNegativeIndexErrorMessage:()=>mL,getSparseFillEmptyRowsOutOfRangeIndexErrorMessage:()=>fL,getSparseReshapeEmptyTensorZeroOutputDimErrorMessage:()=>gL,getSparseReshapeInputOutputMismatchErrorMessage:()=>yL,getSparseReshapeInputOutputMultipleErrorMessage:()=>xL,getSparseReshapeMultipleNegativeOneOutputDimErrorMessage:()=>dL,getSparseReshapeNegativeOutputDimErrorMessage:()=>hL,getSparseSegmentReductionIndicesOutOfRangeErrorMessage:()=>SL,getSparseSegmentReductionNegativeSegmentIdsErrorMessage:()=>bL,getSparseSegmentReductionNonIncreasingSegmentIdsErrorMessage:()=>CL,getSparseSegmentReductionSegmentIdOutOfRangeErrorMessage:()=>TL,getUndoAxesPermutation:()=>ol,isIdentityPermutation:()=>pL,log:()=>pD,mergeRealAndImagArrays:()=>j3,prepareAndValidate:()=>sS,prepareSplitSize:()=>lL,segment_util:()=>rx,shouldFuse:()=>rp,slice_util:()=>de,splitRealAndImagArrays:()=>Y3,tupleValuesAreOne:()=>mr,upcastType:()=>ne,validateDefaultValueShape:()=>O3,validateInput:()=>Ou,validateUpdateShape:()=>$g,warn:()=>Uo});function A3(r,t){let e=r[0].length;r.forEach((n,s)=>{k(n.length===e,()=>`Error in concat${e}D: rank of tensors[${s}] must be the same as the rank of the rest (${e})`)}),k(t>=0&&t<e,()=>`Error in concat${e}D: axis must be between 0 and ${e-1}.`);let o=r[0];r.forEach((n,s)=>{for(let a=0;a<e;a++)k(a===t||n[a]===o[a],()=>`Error in concat${e}D: Shape of tensors[${s}] (${n}) does not match the shape of the rest (${o}) along the non-concatenated axis ${s}.`)})}function D3(r,t){let e=r[0].slice();for(let o=1;o<r.length;o++)e[t]+=r[o][t];return e}var tn;(function(r){r[r.FIRST_DIM_SIZE=0]="FIRST_DIM_SIZE",r[r.VALUE_ROWIDS=1]="VALUE_ROWIDS",r[r.ROW_LENGTHS=2]="ROW_LENGTHS",r[r.ROW_SPLITS=3]="ROW_SPLITS",r[r.ROW_LIMITS=4]="ROW_LIMITS",r[r.ROW_STARTS=5]="ROW_STARTS"})(tn||(tn={}));function R3(r,t,e){let o=new Array;if(e==null&&t==null)return o;if(t==null)for(;o.length<r+e.length;)o.push(-1);else o=t.slice();if(e==null)return o;if(r+e.length!==o.length)throw new Error(`rt input.shape and shape=${t} are incompatible: rt input.rank = ${r+e.length}, but shape.rank = ${o.length}`);for(let n=1;n<e.length;++n){let s=e[n],a=o[o.length-e.length+n],i=o[a];if(s>=0)if(i>=0){if(i!==s)throw new Error(`rt input.shape and shape=${t} are incompatible: rt input.shape[${n+r}] = ${s} but shape[${n+r}] = ${i}`)}else o[a]=s}return o}function F3(r){let t={FIRST_DIM_SIZE:tn.FIRST_DIM_SIZE,VALUE_ROWIDS:tn.VALUE_ROWIDS,ROW_LENGTHS:tn.ROW_LENGTHS,ROW_SPLITS:tn.ROW_SPLITS,ROW_LIMITS:tn.ROW_LIMITS,ROW_STARTS:tn.ROW_STARTS},e=[];for(let o of r)if(o in t)e.push(t[o]);else break;return e}function _3(r){return r.length===0?0:r[0]===tn.FIRST_DIM_SIZE?r.length-1:r.length}function O3(r,t){if(r==null||t==null)return;let e=r.length,o=t.length;if(e>=o)throw new Error(`defaultValue.shape=${r} and ragged tensor flatValues.shape=${t}, are incompatible: defaultValue.rank = ${e} must be less than ragged tensor input flatValues.rank = ${o})`);for(let n=0;n<Math.min(e,o-1);++n){let s=r[n],a=t[n+1];if(s>=0&&a>=0&&s!==1&&s!==a)throw new Error(`defaultValue.shape=${r}, and ragged tensor input flatValues.shape=${t} are incompatible: defaultValue.shape[${n-r.length}] = ${s} but ragged tensor input.flatValues.shape[${n-r.length}] = ${a}`)}}var cm=30;function P3(r){return r<=cm?r:Tp(r,Math.floor(Math.sqrt(r)))}function L3(r,t,e){let o=e*(typeof r=="number"?r:r[0]),n=t*(typeof r=="number"?r:r[1]);return[o,n]}function M3(r,t,e,o=!0){let n=[];if(o)n=n.concat(t.slice(0)),n.push(r[0]/e),n=n.concat(r.slice(1));else{n=n.concat(r[0]);let s=t.length;for(let a=0;a<s;++a)n=n.concat([r[a+1]/t[a],t[a]]);n=n.concat(r.slice(s+1))}return n}function B3(r,t,e=!0){let o=[];if(e){o.push(t);for(let n=t+1;n<r;++n)n<=2*t?(o.push(n),o.push(n-(t+1))):o.push(n)}else{let n=[],s=[];for(let a=1;a<r;++a)a>=t*2+1||a%2===1?s.push(a):n.push(a);o.push(...n),o.push(0),o.push(...s)}return o}function G3(r,t,e,o=!0){let n=[];o?n.push(r[0]/e):n.push(r[0]*e);for(let s=1;s<r.length;++s)s<=t.length?o?n.push(t[s-1]*r[s]):n.push(r[s]/t[s-1]):n.push(r[s]);return n}function V3(r,t){let e=[0];for(let o=0;o<t;++o)e.push(r[o][0]);return e}function z3(r,t,e){let o=r.slice(0,1);for(let n=0;n<e;++n)o.push(r[n+1]-t[n][0]-t[n][1]);return o}var Jg=1.7580993408473768,tx=1.0507009873554805;var W3=.3275911,U3=.254829592,H3=-.284496736,q3=1.421413741,K3=-1.453152027,X3=1.061405429;function j3(r,t){if(r.length!==t.length)throw new Error(`Cannot merge real and imag arrays of different lengths. real:${r.length}, imag: ${t.length}.`);let e=new Float32Array(r.length*2);for(let o=0;o<e.length;o+=2)e[o]=r[o/2],e[o+1]=t[o/2];return e}function Y3(r){let t=new Float32Array(r.length/2),e=new Float32Array(r.length/2);for(let o=0;o<r.length;o+=2)t[o/2]=r[o],e[o/2]=r[o+1];return{real:t,imag:e}}function Z3(r){let t=Math.ceil(r.length/4),e=new Float32Array(t),o=new Float32Array(t);for(let n=0;n<r.length;n+=4)e[Math.floor(n/4)]=r[n],o[Math.floor(n/4)]=r[n+1];return{real:e,imag:o}}function Q3(r){let t=Math.floor(r.length/4),e=new Float32Array(t),o=new Float32Array(t);for(let n=2;n<r.length;n+=4)e[Math.floor(n/4)]=r[n],o[Math.floor(n/4)]=r[n+1];return{real:e,imag:o}}function J3(r,t){let e=r[t*2],o=r[t*2+1];return{real:e,imag:o}}function tL(r,t,e,o){r[o*2]=t,r[o*2+1]=e}function eL(r,t){let e=new Float32Array(r/2),o=new Float32Array(r/2);for(let n=0;n<Math.ceil(r/2);n++){let s=(t?2:-2)*Math.PI*(n/r);e[n]=Math.cos(s),o[n]=Math.sin(s)}return{real:e,imag:o}}function rL(r,t,e){let o=(e?2:-2)*Math.PI*(r/t),n=Math.cos(o),s=Math.sin(o);return{real:n,imag:s}}var ex="->",oL=/->/g,gS=",",xS="...";function nL(r,t){r=r.replace(/\s/g,"");let e=(r.length-r.replace(oL,"").length)/ex.length;if(e<1)throw new Error("Equations without an arrow are not supported.");if(e>1)throw new Error(`Equation must contain exactly one arrow ("${ex}").`);let[o,n]=r.split(ex);k(o.indexOf(xS)===-1,()=>`The ellipsis notation ("${xS}") is not supported yet.`);let s=o.split(gS),a=s.length;if(t!==a)throw new Error(`Expected ${a} input tensors, received ${t}`);if(a>2)throw new Error("Support for more than 2 input tensors is not implemented yet.");let i=[];for(let m=0;m<n.length;++m){let f=n[m];if(!s.some(d=>d.indexOf(f)!==-1))throw new Error(`Output subscripts contain the label ${f} not present in the input subscripts.`);i.indexOf(f)===-1&&i.push(f)}for(let m=0;m<o.length;++m){let f=o[m];i.indexOf(f)===-1&&f!==gS&&i.push(f)}let p=new Array(s.length);for(let m=0;m<a;++m){if(new Set(s[m].split("")).size!==s[m].length)throw new Error(`Found duplicate axes in input component ${s[m]}. Support for duplicate axes in input is not implemented yet.`);p[m]=[];for(let f=0;f<s[m].length;++f)p[m].push(i.indexOf(s[m][f]))}let c=i.length,l=n.length,u=[];for(let m=l;m<c;++m)u.push(m);return{allDims:i,summedDims:u,idDims:p}}function sL(r,t){let e=new Array(r);e.fill(-1);for(let n=0;n<t.length;++n)e[t[n]]=n;let o=[];for(let n=0;n<r;++n)e[n]===-1&&o.push(n);return e=e.filter(n=>n!==-1),{permutationIndices:e,expandDims:o}}function aL(r,t,e){let o=new Array(r);for(let n=0;n<e.length;++n){let s=e[n].shape;for(let a=0;a<t[n].length;++a)o[t[n][a]]===void 0?o[t[n][a]]=s[a]:k(o[t[n][a]]===s[a],()=>`Expected dimension ${o[t[n][a]]} at axis ${a} of input shaped ${JSON.stringify(s)}, but got dimension ${s[a]}`)}}function iL(r,t){let e=r,o=[],n=0;r.length===0&&e.push(-1),n=r.length+1;for(let a=0;a<n;++a)o.push([]);let s=[];for(let a=0;a<e.length;++a){let i=e[a],p=cL(t,i);for(let c of p)s.indexOf(c)===-1&&(o[a].push(c),s.push(c))}return{path:e,steps:o}}function pL(r){return r.every((t,e)=>t===e)}function cL(r,t){let e=[];for(let o=0;o<r.length;++o)(r[o].length===0||r[o].indexOf(t)!==-1||t===-1)&&e.push(o);return e}function lL(r,t,e=0){let o=[];if(typeof t=="number")k(r.shape[e]%t===0,()=>"Number of splits must evenly divide the axis."),o=new Array(t).fill(r.shape[e]/t);else{let n=t.reduce((a,i)=>(i===-1&&(a+=1),a),0);k(n<=1,()=>"There should be only one negative value in split array.");let s=t.indexOf(-1);if(s!==-1){let a=t.reduce((i,p)=>p>0?i+p:i);t[s]=r.shape[e]-a}k(r.shape[e]===t.reduce((a,i)=>a+i),()=>"The sum of sizes must match the size of the axis dimension."),o=t}return o}function uL(r){return`Received SparseTensor with denseShape[0] = 0 but
  indices.shape[0] = ${r}`}function mL(r,t){return`indices(${r}, 0) is invalid: ${t} < 0`}function fL(r,t,e){return`indices(${r}, 0) is invalid: ${t} >= ${e}`}function dL(r,t){return`only one output dimension may be -1, not both ${r} and ${t}`}function hL(r,t){return`size ${r} must be non-negative, not ${t}`}function gL(){return"reshape cannot infer the missing input size for an empty tensor unless all specified input sizes are non-zero"}function xL(r,t){let e=It(r),o=It(t);return`Input to reshape is a SparseTensor with ${e}
  dense values, but the requested shape requires a multiple of ${o}. inputShape=${r} outputShape= ${t}`}function yL(r,t){let e=It(r),o=It(t);return`Input to reshape is a tensor with ${e} dense values, but the requested shape has ${o}. inputShape=${r} outputShape=${t}`}function bL(){return"segment ids must be >= 0"}function CL(){return"segment ids are not increasing"}function TL(r,t){return`Segment id ${r} out of range [0, ${t}), possibly because segmentIds input is not sorted.`}function SL(r,t,e){return`Bad: indices[${r}] == ${t} out of range [0, ${e})`}var rx={};At(rx,{collectGatherOpShapeInfo:()=>vL,computeOutShape:()=>NL,segOpComputeOptimalWindowSize:()=>wL});function wL(r,t){let e=!1,o;for(r<=cm?(o=r,e=!0):o=Tp(r,Math.floor(Math.sqrt(r)));!e;)o>t||o===r?e=!0:o=Tp(r,o+1);return o}function NL(r,t,e){let o=[],n=r.length;for(let s=0;s<n;s++)s!==t?o.push(r[s]):o.push(e);return o}function vL(r,t,e,o){let n=t.shape.length,s=r.shape.length;if(o!==0&&(o<-n||o>n))throw new Error(`Expect batchDims in the range of [-${n}, ${n}], but got ${o}`);if(o<0&&(o+=n),o>s)throw new Error(`batchDims (${o}) must be less than rank(x) (
    ${s}).`);if(e<o)throw new Error(`batchDims (${o}) must be less than or equal to axis (${e}).`);for(let u=0;u<o;++u)if(r.shape[u]!==t.shape[u])throw new Error(`x.shape[${u}]: ${r.shape[u]} should be equal to indices.shape[${u}]: ${t.shape[u]}.`);let a=r.shape[e],i=[],p=1,c=1,l=1;for(let u=0;u<o;++u)i.push(r.shape[u]),p*=r.shape[u];for(let u=o;u<e;u++)i.push(r.shape[u]),c*=r.shape[u];for(let u=o;u<n;u++)i.push(t.shape[u]);for(let u=e+1;u<s;u++)i.push(r.shape[u]),l*=r.shape[u];return{batchSize:p,sliceSize:l,outerSize:c,dimSize:a,outputShape:i}}function IL(r){try{return r.map(t=>Pp(t))}catch(t){throw new Error(`Failed to decode encoded string bytes into utf-8, error: ${t}`)}}function kL(r){return r.map(t=>js(t))}var we={};At(we,{nonMaxSuppressionV3Impl:()=>Wu,nonMaxSuppressionV4Impl:()=>Uu,nonMaxSuppressionV5Impl:()=>Hu,whereImpl:()=>_u});function EL(r,t,e){let o=r.shape.slice();o[e]=1;let n=R(t,o),s=Qs(r,e,!0,!1),a=Qs(r,e,!0,!0),i=O(s,a);return O(n,i)}function $L(r,t,e){let o=r.shape.length,n=o-e.length,s=I.getAxesPermutation(e,o),a=r;s!=null&&(a=Se(r,s));let i=a.shape.slice(),c=i.splice(o-e.length,e.length).reduce((m,f)=>m*f,1);i.push(c);let l=a.reshape(i),u=EL(l,t,n);if(u=u.reshape(a.shape),s!=null){let m=I.getUndoAxesPermutation(s);u=Se(u,m)}return u}var yS={kernelName:Bn,inputsToSave:["x"],gradFunc:(r,t,e)=>{let[o]=t,{axis:n}=e,s=[];return n==null?s=o.shape.map((a,i)=>i):typeof n=="number"?s=[n]:s=n,{x:()=>$L(o,r,s)}}};var bS={kernelName:yo,inputsToSave:["a","b"],gradFunc:(r,t)=>{let[e,o]=t,n=bt(e.shape,o.shape);return{a:()=>{let i=st(r,X(o,"float32")),p=Mt(e.shape,n);return p.length>0?R(it(i,p),e.shape):i},b:()=>{let i=O(r,X(e,"float32")),p=Mt(o.shape,n);p.length>0&&(i=R(it(i,p),o.shape));let c=Ct(o);return $t(st(i,X(c,"float32")))}}}};var CS={kernelName:Ao,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>st(r,$t(Ct(e)))}}};var TS={kernelName:Ro,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t,o=O(Xe(e,6),yr(e));return{x:()=>O(r,X(o,"float32"))}}};var SS={kernelName:Do,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>O(r,X(yr(e),"float32"))}}};var wS={kernelName:Gn,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>R(r,e.shape)}}};var NS={kernelName:zn,inputsToSave:["images"],gradFunc:(r,t,e)=>{let[o]=t,n={dy:r,images:o};return{images:()=>v.runKernel(oi,n,e)}}};var vS={kernelName:Vn,inputsToSave:["images"],gradFunc:(r,t,e)=>{let[o]=t,n={dy:r,images:o};return{images:()=>v.runKernel(ri,n,e)}}};var IS={kernelName:Wn,gradFunc:(r,t,e)=>{let{dims:o}=e,n=ce(o,r.shape);return{x:()=>ke(r,n)}}};var kS={kernelName:Fo,gradFunc:r=>({x:()=>mt(r)})};var ES={kernelName:_o,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>$t(st(r,O(Ge(e,1.5),2)))}}};var $S={kernelName:Un,inputsToSave:["condition"],gradFunc:(r,t)=>{let[e]=t;return{condition:()=>X(mt(e),"float32"),t:()=>O(r,X(e,r.dtype)),e:()=>O(r,X(as(e),r.dtype))}}};var AS={kernelName:Oo,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>{let o=xe(e,J(0)),n=J(Jg),s=J(tx),a=O(r,s),i=O(O(r,n),ae(X(e,"float32")));return Xt(o,a,i)}}}};var DS={kernelName:Mo,outputsToSave:[!0],gradFunc:(r,t)=>{let[e]=t;return{x:()=>O(r,O(e,rt(J(1),e)))}}};var RS={kernelName:Lo,gradFunc:r=>({x:()=>mt(r)})};var FS={kernelName:"Sin",inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>O(ts(X(e,"float32")),r)}}};var _S={kernelName:Po,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>O($i(X(e,"float32")),r)}}};var OS={kernelName:Hn,inputsToSave:["x"],gradFunc:(r,t,e)=>{let[o]=t,{begin:n,size:s}=e,a=o.shape,[i,p]=Zg(o,n,s),c=[];for(let l=0;l<r.rank;l++)c.push([i[l],a[l]-i[l]-p[l]]);return{x:()=>je(r,c)}}};var PS={kernelName:Xn,outputsToSave:[!0],gradFunc:(r,t,e)=>{let[o]=t,{dim:n}=e,s=!0,a=O(r,o);return{logits:()=>rt(a,O(it(a,[n],s),o))}}};var LS={kernelName:Bo,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>O(r,qe(e))}}};var ox={kernelName:qn,gradFunc:(r,t,e)=>{let{blockShape:o,paddings:n}=e;return{x:()=>Jn(r,o,n)}}};var nx={kernelName:Kn,gradFunc:(r,t,e)=>{let{axis:o}=e;return{x:()=>Lt(r,o)}}};var MS={kernelName:Go,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>st(r,O(Ut(X(e,"float32")),2))}}};var BS={kernelName:mi,inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>O(r,O(X(e,"float32"),2))}}};var GS={kernelName:Vo,inputsToSave:["a","b"],gradFunc:(r,t)=>{let[e,o]=t,n=J(2);return{a:()=>O(r,O(n,rt(e,o))),b:()=>O(r,O(n,rt(o,e)))}}};var VS={kernelName:Wo,gradFunc:r=>({x:()=>mt(r)})};var zS={kernelName:"Sub",inputsToSave:["a","b"],gradFunc:(r,t)=>{let[e,o]=t,n=bt(e.shape,o.shape);return{a:()=>{let i=r,p=Mt(e.shape,n);return p.length>0&&(i=it(i,p)),R(i,e.shape)},b:()=>{let i=r,p=Mt(o.shape,n);return p.length>0&&(i=it(i,p)),R($t(i),o.shape)}}}};var WS={kernelName:"Sum",inputsToSave:["x"],gradFunc:(r,t,e)=>{let[o]=t,n=o.shape.slice(),{axis:s}=e;ce(s,o.shape).forEach(c=>{n[c]=1});let i=R(r,n),p=O(i,Oe(o.shape,"float32"));return{x:()=>p}}};var US={kernelName:"Tan",inputsToSave:["x"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>st(r,Ct(ts(e)))}}};var HS={kernelName:zo,outputsToSave:[!0],gradFunc:(r,t)=>{let[e]=t;return{x:()=>O(rt(J(1),Ct(e)),r)}}};var qS={kernelName:Wr,inputsToSave:["x"],gradFunc:(r,t,e)=>{let[o]=t,{reps:n}=e;return{x:()=>{let a=mt(o);if(o.rank===1)for(let i=0;i<n[0];++i)a=tt(a,xt(r,[i*o.shape[0]],[o.shape[0]]));else if(o.rank===2)for(let i=0;i<n[0];++i)for(let p=0;p<n[1];++p)a=tt(a,xt(r,[i*o.shape[0],p*o.shape[1]],[o.shape[0],o.shape[1]]));else if(o.rank===3)for(let i=0;i<n[0];++i)for(let p=0;p<n[1];++p)for(let c=0;c<n[2];++c)a=tt(a,xt(r,[i*o.shape[0],p*o.shape[1],c*o.shape[2]],[o.shape[0],o.shape[1],o.shape[2]]));else if(o.rank===4)for(let i=0;i<n[0];++i)for(let p=0;p<n[1];++p)for(let c=0;c<n[2];++c)for(let l=0;l<n[3];++l)a=tt(a,xt(r,[i*o.shape[0],p*o.shape[1],c*o.shape[2],l*o.shape[3]],[o.shape[0],o.shape[1],o.shape[2],o.shape[3]]));else throw new Error(`Gradient for tile operation is not implemented for rank-${o.rank} tensors yet.`);return a}}}};var KS={kernelName:Ur,gradFunc:(r,t,e)=>{let o=e,{perm:n}=o,s=ol(n);return{x:()=>Se(r,s)}}};var XS={kernelName:jn,gradFunc:(r,t,e)=>{let o=e,{axis:n}=o;return{value:()=>fe(r,n)}}};var jS={kernelName:Yn,inputsToSave:["segmentIds"],gradFunc:(r,t)=>{let[e]=t;return{x:()=>AL(r,e)}}};function AL(r,t){let e=is(t,mt(t)),o=ns(r,e),n=xr(t,J(0,"int32")),s=o.rank-n.rank;for(let i=0;i<s;++i)n=ze(n,i+1);n=rr(n,Oe(o.shape,"bool"));let a=mt(o);return Xt(n,o,a)}var YS={kernelName:Zn,gradFunc:r=>({x:()=>mt(r)})};var DL=[ju,fC,dC,hC,gC,xC,yC,bC,CC,TC,SC,wC,vC,kC,EC,$C,AC,DC,RC,FC,_C,OC,LC,PC,BC,GC,VC,zC,WC,UC,bS,HC,qC,KC,XC,jC,ZC,YC,QC,eT,rT,oT,nT,sT,aT,iT,pT,cT,lT,mT,Dg,Dg,fT,hT,xT,yT,bT,CT,TT,ST,wT,NT,vT,IT,kT,Rg,Rg,ET,$T,yS,CS,TS,SS,wS,NS,vS,IS,kS,ES,$S,AS,DS,RS,FS,_S,OS,PS,LS,ox,ox,nx,nx,MS,GS,BS,VS,zS,WS,US,HS,qS,KS,XS,jS,YS];for(let r of DL)eh(r);var sx=class{constructor(){this.messageName="setTimeoutCustom",this.functionRefs=[],this.handledMessageCount=0,this.hasEventListener=!1}fetch(t,e){return fetch(t,e)}now(){return performance.now()}encode(t,e){if(e!=="utf-8"&&e!=="utf8")throw new Error(`Browser's encoder only supports utf-8, but got ${e}`);return this.textEncoder==null&&(this.textEncoder=new TextEncoder),this.textEncoder.encode(t)}decode(t,e){return new TextDecoder(e).decode(t)}setTimeoutCustom(t,e){if(!window||!_().getBool("USE_SETTIMEOUTCUSTOM")){setTimeout(t,e);return}this.functionRefs.push(t),setTimeout(()=>{window.postMessage({name:this.messageName,index:this.functionRefs.length-1},"*")},e),this.hasEventListener||(this.hasEventListener=!0,window.addEventListener("message",o=>{if(o.source===window&&o.data.name===this.messageName){o.stopPropagation();let n=this.functionRefs[o.data.index];n(),this.handledMessageCount++,this.handledMessageCount===this.functionRefs.length&&(this.functionRefs=[],this.handledMessageCount=0)}},!0))}};if(_().get("IS_BROWSER")){_().setPlatform("browser",new sx);try{Qr.registerManager(Qo.URL_SCHEME,new rm)}catch{}try{Qr.registerManager(Zo.URL_SCHEME,new em)}catch{}}var RL={importFetch:()=>ZS()},ax;var ix=class{constructor(){this.util=QS(),this.textEncoder=new this.util.TextEncoder}fetch(t,e){return _().global.fetch!=null?_().global.fetch(t,e):(ax==null&&(ax=RL.importFetch()),ax(t,e))}now(){let t=process.hrtime();return t[0]*1e3+t[1]/1e6}encode(t,e){if(e!=="utf-8"&&e!=="utf8")throw new Error(`Node built-in encoder only supports utf-8, but got ${e}`);return this.textEncoder.encode(t)}decode(t,e){return t.length===0?"":new this.util.TextDecoder(e).decode(t)}};_().get("IS_NODE")&&!_().get("IS_BROWSER")&&_().setPlatform("node",new ix);gh();var FL={buffer:pt,cast:X,clone:He,print:yl};Fb(FL);function U(r,t){Array.isArray(r)||(r=[r]),r.forEach(e=>{e!=null&&y.assert(e.dtype!=="complex64",()=>`${t} does not support complex64 tensors in the CPU backend.`)})}var _L=we.whereImpl,Ml=class r extends oo{constructor(){super(),this.blockSize=48,this.firstUse=!0,this.data=new Is(this,Zr())}nextDataId(){return r.nextDataId++}write(t,e,o){this.firstUse&&(this.firstUse=!1,_().get("IS_NODE")&&I.warn(`
============================
Hi, looks like you are running TensorFlow.js in Node.js. To speed things up dramatically, install our node backend, visit https://github.com/tensorflow/tfjs-node for more details. 
============================`));let n={id:this.nextDataId()};return this.data.set(n,{values:t,dtype:o,refCount:1}),n}makeTensorInfo(t,e,o){let n;if(e==="string"&&o!=null&&o.length>0&&y.isString(o[0])){let s=o.map(a=>y.encodeString(a));n=this.write(s,t,e)}else n=this.write(o,t,e);return{dataId:n,shape:t,dtype:e}}refCount(t){return this.data.has(t)?this.data.get(t).refCount:0}incRef(t){let e=this.data.get(t);e.refCount++}decRef(t){if(this.data.has(t)){let e=this.data.get(t);e.refCount--}}move(t,e,o,n,s){this.data.set(t,{values:e,dtype:n,refCount:s})}numDataIds(){return this.data.numDataIds()}async read(t){return this.readSync(t)}readSync(t){let{dtype:e,complexTensorInfos:o}=this.data.get(t);if(e==="complex64"){let n=this.readSync(o.real.dataId),s=this.readSync(o.imag.dataId);return I.mergeRealAndImagArrays(n,s)}return this.data.get(t).values}bufferSync(t){let e=this.readSync(t.dataId);if(t.dtype==="string")try{let o=e.map(n=>y.decodeString(n));return pt(t.shape,t.dtype,o)}catch{throw new Error("Failed to decode encoded string bytes into utf-8")}return pt(t.shape,t.dtype,e)}makeOutput(t,e,o){return Zr().makeTensorFromTensorInfo(this.makeTensorInfo(e,o,t),this)}disposeData(t,e=!1){if(this.data.has(t)){if(this.data.get(t).refCount--,!e&&this.data.get(t).refCount>0)return!1;let{complexTensorInfos:o}=this.data.get(t);o!=null&&(this.disposeData(o.real.dataId,!0),this.disposeData(o.imag.dataId,!0)),this.data.delete(t)}return!0}disposeIntermediateTensorInfo(t){this.disposeData(t.dataId)}async time(t){let e=y.now();return t(),{kernelMs:y.now()-e}}memory(){return{unreliable:!0,reasons:["The reported memory is an upper bound. Due to automatic garbage collection, the true allocated memory may be less."]}}where(t){U([t],"where");let e=this.readSync(t.dataId);return _L(t.shape,e)}dispose(){}floatPrecision(){return 32}epsilon(){return super.epsilon()}};Ml.nextDataId=0;var Ox={};At(Ox,{addImpl:()=>lx,bincountImpl:()=>Zp,bincountReduceImpl:()=>lm,castImpl:()=>cx,ceilImpl:()=>ux,concatImpl:()=>um,equalImpl:()=>mx,expImpl:()=>dx,expm1Impl:()=>gx,floorImpl:()=>xx,gatherNdImpl:()=>mm,gatherV2Impl:()=>fm,greaterEqualImpl:()=>bx,greaterImpl:()=>yx,lessEqualImpl:()=>Tx,lessImpl:()=>Cx,linSpaceImpl:()=>dm,logImpl:()=>Sx,maxImpl:()=>hm,maximumImpl:()=>wx,minimumImpl:()=>Nx,multiplyImpl:()=>Bl,negImpl:()=>vx,notEqualImpl:()=>Ix,prodImpl:()=>kx,raggedGatherImpl:()=>gm,raggedTensorToTensorImpl:()=>xm,rangeImpl:()=>ym,rsqrtImpl:()=>$x,scatterImpl:()=>gs,sigmoidImpl:()=>kw,simpleAbsImpl:()=>px,sliceImpl:()=>Dx,sparseFillEmptyRowsImpl:()=>bm,sparseReshapeImpl:()=>Cm,sparseSegmentReductionImpl:()=>Jp,sqrtImpl:()=>Aw,squaredDifferenceImpl:()=>Rx,stridedSliceImpl:()=>Tm,stringNGramsImpl:()=>Sm,stringSplitImpl:()=>wm,stringToHashBucketFastImpl:()=>Nm,subImpl:()=>_x,tileImpl:()=>vm,topKImpl:()=>Im,transposeImpl:()=>Qp,uniqueImpl:()=>km});function px(r){let t=new Float32Array(r.length);for(let e=0;e<r.length;++e)t[e]=Math.abs(r[e]);return t}var OL=r=>{let{x:t}=r.inputs,e=r.backend;U(t,"abs");let o=new Float32Array(y.sizeFromShape(t.shape)),n=e.data.get(t.dataId).values;return o=px(n),e.makeOutput(o,t.shape,t.dtype)},tw={kernelName:"Abs",backendName:"cpu",kernelFunc:OL};function Et(r){return(t,e,o,n,s)=>{let a=I.assertAndGetBroadcastShape(t,e),i=a.length,p=y.computeStrides(a),c=y.sizeFromShape(a),l=y.getTypedArrayFromDType(s,c),u=t.length,m=e.length,f=y.computeStrides(t),d=y.computeStrides(e),g=I.getBroadcastDims(t,a),h=I.getBroadcastDims(e,a);if(g.length+h.length===0)for(let x=0;x<l.length;++x)l[x]=r(o[x%o.length],n[x%n.length]);else for(let x=0;x<l.length;++x){let b=y.indexToLoc(x,i,p),S=b.slice(-u);g.forEach(D=>S[D]=0);let w=y.locToIndex(S,u,f),E=b.slice(-m);h.forEach(D=>E[D]=0);let $=y.locToIndex(E,m,d);l[x]=r(o[w],n[$])}return[l,a]}}function he(r){let{inputs:t,backend:e}=r,{real:o,imag:n}=t,s=e.data.get(o.dataId).values,a=e.data.get(n.dataId).values,i=e.makeTensorInfo(o.shape,"complex64"),p=e.data.get(i.dataId);return p.complexTensorInfos={real:e.makeTensorInfo(o.shape,"float32",s),imag:e.makeTensorInfo(n.shape,"float32",a)},i}var ew={kernelName:Ta,backendName:"cpu",kernelFunc:he};function jp(r,t,e="float32"){if(e==="complex64"){let n=jp(r,t,"float32"),s=jp(r,t,"float32");return he({inputs:{real:n,imag:s},backend:r})}let o=y.makeZerosTypedArray(y.sizeFromShape(t),e);return r.makeTensorInfo(t,e,o)}function De(r){let{inputs:t,backend:e}=r,{x:o}=t;return e.incRef(o.dataId),{dataId:o.dataId,shape:o.shape,dtype:o.dtype}}var rw={kernelName:zr,backendName:"cpu",kernelFunc:De};function Ar(r){let{inputs:t,backend:e}=r,{input:o}=t,n=e.data.get(o.dataId).complexTensorInfos.real,s=e.data.get(n.dataId).values;return e.makeTensorInfo(n.shape,n.dtype,s)}var ow={kernelName:ei,backendName:"cpu",kernelFunc:Ar};function cx(r,t,e,o){if(o==="int32"){let n=Int32Array.from(r);return[t,"int32",n]}if(o==="bool"){let n=y.toTypedArray([0],e),[s,a]=Et((i,p)=>i!==p?1:0)(t,[],r,n,"bool");return[a,"bool",s]}throw new Error(`Error in Cast: failed to cast ${e} to ${o}`)}function Dr(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{dtype:s}=o;if(s==="complex64"){if(n.dtype==="complex64")return De({inputs:{x:n},backend:e});let l=jp(e,n.shape,n.dtype),u=Dr({inputs:{x:n},backend:e,attrs:{dtype:"float32"}}),m=he({inputs:{real:u,imag:l},backend:e});return e.disposeIntermediateTensorInfo(l),e.disposeIntermediateTensorInfo(u),m}if(n.dtype==="complex64"){let l=Ar({inputs:{input:n},backend:e}),u=Dr({inputs:{x:l},backend:e,attrs:{dtype:s}});return e.disposeIntermediateTensorInfo(l),u}if(!y.hasEncodingLoss(n.dtype,s)){let l=De({inputs:{x:n},backend:e});return{dataId:l.dataId,shape:l.shape,dtype:s}}let a=e.data.get(n.dataId).values,[i,p,c]=cx(a,n.shape,n.dtype,s);return e.makeTensorInfo(i,p,c)}var nw={kernelName:Vr,backendName:"cpu",kernelFunc:Dr};function Ft(r,t,e,o){return e==null?({inputs:n,backend:s})=>{let{a,b:i}=n,p=s;U([a,i],r);let c=p.data.get(a.dataId).values,l=p.data.get(i.dataId).values,u=a.dtype==="string"?I.fromUint8ToStringArray(c):c,m=a.dtype==="string"?I.fromUint8ToStringArray(l):l,f=o||a.dtype,[d,g]=t(a.shape,i.shape,u,m,f);return p.makeTensorInfo(g,f,d)}:({inputs:n,backend:s})=>{let{a,b:i}=n,p=s;if(a.dtype==="complex64"||i.dtype==="complex64"){let c=Dr({inputs:{x:a},backend:p,attrs:{dtype:"complex64"}}),l=p.data.get(c.dataId),u=l.complexTensorInfos.real,m=l.complexTensorInfos.imag,f=p.data.get(u.dataId).values,d=p.data.get(m.dataId).values,g=Dr({inputs:{x:i},backend:p,attrs:{dtype:"complex64"}}),h=p.data.get(g.dataId),x=h.complexTensorInfos.real,b=h.complexTensorInfos.imag,S=p.data.get(x.dataId).values,w=p.data.get(b.dataId).values,[E,$,D]=e(a.shape,i.shape,f,d,S,w),F=p.makeTensorInfo(D,"float32",E),P=p.makeTensorInfo(D,"float32",$),L=he({inputs:{real:F,imag:P},backend:p});return p.disposeIntermediateTensorInfo(c),p.disposeIntermediateTensorInfo(g),p.disposeIntermediateTensorInfo(F),p.disposeIntermediateTensorInfo(P),L}else{let c=p.data.get(a.dataId).values,l=p.data.get(i.dataId).values,u=o||a.dtype,[m,f]=t(a.shape,i.shape,c,l,u);return p.makeTensorInfo(f,u,m)}}}function Yp(r){return(t,e,o,n,s,a)=>{let i=I.assertAndGetBroadcastShape(t,e),p=y.sizeFromShape(i),c=i.length,l=y.computeStrides(i),u=y.getTypedArrayFromDType("float32",p),m=y.getTypedArrayFromDType("float32",p),f=I.getBroadcastDims(t,i),d=I.getBroadcastDims(e,i),g=I.mergeRealAndImagArrays(o,n),h=I.mergeRealAndImagArrays(s,a),x=t.length,b=y.computeStrides(t),S=e.length,w=y.computeStrides(e);if(f.length+d.length===0)for(let E=0;E<u.length;E++){let $=E%g.length,D=E%h.length,F=r(g[$*2],g[$*2+1],h[D*2],h[D*2+1]);u[E]=F.real,m[E]=F.imag}else for(let E=0;E<u.length;E++){let $=y.indexToLoc(E,c,l),D=$.slice(-x);f.forEach(B=>D[B]=0);let F=y.locToIndex(D,x,b),P=$.slice(-S);d.forEach(B=>P[B]=0);let L=y.locToIndex(P,S,w),M=r(g[F*2],g[F*2+1],h[L*2],h[L*2+1]);u[E]=M.real,m[E]=M.imag}return[u,m,i]}}var lx=Et(((r,t)=>r+t)),PL=Yp(((r,t,e,o)=>({real:r+e,imag:t+o}))),en=Ft("Add",lx,PL),sw={kernelName:"Add",backendName:"cpu",kernelFunc:en};function Zp(r,t,e,o,n){let s=y.sizeFromShape(o),a=y.makeZerosTypedArray(n,e);for(let i=0;i<r.length;i++){let p=r[i];if(p<0)throw new Error("Input x must be non-negative!");p>=n||(s>0?a[p]+=t[i]:a[p]+=1)}return a}function lm(r,t,e,o=!1){let n=r.shape[0],s=r.shape[1],a=pt([n,e],t.dtype);for(let i=0;i<n;i++)for(let p=0;p<s;p++){let c=r.get(i,p);if(c<0)throw new Error("Input x must be non-negative!");c>=e||(o?a.set(1,i,c):t.size>0?a.set(a.get(i,c)+t.get(i,p),i,c):a.set(a.get(i,c)+1,i,c))}return a}function We(r){return(t,e,o)=>{let n=y.getTypedArrayFromDType(e,t.length);for(let s=0;s<t.length;++s)n[s]=r(t[s],o);return n}}function ht(r,t,e){return({inputs:o,attrs:n,backend:s})=>{let{x:a}=o;if(U(a,r),a.dtype==="string"||e==="string")throw new Error("unaryKernelFunc does not support string input/output");let i=s,p=i.data.get(a.dataId).values,c=y.sizeFromShape(a.shape),l=e||a.dtype,u=y.getArrayFromDType(l,c);for(let m=0;m<c;++m)u[m]=t(p[m],n);return i.makeTensorInfo(a.shape,l,u)}}function Rr(r,t,e){return({inputs:o,attrs:n,backend:s})=>{let{x:a}=o;if(U(a,r),a.dtype==="string"||e==="string")throw new Error("unaryKernelFunc does not support string input/output");let i=s,p=i.data.get(a.dataId).values,c=e||a.dtype,l=t(p,c,n);return i.makeTensorInfo(a.shape,c,l)}}var ux=We(r=>Math.ceil(r)),LL=Rr(ho,ux),aw={kernelName:ho,backendName:"cpu",kernelFunc:LL};function um(r,t,e,o){let n=y.getArrayFromDType(e,y.sizeFromShape(t));if(o&&e!=="string"){let s=0;r.forEach(a=>{let i=y.sizeFromShape(a.shape);n.set(a.vals,s),s+=i})}else{let s=0;r.forEach(a=>{let i=e==="string"?I.fromUint8ToStringArray(a.vals):a.vals,p=0;for(let c=0;c<a.shape[0];++c){let l=c*t[1]+s;for(let u=0;u<a.shape[1];++u)n[l+u]=i[p++]}s+=a.shape[1]})}return n}var mx=Et((r,t)=>r===t?1:0),fx=Ft(As,mx,null,"bool"),iw={kernelName:As,backendName:"cpu",kernelFunc:fx};var dx=We(r=>Math.exp(r)),hx=Rr("Exp",dx,"float32"),pw={kernelName:"Exp",backendName:"cpu",kernelFunc:hx};var gx=We(r=>Math.expm1(r)),ML=Rr(bo,gx),cw={kernelName:bo,backendName:"cpu",kernelFunc:ML};var xx=We(r=>Math.floor(r)),BL=Rr(Co,xx),lw={kernelName:Co,backendName:"cpu",kernelFunc:BL};function mm(r,t,e,o,n,s,a,i,p){let c=pt([o,s],e);for(let l=0;l<o;l++){let u=[],m=0;for(let f=0;f<n;f++){let d=r[l*n+f];m+=d*a[f],u.push(d)}if(m<0||m>=p/s)throw new Error(`Invalid indices: ${u} does not index into ${i}`);for(let f=0;f<s;f++)c.values[l*s+f]=t.get(...t.indexToLoc(m*s+f))}return c}function fm(r,t,e){let o=pt(e,r.dtype);for(let n=0;n<o.size;++n){let a=o.indexToLoc(n).slice(),i=a[0],p=a[2],c=t.locToIndex([i,p]);a[2]=t.values[c];let l=r.locToIndex(a);0<=l&&l<r.values.length&&(o.values[n]=r.values[l])}return o}var yx=Et((r,t)=>r>t?1:0),GL=Ft(Rs,yx,null,"bool"),uw={kernelName:Rs,backendName:"cpu",kernelFunc:GL};var bx=Et((r,t)=>r>=t?1:0),VL=Ft(So,bx,null,"bool"),mw={kernelName:So,backendName:"cpu",kernelFunc:VL};var Cx=Et((r,t)=>r<t?1:0),zL=Ft(Fs,Cx,null,"bool"),fw={kernelName:Fs,backendName:"cpu",kernelFunc:zL};var Tx=Et((r,t)=>r<=t?1:0),WL=Ft(_s,Tx,null,"bool"),dw={kernelName:_s,backendName:"cpu",kernelFunc:WL};function dm(r,t,e){let o=(t-r)/(e-1),n=y.makeZerosTypedArray(e,"float32");n[0]=r;for(let s=1;s<n.length;s++)n[s]=n[s-1]+o;return n}var Sx=We(r=>Math.log(r)),UL=Rr("Log",Sx),hw={kernelName:"Log",backendName:"cpu",kernelFunc:UL};function hm(r,t,e,o){let n=y.getTypedArrayFromDType(o,y.sizeFromShape(e));for(let s=0;s<n.length;++s){let a=s*t,i=r[a];for(let p=0;p<t;++p){let c=r[a+p];(Number.isNaN(c)||c>i)&&(i=c)}n[s]=i}return n}var wx=Et(((r,t)=>Math.max(r,t))),HL=Ft(ko,wx),gw={kernelName:ko,backendName:"cpu",kernelFunc:HL};var Nx=Et(((r,t)=>Math.min(r,t))),qL=Ft(Eo,Nx),xw={kernelName:Eo,backendName:"cpu",kernelFunc:qL};var Bl=Et(((r,t)=>r*t)),KL=Yp(((r,t,e,o)=>({real:r*e-t*o,imag:r*o+t*e}))),sp=Ft($o,Bl,KL),yw={kernelName:$o,backendName:"cpu",kernelFunc:sp};function vx(r,t,e){let o=y.createScalarValue(-1,e);return Bl([],t,o,r,e)}function XL(r){let{inputs:t,backend:e}=r,{x:o}=t;U(o,"neg");let n=e.data.get(o.dataId).values,[s,a]=vx(n,o.shape,o.dtype);return e.makeTensorInfo(a,o.dtype,s)}var bw={kernelName:"Neg",backendName:"cpu",kernelFunc:XL};var Ix=Et(((r,t)=>r!==t?1:0)),jL=Ft(Gs,Ix,null,"bool"),Cw={kernelName:Gs,backendName:"cpu",kernelFunc:jL};function Qp(r,t,e,o,n){let s=t.length,a=y.sizeFromShape(t),i=y.computeStrides(t),p=y.computeStrides(n),c=y.getTypedArrayFromDType(e,y.sizeFromShape(n));for(let l=0;l<a;++l){let u=y.indexToLoc(l,s,i),m=new Array(u.length);for(let d=0;d<m.length;d++)m[d]=u[o[d]];let f=y.locToIndex(m,s,p);c[f]=r[l]}return c}function jt(r){let{inputs:t,attrs:e,backend:o}=r,{x:n}=t,{perm:s}=e;U(n,"transpose");let a=n.shape.length,i=new Array(a);for(let u=0;u<i.length;u++)i[u]=n.shape[s[u]];let p=o.data.get(n.dataId).values,c=Qp(p,n.shape,n.dtype,s,i);return{dataId:o.write(c,i,n.dtype),shape:i,dtype:n.dtype}}var Tw={kernelName:Ur,backendName:"cpu",kernelFunc:jt};function kx(r,t,e,o){let[n,s]=I.computeOutAndReduceShapes(r,o),a=ne(t,"int32"),i=y.makeZerosTypedArray(y.sizeFromShape(n),a),p=y.sizeFromShape(s);for(let c=0;c<i.length;++c){let l=c*p,u=1;for(let m=0;m<p;++m)u*=e[l+m];i[c]=u}return{outVals:i,outShape:n,outDtype:a}}function YL(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s,keepDims:a}=o;U(n,"prod");let i=n.shape.length,p=y.parseAxisParam(s,n.shape),c=I.getAxesPermutation(p,i),l=p,u=n,m=[];c!=null&&(u=jt({inputs:{x:n},backend:e,attrs:{perm:c}}),m.push(u),l=I.getInnerMostAxes(l.length,i));let f=e.data.get(u.dataId).values,{outVals:d,outShape:g,outDtype:h}=kx(u.shape,u.dtype,f,l),x=g;return a&&(x=I.expandShapeToKeepDim(g,p)),m.forEach(b=>e.disposeIntermediateTensorInfo(b)),e.makeTensorInfo(x,h,d)}var Sw={kernelName:Bn,backendName:"cpu",kernelFunc:YL};function ZL(r,t,e){r.forEach((o,n)=>{if(o<0||o>=e){let s=y.indexToLoc(n,t.length,y.computeStrides(t)).join(",");throw new Error(`indices[${s}] = ${o} is not in [0, ${e})`)}})}function QL(r,t){for(let e=0;e<r.length;++e){let o=r[e],n=e===r.length-1?t:r[e+1].length;if(o.length===0)throw new Error("Ragged splits may not be empty");if(o[0]<0)throw new Error("Ragged splits must be non-negative");if(o[o.length-1]>n)throw new Error("Ragged splits must not point past values");for(let s=1;s<o.length;++s)if(o[s-1]>o[s])throw new Error("Ragged splits must be sorted in ascending order")}}function JL(r,t,e,o){let n=[],s=0,a=t.length-1+e.length,i=new Array(a).fill(null).map(()=>[0]);QL(e,o);let p=1;for(let c=0;c<t.length-1;++c){p*=t[c];let l=t[c+1];for(let u=1;u<p+1;++u)i[c].push(u*l)}for(let c=0;c<r.length;++c){let l=r[c],u=r[c]+1;for(let m=0;m<e.length;++m){let f=e[m],d=m+t.length-1;if(d>=0){let g=i[d],h=g[g.length-1]-f[l];for(let x=l;x<u;++x)i[d].push(f[x+1]+h)}l=f[l],u=f[u]}u!==l&&(n.push([l,u]),s+=u-l)}return{outSplits:i,valueSlices:n,numValues:s}}function tM(r){let t=[];for(let e=0;e<r.length;++e){let o=r[e].length,n=y.getArrayFromDType("int32",o);t.push(n),r[e].forEach((s,a)=>n[a]=s)}return t}function ww(r,t){let e=r.slice(0,t);for(;e.length<t;)e.push(1);for(let o=t;o<r.length;o++)e[t-1]*=r[o];return e}function eM(r,t,e,o,n,s){let a=ww(t,2)[1],i=ww(s,2)[1],p=0;for(let c of e)for(let l=c[0];l<c[1];++l){for(let u=0;u<o;++u)n[p*i+u]=r[l*a+u];++p}}function rM(r,t,e,o,n){let s=t.slice();s[0]=n;let a=y.getArrayFromDType(e,y.sizeFromShape(s)),i=r.length,p=i===0?0:i/t[0];return eM(r,t,o,p,a,s),[a,s]}function gm(r,t,e,o,n,s,a,i){if(r.length===0)throw new Error("paramsNestedSplits must be non empty");if(t[0].length===0)throw new Error("Split tensors must not be scalars");let p=t[0][0]-1;if(ZL(s,a,p),o.length===0)throw new Error("params.rank must be nonzero");let c=o[0],{outSplits:l,valueSlices:u,numValues:m}=JL(s,a,r,c),f=tM(l),d=rM(e,o,n,u,m);return[f,d[0],d[1]]}var Fr=I.RowPartitionType,Ex=class r{constructor(t,e,o,n,s,a,i,p,c,l){this.shape=t,this.shapeShape=e,this.values=o,this.valuesShape=n,this.valuesDType=s,this.defaultValue=a,this.defaultValueShape=i,this.rowPartitionValues=p,this.rowPartitionValuesShapes=c,this.rowPartitionTypes=I.getRowPartitionTypesHelper(l),this.raggedRank=I.getRaggedRank(this.rowPartitionTypes)}getRowPartitionTypeByDimension(t){return this.rowPartitionTypes[0]===Fr.FIRST_DIM_SIZE?this.rowPartitionTypes[t+1]:this.rowPartitionTypes[t]}getRowPartitionTensor(t){return this.rowPartitionTypes[0]===Fr.FIRST_DIM_SIZE?this.rowPartitionValues[t+1]:this.rowPartitionValues[t]}getMaxWidth(t){let e=this.getRowPartitionTensor(t-1);switch(this.getRowPartitionTypeByDimension(t-1)){case Fr.VALUE_ROWIDS:return r.getMaxWidthValueRowID(e);case Fr.ROW_SPLITS:return r.getMaxWidthRowSplit(e);default:throw new Error(`Cannot handle partition type ${Fr[this.getRowPartitionTypeByDimension(t-1)]}`)}}static getMaxWidthRowSplit(t){let e=t.length;if(e===0||e===1)return 0;let o=0;for(let n=0;n<e-1;++n){let s=t[n+1]-t[n];s>o&&(o=s)}return o}static getMaxWidthValueRowID(t){let e=t.length;if(e===0)return 0;let o=0,n=t[0],s=0;for(let a=1;a<e;++a){let i=t[a];i!==n&&(n=i,s=Math.max(a-o,s),o=a)}return Math.max(e-o,s)}tensorShapeFromTensor(t,e,o=!0){if(e.length===0){if(t[0]===-1)return[];throw new Error("The only valid scalar shape tensor is the fully unknown shape specified as -1.")}return vw(t,o)}calculateOutputSize(t){let e=this.valuesShape,o=this.defaultValueShape;I.validateDefaultValueShape(o,e);let n=this.tensorShapeFromTensor(this.shape,this.shapeShape),a=I.combineRaggedTensorToTensorShapes(this.raggedRank,n,e);a[0]<0&&(a[0]=t);for(let i=1;i<=this.raggedRank;++i)a[i]<0&&(a[i]=this.getMaxWidth(i));return a}calculateFirstParentOutputIndex(t,e,o){let n=Math.min(t,o),s=[],a=0;for(let i=0;i<n;++i,a+=e)s.push(a);for(let i=n;i<t;++i)s.push(-1);return y.assert(s.length===t,()=>"Final length of result must be equal to firstDimension."),s}calculateOutputIndexRowSplit(t,e,o,n){let s=t.length,a=[];for(let i=0;i<s-1;++i){let p=t[i+1]-t[i],c=Math.min(n,p),l=e[i];l===-1&&(c=0);for(let u=0;u<c;++u)a.push(l),l+=o;for(let u=0;u<p-c;++u)a.push(-1)}if(s>0&&a.length!==t[s-1])throw new Error("Invalid row split size.");return a}calculateOutputIndexValueRowID(t,e,o,n){let s=t.length,a=[];if(s===0)return[];let i=0,p=t[0];if(p>=e.length)throw new Error(`Got currentValueRowId=${p}, which is not less than ${e.length}`);let c=e[p];a.push(c);for(let l=1;l<s;++l){let u=t[l];if(u===p)c>=0&&(++i,i<n?c+=o:c=-1);else{if(i=0,p=u,u>=e.length)throw new Error(`Got nextValueRowId=${u} which is not less than ${e.length}`);c=e[u]}a.push(c)}if(a.length!==t.length)throw new Error("Invalid row ids.");return a}calculateOutputIndex(t,e,o,n){let s=this.getRowPartitionTensor(t),a=this.getRowPartitionTypeByDimension(t);switch(a){case Fr.VALUE_ROWIDS:return this.calculateOutputIndexValueRowID(s,e,o,n);case Fr.ROW_SPLITS:if(s.length-1>e.length)throw new Error(`Row partition size is greater than output size: ${s.length-1} > ${e.length}`);return this.calculateOutputIndexRowSplit(s,e,o,n);default:throw new Error(`Unsupported partition type: ${Fr[a]}`)}}getFirstDimensionSize(){let t=this.rowPartitionValues[0];if(this.rowPartitionTypes.length===0)throw new Error("No row_partition_types given.");let e=this.rowPartitionTypes[0];switch(e){case Fr.FIRST_DIM_SIZE:return t[0];case Fr.VALUE_ROWIDS:throw new Error("Cannot handle VALUE_ROWIDS in first dimension.");case Fr.ROW_SPLITS:return this.rowPartitionValuesShapes[0][0]-1;default:throw new Error(`Cannot handle type ${Fr[e]}`)}}compute(){if(this.rowPartitionValues[0].length<=0)throw new Error("Invalid first partition input. Tensor requires at least one element.");let e=this.getFirstDimensionSize(),o=this.calculateOutputSize(e),n=new Array(this.raggedRank+1);n[n.length-1]=1;for(let p=n.length-2;p>=0;--p)n[p]=n[p+1]*o[p+1];let s=vw(o,!1),a=y.getArrayFromDType(this.valuesDType,y.sizeFromShape(s));if(n[0]*o[0]>0){let p=this.calculateFirstParentOutputIndex(e,n[0],o[0]);for(let c=1;c<=this.raggedRank;++c)p=this.calculateOutputIndex(c-1,p,n[c],o[c]);this.setOutput(this.raggedRank,p,a,s)}return[s,a]}setOutput(t,e,o,n){if(o.length===0)return;let s=this.values,a=o,i=n.slice();i=i.slice(t+1);let p=y.sizeFromShape(i),c=e.length,l=this.defaultValue;if(l.length!==p&&l.length!==1){let d=this.defaultValueShape;St(()=>{let g=R(l,d);l=Xr(g,i).dataSync()})}let u=0,m=0,f=0;for(let d=0;d<=c;++d){let g=d<c?e[d]:-1;if(g===f){++f;continue}if(m<f){let h=s.subarray(u*p),x=a.subarray(m*p),b=(f-m)*p;Nw(x,h,b)}if(d>=c){let h=o.length;g=Math.floor(h/p)}if(g>f)if(this.defaultValue.length===1)a.subarray(f*p,g*p).fill(this.defaultValue[0]),f=g;else for(;g>f;){let h=a.slice(f*p);Nw(h,l,p),++f}g<0?(u=d+1,m=f):(u=d,m=f,f=m+1)}}};function Nw(r,t,e){for(let o=0;o<e;o++)r[o]=t[o]}function vw(r,t){let e=[];for(let o of r){if(o<0){if(!t)throw new Error(`Dimension ${o} must be >= 0`);if(o<-1)throw new Error(`Dimension ${o} must be >= -1`);o=-1}e.push(o)}return e}function xm(r,t,e,o,n,s,a,i,p,c){return new Ex(r,t,e,o,n,s,a,i,p,c).compute()}function ym(r,t,e,o){let n=r===t,s=r<t&&e<0,a=t<r&&e>1;if(n||s||a)return y.makeZerosTypedArray(0,o);let i=Math.abs(Math.ceil((t-r)/e)),p=y.makeZerosTypedArray(i,o);t<r&&e===1&&(e=-1),p[0]=r;for(let c=1;c<p.length;c++)p[c]=p[c-1]+e;return p}var $x=We(r=>1/Math.sqrt(r)),oM=Rr(_o,$x),Iw={kernelName:_o,backendName:"cpu",kernelFunc:oM};function gs(r,t,e,o,n,s,a,i,p,c){let l=[o/n,n],u=r.values,m=t.values;if(o===0)return pt(e,t.dtype);let f=pt(l,t.dtype);typeof p=="string"||typeof p=="number"?f.values.fill(p):typeof p=="boolean"&&f.values.fill(+p);for(let d=0;d<s;d++){let g=[],h=0;for(let x=0;x<a;x++){let b=u[d*a+x];g.push(b),h+=b*i[x]}if(h<0||h>=o/n)throw new Error(`Invalid indices: ${g} does not index into ${e}`);for(let x=0;x<n;x++)c?f.values[h*n+x]+=m[d*n+x]:f.values[h*n+x]=t.rank===0?m[0]:m[d*n+x]}return f}var kw=We(r=>1/(1+Math.exp(-r))),Ax=ht(Mo,r=>1/(1+Math.exp(-r))),Ew={kernelName:Mo,backendName:"cpu",kernelFunc:Ax};function Dx(r,t,e,o,n){let s=de.isSliceContinous(o,t,e),a=y.sizeFromShape(e),i=y.computeStrides(o);if(s){let u=de.computeFlatOffset(t,i);return n==="string"?r.slice(u,u+a):r.subarray(u,u+a)}let p=n==="string"?I.fromUint8ToStringArray(r):r,c=pt(o,n,p),l=pt(e,n);for(let u=0;u<l.size;++u){let m=l.indexToLoc(u),f=m.map((d,g)=>d+t[g]);l.set(c.get(...f),...m)}return n==="string"?I.fromStringArrayToUint8(l.values):l.values}function _r(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{begin:s,size:a}=o;U(n,"slice");let[i,p]=de.parseSliceParams(n,s,a);de.assertParamsValid(n,i,p);let c=e.data.get(n.dataId).values,l=Dx(c,i,p,n.shape,n.dtype);return e.makeTensorInfo(p,n.dtype,l)}var $w={kernelName:Hn,backendName:"cpu",kernelFunc:_r};function bm(r,t,e,o,n,s,a){let i=t[0],p=s[0],c=new Array(p),l=new Array(i),u=t[1];if(p===0){if(i!==0)throw new Error(I.getSparseFillEmptyRowsIndicesDenseShapeMismatch(i));let h=y.getArrayFromDType(e,0),x=y.getArrayFromDType(n,0);return[h,[0,u],x,c,l]}let m=!0,f=0,d=new Array(p).fill(0);for(let h=0;h<i;++h){let x=r[h*u];if(x<0)throw new Error(I.getSparseFillEmptyRowsNegativeIndexErrorMessage(h,x));if(x>=p)throw new Error(I.getSparseFillEmptyRowsOutOfRangeIndexErrorMessage(h,x,p));++d[x],m=m&&x>=f,f=x}let g=!0;for(let h=0;h<p;++h){let x=d[h]===0;c[h]=x,g=g&&!x,d[h]=Math.max(d[h],1),h>0&&(d[h]+=d[h-1])}if(g&&m){let h=r,x=o;for(let b=0;b<i;++b)l[b]=b;return[h,[i,u],x,c,l]}else{let h=d[p-1],x=y.getArrayFromDType(e,h*u),b=y.getArrayFromDType(n,h),S=new Array(p).fill(0);for(let w=0;w<i;++w){let E=r[w*u],$=S[E],D=(E===0?0:d[E-1])+$;S[E]++;for(let F=0;F<u;++F)x[D*u+F]=r[w*u+F];b[D]=o[w],l[w]=D}for(let w=0;w<p;++w)if(S[w]===0){let $=w===0?0:d[w-1];x[$*u+0]=w;for(let D=1;D<u;++D)x[$*u+D]=0;b[$]=a}return[x,[h,u],b,c,l]}}function Cm(r,t,e,o,n){let s=y.sizeFromShape(o),a=t[0],i=n.length,p=[],c=1,l=-1;for(let h=0;h<i;++h){let x=n[h];if(x===-1){if(l!==-1)throw new Error(I.getSparseReshapeMultipleNegativeOneOutputDimErrorMessage(l,h));l=h,p.push(1)}else{if(x<0)throw new Error(I.getSparseReshapeNegativeOutputDimErrorMessage(h,x));c*=x,p.push(x)}}if(l!==-1){if(c<=0)throw new Error(I.getSparseReshapeEmptyTensorZeroOutputDimErrorMessage());let h=Math.trunc(s/c);if(c*h!==s)throw new Error(I.getSparseReshapeInputOutputMultipleErrorMessage(o,p));p[l]=h}if(y.sizeFromShape(p)!==s)throw new Error(I.getSparseReshapeInputOutputMismatchErrorMessage(o,p));let m=o.length,f=[];if(m>0){f[m-1]=1;for(let h=m-2;h>=0;--h)f[h]=f[h+1]*o[h+1]}let d=[];if(i>0){d[i-1]=1;for(let h=i-2;h>=0;--h)d[h]=d[h+1]*p[h+1]}let g=y.getArrayFromDType(e,a*i);for(let h=0;h<a;++h){let x=0;for(let b=0;b<m;++b)x+=r[h*m+b]*f[b];for(let b=0;b<i;++b)g[h*i+b]=Math.trunc(x/d[b]),x%=d[b]}return[g,[a,i],p]}function Jp(r,t,e,o,n,s=!1,a=0){let i=o.length,p=[t[0],r.length/t[0]],c=p[1],u=i>0?n[i-1]+1:0;if(u<0)throw new Error(I.getSparseSegmentReductionNegativeSegmentIdsErrorMessage());let m=t.slice();m[0]=u;let f=m.reduce((S,w)=>S*w,1),d=y.getArrayFromDType(e,f);if(i===0)return u>0&&d.fill(a),[d,m];if(u<=0)throw new Error(I.getSparseSegmentReductionNegativeSegmentIdsErrorMessage());let g=0,h=1,x=0,b=n[g];for(;;){let S=0;if(h<i){if(S=n[h],b===S){++h;continue}if(b>=S)throw new Error(I.getSparseSegmentReductionNonIncreasingSegmentIdsErrorMessage())}if(b<0||b>=u)throw new Error(I.getSparseSegmentReductionSegmentIdOutOfRangeErrorMessage(b,u));b>x&&d.fill(a,x*c,b*c);for(let w=g;w<h;++w){let E=o[w];if(E<0||E>=p[0])throw new Error(I.getSparseSegmentReductionIndicesOutOfRangeErrorMessage(w,o[w],p[0]));for(let $=0;$<c;$++)d[b*c+$]+=r[E*c+$]}if(s)for(let w=0;w<c;w++)d[b*c+w]/=h-g;if(g=h,++h,x=b+1,b=S,h>i)break}return x<u&&d.fill(a,x*c,u*c),[d,m]}var Aw=We(r=>Math.sqrt(r)),nM=ht(Go,r=>Math.sqrt(r)),Dw={kernelName:Go,backendName:"cpu",kernelFunc:nM};var Rx=Et(((r,t)=>{let e=r-t;return e*e})),sM=Ft(Vo,Rx),Rw={kernelName:Vo,backendName:"cpu",kernelFunc:sM};function Tm(r,t,e,o){let n=pt(r,t.dtype);for(let s=0;s<n.size;s++){let a=n.indexToLoc(s),i=new Array(a.length);for(let p=0;p<i.length;p++)i[p]=a[p]*e[p]+o[p];n.set(t.get(...i),...a)}return n}var Fx=class{constructor(t,e,o,n,s,a){this.separator=y.encodeString(t),this.nGramWidths=e,this.leftPad=y.encodeString(o),this.rightPad=y.encodeString(n),this.padWidth=s,this.preserveShort=a}getPadWidth(t){return Math.min(this.padWidth<0?t-1:this.padWidth,t-1)}getNumNGrams(t,e){let o=this.getPadWidth(e);return Math.max(0,t+2*o-e+1)}createNGrams(t,e,o,n,s,a){for(let i=0;i<s;++i){let p=this.getPadWidth(a),c=Math.max(0,p-i),l=Math.max(0,p-(s-(i+1))),u=a-(c+l),m=e+(c>0?0:i-p),f=0;f+=c*this.leftPad.length;for(let b=0;b<u;++b)f+=t[m+b].length;f+=l*this.rightPad.length;let d=c+l+u-1;f+=d*this.separator.length,o[n+i]=new Uint8Array(f);let g=o[n+i],h=0,x=b=>b.forEach(S=>g[h++]=S);for(let b=0;b<c;++b)x(this.leftPad),x(this.separator);for(let b=0;b<u-1;++b)x(t[m+b]),x(this.separator);if(u>0){x(t[m+u-1]);for(let b=0;b<l;++b)x(this.separator),x(this.rightPad)}else{for(let b=0;b<l-1;++b)x(this.rightPad),x(this.separator);x(this.rightPad)}}}compute(t,e){let o=t.length,n=e.length;if(n>0){let p=e[0];if(p!==0)throw new Error(`First split value must be 0, got ${p}`);for(let c=1;c<n;++c){let l=e[c]>=p;if(l=l&&e[c]<=o,!l)throw new Error(`Invalid split value ${e[c]}, must be in [${p}, ${o}]`);p=e[c]}if(p!==o)throw new Error(`Last split value must be data size. Expected ${o}, got ${p}`)}let s=n-1,a=y.getArrayFromDType("int32",n);if(o===0||n===0){let p=new Array(o);for(let c=0;c<=s;++c)a[c]=0;return[p,a]}a[0]=0;for(let p=1;p<=s;++p){let c=e[p]-e[p-1],l=0;this.nGramWidths.forEach(u=>{l+=this.getNumNGrams(c,u)}),this.preserveShort&&c>0&&l===0&&(l=1),a[p]=a[p-1]+l}let i=new Array(a[s]);for(let p=0;p<s;++p){let c=e[p],l=a[p];if(this.nGramWidths.forEach(u=>{let m=e[p+1]-e[p],f=this.getNumNGrams(m,u);this.createNGrams(t,c,i,l,f,u),l+=f}),this.preserveShort&&l===a[p]){let u=e[p+1]-e[p];if(u===0)continue;let m=u+2*this.padWidth;this.createNGrams(t,c,i,l,1,m)}}return[i,a]}};function Sm(r,t,e,o,n,s,a,i){return new Fx(e,o,n,s,a,i).compute(r,t)}function aM(r,t,e,o){if(!r.length)return;if(t.length===0){for(let s=0;s<r.length;++s)o.push(r.subarray(s,s+1));return}if(t.length===1){let s=t[0],a=r.indexOf(s);for(;a!==-1;){let i=r.subarray(0,a);(!e||i.length!==0)&&o.push(i),r=r.subarray(a+1),a=r.indexOf(s)}(!e||r.length!==0)&&o.push(r);return}let n=0;for(let s=0;s<r.length+1;s++)if(s===r.length||t.indexOf(r[s])!==-1){let a=r.subarray(n,s);(!e||a.length!==0)&&o.push(a),n=s+1}}function wm(r,t,e){let o=r.length,n=[],s=0,a=0,i=new Array(o);for(let m=0;m<o;++m){let f=n.length;aM(r[m],t,e,n);let d=n.length-f;i[m]=d,s+=d,a=Math.max(a,d)}let p=y.getArrayFromDType("int32",s*2),c=new Array(s),l=[o,a],u=0;for(let m=0;m<o;++m)for(let f=0;f<i[m];++f)p[u*2]=m,p[u*2+1]=f,c[u]=n[u],++u;return[p,c,l]}function Nm(r,t){let e=y.getArrayFromDType("int32",r.length);for(let o=0;o<r.length;++o)e[o]=y.fingerPrint64(r[o]).modulo(t).getLowBitsUnsigned();return e}var _x=Et(((r,t)=>r-t)),iM=Yp(((r,t,e,o)=>({real:r-e,imag:t-o}))),Gl=Ft("Sub",_x,iM),Fw={kernelName:"Sub",backendName:"cpu",kernelFunc:Gl};function vm(r,t){let e=new Array(r.rank);for(let n=0;n<e.length;n++)e[n]=r.shape[n]*t[n];let o=pt(e,r.dtype);for(let n=0;n<o.values.length;++n){let s=o.indexToLoc(n),a=new Array(r.rank);for(let p=0;p<a.length;p++)a[p]=s[p]%r.shape[p];let i=r.locToIndex(a);o.values[n]=r.values[i]}return o}var Vl=(r,t)=>{let e=t.value-r.value;return e===0?r.index-t.index:e};function _w(r,t,e=0,o=r.length-1){for(;o>e;){if(o-e>600){let i=o-e+1,p=t-e+1,c=Math.log(i),l=.5*Math.exp(2*c/3),u=.5*Math.sqrt(c*l*(i-l)/i)*Math.sign(p-i/2),m=Math.max(e,Math.floor(t-p*l/i+u)),f=Math.min(o,Math.floor(t+(i-p)*l/i+u));_w(r,t,m,f)}let n=r[t],s=e,a=o;for(y.swap(r,e,t),Vl(r[o],n)>0&&y.swap(r,e,o);s<a;){for(y.swap(r,s,a),s++,a--;Vl(r[s],n)<0;)s=s+1;for(;Vl(r[a],n)>0;)a=a-1}Vl(r[e],n)===0?y.swap(r,e,a):(a=a+1,y.swap(r,a,o)),a<=t&&(e=a+1),t<=a&&(o=a-1)}}function Im(r,t,e,o,n){let s=t[t.length-1],[a,i]=[r.length/s,s],p=y.getTypedArrayFromDType(e,a*o),c=y.getTypedArrayFromDType("int32",a*o);for(let u=0;u<a;u++){let m=u*i,f=r.subarray(m,m+i),d=new Array(f.length);f.forEach((b,S)=>d[S]={value:b,index:S}),o<d.length&&(_w(d,o),d=d.slice(0,o)),n&&d.sort(Vl);let g=u*o,h=p.subarray(g,g+o),x=c.subarray(g,g+o);for(let b=0;b<o;b++)h[b]=d[b].value,x[b]=d[b].index}let l=t.slice();return l[l.length-1]=o,[pt(l,e,p),pt(l,"int32",c)]}function km(r,t,e,o){let n=y.parseAxisParam(t,e)[0],s=[1,e[0],1];for(let d=0;d<n;d++)s[0]*=e[d];s[1]=e[n];for(let d=n+1;d<e.length;d++)s[2]*=e[d];let a={},i=new Int32Array(e[n]),p=new _t(s,o,r),c=[],l=s[0]===1&&s[2]===1;for(let d=0;d<e[n];d++){let g;if(l)g=r[d].toString();else{let h=[];for(let x=0;x<s[0];x++)for(let b=0;b<s[2];b++)h.push(p.get(x,d,b));g=h.join(",")}if(a[g]!==void 0)i[d]=a[g];else{let h=Object.keys(a).length;a[g]=h,i[d]=h,c.push(d)}}let u=s.slice();u[1]=Object.keys(a).length;let m=new _t(u,o);c.forEach((d,g)=>{for(let h=0;h<s[0];h++)for(let x=0;x<s[2];x++)m.set(p.get(h,d,x),h,g,x)});let f=e.slice();return f[n]=u[1],{outputValues:m.values,outputShape:f,indices:i}}Fl("cpu",()=>new Ml,1);var Px=ht("Elu",r=>r>=0?r:Math.exp(r)-1),Ow={kernelName:"Elu",backendName:"cpu",kernelFunc:Px};function Lx(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{alpha:s}=o;U([n],"leakyRelu");let a=y.sizeFromShape(n.shape),i=e.data.get(n.dataId).values,p=y.getTypedArrayFromDType("float32",a);for(let c=0;c<i.length;c++)p[c]=i[c]<0?s*i[c]:i[c];return e.makeTensorInfo(n.shape,"float32",p)}var Pw={kernelName:$n,backendName:"cpu",kernelFunc:Lx};var pM=Et((r,t)=>r<0?t*r:r);function Mx(r){let{inputs:t,backend:e}=r,{x:o,alpha:n}=t;U([o,n],"prelu");let s=e.data.get(o.dataId).values,a=e.data.get(n.dataId).values,[i,p]=pM(o.shape,n.shape,s,a,"float32");return e.makeTensorInfo(p,"float32",i)}var Lw={kernelName:Mn,backendName:"cpu",kernelFunc:Mx};var Bx=ht(Do,r=>Math.max(0,r)),Mw={kernelName:Do,backendName:"cpu",kernelFunc:Bx};var Gx=ht(Ro,r=>Math.min(Math.max(0,r),6)),Bw={kernelName:Ro,backendName:"cpu",kernelFunc:Gx};function ap(r,t,e,o,n){if(e==="linear")return De({inputs:{x:t},backend:r});if(e==="relu")return Bx({inputs:{x:t},backend:r});if(e==="elu")return Px({inputs:{x:t},backend:r});if(e==="relu6")return Gx({inputs:{x:t},backend:r});if(e==="prelu")return Mx({inputs:{x:t,alpha:o},backend:r});if(e==="leakyrelu")return Lx({inputs:{x:t},backend:r,attrs:{alpha:n}});if(e==="sigmoid")return Ax({inputs:{x:t},backend:r});throw new Error(`Activation ${e} has not been implemented for the CPU backend.`)}function vt(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{shape:s}=o,a=y.sizeFromShape(n.shape),i=y.inferFromImplicitShape(s,a),p=y.sizeFromShape(i);y.assert(a===p,()=>`The new shape (${i}) has ${p} elements and the old shape (${n.shape}) has ${a} elements. The new shape and old shape must have the same number of elements.`),e.incRef(n.dataId);let c=e.data.get(n.dataId);if(c.complexTensorInfos!=null){let l=c.complexTensorInfos.real,u=c.complexTensorInfos.imag;l.shape=i,u.shape=i}return{dataId:n.dataId,shape:i,dtype:n.dtype}}var Gw={kernelName:Gn,backendName:"cpu",kernelFunc:vt};function Vx(r){let{inputs:t,backend:e,attrs:o}=r,{a:n,b:s}=t,{transposeA:a,transposeB:i}=o;U([n,s],"matMul");let p=n.shape.length,c=s.shape.length,l=a?n.shape[p-2]:n.shape[p-1],u=i?s.shape[c-1]:s.shape[c-2],m=a?n.shape[p-1]:n.shape[p-2],f=i?s.shape[c-2]:s.shape[c-1],d=n.shape.slice(0,-2),g=s.shape.slice(0,-2),h=y.sizeFromShape(d),x=y.sizeFromShape(g),S=Ke.assertAndGetBroadcastShape(n.shape.slice(0,-2),s.shape.slice(0,-2)).concat([m,f]);y.assert(l===u,()=>`Error in matMul: inner shapes (${l}) and (${u}) of Tensors with shapes ${n.shape} and ${s.shape} and transposeA=${a} and transposeB=${i} must match.`);let w=a?[h,l,m]:[h,m,l],E=i?[x,f,u]:[x,u,f],$=vt({inputs:{x:n},backend:e,attrs:{shape:w}}),D=vt({inputs:{x:s},backend:e,attrs:{shape:E}}),F=a?$.shape[1]:$.shape[2],P=a?$.shape[2]:$.shape[1],L=i?D.shape[1]:D.shape[2],M=Math.max(h,x),B=e.data.get($.dataId).values,G=e.data.get(D.dataId).values,z=y.computeStrides($.shape),V=y.computeStrides(D.shape),[H,q,W]=a?[z[0],1,z[1]]:[z[0],z[1],1],[K,Y,Z]=i?[1,V[1],V[0]]:[V[1],1,V[0]],ot=P*L,Q=pt([M,P,L],$.dtype),at=Q.values,et=e.blockSize;for(let ct=0;ct<M;ct++)for(let ft=0;ft<P;ft+=et)for(let gt=0;gt<L;gt+=et)for(let yt=0;yt<F;yt+=et){let kt=Math.min(ft+et,P),Dt=Math.min(gt+et,L),Vt=Math.min(yt+et,F);for(let qt=ft;qt<kt;qt++)for(let Zt=gt;Zt<Dt;Zt++){let ee=0;for(let zt=yt;zt<Vt;zt++){let se=Math.min(ct,h-1)*H,pe=Math.min(ct,x-1)*Z,an=B[se+qt*q+zt*W],ve=G[zt*K+Zt*Y+pe];ee+=an*ve}at[ct*ot+(qt*L+Zt)]+=ee}}return e.disposeIntermediateTensorInfo($),e.disposeIntermediateTensorInfo(D),e.makeTensorInfo(S,Q.dtype,Q.values)}var Vw={kernelName:hn,backendName:"cpu",kernelFunc:Vx};function cM(r){let{inputs:t,backend:e,attrs:o}=r,{a:n,b:s,bias:a,preluActivationWeights:i}=t,{transposeA:p,transposeB:c,activation:l,leakyreluAlpha:u}=o,m,f,d,g=[];m=Vx({inputs:{a:n,b:s},attrs:{transposeA:p,transposeB:c},backend:e}),a&&(f=en({inputs:{a:m,b:a},backend:e}),g.push(m),m=f),l&&(d=ap(e,m,l,i,u),g.push(m),m=d);for(let x of g)e.disposeIntermediateTensorInfo(x);return m}var zw={kernelName:Hs,backendName:"cpu",kernelFunc:cM};var lM=ht(ao,r=>Math.acos(r)),Ww={kernelName:ao,backendName:"cpu",kernelFunc:lM};var uM=ht(io,r=>Math.acosh(r)),Uw={kernelName:io,backendName:"cpu",kernelFunc:uM};function mM(r){let{inputs:t,backend:e}=r,o=t;U(t,"addN");let n=o.map(i=>e.data.get(i.dataId).values),s=pt(o[0].shape,o[0].dtype),a=s.values;for(let i=0;i<o.length;i++){let p=n[i];for(let c=0;c<a.length;c++)a[c]+=p[c]}return e.makeTensorInfo(s.shape,s.dtype,s.values)}var Hw={kernelName:ln,backendName:"cpu",kernelFunc:mM};function fM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s,keepDims:a}=o;U(n,"all");let i=y.parseAxisParam(s,n.shape),p=i,c=I.getAxesPermutation(p,n.shape.length),l=n;c!=null&&(l=jt({inputs:{x:n},backend:e,attrs:{perm:c}}),p=I.getInnerMostAxes(p.length,n.shape.length)),I.assertAxesAreInnerMostDims("all",p,l.shape.length);let[u,m]=I.computeOutAndReduceShapes(l.shape,p),f=y.sizeFromShape(m),d=y.makeZerosTypedArray(y.sizeFromShape(u),l.dtype),g=e.data.get(l.dataId).values;for(let x=0;x<d.length;++x){let b=x*f,S=g[b];for(let w=0;w<f;++w){let E=g[b+w];S=S&&E}d[x]=S}c!=null&&e.disposeIntermediateTensorInfo(l);let h=e.makeTensorInfo(u,l.dtype,d);if(a){let x=I.expandShapeToKeepDim(u,i),b=vt({inputs:{x:h},backend:e,attrs:{shape:x}});return e.disposeIntermediateTensorInfo(h),b}return h}var qw={kernelName:"All",backendName:"cpu",kernelFunc:fM};function dM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s,keepDims:a}=o;U(n,"any");let i=y.parseAxisParam(s,n.shape),p=i,c=I.getAxesPermutation(p,n.shape.length),l=n;c!=null&&(l=jt({inputs:{x:n},backend:e,attrs:{perm:c}}),p=I.getInnerMostAxes(p.length,n.shape.length)),I.assertAxesAreInnerMostDims("any",p,l.shape.length);let[u,m]=I.computeOutAndReduceShapes(l.shape,p),f=y.sizeFromShape(m),d=y.makeZerosTypedArray(y.sizeFromShape(u),l.dtype),g=e.data.get(l.dataId).values;for(let x=0;x<d.length;++x){let b=x*f,S=g[b];for(let w=0;w<f;++w){let E=g[b+w];S=S||E}d[x]=S}c!=null&&e.disposeIntermediateTensorInfo(l);let h=e.makeTensorInfo(u,l.dtype,d);if(a){let x=I.expandShapeToKeepDim(u,i),b=vt({inputs:{x:h},backend:e,attrs:{shape:x}});return e.disposeIntermediateTensorInfo(h),b}return h}var Kw={kernelName:"Any",backendName:"cpu",kernelFunc:dM};function hM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s}=o;U(n,"argMax");let a=y.parseAxisParam(s,n.shape),i=I.getAxesPermutation(a,n.shape.length),p=n,c=[];i!=null&&(p=jt({inputs:{x:n},backend:e,attrs:{perm:i}}),c.push(p),a=I.getInnerMostAxes(a.length,p.shape.length)),a=[a[0]],I.assertAxesAreInnerMostDims("argMax",a,p.shape.length);let[l,u]=I.computeOutAndReduceShapes(p.shape,a),m=y.sizeFromShape(l),f=y.makeZerosTypedArray(m,"int32"),d=y.sizeFromShape(u),g=e.data.get(p.dataId).values;for(let h=0;h<f.length;++h){let x=h*d,b=g[x],S=0;for(let w=0;w<d;++w){let E=g[x+w];E>b&&(b=E,S=w)}f[h]=S}return c.forEach(h=>e.disposeIntermediateTensorInfo(h)),e.makeTensorInfo(l,"int32",f)}var Xw={kernelName:un,backendName:"cpu",kernelFunc:hM};function gM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s}=o;U(n,"argMin");let a=y.parseAxisParam(s,n.shape),i=I.getAxesPermutation(a,n.shape.length),p=n,c=[];i!=null&&(p=jt({inputs:{x:n},backend:e,attrs:{perm:i}}),c.push(p),a=I.getInnerMostAxes(a.length,p.shape.length)),a=[a[0]],I.assertAxesAreInnerMostDims("argMin",a,p.shape.length);let[l,u]=I.computeOutAndReduceShapes(p.shape,a),m=y.sizeFromShape(l),f=y.makeZerosTypedArray(m,"int32"),d=y.sizeFromShape(u),g=e.data.get(p.dataId).values;for(let h=0;h<f.length;++h){let x=h*d,b=g[x],S=0;for(let w=0;w<d;++w){let E=g[x+w];E<b&&(b=E,S=w)}f[h]=S}return c.forEach(h=>e.disposeIntermediateTensorInfo(h)),e.makeTensorInfo(l,"int32",f)}var jw={kernelName:mn,backendName:"cpu",kernelFunc:gM};var xM=ht(co,r=>Math.asin(r)),Yw={kernelName:co,backendName:"cpu",kernelFunc:xM};var yM=ht(lo,r=>Math.asinh(r)),Zw={kernelName:lo,backendName:"cpu",kernelFunc:yM};var bM=ht(uo,r=>Math.atan(r)),Qw={kernelName:uo,backendName:"cpu",kernelFunc:bM};var CM=Et((r,t)=>Math.atan2(r,t)),TM=Ft(fo,CM),Jw={kernelName:fo,backendName:"cpu",kernelFunc:TM};var SM=ht(mo,r=>Math.atanh(r)),tN={kernelName:mo,backendName:"cpu",kernelFunc:SM};function tc(r,t,e,o,n,s){let a=n.strideHeight,i=n.strideWidth,p=n.dilationHeight,c=n.dilationWidth,l=n.effectiveFilterHeight,u=n.effectiveFilterWidth,m=n.padInfo.top,f=n.padInfo.left,d=s==="max"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,g=pt(n.outShape,e),h=g.values,x=n.outShape[1]*n.outShape[2]*n.outShape[3],b=n.outShape[2]*n.outShape[3],S=n.outShape[3];for(let w=0;w<n.batchSize;++w){let E=w*x,$=w*o[0];for(let D=0;D<n.inChannels;++D)for(let F=0;F<n.outHeight;++F){let P=F*a-m,L=Math.max(0,P),M=Math.min(n.inHeight,l+P),B=E+F*b;for(let G=0;G<n.outWidth;++G){let z=G*i-f,V=Math.max(0,z),H=Math.min(n.inWidth,u+z),q=d,W=0,K=0;for(let Z=L;Z<M;Z+=p){let ot=$+Z*o[1];for(let Q=V;Q<H;Q+=c){let at=ot+Q*o[2],et=r[at+D];s==="max"&&et>q?q=et:s==="avg"&&(W+=et,K++)}if(isNaN(q))break}let Y=B+G*S+D;h[Y]=s==="avg"?W/K:q}}}return g}function Em(r,t,e,o,n=!1,s=!1){let a=pt(o.outShape,"int32"),i=o.strideHeight,p=o.strideWidth,c=o.dilationHeight,l=o.dilationWidth,u=o.effectiveFilterHeight,m=o.effectiveFilterWidth,f=o.padInfo.top,d=o.padInfo.left,g=pt(t,e,r);for(let h=0;h<o.batchSize;++h)for(let x=0;x<o.inChannels;++x)for(let b=0;b<o.outHeight;++b){let S=b*i-f,w=S;for(;w<0;)w+=c;let E=Math.min(o.inHeight,u+S);for(let $=0;$<o.outWidth;++$){let D=$*p-d,F=D;for(;F<0;)F+=l;let P=Math.min(o.inWidth,m+D),L=Number.NEGATIVE_INFINITY,M=-1;for(let B=w;B<E;B+=c){let G=B-S;for(let z=F;z<P;z+=l){let V=z-D,H=g.get(h,B,z,x);H>L&&(L=H,n?M=s?((h*o.inHeight+B)*o.inWidth+z)*o.inChannels+x:(B*o.inWidth+z)*o.inChannels+x:M=G*m+V)}}a.set(M,h,b,$,x)}}return a}function $m(r,t,e,o,n,s){let a=n.strideDepth,i=n.strideHeight,p=n.strideWidth,c=n.dilationDepth,l=n.dilationHeight,u=n.dilationWidth,m=n.effectiveFilterDepth,f=n.effectiveFilterHeight,d=n.effectiveFilterWidth,g=n.padInfo.front,h=n.padInfo.top,x=n.padInfo.left,b=s==="max"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,S=pt(n.outShape,e),w=S.values,E=n.outShape[1]*n.outShape[2]*n.outShape[3]*n.outShape[4],$=n.outShape[2]*n.outShape[3]*n.outShape[4],D=n.outShape[3]*n.outShape[4],F=n.outShape[4];for(let P=0;P<n.batchSize;++P){let L=P*E,M=P*o[0];for(let B=0;B<n.inChannels;++B)for(let G=0;G<n.outDepth;++G){let z=G*a-g,V=z;for(;V<0;)V+=c;let H=Math.min(n.inDepth,m+z),q=L+G*$;for(let W=0;W<n.outHeight;++W){let K=W*i-h,Y=K;for(;Y<0;)Y+=l;let Z=Math.min(n.inHeight,f+K),ot=q+W*D;for(let Q=0;Q<n.outWidth;++Q){let at=Q*p-x,et=at;for(;et<0;)et+=u;let ct=Math.min(n.inWidth,d+at),ft=ot+Q*F,gt=b,yt=0,kt=0;for(let Vt=V;Vt<H;Vt+=c){let qt=M+Vt*o[1];for(let Zt=Y;Zt<Z;Zt+=l){let ee=qt+Zt*o[2];for(let zt=et;zt<ct;zt+=u){let se=ee+zt*o[3],pe=r[se+B];if(s==="max"&&pe>gt?gt=pe:s==="avg"&&(yt+=pe,kt++),isNaN(gt))break}if(isNaN(gt))break}if(isNaN(gt))break}let Dt=ft+B;w[Dt]=s==="avg"?yt/kt:gt}}}}return S}function eN(r,t){let e=pt(t.outShape,"int32"),o=t.strideDepth,n=t.strideHeight,s=t.strideWidth,a=t.dilationDepth,i=t.dilationHeight,p=t.dilationWidth,c=t.effectiveFilterDepth,l=t.effectiveFilterHeight,u=t.effectiveFilterWidth,m=t.padInfo.front,f=t.padInfo.top,d=t.padInfo.left;for(let g=0;g<t.batchSize;++g)for(let h=0;h<t.inChannels;++h)for(let x=0;x<t.outDepth;++x){let b=x*o-m,S=b;for(;S<0;)S+=a;let w=Math.min(t.inDepth,c+b);for(let E=0;E<t.outHeight;++E){let $=E*n-f,D=$;for(;D<0;)D+=i;let F=Math.min(t.inHeight,l+$);for(let P=0;P<t.outWidth;++P){let L=P*s-d,M=L;for(;M<0;)M+=p;let B=Math.min(t.inWidth,u+L),G=Number.NEGATIVE_INFINITY,z=-1;for(let V=S;V<w;V+=a){let H=V-b;for(let q=D;q<F;q+=i){let W=q-$;for(let K=M;K<B;K+=p){let Y=K-L,Z=r.get(g,V,q,K,h);Z>=G&&(G=Z,z=H*l*u+W*l+Y)}}}e.set(z,g,x,E,P,h)}}}return e}function wM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t;U(n,"avgPool");let{filterSize:s,strides:a,pad:i,dimRoundingMode:p}=o,c=1;y.assert(I.eitherStridesOrDilationsAreOne(a,c),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${a} and dilations '${c}'`);let l=I.computePool2DInfo(n.shape,s,a,c,i,p),u;if(l.filterWidth===1&&l.filterHeight===1&&y.arraysEqual(l.inShape,l.outShape))u=De({inputs:{x:n},backend:e});else{let m=e.data.get(n.dataId).values,f=y.computeStrides(n.shape),d=tc(m,n.shape,n.dtype,f,l,"avg");u=e.makeTensorInfo(l.outShape,n.dtype,d.values)}return u}var rN={kernelName:fn,backendName:"cpu",kernelFunc:wM};function NM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{filterSize:s,strides:a,pad:i,dimRoundingMode:p,dataFormat:c}=o;U(n,"avgPool3d");let l=I.computePool3DInfo(n.shape,s,a,1,i,p,c),u=e.data.get(n.dataId).values,m=$m(u,n.shape,n.dtype,y.computeStrides(n.shape),l,"avg");return e.makeTensorInfo(m.shape,"float32",m.values)}var oN={kernelName:dn,backendName:"cpu",kernelFunc:NM};function vM(r){let{inputs:t,backend:e,attrs:o}=r,{dy:n,input:s}=t,{filterSize:a,strides:i,pad:p,dimRoundingMode:c}=o;U([n,s],"avgPool3DGrad");let l=I.computePool3DInfo(s.shape,a,i,1,p,c),u=l.strideDepth,m=l.strideHeight,f=l.strideWidth,d=l.filterDepth,g=l.filterHeight,h=l.filterWidth,x=l.dilationDepth,b=l.dilationHeight,S=l.dilationWidth,w=l.effectiveFilterDepth,E=l.effectiveFilterHeight,$=l.effectiveFilterWidth,D=w-1-l.padInfo.front,F=$-1-l.padInfo.left,P=E-1-l.padInfo.top,L=pt(s.shape,"float32"),M=1/(d*g*h),B=e.bufferSync(n);for(let G=0;G<l.batchSize;++G)for(let z=0;z<l.inChannels;++z)for(let V=0;V<l.inDepth;++V)for(let H=0;H<l.inHeight;++H)for(let q=0;q<l.inWidth;++q){let W=V-D,K=H-P,Y=q-F,Z=0;for(let ot=0;ot<w;ot+=x){let Q=(W+ot)/u;if(!(Q<0||Q>=l.outDepth||Math.floor(Q)!==Q))for(let at=0;at<E;at+=b){let et=(K+at)/m;if(!(et<0||et>=l.outHeight||Math.floor(et)!==et))for(let ct=0;ct<$;ct+=S){let ft=(Y+ct)/f;if(ft<0||ft>=l.outWidth||Math.floor(ft)!==ft)continue;let gt=B.get(G,Q,et,ft,z);Z+=gt}}}L.set(Z*M,G,V,H,q,z)}return e.makeTensorInfo(L.shape,L.dtype,L.values)}var nN={kernelName:ya,backendName:"cpu",kernelFunc:vM};function IM(r){let{inputs:t,backend:e,attrs:o}=r,{dy:n,input:s}=t,a=s;U([n,s],"avgPoolGrad");let{filterSize:i,strides:p,pad:c}=o,l=I.computePool2DInfo(a.shape,i,p,1,c),u=l.strideHeight,m=l.strideWidth,f=l.filterHeight,d=l.filterWidth,g=l.dilationHeight,h=l.dilationWidth,x=l.effectiveFilterHeight,b=l.effectiveFilterWidth,S=b-1-l.padInfo.left,w=x-1-l.padInfo.top,E=pt(a.shape,"float32"),$=1/(f*d),D=e.data.get(n.dataId).values,F=pt(n.shape,"float32",D);for(let P=0;P<l.batchSize;++P)for(let L=0;L<l.inChannels;++L)for(let M=0;M<l.inHeight;++M)for(let B=0;B<l.inWidth;++B){let G=M-w,z=B-S,V=0;for(let H=0;H<x;H+=g){let q=(G+H)/u;if(!(q<0||q>=l.outHeight||Math.floor(q)!==q))for(let W=0;W<b;W+=h){let K=(z+W)/m;if(K<0||K>=l.outWidth||Math.floor(K)!==K)continue;let Y=F.get(P,q,K,L);V+=Y}}E.set(V*$,P,M,B,L)}return e.makeTensorInfo(E.shape,E.dtype,E.values)}var sN={kernelName:xa,backendName:"cpu",kernelFunc:IM};function kM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,scale:s,offset:a,mean:i,variance:p}=t;y.assert(i.shape.length===p.shape.length,()=>"Batch normalization gradient requires mean and variance to have equal ranks."),y.assert(a==null||i.shape.length===a.shape.length,()=>"Batch normalization gradient requires mean and offset to have equal ranks."),y.assert(s==null||i.shape.length===s.shape.length,()=>"Batch normalization gradient requires mean and scale to have equal ranks."),U([n,i,p,s,a],"batchNorm");let{varianceEpsilon:c}=o;c==null&&(c=.001);let l=e.data.get(n.dataId).values,u=e.data.get(i.dataId).values,m=e.data.get(p.dataId).values,f=s?e.data.get(s.dataId).values:new Float32Array([1]),d=a?e.data.get(a.dataId).values:new Float32Array([0]),g=new Float32Array(l.length),h=d.length,x=f.length,b=m.length,S=u.length,w=0,E=0,$=0,D=0;for(let F=0;F<l.length;++F)g[F]=d[w++]+(l[F]-u[E++])*f[$++]/Math.sqrt(m[D++]+c),w>=h&&(w=0),E>=S&&(E=0),$>=x&&($=0),D>=b&&(D=0);return e.makeTensorInfo(n.shape,n.dtype,g)}var aN={kernelName:kn,backendName:"cpu",kernelFunc:kM};function EM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{blockShape:s,crops:a}=o;U([n],"batchToSpaceND");let i=s.reduce((x,b)=>x*b),p=I.getReshaped(n.shape,s,i),c=I.getPermuted(p.length,s.length),l=I.getReshapedPermuted(n.shape,s,i),u=I.getSliceBeginCoords(a,s.length),m=I.getSliceSize(l,a,s.length),f=vt({inputs:{x:n},backend:e,attrs:{shape:p}}),d=jt({inputs:{x:f},backend:e,attrs:{perm:c}}),g=vt({inputs:{x:d},backend:e,attrs:{shape:l}}),h=_r({inputs:{x:g},backend:e,attrs:{begin:u,size:m}});return e.disposeIntermediateTensorInfo(f),e.disposeIntermediateTensorInfo(d),e.disposeIntermediateTensorInfo(g),h}var iN={kernelName:gn,backendName:"cpu",kernelFunc:EM};function $M(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,weights:s}=t,{size:a}=o,i=e.data.get(n.dataId).values,p=e.data.get(s.dataId).values,c=Zp(i,p,s.dtype,s.shape,a);return e.makeTensorInfo([a],s.dtype,c)}var pN={kernelName:ba,backendName:"cpu",kernelFunc:$M};function AM(r){let{inputs:t,backend:e}=r,{s0:o,s1:n}=t,s=e.data.get(o.dataId).values,a=e.data.get(n.dataId).values,i=I.assertAndGetBroadcastShape(Array.from(s),Array.from(a));return e.makeTensorInfo([i.length],"int32",Int32Array.from(i))}var cN={kernelName:Ca,backendName:"cpu",kernelFunc:AM};var DM=ht(go,(r,t)=>{let e=t;return r>e.clipValueMax?e.clipValueMax:r<e.clipValueMin?e.clipValueMin:r}),lN={kernelName:go,backendName:"cpu",kernelFunc:DM};var RM=r=>{let{x:t}=r.inputs,e=r.backend,o=new Float32Array(y.sizeFromShape(t.shape)),n=e.data.get(t.dataId),s=n.complexTensorInfos.real,a=n.complexTensorInfos.imag,i=e.data.get(s.dataId).values,p=e.data.get(a.dataId).values;for(let c=0;c<i.length;c++){let l=i[c],u=p[c];o[c]=Math.hypot(l,u)}return e.makeOutput(o,t.shape,"float32")},uN={kernelName:xn,backendName:"cpu",kernelFunc:RM};function rn(r){let{inputs:t,backend:e}=r,{input:o}=t,n=e.data.get(o.dataId).complexTensorInfos.imag,s=e.data.get(n.dataId).values;return e.makeTensorInfo(n.shape,n.dtype,s)}var mN={kernelName:Ma,backendName:"cpu",kernelFunc:rn};function pa(r){let{inputs:t,backend:e,attrs:o}=r,{axis:n}=o,s=y.parseAxisParam(n,t[0].shape)[0],a=t.map(g=>g.shape);I.assertParamsConsistent(a,s);let i=I.computeOutShape(t.map(g=>g.shape),s);if(y.sizeFromShape(i)===0)return e.makeTensorInfo(i,t[0].dtype,[]);let p=t.filter(g=>y.sizeFromShape(g.shape)>0);if(p.length===1)return De({inputs:{x:p[0]},backend:e});if(p[0].dtype==="complex64"){let g=p.map(w=>Ar({inputs:{input:w},backend:e})),h=p.map(w=>rn({inputs:{input:w},backend:e})),x=pa({inputs:g,backend:e,attrs:{axis:s}}),b=pa({inputs:h,backend:e,attrs:{axis:s}}),S=he({inputs:{real:x,imag:b},backend:e});return g.forEach(w=>e.disposeIntermediateTensorInfo(w)),h.forEach(w=>e.disposeIntermediateTensorInfo(w)),e.disposeIntermediateTensorInfo(x),e.disposeIntermediateTensorInfo(b),S}let c=p.map(g=>{let x=[-1,y.sizeFromShape(g.shape.slice(s))];return vt({inputs:{x:g},backend:e,attrs:{shape:x}})}),l=c.map(g=>({vals:e.data.get(g.dataId).values,shape:g.shape}));i=I.computeOutShape(c.map(g=>g.shape),1);let u=c[0].shape[0]===1,m=um(l,i,t[0].dtype,u),f=I.computeOutShape(p.map(g=>g.shape),s),d=e.makeTensorInfo(f,t[0].dtype,m);return c.forEach(g=>e.disposeIntermediateTensorInfo(g)),d}var fN={kernelName:yn,backendName:"cpu",kernelFunc:pa};function zx(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,filter:s}=t,{strides:a,pad:i,dataFormat:p,dilations:c,dimRoundingMode:l}=o;U([n,s],"conv2d");let u=I.convertConv2DDataFormat(p),m=I.computeConv2DInfo(n.shape,s.shape,a,c,i,l,!1,u),f=m.filterHeight,d=m.filterWidth,g=m.dilationHeight,h=m.dilationWidth,x=m.padInfo.left,b=m.padInfo.top,S=m.dataFormat==="channelsLast",w=new _t(m.outShape,n.dtype),E=y.computeStrides(n.shape),$=y.computeStrides(s.shape),D=E[0],F=S?E[1]:E[2],P=S?E[2]:1,L=S?1:E[1],M=w.strides[0],B=S?w.strides[1]:w.strides[2],G=S?w.strides[2]:1,z=S?1:w.strides[1],V=e.data.get(n.dataId).values,H=e.data.get(s.dataId).values,q=w.values;for(let W=0;W<m.batchSize;++W){let K=W*D,Y=W*M;for(let Z=0;Z<m.outHeight;++Z){let ot=Y+Z*B,Q=Z*m.strideHeight-b;for(let at=0;at<f;++at){let et=Q+at*g;if(et<0||et>=m.inHeight)continue;let ct=at*$[0],ft=K+et*F;for(let gt=0;gt<m.outWidth;++gt){let yt=ot+gt*G,kt=gt*m.strideWidth-x;for(let Dt=0;Dt<d;++Dt){let Vt=kt+Dt*h;if(Vt<0||Vt>=m.inWidth)continue;let qt=ct+Dt*$[1],Zt=ft+Vt*P,ee=qt;for(let zt=0;zt<m.inChannels;++zt){let se=V[Zt+zt*L];for(let pe=0;pe<m.outChannels;++pe)q[yt+pe*z]+=se*H[ee+pe];ee+=m.outChannels}}}}}}return e.makeTensorInfo(w.shape,w.dtype,q)}var dN={kernelName:bn,backendName:"cpu",kernelFunc:zx};function FM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,dy:s}=t,{strides:a,pad:i,dataFormat:p,dimRoundingMode:c,filterShape:l}=o;U([n,s],"conv2dBackpropFilter");let u=I.convertConv2DDataFormat(p),m=I.computeConv2DInfo(n.shape,l,a,1,i,c,!1,u),{strideHeight:f,strideWidth:d,filterHeight:g,filterWidth:h}=m,x=m.dataFormat==="channelsLast",b=new _t(m.filterShape,"float32"),S=m.padInfo.left,w=m.padInfo.top,E=e.data.get(n.dataId).values,$=e.data.get(s.dataId).values,D=new _t(n.shape,n.dtype,E),F=new _t(s.shape,s.dtype,$);for(let P=0;P<g;++P){let L=Math.max(0,Math.ceil((w-P)/f)),M=Math.min(m.outHeight,(m.inHeight+w-P)/f);for(let B=0;B<h;++B){let G=Math.max(0,Math.ceil((S-B)/d)),z=Math.min(m.outWidth,(m.inWidth+S-B)/d);for(let V=0;V<m.inChannels;++V)for(let H=0;H<m.outChannels;++H){let q=0;for(let W=0;W<m.batchSize;++W)for(let K=L;K<M;++K){let Y=P+K*f-w;for(let Z=G;Z<z;++Z){let ot=B+Z*d-S;x?q+=D.get(W,Y,ot,V)*F.get(W,K,Z,H):q+=D.get(W,V,Y,ot)*F.get(W,H,K,Z)}}b.set(q,P,B,V,H)}}}return e.makeTensorInfo(b.shape,b.dtype,b.values)}var hN={kernelName:Sa,backendName:"cpu",kernelFunc:FM};function _M(r){let{inputs:t,backend:e,attrs:o}=r,{dy:n,filter:s}=t,{inputShape:a,strides:i,pad:p,dataFormat:c,dimRoundingMode:l}=o;U([n,s],"conv2dBackpropInput");let u=y.computeStrides(s.shape),m=y.computeStrides(n.shape),f=I.convertConv2DDataFormat(c),d=I.computeConv2DInfo(a,s.shape,i,1,p,l,!1,f),g=new _t(d.inShape,"float32"),h=g.values,x=e.data.get(n.dataId).values,b=e.data.get(s.dataId).values,[S,w,E]=u,{batchSize:$,filterHeight:D,filterWidth:F,inChannels:P,inHeight:L,inWidth:M,outChannels:B,outHeight:G,outWidth:z,strideHeight:V,strideWidth:H}=d;f=d.dataFormat;let q=D-1-d.padInfo.top,W=F-1-d.padInfo.left,K=f==="channelsLast",Y=g.strides[0],Z=K?g.strides[1]:g.strides[2],ot=K?g.strides[2]:1,Q=K?1:g.strides[1],at=m[0],et=K?m[1]:m[2],ct=K?m[2]:1,ft=K?1:m[1];for(let gt=0;gt<$;++gt)for(let yt=0;yt<P;++yt)for(let kt=0;kt<L;++kt){let Dt=kt-q,Vt=Math.max(0,Math.ceil(Dt/V)),qt=Math.min(G,(D+Dt)/V);for(let Zt=0;Zt<M;++Zt){let ee=Zt-W,zt=Math.max(0,Math.ceil(ee/H)),se=Math.min(z,(F+ee)/H),pe=0;for(let ve=Vt;ve<qt;++ve){let Ss=ve*V-Dt;for(let cr=zt;cr<se;++cr){let da=cr*H-ee,Mr=at*gt+et*ve+ct*cr,pn=S*(D-1-Ss)+w*(F-1-da)+E*yt;for(let ws=0;ws<B;++ws){let Ns=x[Mr+ft*ws],vs=b[pn+ws];pe+=Ns*vs}}}let an=Y*gt+Z*kt+ot*Zt+Q*yt;h[an]=pe}}return e.makeTensorInfo(g.shape,g.dtype,g.values)}var gN={kernelName:Cn,backendName:"cpu",kernelFunc:_M};function OM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,filter:s}=t,{strides:a,pad:i,dilations:p}=o;U([n,s],"conv3d");let c=I.computeConv3DInfo(n.shape,s.shape,a,p,i),{filterDepth:l,filterHeight:u,filterWidth:m,dilationDepth:f,dilationHeight:d,dilationWidth:g,padInfo:h}=c,x=h.front,b=h.left,S=h.top,w=new _t(c.outShape,n.dtype),E=e.data.get(n.dataId).values,$=e.data.get(s.dataId).values,D=w.values,F=y.computeStrides(n.shape),P=y.computeStrides(s.shape);for(let L=0;L<c.batchSize;++L){let M=L*F[0],B=L*w.strides[0];for(let G=0;G<c.outDepth;++G){let z=B+G*w.strides[1],V=G*c.strideDepth-x;for(let H=0;H<l;++H){let q=V+H*f;if(q<0||q>=c.inDepth)continue;let W=H*P[0],K=M+q*F[1];for(let Y=0;Y<c.outHeight;++Y){let Z=z+Y*w.strides[2],ot=Y*c.strideHeight-S;for(let Q=0;Q<u;++Q){let at=ot+Q*d;if(at<0||at>=c.inHeight)continue;let et=W+Q*P[1],ct=K+at*F[2];for(let ft=0;ft<c.outWidth;++ft){let gt=Z+ft*c.outChannels,yt=ft*c.strideWidth-b;for(let kt=0;kt<m;++kt){let Dt=yt+kt*g;if(Dt<0||Dt>=c.inWidth)continue;let Vt=et+kt*P[2],qt=ct+Dt*c.inChannels,Zt=Vt;for(let ee=0;ee<c.inChannels;++ee){let zt=E[qt+ee];for(let se=0;se<c.outChannels;++se)D[gt+se]+=zt*$[Zt+se];Zt+=c.outChannels}}}}}}}}return e.makeTensorInfo(w.shape,w.dtype,w.values)}var xN={kernelName:Tn,backendName:"cpu",kernelFunc:OM};function PM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,dy:s}=t,{strides:a,pad:i,filterShape:p}=o;U([n,s],"conv3dBackpropFilterV2");let c=y.computeStrides(n.shape),l=y.computeStrides(s.shape),u=I.computeConv3DInfo(n.shape,p,a,1,i),m=u.strideDepth,f=u.strideHeight,d=u.strideWidth,g=u.filterDepth,h=u.filterHeight,x=u.filterWidth,b=new _t(u.filterShape,"float32"),S=b.values,[w,E,$,D]=b.strides,F=e.data.get(s.dataId).values,[P,L,M,B]=l,G=e.data.get(n.dataId).values,[z,V,H,q]=c,W=u.padInfo.front,K=u.padInfo.left,Y=u.padInfo.top;for(let Z=0;Z<g;++Z){let ot=Math.max(0,Math.ceil((W-Z)/m)),Q=Math.min(u.outDepth,(u.inDepth+W-Z)/m),at=Z*w;for(let et=0;et<h;++et){let ct=Math.max(0,Math.ceil((Y-et)/f)),ft=Math.min(u.outHeight,(u.inHeight+Y-et)/f),gt=et*E+at;for(let yt=0;yt<x;++yt){let kt=Math.max(0,Math.ceil((K-yt)/d)),Dt=Math.min(u.outWidth,(u.inWidth+K-yt)/d),Vt=yt*$+gt;for(let qt=0;qt<u.inChannels;++qt){let Zt=qt*D+Vt;for(let ee=0;ee<u.outChannels;++ee){let zt=0;for(let se=0;se<u.batchSize;++se){let pe=se*z,an=se*P;for(let ve=ot;ve<Q;++ve){let cr=(Z+ve*m-W)*V+pe,da=ve*L+an;for(let Mr=ct;Mr<ft;++Mr){let ws=(et+Mr*f-Y)*H+cr,Ns=Mr*M+da;for(let vs=kt;vs<Dt;++vs){let zd=(yt+vs*d-K)*q+ws,Wd=vs*B+Ns;zt+=G[zd+qt]*F[Wd+ee]}}}}S[Zt+ee]=zt}}}}}return e.makeTensorInfo(b.shape,b.dtype,b.values)}var yN={kernelName:wa,backendName:"cpu",kernelFunc:PM};function LM(r){let{inputs:t,backend:e,attrs:o}=r,{dy:n,filter:s}=t,{pad:a,strides:i,inputShape:p}=o;U([n],"conv3dBackpropInputV2");let c=y.computeStrides(n.shape),l=y.computeStrides(s.shape),u=I.computeConv3DInfo(p,s.shape,i,1,a),m=new _t(u.inShape,"float32"),f=m.values,[d,g,h,x]=m.strides,b=e.data.get(n.dataId).values,[S,w,E,$]=c,D=e.data.get(s.dataId).values,[F,P,L,M]=l,{batchSize:B,filterDepth:G,filterHeight:z,filterWidth:V,inChannels:H,inDepth:q,inHeight:W,inWidth:K,outChannels:Y,outDepth:Z,outHeight:ot,outWidth:Q,strideDepth:at,strideHeight:et,strideWidth:ct}=u,ft=G-1-u.padInfo.front,gt=z-1-u.padInfo.top,yt=V-1-u.padInfo.left;for(let kt=0;kt<B;++kt)for(let Dt=0;Dt<H;++Dt)for(let Vt=0;Vt<q;++Vt){let qt=Vt-ft,Zt=Math.max(0,Math.ceil(qt/at)),ee=Math.min(Z,(G+qt)/at);for(let zt=0;zt<W;++zt){let se=zt-gt,pe=Math.max(0,Math.ceil(se/et)),an=Math.min(ot,(z+se)/et);for(let ve=0;ve<K;++ve){let Ss=ve-yt,cr=Math.max(0,Math.ceil(Ss/ct)),da=Math.min(Q,(V+Ss)/ct),Mr=0;for(let pn=Zt;pn<ee;++pn){let ws=pn*at-qt;for(let Ns=pe;Ns<an;++Ns){let vs=Ns*et-se;for(let Sc=cr;Sc<da;++Sc){let zd=Sc*ct-Ss,Wd=S*kt+w*pn+E*Ns+$*Sc,$A=F*(G-1-ws)+P*(z-1-vs)+L*(V-1-zd)+M*Dt;for(let mu=0;mu<Y;++mu){let AA=b[Wd+mu],DA=D[$A+mu];Mr+=AA*DA}}}}f[d*kt+g*Vt+h*zt+x*ve+Dt]=Mr}}}return e.makeTensorInfo(m.shape,m.dtype,m.values)}var bN={kernelName:Na,backendName:"cpu",kernelFunc:LM};var MM=ht("Cos",r=>Math.cos(r)),CN={kernelName:"Cos",backendName:"cpu",kernelFunc:MM};var BM=ht(xo,r=>Math.cosh(r)),TN={kernelName:xo,backendName:"cpu",kernelFunc:BM};function GM(r){let{inputs:t,backend:e,attrs:o}=r,{image:n,boxes:s,boxInd:a}=t,{cropSize:i,method:p,extrapolationValue:c}=o,[l,u,m,f]=n.shape,d=s.shape[0],[g,h]=i,x=pt([d,g,h,f],"float32"),b=e.data.get(s.dataId).values,S=e.data.get(a.dataId).values,w=e.data.get(n.dataId).values,E=y.computeStrides(n.shape),$=y.computeStrides(x.shape);for(let D=0;D<d;D++){let F=D*4,P=b[F],L=b[F+1],M=b[F+2],B=b[F+3],G=S[D];if(G>=l)continue;let z=g>1?(M-P)*(u-1)/(g-1):0,V=h>1?(B-L)*(m-1)/(h-1):0;for(let H=0;H<g;H++){let q=g>1?P*(u-1)+H*z:.5*(P+M)*(u-1);if(q<0||q>u-1){for(let W=0;W<h;W++)for(let K=0;K<f;K++){let Y=K+W*$[2]+H*$[1]+D*$[0];x.values[Y]=c}continue}if(p==="bilinear"){let W=Math.floor(q),K=Math.ceil(q),Y=q-W;for(let Z=0;Z<h;Z++){let ot=h>1?L*(m-1)+Z*V:.5*(L+B)*(m-1);if(ot<0||ot>m-1){for(let ct=0;ct<f;ct++){let ft=ct+Z*$[2]+H*$[1]+D*$[0];x.values[ft]=c}continue}let Q=Math.floor(ot),at=Math.ceil(ot),et=ot-Q;for(let ct=0;ct<f;ct++){let ft=ct+Q*E[2]+W*E[1]+G*E[0],gt=w[ft];ft=ct+at*E[2]+W*E[1]+G*E[0];let yt=w[ft];ft=ct+Q*E[2]+K*E[1]+G*E[0];let kt=w[ft];ft=ct+at*E[2]+K*E[1]+G*E[0];let Dt=w[ft],Vt=gt+(yt-gt)*et,qt=kt+(Dt-kt)*et;ft=ct+Z*$[2]+H*$[1]+D*$[0],x.values[ft]=Vt+(qt-Vt)*Y}}}else for(let W=0;W<h;++W){let K=h>1?L*(m-1)+W*V:.5*(L+B)*(m-1);if(K<0||K>m-1){for(let ot=0;ot<f;ot++){let Q=ot+W*$[2]+H*$[1]+D*$[0];x.values[Q]=c}continue}let Y=Math.round(K),Z=Math.round(q);for(let ot=0;ot<f;ot++){let Q=ot+Y*E[2]+Z*E[1]+G*E[0],at=ot+W*$[2]+H*$[1]+D*$[0];x.values[at]=w[Q]}}}}return e.makeTensorInfo(x.shape,x.dtype,x.values)}var SN={kernelName:Ia,backendName:"cpu",kernelFunc:GM};function VM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s,exclusive:a,reverse:i}=o;U(n,"cumprod");let p=I.getAxesPermutation([s],n.shape.length),c=n;p!=null&&(c=jt({inputs:{x:n},backend:e,attrs:{perm:p}}));let l=I.getInnerMostAxes(1,n.shape.length)[0];if(l!==c.shape.length-1)throw new Error(`backend.cumprod in CPU expects an inner-most axis=${c.shape.length-1} but got axis=${l}`);let u=ne(c.dtype,"int32"),m=y.makeOnesTypedArray(y.sizeFromShape(c.shape),u),f=e.data.get(c.dataId).values,d=c.shape[c.shape.length-1],g=i?(x,b)=>x+d-b-1:(x,b)=>x+b;for(let x=0;x<f.length;x+=d)for(let b=0;b<d;b++){let S=g(x,b);if(b===0)m[S]=a?1:f[S];else{let w=g(x,b-1);m[S]=a?f[w]*m[w]:f[S]*m[w]}}let h=e.makeTensorInfo(c.shape,u,m);if(p!=null){let x=I.getUndoAxesPermutation(p),b=jt({inputs:{x:h},backend:e,attrs:{perm:x}});return e.disposeIntermediateTensorInfo(h),e.disposeIntermediateTensorInfo(c),b}return h}var wN={kernelName:va,backendName:"cpu",kernelFunc:VM};function zM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s,exclusive:a,reverse:i}=o;U(n,"cumsum");let p=I.getAxesPermutation([s],n.shape.length),c=n;p!=null&&(c=jt({inputs:{x:n},backend:e,attrs:{perm:p}}));let l=I.getInnerMostAxes(1,n.shape.length)[0];if(l!==c.shape.length-1)throw new Error(`backend.cumsum in CPU expects an inner-most axis=${c.shape.length-1} but got axis=${l}`);let u=ne(c.dtype,"int32"),m=y.makeZerosTypedArray(y.sizeFromShape(c.shape),u),f=e.data.get(c.dataId).values,d=c.shape[c.shape.length-1],g=i?(x,b)=>x+d-b-1:(x,b)=>x+b;for(let x=0;x<f.length;x+=d)for(let b=0;b<d;b++){let S=g(x,b);if(b===0)m[S]=a?0:f[S];else{let w=g(x,b-1);m[S]=a?f[w]+m[w]:f[S]+m[w]}}let h=e.makeTensorInfo(c.shape,u,m);if(p!=null){let x=I.getUndoAxesPermutation(p),b=jt({inputs:{x:h},backend:e,attrs:{perm:x}});return e.disposeIntermediateTensorInfo(h),e.disposeIntermediateTensorInfo(c),b}return h}var NN={kernelName:Sn,backendName:"cpu",kernelFunc:zM};function WM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,weights:s}=t,{size:a,binaryOutput:i}=o;if(n.shape.length===1){let p=e.data.get(n.dataId).values,c=e.data.get(s.dataId).values,l=Zp(p,c,s.dtype,s.shape,a);return e.makeTensorInfo([a],s.dtype,l)}else if(n.shape.length===2){let p=e.bufferSync(n),c=e.bufferSync(s),l=lm(p,c,a,i);return e.makeTensorInfo(l.shape,s.dtype,l.values)}throw new Error(`Error in denseBincount: input must be at most rank 2, but got rank${n.shape.length}.`)}var vN={kernelName:ka,backendName:"cpu",kernelFunc:WM};function UM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{blockSize:s,dataFormat:a}=o;y.assert(a==="NHWC",()=>`Only NHWC dataFormat supported on CPU for depthToSpace. Got ${a}`);let i=n.shape[0],p=n.shape[1],c=n.shape[2],l=n.shape[3],u=p*s,m=c*s,f=l/(s*s),d=e.data.get(n.dataId).values,g=new Float32Array(i*u*m*f),h=0;for(let x=0;x<i;++x)for(let b=0;b<u;++b){let S=Math.floor(b/s),w=b%s;for(let E=0;E<m;++E){let $=Math.floor(E/s),D=E%s,F=(w*s+D)*f;for(let P=0;P<f;++P){let M=P+F+l*($+c*(S+p*x));g[h++]=d[M]}}}return e.makeTensorInfo([i,u,m,f],n.dtype,g)}var IN={kernelName:Ea,backendName:"cpu",kernelFunc:UM};function Wx(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,filter:s}=t,{strides:a,pad:i,dilations:p,dimRoundingMode:c}=o;U([n,s],"depthwiseConv2DNative");let l=y.computeStrides(n.shape),u=y.computeStrides(s.shape),m=p;m==null&&(m=[1,1]),y.assert(I.eitherStridesOrDilationsAreOne(a,m),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${a} and dilations '${m}'`);let f=I.computeConv2DInfo(n.shape,s.shape,a,m,i,c,!0),{filterHeight:d,filterWidth:g,dilationHeight:h,dilationWidth:x,padInfo:b}=f,S=b.left,w=b.top,E=f.outChannels/f.inChannels,$=new _t(f.outShape,n.dtype),D=e.data.get(n.dataId).values,F=e.data.get(s.dataId).values,P=$.values;for(let L=0;L<f.batchSize;++L){let M=L*l[0],B=L*$.strides[0];for(let G=0;G<f.outHeight;++G){let z=B+G*$.strides[1],V=G*f.strideHeight-w;for(let H=0;H<d;++H){let q=V+H*h;if(q<0||q>=f.inHeight)continue;let W=H*u[0],K=M+q*l[1];for(let Y=0;Y<f.outWidth;++Y){let Z=z+Y*$.strides[2],ot=Y*f.strideWidth-S;for(let Q=0;Q<g;++Q){let at=ot+Q*x;if(at<0||at>=f.inWidth)continue;let et=W+Q*u[1],ct=K+at*f.inChannels,ft=Z,gt=et;for(let yt=0;yt<f.inChannels;++yt){let kt=D[ct+yt];for(let Dt=0;Dt<E;++Dt)P[ft+Dt]+=kt*F[gt+Dt];ft+=E,gt+=E}}}}}}return e.makeTensorInfo($.shape,$.dtype,$.values)}var kN={kernelName:wn,backendName:"cpu",kernelFunc:Wx};function HM(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,dy:s}=t,{strides:a,dilations:i,pad:p,dimRoundingMode:c,filterShape:l}=o;U([n,s],"depthwiseConv2dNativeBackpropFilter");let u=I.computeConv2DInfo(n.shape,l,a,i,p,c,!0),{strideHeight:m,strideWidth:f,filterHeight:d,filterWidth:g}=u,h=new _t(u.filterShape,"float32"),x=u.padInfo.left,b=u.padInfo.top,S=u.outChannels/u.inChannels,w=e.data.get(n.dataId).values,E=new _t(n.shape,n.dtype,w),$=e.data.get(s.dataId).values,D=new _t(s.shape,s.dtype,$);for(let F=0;F<d;++F){let P=Math.max(0,Math.ceil((b-F)/m)),L=Math.min(u.outHeight,(u.inHeight+b-F)/m);for(let M=0;M<g;++M){let B=Math.max(0,Math.ceil((x-M)/f)),G=Math.min(u.outWidth,(u.inWidth+x-M)/f);for(let z=0;z<u.outChannels;++z){let V=Math.trunc(z/S),H=z%S,q=0;for(let W=0;W<u.batchSize;++W)for(let K=P;K<L;++K){let Y=F+K*m-b;for(let Z=B;Z<G;++Z){let ot=M+Z*f-x;q+=E.get(W,Y,ot,V)*D.get(W,K,Z,z)}}h.set(q,F,M,V,H)}}}return e.makeTensorInfo(h.shape,h.dtype,h.values)}var EN={kernelName:$a,backendName:"cpu",kernelFunc:HM};function qM(r){let{inputs:t,backend:e,attrs:o}=r,{dy:n,filter:s}=t,{strides:a,dilations:i,pad:p,dimRoundingMode:c,inputShape:l}=o;U([n,s],"depthwiseConv2DNativeBackpropInput");let u=y.computeStrides(n.shape),m=y.computeStrides(s.shape),f=I.computeConv2DInfo(l,s.shape,a,i,p,c,!0),d=new _t(f.inShape,"float32"),g=d.values,[h,x,b]=d.strides,S=e.data.get(n.dataId).values,[w,E,$]=u,D=e.data.get(s.dataId).values,[F,P,L]=m,{batchSize:M,filterHeight:B,filterWidth:G,inChannels:z,inHeight:V,inWidth:H,outChannels:q,outHeight:W,outWidth:K,strideHeight:Y,strideWidth:Z}=f,ot=B-1-f.padInfo.top,Q=G-1-f.padInfo.left,at=q/z;for(let et=0;et<M;++et)for(let ct=0;ct<z;++ct)for(let ft=0;ft<V;++ft){let gt=ft-ot,yt=Math.max(0,Math.ceil(gt/Y)),kt=Math.min(W,(B+gt)/Y);for(let Dt=0;Dt<H;++Dt){let Vt=Dt-Q,qt=Math.max(0,Math.ceil(Vt/Z)),Zt=Math.min(K,(G+Vt)/Z),ee=0;for(let zt=yt;zt<kt;++zt){let se=zt*Y-gt;for(let pe=qt;pe<Zt;++pe){let an=pe*Z-Vt,ve=w*et+E*zt+$*pe,Ss=F*(B-1-se)+P*(G-1-an)+L*ct;for(let cr=0;cr<at;++cr){let da=ct*at+cr,Mr=S[ve+da],pn=D[Ss+cr];ee+=Mr*pn}}}g[h*et+x*ft+b*Dt+ct]=ee}}return e.makeTensorInfo(d.shape,d.dtype,d.values)}var $N={kernelName:Aa,backendName:"cpu",kernelFunc:qM};function KM(r){let{inputs:t,backend:e}=r,{x:o}=t,n=y.sizeFromShape(o.shape),s=e.data.get(o.dataId).values,a=pt([n,n],o.dtype),i=a.values;for(let c=0;c<s.length;c++)i[c*n+c]=s[c];let p=[...o.shape,...o.shape];return e.makeTensorInfo(p,a.dtype,a.values)}var AN={kernelName:Da,backendName:"cpu",kernelFunc:KM};var DN={kernelName:Nn,backendName:"cpu",kernelFunc:({inputs:r,backend:t,attrs:e})=>{let{x:o,filter:n}=r,{strides:s,pad:a,dilations:i}=e,p=t,c=p.data.get(o.dataId).values,l=o.shape.length,u=p.data.get(n.dataId).values,m=n.shape.length,{batchSize:f,inHeight:d,inWidth:g,inChannels:h,outHeight:x,outWidth:b,padInfo:S,strideHeight:w,strideWidth:E,filterHeight:$,filterWidth:D,dilationHeight:F,dilationWidth:P,outShape:L}=I.computeDilation2DInfo(o.shape,n.shape,s,a,"NHWC",i),M=y.sizeFromShape(L),B=L.length,G=y.getArrayFromDType(o.dtype,M);for(let V=0;V<f;++V)for(let H=0;H<x;++H){let q=H*w-S.top;for(let W=0;W<b;++W){let K=W*E-S.left;for(let Y=0;Y<h;++Y){let Z=Number.MIN_SAFE_INTEGER;for(let Q=0;Q<$;++Q){let at=q+Q*F;if(at>=0&&at<d)for(let et=0;et<D;++et){let ct=K+et*P;if(ct>=0&&ct<g){let ft=y.locToIndex([V,at,ct,Y],l,y.computeStrides(o.shape)),gt=y.locToIndex([Q,et,Y],m,y.computeStrides(n.shape)),yt=c[ft]+u[gt];yt>Z&&(Z=yt)}}}let ot=y.locToIndex([V,H,W,Y],B,y.computeStrides(L));G[ot]=Z}}}return{dataId:p.write(y.toTypedArray(G,o.dtype),L,o.dtype),shape:L,dtype:o.dtype}}};var RN={kernelName:kp,backendName:"cpu",kernelFunc:({inputs:r,backend:t,attrs:e})=>{let{x:o,filter:n,dy:s}=r,{strides:a,pad:i,dilations:p}=e,c=t,l=y.toNestedArray(o.shape,c.data.get(o.dataId).values),u=y.toNestedArray(n.shape,c.data.get(n.dataId).values),{batchSize:m,inHeight:f,inWidth:d,inChannels:g,outHeight:h,outWidth:x,padInfo:b,strideHeight:S,strideWidth:w,filterHeight:E,filterWidth:$,dilationHeight:D,dilationWidth:F,outShape:P}=I.computeDilation2DInfo(o.shape,n.shape,a,i,"NHWC",p);y.assert(s.rank===P.length,()=>`Error in ${kp}, dy must have the same rank as output ${P.length}, but got ${s.rank}`);let L=y.toNestedArray(P,c.data.get(s.dataId).values),M=y.makeZerosNestedTypedArray(n.shape,n.dtype);for(let G=0;G<m;++G)for(let z=0;z<h;++z){let V=z*S-b.top;for(let H=0;H<x;++H){let q=H*w-b.left;for(let W=0;W<g;++W){let K=Number.MIN_SAFE_INTEGER,Y=0,Z=0;for(let ot=0;ot<E;++ot){let Q=V+ot*D;if(Q>=0&&Q<f)for(let at=0;at<$;++at){let et=q+at*F;if(et>=0&&et<d){let ct=l[G][Q][et][W]+u[ot][at][W];ct>K&&(K=ct,Y=ot,Z=at)}}}M[Y][Z][W]+=L[G][z][H][W]}}}return{dataId:c.write(y.toTypedArray(M,o.dtype),n.shape,n.dtype),shape:n.shape,dtype:n.dtype}}};var FN={kernelName:Ip,backendName:"cpu",kernelFunc:({inputs:r,backend:t,attrs:e})=>{let{x:o,filter:n,dy:s}=r,{strides:a,pad:i,dilations:p}=e,c=t,l=y.toNestedArray(o.shape,c.data.get(o.dataId).values),u=y.toNestedArray(n.shape,c.data.get(n.dataId).values),{batchSize:m,inHeight:f,inWidth:d,inChannels:g,outHeight:h,outWidth:x,padInfo:b,strideHeight:S,strideWidth:w,filterHeight:E,filterWidth:$,dilationHeight:D,dilationWidth:F,outShape:P}=I.computeDilation2DInfo(o.shape,n.shape,a,i,"NHWC",p);y.assert(s.rank===P.length,()=>`Error in ${Ip}, dy must have the same rank as output ${P.length}, but got ${s.rank}`);let L=y.toNestedArray(P,c.data.get(s.dataId).values),M=y.makeZerosNestedTypedArray(o.shape,o.dtype);for(let G=0;G<m;++G)for(let z=0;z<h;++z){let V=z*S-b.top;for(let H=0;H<x;++H){let q=H*w-b.left;for(let W=0;W<g;++W){let K=Number.MIN_SAFE_INTEGER,Y=V<0?0:V,Z=q<0?0:q;for(let ot=0;ot<E;++ot){let Q=V+ot*D;if(Q>=0&&Q<f)for(let at=0;at<$;++at){let et=q+at*F;if(et>=0&&et<d){let ct=l[G][Q][et][W]+u[ot][at][W];ct>K&&(K=ct,Y=Q,Z=et)}}}M[G][Y][Z][W]+=L[G][z][H][W]}}}return{dataId:c.write(y.toTypedArray(M,o.dtype),o.shape,o.dtype),shape:o.shape,dtype:o.dtype}}};function xs(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s,keepDims:a}=o;U(n,"sum");let i;n.dtype==="bool"?i=Dr({inputs:{x:n},backend:e,attrs:{dtype:"int32"}}):i=De({inputs:{x:n},backend:e});let p=i.shape.length,c=y.parseAxisParam(s,i.shape),l=I.getAxesPermutation(c,p),u=c,m=i;l!=null&&(m=jt({inputs:{x:i},backend:e,attrs:{perm:l}}),u=I.getInnerMostAxes(u.length,p)),I.assertAxesAreInnerMostDims("sum",u,m.shape.length);let[f,d]=I.computeOutAndReduceShapes(m.shape,u),g=I.upcastType(m.dtype,"int32"),h=jp(e,f,g),x=y.sizeFromShape(d),b=e.data.get(h.dataId).values,S=e.data.get(m.dataId).values;for(let w=0;w<b.length;++w){let E=w*x,$=0;for(let D=0;D<x;++D)$+=S[E+D];b[w]=$}if(a){let w=I.expandShapeToKeepDim(h.shape,c),E=h;h=vt({inputs:{x:h},backend:e,attrs:{shape:w}}),e.disposeIntermediateTensorInfo(E)}return e.disposeIntermediateTensorInfo(i),l!=null&&e.disposeIntermediateTensorInfo(m),h}var _N={kernelName:"Sum",backendName:"cpu",kernelFunc:xs};function XM(r){let{inputs:t,backend:e,attrs:o}=r,{equation:n}=o,s=t,{allDims:a,summedDims:i,idDims:p}=I.decodeEinsumEquation(n,s.length);I.checkEinsumDimSizes(a.length,p,s);let{path:c,steps:l}=I.getEinsumComputePath(i,p),u=l.length,m=null,f=a.length,d=[];for(let g=0;g<u;++g){for(let h of l[g]){let{permutationIndices:x,expandDims:b}=I.getEinsumPermutation(f,p[h]),S;I.isIdentityPermutation(x)?S=s[h]:(S=jt({inputs:{x:s[h]},backend:e,attrs:{perm:x}}),d.push(S));let w=S.shape.slice();for(let E=0;E<b.length;++E)w.splice(b[E],0,1);y.arraysEqual(S.shape,w)||(S=vt({inputs:{x:S},backend:e,attrs:{shape:w}}),d.push(S)),m===null?m=S:(m=sp({inputs:{a:S,b:m},backend:e}),d.push(m))}g<u-1&&(c[g]>=0&&(m=xs({inputs:{x:m},backend:e,attrs:{axis:c[g]-(a.length-f),keepDims:!1}}),d.push(m)),f--)}for(let g of d)g!==m&&e.disposeIntermediateTensorInfo(g);return m}var ON={kernelName:Ra,backendName:"cpu",kernelFunc:XM};function jM(r){let{inputs:t,backend:e}=r,{dy:o,y:n}=t;U([o,n],"eluGrad");let s=new Float32Array(y.sizeFromShape(n.shape)),a=e.data.get(n.dataId).values,i=e.data.get(o.dataId).values;for(let p=0;p<a.length;++p){let c=a[p];c>=1?s[p]=i[p]:s[p]=i[p]*(c+1)}return e.makeTensorInfo(n.shape,"float32",s)}var PN={kernelName:Fa,backendName:"cpu",kernelFunc:jM};var YM=I.ERF_P,ZM=I.ERF_A1,QM=I.ERF_A2,JM=I.ERF_A3,tB=I.ERF_A4,eB=I.ERF_A5,rB=ht("Erf",r=>{let t=Math.sign(r),e=Math.abs(r),o=1/(1+YM*e);return t*(1-((((eB*o+tB)*o+JM)*o+QM)*o+ZM)*o*Math.exp(-e*e))}),LN={kernelName:"Erf",backendName:"cpu",kernelFunc:rB};function ec(r){let{inputs:t,backend:e,attrs:o}=r,{input:n}=t,{dim:s}=o,a=n.shape.length,i=n.shape.slice(),p=s;return s<0&&(y.assert(-(a+1)<=s,()=>`Axis must be in the interval [${-(a+1)}, ${a}]`),p=a+s+1),i.splice(p,0,1),vt({inputs:{x:n},backend:e,attrs:{shape:i}})}var MN={kernelName:In,backendName:"cpu",kernelFunc:ec};var oB=Et((r,t)=>r/t),zl=Ft(yo,oB),Wl={kernelName:yo,backendName:"cpu",kernelFunc:zl};function Am(r,t,e){let o=r.shape,n=o[0],s=o[1],a=e.data.get(r.dataId),i=a.complexTensorInfos.real,p=a.complexTensorInfos.imag,c=[n,s],l=y.sizeFromShape(c),u=y.getTypedArrayFromDType("float32",l),m=y.getTypedArrayFromDType("float32",l);for(let h=0;h<n;h++){let x=_r({inputs:{x:i},backend:e,attrs:{begin:[h,0],size:[1,s]}}),b=_r({inputs:{x:p},backend:e,attrs:{begin:[h,0],size:[1,s]}}),S=he({inputs:{real:x,imag:b},backend:e}),{real:w,imag:E}=nB(S,t,e),$=I.mergeRealAndImagArrays(w,E);for(let D=0;D<s;D++){let F=I.getComplexWithIndex($,D);u[h*s+D]=F.real,m[h*s+D]=F.imag}e.disposeIntermediateTensorInfo(x),e.disposeIntermediateTensorInfo(b),e.disposeIntermediateTensorInfo(S)}let f=e.makeTensorInfo(c,"float32",u),d=e.makeTensorInfo(c,"float32",m),g=he({inputs:{real:f,imag:d},backend:e});return e.disposeIntermediateTensorInfo(f),e.disposeIntermediateTensorInfo(d),g}function nB(r,t,e){let o=y.sizeFromShape(r.shape),n=e.data.get(r.dataId),s=e.data.get(n.complexTensorInfos.real.dataId).values,a=e.data.get(n.complexTensorInfos.imag.dataId).values;if(sB(o)){let i=Ux(s,a,o,t,e),p=[r.shape[0],r.shape[1]];if(t){let c=e.makeTensorInfo(p,"float32",i.real),l=e.makeTensorInfo(p,"float32",i.imag),u=e.makeTensorInfo([],"float32",y.createScalarValue(o,"float32")),m=De({inputs:{x:u},backend:e}),f=Wl.kernelFunc({inputs:{a:c,b:u},backend:e}),d=Wl.kernelFunc({inputs:{a:l,b:m},backend:e}),g=e.data.get(f.dataId).values,h=e.data.get(d.dataId).values;return e.disposeIntermediateTensorInfo(c),e.disposeIntermediateTensorInfo(l),e.disposeIntermediateTensorInfo(u),e.disposeIntermediateTensorInfo(m),e.disposeIntermediateTensorInfo(f),e.disposeIntermediateTensorInfo(d),{real:g,imag:h}}return i}else{let i=I.mergeRealAndImagArrays(s,a),p=aB(i,o,t);return I.splitRealAndImagArrays(p)}}function sB(r){return(r&r-1)===0}function Ux(r,t,e,o,n){if(e===1)return{real:r,imag:t};let s=I.mergeRealAndImagArrays(r,t),a=e/2,i=I.complexWithEvenIndex(s),p=i.real,c=i.imag,l=[p.length],u=n.makeTensorInfo(l,"float32",p),m=n.makeTensorInfo(l,"float32",c),f=he({inputs:{real:u,imag:m},backend:n}),d=I.complexWithOddIndex(s),g=d.real,h=d.imag,x=[g.length],b=n.makeTensorInfo(x,"float32",g),S=n.makeTensorInfo(x,"float32",h),w=he({inputs:{real:b,imag:S},backend:n}),E=Ux(p,c,a,o,n),$=E.real,D=E.imag,F=[$.length],P=n.makeTensorInfo(F,"float32",$),L=n.makeTensorInfo(F,"float32",D),M=he({inputs:{real:P,imag:L},backend:n}),B=Ux(g,h,a,o,n),G=B.real,z=B.imag,V=[G.length],H=n.makeTensorInfo(V,"float32",G),q=n.makeTensorInfo(V,"float32",z),W=he({inputs:{real:H,imag:q},backend:n}),K=I.exponents(e,o),Y=[K.real.length],Z=n.makeTensorInfo(Y,"float32",K.real),ot=n.makeTensorInfo(Y,"float32",K.imag),Q=he({inputs:{real:Z,imag:ot},backend:n}),at=sp({inputs:{a:Q,b:W},backend:n}),et=en({inputs:{a:M,b:at},backend:n}),ct=Gl({inputs:{a:M,b:at},backend:n}),ft=Ar({inputs:{input:et},backend:n}),gt=Ar({inputs:{input:ct},backend:n}),yt=rn({inputs:{input:et},backend:n}),kt=rn({inputs:{input:ct},backend:n}),Dt=pa({inputs:[ft,gt],backend:n,attrs:{axis:0}}),Vt=pa({inputs:[yt,kt],backend:n,attrs:{axis:0}}),qt=n.data.get(Dt.dataId).values,Zt=n.data.get(Vt.dataId).values;return n.disposeIntermediateTensorInfo(u),n.disposeIntermediateTensorInfo(m),n.disposeIntermediateTensorInfo(f),n.disposeIntermediateTensorInfo(b),n.disposeIntermediateTensorInfo(S),n.disposeIntermediateTensorInfo(w),n.disposeIntermediateTensorInfo(P),n.disposeIntermediateTensorInfo(L),n.disposeIntermediateTensorInfo(M),n.disposeIntermediateTensorInfo(H),n.disposeIntermediateTensorInfo(q),n.disposeIntermediateTensorInfo(W),n.disposeIntermediateTensorInfo(Z),n.disposeIntermediateTensorInfo(ot),n.disposeIntermediateTensorInfo(Q),n.disposeIntermediateTensorInfo(at),n.disposeIntermediateTensorInfo(et),n.disposeIntermediateTensorInfo(ct),n.disposeIntermediateTensorInfo(ft),n.disposeIntermediateTensorInfo(yt),n.disposeIntermediateTensorInfo(gt),n.disposeIntermediateTensorInfo(kt),n.disposeIntermediateTensorInfo(Dt),n.disposeIntermediateTensorInfo(Vt),{real:qt,imag:Zt}}function aB(r,t,e){let o=new Float32Array(t*2);for(let n=0;n<t;n++){let s=0,a=0;for(let i=0;i<t;i++){let p=I.exponent(n*i,t,e),c=I.getComplexWithIndex(r,i);s+=c.real*p.real-c.imag*p.imag,a+=c.real*p.imag+c.imag*p.real}e&&(s/=t,a/=t),I.assignToTypedArray(o,s,a,n)}return o}function iB(r){let{inputs:t,backend:e}=r,{input:o}=t,n=y.sizeFromShape(o.shape),s=o.shape[o.shape.length-1],a=n/s,i=vt({inputs:{x:o},backend:e,attrs:{shape:[a,s]}}),p=Am(i,!1,e),c=vt({inputs:{x:p},backend:e,attrs:{shape:o.shape}});return e.disposeIntermediateTensorInfo(i),e.disposeIntermediateTensorInfo(p),c}var BN={kernelName:"FFT",backendName:"cpu",kernelFunc:iB};function Ul(r){let{backend:t,attrs:e}=r,{shape:o,value:n,dtype:s}=e,a=s||y.inferDtype(n),i=y.getArrayFromDType(a,y.sizeFromShape(o));return pB(i,n,a),t.makeTensorInfo(o,a,i)}var GN={kernelName:_a,backendName:"cpu",kernelFunc:Ul};function pB(r,t,e){r.fill(t)}var VN={kernelName:Oa,backendName:"cpu",kernelFunc:({inputs:r,attrs:t,backend:e})=>{let{image:o}=r,n=e,s=y.getTypedArrayFromDType(o.dtype,y.sizeFromShape(o.shape)),[a,i,p,c]=o.shape,l=n.data.get(o.dataId).values;for(let m=0;m<a;m++){let f=m*p*i*c;for(let d=0;d<i;d++){let g=d*(p*c);for(let h=0;h<p;h++){let x=h*c;for(let b=0;b<c;b++){let S=Math.round(p-h-1),w=f+g+x+b,E=l[w];if(S>=0&&S<p){let $=S*c,D=f+g+$+b;E=l[D]}s[w]=E}}}}return{dataId:n.write(s,o.shape,o.dtype),shape:o.shape,dtype:o.dtype}}};var cB=Et((r,t)=>Math.floor(r/t)),lB=Ft(To,cB,null,"int32"),zN={kernelName:To,backendName:"cpu",kernelFunc:lB};function uB(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,filter:s,bias:a,preluActivationWeights:i}=t,{strides:p,pad:c,dataFormat:l,dilations:u,dimRoundingMode:m,activation:f,leakyreluAlpha:d}=o,g=zx({inputs:{x:n,filter:s},backend:e,attrs:{strides:p,pad:c,dataFormat:l,dilations:u,dimRoundingMode:m}});if(a){let h=g;if(l==="NCHW"&&a.shape.length===1&&a.shape[0]!==1){let x=vt({inputs:{x:a},backend:e,attrs:{shape:[a.shape[0],1,1]}});g=en({inputs:{a:g,b:x},backend:e}),e.disposeIntermediateTensorInfo(x)}else g=en({inputs:{a:g,b:a},backend:e});e.disposeIntermediateTensorInfo(h)}if(f){let h=g;if(l==="NCHW"&&f==="prelu"&&i.shape.length===1&&i.shape[0]!==1){let x=vt({inputs:{x:i},backend:e,attrs:{shape:[i.shape[0],1,1]}});g=ap(e,g,f,x,d),e.disposeIntermediateTensorInfo(x)}else g=ap(e,g,f,i,d);e.disposeIntermediateTensorInfo(h)}return g}var WN={kernelName:qs,backendName:"cpu",kernelFunc:uB};function mB(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,filter:s,bias:a,preluActivationWeights:i}=t,{strides:p,pad:c,dataFormat:l,dilations:u,dimRoundingMode:m,activation:f,leakyreluAlpha:d}=o,g=Wx({inputs:{x:n,filter:s},backend:e,attrs:{strides:p,pad:c,dataFormat:l,dilations:u,dimRoundingMode:m}});if(a){let h=g;g=en({inputs:{a:g,b:a},backend:e}),e.disposeIntermediateTensorInfo(h)}if(f){let h=g;g=ap(e,g,f,i,d),e.disposeIntermediateTensorInfo(h)}return g}var UN={kernelName:Ks,backendName:"cpu",kernelFunc:mB};function fB(r){let{inputs:t,backend:e}=r,{params:o,indices:n}=t,s=y.sizeFromShape(o.shape),a=n.shape,i=a[a.length-1],[p,c,l,u]=I.prepareAndValidate(o,n);if(c===0)return e.makeTensorInfo(p,o.dtype,[]);let m=e.data.get(n.dataId).values,f=e.bufferSync(o),d=mm(m,f,o.dtype,c,i,l,u,o.shape,s);return e.makeTensorInfo(p,o.dtype,d.values)}var HN={kernelName:Pa,backendName:"cpu",kernelFunc:fB};function dB(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,indices:s}=t,{axis:a,batchDims:i}=o;U([n,s],"gatherV2");let p=y.parseAxisParam(a,n.shape)[0],c=e.data.get(s.dataId).values,l=n.shape[p];for(let w=0;w<c.length;++w){let E=c[w];y.assert(E<=l-1&&E>=0,()=>`GatherV2: the index value ${E} is not in [0, ${l-1}]`)}let u=i;i==null&&(u=0);let m=y.sizeFromShape(s.shape),f=I.segment_util.collectGatherOpShapeInfo(n,s,p,u),d=vt({inputs:{x:n},backend:e,attrs:{shape:[f.batchSize,f.outerSize,f.dimSize,f.sliceSize]}}),g=vt({inputs:{x:s},backend:e,attrs:{shape:[f.batchSize,m/f.batchSize]}}),h=[f.batchSize,f.outerSize,m/f.batchSize,f.sliceSize],x=e.bufferSync(g),b=e.bufferSync(d),S=fm(b,x,h);return e.disposeIntermediateTensorInfo(d),e.disposeIntermediateTensorInfo(g),e.makeTensorInfo(f.outputShape,S.dtype,S.values)}var qN={kernelName:En,backendName:"cpu",kernelFunc:dB};function hB(r){let{inputs:t,backend:e}=r,{input:o}=t,n=y.sizeFromShape(o.shape),s=o.shape[o.shape.length-1],a=n/s,i=vt({inputs:{x:o},backend:e,attrs:{shape:[a,s]}}),p=Am(i,!0,e),c=vt({inputs:{x:p},backend:e,attrs:{shape:o.shape}});return e.disposeIntermediateTensorInfo(i),e.disposeIntermediateTensorInfo(p),c}var KN={kernelName:La,backendName:"cpu",kernelFunc:hB};var gB=ht(wo,r=>Number.isFinite(r)?1:0,"bool"),XN={kernelName:wo,backendName:"cpu",kernelFunc:gB};var xB=ht(No,r=>Math.abs(r)===1/0?1:0,"bool"),jN={kernelName:No,backendName:"cpu",kernelFunc:xB};var yB=ht(vo,r=>Number.isNaN(r)?1:0,"bool"),YN={kernelName:vo,backendName:"cpu",kernelFunc:yB};function bB(r){let{backend:t,attrs:e}=r,{start:o,stop:n,num:s}=e,a=dm(o,n,s);return t.makeTensorInfo([a.length],"float32",a)}var ZN={kernelName:Ba,backendName:"cpu",kernelFunc:bB};var CB=ht(Io,r=>Math.log1p(r)),QN={kernelName:Io,backendName:"cpu",kernelFunc:CB};var TB=Et((r,t)=>r&&t),SB=Ft(Ps,TB,null,"bool"),JN={kernelName:Ps,backendName:"cpu",kernelFunc:SB};var wB=ht(Ls,r=>r?0:1,"bool"),tv={kernelName:Ls,backendName:"cpu",kernelFunc:wB};var NB=Et((r,t)=>r||t),vB=Ft(Ms,NB,null,"bool"),ev={kernelName:Ms,backendName:"cpu",kernelFunc:vB};function IB(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{depthRadius:s,bias:a,alpha:i,beta:p}=o;U(n,"LRN");let c=n.shape[3],l=c-1,u=e.data.get(n.dataId).values,m=y.sizeFromShape(n.shape),f=new Float32Array(m);function d(g){let h=g%c,x=g-h+Math.max(0,h-s),b=g-h+Math.min(h+s,l),S=0;for(;x<=b;x++){let w=u[x];S+=w*w}return S}for(let g=0;g<m;g++){let h=d(g),x=u[g]*Math.pow(a+i*h,-p);f[g]=x}return e.makeTensorInfo(n.shape,n.dtype,f)}var rv={kernelName:"LRN",backendName:"cpu",kernelFunc:IB};function kB(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,y:s,dy:a}=t,{depthRadius:i,bias:p,alpha:c,beta:l}=o;U(a,"LRNGrad");let u=y.sizeFromShape(a.shape),m=a.shape[3],f=e.data.get(a.dataId).values,d=e.data.get(n.dataId).values,g=e.data.get(s.dataId).values,h=new Float32Array(u),x=u;for(let b=0;b<x;b++){let S=b%m,w=b-S+Math.max(0,S-i),E=b-S+Math.min(m,S+i+1),$=0;for(let D=w;D<E;D++)$+=Math.pow(d[D],2);$=c*$+p;for(let D=w;D<E;D++){let F=-2*c*l*d[D]*g[b]/$;b===D&&(F+=Math.pow($,-l)),F*=f[b],h[D]+=F}}return e.makeTensorInfo(a.shape,n.dtype,h)}var ov={kernelName:Va,backendName:"cpu",kernelFunc:kB};function Hx(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{reductionIndices:s,keepDims:a}=o,i=e,p=n.shape,c=p.length,l=y.parseAxisParam(s,p),u=l,m=I.getAxesPermutation(u,c),f=i.data.get(n.dataId).values;if(m!=null){let w=new Array(c);for(let E=0;E<w.length;E++)w[E]=p[m[E]];f=Qp(f,p,n.dtype,m,w),u=I.getInnerMostAxes(u.length,c),p=w}U(n,"max"),I.assertAxesAreInnerMostDims("max",u,c);let[d,g]=I.computeOutAndReduceShapes(p,u),h=y.sizeFromShape(g),x=hm(f,h,d,n.dtype),b=i.write(x,d,n.dtype),S=d;return a&&(S=I.expandShapeToKeepDim(d,l)),{dataId:b,shape:S,dtype:n.dtype}}var nv={kernelName:"Max",backendName:"cpu",kernelFunc:Hx};function EB(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t;U(n,"maxPool");let{filterSize:s,strides:a,pad:i,dimRoundingMode:p}=o,c=1;y.assert(I.eitherStridesOrDilationsAreOne(a,c),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${a} and dilations '${c}'`);let l=I.computePool2DInfo(n.shape,s,a,c,i,p),u;if(l.filterWidth===1&&l.filterHeight===1&&y.arraysEqual(l.inShape,l.outShape))u=De({inputs:{x:n},backend:e});else{let m=e.data.get(n.dataId).values,f=y.computeStrides(n.shape),d=tc(m,n.shape,n.dtype,f,l,"max");u=e.makeTensorInfo(l.outShape,n.dtype,d.values)}return u}var sv={kernelName:An,backendName:"cpu",kernelFunc:EB};function $B(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{filterSize:s,strides:a,pad:i,dimRoundingMode:p,dataFormat:c}=o;U(n,"maxPool3d");let l=I.computePool3DInfo(n.shape,s,a,1,i,p,c),u=e.data.get(n.dataId).values,m=$m(u,n.shape,n.dtype,y.computeStrides(n.shape),l,"max");return e.makeTensorInfo(m.shape,"float32",m.values)}var av={kernelName:Dn,backendName:"cpu",kernelFunc:$B};function AB(r){let{inputs:t,backend:e,attrs:o}=r,{dy:n,input:s}=t,{filterSize:a,strides:i,pad:p,dimRoundingMode:c}=o;U([n,s],"maxPool3DGrad");let l=I.computePool3DInfo(s.shape,a,i,1,p,c),u=e.bufferSync(s),m=eN(u,l),f=l.strideDepth,d=l.strideHeight,g=l.strideWidth,h=l.dilationDepth,x=l.dilationHeight,b=l.dilationWidth,S=l.effectiveFilterDepth,w=l.effectiveFilterHeight,E=l.effectiveFilterWidth,$=S-1-l.padInfo.front,D=E-1-l.padInfo.left,F=w-1-l.padInfo.top,P=pt(s.shape,"float32"),L=e.bufferSync(n);for(let M=0;M<l.batchSize;++M)for(let B=0;B<l.inChannels;++B)for(let G=0;G<l.inDepth;++G)for(let z=0;z<l.inHeight;++z)for(let V=0;V<l.inWidth;++V){let H=G-$,q=z-F,W=V-D,K=0;for(let Y=0;Y<S;Y+=h){let Z=(H+Y)/f;if(!(Z<0||Z>=l.outDepth||Math.floor(Z)!==Z))for(let ot=0;ot<w;ot+=x){let Q=(q+ot)/d;if(!(Q<0||Q>=l.outHeight||Math.floor(Q)!==Q))for(let at=0;at<E;at+=b){let et=(W+at)/g;if(et<0||et>=l.outWidth||Math.floor(et)!==et)continue;let ct=S*w*E-1-m.get(M,Z,Q,et,B),ft=Y*w*E+ot*E+at,gt=ct===ft?1:0;if(gt===0)continue;let yt=L.get(M,Z,Q,et,B);K+=yt*gt}}}P.set(K,M,G,z,V,B)}return e.makeTensorInfo(P.shape,P.dtype,P.values)}var iv={kernelName:Ua,backendName:"cpu",kernelFunc:AB};function DB(r){let{inputs:t,backend:e,attrs:o}=r,{dy:n,input:s,output:a}=t,i=s;U([s,a],"maxPoolGrad");let{filterSize:p,strides:c,pad:l,dimRoundingMode:u}=o,m=I.computePool2DInfo(i.shape,p,c,1,l,u),f=e.data.get(i.dataId).values,d=pt(m.outShape,i.dtype,Em(f,i.shape,i.dtype,m).values),g=m.strideHeight,h=m.strideWidth,x=m.dilationHeight,b=m.dilationWidth,S=m.effectiveFilterHeight,w=m.effectiveFilterWidth,E=w-1-m.padInfo.left,$=S-1-m.padInfo.top,D=pt(i.shape,"float32"),F=e.data.get(n.dataId).values,P=pt(n.shape,"float32",F);for(let L=0;L<m.batchSize;++L)for(let M=0;M<m.inChannels;++M)for(let B=0;B<m.inHeight;++B)for(let G=0;G<m.inWidth;++G){let z=B-$,V=G-E,H=0;for(let q=0;q<S;q+=x){let W=(z+q)/g;if(!(W<0||W>=m.outHeight||Math.floor(W)!==W))for(let K=0;K<w;K+=b){let Y=(V+K)/h;if(Y<0||Y>=m.outWidth||Math.floor(Y)!==Y)continue;let Z=S*w-1-d.get(L,W,Y,M),ot=q*w+K,Q=Z===ot?1:0;if(Q===0)continue;let at=P.get(L,W,Y,M);H+=at*Q}}D.set(H,L,B,G,M)}return e.makeTensorInfo(D.shape,D.dtype,D.values)}var pv={kernelName:Wa,backendName:"cpu",kernelFunc:DB};function cv(r,t,e,o,n){let s=y.computeStrides(t),a=tc(r,t,e,s,n,"max"),i=Em(r,t,e,n,!0,o);return[a.values,i.values]}var lv={kernelName:Ha,backendName:"cpu",kernelFunc:({inputs:r,attrs:t,backend:e})=>{let{x:o}=r,{filterSize:n,strides:s,pad:a,includeBatchInIndex:i}=t,p=e;U(o,"MaxPoolWithArgmax");let c=p.data.get(o.dataId).values,l=I.computePool2DInfo(o.shape,n,s,[1,1],a),[u,m]=cv(c,o.shape,o.dtype,i,l),f=p.write(u,l.outShape,o.dtype),d=p.write(m,l.outShape,o.dtype);return[{dataId:f,shape:l.outShape,dtype:o.dtype},{dataId:d,shape:l.outShape,dtype:"int32"}]}};function RB(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s,keepDims:a}=o,i=y.parseAxisParam(s,n.shape),c=I.computeOutAndReduceShapes(n.shape,i)[1],l=y.sizeFromShape(c),u=[],m=e.makeTensorInfo([],"float32",new Float32Array([l]));u.push(m);let f=Dr({inputs:{x:n},backend:e,attrs:{dtype:"float32"}});u.push(f);let d=zl({inputs:{a:f,b:m},backend:e});u.push(d);let g=xs({inputs:{x:d},backend:e,attrs:{axis:s,keepDims:a}});return u.forEach(h=>e.disposeIntermediateTensorInfo(h)),g}var uv={kernelName:Rn,backendName:"cpu",kernelFunc:RB};function FB(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s,keepDims:a}=o;U(n,"min");let i=y.parseAxisParam(s,n.shape),p=i,c=I.getAxesPermutation(p,n.shape.length),l=n;c!=null&&(l=jt({inputs:{x:n},backend:e,attrs:{perm:c}}),p=I.getInnerMostAxes(p.length,n.shape.length)),I.assertAxesAreInnerMostDims("min",p,l.shape.length);let[u,m]=I.computeOutAndReduceShapes(l.shape,p),f=y.sizeFromShape(m),d=y.makeZerosTypedArray(y.sizeFromShape(u),l.dtype),g=e.data.get(l.dataId).values;for(let x=0;x<d.length;++x){let b=x*f,S=g[b];for(let w=0;w<f;++w){let E=g[b+w];(Number.isNaN(E)||E<S)&&(S=E)}d[x]=S}c!=null&&e.disposeIntermediateTensorInfo(l);let h=e.makeTensorInfo(u,l.dtype,d);if(a){let x=I.expandShapeToKeepDim(u,i),b=vt({inputs:{x:h},backend:e,attrs:{shape:x}});return e.disposeIntermediateTensorInfo(h),b}return h}var mv={kernelName:"Min",backendName:"cpu",kernelFunc:FB};function _B(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{paddings:s,mode:a}=o;U(n,"mirrorPad");let i=s.map((S,w)=>S[0]+n.shape[w]+S[1]),p=s.map(S=>S[0]),c=s.map((S,w)=>S[0]+n.shape[w]),l=a==="reflect"?0:1,u=e.data.get(n.dataId).values,m=n.shape.length,f=y.computeStrides(n.shape),d=y.sizeFromShape(i),g=i.length,h=y.computeStrides(i),x=y.getTypedArrayFromDType(n.dtype,d);for(let S=0;S<d;S++){let w=y.indexToLoc(S,g,h);for(let $=0;$<g;$++)w[$]<p[$]?w[$]=p[$]*2-w[$]-l:w[$]>=c[$]&&(w[$]=(c[$]-1)*2-w[$]+l);w=w.map(($,D)=>$-p[D]);let E=y.locToIndex(w,m,f);x[S]=u[E]}return{dataId:e.write(x,i,n.dtype),shape:i,dtype:n.dtype}}var fv={kernelName:Fn,backendName:"cpu",kernelFunc:_B};var OB=Et(((r,t)=>{let e=r%t;return r<0&&t<0||r>=0&&t>=0?e:(e+t)%t})),PB=Ft("Mod",OB),dv={kernelName:"Mod",backendName:"cpu",kernelFunc:PB};var gv=Ud(ig());function qx(r){let{inputs:t,backend:e,attrs:o}=r,{logits:n}=t,{dim:s}=o,a=n.shape.length,i=s;if(i===-1&&(i=a-1),i!==a-1)throw Error(`Softmax along a non-last dimension is not yet supported. Logits was rank ${a} and dim was ${i}`);let p=y.parseAxisParam([i],n.shape),c=Hx({inputs:{x:n},backend:e,attrs:{reductionIndices:p,keepDims:!1}}),l=I.expandShapeToKeepDim(c.shape,p),u=vt({inputs:{x:c},backend:e,attrs:{shape:l}}),m=Gl({inputs:{a:n,b:u},backend:e}),f=hx({inputs:{x:m},backend:e}),d=xs({inputs:{x:f},backend:e,attrs:{axis:p,keepDims:!1}}),g=vt({inputs:{x:d},backend:e,attrs:{shape:l}}),h=zl({inputs:{a:f,b:g},backend:e});return e.disposeIntermediateTensorInfo(c),e.disposeIntermediateTensorInfo(u),e.disposeIntermediateTensorInfo(m),e.disposeIntermediateTensorInfo(f),e.disposeIntermediateTensorInfo(d),e.disposeIntermediateTensorInfo(g),h}var hv={kernelName:Xn,backendName:"cpu",kernelFunc:qx};function LB(r){let{inputs:t,backend:e,attrs:o}=r,{logits:n}=t,{numSamples:s,seed:a,normalized:i}=o;U(n,"multinomial");let p=i?n:qx({inputs:{logits:n},backend:e,attrs:{dim:-1}}),c=p.shape[0],l=p.shape[1],u=e.data.get(p.dataId).values,m=[c,s],f=y.makeZerosTypedArray(y.sizeFromShape(m),"int32");for(let d=0;d<c;++d){let g=d*l,h=new Float32Array(l-1);h[0]=u[g];for(let S=1;S<h.length;++S)h[S]=h[S-1]+u[g+S];let x=gv.alea(a.toString()),b=d*s;for(let S=0;S<s;++S){let w=x();f[b+S]=h.length;for(let E=0;E<h.length;E++)if(w<h[E]){f[b+S]=E;break}}}return i||e.disposeIntermediateTensorInfo(p),e.makeTensorInfo(m,"int32",f)}var xv={kernelName:Ka,backendName:"cpu",kernelFunc:LB};var MB=we.nonMaxSuppressionV3Impl;function BB(r){let{inputs:t,backend:e,attrs:o}=r,{boxes:n,scores:s}=t,{maxOutputSize:a,iouThreshold:i,scoreThreshold:p}=o;U(n,"NonMaxSuppression");let c=e.data.get(n.dataId).values,l=e.data.get(s.dataId).values,{selectedIndices:u}=MB(c,l,a,i,p);return e.makeTensorInfo([u.length],"int32",new Int32Array(u))}var yv={kernelName:ja,backendName:"cpu",kernelFunc:BB};var GB=we.nonMaxSuppressionV4Impl;function VB(r){let{inputs:t,backend:e,attrs:o}=r,{boxes:n,scores:s}=t,{maxOutputSize:a,iouThreshold:i,scoreThreshold:p,padToMaxOutputSize:c}=o;U(n,"NonMaxSuppressionPadded");let l=e.data.get(n.dataId).values,u=e.data.get(s.dataId).values,{selectedIndices:m,validOutputs:f}=GB(l,u,a,i,p,c);return[e.makeTensorInfo([m.length],"int32",new Int32Array(m)),e.makeTensorInfo([],"int32",new Int32Array([f]))]}var bv={kernelName:Ya,backendName:"cpu",kernelFunc:VB};var zB=we.nonMaxSuppressionV5Impl;function WB(r){let{inputs:t,backend:e,attrs:o}=r,{boxes:n,scores:s}=t,{maxOutputSize:a,iouThreshold:i,scoreThreshold:p,softNmsSigma:c}=o;U(n,"NonMaxSuppressionWithScore");let l=e.data.get(n.dataId).values,u=e.data.get(s.dataId).values,m=a,f=i,d=p,g=c,{selectedIndices:h,selectedScores:x}=zB(l,u,m,f,d,g);return[e.makeTensorInfo([h.length],"int32",new Int32Array(h)),e.makeTensorInfo([x.length],"float32",new Float32Array(x))]}var Cv={kernelName:Za,backendName:"cpu",kernelFunc:WB};function UB(r){let{inputs:t,backend:e,attrs:o}=r,{indices:n}=t,{dtype:s,depth:a,onValue:i,offValue:p}=o;U(n,"oneHot");let c=y.sizeFromShape(n.shape),l=new Float32Array(c*a);l.fill(p);let u=e.data.get(n.dataId).values;for(let m=0;m<c;++m)u[m]>=0&&u[m]<a&&(l[m*a+u[m]]=i);return e.makeTensorInfo([...n.shape,a],s,l)}var Tv={kernelName:On,backendName:"cpu",kernelFunc:UB};function Hl(r){let{inputs:t,backend:e}=r,{x:o}=t;if(o.dtype==="string")throw new Error("zerosLike is not supported for string tensors");if(o.dtype==="complex64"){let n=Ar({inputs:{input:o},backend:e}),s=Hl({inputs:{x:n},backend:e}),a=rn({inputs:{input:o},backend:e}),i=Hl({inputs:{x:a},backend:e}),p=he({inputs:{real:s,imag:i},backend:e});return e.disposeIntermediateTensorInfo(n),e.disposeIntermediateTensorInfo(s),e.disposeIntermediateTensorInfo(a),e.disposeIntermediateTensorInfo(i),p}else return Ul({backend:e,attrs:{shape:o.shape,value:0,dtype:o.dtype}})}var Sv={kernelName:Zn,backendName:"cpu",kernelFunc:Hl};function wv(r){let{inputs:t,backend:e}=r,{x:o}=t;if(o.dtype==="string")throw new Error("onesLike is not supported for string tensors");if(o.dtype==="complex64"){let n=Ar({inputs:{input:o},backend:e}),s=wv({inputs:{x:n},backend:e}),a=rn({inputs:{input:o},backend:e}),i=Hl({inputs:{x:a},backend:e}),p=he({inputs:{real:s,imag:i},backend:e});return e.disposeIntermediateTensorInfo(n),e.disposeIntermediateTensorInfo(s),e.disposeIntermediateTensorInfo(a),e.disposeIntermediateTensorInfo(i),p}else return Ul({backend:e,attrs:{shape:o.shape,value:1,dtype:o.dtype}})}var Nv={kernelName:_n,backendName:"cpu",kernelFunc:wv};function Kx(r){let{inputs:t,backend:e,attrs:o}=r,{axis:n}=o;if(t.length===1)return ec({inputs:{input:t[0]},backend:e,attrs:{dim:n}});let s=t[0].shape,a=t[0].dtype;t.forEach(l=>{y.assertShapesMatch(s,l.shape,"All tensors passed to stack must have matching shapes"),y.assert(a===l.dtype,()=>"All tensors passed to stack must have matching dtypes")});let i=[],p=t.map(l=>{let u=ec({inputs:{input:l},backend:e,attrs:{dim:n}});return i.push(u),u}),c=pa({inputs:p,backend:e,attrs:{axis:n}});return i.forEach(l=>e.disposeIntermediateTensorInfo(l)),c}var vv={kernelName:Pn,backendName:"cpu",kernelFunc:Kx};function HB(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{paddings:s,constantValue:a}=o;U(n,"pad");let i=s.map((b,S)=>b[0]+n.shape[S]+b[1]),p=s.map(b=>b[0]),c=e.data.get(n.dataId).values,l=y.sizeFromShape(n.shape),u=n.shape.length,m=y.computeStrides(n.shape),f=y.sizeFromShape(i),d=i.length,g=y.computeStrides(i),h=y.getTypedArrayFromDType(n.dtype,f);a!==0&&h.fill(a);for(let b=0;b<l;b++){let w=y.indexToLoc(b,u,m).map(($,D)=>$+p[D]),E=y.locToIndex(w,d,g);h[E]=c[b]}return{dataId:e.write(h,i,n.dtype),shape:i,dtype:n.dtype}}var Dm={kernelName:Ln,backendName:"cpu",kernelFunc:HB};var qB=Et((r,t)=>Math.pow(r,t)),KB=Ft("Pow",qB),Iv={kernelName:"Pow",backendName:"cpu",kernelFunc:KB};function XB(r){let{inputs:t,backend:e,attrs:o}=r,{paramsNestedSplits:n,paramsDenseValues:s,indices:a}=t,{outputRaggedRank:i}=o,p=n.map(x=>e.data.get(x.dataId).values),c=n.map(x=>x.shape),l=e.data.get(s.dataId).values,u=e.data.get(a.dataId).values,[m,f,d]=gm(p,c,l,s.shape,s.dtype,u,a.shape,i),g=m.map(x=>e.makeTensorInfo([x.length],"int32",x)),h=e.makeTensorInfo(d,s.dtype,f);return g.concat([h])}var kv={kernelName:Qa,backendName:"cpu",kernelFunc:XB};function jB(r){let{inputs:t,backend:e,attrs:o}=r,{shape:n,values:s,defaultValue:a,rowPartitionTensors:i}=t,{rowPartitionTypes:p}=o,c=e.data.get(n.dataId).values,l=e.data.get(s.dataId).values,u=e.data.get(a.dataId).values,m=i.map(h=>e.data.get(h.dataId).values),f=i.map(h=>h.shape),[d,g]=xm(c,n.shape,l,s.shape,s.dtype,u,a.shape,m,f,p);return e.makeTensorInfo(d,s.dtype,g)}var Ev={kernelName:Ja,backendName:"cpu",kernelFunc:jB};function YB(r){let{backend:t,attrs:e}=r,{start:o,stop:n,dtype:s,step:a}=e,i=ym(o,n,a,s);return t.makeTensorInfo([i.length],s,i)}var $v={kernelName:ti,backendName:"cpu",kernelFunc:YB};var ZB=ht(Ao,r=>1/r),Av={kernelName:Ao,backendName:"cpu",kernelFunc:ZB};function QB(r){let{inputs:t,backend:e,attrs:o}=r,{images:n}=t,{alignCorners:s,halfPixelCenters:a,size:i}=o;U(n,"resizeBilinear");let p=y.computeStrides(n.shape),[c,l]=i,[u,m,f,d]=n.shape,g=e.data.get(n.dataId).values,h=new Float32Array(y.sizeFromShape([u,c,l,d])),x=[s&&c>1?m-1:m,s&&l>1?f-1:f],b=[s&&c>1?c-1:c,s&&l>1?l-1:l],S=0,w=x[0]/b[0],E=x[1]/b[1];for(let $=0;$<u;$++)for(let D=0;D<c;D++){let F;a?F=w*(D+.5)-.5:F=w*D;let P=Math.max(0,Math.floor(F)),L=F-P,M=Math.min(m-1,Math.ceil(F)),B=$*p[0]+P*p[1],G=$*p[0]+M*p[1];for(let z=0;z<l;z++){let V;a?V=E*(z+.5)-.5:V=E*z;let H=Math.max(0,Math.floor(V)),q=V-H,W=Math.min(f-1,Math.ceil(V)),K=B+H*p[2],Y=G+H*p[2],Z=B+W*p[2],ot=G+W*p[2];for(let Q=0;Q<d;Q++){let at=g[K+Q],et=g[Y+Q],ct=g[Z+Q],ft=g[ot+Q],gt=at+(ct-at)*q,yt=et+(ft-et)*q,kt=gt+(yt-gt)*L;h[S++]=kt}}}return e.makeTensorInfo([u,c,l,d],"float32",h)}var Dv={kernelName:zn,backendName:"cpu",kernelFunc:QB};function JB(r){let{inputs:t,backend:e,attrs:o}=r,{images:n,dy:s}=t,{alignCorners:a}=o;U([s,n],"resizeBilinearGrad");let i=y.computeStrides(n.shape),[p,c,l,u]=n.shape,[,m,f]=s.shape,d=new Float32Array(p*c*l*u),g=[a&&m>1?c-1:c,a&&f>1?l-1:l],h=[a&&m>1?m-1:m,a&&f>1?f-1:f],x=g[0]/h[0],b=g[1]/h[1],S=e.data.get(s.dataId).values,w=0;for(let E=0;E<p;E++){let $=E*i[0];for(let D=0;D<m;D++){let F=D*x,P=Math.floor(F),L=Math.min(Math.ceil(F),c-1),M=$+P*i[1],B=$+L*i[1],G=F-P,z=1-G;for(let V=0;V<f;V++){let H=V*b,q=Math.floor(H),W=Math.min(Math.ceil(H),l-1),K=H-q,Y=1-K,Z=M+q*i[2],ot=M+W*i[2],Q=B+q*i[2],at=B+W*i[2],et=z*Y,ct=z*K,ft=G*Y,gt=G*K;for(let yt=0;yt<u;yt++){let kt=S[w++];d[Z+yt]+=kt*et,d[ot+yt]+=kt*ct,d[Q+yt]+=kt*ft,d[at+yt]+=kt*gt}}}}return e.makeTensorInfo([p,l,c,u],"float32",d)}var Rv={kernelName:oi,backendName:"cpu",kernelFunc:JB};function tG(r){let{inputs:t,backend:e,attrs:o}=r,{images:n}=t,{alignCorners:s,halfPixelCenters:a,size:i}=o;U(n,"resizeNearestNeighbor");let p=y.computeStrides(n.shape),[c,l]=i,[u,m,f,d]=n.shape,g=e.data.get(n.dataId).values,h=new Float32Array(u*c*l*d),x=[s&&c>1?m-1:m,s&&l>1?f-1:f],b=[s&&c>1?c-1:c,s&&l>1?l-1:l],S=x[0]/b[0],w=x[1]/b[1],E=0;for(let $=0;$<u;$++){let D=$*p[0];for(let F=0;F<c;F++){let P=a?S*(F+.5):S*F,L=Math.min(m-1,s?Math.round(P):Math.floor(P));a&&(L=Math.max(0,L));let M=D+L*p[1];for(let B=0;B<l;B++){let G=a?w*(B+.5):w*B,z=Math.min(f-1,s?Math.round(G):Math.floor(G));a&&(z=Math.max(0,z));let V=M+z*p[2];for(let H=0;H<d;H++){let q=g[V+H];h[E++]=q}}}}return e.makeTensorInfo([u,c,l,d],n.dtype,h)}var Fv={kernelName:Vn,backendName:"cpu",kernelFunc:tG};function eG(r){let{inputs:t,backend:e,attrs:o}=r,{images:n,dy:s}=t,{alignCorners:a}=o;U([s,n],"resizeNearestNeighborGrad");let i=y.computeStrides(n.shape),p=y.computeStrides(s.shape),[c,l,u,m]=n.shape,[,f,d]=s.shape,g=new Float32Array(c*l*u*m),h=e.data.get(s.dataId).values,x=[a&&f>1?l-1:l,a&&d>1?u-1:u],b=[a&&f>1?f-1:f,a&&d>1?d-1:d],S=x[0]/b[0],w=x[1]/b[1],E=1/S,$=1/w,D=Math.ceil(E)*2+2,F=Math.ceil($)*2+2;for(let P=0;P<c;P++){let L=P*i[0];for(let M=0;M<l;M++){let B=L+M*i[1],G=Math.floor(M*E),z=Math.floor(G-D/2);for(let V=0;V<u;V++){let H=B+V*i[2],q=Math.floor(V*$),W=Math.floor(q-F/2);for(let K=0;K<m;K++){let Y=0;for(let Z=0;Z<D;Z++){let ot=Z+z;if(ot<0||ot>=f)continue;let Q=L+ot*p[1],at=ot*S,et=Math.min(l-1,a?Math.round(at):Math.floor(at));if(M===et)for(let ct=0;ct<F;ct++){let ft=ct+W;if(ft<0||ft>=d)continue;let gt=Q+ft*p[2],yt=ft*w,kt=Math.min(u-1,a?Math.round(yt):Math.floor(yt));V===kt&&(Y+=h[gt+K])}}g[H+K]=Y}}}}return e.makeTensorInfo(n.shape,n.dtype,g)}var _v={kernelName:ri,backendName:"cpu",kernelFunc:eG};function rG(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{dims:s}=o;U(n,"reverse");let a=n.shape.length,i=y.parseAxisParam(s,n.shape);if(a===0)return De({inputs:{x:n},backend:e});let p=new _t(n.shape,n.dtype),c=e.bufferSync(n);for(let l=0;l<p.size;l++){let u=p.indexToLoc(l),m=u.slice();i.forEach(f=>m[f]=n.shape[f]-1-m[f]),p.set(c.get(...m),...u)}return e.makeTensorInfo(p.shape,p.dtype,p.values)}var Ov={kernelName:Wn,backendName:"cpu",kernelFunc:rG};var Pv={kernelName:Ci,backendName:"cpu",kernelFunc:({inputs:r,attrs:t,backend:e})=>{let{image:o}=r,{radians:n,fillValue:s,center:a}=t,i=e,p=y.getTypedArrayFromDType(o.dtype,y.sizeFromShape(o.shape)),[c,l,u,m]=o.shape,[f,d]=I.getImageCenter(a,l,u),g=255,h=Math.sin(n),x=Math.cos(n),b=i.data.get(o.dataId).values;for(let w=0;w<c;w++){let E=w*u*l*m;for(let $=0;$<l;$++){let D=$*(u*m);for(let F=0;F<u;F++){let P=F*m;for(let L=0;L<m;L++){let M=[c,$,F,L],B=M[2],G=M[1],z=(B-f)*x-(G-d)*h,V=(B-f)*h+(G-d)*x;z=Math.round(z+f),V=Math.round(V+d);let H=s;if(typeof s!="number"&&(L===3?H=g:H=s[L]),z>=0&&z<u&&V>=0&&V<l){let W=V*(u*m),K=z*m,Y=E+W+K+L;H=b[Y]}let q=E+D+P+L;p[q]=H}}}}return{dataId:i.write(p,o.shape,o.dtype),shape:o.shape,dtype:o.dtype}}};var oG=ht(Fo,r=>{let t=Math.floor(r);return r-t<.5?Math.floor(r):r-t>.5?Math.ceil(r):t%2===0?t:t+1}),Lv={kernelName:Fo,backendName:"cpu",kernelFunc:oG};function nG(r){let{inputs:t,backend:e,attrs:o}=r,{indices:n,updates:s}=t,{shape:a}=o,{sliceRank:i,numUpdates:p,sliceSize:c,strides:l,outputSize:u}=I.calculateShapes(s,n,a),m=!0,f=e.bufferSync(n),d=e.bufferSync(s),g=gs(f,d,a,u,c,p,i,l,0,m);return e.makeTensorInfo(a,g.dtype,g.values)}var Mv={kernelName:ni,backendName:"cpu",kernelFunc:nG};function sG(r,t){let e=0,o=r.length,n=0;for(;e<o;)n=Math.floor((e+o)/2),r[n]<t?e=n+1:o=n;return o}function aG(r,t){let e=0,o=r.length,n=0;for(;e<o;)n=Math.floor((e+o)/2),r[n]<=t?e=n+1:o=n;return o}function Bv(r,t,e,o,n,s){let a=y.getArrayFromDType("int32",e*n);for(let i=0;i<e;++i){let p=r.slice(i*o,(i+1)*o),c=i*n;for(let l=0;l<n;++l)a[c+l]=s==="left"?sG(p,t[l+c]):aG(p,t[l+c])}return a}function iG(r){let{inputs:t,backend:e,attrs:o}=r,{sortedSequence:n,values:s}=t,{side:a}=o,i=e.data.get(n.dataId).values,p=e.data.get(s.dataId).values,c=Bv(i,p,n.shape[0],n.shape[1],s.shape[1],a);return e.makeTensorInfo(s.shape,"int32",c)}var Gv={kernelName:si,backendName:"cpu",kernelFunc:iG};function pG(r){let{inputs:t,backend:e}=r,{condition:o,t:n,e:s}=t;U([o,n,s],"select");let a=o.shape.length,i=e.data.get(o.dataId).values,p=e.data.get(n.dataId).values,c=e.data.get(s.dataId).values,l=ne(n.dtype,s.dtype),u=y.makeZerosTypedArray(y.sizeFromShape(n.shape),l),m=0,f=a===0||a>1||n.shape.length===1?1:y.sizeFromShape(n.shape.slice(1));for(let d=0;d<i.length;d++)for(let g=0;g<f;g++)i[d]===1?u[m++]=p[d]:u[m++]=c[d];return e.makeTensorInfo(n.shape,l,u)}var Vv={kernelName:Un,backendName:"cpu",kernelFunc:pG};var cG=I.SELU_SCALEALPHA,lG=I.SELU_SCALE,uG=ht(Oo,r=>r>=0?lG*r:cG*(Math.exp(r)-1)),zv={kernelName:Oo,backendName:"cpu",kernelFunc:uG};var mG=ht(Lo,r=>r<0?-1:r>0?1:0),Wv={kernelName:Lo,backendName:"cpu",kernelFunc:mG};var fG=ht("Sin",r=>Math.sin(r)),Uv={kernelName:"Sin",backendName:"cpu",kernelFunc:fG};var dG=ht(Po,r=>Math.sinh(r)),Hv={kernelName:Po,backendName:"cpu",kernelFunc:dG};var hG=11920928955078125e-23,qv=Math.log(hG)+2,gG=ht(Bo,r=>{let t=r>-qv,e=r<qv,o=Math.exp(r),n;return e?n=o:t?n=r:n=Math.log(1+o),n}),Kv={kernelName:Bo,backendName:"cpu",kernelFunc:gG};function xG(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{blockShape:s,paddings:a}=o;U([n],"spaceToBatchND");let i=y.sizeFromShape(s),p=[[0,0]];p.push(...a);for(let $=1+s.length;$<n.shape.length;++$)p.push([0,0]);let c=Dm.kernelFunc({inputs:{x:n},backend:e,attrs:{paddings:p,constantValue:0}}),l=I.getReshaped(c.shape,s,i,!1),u=I.getPermuted(l.length,s.length,!1),m=I.getReshapedPermuted(c.shape,s,i,!1),g=vt({inputs:{x:c},backend:e,attrs:{shape:l}}),b=jt({inputs:{x:g},backend:e,attrs:{perm:u}}),E=vt({inputs:{x:b},backend:e,attrs:{shape:m}});return e.disposeIntermediateTensorInfo(c),e.disposeIntermediateTensorInfo(g),e.disposeIntermediateTensorInfo(b),E}var Xv={kernelName:qn,backendName:"cpu",kernelFunc:xG};function yG(r){let{inputs:t,backend:e}=r,{indices:o,values:n,denseShape:s,defaultValue:a}=t;if(s.shape.length!==1)throw new Error(`Dense shape must be a vector, saw:
        ${s.shape}`);if(o.shape.length!==2)throw new Error(`Indices must be a matrix, saw:
        ${o.shape}`);if(n.shape.length!==1)throw new Error(`Values must be a vector, saw:
        ${n.shape}`);if(a.shape.length!==0)throw new Error(`Default value must be a scalar, saw:
        ${a.shape}`);let i=e.data.get(o.dataId).values,p=e.data.get(n.dataId).values,c=e.data.get(s.dataId).values,l=e.data.get(a.dataId).values[0],[u,m,f,d,g]=bm(i,o.shape,o.dtype,p,n.dtype,c,l);return[e.makeTensorInfo(m,o.dtype,u),e.makeTensorInfo([m[0]],n.dtype,f),e.makeTensorInfo([d.length],"bool",new Uint8Array(d.map(h=>Number(h)))),e.makeTensorInfo([g.length],o.dtype,new Int32Array(g))]}var jv={kernelName:ii,backendName:"cpu",kernelFunc:yG};function bG(r){let{inputs:t,backend:e}=r,{inputIndices:o,inputShape:n,newShape:s}=t;if(o.shape.length!==2)throw new Error(`Input indices should be a matrix but received shape
        ${o.shape}`);if(n.shape.length!==1)throw new Error(`Input shape should be a vector but received shape
        ${n.shape}`);if(s.shape.length!==1)throw new Error(`Target shape should be a vector but received shape ${s.shape}`);let a=Array.from(e.data.get(n.dataId).values),i=e.data.get(o.dataId).values,p=Array.from(e.data.get(s.dataId).values),[c,l,u]=Cm(i,o.shape,o.dtype,a,p);return[e.makeTensorInfo(l,o.dtype,c),e.makeTensorInfo([u.length],s.dtype,new Int32Array(u))]}var Yv={kernelName:pi,backendName:"cpu",kernelFunc:bG};function CG(r){let{inputs:t,backend:e}=r,{data:o,indices:n,segmentIds:s}=t;if(o.shape.length<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(n.shape.length!==1)throw new Error(`Indices should be a vector but received shape
          ${n.shape}`);if(s.shape.length!==1)throw new Error(`Segment ids should be a vector but received shape
          ${s.shape}`);if(n.shape[0]!==s.shape[0])throw new Error("segmentIds and indices should have same size.");let a=e.data.get(o.dataId).values,i=e.data.get(n.dataId).values,p=e.data.get(s.dataId).values,[c,l]=Jp(a,o.shape,o.dtype,i,p,!0);return e.makeTensorInfo(l,o.dtype,c)}var Zv={kernelName:ci,backendName:"cpu",kernelFunc:CG};function TG(r){let{inputs:t,backend:e}=r,{data:o,indices:n,segmentIds:s}=t;if(o.shape.length<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(n.shape.length!==1)throw new Error(`Indices should be a vector but received shape
         ${n.shape}`);if(s.shape.length!==1)throw new Error(`Segment ids should be a vector but received shape
         ${s.shape}`);if(n.shape[0]!==s.shape[0])throw new Error("segmentIds and indices should have same size.");let a=e.data.get(o.dataId).values,i=e.data.get(n.dataId).values,p=e.data.get(s.dataId).values,[c,l]=Jp(a,o.shape,o.dtype,i,p);return e.makeTensorInfo(l,o.dtype,c)}var Qv={kernelName:li,backendName:"cpu",kernelFunc:TG};function SG(r){let{inputs:t,backend:e,attrs:o}=r,{sparseIndices:n,sparseValues:s,defaultValue:a}=t,{outputShape:i}=o,{sliceRank:p,numUpdates:c,sliceSize:l,strides:u,outputSize:m}=I.calculateShapes(s,n,i),f=!1,d=e.bufferSync(n),g;switch(s.dtype){case"bool":{let h=e.bufferSync(s),x=!!e.data.get(a.dataId).values[0];g=gs(d,h,i,m,l,c,p,u,x,f);break}case"float32":{let h=e.bufferSync(s),x=e.data.get(a.dataId).values[0];g=gs(d,h,i,m,l,c,p,u,x,f);break}case"int32":{let h=e.bufferSync(s),x=e.data.get(a.dataId).values[0];g=gs(d,h,i,m,l,c,p,u,x,f);break}case"string":{let h=e.bufferSync(s),x=y.decodeString(e.data.get(a.dataId).values[0]);g=gs(d,h,i,m,l,c,p,u,x,f);break}default:throw new Error(`Unsupported type ${s.dtype}`)}return e.makeTensorInfo(i,g.dtype,g.values)}var Jv={kernelName:ui,backendName:"cpu",kernelFunc:SG};function wG(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{numOrSizeSplits:s,axis:a}=o,i=y.parseAxisParam(a,n.shape)[0],p=I.prepareSplitSize(n,s,i),c=new Array(n.shape.length).fill(0),l=n.shape.slice();return p.map(u=>{let m=[...l];m[i]=u;let f=_r({inputs:{x:n},backend:e,attrs:{begin:c,size:m}});return c[i]+=u,f})}var tI={kernelName:Kn,backendName:"cpu",kernelFunc:wG};var eI={kernelName:mi,backendName:"cpu",kernelFunc:({inputs:r,backend:t})=>{let{x:e}=r,o=t;U(e,"square");let n=o.data.get(e.dataId).values,s=new Float32Array(n.length);for(let i=0;i<n.length;++i){let p=n[i];s[i]=p*p}return{dataId:o.write(s,e.shape,e.dtype),shape:e.shape,dtype:e.dtype}}};var NG=ht(Wo,(r,t)=>{let e=t;return isNaN(r)?NaN:r>0?1:e.alpha}),rI={kernelName:Wo,backendName:"cpu",kernelFunc:NG};function vG(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{begin:s,end:a,strides:i,beginMask:p,endMask:c,ellipsisMask:l,newAxisMask:u,shrinkAxisMask:m}=o;U(n,"stridedSlice");let{finalShapeSparse:f,finalShape:d,isIdentity:g,sliceDim0:h,isSimpleSlice:x,begin:b,end:S,strides:w}=de.sliceInfo(n.shape,s,a,i,p,c,l,u,m),E;if(g)E=vt({inputs:{x:n},backend:e,attrs:{shape:d}});else if(h||x){y.assert(n.shape.length>=1,()=>`Input must have rank at least 1, got: ${n.shape.length}`);let $=de.computeOutShape(b,S,w),D=_r({inputs:{x:n},backend:e,attrs:{begin:b,size:$}});E=vt({inputs:{x:D},backend:e,attrs:{shape:d}}),e.disposeIntermediateTensorInfo(D)}else{let $=e.bufferSync(n),D=Tm(f,$,w,b);E=e.makeTensorInfo(d,D.dtype,D.values)}return E}var oI={kernelName:fi,backendName:"cpu",kernelFunc:vG};function IG(r){let{inputs:t,backend:e,attrs:o}=r,{separator:n,nGramWidths:s,leftPad:a,rightPad:i,padWidth:p,preserveShortSequences:c}=o,{data:l,dataSplits:u}=t,m=e.data.get(l.dataId).values,f=e.data.get(u.dataId).values,[d,g]=Sm(m,f,n,s,a,i,p,c);return[e.makeTensorInfo([d.length],"string",d),e.makeTensorInfo(u.shape,"int32",g)]}var nI={kernelName:di,backendName:"cpu",kernelFunc:IG};function kG(r){let{inputs:t,backend:e,attrs:o}=r,{skipEmpty:n}=o,{input:s,delimiter:a}=t;if(s.dtype!=="string")throw new Error("Input must be of datatype string");if(s.shape.length!==1)throw new Error(`Input must be a vector, got shape: ${s.shape}`);if(a.shape.length!==0)throw new Error(`Delimiter must be a scalar, got shape: ${a.shape}`);let i=e.data.get(s.dataId).values,p=e.data.get(a.dataId).values[0],[c,l,u]=wm(i,p,n),m=l.length;return[e.makeTensorInfo([m,2],"int32",c),e.makeTensorInfo([m],"string",l),e.makeTensorInfo([2],"int32",new Int32Array(u))]}var sI={kernelName:hi,backendName:"cpu",kernelFunc:kG};function EG(r){let{inputs:t,backend:e,attrs:o}=r,{numBuckets:n}=o,{input:s}=t;if(s.dtype!=="string")throw new Error("Input must be of datatype string");if(n<=0)throw new Error("Number of buckets must be at least 1");let a=e.data.get(s.dataId).values,i=Nm(a,n);return e.makeTensorInfo(s.shape,"int32",i)}var aI={kernelName:gi,backendName:"cpu",kernelFunc:EG};var $G=ht("Tan",r=>Math.tan(r)),iI={kernelName:"Tan",backendName:"cpu",kernelFunc:$G};var AG=ht(zo,r=>Math.tanh(r)),pI={kernelName:zo,backendName:"cpu",kernelFunc:AG};function DG(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{reps:s}=o;U(n,"tile");let a=vm(e.bufferSync(n),s);return e.makeTensorInfo(a.shape,a.dtype,a.values)}var cI={kernelName:Wr,backendName:"cpu",kernelFunc:DG};function RG(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{k:s,sorted:a}=o;U(n,"topk");let i=e.data.get(n.dataId).values,[p,c]=Im(i,n.shape,n.dtype,s,a);return[e.makeTensorInfo(p.shape,p.dtype,p.values),e.makeTensorInfo(c.shape,c.dtype,c.values)]}var lI={kernelName:xi,backendName:"cpu",kernelFunc:RG};function FG(r){let{inputs:t,attrs:e,backend:o}=r,{image:n,transforms:s}=t,{interpolation:a,fillMode:i,fillValue:p,outputShape:c}=e,[l,u,m,f]=n.shape,[d,g]=c!=null?c:[u,m],h=[l,d,g,f],x=y.computeStrides(n.shape),b=x[0],S=x[1],w=x[2],E=y.computeStrides(h),$=E[0],D=E[1],F=E[2],P=y.getTypedArrayFromDType(n.dtype,y.sizeFromShape(h));P.fill(p);let L=o.data.get(n.dataId).values,M=o.data.get(s.dataId).values;for(let G=0;G<l;++G){let z=s.shape[0]===1?M:M.subarray(G*8,G*8+8);for(let V=0;V<d;++V)for(let H=0;H<g;++H)for(let q=0;q<f;++q){let W,K=z[6]*H+z[7]*V+1;if(K===0)continue;let Y=(z[0]*H+z[1]*V+z[2])/K,Z=(z[3]*H+z[4]*V+z[5])/K,ot=uI(Y,m,i),Q=uI(Z,u,i);switch(a){case"nearest":W=MG(L,u,m,b,S,w,G,Q,ot,q,p);break;case"bilinear":W=BG(L,u,m,b,S,w,G,Q,ot,q,p);break;default:throw new Error(`Error in Transform: Expect 'nearest' or 'bilinear', but got ${a}`)}let at=G*$+V*D+H*F+q;P[at]=W}return o.makeTensorInfo(h,n.dtype,P)}return{dataId:o.write(P,h,n.dtype),shape:n.shape,dtype:n.dtype}}var mI={kernelName:yi,backendName:"cpu",kernelFunc:FG};function uI(r,t,e){switch(e){case"reflect":return _G(r,t);case"wrap":return OG(r,t);case"nearest":return LG(r,t);default:return PG(r,t)}}function _G(r,t){let e=r;if(e<0)if(t<=1)e=0;else{let o=2*t;e<o&&(e=o*Math.trunc(-e/o)+e),e=e<-t?e+o:-e-1}else if(e>t-1)if(t<=1)e=0;else{let o=2*t;e-=o*Math.trunc(e/o),e>=t&&(e=o-e-1)}return y.clamp(0,e,t-1)}function OG(r,t){let e=r;if(e<0)if(t<=1)e=0;else{let o=t-1;e+=t*(Math.trunc(-e/o)+1)}else if(e>t-1)if(t<=1)e=0;else{let o=t-1;e-=t*Math.trunc(e/o)}return y.clamp(0,e,t-1)}function PG(r,t){return r}function LG(r,t){return y.clamp(0,r,t-1)}function ql(r,t,e,o,n,s,a,i,p,c,l){let u=a*o+i*n+p*s+c;return 0<=i&&i<t&&0<=p&&p<e?r[u]:l}function MG(r,t,e,o,n,s,a,i,p,c,l){let u=Math.round(i),m=Math.round(p);return ql(r,t,e,o,n,s,a,u,m,c,l)}function BG(r,t,e,o,n,s,a,i,p,c,l){let u=Math.floor(i),m=Math.floor(p),f=u+1,d=m+1,g=(d-p)*ql(r,t,e,o,n,s,a,u,m,c,l)+(p-m)*ql(r,t,e,o,n,s,a,u,d,c,l),h=(d-p)*ql(r,t,e,o,n,s,a,f,m,c,l)+(p-m)*ql(r,t,e,o,n,s,a,f,d,c,l);return(f-i)*g+(i-u)*h}function GG(r){let{inputs:t,attrs:e,backend:o}=r,{axis:n}=e,{x:s}=t;U(s,"unique");let a=o.data.get(s.dataId).values,{outputValues:i,outputShape:p,indices:c}=km(a,n,s.shape,s.dtype);return[o.makeTensorInfo(p,s.dtype,i),o.makeTensorInfo([c.length],"int32",c)]}var fI={kernelName:bi,backendName:"cpu",kernelFunc:GG};function VG(r){let{inputs:t,backend:e,attrs:o}=r,{value:n}=t,{axis:s}=o;s<0&&(s+=n.shape.length);let a=n.shape.length,i=n.shape[s],p=new Array(a-1),c=0;for(let f=0;f<a;f++)f!==s&&(p[c++]=n.shape[f]);let l=new Array(a).fill(0),u=n.shape.slice();u[s]=1;let m=new Array(i);for(let f=0;f<m.length;f++){l[s]=f;let d=_r({inputs:{x:n},backend:e,attrs:{begin:l,size:u}});m[f]=vt({inputs:{x:d},backend:e,attrs:{shape:p}}),e.disposeIntermediateTensorInfo(d)}return m}var dI={kernelName:jn,backendName:"cpu",kernelFunc:VG};function zG(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,segmentIds:s}=t,{numSegments:a}=o;U(n,"unsortedSegmentSum");let i=n.shape.length,p=s.shape.length,c=[],l=[],u=i-p,m=s;for(let d=0;d<u;++d){let g=ec({inputs:{input:m},backend:e,attrs:{dim:d+1}});m=g,l.push(g)}for(let d=0;d<a;++d){let g=y.createScalarValue(d,"int32"),h=e.makeTensorInfo([],"int32",g),x=fx({inputs:{a:h,b:m},backend:e}),b=Dr({inputs:{x},backend:e,attrs:{dtype:"float32"}}),S=sp({inputs:{a:b,b:n},backend:e}),w=xs({inputs:{x:S},backend:e,attrs:{axis:0,keepDims:!1}});c.push(w),l.push(h),l.push(x),l.push(b),l.push(S),l.push(w)}let f=Kx({inputs:c,backend:e,attrs:{axis:0}});return l.forEach(d=>e.disposeIntermediateTensorInfo(d)),f}var hI={kernelName:Yn,backendName:"cpu",kernelFunc:zG};var WG=[zw,tw,Ww,Uw,sw,Hw,qw,Kw,Xw,jw,Yw,Zw,Qw,Jw,tN,rN,oN,nN,sN,Vw,aN,iN,pN,cN,nw,aw,lN,ew,uN,fN,dN,hN,gN,xN,yN,bN,CN,TN,SN,wN,NN,vN,IN,kN,EN,$N,AN,DN,RN,FN,ON,Ow,PN,iw,LN,pw,MN,cw,BN,GN,VN,lw,zN,WN,UN,HN,qN,uw,mw,rw,KN,mN,XN,jN,YN,Pw,fw,dw,ZN,hw,QN,JN,tv,ev,rv,ov,nv,gw,sv,av,iv,pv,lv,uv,mv,xw,fv,dv,xv,yw,bw,yv,bv,Cv,Cw,Tv,Nv,vv,Dm,Iv,Lw,Sw,kv,Ev,$v,ow,Wl,Av,Mw,Bw,Gw,Dv,Rv,Fv,_v,Ov,Pv,Lv,Iw,Mv,Gv,Vv,zv,Ew,Wv,Uv,Hv,$w,hv,Kv,Xv,jv,Yv,Zv,Qv,Jv,tI,Dw,eI,Rw,rI,oI,nI,sI,aI,Fw,_N,iI,pI,cI,lI,mI,Tw,fI,dI,hI,Sv];for(let r of WG)Rp(r);var ip={},Rm={alpha:!1,antialias:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!1,depth:!1,stencil:!1,failIfMajorPerformanceCaveat:!0};function gI(r,t){ip[r]=t}function ar(r,t){if(!(r in ip)||t!=null){let o=HG(r,t);if(o!==null)ip[r]=o;else return console.log("Could not get context for WebGL version",r),null}let e=ip[r];return e==null||e.isContextLost()?(delete ip[r],ar(r)):(e.disable(e.DEPTH_TEST),e.disable(e.STENCIL_TEST),e.disable(e.BLEND),e.disable(e.DITHER),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SAMPLE_COVERAGE),e.enable(e.SCISSOR_TEST),e.enable(e.CULL_FACE),e.cullFace(e.BACK),ip[r])}function UG(r){if(typeof OffscreenCanvas!="undefined"&&r===2)return new OffscreenCanvas(300,150);if(typeof document!="undefined")return document.createElement("canvas");throw new Error("Cannot create a canvas in this context")}function HG(r,t){if(r!==1&&r!==2)throw new Error("Cannot get WebGL rendering context, WebGL is disabled.");let e=t==null?UG(r):t;return e.addEventListener("webglcontextlost",o=>{o.preventDefault(),delete ip[r]},!1),_().getBool("SOFTWARE_WEBGL_ENABLED")&&(Rm.failIfMajorPerformanceCaveat=!1),r===1?e.getContext("webgl",Rm)||e.getContext("experimental-webgl",Rm):e.getContext("webgl2",Rm)}var ca;(function(r){r[r.DENSE=0]="DENSE",r[r.SHARED_BATCH=1]="SHARED_BATCH"})(ca||(ca={}));var Re;(function(r){r[r.RENDER=0]="RENDER",r[r.UPLOAD=1]="UPLOAD",r[r.PIXELS=2]="PIXELS",r[r.DOWNLOAD=3]="DOWNLOAD"})(Re||(Re={}));var Ne;(function(r){r[r.UNPACKED_FLOAT16=0]="UNPACKED_FLOAT16",r[r.UNPACKED_FLOAT32=1]="UNPACKED_FLOAT32",r[r.PACKED_4X1_UNSIGNED_BYTE=2]="PACKED_4X1_UNSIGNED_BYTE",r[r.PACKED_2X2_FLOAT32=3]="PACKED_2X2_FLOAT32",r[r.PACKED_2X2_FLOAT16=4]="PACKED_2X2_FLOAT16"})(Ne||(Ne={}));function pp(r,t){return[t,r]}function xI(r,t){return r*t}function Kl(r){let t=y.sizeFromShape(r),e=Math.ceil(t/4);return y.sizeToSquarishShape(e)}function on(r,t){return[Math.max(1,Math.ceil(t/2)),Math.max(1,Math.ceil(r/2))]}function yI(r,t){let[e,o]=on(r,t);return e*o*4}function Xl(r,t){let e=r,o,n,s,a,i,p,c,l,u,m;return _().getNumber("WEBGL_VERSION")===2?(o=e.R32F,n=e.R16F,s=e.RGBA16F,a=e.RGBA32F,i=e.RED,c=4,l=1,u=e.HALF_FLOAT,m=e.FLOAT,p=e.RGBA8):(o=r.RGBA,n=r.RGBA,s=r.RGBA,a=e.RGBA,i=r.RGBA,c=4,l=4,u=t!=null?t.HALF_FLOAT_OES:null,m=r.FLOAT,p=r.RGBA),{internalFormatFloat:o,internalFormatHalfFloat:n,internalFormatPackedHalfFloat:s,internalFormatPackedFloat:a,textureFormatFloat:i,downloadTextureFormat:p,downloadUnpackNumChannels:c,defaultNumChannels:l,textureTypeHalfFloat:u,textureTypeFloat:m}}function ut(r,t){let e=t();return _().getBool("DEBUG")&&qG(r),e}function qG(r){let t=r.getError();if(t!==r.NO_ERROR)throw new Error("WebGL Error: "+jG(r,t))}var KG=596e-10,XG=65504;function bI(r){return!!(_().getBool("WEBGL_RENDER_FLOAT32_ENABLED")||r===0||KG<Math.abs(r)&&Math.abs(r)<XG)}function jG(r,t){switch(t){case r.NO_ERROR:return"NO_ERROR";case r.INVALID_ENUM:return"INVALID_ENUM";case r.INVALID_VALUE:return"INVALID_VALUE";case r.INVALID_OPERATION:return"INVALID_OPERATION";case r.INVALID_FRAMEBUFFER_OPERATION:return"INVALID_FRAMEBUFFER_OPERATION";case r.OUT_OF_MEMORY:return"OUT_OF_MEMORY";case r.CONTEXT_LOST_WEBGL:return"CONTEXT_LOST_WEBGL";default:return`Unknown error code ${t}`}}function jl(r,t){return ys(r,()=>r.getExtension(t),'Extension "'+t+'" not supported on this browser.')}function CI(r,t){let e=ys(r,()=>r.createShader(r.VERTEX_SHADER),"Unable to create vertex WebGLShader.");if(ut(r,()=>r.shaderSource(e,t)),ut(r,()=>r.compileShader(e)),r.getShaderParameter(e,r.COMPILE_STATUS)===!1)throw console.log(r.getShaderInfoLog(e)),new Error("Failed to compile vertex shader.");return e}function TI(r,t){let e=ys(r,()=>r.createShader(r.FRAGMENT_SHADER),"Unable to create fragment WebGLShader.");if(ut(r,()=>r.shaderSource(e,t)),ut(r,()=>r.compileShader(e)),_().get("ENGINE_COMPILE_ONLY"))return e;if(r.getShaderParameter(e,r.COMPILE_STATUS)===!1)throw Qx(t,r.getShaderInfoLog(e)),new Error("Failed to compile fragment shader.");return e}var YG=/ERROR: [0-9]+:([0-9]+):/g;function Qx(r,t){let e=YG.exec(t);if(e==null){console.log(`Couldn't parse line number in error: ${t}`),console.log(r);return}let o=+e[1],n=r.split(`
`),s=n.length.toString().length+2,a=n.map((u,m)=>y.rightPad((m+1).toString(),s)+u),i=0;for(let u=0;u<a.length;u++)i=Math.max(a[u].length,i);let p=a.slice(0,o-1),c=a.slice(o-1,o),l=a.slice(o);console.log(p.join(`
`)),console.log(t.split(`
`)[0]),console.log(`%c ${y.rightPad(c[0],i)}`,"border:1px solid red; background-color:#e3d2d2; color:#a61717"),console.log(l.join(`
`))}function SI(r){return ys(r,()=>r.createProgram(),"Unable to create WebGLProgram.")}function wI(r,t){if(ut(r,()=>r.linkProgram(t)),!_().get("ENGINE_COMPILE_ONLY")&&r.getProgramParameter(t,r.LINK_STATUS)===!1)throw console.log(r.getProgramInfoLog(t)),new Error("Failed to link vertex and fragment shaders.")}function _m(r,t){if(ut(r,()=>r.validateProgram(t)),r.getProgramParameter(t,r.VALIDATE_STATUS)===!1)throw console.log(r.getProgramInfoLog(t)),new Error("Shader program validation failed.")}function NI(r,t){let e=ys(r,()=>r.createBuffer(),"Unable to create WebGLBuffer");return ut(r,()=>r.bindBuffer(r.ARRAY_BUFFER,e)),ut(r,()=>r.bufferData(r.ARRAY_BUFFER,t,r.STATIC_DRAW)),e}function vI(r,t){let e=ys(r,()=>r.createBuffer(),"Unable to create WebGLBuffer");return ut(r,()=>r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e)),ut(r,()=>r.bufferData(r.ELEMENT_ARRAY_BUFFER,t,r.STATIC_DRAW)),e}function II(r){return ys(r,()=>r.createTexture(),"Unable to create WebGLTexture.")}function kI(r,t){let e=_().getNumber("WEBGL_MAX_TEXTURE_SIZE");if(r<=0||t<=0){let o=`[${r}x${t}]`;throw new Error("Requested texture size "+o+" is invalid.")}if(r>e||t>e){let o=`[${r}x${t}]`,n=`[${e}x${e}]`;throw new Error("Requested texture size "+o+" greater than WebGL maximum on this browser / GPU "+n+".")}}function EI(r){return ys(r,()=>r.createFramebuffer(),"Unable to create WebGLFramebuffer.")}function Jx(r,t,e,o,n,s,a){let i=r.getAttribLocation(t,e);return i===-1?!1:(ut(r,()=>r.bindBuffer(r.ARRAY_BUFFER,o)),ut(r,()=>r.vertexAttribPointer(i,n,r.FLOAT,!1,s,a)),ut(r,()=>r.enableVertexAttribArray(i)),!0)}function ZG(r,t,e){JG(r,e),ut(r,()=>r.activeTexture(r.TEXTURE0+e)),ut(r,()=>r.bindTexture(r.TEXTURE_2D,t))}function $I(r,t,e){return ys(r,()=>r.getUniformLocation(t,e),'uniform "'+e+'" not present in program.')}function AI(r,t,e){return r.getUniformLocation(t,e)}function DI(r,t,e,o){ut(r,()=>ZG(r,t,o)),ut(r,()=>r.uniform1i(e,o))}function Om(r,t,e){ut(r,()=>r.bindFramebuffer(r.FRAMEBUFFER,e)),ut(r,()=>r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,t,0))}function ty(r,t){ut(r,()=>r.bindFramebuffer(r.FRAMEBUFFER,t)),ut(r,()=>r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,null,0))}function Yl(r){let t=r.checkFramebufferStatus(r.FRAMEBUFFER);if(t!==r.FRAMEBUFFER_COMPLETE)throw new Error("Error binding framebuffer: "+QG(r,t))}function QG(r,t){switch(t){case r.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:return"FRAMEBUFFER_INCOMPLETE_ATTACHMENT";case r.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:return"FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";case r.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:return"FRAMEBUFFER_INCOMPLETE_DIMENSIONS";case r.FRAMEBUFFER_UNSUPPORTED:return"FRAMEBUFFER_UNSUPPORTED";default:return`unknown error ${t}`}}function ys(r,t,e){let o=ut(r,()=>t());if(o==null)throw new Error(e);return o}function JG(r,t){let e=r.MAX_COMBINED_TEXTURE_IMAGE_UNITS-1,o=t+r.TEXTURE0;if(o<r.TEXTURE0||o>e){let n=`[gl.TEXTURE0, gl.TEXTURE${e}]`;throw new Error(`textureUnit must be in ${n}.`)}}function la(r,t=2){return y.sizeFromShape(r.slice(0,r.length-t))}function ua(r){if(r.length===0)throw Error("Cannot get rows and columns of an empty shape array.");return[r.length>1?r[r.length-2]:1,r[r.length-1]]}function Pm(r){let t=[1,1,1];return r.length===0||r.length===1&&r[0]===1||(t=[la(r),...ua(r)]),t}function RI(r,t=!1){let e=_().getNumber("WEBGL_MAX_TEXTURE_SIZE"),o=_().getNumber("WEBGL_MAX_SIZE_FOR_NARROW_TEXTURE");o===1/0&&_().getBool("WEBGL_AUTO_SQUARIFY_NARROW_TEXTURE_SHAPE")&&(o=e/2),t&&(e=e*2,o=o*2,r=r.map((i,p)=>p>=r.length-2?y.nearestLargerEven(r[p]):r[p]),r.length===1&&(r=[2,r[0]])),r.length!==2&&(r=y.squeezeShape(r).newShape);let n=y.sizeFromShape(r),s=null;r.length<=1&&n<=e?s=[1,n]:r.length===2&&r[0]<=e&&r[1]<=e?s=r:r.length===3&&r[0]*r[1]<=e&&r[2]<=e?s=[r[0]*r[1],r[2]]:r.length===3&&r[0]<=e&&r[1]*r[2]<=e?s=[r[0],r[1]*r[2]]:r.length===4&&r[0]*r[1]*r[2]<=e&&r[3]<=e?s=[r[0]*r[1]*r[2],r[3]]:r.length===4&&r[0]<=e&&r[1]*r[2]*r[3]<=e&&(s=[r[0],r[1]*r[2]*r[3]]);let a=s!=null&&Math.max(...s)>o&&Math.min(...s)<=(t?2:1)&&Math.min(...s)>0;if(s==null||a)if(t){let i=la(r),p=2,c=2;r.length&&([p,c]=ua(r)),n=i*(p/2)*(c/2),s=y.sizeToSquarishShape(n).map(l=>l*2)}else s=y.sizeToSquarishShape(n);return s}function Fm(r){return r%2===0}function cp(r,t){if(r=r.slice(-2),t=t.slice(-2),y.arraysEqual(r,t)||!r.length||!t.length||r[0]===0||r[1]===0||t[0]===0||t[1]===0)return!0;if(r.length!==t.length){let e=r.slice(-1)[0],o=t.slice(-1)[0];if(e===o||Fm(e)&&Fm(o)&&(r[0]===1||t[0]===1))return!0}return r[1]===t[1]&&Fm(r[0])&&Fm(t[0])}var jx,Yx;function FI(r){if(jx==null){let t=ar(r);jx=t.getParameter(t.MAX_TEXTURE_SIZE)}return jx}function _I(r){if(Yx==null){let t=ar(r);Yx=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS)}return Math.min(16,Yx)}function OI(r){if(r===0)return 0;let t,e=ar(r);return br(e,"EXT_disjoint_timer_query_webgl2")&&r===2?t=2:br(e,"EXT_disjoint_timer_query")?t=1:t=0,t}function br(r,t){return r.getExtension(t)!=null}function ey(r){try{if(ar(r)!=null)return!0}catch(t){return console.log("Error when getting WebGL context: ",t),!1}return!1}function PI(r){if(r===0)return!1;let t=ar(r);if(r===1){if(!br(t,"OES_texture_float"))return!1}else if(!br(t,"EXT_color_buffer_float"))return!1;return Zx(t)}function LI(r){if(r===0)return!1;let t=ar(r);if(r===1){if(!br(t,"OES_texture_float")||!br(t,"WEBGL_color_buffer_float"))return!1}else{if(br(t,"EXT_color_buffer_float"))return Zx(t);let o="EXT_color_buffer_half_float";if(br(t,o)){let n=t.getExtension(o);return tV(t,n)}return!1}return Zx(t)}function Zx(r){let t=Xl(r),e=r.createTexture();r.bindTexture(r.TEXTURE_2D,e),r.texImage2D(r.TEXTURE_2D,0,t.internalFormatFloat,1,1,0,t.textureFormatFloat,t.textureTypeFloat,null);let s=r.createFramebuffer();r.bindFramebuffer(r.FRAMEBUFFER,s),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,e,0);let a=r.checkFramebufferStatus(r.FRAMEBUFFER)===r.FRAMEBUFFER_COMPLETE;return r.bindTexture(r.TEXTURE_2D,null),r.bindFramebuffer(r.FRAMEBUFFER,null),r.deleteTexture(e),r.deleteFramebuffer(s),a}function tV(r,t){let e=Xl(r,t),o=r.createTexture();r.bindTexture(r.TEXTURE_2D,o),r.texImage2D(r.TEXTURE_2D,0,e.internalFormatHalfFloat,1,1,0,e.textureFormatFloat,e.textureTypeHalfFloat,null);let a=r.createFramebuffer();r.bindFramebuffer(r.FRAMEBUFFER,a),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,o,0);let i=r.checkFramebufferStatus(r.FRAMEBUFFER)===r.FRAMEBUFFER_COMPLETE;return r.bindTexture(r.TEXTURE_2D,null),r.bindFramebuffer(r.FRAMEBUFFER,null),r.deleteTexture(o),r.deleteFramebuffer(a),i}function MI(r){return r!==2?!1:ar(r).fenceSync!=null}function nn(r,t){Array.isArray(r)||(r=[r]),r.forEach(e=>{e!=null&&y.assert(e.dtype!=="complex64",()=>`${t} does not support complex64 tensors in the WebGL backend.`)})}var dt=_();dt.registerFlag("HAS_WEBGL",()=>dt.getNumber("WEBGL_VERSION")>0);dt.registerFlag("WEBGL_VERSION",()=>ey(2)?2:ey(1)?1:0);dt.registerFlag("WEBGL_CHECK_NUMERICAL_PROBLEMS",()=>!1);dt.registerFlag("WEBGL_BUFFER_SUPPORTED",()=>dt.get("WEBGL_VERSION")===2);dt.registerFlag("WEBGL_CPU_FORWARD",()=>!0);dt.registerFlag("WEBGL_FORCE_F16_TEXTURES",()=>!1);dt.registerFlag("WEBGL_PACK",()=>dt.getBool("HAS_WEBGL"));dt.registerFlag("WEBGL_PACK_NORMALIZATION",()=>dt.getBool("WEBGL_PACK"));dt.registerFlag("WEBGL_PACK_CLIP",()=>dt.getBool("WEBGL_PACK"));dt.registerFlag("WEBGL_PACK_DEPTHWISECONV",()=>dt.getBool("WEBGL_PACK"));dt.registerFlag("WEBGL_PACK_BINARY_OPERATIONS",()=>dt.getBool("WEBGL_PACK"));dt.registerFlag("WEBGL_PACK_UNARY_OPERATIONS",()=>dt.getBool("WEBGL_PACK"));dt.registerFlag("WEBGL_PACK_ARRAY_OPERATIONS",()=>dt.getBool("WEBGL_PACK"));dt.registerFlag("WEBGL_PACK_IMAGE_OPERATIONS",()=>dt.getBool("WEBGL_PACK"));dt.registerFlag("WEBGL_PACK_REDUCE",()=>dt.getBool("WEBGL_PACK"));dt.registerFlag("WEBGL_LAZILY_UNPACK",()=>dt.getBool("WEBGL_PACK"));dt.registerFlag("WEBGL_CONV_IM2COL",()=>dt.getBool("WEBGL_PACK"));dt.registerFlag("WEBGL_MAX_TEXTURE_SIZE",()=>FI(dt.getNumber("WEBGL_VERSION")));dt.registerFlag("WEBGL_MAX_TEXTURES_IN_SHADER",()=>_I(dt.getNumber("WEBGL_VERSION")));dt.registerFlag("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION",()=>{let r=dt.getNumber("WEBGL_VERSION");return r===0?0:OI(r)});dt.registerFlag("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE",()=>dt.getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")>0&&!ds.isMobile());dt.registerFlag("WEBGL_RENDER_FLOAT32_CAPABLE",()=>PI(dt.getNumber("WEBGL_VERSION")));dt.registerFlag("WEBGL_RENDER_FLOAT32_ENABLED",()=>dt.getBool("WEBGL_FORCE_F16_TEXTURES")?!1:dt.getBool("WEBGL_RENDER_FLOAT32_CAPABLE"));dt.registerFlag("WEBGL_DOWNLOAD_FLOAT_ENABLED",()=>LI(dt.getNumber("WEBGL_VERSION")));dt.registerFlag("WEBGL_FENCE_API_ENABLED",()=>MI(dt.getNumber("WEBGL_VERSION")));dt.registerFlag("WEBGL_SIZE_UPLOAD_UNIFORM",()=>dt.getBool("WEBGL_RENDER_FLOAT32_ENABLED")?4:0);dt.registerFlag("WEBGL_DELETE_TEXTURE_THRESHOLD",()=>-1,r=>{if(r<0&&r!==-1)throw new Error(`WEBGL_DELETE_TEXTURE_THRESHOLD must be -1 (indicating never delete) or at least 0, but got ${r}.`)});dt.registerFlag("WEBGL_FLUSH_THRESHOLD",()=>ds.isMobile()?1:-1,r=>{if(r<0&&r!==-1)throw new Error(`WEBGL_FLUSH_THRESHOLD must be -1 (indicating never manual flush) or at least 0, but got ${r}.`)});dt.registerFlag("CPU_HANDOFF_SIZE_THRESHOLD",()=>128);dt.registerFlag("WEBGL_USE_SHAPES_UNIFORMS",()=>!1);dt.registerFlag("TOPK_LAST_DIM_CPU_HANDOFF_SIZE_THRESHOLD",()=>1e5);dt.registerFlag("TOPK_K_CPU_HANDOFF_THRESHOLD",()=>128);dt.registerFlag("WEBGL_EXP_CONV",()=>!1);dt.registerFlag("SOFTWARE_WEBGL_ENABLED",()=>dt.getBool("IS_TEST"));dt.registerFlag("WEBGL_MAX_SIZE_FOR_NARROW_TEXTURE",()=>1/0);dt.registerFlag("WEBGL_AUTO_SQUARIFY_NARROW_TEXTURE_SHAPE",()=>!1);dt.registerFlag("WEBGL2_ISNAN_CUSTOM",()=>!1);function Yt(){let r,t,e,o,n,s,a,i,p,c;return _().getNumber("WEBGL_VERSION")===2?(r="#version 300 es",t="in",e="out",o="in",n="texture",s="outputColor",a="out vec4 outputColor;",i=_().getBool("WEBGL2_ISNAN_CUSTOM")?`
      bool isnan_custom(float val) {
        uint floatToUint = floatBitsToUint(val);
        return (floatToUint & 0x7fffffffu) > 0x7f800000u;
      }

      bvec4 isnan_custom(vec4 val) {
        return bvec4(isnan_custom(val.x),
          isnan_custom(val.y), isnan_custom(val.z), isnan_custom(val.w));
      }

      #define isnan(value) isnan_custom(value)
    `:"",p="",c=`
      #define round(value) newRound(value)
      int newRound(float value) {
        return int(floor(value + 0.5));
      }

      ivec4 newRound(vec4 value) {
        return ivec4(floor(value + vec4(0.5)));
      }
    `):(r="",t="attribute",e="varying",o="varying",n="texture2D",s="gl_FragColor",a="",i=`
      #define isnan(value) isnan_custom(value)
      bool isnan_custom(float val) {
        return (val > 0. || val < 1. || val == 0.) ? false : true;
      }
      bvec4 isnan_custom(vec4 val) {
        return bvec4(isnan(val.x), isnan(val.y), isnan(val.z), isnan(val.w));
      }
    `,p=`
      uniform float INFINITY;

      bool isinf(float val) {
        return abs(val) == INFINITY;
      }
      bvec4 isinf(vec4 val) {
        return equal(abs(val), vec4(INFINITY));
      }
    `,c=`
      int round(float value) {
        return int(floor(value + 0.5));
      }

      ivec4 round(vec4 value) {
        return ivec4(floor(value + vec4(0.5)));
      }
    `),{version:r,attribute:t,varyingVs:e,varyingFs:o,texture2D:n,output:s,defineOutput:a,defineSpecialNaN:i,defineSpecialInf:p,defineRound:c}}function Jr(r,t,e="index"){let o=y.computeStrides(t);return o.map((n,s)=>{let a=`int ${r[s]} = ${e} / ${n}`,i=s===o.length-1?`int ${r[s+1]} = ${e} - ${r[s]} * ${n}`:`index -= ${r[s]} * ${n}`;return`${a}; ${i};`}).join("")}function lp(r,t,e="index"){let o=y.computeStrides(t);return o.map((n,s)=>{let a=`int ${r[s]} = ${e} / outShapeStrides[${s}]`,i=s===o.length-1?`int ${r[s+1]} = ${e} - ${r[s]} * outShapeStrides[${s}]`:`index -= ${r[s]} * outShapeStrides[${s}]`;return`${a}; ${i};`}).join("")}function eV(r,t){let e=r.length,o=r.map(s=>`${t}[${s}]`),n=new Array(e-1);n[e-2]=o[e-1];for(let s=e-3;s>=0;--s)n[s]=`(${n[s+1]} * ${o[s+1]})`;return n}function BI(r,t,e="index"){let o=r.map((s,a)=>a),n=eV(o,t);return n.map((s,a)=>{let i=`int ${r[a]} = ${e} / ${n[a]}`,p=a===n.length-1?`int ${r[a+1]} = ${e} - ${r[a]} * ${n[a]}`:`index -= ${r[a]} * ${n[a]}`;return`${i}; ${p};`}).join("")}function rc(r){let t=y.computeStrides(r).map(e=>e.toString());return`
  int getFlatIndex(ivec3 coords) {
    return coords.x * ${t[0]} + coords.y * ${t[1]} + coords.z;
  }
`}function oc(){return`
  int getFlatIndex(ivec3 coords) {
    return coords.x * outShapeStrides[0] + coords.y * outShapeStrides[1] + coords.z;
  }
`}var Mm=`
  const float FLOAT_MAX = 1.70141184e38;
  const float FLOAT_MIN = 1.17549435e-38;

  lowp vec4 encode_float(highp float v) {
    if (isnan(v)) {
      return vec4(255, 255, 255, 255);
    }

    highp float av = abs(v);

    if(av < FLOAT_MIN) {
      return vec4(0.0, 0.0, 0.0, 0.0);
    } else if(v > FLOAT_MAX) {
      return vec4(0.0, 0.0, 128.0, 127.0) / 255.0;
    } else if(v < -FLOAT_MAX) {
      return vec4(0.0, 0.0,  128.0, 255.0) / 255.0;
    }

    highp vec4 c = vec4(0,0,0,0);

    highp float e = floor(log2(av));
    highp float m = exp2(fract(log2(av))) - 1.0;

    c[2] = floor(128.0 * m);
    m -= c[2] / 128.0;
    c[1] = floor(32768.0 * m);
    m -= c[1] / 32768.0;
    c[0] = floor(8388608.0 * m);

    highp float ebias = e + 127.0;
    c[3] = floor(ebias / 2.0);
    ebias -= c[3] * 2.0;
    c[2] += floor(ebias) * 128.0;

    c[3] += 128.0 * step(0.0, -v);

    return c / 255.0;
  }
`;var{getBroadcastDims:GI}=I;function VI(r,t,e){let o=[];if(r.forEach(f=>{let d=y.sizeFromShape(f.shapeInfo.logicalShape);if(f.shapeInfo.isUniform?o.push(`uniform float ${f.name}${d>1?`[${d}]`:""};`):(o.push(`uniform sampler2D ${f.name};`),o.push(`uniform int offset${f.name};`)),e.enableShapeUniforms){let{uniformShape:g}=Bm(e.packedInputs,f.shapeInfo.logicalShape,f.shapeInfo.texShape);switch(g.length){case 1:o.push(`uniform int ${f.name}Shape;`);break;case 2:o.push(`uniform ivec2 ${f.name}Shape;`);break;case 3:o.push(`uniform ivec3 ${f.name}Shape;`);break;case 4:o.push(`uniform ivec4 ${f.name}Shape;`);break;default:break}o.push(`uniform ivec2 ${f.name}TexShape;`)}}),e.enableShapeUniforms){switch(t.logicalShape.length){case 1:o.push("uniform int outShape;");break;case 2:o.push("uniform ivec2 outShape;"),o.push("uniform int outShapeStrides;");break;case 3:o.push("uniform ivec3 outShape;"),o.push("uniform ivec2 outShapeStrides;");break;case 4:o.push("uniform ivec4 outShape;"),o.push("uniform ivec3 outShapeStrides;");break;default:break}o.push("uniform ivec2 outTexShape;")}e.customUniforms&&e.customUniforms.forEach(f=>{o.push(`uniform ${f.type} ${f.name}${f.arrayIndex?`[${f.arrayIndex}]`:""};`)});let n=o.join(`
`),s=r.map(f=>rV(f,t,e.packedInputs,e.enableShapeUniforms)).join(`
`),a=t.texShape,i=Yt(),p=sV(i),c,l,u=pV(i);return t.isPacked?(c=oV(t.logicalShape,a,e.enableShapeUniforms),l=iV(i)):(c=nV(t.logicalShape,a,e.enableShapeUniforms),l=aV(i)),e.packedInputs&&(u+=mV),[u,p,l,n,c,s,e.userCode].join(`
`)}function sc(r,t=!1){let e=r.shapeInfo.logicalShape;switch(e.length){case 0:return NV(r,t);case 1:return IV(r,t);case 2:return EV(r,t);case 3:return AV(r,t);case 4:return RV(r,t);case 5:return FV(r);case 6:return _V(r);default:throw new Error(`${e.length}-D input sampling is not yet supported`)}}function zI(r,t){switch(r.shapeInfo.logicalShape.length){case 0:return wV(r);case 1:return vV(r,t);case 2:return kV(r,t);case 3:return $V(r,t);default:return DV(r,t)}}function rV(r,t,e=!1,o){let n="";e?n+=zI(r,o):n+=sc(r,o);let s=r.shapeInfo.logicalShape,a=t.logicalShape;return s.length<=a.length&&(e?n+=OV(r,t):n+=PV(r,t)),n}function oV(r,t,e){switch(r.length){case 0:return WI();case 1:return fV(r,t,e);case 2:return TV(r,t,e);case 3:return hV(r,t,e);default:return xV(r,t,e)}}function nV(r,t,e){switch(r.length){case 0:return WI();case 1:return dV(r,t,e);case 2:return SV(r,t,e);case 3:return gV(r,t,e);case 4:return yV(r,t,e);case 5:return bV(r,t);case 6:return CV(r,t);default:throw new Error(`${r.length}-D output sampling is not yet supported`)}}function sV(r){return`
    float sampleTexture(sampler2D textureSampler, vec2 uv) {
      return ${r.texture2D}(textureSampler, uv).r;
    }
  `}function aV(r){return`
    void setOutput(float val) {
      ${r.output} = vec4(val, 0, 0, 0);
    }
  `}function iV(r){return`
    void setOutput(vec4 val) {
      ${r.output} = val;
    }
  `}function pV(r){return`${r.version}
    precision highp float;
    precision highp int;
    precision highp sampler2D;
    ${r.varyingFs} vec2 resultUV;
    ${r.defineOutput}
    const vec2 halfCR = vec2(0.5, 0.5);

    struct ivec5
    {
      int x;
      int y;
      int z;
      int w;
      int u;
    };

    struct ivec6
    {
      int x;
      int y;
      int z;
      int w;
      int u;
      int v;
    };

    uniform float NAN;
    ${r.defineSpecialNaN}
    ${r.defineSpecialInf}
    ${r.defineRound}

    int imod(int x, int y) {
      return x - y * (x / y);
    }

    int idiv(int a, int b, float sign) {
      int res = a / b;
      int mod = imod(a, b);
      if (sign < 0. && mod != 0) {
        res -= 1;
      }
      return res;
    }

    //Based on the work of Dave Hoskins
    //https://www.shadertoy.com/view/4djSRW
    #define HASHSCALE1 443.8975
    float random(float seed){
      vec2 p = resultUV * seed;
      vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
      p3 += dot(p3, p3.yzx + 19.19);
      return fract((p3.x + p3.y) * p3.z);
    }

    ${cV}
    ${lV}
    ${uV}
  `}var cV=`
vec2 uvFromFlat(int texNumR, int texNumC, int index) {
  int texR = index / texNumC;
  int texC = index - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
vec2 packedUVfrom1D(int texNumR, int texNumC, int index) {
  int texelIndex = index / 2;
  int texR = texelIndex / texNumC;
  int texC = texelIndex - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,lV=`
vec2 packedUVfrom2D(int texelsInLogicalRow, int texNumR,
  int texNumC, int row, int col) {
  int texelIndex = (row / 2) * texelsInLogicalRow + (col / 2);
  int texR = texelIndex / texNumC;
  int texC = texelIndex - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,uV=`
vec2 packedUVfrom3D(int texNumR, int texNumC,
    int texelsInBatch, int texelsInLogicalRow, int b,
    int row, int col) {
  int index = b * texelsInBatch + (row / 2) * texelsInLogicalRow + (col / 2);
  int texR = index / texNumC;
  int texC = index - texR * texNumC;
  return (vec2(texC, texR) + halfCR) / vec2(texNumC, texNumR);
}
`,mV=`
  float getChannel(vec4 frag, vec2 innerDims) {
    vec2 modCoord = mod(innerDims, 2.);
    return modCoord.x == 0. ?
      (modCoord.y == 0. ? frag.r : frag.g) :
      (modCoord.y == 0. ? frag.b : frag.a);
  }
  float getChannel(vec4 frag, int dim) {
    float modCoord = mod(float(dim), 2.);
    return modCoord == 0. ? frag.r : frag.g;
  }
`;function WI(){return`
    int getOutputCoords() {
      return 0;
    }
  `}function fV(r,t,e){let o=[Math.ceil(t[0]/2),Math.ceil(t[1]/2)];return o[0]===1?e?`
      int getOutputCoords() {
        return 2 * int(resultUV.x * ceil(float(outTexShape[1]) / 2.0));
      }
    `:`
      int getOutputCoords() {
        return 2 * int(resultUV.x * ${o[1]}.0);
      }
    `:o[1]===1?e?`
      int getOutputCoords() {
        return 2 * int(resultUV.y * ceil(float(outTexShape[0]) / 2.0));
      }
    `:`
      int getOutputCoords() {
        return 2 * int(resultUV.y * ${o[0]}.0);
      }
    `:e?`
    int getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));
      return 2 * (resTexRC.x * packedTexShape[1] + resTexRC.y);
    }
  `:`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${o[0]}, ${o[1]}));
      return 2 * (resTexRC.x * ${o[1]} + resTexRC.y);
    }
  `}function dV(r,t,e){return t[0]===1?e?`
      int getOutputCoords() {
        return int(resultUV.x * float(outTexShape[1]));
      }
    `:`
      int getOutputCoords() {
        return int(resultUV.x * ${t[1]}.0);
      }
    `:t[1]===1?e?`
      int getOutputCoords() {
        return int(resultUV.y * float(outTexShape[0]));
      }
    `:`
      int getOutputCoords() {
        return int(resultUV.y * ${t[0]}.0);
      }
    `:e?`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(outTexShape[0], outTexShape[1]));
      return resTexRC.x * outTexShape[1] + resTexRC.y;
    }
  `:`
    int getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${t[0]}, ${t[1]}));
      return resTexRC.x * ${t[1]} + resTexRC.y;
    }
  `}function hV(r,t,e){if(e)return`
    ivec3 getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      int texelsInLogicalRow = int(ceil(float(outShape[2]) / 2.0));
      int texelsInBatch = texelsInLogicalRow * int(ceil(float(outShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));
      int index = resTexRC.x * packedTexShape[1] + resTexRC.y;

      int b = index / texelsInBatch;
      index -= b * texelsInBatch;

      int r = 2 * (index / texelsInLogicalRow);
      int c = imod(index, texelsInLogicalRow) * 2;

      return ivec3(b, r, c);
    }
  `;let o=[Math.ceil(t[0]/2),Math.ceil(t[1]/2)],n=Math.ceil(r[2]/2),s=n*Math.ceil(r[1]/2);return`
    ivec3 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${o[0]}, ${o[1]}));
      int index = resTexRC.x * ${o[1]} + resTexRC.y;

      int b = index / ${s};
      index -= b * ${s};

      int r = 2 * (index / ${n});
      int c = imod(index, ${n}) * 2;

      return ivec3(b, r, c);
    }
  `}function gV(r,t,e){if(e)return`
  ivec3 getOutputCoords() {
    ivec2 resTexRC = ivec2(resultUV.yx *
                           vec2(outTexShape[0], outTexShape[1]));
    int index = resTexRC.x * outTexShape[1] + resTexRC.y;
    ${lp(["r","c","d"],r)}
    return ivec3(r, c, d);
  }
`;let o=Jr(["r","c","d"],r);return`
    ivec3 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${t[0]}, ${t[1]}));
      int index = resTexRC.x * ${t[1]} + resTexRC.y;
      ${o}
      return ivec3(r, c, d);
    }
  `}function xV(r,t,e){if(e)return`
    ivec4 getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));
      int index = resTexRC.x * packedTexShape[1] + resTexRC.y;

      int texelsInLogicalRow = int(ceil(float(outShape[3]) / 2.0));
      int texelsInBatch = texelsInLogicalRow * int(ceil(float(outShape[2]) / 2.0));
      int texelsInBatchN = texelsInBatch * outShape[1];

      int b2 = index / texelsInBatchN;
      index -= b2 * texelsInBatchN;

      int b = index / texelsInBatch;
      index -= b * texelsInBatch;

      int r = 2 * (index / texelsInLogicalRow);
      int c = imod(index, texelsInLogicalRow) * 2;

      return ivec4(b2, b, r, c);
    }
  `;let o=[Math.ceil(t[0]/2),Math.ceil(t[1]/2)],n=Math.ceil(r[r.length-1]/2),s=n*Math.ceil(r[r.length-2]/2),a=s,i="",p="b, r, c";for(let c=2;c<r.length-1;c++)a*=r[r.length-c-1],i=`
      int b${c} = index / ${a};
      index -= b${c} * ${a};
    `+i,p=`b${c}, `+p;return`
    ivec${r.length} getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${o[0]}, ${o[1]}));
      int index = resTexRC.x * ${o[1]} + resTexRC.y;

      ${i}

      int b = index / ${s};
      index -= b * ${s};

      int r = 2 * (index / ${n});
      int c = imod(index, ${n}) * 2;

      return ivec${r.length}(${p});
    }
  `}function yV(r,t,e){if(e)return`
    ivec4 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(outTexShape[0], outTexShape[1]));
      int index = resTexRC.x * outTexShape[1] + resTexRC.y;
      ${lp(["r","c","d","d2"],r)}
      return ivec4(r, c, d, d2);
    }
  `;let o=Jr(["r","c","d","d2"],r);return`
    ivec4 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(${t[0]}, ${t[1]}));
      int index = resTexRC.x * ${t[1]} + resTexRC.y;
      ${o}
      return ivec4(r, c, d, d2);
    }
  `}function bV(r,t){let e=Jr(["r","c","d","d2","d3"],r);return`
    ivec5 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx * vec2(${t[0]},
                             ${t[1]}));

      int index = resTexRC.x * ${t[1]} + resTexRC.y;

      ${e}

      ivec5 outShape = ivec5(r, c, d, d2, d3);
      return outShape;
    }
  `}function CV(r,t){let e=Jr(["r","c","d","d2","d3","d4"],r);return`
    ivec6 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
        vec2(${t[0]}, ${t[1]}));
      int index = resTexRC.x * ${t[1]} + resTexRC.y;

      ${e}

      ivec6 result = ivec6(r, c, d, d2, d3, d4);
      return result;
    }
  `}function TV(r,t,e){let o=[Math.ceil(t[0]/2),Math.ceil(t[1]/2)];if(y.arraysEqual(r,t))return e?`
      ivec2 getOutputCoords() {
        ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
        return 2 * ivec2(resultUV.yx * vec2(packedTexShape[0], packedTexShape[1]));
      }
    `:`
      ivec2 getOutputCoords() {
        return 2 * ivec2(resultUV.yx * vec2(${o[0]}, ${o[1]}));
      }
    `;let n=Math.ceil(r[1]/2);return e?`
    ivec2 getOutputCoords() {
      ivec2 packedTexShape = ivec2(ceil(float(outTexShape[0]) / 2.0), ceil(float(outTexShape[1]) / 2.0));
      int texelsInLogicalRow = int(ceil(float(outShape[1]) / 2.0));
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(packedTexShape[0], packedTexShape[1]));

      int index = resTexRC.x * packedTexShape[1] + resTexRC.y;
      int r = 2 * (index / texelsInLogicalRow);
      int c = imod(index, texelsInLogicalRow) * 2;

      return ivec2(r, c);
    }
  `:`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${o[0]}, ${o[1]}));

      int index = resTexRC.x * ${o[1]} + resTexRC.y;
      int r = 2 * (index / ${n});
      int c = imod(index, ${n}) * 2;

      return ivec2(r, c);
    }
  `}function SV(r,t,e){return y.arraysEqual(r,t)?e?`
      ivec2 getOutputCoords() {
        return ivec2(resultUV.yx * vec2(outTexShape[0], outTexShape[1]));
      }
    `:`
      ivec2 getOutputCoords() {
        return ivec2(resultUV.yx * vec2(${t[0]}, ${t[1]}));
      }
    `:r[1]===1?e?`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(outTexShape[0], outTexShape[1]));
        int index = resTexRC.x * outTexShape[1] + resTexRC.y;
        return ivec2(index, 0);
      }
    `:`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(${t[0]}, ${t[1]}));
        int index = resTexRC.x * ${t[1]} + resTexRC.y;
        return ivec2(index, 0);
      }
    `:r[0]===1?e?`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(outTexShape[0], outTexShape[1]));
        int index = resTexRC.x * outTexShape[1] + resTexRC.y;
        return ivec2(0, index);
      }
    `:`
      ivec2 getOutputCoords() {
        ivec2 resTexRC = ivec2(resultUV.yx *
                               vec2(${t[0]}, ${t[1]}));
        int index = resTexRC.x * ${t[1]} + resTexRC.y;
        return ivec2(0, index);
      }
    `:e?`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(outTexShape[0], outTexShape[1]));
      int index = resTexRC.x * outTexShape[1] + resTexRC.y;
      int r = index / outShape[1];
      int c = index - r * outShape[1];
      return ivec2(r, c);
    }
  `:`
    ivec2 getOutputCoords() {
      ivec2 resTexRC = ivec2(resultUV.yx *
                             vec2(${t[0]}, ${t[1]}));
      int index = resTexRC.x * ${t[1]} + resTexRC.y;
      int r = index / ${r[1]};
      int c = index - r * ${r[1]};
      return ivec2(r, c);
    }
  `}function up(r){return`offset${r}`}function wV(r){let t=r.name,e="get"+t.charAt(0).toUpperCase()+t.slice(1),o=Yt();return`
    vec4 ${e}() {
      return ${o.texture2D}(${t}, halfCR);
    }
  `}function NV(r,t){let e=r.name,o="get"+e.charAt(0).toUpperCase()+e.slice(1);if(r.shapeInfo.isUniform)return`float ${o}() {return ${e};}`;let[n,s]=r.shapeInfo.texShape;if(n===1&&s===1)return`
      float ${o}() {
        return sampleTexture(${e}, halfCR);
      }
    `;let a=up(e);if(t)return`
    float ${o}() {
      vec2 uv = uvFromFlat(${e}TexShape[0], ${e}TexShape[1], ${a});
      return sampleTexture(${e}, uv);
    }
  `;let[i,p]=r.shapeInfo.texShape;return`
    float ${o}() {
      vec2 uv = uvFromFlat(${i}, ${p}, ${a});
      return sampleTexture(${e}, uv);
    }
  `}function vV(r,t){let e=r.name,o="get"+e.charAt(0).toUpperCase()+e.slice(1),n=r.shapeInfo.texShape,s=Yt();if(t)return`
    vec4 ${o}(int index) {
      ivec2 packedTexShape = ivec2(ceil(float(${e}TexShape[0]) / 2.0), ceil(float(${e}TexShape[1]) / 2.0));
      vec2 uv = packedUVfrom1D(
        packedTexShape[0], packedTexShape[1], index);
      return ${s.texture2D}(${e}, uv);
    }
  `;let a=[Math.ceil(n[0]/2),Math.ceil(n[1]/2)];return`
    vec4 ${o}(int index) {
      vec2 uv = packedUVfrom1D(
        ${a[0]}, ${a[1]}, index);
      return ${s.texture2D}(${e}, uv);
    }
  `}function IV(r,t){let e=r.name,o="get"+e.charAt(0).toUpperCase()+e.slice(1);if(r.shapeInfo.isUniform)return`
      float ${o}(int index) {
        ${ac(r)}
      }
    `;let n=r.shapeInfo.texShape,s=n[0],a=n[1];if(a===1&&s===1)return`
      float ${o}(int index) {
        return sampleTexture(${e}, halfCR);
      }
    `;let i=up(e);return a===1?t?`
      float ${o}(int index) {
        vec2 uv = vec2(0.5, (float(index + ${i}) + 0.5) / float(${e}TexShape[0]));
        return sampleTexture(${e}, uv);
      }
    `:`
      float ${o}(int index) {
        vec2 uv = vec2(0.5, (float(index + ${i}) + 0.5) / ${s}.0);
        return sampleTexture(${e}, uv);
      }
    `:s===1?t?`
      float ${o}(int index) {
        vec2 uv = vec2((float(index + ${i}) + 0.5) / float(${e}TexShape[1]), 0.5);
        return sampleTexture(${e}, uv);
      }
    `:`
      float ${o}(int index) {
        vec2 uv = vec2((float(index + ${i}) + 0.5) / ${a}.0, 0.5);
        return sampleTexture(${e}, uv);
      }
    `:t?`
    float ${o}(int index) {
      vec2 uv = uvFromFlat(${e}TexShape[0], ${e}TexShape[1], index + ${i});
      return sampleTexture(${e}, uv);
    }
  `:`
    float ${o}(int index) {
      vec2 uv = uvFromFlat(${s}, ${a}, index + ${i});
      return sampleTexture(${e}, uv);
    }
  `}function kV(r,t){let e=r.shapeInfo.logicalShape,o=r.name,n="get"+o.charAt(0).toUpperCase()+o.slice(1),s=r.shapeInfo.texShape,a=s[0],i=s[1],p=Yt();if(s!=null&&y.arraysEqual(e,s))return t?`
      vec4 ${n}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${o}TexShape[1], ${o}TexShape[0]);

        return ${p.texture2D}(${o}, uv);
      }
    `:`
      vec4 ${n}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${i}.0, ${a}.0);

        return ${p.texture2D}(${o}, uv);
      }
    `;if(t)return`
    vec4 ${n}(int row, int col) {
      ivec2 packedTexShape = ivec2(ceil(float(${o}TexShape[0]) / 2.0), ceil(float(${o}TexShape[1]) / 2.0));
      int valuesPerRow = int(ceil(float(${o}Shape[1]) / 2.0));
      vec2 uv = packedUVfrom2D(valuesPerRow, packedTexShape[0], packedTexShape[1], row, col);
      return ${p.texture2D}(${o}, uv);
    }
  `;let c=[Math.ceil(s[0]/2),Math.ceil(s[1]/2)],l=Math.ceil(e[1]/2);return`
    vec4 ${n}(int row, int col) {
      vec2 uv = packedUVfrom2D(${l}, ${c[0]}, ${c[1]}, row, col);
      return ${p.texture2D}(${o}, uv);
    }
  `}function EV(r,t){let e=r.shapeInfo.logicalShape,o=r.name,n="get"+o.charAt(0).toUpperCase()+o.slice(1),s=r.shapeInfo.texShape;if(s!=null&&y.arraysEqual(e,s)){if(t)return`
      float ${n}(int row, int col) {
        vec2 uv = (vec2(col, row) + halfCR) / vec2(${o}TexShape[1], ${o}TexShape[0]);
        return sampleTexture(${o}, uv);
      }
    `;let m=s[0],f=s[1];return`
    float ${n}(int row, int col) {
      vec2 uv = (vec2(col, row) + halfCR) / vec2(${f}.0, ${m}.0);
      return sampleTexture(${o}, uv);
    }
  `}let{newShape:a,keptDims:i}=y.squeezeShape(e),p=a;if(p.length<e.length){let m=ic(r,p),f=["row","col"];return`
      ${sc(m,t)}
      float ${n}(int row, int col) {
        return ${n}(${pc(f,i)});
      }
    `}if(r.shapeInfo.isUniform)return`
      float ${n}(int row, int col) {
        int index = round(dot(vec2(row, col), vec2(${e[1]}, 1)));
        ${ac(r)}
      }
    `;let c=s[0],l=s[1],u=up(o);return l===1?t?`
      float ${n}(int row, int col) {
        float index = dot(vec3(row, col, ${u}), vec3(${o}Shape[1], 1, 1));
        vec2 uv = vec2(0.5, (index + 0.5) / float(${o}TexShape[0]));
        return sampleTexture(${o}, uv);
      }
    `:`
    float ${n}(int row, int col) {
      float index = dot(vec3(row, col, ${u}), vec3(${e[1]}, 1, 1));
      vec2 uv = vec2(0.5, (index + 0.5) / ${c}.0);
      return sampleTexture(${o}, uv);
    }
  `:c===1?t?`
      float ${n}(int row, int col) {
        float index = dot(vec3(row, col, ${u}), vec3(${o}Shape[1], 1, 1));
        vec2 uv = vec2((index + 0.5) / float(${o}TexShape[1]), 0.5);
        return sampleTexture(${o}, uv);
      }
    `:`
    float ${n}(int row, int col) {
      float index = dot(vec3(row, col, ${u}), vec3(${e[1]}, 1, 1));
      vec2 uv = vec2((index + 0.5) / ${l}.0, 0.5);
      return sampleTexture(${o}, uv);
    }
  `:t?`
      float ${n}(int row, int col) {
        // Explicitly use integer operations as dot() only works on floats.
        int index = row * ${o}Shape[1] + col + ${u};
        vec2 uv = uvFromFlat(${o}TexShape[0], ${o}TexShape[1], index);
        return sampleTexture(${o}, uv);
      }
    `:`
  float ${n}(int row, int col) {
    // Explicitly use integer operations as dot() only works on floats.
    int index = row * ${e[1]} + col + ${u};
    vec2 uv = uvFromFlat(${c}, ${l}, index);
    return sampleTexture(${o}, uv);
  }
`}function $V(r,t){let e=r.shapeInfo.logicalShape,o=r.name,n="get"+o.charAt(0).toUpperCase()+o.slice(1),s=r.shapeInfo.texShape,a=[Math.ceil(s[0]/2),Math.ceil(s[1]/2)];if(e[0]===1){let m=e.slice(1),f=[1,2],d=ic(r,m),g=["b","row","col"];return`
        ${zI(d,t)}
        vec4 ${n}(int b, int row, int col) {
          return ${n}(${pc(g,f)});
        }
      `}let i=Yt();if(t)return`
    vec4 ${n}(int b, int row, int col) {
      ivec2 packedTexShape = ivec2(ceil(float(${o}TexShape[0]) / 2.0), ceil(float(${o}TexShape[1]) / 2.0));
      int valuesPerRow = int(ceil(float(${o}Shape[2]) / 2.0));
      int texelsInBatch = valuesPerRow * int(ceil(float(${o}Shape[1]) / 2.0));
      vec2 uv = packedUVfrom3D(
        packedTexShape[0], packedTexShape[1], texelsInBatch, valuesPerRow, b, row, col);
      return ${i.texture2D}(${o}, uv);
    }
  `;let p=a[0],c=a[1],l=Math.ceil(e[2]/2),u=l*Math.ceil(e[1]/2);return`
    vec4 ${n}(int b, int row, int col) {
      vec2 uv = packedUVfrom3D(
        ${p}, ${c}, ${u}, ${l}, b, row, col);
      return ${i.texture2D}(${o}, uv);
    }
  `}function AV(r,t){let e=r.shapeInfo.logicalShape,o=r.name,n="get"+o.charAt(0).toUpperCase()+o.slice(1),s=e[1]*e[2],a=e[2],{newShape:i,keptDims:p}=y.squeezeShape(e),c=i;if(c.length<e.length){let g=ic(r,c),h=["row","col","depth"];return`
        ${sc(g,t)}
        float ${n}(int row, int col, int depth) {
          return ${n}(${pc(h,p)});
        }
      `}if(r.shapeInfo.isUniform)return`
      float ${n}(int row, int col, int depth) {
        int index = round(dot(vec3(row, col, depth),
                          vec3(${s}, ${a}, 1)));
        ${ac(r)}
      }
    `;let l=r.shapeInfo.texShape,u=l[0],m=l[1],f=r.shapeInfo.flatOffset;if(m===s&&f==null)return t?`
      float ${n}(int row, int col, int depth) {
        int stride1 = ${o}Shape[2];
        float texR = float(row);
        float texC = dot(vec2(col, depth), vec2(stride1, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${o}TexShape[1], ${o}TexShape[0]);
        return sampleTexture(${o}, uv);
      }
    `:`
        float ${n}(int row, int col, int depth) {
          float texR = float(row);
          float texC = dot(vec2(col, depth), vec2(${a}, 1));
          vec2 uv = (vec2(texC, texR) + halfCR) /
                     vec2(${m}.0, ${u}.0);
          return sampleTexture(${o}, uv);
        }
      `;if(m===a&&f==null)return t?`
      float ${n}(int row, int col, int depth) {
        float texR = dot(vec2(row, col), vec2(${o}Shape[1], 1));
        float texC = float(depth);
        vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${o}TexShape[1], ${o}TexShape[0]);
        return sampleTexture(${o}, uv);
      }
    `:`
    float ${n}(int row, int col, int depth) {
      float texR = dot(vec2(row, col), vec2(${e[1]}, 1));
      float texC = float(depth);
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${m}.0, ${u}.0);
      return sampleTexture(${o}, uv);
    }
  `;let d=up(o);return t?`
    float ${n}(int row, int col, int depth) {
      // Explicitly use integer operations as dot() only works on floats.
      int stride0 = ${o}Shape[1] * ${o}Shape[2];
      int stride1 = ${o}Shape[2];
      int index = row * stride0 + col * stride1 + depth + ${d};
      vec2 uv = uvFromFlat(${o}TexShape[0], ${o}TexShape[1], index);
      return sampleTexture(${o}, uv);
    }
    `:`
      float ${n}(int row, int col, int depth) {
        // Explicitly use integer operations as dot() only works on floats.
        int index = row * ${s} + col * ${a} + depth + ${d};
        vec2 uv = uvFromFlat(${u}, ${m}, index);
        return sampleTexture(${o}, uv);
      }
  `}function DV(r,t){let e=r.name,o="get"+e.charAt(0).toUpperCase()+e.slice(1),n=Yt();if(t)return`
    vec4 ${o}(int b2, int b, int row, int col) {
      int valuesPerRow = int(ceil(float(${e}Shape[3]) / 2.0));
      int texelsInBatch = valuesPerRow * int(ceil(float(${e}Shape[2]) / 2.0));
      int index = b * texelsInBatch + (row / 2) * valuesPerRow + (col / 2);
      texelsInBatch *= ${e}Shape[1];
      index = b2 * texelsInBatch + index;
      ivec2 packedTexShape = ivec2(ceil(float(${e}TexShape[0]) / 2.0), ceil(float(${e}TexShape[1]) / 2.0));
      int texR = index / packedTexShape[1];
      int texC = index - texR * packedTexShape[1];
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(packedTexShape[1], packedTexShape[0]); return ${n.texture2D}(${e}, uv);
    }
  `;let s=r.shapeInfo.logicalShape,a=s.length,i=r.shapeInfo.texShape,p=[Math.ceil(i[0]/2),Math.ceil(i[1]/2)],c=p[0],l=p[1],u=Math.ceil(s[a-1]/2),m=u*Math.ceil(s[a-2]/2),f="int b, int row, int col",d=`b * ${m} + (row / 2) * ${u} + (col / 2)`;for(let g=2;g<a-1;g++)f=`int b${g}, `+f,m*=s[a-g-1],d=`b${g} * ${m} + `+d;return`
    vec4 ${o}(${f}) {
      int index = ${d};
      int texR = index / ${l};
      int texC = index - texR * ${l};
      vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${l}, ${c});
      return ${n.texture2D}(${e}, uv);
    }
  `}function RV(r,t){let e=r.shapeInfo.logicalShape,o=r.name,n="get"+o.charAt(0).toUpperCase()+o.slice(1),s=e[3],a=e[2]*s,i=e[1]*a,{newShape:p,keptDims:c}=y.squeezeShape(e);if(p.length<e.length){let b=ic(r,p),S=["row","col","depth","depth2"];return`
      ${sc(b,t)}
      float ${n}(int row, int col, int depth, int depth2) {
        return ${n}(${pc(S,c)});
      }
    `}if(r.shapeInfo.isUniform)return`
      float ${n}(int row, int col, int depth, int depth2) {
        int index = round(dot(vec4(row, col, depth, depth2),
                          vec4(${i}, ${a}, ${s}, 1)));
        ${ac(r)}
      }
    `;let l=r.shapeInfo.flatOffset,u=r.shapeInfo.texShape,m=u[0],f=u[1],d=`int stride2 = ${o}Shape[3];`,g=`int stride1 = ${o}Shape[2] * stride2;`,h=`int stride0 = ${o}Shape[1] * stride1;`;if(f===i&&l==null)return t?`
      float ${n}(int row, int col, int depth, int depth2) {
        ${d}
        ${g}
        float texR = float(row);
        float texC =
            dot(vec3(col, depth, depth2),
                vec3(stride1, stride2, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${o}TexShape[1], ${o}TexShape[0]);
        return sampleTexture(${o}, uv);
      }
    `:`
      float ${n}(int row, int col, int depth, int depth2) {
        float texR = float(row);
        float texC =
            dot(vec3(col, depth, depth2),
                vec3(${a}, ${s}, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${f}.0, ${m}.0);
        return sampleTexture(${o}, uv);
      }
    `;if(f===s&&l==null)return t?`
      float ${n}(int row, int col, int depth, int depth2) {
        float texR = dot(vec3(row, col, depth),
                         vec3(${o}Shape[1] * ${o}Shape[2], ${o}Shape[2], 1));
        float texC = float(depth2);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${o}TexShape[1], ${o}TexShape[0]);
        return sampleTexture(${o}, uv);
      }
    `:`
      float ${n}(int row, int col, int depth, int depth2) {
        float texR = dot(vec3(row, col, depth),
                         vec3(${e[1]*e[2]}, ${e[2]}, 1));
        float texC = float(depth2);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${f}.0, ${m}.0);
        return sampleTexture(${o}, uv);
      }
    `;let x=up(o);return t?`
    float ${n}(int row, int col, int depth, int depth2) {
      // Explicitly use integer operations as dot() only works on floats.
      ${d}
      ${g}
      ${h}
      int index = row * stride0 + col * stride1 +
          depth * stride2 + depth2;
      vec2 uv = uvFromFlat(${o}TexShape[0], ${o}TexShape[1], index + ${x});
      return sampleTexture(${o}, uv);
    }
  `:`
    float ${n}(int row, int col, int depth, int depth2) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * ${i} + col * ${a} +
          depth * ${s} + depth2;
      vec2 uv = uvFromFlat(${m}, ${f}, index + ${x});
      return sampleTexture(${o}, uv);
    }
  `}function FV(r){let t=r.shapeInfo.logicalShape,e=r.name,o="get"+e.charAt(0).toUpperCase()+e.slice(1),n=t[4],s=t[3]*n,a=t[2]*s,i=t[1]*a,{newShape:p,keptDims:c}=y.squeezeShape(t);if(p.length<t.length){let g=ic(r,p),h=["row","col","depth","depth2","depth3"];return`
      ${sc(g)}
      float ${o}(int row, int col, int depth, int depth2, int depth3) {
        return ${o}(${pc(h,c)});
      }
    `}if(r.shapeInfo.isUniform)return`
      float ${o}(int row, int col, int depth, int depth2, int depth3) {
        float index = dot(
          vec4(row, col, depth, depth2),
          vec4(${i}, ${a}, ${s}, ${n})) +
          depth3;
        ${ac(r)}
      }
    `;let l=r.shapeInfo.flatOffset,u=r.shapeInfo.texShape,m=u[0],f=u[1];if(f===i&&l==null)return`
      float ${o}(int row, int col, int depth, int depth2, int depth3) {
        int texR = row;
        float texC = dot(vec4(col, depth, depth2, depth3),
                         vec4(${a}, ${s}, ${n}, 1));
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${f}.0, ${m}.0);
        return sampleTexture(${e}, uv);
      }
    `;if(f===n&&l==null)return`
      float ${o}(int row, int col, int depth, int depth2, int depth3) {
        float texR = dot(
          vec4(row, col, depth, depth2),
          vec4(${t[1]*t[2]*t[3]},
               ${t[2]*t[3]}, ${t[3]}, 1));
        int texC = depth3;
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${f}.0, ${m}.0);
        return sampleTexture(${e}, uv);
      }
    `;let d=up(e);return`
    float ${o}(int row, int col, int depth, int depth2, int depth3) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * ${i} + col * ${a} + depth * ${s} +
          depth2 * ${n} + depth3 + ${d};
      vec2 uv = uvFromFlat(${m}, ${f}, index);
      return sampleTexture(${e}, uv);
    }
  `}function _V(r){let t=r.shapeInfo.logicalShape,e=r.name,o="get"+e.charAt(0).toUpperCase()+e.slice(1),{newShape:n,keptDims:s}=y.squeezeShape(t);if(n.length<t.length){let h=ic(r,n),x=["row","col","depth","depth2","depth3","depth4"];return`
      ${sc(h)}
      float ${o}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        return ${o}(${pc(x,s)});
      }
    `}let a=t[5],i=t[4]*a,p=t[3]*i,c=t[2]*p,l=t[1]*c;if(r.shapeInfo.isUniform)return`
      float ${o}(int row, int col, int depth,
                  int depth2, int depth3, int depth4) {
        int index = round(dot(
          vec4(row, col, depth, depth2),
          vec4(${l}, ${c}, ${p}, ${i})) +
          dot(
            vec2(depth3, depth4),
            vec2(${a}, 1)));
        ${ac(r)}
      }
    `;let u=r.shapeInfo.flatOffset,m=r.shapeInfo.texShape,f=m[0],d=m[1];if(d===l&&u==null)return`
      float ${o}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        int texR = row;
        float texC = dot(vec4(col, depth, depth2, depth3),
          vec4(${c}, ${p}, ${i}, ${a})) +
               float(depth4);
        vec2 uv = (vec2(texC, texR) + halfCR) /
                   vec2(${d}.0, ${f}.0);
        return sampleTexture(${e}, uv);
      }
    `;if(d===a&&u==null)return`
      float ${o}(int row, int col, int depth,
                    int depth2, int depth3, int depth4) {
        float texR = dot(vec4(row, col, depth, depth2),
          vec4(${t[1]*t[2]*t[3]*t[4]},
               ${t[2]*t[3]*t[4]},
               ${t[3]*t[4]},
               ${t[4]})) + float(depth3);
        int texC = depth4;
        vec2 uv = (vec2(texC, texR) + halfCR) /
                  vec2(${d}.0, ${f}.0);
        return sampleTexture(${e}, uv);
      }
    `;let g=up(e);return`
    float ${o}(int row, int col, int depth,
                  int depth2, int depth3, int depth4) {
      // Explicitly use integer operations as dot() only works on floats.
      int index = row * ${l} + col * ${c} + depth * ${p} +
          depth2 * ${i} + depth3 * ${a} + depth4 + ${g};
      vec2 uv = uvFromFlat(${f}, ${d}, index);
      return sampleTexture(${e}, uv);
    }
  `}function ac(r){let t=r.name,e=y.sizeFromShape(r.shapeInfo.logicalShape);return e<2?`return ${t};`:`
    for (int i = 0; i < ${e}; i++) {
      if (i == index) {
        return ${t}[i];
      }
    }
  `}function OV(r,t){let e=r.name,o=e.charAt(0).toUpperCase()+e.slice(1),n="get"+o+"AtOutCoords",s=r.shapeInfo.logicalShape.length,a=t.logicalShape.length,i=GI(r.shapeInfo.logicalShape,t.logicalShape),p=wt(a),c=a-s,l,u=["x","y","z","w","u","v"];s===0?l="":a<2&&i.length>=1?l="coords = 0;":l=i.map(b=>`coords.${u[b+c]} = 0;`).join(`
`);let m="";a<2&&s>0?m="coords":m=r.shapeInfo.logicalShape.map((b,S)=>`coords.${u[S+c]}`).join(", ");let f="return outputValue;",g=y.sizeFromShape(r.shapeInfo.logicalShape)===1,x=y.sizeFromShape(t.logicalShape)===1;if(s===1&&!g&&!x)f=`
      return vec4(outputValue.xy, outputValue.xy);
    `;else if(g&&!x)a===1?f=`
        return vec4(outputValue.x, outputValue.x, 0., 0.);
      `:f=`
        return vec4(outputValue.x);
      `;else if(i.length){let b=s-2,S=s-1;i.indexOf(b)>-1&&i.indexOf(S)>-1?f="return vec4(outputValue.x);":i.indexOf(b)>-1?f="return vec4(outputValue.x, outputValue.y, outputValue.x, outputValue.y);":i.indexOf(S)>-1&&(f="return vec4(outputValue.xx, outputValue.zz);")}return`
    vec4 ${n}() {
      ${p} coords = getOutputCoords();
      ${l}
      vec4 outputValue = get${o}(${m});
      ${f}
    }
  `}function PV(r,t){let e=r.name,o=e.charAt(0).toUpperCase()+e.slice(1),n="get"+o+"AtOutCoords",s=t.texShape,a=r.shapeInfo.texShape,i=r.shapeInfo.logicalShape.length,p=t.logicalShape.length;if(!r.shapeInfo.isUniform&&i===p&&r.shapeInfo.flatOffset==null&&y.arraysEqual(a,s))return`
      float ${n}() {
        return sampleTexture(${e}, resultUV);
      }
    `;let c=wt(p),l=GI(r.shapeInfo.logicalShape,t.logicalShape),u=p-i,m,f=["x","y","z","w","u","v"];i===0?m="":p<2&&l.length>=1?m="coords = 0;":m=l.map(g=>`coords.${f[g+u]} = 0;`).join(`
`);let d="";return p<2&&i>0?d="coords":d=r.shapeInfo.logicalShape.map((g,h)=>`coords.${f[h+u]}`).join(", "),`
    float ${n}() {
      ${c} coords = getOutputCoords();
      ${m}
      return get${o}(${d});
    }
  `}function wt(r){if(r<=1)return"int";if(r===2)return"ivec2";if(r===3)return"ivec3";if(r===4)return"ivec4";if(r===5)return"ivec5";if(r===6)return"ivec6";throw Error(`GPU for rank ${r} is not yet supported`)}function Bm(r,t,e){let{newShape:o,keptDims:n}=y.squeezeShape(t),s=t.length,a=r&&s===3&&t[0]===1,i=a?t.slice(1):o,p=!r&&s>1&&!y.arraysEqual(t,e)&&o.length<s||a;return{useSqueezeShape:p,uniformShape:p?i:t,keptDims:n}}function ic(r,t){let e=JSON.parse(JSON.stringify(r));return e.shapeInfo.logicalShape=t,e}function pc(r,t){return t.map(e=>r[e]).join(", ")}function HI(r,t,e,o){let n=e.map((l,u)=>{let m={logicalShape:l.shape,texShape:l.isUniform?null:l.texData.texShape,isUniform:l.isUniform,isPacked:l.isUniform?!1:l.texData.isPacked,flatOffset:null};return l.texData!=null&&l.texData.slice!=null&&l.texData.slice.flatOffset>0&&(m.flatOffset=l.texData.slice.flatOffset),{name:t.variableNames[u],shapeInfo:m}}),s=n.map(l=>l.shapeInfo),a={logicalShape:o.shape,texShape:o.texData.texShape,isUniform:!1,isPacked:o.texData.isPacked,flatOffset:null},i=VI(n,a,t),p=TI(r.gl,i),c=r.createProgram(p);return _().get("ENGINE_COMPILE_ONLY")?{program:t,fragmentShader:p,source:i,webGLProgram:c,inShapeInfos:s,outShapeInfo:a,uniformLocations:null,customUniformLocations:null,infLoc:null,nanLoc:null,inShapesLocations:null,inTexShapesLocations:null,outShapeLocation:null,outShapeStridesLocation:null,outTexShapeLocation:null}:Object.assign({program:t,fragmentShader:p,source:i,webGLProgram:c,inShapeInfos:s,outShapeInfo:a},ry(r,t,c))}function ry(r,t,e){let o={},n={},s={},a=[],i,p,c,l=null,u=null;u=r.getUniformLocation(e,"NAN",!1),_().getNumber("WEBGL_VERSION")===1&&(l=r.getUniformLocation(e,"INFINITY",!1));let m=!1;for(let f=0;f<t.variableNames.length;f++){let d=t.variableNames[f];o[d]=r.getUniformLocation(e,d,m),o[`offset${d}`]=r.getUniformLocation(e,`offset${d}`,m),t.enableShapeUniforms&&(n[`${d}Shape`]=r.getUniformLocation(e,`${d}Shape`,m),s[`${d}TexShape`]=r.getUniformLocation(e,`${d}TexShape`,m))}return t.enableShapeUniforms&&(i=r.getUniformLocation(e,"outShape",m),c=r.getUniformLocation(e,"outShapeStrides",m),p=r.getUniformLocation(e,"outTexShape",m)),t.customUniforms&&t.customUniforms.forEach((f,d)=>{a[d]=r.getUniformLocation(e,f.name,m)}),{uniformLocations:o,customUniformLocations:a,infLoc:l,nanLoc:u,inShapesLocations:n,inTexShapesLocations:s,outShapeLocation:i,outShapeStridesLocation:c,outTexShapeLocation:p}}function UI(r,t){if(r.length!==t.length)throw Error(`Binary was compiled with ${r.length} inputs, but was executed with ${t.length} inputs`);r.forEach((e,o)=>{let n=e.logicalShape,s=t[o],a=s.shape;if(!y.arraysEqual(n,a))throw Error(`Binary was compiled with different shapes than the current args. Shapes ${n} and ${a} must match`);if(e.isUniform&&s.isUniform)return;let i=e.texShape,p=s.isUniform?null:s.texData.texShape;if(!y.arraysEqual(i,p))throw Error(`Binary was compiled with different texture shapes than the current args. Shape ${i} and ${p} must match`)})}function qI(r,t,e,o,n){t.program.enableShapeUniforms||(UI(t.inShapeInfos,e),UI([t.outShapeInfo],[o]));let s=o.texData.texture,a=o.texData.texShape;o.texData.isPacked?r.setOutputPackedMatrixTexture(s.texture,a[0],a[1]):r.setOutputMatrixTexture(s.texture,a[0],a[1]),r.setProgram(t.webGLProgram),_().getNumber("WEBGL_VERSION")===1&&t.infLoc!==null&&r.gl.uniform1f(t.infLoc,1/0),t.nanLoc!==null&&r.gl.uniform1f(t.nanLoc,NaN),e.forEach((p,c)=>{let l=t.program.variableNames[c],u=t.uniformLocations[l],m=t.uniformLocations[`offset${l}`],f=t.inShapesLocations[`${l}Shape`],d=t.inTexShapesLocations[`${l}TexShape`];if(f){let{uniformShape:g}=Bm(t.program.packedInputs,p.shape,p.texData.texShape);switch(g.length){case 1:r.gl.uniform1iv(f,new Int32Array(g));break;case 2:r.gl.uniform2iv(f,new Int32Array(g));break;case 3:r.gl.uniform3iv(f,new Int32Array(g));break;case 4:r.gl.uniform4iv(f,new Int32Array(g));break;default:break}}if(d&&r.gl.uniform2i(d,p.texData.texShape[0],p.texData.texShape[1]),u!=null){if(p.isUniform){if(y.sizeFromShape(p.shape)<2)r.gl.uniform1f(u,p.uniformValues[0]);else{let g=p.uniformValues;g instanceof Float32Array||(g=new Float32Array(g)),r.gl.uniform1fv(u,g)}return}p.texData.slice!=null&&m!=null&&r.gl.uniform1i(m,p.texData.slice.flatOffset),r.setInputMatrixTexture(p.texData.texture.texture,u,c)}});let i=t.outShapeLocation;if(i)switch(o.shape.length){case 1:r.gl.uniform1iv(i,new Int32Array(o.shape));break;case 2:r.gl.uniform2iv(i,new Int32Array(o.shape));break;case 3:r.gl.uniform3iv(i,new Int32Array(o.shape));break;case 4:r.gl.uniform4iv(i,new Int32Array(o.shape));break;default:break}if(t.outShapeStridesLocation){let p=y.computeStrides(o.shape);switch(o.shape.length){case 2:r.gl.uniform1iv(t.outShapeStridesLocation,new Int32Array(p));break;case 3:r.gl.uniform2iv(t.outShapeStridesLocation,new Int32Array(p));break;case 4:r.gl.uniform3iv(t.outShapeStridesLocation,new Int32Array(p));break;default:break}}t.outTexShapeLocation&&r.gl.uniform2i(t.outTexShapeLocation,o.texData.texShape[0],o.texData.texShape[1]),t.program.customUniforms&&n&&t.program.customUniforms.forEach((p,c)=>{let l=t.customUniformLocations[c],u=n[c];if(p.type==="float")r.gl.uniform1fv(l,u);else if(p.type==="vec2")r.gl.uniform2fv(l,u);else if(p.type==="vec3")r.gl.uniform3fv(l,u);else if(p.type==="vec4")r.gl.uniform4fv(l,u);else if(p.type==="int")r.gl.uniform1iv(l,u);else if(p.type==="ivec2")r.gl.uniform2iv(l,u);else if(p.type==="ivec3")r.gl.uniform3iv(l,u);else if(p.type==="ivec4")r.gl.uniform4iv(l,u);else throw Error(`uniform type ${p.type} is not supported yet.`)}),r.executeProgram()}function KI(r,t,e){let o="";t.concat(e).forEach(a=>{let i=a.texData!=null&&a.texData.slice!=null&&a.texData.slice.flatOffset>0;if(r.enableShapeUniforms&&!a.isUniform){let p=a.texData.texShape,{useSqueezeShape:c,uniformShape:l,keptDims:u}=Bm(r.packedInputs,a.shape,p),m="",f="",d="";if(l.length===1&&r.packedInputs){let E=[Math.ceil(p[0]/2),Math.ceil(p[1]/2)];m=`${E[0]>1}_${E[1]>1}`}else if(l.length===2&&!r.packedInputs)f=`${l[0]>1}_${l[1]>1}`;else if(l.length>2&&!r.packedInputs){let E=y.computeStrides(l);d=`${E[0]===p[1]}_${E[E.length-1]===p[1]}`}let g=a.shape.length,h=l.length===2&&y.arraysEqual(a.shape,p),x=y.sizeFromShape(a.shape)===1,b=I.getBroadcastDims(a.shape,e.shape),S=!r.packedInputs&&g===e.shape.length&&y.arraysEqual(p,e.texData.texShape),w=r.packedInputs||l.length>2?"":`${p[0]>1}_${p[1]>1}`;o+=`${g}_${S}_${c?u:""}_${l.length}_${x}_${b}_${h}_${m}_${f}_${d}_${w}_${i}`}else{let p=a.isUniform?"uniform":a.texData.texShape;o+=`${a.shape}_${p}_${i}`}});let n=r.userCode,s=r.constructor.name;return s+="_"+o+"_"+n+`${_().getNumber("WEBGL_VERSION")}`,s}function Bt(r){return _().getBool("WEBGL_USE_SHAPES_UNIFORMS")&&r<=4}var Gm=class{constructor(t){this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0,this.outPackingScheme=ca.DENSE,this.customUniforms=[{name:"texShape",type:"ivec2"}];let e=Yt();this.outputShape=t,this.enableShapeUniforms=Bt(this.outputShape.length),this.userCode=`
      ivec3 outCoordsFromFlatIndex(int index) {
        ${this.enableShapeUniforms?lp(["r","c","d"],t):Jr(["r","c","d"],t)}
        return ivec3(r, c, d);
      }

      void main() {
        ivec2 resTexRC = ivec2(resultUV.yx * vec2(texShape[0], texShape[1]));
        int index = 4 * (resTexRC.x * texShape[1] + resTexRC.y);

        vec4 result = vec4(0.);

        for (int i=0; i<4; i++) {
          int flatIndex = index + i;
          ivec3 rc = outCoordsFromFlatIndex(flatIndex);
          result[i] = getA(rc.x, rc.y, rc.z);
        }

        ${e.output} = result;
      }
    `}};var Vm=class{constructor(t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outPackingScheme=ca.DENSE,this.customUniforms=[{name:"texShape",type:"ivec2"}];let e=Yt();this.outputShape=t,this.enableShapeUniforms=Bt(this.outputShape.length),this.userCode=`
      ivec3 outCoordsFromFlatIndex(int index) {
        ${this.enableShapeUniforms?lp(["r","c","d"],t):Jr(["r","c","d"],t)}
        return ivec3(r, c, d);
      }

      void main() {
        ivec2 resTexRC = ivec2(resultUV.yx * vec2(texShape[0], texShape[1]));
        int index = 4 * (resTexRC.x * texShape[1] + resTexRC.y);

        vec4 result = vec4(0.);

        for (int i=0; i<4; i++) {
          int flatIndex = index + i;
          ivec3 rc = outCoordsFromFlatIndex(flatIndex);
          result[i] = getChannel(getA(rc.x, rc.y, rc.z), vec2(rc.y, rc.z));
        }

        ${e.output} = result;
      }
    `}};var zm=class{constructor(t){this.variableNames=["A"],this.outTexUsage=Re.DOWNLOAD;let e=Yt();this.outputShape=t,this.userCode=`
      ${Mm}

      void main() {
        float x = getAAtOutCoords();
        ${e.output} = encode_float(x);
      }
    `}};var Wm=class{constructor(t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!1,this.outTexUsage=Re.DOWNLOAD;let e=Yt();this.outputShape=t,this.userCode=`
      ${Mm}

      void main() {
        ivec3 coords = getOutputCoords();
        float x = getChannel(getAAtOutCoords(), vec2(coords.y, coords.z));
        ${e.output} = encode_float(x);
      }
    `}};var Um=class{constructor(t,e=!1){this.variableNames=["A"],this.customUniforms=[{name:"texShape",type:"ivec2"}];let o=Yt();this.outputShape=t,this.enableShapeUniforms=Bt(this.outputShape.length);let n="result";e&&(n="floor(result * 255. + 0.5)"),this.userCode=`
      ${this.enableShapeUniforms?oc():rc(t)}

      void main() {
        ivec3 coords = getOutputCoords();

        int flatIndex = getFlatIndex(coords);
        int offset = imod(flatIndex, 4);

        flatIndex = idiv(flatIndex, 4, 1.);

        int r = flatIndex / texShape[1];
        int c = imod(flatIndex, texShape[1]);
        vec2 uv = (vec2(c, r) + halfCR) / vec2(texShape[1], texShape[0]);
        vec4 values = ${o.texture2D}(A, uv);

        float result;

        if(offset == 0) {
          result = values[0];
        } else if(offset == 1) {
          result = values[1];
        } else if(offset == 2) {
          result = values[2];
        } else {
          result = values[3];
        }

        ${o.output} = vec4(${n}, 0., 0., 0.);
      }
    `}};var Hm=class{constructor(t,e=!1){this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0,this.customUniforms=[{name:"texShape",type:"ivec2"}];let o=Yt();this.outputShape=t,this.enableShapeUniforms=Bt(this.outputShape.length);let n="",s="result";e&&(s="floor(result * 255. + 0.5)");for(let a=0;a<=1;a++)for(let i=0;i<=1;i++){let p=a*2+i;n+=`
          localCoords = coords;
          if(localCoords[2] + ${i} < ${this.enableShapeUniforms?"outShape[2]":`${t[2]}`}) {
          localCoords[2] += ${i};
          if (localCoords[1] + ${a} < ${this.enableShapeUniforms?"outShape[1]":`${t[1]}`}) {
            localCoords[1] += ${a};

            flatIndex = getFlatIndex(localCoords);
            offset = imod(flatIndex, 4);

            flatIndex = idiv(flatIndex, 4, 1.);

            int r = flatIndex / texShape[1];
            int c = imod(flatIndex, texShape[1]);
            vec2 uv = (vec2(c, r) + halfCR) / vec2(texShape[1], texShape[0]);
            values = ${o.texture2D}(A, uv);

            if (offset == 0) {
              result[${p}] = values[0];
            } else if (offset == 1) {
              result[${p}] = values[1];
            } else if (offset == 2) {
              result[${p}] = values[2];
            } else {
              result[${p}] = values[3];
            }
          }
        }
        `}this.userCode=`
        ${this.enableShapeUniforms?oc():rc(t)}

        void main() {
          ivec3 coords = getOutputCoords();

          vec4 result = vec4(0.);
          int flatIndex, r, c, offset;
          ivec3 localCoords;
          vec2 uv;
          vec4 values;

          ${n}

          ${o.output} = ${s};
        }
    `}};function XI(r){let t=Yt(),e=`${t.version}
    precision highp float;
    ${t.attribute} vec3 clipSpacePos;
    ${t.attribute} vec2 uv;
    ${t.varyingVs} vec2 resultUV;

    void main() {
      gl_Position = vec4(clipSpacePos, 1);
      resultUV = uv;
    }`;return CI(r,e)}function jI(r){let t=new Float32Array([-1,1,0,0,1,-1,-1,0,0,0,1,1,0,1,1,1,-1,0,1,0]);return NI(r,t)}function YI(r){let t=new Uint16Array([0,1,2,2,1,3]);return vI(r,t)}function Zl(r,t,e,o,n,s){kI(t,e);let a=II(r),i=r.TEXTURE_2D;return ut(r,()=>r.bindTexture(i,a)),ut(r,()=>r.texParameteri(i,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE)),ut(r,()=>r.texParameteri(i,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE)),ut(r,()=>r.texParameteri(i,r.TEXTURE_MIN_FILTER,r.NEAREST)),ut(r,()=>r.texParameteri(i,r.TEXTURE_MAG_FILTER,r.NEAREST)),_().getNumber("WEBGL_VERSION")===1?ut(r,()=>r.texImage2D(i,0,o,t,e,0,n,s,null)):ut(r,()=>r.texStorage2D(i,1,o,t,e)),ut(r,()=>r.bindTexture(r.TEXTURE_2D,null)),{texture:a,texShape:[e,t]}}function oy(r){return r.internalFormatFloat}function ZI(r,t,e,o){let[n,s]=pp(t,e);return Zl(r,n,s,oy(o),o.textureFormatFloat,r.FLOAT)}function ny(r){return r.internalFormatHalfFloat}function QI(r,t,e,o){let[n,s]=pp(t,e);return Zl(r,n,s,ny(o),o.textureFormatFloat,o.textureTypeHalfFloat)}function sy(r){return r.downloadTextureFormat}function JI(r,t,e,o){let[n,s]=pp(t,e);return Zl(r,n,s,sy(o),r.RGBA,r.UNSIGNED_BYTE)}function ay(r){return r.internalFormatPackedFloat}function t1(r,t,e,o){let[n,s]=on(t,e);return Zl(r,n,s,ay(o),r.RGBA,r.FLOAT)}function iy(r){return r.internalFormatPackedHalfFloat}function e1(r,t,e,o){let[n,s]=on(t,e);return Zl(r,n,s,iy(o),r.RGBA,o.textureTypeHalfFloat)}function r1(r,t,e){return ut(r,()=>r.bindBuffer(r.ARRAY_BUFFER,e)),Jx(r,t,"clipSpacePos",e,3,20,0)&&Jx(r,t,"uv",e,2,20,12)}function o1(r,t,e,o,n,s){ut(r,()=>r.bindTexture(r.TEXTURE_2D,t));let a,i,p;n instanceof Uint8Array?(a=new Uint8Array(e*o*4),i=r.UNSIGNED_BYTE,p=r.RGBA):(a=new Float32Array(e*o*4),i=r.FLOAT,p=s.internalFormatPackedFloat),a.set(n),_().getNumber("WEBGL_VERSION")===2?ut(r,()=>r.texSubImage2D(r.TEXTURE_2D,0,0,0,e,o,r.RGBA,i,a)):ut(r,()=>r.texImage2D(r.TEXTURE_2D,0,p,e,o,0,r.RGBA,i,a)),ut(r,()=>r.bindTexture(r.TEXTURE_2D,null))}function n1(r,t,e){ut(r,()=>r.bindTexture(r.TEXTURE_2D,t)),e.data instanceof Uint8Array?_().getNumber("WEBGL_VERSION")===2?ut(r,()=>r.texSubImage2D(r.TEXTURE_2D,0,0,0,e.width,e.height,r.RGBA,r.UNSIGNED_BYTE,e.data)):ut(r,()=>r.texImage2D(r.TEXTURE_2D,0,r.RGBA,e.width,e.height,0,r.RGBA,r.UNSIGNED_BYTE,e.data)):_().getNumber("WEBGL_VERSION")===2?ut(r,()=>r.texSubImage2D(r.TEXTURE_2D,0,0,0,r.RGBA,r.UNSIGNED_BYTE,e)):ut(r,()=>r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,e)),ut(r,()=>r.bindTexture(r.TEXTURE_2D,null))}function s1(r,t,e,o){let n=r.createBuffer();ut(r,()=>r.bindBuffer(r.PIXEL_PACK_BUFFER,n));let i=4*4*t*e;return ut(r,()=>r.bufferData(r.PIXEL_PACK_BUFFER,i,r.STREAM_READ)),ut(r,()=>r.readPixels(0,0,e,t,r.RGBA,r.FLOAT,0)),ut(r,()=>r.bindBuffer(r.PIXEL_PACK_BUFFER,null)),n}function a1(r,t,e){let o=r,n=new Float32Array(e);return o.bindBuffer(o.PIXEL_PACK_BUFFER,t),o.getBufferSubData(o.PIXEL_PACK_BUFFER,0,n),o.bindBuffer(o.PIXEL_PACK_BUFFER,null),n}function i1(r,t,e,o){let[n,s]=pp(t,e),a=4,i=new Uint8Array(xI(t*e,a));return ut(r,()=>r.readPixels(0,0,n,s,o.downloadTextureFormat,r.UNSIGNED_BYTE,i)),new Float32Array(i.buffer)}function p1(r,t,e,o,n,s,a,i){let p=r,c=new Float32Array(yI(s,a));return p.bindBuffer(p.PIXEL_PACK_BUFFER,t),p.getBufferSubData(p.PIXEL_PACK_BUFFER,0,c),p.bindBuffer(p.PIXEL_PACK_BUFFER,null),c}function c1(r,t,e){let o=new Float32Array(t*e*4);return ut(r,()=>r.readPixels(0,0,e,t,r.RGBA,r.FLOAT,o)),o}var cc=class{constructor(t){this.outputTexture=null,this.program=null,this.disposed=!1,this.vertexAttrsAreBound=!1,this.itemsToPoll=[];let e=_().getNumber("WEBGL_VERSION");t!=null?(this.gl=t,gI(e,t)):this.gl=ar(e);let o="WEBGL_color_buffer_float",n="EXT_color_buffer_half_float";if(this.parallelCompilationExtension=this.gl.getExtension("KHR_parallel_shader_compile"),_().getNumber("WEBGL_VERSION")===1){let s="OES_texture_float",a="OES_texture_half_float";if(this.textureFloatExtension=jl(this.gl,s),br(this.gl,a))this.textureHalfFloatExtension=jl(this.gl,a);else if(_().get("WEBGL_FORCE_F16_TEXTURES"))throw new Error("GL context does not support half float textures, yet the environment flag WEBGL_FORCE_F16_TEXTURES is set to true.");if(this.colorBufferFloatExtension=this.gl.getExtension(o),br(this.gl,n))this.colorBufferHalfFloatExtension=jl(this.gl,n);else if(_().get("WEBGL_FORCE_F16_TEXTURES"))throw new Error("GL context does not support color renderable half floats, yet the environment flag WEBGL_FORCE_F16_TEXTURES is set to true.")}else if(o="EXT_color_buffer_float",br(this.gl,o))this.colorBufferFloatExtension=this.gl.getExtension(o);else if(br(this.gl,n))this.colorBufferHalfFloatExtension=this.gl.getExtension(n);else throw new Error("GL context does not support color renderable floats");this.vertexBuffer=jI(this.gl),this.indexBuffer=YI(this.gl),this.framebuffer=EI(this.gl),this.textureConfig=Xl(this.gl,this.textureHalfFloatExtension)}get debug(){return _().getBool("DEBUG")}dispose(){if(this.disposed)return;this.program!=null&&console.warn("Disposing a GPGPUContext that still has a bound WebGLProgram. This is probably a resource leak, delete the program with GPGPUContext.deleteProgram before disposing."),this.outputTexture!=null&&console.warn("Disposing a GPGPUContext that still has a bound output matrix texture.  This is probably a resource leak, delete the output matrix texture with GPGPUContext.deleteMatrixTexture before disposing.");let t=this.gl;ut(t,()=>t.finish()),ut(t,()=>t.bindFramebuffer(t.FRAMEBUFFER,null)),ut(t,()=>t.deleteFramebuffer(this.framebuffer)),ut(t,()=>t.bindBuffer(t.ARRAY_BUFFER,null)),ut(t,()=>t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null)),ut(t,()=>t.deleteBuffer(this.indexBuffer)),this.disposed=!0}createFloat32MatrixTexture(t,e){return this.throwIfDisposed(),ZI(this.gl,t,e,this.textureConfig)}createFloat16MatrixTexture(t,e){return this.throwIfDisposed(),QI(this.gl,t,e,this.textureConfig)}createUnsignedBytesMatrixTexture(t,e){return this.throwIfDisposed(),JI(this.gl,t,e,this.textureConfig)}uploadPixelDataToTexture(t,e){this.throwIfDisposed(),n1(this.gl,t,e)}uploadDenseMatrixToTexture(t,e,o,n){this.throwIfDisposed(),o1(this.gl,t,e,o,n,this.textureConfig)}createFloat16PackedMatrixTexture(t,e){return this.throwIfDisposed(),e1(this.gl,t,e,this.textureConfig)}createPackedMatrixTexture(t,e){return this.throwIfDisposed(),t1(this.gl,t,e,this.textureConfig)}deleteMatrixTexture(t){this.throwIfDisposed(),this.outputTexture===t&&(ty(this.gl,this.framebuffer),this.outputTexture=null),ut(this.gl,()=>this.gl.deleteTexture(t))}downloadByteEncodedFloatMatrixFromOutputTexture(t,e,o){return this.downloadMatrixDriver(t,()=>i1(this.gl,e,o,this.textureConfig))}downloadPackedMatrixFromBuffer(t,e,o,n,s,a){return p1(this.gl,t,e,o,n,s,a,this.textureConfig)}downloadFloat32MatrixFromBuffer(t,e){return a1(this.gl,t,e)}createBufferFromTexture(t,e,o){this.bindTextureToFrameBuffer(t);let n=s1(this.gl,e,o,this.textureConfig);return this.unbindTextureToFrameBuffer(),n}createAndWaitForFence(){let t=this.createFence(this.gl);return this.pollFence(t)}createFence(t){let e,o;if(_().getBool("WEBGL_FENCE_API_ENABLED")){let n=t,s=n.fenceSync(n.SYNC_GPU_COMMANDS_COMPLETE,0);t.flush(),o=()=>{let a=n.clientWaitSync(s,0,0);return a===n.ALREADY_SIGNALED||a===n.CONDITION_SATISFIED},e=s}else _().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")>0?(e=this.beginQuery(),this.endQuery(),o=()=>this.isQueryAvailable(e,_().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION"))):o=()=>!0;return{query:e,isFencePassed:o}}downloadMatrixFromPackedTexture(t,e,o){return this.downloadMatrixDriver(t,()=>c1(this.gl,e,o))}createProgram(t){this.throwIfDisposed();let e=this.gl;this.vertexShader==null&&(this.vertexShader=XI(e));let o=SI(e);return ut(e,()=>e.attachShader(o,this.vertexShader)),ut(e,()=>e.attachShader(o,t)),wI(e,o),this.debug&&_m(e,o),this.vertexAttrsAreBound||(this.setProgram(o),this.vertexAttrsAreBound=r1(e,this.program,this.vertexBuffer)),o}deleteProgram(t){this.throwIfDisposed(),t===this.program&&(this.program=null),t!=null&&ut(this.gl,()=>this.gl.deleteProgram(t))}setProgram(t){this.throwIfDisposed(),this.program=t,this.program!=null&&this.debug&&_m(this.gl,this.program),ut(this.gl,()=>this.gl.useProgram(t))}getUniformLocation(t,e,o=!0){return this.throwIfDisposed(),o?$I(this.gl,t,e):AI(this.gl,t,e)}getAttributeLocation(t,e){return this.throwIfDisposed(),ut(this.gl,()=>this.gl.getAttribLocation(t,e))}getUniformLocationNoThrow(t,e){return this.throwIfDisposed(),this.gl.getUniformLocation(t,e)}setInputMatrixTexture(t,e,o){this.throwIfDisposed(),this.throwIfNoProgram(),DI(this.gl,t,e,o)}setOutputMatrixTexture(t,e,o){this.setOutputMatrixTextureDriver(t,o,e)}setOutputPackedMatrixTexture(t,e,o){this.throwIfDisposed();let[n,s]=on(e,o);this.setOutputMatrixTextureDriver(t,n,s)}setOutputMatrixWriteRegion(t,e,o,n){this.setOutputMatrixWriteRegionDriver(o,t,n,e)}setOutputPackedMatrixWriteRegion(t,e,o,n){throw new Error("setOutputPackedMatrixWriteRegion not implemented.")}debugValidate(){this.program!=null&&_m(this.gl,this.program),Yl(this.gl)}executeProgram(){this.throwIfDisposed(),this.throwIfNoProgram();let t=this.gl;this.debug&&this.debugValidate(),ut(t,()=>t.drawElements(t.TRIANGLES,6,t.UNSIGNED_SHORT,0))}blockUntilAllProgramsCompleted(){this.throwIfDisposed(),ut(this.gl,()=>this.gl.finish())}getQueryTimerExtension(){return this.disjointQueryTimerExtension==null&&(this.disjointQueryTimerExtension=jl(this.gl,_().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")===2?"EXT_disjoint_timer_query_webgl2":"EXT_disjoint_timer_query")),this.disjointQueryTimerExtension}getQueryTimerExtensionWebGL2(){return this.getQueryTimerExtension()}getQueryTimerExtensionWebGL1(){return this.getQueryTimerExtension()}beginQuery(){if(_().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")===2){let o=this.gl,n=this.getQueryTimerExtensionWebGL2(),s=o.createQuery();return o.beginQuery(n.TIME_ELAPSED_EXT,s),s}let t=this.getQueryTimerExtensionWebGL1(),e=t.createQueryEXT();return t.beginQueryEXT(t.TIME_ELAPSED_EXT,e),e}endQuery(){if(_().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION")===2){let e=this.gl,o=this.getQueryTimerExtensionWebGL2();e.endQuery(o.TIME_ELAPSED_EXT);return}let t=this.getQueryTimerExtensionWebGL1();t.endQueryEXT(t.TIME_ELAPSED_EXT)}async waitForQueryAndGetTime(t){return await y.repeatedTry(()=>this.disposed||this.isQueryAvailable(t,_().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION"))),this.getQueryTime(t,_().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_VERSION"))}getQueryTime(t,e){if(e===0)return null;if(e===2){let o=this.gl;return o.getQueryParameter(t,o.QUERY_RESULT)/1e6}else{let o=this.getQueryTimerExtensionWebGL1();return o.getQueryObjectEXT(t,o.QUERY_RESULT_EXT)/1e6}}isQueryAvailable(t,e){if(e===0)return!0;if(e===2){let o=this.gl,n=this.getQueryTimerExtensionWebGL2(),s=o.getQueryParameter(t,o.QUERY_RESULT_AVAILABLE);return this.disjoint==null&&(this.disjoint=this.gl.getParameter(n.GPU_DISJOINT_EXT)),s&&!this.disjoint}else{let o=this.getQueryTimerExtensionWebGL1(),n=o.getQueryObjectEXT(t,o.QUERY_RESULT_AVAILABLE_EXT);return this.disjoint==null&&(this.disjoint=this.gl.getParameter(o.GPU_DISJOINT_EXT)),n&&!this.disjoint}}pollFence(t){return new Promise(e=>{this.addItemToPoll(()=>t.isFencePassed(),()=>e())})}pollItems(){let t=GV(this.itemsToPoll.map(e=>e.isDoneFn));for(let e=0;e<=t;++e){let{resolveFn:o}=this.itemsToPoll[e];o()}this.itemsToPoll=this.itemsToPoll.slice(t+1)}addItemToPoll(t,e){if(this.itemsToPoll.push({isDoneFn:t,resolveFn:e}),this.itemsToPoll.length>1)return;let o;"setTimeoutCustom"in _().platform&&(o=_().platform.setTimeoutCustom.bind(_().platform)),y.repeatedTry(()=>(this.pollItems(),this.itemsToPoll.length===0),()=>0,null,o)}bindTextureToFrameBuffer(t){this.throwIfDisposed(),Om(this.gl,t,this.framebuffer),this.debug&&Yl(this.gl)}unbindTextureToFrameBuffer(){this.outputTexture!=null?(Om(this.gl,this.outputTexture,this.framebuffer),this.debug&&Yl(this.gl)):ty(this.gl,this.framebuffer)}downloadMatrixDriver(t,e){this.bindTextureToFrameBuffer(t);let o=e();return this.unbindTextureToFrameBuffer(),o}setOutputMatrixTextureDriver(t,e,o){this.throwIfDisposed();let n=this.gl;Om(n,t,this.framebuffer),this.debug&&Yl(n),this.outputTexture=t,ut(n,()=>n.viewport(0,0,e,o)),ut(n,()=>n.scissor(0,0,e,o))}setOutputMatrixWriteRegionDriver(t,e,o,n){this.throwIfDisposed(),ut(this.gl,()=>this.gl.scissor(t,e,o,n))}throwIfDisposed(){if(this.disposed)throw new Error("Attempted to use disposed GPGPUContext.")}throwIfNoProgram(){if(this.program==null)throw new Error("No GPU program is currently set.")}};function GV(r){let t=0;for(;t<r.length&&r[t]();++t);return t-1}var{addImpl:l1,bincountImpl:qm,bincountReduceImpl:u1,castImpl:m1,ceilImpl:f1,concatImpl:d1,equalImpl:h1,expImpl:g1,expm1Impl:x1,floorImpl:y1,gatherNdImpl:b1,gatherV2Impl:C1,greaterImpl:T1,greaterEqualImpl:S1,lessImpl:w1,lessEqualImpl:N1,linSpaceImpl:v1,logImpl:I1,maxImpl:k1,maximumImpl:E1,minimumImpl:$1,multiplyImpl:A1,negImpl:D1,notEqualImpl:R1,prodImpl:F1,raggedGatherImpl:_1,raggedTensorToTensorImpl:O1,rangeImpl:P1,rsqrtImpl:L1,scatterImpl:M1,sigmoidImpl:B1,simpleAbsImpl:Km,sliceImpl:G1,sparseFillEmptyRowsImpl:V1,sparseReshapeImpl:z1,sparseSegmentReductionImpl:Xm,sqrtImpl:W1,stridedSliceImpl:U1,stringNGramsImpl:H1,stringSplitImpl:q1,stringToHashBucketFastImpl:K1,subImpl:X1,tileImpl:j1,topKImpl:Y1,transposeImpl:mp,uniqueImpl:Z1}=Ox;function py(r,t){return["x","y","z","w","u","v"].slice(0,t).map(e=>`${r}.${e}`)}function re(r,t){return t===1?[r]:py(r,t)}function Q1(r,t){if(r===1)return"rc";let e="";for(let o=0;o<r;o++)e+=t[o],o<r-1&&(e+=",");return e}var jm=class{constructor(t){if(this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0,this.outputShape=t,this.rank=t.length,this.enableShapeUniforms=Bt(this.outputShape.length),this.rank===0)this.userCode=`
        void main() {
          setOutput(vec4(getA(), 0., 0., 0.));
        }
      `;else{let e=re("rc",this.rank),o=wt(this.rank),n=this.getOutOfBoundsCondition(e),s=this.getSetup(e),a=this.getOutput(e);this.userCode=`
        void main() {
          ${o} rc = getOutputCoords();

          if(${n}) {
            setOutput(vec4(0));
          } else {
            ${s}

            setOutput(vec4(${a}));
          }
        }
      `}}getSourceCoordsArr(t){let e=[];for(let o=0;o<=1;o++)for(let n=0;n<=1;n++){let s=`${o===0?"r":"rp1"}, ${n===0?"c":"cp1"}`;for(let a=2;a<this.rank;a++)s=`${t[t.length-1-a]},`+s;e.push(s)}return e}getOutOfBoundsCondition(t){if(this.rank===1)return`rc > ${this.enableShapeUniforms?"outShape":this.outputShape[0]}`;let e="";for(let o=this.rank-2;o<this.rank;o++)e+=`${t[o]} >= ${this.enableShapeUniforms?`outShape[${o}]`:this.outputShape[o]}`,o<this.rank-1&&(e+="||");return e}getSetup(t){if(this.rank===1)return"";let e=t.slice(-2),o=this.enableShapeUniforms?`outShape[${this.rank} - 1]`:this.outputShape[this.rank-1],n=this.enableShapeUniforms?`outShape[${this.rank} - 2]`:this.outputShape[this.rank-2];return`
      int r = ${e[0]};
      int c = ${e[1]};
      int rp1 = r + 1;
      int cp1 = c + 1;

      bool cEdge = cp1 >= ${o};
      bool rEdge = rp1 >= ${n};
    `}getOutput(t){let e=this.getSourceCoordsArr(t);return this.rank===1?`getA(rc), (rc + 1 >= ${this.enableShapeUniforms?"outShape":this.outputShape[0]} ? 0. : getA(rc + 1)), 0, 0`:`getA(${e[0]}),
            cEdge ? 0. : getA(${e[1]}),
            rEdge ? 0. : getA(${e[2]}),
            rEdge || cEdge ? 0. : getA(${e[3]})`}};var lc=class{constructor(t,e){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"inputShape",type:"ivec3"}],this.outputShape=t,this.enableShapeUniforms=Bt(this.outputShape.length);let o="";for(let n=0;n<4;n++){let s="thisRC = rc;";n%2===1&&(s+="thisRC.z += 1;"),n>1&&(s+="thisRC.y += 1;"),o+=`
        ${s}
        ${n>0?"if(thisRC.y < rows && thisRC.z < cols){":""}
          int flatIndex = getFlatIndex(thisRC);

          ivec3 inputRC = inputCoordsFromReshapedOutCoords(flatIndex);
          vec2 inputRCInnerDims = vec2(float(inputRC.y),float(inputRC.z));

          result[${n}] =
            getChannel(getA(inputRC.x, inputRC.y, inputRC.z), inputRCInnerDims);
        ${n>0?"}":""}
      `}this.userCode=`
      ${VV(e,this.enableShapeUniforms)}
      ${this.enableShapeUniforms?oc():rc(t)}

      void main() {
        ivec3 rc = getOutputCoords();

        vec4 result = vec4(0.);

        ivec3 thisRC;
        int rows = ${this.enableShapeUniforms?"outShape[1]":t[1]};
        int cols = ${this.enableShapeUniforms?"outShape[2]":t[2]};

        ${o}

        setOutput(result);
      }
    `}};function VV(r,t){return`
    ivec3 inputCoordsFromReshapedOutCoords(int index) {
      ${t?BI(["r","c","d"],"inputShape"):Jr(["r","c","d"],r)}
      return ivec3(r, c, d);
    }
  `}var Ym=class{constructor(t){this.gpgpu=t,this.numUsedTextures=0,this.numFreeTextures=0,this._numBytesAllocated=0,this._numBytesFree=0,this.freeTextures={},this.logEnabled=!1,this.usedTextures={}}acquireTexture(t,e,o){let n=tk(e,o),s=ek(t,n,o);s in this.freeTextures||(this.freeTextures[s]=[]),s in this.usedTextures||(this.usedTextures[s]=[]);let a=J1(t,n,this.gpgpu.gl,this.gpgpu.textureConfig,o);if(this.freeTextures[s].length>0){this.numFreeTextures--,this.numUsedTextures++,this._numBytesFree-=a,this.log();let p=this.freeTextures[s].shift();return this.usedTextures[s].push(p),p}let i;return n===Ne.PACKED_2X2_FLOAT32?i=this.gpgpu.createPackedMatrixTexture(t[0],t[1]):n===Ne.PACKED_2X2_FLOAT16?i=this.gpgpu.createFloat16PackedMatrixTexture(t[0],t[1]):n===Ne.UNPACKED_FLOAT32?i=this.gpgpu.createFloat32MatrixTexture(t[0],t[1]):n===Ne.UNPACKED_FLOAT16?i=this.gpgpu.createFloat16MatrixTexture(t[0],t[1]):n===Ne.PACKED_4X1_UNSIGNED_BYTE&&(i=this.gpgpu.createUnsignedBytesMatrixTexture(t[0],t[1])),this.usedTextures[s].push(i),this.numUsedTextures++,this._numBytesAllocated+=a,this.log(),i}releaseTexture(t,e,o,n){if(this.freeTextures==null)return;let s=tk(o,n),a=ek(e,s,n);a in this.freeTextures||(this.freeTextures[a]=[]);let i=J1(e,s,this.gpgpu.gl,this.gpgpu.textureConfig,n),p=_().get("WEBGL_DELETE_TEXTURE_THRESHOLD");p!==-1&&this._numBytesAllocated>p?(this.gpgpu.deleteMatrixTexture(t.texture),this._numBytesAllocated-=i):(this.freeTextures[a].push(t),this.numFreeTextures++,this._numBytesFree+=i),this.numUsedTextures--;let c=this.usedTextures[a],l=c.indexOf(t);if(l<0)throw new Error("Cannot release a texture that was never provided by this texture manager");c.splice(l,1),this.log()}log(){if(!this.logEnabled)return;let t=this.numFreeTextures+this.numUsedTextures;console.log("Free/Used",`${this.numFreeTextures} / ${this.numUsedTextures}`,`(${t})`);let e=this._numBytesFree/this._numBytesAllocated;console.log(`Bytes allocated: ${this._numBytesAllocated}`),console.log(`Bytes unused: ${this._numBytesFree} (${Math.round(100*e)}%)`)}get numBytesAllocated(){return this._numBytesAllocated}get numBytesFree(){return this._numBytesFree}getNumUsedTextures(){return this.numUsedTextures}getNumFreeTextures(){return this.numFreeTextures}dispose(){if(this.freeTextures!=null){for(let t in this.freeTextures)this.freeTextures[t].forEach(e=>{this.gpgpu.deleteMatrixTexture(e.texture)});for(let t in this.usedTextures)this.usedTextures[t].forEach(e=>{this.gpgpu.deleteMatrixTexture(e.texture)});this.freeTextures=null,this.usedTextures=null,this.numUsedTextures=0,this.numFreeTextures=0,this._numBytesAllocated=0,this._numBytesFree=0}}};function zV(r,t){let e=r;if(t===e.R32F)return 4;if(t===e.R16F)return 2;if(t===e.RGBA32F)return 16;if(t===r.RGBA)return 16;if(t===e.RGBA16F)return 8;if(t===e.RGBA8)return 4;throw new Error(`Unknown internal format ${t}`)}function J1(r,t,e,o,n){let s=WV(t,o),a;if(n){let[p,c]=on(r[0],r[1]);a=p*c}else{let[p,c]=pp(r[0],r[1]);a=p*c}let i=zV(e,s);return a*i}function WV(r,t){switch(r){case Ne.PACKED_2X2_FLOAT32:return ay(t);case Ne.PACKED_2X2_FLOAT16:return iy(t);case Ne.UNPACKED_FLOAT32:return oy(t);case Ne.UNPACKED_FLOAT16:return ny(t);case Ne.PACKED_4X1_UNSIGNED_BYTE:return sy(t);default:throw new Error(`Unknown physical texture type ${r}`)}}function UV(r){return _().getBool("WEBGL_RENDER_FLOAT32_ENABLED")?r?Ne.PACKED_2X2_FLOAT32:Ne.UNPACKED_FLOAT32:r?Ne.PACKED_2X2_FLOAT16:Ne.UNPACKED_FLOAT16}function tk(r,t){if(r===Re.UPLOAD)return Ne.PACKED_2X2_FLOAT32;if(r===Re.RENDER||r==null)return UV(t);if(r===Re.DOWNLOAD||r===Re.PIXELS)return Ne.PACKED_4X1_UNSIGNED_BYTE;throw new Error(`Unknown logical texture type ${r}`)}function ek(r,t,e){return`${r[0]}_${r[1]}_${t}_${e}`}var Le=class{constructor(t,e){this.variableNames=["A"],this.outputShape=t,this.enableShapeUniforms=Bt(this.outputShape.length),this.userCode=`
      float unaryOperation(float x) {
        ${e}
      }

      void main() {
        float x = getAAtOutCoords();
        float y = unaryOperation(x);

        setOutput(y);
      }
    `}},ue="if (isnan(x)) return x;",rk="return x;",cy="return abs(x);";var ok="return (x >= 0.0) ? x : (exp(x) - 1.0);",nk=ue+`
  return (x < 0.0) ? 0.0 : x;
`,sk=ue+`
  return (x < 0.0) ? 0.0 : min(6.0, x);
`,fp="return x;",ak="return 1.0 / (1.0 + exp(-1.0 * x));";var pk="return x;",ck=`
  vec4 result;

  result.r = (x.r >= 0.0) ? x.r : (exp(x.r) - 1.0);
  result.g = (x.g >= 0.0) ? x.g : (exp(x.g) - 1.0);
  result.b = (x.b >= 0.0) ? x.b : (exp(x.b) - 1.0);
  result.a = (x.a >= 0.0) ? x.a : (exp(x.a) - 1.0);

  return result;
`,lk=`
  vec4 result = x * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,uk=`
  vec4 result = min(x, vec4(6.)) * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,mk="return 1.0 / (1.0 + exp(-1.0 * x));",Cr=class{constructor(t,e){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=t,this.enableShapeUniforms=Bt(this.outputShape.length),this.userCode=`
      vec4 unaryOperation(vec4 x) {
        ${e}
      }

      void main() {
        vec4 x = getAAtOutCoords();
        vec4 y = unaryOperation(x);

        setOutput(y);
      }
    `}};var Zm=class{constructor(t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!1,this.outputShape=t,this.enableShapeUniforms=Bt(this.outputShape.length);let e=t.length,o=re("rc",e),n=wt(e),s=Q1(e,o),a=o.slice(-2),i=e<=1?"rc":`vec2(${a.join(",")})`;this.userCode=`
      void main() {
        ${n} rc = getOutputCoords();
        vec4 packedInput = getA(${s});

        setOutput(getChannel(packedInput, ${i}));
      }
    `}};var qV=we.whereImpl,KV=1e-7,XV=1e-4,Qm={};function jV(r){return r in Qm||(Qm[r]={}),Qm[r]}var YV=_().getNumber("CPU_HANDOFF_SIZE_THRESHOLD"),ZV=600;function QV(){return _().global.screen==null?1024:_().global.screen.height*_().global.screen.width*window.devicePixelRatio*ZV/1024/1024}var Ql=class r extends oo{constructor(t){if(super(),this.pendingRead=new WeakMap,this.pendingDisposal=new WeakSet,this.dataRefCount=new WeakMap,this.numBytesInGPU=0,this.uploadWaitMs=0,this.downloadWaitMs=0,this.lastGlFlushTime=0,this.warnedAboutMemory=!1,this.pendingDeletes=0,this.disposed=!1,!_().getBool("HAS_WEBGL"))throw new Error("WebGL is not supported on this device");let e;if(t!=null){if(t instanceof cc)e=t;else{let o=ar(_().getNumber("WEBGL_VERSION"),t);e=new cc(o)}this.binaryCache={},this.gpgpuCreatedLocally=!1}else{let o=ar(_().getNumber("WEBGL_VERSION"));e=new cc(o),this.binaryCache=jV(_().getNumber("WEBGL_VERSION")),this.gpgpuCreatedLocally=!0}this.gpgpu=e,this.canvas=this.gpgpu.gl.canvas,this.textureManager=new Ym(this.gpgpu),this.numMBBeforeWarning=QV(),this.texData=new Is(this,Zr())}nextDataId(){return r.nextDataId++}numDataIds(){return this.texData.numDataIds()-this.pendingDeletes}write(t,e,o){if((_().getBool("WEBGL_CHECK_NUMERICAL_PROBLEMS")||_().getBool("DEBUG"))&&this.checkNumericalProblems(t),o==="complex64"&&t!=null)throw new Error("Cannot write to a complex64 dtype. Please use tf.complex(real, imag).");let n={id:this.nextDataId()};return this.texData.set(n,{shape:e,dtype:o,values:t,usage:Re.UPLOAD,refCount:1}),n}refCount(t){return this.texData.has(t)?this.texData.get(t).refCount:0}incRef(t){let e=this.texData.get(t);e.refCount++}decRef(t){if(this.texData.has(t)){let e=this.texData.get(t);e.refCount--}}move(t,e,o,n,s){if(_().getBool("DEBUG")&&this.checkNumericalProblems(e),n==="complex64")throw new Error("Cannot write to a complex64 dtype. Please use tf.complex(real, imag).");this.texData.set(t,{shape:o,dtype:n,values:e,usage:Re.UPLOAD,refCount:s})}disposeIntermediateTensorInfo(t){this.disposeData(t.dataId)}readSync(t){let e=this.texData.get(t),{values:o,dtype:n,complexTensorInfos:s,slice:a,shape:i,isPacked:p}=e;if(a!=null){let m;p?m=new Cr(i,fp):m=new Le(i,fp);let f=this.runWebGLProgram(m,[{dataId:t,shape:i,dtype:n}],n),d=this.readSync(f.dataId);return this.disposeIntermediateTensorInfo(f),d}if(o!=null)return this.convertAndCacheOnCPU(t);if(n==="string")return o;let c=this.activeTimers!=null,l;c&&(l=y.now());let u;if(n==="complex64"){let m=this.readSync(s.real.dataId),f=this.readSync(s.imag.dataId);u=I.mergeRealAndImagArrays(m,f)}else u=this.getValuesFromTexture(t);return c&&(this.downloadWaitMs+=y.now()-l),this.convertAndCacheOnCPU(t,u)}async read(t){if(this.pendingRead.has(t)){let d=this.pendingRead.get(t);return new Promise(g=>d.push(g))}let e=this.texData.get(t),{values:o,shape:n,slice:s,dtype:a,complexTensorInfos:i,isPacked:p}=e;if(s!=null){let d;p?d=new Cr(n,fp):d=new Le(n,fp);let g=this.runWebGLProgram(d,[{dataId:t,shape:n,dtype:a}],a),h=this.read(g.dataId);return this.disposeIntermediateTensorInfo(g),h}if(o!=null)return this.convertAndCacheOnCPU(t);if(_().getBool("DEBUG")&&!_().getBool("WEBGL_DOWNLOAD_FLOAT_ENABLED")&&_().getNumber("WEBGL_VERSION")===2)throw new Error("tensor.data() with WEBGL_DOWNLOAD_FLOAT_ENABLED=false and WEBGL_VERSION=2 not yet supported.");let c=null,l;if(a!=="complex64"&&_().get("WEBGL_BUFFER_SUPPORTED")){l=this.decode(t);let d=this.texData.get(l.dataId);c=this.gpgpu.createBufferFromTexture(d.texture.texture,...Kl(n))}this.pendingRead.set(t,[]),a!=="complex64"&&await this.gpgpu.createAndWaitForFence();let u;if(a==="complex64"){let d=await Promise.all([this.read(i.real.dataId),this.read(i.imag.dataId)]),g=d[0],h=d[1];u=I.mergeRealAndImagArrays(g,h)}else if(c==null)u=this.getValuesFromTexture(t);else{let d=y.sizeFromShape(n);u=this.gpgpu.downloadFloat32MatrixFromBuffer(c,d)}if(l!=null&&this.disposeIntermediateTensorInfo(l),c!=null){let d=this.gpgpu.gl;ut(d,()=>d.deleteBuffer(c))}let m=this.convertAndCacheOnCPU(t,u),f=this.pendingRead.get(t);return this.pendingRead.delete(t),f.forEach(d=>d(m)),this.pendingDisposal.has(t)&&(this.pendingDisposal.delete(t),this.disposeData(t)&&Zr().removeDataId(t,this),this.pendingDeletes--),m}readToGPU(t,e={}){let o=this.texData.get(t),{values:n,shape:s,slice:a,dtype:i,isPacked:p,texture:c}=o;if(i==="complex64")throw new Error("Does not support reading texture for complex64 dtype.");if(a!=null){let f;p?f=new Cr(s,fp):f=new Le(s,fp);let d=this.runWebGLProgram(f,[{dataId:t,shape:s,dtype:i}],i),g=this.readToGPU(d,e);return this.disposeIntermediateTensorInfo(d),g}if(c==null)throw n!=null?new Error("Data is not on GPU but on CPU."):new Error("There is no data on GPU or CPU.");let l=this.decode(t,e.customTexShape),u=Zr().makeTensorFromTensorInfo(l),m=this.texData.get(l.dataId);return Object.assign({tensorRef:u},m.texture)}bufferSync(t){let e=this.readSync(t.dataId);if(t.dtype==="string")try{let o=e.map(n=>y.decodeString(n));return pt(t.shape,t.dtype,o)}catch{throw new Error("Failed to decode encoded string bytes into utf-8")}return pt(t.shape,t.dtype,e)}checkNumericalProblems(t){if(t!=null)for(let e=0;e<t.length;e++){let o=t[e];if(!bI(o))throw _().getBool("WEBGL_RENDER_FLOAT32_CAPABLE")?Error(`The value ${o} cannot be represented with your current settings. Consider enabling float32 rendering: 'tf.env().set('WEBGL_RENDER_FLOAT32_ENABLED', true);'`):Error(`The value ${o} cannot be represented on this device.`)}}getValuesFromTexture(t){let{shape:e,dtype:o,isPacked:n}=this.texData.get(t),s=y.sizeFromShape(e);if(_().getBool("WEBGL_DOWNLOAD_FLOAT_ENABLED")){let m=this.decode(t),f=this.texData.get(m.dataId),d=this.gpgpu.downloadMatrixFromPackedTexture(f.texture.texture,...Kl(e)).subarray(0,s);return this.disposeIntermediateTensorInfo(m),d}let a=_().getBool("WEBGL_PACK")&&n===!0,i=a?Pm(e):e,p=a?new Wm(i):new zm(i),c=this.runWebGLProgram(p,[{shape:i,dtype:o,dataId:t}],"float32"),l=this.texData.get(c.dataId),u=this.gpgpu.downloadByteEncodedFloatMatrixFromOutputTexture(l.texture.texture,l.texShape[0],l.texShape[1]).subarray(0,s);return this.disposeIntermediateTensorInfo(c),u}timerAvailable(){return _().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0}time(t){let e=this.activeTimers,o=[],n=!1;this.programTimersStack==null?(this.programTimersStack=o,n=!0):this.activeTimers.push(o),this.activeTimers=o,t();let s=y.flatten(this.activeTimers.map(p=>p.query)).filter(p=>p!=null),a=y.flatten(this.activeTimers.map(p=>p.name)).filter(p=>p!=null);this.activeTimers=e,n&&(this.programTimersStack=null);let i={uploadWaitMs:this.uploadWaitMs,downloadWaitMs:this.downloadWaitMs,kernelMs:null,wallMs:null};return(async()=>{if(_().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0){let p=await Promise.all(s);i.kernelMs=y.sum(p),i.getExtraProfileInfo=()=>p.map((c,l)=>({name:a[l],ms:c})).map(c=>`${c.name}: ${c.ms}`).join(", ")}else i.kernelMs={error:"WebGL query timers are not supported in this environment."};return this.uploadWaitMs=0,this.downloadWaitMs=0,i})()}memory(){return{unreliable:!1,numBytesInGPU:this.numBytesInGPU,numBytesInGPUAllocated:this.textureManager.numBytesAllocated,numBytesInGPUFree:this.textureManager.numBytesFree}}startTimer(){return _().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0?this.gpgpu.beginQuery():{startMs:y.now(),endMs:null}}endTimer(t){return _().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0?(this.gpgpu.endQuery(),t):(t.endMs=y.now(),t)}async getQueryTime(t){if(_().getNumber("WEBGL_DISJOINT_QUERY_TIMER_EXTENSION_RELIABLE")>0)return this.gpgpu.waitForQueryAndGetTime(t);let e=t;return e.endMs-e.startMs}disposeData(t,e=!1){if(this.pendingDisposal.has(t))return!1;if(!this.texData.has(t))return!0;if(e?this.texData.get(t).refCount=0:this.texData.get(t).refCount--,!e&&this.texData.get(t).refCount>0)return!1;if(this.pendingRead.has(t))return this.pendingDisposal.add(t),this.pendingDeletes++,!1;this.releaseGPUData(t);let{complexTensorInfos:o}=this.texData.get(t);return o!=null&&(this.disposeData(o.real.dataId,e),this.disposeData(o.imag.dataId,e)),this.texData.delete(t),!0}releaseGPUData(t){let{texture:e,dtype:o,texShape:n,usage:s,isPacked:a,slice:i}=this.texData.get(t),p=i&&i.origDataId||t,c=this.dataRefCount.get(p);c>1?this.dataRefCount.set(p,c-1):(this.dataRefCount.delete(p),e!=null&&(this.numBytesInGPU-=this.computeBytes(n,o),this.textureManager.releaseTexture(e,n,s,a)));let l=this.texData.get(t);l.texture=null,l.texShape=null,l.isPacked=!1,l.slice=null}getTexture(t){return this.uploadToGPU(t),this.texData.get(t).texture.texture}getDataInfo(t){return this.texData.get(t)}shouldExecuteOnCPU(t,e=YV){return _().getBool("WEBGL_CPU_FORWARD")&&t.every(o=>this.texData.get(o.dataId).texture==null&&y.sizeFromShape(o.shape)<e)}getGPGPUContext(){return this.gpgpu}where(t){I.warn("tf.where() in webgl locks the UI thread. Call tf.whereAsync() instead");let e=t.dataSync();return qV(t.shape,e)}packedUnaryOp(t,e,o){let n=new Cr(t.shape,e),s=this.compileAndRun(n,[t],o);return Zr().makeTensorFromTensorInfo(s)}abs(t){if(this.shouldExecuteOnCPU([t])&&t.dtype!=="complex64"){let n=Km(this.texData.get(t.dataId).values);return this.makeOutput(t.shape,t.dtype,n)}if(_().getBool("WEBGL_PACK_UNARY_OPERATIONS"))return this.packedUnaryOp(t,cy,t.dtype);let e=new Le(t.shape,cy),o=this.compileAndRun(e,[t]);return Zr().makeTensorFromTensorInfo(o)}makeTensorInfo(t,e,o){let n;if(e==="string"&&o!=null&&o.length>0&&y.isString(o[0])){let s=o.map(a=>y.encodeString(a));n=this.write(s,t,e)}else n=this.write(o,t,e);return this.texData.get(n).usage=null,{dataId:n,shape:t,dtype:e}}makeOutput(t,e,o){return Zr().makeTensorFromTensorInfo(this.makeTensorInfo(t,e,o),this)}unpackTensor(t){let e=new Zm(t.shape);return this.runWebGLProgram(e,[t],t.dtype)}packTensor(t){let e=new jm(t.shape);return this.runWebGLProgram(e,[t],t.dtype,null,!0)}packedReshape(t,e){let o=[la(t.shape),...ua(t.shape)],n={dtype:t.dtype,shape:o,dataId:t.dataId},s=[la(e),...ua(e)],a=new lc(s,o),i=!0,p=[o],c=this.runWebGLProgram(a,[n],t.dtype,p,i);return{dataId:c.dataId,shape:e,dtype:c.dtype}}decode(t,e){let o=this.texData.get(t),{isPacked:n,shape:s,dtype:a}=o;if(e!=null){let m=y.sizeFromShape(s),f=e[0]*e[1]*4;y.assert(m<=f,()=>"customTexShape is too small. Row * Column * 4 should be equal or larger than the size of the tensor data.")}let i=Pm(s),p;n?p=new Vm(i):p=new Gm(i);let c=!0,l=[e!=null?e:Kl(i)],u=this.runWebGLProgram(p,[{shape:i,dtype:a,dataId:t}],a,l,c,e);return{dtype:a,shape:s,dataId:u.dataId}}runWebGLProgram(t,e,o,n,s=!1,a){let i=this.makeTensorInfo(t.outputShape,o),p=this.texData.get(i.dataId);if(t.packedOutput&&(p.isPacked=!0),t.outPackingScheme===ca.DENSE){let x=a!=null?a:Kl(t.outputShape);p.texShape=x.map(b=>b*2)}if(t.outTexUsage!=null&&(p.usage=t.outTexUsage),y.sizeFromShape(i.shape)===0)return p.values=y.getTypedArrayFromDType(i.dtype,0),i;let c=[],l=e.map(x=>{if(x.dtype==="complex64")throw new Error("GPGPUProgram does not support complex64 input. For complex64 dtypes, please separate the program into real and imaginary parts.");let b=this.texData.get(x.dataId);if(b.texture==null){if(!t.packedInputs&&y.sizeFromShape(x.shape)<=_().getNumber("WEBGL_SIZE_UPLOAD_UNIFORM"))return{shape:x.shape,texData:null,isUniform:!0,uniformValues:b.values};t.packedInputs&&(b.isPacked=!0,b.shape=x.shape)}if(this.uploadToGPU(x.dataId),!!b.isPacked!=!!t.packedInputs)x=b.isPacked?this.unpackTensor(x):this.packTensor(x),c.push(x),b=this.texData.get(x.dataId);else if(b.isPacked&&!cp(b.shape,x.shape)){let S=x,w=x.shape;x.shape=b.shape,x=this.packedReshape(x,w),c.push(x),b=this.texData.get(x.dataId),S.shape=w}return{shape:x.shape,texData:b,isUniform:!1}});this.uploadToGPU(i.dataId);let u={shape:i.shape,texData:p,isUniform:!1},m=KI(t,l,u),f=this.getAndSaveBinary(m,()=>HI(this.gpgpu,t,l,u)),d=this.activeTimers!=null,g;d&&(g=this.startTimer()),_().get("ENGINE_COMPILE_ONLY")||qI(this.gpgpu,f,l,u,n),c.forEach(x=>this.disposeIntermediateTensorInfo(x)),d&&(g=this.endTimer(g),this.activeTimers.push({name:t.constructor.name,query:this.getQueryTime(g)}));let h=_().get("WEBGL_FLUSH_THRESHOLD");if(h>0){let x=y.now();x-this.lastGlFlushTime>h&&(this.gpgpu.gl.flush(),this.lastGlFlushTime=x)}if(!_().getBool("WEBGL_LAZILY_UNPACK")&&p.isPacked&&s===!1){let x=this.unpackTensor(i);return this.disposeIntermediateTensorInfo(i),x}return i}compileAndRun(t,e,o,n,s=!1){return o=o||e[0].dtype,this.runWebGLProgram(t,e,o,n,s)}getAndSaveBinary(t,e){return t in this.binaryCache||(this.binaryCache[t]=e()),this.binaryCache[t]}getTextureManager(){return this.textureManager}dispose(){this.disposed||(_().getBool("IS_TEST")||Object.keys(this.binaryCache).forEach(e=>{this.gpgpu.deleteProgram(this.binaryCache[e].webGLProgram),delete this.binaryCache[e]}),this.textureManager.dispose(),this.canvas!=null&&typeof HTMLCanvasElement!="undefined"&&this.canvas instanceof HTMLCanvasElement?this.canvas.remove():this.canvas=null,this.gpgpuCreatedLocally&&(this.gpgpu.program=null,this.gpgpu.dispose()),this.disposed=!0)}floatPrecision(){return this.floatPrecisionValue==null&&(this.floatPrecisionValue=St(()=>{if(!_().get("WEBGL_RENDER_FLOAT32_ENABLED")){let t=_().getBool("DEBUG");_().set("DEBUG",!1);let e=this.abs(J(1e-8)).dataSync()[0];if(_().set("DEBUG",t),e>0)return 32}return 16})),this.floatPrecisionValue}epsilon(){return this.floatPrecision()===32?KV:XV}uploadToGPU(t){let e=this.texData.get(t),{shape:o,dtype:n,values:s,texture:a,usage:i,isPacked:p}=e;if(a!=null)return;let c=this.activeTimers!=null,l;c&&(l=y.now());let u=e.texShape;if(u==null&&(u=RI(o,p),e.texShape=u),s!=null){let m=Pm(o),f,d=u[1],g=u[0],h=s instanceof Uint8Array||s instanceof Uint8ClampedArray;(p||!h)&&([d,g]=on(u[0],u[1])),p?f=new Hm(m,h):f=new Um(m,h);let x=h?[g,d]:u,b=this.makeTensorInfo(x,n),S=this.texData.get(b.dataId);h?S.usage=Re.PIXELS:S.usage=Re.UPLOAD,S.texShape=x,this.gpgpu.uploadDenseMatrixToTexture(this.getTexture(b.dataId),d,g,s);let w=[[g,d]],$=this.runWebGLProgram(f,[b],n,w,!0),D=this.texData.get($.dataId);e.texShape=D.texShape,e.isPacked=D.isPacked,e.usage=D.usage,_().get("ENGINE_COMPILE_ONLY")?this.disposeData($.dataId):(e.texture=D.texture,e.values=null,this.texData.delete($.dataId)),this.disposeIntermediateTensorInfo(b),c&&(this.uploadWaitMs+=y.now()-l)}else{let m=this.acquireTexture(u,i,n,p);e.texture=m}}convertAndCacheOnCPU(t,e){let o=this.texData.get(t),{dtype:n}=o;return this.releaseGPUData(t),e!=null&&(o.values=JV(e,n)),o.values}acquireTexture(t,e,o,n){if(this.numBytesInGPU+=this.computeBytes(t,o),!this.warnedAboutMemory&&this.numBytesInGPU>this.numMBBeforeWarning*1024*1024){let s=(this.numBytesInGPU/1024/1024).toFixed(2);this.warnedAboutMemory=!0,console.warn(`High memory usage in GPU: ${s} MB, most likely due to a memory leak`)}return this.textureManager.acquireTexture(t,e,n)}computeBytes(t,e){return t[0]*t[1]*y.bytesPerElement(e)}checkCompileCompletion(){for(let[,t]of Object.entries(this.binaryCache))this.checkCompletion_(t)}async checkCompileCompletionAsync(){let t=[];if(this.gpgpu.parallelCompilationExtension){for(let[,e]of Object.entries(this.binaryCache))t.push(this.checkCompletionAsync_(e));return Promise.all(t)}else{for(let[,e]of Object.entries(this.binaryCache)){let o=new Promise(n=>{try{this.checkCompletion_(e),n(!0)}catch(s){throw s}});t.push(o)}return Promise.all(t)}}async checkCompletionAsync_(t){return this.gpgpu.gl.getProgramParameter(t.webGLProgram,this.gpgpu.parallelCompilationExtension.COMPLETION_STATUS_KHR)?this.checkCompletion_(t):(await pm(),this.checkCompletionAsync_(t))}checkCompletion_(t){if(this.gpgpu.gl.getProgramParameter(t.webGLProgram,this.gpgpu.gl.LINK_STATUS)===!1)throw console.log(this.gpgpu.gl.getProgramInfoLog(t.webGLProgram)),this.gpgpu.gl.getShaderParameter(t.fragmentShader,this.gpgpu.gl.COMPILE_STATUS)===!1?(Qx(t.source,this.gpgpu.gl.getShaderInfoLog(t.fragmentShader)),new Error("Failed to compile fragment shader.")):new Error("Failed to link vertex and fragment shaders.");return!0}getUniformLocations(){for(let[,t]of Object.entries(this.binaryCache)){let{uniformLocations:e,customUniformLocations:o,infLoc:n,nanLoc:s,inShapesLocations:a,inTexShapesLocations:i,outShapeLocation:p,outShapeStridesLocation:c,outTexShapeLocation:l}=ry(this.gpgpu,t.program,t.webGLProgram);t.uniformLocations=e,t.customUniformLocations=o,t.infLoc=n,t.nanLoc=s,t.inShapesLocations=a,t.inTexShapesLocations=i,t.outShapeLocation=p,t.outShapeStridesLocation=c,t.outTexShapeLocation=l}}};Ql.nextDataId=0;function JV(r,t){if(t==="float32"||t==="complex64")return r;if(t==="int32"||t==="bool"){let e=t==="int32"?new Int32Array(r.length):new Uint8Array(r.length);for(let o=0;o<e.length;++o)e[o]=Math.round(r[o]);return e}else throw new Error(`Unknown dtype ${t}`)}ds.isBrowser()&&Fl("webgl",()=>new Ql,2);var uc=`
  if (isnan(a)) return a;
  if (isnan(b)) return b;
`;var Tr=class{constructor(t,e,o){this.variableNames=["A","B"],this.outputShape=I.assertAndGetBroadcastShape(e,o),this.enableShapeUniforms=Bt(this.outputShape.length),this.userCode=`
      float binaryOperation(float a, float b) {
        ${t}
      }

      void main() {
        float a = getAAtOutCoords();
        float b = getBAtOutCoords();
        setOutput(binaryOperation(a, b));
      }
    `}};var sn=`
  result.r = isNaN.r ? NAN : result.r;
  result.g = isNaN.g ? NAN : result.g;
  result.b = isNaN.b ? NAN : result.b;
  result.a = isNaN.a ? NAN : result.a;
`;var Or=class{constructor(t,e,o,n=!1){this.variableNames=["A","B"],this.supportsBroadcasting=!0,this.packedInputs=!0,this.packedOutput=!0,this.outputShape=I.assertAndGetBroadcastShape(e,o);let s=this.outputShape.length;this.enableShapeUniforms=Bt(s);let a="";if(n)if(s===0||y.sizeFromShape(this.outputShape)===1)a=`
          result.y = 0.;
          result.z = 0.;
          result.w = 0.;
        `;else if(a=`
          ${wt(s)} coords = getOutputCoords();
        `,s===1)this.enableShapeUniforms?a+=`
            result.y = (coords + 1) >= outShape ? 0. : result.y;
            result.z = 0.;
            result.w = 0.;
          `:a+=`
            result.y = (coords + 1) >= ${this.outputShape[0]} ? 0. : result.y;
            result.z = 0.;
            result.w = 0.;
          `;else{let p=re("coords",s);this.enableShapeUniforms?a+=`
            bool nextRowOutOfBounds =
              (${p[s-2]} + 1) >= outShape[${s} - 2];
            bool nextColOutOfBounds =
              (${p[s-1]} + 1) >= outShape[${s} - 1];
            result.y = nextColOutOfBounds ? 0. : result.y;
            result.z = nextRowOutOfBounds ? 0. : result.z;
            result.w = nextColOutOfBounds || nextRowOutOfBounds ? 0. : result.w;
          `:a+=`
            bool nextRowOutOfBounds =
              (${p[s-2]} + 1) >= ${this.outputShape[s-2]};
            bool nextColOutOfBounds =
              (${p[s-1]} + 1) >= ${this.outputShape[s-1]};
            result.y = nextColOutOfBounds ? 0. : result.y;
            result.z = nextRowOutOfBounds ? 0. : result.z;
            result.w = nextColOutOfBounds || nextRowOutOfBounds ? 0. : result.w;
          `}this.userCode=`
      vec4 binaryOperation(vec4 a, vec4 b) {
        ${t}
      }

      void main() {
        vec4 a = getAAtOutCoords();
        vec4 b = getBAtOutCoords();

        vec4 result = binaryOperation(a, b);
        ${a}

        setOutput(result);
      }
    `}};function oe(r){let{inputs:t,backend:e}=r,{x:o}=t;return e.incRef(o.dataId),{dataId:o.dataId,shape:o.shape,dtype:o.dtype}}var fk={kernelName:zr,backendName:"webgl",kernelFunc:oe};function Ze(r){let{inputs:t,backend:e}=r,{real:o,imag:n}=t,s=e.makeTensorInfo(o.shape,"complex64"),a=e.texData.get(s.dataId),i=oe({inputs:{x:o},backend:e}),p=oe({inputs:{x:n},backend:e});return a.complexTensorInfos={real:i,imag:p},s}var dk={kernelName:Ta,backendName:"webgl",kernelFunc:Ze};var ly="return (a < 0.) ? b * a : a;",uy=`
  vec4 aLessThanZero = vec4(lessThan(a, vec4(0.)));
  return (aLessThanZero * (b * a)) + ((vec4(1.0) - aLessThanZero) * a);
`;function tz(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{alpha:s}=o,a=e.makeTensorInfo([],"float32",y.createScalarValue(s,"float32")),i=_().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new Or(uy,n.shape,a.shape):new Tr(ly,n.shape,a.shape),p=e.runWebGLProgram(i,[n,a],"float32");return e.disposeIntermediateTensorInfo(a),p}var hk={kernelName:$n,backendName:"webgl",kernelFunc:tz};var my="return (a < 0.) ? b * a : a;",fy=`
  vec4 aLessThanZero = vec4(lessThan(a, vec4(0.)));
  return (aLessThanZero * (b * a)) + ((vec4(1.0) - aLessThanZero) * a);
`;function ez(r){let{inputs:t,backend:e}=r,{x:o,alpha:n}=t,s=_().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new Or(fy,o.shape,n.shape):new Tr(my,o.shape,n.shape);return e.runWebGLProgram(s,[o,n],"float32")}var gk={kernelName:Mn,backendName:"webgl",kernelFunc:ez};var Pr="if (isnan(x)) return x;";function lt({opSnippet:r,packedOpSnippet:t,cpuKernelImpl:e,dtype:o}){return({inputs:n,backend:s})=>{let{x:a}=n,i=s,p=o||a.dtype;if(i.shouldExecuteOnCPU([a])&&e!=null){let u=i.texData.get(a.dataId),m=e(u.values,p);return i.makeTensorInfo(a.shape,p,m)}let c=_().getBool("WEBGL_PACK_UNARY_OPERATIONS")&&t!=null,l;return c?l=new Cr(a.shape,t):l=new Le(a.shape,r),i.runWebGLProgram(l,[a],p)}}function Ot({opSnippet:r,packedOpSnippet:t,checkOutOfBounds:e=!1,supportsComplex:o=!1,cpuKernelImpl:n,dtype:s}){return({inputs:a,backend:i})=>{let{a:p,b:c}=a,l=i;if(o&&p.dtype==="complex64"){let d=l.texData.get(p.dataId),g=l.texData.get(c.dataId),[h,x]=[[d.complexTensorInfos.real,g.complexTensorInfos.real],[d.complexTensorInfos.imag,g.complexTensorInfos.imag]].map(S=>{let[w,E]=S,$={dataId:w.dataId,dtype:w.dtype,shape:p.shape},D={dataId:E.dataId,dtype:E.dtype,shape:c.shape},F=new Tr(r,p.shape,c.shape);return l.runWebGLProgram(F,[$,D],ne(w.dtype,E.dtype))}),b=Ze({inputs:{real:h,imag:x},backend:l});return l.disposeIntermediateTensorInfo(h),l.disposeIntermediateTensorInfo(x),b}let u=s||ne(p.dtype,c.dtype);if((p.dtype==="string"||c.dtype==="string"||l.shouldExecuteOnCPU([p,c]))&&n!=null){let d=l.texData.get(p.dataId).values,g=l.texData.get(c.dataId).values,h=p.dtype==="string"?I.fromUint8ToStringArray(d):d,x=p.dtype==="string"?I.fromUint8ToStringArray(g):g,[b,S]=n(p.shape,c.shape,h,x,u),w=l.makeTensorInfo(S,u),E=l.texData.get(w.dataId);return E.values=b,w}let m=_().getBool("WEBGL_PACK_BINARY_OPERATIONS")&&t!=null,f;return m?f=new Or(t,p.shape,c.shape,e):f=new Tr(r,p.shape,c.shape),l.runWebGLProgram(f,[p,c],u)}}function bs(r,t=!1){if(r==="linear")return t?pk:rk;if(r==="relu")return t?lk:nk;if(r==="elu")return t?ck:ok;if(r==="relu6")return t?uk:sk;if(r==="prelu")return t?fy:my;if(r==="leakyrelu")return t?uy:ly;if(r==="sigmoid")return t?mk:ak;throw new Error(`Activation ${r} has not been implemented for the WebGL backend.`)}var mc=class{constructor(t,e,o,n=!1,s=!1,a=!1,i=null,p=!1,c=!1){this.variableNames=["matrixA","matrixB"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=o,this.enableShapeUniforms=Bt(this.outputShape.length);let l=n?t[1]:t[2],u=Math.ceil(l/2),m=n?"i * 2, rc.y":"rc.y, i * 2",f=s?"rc.z, i * 2":"i * 2, rc.z",d=n?["a.xxyy","a.zzww"]:["a.xxzz","a.yyww"],g=s?["b.xzxz","b.ywyw"]:["b.xyxy","b.zwzw"],h="",x="";i&&(p?h=`vec4 activation(vec4 a) {
          vec4 b = getPreluActivationWeightsAtOutCoords();
          ${i}
        }`:c?h=`vec4 activation(vec4 a) {
          vec4 b = getLeakyreluAlphaAtOutCoords();
          ${i}
        }`:h=`vec4 activation(vec4 x) {
          ${i}
        }`,x="result = activation(result);");let b=a?"result += getBiasAtOutCoords();":"";a&&this.variableNames.push("bias"),p&&this.variableNames.push("preluActivationWeights"),c&&this.variableNames.push("leakyreluAlpha");let S="rc.x",w="rc.x";t[0]<e[0]?S=`int(min(float(rc.x), ${t[0]-1}.))`:e[0]<t[0]&&(w=`int(min(float(rc.x), ${e[0]-1}.))`),this.userCode=`
      ${h}
      // Don't use uniform for sharedDimensionPacked for performance.
      const float sharedDimension = ${u}.0;

      vec4 dot2x2ARowBCol(ivec3 rc) {
        vec4 result = vec4(0);
        for (int i = 0; i < ${u}; i++) {
          int batchA = ${S};
          int batchB = ${w};
          vec4 a = getMatrixA(batchA, ${m});
          vec4 b = getMatrixB(batchB, ${f});

          // These swizzled products need to be separately added.
          // See: https://github.com/tensorflow/tfjs/issues/1735
          result += (${d[0]} * ${g[0]});
          result += (${d[1]} * ${g[1]});
        }
        return result;
      }

      void main() {
        ivec3 rc = getOutputCoords();
        vec4 result = dot2x2ARowBCol(rc);

        ${b}

        ${x}

        setOutput(result);
      }
    `}};var dy={REAL:"return areal * breal - aimag * bimag;",IMAG:"return areal * bimag + aimag * breal;"},Jl=class{constructor(t,e,o){this.variableNames=["AReal","AImag","BReal","BImag"],this.outputShape=I.assertAndGetBroadcastShape(e,o),this.userCode=`
      float binaryOpComplex(
          float areal, float aimag, float breal, float bimag) {
        ${t}
      }

      void main() {
        float areal = getARealAtOutCoords();
        float aimag = getAImagAtOutCoords();
        float breal = getBRealAtOutCoords();
        float bimag = getBImagAtOutCoords();
        setOutput(binaryOpComplex(areal, aimag, breal, bimag));
      }
    `}};var xk="return a * b;";function tu(r){let{inputs:t,backend:e}=r,{a:o,b:n}=t,s=I.upcastType(o.dtype,n.dtype);if(o.dtype==="complex64"){let i=e.texData.get(o.dataId),p=e.texData.get(n.dataId),c=new Jl(dy.REAL,o.shape,n.shape),l=new Jl(dy.IMAG,o.shape,n.shape),u=[{dataId:i.complexTensorInfos.real.dataId,dtype:i.complexTensorInfos.real.dtype,shape:o.shape},{dataId:i.complexTensorInfos.imag.dataId,dtype:i.complexTensorInfos.imag.dtype,shape:o.shape},{dataId:p.complexTensorInfos.real.dataId,dtype:p.complexTensorInfos.real.dtype,shape:n.shape},{dataId:p.complexTensorInfos.imag.dataId,dtype:p.complexTensorInfos.imag.dtype,shape:n.shape}],m=e.runWebGLProgram(c,u,"float32"),f=e.runWebGLProgram(l,u,"float32"),d=Ze({inputs:{real:m,imag:f},backend:e});return e.disposeIntermediateTensorInfo(m),e.disposeIntermediateTensorInfo(f),d}if(e.shouldExecuteOnCPU([o,n])){let i=e.texData.get(o.dataId),p=e.texData.get(n.dataId),[c,l]=A1(o.shape,n.shape,i.values,p.values,s),u=e.makeTensorInfo(l,s),m=e.texData.get(u.dataId);return m.values=c,u}let a;return _().getBool("WEBGL_PACK_BINARY_OPERATIONS")?a=new Or(xk,o.shape,n.shape):a=new Tr(xk,o.shape,n.shape),e.runWebGLProgram(a,[o,n],s)}var yk={kernelName:$o,backendName:"webgl",kernelFunc:tu};function bk(r,t,e){let o=[la(r.shape),...ua(r.shape)],n={dtype:r.dtype,shape:o,dataId:r.dataId},s=[la(t),...ua(t)],a=new lc(s,o),i=!0,p=[o],c=e.runWebGLProgram(a,[n],r.dtype,p,i);return{dataId:c.dataId,shape:t,dtype:c.dtype}}function j(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{shape:s}=o,a=e,i=y.sizeFromShape(n.shape),p=y.inferFromImplicitShape(s,i),c=y.sizeFromShape(p);y.assert(i===c,()=>`The new shape (${p}) has ${c} elements and the old shape (${n.shape}) has ${i} elements. The new shape and old shape must have the same number of elements.`);let l=a.texData.get(n.dataId);return l.isPacked&&!cp(n.shape,p)&&!(l.texture!==null&&cp(l.shape,p))?bk(n,p,a):(a.incRef(n.dataId),{dataId:n.dataId,shape:p,dtype:n.dtype})}var Ck={kernelName:Gn,backendName:"webgl",kernelFunc:j};var eu=class{constructor(t,e){this.variableNames=["x"];let{windowSize:o,batchSize:n,inSize:s,outSize:a}=t;this.outputShape=[n,a];let i=Math.floor(o/4)*4,p=o%4,c="sumValue += dot(values, ones);";if(e!=null){let u=1/e;c=`sumValue += dot(values * ${y.isInt(u)?u.toPrecision(2):u}, ones);`}let l="";s%o>0&&(l=`
        if (inIdx < 0 || inIdx >= ${s}) {
          return 0.0;
        }
      `),this.userCode=`
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float getValue(int batch, int inIdx) {
        ${l}
        return getX(batch, inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * ${o};

        float sumValue = 0.0;

        for (int i = 0; i < ${i}; i += 4) {
          int inIdx = inOffset + i;
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          ${c}
        }

        int inIdx = inOffset + ${i};
        if (${p===1}) {
          vec4 values = vec4(getValue(batch, inIdx), 0.0, 0.0, 0.0);

          ${c}
        } else if (${p===2}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1), 0.0, 0.0);

          ${c}
        } else if (${p===3}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2), 0.0);

          ${c}
        }
        setOutput(sumValue);
      }
    `}};var Jm=class{constructor(t,e){this.variableNames=["x"];let{windowSize:o,batchSize:n,inSize:s,outSize:a}=t;this.outputShape=[n,a];let i="0.0",p="";e==="prod"?i="1.0":e==="min"?(i="1.0 / 1e-20",p="min"):e==="max"&&(i="-1.0 / 1e-20",p="max");let c=`${e}(${e}(${e}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;e==="sum"?c="sumValue":e==="prod"?c="prodValue":e==="all"?c="allValue":e==="any"&&(c="anyValue");let l=Math.floor(o/4)*4,u=o%4,m=`
      if (${e==="sum"}) {
        sumValue += dot(values, ones);
      } else if (${e==="prod"}) {
        vec2 tmp = vec2(values[0], values[1]) * vec2(values[2], values[3]);
        prodValue *= tmp[0] * tmp[1];
      } else {
        minMaxValue = ${p}(values, minMaxValue);
        if (${e==="min"} || ${e==="max"}) {
          minMaxValue = ${p}(values, minMaxValue);
          bvec4 isNaN = isnan(values);
          if (isNaN.r || isNaN.g || isNaN.b || isNaN.a) {
            minMaxValue = vec4(NAN);
          }
        }
      }
    `,f="vec4";e==="all"?(i="1.0",m=`
        bool reducedAllValue = all(values);
        float floatedReducedAllValue = float(reducedAllValue);
        allValue = float(allValue >= 1.0 && floatedReducedAllValue >= 1.0);
      `,f="bvec4"):e==="any"&&(i="0.0",m=`
        bool reducedAnyValue = any(values);
        float floatedReducedAnyValue = float(reducedAnyValue);
        anyValue = float(anyValue >= 1.0 || floatedReducedAnyValue >= 1.0);
      `,f="bvec4");let d="";s%o>0&&(d=`
        if (inIdx < 0 || inIdx >= ${s}) {
          return initializationValue;
        }
      `),this.userCode=`
      const float initializationValue = ${i};
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float getValue(int batch, int inIdx) {
        ${d}
        return getX(batch, inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * ${o};

        vec4 minMaxValue = vec4(${i});
        float prodValue = 1.0;
        float sumValue = 0.0;
        float allValue = 1.0;
        float anyValue = 0.0;

        for (int i = 0; i < ${l}; i += 4) {
          int inIdx = inOffset + i;
          ${f} values = ${f}(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          ${m}
        }

        int inIdx = inOffset + ${l};
        if (${u===1}) {
          ${f} values = ${f}(
            getValue(batch, inIdx),
            initializationValue,
            initializationValue,
            initializationValue
          );

          ${m}
        } else if (${u===2}) {
          ${f} values = ${f}(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            initializationValue,
            initializationValue
          );

          ${m}
        } else if (${u===3}) {
          ${f} values = ${f}(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            initializationValue
          );

          ${m}
        }
        setOutput(${c});
      }
    `}};function oz(r){let t=[];for(;t.length===0||t[t.length-1].outSize!==1;){let e=t.length?t[t.length-1].outSize:r[1],o=I.computeOptimalWindowSize(e);t.push({inSize:e,windowSize:o,outSize:Math.ceil(e/o)})}return t}function ir(r,t,e,o){let n=oz(r.shape),s=r;for(let a=0;a<n.length;a++){let{inSize:i,windowSize:p,outSize:c}=n[a],l,u;e==="mean"?l=a===0?new eu({windowSize:p,inSize:i,batchSize:r.shape[0],outSize:c},i):new eu({windowSize:p,inSize:i,batchSize:r.shape[0],outSize:c}):l=new Jm({windowSize:p,inSize:i,batchSize:r.shape[0],outSize:c},e),u=s,s=o.runWebGLProgram(l,[s],t),u.dataId!==r.dataId&&o.disposeIntermediateTensorInfo(u)}return s}var tf=class{constructor(t,e){this.variableNames=["A"];let o=new Array(t.length);for(let a=0;a<o.length;a++)o[a]=t[e[a]];this.outputShape=o,this.rank=o.length;let n=wt(this.rank),s=nz(e);this.userCode=`
    void main() {
      ${n} resRC = getOutputCoords();
      setOutput(getA(${s}));
    }
    `}};function nz(r){let t=r.length;if(t>6)throw Error(`Transpose for rank ${t} is not yet supported`);let e=["resRC.x","resRC.y","resRC.z","resRC.w","resRC.u","resRC.v"],o=new Array(t);for(let n=0;n<r.length;n++)o[r[n]]=e[n];return o.join()}var ef=class{constructor(t,e){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0;let o=new Array(t.length);for(let l=0;l<o.length;l++)o[l]=t[e[l]];if(this.outputShape=o,this.rank=o.length,this.rank>6)throw Error(`Packed transpose for rank ${this.rank} is not yet supported.`);let n=wt(this.rank),s=py("rc",this.rank),a=new Array(this.rank);for(let l=0;l<e.length;l++)a[e[l]]=s[l];let i=`vec2(${a.slice(-2).join()})`,p=`++${s[this.rank-1]} < ${o[this.rank-1]}`,c=`getChannel(getA(${a.join()}), ${i})`;this.userCode=`
    void main() {
      ${n} rc = getOutputCoords();
      vec4 result = vec4(0.);
      result[0] = ${c};
      if(${p}) {
        result[1] = ${c};
      }
      --${s[this.rank-1]};
      if(++${s[this.rank-2]} < ${o[this.rank-2]}) {
        result[2] = ${c};
        if(${p}) {
          result[3] = ${c};
        }
      }
      setOutput(result);
    }
    `}};function ma(r,t,e){let o=_().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new ef(r.shape,t):new tf(r.shape,t);return e.runWebGLProgram(o,[r],r.dtype)}function Tk(r,t,e,o){let n=t,s=r.shape.length,a=y.parseAxisParam(n,r.shape),i=a,p=I.getAxesPermutation(i,s),c=p!=null,l=r;c&&(l=ma(r,p,o),i=I.getInnerMostAxes(i.length,s)),I.assertAxesAreInnerMostDims("sum",i,s);let[u,m]=I.computeOutAndReduceShapes(l.shape,i),f=u;e&&(f=I.expandShapeToKeepDim(u,a));let d=y.sizeFromShape(m),h=y.sizeFromShape(r.shape)/d,x=j({inputs:{x:l},attrs:{shape:[h,d]},backend:o}),b=Ys(r.dtype),S=ir(x,b,"sum",o),w=j({inputs:{x:S},attrs:{shape:f},backend:o});return o.disposeIntermediateTensorInfo(x),o.disposeIntermediateTensorInfo(S),c&&o.disposeIntermediateTensorInfo(l),w}function dp(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s,keepDims:a}=o;return Tk(n,s,a,e)}var Sk={kernelName:"Sum",backendName:"webgl",kernelFunc:dp};function Ht(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{perm:s}=o,a=e,i=n.shape.length,p=new Array(i);for(let l=0;l<p.length;l++)p[l]=n.shape[s[l]];let c;if(a.shouldExecuteOnCPU([n])){let u=a.texData.get(n.dataId).values,m=mp(u,n.shape,n.dtype,s,p);c=a.makeTensorInfo(p,n.dtype);let f=a.texData.get(c.dataId);f.values=m}else c=ma(n,s,a);return c}var wk={kernelName:Ur,backendName:"webgl",kernelFunc:Ht};var hy=1e3;function hp({a:r,b:t,transposeA:e,transposeB:o,backend:n,bias:s=null,preluActivationWeights:a=null,leakyreluAlpha:i=0,activation:p=null}){let c=r.shape.length,l=t.shape.length,u=e?r.shape[c-2]:r.shape[c-1],m=o?t.shape[l-1]:t.shape[l-2],f=e?r.shape[c-1]:r.shape[c-2],d=o?t.shape[l-2]:t.shape[l-1],g=r.shape.slice(0,-2),h=t.shape.slice(0,-2),x=y.sizeFromShape(g),b=y.sizeFromShape(h),w=Ke.assertAndGetBroadcastShape(r.shape.slice(0,-2),t.shape.slice(0,-2)).concat([f,d]);y.assert(u===m,()=>`Error in matMul: inner shapes (${u}) and (${m}) of Tensors with shapes ${r.shape} and ${t.shape} and transposeA=${e} and transposeB=${o} must match.`);let E=e?[x,u,f]:[x,f,u],$=o?[b,d,m]:[b,m,d],D=j({inputs:{x:r},backend:n,attrs:{shape:E}}),F=j({inputs:{x:t},backend:n,attrs:{shape:$}}),P=[D,F],L=Math.max(x,b),M=e?D.shape[1]:D.shape[2],B=s!=null,G=a!=null,z=p==="leakyrelu",V=p!=null?bs(p,!0):null,H=B||G||z||V!=null,q;if((f===1||d===1)&&M>hy&&H===!1){let K=D,Y=F;e&&(K=Ht({inputs:{x:D},backend:n,attrs:{perm:[0,2,1]}}),P.push(K)),o&&(Y=Ht({inputs:{x:F},backend:n,attrs:{perm:[0,2,1]}}),P.push(Y));let Z=d!==1,ot=d===1,Q=K;Z&&(Q=j({inputs:{x:K},backend:n,attrs:{shape:[L,M,1]}}),P.push(Q));let at=d===1?2:1,et=Y;ot&&(et=j({inputs:{x:Y},backend:n,attrs:{shape:[L,1,M]}}),P.push(et));let ct=tu({inputs:{a:Q,b:et},backend:n});q=dp({inputs:{x:ct},backend:n,attrs:{axis:at,keepDims:!0}}),P.push(ct)}else{let K=ne(r.dtype,t.dtype),Y=new mc(E,$,[L,f,d],e,o,B,V,G,z),Z=[D,F];if(s!=null&&Z.push(s),G&&Z.push(a),z){let ot=n.makeTensorInfo([],"float32",y.createScalarValue(i,"float32"));Z.push(ot),P.push(ot)}q=n.runWebGLProgram(Y,Z,K)}let W=j({inputs:{x:q},backend:n,attrs:{shape:w}});P.push(q);for(let K of P)n.disposeIntermediateTensorInfo(K);return W}function sz(r){let{inputs:t,backend:e,attrs:o}=r,{a:n,b:s,bias:a,preluActivationWeights:i}=t,{transposeA:p,transposeB:c,activation:l,leakyreluAlpha:u}=o;return hp({a:n,b:s,transposeA:p,transposeB:c,backend:e,bias:a,preluActivationWeights:i,leakyreluAlpha:u,activation:l})}var Nk={kernelName:Hs,backendName:"webgl",kernelFunc:sz};var vk="return abs(x);";function az(r){let{inputs:t,backend:e}=r,{x:o}=t;if(e.shouldExecuteOnCPU([o])&&o.dtype!=="complex64"){let s=e.texData.get(o.dataId),a=Km(s.values);return e.makeTensorInfo(o.shape,o.dtype,a)}let n;return _().getBool("WEBGL_PACK_UNARY_OPERATIONS")?n=new Cr(o.shape,vk):n=new Le(o.shape,vk),e.runWebGLProgram(n,[o],o.dtype)}var Ik={kernelName:"Abs",backendName:"webgl",kernelFunc:az};var iz=ue+`
  if (abs(x) > 1.) {
    return NAN;
  }
  return acos(x);
`,pz=lt({opSnippet:iz}),kk={kernelName:ao,backendName:"webgl",kernelFunc:pz};var cz=ue+`
  if (x < 1.0) return NAN;
return log(x + sqrt(x * x - 1.0));`,lz=lt({opSnippet:cz}),Ek={kernelName:io,backendName:"webgl",kernelFunc:lz};var $k="return a + b;",uz=Ot({opSnippet:$k,packedOpSnippet:$k,supportsComplex:!0,cpuKernelImpl:l1}),Ak={kernelName:"Add",backendName:"webgl",kernelFunc:uz};var rf=class{constructor(t,e){this.outputShape=[],this.outputShape=t,this.variableNames=e.map((s,a)=>`T${a}`);let o=[];this.variableNames.forEach(s=>{o.push(`float v${s} = get${s}AtOutCoords();`)});let n=this.variableNames.map(s=>`v${s}`).join(" + ");this.userCode=`
      void main() {
        ${o.join(`
        `)}

        float result = ${n};
        setOutput(result);
      }
    `}};var of=class{constructor(t,e){this.outputShape=[],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=t,this.variableNames=e.map((s,a)=>`T${a}`);let o=[];this.variableNames.forEach(s=>{o.push(`vec4 v${s} = get${s}AtOutCoords();`)});let n=this.variableNames.map(s=>`v${s}`).join(" + ");this.userCode=`
      void main() {
        ${o.join(`
        `)}

        vec4 result = ${n};
        setOutput(result);
      }
    `}};function nf(r){let{inputs:t,backend:e}=r,o=t;if(o.length===1)return oe({inputs:{x:o[0]},backend:e});if(o.length>_().get("WEBGL_MAX_TEXTURES_IN_SHADER")){let p=Math.floor(o.length/2),c=nf({inputs:o.slice(0,p),backend:e}),l=nf({inputs:o.slice(p),backend:e});return nf({inputs:[c,l],backend:e})}let n=o.map(p=>p.dtype).reduce((p,c)=>ne(p,c)),s=o.map(p=>p.shape),i=_().getBool("WEBGL_PACK")?new of(o[0].shape,s):new rf(o[0].shape,s);return e.runWebGLProgram(i,o,n)}var Dk={kernelName:ln,backendName:"webgl",kernelFunc:nf};function mz(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s,keepDims:a}=o,i=n.shape.length,p=y.parseAxisParam(s,n.shape),c=p,l=I.getAxesPermutation(c,i),u=n;l!=null&&(u=Ht({inputs:{x:n},backend:e,attrs:{perm:l}}),c=I.getInnerMostAxes(c.length,i)),I.assertAxesAreInnerMostDims("all",c,i);let[m,f]=I.computeOutAndReduceShapes(u.shape,c),d=y.sizeFromShape(f),g=j({inputs:{x:u},backend:e,attrs:{shape:[-1,d]}}),h=ir(g,g.dtype,"all",e),x;if(a){let b=I.expandShapeToKeepDim(m,p);x=j({inputs:{x:h},backend:e,attrs:{shape:b}})}else x=j({inputs:{x:h},backend:e,attrs:{shape:m}});return e.disposeIntermediateTensorInfo(g),e.disposeIntermediateTensorInfo(h),l!=null&&e.disposeIntermediateTensorInfo(u),x}var Rk={kernelName:"All",backendName:"webgl",kernelFunc:mz};function fz(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s,keepDims:a}=o,i=n.shape.length,p=y.parseAxisParam(s,n.shape),c=p,l=I.getAxesPermutation(c,i),u=n;l!=null&&(u=Ht({inputs:{x:n},backend:e,attrs:{perm:l}}),c=I.getInnerMostAxes(c.length,i)),I.assertAxesAreInnerMostDims("any",c,i);let[m,f]=I.computeOutAndReduceShapes(u.shape,c),d=y.sizeFromShape(f),g=j({inputs:{x:u},backend:e,attrs:{shape:[-1,d]}}),h=ir(g,g.dtype,"any",e),x;if(a){let b=I.expandShapeToKeepDim(m,p);x=j({inputs:{x:h},backend:e,attrs:{shape:b}})}else x=j({inputs:{x:h},backend:e,attrs:{shape:m}});return e.disposeIntermediateTensorInfo(g),e.disposeIntermediateTensorInfo(h),l!=null&&e.disposeIntermediateTensorInfo(u),x}var Fk={kernelName:"Any",backendName:"webgl",kernelFunc:fz};var sf=class{constructor(t,e,o){this.variableNames=["A"];let{windowSize:n,batchSize:s,outSize:a}=t;o||this.variableNames.push("bestIndicesA"),this.outputShape=[s,a];let i=e==="max"?">":"<",p=o?"inOffset + i;":"round(getBestIndicesA(batch, inOffset + i));";this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = outIdx * ${n};

        int bestIndex = inOffset;
        float bestValue = getA(batch, bestIndex);

        for (int i = 0; i < ${n}; i++) {
          int inIdx = ${p};
          float candidate = getA(batch, inIdx);
          if (candidate ${i} bestValue) {
            bestValue = candidate;
            bestIndex = inIdx;
          }
        }
        setOutput(float(bestIndex));
      }
    `}};var af=class{constructor(t,e,o,n){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,y.assert(t.length>2,()=>`Packed arg${o.charAt(0).toUpperCase()+o.slice(1)} supports only inputs with rank above 2.`);let s=t[t.length-1],a=Math.ceil(s/e);this.outputShape=t.slice(0,-1),a>1&&this.outputShape.push(a),n||this.variableNames.push("bestIndicesA");let i=this.outputShape,p=i.length,c=wt(p),l=re("coords",p),u,m;if(a===1){m=p+1;let F=wt(m);u=`
        ${F} sourceLocR = ${F}(${l.join()}, 0);
        ++${l[p-1]};
        ${F} sourceLocG = ${F}(${l.join()}, 0);
        ++${l[p-2]};
        ${F} sourceLocA = ${F}(${l.join()}, 0);
        --${l[p-1]};
        ${F} sourceLocB = ${F}(${l.join()}, 0);
        --${l[p-2]};`}else m=p,u=`
        ${c} sourceLocR = coords;
        ++${l[p-1]};
        ${c} sourceLocG = coords;
        ++${l[p-2]};
        ${c} sourceLocA = coords;
        --${l[p-1]};
        ${c} sourceLocB = coords;
        --${l[p-2]};`;let f=["x","y","z","w","u","v"].slice(0,m),d="."+f[m-1],g=f.map(F=>"int "+F),h=re("sourceLocR",m-1).concat("inIdx.r"),x=re("sourceLocG",m-1).concat("inIdx.g"),b=re("sourceLocB",m-1).concat("inIdx.b"),S=re("sourceLocA",m-1).concat("inIdx.a"),w=o==="max"?"greaterThan":"lessThan",E=n?"":`
          inIdx = round(vec4(getBestIndicesAChannel(${h.join()}),
                             getBestIndicesAChannel(${x.join()}),
                             getBestIndicesAChannel(${b.join()}),
                             getBestIndicesAChannel(${S.join()})));`,$=`vec4(
            getAChannel(${h.join()}),
            hasNextCol ? getAChannel(${x.join()}) : 0.,
            hasNextRow ? getAChannel(${b.join()}) : 0.,
            hasNextRow && hasNextCol ? getAChannel(${S.join()}) : 0.)`,D=n?"":`
      float getBestIndicesAChannel(${g.join()}) {
        return getChannel(getBestIndicesA(${f.join()}),
                                          vec2(${f.slice(-2).join()}));
      }`;this.userCode=`
      float getAChannel(${g.join()}) {
        return getChannel(getA(${f.join()}),
                               vec2(${f.slice(-2).join()}));
      }
      ${D}
      void main() {
        ${c} coords = getOutputCoords();
        bool hasNextCol = ${l[p-1]} < ${i[p-1]-1};
        bool hasNextRow = ${l[p-2]} < ${i[p-2]-1};
        ${u}
        ivec4 srcIdx = ivec4(sourceLocR${d}, sourceLocG${d},
          sourceLocB${d}, sourceLocA${d}) * ${e};
        ivec4 inIdx = srcIdx;
        vec4 bestIndex = vec4(inIdx);
        vec4 bestValue = ${$};

        for (int i = 0; i < ${e}; i++) {
          inIdx = srcIdx;
          ${E}
          vec4 candidate = ${$};
          bvec4 nan = isnan(candidate);
          bvec4 replace = bvec4(
            vec4(${w}(candidate, bestValue)) * (vec4(1.0) - vec4(nan)));

          bestValue = vec4(replace.x  ? candidate.x : bestValue.x,
                           replace.y  ? candidate.y : bestValue.y,
                           replace.z  ? candidate.z : bestValue.z,
                           replace.w  ? candidate.w : bestValue.w);
          bestIndex = mix(bestIndex, vec4(inIdx), vec4(replace));
          srcIdx++;
        }
        setOutput(bestIndex);
      }
    `}};function _k(r,t,e,o=null){let n=t.shape[0],s=t.shape[1];o!=null&&(n=o.shape[0],s=o.shape[1]);let a=I.computeOptimalWindowSize(s),i={windowSize:a,inSize:s,batchSize:n,outSize:Math.ceil(s/a)},p=new sf(i,e,o==null),c=[t];o!=null&&c.push(o);let l=r.runWebGLProgram(p,c,"int32");if(l.shape[1]===1)return l;let u=_k(r,t,e,l);return r.disposeIntermediateTensorInfo(l),u}function Ok(r,t,e,o=null){let n=o!=null?o.shape:t.shape,s=n[n.length-1],a=I.computeOptimalWindowSize(s),i=new af(n,a,e,o==null),p=o==null?[t]:[t,o],c=r.runWebGLProgram(i,p,"int32");if(c.shape.length===t.shape.length){let l=Ok(r,t,e,c);return r.disposeIntermediateTensorInfo(c),l}return c}function pf(r,t,e,o){let n=[e];if(I.assertAxesAreInnerMostDims("arg"+o.charAt(0).toUpperCase()+o.slice(1),n,t.shape.length),!_().getBool("WEBGL_PACK_REDUCE")||t.shape.length<=2){let s=[],a=r.texData.get(t.dataId),i=a!==null&&a.isPacked,p=t;i&&(p=r.unpackTensor(t),s.push(p));let[c,l]=I.computeOutAndReduceShapes(p.shape,n),u=y.sizeFromShape(l),m=j({inputs:{x:p},backend:r,attrs:{shape:[-1,u]}});s.push(m);let f=_k(r,m,o);s.push(f);let d=j({inputs:{x:f},backend:r,attrs:{shape:c}});return s.forEach(g=>r.disposeIntermediateTensorInfo(g)),d}return Ok(r,t,o)}function dz(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s}=o,a=y.parseAxisParam(s,n.shape),i=I.getAxesPermutation(a,n.shape.length),p=n,c=[];i!=null&&(p=Ht({inputs:{x:n},backend:e,attrs:{perm:i}}),c.push(p),a=I.getInnerMostAxes(a.length,p.shape.length)),I.assertAxesAreInnerMostDims("argMax",[a[0]],p.shape.length);let l=pf(e,p,a[0],"max");return c.forEach(u=>e.disposeIntermediateTensorInfo(u)),l}var Pk={kernelName:un,backendName:"webgl",kernelFunc:dz};function hz(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s}=o,a=y.parseAxisParam(s,n.shape),i=I.getAxesPermutation(a,n.shape.length),p=n,c=[];i!=null&&(p=Ht({inputs:{x:n},backend:e,attrs:{perm:i}}),c.push(p),a=I.getInnerMostAxes(a.length,p.shape.length)),I.assertAxesAreInnerMostDims("argMin",[a[0]],p.shape.length);let l=pf(e,p,a[0],"min");return c.forEach(u=>e.disposeIntermediateTensorInfo(u)),l}var Lk={kernelName:mn,backendName:"webgl",kernelFunc:hz};var gz=ue+`
  if (abs(x) > 1.) {
    return NAN;
  }
  return asin(x);
`,xz=lt({opSnippet:gz}),Mk={kernelName:co,backendName:"webgl",kernelFunc:xz};var yz=ue+"return log(x + sqrt(x * x + 1.0));",bz=lt({opSnippet:yz}),Bk={kernelName:lo,backendName:"webgl",kernelFunc:bz};var Cz=ue+`
  return atan(x);
`,Tz=lt({opSnippet:Cz}),Gk={kernelName:uo,backendName:"webgl",kernelFunc:Tz};var Sz=uc+`
  return atan(a, b);
`,wz=`
  vec4 result = atan(a, b);
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+sn+`
  return result;
`,Nz=Ot({opSnippet:Sz,packedOpSnippet:wz}),Vk={kernelName:fo,backendName:"webgl",kernelFunc:Nz};var vz=ue+`
  if ((x < -1.0) || (x > 1.0)) return NAN;
return (log(1.0 + x) - log(1.0 - x)) / 2.0;`,Iz=lt({opSnippet:vz}),zk={kernelName:mo,backendName:"webgl",kernelFunc:Iz};var to=class{constructor(t,e,o,n=!1,s=!1){if(this.variableNames=["x"],e==="avg"&&o)throw new Error("Cannot compute positions for average pool.");let a=t.filterWidth,i=t.strideHeight,p=t.strideWidth,c=t.dilationHeight,l=t.dilationWidth,u=t.effectiveFilterHeight,m=t.effectiveFilterWidth,f=t.padInfo.top,d=t.padInfo.left;this.outputShape=t.outShape;let g=e==="avg",h=`((batch  * ${t.inHeight} + xR) * ${t.inWidth} + xC) * ${t.inChannels} + d`,x=`(xR * ${t.inWidth} + xC) * ${t.inChannels} + d`,b="0.0";if(g||(b="-1.0 / 1e-20"),o){this.userCode=`
        const ivec2 strides = ivec2(${i}, ${p});
        const ivec2 pads = ivec2(${f}, ${d});

        void main() {
          ivec4 coords = getOutputCoords();
          int batch = coords[0];
          int d = coords[3];

          ivec2 xRCCorner = coords.yz * strides - pads;
          int xRCorner = xRCCorner.x;
          int xCCorner = xRCCorner.y;

          // max/min x(?, ?, d) to get y(yR, yC, d).
          // ? = to be determined
          float minMaxValue = 0.0;
          float minMaxValueFound = 0.0;
          int minMaxPosition = 0;
          float avgValue = 0.0;

          for (int wR = 0; wR < ${u};
              wR += ${c}) {
            int xR = xRCorner + wR;

            if (xR < 0 || xR >= ${t.inHeight}) {
              continue;
            }

            for (int wC = 0; wC < ${m};
                wC += ${l}) {
              int xC = xCCorner + wC;

              if (xC < 0 || xC >= ${t.inWidth}) {
                continue;
              }

              float value = getX(batch, xR, xC, d);

              // If a min / max value has already been found, use it. If not,
              // use the current value.
              float currMinMaxValue = mix(
                  value, minMaxValue, minMaxValueFound);
              if (value >= currMinMaxValue) {
                minMaxValue = value;
                minMaxValueFound = 1.0;
                minMaxPosition = ${n?s?h:x:`wR * ${m} + wC`};
              }
            }
          }
          setOutput(float(minMaxPosition));
        }
      `;return}let S="max",w=`${e}(${e}(${e}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;e==="avg"&&(w="avgValue / count");let E=Math.floor(a/4)*4,$=a%4,D=`
      if (${g}) {
        avgValue += dot(values, ones);
      } else {
        minMaxValue = ${S}(values, minMaxValue);
      }
    `;this.userCode=`
      const ivec2 strides = ivec2(${i}, ${p});
      const ivec2 pads = ivec2(${f}, ${d});
      const float initializationValue = ${b};
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float count = 0.0;

      float getValue(int batch, int xR, int xC, int d) {
        if (xC < 0 || xC >= ${t.inWidth}) {
          return initializationValue;
        }
        count += 1.0;
        return getX(batch, xR, xC, d);
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d = coords[3];

        ivec2 xRCCorner = coords.yz * strides - pads;
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // max/min x(?, ?, d) to get y(yR, yC, d).
        // ? = to be determined
        vec4 minMaxValue = vec4(${b});
        float avgValue = 0.0;
        count = 0.0;

        for (int wR = 0; wR < ${u};
            wR += ${c}) {
          int xR = xRCorner + wR;

          if (xR < 0 || xR >= ${t.inHeight}) {
            continue;
          }

          for (int wC = 0; wC < ${E}; wC += 4) {
            int xC = xCCorner + wC * ${l};

            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + ${l}, d),
              getValue(batch, xR, xC + 2 * ${l}, d),
              getValue(batch, xR, xC + 3 * ${l}, d)
            );

            ${D}
          }

          int xC = xCCorner + ${E};
          if (${$===1}) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              initializationValue,
              initializationValue,
              initializationValue
            );

            ${D}
          } else if (${$===2}) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + ${l}, d),
              initializationValue,
              initializationValue
            );

            ${D}
          } else if (${$===3}) {
            vec4 values = vec4(
              getValue(batch, xR, xC, d),
              getValue(batch, xR, xC + ${l}, d),
              getValue(batch, xR, xC + 2 * ${l}, d),
              initializationValue
            );

            ${D}
          }
        }
        setOutput(${w});
      }
    `}},fa=class{constructor(t,e,o,n=!1,s=!1){if(this.variableNames=["x"],e==="avg"&&o)throw new Error("Cannot compute positions for average pool.");let a=t.filterWidth,i=t.strideDepth,p=t.strideHeight,c=t.strideWidth,l=t.dilationDepth,u=t.dilationHeight,m=t.dilationWidth,f=t.effectiveFilterDepth,d=t.effectiveFilterHeight,g=t.effectiveFilterWidth,h=t.padInfo.front,x=t.padInfo.top,b=t.padInfo.left;this.outputShape=t.outShape;let S=e==="avg",w="0.0";if(S||(w="-1.0 / 1e-20"),o){this.userCode=`
        const ivec3 strides =
            ivec3(${i}, ${p}, ${c});
        const ivec3 pads = ivec3(${h}, ${x}, ${b});

        void main() {
          ivec5 coords = getOutputCoords();
          int batch = coords.x;
          int ch = coords.u;

          ivec3 xCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
          int xDCorner = xCorner.x;
          int xRCorner = xCorner.y;
          int xCCorner = xCorner.z;

          // max/min x(?, ?, ?, ch) to get y(yD, yR, yC, ch).
          // ? = to be determined
          float minMaxValue = 0.0;
          float minMaxValueFound = 0.0;
          int minMaxPosition = 0;

          for (int wD = 0; wD < ${f};
              wD += ${l}) {
            int xD = xDCorner + wD;

            if (xD < 0 || xD >= ${t.inDepth}) {
              continue;
            }

            for (int wR = 0; wR < ${d};
                wR += ${u}) {
              int xR = xRCorner + wR;

              if (xR < 0 || xR >= ${t.inHeight}) {
                continue;
              }

              for (int wC = 0; wC < ${g};
                  wC += ${m}) {
                int xC = xCCorner + wC;

                if (xC < 0 || xC >= ${t.inWidth}) {
                  continue;
                }

                float value = getX(batch, xD, xR, xC, ch);

                // If a min / max value has already been found, use it. If not,
                // use the current value.
                float currMinMaxValue = mix(
                    value, minMaxValue, minMaxValueFound);
                if (value >= currMinMaxValue) {
                  minMaxValue = value;
                  minMaxValueFound = 1.0;
                  minMaxPosition = ${n?s?`(((batch * ${t.inDepth} + xD) * ${t.inHeight} + xR) * ${t.inWidth} + xC) * ${t.inChannels} + ch`:`((xD * ${t.inHeight} + xR) * ${t.inWidth} + xC) * ${t.inChannels} + ch`:`wD * ${d} * ${g} +
                      wR * ${g} + wC`};
                }
              }
            }
          }
          setOutput(float(minMaxPosition));
        }
      `;return}let E="max",$=`${e}(${e}(${e}(minMaxValue[0], minMaxValue[1]), minMaxValue[2]), minMaxValue[3])`;e==="avg"&&($="avgValue / count");let D=Math.floor(a/4)*4,F=a%4,P=`
      if (${S}) {
        avgValue += dot(values, ones);
      } else {
        minMaxValue = ${E}(values, minMaxValue);
      }
    `;this.userCode=`
      const ivec3 strides =
        ivec3(${i}, ${p}, ${c});
      const ivec3 pads = ivec3(${h}, ${x}, ${b});
      const float initializationValue = ${w};
      const vec4 ones = vec4(1.0, 1.0, 1.0, 1.0);

      float count = 0.0;

      float getValue(int batch, int xD, int xR, int xC, int ch) {
        if (xC < 0 || xC >= ${t.inWidth}) {
          return initializationValue;
        }
        count += 1.0;
        return getX(batch, xD, xR, xC, ch);
      }

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 xCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
        int xDCorner = xCorner.x;
        int xRCorner = xCorner.y;
        int xCCorner = xCorner.z;

        // max/min x(?, ?, ?, d) to get y(yD, yR, yC, ch).
        // ? = to be determined
        vec4 minMaxValue = vec4(${w});
        float avgValue = 0.0;
        count = 0.0;

        for (int wD = 0; wD < ${f};
            wD += ${l}) {
          int xD = xDCorner + wD;

          if (xD < 0 || xD >= ${t.inDepth}) {
            continue;
          }

          for (int wR = 0; wR < ${d};
            wR += ${u}) {
            int xR = xRCorner + wR;

            if (xR < 0 || xR >= ${t.inHeight}) {
              continue;
            }

            for (int wC = 0; wC < ${D}; wC += 4) {
              int xC = xCCorner + wC * ${m};

              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + ${m}, ch),
                getValue(batch, xD, xR, xC + 2 * ${m}, ch),
                getValue(batch, xD, xR, xC + 3 * ${m}, ch)
              );

              ${P}
            }

            int xC = xCCorner + ${D};
            if (${F===1}) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                initializationValue,
                initializationValue,
                initializationValue
              );

              ${P}
            } else if (${F===2}) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + ${m}, ch),
                initializationValue,
                initializationValue
              );

              ${P}
            } else if (${F===3}) {
              vec4 values = vec4(
                getValue(batch, xD, xR, xC, ch),
                getValue(batch, xD, xR, xC + ${m}, ch),
                getValue(batch, xD, xR, xC + 2 * ${m}, ch),
                initializationValue
              );

              ${P}
            }
          }
          setOutput(${$});
        }
      }
    `}};function kz(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t;nn(n,"avgPool");let{filterSize:s,strides:a,pad:i,dimRoundingMode:p}=o,c=1;y.assert(I.eitherStridesOrDilationsAreOne(a,c),()=>`Error in avgPool: Either strides or dilations must be 1. Got strides ${a} and dilations '${c}'`);let l=I.computePool2DInfo(n.shape,s,a,c,i,p);if(l.filterWidth===1&&l.filterHeight===1&&y.arraysEqual(l.inShape,l.outShape))return oe({inputs:{x:n},backend:e});let u=new to(l,"avg",!1);return e.runWebGLProgram(u,[n],"float32")}var Wk={kernelName:fn,backendName:"webgl",kernelFunc:kz};function Ez(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{filterSize:s,strides:a,pad:i,dimRoundingMode:p,dataFormat:c}=o,l=[1,1,1],u=I.computePool3DInfo(n.shape,s,a,l,i,p,c),m=new fa(u,"avg",!1);return e.runWebGLProgram(m,[n],"float32")}var Uk={kernelName:dn,backendName:"webgl",kernelFunc:Ez};var cf=class{constructor(t){this.variableNames=["dy"],this.outputShape=t.inShape;let e=t.filterHeight,o=t.filterWidth,n=t.strideHeight,s=t.strideWidth,a=t.dilationHeight,i=t.dilationWidth,p=t.effectiveFilterHeight,c=t.effectiveFilterWidth,l=p-1-t.padInfo.top,u=c-1-t.padInfo.left,m=1/(e*o);this.userCode=`
      const ivec2 pads = ivec2(${l}, ${u});
      const float avgMultiplier = float(${m});

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];

        ivec2 dyRCCorner = coords.yz - pads;
        int dyRCorner = dyRCCorner.x;
        int dyCCorner = dyRCCorner.y;

        // Convolve dy(?, ?, d) with pos mask(:, :, d) to get dx(xR, xC, d).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${p};
            wR += ${a}) {
          float dyR = float(dyRCorner + wR) / ${n}.0;

          if (dyR < 0.0 || dyR >= ${t.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          for (int wC = 0; wC < ${c};
            wC+= ${i}) {
            float dyC = float(dyCCorner + wC) / ${s}.0;

            if (dyC < 0.0 || dyC >= ${t.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            float dyValue = getDy(b, idyR, idyC, d);

            dotProd += dyValue * avgMultiplier;
          }
        }
        setOutput(dotProd);
      }
    `}},lf=class{constructor(t){this.variableNames=["dy"],this.outputShape=t.inShape;let e=t.filterDepth,o=t.filterHeight,n=t.filterWidth,s=t.strideDepth,a=t.strideHeight,i=t.strideWidth,p=t.dilationDepth,c=t.dilationHeight,l=t.dilationWidth,u=t.effectiveFilterDepth,m=t.effectiveFilterHeight,f=t.effectiveFilterWidth,d=u-1-t.padInfo.front,g=m-1-t.padInfo.top,h=f-1-t.padInfo.left,x=1/(e*o*n);this.userCode=`
      const ivec3 pads = ivec3(${d}, ${g}, ${h});
      const float avgMultiplier = float(${x});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyDCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        // Convolve dy(?, ?, ?, d) with pos mask(:, :, :, ch) to get
        // dx(xD, xR, xC, ch).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int wD = 0; wD < ${u};
            wD += ${p}) {
          float dyD = float(dyDCorner + wD) / ${s}.0;

          if (dyD < 0.0 || dyD >= ${t.outDepth}.0 || fract(dyD) > 0.0) {
            continue;
          }
          int idyD = int(dyD);

          for (int wR = 0; wR < ${m};
              wR += ${c}) {
            float dyR = float(dyRCorner + wR) / ${a}.0;

            if (dyR < 0.0 || dyR >= ${t.outHeight}.0 ||
                fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            for (int wC = 0; wC < ${f};
                wC += ${l}) {
              float dyC = float(dyCCorner + wC) / ${i}.0;

              if (dyC < 0.0 || dyC >= ${t.outWidth}.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              float dyValue = getDy(batch, idyD, idyR, idyC, ch);

              dotProd += dyValue * avgMultiplier;
            }
          }
        }
        setOutput(dotProd);
      }
    `}};function $z(r){let{inputs:t,backend:e,attrs:o}=r,{dy:n,input:s}=t,a=s,{filterSize:i,strides:p,pad:c,dimRoundingMode:l}=o,u=[1,1,1],m=I.computePool3DInfo(a.shape,i,p,u,c,l),f=new lf(m);return e.runWebGLProgram(f,[n],a.dtype)}var Hk={kernelName:ya,backendName:"webgl",kernelFunc:$z};function Az(r){let{inputs:t,backend:e,attrs:o}=r,{dy:n,input:s}=t,a=s;nn([n,s],"avgPoolGrad");let{filterSize:i,strides:p,pad:c}=o,l=I.computePool2DInfo(a.shape,i,p,1,c),u=new cf(l);return e.runWebGLProgram(u,[n],a.dtype)}var qk={kernelName:xa,backendName:"webgl",kernelFunc:Az};function Dz(r){let{inputs:t,backend:e,attrs:o}=r,{a:n,b:s}=t,{transposeA:a,transposeB:i}=o;return hp({a:n,b:s,transposeA:a,transposeB:i,backend:e})}var Kk={kernelName:hn,backendName:"webgl",kernelFunc:Dz};var uf=class{constructor(t,e,o,n,s,a){this.outputShape=[],this.variableNames=["x","mean","variance"],I.assertAndGetBroadcastShape(t,e),I.assertAndGetBroadcastShape(t,o);let i="0.0";n!=null&&(I.assertAndGetBroadcastShape(t,n),this.variableNames.push("offset"),i="getOffsetAtOutCoords()");let p="1.0";s!=null&&(I.assertAndGetBroadcastShape(t,s),this.variableNames.push("scale"),p="getScaleAtOutCoords()"),this.outputShape=t,this.userCode=`
      void main() {
        float x = getXAtOutCoords();
        float mean = getMeanAtOutCoords();
        float variance = getVarianceAtOutCoords();
        float offset = ${i};
        float scale = ${p};
        float inv = scale * inversesqrt(variance + float(${a}));
        setOutput(dot(vec3(x, -mean, offset), vec3(inv, inv, 1)));
      }
    `}};var mf=class{constructor(t,e,o,n,s,a){this.packedInputs=!0,this.packedOutput=!0,this.variableNames=["x","mean","variance"],I.assertAndGetBroadcastShape(t,e),I.assertAndGetBroadcastShape(t,o);let i="vec4(0.0)";n!=null&&(I.assertAndGetBroadcastShape(t,n),this.variableNames.push("offset"),i="getOffsetAtOutCoords()");let p="vec4(1.0)";s!=null&&(I.assertAndGetBroadcastShape(t,s),this.variableNames.push("scale"),p="getScaleAtOutCoords()"),this.outputShape=t,this.userCode=`
      void main() {
        vec4 offset = ${i};
        vec4 scale = ${p};

        vec4 x = getXAtOutCoords();
        vec4 mean = getMeanAtOutCoords();
        vec4 variance = getVarianceAtOutCoords();

        vec4 inv = scale * inversesqrt(variance + vec4(${a}));

        setOutput((x - mean) * inv + offset);
      }
    `}};var Rz=({inputs:r,backend:t,attrs:e})=>{let{x:o,mean:n,variance:s,offset:a,scale:i}=r;y.assert(n.shape.length===s.shape.length,()=>"Batch normalization gradient requires mean and variance to have equal ranks."),y.assert(a==null||n.shape.length===a.shape.length,()=>"Batch normalization gradient requires mean and offset to have equal ranks."),y.assert(i==null||n.shape.length===i.shape.length,()=>"Batch normalization gradient requires mean and scale to have equal ranks.");let{varianceEpsilon:p}=e;p==null&&(p=.001);let c=[o,n,s],l=null;a!=null&&(l=a.shape,c.push(a));let u=null;i!=null&&(u=i.shape,c.push(i));let m=_().getBool("WEBGL_PACK_NORMALIZATION")?new mf(o.shape,n.shape,s.shape,l,u,p):new uf(o.shape,n.shape,s.shape,l,u,p);return t.runWebGLProgram(m,c,c[0].dtype)},Xk={kernelName:kn,backendName:"webgl",kernelFunc:Rz};var ff=class{constructor(t){this.variableNames=["source"],this.outputShape=t,this.rank=t.length;let e=wt(this.rank);this.customUniforms=[{name:"start",arrayIndex:this.rank,type:"int"}];let o=Fz(this.rank),n,s=t.map((a,i)=>`sourceLoc.${gy[i]} = start[${i}] + coords.${gy[i]};`);n=`
        ${e} sourceLoc;
        ${e} coords = getOutputCoords();
        ${s.join(`
`)}
      `,this.userCode=`
      void main() {
        ${n}
        setOutput(getSource(${o}));
      }
    `}},gy=["x","y","z","w","u","v"];function Fz(r){if(r===1)return"sourceLoc";if(r<=6)return gy.slice(0,r).map(t=>"sourceLoc."+t).join(",");throw Error(`Slicing for rank ${r} is not yet supported`)}var df=class{constructor(t){this.variableNames=["source"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=t,this.rank=t.length,this.customUniforms=[{name:"start",arrayIndex:this.rank,type:"int"}];let e=wt(this.rank),o=re("coords",this.rank),n=re("sourceLoc",this.rank),s=this.rank===1?"sourceLoc":`vec2(${n.slice(-2).join()})`,a=`getChannel(getSource(${n.join()}), ${s})`,i=`
      result.x = ${a};
      if (++${o[this.rank-1]} < ${t[this.rank-1]}) {
        ++${n[this.rank-1]};
        result.y = ${a};
        --${n[this.rank-1]};
      }
    `,p=this.rank===1?"":`
      --${o[this.rank-1]};
      if (++${o[this.rank-2]} < ${t[this.rank-2]}) {
        ++${n[this.rank-2]};
        result.z = ${a};
        if (++${o[this.rank-1]} < ${t[this.rank-1]}) {
          ++${n[this.rank-1]};
          result.w = ${a};
        }
      }
    `,c=this.rank<=4?`sourceLoc = coords +
            ${e}(${t.map((l,u)=>`start[${u}]`).join()});`:t.map((l,u)=>`${n[u]} = ${o[u]} + start[${u}];`).join(`
`);this.userCode=`
      void main() {
        ${e} coords = getOutputCoords();
        ${e} sourceLoc;
        ${c}
        vec4 result = vec4(0.);
        ${i}
        ${p}
        setOutput(result);
      }
    `}};function _z(r,t,e,o){let n=o.texData.get(r.dataId),s=o.makeTensorInfo(e,r.dtype),a=o.texData.get(s.dataId);Object.assign(a,n),a.refCount=1,a.shape=e,a.dtype=r.dtype;let i=de.computeFlatOffset(t,y.computeStrides(r.shape));n.slice&&(i+=n.slice.flatOffset),a.slice={flatOffset:i,origDataId:n.slice&&n.slice.origDataId||r.dataId};let p=o.dataRefCount.get(a.slice.origDataId)||1;return o.dataRefCount.set(a.slice.origDataId,p+1),s}function eo(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{begin:s,size:a}=o,[i,p]=de.parseSliceParams(n,s,a);if(de.assertParamsValid(n,i,p),y.sizeFromShape(p)===0)return e.makeTensorInfo(p,n.dtype,[]);if(e.shouldExecuteOnCPU([n])||n.dtype==="string"){let u=e.texData.get(n.dataId),m=G1(u.values,i,p,n.shape,n.dtype);return e.makeTensorInfo(p,n.dtype,m)}let{isPacked:c}=e.texData.get(n.dataId),l=de.isSliceContinous(n.shape,i,p);if(c||!l){let u=_().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new df(p):new ff(p),m=[i];return e.runWebGLProgram(u,[n],n.dtype,m)}return e.uploadToGPU(n.dataId),_z(n,i,p,e)}var jk={kernelName:Hn,backendName:"webgl",kernelFunc:eo};var Oz=r=>{let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{blockShape:s,crops:a}=o;y.assert(n.shape.length<=4,()=>"batchToSpaceND for rank > 4 with a WebGL backend not implemented yet");let i=s.reduce((b,S)=>b*S),p=I.getReshaped(n.shape,s,i),c=I.getPermuted(p.length,s.length),l=I.getReshapedPermuted(n.shape,s,i),u=I.getSliceBeginCoords(a,s.length),m=I.getSliceSize(l,a,s.length),f=[],d=j({inputs:{x:n},backend:e,attrs:{shape:p}}),g=Ht({inputs:{x:d},backend:e,attrs:{perm:c}}),h=j({inputs:{x:g},backend:e,attrs:{shape:l}}),x=eo({inputs:{x:h},backend:e,attrs:{begin:u,size:m}});return f.push(d),f.push(g),f.push(h),f.forEach(b=>e.disposeIntermediateTensorInfo(b)),x},Yk={kernelName:gn,backendName:"webgl",kernelFunc:Oz};function Pz(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,weights:s}=t,{size:a}=o,i=e.readSync(n.dataId),p=e.readSync(s.dataId),c=qm(i,p,s.dtype,s.shape,a);return e.makeTensorInfo([a],s.dtype,c)}var Zk={kernelName:ba,backendName:"webgl",kernelFunc:Pz};function Lz(r){let{inputs:t,backend:e}=r,{s0:o,s1:n}=t,s=e.readSync(o.dataId),a=e.readSync(n.dataId),i=I.assertAndGetBroadcastShape(Array.from(s),Array.from(a));return e.makeTensorInfo([i.length],"int32",Int32Array.from(i))}var Qk={kernelName:Ca,backendName:"webgl",kernelFunc:Lz};var Mz="return float(a != b);",xy=Ot({opSnippet:Mz,cpuKernelImpl:R1,dtype:"bool"}),Jk={kernelName:Gs,backendName:"webgl",kernelFunc:xy};function Cs(r){let{inputs:t,backend:e}=r,{input:o}=t,n=e.texData.get(o.dataId);return oe({inputs:{x:n.complexTensorInfos.real},backend:e})}var tE={kernelName:ei,backendName:"webgl",kernelFunc:Cs};var Bz="return float(int(x));";function eE(r,t){let e=new Le(r.shape,Bz),o=t.runWebGLProgram(e,[r],"int32");return{dataId:o.dataId,shape:o.shape,dtype:o.dtype}}function yy(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{dtype:s}=o;if(s==="complex64"){if(n.dtype==="complex64")return oe({inputs:{x:n},backend:e});let a=_e(n.shape),i=yy({inputs:{x:n},backend:e,attrs:{dtype:"float32"}}),p=Ze({inputs:{real:i,imag:a},backend:e});return a.dispose(),e.disposeIntermediateTensorInfo(i),p}if(n.dtype==="complex64"){let a=Cs({inputs:{input:n},backend:e}),i=yy({inputs:{x:a},backend:e,attrs:{dtype:s}});return e.disposeIntermediateTensorInfo(a),i}if(!y.hasEncodingLoss(n.dtype,s)){let a=oe({inputs:{x:n},backend:e});return{dataId:a.dataId,shape:a.shape,dtype:s}}if(e.shouldExecuteOnCPU([n])){let a=e.texData.get(n.dataId).values,[i,p,c]=m1(a,n.shape,n.dtype,s);return e.makeTensorInfo(i,p,c)}if(s==="int32")return eE(n,e);if(s==="bool"){let a=e.makeTensorInfo([],"bool",y.getTypedArrayFromDType("bool",1)),p=xy({inputs:{a:n,b:a},backend:e});return e.disposeIntermediateTensorInfo(a),p}throw new Error(`Error in Cast: failed to cast ${n.dtype} to ${s}`)}var rE={kernelName:Vr,backendName:"webgl",kernelFunc:yy};var oE="return ceil(x);",Gz=lt({opSnippet:oE,packedOpSnippet:oE,cpuKernelImpl:f1}),nE={kernelName:ho,backendName:"webgl",kernelFunc:Gz};var hf=class{constructor(t){this.variableNames=["A"],this.customUniforms=[{name:"minVal",type:"float"},{name:"maxVal",type:"float"}],this.outputShape=t,this.userCode=`

      void main() {
        float value = getAAtOutCoords();
        if (isnan(value)) {
          setOutput(value);
          return;
        }

        setOutput(clamp(value, minVal, maxVal));
      }
    `}};var gf=class{constructor(t){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"minVal",type:"float"},{name:"maxVal",type:"float"}],this.outputShape=t,this.userCode=`
      void main() {
        vec4 value = getAAtOutCoords();

        if (any(isnan(value))) {
          setOutput(value);
          return;
        }

        setOutput(clamp(value, vec4(minVal), vec4(maxVal)));
      }
    `}};function Vz(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{clipValueMin:s,clipValueMax:a}=o,i;_().getBool("WEBGL_PACK_CLIP")?i=new gf(n.shape):i=new hf(n.shape);let p=[[s],[a]];return e.runWebGLProgram(i,[n],n.dtype,p)}var sE={kernelName:go,backendName:"webgl",kernelFunc:Vz};var xf=class{constructor(t){this.variableNames=["real","imag"],this.outputShape=t,this.userCode=`
      void main() {
        float re = abs(getRealAtOutCoords());
        float im = abs(getImagAtOutCoords());
        float mx = max(re, im);

        // sadly the length function in glsl is not underflow-safe
        // (at least not on Intel GPUs). So the safe solution is
        // to ensure underflow-safety in all cases.
        setOutput(
          mx == 0.0 ? 0.0 : mx * length(vec2(1, min(re, im)/mx))
        );
      }
    `}};function aE(r,t){return{dataId:t.dataId,dtype:t.dtype,shape:r.shape}}function zz(r){let{inputs:t,backend:e}=r,{x:o}=t,n=e.texData.get(o.dataId),s=new xf(o.shape),a=[aE(o,n.complexTensorInfos.real),aE(o,n.complexTensorInfos.imag)];return e.runWebGLProgram(s,a,a[0].dtype)}var iE={kernelName:xn,backendName:"webgl",kernelFunc:zz};var yf=class{constructor(t){this.outputShape=[],this.outputShape=I.computeOutShape(t,1),this.variableNames=t.map((a,i)=>`T${i}`);let e=new Array(t.length-1);e[0]=t[0][1];for(let a=1;a<e.length;a++)e[a]=e[a-1]+t[a][1];let o=[`if (yC < ${e[0]}) setOutput(getT0(yR, yC));`];for(let a=1;a<e.length;a++){let i=e[a-1];o.push(`else if (yC < ${e[a]}) setOutput(getT${a}(yR, yC-${i}));`)}let n=e.length,s=e[e.length-1];o.push(`else setOutput(getT${n}(yR, yC-${s}));`),this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int yR = coords.x;
        int yC = coords.y;

        ${o.join(`
        `)}
      }
    `}};var Cf=class{constructor(t,e){this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[],this.outputShape=I.computeOutShape(t,e);let o=this.outputShape,n=o.length,s=wt(n),a=re("coords",n),i=["x","y","z","w","u","v"].slice(0,n);this.variableNames=t.map((g,h)=>`T${h}`);let p=new Array(t.length-1);p[0]=t[0][e];for(let g=1;g<p.length;g++)p[g]=p[g-1]+t[g][e];let c=i[e],l=i.slice(-2),u=i.join(),m=`if (${c} < ${p[0]}) {
        return getChannel(
            getT0(${u}), vec2(${l.join()}));
        }`;for(let g=1;g<p.length;g++){let h=p[g-1];m+=`
        if (${c} < ${p[g]}  && ${c} >= ${p[g-1]}) {
          return getChannel(
            getT${g}(${bf(i,c,h)}),
            vec2(${bf(l,c,h)}));
        }`}let f=p.length,d=p[p.length-1];m+=`
        return getChannel(
          getT${f}(${bf(i,c,d)}),
          vec2(${bf(l,c,d)}));`,this.userCode=`
      float getValue(${i.map(g=>"int "+g)}) {
        ${m}
      }

      void main() {
        ${s} coords = getOutputCoords();
        vec4 result = vec4(getValue(${a}), 0., 0., 0.);

        ${a[n-1]} = ${a[n-1]} + 1;
        if (${a[n-1]} < ${o[n-1]}) {
          result.g = getValue(${a});
        }

        ${a[n-2]} = ${a[n-2]} + 1;
        if (${a[n-2]} < ${o[n-2]}) {
          result.a = getValue(${a});
        }

        ${a[n-1]} = ${a[n-1]} - 1;
        if (${a[n-2]} < ${o[n-2]} &&
            ${a[n-1]} < ${o[n-1]}) {
          result.b = getValue(${a});
        }
        setOutput(result);
      }
    `}};function bf(r,t,e){let o=r.indexOf(t);return r.map((s,a)=>a===o?`${s} - ${e}`:s).join()}function gp(r){let{inputs:t,backend:e}=r,{input:o}=t,n=e.texData.get(o.dataId);return oe({inputs:{x:n.complexTensorInfos.imag},backend:e})}var pE={kernelName:Ma,backendName:"webgl",kernelFunc:gp};function fc(r,t,e){let o=r[0].dtype;if(o==="complex64"){let u=r.map(h=>Cs({inputs:{input:h},backend:e})),m=r.map(h=>gp({inputs:{input:h},backend:e})),f=fc(u,t,e),d=fc(m,t,e),g=Ze({inputs:{real:f,imag:d},backend:e});return u.forEach(h=>e.disposeIntermediateTensorInfo(h)),m.forEach(h=>e.disposeIntermediateTensorInfo(h)),e.disposeIntermediateTensorInfo(f),e.disposeIntermediateTensorInfo(d),g}let n=e.shouldExecuteOnCPU(r);if(o==="string"&&(n=!0),n){let u=r.map(b=>{let w=[-1,y.sizeFromShape(b.shape.slice(t))];return j({inputs:{x:b},backend:e,attrs:{shape:w}})}),m=u.map(b=>({vals:e.readSync(b.dataId),shape:b.shape})),f=I.computeOutShape(u.map(b=>b.shape),1),d=u[0].shape[0]===1,g=d1(m,f,o,d),h=I.computeOutShape(r.map(b=>b.shape),t),x=e.makeTensorInfo(h,o,g);return u.forEach(b=>e.disposeIntermediateTensorInfo(b)),x}let s=_().getNumber("WEBGL_MAX_TEXTURES_IN_SHADER");if(r.length>s){let u=[];for(let f=0;f<r.length;f+=s){let d=r.slice(f,f+s);u.push(fc(d,t,e))}let m=fc(u,t,e);for(let f of u)e.disposeIntermediateTensorInfo(f);return m}if(_().getBool("WEBGL_PACK_ARRAY_OPERATIONS")&&r[0].shape.length>1){let u=new Cf(r.map(m=>m.shape),t);return e.runWebGLProgram(u,r,o)}let{tensors2D:a,outShape:i}=Wz(r,t,e),p=new yf(a.map(u=>u.shape)),c=e.runWebGLProgram(p,a,o);a.forEach(u=>e.disposeIntermediateTensorInfo(u));let l=j({inputs:{x:c},attrs:{shape:i},backend:e});return e.disposeIntermediateTensorInfo(c),l}function Wz(r,t,e){let o=I.computeOutShape(r.map(s=>s.shape),t);return{tensors2D:r.map(s=>j({inputs:{x:s},attrs:{shape:[-1,y.sizeFromShape(s.shape.slice(t))]},backend:e})),outShape:o}}function by(r){let{inputs:t,backend:e,attrs:o}=r,{axis:n}=o,s=y.parseAxisParam(n,t[0].shape)[0],a=t.map(c=>c.shape);I.assertParamsConsistent(a,s);let i=I.computeOutShape(t.map(c=>c.shape),s);if(y.sizeFromShape(i)===0)return e.makeTensorInfo(i,t[0].dtype,[]);let p=t.filter(c=>y.sizeFromShape(c.shape)>0);return p.length===1?oe({inputs:{x:p[0]},backend:e}):fc(p,s,e)}var cE={kernelName:yn,backendName:"webgl",kernelFunc:by};var dc=class{constructor(t,e=!1,o=null,n=!1,s=!1){this.variableNames=["x","W"],this.outputShape=t.outShape;let a=t.padInfo.top,i=t.padInfo.left,p=t.strideHeight,c=t.strideWidth,l=t.dilationHeight,u=t.dilationWidth,m=t.filterHeight,f=t.filterWidth,d=Math.floor(t.inChannels/4)*4,g=t.inChannels%4,h=t.dataFormat==="channelsLast",x=h?1:2,b=h?2:3,S=h?3:1,w="",E="";o&&(n?w=`float activation(float a) {
          float b = getPreluActivationWeightsAtOutCoords();
          ${o}
        }`:s?w=`float activation(float a) {
          float b = getLeakyreluAlphaAtOutCoords();
          ${o}
        }`:w=`
          float activation(float x) {
            ${o}
          }
        `,E="result = activation(result);");let $=e?"result += getBiasAtOutCoords();":"";e&&this.variableNames.push("bias"),n&&this.variableNames.push("preluActivationWeights"),s&&this.variableNames.push("leakyreluAlpha"),this.userCode=`
      ${w}

      const ivec2 strides = ivec2(${p}, ${c});
      const ivec2 pads = ivec2(${a}, ${i});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d2 = coords[${S}];

        ivec2 xRCCorner =
            ivec2(coords[${x}], coords[${b}]) * strides - pads;
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // Convolve x(?, ?, d1) with w(:, :, d1, d2) to get y(yR, yC, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${m}; wR++) {
          int xR = xRCorner + wR * ${l};

          if (xR < 0 || xR >= ${t.inHeight}) {
            continue;
          }

          for (int wC = 0; wC < ${f}; wC++) {
            int xC = xCCorner + wC * ${u};

            if (xC < 0 || xC >= ${t.inWidth}) {
              continue;
            }

            for (int d1 = 0; d1 < ${d}; d1 += 4) {
              vec4 wValues = vec4(
                getW(wR, wC, d1, d2),
                getW(wR, wC, d1 + 1, d2),
                getW(wR, wC, d1 + 2, d2),
                getW(wR, wC, d1 + 3, d2)
              );

              if (${h}) {
                vec4 xValues = vec4(
                  getX(batch, xR, xC, d1),
                  getX(batch, xR, xC, d1 + 1),
                  getX(batch, xR, xC, d1 + 2),
                  getX(batch, xR, xC, d1 + 3)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec4 xValues = vec4(
                  getX(batch, d1, xR, xC),
                  getX(batch, d1 + 1, xR, xC),
                  getX(batch, d1 + 2, xR, xC),
                  getX(batch, d1 + 3, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }
            }

            if (${g===1}) {

              if (${h}) {
                dotProd +=
                    getX(batch, xR, xC, ${d}) *
                    getW(wR, wC, ${d}, d2);
              } else {
                dotProd +=
                    getX(batch, ${d}, xR, xC) *
                    getW(wR, wC, ${d}, d2);
              }

            } else if (${g===2}) {
              vec2 wValues = vec2(
                getW(wR, wC, ${d}, d2),
                getW(wR, wC, ${d} + 1, d2)
              );

              if (${h}) {
                vec2 xValues = vec2(
                  getX(batch, xR, xC, ${d}),
                  getX(batch, xR, xC, ${d} + 1)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec2 xValues = vec2(
                  getX(batch, ${d}, xR, xC),
                  getX(batch, ${d} + 1, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }

            } else if (${g===3}) {
              vec3 wValues = vec3(
                getW(wR, wC, ${d}, d2),
                getW(wR, wC, ${d} + 1, d2),
                getW(wR, wC, ${d} + 2, d2)
              );

              if (${h}) {
                vec3 xValues = vec3(
                  getX(batch, xR, xC, ${d}),
                  getX(batch, xR, xC, ${d} + 1),
                  getX(batch, xR, xC, ${d} + 2)
                );
                dotProd += dot(xValues, wValues);
              } else {
                vec3 xValues = vec3(
                  getX(batch, ${d}, xR, xC),
                  getX(batch, ${d} + 1, xR, xC),
                  getX(batch, ${d} + 2, xR, xC)
                );
                dotProd += dot(xValues, wValues);
              }

            }
          }
        }

        float result = dotProd;
        ${$}
        ${E}
        setOutput(result);
      }
    `}},Tf=class{constructor(t){this.variableNames=["x","W"],this.outputShape=t.outShape;let e=t.padInfo.front,o=t.padInfo.top,n=t.padInfo.left,s=t.strideDepth,a=t.strideHeight,i=t.strideWidth,p=t.dilationDepth,c=t.dilationHeight,l=t.dilationWidth,u=t.filterDepth,m=t.filterHeight,f=t.filterWidth,d=Math.floor(t.inChannels/4)*4,g=t.inChannels%4;this.userCode=`
      const ivec3 strides = ivec3(${s}, ${a}, ${i});
      const ivec3 pads = ivec3(${e}, ${o}, ${n});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int d2 = coords.u;

        ivec3 xFRCCorner = ivec3(coords.y, coords.z, coords.w) * strides - pads;
        int xFCorner = xFRCCorner.x;
        int xRCorner = xFRCCorner.y;
        int xCCorner = xFRCCorner.z;

        // Convolve x(?, ?, ?, d1) with w(:, :, :, d1, d2) to get
        // y(yF, yR, yC, d2). ? = to be determined. : = across all
        // values in that axis.
        float dotProd = 0.0;
        for (int wF = 0; wF < ${u}; wF++) {
          int xF = xFCorner + wF * ${p};

          if (xF < 0 || xF >= ${t.inDepth}) {
            continue;
          }

          for (int wR = 0; wR < ${m}; wR++) {
            int xR = xRCorner + wR * ${c};

            if (xR < 0 || xR >= ${t.inHeight}) {
              continue;
            }

            for (int wC = 0; wC < ${f}; wC++) {
              int xC = xCCorner + wC * ${l};

              if (xC < 0 || xC >= ${t.inWidth}) {
                continue;
              }

              for (int d1 = 0; d1 < ${d}; d1 += 4) {
                vec4 xValues = vec4(
                  getX(batch, xF, xR, xC, d1),
                  getX(batch, xF, xR, xC, d1 + 1),
                  getX(batch, xF, xR, xC, d1 + 2),
                  getX(batch, xF, xR, xC, d1 + 3)
                );
                vec4 wValues = vec4(
                  getW(wF, wR, wC, d1, d2),
                  getW(wF, wR, wC, d1 + 1, d2),
                  getW(wF, wR, wC, d1 + 2, d2),
                  getW(wF, wR, wC, d1 + 3, d2)
                );

                dotProd += dot(xValues, wValues);
              }

              if (${g===1}) {
                dotProd +=
                  getX(batch, xF, xR, xC, ${d}) *
                  getW(wF, wR, wC, ${d}, d2);
              } else if (${g===2}) {
                vec2 xValues = vec2(
                  getX(batch, xF, xR, xC, ${d}),
                  getX(batch, xF, xR, xC, ${d} + 1)
                );
                vec2 wValues = vec2(
                  getW(wF, wR, wC, ${d}, d2),
                  getW(wF, wR, wC, ${d} + 1, d2)
                );
                dotProd += dot(xValues, wValues);
              } else if (${g===3}) {
                vec3 xValues = vec3(
                  getX(batch, xF, xR, xC, ${d}),
                  getX(batch, xF, xR, xC, ${d} + 1),
                  getX(batch, xF, xR, xC, ${d} + 2)
                );
                vec3 wValues = vec3(
                  getW(wF, wR, wC, ${d}, d2),
                  getW(wF, wR, wC, ${d} + 1, d2),
                  getW(wF, wR, wC, ${d} + 2, d2)
                );
                dotProd += dot(xValues, wValues);
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `}};var hc=class{constructor(t,e=!1,o=null,n=!1,s=!1){this.variableNames=["x","W"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"pads",type:"ivec2"},{name:"strides",type:"ivec2"},{name:"dilations",type:"ivec2"},{name:"inDims",type:"ivec2"}],this.outputShape=t.outShape,this.enableShapeUniforms=Bt(this.outputShape.length);let a=t.padInfo.left,i=t.strideWidth,p=t.dilationWidth,c=t.filterHeight,l=t.filterWidth,u=l,m=`
       int xR; int xC; int xCOffset;
       vec4 wTexel; vec4 previous; vec4 final;`;for(let h=0;h<l;h++)m+=`
           vec4 xTexelC${h*2};
           int xTexelC${h*2}Ready;
           vec4 xTexelC${h*2+1};
           int xTexelC${h*2+1}Ready;
           vec4 xC${h};`;m+=`
     for (int r = 0; r < ${c}; r++) {
      for (int d1 = 0; d1 < ${t.inChannels}; d1 += 2) {
       `;for(let h=0;h<l;h++)m+=`
           xTexelC${h*2} = vec4(0.0);
           xTexelC${h*2}Ready = 0;
           xTexelC${h*2+1} = vec4(0.0);
           xTexelC${h*2+1}Ready = 0;
           xC${h} = vec4(0.0);`;m+=`
         xR = xRCorner + r * dilations[0];
         if (xR >=0 && xR < inDims[0]) {
       `;for(let h=0;h<(u+1)/2;h++){let x=h*2;if(m+=`
           xC = xCCorner + ${x*p};
           `,i===1){if(x<l&&(a%2===1?(m+=`
                 xCOffset = xC + 1;
                 if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${x}Ready == 0) {
                   xTexelC${x} = getX(batch, xR, xCOffset, d1);

                   // Need to manually clear unused channels in case
                   // we're reading from recycled texture.
                   if (xCOffset + 1 >= inDims[1]) {
                     xTexelC${x}.zw = vec2(0.0);
                   }
                   xTexelC${x}Ready = 1;
                 }
               `,p===1&&x>0?m+=`
                 xC${x} = vec4(xTexelC${x-2}.zw, xTexelC${x}.xy);
                 `:m+=`
                   xCOffset = xC + 1 - 2;

                   if (xCOffset >= 0 && xCOffset < inDims[1]) {
                     previous = getX(batch, xR, xCOffset, d1);

                     // Need to manually clear unused channels in case
                     // we're reading from recycled texture.
                     if (xCOffset + 1 >= inDims[1]) {
                       previous.zw = vec2(0.0);
                     }

                     xC${x} = vec4(previous.zw, xTexelC${x}.xy);
                   } else {
                     xC${x} = vec4(0.0, 0.0, xTexelC${x}.xy);
                   }
                   `):m+=`
                 if (xC >= 0 && xC < inDims[1] && xTexelC${x}Ready == 0) {
                   xTexelC${x} = getX(batch, xR, xC, d1);
                   if (xC + 1 >= inDims[1]) {
                     xTexelC${x}.zw = vec2(0.0);
                   }
                   xTexelC${x}Ready = 1;
                 }

                 xC${x} = xTexelC${x};
                 `,x+1<l)){let b=a%2===0?y.nearestLargerEven(p):p;p%2===0&&a%2===1||p%2!==0&&a%2!==1?(m+=`
                   xCOffset = xC + imod(pads[1], 2) + ${b};

                   if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${x+1}Ready == 0) {
                     xTexelC${x+1} = getX(batch, xR, xCOffset, d1);

                     // Need to manually clear unused channels in case
                     // we're reading from recycled texture.
                     if (xCOffset + 1 >= inDims[1]) {
                       xTexelC${x+1}.zw = vec2(0.0);
                     }
                     xTexelC${x+1}Ready = 1;
                   }
                   `,p>1?m+=`
                     xCOffset -= 2;
                     if (xCOffset >= 0 && xCOffset < inDims[1]) {
                      previous = getX(batch, xR, xCOffset, d1);
                      xC${x+1} = vec4(previous.zw, xTexelC${x+1}.xy);
                     } else {
                      xC${x+1} = vec4(0.0, 0.0, xTexelC${x+1}.xy);
                     }
                     `:m+=`
                     xC${x+1} = vec4(xTexelC${x}.zw, xTexelC${x+1}.xy);
                     `):b===1?m+=`
                     xC${x+1} = xTexelC${x};
                     `:m+=`
                     xCOffset = xC + ${b};

                     if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${x+1}Ready == 0) {
                       xTexelC${x+1} = getX(batch, xR, xCOffset, d1);
                       if (xCOffset + 1 >= inDims[1]) {
                         xTexelC${x+1}.zw = vec2(0.0);
                       }
                       xTexelC${x+1}Ready = 1;
                     }

                     xC${x+1} = xTexelC${x+1};
                     `}}else x<l&&(a%2===1?(m+=`
                 xCOffset = xC + 1 - strides[1];
                 if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${x}Ready == 0) {
                   xTexelC${x} = getX(batch, xR, xCOffset, d1);
                   // Need to manually clear unused channels in case
                   // we're reading from recycled texture.
                   if (xCOffset + 1 >= inDims[1]) {
                     xTexelC${x}.zw = vec2(0.0);
                   }
                   xTexelC${x}Ready = 1;
                 }

                 if(xC + 1 >= 0 && xC + 1 < inDims[1] && xTexelC${x+1}Ready == 0) {
                   xTexelC${x+1} = getX(batch, xR, xC + 1, d1);
                   // Need to manually clear unused channels in case
                   // we're reading from recycled texture.
                   if (xC + 2 >= inDims[1]) {
                     xTexelC${x+1}.zw = vec2(0.0);
                   }
                   xTexelC${x+1}Ready = 1;
                 }

                 xC${x} = vec4(xTexelC${x}.zw, xTexelC${x+1}.zw);
               `,x+1<l&&(m+=`
                   final = vec4(0.0);
                   xCOffset = xC + 1 + strides[1];
                   if(xCOffset >= 0 && xCOffset < inDims[1]) {
                     final = getX(batch, xR, xCOffset, d1);
                   }
                   xC${x+1} = vec4(xTexelC${x+1}.xy, final.xy);
                 `)):(m+=`
                 if(xC >= 0 && xC < inDims[1] && xTexelC${x}Ready == 0) {
                   xTexelC${x} = getX(batch, xR, xC, d1);
                   if (xC + 1 >= inDims[1]) {
                     xTexelC${x}.zw = vec2(0.0);
                   }
                   xTexelC${x}Ready = 1;
                 }

                 xCOffset = xC + strides[1];
                 if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${x+1}Ready == 0) {
                   xTexelC${x+1} = getX(batch, xR, xCOffset, d1);
                   if (xCOffset + 1 >= inDims[1]) {
                     xTexelC${x+1}.zw = vec2(0.);
                   }
                   xTexelC${x+1}Ready = 1;
                 }

                 xC${x} = vec4(
                   xTexelC${x}.xy, xTexelC${x+1}.xy);
               `,x+1<l&&(m+=`
                   xC${x+1} = vec4(xTexelC${x}.zw, xTexelC${x+1}.zw);
                 `)));x<l&&(m+=`
             wTexel = getW(r, ${x}, d1, d2);
             dotProd += xC${x}.xxzz * vec4(wTexel.xy, wTexel.xy);
             if(d1 + 1 < ${t.inChannels}) {
               dotProd += xC${x}.yyww * vec4(wTexel.zw, wTexel.zw);
             }
           `,x+1<l&&(m+=`
               wTexel = getW(r, ${x+1}, d1, d2);
               dotProd += xC${x+1}.xxzz * vec4(wTexel.xy, wTexel.xy);
               if(d1 + 1 < ${t.inChannels}) {
                 dotProd += xC${x+1}.yyww * vec4(wTexel.zw, wTexel.zw);
               }
             `))}m+=`
     }
   `,m+=`
     }
   `,m+=`
     }
   `;let f="",d="";o&&(n?f=`vec4 activation(vec4 a) {
           vec4 b = getPreluActivationWeightsAtOutCoords();
           ${o}
         }`:s?f=`vec4 activation(vec4 a) {
           vec4 b = getLeakyreluAlphaAtOutCoords();
           ${o}
         }`:f=`vec4 activation(vec4 x) {
           ${o}
         }`,d="result = activation(result);");let g=e?"result += getBiasAtOutCoords();":"";e&&this.variableNames.push("bias"),n&&this.variableNames.push("preluActivationWeights"),s&&this.variableNames.push("leakyreluAlpha"),this.userCode=`
       ${f}

       void main() {
         ivec4 coords = getOutputCoords();
         int batch = coords.x;
         ivec2 xRCCorner = coords.yz * strides - pads;
         int d2 = coords.w;
         int xRCorner = xRCCorner.x;
         int xCCorner = xRCCorner.y;

         //intialize dotProd with a small epsilon seems to reduce GPU accuracy loss.
         vec4 dotProd = vec4(0.000000000000001);

         ${m}

         vec4 result = dotProd - vec4(0.000000000000001);
         ${g}
         ${d}
         setOutput(result);
       }
     `}};var Sf=class{constructor(t,e){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"inputShape",type:"ivec4"},{name:"pad",type:"ivec2"},{name:"stride",type:"ivec2"},{name:"dilation",type:"ivec2"},{name:"inChannels",type:"int"},{name:"itemsPerBlockRow",type:"int"},{name:"outWidth",type:"int"}],this.outputShape=t,this.enableShapeUniforms=Bt(this.outputShape.length);let{dataFormat:o}=e,n=Yt(),s=o==="channelsLast",a=s?1:2,i=s?2:3,p=this.enableShapeUniforms?"if(blockIndex < outShape[2] && pos < outShape[1]) {":`if(blockIndex < ${t[2]} && pos < ${t[1]}) {`,c="";for(let l=0;l<=1;l++)for(let u=0;u<=1;u++)c+=`
          blockIndex = rc.z + ${u};
          pos = rc.y + ${l};

          ${p}
            offsetY = int(blockIndex / outWidth) * stride[0] - pad[0];
            d0 = offsetY + dilation[0] * (pos / itemsPerBlockRow);

            if(d0 < inputShape[${a}] && d0 >= 0) {
              // Use custom imod instead mod. On Intel GPU, mod may generate
              // unexpected value.
              // https://github.com/tensorflow/tfjs/issues/5447
              offsetX = imod(blockIndex, outWidth) * stride[1] - pad[1];
              d1 = offsetX + dilation[1] * (imod(pos, itemsPerBlockRow) /
                  inChannels);

              if(d1 < inputShape[${i}] && d1 >= 0) {

                ch = imod(pos, inChannels);

                if (${s}) {
                  innerDims = vec2(d1, ch);
                  result[${l*2+u}] = getChannel(
                    getA(rc.x, d0, int(innerDims.x),
                    int(innerDims.y)), innerDims);
                } else {
                  innerDims = vec2(d0, d1);
                  result[${l*2+u}] = getChannel(
                    getA(rc.x, ch, int(innerDims.x),
                    int(innerDims.y)), innerDims);
                }
              }
            }
          }
        `;this.userCode=`
      void main() {
        ivec3 rc = getOutputCoords();

        vec4 result = vec4(0);

        int blockIndex, pos, offsetY, d0, offsetX, d1, ch;
        vec2 innerDims;

        ${c}

        ${n.output} = result;
      }
    `}};function wf(r,t){let e=r.length;return e>=3?t?[...r.slice(0,-3),r[e-3]*r[e-2],r[e-1]]:[...r.slice(0,-3),r[e-3],r[e-2]*r[e-1]]:!t&&e===1&&r[0]>1?[r[0],1]:null}function Nf({x:r,filter:t,convInfo:e,backend:o,bias:n=null,preluActivationWeights:s=null,leakyreluAlpha:a=0,activation:i=null}){let p=r.shape,c=o.texData.get(r.dataId),l=e.inChannels,u=p[0]*p[1]*p[2],m=e.outChannels,f=e.dataFormat==="channelsLast",d=!1,g=!1,h,x=[];if(s!=null){let w=wf(s.shape,f);w!=null&&(s=j({inputs:{x:s},backend:o,attrs:{shape:w}}),x.push(s))}if(n!=null){let w=wf(n.shape,f);w!=null&&(n=j({inputs:{x:n},backend:o,attrs:{shape:w}}),x.push(n))}if(!((u===1||m===1)&&l>hy)&&c.isPacked&&f&&c.texture!=null&&p[2]%2!==0&&y.arraysEqual(c.shape.slice(-3),p.slice(-3))){let w=p[0]*p[1]*(p[2]+1),E={dataId:r.dataId,shape:[1,w,e.inChannels],dtype:r.dtype},$=c.shape;c.shape=c.shape.slice(),c.shape[c.shape.length-2]++,y.assert(cp(c.shape,E.shape),()=>`packed reshape ${c.shape} to ${E.shape} isn't free`);let D=j({inputs:{x:t},backend:o,attrs:{shape:[1,e.inChannels,e.outChannels]}});x.push(D);let F=hp({a:E,b:D,backend:o,transposeA:d,transposeB:g,bias:n,activation:i,preluActivationWeights:s,leakyreluAlpha:a}),P=o.texData.get(F.dataId);y.assert(P.isPacked,()=>"batchMatMul result is expected to be packed"),c.shape=$,P.shape=e.outShape,h=oe({inputs:{x:F},backend:o}),h.shape=e.outShape,x.push(F)}else{let w=e.outHeight*e.outWidth,E=j({inputs:{x:r},backend:o,attrs:{shape:f?[e.batchSize,w,e.inChannels]:[e.batchSize,e.inChannels,w]}}),$=j({inputs:{x:t},backend:o,attrs:{shape:[1,e.inChannels,e.outChannels]}}),D=hp({a:f?E:$,b:f?$:E,transposeA:!f,transposeB:g,backend:o,bias:n,activation:i,preluActivationWeights:s,leakyreluAlpha:a});h=j({inputs:{x:D},backend:o,attrs:{shape:e.outShape}}),x.push(E),x.push($),x.push(D)}for(let w of x)o.disposeIntermediateTensorInfo(w);return h}function vf({x:r,filter:t,convInfo:e,backend:o,bias:n=null,preluActivationWeights:s=null,leakyreluAlpha:a=0,activation:i=null}){let{filterWidth:p,filterHeight:c,inChannels:l,outWidth:u,outHeight:m,dataFormat:f}=e,d=f==="channelsLast",g=p*c*l,h=m*u,x=[e.batchSize,g,h],b=!0,S=!1,w=[];if(s!=null){let W=wf(s.shape,d);W!=null&&(s=j({inputs:{x:s},backend:o,attrs:{shape:W}}),w.push(s))}if(n!=null){let W=wf(n.shape,d);W!=null&&(n=j({inputs:{x:n},backend:o,attrs:{shape:W}}),w.push(n))}let E=j({inputs:{x:t},backend:o,attrs:{shape:[1,g,y.sizeFromShape(t.shape)/g]}});w.push(E);let $=new Sf(x,e),D=[r.shape,[e.padInfo.top,e.padInfo.left],[e.strideHeight,e.strideWidth],[e.dilationHeight,e.dilationWidth],[e.inChannels],[e.filterWidth*e.inChannels],[e.outWidth]],F=o.runWebGLProgram($,[r],"float32",D),P=j({inputs:{x:F},backend:o,attrs:{shape:x}});w.push(F),w.push(P);let L=n!=null,M=s!=null,B=i==="leakyrelu",G=i?bs(i,!0):null,z=new mc(d?P.shape:E.shape,d?E.shape:P.shape,d?[e.batchSize,h,e.outChannels]:[e.batchSize,e.outChannels,h],b,S,L,G,M,B),V=d?[P,E]:[E,P];if(n&&V.push(n),M&&V.push(s),B){let W=o.makeTensorInfo([],"float32",y.createScalarValue(a,"float32"));V.push(W),w.push(W)}let H=o.runWebGLProgram(z,V,"float32"),q=j({inputs:{x:H},backend:o,attrs:{shape:e.outShape}});w.push(H);for(let W of w)o.disposeIntermediateTensorInfo(W);return q}function Uz(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,filter:s}=t,{strides:a,pad:i,dataFormat:p,dilations:c,dimRoundingMode:l}=o,u=I.convertConv2DDataFormat(p),m=I.computeConv2DInfo(n.shape,s.shape,a,c,i,l,!1,u),f;if(m.filterHeight===1&&m.filterWidth===1&&m.dilationHeight===1&&m.dilationWidth===1&&m.strideHeight===1&&m.strideWidth===1&&(m.padInfo.type==="SAME"||m.padInfo.type==="VALID"))f=Nf({x:n,filter:s,convInfo:m,backend:e});else if(m.strideWidth<=2&&u==="channelsLast"&&_().getBool("WEBGL_EXP_CONV")){let g=new hc(m),h=[[m.padInfo.top,m.padInfo.left],[m.strideHeight,m.strideWidth],[m.dilationHeight,m.dilationWidth],[m.inHeight,m.inWidth]];f=e.runWebGLProgram(g,[n,s],"float32",h)}else if(_().getBool("WEBGL_CONV_IM2COL"))f=vf({x:n,filter:s,convInfo:m,backend:e});else{let g=new dc(m);f=e.runWebGLProgram(g,[n,s],"float32")}let d=j({inputs:{x:f},backend:e,attrs:{shape:m.outShape}});return e.disposeIntermediateTensorInfo(f),d}var lE={kernelName:bn,backendName:"webgl",kernelFunc:Uz};var If=class{constructor(t){this.variableNames=["x","dy"],this.outputShape=t.filterShape;let e=t.strideHeight,o=t.strideWidth,n=t.padInfo.top,s=t.padInfo.left,a=t.dataFormat==="channelsLast";this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int wR = coords.x;
        int wC = coords.y;
        int d1 = coords.z;
        int d2 = coords.w;

        // Convolve x(?, ?, d1) with dy(:, :, d2) to get dw(wR, wC, d1, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int b = 0; b < ${t.batchSize}; b++) {
          for (int yR = 0; yR < ${t.outHeight}; yR++) {
            int xR = wR + yR * ${e} - ${n};

            if (xR < 0 || xR >= ${t.inHeight}) {
              continue;
            }

            for (int yC = 0; yC < ${t.outWidth}; yC++) {
              int xC = wC + yC * ${o} - ${s};

              if (xC < 0 || xC >= ${t.inWidth}) {
                continue;
              }

              if (${a}) {
                float dyValue = getDy(b, yR, yC, d2);
                float xValue = getX(b, xR, xC, d1);
                dotProd += (xValue * dyValue);
              } else {
                float dyValue = getDy(b, d2, yR, yC);
                float xValue = getX(b, d1, xR, xC);
                dotProd += (xValue * dyValue);
              }

            }
          }
        }
        setOutput(dotProd);
      }
    `}},kf=class{constructor(t){this.variableNames=["dy","W"],this.outputShape=t.inShape;let e=t.filterHeight,o=t.filterWidth,n=t.strideHeight,s=t.strideWidth,a=t.dataFormat==="channelsLast",i=e-1-t.padInfo.top,p=o-1-t.padInfo.left,c=a?1:2,l=a?2:3,u=a?3:1;this.userCode=`
      const ivec2 pads = ivec2(${i}, ${p});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[${u}];

        ivec2 dyCorner = ivec2(coords[${c}], coords[${l}]) - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${e}; wR++) {
          float dyR = float(dyRCorner + wR) / ${n}.0;

          if (dyR < 0.0 || dyR >= ${t.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          int wRPerm = ${e} - 1 - wR;

          for (int wC = 0; wC < ${o}; wC++) {
            float dyC = float(dyCCorner + wC) / ${s}.0;

            if (dyC < 0.0 || dyC >= ${t.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            int wCPerm = ${o} - 1 - wC;

            for (int d2 = 0; d2 < ${t.outChannels}; d2++) {

              if (${a}) {
                float xValue = getDy(batch, idyR, idyC, d2);
                float wValue = getW(wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              } else {
                float xValue = getDy(batch, d2, idyR, idyC);
                float wValue = getW(wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              }

            }
          }
        }
        setOutput(dotProd);
      }
    `}},Ef=class{constructor(t){this.variableNames=["x","dy"],this.outputShape=t.filterShape;let e=t.strideDepth,o=t.strideHeight,n=t.strideWidth,s=t.padInfo.front,a=t.padInfo.top,i=t.padInfo.left;this.userCode=`
      void main() {
        ivec5 coords = getOutputCoords();
        int wF = coords.x;
        int wR = coords.y;
        int wC = coords.z;
        int d1 = coords.w;
        int d2 = coords.u;

        float dotProd = 0.0;

        for (int b = 0; b < ${t.batchSize}; b++) {
          for (int yF = 0; yF < ${t.outDepth}; yF++) {
            int xF = wF + yF * ${e} - ${s};

            if (xF < 0 || xF >= ${t.inDepth}) {
              continue;
            }

            for (int yR = 0; yR < ${t.outHeight}; yR++) {
              int xR = wR + yR * ${o} - ${a};

              if (xR < 0 || xR >= ${t.inHeight}) {
                continue;
              }

              for (int yC = 0; yC < ${t.outWidth}; yC++) {
                int xC = wC + yC * ${n} - ${i};

                if (xC < 0 || xC >= ${t.inWidth}) {
                  continue;
                }

                float dyValue = getDy(b, yF, yR, yC, d2);
                float xValue = getX(b, xF, xR, xC, d1);
                dotProd += (xValue * dyValue);
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `}},$f=class{constructor(t){this.variableNames=["dy","W"],this.outputShape=t.inShape;let e=t.filterDepth,o=t.filterHeight,n=t.filterWidth,s=t.strideDepth,a=t.strideHeight,i=t.strideWidth,p=e-1-t.padInfo.front,c=o-1-t.padInfo.top,l=n-1-t.padInfo.left;this.userCode=`
      const ivec3 pads = ivec3(${p}, ${c}, ${l});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int d1 = coords.u;


        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyFCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        float dotProd = 0.0;
        for (int wF = 0; wF < ${e}; wF++) {
          float dyF = float(dyFCorner + wF) / ${s}.0;

          if (dyF < 0.0 || dyF >= ${t.outDepth}.0 || fract(dyF) > 0.0) {
            continue;
          }
          int idyF = int(dyF);

          int wFPerm = ${e} - 1 - wF;

          for (int wR = 0; wR < ${o}; wR++) {
            float dyR = float(dyRCorner + wR) / ${a}.0;

            if (dyR < 0.0 || dyR >= ${t.outHeight}.0 ||
              fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            int wRPerm = ${o} - 1 - wR;

            for (int wC = 0; wC < ${n}; wC++) {
              float dyC = float(dyCCorner + wC) / ${i}.0;

              if (dyC < 0.0 || dyC >= ${t.outWidth}.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              int wCPerm = ${n} - 1 - wC;

              for (int d2 = 0; d2 < ${t.outChannels}; d2++) {
                float xValue = getDy(batch, idyF, idyR, idyC, d2);
                float wValue = getW(wFPerm, wRPerm, wCPerm, d1, d2);
                dotProd += xValue * wValue;
              }
            }
          }
        }
        setOutput(dotProd);
      }
    `}};function Hz(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,dy:s}=t,{strides:a,pad:i,dataFormat:p,dimRoundingMode:c,filterShape:l}=o,u=I.convertConv2DDataFormat(p),m=I.computeConv2DInfo(n.shape,l,a,1,i,c,!1,u),f=new If(m);return e.runWebGLProgram(f,[n,s],"float32")}var uE={kernelName:Sa,backendName:"webgl",kernelFunc:Hz};function qz(r){let{inputs:t,backend:e,attrs:o}=r,{dy:n,filter:s}=t,{inputShape:a,strides:i,pad:p,dataFormat:c,dimRoundingMode:l}=o,u=I.convertConv2DDataFormat(c),m=I.computeConv2DInfo(a,s.shape,i,1,p,l,!1,u),f=new kf(m);return e.runWebGLProgram(f,[n,s],"float32")}var mE={kernelName:Cn,backendName:"webgl",kernelFunc:qz};function Kz(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,filter:s}=t,{strides:a,pad:i,dilations:p}=o,c=I.computeConv3DInfo(n.shape,s.shape,a,p,i),l=new Tf(c);return e.runWebGLProgram(l,[n,s],"float32")}var fE={kernelName:Tn,backendName:"webgl",kernelFunc:Kz};function Xz(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,dy:s}=t,{strides:a,pad:i,filterShape:p}=o,c=I.computeConv3DInfo(n.shape,p,a,1,i),l=new Ef(c);return e.runWebGLProgram(l,[n,s],"float32")}var dE={kernelName:wa,backendName:"webgl",kernelFunc:Xz};function jz(r){let{inputs:t,backend:e,attrs:o}=r,{dy:n,filter:s}=t,{pad:a,strides:i,inputShape:p}=o,c=I.computeConv3DInfo(p,s.shape,i,1,a),l=new $f(c);return e.runWebGLProgram(l,[n,s],"float32")}var hE={kernelName:Na,backendName:"webgl",kernelFunc:jz};var Yz=Pr+`
  return cos(x);
`,Zz=lt({opSnippet:Yz}),gE={kernelName:"Cos",backendName:"webgl",kernelFunc:Zz};var Qz=`
  float e2x = exp(-x);
  return (e2x + 1.0 / e2x) / 2.0;
`,Jz=lt({opSnippet:Qz}),xE={kernelName:xo,backendName:"webgl",kernelFunc:Jz};var Af=class{constructor(t,e,o,n,s){this.variableNames=["Image","Boxes","BoxInd"],this.outputShape=[];let[a,i,p,c]=t,[l]=e,[u,m]=o;this.outputShape=[l,u,m,c];let f=n==="bilinear"?1:0,[d,g]=[`${i-1}.0`,`${p-1}.0`],[h,x,b]=u>1?[`${(i-1)/(u-1)}`,"(y2-y1) * height_ratio",`y1*${d} + float(y)*(height_scale)`]:["0.0","0.0",`0.5 * (y1+y2) * ${d}`],[S,w,E]=m>1?[`${(p-1)/(m-1)}`,"(x2-x1) * width_ratio",`x1*${g} + float(x)*(width_scale)`]:["0.0","0.0",`0.5 * (x1+x2) * ${g}`];this.userCode=`
      const float height_ratio = float(${h});
      const float width_ratio = float(${S});
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int y = coords[1];
        int x = coords[2];
        int d = coords[3];

        // get box vals
        float y1 = getBoxes(b,0);
        float x1 = getBoxes(b,1);
        float y2 = getBoxes(b,2);
        float x2 = getBoxes(b,3);

        // get image in batch index
        int bInd = round(getBoxInd(b));
        if(bInd < 0 || bInd >= ${a}) {
          return;
        }

        float height_scale = ${x};
        float width_scale = ${w};

        float in_y = ${b};
        if( in_y < 0.0 || in_y > ${d} ) {
          setOutput(float(${s}));
          return;
        }
        float in_x = ${E};
        if( in_x < 0.0 || in_x > ${g} ) {
          setOutput(float(${s}));
          return;
        }

        vec2 sourceFracIndexCR = vec2(in_x,in_y);
        if(${f} == 1) {
          // Compute the four integer indices.
          ivec2 sourceFloorCR = ivec2(sourceFracIndexCR);
          ivec2 sourceCeilCR = ivec2(ceil(sourceFracIndexCR));

          float topLeft = getImage(b, sourceFloorCR.y, sourceFloorCR.x, d);
          float bottomLeft = getImage(b, sourceCeilCR.y, sourceFloorCR.x, d);
          float topRight = getImage(b, sourceFloorCR.y, sourceCeilCR.x, d);
          float bottomRight = getImage(b, sourceCeilCR.y, sourceCeilCR.x, d);

          vec2 fracCR = sourceFracIndexCR - vec2(sourceFloorCR);

          float top = topLeft + (topRight - topLeft) * fracCR.x;
          float bottom = bottomLeft + (bottomRight - bottomLeft) * fracCR.x;
          float newValue = top + (bottom - top) * fracCR.y;
          setOutput(newValue);
        } else {
          // Compute the coordinators of nearest neighbor point.
          ivec2 sourceNearestCR = ivec2(floor(
            sourceFracIndexCR + vec2(0.5,0.5)));
          float newValue = getImage(b, sourceNearestCR.y, sourceNearestCR.x, d);
          setOutput(newValue);
        }
      }
    `}};var t4=r=>{let{inputs:t,backend:e,attrs:o}=r,{image:n,boxes:s,boxInd:a}=t,{cropSize:i,method:p,extrapolationValue:c}=o,l=new Af(n.shape,s.shape,i,p,c);return e.runWebGLProgram(l,[n,s,a],"float32")},yE={kernelName:Ia,backendName:"webgl",kernelFunc:t4};var xp;(function(r){r.Prod="*",r.Sum="+"})(xp||(xp={}));var ru=class{constructor(t,e,o,n){this.op=t,this.outputShape=e,this.variableNames=["x"],this.customUniforms=[{name:"index",type:"float"}];let s=this.outputShape.length,a=this.op===xp.Prod?"1.0":"0.0",i=o?a:`getX(${bE(s,"coords",this.op)})`,p=this.outputShape[this.outputShape.length-1],c="",l="";o?(c=n?`end != ${p-1}`:"end != 0",l=n?"end + 1":"end - 1"):(c=n?`end + pow2 < ${p}`:"end >= pow2",l=n?"end + pow2":"end - pow2"),this.userCode=`
      void main() {
        ${wt(s)} coords = getOutputCoords();
        int end = ${CE(s,"coords",this.op)};
        float val = ${i};
        int pow2 = int(pow(2.0, index));
        if (${c}) {
          int idx = ${l};
          ${CE(s,"coords",this.op)} = idx;
          val ${this.op}= getX(${bE(s,"coords",this.op)});
        }
        setOutput(val);
      }
    `}};function bE(r,t,e){if(r===1)return`${t}`;if(r===2)return`${t}.x, ${t}.y`;if(r===3)return`${t}.x, ${t}.y, ${t}.z`;if(r===4)return`${t}.x, ${t}.y, ${t}.z, ${t}.w`;throw new Error(`Cumulative ${e} for rank ${r} is not yet supported`)}function CE(r,t,e){if(r===1)return`${t}`;if(r===2)return`${t}.y`;if(r===3)return`${t}.z`;if(r===4)return`${t}.w`;throw new Error(`Cumulative ${e} for rank ${r} is not yet supported`)}function Df(r,t,e,o,n,s){let a=t.shape.length,i=I.getAxesPermutation([o],a),p=t;i!=null&&(p=Ht({inputs:{x:t},backend:e,attrs:{perm:i}}));let c=I.getInnerMostAxes(1,a)[0];if(c!==a-1)throw new Error(`WebGL cumprod shader expects an inner-most axis=${t.shape.length-1} but got axis=${o}`);let l=p.shape[c],u=oe({inputs:{x:p},backend:e});for(let m=0;m<=Math.ceil(Math.log2(l))-1;m++){let f=new ru(r,p.shape,!1,s),d=[[m]],g=u;u=e.runWebGLProgram(f,[u],u.dtype,d),e.disposeIntermediateTensorInfo(g)}if(n){let m=new ru(r,p.shape,n,s),f=u;u=e.runWebGLProgram(m,[u],u.dtype),e.disposeIntermediateTensorInfo(f)}if(i!=null){let m=I.getUndoAxesPermutation(i),f=Ht({inputs:{x:u},backend:e,attrs:{perm:m}});return e.disposeIntermediateTensorInfo(u),e.disposeIntermediateTensorInfo(p),f}return u}function e4(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s,exclusive:a,reverse:i}=o;return Df(xp.Prod,n,e,s,a,i)}var TE={kernelName:va,backendName:"webgl",kernelFunc:e4};function r4(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s,exclusive:a,reverse:i}=o;return Df(xp.Sum,n,e,s,a,i)}var SE={kernelName:Sn,backendName:"webgl",kernelFunc:r4};function o4(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,weights:s}=t,{size:a,binaryOutput:i}=o;if(n.shape.length===1){let p=e.readSync(n.dataId),c=e.readSync(s.dataId),l=qm(p,c,s.dtype,s.shape,a);return e.makeTensorInfo([a],s.dtype,l)}else if(n.shape.length===2){let p=e.bufferSync(n),c=e.bufferSync(s),l=u1(p,c,a,i);return e.makeTensorInfo(l.shape,s.dtype,l.values)}throw new Error(`Error in denseBincount: input must be at most rank 2, but got rank${n.shape.length}.`)}var wE={kernelName:ka,backendName:"webgl",kernelFunc:o4};var Rf=class{constructor(t,e,o){this.variableNames=["x"],this.outputShape=[],this.outputShape=t,this.blockSize=e,this.dataFormat=o,this.userCode=`
    void main() {
      ivec4 coords = getOutputCoords();
      int b = coords[0];
      int h = ${this.getHeightCoordString()};
      int w = ${this.getWidthCoordString()};
      int d = ${this.getDepthCoordString()};

      int in_h = h / ${e};
      int offset_h = imod(h, ${e});
      int in_w = w / ${e};
      int offset_w = imod(w, ${e});
      int offset_d = (offset_h * ${e} + offset_w) *
        ${this.getOutputDepthSize()};
      int in_d = d + offset_d;

      float result = ${this.getInputSamplingString()};
      setOutput(result);
    }
  `}getHeightCoordString(){return this.dataFormat==="NHWC"?"coords[1]":"coords[2]"}getWidthCoordString(){return this.dataFormat==="NHWC"?"coords[2]":"coords[3]"}getDepthCoordString(){return this.dataFormat==="NHWC"?"coords[3]":"coords[1]"}getOutputDepthSize(){return this.dataFormat==="NHWC"?this.outputShape[3]:this.outputShape[1]}getInputSamplingString(){return this.dataFormat==="NHWC"?"getX(b, in_h, in_w, in_d)":"getX(b, in_d, in_h, in_w)"}};function n4(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{blockSize:s,dataFormat:a}=o,i=n.shape[0],p=a==="NHWC"?n.shape[1]:n.shape[2],c=a==="NHWC"?n.shape[2]:n.shape[3],l=a==="NHWC"?n.shape[3]:n.shape[1],u=p*s,m=c*s,f=l/(s*s),d=a==="NHWC"?[i,u,m,f]:[i,f,u,m],g=new Rf(d,s,a);return e.runWebGLProgram(g,[n],n.dtype)}var NE={kernelName:Ea,backendName:"webgl",kernelFunc:n4};var gc=class{constructor(t,e=!1,o=null,n=!1,s=!1){this.variableNames=["x","W"],this.customUniforms=[{name:"pads",type:"ivec2"},{name:"strides",type:"ivec2"},{name:"dilations",type:"ivec2"},{name:"inDims",type:"ivec2"}],this.outputShape=t.outShape,this.enableShapeUniforms=Bt(this.outputShape.length);let a=t.filterHeight,i=t.filterWidth,p=t.outChannels/t.inChannels,c="",l="";o&&(n?c=`float activation(float a) {
          float b = getPreluActivationWeightsAtOutCoords();
          ${o}
        }`:s?c=`float activation(float a) {
          float b = getLeakyreluAlphaAtOutCoords();
          ${o}
        }`:c=`
          float activation(float x) {
            ${o}
          }
        `,l="result = activation(result);");let u=e?"result += getBiasAtOutCoords();":"";e&&this.variableNames.push("bias"),n&&this.variableNames.push("preluActivationWeights"),s&&this.variableNames.push("leakyreluAlpha"),this.userCode=`
      ${c}

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        ivec2 xRCCorner = coords.yz * strides - pads;
        int d2 = coords.w;
        int d1 = d2 / ${p};
        int q = d2 - d1 * ${p};

        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        // Convolve x(?, ?, d1) with w(:, :, d1, q) to get y(yR, yC, d2).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        // TO DO(dsmilkov): Flatten the two for loops and vec4 the operations.
        for (int wR = 0; wR < ${a}; wR++) {
          int xR = xRCorner + wR * dilations[0];

          if (xR < 0 || xR >= inDims[0]) {
            continue;
          }

          for (int wC = 0; wC < ${i}; wC++) {
            int xC = xCCorner + wC * dilations[1];

            if (xC < 0 || xC >= inDims[1]) {
              continue;
            }

            float xVal = getX(batch, xR, xC, d1);
            float wVal = getW(wR, wC, d1, q);
            dotProd += xVal * wVal;
          }
        }

        float result = dotProd;
        ${u}
        ${l}
        setOutput(result);
      }
    `}};var xc=class{constructor(t,e=!1,o=null,n=!1,s=!1){this.variableNames=["x","W"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"pads",type:"ivec2"},{name:"strides",type:"ivec2"},{name:"dilations",type:"ivec2"},{name:"inDims",type:"ivec2"}],this.outputShape=t.outShape,this.enableShapeUniforms=Bt(this.outputShape.length);let a=t.outChannels/t.inChannels,i=t.padInfo.left,p=t.strideWidth,c=t.dilationWidth,l=t.filterHeight,u=t.filterWidth,m=u,f=`
      int xR; int xC; int xCOffset;
      vec4 wTexel; vec4 previous; vec4 final;`;for(let x=0;x<u;x++)f+=`
          vec4 xTexelC${x*2};
          int xTexelC${x*2}Ready;
          vec4 xTexelC${x*2+1};
          int xTexelC${x*2+1}Ready;
          vec4 xC${x};`;f+=`
    for (int r = 0; r < ${l}; r++) {
      `;for(let x=0;x<u;x++)f+=`
          xTexelC${x*2} = vec4(0.0);
          xTexelC${x*2}Ready = 0;
          xTexelC${x*2+1} = vec4(0.0);
          xTexelC${x*2+1}Ready = 0;
          xC${x} = vec4(0.0);`;f+=`
        xR = xRCorner + r * dilations[0];
        if (xR >=0 && xR < inDims[0]) {
      `;for(let x=0;x<(m+1)/2;x++){let b=x*2;if(f+=`
          xC = xCCorner + ${b*c};
          `,p===1){if(b<u&&(i%2===1?(f+=`
                xCOffset = xC + 1;
                if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${b}Ready == 0) {
                  xTexelC${b} = getX(batch, xR, xCOffset, d1);

                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if (xCOffset + 1 >= inDims[1]) {
                    xTexelC${b}.zw = vec2(0.0);
                  }
                  xTexelC${b}Ready = 1;
                }
              `,c===1&&b>0?f+=`
                xC${b} = vec4(xTexelC${b-2}.zw, xTexelC${b}.xy);
                `:f+=`
                  xCOffset = xC + 1 - 2;

                  if (xCOffset >= 0 && xCOffset < inDims[1]) {
                    previous = getX(batch, xR, xCOffset, d1);

                    // Need to manually clear unused channels in case
                    // we're reading from recycled texture.
                    if (xCOffset + 1 >= inDims[1]) {
                      previous.zw = vec2(0.0);
                    }

                    xC${b} = vec4(previous.zw, xTexelC${b}.xy);
                  } else {
                    xC${b} = vec4(0.0, 0.0, xTexelC${b}.xy);
                  }
                  `):f+=`
                if (xC >= 0 && xC < inDims[1] && xTexelC${b}Ready == 0) {
                  xTexelC${b} = getX(batch, xR, xC, d1);
                  if (xC + 1 >= inDims[1]) {
                    xTexelC${b}.zw = vec2(0.0);
                  }
                  xTexelC${b}Ready = 1;
                }

                xC${b} = xTexelC${b};
                `,b+1<u)){let S=i%2===0?y.nearestLargerEven(c):c;c%2===0&&i%2===1||c%2!==0&&i%2!==1?(f+=`
                  xCOffset = xC + imod(pads[1], 2) + ${S};

                  if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${b+1}Ready == 0) {
                    xTexelC${b+1} = getX(batch, xR, xCOffset, d1);

                    // Need to manually clear unused channels in case
                    // we're reading from recycled texture.
                    if (xCOffset + 1 >= inDims[1]) {
                      xTexelC${b+1}.zw = vec2(0.0);
                    }
                    xTexelC${b+1}Ready = 1;
                  }
                  `,c>1?f+=`
                    xCOffset -= 2;
                    if (xCOffset >= 0 && xCOffset < inDims[1]) {
                     previous = getX(batch, xR, xCOffset, d1);
                     xC${b+1} = vec4(previous.zw, xTexelC${b+1}.xy);
                    } else {
                     xC${b+1} = vec4(0.0, 0.0, xTexelC${b+1}.xy);
                    }
                    `:f+=`
                    xC${b+1} = vec4(xTexelC${b}.zw, xTexelC${b+1}.xy);
                    `):S===1?f+=`
                    xC${b+1} = xTexelC${b};
                    `:f+=`
                    xCOffset = xC + ${S};

                    if (xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${b+1}Ready == 0) {
                      xTexelC${b+1} = getX(batch, xR, xCOffset, d1);
                      if (xCOffset + 1 >= inDims[1]) {
                        xTexelC${b+1}.zw = vec2(0.0);
                      }
                      xTexelC${b+1}Ready = 1;
                    }

                    xC${b+1} = xTexelC${b+1};
                    `}}else b<u&&(i%2===1?(f+=`
                xCOffset = xC + 1 - strides[1];
                if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${b}Ready == 0) {
                  xTexelC${b} = getX(batch, xR, xCOffset, d1);
                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if (xCOffset + 1 >= inDims[1]) {
                    xTexelC${b}.zw = vec2(0.0);
                  }
                  xTexelC${b}Ready = 1;
                }

                if(xC + 1 >= 0 && xC + 1 < inDims[1] && xTexelC${b+1}Ready == 0) {
                  xTexelC${b+1} = getX(batch, xR, xC + 1, d1);
                  // Need to manually clear unused channels in case
                  // we're reading from recycled texture.
                  if (xC + 2 >= inDims[1]) {
                    xTexelC${b+1}.zw = vec2(0.0);
                  }
                  xTexelC${b+1}Ready = 1;
                }

                xC${b} = vec4(xTexelC${b}.zw, xTexelC${b+1}.zw);
              `,b+1<u&&(f+=`
                  final = vec4(0.0);
                  xCOffset = xC + 1 + strides[1];
                  if(xCOffset >= 0 && xCOffset < inDims[1]) {
                    final = getX(batch, xR, xCOffset, d1);
                  }
                  xC${b+1} = vec4(xTexelC${b+1}.xy, final.xy);
                `)):(f+=`
                if(xC >= 0 && xC < inDims[1] && xTexelC${b}Ready == 0) {
                  xTexelC${b} = getX(batch, xR, xC, d1);
                  if (xC + 1 >= inDims[1]) {
                    xTexelC${b}.zw = vec2(0.0);
                  }
                  xTexelC${b}Ready = 1;
                }

                xCOffset = xC + strides[1];
                if(xCOffset >= 0 && xCOffset < inDims[1] && xTexelC${b+1}Ready == 0) {
                  xTexelC${b+1} = getX(batch, xR, xCOffset, d1);
                  if (xCOffset + 1 >= inDims[1]) {
                    xTexelC${b+1}.zw = vec2(0.);
                  }
                  xTexelC${b+1}Ready = 1;
                }

                xC${b} = vec4(
                  xTexelC${b}.xy, xTexelC${b+1}.xy);
              `,b+1<u&&(f+=`
                  xC${b+1} = vec4(xTexelC${b}.zw, xTexelC${b+1}.zw);
                `)));b<u&&(f+=`
            wTexel = getW(r, ${b}, d1, q);
            dotProd += xC${b} * vec4(wTexel.xz, wTexel.xz);
          `,b+1<u&&(f+=`
              wTexel = getW(r, ${b+1}, d1, q);
              dotProd += xC${b+1} * vec4(wTexel.xz, wTexel.xz);
            `))}f+=`
    }
  `,f+=`
      }
    `;let d="",g="";o&&(n?d=`vec4 activation(vec4 a) {
          vec4 b = getPreluActivationWeightsAtOutCoords();
          ${o}
        }`:s?d=`vec4 activation(vec4 a) {
          vec4 b = getLeakyreluAlphaAtOutCoords();
          ${o}
        }`:d=`vec4 activation(vec4 x) {
          ${o}
        }`,g="result = activation(result);");let h=e?"result += getBiasAtOutCoords();":"";e&&this.variableNames.push("bias"),n&&this.variableNames.push("preluActivationWeights"),s&&this.variableNames.push("leakyreluAlpha"),this.userCode=`
      ${d}

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        ivec2 xRCCorner = coords.yz * strides - pads;
        int d2 = coords.w;
        int d1 = d2 / ${a};
        int q = d2 - d1 * ${a};
        int xRCorner = xRCCorner.x;
        int xCCorner = xRCCorner.y;

        //intialize dotProd with a small epsilon seems to reduce GPU accuracy loss.
        vec4 dotProd = vec4(0.000000000000001);

        ${f}

        vec4 result = dotProd - vec4(0.000000000000001);
        ${h}
        ${g}
        setOutput(result);
      }
    `}};function s4(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,filter:s}=t,{strides:a,pad:i,dilations:p,dimRoundingMode:c}=o,l=p;l==null&&(l=[1,1]),y.assert(I.eitherStridesOrDilationsAreOne(a,l),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${a} and dilations '${l}'`);let u=I.computeConv2DInfo(n.shape,s.shape,a,l,i,c,!0),m;_().getBool("WEBGL_PACK_DEPTHWISECONV")&&u.strideWidth<=2&&u.outChannels/u.inChannels===1?m=new xc(u):m=new gc(u);let f=[[u.padInfo.top,u.padInfo.left],[u.strideHeight,u.strideWidth],[u.dilationHeight,u.dilationWidth],[u.inHeight,u.inWidth]];return e.runWebGLProgram(m,[n,s],"float32",f)}var vE={kernelName:wn,backendName:"webgl",kernelFunc:s4};var Ff=class{constructor(t){this.variableNames=["x","dy"],this.outputShape=t.filterShape;let e=t.strideHeight,o=t.strideWidth,n=t.padInfo.top,s=t.padInfo.left,a=t.outChannels/t.inChannels;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int wR = coords.x;
        int wC = coords.y;
        int d1 = coords.z;
        int dm = coords.w;
        int d2 = d1 * ${a} + dm;

        float dotProd = 0.0;

        // TO DO: Vec4 over the batch size
        for (int b = 0; b < ${t.batchSize}; b++) {
          for (int yR = 0; yR < ${t.outHeight}; yR++) {
            int xR = wR + yR * ${e} - ${n};

            if (xR < 0 || xR >= ${t.inHeight}) {
              continue;
            }

            for (int yC = 0; yC < ${t.outWidth}; yC++) {
              int xC = wC + yC * ${o} - ${s};

              if (xC < 0 || xC >= ${t.inWidth}) {
                continue;
              }

              float dyValue = getDy(b, yR, yC, d2);
              float xValue = getX(b, xR, xC, d1);
              dotProd += (xValue * dyValue);
            }
          }
        }
        setOutput(dotProd);
      }
    `}},_f=class{constructor(t){this.variableNames=["dy","W"],this.outputShape=t.inShape;let e=t.filterHeight,o=t.filterWidth,n=t.strideHeight,s=t.strideWidth,a=e-1-t.padInfo.top,i=o-1-t.padInfo.left,p=t.outChannels/t.inChannels;this.userCode=`
      const ivec2 pads = ivec2(${a}, ${i});

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords[0];
        int d1 = coords[3];
        ivec2 dyCorner = coords.yz - pads;
        int dyRCorner = dyCorner.x;
        int dyCCorner = dyCorner.y;

        float dotProd = 0.0;

        for (int wR = 0; wR < ${e}; wR++) {
          float dyR = float(dyRCorner + wR) / ${n}.0;

          if (dyR < 0.0 || dyR >= ${t.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          int wRPerm = ${e} - 1 - wR;

          for (int wC = 0; wC < ${o}; wC++) {
            float dyC = float(dyCCorner + wC) / ${s}.0;

            if (dyC < 0.0 || dyC >= ${t.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            int wCPerm = ${o} - 1 - wC;

            // TO DO: Vec4 over the channelMul
            for (int dm = 0; dm < ${p}; dm++) {
              int d2 = d1 * ${p} + dm;
              float xValue = getDy(batch, idyR, idyC, d2);
              float wValue = getW(wRPerm, wCPerm, d1, dm);
              dotProd += xValue * wValue;
            }
          }
        }
        setOutput(dotProd);
      }
    `}};function a4(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,dy:s}=t,{strides:a,dilations:i,pad:p,dimRoundingMode:c,filterShape:l}=o,u=I.computeConv2DInfo(n.shape,l,a,i,p,c,!0),m=new Ff(u);return e.runWebGLProgram(m,[n,s],"float32")}var IE={kernelName:$a,backendName:"webgl",kernelFunc:a4};function i4(r){let{inputs:t,backend:e,attrs:o}=r,{dy:n,filter:s}=t,{strides:a,dilations:i,pad:p,dimRoundingMode:c,inputShape:l}=o,u=I.computeConv2DInfo(l,s.shape,a,i,p,c,!0),m=new _f(u);return e.runWebGLProgram(m,[n,s],"float32")}var kE={kernelName:Aa,backendName:"webgl",kernelFunc:i4};var Of=class{constructor(t){this.variableNames=["X"],this.outputShape=[t,t],this.userCode=`
      void main() {
          ivec2 coords = getOutputCoords();
          float val = coords[0] == coords[1] ? getX(coords[0]) : 0.0;
          setOutput(val);
      }
    `}};function p4(r){let{inputs:t,backend:e}=r,{x:o}=t,n=[...o.shape,...o.shape],s=y.sizeFromShape(o.shape),a=j({inputs:{x:o},backend:e,attrs:{shape:[s]}}),i=new Of(s),p=e.runWebGLProgram(i,[a],a.dtype),c=j({inputs:{x:p},backend:e,attrs:{shape:n}});return e.disposeIntermediateTensorInfo(a),e.disposeIntermediateTensorInfo(p),c}var EE={kernelName:Da,backendName:"webgl",kernelFunc:p4};var Pf=class{constructor(t){this.variableNames=["x","W"],this.outputShape=t.outShape;let{inHeight:e,inWidth:o,padInfo:n,strideHeight:s,strideWidth:a,filterHeight:i,filterWidth:p,dilationHeight:c,dilationWidth:l}=t,{top:u,left:m}=n;this.userCode=`
      const ivec2 strides = ivec2(${s}, ${a});
      const ivec2 pads = ivec2(${u}, ${m});
      const float neg_infinity = -3.4e38;

      void main() {
        ivec4 coords = getOutputCoords();
        int batch = coords.x;
        int d1 = coords.w;
        ivec2 outTopLeftCorner =
            coords.yz * strides - pads;
        int hBeg = outTopLeftCorner.x;
        int wBeg = outTopLeftCorner.y;

        float curVal = neg_infinity;
        for (int h = 0; h < ${i}; h++) {
          int hIn = hBeg + h * ${c};

          if (hIn >= 0 && hIn < ${e}) {
            for (int w = 0; w < ${p}; w++) {
              int wIn = wBeg + w * ${l};

              if (wIn >= 0 && wIn < ${o}) {
                float xVal = getX(batch, hIn, wIn, d1);
                float wVal = getW(h, w, d1);

                float val = xVal + wVal;
                if (val > curVal) {
                  curVal = val;
                }
              }
            }
          }
        }

        float result = curVal;
        setOutput(result);
      }
    `}};function c4(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,filter:s}=t,{strides:a,pad:i,dilations:p}=o,c=I.computeDilation2DInfo(n.shape,s.shape,a,i,"NHWC",p),l,u=new Pf(c);l=e.runWebGLProgram(u,[n,s],"float32");let m=j({inputs:{x:l},backend:e,attrs:{shape:c.outShape}});return e.disposeIntermediateTensorInfo(l),m}var $E={kernelName:Nn,backendName:"webgl",kernelFunc:c4};function l4(r){let{inputs:t,backend:e,attrs:o}=r,{equation:n}=o,s=t,{allDims:a,summedDims:i,idDims:p}=I.decodeEinsumEquation(n,s.length);I.checkEinsumDimSizes(a.length,p,s);let{path:c,steps:l}=I.getEinsumComputePath(i,p),u=l.length,m=null,f=a.length,d=[];for(let g=0;g<u;++g){for(let h of l[g]){let{permutationIndices:x,expandDims:b}=I.getEinsumPermutation(f,p[h]),S;I.isIdentityPermutation(x)?S=s[h]:(S=Ht({inputs:{x:s[h]},backend:e,attrs:{perm:x}}),d.push(S));let w=S.shape.slice();for(let E=0;E<b.length;++E)w.splice(b[E],0,1);y.arraysEqual(S.shape,w)||(S=j({inputs:{x:S},backend:e,attrs:{shape:w}}),d.push(S)),m===null?m=S:(m=tu({inputs:{a:S,b:m},backend:e}),d.push(m))}g<u-1&&(c[g]>=0&&(m=dp({inputs:{x:m},backend:e,attrs:{axis:c[g]-(a.length-f),keepDims:!1}}),d.push(m)),f--)}for(let g of d)g!==m&&e.disposeIntermediateTensorInfo(g);return m}var AE={kernelName:Ra,backendName:"webgl",kernelFunc:l4};var u4="return (x >= 0.0) ? x : (exp(x) - 1.0);",m4=`
  vec4 result;

  result.r = (x.r >= 0.0) ? x.r : (exp(x.r) - 1.0);
  result.g = (x.g >= 0.0) ? x.g : (exp(x.g) - 1.0);
  result.b = (x.b >= 0.0) ? x.b : (exp(x.b) - 1.0);
  result.a = (x.a >= 0.0) ? x.a : (exp(x.a) - 1.0);

  return result;
`,f4=lt({opSnippet:u4,packedOpSnippet:m4}),DE={kernelName:"Elu",backendName:"webgl",kernelFunc:f4};var d4="return (b >= 1.0) ? a : a * (b + 1.0);",h4=`
  vec4 bGTEZero = vec4(greaterThanEqual(b, vec4(0.)));
  return (bGTEZero * a) + ((vec4(1.0) - bGTEZero) * (a * (b + vec4(1.0))));
`,g4=r=>{let{inputs:t,backend:e}=r,{dy:o,y:n}=t,s=_().getBool("WEBGL_PACK_BINARY_OPERATIONS")?new Or(h4,o.shape,n.shape):new Tr(d4,o.shape,n.shape);return e.runWebGLProgram(s,[o,n],o.dtype)},RE={kernelName:Fa,backendName:"webgl",kernelFunc:g4};var x4=`
  return vec4(equal(a, b));
`,y4="return float(a == b);",b4=Ot({opSnippet:y4,packedOpSnippet:x4,dtype:"bool",cpuKernelImpl:h1}),FE={kernelName:As,backendName:"webgl",kernelFunc:b4};var C4=`
  // Error function is calculated approximately with elementary function.
  // See "Handbook of Mathematical Functions with Formulas,
  // Graphs, and Mathematical Tables", Abramowitz and Stegun.
  float p = ${I.ERF_P};
  float a1 = ${I.ERF_A1};
  float a2 = ${I.ERF_A2};
  float a3 = ${I.ERF_A3};
  float a4 = ${I.ERF_A4};
  float a5 = ${I.ERF_A5};

  float sign = sign(x);
  x = abs(x);
  float t = 1.0 / (1.0 + p * x);
  return sign * (1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*exp(-x*x));
`,T4=lt({opSnippet:C4}),_E={kernelName:"Erf",backendName:"webgl",kernelFunc:T4};var S4=Pr+`
  return exp(x);
`,w4=`
  vec4 result = exp(x);
  bvec4 isNaN = isnan(x);
  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,Cy=lt({opSnippet:S4,packedOpSnippet:w4,cpuKernelImpl:g1,dtype:"float32"}),OE={kernelName:"Exp",backendName:"webgl",kernelFunc:Cy};function Lf(r){let{inputs:t,attrs:e,backend:o}=r,{dim:n}=e,{input:s}=t,a=s.shape.length,i=s.shape.slice(),p=n;return n<0&&(y.assert(-(a+1)<=n,()=>`Axis must be in the interval [${-(a+1)}, ${a}]`),p=a+n+1),i.splice(p,0,1),j({inputs:{x:s},backend:o,attrs:{shape:i}})}var PE={kernelName:In,backendName:"webgl",kernelFunc:Lf};var LE="return exp(x) - 1.0;",N4=lt({opSnippet:LE,packedOpSnippet:LE,cpuKernelImpl:x1}),ME={kernelName:bo,backendName:"webgl",kernelFunc:N4};var ou=class{constructor(t,e,o){this.variableNames=["real","imag"];let n=e[1];this.outputShape=e;let s=o?`2.0 * ${Math.PI}`:`-2.0 * ${Math.PI}`,a=o?`${n}.0`:"1.0",i;if(t==="real")i="return real * expR - imag * expI;";else if(t==="imag")i="return real * expI + imag * expR;";else throw new Error(`FFT component must be either "real" or "imag", got ${t}.`);this.userCode=`
      const float exponentMultiplier = ${s};

      float unaryOpComplex(float real, float expR, float imag, float expI) {
        ${i}
      }

      float mulMatDFT(int batch, int index) {
        float indexRatio = float(index) / float(${n});
        float exponentMultiplierTimesIndexRatio =
            exponentMultiplier * indexRatio;

        float result = 0.0;

        for (int i = 0; i < ${n}; i++) {
          // x = (-2|2 * PI / N) * index * i;
          float x = exponentMultiplierTimesIndexRatio * float(i);
          float expR = cos(x);
          float expI = sin(x);
          float real = getReal(batch, i);
          float imag = getImag(batch, i);

          result +=
              unaryOpComplex(real, expR, imag, expI) / ${a};
        }

        return result;
      }

      void main() {
        ivec2 coords = getOutputCoords();
        setOutput(mulMatDFT(coords[0], coords[1]));
      }
    `}};function Mf(r,t,e){let o=e.texData.get(r.dataId),n=y.sizeFromShape(r.shape),s=r.shape[r.shape.length-1],a=n/s,i=j({inputs:{x:r},backend:e,attrs:{shape:[a,s]}}),p=i.shape,c=new ou("real",p,t),l=new ou("imag",p,t),u=[{dataId:o.complexTensorInfos.real.dataId,dtype:o.complexTensorInfos.real.dtype,shape:p},{dataId:o.complexTensorInfos.imag.dataId,dtype:o.complexTensorInfos.imag.dtype,shape:p}],m=e.runWebGLProgram(c,u,"float32"),f=e.runWebGLProgram(l,u,"float32"),d=Ze({inputs:{real:m,imag:f},backend:e});e.disposeIntermediateTensorInfo(m),e.disposeIntermediateTensorInfo(f);let g=j({inputs:{x:d},backend:e,attrs:{shape:r.shape}});return e.disposeIntermediateTensorInfo(i),e.disposeIntermediateTensorInfo(d),g}function v4(r){let{inputs:t,backend:e}=r,{input:o}=t;return Mf(o,!1,e)}var BE={kernelName:"FFT",backendName:"webgl",kernelFunc:v4};var Bf=class{constructor(t,e){this.outputShape=[],this.customUniforms=[{name:"value",type:"float"}],this.variableNames=["x"],this.outputShape=t,this.userCode=`
      void main() {
        // Input can be obtained from uniform value.
        setOutput(value);
      }
    `}};function Ts(r){let{backend:t,attrs:e}=r,{shape:o,value:n}=e,{dtype:s}=e;if(s=s||y.inferDtype(n),s==="string"){let a=y.getArrayFromDType(s,y.sizeFromShape(o));return a.fill(n),t.makeTensorInfo(o,s,a)}else{let a=new Bf(o,n),i=[[n]];return t.runWebGLProgram(a,[],s,i)}}var GE={kernelName:_a,backendName:"webgl",kernelFunc:Ts};var Gf=class{constructor(t){this.variableNames=["Image"],this.outputShape=[];let e=t[2];this.outputShape=t,this.userCode=`
        void main() {
          ivec4 coords = getOutputCoords();
          int x = coords[2];

          int coordX = ${e} - x - 1;
          float outputValue;
          if(coordX >= 0 && coordX < ${e}) {
            outputValue = getImage(coords[0], coords[1], coordX, coords[3]);
          } else {
            outputValue = getImage(coords[0], coords[1], coords[2], coords[3]);
          }
          setOutput(outputValue);
        }
    `}};var VE={kernelName:Oa,backendName:"webgl",kernelFunc:({inputs:r,backend:t})=>{let{image:e}=r,o=t,n=new Gf(e.shape);return o.runWebGLProgram(n,[e],e.dtype)}};var zE="return floor(x);",I4=lt({opSnippet:zE,packedOpSnippet:zE,cpuKernelImpl:y1}),WE={kernelName:Co,backendName:"webgl",kernelFunc:I4};var k4=`
  float s = sign(a) * sign(b);
  int ia = round(a);
  int ib = round(b);
  if (ib != 0) {
    // Windows (D3D) wants guaranteed non-zero int division at compile-time.
    return float(idiv(ia, ib, s));
  } else {
    return NAN;
  }
`,E4=`
  ivec4 ia = round(a);
  ivec4 ib = round(b);
  bvec4 cond = notEqual(ib, ivec4(0));
  ivec4 result = ivec4(0);
  vec4 s = sign(a) * sign(b);

  // Windows (D3D) wants guaranteed non-zero int division at compile-time.
  if (cond[0]) {
    result[0] = idiv(ia[0], ib[0], s[0]);
  }
  if (cond[1]) {
    result[1] = idiv(ia[1], ib[1], s[1]);
  }
  if (cond[2]) {
    result[2] = idiv(ia[2], ib[2], s[2]);
  }
  if (cond[3]) {
    result[3] = idiv(ia[3], ib[3], s[3]);
  }
  return vec4(result);
`,$4=Ot({opSnippet:k4,packedOpSnippet:E4,dtype:"int32"}),UE={kernelName:To,backendName:"webgl",kernelFunc:$4};var Vf=class{constructor(t){this.variableNames=["A"];let e=Yt(),[o,n]=t;this.outputShape=t,this.userCode=`
      void main() {
        ivec3 coords = getOutputCoords();
        int texR = coords[0];
        int texC = coords[1];
        int depth = coords[2];
        vec2 uv = (vec2(texC, texR) + halfCR) / vec2(${n}.0, ${o}.0);

        vec4 values = ${e.texture2D}(A, uv);
        float value;
        if (depth == 0) {
          value = values.r;
        } else if (depth == 1) {
          value = values.g;
        } else if (depth == 2) {
          value = values.b;
        } else if (depth == 3) {
          value = values.a;
        }

        setOutput(floor(value * 255.0 + 0.5));
      }
    `}};var zf=class{constructor(t){this.variableNames=["A"],this.packedInputs=!1,this.packedOutput=!0;let e=Yt(),[o,n]=t;this.outputShape=t,this.userCode=`
      void main() {
        ivec3 coords = getOutputCoords();
        int texR = coords[0];
        int texC = coords[1];
        int depth = coords[2];

        vec4 result = vec4(0.);

        for(int row=0; row<=1; row++) {
          for(int col=0; col<=1; col++) {
            texC = coords[1] + row;
            depth = coords[2] + col;

            vec2 uv = (vec2(texC, texR) + halfCR) /
                       vec2(${n}.0, ${o}.0);
            vec4 values = ${e.texture2D}(A, uv);
            float value;
            if (depth == 0) {
              value = values.r;
            } else if (depth == 1) {
              value = values.g;
            } else if (depth == 2) {
              value = values.b;
            } else if (depth == 3) {
              value = values.a;
            }

            result[row * 2 + col] = floor(value * 255.0 + 0.5);
          }
        }

        ${e.output} = result;
      }
    `}};var HE={kernelName:$p,backendName:"webgl",kernelFunc:A4},yc,Ty=_().getBool("CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU");function A4(r){let{inputs:t,backend:e,attrs:o}=r,{pixels:n}=t,{numChannels:s}=o,a=typeof HTMLVideoElement!="undefined"&&n instanceof HTMLVideoElement,i=typeof HTMLImageElement!="undefined"&&n instanceof HTMLImageElement,[p,c]=a?[n.videoWidth,n.videoHeight]:[n.width,n.height],l=[c,p],u=[c,p,s];if(i||a){let g=_().getBool("CANVAS2D_WILL_READ_FREQUENTLY_FOR_GPU");(yc==null||g!==Ty)&&(Ty=g,yc=document.createElement("canvas").getContext("2d",{willReadFrequently:Ty})),yc.canvas.width=p,yc.canvas.height=c,yc.drawImage(n,0,0,p,c),n=yc.canvas}let m=e.makeTensorInfo(l,"int32");e.texData.get(m.dataId).usage=Re.PIXELS,e.gpgpu.uploadPixelDataToTexture(e.getTexture(m.dataId),n);let f=_().getBool("WEBGL_PACK")?new zf(u):new Vf(u),d=e.runWebGLProgram(f,[m],"int32");return e.disposeData(m.dataId),d}function D4(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,filter:s,bias:a,preluActivationWeights:i}=t,{strides:p,pad:c,dataFormat:l,dilations:u,dimRoundingMode:m,activation:f,leakyreluAlpha:d}=o,g=I.convertConv2DDataFormat(l),h=I.computeConv2DInfo(n.shape,s.shape,p,u,c,m,!1,g),x,b=[],S=a!=null,w=i!=null,E=f==="leakyrelu",$=()=>{let F=[n,s],P=(L,M)=>{if(M==="NCHW"&&L.shape.length===1&&L.shape[0]!==1){let B=j({inputs:{x:L},backend:e,attrs:{shape:[L.shape[0],1,1]}});return b.push(B),B}return L};if(S&&F.push(P(a,l)),w&&F.push(P(i,l)),E){let L=e.makeTensorInfo([],"float32",y.createScalarValue(d,"float32"));F.push(L),b.push(L)}return F};if(h.filterHeight===1&&h.filterWidth===1&&h.dilationHeight===1&&h.dilationWidth===1&&h.strideHeight===1&&h.strideWidth===1&&(h.padInfo.type==="SAME"||h.padInfo.type==="VALID"))x=Nf({x:n,filter:s,convInfo:h,backend:e,bias:a,activation:f,preluActivationWeights:i,leakyreluAlpha:d});else if(h.strideWidth<=2&&g==="channelsLast"&&_().getBool("WEBGL_EXP_CONV")){let F=f?bs(f,!0):null,P=new hc(h,S,F,w,E),L=[[h.padInfo.top,h.padInfo.left],[h.strideHeight,h.strideWidth],[h.dilationHeight,h.dilationWidth],[h.inHeight,h.inWidth]],M=$();x=e.runWebGLProgram(P,M,"float32",L)}else if(_().getBool("WEBGL_CONV_IM2COL"))x=vf({x:n,filter:s,convInfo:h,backend:e,bias:a,activation:f,preluActivationWeights:i,leakyreluAlpha:d});else{let F=f?bs(f,!1):null,P=new dc(h,S,F,w,E),L=$();x=e.runWebGLProgram(P,L,"float32")}let D=j({inputs:{x},backend:e,attrs:{shape:h.outShape}});return b.push(x),b.forEach(F=>e.disposeIntermediateTensorInfo(F)),D}var qE={kernelName:qs,backendName:"webgl",kernelFunc:D4};function R4(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,filter:s,bias:a,preluActivationWeights:i}=t,{strides:p,pad:c,dilations:l,dimRoundingMode:u,activation:m,leakyreluAlpha:f}=o,d=[],g=l;g==null&&(g=[1,1]),y.assert(I.eitherStridesOrDilationsAreOne(p,g),()=>`Error in depthwiseConv2d: Either strides or dilations must be 1. Got strides ${p} and dilations '${g}'`);let h=I.computeConv2DInfo(n.shape,s.shape,p,g,c,u,!0),x=_().getBool("WEBGL_PACK_DEPTHWISECONV")&&h.strideWidth<=2&&h.outChannels/h.inChannels===1,b=m?bs(m,x):null,S=[n,s],w=a!=null,E=i!=null,$=m==="leakyrelu";if(w&&S.push(a),E&&S.push(i),$){let L=e.makeTensorInfo([],"float32",y.createScalarValue(f,"float32"));S.push(L),d.push(L)}let D;x?D=new xc(h,w,b,E,$):D=new gc(h,w,b,E,$);let F=[[h.padInfo.top,h.padInfo.left],[h.strideHeight,h.strideWidth],[h.dilationHeight,h.dilationWidth],[h.inHeight,h.inWidth]],P=e.runWebGLProgram(D,S,"float32",F);return d.forEach(L=>e.disposeIntermediateTensorInfo(L)),P}var KE={kernelName:Ks,backendName:"webgl",kernelFunc:R4};var Wf=class{constructor(t,e,o,n){this.sliceDim=t,this.strides=e,this.paramsShape=n,this.variableNames=["x","indices"],this.outputShape=o;let s=wt(o.length),a=`
    int index;`;for(let i=0;i<this.sliceDim;i++)a+=`
          index = round(getIndices(coords[0], ${i}));
          out_of_bounds = out_of_bounds || index < 0;
          out_of_bounds = out_of_bounds || index >= ${this.paramsShape[i]};
          flattenIndex += index * ${this.strides[i]};`;this.userCode=`
         void main() {
          ${s} coords = getOutputCoords();
          int flattenIndex = 0;
          bool out_of_bounds = false;

          ${a}

          setOutput(out_of_bounds ? 0.0 : getX(flattenIndex, coords[1]));
        }
      `}};function F4(r){let{inputs:t,backend:e}=r,{params:o,indices:n}=t,s=n.shape,a=s[s.length-1],i=y.sizeFromShape(o.shape),[p,c,l,u]=I.prepareAndValidate(o,n),m=j({inputs:{x:n},backend:e,attrs:{shape:[c,a]}}),f=j({inputs:{x:o},backend:e,attrs:{shape:[y.sizeFromShape(o.shape)/l,l]}});if(e.shouldExecuteOnCPU([o,n])||o.dtype==="string"){let x=e.readSync(n.dataId),b=e.bufferSync(o),S=b1(x,b,o.dtype,c,a,l,u,o.shape,i);return e.makeTensorInfo(p,o.dtype,S.values)}let d=new Wf(a,u,[c,l],o.shape),g=e.runWebGLProgram(d,[f,m],f.dtype),h=j({inputs:{x:g},backend:e,attrs:{shape:p}});return e.disposeIntermediateTensorInfo(m),e.disposeIntermediateTensorInfo(f),e.disposeIntermediateTensorInfo(g),h}var XE={kernelName:Pa,backendName:"webgl",kernelFunc:F4};var Uf=class{constructor(t,e){this.variableNames=["A","indices"],this.outputShape=e,this.rank=e.length;let o=wt(this.rank),n=_4(t,2);this.userCode=`
      void main() {
        ${o} resRC = getOutputCoords();
        int index = int(getIndices(resRC.x, resRC.z));
        float inBounds = (index >= 0) && (index < ${t[2]}) ? 1.0 : 0.0;
        setOutput(inBounds * getA(${n}));
      }
    `}};function _4(r,t){let e=["resRC.x","resRC.y","resRC.z","resRC.w"],o=[];for(let n=0;n<r.length;n++)n===2?o.push("index"):o.push(`${e[n]}`);return o.join()}function Sy(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,indices:s}=t,{axis:a,batchDims:i}=o,p=y.parseAxisParam(a,n.shape)[0];if(_().get("DEBUG")){let b=e.readSync(s.dataId),S=n.shape[p];for(let w=0;w<b.length;++w){let E=b[w];y.assert(E<=S-1&&E>=0,()=>`GatherV2: the index value ${E} is not in [0, ${S-1}]`)}}let c=I.segment_util.collectGatherOpShapeInfo(n,s,p,i),l=y.sizeFromShape(s.shape),u=[],m=j({inputs:{x:n},backend:e,attrs:{shape:[c.batchSize,c.outerSize,c.dimSize,c.sliceSize]}}),f=j({inputs:{x:s},backend:e,attrs:{shape:[c.batchSize,l/c.batchSize]}});u.push(m),u.push(f);let d=[c.batchSize,c.outerSize,l/c.batchSize,c.sliceSize];if(e.shouldExecuteOnCPU([n,s])||n.dtype==="string"){let b=e.bufferSync(f),S=e.bufferSync(m),w=C1(S,b,d);return u.forEach(E=>e.disposeIntermediateTensorInfo(E)),e.makeTensorInfo(c.outputShape,w.dtype,w.values)}let g=new Uf(m.shape,d),h=e.runWebGLProgram(g,[m,f],m.dtype);u.push(h);let x=j({inputs:{x:h},backend:e,attrs:{shape:c.outputShape}});return u.forEach(b=>e.disposeIntermediateTensorInfo(b)),x}var jE={kernelName:En,backendName:"webgl",kernelFunc:Sy};var O4="return float(a > b);",P4=`
  return vec4(greaterThan(a, b));
`,L4=Ot({opSnippet:O4,packedOpSnippet:P4,cpuKernelImpl:T1,dtype:"bool"}),YE={kernelName:Rs,backendName:"webgl",kernelFunc:L4};var M4="return float(a >= b);",B4=`
  return vec4(greaterThanEqual(a, b));
`,G4=Ot({opSnippet:M4,packedOpSnippet:B4,dtype:"bool",cpuKernelImpl:S1}),ZE={kernelName:So,backendName:"webgl",kernelFunc:G4};function V4(r){let{inputs:t,backend:e}=r,{input:o}=t;return Mf(o,!0,e)}var QE={kernelName:La,backendName:"webgl",kernelFunc:V4};var z4="return float(!isnan(x) && !isinf(x));",W4=lt({opSnippet:z4,dtype:"bool"}),JE={kernelName:wo,backendName:"webgl",kernelFunc:W4};var U4="return float(isinf(x));",H4=lt({opSnippet:U4,dtype:"bool"}),t$={kernelName:No,backendName:"webgl",kernelFunc:H4};var q4="return float(isnan(x));",K4=lt({opSnippet:q4,dtype:"bool"}),e$={kernelName:vo,backendName:"webgl",kernelFunc:K4};var X4="return float(a < b);",j4=`
  return vec4(lessThan(a, b));
`,Y4=Ot({opSnippet:X4,packedOpSnippet:j4,cpuKernelImpl:w1,dtype:"bool"}),r$={kernelName:Fs,backendName:"webgl",kernelFunc:Y4};var Z4="return float(a <= b);",Q4=`
  return vec4(lessThanEqual(a, b));
`,J4=Ot({opSnippet:Z4,packedOpSnippet:Q4,cpuKernelImpl:N1,dtype:"bool"}),o$={kernelName:_s,backendName:"webgl",kernelFunc:J4};function tW(r){let{backend:t,attrs:e}=r,{start:o,stop:n,num:s}=e,a=v1(o,n,s);return t.makeTensorInfo([a.length],"float32",a)}var n$={kernelName:Ba,backendName:"webgl",kernelFunc:tW};var eW=Pr+`
  return x < 0.0 ? 0./0. : log(x);
`,rW=`
  vec4 result = log(x);
  bvec4 isNaN = isnan(x);
  result.r = isNaN.r ? x.r : (x.r < 0.0 ? 0./0. : result.r);
  result.g = isNaN.g ? x.g : (x.g < 0.0 ? 0./0. : result.g);
  result.b = isNaN.b ? x.b : (x.b < 0.0 ? 0./0. : result.b);
  result.a = isNaN.a ? x.a : (x.a < 0.0 ? 0./0. : result.a);
  return result;
`,oW=lt({opSnippet:eW,packedOpSnippet:rW,cpuKernelImpl:I1}),s$={kernelName:"Log",backendName:"webgl",kernelFunc:oW};var nW=Pr+`
  return log(1.0 + x);
`,sW=lt({opSnippet:nW}),a$={kernelName:Io,backendName:"webgl",kernelFunc:sW};var aW="return float(a >= 1.0 && b >= 1.0);",iW=`
  return vec4(
    vec4(greaterThanEqual(a, vec4(1.0))) *
    vec4(greaterThanEqual(b, vec4(1.0))));
`,pW=Ot({opSnippet:aW,packedOpSnippet:iW,dtype:"bool"}),i$={kernelName:Ps,backendName:"webgl",kernelFunc:pW};var cW="return float(!(x >= 1.0));",lW=lt({opSnippet:cW}),p$={kernelName:Ls,backendName:"webgl",kernelFunc:lW};var uW="return float(a >= 1.0 || b >= 1.0);",mW=`
  return min(
    vec4(greaterThanEqual(a, vec4(1.0))) +
    vec4(greaterThanEqual(b, vec4(1.0))),
    vec4(1.0));
`,fW=Ot({opSnippet:uW,packedOpSnippet:mW,dtype:"bool"}),c$={kernelName:Ms,backendName:"webgl",kernelFunc:fW};var Hf=class{constructor(t,e,o,n,s){this.variableNames=["x"],this.outputShape=[];let a=e,i=t[3]-1;this.outputShape=t;let p,c=`float(${o}) + float(${n}) * sum`;s===.5?p=`inversesqrt(${c})`:s===1?p=`1.0/(${c})`:p=`exp(log(${c}) * float(-${s}));`,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int r = coords[1];
        int c = coords[2];
        int d = coords[3];
        float x = getX(b, r, c, d);
        float sum = 0.0;
        for (int j = -${a}; j <= ${a}; j++) {
          int idx = d + j;
          if (idx >= 0 && idx <=  ${i}) {
            float z = getX(b, r, c, idx);
            sum += z * z;
          }
        }
        float val = x * ${p};
        setOutput(val);
      }
    `}};var qf=class{constructor(t,e,o,n,s){this.variableNames=["x"],this.outputShape=[],this.packedInputs=!0,this.packedOutput=!0;let a=e,i=t[3]-1;this.outputShape=t;let p,c=`float(${o}) + float(${n}) * sum`;s===.5?p=`inversesqrt(${c})`:s===1?p=`1.0/(${c})`:p=`exp(log(${c}) * float(-${s}));`,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords.x;
        int r = coords.y;
        int c = coords.z;
        int d = coords.w;

        bool hasNextCol = d < ${this.outputShape[3]};
        bool hasNextRow = c < ${this.outputShape[2]};

        vec4 sum = vec4(0.);
        vec4 xFragAtOutputCoords = getX(b, r, c, d);

        vec4 xAtOutputCoords = vec4(
          getChannel(xFragAtOutputCoords, vec2(c, d)),
          hasNextCol ?
            getChannel(xFragAtOutputCoords, vec2(c, d + 1)) : 0.0,
          hasNextRow ?
            getChannel(xFragAtOutputCoords , vec2(c + 1, d)) : 0.0,
          (hasNextRow && hasNextCol) ?
            getChannel(xFragAtOutputCoords, vec2(c + 1, d + 1)) : 0.0
        );

        int firstChannel = d - ${a};
        vec2 cache = vec2(0.);
        if(firstChannel >= 0){
          vec4 firstChannelFrag = getX(b, r, c, firstChannel);
          cache.x = getChannel(firstChannelFrag, vec2(c, firstChannel));
            if(hasNextRow){
              cache.y = getChannel(firstChannelFrag, vec2(c + 1, firstChannel));
            }
        }

        ivec2 depth = ivec2(d, d + 1);
        for (int j = - ${a}; j <= ${a}; j++) {
          ivec2 idx = depth + j;
          bvec2 aboveLowerBound = greaterThanEqual(idx, ivec2(0));
          bvec2 belowUpperBound = lessThanEqual(idx, ivec2(${i}));

          bool depthInRange = aboveLowerBound.x && belowUpperBound.x;
          bool depthPlusOneInRange = aboveLowerBound.y && belowUpperBound.y;

          if(depthInRange || depthPlusOneInRange){
            vec4 z = vec4(0.);
            vec4 xFragAtCurrentDepth;
            z.xz = cache.xy;
            if(depthPlusOneInRange && hasNextCol){
              xFragAtCurrentDepth = idx.y != d ?
                getX(b, r, c, idx.y) : xFragAtOutputCoords;
              z.y = getChannel(xFragAtCurrentDepth, vec2(c, idx.y));
              if(hasNextRow){
                z.w = getChannel(xFragAtCurrentDepth, vec2(c + 1, idx.y));
              }
            }
            cache.xy = z.yw;
            sum += z * z;
          }
        }
        vec4 result = xAtOutputCoords * ${p};
        setOutput(result);
      }
    `}};var dW=r=>{let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{depthRadius:s,bias:a,alpha:i,beta:p}=o,c=_().getBool("WEBGL_PACK_NORMALIZATION")?new qf(n.shape,s,a,i,p):new Hf(n.shape,s,a,i,p);return e.runWebGLProgram(c,[n],n.dtype)},l$={kernelName:"LRN",backendName:"webgl",kernelFunc:dW};var Kf=class{constructor(t,e,o,n,s){this.variableNames=["inputImage","outputImage","dy"],this.outputShape=[],this.outputShape=t,this.depth=t[3],this.depthRadius=e,this.bias=o,this.alpha=n,this.beta=s,this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int r = coords[1];
        int c = coords[2];

        float result = 0.0;
        for (int d = 0; d < ${this.depth}; ++d) {
          int depthBegin = int(max(0.0, float(d - ${e})));
          int depthEnd = int(min(float(${this.depth}),
              float(d + ${e} + 1)));

          const int MIN_DEPTH_BEGIN = 0;
          const int MAX_DEPTH_END = ${this.depth};

          float norm = 0.0;
          for (int k = MIN_DEPTH_BEGIN; k < MAX_DEPTH_END; ++k) {
            if (k < depthBegin){
              continue;
            }
            else if (k >= depthBegin && k < depthEnd) {
              norm += getInputImage(b, r, c, k) * getInputImage(b, r, c, k);
            }
            else {
              break;
            }
          }

          norm = float(${n}) * norm + float(${o});

          for(int k = MIN_DEPTH_BEGIN; k < MAX_DEPTH_END; ++k){
            if (k < depthBegin){
              continue;
            }
            else if (k >= depthBegin && k < depthEnd){
              float dyi = -2.0 * float(${n})
                * float(${s})
                * getInputImage(b ,r ,c, k) * getOutputImage(b, r, c, d)
                / norm;
              if (k == d) {
                dyi += pow(norm, -1.0 * ${s});
              }
              if (k == coords[3]) {
                dyi *= getDy(b, r, c, d);
                result += dyi;
              }
            }
            else {
              break;
            }
          }
      }
      setOutput(result);
      }
    `}};var hW=r=>{let{inputs:t,backend:e,attrs:o}=r,{x:n,y:s,dy:a}=t,{depthRadius:i,bias:p,alpha:c,beta:l}=o,u=new Kf(n.shape,i,p,c,l);return e.runWebGLProgram(u,[n,s,a],n.dtype)},u$={kernelName:Va,backendName:"webgl",kernelFunc:hW};function m$(r,t,e,o){let n=y.sizeFromShape(t),a=y.sizeFromShape(r.shape)/n,i=j({inputs:{x:r},attrs:{shape:[a,n]},backend:o}),p=ir(i,r.dtype,"max",o),c=j({inputs:{x:p},attrs:{shape:e},backend:o});return o.disposeIntermediateTensorInfo(i),o.disposeIntermediateTensorInfo(p),c}function wy(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{reductionIndices:s,keepDims:a}=o,i=n.shape.length,p=y.parseAxisParam(s,n.shape),c=p,l=I.getAxesPermutation(c,i),u=l!=null,m=e.shouldExecuteOnCPU([n]),f=n;if(u){if(m){let S=e.texData.get(f.dataId).values,w=new Array(i);for(let D=0;D<w.length;D++)w[D]=n.shape[l[D]];let E=mp(S,n.shape,n.dtype,l,w);f=e.makeTensorInfo(w,n.dtype);let $=e.texData.get(f.dataId);$.values=E}else f=ma(n,l,e);c=I.getInnerMostAxes(c.length,i)}I.assertAxesAreInnerMostDims("max",c,i);let[d,g]=I.computeOutAndReduceShapes(f.shape,c),h=d;a&&(h=I.expandShapeToKeepDim(d,p));let x;if(m){let S=e.texData.get(f.dataId).values,w=k1(S,y.sizeFromShape(g),h,n.dtype);x=e.makeTensorInfo(h,n.dtype);let E=e.texData.get(x.dataId);E.values=w}else x=m$(f,g,h,e);return u&&e.disposeIntermediateTensorInfo(f),x}var f$={kernelName:"Max",backendName:"webgl",kernelFunc:wy};var gW=uc+`
  return max(a, b);
`,xW=`
  vec4 result = vec4(max(a, b));
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+sn+`
  return result;
`,yW=Ot({opSnippet:gW,packedOpSnippet:xW,cpuKernelImpl:E1}),d$={kernelName:ko,backendName:"webgl",kernelFunc:yW};function bW(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t;nn(n,"maxPool");let{filterSize:s,strides:a,pad:i,dimRoundingMode:p}=o,c=1;y.assert(I.eitherStridesOrDilationsAreOne(a,c),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${a} and dilations '${c}'`);let l=I.computePool2DInfo(n.shape,s,a,c,i,p);if(l.filterWidth===1&&l.filterHeight===1&&y.arraysEqual(l.inShape,l.outShape))return oe({inputs:{x:n},backend:e});let u=new to(l,"max",!1);return e.runWebGLProgram(u,[n],n.dtype)}var h$={kernelName:An,backendName:"webgl",kernelFunc:bW};function CW(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{filterSize:s,strides:a,pad:i,dataFormat:p,dimRoundingMode:c}=o,l=[1,1,1],u=I.computePool3DInfo(n.shape,s,a,l,i,c,p),m=new fa(u,"max",!1);return e.runWebGLProgram(m,[n],n.dtype)}var g$={kernelName:Dn,backendName:"webgl",kernelFunc:CW};var Xf=class{constructor(t){this.variableNames=["dy","maxPos"],this.outputShape=t.inShape;let e=t.strideHeight,o=t.strideWidth,n=t.dilationHeight,s=t.effectiveFilterHeight,a=t.effectiveFilterWidth,i=s-1-t.padInfo.top,p=a-1-t.padInfo.left,c=s*a-1;this.userCode=`
      const ivec2 pads = ivec2(${i}, ${p});

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];

        ivec2 dyRCCorner = coords.yz - pads;
        int dyRCorner = dyRCCorner.x;
        int dyCCorner = dyRCCorner.y;

        // Convolve dy(?, ?, d) with pos mask(:, :, d) to get dx(xR, xC, d).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;
        for (int wR = 0; wR < ${s};
          wR += ${n}) {
          float dyR = float(dyRCorner + wR) / ${e}.0;

          if (dyR < 0.0 || dyR >= ${t.outHeight}.0 || fract(dyR) > 0.0) {
            continue;
          }
          int idyR = int(dyR);

          for (int wC = 0; wC < ${a}; wC++) {
            float dyC = float(dyCCorner + wC) / ${o}.0;

            if (dyC < 0.0 || dyC >= ${t.outWidth}.0 ||
                fract(dyC) > 0.0) {
              continue;
            }
            int idyC = int(dyC);

            float dyValue = getDy(b, idyR, idyC, d);
            int maxPosValue = ${c} - int(getMaxPos(b, idyR, idyC, d));

            // Get the current value, check it against the value from the
            // position matrix.
            int curPosValue = wR * ${a} + wC;
            float mask = float(maxPosValue == curPosValue ? 1.0 : 0.0);

            dotProd += dyValue * mask;
          }
        }
        setOutput(dotProd);
      }
    `}},jf=class{constructor(t){this.variableNames=["dy","maxPos"],this.outputShape=t.inShape;let e=t.strideDepth,o=t.strideHeight,n=t.strideWidth,s=t.dilationDepth,a=t.dilationHeight,i=t.dilationWidth,p=t.effectiveFilterDepth,c=t.effectiveFilterHeight,l=t.effectiveFilterWidth,u=p-1-t.padInfo.front,m=c-1-t.padInfo.top,f=l-1-t.padInfo.left,d=p*c*l-1;this.userCode=`
      const ivec3 pads = ivec3(${u}, ${m}, ${f});

      void main() {
        ivec5 coords = getOutputCoords();
        int batch = coords.x;
        int ch = coords.u;

        ivec3 dyCorner = ivec3(coords.y, coords.z, coords.w) - pads;
        int dyDCorner = dyCorner.x;
        int dyRCorner = dyCorner.y;
        int dyCCorner = dyCorner.z;

        // Convolve dy(?, ?, ?, ch) with pos mask(:, :, :, d) to get
        // dx(xD, xR, xC, ch).
        // ? = to be determined. : = across all values in that axis.
        float dotProd = 0.0;

        for (int wD = 0; wD < ${p};
           wD += ${s}) {
          float dyD = float(dyDCorner + wD) / ${e}.0;

          if (dyD < 0.0 || dyD >= ${t.outDepth}.0 || fract(dyD) > 0.0) {
            continue;
          }
          int idyD = int(dyD);

          for (int wR = 0; wR < ${c};
              wR += ${a}) {
            float dyR = float(dyRCorner + wR) / ${o}.0;

            if (dyR < 0.0 || dyR >= ${t.outHeight}.0 ||
                fract(dyR) > 0.0) {
              continue;
            }
            int idyR = int(dyR);

            for (int wC = 0; wC < ${l};
                wC += ${i}) {
              float dyC = float(dyCCorner + wC) / ${n}.0;

              if (dyC < 0.0 || dyC >= ${t.outWidth}.0 ||
                  fract(dyC) > 0.0) {
                continue;
              }
              int idyC = int(dyC);

              float dyValue = getDy(batch, idyD, idyR, idyC, ch);
              int maxPosValue = ${d} -
                  int(getMaxPos(batch, idyD, idyR, idyC, ch));

              // Get the current value, check it against the value from the
              // position matrix.
              int curPosValue =
                  wD * ${c} * ${l} +
                  wR * ${l} + wC;
              float mask = float(maxPosValue == curPosValue ? 1.0 : 0.0);

              dotProd += dyValue * mask;
            }
          }
        }
        setOutput(dotProd);
      }
    `}};function TW(r){let{inputs:t,backend:e,attrs:o}=r,{dy:n,input:s}=t,a=s,{filterSize:i,strides:p,pad:c,dimRoundingMode:l}=o,u=[1,1,1],m=I.computePool3DInfo(a.shape,i,p,u,c,l),f=new fa(m,"max",!0),d=e.runWebGLProgram(f,[a],a.dtype),g=new jf(m),h=e.runWebGLProgram(g,[n,d],a.dtype);return e.disposeIntermediateTensorInfo(d),h}var x$={kernelName:Ua,backendName:"webgl",kernelFunc:TW};function SW(r){let{inputs:t,backend:e,attrs:o}=r,{dy:n,input:s,output:a}=t,i=s;nn([s,a],"maxPoolGrad");let{filterSize:p,strides:c,pad:l,dimRoundingMode:u}=o,m=I.computePool2DInfo(i.shape,p,c,1,l,u),f=!0,d=new to(m,"max",f),g=e.runWebGLProgram(d,[i],i.dtype),h=new Xf(m),x=e.runWebGLProgram(h,[n,g],i.dtype);return e.disposeIntermediateTensorInfo(g),x}var y$={kernelName:Wa,backendName:"webgl",kernelFunc:SW};function b$(r,t,e,o){let n=new to(e,"max",!1),s=o.runWebGLProgram(n,[r],"float32");n=new to(e,"max",!0,!0,t);let a=o.runWebGLProgram(n,[r],"float32");return[s,a]}var C$={kernelName:Ha,backendName:"webgl",kernelFunc:({inputs:r,attrs:t,backend:e})=>{let{x:o}=r,{filterSize:n,strides:s,pad:a,includeBatchInIndex:i}=t,p=e;y.assert(o.shape.length===4,()=>`Error in maxPool: input must be rank 4 but got rank ${o.shape.length}.`);let c=[1,1];y.assert(I.eitherStridesOrDilationsAreOne(s,c),()=>`Error in maxPool: Either strides or dilations must be 1. Got strides ${s} and dilations '${c}'`);let l=I.computePool2DInfo(o.shape,n,s,c,a),[u,m]=b$(o,i,l,p);return[u,m]}};function T$(r,t,e,o){let n=y.sizeFromShape(t),a=y.sizeFromShape(r.shape)/n,i=j({inputs:{x:r},attrs:{shape:[a,n]},backend:o}),p=ir(i,"float32","mean",o),c=j({inputs:{x:p},attrs:{shape:e},backend:o});return o.disposeIntermediateTensorInfo(i),o.disposeIntermediateTensorInfo(p),c}var S$={kernelName:Rn,backendName:"webgl",kernelFunc:({inputs:r,attrs:t,backend:e})=>{let{x:o}=r,{keepDims:n,axis:s}=t,a=e,i=o.shape.length,p=y.parseAxisParam(s,o.shape),c=p,l=I.getAxesPermutation(c,i),u=l!=null,m=a.shouldExecuteOnCPU([o]),f=[],d=o;if(u){if(m){let w=a.texData.get(d.dataId).values,E=new Array(i);for(let F=0;F<E.length;F++)E[F]=o.shape[l[F]];let $=mp(w,o.shape,o.dtype,l,E);d=a.makeTensorInfo(E,o.dtype);let D=a.texData.get(d.dataId);D.values=$}else d=ma(o,l,a);f.push(d),c=I.getInnerMostAxes(c.length,i)}I.assertAxesAreInnerMostDims("sum",c,i);let[g,h]=I.computeOutAndReduceShapes(d.shape,c),x=g;n&&(x=I.expandShapeToKeepDim(g,p));let b=T$(d,h,x,a);for(let S of f)a.disposeIntermediateTensorInfo(S);return b}};function wW(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s,keepDims:a}=o,i=n.shape.length,p=y.parseAxisParam(s,n.shape),c=p,l=I.getAxesPermutation(c,i),u=n;l!=null&&(u=Ht({inputs:{x:n},backend:e,attrs:{perm:l}}),c=I.getInnerMostAxes(c.length,n.shape.length)),I.assertAxesAreInnerMostDims("min",c,i);let[m,f]=I.computeOutAndReduceShapes(u.shape,c),d=y.sizeFromShape(f),g=j({inputs:{x:u},backend:e,attrs:{shape:[-1,d]}}),h=ir(g,g.dtype,"min",e),x;if(a){let b=I.expandShapeToKeepDim(m,p);x=j({inputs:{x:h},backend:e,attrs:{shape:b}})}else x=j({inputs:{x:h},backend:e,attrs:{shape:m}});return e.disposeIntermediateTensorInfo(g),e.disposeIntermediateTensorInfo(h),l!=null&&e.disposeIntermediateTensorInfo(u),x}var w$={kernelName:"Min",backendName:"webgl",kernelFunc:wW};var NW=uc+`
  return min(a, b);
`,vW=`
  vec4 result = vec4(min(a, b));
  bvec4 isNaNA = isnan(a);
  bvec4 isNaNB = isnan(b);
  bvec4 isNaN = bvec4(isNaNA.x || isNaNB.x, isNaNA.y || isNaNB.y, isNaNA.z || isNaNB.z, isNaNA.w || isNaNB.w);
  `+sn+`
  return result;
`,IW=Ot({opSnippet:NW,packedOpSnippet:vW,cpuKernelImpl:$1}),N$={kernelName:Eo,backendName:"webgl",kernelFunc:IW};var Yf=class{constructor(t,e,o){this.variableNames=["x"],this.outputShape=e.map((l,u)=>l[0]+t[u]+l[1]);let n=t.length,s=wt(n),a=e.map(l=>l[0]).join(","),i=e.map((l,u)=>l[0]+t[u]).join(","),p=["coords[0]","coords[1]","coords[2]","coords[3]"].slice(0,n),c=o==="reflect"?0:1;if(n===1){this.userCode=`
        int start = ${a};
        int end = ${i};

        void main() {
          int outC = getOutputCoords();
          if (outC < start) {
            outC = start * 2 - outC - ${c};
          } else if(outC >= end) {
            outC = (end - 1) * 2 - outC + ${c};
          }
          setOutput(getX(outC - start));
        }
      `;return}this.userCode=`
      ${s} start = ${s}(${a});
      ${s} end = ${s}(${i});

      void main() {
        ${s} outC = getOutputCoords();
        for (int i = 0; i < ${n}; i++) {
          if (outC[i] < start[i]) {
            outC[i] = start[i] * 2 - outC[i] - ${c};
          } else if(outC[i] >= end[i]) {
            outC[i] = (end[i] - 1) * 2 - outC[i] + ${c};
          }
        }
        ${s} coords = outC - start;
        setOutput(getX(${p}));
      }
    `}};var Zf=class{constructor(t,e,o){this.variableNames=["x"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=e.map((d,g)=>d[0]+t[g]+d[1]);let n=t.length,s=wt(n),a=e.map(d=>d[0]).join(","),i=e.map((d,g)=>d[0]+t[g]).join(","),p=re("rc",n),c=re("source",n),l=`${p[n-1]} < ${this.outputShape[n-1]}`,u=n===1?"source":`vec2(${c.slice(-2).join()})`,m=o==="reflect"?0:1,f="";if(n===1){let d=`
        ${s} source = rc;
        if (source < start) {
          source = start * 2 - source - ${m};
        } else if (source >= end) {
          source = (end - 1) * 2 - source + ${m};
        }
        source -= start;
      `;f=`
        ${s} rc = outputLoc;
        ${d}
        result[0] = getChannel(getX(${c.join()}), ${u});
        ${p[n-1]} += 1;
        if(${l}) {
          ${d}
          result[1] = getChannel(getX(${c.join()}), ${u});
        }
      `}else{let d=`
        ${s} source = rc;
        ${s} lt = ${s}(lessThan(source, start));
        ${s} gte = ${s}(greaterThanEqual(source, end));
        ${s} orig = 1 - (lt + gte);
        source = orig * source +
                lt * (start * 2 - source - ${m}) +
                gte * ((end - 1) * 2 - source + ${m});
        source -= start;
      `;f=`
        ${s} rc = outputLoc;
        ${d}
        result[0] = getChannel(getX(${c.join()}), ${u});
        ${p[n-1]} += 1;
        if(${l}) {
          ${d}
          result[1] = getChannel(getX(${c.join()}), ${u});
        }
        rc = outputLoc;
        ${p[n-2]} += 1;
        if(${p[n-2]} < ${this.outputShape[n-2]}) {
          ${d}
          result[2] = getChannel(getX(${c.join()}), ${u});
          ${p[n-1]} += 1;
          if(${l}) {
            ${d}
            result[3] = getChannel(getX(${c.join()}), ${u});
          }
        }
      `}this.userCode=`
      const ${s} start = ${s}(${a});
      const ${s} end = ${s}(${i});

      void main() {
        ${s} outputLoc = getOutputCoords();
        vec4 result = vec4(0.);
        ${f}
        setOutput(result);
      }
    `}};var kW=({inputs:r,backend:t,attrs:e})=>{let{x:o}=r,{paddings:n,mode:s}=e,a=_().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new Zf(o.shape,n,s):new Yf(o.shape,n,s);return t.runWebGLProgram(a,[o],o.dtype)},v$={kernelName:Fn,backendName:"webgl",kernelFunc:kW};var EW=`if (b == 0.0) return NAN;
  return mod(a, b);`,$W=`
  vec4 result = mod(a, b);
  bvec4 isNaN = equal(b, vec4(0.0));
  `+sn+`
  return result;
`,AW=Ot({opSnippet:EW,packedOpSnippet:$W}),I$={kernelName:"Mod",backendName:"webgl",kernelFunc:AW};var Qf=class{constructor(t,e,o){this.variableNames=["probs"],this.customUniforms=[{name:"seed",type:"float"}],this.outputShape=[t,o],this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];

        float r = random(seed);
        float cdf = 0.0;

        for (int i = 0; i < ${e-1}; i++) {
          cdf += getProbs(batch, i);

          if (r < cdf) {
            setOutput(float(i));
            return;
          }
        }

        // If no other event happened, last event happened.
        setOutput(float(${e-1}));
      }
    `}};var DW=`
if (a == b) {
  return 1.0;
};
return a / b;`,RW=`
  // vec4 one = vec4(equal(a, b));
  // return one + (vec4(1.0) - one) * a / b;
  vec4 result = a / b;
  if(a.x == b.x) {
    result.x = 1.;
  }
  if(a.y == b.y) {
    result.y = 1.;
  }
  if(a.z == b.z) {
    result.z = 1.;
  }
  if(a.w == b.w) {
    result.w = 1.;
  }

  return result;
`,Ny=Ot({opSnippet:DW,packedOpSnippet:RW,checkOutOfBounds:!0}),k$={kernelName:yo,backendName:"webgl",kernelFunc:Ny};var E$="return a - b;",vy=Ot({opSnippet:E$,packedOpSnippet:E$,supportsComplex:!0,cpuKernelImpl:X1}),$$={kernelName:"Sub",backendName:"webgl",kernelFunc:vy};function Iy(r){let{inputs:t,backend:e,attrs:o}=r,{logits:n}=t,{dim:s}=o,a=y.parseAxisParam([s],n.shape),i=wy({inputs:{x:n},backend:e,attrs:{reductionIndices:a,keepDims:!1}}),p=I.expandShapeToKeepDim(i.shape,a),c=j({inputs:{x:i},backend:e,attrs:{shape:p}}),l=vy({inputs:{a:n,b:c},backend:e}),u=Cy({inputs:{x:l},backend:e}),m=dp({inputs:{x:u},backend:e,attrs:{axis:a,keepDims:!1}}),f=j({inputs:{x:m},backend:e,attrs:{shape:p}}),d=Ny({inputs:{a:u,b:f},backend:e});return e.disposeIntermediateTensorInfo(i),e.disposeIntermediateTensorInfo(c),e.disposeIntermediateTensorInfo(l),e.disposeIntermediateTensorInfo(u),e.disposeIntermediateTensorInfo(m),e.disposeIntermediateTensorInfo(f),d}var A$={kernelName:Xn,backendName:"webgl",kernelFunc:Iy};function FW(r){let{inputs:t,backend:e,attrs:o}=r,{logits:n}=t,{numSamples:s,seed:a,normalized:i}=o,p=i?n:Iy({inputs:{logits:n},backend:e,attrs:{dim:n.shape.length-1}}),c=p.shape[0],l=p.shape[1],u=new Qf(c,l,s),m=[[a]],f=e.runWebGLProgram(u,[p],"int32",m);return i||e.disposeIntermediateTensorInfo(p),f}var D$={kernelName:Ka,backendName:"webgl",kernelFunc:FW};var _W=ue+`
  return -x;
`,OW=`
  vec4 result = -x;
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`;function PW(r){let{inputs:t,backend:e}=r,{x:o}=t;if(e.shouldExecuteOnCPU([o])){let s=e.texData.get(o.dataId),[a,i]=D1(s.values,o.shape,o.dtype);return e.makeTensorInfo(i,o.dtype,a)}let n;return _().getBool("WEBGL_PACK_UNARY_OPERATIONS")?n=new Cr(o.shape,OW):n=new Le(o.shape,_W),e.runWebGLProgram(n,[o],o.dtype)}var R$={kernelName:"Neg",backendName:"webgl",kernelFunc:PW};var LW=we.nonMaxSuppressionV3Impl;function MW(r){I.warn("tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead");let{inputs:t,backend:e,attrs:o}=r,{boxes:n,scores:s}=t,{maxOutputSize:a,iouThreshold:i,scoreThreshold:p}=o,c=e.readSync(n.dataId),l=e.readSync(s.dataId),{selectedIndices:u}=LW(c,l,a,i,p);return e.makeTensorInfo([u.length],"int32",new Int32Array(u))}var F$={kernelName:ja,backendName:"webgl",kernelFunc:MW};var BW=we.nonMaxSuppressionV4Impl;function GW(r){I.warn("tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead");let{inputs:t,backend:e,attrs:o}=r,{boxes:n,scores:s}=t,{maxOutputSize:a,iouThreshold:i,scoreThreshold:p,padToMaxOutputSize:c}=o,l=e.readSync(n.dataId),u=e.readSync(s.dataId),{selectedIndices:m,validOutputs:f}=BW(l,u,a,i,p,c);return[e.makeTensorInfo([m.length],"int32",new Int32Array(m)),e.makeTensorInfo([],"int32",new Int32Array([f]))]}var _$={kernelName:Ya,backendName:"webgl",kernelFunc:GW};var VW=we.nonMaxSuppressionV5Impl;function zW(r){I.warn("tf.nonMaxSuppression() in webgl locks the UI thread. Call tf.nonMaxSuppressionAsync() instead");let{inputs:t,backend:e,attrs:o}=r,{boxes:n,scores:s}=t,{maxOutputSize:a,iouThreshold:i,scoreThreshold:p,softNmsSigma:c}=o,l=e.readSync(n.dataId),u=e.readSync(s.dataId),m=a,f=i,d=p,g=c,{selectedIndices:h,selectedScores:x}=VW(l,u,m,f,d,g);return[e.makeTensorInfo([h.length],"int32",new Int32Array(h)),e.makeTensorInfo([x.length],"float32",new Float32Array(x))]}var O$={kernelName:Za,backendName:"webgl",kernelFunc:zW};var Jf=class{constructor(t,e,o,n){this.variableNames=["indices"],this.outputShape=[t,e],this.userCode=`
      void main() {
        ivec2 coords = getOutputCoords();
        int index = round(getIndices(coords.x));
        setOutput(mix(float(${n}), float(${o}),
                      float(index == coords.y)));
      }
    `}};var WW=r=>{let{inputs:t,backend:e,attrs:o}=r,{indices:n}=t,{dtype:s,depth:a,onValue:i,offValue:p}=o,c=y.sizeFromShape(n.shape),l=new Jf(c,a,i,p),u=j({inputs:{x:n},backend:e,attrs:{shape:[c]}}),m=e.runWebGLProgram(l,[u],s);e.disposeIntermediateTensorInfo(u);let f=[...n.shape,a],d=j({inputs:{x:m},backend:e,attrs:{shape:f}});return e.disposeIntermediateTensorInfo(m),d},P$={kernelName:On,backendName:"webgl",kernelFunc:WW};function nu(r){let{inputs:t,backend:e}=r,{x:o}=t;if(o.dtype==="complex64"){let n=Cs({inputs:{input:o},backend:e}),s=nu({inputs:{x:n},backend:e}),a=gp({inputs:{input:o},backend:e}),i=nu({inputs:{x:a},backend:e}),p=Ze({inputs:{real:s,imag:i},backend:e});return e.disposeIntermediateTensorInfo(n),e.disposeIntermediateTensorInfo(s),e.disposeIntermediateTensorInfo(a),e.disposeIntermediateTensorInfo(i),p}else return Ts({attrs:{shape:o.shape,dtype:o.dtype,value:o.dtype==="string"?"":0},backend:e})}var L$={kernelName:Zn,backendName:"webgl",kernelFunc:nu};function M$(r){let{inputs:t,backend:e}=r,{x:o}=t;if(o.dtype==="string")throw new Error("onesLike is not supported under string dtype");if(o.dtype==="complex64"){let n=Cs({inputs:{input:o},backend:e}),s=M$({inputs:{x:n},backend:e}),a=gp({inputs:{input:o},backend:e}),i=nu({inputs:{x:a},backend:e}),p=Ze({inputs:{real:s,imag:i},backend:e});return e.disposeIntermediateTensorInfo(n),e.disposeIntermediateTensorInfo(s),e.disposeIntermediateTensorInfo(a),e.disposeIntermediateTensorInfo(i),p}else return Ts({attrs:{shape:o.shape,dtype:o.dtype,value:1},backend:e})}var B$={kernelName:_n,backendName:"webgl",kernelFunc:M$};function UW(r){let{inputs:t,backend:e,attrs:o}=r,{axis:n}=o;if(t.length===1)return Lf({inputs:{input:t[0]},backend:e,attrs:{dim:n}});let s=t[0].shape,a=t[0].dtype;t.forEach(l=>{y.assertShapesMatch(s,l.shape,"All tensors passed to stack must have matching shapes"),y.assert(a===l.dtype,()=>"All tensors passed to stack must have matching dtypes")});let i=[],p=t.map(l=>{let u=Lf({inputs:{input:l},backend:e,attrs:{dim:n}});return i.push(u),u}),c=by({inputs:p,backend:e,attrs:{axis:n}});return i.forEach(l=>e.disposeIntermediateTensorInfo(l)),c}var G$={kernelName:Pn,backendName:"webgl",kernelFunc:UW};var td=class{constructor(t,e,o){this.variableNames=["x"],this.customUniforms=[{name:"value",type:"float"}],this.outputShape=e.map((c,l)=>c[0]+t[l]+c[1]);let n=t.length,s=wt(n),a=e.map(c=>c[0]).join(","),i=e.map((c,l)=>c[0]+t[l]).join(","),p=["coords[0]","coords[1]","coords[2]","coords[3]"].slice(0,n);if(n===1){this.userCode=`
        int start = ${a};
        int end = ${i};

        void main() {
          int outC = getOutputCoords();
          if (outC < start || outC >= end) {
            setOutput(value);
          } else {
            setOutput(getX(outC - start));
          }
        }
      `;return}this.userCode=`
      ${s} start = ${s}(${a});
      ${s} end = ${s}(${i});

      void main() {
        ${s} outC = getOutputCoords();
        if (any(lessThan(outC, start)) || any(greaterThanEqual(outC, end))) {
          setOutput(value);
        } else {
          ${s} coords = outC - start;
          setOutput(getX(${p}));
        }
      }
    `}};var ed=class{constructor(t,e,o){this.variableNames=["x"],this.packedInputs=!0,this.packedOutput=!0,this.customUniforms=[{name:"value",type:"float"}],this.outputShape=e.map((g,h)=>g[0]+t[h]+g[1]);let n=t.length,s=wt(n),a=e.map(g=>g[0]).join(","),i=e.map((g,h)=>g[0]+t[h]).join(","),p=re("rc",n),c=re("source",n),l=`${p[n-1]} < ${this.outputShape[n-1]}`,u=n===1?"source":`vec2(${c.slice(-2).join()})`,m=[`${s} rc = outputLoc;`,`${p[n-1]} += 1;
       if(${l}) {
      `,n===1?"":`}
       rc = outputLoc;
       ${p[n-2]} += 1;
       if(${p[n-2]} < ${this.outputShape[n-2]}) {`,n===1?"":`  ${p[n-1]} += 1;
         if(${l}) {`],f=n===1?"rc < start || rc >= end":"any(lessThan(rc, start)) || any(greaterThanEqual(rc, end))",d="";for(let g=0,h=n===1?2:4;g<h;g++)d+=`
        ${m[g]}
        if (${f}) {
          result[${g}] = float(value);
        } else {
          ${s} source = rc - start;
          result[${g}] = getChannel(getX(${c.join()}), ${u});
        }
      `;d+=n===1?"} ":"}}",this.userCode=`
      const ${s} start = ${s}(${a});
      const ${s} end = ${s}(${i});

      void main() {
        ${s} outputLoc = getOutputCoords();
        vec4 result = vec4(0.);
        ${d}
        setOutput(result);
      }
    `}};var ky=r=>{let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{paddings:s,constantValue:a}=o;if(y.sizeFromShape(n.shape)===0){let c=s.map((l,u)=>l[0]+n.shape[u]+l[1]);return Ts({backend:e,attrs:{shape:c,value:a,dtype:n.dtype}})}let i=_().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new ed(n.shape,s,a):new td(n.shape,s,a),p=[[a]];return e.runWebGLProgram(i,[n],n.dtype,p)},V$={kernelName:Ln,backendName:"webgl",kernelFunc:ky};var HW=`
  if(a < 0.0 && floor(b) < b){
    return NAN;
  }
  if (b == 0.0) {
    return 1.0;
  }
  return (round(mod(b, 2.0)) != 1) ?
      pow(abs(a), b) : sign(a) * pow(abs(a), b);
`,qW=`
  // isModRound1 has 1 for components with round(mod(b, 2.0)) == 1, 0 otherwise.
  vec4 isModRound1 = vec4(equal(round(mod(b, 2.0)), ivec4(1)));
  vec4 multiplier = sign(a) * isModRound1 + (vec4(1.0) - isModRound1);
  vec4 result = multiplier * pow(abs(a), b);

  // Ensure that a^0 = 1, including 0^0 = 1 as this correspond to TF and JS
  bvec4 isExpZero = equal(b, vec4(0.0));
  result.r = isExpZero.r ? 1.0 : result.r;
  result.g = isExpZero.g ? 1.0 : result.g;
  result.b = isExpZero.b ? 1.0 : result.b;
  result.a = isExpZero.a ? 1.0 : result.a;

  bvec4 isNaN1 = lessThan(a, vec4(0.0));
  bvec4 isNaN2 = lessThan(floor(b), b);
  bvec4 isNaN = bvec4(isNaN1.x && isNaN2.x, isNaN1.y && isNaN2.y, isNaN1.z && isNaN2.z, isNaN1.w && isNaN2.w);
  `+sn+`
  return result;
`,KW=Ot({opSnippet:HW,packedOpSnippet:qW}),z$={kernelName:"Pow",backendName:"webgl",kernelFunc:KW};function XW(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{axis:s,keepDims:a}=o,i=n.shape.length,p=[],c=y.parseAxisParam(s,n.shape),l=c,u=I.getAxesPermutation(l,i),m=n;u!=null&&(m=Ht({inputs:{x:n},backend:e,attrs:{perm:u}}),l=I.getInnerMostAxes(l.length,i),p.push(m)),I.assertAxesAreInnerMostDims("prod",l,i);let f;if(e.shouldExecuteOnCPU([m])){let d=e.texData.get(m.dataId).values,{outVals:g,outShape:h,outDtype:x}=F1(m.shape,m.dtype,d,l);f=e.makeTensorInfo(h,x,g)}else{let[d,g]=I.computeOutAndReduceShapes(m.shape,l),h=y.sizeFromShape(g),x=j({inputs:{x:m},backend:e,attrs:{shape:[-1,h]}}),b=Ys(n.dtype),S=ir(x,b,"prod",e);f=j({inputs:{x:S},backend:e,attrs:{shape:d}}),p.push(x),p.push(S)}if(a){p.push(f);let d=I.expandShapeToKeepDim(f.shape,c);f=j({inputs:{x:f},backend:e,attrs:{shape:d}})}return p.forEach(d=>e.disposeIntermediateTensorInfo(d)),f}var W$={kernelName:Bn,backendName:"webgl",kernelFunc:XW};function jW(r){let{inputs:t,backend:e,attrs:o}=r,{paramsNestedSplits:n,paramsDenseValues:s,indices:a}=t,{outputRaggedRank:i}=o,p=n.map(x=>e.readSync(x.dataId)),c=n.map(x=>x.shape),l=e.readSync(s.dataId),u=e.readSync(a.dataId),[m,f,d]=_1(p,c,l,s.shape,s.dtype,u,a.shape,i),g=m.map(x=>e.makeTensorInfo([x.length],"int32",x)),h=e.makeTensorInfo(d,s.dtype,f);return g.concat([h])}var U$={kernelName:Qa,backendName:"webgl",kernelFunc:jW};function YW(r){let{inputs:t,backend:e,attrs:o}=r,{shape:n,values:s,defaultValue:a,rowPartitionTensors:i}=t,{rowPartitionTypes:p}=o,c=e.readSync(n.dataId),l=e.readSync(s.dataId),u=e.readSync(a.dataId),m=i.map(h=>e.readSync(h.dataId)),f=i.map(h=>h.shape),[d,g]=O1(c,n.shape,l,s.shape,s.dtype,u,a.shape,m,f,p);return e.makeTensorInfo(d,s.dtype,g)}var H$={kernelName:Ja,backendName:"webgl",kernelFunc:YW};var Ey=r=>{let{backend:t,attrs:e}=r,{start:o,stop:n,step:s,dtype:a}=e,i=P1(o,n,s,a);return t.makeTensorInfo([i.length],a,i)},q$={kernelName:ti,backendName:"webgl",kernelFunc:Ey};var ZW="return 1.0 / x;",QW=lt({opSnippet:ZW}),K$={kernelName:Ao,backendName:"webgl",kernelFunc:QW};var JW=ue+`
  return (x < 0.0) ? 0.0 : x;
`,tU=`
  vec4 result = x * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,eU=lt({opSnippet:JW,packedOpSnippet:tU}),X$={kernelName:Do,backendName:"webgl",kernelFunc:eU};var rU=ue+`
  return (x < 0.0) ? 0.0 : min(6.0, x);
`,oU=`
  vec4 result = min(x, vec4(6.)) * vec4(greaterThanEqual(x, vec4(0.0)));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,nU=lt({opSnippet:rU,packedOpSnippet:oU}),j$={kernelName:Ro,backendName:"webgl",kernelFunc:nU};var rd=class{constructor(t,e,o,n,s){this.variableNames=["A"],this.outputShape=[];let[a,i,p,c]=t;this.outputShape=[a,e,o,c];let l=[n&&e>1?i-1:i,n&&o>1?p-1:p],u=[n&&e>1?e-1:e,n&&o>1?o-1:o],m;s?m="(vec2(yRC) + vec2(0.5)) * effectiveInputOverOutputRatioRC - vec2(0.5)":m="vec2(yRC) * effectiveInputOverOutputRatioRC",this.userCode=`
      const vec2 effectiveInputOverOutputRatioRC = vec2(
          ${l[0]/u[0]},
          ${l[1]/u[1]});
      const vec2 inputShapeRC = vec2(${i}.0, ${p}.0);

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        ivec2 yRC = coords.yz;

        // Fractional source index.
        vec2 sourceFracIndexRC = ${m};

        // Compute the four integer indices.
        ivec2 sourceFloorRC = ivec2(max(sourceFracIndexRC, vec2(0.0)));
        ivec2 sourceCeilRC = ivec2(
          min(inputShapeRC - 1.0, ceil(sourceFracIndexRC)));

        float topLeft = getA(b, sourceFloorRC.x, sourceFloorRC.y, d);
        float bottomLeft = getA(b, sourceCeilRC.x, sourceFloorRC.y, d);
        float topRight = getA(b, sourceFloorRC.x, sourceCeilRC.y, d);
        float bottomRight = getA(b, sourceCeilRC.x, sourceCeilRC.y, d);

        vec2 fracRC = sourceFracIndexRC - vec2(sourceFloorRC);

        float top = topLeft + (topRight - topLeft) * fracRC.y;
        float bottom = bottomLeft + (bottomRight - bottomLeft) * fracRC.y;
        float newValue = top + (bottom - top) * fracRC.x;

        setOutput(newValue);
      }
    `}};var od=class{constructor(t,e,o,n,s){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[];let[a,i,p,c]=t;this.outputShape=[a,e,o,c];let l=[n&&e>1?i-1:i,n&&o>1?p-1:p],u=[n&&e>1?e-1:e,n&&o>1?o-1:o],m;s?m="(vec3(yRC) + vec3(0.5)) * effectiveInputOverOutputRatioRC - vec3(0.5)":m="vec3(yRC) * effectiveInputOverOutputRatioRC",this.userCode=`
      const vec3 effectiveInputOverOutputRatioRC = vec3(
          ${l[0]/u[0]},
          ${l[1]/u[1]},
          ${l[1]/u[1]});
      const vec3 inputShapeRC = vec3(${i}.0, ${p}.0,
                                     ${p}.0);

      float getAValue(int b, int r, int c, int d) {
        return getChannel(getA(b, r, c, d), vec2(c, d));
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        // Calculate values for next column in yRC.z.
        ivec3 yRC = coords.yzz + ivec3(0, 0, 1);

        // Fractional source index.
        vec3 sourceFracIndexRC = ${m};

        // Compute the four integer indices.
        ivec3 sourceFloorRC = ivec3(max(sourceFracIndexRC, vec3(0.0)));
        ivec3 sourceCeilRC = ivec3(
          min(inputShapeRC - 1.0, ceil(sourceFracIndexRC)));

        // Should we calculate next column and row elements in 2x2 packed cell.
        bool hasNextCol = d < ${c-1};
        bool hasNextRow = coords.z < ${o-1};

        // In parallel, construct four corners for all four components in
        // packed 2x2 cell.
        vec4 topLeft = vec4(
          getAValue(b, sourceFloorRC.x, sourceFloorRC.y, d),
          hasNextCol ? getAValue(b, sourceFloorRC.x, sourceFloorRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceFloorRC.x, sourceFloorRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceFloorRC.x, sourceFloorRC.z, d + 1) : 0.0);

        vec4 bottomLeft = vec4(
          getAValue(b, sourceCeilRC.x, sourceFloorRC.y, d),
          hasNextCol ? getAValue(b, sourceCeilRC.x, sourceFloorRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceCeilRC.x, sourceFloorRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceCeilRC.x, sourceFloorRC.z, d + 1) : 0.0);

        vec4 topRight = vec4(
          getAValue(b, sourceFloorRC.x, sourceCeilRC.y, d),
          hasNextCol ? getAValue(b, sourceFloorRC.x, sourceCeilRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceFloorRC.x, sourceCeilRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceFloorRC.x, sourceCeilRC.z, d + 1) : 0.0);

        vec4 bottomRight = vec4(
          getAValue(b, sourceCeilRC.x, sourceCeilRC.y, d),
          hasNextCol ? getAValue(b, sourceCeilRC.x, sourceCeilRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceCeilRC.x, sourceCeilRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceCeilRC.x, sourceCeilRC.z, d + 1) : 0.0);

        vec3 fracRC = sourceFracIndexRC - vec3(sourceFloorRC);

        vec4 top = mix(topLeft, topRight, fracRC.yyzz);
        vec4 bottom = mix(bottomLeft, bottomRight, fracRC.yyzz);
        vec4 newValue = mix(top, bottom, fracRC.x);

        setOutput(newValue);
      }
    `}};function sU(r){let{inputs:t,backend:e,attrs:o}=r,{images:n}=t,{alignCorners:s,halfPixelCenters:a,size:i}=o,[p,c]=i,l=_().getBool("WEBGL_PACK_IMAGE_OPERATIONS")?new od(n.shape,p,c,s,a):new rd(n.shape,p,c,s,a);return e.runWebGLProgram(l,[n],"float32")}var Y$={kernelName:zn,backendName:"webgl",kernelFunc:sU};var nd=class{constructor(t,e,o){this.variableNames=["dy"],this.outputShape=[],this.outputShape=e;let[,n,s]=e,[,a,i]=t,p=[o&&a>1?n-1:n,o&&i>1?s-1:s],c=[o&&a>1?a-1:a,o&&i>1?i-1:i],l=p[0]/c[0],u=p[1]/c[1],m=1/l,f=1/u,d=Math.ceil(m)*2+2,g=Math.ceil(f)*2+2;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        int r = coords[1];
        int c = coords[2];

        float accumulator = 0.0;

        const float heightScale = float(${l});
        const float widthScale = float(${u});

        const float invHeightScale = float(${m});
        const float invWidthScale = float(${f});

        const int winHeight = int(${d});
        const int winWidth = int(${g});

        // Compute bounds for where in dy we will look
        float startRLerp = floor(float(r) * invHeightScale);
        int startDyR = int(startRLerp - float(winHeight / 2));

        float startCLerp = floor(float(c) * invWidthScale);
        int startDyC = int(startCLerp - float(winWidth / 2));

        // Loop over dy
        for (int dyROffset = 0; dyROffset < winHeight; dyROffset++) {
          int dyR = dyROffset + startDyR;

          // Guard against the window exceeding the bounds of dy
          if (dyR < 0 || dyR >= ${a}) {
            continue;
          }

          for (int dyCOffset = 0; dyCOffset < winWidth; dyCOffset++) {
            int dyC = dyCOffset + startDyC;

            // Guard against the window exceeding the bounds of dy
            if (dyC < 0 || dyC >= ${i}) {
              continue;
            }

            float dxR = float(dyR) * heightScale;
            int topDxRIndex = int(floor(dxR));
            int bottomDxRIndex = int(min(ceil(dxR), ${n-1}.0));
            float dxRLerp = dxR - float(topDxRIndex);
            float inverseDxRLerp = 1.0 - dxRLerp;

            float dxC = float(dyC) * widthScale;
            int leftDxCIndex = int(floor(dxC));
            int rightDxCIndex = int(min(ceil(dxC), ${s-1}.0));
            float dxCLerp = dxC - float(leftDxCIndex);
            float inverseDxCLerp = 1.0 - dxCLerp;

            if (r == topDxRIndex && c == leftDxCIndex) {
              // topLeft
              accumulator +=
                getDy(b, dyR, dyC, d) * inverseDxRLerp * inverseDxCLerp;
            }

            if (r == topDxRIndex && c == rightDxCIndex) {
              // topRight
              accumulator += getDy(b, dyR, dyC, d) * inverseDxRLerp * dxCLerp;
            }

            if (r == bottomDxRIndex && c == leftDxCIndex) {
              // bottomLeft
              accumulator += getDy(b, dyR, dyC, d) * dxRLerp * inverseDxCLerp;
            }

            if (r == bottomDxRIndex && c == rightDxCIndex) {
              // bottomRight
              accumulator += getDy(b, dyR, dyC, d) * dxRLerp * dxCLerp;
            }
          }
        }
        // End loop over dy

        setOutput(accumulator);
      }
    `}};function aU(r){let{inputs:t,backend:e,attrs:o}=r,{images:n,dy:s}=t,{alignCorners:a}=o,i=new nd(s.shape,n.shape,a);return e.runWebGLProgram(i,[s],s.dtype)}var Z$={kernelName:oi,backendName:"webgl",kernelFunc:aU};var sd=class{constructor(t,e,o,n,s){this.variableNames=["A"],this.outputShape=[];let[a,i,p,c]=t;this.outputShape=[a,e,o,c];let l=[n&&e>1?i-1:i,n&&o>1?p-1:p],u=[n&&e>1?e-1:e,n&&o>1?o-1:o],m=n?"0.5":"0.0",f;s?f="max((vec2(yRC) + vec2(0.5)) * effectiveInputOverOutputRatioRC, vec2(0.0))":f="vec2(yRC) * effectiveInputOverOutputRatioRC",this.userCode=`
      const vec2 effectiveInputOverOutputRatioRC = vec2(
          ${l[0]/u[0]},
          ${l[1]/u[1]});
      const vec2 inputShapeRC = vec2(${i}.0, ${p}.0);

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        ivec2 yRC = coords.yz;

        // Fractional source index.
        vec2 sourceFracIndexRC = ${f};

        // Compute the coordinators of nearest neighbor point.
        ivec2 sourceNearestRC = ivec2(
          min(inputShapeRC - 1.0, floor(sourceFracIndexRC + ${m})));
        float newValue = getA(b, sourceNearestRC.x, sourceNearestRC.y, d);

        setOutput(newValue);
      }
    `}};var ad=class{constructor(t,e,o,n,s){this.variableNames=["A"],this.packedInputs=!0,this.packedOutput=!0,this.outputShape=[];let[a,i,p,c]=t;this.outputShape=[a,e,o,c];let l=[n&&e>1?i-1:i,n&&o>1?p-1:p],u=[n&&e>1?e-1:e,n&&o>1?o-1:o],m=n?"0.5":"0.0",f;s?f="max((vec3(yRC) + vec3(0.5)) * effectiveInputOverOutputRatioRC, vec3(0.0))":f="vec3(yRC) * effectiveInputOverOutputRatioRC",this.userCode=`
      const vec3 effectiveInputOverOutputRatioRC = vec3(
          ${l[0]/u[0]},
          ${l[1]/u[1]},
          ${l[1]/u[1]});
      const vec3 inputShapeRC = vec3(${i}.0, ${p}.0,
                                     ${p}.0);

      float getAValue(int b, int r, int c, int d) {
        return getChannel(getA(b, r, c, d), vec2(c, d));
      }

      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        // Calculate values for next column in yRC.z.
        ivec3 yRC = coords.yzz + ivec3(0, 0, 1);

        // Fractional source index.
        vec3 sourceFracIndexRC = ${f};

        // Compute the coordinators of nearest neighbor point.
        ivec3 sourceNearestRC = ivec3(
          min(inputShapeRC - 1.0, floor(sourceFracIndexRC + ${m})));

        // Should we calculate next column and row elements in 2x2 packed cell.
        bool hasNextCol = d < ${c-1};
        bool hasNextRow = coords.z < ${o-1};

        vec4 newValue = vec4(
          getAValue(b, sourceNearestRC.x, sourceNearestRC.y, d),
          hasNextCol ? getAValue(b, sourceNearestRC.x, sourceNearestRC.y, d + 1)
                     : 0.0,
          hasNextRow ? getAValue(b, sourceNearestRC.x, sourceNearestRC.z, d)
                     : 0.0,
          (hasNextRow && hasNextCol) ?
            getAValue(b, sourceNearestRC.x, sourceNearestRC.z, d + 1) : 0.0);

        setOutput(newValue);
      }
    `}};function iU(r){let{inputs:t,backend:e,attrs:o}=r,{images:n}=t,{alignCorners:s,halfPixelCenters:a,size:i}=o,[p,c]=i,l=_().getBool("WEBGL_PACK_IMAGE_OPERATIONS")?new ad(n.shape,p,c,s,a):new sd(n.shape,p,c,s,a);return e.runWebGLProgram(l,[n],n.dtype)}var Q$={kernelName:Vn,backendName:"webgl",kernelFunc:iU};var id=class{constructor(t,e,o){this.variableNames=["dy"],this.outputShape=[],this.outputShape=e;let[,n,s]=e,[,a,i]=t,p=[o&&a>1?n-1:n,o&&i>1?s-1:s],c=[o&&a>1?a-1:a,o&&i>1?i-1:i],l=p[0]/c[0],u=p[1]/c[1],m=1/l,f=1/u,d=Math.ceil(m)*2+2,g=Math.ceil(f)*2+2;this.userCode=`
      void main() {
        ivec4 coords = getOutputCoords();
        int b = coords[0];
        int d = coords[3];
        int r = coords[1];
        int c = coords[2];

        float accumulator = 0.0;

        const float heightScale = float(${l});
        const float widthScale = float(${u});

        const float invHeightScale = float(${m});
        const float invWidthScale = float(${f});

        const int winHeight = int(${d});
        const int winWidth = int(${g});

        // Compute bounds for where in dy we will look
        float startRLerp = floor(float(r) * invHeightScale);
        int startDyR = int(floor(startRLerp - float(winHeight / 2)));

        float startCLerp = floor(float(c) * invWidthScale);
        int startDyC = int(floor(startCLerp - float(winWidth / 2)));

        // Loop over dy
        for (int dyROffset = 0; dyROffset < winHeight; dyROffset++) {
          int dyR = dyROffset + startDyR;

          // Guard against the window exceeding the bounds of dy
          if (dyR < 0 || dyR >= ${a}) {
            continue;
          }

          for (int dyCOffset = 0; dyCOffset < winWidth; dyCOffset++) {
            int dyC = dyCOffset + startDyC;

            // Guard against the window exceeding the bounds of dy
            if (dyC < 0 || dyC >= ${i}) {
              continue;
            }

            float sourceFracRow =
              float(${p[0]}) *
                (float(dyR) / float(${c[0]}));

            float sourceFracCol =
                float(${p[1]}) *
                  (float(dyC) / float(${c[1]}));

            int sourceNearestRow = int(min(
                float(int(${n}) - 1),
                ${o} ? float(round(sourceFracRow)) :
                                  float(floor(sourceFracRow))));

            int sourceNearestCol = int(min(
                float(int(${s}) - 1),
                ${o} ? float(round(sourceFracCol)) :
                                  float(floor(sourceFracCol))));

            if (r == sourceNearestRow && c == sourceNearestCol) {
              accumulator += getDy(b, dyR, dyC, d);
            }
          }
        }
        // End loop over dy

        setOutput(accumulator);
      }
    `}};function pU(r){let{inputs:t,backend:e,attrs:o}=r,{images:n,dy:s}=t,{alignCorners:a}=o,i=new id(s.shape,n.shape,a);return e.runWebGLProgram(i,[s],s.dtype)}var J$={kernelName:ri,backendName:"webgl",kernelFunc:pU};var pd=class{constructor(t,e){this.variableNames=["x"];let o=t.length;if(o>4)throw new Error(`WebGL backend: Reverse of rank-${o} tensor is not yet supported`);if(this.outputShape=t,o===1){this.userCode=`
        void main() {
          int coord = getOutputCoords();
          setOutput(getX(${t[0]} - coord - 1));
        }
      `;return}let n=i=>e.indexOf(i)!==-1&&t[i]!==1?`${t[i]} - coords[${i}] - 1`:`coords[${i}]`,s=t.map((i,p)=>n(p)).join(","),a=wt(o);this.userCode=`
      void main() {
        ${a} coords = getOutputCoords();
        setOutput(getX(${s}));
      }
    `}};var cd=class{constructor(t,e){this.variableNames=["x"],this.packedInputs=!0,this.packedOutput=!0;let o=t.length;if(o>4)throw new Error(`WebGL backend: Reverse of rank-${o} tensor is not yet supported`);this.outputShape=t;let n=re("rc",o),s=`${n[o-1]} + 1 < ${this.outputShape[o-1]}`,a=`${n[o-2]} + 1 < ${this.outputShape[o-2]}`,i=wt(o);o===1?this.userCode=`
        void main(){
          int rc = getOutputCoords();
          vec4 result = vec4(0.);
          result.r = getChannel(getX(${t[0]} - rc - 1),
            ${t[0]} - rc - 1);
          if(${s}){
              result.g = getChannel(getX(${t[0]} - (rc  + 1) - 1),
                ${t[0]} - (rc  + 1) - 1);
          }
          setOutput(result);
        }
      `:this.userCode=`
        void main() {
          ${i} rc = getOutputCoords();
          vec4 result = vec4(0.);
          result.r = ${p(n.slice())};
          if(${s}){
            result.g = ${c(n.slice())};
          }
          if(${a}) {
            result.b = ${l(n.slice())};
            if(${s}) {
              result.a = ${u(n.slice())};
            }
          }
          setOutput(result);
        }
    `;function p(d){return m(d)}function c(d){return d[o-1]="("+d[o-1]+" + 1)",m(d)}function l(d){return d[o-2]="("+d[o-2]+" + 1)",m(d)}function u(d){return d[o-1]="("+d[o-1]+" + 1)",d[o-2]="("+d[o-2]+" + 1)",m(d)}function m(d){let g=t.map((b,S)=>f(S,d)),h=g.join(","),x=g.slice(-2).join(",");return`getChannel(getX(${h}), vec2(${x}))`}function f(d,g){return e.indexOf(d)!==-1&&t[d]!==1?`${t[d]} - ${g[d]} - 1`:`${g[d]}`}}};function cU(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{dims:s}=o,a=n.shape.length,i=y.parseAxisParam(s,n.shape);if(a===0)return oe({inputs:{x:n},backend:e});let p=_().getBool("WEBGL_PACK_ARRAY_OPERATIONS")?new cd(n.shape,i):new pd(n.shape,i);return e.runWebGLProgram(p,[n],n.dtype)}var t2={kernelName:Wn,backendName:"webgl",kernelFunc:cU};var ld=class{constructor(t,e){this.variableNames=["Image"],this.outputShape=[],this.customUniforms=[{name:"params",type:"vec4"}];let o=t[1],n=t[2];this.outputShape=t;let s="";typeof e=="number"?s=`float outputValue = ${e.toFixed(2)};`:s=`
        vec3 fill = vec3(${e.join(",")});
        float outputValue = fill[coords[3]];`,this.userCode=`
        void main() {
          ivec4 coords = getOutputCoords();
          int x = coords[2];
          int y = coords[1];
          float coordXFloat = (float(x) - params[0]) * params[3] -
            (float(y) - params[1]) * params[2];
          float coordYFloat = (float(x) - params[0]) * params[2] +
            (float(y) - params[1]) * params[3];
          int coordX = int(round(coordXFloat + params[0]));
          int coordY = int(round(coordYFloat + params[1]));
          ${s}
          if(coordX >= 0 && coordX < ${n} && coordY >= 0 && coordY < ${o}) {
            outputValue = getImage(coords[0], coordY, coordX, coords[3]);
          }
          setOutput(outputValue);
        }
    `}};var e2={kernelName:Ci,backendName:"webgl",kernelFunc:({inputs:r,attrs:t,backend:e})=>{let{image:o}=r,{radians:n,fillValue:s,center:a}=t,i=e,p=new ld(o.shape,s),[c,l]=I.getImageCenter(a,o.shape[1],o.shape[2]),u=[[c,l,Math.sin(n),Math.cos(n)]];return i.runWebGLProgram(p,[o],o.dtype,u)}};var lU=`
  // OpenGL ES does not support round function.
  // The algorithm is based on banker's rounding.
  float base = floor(x);
  if ((x - base) < 0.5) {
    return floor(x);
  } else if ((x - base) > 0.5) {
    return ceil(x);
  } else {
    if (mod(base, 2.0) == 0.0) {
      return base;
    } else {
      return base + 1.0;
    }
  }
`,uU=lt({opSnippet:lU}),r2={kernelName:Fo,backendName:"webgl",kernelFunc:uU};var mU="return inversesqrt(x);",fU=lt({opSnippet:mU,cpuKernelImpl:L1}),o2={kernelName:_o,backendName:"webgl",kernelFunc:fU};var bc=class{constructor(t,e,o,n,s,a,i=!0){this.variableNames=["updates","indices","defaultValue"],this.outputShape=a;let p=wt(s.length),c=wt(a.length),l="";o===1?l="i":o===2&&(l="i, j");let u=`getIndices(${l})`,m="";n===1?m="i":n===2&&(m="i, coords[1]");let f=`getUpdates(${m})`,d=e>1?"strides[j]":"strides";this.userCode=`
        ${p} strides = ${p}(${s});

        void main() {
          ${c} coords = getOutputCoords();
          float sum = 0.0;
          bool found = false;
          for (int i = 0; i < ${t}; i++) {
            int flattenedIndex = 0;
            for (int j = 0; j < ${e}; j++) {
              int index = round(${u});
              flattenedIndex += index * ${d};
            }
            if (flattenedIndex == coords[0]) {
              sum += ${f};
              found = true;
            }
          }
          setOutput(mix(getDefaultValue(), sum, float(found)));
        }
      `}};function dU(r){let{inputs:t,backend:e,attrs:o}=r,{indices:n,updates:s}=t,{shape:a}=o,{sliceRank:i,numUpdates:p,sliceSize:c,strides:l,outputSize:u}=I.calculateShapes(s,n,a),m=[u/c,c];if(u===0)return e.makeTensorInfo(a,n.dtype);let f=j({inputs:{x:n},backend:e,attrs:{shape:[p,i]}}),d=j({inputs:{x:s},backend:e,attrs:{shape:[p,c]}}),g=e.makeTensorInfo([],"float32",new Float32Array([0])),h=new bc(p,i,f.shape.length,d.shape.length,l,m),x=e.runWebGLProgram(h,[d,f,g],d.dtype),b=j({inputs:{x},backend:e,attrs:{shape:a}});return e.disposeIntermediateTensorInfo(f),e.disposeIntermediateTensorInfo(d),e.disposeIntermediateTensorInfo(x),e.disposeIntermediateTensorInfo(g),b}var n2={kernelName:ni,backendName:"webgl",kernelFunc:dU};var ud=class{constructor(t,e,o,n){this.variableNames=["sortedSequence","values"],this.customUniforms=[{name:"numInputs",type:"int"}],this.outputShape=[t,o];let s="while (left < right) {",a=`for (int i = 0; i < ${Math.ceil(Math.log2(e+1))}; ++i) { if (left >= right) break;`,i=_().getNumber("WEBGL_VERSION")===2?s:a,p=n==="left"?"<":"<=";this.userCode=`
       int findBound(int batch, float value) {
         int left = 0;
         int right = numInputs;
         int mid;
         ${i}
           mid = (left + right) / 2;
           if (getSortedSequence(batch, mid) ${p} value) {
             left = mid + 1;
           } else {
             right = mid;
           }
         }
         return right;
       }

       void main() {
         ivec2 coords = getOutputCoords();
         int batch = coords[0];
         int valueIndex = coords[1];

         float value = getValues(batch, valueIndex);

         setOutput(float(findBound(batch, value)));
       }
     `}};function hU(r){let{inputs:t,backend:e,attrs:o}=r,{sortedSequence:n,values:s}=t,{side:a}=o,i=new ud(n.shape[0],n.shape[1],s.shape[1],a),p=[[n.shape[1]]];return e.runWebGLProgram(i,[n,s],"int32",p)}var s2={kernelName:si,backendName:"webgl",kernelFunc:hU};var md=class{constructor(t,e,o){this.variableNames=["c","a","b"],this.outputShape=e;let n,s;if(o>4)throw Error(`Where for rank ${o} is not yet supported`);if(o===1)s="resRC",n="resRC";else{let i=["resRC.x","resRC.y","resRC.z","resRC.w"],p=[],c=[];for(let l=0;l<e.length;l++)c.push(`${i[l]}`),l<t&&p.push(`${i[l]}`);n=p.join(),s=c.join()}let a=wt(o);this.userCode=`
      void main() {
        ${a} resRC = getOutputCoords();
        float cVal = getC(${n});
        if (cVal >= 1.0) {
          setOutput(getA(${s}));
        } else {
          setOutput(getB(${s}));
        }
      }
    `}};function gU(r){let{inputs:t,backend:e}=r,{condition:o,t:n,e:s}=t,a=new md(o.shape.length,n.shape,n.shape.length);return e.runWebGLProgram(a,[o,n,s],ne(n.dtype,s.dtype))}var a2={kernelName:Un,backendName:"webgl",kernelFunc:gU};var xU=`
  // Stable and Attracting Fixed Point (0, 1) for Normalized Weights.
  // see: https://arxiv.org/abs/1706.02515
  float scaleAlpha = ${I.SELU_SCALEALPHA};
  float scale = ${I.SELU_SCALE};
  return (x >= 0.0) ? scale * x : scaleAlpha * (exp(x) - 1.0);
`,yU=lt({opSnippet:xU}),i2={kernelName:Oo,backendName:"webgl",kernelFunc:yU};var bU=Pr+`
  return 1.0 / (1.0 + exp(-1.0 * x));
`,CU=`
  vec4 result = 1.0 / (1.0 + exp(-1.0 * x));
  bvec4 isNaN = isnan(x);

  result.r = isNaN.r ? x.r : result.r;
  result.g = isNaN.g ? x.g : result.g;
  result.b = isNaN.b ? x.b : result.b;
  result.a = isNaN.a ? x.a : result.a;

  return result;
`,TU=lt({opSnippet:bU,packedOpSnippet:CU,cpuKernelImpl:B1}),p2={kernelName:Mo,backendName:"webgl",kernelFunc:TU};var SU=`
  if (isnan(x)) { return 0.0; }
  return sign(x);
`,wU=lt({opSnippet:SU}),c2={kernelName:Lo,backendName:"webgl",kernelFunc:wU};var NU=Pr+`
  return sin(x);
`,vU=lt({opSnippet:NU}),l2={kernelName:"Sin",backendName:"webgl",kernelFunc:vU};var IU=`
  float e2x = exp(x);
  return (e2x - 1.0 / e2x) / 2.0;
`,kU=lt({opSnippet:IU}),u2={kernelName:Po,backendName:"webgl",kernelFunc:kU};var EU=`
  float epsilon = 1.1920928955078125e-7;
  float threshold = log(epsilon) + 2.0;

  bool too_large = x > -threshold;
  bool too_small = x < threshold;

  float result;
  float exp_x = exp(x);

  if (too_large){
    result = x;
  }
  else if (too_small){
    result = exp_x;
  }
  else{
    result = log(exp_x + 1.0);
  }
  return result;
`,$U=lt({opSnippet:EU}),m2={kernelName:Bo,backendName:"webgl",kernelFunc:$U};var AU=r=>{let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{blockShape:s,paddings:a}=o;y.assert(n.shape.length<=4,()=>"spaceToBatchND for rank > 4 with a WebGL backend not implemented yet");let i=s.reduce((x,b)=>x*b),p=[[0,0]];p.push(...a);for(let x=1+s.length;x<n.shape.length;++x)p.push([0,0]);let c=[],l=ky({inputs:{x:n},backend:e,attrs:{paddings:p,constantValue:0}}),u=I.getReshaped(l.shape,s,i,!1),m=I.getPermuted(u.length,s.length,!1),f=I.getReshapedPermuted(l.shape,s,i,!1),d=j({inputs:{x:l},backend:e,attrs:{shape:u}}),g=Ht({inputs:{x:d},backend:e,attrs:{perm:m}}),h=j({inputs:{x:g},backend:e,attrs:{shape:f}});return c.push(l),c.push(d),c.push(g),c.forEach(x=>e.disposeIntermediateTensorInfo(x)),h},f2={kernelName:qn,backendName:"webgl",kernelFunc:AU};function DU(r){let{inputs:t,backend:e}=r,{indices:o,values:n,denseShape:s,defaultValue:a}=t;if(s.shape.length!==1)throw new Error(`Dense shape must be a vector, saw:
         ${s.shape}`);if(o.shape.length!==2)throw new Error(`Indices must be a matrix, saw:
         ${o.shape}`);if(n.shape.length!==1)throw new Error(`Values must be a vector, saw:
         ${n.shape}`);if(a.shape.length!==0)throw new Error(`Default value must be a scalar, saw:
        ${a.shape}`);let i=e.readSync(o.dataId),p=e.readSync(n.dataId),c=e.readSync(s.dataId),l=e.readSync(a.dataId)[0],[u,m,f,d,g]=V1(i,o.shape,o.dtype,p,n.dtype,c,l);return[e.makeTensorInfo(m,o.dtype,u),e.makeTensorInfo([m[0]],n.dtype,f),e.makeTensorInfo([d.length],"bool",new Uint8Array(d.map(h=>Number(h)))),e.makeTensorInfo([g.length],o.dtype,new Int32Array(g))]}var d2={kernelName:ii,backendName:"webgl",kernelFunc:DU};function RU(r){let{inputs:t,backend:e}=r,{inputIndices:o,inputShape:n,newShape:s}=t;if(o.shape.length!==2)throw new Error(`Input indices should be a matrix but received shape ${o.shape}`);if(n.shape.length!==1)throw new Error(`Input shape should be a vector but received shape ${n.shape}`);if(s.shape.length!==1)throw new Error(`Target shape should be a vector but received shape ${s.shape}`);let a=Array.from(e.readSync(n.dataId)),i=e.readSync(o.dataId),p=Array.from(e.readSync(s.dataId)),[c,l,u]=z1(i,o.shape,o.dtype,a,p);return[e.makeTensorInfo(l,o.dtype,c),e.makeTensorInfo([u.length],s.dtype,new Int32Array(u))]}var h2={kernelName:pi,backendName:"webgl",kernelFunc:RU};function FU(r){let{inputs:t,backend:e}=r,{data:o,indices:n,segmentIds:s}=t;if(o.shape.length<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(n.shape.length!==1)throw new Error(`Indices should be a vector but received shape
              ${n.shape}`);if(s.shape.length!==1)throw new Error(`Segment ids should be a vector but received shape
              ${s.shape}`);let a=e.readSync(o.dataId),i=e.readSync(n.dataId),p=e.readSync(s.dataId),[c,l]=Xm(a,o.shape,o.dtype,i,p,!0);return e.makeTensorInfo(l,o.dtype,c)}var g2={kernelName:ci,backendName:"webgl",kernelFunc:FU};function _U(r){let{inputs:t,backend:e}=r,{data:o,indices:n,segmentIds:s}=t;if(o.shape.length<1)throw new Error("Data should be at least 1 dimensional but received scalar");if(n.shape.length!==1)throw new Error(`Indices should be a vector but received shape
             ${n.shape}`);if(s.shape.length!==1)throw new Error(`Segment ids should be a vector but received shape
             ${s.shape}`);let a=e.readSync(o.dataId),i=e.readSync(n.dataId),p=e.readSync(s.dataId),[c,l]=Xm(a,o.shape,o.dtype,i,p);return e.makeTensorInfo(l,o.dtype,c)}var x2={kernelName:li,backendName:"webgl",kernelFunc:_U};function OU(r){let{inputs:t,backend:e,attrs:o}=r,{sparseIndices:n,sparseValues:s,defaultValue:a}=t,{outputShape:i}=o,{sliceRank:p,numUpdates:c,sliceSize:l,strides:u,outputSize:m}=I.calculateShapes(s,n,i),f=!1;if(s.dtype==="string"){let x=e.bufferSync(n),b=e.bufferSync(s),S=y.decodeString(e.readSync(a.dataId)[0]),w=M1(x,b,i,m,l,c,p,u,S,f);return e.makeTensorInfo(i,w.dtype,w.values)}let d=new bc(c,p,n.shape.length,s.shape.length,u,[m,1],f),g=e.runWebGLProgram(d,[s,n,a],s.dtype),h=j({inputs:{x:g},backend:e,attrs:{shape:i}});return e.disposeIntermediateTensorInfo(g),h}var y2={kernelName:ui,backendName:"webgl",kernelFunc:OU};function PU(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{numOrSizeSplits:s,axis:a}=o,i=y.parseAxisParam(a,n.shape)[0],p=I.prepareSplitSize(n,s,i),c=n.shape.length,l=new Array(c).fill(0),u=n.shape.slice();return p.map(m=>{let f=[...u];f[i]=m;let d=eo({inputs:{x:n},backend:e,attrs:{begin:l,size:f}});return l[i]+=m,d})}var b2={kernelName:Kn,backendName:"webgl",kernelFunc:PU};var C2="return sqrt(x);",LU=lt({opSnippet:C2,packedOpSnippet:C2,cpuKernelImpl:W1}),T2={kernelName:Go,backendName:"webgl",kernelFunc:LU};var MU="return x * x;",BU=lt({opSnippet:MU}),S2={kernelName:mi,backendName:"webgl",kernelFunc:BU};var w2="return (a - b) * (a - b);",GU=Ot({opSnippet:w2,packedOpSnippet:w2}),N2={kernelName:Vo,backendName:"webgl",kernelFunc:GU};function VU({inputs:r,attrs:t,backend:e}){let{x:o}=r,n=ue+`
    return x > 0.0 ? 1.0 : float(${t.alpha});
  `,s=new Le(o.shape,n);return e.runWebGLProgram(s,[o],o.dtype)}var v2={kernelName:Wo,backendName:"webgl",kernelFunc:VU};var fd=class{constructor(t,e,o){this.variableNames=["x"],this.outputShape=o;let n=o.length,s=wt(o.length),a=wt(o.length),i="";if(n===1)i="coords * strides + begin";else{let p=0;i=o.map((c,l)=>(p++,o.length===1?`coords * strides[${l}] + begin[${l}]`:`coords[${p-1}] * strides[${l}] + begin[${l}]`)).join(",")}this.userCode=`
      ${s} begin = ${s}(${t});
      ${s} strides = ${s}(${e});

      void main() {
        ${a} coords = getOutputCoords();
        setOutput(getX(${i}));
      }
    `}};function zU(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{begin:s,end:a,strides:i,beginMask:p,endMask:c,ellipsisMask:l,newAxisMask:u,shrinkAxisMask:m}=o,{finalShapeSparse:f,finalShape:d,isIdentity:g,sliceDim0:h,isSimpleSlice:x,begin:b,end:S,strides:w}=de.sliceInfo(n.shape,s,a,i,p,c,l,u,m),E;if(g)E=j({inputs:{x:n},backend:e,attrs:{shape:d}});else if(h||x){y.assert(n.shape.length>=1,()=>`Input must have rank at least 1, got: ${n.shape.length}`);let D=de.computeOutShape(b,S,w),F=eo({inputs:{x:n},backend:e,attrs:{begin:b,size:D}});E=j({inputs:{x:F},backend:e,attrs:{shape:d}}),e.disposeIntermediateTensorInfo(F)}else if(e.shouldExecuteOnCPU([n])){let F=e.readSync(n.dataId),P=pt(n.shape,n.dtype,F),L=U1(f,P,w,b);E=e.makeTensorInfo(d,n.dtype,L.values)}else{let F=new fd(b,w,f);E=e.runWebGLProgram(F,[n],n.dtype)}let $=j({inputs:{x:E},backend:e,attrs:{shape:d}});return e.disposeIntermediateTensorInfo(E),$}var I2={kernelName:fi,backendName:"webgl",kernelFunc:zU};function WU(r){let{inputs:t,backend:e,attrs:o}=r,{separator:n,nGramWidths:s,leftPad:a,rightPad:i,padWidth:p,preserveShortSequences:c}=o,{data:l,dataSplits:u}=t,m=e.readSync(l.dataId),f=e.readSync(u.dataId),[d,g]=H1(m,f,n,s,a,i,p,c);return[e.makeTensorInfo([d.length],"string",d),e.makeTensorInfo(u.shape,"int32",g)]}var k2={kernelName:di,backendName:"webgl",kernelFunc:WU};function UU(r){let{inputs:t,backend:e,attrs:o}=r,{skipEmpty:n}=o,{input:s,delimiter:a}=t;if(s.dtype!=="string")throw new Error("Input must be of datatype string");if(s.shape.length!==1)throw new Error(`Input must be a vector, got shape: ${s.shape}`);if(a.shape.length!==0)throw new Error(`Delimiter must be a scalar, got shape: ${a.shape}`);let i=e.readSync(s.dataId),p=e.readSync(a.dataId)[0],[c,l,u]=q1(i,p,n),m=l.length;return[e.makeTensorInfo([m,2],"int32",c),e.makeTensorInfo([m],"string",l),e.makeTensorInfo([2],"int32",new Int32Array(u))]}var E2={kernelName:hi,backendName:"webgl",kernelFunc:UU};function HU(r){let{inputs:t,backend:e,attrs:o}=r,{numBuckets:n}=o,{input:s}=t;if(s.dtype!=="string")throw new Error("Input must be of datatype string");if(n<=0)throw new Error("Number of buckets must be at least 1");let a=e.readSync(s.dataId),i=K1(a,n);return e.makeTensorInfo(s.shape,"int32",i)}var $2={kernelName:gi,backendName:"webgl",kernelFunc:HU};var qU="return tan(x);",KU=lt({opSnippet:qU}),A2={kernelName:"Tan",backendName:"webgl",kernelFunc:KU};var XU=`
  float e2x = exp(-2.0 * abs(x));
  return sign(x) * (1.0 - e2x) / (1.0 + e2x);
`,jU=lt({opSnippet:XU}),D2={kernelName:zo,backendName:"webgl",kernelFunc:jU};var dd=class{constructor(t,e){this.variableNames=["A"];let o=new Array(t.length);for(let a=0;a<o.length;a++)o[a]=t[a]*e[a];this.outputShape=o,this.rank=o.length;let n=wt(this.rank),s=YU(t);this.userCode=`
      void main() {
        ${n} resRC = getOutputCoords();
        setOutput(getA(${s}));
      }
    `}};function YU(r){let t=r.length;if(t>5)throw Error(`Tile for rank ${t} is not yet supported`);if(t===1)return`imod(resRC, ${r[0]})`;let e=["resRC.x","resRC.y","resRC.z","resRC.w","resRC.u"],o=[];for(let n=0;n<r.length;n++)o.push(`imod(${e[n]}, ${r[n]})`);return o.join()}function $y(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{reps:s}=o;if(n.dtype==="string"||n.shape.length>5){let p=e.readSync(n.dataId),c=n.dtype==="string"?p.map(m=>y.decodeString(m)):p,l=pt(n.shape,n.dtype,c),u=j1(l,s);return e.makeTensorInfo(u.shape,u.dtype,u.values)}let a=new dd(n.shape,s);return e.runWebGLProgram(a,[n],n.dtype)}var R2={kernelName:Wr,backendName:"webgl",kernelFunc:$y};var hd=class{constructor(t){this.variableNames=["x","indices"],this.customUniforms=[{name:"n",type:"int"},{name:"firstPass",type:"int"},{name:"negativeInf",type:"float"},{name:"dir",type:"int"},{name:"inc",type:"int"}],this.outputShape=t,this.userCode=`
       void main() {
         ivec2 coords = getOutputCoords();
         int batch = coords[0];
         int elemIdx = coords[1];

         // We compare elements pair-wise within a group of size 2 * inc.
         // The comparing rule for each group alternates between ascending
         // and descending. Within each group, we compare each pair at
         // positions i and i+inc. To decide whether an element at position i
         // is x0 or x1, we mod it by 2 * inc, if the result is smaller than
         // inc, it is in the first half of the group, we denote it as x0,
         // otherwise we denote it as x1.
         // For example, as shown in the Bitonic top K paper referenced above,
         // Figure5(a) shows that element[1] is in the
         // second half of the group when group size is 2, but it is in the
         // first half of the group when group size is 4.

         bool isFirstInPair = imod(elemIdx, 2 * inc) < inc;
         int i = isFirstInPair ? elemIdx : elemIdx - inc;

         int i0 = firstPass == 1 ? i : int(getIndices(batch, i));
         int i1 = firstPass == 1 ? i + inc : int(getIndices(batch, i + inc));
         float x0 = i0 < n ? getX(batch, i0) : negativeInf;
         float x1 = i1 < n ? getX(batch, i1) : negativeInf;

         // Denotes which direction indices are in (ascending or descending).
         bool reverse = imod(elemIdx, 2 * dir) >= dir;
         bool isGreater = x0 > x1 || (x0 == x1 && i1 > i0);
         if (reverse == isGreater) { // Elements in opposite order of direction
           int iTemp = i0;
           i0 = i1;
           i1 = iTemp;
         }
         if (isFirstInPair) {
            setOutput(float(i0));
         } else {
            setOutput(float(i1));
         }
       }
     `}},gd=class{constructor(t){this.variableNames=["x","indices"],this.customUniforms=[{name:"n",type:"int"},{name:"firstPass",type:"int"},{name:"k",type:"int"}],this.outputShape=t,this.userCode=`
    void main() {
         // Takes max of indices (0, k), (1, k + 1), (2, k + 2) ...
         ivec2 coords = getOutputCoords();
         int batch = coords[0];
         int elemIdx = coords[1];

         // The output size is half of the previous size.
         // If the previous sequence is | | | | _ _ _ _  | | | |  _ _ _ _ (k=4),
         // we only need to output the indices at positions |, the indices at
         // positions _ can be thrown away, see Figure5(b) After Phase 2
         // (Merge phase) in the Bitonic Top K paper referenced above.
         // For example, the paper shows we only need to output the orange bars.
         // The output sequence should look like this | | | | | | | |.
         // Because the sequence is halved, to map the output index back
         // to the previous sequence to find the corresponding value,
         // we need to double the index. When we double the index,
         // we basically interpolate a position, so 2i looks like
         // | _ | _ | _ | _ | _ | _ | _. We move the | to the first k position
         // of each 2k positions by - elemIdx % k. E.g. for output at
         // index 4,5,6,7, we want to get the corresponding element at
         // original index 8,9,10,11, for output at index 8,9,10,11,
         // we want to get the corresponding element at original index
         // 16,17,18,19, so on and so forth.

         int i = elemIdx < k ? elemIdx : (elemIdx * 2 - imod(elemIdx, k));
         int i0 = firstPass == 1 ? i : int(getIndices(batch, i));
         int i1 = firstPass == 1 ? i + k : int(getIndices(batch, i + k));

         float x0 = getX(batch, i0);
         float x1 = i1 < n ? getX(batch, i1) : x0;

         setOutput(x0 >= x1 ? float(i0) : float(i1));
       }
     `}};function yp(r,t){t!==null&&r.disposeIntermediateTensorInfo(t)}function F2(r){let t=1;for(;t<r;)t*=2;return t}function ZU(r){let{inputs:t,backend:e,attrs:o}=r,{x:n}=t,{k:s,sorted:a}=o,i=_().getNumber("TOPK_LAST_DIM_CPU_HANDOFF_SIZE_THRESHOLD"),p=_().getNumber("TOPK_K_CPU_HANDOFF_THRESHOLD"),c=n.shape,l=c[c.length-1];if(e.shouldExecuteOnCPU([n])||l<i||s>p){let L=e.readSync(n.dataId),[M,B]=Y1(L,c,n.dtype,s,a);return[e.makeTensorInfo(M.shape,M.dtype,M.values),e.makeTensorInfo(B.shape,B.dtype,B.values)]}if(s===0)return c[c.length-1]=0,[e.makeTensorInfo(c,n.dtype,[]),e.makeTensorInfo(c,"int32",[])];if(l===1)return[n,Ts({attrs:{shape:c,dtype:"int32",value:0},backend:e})];let u=e.texData.get(n.dataId),m=u!==null&&u.isPacked,f=m?e.unpackTensor(n):n,g=y.sizeFromShape(c)/l,h=j({inputs:{x:f},attrs:{shape:[g,l]},backend:e});m&&yp(e,f);let x=F2(s),b=F2(l),S=null,w=()=>S===null?[h,h]:[h,S],E=(L,M,B)=>{let G=w(),z=new hd(B),H=[[l],[S===null?1:0],[Number.NEGATIVE_INFINITY],[L],[M]],q=S;S=e.runWebGLProgram(z,G,"int32",H),yp(e,q)};for(let L=1;L<x;L*=2){let M=L*2;for(let B=L;B>=1;B/=2)E(M,B,[g,b])}for(let L=b;L>x;L/=2){let M=w(),B=new gd([g,L/2]),z=[[l],[S===null?1:0],[x]],V=S;S=e.runWebGLProgram(B,M,"int32",z),yp(e,V);let H=x/2,q=H*2;for(let W=H;W>=1;W/=2)E(q,W,S.shape)}let $=S;S=eo({inputs:{x:S},backend:e,attrs:{begin:0,size:[g,s]}}),yp(e,$);let D=Sy({inputs:{x:h,indices:S},backend:e,attrs:{axis:1,batchDims:1}});yp(e,h);let F=c.slice(0,-1);F.push(s),$=S,S=j({inputs:{x:S},attrs:{shape:F},backend:e}),yp(e,$);let P=D;return D=j({inputs:{x:D},attrs:{shape:F},backend:e}),yp(e,P),[D,S]}var _2={kernelName:xi,backendName:"webgl",kernelFunc:ZU};var xd=class{constructor(t,e,o,n,s,a){this.variableNames=["Image","Transforms"],this.outputShape=a;let i=o==="nearest"?1:2,p;switch(n){case"constant":p=1;break;case"reflect":p=2;break;case"wrap":p=3;break;case"nearest":p=4;break;default:p=1;break}this.userCode=`
            float mapCoord(float outCoord, float len) {
              float inCoord = outCoord;
              if(${p} == 2) {
                if (inCoord < 0.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz2 = 2.0 * len;
                    if (inCoord < sz2) {
                      inCoord = sz2 * float(int(float(-inCoord / sz2))) +
                      inCoord;
                    }
                    inCoord = inCoord < -len ? inCoord + sz2 : -inCoord - 1.0;
                  }
                } else if (inCoord > len - 1.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz2 = 2.0 * len;
                    inCoord -= sz2 * float(int(float(inCoord / sz2)));
                    if (inCoord >= len) {
                      inCoord = sz2 - inCoord - 1.0;
                    }
                  }
                }
                return clamp(inCoord, 0.0, len - 1.0);
              } else if (${p} == 3) {
                if (inCoord < 0.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz = len - 1.0;
                    inCoord += len * (float(int(float(-inCoord / sz))) + 1.0);
                  }
                } else if (inCoord > len - 1.0) {
                  if (len <= 1.0) {
                    inCoord = 0.0;
                  } else {
                    float sz = len - 1.0;
                    inCoord -= len * float(int(float(inCoord / sz)));
                  }
                }
                return clamp(inCoord, 0.0, len - 1.0);
              } else if (${p} == 4) {
                return clamp(outCoord, 0.0, len - 1.0);
              } else {
                return outCoord;
              }
            }

            float readWithFillValue(int batch, int coordY, int coordX,
              int channel) {
              float outputValue;
              if (0 <= coordY && coordY < ${t} && 0 <= coordX && coordX < ${e}) {
                  outputValue = getImage(batch, coordY, coordX, channel);
              } else {
                outputValue = float(${s});
              }
              return outputValue;
            }

            void main() {
              ivec4 coords = getOutputCoords();
              float outputValue;
              int batch = coords[0];
              int x = coords[2];
              int y = coords[1];
              int channel = coords[3];
              float xf = float(x);
              float yf = float(y);
              float a1 = getTransforms(batch, 0);
              float a2 = getTransforms(batch, 1);
              float a3 = getTransforms(batch, 2);
              float b1 = getTransforms(batch, 3);
              float b2 = getTransforms(batch, 4);
              float b3 = getTransforms(batch, 5);
              float c1 = getTransforms(batch, 6);
              float c2 = getTransforms(batch, 7);
              float projection = c1 * xf + c2 * yf + 1.0;
              if (projection == 0.0) {
                outputValue = float(${s});
              } else {
                float inX = (a1 * xf + a2 * yf + a3) / projection;
                float inY = (b1 * xf + b2 * yf + b3) / projection;
                float mapX = mapCoord(inX, float(${e}));
                float mapY = mapCoord(inY, float(${t}));

                if (${i} == 1) {
                  int coordY = int(round(mapY));
                  int coordX = int(round(mapX));
                  outputValue = readWithFillValue(batch, coordY, coordX,
                    channel);
                } else {
                  float yFloor = floor(mapY);
                  float xFloor = floor(mapX);
                  float yCeil = yFloor + 1.0;
                  float xCeil = xFloor + 1.0;
                  float valueYFloor = (xCeil - mapX) *
                  readWithFillValue(batch, int(yFloor), int(xFloor), channel) +
                  (mapX - xFloor) *
                  readWithFillValue(batch, int(yFloor), int(xCeil), channel);
                  float valueYCeil = (xCeil - mapX) *
                  readWithFillValue(batch, int(yCeil), int(xFloor), channel) +
                  (mapX - xFloor) *
                  readWithFillValue(batch, int(yCeil), int(xCeil), channel);
                  outputValue = (yCeil - mapY) * valueYFloor +
                  (mapY - yFloor) * valueYCeil;
                }
              }
              setOutput(outputValue);
            }
        `}};function QU(r){let{inputs:t,backend:e,attrs:o}=r,{image:n,transforms:s}=t,{interpolation:a,fillMode:i,fillValue:p,outputShape:c}=o,[l,u,m,f]=n.shape,[d,g]=c!=null?c:[u,m],h=[l,d,g,f],x=new xd(u,m,a,i,p,h);return e.runWebGLProgram(x,[n,s],"float32")}var O2={kernelName:yi,backendName:"webgl",kernelFunc:QU};function JU(r){let{inputs:t,attrs:e,backend:o}=r,{axis:n}=e,{x:s}=t;nn(s,"unique"),console.warn("WARNING: ","UI might be locked temporarily as data is being downloaded");let a=o.readSync(s.dataId),{outputValues:i,outputShape:p,indices:c}=Z1(a,n,s.shape,s.dtype);return[o.makeTensorInfo(p,s.dtype,i),o.makeTensorInfo([c.length],"int32",c)]}var P2={kernelName:bi,backendName:"webgl",kernelFunc:JU};function tH(r){let{inputs:t,backend:e,attrs:o}=r,{value:n}=t,{axis:s}=o;s<0&&(s+=n.shape.length);let a=n,i=a.shape.length,p=n.shape[s],c=new Array(i-1),l=0;for(let g=0;g<i;g++)g!==s&&(c[l++]=a.shape[g]);let u=[],m=new Array(i).fill(0),f=a.shape.slice();f[s]=1;let d=new Array(p);for(let g=0;g<d.length;g++){m[s]=g;let h=eo({inputs:{x:a},backend:e,attrs:{begin:m,size:f}}),x=j({inputs:{x:h},backend:e,attrs:{shape:c}});d[g]=x,u.push(h)}return u.forEach(g=>e.disposeIntermediateTensorInfo(g)),d}var L2={kernelName:jn,backendName:"webgl",kernelFunc:tH};var yd=class{constructor(t,e){this.variableNames=["x","segmentIds"];let o=t.windowSize,n=t.batchSize,s=t.inSize,a=t.numSegments,i=a*Math.ceil(s/o);this.outputShape=[n,i];let p="0.0",c="sumValue",l=Math.floor(o/4)*4,u=o%4,m=`
        sumValue += dot(values, segFilter);
    `,f="";s%o>0&&(f=`
        if (inIdx < 0 || inIdx >= ${s}) {
          return initializationValue;
        }
      `);let d="";s%o>0&&(d=`
        if (inIdx < 0 || inIdx >= ${s}) {
          return -1.0;
        }
      `),this.userCode=`
      const float initializationValue = ${p};

      float getValue(int batch, int inIdx) {
        ${f}
        return getX(batch, inIdx);
      }

      float getSegmentIdAtIndex(int inIdx) {
        ${d}
        return getSegmentIds(inIdx);
      }

      void main() {
        ivec2 coords = getOutputCoords();
        int batch = coords[0];
        int outIdx = coords[1];
        int inOffset = int(floor(float(outIdx) / float(
          ${a})) * float(${o}));
        int currentSeg = int(mod(float(outIdx), float(${a})));

        float sumValue = 0.0;

        for (int i = 0; i < ${l}; i += 4) {
          int inIdx = inOffset + i;
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            getValue(batch, inIdx + 3)
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 2)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 3)) == currentSeg ? 1 : 0
          );

          ${m}
        }

        int inIdx = inOffset + ${l};
        if (${u===1}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            initializationValue,
            initializationValue,
            initializationValue
          );

          int inIdxSeg = int(getSegmentIdAtIndex(inIdx));

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            0,
            0,
            0
          );

          ${m}
        } else if (${u===2}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            initializationValue,
            initializationValue
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
              0,
              0
          );

          ${m}
        } else if (${u===3}) {
          vec4 values = vec4(
            getValue(batch, inIdx),
            getValue(batch, inIdx + 1),
            getValue(batch, inIdx + 2),
            initializationValue
          );

          vec4 segFilter = vec4(
            int(getSegmentIdAtIndex(inIdx)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 1)) == currentSeg ? 1 : 0,
            int(getSegmentIdAtIndex(inIdx + 2)) == currentSeg ? 1 : 0,
            0
          );

          ${m}
        }
        setOutput(${c});
      }
    `}};function eH(r){let{inputs:t,backend:e,attrs:o}=r,{x:n,segmentIds:s}=t,{numSegments:a}=o,i=n.shape.length,p=[],c=0,l=I.getAxesPermutation([c],i),u=n;l!=null&&(u=Ht({inputs:{x:n},backend:e,attrs:{perm:l}}),p.push(u),c=I.getInnerMostAxes(1,i)[0]);let m=I.segment_util.computeOutShape(u.shape,c,a),f=y.sizeFromShape([u.shape[c]]),d=j({inputs:{x:u},backend:e,attrs:{shape:[-1,f]}});p.push(d);let g=Ys(n.dtype),h=(w,E,$,D,F)=>{let P=w.shape[0],L=w.shape[1],M=I.segment_util.segOpComputeOptimalWindowSize(L,F),B={windowSize:M,inSize:L,batchSize:P,numSegments:F},G=new yd(B,E),z=e.compileAndRun(G,[w,$],D);if(p.push(z),z.shape[1]===F)return z;let V=Ey({backend:e,attrs:{start:0,stop:F,step:1,dtype:"float32"}}),H=$y({inputs:{x:V},backend:e,attrs:{reps:[L/M]}});return p.push(V),p.push(H),h(z,E,H,D,F)},x=h(d,"unsortedSegmentSum",s,g,a),b=j({inputs:{x},backend:e,attrs:{shape:m}}),S=b;if(l!=null){p.push(b);let w=I.getUndoAxesPermutation(l);S=Ht({inputs:{x:S},backend:e,attrs:{perm:w}})}return p.forEach(w=>e.disposeIntermediateTensorInfo(w)),S}var M2={kernelName:Yn,backendName:"webgl",kernelFunc:eH};var rH=[Nk,Ik,kk,Ek,Ak,Dk,Rk,Fk,Pk,Lk,Mk,Bk,Gk,Vk,zk,Wk,Uk,Hk,qk,Kk,Xk,Yk,Zk,Qk,rE,nE,sE,dk,iE,cE,lE,uE,mE,fE,dE,hE,gE,xE,yE,TE,SE,wE,NE,vE,IE,kE,EE,$E,AE,DE,RE,FE,_E,OE,PE,ME,BE,GE,VE,WE,UE,HE,qE,KE,XE,jE,YE,ZE,fk,QE,pE,JE,t$,e$,hk,r$,o$,n$,s$,a$,i$,p$,c$,l$,u$,f$,d$,h$,g$,x$,y$,C$,S$,w$,N$,v$,I$,D$,yk,R$,F$,_$,O$,Jk,P$,B$,G$,V$,z$,gk,W$,U$,H$,q$,tE,k$,K$,X$,j$,Ck,Y$,Z$,Q$,J$,t2,e2,r2,o2,n2,s2,a2,i2,p2,c2,l2,u2,jk,A$,m2,f2,d2,h2,g2,x2,y2,b2,T2,S2,N2,v2,I2,k2,E2,$2,$$,Sk,A2,D2,R2,_2,O2,wk,P2,L2,M2,L$];for(let r of rH)Rp(r);var oH=_();oH.registerFlag("KEEP_INTERMEDIATE_TENSORS",()=>!1,r=>{r&&console.warn("Keep intermediate tensors is ON. This will print the values of all intermediate tensors during model inference. Not all models support this mode. For details, check e2e/benchmarks/ model_config.js. This significantly impacts performance.")});var Sr;(function(r){r[r.DT_INVALID=0]="DT_INVALID",r[r.DT_FLOAT=1]="DT_FLOAT",r[r.DT_DOUBLE=2]="DT_DOUBLE",r[r.DT_INT32=3]="DT_INT32",r[r.DT_UINT8=4]="DT_UINT8",r[r.DT_INT16=5]="DT_INT16",r[r.DT_INT8=6]="DT_INT8",r[r.DT_STRING=7]="DT_STRING",r[r.DT_COMPLEX64=8]="DT_COMPLEX64",r[r.DT_INT64=9]="DT_INT64",r[r.DT_BOOL=10]="DT_BOOL",r[r.DT_QINT8=11]="DT_QINT8",r[r.DT_QUINT8=12]="DT_QUINT8",r[r.DT_QINT32=13]="DT_QINT32",r[r.DT_BFLOAT16=14]="DT_BFLOAT16",r[r.DT_QINT16=15]="DT_QINT16",r[r.DT_QUINT16=16]="DT_QUINT16",r[r.DT_UINT16=17]="DT_UINT16",r[r.DT_COMPLEX128=18]="DT_COMPLEX128",r[r.DT_HALF=19]="DT_HALF",r[r.DT_RESOURCE=20]="DT_RESOURCE",r[r.DT_VARIANT=21]="DT_VARIANT",r[r.DT_UINT32=22]="DT_UINT32",r[r.DT_UINT64=23]="DT_UINT64",r[r.DT_FLOAT_REF=101]="DT_FLOAT_REF",r[r.DT_DOUBLE_REF=102]="DT_DOUBLE_REF",r[r.DT_INT32_REF=103]="DT_INT32_REF",r[r.DT_UINT8_REF=104]="DT_UINT8_REF",r[r.DT_INT16_REF=105]="DT_INT16_REF",r[r.DT_INT8_REF=106]="DT_INT8_REF",r[r.DT_STRING_REF=107]="DT_STRING_REF",r[r.DT_COMPLEX64_REF=108]="DT_COMPLEX64_REF",r[r.DT_INT64_REF=109]="DT_INT64_REF",r[r.DT_BOOL_REF=110]="DT_BOOL_REF",r[r.DT_QINT8_REF=111]="DT_QINT8_REF",r[r.DT_QUINT8_REF=112]="DT_QUINT8_REF",r[r.DT_QINT32_REF=113]="DT_QINT32_REF",r[r.DT_BFLOAT16_REF=114]="DT_BFLOAT16_REF",r[r.DT_QINT16_REF=115]="DT_QINT16_REF",r[r.DT_QUINT16_REF=116]="DT_QUINT16_REF",r[r.DT_UINT16_REF=117]="DT_UINT16_REF",r[r.DT_COMPLEX128_REF=118]="DT_COMPLEX128_REF",r[r.DT_HALF_REF=119]="DT_HALF_REF",r[r.DT_RESOURCE_REF=120]="DT_RESOURCE_REF",r[r.DT_VARIANT_REF=121]="DT_VARIANT_REF",r[r.DT_UINT32_REF=122]="DT_UINT32_REF",r[r.DT_UINT64_REF=123]="DT_UINT64_REF"})(Sr||(Sr={}));var B2;(function(r){let t;(function(e){e[e.LEGACY=0]="LEGACY",e[e.V1=1]="V1",e[e.V2=2]="V2"})(t=r.CheckpointFormatVersion||(r.CheckpointFormatVersion={}))})(B2||(B2={}));var sH={};function bd(r){return sH[r]}function T(r,t,e,o,n){let s=t.inputParams[r];if(s&&s.inputIndexStart!==void 0){let i=s.inputIndexStart,p=s.inputIndexEnd===0?void 0:s.inputIndexEnd===void 0?i+1:s.inputIndexEnd;if(s.type==="tensor")return ge(t.inputNames[s.inputIndexStart],e,o,n);if(s.type==="tensors")return t.inputNames.slice(i,p).map(m=>ge(m,e,o,n));let c=ge(t.inputNames.slice(i)[0],e,o,n),l=c.dataSync();return s.type==="number"?l[0]:y.toNestedArray(c.shape,l)}let a=t.attrParams[r];return a&&a.value}function ge(r,t,e,o){let[n,s]=Ue(r);if(o!=null){let i=o.getHashTableHandleByName(n);if(i!=null)return i}let a=e.currentContextIds.find(i=>!!t[Cd(n,i)]);return a!==void 0?t[Cd(n,a)][s]:void 0}function G2(r,t,e){return t[Cd(r,e.currentContextId)]}function Lr(r,t){let[e,o,n]=Ue(r);return[Cd(e,t&&t.currentContextId),o,n]}function Cd(r,t){return t?`${r}-${t}`:r}function Ue(r){let t=r.split(":");if(t.length===1)return[r,0,void 0];let e=t[0],o=t.length===3?t[1]:void 0,n=Number(t[t.length-1]);return[e,n,o]}function su(r,t,e){let o=T("pad",r,t,e);if(o==="explicit"){o=T("explicitPaddings",r,t,e);let n=[[0,0],[0,0],[0,0],[0,0]];for(let s=0;s<4;s++)n[s][0]=o[s*2],n[s][1]=o[s*2+1];return n}return o}function ro(r){return r.kept?r:He(r)}var Ay={};At(Ay,{json:()=>aH});var aH=[{tfOpName:"Add",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"AddV2",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"AddN",category:"arithmetic",inputs:[{start:0,end:0,name:"tensors",type:"tensors"}]},{tfOpName:"BiasAdd",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0}]},{tfOpName:"Sub",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"RealDiv",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Div",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"DivNoNan",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"FloorDiv",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Mul",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Maximum",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Minimum",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Pow",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"SquaredDifference",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Mod",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"FloorMod",category:"arithmetic",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]}];var Dy={};At(Dy,{json:()=>iH});var iH=[{tfOpName:"Abs",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Acos",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Asin",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Atan",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Atan2",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"y",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Ceil",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"ClipByValue",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"clipValueMin",type:"number"},{start:2,name:"clipValueMax",type:"number"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Complex",category:"basic_math",inputs:[{start:0,name:"real",type:"tensor"},{start:1,name:"imag",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"ComplexAbs",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Cos",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Cosh",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Elu",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Exp",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Floor",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Log",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Imag",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"Tout",name:"outputType",type:"dtype",notSupported:!0}]},{tfOpName:"Neg",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Real",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"Tout",name:"outputType",type:"dtype",notSupported:!0}]},{tfOpName:"Prelu",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"alpha",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Relu",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Relu6",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Selu",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Sigmoid",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Sin",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Sinh",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Sqrt",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Rsqrt",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Square",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Tan",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Tanh",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Sign",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Round",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Expm1",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Log1p",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Reciprocal",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Softplus",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Asinh",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Acosh",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Atanh",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Erf",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Prod",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axes",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool",notSupported:!0},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"LeakyRelu",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"alpha",name:"alpha",type:"number",defaultValue:.2},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"IsNan",category:"basic_math",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]}];var Ry={};At(Ry,{json:()=>pH});var pH=[{tfOpName:"EmptyTensorList",category:"control",inputs:[{start:0,name:"elementShape",type:"shape"},{start:1,name:"maxNumElements",type:"number"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"LoopCond",category:"control",inputs:[{start:0,name:"pred",type:"tensor"}]},{tfOpName:"Switch",category:"control",inputs:[{start:0,name:"data",type:"tensor"},{start:1,name:"pred",type:"tensor"}]},{tfOpName:"Merge",category:"control",inputs:[{start:0,end:0,name:"tensors",type:"tensors"}]},{tfOpName:"Enter",category:"control",inputs:[{start:0,name:"tensor",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"frame_name",name:"frameName",type:"string"},{tfName:"is_constant",name:"isConstant",type:"bool"}]},{tfOpName:"Exit",category:"control",inputs:[{start:0,name:"tensor",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"NextIteration",category:"control",inputs:[{start:0,name:"tensor",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"TensorArrayV3",category:"control",inputs:[{start:0,name:"size",type:"number"}],attrs:[{tfName:"dtype",name:"dtype",type:"dtype"},{tfName:"element_shape",name:"elementShape",type:"shape"},{tfName:"dynamic_size",name:"dynamicSize",type:"bool"},{tfName:"clear_after_read",name:"clearAfterRead",type:"bool"},{tfName:"identical_element_shapes",name:"identicalElementShapes",type:"bool"},{tfName:"tensor_array_name",name:"name",type:"string"}]},{tfOpName:"TensorArrayWriteV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"},{start:1,name:"index",type:"number"},{start:2,name:"tensor",type:"tensor"},{start:3,name:"flowIn",type:"number"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"TensorArrayReadV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"},{start:1,name:"index",type:"number"},{start:2,name:"flowIn",type:"number"}],attrs:[{tfName:"dtype",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"TensorArrayGatherV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"},{start:1,name:"indices",type:"number[]"},{start:2,name:"flowIn",type:"number"}],attrs:[{tfName:"dtype",name:"dtype",type:"dtype"},{tfName:"element_shape",name:"elementShape",type:"shape"}]},{tfOpName:"TensorArrayScatterV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"},{start:1,name:"indices",type:"number[]"},{start:2,name:"tensor",type:"tensor"},{start:3,name:"flowIn",type:"number"}],attrs:[{tfName:"T",name:"dtype",type:"dtype"}]},{tfOpName:"TensorArrayConcatV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"},{start:1,name:"flowIn",type:"number"}],attrs:[{tfName:"dtype",name:"dtype",type:"dtype"},{tfName:"element_shape_except0",name:"elementShapeExcept0",type:"shape",notSupported:!0}]},{tfOpName:"TensorArraySplitV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"},{start:1,name:"tensor",type:"tensor"},{start:2,name:"lengths",type:"number[]"},{start:3,name:"flowIn",type:"number"}],attrs:[{tfName:"T",name:"dtype",type:"dtype"}]},{tfOpName:"TensorArraySizeV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"},{start:1,name:"flowIn",type:"number"}]},{tfOpName:"TensorArrayCloseV3",category:"control",inputs:[{start:0,name:"tensorArrayId",type:"tensor"}]},{tfOpName:"StatelessIf",category:"control",inputs:[{start:0,name:"cond",type:"tensor"},{start:1,end:0,name:"args",type:"tensors"}],attrs:[{tfName:"then_branch",name:"thenBranch",type:"func"},{tfName:"else_branch",name:"elseBranch",type:"func"}]},{tfOpName:"If",category:"control",inputs:[{start:0,name:"cond",type:"tensor"},{start:1,end:0,name:"args",type:"tensors"}],attrs:[{tfName:"then_branch",name:"thenBranch",type:"func"},{tfName:"else_branch",name:"elseBranch",type:"func"}]},{tfOpName:"StatelessWhile",category:"control",inputs:[{start:0,end:0,name:"args",type:"tensors"}],attrs:[{tfName:"cond",name:"cond",type:"func"},{tfName:"body",name:"body",type:"func"}]},{tfOpName:"While",category:"control",inputs:[{start:0,end:0,name:"args",type:"tensors"}],attrs:[{tfName:"cond",name:"cond",type:"func"},{tfName:"body",name:"body",type:"func"}]},{tfOpName:"TensorListScatter",category:"control",inputs:[{start:0,name:"tensor",type:"tensor"},{start:1,name:"indices",type:"number[]"},{start:2,name:"elementShape",type:"shape"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListScatterV2",category:"control",inputs:[{start:0,name:"tensor",type:"tensor"},{start:1,name:"indices",type:"number[]"},{start:2,name:"elementShape",type:"shape"},{start:3,name:"numElements",type:"number"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListGather",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"},{start:1,name:"indices",type:"number[]"},{start:2,name:"elementShape",type:"shape"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListGetItem",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"},{start:1,name:"index",type:"number"},{start:2,name:"elementShape",type:"shape"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListSetItem",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"},{start:1,name:"index",type:"number"},{start:2,name:"tensor",type:"tensor"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListReserve",category:"control",inputs:[{start:0,name:"elementShape",type:"shape"},{start:1,name:"numElements",type:"number"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListFromTensor",category:"control",inputs:[{start:0,name:"tensor",type:"tensor"},{start:1,name:"elementShape",type:"shape"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListStack",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"},{start:1,name:"elementShape",type:"shape"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"},{tfName:"num_elements",name:"numElements",type:"dtype"}]},{tfOpName:"TensorListSplit",category:"control",inputs:[{start:0,name:"tensor",type:"tensor"},{start:1,name:"elementShape",type:"shape"},{start:2,name:"lengths",type:"number[]"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListConcat",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"}],attrs:[{tfName:"element_shape",name:"elementShape",type:"shape"},{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListConcatV2",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"}],attrs:[{tfName:"element_shape",name:"elementShape",type:"shape"},{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListPopBack",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"},{start:1,name:"elementShape",type:"shape"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListPushBack",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"},{start:1,name:"tensor",type:"tensor"}],attrs:[{tfName:"element_dtype",name:"elementDType",type:"dtype"}]},{tfOpName:"TensorListLength",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"}]},{tfOpName:"TensorListResize",category:"control",inputs:[{start:0,name:"tensorListId",type:"tensor"},{start:1,name:"size",type:"number"}]}];var Fy={};At(Fy,{json:()=>cH});var cH=[{tfOpName:"AvgPool",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0},{tfName:"ksize",name:"kernelSize",type:"number[]"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"MaxPool",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0},{tfName:"ksize",name:"kernelSize",type:"number[]"},{tfName:"explicit_paddings",name:"explicitPaddings",type:"number[]",defaultValue:[],notSupported:!0},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"MaxPoolWithArgmax",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"ksize",name:"kernelSize",type:"number[]"},{tfName:"include_batch_in_index",name:"includeBatchInIndex",type:"bool"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"AvgPool3D",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0},{tfName:"ksize",name:"kernelSize",type:"number[]"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"MaxPool3D",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0},{tfName:"ksize",name:"kernelSize",type:"number[]"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Conv1D",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"filter",type:"tensor"}],attrs:[{tfName:"stride",name:"stride",type:"number"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",defaultValue:"NWC"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"dilation",name:"dilation",type:"number",defaultValue:1}]},{tfOpName:"Conv2D",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"filter",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"useCudnnOnGpu",name:"useCudnnOnGpu",type:"bool"},{tfName:"data_format",name:"dataFormat",type:"string",defaultValue:"NHWC"},{tfName:"explicit_paddings",name:"explicitPaddings",type:"number[]",defaultValue:[]},{tfName:"dilations",name:"dilations",type:"number[]"}]},{tfOpName:"_FusedConv2D",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"filter",type:"tensor"},{start:2,end:0,name:"args",type:"tensors"}],attrs:[{tfName:"num_args",name:"numArgs",type:"number"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"explicit_paddings",name:"explicitPaddings",type:"number[]",defaultValue:[]},{tfName:"use_cudnn_on_gpu",name:"useCudnnOnGpu",type:"bool",defaultValue:!0},{tfName:"data_format",name:"dataFormat",type:"string",defaultValue:"NHWC"},{tfName:"dilations",name:"dilations",type:"number[]",defaultValue:[1,1,1,1]},{tfName:"fused_ops",name:"fusedOps",type:"string[]",defaultValue:[]},{tfName:"epsilon",name:"epsilon",type:"number",defaultValue:1e-4},{tfName:"leakyrelu_alpha",name:"leakyreluAlpha",type:"number",defaultValue:.2}]},{tfOpName:"Conv2DBackpropInput",category:"convolution",inputs:[{start:2,name:"x",type:"tensor"},{start:1,name:"filter",type:"tensor"},{start:0,name:"outputShape",type:"number[]"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0},{tfName:"explicit_paddings",name:"explicitPaddings",type:"number[]",defaultValue:[]},{tfName:"dilations",name:"dilations",type:"number[]",notSupported:!0}]},{tfOpName:"DepthwiseConv2d",category:"convolution",inputs:[{start:0,name:"input",type:"tensor"},{start:1,name:"filter",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",defaultValue:"NHWC"},{tfName:"explicit_paddings",name:"explicitPaddings",type:"number[]",defaultValue:[]},{tfName:"dilations",name:"dilations",type:"number[]"}]},{tfOpName:"DepthwiseConv2dNative",category:"convolution",inputs:[{start:0,name:"input",type:"tensor"},{start:1,name:"filter",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",defaultValue:"NHWC"},{tfName:"explicit_paddings",name:"explicitPaddings",type:"number[]",defaultValue:[]},{tfName:"dilations",name:"dilations",type:"number[]"}]},{tfOpName:"FusedDepthwiseConv2dNative",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"filter",type:"tensor"},{start:2,end:0,name:"args",type:"tensors"}],attrs:[{tfName:"num_args",name:"numArgs",type:"number"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",defaultValue:"NHWC"},{tfName:"dilations",name:"dilations",type:"number[]",defaultValue:[1,1,1,1]},{tfName:"fused_ops",name:"fusedOps",type:"string[]",defaultValue:[]},{tfName:"explicit_paddings",name:"explicitPaddings",type:"number[]",defaultValue:[]}]},{tfOpName:"Conv3D",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"filter",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"padding",name:"pad",type:"string"},{tfName:"data_format",name:"dataFormat",type:"string",defaultValue:"NHWC"},{tfName:"dilations",name:"dilations",type:"number[]"}]},{tfOpName:"Dilation2D",category:"convolution",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"filter",type:"tensor"}],attrs:[{tfName:"strides",name:"strides",type:"number[]"},{tfName:"rates",name:"dilations",type:"number[]"},{tfName:"padding",name:"pad",type:"string"}]}];var _y={};At(_y,{json:()=>lH});var lH=[{tfOpName:"Fill",category:"creation",inputs:[{start:0,name:"shape",type:"number[]"},{start:1,name:"value",type:"number"}],attrs:[{tfName:"T",name:"dtype",type:"dtype"}]},{tfOpName:"LinSpace",category:"creation",inputs:[{start:0,name:"start",type:"number"},{start:1,name:"stop",type:"number"},{start:2,name:"num",type:"number"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"OneHot",category:"creation",inputs:[{start:0,name:"indices",type:"tensor"},{start:1,name:"depth",type:"number"},{start:2,name:"onValue",type:"number",defaultValue:1},{start:3,name:"offValue",type:"number",defaultValue:0}],attrs:[{tfName:"axis",name:"axis",type:"number",notSupported:!0},{tfName:"T",name:"dtype",type:"dtype"}]},{tfOpName:"Ones",category:"creation",inputs:[{start:0,name:"shape",type:"number[]"}],attrs:[{tfName:"T",name:"dtype",type:"dtype"}]},{tfOpName:"OnesLike",category:"creation",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"dtype",name:"dtype",type:"dtype"}]},{tfOpName:"RandomStandardNormal",category:"creation",inputs:[{start:0,name:"shape",type:"number[]"}],attrs:[{tfName:"seed",name:"seed",type:"number",defaultValue:0},{tfName:"seed2",name:"seed2",type:"number",defaultValue:0,notSupported:!0},{tfName:"dtype",name:"dtype",type:"dtype"},{tfName:"T",name:"T",type:"number",notSupported:!0}]},{tfOpName:"RandomUniform",category:"creation",inputs:[{start:0,name:"shape",type:"number[]"}],attrs:[{tfName:"minval",name:"minval",type:"number",defaultValue:0},{tfName:"maxval",name:"maxval",type:"number",defaultValue:1},{tfName:"dtype",name:"dtype",type:"dtype"},{tfName:"seed",name:"seed",type:"number",defaultValue:0},{tfName:"seed2",name:"seed2",type:"number",defaultValue:0,notSupported:!0},{tfName:"T",name:"T",type:"number",notSupported:!0}]},{tfOpName:"Range",category:"creation",inputs:[{start:0,name:"start",type:"number"},{start:1,name:"stop",type:"number"},{start:2,name:"step",type:"number",defaultValue:0}],attrs:[{tfName:"Tidx",name:"dtype",type:"dtype"}]},{tfOpName:"TruncatedNormal",category:"creation",inputs:[{start:0,name:"shape",type:"number[]"}],attrs:[{tfName:"means",name:"mean",type:"number",defaultValue:0},{tfName:"stddev",name:"stdDev",type:"number",defaultValue:1},{tfName:"seed",name:"seed",type:"number"},{tfName:"seed2",name:"seed2",type:"number",defaultValue:0,notSupported:!0},{tfName:"dtype",name:"dtype",type:"dtype"},{tfName:"T",name:"T",type:"number",notSupported:!0}]},{tfOpName:"Zeros",category:"creation",inputs:[{start:0,name:"shape",type:"number[]"}],attrs:[{tfName:"T",name:"dtype",type:"dtype"}]},{tfOpName:"ZerosLike",category:"creation",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype"}]},{tfOpName:"Multinomial",category:"creation",inputs:[{start:0,name:"logits",type:"tensor"},{start:1,name:"numSamples",type:"number"}],attrs:[{tfName:"seed",name:"seed",type:"number"},{tfName:"seed2",name:"seed2",type:"number"},{tfName:"T",name:"dtype",type:"dtype"},{tfName:"output_dtype",name:"output_dtype",type:"dtype"}]}];var Oy={};At(Oy,{json:()=>uH});var uH=[{tfOpName:"NonMaxSuppressionV2",category:"dynamic",inputs:[{start:0,name:"boxes",type:"tensor"},{start:1,name:"scores",type:"tensor"},{start:2,name:"maxOutputSize",type:"number"},{start:3,name:"iouThreshold",type:"number"}]},{tfOpName:"NonMaxSuppressionV3",category:"dynamic",inputs:[{start:0,name:"boxes",type:"tensor"},{start:1,name:"scores",type:"tensor"},{start:2,name:"maxOutputSize",type:"number"},{start:3,name:"iouThreshold",type:"number"},{start:4,name:"scoreThreshold",type:"number"}]},{tfOpName:"NonMaxSuppressionV4",category:"dynamic",inputs:[{start:0,name:"boxes",type:"tensor"},{start:1,name:"scores",type:"tensor"},{start:2,name:"maxOutputSize",type:"number"},{start:3,name:"iouThreshold",type:"number"},{start:4,name:"scoreThreshold",type:"number"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0},{tfName:"T_threshold",name:"threshold",type:"dtype",notSupported:!0},{tfName:"pad_to_max_output_size",name:"padToMaxOutputSize",type:"bool"}]},{tfOpName:"NonMaxSuppressionV5",category:"dynamic",inputs:[{start:0,name:"boxes",type:"tensor"},{start:1,name:"scores",type:"tensor"},{start:2,name:"maxOutputSize",type:"number"},{start:3,name:"iouThreshold",type:"number"},{start:4,name:"scoreThreshold",type:"number"},{start:5,name:"softNmsSigma",type:"number"}]},{tfOpName:"Where",category:"dynamic",inputs:[{start:0,name:"condition",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"ListDiff",category:"dynamic",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"y",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]}];var Py={};At(Py,{json:()=>mH});var mH=[{tfOpName:"LowerBound",category:"evaluation",inputs:[{start:0,name:"sortedSequence",type:"tensor"},{start:1,name:"values",type:"tensor"}]},{tfOpName:"TopKV2",category:"evaluation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"k",type:"number"}],attrs:[{tfName:"sorted",name:"sorted",type:"bool"}]},{tfOpName:"UpperBound",category:"evaluation",inputs:[{start:0,name:"sortedSequence",type:"tensor"},{start:1,name:"values",type:"tensor"}]},{tfOpName:"Unique",category:"evaluation",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"UniqueV2",category:"evaluation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number"}]}];var Ly={};At(Ly,{json:()=>fH});var fH=[{tfOpName:"PlaceholderWithDefault",category:"graph",inputs:[{start:0,name:"default",type:"tensor"}],attrs:[{tfName:"shape",name:"shape",type:"shape"},{tfName:"dtype",name:"dtype",type:"dtype"}]},{tfOpName:"Placeholder",category:"graph",attrs:[{tfName:"shape",name:"shape",type:"shape"},{tfName:"dtype",name:"dtype",type:"dtype"}]},{tfOpName:"Const",category:"graph"},{tfOpName:"Identity",category:"graph",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"IdentityN",category:"graph",inputs:[{start:0,end:0,name:"x",type:"tensors"}]},{tfOpName:"Snapshot",category:"graph",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"Rank",category:"graph",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"Size",category:"graph",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"Shape",category:"graph",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"ShapeN",category:"graph",inputs:[{start:0,end:0,name:"x",type:"tensors"}]},{tfOpName:"Print",category:"graph",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"data",type:"tensors"}],attrs:[{tfName:"message",name:"message",type:"string"},{tfName:"first_n",name:"firstN",type:"number",notSupported:!0},{tfName:"summarize",name:"summarize",type:"number",defaultValue:3}]},{tfOpName:"NoOp",category:"graph",inputs:[]},{tfOpName:"StopGradient",category:"graph",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"FakeQuantWithMinMaxVars",category:"graph",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"min",name:"min",type:"number"},{tfName:"max",name:"max",type:"number"}]}];var My={};At(My,{json:()=>dH});var dH=[{tfOpName:"HashTable",category:"hash_table",inputs:[],attrs:[{tfName:"shared_name",name:"sharedName",type:"string"},{tfName:"use_node_name_sharing",name:"useNodeNameSharing",type:"bool"},{tfName:"key_dtype",name:"keyDType",type:"dtype"},{tfName:"value_dtype",name:"valueDType",type:"dtype"}]},{tfOpName:"HashTableV2",category:"hash_table",inputs:[],attrs:[{tfName:"shared_name",name:"sharedName",type:"string"},{tfName:"use_node_name_sharing",name:"useNodeNameSharing",type:"bool"},{tfName:"key_dtype",name:"keyDType",type:"dtype"},{tfName:"value_dtype",name:"valueDType",type:"dtype"}]},{tfOpName:"LookupTableImport",category:"hash_table",inputs:[{start:0,name:"tableHandle",type:"tensor"},{start:1,name:"keys",type:"tensor"},{start:2,name:"values",type:"tensor"}],attrs:[{tfName:"Tin",name:"tIn",type:"dtype",notSupported:!0},{tfName:"Tout",name:"tOut",type:"dtype",notSupported:!0}]},{tfOpName:"LookupTableImportV2",category:"hash_table",inputs:[{start:0,name:"tableHandle",type:"tensor"},{start:1,name:"keys",type:"tensor"},{start:2,name:"values",type:"tensor"}],attrs:[{tfName:"Tin",name:"tIn",type:"dtype",notSupported:!0},{tfName:"Tout",name:"tOut",type:"dtype",notSupported:!0}]},{tfOpName:"LookupTableFind",category:"hash_table",inputs:[{start:0,name:"tableHandle",type:"tensor"},{start:1,name:"keys",type:"tensor"},{start:2,name:"defaultValue",type:"tensor"}],attrs:[{tfName:"Tin",name:"tIn",type:"dtype",notSupported:!0},{tfName:"Tout",name:"tOut",type:"dtype",notSupported:!0}]},{tfOpName:"LookupTableFindV2",category:"hash_table",inputs:[{start:0,name:"tableHandle",type:"tensor"},{start:1,name:"keys",type:"tensor"},{start:2,name:"defaultValue",type:"tensor"}],attrs:[{tfName:"Tin",name:"tIn",type:"dtype",notSupported:!0},{tfName:"Tout",name:"tOut",type:"dtype",notSupported:!0}]},{tfOpName:"LookupTableSize",category:"hash_table",inputs:[{start:0,name:"tableHandle",type:"tensor"}]},{tfOpName:"LookupTableSizeV2",category:"hash_table",inputs:[{start:0,name:"tableHandle",type:"tensor"}]}];var By={};At(By,{json:()=>hH});var hH=[{tfOpName:"ResizeBilinear",category:"image",inputs:[{start:0,name:"images",type:"tensor"},{start:1,name:"size",type:"number[]"}],attrs:[{tfName:"align_corners",name:"alignCorners",type:"bool"},{tfName:"half_pixel_centers",name:"halfPixelCenters",type:"bool"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"ResizeNearestNeighbor",category:"image",inputs:[{start:0,name:"images",type:"tensor"},{start:1,name:"size",type:"number[]"}],attrs:[{tfName:"align_corners",name:"alignCorners",type:"bool"},{tfName:"half_pixel_centers",name:"halfPixelCenters",type:"bool"},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"CropAndResize",category:"image",inputs:[{start:0,name:"image",type:"tensor"},{start:1,name:"boxes",type:"tensor"},{start:2,name:"boxInd",type:"tensor"},{start:3,name:"cropSize",type:"number[]"}],attrs:[{tfName:"method",name:"method",type:"string"},{tfName:"extrapolation_value",name:"extrapolationValue",type:"number"}]},{tfOpName:"ImageProjectiveTransformV3",category:"image",inputs:[{start:0,name:"images",type:"tensor"},{start:1,name:"transforms",type:"tensor"},{start:2,name:"outputShape",type:"number[]"},{start:3,name:"fillValue",type:"number"}],attrs:[{tfName:"interpolation",name:"interpolation",type:"string"},{tfName:"fill_mode",name:"fillMode",type:"string"}]}];var Gy={};At(Gy,{json:()=>gH});var gH=[{tfOpName:"Equal",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"NotEqual",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Greater",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"GreaterEqual",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Less",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"LessEqual",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"LogicalAnd",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"LogicalNot",category:"logical",inputs:[{start:0,name:"a",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"LogicalOr",category:"logical",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Select",category:"logical",inputs:[{start:0,name:"condition",type:"tensor"},{start:1,name:"a",type:"tensor"},{start:2,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"SelectV2",category:"logical",inputs:[{start:0,name:"condition",type:"tensor"},{start:1,name:"a",type:"tensor"},{start:2,name:"b",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]}];var Vy={};At(Vy,{json:()=>xH});var xH=[{tfOpName:"_FusedMatMul",category:"matrices",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"},{start:2,end:0,name:"args",type:"tensors"}],attrs:[{tfName:"num_args",name:"numArgs",type:"number"},{tfName:"fused_ops",name:"fusedOps",type:"string[]",defaultValue:[]},{tfName:"epsilon",name:"epsilon",type:"number",defaultValue:1e-4},{tfName:"transpose_a",name:"transposeA",type:"bool",defaultValue:!1},{tfName:"transpose_b",name:"transposeB",type:"bool",defaultValue:!1},{tfName:"leakyrelu_alpha",name:"leakyreluAlpha",type:"number",defaultValue:.2},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"MatMul",category:"matrices",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"transpose_a",name:"transposeA",type:"bool",defaultValue:!1},{tfName:"transpose_b",name:"transposeB",type:"bool",defaultValue:!1},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"BatchMatMul",category:"matrices",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"adj_x",name:"transposeA",type:"bool",defaultValue:!1},{tfName:"adj_y",name:"transposeB",type:"bool",defaultValue:!1},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"BatchMatMulV2",category:"matrices",inputs:[{start:0,name:"a",type:"tensor"},{start:1,name:"b",type:"tensor"}],attrs:[{tfName:"adj_x",name:"transposeA",type:"bool",defaultValue:!1},{tfName:"adj_y",name:"transposeB",type:"bool",defaultValue:!1},{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Transpose",category:"matrices",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"perm",type:"number[]"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"Einsum",category:"matrices",inputs:[{start:0,end:0,name:"tensors",type:"tensors"}],attrs:[{tfName:"equation",name:"equation",type:"string"},{tfName:"N",name:"n",type:"number",defaultValue:2},{tfName:"T",name:"dtype",type:"dtype"}]}];var zy={};At(zy,{json:()=>yH});var yH=[{tfOpName:"EuclideanNorm",category:"normalization",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool",defaultValue:!1}]},{tfOpName:"FusedBatchNorm",category:"normalization",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"scale",type:"tensor"},{start:2,name:"offset",type:"tensor"},{start:3,name:"mean",type:"tensor"},{start:4,name:"variance",type:"tensor"}],attrs:[{tfName:"epsilon",name:"epsilon",type:"number",defaultValue:.001},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0}]},{tfOpName:"FusedBatchNormV2",category:"normalization",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"scale",type:"tensor"},{start:2,name:"offset",type:"tensor"},{start:3,name:"mean",type:"tensor"},{start:4,name:"variance",type:"tensor"}],attrs:[{tfName:"epsilon",name:"epsilon",type:"number",defaultValue:.001},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0}]},{tfOpName:"FusedBatchNormV3",category:"normalization",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"scale",type:"tensor"},{start:2,name:"offset",type:"tensor"},{start:3,name:"mean",type:"tensor"},{start:4,name:"variance",type:"tensor"}],attrs:[{tfName:"epsilon",name:"epsilon",type:"number",defaultValue:.001},{tfName:"data_format",name:"dataFormat",type:"string",notSupported:!0}]},{tfOpName:"LRN",category:"normalization",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"depth_radius",name:"radius",type:"number",defaultValue:5},{tfName:"bias",name:"bias",type:"number",defaultValue:1},{tfName:"alpha",name:"alpha",type:"number",defaultValue:1},{tfName:"beta",name:"beta",type:"number",defaultValue:.5}]},{tfOpName:"Softmax",category:"normalization",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"LogSoftmax",category:"normalization",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"SparseToDense",category:"normalization",inputs:[{start:0,name:"sparseIndices",type:"tensor"},{start:1,name:"outputShape",type:"number[]"},{start:2,name:"sparseValues",type:"tensor"},{start:3,name:"defaultValue",type:"tensor"}],attrs:[{tfName:"validate_indices",name:"validateIndices",type:"bool",defaultValue:!0,notSupported:!0}]}];var Wy={};At(Wy,{json:()=>bH});var bH=[{tfOpName:"Bincount",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"size",type:"number"},{start:2,name:"weights",type:"tensor"}]},{tfOpName:"DenseBincount",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"size",type:"number"},{start:2,name:"weights",type:"tensor"}],attrs:[{tfName:"binary_output",name:"binaryOutput",type:"bool"}]},{tfOpName:"Max",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool"}]},{tfOpName:"Mean",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool"}]},{tfOpName:"Min",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool"}]},{tfOpName:"Sum",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool"}]},{tfOpName:"All",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool"}]},{tfOpName:"Any",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool"}]},{tfOpName:"ArgMax",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number"}]},{tfOpName:"ArgMin",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number"}]},{tfOpName:"Prod",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}],attrs:[{tfName:"keep_dims",name:"keepDims",type:"bool"}]},{tfOpName:"Cumprod",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number"}],attrs:[{tfName:"exclusive",name:"exclusive",type:"bool"},{tfName:"reverse",name:"reverse",type:"bool"}]},{tfOpName:"Cumsum",category:"reduction",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number"}],attrs:[{tfName:"exclusive",name:"exclusive",type:"bool"},{tfName:"reverse",name:"reverse",type:"bool"}]}];var Uy={};At(Uy,{json:()=>CH});var CH=[{tfOpName:"ConcatV2",category:"slice_join",inputs:[{start:0,end:-1,name:"tensors",type:"tensors"},{start:-1,name:"axis",type:"number"}],attrs:[{tfName:"N",name:"n",type:"number",defaultValue:2}]},{tfOpName:"Concat",category:"slice_join",inputs:[{start:1,end:0,name:"tensors",type:"tensors"},{start:0,name:"axis",type:"number"}],attrs:[{tfName:"N",name:"n",type:"number",defaultValue:2}]},{tfOpName:"GatherV2",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"indices",type:"tensor"},{start:2,name:"axis",type:"number",defaultValue:0}],attrs:[{tfName:"batch_dims",name:"batchDims",type:"number",defaultValue:0}]},{tfOpName:"Gather",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"indices",type:"tensor"}],attrs:[{tfName:"validate_indices",name:"validateIndices",type:"bool",notSupported:!0}]},{tfOpName:"Reverse",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"dims",type:"bool[]"}]},{tfOpName:"ReverseV2",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number[]"}]},{tfOpName:"Slice",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"begin",type:"number[]"},{start:2,name:"size",type:"number[]"}]},{tfOpName:"StridedSlice",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"begin",type:"number[]"},{start:2,name:"end",type:"number[]"},{start:3,name:"strides",type:"number[]"}],attrs:[{tfName:"begin_mask",name:"beginMask",type:"number",defaultValue:0},{tfName:"end_mask",name:"endMask",type:"number",defaultValue:0},{tfName:"new_axis_mask",name:"newAxisMask",type:"number",defaultValue:0},{tfName:"ellipsis_mask",name:"ellipsisMask",type:"number",defaultValue:0},{tfName:"shrink_axis_mask",name:"shrinkAxisMask",type:"number",defaultValue:0}]},{tfOpName:"Pack",category:"slice_join",inputs:[{start:0,end:0,name:"tensors",type:"tensors"}],attrs:[{tfName:"axis",name:"axis",type:"number",defaultValue:0}]},{tfOpName:"Unpack",category:"slice_join",inputs:[{start:0,name:"tensor",type:"tensor"}],attrs:[{tfName:"axis",name:"axis",type:"number",defaultValue:0},{tfName:"num",name:"num",type:"number",defaultValue:0,notSupported:!0}]},{tfOpName:"Tile",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"reps",type:"number[]"}]},{tfOpName:"Split",category:"slice_join",inputs:[{start:0,name:"axis",type:"number",defaultValue:0},{start:1,name:"x",type:"tensor"}],attrs:[{tfName:"num_split",name:"numOrSizeSplits",type:"number",defaultValue:1}]},{tfOpName:"SplitV",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"numOrSizeSplits",type:"number[]"},{start:2,name:"axis",type:"number",defaultValue:0}]},{tfOpName:"ScatterNd",category:"slice_join",inputs:[{start:0,name:"indices",type:"tensor"},{start:1,name:"values",type:"tensor"},{start:2,name:"shape",type:"number[]"}]},{tfOpName:"GatherNd",category:"slice_join",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"indices",type:"tensor"}]},{tfOpName:"SparseToDense",category:"slice_join",inputs:[{start:0,name:"sparseIndices",type:"tensor"},{start:1,name:"outputShape",type:"number[]"},{start:2,name:"sparseValues",type:"tensor"},{start:3,name:"defaultValue",type:"tensor"}],attrs:[{tfName:"validate_indices",name:"validateIndices",type:"bool",defaultValue:!1,notSupported:!0}]}];var Hy={};At(Hy,{json:()=>TH});var TH=[{tfOpName:"SparseFillEmptyRows",category:"sparse",inputs:[{start:0,name:"indices",type:"tensor"},{start:1,name:"values",type:"tensor"},{start:2,name:"denseShape",type:"tensor"},{start:3,name:"defaultValue",type:"tensor"}]},{tfOpName:"SparseReshape",category:"sparse",inputs:[{start:0,name:"inputIndices",type:"tensor"},{start:1,name:"inputShape",type:"tensor"},{start:2,name:"newShape",type:"tensor"}],attrs:[{tfName:"T",name:"dtype",type:"dtype",notSupported:!0}]},{tfOpName:"SparseSegmentMean",category:"sparse",inputs:[{start:0,name:"data",type:"tensor"},{start:1,name:"indices",type:"tensor"},{start:2,name:"segmentIds",type:"tensor"}]},{tfOpName:"SparseSegmentSum",category:"sparse",inputs:[{start:0,name:"data",type:"tensor"},{start:1,name:"indices",type:"tensor"},{start:2,name:"segmentIds",type:"tensor"}]}];var qy={};At(qy,{json:()=>SH});var SH=[{tfOpName:"FFT",category:"spectral",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"IFFT",category:"spectral",inputs:[{start:0,name:"x",type:"tensor"}]},{tfOpName:"RFFT",category:"spectral",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"fft_length",type:"number",notSupported:!0}]},{tfOpName:"IRFFT",category:"spectral",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"fft_length",type:"number",notSupported:!0}]}];var Ky={};At(Ky,{json:()=>wH});var wH=[{tfOpName:"StringNGrams",category:"string",inputs:[{start:0,name:"data",type:"tensor"},{start:1,name:"dataSplits",type:"tensor"}],attrs:[{tfName:"separator",name:"separator",type:"string"},{tfName:"ngram_widths",name:"nGramWidths",type:"number[]"},{tfName:"left_pad",name:"leftPad",type:"string"},{tfName:"right_pad",name:"rightPad",type:"string"},{tfName:"pad_width",name:"padWidth",type:"number"},{tfName:"preserve_short_sequences",name:"preserveShortSequences",type:"bool"}],outputs:["ngrams","ngrams_splits"]},{tfOpName:"StringSplit",category:"string",inputs:[{start:0,name:"input",type:"tensor"},{start:1,name:"delimiter",type:"tensor"}],attrs:[{tfName:"skip_empty",name:"skipEmpty",type:"bool"}],outputs:["indices","values","shape"]},{tfOpName:"StringToHashBucketFast",category:"string",inputs:[{start:0,name:"input",type:"tensor"}],attrs:[{tfName:"num_buckets",name:"numBuckets",type:"number"}]}];var Xy={};At(Xy,{json:()=>NH});var NH=[{tfOpName:"Cast",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"SrcT",name:"sdtype",type:"dtype",notSupported:!0},{tfName:"DstT",name:"dtype",type:"dtype"}]},{tfOpName:"ExpandDims",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"axis",type:"number"}]},{tfOpName:"MirrorPad",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"padding",type:"number[]"}],attrs:[{tfName:"mode",name:"mode",type:"string"}]},{tfOpName:"Pad",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"padding",type:"number[]"}],attrs:[{tfName:"constant_value",name:"constantValue",type:"number",defaultValue:0}]},{tfOpName:"PadV2",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"padding",type:"number[]"},{start:2,name:"constantValue",type:"number",defaultValue:0}]},{tfOpName:"Reshape",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"shape",type:"number[]"}]},{tfOpName:"Squeeze",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"axis",tfDeprecatedName:"squeeze_dims",name:"axis",type:"number[]"}]},{tfOpName:"SpaceToBatchND",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"blockShape",type:"number[]"},{start:2,name:"paddings",type:"number[]"}]},{tfOpName:"BatchToSpaceND",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"blockShape",type:"number[]"},{start:2,name:"crops",type:"number[]"}]},{tfOpName:"DepthToSpace",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"}],attrs:[{tfName:"block_size",name:"blockSize",type:"number"},{tfName:"data_format",name:"dataFormat",type:"string"}]},{tfOpName:"BroadcastTo",category:"transformation",inputs:[{start:0,name:"x",type:"tensor"},{start:1,name:"shape",type:"number[]"}],attrs:[]},{tfOpName:"BroadcastArgs",category:"transformation",inputs:[{start:0,name:"s0",type:"tensor"},{start:1,name:"s1",type:"tensor"}],attrs:[]}];var au=class{static get Instance(){return this._instance||(this._instance=new this)}constructor(){let t=[Ay,Dy,Ry,Fy,_y,Oy,Py,Ly,My,By,Gy,Vy,zy,Wy,Uy,Hy,qy,Ky,Xy],e=[].concat(...t.map(o=>o.json));this.opMappers=e.reduce((o,n)=>(o[n.tfOpName]=n,o),{})}transformGraph(t,e={}){let o=t.node,n=[],s=[],a=[],i=o.reduce((g,h)=>(g[h.name]=this.mapNode(h),h.op.startsWith("Placeholder")?n.push(g[h.name]):h.op==="Const"?s.push(g[h.name]):(h.input==null||h.input.length===0)&&a.push(g[h.name]),g),{}),p=[],c=[],l={},u={};e!=null&&(l=this.mapSignatureEntries(e.inputs),u=this.mapSignatureEntries(e.outputs));let m=Object.keys(i);m.forEach(g=>{let h=i[g];h.inputNames.forEach((x,b)=>{let[S,,w]=Lr(x),E=i[S];if(E.outputs!=null){let $=E.outputs.indexOf(w);if($!==-1){let D=`${S}:${$}`;h.inputNames[b]=D}}h.inputs.push(E),E.children.push(h)})}),Object.keys(u).length===0?m.forEach(g=>{let h=i[g];h.children.length===0&&c.push(h)}):Object.keys(u).forEach(g=>{let[h]=Lr(g),x=i[h];x!=null&&(x.signatureKey=u[g],c.push(x))}),Object.keys(l).length>0?Object.keys(l).forEach(g=>{let[h]=Lr(g),x=i[h];x&&(x.signatureKey=l[g],p.push(x))}):p=n;let f={};t.library!=null&&t.library.function!=null&&(f=t.library.function.reduce((g,h)=>(g[h.signature.name]=this.mapFunction(h),g),{}));let d={nodes:i,inputs:p,outputs:c,weights:s,placeholders:n,signature:e,functions:f};return a.length>0&&(d.initNodes=a),d}mapSignatureEntries(t){return Object.keys(t||{}).reduce((e,o)=>(e[t[o].name]=o,e),{})}mapNode(t){let e=bd(t.op)||this.opMappers[t.op]||{};t.attr==null&&(t.attr={});let o={name:t.name,op:t.op,category:e.category,inputNames:(t.input||[]).map(n=>n.startsWith("^")?n.slice(1):n),inputs:[],children:[],inputParams:{},attrParams:{},rawAttrs:t.attr,outputs:e.outputs};return e.inputs!=null&&(o.inputParams=e.inputs.reduce((n,s)=>(n[s.name]={type:s.type,inputIndexStart:s.start,inputIndexEnd:s.end},n),{})),e.attrs!=null&&(o.attrParams=e.attrs.reduce((n,s)=>{let a=s.type,i;switch(s.type){case"string":i=Td(t.attr,s.tfName,s.defaultValue),i===void 0&&s.tfDeprecatedName&&(i=Td(t.attr,s.tfDeprecatedName,s.defaultValue));break;case"string[]":i=Ed(t.attr,s.tfName,s.defaultValue),i===void 0&&s.tfDeprecatedName&&(i=Ed(t.attr,s.tfDeprecatedName,s.defaultValue));break;case"number":i=wd(t.attr,s.tfName,s.defaultValue||0),i===void 0&&s.tfDeprecatedName&&(i=wd(t.attr,s.tfDeprecatedName,s.defaultValue));break;case"number[]":i=kd(t.attr,s.tfName,s.defaultValue),i===void 0&&s.tfDeprecatedName&&(i=kd(t.attr,s.tfDeprecatedName,s.defaultValue));break;case"bool":i=Sd(t.attr,s.tfName,s.defaultValue),i===void 0&&s.tfDeprecatedName&&(i=Sd(t.attr,s.tfDeprecatedName,s.defaultValue));break;case"bool[]":i=Ad(t.attr,s.tfName,s.defaultValue),i===void 0&&s.tfDeprecatedName&&(i=Ad(t.attr,s.tfDeprecatedName,s.defaultValue));break;case"shape":i=Id(t.attr,s.tfName,s.defaultValue),i===void 0&&s.tfDeprecatedName&&(i=Id(t.attr,s.tfDeprecatedName,s.defaultValue));break;case"shape[]":i=$d(t.attr,s.tfName,s.defaultValue),i===void 0&&s.tfDeprecatedName&&(i=$d(t.attr,s.tfDeprecatedName,s.defaultValue));break;case"dtype":i=Nd(t.attr,s.tfName,s.defaultValue),i===void 0&&s.tfDeprecatedName&&(i=Nd(t.attr,s.tfDeprecatedName,s.defaultValue));break;case"dtype[]":i=vd(t.attr,s.tfName,s.defaultValue),i===void 0&&s.tfDeprecatedName&&(i=vd(t.attr,s.tfDeprecatedName,s.defaultValue));break;case"func":i=V2(t.attr,s.tfName,s.defaultValue),i===void 0&&s.tfDeprecatedName&&(i=V2(t.attr,s.tfDeprecatedName,s.defaultValue));break;case"tensor":case"tensors":break;default:throw new Error(`Unsupported param type: ${s.type} for op: ${t.op}`)}return n[s.name]={value:i,type:a},n},{})),o}mapFunction(t){let e=t.nodeDef,o=[],n=[],s={};e!=null&&(s=e.reduce((u,m)=>(u[m.name]=this.mapNode(m),m.op==="Const"&&n.push(u[m.name]),u),{}));let a=[],i=[];t.signature.inputArg.forEach(u=>{let[m]=Lr(u.name),f={name:m,op:"Placeholder",inputs:[],inputNames:[],category:"graph",inputParams:{},attrParams:{dtype:{value:jy(u.type),type:"dtype"}},children:[]};f.signatureKey=u.name,a.push(f),s[m]=f}),Object.keys(s).forEach(u=>{let m=s[u];m.inputNames.forEach((f,d)=>{let[g,,h]=Lr(f),x=s[g];if(x.outputs!=null){let b=x.outputs.indexOf(h);if(b!==-1){let S=`${g}:${b}`;m.inputNames[d]=S}}m.inputs.push(x),x.children.push(m)})});let c=t.ret;t.signature.outputArg.forEach(u=>{let[m,f]=Lr(c[u.name]),d=s[m];d!=null&&(d.defaultOutput=f,i.push(d))});let l=this.mapArgsToSignature(t);return{nodes:s,inputs:a,outputs:i,weights:n,placeholders:o,signature:l}}mapArgsToSignature(t){return{methodName:t.signature.name,inputs:t.signature.inputArg.reduce((e,o)=>(e[o.name]=this.mapArgToTensorInfo(o),e),{}),outputs:t.signature.outputArg.reduce((e,o)=>(e[o.name]=this.mapArgToTensorInfo(o,t.ret),e),{})}}mapArgToTensorInfo(t,e){let o=t.name;return e!=null&&(o=e[o]),{name:o,dtype:t.type}}};function vH(r){let t=_().global;if(typeof t.atob!="undefined")return t.atob(r);if(typeof Buffer!="undefined")return new Buffer(r,"base64").toString();throw new Error("Unable to decode base64 in this environment. Missing built-in atob() or Buffer()")}function z2(r,t){let e=Array.isArray(r)?String.fromCharCode.apply(null,r):vH(r);return t?e:e.toLowerCase()}function Td(r,t,e,o=!1){let n=r[t];return n!=null?z2(n.s,o):e}function Sd(r,t,e){let o=r[t];return o?o.b:e}function wd(r,t,e){let o=r[t]||{},n=o.i!=null?o.i:o.f!=null?o.f:e;return typeof n=="number"?n:parseInt(n,10)}function jy(r){switch(typeof r=="string"&&(r=Sr[r]),r){case Sr.DT_FLOAT:case Sr.DT_HALF:return"float32";case Sr.DT_INT32:case Sr.DT_INT64:case Sr.DT_INT8:case Sr.DT_UINT8:return"int32";case Sr.DT_BOOL:return"bool";case Sr.DT_DOUBLE:return"float32";case Sr.DT_STRING:return"string";default:return null}}function V2(r,t,e){let o=r[t];return o&&o.func?o.func.name:e}function Nd(r,t,e){let o=r[t];return o&&o.type?jy(o.type):e}function vd(r,t,e){let o=r[t];return o&&o.list&&o.list.type?o.list.type.map(n=>jy(n)):e}function W2(r){if(!r.unknownRank)return r.dim!=null?r.dim.map(t=>typeof t.size=="number"?t.size:parseInt(t.size,10)):[]}function Id(r,t,e){let o=r[t];return o&&o.shape?W2(o.shape):e}function kd(r,t,e){let o=r[t];return o?((o.list.f&&o.list.f.length?o.list.f:o.list.i)||[]).map(n=>typeof n=="number"?n:parseInt(n,10)):e}function Ed(r,t,e,o=!1){let n=r[t];return n&&n.list&&n.list.s?n.list.s.map(s=>z2(s,o)):e}function $d(r,t,e){let o=r[t];return o&&o.list&&o.list.shape?o.list.shape.map(n=>W2(n)):e}function Ad(r,t,e){let o=r[t];return o&&o.list&&o.list.b?o.list.b:e}var Dd=class{constructor(t,e,o){this.node=t,this.tensorMap=e,this.context=o,this.inputs=[],this.attrs={},this.inputs=t.inputNames.map(n=>this.getInput(n)),t.rawAttrs!=null&&(this.attrs=Object.keys(t.rawAttrs).reduce((n,s)=>(n[s]=this.getAttr(s),n),{}))}getInput(t){return ge(t,this.tensorMap,this.context)}getAttr(t,e){let o=this.node.rawAttrs[t];if(o.tensor!=null)return ge(t,this.tensorMap,this.context);if(o.i!=null||o.f!=null)return wd(this.node.rawAttrs,t,e);if(o.s!=null)return Td(this.node.rawAttrs,t,e);if(o.b!=null)return Sd(this.node.rawAttrs,t,e);if(o.shape!=null)return Id(this.node.rawAttrs,t,e);if(o.type!=null)return Nd(this.node.rawAttrs,t,e);if(o.list!=null){if(o.list.i!=null||o.list.f!=null)return kd(this.node.rawAttrs,t,e);if(o.list.s!=null)return Ed(this.node.rawAttrs,t,e);if(o.list.shape!=null)return $d(this.node.rawAttrs,t,e);if(o.list.b!=null)return Ad(this.node.rawAttrs,t,e);if(o.list.type!=null)return vd(this.node.rawAttrs,t,e)}return e}};var Pt={};At(Pt,{OP_SCOPE_SUFFIX:()=>Nu,abs:()=>le,acos:()=>Oc,acosh:()=>Pc,add:()=>tt,addN:()=>xh,all:()=>Lc,any:()=>Mc,argMax:()=>Bc,argMin:()=>Gc,asin:()=>Vc,asinh:()=>zc,atan:()=>Wc,atan2:()=>Uc,atanh:()=>Hc,avgPool:()=>Ei,avgPool3d:()=>Th,basicLSTMCell:()=>Sh,batchNorm:()=>Kr,batchNorm2d:()=>wh,batchNorm3d:()=>Nh,batchNorm4d:()=>vh,batchToSpaceND:()=>Jn,bincount:()=>qc,booleanMaskAsync:()=>m0,broadcastArgs:()=>Ih,broadcastTo:()=>Xr,buffer:()=>pt,cast:()=>X,ceil:()=>Kc,clipByValue:()=>Xc,clone:()=>He,complex:()=>Be,concat:()=>Lt,concat1d:()=>jc,concat2d:()=>kh,concat3d:()=>Eh,concat4d:()=>$h,conv1d:()=>Yc,conv2d:()=>dr,conv2dTranspose:()=>Zc,conv3d:()=>Ah,conv3dTranspose:()=>Dh,cos:()=>ts,cosh:()=>$i,cosineWindow:()=>Vp,cumprod:()=>Qs,cumsum:()=>Ai,denseBincount:()=>Rh,depthToSpace:()=>Qc,depthwiseConv2d:()=>es,diag:()=>Fh,dilation2d:()=>Jc,div:()=>st,divNoNan:()=>tl,dot:()=>el,dropout:()=>T0,einsum:()=>_h,elu:()=>Ri,enclosingPowerOfTwo:()=>Lu,equal:()=>rs,erf:()=>rl,euclideanNorm:()=>nl,exp:()=>ae,expandDims:()=>ze,expm1:()=>sl,eye:()=>al,fft:()=>ls,fill:()=>jr,floor:()=>os,floorDiv:()=>Di,fused:()=>Gu,gather:()=>ns,gatherND:()=>b0,greater:()=>xe,greaterEqual:()=>xr,ifft:()=>jo,imag:()=>ss,image:()=>pC,inTopKAsync:()=>S0,irfft:()=>Yi,isFinite:()=>il,isInf:()=>pl,isNaN:()=>cl,leakyRelu:()=>Fi,less:()=>_i,lessEqual:()=>Xe,linalg:()=>cC,linspace:()=>Bh,localResponseNormalization:()=>ll,log:()=>er,log1p:()=>Oi,logSigmoid:()=>ul,logSoftmax:()=>ml,logSumExp:()=>Li,logicalAnd:()=>rr,logicalNot:()=>as,logicalOr:()=>Mi,logicalXor:()=>fl,losses:()=>lC,lowerBound:()=>Gh,matMul:()=>Tt,max:()=>hr,maxPool:()=>Bi,maxPool3d:()=>Vh,maxPoolWithArgmax:()=>zh,maximum:()=>is,mean:()=>Ko,meshgrid:()=>Wh,min:()=>Js,minimum:()=>Gi,mirrorPad:()=>dl,mod:()=>hl,moments:()=>Uh,movingAverage:()=>d0,mul:()=>O,multiRNNCell:()=>Hh,multinomial:()=>qh,neg:()=>$t,norm:()=>qo,notEqual:()=>Vi,oneHot:()=>ta,ones:()=>Oe,onesLike:()=>gl,op:()=>N,outerProduct:()=>Kh,pad:()=>je,pad1d:()=>Xh,pad2d:()=>jh,pad3d:()=>Yh,pad4d:()=>Zh,pool:()=>xl,pow:()=>Ge,prelu:()=>zi,print:()=>yl,prod:()=>bl,raggedGather:()=>Qh,raggedTensorToTensor:()=>Jh,rand:()=>tg,randomGamma:()=>mg,randomNormal:()=>Cl,randomStandardNormal:()=>fg,randomUniform:()=>Tl,range:()=>cs,real:()=>Xo,reciprocal:()=>Sl,relu:()=>Yr,relu6:()=>Hi,reshape:()=>R,reverse:()=>ke,reverse1d:()=>dg,reverse2d:()=>hg,reverse3d:()=>gg,reverse4d:()=>xg,rfft:()=>us,round:()=>qi,rsqrt:()=>Ki,scalar:()=>J,scatterND:()=>g0,searchSorted:()=>Gp,selu:()=>wl,separableConv2d:()=>Nl,setdiff1dAsync:()=>yg,sigmoid:()=>qe,sign:()=>vl,signal:()=>Xu,sin:()=>Xi,sinh:()=>ji,slice:()=>xt,slice1d:()=>bg,slice2d:()=>Cg,slice3d:()=>Tg,slice4d:()=>Sg,softmax:()=>Il,softplus:()=>Pi,spaceToBatchND:()=>ps,sparse:()=>uC,sparseToDense:()=>y0,spectral:()=>iC,split:()=>or,sqrt:()=>Ut,square:()=>Ct,squaredDifference:()=>Zi,squeeze:()=>ms,stack:()=>fe,step:()=>yr,stridedSlice:()=>kl,string:()=>mC,sub:()=>rt,sum:()=>it,tan:()=>El,tanh:()=>Zs,tensor:()=>Te,tensor1d:()=>Ee,tensor2d:()=>fs,tensor3d:()=>$l,tensor4d:()=>wg,tensor5d:()=>Ng,tensor6d:()=>vg,tile:()=>gr,topk:()=>Al,transpose:()=>Se,truncatedNormal:()=>Ig,unique:()=>Dl,unsortedSegmentSum:()=>Qi,unstack:()=>$e,upperBound:()=>kg,variable:()=>Eg,where:()=>Xt,whereAsync:()=>Rl,zeros:()=>_e,zerosLike:()=>mt});var U2=(r,t,e,o=Pt)=>{switch(r.op){case"BiasAdd":case"AddV2":case"Add":return[o.add(T("a",r,t,e),T("b",r,t,e))];case"AddN":return[o.addN(T("tensors",r,t,e))];case"FloorMod":case"Mod":return[o.mod(T("a",r,t,e),T("b",r,t,e))];case"Mul":return[o.mul(T("a",r,t,e),T("b",r,t,e))];case"RealDiv":case"Div":return[o.div(T("a",r,t,e),T("b",r,t,e))];case"DivNoNan":return[o.divNoNan(T("a",r,t,e),T("b",r,t,e))];case"FloorDiv":return[o.floorDiv(T("a",r,t,e),T("b",r,t,e))];case"Sub":return[o.sub(T("a",r,t,e),T("b",r,t,e))];case"Minimum":return[o.minimum(T("a",r,t,e),T("b",r,t,e))];case"Maximum":return[o.maximum(T("a",r,t,e),T("b",r,t,e))];case"Pow":return[o.pow(T("a",r,t,e),T("b",r,t,e))];case"SquaredDifference":return[o.squaredDifference(T("a",r,t,e),T("b",r,t,e))];default:throw TypeError(`Node type ${r.op} is not implemented`)}};var H2=(r,t,e,o=Pt)=>{switch(r.op){case"Abs":case"ComplexAbs":return[o.abs(T("x",r,t,e))];case"Acos":return[o.acos(T("x",r,t,e))];case"Acosh":return[o.acosh(T("x",r,t,e))];case"Asin":return[o.asin(T("x",r,t,e))];case"Asinh":return[o.asinh(T("x",r,t,e))];case"Atan":return[o.atan(T("x",r,t,e))];case"Atan2":return[o.atan2(T("x",r,t,e),T("y",r,t,e))];case"Atanh":return[o.atanh(T("x",r,t,e))];case"Ceil":return[o.ceil(T("x",r,t,e))];case"Complex":return[o.complex(T("real",r,t,e),T("imag",r,t,e))];case"Cos":return[o.cos(T("x",r,t,e))];case"Cosh":return[o.cosh(T("x",r,t,e))];case"Elu":return[o.elu(T("x",r,t,e))];case"Erf":return[o.erf(T("x",r,t,e))];case"Exp":return[o.exp(T("x",r,t,e))];case"Expm1":return[o.expm1(T("x",r,t,e))];case"Floor":return[o.floor(T("x",r,t,e))];case"Log":return[o.log(T("x",r,t,e))];case"Log1p":return[o.log1p(T("x",r,t,e))];case"Imag":return[o.imag(T("x",r,t,e))];case"Neg":return[o.neg(T("x",r,t,e))];case"Reciprocal":return[o.reciprocal(T("x",r,t,e))];case"Real":return[o.real(T("x",r,t,e))];case"Relu":return[o.relu(T("x",r,t,e))];case"Round":return[o.round(T("x",r,t,e))];case"Selu":return[o.selu(T("x",r,t,e))];case"Sigmoid":return[o.sigmoid(T("x",r,t,e))];case"Sin":return[o.sin(T("x",r,t,e))];case"Sign":return[o.sign(T("x",r,t,e))];case"Sinh":return[o.sinh(T("x",r,t,e))];case"Softplus":return[o.softplus(T("x",r,t,e))];case"Sqrt":return[o.sqrt(T("x",r,t,e))];case"Square":return[o.square(T("x",r,t,e))];case"Tanh":return[o.tanh(T("x",r,t,e))];case"Tan":return[o.tan(T("x",r,t,e))];case"ClipByValue":return[o.clipByValue(T("x",r,t,e),T("clipValueMin",r,t,e),T("clipValueMax",r,t,e))];case"Relu6":return[o.relu6(T("x",r,t,e))];case"Rsqrt":return[o.rsqrt(ge(r.inputNames[0],t,e))];case"Prod":return[o.prod(T("x",r,t,e),T("axes",r,t,e))];case"LeakyRelu":return[o.leakyRelu(T("x",r,t,e),T("alpha",r,t,e))];case"Prelu":return[o.prelu(T("x",r,t,e),T("alpha",r,t,e))];case"IsNan":return[o.isNaN(ge(r.inputNames[0],t,e))];default:throw TypeError(`Node type ${r.op} is not implemented`)}};function pr(r,t,e=""){if(!(typeof r=="number"||typeof t=="number")){y.assert(r.length===t.length,()=>e+` Shapes ${r} and ${t} must match`);for(let o=0;o<r.length;o++){let n=r[o],s=t[o];y.assert(n<0||s<0||n===s,()=>e+` Shapes ${r} and ${t} must match`)}}}function q2(r){return!(typeof r=="number"||r.some(t=>t<0))}function Cc(r,t,e){let o=Rd(r,e),n=!q2(o);if(n&&t.length===0)throw new Error(`Tried to calculate elements of an empty list with non-fully-defined elementShape: ${o}`);if(n&&t.forEach(s=>{o=Rd(s.shape,o)}),!q2(o))throw new Error(`Non-fully-defined elementShape: ${o}`);return o}function Rd(r,t){if(typeof r=="number")return t;if(typeof t=="number")return r;if(r.length!==t.length)throw new Error(`Incompatible ranks during merge: ${r} vs. ${t}`);let e=[];for(let o=0;o<r.length;++o){let n=r[o],s=t[o];if(n>=0&&s>=0&&n!==s)throw new Error(`Incompatible shape during merge: ${r} vs. ${t}`);e[o]=n>=0?n:s}return e}var Fd=class{constructor(t,e,o,n,s,a,i){this.name=t,this.dtype=e,this.maxSize=o,this.elementShape=n,this.identicalElementShapes=s,this.dynamicSize=a,this.clearAfterRead=i,this.tensors=[],this.closed_=!1,this.idTensor=J(0),nr(this.idTensor)}get id(){return this.idTensor.id}get closed(){return this.closed_}clearAndClose(t){this.tensors.forEach(e=>{(t==null||!t.has(e.tensor.id))&&e.tensor.dispose()}),this.tensors=[],this.closed_=!0,this.idTensor.dispose()}size(){return this.tensors.length}read(t){if(this.closed_)throw new Error(`TensorArray ${this.name} has already been closed.`);if(t<0||t>=this.size())throw new Error(`Tried to read from index ${t}, but array size is: ${this.size()}`);let e=this.tensors[t];if(e.cleared)throw new Error(`TensorArray ${this.name}: Could not read index ${t} twice because it was cleared after a previous read (perhaps try setting clear_after_read = false?).`);return this.clearAfterRead&&(e.cleared=!0),e.read=!0,e.tensor}readMany(t){return t.map(e=>this.read(e))}write(t,e){if(this.closed_)throw new Error(`TensorArray ${this.name} has already been closed.`);if(t<0||!this.dynamicSize&&t>=this.maxSize)throw new Error(`Tried to write to index ${t}, but array is not resizeable and size is: ${this.maxSize}`);let o=this.tensors[t]||{};if(e.dtype!==this.dtype)throw new Error(`TensorArray ${this.name}: Could not write to TensorArray index ${t},
          because the value dtype is ${e.dtype}, but TensorArray dtype is ${this.dtype}.`);if(this.size()===0&&(this.elementShape==null||this.elementShape.length===0)&&(this.elementShape=e.shape),pr(this.elementShape,e.shape,`TensorArray ${this.name}: Could not write to TensorArray index ${t}.`),o.read)throw new Error(`TensorArray ${this.name}: Could not write to TensorArray index ${t}, because it has already been read.`);if(o.written)throw new Error(`TensorArray ${this.name}: Could not write to TensorArray index ${t}, because it has already been written.`);o.tensor=e,nr(e),o.written=!0,this.tensors[t]=o}writeMany(t,e){if(t.length!==e.length)throw new Error(`TensorArray ${this.name}: could not write multiple tensors,because the index size: ${t.length} is not the same as tensors size: ${e.length}.`);t.forEach((o,n)=>this.write(o,e[n]))}gather(t,e){if(e&&e!==this.dtype)throw new Error(`TensorArray dtype is ${this.dtype} but gather requested dtype ${e}`);if(t)t=t.slice(0,this.size());else{t=[];for(let n=0;n<this.size();n++)t.push(n)}if(t.length===0)return Te([],[0].concat(this.elementShape));let o=this.readMany(t);return pr(this.elementShape,o[0].shape,"TensorArray shape mismatch: "),fe(o,0)}concat(t){if(t&&t!==this.dtype)throw new Error(`TensorArray dtype is ${this.dtype} but concat requested dtype ${t}`);if(this.size()===0)return Te([],[0].concat(this.elementShape));let e=[];for(let n=0;n<this.size();n++)e.push(n);let o=this.readMany(e);return pr(this.elementShape,o[0].shape,`TensorArray shape mismatch: tensor array shape (${this.elementShape}) vs first tensor shape (${o[0].shape})`),Lt(o,0)}scatter(t,e){if(e.dtype!==this.dtype)throw new Error(`TensorArray dtype is ${this.dtype} but tensor has dtype ${e.dtype}`);if(t.length!==e.shape[0])throw new Error(`Expected len(indices) == tensor.shape[0], but saw: ${t.length} vs. ${e.shape[0]}`);let o=Math.max(...t);if(!this.dynamicSize&&o>=this.maxSize)throw new Error(`Max index must be < array size (${o}  vs. ${this.maxSize})`);this.writeMany(t,$e(e,0))}split(t,e){if(e.dtype!==this.dtype)throw new Error(`TensorArray dtype is ${this.dtype} but tensor has dtype ${e.dtype}`);let o=0,n=t.map(p=>(o+=p,o));if(o!==e.shape[0])throw new Error(`Expected sum of lengths to be equal to
          tensor.shape[0], but sum of lengths is
        ${o}, and tensor's shape is: ${e.shape}`);if(!this.dynamicSize&&t.length!==this.maxSize)throw new Error(`TensorArray's size is not equal to the size of lengths (${this.maxSize} vs. ${t.length}), and the TensorArray is not marked as dynamically resizeable`);let s=o===0?0:e.size/o,a=[];St(()=>{e=R(e,[1,o,s]);for(let p=0;p<t.length;++p){let l=[0,p===0?0:n[p-1],0],u=[1,t[p],s];a[p]=R(xt(e,l,u),this.elementShape)}return a});let i=[];for(let p=0;p<t.length;p++)i[p]=p;this.writeMany(i,a)}};var Tc=class r{constructor(t,e,o,n=-1){this.tensors=t,this.elementShape=e,this.elementDtype=o,t!=null&&t.forEach(s=>{if(o!==s.dtype)throw new Error(`Invalid data types; op elements ${o}, but list elements ${s.dtype}`);pr(e,s.shape,"TensorList shape mismatch: "),nr(s)}),this.idTensor=J(0),this.maxNumElements=n,nr(this.idTensor)}get id(){return this.idTensor.id}copy(){return new r([...this.tensors],this.elementShape,this.elementDtype)}clearAndClose(t){this.tensors.forEach(e=>{(t==null||!t.has(e.id))&&e.dispose()}),this.tensors.length=0,this.idTensor.dispose()}size(){return this.tensors.length}stack(t,e,o=-1){if(e!==this.elementDtype)throw new Error(`Invalid data types; op elements ${e}, but list elements ${this.elementDtype}`);if(o!==-1&&this.tensors.length!==o)throw new Error(`Operation expected a list with ${o} elements but got a list with ${this.tensors.length} elements.`);pr(t,this.elementShape,"TensorList shape mismatch: ");let n=Cc(this.elementShape,this.tensors,t);return St(()=>{let s=this.tensors.map(a=>R(a,n));return fe(s,0)})}popBack(t,e){if(e!==this.elementDtype)throw new Error(`Invalid data types; op elements ${e}, but list elements ${this.elementDtype}`);if(this.size()===0)throw new Error("Trying to pop from an empty list.");let o=Cc(this.elementShape,this.tensors,t),n=this.tensors.pop();return n.kept=!1,pr(n.shape,t,"TensorList shape mismatch: "),R(n,o)}pushBack(t){if(t.dtype!==this.elementDtype)throw new Error(`Invalid data types; op elements ${t.dtype}, but list elements ${this.elementDtype}`);if(pr(t.shape,this.elementShape,"TensorList shape mismatch: "),this.maxNumElements===this.size())throw new Error("Trying to push element into a full list.");nr(t),this.tensors.push(t)}resize(t){if(t<0)throw new Error(`TensorListResize expects size to be non-negative. Got: ${t}`);if(this.maxNumElements!==-1&&t>this.maxNumElements)throw new Error(`TensorListResize input size ${t} is greater maxNumElement ${this.maxNumElements}.`);let e=new r([],this.elementShape,this.elementDtype,this.maxNumElements);e.tensors.length=t;for(let o=0;o<Math.min(this.tensors.length,t);++o)e.tensors[o]=this.tensors[o];return e}getItem(t,e,o){if(o!==this.elementDtype)throw new Error(`Invalid data types; op elements ${o}, but list elements ${this.elementDtype}`);if(t<0||t>this.tensors.length)throw new Error(`Trying to access element ${t} in a list with ${this.tensors.length} elements.`);if(this.tensors[t]==null)throw new Error(`element at index ${t} is null.`);pr(this.tensors[t].shape,e,"TensorList shape mismatch: ");let n=Cc(this.elementShape,this.tensors,e);return R(this.tensors[t],n)}setItem(t,e){if(e.dtype!==this.elementDtype)throw new Error(`Invalid data types; op elements ${e.dtype}, but list elements ${this.elementDtype}`);if(t<0||this.maxNumElements!==-1&&t>=this.maxNumElements)throw new Error(`Trying to set element ${t} in a list with max ${this.maxNumElements} elements.`);pr(this.elementShape,e.shape,"TensorList shape mismatch: "),nr(e),this.tensors[t]!=null&&(this.tensors[t].kept=!1),this.tensors[t]=e}gather(t,e,o){if(e!==this.elementDtype)throw new Error(`Invalid data types; op elements ${e}, but list elements ${this.elementDtype}`);pr(this.elementShape,o,"TensorList shape mismatch: "),t=t.slice(0,this.size());let n=Cc(this.elementShape,this.tensors,o);return t.length===0?Te([],[0].concat(n)):St(()=>{let s=t.map(a=>R(this.tensors[a],n));return fe(s,0)})}concat(t,e){if(t&&t!==this.elementDtype)throw new Error(`TensorList dtype is ${this.elementDtype} but concat requested dtype ${t}`);pr(this.elementShape,e,"TensorList shape mismatch: ");let o=Cc(this.elementShape,this.tensors,e);return this.size()===0?Te([],[0].concat(o)):St(()=>{let n=this.tensors.map(s=>R(s,o));return Lt(n,0)})}};function K2(r,t,e){let o=r.dtype;if(r.shape.length<1)throw new Error(`Tensor must be at least a vector, but saw shape: ${r.shape}`);if(r.dtype!==e)throw new Error(`Invalid data types; op elements ${r.dtype}, but list elements ${e}`);let n=r.shape.slice(1);pr(n,t,"TensorList shape mismatch: ");let s=$e(r);return new Tc(s,t,o)}function X2(r,t,e,o){return new Tc([],r,t,o)}function j2(r,t,e,o){if(t.length!==r.shape[0])throw new Error(`Expected len(indices) == tensor.shape[0], but saw: ${t.length} vs. ${r.shape[0]}`);let n=Math.max(...t);if(o!=null&&o!==-1&&n>=o)throw new Error(`Max index must be < array size (${n}  vs. ${o})`);let s=new Tc([],e,r.dtype,o),a=$e(r,0);return t.forEach((i,p)=>{s.setItem(i,a[p])}),s}function Y2(r,t,e){let o=0,n=t.map(l=>(o+=l,o));if(o!==r.shape[0])throw new Error(`Expected sum of lengths to be equal to
          tensor.shape[0], but sum of lengths is
        ${o}, and tensor's shape is: ${r.shape}`);let s=r.shape.slice(1),a=Rd(s,e),i=o===0?0:r.size/o,p=St(()=>{let l=[];r=R(r,[1,o,i]);for(let u=0;u<t.length;++u){let f=[0,u===0?0:n[u-1],0],d=[1,t[u],i];l[u]=R(xt(r,f,d),a)}return r.dispose(),l}),c=new Tc([],e,r.dtype,t.length);for(let l=0;l<p.length;l++)c.setItem(l,p[l]);return c}var Z2=async(r,t,e)=>{switch(r.op){case"If":case"StatelessIf":{let o=T("thenBranch",r,t,e),n=T("elseBranch",r,t,e),s=T("cond",r,t,e),a=T("args",r,t,e);return(await s.data())[0]?e.functionMap[o].executeFunctionAsync(a,e.tensorArrayMap,e.tensorListMap):e.functionMap[n].executeFunctionAsync(a,e.tensorArrayMap,e.tensorListMap)}case"While":case"StatelessWhile":{let o=T("body",r,t,e),n=T("cond",r,t,e),s=T("args",r,t,e),a=await e.functionMap[n].executeFunctionAsync(s,e.tensorArrayMap,e.tensorListMap),i=s.map(l=>l.id),p=await a[0].data();a.forEach(l=>{!l.kept&&i.indexOf(l.id)===-1&&l.dispose()});let c=s;for(;p[0];){let l=c;c=await e.functionMap[o].executeFunctionAsync(c,e.tensorArrayMap,e.tensorListMap);let u=c.map(f=>f.id);l.forEach(f=>{!f.kept&&i.indexOf(f.id)===-1&&u.indexOf(f.id)===-1&&f.dispose()});let m=await e.functionMap[n].executeFunctionAsync(c,e.tensorArrayMap,e.tensorListMap);p=await m[0].data(),m.forEach(f=>{!f.kept&&i.indexOf(f.id)===-1&&u.indexOf(f.id)===-1&&f.dispose()})}return c}case"LoopCond":{let o=T("pred",r,t,e);return[ro(o)]}case"Switch":{let o=T("pred",r,t,e),n=T("data",r,t,e);return n.kept||(n=ro(n)),(await o.data())[0]?[void 0,n]:[n,void 0]}case"Merge":{let o=r.inputNames.find(n=>ge(n,t,e)!==void 0);if(o){let n=ge(o,t,e);return[ro(n)]}return}case"Enter":{let o=T("frameName",r,t,e),n=T("tensor",r,t,e);return e.enterFrame(o),[ro(n)]}case"Exit":{let o=T("tensor",r,t,e);return e.exitFrame(),[ro(o)]}case"NextIteration":{let o=T("tensor",r,t,e);return e.nextIteration(),[ro(o)]}case"TensorArrayV3":{let o=T("size",r,t,e),n=T("dtype",r,t,e),s=T("elementShape",r,t,e),a=T("dynamicSize",r,t,e),i=T("clearAfterRead",r,t,e),p=T("identicalElementShapes",r,t,e),c=T("name",r,t,e),l=new Fd(c,n,o,s,p,a,i);return e.addTensorArray(l),[l.idTensor,J(1)]}case"TensorArrayWriteV3":{let o=T("tensorArrayId",r,t,e),n=T("index",r,t,e),s=T("tensor",r,t,e),a=e.getTensorArray(o.id);return a.write(n,s),[a.idTensor]}case"TensorArrayReadV3":{let o=T("tensorArrayId",r,t,e),n=T("index",r,t,e);return[e.getTensorArray(o.id).read(n)]}case"TensorArrayGatherV3":{let o=T("tensorArrayId",r,t,e),n=T("indices",r,t,e),s=T("dtype",r,t,e);return[e.getTensorArray(o.id).gather(n,s)]}case"TensorArrayScatterV3":{let o=T("tensorArrayId",r,t,e),n=T("indices",r,t,e),s=T("tensor",r,t,e),a=e.getTensorArray(o.id);return a.scatter(n,s),[a.idTensor]}case"TensorArrayConcatV3":{let o=T("tensorArrayId",r,t,e),n=e.getTensorArray(o.id),s=T("dtype",r,t,e);return[n.concat(s)]}case"TensorArraySplitV3":{let o=T("tensorArrayId",r,t,e),n=T("tensor",r,t,e),s=T("lengths",r,t,e),a=e.getTensorArray(o.id);return a.split(s,n),[a.idTensor]}case"TensorArraySizeV3":{let o=T("tensorArrayId",r,t,e),n=e.getTensorArray(o.id);return[J(n.size(),"int32")]}case"TensorArrayCloseV3":{let o=T("tensorArrayId",r,t,e),n=e.getTensorArray(o.id);return n.clearAndClose(),[n.idTensor]}case"TensorListSetItem":{let o=T("tensorListId",r,t,e),n=T("index",r,t,e),s=T("tensor",r,t,e),a=e.getTensorList(o.id);return a.setItem(n,s),[a.idTensor]}case"TensorListGetItem":{let o=T("tensorListId",r,t,e),n=T("index",r,t,e),s=T("elementShape",r,t,e),a=T("elementDType",r,t,e);return[e.getTensorList(o.id).getItem(n,s,a)]}case"TensorListScatterV2":case"TensorListScatter":{let o=T("indices",r,t,e),n=T("tensor",r,t,e),s=T("elementShape",r,t,e),a=T("numElements",r,t,e),i=j2(n,o,s,a);return e.addTensorList(i),[i.idTensor]}case"TensorListReserve":case"EmptyTensorList":{let o=T("elementShape",r,t,e),n=T("elementDType",r,t,e),s;r.op==="TensorListReserve"?s="numElements":s="maxNumElements";let a=T(s,r,t,e),i=r.op==="TensorListReserve"?-1:a,p=X2(o,n,a,i);return e.addTensorList(p),[p.idTensor]}case"TensorListGather":{let o=T("tensorListId",r,t,e),n=T("indices",r,t,e),s=T("elementShape",r,t,e),a=T("elementDType",r,t,e);return[e.getTensorList(o.id).gather(n,a,s)]}case"TensorListStack":{let o=T("tensorListId",r,t,e),n=T("elementShape",r,t,e),s=T("elementDType",r,t,e),a=T("numElements",r,t,e);return[e.getTensorList(o.id).stack(n,s,a)]}case"TensorListFromTensor":{let o=T("tensor",r,t,e),n=T("elementShape",r,t,e),s=T("elementDType",r,t,e),a=K2(o,n,s);return e.addTensorList(a),[a.idTensor]}case"TensorListConcat":case"TensorListConcatV2":{let o=T("tensorListId",r,t,e),n=e.getTensorList(o.id),s=T("dtype",r,t,e),a=T("elementShape",r,t,e);return[n.concat(s,a)]}case"TensorListPushBack":{let o=T("tensorListId",r,t,e),n=T("tensor",r,t,e),s=e.getTensorList(o.id);return s.pushBack(n),[s.idTensor]}case"TensorListPopBack":{let o=T("tensorListId",r,t,e),n=T("elementShape",r,t,e),s=T("elementDType",r,t,e);return[e.getTensorList(o.id).popBack(n,s)]}case"TensorListSplit":{let o=T("tensor",r,t,e),n=T("elementShape",r,t,e),s=T("lengths",r,t,e),a=Y2(o,s,n);return e.addTensorList(a),[a.idTensor]}case"TensorListLength":{let o=T("tensorListId",r,t,e),n=e.getTensorList(o.id);return[J(n.size(),"int32")]}case"TensorListResize":{let o=T("tensorListId",r,t,e),n=T("size",r,t,e),a=e.getTensorList(o.id).resize(n);return e.addTensorList(a),[a.idTensor]}default:throw TypeError(`Node type ${r.op} is not implemented`)}};function Q2(r,t,e){let[o,n]=T("fusedOps",r,t,e),s=o==="biasadd",a=!s,i=n==="prelu",p=o==="fusedbatchnorm",c=T("numArgs",r,t,e);if(s){if(i&&c!==2)throw new Error("FusedConv2d and DepthwiseConv2d with BiasAdd and Prelu must have two extra arguments: bias and alpha.");if(!i&&s&&c!==1)throw new Error("FusedConv2d and DepthwiseConv2d with BiasAdd must have one extra argument: bias.")}if(p)throw new Error("FusedConv2d and DepthwiseConv2d with FusedBatchNorm is not supported");let l=T("strides",r,t,e),u=su(r,t,e),m=T("dataFormat",r,t,e).toUpperCase(),f=T("dilations",r,t,e),[d,g]=T("args",r,t,e);a&&(g=d,d=void 0);let h=T("leakyreluAlpha",r,t,e);return{stride:l,pad:u,dataFormat:m,dilations:f,biasArg:d,preluArg:g,activationFunc:n,leakyreluAlpha:h}}var J2=(r,t,e,o=Pt)=>{switch(r.op){case"Conv1D":{let n=T("stride",r,t,e),s=T("pad",r,t,e),a=T("dataFormat",r,t,e).toUpperCase(),i=T("dilation",r,t,e);return[o.conv1d(T("x",r,t,e),T("filter",r,t,e),n,s,a,i)]}case"Conv2D":{let n=T("strides",r,t,e),s=su(r,t,e),a=T("dataFormat",r,t,e).toUpperCase(),i=T("dilations",r,t,e);return[o.conv2d(T("x",r,t,e),T("filter",r,t,e),[n[1],n[2]],s,a,[i[1],i[2]])]}case"_FusedConv2D":{let{stride:n,pad:s,dataFormat:a,dilations:i,biasArg:p,preluArg:c,activationFunc:l,leakyreluAlpha:u}=Q2(r,t,e);return[o.fused.conv2d({x:T("x",r,t,e),filter:T("filter",r,t,e),strides:[n[1],n[2]],pad:s,dataFormat:a,dilations:[i[1],i[2]],bias:p,activation:l,preluActivationWeights:c,leakyreluAlpha:u})]}case"FusedDepthwiseConv2dNative":{let{stride:n,pad:s,dataFormat:a,dilations:i,biasArg:p,preluArg:c,activationFunc:l,leakyreluAlpha:u}=Q2(r,t,e);return[o.fused.depthwiseConv2d({x:T("x",r,t,e),filter:T("filter",r,t,e),strides:[n[1],n[2]],pad:s,dataFormat:a,dilations:[i[1],i[2]],bias:p,activation:l,preluActivationWeights:c,leakyreluAlpha:u})]}case"Conv2DBackpropInput":case"Conv2dTranspose":{let n=T("outputShape",r,t,e),s=T("strides",r,t,e),a=su(r,t,e);return[o.conv2dTranspose(T("x",r,t,e),T("filter",r,t,e),n,[s[1],s[2]],a)]}case"DepthwiseConv2dNative":case"DepthwiseConv2d":{let n=T("strides",r,t,e),s=su(r,t,e),a=T("dilations",r,t,e),i=T("dataFormat",r,t,e).toUpperCase();return[o.depthwiseConv2d(T("input",r,t,e),T("filter",r,t,e),[n[1],n[2]],s,i,[a[1],a[2]])]}case"Conv3D":{let n=T("strides",r,t,e),s=T("pad",r,t,e),a=T("dataFormat",r,t,e).toUpperCase(),i=T("dilations",r,t,e);return[o.conv3d(T("x",r,t,e),T("filter",r,t,e),[n[1],n[2],n[3]],s,a,[i[1],i[2],i[3]])]}case"AvgPool":{let n=T("strides",r,t,e),s=T("pad",r,t,e),a=T("kernelSize",r,t,e);return[o.avgPool(T("x",r,t,e),[a[1],a[2]],[n[1],n[2]],s)]}case"MaxPool":{let n=T("strides",r,t,e),s=T("pad",r,t,e),a=T("kernelSize",r,t,e);return[o.maxPool(T("x",r,t,e),[a[1],a[2]],[n[1],n[2]],s)]}case"MaxPoolWithArgmax":{let n=T("strides",r,t,e),s=T("pad",r,t,e),a=T("kernelSize",r,t,e),i=T("includeBatchInIndex",r,t,e),{result:p,indexes:c}=o.maxPoolWithArgmax(T("x",r,t,e),[a[1],a[2]],[n[1],n[2]],s,i);return[p,c]}case"AvgPool3D":{let n=T("strides",r,t,e),s=T("pad",r,t,e),a=T("kernelSize",r,t,e);return[o.avgPool3d(T("x",r,t,e),[a[1],a[2],a[3]],[n[1],n[2],n[3]],s)]}case"MaxPool3D":{let n=T("strides",r,t,e),s=T("pad",r,t,e),a=T("kernelSize",r,t,e);return[o.maxPool3d(T("x",r,t,e),[a[1],a[2],a[3]],[n[1],n[2],n[3]],s)]}case"Dilation2D":{let n=T("strides",r,t,e),s=T("pad",r,t,e),a=T("dilations",r,t,e),i=n[1],p=n[2],c=a[1],l=a[2];return[o.dilation2d(T("x",r,t,e),T("filter",r,t,e),[i,p],s,[c,l],"NHWC")]}default:throw TypeError(`Node type ${r.op} is not implemented`)}};var tA=(r,t,e,o=Pt)=>{switch(r.op){case"Fill":{let n=T("shape",r,t,e),s=T("dtype",r,t,e),a=T("value",r,t,e);return[o.fill(n,a,s)]}case"LinSpace":{let n=T("start",r,t,e),s=T("stop",r,t,e),a=T("num",r,t,e);return[o.linspace(n,s,a)]}case"Multinomial":{let n=T("logits",r,t,e),s=T("numSamples",r,t,e),a=T("seed",r,t,e);return[o.multinomial(n,s,a)]}case"OneHot":{let n=T("indices",r,t,e),s=T("depth",r,t,e),a=T("onValue",r,t,e),i=T("offValue",r,t,e),p=T("dtype",r,t,e);return[o.oneHot(n,s,a,i,p)]}case"Ones":return[o.ones(T("shape",r,t,e),T("dtype",r,t,e))];case"OnesLike":return[o.onesLike(T("x",r,t,e))];case"RandomStandardNormal":return[o.randomStandardNormal(T("shape",r,t,e),T("dtype",r,t,e),T("seed",r,t,e))];case"RandomUniform":return[o.randomUniform(T("shape",r,t,e),T("minval",r,t,e),T("maxval",r,t,e),T("dtype",r,t,e))];case"Range":{let n=T("start",r,t,e),s=T("stop",r,t,e),a=T("step",r,t,e);return[o.range(n,s,a,T("dtype",r,t,e))]}case"TruncatedNormal":{let n=T("shape",r,t,e),s=T("mean",r,t,e),a=T("stdDev",r,t,e),i=T("seed",r,t,e);return[o.truncatedNormal(n,s,a,T("dtype",r,t,e),i)]}case"Zeros":return[o.zeros(T("shape",r,t,e),T("dtype",r,t,e))];case"ZerosLike":return[o.zerosLike(T("x",r,t,e))];default:throw TypeError(`Node type ${r.op} is not implemented`)}};function Yy(r,t,e){let o=T("boxes",r,t,e),n=T("scores",r,t,e),s=T("maxOutputSize",r,t,e),a=T("iouThreshold",r,t,e),i=T("scoreThreshold",r,t,e),p=T("softNmsSigma",r,t,e);return{boxes:o,scores:n,maxOutputSize:s,iouThreshold:a,scoreThreshold:i,softNmsSigma:p}}var eA=async(r,t,e,o,n=Pt)=>{switch(r.op){case"NonMaxSuppressionV5":{let{boxes:s,scores:a,maxOutputSize:i,iouThreshold:p,scoreThreshold:c,softNmsSigma:l}=Yy(r,t,e),u=await n.image.nonMaxSuppressionWithScoreAsync(s,a,i,p,c,l);return[u.selectedIndices,u.selectedScores]}case"NonMaxSuppressionV4":{let{boxes:s,scores:a,maxOutputSize:i,iouThreshold:p,scoreThreshold:c}=Yy(r,t,e),l=T("padToMaxOutputSize",r,t,e),u=await n.image.nonMaxSuppressionPaddedAsync(s,a,i,p,c,l);return[u.selectedIndices,u.validOutputs]}case"NonMaxSuppressionV3":case"NonMaxSuppressionV2":{let{boxes:s,scores:a,maxOutputSize:i,iouThreshold:p,scoreThreshold:c}=Yy(r,t,e);return[await n.image.nonMaxSuppressionAsync(s,a,i,p,c)]}case"Where":{let s=n.cast(T("condition",r,t,e),"bool"),a=[await n.whereAsync(s)];return s.dispose(),a}case"ListDiff":return n.setdiff1dAsync(T("x",r,t,e),T("y",r,t,e));default:throw TypeError(`Node type ${r.op} is not implemented`)}};var rA=(r,t,e,o=Pt)=>{switch(r.op){case"LowerBound":{let n=T("sortedSequence",r,t,e),s=T("values",r,t,e);return[o.lowerBound(n,s)]}case"TopKV2":{let n=T("x",r,t,e),s=T("k",r,t,e),a=T("sorted",r,t,e),i=o.topk(n,s,a);return[i.values,i.indices]}case"UpperBound":{let n=T("sortedSequence",r,t,e),s=T("values",r,t,e);return[o.upperBound(n,s)]}case"Unique":{let n=T("x",r,t,e),s=o.unique(n);return[s.values,s.indices]}case"UniqueV2":{let n=T("x",r,t,e),s=T("axis",r,t,e),a=o.unique(n,s);return[a.values,a.indices]}default:throw TypeError(`Node type ${r.op} is not implemented`)}};var oA=(r,t,e,o=Pt)=>{switch(r.op){case"Const":return t[r.name];case"PlaceholderWithDefault":let n=T("default",r,t,e);return[ge(r.name,t,e)||n];case"Placeholder":return[ge(r.name,t,e)];case"Identity":case"StopGradient":case"FakeQuantWithMinMaxVars":{let l=T("x",r,t,e);return[ro(l)]}case"IdentityN":return T("x",r,t,e).map(l=>ro(l));case"Snapshot":let s=T("x",r,t,e);return[ro(s)];case"Shape":return[o.tensor1d(T("x",r,t,e).shape,"int32")];case"ShapeN":return T("x",r,t,e).map(l=>o.tensor1d(l.shape));case"Size":return[o.scalar(T("x",r,t,e).size,"int32")];case"Rank":return[o.scalar(T("x",r,t,e).rank,"int32")];case"NoOp":return[o.scalar(1)];case"Print":let a=T("x",r,t,e),i=T("data",r,t,e),p=T("message",r,t,e),c=T("summarize",r,t,e);console.warn("The graph has a tf.print() operation,usually used for debugging, which slows down performance."),console.log(p);for(let l=0;l<i.length;l++)console.log(Array.prototype.slice.call(i[l].dataSync()).slice(0,c));return[a];default:throw TypeError(`Node type ${r.op} is not implemented`)}};var _d=class{constructor(t,e){this.keyDType=t,this.valueDType=e,this.handle=J(0),this.tensorMap=new Map,nr(this.handle)}get id(){return this.handle.id}clearAndClose(){this.tensorMap.forEach(t=>t.dispose()),this.tensorMap.clear(),this.handle.dispose()}size(){return this.tensorMap.size}tensorSize(){return J(this.size(),"int32")}async import(t,e){this.checkKeyAndValueTensor(t,e);let o=await t.data();return this.tensorMap.forEach(n=>n.dispose()),this.tensorMap.clear(),St(()=>{let n=$e(e),s=o.length,a=n.length;y.assert(s===a,()=>`The number of elements doesn't match, keys has ${s} elements, the values has ${a} elements.`);for(let i=0;i<s;i++){let p=o[i],c=n[i];nr(c),this.tensorMap.set(p,c)}return this.handle})}async find(t,e){this.checkKeyAndValueTensor(t,e);let o=await t.data();return St(()=>{let n=[];for(let s=0;s<o.length;s++){let a=o[s],i=this.findWithDefault(a,e);n.push(i)}return fe(n)})}findWithDefault(t,e){let o=this.tensorMap.get(t);return o!=null?o:e}checkKeyAndValueTensor(t,e){if(t.dtype!==this.keyDType)throw new Error(`Expect key dtype ${this.keyDType}, but got ${t.dtype}`);if(e.dtype!==this.valueDType)throw new Error(`Expect value dtype ${this.valueDType}, but got ${e.dtype}`)}};var nA=async(r,t,e,o)=>{switch(r.op){case"HashTable":case"HashTableV2":{let n=T("keyDType",r,t,e),s=T("valueDType",r,t,e),a=new _d(n,s);return o.addHashTable(r.name,a),[a.handle]}case"LookupTableImport":case"LookupTableImportV2":{let n=T("tableHandle",r,t,e,o),s=T("keys",r,t,e),a=T("values",r,t,e);return[await o.getHashTableById(n.id).import(s,a)]}case"LookupTableFind":case"LookupTableFindV2":{let n=T("tableHandle",r,t,e,o),s=T("keys",r,t,e),a=T("defaultValue",r,t,e);return[await o.getHashTableById(n.id).find(s,a)]}case"LookupTableSize":case"LookupTableSizeV2":{let n=T("tableHandle",r,t,e,o);return[o.getHashTableById(n.id).tensorSize()]}default:throw TypeError(`Node type ${r.op} is not implemented`)}};var sA=(r,t,e,o=Pt)=>{switch(r.op){case"ResizeBilinear":{let n=T("images",r,t,e),s=T("size",r,t,e),a=T("alignCorners",r,t,e),i=T("halfPixelCenters",r,t,e);return[o.image.resizeBilinear(n,[s[0],s[1]],a,i)]}case"ResizeNearestNeighbor":{let n=T("images",r,t,e),s=T("size",r,t,e),a=T("alignCorners",r,t,e),i=T("halfPixelCenters",r,t,e);return[o.image.resizeNearestNeighbor(n,[s[0],s[1]],a,i)]}case"CropAndResize":{let n=T("image",r,t,e),s=T("boxes",r,t,e),a=T("boxInd",r,t,e),i=T("cropSize",r,t,e),p=T("method",r,t,e),c=T("extrapolationValue",r,t,e);return[o.image.cropAndResize(n,s,a,i,p,c)]}case"ImageProjectiveTransformV3":{let n=T("images",r,t,e),s=T("transforms",r,t,e),a=T("outputShape",r,t,e),i=T("fillValue",r,t,e),p=T("interpolation",r,t,e),c=T("fillMode",r,t,e);return[o.image.transform(n,s,p.toLowerCase(),c.toLowerCase(),i,a)]}default:throw TypeError(`Node type ${r.op} is not implemented`)}};var aA=(r,t,e,o=Pt)=>{switch(r.op){case"Equal":return[o.equal(T("a",r,t,e),T("b",r,t,e))];case"NotEqual":return[o.notEqual(T("a",r,t,e),T("b",r,t,e))];case"Greater":return[o.greater(T("a",r,t,e),T("b",r,t,e))];case"GreaterEqual":return[o.greaterEqual(T("a",r,t,e),T("b",r,t,e))];case"Less":return[o.less(T("a",r,t,e),T("b",r,t,e))];case"LessEqual":return[o.lessEqual(T("a",r,t,e),T("b",r,t,e))];case"LogicalAnd":return[o.logicalAnd(T("a",r,t,e),T("b",r,t,e))];case"LogicalNot":return[o.logicalNot(T("a",r,t,e))];case"LogicalOr":return[o.logicalOr(T("a",r,t,e),T("b",r,t,e))];case"Select":case"SelectV2":return[o.where(T("condition",r,t,e),T("a",r,t,e),T("b",r,t,e))];default:throw TypeError(`Node type ${r.op} is not implemented`)}};var iA=(r,t,e,o=Pt)=>{switch(r.op){case"BatchMatMul":case"BatchMatMulV2":case"MatMul":return[o.matMul(T("a",r,t,e),T("b",r,t,e),T("transposeA",r,t,e),T("transposeB",r,t,e))];case"Einsum":return[o.einsum(T("equation",r,t,e),...T("tensors",r,t,e))];case"Transpose":return[o.transpose(T("x",r,t,e),T("perm",r,t,e))];case"_FusedMatMul":let[n,s]=T("fusedOps",r,t,e),a=n==="biasadd",i=s==="prelu",p=T("numArgs",r,t,e),c=T("leakyreluAlpha",r,t,e);if(a){if(i&&p!==2)throw new Error("Fused MatMul with BiasAdd and Prelu must have two extra arguments: bias and alpha.");if(!i&&p!==1)throw new Error("Fused MatMul with BiasAdd must have one extra argument: bias.")}let[l,u]=T("args",r,t,e);return[o.fused.matMul({a:T("a",r,t,e),b:T("b",r,t,e),transposeA:T("transposeA",r,t,e),transposeB:T("transposeB",r,t,e),bias:l,activation:s,preluActivationWeights:u,leakyreluAlpha:c})];default:throw TypeError(`Node type ${r.op} is not implemented`)}};var pA=(r,t,e,o=Pt)=>{switch(r.op){case"EuclideanNorm":return[o.euclideanNorm(T("x",r,t,e),T("axis",r,t,e),T("keepDims",r,t,e))];case"FusedBatchNorm":case"FusedBatchNormV2":return[o.batchNorm(T("x",r,t,e),T("mean",r,t,e),T("variance",r,t,e),T("offset",r,t,e),T("scale",r,t,e),T("epsilon",r,t,e))];case"FusedBatchNormV3":return[o.batchNorm(T("x",r,t,e),T("mean",r,t,e),T("variance",r,t,e),T("offset",r,t,e),T("scale",r,t,e),T("epsilon",r,t,e))];case"LRN":return[o.localResponseNormalization(T("x",r,t,e),T("radius",r,t,e),T("bias",r,t,e),T("alpha",r,t,e),T("beta",r,t,e))];case"Softmax":return[o.softmax(T("x",r,t,e))];case"LogSoftmax":return[o.logSoftmax(T("x",r,t,e))];case"SparseToDense":return[o.sparseToDense(T("sparseIndices",r,t,e),T("outputShape",r,t,e),T("sparseValues",r,t,e),T("defaultValue",r,t,e))];default:throw TypeError(`Node type ${r.op} is not implemented`)}};var cA=(r,t,e,o=Pt)=>{switch(r.op){case"Max":{let i=T("axis",r,t,e),p=T("keepDims",r,t,e);return[o.max(T("x",r,t,e),i,p)]}case"Mean":{let i=T("axis",r,t,e),p=T("keepDims",r,t,e);return[o.mean(T("x",r,t,e),i,p)]}case"Min":{let i=T("axis",r,t,e),p=T("keepDims",r,t,e);return[o.min(T("x",r,t,e),i,p)]}case"Sum":{let i=T("axis",r,t,e),p=T("keepDims",r,t,e);return[o.sum(T("x",r,t,e),i,p)]}case"All":{let i=T("axis",r,t,e),p=T("keepDims",r,t,e);return[o.all(T("x",r,t,e),i,p)]}case"Any":{let i=T("axis",r,t,e),p=T("keepDims",r,t,e);return[o.any(T("x",r,t,e),i,p)]}case"ArgMax":{let i=T("axis",r,t,e);return[o.argMax(T("x",r,t,e),i)]}case"ArgMin":{let i=T("axis",r,t,e);return[o.argMin(T("x",r,t,e),i)]}case"Prod":{let i=T("axis",r,t,e),p=T("keepDims",r,t,e);return[o.prod(T("x",r,t,e),i,p)]}case"Cumprod":{let i=T("axis",r,t,e),p=T("exclusive",r,t,e),c=T("reverse",r,t,e);return[o.cumprod(T("x",r,t,e),i,p,c)]}case"Cumsum":{let i=T("axis",r,t,e),p=T("exclusive",r,t,e),c=T("reverse",r,t,e);return[o.cumsum(T("x",r,t,e),i,p,c)]}case"Bincount":let n=T("x",r,t,e),s=T("weights",r,t,e),a=T("size",r,t,e);return[o.bincount(n,s,a)];case"DenseBincount":{let i=T("x",r,t,e),p=T("weights",r,t,e),c=T("size",r,t,e),l=T("binaryOutput",r,t,e);return[o.denseBincount(i,p,c,l)]}default:throw TypeError(`Node type ${r.op} is not implemented`)}};var lA=(r,t,e,o=Pt)=>{switch(r.op){case"ConcatV2":case"Concat":{let n=T("n",r,t,e),s=T("axis",r,t,e),a=T("tensors",r,t,e);return a=a.slice(0,n),[o.concat(a,s)]}case"Gather":{let n=T("x",r,t,e),s=T("indices",r,t,e);return[o.gather(n,o.cast(s,"int32"),0)]}case"GatherV2":{let n=T("axis",r,t,e),s=T("batchDims",r,t,e),a=T("x",r,t,e),i=T("indices",r,t,e);return[o.gather(a,o.cast(i,"int32"),n,s)]}case"Reverse":{let n=T("dims",r,t,e),s=[];for(let i=0;i<n.length;i++)n[i]&&s.push(i);let a=T("x",r,t,e);return[o.reverse(a,s)]}case"ReverseV2":{let n=T("axis",r,t,e),s=T("x",r,t,e);return[o.reverse(s,n)]}case"Slice":{let n=T("begin",r,t,e),s=T("size",r,t,e);return[o.slice(T("x",r,t,e),n,s)]}case"StridedSlice":{let n=T("begin",r,t,e),s=T("end",r,t,e),a=T("strides",r,t,e),i=T("beginMask",r,t,e),p=T("endMask",r,t,e),c=T("ellipsisMask",r,t,e),l=T("newAxisMask",r,t,e),u=T("shrinkAxisMask",r,t,e),m=T("x",r,t,e);return[o.stridedSlice(m,n,s,a,i,p,c,l,u)]}case"Pack":return St(()=>{let n=T("axis",r,t,e),s=T("tensors",r,t,e),a=s[0].shape,i=o.squeeze(s[0]).shape,p=s.map(c=>{let l=y.arraysEqual(c.shape,a);if(!l&&!y.arraysEqual(o.squeeze(c).shape,i))throw new Error("the input tensors shape does not match");return l?c:o.reshape(c,a)});return[o.stack(p,n)]});case"Unpack":{let n=T("axis",r,t,e),s=T("tensor",r,t,e);return o.unstack(s,n)}case"Tile":{let n=T("reps",r,t,e);return[o.tile(T("x",r,t,e),n)]}case"Split":case"SplitV":{let n=T("axis",r,t,e),s=T("numOrSizeSplits",r,t,e),a=T("x",r,t,e);return o.split(a,s,n)}case"ScatterNd":{let n=T("indices",r,t,e),s=T("values",r,t,e),a=T("shape",r,t,e);return[o.scatterND(n,s,a)]}case"GatherNd":{let n=T("x",r,t,e),s=T("indices",r,t,e);return[o.gatherND(n,s)]}case"SparseToDense":{let n=T("sparseIndices",r,t,e),s=T("outputShape",r,t,e),a=T("sparseValues",r,t,e),i=T("defaultValue",r,t,e);return[o.sparseToDense(n,a,s,a.dtype===i.dtype?i:o.cast(i,a.dtype))]}default:throw TypeError(`Node type ${r.op} is not implemented`)}};var uA=(r,t,e,o=Pt)=>{switch(r.op){case"SparseFillEmptyRows":{let{outputIndices:n,outputValues:s,emptyRowIndicator:a,reverseIndexMap:i}=o.sparse.sparseFillEmptyRows(T("indices",r,t,e),T("values",r,t,e),T("denseShape",r,t,e),T("defaultValue",r,t,e));return[n,s,a,i]}case"SparseReshape":{let{outputIndices:n,outputShape:s}=o.sparse.sparseReshape(T("inputIndices",r,t,e),T("inputShape",r,t,e),T("newShape",r,t,e));return[n,s]}case"SparseSegmentMean":return[o.sparse.sparseSegmentMean(T("data",r,t,e),T("indices",r,t,e),T("segmentIds",r,t,e))];case"SparseSegmentSum":return[o.sparse.sparseSegmentSum(T("data",r,t,e),T("indices",r,t,e),T("segmentIds",r,t,e))];default:throw TypeError(`Node type ${r.op} is not implemented`)}};var mA=(r,t,e,o=Pt)=>{switch(r.op){case"FFT":return[o.fft(T("x",r,t,e))];case"IFFT":return[o.ifft(T("x",r,t,e))];case"RFFT":return[o.rfft(T("x",r,t,e))];case"IRFFT":return[o.irfft(T("x",r,t,e))];default:throw TypeError(`Node type ${r.op} is not implemented`)}};var fA=(r,t,e,o=Pt)=>{switch(r.op){case"StringNGrams":{let{nGrams:n,nGramsSplits:s}=o.string.stringNGrams(T("data",r,t,e),T("dataSplits",r,t,e),T("separator",r,t,e),T("nGramWidths",r,t,e),T("leftPad",r,t,e),T("rightPad",r,t,e),T("padWidth",r,t,e),T("preserveShortSequences",r,t,e));return[n,s]}case"StringSplit":{let{indices:n,values:s,shape:a}=o.string.stringSplit(T("input",r,t,e),T("delimiter",r,t,e),T("skipEmpty",r,t,e));return[n,s,a]}case"StringToHashBucketFast":return[o.string.stringToHashBucketFast(T("input",r,t,e),T("numBuckets",r,t,e))];default:throw TypeError(`Node type ${r.op} is not implemented`)}};var dA=(r,t,e,o=Pt)=>{switch(r.op){case"Cast":return[o.cast(T("x",r,t,e),T("dtype",r,t,e))];case"ExpandDims":{let n=T("axis",r,t,e);return[o.expandDims(T("x",r,t,e),n)]}case"Squeeze":{let n=T("axis",r,t,e);return[o.squeeze(T("x",r,t,e),n)]}case"Reshape":return[o.reshape(T("x",r,t,e),T("shape",r,t,e))];case"MirrorPad":return[o.mirrorPad(T("x",r,t,e),T("padding",r,t,e),T("mode",r,t,e))];case"PadV2":case"Pad":return[o.pad(T("x",r,t,e),T("padding",r,t,e),T("constantValue",r,t,e))];case"SpaceToBatchND":{let n=T("blockShape",r,t,e),s=T("paddings",r,t,e);return[o.spaceToBatchND(T("x",r,t,e),n,s)]}case"BatchToSpaceND":{let n=T("blockShape",r,t,e),s=T("crops",r,t,e);return[o.batchToSpaceND(T("x",r,t,e),n,s)]}case"DepthToSpace":{let n=T("blockSize",r,t,e),s=T("dataFormat",r,t,e).toUpperCase();return[o.depthToSpace(T("x",r,t,e),n,s)]}case"BroadcastTo":return[o.broadcastTo(T("x",r,t,e),T("shape",r,t,e))];case"BroadcastArgs":return[o.broadcastArgs(T("s0",r,t,e),T("s1",r,t,e))];default:throw TypeError(`Node type ${r.op} is not implemented`)}};function Zy(r,t,e,o,n=St){let s=((a,i,p)=>{switch(a.category){case"arithmetic":return n(()=>U2(a,i,p));case"basic_math":return n(()=>H2(a,i,p));case"control":return Z2(a,i,p);case"convolution":return n(()=>J2(a,i,p));case"creation":return n(()=>tA(a,i,p));case"dynamic":return eA(a,i,p);case"evaluation":return n(()=>rA(a,i,p));case"image":return n(()=>sA(a,i,p));case"graph":return n(()=>oA(a,i,p));case"logical":return n(()=>aA(a,i,p));case"matrices":return n(()=>iA(a,i,p));case"normalization":return n(()=>pA(a,i,p));case"reduction":return n(()=>cA(a,i,p));case"slice_join":return n(()=>lA(a,i,p));case"sparse":return n(()=>uA(a,i,p));case"spectral":return n(()=>mA(a,i,p));case"string":return n(()=>fA(a,i,p));case"transformation":return n(()=>dA(a,i,p));case"hash_table":return nA(a,i,p,o);case"custom":let c=bd(a.op);if(c&&c.customExecutor)return c.customExecutor(new Dd(a,i,p));throw TypeError(`Custom op ${a.op} is not registered.`);default:throw TypeError(`Unknown op '${a.op}'. File an issue at https://github.com/tensorflow/tfjs/issues so we can add it, or register a custom execution with tf.registerOp()`)}})(r,t,e);return y.isPromise(s)?s.then(a=>[].concat(a)):[].concat(s)}var iu=class{constructor(t={},e={},o={},n={}){this.weightMap=t,this.tensorArrayMap=e,this.tensorListMap=o,this.functionMap=n,this.rootContext={id:0,frameName:"",iterationId:0},this.contexts=[this.rootContext],this.lastId=0,this.generateCurrentContextIds()}newFrame(t,e){return{id:t,frameName:e,iterationId:0}}set currentContext(t){this.contexts!==t&&(this.contexts=t,this.generateCurrentContextIds())}get currentContext(){return this.contexts}get currentContextId(){return this._currentContextIds[0]}get currentContextIds(){return this._currentContextIds}generateCurrentContextIds(){let t=[];for(let e=0;e<this.contexts.length-1;e++){let o=this.contexts.slice(0,this.contexts.length-e);t.push(this.contextIdforContexts(o))}t.push(""),this._currentContextIds=t}contextIdforContexts(t){return t?t.map(e=>e.id===0&&e.iterationId===0?"":`${e.frameName}-${e.iterationId}`).join("/"):""}enterFrame(t){this.contexts&&(this.lastId++,this.contexts=this.contexts.slice(),this.contexts.push(this.newFrame(this.lastId,t)),this._currentContextIds.unshift(this.contextIdforContexts(this.contexts)))}exitFrame(){if(this.contexts&&this.contexts.length>1)this.contexts=this.contexts.slice(),this.contexts.splice(-1),this.currentContextIds.shift();else throw new Error("Cannot exit frame, the context is empty")}nextIteration(){if(this.contexts&&this.contexts.length>0){this.contexts=this.contexts.slice(),this.lastId++;let t=Object.assign({},this.contexts[this.contexts.length-1]);t.iterationId+=1,t.id=this.lastId,this.contexts.splice(-1,1,t),this._currentContextIds.splice(0,1,this.contextIdforContexts(this.contexts))}else throw new Error("Cannot increase frame iteration, the context is empty")}getWeight(t){return this.weightMap[t]}addTensorArray(t){this.tensorArrayMap[t.id]=t}getTensorArray(t){return this.tensorArrayMap[t]}addTensorList(t){this.tensorListMap[t.id]=t}getTensorList(t){return this.tensorListMap[t]}dispose(t){for(let e in this.tensorArrayMap)this.tensorArrayMap[e].clearAndClose(t);for(let e in this.tensorListMap)this.tensorListMap[e].clearAndClose(t)}};function Qy(r,t,e,o){let n=new Set,s=[],a=null,i=null,p=new Set,c=Object.keys(r).map(m=>Ue(m)[0]),l=[];o!=null&&(l=o.map(m=>Ue(m.name)[0]));let u=[...t];for(;u.length>0;){let m=u.pop();if((Jy(m)||XH(m)||jH(m))&&a==null&&(a=m,i=a.children.map(f=>f.name).filter(f=>n.has(f))),n.add(m.name),e[m.name]==null&&c.indexOf(m.name)===-1&&l.indexOf(m.name)===-1){if(m.inputs.length===0){s.push(m.name);continue}m.inputs.forEach(f=>{p.has(f.name)||(p.add(f.name),u.push(f))})}}return{inputs:r,outputs:t,usedNodes:n,missingInputs:s,dynamicNode:a,syncInputs:i}}function hA(r,t,e){let{usedNodes:o,inputs:n}=e,s=[],a=Object.keys(n).map(l=>Ue(l)[0]).map(l=>r.nodes[l]),i=r.initNodes;a.forEach(l=>{o.has(l.name)&&s.push(l)}),r.weights.forEach(l=>{o.has(l.name)&&s.push(l)}),i!=null&&i.forEach(l=>{o.has(l.name)&&s.push(l)});let p=new Set,c=[];for(;s.length>0;){let l=s.pop();p.add(l.name),t[l.name]||c.push(l),l.children.forEach(u=>{!p.has(u.name)&&o.has(u.name)&&u.inputs.every(m=>p.has(m.name))&&s.push(u)})}return c}var HH=["Switch","Merge","Enter","Exit","NextIteration","StatelessIf","StatelessWhile","if","While"],qH=["NonMaxSuppressionV2","NonMaxSuppressionV3","NonMaxSuppressionV5","Where"],KH=["HashTable","HashTableV2","LookupTableImport","LookupTableImportV2","LookupTableFind","LookupTableFindV2","LookupTableSize","LookupTableSizeV2"];function Jy(r){return HH.indexOf(r.op)>=0}function XH(r){return qH.indexOf(r.op)>=0}function jH(r){return KH.indexOf(r.op)>=0}var pu=class r{constructor(t,e){this.graph=t,this.parent=e,this.compiledMap=new Map,this._weightMap={},this.SEPERATOR=",",this._functions={},this._functionExecutorMap={},this.intermediateTensors={},this.keepTensorForDebug=!1,this._outputs=t.outputs,this._inputs=t.inputs,this._initNodes=t.initNodes,this._signature=t.signature,this._functions=t.functions,t.functions!=null&&Object.keys(t.functions).forEach(o=>{this._functionExecutorMap[o]=new r(t.functions[o],this)})}get weightIds(){return this.parent?this.parent.weightIds:this._weightIds}get functionExecutorMap(){return this.parent?this.parent.functionExecutorMap:this._functionExecutorMap}get weightMap(){return this.parent?this.parent.weightMap:this._weightMap}set weightMap(t){let e=Object.keys(t).map(o=>t[o].map(n=>n.id));this._weightIds=[].concat(...e),this._weightMap=t}set resourceManager(t){this._resourceManager=t}get inputs(){return this._inputs.map(t=>({name:t.name,shape:t.attrParams.shape?t.attrParams.shape.value:void 0,dtype:t.attrParams.dtype?t.attrParams.dtype.value:void 0}))}get outputs(){return this._outputs.map(t=>({name:t.name,shape:t.attrParams.shape?t.attrParams.shape.value:void 0,dtype:t.attrParams.dtype?t.attrParams.dtype.value:void 0}))}get inputNodes(){return this._inputs.map(t=>t.signatureKey||t.name)}get outputNodes(){return this._outputs.map(t=>{let e=t.signatureKey||t.name;return t.defaultOutput?`${e}:${t.defaultOutput}`:e})}get functions(){return Object.keys(this._functions).reduce((t,e)=>(t[e]=this._functions[e].signature,t),{})}getCompilationKey(t,e){let o=t.map(s=>s.name).sort(),n=e.map(s=>s.name).sort();return o.join(this.SEPERATOR)+"--"+n.join(this.SEPERATOR)}compile(t,e){let o=Qy(t,e,this.weightMap,this._initNodes),{missingInputs:n,dynamicNode:s,syncInputs:a}=o;if(s!=null)throw new Error(`This execution contains the node '${s.name}', which has the dynamic op '${s.op}'. Please use model.executeAsync() instead. Alternatively, to avoid the dynamic ops, specify the inputs [${a}]`);if(n.length>0){let i=e.map(c=>c.name),p=Object.keys(t);throw new Error(`Cannot compute the outputs [${i}] from the provided inputs [${p}]. Missing the following inputs: [${n}]`)}return hA(this.graph,this.weightMap,o)}execute(t,e){t=this.mapInputs(t);let o=Object.keys(t).sort();this.checkInputs(t),this.checkInputShapeAndType(t),e=this.mapOutputs(e),this.checkOutputs(e);let n=o.map(u=>this.graph.nodes[Ue(u)[0]]),s=e.map(u=>Ue(u)[0]),a=s.map(u=>this.graph.nodes[u]);this.resetIntermediateTensors(),a.length===0&&(a=this._outputs);let i=this.getCompilationKey(n,a),p=this.compiledMap.get(i);p==null&&(p=this.compile(t,a),this.compiledMap.set(i,p));let c={},l={};return St(()=>{let u=new iu(this.weightMap,c,l,this.functionExecutorMap),m=Object.assign({},this.weightMap);Object.keys(t).forEach(g=>{let[h,x]=Ue(g),b=[];b[x]=t[g],m[h]=b});let f=this.getFrozenTensorIds(m),d={};for(let g=0;g<p.length;g++){let h=p[g];if(!m[h.name]){let x=Zy(h,m,u,this._resourceManager);if(y.isPromise(x))throw new Error(`The execution of the op '${h.op}' returned a promise. Please use model.executeAsync() instead.`);m[h.name]=x,this.checkTensorForDisposal(h.name,h,m,u,f,s,d)}}return this.parent==null&&u.dispose(f),e.map(g=>ge(g,m,u))})}getFrozenTensorIds(t){let e=[].concat.apply([],Object.keys(t).map(o=>t[o]).map(o=>o.map(n=>n.id)));return new Set(e)}checkTensorForDisposal(t,e,o,n,s,a,i){e.category==="control"||a.indexOf(t)!==-1||(o[t].forEach(p=>{p!=null&&(i[p.id]=(i[p.id]||0)+e.children.length)}),e.inputs.forEach(p=>{if(p.category!=="control"){let c=G2(p.name,o,n);c!=null&&c.forEach(l=>{if(l&&!l.kept&&!s.has(l.id)){let u=i[l.id];if(u===1){if(!this.keepTensorForDebug)l.dispose();else{let[m,f]=Lr(e.name,n);this.intermediateTensors[m]?this.intermediateTensors[m][f]=l:(this.intermediateTensors[m]=[],this.intermediateTensors[m][f]=l)}delete i[l.id]}else u!=null&&i[l.id]--}})}}))}async executeAsync(t,e){return this._executeAsync(t,e)}disposeIntermediateTensors(){this.intermediateTensors&&(Object.keys(this.intermediateTensors).forEach(t=>this.intermediateTensors[t].forEach(e=>e.dispose())),this.disposeTensorsMap())}disposeTensorsMap(){this.tensorsMap&&Object.keys(this.tensorsMap).forEach(t=>{this.tensorsMap[t].forEach(o=>{o&&!o.kept&&!o.isDisposed&&!this.keepIds.has(o.id)&&o.dispose()})})}getIntermediateTensors(){return this.tensorsMap}resetIntermediateTensors(){for(let t in this.intermediateTensors)this.intermediateTensors[t].forEach(e=>e.dispose()),delete this.intermediateTensors[t]}async _executeAsync(t,e,o=!1,n={},s={}){o||(t=this.mapInputs(t),this.checkInputs(t),this.checkInputShapeAndType(t),e=this.mapOutputs(e),this.checkOutputs(e));try{this.keepTensorForDebug=_().getBool("KEEP_INTERMEDIATE_TENSORS")}catch(l){console.warn(l.message)}this.resetIntermediateTensors();let a=new iu(this.weightMap,n,s,this.functionExecutorMap);this.tensorsMap=await this.executeWithControlFlow(t,a,e,o);let i=e.map(l=>ge(l,this.tensorsMap,a)),p=i.map(l=>l.id),c=Object.keys(t).map(l=>t[l].id);return this.keepIds=new Set([...p,...c,...this.weightIds]),this.keepTensorForDebug||this.disposeTensorsMap(),this.parent==null&&a.dispose(this.keepIds),i}async executeFunctionAsync(t,e,o){let n=t.reduce((s,a,i)=>(s[this.inputs[i].name]=a,s),{});return this._executeAsync(n,this.outputNodes,!0,e,o)}async executeWithControlFlow(t,e,o,n){let s=Object.keys(t),a=s.map(S=>this.graph.nodes[Ue(S)[0]]),i=o.map(S=>Ue(S)[0]),p=i.map(S=>this.graph.nodes[S]);p.length===0&&(p=this._outputs);let{usedNodes:c,missingInputs:l,dynamicNode:u,syncInputs:m}=Qy(t,p,this.weightMap,this._initNodes),f=[...a,...this.graph.weights,...this._initNodes||[]].map(S=>({node:S,contexts:e.currentContext})),d=Object.assign({},this.weightMap);Object.keys(t).forEach(S=>{let[w,E]=Ue(S),$=[];$[E]=t[S],d[w]=$});let g={},h=this.getFrozenTensorIds(d),x={};for(;f.length>0;){let S=this.processStack(a,f,e,d,x,h,i,g,c);await Promise.all(S)}u==null&&!n&&console.warn("This model execution did not contain any nodes with control flow or dynamic output shapes. You can use model.execute() instead.");let b=p.filter(S=>!Jy(S)&&!ge(S.name,d,e)).map(S=>S.name);if(b.length>0){let S="";throw u!=null&&(S=`Alternatively, to avoid the dynamic ops, use model.execute() and specify the inputs [${m}]`),new Error(`Cannot compute the outputs [${b}] from the provided inputs [${s}]. Consider providing the following inputs: [${l}]. ${S}`)}return d}processStack(t,e,o,n,s,a,i,p,c){let l=[];for(;e.length>0;){let u=e.pop();o.currentContext=u.contexts;let m="";if(u.node.op==="Enter"&&T("isConstant",u.node,n,o)&&([m]=Lr(u.node.name,o)),n[u.node.name]==null){let f=Zy(u.node,n,o,this._resourceManager);m||([m]=Lr(u.node.name,o));let d=o.currentContext;y.isPromise(f)?l.push(f.then(g=>(n[m]=g,o.currentContext=d,this.checkTensorForDisposal(m,u.node,n,o,a,i,p),this.processChildNodes(u.node,e,o,n,s,c),g))):(n[m]=f,this.checkTensorForDisposal(m,u.node,n,o,a,i,p),this.processChildNodes(u.node,e,o,n,s,c))}else this.processChildNodes(u.node,e,o,n,s,c)}return l}processChildNodes(t,e,o,n,s,a){t.children.forEach(i=>{let[p]=Lr(i.name,o);s[p]||!a.has(i.name)||(i.op==="Merge"?i.inputNames.some(c=>!!ge(c,n,o))&&(s[p]=!0,e.push({contexts:o.currentContext,node:i})):i.inputNames.every(c=>!!ge(c,n,o))&&(s[p]=!0,e.push({contexts:o.currentContext,node:i})))})}dispose(){Object.keys(this.weightMap).forEach(t=>this.weightMap[t].forEach(e=>e.dispose()))}checkInputShapeAndType(t){Object.keys(t).forEach(e=>{let o=t[e],[n]=Ue(e),s=this.graph.nodes[n];if(s.attrParams.shape&&s.attrParams.shape.value){let a=s.attrParams.shape.value,i=a.length===o.shape.length&&o.shape.every((p,c)=>a[c]===-1||a[c]===p);y.assert(i,()=>`The shape of dict['${s.name}'] provided in model.execute(dict) must be [${a}], but was [${o.shape}]`)}s.attrParams.dtype&&s.attrParams.dtype.value&&y.assert(o.dtype===s.attrParams.dtype.value,()=>`The dtype of dict['${s.name}'] provided in model.execute(dict) must be ${s.attrParams.dtype.value}, but was ${o.dtype}`)})}mapInputs(t){let e={};for(let o in t)if(this._signature!=null&&this._signature.inputs!=null&&this._signature.inputs[o]!=null){let n=this._signature.inputs[o];e[n.name]=t[o]}else e[o]=t[o];return e}checkInputs(t){let e=Object.keys(t).filter(o=>{let[n]=Ue(o);return this.graph.nodes[n]==null});if(e.length>0)throw new Error(`The dict provided in model.execute(dict) has keys: [${e}] that are not part of graph`)}mapOutputs(t){return t.map(e=>this._signature!=null&&this._signature.outputs!=null&&this._signature.outputs[e]!=null?this._signature.outputs[e].name:e,{})}checkOutputs(t){t.forEach(e=>{let[o]=Ue(e);if(!this.graph.nodes[o])throw new Error(`The output '${e}' is not found in the graph`)})}};var Od=class{constructor(t={},e={}){this.hashTableNameToHandle=t,this.hashTableMap=e}addHashTable(t,e){this.hashTableNameToHandle[t]=e.handle,this.hashTableMap[e.id]=e}getHashTableHandleByName(t){return this.hashTableNameToHandle[t]}getHashTableById(t){return this.hashTableMap[t]}dispose(){for(let t in this.hashTableMap)this.hashTableMap[t].clearAndClose(),delete this.hashTableMap[t];for(let t in this.hashTableNameToHandle)this.hashTableNameToHandle[t].dispose(),delete this.hashTableNameToHandle[t]}};var YH="?tfjs-format=file",ZH="model.json",Pd=class{constructor(t,e={},o=Xp){this.modelUrl=t,this.loadOptions=e,this.version="n/a",this.io=o,e==null&&(this.loadOptions={}),this.resourceManager=new Od}get modelVersion(){return this.version}get inputNodes(){return this.executor.inputNodes}get outputNodes(){return this.executor.outputNodes}get inputs(){return this.executor.inputs}get outputs(){return this.executor.outputs}get weights(){return this.executor.weightMap}get metadata(){return this.artifacts.userDefinedMetadata}get modelSignature(){return this.signature}get modelStructuredOutputKeys(){return this.structuredOutputKeys}findIOHandler(){let t=this.modelUrl;if(t.load!=null)this.handler=t;else if(this.loadOptions.requestInit!=null)this.handler=this.io.browserHTTPRequest(t,this.loadOptions);else{let e=this.io.getLoadHandlers(t,this.loadOptions);if(e.length===0)e.push(this.io.browserHTTPRequest(t,this.loadOptions));else if(e.length>1)throw new Error(`Found more than one (${e.length}) load handlers for URL '${[t]}'`);this.handler=e[0]}}load(){if(this.findIOHandler(),this.handler.load==null)throw new Error("Cannot proceed with model loading because the IOHandler provided does not have the `load` method implemented.");let t=this.handler.load();return y.isPromise(t)?t.then(e=>this.loadSync(e)):this.loadSync(t)}loadSync(t){this.artifacts=t;let e=this.artifacts.modelTopology,o=this.artifacts.signature;if(this.artifacts.userDefinedMetadata!=null){let s=this.artifacts.userDefinedMetadata;s.signature!=null&&(o=s.signature),s.structuredOutputKeys!=null&&(this.structuredOutputKeys=s.structuredOutputKeys)}this.signature=o,this.version=`${e.versions.producer}.${e.versions.minConsumer}`;let n=this.io.decodeWeights(this.artifacts.weightData,this.artifacts.weightSpecs);if(this.executor=new pu(au.Instance.transformGraph(e,this.signature)),this.executor.weightMap=this.convertTensorMapToTensorsMap(n),this.executor.resourceManager=this.resourceManager,t.modelInitializer!=null&&t.modelInitializer.node!=null){let s=au.Instance.transformGraph(t.modelInitializer);this.initializer=new pu(s),this.initializer.weightMap=this.executor.weightMap,this.initializer.resourceManager=this.resourceManager,this.initializer.executeAsync({},[])}return!0}async save(t,e){if(typeof t=="string"){let o=this.io.getSaveHandlers(t);if(o.length===0)throw new Error(`Cannot find any save handlers for URL '${t}'`);if(o.length>1)throw new Error(`Found more than one (${o.length}) save handlers for URL '${t}'`);t=o[0]}if(t.save==null)throw new Error("GraphModel.save() cannot proceed because the IOHandler provided does not have the `save` attribute defined.");return t.save(this.artifacts)}predict(t,e){let o=this.execute(t,this.outputNodes);if(this.structuredOutputKeys){let n=o instanceof Rt?[o]:o,s={};return n.forEach((a,i)=>s[this.structuredOutputKeys[i]]=a),s}return o}normalizeInputs(t){if(!(t instanceof Rt)&&!Array.isArray(t))return t;if(t=Array.isArray(t)?t:[t],t.length!==this.inputNodes.length)throw new Error(`Input tensor count mismatch,the graph model has ${this.inputNodes.length} placeholders, while there are ${t.length} input tensors.`);return this.inputNodes.reduce((e,o,n)=>(e[o]=t[n],e),{})}normalizeOutputs(t){return t=t||this.outputNodes,Array.isArray(t)?t:[t]}execute(t,e){t=this.normalizeInputs(t),e=this.normalizeOutputs(e);let o=this.executor.execute(t,e);return o.length>1?o:o[0]}async executeAsync(t,e){t=this.normalizeInputs(t),e=this.normalizeOutputs(e);let o=await this.executor.executeAsync(t,e);return o.length>1?o:o[0]}getIntermediateTensors(){return this.executor.getIntermediateTensors()}disposeIntermediateTensors(){this.executor.disposeIntermediateTensors()}convertTensorMapToTensorsMap(t){return Object.keys(t).reduce((e,o)=>(e[o]=[t[o]],e),{})}dispose(){this.executor.dispose(),this.initializer&&this.initializer.dispose(),this.resourceManager.dispose()}};async function cu(r,t={},e=Xp){if(r==null)throw new Error("modelUrl in loadGraphModel() cannot be null. Please provide a url or an IOHandler that loads the model");t==null&&(t={}),t.fromTFHub&&typeof r=="string"&&(r=QH(r));let o=new Pd(r,t,e);return await o.load(),o}function QH(r){return r.endsWith("/")||(r=r+"/"),`${r}${ZH}${YH}`}var tb={contours:"Identity",onsets:"Identity_2",frames:"Identity_1"},gA=1,lu=22050,eb=256,JH=Math.floor(lu/eb),tq=2,yA=lu*tq-eb,bA=30,xA=Math.floor(bA/2),Md=bA*eb,eq=yA-Md,Bd=class{constructor(t){if(Md%2!==0)throw new Error(`OVERLAP_LENGTH_FRAMES is not divisible by 2! Is ${Md}`);this.model=typeof t=="string"?cu(t):t}adjustNoteStart(t,e){return t.map(o=>({startTimeSeconds:o.startTimeSeconds+e,durationSeconds:o.durationSeconds,pitch_midi:o.pitchMidi,amplitude:o.amplitude,pitchBends:o.pitchBends}))}async evaluateSingleFrame(t,e){let o=await this.model,n=xt(t,e,1),s=o.execute(n,[tb.frames,tb.onsets,tb.contours]);return[s[0],s[1],s[2]]}async prepareData(t){let e=jc([_e([Math.floor(Md/2)],"float32"),Te(t)]);return[ze(Xu.frame(e,yA,eq,!0,0),-1),t.length]}unwrapOutput(t){let e=t;e=t.slice([0,xA,0],[-1,t.shape[1]-2*xA,-1]);let o=e.shape;return e.reshape([o[0]*o[1],o[2]])}async evaluateModel(t,e,o){let n;if(t instanceof Float32Array)n=t;else{if(t.sampleRate!==lu)throw new Error(`Input audio buffer is not at correct sample rate! Is ${t.sampleRate}. Should be ${lu}`);if(t.numberOfChannels!==gA)throw new Error(`Input audio buffer is not mono! Number of channels is ${t.numberOfChannels}. Should be ${gA}`);n=t.getChannelData(0)}let[s,a]=await this.prepareData(n),i=Math.floor(a*(JH/lu)),p=0;for(let c=0;c<s.shape[0];++c){o(c/s.shape[0]);let[l,u,m]=await this.evaluateSingleFrame(s,c),f=this.unwrapOutput(l),d=this.unwrapOutput(u),g=this.unwrapOutput(m),h=f.shape[0];if(!(p>=i)){if(h+p>=i){let x=i-p;f=f.slice([0,0],[x,-1]),d=d.slice([0,0],[x,-1]),g=g.slice([0,0],[x,-1])}p+=h,e(await f.array(),await d.array(),await g.array())}}o(1)}};var Gd=21,Vd=22050,SA=2,uu=256,rq=Math.floor(Vd/uu),wA=rq*SA,oq=Vd*SA-uu,nq=uu/Vd*(wA-oq/uu)+.0018,rb=87,NA=3,sq=27.5,aq=88,CA=aq*NA,TA=r=>12*(Math.log2(r)-Math.log2(440))+69,iq=r=>440*2**((r-69)/12),ob=r=>r*uu/Vd-nq*Math.floor(r/wA);function vA(r){return r.length===0?null:r.reduce((t,e,o)=>r[t]>e?t:o,-1)}var pq=r=>r.map(t=>vA(t));function cq(r,t){let e=[],o=[];for(let n=0;n<r.length;n++)for(let s=0;s<r[n].length;s++)r[n][s]>t&&(e.push(n),o.push(s));return[e,o]}function lq(r){let[t,e,o]=r.reduce((a,i)=>{let[p,c,l]=i.reduce((u,m)=>[u[0]+m,u[1]+m*m,u[2]+1],[0,0,0]);return[a[0]+p,a[1]+c,a[2]+l]},[0,0,0]),n=t/o,s=Math.sqrt(1/(o-1)*(e-t*t/o));return[n,s]}function nb(r){return r.reduce((t,e)=>Math.max(t,...e),0)}function uq(r){let t=r[0].map(e=>e.slice());for(let e=1;e<r.length;++e)for(let o=0;o<r[0].length;++o)for(let n=0;n<r[0][0].length;++n)t[o][n]=Math.min(t[o][n],r[e][o][n]);return t}function mq(r,t=1){let e=[];for(let o=0;o<r[0].length;++o)for(let n=0;n<r.length;++n){let s=!0;for(let a=Math.max(0,n-t);s&&a<=Math.min(r.length-1,n+t);++a)a!==n&&(s=s&&r[n][o]>r[a][o]);s&&e.push([n,o])}return e}function fq(r){let t=r[0].map(e=>e.slice());for(let e=1;e<r.length;++e)for(let o=0;o<r[0].length;++o)for(let n=0;n<r[0][0].length;++n)t[o][n]=Math.max(t[o][n],r[e][o][n]);return t}function dq(r){return r!==null}function hq(r,t,e,o){if(e){let n=TA(e)-Gd;for(let s=0;s<r.length;s++)r[s].fill(0,n);for(let s=0;s<t.length;s++)t[s].fill(0,n)}if(o){let n=TA(o)-Gd;for(let s=0;s<r.length;s++)r[s].fill(0,0,n);for(let s=0;s<t.length;s++)t[s].fill(0,0,n)}}function gq(r,t,e=2){let o=Array.from(Array(e).keys()).map(i=>i+1).map(i=>{let p=Array(i).fill(Array(t[0].length).fill(0)).concat(t),c=p.slice(i),l=p.slice(0,-i);if(c.length!==l.length)throw new Error(`nPlus length !== minusN length: ${c.length} !== ${l.length}`);return c.map((u,m)=>u.map((f,d)=>f-l[m][d]))}),n=uq(o);n=n.map(i=>i.map(p=>Math.max(p,0))),n=n.map((i,p)=>p<e?i.fill(0):i);let s=nb(r),a=nb(n);return n=n.map(i=>i.map(p=>s*p/a)),fq([r,n])}function IA(r,t,e=.5,o=.3,n=5,s=!0,a=null,i=null,p=!0,c=11){let l=o;if(l===null){let[b,S]=lq(r);l=b+S}let u=r.length;hq(t,r,a,i);let m=t;s&&(m=gq(t,r));let f=m.map(b=>b.map(()=>0));mq(m).forEach(([b,S])=>{f[b][S]=m[b][S]});let[d,g]=cq(f,e);d.reverse(),g.reverse();let h=r.map(b=>b.slice()),x=d.map((b,S)=>{let w=g[S];if(b>=u-1)return null;let E=b+1,$=0;for(;E<u-1&&$<c;)h[E][w]<l?$+=1:$=0,E+=1;if(E-=$,E-b<=n)return null;for(let F=b;F<E;++F)h[F][w]=0,w<rb&&(h[F][w+1]=0),w>0&&(h[F][w-1]=0);let D=r.slice(b,E).reduce((F,P)=>F+P[w],0)/(E-b);return{startFrame:b,durationFrames:E-b,pitchMidi:w+Gd,amplitude:D}}).filter(dq);if(p===!0)for(;nb(h)>l;){let[b,S]=h.reduce((P,L,M)=>{let B=vA(L);return L[B]>h[P[0]][P[1]]?[M,B]:P},[0,0]);h[b][S]=0;let w=b+1,E=0;for(;w<u-1&&E<c;)h[w][S]<l?E+=1:E=0,h[w][S]=0,S<rb&&(h[w][S+1]=0),S>0&&(h[w][S-1]=0),w+=1;let $=w-1-E;for(w=b-1,E=0;w>0&&E<c;)h[w][S]<l?E+=1:E=0,h[w][S]=0,S<rb&&(h[w][S+1]=0),S>0&&(h[w][S-1]=0),w-=1;let D=w+1+E;if(D<0)throw new Error(`iStart is not positive! value: ${D}`);if($>=u)throw new Error(`iEnd is past end of times. (iEnd, times.length): (${$}, ${u})`);let F=r.slice(D,$).reduce((P,L)=>P+L[S],0)/($-D);$-D<=n||x.push({startFrame:D,durationFrames:$-D,pitchMidi:S+Gd,amplitude:F})}return x}var xq=(r,t)=>Array.from(Array(r).keys()).map(e=>Math.exp(-1*(e-(r-1)/2)**2/(2*t**2))),yq=r=>12*NA*Math.log2(iq(r)/sq);function kA(r,t,e=25){let o=e*2+1,n=xq(o,5);return t.map(s=>{let a=Math.floor(Math.round(yq(s.pitchMidi))),i=Math.max(a-e,0),p=Math.min(CA,a+e+1),c=n.slice(Math.max(0,e-a),o-Math.max(0,a-(CA-e-1))),l=r.slice(s.startFrame,s.startFrame+s.durationFrames).map(f=>f.slice(i,p).map((d,g)=>d*c[g])),u=e-Math.max(0,e-a),m=pq(l).map(f=>f-u);return Object.assign(Object.assign({},s),{pitchBends:m})})}var EA=r=>r.map(t=>({pitchMidi:t.pitchMidi,amplitude:t.amplitude,pitchBends:t.pitchBends,startTimeSeconds:ob(t.startFrame),durationSeconds:ob(t.startFrame+t.durationFrames)-ob(t.startFrame)}));return LA(bq);})();
