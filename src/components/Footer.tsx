import { ArrowUpRight, Camera, Phone, Send } from 'lucide-react';

export function Footer({ onMap }: { onMap: () => void }) {
  return (
    <footer className="footer" id="contacts">
      <div>
        <a className="brand" href="#top">
          <span>ПРО</span> красоту
        </a>
        <p>
          Салон, в который
          <br />
          хочется возвращаться.
        </p>
      </div>
      <div>
        <p className="footer-label">Адрес</p>
        <p>Минск, ул. Ежи Гедройца, 2</p>
        <button className="text-link map-link" onClick={onMap}>
          Построить маршрут <ArrowUpRight size={16} />
        </button>
      </div>
      <div>
        <p className="footer-label">Мы в сети</p>
        <a className="social" href="#contacts">
          <Camera size={18} /> Instagram
        </a>
        <a className="social" href="#contacts">
          <Send size={18} /> Telegram
        </a>
      </div>
      <div>
        <p className="footer-label">Связаться</p>
        <a className="footer-phone" href="tel:+375292795108">
          <Phone size={16} /> +375 (29) 279-51-08
        </a>
        <a className="footer-phone" href="tel:+375296495108">
          <Phone size={16} /> +375 (29) 649-51-08
        </a>
      </div>
      <div className="copyright">© 2026 «ПРО красоту»</div>
    </footer>
  );
}
