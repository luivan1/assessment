import { useEffect, useState } from "react";
import { X, Pencil, Save } from "lucide-react";
import axios from "axios";

const categorias = {
  DIGITAL: [
    "Video",
    "Sitio web",
    "Blog",
    "Redes sociales",
    "App",
    "Correo electrónico",
    "Podcast",
    "Intranet"
  ],
  "DE AMBIENTE": [
    "Mensajes de pared (poster, pantallas, pizarrones)",
    "Artículos y objetos (postit, mochilas, gorras, plumas)"
  ],
  "EN PERSONA": [
    "Juntas, reuniones, presentaciones",
    "Inducción, capacitación, curso",
    "Compañeros de trabajo"
  ],
  IMPRESOS: [
    "Código de ética",
    "Kit de bienvenida, materiales de contratación",
    "Difusión impresa (trípticos, brochures, tarjetas)",
    "Avisos impresos oficiales (circular, avisos, etc)"
  ]
};

export default function MediosDeDifusion() {
  const [medios, setMedios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [etiquetaTemp, setEtiquetaTemp] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/medios").then((res) => {
      setMedios(res.data);
    });
  }, []);

  const guardarEtiqueta = async (id) => {
    const actualizado = medios.find((m) => m.id === id);
    const payload = {
      ...actualizado,
      etiqueta: etiquetaTemp
    };
    const res = await axios.put(`http://localhost:8000/medios/${id}`, payload);
    setMedios((prev) =>
      prev.map((m) =>
        m.id === id ? { ...res.data } : m
      )
    );
    setEditandoId(null);
    setEtiquetaTemp("");
  };

  const eliminarMedio = async (id) => {
    await axios.delete(`http://localhost:8000/medios/${id}`);
    setMedios((prev) => prev.filter((m) => m.id !== id));
  };

  const agregarMedio = async (texto, categoria) => {
    const nuevo = {
      cliente_id: 1,
      categoria,
      etiqueta: texto,
      etiqueta_original: texto,
      visible_en_reporte: true,
      orden: null,
      descripcion: null
    };
    const res = await axios.post("http://localhost:8000/medios", nuevo);
    setMedios((prev) => [...prev, res.data]);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Medios de difusión de Línea Ética EthicsGlobal</h2>
      <p className="text-gray-600 mb-6 italic">
        Selecciona los medios a través de los cuales darás a conocer la Línea Ética de EthicsGlobal.
        <br /><br />
        Puedes:
        <ul className="list-disc list-inside ml-4">
          <li>Agregar un mismo medio más de una vez si lo utilizas en diferentes contextos.</li>
          <li>Editar la etiqueta con el nombre de tu preferencia.</li>
        </ul>
        <br />
        ⚠️ <strong>Importante:</strong> No modifiques la etiqueta si el contenido que vas a ingresar
        pertenece a otro tipo de medio. Esto nos ayuda a evaluar correctamente el alcance e impacto
        de tu campaña de difusión.
      </p>

      {Object.entries(categorias).map(([categoria, opciones]) => (
        <div key={categoria} className="mb-6">
          <h3 className="font-semibold mb-2 text-blue-800">{categoria}</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {opciones.map((opcion, i) => (
              <button
                key={i}
                onClick={() => agregarMedio(opcion, categoria)}
                className="bg-blue-100 hover:bg-blue-200 text-sm px-3 py-1 rounded"
              >
                {opcion}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {medios.filter((m) => m.categoria === categoria).map((m) => (
              <div key={m.id} className="border p-3 rounded shadow relative">
                {editandoId === m.id ? (
                  <>
                    <input
                      className="border w-full mb-2 p-1"
                      value={etiquetaTemp}
                      onChange={(e) => setEtiquetaTemp(e.target.value)}
                    />
                    <button
                      onClick={() => guardarEtiqueta(m.id)}
                      className="text-sm bg-green-200 px-2 py-1 rounded mr-2"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setEditandoId(null);
                        setEtiquetaTemp("");
                      }}
                      className="text-sm bg-gray-200 px-2 py-1 rounded"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-sm mb-1">{m.etiqueta}</p>
                    {m.etiqueta_original && m.etiqueta !== m.etiqueta_original && (
                      <p className="text-xs italic text-red-500">* {m.etiqueta_original}</p>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => {
                          setEditandoId(m.id);
                          setEtiquetaTemp(m.etiqueta);
                        }}
                        className="text-blue-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => eliminarMedio(m.id)}
                        className="text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}