# 🌐 CONFIGURACIÓN DE SERVICIOS EXTERNOS

## 🚀 OPCIÓN 1: FORMSPREE (MÁS FÁCIL) - RECOMENDADO

### ✅ Ventajas:

- ✨ **Súper fácil de configurar** (5 minutos)
- 🆓 **Gratis hasta 50 envíos/mes**
- 📧 **Recibes emails automáticamente**
- 🔒 **Sin configuración compleja**

### 📋 Pasos:

1. Ve a [formspree.io](https://formspree.io)
2. Regístrate gratis con tu email
3. Crea un nuevo formulario
4. Copia tu FORM ID (algo como `mf24ykgr`)
5. En `index.html` busca el formulario:
   ```html
   <form class="rsvp__form" id="rsvp-form" action="https://formspree.io/f/TU_FORM_ID" method="POST">
   ```
6. Reemplaza `TU_FORM_ID` con tu ID real (`index.js` toma la URL de ahí):
   ```html
   <form class="rsvp__form" id="rsvp-form" action="https://formspree.io/f/mf24ykgr" method="POST">
   ```
7. ¡Listo! Ya recibirás emails con cada confirmación

---

## 📊 OPCIÓN 2: GOOGLE SHEETS (MÁS POTENTE)

### ✅ Ventajas:

- 📈 **Datos organizados en spreadsheet**
- 🔄 **Actualización en tiempo real**
- 📊 **Puedes crear gráficos y análisis**
- 🆓 **Completamente gratis**

### 📋 Pasos:

1. **Crear Google Sheet:**

   - Ve a [sheets.google.com](https://sheets.google.com)
   - Crea una nueva hoja llamada "Invitados Cumpleaños"
   - En la primera fila pon: `Nombre | Fecha | Hora | Timestamp | User Agent`

2. **Crear Google Apps Script:**
   - Ve a [script.google.com](https://script.google.com)
   - Crea un nuevo proyecto
   - Borra todo y pega este código:

```javascript
function doPost(e) {
  try {
    // ID de tu Google Sheet (lo sacas de la URL)
    const SHEET_ID = "TU_GOOGLE_SHEET_ID_AQUI";
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

    // Parsear datos
    const data = JSON.parse(e.postData.contents);

    // Agregar fila
    sheet.appendRow([
      data.name,
      data.date,
      data.time,
      data.timestamp,
      data.userAgent,
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. **Configurar y desplegar:**

   - Reemplaza `TU_GOOGLE_SHEET_ID_AQUI` con el ID de tu sheet
   - Guarda el proyecto
   - Click en "Desplegar" → "Nueva implementación"
   - Selecciona "Aplicación web"
   - Ejecutar como: "Yo"
   - Acceso: "Cualquier persona"
   - Copia la URL que te da

4. **Actualizar tu código:**
   - En `index.js` busca:
   ```javascript
   const SCRIPT_URL = "TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI";
   ```
   - Reemplaza con tu URL real
   - Descomenta esta línea:
   ```javascript
   sendToGoogleSheets(name),
   ```

---

## 📧 OPCIÓN 3: EMAILJS (EMAILS DIRECTOS)

### ✅ Ventajas:

- 📨 **Emails directos a tu bandeja**
- 🎨 **Templates personalizables**
- 🆓 **200 emails gratis/mes**

### 📋 Pasos:

1. Regístrate en [emailjs.com](https://emailjs.com)
2. Conecta tu servicio de email (Gmail, Outlook, etc.)
3. Crea un template de email
4. Agrega el script de EmailJS al HTML:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
   ```
5. Configura las credenciales en `index.js`

---

## 🔗 OPCIÓN 4: WEBHOOK (ZAPIER, MAKE.COM)

### ✅ Ventajas:

- 🔄 **Conecta con 1000+ servicios**
- 📱 **Notificaciones en Slack, Discord, etc.**
- 📊 **Integra con CRM, bases de datos**

### 📋 Pasos:

1. **Con Zapier:**

   - Crea cuenta en [zapier.com](https://zapier.com)
   - Nuevo Zap → Trigger: "Webhooks by Zapier"
   - Copia la URL del webhook
   - Configura la acción (email, Slack, Google Sheets, etc.)

2. **Actualizar código:**
   - Reemplaza `TU_WEBHOOK_URL_AQUI` con tu URL
   - Descomenta `sendToWebhook(name),`

---

## 🎯 RECOMENDACIÓN PERSONAL

Para tu cumpleaños, te recomiendo empezar con **FORMSPREE**:

1. ✨ Es súper fácil (5 minutos)
2. 📧 Recibes email por cada confirmación
3. 🆓 Gratis hasta 50 invitados
4. 📱 Funciona perfecto en móviles

Si quieres algo más avanzado después, puedes agregar Google Sheets.

---

## 🚀 ACTIVAR SERVICIO

Formspree ya está activado. En `index.js` la función `sendConfirmation(name)` manda los campos `name`, `date`, `time` y `timestamp` a la URL del `action` del formulario.

Para usar otro servicio, cambia el `fetch` de esa función. Si responde con error, la invitación avisa al invitado para que lo intente otra vez.

---

## 🎉 ¡LISTO!

Una vez configurado, cada vez que alguien confirme asistencia:

- 📧 Te llega notificación
- 📊 Se registra en tu servicio elegido

¡Tu invitación estará completamente funcional! 🎂
