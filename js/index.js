function getItemHtml(item) {
  var replica = $("#dataCarouselItemsTemplate:first").clone();
  return replica
    .html()
    .replace("{title}", item.title)
    .replace("{description}", item.text)
    .replace("{imagesrc}", item.image.src)
    .replace("{imagealt}", "'" + item.image.alt + "'")
    .replace("{buttontext}", item.button.text)
    .replace("{buttonlocation}", "'" + item.button.location + "'");
}

function setYouCanDoSlide(which) {
  $("#usageCarousel").carousel(which);
}

function adjustCards() {
  $(".card").animate({ height: "auto" }, function () {
    $(".card").height("auto");
    var maxHeight = Math.max.apply(
      null,
      $(".card")
        .map(function () {
          return $(this).height();
        })
        .get()
    );
    $(".card").height(maxHeight);
  });
}

$(window).resize(function () {
  adjustCards();
});

$(function () {
  $("#main-carousel").carousel();
  $("#usageCarousel").carousel({
    interval: false,
  });
  $.each(dataItems, function (index, item) {
    var active = index === 0;
    if (index === 0) {
      $("#dataCarouselItems").append(
        getItemHtml(item).replace(
          "carousel-item h-100",
          "carousel-item active h-100"
        )
      );
    } else {
      $("#dataCarouselItems").append(getItemHtml(item));
    }
  });

  $("#dataCarousel").carousel({
    interval: 2000,
    transition: "fade-in",
  });

  $("#dataCarousel.carousel .carousel-item").each(function () {
    var minPerSlide = 3;
    var next = $(this).next();
    if (!next.length) {
      next = $(this).siblings(":first");
    }
    next.children(":first-child").clone().appendTo($(this));

    for (var i = 0; i < minPerSlide; i++) {
      next = next.next();
      if (!next.length) {
        next = $(this).siblings(":first");
      }

      next.children(":first-child").clone().appendTo($(this));
    }
  });

  adjustCards();
});
