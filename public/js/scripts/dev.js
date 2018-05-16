function setFastButtons(days){
    let date = new Date();
    let monthBack = new Date(date.getTime() - (86400 * days * 1000));

    $("#start").val(monthBack.getFullYear() + "-" + ("0" + (monthBack.getMonth() + 1)).slice(-2) + "-" + ("0" + monthBack.getDate()).slice(-2));
    $("#end").val(date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2));
}

function switchCharts(id){
    $("#releases_chart").css("z-index", "1");
    $("#updates_chart").css("z-index", "1");
    $("#removes_chart").css("z-index", "1");

    $("#"+id).css("z-index", "2");
}