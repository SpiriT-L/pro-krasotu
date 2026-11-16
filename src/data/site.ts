import servicesData from './services.json';

export const allServices = servicesData.categories.flatMap((category) =>
  category.services.map((service) => ({ ...service, category: category.name })),
);

export const getServiceDisplayName = (name: string) =>
  name
    .replace(/\s*\([^)]*(?:цена|руб|\bр\b|byn|от\s*\d|до\s*\d)[^)]*\)/gi, '')
    .replace(/\s+(?:цена\b|от\s*\d|до\s*\d)[\s\S]*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

export const categoryImageFallbacks: Record<string, string> = {
  'Депиляция мужская': '/assets/category-male-waxing.png',
  'Косметология (уходы и массаж лица)': '/assets/category-cosmetology.png',
  Маникюр: '/assets/category-manicure.png',
  'Окрашивание волос без материалов': '/assets/service-20816334.jpg',
  Педикюр: '/assets/category-pedicure.png',
  Пирсинг: '/assets/category-piercing.png',
  Ресницы: '/assets/service-13875928.jpg',
  'Консультация специалиста': '/assets/salon-1.jpg',
};

export const getCategoryImage = (category: (typeof servicesData.categories)[number]) =>
  category.services.find((service) => service.image)?.image ||
  categoryImageFallbacks[category.name] ||
  '/assets/salon-1.jpg';

export const salonImages = [
  '/assets/salon-1.jpg',
  '/assets/salon-2.jpg',
  '/assets/salon-3.jpg',
  '/assets/salon-4.jpg',
  '/assets/salon-5.jpg',
];
