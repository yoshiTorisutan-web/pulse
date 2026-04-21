// ═══════════════════════════════════════════════════
// PULSE — State & Local Storage
// ═══════════════════════════════════════════════════
'use strict';

const S = {
  // Current request
  method: 'GET',
  url: '',
  params: [{k:'',v:'',on:true}],
  headers: [
    {k:'Content-Type',v:'application/json',on:true},
    {k:'Accept',v:'application/json',on:true},
    {k:'',v:'',on:true}
  ],
  bodyType: 'json',
  bodyRaw: '',
  formData: [{k:'',v:'',on:true}],
  authType: 'none',
  authData: {},

  // Collections
  collections: [{
    name: 'Exemples',
    open: true,
    requests: [
      {id:'r1',name:'Get Posts',method:'GET',url:'https://jsonplaceholder.typicode.com/posts',params:[],headers:[],bodyType:'json',bodyRaw:'',authType:'none',authData:{}},
      {id:'r2',name:'Get User #1',method:'GET',url:'https://jsonplaceholder.typicode.com/users/1',params:[],headers:[],bodyType:'json',bodyRaw:'',authType:'none',authData:{}},
      {id:'r3',name:'Create Post',method:'POST',url:'https://jsonplaceholder.typicode.com/posts',params:[],headers:[{k:'Content-Type',v:'application/json',on:true}],bodyType:'json',bodyRaw:'{\n  "title": "Hello World",\n  "body": "Post content",\n  "userId": 1\n}',authType:'none',authData:{}},
      {id:'r4',name:'Delete Post',method:'DELETE',url:'https://jsonplaceholder.typicode.com/posts/1',params:[],headers:[],bodyType:'json',bodyRaw:'',authType:'none',authData:{}},
    ]
  }],
  history: [],
  nextId: 100,

  // Environments
  environments: [
    {name:'Développement', vars:[{k:'BASE_URL',v:'https://api.dev.example.com'},{k:'API_KEY',v:'dev_key_123'}]},
    {name:'Production',    vars:[{k:'BASE_URL',v:'https://api.example.com'},{k:'API_KEY',v:'prod_key_abc'}]},
    {name:'(aucun)',        vars:[]},
  ],
  curEnv: 0,

  // UI state
  reqTab: 'params',
  respTab: 'body',
  respView: 'pretty',
  sidebarTab: 'collections',
  snippetLang: 'curl',
  searchQuery: '',

  // Request state
  response: null,
  loading: false,
  abortController: null,
};

function saveToStorage() {
  try {
    localStorage.setItem('pulse_v2', JSON.stringify({
      collections: S.collections,
      history: S.history.slice(0, 60),
      environments: S.environments,
      curEnv: S.curEnv,
      nextId: S.nextId,
    }));
  } catch(e) {}
}

function loadFromStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem('pulse_v2') || '{}');
    if (saved.collections) S.collections = saved.collections;
    if (saved.history) S.history = saved.history;
    if (saved.environments) S.environments = saved.environments;
    if (saved.curEnv !== undefined) S.curEnv = saved.curEnv;
    if (saved.nextId) S.nextId = saved.nextId;
    S.collections.forEach(c => { if (c.open === undefined) c.open = true; });
    renderEnvSelect();
    renderSidebar();
  } catch(e) {}
}
