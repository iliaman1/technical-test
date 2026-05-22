document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const form = document.getElementById('employee-form');
    const formTitle = document.getElementById('form-title');
    const errorMessage = document.getElementById('error-message');

    const fullNameInput = document.getElementById('full_name');
    const positionInput = document.getElementById('position');
    const hireDateInput = document.getElementById('hire_date');
    const salaryInput = document.getElementById('salary');
    const managerIdInput = document.getElementById('manager_id');

    const path = window.location.pathname;
    const isEditMode = path.startsWith('/edit/');
    let employeeId = null;

    if (isEditMode) {
        employeeId = path.split('/')[2];
        formTitle.textContent = `Редактирование сотрудника (ID: ${employeeId})`;

        try {
            const response = await fetch(`/employees/${employeeId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Сотрудник не найден');
            const emp = await response.json();

            fullNameInput.value = emp.full_name;
            positionInput.value = emp.position;
            hireDateInput.value = emp.hire_date;
            salaryInput.value = emp.salary;
            managerIdInput.value = emp.manager_id || '';
        } catch (error) {
            errorMessage.textContent = error.message;
            form.style.display = 'none';
        }
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorMessage.textContent = '';

        const employeeData = {
            full_name: fullNameInput.value,
            position: positionInput.value,
            hire_date: hireDateInput.value,
            salary: parseFloat(salaryInput.value),
            manager_id: managerIdInput.value ? parseInt(managerIdInput.value, 10) : null
        };

        const method = isEditMode ? 'PUT' : 'POST';
        const url = isEditMode ? `/employees/${employeeId}` : '/employees/';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(employeeData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Не удалось сохранить данные');
            }

            window.location.href = '/list';

        } catch (error) {
            errorMessage.textContent = error.message;
        }
    });
});
