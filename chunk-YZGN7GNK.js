import{e as c}from"./chunk-IQVJWSD3.js";var h={INVALID:["seeking position failed.","InvalidStateError"],GONE:["A requested file or directory could not be found at the time an operation was processed.","NotFoundError"],MISMATCH:["The path supplied exists, but was not an entry of requested type.","TypeMismatchError"],MOD_ERR:["The object can not be modified in this way.","InvalidModificationError"],SYNTAX:e=>[`Failed to execute 'write' on 'UnderlyingSinkBase': Invalid params passed. ${e}`,"SyntaxError"],ABORT:["The operation was aborted","AbortError"],SECURITY:["It was determined that certain files are unsafe for access within a Web application, or that too many calls are being made on file resources.","SecurityError"],DISALLOWED:["The request is not allowed by the user agent or the platform in the current context.","NotAllowedError"]},b=e=>typeof e=="object"&&typeof e.type<"u";function F(e){return c(this,null,function*(){var t,o,i;let{FolderHandle:r,FileHandle:m}=yield import("./chunk-GUTPUJZP.js"),{FileSystemDirectoryHandle:u}=yield import("./chunk-5SA5OKF3.js"),f=(o=(t=e[0].webkitRelativePath)===null||t===void 0?void 0:t.split("/",1)[0])!==null&&o!==void 0?o:"",p=new r(f,!1);for(let s=0;s<e.length;s++){let n=e[s],l=!((i=n.webkitRelativePath)===null||i===void 0)&&i.length?n.webkitRelativePath.split("/"):["",n.name];l.shift();let w=l.pop(),y=l.reduce((d,a)=>(d._entries[a]||(d._entries[a]=new r(a,!1)),d._entries[a]),p);y._entries[w]=new m(n.name,n,!1)}return new u(p)})}function v(e){return c(this,null,function*(){let{FileHandle:t}=yield import("./chunk-GUTPUJZP.js"),{FileSystemFileHandle:o}=yield import("./chunk-UU2I34MI.js");return Array.from(e).map(r=>new o(new t(r.name,r,!1)))})}export{h as a,b,F as c,v as d};