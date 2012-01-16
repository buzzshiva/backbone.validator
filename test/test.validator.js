$(function() {

  module('Backbone.Validator');

  test('no validation with no validators', function() {
    var Model = Backbone.Validator.extend({});
    var model = new Model();
    var name = 'Arthur Dent';
    model.set({name: name});
    equals(name, model.get('name'));
  });

  module('Validator: Length');

  test('length', function() {
    var Model = Backbone.Validator.extend({
      validators: {
        name: {
          length: {max: 5},
          msg: "Can't be longer than 5 characters"
        }
      }
    });

    var model = new Model();
    var modelErrors = {};
    model.bind('error', function(model, errors) {
      modelErrors = errors;
    });
    model.set({name: 'Arthur Dent'});
    equals("Can't be longer than 5 characters", modelErrors.name);
    model.set({name: 'Ford'});
    equals('Ford', model.get('name'));
  });

});
