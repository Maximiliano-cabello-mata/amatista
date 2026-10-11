import { useState } from 'react';
import { useAuth } from '../auth/contexto';
import { Alerta } from '../pages/cuenta/Formulario';
import { confirmarVinculo } from '../services/blender';
import { normalizarCodigo } from './logica';

// El alumno escribe aquí el código que muestra Blender (ABCD-2345): el add-on
// lo detecta en segundos y queda conectado con la cuenta.
function FormularioCodigo({ codigoInicial = '', alConectar }) {
  const { token } = useAuth();
  const [texto, setTexto] = useState(codigoInicial);
  const [estado, setEstado] = useState({ enviando: false, error: null, listo: null });

  const enviar = async (evento) => {
    evento.preventDefault();
    const codigo = normalizarCodigo(texto);
    if (!codigo) {
      setEstado({ enviando: false, error: 'El código tiene 8 letras y números, como ABCD-2345.', listo: null });
      return;
    }
    setEstado({ enviando: true, error: null, listo: null });
    const respuesta = await confirmarVinculo(token, codigo);
    if (respuesta.ok) {
      setEstado({ enviando: false, error: null, listo: respuesta.datos?.dispositivo ?? 'Blender' });
      alConectar?.();
    } else {
      setEstado({ enviando: false, error: respuesta.error, listo: null });
    }
  };

  if (estado.listo) {
    return (
      <Alerta tipo="exito">
        <strong>¡Blender conectado!</strong> Vuelve a Blender: en unos segundos verás tu nombre en la pestaña Amatista.
      </Alerta>
    );
  }

  return (
    <form noValidate onSubmit={enviar} className="grid gap-3">
      <label htmlFor="codigo-blender" className="font-mono text-xs uppercase tracking-widest text-white/60">
        Código que muestra Blender
      </label>
      {/* flex-wrap: el formulario también vive en columnas angostas (la práctica del módulo). */}
      <div className="flex flex-wrap gap-3">
        <input
          id="codigo-blender"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={12}
          placeholder="ABCD-2345"
          className="corte-poly-sm min-w-0 flex-[1_1_11rem] border border-white/15 bg-black/30 px-3 py-3 text-center font-mono text-xl uppercase tracking-[0.2em] sm:text-2xl text-white placeholder:text-white/20 focus:border-neon focus:outline-none"
        />
        <button
          type="submit"
          disabled={estado.enviando}
          className="corte-poly-sm destello flex-auto bg-amatista px-5 py-3 font-extrabold uppercase tracking-wider text-white transition-[filter] hover:brightness-110 disabled:cursor-wait disabled:opacity-50"
        >
          {estado.enviando ? 'Conectando…' : 'Conectar'}
        </button>
      </div>
      <Alerta>{estado.error}</Alerta>
    </form>
  );
}

export default FormularioCodigo;
