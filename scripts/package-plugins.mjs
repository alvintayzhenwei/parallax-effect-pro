import {mkdir,cp,readFile,writeFile,lstat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {parseArgs} from 'node:util';
const {values}=parseArgs({options:{output:{type:'string',default:'plugins'}}});const output=resolve(values.output);const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
const meta={version:pkg.version,description:pkg.description,author:{name:'alvintayzhenwei'},repository:'https://github.com/alvintayzhenwei/parallax-effect-pro',license:'MIT'};
for(const host of ['codex','claude']){
 const name="parallax-effect-pro",root=join(output,`parallax-effect-pro-${host}`);try{await lstat(root);throw new Error('Output already exists; choose a new directory');}catch(e){if(e.code!=='ENOENT')throw e;}
 await mkdir(root,{recursive:true});await cp(new URL('../skills',import.meta.url),join(root,'skills'),{recursive:true});
 if(host==='codex'){await writeFile(join(root,'plugin.json'),JSON.stringify({$schema:'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',name,...meta,extensions:{'com.openai':{interface:{displayName:'Parallax Effect Pro',shortDescription:'Approve motion before building',longDescription:pkg.description,developerName:'alvintayzhenwei',category:'Productivity',capabilities:['Write'],defaultPrompt:'Help me design a parallax website. Compare three concepts and preview motion before building.'}}}},null,2));await mkdir(join(root,'.codex-plugin'));await writeFile(join(root,'.codex-plugin/plugin.json'),JSON.stringify({name,...meta,skills:'./skills/'},null,2));}
 else{await mkdir(join(root,'.claude-plugin'));await writeFile(join(root,'.claude-plugin/plugin.json'),JSON.stringify({name,...meta},null,2));}
 await writeFile(join(root,'README.md'),'# Parallax Effect Pro\n\nThis thin package installs the canonical skill. Configure the separately installed local stdio MCP with an explicit absolute project root; see the repository installation guide. Runway MCP is optional and separately authenticated. No global setup or paid generation occurs at install.\n');
 await cp(new URL('../LICENSE',import.meta.url),join(root,'LICENSE'));
}
await mkdir(join(output,'.agents/plugins'),{recursive:true});await writeFile(join(output,'.agents/plugins/marketplace.json'),JSON.stringify({name:'parallax-effect-pro',owner:{name:'alvintayzhenwei'},plugins:[{name:'parallax-effect-pro',source:{source:'local',path:'./parallax-effect-pro-codex'},policy:{installation:'AVAILABLE',authentication:'ON_INSTALL'},category:'Productivity'}]},null,2));
await mkdir(join(output,'.claude-plugin'),{recursive:true});await writeFile(join(output,'.claude-plugin/marketplace.json'),JSON.stringify({name:'parallax-effect-pro',owner:{name:'alvintayzhenwei'},plugins:[{name:'parallax-effect-pro',source:'./parallax-effect-pro-claude'}]},null,2));
console.log(`Generated skill packages and local marketplaces in ${output}`);
