document.addEventListener('DOMContentLoaded', () => {
  // Inicialização de Ícones Lucide (caso queira forçar a renderização dinâmica)
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // --- LÓGICA DO FAQ ACCORDION ---
  const faqTriggers = document.querySelectorAll('.faq-trigger');
  
  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const contentId = trigger.getAttribute('aria-controls');
      const content = document.getElementById(contentId);
      
      // Fechar outros accordions abertos
      faqTriggers.forEach(otherTrigger => {
        if (otherTrigger !== trigger && otherTrigger.getAttribute('aria-expanded') === 'true') {
          otherTrigger.setAttribute('aria-expanded', 'false');
          const otherContent = document.getElementById(otherTrigger.getAttribute('aria-controls'));
          otherContent.style.maxHeight = null;
        }
      });
      
      // Alternar o atual
      trigger.setAttribute('aria-expanded', !expanded);
      if (!expanded) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = null;
      }
    });
  });

  // --- WIDGET DE AGENDAMENTO INTERATIVO ---
  const bookingState = {
    treatment: '',
    professional: '',
    date: '',
    time: '',
    clientName: '',
    clientEmail: '',
    clientPhone: ''
  };

  const steps = document.querySelectorAll('.step-container');
  const stepDots = document.querySelectorAll('.step-dot');
  const stepLines = document.querySelectorAll('.step-line-fill');
  let currentStep = 1;

  // Atualizar visual do progresso do widget
  function updateWidgetProgress() {
    stepDots.forEach((dot, index) => {
      const stepNum = index + 1;
      dot.classList.remove('active', 'completed');
      
      if (stepNum === currentStep) {
        dot.classList.add('active');
      } else if (stepNum < currentStep) {
        dot.classList.add('completed');
      }
    });

    stepLines.forEach((line, index) => {
      const lineNum = index + 1;
      if (lineNum < currentStep) {
        line.style.width = '100%';
      } else {
        line.style.width = '0%';
      }
    });
  }

  // Mudar de Passo com Animação GSAP
  function goToStep(stepNumber) {
    const currentStepEl = document.querySelector(`.step-container[data-step="${currentStep}"]`);
    const nextStepEl = document.querySelector(`.step-container[data-step="${stepNumber}"]`);

    if (window.gsap) {
      window.gsap.to(currentStepEl, {
        opacity: 0,
        y: -10,
        duration: 0.25,
        onComplete: () => {
          currentStepEl.classList.remove('active');
          nextStepEl.classList.add('active');
          
          window.gsap.fromTo(nextStepEl, 
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.35 }
          );
          
          currentStep = stepNumber;
          updateWidgetProgress();
          
          // Se for o passo final (resumo), preencher os dados
          if (currentStep === 4) {
            renderBookingSummary();
          }
        }
      });
    } else {
      // Fallback sem GSAP
      currentStepEl.classList.remove('active');
      nextStepEl.classList.add('active');
      currentStep = stepNumber;
      updateWidgetProgress();
      if (currentStep === 4) {
        renderBookingSummary();
      }
    }
  }

  // Eventos de Seleção no Passo 1 (Tratamentos)
  const treatmentCards = document.querySelectorAll('.booking-treatment-card');
  treatmentCards.forEach(card => {
    card.addEventListener('click', () => {
      treatmentCards.forEach(c => c.classList.remove('border-sage', 'bg-sage-light/30', 'scale-[1.02]'));
      card.classList.add('border-sage', 'bg-sage-light/30', 'scale-[1.02]');
      bookingState.treatment = card.getAttribute('data-value');
      
      // Habilitar botão Avançar do Passo 1
      document.getElementById('next-step-1').removeAttribute('disabled');
    });
  });

  // Eventos de Seleção no Passo 2 (Profissional)
  const professionalCards = document.querySelectorAll('.booking-professional-card');
  professionalCards.forEach(card => {
    card.addEventListener('click', () => {
      professionalCards.forEach(c => c.classList.remove('border-sage', 'bg-sage-light/30', 'scale-[1.02]'));
      card.classList.add('border-sage', 'bg-sage-light/30', 'scale-[1.02]');
      bookingState.professional = card.getAttribute('data-value');
      
      checkPasso2Ready();
    });
  });

  // Geração Dinâmica do Calendário no Passo 2
  const calendarGrid = document.querySelector('.calendar-grid');
  const monthYearLabel = document.querySelector('.calendar-month-year');
  
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const hoje = new Date();
  let dataFoco = new Date(hoje);

  function gerarCalendario() {
    calendarGrid.innerHTML = '';
    
    // Rótulo do Mês/Ano
    monthYearLabel.textContent = `${meses[dataFoco.getMonth()]} de ${dataFoco.getFullYear()}`;
    
    // Cabeçalhos dos Dias da Semana
    diasSemana.forEach(dia => {
      const header = document.createElement('div');
      header.className = 'text-center font-medium text-xs text-muted/80 py-1';
      header.textContent = dia;
      calendarGrid.appendChild(header);
    });

    const ano = dataFoco.getFullYear();
    const mes = dataFoco.getMonth();
    
    // Primeiro dia do mês
    const primeiroDia = new Date(ano, mes, 1).getDay();
    // Quantidade de dias no mês
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    // Adicionar espaços vazios para alinhar o primeiro dia
    for (let i = 0; i < primeiroDia; i++) {
      const emptyCell = document.createElement('div');
      calendarGrid.appendChild(emptyCell);
    }

    // Gerar botões de data
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'w-9 h-9 mx-auto rounded-full text-sm font-medium flex items-center justify-center transition-all hover:bg-sage/10 hover:text-sage';
      btn.textContent = dia;
      
      const dataCriada = new Date(ano, mes, dia);
      
      // Regras de desativação: dias passados ou domingos (clínica fechada aos domingos)
      const dataHojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      if (dataCriada < dataHojeSemHora || dataCriada.getDay() === 0) {
        btn.disabled = true;
      }
      
      // Destacar data selecionada
      if (bookingState.date && 
          new Date(bookingState.date).toDateString() === dataCriada.toDateString()) {
        btn.classList.add('bg-sage', 'text-white', 'hover:bg-sage');
      }

      btn.addEventListener('click', () => {
        // Remover seleção anterior
        const activeBtn = calendarGrid.querySelector('.bg-sage');
        if (activeBtn) {
          activeBtn.classList.remove('bg-sage', 'text-white', 'hover:bg-sage');
        }
        btn.classList.add('bg-sage', 'text-white', 'hover:bg-sage');
        
        bookingState.date = dataCriada.toISOString().split('T')[0];
        checkPasso2Ready();
      });

      calendarGrid.appendChild(btn);
    }
  }

  // Navegação no calendário
  document.getElementById('prev-month').addEventListener('click', () => {
    dataFoco.setMonth(dataFoco.getMonth() - 1);
    gerarCalendario();
  });

  document.getElementById('next-month').addEventListener('click', () => {
    dataFoco.setMonth(dataFoco.getMonth() + 1);
    gerarCalendario();
  });

  // Slots de Horários
  const timeSlots = document.querySelectorAll('.time-slot');
  timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      timeSlots.forEach(s => s.classList.remove('selected', 'bg-sage', 'text-white'));
      slot.classList.add('selected', 'bg-sage', 'text-white');
      bookingState.time = slot.getAttribute('data-value');
      
      checkPasso2Ready();
    });
  });

  function checkPasso2Ready() {
    const btnNext = document.getElementById('next-step-2');
    if (bookingState.professional && bookingState.date && bookingState.time) {
      btnNext.removeAttribute('disabled');
    } else {
      btnNext.setAttribute('disabled', 'true');
    }
  }

  // Formulário de Contato e Validação no Passo 3
  const formPasso3 = document.getElementById('booking-form-step3');
  const inputName = document.getElementById('client-name');
  const inputEmail = document.getElementById('client-email');
  const inputPhone = document.getElementById('client-phone');

  function validateStep3() {
    const nameVal = inputName.value.trim();
    const emailVal = inputEmail.value.trim();
    const phoneVal = inputPhone.value.trim();
    
    // Regex simples de e-mail e telefone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\(?[0-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$/; // ex: (11) 99999-9999 ou 11999999999

    const isNameValid = nameVal.length >= 3;
    const isEmailValid = emailRegex.test(emailVal);
    // Validação de telefone mais frouxa se contiver pelo menos 10 dígitos
    const cleanPhone = phoneVal.replace(/\D/g, '');
    const isPhoneValid = cleanPhone.length >= 10;

    const btnNext = document.getElementById('next-step-3');
    
    if (isNameValid && isEmailValid && isPhoneValid) {
      btnNext.removeAttribute('disabled');
      return true;
    } else {
      btnNext.setAttribute('disabled', 'true');
      return false;
    }
  }

  // Adicionar eventos de input para validar em tempo real
  [inputName, inputEmail, inputPhone].forEach(input => {
    input.addEventListener('input', validateStep3);
  });

  // Formatação automática do telefone: (XX) XXXXX-XXXX
  inputPhone.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    
    e.target.value = value;
    validateStep3();
  });

  // Preencher Resumo Final do Agendamento (Passo 4)
  function renderBookingSummary() {
    // Formatar data em português
    const dataObj = new Date(bookingState.date + 'T00:00:00');
    const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Mapeamento de nomes de tratamentos
    const tratamentosNomes = {
      'botox': 'Botox Full Face (Rejuvenescimento)',
      'preenchimento': 'Preenchimento Labial Premium (1ml)',
      'bioestimulador': 'Bioestimulador de Colágeno (Firmador)',
      'limpeza': 'Limpeza de Pele Experience (90 min)'
    };

    // Mapeamento de nomes de profissionais
    const profissionaisNomes = {
      'helena': 'Dra. Helena Vasconcelos (Dermatologista)',
      'thiago': 'Dr. Thiago Mendes (Biomédico Esteta)'
    };

    document.getElementById('summary-treatment').textContent = tratamentosNomes[bookingState.treatment] || bookingState.treatment;
    document.getElementById('summary-professional').textContent = profissionaisNomes[bookingState.professional] || bookingState.professional;
    document.getElementById('summary-datetime').textContent = `${dataFormatada} às ${bookingState.time}`;
    document.getElementById('summary-client').textContent = `${inputName.value.trim()} (${inputPhone.value.trim()})`;
  }

  // Navegação dos Botões "Avançar"
  document.getElementById('next-step-1').addEventListener('click', () => {
    if (bookingState.treatment) {
      goToStep(2);
      gerarCalendario();
    }
  });

  document.getElementById('next-step-2').addEventListener('click', () => {
    if (bookingState.professional && bookingState.date && bookingState.time) {
      goToStep(3);
    }
  });

  document.getElementById('next-step-3').addEventListener('click', () => {
    if (validateStep3()) {
      bookingState.clientName = inputName.value.trim();
      bookingState.clientEmail = inputEmail.value.trim();
      bookingState.clientPhone = inputPhone.value.trim();
      goToStep(4);
    }
  });

  // Botões de Voltar
  document.querySelectorAll('.btn-prev-step').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepDest = parseInt(btn.getAttribute('data-goto'));
      goToStep(stepDest);
    });
  });

  // Resetar Widget após conclusão
  document.getElementById('btn-reset-booking').addEventListener('click', () => {
    bookingState.treatment = '';
    bookingState.professional = '';
    bookingState.date = '';
    bookingState.time = '';
    bookingState.clientName = '';
    bookingState.clientEmail = '';
    bookingState.clientPhone = '';

    // Limpar seleções visuais
    treatmentCards.forEach(c => c.classList.remove('border-sage', 'bg-sage-light/30', 'scale-[1.02]'));
    professionalCards.forEach(c => c.classList.remove('border-sage', 'bg-sage-light/30', 'scale-[1.02]'));
    timeSlots.forEach(s => s.classList.remove('selected', 'bg-sage', 'text-white'));
    
    // Desabilitar botões
    document.getElementById('next-step-1').setAttribute('disabled', 'true');
    document.getElementById('next-step-2').setAttribute('disabled', 'true');
    document.getElementById('next-step-3').setAttribute('disabled', 'true');

    // Resetar inputs
    formPasso3.reset();

    // Voltar para o passo 1
    goToStep(1);
  });

  // --- INTEGRAÇÃO DOS CARDS DE TRATAMENTO COM O WIDGET ---
  const ctaTratamentos = document.querySelectorAll('.cta-agendar-tratamento');
  ctaTratamentos.forEach(cta => {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      const val = cta.getAttribute('data-tratamento');
      
      // Procurar o card no widget correspondente a este tratamento e disparar clique
      const matchingCard = document.querySelector(`.booking-treatment-card[data-value="${val}"]`);
      if (matchingCard) {
        matchingCard.click();
      }
      
      // Rolar até a seção de agendamento suavemente
      const sectionBooking = document.getElementById('agendamento');
      if (sectionBooking) {
        sectionBooking.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Rolar para a seção de agendamento a partir de qualquer botão de CTA geral
  const generalCtas = document.querySelectorAll('.cta-agendar-geral');
  generalCtas.forEach(cta => {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionBooking = document.getElementById('agendamento');
      if (sectionBooking) {
        sectionBooking.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- ANIMAÇÕES GSAP (SCROLLTRIGGER) ---
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);

    // Revelar elementos do Header no Load
    window.gsap.from('header', {
      y: -80,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });

    // Animação de entrada da Hero Section no Load
    const heroTl = window.gsap.timeline({ delay: 0.2 });
    heroTl
      .from('.hero-badge', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' })
      .from('.hero-title', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, '-=0.4')
      .from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .from('.hero-actions', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .from('.hero-image-wrapper', { opacity: 0, scale: 0.95, duration: 1, ease: 'power3.out' }, '-=0.6')
      .from('.hero-stats', { opacity: 0, y: 15, duration: 0.6, ease: 'power2.out' }, '-=0.4');

    // Revelar seções ao rolar a página
    const sectionsToAnimate = [
      { id: '#diferenciais', trigger: '#diferenciais', y: 40 },
      { id: '#tratamentos', trigger: '#tratamentos', y: 40 },
      { id: '#agendamento', trigger: '#agendamento', y: 40 },
      { id: '#depoimentos', trigger: '#depoimentos', y: 40 },
      { id: '#faq', trigger: '#faq', y: 40 }
    ];

    sectionsToAnimate.forEach(section => {
      const el = document.querySelector(section.id);
      if (el) {
        window.gsap.from(el.querySelectorAll('.reveal-item'), {
          scrollTrigger: {
            trigger: section.trigger,
            start: 'top 80%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: section.y,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out'
        });
      }
    });

    // Animação parallax sutil nas imagens decorativas ou na hero
    window.gsap.to('.hero-parallax-bg', {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      },
      yPercent: 20,
      ease: 'none'
    });
  }
});
