import * as nearley from 'nearley'
import * as frameSizeGrammar from  './grammar/frame-size'
import fs from 'fs'

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(frameSizeGrammar))
const input = fs.readFileSync('tmp/129706.txt', 'utf8')

parser.feed(input)
console.log([...parser.socrates([])])

