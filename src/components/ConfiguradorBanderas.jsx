import { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Save, Trash2, Plus } from "lucide-react";

const COLORES_DISPONIBLES = [
  { nombre: "Rojo", codigo: "#e53935" },
  { nombre: "Naranja", codigo: "#fb8c00" },
  { nombre: "Amarillo", codigo: "#fdd835" },
  { nombre: "Verde", codigo: "#43a047" },
  { nombre: "Azul cielo", codigo: "#29b6f6" },
  { nombre: "Azul rey", codigo: "#1e88e5" },
  { nombre: "Morado", codigo: "#8e24aa" },
  { nombre: "Rosa", codigo: "#d81b60" },
  { nombre: "Gris oscuro", codigo: "#616161" },
  { nombre: "Negro suave", codigo: "#212121" },
  { nombre: "Cyan", codigo: "#00acc1" },
  { nombre: "Verde oliva", codigo: "#827717" },
  { nombre: "Naranja claro", codigo: "#ffcc80" },
  { nombre: "Lila", codigo: "#ce93d8" },
  { nombre: "Azul marino", codigo: "#3949ab" },
  { nombre: "Verde menta", codigo: "#80cbc4" },
  { nombre: "Café", codigo: "#8d6e63" },
  { nombre: "Gris claro", codigo: "#e0e0e0" },
  { nombre: "Rojo coral", codigo: "#ef5350" },
  { nombre: "Mostaza", codigo: "#fbc02d" }
];

export default function ConfiguradorBanderas() {
  const [banderas, setBanderas] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(null);
  const [nuevoColor, setNuevoColor] = useState(COLORES_DISPONIBLES[0].codigo);
  const [nuevoTitulo, setNuevoTitulo] = useState("");

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const ORGANIZACION_ID = usuario.organizacion_id;

  const cargarBanderas = async () => {
    try {
      const res = await axios.get("http://localhost:8000/banderas", {
        headers: { "X-Organizacion-ID": ORGANIZACION_ID },
      });
      setBanderas(res.data);
    } catch (err) {
      console.error("Error al cargar banderas:", err);
    }
  };

  const agregarBandera = async () => {
    if (!nuevoTitulo.trim()) return;
    try {
      const nueva = {
        color: nuevoColor,
        titulo: nuevoTitulo,
        organizacion_id: ORGANIZACION_ID,
      };
      const res = await axios.post("http://localhost:8000/banderas", nueva, {
        headers: { "X-Organizacion-ID": ORGANIZACION_ID },
      });
      setBanderas(prev => [...prev, res.data]);
      setNuevoTitulo("");
      setNuevoColor(COLORES_DISPONIBLES[0].codigo);
    } catch (err) {
      console.error("Error al agregar bandera:", err);
      alert("Error al agregar bandera: " + err.message);
    }
  };

  const actualizarBandera = async (bandera) => {
    try {
      const res = await axios.put(`http://localhost:8000/banderas/${bandera.id}`, bandera, {
        headers: { "X-Organizacion-ID": ORGANIZACION_ID },
      });
      setBanderas(prev => prev.map(b => b.id === bandera.id ? res.data : b));
      setModoEdicion(null);
    } catch (err) {
      console.error("Error al actualizar bandera:", err);
    }
  };

  const eliminarBandera = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/banderas/${id}`, {
        headers: { "X-Organizacion-ID": ORGANIZACION_ID },
      });
      setBanderas(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error("Error al eliminar bandera:", err);
    }
  };

  useEffect(() => {
    cargarBanderas();
  }, []);

  return (
    <div className="mb-12">
      <h3 className="text-xl font-semibold text-pink-700 mb-2">Banderas</h3>
      <p className="text-gray-600 italic mb-4">
        Configura las banderas que usarás para marcar elementos clave en tu sistema. Por ejemplo: “Denuncias críticas” o “Seguimiento urgente”.
      </p>

      {/* Formulario para agregar bandera */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select
          value={nuevoColor}
          onChange={e => setNuevoColor(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {COLORES_DISPONIBLES.map(color => (
            <option key={color.codigo} value={color.codigo}>
              🚩 {color.nombre} - {color.codigo}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Nombre de la bandera"
          value={nuevoTitulo}
          onChange={e => setNuevoTitulo(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button
          onClick={agregarBandera}
          className="bg-pink-600 text-white px-3 py-1 rounded text-sm"
        >
          <Plus size={16} className="inline-block mr-1" /> Agregar
        </button>
      </div>

      {/* Lista de banderas agregadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {banderas.map(b => (
          <div
            key={b.id}
            className={`relative p-4 rounded shadow border-l-8`}
            style={{ borderColor: b.color }}
          >
            {modoEdicion === b.id ? (
              <>
                <select
                  value={b.color}
                  onChange={e =>
                    setBanderas(prev =>
                      prev.map(i => i.id === b.id ? { ...i, color: e.target.value } : i)
                    )
                  }
                  className="border rounded px-2 py-1 mb-2 w-full"
                >
                  {COLORES_DISPONIBLES.map(color => (
                    <option key={color.codigo} value={color.codigo}>
                      🚩 {color.nombre} - {color.codigo}
                    </option>
                  ))}
                </select>
                <input
                  value={b.titulo}
                  onChange={e =>
                    setBanderas(prev =>
                      prev.map(i => i.id === b.id ? { ...i, titulo: e.target.value } : i)
                    )
                  }
                  className="border p-2 w-full mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => actualizarBandera(b)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    <Save size={16} className="inline-block mr-1" /> Guardar
                  </button>
                  <button
                    onClick={() => setModoEdicion(null)}
                    className="bg-gray-300 px-3 py-1 rounded text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-medium">{b.titulo}</p>
                <p className="text-xs italic text-red-600 mt-1">{b.color}</p>
                <div className="absolute top-2 right-2 flex gap-2">
                  <button onClick={() => setModoEdicion(b.id)} className="text-blue-600">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => eliminarBandera(b.id)} className="text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}