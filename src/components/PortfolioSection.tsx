type PortfolioItem = { src: string; alt: string; size: string };
export function PortfolioSection({ items }: { items: PortfolioItem[] }) {
  return (
    <section className="portfolio section bg-[#d8d0c5]" id="portfolio">
      <div className="section-top">
        <p>
          Вдохновение в каждой <br />
          <em>детали.</em>
        </p>
      </div>
      <div className="gallery">
        {items.map((item, index) => (
          <img
            className={`${item.size} block h-full w-full object-cover`}
            key={`${item.alt}-${index}`}
            src={item.src}
            alt={item.alt}
            loading="lazy"
          />
        ))}
      </div>
    </section>
  );
}
