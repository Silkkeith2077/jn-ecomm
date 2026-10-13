import fs from 'node:fs';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
const doc=new DOMParser().parseFromString(fs.readFileSync('public/brand/docs2travel-icon.svg','utf8'),'image/svg+xml');
const defs=doc.getElementsByTagName('defs')[0];
const airplane=[...Array.from(doc.getElementsByTagName('g'))].find(g=>g.getAttribute('id')==='airplane');
airplane.setAttribute('transform','translate(120, 120) rotate(60)');
airplane.removeAttribute('filter');
const serializer=new XMLSerializer();
fs.writeFileSync('public/brand/airplane.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">${serializer.serializeToString(defs)}${serializer.serializeToString(airplane)}</svg>`);
