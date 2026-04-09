# StockApp v2

Aplicacion web para control de stock orientada a pequenos negocios y emprendimientos. Esta version fue replanteada desde cero con autenticacion cerrada, aislamiento de datos por usuario en Firestore y una interfaz pensada para uso mobile.

## Tipo de arquitectura

Este proyecto no utiliza un backend tradicional con API propia en `Node.js` o `Express`. La aplicacion funciona con una arquitectura `full stack` basada en servicios serverless de Firebase:

- `React` para la interfaz
- `Firebase Authentication` para autenticacion
- `Cloud Firestore` para persistencia de datos
- `Firestore Rules` para autorizacion y seguridad

En otras palabras, la app tiene backend real, pero resuelto mediante infraestructura gestionada de Firebase en lugar de una API custom.

## Caracteristicas principales

- autenticacion con `Firebase Authentication` usando usuarios creados manualmente
- acceso habilitado solo para cuentas con perfil activo en Firestore
- gestion de distribuidores con nombre, telefono y dia de visita
- carga y edicion de productos por distribuidor
- control rapido de stock actual y stock deseado
- deteccion de faltantes
- generacion de mensajes de pedido por distribuidor
- copia rapida de listas y apertura de pedidos por WhatsApp
- interfaz limitada a ancho de celular, incluso en desktop
- instalacion como app web mediante `PWA` sin agregar logica offline

## Stack

- `React 19`
- `Vite`
- `Firebase Authentication`
- `Cloud Firestore`
- `Bootstrap 5`
- `GSAP`
- `Sass`

## Demo tecnica

Esta app puede publicarse como sitio estatico y seguir funcionando conectada a Firebase. La configuracion publica del proyecto se inyecta en build a partir del archivo `.env`, mientras que la seguridad real depende de:

- autenticacion obligatoria
- reglas de Firestore
- separacion de datos por `uid`
- validacion de usuarios activos

Aunque el deploy sea estatico, el backend sigue existiendo a traves de Firebase Authentication y Cloud Firestore.

### Acceso demo desde portfolio

Si queres enlazar esta app desde tu portfolio con los datos de prueba ya cargados en el formulario de login, podes apuntar al deploy con el parametro:

```text
?demo=1
```

Ejemplo:

```text
https://tu-dominio-o-gh-pages/?demo=1
```

Con ese flag, la pantalla de login precarga:

- email: `test@test.com`
- password: `12345678`

La app solo completa los campos. El acceso real sigue dependiendo de que ese usuario exista en `Firebase Authentication` y tenga su perfil activo en Firestore.

## Arquitectura de datos

Cada usuario autenticado trabaja dentro de su propio espacio en Firestore:

```text
users/{uid}
users/{uid}/distributors/{distributorId}
users/{uid}/distributors/{distributorId}/products/{productId}
```

El documento `users/{uid}` funciona como perfil de acceso. La app solo permite entrar a usuarios que:

1. existen en `Firebase Authentication`
2. tienen un documento `users/{uid}`
3. tienen `isActive: true`

## Instalacion local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear el archivo `.env`

Copiar `.env.example` a `.env` y completar estas variables:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 3. Configurar Firebase

1. Crear un proyecto en Firebase.
2. Habilitar `Authentication > Sign-in method > Email/Password`.
3. Crear la base de datos de Firestore.
4. Publicar las reglas del archivo [firestore.rules](./firestore.rules).

### 4. Crear el primer usuario

Como esta version no tiene registro publico, cada cuenta debe ser creada manualmente.

1. Crear el usuario en `Firebase Authentication`.
2. Copiar su `UID`.
3. Crear en Firestore el documento `users/{uid}` con una estructura como esta:

```json
{
  "displayName": "Nombre del negocio",
  "email": "usuario@dominio.com",
  "isActive": true
}
```

Si el documento no existe o `isActive` no es `true`, la app bloquea el acceso.

## Scripts disponibles

- `npm run dev`: levanta el entorno local con Vite
- `npm run lint`: ejecuta ESLint
- `npm run build:app`: genera solo la carpeta `dist`
- `npm run build`: genera `dist` y sincroniza la rama local `gh-pages`
- `npm run preview`: abre una previsualizacion local de la build

## Deploy en GitHub Pages

El proyecto esta preparado para publicarse desde la rama `gh-pages`.

### Flujo recomendado

1. Trabajar en la rama `main`.
2. Ejecutar:

```bash
npm run build
```

Ese comando:

- genera la build de produccion en `dist/`
- recrea o actualiza la rama local `gh-pages`
- deja en `gh-pages` solo los archivos necesarios para publicar

### Subir los cambios

```bash
git push origin main
git push origin gh-pages
```

## PWA

La app incluye una configuracion PWA minima para que el usuario pueda instalarla en el celular:

- `manifest.webmanifest`
- iconos de aplicacion
- `service worker` basico

Importante:

- no se agrego soporte offline ni cache de negocio
- en Android suele aparecer la opcion de instalar
- en iPhone se instala desde `Compartir > Anadir a pantalla de inicio`

## Diseno mobile fijo

La interfaz fue adaptada para conservar apariencia de app de celular tambien en escritorio:

- ancho maximo equivalente a un celular grande
- contenido centrado
- barras negras laterales en pantallas anchas

Esto permite mostrar siempre una experiencia visual consistente entre desktop y mobile.

## Seguridad

Las reglas en [firestore.rules](./firestore.rules) estan preparadas para:

- permitir acceso solo al usuario autenticado propietario de sus datos
- bloquear escritura directa sobre `users/{uid}` desde el cliente
- validar la estructura basica de distribuidores y productos

Archivos que no deben subirse al repositorio:

- `.env`
- `serviceAccountKey.json`
- cualquier export o backup de Firestore

## Estructura del proyecto

```text
src/
  components/   UI principal
  firebase/     inicializacion de Firebase
  services/     acceso a Firestore
  utils/        validaciones y helpers
  scss/         estilos modulares
public/
  icons/        iconos PWA
  manifest.webmanifest
  sw.js
scripts/
  sync-gh-pages.mjs
```

## Estado actual

Esta version esta pensada como una base mas segura y presentable que la original:

- sin registro abierto
- con datos aislados por usuario
- con deploy estatico simple
- con experiencia mobile-first
- con instalacion como app web
