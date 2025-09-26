document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const emptyImage = document.querySelector('.empty-image');
    const progressBar = document.getElementById('progress');
    const numbers = document.getElementById('numbers');
    const statContainer = document.getElementById('stat-container');

    function toggleStatContainer() {
        const totalTasks = taskList.children.length;
        const completedTasks = taskList.querySelectorAll('.task-checkbox:checked').length;
        if (totalTasks === 0 || (totalTasks > 0 && completedTasks === totalTasks)) {
            statContainer.style.display = 'none';
        } else {
            statContainer.style.display = 'flex';
        }
    }

    function toggleEmptyState() {
        emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none';
        toggleStatContainer();
    }

    const updateprogress = (checkcompletion = true) => {
        const totalTasks = taskList.children.length;
        const completedTasks = taskList.querySelectorAll('.task-checkbox:checked').length;

        progressBar.style.width = totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%';
        numbers.textContent = `${completedTasks} / ${totalTasks}`;

        toggleStatContainer();

        if (checkcompletion && totalTasks > 0 && completedTasks === totalTasks) {
            Confetti();
         }
    };

    const savetasktolocalstorage = () => {
        const tasks = Array.from(taskList.querySelectorAll('li')).map(li => {
            return {
                text: li.querySelector('.task-text').textContent,
                completed: li.querySelector('.task-checkbox').checked
            };
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const loadTasksFromLocalStorage = () => {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        tasks.forEach(task => {
            const listItem = createListItem(task.text, task.completed);
            taskList.appendChild(listItem);
        });
        toggleEmptyState();
        updateprogress(true);
    };

    function createListItem(text, completed = false) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <label class="task-row">
                <input type="checkbox" class="task-checkbox"/>
                <span class="task-text">${escapeHtml(text)}</span>
            </label>
            <div class="task-buttons">
                <button type="button" class="edit-btn" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button type="button" class="delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        const checkbox = listItem.querySelector('.task-checkbox');
        const textSpan = listItem.querySelector('.task-text');
        checkbox.checked = completed;
        textSpan.style.textDecoration = checkbox.checked ? 'line-through' : 'none';

        checkbox.addEventListener('change', () => {
            textSpan.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
            updateprogress(true);
            savetasktolocalstorage();
        });

        listItem.querySelector('.edit-btn').addEventListener('click', () => {
            if (!checkbox.checked) {
                taskInput.value = textSpan.textContent;
                taskInput.focus();
                listItem.remove();
                toggleEmptyState();
                updateprogress(true);
                savetasktolocalstorage();
            }
        });

        listItem.querySelector('.delete-btn').addEventListener('click', () => {
            listItem.remove();
            toggleEmptyState();
            updateprogress(true);
            savetasktolocalstorage();
        });

        return listItem;
    }

    function addTask(event, checkcompletion = true) {
        event.preventDefault(); // prevent form submit reload
        const taskText = taskInput.value.trim();
        if (!taskText) return;
        const listItem = createListItem(taskText);
        taskList.appendChild(listItem);
        taskInput.value = '';
        toggleEmptyState();
        updateprogress(checkcompletion);
        savetasktolocalstorage();
    }

    // simple escape to avoid accidental HTML injection when using innerHTML
    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }

    form.addEventListener('submit', (e) => addTask(e, true));
    loadTasksFromLocalStorage();
    toggleEmptyState(); // set initial empty-image state
    updateprogress(true); // set initial progress state

    // Confetti function (fixed)
    function Confetti() {
        const end = Date.now() + 15 * 1000;
        const colors = ["#002cbbff", "#ffffff"];
        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors,
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors,
            });
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();
    }
});