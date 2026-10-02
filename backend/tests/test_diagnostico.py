from diagnostico_oracle import ESPERADO, comparar, obsoletas


def esquema_correcto():
    return {tabla: dict(columnas) for tabla, columnas in ESPERADO.items()}


def test_esquema_correcto_no_tiene_problemas():
    real = esquema_correcto()
    real["USUARIOS"]["CREADO_EN"] = "TIMESTAMP(6)"
    assert comparar(real) == []


def test_detecta_tabla_faltante_y_tipo_numerico():
    real = esquema_correcto()
    del real["PROGRESO_LECCIONES"]
    real["SESIONES"]["USUARIO_ID"] = "NUMBER"
    problemas = comparar(real)
    assert "Falta la tabla PROGRESO_LECCIONES." in problemas
    assert any("SESIONES.USUARIO_ID es NUMBER" in p and "ORA-01722" in p for p in problemas)


def test_senala_tablas_obsoletas():
    real = esquema_correcto()
    real["SESIONES_WEB"] = {"ID": "VARCHAR2"}
    assert obsoletas(real) == ["SESIONES_WEB"]


def test_detecta_sesiones_con_id_corto_y_columnas_faltantes():
    # Esquema que deja solo 001: SESIONES.ID de 36 caracteres y USUARIOS sin email.
    real = esquema_correcto()
    real["SESIONES"]["ID"] = "VARCHAR2(36)"
    del real["USUARIOS"]["EMAIL"]
    problemas = comparar(real)
    assert any("SESIONES.ID es VARCHAR2(36)" in p and "ORA-12899" in p for p in problemas)
    assert "Falta la columna USUARIOS.EMAIL." in problemas


def test_columna_mas_larga_de_lo_necesario_no_es_problema():
    real = esquema_correcto()
    real["USUARIOS"]["NOMBRE"] = "VARCHAR2(400)"
    assert comparar(real) == []
