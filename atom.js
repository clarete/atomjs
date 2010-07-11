/* atom.js - Implementation of the Atom Syndication Format (RFC 4287)
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

/* Helper functions */
function isValidString(val) {
    return typeof(val) === typeof('') && val !== '';
}

/* Setting up a minimal inheritance infra */
Function.prototype.inherits = function (parent) {
    this.prototype = new parent();
}

Function.prototype.extend = function (obj) {
    for (var i in obj)
        this.prototype[i] = obj[i];
}

/* Base element for all Atom elements */

function BasicElement () {
    this.attrs = [];
    this.extraElements = [];
}

BasicElement.prototype = {
    _getElement: function () {
        throw new Error('BasicElement._getElement: This method should ' +
                        'be overrided;')
    },

    setAttr: function (key, val) {
        this.attrs.push({key: key, val: val});
    },

    getAttr: function (key) {
        for (var i = 0; i < this.attrs.length; i++) {
            if (this.attrs[i].key == key)
                return this.attrs[i].val;
        }
        return null;
    },

    addForeign: function (element) {
        this.extraElements.push(element);
    },

    toXML: function () {
        var element = this._getElement();
        var i, attr, subel;
        for (i = 0; i < this.attrs.length; i++) {
            attr = this.attrs[i];
            element.setAttribute(attr.key, attr.val);
        }

        for (i = 0; i < this.extraElements.length; i++) {
            subel = this.extraElements[i];
            if (subel != null) {
                element.appendChild(subel._getElement());
            }
        }
        return element;
    },

    toString: function () {
        var node = this.toXML();

        /* Not using XMLSerializer because Firefox uppercases all node
         * names and it breaks our tests. I used to complain about IE,
         * not about FF :(
         */
        var container = document.createElement('container');
        container.appendChild(node.cloneNode(true));
        return container.innerHTML;
    }
};


/* Public objects in the `atom' namespace */

var atom = {
    SimpleElement: function (name, value) {
        this.name = name;
        this.value = value;
    },

    Link: function (href) {
        this.href = href;
        this.title = null;
        this.rel = null;
    },

    Content: function (type) {
        this.type = type;
        this.src = null;
        this.content = null;
    },

    Person: function (name, email, uri) {
        this.tagName = 'author';
        this.name = name;
        this.email = email;
        this.uri = uri;
    },

    Category: function (term, label, scheme) {
        this.term = term;
        this.label = label;
        this.scheme = scheme;
    },

    Entry: function (title) {
        this.title = title;
        this.id = null;
        this.updated = new Date();
        this.published = null;
        this.authors = [];
        this.categories = [];
        this.links = [];
        this.summary = null;
        this.rights = null;
        this.content = null;
    },

    parseEntry: doParseEntry

};

atom.SimpleElement.inherits(BasicElement);
atom.SimpleElement.extend({
    /* Element Creation */
    _getElement: function () {
        var element = document.createElement(this.name);
        if (this.value) {
            var elementValue = document.createTextNode(this.value);
            element.appendChild(elementValue);
        }
        return element;
    }
});

atom.Link.inherits(BasicElement);
atom.Link.extend({
    /* getters and setters */
    getHref: function () { return this.href; },
    setHref: function (href) { this.href = href; },
    getTitle: function () { return this.title; },
    setTitle: function (title) { this.title = title; },
    getRel: function () { return this.rel; },
    setRel: function (rel) { this.rel = rel; },

    /* Element Creation */
    _getElement: function () {
        var element = document.createElement('link');
        if (!isValidString(this.href))
            throw new Error("Link._getElement: `href' attribute is not set");
        element.setAttribute('href', this.href);
        if (isValidString(this.title))
            element.setAttribute('title', this.title);
        if (isValidString(this.rel))
            element.setAttribute('rel', this.rel);
        return element;
    }
});

atom.Content.inherits(BasicElement);
atom.Content.extend({
    /* getters and setters */
    getType: function () { return this.type; },
    setType: function (type) { this.type = type; },
    getSrc: function () { return this.src; },
    setSrc: function (src) { this.src = src; },
    getContent: function () { return this.content; },
    setContent: function (content) { this.content = content; },

    /* Element Creation */
    _getElement: function () {
        var element = document.createElement('content');

        if (!isValidString(this.type))
            throw new Error("Content._getElement: `type' attr is not set");
        element.setAttribute('type', this.type);

        if (isValidString(this.src) && isValidString(this.content))
            throw new Error("Content._getElement: `content' and `src' " +
                            "should not be set");
        else if (!isValidString(this.src) && !isValidString(this.content))
            throw new Error("Content._getElement: `content' OR `src' " +
                            "should be set");

        if (isValidString(this.src))
            element.setAttribute('src', this.src);
        else {
            var content = document.createTextNode(this.content);
            element.appendChild(content);
        }
        return element;
    }
});

atom.Person.inherits(BasicElement);
atom.Person.extend({
    /* getters and setters */
    getTagName: function () { return this.tagName; },
    setTagName: function (tagName) { this.tagName = tagName; },
    getName: function () { return this.name; },
    setName: function (name) { this.name = name; },
    getEmail: function () { return this.email; },
    setEmail: function (email) { this.email = email; },
    getUri: function () { return this.uri; },
    setUri: function (uri) { this.uri = uri; },

    /* Element Creation */
    _getElement: function () {
        var element = document.createElement(this.tagName);
        if (!isValidString(this.name)) {
            throw new Error("Person._getElement: `name' attr is not set");
        } else {
            var name = document.createElement('name')
            name.appendChild(document.createTextNode(this.name));
            element.appendChild(name);
        }

        if (isValidString(this.email)) {
            var email = document.createElement('email')
            email.appendChild(document.createTextNode(this.email));
            element.appendChild(email);
        }

        if (isValidString(this.uri)) {
            var uri = document.createElement('uri')
            uri.appendChild(document.createTextNode(this.uri));
            element.appendChild(uri);
        }

        return element;
    }
});

atom.Category.inherits(BasicElement);
atom.Category.extend({
    /* getters and setters */
    getTerm: function () { return this.term; },
    setTerm: function (term) { this.term = term; },
    getLabel: function () { return this.label; },
    setLabel: function (label) { this.label = label; },
    getScheme: function () { return this.scheme; },
    setScheme: function (scheme) { this.scheme = scheme; },

    /* Element Creation */
    _getElement: function () {
        var element = document.createElement('category');
        if (!isValidString(this.term))
            throw new Error("Category._getElement: `term' attr not set");
        element.setAttribute('term', this.term);
        if (isValidString(this.label))
            element.setAttribute('label', this.label);
        if (isValidString(this.scheme))
            element.setAttribute('scheme', this.scheme);
        return element;
    }
});

atom.Entry.inherits(BasicElement);
atom.Entry.extend({
    /* getters and setters */
    getTitle: function () { return this.title; },
    setTitle: function (title) { this.title = title; },
    getId: function () { return this.id; },
    setId: function (id) { this.id = id; },
    getUpdated: function () { return this.updated; },
    setUpdated: function (updated) { this.updated = updated; },
    getPublished: function () { return this.published; },
    setPublished: function (published) { this.published = published; },
    getSummary: function () { return this.summary; },
    setSummary: function (summary) { this.summary = summary; },
    getRights: function () { return this.rights; },
    setRights: function (rights) { this.rights = rights; },
    getContent: function () { return this.content; },
    setContent: function (content) { this.content = content; },

    /* List getters */
    getAuthors: function () { return this.authors; },
    getCategories: function () { return this.categories; },
    getLinks: function () { return this.links; },

    /* Methods to control lists of sub-elements */
    addAuthor: function (author) {
        if (author instanceof atom.Person)
            this.authors.push(author);
        else
            throw new Error('Waiting for an atom.Person object');
    },

    addCategory: function (category) {
        if (category instanceof atom.Category)
            this.categories.push(category);
        else
            throw new Error('Waiting for an atom.Category object');
    },

    addLink: function (link) {
        if (link instanceof atom.Link)
            this.links.push(link);
        else
            throw new Error('Waiting for an atom.Link object');
    },

    /* Element Creation */
    _getElement: function () {
        var element = document.createElement('entry');
        var i = 0;

        if (isValidString(this.title)) {
            var title = document.createElement('title')
            title.appendChild(document.createTextNode(this.title));
            element.appendChild(title);
        }

        if (isValidString(this.id)) {
            var id = document.createElement('id')
            id.appendChild(document.createTextNode(this.id));
            element.appendChild(id);
        }

        if (this.updated instanceof Date) {
            var date = this.updated.toISOString();
            var updated = document.createElement('updated')
            updated.appendChild(document.createTextNode(date));
            element.appendChild(updated);
        }

        if (this.published instanceof Date) {
            var date = this.published.toISOString();
            var published = document.createElement('published')
            published.appendChild(document.createTextNode(date));
            element.appendChild(published);
        }

        if (isValidString(this.rights)) {
            var rights = document.createElement('rights');
            rights.appendChild(document.createTextNode(this.rights));
            element.appendChild(rights);
        }

        if (isValidString(this.summary)) {
            var summary = document.createElement('summary')
            summary.appendChild(document.createTextNode(this.summary));
            element.appendChild(summary);
        }

        /* Adding lists */
        for (i = 0; i < this.authors.length; i++)
            element.appendChild(this.authors[i]._getElement());
        for (i = 0; i < this.categories.length; i++)
            element.appendChild(this.categories[i]._getElement());
        for (i = 0; i < this.links.length; i++)
            element.appendChild(this.links[i]._getElement());

        /* Finally adding the content */
        if (this.content)
            element.appendChild(this.content._getElement());

        return element;
    }
});

function parseIsoDate (date) {
    var cleaned = date
        .replace(/-/g, '\/')
        .replace(/[TZ]/g, ' ')
        .replace(/\s+$/, '');
    return new Date(cleaned);
}

function doParseEntry (xml) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(xml, "text/xml");
    var entry, i;

    /* Some sanity checks */
    if (!doc)
        throw new Error('Unable to parse document');
    if (doc.documentElement.tagName !== 'entry')
        throw new Error('Main element of xml is not an entry');

    /* The entry object itself! */
    entry = new atom.Entry();

    var childs = doc.documentElement.childNodes;
    for (i = 0; i < childs.length; i++) {
        var child = childs[i];
        switch (child.tagName) {
        case 'id':
            entry.setId(child.firstChild.nodeValue);
            break;

        case 'title':
            entry.setTitle(child.firstChild.nodeValue);
            break;

        case 'updated':
            entry.setUpdated(parseIsoDate(child.firstChild.nodeValue));
            break;

        case 'published':
            entry.setPublished(parseIsoDate(child.firstChild.nodeValue));
            break;

        case 'summary':
            entry.setSummary(child.firstChild.nodeValue);
            break;

        case 'rights':
            entry.setRights(child.firstChild.nodeValue);
            break;

        case 'author':
            var author = new atom.Person();
            var name = child.querySelector('name');
            if (name && name.firstChild)
                author.setName(name.firstChild.nodeValue);

            var email = child.querySelector('email');
            if (email && email.firstChild)
                author.setEmail(email.firstChild.nodeValue);

            var uri = child.querySelector('uri');
            if (uri && uri.firstChild)
                author.setUri(uri.firstChild.nodeValue);

            entry.addAuthor(author);
            break;

        case 'category':
            var category = new atom.Category();
            category.setTerm(child.getAttribute('term'));
            category.setLabel(child.getAttribute('label'));
            category.setScheme(child.getAttribute('scheme'));
            entry.addCategory(category);
            break;

        case 'link':
            var link = new atom.Link();
            link.setHref(child.getAttribute('href'));
            link.setTitle(child.getAttribute('title'));
            link.setRel(child.getAttribute('rel'))
            entry.addLink(link);
            break;

        case 'content':
            var content = new atom.Content(child.getAttribute('type'));
            content.setSrc(child.getAttribute('src'));
            if (!content.getSrc()) {
                var container = document.createElement('container');
                container.appendChild(child.cloneNode(true));
                content.setContent(container.innerHTML);
            }
            entry.setContent(content);
            break;
        }
    }

    return entry;
}
