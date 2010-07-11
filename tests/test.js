/* tests.js - Unit tests for the atomjs library
 *
 * Copyright (C) 2010  Lincoln de Sousa <lincoln@comum.org>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
    selement.addForeign(new atom.SimpleElement('sub', 'subv'));
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

test('It should be possible to set a text with the rights ' +
'of the entry', function () {
    var entry = new atom.Entry('My Post');
    entry.setRights('Copyright (c) 2010  Lincoln de Sousa');
    equals(entry.getRights(), 'Copyright (c) 2010  Lincoln de Sousa',
          'Rights field value');

    var generated = '<rights>Copyright (c) 2010  Lincoln de Sousa</rights>';
    ok(entry.toString().indexOf(generated) != -1,
       'Entry has the rights field');
});

test('It should be possible to load an atom entry to our objects ' +
'structure', function () {
    var entry, author;
    var xml = '<entry xmlns="http://www.w3.org/2005/Atom">' +
        '<link href="http://cascardo.info/atom/1.atom" rel="self"/>' +
        '<id>http://cascardo.info/atom/1.atom</id>' +
        '<title>Real Soon Now</title>' +
        '<category term="oi" />' +
        '<category term="blah" label="Blah" />' +
        '<category term="test" label="Test" scheme="http://gnu.org" />' +
        '<updated>2009-01-06T20:57:53Z</updated>' +
        '<published>2009-01-06T21:00:50Z</published>' +
        '<summary>Loren ipsum</summary>' +
        '<author><name>Thadeu Lima de Souza Cascardo</name></author>' +
        '<content type="xhtml">' +
        ' <div xmlns="http://www.w3.org/1999/xhtml">' +
        '  <h1>Something should be up here real soon now!</h1>' +
        ' </div>' +
        '</content>' +
        '</entry>';

    try {
        entry = atom.parseEntry('test');
        ok(false, 'Not reached');
    } catch (e) {
        ok(true, 'invalid xml is not accepted when loading an entry');
    }

    try {
        entry = atom.parseEntry('<root><title>test</title></root>');
        ok(false, 'Not reached');
    } catch (e) {
        ok(true, 'The <entry/> element should be the root of an xml parsed');
    }

    entry = atom.parseEntry(xml);
    ok(entry instanceof atom.Entry, "returned element is an entry");
    equals(entry.getId(), 'http://cascardo.info/atom/1.atom', 'Entry id');
    equals(entry.getTitle(), 'Real Soon Now', 'Entry title');
    ok(entry.getUpdated() instanceof Date, 'updated attr is a Date instance');
    same(entry.getUpdated(), new Date(2009, 0, 6, 20, 57, 53), 'Updated date');
    same(entry.getPublished(), new Date(2009, 0, 6, 21, 00, 50), 'Published date');
    equals(entry.getSummary(), 'Loren ipsum', 'Entry summary');
    equals(entry.getAuthors().length, 1, 'Number of authors');

    author = entry.getAuthors()[0];
    equal(author.getName(), 'Thadeu Lima de Souza Cascardo', 'Author`s name');
    equal(author.getEmail(), null, 'Author`s email addr');

    var categories = entry.getCategories();
    equals(categories.length, 3, 'Number of categories');
    equals(categories[0].getTerm(), 'oi', 'Term of the first category');
    equals(categories[1].getLabel(), 'Blah', 'Label of the second cat');
    equals(categories[2].getScheme(), 'http://gnu.org', '3rd cat scheme');

    var links = entry.getLinks();
    equals(links.length, 1, 'Number of links');
    equals(links[0].getHref(), 'http://cascardo.info/atom/1.atom',
           'Link href attribute');
    equals(links[0].getRel(), 'self', 'Link rel attribute');
    equals(links[0].getTitle(), null, 'No title in this link');

    var content = entry.getContent();
    equals(content.getType(), 'xhtml', 'The entry contains an xhtml content');
    ok(content.getContent().indexOf('real soon now') > -1,
       "Part of the entry's content");
});

test('atomjs should find the rights element when parsing an entry',
function () {
    var xml =
        '<entry xmlns="http://www.w3.org/2005/Atom">' +
        '  <id>http://test.com/feed/1.atom</id>' +
        '  <title>Test entry</title>' +
        '  <updated>2010-07-11T02:50:50Z</updated>' +
        '  <summary>Loren ipsum</summary>' +
        '  <rights>Copyright (c) 2010  Lincoln de Sousa</rights>' +
        '  <author><name>Lincoln de Sousa</name></author>' +
        '  <content type="text">' +
        '    End of the world cup #calabocagalvao' +
        '  </content>' +
        '</entry>';
    var entry = atom.parseEntry(xml);
    equals(entry.getRights(), 'Copyright (c) 2010  Lincoln de Sousa',
           'The <rights/> field value')
});

test('it should be possible to set arbitrary attributes in all of its ' +
'elements', function () {
    var entry = new atom.Entry('Test Post');
    entry.setAttr('xmlns:cc', 'http://creativecommons.org/ns#');
    equals(entry.getAttr('xmlns:cc'), 'http://creativecommons.org/ns#',
           'The xml:cc attr value');

    var wantedAttr = 'xmlns:cc="http://creativecommons.org/ns#"';
    ok(entry.toString().indexOf(wantedAttr) != -1,
       'Attr appears when calling toString');
});

test('it should be possible to add foreign elements in all of its ' +
'elements', function () {
    var license = new atom.SimpleElement('license');
    var requires = new atom.SimpleElement('requires');

    license.addForeign(requires);
    equals(license.toString(), '<license><requires>' +
           '</requires></license>',
           'Generated code has License and require elements');
});
