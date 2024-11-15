window.api.receive("fromMain", (data) => {
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
