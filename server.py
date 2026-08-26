#!/usr/bin/env python3
import json, os, re, secrets, sqlite3, hashlib, hmac, mimetypes
from datetime import datetime, timedelta, timezone
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / "public"
DATA = ROOT / "data"
DB_PATH = DATA / "tejido.db"
HOST = "127.0.0.1"
PORT = int(os.environ.get("TEJIDO_PORT", "8765"))
MAX_BODY_BYTES = 1_000_000
ALLOWED_KINDS = {"HISTORIA", "EVENTO", "OPORTUNIDAD", "TALENTO", "INICIATIVA"}
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

def clean_optional_url(value, field, allow_gradient=False):
    value=str(value or "").strip()
    if not value: return None
    if allow_gradient and value.startswith("linear-gradient("): return value
    if value.startswith("/") and not value.startswith("//"):
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
    return {
        "category_id":category_id,"kind":kind,"title":title,"summary":summary,
        "content":content,"image":clean_optional_url(data.get("image"),"La imagen",True),
        "location":location,"start_date":clean_optional_date(data.get("start_date"),"La fecha inicial"),
        "end_date":clean_optional_date(data.get("end_date"),"La fecha final"),
        "link":clean_optional_url(data.get("link"),"El enlace")
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

def init_db():
    with db() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS roles(id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL);
        CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, role_id INTEGER NOT NULL REFERENCES roles(id), name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, type TEXT NOT NULL, color TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
        CREATE TABLE IF NOT EXISTS organizations(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id), name TEXT NOT NULL, description TEXT, contact TEXT, active INTEGER NOT NULL DEFAULT 1);
        CREATE TABLE IF NOT EXISTS publications(id INTEGER PRIMARY KEY AUTOINCREMENT, author_id INTEGER NOT NULL REFERENCES users(id), category_id INTEGER NOT NULL REFERENCES categories(id), kind TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL, content TEXT NOT NULL, image TEXT, location TEXT, start_date TEXT, end_date TEXT, link TEXT, featured INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'DRAFT', moderation_note TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted INTEGER NOT NULL DEFAULT 0);
        CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT, publication_id INTEGER UNIQUE NOT NULL REFERENCES publications(id) ON DELETE CASCADE, venue TEXT, capacity INTEGER);
        CREATE TABLE IF NOT EXISTS opportunities(id INTEGER PRIMARY KEY AUTOINCREMENT, publication_id INTEGER UNIQUE NOT NULL REFERENCES publications(id) ON DELETE CASCADE, organization_name TEXT, deadline TEXT);
        CREATE TABLE IF NOT EXISTS favorites(user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE, created_at TEXT NOT NULL, PRIMARY KEY(user_id,publication_id));
        CREATE TABLE IF NOT EXISTS reports(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id), publication_id INTEGER NOT NULL REFERENCES publications(id), reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'OPEN', created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS suggestions(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'NEW', created_at TEXT NOT NULL, reviewed_at TEXT);
        CREATE TABLE IF NOT EXISTS publication_images(id INTEGER PRIMARY KEY AUTOINCREMENT, publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE, url TEXT NOT NULL, alt_text TEXT NOT NULL DEFAULT '', caption TEXT, position INTEGER NOT NULL DEFAULT 0 CHECK(position>=0), UNIQUE(publication_id,position));
        CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL);
        CREATE INDEX IF NOT EXISTS idx_publication_images_publication ON publication_images(publication_id,position);
        CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status,deleted);
        CREATE INDEX IF NOT EXISTS idx_publications_kind ON publications(kind);
        CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
        CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
        CREATE TABLE IF NOT EXISTS supporters(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, amount INTEGER NOT NULL, method TEXT DEFAULT 'nequi', message TEXT, created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS collaborators(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, message TEXT, created_at TEXT NOT NULL);
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
                rows=c.execute(sql,([user['id'] if user else -1]+args)).fetchall(); return self.send_json([rowdict(x) for x in rows])
            m=re.fullmatch(r"/api/publications/(\d+)/images",path)
            if m:
                pid=int(m.group(1))
                pub=c.execute("SELECT id,status,author_id FROM publications WHERE id=? AND deleted=0",(pid,)).fetchone()
                if not pub: return self.error(404,"NOT_FOUND","Publicación no encontrada")
                if pub['status']!='PUBLISHED' and (not user or (user['role']!='ADMIN' and pub['author_id']!=user['id'])):
                    return self.error(403,"FORBIDDEN","No tienes acceso a este contenido")
                rows=c.execute("SELECT id,url,alt_text,caption,position FROM publication_images WHERE publication_id=? ORDER BY position ASC",(pid,)).fetchall()
                return self.send_json([rowdict(x) for x in rows])
            m=re.fullmatch(r"/api/publications/(\d+)",path)
            if m:
                r=c.execute("SELECT p.*,c.name category,c.color,u.name author, EXISTS(SELECT 1 FROM favorites f WHERE f.publication_id=p.id AND f.user_id=?) favorite FROM publications p JOIN categories c ON c.id=p.category_id JOIN users u ON u.id=p.author_id WHERE p.id=? AND p.deleted=0",(user['id'] if user else -1,int(m.group(1)))).fetchone()
                if not r: return self.error(404,"NOT_FOUND","Contenido no encontrado")
                if r['status']!='PUBLISHED' and (not user or (user['role']!='ADMIN' and r['author_id']!=user['id'])): return self.error(403,"FORBIDDEN","No tienes acceso a este contenido")
                return self.send_json(rowdict(r))
            if path=="/api/admin/stats":
                if not user or user['role']!='ADMIN': return self.error(403,"FORBIDDEN","Acceso administrativo requerido")
                stats={"published":c.execute("SELECT COUNT(*) FROM publications WHERE status='PUBLISHED' AND deleted=0").fetchone()[0],"pending":c.execute("SELECT COUNT(*) FROM publications WHERE status='REVIEW' AND deleted=0").fetchone()[0],"users":c.execute("SELECT COUNT(*) FROM users WHERE active=1").fetchone()[0],"reports":c.execute("SELECT COUNT(*) FROM reports WHERE status='OPEN'").fetchone()[0],"suggestions":c.execute("SELECT COUNT(*) FROM suggestions WHERE status='NEW'").fetchone()[0]}; return self.send_json(stats)
            if path=="/api/admin/suggestions":
                if not user or user['role']!='ADMIN': return self.error(403,"FORBIDDEN","Acceso administrativo requerido")
                rows=c.execute("SELECT s.id,s.message,s.status,s.created_at,u.name user_name,u.email user_email FROM suggestions s LEFT JOIN users u ON u.id=s.user_id ORDER BY s.created_at DESC LIMIT 50").fetchall()
                return self.send_json([rowdict(x) for x in rows])
            if path=="/api/support/stats":
                total=c.execute("SELECT COUNT(*) FROM supporters").fetchone()[0]
                return self.send_json({"total_supporters":total})
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
            if path=="/api/support":
                name=str(data.get('name','')).strip()
                amount=data.get('amount')
                method=str(data.get('method','nequi')).strip().lower()
                if not name or len(name)<2: return self.error(400,"VALIDATION","Escribe tu nombre")
                if not isinstance(amount,(int,float)) or amount<1: return self.error(400,"VALIDATION","El monto debe ser un número positivo")
                if method not in ('nequi','daviplata','pse','efectivo','otro'): method='nequi'
                cur=c.execute("INSERT INTO supporters(name,amount,method,created_at) VALUES(?,?,?,?)",(name,int(amount),method,now()))
                return self.send_json({"id":cur.lastrowid,"message":"Gracias por tu apoyo"},201)
            if path=="/api/collaborate":
                name=str(data.get('name','')).strip()
                email=str(data.get('email','')).strip().lower()
                role=str(data.get('role','')).strip()
                message=str(data.get('message','')).strip()
                if not name or len(name)<2: return self.error(400,"VALIDATION","Escribe tu nombre")
                if not email or '@' not in email: return self.error(400,"VALIDATION","Escribe un correo válido")
                if not role: return self.error(400,"VALIDATION","Selecciona un rol")
                if len(message)>1000: return self.error(400,"VALIDATION","El mensaje no puede superar 1000 caracteres")
                cur=c.execute("INSERT INTO collaborators(name,email,role,message,created_at) VALUES(?,?,?,?,?)",(name,email,role,message or None,now()))
                return self.send_json({"id":cur.lastrowid,"message":"Postulación recibida"},201)
            if path=="/api/publications":
                if not user or user['role'] not in ('GESTOR','ADMIN'): return self.error(403,"FORBIDDEN","Se requiere rol Gestor o Administrador")
                try:
                    item=publication_input(data); validate_category(c,item['category_id'],item['kind'])
                except ValueError as error: return self.error(400,"VALIDATION",str(error))
                image=item['image'] or 'linear-gradient(135deg,#2F6B59,#F6C453)'
                status='PUBLISHED' if user['role']=='ADMIN' and data.get('publish') else 'DRAFT'
                fields=(user['id'],item['category_id'],item['kind'],item['title'],item['summary'],item['content'],image,item['location'],item['start_date'],item['end_date'],item['link'],int(bool(data.get('featured',False))) if user['role']=='ADMIN' else 0,status,now(),now())
                try:
                    cur=c.execute("INSERT INTO publications(author_id,category_id,kind,title,summary,content,image,location,start_date,end_date,link,featured,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",fields)
                    sync_publication_detail(c,cur.lastrowid,item)
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
            m=re.fullmatch(r"/api/publications/(\d+)/images",path)
            if m:
                if not user: return self.error(401,"UNAUTHORIZED","Inicia sesión para continuar")
                pid=int(m.group(1))
                pub=c.execute("SELECT id,status,author_id FROM publications WHERE id=? AND deleted=0",(pid,)).fetchone()
                if not pub: return self.error(404,"NOT_FOUND","Publicación no encontrada")
                if user['role']!='ADMIN' and pub['author_id']!=user['id']:
                    return self.error(403,"FORBIDDEN","No puedes modificar esta publicación")
                url=str(data.get('url','')).strip()
                if not url: return self.error(400,"VALIDATION","La URL es obligatoria")
                if url.startswith("/") and not url.startswith("//"):
                    if len(url)>2000: return self.error(400,"VALIDATION","La URL es demasiado larga")
                else:
                    parsed=urlparse(url)
                    if parsed.scheme!='https' or not parsed.netloc:
                        return self.error(400,"VALIDATION","La URL debe ser una dirección HTTPS válida")
                    if len(url)>2000: return self.error(400,"VALIDATION","La URL es demasiado larga")
                alt_text=str(data.get('alt_text','')).strip()
                caption=str(data.get('caption','')).strip() or None
                if 'position' in data:
                    try: position=int(data['position'])
                    except (TypeError,ValueError): return self.error(400,"VALIDATION","La posición debe ser un número entero")
                    if position<0: return self.error(400,"VALIDATION","La posición no puede ser negativa")
                else:
                    max_row=c.execute("SELECT MAX(position) FROM publication_images WHERE publication_id=?",(pid,)).fetchone()
                    position=(max_row[0] if max_row[0] is not None else -1)+1
                try:
                    cur=c.execute("INSERT INTO publication_images(publication_id,url,alt_text,caption,position) VALUES(?,?,?,?,?)",(pid,url,alt_text,caption,position))
                except sqlite3.IntegrityError:
                    return self.error(409,"CONFLICT","Ya existe una imagen en esa posición")
                return self.send_json({"id":cur.lastrowid,"url":url,"alt_text":alt_text,"caption":caption,"position":position},201)
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
            c.execute("UPDATE publications SET category_id=?,kind=?,title=?,summary=?,content=?,image=?,location=?,start_date=?,end_date=?,link=?,status='DRAFT',moderation_note=NULL,updated_at=? WHERE id=?",(item['category_id'],item['kind'],item['title'],item['summary'],item['content'],item['image'],item['location'],item['start_date'],item['end_date'],item['link'],now(),pid))
            sync_publication_detail(c,pid,item)
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
        m=re.fullmatch(r"/api/publications/(\d+)/images/(\d+)",path)
        if m:
            if not user: return self.error(401,"UNAUTHORIZED","Inicia sesión para continuar")
            pid=int(m.group(1)); iid=int(m.group(2))
            with db() as c:
                pub=c.execute("SELECT id,status,author_id FROM publications WHERE id=? AND deleted=0",(pid,)).fetchone()
                if not pub: return self.error(404,"NOT_FOUND","Publicación no encontrada")
                if user['role']!='ADMIN' and pub['author_id']!=user['id']:
                    return self.error(403,"FORBIDDEN","No puedes modificar esta publicación")
                img=c.execute("SELECT id FROM publication_images WHERE id=? AND publication_id=?",(iid,pid)).fetchone()
                if not img: return self.error(404,"NOT_FOUND","Imagen no encontrada")
                c.execute("DELETE FROM publication_images WHERE id=? AND publication_id=?",(iid,pid))
            return self.send_json({"message":"Imagen eliminada"})
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
