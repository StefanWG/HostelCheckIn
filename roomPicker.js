let hostel = null;
window.api.receive("fromMain", (args) => {
    console.log(args)
    let data = args["data"];
    let numppl = args["numppl"];
    console.log(numppl);
    hostel = new Hostel('Hostel', []);
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
    hostel.rooms.sort((a, b) => a.name - b.name);

    for (let room of hostel.rooms) {
        room.beds.sort((a, b) => a.number - b.number);
    }
    hostel.displayRooms(main);
});

window.api.receive("bedClickedFromMain", (args) => {
    console.log(args);
    while (main.firstChild) {
        main.removeChild(main.firstChild);
    }

    let room = hostel.rooms.find(room => room.name === args.room);
    let bedObj = room.beds.find(b => b.number === args.bed);
    if (bedObj.available) {
        bedObj.selected = !bedObj.selected;
    }
    hostel.displayRooms(main);

})

window.api.send("toMain", "some data");

let submitButton = document.getElementById('checkin');
submitButton.addEventListener('click', () => {
    window.api.send("updateHostel", {});
    // TODO: ask if needs to send warning - or control this on this page
    // TODO: pass to update hostel
});


let goBackButton = document.getElementById('goBack');
goBackButton.addEventListener('click', () => {
    window.api.send("load", {"page": "checkin"});
});
