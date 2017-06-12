'use strict';

var delta = require('../');
var test = require('tape');
var iconv = require('iconv-lite');

test('toDelta', function (t) {
    t.test('converts text with emphasis', function (st) {
        st.deepEqual(delta.toDelta('Hello *world*'),
            [{ insert: 'Hello '}, { insert: 'world', attributes: { "italic": true } }, { insert: "\n" }]);

        st.end();
    });


    t.test('converts text with strong link', function (st) {
        st.deepEqual(delta.toDelta('Hello **[world](url)**'),
            [{ insert: 'Hello '}, { insert: 'world', attributes: { "link": 'url', "bold": true } }, { insert: "\n" }]);
        st.end();
    });

    t.test('converts text block quote', function (st) {
        st.deepEqual(delta.toDelta('> line *1*\n>\n> line 2\n'),
        [
            { insert: 'line '},
            { insert: '1', attributes: { "italic": true } },
            { insert: "\n", attributes: { "blockquote": true } },
            { insert: 'line 2' },
            { insert: "\n", attributes: { "blockquote": true } }
        ]);

        st.end();
    });

    t.test('converts text code block', function (st) {
        st.deepEqual(delta.toDelta("```\nline 1\nline 2\n```\n\n"),
            [{ insert: "line 1\nline 2\n", attributes: { "code-block": true } }]);
        st.end();
    });

    t.end()
})