// Archivo completo ya corregido
import { useEffect, useState } from 'react';

export default function DatosGenerales() {
  const [idDatos, setIdDatos] = useState(null);
  const [plan, setPlan] = useState('Plan Basico');
  const [conAsesores, setConAsesores] = useState(true);
  const [empleados, setEmpleados] = useState('');
  const [giro, setGiro] = useState('');
  const [dominioTipo, setDominioTipo] = useState('subdominio');
  const [dominioValor, setDominioValor] = useState('');
  const [archivoLogo, setArchivoLogo] = useState(null);
  const [fotoAdmin, setFotoAdmin] = useState(null);

  const [paisesDisponibles, setPaisesDisponibles] = useState([]);
  const [idiomasDisponibles, setIdiomasDisponibles] = useState([]);
  const [paisSeleccionado, setPaisSeleccionado] = useState('');
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState('');
  const [paisesOperacion, setPaisesOperacion] = useState([]);
  const [idiomasOperacion, setIdiomasOperacion] = useState([]);

  const [estadosDisponibles, setEstadosDisponibles] = useState([]);
  const [ciudadesDisponibles, setCiudadesDisponibles] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);

  const [nombreComercial, setNombreComercial] = useState('');
  const [descripcionOrg, setDescripcionOrg] = useState('');

  const [usuario, setUsuario] = useState({
    nombre: '', telefono: '', email: '',
    pais: '', estado: '', cp: '', ciudad: ''
  });

  const [accesoContable, setAccesoContable] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(true);
  const [datosGuardados, setDatosGuardados] = useState(null);

  const dominiosDisponibles = [
    "ethicsglobal.com", "confialo.com", "linea-etica.com",
    "lineaetica.com.mx", "lineaetica.mx"
  ];

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

  const organizacion_id = JSON.parse(localStorage.getItem("usuario"))?.organizacion_id;

  useEffect(() => {
    fetch('/ubicaciones.json')
      .then(res => res.json())
      .then(data => {
        setUbicaciones(data);
        setPaisesDisponibles(data.map(p => p.name));
      });

    fetch('/idiomas_multilingue.json')
      .then(res => res.json())
      .then(data => setIdiomasDisponibles(data.map(i => i.traducciones?.es).filter(Boolean)));

    fetch(`http://localhost:8000/datos-generales?organizacion_id=${organizacion_id}`)
      .then(res => {
        if (!res.ok) throw new Error("No hay datos");
        return res.json();
      })
      .then(data => {
        setIdDatos(data.id);
        setPlan(data.plan || 'Plan Basico');
        setConAsesores(data.atencion_personalizada);
        setEmpleados(data.numero_empleados || '');
        setGiro(data.giro || '');
        setDominioValor(data.dominio || '');
        setNombreComercial(data.nombre_comercial || '');
        setDescripcionOrg(data.descripcion || '');
        setPaisesOperacion(data.paises_operacion || []);
        setIdiomasOperacion(data.idiomas_operacion || []);
        setUsuario({
          nombre: data.nombre_usuario_admin || '',
          telefono: data.telefono_usuario_admin || '',
          email: data.correo_usuario_admin || '',
          pais: data.pais || '',
          estado: data.estado || '',
          cp: data.cp || '',
          ciudad: data.ciudad || ''
        });
        setAccesoContable(data.acceso_modulo_contable || false);
        setDatosGuardados(data);
        setModoEdicion(false);
      })
      .catch(() => console.log("No se encontraron datos generales"));
  }, []);

  useEffect(() => {
    const paisObj = ubicaciones.find(p => p.name === usuario.pais);
    if (paisObj) setEstadosDisponibles(paisObj.states.map(s => s.name));
  }, [usuario.pais, ubicaciones]);

  useEffect(() => {
    const paisObj = ubicaciones.find(p => p.name === usuario.pais);
    const estadoObj = paisObj?.states.find(s => s.name === usuario.estado);
    if (estadoObj) setCiudadesDisponibles(estadoObj.cities);
  }, [usuario.estado, usuario.pais, ubicaciones]);

  const agregarPais = () => {
    if (paisSeleccionado && !paisesOperacion.includes(paisSeleccionado)) {
      setPaisesOperacion([...paisesOperacion, paisSeleccionado]);
      setPaisSeleccionado('');
    }
  };

  const eliminarPais = (pais) => {
    setPaisesOperacion(paisesOperacion.filter(p => p !== pais));
  };

  const agregarIdioma = () => {
    if (idiomaSeleccionado && !idiomasOperacion.includes(idiomaSeleccionado)) {
      setIdiomasOperacion([...idiomasOperacion, idiomaSeleccionado]);
      setIdiomaSeleccionado('');
    }
  };

  const eliminarIdioma = (idioma) => {
    setIdiomasOperacion(idiomasOperacion.filter(i => i !== idioma));
  };

  const guardarDatos = () => {
    const usuarioLocal = JSON.parse(localStorage.getItem("usuario") || "{}");

    const limpiar = (valor) => valor === undefined || valor === "" ? null : valor;

    const datos = {
      plan: limpiar(plan),
      atencion_personalizada: !!conAsesores,
      numero_empleados: empleados ? parseInt(empleados) : undefined,
      giro: limpiar(giro),
      idiomas_operacion: idiomasOperacion,
      paises_operacion: paisesOperacion,
      nombre_comercial: limpiar(nombreComercial),
      descripcion: limpiar(descripcionOrg),
      dominio: limpiar(dominioValor),
      logotipo_url: archivoLogo?.name || undefined,
      nombre_usuario_admin: limpiar(usuario.nombre),
      correo_usuario_admin: limpiar(usuario.email),
      telefono_usuario_admin: limpiar(usuario.telefono),
      pais: limpiar(usuario.pais),
      estado: limpiar(usuario.estado),
      cp: limpiar(usuario.cp),
      ciudad: limpiar(usuario.ciudad),
      acceso_modulo_contable: !!accesoContable,
      usuario_foto_url: fotoAdmin?.name || undefined,
      organizacion_id: parseInt(usuarioLocal.organizacion_id)
    };

    fetch(`http://localhost:8000/datos-generales${idDatos ? `/${idDatos}` : ''}`, {
      method: idDatos ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario-Id': usuarioLocal.usuario_id,
        'X-Organizacion-Id': usuarioLocal.organizacion_id
      },
      body: JSON.stringify(datos)
    })
      .then(res => res.ok ? res.json() : res.json().then(err => Promise.reject(err)))
      .then(data => {
        setIdDatos(data.id || idDatos);
        setModoEdicion(false);
        setDatosGuardados(datos);
      })
      .catch(err => {
        console.error('Error al guardar:', err);
        alert('Error al guardar');
      });
  };

  return (

    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {!modoEdicion && datosGuardados ? (
        <div className="border p-4 rounded shadow bg-gray-50 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{datosGuardados.nombre_comercial}</h2>
            <div className="space-x-2">
              <button onClick={() => setModoEdicion(true)} className="text-blue-600">✏️ Editar</button>
              <button onClick={() => { setDatosGuardados(null); setModoEdicion(true); }} className="text-red-600">🗑️ Eliminar</button>
            </div>
          </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div><span className="font-semibold text-gray-700">Nombre comercial:</span> {datosGuardados.nombre_comercial}</div>
            <div><span className="font-semibold text-gray-700">Descripción:</span> {datosGuardados.descripcion}</div>
            <div><span className="font-semibold text-gray-700">Plan:</span> {datosGuardados.plan}</div>
            <div><span className="font-semibold text-gray-700">Atención personalizada:</span> {datosGuardados.atencion_personalizada ? 'Sí' : 'No'}</div>
            <div><span className="font-semibold text-gray-700">Número de empleados:</span> {datosGuardados.numero_empleados}</div>
            <div><span className="font-semibold text-gray-700">Giro:</span> {datosGuardados.giro}</div>
            <div><span className="font-semibold text-gray-700">Dominio/Subdominio:</span> {datosGuardados.dominio}</div>
            <div><span className="font-semibold text-gray-700">Logotipo:</span> {datosGuardados.logotipo_url || 'No cargado'}</div>
            <div><span className="font-semibold text-gray-700">Países de operación:</span> {datosGuardados.paises_operacion?.join(', ') || '—'}</div>
            <div><span className="font-semibold text-gray-700">Idiomas de operación:</span> {datosGuardados.idiomas_operacion?.join(', ') || '—'}</div>
          </div>

          <hr className="my-2" />

          <h3 className="text-base font-bold text-blue-800">Usuario Administrador</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><span className="font-semibold text-gray-700">Nombre:</span> {datosGuardados.nombre_usuario_admin}</div>
            <div><span className="font-semibold text-gray-700">Correo:</span> {datosGuardados.correo_usuario_admin}</div>
            <div><span className="font-semibold text-gray-700">Teléfono:</span> {datosGuardados.telefono_usuario_admin}</div>
            <div><span className="font-semibold text-gray-700">País:</span> {datosGuardados.pais}</div>
            <div><span className="font-semibold text-gray-700">Estado:</span> {datosGuardados.estado}</div>
            <div><span className="font-semibold text-gray-700">Ciudad:</span> {datosGuardados.ciudad}</div>
            <div><span className="font-semibold text-gray-700">Código Postal:</span> {datosGuardados.cp}</div>
            <div><span className="font-semibold text-gray-700">Acceso contable:</span> {datosGuardados.acceso_modulo_contable ? 'Sí' : 'No'}</div>
          </div>
        </div>
        </div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); guardarDatos(); }} className="space-y-6">
          <h2 className="text-2xl font-bold">Datos Generales de la Cuenta</h2>

          <div className="space-y-2">
            <label className="font-semibold">Selecciona tu plan</label>
            <select className="border p-2 w-full" value={plan} onChange={(e) => setPlan(e.target.value)}>
              <option>Plan Basico</option>
              <option>Plan Estandar</option>
              <option>Plan Corporativo</option>
              <option>Plan Premium</option>
            </select>
            <label className="inline-flex items-center mt-2">
              <input type="checkbox" className="mr-2" checked={conAsesores} onChange={() => setConAsesores(!conAsesores)} />
              Con atención personalizada EthicsGlobal
            </label>
          </div>

          <div>
            <label className="font-semibold">Número de empleados</label>
            <input type="number" className="border p-2 w-full" value={empleados} onChange={e => setEmpleados(e.target.value)} />
          </div>

          <div>
            <label className="font-semibold">Giro de la organización</label>
            <select className="border p-2 w-full" value={giro} onChange={e => setGiro(e.target.value)}>
              {giros.map((g, i) => <option key={i}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="font-semibold">Idiomas de operación</label>
            <div className="flex gap-2 mb-2">
              <select className="border p-2 w-full" value={idiomaSeleccionado} onChange={(e) => setIdiomaSeleccionado(e.target.value)}>
                <option value="">Selecciona un idioma</option>
                {idiomasDisponibles.map((idioma, i) => <option key={i}>{idioma}</option>)}
              </select>
              <button type="button" onClick={agregarIdioma} className="px-4 bg-blue-600 text-white rounded">Agregar</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {idiomasOperacion.map((idioma, i) => (
                <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded inline-flex items-center">
                  {idioma}
                  <button type="button" onClick={() => eliminarIdioma(idioma)} className="ml-1 text-red-600 font-bold">×</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold">Países de operación</label>
            <div className="flex gap-2 mb-2">
              <select className="border p-2 w-full" value={paisSeleccionado} onChange={(e) => setPaisSeleccionado(e.target.value)}>
                <option value="">Selecciona un país</option>
                {paisesDisponibles.map((pais, i) => <option key={i}>{pais}</option>)}
              </select>
              <button type="button" onClick={agregarPais} className="px-4 bg-blue-600 text-white rounded">Agregar</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {paisesOperacion.map((pais, i) => (
                <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded inline-flex items-center">
                  {pais}
                  <button type="button" onClick={() => eliminarPais(pais)} className="ml-1 text-red-600 font-bold">×</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold">Nombre comercial</label>
            <input type="text" className="border p-2 w-full" value={nombreComercial} onChange={e => setNombreComercial(e.target.value)} />
          </div>

          <div>
            <label className="font-semibold">Descripción de la organización</label>
            <textarea className="border p-2 w-full" rows={4} value={descripcionOrg} onChange={e => setDescripcionOrg(e.target.value)} />
          </div>

          <div>
            <label className="font-semibold">Dominio o subdominio</label>
            <div className="flex gap-2 mb-2">
              <label><input type="radio" name="dominio" checked={dominioTipo === 'dominio'} onChange={() => setDominioTipo('dominio')} /> Dominio</label>
              <label><input type="radio" name="dominio" checked={dominioTipo === 'subdominio'} onChange={() => setDominioTipo('subdominio')} /> Subdominio</label>
            </div>
            {dominioTipo === 'dominio' ? (
              <input type="text" className="border p-2 w-full" placeholder="miempresa.com" value={dominioValor} onChange={e => setDominioValor(e.target.value)} />
            ) : (
              <div className="flex gap-2">
                <input type="text" className="border p-2 w-full" placeholder="miempresa" value={dominioValor} onChange={e => setDominioValor(e.target.value)} />
                <select className="border p-2">{dominiosDisponibles.map((d, i) => <option key={i}>{d}</option>)}</select>
              </div>
            )}
          </div>

          <div>
            <label className="font-semibold">Sube tu logotipo</label>
            <input type="file" accept="image/*" onChange={(e) => setArchivoLogo(e.target.files[0])} />
          </div>

          <h3 className="text-xl font-bold mt-6">Datos del Usuario Administrativo</h3>
          <div className="grid grid-cols-2 gap-4">
            <input className="border p-2" placeholder="Nombre" value={usuario.nombre} onChange={e => setUsuario({ ...usuario, nombre: e.target.value })} />
            <input className="border p-2" placeholder="Teléfono" value={usuario.telefono} onChange={e => setUsuario({ ...usuario, telefono: e.target.value })} />
            <input className="border p-2" placeholder="Correo" value={usuario.email} onChange={e => setUsuario({ ...usuario, email: e.target.value })} />
            <select className="border p-2" value={usuario.pais} onChange={e => setUsuario({ ...usuario, pais: e.target.value, estado: '', ciudad: '' })}>
              <option value="">País</option>
              {paisesDisponibles.map((pais, i) => <option key={i}>{pais}</option>)}
            </select>
            <select className="border p-2" value={usuario.estado} onChange={e => setUsuario({ ...usuario, estado: e.target.value, ciudad: '' })}>
              <option value="">Estado</option>
              {estadosDisponibles.map((estado, i) => <option key={i}>{estado}</option>)}
            </select>
            <input className="border p-2" placeholder="Código Postal" value={usuario.cp} onChange={e => setUsuario({ ...usuario, cp: e.target.value })} />
            <select className="border p-2" value={usuario.ciudad} onChange={e => setUsuario({ ...usuario, ciudad: e.target.value })}>
              <option value="">Ciudad</option>
              {ciudadesDisponibles.map((ciudad, i) => <option key={i}>{ciudad.name}</option>)}
            </select>
          </div>

          <div>
            <label className="font-semibold">Foto de perfil</label>
            <input type="file" accept="image/*" onChange={(e) => setFotoAdmin(e.target.files[0])} />
          </div>

          <label className="inline-flex items-center">
            <input type="checkbox" className="mr-2" checked={accesoContable} onChange={() => setAccesoContable(!accesoContable)} />
            Este usuario tendrá acceso al módulo contable
          </label>

          <div className="pt-4">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
              Guardar información
            </button>
          </div>
        </form>
      )}
    </div>
  );
}