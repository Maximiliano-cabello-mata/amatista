# Amatista Cloud: qué hacer en cada dispositivo

**Orden recomendado:**
1. Oracle Database;
2. los tokens;
3. la API;
4. Cloudflare;
5. los nodos: tu PC y la VM de Oracle;
6. probar.

Cada paso dice **dónde** se hace. Lo que está entre `<…>` lo cambias por tu dato.

| # | Dónde | Qué | Tiempo |
|---|---|---|--:|
| 1 | Oracle Cloud › Database Actions | Ejecutar `014_nube.sql` | 2 min |
| 2 | Cualquier equipo con Python | Crear un token por nodo | 1 min |
| 3 | VM de Oracle (la API) | Variables de Amatista Cloud y actualizar | 5 min |
| 4 | Cloudflare (panel web) | Un túnel por nodo | 10 min |
| 5 | **Tu PC local** (Windows + WSL2, o Linux) | Docker, imagen, nodo y túnel | 30 min |
| 6 | VM de Oracle (como nodo) | Docker, imagen ARM64, nodo y túnel | 30 min |
| 7 | Navegador | Probar con una cuenta `@utn.mx` | 5 min |

> **Nunca subas a Git** `nodo.env` ni los tokens. Ponlos en Doppler o en el entorno `amatista1` de GitHub, como el resto de los secretos.

---

## 1. Oracle Database (Database Actions)

1. Primero, en la VM por SSH:
   ```bash
   cd ~/amatista/backend && source venv/bin/activate && python diagnostico_oracle.py
   ```
   Si pide scripts anteriores (007 a 013), sigue [la guía del 4 de noviembre](../despliegue/2026-11-04_actualizar_oracle.md).
2. OCI › **Autonomous Database** › tu base › **Database Actions** › **SQL**, como **ADMIN**.
3. Pega **todo** `backend/sql/014_nube.sql` y pulsa **«Ejecutar script» (F5)**.
4. En «Salida de script» deben salir líneas `OK: CREATE TABLE nube_sesiones…` y la tabla de verificación con **25 filas en OK**.

Se puede repetir sin problema: solo crea una tabla y dos índices, y no toca otros datos.

---

## 2. Tokens de los nodos (cualquier equipo con Python 3)

Un token por equipo que presta recursos. Por ejemplo, `oracle` y `casa`:

```bash
cd amatista/nube/nodo
python3 amatista_nodo.py nuevo-token oracle
python3 amatista_nodo.py nuevo-token casa
```

Cada comando imprime dos cosas:
- `AMATISTA_NODO_TOKEN=…` → va en el `nodo.env` **de ese equipo** (paso 5 o 6). Es secreto.
- `oracle:<64 caracteres>` → va en la API (paso 3). Es solo el hash: no sirve para hacerse pasar por el nodo.

---

## 3. La API (VM de Oracle, por SSH)

1. Agrega las variables donde viven las de la API. Producción usa `/etc/amatista/amatista-api.env` (root, 600) o `backend/.env`:
   ```bash
   sudo nano /etc/amatista/amatista-api.env
   ```
   ```ini
   AMATISTA_NUBE_DOMINIOS=utn.mx
   AMATISTA_NUBE_NODOS=oracle:<hash-de-oracle>,casa:<hash-de-casa>
   AMATISTA_NUBE_MINUTOS=60
   AMATISTA_NUBE_POR_DIA=2
   ```
   **Confirma el dominio de los correos de la UTN.** Si los alumnos usan `@alumno.utn.mx`, ya entra con `utn.mx`, porque los subdominios cuentan. Si es otro dominio, agrégalo separado por comas.
2. Actualiza y reinicia. El script corre las pruebas y el diagnóstico antes de reiniciar:
   ```bash
   bash ~/amatista/despliegue/actualizar.sh
   ```
3. Comprueba:
   ```bash
   curl -s https://api.amatista-3d.tech/api/nube/v1/estado
   ```
   Al principio debe decir `"nodos":0`. Es normal: todavía no hay nodos.

---

## 4. Cloudflare (panel web): un túnel por nodo

Los nodos no abren puertos en tu módem: `cloudflared` sale hacia Cloudflare y publica el proxy del nodo con `https`.

1. Cloudflare › **Zero Trust** › **Networks** › **Tunnels** › **Create a tunnel** › **Cloudflared**.
2. Nombre: `amatista-nodo-casa`. Cloudflare te da un comando con un **token del túnel**; guárdalo para el paso 5.
3. **Public hostname**:
   - Subdomain: `nodo-casa`
   - Domain: `amatista-3d.tech`
   - Service: `HTTP` → `127.0.0.1:8730`
4. Repite para la VM: `amatista-nodo-oracle` → `nodo-oracle.amatista-3d.tech` → `HTTP 127.0.0.1:8730`.

WebSockets ya vienen activados en Cloudflare: es lo que usa el escritorio. **No** le pongas Cloudflare Access a estos hostnames, porque rompería la entrada con token. La seguridad ya la pone el token de cada sesión.

---

## 5. Tu PC local (i3 de 10.ª generación, 40 GB, sin GPU) → 4 sesiones

### 5.a Si tiene Windows: WSL2 con Ubuntu 24.04

1. **PowerShell como administrador:**
   ```powershell
   wsl --install -d Ubuntu-24.04
   ```
   Reinicia si lo pide y crea tu usuario de Ubuntu.
2. **Dale recursos a WSL.** Crea `C:\Users\<tu-usuario>\.wslconfig`:
   ```ini
   [wsl2]
   memory=32GB
   processors=8
   swap=4GB
   ```
   Luego, en PowerShell:
   ```powershell
   wsl --shutdown
   ```
   Así quedan 8 GB para Windows y 32 GB para Amatista Cloud.
3. **Activa systemd dentro de Ubuntu**, para que el nodo arranque solo:
   ```bash
   sudo tee /etc/wsl.conf >/dev/null <<'EOF'
   [boot]
   systemd=true
   EOF
   ```
   Vuelve a ejecutar `wsl --shutdown` en PowerShell y abre Ubuntu de nuevo.
4. **Que la PC no se duerma:**
   - Configuración › Sistema › Energía › «Suspender» → **Nunca** (con corriente).
   - Para que WSL siga vivo sin una terminal abierta, crea en el Programador de tareas una tarea «Al iniciar sesión» que ejecute `wsl.exe -d Ubuntu-24.04 --exec sleep infinity`.

### 5.b Ya dentro de Ubuntu (WSL2 o Linux nativo)

```bash
# Docker Engine (no hace falta Docker Desktop)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER" && newgrp docker

# Amatista y el nodo
git clone https://github.com/Maximiliano-cabello-mata/amatista.git ~/amatista
cd ~/amatista/nube/nodo
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt

# La imagen de la sesión (una vez; tarda unos minutos y ocupa 1.7 GB)
.venv/bin/python amatista_nodo.py construir

# ¿Cuántas sesiones caben?
.venv/bin/python amatista_nodo.py diagnostico
```

`diagnostico` debe decir: «8 hilos en 4 núcleos (x86_64), ~31 GB… → **4 sesiones**», y que cada sesión queda fijada a un núcleo físico. Para 8 sesiones más ligeras, usa `AMATISTA_NODO_PERFIL=denso`.

**Configura y prueba a mano:**
```bash
cp nodo.env.ejemplo nodo.env && nano nodo.env
# AMATISTA_NODO_TOKEN=<el de «casa» del paso 2>
# AMATISTA_NODO_URL=https://nodo-casa.amatista-3d.tech
.venv/bin/python amatista_nodo.py --config nodo.env ejecutar
```
Debe decir `Nodo listo: 4 sesiones…`. Detenlo con Ctrl+C: cierra las sesiones y le avisa a la API.

**El túnel de Cloudflare:**
```bash
curl -fsSL -o cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo apt install ./cloudflared.deb
sudo cloudflared service install <token-del-túnel-amatista-nodo-casa>
```

**Que arranque solo** (servicio de systemd):
```bash
sed -e "s#User=amatista#User=$USER#" -e "s#/home/amatista/amatista#$HOME/amatista#g" amatista-nodo.service \
  | sudo tee /etc/systemd/system/amatista-nodo.service >/dev/null
sudo systemctl daemon-reload && sudo systemctl enable --now amatista-nodo
journalctl -u amatista-nodo -f
```

---

## 6. VM de Oracle como nodo (Ampere A1, ARM64) → 1 sesión (3 si tu cuenta conserva 4 OCPU)

La VM ya corre la API, así que el nodo le deja media OCPU y 2.5 GB.

```bash
# Docker en Oracle Linux 9 (ARM64)
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker opc && newgrp docker

cd ~/amatista/nube/nodo
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python amatista_nodo.py construir        # imagen ARM64: Blender 4.0.2 de Ubuntu + KasmVNC arm64
cp nodo.env.ejemplo nodo.env && nano nodo.env
# AMATISTA_NODO_TOKEN=<el de «oracle»>
# AMATISTA_NODO_URL=https://nodo-oracle.amatista-3d.tech
# AMATISTA_NODO_RESERVA_CPU=0.5
# AMATISTA_NODO_RESERVA_RAM=2.5
.venv/bin/python amatista_nodo.py --config nodo.env diagnostico
```

**El túnel:**
```bash
curl -fsSL -o cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-aarch64.rpm
sudo dnf install -y ./cloudflared.rpm
sudo cloudflared service install <token-del-túnel-amatista-nodo-oracle>
```

**El servicio:**
```bash
sed -e "s#User=amatista#User=opc#" -e "s#/home/amatista/amatista#/home/opc/amatista#g" amatista-nodo.service \
  | sudo tee /etc/systemd/system/amatista-nodo.service >/dev/null
sudo systemctl daemon-reload && sudo systemctl enable --now amatista-nodo
```

**Antes de nada, revisa cuánto te da Oracle hoy:**
```bash
nproc && free -g
```
- Si dice **2 y 11**, tu cuenta ya tiene el nuevo límite de 2 OCPU y 12 GB.
- **No pidas más OCPU** de las que tiene tu cuenta gratuita: Oracle apaga las instancias que pasan del límite de Always Free.

---

## 7. Probar

1. **En cada nodo:**
   ```bash
   journalctl -u amatista-nodo -n 20
   ```
   Debe decir `Nodo listo`, y no debe haber «Sin conexión».
2. **Prueba completa en un equipo** (levanta su propia API de prueba con SQLite):
   ```bash
   cd ~/amatista && python3 nube/nodo/prueba_punta_a_punta.py
   ```
   Debe terminar en «Todo bien: Amatista Cloud funciona de punta a punta».
3. **En el navegador:**
   - Entra a <https://amatista-3d.tech/#/nube> con tu cuenta de administrador. Abajo verás **«Nodos y sesiones»**: `casa` (4) y `oracle` (1) en línea.
   - Con una cuenta `@utn.mx` con el correo confirmado, prueba «Abrir mi Blender en la nube» → «Entrar a Blender». En la barra de Blender debe aparecer «Amatista Cloud · quedan 59 min».
   - Con una cuenta que no sea de la UTN debe decir «Amatista Cloud es solo para cuentas de la UTN».

---

## Operación diaria

| Quiero… | Comando o lugar |
|---|---|
| Ver qué hace un nodo | `journalctl -u amatista-nodo -f` |
| Ver nodos y sesiones | `#/nube` con cuenta admin, o `GET /api/nube/v1/admin` |
| Terminar la sesión de alguien | `POST /api/nube/v1/admin/sesiones/<id>/terminar` |
| Apagar un nodo sin cortar a nadie de golpe | `sudo systemctl stop amatista-nodo`: cierra las sesiones y le avisa a la API |
| Cambiar la duración o la cuota | `AMATISTA_NUBE_MINUTOS` y `AMATISTA_NUBE_POR_DIA` en la API, y reiniciarla |
| Quitar un nodo | Borrar su `nombre:hash` de `AMATISTA_NUBE_NODOS` y reiniciar la API |
| Actualizar la imagen | `git pull && .venv/bin/python amatista_nodo.py construir && sudo systemctl restart amatista-nodo` |

## Problemas comunes

| Síntoma | Causa y arreglo |
|---|---|
| `La API no reconoce el token de este nodo` | El `nombre:hash` no está en `AMATISTA_NUBE_NODOS`, o la API no se reinició |
| `Falta la imagen amatista-nube-sesion:1` | Falta correr `amatista_nodo.py construir` |
| La sesión se queda en «Preparando» | Revisa `journalctl` del nodo. Si dice `no abrió`, prueba `docker run --rm amatista-nube-sesion:1` a mano |
| «Entrar a Blender» da 403 | El token se renovó en otro dispositivo. En este navegador, borra los datos del sitio o entra desde el dispositivo nuevo: la página pide un token nuevo cuando no tiene uno guardado |
| Pantalla negra en el escritorio | Revisa el túnel: `cloudflared tunnel info` o el panel. Ese hostname debe ir a `http://127.0.0.1:8730` |
| `Amatista Cloud todavía no está listo… (falta sql/014)` | Falta el paso 1 |
