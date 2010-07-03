module('atom');

/* Inheritance tests */
test('B prototype should inherit all A attributes', function () {
    function A () {
        this.color = 'red';
        this.count = 10;
    }

    A.prototype.game = 'Super Mario';

    function B () { }

    B.inherits(A);
    equals((new B()).color, 'red');
    equals((new B()).count, 10);
    equals((new B()).game, 'Super Mario');
});

test('B prototype should inherit all A methods', function () {
    function A () {}
    A.extend({ getColor: function () { return 'red'; } });

    function B () {};
    B.inherits(A);

    equals((new B()).getColor(), 'red');
});

test('It should be possible to create simple key/val elements', function () {
    var selement = new atom.SimpleElement('key', 'val');
    equals(selement.toString(), '<key>val</key>');
});

test('It should be possible to extend simple elements', function () {
    var selement = new atom.SimpleElement('k', 'v');
    equals(selement.toString(), '<k>v</k>');
    selement.append(new atom.SimpleElement('sub', 'subv'));
    equals(selement.toString(), '<k>v<sub>subv</sub></k>');
});

test('Link objects can have href, title and rel attrs', function () {
    var link = new atom.Link();
    try {
        link.toString();
        ok(false, "should not be reached");
    } catch (e) {
        ok(true, "href attr is required");
    }

    link.setHref('http://gnome.org');

    equal(link.toString(), '<link href="http://gnome.org">');

    link.setTitle('Link Title');
    equal(link.toString(), '<link href="http://gnome.org" ' +
          'title="Link Title">');

    link.setRel('alternate');
    equal(link.toString(), '<link href="http://gnome.org" ' +
          'title="Link Title" rel="alternate">');
});
