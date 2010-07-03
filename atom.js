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
    this.extraElements = [];
}

BasicElement.prototype = {
    _getElement: function () {
        throw new Error('BasicElement._getElement: This method should ' +
                        'be overrided;')
    },

    append: function (element) {
        this.extraElements.push(element);
    },

    toXML: function () {
        var element = this._getElement();
        for (var i = 0; i < this.extraElements.length; i++)
            element.appendChild(this.extraElements[i]._getElement());
        return element;
    },

    toString: function () {
        return this.toXML().outerHTML;
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

    Person: function (name, email, iri) {
        this.tagName = 'author';
        this.name = name;
        this.email = email;
        this.iri = iri;
    }

};

atom.SimpleElement.inherits(BasicElement);
atom.SimpleElement.extend({
    /* Element Creation */
    _getElement: function () {
        var element = document.createElement(this.name);
        var elementValue = document.createTextNode(this.value);
        element.appendChild(elementValue);
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
            throw new Error("Content._getElement: `content' and `src' should " +
                            "not be set");
        else if (!isValidString(this.src) && !isValidString(this.content))
            throw new Error("Content._getElement: `content' OR `src' should" +
                            "be set");

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
    getIri: function () { return this.iri; },
    setIri: function (iri) { this.iri = iri; },

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

        if (isValidString(this.iri)) {
            var iri = document.creannteElement('iri')
            iri.appendChild(document.createTextNode(this.iri));
            element.appendChild(iri);
        }

        return element;
    }
});
