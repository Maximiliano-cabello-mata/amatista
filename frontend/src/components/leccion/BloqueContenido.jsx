import Atajos from './Atajos';
import Aviso from './Aviso';
import BloqueCodigo from './BloqueCodigo';
import Capas from './Capas';
import Comparar from './Comparar';
import Figura from './Figura';
import Completar from './interactivos/Completar';
import Emparejar from './interactivos/Emparejar';
import ExploradorEscena from './interactivos/ExploradorEscena';
import Ordenar from './interactivos/Ordenar';
import PracticaBlender from './interactivos/PracticaBlender';
import PuntosImagen from './interactivos/PuntosImagen';
import QuizEnLinea from './interactivos/QuizEnLinea';
import RetoCodigo from './interactivos/RetoCodigo';
import LineaTiempo from './LineaTiempo';
import Markdown from './Markdown';
import PasoAPaso from './PasoAPaso';
import Pipeline from './Pipeline';
import TarjetasConcepto from './TarjetasConcepto';

// Bloques interactivos: todos reciben {bloque, alCompletar, resuelta}.
const INTERACTIVOS = {
  quiz_inline: QuizEnLinea,
  ordering: Ordenar,
  matching: Emparejar,
  fill_blanks: Completar,
  hotspots: PuntosImagen,
  scene_explorer: ExploradorEscena,
  code_challenge: RetoCodigo,
  blender_practice: PracticaBlender,
};

// Dibuja un bloque de contenido del JSON de la lección según su "type".
// alCompletar({correcto, intentos}) avisa que una actividad quedó resuelta
// (las tarjetas de concepto también, al descubrirlas todas). `resuelta` indica
// si la lección ya la cuenta como resuelta (por ejemplo, de una visita anterior).
function BloqueContenido({ bloque, alCompletar, alDescubrirTodas, resuelta = false }) {
  const Interactivo = INTERACTIVOS[bloque.type];
  if (Interactivo) return <Interactivo bloque={bloque} alCompletar={alCompletar} resuelta={resuelta} />;

  switch (bloque.type) {
    case 'markdown_text':
      return <Markdown texto={bloque.body} />;
    case 'image':
      return <Figura src={bloque.src} alt={bloque.alt} caption={bloque.caption} />;
    case 'concept_cards':
      return (
        <TarjetasConcepto
          items={bloque.items}
          alDescubrirTodas={() => {
            alDescubrirTodas?.();
            alCompletar?.({ correcto: true, intentos: 1 });
          }}
        />
      );
    case 'timeline':
      return <LineaTiempo title={bloque.title} items={bloque.items} />;
    case 'pipeline':
      return <Pipeline title={bloque.title} steps={bloque.steps} />;
    case 'layers':
      return <Capas title={bloque.title} items={bloque.items} footer={bloque.footer} />;
    case 'callout':
      return <Aviso variant={bloque.variant} title={bloque.title} body={bloque.body} />;
    case 'code_snippet':
      return <BloqueCodigo code={bloque.code} language={bloque.language} preview={bloque.preview} />;
    case 'step_by_step':
      return <PasoAPaso title={bloque.title} steps={bloque.steps} />;
    case 'shortcuts':
      return <Atajos title={bloque.title} items={bloque.items} practice={bloque.practice} />;
    case 'compare':
      return <Comparar title={bloque.title} before={bloque.before} after={bloque.after} mode={bloque.mode} caption={bloque.caption} />;
    case 'video_player':
      return (
        <video controls preload="none" src={bloque.url} className="corte-poly aspect-video w-full bg-black">
          Tu navegador no puede reproducir este video.
        </video>
      );
    default:
      return null;
  }
}

export default BloqueContenido;
