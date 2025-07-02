import { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Save, X } from 'lucide-react';

function Denuncias() {
  const [tiposReportante, setTiposReportante] = useState([]);
  const [denunciasBD, setDenunciasBD] = useState([]);
  const [categoriasBD, setCategoriasBD] = useState([]);
  const [categoriaIdMap, setCategoriaIdMap] = useState({});
  const [editandoId, setEditandoId] = useState(null);
  const [modoAgregar, setModoAgregar] = useState(false);
  const [formCategoria, setFormCategoria] = useState({ titulo: '', descripcion: '' });
  const [nuevaDenuncia, setNuevaDenuncia] = useState(null);
  const [plantillasBase, setPlantillasBase] = useState([]);
  const [tituloOriginalBase, setTituloOriginalBase] = useState('');

  const formRef = useRef(null);

  const normalizar = (texto) =>
    (texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const plantillasAgrupadas = plantillasBase.reduce((acc, plantilla) => {
    const categoria = plantilla.categoria_original || 'Otras';
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(plantilla);
    return acc;
  }, {});

  const restaurarDenuncias = () => {
    if (window.confirm("¿Estás seguro de que deseas restaurar el catálogo inicial de denuncias? Esta acción eliminará todos los cambios realizados.")) {
      fetch("http://localhost:8000/restaurar-denuncias", {
        method: "POST",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Error al restaurar denuncias");
          return res.json();
        })
        .then(() => {
          alert("Catálogo restaurado correctamente.");
          fetch("http://localhost:8000/denuncias")
            .then((res) => res.json())
            .then((data) => setDenunciasBD(data))
            .catch(() => setDenunciasBD([]));

          fetch("http://localhost:8000/categorias-denuncia")
            .then((res) => res.json())
            .then((data) => {
              setCategoriasBD(data);
              const map = {};
              data.forEach((cat) => {
                map[normalizar(cat.titulo)] = cat.id;
              });
              setCategoriaIdMap(map);
            })
            .catch(() => setCategoriasBD([]));
        })
        .catch((err) => {
          console.error(err);
          alert("Ocurrió un error al restaurar el catálogo.");
        });
    }
  };

  useEffect(() => {
    if (nuevaDenuncia && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [nuevaDenuncia]);

  useEffect(() => {
    fetch('http://localhost:8000/reportantes')
      .then((res) => res.json())
      .then((data) => setTiposReportante(data.map((r) => r.etiqueta)))
      .catch(() => setTiposReportante([]));

    fetch('http://localhost:8000/denuncias')
      .then((res) => res.json())
      .then((data) => setDenunciasBD(data))
      .catch(() => setDenunciasBD([]));

    fetch('http://localhost:8000/categorias-denuncia')
      .then((res) => res.json())
      .then((data) => {
        const map = {};
        data.forEach((cat) => {
          map[normalizar(cat.titulo)] = cat.id;
        });
        setCategoriaIdMap(map);
        setCategoriasBD(data);
      })
      .catch(() => setCategoriasBD([]));
  }, []);

  useEffect(() => {
    fetch("/catalogo_completo_integrado.json")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el catálogo base");
        return res.json();
      })
      .then((data) => {
        const plantillas = data.denuncias.flatMap((categoria) =>
          categoria.items.map((item) => ({
            ...item,
            categoria: categoria.categoria,
            categoria_original: categoria.categoria,
            descripcion_categoria: categoria.descripcion,
            reportantesRecomendados: item.reportantesRecomendados || [],
          }))
        );
        setPlantillasBase(plantillas);
      })
      .catch((err) => {
        console.error("Error cargando plantillas base:", err);
        setPlantillasBase([]);
      });
  }, []);

  /* ----------------------------- CRUD de denuncias ---------------------------- */

  const agregarDenuncia = (categoria_id, itemBase) => {
    const originalTitulo = itemBase.titulo;

    setTituloOriginalBase(originalTitulo); // ← ¡separado del state editable!

    setNuevaDenuncia({
      cliente_id: 1,
      categoria_id,
      titulo: originalTitulo, // editable
      titulo_original: originalTitulo,
      descripcion: itemBase.descripcion || '',
      ejemplos: itemBase.ejemplos ? [...itemBase.ejemplos] : ['', '', '', '', ''],
      preguntaAdicional: '',
      anonimo: false,
      tipos_reportante: [],
      visible_en_reporte: true,
      orden: 0,
      reportantesRecomendados: Array.isArray(itemBase.reportantesRecomendados)
        ? [...itemBase.reportantesRecomendados]
        : [],
    });
  };

  const editarDenuncia = (item) => {
    setNuevaDenuncia({
      id: item.id,
      cliente_id: item.cliente_id,
      categoria_id: item.categoria_id,
      categoria: categoriasBD.find((c) => c.id === item.categoria_id)?.titulo || '',
      titulo: item.titulo || '',
      titulo_original: item.titulo_original,
      titulo_original_base: item.titulo_original || '',
      descripcion: item.descripcion || '',
      ejemplos: item.ejemplos?.length ? item.ejemplos : ['', '', '', '', ''],
      preguntaAdicional: item.preguntaAdicional || '',
      anonimo: item.anonimo || false,
      tipos_reportante: item.tipos_reportante || [],
      visible_en_reporte: item.visible_en_reporte !== false,
      orden: item.orden || 0,
      reportantesRecomendados: item.reportantesRecomendados || [],
    });
  };

  const eliminarDenuncia = (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta denuncia?")) return;

    fetch(`http://localhost:8000/denuncias/${id}`, {
      method: 'DELETE',
    })
      .then(() => fetch('http://localhost:8000/denuncias'))
      .then((res) => res.json())
      .then((data) => setDenunciasBD(data))
      .catch((err) => {
        console.error("Error al eliminar denuncia:", err);
        alert("Ocurrió un error al eliminar la denuncia.");
      });
  };

  const guardarDenuncia = () => {
    const esEdicion = !!nuevaDenuncia.id;

    const categoriaNormalizada = normalizar(nuevaDenuncia.categoria);
    const categoria_id = categoriaIdMap[categoriaNormalizada];

    if (!categoria_id) {
      alert("Debe seleccionar una categoría válida antes de guardar.");
      return;
    }

    const url = esEdicion
      ? `http://localhost:8000/denuncias/${nuevaDenuncia.id}`
      : 'http://localhost:8000/denuncias';

    const metodo = esEdicion ? 'PUT' : 'POST';

    const datosAGuardar = {
      ...nuevaDenuncia,
      categoria_id,
      titulo_original: esEdicion
        ? nuevaDenuncia.titulo_original
        : tituloOriginalBase || nuevaDenuncia.titulo,
    };

    fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosAGuardar),
    })
      .then(() => fetch('http://localhost:8000/denuncias'))
      .then((res) => res.json())
      .then((data) => {
        setDenunciasBD(data);
        setNuevaDenuncia(null);
      })
      .catch((error) => {
        console.error('Error al guardar denuncia:', error);
        alert('Ocurrió un error al guardar la denuncia.');
      });
  };

  /* --------------------------- Helpers de formulario -------------------------- */
  const actualizarCampoDenuncia = (campo, valor) => {
    setNuevaDenuncia((prev) => ({ ...prev, [campo]: valor }));
  };

  const toggleTipoReportante = (etiqueta) => {
    setNuevaDenuncia((prev) => {
      const actual = prev.tipos_reportante.includes(etiqueta);
      return {
        ...prev,
        tipos_reportante: actual
          ? prev.tipos_reportante.filter((t) => t !== etiqueta)
          : [...prev.tipos_reportante, etiqueta],
      };
    });
  };

  /* ------------------------------ CRUD categorías ----------------------------- */
  const guardarCategoria = () => {
    const metodo = editandoId ? 'PUT' : 'POST';
    const url = editandoId
      ? `http://localhost:8000/categorias-denuncia/${editandoId}`
      : 'http://localhost:8000/categorias-denuncia';

    fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cliente_id: 1, ...formCategoria }),
    })
      .then(() => {
        setEditandoId(null);
        setFormCategoria({ titulo: '', descripcion: '' });
        setModoAgregar(false);
        return fetch('http://localhost:8000/categorias-denuncia');
      })
      .then((res) => res.json())
      .then((data) => {
        setCategoriasBD(data);

        const map = {};
        data.forEach((cat) => {
          map[normalizar(cat.titulo)] = cat.id;
        });
        setCategoriaIdMap(map);
      })
      .catch((err) => {
        console.error("Error al guardar categoría:", err);
        alert("Hubo un error al guardar la categoría.");
      });
  };

  const eliminarCategoria = (id) => {
    fetch(`http://localhost:8000/categorias-denuncia/${id}`, { method: 'DELETE' })
      .then(() => fetch('http://localhost:8000/categorias-denuncia'))
      .then((res) => res.json())
      .then((data) => setCategoriasBD(data));
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Catálogo de Denuncias</h1>
      <p className="text-sm italic text-gray-600 mb-6">
        Selecciona los tipos de denuncia que aplican y edítalos según tu lenguaje corporativo. Puedes agregar varios del mismo tipo.
      </p>

      {!modoAgregar && (
        <div className="mb-6 flex gap-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setModoAgregar(true)}
          >
            Agregar nueva categoría de denuncia
          </button>
          {/*
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={restaurarDenuncias}
          >
            Restaurar denuncias
          </button>
          */}
        </div>
      )}

      {(modoAgregar || editandoId) && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">
            {editandoId ? 'Editar categoría' : 'Agregar nueva categoría'}
          </h3>

          <input
            type="text"
            placeholder="Título de la categoría"
            value={formCategoria.titulo}
            onChange={(e) =>
              setFormCategoria({ ...formCategoria, titulo: e.target.value })
            }
            className="w-full mb-3 p-2 border rounded"
          />

          <textarea
            placeholder="Descripción"
            value={formCategoria.descripcion}
            onChange={(e) =>
              setFormCategoria({ ...formCategoria, descripcion: e.target.value })
            }
            className="w-full mb-4 p-2 border rounded"
          />

          <div className="flex gap-2">
            <button
              onClick={guardarCategoria}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <Save size={16} className="inline mr-1" />
              Guardar
            </button>

            <button
              onClick={() => {
                setFormCategoria({ titulo: '', descripcion: '' });
                setEditandoId(null);
                setModoAgregar(false);
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              <X size={16} className="inline mr-1" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* --------------------------- Lista de categorías -------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {categoriasBD.map((cat) => (
          <div
            key={cat.id}
            className="p-4 border rounded bg-white shadow-sm flex justify-between items-start"
          >
            <div>
              <p className="font-semibold text-blue-800">{cat.titulo}</p>
            </div>
            <div className="flex gap-2">
              <button
                className="text-blue-600"
                onClick={() => {
                  setEditandoId(cat.id);
                  setFormCategoria({ titulo: cat.titulo, descripcion: cat.descripcion });
                  setModoAgregar(true);
                }}
              >
                <Pencil size={16} />
              </button>
              <button className="text-red-600" onClick={() => eliminarCategoria(cat.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

     {/* ------------------- Botones de plantillas (agrupadas) ------------------- */}
    <div className="mt-10">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Denuncias</h2>
      <p className="text-sm text-gray-600 italic mb-4">
        Agregue denuncias a su catálogo. Puede agregar una denuncia más de una vez y editar su
        información.{' '}
        <span className="font-semibold text-red-600">IMPORTANTE:</span> cambie la redacción, pero
        no la intención de la denuncia.
      </p>

      {/* Botones agrupados por categoría */}
      {Object.entries(plantillasAgrupadas).map(([categoria, items]) => (
        <div key={categoria} className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-2">{categoria}</h3>
          <div className="flex flex-wrap gap-2">
            {items.map((item, idx) => (
              <button
                key={`${item.titulo}-${idx}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2 py-1 rounded shadow transition-colors flex items-center gap-1 text-xs"
                onClick={() => {
                  if (categoriasBD.length === 0) {
                    alert('Debe crear al menos una categoría antes de agregar una denuncia.');
                    return;
                  }
                  const categoriaDefault = categoriasBD[0];
                  agregarDenuncia(categoriaDefault.id, item);
                }}
                title={`Agregar denuncia: ${item.titulo}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>{item.titulo}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

        {/* ---------------------- Formulario de nueva/edición ---------------------- */}
        {nuevaDenuncia && (
          <div
            className="border border-gray-300 rounded-lg bg-gray-50 p-6 mb-10 shadow-sm"
            ref={formRef}
          >
            {tituloOriginalBase && (
              <p className="text-sm italic text-red-600 mb-3 select-none">
                <strong>* Título original:</strong> {tituloOriginalBase}
              </p>
            )}

            <label className="block text-sm font-semibold mb-1" htmlFor="titulo-denuncia">
              Título de la denuncia
            </label>
            <input
              id="titulo-denuncia"
              className="w-full border border-gray-400 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={nuevaDenuncia.titulo}
              onChange={(e) => actualizarCampoDenuncia('titulo', e.target.value)}
              type="text"
            />

            <label className="block text-sm font-semibold mb-1" htmlFor="descripcion-denuncia">
              Descripción
            </label>
            <textarea
              id="descripcion-denuncia"
              className="w-full border border-gray-400 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={nuevaDenuncia.descripcion}
              onChange={(e) => actualizarCampoDenuncia('descripcion', e.target.value)}
              rows={4}
            />

            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="mb-4">
                <label
                  htmlFor={`ejemplo-denuncia-${i}`}
                  className="block text-sm font-semibold mb-1"
                >
                  Ejemplo {i + 1}
                </label>
                <input
                  id={`ejemplo-denuncia-${i}`}
                  className="w-full border border-gray-400 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevaDenuncia.ejemplos[i] || ''}
                  onChange={(e) => {
                    const nuevos = [...nuevaDenuncia.ejemplos];
                    nuevos[i] = e.target.value;
                    actualizarCampoDenuncia('ejemplos', nuevos);
                  }}
                  type="text"
                />
              </div>
            ))}

            <label className="block text-sm font-semibold mb-1" htmlFor="pregunta-adicional">
              Pregunta adicional
            </label>
            <textarea
              id="pregunta-adicional"
              placeholder="Pregunta adicional"
              className="w-full border border-gray-400 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={nuevaDenuncia.preguntaAdicional}
              onChange={(e) => actualizarCampoDenuncia('preguntaAdicional', e.target.value)}
              rows={3}
            />

            <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={nuevaDenuncia.anonimo}
                onChange={(e) => actualizarCampoDenuncia('anonimo', e.target.checked)}
                className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm">¿Permitir denuncia anónima?</span>
            </label>

            <label className="block text-sm font-semibold mb-1" htmlFor="categoria-denuncia">
              Categoría
            </label>
            <select
              id="categoria-denuncia"
              className="w-full border border-gray-400 rounded-md p-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={nuevaDenuncia.categoria || ''}
              onChange={(e) => actualizarCampoDenuncia('categoria', e.target.value)}
            >
              <option value="">Selecciona una categoría</option>
              {categoriasBD.map((cat) => (
                <option key={cat.id} value={cat.titulo}>
                  {cat.titulo}
                </option>
              ))}
            </select>

            <div className="mb-6">
              <p className="text-sm font-semibold mb-2">Tipos de reportante:</p>
              <div className="flex flex-wrap gap-3">
                {tiposReportante.map((tipo) => (
                  <label key={tipo} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={nuevaDenuncia.tipos_reportante.includes(tipo)}
                      onChange={() => toggleTipoReportante(tipo)}
                      className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm">{tipo}</span>
                  </label>
                ))}
              </div>
            </div>

            {Array.isArray(nuevaDenuncia?.reportantesRecomendados) && nuevaDenuncia.reportantesRecomendados.length > 0 && (
              <p className="text-sm italic text-red-600 mb-4 select-none">
                * Sugeridos: {nuevaDenuncia.reportantesRecomendados.join(', ')}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={guardarDenuncia}
                className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 shadow-md transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                Guardar
              </button>
              <button
                onClick={() => setNuevaDenuncia(null)}
                className="bg-gray-400 text-white px-5 py-2 rounded-md hover:bg-gray-500"
              >
                <X size={18} />
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <hr className="my-6 border-gray-300" />

      {/* ------------------ Denuncias guardadas, agrupadas por cat ------------------ */}
      {categoriasBD.map((categoria) => {
        const denuncias = denunciasBD.filter((d) => d.categoria_id === categoria.id);
        const catalogo = plantillasBase.filter(
          (p) => normalizar(p.categoria_original) === normalizar(categoria.titulo)
        );

        return (
          <div key={categoria.id} className="mb-10">
            <h2 className="text-xl font-bold text-blue-700 mb-1">{categoria.titulo}</h2>
            <p className="text-sm text-gray-700 mb-4">{categoria.descripcion}</p>

           {/* botones para agregar más denuncias predefinidas */}
            <div className="flex flex-wrap gap-3 mb-4">
              {catalogo.map((item) => (
                <button
                  key={item.titulo}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded shadow flex items-center gap-2 transition-transform transform hover:scale-105"
                  onClick={() => agregarDenuncia(categoria.id, item)}
                  title={`Agregar denuncia: ${item.titulo}`}
                  aria-label={`Agregar denuncia: ${item.titulo}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {item.titulo.length > 30 ? item.titulo.slice(0, 27) + "..." : item.titulo}
                </button>
              ))}
            </div>

            {/* tarjetas colapsadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {denuncias.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer"
                  role="group"
                  aria-label={`Denuncia: ${item.titulo}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <p className="font-semibold text-base text-gray-900 mb-1">{item.titulo}</p>
                      <p className="text-xs italic text-red-600 mb-2">
                        <strong>* Título original:</strong> {item.titulo_original}
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.descripcion}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={() => editarDenuncia(item)}
                        aria-label={`Editar denuncia: ${item.titulo}`}
                        title="Editar denuncia"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 transition-colors"
                        onClick={() => eliminarDenuncia(item.id)}
                        aria-label={`Eliminar denuncia: ${item.titulo}`}
                        title="Eliminar denuncia"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Denuncias;

