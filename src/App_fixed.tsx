import { useState, useMemo } from 'react';
import './styles.css';

type ModalId = 'promo1' | 'promo2' | 'promo3' | 'state' | 'family' | 'consultation';

function App() {
  const [modal, setModal] = useState<ModalId | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const onOpen = (id: ModalId) => setModal(id);
  const onClose = () => setModal(null);
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const formatRuPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+7(${digits}`;
    if (digits.length <= 4) return `+7(${digits.slice(1)}`;
    if (digits.length <= 7) return `+7(${digits.slice(1, 4)})-${digits.slice(4)}`;
    if (digits.length <= 9) return `+7(${digits.slice(1, 4)})-${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+7(${digits.slice(1, 4)})-${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const PHONE_RE = /^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, formType: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (!PHONE_RE.test(data.phone as string)) {
      showToast('Пожалуйста, введите корректный номер телефона');
      return;
    }

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, formType }),
      });

      if (response.ok) {
        showToast('Спасибо! Мы свяжемся с вами в ближайшее время.');
        e.currentTarget.reset();
        onClose();
      } else {
        throw new Error('Ошибка отправки');
      }
    } catch (error) {
      showToast('Произошла ошибка. Попробуйте еще раз.');
    }
  };

  return (
    <>
      <Header onOpen={onOpen} />
      <Hero onOpen={onOpen} bookingOpen={bookingOpen} setBookingOpen={setBookingOpen} />
      <Promos onOpen={onOpen} />
      <Projects />
      <Mortgage onOpen={onOpen} />
      <CTA onOpen={onOpen} />
      <Footer />
      <Modal modal={modal} onClose={onClose} onSubmit={handleSubmit} formatRuPhone={formatRuPhone} />
      <Toast message={toast} />
    </>
  );
}

function Header({ onOpen }: { onOpen: (id: ModalId) => void }) {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <span className="logo-mark">V</span>
            <span className="logo-text">Виктория</span>
          </div>
          <nav className="nav">
            <a href="#projects">Проекты</a>
            <a href="#mortgage">Ипотека</a>
            <a href="#consultation" onClick={() => onOpen('consultation')}>Консультация</a>
          </nav>
          <div className="header-actions">
            <a href="tel:+79884707893" className="phone">+7(988)-470-78-93</a>
            <button className="btn btn-primary" onClick={() => onOpen('consultation')}>Обратный звонок</button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero({ onOpen, bookingOpen, setBookingOpen }: { onOpen: (id: ModalId) => void; bookingOpen: boolean; setBookingOpen: (open: boolean) => void }) {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking-section');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>Виктория – надежный риелтор с многолетним опытом</h1>
          <p className="hero-subtitle">От квартир до домов: недвижимость с гарантией качества и выгодными условиями</p>
          <div className="hero-actions">
            <button 
              className="btn btn-primary btn-large" 
              onClick={() => {
                setBookingOpen(!bookingOpen);
                if (!bookingOpen) {
                  setTimeout(scrollToBooking, 100);
                }
              }}
            >
              Смотреть квартиры
            </button>
          </div>
        </div>
        {bookingOpen && (
          <div id="booking-section" className="booking-section">
            <BookingForm onOpen={onOpen} />
          </div>
        )}
      </div>
    </section>
  );
}

function BookingForm({ onOpen }: { onOpen: (id: ModalId) => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [displayMonth, setDisplayMonth] = useState(currentMonth);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isDateDisabled = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6 || date < today;
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (!selectedDate || !selectedTime) {
      alert('Пожалуйста, выберите дату и время');
      return;
    }

    if (!PHONE_RE.test(data.phone as string)) {
      alert('Пожалуйста, введите корректный номер телефона');
      return;
    }

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...data, 
          formType: 'booking',
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime
        }),
      });

      if (response.ok) {
        alert('Запись на просмотр успешно оформлена! Мы свяжемся с вами для подтверждения.');
        e.currentTarget.reset();
        setSelectedDate(null);
        setSelectedTime(null);
      } else {
        throw new Error('Ошибка отправки');
      }
    } catch (error) {
      alert('Произошла ошибка. Попробуйте еще раз.');
    }
  };

  const formatRuPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+7(${digits}`;
    if (digits.length <= 4) return `+7(${digits.slice(1)}`;
    if (digits.length <= 7) return `+7(${digits.slice(1, 4)})-${digits.slice(4)}`;
    if (digits.length <= 9) return `+7(${digits.slice(1, 4)})-${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+7(${digits.slice(1, 4)})-${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const PHONE_RE = /^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const days = getDaysInMonth(displayMonth);

  return (
    <div className="booking-form">
      <div className="booking-header">
        <h3>Запись на просмотр</h3>
        <p>Выберите удобную дату и время для просмотра квартир</p>
      </div>
      
      <form onSubmit={handleSubmit} className="booking-content">
        <div className="booking-grid">
          <div className="calendar-section">
            <div className="calendar-header">
              <button 
                type="button" 
                onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1))}
              >
                ‹
              </button>
              <h4>{monthNames[displayMonth.getMonth()]} {displayMonth.getFullYear()}</h4>
              <button 
                type="button" 
                onClick={() => setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1))}
              >
                ›
              </button>
            </div>
            
            <div className="calendar-weekdays">
              {weekDays.map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>
            
            <div className="calendar-grid">
              {days.map((date, index) => (
                <button
                  key={index}
                  type="button"
                  className={`calendar-cell ${date && selectedDate?.toDateString() === date.toDateString() ? 'selected' : ''} ${date && isDateDisabled(date) ? 'disabled' : ''}`}
                  onClick={() => date && !isDateDisabled(date) && setSelectedDate(date)}
                  disabled={!date || isDateDisabled(date)}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>
          </div>
          
          <div className="time-section">
            <h4>Выберите время</h4>
            <div className="time-grid">
              {timeSlots.map(time => (
                <button
                  key={time}
                  type="button"
                  className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="booking-form-fields">
          <input
            type="text"
            name="name"
            placeholder="Ваше имя"
            required
            className="form-input"
          />
          <input
            type="tel"
            name="phone"
            placeholder="+7(___)___-__-__"
            required
            className="form-input"
            onChange={(e) => {
              e.target.value = formatRuPhone(e.target.value);
            }}
          />
          <button type="submit" className="btn btn-primary btn-large">
            Записаться на просмотр
          </button>
        </div>
      </form>
    </div>
  );
}

function Promos({ onOpen }: { onOpen: (id: ModalId) => void }) {
  return (
    <section className="section promos">
      <div className="container">
        <div className="cards grid-3">
          <article className="card">
            <h3>Ремонт в подарок</h3>
            <p>Получите ремонт в подарок при покупке квартиры от НВМ.</p>
            <button className="btn btn-link" onClick={() => onOpen('promo1')}>Подробнее</button>
          </article>
          <article className="card">
            <h3>Старт продаж</h3>
            <p>Новые проекты с выгодными условиями и специальными предложениями.</p>
            <button className="btn btn-link" onClick={() => onOpen('promo2')}>Подробнее</button>
          </article>
          <article className="card">
            <h3>Семейная ипотека</h3>
            <p>Семейная ипотека и программы господдержки с выгодой.</p>
            <button className="btn btn-link" onClick={() => onOpen('promo3')}>Подробнее</button>
          </article>
        </div>
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section id="projects" className="section projects">
      <div className="container">
        <div className="section-head">
          <h2>Выберите квартиру</h2>
        </div>
        <div className="cards grid-3">
          <article className="project-card">
            <img src="/img/dom-101.jpg.webp" alt="ДОМ 101" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
            <div className="project-meta">
              <span className="pill">Старт продаж</span>
              <span className="pill pill-sale">‑12%</span>
              <span className="pill pill-available">в продаже</span>
            </div>
            <h3>ДОМ 101</h3>
            <p className="project-location">г. Краснодар, улица Дорожная</p>
            <ul className="project-prices">
              <li><strong>Студии</strong> — от 3,0 млн ₽</li>
              <li><strong>1‑к</strong> — от 4,7 млн ₽</li>
              <li><strong>3‑к</strong> — от 7,9 млн ₽</li>
            </ul>
            <a className="btn btn-secondary" href="#catalog">О проекте</a>
          </article>
          <article className="project-card">
            <img src="/img/narodnye-kvartaly.jpg.webp" alt="Народные кварталы" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
            <div className="project-meta">
              <span className="pill">Ремонт в подарок</span>
              <span className="pill pill-sale">‑12%</span>
              <span className="pill pill-available">в продаже</span>
            </div>
            <h3>Народные кварталы</h3>
            <p className="project-location">г. Краснодар, пос. Знаменский</p>
            <ul className="project-prices">
              <li><strong>Студии</strong> — от 3,2 млн ₽</li>
              <li><strong>1‑к</strong> — от 4,9 млн ₽</li>
              <li><strong>2‑к</strong> — от 6,6 млн ₽</li>
            </ul>
            <a className="btn btn-secondary" href="#catalog">О проекте</a>
          </article>
          <article className="project-card">
            <img src="/img/istoriya-2.jpg.webp" alt="История 2" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
            <div className="project-meta">
              <span className="pill">Дома сданы</span>
              <span className="pill pill-sale">‑12%</span>
              <span className="pill pill-available">в продаже</span>
            </div>
            <h3>История 2</h3>
            <p className="project-location">г. Краснодар, пос. Южный, Казачья</p>
            <ul className="project-prices">
              <li><strong>2‑к</strong> — от 6,2 млн ₽</li>
            </ul>
            <a className="btn btn-secondary" href="#catalog">О проекте</a>
          </article>
        </div>
      </div>
    </section>
  );
}

function Mortgage({ onOpen }: { onOpen: (id: ModalId) => void }) {
  return (
    <section id="mortgage" className="section mortgage">
      <div className="container">
        <h2>Варианты покупки</h2>
        <div className="cards grid-3">
          <article className="card">
            <h3>Единоразовый платеж</h3>
            <p>Надежный способ покупки недвижимости с максимальной выгодой.</p>
            <button className="btn btn-link" onClick={() => onOpen('state')}>Подробнее</button>
          </article>
          <article className="card">
            <h3>Господдержка</h3>
            <p>Льготные программы, субсидирование ставки и специальные предложения.</p>
            <button className="btn btn-link" onClick={() => onOpen('state')}>Подробнее</button>
          </article>
          <article className="card">
            <h3>Семейная ипотека</h3>
            <p>Семейная ипотека и программы господдержки с выгодой.</p>
            <button className="btn btn-link" onClick={() => onOpen('family')}>Подробнее</button>
          </article>
        </div>
      </div>
    </section>
  );
}

function CTA({ onOpen }: { onOpen: (id: ModalId) => void }) {
  return (
    <section className="section cta">
      <div className="container">
        <div className="cta-content">
          <h2>Хотите узнать больше?</h2>
          <p>Наш менеджер ответит вам в ближайшее время</p>
          <button className="btn btn-primary btn-large" onClick={() => onOpen('consultation')}>
            Получить консультацию
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-mark">V</span>
              <span className="logo-text">Виктория</span>
            </div>
            <p>Надежный риелтор с многолетним опытом работы на рынке недвижимости</p>
          </div>
          <div className="footer-contacts">
            <h3>Контакты</h3>
            <p>Телефон: <a href="tel:+79884707893">+7(988)-470-78-93</a></p>
            <p>Email: <a href="mailto:info@victory-realty.ru">info@victory-realty.ru</a></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Виктория. Все права защищены.</p>
          <a href="/policy.html">Политика конфиденциальности</a>
        </div>
      </div>
    </footer>
  );
}

function Modal({ modal, onClose, onSubmit, formatRuPhone }: { modal: ModalId | null; onClose: () => void; onSubmit: (e: React.FormEvent<HTMLFormElement>, formType: string) => void }) {
  if (!modal) return null;

  const modalContent = useMemo(() => {
    switch (modal) {
      case 'promo1':
        return {
          title: 'Ремонт в подарок',
          content: 'Получите ремонт в подарок при покупке квартиры. Подробности уточняйте у менеджера.'
        };
      case 'promo2':
        return {
          title: 'Старт продаж',
          content: 'Новые проекты с выгодными условиями. Специальные предложения для первых покупателей.'
        };
      case 'promo3':
        return {
          title: 'Семейная ипотека',
          content: 'Льготные условия ипотеки для семей с детьми. Ставка от 6% годовых.'
        };
      case 'state':
        return {
          title: 'Господдержка',
          content: 'Программы государственной поддержки при покупке недвижимости.'
        };
      case 'family':
        return {
          title: 'Семейная ипотека',
          content: 'Ипотечные программы для семей с детьми.'
        };
      case 'consultation':
        return {
          title: 'Получить консультацию',
          content: 'Оставьте свои данные, и наш менеджер свяжется с вами.'
        };
      default:
        return { title: '', content: '' };
    }
  }, [modal]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>{modalContent.title}</h2>
        <p>{modalContent.content}</p>
        <form onSubmit={(e) => onSubmit(e, modal)}>
          <input
            type="text"
            name="name"
            placeholder="Ваше имя"
            required
            className="form-input"
          />
          <input
            type="tel"
            name="phone"
            placeholder="+7(___)___-__-__"
            required
            className="form-input"
            onChange={(e) => {
              e.target.value = formatRuPhone(e.target.value);
            }}
          />
          <button type="submit" className="btn btn-primary btn-large">
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
}

function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="toast">{message}</div>;
}

export default App;
