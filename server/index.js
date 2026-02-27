const express = require("express");
const sgMail = require("@sendgrid/mail");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Ruta para enviar encuesta
app.post("/enviar", async (req, res) => {
  try {
    const d = req.body;

    // Validar campos obligatorios
    if (!d.factura || !d.correo || !d.cliente || !d.evaluador || !d.firma) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Procesar firma (base64 -> buffer)
    const firmaBase64 = d.firma.replace(/^data:image\/png;base64,/, "");
    const firmaBuffer = Buffer.from(firmaBase64, "base64");

    // 🔧 Ruta corregida del logo (images/logo1.jpg)
    const logoPath = path.join(__dirname, "images", "logo1.jpg");
    let logoBuffer = null;
    try {
      logoBuffer = fs.readFileSync(logoPath);
      console.log("✅ Logo cargado correctamente desde:", logoPath);
    } catch (err) {
      console.warn("⚠️ No se encontró el archivo del logo en la ruta esperada:", logoPath);
    }

    // Preparar adjuntos
    const attachments = [
      {
        content: firmaBuffer.toString("base64"),
        filename: "firma.png",
        type: "image/png",
        disposition: "inline",
        content_id: "firma_cliente"
      }
    ];

    if (logoBuffer) {
      attachments.push({
        content: logoBuffer.toString("base64"),
        filename: "logo1.jpg",
        type: "image/jpeg", // Importante: cambiar a image/jpeg
        disposition: "inline",
        content_id: "logo_retex"
      });
    }

    // HTML mejorado (con el mismo diseño que ya tienes, pero usando el cid correcto)
    const htmlContent = `
      <div style="margin:0;padding:0;background-color:#f2f5f9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.05); margin:30px 0;">
                
                <!-- Logo (ahora con cid:logo_retex) -->
                <tr>
                  <td align="center" style="padding:30px 20px 10px 20px;">
                    <img src="cid:logo_retex" alt="RETEX" width="180" style="display:block; max-width:180px; height:auto;">
                  </td>
                </tr>

                <!-- Título principal -->
                <tr>
                  <td style="background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%); color:#ffffff; padding:20px 30px; text-align:center; font-size:22px; font-weight:600; letter-spacing:1px;">
                    📋 ENCUESTA DE SATISFACCIÓN
                  </td>
                </tr>

                <!-- Datos de la encuesta -->
                <tr>
                  <td style="padding:30px 30px 15px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr><td style="padding:8px 0; border-bottom:1px solid #eaeef2;"><span style="font-weight:600; color:#2c3e50;">Factura:</span> <span style="color:#34495e;">${d.factura}</span></td></tr>
                      <tr><td style="padding:8px 0; border-bottom:1px solid #eaeef2;"><span style="font-weight:600; color:#2c3e50;">Correo:</span> <span style="color:#34495e;">${d.correo}</span></td></tr>
                      <tr><td style="padding:8px 0; border-bottom:1px solid #eaeef2;"><span style="font-weight:600; color:#2c3e50;">Cliente:</span> <span style="color:#34495e;">${d.cliente}</span></td></tr>
                      <tr><td style="padding:8px 0; border-bottom:1px solid #eaeef2;"><span style="font-weight:600; color:#2c3e50;">Evaluador:</span> <span style="color:#34495e;">${d.evaluador}</span></td></tr>
                    </table>
                  </td>
                </tr>

                <!-- Resultados de la evaluación -->
                <tr>
                  <td style="padding:5px 30px 20px 30px;">
                    <h3 style="color:#2c3e50; font-size:18px; margin:20px 0 15px 0;">📊 Resultados</h3>
                    <table width="100%" cellpadding="8" cellspacing="0" border="0" style="background:#f8fafd; border-radius:12px;">
                      <tr><td style="border-bottom:1px solid #dce4ec;"><b>Atención ventas:</b> ⭐ ${d.ventas}</td></tr>
                      <tr><td style="border-bottom:1px solid #dce4ec;"><b>Soluciones presentadas:</b> ⭐ ${d.soluciones}</td></tr>
                      <tr><td style="border-bottom:1px solid #dce4ec;"><b>Relación cotización-entrega:</b> ⭐ ${d.relacion}</td></tr>
                      <tr><td style="border-bottom:1px solid #dce4ec;"><b>Cumplimiento de fecha:</b> ${d.fecha}</td></tr>
                      <tr><td style="border-bottom:1px solid #dce4ec;"><b>Calidad de productos:</b> ⭐ ${d.calidad}</td></tr>
                      <tr><td style="border-bottom:1px solid #dce4ec;"><b>¿Recomienda RETEX?:</b> ${d.recomienda}</td></tr>
                      <tr><td><b>Destaca:</b> ${d.destaca}</td></tr>
                    </table>
                  </td>
                </tr>

                <!-- Firma -->
                <tr>
                  <td align="center" style="padding:15px 30px 25px 30px;">
                    <h3 style="color:#2c3e50; font-size:18px; margin-bottom:10px;">✍️ Firma del evaluador</h3>
                    <img src="cid:firma_cliente" width="400" style="border:2px solid #dce4ec; border-radius:8px; max-width:100%;">
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafd; padding:20px 30px; text-align:center; font-size:13px; color:#7b8a9b; border-top:1px solid #dce4ec;">
                    Aplicación propiedad de <strong>RETEX</strong><br>
                    Desarrollada por Ing. Alfredo Ordoñez Quintero · Cédula 15390458
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    const msg = {
      to: "gruporetex31@gmail.com",
      from: {
        email: "gruporetex31@gmail.com",
        name: "RETEX Encuestas"
      },
      subject: `Nueva Encuesta Retex - Factura ${d.factura}`,
      html: htmlContent,
      attachments: attachments
    };

    await sgMail.send(msg);
    console.log("✅ Correo enviado con logo y firma incrustados, ruta del logo:", logoPath);
    res.json({ mensaje: "Enviado correctamente" });

  } catch (error) {
    console.error("❌ Error SendGrid:", error.response?.body || error);
    res.status(500).json({ error: "Error interno al enviar correo" });
  }
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor RETEX con SendGrid funcionando 🚀");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("🚀 Servidor activo en puerto " + PORT);
});