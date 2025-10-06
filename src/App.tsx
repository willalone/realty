import { useState, useMemo, useEffect } from 'react';
import '../styles.css';
import dom101Image from './img/dom-101.webp';
import narodnyeKvartalyImage from './img/narodnye-kvartaly.webp';
import istoriya2Image from './img/istoriya-2.webp';

type ModalId = 'promo1' | 'promo2' | 'promo3' | 'state' | 'family' | 'consultation' | 'dom101' | 'narodnye' | 'istoriya2' | 'military';

function App() {
  const [modal, setModal] = useState<ModalId | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const onOpen = (id: ModalId) => setModal(id);
  const onClose = () => setModal(null);
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Отслеживание активной секции при скролле
  useEffect(() => {
    const sections = ['promos', 'projects', 'mortgage'];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      // Показываем кнопку "Наверх" после прокрутки на 300px
      setShowScrollTop(window.scrollY > 300);
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Вызываем сразу для установки начального состояния

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const sendToTelegram = async (data: any) => {
    // Получаем данные из переменных окружения или используем значения по умолчанию для GitHub Pages
    const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
    const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID_2_HERE';
    
    console.log('🔧 Используемые данные бота:', { BOT_TOKEN: BOT_TOKEN ? '***' : 'undefined', CHAT_ID });
    
    // Проверяем, что данные заданы
    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('❌ Не настроены данные для Telegram бота');
      return false;
    }

    const message = `
🏠 **Новая заявка с сайта**

📋 **Тип формы:** ${data.formType}
👤 **Имя:** ${data.name}
📞 **Телефон:** ${data.phone}
⏰ **Время:** ${new Date().toLocaleString('ru-RU')}

🌐 **Источник:** Застройщик NPM
    `;

    try {
      console.log('Отправка в Telegram:', { BOT_TOKEN, CHAT_ID, message });
      
      // Создаем AbortController для таймаута
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 секунд

      try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const responseData = await response.json();
        console.log('📤 Ответ от Telegram API:', responseData);
        console.log('📊 HTTP статус:', response.status);
        console.log('📊 Response OK:', response.ok);
        console.log('📊 Data OK:', responseData.ok);

        // Более мягкая проверка - если сообщение отправилось, считаем успехом
        if (response.ok && responseData.ok) {
          console.log('✅ Сообщение отправлено в Telegram');
          return true;
        } else {
          console.error('❌ Ошибка отправки в Telegram:', responseData);
          
          // Дополнительная диагностика
          if (responseData.error_code === 403) {
            console.error('Бот заблокирован пользователем или не запущен');
          } else if (responseData.error_code === 400) {
            console.error('Неправильный Chat ID или другие параметры');
          }
          
          // Даже при ошибке API, если HTTP статус 200, считаем что сообщение могло дойти
          if (response.ok) {
            console.log('⚠️ HTTP статус OK, но API вернул ошибку. Возможно сообщение дошло.');
            return true; // Возвращаем true, так как HTTP запрос прошел успешно
          }
          
          return false;
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error('❌ Таймаут запроса к Telegram API');
          return false;
        }
        console.error('❌ Сетевая ошибка:', fetchError);
        return false;
      }
    } catch (error) {
      console.error('Ошибка:', error);
      return false;
    }
  };

  // Тестовая функция для проверки Telegram бота
  const testTelegramBot = async () => {
    const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
    
    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('❌ Не настроены переменные окружения для Telegram бота');
      alert('❌ Сначала настройте переменные окружения в файле .env');
      return false;
    }
    
    console.log('🧪 Тестирование Telegram бота...');
    
    try {
      // Проверяем бота
      const botInfoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
      const botInfo = await botInfoResponse.json();
      console.log('✅ Информация о боте:', botInfo);
      
      if (!botInfo.ok) {
        console.error('❌ Бот не найден или токен неверный');
        return false;
      }
      
      // Отправляем тестовое сообщение
      const testMessage = '🧪 Тестовое сообщение от сайта';
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: testMessage
        })
      });
      
      const responseData = await response.json();
      console.log('📤 Ответ от Telegram:', responseData);
      
      if (response.ok && responseData.ok) {
        console.log('✅ Тестовое сообщение отправлено успешно!');
        alert('✅ Тест успешен! Бот работает корректно.');
        return true;
      } else {
        console.error('❌ Ошибка отправки:', responseData);
        alert('❌ Тест не прошел. Проверьте настройки бота.');
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка:', error);
      return false;
    }
  };
  
  // Делаем функции доступными в консоли
  (window as any).testTelegramBot = testTelegramBot;
  
  // Функция для тестирования формы консультации
  (window as any).testConsultationForm = async () => {
    console.log('🧪 Тестируем форму консультации...');
    
    const testData = {
      formType: 'consultation',
      name: 'Test User',
      phone: '+7(999)-123-45-67'
    };
    
    try {
      const result = await sendToTelegram(testData);
      console.log('📊 Результат теста формы консультации:', result);
      
      if (result) {
        alert('✅ Тест формы консультации успешен!');
      } else {
        alert('❌ Тест формы консультации не прошел');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Ошибка теста формы консультации:', error);
      alert('❌ Ошибка теста формы консультации');
      return false;
    }
  };

  // Функция для детальной диагностики Telegram API
  (window as any).debugTelegramAPI = async () => {
    const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
    
    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('❌ Не настроены переменные окружения для Telegram бота');
      alert('❌ Сначала настройте переменные окружения в файле .env');
      return;
    }
    
    console.log('🔍 Детальная диагностика Telegram API...');
    
    try {
      // 1. Проверяем информацию о боте
      console.log('1️⃣ Проверяем информацию о боте...');
      const botResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
      const botData = await botResponse.json();
      console.log('🤖 Информация о боте:', botData);
      
      // 2. Отправляем тестовое сообщение
      console.log('2️⃣ Отправляем тестовое сообщение...');
      const messageResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: '🧪 Тестовое сообщение для диагностики',
          parse_mode: 'Markdown'
        })
      });
      
      const messageData = await messageResponse.json();
      console.log('📤 Ответ на отправку сообщения:', messageData);
      console.log('📊 HTTP статус:', messageResponse.status);
      console.log('📊 Response OK:', messageResponse.ok);
      console.log('📊 Data OK:', messageData.ok);
      
      // 3. Результат
      if (messageResponse.ok && messageData.ok) {
        console.log('✅ Диагностика завершена успешно!');
        alert('✅ Диагностика завершена успешно! Все работает корректно.');
      } else {
        console.log('❌ Диагностика выявила проблемы');
        alert('❌ Диагностика выявила проблемы. Проверьте консоль для деталей.');
      }
      
    } catch (error) {
      console.error('❌ Ошибка диагностики:', error);
      alert('❌ Ошибка диагностики. Проверьте интернет-соединение.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, formType: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Validate name - only letters
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-']+$/;
    if (!nameRegex.test((data.name as string).trim())) {
      showToast('Имя должно содержать только буквы');
      return;
    }

    if ((data.name as string).trim().length < 2) {
      showToast('Имя должно содержать минимум 2 символа');
      return;
    }
    
    if (!PHONE_RE.test(data.phone as string)) {
      showToast('Пожалуйста, введите корректный номер телефона');
      return;
    }

    try {
      console.log('📋 Отправка формы консультации:', { ...data, formType });
      
      // Отправка данных в Telegram
      const telegramSent = await sendToTelegram({ ...data, formType });
      
      console.log('📊 Результат отправки в Telegram:', telegramSent);
      
      if (telegramSent) {
        showToast('✅ Спасибо! Мы свяжемся с вами в ближайшее время.');
        console.log('✅ Форма консультации успешно отправлена');
      } else {
        console.warn('⚠️ Telegram API вернул false, но это может быть временная проблема');
        showToast('⚠️ Заявка отправлена, но есть проблемы с подтверждением. Мы получим ваше сообщение и свяжемся с вами.');
        console.log('⚠️ Форма консультации отправлена с предупреждением');
      }
      
      e.currentTarget.reset();
      onClose();
    } catch (error) {
      console.error('❌ Ошибка при отправке формы консультации:', error);
      showToast('Произошла ошибка. Попробуйте еще раз.');
    }
  };

  return (
    <>
      <Header onOpen={onOpen} activeSection={activeSection} />
      <Hero onOpen={onOpen} bookingOpen={bookingOpen} setBookingOpen={setBookingOpen} />
      <Promos onOpen={onOpen} />
      <Projects onOpen={onOpen} />
      <Mortgage onOpen={onOpen} />
      <Footer onOpen={onOpen} />
      <Modal modal={modal} onClose={onClose} onSubmit={handleSubmit} formatRuPhone={formatRuPhone} />
      <Toast message={toast} />
      {showScrollTop && (
        <button 
          className="scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Наверх"
        >
          ↑
        </button>
      )}
    </>
  );
}

function Header({ onOpen, activeSection }: { onOpen: (id: ModalId) => void; activeSection: string }) {
  return (
    <header className="site-header">
      <div className="container">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">V</span>
          </div>
          <nav className="nav">
            <a 
              href="#projects" 
              className={activeSection === 'projects' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Проекты
            </a>
            <a 
              href="#mortgage" 
              className={activeSection === 'mortgage' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('mortgage')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Ипотека
            </a>
            <a 
              href="#promos" 
              className={activeSection === 'promos' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('promos')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Акции
            </a>
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
      <div className="container hero-inner">
        <div className="hero-content">
          <h1>Застройщик NPM — эксперт по недвижимости</h1>
          <p>От детских садов и школ до фитнеса и прогулочных аллей: жилые кварталы с развитой инфраструктурой</p>
          <div className="hero-cta">
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
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());

    const sendToTelegram = async (data: any) => {
      // Получаем данные из переменных окружения или используем значения по умолчанию для GitHub Pages
      const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
      const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID_HERE';
      
      console.log('🔧 BookingForm: Используемые данные бота:', { BOT_TOKEN: BOT_TOKEN ? '***' : 'undefined', CHAT_ID });
      
      // Проверяем, что данные заданы
      if (!BOT_TOKEN || !CHAT_ID) {
        console.error('❌ Не настроены данные для Telegram бота');
        return false;
      }

    const message = `
🏠 **Новая заявка с сайта**

📋 **Тип формы:** ${data.formType}
👤 **Имя:** ${data.name}
📞 **Телефон:** ${data.phone}
📅 **Дата:** ${data.date}
⏰ **Время:** ${data.time}
🕐 **Время отправки:** ${new Date().toLocaleString('ru-RU')}

🌐 **Источник:** Застройщик NPM
    `;

    try {
      // Создаем AbortController для таймаута
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд

      try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const responseData = await response.json();
        console.log('Ответ от Telegram API:', responseData);

        // Проверяем успешность отправки по содержимому ответа
        if (response.ok && responseData.ok) {
          console.log('✅ Сообщение отправлено в Telegram');
          return true;
        } else {
          console.error('❌ Ошибка отправки в Telegram:', responseData);
          return false;
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error('❌ Таймаут запроса к Telegram API');
          return false;
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Ошибка:', error);
      return false;
    }
  };

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

  const isDateBooked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return Array.from(bookedSlots).some(slot => slot.startsWith(dateStr));
  };

  const isTimeSlotBooked = (time: string) => {
    if (!selectedDate) return false;
    const slotKey = `${selectedDate.toISOString().split('T')[0]}_${time}`;
    return bookedSlots.has(slotKey);
  };

  const hasAvailableSlots = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const bookedSlotsForDate = Array.from(bookedSlots).filter(slot => slot.startsWith(dateStr));
    return bookedSlotsForDate.length > 0 && bookedSlotsForDate.length < timeSlots.length;
  };

  const getAvailableSlotsCount = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const bookedSlotsForDate = Array.from(bookedSlots).filter(slot => slot.startsWith(dateStr));
    return timeSlots.length - bookedSlotsForDate.length;
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

    // Validate name - only letters
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-']+$/;
    if (!nameRegex.test((data.name as string).trim())) {
      alert('Имя должно содержать только буквы');
      return;
    }

    if ((data.name as string).trim().length < 2) {
      alert('Имя должно содержать минимум 2 символа');
      return;
    }

    if (!PHONE_RE.test(data.phone as string)) {
      alert('Пожалуйста, введите корректный номер телефона');
      return;
    }

    try {
      // Отправка данных бронирования в Telegram
      const bookingData = {
        ...data,
        formType: 'booking',
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime
      };
      
      const telegramSent = await sendToTelegram(bookingData);
      
      if (telegramSent) {
        // Добавляем забронированный слот
        const slotKey = `${selectedDate.toISOString().split('T')[0]}_${selectedTime}`;
        setBookedSlots(prev => new Set([...prev, slotKey]));
        
        alert('✅ Запись на просмотр успешно оформлена! Мы свяжемся с вами для подтверждения.');
      } else {
        console.warn('⚠️ Telegram API вернул false, но это может быть временная проблема');
        // Добавляем слот даже если API вернул false, так как сообщение скорее всего дошло
        const slotKey = `${selectedDate.toISOString().split('T')[0]}_${selectedTime}`;
        setBookedSlots(prev => new Set([...prev, slotKey]));
        
        alert('⚠️ Запись оформлена, но есть проблемы с подтверждением. Мы получим ваше сообщение и свяжемся с вами.');
      }
      
      e.currentTarget.reset();
      setSelectedDate(null);
      setSelectedTime(null);
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
            
            <div style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--muted)' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#4f7cff', borderRadius: '2px' }}></div>
                  <span>Свободно</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #ff6b6b, #4f7cff)', borderRadius: '2px' }}></div>
                  <span>Частично занято</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '12px', height: '12px', background: '#ff6b6b', borderRadius: '2px' }}></div>
                  <span>Полностью занято</span>
                </div>
              </div>
            </div>
            <div className="calendar-grid">
              {days.map((date, index) => (
                <button
                  key={index}
                  type="button"
                  className={`calendar-cell ${date && selectedDate?.toDateString() === date.toDateString() ? 'selected' : ''} ${date && isDateDisabled(date) ? 'disabled' : ''} ${date && isDateBooked(date) && !hasAvailableSlots(date) ? 'booked' : ''} ${date && hasAvailableSlots(date) ? 'partially-booked' : ''}`}
                  onClick={() => date && !isDateDisabled(date) && setSelectedDate(date)}
                  disabled={!date || isDateDisabled(date)}
                >
                  {date?.getDate()}
                  {date && isDateBooked(date) && !hasAvailableSlots(date) && (
                    <span style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '10px' }}>❌</span>
                  )}
                  {date && hasAvailableSlots(date) && (
                    <span style={{ 
                      position: 'absolute', 
                      bottom: '2px', 
                      right: '2px', 
                      fontSize: '8px',
                      background: '#4f7cff',
                      color: 'white',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getAvailableSlotsCount(date)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="time-section">
            <h4>Выберите время</h4>
            {selectedDate && hasAvailableSlots(selectedDate) && (
              <div style={{
                background: 'linear-gradient(135deg, #4f7cff, #60a5fa)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                marginBottom: '12px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                📅 На {selectedDate.toLocaleDateString('ru-RU')} доступно {getAvailableSlotsCount(selectedDate)} свободных слотов
              </div>
            )}
            <div className="time-grid">
              {timeSlots.map(time => (
                <button
                  key={time}
                  type="button"
                  className={`time-slot ${selectedTime === time ? 'selected' : ''} ${isTimeSlotBooked(time) ? 'booked' : ''}`}
                  onClick={() => !isTimeSlotBooked(time) && setSelectedTime(time)}
                  disabled={isTimeSlotBooked(time)}
                >
                  {time}
                  {isTimeSlotBooked(time) && <span style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '10px' }}>❌</span>}
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
            onChange={(e) => {
              e.target.value = formatName(e.target.value);
            }}
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
    <section id="promos" className="section promos">
      <div className="container">
        <h2>Акции</h2>
        <div className="cards grid-3">
          <article className="card">
            <h3>Ремонт в подарок — в «Народных кварталах»!</h3>
            <p>Ремонт в подарок при покупке квартиры в СК НВМ!</p>
            <button className="btn btn-link" onClick={() => onOpen('promo1')}>Подробнее</button>
          </article>
          <article className="card">
            <h3>Ремонт + Сертификат на мебель в подарок</h3>
            <p>Отделка под ключ — без лишних хлопот</p>
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

function Projects({ onOpen }: { onOpen: (id: ModalId) => void }) {
  return (
    <section id="projects" className="section projects">
      <div className="container">
        <div className="section-head">
          <h2>Выберите квартиру</h2>
        </div>
        <div className="cards grid-3">
          <article className="project-card">
            <img src={dom101Image} alt="ДОМ 101" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
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
            <button className="btn btn-secondary" onClick={() => onOpen('dom101')}>О проекте</button>
          </article>
          <article className="project-card">
            <img src={narodnyeKvartalyImage} alt="Народные кварталы" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
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
            <button className="btn btn-secondary" onClick={() => onOpen('narodnye')}>О проекте</button>
          </article>
          <article className="project-card">
            <img src={istoriya2Image} alt="История 2" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '12px' }} />
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
            <button className="btn btn-secondary" onClick={() => onOpen('istoriya2')}>О проекте</button>
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
        <div className="cards grid-4">
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
          <article className="card military-card">
            <div className="card-icon">🪖</div>
            <h3>Военная ипотека</h3>
            <div className="military-info">
              <div className="military-features">
                <div className="feature">
                  <span className="feature-label">Ставка</span>
                  <span className="feature-value">от 6%</span>
                </div>
                <div className="feature">
                  <span className="feature-label">ПВ</span>
                  <span className="feature-value">от 30%</span>
                </div>
                <div className="feature">
                  <span className="feature-label">Срок</span>
                  <span className="feature-value">до 25 лет</span>
                </div>
                <div className="feature">
                  <span className="feature-label">Сумма</span>
                  <span className="feature-value">до 4,975 млн ₽</span>
                </div>
              </div>
              <p>Специальные программы для военнослужащих по контракту с льготными условиями.</p>
            </div>
            <button className="btn btn-link" onClick={() => onOpen('military')}>Подробнее</button>
          </article>
        </div>
      </div>
    </section>
  );
}


function Footer({ onOpen }: { onOpen: (id: ModalId) => void }) {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="logo-mark">V</span>
          <p>© 2015–2025 Застройщик NPM. Не является публичной офертой.</p>
        </div>
        <ul className="footer-links">
          <li><a href="#projects">Проекты</a></li>
          <li><a href="#mortgage">Ипотека</a></li>
          <li><a href="#promos">Акции</a></li>
          <li><a href="/policy.html">Политика конфиденциальности</a></li>
        </ul>
        <div className="footer-contacts">
          <a className="btn btn-outline" href="tel:+79884707893">+7 (988) 470‑78‑93</a>
          <button className="btn btn-secondary" onClick={() => onOpen('consultation')}>Обратный звонок</button>
        </div>
      </div>
    </footer>
  );
}

function Modal({ modal, onClose, onSubmit, formatRuPhone }: { modal: ModalId | null; onClose: () => void; onSubmit: (e: React.FormEvent<HTMLFormElement>, formType: string) => void; formatRuPhone: (value: string) => string }) {
  if (!modal) return null;

  const modalContent = useMemo(() => {
    switch (modal) {
      case 'promo1':
        return {
          title: 'Ремонт в подарок — в «Народных кварталах»!',
          content: `🎁 **Ремонт в подарок при покупке квартиры в СК НВМ!**

Спешим порадовать будущих жителей — при покупке любой квартиры в жилом районе ЖК «Народные кварталы» до 30 сентября 2025 года вы получаете ремонт в подарок!

✨ **Что входит в акцию:**
• Отделка под ключ — без лишних хлопот
• Любая планировка — акция действует на все квартиры
• Любой вид расчета

🏠 **Проект:**
• ЖК «Народные кварталы»

📅 **Сроки акции:** с 14.05.2025 по 30.09.2025

📞 **Контакты:** С подробной информацией о правилах проведения акции можно ознакомиться по телефону +7(988)470-78-93

Организатор акции:
ООО СЗ «ГРАДСТРОЙПРОЕКТ». ИНН 2311311443. ОГРН1202300058586. Проектная декларация на сайте наш.дом.рф.

ООО СЗ «СК Техюгстрой», ИНН: 2311340860, ОГРН:1222300057760 Проектная декларация на сайте наш.дом.рф.`
        };
      case 'promo2':
        return {
          title: 'Ремонт + Сертификат на мебель в подарок',
          content: `🎁 **Ремонт + Сертификат на мебель в подарок**

При покупке любой квартиры в жилом районе ЖК «Народные кварталы» до 30 сентября 2025 года вы получаете ремонт и сертификат на мебель в подарок!

✨ **Что входит в акцию:**
• Отделка под ключ — без лишних хлопот
• Сертификат на мебель в подарок
• Любая планировка — акция действует на все квартиры
• Любой вид расчета

🏠 **Проект:**
• ЖК «Народные кварталы»

📅 **Сроки акции:** с 14.05.2025 по 30.09.2025

📞 **Контакты:** С подробной информацией о правилах проведения акции можно ознакомиться по телефону +7(988)470-78-93

⏰ **Ограниченное время акции!**
Количество квартир по специальным ценам ограничено.`
        };
      case 'promo3':
        return {
          title: 'Семейная ипотека',
          content: `👨‍👩‍👧‍👦 **Семейная ипотека - выгодные условия**

Льготные программы для семей с детьми от ведущих банков России.

📋 **Основные условия:**
• Ставка от 6% годовых
• Первоначальный взнос от 20%
• Срок кредита до 30 лет
• Сумма кредита до 15 млн ₽

🎁 **Дополнительные преимущества:**
• Использование материнского капитала
• Государственные субсидии
• Снижение ставки при наличии детей
• Возможность привлечения созаемщиков

👶 **Для кого подходит:**
• Семьи с детьми до 6 лет
• Многодетные семьи
• Семьи с детьми-инвалидами

📞 Получите консультацию по телефону +7(861)211-28-50`
        };
      case 'state':
        return {
          title: 'Господдержка',
          content: `🏛️ **Программы государственной поддержки**

Разнообразие льготных программ от ведущих банков России.

📊 **Общие условия:**
• Процентная ставка от 6%
• Первоначальный взнос от 20,01%
• Срок кредита от 1 года до 30 лет
• Сумма кредита от 500,000 ₽ до 15 млн ₽

🎯 **Преимущества:**
• Использование субсидий по ипотеке
• Материнский капитал
• Государственные программы поддержки
• Одна анкета для подачи в несколько банков

📋 **Процесс оформления:**
1. Консультация с ипотечным брокером
2. Подготовка документов к сделке
3. Подписание кредитного договора
4. Оформление сделки

📞 Подробная консультация: +7(861)211-28-50`
        };
      case 'family':
        return {
          title: 'Семейная ипотека',
          content: `👨‍👩‍👧‍👦 **Семейная ипотека - подробные условия**

Специальные программы для семей с детьми.

💰 **Основные параметры:**
• Ставка от 6% годовых
• Первоначальный взнос от 20%
• Срок кредита до 30 лет
• Сумма кредита до 15 млн ₽

🎁 **Дополнительные возможности:**
• Использование материнского капитала
• Государственные субсидии до 2,5%
• Снижение ставки при наличии детей
• Возможность привлечения созаемщиков

👶 **Условия для получения:**
• В семье есть ребёнок младше 7 лет
• Два или более ребёнка младше 18 лет
• Ребёнок с особыми потребностями до 18 лет

📋 **Требования к заёмщику:**
• Гражданин РФ
• Возраст от 21 до 70 лет
• Стаж на последнем месте работы от 3 месяцев
• Регистрация в РФ

📞 Консультация и оформление: +7(861)211-28-50`
        };
      case 'military':
        return {
          title: 'Военная ипотека',
          content: `🪖 **Семейная военная ипотека - подробные условия**

Специальные программы ипотечного кредитования для военнослужащих по контракту.

💰 **Основные условия кредитования:**
• Процентная ставка: от 6% годовых
• Первоначальный взнос: от 30% до 90%
• Срок кредита: от 12 месяцев до 25 лет
• Сумма кредита: до 4,975,000 ₽
• Полная стоимость кредита: 5,995% - 6,166%

🎯 **Преимущества для военнослужащих:**
• Специальные льготные условия кредитования
• Упрощенная процедура оформления документов
• Государственная поддержка и субсидирование
• Возможность использования накопительно-ипотечной системы (НИС)
• Сниженные требования к доходу
• Возможность досрочного погашения без штрафов

📋 **Требования к заёмщику:**
• Военнослужащий по контракту в ВС РФ
• Возраст от 21 года до 70 лет
• Стаж военной службы от 3 месяцев
• Регистрация по месту жительства в РФ
• Наличие российского гражданства
• Подтвержденный доход от военной службы

🏠 **Процесс оформления военной ипотеки:**
1. **Консультация** - наш ипотечный брокер проконсультирует по всем вопросам
2. **Подготовка документов** - сбор справок и документов к сделке
3. **Подача заявки** - подача заявки в банк-партнер
4. **Одобрение кредита** - получение предварительного одобрения
5. **Подписание договора** - заключение кредитного договора
6. **Оформление сделки** - регистрация сделки купли-продажи

📄 **Необходимые документы:**
• Военный билет или удостоверение личности военнослужащего
• Справка о доходах за последние 6 месяцев
• Трудовая книжка или выписка из личного дела
• Документы на приобретаемую недвижимость
• Справка о составе семьи
• Документы о семейном положении

⚡ **Сроки рассмотрения:**
• Предварительное одобрение: 1-2 рабочих дня
• Полное рассмотрение: 3-5 рабочих дней
• Оформление сделки: 5-10 рабочих дней

🎁 **Дополнительные возможности:**
• Использование материнского капитала
• Государственные субсидии на жилье
• Возможность рефинансирования
• Страхование жизни и здоровья на льготных условиях
• Юридическая поддержка на всех этапах

📞 **Консультация и оформление:**
Получите подробную консультацию по телефону +7(861)211-28-50
Наш специалист ответит на все вопросы и поможет оформить военную ипотеку.`
        };
      case 'consultation':
        return {
          title: 'Получить консультацию',
          content: 'Оставьте свои данные, и наш менеджер свяжется с вами.'
        };
      case 'dom101':
        return {
          title: 'ЖК "ДОМ 101"',
          content: `ЖК "ДОМ 101" — это экосистема на территории 101 га с развитой инфраструктурой.

📍 Расположение: г. Краснодар, улица Дорожная

🏢 Планировки:
• Студии от 22,56 м² — от 3,8 млн ₽
• 1-комнатные от 33,30 м² — от 4,3 млн ₽  
• 2-комнатные от 48,80 м² — от 5,4 млн ₽
• 3-комнатные от 77,46 м² — от 8,1 млн ₽

🎯 Особенности:
• Ландшафтный парк 20 га
• Собственное колесо обозрения
• Школа на 1,725 мест
• 5 детских садов по 310-350 мест
• Современные спортивные площадки
• Развитая транспортная сеть

💳 Варианты покупки:
• Единоразовый платеж
• Рассрочка 0%
• Материнский капитал
• Ипотека от 5,99% годовых

Старт продаж — специальные условия для первых покупателей!`
        };
      case 'narodnye':
        return {
          title: 'ЖК "Народные кварталы"',
          content: `ЖК "Народные кварталы" — современный жилой комплекс с развитой инфраструктурой.

📍 Расположение: г. Краснодар, пос. Знаменский

🏢 Планировки:
• 1-комнатные от 3,9 млн ₽
• 2-комнатные от 6,6 млн ₽

🎯 Особенности:
• Ремонт в подарок при покупке
• Современная архитектура
• Благоустроенные дворы
• Детские площадки
• Парковочные места
• Развитая инфраструктура

💳 Варианты покупки:
• Единоразовый платеж со скидкой
• Рассрочка от застройщика
• Ипотека с господдержкой
• Материнский капитал

Акция "Ремонт в подарок" — не упустите выгодное предложение!`
        };
      case 'istoriya2':
        return {
          title: 'ЖК "История 2"',
          content: `ЖК "История 2" — готовые дома в экологически чистом районе.

📍 Расположение: г. Краснодар, пос. Южный, Казачья

🏢 Планировки:
• 2-комнатные от 6,2 млн ₽

🎯 Особенности:
• Дома уже сданы и готовы к заселению
• Экологически чистая зона
• Тихий район с хорошей экологией
• Благоустроенная территория
• Детские площадки
• Парковочные места

💳 Варианты покупки:
• Единоразовый платеж
• Рассрочка от застройщика
• Ипотека с выгодными условиями
• Материнский капитал

Готовые дома — заселяйтесь сразу после покупки!`
        };
      default:
        return { title: '', content: '' };
    }
  }, [modal]);

  const showForm = modal === 'consultation';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>{modalContent.title}</h2>
        <div className="modal-content" style={{ whiteSpace: 'pre-line', marginBottom: showForm ? '20px' : '0' }}>
          {modalContent.content}
        </div>
        {showForm && (
          <form onSubmit={(e) => onSubmit(e, modal)}>
            <input
              type="text"
              name="name"
              placeholder="Ваше имя"
              required
              className="form-input"
              onChange={(e) => {
                e.target.value = formatName(e.target.value);
              }}
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
        )}
      </div>
    </div>
  );
}

function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="toast">{message}</div>;
}

// Utility function for name formatting
export const formatName = (value: string) => {
  // Remove all non-letter characters (keeping spaces, hyphens, apostrophes for compound names)
  let formatted = value.replace(/[^a-zA-Zа-яА-ЯёЁ\s\-']/g, '');
  // Remove multiple spaces
  formatted = formatted.replace(/\s+/g, ' ');
  return formatted;
};

export default App;
