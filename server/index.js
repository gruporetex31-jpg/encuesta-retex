const express = require("express");
const sgMail = require("@sendgrid/mail");
const cors = require("cors");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API Key SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post("/enviar", async (req, res) => {
  try {
    const d = req.body;

    if (!d.factura || !d.correo || !d.cliente || !d.evaluador || !d.firma) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Convertir firma base64
    const firmaBase64 = d.firma.replace(/^data:image\/png;base64,/, "");
    const firmaBuffer = Buffer.from(firmaBase64, "base64");

    // LOGO COMO URL PUBLICA (Render)
    const logoUrl = "https://encuesta-retex-frontend.onrender.com/images/logo1.jpg";

    const msg = {
      to: "gruporetex31@gmail.com",
      from: {
        email: "gruporetex31@gmail.com",
        name: "RETEX Encuestas"
      },
      subject: `Nueva Encuesta Retex - Factura ${d.factura}`,
      
      html: `
      <div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center">
              
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:10px;overflow:hidden;margin:20px 0;">
                
                <!-- HEADER LOGO -->
                <tr>
                  <td align="center" style="padding:25px 20px;">
                    <img src="${logoUrl}" width="200" style="display:block;" alt="RETEX Logo">
                  </td>
                </tr>

                <!-- TITULO -->
                <tr>
                  <td style="background:#e31e24;color:#ffffff;padding:15px 20px;text-align:center;font-size:20px;font-weight:bold;">
                    REPORTE DE SATISFACCIÓN RETEX
                  </td>
                </tr>

                <!-- DATOS GENERALES -->
                <tr>
                  <td style="padding:20px;font-size:14px;color:#333;">
                    <p><b>Factura:</b> ${d.factura}</p>
                    <p><b>Correo:</b> ${d.correo}</p>
                    <p><b>Cliente:</b> ${d.cliente}</p>
                    <p><b>Evaluador:</b> ${d.evaluador}</p>
                  </td>
                </tr>

                <!-- RESULTADOS -->
                <tr>
                  <td style="padding:0 20px 20px 20px;font-size:14px;color:#333;">
                    <hr>
                    <p><b>1. Atención ventas:</b> ⭐ ${d.ventas}</p>
                    <p><b>2. Soluciones:</b> ⭐ ${d.soluciones}</p>
                    <p><b>3. Relación cotización-entrega:</b> ⭐ ${d.relacion}</p>
                    <p><b>4. Cumplimiento fecha:</b> ${d.fecha}</p>
                    <p><b>5. Calidad:</b> ⭐ ${d.calidad}</p>
                    <p><b>6. Recomienda:</b> ${d.recomienda}</p>
                    <p><b>7. Destaca:</b> ${d.destaca}</p>
                  </td>
                </tr>

                <!-- FIRMA -->
                <tr>
                  <td align="center" style="padding:20px;">
                    <h3 style="color:#333;">Firma del Cliente</h3>
                    <img src="cid:firma_cliente" width="400" style="border:1px solid #ddd;border-radius:6px;">
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background:#f4f6f9;padding:15px;text-align:center;font-size:12px;color:#777;">
                    Aplicación Propiedad RETEX<br>
                    Desarrollada por Ing. Alfredo Ordoñez Quintero
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </div>
      `,

      attachments: [
        {
          content: firmaBuffer.toString("base64"),
          filename: "firma.png",
          type: "image/png",
          disposition: "inline",
          content_id: "firma_cliente"
        }
      ]
    };

    await sgMail.send(msg);

    console.log("✅ Correo enviado correctamente con logo y firma visible");
    res.json({ mensaje: "Enviado correctamente" });

  } catch (error) {
    console.error("❌ Error SendGrid:", error.response?.body || error);
    res.status(500).json({ error: "Error interno al enviar correo" });
  }
});

app.get("/", (req, res) => {
  res.send("Servidor RETEX con SendGrid funcionando 🚀");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("🚀 Servidor activo en puerto " + PORT);
});
