import { FormEvent, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Camera, Menu, Phone, Send, X } from 'lucide-react';
import './styles.css';
import './tailwind.css';
import './extra.css';
import './extra2.css';
import './extra3.css';
import './extra4.css';
import './extra5.css';
import './extra6.css';
import './extra7.css';
import './extra8.css';
import './extra9.css';
import './extra10.css';
import servicesData from './data/services.json';
import mastersData from './data/masters.json';
import commentsData from './data/comments.json';

const featuredServices = [
  { category: 'Волосы', title: 'Стрижка и укладка', description: 'Персональная форма, уход и укладка под ваш ритм.', price: 'от 75 BYN' },
  { category: 'Окрашивание', title: 'Цвет как искусство', description: 'От деликатного тонирования до сложных техник.', price: 'от 180 BYN' },
  { category: 'Лицо', title: 'Уход за лицом', description: 'Ритуалы восстановления и сияния для вашей кожи.', price: 'от 110 BYN' },
  { category: 'Тело', title: 'Массаж и SPA', description: 'Время, чтобы замедлиться и услышать себя.', price: 'от 95 BYN' },
];

type Service = (typeof servicesData.categories)[number]['services'][number] & { category: string };
type Master = (typeof mastersData.masters)[number];
type Comment = { id: string; source?: string; sourceUrl?: string; name: string; email?: string; text: string; rating: number; createdAt: string; avatar?: { initial: string; color: string } };
const allServices = servicesData.categories.flatMap((category) => category.services.map((service) => ({ ...service, category: category.name })));
const categoryImageFallbacks: Record<string, string> = {
  'Депиляция мужская': '/assets/category-male-waxing.png',
  'Косметология (уходы и массаж лица)': '/assets/category-cosmetology.png',
  Маникюр: '/assets/category-manicure.png',
  'Окрашивание волос без материалов': '/assets/dikidi/service-20816334.jpg',
  Педикюр: '/assets/category-pedicure.png',
  Пирсинг: '/assets/category-piercing.png',
  Ресницы: '/assets/dikidi/service-13875928.jpg',
  'Консультация специалиста': '/assets/salon-1.jpg',
};
const getCategoryImage = (category: (typeof servicesData.categories)[number]) => category.services.find((service) => service.image)?.image || categoryImageFallbacks[category.name] || '/assets/salon-1.jpg';
const salonDescription = `Добро пожаловать в наш эксклюзивный салон красоты, где каждый визит становится настоящим ритуалом ухода и расслабления. Мы понимаем, что для успешных людей время — ценность, поэтому предлагаем высокие стандарты обслуживания, которые соответствуют вашим требованиям и стилю жизни.

Наши профессиональные мастера — это не только высококвалифицированные специалисты, но и настоящие художники своего дела. Каждый из них прошёл тщательный отбор и регулярное обучение, чтобы предоставить Вам услуги, соответствующие самым строгим международным стандартам.

В нашем салоне Вы можете насладиться широким спектром услуг: от маникюра и педикюра до современных процедур по уходу за кожей и волосами. Мы используем только качественные и проверенные продукты, чтобы гарантировать Вам идеальный результат и долго сохраняющийся эффект.

Интерьер нашего салона продуман до мелочей, создавая атмосферу уюта и релаксации. Мы предлагаем индивидуальный подход к каждому клиенту, учитывая Ваши предпочтения и пожелания. Профессиональная команда всегда готова предложить советы и рекомендации, чтобы подчеркнуть Вашу уникальность.

Посетив наш салон, Вы не только получите услуги высшего качества, но и возможность отдохнуть и восстановить силы в комфортной и стильной обстановке. Заботьтесь о себе с нами — местом, где красота и профессионализм идут рука об руку.

Запишитесь на прием и погрузитесь в мир безупречного обслуживания и роскошного ухода за собой. Ваши ожидания станут нашей реальностью!`;

const portfolio = [
  { src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85', alt: 'Укладка волос', size: 'large' },
  { src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=85', alt: 'Макияж', size: 'small' },
  { src: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=700&q=85', alt: 'Уход за волосами', size: 'small' },
  { src: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=900&q=85', alt: 'Красивые волосы', size: 'large' },
  { src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=85', alt: 'Интерьер салона красоты', size: 'small' },
  { src: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=700&q=85', alt: 'Уход и укладка волос', size: 'small' },
];
const salonImages = ['/assets/salon-1.jpg', '/assets/salon-2.jpg', '/assets/salon-3.jpg', '/assets/salon-4.jpg', '/assets/salon-5.jpg'];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [activeCategory, setActiveCategory] = useState(servicesData.categories[0].name);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<(typeof servicesData.categories)[number] | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [bookingMaster, setBookingMaster] = useState('');
  const [bookingService, setBookingService] = useState('');
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [salonImageIndex, setSalonImageIndex] = useState(0);
  const [masterOffset, setMasterOffset] = useState(0);
  const [headerLight, setHeaderLight] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [mapOpen, setMapOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>(() => {
    return commentsData as Comment[];
  });

  useEffect(() => {
    const timer = window.setInterval(() => setSalonImageIndex((value) => (value + 1) % salonImages.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const headerProbeY = 86;
      const darkSections = Array.from(document.querySelectorAll<HTMLElement>('.hero, .statement, .footer'));
      const isDarkSection = darkSections.some((section) => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= headerProbeY && bounds.bottom >= headerProbeY;
      });
      setHeaderLight(!isDarkSection);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/comments').then((response) => response.ok ? response.json() : commentsData as Comment[]).then((data) => setComments(data as Comment[])).catch(() => setComments(commentsData as Comment[]));
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('main > section, .service-category-card, .master-card, .review-card, .gallery img, .booking form, .footer > div'));
    elements.forEach((element) => element.classList.add('scroll-reveal'));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px' });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingName.trim() || !bookingPhone.trim() || (!bookingMaster && !bookingService)) return;
    setBookingStatus('submitting');

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bookingName.trim(),
          phone: bookingPhone.trim(),
          master: bookingMaster,
          service: bookingService,
        }),
      });

      if (!response.ok) throw new Error('booking-request-failed');
      setSent(true);
      setBookingStatus('idle');
    } catch {
      setBookingStatus('error');
    }
  };

  const activeServices = allServices.filter((service) => service.category === activeCategory);
  const visibleMasters = mastersData.masters.map((_, index) => mastersData.masters[(index + masterOffset) % mastersData.masters.length]);
  const openBooking = (target: string, type: 'master' | 'service') => { if (type === 'master') setBookingMaster(target); else setBookingService(target); setSent(false); };
  const reviewValid = Boolean(reviewName.trim() && reviewEmail.trim() && reviewText.trim() && reviewRating > 0);
  const submitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reviewValid) return;
    const commentId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `comment-${Date.now()}`;
    const nextComment: Comment = { id: commentId, name: reviewName.trim(), email: reviewEmail.trim(), text: reviewText.trim(), rating: reviewRating, createdAt: new Date().toISOString() };
    fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nextComment) }).then(async (response) => { if (!response.ok) throw new Error('comment-save-failed'); const savedComment = await response.json() as Comment; setComments((current) => [savedComment, ...current]); setReviewOpen(false); setReviewName(''); setReviewEmail(''); setReviewText(''); setReviewRating(0); setHoverRating(0); }).catch(() => window.alert('Не удалось сохранить отзыв. Запустите сайт командой npm run dev.'));
  };
  const renderStars = (value: number, interactive = false) => <div className={interactive ? 'review-stars interactive' : 'review-stars'} aria-label={`Рейтинг ${value} из 5`}>{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" aria-label={`${star} звезд`} className={star <= (interactive ? (hoverRating || reviewRating) : value) ? 'star active' : 'star'} onMouseEnter={() => interactive && setHoverRating(star)} onMouseLeave={() => interactive && setHoverRating(0)} onClick={() => interactive && setReviewRating(star)}>★</button>)}</div>;

  return (
    <main>
      <header className={`${headerLight ? 'header header-light' : 'header'} flex items-center gap-10 px-[5vw] text-white`}>
        <a className="brand inline-block whitespace-nowrap text-xl no-underline" href="#top" aria-label="ПРО красоту — на главную"><span>ПРО</span> красоту</a>
        <nav className={menuOpen ? 'nav nav-open' : 'nav'} aria-label="Основная навигация">
          <a href="#services" onClick={() => setMenuOpen(false)}>Услуги</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>О нас</a>
          <a href="#portfolio" onClick={() => setMenuOpen(false)}>Портфолио</a>
          <a href="#masters" onClick={() => setMenuOpen(false)}>Мастера</a>
          <a href="#contacts" onClick={() => setMenuOpen(false)}>Контакты</a>
        </nav>
        <div className="header-phones"><a className="header-phone" href="tel:+375292795108">+375 (29) 279-51-08</a><a className="header-phone" href="tel:+375296495108">+375 (29) 649-51-08</a></div>
        <button className="menu-toggle ml-auto border-0 bg-transparent" aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <section className="hero flex min-h-[760px] flex-col justify-center px-[12vw] py-[19vh]" id="top">
        <div className="hero-copy">
          <p className="eyebrow mb-8 text-[11px] uppercase tracking-[.12em]">Салон красоты · Минск</p>
          <h1 className="m-0 mb-8 text-[clamp(64px,9vw,138px)] font-medium leading-[.88] tracking-[-.07em]">Красота —<br /><em>это про вас.</em></h1>
          <p className="hero-description mb-10 max-w-[300px] text-base leading-[1.6]">Пространство, где забота о себе становится красивой привычкой.</p>
          <a className="button button-light inline-flex items-center justify-center gap-4" href="#booking">Записаться <ArrowUpRight size={18} /></a>
        </div>
        <div className="hero-note"><span>Премиальный уход для всей семьи</span></div>
        <a className="scroll-cue" href="#about"><ArrowDown size={16} /> листайте ниже</a>
      </section>

      <section className="intro section" id="about">
        <h2 className="intro-heading">Место, где<br /><em>становится легче.</em></h2>
        <div className="salon-layout"><div className="salon-carousel"><img src={salonImages[salonImageIndex]} alt={`Интерьер салона ПРО красоту, фото ${salonImageIndex + 1}`} /><div className="salon-carousel-controls"><div className="salon-dots" aria-label="Выбор фотографии салона">{salonImages.map((image, index) => <button key={image} className={index === salonImageIndex ? 'salon-dot active' : 'salon-dot'} aria-label={`Показать фото ${index + 1}`} onClick={() => setSalonImageIndex(index)} />)}</div></div></div><div className="salon-copy"><div className={aboutExpanded ? 'salon-description expanded' : 'salon-description'}>{salonDescription.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><button className="text-link more-button" onClick={() => setAboutExpanded((value) => !value)}>{aboutExpanded ? 'Свернуть' : 'Ещё'} <ArrowUpRight size={17} /></button></div></div>
      </section>

      <section className="services section bg-[#ebe6df]" id="services">
        <div className="section-top"><p>Найдите свой способ <br /><em>почувствовать себя лучше.</em></p></div>
        <div className="service-category-grid grid grid-cols-2 gap-4 md:grid-cols-3">{servicesData.categories.map((category) => <button className="service-category-card group overflow-hidden rounded-3xl border border-[#d2c8bb] bg-[#f8f5f0] text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl" key={category.id} onClick={() => setSelectedCategory(category)}><img className="h-36 w-full object-cover saturate-[.75] transition duration-500 group-hover:scale-105" style={{ objectPosition: category.name === 'Депиляция мужская' ? '50% 35%' : 'center' }} src={getCategoryImage(category)} alt={`Услуги: ${category.name}`} /><span className="service-category-name">{category.name}</span><span className="service-category-count"><span>{category.services.length} услуг</span><ArrowUpRight size={18} /></span></button>)}</div>
      </section>

      <section className="statement"><div className="statement-mark">✦</div><p>Ухоженность —<br /><em>ваша новая роскошь.</em></p><span className="statement-caption">PRO KRASOTU · MINSK · 2026</span></section>

      <section className="masters section bg-[#f4f1ec]" id="masters"><div className="section-top"><p>Наши <em>мастера.</em></p></div><div className="masters-carousel overflow-hidden" onMouseEnter={(event) => event.currentTarget.classList.add('paused')} onMouseLeave={(event) => event.currentTarget.classList.remove('paused')}><div className="master-track flex w-max gap-4">{visibleMasters.map((master) => <button className="master-card shrink-0" key={master.id} onClick={() => setSelectedMaster(master)}><img className="block w-full object-cover" src={master.photo} alt={master.fullName} /><span className="master-role">{master.specialization}</span><h3>{master.fullName}</h3><ArrowUpRight size={18} /></button>)}</div><div className="carousel-controls"><button className="carousel-button" aria-label="Предыдущие мастера" onClick={() => setMasterOffset((value) => (value - 1 + mastersData.masters.length) % mastersData.masters.length)}><ArrowLeft size={18} /></button><span>Наведите, чтобы остановить</span><button className="carousel-button" aria-label="Следующие мастера" onClick={() => setMasterOffset((value) => (value + 1) % mastersData.masters.length)}><ArrowRight size={18} /></button></div></div></section>

      <section className="portfolio section bg-[#d8d0c5]" id="portfolio"><div className="section-top"><p>Вдохновение в каждой <br /><em>детали.</em></p></div><div className="gallery">{portfolio.map((item) => <img className={`${item.size} block h-full w-full object-cover`} key={item.src} src={item.src} alt={item.alt} loading="lazy" />)}</div></section>

      <section className="reviews section bg-[#eae4db]" id="reviews"><div className="section-top"><p className="reviews-heading">Ваши впечатления<br /><em>важны для нас.</em></p></div>{comments.length > 0 ? <div className="review-carousel"><div className="review-track">{comments.slice(0, 10).map((comment) => <article className="review-card" key={comment.id} role="button" tabIndex={0} onClick={() => setSelectedComment(comment)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedComment(comment); } }}><div className="review-card-top"><div className="review-author">{comment.avatar && <span className="review-avatar" style={{ backgroundColor: comment.avatar.color }}>{comment.avatar.initial}</span>}<span>{comment.name}</span></div>{renderStars(comment.rating)}</div><p>{comment.text}</p><time>{new Date(comment.createdAt).toLocaleDateString('ru-RU')}</time></article>)}</div></div> : <div className="reviews-empty"><span>✦</span><p>Станьте первым, кто поделится впечатлением о визите.</p></div>}<button className="button button-dark review-open inline-flex items-center justify-center gap-4" onClick={() => setReviewOpen(true)}>Оставить впечатление <ArrowUpRight size={17} /></button></section>

      <section className="booking section bg-[#eae4db]" id="booking"><div className="booking-copy"><h2>Ваше время <em>начинается здесь.</em></h2><p>Оставьте контакты — администратор свяжется с вами и подберёт удобное время.</p></div>{sent ? <div className="success-message" role="status" aria-live="polite"><span>Спасибо!</span><p>Заявка принята. Мы свяжемся с вами в ближайшее время.</p></div> : <form className="flex flex-col gap-6" onSubmit={handleSubmit}><label>Имя<input required name="name" value={bookingName} onChange={(event) => setBookingName(event.target.value)} placeholder="Как к вам обращаться?" /></label><label>Телефон<input required name="phone" type="tel" value={bookingPhone} onChange={(event) => setBookingPhone(event.target.value)} placeholder="+375 (__) ___-__-__" /></label><label>Мастер<select name="master" value={bookingMaster} onChange={(event) => setBookingMaster(event.target.value)}><option value="">Выберите мастера</option>{mastersData.masters.map((master) => <option key={master.id} value={master.fullName}>{master.fullName}</option>)}</select></label><label>Услуга<select name="service" value={bookingService} onChange={(event) => setBookingService(event.target.value)}><option value="">Выберите услугу</option>{allServices.map((service) => <option key={service.id} value={service.name}>{service.name}</option>)}</select></label>{bookingStatus === 'error' && <p className="form-error" role="alert">Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.</p>}<button className="button button-dark inline-flex items-center justify-center gap-4" type="submit" disabled={bookingStatus === 'submitting' || !bookingName.trim() || !bookingPhone.trim() || (!bookingMaster && !bookingService)}>{bookingStatus === 'submitting' ? 'Отправляем…' : 'Отправить заявку'} <ArrowUpRight size={18} /></button></form>}</section>

      <footer className="footer" id="contacts"><div><a className="brand" href="#top"><span>ПРО</span> красоту</a><p>Салон, в который<br />хочется возвращаться.</p></div><div><p className="footer-label">Адрес</p><p>Минск, ул. Ежи Гедройца, 2</p><button className="text-link map-link" onClick={() => setMapOpen(true)}>Построить маршрут <ArrowUpRight size={16} /></button></div><div><p className="footer-label">Мы в сети</p><a className="social" href="#contacts"><Camera size={18} /> Instagram</a><a className="social" href="#contacts"><Send size={18} /> Telegram</a></div><div><p className="footer-label">Связаться</p><a className="footer-phone" href="tel:+375292795108"><Phone size={16} /> +375 (29) 279-51-08</a><a className="footer-phone" href="tel:+375296495108"><Phone size={16} /> +375 (29) 649-51-08</a></div><div className="copyright">© 2026 «ПРО красоту»</div></footer>
      {selectedService && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedService(null)}><div className="modal service-modal" role="dialog" aria-modal="true" aria-labelledby="service-modal-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Закрыть" onClick={() => setSelectedService(null)}><X size={22} /></button><img className="service-modal-image" src={selectedService.image || '/assets/salon-2.jpg'} alt={`Фото услуги ${selectedService.name}`} /><p className="section-label">{selectedService.category}</p><h2 id="service-modal-title">{selectedService.name}</h2><p className="modal-meta">{selectedService.durationMinutes} мин. · от {selectedService.price} {selectedService.currency}</p><p>{selectedService.description}</p><button className="button button-dark" onClick={() => { openBooking(selectedService.name, 'service'); setSelectedService(null); document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }); }}>Записаться на услугу <ArrowUpRight size={18} /></button></div></div>}
      {selectedCategory && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedCategory(null)}><div className="modal category-modal max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="category-modal-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Закрыть раздел" onClick={() => setSelectedCategory(null)}><X size={22} /></button><p className="section-label">[ услуги раздела ]</p><h2 id="category-modal-title">{selectedCategory.name}</h2><div className="category-service-list">{selectedCategory.services.map((service) => <div className="category-service-row" key={service.id}><div className="category-service-info"><span>{service.name}</span></div><div className="category-service-footer"><small>{service.durationMinutes} мин. · от {service.price} {service.currency}</small><button className="category-service-book" onClick={() => { setSelectedService({ ...service, category: selectedCategory.name }); setSelectedCategory(null); }}>Записаться <ArrowUpRight size={14} /></button></div></div>)}</div></div></div>}
      {selectedMaster && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedMaster(null)}><div className="modal master-modal" role="dialog" aria-modal="true" aria-labelledby="master-modal-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Закрыть" onClick={() => setSelectedMaster(null)}><X size={22} /></button><img src={selectedMaster.photo} alt={selectedMaster.fullName} /><p className="section-label">{selectedMaster.specialization}</p><h2 id="master-modal-title">{selectedMaster.fullName}</h2><p>{selectedMaster.about}</p><div className="modal-services">{selectedMaster.services.slice(0, 12).map((service) => <button key={service.name} onClick={() => { openBooking(service.name, 'service'); setBookingMaster(selectedMaster.fullName); setSelectedMaster(null); document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }); }}>{service.name}<small>{service.price}</small></button>)}</div><button className="button button-dark" onClick={() => { openBooking(selectedMaster.fullName, 'master'); setSelectedMaster(null); document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' }); }}>Записаться к мастеру <ArrowUpRight size={18} /></button></div></div>}
      {reviewOpen && <div className="modal-backdrop" role="presentation" onClick={() => setReviewOpen(false)}><div className="modal review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Закрыть" onClick={() => setReviewOpen(false)}><X size={22} /></button><p className="section-label">[ впечатление ]</p><h2 id="review-modal-title">Поделитесь<br /><em>своими ощущениями.</em></h2><form onSubmit={submitReview}><label>Рейтинг{renderStars(reviewRating, true)}</label><label>Имя<input required value={reviewName} onChange={(event) => setReviewName(event.target.value)} placeholder="Ваше имя" /></label><label>Email<input required type="email" value={reviewEmail} onChange={(event) => setReviewEmail(event.target.value)} placeholder="you@example.com" /></label><label>Отзыв<textarea required value={reviewText} onChange={(event) => setReviewText(event.target.value)} placeholder="Расскажите о визите" rows={4} /></label><button className="button button-dark" type="submit" disabled={!reviewValid}>Оставить впечатление <ArrowUpRight size={18} /></button></form></div></div>}
      {selectedComment && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedComment(null)}><div className="modal comment-modal" role="dialog" aria-modal="true" aria-labelledby="comment-modal-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Закрыть отзыв" onClick={() => setSelectedComment(null)}><X size={22} /></button><div className="comment-modal-author">{selectedComment.avatar && <span className="review-avatar" style={{ backgroundColor: selectedComment.avatar.color }}>{selectedComment.avatar.initial}</span>}<div><p className="section-label">[ отзыв клиента ]</p><h2 id="comment-modal-title">{selectedComment.name}</h2></div></div>{renderStars(selectedComment.rating)}<p className="comment-modal-text">{selectedComment.text}</p><time>{new Date(selectedComment.createdAt).toLocaleDateString('ru-RU')}</time></div></div>}
      {mapOpen && <div className="modal-backdrop" role="presentation" onClick={() => setMapOpen(false)}><div className="modal map-modal" role="dialog" aria-modal="true" aria-labelledby="map-modal-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Закрыть карту" onClick={() => setMapOpen(false)}><X size={22} /></button><p className="section-label">[ маршрут ]</p><h2 id="map-modal-title">Мы ждём вас</h2><p>Минск, ул. Ежи Гедройца, 2</p><iframe title="Карта расположения салона ПРО красоту" src="https://yandex.ru/map-widget/v1/?text=%D0%9C%D0%B8%D0%BD%D1%81%D0%BA%2C%20%D1%83%D0%BB%D0%B8%D1%86%D0%B0%20%D0%95%D0%B6%D0%B8%20%D0%93%D0%B5%D0%B4%D1%80%D0%BE%D0%B9%D1%86%D0%B0%2C%202&z=16" loading="lazy" /></div></div>}
    </main>
  );
}

export default App;

createRoot(document.getElementById('root')!).render(<App />);
