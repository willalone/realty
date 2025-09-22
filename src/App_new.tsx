import React, { useMemo, useState } from 'react';

type ModalId = 'consult' | 'callback' | 'booking' | 'promo1' | 'promo2' | 'promo3' | 'singlepay' | 'family' | 'state';

function useModal() {
  const [open, setOpen] = useState<ModalId | null>(null);
  const openModal = (id: ModalId) => setOpen(id);
  const close = () => setOpen(null);
  return { open, openModal, close };
}

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div className="toast" role="status" aria-live="polite">{message}</div>;
}

function CheckboxConsent() {
  return (
    <label className="checkbox">
      <input type="checkbox" name="consent" required />
      <span>Согласен с <a href="/policy.html" target="_blank" rel="noreferrer noopener">политикой конфиденциальности</a></span>
    </label>
  );
}

function formatRuPhone(input: string): string {
  const digits = input.replace(/\D/g, '').replace(/^8/, '7');
  let out = '+7(';
  if (!digits.startsWith('7')) out = '+7(';
  const d = digits.startsWith('7') ? digits.slice(1) : digits;
  if (d.length > 0) out += d.slice(0, 3);
  if (d.length >= 3) out += ')';
  if (d.length > 3) out += '-' + d.slice(3, 6);
  if (d.length > 6) out += '-' + d.slice(6, 8);
  if (d.length > 8) out += '-' + d.slice(8, 10);
  return out;
}

const PHONE_RE = /^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;

function Form({ onSubmit, includeConsent = true, submitText }: { onSubmit: (data?: Record<string, unknown>) => void; includeConsent?: boolean; submitText: string; }) {
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    for (const [k, v] of formData.entries()) data[k] = v;

    const newErrors: Record<string, string> = {};
    if (!data.name || String(data.name).trim().length < 2) newErrors.name = 'Введите имя';
    if (!data.phone || !PHONE_RE.test(String(data.phone))) newErrors.phone = 'Введите корректный номер телефона';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setBusy(false); return; }

    try {
      const res = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const ok = res.ok;
      setSuccess(ok);
      if (ok) onSubmit(data);
    } catch { setSuccess(false); }
    setBusy(false);
  };

  if (success) return <div className="success-message">Спасибо! Мы свяжемся с вами в ближайшее время.</div>;
  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <input type="text" name="name" placeholder="Ваше имя" required aria-invalid={!!errors.name} />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <input type="tel" name="phone" placeholder="+7(___)___-__-__" required aria-invalid={!!errors.phone} onChange={(e) => { e.target.value = formatRuPhone(e.target.value); }} />
        {errors.phone && <span className="error">{errors.phone}</span>}
      </div>
      {includeConsent && <CheckboxConsent />}
      <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Отправляем...' : submitText}</button>
    </form>
  );
}

function Header({ onOpen }: { onOpen: (id: ModalId) => void; }) {
  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">
          <a href="/" className="logo">
            <span className="logo-mark">V</span>
            <span className="logo-text">Виктория</span>
          </a>
          <nav className="nav">
            <a href="#projects">Проекты</a>
            <a href="#mortgage">Ипотека</a>
            <a href="#consult" onClick={(e) => { e.preventDefault(); onOpen('consult'); }}>Консультация</a>
            <a href="tel:+79884707893" className="phone">+7(988)-470-78-93</a>
          </nav>
        </div>
      </div>
    </header>
  );
}

function Hero({ onOpen }: { onOpen: (id: ModalId) => void; }) {
  const [toast, setToast] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2400); };

  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-content">
          <h1>Риелтор Виктория – ваш надёжный партнёр на рынке недвижимости</h1>
          <p>От детских садов и школ до фитнеса и прогулочных аллей: жилые кварталы с развитой инфраструктурой</p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => { const next = !bookingOpen; setBookingOpen(next); if (next) { setTimeout(() => document.getElementById('bookingPanel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0); } }}>Смотреть квартиры</button>
            <button className="btn btn-secondary" onClick={() => onOpen('consult')}>Получить консультацию</button>
          </div>
          {bookingOpen && (
            <div id="bookingPanel" className="card" style={{ marginTop: 12 }}>
              <h3>Запись на просмотр</h3>
              <BookingForm onDone={(ok) => showToast(ok ? 'Заявка на просмотр отправлена' : 'Ошибка отправки')} />
            </div>
          )}
          <Toast message={toast} />
        </div>
      </div>
    </section>
  );
}

function Promos({ onOpen }: { onOpen: (id: ModalId) => void; }) {
  return (
    <section className="promos">
      <div className="container">
        <div className="cards grid-3">
          <article className="card">
            <div className="card-badge">до 30 сентября 2025</div>
            <h3>Ремонт в подарок</h3>
            <p>Готовый ремонт в выбранных квартирах при покупке до конца акции.</p>
            <button className="btn btn-link" onClick={() => onOpen('promo1')}>Подробнее</button>
          </article>
          <article className="card">
            <div className="card-badge">Старт продаж</div>
            <h3>Старт продаж в ЖК Дом 101</h3>
            <p>Началось. Специальные условия при раннем бронировании.</p>
            <button className="btn btn-link" onClick={() => onOpen('promo2')}>Подробнее</button>
          </article>
          <article className="card">
            <div className="card-badge">‑12%</div>
            <h3>Снижение ставки по ипотеке</h3>
            <p>Семейная ипотека и программы господдержки с выгодой.</p>
            <button className="btn btn-link" onClick={() => onOpen('promo3')}>Подробнее</button>
          </article>
        </div>
      </div>
    </section>
  );
}

function BookingForm({ onDone }: { onDone: (success: boolean) => void; }) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const monthView = useMemo(() => {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const cells = [];
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const isCurrentMonth = current.getMonth() === today.getMonth();
      const isPast = current < today;
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;
      const isOccupied = Math.random() < 0.3;
      
      cells.push({
        date: dateStr,
        day: current.getDate(),
        isCurrentMonth,
        isPast,
        isWeekend,
        isOccupied
      });
      current.setDate(current.getDate() + 1);
    }
    return { cells, monthName: today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) };
  }, []);

  const times = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    for (const [k, v] of formData.entries()) data[k] = v;

    const newErrors: Record<string, string> = {};
    if (!data.name || String(data.name).trim().length < 2) newErrors.name = 'Введите имя';
    if (!data.phone || !PHONE_RE.test(String(data.phone))) newErrors.phone = 'Введите корректный номер телефона';
    if (!selectedDate) newErrors.date = 'Выберите дату';
    if (!selectedTime) newErrors.time = 'Выберите время';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setBusy(false); return; }

    try {
      const res = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, date: selectedDate, time: selectedTime }) });
      onDone(res.ok);
      if (res.ok) { setSelectedDate(''); setSelectedTime(''); }
    } catch { onDone(false); }
    setBusy(false);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 8 }}>Выберите дату:</h4>
        <div className="calendar">
          <div className="calendar-header">
            <h5>{monthView.monthName}</h5>
          </div>
          <div className="calendar-weekdays">
            {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(w => (<div key={w} style={{ textAlign: 'center' }}>{w}</div>))}
          </div>
          <div className="calendar-grid">
            {monthView.cells.map((c, idx) => (
              <div key={idx} className={`calendar-cell ${!c.isCurrentMonth ? 'other-month' : ''} ${c.isPast ? 'past' : ''} ${c.isWeekend ? 'weekend' : ''} ${c.isOccupied ? 'occupied' : ''} ${selectedDate === c.date ? 'selected' : ''}`} onClick={() => { if (c.isCurrentMonth && !c.isPast && !c.isOccupied) setSelectedDate(c.date); }}>
                {c.day}
              </div>
            ))}
          </div>
        </div>
        {errors.date && <span className="error">{errors.date}</span>}
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 8 }}>Выберите время:</h4>
        <div className="time-grid">
          {times.map(t => (
            <button key={t} type="button" className={`time-slot ${selectedTime === t ? 'selected' : ''}`} onClick={() => setSelectedTime(t)} disabled={selectedDate && Math.random() < 0.4}>
              {t}
            </button>
          ))}
        </div>
        {errors.time && <span className="error">{errors.time}</span>}
      </div>

      <div className="form-group">
        <input type="text" name="name" placeholder="Ваше имя" required aria-invalid={!!errors.name} />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <input type="tel" name="phone" placeholder="+7(___)___-__-__" required aria-invalid={!!errors.phone} onChange={(e) => { e.target.value = formatRuPhone(e.target.value); }} />
        {errors.phone && <span className="error">{errors.phone}</span>}
      </div>
      <CheckboxConsent />
      <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Отправляем...' : 'Записаться на просмотр'}</button>
    </form>
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
              <span className="pill">Старт продаж</span>
              <span className="pill pill-sale">‑8%</span>
              <span className="pill pill-available">в продаже</span>
            </div>
            <h3>Народные кварталы</h3>
            <p className="project-location">г. Краснодар, улица Народная</p>
            <ul className="project-prices">
              <li><strong>1‑к</strong> — от 4,2 млн ₽</li>
              <li><strong>2‑к</strong> — от 5,8 млн ₽</li>
              <li><strong>3‑к</strong> — от 7,5 млн ₽</li>
            </ul>
            <a className="btn btn-secondary" href="#catalog">О проекте</a>
          </article>
          <article className="project-card">
            <img src="/img/istoriya-2.jpg.webp" alt="История 2" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
            <div className="project-meta">
              <span className="pill">Скоро в продаже</span>
              <span className="pill pill-sale">‑15%</span>
              <span className="pill pill-available">предзаказ</span>
            </div>
            <h3>История 2</h3>
            <p className="project-location">г. Краснодар, улица Историческая</p>
            <ul className="project-prices">
              <li><strong>Студии</strong> — от 2,8 млн ₽</li>
              <li><strong>1‑к</strong> — от 4,0 млн ₽</li>
              <li><strong>2‑к</strong> — от 5,5 млн ₽</li>
            </ul>
            <a className="btn btn-secondary" href="#catalog">О проекте</a>
          </article>
        </div>
      </div>
    </section>
  );
}

function Mortgage({ onOpen }: { onOpen: (id: ModalId) => void; }) {
  return (
    <section id="mortgage" className="section mortgage">
      <div className="container">
        <h2>Варианты покупки</h2>
        <div className="cards grid-3">
          <article className="card">
            <h3>Единоразовый платёж</h3>
            <p>Специальные цены при 100% оплате.</p>
            <button className="btn btn-link" onClick={() => onOpen('singlepay')}>Подробнее</button>
          </article>
          <article className="card">
            <h3>Семейная ипотека</h3>
            <p>Ставка от 6% годовых. Требования и условия банков‑партнёров.</p>
            <button className="btn btn-link" onClick={() => onOpen('family')}>Подробнее</button>
          </article>
          <article className="card">
            <h3>Господдержка</h3>
            <p>Льготные программы, субсидирование ставки и специальные предложения.</p>
            <button className="btn btn-link" onClick={() => onOpen('state')}>Подробнее</button>
          </article>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const [toast, setToast] = useState('');
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2400); };
  return (
    <section id="cta" className="section cta">
      <div className="container">
        <div className="cta-box">
          <h2>Отправим планировки по вашим запросам</h2>
          <p>+ специальное предложение</p>
          <form className="cta-form" noValidate onSubmit={async (e) => { e.preventDefault(); const form = e.currentTarget as HTMLFormElement; const entries = Object.fromEntries(new FormData(form).entries()); const phoneOk = PHONE_RE.test(String(entries.phone || '')); const nameOk = String(entries.name || '').trim().length >= 2; const consentOk = entries.consent !== undefined; if (!phoneOk || !nameOk || !consentOk) return; try { const res = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: entries.name, phone: entries.phone, source: 'cta' }) }); if (!res.ok) throw new Error('fail'); form.reset(); show('Заявка отправлена'); } catch { show('Ошибка отправки'); } }}>
            <div className="form-row">
              <input type="text" name="name" placeholder="Ваше имя" required />
              <input type="tel" name="phone" placeholder="+7(___)___-__-__" required onChange={(e) => { e.target.value = formatRuPhone(e.target.value); }} />
              <button type="submit" className="btn btn-primary">Получить предложение</button>
            </div>
            <label className="checkbox">
              <input type="checkbox" name="consent" required />
              <span>Согласен с <a href="/policy.html" target="_blank" rel="noreferrer noopener">политикой конфиденциальности</a></span>
            </label>
            <p className="form-success" role="status" aria-live="polite" style={{ display: 'none' }}>Сообщение об успешной отправке!</p>
          </form>
          <Toast message={toast} />
        </div>
      </div>
    </section>
  );
}

function Footer({ onOpen }: { onOpen: (id: ModalId) => void; }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="logo">
              <span className="logo-mark">V</span>
              <span className="logo-text">Виктория</span>
            </div>
            <p>Ваш надёжный партнёр на рынке недвижимости</p>
          </div>
          <div className="footer-section">
            <h4>Контакты</h4>
            <p>Телефон: <a href="tel:+79884707893">+7(988)-470-78-93</a></p>
            <p>Email: <a href="mailto:info@victory-realty.ru">info@victory-realty.ru</a></p>
          </div>
          <div className="footer-section">
            <h4>Навигация</h4>
            <nav>
              <a href="#projects">Проекты</a>
              <a href="#mortgage">Ипотека</a>
              <a href="/policy.html">Политика конфиденциальности</a>
            </nav>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Виктория. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode; }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Закрыть">×</button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { open, openModal, close } = useModal();
  const modalTitle = open === 'consult' ? 'Получить консультацию' : open === 'callback' ? 'Заказать звонок' : 'Модальное окно';

  return (
    <div className="app">
      <a className="skip-link" href="#main">Перейти к основному содержимому</a>
      <Header onOpen={openModal} />
      <main id="main">
        <Hero onOpen={openModal} />
        <Promos onOpen={openModal} />
        <Projects />
        <Mortgage onOpen={openModal} />
        <CTA />
      </main>
      <Footer onOpen={openModal} />

      <Modal open={open === 'consult'} title={modalTitle} onClose={close}>
        <Form submitText="Отправить" onSubmit={async (data) => {
          try {
            const res = await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...data, source: 'consult' })
            });
            if (res.ok) {
              close();
            }
          } catch (error) {
            console.error('Error:', error);
          }
        }} />
      </Modal>

      <Modal open={open === 'callback'} title={modalTitle} onClose={close}>
        <Form submitText="Заказать звонок" onSubmit={async (data) => {
          try {
            const res = await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...data, source: 'callback' })
            });
            if (res.ok) {
              close();
            }
          } catch (error) {
            console.error('Error:', error);
          }
        }} />
      </Modal>

      <Modal open={open === 'promo1'} title="Ремонт в подарок" onClose={close}>
        <div>
          <p>При покупке квартиры в выбранных домах до 30 сентября 2025 года вы получаете готовый ремонт в подарок!</p>
          <p><strong>Условия:</strong></p>
          <ul>
            <li>Действует на квартиры в домах 1-3</li>
            <li>Стандартный ремонт под ключ</li>
            <li>Дизайн-проект в подарок</li>
          </ul>
          <Form submitText="Получить предложение" onSubmit={() => close()} />
        </div>
      </Modal>

      <Modal open={open === 'promo2'} title="Старт продаж в ЖК Дом 101" onClose={close}>
        <div>
          <p>Начались продажи в новом жилом комплексе "Дом 101"!</p>
          <p><strong>Специальные условия:</strong></p>
          <ul>
            <li>Скидка 12% при раннем бронировании</li>
            <li>Рассрочка 0% на 24 месяца</li>
            <li>Бесплатная парковка</li>
          </ul>
          <Form submitText="Забронировать квартиру" onSubmit={() => close()} />
        </div>
      </Modal>

      <Modal open={open === 'promo3'} title="Снижение ставки по ипотеке" onClose={close}>
        <div>
          <p>Специальные условия по ипотечным программам!</p>
          <p><strong>Доступные программы:</strong></p>
          <ul>
            <li>Семейная ипотека от 6% годовых</li>
            <li>Господдержка для молодых семей</li>
            <li>Военная ипотека</li>
          </ul>
          <Form submitText="Рассчитать ипотеку" onSubmit={() => close()} />
        </div>
      </Modal>

      <Modal open={open === 'singlepay'} title="Единоразовый платёж" onClose={close}>
        <div>
          <p>Специальные цены при 100% оплате недвижимости.</p>
          <p><strong>Преимущества:</strong></p>
          <ul>
            <li>Дополнительная скидка до 15%</li>
            <li>Быстрое оформление документов</li>
            <li>Приоритет в выборе квартир</li>
          </ul>
          <Form submitText="Получить расчёт" onSubmit={() => close()} />
        </div>
      </Modal>

      <Modal open={open === 'family'} title="Семейная ипотека" onClose={close}>
        <div>
          <p>Льготные условия для семей с детьми.</p>
          <p><strong>Условия программы:</strong></p>
          <ul>
            <li>Ставка от 6% годовых</li>
            <li>Первый взнос от 20%</li>
            <li>Срок до 30 лет</li>
          </ul>
          <Form submitText="Подать заявку" onSubmit={() => close()} />
        </div>
      </Modal>

      <Modal open={open === 'state'} title="Господдержка" onClose={close}>
        <div>
          <p>Программы государственной поддержки для приобретения жилья.</p>
          <p><strong>Доступные программы:</strong></p>
          <ul>
            <li>Субсидирование процентной ставки</li>
            <li>Помощь молодым семьям</li>
            <li>Социальная ипотека</li>
          </ul>
          <Form submitText="Узнать условия" onSubmit={() => close()} />
        </div>
      </Modal>
    </div>
  );
}
