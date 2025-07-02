import { useState, useEffect } from "react";
import MainApp from "./MainApp";
import Login from "./Login";

export default function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Siempre revisar el localStorage en cada carga
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    } else {
      setUsuario(null);
    }
  }, []);

  const handleLogin = (usuarioData) => {
    setUsuario(usuarioData);
    localStorage.setItem("usuario", JSON.stringify(usuarioData));
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
  };

  // 👇 ¡Esto es lo importante!
  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  return <MainApp usuario={usuario} onLogout={handleLogout} />;
}