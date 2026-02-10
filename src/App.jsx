// 1. IMPORTANTE: Agregamos useEffect y useRef aquí arriba
import { useState, useEffect, useRef } from 'react' 
import './App.css'

// Función para limpiar texto (NLP básico)
const normalizar = (texto) => {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const INTENCIONES = [
  // --- 1. INFORMACIÓN ACADÉMICA Y ADMINISTRATIVA ---
  {
    claves: ["calendario", "fechas", "ciclo", "semestre", "vacaciones", "finaliza"],
    respuesta: "El Ciclo 01-2026 de la UDB finaliza el 15 de junio. Las evaluaciones finales se realizan del 16 al 22 de junio. ¡Consulta el calendario detallado en el Portal Estudiantil!"
  },
  {
    claves: ["horario", "clases", "aula", "salon", "donde me toca"],
    respuesta: "Tu horario de clases y la ubicación de las aulas (ej. Edificio 4 o 5) están disponibles en el Portal Estudiantil UDB, en la sección 'Gestión Académica'."
  },
  {
    claves: ["inscripcion", "inscribir", "matricular", "materias", "registro"],
    respuesta: "Los periodos de inscripción ordinaria para el Ciclo 02 inician la segunda semana de julio. Recuerda estar solvente con la cuota de junio para realizar el proceso."
  },

  // 1.2 agregar intenciones de informacion sobre rutas de buses, estacionamiento, seguridad, etc.
  {
    claves: ["bus", "transporte", "ruta", "llegar", "salir"],
    respuesta: "La UDB cuenta con rutas de buses desde diferentes puntos de la ciudad. Consulta los horarios y paradas en el sitio web oficial o en la app de transporte universitario."
  },
  {
    claves: ["estacionamiento", "parqueo", "carro", "moto"],
    respuesta: "El campus tiene estacionamiento para estudiantes en el Edificio 3, con capacidad limitada. Se recomienda llegar temprano para asegurar un espacio."
  },
  {
    claves: ["seguridad", "guardia", "emergencia", "policia"],
    respuesta: "La seguridad del campus es una prioridad. Hay guardias las 24 horas y un botón de emergencia en cada edificio que conecta directamente con la seguridad interna."
  },



  // --- 2. RECURSOS Y SERVICIOS DEL CAMPUS ---
  {
    claves: ["biblioteca", "libro", "estudiar", "rafael meza ayau", "prestamo"],
    respuesta: "La Biblioteca 'Rafael Meza Ayau' abre de lunes a viernes de 7:00 AM a 8:00 PM y sábados de 8:00 AM a 12:00 MD. Ofrece salas de estudio grupal y préstamo de equipo."
  },
  {
    claves: ["servicios estudiantiles", "atencion", "administracion", "oficina"],
    respuesta: "Puedes contactar al Departamento de Servicios Estudiantiles en el Edificio de Administración, planta baja, o escribir al correo atencion.estudiantes@udb.edu.sv."
  },
  {
    claves: ["evento", "actividad", "feria", "congreso", "semana"],
    respuesta: "Esta semana se celebra el Congreso de Ingeniería en el Auditorio de la Paz. Revisa las redes sociales oficiales de la UDB para horarios específicos."
  },

  // --- 3. APOYO Y BIENESTAR ESTUDIANTIL ---
  {
    claves: ["estres", "ayuda", "psicologo", "emocional", "ansiedad", "triste"],
    respuesta: "En la UDB contamos con la Clínica de Psicología en el campus. Puedes agendar una cita gratuita para apoyo emocional llamando a la extensión de Bienestar Estudiantil."
  },
  {
    claves: ["discapacidad", "inclusion", "rampas", "acceso", "necesidades"],
    respuesta: "La UDB es un campus inclusivo. Contamos con rampas, ascensores y apoyo pedagógico personalizado. Contacta a la Unidad de Atención a la Diversidad para más información."
  },
  {
    claves: ["tutoria", "refuerzo", "asesoria", "ayuda academica", "mejorar notas"],
    respuesta: "Existen tutorías gratuitas impartidas por instructores en materias como Matemática, Física y Programación. Consulta los horarios en tu Facultad."
  },

  // --- 4. ORIENTACIÓN DE CARRERA (Punto de 15 pts) ---
  {
    claves: ["pasantia", "practica", "trabajo", "bolsa de empleo", "pasantias"],
    respuesta: "Visita la Unidad de Gestión de Carrera en la UDB para encontrar pasantías. También puedes acceder a la Bolsa de Trabajo virtual en el sitio web oficial para ver ofertas vigentes."
  },
  {
    claves: ["curriculum", "cv", "hoja de vida", "escribir", "perfil"],
    respuesta: "La UDB ofrece plantillas de CV y revisiones personalizadas en los talleres de Marca Personal. ¡Asegúrate de destacar tus proyectos de cátedra!"
  },
  {
    claves: ["entrevista", "taller", "preparacion", "empleo", "reclutador"],
    respuesta: "Cada mes realizamos talleres de 'Simulacros de Entrevista'. Inscríbete en la Dirección de Proyección Social para practicar tus respuestas y lenguaje corporal."
  },

  // --- 5. VIDA ESTUDIANTIL Y SOCIAL ---
  {
    claves: ["club", "grupo", "robotica", "deporte", "musica", "teatro", "ajedrez"],
    respuesta: "Hay clubes de Robótica, Coro, Teatro y selecciones de Fútbol y Básquetbol. Puedes unirte al inicio de cada ciclo en el área de Bienestar Estudiantil."
  },
  {
    claves: ["fin de semana", "sabado", "domingo", "planeado"],
    respuesta: "Este sábado habrá torneo de deportes electrónicos en el Edificio 5. Los domingos el campus permanece cerrado, excepto por eventos especiales programados."
  },
  {
    claves: ["comida", "hambre", "cafeteria", "comer", "almuerzo", "cafetin"],
    respuesta: "Tienes varias opciones: El Cafetín Central (Edificio 2), los Food Trucks en la Plaza de las Banderas y el comedor económico cerca del Polideportivo."
  },
  
  // --- 6. SOPORTE TÉCNICO ---
  {
    claves: ["wifi", "internet", "red", "conectar", "contraseña"],
    respuesta: "Conéctate a la red 'UDB-Alumnos'. Tu usuario es tu número de carnet y la clave es la misma que usas para el Portal Estudiantil."
  }
];

const App = () => {
  const [mensaje, setMensaje] = useState("");
  const [historial, setHistorial] = useState([
    { emisor: "bot", texto: "¡Hola! Soy tu asistente universitario. ¿En qué puedo ayudarte hoy?" }
  ]);
  const [estaEscribiendo, setEstaEscribiendo] = useState(false);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  
  // Referencia para el auto-scroll
  const finalDelChatRef = useRef(null);

  // Efecto para bajar el chat automáticamente
  useEffect(() => {
    finalDelChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historial, estaEscribiendo]);

  const enviarMensaje = () => {
    if (mensaje.trim() === "") return;

    const textoUsuarioOriginal = mensaje;
    const textoLimpio = normalizar(mensaje);

    setHistorial(prev => [...prev, { emisor: "usuario", texto: textoUsuarioOriginal }]);
    setMensaje("");
    setMostrarFeedback(false);
    setEstaEscribiendo(true);

    setTimeout(() => {
      let respuestaEncontrada = "No estoy seguro de eso. Intenta preguntarme por 'wifi', 'horarios', 'biblioteca' o 'pasantías'.";

      for (let intencion of INTENCIONES) {
        const coincide = intencion.claves.some(clave => textoLimpio.includes(normalizar(clave)));
        if (coincide) {
          respuestaEncontrada = intencion.respuesta;
          break;
        }
      }

      setHistorial(prev => [...prev, { emisor: "bot", texto: respuestaEncontrada }]);
      setEstaEscribiendo(false);
      setMostrarFeedback(true);
    }, 1200);
  };

 return (
  <div className="chat-container">
    <div className="chat-header">
      <h2>Asistente Académico UDB 🎓</h2>
      <div className="status">En línea ahora</div>
    </div>

    <div className="messages-area">
      {historial.map((msg, index) => (
        <div key={index} className={`bubble ${msg.emisor === 'bot' ? 'bot-bubble' : 'user-bubble'}`}>
          {msg.texto}
          
          {/* BOTONES DE RECURSOS: Solo aparecen si el bot menciona palabras clave */}
          {msg.emisor === 'bot' && msg.texto.includes("CV") && (
            <div style={{ marginTop: '10px' }}>
              <button className="resource-btn" onClick={() => window.open('https://www.udb.edu.sv', '_blank')}>
                📄 Descargar Plantilla CV
              </button>
            </div>
          )}
          {msg.emisor === 'bot' && msg.texto.includes("Bolsa de Trabajo") && (
            <div style={{ marginTop: '10px' }}>
              <button className="resource-btn" onClick={() => window.open('https://www.udb.edu.sv', '_blank')}>
                💼 Ver Ofertas Vigentes
              </button>
            </div>
          )}
        </div>
      ))}
      
      {estaEscribiendo && (
        <div className="bubble bot-bubble typing">
          <span></span><span></span><span></span>
        </div>
      )}
      
      <div ref={finalDelChatRef} />
    </div>

    {mostrarFeedback && (
      <div className="feedback-area">
        <p>¿Fue útil esta respuesta?</p>
        <div className="feedback-btns">
          <button onClick={() => { alert("¡Gracias! Analizaremos esto para mejorar el servicio UDB."); setMostrarFeedback(false); }}>👍</button>
          <button onClick={() => { alert("Reportado. Un asesor humano revisará esta respuesta."); setMostrarFeedback(false); }}>👎</button>
        </div>
      </div>
    )}

    <div className="input-area">
      <input 
        type="text" 
        placeholder="Pregunta sobre el Wi-Fi, Biblioteca o el Ciclo..."
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
      />
      <button onClick={enviarMensaje} className="send-btn">Enviar</button>
    </div>
  </div>
);
};

export default App;