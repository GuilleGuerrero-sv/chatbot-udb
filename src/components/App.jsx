import { useState, useEffect, useRef } from "react";
import "../css/App.css";
import { INTENCIONES } from "../data/intenciones";
import PreFrecuentes from "./PreFrecuentes";

const normalizar = (texto) => {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const App = () => {
  const [mensaje, setMensaje] = useState("");
  const [historial, setHistorial] = useState([
    {
      emisor: "bot",
      texto:
        "¡Hola! Soy tu asistente universitario. ¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [estaEscribiendo, setEstaEscribiendo] = useState(false);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);

  const finalDelChatRef = useRef(null);

  useEffect(() => {
    finalDelChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historial, estaEscribiendo]);

  const enviarMensaje = () => {
    if (mensaje.trim() === "") return;

    const textoUsuarioOriginal = mensaje;
    const textoLimpio = normalizar(mensaje);

    setHistorial((prev) => [
      ...prev,
      { emisor: "usuario", texto: textoUsuarioOriginal },
    ]);
    setMensaje("");
    setMostrarFeedback(false);
    setEstaEscribiendo(true);

    setTimeout(() => {
      let respuestaEncontrada =
        "No estoy seguro de eso. Intenta preguntarme por 'wifi', 'horarios', 'biblioteca' o 'pasantías'.";

      for (let intencion of INTENCIONES) {
        const coincide = intencion.claves.some((clave) =>
          textoLimpio.includes(normalizar(clave)),
        );
        if (coincide) {
          respuestaEncontrada = intencion.respuesta;
          break;
        }
      }

      setHistorial((prev) => [
        ...prev,
        { emisor: "bot", texto: respuestaEncontrada },
      ]);
      setEstaEscribiendo(false);
      setMostrarFeedback(true);
    }, 1200);
  };

  const manejarPreguntaFrecuente = (pregunta) => {
    enviarMensajeAutomatico(pregunta);
  };

  const enviarMensajeAutomatico = (texto) => {
    const textoLimpio = normalizar(texto);

    setMensaje("");
    setHistorial((prev) => [...prev, { emisor: "usuario", texto }]);
    setEstaEscribiendo(true);
    setMostrarFeedback(false);

    setTimeout(() => {
      let respuestaEncontrada =
        "No estoy seguro de eso. Intenta preguntarme por 'wifi', 'horarios', 'biblioteca' o 'pasantías'.";

      for (let intencion of INTENCIONES) {
        const coincide = intencion.claves.some((clave) =>
          textoLimpio.includes(normalizar(clave)),
        );

        if (coincide) {
          respuestaEncontrada = intencion.respuesta;
          break;
        }
      }

      setHistorial((prev) => [
        ...prev,
        { emisor: "bot", texto: respuestaEncontrada },
      ]);
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
          <div
            key={index}
            className={`bubble ${msg.emisor === "bot" ? "bot-bubble" : "user-bubble"}`}
          >
            {msg.texto}
          </div>
        ))}

        {historial.length === 1 && (
          <PreFrecuentes onPreguntaClick={manejarPreguntaFrecuente} />
        )}

        {estaEscribiendo && (
          <div className="bubble bot-bubble typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        <div ref={finalDelChatRef} />
      </div>

      {mostrarFeedback && (
        <div className="feedback-area">
          <p>¿Fue útil esta respuesta?</p>
          <div className="feedback-btns">
            <button
              onClick={() => {
                alert(
                  "¡Gracias! Analizaremos esto para mejorar el servicio UDB.",
                );
                setMostrarFeedback(false);
              }}
            >
              👍
            </button>
            <button
              onClick={() => {
                alert("Reportado. Un asesor humano revisará esta respuesta.");
                setMostrarFeedback(false);
              }}
            >
              👎
            </button>
          </div>
        </div>
      )}

      <div className="input-area">
        <input
          type="text"
          placeholder="Pregunta sobre el Wi-Fi, Biblioteca o el Ciclo..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
        />
        <button onClick={enviarMensaje} className="send-btn">
          Enviar
        </button>
      </div>
    </div>
  );
};

export default App;
