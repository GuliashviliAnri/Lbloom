"use client";
import {heightInCentimeters,parseDimensions,formatDimensions,dimensionLabels} from '@/lib/measurements';
export function HeightInput({value,onChange}:{value:string;onChange:(value:string)=>void}) {
 const normalized=heightInCentimeters(value);
 const numeric=/^[\d.,\s–-]+(?: სმ)?$/.test(normalized)?normalized.replace(/\s*სმ$/,''):'';
 return <label>სიმაღლე<div className="admin-unit-input"><input type="text" inputMode="text" pattern="[0-9.,]+([–-][0-9.,]+)?" placeholder="მაგ. 120 ან 100–130" value={numeric} onChange={e=>onChange(e.target.value?heightInCentimeters(e.target.value):'')}/><span>სმ</span></div>{value&&!numeric&&<small className="admin-field-hint">არსებული მნიშვნელობა: {value}</small>}</label>;
}
export function FurnitureMeasurements({value,onChange}:{value:string;onChange:(value:string)=>void}) {
 const dimensions=parseDimensions(value);
 return <div className="admin-dimensions"><div className="admin-dimension-fields">{Object.entries(dimensionLabels).map(([key,label])=><label key={key}>{label}<div className="admin-unit-input"><input type="number" min="0" step="0.1" placeholder="0" value={dimensions[key as keyof typeof dimensionLabels]} onChange={e=>onChange(formatDimensions({...dimensions,[key]:e.target.value}))}/><span>სმ</span></div></label>)}</div></div>;
}
