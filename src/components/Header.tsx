import { Menu, X } from 'lucide-react';

type HeaderProps = { light: boolean; open: boolean; onToggle: () => void; onNavigate: () => void };

export function Header({ light, open, onToggle, onNavigate }: HeaderProps) {
  return (
    <header className={`${light ? 'header header-light' : 'header'} flex items-center gap-10 px-[5vw] text-white`}>
      <a
        className="brand inline-block whitespace-nowrap text-xl no-underline"
        href="#top"
        aria-label="ПРО красоту — на главную"
      >
        <span>ПРО</span> красоту
      </a>
      <nav className={open ? 'nav nav-open' : 'nav'} aria-label="Основная навигация">
        {['Услуги', 'О нас', 'Портфолио', 'Мастера', 'Контакты'].map((label) => (
          <a
            key={label}
            href={`#${label === 'О нас' ? 'about' : label === 'Мастера' ? 'masters' : label === 'Контакты' ? 'contacts' : label === 'Портфолио' ? 'portfolio' : 'services'}`}
            onClick={onNavigate}
          >
            {label}
          </a>
        ))}
      </nav>
      <div className="header-phones">
        <a className="header-phone" href="tel:+375292795108">
          +375 (29) 279-51-08
        </a>
        <a className="header-phone" href="tel:+375296495108">
          +375 (29) 649-51-08
        </a>
      </div>
      <button
        className="menu-toggle ml-auto border-0 bg-transparent"
        aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        onClick={onToggle}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
  );
}
