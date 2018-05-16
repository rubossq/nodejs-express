class AppEntity {
    constructor(obj){
        this.id = obj.id || obj._id;
        this.package_id = obj.package_id;
        this.type = obj.type;
        this.ptime = obj.ptime;
    }

    getId(){
        return this.id;
    }

    getPackageId(){
        return this.package_id;
    }

    getPtime(){
        return this.ptime;
    }

    getType(){
        return this.type;
    }
}

module.exports = AppEntity;