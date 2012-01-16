$(document).ready(function() {

  module("Backbone.Validator");

  test('No validation with no validators', function() {
    var Model = Backbone.Validator.extend({});
    var model = new Model();
    model.set({name: 'Arthur Dent'});
    equals(model.get('name'), 'Arthur Dent');
  });

  test('"error" event passes errors object with msg', function() {
    var Model = Backbone.Validator.extend({
      validators: {
        email: {
          email: true,
          msg: 'Invalid Email'
        }
      }
    });
    var model = new Model();
    modelErrors = {};
    model.bind('error', function(model, errors) {
      modelErrors = errors;
    });
    model.set({email: 'asdf'});
    equals(modelErrors.email, 'Invalid Email');
  });

  test('attribute-specific "invalid" event with msg', function() {
    var Model = Backbone.Validator.extend({
      validators: {
        email: {
          email: true,
          msg: 'Invalid Email'
        }
      }
    });
    var model = new Model();
    var invalidEmailMsg;
    model.bind('invalid:email', function(model, msg) {
      invalidEmailMsg = msg;
    });
    model.set({email: 'asdf'});
    equals(invalidEmailMsg, 'Invalid Email');
  });

  test('intentionally anemic default msg ("invalid")', function() {
    var Model = Backbone.Validator.extend({
      validators: {
        email: {email: true}
      }
    });
    var model = new Model();
    var invalidEmailMsg;
    model.bind('invalid:email', function(model, msg) {
      invalidEmailMsg = msg;
    });
    model.set({email: 'asdf'});
    equals(invalidEmailMsg, 'invalid');
  });

  test('runs "required" first', function() {
    var Model = Backbone.Validator.extend({
      validators: {
        email: {
          required: true,
          email: true,
          msg: 'Email must be in the right format'
        }
      }
    });
    var model = new Model();
    var invalidEmailMsg;
    model.bind('invalid:email', function(model, msg) {
      invalidEmailMsg = msg;
    });
    model.set({email: ''});
    equals(invalidEmailMsg, 'required');
    model.set({email: 'asdf'});
    equals(invalidEmailMsg, 'Email must be in the right format');
  });

  test('customized "required" msg', function() {
    var Model = Backbone.Validator.extend({
      requiredMsg: 'The answer is always 42',
      validators: {
        email: {
          required: true,
          email: true,
          msg: 'Email must be in the right format'
        }
      }
    });
    var model = new Model();
    var invalidEmailMsg;
    model.bind('invalid:email', function(model, msg) {
      invalidEmailMsg = msg;
    });
    model.set({email: ''});
    equals(invalidEmailMsg, 'The answer is always 42');
    model.set({email: 'asdf'});
    equals(invalidEmailMsg, 'Email must be in the right format');
  });

});
