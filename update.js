window.api.send("toMain", "update")

window.api.receive("fromMain", (args) => {
    let data = Object.entries(args["data"]);
    for (let row of data) {
        try {
            document.getElementById(row[0].toLowerCase()).value=row[1];
        } catch {
            if (row[0] === "date") {
                document.getElementById("checkindate").value = row[1]
            }
        }
    }
});

//TODO: Display which beds are available - use sql to get the rights beds (where = guestID)

let updateButton = document.getElementById('update');
let changeBedsButton = document.getElementById('changerooms');
let deleteButton = document.getElementById('delete');