// #/vincular?codigo=ABCD-2345: Blender abre esta página con el código ya
// escrito. Con sesión basta con pulsar «Conectar».
import { useAuth } from '../auth/contexto';
import FormularioCodigo from '../blender/FormularioCodigo';
import { normalizarCodigo } from '../blender/logica';
import { rutaEntrar, rutas } from '../rutas';
import { PaginaCuenta } from './cuenta/Formulario';

function Vincular({ consulta }) {
  const { listo, usuario } = useAuth();
  const codigo = normalizarCodigo(consulta?.codigo ?? '') ?? '';
  const volver = codigo ? `${rutas.vincular}?codigo=${codigo}` : rutas.vincular;

  return (
    <PaginaCuenta
      antetitulo="Amatista para Blender"
      titulo="Conectar Blender"
      descripcion="Escribe el código que muestra la pestaña Amatista en Blender. Tu avance de las prácticas quedará en tu cuenta."
      pie={
        <a href={rutas.blender} className="text-neon hover:underline">
          ¿Aún no instalas el add-on? Descárgalo aquí ▸
        </a>
      }
    >
      {!listo ? null : usuario ? (
        <FormularioCodigo codigoInicial={codigo} />
      ) : (
        <div className="grid gap-3">
          <p className="text-sm text-texto/80">Primero entra con tu cuenta; volverás aquí con el código listo.</p>
          <a
            href={rutaEntrar(volver)}
            className="corte-poly-sm destello block bg-amatista px-6 py-3 text-center font-extrabold uppercase tracking-widest text-white hover:brightness-110"
          >
            Entrar ▶
          </a>
        </div>
      )}
    </PaginaCuenta>
  );
}

export default Vincular;
