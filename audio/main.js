
$(document).ready(function() {
  var lfo = T('square', {freq: '100ms', mul: 2});

  var frequency = T('param', {value: 100});
  var vco = T('sin', {freq: T('+', frequency, lfo)});
  var vcf = T('lpf', {cutoff: 1000}, vco);
  
  $(window).mousemove(function(event) {
    frequency.linTo(event.pageX, '100ms');
    vcf.cutoff = event.pageY;
  });

  $(window).mousedown(function(event) {
    vcf.play();
  });

  $(window).mouseup(function(event) {
    vcf.pause();
  });
});