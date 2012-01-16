suite("Original Model Tests, applied to Validator", function() {

  // Variable to catch the last request.
  window.lastRequest = null;

  window.originalSync = Backbone.sync;

  // Stub out Backbone.request...
  Backbone.sync = function() {
    lastRequest = _.toArray(arguments);
  };

  // Redefine Backbone.Model to Backbone.Validator
  Backbone.Model = Backbone.Validator;

  var attrs = {
    id     : '1-the-tempest',
    title  : "The Tempest",
    author : "Bill Shakespeare",
    length : 123
  };

  var proxy = Backbone.Model.extend();
  var doc = new proxy(attrs);

  var klass = Backbone.Collection.extend({
    url : function() { return '/collection'; }
  });

  var collection = new klass();
  collection.add(doc);

  test("Model: initialize", function() {
    var Model = Backbone.Model.extend({
      initialize: function() {
        this.one = 1;
        assert.equal(this.collection, collection);
      }
    });
    var model = new Model({}, {collection: collection});
    assert.equal(model.one, 1);
    assert.equal(model.collection, collection);
  });

  test("Model: initialize with attributes and options", function() {
    var Model = Backbone.Model.extend({
      initialize: function(attributes, options) {
        this.one = options.one;
      }
    });
    var model = new Model({}, {one: 1});
    assert.equal(model.one, 1);
  });

  test("Model: initialize with parsed attributes", function() {
    var Model = Backbone.Model.extend({
      parse: function(obj) {
        obj.value += 1;
        return obj;
      }
    });
    var model = new Model({value: 1}, {parse: true});
    assert.equal(model.get('value'), 2);
  });

  test("Model: url", function() {
    assert.equal(doc.url(), '/collection/1-the-tempest');
    doc.collection.url = '/collection/';
    assert.equal(doc.url(), '/collection/1-the-tempest');
    doc.collection = null;
    var failed = false;
    try {
      doc.url();
    } catch (e) {
      failed = true;
    }
    assert.equal(failed, true);
    doc.collection = collection;
  });

  test("Model: url when using urlRoot, and uri encoding", function() {
    var Model = Backbone.Model.extend({
      urlRoot: '/collection'
    });
    var model = new Model();
    assert.equal(model.url(), '/collection');
    model.set({id: '+1+'});
    assert.equal(model.url(), '/collection/%2B1%2B');
  });

  test("Model: url when using urlRoot as a function to determine urlRoot at runtime", function() {
    var Model = Backbone.Model.extend({
      urlRoot: function() {
        return '/nested/' + this.get('parent_id') + '/collection';
      }
    });

    var model = new Model({parent_id: 1});
    assert.equal(model.url(), '/nested/1/collection');
    model.set({id: 2});
    assert.equal(model.url(), '/nested/1/collection/2');
  });

  test("Model: clone", function() {
    attrs = { 'foo': 1, 'bar': 2, 'baz': 3};
    a = new Backbone.Model(attrs);
    b = a.clone();
    assert.equal(a.get('foo'), 1);
    assert.equal(a.get('bar'), 2);
    assert.equal(a.get('baz'), 3);
    assert.equal(b.get('foo'), a.get('foo'), "Foo should be the same on the clone.");
    assert.equal(b.get('bar'), a.get('bar'), "Bar should be the same on the clone.");
    assert.equal(b.get('baz'), a.get('baz'), "Baz should be the same on the clone.");
    a.set({foo : 100});
    assert.equal(a.get('foo'), 100);
    assert.equal(b.get('foo'), 1, "Changing a parent attribute does not change the clone.");
  });

  test("Model: isNew", function() {
    attrs = { 'foo': 1, 'bar': 2, 'baz': 3};
    a = new Backbone.Model(attrs);
    assert.ok(a.isNew(), "it should be new");
    attrs = { 'foo': 1, 'bar': 2, 'baz': 3, 'id': -5 };
    a = new Backbone.Model(attrs);
    assert.ok(!a.isNew(), "any defined ID is legal, negative or positive");
    attrs = { 'foo': 1, 'bar': 2, 'baz': 3, 'id': 0 };
    a = new Backbone.Model(attrs);
    assert.ok(!a.isNew(), "any defined ID is legal, including zero");
    assert.ok( new Backbone.Model({          }).isNew(), "is true when there is no id");
    assert.ok(!new Backbone.Model({ 'id': 2  }).isNew(), "is false for a positive integer");
    assert.ok(!new Backbone.Model({ 'id': -5 }).isNew(), "is false for a negative integer");
  });

  test("Model: get", function() {
    assert.equal(doc.get('title'), 'The Tempest');
    assert.equal(doc.get('author'), 'Bill Shakespeare');
  });

  test("Model: escape", function() {
    assert.equal(doc.escape('title'), 'The Tempest');
    doc.set({audience: 'Bill & Bob'});
    assert.equal(doc.escape('audience'), 'Bill &amp; Bob');
    doc.set({audience: 'Tim > Joan'});
    assert.equal(doc.escape('audience'), 'Tim &gt; Joan');
    doc.set({audience: 10101});
    assert.equal(doc.escape('audience'), '10101');
    doc.unset('audience');
    assert.equal(doc.escape('audience'), '');
  });

  test("Model: has", function() {
    attrs = {};
    a = new Backbone.Model(attrs);
    assert.equal(a.has("name"), false);
    _([true, "Truth!", 1, false, '', 0]).each(function(value) {
      a.set({'name': value});
      assert.equal(a.has("name"), true);
    });
    a.unset('name');
    assert.equal(a.has('name'), false);
    _([null, undefined]).each(function(value) {
      a.set({'name': value});
      assert.equal(a.has("name"), false);
    });
  });

  test("Model: set and unset", function() {
    attrs = {id: 'id', foo: 1, bar: 2, baz: 3};
    a = new Backbone.Model(attrs);
    var changeCount = 0;
    a.on("change:foo", function() { changeCount += 1; });
    a.set({'foo': 2});
    assert.ok(a.get('foo') == 2, "Foo should have changed.");
    assert.ok(changeCount == 1, "Change count should have incremented.");
    a.set({'foo': 2}); // set with value that is not new shouldn't fire change event
    assert.ok(a.get('foo') == 2, "Foo should NOT have changed, still 2");
    assert.ok(changeCount == 1, "Change count should NOT have incremented.");

    a.validate = function(attrs) {
      assert.equal(attrs.foo, void 0, 'ignore values when unsetting');
    };
    a.unset('foo');
    assert.ok(a.get('foo') == null, "Foo should have changed");
    delete a.validate;
    assert.ok(changeCount == 2, "Change count should have incremented for unset.");

    a.unset('id');
    assert.equal(a.id, undefined, "Unsetting the id should remove the id property.");
  });

  test("Model: multiple unsets", function() {
    var i = 0;
    var counter = function(){ i++; };
    var model = new Backbone.Model({a: 1});
    model.on("change:a", counter);
    model.set({a: 2});
    model.unset('a');
    model.unset('a');
    assert.equal(i, 2, 'Unset does not fire an event for missing attributes.');
  });

  test("Model: unset and changedAttributes", function() {
    var model = new Backbone.Model({a: 1});
    model.unset('a', {silent: true});
    var changedAttributes = model.changedAttributes();
    assert.ok('a' in changedAttributes, 'changedAttributes should contain unset properties');

    changedAttributes = model.changedAttributes();
    assert.ok('a' in changedAttributes, 'changedAttributes should contain unset properties when running changedAttributes again after an unset.');
  });

  test("Model: using a non-default id attribute.", function() {
    var MongoModel = Backbone.Model.extend({idAttribute : '_id'});
    var model = new MongoModel({id: 'eye-dee', _id: 25, title: 'Model'});
    assert.equal(model.get('id'), 'eye-dee');
    assert.equal(model.id, 25);
    assert.equal(model.isNew(), false);
    model.unset('_id');
    assert.equal(model.id, undefined);
    assert.equal(model.isNew(), true);
  });

  test("Model: set an empty string", function() {
    var model = new Backbone.Model({name : "Model"});
    model.set({name : ''});
    assert.equal(model.get('name'), '');
  });

  test("Model: clear", function() {
    var changed;
    var model = new Backbone.Model({id: 1, name : "Model"});
    model.on("change:name", function(){ changed = true; });
    model.on("change", function() {
      var changedAttrs = model.changedAttributes();
      assert.ok('name' in changedAttrs);
    });
    model.clear();
    assert.equal(changed, true);
    assert.equal(model.get('name'), undefined);
  });

  test("Model: defaults", function() {
    var Defaulted = Backbone.Model.extend({
      defaults: {
        "one": 1,
        "two": 2
      }
    });
    var model = new Defaulted({two: null});
    assert.equal(model.get('one'), 1);
    assert.equal(model.get('two'), null);
    Defaulted = Backbone.Model.extend({
      defaults: function() {
        return {
          "one": 3,
          "two": 4
        };
      }
    });
    var model = new Defaulted({two: null});
    assert.equal(model.get('one'), 3);
    assert.equal(model.get('two'), null);
  });

  test("Model: change, hasChanged, changedAttributes, previous, previousAttributes", function() {
    var model = new Backbone.Model({name : "Tim", age : 10});
    assert.equal(model.changedAttributes(), false);
    model.on('change', function() {
      assert.ok(model.hasChanged('name'), 'name changed');
      assert.ok(!model.hasChanged('age'), 'age did not');
      assert.ok(_.isEqual(model.changedAttributes(), {name : 'Rob'}), 'changedAttributes returns the changed attrs');
      assert.equal(model.previous('name'), 'Tim');
      assert.ok(_.isEqual(model.previousAttributes(), {name : "Tim", age : 10}), 'previousAttributes is correct');
    });
    model.set({name : 'Rob'}, {silent : true});
    assert.equal(model.hasChanged(), true);
    assert.equal(model.hasChanged('name'), true);
    model.change();
    assert.equal(model.get('name'), 'Rob');
  });

  test("Model: change with options", function() {
    var value;
    var model = new Backbone.Model({name: 'Rob'});
    model.on('change', function(model, options) {
      value = options.prefix + model.get('name');
    });
    model.set({name: 'Bob'}, {silent: true});
    model.change({prefix: 'Mr. '});
    assert.equal(value, 'Mr. Bob');
    model.set({name: 'Sue'}, {prefix: 'Ms. '});
    assert.equal(value, 'Ms. Sue');
  });

  test("Model: change after initialize", function () {
    var changed = 0;
    var attrs = {id: 1, label: 'c'};
    var obj = new Backbone.Model(attrs);
    obj.on('change', function() { changed += 1; });
    obj.set(attrs);
    assert.equal(changed, 0);
  });

  test("Model: save within change event", function () {
    var model = new Backbone.Model({firstName : "Taylor", lastName: "Swift"});
    model.on('change', function () {
      model.save();
      assert.ok(_.isEqual(lastRequest[1], model));
    });
    model.set({lastName: 'Hicks'});
  });

  test("Model: validate after save", function() {
    var lastError, model = new Backbone.Model();
    model.validate = function(attrs) {
      if (attrs.admin) return "Can't change admin status.";
    };
    model.sync = function(method, model, options) {
      options.success.call(this, {admin: true});
    };
    model.save(null, {error: function(model, error) {
      lastError = error;
    }});

    assert.equal(lastError, "Can't change admin status.");
  });

  test("Model: save", function() {
    doc.save({title : "Henry V"});
    assert.equal(lastRequest[0], 'update');
    assert.ok(_.isEqual(lastRequest[1], doc));
  });

  test("Model: fetch", function() {
    doc.fetch();
    assert.ok(lastRequest[0], 'read');
    assert.ok(_.isEqual(lastRequest[1], doc));
  });

  test("Model: destroy", function() {
    doc.destroy();
    assert.equal(lastRequest[0], 'delete');
    assert.ok(_.isEqual(lastRequest[1], doc));
  });

  test("Model: non-persisted destroy", function() {
    attrs = { 'foo': 1, 'bar': 2, 'baz': 3};
    a = new Backbone.Model(attrs);
    a.sync = function() { throw "should not be called"; };
    assert.ok(a.destroy(), "non-persisted model should not call sync");
  });

  test("Model: validate", function() {
    var lastError;
    var model = new Backbone.Model();
    model.validate = function(attrs) {
      if (attrs.admin) return "Can't change admin status.";
    };
    model.on('error', function(model, error) {
      lastError = error;
    });
    var result = model.set({a: 100});
    assert.equal(result, model);
    assert.equal(model.get('a'), 100);
    assert.equal(lastError, undefined);
    result = model.set({admin: true}, {silent: true});
    assert.equal(lastError, undefined);
    assert.equal(model.get('admin'), true);
    result = model.set({a: 200, admin: true});
    assert.equal(result, false);
    assert.equal(model.get('a'), 100);
    assert.equal(lastError, "Can't change admin status.");
  });

  test("Model: validate on unset and clear", function() {
    var error;
    var model = new Backbone.Model({name: "One"});
    model.validate = function(attrs) {
      if ("name" in attrs) {
        if (!attrs.name) {
          error = true;
          return "No thanks.";
        }
      }
    };
    model.set({name: "Two"});
    assert.equal(model.get('name'), 'Two');
    assert.equal(error, undefined);
    model.unset('name');
    assert.equal(error, true);
    assert.equal(model.get('name'), 'Two');
    model.clear();
    assert.equal(model.get('name'), 'Two');
    delete model.validate;
    model.clear();
    assert.equal(model.get('name'), undefined);
  });

  test("Model: validate with error callback", function() {
    var lastError, boundError;
    var model = new Backbone.Model();
    model.validate = function(attrs) {
      if (attrs.admin) return "Can't change admin status.";
    };
    var callback = function(model, error) {
      lastError = error;
    };
    model.on('error', function(model, error) {
      boundError = true;
    });
    var result = model.set({a: 100}, {error: callback});
    assert.equal(result, model);
    assert.equal(model.get('a'), 100);
    assert.equal(lastError, undefined);
    assert.equal(boundError, undefined);
    result = model.set({a: 200, admin: true}, {error: callback});
    assert.equal(result, false);
    assert.equal(model.get('a'), 100);
    assert.equal(lastError, "Can't change admin status.");
    assert.equal(boundError, undefined);
  });

  test("Model: defaults always extend attrs (#459)", function() {
    var Defaulted = Backbone.Model.extend({
      defaults: {one: 1},
      initialize : function(attrs, opts) {
        assert.equal(this.attributes.one, 1);
      }
    });
    var providedattrs = new Defaulted({});
    var emptyattrs = new Defaulted();
  });

  test("Model: Inherit class properties", function() {
    var Parent = Backbone.Model.extend({
      instancePropSame: function() {},
      instancePropDiff: function() {}
    }, {
      classProp: function() {}
    });
    var Child = Parent.extend({
      instancePropDiff: function() {}
    });

    var adult = new Parent;
    var kid   = new Child;

    assert.equal(Child.classProp, Parent.classProp);
    assert.unEqual(Child.classProp, undefined);

    assert.equal(kid.instancePropSame, adult.instancePropSame);
    assert.unEqual(kid.instancePropSame, undefined);

    assert.unEqual(Child.prototype.instancePropDiff, Parent.prototype.instancePropDiff);
    assert.unEqual(Child.prototype.instancePropDiff, undefined);
  });

  test("Model: Nested change events don't clobber previous attributes", function() {
    var A = Backbone.Model.extend({
      initialize: function() {
        this.on("change:state", function(a, newState) {
          assert.equal(a.previous('state'), undefined);
          assert.equal(newState, 'hello');
          // Fire a nested change event.
          this.set({ other: "whatever" });
        });
      }
    });

    var B = Backbone.Model.extend({
      initialize: function() {
        this.get("a").on("change:state", function(a, newState) {
          assert.equal(a.previous('state'), undefined);
          assert.equal(newState, 'hello');
        });
      }
    });

    a = new A();
    b = new B({a: a});
    a.set({state: 'hello'});
  });

  test("Model: Multiple nested calls to set", function() {
    var counter = 0, model = new Backbone.Model({});
    model.on('change', function() {
      counter++;
      model.set({b: 1});
      model.set({a: 1});
    })
    .set({a: 1});
    assert.equal(counter, 1, 'change is only triggered once');
  });

  test("hasChanged/set should use same comparison", function() {
    var changed = 0, model = new Backbone.Model({a: null});
    model.on('change', function() {
      assert.ok(this.hasChanged('a'));
    })
    .on('change:a', function() {
      changed++;
    })
    .set({a: undefined});
    assert.equal(changed, 1);
  });

  test("#582, #425, change:attribute callbacks should fire after all changes have occurred", function() {
    var model = new Backbone.Model;

    var assertion = function() {
      assert.equal(model.get('a'), 'a');
      assert.equal(model.get('b'), 'b');
      assert.equal(model.get('c'), 'c');
    };

    model.on('change:a', assertion);
    model.on('change:b', assertion);
    model.on('change:c', assertion);

    model.set({a: 'a', b: 'b', c: 'c'});
  });
});
