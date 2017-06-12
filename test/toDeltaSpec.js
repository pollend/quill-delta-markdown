'use strict';

var delta = require('../');
var test = require('tape');
var iconv = require('iconv-lite');


test('toDelta Spec', function (t) {
    t.test('converts text with emphasis', function (st) {
        st.deepEqual(delta.toDelta('Hello *world*'),
            [{insert: 'Hello '}, {insert: 'world', attributes: {"italic": true}}, {insert: "\n"}]);

        st.end();
    });

    t.test('converts text with strong', function (st) {
        st.deepEqual(delta.toDelta('Hello **world**'),
            [{insert: 'Hello '}, {insert: 'world', attributes: {"bold": true}}, {insert: "\n"}]);

        st.end();
    });

    t.test('converts text with link', function (st) {
        st.deepEqual(delta.toDelta('Hello [world](url)'),
            [{insert: 'Hello '}, {insert: 'world', attributes: {"link": 'url'}}, {insert: "\n"}]);

        st.end();
    });

    t.test('converts text with image', function (st) {
        st.deepEqual(delta.toDelta('Hello ![world](url)'),
            [{insert: 'Hello '}, {insert: {"image": 'url'}, attributes: {alt: 'world'}}, {insert: "\n"}]);

        st.end();
    });

    t.test('converts text with image with title', function (st) {
        st.deepEqual(delta.toDelta('Hello ![world](url "title")'),
            [{insert: 'Hello '}, {
                insert: {"image": 'url'},
                attributes: {alt: 'world', title: 'title'}
            }, {insert: "\n"}]);

        st.end();
    });

    t.test('converts multi paragraphs', function (st) {
        st.deepEqual(delta.toDelta("line 1\n\nline 2\n"),
            [{insert: 'line 1'}, {insert: "\n"}, {insert: 'line 2'}, {insert: "\n"}]);

        st.end();
    });

    t.test('converts headings level 1', function (st) {
        st.deepEqual(delta.toDelta("# heading\n"),
            [{insert: 'heading'}, {insert: "\n", attributes: {header: 1}}]);

        st.end();
    });

    t.test('converts bullet list', function (st) {
        st.deepEqual(delta.toDelta("- line 1\n- line 2\n"),
            [
                {insert: 'line 1'}, {insert: "\n", attributes: {list: 'bullet'}},
                {insert: 'line 2'}, {insert: "\n", attributes: {list: 'bullet'}}
            ]);

        st.end();
    });


    t.test('converts bullet list with softbreak', function (st) {
        st.deepEqual(delta.toDelta("- line 1\nmore\n- line 2\n"),
            [
                {insert: 'line 1'}, {insert: ' '}, {insert: 'more'}, {insert: "\n", attributes: {list: 'bullet'}},
                {insert: 'line 2'}, {insert: "\n", attributes: {list: 'bullet'}}
            ]);

        st.end();
    });

    t.test('converts ordered list', function (st) {
        st.deepEqual(delta.toDelta("1. line 1\n2. line 2\n"),
            [
                {insert: 'line 1'}, {insert: "\n", attributes: {list: 'ordered'}},
                {insert: 'line 2'}, {insert: "\n", attributes: {list: 'ordered'}}
            ]);

        st.end();
    });

    t.test('converts text with inline code block', function (st) {
        st.deepEqual(delta.toDelta("start `code` more\n"),
            [
                {"insert": "start "},
                {
                    "attributes": {"code": true},
                    "insert": "code"
                },
                {"insert": " more"},
                {"insert": "\n"}
            ]);

        st.end();
    });

    t.test('converts text with html', function (st) {
        st.deepEqual(delta.toDelta("start <html> more\n"),
            [
                {"insert": "start "},
                {
                    "attributes": {"html_inline": true},
                    "insert": "<html>"
                },
                {"insert": " more"},
                {"insert": "\n"}
            ]);

        st.end();
    });


    t.end()
})