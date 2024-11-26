let data;

function sortFunction(a, b) {
    if (a["checkOutDate"] === b["checkOutDate"]) {
        if (a["room"] === b["room"]) {
            return (a["bed"] < b["bed"]) ? -1 : 1;
        } else {
            return (a["room"] < b["room"]) ? -1 : 1;
        }
    }
    else {
        return (a["checkOutDate"] < b["checkOutDate"]) ? -1 : 1;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    window.api.send("toMain", "checkoutlist");
});

window.api.receive("fromMain", (args) => {
    data = args["data"];
    let newData = [];
    for (let i = 0; i < data.length; i++) {
        let bed = data[i];
        if (bed.checkOutDate != null) {
            newData.push(bed);
        }
    }

    data = newData;
    data.sort(sortFunction);


    console.log(data);

    const table = document.getElementById('dynamic-table');
    const tbody = table.querySelector('tbody');
    const filterDateInput = document.getElementById('filter-date');

    let sortColumn = null;
    let sortDirection = 'asc';

    // Function to render the table
    function renderTable(data) {
        tbody.innerHTML = ''; // Clear existing rows
        let prevDate = null;
        data.forEach(row => {
            if (row.checkOutDate != prevDate && prevDate != null) {
                const tr = document.createElement('tr');
                tr.classList.add('spacer');
                tr.innerHTML = `
                    <td></td>
                    <td></td>
                    <td></td>
                `;
                tbody.appendChild(tr);
            }
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.room}</td>
                <td>${row.bed}</td>
                <td>${row.checkOutDate}</td>
            `;
            tbody.appendChild(tr);
            prevDate = row.checkOutDate;
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

        const sortedData = [...data].sort((a, b) => {
            return sortDirection === 'asc'
                ? a[column] > (b[column])
                : b[column] < (a[column]);
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
    renderTable(data);
});

let homeButton = document.getElementById('home');
homeButton.addEventListener('click', () => {
    window.api.send("load", {"page":"index"});
});