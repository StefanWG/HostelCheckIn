class Room {
    constructor(hostel, name) {
        this.name = name;
        this.beds = [];
        this.hostel = hostel;
    }

    addBed(bed) {
        this.beds.push(bed);
    }

    displayRoom() {
        let room = document.createElement('div');
        let roomName = document.createElement('h2');
        roomName.textContent = this.name;
        room.classList.add('room');
        room.appendChild(roomName);
        let beds = document.createElement('div');
        beds.classList.add('beds');
        for (let i = 0; i < this.beds.length; i++) {
            let bedItem = this.beds[i].displayBed();
            beds.appendChild(bedItem);
        }
        room.appendChild(beds);
        return room;
    }
}

try {
    module.exports.Room = Room;
} catch {
    
}