import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import "./App.css";

function App() {
  const sigRef = useRef(null);
  const [form, setForm] = useState({
    factura: "", correo: "", cliente: "", evaluador: "",
    ventas: "", soluciones: "", relacion: "",
    fecha: "", calidad: "", recomienda: "", destaca: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const enviarEncuesta = async (e) => {
    e.preventDefault();

    if (sigRef.current.isEmpty()) {
      alert("⚠️ Debe incluir la firma autógrafa para poder enviar.");
      return;
    }

    const firmaData = sigRef.current.getCanvas().toDataURL("image/png");

    // Mostrar indicador de carga
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "ENVIANDO...";
    btn.disabled = true;

    try {
      const response = await fetch("https://encuesta-retex-backend.onrender.com/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, firma: firmaData })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error del servidor: ${response.status}`);
      }

      alert("✅ Encuesta enviada correctamente a Retex.");
      window.location.reload();
    } catch (error) {
      console.error("Error en el envío:", error);
      alert("❌ Error al enviar: " + error.message);
    } finally {
      btn.innerText = originalText;
      btn.disabled = false;
    }
  };

  return (
    <div className="container">
      <div className="header-retex">
        {/* 👇 LOGO AÑADIDO AQUÍ */}
        <img 
          src="/images/logo1.jpg" 
          alt="Logo Retex"
          className="logo-retex"
        />
        <h2>Encuesta de Satisfacción</h2>
      </div>

      <form onSubmit={enviarEncuesta}>
        <input type="text" name="factura" placeholder="Número de Factura *" required onChange={handleChange} />
        <input type="email" name="correo" placeholder="Correo Electrónico *" required onChange={handleChange} />
        <input type="text" name="cliente" placeholder="Nombre del Cliente o Empresa *" required onChange={handleChange} />
        <input type="text" name="evaluador" placeholder="Nombre y Cargo del Evaluador *" required onChange={handleChange} />

        <div className="pregunta-seccion">
          <h4>En su opinión, la atención que recibió por parte del personal de ventas fue:</h4>
          {["Excelente", "Bueno", "Regular", "Malo"].map(op => (
            <label key={op} className="radio-label"><input type="radio" name="ventas" value={op} required onChange={handleChange} /> {op}</label>
          ))}
        </div>

        <div className="pregunta-seccion">
          <h4>Las soluciones que Retex le presentó para atender sus necesidades fueron:</h4>
          {["Excelentes", "Buenas", "Regulares", "Malas"].map(op => (
            <label key={op} className="radio-label"><input type="radio" name="soluciones" value={op} required onChange={handleChange} /> {op}</label>
          ))}
        </div>

        <div className="pregunta-seccion">
          <h4>Usted cree que la relación entre lo que se le cotizó y lo que se le entregó es:</h4>
          {["Excelente", "Buena", "Regular", "Mala"].map(op => (
            <label key={op} className="radio-label"><input type="radio" name="relacion" value={op} required onChange={handleChange} /> {op}</label>
          ))}
        </div>

        <div className="pregunta-seccion">
          <h4>¿Se cumplió con la fecha de entrega?</h4>
          {["Sí", "No"].map(op => (
            <label key={op} className="radio-label"><input type="radio" name="fecha" value={op} required onChange={handleChange} /> {op}</label>
          ))}
        </div>

        <div className="pregunta-seccion">
          <h4>¿Cómo calificas la calidad de los productos de Retex?</h4>
          {["Excelente", "Buena", "Regular", "Mala"].map(op => (
            <label key={op} className="radio-label"><input type="radio" name="calidad" value={op} required onChange={handleChange} /> {op}</label>
          ))}
        </div>

        <div className="pregunta-seccion">
          <h4>¿Recomienda Retex?</h4>
          {["Sí", "No"].map(op => (
            <label key={op} className="radio-label"><input type="radio" name="recomienda" value={op} required onChange={handleChange} /> {op}</label>
          ))}
        </div>

        <div className="pregunta-seccion">
          <h4>¿Qué destacaría de Retex?</h4>
          {["Atención al cliente", "Calidad", "Precio", "Tiempos de entrega"].map(op => (
            <label key={op} className="radio-label"><input type="radio" name="destaca" value={op} required onChange={handleChange} /> {op}</label>
          ))}
        </div>

        <h4>Firma Autógrafa *</h4>
        <div className="signature-box">
          <SignatureCanvas ref={sigRef} penColor="black" canvasProps={{ width: 550, height: 200, className: "sigCanvas" }} />
        </div>
        <button type="button" onClick={() => sigRef.current.clear()} className="btn-clear">Limpiar Firma</button>

        <button type="submit" className="btn-submit">ENVIAR ENCUESTA</button>

        <div className="footer-retex">
          Muchas gracias por su valioso tiempo.<br />
          <b>Aplicación Propiedad RETEX</b><br />
          Desarrollada por Ing. Alfredo Ordoñez Quintero<br />
          Cédula Profesional 15390458
        </div>
      </form>
    </div>
  );
}

export default App;