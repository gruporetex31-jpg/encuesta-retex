const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.post("/enviar", async (req, res) => {
  const d = req.body;

  // Procesar firma: quitar cabecera y convertir a buffer
  const firmaBase64 = d.firma.replace(/^data:image\/png;base64,/, "");
  const firmaBuffer = Buffer.from(firmaBase64, "base64");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "gruporetex31@gmail.com",
      pass: "anbmqymomvgwfboe" // Contraseña de aplicación (válida)
    }
  });

  const mailOptions = {
    from: "gruporetex31@gmail.com",
    to: "gruporetex31@gmail.com",
    subject: `Nueva Encuesta Retex - Factura: ${d.factura} - ${d.cliente}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; border-left: 5px solid #e31e24; padding: 25px; max-width: 600px; background: #ffffff; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.05); margin:0 auto;">
        <h2 style="color: #e31e24; margin-top:0; border-bottom: 2px solid #eee; padding-bottom: 12px;">📋 REPORTE DE SATISFACCIÓN RETEX</h2>
        
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:6px 0"><b>Número de Factura:</b></td><td>${d.factura}</td></tr>
          <tr><td style="padding:6px 0"><b>Correo:</b></td><td>${d.correo}</td></tr>
          <tr><td style="padding:6px 0"><b>Nombre del Cliente o Empresa:</b></td><td>${d.cliente}</td></tr>
          <tr><td style="padding:6px 0"><b>Nombre y Cargo del Evaluador:</b></td><td>${d.evaluador}</td></tr>
        </table>

        <hr style="border: none; border-top: 2px solid #f0f0f0; margin: 20px 0;">

        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:6px 0"><b>1. Atención del personal de ventas:</b></td><td>⭐ ${d.ventas}</td></tr>
          <tr><td style="padding:6px 0"><b>2. Soluciones presentadas:</b></td><td>⭐ ${d.soluciones}</td></tr>
          <tr><td style="padding:6px 0"><b>3. Relación cotización vs entrega:</b></td><td>⭐ ${d.relacion}</td></tr>
          <tr><td style="padding:6px 0"><b>4. Cumplimiento fecha de entrega:</b></td><td>✅ ${d.fecha}</td></tr>
          <tr><td style="padding:6px 0"><b>5. Calidad de los productos:</b></td><td>⭐ ${d.calidad}</td></tr>
          <tr><td style="padding:6px 0"><b>6. ¿Recomienda Retex?:</b></td><td>👍 ${d.recomienda}</td></tr>
          <tr><td style="padding:6px 0"><b>7. ¿Qué destacaría de Retex?:</b></td><td>🏆 ${d.destaca}</td></tr>
        </table>

        <hr style="border: none; border-top: 2px solid #f0f0f0; margin: 20px 0;">

        <h3 style="color: #333; margin-bottom: 8px;">🖊️ Firma Autógrafa:</h3>
        <div style="background: #fafafa; border: 2px dashed #ccc; border-radius: 8px; padding: 15px; text-align: center;">
          <img src="cid:firma_cliente" width="450" style="max-width:100%; border-radius: 4px;" alt="Firma del cliente" />
        </div>

        <div style="margin-top: 30px; font-size: 12px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
          Muchas gracias por su valioso tiempo.<br />
          <b style="color: #e31e24;">Aplicación Propiedad Retex</b><br />
          Desarrollada por Ing. Alfredo Ordoñez Quintero | Cédula: 15390458
        </div>
      </div>
    `,
    attachments: [
      {
        filename: "firma.png",
        content: firmaBuffer,
        cid: "firma_cliente" // Mismo identificador que en el src del img
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Correo enviado con firma visible");
    res.json({ mensaje: "Enviado" });
  } catch (error) {
    console.error("❌ Error al enviar:", error);
    res.status(500).json({ error: "Error de envío" });
  }
});

app.listen(3001, () => {
  console.log("🚀 Servidor RETEX activo en puerto 3001");
});