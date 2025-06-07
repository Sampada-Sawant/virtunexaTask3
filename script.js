document.addEventListener('DOMContentLoaded', function() {
    const sessionForm = document.getElementById('session-form');
    const sessionsContainer = document.getElementById('sessions-container');
    
    // Load sessions from localStorage when page loads
    loadSessions();
    
    sessionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const sessionName = document.getElementById('session-name').value;
        const sessionDate = document.getElementById('session-date').value;
        const sessionTime = document.getElementById('session-time').value;
        const sessionTasks = document.getElementById('session-tasks').value;
        
        // Validate inputs
        if (!sessionName || !sessionDate || !sessionTime || !sessionTasks) {
            alert('Please fill in all fields');
            return;
        }
        
        // Create session object
        const session = {
            id: Date.now(), // Simple unique ID
            name: sessionName,
            date: sessionDate,
            time: sessionTime,
            tasks: sessionTasks.split(',').map(task => ({
                name: task.trim(),
                completed: false
            }))
        };
        
        // Save session
        saveSession(session);
        
        // Clear form
        sessionForm.reset();
    });
    
    function saveSession(session) {
        let sessions = JSON.parse(localStorage.getItem('studySessions')) || [];
        sessions.push(session);
        localStorage.setItem('studySessions', JSON.stringify(sessions));
        loadSessions();
    }
    
    function loadSessions() {
        const sessions = JSON.parse(localStorage.getItem('studySessions')) || [];
        sessionsContainer.innerHTML = '';
        
        if (sessions.length === 0) {
            sessionsContainer.innerHTML = '<p class="empty-message">No study sessions planned yet.</p>';
            return;
        }
        
        // Sort sessions by date and time
        sessions.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateA - dateB;
        });
        
        sessions.forEach(session => {
            const sessionCard = document.createElement('div');
            sessionCard.className = 'session-card';
            sessionCard.dataset.id = session.id;
            
            // Format date for display
            const dateObj = new Date(`${session.date} ${session.time}`);
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            const formattedDate = dateObj.toLocaleDateString('en-US', options);
            
            let tasksHTML = '';
            session.tasks.forEach((task, index) => {
                tasksHTML += `
                    <div class="task-item">
                        <input type="checkbox" id="task-${session.id}-${index}" 
                               ${task.completed ? 'checked' : ''} 
                               data-session-id="${session.id}" 
                               data-task-index="${index}">
                        <label for="task-${session.id}-${index}" 
                               class="${task.completed ? 'completed' : ''}">${task.name}</label>
                    </div>
                `;
            });
            
            sessionCard.innerHTML = `
                <button class="delete-btn" data-id="${session.id}">×</button>
                <h3>${session.name}</h3>
                <p><strong>When:</strong> ${formattedDate}</p>
                <div class="tasks">
                    <p><strong>Tasks:</strong></p>
                    ${tasksHTML}
                </div>
            `;
            
            sessionsContainer.appendChild(sessionCard);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const sessionId = parseInt(this.dataset.id);
                deleteSession(sessionId);
            });
        });
        
        // Add event listeners to task checkboxes
        document.querySelectorAll('.task-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const sessionId = parseInt(this.dataset.sessionId);
                const taskIndex = parseInt(this.dataset.taskIndex);
                toggleTaskCompletion(sessionId, taskIndex, this.checked);
            });
        });
    }
    
    function deleteSession(sessionId) {
        let sessions = JSON.parse(localStorage.getItem('studySessions')) || [];
        sessions = sessions.filter(session => session.id !== sessionId);
        localStorage.setItem('studySessions', JSON.stringify(sessions));
        loadSessions();
    }
    
    function toggleTaskCompletion(sessionId, taskIndex, isCompleted) {
        let sessions = JSON.parse(localStorage.getItem('studySessions')) || [];
        const sessionIndex = sessions.findIndex(session => session.id === sessionId);
        
        if (sessionIndex !== -1) {
            sessions[sessionIndex].tasks[taskIndex].completed = isCompleted;
            localStorage.setItem('studySessions', JSON.stringify(sessions));
        }
    }
});