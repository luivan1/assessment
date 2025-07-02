import json
from sqlalchemy.orm import Session
from database import SessionLocal
from models import DenunciaBase

# Ruta al archivo JSON
with open('catalogo_completo_integrado.json', encoding='utf-8') as f:
    catalogo = json.load(f)

session = SessionLocal()

for categoria in catalogo.get("denuncias", []):
    for item in categoria.get("items", []):
        nueva_base = DenunciaBase(
            titulo_original=item.get("titulo", ""),
            descripcion=item.get("descripcion", ""),
            ejemplos=item.get("ejemplos", []),
            pregunta_adicional=item.get("preguntaAdicional", ""),
            reportantes_recomendados=item.get("reportantesRecomendados", []),
        )
        session.add(nueva_base)

session.commit()
session.close()
print("Carga completa.")