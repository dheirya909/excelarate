// AI service to handle AI functionality
export class AIService {
  constructor(taskManager, notificationService) {
    this.taskManager = taskManager;
    this.notificationService = notificationService;
    this.keywordPatterns = this.getKeywordPatterns();
    this.analysisCache = {};
  }
  
  // Initialize AI service
  init() {
    // Set up any initial AI state
    this.analyzeInitialTasks();
  }
  
  // Analyze initial tasks to see if there are any insights
  analyzeInitialTasks() {
    const tasks = this.taskManager.getAllTasks();
    if (tasks.length > 0) {
      // Update AI insights card with a message
      const aiInsightsMessage = document.getElementById('ai-insights-message');
      if (aiInsightsMessage) {
        aiInsightsMessage.textContent = `${tasks.length} tasks ready for analysis`;
      }
    }
  }
  
  // Get assistant response to a user message
  async getAssistantResponse(message) {
    // Simple rule-based AI assistant for MVP
    const normalizedMessage = message.toLowerCase();
    
    // Check for keywords in message
    let response = '';
    
    if (this.containsKeyword(normalizedMessage, this.keywordPatterns.workload)) {
      response = this.generateWorkloadAnalysis();
    }
    else if (this.containsKeyword(normalizedMessage, this.keywordPatterns.organize)) {
      response = this.generateTaskOrganization();
    }
    else if (this.containsKeyword(normalizedMessage, this.keywordPatterns.priority)) {
      response = this.generatePriorityAdvice();
    }
    else if (this.containsKeyword(normalizedMessage, this.keywordPatterns.schedule)) {
      response = this.generateScheduleAdvice();
    }
    else if (this.containsKeyword(normalizedMessage, this.keywordPatterns.deadlines)) {
      response = this.generateDeadlineAdvice();
    }
    else if (this.containsKeyword(normalizedMessage, this.keywordPatterns.overdue)) {
      response = this.generateOverdueAdvice();
    }
    else if (this.containsKeyword(normalizedMessage, this.keywordPatterns.help)) {
      response = this.generateHelpGuide();
    }
    else {
      response = this.generateGenericResponse(normalizedMessage);
    }
    
    // Simulate AI response time
    await this.delay(1000 + Math.random() * 1000);
    
    return response;
  }
  
  // Check if message contains any of the keywords
  containsKeyword(message, patterns) {
    for (const pattern of patterns) {
      if (message.includes(pattern)) {
        return true;
      }
    }
    return false;
  }
  
  // Get keyword patterns for different types of requests
  getKeywordPatterns() {
    return {
      workload: ['analyze workload', 'analyze my tasks', 'workload analysis', 'task analysis', 'analyze my schedule', 'how am i doing'],
      organize: ['organize tasks', 'organize my tasks', 'task organization', 'categorize tasks', 'group tasks', 'sort tasks'],
      priority: ['prioritize', 'priority', 'important tasks', 'urgent tasks', 'which tasks first', 'what should i do first'],
      schedule: ['schedule', 'plan', 'timetable', 'study plan', 'study schedule', 'create schedule', 'optimal schedule'],
      deadlines: ['deadline', 'due date', 'when should', 'finish by', 'complete by'],
      overdue: ['overdue', 'late', 'missed deadline', 'past due', 'behind schedule'],
      help: ['help', 'guide', 'tutorial', 'how to', 'how do i', 'explain']
    };
  }
  
  // Generate workload analysis
  generateWorkloadAnalysis() {
    const tasks = this.taskManager.getAllTasks();
    const activeTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    const overdueTasks = this.taskManager.getOverdueTasks();
    const todayTasks = this.taskManager.getTasksForDate(new Date());
    
    if (tasks.length === 0) {
      return "You don't have any tasks yet. Click the 'Add Task' button to get started, and I'll help you analyze your workload once you have some tasks.";
    }
    
    let workloadLevel = 'balanced';
    if (activeTasks.length > 10) {
      workloadLevel = 'heavy';
    } else if (activeTasks.length < 3) {
      workloadLevel = 'light';
    }
    
    let analysis = `Based on my analysis, your current workload is <strong>${workloadLevel}</strong>. `;
    analysis += `You have <strong>${activeTasks.length}</strong> active tasks and <strong>${completedTasks.length}</strong> completed tasks. `;
    
    if (overdueTasks.length > 0) {
      analysis += `⚠️ There are <strong>${overdueTasks.length}</strong> overdue tasks that need attention. `;
    }
    
    if (todayTasks.length > 0) {
      analysis += `Today, you have <strong>${todayTasks.length}</strong> tasks due. `;
    }
    
    // Add recommendations based on workload
    analysis += '<br><br><strong>Recommendations:</strong><br>';
    
    if (workloadLevel === 'heavy') {
      analysis += '• Consider breaking down large tasks into smaller, manageable subtasks<br>';
      analysis += '• Focus on high-priority items first<br>';
      analysis += '• Schedule specific time blocks for each task<br>';
      analysis += '• Delegate or reschedule lower priority tasks if possible';
    } else if (workloadLevel === 'light') {
      analysis += '• Great job managing your workload!<br>';
      analysis += '• This is a good time to plan ahead for upcoming projects<br>';
      analysis += '• Consider adding any tasks you\'ve been postponing';
    } else {
      analysis += '• Your workload seems well-balanced<br>';
      analysis += '• Continue prioritizing tasks by deadline and importance<br>';
      analysis += '• Set aside specific study time for each subject';
    }
    
    return analysis;
  }
  
  // Generate task organization advice
  generateTaskOrganization() {
    const tasks = this.taskManager.getAllTasks();
    
    if (tasks.length === 0) {
      return "You don't have any tasks yet. Add some tasks first, and then I can help you organize them.";
    }
    
    // Group tasks by category
    const tasksByCategory = {};
    tasks.forEach(task => {
      if (!tasksByCategory[task.category]) {
        tasksByCategory[task.category] = [];
      }
      tasksByCategory[task.category].push(task);
    });
    
    let response = "Here's how your tasks are organized by category:<br><br>";
    
    Object.entries(tasksByCategory).forEach(([category, categoryTasks]) => {
      const activeTasks = categoryTasks.filter(task => !task.completed).length;
      response += `<strong>${category}</strong>: ${activeTasks} active tasks out of ${categoryTasks.length} total<br>`;
    });
    
    response += '<br><strong>Organization Tips:</strong><br>';
    response += '• Group related tasks together and work on them in batches<br>';
    response += '• Set specific days for different categories (e.g., Math on Mondays, Science on Tuesdays)<br>';
    response += '• Color-code your tasks based on categories for visual organization<br>';
    response += '• Use the filter options to focus on one category at a time';
    
    return response;
  }
  
  // Generate priority advice
  generatePriorityAdvice() {
    const tasks = this.taskManager.getAllTasks();
    const activeTasks = tasks.filter(task => !task.completed);
    
    if (activeTasks.length === 0) {
      return "You don't have any active tasks to prioritize. Add some tasks first, and I'll help you prioritize them.";
    }
    
    // Sort tasks by priority and deadline
    const highPriorityTasks = activeTasks.filter(task => task.priority === 'high');
    const overdueTasks = this.taskManager.getOverdueTasks();
    const dueTodayTasks = this.taskManager.getTasksForDate(new Date());
    
    let response = "<strong>Here's what you should focus on:</strong><br><br>";
    
    if (overdueTasks.length > 0) {
      response += "🔴 <strong>Urgent: Overdue Tasks</strong><br>";
      overdueTasks.slice(0, 3).forEach(task => {
        response += `• ${task.title} (${task.category})<br>`;
      });
      if (overdueTasks.length > 3) {
        response += `• ...and ${overdueTasks.length - 3} more overdue tasks<br>`;
      }
      response += '<br>';
    }
    
    if (dueTodayTasks.length > 0) {
      response += "🟠 <strong>Due Today</strong><br>";
      dueTodayTasks.slice(0, 3).forEach(task => {
        response += `• ${task.title} (${task.priority} priority)<br>`;
      });
      if (dueTodayTasks.length > 3) {
        response += `• ...and ${dueTodayTasks.length - 3} more tasks due today<br>`;
      }
      response += '<br>';
    }
    
    if (highPriorityTasks.length > 0) {
      response += "🟡 <strong>High Priority Tasks</strong><br>";
      highPriorityTasks.slice(0, 3).forEach(task => {
        if (!overdueTasks.includes(task) && !dueTodayTasks.includes(task)) {
          const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline';
          response += `• ${task.title} (Due: ${deadline})<br>`;
        }
      });
      
      const remainingHighPriority = highPriorityTasks.filter(
        task => !overdueTasks.includes(task) && !dueTodayTasks.includes(task)
      ).length;
      
      if (remainingHighPriority > 3) {
        response += `• ...and ${remainingHighPriority - 3} more high priority tasks<br>`;
      }
    }
    
    response += '<br><strong>Prioritization Method:</strong><br>';
    response += '1. Tackle overdue tasks first to catch up<br>';
    response += '2. Complete tasks due today to stay on schedule<br>';
    response += '3. Work on high priority tasks with upcoming deadlines<br>';
    response += '4. Use free time for medium and low priority tasks';
    
    return response;
  }
  
  // Generate schedule advice
  generateScheduleAdvice() {
    const tasks = this.taskManager.getAllTasks();
    const activeTasks = tasks.filter(task => !task.completed);
    
    if (activeTasks.length === 0) {
      return "You don't have any tasks to schedule yet. Add some tasks first, and I'll help you create a study schedule.";
    }
    
    // Get tasks for the next 7 days
    const today = new Date();
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    let response = "<strong>Here's a suggested study schedule for the next 7 days:</strong><br><br>";
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      const dayName = weekdays[currentDate.getDay()];
      const dateStr = currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      const dayTasks = activeTasks.filter(task => {
        if (!task.deadline) return false;
        const taskDate = new Date(task.deadline);
        return taskDate.getDate() === currentDate.getDate() &&
               taskDate.getMonth() === currentDate.getMonth() &&
               taskDate.getFullYear() === currentDate.getFullYear();
      });
      
      let dayStr = `<strong>${dayName}, ${dateStr}</strong>: `;
      
      if (dayTasks.length > 0) {
        response += dayStr + `${dayTasks.length} tasks due<br>`;
        dayTasks.forEach(task => {
          const timeStr = new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          response += `• ${timeStr} - ${task.title} (${task.priority} priority)<br>`;
        });
      } else {
        // Suggest tasks that could be worked on
        const suggestedTasks = activeTasks
          .filter(task => {
            if (!task.deadline) return false;
            const taskDate = new Date(task.deadline);
            const daysUntilDue = Math.floor((taskDate - today) / (1000 * 60 * 60 * 24));
            return daysUntilDue > i && daysUntilDue <= i + 3; // Suggest tasks due within the next 3 days after this day
          })
          .sort((a, b) => {
            // Sort by priority first, then by deadline
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return new Date(a.deadline) - new Date(b.deadline);
          });
        
        if (suggestedTasks.length > 0) {
          response += dayStr + `No tasks due, but consider working on these upcoming tasks:<br>`;
          suggestedTasks.slice(0, 2).forEach(task => {
            const dueDate = new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            response += `• ${task.title} (Due: ${dueDate})<br>`;
          });
        } else {
          response += dayStr + `No tasks due. Take a break or work on long-term projects.<br>`;
        }
      }
      
      response += '<br>';
    }
    
    return response;
  }
  
  // Generate deadline advice
  generateDeadlineAdvice() {
    const tasks = this.taskManager.getAllTasks();
    const activeTasks = tasks.filter(task => !task.completed);
    const tasksWithDeadlines = activeTasks.filter(task => task.deadline);
    
    if (tasksWithDeadlines.length === 0) {
      return "You don't have any tasks with deadlines yet. Add deadlines to your tasks, and I'll provide advice on managing them.";
    }
    
    // Sort tasks by deadline
    tasksWithDeadlines.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    
    const overdueDeadlines = tasksWithDeadlines.filter(
      task => new Date(task.deadline) < now
    );
    
    const todayDeadlines = tasksWithDeadlines.filter(
      task => new Date(task.deadline) >= now && new Date(task.deadline) < tomorrow
    );
    
    const tomorrowDeadlines = tasksWithDeadlines.filter(
      task => new Date(task.deadline) >= tomorrow && new Date(task.deadline) < dayAfterTomorrow
    );
    
    const upcomingWeekDeadlines = tasksWithDeadlines.filter(
      task => {
        const deadline = new Date(task.deadline);
        return deadline >= dayAfterTomorrow && deadline < nextWeek;
      }
    );
    
    let response = "<strong>Deadline Analysis:</strong><br><br>";
    
    if (overdueDeadlines.length > 0) {
      response += "🔴 <strong>Overdue Deadlines</strong><br>";
      overdueDeadlines.forEach(task => {
        const date = new Date(task.deadline).toLocaleDateString();
        response += `• ${task.title} (Due: ${date})<br>`;
      });
      response += '<br>';
    }
    
    if (todayDeadlines.length > 0) {
      response += "🟠 <strong>Due Today</strong><br>";
      todayDeadlines.forEach(task => {
        const time = new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        response += `• ${task.title} (Due: ${time})<br>`;
      });
      response += '<br>';
    }
    
    if (tomorrowDeadlines.length > 0) {
      response += "🟡 <strong>Due Tomorrow</strong><br>";
      tomorrowDeadlines.forEach(task => {
        const time = new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        response += `• ${task.title} (Due: ${time})<br>`;
      });
      response += '<br>';
    }
    
    if (upcomingWeekDeadlines.length > 0) {
      response += "🟢 <strong>Due This Week</strong><br>";
      upcomingWeekDeadlines.forEach(task => {
        const date = new Date(task.deadline).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        response += `• ${task.title} (Due: ${date})<br>`;
      });
      response += '<br>';
    }
    
    response += '<strong>Deadline Management Tips:</strong><br>';
    response += '• Start with the most urgent deadlines first<br>';
    response += '• Break down tasks into smaller chunks to make progress<br>';
    response += '• Set personal deadlines 1-2 days before the actual deadline<br>';
    response += '• Use reminders for upcoming deadlines<br>';
    response += '• Consider requesting extensions for overdue tasks if possible';
    
    return response;
  }
  
  // Generate advice for overdue tasks
  generateOverdueAdvice() {
    const overdueTasks = this.taskManager.getOverdueTasks();
    
    if (overdueTasks.length === 0) {
      return "Great news! You don't have any overdue tasks. Keep up the good work!";
    }
    
    // Sort by how overdue they are (most overdue first)
    overdueTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    
    let response = `You have <strong>${overdueTasks.length} overdue tasks</strong> that need attention:<br><br>`;
    
    overdueTasks.forEach(task => {
      const dueDate = new Date(task.deadline).toLocaleDateString();
      const daysOverdue = Math.floor((new Date() - new Date(task.deadline)) / (1000 * 60 * 60 * 24));
      
      response += `• ${task.title} (Due: ${dueDate}, ${daysOverdue} days overdue)<br>`;
    });
    
    response += '<br><strong>Recommendations:</strong><br>';
    response += '• Prioritize completing the most overdue tasks first<br>';
    response += '• Contact your instructor about possible extensions if needed<br>';
    response += '• Set aside focused time to tackle these overdue items<br>';
    response += '• Break down large overdue tasks into smaller steps<br>';
    response += '• Once caught up, try to set earlier personal deadlines to avoid future delays';
    
    return response;
  }
  
  // Generate generic help guide
  generateHelpGuide() {
    let response = "<strong>Excelarate AI Assistant Help Guide</strong><br><br>";
    response += "I'm your AI assistant for task management. Here's how I can help you:<br><br>";
    
    response += "<strong>Task Analysis</strong><br>";
    response += "• Ask me to analyze your workload or tasks<br>";
    response += "• I can provide insights on your current task distribution<br>";
    response += "• Get recommendations for task management<br><br>";
    
    response += "<strong>Task Organization</strong><br>";
    response += "• I can help you organize and categorize your tasks<br>";
    response += "• Ask for help with task grouping or categorization<br>";
    response += "• Get advice on how to structure your tasks<br><br>";
    
    response += "<strong>Prioritization</strong><br>";
    response += "• Ask me which tasks to prioritize<br>";
    response += "• Get help deciding what to work on first<br>";
    response += "• I can suggest task orders based on deadlines and priority<br><br>";
    
    response += "<strong>Scheduling</strong><br>";
    response += "• I can help create study schedules<br>";
    response += "• Get suggestions for optimal task timing<br>";
    response += "• Ask for help planning your week<br><br>";
    
    response += "<strong>AI Features</strong><br>";
    response += "• Use the AI magic buttons in the task form for suggestions<br>";
    response += "• Click the AI Insights card for a complete workload analysis<br>";
    response += "• Try the quick action buttons below for common requests<br><br>";
    
    response += "How can I help you today?";
    
    return response;
  }
  
  // Generate a generic response based on the message content
  generateGenericResponse(message) {
    // If we can't match a specific pattern, give a generic response
    const genericResponses = [
      "I can help you manage your tasks more effectively. Try asking me to analyze your workload, prioritize tasks, or create a study schedule.",
      "Need help with your tasks? I can provide insights on deadlines, suggest priorities, or help organize your workload. Just ask!",
      "I'm your task assistant! I can help with organizing tasks, setting priorities, analyzing workload, and suggesting schedules.",
      "Not sure what to work on next? Ask me to prioritize your tasks or analyze your current workload.",
      "I can provide AI-powered insights for your tasks. Try asking about your workload, deadlines, or for scheduling advice."
    ];
    
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  }
  
  // Get workload analysis for the insights modal
  async getWorkloadAnalysis() {
    await this.delay(1500 + Math.random() * 1000);
    
    const tasks = this.taskManager.getAllTasks();
    if (tasks.length === 0) {
      return "<div class='ai-insight-section'><p>You don't have any tasks yet. Add some tasks to get AI insights.</p></div>";
    }
    
    // Generate workload analysis
    const activeTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    const overdueTasks = this.taskManager.getOverdueTasks();
    const todayTasks = this.taskManager.getTasksForDate(new Date());
    const upcomingTasks = this.taskManager.getUpcomingTasks(7).filter(task => !todayTasks.includes(task));
    
    // Group tasks by category
    const categoryCounts = {};
    activeTasks.forEach(task => {
      if (!categoryCounts[task.category]) {
        categoryCounts[task.category] = 0;
      }
      categoryCounts[task.category]++;
    });
    
    // Group tasks by priority
    const priorityCounts = {
      high: activeTasks.filter(task => task.priority === 'high').length,
      medium: activeTasks.filter(task => task.priority === 'medium').length,
      low: activeTasks.filter(task => task.priority === 'low').length
    };
    
    // Calculate workload scores
    const overdueScore = overdueTasks.length > 2 ? 'high' : overdueTasks.length > 0 ? 'medium' : 'low';
    const dueTodayScore = todayTasks.length > 4 ? 'high' : todayTasks.length > 1 ? 'medium' : 'low';
    const upcomingScore = upcomingTasks.length > 10 ? 'high' : upcomingTasks.length > 5 ? 'medium' : 'low';
    
    let html = '';
    
    // Workload summary
    html += `
      <div class="ai-insight-section">
        <h3>Workload Summary</h3>
        <div class="ai-insight-card">
          <div class="ai-insight-header">
            <div class="ai-insight-title">Overall Workload</div>
            <div class="ai-insight-score score-${overdueScore}">
              ${overdueScore.toUpperCase()}
            </div>
          </div>
          <div class="ai-insight-content">
            You have ${activeTasks.length} active tasks and ${completedTasks.length} completed tasks.
            ${overdueTasks.length > 0 ? `There are <strong>${overdueTasks.length} overdue tasks</strong> that need attention.` : ''}
            ${todayTasks.length > 0 ? `Today, you have <strong>${todayTasks.length} tasks due</strong>.` : ''}
          </div>
        </div>
        
        <div class="ai-recommendation">
          <div class="ai-recommendation-title">AI Recommendation</div>
          <div class="ai-recommendation-content">
            ${this.getWorkloadRecommendation(overdueTasks.length, todayTasks.length, upcomingTasks.length)}
          </div>
        </div>
      </div>
    `;
    
    // Task distribution
    html += `
      <div class="ai-insight-section">
        <h3>Task Distribution</h3>
        
        <div class="ai-insight-card">
          <div class="ai-insight-header">
            <div class="ai-insight-title">By Priority</div>
          </div>
          <div class="ai-insight-content">
            <div>High Priority: ${priorityCounts.high} tasks</div>
            <div>Medium Priority: ${priorityCounts.medium} tasks</div>
            <div>Low Priority: ${priorityCounts.low} tasks</div>
          </div>
        </div>
        
        <div class="ai-insight-card">
          <div class="ai-insight-header">
            <div class="ai-insight-title">By Category</div>
          </div>
          <div class="ai-insight-content">
            ${Object.entries(categoryCounts).map(([category, count]) => 
              `<div>${category}: ${count} tasks</div>`
            ).join('')}
          </div>
        </div>
        
        <div class="ai-recommendation">
          <div class="ai-recommendation-title">AI Recommendation</div>
          <div class="ai-recommendation-content">
            ${this.getDistributionRecommendation(priorityCounts, categoryCounts)}
          </div>
        </div>
      </div>
    `;
    
    // Upcoming deadlines
    html += `
      <div class="ai-insight-section">
        <h3>Deadline Analysis</h3>
        
        <div class="ai-insight-card">
          <div class="ai-insight-header">
            <div class="ai-insight-title">Deadline Pressure</div>
            <div class="ai-insight-score score-${dueTodayScore}">
              ${dueTodayScore.toUpperCase()}
            </div>
          </div>
          <div class="ai-insight-content">
            <div>Due today: ${todayTasks.length} tasks</div>
            <div>Due this week: ${upcomingTasks.length} tasks</div>
            <div>Overdue: ${overdueTasks.length} tasks</div>
          </div>
        </div>
        
        <div class="ai-recommendation">
          <div class="ai-recommendation-title">AI Recommendation</div>
          <div class="ai-recommendation-content">
            ${this.getDeadlineRecommendation(overdueTasks.length, todayTasks.length, upcomingTasks.length)}
          </div>
        </div>
      </div>
    `;
    
    return html;
  }
  
  // Get workload recommendation
  getWorkloadRecommendation(overdueCount, todayCount, upcomingCount) {
    if (overdueCount > 2) {
      return "Focus on catching up with overdue tasks before taking on new assignments. Consider setting aside dedicated blocks of time for each overdue task.";
    } else if (todayCount > 3) {
      return "You have several tasks due today. Prioritize by importance and break your work into focused 25-minute sessions with short breaks between them.";
    } else if (upcomingCount > 7) {
      return "You have many upcoming tasks. Start working on them now to spread out the workload. Create a schedule that allocates time for each task based on its priority and complexity.";
    } else if (overdueCount === 0 && todayCount === 0 && upcomingCount < 3) {
      return "Your workload is light. This is an excellent time to plan ahead, work on long-term projects, or add any tasks you've been postponing.";
    } else {
      return "Your workload appears manageable. Continue prioritizing tasks by deadline and importance, and try to complete tasks ahead of schedule when possible.";
    }
  }
  
  // Get distribution recommendation
  getDistributionRecommendation(priorityCounts, categoryCounts) {
    let recommendation = '';
    
    if (priorityCounts.high > priorityCounts.medium + priorityCounts.low) {
      recommendation += "You have many high priority tasks. Consider re-evaluating your priority assignments to ensure only truly urgent tasks are marked as high priority. ";
    } else if (priorityCounts.low > priorityCounts.high * 3) {
      recommendation += "Most of your tasks are low priority. Be sure you're not overlooking important deadlines or assignments. ";
    }
    
    const categories = Object.entries(categoryCounts);
    if (categories.length > 0) {
      categories.sort((a, b) => b[1] - a[1]);
      const highestCategory = categories[0];
      
      if (highestCategory[1] > 3 && categories.length > 1) {
        recommendation += `You have a high concentration of tasks in the ${highestCategory[0]} category. Consider spreading your work across different subjects to maintain balanced progress. `;
      }
    }
    
    if (!recommendation) {
      recommendation = "Your task distribution looks well-balanced across priorities and categories. Maintain this balance by regularly reviewing and adjusting priorities as needed.";
    }
    
    return recommendation;
  }
  
  // Get deadline recommendation
  getDeadlineRecommendation(overdueCount, todayCount, upcomingCount) {
    if (overdueCount > 0) {
      return "Address your overdue tasks immediately. Contact instructors about possible extensions if needed, and set aside dedicated time to complete these tasks as soon as possible.";
    } else if (todayCount > 2) {
      return "You have several tasks due today. Break them down into smaller steps and tackle them in order of priority. Start with the most challenging tasks when your energy is highest.";
    } else if (upcomingCount > 5 && upcomingCount <= 10) {
      return "You have a moderate number of upcoming deadlines. Create a daily schedule that allocates time to work on these tasks progressively rather than leaving them until the last minute.";
    } else if (upcomingCount > 10) {
      return "You have many upcoming deadlines. Start working on them now, focusing on the most imminent and important tasks first. Try to complete at least one task ahead of schedule each day.";
    } else {
      return "Your deadline schedule looks manageable. Use this time to work ahead and set personal deadlines 1-2 days before actual due dates to give yourself buffer time.";
    }
  }
  
  // Suggest a task title based on description
  async suggestTaskTitle(description) {
    await this.delay(500 + Math.random() * 800);
    
    if (!description) return null;
    
    // Simple keyword-based title generator
    const keywords = [
      { pattern: /\bexam\b|\btest\b|\bquiz\b|\bfinal\b/i, prefix: 'Prepare for' },
      { pattern: /\bessay\b|\bpaper\b|\bwrite\b|\bwriting\b/i, prefix: 'Write' },
      { pattern: /\bproject\b|\bpresentation\b|\bslides\b/i, prefix: 'Complete' },
      { pattern: /\bread\b|\breading\b|\bchapter\b|\btext\b|\bbook\b/i, prefix: 'Read' },
      { pattern: /\bresearch\b|\bstudy\b|\breview\b/i, prefix: 'Research' },
      { pattern: /\bhomework\b|\bassignment\b|\bproblem\b|\bexercise\b/i, prefix: 'Complete' },
      { pattern: /\blab\b|\bexperiment\b|\breport\b/i, prefix: 'Finish' },
    ];
    
    // Extract subject
    const subjects = [
      { pattern: /\bmath\b|\balgebra\b|\bcalculus\b|\bgeometry\b|\bstatistics\b/i, subject: 'Math' },
      { pattern: /\bphysics\b|\bchemistry\b|\bbiology\b|\bscience\b|\blab\b/i, subject: 'Science' },
      { pattern: /\bhistory\b|\bworld\b|\bamerican\b|\bcivics\b|\bsocial studies\b/i, subject: 'History' },
      { pattern: /\benglish\b|\bliterature\b|\bgrammar\b|\bessay\b|\bwriting\b|\breading\b/i, subject: 'English' },
      { pattern: /\bcomputer\b|\bcoding\b|\bprogramming\b|\bsoftware\b|\bapp\b|\bweb\b/i, subject: 'Computer Science' },
    ];
    
    // Find matching keywords
    let title = '';
    let subject = '';
    
    // Extract task type
    for (const keyword of keywords) {
      if (keyword.pattern.test(description)) {
        title = keyword.prefix;
        break;
      }
    }
    
    if (!title) {
      title = 'Complete';
    }
    
    // Extract subject
    for (const subj of subjects) {
      if (subj.pattern.test(description)) {
        subject = subj.subject;
        break;
      }
    }
    
    // Extract specific details
    const words = description.split(/\s+/);
    const significantWords = words.filter(word => 
      word.length > 3 && 
      !/^(the|and|for|with|this|that|these|those|from|about|will|have|what|when|where|why|how)$/i.test(word)
    );
    
    let specificDetail = '';
    if (significantWords.length > 0) {
      // Get 2-3 significant words for the specific detail
      const usableWords = significantWords.slice(0, Math.min(3, significantWords.length));
      specificDetail = usableWords.join(' ');
      
      // Capitalize first letter of specific detail
      specificDetail = specificDetail.charAt(0).toUpperCase() + specificDetail.slice(1);
    }
    
    // Construct the title
    if (subject && specificDetail) {
      return `${title} ${subject} ${specificDetail}`;
    } else if (subject) {
      return `${title} ${subject} Assignment`;
    } else if (specificDetail) {
      return `${title} ${specificDetail}`;
    } else {
      return `${title} Assignment`;
    }
  }
  
  // Expand a task description based on title
  async expandTaskDescription(title) {
    await this.delay(500 + Math.random() * 800);
    
    if (!title) return null;
    
    // Simple pattern-based description generator
    const patterns = [
      { 
        pattern: /\bexam\b|\btest\b|\bquiz\b|\bfinal\b/i, 
        template: "Study for $SUBJECT exam. Review all class notes, textbook chapters, and practice problems. Focus on key concepts and prepare a summary of important topics. Allocate time for practice questions and self-testing."
      },
      { 
        pattern: /\bessay\b|\bpaper\b|\bwrite\b|\bwriting\b/i, 
        template: "Write $SUBJECT essay/paper. Research the topic, create an outline, write a draft, and revise for clarity and coherence. Include proper citations and references according to the required format."
      },
      { 
        pattern: /\bproject\b|\bpresentation\b|\bslides\b/i, 
        template: "Work on $SUBJECT project/presentation. Gather all necessary resources and materials, prepare the content, and organize it in a logical structure. Create visual aids and practice delivery if it's a presentation."
      },
      { 
        pattern: /\bread\b|\breading\b|\bchapter\b|\btext\b|\bbook\b/i, 
        template: "Complete the assigned reading for $SUBJECT. Take notes on key concepts, important quotes, and questions that arise during reading. Prepare a summary of main points for future reference."
      },
      { 
        pattern: /\bresearch\b|\bstudy\b|\breview\b/i, 
        template: "Research the assigned topic for $SUBJECT. Gather information from credible sources, organize findings, and identify key points. Create a summary document that highlights the most important information."
      },
      { 
        pattern: /\bhomework\b|\bassignment\b|\bproblem\b|\bexercise\b/i, 
        template: "Complete $SUBJECT homework/assignment. Work through all problems/questions, showing all steps clearly. Check answers for accuracy and ensure all requirements of the assignment are met."
      },
      { 
        pattern: /\blab\b|\bexperiment\b|\breport\b/i, 
        template: "Complete $SUBJECT lab/report. Perform the required procedures, record all observations and data, analyze results, and write up findings according to the required format. Include all graphs, tables, and calculations as needed."
      },
    ];
    
    // Extract subject from title
    const subjects = [
      { pattern: /\bmath\b|\balgebra\b|\bcalculus\b|\bgeometry\b|\bstatistics\b/i, subject: 'Mathematics' },
      { pattern: /\bphysics\b|\bchemistry\b|\bbiology\b|\bscience\b|\blab\b/i, subject: 'Science' },
      { pattern: /\bhistory\b|\bworld\b|\bamerican\b|\bcivics\b|\bsocial studies\b/i, subject: 'History' },
      { pattern: /\benglish\b|\bliterature\b|\bgrammar\b|\bessay\b|\bwriting\b|\breading\b/i, subject: 'English' },
      { pattern: /\bcomputer\b|\bcoding\b|\bprogramming\b|\bsoftware\b|\bapp\b|\bweb\b/i, subject: 'Computer Science' },
    ];
    
    // Find matching pattern and subject
    let template = '';
    let subject = '';
    
    // Find task type
    for (const pattern of patterns) {
      if (pattern.pattern.test(title)) {
        template = pattern.template;
        break;
      }
    }
    
    if (!template) {
      template = "Complete this task according to the requirements. Break it down into manageable steps, allocate sufficient time, and ensure all components are completed thoroughly.";
    }
    
    // Find subject
    for (const subj of subjects) {
      if (subj.pattern.test(title)) {
        subject = subj.subject;
        break;
      }
    }
    
    if (!subject) {
      subject = 'this course';
    }
    
    // Replace placeholder with subject
    return template.replace('$SUBJECT', subject);
  }
  
  // Suggest optimal schedule based on task content
  async suggestOptimalSchedule(title, description) {
    await this.delay(500 + Math.random() * 800);
    
    if (!title) return null;
    
    const now = new Date();
    let suggestedDate = new Date(now);
    
    // Get all tasks to distribute workload
    const tasks = this.taskManager.getAllTasks();
    const tasksByDay = {};
    
    // Group tasks by day
    tasks.forEach(task => {
      if (task.deadline && !task.completed) {
        const date = new Date(task.deadline);
        const dateStr = date.toISOString().split('T')[0];
        
        if (!tasksByDay[dateStr]) {
          tasksByDay[dateStr] = [];
        }
        
        tasksByDay[dateStr].push(task);
      }
    });
    
    // Calculate task urgency factors
    let urgencyFactor = 3; // Default is 3 days ahead
    
    // Check keywords in title and description to adjust urgency
    const highUrgencyWords = /\bexam\b|\btest\b|\bquiz\b|\bfinal\b|\bdue\b|\bdeadline\b|\burgent\b|\bASAP\b/i;
    const mediumUrgencyWords = /\bessay\b|\bpaper\b|\bproject\b|\bpresentation\b|\breport\b|\bhomework\b|\bassignment\b/i;
    const lowUrgencyWords = /\bread\b|\breading\b|\breview\b|\bpractice\b|\boptional\b|\bextra\b/i;
    
    const combinedText = `${title} ${description || ''}`;
    
    if (highUrgencyWords.test(combinedText)) {
      urgencyFactor = 1; // 1 day ahead
    } else if (mediumUrgencyWords.test(combinedText)) {
      urgencyFactor = 2; // 2 days ahead
    } else if (lowUrgencyWords.test(combinedText)) {
      urgencyFactor = 4; // 4 days ahead
    }
    
    // Find the optimal day with the least number of tasks
    let bestDay = null;
    let minTasks = Infinity;
    
    for (let i = 1; i <= urgencyFactor + 2; i++) {
      const candidateDate = new Date(now);
      candidateDate.setDate(candidateDate.getDate() + i);
      const dateStr = candidateDate.toISOString().split('T')[0];
      
      const tasksOnDay = tasksByDay[dateStr] ? tasksByDay[dateStr].length : 0;
      
      // If this day has fewer tasks than our current minimum, update
      if (tasksOnDay < minTasks) {
        minTasks = tasksOnDay;
        bestDay = candidateDate;
      }
      
      // If we found a day with no tasks, that's optimal
      if (tasksOnDay === 0) {
        break;
      }
    }
    
    // If we couldn't find an optimal day, use the urgency factor
    if (!bestDay) {
      bestDay = new Date(now);
      bestDay.setDate(bestDay.getDate() + urgencyFactor);
    }
    
    // Set a reasonable time (afternoon)
    const hour = 14 + Math.floor(Math.random() * 4); // Between 2 PM and 6 PM
    bestDay.setHours(hour, 0, 0, 0);
    
    // Format the date for the datetime-local input
    return bestDay.toISOString().slice(0, 16);
  }
  
  // Suggest task priority based on content
  async suggestTaskPriority(title, description) {
    await this.delay(500 + Math.random() * 800);
    
    if (!title) return null;
    
    const combinedText = `${title} ${description || ''}`.toLowerCase();
    
    // Define keyword patterns for different priority levels
    const highPriorityPatterns = [
      /\bexam\b|\btest\b|\bquiz\b|\bfinal\b/,
      /\bdue\b|\bdeadline\b|\burgent\b|\bASAP\b/,
      /\bimportant\b|\bcritical\b|\bvital\b|\bcrucial\b/,
      /\bpresentation\b|\bspeech\b|\boral\b/
    ];
    
    const mediumPriorityPatterns = [
      /\bessay\b|\bpaper\b|\bproject\b|\breport\b/,
      /\bhomework\b|\bassignment\b|\bproblem set\b/,
      /\blab\b|\bexperiment\b/,
      /\bpreparation\b|\bstudy\b|\breview\b/
    ];
    
    const lowPriorityPatterns = [
      /\bread\b|\breading\b|\bchapter\b/,
      /\boptional\b|\bextra credit\b|\bbonus\b/,
      /\bpractice\b|\bworksheet\b/,
      /\bnote\b|\bnotes\b|\bsummary\b/
    ];
    
    // Check if text matches any high priority patterns
    for (const pattern of highPriorityPatterns) {
      if (pattern.test(combinedText)) {
        return 'high';
      }
    }
    
    // Check if text matches any medium priority patterns
    for (const pattern of mediumPriorityPatterns) {
      if (pattern.test(combinedText)) {
        return 'medium';
      }
    }
    
    // Check if text matches any low priority patterns
    for (const pattern of lowPriorityPatterns) {
      if (pattern.test(combinedText)) {
        return 'low';
      }
    }
    
    // Default to medium priority if no patterns match
    return 'medium';
  }
  
  // Suggest task category based on content
  async suggestTaskCategory(title, description) {
    await this.delay(500 + Math.random() * 800);
    
    if (!title) return null;
    
    const combinedText = `${title} ${description || ''}`.toLowerCase();
    
    // Define keyword patterns for different categories
    const categoryPatterns = [
      { pattern: /\bmath\b|\balgebra\b|\bcalculus\b|\bgeometry\b|\btrigonometry\b|\bstatistics\b|\barithmetic\b|\bnumbers\b|\bequation\b/i, category: 'Math' },
      { pattern: /\bphysics\b|\bchemistry\b|\bbiology\b|\banatomy\b|\bscience\b|\blaboratory\b|\blab\b|\bexperiment\b|\bscientific\b/i, category: 'Science' },
      { pattern: /\bhistory\b|\bworld\b|\bamerican\b|\beuropean\b|\bcivilization\b|\bcivics\b|\bsocial studies\b|\bpolitical\b|\bpast\b/i, category: 'History' },
      { pattern: /\benglish\b|\bliterature\b|\bgrammar\b|\bessay\b|\bwriting\b|\breading\b|\bpoetry\b|\bnovel\b|\bbook\b|\bstory\b/i, category: 'English' },
      { pattern: /\bcomputer\b|\bcoding\b|\bprogramming\b|\balgorithm\b|\bsoftware\b|\bapp\b|\bweb\b|\bjavascript\b|\bpython\b|\bcode\b/i, category: 'Computer Science' },
    ];
    
    // Check if text matches any category patterns
    for (const {pattern, category} of categoryPatterns) {
      if (pattern.test(combinedText)) {
        return category;
      }
    }
    
    // Default to "Other" if no patterns match
    return 'Other';
  }
  
  // Estimate study time for a task
  async estimateStudyTime(title, description, category) {
    await this.delay(500 + Math.random() * 800);
    
    if (!title) return null;
    
    const combinedText = `${title} ${description || ''}`.toLowerCase();
    
    // Base time by task type (in minutes)
    const taskTypeEstimates = {
      exam: 120,
      test: 90,
      quiz: 45,
      final: 180,
      essay: 120,
      paper: 150,
      project: 180,
      presentation: 90,
      homework: 60,
      assignment: 60,
      reading: 45,
      lab: 90,
      report: 60,
      practice: 30,
      review: 45,
      study: 60
    };
    
    // Category multipliers
    const categoryMultipliers = {
      'Math': 1.2,
      'Science': 1.3,
      'History': 1.1,
      'English': 1.0,
      'Computer Science': 1.4,
      'Other': 1.0
    };
    
    // Complexity indicators
    const complexityIndicators = [
      { pattern: /\bcomplex\b|\bdifficult\b|\bhard\b|\bchallenging\b/i, multiplier: 1.5 },
      { pattern: /\bdetailed\b|\bthorough\b|\bcomprehensive\b/i, multiplier: 1.3 },
      { pattern: /\bsimple\b|\beasy\b|\bbasic\b/i, multiplier: 0.8 },
      { pattern: /\bbrief\b|\bshort\b|\bquick\b/i, multiplier: 0.7 }
    ];
    
    // Start with a base estimate
    let baseEstimate = 60; // Default: 60 minutes
    
    // Check for task type keywords
    for (const [type, estimate] of Object.entries(taskTypeEstimates)) {
      if (combinedText.includes(type)) {
        baseEstimate = estimate;
        break;
      }
    }
    
    // Apply category multiplier
    const categoryMultiplier = categoryMultipliers[category] || 1.0;
    baseEstimate *= categoryMultiplier;
    
    // Apply complexity multiplier if any indicators are found
    for (const {pattern, multiplier} of complexityIndicators) {
      if (pattern.test(combinedText)) {
        baseEstimate *= multiplier;
        break;
      }
    }
    
    // Round to nearest 5 minutes
    return Math.round(baseEstimate / 5) * 5;
  }
  
  // Utility function to add delay
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}