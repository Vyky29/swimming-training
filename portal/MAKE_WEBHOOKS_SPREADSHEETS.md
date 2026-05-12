# Make.com: Webhooks y datos a Google Sheets

Guía para conectar el Training Portal (y otros datos) con **Make** (Make.com) y llevar la información a una hoja de cálculo (Google Sheets).

---

## 1. Flujo: Portal → Webhook Make → Google Sheets

Cuando un usuario completa toda la formación, el portal envía un **POST** a la URL que tengas en `NOTIFY_COMPLETION_WEBHOOK`. Puedes usar una URL de **Make** en lugar de Formspree para que Make reciba los datos y los escriba en Sheets.

### Datos que envía el portal (JSON)

```json
{
  "email": "usuario@ejemplo.com",
  "training_type": "swimming",
  "training_name": "Swimming Training",
  "message": "Training completed: Swimming Training by usuario@ejemplo.com at 2025-03-13T...",
  "_subject": "Training completed: Swimming Training – usuario@ejemplo.com"
}
```

---

## 2. Escenario en Make: “Webhook → Google Sheets”

### Paso 1: Crear el escenario

1. Entra en [Make.com](https://www.make.com) y crea un escenario nuevo.
2. **Trigger:** busca el módulo **Webhooks** y elige **Custom webhook**.
3. Clic en “Add” para crear el webhook:
   - **Webhook URL:** se generará algo como  
     `https://hook.eu1.make.com/xxxxxxxxxxxx`
   - **Data structure:** si quieres que Make reconozca los campos, pega un ejemplo del JSON de arriba (opcional).
4. Guarda el módulo. **Copia la URL del webhook** (la usarás en el portal).

### Paso 2: Añadir Google Sheets

1. Añade un módulo después del Webhook: **Google Sheets** → **Add a row**.
2. Conecta tu cuenta de Google si aún no lo has hecho.
3. Configura:
   - **Spreadsheet:** la hoja donde quieres escribir.
   - **Sheet:** la pestaña (hoja) concreta.
   - **Values:** mapea los campos del webhook a columnas, por ejemplo:
     - Columna A (ej. “Email”) → `{{1.email}}`
     - Columna B (“Training type”) → `{{1.training_type}}`
     - Columna C (“Training name”) → `{{1.training_name}}`
     - Columna D (“Message”) → `{{1.message}}`
     - Columna E (“Date”) → `{{1.message}}` o mejor una fórmula/fecha de Make si la añades.

El número `1` en `{{1.email}}` es el número del módulo anterior (el Webhook suele ser el módulo 1). En Make lo verás en el panel izquierdo.

### Paso 3: Guardar y activar

1. Guarda el escenario y actívalo (toggle “On”).
2. En el portal, en `index.html`, cambia la variable:

```javascript
// Sustituir por tu URL de Make (Custom webhook)
var NOTIFY_COMPLETION_WEBHOOK = 'https://hook.eu1.make.com/TU_ID_WEBHOOK';
```

Desde ese momento, cada vez que alguien complete la formación, Make recibirá el POST y añadirá una fila en tu Google Sheet.

---

## 3. (Opcional) Estructura del webhook en Make

Para que Make proponga los campos al mapear, en el módulo Webhook → “Show advanced settings” → “Data structure” puedes pegar:

```json
{
  "email": "user@example.com",
  "training_type": "swimming",
  "training_name": "Swimming Training",
  "message": "Training completed: ...",
  "_subject": "Training completed: ..."
}
```

Así al elegir “Add a row” en Sheets verás `email`, `training_type`, etc. en el mapeo.

---

## 4. Flujo inverso: Google Sheets → Webhook (opcional)

Si quieres que **un cambio en la hoja** (nueva fila o celda) dispare una acción (por ejemplo llamar a una API o a otro webhook):

1. **Trigger:** **Google Sheets** → **Watch new rows** (o **Watch rows**) en la hoja que elijas.
2. **Acción:** **Webhooks** → **Make a request** (o **HTTP**) a la URL que quieras, con método POST y body construido desde los campos de la fila (p. ej. `{{1.A}}`, `{{1.B}}` según columnas).

Así puedes tener un “spreadsheet como panel” y que cada nueva fila envíe datos a otro sistema.

---

## 5. Resumen rápido

| Objetivo                         | Trigger en Make     | Acción en Make        |
|----------------------------------|---------------------|------------------------|
| Portal → Sheet (completados)     | Webhooks (Custom)   | Google Sheets – Add a row |
| Sheet → otro sistema             | Google Sheets – Watch rows | Webhooks – Make a request |

**Variable en el portal:**  
`NOTIFY_COMPLETION_WEBHOOK` en `Training Portal/index.html` (línea ~332). Pon ahí la URL del Custom webhook de Make para que los completados vayan a Make y luego a tu spreadsheet.
