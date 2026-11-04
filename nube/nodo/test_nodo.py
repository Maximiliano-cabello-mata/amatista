"""Pruebas del nodo de Amatista Cloud: plan de sesiones, aislamiento del contenedor y tokens.

    python -m pytest -q nube/nodo
"""
import hashlib
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import amatista_nodo as N  # noqa: E402

# i3 de 10.ª generación: 4 núcleos con 2 hilos cada uno (0-4, 1-5, 2-6, 3-7).
I3 = dict(hilos=8, nucleos=4, arquitectura="x86_64", grupos=[[0, 4], [1, 5], [2, 6], [3, 7]])


def test_pc_local_i3_con_40_gb_en_wsl_atiende_4_sesiones_con_un_nucleo_cada_una():
    plan = N.planear(N.Recursos(ram_gb=32, **I3))  # WSL2 con memory=32GB
    assert plan.sesiones == 4
    assert plan.cpus == 2.0 and plan.ram_gb == 3.0 and plan.hilos_llvmpipe == 2
    assert plan.cpusets == ["0,4", "1,5", "2,6", "3,7"]


def test_pc_local_en_perfil_denso_atiende_8():
    plan = N.planear(N.Recursos(ram_gb=32, **I3), perfil="denso")
    assert plan.sesiones == 8 and plan.cpus == 1.0 and plan.ram_gb == 2.0
    assert plan.cpusets == [None] * 8


def test_oracle_always_free_2_ocpu_12_gb_con_la_api_deja_1_sesion():
    oracle = N.Recursos(hilos=2, nucleos=2, ram_gb=11.6, arquitectura="aarch64", grupos=[[0], [1]])
    plan = N.planear(oracle, reserva_cpu=0.5, reserva_ram=2.5)
    assert plan.sesiones == 1 and plan.cpus == 1.0 and plan.cpusets == [None]
    # Las 5 sesiones mínimas: 4 en la PC local + 1 en Oracle.
    assert plan.sesiones + N.planear(N.Recursos(ram_gb=32, **I3)).sesiones == 5
    # En denso, Oracle da 2.
    assert N.planear(oracle, perfil="denso", reserva_cpu=0.5, reserva_ram=2.5).sesiones == 2


def test_oracle_con_los_limites_anteriores_4_ocpu_24_gb_deja_3():
    oracle = N.Recursos(hilos=4, nucleos=4, ram_gb=23.4, arquitectura="aarch64", grupos=[[0], [1], [2], [3]])
    assert N.planear(oracle, reserva_cpu=0.5, reserva_ram=2.5).sesiones == 3


def test_la_memoria_tambien_limita_y_el_numero_a_mano_no_la_rebasa():
    poca = N.Recursos(hilos=8, nucleos=4, ram_gb=8, arquitectura="x86_64", grupos=I3["grupos"])
    assert N.planear(poca).sesiones == 2
    plan = N.planear(poca, sesiones=6)
    assert plan.sesiones == 2 and any("memoria solo alcanza" in linea for linea in plan.explicacion)


def test_cada_sesion_corre_aislada():
    plan = N.planear(N.Recursos(ram_gb=32, **I3))
    args = N.LanzadorDocker(plan).argumentos("nube-0123456789abcdef01234567", 1, 2_000_000_000, Path("/tmp/s"))
    linea = " ".join(args)
    for pedazo in ("--network amatista-nube", "--cpus 2", "--memory 3g", "--memory-swap 3g", "--pids-limit 256",
                   "--read-only", "--cap-drop ALL", "--security-opt no-new-privileges", "--cpuset-cpus 1,5",
                   "AMATISTA_EXPIRA=2000000000", "LP_NUM_THREADS=2", "/tmp/s:/home/alumno/Proyectos"):
        assert pedazo in linea, pedazo
    assert "--privileged" not in linea and "-p " not in linea and "--network host" not in linea
    assert args[-1] == N.IMAGEN


def test_token_de_la_sesion():
    token = "abc123"
    huella = hashlib.sha256(token.encode()).hexdigest()
    assert N.token_valido(token, huella)
    assert not N.token_valido("otro", huella)
    assert not N.token_valido("", huella)


def test_detecta_los_recursos_de_esta_maquina():
    r = N.detectar_recursos()
    assert r.hilos >= 1 and r.nucleos >= 1 and r.ram_gb > 0 and r.grupos
