document.addEventListener('DOMContentLoaded', function () {
    const tableData = [
        { name: 'Alice', age: 25, date: '2024-11-01' },
        { name: 'Bob', age: 30, date: '2024-11-03' },
        { name: 'Charlie', age: 35, date: '2024-11-07' },
        { name: 'Diana', age: 28, date: '2024-11-05' },
    ];

    const table = document.getElementById('dynamic-table');
    const tbody = table.querySelector('tbody');
    const filterDateInput = document.getElementById('filter-date');

    let sortColumn = null;
    let sortDirection = 'asc';

    // Function to render the table
    function renderTable(data) {
        tbody.innerHTML = ''; // Clear existing rows
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.name}</td>
                <td>${row.age}</td>
                <td>${row.date}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Function to sort the table
    function sortTable(column) {
        if (sortColumn === column) {
            // Reverse direction if the same column is clicked
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }

        const sortedData = [...tableData].sort((a, b) => {
            if (column === 'age') {
                return sortDirection === 'asc' ? a.age - b.age : b.age - a.age;
            } else {
                return sortDirection === 'asc'
                    ? a[column].localeCompare(b[column])
                    : b[column].localeCompare(a[column]);
            }
        });

        renderTable(sortedData);
    }

    // Event listener for column headers
    table.querySelectorAll('th').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            sortTable(column);
        });
    });

    // Filter by date
    filterDateInput.addEventListener('input', () => {
        const filterDate = filterDateInput.value;
        const filteredData = tableData.filter(row => row.date === filterDate);
        renderTable(filteredData);
    });

    // Initial render
    renderTable(tableData);
});
