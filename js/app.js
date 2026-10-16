/* ==========================================================================
   Инициализация логики проекта «История избирательных кампаний в Беларуси»
   ========================================================================== */

$(document).ready(function () {
  initThemeSwitcher();
  initModalWindow();
  initChecklist();
  initSearchAndFilter();
  initRegistryCatalog();
  initDatePicker();
  initKnowledgeForm();
  initQuestionsAccordion();
  initSelfAssessmentSlider();
  initQuizProgress();
  initSortableSteps();
  initResultDialog();
  initCombinedCheck();
  initFormValidation();
  initModalsWithFocusReturn();
  initStepsModal(); // <--- Добавьте эту строчку сюда
});

/* ==========================================================================
   ЗАДАНИЕ 6: Заметная и красивая система всплывающих уведомлений (Toasts)
   ========================================================================== */
function showAppNotification(message, type) {
  // Удаляем предыдущее уведомление, если оно есть
  $('#app-notification').remove();

  var bgColor = type === 'success' ? '#10b981' : '#ef4444'; // Зеленый для успеха, красный для ошибки
  var icon = type === 'success' ? '✅' : '❌';

  var $notification = $('<div>', {
    id: 'app-notification',
    css: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      'z-index': '99999',
      background: bgColor,
      color: '#ffffff',
      padding: '16px 24px',
      'border-radius': '10px',
      'box-shadow': '0 10px 25px rgba(0,0,0,0.25)',
      'font-size': '1rem',
      'font-weight': '600',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      opacity: '0',
      transform: 'translateY(20px)',
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
    }
  }).html('<span>' + icon + '</span> <span>' + message + '</span>');

  $('body').append($notification);

  // Анимация плавного появления
  setTimeout(function () {
    $notification.css({ opacity: '1', transform: 'translateY(0)' });
  }, 10);

  // Автоматическое скрытие через 4 секунды
  setTimeout(function () {
    $notification.css({ opacity: '0', transform: 'translateY(20px)' });
    setTimeout(function () {
      $notification.remove();
    }, 300);
  }, 4000);
}

/* ==========================================================================
   Переключатель темы (Тёмная / Светлая)
   ========================================================================== */
function initThemeSwitcher() {
  var $headerContainer = $('.header-container');
  if (!$headerContainer.length) return;
  if ($headerContainer.find('.theme-toggle-btn').length) return;

  var $themeBtn = $('<button>', {
    type: 'button',
    class: 'nav-btn theme-toggle-btn',
    'aria-label': 'Переключить тему оформления'
  });

  var savedTheme = localStorage.getItem('siteTheme') || 'light';
  if (savedTheme === 'dark') {
    $('body').addClass('dark-theme');
    $themeBtn.text('Светлая тема');
  } else {
    $themeBtn.text('Тёмная тема');
  }

  $themeBtn.on('click', function () {
    var isDark = $('body').toggleClass('dark-theme').hasClass('dark-theme');
    localStorage.setItem('siteTheme', isDark ? 'dark' : 'light');
    $themeBtn.text(isDark ? 'Светлая тема' : 'Тёмная тема');
  });

  $headerContainer.append($themeBtn);
}

/* ==========================================================================
   Модальное окно
   ========================================================================== */
function initModalWindow() {
  var $modal = $('#info-modal');
  var $openBtn = $('#open-modal-btn');
  var $closeBtn = $('#close-modal-btn');

  if (!$modal.length || !$openBtn.length || !$closeBtn.length) return;

  var lastActiveElement = null;

  function openModal() {
    lastActiveElement = document.activeElement;
    $modal.addClass('active').attr('aria-hidden', 'false');
    $closeBtn.focus();
    $(document).on('keydown.modal', handleKeyDown);
  }

  function closeModal() {
    $modal.removeClass('active').attr('aria-hidden', 'true');
    $(document).off('keydown.modal', handleKeyDown);
    if (lastActiveElement) $(lastActiveElement).focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') closeModal();
  }

  $openBtn.on('click', openModal);
  $closeBtn.on('click', closeModal);

  $modal.on('click', function (e) {
    if ($(e.target).is($modal)) closeModal();
  });
}

/* ==========================================================================
   Живой поиск и фильтрация
   ========================================================================== */
function initSearchAndFilter() {
  var $searchInput = $('#search-input');
  var $searchResultsCount = $('#search-results-count');
  var $cardsGrid = $('.cards-grid');

  if (!$searchInput.length || !$cardsGrid.length) return;

  var $cards = $cardsGrid.find('.card');

  $cards.each(function () {
    var $card = $(this);
    var $titleEl = $card.find('h3');
    var $descEl = $card.find('p');
    if ($titleEl.length && !$card.data('originalTitle')) {
      $card.data('originalTitle', $titleEl.text());
    }
    if ($descEl.length && !$card.data('originalDesc')) {
      $card.data('originalDesc', $descEl.text());
    }
  });

  $searchInput.on('input', function () {
    var query = $searchInput.val().trim().toLowerCase();
    var visibleCount = 0;

    $cards.each(function () {
      var $card = $(this);
      var $titleEl = $card.find('h3');
      var $descEl = $card.find('p');
      var origTitle = $card.data('originalTitle') || '';
      var origDesc = $card.data('originalDesc') || '';

      if (!query) {
        $card.show();
        if ($titleEl.length) $titleEl.text(origTitle);
        if ($descEl.length) $descEl.text(origDesc);
        visibleCount++;
        return;
      }

      var matchTitle = origTitle.toLowerCase().includes(query);
      var matchDesc = origDesc.toLowerCase().includes(query);

      if (matchTitle || matchDesc) {
        $card.show();
        visibleCount++;
      } else {
        $card.hide();
      }
    });

    if ($searchResultsCount.length) {
      $searchResultsCount.text(query ? 'Найдено элементов: ' + visibleCount : '');
    }
  });
}

/* ==========================================================================
   ЗАДАНИЕ 6: Интерактивный чек-лист с уведомлением и индикатором прогресса
   ========================================================================== */
function initChecklist() {
  var $checklistForm = $('#checklist-form');
  if (!$checklistForm.length) return;

  var $resultContainer = $('#checklist-result');
  var $scorePercentEl = $('#score-percent');
  var $scoreStatusEl = $('#score-status');
  var $clearBtn = $('#clear-checklist-btn');
  var $progressFill = $('#custom-progress-fill');

  var STORAGE_KEY = 'belarus_elections_checklist';

  function calculateResults() {
    var $items = $checklistForm.find('.checklist-item');
    var yesCount = 0;
    var evaluatedCount = 0;

    $items.each(function () {
      var $item = $(this);
      var $selectedRadio = $item.find('input[type="radio"]:checked');
      $item.removeClass('item-warning');

      if ($selectedRadio.length) {
        evaluatedCount++;
        var val = $selectedRadio.val();
        if (val === 'yes') {
          yesCount++;
        } else if (val === 'no') {
          $item.addClass('item-warning');
        }
      }
    });

    var percent = evaluatedCount > 0 ? Math.round((yesCount / evaluatedCount) * 100) : 0;

    if ($scorePercentEl.length) {
      $scorePercentEl.text(percent + '%');
    }

    // Обновление компонента индикатора выполнения (Задание 6)
    if ($progressFill.length) {
      $progressFill.css('width', percent + '%');
    }

    if ($resultContainer.length) {
      $resultContainer.removeClass('summary-high summary-medium summary-low summary-none');

      if (evaluatedCount === 0) {
        $resultContainer.addClass('summary-none');
        if ($scoreStatusEl.length) $scoreStatusEl.text('Оценка не проведена (выберите варианты)');
      } else if (percent >= 80) {
        $resultContainer.addClass('summary-high');
        if ($scoreStatusEl.length) $scoreStatusEl.text('Высокий уровень соответствия');
      } else if (percent >= 50) {
        $resultContainer.addClass('summary-medium');
        if ($scoreStatusEl.length) $scoreStatusEl.text('Удовлетворительный уровень соответствия');
      } else {
        $resultContainer.addClass('summary-low');
        if ($scoreStatusEl.length) $scoreStatusEl.text('Есть несоответствия (требуется доработка)');
      }
    }

    saveToStorage();
  }

  function saveToStorage() {
    var data = {};
    var $items = $checklistForm.find('.checklist-item');

    $items.each(function (index) {
      var $item = $(this);
      var $selectedRadio = $item.find('input[type="radio"]:checked');
      var $commentInput = $item.find('.item-comment');
      data['item_' + index] = {
        status: $selectedRadio.length ? $selectedRadio.val() : '',
        comment: $commentInput.length ? $commentInput.val() : ''
      };
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // Уведомление о сохранении результатов чек-листа (Задание 6)
    showAppNotification('Результаты чек-листа успешно сохранены!', 'success');
  }

  function loadFromStorage() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      var data = JSON.parse(saved);
      var $items = $checklistForm.find('.checklist-item');

      $items.each(function (index) {
        var $item = $(this);
        var itemData = data['item_' + index];
        if (itemData) {
          if (itemData.status) {
            var $radio = $item.find('input[value="' + itemData.status + '"]');
            if ($radio.length) $radio.prop('checked', true);
          }
          var $commentInput = $item.find('.item-comment');
          if ($commentInput.length && itemData.comment) {
            $commentInput.val(itemData.comment);
          }
        }
      });
      calculateResults();
    } catch (e) {
      console.error('Ошибка при загрузке данных:', e);
    }
  }

  $checklistForm.on('change', calculateResults);
  $checklistForm.on('input', saveToStorage);

  if ($clearBtn.length) {
    $clearBtn.on('click', function () {
      if (confirm('Вы действительно хотите полностью очистить сохранённые результаты проверки?')) {
        localStorage.removeItem(STORAGE_KEY);
        $checklistForm[0].reset();
        $checklistForm.find('.checklist-item').removeClass('item-warning');
        if ($scorePercentEl.length) $scorePercentEl.text('0%');
        if ($progressFill.length) $progressFill.css('width', '0%');
        if ($scoreStatusEl.length) $scoreStatusEl.text('Оценка не проведена');
        if ($resultContainer.length) {
          $resultContainer.removeClass('summary-high summary-medium summary-low').addClass('summary-none');
        }
        showAppNotification('Результаты чек-листа очищены.', 'success');
      }
    });
  }

  loadFromStorage();
}

/* ==========================================================================
   ЗАДАНИЕ 6: Реестр записей с уведомлением об ошибке загрузки
   ========================================================================== */
function initRegistryCatalog() {
  var $tbody = $('#registry-tbody');
  if (!$tbody.length) return;

  var $search = $('#registry-search');
  var $sectionFilter = $('#registry-section-filter');
  var $counter = $('#registry-counter');
  var $resetBtn = $('#reset-registry-btn');

  var $sortAscBtn = $('#sort-date-asc');
  var $sortDescBtn = $('#sort-date-desc');
  var currentSortOrder = 'desc';

  var allRecords = [];

  $.getJSON('assets/data/records.json')
    .done(function (data) {
      if (!Array.isArray(data) || data.length === 0) {
        $tbody.html('<tr><td colspan="6" style="text-align:center; color:#dc2626; padding:20px;">⚠️ В файле ничего не нету.</td></tr>');
        $counter.text('Файл пустой');
        return;
      }
      allRecords = data;
      applyFilters();
      initAsyncStatistics(data);
    })
    .fail(function (jqxhr, textStatus, error) {
      console.error("Ошибка загрузки файла:", error);
      $tbody.html('<tr><td colspan="6" style="text-align:center; color:#dc2626; padding:20px;">❌ Ошибка загрузки каталога.</td></tr>');
      $counter.text('Ошибка загрузки');

      // Уведомление об ошибке загрузки данных каталога (Задание 6)
      showAppNotification('Ошибка загрузки данных каталога!', 'error');
    });

  function renderTable(records, searchQuery) {
    $tbody.empty();

    if (records.length === 0) {
      $tbody.html('<tr><td colspan="6" style="text-align:center; padding:30px; color:#64748b;">По вашему запросу ничего не найдено.</td></tr>');
      $counter.text('Найдено записей: 0');
      return;
    }

    $counter.text('Найдено записей: ' + records.length);

    records.forEach(function (rec, index) {
      var titleHtml = rec.title;
      var annotHtml = rec.annotation;

      if (searchQuery) {
        var regex = new RegExp('(' + searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        titleHtml = titleHtml.replace(regex, '<mark>$1</mark>');
        annotHtml = annotHtml.replace(regex, '<mark>$1</mark>');
      }

      var $tr = $('<tr>', { style: 'display: none;' });
      $tr.html(
        '<th scope="row">' + rec.number + '</th>' +
        '<td><strong>' + titleHtml + '</strong></td>' +
        '<td><span style="background:#e0f2fe; color:#0369a1; padding:3px 8px; border-radius:6px; font-size:0.85rem;">' + rec.category + '</span></td>' +
        '<td>' + rec.date + '</td>' +
        '<td><code>' + rec.section + '</code></td>' +
        '<td>' + annotHtml + '</td>'
      );

      $tbody.append($tr);
      $tr.delay(index * 60).fadeIn(400);
    });
  }

  function applyFilters() {
    var query = $search.val().trim().toLowerCase();
    var selectedSection = $sectionFilter.val();

    var filtered = allRecords.filter(function (rec) {
      var matchQuery = !query || rec.title.toLowerCase().indexOf(query) !== -1 || rec.annotation.toLowerCase().indexOf(query) !== -1;
      var matchSection = !selectedSection || rec.section === selectedSection;
      return matchQuery && matchSection;
    });

    filtered.sort(function (a, b) {
      var dateA = new Date(a.date);
      var dateB = new Date(b.date);
      return currentSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    renderTable(filtered, query);
  }

  if ($sortAscBtn.length) {
    $sortAscBtn.on('click', function () {
      currentSortOrder = 'asc';
      applyFilters();
    });
  }

  if ($sortDescBtn.length) {
    $sortDescBtn.on('click', function () {
      currentSortOrder = 'desc';
      applyFilters();
    });
  }

  if ($search.length) $search.on('input', applyFilters);
  if ($sectionFilter.length) $sectionFilter.on('change', applyFilters);

  if ($resetBtn.length) {
    $resetBtn.on('click', function () {
      $search.val('');
      $sectionFilter.val('');
      currentSortOrder = 'desc';
      applyFilters();
    });
  }
}

/* ==========================================================================
   Асинхронный подсчёт статистики и гистограммы через setInterval
   ========================================================================== */
function initAsyncStatistics(records) {
  var $statusEl = $('#async-stats-status');
  var $contentEl = $('#async-stats-content');

  if (!$statusEl.length || !$contentEl.length) return;

  $statusEl.text('⏳ Выполняется асинхронный сбор данных...');
  $contentEl.empty();

  var steps = [
    'Анализ структуры каталога...',
    'Группировка записей по категориям...',
    'Подсчёт распределения по разделам...',
    'Построение гистограмм...'
  ];

  var currentStep = 0;

  var intervalId = setInterval(function () {
    if (currentStep < steps.length) {
      $statusEl.text('⏳ ' + steps[currentStep]);
      currentStep++;
    } else {
      clearInterval(intervalId);
      $statusEl.text('Расчёт успешно завершён (асинхронная обработка).');

      var categoriesCount = {};
      var sectionsCount = {};
      var total = records.length;

      records.forEach(function (rec) {
        categoriesCount[rec.category] = (categoriesCount[rec.category] || 0) + 1;
        sectionsCount[rec.section] = (sectionsCount[rec.section] || 0) + 1;
      });

      var catHtml = '<div class="stat-group"><strong>По категориям:</strong>';
      for (var cat in categoriesCount) {
        var count = categoriesCount[cat];
        var percent = Math.round((count / total) * 100);
        catHtml += '<div style="margin-top: 8px; font-size: 0.9rem;">' + cat + ' (' + count + ')</div>' +
          '<div class="stat-bar-container">' +
          '<div class="stat-bar-track"><div class="stat-bar-fill" style="width: 0%;" data-width="' + percent + '%"></div></div>' +
          '<span style="font-size: 0.85rem; color: #64748b; min-width: 35px;">' + percent + '%</span>' +
          '</div>';
      }
      catHtml += '</div>';

      var secHtml = '<div class="stat-group"><strong>По разделам проекта:</strong>';
      for (var sec in sectionsCount) {
        var count = sectionsCount[sec];
        var percent = Math.round((count / total) * 100);
        secHtml += '<div style="margin-top: 8px; font-size: 0.9rem;">' + sec + ' (' + count + ')</div>' +
          '<div class="stat-bar-container">' +
          '<div class="stat-bar-track"><div class="stat-bar-fill" style="width: 0%;" data-width="' + percent + '%"></div></div>' +
          '<span style="font-size: 0.85rem; color: #64748b; min-width: 35px;">' + percent + '%</span>' +
          '</div>';
      }
      secHtml += '</div>';

      $contentEl.html(catHtml + secHtml);

      setTimeout(function () {
        $contentEl.find('.stat-bar-fill').each(function () {
          var targetWidth = $(this).attr('data-width');
          $(this).css('width', targetWidth);
        });
      }, 100);
    }
  }, 400);
}

/* ==========================================================================
   Datepicker
   ========================================================================== */
function initDatePicker() {
  var $dateInput = $('#check-date');
  if (!$dateInput.length) return;

  // Настройка русской локализации
  $.datepicker.regional['ru'] = {
    closeText: 'Закрыть',
    prevText: '&#x3C;Пред',
    nextText: 'След&#x3E;',
    currentText: 'Сегодня',
    monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    dayNames: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
    dayNamesShort: ['вск', 'пнд', 'втр', 'срд', 'чтв', 'птн', 'сбт'],
    dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    dateFormat: 'dd.mm.yy',
    firstDay: 1
  };

  $.datepicker.setDefaults($.datepicker.regional['ru']);

  // Инициализация с защитой для мобильных устройств
  $dateInput.datepicker({
    showAnim: 'fadeIn',
    maxDate: '+1m',
    changeMonth: true,
    changeYear: true,
    // Запрещаем вызов мобильной клавиатуры при клике на календарь
    beforeShow: function (input, inst) {
      $(input).attr('readonly', 'readonly');
    },
    onClose: function (dateText, inst) {
      $(this).removeAttr('readonly');
    }
  });
}

/* ==========================================================================
   Форма проверки знаний
   ========================================================================== */
function initKnowledgeForm() {
  var $form = $('#knowledge-form');
  if (!$form.length) return;

  // Инициализация EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init({
      publicKey: "Ie-7AdJAHNzqZiaKZ", 
    });
  }

  // Функция для визуальной подсветки отдельного поля
  function validateField($input, errorId, condition) {
    var $errorEl = $('#' + errorId);
    if (condition) {
      $input.removeClass('error').addClass('valid');
      if ($errorEl.length) $errorEl.hide();
      return true;
    } else {
      $input.removeClass('valid').addClass('error');
      if ($errorEl.length) $errorEl.show();
      return false;
    }
  }

  // Живая проверка прямо при вводе или уходе из поля (blur/input)
  $('#student-name').on('input blur', function () {
    validateField($(this), 'error-student-name', $(this).val().trim().length >= 2);
  });
  $('#student-group').on('input blur', function () {
    validateField($(this), 'error-student-group', $(this).val().trim().length > 0);
  });
  $('#check-date').on('change blur', function () {
    validateField($(this), 'error-check-date', $(this).val().trim().length > 0);
  });
  $('#check-number').on('input blur', function () {
    var val = parseInt($(this).val(), 10);
    validateField($(this), 'error-check-number', !isNaN(val) && val >= 1 && val <= 10);
  });
  $('#student-email').on('input blur', function () {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    validateField($(this), 'error-student-email', emailRegex.test($(this).val().trim()));
  });

  // Обработка отправки формы (Submit)
  $form.on('submit', function (e) {
    e.preventDefault(); // Предотвращаем стандартную перезагрузку страницы

    var nameVal = $('#student-name').val().trim();
    var groupVal = $('#student-group').val().trim();
    var dateVal = $('#check-date').val().trim();
    var numVal = parseInt($('#check-number').val(), 10);
    var emailVal = $('#student-email').val().trim();
    var selfAssessment = $('#self-assessment-slider').slider('value') || 5;
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Проверяем каждое поле и собираем массив ошибок для общего alert
    var errorList = [];

    var isNameValid = nameVal.length >= 2;
    if (!isNameValid) {
      errorList.push('• Поле «Фамилия и имя обучающегося» заполнено неверно (требуется минимум 2 символа).');
    }
    validateField($('#student-name'), 'error-student-name', isNameValid);

    var isGroupValid = groupVal.length > 0;
    if (!isGroupValid) {
      errorList.push('• Поле «Учебная группа» не должно быть пустым.');
    }
    validateField($('#student-group'), 'error-student-group', isGroupValid);

    var isDateValid = dateVal.length > 0;
    if (!isDateValid) {
      errorList.push('• Не заполнено поле «Дата проверки» (выберите дату в календаре).');
    }
    validateField($('#check-date'), 'error-check-date', isDateValid);

    var isNumValid = !isNaN(numVal) && numVal >= 1 && numVal <= 10;
    if (!isNumValid) {
      errorList.push('• Поле «Номер проверки» должно содержать число в диапазоне от 1 до 10.');
    }
    validateField($('#check-number'), 'error-check-number', isNumValid);

    var isEmailValid = emailRegex.test(emailVal);
    if (!isEmailValid) {
      errorList.push('• Поле «Электронная почта» заполнено некорректно (пример: example@domain.by).');
    }
    validateField($('#student-email'), 'error-student-email', isEmailValid);

    // Если есть хотя бы одна ошибка — показываем общий alert и прерываем отправку
    if (errorList.length > 0) {
      alert("Пожалуйста, исправьте следующие ошибки перед отправкой формы:\n\n" + errorList.join("\n"));
      return;
    }

    // Если всё заполнено верно, формируем объект с правильными ключами с нижним подчеркиванием (_):
    var submissionResult = {
      student_name: nameVal,
      student_group: groupVal,
      check_date: dateVal,
      check_number: numVal,
      student_email: emailVal,
      self_assessment: selfAssessment,
      time: new Date().toLocaleString()
    };

    // Сохранение в localStorage
    try {
      localStorage.setItem('knowledge_submission_result', JSON.stringify(submissionResult));
    } catch (err) {
      console.error('Ошибка сохранения в localStorage:', err);
    }

    // Вывод модального окна с подтверждением успеха
    var confirmationHtml = 
      '<p style="color: #16a34a; font-weight: 700; font-size: 1.1rem; margin-bottom: 10px;">✅ Форма успешно отправлена и сохранена!</p>' +
      '<p><strong>Обучающийся:</strong> ' + nameVal + ' (' + groupVal + ')</p>' +
      '<p><strong>Дата проверки:</strong> ' + dateVal + ' (Проверка № ' + numVal + ')</p>' +
      '<p><strong>Email:</strong> ' + emailVal + '</p>' +
      '<p><strong>Самооценка:</strong> ' + selfAssessment + ' из 10</p>';

    if ($('#result-dialog').length) {
      $('#dialog-content-text').html(confirmationHtml);
      $('#result-dialog').dialog('open');
    } else {
      alert('Форма успешно отправлена!');
    }

    // Отправка письма на почту через EmailJS
    if (typeof emailjs !== 'undefined') {
      var $submitBtn = $form.find('button[type="submit"]');
      var originalBtnText = $submitBtn.text();
      $submitBtn.prop('disabled', true).text('Отправка на почту...');

      emailjs.send('service_c9az3se', 'template_yrnl1ul', submissionResult)
        .then(function() {
           console.log('Письмо успешно отправлено на почту.');
        })
        .catch(function(error) {
           console.warn('Ошибка EmailJS:', error);
        })
        .finally(function() {
           $submitBtn.prop('disabled', false).text(originalBtnText);
        });
    }
  });
}

/* ==========================================================================
   Аккордеон вопросов
   ========================================================================== */
function initQuestionsAccordion() {
  var $accordion = $('#questions-accordion');
  if (!$accordion.length) return;

  $accordion.accordion({
    collapsible: true,
    heightStyle: "content",
    active: 0
  });

  $(document).on('change', '.quiz-option input[type="radio"]', function () {
    var name = $(this).attr('name');
    $('input[name="' + name + '"]').closest('.quiz-option').removeClass('selected');
    $(this).closest('.quiz-option').addClass('selected');
  });
}

/* ==========================================================================
   Индикатор прогресса
   ========================================================================== */
function initQuizProgress() {
  var $progressbar = $('#quiz-progressbar');
  var $progressText = $('#progress-text');
  if (!$progressbar.length) return;

  $progressbar.progressbar({ value: 0 });

  $(document).on('change', '.quiz-question input[type="radio"]', function () {
    var answeredCount = 0;
    var totalQuestions = 10;

    for (var i = 1; i <= totalQuestions; i++) {
      if ($('input[name="q' + i + '"]:checked').length > 0) {
        answeredCount++;
      }
    }

    var percent = Math.round((answeredCount / totalQuestions) * 100);
    $progressbar.progressbar('option', 'value', percent);
    if ($progressText.length) {
      $progressText.text(answeredCount + ' из ' + totalQuestions + ' отвечено (' + percent + '%)');
    }
  });
}

/* ==========================================================================
   Слайдер
   ========================================================================== */
function initSelfAssessmentSlider() {
  var $slider = $('#self-assessment-slider');
  var $valueEl = $('#slider-value');
  if (!$slider.length) return;

  $slider.slider({
    range: "min",
    min: 1,
    max: 10,
    value: 5,
    slide: function (event, ui) {
      if ($valueEl.length) $valueEl.text(ui.value);
    }
  });
}

/* ==========================================================================
   Сортировка
   ========================================================================== */
function initSortableSteps() {
  var $sortableList = $('#sortable-steps');
  if (!$sortableList.length) return;

  $sortableList.sortable({
    placeholder: "ui-state-highlight",
    cursor: "grabbing",
    opacity: 0.8,
    axis: "y",   
    delay: 150,    
    distance: 5     
  });
  $sortableList.disableSelection();
}

/* ==========================================================================
   Диалоговое окно результатов
   ========================================================================== */
function initResultDialog() {
  var $dialog = $('#result-dialog');
  if (!$dialog.length) return;

  $dialog.dialog({
    autoOpen: false,
    modal: true,
    width: 520,
    resizable: false,
    draggable: true,
    buttons: {
      "Закрыть": function () {
        $(this).dialog("close");
      }
    }
  });
}

function initCombinedCheck() {
  // Убедитесь, что здесь указан правильный id вашей кнопки
  var $checkBtn = $('#check-all-results-btn'); 
  if (!$checkBtn.length) return;

  var correctAnswers = {
    q1: 'b', q2: 'b', q3: 'b', q4: 'a', q5: 'b',
    q6: 'b', q7: 'a', q8: 'c', q9: 'c', q10: 'c'
  };

  $checkBtn.on('click', function () {
    var score = 0;
    var total = 10;
    
    // Подсчет баллов за тест
    for (var i = 1; i <= total; i++) {
      var qName = 'q' + i;
      var $selected = $('input[name="' + qName + '"]:checked');
      if ($selected.length && $selected.val() === correctAnswers[qName]) {
        score++;
      }
    }
    
    var percent = Math.round((score / total) * 100);
    
    // Определение уровня
    var levelTitle = '';
    var levelColor = '';
    if (percent >= 80) {
      levelTitle = 'Высокий';
      levelColor = '#16a34a';
    } else if (percent >= 50) {
      levelTitle = 'Удовлетворительный';
      levelColor = '#d97706';
    } else {
      levelTitle = 'Низкий';
      levelColor = '#dc2626';
    }

    // Проверка порядка шагов
    var isSortCorrect = true;
    var $sortableList = $('#sortable-steps');
    if ($sortableList.length) {
      $sortableList.find('.sortable-item').each(function (index) {
        var expectedStep = index + 1;
        var actualStep = parseInt($(this).attr('data-step'), 10);
        if (actualStep !== expectedStep) {
          isSortCorrect = false;
        }
      });
    }

    // Получение значения слайдера (если он есть, иначе ставим по умолчанию 5)
    var selfAssessment = 5;
    if ($('#self-assessment-slider').length && typeof $('#self-assessment-slider').slider === 'function') {
      try {
        selfAssessment = $('#self-assessment-slider').slider('value');
      } catch (e) {
        selfAssessment = 5;
      }
    }

    // Формирование HTML-содержимого для окна
    var dialogHtml = 
      '<p><strong>Результаты тестирования:</strong></p>' +
      '<ul>' +
        '<li>Правильных ответов: <strong>' + score + ' из ' + total + '</strong></li>' +
        '<li>Процент выполнения: <strong>' + percent + '%</strong></li>' +
        '<li>Определенный уровень: <span style="color: ' + levelColor + '; font-weight: 700;">' + levelTitle + '</span></li>' +
      '</ul>' +
      '<hr style="margin: 15px 0; border: 0; border-top: 1px solid #e2e8f0;">' +
      '<p><strong>Практическое задание (порядок шагов):</strong> ' + 
        (isSortCorrect ? '<span style="color: #16a34a; font-weight: 600;">Верно</span>' : '<span style="color: #dc2626; font-weight: 600;">Есть ошибки</span>') + '</p>' +
      '<p style="margin-top: 8px;"><strong>Самооценка уровня подготовки:</strong> ' + selfAssessment + ' из 10</p>';

    var $dialogContent = $('#dialog-content-text');
    if ($dialogContent.length) {
      $dialogContent.html(dialogHtml); // Заполняем текстом
    }

    var $resultDialog = $('#result-dialog');
    if ($resultDialog.length) {
      $resultDialog.dialog('open'); // Открываем окно
    }
  });
}

/* ==========================================================================
   Валидация формы
   ========================================================================== */
function initFormValidation() {
  var $form = $('#knowledge-form');
  if (!$form.length) return;

  function validateField($input, errorId, condition) {
    var $errorEl = $('#' + errorId);
    if (condition) {
      $input.removeClass('error').addClass('valid');
      if ($errorEl.length) $errorEl.hide();
    } else {
      $input.removeClass('valid').addClass('error');
      if ($errorEl.length) $errorEl.show();
    }
  }

  $('#student-name').on('input', function () {
    var sanitizedVal = $(this).val().replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, '');
    $(this).val(sanitizedVal);
    validateField($(this), 'error-student-name', sanitizedVal.trim().length >= 2);
  });
}

/* ==========================================================================
   Модальные окна с возвратом фокуса
   ========================================================================== */
function initModalsWithFocusReturn() {
  var $stepsModal = $('#steps-modal');
  var $openStepsBtn = $('#open-steps-modal-btn');
  var $closeStepsBtn = $('#close-steps-modal-btn');
  var lastActiveElement = null;

  function openStepsModal() {
    lastActiveElement = document.activeElement;
    $stepsModal.show();
    if ($closeStepsBtn.length) $closeStepsBtn.focus();
  }

  function closeStepsModal() {
    $stepsModal.hide();
    if (lastActiveElement) $(lastActiveElement).focus();
  }

  if ($openStepsBtn.length && $stepsModal.length) {
    $openStepsBtn.on('click', openStepsModal);
    if ($closeStepsBtn.length) $closeStepsBtn.on('click', closeStepsModal);
  }
}
/* ==========================================================================
   ЗАДАНИЕ 7: Фильтрация «Только несоответствия» в каталоге/реестре
   ========================================================================== */
function initMismatchesFilter() {
  var $checkbox = $('#filter-mismatches-only');
  if (!$checkbox.length) return;

  $checkbox.on('change', function () {
    var showOnlyMismatches = $(this).is(':checked');

    // Если находимся в чек-листе или таблице с предупреждениями
    var $items = $('.checklist-item, #registry-tbody tr');

    $items.each(function () {
      var $el = $(this);
      if (showOnlyMismatches) {
        // Проверяем наличие класса ошибки/несоответствия (например, item-warning)
        if ($el.hasClass('item-warning') || $el.find('.item-warning').length > 0) {
          $el.show();
        } else {
          $el.hide();
        }
      } else {
        $el.show();
      }
    });
  });
}
/* ==========================================================================
   Модальное окно «Порядок действий по теме»
   ========================================================================== */
function initStepsModal() {
  var $modal = $('#steps-modal');
  // Селектор вашей кнопки (если у нее другой id или класс, замените #open-steps-modal-btn)
  var $openBtn = $('#open-steps-modal-btn'); 

  if (!$modal.length || !$openBtn.length) return;

  // Инициализация виджета jQuery UI Dialog
  $modal.dialog({
    autoOpen: false,
    modal: true,
    width: 520,
    resizable: false,
    draggable: true,
    show: { effect: "fade", duration: 250 },
    hide: { effect: "fade", duration: 200 },
    buttons: {
      "Закрыть окно": function () {
        $(this).dialog("close");
      }
    }
  });

  // Открытие по клику на кнопку
  $openBtn.on('click', function (e) {
    e.preventDefault();
    $modal.dialog('open');
  });
}
