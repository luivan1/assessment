import { useState, useEffect } from "react";
import MainApp from "./MainApp";
import Login from "./Login";
import SeleccionarOrganizacion from "./SeleccionarOrganizacion";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [organizacionSeleccionada, setOrganizacionSeleccionada] = useState(false);

  useEffect(() => {
    const usuarioLocal = localStorage.getItem("usuario");
    if (usuarioLocal) {
      try {
        const user = JSON.parse(usuarioLocal);
        setUsuario(user);

        // Admin sin organización aún no está listo
        if (user.rol === "admin" && !user.organizacion_id) {
          setOrganizacionSeleccionada(false);
        } else {
          setOrganizacionSeleccionada(true);
        }
      } catch (err) {
        console.error("Error al parsear usuario del localStorage", err);
        localStorage.removeItem("usuario");
      }
    }
  }, []);

  const handleLogin = (usuarioData) => {
    setUsuario(usuarioData);
    localStorage.setItem("usuario", JSON.stringify(usuarioData));

    if (usuarioData.rol === "admin" && !usuarioData.organizacion_id) {
      setOrganizacionSeleccionada(false);
    } else {
      setOrganizacionSeleccionada(true);
    }
  };

  const handleSeleccionOrganizacion = () => {
    const usuarioActualizado = localStorage.getItem("usuario");
    if (usuarioActualizado) {
      const user = JSON.parse(usuarioActualizado);
      setUsuario(user);
      setOrganizacionSeleccionada(true);
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    setOrganizacionSeleccionada(false);
    localStorage.removeItem("usuario");
  };

  // No ha iniciado sesión
  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  // Admin sin organización aún debe seleccionar una
  if (usuario.rol === "admin" && !organizacionSeleccionada) {
    return (
      <SeleccionarOrganizacion
        usuario={usuario}
        onSeleccionar={handleSeleccionOrganizacion}
      />
    );
  }

  // Usuario listo para entrar al sistema
  return <MainApp usuario={usuario} onLogout={handleLogout} />;
}