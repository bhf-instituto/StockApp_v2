export function getAuthErrorMessage(error) {
  const errorCode = error?.code ?? "";

  switch (errorCode) {
    case "auth/invalid-email":
      return "El correo electronico no tiene un formato valido.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Usuario o contrasena incorrectos.";
    case "auth/user-disabled":
      return "Esta cuenta fue deshabilitada.";
    case "auth/too-many-requests":
      return "Demasiados intentos fallidos. Espera un momento e intenta otra vez.";
    default:
      return "No pudimos iniciar sesion. Revisa tus datos e intenta nuevamente.";
  }
}
