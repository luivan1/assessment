// GestionCategorias.jsx adaptado a multitenant y corregido
import { useState, useEffect } from 'react';
import { Pencil, Trash2, Save, X } from 'lucide-react';

function GestionCategorias({ categoriasBD, setCategoriasBD }) {
  const [modoAgregar, setModoAgregar] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({ titulo: '', descripcion: '', orden: null });

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const organizacion_id = usuario.organizacion_id;


  const guardarCategoria = () => {

    if (!form.titulo.trim()) {
      alert("El título no puede estar vacío.");
      return;
    }

    const metodo = editandoId ? 'PUT' : 'POST';
    const url = editandoId
      ? `http://localhost:8000/categorias-denuncia/${editandoId}`
      : 'http://localhost:8000/categorias-denuncia';

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    const organizacion_id = usuario.organizacion_id;

    if (!organizacion_id) {
      console.error("❌ organizacion_id inválido:", organizacion_id);
      alert("Error: organizacion_id inválido");
      return;
    }

    const payload = {
      organizacion_id: Number(organizacion_id),
      titulo: form.titulo.trim(),
      descripcion: form.descripcion?.trim() || "",
      orden: Number.isInteger(form.orden) ? form.orden : null
    };


    fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        'X-Organizacion-ID': organizacion_id
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const texto = await res.text();
        if (!res.ok) {
          console.error("❌ Error detallado desde backend:", texto);
          throw new Error(texto);
        }
        return JSON.parse(texto);
      })
      .then((data) => {
        console.log("✅ Categoría guardada con éxito:", data);
        setEditandoId(null);
        setForm({ titulo: '', descripcion: '', orden: null });
        setModoAgregar(false);

        return fetch("http://localhost:8000/categorias-denuncia", {
          headers: {
            "X-Organizacion-ID": organizacion_id
          }
        });
      })
      .then((res) => res.json())
      .then((nuevasCategorias) => {
        setCategoriasBD(nuevasCategorias);
      })
      .catch((error) => {
        console.error("🚨 Error en guardarCategoria:", error);
        alert("Hubo un error al guardar la categoría.");
      });
  };

  const eliminarCategoria = (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return;

    fetch(`http://localhost:8000/categorias-denuncia/${id}`, {
      method: 'DELETE',
      headers: {
        "X-Organizacion-ID": organizacion_id
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al eliminar");
        return fetch("http://localhost:8000/categorias-denuncia", {
          headers: { "X-Organizacion-ID": organizacion_id }
        });
      })
      .then((res) => res.json())
      .then((data) => setCategoriasBD(data))
      .catch((err) => {
        console.error("❌ Error al eliminar categoría:", err);
        alert("Ocurrió un error al eliminar la categoría.");
      });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestión de Categorías de Denuncia</h1>

      {!modoAgregar && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6"
          onClick={() => setModoAgregar(true)}
        >
          Agregar categoría
        </button>
      )}

      {(modoAgregar || editandoId) && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">
            {editandoId ? 'Editar categoría' : 'Agregar categoría'}
          </h3>
          <input
            type="text"
            placeholder="Título"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className="w-full mb-3 p-2 border rounded"
          />
          <textarea
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="w-full mb-3 p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Orden"
            value={form.orden ?? ''}
            onChange={(e) => {
              const valor = e.target.value;
              setForm({ ...form, orden: valor === "" ? null : parseInt(valor) });
            }}
            className="w-full mb-4 p-2 border rounded"
          />

          <div className="flex gap-2">
            <button
              onClick={() => {
                console.log("🟢 Click detectado en botón Guardar");
                guardarCategoria();
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <Save size={16} className="inline mr-1" /> Guardar
            </button>

            <button
              onClick={() => {
                setForm({ titulo: '', descripcion: '', orden: null });
                setEditandoId(null);
                setModoAgregar(false);
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              <X size={16} className="inline mr-1" /> Cancelar
            </button>
          </div>
        </div> // 🔴 ESTE DIV FALTABA CERRAR
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoriasBD.map((cat) => (
          <div key={cat.id} className="p-4 border rounded bg-white shadow-sm flex justify-between items-start">
            <div>
              <p className="font-semibold text-blue-800">{cat.titulo}</p>
              <p className="text-sm text-gray-600">{cat.descripcion}</p>
              <p className="text-xs text-gray-400">Orden: {cat.orden ?? '—'}</p>
            </div>
            <div className="flex gap-2">
              <button
                className="text-blue-600"
                onClick={() => {
                  setEditandoId(cat.id);
                  setForm({
                    titulo: cat.titulo,
                    descripcion: cat.descripcion || '',
                    orden: cat.orden ?? null
                  });
                  setModoAgregar(true);
                }}
              >
                <Pencil size={16} />
              </button>
              <button
                className="text-red-600"
                onClick={() => eliminarCategoria(cat.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GestionCategorias;