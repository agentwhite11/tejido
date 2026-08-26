const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const state={token:localStorage.getItem('tejido_token'),user:null,publications:[],categories:[],kind:'TODOS',search:''};
const labels={HISTORIA:'Historia',EVENTO:'Evento',OPORTUNIDAD:'Oportunidad',TALENTO:'Talento',INICIATIVA:'Iniciativa'};
const statusLabels={DRAFT:'Borrador',REVIEW:'En revisión',PUBLISHED:'Publicado',REJECTED:'Rechazado'};
let pendingFavoriteId=null;

const kindImages={HISTORIA:'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_h.jpg',EVENTO:'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_t.jpg',OPORTUNIDAD:'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_ce.jpg',TALENTO:'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_h.jpg',INICIATIVA:'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_ce.jpg'};
function publicationVisual(p){const image=p.image||kindImages[p.kind];if(!image)return 'var(--mint)';return image.startsWith('linear-gradient')?image:`linear-gradient(180deg,rgba(18,59,50,.05),rgba(18,59,50,.42)),url("${image}") center/cover`}
async function api(path,options={}){const headers={'Content-Type':'application/json',...(options.headers||{})};if(state.token)headers.Authorization='Bearer '+state.token;const res=await fetch(path,{...options,headers});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.message||'No fue posible completar la acción');return data}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2800)}
function escapeHTML(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
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
  const list=items.map(p=>`<button data-place-id="${p.id}"><span class="place-dot ${p.kind.toLowerCase()}"></span><b>${escapeHTML(p.title)}</b><small>${escapeHTML(p.location||'Caucasia')}</small></button>`).join('');
  map.innerHTML=`<iframe class="osm-frame" src="${mapEmbedUrl()}" title="Mapa real de Caucasia"></iframe><div class="map-place-list">${list}</div>`;
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
function renderCategoryOptions(kind=$('#editKind').value,selectedId=null){const options=state.categories.filter(c=>c.type===kind);$('#editCategory').innerHTML=options.map(c=>`<option value="${c.id}" ${c.id==selectedId?'selected':''}>${escapeHTML(c.name)}</option>`).join('')}
async function load(){try{const [categories,publications,me]=await Promise.all([api('/api/categories'),api('/api/publications'),api('/api/me')]);state.categories=categories;state.publications=publications;state.user=me.user;if(state.token&&!state.user){localStorage.removeItem('tejido_token');state.token=null}renderCategoryOptions();renderPublications();renderMap();renderSession();renderSaved();handleSharedRoute()}catch(e){toast('No pudimos conectar con TEJIDO')}}
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
function editItem(p){closeAll();$('#editorTitle').textContent='Editar contenido';$('#editId').value=p.id;$('#editKind').value=p.kind;renderCategoryOptions(p.kind,p.category_id);$('#editTitle').value=p.title;$('#editSummary').value=p.summary;$('#editContent').value=p.content;$('#editLocation').value=p.location||'';$('#editDate').value=dateTimeInput(p.start_date);$('#editEndDate').value=dateTimeInput(p.end_date);$('#editLink').value=p.link||'';$('#editImage').value=p.image?.startsWith('http')?p.image:'';openModal('#editorModal')}
function newItem(){closeAll();$('#editorTitle').textContent='Crear contenido';$('#editorForm').reset();$('#editId').value='';$('#editKind').value='HISTORIA';renderCategoryOptions('HISTORIA');$('#editLocation').value='Caucasia';openModal('#editorModal')}
async function saveItem(e){e.preventDefault();const id=$('#editId').value;const payload={kind:$('#editKind').value,category_id:+$('#editCategory').value,title:$('#editTitle').value,summary:$('#editSummary').value,content:$('#editContent').value,location:$('#editLocation').value,start_date:$('#editDate').value||null,end_date:$('#editEndDate').value||null,link:$('#editLink').value||null,image:$('#editImage').value||null};try{await api('/api/publications'+(id?'/'+id:''),{method:id?'PUT':'POST',body:JSON.stringify(payload)});closeAll();toast(id?'Contenido actualizado':'Borrador creado');await load();openDrawer()}catch(e){toast(e.message)}}
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
  $('#editKind').onchange=()=>renderCategoryOptions($('#editKind').value);
  $('#searchToggle').onclick=()=>{$('#searchInput').focus();location.hash='explorar'};
  $('#searchInput').oninput=event=>{state.search=event.target.value;renderPublications()};
  $$('.chip').forEach(button=>button.onclick=()=>{$$('.chip').forEach(item=>item.classList.remove('active'));button.classList.add('active');state.kind=button.dataset.kind;renderPublications()});
  $$('[data-filter]').forEach(link=>link.onclick=()=>{state.kind=link.dataset.filter;$$('.chip').forEach(item=>item.classList.toggle('active',item.dataset.kind===state.kind));setTimeout(renderPublications,0)});
  $('#randomBtn').onclick=()=>{const items=state.publications;if(items.length)showDetail(items[Math.floor(Math.random()*items.length)].id)};
  $$('[data-demo]').forEach(button=>button.onclick=()=>{const accounts={admin:['admin@tejido.co','Admin123!'],gestor:['gestor@tejido.co','Gestor123!'],ciudadano:['ciudadano@tejido.co','Ciudadano123!']};[$('#loginEmail').value,$('#loginPassword').value]=accounts[button.dataset.demo]});
  $('#newsletterForm').onsubmit=event=>{event.preventDefault();toast('El boletín estará disponible en una próxima versión.')};
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
  lee:'/images/hilo/hilo-lee.png'
};
const assistantContexts={
  inicio:'¡Hola! Soy Hilo. ¿Qué quieres descubrir hoy en Caucasia?',
  explorar:'Cuéntame qué te interesa y yo buscaré historias relacionadas.',
  mapa:'¿Buscas un lugar? Dime su nombre y te ayudaré a ubicarlo.',
  agenda:'¿Quieres un plan? Puedo mostrarte los próximos eventos.',
  oportunidades:'¿Buscas una convocatoria? Te mostraré las disponibles.',
  guardadas:'Aquí puedes volver a las oportunidades que guardaste.',
  talento:'¿Quieres conocer artistas y creadores del territorio?'
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
  if(!assistantInitialized){
    assistantClearScene();
    assistantAdd('¡Hola! Estoy aquí para recorrer TEJIDO contigo. ¿Por dónde empezamos?');
    assistantShowGuide();
    assistantInitialized=true;
  }
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
  const message=assistantContexts[section]||assistantContexts.inicio;
  if($('#assistantPanel')?.classList.contains('hidden'))assistantPose(section==='mapa'?'senala':'saluda',message,5600);
}
function assistantAsk(text){
  assistantOpen();
  assistantClearScene();
  assistantAdd(text,'user');
  if(assistantMode==='suggestion')return assistantSendSuggestion(text);
  assistantAdd('Déjame buscar entre los hilos de Caucasia…');
  assistantPose('lee');
  setTimeout(()=>assistantReply(text),550);
}
function assistantResetInput(){
  const input=$('#assistantInput'),button=$('#assistantForm button');
  if(input)input.placeholder='Cuéntaselo a Hilo...';
  if(button)button.innerHTML='<span aria-hidden="true">➜</span><span class="sr-only">Enviar</span>';
}
function assistantClearScene(keepIntent=false){
  const box=$('#assistantMessages'),intent=$('#assistantIntent');
  if(box)box.innerHTML='';
  if(intent&&!keepIntent){intent.textContent='';intent.classList.add('hidden')}
}
function assistantAdd(text,type='bot'){
  if(type==='user'){
    const intent=$('#assistantIntent');
    if(!intent)return;
    intent.textContent=`Tú le dijiste a Hilo: “${text}”`;
    intent.classList.remove('hidden');
    return;
  }
  const speech=$('#assistantSpeech');
  if(!speech)return;
  speech.textContent=text;
  speech.classList.remove('is-speaking');
  void speech.offsetWidth;
  speech.classList.add('is-speaking');
  assistantPose('senala',text.length>105?text.slice(0,102)+'…':text,5000);
}
function assistantShowGuide(){
  const box=$('#assistantMessages');
  if(!box)return;
  box.innerHTML=`
    <section class="assistant-guide" id="assistantGuide" aria-labelledby="assistantGuideTitle">
      <span class="assistant-guide-label">ELIGE TU CAMINO</span>
      <h3 id="assistantGuideTitle">Toca una opción y vamos juntos</h3>
      <div class="assistant-guide-grid">
        <button type="button" class="guide-today" data-assistant-guide="hoy">
          <span aria-hidden="true">◷</span><b>Encontrar un plan</b><small>Eventos para hoy</small>
        </button>
        <button type="button" class="guide-opportunity" data-assistant-guide="oportunidades">
          <span aria-hidden="true">✦</span><b>Abrir una puerta</b><small>Ver convocatorias</small>
        </button>
        <button type="button" class="guide-map" data-assistant-guide="mapa">
          <span aria-hidden="true">⌖</span><b>Recorrer Caucasia</b><small>Explorar el mapa</small>
        </button>
        <button type="button" class="guide-talent" data-assistant-guide="talento">
          <span aria-hidden="true">◎</span><b>Conocer su gente</b><small>Talentos locales</small>
        </button>
        <button type="button" class="guide-suggestion" data-assistant-guide="sugerencia">
          <span aria-hidden="true">✉</span><b>Contarle algo a TEJIDO</b><small>Sugerencias y atención</small>
        </button>
      </div>
    </section>`;
  $$('[data-assistant-guide]',box).forEach(button=>button.onclick=()=>{
    assistantRunAction(button.dataset.assistantGuide,button.querySelector('b').textContent);
  });
}
function assistantShowBack(){
  const box=$('#assistantMessages');
  if(!box||$('.assistant-back',box))return;
  box.insertAdjacentHTML('beforeend','<button type="button" class="assistant-back">← Elegir otra cosa</button>');
  $('.assistant-back',box).onclick=assistantHome;
}
function assistantHome(){
  assistantMode='chat';
  assistantResetInput();
  assistantClearScene();
  assistantAdd('Estoy contigo. Elige otro camino y seguimos descubriendo.');
  assistantShowGuide();
  assistantPose('saluda');
}
function assistantResults(items){
  const box=$('#assistantMessages');
  if(!items.length){assistantAdd('No encontré resultados en este momento. Probemos otro camino.');assistantShowBack();return;}
  const cards=items.slice(0,3).map(item=>`<button class="assistant-result-card" data-assistant-result="${item.id}"><b>${escapeHTML(item.title)}</b><small>${escapeHTML(item.location||labels[item.kind]||'Caucasia')}</small><span>›</span></button>`).join('');
  box.innerHTML=`<div class="assistant-result-grid">${cards}</div>`;
  $$('[data-assistant-result]',box).forEach(button=>button.onclick=()=>{
    assistantClose('Te abrí esta publicación.');
    showDetail(+button.dataset.assistantResult);
  });
  assistantShowBack();
}
function assistantNavigate(hash,message){
  assistantAdd(message);
  setTimeout(()=>{location.hash=hash;assistantClose('Te traje hasta aquí. Sigue explorando.');},650);
}
function assistantRunAction(key,label=''){
  assistantOpen();
  assistantClearScene();
  if(label)assistantAdd(label,'user');
  assistantPose('lee');
  if(key==='hoy'){
    const events=upcomingEvents();
    assistantAdd(events.length?'Estos son algunos eventos para participar:':'Todavía no hay eventos disponibles.');
    assistantResults(events);
  }else if(key==='oportunidades'){
    const items=state.publications.filter(item=>item.kind==='OPORTUNIDAD');
    assistantAdd(items.length?'Encontré estas oportunidades para ti:':'No hay oportunidades publicadas por ahora.');
    assistantResults(items);
  }else if(key==='talento'){
    const items=state.publications.filter(item=>item.kind==='TALENTO');
    assistantAdd(items.length?'Conoce estos talentos del territorio:':'Todavía no hay perfiles de talento publicados.');
    assistantResults(items);
  }else if(key==='mapa'){
    assistantNavigate('#mapa','Voy a llevarte al mapa vivo de Caucasia.');
  }else if(key==='sugerencia'){
    assistantMode='suggestion';
    $('#assistantInput').placeholder='Escribe tu sugerencia...';
    $('#assistantForm button').innerHTML='<span aria-hidden="true">➜</span><span class="sr-only">Enviar sugerencia</span>';
    assistantAdd('Este es el buzón de atención de TEJIDO. Escribe tu sugerencia, felicitación o dificultad. Evita incluir contraseñas o información sensible.');
    assistantShowBack();
  }
}
async function assistantSendSuggestion(message){
  try{
    assistantAdd('Estoy guardando tu mensaje en el buzón de TEJIDO…');
    assistantPose('lee');
    const result=await api('/api/suggestions',{method:'POST',body:JSON.stringify({message})});
    assistantMode='chat';
    assistantResetInput();
    assistantAdd(`Gracias por ayudar a mejorar TEJIDO. Tu mensaje quedó registrado con el número ${result.ticket}.`);
    assistantShowBack();
  }catch(error){
    assistantAdd(error.message||'No pude guardar la sugerencia. Inténtalo nuevamente.');
    assistantShowBack();
  }
}
async function assistantShowSuggestionInbox(){
  if(state.user?.role!=='ADMIN'){
    assistantAdd('El buzón recibido solo puede consultarlo un administrador. Cualquier persona sí puede enviar una sugerencia.');
    assistantShowBack();
    return;
  }
  try{
    assistantPose('lee','Consultando el buzón…',1400);
    const items=await api('/api/admin/suggestions');
    if(!items.length){assistantAdd('El buzón no tiene mensajes todavía.');assistantShowBack();return;}
    assistantAdd(`Encontré ${items.length} mensajes en el buzón. Estos son los más recientes:`);
    const box=$('#assistantMessages');
    box.innerHTML=`<div class="assistant-result-grid">${items.slice(0,5).map(item=>`<div class="assistant-result-card"><b>TEJ-${String(item.id).padStart(4,'0')} · ${escapeHTML(item.user_name||'Visitante')}</b><small>${escapeHTML(item.message)}</small><span>✉</span></div>`).join('')}</div>`;
    assistantShowBack();
  }catch(error){assistantAdd(error.message||'No pude consultar el buzón.');assistantShowBack();}
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
  if(q.includes('que es')||q.includes('tejido'))answer=assistantAnswers['que-es'];
  else if(q.includes('rol')||q.includes('admin')||q.includes('gestor')||q.includes('ciudadano'))answer=assistantAnswers.roles;
  else if(q.includes('public')||q.includes('crear')||q.includes('contenido')||q.includes('imagen'))answer=assistantAnswers.publicar;
  else if(q.includes('guard')||q.includes('favor'))answer=assistantAnswers.guardadas;
  else{
    const found=state.publications.find(p=>normalizeText([p.title,p.summary,p.location,p.kind].join(' ')).includes(q));
    if(found){
      assistantAdd(`Encontré algo relacionado con tu búsqueda:`);
      assistantResults([found]);
      return;
    }
    answer=assistantAnswers.default;
  }
  assistantAdd(answer);
  if(answer===assistantAnswers.default)assistantShowGuide();
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
