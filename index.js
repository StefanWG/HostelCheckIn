console.log("here")
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
        if (bed.checkInDate != null) {
            newBed.checkInDate = new Date(bed.checkInDate);
        }
        newBed.numDays = bed.numDays;
        if (bed.checkOutDate != null) {
            newBed.checkOutDate = new Date(bed.checkOutDate);
        }
        room.addBed(newBed);
    }
    hostel.rooms.sort((a, b) => a.name - b.name);
    for (let room of hostel.rooms) {
        room.beds.sort((a, b) => a.number - b.number);
    }
    hostel.displayRooms(main);
    console.log(hostel);
});

window.api.send("toMain", "some data");

//TODO: Different color if bed is occupied but unpaid

