#!/usr/bin/env python3
import json, os, re, secrets, sqlite3, hashlib, hmac, mimetypes
from datetime import datetime, timedelta, timezone
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs, unquote

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / "public"
DATA = ROOT / "data"
DB_PATH = DATA / "tejido.db"
HOST = "127.0.0.1"
PORT = int(os.environ.get("TEJIDO_PORT", "8765"))
MAX_BODY_BYTES = 1_000_000
ALLOWED_KINDS = {"HISTORIA", "EVENTO", "OPORTUNIDAD", "TALENTO", "INICIATIVA"}
LEGACY_GALLERY_MARKER = re.compile(r"\n*<!--TEJIDO_GALLERY:([\s\S]*?)-->\s*$")
DATA.mkdir(exist_ok=True)

def now(): return datetime.now(timezone.utc).isoformat()
def db():
    conn=sqlite3.connect(DB_PATH); conn.row_factory=sqlite3.Row; conn.execute("PRAGMA foreign_keys=ON"); return conn

def hash_password(password, salt=None):
    salt=salt or secrets.token_hex(16)
    digest=hashlib.pbkdf2_hmac("sha256",password.encode(),salt.encode(),120000).hex()
    return salt+"$"+digest

def verify_password(password, stored):
    try:
        salt,digest=stored.split("$",1)
        return hmac.compare_digest(hash_password(password,salt).split("$",1)[1],digest)
    except Exception: return False

def clean_optional_url(value, field, allow_gradient=False, allow_local=False):
    value=str(value or "").strip()
    if not value: return None
    if allow_gradient and value.startswith("linear-gradient("): return value
    if allow_local and value.startswith("/"):
        if not re.fullmatch(r"/(?:[A-Za-z0-9_.-]+/)*[A-Za-z0-9_.-]+",value) or ".." in value.split("/"):
            raise ValueError(f"{field} debe usar una ruta local segura")
        if len(value)>1000: raise ValueError(f"{field} es demasiado largo")
        return value
    parsed=urlparse(value)
    if parsed.scheme not in ("http","https") or not parsed.netloc:
        raise ValueError(f"{field} debe ser una dirección http o https válida")
    if len(value)>1000: raise ValueError(f"{field} es demasiado largo")
    return value

def clean_optional_date(value, field):
    value=str(value or "").strip()
    if not value: return None
    try: datetime.fromisoformat(value.replace("Z","+00:00"))
    except ValueError: raise ValueError(f"{field} no tiene una fecha válida")
    return value

def clean_gallery(data, fallback_alt):
    if "gallery" not in data: return None
    gallery=data.get("gallery")
    if not isinstance(gallery,list): raise ValueError("La galería debe ser una lista de imágenes")
    if len(gallery)>12: raise ValueError("La galería no puede superar 12 imágenes")
    cleaned=[]; positions=set()
    for index,image in enumerate(gallery):
        if not isinstance(image,dict): raise ValueError("Cada imagen de la galería debe incluir sus datos")
        source=image.get("url") or image.get("path")
        source=clean_optional_url(source,"La imagen de la galería",allow_local=True)
        if not source: raise ValueError("Cada imagen de la galería necesita una URL o ruta")
        alt_text=str(image.get("alt_text") or fallback_alt).strip()
        caption=str(image.get("caption") or "").strip() or None
        try: position=int(image.get("position",index))
        except (TypeError,ValueError): raise ValueError("La posición de cada imagen debe ser un número entero")
        if not 0<=position<=9999: raise ValueError("La posición de cada imagen debe estar entre 0 y 9999")
        if position in positions: raise ValueError("Las imágenes de la galería no pueden repetir posición")
        if len(alt_text)>250: raise ValueError("El texto alternativo no puede superar 250 caracteres")
        if caption and len(caption)>500: raise ValueError("El pie de foto no puede superar 500 caracteres")
        positions.add(position)
        cleaned.append({"url":source,"alt_text":alt_text,"caption":caption,"position":position})
    return sorted(cleaned,key=lambda image:image["position"])

def content_and_legacy_gallery(content, fallback_alt):
    content=str(content or "")
    match=LEGACY_GALLERY_MARKER.search(content)
    if not match: return content,None
    body=LEGACY_GALLERY_MARKER.sub("",content).strip()
    try: metadata=json.loads(unquote(match.group(1)))
    except (json.JSONDecodeError,TypeError,ValueError): return body,[]
    if not isinstance(metadata,dict): return body,[]
    credit=str(metadata.get("credit") or "").strip()
    normalized=[]
    for index,image in enumerate(metadata.get("images") or []):
        data={"url":image} if isinstance(image,str) else image
        if not isinstance(data,dict): continue
        caption=str(data.get("caption") or data.get("footnote") or "").strip()
        if credit and credit not in caption: caption=(caption+" · "+credit).strip(" ·")
        normalized.append({
            "url":data.get("url") or data.get("src") or data.get("path"),
            "alt_text":data.get("alt_text") or data.get("alt") or fallback_alt,
            "caption":caption[:500],"position":index
        })
    try: gallery=clean_gallery({"gallery":normalized[:12]},fallback_alt)
    except ValueError: gallery=[]
    return body,gallery

def publication_input(data):
    if not isinstance(data,dict): raise ValueError("El contenido enviado no es válido")
    kind=str(data.get("kind","HISTORIA")).strip().upper()
    if kind not in ALLOWED_KINDS: raise ValueError("Selecciona un tipo de publicación válido")
    try: category_id=int(data.get("category_id"))
    except (TypeError,ValueError): raise ValueError("Selecciona una categoría válida")
    title=str(data.get("title","")).strip()
    summary=str(data.get("summary","")).strip()
    content=str(data.get("content","")).strip()
    location=str(data.get("location","Caucasia")).strip() or "Caucasia"
    if not 5<=len(title)<=180: raise ValueError("El título debe tener entre 5 y 180 caracteres")
    if not 10<=len(summary)<=500: raise ValueError("El resumen debe tener entre 10 y 500 caracteres")
    if not 20<=len(content)<=20_000: raise ValueError("El contenido debe tener entre 20 y 20000 caracteres")
    if len(location)>180: raise ValueError("El lugar es demasiado largo")
    content,legacy_gallery=content_and_legacy_gallery(content,title)
    gallery=clean_gallery(data,title) if "gallery" in data else legacy_gallery
    return {
        "category_id":category_id,"kind":kind,"title":title,"summary":summary,
        "content":content,"image":clean_optional_url(data.get("image"),"La imagen",True,True),
        "location":location,"start_date":clean_optional_date(data.get("start_date"),"La fecha inicial"),
        "end_date":clean_optional_date(data.get("end_date"),"La fecha final"),
        "link":clean_optional_url(data.get("link"),"El enlace"),"gallery":gallery
    }

def validate_category(conn, category_id, kind):
    category=conn.execute("SELECT type FROM categories WHERE id=? AND active=1",(category_id,)).fetchone()
    if not category: raise ValueError("La categoría seleccionada no existe o está inactiva")
    if category["type"]!=kind: raise ValueError("La categoría no corresponde al tipo de publicación")

def sync_publication_detail(conn, publication_id, item):
    conn.execute("DELETE FROM events WHERE publication_id=?",(publication_id,))
    conn.execute("DELETE FROM opportunities WHERE publication_id=?",(publication_id,))
    if item["kind"]=="EVENTO":
        conn.execute("INSERT INTO events(publication_id,venue,capacity) VALUES(?,?,?)",(publication_id,item["location"],None))
    elif item["kind"]=="OPORTUNIDAD":
        conn.execute("INSERT INTO opportunities(publication_id,organization_name,deadline) VALUES(?,?,?)",(publication_id,None,item["end_date"]))

def attach_galleries(conn, publications):
    if not publications: return publications
    ids=[publication["id"] for publication in publications]
    placeholders=",".join("?" for _ in ids)
    rows=conn.execute(f"SELECT publication_id,url,alt_text,caption,position FROM publication_images WHERE publication_id IN ({placeholders}) ORDER BY publication_id,position,id",ids).fetchall()
    galleries={publication_id:[] for publication_id in ids}
    for row in rows:
        image=rowdict(row); publication_id=image.pop("publication_id")
        image["alt"]=image["alt_text"]
        galleries[publication_id].append(image)
    for publication in publications:
        body,legacy_gallery=content_and_legacy_gallery(publication.get("content"),publication.get("title") or "Imagen de la publicación")
        publication["content"]=body
        publication["gallery"]=galleries[publication["id"]] or legacy_gallery or []
        for image in publication["gallery"]: image.setdefault("alt",image.get("alt_text",publication.get("title") or "Imagen de la publicación"))
    return publications

def sync_publication_gallery(conn, publication_id, gallery):
    if gallery is None: return
    conn.execute("DELETE FROM publication_images WHERE publication_id=?",(publication_id,))
    conn.executemany("INSERT INTO publication_images(publication_id,url,alt_text,caption,position) VALUES(?,?,?,?,?)",[(publication_id,image["url"],image["alt_text"],image["caption"],image["position"]) for image in gallery])

def init_db():
    with db() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS roles(id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL);
        CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, role_id INTEGER NOT NULL REFERENCES roles(id), name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, type TEXT NOT NULL, color TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
        CREATE TABLE IF NOT EXISTS organizations(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id), name TEXT NOT NULL, description TEXT, contact TEXT, active INTEGER NOT NULL DEFAULT 1);
        CREATE TABLE IF NOT EXISTS publications(id INTEGER PRIMARY KEY AUTOINCREMENT, author_id INTEGER NOT NULL REFERENCES users(id), category_id INTEGER NOT NULL REFERENCES categories(id), kind TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL, content TEXT NOT NULL, image TEXT, location TEXT, start_date TEXT, end_date TEXT, link TEXT, featured INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'DRAFT', moderation_note TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0);
        CREATE TABLE IF NOT EXISTS publication_images(id INTEGER PRIMARY KEY AUTOINCREMENT, publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE, url TEXT NOT NULL, alt_text TEXT NOT NULL DEFAULT '', caption TEXT, position INTEGER NOT NULL DEFAULT 0 CHECK(position>=0), UNIQUE(publication_id,position));
        CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT, publication_id INTEGER UNIQUE NOT NULL REFERENCES publications(id) ON DELETE CASCADE, venue TEXT, capacity INTEGER);
        CREATE TABLE IF NOT EXISTS opportunities(id INTEGER PRIMARY KEY AUTOINCREMENT, publication_id INTEGER UNIQUE NOT NULL REFERENCES publications(id) ON DELETE CASCADE, organization_name TEXT, deadline TEXT);
        CREATE TABLE IF NOT EXISTS favorites(user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE, created_at TEXT NOT NULL, PRIMARY KEY(user_id,publication_id));
        CREATE TABLE IF NOT EXISTS reports(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id), publication_id INTEGER NOT NULL REFERENCES publications(id), reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'OPEN', created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS suggestions(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'NEW', created_at TEXT NOT NULL, reviewed_at TEXT);
        CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL);
        CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status,deleted);
        CREATE INDEX IF NOT EXISTS idx_publications_kind ON publications(kind);
        CREATE INDEX IF NOT EXISTS idx_publication_images_publication ON publication_images(publication_id,position);
        CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
        CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
        """)
        c.execute("DELETE FROM sessions WHERE expires_at<=?",(now(),))
        c.executemany("INSERT OR IGNORE INTO roles(id,name) VALUES(?,?)",[(1,"ADMIN"),(2,"GESTOR"),(3,"CIUDADANO")])
        users=[(1,"Valentina Admin","admin@tejido.co","Admin123!"),(2,"Mateo Gestor","gestor@tejido.co","Gestor123!"),(3,"Sofía Ciudadana","ciudadano@tejido.co","Ciudadano123!")]
        for role,name,email,pw in users:
            c.execute("INSERT OR IGNORE INTO users(role_id,name,email,password_hash,created_at) VALUES(?,?,?,?,?)",(role,name,email,hash_password(pw),now()))
        cats=[("Historias","HISTORIA","#805AD5"),("Eventos","EVENTO","#F59E0B"),("Oportunidades","OPORTUNIDAD","#16A085"),("Talento","TALENTO","#EC4899"),("Iniciativas","INICIATIVA","#3B82F6")]
        c.executemany("INSERT OR IGNORE INTO categories(name,type,color) VALUES(?,?,?)",cats)
        c.execute("INSERT OR IGNORE INTO organizations(id,user_id,name,description,contact) VALUES(1,2,'Colectivo Río Vivo','Gestión cultural y ambiental desde Caucasia.','hola@riovivo.co')")
        if c.execute("SELECT COUNT(*) FROM publications").fetchone()[0]==0:
            seed=[
            (2,2,'EVENTO','Festival Río y Sabana 2026','Música, gastronomía y emprendimiento junto al río Cauca.','Tres días para encontrarnos alrededor de los sonidos, sabores e iniciativas que nacen en el Bajo Cauca. Habrá tarima local, mercado creativo y recorridos ambientales.','linear-gradient(135deg,#F6C453,#F08A5D)','Malecón de Caucasia','2026-07-18T15:00','2026-07-20T22:00','https://example.com/festival',1,'PUBLISHED'),
            (2,1,'HISTORIA','Las manos que tejen memoria','Artesanas de El Pando convierten fibras y relatos en piezas únicas.','Un grupo de mujeres reúne saberes heredados y diseño contemporáneo para contar historias del territorio a través del tejido.','linear-gradient(135deg,#845EC2,#D65DB1)','El Pando, Caucasia',None,None,None,1,'PUBLISHED'),
            (2,3,'OPORTUNIDAD','Convocatoria Semillas Creativas','Apoyo para jóvenes con ideas culturales y comunitarias.','La convocatoria entrega mentoría y capital semilla a diez proyectos liderados por jóvenes de 18 a 28 años.','linear-gradient(135deg,#00A896,#89C2D9)','Caucasia',None,'2026-08-15','https://example.com/semillas',1,'PUBLISHED'),
            (2,4,'TALENTO','Samuel Torres: fotografía del territorio','Un lente joven que encuentra belleza en la vida cotidiana.','Samuel recorre barrios y veredas documentando gestos, oficios y paisajes que suelen pasar desapercibidos.','linear-gradient(135deg,#264653,#2A9D8F)','Caucasia',None,None,None,0,'PUBLISHED'),
            (2,5,'INICIATIVA','Biblioteca al parque','Lecturas, juegos y conversación cada sábado.','Una red de voluntarios lleva libros y actividades a parques de distintos barrios para acercar la lectura a niñas, niños y familias.','linear-gradient(135deg,#3B82F6,#8B5CF6)','Parques de Caucasia','2026-07-04T09:00',None,None,0,'PUBLISHED'),
            (2,2,'EVENTO','Mercado Hecho en Caucasia','Emprendimientos locales, música y cocina en un solo lugar.','Encuentra marcas locales, productos agrícolas, diseño y cocina del territorio. Entrada libre.','linear-gradient(135deg,#F59E0B,#EF4444)','Parque de las Banderas','2026-07-11T10:00','2026-07-11T19:00',None,0,'PUBLISHED')]
            for row in seed:
                cur=c.execute("INSERT INTO publications(author_id,category_id,kind,title,summary,content,image,location,start_date,end_date,link,featured,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",row+(now(),now()))
                if row[2]=='EVENTO': c.execute("INSERT INTO events(publication_id,venue,capacity) VALUES(?,?,?)",(cur.lastrowid,row[7],300))
                if row[2]=='OPORTUNIDAD': c.execute("INSERT INTO opportunities(publication_id,organization_name,deadline) VALUES(?,?,?)",(cur.lastrowid,'Alianza Bajo Cauca',row[9]))
        legacy_rows=c.execute("SELECT id,title,content FROM publications WHERE content LIKE '%<!--TEJIDO_GALLERY:%'").fetchall()
        for legacy in legacy_rows:
            body,gallery=content_and_legacy_gallery(legacy["content"],legacy["title"])
            has_gallery=c.execute("SELECT 1 FROM publication_images WHERE publication_id=? LIMIT 1",(legacy["id"],)).fetchone()
            if gallery and not has_gallery: sync_publication_gallery(c,legacy["id"],gallery)
            if body!=legacy["content"]: c.execute("UPDATE publications SET content=?,updated_at=? WHERE id=?",(body,now(),legacy["id"]))
        tropico_title="Arte que une: Colectivo Trópico Utópico"
        cover="/assets/tropico-utopico/portada-memoria-resistencia.jpg"
        tropico_gallery=[
            {"url":cover,"alt_text":"Composición fotográfica de una jornada de muralismo comunitario.","caption":"Arte, cultura y memoria como caminos de reconciliación y esperanza. Fotografía: Colectivo Trópico Utópico.","position":0},
            {"url":"/assets/tropico-utopico/colores-paredes-almas.jpg","alt_text":"Varios niños participan en la pintura de un mural comunitario.","caption":"Los colores unen voces y sueños para transformar el territorio. Fotografía: Colectivo Trópico Utópico.","position":1},
            {"url":"/assets/tropico-utopico/muralismo-comunidad.jpg","alt_text":"Un grupo de niños pinta un mural con la figura de un ave.","caption":"Muralismo comunitario alrededor de la memoria, la paz y la justicia social. Fotografía: Colectivo Trópico Utópico.","position":2},
            {"url":"/assets/tropico-utopico/memoria-sancocho.jpg","alt_text":"Mujeres de la comunidad preparan alimentos alrededor de una mesa.","caption":"La memoria y el cuidado también se comparten alrededor de la comida. Fotografía: Colectivo Trópico Utópico.","position":3}
        ]
        tropico=c.execute("SELECT id,image FROM publications WHERE lower(title)=lower(?) AND deleted=0 LIMIT 1",(tropico_title,)).fetchone()
        if not tropico:
            author=c.execute("SELECT id FROM users WHERE lower(email)='gestor@tejido.co' LIMIT 1").fetchone()
            category=c.execute("SELECT id FROM categories WHERE type='INICIATIVA' AND active=1 ORDER BY id LIMIT 1").fetchone()
            if author and category:
                content=("Colectivo Trópico Utópico es un colectivo amigo que impulsa proyectos relacionados con el muralismo y otras actividades de encuentro con la comunidad por medio del arte. "
                         "Esta publicación reúne un insumo fotográfico brindado por el colectivo y reconoce su trabajo alrededor de la memoria, la participación y la construcción colectiva. "
                         "Fotografías e insumo: Colectivo Trópico Utópico.")
                created=now()
                cur=c.execute("INSERT INTO publications(author_id,category_id,kind,title,summary,content,image,location,start_date,end_date,link,featured,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",(author["id"],category["id"],"INICIATIVA",tropico_title,"Muralismo y creación comunitaria para fortalecer la memoria, la unión y la participación por medio del arte.",content,cover,"Ubicación no especificada",None,None,None,1,"PUBLISHED",created,created))
                tropico_id=cur.lastrowid
                sync_publication_gallery(c,tropico_id,tropico_gallery)
        else:
            tropico_id=tropico["id"]
            if not tropico["image"] or "/assets/tropico-utopico/" in tropico["image"]:
                c.execute("UPDATE publications SET image=?,updated_at=? WHERE id=?",(cover,now(),tropico_id))
            saved_gallery=c.execute("SELECT url FROM publication_images WHERE publication_id=? ORDER BY position,id",(tropico_id,)).fetchall()
            is_managed_gallery=saved_gallery and all(str(row["url"]).startswith("/assets/tropico-utopico/") for row in saved_gallery)
            if not saved_gallery or is_managed_gallery: sync_publication_gallery(c,tropico_id,tropico_gallery)

def fix_text(value):
    if not isinstance(value,str): return value
    for _ in range(2):
        if not any(mark in value for mark in ("Ã","Â","â")): break
        try:
            repaired=value.encode("latin1").decode("utf8")
            if repaired==value: break
            value=repaired
        except (UnicodeEncodeError,UnicodeDecodeError): break
    return value

def rowdict(r):
    return {key:fix_text(value) for key,value in dict(r).items()} if r else None

def auth(handler):
    raw=handler.headers.get("Authorization","")
    token=raw[7:] if raw.startswith("Bearer ") else None
    if not token: return None
    with db() as c:
        r=c.execute("SELECT u.id,u.name,u.email,r.name role FROM sessions s JOIN users u ON u.id=s.user_id JOIN roles r ON r.id=u.role_id WHERE s.token=? AND s.expires_at>? AND u.active=1",(token,now())).fetchone()
        return rowdict(r)

class Handler(SimpleHTTPRequestHandler):
    def log_message(self,format,*args): print("[TEJIDO]",format%args)
    def send_json(self,data,status=200):
        body=json.dumps(data,ensure_ascii=False).encode(); self.send_response(status); self.send_header("Content-Type","application/json; charset=utf-8"); self.send_header("Content-Length",str(len(body))); self.send_header("Cache-Control","no-store"); self.end_headers(); self.wfile.write(body)
    def body(self):
        try: length=int(self.headers.get("Content-Length","0"))
        except ValueError:
            self.error(400,"INVALID_JSON","El tamaño de la solicitud no es válido"); return None
        if length>MAX_BODY_BYTES:
            self.error(413,"TOO_LARGE","La solicitud supera el tamaño permitido"); return None
        try:
            data=json.loads(self.rfile.read(length) or b"{}")
            if not isinstance(data,dict): raise ValueError
            return data
        except (json.JSONDecodeError,UnicodeDecodeError,ValueError):
            self.error(400,"INVALID_JSON","Envía un objeto JSON válido"); return None
    def error(self,status,code,message): self.send_json({"error":code,"message":message},status)
    def serve_static(self):
        path=urlparse(self.path).path
        target=PUBLIC/("index.html" if path=="/" else path.lstrip("/"))
        try: target=target.resolve(); target.relative_to(PUBLIC.resolve())
        except Exception: return self.error(403,"FORBIDDEN","Ruta no permitida")
        if not target.exists() or target.is_dir():
            if Path(path).suffix: return self.error(404,"NOT_FOUND","Archivo no encontrado")
            target=PUBLIC/"index.html"
        data=target.read_bytes(); mime=mimetypes.guess_type(target.name)[0] or "application/octet-stream"; self.send_response(200); self.send_header("Content-Type",mime+("; charset=utf-8" if mime.startswith("text/") or mime=="application/javascript" else "")); self.send_header("Content-Length",str(len(data))); self.end_headers(); self.wfile.write(data)
    def do_GET(self):
        p=urlparse(self.path); path=p.path; q=parse_qs(p.query)
        if not path.startswith("/api/"): return self.serve_static()
        user=auth(self)
        with db() as c:
            if path=="/api/health": return self.send_json({"status":"ok","database":"sqlite","time":now()})
            if path=="/api/me": return self.send_json({"user":user})
            if path=="/api/categories": return self.send_json([rowdict(x) for x in c.execute("SELECT * FROM categories WHERE active=1 ORDER BY name")])
            if path=="/api/publications":
                where=["p.deleted=0"]; args=[]
                wants_mine=q.get('mine')==['1'] and user
                wants_admin_status=q.get('status') and user and user['role']=='ADMIN'
                if wants_mine:
                    where.append("p.author_id=?");args.append(user['id'])
                elif wants_admin_status:
                    where.append("p.status=?");args.append(q['status'][0])
                else:
                    where.append("p.status='PUBLISHED'")
                if q.get('kind') and q['kind'][0]!='TODOS': where.append("p.kind=?");args.append(q['kind'][0])
                if q.get('search'):
                    where.append("(p.title LIKE ? OR p.summary LIKE ? OR p.location LIKE ?)"); term='%'+q['search'][0]+'%';args += [term,term,term]
                sql="SELECT p.*,c.name category,c.color,u.name author, EXISTS(SELECT 1 FROM favorites f WHERE f.publication_id=p.id AND f.user_id=?) favorite FROM publications p JOIN categories c ON c.id=p.category_id JOIN users u ON u.id=p.author_id WHERE "+" AND ".join(where)+" ORDER BY p.featured DESC, COALESCE(p.start_date,p.created_at) DESC"
                rows=c.execute(sql,([user['id'] if user else -1]+args)).fetchall()
                publications=[rowdict(row) for row in rows]
                return self.send_json(attach_galleries(c,publications))
            m=re.fullmatch(r"/api/publications/(\d+)",path)
            if m:
                r=c.execute("SELECT p.*,c.name category,c.color,u.name author, EXISTS(SELECT 1 FROM favorites f WHERE f.publication_id=p.id AND f.user_id=?) favorite FROM publications p JOIN categories c ON c.id=p.category_id JOIN users u ON u.id=p.author_id WHERE p.id=? AND p.deleted=0",(user['id'] if user else -1,int(m.group(1)))).fetchone()
                if not r: return self.error(404,"NOT_FOUND","Contenido no encontrado")
                if r['status']!='PUBLISHED' and (not user or (user['role']!='ADMIN' and r['author_id']!=user['id'])): return self.error(403,"FORBIDDEN","No tienes acceso a este contenido")
                publication=rowdict(r)
                return self.send_json(attach_galleries(c,[publication])[0])
            if path=="/api/admin/stats":
                if not user or user['role']!='ADMIN': return self.error(403,"FORBIDDEN","Acceso administrativo requerido")
                stats={"published":c.execute("SELECT COUNT(*) FROM publications WHERE status='PUBLISHED' AND deleted=0").fetchone()[0],"pending":c.execute("SELECT COUNT(*) FROM publications WHERE status='REVIEW' AND deleted=0").fetchone()[0],"users":c.execute("SELECT COUNT(*) FROM users WHERE active=1").fetchone()[0],"reports":c.execute("SELECT COUNT(*) FROM reports WHERE status='OPEN'").fetchone()[0],"suggestions":c.execute("SELECT COUNT(*) FROM suggestions WHERE status='NEW'").fetchone()[0]}; return self.send_json(stats)
            if path=="/api/admin/suggestions":
                if not user or user['role']!='ADMIN': return self.error(403,"FORBIDDEN","Acceso administrativo requerido")
                rows=c.execute("SELECT s.id,s.message,s.status,s.created_at,u.name user_name,u.email user_email FROM suggestions s LEFT JOIN users u ON u.id=s.user_id ORDER BY s.created_at DESC LIMIT 50").fetchall()
                return self.send_json([rowdict(x) for x in rows])
        self.error(404,"NOT_FOUND","Ruta no encontrada")
    def do_POST(self):
        path=urlparse(self.path).path; data=self.body(); user=auth(self)
        if data is None: return
        with db() as c:
            if path=="/api/auth/login":
                email=str(data.get('email','')).strip().lower(); pw=str(data.get('password',''))
                r=c.execute("SELECT u.*,r.name role FROM users u JOIN roles r ON r.id=u.role_id WHERE lower(u.email)=? AND u.active=1",(email,)).fetchone()
                if not r or not verify_password(pw,r['password_hash']): return self.error(401,"INVALID_CREDENTIALS","Correo o contraseña incorrectos")
                token=secrets.token_urlsafe(32); exp=(datetime.now(timezone.utc)+timedelta(hours=8)).isoformat(); c.execute("INSERT INTO sessions(token,user_id,expires_at) VALUES(?,?,?)",(token,r['id'],exp)); return self.send_json({"token":token,"user":{"id":r['id'],"name":r['name'],"email":r['email'],"role":r['role']}})
            if path=="/api/auth/logout":
                raw=self.headers.get("Authorization",""); c.execute("DELETE FROM sessions WHERE token=?",(raw[7:] if raw.startswith('Bearer ') else '',)); return self.send_json({"ok":True})
            if path=="/api/suggestions":
                message=str(data.get('message','')).strip()
                if len(message)<10: return self.error(400,"VALIDATION","Escribe una sugerencia de al menos 10 caracteres")
                if len(message)>1000: return self.error(400,"VALIDATION","La sugerencia no puede superar 1000 caracteres")
                cur=c.execute("INSERT INTO suggestions(user_id,message,status,created_at) VALUES(?,?,?,?)",(user['id'] if user else None,message,'NEW',now()))
                return self.send_json({"id":cur.lastrowid,"ticket":f"TEJ-{cur.lastrowid:04d}","message":"Sugerencia recibida"},201)
            if path=="/api/publications":
                if not user or user['role'] not in ('GESTOR','ADMIN'): return self.error(403,"FORBIDDEN","Se requiere rol Gestor o Administrador")
                try:
                    item=publication_input(data); validate_category(c,item['category_id'],item['kind'])
                except ValueError as error: return self.error(400,"VALIDATION",str(error))
                image=item['image'] or (item['gallery'][0]['url'] if item['gallery'] else 'linear-gradient(135deg,#2F6B59,#F6C453)')
                status='PUBLISHED' if user['role']=='ADMIN' and data.get('publish') else 'DRAFT'
                fields=(user['id'],item['category_id'],item['kind'],item['title'],item['summary'],item['content'],image,item['location'],item['start_date'],item['end_date'],item['link'],int(bool(data.get('featured',False))) if user['role']=='ADMIN' else 0,status,now(),now())
                try:
                    cur=c.execute("INSERT INTO publications(author_id,category_id,kind,title,summary,content,image,location,start_date,end_date,link,featured,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",fields)
                    sync_publication_detail(c,cur.lastrowid,item)
                    sync_publication_gallery(c,cur.lastrowid,item['gallery'])
                except sqlite3.IntegrityError: return self.error(409,"CONFLICT","No fue posible guardar el contenido con esos datos")
                return self.send_json({"id":cur.lastrowid,"message":"Contenido creado"},201)
            m=re.fullmatch(r"/api/publications/(\d+)/favorite",path)
            if m:
                if not user: return self.error(401,"UNAUTHORIZED","Inicia sesión para guardar")
                pid=int(m.group(1))
                exists=c.execute("SELECT 1 FROM publications WHERE id=? AND status='PUBLISHED' AND deleted=0",(pid,)).fetchone()
                if not exists: return self.error(404,"NOT_FOUND","La publicación no está disponible")
                c.execute("INSERT OR IGNORE INTO favorites(user_id,publication_id,created_at) VALUES(?,?,?)",(user['id'],pid,now())); return self.send_json({"favorite":True})
            m=re.fullmatch(r"/api/publications/(\d+)/submit",path)
            if m:
                if not user or user['role'] not in ('GESTOR','ADMIN'): return self.error(403,"FORBIDDEN","Acceso denegado")
                pid=int(m.group(1)); publication=c.execute("SELECT author_id,status FROM publications WHERE id=? AND deleted=0",(pid,)).fetchone()
                if not publication: return self.error(404,"NOT_FOUND","Contenido no encontrado")
                if publication['author_id']!=user['id'] and user['role']!='ADMIN': return self.error(403,"FORBIDDEN","No puedes enviar contenido de otro autor")
                if publication['status'] not in ('DRAFT','REJECTED'): return self.error(409,"INVALID_STATE","Solo un borrador o contenido rechazado puede enviarse a revisión")
                c.execute("UPDATE publications SET status='REVIEW',moderation_note=NULL,updated_at=? WHERE id=?",(now(),pid)); return self.send_json({"message":"Enviado a revisión"})
            m=re.fullmatch(r"/api/publications/(\d+)/report",path)
            if m:
                if not user: return self.error(401,"UNAUTHORIZED","Inicia sesión para reportar")
                reason=str(data.get('reason','')).strip();
                if len(reason)<5: return self.error(400,"VALIDATION","Escribe el motivo del reporte")
                pid=int(m.group(1)); exists=c.execute("SELECT 1 FROM publications WHERE id=? AND status='PUBLISHED' AND deleted=0",(pid,)).fetchone()
                if not exists: return self.error(404,"NOT_FOUND","La publicación no está disponible")
                c.execute("INSERT INTO reports(user_id,publication_id,reason,created_at) VALUES(?,?,?,?)",(user['id'],pid,reason,now())); return self.send_json({"message":"Reporte recibido"},201)
        self.error(404,"NOT_FOUND","Ruta no encontrada")
    def do_PUT(self):
        path=urlparse(self.path).path; data=self.body(); user=auth(self); m=re.fullmatch(r"/api/publications/(\d+)",path)
        if data is None: return
        if not m: return self.error(404,"NOT_FOUND","Ruta no encontrada")
        if not user or user['role'] not in ('GESTOR','ADMIN'): return self.error(403,"FORBIDDEN","Acceso denegado")
        pid=int(m.group(1))
        with db() as c:
            current=c.execute("SELECT author_id,status FROM publications WHERE id=? AND deleted=0",(pid,)).fetchone()
            if not current: return self.error(404,"NOT_FOUND","Contenido no encontrado")
            if current['author_id']!=user['id'] and user['role']!='ADMIN': return self.error(403,"FORBIDDEN","No puedes editar este contenido")
            if user['role']=='GESTOR' and current['status'] not in ('DRAFT','REJECTED'): return self.error(409,"INVALID_STATE","Solo puedes editar borradores o contenidos rechazados")
            try:
                item=publication_input(data); validate_category(c,item['category_id'],item['kind'])
            except ValueError as error: return self.error(400,"VALIDATION",str(error))
            image=item['image'] or (item['gallery'][0]['url'] if item['gallery'] else None)
            c.execute("UPDATE publications SET category_id=?,kind=?,title=?,summary=?,content=?,image=?,location=?,start_date=?,end_date=?,link=?,status='DRAFT',moderation_note=NULL,updated_at=? WHERE id=?",(item['category_id'],item['kind'],item['title'],item['summary'],item['content'],image,item['location'],item['start_date'],item['end_date'],item['link'],now(),pid))
            sync_publication_detail(c,pid,item)
            sync_publication_gallery(c,pid,item['gallery'])
        self.send_json({"message":"Contenido actualizado"})
    def do_PATCH(self):
        path=urlparse(self.path).path; data=self.body(); user=auth(self); m=re.fullmatch(r"/api/publications/(\d+)/status",path)
        if data is None: return
        if not m: return self.error(404,"NOT_FOUND","Ruta no encontrada")
        if not user or user['role']!='ADMIN': return self.error(403,"FORBIDDEN","Solo un administrador puede moderar")
        status=str(data.get('status','')); note=str(data.get('note','')).strip()
        if status not in ('PUBLISHED','REJECTED'): return self.error(400,"VALIDATION","El administrador solo puede aprobar o rechazar")
        if status=='REJECTED' and len(note)<5: return self.error(400,"VALIDATION","Escribe un motivo de rechazo claro")
        with db() as c:
            publication=c.execute("SELECT status FROM publications WHERE id=? AND deleted=0",(int(m.group(1)),)).fetchone()
            if not publication: return self.error(404,"NOT_FOUND","Contenido no encontrado")
            if publication['status']!='REVIEW': return self.error(409,"INVALID_STATE","Solo se puede moderar contenido que esté en revisión")
            c.execute("UPDATE publications SET status=?,moderation_note=?,updated_at=? WHERE id=?",(status,note or None,now(),int(m.group(1))))
        self.send_json({"message":"Estado actualizado"})
    def do_DELETE(self):
        path=urlparse(self.path).path; user=auth(self)
        m=re.fullmatch(r"/api/publications/(\d+)/favorite",path)
        if m:
            if not user: return self.error(401,"UNAUTHORIZED","Inicia sesión")
            with db() as c: c.execute("DELETE FROM favorites WHERE user_id=? AND publication_id=?",(user['id'],int(m.group(1))))
            return self.send_json({"favorite":False})
        m=re.fullmatch(r"/api/publications/(\d+)",path)
        if not m: return self.error(404,"NOT_FOUND","Ruta no encontrada")
        if not user or user['role'] not in ('GESTOR','ADMIN'): return self.error(403,"FORBIDDEN","Acceso denegado")
        with db() as c:
            cur=c.execute("UPDATE publications SET deleted=1,updated_at=? WHERE id=? AND (author_id=? OR ?='ADMIN')",(now(),int(m.group(1)),user['id'],user['role']))
            if cur.rowcount==0:return self.error(403,"FORBIDDEN","No puedes eliminar este contenido")
        self.send_json({"message":"Contenido eliminado"})

def main():
    init_db(); server=ThreadingHTTPServer((HOST,PORT),Handler); url=f"http://{HOST}:{PORT}"; print(f"TEJIDO está disponible en {url}"); print("Presiona Ctrl+C para detener.")
    try: server.serve_forever()
    except KeyboardInterrupt: print("\nTEJIDO detenido.")
    finally: server.server_close()
if __name__=='__main__': main()
