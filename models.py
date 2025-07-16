from sqlalchemy import Column, Integer, String, Boolean, JSON, ARRAY, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

# === MODELO: Cliente ===
class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    # Aquí podrías agregar más campos si quieres (email de contacto, etc.)

    

# === MODELO: Centro de Trabajo ===
class CentroTrabajo(Base):
    __tablename__ = "centros_trabajo"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    pais = Column(String, nullable=False)
    estado = Column(String, nullable=False)
    ciudad = Column(String, nullable=False)
    direccion = Column(String)
    cp = Column(String)
    telefono = Column(String)
    filtros_personalizados = Column(JSONB, default=dict)
    organizacion_id = Column(Integer, nullable=False)

# === MODELO: Filtro Personalizado ===
class FiltroPersonalizado(Base):
    __tablename__ = "filtros_personalizados"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, unique=True)
    valores = Column(JSONB, nullable=False)
    organizacion_id = Column(Integer, nullable=False)

class ConfiguracionFiltros(Base):
    __tablename__ = "configuracion_filtros"

    id = Column(Integer, primary_key=True, index=True)
    organizacion_id = Column(Integer, nullable=False, index=True)
    filtros_activos = Column(ARRAY(String), nullable=False, default=[])
    orden_filtros = Column(ARRAY(String), nullable=False, default=[])

# === MODELO: Tipo de Reportante ===
class TipoReportante(Base):
    __tablename__ = "tipos_reportante"

    id = Column(Integer, primary_key=True, index=True)
    organizacion_id = Column(Integer, nullable=False)  # ← CAMBIO AQUÍ
    tipo_base = Column(String, nullable=False)
    etiqueta = Column(String, nullable=False)
    etiqueta_original = Column(String, nullable=True)
    anonimo = Column(Boolean, default=True)
    orden = Column(Integer, nullable=True)
    campos_identidad = Column(JSONB, default=list)

# === MODELO: Catálogo de Cierres (sanciones, premios, medidas correctivas) ===
class CierreCatalogo(Base):
    __tablename__ = "catalogo_cierres"

    id = Column(Integer, primary_key=True, index=True)
    organizacion_id = Column(Integer, nullable=False)  # ← CAMBIO AQUÍ
    categoria = Column(String, nullable=False)
    etiqueta = Column(String, nullable=False)
    etiqueta_original = Column(String, nullable=True)
    descripcion = Column(String)
    visible_en_reporte = Column(Boolean, default=True)
    orden = Column(Integer)


  # === MODELO: Medios de Difusión ===
class MedioDifusion(Base):
    __tablename__ = "medios_difusion"

    id = Column(Integer, primary_key=True, index=True)
    organizacion_id = Column(Integer, nullable=False)  # ← CAMBIO AQUÍ
    categoria = Column(String, nullable=False)
    etiqueta = Column(String, nullable=False)
    etiqueta_original = Column(String, nullable=True)
    visible_en_reporte = Column(Boolean, default=True)
    orden = Column(Integer, nullable=True)
    descripcion = Column(String, nullable=True)


    # === MODELO: Denuncia ===
class Denuncia(Base):
    __tablename__ = "denuncias"

    id = Column(Integer, primary_key=True, index=True)
    organizacion_id = Column(Integer, nullable=False)  # ← CAMBIO AQUÍ
    categoria_id = Column(Integer, nullable=False)
    titulo = Column(String, nullable=False)
    titulo_original = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    ejemplos = Column(JSONB, nullable=True)
    tipos_reportante = Column(JSONB, nullable=True)
    preguntaAdicional = Column(String, nullable=True)
    anonimo = Column(Boolean, default=False)
    visible_en_reporte = Column(Boolean, default=True)
    orden = Column(Integer, nullable=True)
    

    # === MODELO: Sugerencia ===
class Sugerencia(Base):
    __tablename__ = "sugerencias"

    id = Column(Integer, primary_key=True, index=True)
    organizacion_id = Column(Integer, nullable=False)  # ← CAMBIO AQUÍ
    titulo = Column(String, nullable=False)
    descripcion = Column(String)
    titulo_original = Column(String)

    # === MODELO: Pregunta ===
class Pregunta(Base):
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True, index=True)
    organizacion_id = Column(Integer, nullable=False)  # ← CAMBIO AQUÍ
    titulo = Column(String, nullable=False)
    descripcion = Column(String)
    titulo_original = Column(String)


        # === MODELO: DATOS GENERALES ===


class DatosGenerales(Base):
    __tablename__ = "datos_generales"

    id = Column(Integer, primary_key=True, index=True)
    nombre_comercial = Column(String, nullable=True)
    descripcion = Column(String, nullable=True)
    dominio = Column(String, nullable=True)
    logotipo_url = Column(String, nullable=True)

    plan = Column(String, nullable=True)
    atencion_personalizada = Column(Boolean, default=False)
    numero_empleados = Column(Integer, nullable=True)
    giro = Column(String, nullable=True)

    paises_operacion = Column(JSONB, nullable=True)  # lista de códigos o nombres de países
    idiomas_operacion = Column(JSONB, nullable=True)  # lista de idiomas

    nombre_usuario_admin = Column(String, nullable=True)
    correo_usuario_admin = Column(String, nullable=True)
    telefono_usuario_admin = Column(String, nullable=True)
    acceso_modulo_contable = Column(Boolean, default=False)
    pais = Column(String, nullable=True)
    estado = Column(String, nullable=True)
    ciudad = Column(String, nullable=True)
    cp = Column(String, nullable=True)
    usuario_foto_url = Column(String, nullable=True)
    organizacion_id = Column(Integer, nullable=False)


    # === MODELO: Categoría de Denuncia ===
class CategoriaDenuncia(Base):
    __tablename__ = "categorias_denuncia"

    id = Column(Integer, primary_key=True, index=True)
    organizacion_id = Column(Integer, nullable=False)  # ← CAMBIO AQUÍ
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    orden = Column(Integer, nullable=True)


    # === MODELO: Tipo de Denuncia Template ===

class TipoDenunciaTemplate(Base):
    __tablename__ = "tipo_denuncia_template"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    ejemplos = Column(ARRAY(String), nullable=True)
    sugeridos_reportantes = Column(ARRAY(String), nullable=True)
    categoria_original = Column(String, nullable=True)  # <- ESTO ES CLAVE


    # === MODELO: Usuario del sistema ===
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=True)
    correo = Column(String, unique=True, nullable=False)
    telefono = Column(String, nullable=True)
    genero = Column(String, nullable=True)
    fecha_nacimiento = Column(String, nullable=True)
    direccion = Column(String, nullable=True)
    cp = Column(String, nullable=True)
    pais = Column(String, nullable=True)
    estado = Column(String, nullable=True)
    municipio = Column(String, nullable=True)
    foto_url = Column(String, nullable=True)
    contrasena = Column(String, nullable=True)
    permisos = Column(JSONB, nullable=False, default=dict)

    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=False)
    organizacion = relationship("Organizacion", back_populates="usuarios")


    # === MODELO: Usuario de acceso al sistema (para login) ===
class UsuarioAcceso(Base):
    __tablename__ = "usuarios_acceso"

    id = Column(Integer, primary_key=True, index=True)
    correo = Column(String, unique=True, nullable=False)
    contrasena = Column(String, nullable=False)
    es_admin = Column(Boolean, default=False)
    rol = Column(String, nullable=False, default="cliente")

    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=True)
    organizacion = relationship("Organizacion", back_populates="usuarios_acceso")

# === MODELO: Organizacion para multitenant ===
class Organizacion(Base):
    __tablename__ = "organizaciones"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    usuarios_acceso = relationship("UsuarioAcceso", back_populates="organizacion")
    usuarios = relationship("Usuario", back_populates="organizacion")


# === MODELO: Componente Banderas ===

class Bandera(Base):
    __tablename__ = "banderas"

    id = Column(Integer, primary_key=True, index=True)
    color = Column(String, nullable=False)
    titulo = Column(String, nullable=False)
    organizacion_id = Column(Integer, ForeignKey("organizaciones.id"), nullable=False)