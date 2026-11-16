import { ArrowUpRight } from 'lucide-react';
import { Category } from '../types';
import { getCategoryImage } from '../data/site';

type Props = { categories: Category[]; onSelect: (category: Category) => void };

export function ServiceCategories({ categories, onSelect }: Props) {
  return (
    <section className="services section bg-[#ebe6df]" id="services">
      <div className="section-top">
        <p>
          Найдите свой способ <br />
          <em>почувствовать себя лучше.</em>
        </p>
      </div>
      <div className="service-category-grid grid grid-cols-2 gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <button
            className="service-category-card group overflow-hidden rounded-3xl border border-[#d2c8bb] bg-[#f8f5f0] text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            key={category.id}
            onClick={() => onSelect(category)}
          >
            <img
              className="h-36 w-full object-cover saturate-[.75] transition duration-500 group-hover:scale-105"
              style={{ objectPosition: category.name === 'Депиляция мужская' ? '50% 35%' : 'center' }}
              src={getCategoryImage(category)}
              alt={`Услуги: ${category.name}`}
            />
            <span className="service-category-name">{category.name}</span>
            <span className="service-category-count">
              <span>{category.services.length} услуг</span>
              <ArrowUpRight size={18} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
