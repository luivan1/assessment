

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal, engine, Base

from models import (
    CentroTrabajo as CentroTrabajoModel,
    FiltroPersonalizado as FiltroModel,
    TipoReportante as TipoReportanteModel,
    CierreCatalogo as CatalogoCierreModel,
    MedioDifusion as MedioDifusionModel,
    Denuncia as DenunciaModel,
    Pregunta as PreguntaModel,
    Sugerencia as SugerenciaModel,
    DatosGenerales as DatosGeneralesModel,
    CategoriaDenuncia as CategoriaDenunciaModel,
    Usuario as UsuarioModel,
    UsuarioAcceso as UsuarioAccesoModel
)
from schemas import (
    CentroTrabajoCrear, CentroTrabajoSalida,
    FiltroCrear, FiltroSalida,
    TipoReportanteCrear, TipoReportanteSalida,
    CatalogoCierreCrear, CatalogoCierreSalida,
    MedioDifusionCrear, MedioDifusionSalida,
    DenunciaCrear, DenunciaSalida,
    PreguntaCrear, PreguntaSalida,
    SugerenciaCrear, SugerenciaSalida,
    DatosGeneralesCrear, DatosGeneralesSalida,
    CategoriaDenunciaCrear, CategoriaDenunciaSalida,
    TipoDenunciaTemplateCrear, TipoDenunciaTemplateOut,
    UsuarioCrear, UsuarioSalida,
    UsuarioAccesoCrear, UsuarioAccesoSalida
)

import schemas
import models
import json
import os

# Inicializa la base de datos si no existen las tablas
Base.metadata.create_all(bind=engine)

# Instancia la app
app = FastAPI()

# Middleware CORS para permitir acceso desde frontend (puedes cambiar el dominio después)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependencia para conexión a BD en cada endpoint
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===============================
# main.py (Bloque 2/4)
# ===============================

# --- Centros de Trabajo ---
@app.get("/centros", response_model=List[CentroTrabajoSalida])
def listar_centros(db: Session = Depends(get_db)):
    return db.query(CentroTrabajoModel).all()

@app.post("/centros", response_model=CentroTrabajoSalida)
def agregar_centro(centro: CentroTrabajoCrear, db: Session = Depends(get_db)):
    nuevo = CentroTrabajoModel(**centro.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@app.put("/centros/{centro_id}", response_model=CentroTrabajoSalida)
def actualizar_centro(centro_id: int, centro: CentroTrabajoCrear, db: Session = Depends(get_db)):
    existente = db.query(CentroTrabajoModel).filter(CentroTrabajoModel.id == centro_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Centro no encontrado")
    for campo, valor in centro.dict().items():
        setattr(existente, campo, valor)
    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/centros/{centro_id}")
def eliminar_centro(centro_id: int, db: Session = Depends(get_db)):
    existente = db.query(CentroTrabajoModel).filter(CentroTrabajoModel.id == centro_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Centro no encontrado")
    db.delete(existente)
    db.commit()
    return {"mensaje": "Centro eliminado correctamente"}

# --- Filtros Personalizados ---
@app.get("/filtros", response_model=List[FiltroSalida])
def listar_filtros(db: Session = Depends(get_db)):
    return db.query(FiltroModel).all()

@app.post("/filtros", response_model=FiltroSalida)
def agregar_filtro(filtro: FiltroCrear, db: Session = Depends(get_db)):
    existente = db.query(FiltroModel).filter(FiltroModel.nombre == filtro.nombre).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un filtro con ese nombre")
    nuevo = FiltroModel(**filtro.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@app.delete("/filtros/{filtro_id}")
def eliminar_filtro(filtro_id: int, db: Session = Depends(get_db)):
    filtro = db.query(FiltroModel).filter(FiltroModel.id == filtro_id).first()
    if not filtro:
        raise HTTPException(status_code=404, detail="Filtro no encontrado")
    db.delete(filtro)
    db.commit()
    return {"mensaje": "Filtro eliminado correctamente"}

# --- Tipos de Reportante ---
@app.get("/reportantes", response_model=List[TipoReportanteSalida])
def listar_reportantes(db: Session = Depends(get_db)):
    return db.query(TipoReportanteModel).all()

@app.post("/reportantes", response_model=TipoReportanteSalida)
def agregar_reportante(reportante: TipoReportanteCrear, db: Session = Depends(get_db)):
    datos = reportante.dict()
    datos["etiqueta_original"] = datos["etiqueta"]
    nuevo = TipoReportanteModel(**datos)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@app.put("/reportantes/{reportante_id}", response_model=TipoReportanteSalida)
def actualizar_reportante(reportante_id: int, reportante: TipoReportanteCrear, db: Session = Depends(get_db)):
    existente = db.query(TipoReportanteModel).filter(TipoReportanteModel.id == reportante_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Tipo de reportante no encontrado")
    datos_actualizados = reportante.dict()
    datos_actualizados["etiqueta_original"] = existente.etiqueta_original
    for campo, valor in datos_actualizados.items():
        setattr(existente, campo, valor)
    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/reportantes/{reportante_id}")
def eliminar_reportante(reportante_id: int, db: Session = Depends(get_db)):
    existente = db.query(TipoReportanteModel).filter(TipoReportanteModel.id == reportante_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Tipo de reportante no encontrado")
    db.delete(existente)
    db.commit()
    return {"mensaje": "Tipo de reportante eliminado correctamente"}

# --- Catálogo de Cierres ---
@app.get("/cierres", response_model=List[CatalogoCierreSalida])
def listar_cierres(db: Session = Depends(get_db)):
    return db.query(CatalogoCierreModel).all()

@app.post("/cierres", response_model=CatalogoCierreSalida)
def agregar_cierre(cierre: CatalogoCierreCrear, db: Session = Depends(get_db)):
    datos = cierre.dict()
    datos["etiqueta_original"] = datos["etiqueta"]
    nuevo = CatalogoCierreModel(**datos)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@app.put("/cierres/{cierre_id}", response_model=CatalogoCierreSalida)
def actualizar_cierre(cierre_id: int, cierre: CatalogoCierreCrear, db: Session = Depends(get_db)):
    existente = db.query(CatalogoCierreModel).filter(CatalogoCierreModel.id == cierre_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Elemento de catálogo no encontrado")
    for campo, valor in cierre.dict().items():
        setattr(existente, campo, valor)
    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/cierres/{cierre_id}")
def eliminar_cierre(cierre_id: int, db: Session = Depends(get_db)):
    existente = db.query(CatalogoCierreModel).filter(CatalogoCierreModel.id == cierre_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Elemento de catálogo no encontrado")
    db.delete(existente)
    db.commit()
    return {"mensaje": "Elemento eliminado correctamente"}

# --- Medios de Difusión ---
@app.get("/medios", response_model=List[MedioDifusionSalida])
def listar_medios(db: Session = Depends(get_db)):
    return db.query(MedioDifusionModel).all()

@app.post("/medios", response_model=MedioDifusionSalida)
def agregar_medio(medio: MedioDifusionCrear, db: Session = Depends(get_db)):
    datos = medio.dict()
    datos["etiqueta_original"] = datos["etiqueta"]
    nuevo = MedioDifusionModel(**datos)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@app.put("/medios/{medio_id}", response_model=MedioDifusionSalida)
def actualizar_medio(medio_id: int, medio: MedioDifusionCrear, db: Session = Depends(get_db)):
    existente = db.query(MedioDifusionModel).filter(MedioDifusionModel.id == medio_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Medio no encontrado")
    for campo, valor in medio.dict().items():
        setattr(existente, campo, valor)
    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/medios/{medio_id}")
def eliminar_medio(medio_id: int, db: Session = Depends(get_db)):
    existente = db.query(MedioDifusionModel).filter(MedioDifusionModel.id == medio_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Medio no encontrado")
    db.delete(existente)
    db.commit()
    return {"mensaje": "Medio eliminado correctamente"}

# ===============================
# main.py (Bloque 3/4)
# ===============================

# === Denuncias ===
@app.get("/denuncias", response_model=List[DenunciaSalida])
def listar_denuncias(db: Session = Depends(get_db)):
    denuncias = db.query(DenunciaModel).all()
    categorias = {c.id: c.titulo for c in db.query(CategoriaDenunciaModel).all()}
    salida = []
    for d in denuncias:
        d_dict = d.__dict__.copy()
        d_dict["categoria_titulo"] = categorias.get(d.categoria_id)
        salida.append(DenunciaSalida(**d_dict))
    return salida

@app.post("/denuncias", response_model=DenunciaSalida)
def agregar_denuncia(denuncia: DenunciaCrear, db: Session = Depends(get_db)):
    datos = denuncia.dict()
    nueva = DenunciaModel(**datos)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    categoria = db.query(CategoriaDenunciaModel).filter(CategoriaDenunciaModel.id == nueva.categoria_id).first()
    return DenunciaSalida(**nueva.__dict__, categoria_titulo=categoria.titulo if categoria else None)

@app.put("/denuncias/{denuncia_id}", response_model=DenunciaSalida)
def actualizar_denuncia(denuncia_id: int, denuncia: DenunciaCrear, db: Session = Depends(get_db)):
    existente = db.query(DenunciaModel).filter(DenunciaModel.id == denuncia_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Denuncia no encontrada")
    for campo, valor in denuncia.dict().items():
        if campo == "titulo_original":
            continue
        setattr(existente, campo, valor)
    if not existente.titulo_original:
        existente.titulo_original = denuncia.titulo_original
    db.commit()
    db.refresh(existente)
    categoria = db.query(CategoriaDenunciaModel).filter(CategoriaDenunciaModel.id == existente.categoria_id).first()
    return DenunciaSalida(**existente.__dict__, categoria_titulo=categoria.titulo if categoria else None)

@app.delete("/denuncias/{denuncia_id}")
def eliminar_denuncia(denuncia_id: int, db: Session = Depends(get_db)):
    existente = db.query(DenunciaModel).filter(DenunciaModel.id == denuncia_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Denuncia no encontrada")
    db.delete(existente)
    db.commit()
    return {"mensaje": "Denuncia eliminada correctamente"}

# === Preguntas ===
@app.get("/preguntas", response_model=List[PreguntaSalida])
def listar_preguntas(db: Session = Depends(get_db)):
    return db.query(PreguntaModel).all()

@app.post("/preguntas", response_model=PreguntaSalida)
def agregar_pregunta(pregunta: PreguntaCrear, db: Session = Depends(get_db)):
    datos = pregunta.dict()
    datos["titulo_original"] = datos["titulo"]
    nueva = PreguntaModel(**datos)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@app.put("/preguntas/{pregunta_id}", response_model=PreguntaSalida)
def actualizar_pregunta(pregunta_id: int, pregunta: PreguntaCrear, db: Session = Depends(get_db)):
    existente = db.query(PreguntaModel).filter(PreguntaModel.id == pregunta_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    for campo, valor in pregunta.dict().items():
        setattr(existente, campo, valor)
    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/preguntas/{pregunta_id}")
def eliminar_pregunta(pregunta_id: int, db: Session = Depends(get_db)):
    existente = db.query(PreguntaModel).filter(PreguntaModel.id == pregunta_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    db.delete(existente)
    db.commit()
    return {"mensaje": "Pregunta eliminada correctamente"}

# === Sugerencias ===
@app.get("/sugerencias", response_model=List[SugerenciaSalida])
def listar_sugerencias(db: Session = Depends(get_db)):
    return db.query(SugerenciaModel).all()

@app.post("/sugerencias", response_model=SugerenciaSalida)
def agregar_sugerencia(sugerencia: SugerenciaCrear, db: Session = Depends(get_db)):
    datos = sugerencia.dict()
    datos["titulo_original"] = datos["titulo"]
    nueva = SugerenciaModel(**datos)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@app.put("/sugerencias/{sugerencia_id}", response_model=SugerenciaSalida)
def actualizar_sugerencia(sugerencia_id: int, sugerencia: SugerenciaCrear, db: Session = Depends(get_db)):
    existente = db.query(SugerenciaModel).filter(SugerenciaModel.id == sugerencia_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Sugerencia no encontrada")
    for campo, valor in sugerencia.dict().items():
        setattr(existente, campo, valor)
    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/sugerencias/{sugerencia_id}")
def eliminar_sugerencia(sugerencia_id: int, db: Session = Depends(get_db)):
    existente = db.query(SugerenciaModel).filter(SugerenciaModel.id == sugerencia_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Sugerencia no encontrada")
    db.delete(existente)
    db.commit()
    return {"mensaje": "Sugerencia eliminada correctamente"}

# === Datos Generales ===
@app.get("/datos-generales", response_model=DatosGeneralesSalida)
def obtener_datos_generales(db: Session = Depends(get_db)):
    datos = db.query(DatosGeneralesModel).first()
    if not datos:
        raise HTTPException(status_code=404, detail="No hay datos generales registrados.")
    return datos

@app.post("/datos-generales", response_model=DatosGeneralesSalida)
def crear_datos_generales(datos: DatosGeneralesCrear, db: Session = Depends(get_db)):
    existente = db.query(DatosGeneralesModel).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un registro de datos generales.")
    nuevo = DatosGeneralesModel(**datos.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@app.put("/datos-generales/{id}", response_model=DatosGeneralesSalida)
def actualizar_datos_generales(id: int, datos: DatosGeneralesCrear, db: Session = Depends(get_db)):
    existente = db.query(DatosGeneralesModel).filter(DatosGeneralesModel.id == id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="No se encontró el registro.")
    for field, value in datos.dict().items():
        setattr(existente, field, value)
    db.commit()
    db.refresh(existente)
    return existente

# === Categorías de Denuncia ===
@app.get("/categorias-denuncia", response_model=List[CategoriaDenunciaSalida])
def listar_categorias_denuncia(db: Session = Depends(get_db)):
    return db.query(CategoriaDenunciaModel).order_by(CategoriaDenunciaModel.orden).all()

@app.post("/categorias-denuncia", response_model=CategoriaDenunciaSalida)
def crear_categoria_denuncia(categoria: CategoriaDenunciaCrear, db: Session = Depends(get_db)):
    nueva = CategoriaDenunciaModel(**categoria.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@app.put("/categorias-denuncia/{categoria_id}", response_model=CategoriaDenunciaSalida)
def actualizar_categoria_denuncia(categoria_id: int, categoria: CategoriaDenunciaCrear, db: Session = Depends(get_db)):
    existente = db.query(CategoriaDenunciaModel).filter(CategoriaDenunciaModel.id == categoria_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    for campo, valor in categoria.dict().items():
        setattr(existente, campo, valor)
    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/categorias-denuncia/{categoria_id}")
def eliminar_categoria_denuncia(categoria_id: int, db: Session = Depends(get_db)):
    existente = db.query(CategoriaDenunciaModel).filter(CategoriaDenunciaModel.id == categoria_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    db.delete(existente)
    db.commit()
    return {"mensaje": "Categoría eliminada correctamente"}

# ===============================
# main.py (Bloque 4/4)
# ===============================

# === Tipo de denuncia template ===

@app.post("/plantillas-denuncia", response_model=TipoDenunciaTemplateOut)
def crear_plantilla_denuncia(template: TipoDenunciaTemplateCrear, db: Session = Depends(get_db)):
    db_template = models.TipoDenunciaTemplate(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@app.get("/plantillas-denuncia", response_model=List[TipoDenunciaTemplateOut])
def obtener_plantillas_denuncia(db: Session = Depends(get_db)):
    return db.query(models.TipoDenunciaTemplate).all()

# === Restaurar denuncias y categorías desde archivo JSON ===

@app.post("/restaurar-denuncias")
def restaurar_denuncias(db: Session = Depends(get_db)):
    # Elimina todas las denuncias y categorías actuales
    db.query(DenunciaModel).delete()
    db.query(CategoriaDenunciaModel).delete()
    db.commit()

    # Ajusta la ruta del archivo JSON según corresponda
    ruta_archivo = os.path.join(os.path.dirname(__file__), "catalogo_completo_integrado.json")
    with open(ruta_archivo, "r", encoding="utf-8") as f:
        catalogo = json.load(f)

    for i, categoria in enumerate(catalogo["denuncias"]):
        nueva_categoria = CategoriaDenunciaModel(
            titulo=categoria["titulo"],
            descripcion=categoria.get("descripcion", ""),
            orden=i
        )
        db.add(nueva_categoria)
        db.commit()
        db.refresh(nueva_categoria)
        for tipo in categoria["tipos"]:
            nueva_denuncia = DenunciaModel(
                categoria_id=nueva_categoria.id,
                titulo=tipo["titulo"],
                descripcion=tipo["descripcion"],
                ejemplos=tipo["ejemplos"],
                pregunta_adicional=tipo["preguntaAdicional"],
                anonimo=tipo["anonimo"],
                tipos_reportante=tipo["tiposReportante"],
                visible_en_reporte=True,
                orden=0,
                titulo_original=tipo["titulo"]
            )
            db.add(nueva_denuncia)
    db.commit()
    return {"mensaje": "Catálogo restaurado correctamente"}

# === Usuarios del Sistema ===

@app.get("/usuarios", response_model=List[UsuarioSalida])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(UsuarioModel).all()

@app.get("/usuarios/{usuario_id}", response_model=UsuarioSalida)
def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@app.post("/usuarios", response_model=UsuarioSalida)
def crear_usuario(usuario: UsuarioCrear, db: Session = Depends(get_db)):
    data = usuario.dict()
    # Normalizar camelCase del frontend a snake_case del modelo
    if "fechaNacimiento" in data:
        data["fecha_nacimiento"] = data.pop("fechaNacimiento")
    if "foto" in data:
        data["foto_url"] = data.pop("foto")
    nuevo_usuario = UsuarioModel(**data)
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@app.put("/usuarios/{usuario_id}", response_model=UsuarioSalida)
def actualizar_usuario(usuario_id: int, usuario: UsuarioCrear, db: Session = Depends(get_db)):
    existente = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    data = usuario.dict()
    # Normalizar camelCase del frontend a snake_case del modelo
    if "fechaNacimiento" in data:
        data["fecha_nacimiento"] = data.pop("fechaNacimiento")
    if "foto" in data:
        data["foto_url"] = data.pop("foto")
    for campo, valor in data.items():
        setattr(existente, campo, valor)
    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/usuarios/{usuario_id}")
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    existente = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(existente)
    db.commit()
    return {"mensaje": "Usuario eliminado correctamente"}

# === USUARIOS DE ACCESO (Login real) ===

@app.post("/usuarios-acceso", response_model=UsuarioAccesoSalida)
def crear_usuario_acceso(usuario: UsuarioAccesoCrear, db: Session = Depends(get_db)):
    print("DEBUG usuario recibido:", usuario.dict())  #
    existente = db.query(UsuarioAccesoModel).filter(UsuarioAccesoModel.correo == usuario.correo).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un usuario con ese correo")
    nuevo = UsuarioAccesoModel(
        correo=usuario.correo,
        contrasena=usuario.contrasena,
        rol=usuario.rol,
        organizacion=usuario.organizacion,   # <- Asegúrate de recibirlo y guardarlo
        cliente_id=usuario.cliente_id,
        es_admin=usuario.es_admin
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@app.get("/usuarios-acceso", response_model=List[UsuarioAccesoSalida])
def listar_usuarios_acceso(db: Session = Depends(get_db)):
    return db.query(UsuarioAccesoModel).all()

@app.post("/login")
def login(datos: UsuarioAccesoCrear, db: Session = Depends(get_db)):
    usuario = db.query(UsuarioAccesoModel).filter(UsuarioAccesoModel.correo == datos.correo).first()
    if not usuario or usuario.contrasena != datos.contrasena:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    return {"mensaje": "Login exitoso", "usuario_id": usuario.id, "correo": usuario.correo, "rol": usuario.rol}

@app.delete("/usuarios-acceso/{usuario_id}")
def eliminar_usuario_acceso(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(UsuarioAccesoModel).filter(UsuarioAccesoModel.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()
    return {"mensaje": "Usuario eliminado"}

@app.put("/usuarios-acceso/{usuario_id}", response_model=UsuarioAccesoSalida)
def editar_usuario_acceso(usuario_id: int, datos: UsuarioAccesoCrear, db: Session = Depends(get_db)):
    usuario = db.query(UsuarioAccesoModel).filter(UsuarioAccesoModel.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    # Actualiza los campos editables
    usuario.correo = datos.correo
    usuario.contrasena = datos.contrasena
    usuario.rol = datos.rol
    usuario.organizacion = datos.organizacion
    usuario.cliente_id = datos.cliente_id
    usuario.es_admin = datos.es_admin
    db.commit()
    db.refresh(usuario)
    return usuario