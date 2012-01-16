# Backbone.Validator

Simple validation for Backbone Models.

## Motivation & Inspiration

I wanted some simple, per-attribute validation for Backbone Models. There are
already some libraries out there that provide this, by [n-time][1] and
[thedersen][2], but neither worked quite the way I wanted.

[Thedersen's][2] is based around binding model validations to the view
containing the form, which is really cool, but I prefer to keep the validation
in the model layer and handle the view stuff myself.

[n-time's][1] version was almost exactly what I wanted, but I also wanted the
ability to provide custom messages for invalid attributes, declared in the
model itself.

I then stumbled across [jquery-validation][3], which has some nifty builtin
validators, caught a whiff of time-to-scratch-my-own-itch, and thus was
Backbone.Validator born.

[1]: https://github.com/n-time/backbone.validations
[2]: https://github.com/thedersen/backbone.validation
[3]: https://github.com/jzaefferer/jquery-validation

## Usage

Coming soon...
