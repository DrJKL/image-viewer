var u=Object.create;var m=Object.defineProperty,v=Object.defineProperties,w=Object.getOwnPropertyDescriptor,x=Object.getOwnPropertyDescriptors,y=Object.getOwnPropertyNames,p=Object.getOwnPropertySymbols,z=Object.getPrototypeOf,r=Object.prototype.hasOwnProperty,A=Object.prototype.propertyIsEnumerable;var l=(b,a)=>{if(a=Symbol[b])return a;throw Error("Symbol."+b+" is not defined")};var q=(b,a,c)=>a in b?m(b,a,{enumerable:!0,configurable:!0,writable:!0,value:c}):b[a]=c,C=(b,a)=>{for(var c in a||={})r.call(a,c)&&q(b,c,a[c]);if(p)for(var c of p(a))A.call(a,c)&&q(b,c,a[c]);return b},D=(b,a)=>v(b,x(a));var E=(b,a)=>()=>(a||b((a={exports:{}}).exports,a),a.exports);var B=(b,a,c,g)=>{if(a&&typeof a=="object"||typeof a=="function")for(let d of y(a))!r.call(b,d)&&d!==c&&m(b,d,{get:()=>a[d],enumerable:!(g=w(a,d))||g.enumerable});return b};var F=(b,a,c)=>(c=b!=null?u(z(b)):{},B(a||!b||!b.__esModule?m(c,"default",{value:b,enumerable:!0}):c,b));var G=(b,a,c)=>new Promise((g,d)=>{var e=f=>{try{i(c.next(f))}catch(j){d(j)}},h=f=>{try{i(c.throw(f))}catch(j){d(j)}},i=f=>f.done?g(f.value):Promise.resolve(f.value).then(e,h);i((c=c.apply(b,a)).next())}),s=function(b,a){this[0]=b,this[1]=a},H=(b,a,c)=>{var g=(h,i,f,j)=>{try{var n=c[h](i),o=(i=n.value)instanceof s,t=n.done;Promise.resolve(o?i[0]:i).then(k=>o?g(h==="return"?h:"next",i[1]?{done:k.done,value:k.value}:k,f,j):f({value:k,done:t})).catch(k=>g("throw",k,f,j))}catch(k){j(k)}},d=h=>e[h]=i=>new Promise((f,j)=>g(h,i,f,j)),e={};return c=c.apply(b,a),e[Symbol.asyncIterator]=()=>e,d("next"),d("throw"),d("return"),e},I=b=>{var a=b[l("asyncIterator")],c=!1,g,d={};return a==null?(a=b[l("iterator")](),g=e=>d[e]=h=>a[e](h)):(a=a.call(b),g=e=>d[e]=h=>{if(c){if(c=!1,e==="throw")throw h;return h}return c=!0,{done:!1,value:new s(new Promise(i=>{var f=a[e](h);if(!(f instanceof Object))throw TypeError("Object expected");i(f)}),1)}}),d[l("iterator")]=()=>d,g("next"),"throw"in a?g("throw"):d.throw=e=>{throw e},"return"in a&&g("return"),d},J=(b,a,c)=>(a=b[l("asyncIterator")])?a.call(b):(b=b[l("iterator")](),a={},c=(g,d)=>(d=b[g])&&(a[g]=e=>new Promise((h,i,f)=>(e=d.call(b,e),f=e.done,Promise.resolve(e.value).then(j=>h({value:j,done:f}),i)))),c("next"),c("return"),a);export{C as a,D as b,E as c,F as d,G as e,s as f,H as g,I as h,J as i};
