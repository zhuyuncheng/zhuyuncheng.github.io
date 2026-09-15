const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'assets/diagrams/articles');
fs.mkdirSync(dir, {recursive:true});
const manifest=[];
for(const file of fs.readdirSync(path.join(root,'_posts'))){
  if(!file.endsWith('.md'))continue;
  const text=fs.readFileSync(path.join(root,'_posts',file),'utf8');let i=0;
  for(const m of text.matchAll(/^```(mermaid|plantuml)\s*\n([\s\S]*?)^```\s*$/gm)){
    const id=file.slice(0,-3)+'-'+String(++i).padStart(2,'0');
    const ext=m[1]==='mermaid'?'mmd':'puml';
    const src=path.join(dir,id+'.'+ext);
    fs.writeFileSync(src,m[2]);
    manifest.push({file,id,kind:m[1],src,raw:m[0]});
  }
}
if (!manifest.length && fs.existsSync(path.join(dir,'manifest.json'))) {
  manifest.push(...JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8')));
}
for (const entry of manifest) entry.src=path.basename(entry.src);
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
if(process.argv.includes('--extract')){console.log('Extracted',manifest.length);process.exit();}
let failures=0;
for(const entry of manifest){
  const output=path.join(dir,entry.id+'.svg');
  if(fs.existsSync(output)&&!process.argv.includes('--force'))continue;
  const r=entry.kind==='mermaid'
    ?spawnSync('mmdc',['-i',path.join(dir,entry.src),'-o',output,'-b','white'],{encoding:'utf8'})
    :spawnSync('java',['-jar',process.env.PLANTUML_JAR||'/tmp/blog-plantuml.jar','-tsvg','-charset','UTF-8',path.join(dir,entry.src)],{encoding:'utf8'});
  if(entry.kind==='plantuml') {
    const name=fs.readFileSync(path.join(dir,entry.src),'utf8').match(/^@startuml\s+(\S+)/m);
    if(name && fs.existsSync(path.join(dir,name[1]+'.svg'))) fs.copyFileSync(path.join(dir,name[1]+'.svg'),output);
  }
  if(r.status!==0 || !fs.existsSync(output)){failures++;console.error(entry.id,(r.stderr||r.stdout).slice(-1500));}
  else console.log('Rendered',entry.id);
}
process.exitCode=failures?1:0;
