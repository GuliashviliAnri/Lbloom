"use client";
import {useCallback,useEffect,useRef,useState} from 'react';

/** Compare editable values only: database metadata and object key order are irrelevant. */
export function draftFingerprint(draft:Record<string,unknown>,fields:readonly string[]):string{
 return JSON.stringify(fields.map(field=>draft[field]??''));
}

export function useAdminUnsavedChanges(dirty:boolean,working:boolean){
 const [pending,setPending]=useState<(()=>void)|null>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 const bypass=useRef(false);
 const requestLeave=useCallback((action:()=>void)=>{
  if(working)return;
  if(dirty)setPending(()=>action);else action();
 },[dirty,working]);
 useEffect(()=>{
  if(!dirty&&!working)return;
  const warn=(event:BeforeUnloadEvent)=>{if(bypass.current)return;event.preventDefault();event.returnValue='';};
  const link=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const anchor=event.target instanceof Element?event.target.closest('a'):null;
   if(!anchor||anchor.hasAttribute('download')||(anchor.target&&anchor.target!=='_self'))return;
   const url=new URL(anchor.href,window.location.href);
   if(url.protocol!=='https:'&&url.protocol!=='http:')return;
   if(url.origin===location.origin&&url.pathname===location.pathname&&url.search===location.search)return;
   event.preventDefault();event.stopPropagation();
   requestLeave(()=>{bypass.current=true;window.location.assign(url.href);});
  };
  window.addEventListener('beforeunload',warn);
  document.addEventListener('click',link,true);
  return()=>{window.removeEventListener('beforeunload',warn);document.removeEventListener('click',link,true);};
 },[dirty,working,requestLeave]);
 useEffect(()=>{if(pending&&!dialog.current?.open)dialog.current?.showModal();else if(!pending&&dialog.current?.open)dialog.current.close();},[pending]);
 const warning=<dialog className="admin-unsaved-dialog" ref={dialog} aria-labelledby="admin-unsaved-title" aria-describedby="admin-unsaved-description" onCancel={()=>setPending(null)}>
  <h2 id="admin-unsaved-title">ცვლილებები ჯერ არ შეგინახავთ</h2>
  <p id="admin-unsaved-description">გასვლის შემთხვევაში ეს ცვლილებები დაიკარგება. შესანახად დაბრუნდით რედაქტირებაში და დააჭირეთ „ცვლილებების შენახვას“.</p>
  <div className="admin-unsaved-actions"><button type="button" className="button" autoFocus onClick={()=>setPending(null)}>რედაქტირების გაგრძელება</button><button type="button" className="button secondary" onClick={()=>{const action=pending;setPending(null);action?.();}}>შეუნახავად გასვლა</button></div>
 </dialog>;
 return {requestLeave,warning};
}
