

from fastapi import FastAPI, Depends, HTTPException, Query, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal, engine, Base
from schemas import OrganizacionCrear, OrganizacionSalida
from models import Organizacion

from models import (
    CentroTrabajo as CentroTrabajoModel,
    FiltroPersonalizado as FiltroModel,
    ConfiguracionFiltros as ConfiguracionFiltrosModel,
    TipoReportante as TipoReportanteModel,
    CierreCatalogo as CatalogoCierreModel,
    MedioDifusion as MedioDifusionModel,
    Denuncia as DenunciaModel,
    Pregunta as PreguntaModel,
    Sugerencia as SugerenciaModel,
    DatosGenerales as DatosGeneralesModel,
    CategoriaDenuncia as CategoriaDenunciaModel,
    Usuario as UsuarioModel,
    UsuarioAcceso as UsuarioAccesoModel,
    Bandera as BanderaModel
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
    UsuarioAccesoCrear, UsuarioAccesoSalida,
    ConfiguracionFiltrosCrear, ConfiguracionFiltrosSalida,
    BanderaCrear, BanderaSalida
    
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
    allow_origins=["http://localhost:5173"],  # Solo permitir tu frontend local
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


# Utilidad para obtener organizacion desde el header
def obtener_organizacion_usuario(request: Request):
    organizacion_id = request.headers.get("X-Organizacion-Id")
    if not organizacion_id:
        raise HTTPException(status_code=401, detail="Falta encabezado X-Organizacion-Id")
    return int(organizacion_id)

# --- Centros de Trabajo ---
@app.get("/centros", response_model=List[CentroTrabajoSalida])
def listar_centros(
    organizacion_id: int = Query(...),
    db: Session = Depends(get_db)
):
    return db.query(CentroTrabajoModel).filter(CentroTrabajoModel.organizacion_id == organizacion_id).all()

@app.post("/centros", response_model=CentroTrabajoSalida)
def agregar_centro(centro: CentroTrabajoCrear, db: Session = Depends(get_db)):
    print("➡️ Centro recibido:", centro.dict())
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
def listar_filtros(
    organizacion_id: int = Query(...),
    db: Session = Depends(get_db)
):
    return db.query(FiltroModel).filter(FiltroModel.organizacion_id == organizacion_id).all()

@app.post("/filtros", response_model=FiltroSalida)
def agregar_filtro(filtro: FiltroCrear, db: Session = Depends(get_db)):
    existente = db.query(FiltroModel).filter(
        FiltroModel.nombre == filtro.nombre,
        FiltroModel.organizacion_id == filtro.organizacion_id
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un filtro con ese nombre para esta organización")
    nuevo = FiltroModel(**filtro.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@app.put("/filtros/{filtro_id}", response_model=FiltroSalida)
def actualizar_filtro(filtro_id: int, filtro: FiltroCrear, db: Session = Depends(get_db)):
    existente = db.query(FiltroModel).filter(FiltroModel.id == filtro_id).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Filtro no encontrado")
    for campo, valor in filtro.dict().items():
        setattr(existente, campo, valor)
    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/filtros/{filtro_id}")
def eliminar_filtro(filtro_id: int, organizacion_id: int = Query(...), db: Session = Depends(get_db)):
    filtro = db.query(FiltroModel).filter_by(id=filtro_id, organizacion_id=organizacion_id).first()
    if not filtro:
        raise HTTPException(status_code=404, detail="Filtro no encontrado")
    db.delete(filtro)
    db.commit()
    return {"mensaje": "Filtro eliminado correctamente"}


# === Endpoints para configuración de filtros (activos y orden) ===

@app.post("/filtros/configuracion", response_model=ConfiguracionFiltrosSalida)
def crear_configuracion_filtros(
    datos: ConfiguracionFiltrosCrear,
    db: Session = Depends(get_db)
):
    existente = db.query(ConfiguracionFiltrosModel).filter_by(organizacion_id=datos.organizacion_id).first()
    if existente:
        # Si ya existe, lo actualiza
        existente.filtros_activos = datos.filtros_activos
        existente.orden_filtros = datos.orden_filtros
    else:
        # Si no existe, lo crea
        existente = ConfiguracionFiltrosModel(
            organizacion_id=datos.organizacion_id,
            filtros_activos=datos.filtros_activos,
            orden_filtros=datos.orden_filtros
        )
        db.add(existente)
    
    db.commit()
    db.refresh(existente)
    return existente

@app.get("/filtros/configuracion", response_model=ConfiguracionFiltrosSalida)
def obtener_configuracion_filtros(organizacion_id: int, db: Session = Depends(get_db)):
    config = db.query(ConfiguracionFiltrosModel).filter_by(organizacion_id=organizacion_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuración de filtros no encontrada.")
    return config

# --- Tipos de Reportante ---
@app.get("/reportantes", response_model=List[TipoReportanteSalida])
def listar_reportantes(
    organizacion_id: int = Query(...),
    db: Session = Depends(get_db)
):
    return db.query(TipoReportanteModel).filter(TipoReportanteModel.organizacion_id == organizacion_id).all()

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
    
    for campo, valor in reportante.dict().items():
        if campo == "etiqueta_original":
            continue
        setattr(existente, campo, valor)

    if not existente.etiqueta_original:
        existente.etiqueta_original = reportante.etiqueta

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
def listar_cierres(request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    return db.query(CatalogoCierreModel).filter(CatalogoCierreModel.organizacion_id == organizacion_id).all()

@app.post("/cierres", response_model=CatalogoCierreSalida)
def agregar_cierre(cierre: CatalogoCierreCrear, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    datos = cierre.dict()
    datos["etiqueta_original"] = datos["etiqueta"]
    datos["organizacion_id"] = organizacion_id
    nuevo = CatalogoCierreModel(**datos)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@app.put("/cierres/{cierre_id}", response_model=CatalogoCierreSalida)
def actualizar_cierre(cierre_id: int, cierre: CatalogoCierreCrear, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    existente = db.query(CatalogoCierreModel).filter(
        CatalogoCierreModel.id == cierre_id,
        CatalogoCierreModel.organizacion_id == organizacion_id
    ).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Elemento de catálogo no encontrado")

    for campo, valor in cierre.dict().items():
        if campo != "etiqueta_original":
            setattr(existente, campo, valor)

    if not existente.etiqueta_original:
        existente.etiqueta_original = cierre.etiqueta

    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/cierres/{cierre_id}")
def eliminar_cierre(cierre_id: int, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    existente = db.query(CatalogoCierreModel).filter(
        CatalogoCierreModel.id == cierre_id,
        CatalogoCierreModel.organizacion_id == organizacion_id
    ).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Elemento de catálogo no encontrado")
    db.delete(existente)
    db.commit()
    return {"mensaje": "Elemento eliminado correctamente"}

# --- Medios de Difusión ---
@app.get("/medios", response_model=List[MedioDifusionSalida])
def listar_medios(request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    return db.query(MedioDifusionModel).filter(MedioDifusionModel.organizacion_id == organizacion_id).all()

@app.post("/medios", response_model=MedioDifusionSalida)
def agregar_medio(medio: MedioDifusionCrear, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    datos = medio.dict()
    datos["etiqueta_original"] = datos["etiqueta"]
    datos["organizacion_id"] = organizacion_id
    nuevo = MedioDifusionModel(**datos)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@app.put("/medios/{medio_id}", response_model=MedioDifusionSalida)
def actualizar_medio(medio_id: int, medio: MedioDifusionCrear, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    existente = db.query(MedioDifusionModel).filter(
        MedioDifusionModel.id == medio_id,
        MedioDifusionModel.organizacion_id == organizacion_id
    ).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Medio no encontrado")

    for campo, valor in medio.dict().items():
        if campo != "etiqueta_original":
            setattr(existente, campo, valor)

    if not existente.etiqueta_original:
        existente.etiqueta_original = medio.etiqueta

    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/medios/{medio_id}")
def eliminar_medio(medio_id: int, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    existente = db.query(MedioDifusionModel).filter(
        MedioDifusionModel.id == medio_id,
        MedioDifusionModel.organizacion_id == organizacion_id
    ).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Medio no encontrado")
    db.delete(existente)
    db.commit()
    return {"mensaje": "Medio eliminado correctamente"}



# === Denuncias ===
@app.get("/denuncias", response_model=List[DenunciaSalida])
def listar_denuncias(
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)

    denuncias = db.query(DenunciaModel).filter(DenunciaModel.organizacion_id == organizacion_id).all()
    categorias = {c.id: c.titulo for c in db.query(CategoriaDenunciaModel).all()}

    salida = []
    for d in denuncias:
        d_dict = d.__dict__.copy()
        d_dict["categoria_titulo"] = categorias.get(d.categoria_id)
        salida.append(DenunciaSalida(**d_dict))

    return salida

@app.post("/denuncias", response_model=DenunciaSalida)
def agregar_denuncia(
    denuncia: DenunciaCrear,
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)
    datos = denuncia.dict()
    datos["organizacion_id"] = organizacion_id

    nueva = DenunciaModel(**datos)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    categoria = db.query(CategoriaDenunciaModel).filter(CategoriaDenunciaModel.id == nueva.categoria_id).first()
    return DenunciaSalida(**nueva.__dict__, categoria_titulo=categoria.titulo if categoria else None)

@app.put("/denuncias/{denuncia_id}", response_model=DenunciaSalida)
def actualizar_denuncia(
    denuncia_id: int,
    denuncia: DenunciaCrear,
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)

    existente = db.query(DenunciaModel).filter(
        DenunciaModel.id == denuncia_id,
        DenunciaModel.organizacion_id == organizacion_id
    ).first()

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
def eliminar_denuncia(
    denuncia_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)

    existente = db.query(DenunciaModel).filter(
        DenunciaModel.id == denuncia_id,
        DenunciaModel.organizacion_id == organizacion_id
    ).first()

    if not existente:
        raise HTTPException(status_code=404, detail="Denuncia no encontrada")

    db.delete(existente)
    db.commit()
    return {"mensaje": "Denuncia eliminada correctamente"}

# === Preguntas ===
@app.get("/preguntas", response_model=List[PreguntaSalida])
def listar_preguntas(
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)
    return db.query(PreguntaModel).filter(PreguntaModel.organizacion_id == organizacion_id).all()

@app.post("/preguntas", response_model=PreguntaSalida)
def agregar_pregunta(
    pregunta: PreguntaCrear,
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)
    datos = pregunta.dict()
    datos["titulo_original"] = datos["titulo"]
    datos["organizacion_id"] = organizacion_id
    nueva = PreguntaModel(**datos)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@app.put("/preguntas/{pregunta_id}", response_model=PreguntaSalida)
def actualizar_pregunta(
    pregunta_id: int,
    pregunta: PreguntaCrear,
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)

    existente = db.query(PreguntaModel).filter(
        PreguntaModel.id == pregunta_id,
        PreguntaModel.organizacion_id == organizacion_id
    ).first()

    if not existente:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")

    for campo, valor in pregunta.dict().items():
        setattr(existente, campo, valor)

    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/preguntas/{pregunta_id}")
def eliminar_pregunta(
    pregunta_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)

    existente = db.query(PreguntaModel).filter(
        PreguntaModel.id == pregunta_id,
        PreguntaModel.organizacion_id == organizacion_id
    ).first()

    if not existente:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")

    db.delete(existente)
    db.commit()
    return {"mensaje": "Pregunta eliminada correctamente"}

# === Sugerencias ===
@app.get("/sugerencias", response_model=List[SugerenciaSalida])
def listar_sugerencias(
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)
    return db.query(SugerenciaModel).filter(SugerenciaModel.organizacion_id == organizacion_id).all()

@app.post("/sugerencias", response_model=SugerenciaSalida)
def agregar_sugerencia(
    sugerencia: SugerenciaCrear,
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)
    datos = sugerencia.dict()
    datos["titulo_original"] = datos["titulo"]
    datos["organizacion_id"] = organizacion_id
    nueva = SugerenciaModel(**datos)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@app.put("/sugerencias/{sugerencia_id}", response_model=SugerenciaSalida)
def actualizar_sugerencia(
    sugerencia_id: int,
    sugerencia: SugerenciaCrear,
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)

    existente = db.query(SugerenciaModel).filter(
        SugerenciaModel.id == sugerencia_id,
        SugerenciaModel.organizacion_id == organizacion_id
    ).first()

    if not existente:
        raise HTTPException(status_code=404, detail="Sugerencia no encontrada")

    for campo, valor in sugerencia.dict().items():
        setattr(existente, campo, valor)

    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/sugerencias/{sugerencia_id}")
def eliminar_sugerencia(
    sugerencia_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)

    existente = db.query(SugerenciaModel).filter(
        SugerenciaModel.id == sugerencia_id,
        SugerenciaModel.organizacion_id == organizacion_id
    ).first()

    if not existente:
        raise HTTPException(status_code=404, detail="Sugerencia no encontrada")

    db.delete(existente)
    db.commit()
    return {"mensaje": "Sugerencia eliminada correctamente"}

# === Datos Generales ===

@app.get("/datos-generales", response_model=DatosGeneralesSalida)
def obtener_datos_generales(
    organizacion_id: int = Query(...),
    db: Session = Depends(get_db)
):
    datos = db.query(DatosGeneralesModel).filter(DatosGeneralesModel.organizacion_id == organizacion_id).first()
    if not datos:
        raise HTTPException(status_code=404, detail="No hay datos generales registrados.")
    return datos

@app.post("/datos-generales", response_model=DatosGeneralesSalida)
def crear_datos_generales(
    datos: DatosGeneralesCrear,
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)
    existente = db.query(DatosGeneralesModel).filter(DatosGeneralesModel.organizacion_id == organizacion_id).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un registro de datos generales para esta organización.")
    data_dict = datos.dict()
    data_dict["organizacion_id"] = organizacion_id
    nuevo = DatosGeneralesModel(**data_dict)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@app.put("/datos-generales/{id}", response_model=DatosGeneralesSalida)
def actualizar_datos_generales(
    id: int,
    datos: DatosGeneralesCrear,
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)
    existente = db.query(DatosGeneralesModel).filter(
        DatosGeneralesModel.id == id,
        DatosGeneralesModel.organizacion_id == organizacion_id
    ).first()
    if not existente:
        raise HTTPException(status_code=404, detail="No se encontró el registro para esta organización.")
    for field, value in datos.dict().items():
        setattr(existente, field, value)
    db.commit()
    db.refresh(existente)
    return existente

# === Categorías de Denuncia ===
@app.get("/categorias-denuncia", response_model=List[CategoriaDenunciaSalida])
def listar_categorias_denuncia(
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)
    return db.query(CategoriaDenunciaModel).filter(
        CategoriaDenunciaModel.organizacion_id == organizacion_id
    ).order_by(CategoriaDenunciaModel.orden).all()

@app.post("/categorias-denuncia", response_model=CategoriaDenunciaSalida)
def crear_categoria_denuncia(
    categoria: CategoriaDenunciaCrear,
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)
    data = categoria.dict(exclude={"organizacion_id"})  # ⛔ evitamos duplicarlo
    data["organizacion_id"] = organizacion_id           # ✅ lo añadimos desde el backend
    nueva = CategoriaDenunciaModel(**data)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@app.put("/categorias-denuncia/{categoria_id}", response_model=CategoriaDenunciaSalida)
def actualizar_categoria_denuncia(
    categoria_id: int,
    categoria: CategoriaDenunciaCrear,
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)
    existente = db.query(CategoriaDenunciaModel).filter(
        CategoriaDenunciaModel.id == categoria_id,
        CategoriaDenunciaModel.organizacion_id == organizacion_id
    ).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    for campo, valor in categoria.dict().items():
        setattr(existente, campo, valor)
    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/categorias-denuncia/{categoria_id}")
def eliminar_categoria_denuncia(
    categoria_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)
    existente = db.query(CategoriaDenunciaModel).filter(
        CategoriaDenunciaModel.id == categoria_id,
        CategoriaDenunciaModel.organizacion_id == organizacion_id
    ).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    db.delete(existente)
    db.commit()
    return {"mensaje": "Categoría eliminada correctamente"}


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
def restaurar_denuncias(
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)

    # Elimina solo las denuncias y categorías de esta organización
    categorias_ids = db.query(CategoriaDenunciaModel.id).filter(
        CategoriaDenunciaModel.organizacion_id == organizacion_id
    ).all()
    categorias_ids = [c.id for c in categorias_ids]
    
    if categorias_ids:
        db.query(DenunciaModel).filter(DenunciaModel.categoria_id.in_(categorias_ids)).delete(synchronize_session=False)
        db.query(CategoriaDenunciaModel).filter(CategoriaDenunciaModel.id.in_(categorias_ids)).delete(synchronize_session=False)
        db.commit()

    # Carga desde el archivo JSON
    ruta_archivo = os.path.join(os.path.dirname(__file__), "catalogo_completo_integrado.json")
    with open(ruta_archivo, "r", encoding="utf-8") as f:
        catalogo = json.load(f)

    for i, categoria in enumerate(catalogo["denuncias"]):
        nueva_categoria = CategoriaDenunciaModel(
            titulo=categoria["titulo"],
            descripcion=categoria.get("descripcion", ""),
            orden=i,
            organizacion_id=organizacion_id
        )
        db.add(nueva_categoria)
        db.commit()
        db.refresh(nueva_categoria)

        for tipo in categoria["tipos"]:
            nueva_denuncia = DenunciaModel(
                categoria_id=nueva_categoria.id,
                titulo=tipo["titulo"],
                descripcion=tipo.get("descripcion", ""),
                ejemplos=tipo.get("ejemplos", []),
                pregunta_adicional=tipo.get("preguntaAdicional", ""),
                anonimo=tipo.get("anonimo", False),
                tipos_reportante=tipo.get("tiposReportante", []),
                visible_en_reporte=True,
                orden=0,
                titulo_original=tipo["titulo"],
                organizacion_id=organizacion_id
            )
            db.add(nueva_denuncia)

    db.commit()
    return {"mensaje": "Catálogo restaurado correctamente para esta organización"}

# === Usuarios del Sistema ===

@app.get("/usuarios", response_model=List[UsuarioSalida])
def listar_usuarios(request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    return db.query(UsuarioModel).filter(UsuarioModel.organizacion_id == organizacion_id).all()

@app.get("/usuarios/{usuario_id}", response_model=UsuarioSalida)
def obtener_usuario(usuario_id: int, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    usuario = db.query(UsuarioModel).filter(
        UsuarioModel.id == usuario_id,
        UsuarioModel.organizacion_id == organizacion_id
    ).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@app.post("/usuarios", response_model=UsuarioSalida)
def crear_usuario(usuario: UsuarioCrear, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    data = usuario.dict()

    # Normalizar campos camelCase
    data["fecha_nacimiento"] = data.pop("fechaNacimiento", None)
    data["foto_url"] = data.pop("foto", None)
    data["organizacion_id"] = organizacion_id

    nuevo_usuario = UsuarioModel(**data)
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@app.put("/usuarios/{usuario_id}", response_model=UsuarioSalida)
def actualizar_usuario(usuario_id: int, usuario: UsuarioCrear, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    existente = db.query(UsuarioModel).filter(
        UsuarioModel.id == usuario_id,
        UsuarioModel.organizacion_id == organizacion_id
    ).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    data = usuario.dict()
    data["fecha_nacimiento"] = data.pop("fechaNacimiento", None)
    data["foto_url"] = data.pop("foto", None)

    for campo, valor in data.items():
        setattr(existente, campo, valor)

    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/usuarios/{usuario_id}")
def eliminar_usuario(usuario_id: int, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    existente = db.query(UsuarioModel).filter(
        UsuarioModel.id == usuario_id,
        UsuarioModel.organizacion_id == organizacion_id
    ).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(existente)
    db.commit()
    return {"mensaje": "Usuario eliminado correctamente"}

# === USUARIOS DE ACCESO (Login real) ===

@app.post("/usuarios-acceso", response_model=UsuarioAccesoSalida)
def crear_usuario_acceso(usuario: UsuarioAccesoCrear, db: Session = Depends(get_db)):
    existente = db.query(UsuarioAccesoModel).filter(UsuarioAccesoModel.correo == usuario.correo).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un usuario con ese correo")

    nuevo = UsuarioAccesoModel(
        correo=usuario.correo,
        contrasena=usuario.contrasena,
        rol=usuario.rol,
        organizacion_id=usuario.organizacion_id,
        es_admin=usuario.es_admin
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@app.get("/usuarios-acceso", response_model=List[UsuarioAccesoSalida])
def listar_usuarios_acceso(request: Request, db: Session = Depends(get_db)):
    usuario_id = request.headers.get("X-Usuario-Id")
    if not usuario_id:
        raise HTTPException(status_code=401, detail="No autenticado")

    usuario = db.query(UsuarioAccesoModel).filter(UsuarioAccesoModel.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    # Si es admin global, regresa todos los usuarios de acceso
    if usuario.rol == "admin" and not usuario.organizacion_id:
        return db.query(UsuarioAccesoModel).all()

    # Si es cliente o admin de una organización, solo regresa los de su organización
    return db.query(UsuarioAccesoModel).filter(UsuarioAccesoModel.organizacion_id == usuario.organizacion_id).all()



@app.post("/login")
def login(datos: UsuarioAccesoCrear, db: Session = Depends(get_db)):
    usuario = db.query(UsuarioAccesoModel).filter(UsuarioAccesoModel.correo == datos.correo).first()
    if not usuario or usuario.contrasena != datos.contrasena:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    return {
        "mensaje": "Login exitoso",
        "usuario_id": usuario.id,
        "correo": usuario.correo,
        "rol": usuario.rol,
        "organizacion_id": usuario.organizacion_id
    }


@app.put("/usuarios-acceso/{usuario_id}", response_model=UsuarioAccesoSalida)
def editar_usuario_acceso(
    usuario_id: int,
    datos: UsuarioAccesoCrear,
    request: Request,
    db: Session = Depends(get_db)
):
    organizacion_id = obtener_organizacion_usuario(request)
    usuario = db.query(UsuarioAccesoModel).filter(
        UsuarioAccesoModel.id == usuario_id,
        UsuarioAccesoModel.organizacion_id == organizacion_id
    ).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.correo = datos.correo
    usuario.contrasena = datos.contrasena
    usuario.rol = datos.rol
    usuario.organizacion_id = datos.organizacion_id
    usuario.es_admin = datos.es_admin

    db.commit()
    db.refresh(usuario)
    return usuario


@app.delete("/usuarios-acceso/{usuario_id}")
def eliminar_usuario_acceso(usuario_id: int, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    usuario = db.query(UsuarioAccesoModel).filter(
        UsuarioAccesoModel.id == usuario_id,
        UsuarioAccesoModel.organizacion_id == organizacion_id
    ).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()
    return {"mensaje": "Usuario eliminado"}


# === ORGANIZACIONES (Multitenant) ===

@app.post("/organizaciones", response_model=OrganizacionSalida)
def crear_organizacion(org: OrganizacionCrear, db: Session = Depends(get_db)):
    existente = db.query(Organizacion).filter(Organizacion.nombre == org.nombre).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe una organización con ese nombre.")
    
    nueva_org = Organizacion(nombre=org.nombre)
    db.add(nueva_org)
    db.commit()
    db.refresh(nueva_org)
    return nueva_org

@app.get("/organizaciones", response_model=List[OrganizacionSalida])
def listar_organizaciones(request: Request, db: Session = Depends(get_db)):
    usuario_id = request.headers.get("X-Usuario-Id")
    if not usuario_id:
        raise HTTPException(status_code=401, detail="Usuario no identificado")

    usuario = db.query(UsuarioAccesoModel).filter(UsuarioAccesoModel.id == int(usuario_id)).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if usuario.es_admin:
        return db.query(Organizacion).all()
    else:
        return db.query(Organizacion).filter(Organizacion.id == usuario.organizacion_id).all()
    

    # === MEDIOS DE DIFUSIÓN ===

@app.get("/medios-difusion", response_model=List[MedioDifusionSalida])
def listar_medios_difusion(request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    return db.query(MedioDifusionModel).filter(MedioDifusionModel.organizacion_id == organizacion_id).all()

@app.post("/medios-difusion", response_model=MedioDifusionSalida)
def crear_medio_difusion(medio: MedioDifusionCrear, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    data = medio.dict()
    data["organizacion_id"] = organizacion_id
    nuevo = MedioDifusionModel(**data)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@app.put("/medios-difusion/{medio_id}", response_model=MedioDifusionSalida)
def actualizar_medio_difusion(medio_id: int, medio: MedioDifusionCrear, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    existente = db.query(MedioDifusionModel).filter(
        MedioDifusionModel.id == medio_id,
        MedioDifusionModel.organizacion_id == organizacion_id
    ).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Medio no encontrado")
    
    for campo, valor in medio.dict().items():
        setattr(existente, campo, valor)
    existente.organizacion_id = organizacion_id

    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/medios-difusion/{medio_id}")
def eliminar_medio_difusion(medio_id: int, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    medio = db.query(MedioDifusionModel).filter(
        MedioDifusionModel.id == medio_id,
        MedioDifusionModel.organizacion_id == organizacion_id
    ).first()
    if not medio:
        raise HTTPException(status_code=404, detail="Medio no encontrado")
    db.delete(medio)
    db.commit()
    return {"mensaje": "Medio de difusión eliminado"}


# === CATÁLOGO DE CIERRES (sanciones, premios, medidas) ===

@app.get("/catalogo-cierres", response_model=List[CatalogoCierreSalida])
def listar_cierres(request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    return db.query(CatalogoCierreModel).filter(CatalogoCierreModel.organizacion_id == organizacion_id).all()

@app.post("/catalogo-cierres", response_model=CatalogoCierreSalida)
def crear_cierre(cierre: CatalogoCierreCrear, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    data = cierre.dict()
    data["organizacion_id"] = organizacion_id
    nuevo = CatalogoCierreModel(**data)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@app.put("/catalogo-cierres/{cierre_id}", response_model=CatalogoCierreSalida)
def actualizar_cierre(cierre_id: int, cierre: CatalogoCierreCrear, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    existente = db.query(CatalogoCierreModel).filter(
        CatalogoCierreModel.id == cierre_id,
        CatalogoCierreModel.organizacion_id == organizacion_id
    ).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Cierre no encontrado")

    for campo, valor in cierre.dict().items():
        setattr(existente, campo, valor)
    existente.organizacion_id = organizacion_id

    db.commit()
    db.refresh(existente)
    return existente

@app.delete("/catalogo-cierres/{cierre_id}")
def eliminar_cierre(cierre_id: int, request: Request, db: Session = Depends(get_db)):
    organizacion_id = obtener_organizacion_usuario(request)
    cierre = db.query(CatalogoCierreModel).filter(
        CatalogoCierreModel.id == cierre_id,
        CatalogoCierreModel.organizacion_id == organizacion_id
    ).first()
    if not cierre:
        raise HTTPException(status_code=404, detail="Elemento de cierre no encontrado")
    db.delete(cierre)
    db.commit()
    return {"mensaje": "Elemento del catálogo de cierres eliminado"}

# === BANDERAS===

@app.get("/banderas", response_model=List[BanderaSalida])
def obtener_banderas(x_organizacion_id: int = Header(...), db: Session = Depends(get_db)):
    return db.query(BanderaModel).filter(BanderaModel.organizacion_id == x_organizacion_id).all()

@app.post("/banderas", response_model=BanderaSalida)
def crear_bandera(bandera: BanderaCrear, db: Session = Depends(get_db)):
    nueva = BanderaModel(**bandera.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@app.put("/banderas/{bandera_id}", response_model=BanderaSalida)
def actualizar_bandera(bandera_id: int, datos: BanderaCrear, db: Session = Depends(get_db)):
    bandera = db.query(BanderaModel).filter(BanderaModel.id == bandera_id).first()
    if not bandera:
        raise HTTPException(status_code=404, detail="Bandera no encontrada")
    for campo, valor in datos.dict().items():
        setattr(bandera, campo, valor)
    db.commit()
    db.refresh(bandera)
    return bandera

@app.delete("/banderas/{bandera_id}")
def eliminar_bandera(bandera_id: int, db: Session = Depends(get_db)):
    bandera = db.query(BanderaModel).filter(BanderaModel.id == bandera_id).first()
    if not bandera:
        raise HTTPException(status_code=404, detail="Bandera no encontrada")
    db.delete(bandera)
    db.commit()
    return {"ok": True}