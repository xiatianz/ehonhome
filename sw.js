const addResourcesToCache = async (resources) => {
  const cache = await caches.open('v1');
  for(let i=0;i<resources.length;i++){
    if((await cache.match(resources[i]))===undefined){
      try {
        await cache.add(resources[i]);
      } catch (error) {
        console.log(resources[i]);
      }
    }
  }
};

const reAddResourcesToCache = async (resources) => {
  const cache = await caches.open('v1');
  await cache.addAll(resources);
};

const gc=[
  './',
  './index.html',
  './index.bundle.css',
  './index.bundle.js',
  './assets/localforage.js',
  './assets/def_addon.png',
  './assets/logo.svg',
  'https://fonts.gstatic.com/s/materialsymbolsoutlined/v213/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2'
]

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    addResourcesToCache(gc)
  );
});


const cacheFirst = async ({ request, preloadResponsePromise}) => {
  // POST 请求不经过缓存，直接转发
  if (request.method !== 'GET') {
    return fetch(request);
  }
  const cache=await caches.open('v1');
  const responseFromCache = await cache.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }
  // 缓存未命中，请求网络
  return fetch(request);
};

self.addEventListener('fetch',(event)=>{
  // Supabase API 和 Auth 请求不经过 Service Worker，直接放行
  if (event.request.url.includes('supabase.co')) {
    return;
  }
  event.respondWith(
    cacheFirst({
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
    })
  );
})

self.addEventListener('message',function(ev){
  if(ev.data=='update'){
    reAddResourcesToCache([
      './',
      './index.html',
      './index.bundle.css',
      './index.bundle.js'
    ]).then(function(){
      ev.source.postMessage('updated')
    })
  }else if(ev.data.type="add"){
    try{
      addResourcesToCache([ev.data.url]);
    }catch(e){}
  }
})
