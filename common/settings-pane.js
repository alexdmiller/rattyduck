function SettingsPane(dataContainer, presets) {
  this.dataContainer = dataContainer;
  this.presets = presets;
  this.element = this.createElement();
  this.currentPreset = 0;
}

SettingsPane.prototype.createElement = function() {
  var self = this;
  var container = $('<div class="settings-pane">');

  var presetDropdown = $('<select class="preset-dropdown">');
  $.each(this.presets, function(index, preset) {
    var option = $('<option>');
    option.val(index);
    option.text(preset.title);
    presetDropdown.append(option);
  });
  container.append(presetDropdown);
  $(presetDropdown).change(function() {
    self.setPreset(presetDropdown.val());
  });

  var controllerContainer = $('<div class="controllers">');
  $.each(this.dataContainer, function(name, setting) {
    var control = self.createControl(name, setting);
    controllerContainer.append(control);
  });
  container.append(controllerContainer);
  return container;
};

SettingsPane.prototype.getElement = function() {
  return this.element;
};

SettingsPane.prototype.nextPreset = function() {
  this.setPreset((this.currentPreset + 1) % this.presets.length);
};

SettingsPane.prototype.previousPreset = function() {
  var i = this.currentPreset - 1;
  this.setPreset((i % this.presets.length + this.presets.length) % this.presets.length);
};

SettingsPane.prototype.setPreset = function(presetIndex) {
  this.currentPreset = presetIndex;
  this.element.children('.preset-dropdown').val(presetIndex);
  var self = this;
  var preset = this.presets[presetIndex];
  $.each(preset, function(attrName) {
    self.dataContainer[attrName].value = preset[attrName];
  });
  this.triggerUpdateListener();
  this.rerender();
};

SettingsPane.prototype.createControl = function(name, setting) {
  switch (setting.type) {
    case 'continuous':
      return this.createRange(name, setting);
    case 'integer':
      return this.createRange(name, setting);
    case 'boolean':
      // TODO
      return null;
  }
};

SettingsPane.prototype.rerender = function() {
  var self = this;
  $.each(this.dataContainer, function(name, setting) {
    $('#' + name).val(setting.value);
    $('#' + name + 'Output').val(setting.value);
  });
};

SettingsPane.prototype.onUpdate = function(fn) {
  this.updateListener = fn;
};

SettingsPane.prototype.triggerUpdateListener = function() {
  if (this.updateListener) {
    this.updateListener();
  }
};

SettingsPane.prototype.createRange = function(name, setting) {
  var container = $('<div>');
  container.addClass('control');

  var label = $('<label>');
  label.attr('for', name);
  label.html(setting.title);
  container.append(label);

  var range = $('<input type=range>');
  range.attr('id', name);
  range.attr('min', setting.min);
  range.attr('max', setting.max);
  range.attr('step', setting.step)
  range.attr('value', setting.value);
  container.append(range);

  var output = $('<output>')
  output.attr('for', name);
  output.attr('id', name + 'Output');
  container.append(output);

  output.html(range.val());
  $(range).on('input', function(event) {
    output.html(range.val());
  });

  var self = this;
  $(range).change(function() {
    setting.value = Number(range.val());
    self.triggerUpdateListener();
  });

  return container;
};
