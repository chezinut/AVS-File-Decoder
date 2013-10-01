//convert
var sizeInt=4;var presetHeaderLength=25;var builtinMax=16384;var componentTable=[{name:"Effect List",code:4294967294,group:"",func:"effectList"},{name:"Buffer Save",code:18,group:"Misc",func:"bufferSave"},{name:"Comment",code:21,group:"Misc",func:"comment"},{name:"Set Render Mode",code:40,group:"Misc",func:"renderMode"},{name:"Color Modifier",code:45,group:"Trans",func:"colorModifier"},{name:"AVS Trans Automation",code:[77,105,115,99,58,32,65,86,83,84,114,97,110,115,32,65,117,116,111,109,97,116,105,111,110,0,0,0,0,0,0,0],group:"Misc",func:"avsTrans"},{name:"Texer II",code:[65,99,107,111,46,110,101,116,58,32,84,101,120,101,114,32,73,73,0,0,0,0,0,0,0,0,0,0,0,0,0,0],group:"Render",func:"texer2"},{name:"Color Map",code:[67,111,108,111,114,32,77,97,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],group:"Trans",func:"colorMap"}];function convertPreset(f){var c=[];var b=new Uint8Array(f);try{var a=decodePresetHeader(b.subarray(0,presetHeaderLength));c.push(jsonKeyValBool("clearFrame",a));var d=convertComponents(b.subarray(presetHeaderLength));c.push(jsonKeyArr("components",d))}catch(g){if(g instanceof ConvertException){log("Error: "+g.message);return null}else{throw g}}return cJoin(c)}function convertComponents(a){var b=0;var f=[];while(b<a.length){var g=getUInt32(a,b);var e=getComponentIndex(g,a,b);var h=g>builtinMax&&g!==4294967294;var d=getComponentSize(a,b+sizeInt+h*32);if(e<0){var c=jsonKeyVal("type","Unknown: ("+(-e)+")")}else{var c=window["decode_"+componentTable[e].func](a,b+sizeInt*2+h*32)}if(!c||typeof c!=="string"){throw new ConvertException("Unknown convert error")}f.push(jsonKeyObj(null,c));b+=d+sizeInt*2+h*32}if(pedanticMode&&a[b-1]!==0){}return cJoin(f)}function getComponentIndex(c,a,d){if(c<builtinMax||c===4294967294){for(var b=0;b<componentTable.length;b++){if(c===componentTable[b].code){log("Found component: "+componentTable[b].name+" ("+c+")");return b}}}else{for(var b=0;b<componentTable.length;b++){if(componentTable[b].code instanceof Array&&cmpBytes(a,d+sizeInt,componentTable[b].code)){log("Found component: "+componentTable[b].name);return b}}}log("Found unknown component (code:"+c+")");return -c}function getComponentSize(a,b){return getUInt32(a,b)}function decodePresetHeader(a){var b=[78,117,108,108,115,111,102,116,32,65,86,83,32,80,114,101,115,101,116,32,48,46,50,26];if(!cmpBytes(a,0,b)){throw new ConvertException("Invalid preset header.")}return a[presetHeaderLength-1]}function decode_effectList(a,f){var n=getUInt32(a,f-sizeInt);var m=[];m.push(jsonKeyVal("type","EffectList"));var l=getBitField(a[f+1]);m.push(jsonKeyValBool("enabled",!l[1]));m.push(jsonKeyValBool("clearFrame",l[0]));m.push(jsonKeyVal("input",getBlendmodeIn(a[f+2])));m.push(jsonKeyVal("output",getBlendmodeOut(a[f+3])));m.push(jsonKeyVal("inAdjustBlend",getUInt32(a,f+5)));m.push(jsonKeyVal("outAdjustBlend",getUInt32(a,f+9)));m.push(jsonKeyVal("inBuffer",getUInt32(a,f+13)));m.push(jsonKeyVal("outBuffer",getUInt32(a,f+17)));m.push(jsonKeyValBool("inBufferInvert",getUInt32(a,f+21)===1));m.push(jsonKeyValBool("outBufferInvert",getUInt32(a,f+25)===1));m.push(jsonKeyValBool("enableOnBeat",getUInt32(a,f+29)===1));m.push(jsonKeyVal("onBeatFrames",getUInt32(a,f+33)));var b=[0,64,0,0,65,86,83,32,50,46,56,43,32,69,102,102,101,99,116,32,76,105,115,116,32,67,111,110,102,105,103,0,0,0,0,0];var j=f+37;var g=n-37;var d=j;if(cmpBytes(a,j,b)){j+=b.length;var k=getUInt32(a,j);d+=b.length+sizeInt+k;g=n-37-b.length-sizeInt-k;m.push(jsonKeyValBool("codeEnabled",getUInt32(a,j+sizeInt)===1));var i=[];var e=getUInt32(a,j+sizeInt*2);i.push(jsonKeyVal("init",getString(a,j+sizeInt*3,e)));var c=getUInt32(a,j+sizeInt*3+e);i.push(jsonKeyVal("frame",getString(a,j+sizeInt*4+e,c)));m.push(jsonKeyObj("code",cJoin(i)))}var h=convertComponents(a.subarray(d,d+g));m.push(jsonKeyArr("components",h));return cJoin(m)}function decode_bufferSave(a,c){var b=[];b.push(jsonKeyVal("type","BufferSave"));b.push(jsonKeyVal("mode",getBufferMode(a[c])));b.push(jsonKeyVal("buffer",a[c+sizeInt]));b.push(jsonKeyVal("blend",getBlendmodeBuffer(a[c+sizeInt*2])));b.push(jsonKeyVal("adjustBlend",a[c+sizeInt*3]));return cJoin(b)}function decode_comment(a,d){var b=[];var c=getString(a,d+sizeInt,getUInt32(a,d));b.push(jsonKeyVal("type","Comment"));b.push(jsonKeyVal("comment",c));return cJoin(b)}function decode_colorModifier(a,c){var b=[];b.push(jsonKeyVal("type","ColorModifier"));b.push(jsonKeyVal("recomputeEveryFrame",a[c]));b.push(jsonKeyObj("code",decodeCodePFBI(a,c+1)));return cJoin(b)}function decode_renderMode(a,c){var b=[];b.push(jsonKeyVal("type","SetRenderMode"));b.push(jsonKeyVal("enabled",a[c+3]>>7));b.push(jsonKeyVal("blend",getBlendmodeRender(a[c])));b.push(jsonKeyVal("adjustBlend",a[c+1]));b.push(jsonKeyVal("lineSize",a[c+2]));return cJoin(b)}function decode_avsTrans(a,d){var c=getUInt32(a,d-sizeInt);var b=[];b.push(jsonKeyVal("type","AVS Trans Automation"));b.push(jsonKeyValBool("enabled",getUInt32(a,d)===1));b.push(jsonKeyValBool("logging",getUInt32(a,d+sizeInt)===1));b.push(jsonKeyValBool("translateFirstLevel",getUInt32(a,d+sizeInt*2)===1));b.push(jsonKeyValBool("readCommentCodes",getUInt32(a,d+sizeInt*3)===1));b.push(jsonKeyVal("code",getString(a,d+sizeInt*4,c-sizeInt*4)));return cJoin(b)}function decode_texer2(a,c){var b=[];b.push(jsonKeyVal("type","Texer2"));return cJoin(b)}function decode_colorMap(a,c){var b=[];b.push(jsonKeyVal("type","ColorMap"));return cJoin(b)}function decodeCodePFBI(b,g){var d=new Array(4);var f=[3,1,2,0];var a=["perPoint","onFrame","onBeat","init"];for(var c=0,e=g;c<4;c++,e+=size+sizeInt){size=getUInt32(b,e);d[f[c]]=jsonKeyVal(a[c],getString(b,e+sizeInt,size))}return cJoin(d)}function getBlendmodeIn(b){var a={"0":"Ignore","1":"Replace","2":"50/50","3":"Maximum","4":"Additive","5":"Dest-Src","6":"Src-Dest","7":"EveryOtherLine","8":"EveryOtherPixel","9":"XOR","10":"Adjustable","11":"Multiply","12":"Buffer"};return a[b]}function getBlendmodeOut(b){var a={"0":"Replace","1":"Ignore","2":"Maximum","3":"50/50","4":"Dest-Src","5":"Additive","6":"EveryOtherLine","7":"Src-Dest","8":"XOR","9":"EveryOtherPixel","10":"Multiply","11":"Adjustable","13":"Buffer"};return a[b]}function getBlendmodeBuffer(b){var a={"0":"Replace","1":"50/50","2":"Additive","5":"EveryOtherPixel","4":"Dest-Src","5":"EveryOtherLine","6":"XOR","7":"Maximum","8":"Minimum","9":"Src-Dest","10":"Multiply","11":"Adjustable"};return a[b]}function getBlendmodeRender(b){var a={"0":"Replace","1":"Additive","2":"Maximum","3":"50/50","4":"Dest-Src","5":"Src-Dest","6":"Multiply","7":"Adjustable","8":"XOR"};return a[b]}function getBufferMode(a){var b={"0":"Save","1":"Restore","2":"AlternateSaveRestore","3":"AlternateRestoreSave"};return b[a]};
//dirwalk
function walkDirTree(c,e){walkDirFilter(c.files,e);var b=c.SubFolders;walkDirFilter(b,e);var a=new Enumerator(b);while(!a.atEnd()){var d=a.item();walkDirTree(d,c.name+"/"+d.name,e);a.moveNext()}}function walkDirFilter(a,c){var d=new Enumerator(a);while(!d.atEnd()){var b=d.item();if(b.name.match(c)){d.moveNext()}}};
//files
function checkCompat(){if(window.File&&window.FileReader&&window.FileList&&window.Blob){compat=true}else{compat=false}}function loadDir(c,e){var a=c.files;var d=[];for(var b=0;b<a.length;b++){if(e.test(a[b].name)){d.push(a[b])}}return d}function loadFile(b,c){if(!b instanceof File){log("Error: 'file' parameter is no file.");return false}if(typeof c!=="function"){log("Error: 'callback' parameter is no function.");return false}log("Loading file "+b.name+"... ");var a=new FileReader();a.onloadend=function(d){if(d.target.readyState==FileReader.DONE){c(d.target.result,b.name)}};a.readAsArrayBuffer(b)};
//main
var compat=false;var outputDir="";var pedanticMode=true;$(document).ready(function(){checkCompat();log("File API check: "+(compat?"success":"fail")+".");var a=[];$("#preset").change(function(){a=loadDir(this,/\.avs$/);log("Found "+a.length+" files in directory.");for(var b=0;b<a.length;b++){loadFile(a[b],saveAvsAsJson)}})});function saveAvsAsJson(d,b){var a=("#output");var c=[jsonKeyVal("name",b.substr(0,b.length-4)),jsonKeyVal("author","-"),convertPreset(d)];$(a).html("{\n"+cJoin(c)+"\n}");$(a).each(function(f,g){hljs.highlightBlock(g)})};
//util
function log(a){$("#log").append(a+"\n")}function ConvertException(a){this.message=a;this.name="ConvertException"}function jsonKeyVal(a,b){return'"'+a+'": "'+b+'"'}function jsonKeyValBool(a,b){return'"'+a+'": '+(b?"true":"false")}function jsonKeyArr(b,a){return'"'+b+'": [\n'+a+"]"}function jsonKeyObj(a,b){if(a){return'"'+a+'": {\n'+b+"}"}else{return"{\n"+b+"}"}}function cJoin(a){return a.join(",\n")+"\n"}function cmpBytes(a,c,d){for(var b=0;b<d.length;b++){if(d[b]===null){continue}if(a[b+c]!==d[b]){return false}}return true}function getUInt32(a,b){if(!b){b=0}var c=a.buffer.slice(a.byteOffset+b,a.byteOffset+b+4);return new Uint32Array(c,0,1)[0]}function getBitField(c){var b=8;var d=new Array(b);for(var a=0;a<b;a++){d[a]=((c>>a)&1)===1}return d}function getString(b,e,d){var a="";d+=e;for(var c=e;c<d-1;c++){a+=String.fromCharCode(b[c])}if(pedanticMode&&b[d-1]!==0){throw new ConvertException("Couldn't find terminating zero after string. (pedantic)")}return escapeJson(a)}function escapeJson(a){return a.replace(/[\"]/g,'\\"').replace(/[\f]/g,"\\f").replace(/[\n]/g,"\\n").replace(/[\r]/g,"\\r").replace(/[\t]/g,"\\t")};
//highlight
hljs.initHighlightingOnLoad();
//select
function SelectText(element){var doc=document;var text=doc.getElementById(element);if(doc.body.createTextRange){var range=doc.body.createTextRange();range.moveToElementText(text);range.select()}else{if(window.getSelection){var selection=window.getSelection();var range=doc.createRange();range.selectNodeContents(text);selection.removeAllRanges();selection.addRange(range)}}};
$(function(){$("#output").click(function(){SelectText("output")})});