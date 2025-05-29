// UI controller to handle all user interactions
export class UIController {
  constructor(taskManager, aiService, notificationService) {
    this.taskManager = taskManager;
    this.aiService = aiService;
    this.notificationService = notificationService;
    
    // State
    this.currentEditId = null;
    this.draggedTaskId = null;
    this.searchTimeout = null;
    this.taskScheduleChartInstance = null;
    
    // Initialize chart.js
    this.chartColors = {
      primary: '#3b82f6',
      primaryTransparent: 'rgba(59, 130, 246, 0.6)',
      primaryHover: '#2563eb',
      text: '#6b7280',
      grid: '#e5e7eb',
      tooltipBg: 'white',
      tooltipTitle: '#111827',
      tooltipBody: '#4b5563'
    };
  }
  
  // Initialize the UI controller
  init() {
    this.initializeDOM();
    this.taskManager.init();
    this.setupEventListeners();
    this.setupTaskManager();
    this.checkDarkMode();
    this.updateTaskList();
    this.setDefaultDeadline();
    this.setupDragAndDrop();
    this.checkForDueTasks();
    this.updateTaskScheduleGraph();
    this.aiService.init();
  }
  
  // Initialize DOM elements
  initializeDOM() {
    // Header controls
    this.themeToggleBtn = document.getElementById('theme-toggle');
    this.addTaskBtn = document.getElementById('add-task-btn');
    this.aiAssistantBtn = document.getElementById('ai-assistant-btn');
    
    // Dashboard elements
    this.activeTasksCount = document.getElementById('active-tasks-count');
    this.activeTasksTotal = document.getElementById('active-tasks-total');
    this.activeTasksProgress = document.getElementById('active-tasks-progress');
    this.dueTodayCount = document.getElementById('due-today-count');
    this.completedCount = document.getElementById('completed-count');
    this.completedTotal = document.getElementById('completed-total');
    this.completedProgress = document.getElementById('completed-progress');
    this.overdueCount = document.getElementById('overdue-count');
    this.aiInsightsCount = document.getElementById('ai-insights-count');
    this.aiInsightsMessage = document.getElementById('ai-insights-message');
    
    // Task list elements
    this.taskList = document.getElementById('task-list');
    this.emptyState = document.getElementById('empty-state');
    this.emptyAddTaskBtn = document.getElementById('empty-add-task-btn');
    
    // Filter and search elements
    this.filterSelect = document.getElementById('filter-select');
    this.sortSelect = document.getElementById('sort-select');
    this.categorySelect = document.getElementById('category-select');
    this.searchInput = document.getElementById('search-input');
    
    // Task modal elements
    this.taskModal = document.getElementById('task-modal');
    this.closeModalBtn = document.getElementById('close-modal-btn');
    this.cancelTaskBtn = document.getElementById('cancel-task-btn');
    this.saveTaskBtn = document.getElementById('save-task-btn');
    this.taskForm = document.getElementById('task-form');
    this.modalTitle = document.getElementById('modal-title');
    
    // Form elements
    this.taskIdInput = document.getElementById('task-id');
    this.taskTitleInput = document.getElementById('task-title');
    this.taskDescriptionInput = document.getElementById('task-description');
    this.taskDeadlineInput = document.getElementById('task-deadline');
    this.taskNoDeadlineCheckbox = document.getElementById('task-no-deadline');
    this.taskPriorityInput = document.getElementById('task-priority');
    this.taskCategoryInput = document.getElementById('task-category');
    this.taskCustomCategoryInput = document.getElementById('task-custom-category');
    this.taskEstimatedTimeInput = document.getElementById('task-estimated-time');
    
    // AI form integration buttons
    this.aiTitleAnalyzeBtn = document.getElementById('ai-title-analyze');
    this.aiDescriptionAnalyzeBtn = document.getElementById('ai-description-analyze');
    this.aiScheduleSuggestBtn = document.getElementById('ai-schedule-suggest');
    this.aiPrioritySuggestBtn = document.getElementById('ai-priority-suggest');
    this.aiCategorySuggestBtn = document.getElementById('ai-category-suggest');
    this.aiTimeEstimateBtn = document.getElementById('ai-time-estimate');
    
    // AI assistant elements
    this.aiAssistantPanel = document.getElementById('ai-assistant-panel');
    this.closeAiAssistantBtn = document.getElementById('close-ai-assistant');
    this.aiAssistantMessages = document.getElementById('ai-assistant-messages');
    this.aiAssistantPrompt = document.getElementById('ai-assistant-prompt');
    this.aiAssistantSend = document.getElementById('ai-assistant-send');
    this.aiQuickActionBtns = document.querySelectorAll('.ai-quick-action-btn');
    
    // AI suggestion container
    this.aiSuggestionContainer = document.getElementById('ai-suggestion-container');
    this.closeAiSuggestionBtn = document.getElementById('close-ai-suggestion');
    this.aiSuggestionContent = document.getElementById('ai-suggestion-content');
    
    // AI insights modal
    this.aiInsightsModal = document.getElementById('ai-insights-modal');
    this.closeInsightsModalBtn = document.getElementById('close-insights-modal-btn');
    this.aiInsightsContent = document.getElementById('ai-insights-content');
    
    // Chart elements
    this.taskScheduleCanvas = document.getElementById('taskScheduleChart');
  }
  
  // Setup callbacks from task manager
  setupTaskManager() {
    this.taskManager.registerTasksUpdatedCallback(() => {
      this.updateTaskList();
      this.updateTaskScheduleGraph();
    });
    
    this.taskManager.registerCategoriesUpdatedCallback(() => {
      this.updateCategoriesDropdown();
    });
  }
  
  // Set up event listeners
  setupEventListeners() {
    // Theme toggle
    this.themeToggleBtn.addEventListener('click', () => this.toggleDarkMode());
    
    // Task buttons
    this.addTaskBtn.addEventListener('click', () => this.openAddTaskModal());
    this.emptyAddTaskBtn.addEventListener('click', () => this.openAddTaskModal());
    this.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.cancelTaskBtn.addEventListener('click', () => this.closeModal());
    this.saveTaskBtn.addEventListener('click', () => this.addOrUpdateTask());
    
    // Filter and search
    this.filterSelect.addEventListener('change', () => this.updateTaskList());
    this.sortSelect.addEventListener('change', () => this.updateTaskList());
    this.categorySelect.addEventListener('change', () => this.updateTaskList());
    this.searchInput.addEventListener('input', () => {
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => this.updateTaskList(), 300);
    });
    
    // No deadline checkbox
    this.taskNoDeadlineCheckbox.addEventListener('change', () => {
      if (this.taskNoDeadlineCheckbox.checked) {
        this.taskDeadlineInput.disabled = true;
        this.taskDeadlineInput.removeAttribute('required');
        this.taskDeadlineInput.value = '';
        this.aiScheduleSuggestBtn.disabled = true;
        this.aiScheduleSuggestBtn.style.opacity = '0.5';
      } else {
        this.taskDeadlineInput.disabled = false;
        this.taskDeadlineInput.setAttribute('required', 'required');
        this.aiScheduleSuggestBtn.disabled = false;
        this.aiScheduleSuggestBtn.style.opacity = '1';
        if (!this.taskDeadlineInput.value) {
          const nowDate = new Date();
          nowDate.setHours(nowDate.getHours() + 24);
          this.taskDeadlineInput.value = nowDate.toISOString().slice(0, 16);
        }
      }
    });
    
    // Modal close on click outside or escape
    window.addEventListener('click', (e) => {
      if (e.target === this.taskModal) this.closeModal();
      if (e.target === this.aiInsightsModal) this.closeAiInsightsModal();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.taskModal.classList.contains('active')) this.closeModal();
        if (this.aiInsightsModal.classList.contains('active')) this.closeAiInsightsModal();
        if (this.aiAssistantPanel.classList.contains('active')) this.toggleAiAssistant();
      }
    });
    
    // AI Insights card click
    this.aiInsightsCount.parentElement.addEventListener('click', () => this.openAiInsightsModal());
    
    // AI Assistant toggle
    this.aiAssistantBtn.addEventListener('click', () => this.toggleAiAssistant());
    this.closeAiAssistantBtn.addEventListener('click', () => this.toggleAiAssistant());
    
    // AI Assistant send message
    this.aiAssistantSend.addEventListener('click', () => this.sendAiMessage());
    this.aiAssistantPrompt.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendAiMessage();
    });
    
    // AI Quick Actions
    this.aiQuickActionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt');
        if (prompt) {
          this.aiAssistantPrompt.value = prompt;
          this.sendAiMessage();
        }
      });
    });
    
    // AI Suggestion close
    this.closeAiSuggestionBtn.addEventListener('click', () => {
      this.aiSuggestionContainer.classList.add('hidden');
    });
    
    // AI Insights modal close
    this.closeInsightsModalBtn.addEventListener('click', () => {
      this.closeAiInsightsModal();
    });
    
    // AI Form integration buttons
    this.aiTitleAnalyzeBtn.addEventListener('click', () => this.getAiTitleSuggestion());
    this.aiDescriptionAnalyzeBtn.addEventListener('click', () => this.getAiDescriptionSuggestion());
    this.aiScheduleSuggestBtn.addEventListener('click', () => this.getAiScheduleSuggestion());
    this.aiPrioritySuggestBtn.addEventListener('click', () => this.getAiPrioritySuggestion());
    this.aiCategorySuggestBtn.addEventListener('click', () => this.getAiCategorySuggestion());
    this.aiTimeEstimateBtn.addEventListener('click', () => this.getAiTimeEstimate());
  }
  
  // Update categories dropdown
  updateCategoriesDropdown() {
    const categories = this.taskManager.getAllCategories();
    
    // Update task form category dropdown
    this.taskCategoryInput.innerHTML = '<option value="">Select a category</option>';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      this.taskCategoryInput.appendChild(option);
    });
    
    // Update filter category dropdown
    this.categorySelect.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      this.categorySelect.appendChild(option);
    });
  }
  
  // Update task list UI
  updateTaskList() {
    const filter = this.filterSelect.value;
    const sort = this.sortSelect.value;
    const categoryFilter = this.categorySelect.value;
    const searchQuery = this.searchInput.value.toLowerCase();
    
    const filteredTasks = this.taskManager.filterAndSortTasks(
      filter, sort, categoryFilter, searchQuery
    );
    
    this.taskList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
      this.emptyState.classList.remove('hidden');
    } else {
      this.emptyState.classList.add('hidden');
      filteredTasks.forEach(task => {
        const taskElement = this.createTaskElement(task);
        this.taskList.appendChild(taskElement);
      });
    }
    
    this.updateStats();
  }
  
  // Create task element for display
  createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task-card ${task.completed ? 'completed' : ''}`;
    taskElement.setAttribute('data-id', task.id);
    taskElement.draggable = true;
    
    let formattedDate = 'No Deadline';
    let isUrgent = false;
    
    if (task.deadline) {
      const deadline = new Date(task.deadline);
      isUrgent = !task.completed && deadline <= new Date();
      formattedDate = this.formatDate(deadline);
    }
    
    // Additional details for estimated time
    const estimatedTimeHtml = task.estimatedTime ? `
      <span class="task-detail">
        <i class="fas fa-clock"></i>
        <span>${task.estimatedTime} min</span>
      </span>
    ` : '';
    
    taskElement.innerHTML = `
      <div class="task-priority priority-${task.priority}"></div>
      <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
        ${task.completed ? '<i class="fas fa-check"></i>' : ''}
      </div>
      <div class="task-content">
        <div class="task-title">${task.title}</div>
        <div class="task-details">
          <span class="task-detail">
            <i class="fas fa-calendar-alt"></i>
            <span class="task-deadline ${isUrgent ? 'urgent' : ''}">${formattedDate}</span>
          </span>
          <span class="task-detail">
            <i class="fas fa-bookmark"></i>
            <span class="task-category badge badge-primary">${task.category}</span>
          </span>
          ${estimatedTimeHtml}
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-icon edit-task-btn" data-id="${task.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon btn-delete delete-task-btn" data-id="${task.id}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
    
    // Event listeners for task actions
    const checkbox = taskElement.querySelector('.task-checkbox');
    checkbox.addEventListener('click', () => this.toggleTaskComplete(task.id));
    
    const editBtn = taskElement.querySelector('.edit-task-btn');
    editBtn.addEventListener('click', () => this.openEditTaskModal(task.id));
    
    const deleteBtn = taskElement.querySelector('.delete-task-btn');
    deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
    
    // Drag and drop event listeners
    taskElement.addEventListener('dragstart', this.handleDragStart.bind(this));
    taskElement.addEventListener('dragend', this.handleDragEnd.bind(this));
    taskElement.addEventListener('dragover', this.handleDragOver.bind(this));
    taskElement.addEventListener('dragenter', this.handleDragEnter.bind(this));
    taskElement.addEventListener('dragleave', this.handleDragLeave.bind(this));
    taskElement.addEventListener('drop', this.handleDrop.bind(this));
    
    return taskElement;
  }
  
  // Format date for display
  formatDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const taskDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (taskDateOnly.getTime() === today.getTime()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (taskDateOnly.getTime() === tomorrow.getTime()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }
  
  // Update dashboard statistics
  updateStats() {
    const stats = this.taskManager.getStats();
    
    this.activeTasksCount.textContent = stats.activeTasks;
    this.activeTasksTotal.textContent = `of ${stats.totalTasks} tasks`;
    this.activeTasksProgress.style.width = `${stats.activeRate}%`;
    
    this.dueTodayCount.textContent = stats.dueTodayTasks;
    
    this.completedCount.textContent = stats.completedTasks;
    this.completedTotal.textContent = `of ${stats.totalTasks} tasks`;
    this.completedProgress.style.width = `${stats.completionRate}%`;
    
    this.overdueCount.textContent = stats.overdueTasks;
  }
  
  // Open modal to add a new task
  openAddTaskModal() {
    this.currentEditId = null;
    this.modalTitle.textContent = 'Add New Task';
    this.taskForm.reset();
    this.setDefaultDeadline();
    this.aiScheduleSuggestBtn.disabled = false;
    this.aiScheduleSuggestBtn.style.opacity = '1';
    this.openModal();
  }
  
  // Open modal to edit an existing task
  openEditTaskModal(id) {
    const task = this.taskManager.getAllTasks().find(t => t.id === id);
    if (!task) return;
    
    this.currentEditId = id;
    this.modalTitle.textContent = 'Edit Task';
    
    this.taskIdInput.value = task.id;
    this.taskTitleInput.value = task.title;
    this.taskDescriptionInput.value = task.description || '';
    
    if (task.deadline) {
      const deadline = new Date(task.deadline);
      const formattedDeadline = deadline.toISOString().slice(0, 16);
      this.taskDeadlineInput.value = formattedDeadline;
      this.taskDeadlineInput.disabled = false;
      this.taskDeadlineInput.setAttribute('required', 'required');
      this.taskNoDeadlineCheckbox.checked = false;
      this.aiScheduleSuggestBtn.disabled = false;
      this.aiScheduleSuggestBtn.style.opacity = '1';
    } else {
      this.taskDeadlineInput.value = '';
      this.taskDeadlineInput.disabled = true;
      this.taskDeadlineInput.removeAttribute('required');
      this.taskNoDeadlineCheckbox.checked = true;
      this.aiScheduleSuggestBtn.disabled = true;
      this.aiScheduleSuggestBtn.style.opacity = '0.5';
    }
    
    this.taskPriorityInput.value = task.priority;
    this.taskCategoryInput.value = task.category;
    this.taskCustomCategoryInput.value = '';
    this.taskEstimatedTimeInput.value = task.estimatedTime || '';
    
    this.openModal();
  }
  
  // Open task modal
  openModal() {
    this.taskModal.classList.add('active');
    this.taskTitleInput.focus();
  }
  
  // Close task modal
  closeModal() {
    this.taskModal.classList.remove('active');
  }
  
  // Add or update a task from the form
  addOrUpdateTask() {
    if (this.taskNoDeadlineCheckbox.checked) {
      this.taskDeadlineInput.removeAttribute('required');
    } else {
      this.taskDeadlineInput.setAttribute('required', 'required');
    }
    
    if (!this.taskForm.checkValidity()) {
      this.taskForm.reportValidity();
      return;
    }
    
    const title = this.taskTitleInput.value.trim();
    const description = this.taskDescriptionInput.value.trim();
    const deadline = this.taskNoDeadlineCheckbox.checked ? null : new Date(this.taskDeadlineInput.value);
    const priority = this.taskPriorityInput.value;
    const estimatedTime = this.taskEstimatedTimeInput.value ? parseInt(this.taskEstimatedTimeInput.value, 10) : null;
    let category = this.taskCategoryInput.value;
    
    const customCategory = this.taskCustomCategoryInput.value.trim();
    if (customCategory) {
      category = customCategory;
      this.taskManager.addCategory(customCategory);
    }
    
    if (!title || !priority || !category) {
      this.notificationService.showNotification('Please fill Title, Priority, and Category fields', 'error');
      return;
    }
    
    const taskData = {
      title,
      description,
      deadline,
      priority,
      category,
      estimatedTime
    };
    
    if (this.currentEditId) {
      this.taskManager.updateTask(this.currentEditId, taskData);
    } else {
      this.taskManager.addTask(taskData);
    }
    
    this.closeModal();
  }
  
  // Delete a task
  deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskManager.deleteTask(id);
    }
  }
  
  // Toggle task completion status
  toggleTaskComplete(id) {
    this.taskManager.toggleTaskComplete(id);
  }
  
  // Set default deadline for new tasks
  setDefaultDeadline() {
    const now = new Date();
    now.setHours(now.getHours() + 24);
    const formattedDate = now.toISOString().slice(0, 16);
    this.taskDeadlineInput.value = formattedDate;
    this.taskDeadlineInput.disabled = false;
    this.taskDeadlineInput.setAttribute('required', 'required');
    this.taskNoDeadlineCheckbox.checked = false;
  }
  
  // Toggle dark mode
  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    this.themeToggleBtn.innerHTML = isDarkMode 
      ? '<i class="fas fa-sun"></i>' 
      : '<i class="fas fa-moon"></i>';
    
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Update chart colors
    if (isDarkMode) {
      this.chartColors = {
        primary: '#3b82f6',
        primaryTransparent: 'rgba(59, 130, 246, 0.6)',
        primaryHover: '#2563eb',
        text: '#d1d5db',
        grid: '#374151',
        tooltipBg: '#1f2937',
        tooltipTitle: '#f9fafb',
        tooltipBody: '#9ca3af'
      };
    } else {
      this.chartColors = {
        primary: '#3b82f6',
        primaryTransparent: 'rgba(59, 130, 246, 0.6)',
        primaryHover: '#2563eb',
        text: '#6b7280',
        grid: '#e5e7eb',
        tooltipBg: 'white',
        tooltipTitle: '#111827',
        tooltipBody: '#4b5563'
      };
    }
    
    this.updateTaskScheduleGraph();
  }
  
  // Check for dark mode preference in localStorage
  checkDarkMode() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      this.themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
      
      this.chartColors = {
        primary: '#3b82f6',
        primaryTransparent: 'rgba(59, 130, 246, 0.6)',
        primaryHover: '#2563eb',
        text: '#d1d5db',
        grid: '#374151',
        tooltipBg: '#1f2937',
        tooltipTitle: '#f9fafb',
        tooltipBody: '#9ca3af'
      };
    } else {
      document.body.classList.remove('dark-mode');
      this.themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
  }
  
  // Check for tasks that are due soon and show notifications
  checkForDueTasks() {
    const now = new Date();
    const oneHourFromNow = new Date(now);
    oneHourFromNow.setHours(now.getHours() + 1);
    
    const tasks = this.taskManager.getAllTasks();
    
    const dueSoonTasks = tasks.filter(task => {
      if (task.completed) return false;
      
      const wasNotified = localStorage.getItem(`notified_${task.id}`);
      if (wasNotified) return false;
      
      if (!task.deadline) return false;
      
      const taskDeadline = new Date(task.deadline);
      return taskDeadline > now && taskDeadline <= oneHourFromNow;
    });
    
    dueSoonTasks.forEach(task => {
      const message = `Task due soon: ${task.title}`;
      this.notificationService.showNotification(message, 'warning', 5000);
      localStorage.setItem(`notified_${task.id}`, 'true');
    });
    
    setTimeout(() => this.checkForDueTasks(), 60000);
  }
  
  // Setup drag and drop
  setupDragAndDrop() {
    // Event listeners are added in createTaskElement
  }
  
  // Handle dragstart event
  handleDragStart(e) {
    this.draggedTaskId = e.currentTarget.getAttribute('data-id');
    e.currentTarget.style.opacity = '0.4';
  }
  
  // Handle dragend event
  handleDragEnd(e) {
    e.currentTarget.style.opacity = '1';
    document.querySelectorAll('.task-card').forEach(card => card.classList.remove('drag-over'));
  }
  
  // Handle dragover event
  handleDragOver(e) { 
    e.preventDefault(); 
    return false; 
  }
  
  // Handle dragenter event
  handleDragEnter(e) { 
    e.currentTarget.classList.add('drag-over'); 
  }
  
  // Handle dragleave event
  handleDragLeave(e) { 
    e.currentTarget.classList.remove('drag-over'); 
  }
  
  // Handle drop event
  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const targetTaskId = e.currentTarget.getAttribute('data-id');
    
    if (this.draggedTaskId !== targetTaskId) {
      const tasks = this.taskManager.getAllTasks();
      const draggedIndex = tasks.findIndex(t => t.id === this.draggedTaskId);
      const targetIndex = tasks.findIndex(t => t.id === targetTaskId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [movedTask] = tasks.splice(draggedIndex, 1);
        tasks.splice(targetIndex, 0, movedTask);
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        this.updateTaskList();
        this.notificationService.showNotification('Task order updated', 'success');
      }
    }
    
    return false;
  }
  
  // Update task schedule graph
  updateTaskScheduleGraph() {
    if (!this.taskScheduleCanvas) return;
    
    const { labels, dataCounts } = this.prepareScheduleData();
    
    if (this.taskScheduleChartInstance) {
      this.taskScheduleChartInstance.data.labels = labels;
      this.taskScheduleChartInstance.data.datasets[0].data = dataCounts;
      this.taskScheduleChartInstance.data.datasets[0].backgroundColor = this.chartColors.primaryTransparent;
      this.taskScheduleChartInstance.data.datasets[0].borderColor = this.chartColors.primary;
      this.taskScheduleChartInstance.data.datasets[0].hoverBackgroundColor = this.chartColors.primaryHover;
      
      this.taskScheduleChartInstance.options.scales.y.ticks.color = this.chartColors.text;
      this.taskScheduleChartInstance.options.scales.y.grid.color = this.chartColors.grid;
      this.taskScheduleChartInstance.options.scales.x.ticks.color = this.chartColors.text;
      this.taskScheduleChartInstance.options.plugins.legend.labels.color = this.chartColors.text;
      this.taskScheduleChartInstance.options.plugins.tooltip.backgroundColor = this.chartColors.tooltipBg;
      this.taskScheduleChartInstance.options.plugins.tooltip.titleColor = this.chartColors.tooltipTitle;
      this.taskScheduleChartInstance.options.plugins.tooltip.bodyColor = this.chartColors.tooltipBody;
      
      this.taskScheduleChartInstance.update();
    } else {
      const ctx = this.taskScheduleCanvas.getContext('2d');
      this.taskScheduleChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Tasks per Day',
            data: dataCounts,
            backgroundColor: this.chartColors.primaryTransparent,
            borderColor: this.chartColors.primary,
            borderWidth: 1,
            borderRadius: 5,
            barThickness: 'flex',
            maxBarThickness: 50,
            hoverBackgroundColor: this.chartColors.primaryHover,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { 
              beginAtZero: true, 
              ticks: { 
                stepSize: 1, 
                color: this.chartColors.text 
              }, 
              grid: { 
                color: this.chartColors.grid 
              } 
            },
            x: { 
              ticks: { 
                color: this.chartColors.text 
              }, 
              grid: { 
                display: false 
              } 
            }
          },
          plugins: {
            legend: { 
              display: true, 
              position: 'top', 
              labels: { 
                color: this.chartColors.text, 
                boxWidth: 20, 
                padding: 20 
              } 
            },
            tooltip: {
              backgroundColor: this.chartColors.tooltipBg, 
              titleColor: this.chartColors.tooltipTitle, 
              bodyColor: this.chartColors.tooltipBody,
              borderColor: this.chartColors.grid, 
              borderWidth: 1, 
              padding: 10, 
              cornerRadius: 4, 
              displayColors: false,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) { label += ': '; }
                  if (context.parsed.y !== null) { 
                    label += context.parsed.y + (context.parsed.y === 1 ? ' task' : ' tasks'); 
                  }
                  return label;
                }
              }
            }
          }
        }
      });
    }
  }
  
  // Prepare data for schedule graph
  prepareScheduleData() {
    const labels = [];
    const dataCounts = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      const dayName = currentDate.toLocaleDateString(undefined, { weekday: 'short' });
      labels.push(i === 0 ? `Today (${dayName})` : dayName);
      
      let count = 0;
      this.taskManager.getAllTasks().forEach(task => {
        if (!task.completed && task.deadline) {
          const taskDeadlineDate = new Date(task.deadline);
          taskDeadlineDate.setHours(0, 0, 0, 0);
          if (taskDeadlineDate.getTime() === currentDate.getTime()) {
            count++;
          }
        }
      });
      
      dataCounts.push(count);
    }
    
    return { labels, dataCounts };
  }
  
  // Toggle AI assistant panel
  toggleAiAssistant() {
    this.aiAssistantPanel.classList.toggle('active');
    if (this.aiAssistantPanel.classList.contains('active')) {
      this.aiAssistantPrompt.focus();
    }
  }
  
  // Send message to AI assistant
  sendAiMessage() {
    const message = this.aiAssistantPrompt.value.trim();
    if (!message) return;
    
    // Add user message to chat
    this.addUserMessageToChat(message);
    
    // Clear input
    this.aiAssistantPrompt.value = '';
    
    // Show typing indicator
    this.showAiTypingIndicator();
    
    // Get AI response
    this.aiService.getAssistantResponse(message).then(response => {
      // Remove typing indicator and add AI response
      this.removeAiTypingIndicator();
      this.addAiMessageToChat(response);
      
      // Scroll to bottom
      this.aiAssistantMessages.scrollTop = this.aiAssistantMessages.scrollHeight;
    });
  }
  
  // Add user message to chat
  addUserMessageToChat(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'user-message';
    messageEl.innerHTML = `
      <div class="user-avatar">
        <i class="fas fa-user"></i>
      </div>
      <div class="user-message-content">
        <p>${message}</p>
      </div>
    `;
    
    this.aiAssistantMessages.appendChild(messageEl);
    this.aiAssistantMessages.scrollTop = this.aiAssistantMessages.scrollHeight;
  }
  
  // Add AI message to chat
  addAiMessageToChat(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'ai-message';
    messageEl.innerHTML = `
      <div class="ai-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="ai-message-content">
        <p>${message}</p>
      </div>
    `;
    
    this.aiAssistantMessages.appendChild(messageEl);
    this.aiAssistantMessages.scrollTop = this.aiAssistantMessages.scrollHeight;
  }
  
  // Show AI typing indicator
  showAiTypingIndicator() {
    const typingEl = document.createElement('div');
    typingEl.className = 'ai-message ai-typing-indicator';
    typingEl.innerHTML = `
      <div class="ai-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="ai-message-content">
        <div class="ai-typing">
          <div class="ai-typing-dot"></div>
          <div class="ai-typing-dot"></div>
          <div class="ai-typing-dot"></div>
        </div>
      </div>
    `;
    
    this.aiAssistantMessages.appendChild(typingEl);
    this.aiAssistantMessages.scrollTop = this.aiAssistantMessages.scrollHeight;
  }
  
  // Remove AI typing indicator
  removeAiTypingIndicator() {
    const typingIndicator = this.aiAssistantMessages.querySelector('.ai-typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  // Open AI insights modal
  openAiInsightsModal() {
    this.aiInsightsModal.classList.add('active');
    
    // Start loading state
    this.aiInsightsContent.innerHTML = `
      <div class="ai-insights-loading">
        <div class="ai-loading-indicator">
          <div class="ai-loading-dot"></div>
          <div class="ai-loading-dot"></div>
          <div class="ai-loading-dot"></div>
        </div>
        <p>Analyzing your tasks and schedule...</p>
      </div>
    `;
    
    // Get AI insights
    this.aiService.getWorkloadAnalysis().then(insights => {
      this.aiInsightsContent.innerHTML = insights;
    });
  }
  
  // Close AI insights modal
  closeAiInsightsModal() {
    this.aiInsightsModal.classList.remove('active');
  }
  
  // Get AI title suggestion
  getAiTitleSuggestion() {
    const description = this.taskDescriptionInput.value.trim();
    if (!description) {
      this.notificationService.showNotification('Please enter a task description first', 'warning');
      return;
    }
    
    this.aiService.suggestTaskTitle(description).then(title => {
      if (title) {
        this.taskTitleInput.value = title;
        this.notificationService.showNotification('AI suggested a title based on your description', 'success');
      }
    });
  }
  
  // Get AI description suggestion
  getAiDescriptionSuggestion() {
    const title = this.taskTitleInput.value.trim();
    if (!title) {
      this.notificationService.showNotification('Please enter a task title first', 'warning');
      return;
    }
    
    this.aiService.expandTaskDescription(title).then(description => {
      if (description) {
        this.taskDescriptionInput.value = description;
        this.notificationService.showNotification('AI expanded your task description', 'success');
      }
    });
  }
  
  // Get AI schedule suggestion
  getAiScheduleSuggestion() {
    const title = this.taskTitleInput.value.trim();
    const description = this.taskDescriptionInput.value.trim();
    
    if (!title) {
      this.notificationService.showNotification('Please enter a task title first', 'warning');
      return;
    }
    
    this.aiService.suggestOptimalSchedule(title, description).then(date => {
      if (date) {
        this.taskDeadlineInput.value = date;
        this.notificationService.showNotification('AI suggested an optimal deadline', 'success');
      }
    });
  }
  
  // Get AI priority suggestion
  getAiPrioritySuggestion() {
    const title = this.taskTitleInput.value.trim();
    const description = this.taskDescriptionInput.value.trim();
    
    if (!title) {
      this.notificationService.showNotification('Please enter a task title first', 'warning');
      return;
    }
    
    this.aiService.suggestTaskPriority(title, description).then(priority => {
      if (priority) {
        this.taskPriorityInput.value = priority;
        this.notificationService.showNotification('AI suggested a priority level', 'success');
      }
    });
  }
  
  // Get AI category suggestion
  getAiCategorySuggestion() {
    const title = this.taskTitleInput.value.trim();
    const description = this.taskDescriptionInput.value.trim();
    
    if (!title) {
      this.notificationService.showNotification('Please enter a task title first', 'warning');
      return;
    }
    
    this.aiService.suggestTaskCategory(title, description).then(category => {
      if (category) {
        // Check if category exists in dropdown
        const categoryExists = Array.from(this.taskCategoryInput.options).some(
          option => option.value === category
        );
        
        if (categoryExists) {
          this.taskCategoryInput.value = category;
        } else {
          this.taskCustomCategoryInput.value = category;
        }
        
        this.notificationService.showNotification('AI suggested a category', 'success');
      }
    });
  }
  
  // Get AI time estimate
  getAiTimeEstimate() {
    const title = this.taskTitleInput.value.trim();
    const description = this.taskDescriptionInput.value.trim();
    const category = this.taskCategoryInput.value || this.taskCustomCategoryInput.value.trim();
    
    if (!title) {
      this.notificationService.showNotification('Please enter a task title first', 'warning');
      return;
    }
    
    this.aiService.estimateStudyTime(title, description, category).then(time => {
      if (time) {
        this.taskEstimatedTimeInput.value = time;
        this.notificationService.showNotification('AI estimated study time for this task', 'success');
      }
    });
  }
}