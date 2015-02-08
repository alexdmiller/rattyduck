(function() {
  window.START_NUM = 100;
  window.FRICTION = 0.99;
  window.REPEL_FORCE = 40;
  window.MAX_CELLS = 1000;
  window.NEIGHBOR_RADIUS = 50;
  window.SPAWN_RADIUS = 11;
  window.LONELY_THRESHOLD = 5;
  window.CROWDED_THRESHOLD = 6;
  window.SPAWN_CHANCE = 0.1;
  window.DEATH_CHANCE = 1;
  window.CELL_RADIUS = 5;
  window.AGE_THESHOLD = 100;
  window.MAX_FORCE = 20;
  window.TOO_CLOSE_THRESHOLD = 10;

  var width = 1000;
  var height = 800;
  var stage;
  var graphics;
  var community;

  $(document).ready(function() {
    // create an new instance of a pixi stage
    stage = new PIXI.Stage(0x000000, true);
    renderer = PIXI.autoDetectRenderer(width, height);

    // set the canvas width and height to fill the screen
    renderer.view.style.display = "block";
    $(renderer.view).css('width', width);
    $(renderer.view).css('height', height);

    // add render view to DOM
    document.body.appendChild(renderer.view);

    graphics = new PIXI.Graphics();
    stage.addChild(graphics);

    community = new Community(width, height);
    createCells(community);

    community.onAllDead = function() {
      createCells(community, canvas);
    }

    center($(renderer.view));
    $('.previous-button').click(function() {
      settingsControl.previousPreset();
    });
    centerVertically($('.previous-button'));
    $('.next-button').click(function() {
      settingsControl.nextPreset();
    });
    centerVertically($('.next-button'));

    animate();
  });

  function createCells(community) {
    for (var i = 0; i < window.START_NUM; i++) {
      community.createCell(community.width * Math.random(),
      community.height * Math.random());
    }
  }

  function animate() {
    graphics.clear();
    community.update();

    $.each(community.cells, function(i, cell) {
      var color = 0x999999;
      if (cell.isLonely()) {
        color = 0x9999FF;
      }
      if (cell.isCrowded()) {
        color = 0xFF9999;
      }
      graphics.beginFill(color, (AGE_THESHOLD - cell.age) / AGE_THESHOLD);

      graphics.drawCircle(cell.x, cell.y, cell.radius);
    });

    renderer.render(stage);
    requestAnimFrame(animate);
  }

  function Cell() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.radius = CELL_RADIUS;
    this.neighbors = 0;
    this.age = 0;
  }

  Cell.prototype.update = function(width, height) {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= FRICTION;
    this.vy *= FRICTION;
  }

  Cell.prototype.isLonely = function() {
    return this.neighbors < LONELY_THRESHOLD;
  }

  Cell.prototype.isCrowded = function() {
    return this.neighbors > CROWDED_THRESHOLD;
  }

  function Community(width, height) {
    this.cells = [];
    this.width = width;
    this.height = height;
  }

  Community.prototype.onAllDead = null;

  Community.prototype.createCell = function(x, y) {
    if (this.cells.length < MAX_CELLS) {
      var cell = new Cell();
      cell.x = x;
      cell.y = y;
      this.cells.push(cell);
      return cell;
    }
  };

  Community.prototype.update = function() {
    for (var frame = 0; frame < 1; frame++) {
      // constrain within box
      for (var i = 0; i < this.cells.length; i++) {
        var c = this.cells[i];
        c.neighbors = 0;

        if (c.x - c.radius < 0) {
          c.x = c.radius + 1;
          c.vx *= -1;
        } else if (c.x + c.radius > this.width) {
          c.x = this.width - c.radius - 1;
          c.vx *= -1;
        }
        if (c.y - c.radius < 0) {
          c.y = c.radius + 1;
          c.vy *= -1;
        } else if (c.y + c.radius > this.height) {
          c.y = this.height - c.radius - 1;
          c.vy *= -1;
        }
      }

      // count neighbors
      for (var i = 0; i < this.cells.length; i++) {
        var c1 = this.cells[i];
        for (var j = i + 1; j < this.cells.length; j++) {
          var c2 = this.cells[j];
          var dx = c1.x - c2.x;
          var dy = c1.y - c2.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < NEIGHBOR_RADIUS) {
            c1.neighbors++;
            c2.neighbors++;
          }
        }
      }

      // resolve collision
      for (var i = 0; i < this.cells.length; i++) {
        var c1 = this.cells[i];
        for (var j = i + 1; j < this.cells.length; j++) {
          var c2 = this.cells[j];
          var dx = c1.x - c2.x;
          var dy = c1.y - c2.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var angle = Math.atan2(dy, dx);

          var c1Force = 0;
          if (c1.isCrowded() || dist < TOO_CLOSE_THRESHOLD) {
            c1Force = Math.min(REPEL_FORCE / (dist * dist), MAX_FORCE);
          } else if (c1.isLonely()) {
            c1Force = -Math.min(REPEL_FORCE / (dist * dist), MAX_FORCE);
          }

          var fx1 = Math.cos(angle) * c1Force;
          var fy1 = Math.sin(angle) * c1Force;
          c1.vx += fx1;
          c1.vy += fy1;

          var c2Force = 0;
          if (c2.isCrowded() || dist < TOO_CLOSE_THRESHOLD) {
            c1Force = Math.min(REPEL_FORCE / (dist * dist), MAX_FORCE);
          } else if (c2.isLonely()) {
            c1Force = -Math.min(REPEL_FORCE / (dist * dist), MAX_FORCE);
          }
          var fx2 = Math.cos(angle) * c1Force;
          var fy2 = Math.sin(angle) * c1Force;
          c2.vx -= fx2;
          c2.vy -= fy2;
        }
      }

      for (var i = this.cells.length - 1; i > 0; i--) {
        var c = this.cells[i];
        if (c.isLonely()) {
          c.age++;
        } else if (c.isCrowded()) {
          c.age += c.neighbors;
        } else {
          var a = Math.random() * Math.PI * 2;
          if (Math.random() < SPAWN_CHANCE) {
            this.createCell(Math.cos(a) * SPAWN_RADIUS + c.x,
                Math.sin(a) * SPAWN_RADIUS + c.y);
          }
        }

        if (c.age > AGE_THESHOLD) {
          this.cells.splice(i, 1);
        }
      }

      for (var i = 0; i < this.cells.length / 30; i++) {
        var c = this.cells[Math.floor(Math.random() * this.cells.length)];
        if (c) {
          if (c.age > AGE_THESHOLD) {
            this.cells.splice(i, 1);
          }
          if (c.neighbors <= LONELY_THRESHOLD ||
            c.neighbors >= CROWDED_THRESHOLD) {
              c.age++;
            } else {

            }
          }
        }

        // update cells
        for (var i = 0; i < this.cells.length; i++) {
          this.cells[i].update();
        }
      }

      if (this.cells.length == 0) {
        if (this.onAllDead) {
          this.onAllDead();
        }
      }
    }

    Community.prototype.draw = function(ctx) {
      for (var i = 0; i < this.cells.length; i++) {
        this.cells[i].draw(ctx);
      }
    }
  })();
