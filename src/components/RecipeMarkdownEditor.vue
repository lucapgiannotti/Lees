<template>
<div class="md-editor">
  <div class="toolbar">
    <button @click="fmt('bold')"><b>B</b></button>
    <button @click="fmt('italic')"><i>I</i></button>
    <button @click="fmt('heading')">H</button>
    <button @click="fmt('list')">●</button>
  </div>
  <div class="tabs">
    <button :class="{active:m==='edit'}" @click="m='edit'">Write</button>
    <button :class="{active:m==='preview'}" @click="m='preview'">Preview</button>
  </div>
  <textarea v-if="m==='edit'" v-model="c" class="ta" placeholder="Write recipe..." @input="$emit('update',c)"></textarea>
  <div v-if="m==='preview'" class="pv" v-html="render(c)"></div>
</div></template><script>export default{props:['value'],data(){return{m:'edit',c:this.value||''}},methods:{fmt(t){const ta=this.$el.querySelector('.ta');const s=ta.selectionStart,e=ta.selectionEnd;const sel=this.c.substring(s,e);const w={bold:['**'+sel+'**',4],italic:['_'+sel+'_',2],heading:['## '+sel+'\n',5],list:['- '+sel],link:'['+sel+'](url)'};this.c=this.c.substring(0,s)+w[t]+this.c.substring(e);this.$emit('update',this.c)},md(t){return(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/_(.+?)_/g,'<em>$1</em>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^- (.+)$/gm,'<li>$1</li>').replace(/\n/g,'<br>')},sanitize(h){return h.replace(/<(\/?(\w+)[^>]*)>/g,(m,s,t)=>{const a=['b','strong','em','i','h1','h2','h3','ul','ol','li','br','p'];return a.includes(t)?m:''})},render(c){return this.sanitize(this.md(c))}},watch:{value(v){if(v!==undefined)this.c=v}}}</script><style scoped>.md-editor{border:1px solid #ddd;border-radius:8px}.toolbar{display:flex;gap:4px;padding:8px;background:#f5f5f5}.toolbar button{padding:6px 10px;border:1px solid #ccc;border-radius:4px;cursor:pointer}.tabs{display:flex;padding:4px 8px;background:#fafafa}.tabs button{padding:6px 16px;border:none;background:transparent;cursor:pointer;border-bottom:2px solid transparent}.tabs button.active{border-bottom-color:#007bff;color:#007bff;font-weight:bold}.ta{width:100%;min-height:200px;padding:12px;border:none;resize:vertical;font-family:monospace;font-size:14px;outline:none}.pv{padding:16px;min-height:200px;line-height:1.6}</style>