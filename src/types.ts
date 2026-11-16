import servicesData from './data/services.json';
import mastersData from './data/masters.json';

export type Category = (typeof servicesData.categories)[number];
export type Service = Category['services'][number] & { category: string };
export type Master = (typeof mastersData.masters)[number];
export type Comment = {
  id: string;
  source?: string;
  sourceUrl?: string;
  name: string;
  email?: string;
  text: string;
  rating: number;
  createdAt: string;
  avatar?: { initial: string; color: string };
};
