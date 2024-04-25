window.onload = function() {
    window.scrollTo(0,document.body.scrollHeight);
};

$(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
        $(".subnav-sticky").addClass("scrolled");
    } else {
        $(".subnav-sticky").removeClass("scrolled");
    }
});
