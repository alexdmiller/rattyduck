var STRETCH_THRESH = 0.1;
var BIRTH_THRESH = 0.05;
var REPEL_THRESH = 0.03;
var COOLDOWN = 4;
var EDGE_COOLDOWN = 100;
var NODE_DENSITY = 0.0002;
var SIGNAL_SPEED = 0.005;

var renderer;
var stage;
var graphics;
var nextId = 0;
var width = 1500;
var height = 1000;
var area = width * height;
var diagonal = Math.sqrt(width * width + height * height);

var settings = {
  title: {
    type: 'string',
    value: 'untitled'
  },
  numNodes: {
    title: 'Number of nodes',
    type: 'integer',
    value: 100,
    min: 0,
    max: 1000,
    step: 1
  },
  stretchThreshold: {
    title: 'Max. node connection distance',
    type: 'continuous',
    value: STRETCH_THRESH * diagonal,
    min: 0,
    max: STRETCH_THRESH * diagonal * 2,
    step: 0.1
  },
  birthThreshold: {
    title: 'Max. node connection spawn distance',
    type: 'continuous',
    value: BIRTH_THRESH * diagonal,
    min: 0,
    max: BIRTH_THRESH * diagonal * 2,
    step: 0.1
  },
  repelThreshold: {
    title: 'Min. node repel distance',
    type: 'continuous',
    value: REPEL_THRESH * diagonal,
    min: 0,
    max: REPEL_THRESH * diagonal * 2,
    step: 0.1
  },
  signalSpeed: {
    title: 'Signal speed',
    type: 'continuous',
    value: SIGNAL_SPEED * diagonal,
    min: 0.01,
    max: SIGNAL_SPEED * diagonal * 2,
    step: 0.1
  },
  cooldown: {
    title: 'Node cooldown time (frames)',
    type: 'continuous',
    value: ((STRETCH_THRESH * diagonal) / (SIGNAL_SPEED * diagonal)) * COOLDOWN,
    min: 0,
    max: ((STRETCH_THRESH * diagonal) / (SIGNAL_SPEED * diagonal)) * COOLDOWN * 2,
    step: 0.1
  },
  signalJitter: {
    title: 'Signal jitter',
    type: 'continuous',
    value: 10,
    min: 0,
    max: 100,
    step: 0.1
  },
  nodeColor: {
    type: 'color',
    value: 0x77fefb,
  },
  nodeBaseOpacity: {
    type: 'opacity',
    value: 0.1,
  },
  nodeSize: {
    title: 'Node size',
    type: 'continuous',
    value: 10,
    min: 0,
    max: 20
  },
  edgeColor: {
    type: 'color',
    value: 0xe09afe,
  },
  edgeBaseOpacity: {
    type: 'opacity',
    value: 0.1
  },
  signalColor: {
    type: 'color',
    value: 0xFFFFFF,
  },
  signalSize: {
    title: 'Signal size',
    type: 'continuous',
    value: 2,
    min: 0,
    max: 20
  }
};


var presets = [
  {
    title: "Chatty Buds",
    numNodes: 200,
    stretchThreshold: 200,
    birthThreshold: 73,
    repelThreshold: 33,
    signalSpeed: 10,
    cooldown: 120,
    signalJitter: 12,
    nodeColor: 0xFFFF00,
    nodeBaseOpacity: 0.1,
    nodeSize: 10,
    edgeColor: 0xFFFFFF,
    edgeBaseOpacity: 0.1,
    signalColor: 0xFFFF00,
    signalSize: 5
  },
  {
    title: "Explosive",
    numNodes: 250,
    stretchThreshold: 200,
    birthThreshold: 140,
    repelThreshold: 21,
    signalSpeed: 11,
    cooldown: 80,
    signalJitter: 50,
    nodeColor: 0xFF0000,
    nodeBaseOpacity: 0.0,
    nodeSize: 1,
    edgeColor: 0xFF0000,
    edgeBaseOpacity: 0,
    signalColor: 0xFF0000,
    signalSize: 3
  },
  {
    title: "Ice Crystals",
    numNodes: 400,
    stretchThreshold: 84,
    birthThreshold: 56,
    repelThreshold: 55,
    signalSpeed: 7,
    cooldown: 80,
    signalJitter: 0,
    nodeColor: 0x77fefb,
    nodeBaseOpacity: 0.1,
    nodeSize: 4,
    edgeColor: 0xe09afe,
    edgeBaseOpacity: 0.1,
    signalColor: 0xFFFFFF
  },
  {
    title: "Firey Introverts",
    numNodes: 200,
    stretchThreshold: 130,
    birthThreshold: 100,
    repelThreshold: 8,
    signalSpeed: 2,
    cooldown: 120,
    signalJitter: 12,
    nodeColor: 0xFFFFFF,
    nodeBaseOpacity: 0,
    nodeSize: 20,
    edgeColor: 0xCCCCCC,
    edgeBaseOpacity: 1,
    signalColor: 0xFF0000
  },
];

var nodes = [];
var signals = [];
var edges = {};

function createNode(x, y, vx, vy) {
  var node = {
    x: x,
    y: y,
    vx: vx,
    vy: vy,
    edges: [],
    signalCooldown: 0,
    id: '' + (++nextId)
  };
  nodes.push(node);
  return node;
}

function updateNode(n) {
  if (n.signalCooldown > 0) {
    n.signalCooldown -= (Math.random() * 3);
  }

  n.vx *= .98;
  n.vy *= .98;
  n.x += n.vx;
  n.y += n.vy;
  if (n.x > width) {
    n.x = width;
    n.vx *= -1;
  } else if (n.x < 0) {
    n.x = 0;
    n.vx *= -1;
  }
  if (n.y > height) {
    n.y = height;
    n.vy *= -1;
  } else if (n.y < 0) {
    n.y = 0;
    n.vy *= -1;
  }
}

function repel(n1, n2) {
  var dx = n1.x - n2.x;
  var dy = n1.y - n2.y;
  var dist = Math.sqrt(dx * dx + dy * dy);
  var angle = Math.atan2(dy, dx);
  var force = 20 / dist;
  n1.vx += Math.cos(angle) * force;
  n2.vx -= Math.cos(angle) * force;
  n1.vy += Math.sin(angle) * force;
  n2.vy -= Math.sin(angle) * force;
}

function distance(n1, n2) {
  var dx = n1.x - n2.x;
  var dy = n1.y - n2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function signal(n) {
  if (n.signalCooldown <= 0) {
    n.vx += Math.random() * settings.signalJitter.value
        - settings.signalJitter.value / 2;
    n.vy += Math.random() * settings.signalJitter.value
        - settings.signalJitter.value / 2;

    n.signalCooldown = settings.cooldown.value;
    for (var i = 0; i < n.edges.length; i++) {
      var edge = n.edges[i];
      if (!edge.signal) {
        var target = edge.n1 == n ? edge.n2 : edge.n1;
        edge.edgeCooldown = EDGE_COOLDOWN;
        edge.signal = {
          position: 0,
          origin: n,
          target: target
        }
      }
    }
  }
}


function createEdge(n1, n2) {
  var edge = {
    n1: n1,
    n2: n2,
    edgeCooldown: 0
  };
  n1.edges.push(edge);
  n2.edges.push(edge);
  edges[n1.id + n2.id] = edge;
}

function removeEdge(id) {
  var edge = edges[id]
  var index1 = edge.n1.edges.indexOf(edge);
  edge.n1.edges.splice(index1, 1);
  var index2 = edge.n2.edges.indexOf(edge);
  edge.n2.edges.splice(index2, 1);
  delete edges[id];

}

function getEdge(n1, n2) {
  return edges[n1.id + n2.id];
}

function startSimulation() {
  nodes = [];
  signals = [];
  edges = {};

  for (var i = 0; i < settings.numNodes.value; i++) {
    var n1 = createNode(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1);
    }
}

function onMouseClick(event) {
  $('#click-message').fadeOut();
  $('.previous-button').fadeIn();
  $('.next-button').fadeIn();

  var position = event.global;
  var minNode = nodes[0];
  var min = diagonal;
  for (var i = 0; i < nodes.length; i++) {
    var dx = nodes[i].x - position.x;
    var dy = nodes[i].y - position.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < min) {
      min = dist;
      minNode = nodes[i];
    }
  }
  signal(minNode);
}

function animate() {
  graphics.clear();

  for (var i = 0; i < nodes.length; i++) {
    for (var j = i + 1; j < nodes.length; j++) {
      var n1 = nodes[i],
          n2 = nodes[j];
      var dist = distance(n1, n2);

      // Repel nodes that are too close
      if (dist < settings.repelThreshold.value) {
        repel(n1, n2);
      }

      // Birth new edges from close-together nodes
      if (dist < settings.birthThreshold.value && !getEdge(n1, n2)) {
        createEdge(n1, n2);
      }
    }
  }

  // Remove edges that have "stretched" too far
  for (id in edges) {
    var edge = edges[id];
    if (distance(edge.n1, edge.n2) > settings.stretchThreshold.value) {
      removeEdge(id);
    }
  }

  // Draw edges
  for (id in edges) {
    var edge = edges[id];

    graphics.lineStyle(
        1,
        settings.edgeColor.value,
        settings.edgeBaseOpacity.value
            + (edge.edgeCooldown / EDGE_COOLDOWN) * 0.3);
    edge.edgeCooldown = Math.max(0, edge.edgeCooldown - 1);

    graphics.moveTo(edge.n1.x, edge.n1.y);
    graphics.lineTo(edge.n2.x, edge.n2.y);

    if (edge.signal) {
      var dx = edge.signal.target.x - edge.signal.origin.x;
      var dy = edge.signal.target.y - edge.signal.origin.y;
      var dist = Math.sqrt(dx*dx + dy*dy);
      var angle = Math.atan2(dy, dx);
      var signalX = edge.signal.origin.x + (Math.cos(angle) * edge.signal.position);
      var signalY = edge.signal.origin.y + (Math.sin(angle) * edge.signal.position);
      edge.signal.position += settings.signalSpeed.value;
      graphics.beginFill(settings.signalColor.value);
      graphics.lineStyle(0, 0, 0);
      graphics.drawRect(
          signalX - settings.signalSize.value / 2,
          signalY - settings.signalSize.value / 2,
          settings.signalSize.value,
          settings.signalSize.value);
      graphics.endFill();

      if (dist <= edge.signal.position) {
        var target = edge.signal.target;
        delete edge.signal;
        signal(target);
      }
    }
  }

  // Basic node position updates
  for (var i = 0; i < nodes.length; i++) {
    updateNode(nodes[i]);
    graphics.beginFill(
        settings.nodeColor.value,
        settings.nodeBaseOpacity.value
            + nodes[i].signalCooldown / settings.cooldown.value);
    graphics.lineStyle(0);
    graphics.drawRect(
        nodes[i].x - settings.nodeSize.value / 2,
        nodes[i].y - settings.nodeSize.value / 2,
        settings.nodeSize.value,
        settings.nodeSize.value);
  }

  renderer.render(stage);
  requestAnimFrame(animate);
}


function main() {
  // create an new instance of a pixi stage
  stage = new PIXI.Stage(0x000000, true);
  stage.mousedown = onMouseClick;
  renderer = PIXI.autoDetectRenderer(width, height);

  // set the canvas width and height to fill the screen
  renderer.view.style.display = "block";
  $(renderer.view).css('width', width);
  $(renderer.view).css('height', height);

  // add render view to DOM
  document.body.appendChild(renderer.view);

  graphics = new PIXI.Graphics();
  stage.addChild(graphics);

  startSimulation();

  var settingsControl = new SettingsPane(settings, presets);
  $(document.body).append(settingsControl.getElement());

  settingsControl.onUpdate(function() {
    $('#title').text('"'+ settings.title.value + '"');
    startSimulation();
  });
  settingsControl.setPreset(0);

  $('#settings-button').click(function() {
    $('.settings-pane').toggle();
    $('.settings-pane').css('top', $('#settings-button').offset().top
        + $('#settings-button').outerHeight());
  })

  center($(renderer.view));

  $('.previous-button').click(function() {
    settingsControl.previousPreset();
  });
  centerVertically($('.previous-button'));
  $('.next-button').click(function() {
    settingsControl.nextPreset();
  });
  centerVertically($('.next-button'));

  center($('#click-message'));

  requestAnimFrame(animate);
}

$(document).ready(main);
