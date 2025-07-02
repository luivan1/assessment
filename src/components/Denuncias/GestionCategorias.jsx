import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

function GestionCategorias() {
  const [nuevas, setNuevas] = useState({ titulo: "", descripcion: "" });
  const [categorias, setCategorias] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  const cargarCategorias = () => {
    axios
      .get("http://localhost:8000/categorias-denuncia")
      .then((res) => setCategorias(res.data))
      .catch((err) => console.error("Error al obtener categorías:", err));
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const guardarCategoria = () => {
    if (!nuevas.titulo.trim()) return;

    axios
      .post("http://localhost:8000/categorias-denuncia", {
        ...nuevas,
        cliente_id: 1,
        orden: categorias.length,
      })
      .then(() => {
        setNuevas({ titulo: "", descripcion: "" });
        cargarCategorias();
      });
  };

  const guardarEdicion = (id) => {
    const actual = categorias.find((c) => c.id === id);
    axios
      .put(`http://localhost:8000/categorias-denuncia/${id}`, {
        ...actual,
        cliente_id: 1,
      })
      .then(() => {
        setEditandoId(null);
        cargarCategorias();
      });
  };

  const eliminarCategoria = (id) => {
    if (!confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    axios.delete(`http://localhost:8000/categorias-denuncia/${id}`).then(() => cargarCategorias());
  };

  return (
    <div className="mb-10 max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-extrabold mb-4 text-gray-800 tracking-tight">Categorías de Denuncia</h2>
      <hr className="mb-6 border-gray-300" />

      <div className="mb-8 space-y-3">
        <p className="font-semibold text-lg text-gray-700">Agregar nueva categoría</p>
        <Input
          placeholder="Título"
          value={nuevas.titulo}
          onChange={(e) => setNuevas((prev) => ({ ...prev, titulo: e.target.value }))}
          className="rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
        />
        <Textarea
          placeholder="Descripción"
          value={nuevas.descripcion}
          onChange={(e) => setNuevas((prev) => ({ ...prev, descripcion: e.target.value }))}
          className="rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          onClick={() => setModoAgregar(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Agregar nueva categoría de denuncia
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categorias.map((cat) => (
          <div
            key={cat.id}
            className="p-5 border border-gray-300 rounded-lg shadow-sm bg-gray-50 relative hover:shadow-md transition-shadow"
          >
            {editandoId === cat.id ? (
              <>
                <Input
                  className="mb-3 rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
                  value={cat.titulo}
                  onChange={(e) =>
                    setCategorias((prev) =>
                      prev.map((c) => (c.id === cat.id ? { ...c, titulo: e.target.value } : c))
                    )
                  }
                />
                <Textarea
                  className="mb-4 rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={cat.descripcion}
                  onChange={(e) =>
                    setCategorias((prev) =>
                      prev.map((c) => (c.id === cat.id ? { ...c, descripcion: e.target.value } : c))
                    )
                  }
                />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setEditandoId(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => guardarEdicion(cat.id)}>Guardar</Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-blue-800 mb-2">
                  {categorias.indexOf(cat) + 1}. {cat.titulo}
                </p>
                <p className="text-gray-600 whitespace-pre-wrap mb-4">{cat.descripcion}</p>
                <div className="absolute top-3 right-3 flex gap-3">
                  <button
                    onClick={() => setEditandoId(cat.id)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    aria-label="Editar categoría"
                    title="Editar categoría"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => eliminarCategoria(cat.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    aria-label="Eliminar categoría"
                    title="Eliminar categoría"
                  >
                    <Trash2 size={20} />
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

export default GestionCategorias;