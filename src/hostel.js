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
                    checkOutDate: bed.checkOutDate
                });
            }
        }
        return JSON.stringify(data);
    }
}

