// Main application entry point
import { TaskManager } from './task-manager.js';
import { UIController } from './ui-controller.js';
import { AIService } from './ai-service.js';
import { NotificationService } from './notification-service.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize services
  const notificationService = new NotificationService('notification-container');
  const taskManager = new TaskManager(notificationService);
  const aiService = new AIService(taskManager, notificationService);
  
  // Initialize UI controller with services
  const uiController = new UIController(taskManager, aiService, notificationService);
  
  // Initialize the application
  uiController.init();
});