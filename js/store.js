// LocalStorage key
const STORAGE_KEY = 'smart_todo_tasks';

//  APP STATE
export const state = {
    todos: loadFromStorage(), // pull todos from LocalStorage
    filter: 'all',           // default filter: 'all', 'active', 'completed'
    searchQuery: ''          // Search filter
};

// --- STORAGE STUFF ---

// Save current state to LocalStorage
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
}

// 
function loadFromStorage() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : [];
}

// Update state

// Add a new todo
export function addTodo(title) {
    const newTodo = {
        id: Date.now().toString(), // Unique ID
        title: title.trim(),
        completed: false
    };

    state.todos.unshift(newTodo); // Top 
    saveToStorage();
}

// Toggle todo completion status
export function toggleTodo(id) {
    state.todos = state.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveToStorage();
}

// Delete a todo
export function deleteTodo(id) {
    state.todos = state.todos.filter(todo => todo.id !== id);
    saveToStorage();
}

// Change the current filter
export function setFilter(filter) {
    state.filter = filter;
}

// Update the search query
export function setSearchQuery(query) {
    state.searchQuery = query.toLowerCase().trim();
}

// DATA SELECTOR 

// Filter todos based on current filter and search query
export function getFilteredTodos() {
    return state.todos.filter(todo => {
        // 1. Search query control
        const matchesSearch = todo.title.toLowerCase().includes(state.searchQuery);

        // 2. Tab filter control
        if (state.filter === 'active') return matchesSearch && !todo.completed;
        if (state.filter === 'completed') return matchesSearch && todo.completed;

        return matchesSearch; // 'all' filter
    });
}