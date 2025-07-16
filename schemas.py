from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, List
from datetime import datetime

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
    organizacion_id: int  # ✅ Necesario para multitenencia

class CentroTrabajoSalida(CentroTrabajoBase):
    id: int
    organizacion_id: int  # ✅ También útil para respuestas

    class Config:
        orm_mode = True

# --- Organización ---

class OrganizacionBase(BaseModel):
    nombre: str

class OrganizacionCrear(OrganizacionBase):
    pass

class OrganizacionSalida(OrganizacionBase):
    id: int
    fecha_creacion: datetime

    class Config:
        orm_mode = True

# --- Filtros Personalizados ---

class FiltroBase(BaseModel):
    nombre: str
    valores: List[str]

class FiltroCrear(FiltroBase):
    organizacion_id: int  # ✅ Necesario

class FiltroSalida(FiltroBase):
    id: int
    organizacion_id: int  # ✅ También útil

    class Config:
        orm_mode = True

# --- Configuración de Filtros (activos y orden) ---

class ConfiguracionFiltrosBase(BaseModel):
    filtros_activos: List[str]
    orden_filtros: List[str]
    organizacion_id: int

class ConfiguracionFiltrosCrear(ConfiguracionFiltrosBase):
    pass

class ConfiguracionFiltrosSalida(ConfiguracionFiltrosBase):
    id: int

    class Config:
        orm_mode = True

# --- Tipos de Reportante ---

class TipoReportanteBase(BaseModel):
    organizacion_id: int  # ✅ Reemplaza cliente_id en sistemas multitenant
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
    organizacion_id: int
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
    organizacion_id: int
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
    categoria_id: int
    titulo: str
    titulo_original: Optional[str] = None
    descripcion: Optional[str] = None
    ejemplos: Optional[List[str]] = []
    preguntaAdicional: Optional[str] = ""
    anonimo: bool = False
    tipos_reportante: Optional[List[str]] = []
    visible_en_reporte: bool = True
    orden: Optional[int] = None

class DenunciaCrear(DenunciaBase):
    pass

class DenunciaSalida(DenunciaBase):
    id: int
    titulo_original: str
    categoria_titulo: Optional[str] = None

    class Config:
        orm_mode = True

# --- Sugerencias ---

class SugerenciaBase(BaseModel):
    organizacion_id: int
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
    organizacion_id: int
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
    plan: Optional[str] = None
    atencion_personalizada: Optional[bool] = None
    numero_empleados: Optional[int] = None
    giro: Optional[str] = None
    idiomas_operacion: Optional[List[str]] = None
    paises_operacion: Optional[List[str]] = None
    nombre_comercial: Optional[str] = None
    descripcion: Optional[str] = None
    dominio: Optional[str] = None
    logotipo_url: Optional[str] = None
    nombre_usuario_admin: Optional[str] = None
    correo_usuario_admin: Optional[str] = None
    telefono_usuario_admin: Optional[str] = None
    pais: Optional[str] = None
    estado: Optional[str] = None
    cp: Optional[str] = None
    ciudad: Optional[str] = None
    acceso_modulo_contable: Optional[bool] = None
    usuario_foto_url: Optional[str] = None
    organizacion_id: int  # Este sí es obligatorio para hacer el filtro multitenant

class DatosGeneralesSalida(DatosGeneralesCrear):
    id: int

    class Config:
        orm_mode = True

# --- Categoría de Denuncia ---

class CategoriaDenunciaBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = ""
    orden: Optional[int] = None

class CategoriaDenunciaCrear(CategoriaDenunciaBase):
    pass

class CategoriaDenunciaSalida(CategoriaDenunciaBase):
    id: int
    organizacion_id: int  # solo aquí

    class Config:
        orm_mode = True



# --- Tipo de denuncia template ---

class TipoDenunciaTemplateCrear(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    ejemplos: Optional[List[str]] = []
    sugeridos_reportantes: Optional[List[str]] = []
    categoria_original: Optional[str] = ""

    class Config:
        from_attributes = True

class TipoDenunciaTemplateOut(TipoDenunciaTemplateCrear):
    id: int
    categoria_original: Optional[str] = None

    class Config:
        from_attributes = True

# --- Usuario del sistema ---

class UsuarioBase(BaseModel):
    nombre: str
    correo: str
    contrasena: str
    organizacion_id: int  # ✅ FALTABA AQUÍ
    apellido: Optional[str] = None
    telefono: Optional[str] = None
    genero: Optional[str] = None
    fechaNacimiento: Optional[str] = None
    direccion: Optional[str] = None
    cp: Optional[str] = None
    pais: Optional[str] = None
    estado: Optional[str] = None
    municipio: Optional[str] = None
    foto: Optional[str] = None
    permisos: Dict = {}

class UsuarioCrear(UsuarioBase):
    pass

class UsuarioSalida(BaseModel):
    id: int
    nombre: str
    correo: EmailStr
    organizacion_id: int  # ✅ FALTABA AQUÍ TAMBIÉN
    apellido: Optional[str] = None
    telefono: Optional[str] = None
    genero: Optional[str] = None
    fechaNacimiento: Optional[str] = None
    direccion: Optional[str] = None
    cp: Optional[str] = None
    pais: Optional[str] = None
    estado: Optional[str] = None
    municipio: Optional[str] = None
    foto: Optional[str] = None
    permisos: Dict

    class Config:
        orm_mode = True

# --- Usuario de acceso al sistema (login) ---

class UsuarioAccesoBase(BaseModel):
    correo: EmailStr
    rol: str = "cliente"

class UsuarioAccesoCrear(UsuarioAccesoBase):
    contrasena: str
    es_admin: bool = False
    organizacion_id: Optional[int] = None

class UsuarioAccesoSalida(UsuarioAccesoBase):
    id: int
    es_admin: bool = False
    rol: str
    organizacion_id: Optional[int] = None
    organizacion: Optional['OrganizacionSalida'] = None

    class Config:
        orm_mode = True

# --- Banderas ---

class BanderaBase(BaseModel):
    color: str
    titulo: str

class BanderaCrear(BanderaBase):
    organizacion_id: int

class BanderaSalida(BanderaBase):
    id: int
    organizacion_id: int

    class Config:
        orm_mode = True