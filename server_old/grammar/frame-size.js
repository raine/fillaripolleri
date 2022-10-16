// Generated automatically by nearley, version 2.15.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }
 function nuller() { return null; } 
 function joiner(d) { return d.join(''); } 
 const R = require('ramda'); 
 const wrapWithType = (type) => (value) => ({ type, value }); var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "main", "symbols": ["any", "frame_size_candidate", "_", "any"], "postprocess": R.nth(1)},
    {"name": "frame_size_candidate", "symbols": ["frame_size_prefix", "sep1", "_", "frame_size"], "postprocess": R.last},
    {"name": "frame_size_candidate$subexpression$1", "symbols": [{"literal":"-"}, /[sS]/, /[iI]/, /[zZ]/, /[eE]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_candidate", "symbols": ["frame_size_tshirt", "frame_size_candidate$subexpression$1"], "postprocess": R.head},
    {"name": "frame_size_candidate$subexpression$2", "symbols": [/[kK]/, /[oO]/, /[kK]/, /[oO]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_candidate", "symbols": ["frame_size_tshirt", "sep2", "frame_size_candidate$subexpression$2"], "postprocess": R.head},
    {"name": "frame_size_candidate$subexpression$3", "symbols": [/[cC]/, /[mM]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_candidate", "symbols": ["frame_size_number", "frame_size_candidate$subexpression$3", "_", "frame_size_suffix"], "postprocess": R.head},
    {"name": "sep1$subexpression$1", "symbols": ["_", {"literal":":"}]},
    {"name": "sep1", "symbols": ["sep1$subexpression$1"]},
    {"name": "sep1", "symbols": ["__"]},
    {"name": "sep2", "symbols": ["__"]},
    {"name": "sep2", "symbols": [{"literal":"-"}]},
    {"name": "frame_size_prefix$subexpression$1", "symbols": [/[rR]/, /[uU]/, /[nN]/, /[gG]/, /[oO]/, /[nN]/, {"literal":" "}, /[kK]/, /[oO]/, /[kK]/, /[oO]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_prefix", "symbols": ["frame_size_prefix$subexpression$1"]},
    {"name": "frame_size_prefix$subexpression$2", "symbols": [/[rR]/, /[uU]/, /[nN]/, /[gG]/, /[oO]/, /[nN]/, {"literal":" "}, /[kK]/, /[oO]/, /[kK]/, /[oO]/, {"literal":" "}, {"literal":"("}, /[lL]/, /[iI]/, /[sS]/, /[äÄ]/, /[äÄ]/, {"literal":" "}, /[mM]/, /[yY]/, /[öÖ]/, /[sS]/, {"literal":" "}, /[oO]/, /[tT]/, /[sS]/, /[iI]/, /[kK]/, /[kK]/, /[oO]/, /[oO]/, /[nN]/, {"literal":")"}], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_prefix", "symbols": ["frame_size_prefix$subexpression$2"]},
    {"name": "frame_size_prefix$subexpression$3", "symbols": [/[rR]/, /[uU]/, /[nN]/, /[kK]/, /[oO]/, /[kK]/, /[oO]/, /[kK]/, /[oO]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_prefix", "symbols": ["frame_size_prefix$subexpression$3"]},
    {"name": "frame_size_prefix$subexpression$4", "symbols": [/[rR]/, /[uU]/, /[nN]/, /[gG]/, /[oO]/, /[nN]/, /[kK]/, /[oO]/, /[kK]/, /[oO]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_prefix$subexpression$5", "symbols": [/[oO]/, /[nN]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_prefix", "symbols": ["frame_size_prefix$subexpression$4", "_", "frame_size_prefix$subexpression$5"]},
    {"name": "frame_size_prefix$subexpression$6", "symbols": [/[rR]/, /[uU]/, /[nN]/, /[kK]/, /[oO]/, /[kK]/, /[oO]/, /[kK]/, /[oO]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_prefix$subexpression$7", "symbols": [/[oO]/, /[nN]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_prefix", "symbols": ["frame_size_prefix$subexpression$6", "_", "frame_size_prefix$subexpression$7"]},
    {"name": "frame_size_prefix$subexpression$8", "symbols": [/[rR]/, /[uU]/, /[nN]/, /[kK]/, /[oO]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_prefix", "symbols": ["frame_size_prefix$subexpression$8"]},
    {"name": "frame_size_prefix$subexpression$9", "symbols": [/[kK]/, /[oO]/, /[kK]/, /[oO]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_prefix$ebnf$1", "symbols": [{"literal":"a"}], "postprocess": id},
    {"name": "frame_size_prefix$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "frame_size_prefix", "symbols": ["frame_size_prefix$subexpression$9", "frame_size_prefix$ebnf$1"]},
    {"name": "frame_size_prefix$subexpression$10", "symbols": [/[fF]/, /[rR]/, /[aA]/, /[mM]/, /[eE]/, {"literal":" "}, /[sS]/, /[iI]/, /[zZ]/, /[eE]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_prefix", "symbols": ["frame_size_prefix$subexpression$10"]},
    {"name": "frame_size_prefix$subexpression$11", "symbols": [/[sS]/, /[iI]/, /[zZ]/, /[eE]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_prefix", "symbols": ["frame_size_prefix$subexpression$11"]},
    {"name": "frame_size_suffix$subexpression$1", "symbols": [/[rR]/, /[uU]/, /[nN]/, /[gG]/, /[oO]/, /[lL]/, /[lL]/, /[aA]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_suffix", "symbols": ["frame_size_suffix$subexpression$1"]},
    {"name": "frame_size_suffix$subexpression$2", "symbols": [/[rR]/, /[uU]/, /[nN]/, /[kK]/, /[oO]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_suffix", "symbols": ["frame_size_suffix$subexpression$2"]},
    {"name": "frame_size", "symbols": ["frame_size_cm"], "postprocess": R.head},
    {"name": "frame_size", "symbols": ["frame_size_tshirt"], "postprocess": R.head},
    {"name": "frame_size_cm", "symbols": ["frame_size_number"], "postprocess": R.head},
    {"name": "frame_size_number$subexpression$1", "symbols": [{"literal":"4"}, /[0-9]/]},
    {"name": "frame_size_number$subexpression$1", "symbols": [{"literal":"5"}, /[0-9]/]},
    {"name": "frame_size_number$subexpression$1", "symbols": [{"literal":"6"}, /[0-5]/]},
    {"name": "frame_size_number", "symbols": ["frame_size_number$subexpression$1"], "postprocess": R.pipe(R.head, R.join(''), parseInt, wrapWithType('cm'))},
    {"name": "frame_size_tshirt$subexpression$1$subexpression$1", "symbols": [{"literal":"3"}, /[xX]/, /[lL]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_tshirt$subexpression$1", "symbols": ["frame_size_tshirt$subexpression$1$subexpression$1"]},
    {"name": "frame_size_tshirt$subexpression$1$subexpression$2", "symbols": [{"literal":"2"}, /[xX]/, /[lL]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_tshirt$subexpression$1", "symbols": ["frame_size_tshirt$subexpression$1$subexpression$2"]},
    {"name": "frame_size_tshirt$subexpression$1$subexpression$3", "symbols": [/[xX]/, /[xX]/, /[lL]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_tshirt$subexpression$1", "symbols": ["frame_size_tshirt$subexpression$1$subexpression$3"], "postprocess": () => '2XL'},
    {"name": "frame_size_tshirt$subexpression$1$subexpression$4", "symbols": [/[xX]/, /[lL]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_tshirt$subexpression$1", "symbols": ["frame_size_tshirt$subexpression$1$subexpression$4"]},
    {"name": "frame_size_tshirt$subexpression$1$subexpression$5", "symbols": [/[lL]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_tshirt$subexpression$1", "symbols": ["frame_size_tshirt$subexpression$1$subexpression$5"]},
    {"name": "frame_size_tshirt$subexpression$1$subexpression$6", "symbols": [/[mM]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_tshirt$subexpression$1", "symbols": ["frame_size_tshirt$subexpression$1$subexpression$6"]},
    {"name": "frame_size_tshirt$subexpression$1$subexpression$7", "symbols": [/[sS]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_tshirt$subexpression$1", "symbols": ["frame_size_tshirt$subexpression$1$subexpression$7"]},
    {"name": "frame_size_tshirt$subexpression$1$subexpression$8", "symbols": [/[xX]/, /[sS]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_tshirt$subexpression$1", "symbols": ["frame_size_tshirt$subexpression$1$subexpression$8"]},
    {"name": "frame_size_tshirt$subexpression$1$subexpression$9", "symbols": [/[xX]/, /[xX]/, /[sS]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_tshirt$subexpression$1", "symbols": ["frame_size_tshirt$subexpression$1$subexpression$9"], "postprocess": () => '2XS'},
    {"name": "frame_size_tshirt$subexpression$1$subexpression$10", "symbols": [{"literal":"2"}, /[xX]/, /[sS]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_tshirt$subexpression$1", "symbols": ["frame_size_tshirt$subexpression$1$subexpression$10"]},
    {"name": "frame_size_tshirt$subexpression$1$subexpression$11", "symbols": [{"literal":"3"}, /[xX]/, /[sS]/], "postprocess": function(d) {return d.join(""); }},
    {"name": "frame_size_tshirt$subexpression$1", "symbols": ["frame_size_tshirt$subexpression$1$subexpression$11"]},
    {"name": "frame_size_tshirt", "symbols": ["frame_size_tshirt$subexpression$1"], "postprocess": R.pipe(R.flatten, R.head, R.toUpper, wrapWithType('t-shirt'))},
    {"name": "any$ebnf$1", "symbols": []},
    {"name": "any$ebnf$1", "symbols": ["any$ebnf$1", /[^]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "any", "symbols": ["any$ebnf$1"], "postprocess": nuller},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": () => null},
    {"name": "__", "symbols": [{"literal":" "}], "postprocess": () => null}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
