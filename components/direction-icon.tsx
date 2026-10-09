export default function DirectionIcon({direction='right',size=18}:{direction?:'left'|'right';size?:number}) {
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={direction==='left'?'m14 6-6 6 6 6':'m10 6 6 6-6 6'}/></svg>;
}
