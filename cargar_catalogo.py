import json
from sqlalchemy.orm import Session
from models import TipoDenunciaTemplate
from database import SessionLocal, engine
from main import Base

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

# Cargar JSON
with open("src/catalogo_completo_integrado.json", "r", encoding="utf-8") as f:
    data = json.load(f)

denuncias = []

for categoria in data["denuncias"]:
    categoria_nombre = categoria["categoria"]
    for denuncia in categoria["items"]:
        denuncias.append({
            "titulo": denuncia["titulo"],
            "descripcion": denuncia.get("descripcion", ""),
            "ejemplos": denuncia.get("ejemplos", []),
            "sugeridos_reportantes": denuncia.get("reportantesRecomendados", [])
})

# Guardar en base de datos
db: Session = SessionLocal()

for d in denuncias:
    nueva_denuncia = TipoDenunciaTemplate(**d)
    db.add(nueva_denuncia)

db.commit()
db.close()

print(f"Se cargaron {len(denuncias)} denuncias base.")