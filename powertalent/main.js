var width = 800;
var height = 600;

var stage;

var currentCard;
var cards = {
  bed: {
    background: 'bed.jpg',
    links: [
      createLink(0, 0, 450, 350, 'middle'),
      createLink(450, 0, 200, 350, 'door')
    ]
  },
  middle: {
    background: 'middle.jpg',
    links: [
      createLink(650, 0, 150, 600, 'door'),
      createLink(0, 0, 150, 600, 'middleleft'),
      createLink(100, 0, 300, 300, 'closet'),
    ]
  },
  door: {
    background: 'door.jpg',
    links: [
      createLink(0, 500, 800, 100, 'middle')
    ]
  },
  middleleft: {
    background: 'middle-left.jpg',
    links: [
      createLink(650, 0, 150, 600, 'middle'),
      createLink(0, 0, 150, 600, 'desk'),
    ]
  },
  desk: {
    background: 'desk.jpg',
    links: [
      createLink(650, 0, 150, 600, 'middleleft'),
    ]
  },
  closet: {
    background: 'closet.jpg',
    links: [
      createLink(0, 500, 800, 100, 'middle'),
    ]
  }
}

function createLink(x, y, w, h, cardName, animation) {
  var graphics = new PIXI.Graphics();
  graphics.beginFill(0xFF0000);
  graphics.drawRect(0, 0, w, h);
  graphics.x = x;
  graphics.y = y;
  graphics.alpha = 0.0;

  graphics.interactive = true;
  graphics.mousedown = function() {
    if (animation) {
      stage.removeChildren();
      stage.addChild(animation);
      animation.play();
      animation.onComplete = function() {
        gotoCard(cardName);
      };
    } else {
      gotoCard(cardName);
    }
  };

  return graphics;
}

function createAnimation(images) {
  var textures = $.map(images, function(name) {
    return PIXI.Texture.fromImage(name);
  });
  var animation = new PIXI.MovieClip(textures);
  animation.animationSpeed = 0.2;
  animation.loop = false;
  return animation;
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
  // render the stage
  renderer.render(stage);
  requestAnimFrame(animate);
}

$(document).ready(main);
