document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('employee-table-body');
    const urlParams = new URLSearchParams(window.location.search);
    let currentSort = urlParams.get('sort_by') || 'full_name';
    let currentOrder = urlParams.get('order') || 'asc';
    async function loadTableData() {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Загрузка...</td></tr>';
        try {
            const response = await fetch(`/employees/?sort_by=${currentSort}&order=${currentOrder}`);
            const employees = await response.json();
            tbody.innerHTML = '';
            if (employees.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">Сотрудники не найдены.</td></tr>';
                return;
            }
            employees.forEach(emp => {
                const row = document.createElement('tr');
                const hireDate = new Date(emp.hire_date).toLocaleDateString();
                row.innerHTML = `
                            <td>${emp.full_name}</td>
                            <td>${emp.position}</td>
                            <td>${hireDate}</td>
                            <td>${emp.salary.toLocaleString('ru-RU')}</td>
                        `;
                tbody.appendChild(row);
            });
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Ошибка загрузки данных.</td></tr>';
            console.error("Failed to load employees:", error);
        }
    }
    function updateHeaderLinks() {
        document.querySelectorAll('th a[data-sort]').forEach(a => {
            const sortKey = a.getAttribute('data-sort');
            let nextOrder = 'asc';
            a.textContent = a.textContent.replace(' ▲', '').replace(' ▼', '');
            if (currentSort === sortKey) {
                if (currentOrder === 'asc') {
                    nextOrder = 'desc';
                    a.textContent += ' ▲';
                } else {
                    a.textContent += ' ▼';
                }
            }
            a.href = `/list?sort_by=${sortKey}&order=${nextOrder}`;
        });
    }
    await loadTableData();
    updateHeaderLinks();
});
