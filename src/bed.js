class Bed {
    constructor(hostel, room, type, number) {
        this.hostel = hostel;
        this.room = room;
        this.type = type;
        this.number = number;
        this.available = true;
        this.checkInDate = null;
        this.numDays = null;
        this.checkOutDate = null;
        this.selected = false;
    }

    displayBed() {

        let bed = document.createElement('div');
        bed.textContent = this.number;
        bed.classList.add('bed');
        bed.classList.add(this.type);
        if (this.selected) {
            bed.classList.add('selected');
        }
        if (this.available) {
            bed.classList.add('available');
        }

        if (!this.available) { 
            this.checkOutDate = new Date(this.checkOutDate)
            let d = new Date();
            let today = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        
            const diffTime = this.checkOutDate - today;
            const daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
            let daysLeftElement = document.createElement('div');
            daysLeftElement.textContent = daysLeft + ' days';
            bed.appendChild(daysLeftElement);
        }

        bed.onclick = () => {
            window.api.send("bedClicked", {bed: this.number, room: this.room.name}); 
            // TODO: Change this to just send a message and then handle it from different pages in main
        };
        return bed;
    }

    checkIn(numDays) {
        let d = new Date();
        this.numDays = numDays;
        this.available = false;
        let dateString = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear()
        this.checkInDate = new Date(dateString);
        this.checkOutDate = addDays(dateString, this.numDays);
    }
}