document.addEventListener('DOMContentLoaded', function () {
    window.api.send("toMain", "guests");
});

window.api.receive("fromMain", (args) => {
    console.log(args);
    const tableData = args["data"]

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
                <td>${row.numppl}</td>
                <td>${row.numnight}</td>
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