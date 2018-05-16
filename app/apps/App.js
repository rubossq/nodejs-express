class App {
    constructor(obj) {
        this.id = obj.id || obj._id;
        this.system_developer_id = obj.system_developer_id;

        this.name = obj.name;
        this.package_id = obj.package_id;
        this.developer_id = obj.developer_id;
        this.images = obj.images;
        this.size = obj.size;
        this.desc = obj.desc;
        this.updates = obj.updates;
        this.version = obj.version;
        this.category = obj.category;
        this.icon = obj.icon;
        this.downloads = obj.downloads;
        this.price = obj.price;
        this.os_version = obj.os_version;
        this.rating = obj.rating;
        this.comments = obj.comments;
        this.ptime = obj.ptime;

        //this.short_desc                ???
        //this.minimum_os_version                ???
        //prepare befor saving             ???

        //this.store_type = obj.store_type;
        //this.hype = obj.hype;
    }

    getId() {
        return this.id;
    }

    getPtime() {
        return this.ptime;
    }

    setId(_id) {
        this.id = _id;
    }

    getName() {
        return this.name;
    }

    setName(_name) {
        this.name = _name;
    }

    getSystemDeveloperId() {
        return this.system_developer_id;
    }

    getPackageId() {
        return this.package_id;
    }

    getDeveloperId() {
        return this.developer_id;
    }

    getImages() {
        return this.images;
    }

    getSize() {
        return this.size;
    }

    getDesc() {
        return this.desc;
    }

    getUpdates() {
        return this.updates;
    }

    getVersion() {
        return this.version;
    }

    getCategory() {
        return this.category;
    }

    getIcon() {
        return this.icon;
    }

    getDownloads() {
        return this.downloads;
    }

    getPrice() {
        return this.price;
    }

    getRating() {
        return this.rating;
    }

    getOsVersion(){
        return this.os_version;
    }

    getComments() {
        return this.comments;
    }

    prepare() {
        try{

            let markOne = parseInt(this.rating.one);
            let markTwo = parseInt(this.rating.two);
            let markThree = parseInt(this.rating.three);
            let markFour = parseInt(this.rating.four);
            let markFive = parseInt(this.rating.five);

            let total = markOne + markTwo + markThree + markFour + markFive;

            this.rating.av = ((markOne + markTwo * 2 + markThree * 3 + markFour * 4 + markFive * 5) / total).toFixed(2);
            this.rating.count = total;

            if (!this.price) {
                this.price = "Free";
            }
        }catch(e){

        }

    }

    setHype(hype) {
        this.hype = hype;
    }
}

module.exports = App;