class Astroneers {
  public d0: Device;
  public d1: Device;
  public d2: Device;
  public d3: Device;
  public d4: Device;
  public d5: Device;
  public db: Chip;

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
  public On: Boolean;
  public Power: Boolean;
  public Error: Boolean;
  public Activate: Boolean;
  public Setting: any;
  public RequiredPower: Number;
  public Slots: Slot[];

  constructor() {
    this.On = false;
    this.Power = false;
    this.Error = false;
    this.Activate = false;
    this.Setting = null
    this.RequiredPower = 0
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
  public Occupied: Boolean // - 0 - слот свободен, 1 - занят
  public OccupantHash: String // - хэш объекта в слоте
  public Quantity: Number // // - количество предметов в слоте
  public Damage: Number // - уровень повреждения объекта
  public Class: String // - класс объекта в слоте
  public MaxQuantity: Number // - максимальное количество предметов в слоте
  public PrefabHash: String // - хэш префаба объекта в слоте
  constructor() {
    this.Occupied = true;
    this.OccupantHash = ''
    this.Quantity = 0
    this.Damage = 0
    this.Class = ''
    this.MaxQuantity = 1
    this.PrefabHash = ''
  }
}
