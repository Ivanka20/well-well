# well well

Tu proceso médico, a la vista. Sitio web para pacientes, familias, personal médico y hospitales.

## Estructura

```
index.html          página única (inicio, asistente, ingresar, app)
styles.css          diseño (paleta de 5 colores + letras recortadas)
js/cutout.js        letras estilo recorte de revista (atributo data-cut)
js/lupi-art.js      dibujo de Lupi, el personaje del asistente
js/lupi.js          chatbot (usa /api/chat; sin conexión usa un mini diccionario)
js/store.js         Supabase + modo demo
js/calendar.js      archivos .ics y Google Calendar con recordatorios
js/demo-data.js     pacientes y personal de prueba
js/app.js           rutas, carrusel, desplegables, secciones
api/chat.js         función de Vercel que llama a Claude
supabase/schema.sql tablas y reglas de seguridad (RLS)
supabase/seed.sql   datos de ejemplo (opcional)
```

## Publicar (GitHub → Vercel)

1. Sube esta carpeta a un repositorio de GitHub.
2. En Vercel: **Add New → Project**, importa el repositorio. Framework: **Other**. No hace falta comando de build.
3. En **Settings → Environment Variables** agrega `ANTHROPIC_API_KEY` con tu clave de https://console.anthropic.com. Vuelve a desplegar.

## Base de datos (Supabase)

1. Supabase → **SQL Editor** → pega y ejecuta `supabase/schema.sql`.
2. Por cada paciente o persona del personal, crea un usuario en **Authentication → Users → Add user** (marca *Auto Confirm*):
   - Paciente `WW-2048-17` → correo `ww-2048-17@paciente.wellwell.app`
   - Personal `MED-0042` → correo `med-0042@personal.wellwell.app`
   - La contraseña es su **código de acceso** (mínimo 6 caracteres).
3. Llena sus datos en las tablas (o ejecuta `supabase/seed.sql` como ejemplo).
4. En **Authentication → Providers → Email**, puedes desactivar "Allow new users to sign up": las cuentas las crea el hospital.

## Cuentas de prueba (modo demo, sin Supabase)

| Rol | ID | Código |
|---|---|---|
| Paciente internada | WW-2048-17 | 123456 |
| Paciente con citas | WW-3301-09 | 123456 |
| Personal | MED-0042 / ENF-0107 | med2026 |

En modo demo los mensajes se guardan solo en ese navegador (abre dos pestañas para ver paciente y personal conversando). Si el ID existe en Supabase, se usa Supabase.
