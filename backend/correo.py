"""Envío de códigos de verificación por correo.

Con SMTP_HOST configurado se envía por SMTP con STARTTLS (puerto 587).
Sin SMTP_HOST (desarrollo y pruebas) el código se escribe en la terminal
del backend.

Variables en backend/.env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
y SMTP_FROM (remitente; si falta se usa SMTP_USER).
"""
import logging
import os
import smtplib
import ssl
from email.message import EmailMessage

log = logging.getLogger("amatista.correo")

ASUNTOS = {
    "correo": "Confirma tu correo en Amatista",
    "password": "Recupera tu cuenta de Amatista",
}
TEXTOS = {
    "correo": "Tu código para confirmar el correo es {codigo}. Vence en 15 minutos.",
    "password": (
        "Tu código para crear una contraseña nueva es {codigo}. Vence en 15 minutos.\n"
        "Si no lo pediste, ignora este mensaje: tu contraseña sigue igual."
    ),
}


def enviar_codigo(email: str, codigo: str, proposito: str) -> None:
    """Se ejecuta en segundo plano: un fallo del correo nunca rompe la petición."""
    texto = TEXTOS[proposito].format(codigo=codigo)
    host = os.getenv("SMTP_HOST")
    if not host:
        log.warning("SMTP_HOST no está configurado. Código para %s (%s): %s", email, proposito, codigo)
        return

    usuario = os.getenv("SMTP_USER")
    mensaje = EmailMessage()
    mensaje["Subject"] = ASUNTOS[proposito]
    mensaje["From"] = os.getenv("SMTP_FROM") or usuario or "no-responder@amatista.local"
    mensaje["To"] = email
    mensaje.set_content(texto)
    try:
        with smtplib.SMTP(host, int(os.getenv("SMTP_PORT", "587")), timeout=15) as smtp:
            smtp.starttls(context=ssl.create_default_context())
            if usuario:
                smtp.login(usuario, os.getenv("SMTP_PASSWORD", ""))
            smtp.send_message(mensaje)
    except (OSError, smtplib.SMTPException):
        log.exception("No se pudo enviar el correo a %s", email)
