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
    // <th data-sort="name">Name</th>
    // <th data-sort="numppl">People</th>
    // <th data-sort="numnight">Nights</th>
    // <th data-sort="country">Country</th>
    // <th data-sort="passport">Passport</th>
    // <th data-sort="coDate">Checkout Date</th>
    function renderTable(data) {
        tbody.innerHTML = ''; // Clear existing rows
        data.forEach(row => {
            console.log(row);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.date}</td>
                <td>${row.fname} ${row.lname}</td>
                <td>${row.numppl}</td>
                <td>${row.numDays}</td>
                <td>${row.country}</td>
                <td>${row.passport}</td>
                <td>${row.checkOutDate}</td>
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
        // TODO: Allow for filter by different columns
        const filterDate = filterDateInput.value;
        console.log(filterDate)
        const filteredData = tableData.filter(row => row.date === filterDate);
        renderTable(filteredData);
    });

    // Initial render
    renderTable(tableData);
});