// usuarios.jsx
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Lock, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

// Para selects de país/estado/municipio
const URL_UBICACIONES = "/ubicaciones.json";

export default function UsuariosDelSistema() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalPermisos, setModalPermisos] = useState(false);
  const [usuarioPermisos, setUsuarioPermisos] = useState(null);

  // --- Para formulario alta/edición ---
  const [modalForm, setModalForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    genero: "",
    fechaNacimiento: "",
    direccion: "",
    cp: "",
    pais: "",
    estado: "",
    municipio: "",
    foto: null,
    contrasena: "",
    permisos: {},
  });

  // --- Para dropdown de ubicaciones ---
  const [paises, setPaises] = useState([]);
  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);



  useEffect(() => {
    fetch("http://localhost:8000/usuarios")
      .then(r => r.json())
      .then(setUsuarios);

    fetch(URL_UBICACIONES)
      .then(r => r.json())
      .then(data => setPaises(data));
  }, []);

  // Cuando cambia país o estado
  useEffect(() => {
    const paisObj = paises.find(p => p.name === form.pais);
    setEstados(paisObj ? paisObj.states : []);
    const estadoObj = estados.find(e => e.name === form.estado);
    setMunicipios(estadoObj ? estadoObj.cities : []);
  }, [form.pais, form.estado, paises, estados]);

  // Para edición
  const abrirModalEditar = (usuario) => {
    setEditando(usuario.id);
    setForm({
      ...usuario,
      fechaNacimiento: usuario.fecha_nacimiento,
      foto: null, // sólo para alta, carga real faltaría endpoint
      contrasena: "", // solo si edita la pass
    });
    setModalForm(true);
  };

  // Reset form
  const abrirModalAlta = () => {
    setEditando(null);
    setForm({
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      genero: "",
      fechaNacimiento: "",
      direccion: "",
      cp: "",
      pais: "",
      estado: "",
      municipio: "",
      foto: null,
      contrasena: "",
      permisos: {},
    });
    setModalForm(true);
  };

    // --- Manejo de cambios en el formulario ---
  const handleChange = e => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm(f => ({ ...f, [name]: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // --- Guardar usuario (POST o PUT) ---
  const guardarUsuario = async e => {
    e.preventDefault();
    // Simple validación: requiere correo y nombre
    if (!form.nombre || !form.apellido || !form.correo) {
      alert("Nombre, apellido y correo son obligatorios");
      return;
    }
    // Si editando, PUT; si no, POST
    const method = editando ? "PUT" : "POST";
    const url = editando
      ? `http://localhost:8000/usuarios/${editando}`
      : "http://localhost:8000/usuarios";
    // Prepara datos (ajusta campo fecha)
    const datos = { ...form, fecha_nacimiento: form.fechaNacimiento };
    delete datos.fechaNacimiento;
    // Foto/avatar (no implementado el endpoint aquí, solo dejo preparado)
    // datos.foto_url = ... (sube archivo si tienes endpoint)
    // No envía campo permisos en el alta, solo en permisos
    delete datos.permisos;
    // Guardar en backend
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    if (!res.ok) {
      alert("Error al guardar usuario");
      return;
    }
    setModalForm(false);
    // Refresca lista usuarios
    fetch("http://localhost:8000/usuarios")
      .then(r => r.json())
      .then(setUsuarios);
  };

  // --- Borrar usuario ---
  const borrarUsuario = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    await fetch(`http://localhost:8000/usuarios/${id}`, { method: "DELETE" });
    setUsuarios(us => us.filter(u => u.id !== id));
  };

  // --- Modal formulario ---
  const FormModal = (
    <Dialog open={modalForm} onOpenChange={setModalForm}>
      <DialogContent className="w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={guardarUsuario} className="space-y-3">
          <div className="flex gap-2">
            <Input
              className="w-1/2"
              name="nombre"
              placeholder="Nombre(s)"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <Input
              className="w-1/2"
              name="apellido"
              placeholder="Apellido(s)"
              value={form.apellido}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex gap-2">
            <Input
              name="correo"
              placeholder="Correo electrónico"
              value={form.correo}
              onChange={handleChange}
              required
              type="email"
            />
            <Input
              name="telefono"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={handleChange}
              type="tel"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={form.genero}
              onValueChange={v => setForm(f => ({ ...f, genero: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Femenino">Femenino</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            <Input
              name="fechaNacimiento"
              placeholder="Fecha nacimiento (dd-mm-yyyy)"
              value={form.fechaNacimiento}
              onChange={handleChange}
              type="text"
              pattern="\d{2}-\d{2}-\d{4}"
            />
          </div>
          <Input
            name="direccion"
            placeholder="Dirección"
            value={form.direccion}
            onChange={handleChange}
          />
          <div className="flex gap-2">
            <Input
              name="cp"
              placeholder="Código postal"
              value={form.cp}
              onChange={handleChange}
              type="text"
            />
            {/* Selects dependientes para país, estado, municipio */}
            <Select
              value={form.pais}
              onValueChange={v => setForm(f => ({ ...f, pais: v, estado: "", municipio: "" }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                {paises.map(p => (
                  <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={form.estado}
              onValueChange={v => setForm(f => ({ ...f, estado: v, municipio: "" }))}
              disabled={!form.pais}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {estados.map(e => (
                  <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={form.municipio}
              onValueChange={v => setForm(f => ({ ...f, municipio: v }))}
              disabled={!form.estado}
            >
              <SelectTrigger>
                <SelectValue placeholder="Municipio" />
              </SelectTrigger>
              <SelectContent>
                {municipios.map(m => (
                  <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              name="contrasena"
              placeholder={editando ? "Nueva contraseña (opcional)" : "Contraseña"}
              value={form.contrasena}
              onChange={handleChange}
              type="password"
            />
            <Input
              type="file"
              name="foto"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
          <DialogFooter>
            <Button type="submit">{editando ? "Guardar cambios" : "Crear usuario"}</Button>
            <Button type="button" variant="secondary" onClick={() => setModalForm(false)}>Cancelar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

    // --- Tarjetas y acciones usuario ---
  const handleAbrirPermisos = (usuario) => {
    setUsuarioPermisos(usuario);
    setModalPermisos(true);
  };

  const handleGuardarPermisos = async (permisos) => {
    if (!usuarioPermisos) return;
    await fetch(`http://localhost:8000/usuarios/${usuarioPermisos.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...usuarioPermisos, permisos }),
    });
    setUsuarios(us =>
      us.map(u => (u.id === usuarioPermisos.id ? { ...u, permisos } : u))
    );
    setModalPermisos(false);
  };

  // --- Render de usuarios y acciones ---
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Usuarios del sistema</h2>
      <div className="mb-4">
        <Button onClick={abrirModalAlta}>
          <PlusCircle className="mr-2" /> Agregar usuario
        </Button>
      </div>
      <div className="flex flex-wrap gap-8">
        {usuarios.map(u => (
          <Card key={u.id} className="w-[380px] p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-lg">
                  {u.nombre} {u.apellido}
                </div>
                <div className="text-xs text-slate-500">{u.correo}</div>
              </div>
              <div>
                {u.foto ? (
                  <img
                    src={u.foto}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover border shadow"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-200 text-3xl">
                    {u.genero === "Femenino" ? "👩" : "👨"}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3 self-end">
              <Button size="icon" variant="ghost" onClick={() => abrirModalEditar(u)}>
                <Pencil size={18} />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => borrarUsuario(u.id)}>
                <Trash2 size={18} />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleAbrirPermisos(u)}>
                <Lock size={18} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {/* Modal de alta/edición */}
      {FormModal}
      {/* Modal de permisos */}
      <PermisosModal
        open={modalPermisos}
        onClose={() => setModalPermisos(false)}
        usuario={usuarioPermisos}
        onGuardar={handleGuardarPermisos}
      />
    </div>
  );
}

// -----------------------------------
// MODAL DE PERMISOS DE USUARIO
// -----------------------------------
function PermisosModal({ open, onClose, usuario, onGuardar }) {
  const [permisos, setPermisos] = useState(usuario?.permisos || {});
  const [busquedaCentro, setBusquedaCentro] = useState("");
  const [busquedaDenuncia, setBusquedaDenuncia] = useState("");
  const [busquedaPregunta, setBusquedaPregunta] = useState("");
  const [busquedaSugerencia, setBusquedaSugerencia] = useState("");

  // Listados dinámicos
  const [denuncias, setDenuncias] = useState([]);
  const [preguntas, setPreguntas] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [reportantes, setReportantes] = useState([]);
  const [centros, setCentros] = useState([]);

  // Canales y flujos
  const canalesDisponibles = [
    "Web", "Teléfono", "App", "Whatsapp", "Email", "Chat", "Walking door"
  ];
  const flujosDisponibles = [
    "Nuevo", "Pendiente", "En proceso", "En resolución", "En cierre"
  ];
  const globalesDisponibles = [
    "dashboard", "bitacora", "estadisticas", "exportables"
  ];

  useEffect(() => {
    if (!open) return;
    fetch("http://localhost:8000/denuncias").then(r => r.json()).then(setDenuncias);
    fetch("http://localhost:8000/preguntas").then(r => r.json()).then(setPreguntas);
    fetch("http://localhost:8000/sugerencias").then(r => r.json()).then(setSugerencias);
    fetch("http://localhost:8000/reportantes").then(r => r.json()).then(setReportantes);
    fetch("http://localhost:8000/centros").then(r => r.json()).then(setCentros);
    setPermisos(usuario?.permisos || {});
  }, [open, usuario]);

  // --- Helpers para cambiar permisos ---
  const togglePermiso = (seccion, id, tipo, checked) => {
    setPermisos(prev => {
      const actual = { ...prev };
      if (!actual[seccion]) actual[seccion] = {};
      if (!actual[seccion][id]) actual[seccion][id] = [];
      if (checked) {
        if (!actual[seccion][id].includes(tipo)) actual[seccion][id].push(tipo);
      } else {
        actual[seccion][id] = actual[seccion][id].filter(p => p !== tipo);
        if (actual[seccion][id].length === 0) delete actual[seccion][id];
      }
      return { ...actual };
    });
  };

  const togglePermisoSimple = (seccion, id, checked) => {
    setPermisos(prev => {
      const actual = { ...prev };
      if (!actual[seccion]) actual[seccion] = [];
      if (checked) {
        if (!actual[seccion].includes(id)) actual[seccion].push(id);
      } else {
        actual[seccion] = actual[seccion].filter(v => v !== id);
      }
      return { ...actual };
    });
  };

  const toggleCanal = (canal, checked) => {
    setPermisos(prev => {
      const actual = { ...prev };
      if (!actual.canales) actual.canales = [];
      if (checked) {
        if (!actual.canales.includes(canal)) actual.canales.push(canal);
      } else {
        actual.canales = actual.canales.filter(c => c !== canal);
      }
      return { ...actual };
    });
  };

  const toggleFlujo = (flujo, checked) => {
    setPermisos(prev => {
      const actual = { ...prev };
      if (!actual.flujos) actual.flujos = [];
      if (checked) {
        if (!actual.flujos.includes(flujo)) actual.flujos.push(flujo);
      } else {
        actual.flujos = actual.flujos.filter(f => f !== flujo);
      }
      return { ...actual };
    });
  };

  const toggleGlobal = (global, checked) => {
    setPermisos(prev => {
      const actual = { ...prev };
      if (!actual.globales) actual.globales = [];
      if (checked) {
        if (!actual.globales.includes(global)) actual.globales.push(global);
      } else {
        actual.globales = actual.globales.filter(g => g !== global);
      }
      return { ...actual };
    });
  };

  // --- Select all helpers ---
  const selectAll = (seccion, tipo) => {
    setPermisos(prev => {
      const actual = { ...prev };
      actual[seccion] = {};
      let catalogo = [];
      if (seccion === "denuncias") catalogo = denuncias;
      if (seccion === "preguntas") catalogo = preguntas;
      if (seccion === "sugerencias") catalogo = sugerencias;
      catalogo.forEach(item => {
        actual[seccion][item.id] = tipo === "ambos" ? ["ver", "editar"] : [tipo];
      });
      return { ...actual };
    });
  };

  const selectAllSimple = (seccion, catalogo) => {
    setPermisos(prev => {
      const actual = { ...prev };
      actual[seccion] = catalogo.map(item => item.id);
      return { ...actual };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Permisos del usuario</DialogTitle>
        </DialogHeader>
        <Accordion type="multiple" defaultValue={["denuncias", "preguntas", "sugerencias", "reportantes", "centros", "canales", "flujos", "globales"]}>
          {/* Denuncias */}
          <AccordionItem value="denuncias">
            <AccordionTrigger>Denuncias</AccordionTrigger>
            <AccordionContent>
              <div className="mb-2 flex gap-4 items-center">
                <Button variant="outline" size="sm" onClick={() => selectAll("denuncias", "ver")}>Seleccionar todos Ver</Button>
                <Button variant="outline" size="sm" onClick={() => selectAll("denuncias", "editar")}>Seleccionar todos Editar</Button>
                <Button variant="outline" size="sm" onClick={() => selectAll("denuncias", "ambos")}>Seleccionar todos Ambos</Button>
                <Input
                  className="ml-auto w-60"
                  placeholder="Buscar denuncia..."
                  value={busquedaDenuncia}
                  onChange={e => setBusquedaDenuncia(e.target.value)}
                  size="sm"
                />
              </div>
              <div className="max-h-56 overflow-y-auto border rounded">
                <div className="flex font-semibold px-3 py-2 bg-slate-100">
                  <div className="w-2/3">Título</div>
                  <div className="w-1/6 text-center">Ver</div>
                  <div className="w-1/6 text-center">Editar</div>
                </div>
                {denuncias
                  .filter(d => d.titulo.toLowerCase().includes(busquedaDenuncia.toLowerCase()))
                  .map(d => (
                  <div key={d.id} className="flex items-center px-3 py-2 border-b">
                    <div className="w-2/3">{d.titulo}</div>
                    <div className="w-1/6 flex justify-center">
                      <Switch checked={permisos.denuncias?.[d.id]?.includes("ver") || false}
                        onCheckedChange={checked => togglePermiso("denuncias", d.id, "ver", checked)} />
                    </div>
                    <div className="w-1/6 flex justify-center">
                      <Switch checked={permisos.denuncias?.[d.id]?.includes("editar") || false}
                        onCheckedChange={checked => togglePermiso("denuncias", d.id, "editar", checked)} />
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Preguntas */}
          <AccordionItem value="preguntas">
            <AccordionTrigger>Preguntas</AccordionTrigger>
            <AccordionContent>
              <div className="mb-2 flex gap-4 items-center">
                <Button variant="outline" size="sm" onClick={() => selectAll("preguntas", "ver")}>Seleccionar todos Ver</Button>
                <Button variant="outline" size="sm" onClick={() => selectAll("preguntas", "editar")}>Seleccionar todos Editar</Button>
                <Button variant="outline" size="sm" onClick={() => selectAll("preguntas", "ambos")}>Seleccionar todos Ambos</Button>
                <Input
                  className="ml-auto w-60"
                  placeholder="Buscar pregunta..."
                  value={busquedaPregunta}
                  onChange={e => setBusquedaPregunta(e.target.value)}
                  size="sm"
                />
              </div>
              <div className="max-h-56 overflow-y-auto border rounded">
                <div className="flex font-semibold px-3 py-2 bg-slate-100">
                  <div className="w-2/3">Pregunta</div>
                  <div className="w-1/6 text-center">Ver</div>
                  <div className="w-1/6 text-center">Editar</div>
                </div>
                {preguntas
                  .filter(p => p.titulo.toLowerCase().includes(busquedaPregunta.toLowerCase()))
                  .map(p => (
                  <div key={p.id} className="flex items-center px-3 py-2 border-b">
                    <div className="w-2/3">{p.titulo}</div>
                    <div className="w-1/6 flex justify-center">
                      <Switch checked={permisos.preguntas?.[p.id]?.includes("ver") || false}
                        onCheckedChange={checked => togglePermiso("preguntas", p.id, "ver", checked)} />
                    </div>
                    <div className="w-1/6 flex justify-center">
                      <Switch checked={permisos.preguntas?.[p.id]?.includes("editar") || false}
                        onCheckedChange={checked => togglePermiso("preguntas", p.id, "editar", checked)} />
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Sugerencias */}
          <AccordionItem value="sugerencias">
            <AccordionTrigger>Sugerencias</AccordionTrigger>
            <AccordionContent>
              <div className="mb-2 flex gap-4 items-center">
                <Button variant="outline" size="sm" onClick={() => selectAll("sugerencias", "ver")}>Seleccionar todos Ver</Button>
                <Button variant="outline" size="sm" onClick={() => selectAll("sugerencias", "editar")}>Seleccionar todos Editar</Button>
                <Button variant="outline" size="sm" onClick={() => selectAll("sugerencias", "ambos")}>Seleccionar todos Ambos</Button>
                <Input
                  className="ml-auto w-60"
                  placeholder="Buscar sugerencia..."
                  value={busquedaSugerencia}
                  onChange={e => setBusquedaSugerencia(e.target.value)}
                  size="sm"
                />
              </div>
              <div className="max-h-56 overflow-y-auto border rounded">
                <div className="flex font-semibold px-3 py-2 bg-slate-100">
                  <div className="w-2/3">Sugerencia</div>
                  <div className="w-1/6 text-center">Ver</div>
                  <div className="w-1/6 text-center">Editar</div>
                </div>
                {sugerencias
                  .filter(s => s.titulo.toLowerCase().includes(busquedaSugerencia.toLowerCase()))
                  .map(s => (
                  <div key={s.id} className="flex items-center px-3 py-2 border-b">
                    <div className="w-2/3">{s.titulo}</div>
                    <div className="w-1/6 flex justify-center">
                      <Switch checked={permisos.sugerencias?.[s.id]?.includes("ver") || false}
                        onCheckedChange={checked => togglePermiso("sugerencias", s.id, "ver", checked)} />
                    </div>
                    <div className="w-1/6 flex justify-center">
                      <Switch checked={permisos.sugerencias?.[s.id]?.includes("editar") || false}
                        onCheckedChange={checked => togglePermiso("sugerencias", s.id, "editar", checked)} />
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Tipos de reportante */}
          <AccordionItem value="reportantes">
            <AccordionTrigger>Tipos de reportante</AccordionTrigger>
            <AccordionContent>
              <div className="mb-2">
                <Button variant="outline" size="sm" onClick={() => selectAllSimple("reportantes", reportantes)}>Seleccionar todos</Button>
              </div>
              <div className="max-h-56 overflow-y-auto border rounded">
                {reportantes.map(r => (
                  <div key={r.id} className="flex items-center px-3 py-2 border-b">
                    <div className="w-4/5">{r.etiqueta}</div>
                    <div className="w-1/5 flex justify-center">
                      <Switch checked={permisos.reportantes?.includes(r.id) || false}
                        onCheckedChange={checked => togglePermisoSimple("reportantes", r.id, checked)} />
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Centros de trabajo */}
          <AccordionItem value="centros">
            <AccordionTrigger>Centros de trabajo</AccordionTrigger>
            <AccordionContent>
              <div className="mb-2 flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-sm"
                  onClick={() => selectAllSimple("centros_trabajo", centros)}
                >
                  Seleccionar todos
                </Button>
                <Input
                  className="h-8 text-sm w-56"
                  value={busquedaCentro}
                  onChange={e => setBusquedaCentro(e.target.value)}
                  placeholder="Buscar centro de trabajo..."
                />
              </div>
              <div className="max-h-56 overflow-y-auto border rounded">
                {centros
                  .filter(c => c.nombre.toLowerCase().includes(busquedaCentro.toLowerCase()))
                  .map(c => (
                  <div key={c.id} className="flex items-center px-3 py-2 border-b">
                    <div className="w-4/5">{c.nombre}</div>
                    <div className="w-1/5 flex justify-center">
                      <Switch checked={permisos.centros_trabajo?.includes(c.id) || false}
                        onCheckedChange={checked => togglePermisoSimple("centros_trabajo", c.id, checked)} />
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Canales */}
          <AccordionItem value="canales">
            <AccordionTrigger>Canales de recepción</AccordionTrigger>
            <AccordionContent>
              <div className="mb-2">
                <Button variant="outline" size="sm" onClick={() => setPermisos(prev => ({ ...prev, canales: [...canalesDisponibles] }))}>Seleccionar todos</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {canalesDisponibles.map(canal => (
                  <label key={canal} className="flex items-center gap-2 border rounded px-3 py-1">
                    <input type="checkbox"
                      checked={permisos.canales?.includes(canal) || false}
                      onChange={e => toggleCanal(canal, e.target.checked)}
                    />
                    {canal}
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Flujos */}
          <AccordionItem value="flujos">
            <AccordionTrigger>Etapas del flujo de atención</AccordionTrigger>
            <AccordionContent>
              <div className="mb-2">
                <Button variant="outline" size="sm" onClick={() => setPermisos(prev => ({ ...prev, flujos: [...flujosDisponibles] }))}>Seleccionar todos</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {flujosDisponibles.map(flujo => (
                  <label key={flujo} className="flex items-center gap-2 border rounded px-3 py-1">
                    <input type="checkbox"
                      checked={permisos.flujos?.includes(flujo) || false}
                      onChange={e => toggleFlujo(flujo, e.target.checked)}
                    />
                    {flujo}
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Globales */}
          <AccordionItem value="globales">
            <AccordionTrigger>Permisos globales</AccordionTrigger>
            <AccordionContent>
              <div className="mb-2">
                <Button variant="outline" size="sm" onClick={() => setPermisos(prev => ({ ...prev, globales: [...globalesDisponibles] }))}>Seleccionar todos</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {globalesDisponibles.map(g => (
                  <label key={g} className="flex items-center gap-2 border rounded px-3 py-1">
                    <input type="checkbox"
                      checked={permisos.globales?.includes(g) || false}
                      onChange={e => toggleGlobal(g, e.target.checked)}
                    />
                    {g}
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="mb-6">
          <div className="text-sm font-semibold mb-1">
            Solicitudes especiales de permiso de usuario
          </div>
          <textarea
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            placeholder="Si usted requiere permisos especiales que no es posible hacer con estas herramientas, describa lo más detallado posible su requerimiento"
            value={permisos.solicitudEspecial || ""}
            onChange={e =>
              setPermisos(p => ({ ...p, solicitudEspecial: e.target.value }))
            }
          />
        </div>
        <div className="flex w-full gap-2 justify-start mt-4">
          <Button onClick={() => onGuardar(permisos)}>Guardar permisos</Button>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}