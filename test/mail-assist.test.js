import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeProfile,sourceUrls,readerProfile} from '../src/mail-assist.js';
import {validateBrief} from '../src/mail-briefs.js';

test('profile text is trimmed and capped',()=>{
  assert.equal(normalizeProfile('  Year 2 \r\n Data Science  '),'Year 2 \n Data Science');
  assert.equal(normalizeProfile('x'.repeat(900)).length,800);
  assert.equal(normalizeProfile(undefined),'');
});
test('reader profile is read from mail preferences',async()=>{
  const env={DB:{prepare(){return {bind(){return this},async first(){return {mail_preferences:JSON.stringify({profile:'Interested in ILP'})}}}}}};
  assert.equal(await readerProfile(env,'u1'),'Interested in ILP');
});
test('registration links come only from the source text',()=>{
  assert.deepEqual(sourceUrls('Register at https://lingnan.example/form. Thanks'),['https://lingnan.example/form']);
  assert.deepEqual(sourceUrls('No link here'),[]);
});
test('forYou keeps only lines without invented numbers',()=>{
  const source='Workshop on 23 November. Register by 13 November at https://x.example/f';
  const base={title:'Workshop',titleEvidence:'Workshop on 23 November',points:[{text:'Workshop on 23 November',evidence:'Workshop on 23 November'}],actions:[]};
  assert.equal(validateBrief({...base,forYou:'Matches your interest in culture.'},source).forYou,'Matches your interest in culture.');
  assert.equal(validateBrief({...base,forYou:'You have 3 credits left.'},source).forYou,'');
});
import {dateInSource} from '../src/mail-assist.js';
test('task dates must appear in the email',()=>{
  const src='The exhibition is on 18 November 2026 (Wednesday), 11:30 am to 5:00 pm.';
  assert.equal(dateInSource('2026-11-18T11:30:00+08:00',src),true);
  assert.equal(dateInSource('2026-11-19T11:30:00+08:00',src),false);
  assert.equal(dateInSource('2026-12-12T10:30:00+08:00','活動於12月12日舉行'),true);
});
import {readBrief,profileTag} from '../src/mail-briefs.js';
test('For you follows the current About me',async()=>{
  const brief={title:'i4i pitch deck due',topic:'i4i',points:[{text:'Submit by 18 Nov',evidence:'x'}],actions:[],forYou:'Old line',forYouFor:await profileTag('old')};
  const kv=new Map();
  const env={DB:{prepare(sql){return {bind(...a){this.a=a;return this},async all(){return {results:[]}},async first(){
    if(sql.includes('mail_preferences'))return {mail_preferences:JSON.stringify({profile:'I am in i4i'})};
    if(sql.includes('FROM kv WHERE key=?')){const k=this.a[0];if(k.startsWith('foryou-v1'))return kv.has(k)?{value:kv.get(k)}:null;return {value:JSON.stringify(brief)};}
    return null;}}}}};
  assert.equal((await readBrief(env,'u','en','m1')).forYou,'');
  for(const k of [...Array(1)]){}
  const tag=await profileTag('I am in i4i');
  const {hash}=await import('../src/security.js');
  kv.set(`foryou-v1:u:en:${await hash('m1')}:${tag}`,'You are taking part in i4i.');
  assert.equal((await readBrief(env,'u','en','m1')).forYou,'You are taking part in i4i.');
});
