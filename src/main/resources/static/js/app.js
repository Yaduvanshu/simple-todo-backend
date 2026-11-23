/**
 * TaskFlow - Plain JavaScript Todo App Frontend
 * Interacts with Spring Boot REST API at /api/todos
 * Includes Dark and Light Theme Module
 */

(function () {
    'use strict';

    // State management
    const state = {
        todos: [],
        currentFilter: 'all', // 'all' | 'active' | 'completed'
        searchQuery: '',
        editingTodoId: null,
        isLoading: false
    };

    // DOM Elements
    const elements = {
        todoForm: document.getElementById('todo-form'),
        titleInput: document.getElementById('todo-title-input'),
        descInput: document.getElementById('todo-desc-input'),
        addBtn: document.getElementById('add-todo-btn'),
        todoList: document.getElementById('todo-list'),
        emptyState: document.getElementById('empty-state'),
        emptyStateTitle: document.getElementById('empty-state-title'),
        emptyStateDesc: document.getElementById('empty-state-desc'),
        searchInput: document.getElementById('search-input'),
        clearSearchBtn: document.getElementById('clear-search-btn'),
        filterAllBtn: document.getElementById('filter-all'),
        filterActiveBtn: document.getElementById('filter-active'),
        filterCompletedBtn: document.getElementById('filter-completed'),
        statTotal: document.getElementById('stat-total'),
        statActive: document.getElementById('stat-active'),
        statCompleted: document.getElementById('stat-completed'),
        statProgressBar: document.getElementById('stat-progress-bar'),
        statProgressPercent: document.getElementById('stat-progress-percent'),
        editModal: document.getElementById('edit-modal'),
        editModalForm: document.getElementById('edit-modal-form'),
        editTitleInput: document.getElementById('edit-title-input'),
        editDescInput: document.getElementById('edit-desc-input'),
        editCompletedCheckbox: document.getElementById('edit-completed-checkbox'),
        closeModalBtn: document.getElementById('close-modal-btn'),
        cancelModalBtn: document.getElementById('cancel-modal-btn'),
        toastContainer: document.getElementById('toast-container'),
        currentDateEl: document.getElementById('current-date'),
        themeToggleBtn: document.getElementById('theme-toggle-btn'),
        themeIconSun: document.getElementById('theme-icon-sun'),
        themeIconMoon: document.getElementById('theme-icon-moon')
    };

    // Theme Management Module
    const ThemeManager = {
        init() {
            const savedTheme = localStorage.getItem('theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

            this.applyTheme(isDark, false);

            if (elements.themeToggleBtn) {
                elements.themeToggleBtn.addEventListener('click', () => {
                    const currentlyDark = document.documentElement.classList.contains('dark');
                    this.applyTheme(!currentlyDark, true);
                    showToast(
                        !currentlyDark ? 'Dark theme enabled 🌙' : 'Light theme enabled ☀️',
                        'info'
                    );
                });
            }

            // Sync with OS theme changes if user hasn't set an explicit manual override
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(e.matches, false);
                }
            });
        },

        applyTheme(isDark, saveToStorage = true) {
            if (isDark) {
                document.documentElement.classList.add('dark');
                if (saveToStorage) localStorage.setItem('theme', 'dark');
                if (elements.themeIconSun) elements.themeIconSun.classList.remove('hidden');
                if (elements.themeIconMoon) elements.themeIconMoon.classList.add('hidden');
            } else {
                document.documentElement.classList.remove('dark');
                if (saveToStorage) localStorage.setItem('theme', 'light');
                if (elements.themeIconSun) elements.themeIconSun.classList.add('hidden');
                if (elements.themeIconMoon) elements.themeIconMoon.classList.remove('hidden');
            }
        }
    };

    // API Helper Functions
    const API = {
        baseUrl: '/api/todos',

        async getAll(completed = null) {
            let url = this.baseUrl;
            if (completed !== null) {
                url += `?completed=${completed}`;
            }
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch todos');
            return await res.json();
        },

        async search(query) {
            const url = `${this.baseUrl}/search?keyword=${encodeURIComponent(query)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to search todos');
            return await res.json();
        },

        async create(todo) {
            const res = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(todo)
            });
            if (!res.ok) throw new Error('Failed to create todo');
            return await res.json();
        },

        async update(id, todo) {
            const res = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(todo)
            });
            if (!res.ok) throw new Error('Failed to update todo');
            return await res.json();
        },

        async toggle(id) {
            const res = await fetch(`${this.baseUrl}/${id}/toggle`, {
                method: 'PATCH'
            });
            if (!res.ok) throw new Error('Failed to toggle todo status');
            return await res.json();
        },

        async delete(id) {
            const res = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete todo');
            return true;
        }
    };

    // Helper: Escape HTML to avoid XSS
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Helper: Format Date
    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return '';
        }
    }

    // Toast Notification System
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 animate-slide-in pointer-events-auto ${
            type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                : 'bg-indigo-50 dark:bg-slate-800 border-indigo-200 dark:border-slate-700 text-indigo-800 dark:text-indigo-200'
        }`;

        const iconSvg = type === 'success'
            ? `<svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
               </svg>`
            : type === 'error'
            ? `<svg class="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
               </svg>`
            : `<svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
               </svg>`;

        toast.innerHTML = `
            ${iconSvg}
            <span class="flex-1">${escapeHtml(message)}</span>
            <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2 focus:outline-none" aria-label="Close">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;

        const closeBtn = toast.querySelector('button');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });

        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    // Update Statistics
    function updateStats() {
        const total = state.todos.length;
        const completed = state.todos.filter(t => t.completed).length;
        const active = total - completed;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        if (elements.statTotal) elements.statTotal.textContent = total;
        if (elements.statActive) elements.statActive.textContent = active;
        if (elements.statCompleted) elements.statCompleted.textContent = completed;
        if (elements.statProgressBar) elements.statProgressBar.style.width = `${percent}%`;
        if (elements.statProgressPercent) elements.statProgressPercent.textContent = `${percent}%`;

        // Update counts in filter tabs
        const allBadge = document.getElementById('filter-all-badge');
        const activeBadge = document.getElementById('filter-active-badge');
        const completedBadge = document.getElementById('filter-completed-badge');
        if (allBadge) allBadge.textContent = total;
        if (activeBadge) activeBadge.textContent = active;
        if (completedBadge) completedBadge.textContent = completed;
    }

    // Filter Logic
    function getFilteredTodos() {
        let list = state.todos;

        // Apply completed status filter
        if (state.currentFilter === 'active') {
            list = list.filter(t => !t.completed);
        } else if (state.currentFilter === 'completed') {
            list = list.filter(t => t.completed);
        }

        // Apply search query filter if set
        if (state.searchQuery.trim() !== '') {
            const q = state.searchQuery.toLowerCase();
            list = list.filter(t =>
                (t.title && t.title.toLowerCase().includes(q)) ||
                (t.description && t.description.toLowerCase().includes(q))
            );
        }

        return list;
    }

    // Render Todo List
    function renderTodos() {
        const filtered = getFilteredTodos();
        elements.todoList.innerHTML = '';

        if (filtered.length === 0) {
            elements.emptyState.classList.remove('hidden');
            if (state.searchQuery.trim() !== '') {
                elements.emptyStateTitle.textContent = 'No matching tasks found';
                elements.emptyStateDesc.textContent = `No tasks matching "${state.searchQuery}". Try a different keyword or clear search.`;
            } else if (state.currentFilter === 'active') {
                elements.emptyStateTitle.textContent = 'No active tasks';
                elements.emptyStateDesc.textContent = 'Awesome! You have completed all your pending tasks.';
            } else if (state.currentFilter === 'completed') {
                elements.emptyStateTitle.textContent = 'No completed tasks yet';
                elements.emptyStateDesc.textContent = 'Complete a task by clicking its checkbox to see it here.';
            } else {
                elements.emptyStateTitle.textContent = 'No tasks yet';
                elements.emptyStateDesc.textContent = 'Add your first task above to start organizing your work.';
            }
        } else {
            elements.emptyState.classList.add('hidden');
            filtered.forEach(todo => {
                const item = createTodoElement(todo);
                elements.todoList.appendChild(item);
            });
        }

        updateStats();
    }

    // Create DOM element for a single todo
    function createTodoElement(todo) {
        const li = document.createElement('li');
        li.dataset.id = todo.id;
        li.className = `group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-800 hover:shadow-md animate-fade-in ${
            todo.completed
                ? 'border-emerald-100/80 dark:border-emerald-950/60 bg-slate-50/50 dark:bg-slate-800/40'
                : 'border-slate-200/90 dark:border-slate-700/90 shadow-sm hover:border-brand-200 dark:hover:border-brand-500/50'
        }`;

        const isChecked = todo.completed ? 'checked' : '';
        const titleClass = todo.completed
            ? 'line-through text-slate-400 dark:text-slate-500 font-normal'
            : 'text-slate-800 dark:text-slate-100 font-semibold';
        const descClass = todo.completed
            ? 'line-through text-slate-400 dark:text-slate-500'
            : 'text-slate-500 dark:text-slate-400';

        const createdDate = todo.createdAt ? formatDate(todo.createdAt) : '';

        li.innerHTML = `
            <div class="flex items-start gap-3.5 flex-1 min-w-0 pr-3">
                <!-- Toggle Checkbox -->
                <button type="button" class="toggle-btn mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-400 ${
                    todo.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                        : 'border-slate-300 dark:border-slate-600 hover:border-brand-500 bg-white dark:bg-slate-800'
                }" aria-label="Toggle task status">
                    <svg class="w-3.5 h-3.5 transition-transform duration-150 ${todo.completed ? 'scale-100' : 'scale-0'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </button>

                <!-- Text Content -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="todo-title text-base sm:text-lg break-words transition-colors duration-200 ${titleClass}">
                            ${escapeHtml(todo.title)}
                        </span>
                        ${
                            todo.completed
                                ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">Done</span>`
                                : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">Pending</span>`
                        }
                    </div>

                    ${
                        todo.description && todo.description.trim() !== ''
                            ? `<p class="todo-desc text-sm mt-1 break-words transition-colors duration-200 ${descClass}">
                                 ${escapeHtml(todo.description)}
                               </p>`
                            : ''
                    }

                    ${
                        createdDate
                            ? `<div class="flex items-center gap-1.5 mt-2 text-xs text-slate-400 dark:text-slate-500">
                                 <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                 </svg>
                                 <span>${createdDate}</span>
                               </div>`
                            : ''
                    }
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-1.5 self-end sm:self-center mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700 w-full sm:w-auto justify-end">
                <!-- Edit Button -->
                <button type="button" class="edit-btn p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/80 dark:hover:bg-brand-950/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-300" title="Edit Task">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>

                <!-- Delete Button -->
                <button type="button" class="delete-btn p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300" title="Delete Task">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        `;

        // Event: Toggle
        const toggleBtn = li.querySelector('.toggle-btn');
        toggleBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await handleToggle(todo.id);
        });

        // Event: Edit
        const editBtn = li.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(todo.id);
        });

        // Event: Delete
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await handleDelete(todo.id);
        });

        return li;
    }

    // Toggle Handler
    async function handleToggle(id) {
        try {
            const updated = await API.toggle(id);
            const index = state.todos.findIndex(t => t.id === id);
            if (index !== -1) {
                state.todos[index] = updated;
                renderTodos();
                showToast(
                    updated.completed ? 'Task marked as completed! 🎉' : 'Task marked as active.',
                    'success'
                );
            }
        } catch (err) {
            console.error('Failed to toggle todo:', err);
            showToast('Failed to update task status.', 'error');
        }
    }

    // Delete Handler
    async function handleDelete(id) {
        const todo = state.todos.find(t => t.id === id);
        const titleSnippet = todo ? `"${todo.title}"` : 'Task';

        if (!confirm(`Are you sure you want to delete ${titleSnippet}?`)) {
            return;
        }

        try {
            await API.delete(id);
            state.todos = state.todos.filter(t => t.id !== id);
            renderTodos();
            showToast('Task deleted successfully.', 'info');
        } catch (err) {
            console.error('Failed to delete todo:', err);
            showToast('Failed to delete task.', 'error');
        }
    }

    // Create Handler
    async function handleCreate(e) {
        e.preventDefault();
        const title = elements.titleInput.value.trim();
        const description = elements.descInput.value.trim();

        if (!title) {
            elements.titleInput.focus();
            showToast('Please enter a task title.', 'error');
            return;
        }

        elements.addBtn.disabled = true;
        elements.addBtn.innerHTML = `
            <svg class="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>Adding...</span>
        `;

        try {
            const newTodo = await API.create({
                title,
                description,
                completed: false
            });

            state.todos.unshift(newTodo);
            elements.titleInput.value = '';
            elements.descInput.value = '';
            renderTodos();
            showToast('New task added successfully! 🚀', 'success');
        } catch (err) {
            console.error('Failed to create todo:', err);
            showToast('Failed to add task. Please try again.', 'error');
        } finally {
            elements.addBtn.disabled = false;
            elements.addBtn.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Task</span>
            `;
            elements.titleInput.focus();
        }
    }

    // Edit Modal Logic
    function openEditModal(id) {
        const todo = state.todos.find(t => t.id === id);
        if (!todo) return;

        state.editingTodoId = id;
        elements.editTitleInput.value = todo.title || '';
        elements.editDescInput.value = todo.description || '';
        elements.editCompletedCheckbox.checked = !!todo.completed;

        elements.editModal.classList.remove('hidden');
        elements.editModal.classList.add('flex');
        setTimeout(() => elements.editTitleInput.focus(), 100);
    }

    function closeEditModal() {
        elements.editModal.classList.add('hidden');
        elements.editModal.classList.remove('flex');
        state.editingTodoId = null;
    }

    async function handleEditSubmit(e) {
        e.preventDefault();
        if (!state.editingTodoId) return;

        const newTitle = elements.editTitleInput.value.trim();
        const newDesc = elements.editDescInput.value.trim();
        const isCompleted = elements.editCompletedCheckbox.checked;

        if (!newTitle) {
            showToast('Task title cannot be empty.', 'error');
            elements.editTitleInput.focus();
            return;
        }

        try {
            const updated = await API.update(state.editingTodoId, {
                title: newTitle,
                description: newDesc,
                completed: isCompleted
            });

            const index = state.todos.findIndex(t => t.id === state.editingTodoId);
            if (index !== -1) {
                state.todos[index] = updated;
                renderTodos();
                showToast('Task updated successfully!', 'success');
            }
            closeEditModal();
        } catch (err) {
            console.error('Failed to update todo:', err);
            showToast('Failed to save changes.', 'error');
        }
    }

    // Filter Buttons Update
    function setFilter(filter) {
        state.currentFilter = filter;

        const buttons = [
            { el: elements.filterAllBtn, key: 'all' },
            { el: elements.filterActiveBtn, key: 'active' },
            { el: elements.filterCompletedBtn, key: 'completed' }
        ];

        buttons.forEach(({ el, key }) => {
            if (!el) return;
            if (key === filter) {
                el.className = 'filter-btn px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-brand-600 text-white shadow-sm flex items-center gap-2';
            } else {
                el.className = 'filter-btn px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2';
            }
        });

        renderTodos();
    }

    // Search Debounce
    let searchTimeout = null;
    function handleSearchInput() {
        const query = elements.searchInput.value;
        state.searchQuery = query;

        if (elements.clearSearchBtn) {
            if (query.trim() !== '') {
                elements.clearSearchBtn.classList.remove('hidden');
            } else {
                elements.clearSearchBtn.classList.add('hidden');
            }
        }

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            if (query.trim().length >= 2) {
                try {
                    await API.search(query.trim());
                    renderTodos();
                } catch (e) {
                    renderTodos();
                }
            } else {
                renderTodos();
            }
        }, 200);
    }

    function clearSearch() {
        elements.searchInput.value = '';
        state.searchQuery = '';
        if (elements.clearSearchBtn) elements.clearSearchBtn.classList.add('hidden');
        renderTodos();
        elements.searchInput.focus();
    }

    // Initialize from DOM or API
    async function init() {
        // Initialize Theme Module
        ThemeManager.init();

        // Render current date
        if (elements.currentDateEl) {
            const today = new Date();
            elements.currentDateEl.textContent = today.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            });
        }

        // Fetch initial list from API
        try {
            state.todos = await API.getAll();
        } catch (e) {
            console.warn('Could not load todos via API, fallback to Thymeleaf SSR elements if any.', e);
        }

        renderTodos();

        // Bind Events
        elements.todoForm.addEventListener('submit', handleCreate);

        // Filter tabs
        if (elements.filterAllBtn) {
            elements.filterAllBtn.addEventListener('click', () => setFilter('all'));
        }
        if (elements.filterActiveBtn) {
            elements.filterActiveBtn.addEventListener('click', () => setFilter('active'));
        }
        if (elements.filterCompletedBtn) {
            elements.filterCompletedBtn.addEventListener('click', () => setFilter('completed'));
        }

        // Search
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', handleSearchInput);
        }
        if (elements.clearSearchBtn) {
            elements.clearSearchBtn.addEventListener('click', clearSearch);
        }

        // Edit Modal
        if (elements.closeModalBtn) {
            elements.closeModalBtn.addEventListener('click', closeEditModal);
        }
        if (elements.cancelModalBtn) {
            elements.cancelModalBtn.addEventListener('click', closeEditModal);
        }
        if (elements.editModal) {
            elements.editModal.addEventListener('click', (e) => {
                if (e.target === elements.editModal) {
                    closeEditModal();
                }
            });
        }
        if (elements.editModalForm) {
            elements.editModalForm.addEventListener('submit', handleEditSubmit);
        }

        // Global Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape closes modal
            if (e.key === 'Escape') {
                if (!elements.editModal.classList.contains('hidden')) {
                    closeEditModal();
                }
            }
            // '/' focuses search if not currently typing in input/textarea
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                elements.searchInput.focus();
            }
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
