# StockApp v2

Aplicacion web para control de stock con autenticacion cerrada, usuarios habilitados manualmente y datos aislados por `uid` en Firestore.

## Objetivos de esta version

- eliminar el registro publico
- dejar la seguridad alineada con Firebase Auth + Firestore Rules
- separar los datos por `uid` desde el inicio
- mejorar la estructura del proyecto para que sea mas mantenible y presentable

## Stack

- `React 19`
- `Vite`
- `Firebase Authentication`
- `Cloud Firestore`
- `Bootstrap`
- `GSAP`

## Arquitectura de datos

Cada usuario autenticado trabaja unicamente dentro de su propio espacio:

```text
users/{uid}
users/{uid}/distributors/{distributorId}
users/{uid}/distributors/{distributorId}/products/{productId}
```

El documento `users/{uid}` funciona como perfil de acceso. La app solo deja entrar a usuarios que:

1. existen en Firebase Authentication
2. tienen un documento `users/{uid}`
3. tienen `isActive: true`

## Configuracion inicial

1. Crear un proyecto nuevo en Firebase.
2. Habilitar `Authentication > Sign-in method > Email/Password`.
3. Crear una base de datos en Firestore.
4. Copiar `.env.example` a `.env` y completar las variables.
5. Publicar las reglas de [firestore.rules](./firestore.rules).

## Alta manual de usuarios

Como esta version no tiene registro publico, cada usuario debe ser creado por vos.

### Paso 1: crear usuario en Firebase Auth

Crear el usuario desde la consola de Firebase con email y contrasena.

### Paso 2: crear documento de perfil

Crear en Firestore el documento `users/{uid}` con una estructura como esta:

```json
{
  "displayName": "Nombre del negocio",
  "email": "usuario@dominio.com",
  "isActive": true
}
```

Si el documento no existe o `isActive` no es `true`, la app bloquea el acceso.

## Scripts

- `npm run dev`: entorno de desarrollo
- `npm run build`: build de produccion
- `npm run lint`: chequeo de lint
- `npm run preview`: preview local del build

## Deploy estatico

La build queda lista en `dist/`.

Para publicar en GitHub Pages usando el contenido generado:

1. correr `npm run build`
2. subir el contenido de `dist/` al destino de publicacion
3. publicar esa carpeta o sus archivos como sitio estatico

La configuracion de Vite usa rutas relativas para que el contenido de `dist/` funcione mejor cuando se publica como carpeta estatica.

## Reglas de seguridad

El proyecto incluye un archivo [firestore.rules](./firestore.rules) preparado para:

- permitir acceso solo al usuario autenticado propietario de sus datos
- bloquear la escritura del documento `users/{uid}` desde el cliente
- validar la forma basica de distribuidores y productos

## Pendientes recomendados

- agregar un panel administrativo o script para alta de usuarios
- desplegar Hosting en Firebase si esta va a ser la version productiva
- sumar tests para la capa de servicios si queres llevarlo a una base mas robusta
