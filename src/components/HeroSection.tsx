import { ArrowDown, ArrowUpRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="hero flex min-h-[760px] flex-col justify-center px-[12vw] py-[19vh]" id="top">
      <div className="hero-copy">
        <p className="eyebrow mb-8 text-[11px] uppercase tracking-[.12em]">Салон красоты · Минск</p>
        <h1 className="m-0 mb-8 text-[clamp(64px,9vw,138px)] font-medium leading-[.88] tracking-[-.07em]">
          Красота —<br />
          <em>это про вас.</em>
        </h1>
        <p className="hero-description mb-10 max-w-[300px] text-base leading-[1.6]">
          Пространство, где забота о себе становится красивой привычкой.
        </p>
        <a className="button button-light inline-flex items-center justify-center gap-4" href="#booking">
          Записаться <ArrowUpRight size={18} />
        </a>
      </div>
      <div className="hero-note">
        <span>Премиальный уход для всей семьи</span>
      </div>
      <a className="scroll-cue" href="#about">
        <ArrowDown size={16} /> листайте ниже
      </a>
    </section>
  );
}
