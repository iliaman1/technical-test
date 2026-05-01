document.addEventListener('DOMContentLoaded', async () => {
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

    async function loadTableData() {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Загрузка...</td></tr>';
        try {
            const apiUrl = new URL('/employees/', window.location.origin);
            apiUrl.searchParams.append('sort_by', currentSort);
            apiUrl.searchParams.append('order', currentOrder);
            if (currentSearch) {
                apiUrl.searchParams.append('search', currentSearch);
            }

            const response = await fetch(apiUrl);
            const employees = await response.json();
            tbody.innerHTML = '';

            if (employees.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">Сотрудники не найдены.</td></tr>';
                return;
            }

            employees.forEach(emp => {
                const row = document.createElement('tr');
                const hireDate = new Date(emp.hire_date).toLocaleDateString('ru-RU');
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

    function updateSortIndicators() {
        headerLinks.forEach(a => {
            const sortKey = a.getAttribute('data-sort');
            a.textContent = a.textContent.replace(' ▲', '').replace(' ▼', '');

            if (currentSort === sortKey) {
                a.textContent += (currentOrder === 'asc') ? ' ▲' : ' ▼';
            }
        });
    }

    headerLinks.forEach(a => {
        a.addEventListener('click', async (event) => {
            event.preventDefault();

            const sortKey = a.getAttribute('data-sort');
            let newOrder = 'asc';

            if (currentSort === sortKey) {
                newOrder = (currentOrder === 'asc') ? 'desc' : 'asc';
            }

            currentSort = sortKey;
            currentOrder = newOrder;

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
