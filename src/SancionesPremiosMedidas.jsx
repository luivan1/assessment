import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Save, Trash2 } from "lucide-react";
import ConfiguradorBanderas from './components/ConfiguradorBanderas';

const categorias = [
  {
    titulo: "Tipos de Cierre",
    items: ["Cerrado Fundamentado", "Cerrado no fundamentado", "Improcedente"]
  },
  {
    titulo: "Sanciones",
    items: [
      "Reprimenda Verbal", "Reprimenda escrita", "Plan de mejora o coaching",
      "Suspensión temporal", "Amonestación económica (bonos, ascensos o beneficios)",
      "Despido", "Renuncia", "Inicio de acción legal o judicial",
      "Reasignación de área, ubicación o turno",
      "Inhabilitación o recesión de contrato (clientes, proveedores, etc.)"
    ]
  },
  {
    titulo: "Premios o Retribuciones",
    items: [
      "Bono o incentivo monetario", "Reconocimiento en especie (regalos, artículos, etc.)",
      "Beneficios o prestaciones adicionales", "Descuentos especiales o preferenciales",
      "Felicitación escrita / carta de reconocimiento", "Publicación en medios internos (intranet, boletines, etc.)",
      "Reconocimiento público en evento o reunión", "Felicitación verbal", "Ascenso o promoción",
      "Asignación de nuevos retos o proyectos clave", "Acceso a programas especiales (ej. capacitaciones, mentoring, viajes)"
    ]
  },
  {
    titulo: "Medidas Correctivas",
    items: [
      "Modificación o actualización de procesos internos", "Adquisición de equipo, herramientas o materiales",
      "Reparaciones o mantenimiento correctivo", "Contratación de nuevo personal",
      "Reasignación o rotación de personal", "Capacitación o sensibilización del equipo",
      "Despido o separación de terceros (proveedores, contratistas, etc.)",
      "Contratación o búsqueda de nuevos proveedores", "Indemnización o compensación a la parte afectada",
      "Revisión o actualización de contratos con terceros", "Notificación o denuncia a autoridades externas (si aplica)",
      "Implementación de controles adicionales", "Campañas de comunicación o refuerzo cultural",
      "Auditorías internas o revisiones periódicas"
    ]
  }
];

function SancionesPremiosMedidas() {
  const [items, setItems] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(null);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const ORGANIZACION_ID = usuario.organizacion_id || null;

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:8000/cierres", {
        headers: { "X-Organizacion-ID": ORGANIZACION_ID }
      });
      setItems(res.data.map(item => ({
        ...item,
        original: item.etiqueta_original || null
      })));
    } catch (err) {
      console.error("Error al cargar cierres:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const agregar = async (categoria, texto) => {
    const nuevo = {
      categoria,
      etiqueta: texto,
      etiqueta_original: texto,
      visible_en_reporte: true,
      organizacion_id: ORGANIZACION_ID
    };
    try {
      const res = await axios.post("http://localhost:8000/cierres", nuevo, {
        headers: { "X-Organizacion-ID": ORGANIZACION_ID }
      });
      setItems(prev => [...prev, { ...res.data, original: texto }]);
    } catch (err) {
      console.error("Error al agregar cierre:", err);
    }
  };

  const actualizar = async (item) => {
    try {
      const res = await axios.put(`http://localhost:8000/cierres/${item.id}`, item, {
        headers: { "X-Organizacion-ID": ORGANIZACION_ID }
      });
      setItems(prev => prev.map(i => i.id === item.id ? { ...res.data, original: i.original } : i));
      setModoEdicion(null);
    } catch (err) {
      console.error("Error al actualizar cierre:", err);
    }
  };

  const eliminar = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/cierres/${id}`, {
        headers: { "X-Organizacion-ID": ORGANIZACION_ID }
      });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error("Error al eliminar cierre:", err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Tipos de cierre, Sanciones, Premios y Medidas Correctivas</h2>
      <p className="text-gray-600 mb-6 italic">
        Selecciona las acciones que implementarás como parte de la gestión de tu Línea Ética. Puedes agregar un mismo elemento más de una vez y editar su etiqueta. Esto nos ayuda a analizar el impacto de cada acción y fomentar la mejora continua.<br /><br />
        ⚠️ Importante: No cambies el tipo de acción (por ejemplo, no conviertas una sanción en premio), ya que esto altera el seguimiento y la evaluación de resultados.
      </p>
        {/* Aquí se insertan las Banderas */}
        <ConfiguradorBanderas />

      {categorias.map((cat, i) => (
        <div key={i} className="mb-10">
          <h3 className="text-xl font-semibold text-blue-700 mb-2">{cat.titulo}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {cat.items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => agregar(cat.titulo, item)}
                className="bg-blue-100 hover:bg-blue-200 text-sm px-3 py-1 rounded"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
            {items
              .filter(el => el.categoria === cat.titulo)
              .map(el => (
                <div key={el.id} className="border rounded p-4 bg-white shadow relative">
                  {modoEdicion === el.id ? (
                    <>
                      <input
                        value={el.etiqueta}
                        onChange={e =>
                          setItems(prev =>
                            prev.map(i =>
                              i.id === el.id ? { ...i, etiqueta: e.target.value } : i
                            )
                          )
                        }
                        className="border p-2 w-full mb-2"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => actualizar(el)}
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
                      <p className="text-sm font-medium mb-1">{el.etiqueta}</p>
                      {el.original && el.etiqueta !== el.original && (
                        <p className="text-xs italic text-red-600 mb-2">* {el.original}</p>
                      )}
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button onClick={() => setModoEdicion(el.id)} className="text-blue-600">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => eliminar(el.id)} className="text-red-600">
                          <Trash2 size={16} />
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

export default SancionesPremiosMedidas;