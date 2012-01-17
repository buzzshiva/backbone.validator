# Backbone.Validator

Simple, declarative validation for Backbone Models.

## Download

[development][dev]
[production][prod]

[prod]: https://raw.github.com/satchmorun/backbone.validator/master/backbone.validator.min.js
[dev]: https://raw.github.com/satchmorun/backbone.validator/master/backbone.validator.js

## Usage

Have your models inherit from Backbone.Validator instead of Backbone.Model
(Backbone.Validator itself inherits from Backbone.Model and just enhances the
validation stuff. If you run the tests, you'll see it passes all the
Backbone.Model tests.):

### Declaring Validators

```javascript
var Login = Backbone.Validator.extend({
  validators: {
    email: {
      required: true,
      email: true,
      msg: 'Please provide a valid email address'
    },

    password: {
      required: true,
      length: {min: 6, max: 18},
      msg: 'Password must be between 6 and 18 characters long'
    }
  }
});
```

### Validation Events/Callbacks

Backbone.Validators fires both general and specific error events. Take the
Login model above, for example:

```javascript
var login = new Login();

// Backbone.Validator will fire an 'error' event, passing along an errors
// object keyed by attribute name.
login.bind('error', function(model, errors, options) {
});

// Backbone.Validator also provides attribute-specific events (e.g.
// 'error:email'), passing just that attributes error msg.
login.bind('error:email', function(model, errorMsg, options) {
});
```

Additionally, if you pass in an `error` callback as an option,
Backbone.Validator won't fire any events, but will call you callback instead.
So no events will get fired in the following example:

```javascript
var login = new Login();

login.set({email: ''}, {error: function() {
  // Custome error-handling...
}});
```

### Error messages

If you look at the Login example above, you'll see that a `msg` property has
been specified. Backbone.Validator doesn't try to generate an error message for
you. If you don't specify a `msg`, the message will simply be `'invalid'` or
`'required'` (depending on whether or not it was required).

The reason for this is that I always end up customizing the messages anyway. So
be nice to your users and give them nice error messages. :)

## Builtin Validators

This will be fleshed out soon. For now, just take a look at the source - it's
only 319 lines.

### required
### length
### fn
### min
### max
### matches
### url
### url2
### email
### email2
### number
### phoneUS
### creditcard

## Credit where credit is due

I ran across the excellent [jquery-validation][3] library, and borrowed many of
the builtin validators from it. It was nice to have access to some of the hairy
and well-tested regexes they use (I also borrowed some of their tests).

## Similar projects

- [backbone.validations][1]
- [backbone.validation][2]

[1]: https://github.com/n-time/backbone.validations
[2]: https://github.com/thedersen/backbone.validation
[3]: https://github.com/jzaefferer/jquery-validation
