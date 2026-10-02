"""Diagnóstico de la base de datos de Amatista.

Uso, en el servidor y con el entorno virtual activo:

    cd ~/amatista/backend
    source venv/bin/activate
    python diagnostico_oracle.py

Revisa la conexión, muestra con qué usuario y esquema entraste y compara las
tablas reales con las que espera el backend. No modifica nada.
"""
import sys

from sqlalchemy import Integer, String, Text, text

from database.conexion import crear_motor
from database.modelos import Base


def tipo_oracle(columna) -> str:
    """Tipo de Oracle para una columna del modelo, como "VARCHAR2(64)" o "NUMBER"."""
    if isinstance(columna.type, Text):
        return "CLOB"
    if isinstance(columna.type, String):
        return f"VARCHAR2({columna.type.length})"
    if isinstance(columna.type, Integer):
        return "NUMBER"
    return "TIMESTAMP"


# Tablas y tipos que espera el backend: salen de database/modelos.py, que
# coincide con sql/001 + sql/002.
ESPERADO = {
    tabla.name.upper(): {c.name.upper(): tipo_oracle(c) for c in tabla.columns}
    for tabla in Base.metadata.sorted_tables
}

# Tablas de versiones anteriores que el script SQL elimina.
OBSOLETAS = {"SESIONES_WEB"}

# Fragmentos de errores comunes y qué significan.
PISTAS = [
    ("ORA-01017", "Usuario o contraseña incorrectos (DB_USER / DB_PASSWORD)."),
    ("ORA-12506", "Oracle rechazó la conexión por la lista de acceso (ACL): solo acepta la IP del "
                  "servidor ARM. Ejecuta esto desde el servidor o agrega tu IP a la ACL en OCI."),
    ("ORA-12514", "El servicio no existe: revisa DB_SERVICE o copia en DB_DSN la cadena TLS de la consola."),
    ("DPY-6005", "No se pudo abrir la conexión: revisa host, puerto 1522 y la ACL de la base."),
    ("DPY-6000", "No se pudo abrir la conexión: revisa host, puerto 1522 y la ACL de la base."),
    ("timed out", "La conexión tardó demasiado: suele ser la ACL de Oracle o un firewall."),
    ("Connection reset", "Se intentó TCP sin cifrar: Autonomous Database exige tcps en el puerto 1522."),
    ("ORA-28759", "Falla de TLS o wallet: si la base exige mTLS, desactívalo (TLS con ACL) o usa el wallet."),
]


def separar(tipo):
    """"VARCHAR2(64)" -> ("VARCHAR2", 64); "TIMESTAMP(6)" -> ("TIMESTAMP", None)."""
    base, _, resto = tipo.partition("(")
    if base == "VARCHAR2" and resto.rstrip(")").isdigit():
        return base, int(resto.rstrip(")"))
    return base, None


def comparar(real):
    """Compara las tablas reales con las esperadas.

    real: {"TABLA": {"COLUMNA": "TIPO"}} tal como sale de USER_TAB_COLUMNS
    (los VARCHAR2 con su largo en caracteres, por ejemplo "VARCHAR2(36)").
    Devuelve la lista de problemas (vacía si todo coincide).
    """
    problemas = []
    for tabla, columnas in ESPERADO.items():
        if tabla not in real:
            problemas.append(f"Falta la tabla {tabla}.")
            continue
        for columna, tipo in columnas.items():
            tipo_real = real[tabla].get(columna)
            if tipo_real is None:
                problemas.append(f"Falta la columna {tabla}.{columna}.")
                continue
            base, largo = separar(tipo)
            base_real, largo_real = separar(tipo_real)
            if base_real != base:
                aviso = f"{tabla}.{columna} es {tipo_real} y debería ser {tipo}."
                if base == "VARCHAR2" and base_real == "NUMBER":
                    aviso += " Guardar ahí un correo o un UUID provoca ORA-01722 (invalid number)."
                problemas.append(aviso)
            elif largo and largo_real and largo_real < largo:
                problemas.append(
                    f"{tabla}.{columna} es {tipo_real} y debería ser {tipo}: "
                    "los valores más largos fallan con ORA-12899 (value too large)."
                )
    return problemas


def obsoletas(real):
    return sorted(tabla for tabla in real if tabla.upper() in OBSOLETAS)


def main() -> int:
    try:
        motor = crear_motor()
        if motor.dialect.name != "oracle":
            print(f"Este diagnóstico es para Oracle y la conexión configurada es {motor.dialect.name}.")
            print("Quita DATABASE_URL de backend/.env para usar Oracle.")
            return 1
        with motor.connect() as conexion:
            usuario, esquema = conexion.execute(
                text("SELECT USER, SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') FROM DUAL")
            ).one()
            version = getattr(conexion.connection.driver_connection, "version", "?")
            filas = conexion.execute(
                text(
                    "SELECT table_name, column_name, "
                    "CASE WHEN data_type = 'VARCHAR2' THEN 'VARCHAR2(' || char_length || ')' "
                    "ELSE data_type END FROM user_tab_columns "
                    "ORDER BY table_name, column_id"
                )
            ).all()
    except Exception as error:  # noqa: BLE001 - se muestra cualquier falla de conexión
        print("✗ No se pudo conectar a Oracle.")
        print(f"  {error}")
        for fragmento, pista in PISTAS:
            if fragmento.lower() in str(error).lower():
                print(f"  → {pista}")
        return 1

    print(f"✓ Conectado a Oracle {version} como {usuario} (esquema {esquema}).")

    real = {}
    for tabla, columna, tipo in filas:
        real.setdefault(tabla, {})[columna] = tipo

    propias = [t for t in real if not t.startswith("DBTOOLS$")]
    print(f"  Tablas en el esquema: {', '.join(sorted(propias)) or '(ninguna)'}")
    for tabla in obsoletas(real):
        print(f"  · {tabla} es de una versión anterior y ya no se usa.")

    problemas = comparar(real)
    if problemas:
        print("✗ Las tablas no coinciden con lo que espera el backend:")
        for problema in problemas:
            print(f"  - {problema}")
        print("→ Solución: en Database Actions > SQL ejecuta con «Ejecutar script» (F5):")
        if not any(t in real for t in ("USUARIOS", "SESIONES", "PROGRESO_LECCIONES")):
            print("  1. backend/sql/001_esquema_amatista.sql (crea las tablas base)")
            print("  2. backend/sql/002_autenticacion_y_contenido.sql")
        else:
            print("  backend/sql/002_autenticacion_y_contenido.sql (agrega lo que falta sin borrar datos).")
        return 2

    print("✓ Las tablas coinciden con lo que espera el backend.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
