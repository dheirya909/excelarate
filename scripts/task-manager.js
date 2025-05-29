// Task management functionality
export class TaskManager {
  constructor(notificationService) {
    this.notificationService = notificationService;
    this.tasks = [];
    this.categories = ['Math', 'Science', 'History', 'English', 'Computer Science', 'Other'];
    this.onTasksUpdated = null;
    this.onCategoriesUpdated = null;
  }

  // Initialize task manager
  init() {
    this.loadTasks();
    this.loadCategories();
  }

  // Register callbacks
  registerTasksUpdatedCallback(callback) {
    this.onTasksUpdated = callback;
  }

  registerCategoriesUpdatedCallback(callback) {
    this.onCategoriesUpdated = callback;
  }

  // Load tasks from localStorage
  loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    }
    if (this.onTasksUpdated) this.onTasksUpdated();
  }

  // Load categories from localStorage
  loadCategories() {
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      this.categories = JSON.parse(savedCategories);
    }
    if (this.onCategoriesUpdated) this.onCategoriesUpdated();
  }

  // Save tasks to localStorage
  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    if (this.onTasksUpdated) this.onTasksUpdated();
  }

  // Save categories to localStorage
  saveCategories() {
    localStorage.setItem('categories', JSON.stringify(this.categories));
    if (this.onCategoriesUpdated) this.onCategoriesUpdated();
  }

  // Get all tasks
  getAllTasks() {
    return [...this.tasks];
  }

  // Get all categories
  getAllCategories() {
    return [...this.categories];
  }

  // Add a new task
  addTask(taskData) {
    const newTask = {
      id: this.generateId(),
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.tasks.push(newTask);
    this.saveTasks();
    this.notificationService.showNotification('Task added successfully', 'success');
    return newTask;
  }

  // Update an existing task
  updateTask(id, taskData) {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      const updatedTask = {
        ...this.tasks[taskIndex],
        ...taskData,
        updatedAt: new Date().toISOString()
      };
      this.tasks[taskIndex] = updatedTask;
      this.saveTasks();
      this.notificationService.showNotification('Task updated successfully', 'success');
      return updatedTask;
    }
    return null;
  }

  // Delete a task
  deleteTask(id) {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.saveTasks();
    this.notificationService.showNotification('Task deleted successfully', 'success');
  }

  // Toggle task completion status
  toggleTaskComplete(id) {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
      this.tasks[taskIndex].updatedAt = new Date().toISOString();
      
      if (this.tasks[taskIndex].completed) {
        this.notificationService.showNotification('Task marked as completed', 'success');
      }
      
      this.saveTasks();
      return this.tasks[taskIndex];
    }
    return null;
  }

  // Add a new category
  addCategory(category) {
    if (!this.categories.includes(category)) {
      this.categories.push(category);
      this.saveCategories();
      return true;
    }
    return false;
  }

  // Generate a unique ID for tasks
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }

  // Get statistics for dashboard
  getStats() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(task => task.completed).length;
    const activeTasks = totalTasks - completedTasks;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    const dueTodayTasks = this.tasks.filter(task => {
      if (!task.deadline || task.completed) return false;
      const taskDate = new Date(task.deadline);
      return taskDate >= today && taskDate <= todayEnd;
    }).length;
    
    const now = new Date();
    const overdueTasks = this.tasks.filter(task => {
      if (!task.deadline || task.completed) return false; 
      return new Date(task.deadline) < now;
    }).length;
    
    return {
      totalTasks,
      completedTasks,
      activeTasks,
      dueTodayTasks,
      overdueTasks,
      completionRate: totalTasks ? (completedTasks / totalTasks) * 100 : 0,
      activeRate: totalTasks ? (activeTasks / totalTasks) * 100 : 0
    };
  }

  // Get tasks for specific date
  getTasksForDate(date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    return this.tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return taskDate >= targetDate && taskDate <= endDate;
    });
  }

  // Get upcoming tasks for next N days
  getUpcomingTasks(days = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    return this.tasks.filter(task => {
      if (!task.deadline || task.completed) return false;
      const taskDate = new Date(task.deadline);
      return taskDate >= today && taskDate < futureDate;
    });
  }

  // Get overdue tasks
  getOverdueTasks() {
    const now = new Date();
    return this.tasks.filter(task => {
      if (!task.deadline || task.completed) return false;
      return new Date(task.deadline) < now;
    });
  }

  // Get tasks by category
  getTasksByCategory(category) {
    return this.tasks.filter(task => task.category === category);
  }

  // Get tasks by priority
  getTasksByPriority(priority) {
    return this.tasks.filter(task => task.priority === priority);
  }

  // Get tasks by completion status
  getTasksByCompletionStatus(completed) {
    return this.tasks.filter(task => task.completed === completed);
  }

  // Filter and sort tasks
  filterAndSortTasks(filter, sort, categoryFilter, searchQuery) {
    let filteredTasks = [...this.tasks];
    
    // Apply filter
    if (filter === 'active') {
      filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
      filteredTasks = filteredTasks.filter(task => task.completed);
    } else if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filteredTasks = filteredTasks.filter(task => {
        if (!task.deadline || task.completed) return false;
        const taskDate = new Date(task.deadline);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });
    } else if (filter === 'upcoming') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);
      
      filteredTasks = filteredTasks.filter(task => {
        if (!task.deadline || task.completed) return false;
        const taskDate = new Date(task.deadline);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate >= today && taskDate <= threeDaysLater;
      });
    } else if (filter === 'overdue') {
      const now = new Date();
      filteredTasks = filteredTasks.filter(task => {
        if (!task.deadline || task.completed) return false;
        return new Date(task.deadline) < now;
      });
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.category === categoryFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task => {
        return (
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
        );
      });
    }
    
    // Apply sorting
    if (sort === 'deadline') {
      filteredTasks.sort((a, b) => {
        if (a.deadline === null && b.deadline === null) return 0;
        if (a.deadline === null) return 1;
        if (b.deadline === null) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
    } else if (sort === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      filteredTasks.sort((a, b) => {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    } else if (sort === 'added') {
      filteredTasks.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else if (sort === 'alphabetical') {
      filteredTasks.sort((a, b) => {
        return a.title.localeCompare(b.title);
      });
    }
    
    return filteredTasks;
  }
}