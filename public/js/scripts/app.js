function changeDate(){
    if(document.querySelector(".myalert") && (document.querySelector(".myalert").style.display != "none")){
        document.querySelector(".myalert").style.display = "none";
    }
}

function setFastButtons(days, elem){
    let date = new Date();
    let monthBack = new Date(date.getTime() - (86400 * days * 1000));

    $("#"+elem+"Start").val(monthBack.getFullYear() + "-" + ("0" + (monthBack.getMonth() + 1)).slice(-2) + "-" + ("0" + monthBack.getDate()).slice(-2));
    $("#"+elem+"End").val(date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2));
}