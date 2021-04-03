class Astroneers {
    constructor() {
        this.d0 = new Device;
        this.d1 = new Device;
        this.d2 = new Device;
        this.d3 = new Device;
        this.d4 = new Device;
        this.d5 = new Device;
        this.db = new Chip;
    }
}
class Device {
    constructor() {
        this.On = false;
        this.Power = false;
        this.Error = false;
        this.Activate = false;
        this.Setting = null;
        this.RequiredPower = 0;
        this.Slots = [];
    }
}
class Chip extends Device {
    //-128473777
    constructor() {
        super();
        this.Slots = [];
        this.Slots.push(new Slot());
    }
}
class Slot {
    constructor() {
        this.Occupied = true;
        this.OccupantHash = '';
        this.Quantity = 0;
        this.Damage = 0;
        this.Class = '';
        this.MaxQuantity = 1;
        this.PrefabHash = '';
    }
}
//# sourceMappingURL=astroneers.js.map