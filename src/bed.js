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

        // if (!this.available) { 
        //     this.checkOutDate = new Date(this.checkOutDate)
        //     let d = new Date();
        //     let today = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        
        //     const diffTime = this.checkOutDate - today;
        //     const daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
        //     let daysLeftElement = document.createElement('div');
        //     daysLeftElement.textContent = daysLeft + ' days';
        //     bed.appendChild(daysLeftElement);
        // }

        bed.onclick = () => {
            window.api.send("bedClicked", {bed: this.number, room: this.room.name}); 
        };
        return bed;
    }
  
    checkIn(numDays) {
        let d = new Date();
        this.numDays = parseInt(numDays);
        this.available = false;
        this.checkInDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()); // TODO: Get from page
        let temp = new Date()
        temp.setDate(temp.getDate() + this.numDays); 
        this.checkOutDate = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate());
    }
  
    checkOut() {
        let d = new Date();
        let today = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    
        if (this.available) {
            return false;
        } else {
            if (this.checkOutDate.getTime() <= today.getTime()) {
                this.available = true;
                this.checkInDate = null;
                this.numDays = null;
                this.checkOutDate = null;
                return true;
            }
        }
    }
}

try {
    module.exports.Bed = Bed;
} catch{

}
