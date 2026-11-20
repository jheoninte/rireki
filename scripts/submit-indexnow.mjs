import { loadEnv } from 'vite';

const key = loadEnv('production', process.cwd(), 'INDEXNOW_').INDEXNOW_KEY;
if (!key || !/^[a-zA-Z0-9-]{8,128}$/.test(key)) throw new Error('Configure INDEXNOW_KEY before submitting');
const host = 'rireki-easy.pages.dev';
const keyLocation = `https://${host}/${key}.txt`;
const proof = await fetch(keyLocation);
if (!proof.ok || (await proof.text()).trim() !== key) throw new Error('Deploy the ownership file before submitting');
// One participating engine shares notifications with the other IndexNow participants.
const response = await fetch('https://www.bing.com/indexnow', {
  method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation, urlList: ['/', '/ko/', '/en/'].map(path => `https://${host}${path}`) }),
});
if (![200, 202].includes(response.status)) throw new Error(`IndexNow rejected submission: HTTP ${response.status}`);
console.log(`IndexNow: HTTP ${response.status}; 3 public home URLs received${response.status === 202 ? ', ownership validation pending' : ''}. This does not confirm indexing.`);
