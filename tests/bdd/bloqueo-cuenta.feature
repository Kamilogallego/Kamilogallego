# language: es
Característica: Protección de una cuenta bloqueada temporalmente
  La cuenta permanece sin acceso durante los quince minutos posteriores
  al quinto intento fallido, incluso si se presenta la contraseña correcta.

  Escenario: Denegar una contraseña correcta durante el bloqueo (CP-05)
    Dado una cuenta bloqueada desde hace un minuto por cinco fallos consecutivos
    Cuando intento iniciar sesión con la contraseña correcta
    Entonces el acceso es denegado por el bloqueo temporal
    Y se mantienen el vencimiento original y los cinco fallos
