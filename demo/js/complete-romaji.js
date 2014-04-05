// Copyright (c) 2014 Takuya Asano All Rights Reserved.

var input = '';
var tables = [];

var not_found_tag = '<li>No results <small>結果がありません</small></li>';

var convert = function(e) {
    var _tables = [];

    if ($('#type-iso').prop('checked')) {
        _tables.push(Romaji2Katakana.iso);
    }
    if ($('#type-iso-strict').prop('checked')) {
        _tables.push(Romaji2Katakana.iso_strict);
    }
    if ($('#type-kunrei').prop('checked')) {
        _tables.push(Romaji2Katakana.kunrei);
    }
    if ($('#type-kunrei-2').prop('checked')) {
        _tables.push(Romaji2Katakana.kunrei_2);
    }
    if ($('#type-hepburn-bs').prop('checked')) {
        _tables.push(Romaji2Katakana.hepburn_bs);
    }
    if ($('#type-passport').prop('checked')) {
        _tables.push(Romaji2Katakana.passport);
    }

    if (_tables.length == 0) {
        tables = _tables;
        $('#results').empty();
        $('#results').append(not_found_tag);
        return;
    }

    var _input = $('#input-form').val();
    if (input == _input && tables.length == _tables.length) {
        return;
    }

    $('#results').empty();

    input = _input;
    tables = _tables;

    var converter = Romaji2Katakana.converter(tables);

    var results = converter.convert(input);
    if (results == null || results.length == 0) {
        // $('#results').empty();
        $('#results').append(not_found_tag);
        return;
    }
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        $('#results').append('<li>' + result + '</li>');
    }
};

$('.type-checkbox').change(convert);
$('#input-form').keyup(convert);
$('#input-form').focus();
