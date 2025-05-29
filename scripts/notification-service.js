// Notification service for displaying notifications
export class NotificationService {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }
  
  // Show a notification message
  showNotification(message, type = 'info', duration = 3000) {
    if (!this.container) {
      console.error('Notification container not found');
      return;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    
    notification.innerHTML = `
      <div class="notification-icon"><i class="fas ${iconClass}"></i></div>
      <div class="notification-content">
        <div class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
        <div class="notification-message">${message}</div>
      </div>
    `;
    
    this.container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('active'), 10);
    
    // Remove notification after duration
    setTimeout(() => {
      notification.classList.remove('active');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
}