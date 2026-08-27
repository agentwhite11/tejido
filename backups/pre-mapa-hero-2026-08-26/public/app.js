const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const state={token:localStorage.getItem('tejido_token'),user:null,publications:[],categories:[],kind:'TODOS',search:''};
const labels={HISTORIA:'Historia',EVENTO:'Evento',OPORTUNIDAD:'Oportunidad',TALENTO:'Talento',INICIATIVA:'Iniciativa'};
const statusLabels={DRAFT:'Borrador',REVIEW:'En revisión',PUBLISHED:'Publicado',REJECTED:'Rechazado'};
let pendingFavoriteId=null;

const kindImages={HISTORIA:'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_h.jpg',EVENTO:'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_t.jpg',OPORTUNIDAD:'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_ce.jpg',TALENTO:'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_h.jpg',INICIATIVA:'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_ce.jpg'};
function publicationVisual(p){const image=p.image||kindImages[p.kind];if(!image)return 'var(--mint)';return image.startsWith('linear-gradient')?image:`linear-gradient(180deg,rgba(18,59,50,.05),rgba(18,59,50,.42)),url("${image}") center/cover`}
async function api(path,options={}){const headers={'Content-Type':'application/json',...(options.headers||{})};if(state.token)headers.Authorization='Bearer '+state.token;const res=await fetch(path,{...options,headers});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.message||'No fue posible completar la acción');return data}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2800)}
function escapeHTML(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[c]))}
function skeletonCard(){return '<div class="content-card"><div class="skeleton" style="height:235px"></div><div class="card-body"><div class="skeleton skeleton-text w60"></div><div class="skeleton skeleton-text w80" style="height:22px;margin:10px 0"></div><div class="skeleton skeleton-text"></div></div></div>'}
function skeletonAgenda(){return '<div class="agenda-item"><div class="skeleton" style="width:80px;height:70px;border-radius:12px"></div><div style="flex:1"><div class="skeleton skeleton-text w60" style="height:18px"></div><div class="skeleton skeleton-text w40"></div></div></div>'}
function showSkeletons(){$('#contentGrid').innerHTML=Array(6).fill(skeletonCard()).join('');$('#agendaList').innerHTML=Array(3).fill(skeletonAgenda()).join('');$('#opportunityGrid').innerHTML=Array(3).fill('<div class="skeleton" style="height:160px;border-radius:22px"></div>').join('')}
function normalizeText(value=''){return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()}
function parseLocalDate(value){if(!value)return null;const dateOnly=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);return dateOnly?new Date(+dateOnly[1],+dateOnly[2]-1,+dateOnly[3]):new Date(value)}
function formatDate(v){const d=parseLocalDate(v);if(!d||Number.isNaN(d.getTime()))return 'Para descubrir';return new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'short',year:'numeric'}).format(d)}
function dateTimeInput(value){if(!value)return '';return /^\d{4}-\d{2}-\d{2}$/.test(value)?value+'T23:59':value.slice(0,16)}
function upcomingEvents(){const today=new Date();today.setHours(0,0,0,0);return state.publications.filter(p=>p.kind==='EVENTO'&&parseLocalDate(p.start_date||p.created_at)>=today).sort((a,b)=>parseLocalDate(a.start_date||a.created_at)-parseLocalDate(b.start_date||b.created_at))}
function openModal(id){$('#overlay').classList.remove('hidden');$(id).classList.remove('hidden');document.body.style.overflow='hidden'}
function closeAll(){
  const cancellingLogin=!state.user&&!$('#loginModal')?.classList.contains('hidden');
  $$('#overlay,.modal,.drawer').forEach(x=>x.classList.add('hidden'));
  document.body.style.overflow='';
  if(cancellingLogin)pendingFavoriteId=null;
}
function card(p){return `<div class="content-card" data-id="${p.id}" tabindex="0"><div class="card-image" style="background:${escapeHTML(publicationVisual(p))}"><span class="kind-tag">${labels[p.kind]||p.kind}</span><button class="favorite ${p.favorite?'on':''}" data-favorite="${p.id}" aria-label="Guardar">${p.favorite?'♥':'♡'}</button></div><div class="card-body"><div class="card-meta"><span>${formatDate(p.start_date||p.created_at)}</span><span>·</span><span>${escapeHTML(p.location||'Caucasia')}</span></div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.summary)}</p></div></div>`}
function renderPublications(){const search=normalizeText(state.search);const filtered=state.publications.filter(p=>(state.kind==='TODOS'||p.kind===state.kind)&&(!search||normalizeText([p.title,p.summary,p.location].join(' ')).includes(search)));$('#contentGrid').innerHTML=filtered.map(card).join('');$('#emptyState').classList.toggle('hidden',filtered.length>0);bindCards();renderAgenda();renderOpportunities()}
function bindCards(){$$('.content-card').forEach(el=>{el.addEventListener('click',e=>{if(!e.target.closest('[data-favorite]'))showDetail(+el.dataset.id)});el.addEventListener('keydown',e=>{if(e.key==='Enter')showDetail(+el.dataset.id)})});$$('[data-favorite]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();toggleFavorite(+b.dataset.favorite,b)}))}
function renderAgenda(){const events=upcomingEvents().slice(0,4);$('#agendaList').innerHTML=events.map(p=>{const d=parseLocalDate(p.start_date||p.created_at);return `<div class="agenda-item"><div class="date-box"><b>${d.getDate()}</b><span>${d.toLocaleDateString('es-CO',{month:'short'})}</span></div><div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.location||'Caucasia')} · ${d.toLocaleTimeString('es-CO',{hour:'numeric',minute:'2-digit'})}</p></div><button data-open="${p.id}" aria-label="Abrir ${escapeHTML(p.title)}">+</button></div>`}).join('')||'<div class="empty-panel">No hay próximos eventos publicados.</div>';$$('[data-open]').forEach(b=>b.onclick=()=>showDetail(+b.dataset.open))}
function renderOpportunities(){const items=state.publications.filter(p=>p.kind==='OPORTUNIDAD').slice(0,3);$('#opportunityGrid').innerHTML=items.map(p=>`<article class="opp-card"><span>OPORTUNIDAD · ${formatDate(p.end_date)}</span><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.summary)}</p><button class="text-link" data-open="${p.id}">Conocer más →</button></article>`).join('');$$('[data-open]').forEach(b=>b.onclick=()=>showDetail(+b.dataset.open))}

let mapKind='TODOS';
const caucasiaCenter=[7.9865,-75.1935];
const knownPlaces=[['malecón de caucasia',[7.9892,-75.1987]],['el pando',[7.9768,-75.2052]],['parque de las banderas',[7.9828,-75.1998]],['parques de caucasia',[7.9817,-75.1879]]];
function normalizeLocation(value=''){return normalizeText(value)}
function publicationCoords(p){const location=normalizeLocation(p.location||'Caucasia');const known=knownPlaces.find(([name])=>location.includes(normalizeLocation(name)));return known?known[1]:caucasiaCenter}
function osmUrl(coords=caucasiaCenter){const [lat,lon]=coords;return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`}
function mapEmbedUrl(coords){if(!coords)return 'https://www.openstreetmap.org/export/embed.html?bbox=-75.222%2C7.964%2C-75.166%2C8.006&layer=mapnik';const [lat,lon]=coords,bbox=[lon-.008,lat-.005,lon+.008,lat+.005].join(',');return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(lat+','+lon)}`}
function renderMap(){
  const map=$('#territoryMap');
  const items=state.publications.filter(p=>mapKind==='TODOS'||p.kind===mapKind);
  const list=items.map(p=>`<button data-place-id="${p.id}" title="${escapeHTML(p.title)} — ${escapeHTML(p.location||'Caucasia')}"><span class="place-dot ${p.kind.toLowerCase()}"></span><b>${escapeHTML(p.title)}</b><small>${escapeHTML(p.location||'Caucasia')}</small></button>`).join('');
  const legend=`
    <div class="map-legend">
      <span class="map-legend-item"><span class="map-legend-dot" style="background:var(--orange)"></span>Eventos</span>
      <span class="map-legend-item"><span class="map-legend-dot" style="background:var(--purple)"></span>Oportunidades</span>
      <span class="map-legend-item"><span class="map-legend-dot" style="background:var(--yellow);border:1px solid var(--ink)"></span>Historias</span>
      <span class="map-legend-item"><span class="map-legend-dot" style="background:var(--ink)"></span>Talento</span>
      <span class="map-legend-item"><span class="map-legend-dot" style="background:#3b82f6"></span>Iniciativas</span>
    </div>`;
  map.innerHTML=`<iframe class="osm-frame" src="${mapEmbedUrl()}" title="Mapa real de Caucasia"></iframe><div class="map-place-list">${list}</div>${legend}`;
  $$('[data-place-id]',map).forEach(button=>button.onclick=()=>selectMapItem(+button.dataset.placeId));
  const first=$('.map-place-list [data-place-id]',map);
  if(first)selectMapItem(+first.dataset.placeId);
  else $('#mapCard').innerHTML='<span class="map-card-icon">+</span><h3>No hay puntos en esta categoría</h3><p>Prueba otro filtro para seguir explorando el territorio.</p>';
}
function selectMapItem(id){
  const map=$('#territoryMap'),p=state.publications.find(item=>item.id===id);
  if(!p)return;
  const coords=publicationCoords(p),frame=$('.osm-frame',map);
  $$('[data-place-id]',map).forEach(item=>item.classList.toggle('active',+item.dataset.placeId===id));
  if(frame)frame.src=mapEmbedUrl(coords);
  $('#mapCard').innerHTML=`<span class="map-card-icon">⌖</span><p class="map-meta">${labels[p.kind]||p.kind} · ${escapeHTML(p.location||'Caucasia')}</p><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.summary)}</p><a class="text-link external-map" href="${osmUrl(coords)}" target="_blank" rel="noopener">Abrir ubicación en OpenStreetMap</a><button class="btn btn-primary" data-map-open="${p.id}">Ver publicación</button>`;
  $('[data-map-open]').onclick=()=>showDetail(id);
}
function renderSaved(){
  const section=$('#guardadas'),nav=$('#savedNav'),mobile=$('.mobile-saved');
  const logged=!!state.user;
  section.classList.toggle('hidden',!logged);nav.classList.toggle('hidden',!logged);mobile?.classList.toggle('hidden',!logged);
  if(!logged)return;
  const saved=state.publications.filter(p=>p.favorite);
  $('#savedGrid').innerHTML=saved.map(p=>`<article class="saved-card"><button class="remove-saved" data-remove-saved="${p.id}" aria-label="Quitar de guardadas">♥</button><span class="saved-kind">${escapeHTML(labels[p.kind]||p.kind)} guardado</span><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.summary)}</p><div class="saved-meta"><span>⌖ ${escapeHTML(p.location||'Caucasia')}</span><span>◷ ${formatDate(p.end_date||p.start_date)}</span></div><button class="text-link" data-saved-open="${p.id}">Ver contenido →</button></article>`).join('');
  $('#savedEmpty').classList.toggle('hidden',saved.length>0);
  $$('[data-saved-open]').forEach(b=>b.onclick=()=>showDetail(+b.dataset.savedOpen));
  $$('[data-remove-saved]').forEach(b=>b.onclick=()=>toggleFavorite(+b.dataset.removeSaved,b));
}
async function showDetail(id){
  try{
    const p=await api('/api/publications/'+id);
    const external=p.link?`<a class="btn btn-soft" href="${escapeHTML(p.link)}" target="_blank" rel="noopener">Abrir enlace ↗</a>`:'';
    $('#detailContent').innerHTML=`<div class="detail-hero" style="background:${escapeHTML(publicationVisual(p))}"></div><p class="eyebrow">${labels[p.kind]}</p><h2>${escapeHTML(p.title)}</h2><div class="detail-meta"><span>◷ ${formatDate(p.start_date||p.created_at)}</span><span>⌖ ${escapeHTML(p.location||'Caucasia')}</span><span>Por ${escapeHTML(p.author)}</span></div><p><b>${escapeHTML(p.summary)}</b></p><p>${escapeHTML(p.content)}</p><div class="detail-actions"><button class="btn btn-primary" id="detailFav">${p.favorite?'♥ Guardado':'♡ Guardar'}</button>${external}<button class="btn btn-soft" id="shareBtn">Compartir</button><button class="btn btn-soft" id="reportBtn">Reportar</button></div>`;
    closeAll();openModal('#detailModal');
    $('#detailFav').onclick=()=>toggleFavorite(id,$('#detailFav'),true);
    $('#shareBtn').onclick=async()=>{try{await navigator.clipboard.writeText(location.origin+'/#contenido-'+id);toast('Enlace copiado')}catch{toast('No fue posible copiar el enlace')}};
    $('#reportBtn').onclick=()=>report(id);
  }catch(e){toast(e.message)}
}
function handleSharedRoute(){const match=/^#contenido-(\d+)$/.exec(location.hash);if(match)showDetail(+match[1])}
async function toggleFavorite(id,button,detail=false){if(!state.user){pendingFavoriteId=id;closeAll();openModal('#loginModal');return}try{const p=state.publications.find(x=>x.id===id);const isFav=!!p?.favorite;const result=await api('/api/publications/'+id+'/favorite',{method:isFav?'DELETE':'POST'});if(p)p.favorite=result.favorite;if(detail)button.textContent=result.favorite?'♥ Guardado':'♡ Guardar';renderPublications();renderSaved();toast(result.favorite?'Guardado en favoritos':'Retirado de favoritos')}catch(e){toast(e.message)}}
async function report(id){if(!state.user){closeAll();openModal('#loginModal');return}const reason=prompt('¿Por qué deseas reportar este contenido?');if(!reason)return;try{await api('/api/publications/'+id+'/report',{method:'POST',body:JSON.stringify({reason})});toast('Gracias. Revisaremos el reporte.')}catch(e){toast(e.message)}}
/* ===== Galería de imágenes del editor ===== */
let galleryFieldIndex=0;
function addGalleryField(url='',alt='',caption='',imageId=''){
  const container=$('#galleryImageFields');
  if(!container)return;
  const idx=galleryFieldIndex++;
  const field=document.createElement('div');
  field.className='gallery-field';
  field.dataset.imageId=imageId;
  field.innerHTML=`<div class="gallery-field-header"><span class="gallery-field-number">${container.children.length+1}</span><button type="button" class="gallery-remove" title="Quitar imagen">×</button></div><label>URL de la imagen<input type="url" class="gallery-url" value="${escapeHTML(url)}" placeholder="https://ejemplo.com/imagen.jpg"></label><label>Texto alternativo<input class="gallery-alt" value="${escapeHTML(alt)}" maxlength="250" placeholder="Describe la imagen"></label><label>Pie de foto<input class="gallery-caption" value="${escapeHTML(caption)}" maxlength="300" placeholder="Crédito o descripción"></label>`;
  container.appendChild(field);
  field.querySelector('.gallery-remove').onclick=()=>{field.remove();renumberGalleryFields();};
  renumberGalleryFields();
  return field;
}
function renumberGalleryFields(){
  const fields=$$('#galleryImageFields .gallery-field');
  fields.forEach((f,i)=>{const num=f.querySelector('.gallery-field-number');if(num)num.textContent=i+1;});
}
function clearGalleryFields(){
  const container=$('#galleryImageFields');
  if(container)container.innerHTML='';
  galleryFieldIndex=0;
}
function getGalleryFieldData(){
  return $$('#galleryImageFields .gallery-field').map(field=>({
    imageId:field.dataset.imageId||null,
    url:(field.querySelector('.gallery-url')?.value||'').trim(),
    alt_text:(field.querySelector('.gallery-alt')?.value||'').trim(),
    caption:(field.querySelector('.gallery-caption')?.value||'').trim()
  })).filter(item=>item.url);
}
async function loadGalleryImages(publicationId){
  clearGalleryFields();
  if(!publicationId)return;
  try{
    const images=await api('/api/publications/'+publicationId+'/images');
    if(Array.isArray(images)){
      images.sort((a,b)=>(a.position||0)-(b.position||0));
      images.forEach(img=>addGalleryField(img.url,img.alt_text||'',img.caption||'',String(img.id)));
    }
  }catch(e){
    /* gallery may be empty or endpoint unavailable; ignore silently */
  }
}
async function syncGalleryImages(publicationId,existingImages){
  if(!publicationId)return;
  const fields=getGalleryFieldData();
  const existingIds=new Set(existingImages.map(i=>String(i.id)));
  const keptIds=new Set();
  for(let i=0;i<fields.length;i++){
    const f=fields[i];
    if(f.imageId){
      keptIds.add(f.imageId);
    }else{
      try{
        await api('/api/publications/'+publicationId+'/images',{method:'POST',body:JSON.stringify({url:f.url,alt_text:f.alt_text,caption:f.caption,position:i})});
      }catch(e){/* skip failed image upload */}
    }
  }
  /* Images removed by user that existed on server — we cannot delete via API, so skip */
  /* Update the cover image (position 0) from first gallery image */
  if(fields.length>0){
    $('#editImage').value=fields[0].url;
  }else{
    $('#editImage').value='';
  }
}
function renderCategoryOptions(kind=$('#editKind').value,selectedId=null){const options=state.categories.filter(c=>c.type===kind);$('#editCategory').innerHTML=options.map(c=>`<option value="${c.id}" ${c.id==selectedId?'selected':''}>${escapeHTML(c.name)}</option>`).join('')}
async function load(){showSkeletons();try{const [categories,publications,me]=await Promise.all([api('/api/categories'),api('/api/publications'),api('/api/me')]);state.categories=categories;state.publications=publications;state.user=me.user;if(state.token&&!state.user){localStorage.removeItem('tejido_token');state.token=null}renderCategoryOptions();renderPublications();renderMap();renderSession();renderSaved();handleSharedRoute()}catch(e){toast('No pudimos conectar con TEJIDO')}}
function renderSession(){const logged=!!state.user;$('#loginBtn').classList.toggle('hidden',logged);$('#userBtn').classList.toggle('hidden',!logged);$('#mobileLoginBtn').textContent=logged?'Abrir mi perfil':'Ingresar a mi cuenta';if(!logged){$('#userBtn').textContent='';return}const configs={ADMIN:{label:'ADMINISTRADOR',className:'admin',items:['Moderar publicaciones pendientes','Aprobar o rechazar contenido','Consultar estadísticas y eliminar registros']},GESTOR:{label:'GESTOR DE CONTENIDO',className:'gestor',items:['Crear y editar publicaciones propias','Enviar borradores a revisión','Consultar el estado de cada entrega']},CIUDADANO:{label:'CIUDADANO',className:'ciudadano',items:['Guardar contenidos favoritos','Consultar contenido publicado','Reportar información incorrecta']}};const cfg=configs[state.user.role];$('#userBtn').textContent=state.user.name.split(' ').map(x=>x[0]).slice(0,2).join('');$('#userSummary').innerHTML=`<span class="role-badge">${cfg.label}</span><h2>Hola, ${escapeHTML(state.user.name.split(' ')[0])}.</h2><p>${escapeHTML(state.user.email)}</p>`;$('#roleCapabilities').className='role-capabilities '+cfg.className;$('#roleCapabilities').innerHTML=`<b>Permisos de este perfil</b><ul>${cfg.items.map(x=>'<li>'+x+'</li>').join('')}</ul>`;$('#createBtn').classList.toggle('hidden',state.user.role==='CIUDADANO')}
async function login(e){e.preventDefault();try{const data=await api('/api/auth/login',{method:'POST',body:JSON.stringify({email:$('#loginEmail').value,password:$('#loginPassword').value})});state.token=data.token;state.user=data.user;localStorage.setItem('tejido_token',data.token);closeAll();toast('Bienvenido a TEJIDO');await load();if(pendingFavoriteId){const id=pendingFavoriteId;pendingFavoriteId=null;await toggleFavorite(id,document.createElement('button'))}}catch(e){toast(e.message)}}
async function logout(){try{await api('/api/auth/logout',{method:'POST'})}catch{}localStorage.removeItem('tejido_token');state.token=null;state.user=null;closeAll();await load();toast('Sesión cerrada')}
async function openDrawer(){
  if(!state.user){openModal('#loginModal');return}
  openModal('#userDrawer');$('#adminStats').classList.add('hidden');
  const role=state.user.role;
  if(role==='CIUDADANO'){
    const saved=state.publications.filter(p=>p.favorite);
    $('#panelTitle').textContent='Mis contenidos guardados';
    $('#panelHelp').textContent='Aquí puedes consultar tu selección personal y reportar información incorrecta.';
    $('#myContent').innerHTML=saved.length?saved.map(p=>`<div class="my-item citizen-favorite"><div><b>${escapeHTML(p.title)}</b><small>${escapeHTML(p.location||'Caucasia')}</small></div><div class="my-actions"><button data-citizen-open="${p.id}">Abrir</button><button data-citizen-remove="${p.id}">Quitar</button></div></div>`).join(''):'<div class="empty-panel">No tienes contenidos guardados todavía.</div>';
    $$('[data-citizen-open]').forEach(b=>b.onclick=()=>showDetail(+b.dataset.citizenOpen));
    $$('[data-citizen-remove]').forEach(b=>b.onclick=async()=>{await toggleFavorite(+b.dataset.citizenRemove,b);openDrawer()});
    return;
  }
  try{
    const admin=role==='ADMIN';
    let items;
    if(admin){
      const [review,own]=await Promise.all([api('/api/publications?status=REVIEW'),api('/api/publications?mine=1')]);
      items=[...review,...own.filter(p=>['DRAFT','REJECTED'].includes(p.status)&&!review.some(r=>r.id===p.id))];
    }else items=await api('/api/publications?mine=1');
    $('#panelTitle').textContent=admin?'Moderación y mis borradores':'Mis publicaciones';
    $('#panelHelp').textContent=admin?'Aprueba o rechaza lo enviado por gestores y continúa tus propios borradores.':'Crea borradores, edítalos y envíalos al administrador para revisión.';
    $('#myContent').innerHTML=items.length?items.map(p=>{
      const own=p.author_id===state.user.id;
      const editable=['DRAFT','REJECTED'].includes(p.status)&&(!admin||own);
      const reviewable=admin&&p.status==='REVIEW';
      return `<div class="my-item"><div class="my-item-top"><b>${escapeHTML(p.title)}</b><span class="status">${statusLabels[p.status]}</span></div>${p.moderation_note?'<small>'+escapeHTML(p.moderation_note)+'</small>':''}<div class="my-actions">${editable?'<button data-edit="'+p.id+'">Editar</button><button data-submit="'+p.id+'">Enviar a revisión</button>':''}${reviewable?'<button class="approve" data-approve="'+p.id+'">Aprobar</button><button class="reject" data-reject="'+p.id+'">Rechazar</button>':''}<button data-delete="${p.id}">Eliminar</button></div></div>`;
    }).join(''):`<div class="empty-panel">${admin?'No hay contenidos pendientes ni borradores propios.':'Aún no has creado contenido.'}</div>`;
    bindMy(items);
    if(admin){const s=await api('/api/admin/stats');$('#adminStats').classList.remove('hidden');$('#adminStats').innerHTML=Object.entries({Publicados:s.published,'Por revisar':s.pending,Usuarios:s.users,Reportes:s.reports}).map(([k,v])=>`<div class="stat"><b>${v}</b><span>${k}</span></div>`).join('')}
  }catch(e){toast(e.message)}
}
function bindMy(items){$$('[data-edit]').forEach(b=>b.onclick=()=>editItem(items.find(x=>x.id==b.dataset.edit)));$$('[data-submit]').forEach(b=>b.onclick=()=>submitItem(+b.dataset.submit));$$('[data-approve]').forEach(b=>b.onclick=()=>moderate(+b.dataset.approve,'PUBLISHED'));$$('[data-reject]').forEach(b=>b.onclick=()=>{const note=prompt('Motivo del rechazo:');if(note)moderate(+b.dataset.reject,'REJECTED',note)});$$('[data-delete]').forEach(b=>b.onclick=()=>deleteItem(+b.dataset.delete))}
async function editItem(p){
  closeAll();
  $('#editorTitle').textContent='Editar contenido';
  $('#editId').value=p.id;
  $('#editKind').value=p.kind;
  renderCategoryOptions(p.kind,p.category_id);
  $('#editTitle').value=p.title;
  $('#editSummary').value=p.summary;
  $('#editContent').value=p.content;
  $('#editLocation').value=p.location||'';
  $('#editDate').value=dateTimeInput(p.start_date);
  $('#editEndDate').value=dateTimeInput(p.end_date);
  $('#editLink').value=p.link||'';
  $('#editImage').value=p.image?.startsWith('http')?p.image:'';
  openModal('#editorModal');
  await loadGalleryImages(p.id);
}
function newItem(){closeAll();$('#editorTitle').textContent='Crear contenido';$('#editorForm').reset();$('#editId').value='';$('#editImage').value='';$('#editKind').value='HISTORIA';renderCategoryOptions('HISTORIA');$('#editLocation').value='Caucasia';clearGalleryFields();openModal('#editorModal')}
async function saveItem(e){
  e.preventDefault();
  const id=$('#editId').value;
  const galleryData=getGalleryFieldData();
  /* Use first gallery image as cover if available */
  const coverImage=galleryData.length>0?galleryData[0].url:($('#editImage').value||null);
  const payload={kind:$('#editKind').value,category_id:+$('#editCategory').value,title:$('#editTitle').value,summary:$('#editSummary').value,content:$('#editContent').value,location:$('#editLocation').value,start_date:$('#editDate').value||null,end_date:$('#editEndDate').value||null,link:$('#editLink').value||null,image:coverImage};
  try{
    const result=await api('/api/publications'+(id?'/'+id:''),{method:id?'PUT':'POST',body:JSON.stringify(payload)});
    const pubId=id||result.id;
    /* Sync gallery images with API */
    if(pubId&&galleryData.length>0){
      let existingImages=[];
      if(id){
        try{existingImages=await api('/api/publications/'+pubId+'/images');}catch(e){existingImages=[];}
      }
      /* Add only new images (those without an imageId) */
      const existingIds=new Set((existingImages||[]).map(i=>String(i.id)));
      for(let i=0;i<galleryData.length;i++){
        const f=galleryData[i];
        if(!f.imageId||!existingIds.has(f.imageId)){
          try{
            await api('/api/publications/'+pubId+'/images',{method:'POST',body:JSON.stringify({url:f.url,alt_text:f.alt_text,caption:f.caption,position:i})});
          }catch(imgErr){/* skip failed image */}
        }
      }
    }
    closeAll();
    toast(id?'Contenido actualizado':'Borrador creado');
    await load();
    openDrawer();
  }catch(e){toast(e.message)}
}
async function submitItem(id){try{await api('/api/publications/'+id+'/submit',{method:'POST'});toast('Enviado a revisión');await load();openDrawer()}catch(e){toast(e.message)}}
async function moderate(id,status,note=''){try{await api('/api/publications/'+id+'/status',{method:'PATCH',body:JSON.stringify({status,note})});toast(status==='PUBLISHED'?'Contenido aprobado y publicado':'Contenido rechazado con observación');await load();openDrawer()}catch(e){toast(e.message)}}
async function deleteItem(id){if(!confirm('¿Eliminar este contenido?'))return;try{await api('/api/publications/'+id,{method:'DELETE'});toast('Contenido eliminado');await load();openDrawer()}catch(e){toast(e.message)}}
function bindPageEvents(){
  $$('[data-map-kind]').forEach(button=>button.onclick=()=>{mapKind=button.dataset.mapKind;$$('[data-map-kind]').forEach(item=>item.classList.toggle('active',item===button));renderMap()});
  $$('[data-close]').forEach(button=>button.onclick=closeAll);
  $$('#mobileMenu a').forEach(link=>link.onclick=closeAll);
  $('#overlay').onclick=closeAll;
  $('#menuBtn').onclick=()=>openModal('#mobileMenu');
  $('#mobileLoginBtn').onclick=()=>{closeAll();state.user?openDrawer():openModal('#loginModal')};
  $('#loginBtn').onclick=()=>openModal('#loginModal');
  $('#userBtn').onclick=openDrawer;
  $('#loginForm').onsubmit=login;
  $('#logoutBtn').onclick=logout;
  $('#createBtn').onclick=newItem;
  $('#editorForm').onsubmit=saveItem;
  $('#addGalleryImage').onclick=()=>addGalleryField();
  $('#editKind').onchange=()=>renderCategoryOptions($('#editKind').value);
  $('#searchToggle').onclick=()=>{$('#searchInput').focus();location.hash='explorar'};
  $('#searchInput').oninput=event=>{state.search=event.target.value;renderPublications()};
  $$('.chip').forEach(button=>button.onclick=()=>{$$('.chip').forEach(item=>item.classList.remove('active'));button.classList.add('active');state.kind=button.dataset.kind;renderPublications()});
  $$('[data-filter]').forEach(link=>link.onclick=()=>{state.kind=link.dataset.filter;$$('.chip').forEach(item=>item.classList.toggle('active',item.dataset.kind===state.kind));setTimeout(renderPublications,0)});
  $('#randomBtn').onclick=()=>{const items=state.publications;if(items.length)showDetail(items[Math.floor(Math.random()*items.length)].id)};
  $$('[data-demo]').forEach(button=>button.onclick=()=>{const accounts={admin:['admin@tejido.co','Admin123!'],gestor:['gestor@tejido.co','Gestor123!'],ciudadano:['ciudadano@tejido.co','Ciudadano123!']};[$('#loginEmail').value,$('#loginPassword').value]=accounts[button.dataset.demo]});
  $('#newsletterForm').onsubmit=event=>{event.preventDefault();toast('El boletín estará disponible en una próxima versión.')};
  /* Apoya TEJIDO */
  let selectedAmount=5;
  const supportBase='https://wa.me/573007378306?text=';
  function updateSupportLink(){
    const msg=`Hola, quiero apoyar TEJIDO con $${selectedAmount}`;
    const btn=$('#supportBtn');
    if(btn)btn.href=supportBase+encodeURIComponent(msg);
  }
  $$('.amount-btn').forEach(btn=>btn.onclick=()=>{
    $$('.amount-btn').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedAmount=+btn.dataset.amount;
    updateSupportLink();
    try{api('/api/support',{method:'POST',body:JSON.stringify({name:'Anónimo',amount:selectedAmount,method:'whatsapp'})})}catch{}
  });
  updateSupportLink();
  /* Enlácete con nosotros */
  $$('.collab-btn').forEach(btn=>{
    const origHref=btn.href;
    btn.onclick=()=>{
      try{api('/api/collaborate',{method:'POST',body:JSON.stringify({name:'Desde WhatsApp',email:'whatsapp@tejido.co',role:'colaborador',message:'Postulación desde el sitio web'})})}catch{}
    }
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeAll()});
  window.addEventListener('hashchange',handleSharedRoute);
}
bindPageEvents();
load();



const assistantAnswers={
  'que-es':'Soy Hilo, el asistente de TEJIDO. TEJIDO es una plataforma de descubrimiento territorial: ayuda a encontrar historias, eventos, talentos y oportunidades que están moviendo a Caucasia.',
  roles:'En TEJIDO hay tres perfiles: ciudadano, gestor y administrador. El ciudadano explora, guarda y reporta. El gestor crea publicaciones. El administrador revisa, aprueba y modera contenidos.',
  publicar:'Para publicar debes ingresar como gestor o administrador. Luego abre tu perfil y presiona Crear contenido. Puedes agregar título, resumen, lugar, fecha, enlace e imagen.',
  mapa:'El mapa vivo sirve para ubicar eventos, historias, oportunidades y talentos del territorio. Selecciona un punto o una tarjeta para ver su información y abrir la ubicación exacta.',
  guardadas:'Las guardadas son oportunidades que marcas con el corazón. Debes iniciar sesión para conservar tu selección personal.',
  oportunidades:'Las oportunidades reúnen convocatorias, proyectos y opciones de participación para la comunidad.',
  eventos:'La agenda muestra actividades del territorio: encuentros, mercados, festivales y espacios para participar.',
  talento:'La sección Talento visibiliza personas, artistas, líderes, organizaciones e iniciativas que normalmente pasarían desapercibidas.',
  default:'Cuéntame qué quieres hacer: encontrar un evento, ubicar un lugar, descubrir talento, revisar una oportunidad, publicar contenido o dejar una sugerencia.'
};
const assistantPoses={
  saluda:'/images/hilo/hilo-saluda.png',
  senala:'/images/hilo/hilo-senala.png',
  lee:'/images/hilo/hilo-lee.png',
  piensa:'/images/hilo/hilo-piensa.png',
  explica:'/images/hilo/hilo-explica.png',
  celebra:'/images/hilo/hilo-celebra.png',
  sorprendido:'/images/hilo/hilo-sorprendido.png',
  descubre:'/images/hilo/hilo-descubre.png',
  teje:'/images/hilo/hilo-teje.png'
};
const assistantCardActions={
  gente:{label:'Conocer gente',pose:'saluda',action:'talento'},
  plan:{label:'Encontrar un plan',pose:'descubre',action:'hoy'},
  feedback:{label:'Sugerencias',pose:'explica',action:'sugerencia'},
  mapa:{label:'Recorrer Caucasia',pose:'senala',action:'mapa'},
  oportunidades:{label:'Convocatorias',pose:'celebra',action:'oportunidades'},
  buscar:{label:'Buscar algo',pose:'descubre',action:'buscar'},
  ajustes:{label:'Ajustes',pose:'piensa',action:'ajustes'},
  guardado:{label:'Mis cosas',pose:'lee',action:'guardadas'},
  red:{label:'Red social',pose:'teje',action:'red'}
};
let assistantBubbleTimer;
let assistantContextTimer;
let assistantMode='chat';
let assistantInitialized=false;

function assistantPose(pose,message='',duration=4200){
  const bubble=$('#assistantBubble');
  $$('[data-assistant-character]').forEach(character=>{
    if(!assistantPoses[pose])return;
    character.src=assistantPoses[pose];
    character.classList.remove('is-changing');
    void character.offsetWidth;
    character.classList.add('is-changing');
  });
  if(!bubble||!message)return;
  bubble.textContent=message;
  bubble.classList.remove('is-hidden');
  clearTimeout(assistantBubbleTimer);
  assistantBubbleTimer=setTimeout(()=>bubble.classList.add('is-hidden'),duration);
}

function assistantOpen(){
  const panel=$('#assistantPanel'),widget=$('#assistantWidget'),bubble=$('#assistantBubble');
  panel.classList.remove('hidden');
  widget.classList.add('assistant-open');
  bubble?.classList.add('is-hidden');
  assistantPose('saluda');
  assistantClearScene();
  assistantShowGrid();
  assistantMode='chat';
  assistantResetInput();
  assistantInitialized=true;
}

function assistantClose(message='Aquí estaré cuando me necesites.'){
  $('#assistantPanel').classList.add('hidden');
  $('#assistantWidget').classList.remove('assistant-open');
  if(assistantMode==='suggestion')assistantHome();
  else assistantResetInput();
  assistantPose('saluda',message,3000);
}

function assistantSpeakContext(){
  const section=(location.hash||'#inicio').slice(1);
  const messages={
    inicio:'¡Hola! Soy Hilo. ¿Qué quieres descubrir hoy en Caucasia?',
    explorar:'Cuéntame qué te interesa y yo buscaré historias relacionadas.',
    mapa:'¿Buscas un lugar? Dime su nombre y te ayudaré a ubicarlo.',
    agenda:'¿Quieres un plan? Puedo mostrarte los próximos eventos.',
    oportunidades:'¿Buscas una convocatoria? Te mostraré las disponibles.',
    guardadas:'Aquí puedes volver a las oportunidades que guardaste.',
    talento:'¿Quieres conocer artistas y creadores del territorio?'
  };
  const msg=messages[section]||messages.inicio;
  if($('#assistantPanel')?.classList.contains('hidden'))assistantPose(section==='mapa'?'senala':'saluda',msg,5600);
}

function assistantAsk(text){
  assistantOpen();
  assistantClearScene();
  assistantAddUserMessage(text);
  if(assistantMode==='suggestion')return assistantSendSuggestion(text);
  assistantPose('piensa');
  setTimeout(()=>assistantReply(text),550);
}

function assistantResetInput(){
  const input=$('#assistantInput'),button=$('#assistantForm button');
  if(input)input.placeholder='Cuéntaselo a Hilo...';
  if(button)button.innerHTML='<span aria-hidden="true">➜</span><span class="sr-only">Enviar</span>';
}

function assistantClearScene(){
  const grid=$('#assistantGrid');
  const content=$('#assistantContent');
  const pill=$('#assistantIntentPill');
  if(grid)grid.innerHTML='';
  if(content){
    const msgs=content.querySelectorAll('.assistant-body,.assistant-result-grid,.assistant-back');
    msgs.forEach(el=>el.remove());
  }
  if(pill){pill.textContent='';pill.classList.add('hidden');}
}

function assistantAddUserMessage(text){
  const pill=$('#assistantIntentPill');
  if(pill){
    pill.textContent=`Tú le dijiste a Hilo: \u201c${text}\u201d`;
    pill.classList.remove('hidden');
  }
}

function assistantShowGrid(){
  const grid=$('#assistantGrid');
  if(!grid)return;
  grid.innerHTML='';
  const cards=[
    {key:'gente',icon:'\u{1F465}',label:'Conocer gente',sub:'Talentos locales'},
    {key:'plan',icon:'\u{1F4C5}',label:'Encontrar un plan',sub:'Eventos para hoy'},
    {key:'feedback',icon:'\u{1F4D6}',label:'Sugerencias',sub:'Dar feedback'},
    {key:'mapa',icon:'\u{1F4CD}',label:'Recorrer Caucasia',sub:'Explorar el mapa'},
    {key:'oportunidades',icon:'\u{1F4E2}',label:'Convocatorias',sub:'Ver oportunidades'},
    {key:'buscar',icon:'\u{1F50D}',label:'Buscar algo',sub:'Descubrir'},
    {key:'ajustes',icon:'\u2699\uFE0F',label:'Ajustes',sub:'Configurar'},
    {key:'guardado',icon:'\u{1F4E6}',label:'Mis cosas',sub:'Ver guardado'},
    {key:'red',icon:'\u{1F310}',label:'Red social',sub:'Conectar'}
  ];
  cards.forEach(c=>{
    const cfg=assistantCardActions[c.key];
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='hilo-card';
    btn.setAttribute('role','listitem');
    btn.dataset.action=c.key;
    btn.innerHTML=`<span class="hilo-card-icon" aria-hidden="true">${c.icon}</span><span class="hilo-card-label">${c.label}</span><span class="hilo-card-sub">${c.sub}</span>`;
    btn.addEventListener('mouseenter',()=>assistantPose(cfg.pose));
    btn.addEventListener('mouseleave',()=>assistantPose('saluda'));
    btn.addEventListener('focus',()=>assistantPose(cfg.pose));
    btn.addEventListener('blur',()=>assistantPose('saluda'));
    btn.onclick=()=>assistantRunAction(cfg.action,c.label);
    grid.appendChild(btn);
  });
}

function assistantAddBotMessage(text){
  const content=$('#assistantContent');
  if(!content)return;
  let box=content.querySelector('.assistant-body');
  if(!box){box=document.createElement('div');box.className='assistant-body';content.appendChild(box);}
  const p=document.createElement('p');
  p.className='hilo-message bot-message';
  p.textContent=text;
  box.appendChild(p);
  box.scrollTop=box.scrollHeight;
}

function assistantShowBack(){
  const content=$('#assistantContent');
  if(!content||content.querySelector('.assistant-back'))return;
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='assistant-back';
  btn.textContent='\u2190 Elegir otra cosa';
  btn.onclick=assistantHome;
  content.appendChild(btn);
}

function assistantHome(){
  assistantMode='chat';
  assistantResetInput();
  assistantClearScene();
  assistantShowGrid();
  assistantPose('saluda');
}

function assistantResults(items){
  const content=$('#assistantContent');
  if(!content)return;
  if(!items.length){
    assistantAddBotMessage('No encontré resultados en este momento. Probemos otro camino.');
    assistantShowBack();
    return;
  }
  const grid=content.querySelector('.hilo-grid');
  if(grid)grid.innerHTML='';
  const container=document.createElement('div');
  container.className='assistant-result-grid';
  items.slice(0,3).forEach(item=>{
    const btn=document.createElement('button');
    btn.className='assistant-result-card';
    btn.dataset.assistantResult=item.id;
    btn.innerHTML=`<b>${escapeHTML(item.title)}</b><small>${escapeHTML(item.location||labels[item.kind]||'Caucasia')}</small><span>\u203A</span>`;
    btn.onclick=()=>{
      assistantClose('Te abrí esta publicación.');
      showDetail(+item.id);
    };
    container.appendChild(btn);
  });
  content.appendChild(container);
  assistantShowBack();
}

function assistantNavigate(hash,message){
  assistantAddBotMessage(message);
  setTimeout(()=>{location.hash=hash;assistantClose('Te traje hasta aquí. Sigue explorando.');},650);
}

function assistantRunAction(key,label=''){
  assistantOpen();
  assistantClearScene();
  if(label)assistantAddUserMessage(label);
  assistantPose('descubre');
  if(key==='hoy'){
    const events=typeof upcomingEvents==='function'?upcomingEvents():[];
    assistantAddBotMessage(events.length?'Estos son algunos eventos para participar:':'Todavía no hay eventos disponibles.');
    assistantPose('senala');
    assistantResults(events);
  }else if(key==='oportunidades'){
    const items=state.publications.filter(item=>item.kind==='OPORTUNIDAD');
    assistantAddBotMessage(items.length?'Encontré estas oportunidades para ti:':'No hay oportunidades publicadas por ahora.');
    assistantPose('senala');
    assistantResults(items);
  }else if(key==='talento'){
    const items=state.publications.filter(item=>item.kind==='TALENTO');
    assistantAddBotMessage(items.length?'Conoce estos talentos del territorio:':'Todavía no hay perfiles de talento publicados.');
    assistantPose('teje');
    assistantResults(items);
  }else if(key==='mapa'){
    assistantPose('senala');
    assistantNavigate('#mapa','Voy a llevarte al mapa vivo de Caucasia.');
  }else if(key==='sugerencia'){
    assistantMode='suggestion';
    $('#assistantInput').placeholder='Escribe tu sugerencia...';
    $('#assistantForm button').innerHTML='<span aria-hidden="true">➜</span><span class="sr-only">Enviar sugerencia</span>';
    assistantAddBotMessage('Este es el buzón de atención de TEJIDO. Escribe tu sugerencia, felicitación o dificultad. Evita incluir contraseñas o información sensible.');
    assistantPose('explica');
    assistantShowBack();
  }else if(key==='buscar'){
    assistantAddBotMessage('Escribe lo que buscas en el campo de abajo y lo encontraré entre los hilos de Caucasia.');
    assistantPose('descubre');
    $('#assistantInput')?.focus();
    assistantShowBack();
  }else if(key==='ajustes'){
    assistantAddBotMessage('Los ajustes de usuario están disponibles en tu perfil. Abre el menú para configurar tu cuenta.');
    assistantPose('piensa');
    assistantShowBack();
  }else if(key==='guardadas'){
    if(!state.user){
      assistantAddBotMessage('Debes iniciar sesión para ver tus cosas guardadas.');
      assistantPose('explica');
      assistantShowBack();
      return;
    }
    location.hash='guardadas';
    assistantClose('Te traje a tus guardadas.');
  }else if(key==='red'){
    assistantAddBotMessage('La red social de TEJIDO está en construcción. Pronto podrás conectar con la comunidad de Caucasia.');
    assistantPose('teje');
    assistantShowBack();
  }
}

async function assistantSendSuggestion(message){
  try{
    assistantAddBotMessage('Estoy guardando tu mensaje en el buzón de TEJIDO…');
    assistantPose('teje');
    const result=await api('/api/suggestions',{method:'POST',body:JSON.stringify({message})});
    assistantMode='chat';
    assistantResetInput();
    assistantAddBotMessage(`Gracias por ayudar a mejorar TEJIDO. Tu mensaje quedó registrado con el número ${result.ticket}.`);
    assistantPose('celebra');
    assistantShowBack();
  }catch(error){
    assistantAddBotMessage(error.message||'No pude guardar la sugerencia. Inténtalo nuevamente.');
    assistantPose('sorprendido');
    assistantShowBack();
  }
}

async function assistantShowSuggestionInbox(){
  if(state.user?.role!=='ADMIN'){
    assistantAddBotMessage('El buzón recibido solo puede consultarlo un administrador. Cualquier persona sí puede enviar una sugerencia.');
    assistantPose('explica');
    assistantShowBack();
    return;
  }
  try{
    assistantPose('descubre','Consultando el buzón…',1400);
    const items=await api('/api/admin/suggestions');
    if(!items.length){assistantAddBotMessage('El buzón no tiene mensajes todavía.');assistantShowBack();return;}
    assistantAddBotMessage(`Encontré ${items.length} mensajes en el buzón. Estos son los más recientes:`);
    assistantPose('senala');
    const content=$('#assistantContent');
    const grid=content.querySelector('.hilo-grid');
    if(grid)grid.innerHTML='';
    const container=document.createElement('div');
    container.className='assistant-result-grid';
    items.slice(0,5).forEach(item=>{
      const card=document.createElement('div');
      card.className='assistant-result-card';
      card.innerHTML=`<b>TEJ-${String(item.id).padStart(4,'0')} \u00B7 ${escapeHTML(item.user_name||'Visitante')}</b><small>${escapeHTML(item.message)}</small><span>\u2709</span>`;
      container.appendChild(card);
    });
    content.appendChild(container);
    assistantShowBack();
  }catch(error){assistantAddBotMessage(error.message||'No pude consultar el buzón.');assistantPose('sorprendido');assistantShowBack();}
}

function assistantReply(text){
  const q=text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  let answer='';
  if(q.includes('salir')||q.includes('cerrar')||q==='adios'||q==='hasta luego')return assistantClose('Conversación cerrada. Aquí estaré cuando quieras volver.');
  if(q.includes('ver sugerencias')||q.includes('ver buzon')||q.includes('consultar buzon'))return assistantShowSuggestionInbox();
  if(q.includes('sugerencia')||q.includes('buzon')||q.includes('atencion'))return assistantRunAction('sugerencia',text);
  if(q.includes('que hay hoy')||q.includes('evento'))return assistantRunAction('hoy',text);
  if(q.includes('mapa')||q.includes('ubicacion'))return assistantRunAction('mapa',text);
  if(q.includes('oportun')||q.includes('convoc'))return assistantRunAction('oportunidades',text);
  if(q.includes('talento')||q.includes('artista'))return assistantRunAction('talento',text);
  if(q.includes('que es')||q.includes('tejido')){
    answer=assistantAnswers['que-es'];
    assistantPose('explica');
  }else if(q.includes('rol')||q.includes('admin')||q.includes('gestor')||q.includes('ciudadano')){
    answer=assistantAnswers.roles;
    assistantPose('explica');
  }else if(q.includes('public')||q.includes('crear')||q.includes('contenido')||q.includes('imagen')){
    answer=assistantAnswers.publicar;
    assistantPose('teje');
  }else if(q.includes('guard')||q.includes('favor')){
    answer=assistantAnswers.guardadas;
    assistantPose('senala');
  }else{
    const found=state.publications.find(p=>normalizeText([p.title,p.summary,p.location,p.kind].join(' ')).includes(q));
    if(found){
      assistantAddBotMessage('Encontré algo relacionado con tu búsqueda:');
      assistantPose('descubre');
      assistantResults([found]);
      return;
    }
    answer=assistantAnswers.default;
    assistantPose('piensa');
  }
  assistantAddBotMessage(answer);
  if(answer===assistantAnswers.default)assistantShowGrid();
  else assistantShowBack();
}

function initAssistant(){
  const panel=$('#assistantPanel'),toggle=$('#assistantToggle'),close=$('#assistantClose'),form=$('#assistantForm'),input=$('#assistantInput'),bubble=$('#assistantBubble');
  if(!panel||!toggle||!close||!form||!input)return;
  toggle.onclick=()=>panel.classList.contains('hidden')?assistantOpen():assistantClose();
  close.onclick=()=>assistantClose();
  form.onsubmit=async e=>{
    e.preventDefault();
    const text=input.value.trim();
    if(!text)return;
    input.value='';
    assistantAsk(text);
  };
  $('#navHiloBtn').onclick=assistantOpen;
  bubble?.classList.add('is-hidden');
  clearTimeout(assistantContextTimer);
  assistantContextTimer=setTimeout(assistantSpeakContext,850);
  window.addEventListener('hashchange',()=>{
    clearTimeout(assistantContextTimer);
    assistantContextTimer=setTimeout(assistantSpeakContext,320);
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.classList.contains('hidden'))assistantClose()});
}
initAssistant();
