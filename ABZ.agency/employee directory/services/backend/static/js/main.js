document.addEventListener('DOMContentLoaded', () => {
    const employeeTree = document.getElementById('employee-tree');
    const token = localStorage.getItem('access_token');

    async function renderEmployee(employee, parentElement, isTopLevel = false) {
        const li = document.createElement('li');
        li.className = 'employee';
        li.setAttribute('data-employee-id', employee.id);
        li.setAttribute('draggable', 'true');

        if (employee.has_subordinates || isTopLevel) {
            li.classList.add('has-subordinates');
        }

        const infoSpan = document.createElement('span');
        infoSpan.className = 'employee-info';
        infoSpan.textContent = `${employee.full_name} (${employee.position})`;

        const additionalInfoSpan = document.createElement('span');
        additionalInfoSpan.className = 'additional-info';
        additionalInfoSpan.textContent = ` | ЗП: ${employee.salary} | Дата найма: ${employee.hire_date}`;

        li.appendChild(infoSpan);
        li.appendChild(additionalInfoSpan);

        const subordinatesUl = document.createElement('ul');
        subordinatesUl.className = 'subordinates';
        li.appendChild(subordinatesUl);
        parentElement.appendChild(li);

        li.addEventListener('dragstart', (event) => {
            event.stopPropagation();
            event.dataTransfer.setData('text/plain', employee.id);
            event.dataTransfer.effectAllowed = 'move';
            setTimeout(() => li.style.opacity = '0.5', 0);
        });

        li.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.stopPropagation();
            li.style.border = '1px dashed blue';
        });

        li.addEventListener('dragleave', (event) => {
            event.stopPropagation();
            li.style.border = '';
        });

        li.addEventListener('dragend', (event) => {
            event.stopPropagation();
            li.style.opacity = '1';
        });

        li.addEventListener('drop', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            li.style.border = '';

            const draggedEmployeeId = event.dataTransfer.getData('text/plain');
            const newManagerId = employee.id;

            if (draggedEmployeeId && newManagerId !== draggedEmployeeId) {
                if (!token) {
                    alert("Ошибка: Вы не авторизованы.");
                    return;
                }
                try {
                    const response = await fetch(`/employees/${draggedEmployeeId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ manager_id: newManagerId })
                    });

                    if (response.ok) {
                        const draggedElement = document.querySelector(`li[data-employee-id='${draggedEmployeeId}']`);
                        if (draggedElement) {
                            const targetSubordinatesList = li.querySelector('.subordinates');
                            targetSubordinatesList.appendChild(draggedElement);
                            li.classList.add('open', 'has-subordinates');
                            targetSubordinatesList.classList.add('open');
                        }
                    } else {
                        const errorData = await response.json();
                        alert(`Ошибка обновления: ${errorData.detail || 'Не удалось изменить менеджера'}`);
                    }
                } catch (error) {
                    alert("Сетевая ошибка при изменении менеджера.");
                    console.error("Drop error:", error);
                }
            }
        });

        li.addEventListener('click', async (event) => {
            event.stopPropagation();
            if (event.target.tagName === 'A' || event.target.tagName === 'BUTTON') return;
            if (!li.classList.contains('has-subordinates')) return;

            li.classList.toggle('open');
            subordinatesUl.classList.toggle('open');

            const isOpen = li.classList.contains('open');
            const hasNoChildren = subordinatesUl.children.length === 0;

            if (isOpen && hasNoChildren) {
                await fetchSubordinates(employee.id, subordinatesUl, li);
            }
        });
    }

    async function fetchSubordinates(employeeId, subordinatesUl, parentLi) {
        try {
            const response = await fetch(`/employees/${employeeId}/subordinates`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const subordinates = await response.json();

            if (subordinates.length === 0) {
                parentLi.classList.remove('has-subordinates');
            } else {
                for (const sub of subordinates) {
                    await renderEmployee(sub, subordinatesUl);
                }
            }
        } catch (error) {
            console.error('Fetch subordinates error:', error);
            subordinatesUl.innerHTML = `<li class="text-danger small">Ошибка загрузки.</li>`;
            parentLi.classList.remove('has-subordinates');
        }
    }

    async function init() {
        try {
            const response = await fetch('/employees/tree');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const topLevelEmployees = await response.json();

            if (topLevelEmployees.length === 0) {
                employeeTree.innerHTML = '<li>Нет сотрудников для отображения.</li>';
                return;
            }

            for (const employee of topLevelEmployees) {
                await renderEmployee(employee, employeeTree, true);
            }
        } catch (error) {
            console.error('Init error:', error);
            employeeTree.innerHTML = `<li class="text-danger">Ошибка загрузки: ${error.message}</li>`;
        }
    }

    init();
});
