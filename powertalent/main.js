var width = 800;
var height = 600;

var stage;

var currentCard;
var cards = {
  bed: {
    background: 'bed.jpg',
    links: [
      createLink(100, 100, 400, 400, 'middle')
    ]
  },
  middle: {
    background: 'middle.jpg'
  },
  door: {
    background: 'door.jpg'
  }
}

function createLink(x, y, w, h, cardName) {
  var graphics = new PIXI.Graphics();
  graphics.beginFill(0xFF0000);
  graphics.drawRect(0, 0, w, h);
  graphics.alpha = 0;
  graphics.x = x;
  graphics.y = y;

  graphics.interactive = true;
  graphics.mousedown = function() {
    gotoCard(cardName);
  };

  return graphics;
}

function gotoCard(cardName) {
  stage.removeChildren();

  currentCard = cards[cardName];

  var background = PIXI.Sprite.fromImage(currentCard.background);
  stage.addChild(background);

  if (currentCard.links) {
    $.each(currentCard.links, function(i, link) {
      stage.addChild(link);
    });
  }
}

function onClick(e) {
  console.log(e);
  // $.each(currentCard.links, function(i, link) {
  //   link.polygon.contains();
  // });
}

function gatherAssets() {
  var assets = [];
  $.each(cards, function(i, card) {
    assets.push(card.background);
  });
  return assets;
}

function main() {
  var loader = new PIXI.AssetLoader(gatherAssets());
  loader.onComplete = startGame;
  loader.load();

  // create an new instance of a pixi stage
  stage = new PIXI.Stage(0xCCCCCC, true);
  renderer = PIXI.autoDetectRenderer(width, height);

  // set the canvas width and height to fill the screen
  renderer.view.style.display = "block";
  $(renderer.view).css('width', width);
  $(renderer.view).css('height', height);

  // add render view to DOM
  document.body.appendChild(renderer.view);

  graphics = new PIXI.Graphics();
  renderer.render(stage);

  center($(renderer.view));
}

function startGame() {
  gotoCard('bed');
  animate();
}

function animate() {

  requestAnimFrame( animate );

  // render the stage
  renderer.render(stage);
}

$(document).ready(main);
