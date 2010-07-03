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
    ok((new B()).color === 'red');
    ok((new B()).count === 10);
    ok((new B()).game === 'Super Mario');
});

test('B prototype should inherit all A methods', function () {
    function A () {}
    A.extend({ getColor: function () { return 'red'; } });

    function B () {};
    B.inherits(A);

    ok((new B()).getColor() === 'red');
});
