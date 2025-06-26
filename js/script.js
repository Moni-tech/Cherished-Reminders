document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.querySelector('.calendar-grid');
    const currentMonthYearDisplay = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    const birthdayModal = document.getElementById('birthday-modal');
    const birthdayCloseBtn = birthdayModal.querySelector('.close-button');
    const birthdayForm = document.getElementById('birthday-form');
    const birthdayNameInput = document.getElementById('birthday-name');
    const birthdayDateDisplay = document.getElementById('birthday-date-display');
    const birthdayDateHidden = document.getElementById('birthday-date-hidden');
    const birthdayPictureInput = document.getElementById('birthday-picture');
    const picturePreview = document.getElementById('picture-preview');
    const birthdayQuoteInput = document.getElementById('birthday-quote');
    const stickerPalette = document.querySelector('.sticker-palette');
    const deleteBirthdayBtn = document.getElementById('deleteBirthday');

    const memoryModal = document.getElementById('memory-modal');
    const memoryCloseBtn = memoryModal.querySelector('.close-button');
    const memoryForm = document.getElementById('memory-form');
    const addMemoryButton = document.getElementById('addMemoryButton');
    const memoryList = document.getElementById('memory-list');
    const memoryTitleInput = document.getElementById('memory-title');
    const memoryDateInput = document.getElementById('memory-date');
    const memoryContentInput = document.getElementById('memory-content');
    const memoryPictureInput = document.getElementById('memory-picture');
    const memoryPicturePreview = document.getElementById('memory-picture-preview');
    const deleteMemoryBtn = document.getElementById('deleteMemory');

    const notificationToggle = document.getElementById('notification-toggle');
    const notificationTimeInput = document.getElementById('notification-time');

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let birthdays = JSON.parse(localStorage.getItem('birthdays')) || [];
    let memories = JSON.parse(localStorage.getItem('memories')) || [];
    let editingBirthdayId = null; // To track which birthday is being edited
    let editingMemoryId = null; // To track which memory is being edited

    // --- Helper Functions ---

    function saveBirthdays() {
        localStorage.setItem('birthdays', JSON.stringify(birthdays));
    }

    function saveMemories() {
        localStorage.setItem('memories', JSON.stringify(memories));
    }

    function formatDateForDisplay(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    }

    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    function getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay(); // 0 for Sunday, 6 for Saturday
    }

    // --- Calendar Rendering ---
    function renderCalendar() {
        calendarGrid.innerHTML = `
            <div class="day-name">Sun</div>
            <div class="day-name">Mon</div>
            <div class="day-name">Tue</div>
            <div class="day-name">Wed</div>
            <div class="day-name">Thu</div>
            <div class="day-name">Fri</div>
            <div class="day-name">Sat</div>
        `; // Reset grid, keep day names

        currentMonthYearDisplay.textContent = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const firstDay = getFirstDayOfMonth(currentYear, currentMonth); // Day of week (0-6)

        // Add empty cells for preceding days of the week
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'empty-day');
            calendarGrid.appendChild(emptyDay);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.dataset.date = date.toISOString().split('T')[0]; // YYYY-MM-DD

            const dayNumber = document.createElement('div');
            dayNumber.classList.add('day-number');
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);

            // Mark current day
            const today = new Date();
            if (date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()) {
                dayElement.classList.add('current-day');
            }

            // Check for birthdays on this day
            const birthdaysOnThisDay = birthdays.filter(b => {
                const bDate = new Date(b.date);
                return bDate.getMonth() === currentMonth && bDate.getDate() === day;
            });

            if (birthdaysOnThisDay.length > 0) {
                dayElement.classList.add('has-birthday');
                birthdaysOnThisDay.forEach(b => {
                    const birthdayNameSpan = document.createElement('span');
                    birthdayNameSpan.classList.add('birthday-indicator');
                    birthdayNameSpan.textContent = b.name;
                    dayElement.appendChild(birthdayNameSpan);

                    // Add sticker if present
                    if (b.sticker) {
                        const stickerEl = document.createElement('div');
                        stickerEl.classList.add('day-sticker');
                        stickerEl.textContent = b.sticker;
                        stickerEl.style.left = '50%'; // Default position
                        stickerEl.style.top = '70%';
                        dayElement.appendChild(stickerEl);
                    }
                });
            }

            dayElement.addEventListener('click', () => openBirthdayModal(dayElement.dataset.date));
            calendarGrid.appendChild(dayElement);
        }
    }

    // --- Birthday Modal Logic ---
    function openBirthdayModal(dateStr = '') {
        birthdayForm.reset();
        picturePreview.innerHTML = '';
        editingBirthdayId = null;
        deleteBirthdayBtn.style.display = 'none';

        if (dateStr) {
            birthdayDateDisplay.value = formatDateForDisplay(dateStr);
            birthdayDateHidden.value = dateStr;

            // Check if there's an existing birthday for this date (for editing)
            const existingBirthday = birthdays.find(b => {
                const bDate = new Date(b.date);
                const compareDate = new Date(dateStr);
                return bDate.getDate() === compareDate.getDate() && bDate.getMonth() === compareDate.getMonth();
            });

            if (existingBirthday) {
                birthdayNameInput.value = existingBirthday.name;
                birthdayQuoteInput.value = existingBirthday.quote || '';
                if (existingBirthday.picture) {
                    picturePreview.innerHTML = `<img src="${existingBirthday.picture}" alt="Birthday Person">`;
                }
                editingBirthdayId = existingBirthday.id;
                deleteBirthdayBtn.style.display = 'inline-block';
            }
        } else {
            // For adding from a general "add birthday" button (if implemented)
            // You might want to let the user pick the date in the modal
        }

        birthdayModal.style.display = 'block';
    }

    birthdayCloseBtn.addEventListener('click', () => {
        birthdayModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === birthdayModal) {
            birthdayModal.style.display = 'none';
        }
        if (event.target === memoryModal) {
            memoryModal.style.display = 'none';
        }
    });

    birthdayPictureInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                picturePreview.innerHTML = `<img src="${e.target.result}" alt="Birthday Person">`;
            };
            reader.readAsDataURL(file);
        } else {
            picturePreview.innerHTML = '';
        }
    });

    stickerPalette.addEventListener('click', (event) => {
        if (event.target.classList.contains('sticker')) {
            // Add selected sticker to a hidden input or state to be saved with birthday
            // For simplicity, let's just make it visible for now, or imagine it's dragged.
            // For drag-and-drop, you'd use a library or implement your own logic.
            // Example for click-to-add (simpler):
            const selectedSticker = event.target.dataset.emoji;
            // A more robust solution might allow multiple stickers or position them.
            // For now, let's just store the last clicked sticker.
            birthdayForm.dataset.selectedSticker = selectedSticker;
            // Visual feedback: maybe highlight the selected sticker
        }
    });


    birthdayForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = birthdayNameInput.value.trim();
        const date = birthdayDateHidden.value;
        const picture = picturePreview.querySelector('img') ? picturePreview.querySelector('img').src : '';
        const quote = birthdayQuoteInput.value.trim();
        const sticker = birthdayForm.dataset.selectedSticker || ''; // Get the sticker

        if (!name || !date) {
            alert('Please enter name and date.');
            return;
        }

        const newBirthday = {
            id: editingBirthdayId || Date.now(), // Unique ID for each birthday
            name,
            date,
            picture,
            quote,
            sticker
        };

        if (editingBirthdayId) {
            birthdays = birthdays.map(b => b.id === editingBirthdayId ? newBirthday : b);
        } else {
            // Check for duplicate birthday on the same date (for simplicity, only one per day)
            const existing = birthdays.find(b => {
                const bDate = new Date(b.date);
                const newBDate = new Date(newBirthday.date);
                return bDate.getDate() === newBDate.getDate() && bDate.getMonth() === newBDate.getMonth();
            });
            if (existing) {
                // Optionally allow updating the existing one or alert
                alert('A birthday is already registered for this date. Editing the existing one.');
                birthdays = birthdays.map(b => {
                    const bDate = new Date(b.date);
                    const newBDate = new Date(newBirthday.date);
                    return (bDate.getDate() === newBDate.getDate() && bDate.getMonth() === newBDate.getMonth()) ? newBirthday : b;
                });
            } else {
                birthdays.push(newBirthday);
            }
        }

        saveBirthdays();
        renderCalendar();
        birthdayModal.style.display = 'none';
    });

    deleteBirthdayBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this birthday?')) {
            birthdays = birthdays.filter(b => b.id !== editingBirthdayId);
            saveBirthdays();
            renderCalendar();
            birthdayModal.style.display = 'none';
        }
    });

    // --- Calendar Navigation ---
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // --- Memories Section Logic ---
    function renderMemories() {
        memoryList.innerHTML = '';
        memories.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first

        if (memories.length === 0) {
            memoryList.innerHTML = '<p>No memories added yet. Click "Add New Memory" to start!</p>';
            return;
        }

        memories.forEach(memory => {
            const memoryCard = document.createElement('div');
            memoryCard.classList.add('memory-card');
            memoryCard.dataset.id = memory.id;

            memoryCard.innerHTML = `
                <h3>${memory.title}</h3>
                <span class="memory-date">${formatDateForDisplay(memory.date)}</span>
                <p>${memory.content}</p>
                ${memory.picture ? `<img src="${memory.picture}" alt="Memory Image">` : ''}
            `;
            memoryCard.addEventListener('click', () => openMemoryModal(memory.id));
            memoryList.appendChild(memoryCard);
        });
    }

    function openMemoryModal(id = null) {
        memoryForm.reset();
        memoryPicturePreview.innerHTML = '';
        editingMemoryId = id;
        deleteMemoryBtn.style.display = 'none';

        if (id) {
            const memoryToEdit = memories.find(m => m.id === id);
            if (memoryToEdit) {
                memoryTitleInput.value = memoryToEdit.title;
                memoryDateInput.value = memoryToEdit.date;
                memoryContentInput.value = memoryToEdit.content;
                if (memoryToEdit.picture) {
                    memoryPicturePreview.innerHTML = `<img src="${memoryToEdit.picture}" alt="Memory Image">`;
                }
                deleteMemoryBtn.style.display = 'inline-block';
            }
        }

        memoryModal.style.display = 'block';
    }

    addMemoryButton.addEventListener('click', () => openMemoryModal());
    memoryCloseBtn.addEventListener('click', () => memoryModal.style.display = 'none');

    memoryPictureInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                memoryPicturePreview.innerHTML = `<img src="${e.target.result}" alt="Memory Image">`;
            };
            reader.readAsDataURL(file);
        } else {
            memoryPicturePreview.innerHTML = '';
        }
    });

    memoryForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const title = memoryTitleInput.value.trim();
        const date = memoryDateInput.value;
        const content = memoryContentInput.value.trim();
        const picture = memoryPicturePreview.querySelector('img') ? memoryPicturePreview.querySelector('img').src : '';

        if (!title || !date || !content) {
            alert('Please fill in all required fields for the memory.');
            return;
        }

        const newMemory = {
            id: editingMemoryId || Date.now(),
            title,
            date,
            content,
            picture
        };

        if (editingMemoryId) {
            memories = memories.map(m => m.id === editingMemoryId ? newMemory : m);
        } else {
            memories.push(newMemory);
        }

        saveMemories();
        renderMemories();
        memoryModal.style.display = 'none';
    });

    deleteMemoryBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this memory?')) {
            memories = memories.filter(m => m.id !== editingMemoryId);
            saveMemories();
            renderMemories();
            memoryModal.style.display = 'none';
        }
    });

    // --- Notification Logic ---
    function requestNotificationPermission() {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        } else if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }

    function scheduleNotifications() {
        if (!notificationToggle.checked) return;
        requestNotificationPermission();

        const notifyTime = notificationTimeInput.value.split(':');
        const notifyHour = parseInt(notifyTime[0], 10);
        const notifyMinute = parseInt(notifyTime[1], 10);

        birthdays.forEach(birthday => {
            const bDate = new Date(birthday.date);
            const notificationDate = new Date(bDate);
            notificationDate.setDate(bDate.getDate() - 1); // One day before

            const now = new Date();
            // Set notification time for tomorrow's birthday (or today if it's past notification time)
            notificationDate.setHours(notifyHour, notifyMinute, 0, 0);

            // Only schedule if the notification date is in the future
            if (notificationDate > now) {
                const timeToNotify = notificationDate.getTime() - now.getTime();
                if (timeToNotify > 0) {
                    setTimeout(() => {
                        if (Notification.permission === "granted") {
                            new Notification("🎉 Birthday Reminder!", {
                                body: `Tomorrow, ${birthday.name}'s birthday! ${birthday.quote ? `"${birthday.quote}"` : ''}`,
                                icon: birthday.picture || 'path/to/default-birthday-icon.png', // Replace with a default icon
                                vibrate: [200, 100, 200]
                            });
                        }
                    }, timeToNotify);
                }
            }
        });
    }

    notificationToggle.addEventListener('change', () => {
        localStorage.setItem('notificationEnabled', notificationToggle.checked);
        if (notificationToggle.checked) {
            scheduleNotifications();
        }
    });

    notificationTimeInput.addEventListener('change', () => {
        localStorage.setItem('notificationTime', notificationTimeInput.value);
        scheduleNotifications(); // Reschedule with new time
    });

    // Load settings on startup
    function loadSettings() {
        const savedNotificationEnabled = localStorage.getItem('notificationEnabled');
        if (savedNotificationEnabled !== null) {
            notificationToggle.checked = JSON.parse(savedNotificationEnabled);
        }
        const savedNotificationTime = localStorage.getItem('notificationTime');
        if (savedNotificationTime) {
            notificationTimeInput.value = savedNotificationTime;
        }
    }


    // --- Drag-and-Drop for Stickers (Conceptual) ---
    // This is a simplified conceptual example. A proper drag-and-drop
    // implementation would involve tracking mouse events (mousedown, mousemove, mouseup)
    // or using a library.

    let draggedSticker = null;

    stickerPalette.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('sticker')) {
            draggedSticker = e.target.dataset.emoji;
            e.dataTransfer.setData('text/plain', draggedSticker);
            e.target.classList.add('dragging');
        }
    });

    stickerPalette.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('sticker')) {
            e.target.classList.remove('dragging');
        }
        draggedSticker = null;
    });

    calendarGrid.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
    });

    calendarGrid.addEventListener('drop', (e) => {
        e.preventDefault();
        const droppedData = e.dataTransfer.getData('text/plain');
        const targetDay = e.target.closest('.calendar-day');

        if (targetDay && droppedData) {
            const dateStr = targetDay.dataset.date;
            let existingBirthday = birthdays.find(b => {
                const bDate = new Date(b.date);
                const compareDate = new Date(dateStr);
                return bDate.getDate() === compareDate.getDate() && bDate.getMonth() === compareDate.getMonth();
            });

            if (existingBirthday) {
                // Update existing birthday with sticker
                existingBirthday.sticker = droppedData;
                saveBirthdays();
                renderCalendar();
            } else {
                // If no birthday exists, perhaps open the modal with the sticker pre-selected
                // Or inform the user to add a birthday first.
                alert('Add a birthday to this day first to place a sticker!');
                openBirthdayModal(dateStr);
                birthdayForm.dataset.selectedSticker = droppedData; // Pre-select sticker in form
            }
        }
    });


    // --- Initial Load ---
    loadSettings();
    renderCalendar();
    renderMemories();
    scheduleNotifications(); // Schedule on load
});