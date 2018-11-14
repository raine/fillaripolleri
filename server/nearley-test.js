import moo from 'moo'
import fs from 'fs'

const lexer = moo.compile({
  ws: /[ \t]+/u,
  word: /[^\s]+/u,
  NL: { match: /\n/u, lineBreaks: true }
})

const input = fs.readFileSync('test.txt', 'utf8')
lexer.reset(input)

let x
while (x = lexer.next()) {
  console.log(x)
}
