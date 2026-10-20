'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {Bold,Italic,Underline,List,ListOrdered,Link,Undo2,Redo2,RemoveFormatting} from 'lucide-react';
import {richTextHtml,richTextMarker,richTextSizes,sanitizeRichHtml} from '@/lib/rich-text';
export default function AdminRichText({value,onChange,label}:{value:string;onChange:(value:string)=>void;label:string}){
 const editor=useRef<HTMLDivElement>(null);const last=useRef<string|null>(null);const selection=useRef<Range|null>(null);const id=useId();const [linkOpen,setLinkOpen]=useState(false);const [url,setUrl]=useState('');const [size,setSize]=useState('');
 useEffect(()=>{if(editor.current&&last.current!==value){editor.current.innerHTML=richTextHtml(value);last.current=value}},[value]);
 function update(){if(!editor.current)return;const html=sanitizeRichHtml(editor.current.innerHTML);const next=editor.current.textContent?.trim()?richTextMarker+html:'';last.current=next;onChange(next)}
 function command(name:string,arg?:string){editor.current?.focus();document.execCommand(name,false,arg);update()}
 function rememberSelection(){const current=window.getSelection();if(current?.rangeCount&&editor.current?.contains(current.getRangeAt(0).commonAncestorContainer))selection.current=current.getRangeAt(0).cloneRange()}
 function resizeText(value:string){
  const root=editor.current;const range=selection.current;const current=window.getSelection();
  if(!root||!range||!current||range.collapsed||!root.contains(range.commonAncestorContainer)||!richTextSizes.includes(Number(value)))return;
  const prefix=range.cloneRange();prefix.selectNodeContents(root);prefix.setEnd(range.startContainer,range.startOffset);
  const start=prefix.toString().length;const length=range.toString().length;if(!length)return;
  const fragment=range.cloneContents();const walker=document.createTreeWalker(fragment,NodeFilter.SHOW_TEXT);const nodes:Node[]=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){if(!node.textContent)continue;const span=document.createElement('span');span.style.fontSize=value+'px';node.parentNode?.replaceChild(span,node);span.appendChild(node)}
  const holder=document.createElement('div');holder.appendChild(fragment);
  root.focus();current.removeAllRanges();current.addRange(range);
  if(!document.execCommand('insertHTML',false,holder.innerHTML))return;
  // Keep the same text selected so another size can be chosen immediately.
  const restored=document.createRange();const text=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let offset=0;let started=false;
  while(text.nextNode()){const node=text.currentNode;const end=offset+(node.textContent?.length??0);if(!started&&start<=end){restored.setStart(node,start-offset);started=true}if(started&&start+length<=end){restored.setEnd(node,start+length-offset);current.removeAllRanges();current.addRange(restored);selection.current=restored.cloneRange();break}offset=end}
  setSize(value);update();
 }
 const buttons=[{name:'bold',label:'გამუქება',Icon:Bold},{name:'italic',label:'დახრილი ტექსტი',Icon:Italic},{name:'underline',label:'ხაზგასმა',Icon:Underline},{name:'insertUnorderedList',label:'მარკირებული სია',Icon:List},{name:'insertOrderedList',label:'დანომრილი სია',Icon:ListOrdered},{name:'undo',label:'უკან დაბრუნება',Icon:Undo2},{name:'redo',label:'გამეორება',Icon:Redo2},{name:'removeFormat',label:'ფორმატირების გასუფთავება',Icon:RemoveFormatting}];
 return <div className="full admin-rich-field"><span id={id}>{label}</span><div className="admin-rich-editor"><div className="admin-rich-toolbar" role="toolbar" aria-label="ტექსტის ფორმატირება">{buttons.map(({name,label:tip,Icon})=><button key={name} type="button" title={tip} aria-label={tip} onMouseDown={e=>e.preventDefault()} onClick={()=>command(name)}><Icon size={17}/></button>)}<select aria-label="ტექსტის ზომა პიქსელებში" title="მონიშნული ტექსტის ზომა" value={size} onMouseDown={rememberSelection} onFocus={rememberSelection} onChange={e=>resizeText(e.target.value)}><option value="" disabled>ზომა (px)</option>{richTextSizes.map(px=><option key={px} value={String(px)}>{px}px</option>)}</select><select aria-label="აბზაცის სტილი" defaultValue="p" onChange={e=>command('formatBlock',e.target.value)}><option value="p">აბზაცი</option><option value="h2">სათაური</option><option value="h3">ქვესათაური</option><option value="blockquote">ციტატა</option></select><button type="button" title="ბმულის დამატება" aria-label="ბმულის დამატება" onMouseDown={e=>e.preventDefault()} onClick={()=>{const s=window.getSelection();selection.current=s?.rangeCount?s.getRangeAt(0).cloneRange():null;setLinkOpen(v=>!v)}}><Link size={17}/></button></div>{linkOpen&&<div className="admin-rich-link"><input type="url" aria-label="ბმულის მისამართი" placeholder="https://…" value={url} onChange={e=>setUrl(e.target.value)}/><button type="button" disabled={!/^https?:\/\/[^\s<>"']+$/i.test(url)} onClick={()=>{editor.current?.focus();const s=window.getSelection();if(selection.current&&s){s.removeAllRanges();s.addRange(selection.current)}command('createLink',url);setLinkOpen(false);setUrl('')}}>დამატება</button><button type="button" onClick={()=>setLinkOpen(false)}>გაუქმება</button></div>}<div ref={editor} className="admin-rich-content rich-content" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-labelledby={id} onInput={update} onMouseUp={rememberSelection} onKeyUp={rememberSelection} onBlur={()=>{rememberSelection();update()}} onPaste={e=>{e.preventDefault();command('insertText',e.clipboardData.getData('text/plain'))}}/></div><small className="admin-field-hint">მონიშნეთ ტექსტი და აირჩიეთ ფორმატი ან ზომა (10–72px). Ctrl / ⌘ + B — გამუქება.</small></div>;
}
