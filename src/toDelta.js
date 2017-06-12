import commonmark from 'commonmark';

const _changeAttribute = (attributes, event, attribute, value) =>
{
    if (event.entering) {
        attributes[attribute] = value;
    } else {
        delete attributes['attribute'];
    }
    return attributes;
}

const _applyAttribute = (node, event, attributes, attribute) =>
{
    if (typeof attribute === 'string') {
        _changeAttribute(attributes, event, attribute, true);
    } else if (typeof attribute === 'function') {
        attribute(node, event, attributes);
    }
}

const _addOnEnter = (name) => {
    return (event, attributes) => {
        if (!event.entering) {
            return null;
        }
        return { insert: event.node.literal, attributes: {...attributes, [name]: true}};
    };
}

const _isEmpty = (obj) => {
    for(let prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

const _converters = [
// inline
    { filter: 'code', makeDelta: _addOnEnter('code')},
    { filter: 'html_inline', makeDelta: _addOnEnter('html_inline')},
// TODO: underline
// TODO: strike
    { filter: 'emph', attribute: 'italic' },
    { filter: 'strong', attribute: 'bold' },
// TODO: script
    { filter: 'link', attribute: (node, event, attributes) => {
        _changeAttribute(attributes, event, 'link', node.destination);
    }},
    { filter: 'text', makeDelta: (event, attributes) => {
        if (_isEmpty(attributes)) {
            return {insert: event.node.literal};
        } else {
            return {insert: event.node.literal, attributes: {...attributes}};
        }
    }},
    { filter: 'softbreak', makeDelta: (event, attributes) => {
        if (_isEmpty(attributes)) {
            return {insert: ' '};
        } else {
            return {insert: ' ', attributes: {...attributes}};
        }
    }},

// block
    { filter: 'block_quote', lineAttribute: true, attribute: 'blockquote' },
    { filter: 'code_block', lineAttribute: true, makeDelta: _addOnEnter('code-block') },
    { filter: 'heading', lineAttribute: true, makeDelta: (event, attributes) => {
        if (event.entering) {
            return null;
        }
        return { insert: "\n", attributes: {...attributes, header: event.node.level}};
    }},
    { filter: 'list', lineAttribute: true, attribute: (node, event, attributes) => {
        _changeAttribute(attributes, event, 'list', node.listType);
    }},
    { filter: 'paragraph', lineAttribute: true, makeDelta: (event, attributes) => {
        if (event.entering) {
            return null;
        }

        if (_isEmpty(attributes)) {
            return { insert: "\n"};
        } else {
            return { insert: "\n", attributes: {...attributes}};
        }
    }},

// embeds
    { filter: 'image', attribute: (node, event, attributes) => {
        _changeAttribute(attributes, event, 'image', node.destination);
        if (node.title) {
            _changeAttribute(attributes, event, 'title', node.title);
        }
    }},

];


export default function(markdown) {
    const commentMark = new commonmark.Parser()

    let parsed = commentMark.parse(markdown);
    let walker = parsed.walker();
    let event, node;
    let deltas = [];
    let attributes = {};
    let lineAttributes = {};

    while ((event = walker.next())) {
        node = event.node;
        for (let i = 0; i < _converters.length; i++) {
            const converter = _converters[i];
            if (node.type === converter.filter) {
                if (converter.lineAttribute) {
                    _applyAttribute(node, event, lineAttributes, converter.attribute);
                } else {
                    _applyAttribute(node, event, attributes, converter.attribute);
                }
                if (converter.makeDelta) {
                    let delta = converter.makeDelta(event, converter.lineAttribute ? lineAttributes : attributes);
                    if (delta) {
                        deltas.push(delta);
                    }
                }
                break;
            }
        }
    }
    if (deltas.length === 0 || deltas[deltas.length-1].insert.indexOf("\n") === -1) {
        deltas.push({insert: "\n"});
    }

    return deltas;
}

