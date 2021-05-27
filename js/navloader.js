$(document).ready(function () {
    $("#nav").load("navbar.html");
    $("#footer").load("footer.html");
});

function setActive(which) {
    if ($("#" + which).length) {
        $("#" + which).addClass("active");
    } else {
        setTimeout(function () {
            setActive(which)
        }, 200);
    }
}