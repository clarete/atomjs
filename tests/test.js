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

test('Content objects should have a type attr defined', function () {
    var ct = new atom.Content();
    try {
        ct.toString();
        ok(false, 'Not reached');
    } catch (e) {
        ok(true, 'type param is required');
    }
});

test('Content objects should not fill both src and content attrs', function () {
    var ct = new atom.Content('text/plain');
    ct.setSrc('http://gnu.org');
    ct.setContent('Blah');

    try {
        ct.toString();
        ok(false, 'Not reached');
    } catch (e) {
        ok(true, 'both src and content attrs cannot be filled');
    }
});

test('It should be possible to describe a person with name, email and an uri',
function () {
    var person = new atom.Person('Lincoln');
    equals(person.toString(), '<author><name>Lincoln</name></author>');

    person.setEmail('lincoln@comum.org');
    equals(person.toString(), '<author><name>Lincoln</name>' +
           '<email>lincoln@comum.org</email></author>');

    person.setUri('http://comum.org');
    equals(person.toString(), '<author><name>Lincoln</name>' +
           '<email>lincoln@comum.org</email>' +
           '<uri>http://comum.org</uri>' +
           '</author>');
});

test('It should be possible to describe categories with term, label and ' +
'schme attrs', function () {
    var cat = new atom.Category();
    try {
        cat.toString();
        ok(false, 'Not reached');
    } catch (e) {
        ok(true, "The `term' attribute is required");
    }

    cat.setTerm('myterm');
    equals(cat.toString(), '<category term="myterm"></category>');

    cat.setLabel('My Label');
    equals(cat.toString(), '<category term="myterm" label="My Label">' +
           '</category>');

    cat.setScheme('http://guake.org');
    equals(cat.toString(), '<category term="myterm" label="My Label" ' +
           'scheme="http://guake.org"></category>');
});
