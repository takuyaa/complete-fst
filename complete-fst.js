// Copyright (c) 2014 Takuya Asano All Rights Reserved.

/**
 * Complete FST library
 * @fileoverview Non-deterministic FST (Finite State Transducer)
 * implementation, which can enumerate all possible solutions.
 */
(function() {

    /**
     * Initial state name of FST
     */
    var START_STATE = '\u0000';

    /**
     * Construct a Non-deterministic FST (Finite State Transducer)
     * from given table
     * @param {object} table is a convert table
     * @returns {FST} FST object
     */
    var construct = function(table) {
        var fst = new FST();
        for (var key in table) {
            fst.add_rule(key, table[key]);
        }
        return fst;
    };

    /**
     * FST constructor
     * @constructor
     */
    function FST() {
        // Convert table
        this.table = {};

        // NFT transition table
        this.trans_table = {};

        // initially, only include start state
        this.trans_table[START_STATE] = {
            'input': {},
            'is_accepted': true
        };
    };

    /**
     * Add a transition table to this FST
     * @param {String} table is a JSON object, which key is a input, value is a output
     */
    FST.prototype.add = function(table) {
        if (!is_type('Object', table)) {
            return;
        }
        for (var key in table) {
            this.add_rule(key, table[key]);
        }
    };

    /**
     * Add a transition rule to this FST
     * @param {String} key is a character string to match an input string
     * @param {String} output is a transduced character string
     */
    FST.prototype.add_rule = function(key, output) {
        if (!is_type('String', key)) {
            return;
        }
        if (!is_type('String', output) && !is_type('Array', output)) {
            return;
        }

        var table = this.table;
        var trans_table = this.trans_table;

        if (table[key] == null) {
            table[key] = output;
        } else {
            table[key] = [].concat(table[key], output);
        }

        // start state
        var state = trans_table[START_STATE];

        for (var i = 0; i < key.length; i++) {
            var ch = key[i];

            var is_tail = false;
            if (i == key.length - 1) {
                is_tail = true;
            }

            if (is_tail) {
                if (is_type('String', output)) {
                    var arcs = state.input[ch];
                    if (!is_same_arc_exist(arcs, next_state_name, output)) {
                        add_arc(this, state, START_STATE, ch, output, key.length);
                    }
                } else if (is_type('Array', output)) {
                    for (var j = 0; j < output.length; j++) {
                        var arcs = state.input[ch];
                        if (!is_same_arc_exist(arcs, next_state_name, output[j])) {
                            add_arc(this, state, START_STATE, ch, output[j], key.length);
                        }
                    }
                } else {
                    // type error
                }
                break;
            }

            var next_state_name = key.slice(0, i + 1);

            var next_state = trans_table[next_state_name];
            if (next_state == null) {
                next_state = add_state(this, next_state_name);
            }

            // forward lookup for checking same arc exists
            if (state.input[ch] == null) {
                // transition failed
                // add arc to next state
                add_arc(this, state, next_state_name, ch);
            } else {
                var arcs = state.input[ch];
                if (!is_same_arc_exist(arcs, next_state_name, null)) {
                    add_arc(this, state, next_state_name, ch);
                }
            }

            if (next_state == null) {
                // transition failed
                // add arc to next state
                state.input[ch] = {
                    'next': next_state_name
                };
                next_state = state.input[ch];
            }

            // transition
            state = trans_table[next_state_name];
        }
    };

    /**
     * Convert given input to transduced output
     * @param {string} str is an input string
     */
    FST.prototype.convert = function(str) {
        var trans_table = this.trans_table;
	    var result = [];  // output list
        var fsts = [
            {
                'state': START_STATE,
                'is_accepted': true,
                'output': '',
                'score': 0
            }
        ];

        var i = 0;
        while (i < str.length) {
            var ch = str[i++];
            var fsts_ = fsts;
            fsts = [];

            // all FSTs get character 'ch' and try to transition
            for (var j = 0; j < fsts_.length; j++) {
                var fst = fsts_[j];
                var state = trans_table[fst.state];
                var arcs = state.input[ch];

                if (arcs == null) {
                    // not exists in convert table
                    // discard this FST
                    continue;
                }

                // clone FST for each multiple arcs
                for (var k = 0; k < arcs.length; k++) {
                    var arc = arcs[k];
                    var output = fst.output;
                    if (arc.output != null) {
                        output += arc.output;
                    }
                    var score = fst.score;
                    if (arc.score != null) {
                        score += arc.score;
                    }

                    var next_state = trans_table[arc.next];

                    var fst_copy = {
                        'state': arc.next,
                        'is_accepted': next_state.is_accepted,
                        'output': output,
                        'score': score
                    };

                    fsts.push(fst_copy);
                }
            }
            if (fsts.length <= 0) {
                return null;
            }
	    }

        for (var j = 0; j < fsts.length; j++) {
            var fst = fsts[j];
            if (fst.is_accepted) {
                // result.push(fst.output);
                result.push(fst);
            }
        }

        // sort by desc order
        result.sort(function(fst1, fst2) {
            if (fst1.score > fst2.score) return -1;
            if (fst1.score < fst2.score) return 1;
            return 0;
        });

        return result.map(function(fst){
                   return fst.output;
               });
    };

    var add_arc = function(fst, state, next_state_name, ch, output, key_length) {

        var trans_table = fst.trans_table;

        // add arc labeled by character 'ch'
        if (state.input[ch] == null) {
            state.input[ch] = [];
        }

        if (output == null) {
            state.input[ch].push({
                'next': next_state_name
            });
            return;
        }

        var score = key_length * key_length;

        // add FST output to this arc
        state.input[ch].push({
            'next': next_state_name,
            'output': output,
            'score': score
        });

        // makes state's 'is_accepted' flag true
        // that state is pointed by this arc
        var next = trans_table[next_state_name];
        next.is_accepted = true;
    };

    var add_state = function(fst, next_state_name) {
        var trans_table = fst.trans_table;

        // add FST state
        trans_table[next_state_name] = {
            'input': {},
            'is_accepted': false
        };

        return trans_table[next_state_name];
    };

    var is_same_arc_exist = function(arcs, next_state_name, output) {
        var is_same_arc_exist = false;
        if (arcs == null) {
            return is_same_arc_exist;
        }
        for (var j = 0; j < arcs.length; j++) {
            var arc = arcs[j];
            if (arc['next'] == next_state_name && arc['output'] == output) {
                is_same_arc_exist = true;
            }
        }
        return is_same_arc_exist;
    };

    /**
     * Object type identifier (Utility method)
     * @param {string} type is a object type
     * @param {object} obj is an object to identify
     * @returns {boolean} if object type is given type, returns true
     */
    var is_type = function(type, obj) {
	    var clas = Object.prototype.toString.call(obj).slice(8, -1);
	    return obj !== undefined && obj !== null && clas === type;
    }

    /**
     * Merge two convert tables
     * @param {object} s1
     * @param {object} s2
     * @returns {object} deep copied and merged object
     */
    var merge_table = function(s1, s2) {
	    var m = {};
	    for (var e1 in s1) {
            if (s2[e1] == null) {
                m[e1] = s1[e1];
                continue;
            }
	        var merged = [];
	        adds(merged, s1[e1]);
	        var e2 = s2[e1];
	        adds(merged, e2);
	        m[e1] = merged;
	    }
	    for (var e2 in s2) {
	        if (m[e2] == null) {
		        m[e2] = s2[e2];
	        }
	    }
	    return m;
    };

    /**
     * Appends Array or String into Array w/o duplication
     * @param {Array} array
     * @param {string} elem
     */
    var adds = function(array, elem) {

	    // Appends String into Array w/o duplication
	    // a is an Array
	    // e is a String
	    var appends = function(a, e) {
	        var is_contained = false;
	        a.map(function(org) {
		        if (org == e) {
		            is_contained = true;
		        }
		        return org;
	        });
	        if (!is_contained) {
		        a.push(e);
	        }
	    };

	    if (is_type('String', elem)) {
	        appends(array, elem);
	    } else if (is_type('Array', elem)) {
	        for (var i = 0; i < elem.length; i++) {
		        appends(array, elem[i]);
	        }
	    } else {
	        // Do nothing
	    }
    };

    /**
     * Public methods or fields of global object CFST
     */
    var CFST = {
        'construct': construct,
        'merge_table': merge_table
    };

    if ('undefined' == typeof module) {
	    // In browser
	    window.CFST = CFST;
    } else {
	    // In node
	    module.exports = CFST;
    }
})();
