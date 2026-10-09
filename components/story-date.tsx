import {CalendarDays} from 'lucide-react';
import {formatStoryDate} from '@/lib/display-format';
export default function StoryDate({value}:{value?:string}){
 const date=formatStoryDate(value);if(!date)return null;
 return <time className="story-date" dateTime={date.dateTime} aria-label={'დადების თარიღი: '+date.label}><CalendarDays size={13} aria-hidden="true"/>{date.label}</time>;
}
