//move inline op before and after the last character
const _inlineOp = (insert: string,character: string) => {
    let result = insert.trim()
    let start = insert.match(/^([\s]+)/g);
    let end = insert.match(/([\s]+)$/g);
    if(start === null) {
        result = character + result
    } else {
        result = start + character + result
    }
    if(end === null) {
        result =  result + character
    } else {
        result =  result + character + end
    }
    return result
}



const _inline: [] = {
    link: (attr, insert) => {
      return '[' + insert  + '](' + attr.link+ ')'
    },
    italic: (attr, insert) => {
        return _inlineOp(insert,'*')
    },
    bold: (attr, insert) => {
        return _inlineOp(insert,'**')
    },
    code: (attr, insert) => {
        return _inlineOp(insert,'`')
    }
}

const _block: [] = {
    header: (attr, insert, extra) => {
        return '#'.repeat(attr.header) + ' ' + insert
    },
    blockquote: (attr, insert, extra) => {
        return '> ' + insert
    },
    list: (attr, insert, extra) => {
        switch (attr.list) {
            case 'bullet':
                extra.ordered = 0
                return '* ' + insert
            case 'ordered':
                extra.ordered++
                return extra.ordered + '. ' + insert
        }
    }
}

const getLastLine = lines => lines.length > 0 ? lines.pop() : ''

export default function(delta ) {
    let block = false
    let lines:[string] = []
    let extra: {ordered: 0} = {ordered: 0}
    delta.forEach((op) => {
        let attr = op.attributes
        let insert = op.insert
        if (insert.image) {
            insert = '![](' + insert.image + ')'
        }

        if (attr) {

            for(let key in _inline)
            {
              if (attr.hasOwnProperty(key) && key !== null) {
                insert = _inline[key](attr, insert)
              }
            }

            for(let key in _block)
            {
              if (attr.hasOwnProperty(key) && key !== null) {
                if (insert === '\n') { insert = getLastLine(lines) }
                block = true
                insert = _block[key](attr, insert, extra)
              }
            }

            if (block && lines.length >= 1) {
                insert = '\n' + insert
            }
        }
        let result = (getLastLine(lines) + insert).split('\n')
        for (let index in result) {
            lines.push(result[index])
        }
        if (block === true) {
            lines.push(getLastLine(lines) + '\n')
        }
        if (result.length > 2 || (block === true && !attr.list)) { extra.ordered = 0 }
        block = false
    })
    let result = lines.join('\n')
    if(result[result.length -1] !== '\n')
        result += '\n'
    return result
}


