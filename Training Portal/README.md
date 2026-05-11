# Training Portal – Login y progreso

La guia principal de despliegue ya no vive solo en esta carpeta.

## Usa esta documentacion

- Lee `../README.md` para el flujo actual de GitHub y Vercel.
- El despliegue ya se genera con `../build_swimming_training.py`.
- La salida lista para publicar queda en `../dist/`.

## Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ejecuta `supabase_schema.sql` en el SQL Editor.
3. Usa siempre HTTPS en produccion o `localhost` en pruebas.

## Flujo actual

- El portal, los modulos 1-5 y los quizzes se publican desde una version generada.
- Las rutas limpias se construyen en `dist/`.
- Vercel debe desplegar `dist/`, no los HTML fuente sin procesar.
