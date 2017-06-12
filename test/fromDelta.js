'use strict';

var delta = require('../');
var test = require('tape');
var iconv = require('iconv-lite');

test('fromDelta()', function (t) {
    t.test('renders inline format', function (st) {
        st.deepEqual(delta.fromDelta([
            {
                "insert": "Hi "
            },
            {
                "attributes": {
                    "bold": true
                },
                "insert": "mom"
            }
        ]), "Hi **mom**\n");
        st.end();
    });

    t.test('renders embed format', function (st) {
        st.deepEqual(delta.fromDelta([
            {
                "insert": "LOOK AT THE KITTEN!\n"
            },
            {
                "insert": {
                    "image": "https://placekitten.com/g/200/300"
                },
            }]), "LOOK AT THE KITTEN!\n![](https://placekitten.com/g/200/300)\n");
        st.end();
    });

    t.test('renders block format', function (st) {
        st.equal(delta.fromDelta([
            {
                "insert": "Headline"
            },
            {
                "attributes": {
                    "header": 1
                },
                "insert": "\n"
            }]),'# Headline\n');

        st.end();
    });

    t.test('renders lists with inline formats correctly', function(st) {
        st.equal(delta.fromDelta([
            {
                "attributes": {
                    "italic": true
                },
                "insert": "Glenn v. Brumby"
            },
            {
                "insert": ", 663 F.3d 1312 (11th Cir. 2011)"
            },
            {
                "attributes": {
                    "list": 'ordered'
                },
                "insert": "\n"
            },
            {
                "attributes": {
                    "italic": true
                },
                "insert": "Barnes v. City of Cincinnati"
            },
            {
                "insert": ", 401 F.3d 729 (6th Cir. 2005)"
            },
            {
                "attributes": {
                    "list": 'ordered'
                },
                "insert": "\n"
            }]),'1. *Glenn v. Brumby*, 663 F.3d 1312 (11th Cir. 2011)\n2. *Barnes v. City of Cincinnati*, 401 F.3d 729 (6th Cir. 2005)\n');

        st.end();

    });


    t.test('renders adjacent lists correctly', function(st) {
        st.equal(delta.fromDelta([
            {
                "insert": "Item 1"
            },
            {
                "insert": "\n",
                "attributes": {
                    "list": 'ordered'
                }
            },
            {
                "insert": "Item 2"
            },
            {
                "insert": "\n",
                "attributes": {
                    "list": 'ordered'
                }
            },
            {
                "insert": "Item 3"
            },
            {
                "insert": "\n",
                "attributes": {
                    "list": 'ordered'
                }
            },
            {
                "insert": "Intervening paragraph\nItem 4"
            },
            {
                "insert": "\n",
                "attributes": {
                    "list": 'ordered'
                }
            },
            {
                "insert": "Item 5"
            },
            {
                "insert": "\n",
                "attributes": {
                    "list": 'ordered'
                }
            },
            {
                "insert": "Item 6"
            },
            {
                "insert": "\n",
                "attributes": {
                    "list": 'ordered'
                }
            }]),'1. Item 1\n2. Item 2\n3. Item 3\nIntervening paragraph\n1. Item 4\n2. Item 5\n3. Item 6\n');

        st.end();

    });

    t.test('renders adjacent inline formats correctly', function(st) {
        st.equal(delta.fromDelta([
            {
                "attributes" : {
                    "italic" : true
                },
                "insert" : "Italics! "
            },
            {
                "attributes": {
                    "italic": true,
                    "link": "http://example.com"
                },
                "insert": "Italic link"
            },
            {
                "attributes": {
                    "link": "http://example.com"
                },
                "insert": " regular link"
            }]),'*Italics!* *[Italic link](http://example.com)*[ regular link](http://example.com)\n');

        st.end();
    });


    t.test('handles embed inserts with inline styles', function(st) {
        st.equal(delta.fromDelta([
            {
                "insert": {
                    "image": "https://placekitten.com/g/200/300",
                },
                "attributes": {
                    "link": "http://example.com"
                },
            }
        ]),'[![](https://placekitten.com/g/200/300)](http://example.com)\n');
        st.end();
    });

    t.end();

});