window.api.receive("fromMain", (args) => {
    let data = args["data"]
    // let data = args;
    let hostel = new Hostel('Hostel', []);
    for (let i = 0; i < data.length; i++) {
        let bed = data[i];
        let room = hostel.rooms.find(room => room.name === bed.room);
        if (room == undefined) {
            room = new Room(hostel, bed.room);
            hostel.rooms.push(room);
            hostel.numRooms++;
        }
        let newBed = new Bed(hostel, room, 'Single', bed.bed);
        newBed.available = bed.available;
        newBed.checkInDate = bed.checkInDate;
        newBed.numDays = bed.numDays;
        newBed.checkOutDate = bed.checkOutDate;
        room.addBed(newBed);
    }
    hostel.displayRooms(main);
    return hostel;
});

window.api.send("toMain", "some data");

let checkInBUtton = document.getElementById('checkin');
checkInBUtton.addEventListener('click', () => {
    window.api.send("load", {"page": "checkin"});
});

let updateButton = document.getElementById('update');
updateButton.addEventListener('click', () => {
    window.api.send("reload", {});
});

let checkoutButtom = document.getElementById('checkout');
checkoutButtom.addEventListener('click', () => {
    window.api.send("load", {"page": "checkout"});
});

let guestsButton = document.getElementById('guests');
guestsButton.addEventListener('click', () => {
    window.api.send("load", {"page": "guests"});
});

//TODO: Different color if bed is occupied but unpaid

