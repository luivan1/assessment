from pydantic import BaseModel
from typing import Optional, Dict, List

# --- Centro de Trabajo ---

class CentroTrabajoBase(BaseModel):
    nombre: str
    pais: str
    estado: str
    ciudad: str
    direccion: Optional[str] = None
    cp: Optional[str] = None
    telefono: Optional[str] = None
    filtros_personalizados: Optional[Dict[str, str]] = {}

class CentroTrabajoCrear(CentroTrabajoBase):
    pass

class CentroTrabajoSalida(CentroTrabajoBase):
    id: int

    class Config:
        orm_mode = True

# --- Filtros Personalizados ---

class FiltroBase(BaseModel):
    nombre: str
    valores: List[str]

class FiltroCrear(FiltroBase):
    pass

class FiltroSalida(FiltroBase):
    id: int

    class Config:
        orm_mode = True

# --- Tipos de Reportante ---

class TipoReportanteBase(BaseModel):
    cliente_id: int
    tipo_base: str
    etiqueta: str
    anonimo: bool = False
    orden: Optional[int] = None
    campos_identidad: List[str] = []

class TipoReportanteCrear(TipoReportanteBase):
    pass

class TipoReportanteSalida(TipoReportanteBase):
    id: int
    etiqueta_original: Optional[str] = None

    class Config:
        orm_mode = True

# --- Catálogo de Cierres ---

class CatalogoCierreBase(BaseModel):
    cliente_id: int
    categoria: str
    etiqueta: str
    etiqueta_original: Optional[str] = None
    visible_en_reporte: bool = True
    orden: Optional[int] = None
    descripcion: Optional[str] = None

class CatalogoCierreCrear(CatalogoCierreBase):
    pass

class CatalogoCierreSalida(CatalogoCierreBase):
    id: int

    class Config:
        orm_mode = True

# --- Medios de Difusión ---

class MedioDifusionBase(BaseModel):
    cliente_id: int
    categoria: str
    etiqueta: str
    etiqueta_original: Optional[str] = None
    visible_en_reporte: bool = True
    orden: Optional[int] = None
    descripcion: Optional[str] = None

class MedioDifusionCrear(MedioDifusionBase):
    pass

class MedioDifusionSalida(MedioDifusionBase):
    id: int

    class Config:
        orm_mode = True

# --- Denuncias ---

class DenunciaBase(BaseModel):
    cliente_id: int
    categoria: str
    titulo: str
    descripcion: Optional[str] = None
    ejemplos: Optional[List[str]] = []
    tipos_reportante: Optional[List[str]] = []
    visible_en_reporte: bool = True
    orden: Optional[int] = None

class DenunciaCrear(DenunciaBase):
    pass

class DenunciaSalida(DenunciaBase):
    id: int
    titulo_original: str

    class Config:
        orm_mode = True

# --- Sugerencias ---

class SugerenciaBase(BaseModel):
    cliente_id: int
    titulo: str
    descripcion: Optional[str] = None
    titulo_original: Optional[str] = None

class SugerenciaCrear(SugerenciaBase):
    pass

class SugerenciaSalida(SugerenciaBase):
    id: int

    class Config:
        orm_mode = True

# --- Preguntas ---

class PreguntaBase(BaseModel):
    cliente_id: int
    titulo: str
    descripcion: Optional[str] = None
    titulo_original: Optional[str] = None

class PreguntaCrear(PreguntaBase):
    pass

class PreguntaSalida(PreguntaBase):
    id: int

    class Config:
        orm_mode = True

# --- Datos Generales ---

class DatosGeneralesCrear(BaseModel):
    plan: str
    atencion_personalizada: bool
    numero_empleados: int
    giro: str
    idiomas_operacion: List[str]
    paises_operacion: List[str]
    nombre_comercial: str
    descripcion: Optional[str] = None
    dominio: str
    logotipo_url: Optional[str] = None
    nombre_usuario_admin: str
    correo_usuario_admin: str
    telefono_usuario_admin: str
    pais: str
    estado: str
    cp: str
    ciudad: str
    acceso_modulo_contable: bool
    usuario_foto_url: Optional[str] = None

class DatosGeneralesSalida(DatosGeneralesCrear):
    id: int

    class Config:
        orm_mode = True