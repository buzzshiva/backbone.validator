/**
 * Tests adapted from the excellent jquery-validation library:
 * https://github.com/jzaefferer/jquery-validation
*/

$(function() {

  function testValidator(name, options) {
    var method = Backbone.Validator.validators[name];
    return function(value) {
      return method(value, options);
    };
  }

  module("Backbone.Validator Builtins");

  test('required', function() {
    var req = testValidator('required');
    ok(!req(undefined), 'Invalid: undefined');
    ok(!req(null), 'Invalid: null');
    ok(!req(''), 'Invalid: empty string');
    ok(!req("\n"), 'Invalid: only whitespace');
    ok(!req("   \t"), 'Invalid: only whitespace');
    ok( req('           d'), 'Valid: any non-whitespace');
    ok( req(5), 'Valid: numbers');
  });

  test('fn (function object)', function() {
    var equalTo3 = function(value) { return value == 3; };
    var Model = Backbone.Validator.extend({
      validators: {
        number: {
          fn: equalTo3,
          msg: 'Gotta be equal to 3'
        }
      }
    });
    var model = new Model();
    var errormsg;
    model.bind('invalid:number', function(model, msg) {
      errormsg = msg;
    });
    model.set({number: 4});
    equals(errormsg, 'Gotta be equal to 3');
    model.set({number: 3});
    equals(model.get('number'), 3);
  });

  test('fn (string)', function() {
    var Model = Backbone.Validator.extend({
      validators: {
        number: {
          fn: 'equalToMe',
          msg: 'Gotta be equal to Me'
        }
      },
      me: 3,
      equalToMe: function(value) {
        return value == this.me;
      }
    });
    var model = new Model();
    var errormsg;
    model.bind('invalid:number', function(model, msg) {
      errormsg = msg;
    });
    model.set({number: 4});
    equals(errormsg, 'Gotta be equal to Me');
    model.set({number: 3});
    equals(model.get('number'), 3);
  });

  test("url", function() {
    var method = testValidator("url");
    ok( method( "http://bassistance.de/jquery/plugin.php?bla=blu" ), "Valid url" );
    ok( method( "https://bassistance.de/jquery/plugin.php?bla=blu" ), "Valid url" );
    ok( method( "ftp://bassistance.de/jquery/plugin.php?bla=blu" ), "Valid url" );
    ok( method( "http://www.føtex.dk/" ), "Valid url, danish unicode characters" );
    ok( method( "http://bösendorfer.de/" ), "Valid url, german unicode characters" );
    ok( method( "http://192.168.8.5" ), "Valid IP Address" )
    ok(!method( "http://192.168.8." ), "Invalid IP Address" )
    ok(!method( "http://bassistance" ), "Invalid url" ); // valid
    ok(!method( "http://bassistance." ), "Invalid url" ); // valid
    ok(!method( "http://bassistance,de" ), "Invalid url" );
    ok(!method( "http://bassistance;de" ), "Invalid url" );
    ok(!method( "http://.bassistancede" ), "Invalid url" );
    ok(!method( "bassistance.de" ), "Invalid url" );
  });

  test("url2 (tld optional)", function() {
    var method = testValidator("url2");
    ok( method( "http://bassistance.de/jquery/plugin.php?bla=blu" ), "Valid url" );
    ok( method( "https://bassistance.de/jquery/plugin.php?bla=blu" ), "Valid url" );
    ok( method( "ftp://bassistance.de/jquery/plugin.php?bla=blu" ), "Valid url" );
    ok( method( "http://www.føtex.dk/" ), "Valid url, danish unicode characters" );
    ok( method( "http://bösendorfer.de/" ), "Valid url, german unicode characters" );
    ok( method( "http://192.168.8.5" ), "Valid IP Address" )
    ok(!method( "http://192.168.8." ), "Invalid IP Address" )
    ok( method( "http://bassistance" ), "Invalid url" );
    ok( method( "http://bassistance." ), "Invalid url" );
    ok(!method( "http://bassistance,de" ), "Invalid url" );
    ok(!method( "http://bassistance;de" ), "Invalid url" );
    ok(!method( "http://.bassistancede" ), "Invalid url" );
    ok(!method( "bassistance.de" ), "Invalid url" );
  });

  test("email", function() {
    var method = testValidator("email");
    ok( method( "name@domain.tld" ), "Valid email" );
    ok( method( "name@domain.tl" ), "Valid email" );
    ok( method( "bart+bart@tokbox.com" ), "Valid email" );
    ok( method( "bart+bart@tokbox.travel" ), "Valid email" );
    ok( method( "n@d.tld" ), "Valid email" );
    ok( method( "ole@føtex.dk"), "Valid email" );
    ok( method( "jörn@bassistance.de"), "Valid email" );
    ok( method( "bla.blu@g.mail.com"), "Valid email" );
    ok( method( "\"Scott Gonzalez\"@example.com" ), "Valid email" );
    ok( method( "\"Scott González\"@example.com" ), "Valid email" );
    ok( method( "\"name.\"@domain.tld" ), "Valid email" ); // valid without top label
    ok( method( "\"name,\"@domain.tld" ), "Valid email" ); // valid without top label
    ok( method( "\"name;\"@domain.tld" ), "Valid email" ); // valid without top label
    ok(!method( "name" ), "Invalid email" );
    ok(!method( "name@" ), "Invalid email" );
    ok(!method( "name@domain" ), "Invalid email" );
    ok(!method( "name.@domain.tld" ), "Invalid email" );
    ok(!method( "name,@domain.tld" ), "Invalid email" );
    ok(!method( "name;@domain.tld" ), "Invalid email" );
    ok(!method( "name;@domain.tld." ), "Invalid email" );
  });

  test("email2 (tld optional)", function() {
    var method = testValidator("email2");
    ok( method( "name@domain.tld" ), "Valid email" );
    ok( method( "name@domain.tl" ), "Valid email" );
    ok( method( "bart+bart@tokbox.com" ), "Valid email" );
    ok( method( "bart+bart@tokbox.travel" ), "Valid email" );
    ok( method( "n@d.tld" ), "Valid email" );
    ok( method( "ole@føtex.dk"), "Valid email" );
    ok( method( "jörn@bassistance.de"), "Valid email" );
    ok( method( "bla.blu@g.mail.com"), "Valid email" );
    ok( method( "\"Scott Gonzalez\"@example.com" ), "Valid email" );
    ok( method( "\"Scott González\"@example.com" ), "Valid email" );
    ok( method( "\"name.\"@domain.tld" ), "Valid email" ); // valid without top label
    ok( method( "\"name,\"@domain.tld" ), "Valid email" ); // valid without top label
    ok( method( "\"name;\"@domain.tld" ), "Valid email" ); // valid without top label
    ok(!method( "name" ), "Invalid email" );
    ok(!method( "name@" ), "Invalid email" );
    ok( method( "name@domain" ), "Invalid email" );
    ok(!method( "name.@domain.tld" ), "Invalid email" );
    ok(!method( "name,@domain.tld" ), "Invalid email" );
    ok(!method( "name;@domain.tld" ), "Invalid email" );
  });

  test("number", function() {
    var method = testValidator("number");
    ok( method( "123" ), "Valid number" );
    ok( method( "-123" ), "Valid number" );
    ok( method( "123,000" ), "Valid number" );
    ok( method( "-123,000" ), "Valid number" );
    ok( method( "123,000.00" ), "Valid number" );
    ok( method( "-123,000.00" ), "Valid number" );
    ok(!method( "123.000,00" ), "Invalid number" );
    ok(!method( "123.0.0,0" ), "Invalid number" );
    ok(!method( "x123" ), "Invalid number" );
    ok(!method( "100.100,0,0" ), "Invalid number" );

    ok( method( "123" ), "Valid decimal" );
    ok( method( "123000" ), "Valid decimal" );
    ok( method( "123000.12" ), "Valid decimal" );
    ok( method( "-123000.12" ), "Valid decimal" );
    ok( method( "123.000" ), "Valid decimal" );
    ok( method( "123,000.00" ), "Valid decimal" );
    ok( method( "-123,000.00" ), "Valid decimal" );
    ok(!method( "1230,000.00" ), "Invalid decimal" );
    ok(!method( "123.0.0,0" ), "Invalid decimal" );
    ok(!method( "x123" ), "Invalid decimal" );
    ok(!method( "100.100,0,0" ), "Invalid decimal" );
  });

  test('length', function() {
    var min = testValidator('length', {min: 5});
    ok( min('123456'), 'Longer than min');
    ok( min('12345'), 'At min length');
    ok(!min('1234'), 'Shorter than min');

    var max = testValidator('length', {max: 5});
    ok(!max('123456'), 'Longer than max');
    ok( max('12345'), 'At max length');
    ok( max('1234'), 'Shorter than max');

    var minmax = testValidator('length', {min: 5, max: 10});
    ok(!minmax('1234'), 'Shorter than min');
    ok( minmax('12345'), 'At min');
    ok( minmax('1234567890'), 'At max');
    ok(!minmax('12345678901'), 'Longer than max');

    var pathological = testValidator('length', {min:4, max: 2});
    raises(function() { pathological('1234'); });
  });


  test("min", function() {
    var min = testValidator('min', 5)
    ok( min('5'), 'Valid string at min');
    ok( min('6'), 'Valid string > min');
    ok(!min('3'), 'Valid string < min');
    ok(!min('asdf'), 'Invalid string');
  });

  test("max", function() {
    var max = testValidator('max', 5)
    ok( max('5'), 'Valid string at max');
    ok(!max('6'), 'Valid string > max');
    ok( max('3'), 'Valid string < max');
    ok(!max('asdf'), 'Invalid string');
  });

  test("phone (us)", function() {
    var method = testValidator("phoneUS");
    ok( method( "1(212)-999-2345" ), "Valid us phone number" );
    ok( method( "212 999 2344" ), "Valid us phone number" );
    ok( method( "212-999-0983" ), "Valid us phone number" );
    ok(!method( "111-123-5434" ), "Invalid us phone number" );
    ok(!method( "212 123 4567" ), "Invalid us phone number" );
  });

  test("pattern", function() {
    var pat = testValidator("pattern", /^AR\d{4}$/);
    ok( pat( "AR1004" ), "Correct format for the given RegExp" );
    ok( !pat( "BR1004" ), "Invalid format for the given RegExp" );
  });

  test('creditcardtypes, all', function() {
    var cc = testValidator('creditcard', {all: true});

    equals(cc("4111-1111-1111-1111"), true, 'Valid VISA');
    equals(cc("5111-1111-1111-1118"), true, 'Valid MasterCard');
    equals(cc("6111-1111-1111-1116"), true, 'Valid Discover');
    equals(cc("3400-0000-0000-009"), true, 'Valid AMEX');

    equals(cc("4111-1111-1111-1110"), false, 'Invlaid VISA');
    equals(cc("5432-1111-1111-1111"), false, 'Invalid MasterCard');
    equals(cc("6611-6611-6611-6611"), false, 'Invalid Discover');
    equals(cc("3777-7777-7777-7777"), false, 'Invalid AMEX');

  });

  test('creditcardtypes, visa', function() {
    var visa = testValidator('creditcard', {visa: true});

    equals(visa("4111-1111-1111-1111"), true, 'VISA');
    equals(visa("5111-1111-1111-1118"), false, 'MasterCard');
    equals(visa("6111-1111-1111-1116"), false, 'Discover');
    equals(visa("3400-0000-0000-009"), false, 'AMEX');
  });

  test('creditcardtypes, mastercard', function() {
    var mastercard = testValidator('creditcard', {mastercard: true});

    equals(mastercard("5111-1111-1111-1118"), true, 'MasterCard');
    equals(mastercard("6111-1111-1111-1116"), false, 'Discover');
    equals(mastercard("3400-0000-0000-009"), false, 'AMEX');
    equals(mastercard("4111-1111-1111-1111"), false, 'VISA');
  });

});
