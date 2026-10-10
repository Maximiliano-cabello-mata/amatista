import ImagenLigera from '../ImagenLigera';
function Figura({ src, alt, caption, prioridad = false }) {
  return (
    <figure className="corte-poly overflow-hidden border border-white/10 bg-superficie">
      <ImagenLigera
        src={import.meta.env.BASE_URL + src}
        alt={alt}
        ancho={640}
        alto={360}
        prioridad={prioridad}
        className="block w-full"
        imgClassName="block h-full w-full object-cover"
      />
      {caption && (
        <figcaption className="border-t border-white/5 px-4 py-2 font-mono text-xs text-white/50">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default Figura;
