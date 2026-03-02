class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentSort = 'time';
        this.editingTaskId = null;
        this.selectedPriority = 'medium';
        this.selectedType = 'short';
        
        // 计时相关
        this.timers = {};
        this.activeTimerId = null;
        
        // 设置相关
        this.currentTheme = localStorage.getItem('potato_theme') || 'default';
        this.showEncouragement = true; // 鼓励语句默认开启，不可取消
        this.currentMusic = localStorage.getItem('potato_music') || 'none';
        this.isMusicPlaying = false;
        this.audio = null;
        this.currentBg = localStorage.getItem('potato_bg') || 'default';
        this.customBgImage = localStorage.getItem('potato_custom_bg') || '';
        this.hideCompleted = localStorage.getItem('potato_hide_completed') === 'true';
        this.reportCycle = parseInt(localStorage.getItem('potato_report_cycle')) || 7;
        
        // 鼓励语句库 - 文艺风格
        this.encouragements = [
            "光阴不负赶路人，时光不负有心人 🌸",
            "星光不问赶路人，岁月不负有心人 ✨",
            "追风赶月莫停留，平芜尽处是春山 🏔️",
            "路虽远，行则将至；事虽难，做则必成 �",
            "不积跬步，无以至千里；不积小流，无以成江海 �",
            "长风破浪会有时，直挂云帆济沧海 ⛵",
            "宝剑锋从磨砺出，梅花香自苦寒来 🌺",
            "千淘万漉虽辛苦，吹尽狂沙始到金 💎",
            "博观而约取，厚积而薄发 📚",
            "天道酬勤，力耕不欺 🌾",
            "山重水复疑无路，柳暗花明又一村 🏞️",
            "会当凌绝顶，一览众山小 🏔️",
            "不经一番寒彻骨，怎得梅花扑鼻香 �",
            "纸上得来终觉浅，绝知此事要躬行 📝",
            "读书破万卷，下笔如有神 ✍️",
            "业精于勤荒于嬉，行成于思毁于随 �",
            "学而不思则罔，思而不学则殆 🤔",
            "三人行，必有我师焉 👥",
            "知之为知之，不知为不知，是知也 �",
            "温故而知新，可以为师矣 📖"
        ];
        
        this.initElements();
        this.initEventListeners();
        this.startDateTimeUpdate();
        this.applyTheme(this.currentTheme);
        this.applyBackground(this.currentBg);
        this.render();
    }

    initElements() {
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.taskModal = document.getElementById('taskModal');
        this.taskForm = document.getElementById('taskForm');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalClose = document.getElementById('modalClose');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.submitBtn = document.getElementById('submitBtn');
        
        this.taskTitle = document.getElementById('taskTitle');
        this.taskDescription = document.getElementById('taskDescription');
        this.taskDate = document.getElementById('taskDate');
        this.taskTime = document.getElementById('taskTime');
        
        this.sortTimeBtn = document.getElementById('sortTime');
        this.sortPriorityBtn = document.getElementById('sortPriority');
        
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.urgentTasksEl = document.getElementById('urgentTasks');
        
        this.priorityBtns = document.querySelectorAll('.priority-btn');
        this.typeBtns = document.querySelectorAll('.type-btn');
        
        // 设置相关元素
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsOverlay = document.getElementById('settingsOverlay');
        this.settingsModal = document.getElementById('settingsModal');
        this.settingsClose = document.getElementById('settingsClose');
        this.themeCards = document.querySelectorAll('.theme-card');
        this.musicSelect = document.getElementById('musicSelect');
        this.musicPlayBtn = document.getElementById('musicPlayBtn');
        this.musicPauseBtn = document.getElementById('musicPauseBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.bgPhotoOptions = document.querySelectorAll('.bg-photo-option');
        this.bgUploadInput = document.getElementById('bgUploadInput');
        
        // 报告相关元素
        this.hideCompletedToggle = document.getElementById('hideCompletedToggle');
        this.reportCycleInput = document.getElementById('reportCycle');
        this.generateReportBtn = document.getElementById('generateReportBtn');
        this.reportOverlay = document.getElementById('reportOverlay');
        this.reportModal = document.getElementById('reportModal');
        this.reportClose = document.getElementById('reportClose');
        this.reportModalClose = document.getElementById('reportModalClose');
        this.reportContent = document.getElementById('reportContent');
        this.exportReportBtn = document.getElementById('exportReportBtn');
    }

    initEventListeners() {
        this.addTaskBtn.addEventListener('click', () => this.openModal());
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.closeModal();
            }
        });
        
        this.taskForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        this.sortTimeBtn.addEventListener('click', () => this.setSort('time'));
        this.sortPriorityBtn.addEventListener('click', () => this.setSort('priority'));
        
        this.priorityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.priorityBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedPriority = btn.dataset.priority;
            });
        });
        
        this.typeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.typeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedType = btn.dataset.type;
            });
        });
        
        // 设置相关事件监听器
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => this.openSettings());
        }
        
        if (this.settingsClose) {
            this.settingsClose.addEventListener('click', () => this.closeSettings());
        }
        
        if (this.settingsOverlay) {
            this.settingsOverlay.addEventListener('click', (e) => {
                if (e.target === this.settingsOverlay) {
                    this.closeSettings();
                }
            });
        }
        
        // 皮肤选择
        this.themeCards.forEach(card => {
            card.addEventListener('click', () => {
                this.themeCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.applyTheme(card.dataset.theme);
            });
        });
        
        // 音乐控制
        if (this.musicSelect) {
            this.musicSelect.value = this.currentMusic;
            this.musicSelect.addEventListener('change', (e) => {
                this.currentMusic = e.target.value;
                localStorage.setItem('potato_music', this.currentMusic);
                if (this.currentMusic !== 'none') {
                    this.playMusic();
                } else {
                    this.stopMusic();
                }
            });
        }
        
        if (this.musicPlayBtn) {
            this.musicPlayBtn.addEventListener('click', () => this.playMusic());
        }
        
        if (this.musicPauseBtn) {
            this.musicPauseBtn.addEventListener('click', () => this.pauseMusic());
        }
        
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                if (this.audio) {
                    this.audio.volume = e.target.value / 100;
                }
            });
        }
        
        // 背景照片选择
        this.bgPhotoOptions.forEach(option => {
            option.addEventListener('click', () => {
                if (option.dataset.bg === 'upload') {
                    this.bgUploadInput.click();
                } else {
                    this.bgPhotoOptions.forEach(o => o.classList.remove('active'));
                    option.classList.add('active');
                    this.applyBackground(option.dataset.bg);
                }
            });
        });
        
        // 背景照片上传
        if (this.bgUploadInput) {
            this.bgUploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const imageData = event.target.result;
                        this.customBgImage = imageData;
                        localStorage.setItem('potato_custom_bg', imageData);
                        this.applyBackground('custom');
                        
                        // 更新上传选项为 active
                        this.bgPhotoOptions.forEach(o => {
                            o.classList.toggle('active', o.dataset.bg === 'upload');
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // 隐藏已完成任务
        if (this.hideCompletedToggle) {
            this.hideCompletedToggle.checked = this.hideCompleted;
            this.hideCompletedToggle.addEventListener('change', (e) => {
                this.hideCompleted = e.target.checked;
                localStorage.setItem('potato_hide_completed', this.hideCompleted);
                this.render();
            });
        }
        
        // 报告周期设置
        if (this.reportCycleInput) {
            this.reportCycleInput.value = this.reportCycle;
            this.reportCycleInput.addEventListener('change', (e) => {
                let value = parseInt(e.target.value);
                if (value < 3) value = 3;
                if (value > 90) value = 90;
                this.reportCycle = value;
                localStorage.setItem('potato_report_cycle', value);
            });
        }
        
        // 生成报告按钮
        if (this.generateReportBtn) {
            this.generateReportBtn.addEventListener('click', () => this.generateReport());
        }
        
        // 报告模态框事件
        if (this.reportClose) {
            this.reportClose.addEventListener('click', () => this.closeReport());
        }
        
        if (this.reportModalClose) {
            this.reportModalClose.addEventListener('click', () => this.closeReport());
        }
        
        if (this.reportOverlay) {
            this.reportOverlay.addEventListener('click', (e) => {
                if (e.target === this.reportOverlay) {
                    this.closeReport();
                }
            });
        }
        
        // 导出报告
        if (this.exportReportBtn) {
            this.exportReportBtn.addEventListener('click', () => this.exportReport());
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalOverlay.classList.contains('active')) {
                this.closeModal();
            } else if (e.key === 'Escape' && this.settingsOverlay.classList.contains('active')) {
                this.closeSettings();
            }
        });
    }

    loadTasks() {
        const saved = localStorage.getItem('potato_tasks');
        return saved ? JSON.parse(saved) : [];
    }

    saveTasks() {
        localStorage.setItem('potato_tasks', JSON.stringify(this.tasks));
    }

    startDateTimeUpdate() {
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
    }

    updateDateTime() {
        const now = new Date();
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const months = ['一月', '二月', '三月', '四月', '五月', '六月', 
                       '七月', '八月', '九月', '十月', '十一月', '十二月'];
        
        const dayName = days[now.getDay()];
        const day = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        
        document.getElementById('currentDay').textContent = day;
        document.getElementById('currentDate').textContent = `${month} ${year} · ${dayName}`;
        
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        document.getElementById('currentTime').textContent = `${hours}:${minutes}:${seconds}`;
    }

    openModal(task = null) {
        this.modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        if (task) {
            this.editingTaskId = task.id;
            this.modalTitle.textContent = '编辑任务';
            this.submitBtn.textContent = '保存修改';
            this.taskTitle.value = task.title;
            this.taskDescription.value = task.description || '';
            this.taskDate.value = task.date;
            this.taskTime.value = task.time;
            this.selectedPriority = task.priority;
            this.selectedType = task.type || 'short';
        } else {
            this.editingTaskId = null;
            this.modalTitle.textContent = '添加任务';
            this.submitBtn.textContent = '添加任务';
            this.taskForm.reset();
            
            const now = new Date();
            this.taskDate.value = now.toISOString().split('T')[0];
            this.taskTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            this.selectedPriority = 'medium';
            this.selectedType = 'short';
        }
        
        this.priorityBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.priority === this.selectedPriority);
        });
        
        this.typeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === this.selectedType);
        });
        
        setTimeout(() => this.taskTitle.focus(), 300);
    }

    closeModal() {
        this.modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        this.taskForm.reset();
        this.editingTaskId = null;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const taskData = {
            title: this.taskTitle.value.trim(),
            description: this.taskDescription.value.trim(),
            date: this.taskDate.value,
            time: this.taskTime.value,
            priority: this.selectedPriority,
            type: this.selectedType
        };
        
        if (!taskData.title) return;
        
        if (this.editingTaskId) {
            this.updateTask(this.editingTaskId, taskData);
        } else {
            this.addTask(taskData);
        }
        
        this.closeModal();
    }

    addTask(taskData) {
        const task = {
            id: Date.now().toString(),
            ...taskData,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.render();
    }

    updateTask(id, taskData) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            this.tasks[index] = {
                ...this.tasks[index],
                ...taskData
            };
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        if (taskElement) {
            taskElement.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.saveTasks();
                this.render();
            }, 300);
        }
    }

    toggleComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    startTimer(taskId) {
        // 如果有其他计时器在运行，先停止
        if (this.activeTimerId && this.activeTimerId !== taskId) {
            this.stopTimer(this.activeTimerId);
        }
        
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // 初始化计时器状态
        if (!this.timers[taskId]) {
            this.timers[taskId] = {
                startTime: Date.now(),
                elapsedTime: task.timeSpent || 0,
                interval: null,
                isRunning: false
            };
        }
        
        const timer = this.timers[taskId];
        if (!timer.isRunning) {
            timer.startTime = Date.now() - (timer.elapsedTime * 1000);
            timer.isRunning = true;
            this.activeTimerId = taskId;
            
            // 更新UI
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                const startBtn = taskElement.querySelector('[data-action="start-timer"]');
                const pauseBtn = taskElement.querySelector('[data-action="pause-timer"]');
                if (startBtn) startBtn.style.display = 'none';
                if (pauseBtn) pauseBtn.style.display = 'inline-block';
            }
            
            // 开始计时
            timer.interval = setInterval(() => {
                timer.elapsedTime = Math.floor((Date.now() - timer.startTime) / 1000);
                this.updateTimerDisplay(taskId);
            }, 1000);
        }
    }

    pauseTimer(taskId) {
        const timer = this.timers[taskId];
        if (timer && timer.isRunning) {
            // 显示确认弹窗
            this.showInterruptionConfirm(taskId, 'pause');
        }
    }
    
    showInterruptionConfirm(taskId, action) {
        const timer = this.timers[taskId];
        const elapsedMinutes = Math.floor(timer.elapsedTime / 60);
        
        // 创建确认弹窗
        const confirm = document.createElement('div');
        confirm.className = 'interruption-confirm';
        confirm.innerHTML = `
            <div class="interruption-icon">⏰</div>
            <div class="interruption-text">要放弃这次专注吗？</div>
            <div class="interruption-subtext">
                已经坚持了 ${elapsedMinutes} 分钟<br>
                💪 再坚持一下说不定就成功了呢！
            </div>
            <div class="interruption-actions">
                <button class="interruption-btn continue" data-action="continue">继续专注</button>
                <button class="interruption-btn stop" data-action="confirm-stop">停止计时</button>
            </div>
        `;
        
        document.body.appendChild(confirm);
        
        // 显示弹窗
        setTimeout(() => {
            confirm.classList.add('active');
        }, 100);
        
        // 继续专注按钮
        const continueBtn = confirm.querySelector('[data-action="continue"]');
        continueBtn.addEventListener('click', () => {
            confirm.classList.remove('active');
            setTimeout(() => {
                confirm.remove();
            }, 300);
        });
        
        // 确认停止按钮
        const stopBtn = confirm.querySelector('[data-action="confirm-stop"]');
        stopBtn.addEventListener('click', () => {
            confirm.classList.remove('active');
            setTimeout(() => {
                confirm.remove();
            }, 300);
            
            // 执行实际的暂停/停止操作
            if (action === 'pause') {
                this.executePause(taskId);
            } else if (action === 'stop') {
                this.executeStop(taskId);
            }
        });
    }
    
    executePause(taskId) {
        const timer = this.timers[taskId];
        if (timer && timer.isRunning) {
            clearInterval(timer.interval);
            timer.isRunning = false;
            this.activeTimerId = null;
            
            // 更新 UI
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                const startBtn = taskElement.querySelector('[data-action="start-timer"]');
                const pauseBtn = taskElement.querySelector('[data-action="pause-timer"]');
                if (startBtn) startBtn.style.display = 'inline-block';
                if (pauseBtn) pauseBtn.style.display = 'none';
            }
            
            // 保存已用时间
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.timeSpent = timer.elapsedTime;
                this.saveTasks();
            }
        }
    }

    stopTimer(taskId) {
        const timer = this.timers[taskId];
        if (timer && timer.isRunning) {
            // 显示确认弹窗
            this.showInterruptionConfirm(taskId, 'stop');
        } else if (timer) {
            // 已经暂停的计时器直接停止
            this.executeStop(taskId);
        }
    }
    
    executeStop(taskId) {
        const timer = this.timers[taskId];
        if (timer) {
            if (timer.isRunning) {
                clearInterval(timer.interval);
                timer.elapsedTime = Math.floor((Date.now() - timer.startTime) / 1000);
            }
            
            // 保存已用时间
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.timeSpent = timer.elapsedTime;
                this.saveTasks();
            }
            
            // 重置计时器
            delete this.timers[taskId];
            this.activeTimerId = null;
            
            // 更新 UI
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                const timerControls = taskElement.querySelector('.timer-controls');
                const startBtn = taskElement.querySelector('[data-action="start-timer"]');
                const pauseBtn = taskElement.querySelector('[data-action="pause-timer"]');
                if (timerControls) timerControls.style.display = 'none';
                if (startBtn) startBtn.style.display = 'inline-block';
                if (pauseBtn) pauseBtn.style.display = 'none';
                this.updateTimerDisplay(taskId);
            }
            
            // 显示鼓励语句（如果计时超过 1 分钟）
            if (timer.elapsedTime >= 60) {
                this.showEncouragement();
            }
        }
    }

    updateTimerDisplay(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        const timer = this.timers[taskId];
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        
        if (taskElement) {
            const timerDisplay = taskElement.querySelector('.timer-display');
            if (timerDisplay) {
                const timeSpent = timer ? timer.elapsedTime : (task.timeSpent || 0);
                timerDisplay.textContent = this.formatTime(timeSpent);
            }
        }
    }

    setSort(sortType) {
        this.currentSort = sortType;
        
        this.sortTimeBtn.classList.toggle('active', sortType === 'time');
        this.sortPriorityBtn.classList.toggle('active', sortType === 'priority');
        
        this.render();
    }

    getSortedTasks() {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        
        return [...this.tasks].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            if (this.currentSort === 'priority') {
                const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                if (priorityDiff !== 0) return priorityDiff;
            }
            
            const dateTimeA = new Date(`${a.date}T${a.time}`);
            const dateTimeB = new Date(`${b.date}T${b.time}`);
            return dateTimeA - dateTimeB;
        });
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const urgent = this.tasks.filter(t => t.priority === 'urgent' && !t.completed).length;
        
        this.totalTasksEl.textContent = total;
        this.completedTasksEl.textContent = completed;
        this.urgentTasksEl.textContent = urgent;
    }

    formatDateTime(date, time) {
        const taskDate = new Date(`${date}T${time}`);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
        
        let dateStr;
        if (taskDay.getTime() === today.getTime()) {
            dateStr = '今天';
        } else if (taskDay.getTime() === tomorrow.getTime()) {
            dateStr = '明天';
        } else {
            const month = taskDate.getMonth() + 1;
            const day = taskDate.getDate();
            dateStr = `${month}月${day}日`;
        }
        
        const hours = String(taskDate.getHours()).padStart(2, '0');
        const minutes = String(taskDate.getMinutes()).padStart(2, '0');
        
        return `${dateStr} ${hours}:${minutes}`;
    }

    getPriorityLabel(priority) {
        const labels = {
            low: '低',
            medium: '中',
            high: '高',
            urgent: '紧急'
        };
        return labels[priority] || '中';
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item priority-${task.priority} type-${task.type || 'short'}${task.completed ? ' completed' : ''}`;
        div.dataset.taskId = task.id;
        
        const typeIcon = task.type === 'long' ? 
            `<svg viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M19 3h-1V2c0-.6-.4-1-1-1s-1 .4-1 1v1H8V2c0-.6-.4-1-1-1s-1 .4-1 1v1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2z"/>
            </svg>` : 
            `<svg viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
            </svg>`;
        
        const typeLabel = task.type === 'long' ? '长期' : '短期';
        
        div.innerHTML = `
            <div class="task-header">
                <div class="task-checkbox" data-action="toggle">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                </div>
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                    <div class="task-meta">
                        <span class="task-time">
                            <svg viewBox="0 0 24 24">
                                <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                            </svg>
                            ${this.formatDateTime(task.date, task.time)}
                        </span>
                        <span class="task-type ${task.type || 'short'}">
                            ${typeIcon}
                            ${typeLabel}
                        </span>
                        <span class="task-priority ${task.priority}">${this.getPriorityLabel(task.priority)}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn timer" data-action="timer" title="计时">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.96 8.96 0 0 0 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                        </svg>
                    </button>
                    <button class="task-action-btn edit" data-action="edit" title="编辑">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </button>
                    <button class="task-action-btn delete" data-action="delete" title="删除">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
                <div class="task-timer" data-task-id="${task.id}">
                    <div class="timer-display">${task.timeSpent ? this.formatTime(task.timeSpent) : '00:00:00'}</div>
                    <div class="timer-controls" style="display: none;">
                        <button class="timer-btn start" data-action="start-timer">开始</button>
                        <button class="timer-btn pause" data-action="pause-timer" style="display: none;">暂停</button>
                        <button class="timer-btn stop" data-action="stop-timer">停止</button>
                    </div>
                </div>
            </div>
        `;
        
        div.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            const taskId = task.id;
            
            if (action === 'toggle') {
                this.toggleComplete(taskId);
            } else if (action === 'edit') {
                this.openModal(task);
            } else if (action === 'delete') {
                this.deleteTask(taskId);
            } else if (action === 'timer') {
                const timerControls = div.querySelector('.timer-controls');
                if (timerControls) {
                    timerControls.style.display = timerControls.style.display === 'flex' ? 'none' : 'flex';
                }
            } else if (action === 'start-timer') {
                this.startTimer(taskId);
            } else if (action === 'pause-timer') {
                this.pauseTimer(taskId);
            } else if (action === 'stop-timer') {
                this.stopTimer(taskId);
            }
        });
        
        return div;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 设置相关方法
    openSettings() {
        this.settingsOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // 更新当前主题的高亮状态
        this.themeCards.forEach(card => {
            card.classList.toggle('active', card.dataset.theme === this.currentTheme);
        });
    }

    closeSettings() {
        this.settingsOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('potato_theme', theme);
        
        if (theme === 'default') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        
        // 更新主题卡片高亮
        this.themeCards.forEach(card => {
            card.classList.toggle('active', card.dataset.theme === theme);
        });
        
        // 更新主题颜色 meta 标签
        this.updateThemeColor(theme);
    }
    
    applyBackground(bgType) {
        this.currentBg = bgType;
        localStorage.setItem('potato_bg', bgType);
        
        // 移除所有背景类
        document.body.classList.remove('bg-default', 'bg-gradient1', 'bg-gradient2', 'bg-gradient3', 'bg-custom');
        
        if (bgType === 'custom' && this.customBgImage) {
            document.body.classList.add('bg-custom');
            document.querySelector('.app-container').style.setProperty('--custom-bg', `url(${this.customBgImage})`);
            document.querySelector('.app-container::before').style.backgroundImage = `url(${this.customBgImage})`;
        } else {
            document.body.classList.add(`bg-${bgType}`);
        }
        
        // 更新背景选项高亮
        this.bgPhotoOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.bg === bgType);
        });
    }
    
    updateThemeColor(theme) {
        const themeColors = {
            'default': '#ff6b9d',
            'genshin': '#5a67d8',
            'honkai': '#d53f8c',
            'soulstreet': '#c53030',
            'aot': '#4a5568',
            'demon-slayer': '#9b59b6',
            'conan': '#34495e'
        };
        
        const color = themeColors[theme] || themeColors.default;
        const themeColorMeta = document.getElementById('themeColorMeta');
        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', color);
        }
        
        // 更新 manifest 主题颜色
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
            fetch('manifest.json')
                .then(res => res.json())
                .then(manifest => {
                    manifest.theme_color = color;
                    const blob = new Blob([JSON.stringify(manifest)], {type: 'application/json'});
                    const url = URL.createObjectURL(blob);
                    manifestLink.href = url;
                });
        }
    }

    playMusic() {
        if (this.currentMusic === 'none') return;
        
        // 创建音频元素
        if (!this.audio) {
            this.audio = new Audio();
            this.audio.loop = true;
            this.audio.volume = this.volumeSlider.value / 100;
        }
        
        // 这里使用示例音乐 URL，实际使用时需要替换为真实的音乐文件
        const musicUrls = {
            relax1: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            relax2: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            focus1: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            focus2: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
            sleep1: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
        };
        
        this.audio.src = musicUrls[this.currentMusic];
        this.audio.play().then(() => {
            this.isMusicPlaying = true;
            this.musicPlayBtn.style.display = 'none';
            this.musicPauseBtn.style.display = 'flex';
        }).catch(err => {
            console.log('音乐播放失败:', err);
        });
    }

    pauseMusic() {
        if (this.audio) {
            this.audio.pause();
            this.isMusicPlaying = false;
            this.musicPlayBtn.style.display = 'flex';
            this.musicPauseBtn.style.display = 'none';
        }
    }

    stopMusic() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.isMusicPlaying = false;
            this.musicPlayBtn.style.display = 'flex';
            this.musicPauseBtn.style.display = 'none';
        }
    }

    showEncouragement() {
        if (!this.showEncouragement) return;
        
        // 随机选择一条鼓励语句
        const encouragement = this.encouragements[Math.floor(Math.random() * this.encouragements.length)];
        
        // 创建鼓励语句弹窗
        const toast = document.createElement('div');
        toast.className = 'encouragement-toast';
        toast.innerHTML = `
            <div class="encouragement-icon">🎉</div>
            <div class="encouragement-text">${encouragement}</div>
            <button class="encouragement-close">继续</button>
        `;
        
        document.body.appendChild(toast);
        
        // 显示弹窗
        setTimeout(() => {
            toast.classList.add('active');
        }, 100);
        
        // 关闭按钮事件
        const closeBtn = toast.querySelector('.encouragement-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('active');
            setTimeout(() => {
                toast.remove();
            }, 300);
        });
        
        // 3 秒后自动关闭
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 5000);
    }

    render() {
        let sortedTasks = this.getSortedTasks();
        
        // 隐藏已完成任务
        if (this.hideCompleted) {
            sortedTasks = sortedTasks.filter(task => !task.completed);
        }
        
        if (sortedTasks.length === 0) {
            this.emptyState.style.display = 'flex';
            const existingTasks = this.taskList.querySelectorAll('.task-item');
            existingTasks.forEach(t => t.remove());
        } else {
            this.emptyState.style.display = 'none';
            
            const fragment = document.createDocumentFragment();
            sortedTasks.forEach(task => {
                fragment.appendChild(this.createTaskElement(task));
            });
            
            this.taskList.innerHTML = '';
            this.taskList.appendChild(this.emptyState);
            this.taskList.appendChild(fragment);
        }
        
        this.updateStats();
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
                
                // 检查更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // 有新版本可用
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}

// PWA 安装提示
let deferredPrompt;
let installButton = document.getElementById('installButton');

if (!installButton) {
    installButton = document.createElement('button');
    installButton.id = 'installButton';
    installButton.innerHTML = '📥 安装应用';
    installButton.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
        color: white;
        border: none;
        border-radius: 24px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        z-index: 999;
        box-shadow: 0 4px 20px rgba(255, 107, 157, 0.4);
        transition: all 0.3s ease;
        display: none;
    `;
    document.body.appendChild(installButton);
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.style.display = 'block';
    console.log('PWA install prompt available');
});

installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
        installButton.style.display = 'none';
    }
});

installButton.addEventListener('mouseenter', () => {
    installButton.style.transform = 'translateX(-50%) scale(1.05)';
});

installButton.addEventListener('mouseleave', () => {
    installButton.style.transform = 'translateX(-50%) scale(1)';
});

// 监听应用安装成功
window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    installButton.style.display = 'none';
    deferredPrompt = null;
});

// 显示更新通知
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.id = 'updateNotification';
    notification.innerHTML = `
        <div class="update-content">
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>有新版本可用！</span>
            <button class="update-btn">更新</button>
            <button class="update-dismiss">×</button>
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-secondary);
        border: 2px solid var(--primary-gradient);
        border-radius: 12px;
        padding: 12px 20px;
        box-shadow: 0 4px 20px var(--shadow-color);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideDown 0.3s ease;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        .update-content {
            display: flex;
            align-items: center;
            gap: 12px;
            color: var(--text-primary);
        }
        .update-btn {
            background: var(--primary-gradient);
            color: white;
            border: none;
            padding: 6px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
        }
        .update-dismiss {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    notification.querySelector('.update-btn').addEventListener('click', () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration && registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                }
            });
        }
    });
    
    notification.querySelector('.update-dismiss').addEventListener('click', () => {
        notification.remove();
    });
    
    // 10 秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 10000);
}

// 检查是否已安装
window.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Running as installed PWA');
        installButton.style.display = 'none';
    }
    
    // 网络状态监听
    const setupNetworkListener = () => {
        const networkStatus = document.createElement('div');
        networkStatus.id = 'networkStatus';
        networkStatus.innerHTML = '📡 离线模式';
        networkStatus.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f59e0b;
            color: white;
            text-align: center;
            padding: 8px;
            font-size: 12px;
            font-weight: 600;
            z-index: 10000;
            display: none;
        `;
        document.body.appendChild(networkStatus);
        
        const updateNetworkStatus = () => {
            if (!navigator.onLine) {
                networkStatus.style.display = 'block';
                networkStatus.innerHTML = '📡 离线模式 - 部分功能可能受限';
            } else {
                networkStatus.style.display = 'none';
            }
        };
        
        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
        
        // 初始检查
        updateNetworkStatus();
    };
    
    setupNetworkListener();
});

// 报告相关方法添加到 TaskManager 类中
TaskManager.prototype.closeReport = function() {
    this.reportOverlay.classList.remove('active');
    document.body.style.overflow = '';
};

TaskManager.prototype.generateReport = function() {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - this.reportCycle);
    
    // 过滤周期内的任务
    const periodTasks = this.tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= startDate && taskDate <= now;
    });
    
    // 统计数据
    const totalTasks = periodTasks.length;
    const completedTasks = periodTasks.filter(t => t.completed).length;
    const incompleteTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // 计算总专注时间
    const totalTimeSpent = periodTasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
    const totalHours = Math.floor(totalTimeSpent / 3600);
    const totalMinutes = Math.floor((totalTimeSpent % 3600) / 60);
    
    // 生成鼓励/勉励/批评语句
    let message = '';
    let messageType = '';
    
    if (completionRate >= 80) {
        message = this.getSuccessMessage(completionRate);
        messageType = 'success';
    } else if (completionRate >= 50) {
        message = this.getWarningMessage(completionRate);
        messageType = 'warning';
    } else {
        message = this.getErrorMessage(completionRate);
        messageType = 'error';
    }
    
    // 生成报告 HTML
    const reportHTML = this.generateReportHTML(periodTasks, totalTasks, completedTasks, incompleteTasks, completionRate, totalHours, totalMinutes, message, messageType, startDate, now);
    
    // 显示报告
    this.reportContent.innerHTML = reportHTML;
    this.reportOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
};

TaskManager.prototype.getSuccessMessage = function(rate) {
    const messages = [
        `太棒了！您在这个周期内完成了${rate}%的任务！您的努力和坚持得到了回报，继续保持这样的状态，成功属于您！🎉`,
        `优秀！${rate}%的完成率证明了您的实力！每一滴汗水都在浇灌成功的花朵，为您骄傲！🌟`,
        `令人瞩目的成绩！${rate}%的任务完成率展现了您的自律和毅力！天道酬勤，继续前行！✨`,
        `卓越的表现！${rate}%的完成率说明您正在稳步迈向目标！星光不问赶路人，时光不负有心人！🏆`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
};

TaskManager.prototype.getWarningMessage = function(rate) {
    const messages = [
        `不错的开始！您完成了${rate}%的任务。如果再加把劲，相信您能做得更好！路虽远，行则将至！💪`,
        `${rate}%的完成率还有提升空间！每一次努力都在积累成功的资本，加油！🌈`,
        `您已经完成了${rate}%的任务！坚持下去，下半程会更加精彩！追风赶月莫停留，平芜尽处是春山！🚀`,
        ` ${rate}%是个不错的成绩！但相信您还有更大潜力，期待您更精彩的表现！🌻`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
};

TaskManager.prototype.getErrorMessage = function(rate) {
    const messages = [
        `这个周期只完成了${rate}%的任务...不要气馁，失败是成功之母！重新振作，下一次会更好！🌱`,
        `${rate}%的完成率不太理想。但请记住：不积跬步，无以至千里。从小事做起，慢慢积累！📚`,
        `任务完成率${rate}%，这可能不是您想要的结果。但宝剑锋从磨砺出，梅花香自苦寒来！加油！💎`,
        `${rate}%...是时候反思一下了。业精于勤荒于嬉，行成于思毁于随。调整状态，重新出发！🔥`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
};

TaskManager.prototype.generateReportHTML = function(tasks, total, completed, incomplete, rate, hours, minutes, message, messageType, startDate, endDate) {
    const taskListHTML = tasks.map(task => `
        <div class="report-task-item">
            <span class="report-task-name">${this.escapeHtml(task.title)}</span>
            <span class="report-task-status ${task.completed ? 'completed' : 'incomplete'}">
                ${task.completed ? '✓ 已完成' : '✗ 未完成'}
            </span>
        </div>
    `).join('');
    
    return `
        <div class="report-section">
            <div class="report-title">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
                报告周期：${startDate.toLocaleDateString('zh-CN')} - ${endDate.toLocaleDateString('zh-CN')}
            </div>
            <div class="report-stats">
                <div class="report-stat-card">
                    <div class="report-stat-value">${total}</div>
                    <div class="report-stat-label">总任务数</div>
                </div>
                <div class="report-stat-card">
                    <div class="report-stat-value">${completed}</div>
                    <div class="report-stat-label">已完成</div>
                </div>
                <div class="report-stat-card">
                    <div class="report-stat-value">${incomplete}</div>
                    <div class="report-stat-label">未完成</div>
                </div>
                <div class="report-stat-card">
                    <div class="report-stat-value">${rate}%</div>
                    <div class="report-stat-label">完成率</div>
                </div>
            </div>
        </div>
        
        <div class="report-section">
            <div class="report-title">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                专注时间统计
            </div>
            <div class="report-stats">
                <div class="report-stat-card">
                    <div class="report-stat-value">${hours}</div>
                    <div class="report-stat-label">总小时数</div>
                </div>
                <div class="report-stat-card">
                    <div class="report-stat-value">${minutes}</div>
                    <div class="report-stat-label">总分钟数</div>
                </div>
            </div>
        </div>
        
        <div class="report-section">
            <div class="report-message ${messageType}">
                <p class="report-message-text">${message}</p>
            </div>
        </div>
        
        <div class="report-section">
            <div class="report-title">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
                任务清单
            </div>
            <div class="report-task-list">
                ${taskListHTML || '<p style="text-align: center; color: var(--text-muted);">暂无任务</p>'}
            </div>
        </div>
    `;
};

TaskManager.prototype.exportReport = function() {
    const reportContent = this.reportContent.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>任务报告</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px; 
                    background: #f5f5f5;
                }
                .report-modal { 
                    background: white; 
                    max-width: 800px; 
                    margin: 0 auto; 
                    padding: 30px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .report-section { 
                    margin-bottom: 30px; 
                    padding-bottom: 30px;
                    border-bottom: 1px solid #eee;
                }
                .report-title {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    color: #333;
                }
                .report-stats { 
                    display: grid; 
                    grid-template-columns: repeat(2, 1fr); 
                    gap: 15px; 
                }
                .report-stat-card {
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    border-radius: 8px;
                }
                .report-stat-value {
                    font-size: 32px;
                    font-weight: bold;
                    color: #667eea;
                    margin-bottom: 5px;
                }
                .report-stat-label {
                    font-size: 12px;
                    color: #666;
                }
                .report-message {
                    padding: 20px;
                    border-left: 4px solid #667eea;
                    background: #f8f9fa;
                    border-radius: 4px;
                }
                .report-message.success {
                    border-left-color: #4ade80;
                    background: rgba(74, 222, 128, 0.1);
                }
                .report-message.warning {
                    border-left-color: #f59e0b;
                    background: rgba(245, 158, 11, 0.1);
                }
                .report-message.error {
                    border-left-color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                }
                .report-task-list {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                }
                .report-task-item {
                    padding: 12px;
                    margin-bottom: 8px;
                    background: white;
                    border-radius: 4px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .report-task-status {
                    font-size: 12px;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-weight: 500;
                }
                .report-task-status.completed {
                    background: rgba(74, 222, 128, 0.2);
                    color: #22c55e;
                }
                .report-task-status.incomplete {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                @media print {
                    body { background: white; }
                    .report-modal { box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="report-modal">
                <h1 style="text-align: center; color: #667eea; margin-bottom: 30px;">📊 任务报告</h1>
                ${reportContent}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
};
