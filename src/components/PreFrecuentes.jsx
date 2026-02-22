/*Información académica y administrativa */

const PreFrecuentes = ({ onPreguntaClick }) => {
  const preguntasFrecuentes = [
    "¿Cuál es el calendario académico para este semestre?",
    "¿Dónde puedo encontrar mi horario de clases?",
    "¿Cuándo son los períodos de inscripción para cursos?"
  ];

  return (
    <div className="faq-container">
      {preguntasFrecuentes.map((pregunta, index) => (
        <button
          key={index}
          className="faq-button"
          onClick={() => onPreguntaClick(pregunta)}
        >
          {pregunta}
        </button>
      ))}
    </div>
  );
};

export default PreFrecuentes;
