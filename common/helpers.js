function center(element) {
  centerVertically(element);
  centerHorizontally(element);
}

function centerHorizontally(element) {
  element.css('position', 'absolute');
  element.css('left', $(window).width() / 2 - element.outerWidth() / 2);
  $(window).resize(function() {
    element.css('position', 'absolute');
    element.css('left', $(window).width() / 2 - element.outerWidth() / 2);
  });
}

function centerVertically(element) {
  element.css('position', 'absolute');
  element.css('top', $(window).height() / 2 - element.outerHeight() / 2);
  $(window).resize(function() {
    element.css('position', 'absolute');
    element.css('top', $(window).height() / 2 - element.outerHeight() / 2);
  });
}
