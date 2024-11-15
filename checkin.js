window.api.receive("fromMain", (data) => {
    console.log(`Received ${data} from main process`);
    let title = document.getElementById('title');
    title.textContent = `Check in to bed ${data.bed} in room ${data.room}`;
});

let dateInput = document.getElementById('checkindate');
dateInput.valueAsDate = new Date();

let cancelButton = document.getElementById('cancel');
let checkinButton = document.getElementById('checkin');

cancelButton.onclick =  () => {
    window.api.send("loadIndex", {});
};

checkinButton.onclick = () => { 
    if (document.getElementById('numdays').value === "") {
        return;
    }

    let numDays = parseInt(document.getElementById('numdays').value);
    let checkInDate = new Date(dateInput.value)
    let checkOutDate = new Date(dateInput.value);
    checkOutDate.setDate(checkInDate.getDate() + numDays);
    window.api.send("updateHostel", {"numDays": numDays, "checkInDate": checkInDate, "checkOutDate": checkOutDate});
}