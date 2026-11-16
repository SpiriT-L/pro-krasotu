import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Master } from '../types';

type Props = { masters: Master[]; onSelect: (master: Master) => void; onPrevious: () => void; onNext: () => void };
export function MastersSection({ masters, onSelect, onPrevious, onNext }: Props) {
  return (
    <section className="masters section bg-[#f4f1ec]" id="masters">
      <div className="section-top">
        <p>
          Наши <em>мастера.</em>
        </p>
      </div>
      <div
        className="masters-carousel overflow-hidden"
        onMouseEnter={(event) => event.currentTarget.classList.add('paused')}
        onMouseLeave={(event) => event.currentTarget.classList.remove('paused')}
      >
        <div className="master-track flex w-max gap-4">
          {masters.map((master) => (
            <button className="master-card shrink-0" key={master.id} onClick={() => onSelect(master)}>
              <img className="block w-full object-cover" src={master.photo} alt={master.fullName} />
              <span className="master-role">{master.specialization}</span>
              <h3>{master.fullName}</h3>
              <ArrowUpRight size={18} />
            </button>
          ))}
        </div>
        <div className="carousel-controls">
          <button className="carousel-button" aria-label="Предыдущие мастера" onClick={onPrevious}>
            <ArrowLeft size={18} />
          </button>
          <span>Наведите, чтобы остановить</span>
          <button className="carousel-button" aria-label="Следующие мастера" onClick={onNext}>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
