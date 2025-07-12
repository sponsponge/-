document.addEventListener('DOMContentLoaded', () => {
    // Елементи DOM
    const tocList = document.getElementById('toc-list');
    const poemSections = document.querySelectorAll('.poem-section');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.getElementById('searchIcon');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('openSidebarBtn');
    const closeSidebarBtn = document.querySelector('.close-sidebar-btn');
    const overlay = document.getElementById('overlay');

    // Кнопки фільтрів "Вибране" та "Випадковий вірш"
    const favoriteFilterButton = document.getElementById('favoriteFilterBtn');
    const randomPoemBtn = document.getElementById('randomPoemBtn');
    const readFilterButton = document.getElementById('readFilterBtn');

    // Елементи для віджету "Вірш дня"
    const poemOfTheDayWidget = document.getElementById('poemOfTheDayWidget');
    const podTitle = document.getElementById('podTitle');
    const podLink = document.getElementById('podLink');

    // Зберігаємо активні фільтри
    let activeFilters = new Set(['all']); // За замовчуванням "all" активний

    // Отримуємо збережені улюблені вірші з localStorage
    let favoritePoems = JSON.parse(localStorage.getItem('favoritePoems')) || [];

    // Зберігаємо оцінки віршів у localStorage (формат: { poemId: score })
    let poemRatings = JSON.parse(localStorage.getItem('poemRatings')) || {};

    // Зберігаємо прочитані вірші у localStorage (масив ID)
    let readPoems = JSON.parse(localStorage.getItem('readPoems')) || [];

    // Зберігаємо список віршів для швидкого доступу (для пошуку)
    const allPoemData = Array.from(poemSections).map(poem => ({
        id: poem.id,
        title: poem.querySelector('.poem-title').textContent,
        text: poem.querySelector('.poem-text pre').textContent
    }));

    let activeSearchResultIndex = -1; // Для навігації по результатах пошуку клавіатурою

    // --- Функції ---

    // Функція для збереження улюблених віршів в localStorage
    function saveFavorites() {
        localStorage.setItem('favoritePoems', JSON.stringify(favoritePoems));
    }

    // Функція для збереження оцінок віршів в localStorage
    function saveRatings() {
        localStorage.setItem('poemRatings', JSON.stringify(poemRatings));
    }

    // Функція для збереження прочитаних віршів в localStorage
    function saveReadPoems() {
        localStorage.setItem('readPoems', JSON.stringify(readPoems));
    }

    // Функція для оновлення видимості віршів та елементів змісту
    function updatePoemVisibility() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        const isAllFilterActive = activeFilters.has('all') && activeFilters.size === 1;
        const noFiltersActive = activeFilters.size === 0;

        poemSections.forEach(poem => {
            const poemTitle = poem.querySelector('.poem-title').textContent.toLowerCase();
            const poemText = poem.querySelector('.poem-text pre').textContent.toLowerCase();
            const poemLang = poem.dataset.lang;
            const poemThemes = poem.dataset.theme ? poem.dataset.theme.split(',').map(t => t.trim()).filter(Boolean) : [];
            const poemId = poem.id;

            let isVisibleBySearch = true;
            if (searchTerm !== '') {
                isVisibleBySearch = poemTitle.includes(searchTerm) || poemText.includes(searchTerm);
            }

            let isVisibleByFilter = false;
            if (searchTerm === '') {
                if (isAllFilterActive || noFiltersActive) {
                    isVisibleByFilter = true;
                } else {
                    for (const filter of activeFilters) {
                        if (filter === 'ukrainian' && poemLang === 'ukrainian') {
                            isVisibleByFilter = true;
                            break;
                        }
                        if (filter === 'russian' && poemLang === 'russian') {
                            isVisibleByFilter = true;
                            break;
                        }
                        if (filter === 'favorites' && favoritePoems.includes(poemId)) {
                            isVisibleByFilter = true;
                            break;
                        }
                        if (filter === 'read' && readPoems.includes(poemId)) {
                            isVisibleByFilter = true;
                            break;
                        }
                        if (poemThemes.includes(filter)) {
                            isVisibleByFilter = true;
                            break;
                        }
                    }
                }
            } else {
                isVisibleByFilter = true;
            }

            const isPoemVisible = (searchTerm !== '') ? isVisibleBySearch : isVisibleByFilter;

            if (isPoemVisible) {
                poem.classList.remove('hidden');
                poem.style.display = 'block';
            } else {
                poem.classList.add('hidden');
                poem.style.display = 'none';
            }
        });

        const tocItems = tocList.querySelectorAll('li');
        tocItems.forEach(item => {
            const itemTitle = item.querySelector('a').textContent.toLowerCase();
            const itemLang = item.querySelector('a').dataset.lang;
            const itemThemes = item.querySelector('a').dataset.theme ? item.querySelector('a').dataset.theme.split(',').map(t => t.trim()).filter(Boolean) : [];
            const itemId = item.querySelector('a').href.split('#')[1];

            let isTocVisibleBySearch = true;
            if (searchTerm !== '') {
                isTocVisibleBySearch = itemTitle.includes(searchTerm);
            }

            let isTocVisibleByFilter = false;
            if (searchTerm === '') {
                if (isAllFilterActive || noFiltersActive) {
                    isTocVisibleByFilter = true;
                } else {
                    for (const filter of activeFilters) {
                        if (filter === 'ukrainian' && itemLang === 'ukrainian') {
                            isTocVisibleByFilter = true;
                            break;
                        }
                        if (filter === 'russian' && itemLang === 'russian') {
                            isTocVisibleByFilter = true;
                            break;
                        }
                        if (filter === 'favorites' && favoritePoems.includes(itemId)) {
                            isTocVisibleByFilter = true;
                            break;
                        }
                        if (filter === 'read' && readPoems.includes(itemId)) {
                            isTocVisibleByFilter = true;
                            break;
                        }
                        if (itemThemes.includes(filter)) {
                            isTocVisibleByFilter = true;
                            break;
                        }
                    }
                }
            } else {
                isVisibleByFilter = true;
            }

            const isTocVisible = (searchTerm !== '') ? isTocVisibleBySearch : isTocVisibleByFilter;

            item.style.display = isTocVisible ? 'block' : 'none';
        });
    }

    // Функція для оновлення стану кнопок "Вибране"
    function updateFavoriteButtonsState() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const poemId = btn.dataset.poemId;
            if (favoritePoems.includes(poemId)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Функція для оновлення стану кнопок фільтрів
    function updateFilterButtonsState() {
        filterButtons.forEach(button => {
            if (activeFilters.has(button.dataset.filter)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // Функція для обробки поділу вірша
    function sharePoem(poemTitle, poemText, poemUrl) {
        if (navigator.share) {
            navigator.share({
                title: poemTitle,
                text: poemText.substring(0, 150) + '...',
                url: poemUrl,
            }).then(() => {
                console.log('Вірш успішно поділено!');
            }).catch((error) => {
                console.error('Помилка при спробі поділитися:', error);
            });
        } else {
            alert(`Щоб поділитися, скопіюйте посилання та назву:\n\nНазва: ${poemTitle}\nПосилання: ${poemUrl}`);
            navigator.clipboard.writeText(poemUrl).then(() => {
                console.log('Посилання на вірш скопійовано!');
            }).catch(err => {
                console.error('Не вдалося скопіювати посилання:', err);
            });
        }
    }

    // Функція для ініціалізації зірочок та відображення оцінок
    function initializeRatings(poemId) {
        const ratingContainer = document.querySelector(`#${poemId} .poem-rating`);
        if (!ratingContainer) return;

        ratingContainer.innerHTML = ''; // Очищаємо контейнер перед додаванням зірочок

        const userScore = poemRatings[poemId] || 0; // Оцінка, яку поставив користувач
        const totalRatingDiv = document.createElement('div');
        totalRatingDiv.classList.add('total-rating');
        const currentRating = calculateAverageRating(poemId); // Обчислюємо середню оцінку
        totalRatingDiv.textContent = currentRating > 0 ? `Середня оцінка: ${currentRating.toFixed(1)} ⭐` : 'Будьте першим, хто оцінить!';
        ratingContainer.appendChild(totalRatingDiv);


        const starsDiv = document.createElement('div');
        starsDiv.classList.add('stars');
        starsDiv.dataset.poemId = poemId; // Зберігаємо ID вірша для обробників


        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.classList.add('star');
            star.dataset.value = i;
            star.innerHTML = '&#9733;'; // Символ зірочки
            if (i <= userScore) {
                star.classList.add('rated'); // Заповнюємо зірочки, які відповідають оцінці користувача
            }
            starsDiv.appendChild(star);
        }

        ratingContainer.appendChild(starsDiv);

        // Обробники подій для зірочок
        starsDiv.addEventListener('mouseover', (e) => {
            const hoveredValue = parseInt(e.target.dataset.value);
            if (!isNaN(hoveredValue)) {
                Array.from(starsDiv.children).forEach(star => {
                    if (parseInt(star.dataset.value) <= hoveredValue) {
                        star.classList.add('hover');
                    } else {
                        star.classList.remove('hover');
                    }
                });
            }
        });

        starsDiv.addEventListener('mouseout', () => {
            Array.from(starsDiv.children).forEach(star => star.classList.remove('hover'));
        });

        starsDiv.addEventListener('click', (e) => {
            const clickedValue = parseInt(e.target.dataset.value);
            if (!isNaN(clickedValue)) {
                poemRatings[poemId] = clickedValue; // Зберігаємо оцінку користувача
                saveRatings(); // Зберігаємо в localStorage

                // Оновлюємо вигляд зірочок
                Array.from(starsDiv.children).forEach(star => {
                    if (parseInt(star.dataset.value) <= clickedValue) {
                        star.classList.add('rated');
                    } else {
                        star.classList.remove('rated');
                    }
                });

                // Оновлюємо середню оцінку
                totalRatingDiv.textContent = `Середня оцінка: ${calculateAverageRating(poemId).toFixed(1)} ⭐`;
            }
        });
    }

    // Функція для обчислення середньої оцінки
    function calculateAverageRating(poemId) {
        // У вашій поточній реалізації, ви зберігаєте лише одну оцінку користувача.
        // Для справжньої "середньої оцінки" вам потрібно було б зберігати масив оцінок.
        // Залишаю це як є, з огляду на поточну архітектуру localStorage.
        return poemRatings[poemId] || 0;
    }

    // Функція для оновлення стану кнопки "Прочитано" та візуального відображення
    function updateReadStatus(poemId, isRead) {
        const poemSection = document.getElementById(poemId);
        const tocLink = tocList.querySelector(`a[href="#${poemId}"]`);

        if (poemSection) {
            if (isRead) {
                poemSection.classList.add('read-poem');
            } else {
                poemSection.classList.remove('read-poem');
            }
        }

        if (tocLink) {
            const tocItem = tocLink.closest('li');
            if (tocItem) {
                if (isRead) {
                    tocItem.classList.add('read-poem-toc');
                } else {
                    tocItem.classList.remove('read-poem-toc');
                }
            }
        }

        // Оновлюємо стан кнопки "Прочитано"
        const readBtn = document.querySelector(`#${poemId} .read-btn`);
        if (readBtn) {
            if (isRead) {
                readBtn.classList.add('active');
                readBtn.title = 'Позначити як непрочитане';
            } else {
                readBtn.classList.remove('active');
                readBtn.title = 'Позначити як прочитане';
            }
        }
    }

    // Функція для ініціалізації "Вірша дня"
    function initializePoemOfTheDay() {
        const today = new Date().toDateString(); // Отримуємо поточну дату без часу
        const savedPodData = JSON.parse(localStorage.getItem('poemOfTheDay')) || {};

        let currentPodId = savedPodData.id;
        let savedPodDate = savedPodData.date;

        // Якщо дата змінилася або вірша дня ще немає
        if (today !== savedPodDate || !currentPodId) {
            // Вибираємо випадковий вірш з усіх доступних
            const allPoemIds = allPoemData.map(p => p.id); // Використовуємо allPoemData
            if (allPoemIds.length > 0) {
                const randomIndex = Math.floor(Math.random() * allPoemIds.length);
                currentPodId = allPoemIds[randomIndex];
            } else {
                console.warn("Немає віршів для вибору 'Вірша дня'.");
                podTitle.textContent = "Немає віршів.";
                podLink.style.display = 'none';
                return;
            }

            // Зберігаємо новий вірш дня та дату
            localStorage.setItem('poemOfTheDay', JSON.stringify({
                id: currentPodId,
                date: today
            }));
        }

        // Відображаємо вірш дня
        const podPoem = document.getElementById(currentPodId);
        if (podPoem) {
            const title = podPoem.querySelector('.poem-title').textContent;
            podTitle.textContent = title;
            podLink.href = `#${currentPodId}`;
            podLink.style.display = 'inline'; // Показуємо посилання
            podLink.onclick = (e) => {
                e.preventDefault();
                podPoem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Закриваємо сайдбар після переходу
                sidebar.classList.remove('open');
                overlay.classList.remove('show');
                document.body.classList.remove('sidebar-open');
            };
        } else {
            podTitle.textContent = "Вірш не знайдено.";
            podLink.style.display = 'none';
        }
    }


    // Функція для відображення підказок пошуку
    function displaySearchResults(results) {
        searchResultsContainer.innerHTML = '';
        activeSearchResultIndex = -1; // Скидаємо індекс активного елемента

        if (results.length > 0 && searchInput.value.trim() !== '') {
            results.forEach((poem, index) => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('search-result-item');
                resultItem.textContent = poem.title;
                resultItem.dataset.poemId = poem.id; // Зберігаємо ID вірша

                resultItem.addEventListener('click', () => {
                    searchInput.value = poem.title; // Заповнюємо поле пошуку назвою вірша
                    scrollToPoem(poem.id);
                    searchResultsContainer.style.display = 'none'; // Приховуємо підказки
                });

                searchResultsContainer.appendChild(resultItem);
            });
            searchResultsContainer.style.display = 'block'; // Показуємо контейнер
        } else {
            searchResultsContainer.style.display = 'none'; // Приховуємо, якщо немає результатів або поле порожнє
        }
    }

    // Функція для прокрутки до вірша
    function scrollToPoem(poemId) {
        const poemElement = document.getElementById(poemId);
        if (poemElement) {
            poemElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Можна додати тимчасове виділення вірша, щоб він був помітніший
            poemElement.classList.add('highlight-poem');
            setTimeout(() => {
                poemElement.classList.remove('highlight-poem');
            }, 2000); // Прибрати виділення через 2 секунди
        }
        // Закриваємо сайдбар після вибору вірша
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        document.body.classList.remove('sidebar-open');
    }


    // --- Обробники подій ---

    const tocItemsArray = [];
    poemSections.forEach(poem => {
        const title = poem.querySelector('.poem-title').textContent;
        const fullPoemText = poem.querySelector('.poem-text pre').textContent;
        const id = poem.id;
        const lang = poem.dataset.lang;
        const themes = poem.dataset.theme;

        // Додаємо кнопку "Вибране"
        const favoriteBtn = document.createElement('button');
        favoriteBtn.classList.add('favorite-btn');
        favoriteBtn.dataset.poemId = id;
        favoriteBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        `;
        const poemTitleElement = poem.querySelector('.poem-title');
        if (poemTitleElement) {
            poemTitleElement.insertAdjacentElement('afterend', favoriteBtn);
        } else {
            console.warn(`Poem section with ID ${id} does not have a .poem-title element.`);
            poem.prepend(favoriteBtn);
        }

        favoriteBtn.addEventListener('click', () => {
            if (favoritePoems.includes(id)) {
                favoritePoems = favoritePoems.filter(poemId => poemId !== id);
            } else {
                favoritePoems.push(id);
            }
            saveFavorites();
            updateFavoriteButtonsState();
            // Якщо активний фільтр "favorites", потрібно оновити видимість
            if (activeFilters.has('favorites')) {
                updatePoemVisibility();
            }
        });

        // Додаємо кнопку "Поділитися"
        const shareBtn = document.createElement('button');
        shareBtn.classList.add('share-btn');
        shareBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-share-2">
                <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
        `;
        favoriteBtn.insertAdjacentElement('afterend', shareBtn);

        shareBtn.addEventListener('click', () => {
            const poemUrl = window.location.origin + window.location.pathname + `#${id}`;
            sharePoem(title, fullPoemText, poemUrl);
        });

        // Створюємо контейнер для оцінки (зірочок)
        const ratingContainer = document.createElement('div');
        ratingContainer.classList.add('poem-rating');
        shareBtn.insertAdjacentElement('afterend', ratingContainer); // Додаємо після кнопки "Поділитися"

        // Ініціалізуємо зірочки для цього вірша
        initializeRatings(id);

        // Додаємо кнопку "Прочитано"
        const readBtn = document.createElement('button');
        readBtn.classList.add('read-btn');
        readBtn.dataset.poemId = id;
        readBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-8.89"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        `;
        ratingContainer.insertAdjacentElement('afterend', readBtn); // Додаємо після контейнера з оцінками

        readBtn.addEventListener('click', () => {
            const poemId = readBtn.dataset.poemId;
            if (readPoems.includes(poemId)) {
                readPoems = readPoems.filter(pId => pId !== poemId);
                updateReadStatus(poemId, false);
            } else {
                readPoems.push(poemId);
                updateReadStatus(poemId, true);
            }
            saveReadPoems();
            // Якщо активний фільтр "read", то потрібно оновити видимість
            if (activeFilters.has('read')) {
                updatePoemVisibility();
            }
        });

        // Створення елементів для змісту
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = title;
        link.dataset.lang = lang;
        link.dataset.theme = themes;
        listItem.appendChild(link);

        tocItemsArray.push({
            listItem: listItem,
            title: title,
            id: id
        }); // Зберігаємо id для оновлення статусу
    });

    // Сортуємо масив за назвами віршів від А до Я
    tocItemsArray.sort((a, b) => {
        return a.title.localeCompare(b.title, 'uk', {
            sensitivity: 'base'
        });
    });

    // Додаємо відсортовані елементи до списку змісту
    tocItemsArray.forEach(item => {
        tocList.appendChild(item.listItem);
        // Оновлюємо статус "прочитано" для елементів змісту при завантаженні
        updateReadStatus(item.id, readPoems.includes(item.id));
    });


    // Функціонал фільтрації віршів (Multi-select)
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.dataset.filter;

            // searchContainer.classList.remove('active'); // Не згортаємо контейнер повністю
            searchInput.value = '';
            searchResultsContainer.style.display = 'none'; // Приховуємо підказки при зміні фільтрів

            // Якщо натиснуто "Всі вірші"
            if (filterValue === 'all') {
                activeFilters.clear();
                activeFilters.add('all');
            }
            // Якщо натиснуто фільтр "favorites" або "read"
            else if (filterValue === 'favorites' || filterValue === 'read') {
                // Якщо цей фільтр вже активний, вимикаємо його
                if (activeFilters.has(filterValue)) {
                    activeFilters.delete(filterValue);
                    // Якщо після цього не залишилось активних фільтрів, включаємо "all"
                    if (activeFilters.size === 0) {
                        activeFilters.add('all');
                    }
                }
                // Якщо цей фільтр не активний, вимикаємо всі інші і включаємо тільки його
                else {
                    activeFilters.clear();
                    activeFilters.add(filterValue);
                }
            }
            // Для інших фільтрів (мови, теми) - багатофільтр
            else {
                activeFilters.delete('all'); // Вимикаємо "all", якщо вмикаємо інший фільтр
                if (activeFilters.has(filterValue)) {
                    activeFilters.delete(filterValue);
                } else {
                    activeFilters.add(filterValue);
                }
                // Якщо після цього не залишилось активних фільтрів, включаємо "all"
                if (activeFilters.size === 0) {
                    activeFilters.add('all');
                }
            }

            updateFilterButtonsState();
            updatePoemVisibility();
        });
    });

    // Функціонал кнопки "Випадковий вірш"
    if (randomPoemBtn) {
        randomPoemBtn.addEventListener('click', () => {
            if (poemSections.length === 0) {
                console.warn("Немає віршів для відображення випадкового.");
                return;
            }

            // searchContainer.classList.remove('active'); // Не згортаємо контейнер повністю
            searchInput.value = '';
            searchResultsContainer.style.display = 'none'; // Приховуємо підказки
            activeFilters.clear();
            activeFilters.add('all'); // Скидаємо всі фільтри для випадкового вірша

            updateFilterButtonsState();
            updatePoemVisibility();

            const visiblePoems = Array.from(poemSections).filter(poem => !poem.classList.contains('hidden'));

            if (visiblePoems.length === 0) {
                console.warn("Немає видимих віршів для відображення випадкового.");
                return;
            }

            const randomIndex = Math.floor(Math.random() * visiblePoems.length);
            const randomPoem = visiblePoems[randomIndex];

            if (randomPoem) {
                randomPoem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Функціонал розгортання/згортання поля пошуку (Тільки приховуємо/показуємо, не згортаємо весь контейнер)
    searchIcon.addEventListener('click', () => {
        // Якщо поле пошуку приховане (ширина 0)
        if (searchInput.style.width === '0px' || searchInput.style.width === '') {
            searchInput.style.width = 'calc(100% - 50px)'; // Розширюємо поле
            searchInput.style.paddingLeft = '15px'; // Додаємо паддінг
            searchInput.style.paddingRight = '5px';
            searchInput.focus();
            searchContainer.classList.add('active'); // Додаємо клас активності для стилів
            // Приховуємо фільтри, якщо пошук активний і знаходимося на мобільній версії
            if (window.innerWidth <= 768) { // Припустимо 768px - це мобільна версія
                 sidebar.classList.remove('open');
                 overlay.classList.remove('show');
                 document.body.classList.remove('sidebar-open');
                 // Можливо, також тимчасово приховати інші елементи на сторінці, щоб поле пошуку було центром уваги
            }
        } else {
            searchInput.style.width = '0px'; // Згортаємо поле
            searchInput.style.paddingLeft = '0px'; // Прибираємо паддінг
            searchInput.style.paddingRight = '0px';
            searchInput.value = '';
            searchContainer.classList.remove('active'); // Видаляємо клас активності
            searchResultsContainer.style.display = 'none'; // Приховуємо підказки
            updatePoemVisibility(); // Оновлюємо видимість віршів
        }
        activeFilters.clear(); // Завжди скидаємо фільтри при активації/деактивації пошуку
        activeFilters.add('all');
        updateFilterButtonsState();
        updatePoemVisibility();
    });

    // Ініціалізація ширини поля пошуку при завантаженні
    searchInput.style.width = '0px';
    searchInput.style.paddingLeft = '0px';
    searchInput.style.paddingRight = '0px';


    // Функціонал пошуку за ключовими словами
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm.length > 0) {
            // Фільтруємо вірші за назвою
            const filteredPoems = allPoemData.filter(poem =>
                poem.title.toLowerCase().includes(searchTerm)
            );
            displaySearchResults(filteredPoems);
        } else {
            searchResultsContainer.style.display = 'none'; // Приховуємо підказки, якщо поле порожнє
        }
        updatePoemVisibility();
    });

    // Приховуємо підказки, якщо клікнуто за межами поля пошуку та результатів
    document.addEventListener('click', (event) => {
        if (!searchContainer.contains(event.target)) {
            searchResultsContainer.style.display = 'none';
        }
    });

    // Навігація по результатах пошуку за допомогою клавіатури
    searchInput.addEventListener('keydown', (e) => {
        const items = searchResultsContainer.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault(); // Запобігаємо прокрутці сторінки
            activeSearchResultIndex = (activeSearchResultIndex + 1) % items.length;
            highlightActiveSearchResult(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault(); // Запобігаємо прокрутці сторінки
            activeSearchResultIndex = (activeSearchResultIndex - 1 + items.length) % items.length;
            highlightActiveSearchResult(items);
        } else if (e.key === 'Enter') {
            e.preventDefault(); // Запобігаємо відправці форми
            if (activeSearchResultIndex > -1) {
                items[activeSearchResultIndex].click(); // Імітуємо клік
            } else {
                // Якщо Enter натиснуто без вибору, але з текстом в полі - виконуємо звичайний пошук
                updatePoemVisibility();
                searchResultsContainer.style.display = 'none';
            }
        } else if (e.key === 'Escape') {
            searchResultsContainer.style.display = 'none';
            searchInput.blur(); // Прибираємо фокус з поля
        }
    });

    // Функція для підсвічування активного елемента в списку підказок
    function highlightActiveSearchResult(items) {
        items.forEach((item, index) => {
            if (index === activeSearchResultIndex) {
                item.classList.add('active-selection');
                // Прокручуємо до активного елемента, якщо він не в полі зору
                item.scrollIntoView({
                    block: 'nearest'
                });
            } else {
                item.classList.remove('active-selection');
            }
        });
    }


    // Функціонал перемикання теми (Світла/Темна)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        sunIcon.classList.remove('active');
        moonIcon.classList.add('active');
    } else {
        document.body.classList.remove('dark-theme');
        sunIcon.classList.add('active');
        moonIcon.classList.remove('active');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');

        if (document.body.classList.contains('dark-theme')) {
            sunIcon.classList.remove('active');
            moonIcon.classList.add('active');
            localStorage.setItem('theme', 'dark');
        } else {
            sunIcon.classList.add('active');
            moonIcon.classList.remove('active');
            localStorage.setItem('theme', 'light');
        }
    });

    // Функціонал кнопки "Нагору"
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Функціонал бічної панелі (Sidebar)
    openSidebarBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        overlay.classList.add('show');
        document.body.classList.add('sidebar-open');
    });

    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        document.body.classList.remove('sidebar-open');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        document.body.classList.remove('sidebar-open');
    });

    // Початкова ініціалізація
    // activeFilters.add('all'); // Вже додано при оголошенні
    updateFilterButtonsState();
    updatePoemVisibility();
    updateFavoriteButtonsState();
    poemSections.forEach(poem => {
        updateReadStatus(poem.id, readPoems.includes(poem.id));
    });

    // Ініціалізуємо вірш дня при завантаженні сторінки
    initializePoemOfTheDay();
});