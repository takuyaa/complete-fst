Complete FST
============

非決定性FST (有限状態トランスデューサ) の実装 Complete FST と、それを利用したローマ字カタカナ変換ライブラリです。

変換ルール (変換元と変換先の組) を書くことで、FST のみを利用することもできます。これにより、任意の文字列変換に利用することができます。

Complete FST をベースに、ローマ字 <-> ひらがな変換はもちろん、半角全角変換、かな漢字変換を作ることもできます（氏名の変換など、限られた用途なら実用的に動作するはずです）。

変換ルールは、JavaScript オブジェクト形式 ({"key":"value"} の形) で記述できます。

与えられたルールに基づいて、文字列を変換しますが、変換先が複数あって一意に決まらないような変換ルールでも、全ての変換候補を列挙することができるのが特徴です。



デモ
----

[ローマ字カタカナ変換のデモサイト](http://takuyaa.github.io/complete-fst/demo/complete-romaji.html)を公開しています。



内容物
------

Complete FST を利用した応用として、ローマ字カタカナ変換ライブラリ
complete-romaji.js を同梱しています。

    complete-fst/
    ├── complete-fst.js         // Complete FST 本体
    ├── complete-romaji.js      // ローマ字カタカナ変換ライブラリ
    ├── demo/                   // ローマ字カタカナ変換のデモ
    │   └── ...
    └── test/                   // テストコード
         └── ...


使い方
------

### Complete FST を単体で使う

ブラウザで使う場合

    var cfst = CFST.construct({
        'F': [ 'Finite', 'Final' ],
        'A': [ 'Automaton', 'Answer' ]
    });
    cfst.convert('FA');
    // -> [ "FiniteAutomaton", "FiniteAnswer", "FinalAutomaton", "FinalAnswer" ]


Node で使う場合

    var CFST = require('./complete-fst.js');
    var cfst = CFST.construct({
        'F': [ 'Finite', 'Final' ],
        'A': [ 'Automaton', 'Answer' ]
    });
    cfst.convert('FA');
    // -> [ "FiniteAutomaton", "FiniteAnswer", "FinalAutomaton", "FinalAnswer" ]


変換ルールは、任意のタイミングで追加することができます。

    var cfst = CFST.construct();
    cfst.convert('ElasticSearch');                // -> null
    cfst.add({'ElasticSearch':'Elasticsearch'});  // ルール追加。sは小文字！
    cfst.convert('ElasticSearch');                // -> [ "Elasticsearch" ]


### ローマ字カタカナ変換器として使う

デフォルトでは[訓令式の国際規格 ISO3602](http://xembho.s59.xrea.com/siryoo/iso3602_bassui.html) に準じます。

    // ISO3602 訓令式 (default)
    var r2k = Romaji2Katakana.converter();
    r2k.convert('susi');     // -> [ "スシ" ]
    r2k.convert('sushi');    // -> null

変換結果は配列で返されますが、FST が入力文字列を受理しなかった場合は
null を返します。

Romaji2Katakana.converter() に変換方式（複数可）を指定することで、変換ルールを拡張できます。

    // ISO3602 訓令式 + BS 4812:1972 ヘボン式
    var r2k = Romaji2Katakana.converter([ Romaji2Katakana.iso, Romaji2Katakana.hepburn_bs ]);
    r2k.convert("sushi");    // -> [ "スシ" ]

変換候補が複数ある場合は、結果がスコア順でソートされて返されます。より長い文字列長のパターンで変換された候補が、より高いスコアとなります。



使用上の注意
------------

非決定性の有限状態トランスデューサ (FST) をベースに実装しています。

* construct() は、変換テーブルから FST を構築します
* add() は、FST に遷移を追加します
* convert() は、FST をシミュレートすることで変換候補の文字列を得ます

プログラム内部で構築される FST は非決定性のため、同じ状態・同じ入力に対して、遷移先および出力の分岐が発生します。この実装では上述の通り、その場で FST オブジェクトを複製することでシミュレートする、という実装を行っています。

この 1つずつの FST が、入力文字列を受理したときに、1つの変換候補を出力することで、全体として全ての変換候補を列挙することができます。

この実装では、分岐によって FST が指数オーダーで増加するため、変換元の文字列が長すぎると動作が重くなったり、メモリを大量に消費する可能性があります（最悪の場合、ブラウザやサーバがクラッシュします）。

この問題に対しては、同じ入力に対しては変換先がただ 1 つに決まるように変換テーブルを修正すると、変換器全体が決定性 FST となり、変換は高速に行われます。



Copyright and license
---------------------

Copyright (c) 2014 Takuya Asano All Rights Reserved.

This software is released under the MIT License.
See LICENSE.txt and NOTICE.md.
