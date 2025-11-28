const searchInput = document.querySelector('.field__input');
const addNewTask = document.querySelector('.add-note-btn');
const todosContainer = document.querySelector('.list__container-small');
const popup = document.getElementById('popup-card');
const popupForm = document.querySelector('.popup__form');
const popupInput = document.querySelector('.field__input_p');
const cancelBtn = document.querySelector('.popup__button_stroke');
const applyBtn = document.querySelector('.popup__button_filled');

let todoEl = JSON.parse(localStorage.getItem('todo')) || [];
let currentFilter = 'all';
let searchTask = '';

document.addEventListener('DOMContentLoaded', () => {
    setupCustomSelect(); 
    renderTodos();
    setupEventListeners();
});

function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        searchTask = e.target.value.toLowerCase();
        renderTodos();
    });

    addNewTask.addEventListener('click', () => {
        openPopup();
    });

    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closePopup();
    });

    applyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        saveTodo();
    });

    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            closePopup();
        }
    });

    popupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTodo();
    });
}

function setupCustomSelect() {
    const customSelect = document.querySelector('.custom-select');
    const selected = customSelect.querySelector('.custom-select__selected');
    const options = customSelect.querySelector('.custom-select__options');
    const arrow = customSelect.querySelector('.custom-select__arrow');
    
    selected.addEventListener('click', (e) => {
        e.stopPropagation();
        options.classList.toggle('custom-select__options--open');
        arrow.classList.toggle('custom-select__arrow--open');
    });
    
    options.querySelectorAll('.custom-select__option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const value = option.dataset.value;
            const label = option.textContent;
            
            selected.textContent = label;
            currentFilter = value;
            
            options.classList.remove('custom-select__options--open');
            arrow.classList.remove('custom-select__arrow--open');
            renderTodos();
        });
    });
    
    document.addEventListener('click', () => {
        options.classList.remove('custom-select__options--open');
        arrow.classList.remove('custom-select__arrow--open');
    });
}

function openPopup() {
    popupInput.value = '';
    delete popupInput.dataset.id;
    document.querySelector('.popup__title').textContent = 'New Note';
    popup.classList.add('opened');
    popupInput.focus();
}

function closePopup() {
    popup.classList.remove('opened');
    popupInput.value = '';
    delete popupInput.dataset.id;
}

function saveTodo() {
    const text = popupInput.value.trim();
    if (!text) return;

    const todoId = popupInput.dataset.id;

    if (!todoId) {
        const newTodo = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        todoEl.unshift(newTodo);
        saveToLocalStorage();
        renderTodos();
        closePopup();
    }
}

function toggleTodo(id) {
    const todo = todoEl.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveToLocalStorage();
        renderTodos();
    }
}

function startEditTodo(id) {
    const todo = todoEl.find(t => t.id === id);
    if (!todo) return;

    const noteElement = document.querySelector(`[data-id="${id}"]`).closest('.note');
    const textElement = noteElement.querySelector('.note__text');
    const inputElement = noteElement.querySelector('.note__input');
    const actionsElement = noteElement.querySelector('.note-actions');

    textElement.style.display = 'none';
    inputElement.style.display = 'block';
    inputElement.focus();
    inputElement.select();
    actionsElement.style.opacity = '0';
    inputElement.dataset.originalValue = todo.text;
}

function finishEditTodo(id) {
    const todo = todoEl.find(t => t.id === id);
    if (!todo) return;

    const noteElement = document.querySelector(`[data-id="${id}"]`).closest('.note');
    const textElement = noteElement.querySelector('.note__text');
    const inputElement = noteElement.querySelector('.note__input');
    const actionsElement = noteElement.querySelector('.note-actions');

    const newText = inputElement.value.trim();
    
    if (newText && newText !== inputElement.dataset.originalValue) {
        todo.text = newText;
        textElement.textContent = newText;
        saveToLocalStorage();
    } else if (!newText) {
        inputElement.value = inputElement.dataset.originalValue;
    }

    textElement.style.display = 'flex';
    inputElement.style.display = 'none';
    actionsElement.style.opacity = '';
}

function cancelEditTodo(id) {
    const noteElement = document.querySelector(`[data-id="${id}"]`).closest('.note');
    const textElement = noteElement.querySelector('.note__text');
    const inputElement = noteElement.querySelector('.note__input');
    const actionsElement = noteElement.querySelector('.note-actions');

    inputElement.value = inputElement.dataset.originalValue;

    textElement.style.display = 'flex';
    inputElement.style.display = 'none';
    actionsElement.style.opacity = '';
}

function deleteTodo(id) {
    todoEl = todoEl.filter(todo => todo.id !== id);
    saveToLocalStorage();
    renderTodos();
}

function saveToLocalStorage() {
    localStorage.setItem('todo', JSON.stringify(todoEl));
}

function renderTodos() {
    let filteredTodos = todoEl;

    if (currentFilter === 'active') {
        filteredTodos = todoEl.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todoEl.filter(todo => todo.completed);
    }

    if (searchTask) {
        filteredTodos = filteredTodos.filter(todo => 
            todo.text.toLowerCase().includes(searchTask)
        );
    }

    const undoElement = document.querySelector('.undo');
    todosContainer.innerHTML = '';
    if (undoElement) {
        todosContainer.appendChild(undoElement);
    }

    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = searchTask ? 'Задачи не найдены' : 'Нет задач';
        emptyMessage.style.cssText = `
            text-align: center;
            padding: 40px 20px;
            color: #999;
            font-family: Kanit;
            font-size: 18px;
        `;
        todosContainer.appendChild(emptyMessage);
    }

    filteredTodos.forEach(todo => {
        const todoElement = createTodoElement(todo);
        todosContainer.appendChild(todoElement);
    });
}

function createTodoElement(todo) {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'note-parent';
    mainDiv.style.height = '61px';

    const note = document.createElement('div');
    note.className = `note ${todo.completed ? 'note_checked' : ''}`;

    note.innerHTML = `
        <div class="note__checkbox"></div>
        <div class="note__text" style="display: flex;">${todo.text}</div>
        <input type="text" 
               class="note__input" 
               value="${todo.text}" 
               style="display: none;"
               data-id="${todo.id}">
        <div class="note-actions">
            <button class="note-actions__button note-actions__button_edit" style="display: flex;" type="button">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.67272 5.99106L2 12.6637V16H5.33636L12.0091 9.32736M8.67272 5.99106L11.0654 3.59837L11.0669 3.59695C11.3962 3.26759 11.5612 3.10261 11.7514 3.04082C11.9189 2.98639 12.0993 2.98639 12.2669 3.04082C12.4569 3.10257 12.6217 3.26735 12.9506 3.59625L14.4018 5.04738C14.7321 5.37769 14.8973 5.54292 14.9592 5.73337C15.0136 5.90088 15.0136 6.08133 14.9592 6.24885C14.8974 6.43916 14.7324 6.60414 14.4025 6.93398L14.4018 6.93468L12.0091 9.32736M8.67272 5.99106L12.0091 9.32736" stroke="#CDCDCD"></path>
                </svg>
            </button>
            <button class="note-actions__button note-actions__button_rm" style="display: flex;" type="button">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.87414 7.61505C3.80712 6.74386 4.49595 6 5.36971 6H12.63C13.5039 6 14.1927 6.74385 14.1257 7.61505L13.6064 14.365C13.5463 15.1465 12.8946 15.75 12.1108 15.75H5.88894C5.10514 15.75 4.45348 15.1465 4.39336 14.365L3.87414 7.61505Z" stroke="#CDCDCD"></path>
                    <path d="M14.625 3.75H3.375" stroke="#CDCDCD"></path>
                    <path d="M7.5 2.25C7.5 1.83579 7.83577 1.5 8.25 1.5H9.75C10.1642 1.5 10.5 1.83579 10.5 2.25V3.75H7.5V2.25Z" stroke="#CDCDCD"></path>
                    <path d="M10.5 9V12.75" stroke="#CDCDCD"></path>
                    <path d="M7.5 9V12.75" stroke="#CDCDCD"></path>
                </svg>
            </button>
        </div>
    `;

    const checkbox = note.querySelector('.note__checkbox');
    const textElement = note.querySelector('.note__text');
    const inputElement = note.querySelector('.note__input');
    const editBtn = note.querySelector('.note-actions__button_edit');
    const deleteBtn = note.querySelector('.note-actions__button_rm');

    checkbox.addEventListener('click', () => toggleTodo(todo.id));

    inputElement.addEventListener('focusout', () => {
        finishEditTodo(todo.id);
    });

    inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            inputElement.blur();
        } else if (e.key === 'Escape') {
            cancelEditTodo(todo.id);
        }
    });

    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startEditTodo(todo.id);
    });

    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTodo(todo.id);
    });

    mainDiv.appendChild(note);
    return mainDiv;
}
