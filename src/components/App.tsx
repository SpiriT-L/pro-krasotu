import { FormEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import '../site.css';
import '../tailwind.css';
import servicesData from '../data/services.json';
import mastersData from '../data/masters.json';
import commentsData from '../data/comments.json';
import { allServices, getCategoryImage, getServiceDisplayName, salonImages } from '../data/site';
import { Comment, Master, Service } from '../types';
import { Header } from './Header';
import { AboutSection } from './AboutSection';
import { Footer } from './Footer';
import { HeroSection } from './HeroSection';
import { MastersSection } from './MastersSection';
import { PortfolioSection } from './PortfolioSection';
import { ServiceCategories } from './ServiceCategories';
import { StatementSection } from './StatementSection';

const salonDescription = `Добро пожаловать в наш эксклюзивный салон красоты, где каждый визит становится настоящим ритуалом ухода и расслабления. Мы понимаем, что для успешных людей время — ценность, поэтому предлагаем высокие стандарты обслуживания, которые соответствуют вашим требованиям и стилю жизни.

Наши профессиональные мастера — это не только высококвалифицированные специалисты, но и настоящие художники своего дела. Каждый из них прошёл тщательный отбор и регулярное обучение, чтобы предоставить Вам услуги, соответствующие самым строгим международным стандартам.

В нашем салоне Вы можете насладиться широким спектром услуг: от маникюра и педикюра до современных процедур по уходу за кожей и волосами. Мы используем только качественные и проверенные продукты, чтобы гарантировать Вам идеальный результат и долго сохраняющийся эффект.

Интерьер нашего салона продуман до мелочей, создавая атмосферу уюта и релаксации. Мы предлагаем индивидуальный подход к каждому клиенту, учитывая Ваши предпочтения и пожелания. Профессиональная команда всегда готова предложить советы и рекомендации, чтобы подчеркнуть Вашу уникальность.

Посетив наш салон, Вы не только получите услуги высшего качества, но и возможность отдохнуть и восстановить силы в комфортной и стильной обстановке. Заботьтесь о себе с нами — местом, где красота и профессионализм идут рука об руку.

Запишитесь на прием и погрузитесь в мир безупречного обслуживания и роскошного ухода за собой. Ваши ожидания станут нашей реальностью!`;

const portfolioKnownVisualDuplicates = new Set([
  '/assets/service-20808190.jpg',
  '/assets/service-17008116.jpg',
  '/assets/service-23370353.jpg',
  '/assets/salon-1.jpg',
]);
const portfolioImageSources = new Set<string>();
const portfolio = servicesData.categories
  .flatMap((category) => {
    const candidates = [
      ...category.services.map((service) => service.image).filter(Boolean),
      getCategoryImage(category),
    ] as string[];
    const uniqueImages = candidates.filter((src) => {
      if (portfolioKnownVisualDuplicates.has(src) || portfolioImageSources.has(src)) return false;
      portfolioImageSources.add(src);
      return true;
    });

    return uniqueImages
      .slice(0, 2)
      .map((src, index) => ({ src, alt: `${category.name} — работа ${index + 1}`, size: 'small' }));
  })
  .slice(0, 27);
const randomizedPortfolio = [...portfolio];
for (let index = randomizedPortfolio.length - 1; index > 0; index -= 1) {
  const randomIndex = Math.floor(Math.random() * (index + 1));
  [randomizedPortfolio[index], randomizedPortfolio[randomIndex]] = [
    randomizedPortfolio[randomIndex],
    randomizedPortfolio[index],
  ];
}

type BookingOption = { value: string; label: string; price?: string; currency?: string; duration?: number };

function BookingPicker({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: BookingOption[];
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState('');
  const pickerRef = useRef<HTMLDetailsElement>(null);
  const selectedLabel = options.find((option) => option.value === value)?.label;
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
  const selectOption = (event: MouseEvent<HTMLButtonElement>, nextValue: string) => {
    onChange(nextValue);
    event.currentTarget.closest('details')?.removeAttribute('open');
    setQuery('');
  };
  useEffect(() => {
    const handleOutsideClick = (event: globalThis.MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node))
        pickerRef.current.removeAttribute('open');
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <details className="booking-picker" ref={pickerRef}>
      <summary>
        <span>{label}</span>
        <strong>{selectedLabel || placeholder}</strong>
        <ArrowUpRight size={16} aria-hidden="true" />
      </summary>
      <div className="booking-picker-menu">
        <input
          aria-label={`Поиск: ${label}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Начните вводить для поиска…"
        />
        <div className="booking-picker-options" role="listbox" aria-label={label}>
          <button type="button" onClick={(event) => selectOption(event, '')}>
            {placeholder}
          </button>
          {filteredOptions.map((option) => (
            <button
              type="button"
              className={option.value === value ? 'is-selected' : ''}
              key={option.value}
              onClick={(event) => selectOption(event, option.value)}
            >
              <span>{option.label}</span>
              {(option.price || option.duration) && (
                <small>
                  {option.duration ? `${option.duration} мин.` : ''}
                  {option.duration && option.price ? ' · ' : ''}
                  {option.price ? `от ${option.price} ${option.currency || 'BYN'}` : ''}
                </small>
              )}
            </button>
          ))}
          {!filteredOptions.length && <p>Ничего не найдено</p>}
        </div>
      </div>
    </details>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
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
    fetch('/api/comments')
      .then((response) => (response.ok ? response.json() : (commentsData as Comment[])))
      .then((data) => setComments(data as Comment[]))
      .catch(() => setComments(commentsData as Comment[]));
  }, []);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        'main > section, .service-category-card, .master-card, .review-card, .gallery img, .booking form, .footer > div',
      ),
    );
    elements.forEach((element) => element.classList.add('scroll-reveal'));
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingName.trim() || bookingPhone.length !== 9 || (!bookingMaster && !bookingService)) return;
    setBookingStatus('submitting');

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bookingName.trim(),
          phone: `+375${bookingPhone}`,
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

  const visibleMasters = mastersData.masters.map(
    (_, index) => mastersData.masters[(index + masterOffset) % mastersData.masters.length],
  );
  const masterOptions = mastersData.masters.map((master) => ({ value: master.fullName, label: master.fullName }));
  const serviceOptions = allServices.map((service) => ({
    value: service.name,
    label: getServiceDisplayName(service.name),
    price: service.price,
    currency: service.currency,
    duration: service.durationMinutes,
  }));
  const formatPhone = (digits: string) => {
    if (!digits) return '+375 (';
    const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)];
    return `+375 (${parts[0]}${parts[0].length === 2 ? ')' : ''}${parts[1] ? ` ${parts[1]}` : ''}${parts[2] ? `-${parts[2]}` : ''}${parts[3] ? `-${parts[3]}` : ''}`;
  };
  const openBooking = (target: string, type: 'master' | 'service') => {
    if (type === 'master') setBookingMaster(target);
    else setBookingService(target);
    setSent(false);
  };
  const reviewValid = Boolean(reviewName.trim() && reviewEmail.trim() && reviewText.trim() && reviewRating > 0);
  const submitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reviewValid) return;
    const commentId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `comment-${Date.now()}`;
    const nextComment: Comment = {
      id: commentId,
      name: reviewName.trim(),
      email: reviewEmail.trim(),
      text: reviewText.trim(),
      rating: reviewRating,
      createdAt: new Date().toISOString(),
    };
    fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextComment),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('comment-save-failed');
        const savedComment = (await response.json()) as Comment;
        setComments((current) => [savedComment, ...current]);
        setReviewOpen(false);
        setReviewName('');
        setReviewEmail('');
        setReviewText('');
        setReviewRating(0);
        setHoverRating(0);
      })
      .catch(() => window.alert('Не удалось сохранить отзыв. Запустите сайт командой npm run dev.'));
  };
  const renderStars = (value: number, interactive = false) => (
    <div className={interactive ? 'review-stars interactive' : 'review-stars'} aria-label={`Рейтинг ${value} из 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} звезд`}
          className={star <= (interactive ? hoverRating || reviewRating : value) ? 'star active' : 'star'}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && setReviewRating(star)}
        >
          ★
        </button>
      ))}
    </div>
  );

  return (
    <main>
      <Header
        light={headerLight}
        open={menuOpen}
        onToggle={() => setMenuOpen((value) => !value)}
        onNavigate={() => setMenuOpen(false)}
      />
      <HeroSection />
      <AboutSection
        images={salonImages}
        imageIndex={salonImageIndex}
        expanded={aboutExpanded}
        description={salonDescription}
        onImageSelect={setSalonImageIndex}
        onToggle={() => setAboutExpanded((value) => !value)}
      />
      <ServiceCategories categories={servicesData.categories} onSelect={setSelectedCategory} />
      <StatementSection />{' '}
      <MastersSection
        masters={visibleMasters}
        onSelect={setSelectedMaster}
        onPrevious={() =>
          setMasterOffset((value) => (value - 1 + mastersData.masters.length) % mastersData.masters.length)
        }
        onNext={() => setMasterOffset((value) => (value + 1) % mastersData.masters.length)}
      />
      <PortfolioSection items={randomizedPortfolio} />
      <section className="reviews section bg-[#eae4db]" id="reviews">
        <div className="section-top">
          <p className="reviews-heading">
            Ваши впечатления
            <br />
            <em>важны для нас.</em>
          </p>
        </div>
        {comments.length > 0 ? (
          <div className="review-carousel">
            <div className="review-track">
              {comments.slice(0, 10).map((comment) => (
                <article
                  className="review-card"
                  key={comment.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedComment(comment)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedComment(comment);
                    }
                  }}
                >
                  <div className="review-card-top">
                    <div className="review-author">
                      {comment.avatar && (
                        <span className="review-avatar" style={{ backgroundColor: comment.avatar.color }}>
                          {comment.avatar.initial}
                        </span>
                      )}
                      <span>{comment.name}</span>
                    </div>
                    {renderStars(comment.rating)}
                  </div>
                  <p>{comment.text}</p>
                  <time>{new Date(comment.createdAt).toLocaleDateString('ru-RU')}</time>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="reviews-empty">
            <span>✦</span>
            <p>Станьте первым, кто поделится впечатлением о визите.</p>
          </div>
        )}
        <button
          className="button button-dark review-open inline-flex items-center justify-center gap-4"
          onClick={() => setReviewOpen(true)}
        >
          Оставить впечатление <ArrowUpRight size={17} />
        </button>
      </section>
      <section className="booking section bg-[#eae4db]" id="booking">
        <div className="booking-copy">
          <h2>
            Ваше время <em>начинается здесь.</em>
          </h2>
          <p>Оставьте контакты — администратор свяжется с вами и подберёт удобное время.</p>
        </div>
        {sent ? (
          <div className="success-message" role="status" aria-live="polite">
            <span>Спасибо!</span>
            <p>Заявка принята. Мы свяжемся с вами в ближайшее время.</p>
          </div>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <label>
              Имя
              <input
                required
                name="name"
                value={bookingName}
                onChange={(event) => setBookingName(event.target.value)}
                placeholder="Как к вам обращаться?"
              />
            </label>
            <label>
              Телефон
              <input
                required
                name="phone"
                type="tel"
                value={formatPhone(bookingPhone)}
                onChange={(event) =>
                  setBookingPhone(event.target.value.replace(/\D/g, '').replace(/^375/, '').slice(0, 9))
                }
                inputMode="numeric"
                pattern="\+375 \(\d{2}\) \d{3}-\d{2}-\d{2}"
                placeholder="+375 (__) ___-__-__"
                aria-describedby="booking-phone-hint"
              />
              <small id="booking-phone-hint" className="booking-field-hint">
                Введите 9 цифр номера после +375
              </small>
            </label>
            <BookingPicker
              label="Мастер"
              value={bookingMaster}
              placeholder="Выберите мастера"
              options={masterOptions}
              onChange={setBookingMaster}
            />
            <BookingPicker
              label="Услуга"
              value={bookingService}
              placeholder="Выберите услугу"
              options={serviceOptions}
              onChange={setBookingService}
            />
            {bookingStatus === 'error' && (
              <p className="form-error" role="alert">
                Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.
              </p>
            )}
            <button
              className="button button-dark inline-flex items-center justify-center gap-4"
              type="submit"
              disabled={
                bookingStatus === 'submitting' ||
                !bookingName.trim() ||
                bookingPhone.length !== 9 ||
                (!bookingMaster && !bookingService)
              }
            >
              {bookingStatus === 'submitting' ? 'Отправляем…' : 'Отправить заявку'} <ArrowUpRight size={18} />
            </button>
          </form>
        )}
      </section>
      <Footer onMap={() => setMapOpen(true)} />
      {selectedService && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedService(null)}>
          <div
            className="modal service-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" aria-label="Закрыть" onClick={() => setSelectedService(null)}>
              <X size={22} />
            </button>
            <img
              className="service-modal-image"
              src={selectedService.image || '/assets/salon-2.jpg'}
              alt={`Фото услуги ${selectedService.name}`}
            />
            <p className="section-label">{selectedService.category}</p>
            <h2 id="service-modal-title">{getServiceDisplayName(selectedService.name)}</h2>
            <p className="modal-meta">
              {selectedService.durationMinutes} мин. · от {selectedService.price} {selectedService.currency}
            </p>
            <p>{selectedService.description}</p>
            <button
              className="button button-dark"
              onClick={() => {
                openBooking(selectedService.name, 'service');
                setSelectedService(null);
                document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Записаться на услугу <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      )}
      {selectedCategory && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedCategory(null)}>
          <div
            className="modal category-modal max-w-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" aria-label="Закрыть раздел" onClick={() => setSelectedCategory(null)}>
              <X size={22} />
            </button>
            <p className="section-label">[ услуги раздела ]</p>
            <h2 id="category-modal-title">{selectedCategory.name}</h2>
            <div className="category-service-list">
              {selectedCategory.services.map((service) => (
                <div className="category-service-row" key={service.id}>
                  <div className="category-service-info">
                    <span>{getServiceDisplayName(service.name)}</span>
                  </div>
                  <div className="category-service-footer">
                    <small>
                      {service.durationMinutes} мин. · от {service.price} {service.currency}
                    </small>
                    <button
                      className="category-service-book"
                      onClick={() => {
                        setSelectedService({ ...service, category: selectedCategory.name });
                        setSelectedCategory(null);
                      }}
                    >
                      Записаться <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {selectedMaster && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedMaster(null)}>
          <div
            className="modal master-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="master-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" aria-label="Закрыть" onClick={() => setSelectedMaster(null)}>
              <X size={22} />
            </button>
            <img src={selectedMaster.photo} alt={selectedMaster.fullName} />
            <p className="section-label">{selectedMaster.specialization}</p>
            <h2 id="master-modal-title">{selectedMaster.fullName}</h2>
            <p>{selectedMaster.about}</p>
            <div className="modal-services">
              {selectedMaster.services.slice(0, 12).map((service) => (
                <button
                  key={service.name}
                  onClick={() => {
                    openBooking(service.name, 'service');
                    setBookingMaster(selectedMaster.fullName);
                    setSelectedMaster(null);
                    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {getServiceDisplayName(service.name)}
                  <small>{service.price}</small>
                </button>
              ))}
            </div>
            <button
              className="button button-dark"
              onClick={() => {
                openBooking(selectedMaster.fullName, 'master');
                setSelectedMaster(null);
                document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Записаться к мастеру <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      )}
      {reviewOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setReviewOpen(false)}>
          <div
            className="modal review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" aria-label="Закрыть" onClick={() => setReviewOpen(false)}>
              <X size={22} />
            </button>
            <p className="section-label">[ впечатление ]</p>
            <h2 id="review-modal-title">
              Поделитесь
              <br />
              <em>своими ощущениями.</em>
            </h2>
            <form onSubmit={submitReview}>
              <label>Рейтинг{renderStars(reviewRating, true)}</label>
              <label>
                Имя
                <input
                  required
                  value={reviewName}
                  onChange={(event) => setReviewName(event.target.value)}
                  placeholder="Ваше имя"
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={reviewEmail}
                  onChange={(event) => setReviewEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Отзыв
                <textarea
                  required
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="Расскажите о визите"
                  rows={4}
                />
              </label>
              <button className="button button-dark" type="submit" disabled={!reviewValid}>
                Оставить впечатление <ArrowUpRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
      {selectedComment && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedComment(null)}>
          <div
            className="modal comment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="comment-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" aria-label="Закрыть отзыв" onClick={() => setSelectedComment(null)}>
              <X size={22} />
            </button>
            <div className="comment-modal-author">
              {selectedComment.avatar && (
                <span className="review-avatar" style={{ backgroundColor: selectedComment.avatar.color }}>
                  {selectedComment.avatar.initial}
                </span>
              )}
              <div>
                <p className="section-label">[ отзыв клиента ]</p>
                <h2 id="comment-modal-title">{selectedComment.name}</h2>
              </div>
            </div>
            {renderStars(selectedComment.rating)}
            <p className="comment-modal-text">{selectedComment.text}</p>
            <time>{new Date(selectedComment.createdAt).toLocaleDateString('ru-RU')}</time>
          </div>
        </div>
      )}
      {mapOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setMapOpen(false)}>
          <div
            className="modal map-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="map-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="modal-close" aria-label="Закрыть карту" onClick={() => setMapOpen(false)}>
              <X size={22} />
            </button>
            <p className="section-label">[ маршрут ]</p>
            <h2 id="map-modal-title">Мы ждём вас</h2>
            <p>Минск, ул. Ежи Гедройца, 2</p>
            <iframe
              title="Карта расположения салона ПРО красоту"
              src="https://yandex.ru/map-widget/v1/?text=%D0%9C%D0%B8%D0%BD%D1%81%D0%BA%2C%20%D1%83%D0%BB%D0%B8%D1%86%D0%B0%20%D0%95%D0%B6%D0%B8%20%D0%93%D0%B5%D0%B4%D1%80%D0%BE%D0%B9%D1%86%D0%B0%2C%202&z=16"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
