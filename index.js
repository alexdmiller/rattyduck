(function() {
  var bigTitleText = "RATTYDUCK";
  var offset = 1000;
  var velocityOffset = 400;
  var letterForce = 0.001;
  var friction = 0.95;
  var letters = [];

  $(document).ready(function() {
    for (var i = 0; i < bigTitleText.length; i++) {
      var letter = $('<div>');
      letter.text(bigTitleText.slice(i, i+1));
      letter.css('top', 0);
      letter.css('left', 0);
      $('#big-title').append(letter);
      letters.push({
        e: letter,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0
      });
    }

    centerHorizontally($('#big-title'));
    centerHorizontally($('#intro'));

    $.each(letters, function(i, e) {
      e.x = Math.random() * offset - offset / 2;
      e.y = Math.random() * offset - offset / 2;
      e.vx = Math.random() * velocityOffset - velocityOffset / 2;
      e.vy = Math.random() * velocityOffset - velocityOffset / 2;
    });

    requestAnimationFrame(animate);
  });

  function animate() {
    $.each(letters, function(i, letter) {
      letter.e.css('left', Math.round(letter.x) + 'px');
      letter.e.css('top', Math.round(letter.y) + 'px');

      var dx = -letter.x;
      var dy = -letter.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var angle = Math.atan2(dy, dx);

      var force = dist * dist * letterForce;
      letter.vx += force * Math.cos(angle);
      letter.vy += force * Math.sin(angle);
      letter.x += letter.vx;
      letter.y += letter.vy;
      letter.vx *= .9;
      letter.vy *= .9;
    });
    requestAnimationFrame(animate);
  }
})();
