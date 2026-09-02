from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "tejido.db"
PUBLIC_DIR = ROOT / "frontend" / "dist"
HOST = "127.0.0.1"
PORT = 8765

DATA_DIR.mkdir(exist_ok=True)
