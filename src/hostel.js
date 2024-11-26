class Hostel {
    constructor(name, rooms) {
        this.name = name;
        this.numRooms = rooms.length;
        this.rooms = [];
        for (let i = 0; i < rooms.length; i++) {
            this.rooms.push(new Room(this, rooms[i]));
        }
    }

    displayRooms(main) {
        let rooms = document.createElement('div');
        rooms.classList.add("hostel");
        for (let i = 0; i < this.rooms.length; i++) {
            let room = this.rooms[i].displayRoom();
            rooms.appendChild(room);
        }
        main.appendChild(rooms);
    }

    getJsonString () {
        let data = [];
        for (let i = 0; i < this.rooms.length; i++) {
            let room = this.rooms[i];
            for (let j = 0; j < room.beds.length; j++) {
                let bed = room.beds[j];
                data.push({
                    room: room.name,
                    bed: bed.number,
                    available: bed.available,
                    checkInDate: bed.checkInDate,
                    numDays: bed.numDays,
                    checkOutDate: bed.checkOutDate,
                    type: bed.type
                });
            }
        }
        return JSON.stringify(data);
    }

    getBed(room, bed) {
        let roomObj = this.rooms.find(r => r.name === room);
        return roomObj.beds.find(b => b.number === bed);
    }
}

try {
    module.exports.Hostel = Hostel;
} catch {
    
}

