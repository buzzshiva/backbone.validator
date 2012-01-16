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
        if (!Validator.validators[v](value, options)) return false;
      }

      return true;
    },

  });

  Validator.regexen = {
    // Contributed to jquery-validation by Scott Gonzalez:
    // http://projects.scottsplayground.com/iri/
    url: /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,

    // Same as `url`, but TLD is optional
    url2: /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,

    // Contributed to jquery-validation by Scott Gonzalez:
    // http://projects.scottsplayground.com/email_address_validation/
    email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,

    // Same as `email`, with TLD optional
    email2: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,

    // From jquery-validation
    number: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,

    // From jquery-validation
    phoneUS: /^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/

  }


  Validator.validators = {
    length: function(value, options) {
      var min = options.min || 0
        , max = options.max || Infinity
        , len = value.length;

      if (min > max) {
        throw new Error("Validator[length]: min can't be less then max");
      }

      return len >= min && len <= max;
    },

    min: function(value, minValue) {
      return value >= minValue;
    },

    max: function(value, maxValue) {
      return value <= maxValue;
    },

    pattern: function(value, pattern) {
      return pattern.test(value);
    },

    url: function(value) {
      return Validator.regexen.url.test(value);
    },

    url2: function(value) {
      return Validator.regexen.url2.test(value);
    },

    email: function(value) {
      return Validator.regexen.email.test(value);
    },

    email2: function(value) {
      return Validator.regexen.email2.test(value);
    },

    number: function(value) {
      return Validator.regexen.number.test(value);
    },

    phoneUS: function(value) {
      return Validator.regexen.phoneUS.test(value.replace(/\s+/g, ''));
    },

    /**
     * Modified from jquery-validation.
     *
     * NOTICE: Modified version of
     * Castle.Components.Validator.CreditCardValidator
     *
     * Redistributed under the the Apache License 2.0 at
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Valid Types: mastercard, visa, amex, dinersclub, enroute, discover, jcb,
     * unknown, all (overrides all other settings)
     */

    creditcard: function(value, options) {

      if (/[^0-9-]+/.test(value)) return false;

      value = value.replace(/\D/g, "");

      if (!luhnCheck(value)) return false;

      var validTypes = 0x0000;

      if (options.mastercard) validTypes |= 0x0001;
      if (options.visa)       validTypes |= 0x0002;
      if (options.amex)       validTypes |= 0x0004;
      if (options.dinersclub) validTypes |= 0x0008;
      if (options.enroute)    validTypes |= 0x0010;
      if (options.discover)   validTypes |= 0x0020;
      if (options.jcb)        validTypes |= 0x0040;
      if (options.unknown)    validTypes |= 0x0080;
      if (options.all)        validTypes = 0x0001 | 0x0002 | 0x0004 | 0x0008 |
                                           0x0010 | 0x0020 | 0x0040 | 0x0080;

      // MasterCard
      if (validTypes & 0x0001 && /^(51|52|53|54|55)/.test(value)) {
        return value.length == 16;
      }
      // VISA
      if (validTypes & 0x0002 && /^(4)/.test(value)) {
        return value.length == 16;
      }
      // AMEX
      if (validTypes & 0x0004 && /^(34|37)/.test(value)) {
        return value.length == 15;
      }
      // DinersClub
      if (validTypes & 0x0008 &&
          /^(300|301|302|303|304|305|36|38)/.test(value)) {
        return value.length == 14;
      }
      // Enroute
      if (validTypes & 0x0010 && /^(2014|2149)/.test(value)) {
        return value.length == 15;
      }
      // Discover
      if (validTypes & 0x0020 && /^(6011)/.test(value)) {
        return value.length == 16;
      }
      // JCB
      if (validTypes & 0x0040 && /^(3)/.test(value)) {
        return value.length == 16;
      }
      // JCB
      if (validTypes & 0x0040 && /^(2131|1800)/.test(value)) {
        return value.length == 15;
      }
      // Unknown
      if (validTypes & 0x0080) {
        return true;
      }
      return false;
    }

  };

  /**
   * Run a luhn digit check on a string of digits. Used by the `creditcard`
   * validator.
   */

  function luhnCheck(value) {
    var i, digit, even = false, check = 0;

    for (i = value.length - 1; i >= 0; i--) {
      digit = parseInt(value.charAt(i));
      if (even) {
        if ((digit *= 2) > 9) digit -= 9;
      }
      check += digit;
      even = !even;
    }

    return (check % 10) === 0;
  }

}(_, Backbone));
