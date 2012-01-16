;(function(_, Backbone) {

  /**
   * Backbone.Validator
   * ==================
   */

  var Validator = Backbone.Validator = Backbone.Model.extend({

    /**
     * Validate incoming attributes.
     *
     * If an `error` callback has been passed, it will be called if any
     * validations fail.
     *
     * Otherwise, the following events will be fired:
     * - a general `error` event
     * - specific `invalid:<attrName>` events for each invalid attribute
     *
     * Returns `true` if all `attributes` are valid, `false` otherwise.
     */

    _performValidation: function(attributes, options) {
      var name, errors = this.validate(attributes, options);

      // Short-circuit if there aren't any errors.
      if (_.isEmpty(errors)) return true;

      // Call the callback or trigger the events.
      if (options.error) {
        options.error(this, errors, options);
      } else {
        this.trigger('error', this, errors, options);
        for (name in errors) {
          this.trigger('invalid:' + name, this, errors[name], options);
        }
      }
      return false;
    },

    /**
     * This function performs double-duty.
     *
     * First, Backbone Models won't run unless the `validate` property
     * evaluates as truthy. So, check.
     *
     * Second, it iterates over incoming attributes and checks them for
     * validity using `this.validateAttribute`.
     *
     * Returns an errors object (which will be empty if there were no errors).
     */

    validate: function(attributes, options) {
      var name, value, errors = {};

      for (name in attributes) {
        value = attributes[name];
        if (!this.validateAttribute(name, value)) {
          errors[name] = this.validators[name].msg;
        }
      }

      return errors;
    },

    /**
     * Validate a single attribute.
     *
     * Give the attribute's `name` and `value`, return true if the attribute is
     * valid, false otherwise.
     */

    validateAttribute: function(name, value) {
      var v, validators, options;

      if (!this.validators) return true;

      validators = this.validators[name];

      for (v in validators) {
        if (v === 'msg') continue;
        options = validators[v];
        if (!Validator.validators[v](options, value)) return false;
      }

      return true;
    },

  });

  Validator.validators = {
    length: function(options, value) {
      var min = options.min || 0
        , max = options.max || Infinity
        , len = value.length;

      return len >= min && len <= max;
    }
  };

}(_, Backbone));
