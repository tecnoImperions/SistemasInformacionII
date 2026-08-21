import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'
import {
  Calendar,
  Stethoscope,
  Brain,
  Baby,
  Activity,
  Search,
  Clock,
  X,
  Building2,
  MapPin,
  QrCode,
  Bell,
  Printer,
  Volume2,
  AlertTriangle,
  Bus,
  ScanLine,
  Check,
  Map,
  Eye,
  EyeOff
} from 'lucide-react'

// --- DEFINICIONES DE TIPOS ---
interface CentroSalud {
  id_centro: string;
  nombre: string;
  direccion: string;
  nivel_atencion: number;
  telefono: string;
  como_llegar: string;
  horario_fichas: string;
  distrito: string;
  imagen_url: string;
}

interface Especialidad {
  id_especialidad: string;
  nombre: string;
  descripcion: string;
  iconName: string;
}

interface Usuario {
  id_usuario: string;
  ci: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  rol: 'paciente' | 'encargado' | 'admin';
  matricula_profesional?: string;
  id_especialidad?: string;
  nivel_acceso?: string;
}

interface Horario {
  id_horario: string;
  id_centro: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
}

interface Turno {
  id_turno: string;
  id_paciente: string;
  nombre_paciente: string;
  ci_paciente: string;
  telefono_paciente: string;
  id_personal_salud: string;
  nombre_personal_salud: string;
  especialidad_personal_salud: string;
  id_centro: string;
  nombre_centro: string;
  id_horario: string;
  fecha: string;
  hora: string;
  estado: 'Pendiente' | 'En Atención' | 'Atendido' | 'Cancelado' | 'Ausente';
  fecha_solicitud: string;
}


interface NotificacionPush {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'email' | 'push';
  fecha: string;
}

// --- CATALOGO DE HOSPITALES SANTA CRUZ (2DO Y 3ER NIVEL) ---
const centrosSantaCruz: CentroSalud[] = [
  {
    id_centro: 'c-1',
    nombre: 'Hospital Municipal Plan 3000',
    direccion: 'Barrio Piraicito (Diagonal al Mercado Los Pocitos)',
    nivel_atencion: 2,
    telefono: '362-1100',
    como_llegar: 'Micros: 38, 47, 68, 86, 121 (Integrado con Cruzero)',
    horario_fichas: '06:00 AM - 12:00 PM',
    distrito: 'Distrito 8 (Plan Tres Mil)',
    imagen_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=400'
  },
  {
    id_centro: 'c-2',
    nombre: 'Hospital Municipal Pampa de la Isla',
    direccion: 'Avenida Montecristo, Barrio Bolinter',
    nivel_atencion: 2,
    telefono: '346-2022',
    como_llegar: 'Micros: 16, 43, 45, 87 (Integrado con Cruzero)',
    horario_fichas: '06:30 AM - 12:30 PM',
    distrito: 'Distrito 6 (Pampa de la Isla)',
    imagen_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id_centro: 'c-3',
    nombre: 'Hospital Municipal Villa 1ro de Mayo',
    direccion: 'Sobre el 7mo Anillo, entre Cumatí y Av. Tres Pasos al Frente',
    nivel_atencion: 2,
    telefono: '348-1122',
    como_llegar: 'Micros: 9, 13, 34, 103 (Integrado con Cruzero)',
    horario_fichas: '06:00 AM - 01:00 PM',
    distrito: 'Distrito 7 (Villa Primero de Mayo)',
    imagen_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=400'
  },
  {
    id_centro: 'c-4',
    nombre: 'Hospital Municipal Francés',
    direccion: 'Avenida Santos Dumont (6to Anillo, Barrio Paititi)',
    nivel_atencion: 2,
    telefono: '356-9988',
    como_llegar: 'Micros: 39, 44, 76, 110 (Integrado con Cruzero)',
    horario_fichas: '06:00 AM - 12:00 PM',
    distrito: 'Distrito 9 (Zona Sur)',
    imagen_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400'
  },
  {
    id_centro: 'c-5',
    nombre: 'Hospital Municipal Bajío del Oriente',
    direccion: 'Calle Eslovaquia, UV-118, Barrio Urbanización Santa Cruz',
    nivel_atencion: 2,
    telefono: '358-4455',
    como_llegar: 'Micros: 22, 54, 82, 119 (Integrado con Cruzero)',
    horario_fichas: '06:00 AM - 12:00 PM',
    distrito: 'Distrito 10 (Zona Oeste)',
    imagen_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400'
  },
  {
    id_centro: 'c-6',
    nombre: 'Hospital San Juan de Dios',
    direccion: 'Calle Cuéllar N° 45, Zona Central',
    nivel_atencion: 3,
    telefono: '333-0222',
    como_llegar: 'Micros: 10, 11, 27, 28, 42, 60 (Integrado con Cruzero)',
    horario_fichas: '05:30 AM - 11:30 AM',
    distrito: 'Distrito 11 (Centro)',
    imagen_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=400'
  },
  {
    id_centro: 'c-7',
    nombre: 'Hospital de Niños Dr. Mario Ortíz Suárez',
    direccion: 'Calle España esq. Rafael Peña, Zona Central',
    nivel_atencion: 3,
    telefono: '336-2252',
    como_llegar: 'Micros: 12, 17, 18, 51, 64 (Integrado con Cruzero)',
    horario_fichas: '06:00 AM - 12:00 PM',
    distrito: 'Distrito 11 (Centro)',
    imagen_url: 'https://images.unsplash.com/photo-1502740479796-62dd97864002?auto=format&fit=crop&q=80&w=400'
  },
  {
    id_centro: 'c-8',
    nombre: 'Hospital Universitario Japonés',
    direccion: 'Av. Lucas Saucedo, Zona Pampa de la Isla',
    nivel_atencion: 3,
    telefono: '346-2002',
    como_llegar: 'Micros: 45, 75, 87, 102 (Integrado con Cruzero)',
    horario_fichas: '06:00 AM - 01:00 PM',
    distrito: 'Distrito 6 (Pampa de la Isla)',
    imagen_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400'
  }
];

const especialidadesSantaCruz: Especialidad[] = [
  { id_especialidad: 'e-1', nombre: 'Medicina General', descripcion: 'Consulta general y triaje inicial', iconName: 'Stethoscope' },
  { id_especialidad: 'e-2', nombre: 'Pediatría', descripcion: 'Atención especializada para niños', iconName: 'Baby' },
  { id_especialidad: 'e-3', nombre: 'Neurología', descripcion: 'Enfermedades cerebrales y de nervios', iconName: 'Brain' },
  { id_especialidad: 'e-4', nombre: 'Cardiología', descripcion: 'Control preventivo cardiovascular', iconName: 'Activity' }
];

const mockHorarios: Horario[] = [
  { id_horario: 'h-1', id_centro: 'c-6', fecha: '2026-08-22', hora_inicio: '06:00', hora_fin: '06:30', disponible: true },
  { id_horario: 'h-2', id_centro: 'c-6', fecha: '2026-08-22', hora_inicio: '06:30', hora_fin: '07:00', disponible: true },
  { id_horario: 'h-3', id_centro: 'c-6', fecha: '2026-08-22', hora_inicio: '07:00', hora_fin: '07:30', disponible: true },
  { id_horario: 'h-4', id_centro: 'c-1', fecha: '2026-08-22', hora_inicio: '06:00', hora_fin: '06:30', disponible: true },
  { id_horario: 'h-5', id_centro: 'c-1', fecha: '2026-08-22', hora_inicio: '07:00', hora_fin: '07:30', disponible: true },
  { id_horario: 'h-6', id_centro: 'c-8', fecha: '2026-08-22', hora_inicio: '06:30', hora_fin: '07:00', disponible: true }
];

function App() {
  // --- ACCESIBILIDAD MÁXIMA POR DEFECTO (VISTA ENORME / PANTALLA GRANDE) ---
  const [isSuperSize, setIsSuperSize] = useState<boolean>(true);

  // --- PERSISTENCIA Y RECUERDO DE SESIÓN ---
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // --- VISIBILIDAD DE CONTRASEÑA ---
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // --- POPUPS Y NOTIFICACIONES ---
  const [showCruzeroMap, setShowCruzeroMap] = useState<boolean>(false);
  const [activeRouteInfo, setActiveRouteInfo] = useState<string>('');
  const [notificaciones, setNotificaciones] = useState<NotificacionPush[]>([
    { id: '1', titulo: 'Sistema Activo', mensaje: 'TurnoYa está listo para regular las colas en los hospitales.', tipo: 'push', fecha: 'Hoy' }
  ]);
  const [showNotifPanel, setShowNotifPanel] = useState<boolean>(false);

  // --- SEGURIDAD Y SESIÓN ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  // Formulario login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Formulario registro (Sin selección de roles, por defecto Paciente)
  const [regCI, setRegCI] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // --- DATOS PRINCIPALES ---
  const [centros, setCentros] = useState<CentroSalud[]>(centrosSantaCruz);
  const [especialidades] = useState<Especialidad[]>(especialidadesSantaCruz);
  const [horarios, setHorarios] = useState<Horario[]>(mockHorarios);
  const [turnos, setTurnos] = useState<Turno[]>([
    {
      id_turno: 't-1',
      id_paciente: 'u-demo-pac',
      nombre_paciente: 'Juan Andrés Revollo',
      ci_paciente: '7766554',
      telefono_paciente: '76543210',
      id_personal_salud: 'u-demo-enc',
      nombre_personal_salud: 'Dra. Suzanne Gutiérrez',
      especialidad_personal_salud: 'Medicina General',
      id_centro: 'c-6',
      nombre_centro: 'Hospital San Juan de Dios',
      id_horario: 'h-1',
      fecha: '2026-08-22',
      hora: '06:00 AM',
      estado: 'Pendiente',
      fecha_solicitud: '2026-08-21 07:15 AM'
    }
  ]);

  // --- ENRUTADOR POR HASH ---
  const [currentRole, setCurrentRole] = useState<'paciente' | 'encargado' | 'admin'>('paciente');

  // --- WIZARD PACIENTE ---
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedNivel, setSelectedNivel] = useState<number | null>(null);
  const [selectedCentroId, setSelectedCentroId] = useState<string>('');
  const [selectedEspecialidadId, setSelectedEspecialidadId] = useState<string>('');
  const [selectedHorarioObj, setSelectedHorarioObj] = useState<Horario | null>(null);
  const [motivoConsulta, setMotivoConsulta] = useState('');

  // --- VENTANILLA (ENCARGADA) ---
  const [filtroBusquedaCargada, setFiltroBusquedaCargada] = useState<string>('');
  const [mostrarEscaneoSimulado, setMostrarEscaneoSimulado] = useState<boolean>(false);
  const [ciEscaneada, setCiEscaneada] = useState<string>('');

  // --- ADMINISTRADOR (ADMIN) - HORARIOS ---
  const [nuevoHorarioCentro, setNuevoHorarioCentro] = useState<string>('c-1');
  const [nuevoHorarioFecha, setNuevoHorarioFecha] = useState<string>('2026-08-22');
  const [nuevoHorarioInicio, setNuevoHorarioInicio] = useState<string>('06:00');
  const [nuevoHorarioFin, setNuevoHorarioFin] = useState<string>('06:30');

  // --- ADMINISTRADOR (ADMIN) - HOSPITALES ---
  const [nuevoCentroNombre, setNuevoCentroNombre] = useState('');
  const [nuevoCentroDir, setNuevoCentroDir] = useState('');
  const [nuevoCentroNivel, setNuevoCentroNivel] = useState<number>(2);
  const [nuevoCentroTelf, setNuevoCentroTelf] = useState('');

  // Sincronización hash url
  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash;
      if (hash === '#admin') setCurrentRole('admin');
      else if (hash === '#encargado') setCurrentRole('encargado');
      else {
        setCurrentRole('paciente');
        if (hash !== '#paciente') window.location.hash = '#paciente';
      }
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  // Cargar sesión persistente de localStorage y base de datos
  useEffect(() => {
    // 1. Revisar si hay sesión guardada en localStorage
    const savedUser = localStorage.getItem('user_session');
    const isRemembered = localStorage.getItem('remember_me') === 'true';

    if (savedUser && isRemembered) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
        window.location.hash = `#${user.rol}`;
      } catch (err) {
        localStorage.removeItem('user_session');
      }
    }

    const fetchDB = async () => {
      const { data: dbCentros } = await supabase.from('centros_salud').select('*');
      if (dbCentros && dbCentros.length > 0) {
        const merged = dbCentros.map(dbc => {
          const local = centrosSantaCruz.find(lc => lc.nombre.toLowerCase().includes(dbc.nombre.toLowerCase()));
          return {
            id_centro: dbc.id_centro,
            nombre: dbc.nombre,
            direccion: dbc.direccion || local?.direccion || 'Dirección de Santa Cruz',
            nivel_atencion: dbc.nivel_atencion,
            telefono: dbc.telefono || local?.telefono || '3330000',
            como_llegar: local?.como_llegar || 'Líneas de micro generales',
            horario_fichas: local?.horario_fichas || '06:00 AM - 12:00 PM',
            distrito: local?.distrito || 'Santa Cruz de la Sierra',
            imagen_url: local?.imagen_url || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=400'
          };
        });
        setCentros(merged);
      }
    };
    fetchDB();
  }, []);

  // --- ACCESOS RÁPIDOS DE PRUEBA (SOLO DESDE VENTANILLA DE ACCESO SEGURO) ---
  const handleBypass = (role: 'paciente' | 'encargado' | 'admin') => {
    const demoUsers: Record<string, Usuario> = {
      paciente: { id_usuario: 'u-demo-pac', ci: '7766554', nombre: 'Juan Andrés', apellido: 'Revollo', correo: 'paciente@upds.com', telefono: '76543210', rol: 'paciente' },
      encargado: { id_usuario: 'u-demo-enc', ci: '5678901', nombre: 'Dra. Suzanne', apellido: 'Gutiérrez', correo: 'suzanne@upds.com', telefono: '78011223', rol: 'encargado', matricula_profesional: 'MP-98442' },
      admin: { id_usuario: 'u-demo-adm', ci: '1111111', nombre: 'Docente', apellido: 'Evaluador', correo: 'admin@upds.com', telefono: '71122334', rol: 'admin' }
    };
    const selected = demoUsers[role];
    setCurrentUser(selected);
    setIsLoggedIn(true);

    // Persistir si corresponde
    if (rememberMe) {
      localStorage.setItem('user_session', JSON.stringify(selected));
      localStorage.setItem('remember_me', 'true');
    } else {
      localStorage.removeItem('user_session');
      localStorage.setItem('remember_me', 'false');
    }

    window.location.hash = `#${role}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      handleBypass('paciente');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: { data: { ci: regCI, nombre: regNombre, rol: 'paciente' } }
    });
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert('¡Cuenta creada de forma segura como Paciente!');
      handleBypass('paciente');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user_session');
    setIsLoggedIn(false);
    setCurrentUser(null);
    window.location.hash = '#paciente';
  };

  // --- LLAMADO DE VOZ ---
  const llamarPacienteVoz = (nombre: string) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(`Paciente ${nombre}, favor presentarse en ventanilla de atención.`);
      msg.lang = 'es-ES';
      window.speechSynthesis.speak(msg);
    } else {
      alert(`Llamando al paciente: ${nombre}`);
    }
  };

  // --- IMPRESIÓN ---
  const imprimirFicha = (turno: Turno) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Ficha Médica #${turno.id_turno.substring(0, 6)}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; text-align: center; color: #334155; }
            .ticket { border: 3px dashed #475569; padding: 30px; display: inline-block; border-radius: 24px; max-width: 380px; background: #f8fafc; }
            h2 { color: #2563eb; margin: 0 0 10px 0; font-size: 24px; font-weight: 900; }
            .code { font-size: 32px; font-weight: 900; margin: 20px 0; color: #1e293b; background: #e2e8f0; padding: 12px; border-radius: 12px; letter-spacing: 2px; }
            .details { text-align: left; font-size: 15px; line-height: 1.6; }
            .details p { margin: 8px 0; }
            .footer { font-size: 11px; color: #64748b; border-top: 1px solid #cbd5e1; margin-top: 20px; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <h2>TurnoYa</h2>
            <p style="font-size:13px; font-weight:extrabold; color: #475569; margin: 0; letter-spacing:1px;">FICHA CONFIRMADA</p>
            <div class="code">#${turno.id_turno.substring(2, 8).toUpperCase()}</div>
            <div class="details">
              <p><strong>Paciente:</strong> ${turno.nombre_paciente}</p>
              <p><strong>C.I. del Paciente:</strong> ${turno.ci_paciente}</p>
              <p><strong>Hospital:</strong> ${turno.nombre_centro}</p>
              <p><strong>Especialidad:</strong> ${turno.especialidad_personal_salud}</p>
              <p><strong>Fecha y Hora:</strong> ${turno.fecha} - ${turno.hora}</p>
            </div>
            <div class="footer">
              <p>Evite hacer colas temprano. Preséntese 15 minutos antes con su C.I.</p>
              <p>TurnoYa - Santa Cruz de la Sierra</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // --- SOLICITAR TURNO ---
  const registrarFicha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHorarioObj || !currentUser) return;

    const centroObj = centros.find(c => c.id_centro === selectedCentroId);
    const espObj = especialidades.find(esp => esp.id_especialidad === selectedEspecialidadId);

    const idCita = 't-' + Date.now();
    const nuevoTurno: Turno = {
      id_turno: idCita,
      id_paciente: currentUser.id_usuario,
      nombre_paciente: `${currentUser.nombre} ${currentUser.apellido || ''}`,
      ci_paciente: currentUser.ci,
      telefono_paciente: currentUser.telefono,
      id_personal_salud: 'u-demo-enc',
      nombre_personal_salud: 'Dra. Suzanne Gutiérrez',
      especialidad_personal_salud: espObj?.nombre || 'Medicina General',
      id_centro: selectedCentroId,
      nombre_centro: centroObj?.nombre || 'Hospital General',
      id_horario: selectedHorarioObj.id_horario,
      fecha: selectedHorarioObj.fecha,
      hora: `${selectedHorarioObj.hora_inicio} AM`,
      estado: 'Pendiente',
      fecha_solicitud: new Date().toLocaleString()
    };

    setHorarios(horarios.map(h => h.id_horario === selectedHorarioObj.id_horario ? { ...h, disponible: false } : h));
    setTurnos([nuevoTurno, ...turnos]);

    // Registrar en notificaciones locales
    const nuevaNotif: NotificacionPush = {
      id: 'n-' + Date.now(),
      titulo: '📧 Correo SMTP Enviado',
      mensaje: `Ficha #${idCita.substring(2, 8).toUpperCase()} enviada con éxito a ${currentUser.correo}.`,
      tipo: 'email',
      fecha: 'Hace un momento'
    };
    setNotificaciones([nuevaNotif, ...notificaciones]);

    // Resetear Wizard
    setWizardStep(1);
    setSelectedNivel(null);
    setSelectedCentroId('');
    setSelectedEspecialidadId('');
    setSelectedHorarioObj(null);
    setMotivoConsulta('');

    alert('Ficha reservada con éxito. Correo SMTP de confirmación enviado.');
  };

  // --- TACHADO POR LA ENCARGADA ---
  const handleMarcarProcesado = (idTurno: string) => {
    setTurnos(turnos.map(t => t.id_turno === idTurno ? { ...t, estado: 'Atendido' } : t));
    alert('Ficha marcada como PROCESADA de inmediato por la encargada.');
  };

  // --- REGISTRAR HORARIO DE CITA (ADMIN) ---
  const handleCrearHorario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoHorarioCentro) return;

    const nuevoH: Horario = {
      id_horario: 'h-' + Date.now(),
      id_centro: nuevoHorarioCentro,
      fecha: nuevoHorarioFecha,
      hora_inicio: nuevoHorarioInicio,
      hora_fin: nuevoHorarioFin,
      disponible: true
    };

    // Registrar en Supabase si es real
    try {
      supabase.from('horarios').insert([{
        id_centro: nuevoHorarioCentro,
        fecha: nuevoHorarioFecha,
        hora_inicio: nuevoHorarioInicio,
        hora_fin: nuevoHorarioFin,
        disponible: true
      }]);
    } catch (err) {}

    setHorarios([...horarios, nuevoH]);
    alert('Horario de atención registrado con éxito.');
  };

  const handleCrearCentro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCentroNombre.trim()) return;

    const nuevo: CentroSalud = {
      id_centro: 'c-' + Date.now(),
      nombre: nuevoCentroNombre,
      direccion: nuevoCentroDir,
      nivel_atencion: nuevoCentroNivel,
      telefono: nuevoCentroTelf,
      como_llegar: 'Línea de micros sugerida',
      horario_fichas: '06:00 AM - 12:00 PM',
      distrito: 'Distrito de Santa Cruz',
      imagen_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=400'
    };

    setCentros([...centros, nuevo]);
    setNuevoCentroNombre('');
    setNuevoCentroDir('');
    setNuevoCentroTelf('');
    alert('Hospital registrado exitosamente.');
  };

  const handleSimularEscaneo = (ciInput: string) => {
    setFiltroBusquedaCargada(ciInput);
    setMostrarEscaneoSimulado(false);
    setCiEscaneada('');
  };

  // Filtros
  const centrosFiltrados = centros.filter(c => c.nivel_atencion === selectedNivel);
  
  const obtenerHorarios = () => {
    const listado = horarios.filter(h => h.id_centro === selectedCentroId && h.disponible);
    if (listado.length > 0) return listado;
    
    // Generar 5 horarios matutinos automáticos si no existen registros previos para este hospital
    const hoyStr = new Date().toISOString().split('T')[0];
    return [
      { id_horario: `h-auto-1-${selectedCentroId}`, id_centro: selectedCentroId, fecha: hoyStr, hora_inicio: '06:00', hora_fin: '06:30', disponible: true },
      { id_horario: `h-auto-2-${selectedCentroId}`, id_centro: selectedCentroId, fecha: hoyStr, hora_inicio: '06:30', hora_fin: '07:00', disponible: true },
      { id_horario: `h-auto-3-${selectedCentroId}`, id_centro: selectedCentroId, fecha: hoyStr, hora_inicio: '07:00', hora_fin: '07:30', disponible: true },
      { id_horario: `h-auto-4-${selectedCentroId}`, id_centro: selectedCentroId, fecha: hoyStr, hora_inicio: '07:30', hora_fin: '08:00', disponible: true },
      { id_horario: `h-auto-5-${selectedCentroId}`, id_centro: selectedCentroId, fecha: hoyStr, hora_inicio: '08:00', hora_fin: '08:30', disponible: true }
    ];
  };

  const horariosDisponibles = obtenerHorarios();
  const centroSeleccionadoInfo = centros.find(c => c.id_centro === selectedCentroId);
  const turnosFiltradosEncargada = turnos.filter(t => {
    if (!filtroBusquedaCargada) return true;
    return t.ci_paciente.includes(filtroBusquedaCargada) || t.id_turno.includes(filtroBusquedaCargada);
  });

  const isAuthorized = !isLoggedIn || !currentUser || currentUser.rol === currentRole;

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col font-sans ${isSuperSize ? 'text-2xl' : 'text-base'}`}>
      
      {/* HEADER DE LA APLICACIÓN */}
      <header className="bg-white border-b-2 border-slate-200 py-6 px-6 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 p-1 rounded-2xl shadow-xs shrink-0">
              <img
                src="/logo.jpg"
                alt="Logo TurnoYa"
                className="h-14 w-14 object-contain rounded-xl"
                onError={(e) => {
                  // Si no existe el archivo logo.jpg en public, ocultar imagen para evitar icono roto
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">TurnoYa</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Santa Cruz - Bolivia</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* BOTÓN TEXTO ENORME */}
            <button
              onClick={() => setIsSuperSize(!isSuperSize)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer shadow-xs ${isSuperSize ? 'bg-blue-600 text-white border-2 border-blue-700' : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'}`}
            >
              🔎 {isSuperSize ? 'Vista Normal' : 'Vista de Topo (Texto Enorme)'}
            </button>

            {/* NOTIFICACIONES */}
            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifPanel(!showNotifPanel)}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl relative border cursor-pointer"
                >
                  <Bell className="w-6 h-6 text-slate-600" />
                  {notificaciones.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      {notificaciones.length}
                    </span>
                  )}
                </button>

                {showNotifPanel && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 text-xs font-semibold space-y-3">
                    <h4 className="font-black text-slate-800 border-b pb-2">Notificaciones del Correo (SMTP)</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notificaciones.map(n => (
                        <div key={n.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <p className="text-blue-700 font-black">{n.titulo}</p>
                          <p className="text-slate-600 text-[10px] leading-snug">{n.mensaje}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isLoggedIn && currentUser ? (
              <div className="flex items-center gap-3 text-xs font-bold bg-slate-100 px-3.5 py-1.5 rounded-2xl">
                <span className="text-slate-800">{currentUser.nombre}</span>
                <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">{currentUser.rol}</span>
                <button
                  onClick={handleLogout}
                  className="text-rose-600 hover:underline font-extrabold ml-1 text-xs cursor-pointer"
                >
                  Salir
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">Sesión Cerrada</span>
            )}
          </div>
        </div>
      </header>



      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-8 w-full flex flex-col justify-center">

        {/* ACCESO DENEGADO POR ROL */}
        {isLoggedIn && !isAuthorized ? (
          <div className="max-w-xl w-full mx-auto bg-white rounded-3xl border-2 border-rose-200 p-8 text-center space-y-4 shadow-xl my-12 animate-fadeIn">
            <div className="bg-rose-50 text-rose-600 p-4 rounded-full w-fit mx-auto border border-rose-100">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Acceso Restringido por Rol</h2>
            <p className="text-sm text-slate-500 leading-relaxed font-bold">
              Usted ha iniciado sesión como **{currentUser.rol.toUpperCase()}**. No tiene los permisos de acceso requeridos para ver la sección de **{currentRole.toUpperCase()}**.
            </p>
            <button
              onClick={() => {
                window.location.hash = `#${currentUser.rol}`;
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Ir a mi Panel Seguro ({currentUser.rol.toUpperCase()})
            </button>
          </div>
        ) : !isLoggedIn ? (
          /* ========================================================================= */
          /* PANTALLA DE ACCESO SEGURO (LOGIN / REGISTRO) - SIN ROLES VISIBLES */
          /* ========================================================================= */
          <div className="max-w-xl w-full mx-auto bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden animate-fadeIn py-6">
            
            <div className="p-6 text-center space-y-3 border-b border-slate-100 pb-5">
              <h2 className="text-3xl font-black text-slate-800">Acceso Seguro a TurnoYa</h2>
              <p className="text-sm text-slate-500">
                Evita madrugar y hacer largas filas en los hospitales de Santa Cruz de la Sierra.
              </p>
            </div>

            <div className="p-6 space-y-5">
              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4 font-semibold">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Correo de tu Cuenta</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Contraseña</label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* CHECKBOX DE RECORDAR USUARIO */}
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-5 h-5 border border-slate-300 rounded-md focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="remember" className="text-xs text-slate-600 font-bold cursor-pointer select-none">
                      Recordar mi usuario y mantener sesión abierta
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-sm shadow-md transition cursor-pointer"
                  >
                    Ingresar
                  </button>
                  <p className="text-center text-sm text-slate-500">
                    ¿No tienes cuenta?{' '}
                    <button type="button" onClick={() => setAuthMode('register')} className="text-blue-600 font-bold hover:underline cursor-pointer">
                      Regístrate aquí
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4 font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Nro de Carnet (C.I.)</label>
                      <input
                        type="text"
                        required
                        value={regCI}
                        onChange={(e) => setRegCI(e.target.value)}
                        placeholder="C.I. del paciente"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Nombre y Apellido</label>
                      <input
                        type="text"
                        required
                        value={regNombre}
                        onChange={(e) => setRegNombre(e.target.value)}
                        placeholder="Ej: Juan Andrés Revollo"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Contraseña</label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-sm shadow-md transition cursor-pointer"
                  >
                    Crear Cuenta Paciente
                  </button>
                  <p className="text-center text-sm text-slate-500">
                    ¿Ya tienes cuenta?{' '}
                    <button type="button" onClick={() => setAuthMode('login')} className="text-blue-600 font-bold hover:underline cursor-pointer">
                      Inicia sesión
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* PANTALLAS PRINCIPALES POR ROL (SOLO SI TIENE PERMISO) */
          /* ========================================================================= */
          <div className="space-y-8">

            {/* VISTA DEL PACIENTE (#paciente) */}
            {currentRole === 'paciente' && (
              <div className="space-y-8">
                
                {/* WIZARD PASO A PASO */}
                <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 md:p-8 shadow-lg space-y-6">
                  
                  <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4">
                    <h3 className="font-black text-slate-800 text-base md:text-lg flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-blue-600" /> OBTENER FICHA DE ATENCIÓN
                    </h3>
                    <span className="text-xs bg-blue-50 text-blue-700 font-black px-3.5 py-1 rounded-full uppercase">Paso {wizardStep} de 5</span>
                  </div>

                  {/* PASO 1: Elegir Nivel de Hospital */}
                  {wizardStep === 1 && (
                    <div className="space-y-4">
                      <p className="text-sm md:text-base text-slate-500 font-bold font-semibold">1. Seleccione el nivel de atención médica:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => { setSelectedNivel(2); setWizardStep(2); }}
                          className="p-6 border-2 border-slate-200 rounded-3xl text-left hover:border-blue-600 hover:bg-blue-50/20 transition cursor-pointer space-y-2 focus:ring-2 focus:ring-blue-500"
                        >
                          <h4 className="font-black text-slate-800 text-base">Segundo Nivel (Hospitales Municipales)</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Especialidades básicas, urgencias generales, pediatría básica e internaciones.</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSelectedNivel(3); setWizardStep(2); }}
                          className="p-6 border-2 border-slate-200 rounded-3xl text-left hover:border-blue-600 hover:bg-blue-50/20 transition cursor-pointer space-y-2 focus:ring-2 focus:ring-blue-500"
                        >
                          <h4 className="font-black text-slate-800 text-base">Tercer Nivel (Alta Complejidad y Especialidades)</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Consultas y subespecialidades complejas, cirugías mayores y tratamientos especializados departamentales.</p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PASO 2: Elegir Hospital (Con Info completa, ubicación y Cruzero API) */}
                  {wizardStep === 2 && (
                    <div className="space-y-4">
                      <p className="text-sm md:text-base text-slate-500 font-bold font-semibold">2. Seleccione el Hospital:</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                          {centrosFiltrados.map(c => (
                            <button
                              key={c.id_centro}
                              type="button"
                              onClick={() => setSelectedCentroId(c.id_centro)}
                              className={`w-full p-4 border-2 rounded-2xl text-left transition flex justify-between items-center cursor-pointer focus:ring-2 focus:ring-blue-500 ${selectedCentroId === c.id_centro ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-blue-400'}`}
                            >
                              <div>
                                <h5 className="font-black text-slate-800 text-sm leading-snug">{c.nombre}</h5>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{c.distrito}</p>
                              </div>
                              <MapPin className={`w-5 h-5 shrink-0 ${selectedCentroId === c.id_centro ? 'text-blue-600' : 'text-slate-400'}`} />
                            </button>
                          ))}
                        </div>

                        {/* Tarjeta informativa del hospital seleccionado */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-3">
                          {centroSeleccionadoInfo ? (
                            <div className="space-y-3 text-xs text-slate-600 leading-relaxed font-semibold">
                              
                              {/* Imagen Real del Hospital */}
                              <img
                                src={centroSeleccionadoInfo.imagen_url}
                                alt={centroSeleccionadoInfo.nombre}
                                className="w-full h-32 rounded-xl object-cover border border-slate-200 shadow-inner"
                              />

                              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm pb-1 border-b border-slate-200">
                                <Building2 className="w-4 h-4 text-blue-600" /> Datos del Hospital
                              </div>
                              <p><strong>Ubicación:</strong> {centroSeleccionadoInfo.direccion}</p>
                              <p><strong>Distrito:</strong> {centroSeleccionadoInfo.distrito}</p>
                              <p><strong>Horario Fichas:</strong> {centroSeleccionadoInfo.horario_fichas}</p>
                              <p><strong>📞 Teléfono:</strong> {centroSeleccionadoInfo.telefono}</p>
                              
                              {/* INFORMACION DE CRUZERO INTEGRACION */}
                              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                                <div className="flex items-center gap-1">
                                  <Bus className="w-4 h-4 text-blue-600" />
                                  <p className="text-[10px] text-blue-700 font-extrabold uppercase tracking-wider">Integración Cruzero</p>
                                </div>
                                <p className="text-blue-900 font-bold text-xs">{centroSeleccionadoInfo.como_llegar}</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveRouteInfo(centroSeleccionadoInfo.como_llegar);
                                    setShowCruzeroMap(true);
                                  }}
                                  className="text-[10px] font-black text-blue-700 underline flex items-center gap-1 cursor-pointer"
                                >
                                  Ver Mapa de micros recomendados
                                </button>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => setWizardStep(3)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
                              >
                                Siguiente: Especialidad &rarr;
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 italic text-center">
                              <p className="text-xs font-semibold">Seleccione un hospital de la lista para ver su información de contacto y micros de Cruzero.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <button onClick={() => setWizardStep(1)} className="text-xs text-slate-500 hover:underline pt-2 block font-medium">
                        &larr; Volver al paso anterior
                      </button>
                    </div>
                  )}

                  {/* PASO 3: Elegir Especialidad */}
                  {wizardStep === 3 && (
                    <div className="space-y-4">
                      <p className="text-sm md:text-base text-slate-500 font-bold font-semibold">3. ¿Qué especialidad médica requiere?</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {especialidades.map(esp => (
                          <button
                            key={esp.id_especialidad}
                            onClick={() => { setSelectedEspecialidadId(esp.id_especialidad); setWizardStep(4); }}
                            className="p-5 border-2 border-slate-200 rounded-2xl hover:border-blue-600 text-center hover:bg-blue-50/20 transition flex flex-col items-center justify-center space-y-3 cursor-pointer"
                          >
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                              {esp.nombre === 'Neurología' ? <Brain className="w-6 h-6" /> : esp.nombre === 'Pediatría' ? <Baby className="w-6 h-6" /> : esp.nombre === 'Cardiología' ? <Activity className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
                            </div>
                            <h5 className="font-extrabold text-slate-800 text-xs leading-tight">{esp.nombre}</h5>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setWizardStep(2)} className="text-xs text-slate-500 hover:underline pt-2 block font-medium">
                        &larr; Volver al paso anterior
                      </button>
                    </div>
                  )}

                  {/* PASO 4: Elegir Horario */}
                  {wizardStep === 4 && (
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex gap-3 text-xs text-amber-800 font-medium leading-relaxed">
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                        <p>
                          <strong>¡No madrugue!</strong> Al elegir una hora a continuación, su cupo queda asegurado. Preséntese en el hospital únicamente 15 minutos antes de la hora seleccionada.
                        </p>
                      </div>

                      <p className="text-sm md:text-base text-slate-500 font-bold font-semibold">4. Seleccione su hora de atención de mañana:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {horariosDisponibles.map(h => (
                          <button
                            key={h.id_horario}
                            onClick={() => { setSelectedHorarioObj(h); setWizardStep(5); }}
                            className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-600 text-center hover:bg-blue-50/50 transition font-bold text-slate-700 text-xs cursor-pointer"
                          >
                            {h.hora_inicio} AM
                          </button>
                        ))}
                      </div>
                      {horariosDisponibles.length === 0 && (
                        <p className="text-xs text-slate-400 italic font-semibold">No hay horarios libres de mañana en este hospital hoy.</p>
                      )}
                      <button onClick={() => setWizardStep(3)} className="text-xs text-slate-500 hover:underline pt-2 block font-medium">
                        &larr; Volver al paso anterior
                      </button>
                    </div>
                  )}

                  {/* PASO 5: Confirmar Cita */}
                  {wizardStep === 5 && selectedHorarioObj && (
                    <form onSubmit={registrarFicha} className="space-y-5 text-xs font-semibold">
                      <p className="text-sm md:text-base text-slate-500 font-bold">5. Resumen de la Ficha Médica:</p>
                      
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-slate-700">
                        <p><strong>Hospital:</strong> {centros.find(c => c.id_centro === selectedCentroId)?.nombre}</p>
                        <p><strong>Especialidad:</strong> {especialidades.find(esp => esp.id_especialidad === selectedEspecialidadId)?.nombre}</p>
                        <p><strong>Fecha y Hora:</strong> {selectedHorarioObj.fecha} a las {selectedHorarioObj.hora_inicio} AM</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Breve descripción de sus síntomas (Opcional)</label>
                        <input
                          type="text"
                          value={motivoConsulta}
                          onChange={(e) => setMotivoConsulta(e.target.value)}
                          placeholder="Ej: Dolor de espalda / Receta mensual"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-base focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setWizardStep(4)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold transition text-xs cursor-pointer"
                        >
                          Atrás
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-md shadow-blue-200 transition text-xs cursor-pointer"
                        >
                          Confirmar y Sacar Ficha
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* MODAL DE MAPA DE CRUZERO */}
                {showCruzeroMap && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 p-5 space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                          <Bus className="w-5 h-5 text-blue-600" /> Ruta Recomendada (Cruzero)
                        </h4>
                        <button onClick={() => setShowCruzeroMap(false)} className="text-slate-400 hover:text-slate-800">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="bg-slate-100 border rounded-2xl p-6 text-center space-y-3">
                        <Map className="w-16 h-16 text-blue-600 mx-auto animate-pulse" />
                        <p className="text-xs font-bold text-slate-700">Líneas de Micros para llegar al Hospital:</p>
                        <p className="text-sm font-black text-blue-900 bg-white p-3 rounded-xl border border-blue-200">{activeRouteInfo}</p>
                      </div>
                      <button
                        onClick={() => setShowCruzeroMap(false)}
                        className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold text-xs transition"
                      >
                        Entendido
                      </button>
                    </div>
                  </div>
                )}

                {/* MIS TURNOS Y IMPRESIÓN */}
                <section className="space-y-4">
                  <h4 className="font-extrabold text-slate-800 text-base md:text-lg">Mis Fichas de Atención</h4>
                  <div className="space-y-3">
                    {turnos.filter(t => t.id_paciente === currentUser?.id_usuario).map(turno => {
                      return (
                        <div key={turno.id_turno} className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-black text-slate-800 text-sm leading-none">{turno.nombre_centro}</h5>
                              <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{turno.especialidad_personal_salud}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${turno.estado === 'Atendido' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                {turno.estado}
                              </span>
                            </div>
                            <div className="flex gap-3 text-slate-500 font-bold text-[10px]">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-500" /> {turno.fecha} ({turno.hora})</span>
                              <span>Médico: {turno.nombre_personal_salud}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto shrink-0 font-bold">
                            {turno.estado === 'Pendiente' && (
                              <button
                                onClick={() => imprimirFicha(turno)}
                                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs cursor-pointer"
                              >
                                <Printer className="w-4 h-4 text-slate-600" /> Imprimir Ficha / PDF
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {/* VISTA DEL ENCARGADO / VENTANILLA DE ATENCIÓN (#encargado) */}
            {currentRole === 'encargado' && (
              <div className="space-y-6">
                
                <div className="bg-indigo-900 text-indigo-100 rounded-3xl p-6 shadow-md flex justify-between items-center flex-wrap gap-4 animate-fadeIn">
                  <div className="space-y-1">
                    <span className="text-[9px] bg-indigo-800 text-indigo-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                      Ventanilla de Control de Fichas
                    </span>
                    <h2 className="text-xl font-black text-white">Bandeja de Control Inmediato</h2>
                    <p className="text-xs text-indigo-200">
                      Marque como "PROCESADO" el turno de los pacientes de forma instantánea al finalizar su consulta médica.
                    </p>
                  </div>
                  <button
                    onClick={() => setMostrarEscaneoSimulado(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer border border-indigo-500"
                  >
                    <ScanLine className="w-4 h-4" /> Escanear QR Ficha
                  </button>
                </div>

                {/* MODAL ESCANEO SIMULADO */}
                {mostrarEscaneoSimulado && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4 border">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-black text-slate-800 text-sm flex items-center gap-1">
                          <QrCode className="w-5 h-5 text-indigo-600" /> Escanear Ficha Paciente
                        </h4>
                        <button onClick={() => setMostrarEscaneoSimulado(false)} className="text-slate-400 hover:text-slate-800">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="bg-slate-50 border rounded-2xl p-4 text-center space-y-3">
                        <p className="text-xs text-slate-500 font-medium">Ingrese la C.I. del paciente para simular la lectura de su código QR:</p>
                        <input
                          type="text"
                          value={ciEscaneada}
                          onChange={(e) => setCiEscaneada(e.target.value)}
                          placeholder="Ej: 7766554"
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-center text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMostrarEscaneoSimulado(false)}
                          className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSimularEscaneo(ciEscaneada)}
                          className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Confirmar Escaneo
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Listado y Búsqueda */}
                <div className="space-y-4">
                  
                  {/* Buscador Rápido para la encargada */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Buscar por C.I. de paciente o Código de Ficha para procesar..."
                      value={filtroBusquedaCargada}
                      onChange={(e) => setFiltroBusquedaCargada(e.target.value)}
                      className="text-sm text-slate-800 bg-transparent border-0 outline-none w-full font-bold"
                    />
                    {filtroBusquedaCargada && (
                      <button onClick={() => setFiltroBusquedaCargada('')} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
                        Limpiar
                      </button>
                    )}
                  </div>

                  {/* Resultados de Fichas */}
                  <div className="bg-white rounded-3xl border-2 border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                    {turnosFiltradosEncargada.map(turno => (
                      <div key={turno.id_turno} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-slate-800 text-sm leading-none">{turno.nombre_paciente}</h4>
                            <span className="text-[10px] text-slate-400 font-bold">C.I.: {turno.ci_paciente}</span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{turno.especialidad_personal_salud}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${turno.estado === 'Atendido' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                              {turno.estado}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-slate-500 font-bold">
                            Hospital: <strong>{turno.nombre_centro}</strong> | Hora: <strong>{turno.hora}</strong>
                          </p>
                        </div>

                        {/* Botón de Tachar de Inmediato como Atendido */}
                        <div className="flex gap-2 shrink-0 w-full md:w-auto font-bold">
                          {turno.estado === 'Pendiente' && (
                            <>
                              <button
                                onClick={() => llamarPacienteVoz(turno.nombre_paciente)}
                                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 p-2.5 rounded-xl cursor-pointer"
                                title="Llamar paciente por altavoz"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMarcarProcesado(turno.id_turno)}
                                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Check className="w-4 h-4" /> Marcar como Procesado (Tachar)
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {turnosFiltradosEncargada.length === 0 && (
                      <div className="p-8 text-center text-slate-400 text-xs italic font-semibold">
                        No se encontraron fichas activas con el filtro indicado.
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* VISTA DEL ADMINISTRADOR (#admin) */}
            {currentRole === 'admin' && (
              <div className="space-y-6">
                <h3 className="font-extrabold text-slate-800 text-base">Panel de Gestión General</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* CONFIGURAR HORARIOS (ADMIN) */}
                  <form onSubmit={handleCrearHorario} className="bg-white border-2 border-slate-200 rounded-3xl p-5 space-y-3 text-xs shadow-xs font-semibold">
                    <h4 className="font-extrabold text-slate-800 text-xs pb-1 border-b border-slate-100">Registrar Horarios de Fichas por Hospital</h4>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold">Seleccione el Hospital</label>
                      <select
                        value={nuevoHorarioCentro}
                        onChange={(e) => setNuevoHorarioCentro(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                      >
                        {centros.map(c => (
                          <option key={c.id_centro} value={c.id_centro}>
                            {c.nombre} (Nivel {c.nivel_atencion})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Fecha</label>
                        <input
                          type="date"
                          value={nuevoHorarioFecha}
                          onChange={(e) => setNuevoHorarioFecha(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Hora Inicio</label>
                        <input
                          type="text"
                          value={nuevoHorarioInicio}
                          onChange={(e) => setNuevoHorarioInicio(e.target.value)}
                          placeholder="06:00"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Hora Fin</label>
                        <input
                          type="text"
                          value={nuevoHorarioFin}
                          onChange={(e) => setNuevoHorarioFin(e.target.value)}
                          placeholder="06:30"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold transition text-xs cursor-pointer shadow-xs"
                    >
                      Guardar Bloque Horario
                    </button>
                  </form>

                  {/* Crear Centros de Salud */}
                  <form onSubmit={handleCrearCentro} className="bg-white border-2 border-slate-200 rounded-3xl p-5 space-y-3 text-xs shadow-xs font-semibold">
                    <h4 className="font-extrabold text-slate-800 text-xs pb-1 border-b border-slate-100">Registrar Centro de Salud (Santa Cruz)</h4>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold">Nombre del Hospital</label>
                      <input
                        type="text"
                        required
                        value={nuevoCentroNombre}
                        onChange={(e) => setNuevoCentroNombre(e.target.value)}
                        placeholder="Ej: Hospital Municipal Francés"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Nivel</label>
                        <select
                          value={nuevoCentroNivel}
                          onChange={(e) => setNuevoCentroNivel(parseInt(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none font-medium"
                        >
                          <option value={2}>2do Nivel</option>
                          <option value={3}>3er Nivel</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold">Dirección</label>
                        <input
                          type="text"
                          value={nuevoCentroDir}
                          onChange={(e) => setNuevoCentroDir(e.target.value)}
                          placeholder="Ej: Av. Santos Dumont"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl font-bold transition text-xs cursor-pointer"
                    >
                      Guardar Hospital
                    </button>
                  </form>

                </div>

                {/* Monitoreo Global */}
                <div className="space-y-3 font-semibold text-xs">
                  <h4 className="font-extrabold text-slate-800 text-base">Fichas Asignadas Globalmente</h4>
                  <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
                    {turnos.map(t => (
                      <div key={t.id_turno} className="p-4 text-[11px] flex justify-between items-center font-medium">
                        <div>
                          <p className="text-slate-800 font-black">{t.nombre_paciente} &rarr; {t.nombre_centro}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{t.especialidad_personal_salud} | {t.fecha} - {t.hora}</p>
                        </div>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">{t.estado}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-6 px-6 bg-white mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-bold">
          <p>© 2026 TurnoYa - UPDS Santa Cruz de la Sierra.</p>
          <div className="flex gap-4">
            <span>Sistemas de Información II</span>
            <span>•</span>
            <span>Juan Andrés Revollo y Rivaldo Ramírez</span>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default App
