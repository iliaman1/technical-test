document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    const tbody = document.getElementById('employee-table-body');
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const headerLinks = document.querySelectorAll('th a[data-sort]');

    if (!tbody || !searchInput || !searchForm) {
        console.error("One or more required elements are missing from the page!");
        return;
    }

    let currentSort = 'full_name';
    let currentOrder = 'asc';
    let currentSearch = '';

    function updateUrl() {
        const newUrl = new URL('/list', window.location.origin);
        if (currentSearch) {
            newUrl.searchParams.append('search', currentSearch);
        }
        newUrl.searchParams.append('sort_by', currentSort);
        newUrl.searchParams.append('order', currentOrder);
        history.pushState({ path: newUrl.href }, '', newUrl.href);
    }

    function readUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        currentSort = urlParams.get('sort_by') || 'full_name';
        currentOrder = urlParams.get('order') || 'asc';
        currentSearch = urlParams.get('search') || '';
        searchInput.value = currentSearch;
    }

    function updateSortIndicators() {
        headerLinks.forEach(a => {
            const sortKey = a.getAttribute('data-sort');
            a.textContent = a.textContent.replace(' ▲', '').replace(' ▼', '');

            if (currentSort === sortKey) {
                a.textContent += (currentOrder === 'asc') ? ' ▲' : ' ▼';
            }
        });
    }

    async function loadTableData() {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Загрузка...</td></tr>';
        try {
            const apiUrl = new URL('/employees/', window.location.origin);
            apiUrl.searchParams.append('sort_by', currentSort);
            apiUrl.searchParams.append('order', currentOrder);
            if (currentSearch) {
                apiUrl.searchParams.append('search', currentSearch);
            }

            const headers = {
                'Authorization': `Bearer ${token}`
            }

            const response = await fetch(apiUrl, { headers });
            if (response.status === 401) {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
                return;
            }

            const employees = await response.json();
            tbody.innerHTML = '';

            if (employees.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">Сотрудники не найдены.</td></tr>';
                return;
            }

            employees.forEach(emp => {
                const row = document.createElement('tr');
                row.setAttribute('data-row-id', emp.id);
                const hireDate = new Date(emp.hire_date).toLocaleDateString('ru-RU');
                const photoCell = `<td>${emp.photo_path ? `<img src="${emp.photo_path}" alt="Фото" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">` : 'Нет фото'}</td>`;
                row.innerHTML = `
                    <td>${emp.full_name}</td>
                    <td>${emp.position}</td>
                    <td>${hireDate}</td>
                    <td>${emp.salary.toLocaleString('ru-RU')}</td>
                    ${photoCell}
                    <td>
                        <a href="/edit/${emp.id}" class="btn btn-sm btn-outline-secondary">Редактировать</a>
                        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${emp.id}">Удалить</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Ошибка загрузки данных.</td></tr>';
            console.error("Failed to load employees:", error);
        }
    }

    tbody.addEventListener('click', async (event) => {
        if (event.target && event.target.dataset.action === 'delete') {
            const employeeId = event.target.dataset.id;
            if (confirm(`Вы точно хотите удалить сотрудника с ID ${employeeId}?`)) {
                try {
                    const response = await fetch(`/employees/${employeeId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const rowToRemove = document.querySelector(`tr[data-row-id='${employeeId}']`);
                        if (rowToRemove) {
                            rowToRemove.remove();
                        }
                    } else {
                        const errorData = await response.json();
                        alert(`Ошибка удаления: ${errorData.detail || 'Неизвестная ошибка'}`);
                    }
                } catch (error) {
                    alert(`Сетевая ошибка: ${error}`);
                }
            }
        }
    });

    headerLinks.forEach(a => {
        a.addEventListener('click', async (event) => {
            event.preventDefault();

            const sortKey = a.getAttribute('data-sort');

            if (currentSort === sortKey) {
                currentOrder = (currentOrder === 'asc') ? 'desc' : 'asc';
            } else {
                currentSort = sortKey;
                currentOrder = 'asc';
            }

            updateUrl();
            updateSortIndicators();
            await loadTableData();
        });
    });

    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        currentSearch = searchInput.value;
        updateUrl();
        await loadTableData();
    });

    window.addEventListener('popstate', () => {
        readUrlParams();
        updateSortIndicators();
        loadTableData();
    });

    readUrlParams();
    updateSortIndicators();
    await loadTableData();
});
