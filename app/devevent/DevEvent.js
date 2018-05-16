class DevEvent {
    constructor(obj) {
        this.id = obj.id || obj._id;
        this.dev_id = obj.dev_id;
        this.etime = obj.etime || new Date() / 1000;
        this.type = obj.type;
        this.data = obj.data;
    }

    getId() {
        return this.id;
    }

    getDevId() {
        return this.dev_id;
    }

    setId(_id) {
        this.id = _id;
    }

    getEtime() {
        return this.etime;
    }

    setEtime(_etime) {
        this.etime = _etime;
    }

    getType() {
        return this.type;
    }

    setType(_type) {
        this.type = _type;
    }

    getData() {
        return this.data;
    }

    setData(_data) {
        this.data = _data;
    }
}

module.exports = DevEvent;