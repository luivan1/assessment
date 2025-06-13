import { useState } from "react";
import { X } from "lucide-react";

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

function MediosDeDifusion() {
  const [medios, setMedios] = useState([]);

  const agregarMedio = (texto) => {
    const nuevo = {
      id: `${texto}-${Date.now()}`,
      etiqueta: texto
    };
    setMedios((prev) => [...prev, nuevo]);
  };

  const actualizarEtiqueta = (id, valor) => {
    setMedios((prev) =>
      prev.map((el) => (el.id === id ? { ...el, etiqueta: valor } : el))
    );
  };

  const eliminarMedio = (id) => {
    setMedios((prev) => prev.filter((el) => el.id !== id));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Medios de difusión de Línea Ética EthicsGlobal
      </h2>

      <p className="text-gray-600 mb-6 italic">
        Selecciona los medios a través de los cuales darás a conocer la Línea Ética de EthicsGlobal.
        <br />
        <br />
        Puedes:
        <ul className="list-disc list-inside ml-4">
          <li>
            Agregar un mismo medio más de una vez si lo utilizas en diferentes contextos
            (por ejemplo: dos campañas distintas en correo electrónico).
          </li>
          <li>Editar la etiqueta con el nombre de tu preferencia.</li>
        </ul>
        <br />
        ⚠️ <strong>Importante:</strong> No modifiques la etiqueta si el contenido que vas a ingresar
        pertenece a otro tipo de medio. Esto nos ayuda a evaluar correctamente el alcance e impacto
        de tu campaña de difusión y a detectar áreas de mejora continua.
      </p>

      {Object.entries(categorias).map(([categoria, opciones]) => (
        <div key={categoria} className="mb-6">
          <h3 className="font-semibold mb-2 text-blue-800">{categoria}</h3>
          <div className="flex flex-wrap gap-2">
            {opciones.map((opcion, index) => (
              <button
                key={index}
                onClick={() => agregarMedio(opcion)}
                className="bg-blue-100 hover:bg-blue-200 text-sm px-3 py-1 rounded"
              >
                {opcion}
              </button>
            ))}
          </div>
        </div>
      ))}

      <h3 className="font-semibold mb-2">Medios seleccionados</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {medios.map((el) => (
          <div key={el.id} className="border rounded p-3 bg-white shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <input
                  className="border p-1 w-full text-sm"
                  value={el.etiqueta}
                  onChange={(e) => actualizarEtiqueta(el.id, e.target.value)}
                />
              </div>
              <button
                onClick={() => eliminarMedio(el.id)}
                className="text-red-600 ml-2"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MediosDeDifusion;