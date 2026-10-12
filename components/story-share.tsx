import StoryLinkCopy from './story-link-copy';
import {facebookStoryShareUrl,storyUrl} from '@/lib/story-sharing';
export default function StoryShare({slug}:{slug:string}){
 return <div className="story-share"><span>მოგეწონა სტატია? გაუზიარე სხვებს</span><div className="story-share-actions"><a className="story-facebook-share" href={facebookStoryShareUrl(slug)} target="_blank" rel="noopener noreferrer" aria-label="სტატიის Facebook-ზე გაზიარება — იხსნება ახალ ფანჯარაში"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.92 3.77-3.92 1.09 0 2.23.2 2.23.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.9h2.78l-.44 2.91h-2.34V22C18.34 21.24 22 17.08 22 12.06Z"/></svg>Facebook-ზე გაზიარება</a><StoryLinkCopy url={storyUrl(slug)}/></div></div>;
}
