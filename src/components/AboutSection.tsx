import { ArrowUpRight } from 'lucide-react';

type Props = {
  images: string[];
  imageIndex: number;
  expanded: boolean;
  description: string;
  onImageSelect: (index: number) => void;
  onToggle: () => void;
};
export function AboutSection({ images, imageIndex, expanded, description, onImageSelect, onToggle }: Props) {
  return (
    <section className="intro section" id="about">
      <h2 className="intro-heading">
        Место, где
        <br />
        <em>становится легче.</em>
      </h2>
      <div className="salon-layout">
        <div className="salon-carousel">
          <img src={images[imageIndex]} alt={`Интерьер салона ПРО красоту, фото ${imageIndex + 1}`} />
          <div className="salon-carousel-controls">
            <div className="salon-dots" aria-label="Выбор фотографии салона">
              {images.map((image, index) => (
                <button
                  key={image}
                  className={index === imageIndex ? 'salon-dot active' : 'salon-dot'}
                  aria-label={`Показать фото ${index + 1}`}
                  onClick={() => onImageSelect(index)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="salon-copy">
          <div className={expanded ? 'salon-description expanded' : 'salon-description'}>
            {description.split('\n\n').map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <button className="text-link more-button" onClick={onToggle}>
            {expanded ? 'Свернуть' : 'Ещё'} <ArrowUpRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}
