from sqlalchemy import Column, Integer, String, Boolean, JSON
from sqlalchemy.dialects.postgresql import JSONB
from database import Base

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
    filtros_personalizados = Column(JSONB)

# === MODELO: Filtro Personalizado ===
class FiltroPersonalizado(Base):
    __tablename__ = "filtros_personalizados"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, unique=True)
    valores = Column(JSONB, nullable=False)

# === MODELO: Tipo de Reportante ===
class TipoReportante(Base):
    __tablename__ = "tipos_reportante"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, nullable=False)
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
    cliente_id = Column(Integer, nullable=False)
    categoria = Column(String, nullable=False)  # "sancion", "premio", "medida", etc.
    etiqueta = Column(String, nullable=False)
    etiqueta_original = Column(String, nullable=True)
    descripcion = Column(String)
    visible_en_reporte = Column(Boolean, default=True)
    orden = Column(Integer)


  # === MODELO: Medios de Difusión ===
class MedioDifusion(Base):
    __tablename__ = "medios_difusion"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, nullable=False)
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
    cliente_id = Column(Integer, nullable=False)
    categoria = Column(String, nullable=False)
    titulo = Column(String, nullable=False)
    titulo_original = Column(String, nullable=False)
    descripcion = Column(String, nullable=True)
    ejemplos = Column(JSONB, nullable=True)  # Lista de ejemplos como JSON
    tipos_reportante = Column(JSONB, nullable=True)  # Lista de IDs o etiquetas
    visible_en_reporte = Column(Boolean, default=True)
    orden = Column(Integer, nullable=True)

    # === MODELO: Sugerencia ===
class Sugerencia(Base):
    __tablename__ = "sugerencias"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, nullable=False)
    titulo = Column(String, nullable=False)
    descripcion = Column(String)
    titulo_original = Column(String)

    # === MODELO: Pregunta ===
class Pregunta(Base):
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, nullable=False)
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