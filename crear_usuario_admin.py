from database import SessionLocal
from models import UsuarioAcceso

db = SessionLocal()
usuario = UsuarioAcceso(
    correo="admin@ethicsglobal.com",  # pon el correo que quieras usar
    contrasena="1234",                # pon una contraseña sencilla para probar
    rol="admin"
)
db.add(usuario)
db.commit()
print("Usuario admin creado.")