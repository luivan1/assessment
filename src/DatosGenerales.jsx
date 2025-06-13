import { useState } from 'react';

export default function DatosGenerales() {
  const [plan, setPlan] = useState('Plan Basico');
  const [conAsesores, setConAsesores] = useState(true);
  const [dominioTipo, setDominioTipo] = useState('subdominio');
  const [archivoLogo, setArchivoLogo] = useState(null);
  const [fotoAdmin, setFotoAdmin] = useState(null);

  const giros = [
    "Agricultura, ganadería, pesca y actividades forestales",
    "Minería y extracción de recursos naturales",
    "Fabricación e industria manufacturera",
    "Energía: electricidad, gas y climatización",
    "Agua, manejo de residuos y saneamiento ambiental",
    "Construcción y obras civiles",
    "Comercio (mayorista, minorista y reparación de vehículos)",
    "Transporte, logística y almacenamiento",
    "Hoteles, alojamiento y servicios de comida",
    "Tecnología, medios y telecomunicaciones",
    "Servicios financieros y seguros",
    "Bienes raíces y actividades inmobiliarias",
    "Servicios profesionales, científicos o técnicos",
    "Servicios administrativos y de soporte",
    "Gobierno, defensa y seguridad social",
    "Educación y formación académica",
    "Salud y servicios sociales",
    "Arte, entretenimiento y recreación",
    "Otros servicios",
    "Hogares como empleadores (trabajo doméstico)",
    "Organismos internacionales y diplomáticos"
  ];

  const dominiosDisponibles = [
    "ethicsglobal.com",
    "confialo.com",
    "linea-etica.com",
    "lineaetica.com.mx",
    "lineaetica.mx"
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">Datos Generales de la Cuenta</h2>

      <div className="space-y-2">
        <label className="font-semibold">Selecciona tu plan</label>
        <select className="border p-2 w-full" value={plan} onChange={(e) => setPlan(e.target.value)}>
          <option>Plan Basico</option>
          <option>Plan Estandar</option>
          <option>Plan Corporativo</option>
          <option>Plan Premium</option>
        </select>
        <label className="inline-flex items-center mt-2">
          <input
            type="checkbox"
            className="mr-2"
            checked={conAsesores}
            onChange={() => setConAsesores(!conAsesores)}
          />
          Con atención de asesores EthicsGlobal
        </label>
      </div>

      <div>
        <label className="font-semibold">Número de empleados</label>
        <input type="number" className="border p-2 w-full" />
      </div>

      <div>
        <label className="font-semibold">Giro de la organización</label>
        <select className="border p-2 w-full">
          {giros.map((giro, i) => <option key={i}>{giro}</option>)}
        </select>
      </div>

      <div>
        <label className="font-semibold">Idiomas de operación</label>
        <input type="text" className="border p-2 w-full" placeholder="Ej. Español, Inglés" />
      </div>

      <div>
        <label className="font-semibold">Países de operación</label>
        <input type="text" className="border p-2 w-full" placeholder="Ej. México, Colombia" />
      </div>

      <div>
        <label className="font-semibold">Nombre comercial de la empresa</label>
        <input type="text" className="border p-2 w-full" />
      </div>

      <div>
        <label className="font-semibold">¿A qué se dedica su organización? <span className="italic">(Sea lo más preciso posible...)</span></label>
        <textarea className="border p-2 w-full" rows={4} />
      </div>

      <div className="space-y-2">
        <label className="font-semibold">URL del sistema ético</label>
        <div className="flex gap-4">
          <label><input type="radio" name="dominio" checked={dominioTipo === 'dominio'} onChange={() => setDominioTipo('dominio')} /> Dominio personalizado</label>
          <label><input type="radio" name="dominio" checked={dominioTipo === 'subdominio'} onChange={() => setDominioTipo('subdominio')} /> Subdominio</label>
        </div>
        {dominioTipo === 'dominio' ? (
          <input type="text" className="border p-2 w-full" placeholder="Escribe tu dominio deseado" />
        ) : (
          <div className="flex gap-2">
            <input type="text" className="border p-2 w-full" placeholder="Escribe tu subdominio deseado" />
            <select className="border p-2">
              {dominiosDisponibles.map((dom, idx) => <option key={idx}>{dom}</option>)}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="font-semibold">Sube el logotipo de tu empresa (preferente en vectores o alta calidad)</label>
        <input type="file" accept="image/*" onChange={(e) => setArchivoLogo(e.target.files[0])} />
      </div>

      <h3 className="text-xl font-bold mt-10">Datos del Usuario Administrativo</h3>

      <div className="grid grid-cols-2 gap-4">
        <input className="border p-2" placeholder="Nombre" />
        <input className="border p-2" placeholder="Apellidos" />
        <input className="border p-2" placeholder="Género" />
        <input type="date" className="border p-2" />
        <input className="border p-2" placeholder="Dirección" />
        <input className="border p-2" placeholder="Teléfono" />
        <input className="border p-2" placeholder="Email" />
        <input className="border p-2" placeholder="País" />
        <input className="border p-2" placeholder="Región/Estado" />
        <input className="border p-2" placeholder="Código Postal" />
        <input className="border p-2" placeholder="Ciudad" />
      </div>

      <div className="mt-4">
        <label className="font-semibold">Sube tu fotografía de perfil (ideal: 400x400 px, formato cuadrado)</label>
        <input type="file" accept="image/*" onChange={(e) => setFotoAdmin(e.target.files[0])} />
      </div>

      <label className="inline-flex items-center mt-4">
        <input type="checkbox" className="mr-2" />
        Este usuario tendrá acceso al módulo contable
      </label>
    </div>
  );
}