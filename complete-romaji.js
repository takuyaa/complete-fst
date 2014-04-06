// Copyright (c) 2014 Takuya Asano All Rights Reserved.

/**
 * Roman alphabet (Romaji) to Katakana converter.
 * @fileoverview This JS depends on a Complete FST library, complete-fst.js
 */
(function() {

    // Import complete FST library
    var CFST_;
    if ('undefined' == typeof module) {
	    // In browser
        CFST_ = CFST;
    } else {
	    // In node
        CFST_ = require('./complete-fst.js');
    }

    /**
     * Romaji to Katakana convert table, based on ISO3602 (国際規格)
     * http://xembho.s59.xrea.com/siryoo/iso3602_bassui.html
     *
     * Not supported about circumflexed character long vowel (長音)
     *
     * See also Wikipedia page about Roman alphabet
     * http://ja.wikipedia.org/wiki/%E3%83%AD%E3%83%BC%E3%83%9E%E5%AD%97
     */
    var iso_romaji_to_katakana = {
	    'a': 'ア',
	    'i': 'イ',
	    'u': 'ウ',
	    'e': ['エ', 'ヘ'],  // 助詞の <ヘ>
	    'o': ['オ', 'ヲ'],  // 助詞の <ヲ>

	    'ka': 'カ',
	    'ki': 'キ',
	    'ku': 'ク',
	    'ke': 'ケ',
	    'ko': 'コ',

	    'sa': 'サ',
	    'si': 'シ',
	    'su': 'ス',
	    'se': 'セ',
	    'so': 'ソ',

	    'ta': 'タ',
	    'ti': 'チ',
	    'tu': 'ツ',
	    'te': 'テ',
	    'to': 'ト',

	    'na': 'ナ',
	    'ni': 'ニ',
	    'nu': 'ヌ',
	    'ne': 'ネ',
	    'no': 'ノ',

	    'ha': 'ハ',
	    'hi': 'ヒ',
	    'hu': 'フ',
	    'he': 'ヘ',
	    'ho': 'ホ',

	    'ma': 'マ',
	    'mi': 'ミ',
	    'mu': 'ム',
	    'me': 'メ',
	    'mo': 'モ',

	    'ya': 'ヤ',
	    'yu': 'ユ',
	    'yo': 'ヨ',

	    'ra': 'ラ',
	    'ri': 'リ',
	    'ru': 'ル',
	    're': 'レ',
	    'ro': 'ロ',

	    'wa': ['ワ', 'ハ'],  // 助詞の <ハ>
	    'wo': 'ヲ',

	    'ga': '\u30AC',
	    'gi': '\u30AE',
	    'gu': '\u30B0',
	    'ge': '\u30B2',
	    'go': '\u30B4',

	    'za': '\u30B6',
	    'zi': ['\u30B8', '\u30C2'],
	    'zu': ['\u30BA', '\u30C5'],
	    'ze': '\u30BC',
	    'zo': '\u30BE',

	    'da': '\u30C0',
	    'de': '\u30C7',
	    'do': '\u30C9',

	    'ba': '\u30D0',
	    'bi': '\u30D3',
	    'bu': '\u30D6',
	    'be': '\u30D9',
	    'bo': '\u30DC',

	    'pa': '\u30D1',
	    'pi': '\u30D4',
	    'pu': '\u30D7',
	    'pe': '\u30DA',
	    'po': '\u30DD',

	    // 拗音

	    'kya': 'キャ',
	    'kyu': 'キュ',
	    'kyo': 'キョ',

	    'sya': 'シャ',
	    'syu': 'シュ',
	    'syo': 'ショ',

	    'tya': 'チャ',
	    'tyu': 'チュ',
	    'tyo': 'チョ',

	    'nya': 'ニャ',
	    'nyu': 'ニュ',
	    'nyo': 'ニョ',

	    'hya': 'ヒャ',
	    'hyu': 'ヒュ',
	    'hyo': 'ヒョ',

	    'mya': 'ミャ',
	    'myu': 'ミュ',
	    'myo': 'ミョ',

	    'rya': 'リャ',
	    'ryu': 'リュ',
	    'ryo': 'リョ',

	    'gya': '\u30AEャ',
	    'gyu': '\u30AEュ',
	    'gyo': '\u30AEョ',

	    'zya': ['\u30B8ャ', '\u30C2ャ'],
	    'zyu': ['\u30B8ュ', '\u30C2ュ'],
	    'zyo': ['\u30B8ョ', '\u30C2ョ'],

	    'bya': '\u30D3ャ',
	    'byu': '\u30D3ャ',
	    'byo': '\u30D3ュ',

	    'pya': '\u30D4ャ',
	    'pyu': '\u30D4ュ',
	    'pyo': '\u30D4ョ',

        // 促音

        'kka': 'ッカ',
        'kki': 'ッキ',
        'kku': 'ック',
        'kke': 'ッケ',
        'kko': 'ッコ',

        'ssa': 'ッサ',
        'ssi': 'ッシ',
        'ssu': 'ッス',
        'sse': 'ッセ',
        'sso': 'ッソ',

	    'tta': 'ッタ',
	    'tti': 'ッチ',
	    'ttu': 'ッツ',
	    'tte': 'ッテ',
	    'tto': 'ット',

	    'nna': 'ッナ',
	    'nni': 'ッニ',
	    'nnu': 'ッヌ',
	    'nne': 'ッネ',
	    'nno': 'ッノ',

        'hha': 'ッハ',
	    'hhi': 'ッヒ',
	    'hhu': 'ッフ',
	    'hhe': 'ッヘ',
	    'hho': 'ッホ',

	    'mma': 'ッマ',
	    'mmi': 'ッミ',
	    'mmu': 'ッム',
	    'mme': 'ッメ',
	    'mmo': 'ッモ',

	    'yya': 'ッヤ',
	    'yyu': 'ッユ',
	    'yyo': 'ッヨ',

	    'rra': 'ッラ',
	    'rri': 'ッリ',
	    'rru': 'ッル',
	    'rre': 'ッレ',
	    'rro': 'ッロ',

	    'wwa': ['ッワ', 'ッハ'],  // 助詞の <ハ>
	    'wwo': 'ッヲ',

        'gga': 'ッ\u30AC',
	    'ggi': 'ッ\u30AE',
	    'ggu': 'ッ\u30B0',
	    'gge': 'ッ\u30B2',
	    'ggo': 'ッ\u30B4',

	    'zza': 'ッ\u30B6',
	    'zzi': ['ッ\u30B8', 'ッ\u30C2'],
	    'zzu': ['ッ\u30BA', 'ッ\u30C5'],
	    'zze': 'ッ\u30BC',
	    'zzo': 'ッ\u30BE',

	    'dda': 'ッ\u30C0',
	    'dde': 'ッ\u30C7',
	    'ddo': 'ッ\u30C9',

	    'bba': 'ッ\u30D0',
	    'bbi': 'ッ\u30D3',
	    'bbu': 'ッ\u30D6',
	    'bbe': 'ッ\u30D9',
	    'bbo': 'ッ\u30DC',

	    'ppa': 'ッ\u30D1',
	    'ppi': 'ッ\u30D4',
	    'ppu': 'ッ\u30D7',
	    'ppe': 'ッ\u30DA',
	    'ppo': 'ッ\u30DD',

	    // 促音 + 拗音

	    'kkya': 'ッキャ',
	    'kkyu': 'ッキュ',
	    'kkyo': 'ッキョ',

	    'ssya': 'ッシャ',
	    'ssyu': 'ッシュ',
	    'ssyo': 'ッショ',

	    'ttya': 'ッチャ',
	    'ttyu': 'ッチュ',
	    'ttyo': 'ッチョ',

	    'nnya': 'ッニャ',
	    'nnyu': 'ッニュ',
	    'nnyo': 'ッニョ',

	    'hhya': 'ッヒャ',
	    'hhyu': 'ッヒュ',
	    'hhyo': 'ッヒョ',

	    'mmya': 'ッミャ',
	    'mmyu': 'ッミュ',
	    'mmyo': 'ッミョ',

	    'rrya': 'ッリャ',
	    'rryu': 'ッリュ',
	    'rryo': 'ッリョ',

	    'ggya': 'ッ\u30AEャ',
	    'ggyu': 'ッ\u30AEュ',
	    'ggyo': 'ッ\u30AEョ',

	    'zzya': ['ッ\u30B8ャ', 'ッ\u30C2ャ'],
	    'zzyu': ['ッ\u30B8ュ', 'ッ\u30C2ュ'],
	    'zzyo': ['ッ\u30B8ョ', 'ッ\u30C2ョ'],

	    'bbya': 'ッ\u30D3ャ',
	    'bbyu': 'ッ\u30D3ュ',
	    'bbyo': 'ッ\u30D3ョ',

	    'ppya': 'ッ\u30D4ャ',
	    'ppyu': 'ッ\u30D4ュ',
	    'ppyo': 'ッ\u30D4ョ',

        // Others

        "n'": 'ン',
        'n': 'ン',
        ' ': ' '
    };

    /**
     * Romaji to Katakana convert table, based on ISO3602 strict (日本式 厳密翻字)
     * http://xembho.s59.xrea.com/siryoo/iso3602_bassui.html
     * http://xembho.s59.xrea.com/siryoo/nipponsiki_kunreisiki.html
     *
     * Not supported about macroned character long vowel (長音)
     *
     * See also Wikipedia page about Roman alphabet
     * http://ja.wikipedia.org/wiki/%E3%83%AD%E3%83%BC%E3%83%9E%E5%AD%97
     */
    var iso_strict_romaji_to_katakana = {
	    'a': 'ア',
	    'i': 'イ',
	    'u': 'ウ',
	    'e': 'エ',
	    'o': 'オ',

	    'ka': 'カ',
	    'ki': 'キ',
	    'ku': 'ク',
	    'ke': 'ケ',
	    'ko': 'コ',

	    'sa': 'サ',
	    'si': 'シ',
	    'su': 'ス',
	    'se': 'セ',
	    'so': 'ソ',

	    'ta': 'タ',
	    'ti': 'チ',
	    'tu': 'ツ',
	    'te': 'テ',
	    'to': 'ト',

	    'na': 'ナ',
	    'ni': 'ニ',
	    'nu': 'ヌ',
	    'ne': 'ネ',
	    'no': 'ノ',

	    'ha': 'ハ',
	    'hi': 'ヒ',
	    'hu': 'フ',
	    'he': 'ヘ',
	    'ho': 'ホ',

	    'ma': 'マ',
	    'mi': 'ミ',
	    'mu': 'ム',
	    'me': 'メ',
	    'mo': 'モ',

	    'ya': 'ヤ',
	    'yu': 'ユ',
	    'yo': 'ヨ',

	    'ra': 'ラ',
	    'ri': 'リ',
	    'ru': 'ル',
	    're': 'レ',
	    'ro': 'ロ',

	    'wa': 'ワ',
        'wo': 'ヲ',

	    'ga': '\u30AC',
	    'gi': '\u30AE',
	    'gu': '\u30B0',
	    'ge': '\u30B2',
	    'go': '\u30B4',

	    'za': '\u30B6',
	    'zi': '\u30B8',
	    'zu': '\u30BA',
	    'ze': '\u30BC',
	    'zo': '\u30BE',

	    'da': '\u30C0',
	    'di': '\u30C2',
	    'du': '\u30C5',
	    'de': '\u30C7',
	    'do': '\u30C9',

	    'ba': '\u30D0',
	    'bi': '\u30D3',
	    'bu': '\u30D6',
	    'be': '\u30D9',
	    'bo': '\u30DC',

	    'pa': '\u30D1',
	    'pi': '\u30D4',
	    'pu': '\u30D7',
	    'pe': '\u30DA',
	    'po': '\u30DD',

	    // 拗音

	    'kya': 'キャ',
	    'kyu': 'キュ',
	    'kyo': 'キョ',

	    'sya': 'シャ',
	    'syu': 'シュ',
	    'syo': 'ショ',

	    'tya': 'チャ',
	    'tyu': 'チュ',
	    'tyo': 'チョ',

	    'nya': 'ニャ',
	    'nyu': 'ニュ',
	    'nyo': 'ニョ',

	    'hya': 'ヒャ',
	    'hyu': 'ヒュ',
	    'hyo': 'ヒョ',

	    'mya': 'ミャ',
	    'myu': 'ミュ',
	    'myo': 'ミョ',

	    'rya': 'リャ',
	    'ryu': 'リュ',
	    'ryo': 'リョ',

	    'gya': '\u30AEャ',
	    'gyu': '\u30AEュ',
	    'gyo': '\u30AEョ',

	    'zya': '\u30B8ャ',
	    'zyu': '\u30B8ュ',
	    'zyo': '\u30B8ョ',

        'dya': '\u30C2ャ',
	    'dyu': '\u30C2ュ',
	    'dyo': '\u30C2ョ',

        'bya': '\u30D3ャ',
	    'byu': '\u30D3ュ',
	    'byo': '\u30D3ョ',

	    'pya': '\u30D4ャ',
	    'pyu': '\u30D4ュ',
	    'pyo': '\u30D4ョ',

        // 促音

        'kka': 'ッカ',
        'kki': 'ッキ',
        'kku': 'ック',
        'kke': 'ッケ',
        'kko': 'ッコ',

        'ssa': 'ッサ',
        'ssi': 'ッシ',
        'ssu': 'ッス',
        'sse': 'ッセ',
        'sso': 'ッソ',

	    'tta': 'ッタ',
	    'tti': 'ッチ',
	    'ttu': 'ッツ',
	    'tte': 'ッテ',
	    'tto': 'ット',

	    'nna': 'ッナ',
	    'nni': 'ッニ',
	    'nnu': 'ッヌ',
	    'nne': 'ッネ',
	    'nno': 'ッノ',

        'hha': 'ッハ',
	    'hhi': 'ッヒ',
	    'hhu': 'ッフ',
	    'hhe': 'ッヘ',
	    'hho': 'ッホ',

	    'mma': 'ッマ',
	    'mmi': 'ッミ',
	    'mmu': 'ッム',
	    'mme': 'ッメ',
	    'mmo': 'ッモ',

	    'yya': 'ッヤ',
	    'yyu': 'ッユ',
	    'yyo': 'ッヨ',

	    'rra': 'ッラ',
	    'rri': 'ッリ',
	    'rru': 'ッル',
	    'rre': 'ッレ',
	    'rro': 'ッロ',

	    'wwa': 'ッワ',
        'wwo': 'ッヲ',

	    'gga': 'ッ\u30AC',
	    'ggi': 'ッ\u30AE',
	    'ggu': 'ッ\u30B0',
	    'gge': 'ッ\u30B2',
	    'ggo': 'ッ\u30B4',

	    'zza': 'ッ\u30B6',
	    'zzi': 'ッ\u30B8',
	    'zzu': 'ッ\u30BA',
	    'zze': 'ッ\u30BC',
	    'zzo': 'ッ\u30BE',

	    'dda': 'ッ\u30C0',
	    'ddi': 'ッ\u30C2',
	    'ddu': 'ッ\u30C5',
	    'dde': 'ッ\u30C7',
	    'ddo': 'ッ\u30C9',

	    'bba': 'ッ\u30D0',
	    'bbi': 'ッ\u30D3',
	    'bbu': 'ッ\u30D6',
	    'bbe': 'ッ\u30D9',
	    'bbo': 'ッ\u30DC',

	    'ppa': 'ッ\u30D1',
	    'ppi': 'ッ\u30D4',
	    'ppu': 'ッ\u30D7',
	    'ppe': 'ッ\u30DA',
	    'ppo': 'ッ\u30DD',

	    // 促音 + 拗音

	    'kkya': 'ッキャ',
	    'kkyu': 'ッキュ',
	    'kkyo': 'ッキョ',

	    'ssya': 'ッシャ',
	    'ssyu': 'ッシュ',
	    'ssyo': 'ッショ',

	    'ttya': 'ッチャ',
	    'ttyu': 'ッチュ',
	    'ttyo': 'ッチョ',

	    'nnya': 'ッニャ',
	    'nnyu': 'ッニュ',
	    'nnyo': 'ッニョ',

	    'hhya': 'ッヒャ',
	    'hhyu': 'ッヒュ',
	    'hhyo': 'ッヒョ',

	    'mmya': 'ッミャ',
	    'mmyu': 'ッミュ',
	    'mmyo': 'ッミョ',

	    'rrya': 'ッリャ',
	    'rryu': 'ッリュ',
	    'rryo': 'ッリョ',

	    'ggya': 'ッ\u30AEャ',
	    'ggyu': 'ッ\u30AEュ',
	    'ggyo': 'ッ\u30AEョ',

	    'zzya': 'ッ\u30B8ャ',
	    'zzyu': 'ッ\u30B8ュ',
	    'zzyo': 'ッ\u30B8ョ',

        'ddya': 'ッ\u30C2ャ',
	    'ddyu': 'ッ\u30C2ュ',
	    'ddyo': 'ッ\u30C2ョ',

        'bbya': 'ッ\u30D3ャ',
	    'bbyu': 'ッ\u30D3ュ',
	    'bbyo': 'ッ\u30D3ョ',

	    'ppya': 'ッ\u30D4ャ',
	    'ppyu': 'ッ\u30D4ュ',
	    'ppyo': 'ッ\u30D4ョ',

        // Others

        "n'": 'ン',
        'n': 'ン',
        ' ': ' '
    };

    /**
     * Romaji to Katakana convert table, based on 訓令式 第1表
     * http://xembho.s59.xrea.com/siryoo/naikaku_kokuzi.html
     *
     * Not supported about circumflexed character long vowel (長音)
     *
     * See also Wikipedia page about Roman alphabet
     * http://ja.wikipedia.org/wiki/%E3%83%AD%E3%83%BC%E3%83%9E%E5%AD%97
     */
    var kunrei_romaji_to_katakana = {
	    'a': 'ア',
	    'i': 'イ',
	    'u': 'ウ',
	    'e': 'エ',
	    'o': ['オ', 'ヲ'],

	    'ka': 'カ',
	    'ki': 'キ',
	    'ku': 'ク',
	    'ke': 'ケ',
	    'ko': 'コ',

	    'sa': 'サ',
	    'si': 'シ',
	    'su': 'ス',
	    'se': 'セ',
	    'so': 'ソ',

	    'ta': 'タ',
	    'ti': 'チ',
	    'tu': 'ツ',
	    'te': 'テ',
	    'to': 'ト',

	    'na': 'ナ',
	    'ni': 'ニ',
	    'nu': 'ヌ',
	    'ne': 'ネ',
	    'no': 'ノ',

	    'ha': 'ハ',
	    'hi': 'ヒ',
	    'hu': 'フ',
	    'he': 'ヘ',
	    'ho': 'ホ',

	    'ma': 'マ',
	    'mi': 'ミ',
	    'mu': 'ム',
	    'me': 'メ',
	    'mo': 'モ',

	    'ya': 'ヤ',
	    'yu': 'ユ',
	    'yo': 'ヨ',

	    'ra': 'ラ',
	    'ri': 'リ',
	    'ru': 'ル',
	    're': 'レ',
	    'ro': 'ロ',

	    'wa': 'ワ',

	    'ga': '\u30AC',
	    'gi': '\u30AE',
	    'gu': '\u30B0',
	    'ge': '\u30B2',
	    'go': '\u30B4',

	    'za': '\u30B6',
	    'zi': ['\u30B8', '\u30C2'],
	    'zu': ['\u30BA', '\u30C5'],
	    'ze': '\u30BC',
	    'zo': '\u30BE',

	    'da': '\u30C0',
	    'de': '\u30C7',
	    'do': '\u30C9',

	    'ba': '\u30D0',
	    'bi': '\u30D3',
	    'bu': '\u30D6',
	    'be': '\u30D9',
	    'bo': '\u30DC',

	    'pa': '\u30D1',
	    'pi': '\u30D4',
	    'pu': '\u30D7',
	    'pe': '\u30DA',
	    'po': '\u30DD',

	    // 拗音

	    'kya': 'キャ',
	    'kyu': 'キュ',
	    'kyo': 'キョ',

	    'sya': 'シャ',
	    'syu': 'シュ',
	    'syo': 'ショ',

	    'tya': 'チャ',
	    'tyu': 'チュ',
	    'tyo': 'チョ',

	    'nya': 'ニャ',
	    'nyu': 'ニュ',
	    'nyo': 'ニョ',

	    'hya': 'ヒャ',
	    'hyu': 'ヒュ',
	    'hyo': 'ヒョ',

	    'mya': 'ミャ',
	    'myu': 'ミュ',
	    'myo': 'ミョ',

	    'rya': 'リャ',
	    'ryu': 'リュ',
	    'ryo': 'リョ',

	    'gya': '\u30AEャ',
	    'gyu': '\u30AEュ',
	    'gyo': '\u30AEョ',

	    'zya': ['\u30B8ャ', '\u30C2ャ'],
	    'zyu': ['\u30B8ュ', '\u30C2ュ'],
	    'zyo': ['\u30B8ョ', '\u30C2ョ'],

	    'bya': '\u30D3ャ',
	    'byu': '\u30D3ュ',
	    'byo': '\u30D3ョ',

	    'pya': '\u30D4ャ',
	    'pyu': '\u30D4ュ',
	    'pyo': '\u30D4ョ',

        // 促音

        'kka': 'ッカ',
        'kki': 'ッキ',
        'kku': 'ック',
        'kke': 'ッケ',
        'kko': 'ッコ',

        'ssa': 'ッサ',
        'ssi': 'ッシ',
        'ssu': 'ッス',
        'sse': 'ッセ',
        'sso': 'ッソ',

	    'tta': 'ッタ',
	    'tti': 'ッチ',
	    'ttu': 'ッツ',
	    'tte': 'ッテ',
	    'tto': 'ット',

	    'nna': 'ッナ',
	    'nni': 'ッニ',
	    'nnu': 'ッヌ',
	    'nne': 'ッネ',
	    'nno': 'ッノ',

        'hha': 'ッハ',
	    'hhi': 'ッヒ',
	    'hhu': 'ッフ',
	    'hhe': 'ッヘ',
	    'hho': 'ッホ',

	    'mma': 'ッマ',
	    'mmi': 'ッミ',
	    'mmu': 'ッム',
	    'mme': 'ッメ',
	    'mmo': 'ッモ',

	    'yya': 'ッヤ',
	    'yyu': 'ッユ',
	    'yyo': 'ッヨ',

	    'rra': 'ッラ',
	    'rri': 'ッリ',
	    'rru': 'ッル',
	    'rre': 'ッレ',
	    'rro': 'ッロ',

	    'wwa': 'ッワ',

	    'gga': 'ッ\u30AC',
	    'ggi': 'ッ\u30AE',
	    'ggu': 'ッ\u30B0',
	    'gge': 'ッ\u30B2',
	    'ggo': 'ッ\u30B4',

	    'zza': 'ッ\u30B6',
	    'zzi': ['ッ\u30B8', 'ッ\u30C2'],
	    'zzu': ['ッ\u30BA', 'ッ\u30C5'],
	    'zze': 'ッ\u30BC',
	    'zzo': 'ッ\u30BE',

	    'dda': 'ッ\u30C0',
	    'dde': 'ッ\u30C7',
	    'ddo': 'ッ\u30C9',

	    'bba': 'ッ\u30D0',
	    'bbi': 'ッ\u30D3',
	    'bbu': 'ッ\u30D6',
	    'bbe': 'ッ\u30D9',
	    'bbo': 'ッ\u30DC',

	    'ppa': 'ッ\u30D1',
	    'ppi': 'ッ\u30D4',
	    'ppu': 'ッ\u30D7',
	    'ppe': 'ッ\u30DA',
	    'ppo': 'ッ\u30DD',

	    // 促音 + 拗音

	    'kkya': 'ッキャ',
	    'kkyu': 'ッキュ',
	    'kkyo': 'ッキョ',

	    'ssya': 'ッシャ',
	    'ssyu': 'ッシュ',
	    'ssyo': 'ッショ',

	    'ttya': 'ッチャ',
	    'ttyu': 'ッチュ',
	    'ttyo': 'ッチョ',

	    'nnya': 'ッニャ',
	    'nnyu': 'ッニュ',
	    'nnyo': 'ッニョ',

	    'hhya': 'ッヒャ',
	    'hhyu': 'ッヒュ',
	    'hhyo': 'ッヒョ',

	    'mmya': 'ッミャ',
	    'mmyu': 'ッミュ',
	    'mmyo': 'ッミョ',

	    'rrya': 'ッリャ',
	    'rryu': 'ッリュ',
	    'rryo': 'ッリョ',

	    'ggya': 'ッ\u30AEャ',
	    'ggyu': 'ッ\u30AEュ',
	    'ggyo': 'ッ\u30AEョ',

	    'zzya': ['ッ\u30B8ャ', 'ッ\u30C2ャ'],
	    'zzyu': ['ッ\u30B8ュ', 'ッ\u30C2ュ'],
	    'zzyo': ['ッ\u30B8ョ', 'ッ\u30C2ョ'],

	    'bbya': 'ッ\u30D3ャ',
	    'bbyu': 'ッ\u30D3ュ',
	    'bbyo': 'ッ\u30D3ョ',

	    'ppya': 'ッ\u30D4ャ',
	    'ppyu': 'ッ\u30D4ュ',
	    'ppyo': 'ッ\u30D4ョ',

        // Others

        "n'": 'ン',
        'n': 'ン',
        ' ': ' '
    };

    /**
     * Romaji to Katakana convert table, based on 訓令式 第1表 + 第2表
     * http://xembho.s59.xrea.com/siryoo/naikaku_kokuzi.html
     *
     * Not supported about circumflexed character long vowel (長音)
     *
     * See also Wikipedia page about Roman alphabet
     * http://ja.wikipedia.org/wiki/%E3%83%AD%E3%83%BC%E3%83%9E%E5%AD%97
     */
    var kunrei_2_romaji_to_katakana = {

        // 第2表

	    'sha': 'シャ',
	    'shi': 'シ',
	    'shu': 'シュ',
	    'sho': 'ショ',

	    'tsu': 'ツ',

	    'cha': 'チャ',
	    'chi': 'チ',
	    'chu': 'チュ',
	    'cho': 'チョ',

	    'fu': 'フ',

	    'ja': '\u30B8ャ',
	    'ji': '\u30B8',
	    'ju': '\u30B8ュ',
	    'jo': '\u30B8ョ',

	    'di': '\u30C2',
	    'du': '\u30C5',

	    'dya': '\u30C2ャ',
	    'dyu': '\u30C2ュ',
	    'dyo': '\u30C2ョ',

	    'kwa': 'クヮ',
	    'gwa': '\u30B0ヮ',
	    'wo': 'ヲ',

        // 第2表 促音

        'ssha': 'ッシャ',
	    'sshi': 'ッシ',
	    'sshu': 'ッシュ',
	    'ssho': 'ッショ',

	    'ttsu': 'ッツ',

	    'ccha': 'ッチャ',
	    'cchi': 'ッチ',
	    'cchu': 'ッチュ',
	    'ccho': 'ッチョ',

	    'ffu': 'ッフ',

	    'jja': 'ッ\u30B8ャ',
	    'jji': 'ッ\u30B8',
	    'jju': 'ッ\u30B8ュ',
	    'jjo': 'ッ\u30B8ョ',

	    'ddi': 'ッ\u30C2',
	    'ddu': 'ッ\u30C5',

	    'ddya': 'ッ\u30C2ャ',
	    'ddyu': 'ッ\u30C2ュ',
	    'ddyo': 'ッ\u30C2ョ',

	    'kkwa': 'ックヮ',
	    'ggwa': 'ッ\u30B0ヮ',
	    'wwo': 'ッヲ',

        // 以下、第1表と同じ

	    'a': 'ア',
	    'i': 'イ',
	    'u': 'ウ',
	    'e': 'エ',
	    'o': ['オ', 'ヲ'],

	    'ka': 'カ',
	    'ki': 'キ',
	    'ku': 'ク',
	    'ke': 'ケ',
	    'ko': 'コ',

	    'sa': 'サ',
	    'si': 'シ',
	    'su': 'ス',
	    'se': 'セ',
	    'so': 'ソ',

	    'ta': 'タ',
	    'ti': 'チ',
	    'tu': 'ツ',
	    'te': 'テ',
	    'to': 'ト',

	    'na': 'ナ',
	    'ni': 'ニ',
	    'nu': 'ヌ',
	    'ne': 'ネ',
	    'no': 'ノ',

	    'ha': 'ハ',
	    'hi': 'ヒ',
	    'hu': 'フ',
	    'he': 'ヘ',
	    'ho': 'ホ',

	    'ma': 'マ',
	    'mi': 'ミ',
	    'mu': 'ム',
	    'me': 'メ',
	    'mo': 'モ',

	    'ya': 'ヤ',
	    'yu': 'ユ',
	    'yo': 'ヨ',

	    'ra': 'ラ',
	    'ri': 'リ',
	    'ru': 'ル',
	    're': 'レ',
	    'ro': 'ロ',

	    'wa': 'ワ',

	    'ga': '\u30AC',
	    'gi': '\u30AE',
	    'gu': '\u30B0',
	    'ge': '\u30B2',
	    'go': '\u30B4',

	    'za': '\u30B6',
	    'zi': ['\u30B8', '\u30C2'],
	    'zu': ['\u30BA', '\u30C5'],
	    'ze': '\u30BC',
	    'zo': '\u30BE',

	    'da': '\u30C0',
	    'de': '\u30C7',
	    'do': '\u30C9',

	    'ba': '\u30D0',
	    'bi': '\u30D3',
	    'bu': '\u30D6',
	    'be': '\u30D9',
	    'bo': '\u30DC',

	    'pa': '\u30D1',
	    'pi': '\u30D4',
	    'pu': '\u30D7',
	    'pe': '\u30DA',
	    'po': '\u30DD',

	    // 拗音

	    'kya': 'キャ',
	    'kyu': 'キュ',
	    'kyo': 'キョ',

	    'sya': 'シャ',
	    'syu': 'シュ',
	    'syo': 'ショ',

	    'tya': 'チャ',
	    'tyu': 'チュ',
	    'tyo': 'チョ',

	    'nya': 'ニャ',
	    'nyu': 'ニュ',
	    'nyo': 'ニョ',

	    'hya': 'ヒャ',
	    'hyu': 'ヒュ',
	    'hyo': 'ヒョ',

	    'mya': 'ミャ',
	    'myu': 'ミュ',
	    'myo': 'ミョ',

	    'rya': 'リャ',
	    'ryu': 'リュ',
	    'ryo': 'リョ',

	    'gya': '\u30AEャ',
	    'gyu': '\u30AEュ',
	    'gyo': '\u30AEョ',

	    'zya': ['\u30B8ャ', '\u30C2ャ'],
	    'zyu': ['\u30B8ュ', '\u30C2ュ'],
	    'zyo': ['\u30B8ョ', '\u30C2ョ'],

	    'bya': '\u30D3ャ',
	    'byu': '\u30D3ュ',
	    'byo': '\u30D3ョ',

	    'pya': '\u30D4ャ',
	    'pyu': '\u30D4ュ',
	    'pyo': '\u30D4ョ',

        // 促音

        'kka': 'ッカ',
        'kki': 'ッキ',
        'kku': 'ック',
        'kke': 'ッケ',
        'kko': 'ッコ',

        'ssa': 'ッサ',
        'ssi': 'ッシ',
        'ssu': 'ッス',
        'sse': 'ッセ',
        'sso': 'ッソ',

	    'tta': 'ッタ',
	    'tti': 'ッチ',
	    'ttu': 'ッツ',
	    'tte': 'ッテ',
	    'tto': 'ット',

	    'nna': 'ッナ',
	    'nni': 'ッニ',
	    'nnu': 'ッヌ',
	    'nne': 'ッネ',
	    'nno': 'ッノ',

        'hha': 'ッハ',
	    'hhi': 'ッヒ',
	    'hhu': 'ッフ',
	    'hhe': 'ッヘ',
	    'hho': 'ッホ',

	    'mma': 'ッマ',
	    'mmi': 'ッミ',
	    'mmu': 'ッム',
	    'mme': 'ッメ',
	    'mmo': 'ッモ',

	    'yya': 'ッヤ',
	    'yyu': 'ッユ',
	    'yyo': 'ッヨ',

	    'rra': 'ッラ',
	    'rri': 'ッリ',
	    'rru': 'ッル',
	    'rre': 'ッレ',
	    'rro': 'ッロ',

	    'wwa': 'ッワ',

	    'gga': 'ッ\u30AC',
	    'ggi': 'ッ\u30AE',
	    'ggu': 'ッ\u30B0',
	    'gge': 'ッ\u30B2',
	    'ggo': 'ッ\u30B4',

	    'zza': 'ッ\u30B6',
	    'zzi': ['ッ\u30B8', 'ッ\u30C2'],
	    'zzu': ['ッ\u30BA', 'ッ\u30C5'],
	    'zze': 'ッ\u30BC',
	    'zzo': 'ッ\u30BE',

	    'dda': 'ッ\u30C0',
	    'dde': 'ッ\u30C7',
	    'ddo': 'ッ\u30C9',

	    'bba': 'ッ\u30D0',
	    'bbi': 'ッ\u30D3',
	    'bbu': 'ッ\u30D6',
	    'bbe': 'ッ\u30D9',
	    'bbo': 'ッ\u30DC',

	    'ppa': 'ッ\u30D1',
	    'ppi': 'ッ\u30D4',
	    'ppu': 'ッ\u30D7',
	    'ppe': 'ッ\u30DA',
	    'ppo': 'ッ\u30DD',

	    // 促音 + 拗音

	    'kkya': 'ッキャ',
	    'kkyu': 'ッキュ',
	    'kkyo': 'ッキョ',

	    'ssya': 'ッシャ',
	    'ssyu': 'ッシュ',
	    'ssyo': 'ッショ',

	    'ttya': 'ッチャ',
	    'ttyu': 'ッチュ',
	    'ttyo': 'ッチョ',

	    'nnya': 'ッニャ',
	    'nnyu': 'ッニュ',
	    'nnyo': 'ッニョ',

	    'hhya': 'ッヒャ',
	    'hhyu': 'ッヒュ',
	    'hhyo': 'ッヒョ',

	    'mmya': 'ッミャ',
	    'mmyu': 'ッミュ',
	    'mmyo': 'ッミョ',

	    'rrya': 'ッリャ',
	    'rryu': 'ッリュ',
	    'rryo': 'ッリョ',

	    'ggya': 'ッ\u30AEャ',
	    'ggyu': 'ッ\u30AEュ',
	    'ggyo': 'ッ\u30AEョ',

	    'zzya': ['ッ\u30B8ャ', 'ッ\u30C2ャ'],
	    'zzyu': ['ッ\u30B8ュ', 'ッ\u30C2ュ'],
	    'zzyo': ['ッ\u30B8ョ', 'ッ\u30C2ョ'],

	    'bbya': 'ッ\u30D3ャ',
	    'bbyu': 'ッ\u30D3ュ',
	    'bbyo': 'ッ\u30D3ョ',

	    'ppya': 'ッ\u30D4ャ',
	    'ppyu': 'ッ\u30D4ュ',
	    'ppyo': 'ッ\u30D4ョ',

        // Others

        "n'": 'ン',
        'n': 'ン',
        ' ': ' '
    };

    /**
     * Romaji to Katakana convert table, based on BS 4812 : 1972 (英国規格 ヘ\u30DCン式)
     * http://halcat.com/roomazi/doc/bs4812.html
     *
     * Not supported about macroned character long vowel (長音),
     * and special pattern of foreign origin (外来語)
     *
     * See also Wikipedia page about Roman alphabet
     * http://ja.wikipedia.org/wiki/%E3%83%AD%E3%83%BC%E3%83%9E%E5%AD%97
     */
    var hepburn_bs_romaji_to_katakana = {
	    'a': 'ア',
	    'i': 'イ',
	    'u': 'ウ',
	    'e': ['エ', 'ヘ'],  // 助詞の <ヘ>
	    'o': ['オ', 'ヲ'],  // 助詞の <ヲ>

	    'ka': 'カ',
	    'ki': 'キ',
	    'ku': 'ク',
	    'ke': 'ケ',
	    'ko': 'コ',

	    'sa': 'サ',
	    'shi': 'シ',
	    'su': 'ス',
	    'se': 'セ',
	    'so': 'ソ',

	    'ta': 'タ',
	    'chi': 'チ',
	    'tsu': 'ツ',
	    'te': 'テ',
	    'to': 'ト',

	    'na': 'ナ',
	    'ni': 'ニ',
	    'nu': 'ヌ',
	    'ne': 'ネ',
	    'no': 'ノ',

	    'ha': 'ハ',
	    'hi': 'ヒ',
	    'fu': 'フ',
	    'he': 'ヘ',
	    'ho': 'ホ',

	    'ma': 'マ',
	    'mi': 'ミ',
	    'mu': 'ム',
	    'me': 'メ',
	    'mo': 'モ',

	    'ya': 'ヤ',
	    'yu': 'ユ',
	    'yo': 'ヨ',

	    'ra': 'ラ',
	    'ri': 'リ',
	    'ru': 'ル',
	    're': 'レ',
	    'ro': 'ロ',

	    'wa': ['ワ', 'ハ'],  // 助詞の <ハ>
        'wo': 'ヲ',  // 外来語の <ヲ>

	    'ga': '\u30AC',
	    'gi': '\u30AE',
	    'gu': '\u30B0',
	    'ge': '\u30B2',
	    'go': '\u30B4',

	    'za': '\u30B6',
	    'ji': ['\u30B8', '\u30C2'],
	    'zu': ['\u30BA', '\u30C5'],
	    'ze': '\u30BC',
	    'zo': '\u30BE',

	    'da': '\u30C0',
	    'de': '\u30C7',
	    'do': '\u30C9',

	    'ba': '\u30D0',
	    'bi': '\u30D3',
	    'bu': '\u30D6',
	    'be': '\u30D9',
	    'bo': '\u30DC',

	    'pa': '\u30D1',
	    'pi': '\u30D4',
	    'pu': '\u30D7',
	    'pe': '\u30DA',
	    'po': '\u30DD',

	    // 拗音

	    'kya': 'キャ',
	    'kyu': 'キュ',
	    'kyo': 'キョ',

	    'sha': 'シャ',
	    'shu': 'シュ',
	    'sho': 'ショ',

	    'cha': 'チャ',
	    'chu': 'チュ',
	    'cho': 'チョ',

	    'nya': 'ニャ',
	    'nyu': 'ニュ',
	    'nyo': 'ニョ',

	    'hya': 'ヒャ',
	    'hyu': 'ヒュ',
	    'hyo': 'ヒョ',

	    'mya': 'ミャ',
	    'myu': 'ミュ',
	    'myo': 'ミョ',

	    'rya': 'リャ',
	    'ryu': 'リュ',
	    'ryo': 'リョ',

	    'gya': '\u30AEャ',
	    'gyu': '\u30AEュ',
	    'gyo': '\u30AEョ',

	    'ja': ['\u30B8ャ', '\u30C2ャ'],
	    'ju': ['\u30B8ュ', '\u30C2ュ'],
	    'jo': ['\u30B8ョ', '\u30C2ョ'],

	    'bya': '\u30D3ャ',
	    'byu': '\u30D3ュ',
	    'byo': '\u30D3ョ',

	    'pya': '\u30D4ャ',
	    'pyu': '\u30D4ュ',
	    'pyo': '\u30D4ョ',

        // 促音

        'kka': 'ッカ',
        'kki': 'ッキ',
        'kku': 'ック',
        'kke': 'ッケ',
        'kko': 'ッコ',

        'ssa': 'ッサ',
	    'sshi': 'ッシ',
        'ssu': 'ッス',
        'sse': 'ッセ',
        'sso': 'ッソ',

	    'tta': 'ッタ',
	    'tchi': 'ッチ',
	    'ttsu': 'ッツ',
	    'tte': 'ッテ',
	    'tto': 'ット',

	    'nna': 'ッナ',
	    'nni': 'ッニ',
	    'nnu': 'ッヌ',
	    'nne': 'ッネ',
	    'nno': 'ッノ',

        'hha': 'ッハ',
	    'hhi': 'ッヒ',
	    'ffu': 'ッフ',
	    'hhe': 'ッヘ',
	    'hho': 'ッホ',

	    'mma': 'ッマ',
	    'mmi': 'ッミ',
	    'mmu': 'ッム',
	    'mme': 'ッメ',
	    'mmo': 'ッモ',

	    'yya': 'ッヤ',
	    'yyu': 'ッユ',
	    'yyo': 'ッヨ',

	    'rra': 'ッラ',
	    'rri': 'ッリ',
	    'rru': 'ッル',
	    'rre': 'ッレ',
	    'rro': 'ッロ',

	    'wwa': ['ッワ', 'ッハ'],  // 助詞の <ハ>
        'wwo': 'ッヲ',  // 外来語の <ヲ>

	    'gga': 'ッ\u30AC',
	    'ggi': 'ッ\u30AE',
	    'ggu': 'ッ\u30B0',
	    'gge': 'ッ\u30B2',
	    'ggo': 'ッ\u30B4',

	    'zza': 'ッ\u30B6',
	    'jji': ['ッ\u30B8', 'ッ\u30C2'],
	    'zzu': ['ッ\u30BA', 'ッ\u30C5'],
	    'zze': 'ッ\u30BC',
	    'zzo': 'ッ\u30BE',

	    'dda': 'ッ\u30C0',
	    'dde': 'ッ\u30C7',
	    'ddo': 'ッ\u30C9',

	    'bba': 'ッ\u30D0',
	    'bbi': 'ッ\u30D3',
	    'bbu': 'ッ\u30D6',
	    'bbe': 'ッ\u30D9',
	    'bbo': 'ッ\u30DC',

	    'ppa': 'ッ\u30D1',
	    'ppi': 'ッ\u30D4',
	    'ppu': 'ッ\u30D7',
	    'ppe': 'ッ\u30DA',
	    'ppo': 'ッ\u30DD',

	    // 促音 + 拗音

	    'kkya': 'ッキャ',
	    'kkyu': 'ッキュ',
	    'kkyo': 'ッキョ',

	    'ssha': 'ッシャ',
	    'sshu': 'ッシュ',
	    'ssho': 'ッショ',

	    'tcha': 'ッチャ',
	    'tchu': 'ッチュ',
	    'tcho': 'ッチョ',

	    'nnya': 'ッニャ',
	    'nnyu': 'ッニュ',
	    'nnyo': 'ッニョ',

	    'hhya': 'ッヒャ',
	    'hhyu': 'ッヒュ',
	    'hhyo': 'ッヒョ',

	    'mmya': 'ッミャ',
	    'mmyu': 'ッミュ',
	    'mmyo': 'ッミョ',

	    'rrya': 'ッリャ',
	    'rryu': 'ッリュ',
	    'rryo': 'ッリョ',

	    'ggya': 'ッ\u30AEャ',
	    'ggyu': 'ッ\u30AEュ',
	    'ggyo': 'ッ\u30AEョ',

	    'jja': ['ッ\u30B8ャ', 'ッ\u30C2ャ'],
	    'jju': ['ッ\u30B8ュ', 'ッ\u30C2ュ'],
	    'jjo': ['ッ\u30B8ョ', 'ッ\u30C2ョ'],

	    'bbya': 'ッ\u30D3ャ',
	    'bbyu': 'ッ\u30D3ュ',
	    'bbyo': 'ッ\u30D3ョ',

	    'ppya': 'ッ\u30D4ャ',
	    'ppyu': 'ッ\u30D4ュ',
	    'ppyo': 'ッ\u30D4ョ',

        // Others

        "n'": 'ン',
        'n': 'ン',
        ' ': ' '
    };

    /**
     * Romaji to Katakana convert table, based on \u30D1ス\u30DDート式
     * http://www.seikatubunka.metro.tokyo.jp/hebon/index.html
     * http://www.pref.aichi.jp/0000003565.html
     * http://www.pref.aichi.jp/0000003567.html
     */
    var passport_romaji_to_katakana = {
	    'a': 'ア',
	    'i': 'イ',
	    'u': ['ウ', 'ウウ'],
	    'e': 'エ',
	    'o': ['オ', 'ヲ', 'オウ', 'オオ'],

	    'ka': 'カ',
	    'ki': 'キ',
	    'ku': ['ク', 'クウ'],
	    'ke': 'ケ',
	    'ko': ['コ', 'コウ', 'コオ'],

	    'sa': 'サ',
	    'shi': 'シ',
	    'su': ['ス', 'スウ'],
	    'se': 'セ',
	    'so': ['ソ', 'ソウ', 'ソオ'],

	    'ta': 'タ',
	    'chi': 'チ',
	    'tsu': ['ツ', 'ツウ'],
	    'te': 'テ',
	    'to': ['ト', 'トウ', 'トオ'],

	    'na': 'ナ',
	    'ni': 'ニ',
	    'nu': ['ヌ', 'ヌウ'],
	    'ne': 'ネ',
	    'no': ['ノ', 'ノウ', 'ノオ'],

	    'ha': 'ハ',
	    'hi': 'ヒ',
	    'fu': ['フ', 'フウ'],
	    'he': 'ヘ',
	    'ho': ['ホ', 'ホウ', 'ホオ'],

	    'ma': 'マ',
	    'mi': 'ミ',
	    'mu': ['ム', 'ムウ'],
        'me': 'メ',
	    'mo': ['モ', 'モウ', 'モオ'],

	    'ya': 'ヤ',
	    'yu': ['ユ', 'ユウ'],
	    'yo': ['ヨ', 'ヨウ', 'ヨオ'],

	    'ra': 'ラ',
	    'ri': 'リ',
	    'ru': ['ル', 'ルウ'],
	    're': 'レ',
	    'ro': ['ロ', 'ロウ', 'ロオ'],

	    'wa': 'ワ',

	    'ga': '\u30AC',
	    'gi': '\u30AE',
	    'gu': ['\u30B0', '\u30B0ウ'],
	    'ge': '\u30B2',
	    'go': ['\u30B4', '\u30B4ウ', '\u30B4オ'],

	    'za': '\u30B6',
	    'ji': ['\u30B8', '\u30C2'],
	    'zu': ['\u30BA', '\u30C5', '\u30BAウ', '\u30C5ウ'],
	    'ze': '\u30BC',
	    'zo': ['\u30BE', '\u30BEウ', '\u30BEオ'],

	    'da': '\u30C0',
	    'de': '\u30C7',
	    'do': ['\u30C9', '\u30C9ウ', '\u30C9オ'],

	    'ba': '\u30D0',
	    'bi': '\u30D3',
	    'bu': ['\u30D6', '\u30D6ウ'],
	    'be': '\u30D9',
	    'bo': ['\u30DC', '\u30DCウ', '\u30DCオ'],

	    'pa': '\u30D1',
	    'pi': '\u30D4',
	    'pu': ['\u30D7', '\u30D7ウ'],
	    'pe': '\u30DA',
	    'po': ['\u30DD', '\u30DDウ', '\u30DDオ'],

	    // 拗音

	    'kya': 'キャ',
	    'kyu': ['キュ', 'キュウ'],
	    'kyo': ['キョ', 'キョウ', 'キョオ'],

	    'sha': 'シャ',
	    'shu': ['シュ', 'シュウ'],
	    'sho': ['ショ', 'ショウ', 'ショオ'],

	    'cha': 'チャ',
	    'chu': ['チュ', 'チュウ'],
	    'cho': ['チョ', 'チョウ', 'チョオ'],

	    'nya': 'ニャ',
	    'nyu': ['ニュ', 'ニュウ'],
	    'nyo': ['ニョ', 'ニョウ', 'ニョオ'],

	    'hya': 'ヒャ',
	    'hyu': ['ヒュ', 'ヒュウ'],
	    'hyo': ['ヒョ', 'ヒョウ', 'ヒョオ'],

	    'mya': 'ミャ',
	    'myu': ['ミュ', 'ミュウ'],
	    'myo': ['ミョ', 'ミョウ', 'ミョオ'],

	    'rya': 'リャ',
	    'ryu': ['リュ', 'リュウ'],
	    'ryo': ['リョ', 'リョウ', 'リョオ'],

	    'gya': '\u30AEャ',
	    'gyu': ['\u30AEュ', '\u30AEュウ'],
	    'gyo': ['\u30AEョ', '\u30AEョウ', '\u30AEョオ'],

	    'ja': ['\u30B8ャ', '\u30C2ャ'],
	    'ju': ['\u30B8ュ', '\u30C2ュ', '\u30B8ュウ', '\u30C2ュウ'],
	    'jo': ['\u30B8ョ', '\u30C2ョ', '\u30B8ョウ', '\u30C2ョウ', '\u30B8ョオ', '\u30C2ョオ'],

	    'bya': '\u30D3ャ',
	    'byu': ['\u30D3ュ', '\u30D3ュウ'],
	    'byo': ['\u30D3ョ', '\u30D3ョウ', '\u30D3ョオ'],

	    'pya': '\u30D4ャ',
	    'pyu': ['\u30D4ュ', '\u30D4ュウ'],
	    'pyo': ['\u30D4ョ', '\u30D4ョウ', '\u30D4ョオ'],

        // 促音

        'kka': 'ッカ',
        'kki': 'ッキ',
        'kku': ['ック', 'ックウ'],
        'kke': 'ッケ',
        'kko': ['ッコ', 'ッコウ', 'ッコオ'],

        'ssa': 'ッサ',
	    'sshi': 'ッシ',
        'ssu': ['ッス', 'ッスウ'],
        'sse': 'ッセ',
        'sso': ['ッソ', 'ッソウ', 'ッソオ'],

	    'tta': 'ッタ',
	    'tchi': 'ッチ',
	    'ttsu': ['ッツ', 'ッツウ'],
	    'tte': 'ッテ',
	    'tto': ['ット', 'ットウ', 'ットオ'],

	    'nna': 'ッナ',
	    'nni': 'ッニ',
	    'nnu': ['ッヌ', 'ッヌウ'],
	    'nne': 'ッネ',
	    'nno': ['ッノ', 'ッノウ', 'ッノオ'],

        'hha': 'ッハ',
	    'hhi': 'ッヒ',
	    'ffu': ['ッフ', 'ッフウ'],
	    'hhe': 'ッヘ',
	    'hho': ['ッホ', 'ッホウ', 'ッホオ'],

	    'mma': 'ッマ',
	    'mmi': 'ッミ',
	    'mmu': ['ッム', 'ッムウ'],
        'mme': 'ッメ',
	    'mmo': ['ッモ', 'ッモウ', 'ッモオ'],

	    'yya': 'ッヤ',
	    'yyu': ['ッユ', 'ッユウ'],
	    'yyo': ['ッヨ', 'ッヨウ', 'ッヨオ'],

	    'rra': 'ッラ',
	    'rri': 'ッリ',
	    'rru': ['ッル', 'ッルウ'],
	    'rre': 'ッレ',
	    'rro': ['ッロ', 'ッロウ', 'ッロオ'],

	    'wwa': 'ッワ',

	    'gga': 'ッ\u30AC',
	    'ggi': 'ッ\u30AE',
	    'ggu': ['ッ\u30B0', 'ッ\u30B0ウ'],
	    'gge': 'ッ\u30B2',
	    'ggo': ['ッ\u30B4', 'ッ\u30B4ウ', 'ッ\u30B4オ'],

	    'zza': 'ッ\u30B6',
	    'jji': ['ッ\u30B8', 'ッ\u30C2'],
	    'zzu': ['ッ\u30BA', 'ッ\u30C5', 'ッ\u30BAウ', 'ッ\u30C5ウ'],
	    'zze': 'ッ\u30BC',
	    'zzo': ['ッ\u30BE', 'ッ\u30BEウ', 'ッ\u30BEオ'],

	    'dda': 'ッ\u30C0',
	    'dde': 'ッ\u30C7',
	    'ddo': ['ッ\u30C9', 'ッ\u30C9ウ', 'ッ\u30C9オ'],

	    'bba': 'ッ\u30D0',
	    'bbi': 'ッ\u30D3',
	    'bbu': ['ッ\u30D6', 'ッ\u30D6ウ'],
	    'bbe': 'ッ\u30D9',
	    'bbo': ['ッ\u30DC', 'ッ\u30DCウ', 'ッ\u30DCオ'],

	    'ppa': 'ッ\u30D1',
	    'ppi': 'ッ\u30D4',
	    'ppu': ['ッ\u30D7', 'ッ\u30D7ウ'],
	    'ppe': 'ッ\u30DA',
	    'ppo': ['ッ\u30DD', 'ッ\u30DDウ', 'ッ\u30DDオ'],

	    // 促音 + 拗音

	    'kkya': 'ッキャ',
	    'kkyu': ['ッキュ', 'ッキュウ'],
	    'kkyo': ['ッキョ', 'ッキョウ', 'ッキョオ'],

	    'ssha': 'ッシャ',
	    'sshu': ['ッシュ', 'ッシュウ'],
	    'ssho': ['ッショ', 'ッショウ', 'ッショオ'],

        'tcha': 'ッチャ',
	    'tchu': ['ッチュ', 'ッチュウ'],
	    'tcho': ['ッチョ', 'ッチョウ', 'ッチョオ'],

	    'nnya': 'ッニャ',
	    'nnyu': ['ッニュ', 'ッニュウ'],
	    'nnyo': ['ッニョ', 'ッニョウ', 'ッニョオ'],

	    'hhya': 'ッヒャ',
	    'hhyu': ['ッヒュ', 'ッヒュウ'],
	    'hhyo': ['ッヒョ', 'ッヒョウ', 'ッヒョオ'],

	    'mmya': 'ッミャ',
	    'mmyu': ['ッミュ', 'ッミュウ'],
	    'mmyo': ['ッミョ', 'ッミョウ', 'ッミョオ'],

	    'rrya': 'ッリャ',
	    'rryu': ['ッリュ', 'ッリュウ'],
	    'rryo': ['ッリョ', 'ッリョウ', 'ッリョオ'],

	    'ggya': 'ッ\u30AEャ',
	    'ggyu': ['ッ\u30AEュ', 'ッ\u30AEュウ'],
	    'ggyo': ['ッ\u30AEョ', 'ッ\u30AEョウ', 'ッ\u30AEョオ'],

	    'jja': ['ッ\u30B8ャ', 'ッ\u30C2ャ'],
	    'jju': ['ッ\u30B8ュ', 'ッ\u30C2ュ', 'ッ\u30B8ュウ', 'ッ\u30C2ュウ'],
	    'jjo': ['ッ\u30B8ョ', 'ッ\u30C2ョ', 'ッ\u30B8ョウ', 'ッ\u30C2ョウ', 'ッ\u30B8ョオ', 'ッ\u30C2ョオ'],

	    'bbya': 'ッ\u30D3ャ',
	    'bbyu': ['ッ\u30D3ュ', 'ッ\u30D3ュウ'],
	    'bbyo': ['ッ\u30D3ョ', 'ッ\u30D3ョウ', 'ッ\u30D3ョオ'],

	    'ppya': 'ッ\u30D4ャ',
	    'ppyu': ['ッ\u30D4ュ', 'ッ\u30D4ュウ'],
	    'ppyo': ['ッ\u30D4ョ', 'ッ\u30D4ョウ', 'ッ\u30D4ョオ'],

        // OH 長音

        'oh': ['オウ', 'オオ'],

        'koh': ['コウ', 'コオ'],
        'soh': ['ソウ', 'ソオ'],
        'toh': ['トウ', 'トオ'],
        'noh': ['ノウ', 'ノオ'],
        'hoh': ['ホウ', 'ホオ'],
        'moh': ['モウ', 'モオ'],
        'yoh': ['ヨウ', 'ヨオ'],
        'roh': ['ロウ', 'ロオ'],

        'goh': ['\u30B4ウ', '\u30B4オ'],
        'zoh': ['\u30BEウ', '\u30BEオ'],
        'doh': ['\u30C9ウ', '\u30C9オ'],
        'boh': ['\u30DCウ', '\u30DCオ'],
        'poh': ['\u30DDウ', '\u30DDオ'],

        'kyoh': ['キョウ', 'キョオ'],
        'shoh': ['ショウ', 'ショオ'],
        'choh': ['チョウ', 'チョオ'],
        'nyoh': ['ニョウ', 'ニョオ'],
        'hyoh': ['ヒョウ', 'ヒョオ'],
        'myoh': ['ミョウ', 'ミョオ'],
        'ryoh': ['リョウ', 'リョオ'],
        'gyoh': ['\u30AEョウ', '\u30AEョオ'],
        'joh': ['\u30B8ョウ', '\u30B8ョオ'],
        'byoh': ['\u30D3ョウ', '\u30D3ョオ'],
        'pyoh': ['\u30D4ョウ', '\u30D4ョオ'],

        // 促音 + OH 長音

        'kkoh': ['ッコウ', 'ッコオ'],
        'ssoh': ['ッソウ', 'ッソオ'],
        'ttoh': ['ットウ', 'ットオ'],
        'nnoh': ['ッノウ', 'ッノオ'],
        'hhoh': ['ッホウ', 'ッホオ'],
        'mmoh': ['ッモウ', 'ッモオ'],
        'yyoh': ['ッヨウ', 'ッヨオ'],
        'rroh': ['ッロウ', 'ッロオ'],

        'ggoh': ['ッ\u30B4ウ', 'ッ\u30B4オ'],
        'zzoh': ['ッ\u30BEウ', 'ッ\u30BEオ'],
        'ddoh': ['ッ\u30C9ウ', 'ッ\u30C9オ'],
        'bboh': ['ッ\u30DCウ', 'ッ\u30DCオ'],
        'ppoh': ['ッ\u30DDウ', 'ッ\u30DDオ'],

        'kkyoh': ['ッキョウ', 'ッキョオ'],
        'sshoh': ['ッショウ', 'ッショオ'],
        'tchoh': ['ッチョウ', 'ッチョオ'],
        'nnyoh': ['ッニョウ', 'ッニョオ'],
        'hhyoh': ['ッヒョウ', 'ッヒョオ'],
        'mmyoh': ['ッミョウ', 'ッミョオ'],
        'rryoh': ['ッリョウ', 'ッリョオ'],
        'ggyoh': ['ッ\u30AEョウ', 'ッ\u30AEョオ'],
        'jjoh': ['ッ\u30B8ョウ', 'ッ\u30B8ョオ'],
        'bbyoh': ['ッ\u30D3ョウ', 'ッ\u30D3ョオ'],
        'ppyoh': ['ッ\u30D4ョウ', 'ッ\u30D4ョオ'],

        'n': 'ン',
        ' ': ' ',

        'mma': 'ンマ',
	    'mmi': 'ンミ',
	    'mmu': ['ンム', 'ンムウ'],
	    'mme': 'ンメ',
	    'mmo': ['ンモ', 'ンモウ', 'ンモオ'],

	    'mba': 'ン\u30D0',
	    'mbi': 'ン\u30D3',
	    'mbu': ['ン\u30D6', 'ン\u30D6ウ'],
	    'mbe': 'ン\u30D9',
	    'mbo': ['ン\u30DC', 'ン\u30DCウ', 'ン\u30DCオ'],

	    'mpa': 'ン\u30D1',
	    'mpi': 'ン\u30D4',
	    'mpu': ['ン\u30D7', 'ン\u30D7ウ'],
	    'mpe': 'ン\u30DA',
	    'mpo': ['ン\u30DD', 'ン\u30DDウ', 'ン\u30DDオ']
    };

    // public methods or fields
    var Romaji2Katakana = {
        'converter': function(tables) {
            if (!tables) {
                // default convert table is ISO3602
                return CFST_.construct(iso_romaji_to_katakana);
            }

            var table = {};
            for (var i = 0; i < tables.length; i++) {
                if (tables[i] == null) {
                    continue;
                }
                table = CFST_.merge_table(table, tables[i]);
            }
            return CFST_.construct(table);
        },
        'iso': iso_romaji_to_katakana,
        'iso_strict': iso_strict_romaji_to_katakana,
        'kunrei': kunrei_romaji_to_katakana,
        'kunrei_2': kunrei_2_romaji_to_katakana,
        'hepburn_bs': hepburn_bs_romaji_to_katakana,
        'passport': passport_romaji_to_katakana
    };

    if ('undefined' == typeof module) {
	    // browser
	    window.Romaji2Katakana = Romaji2Katakana;
    } else {
	    // node
	    module.exports = Romaji2Katakana;
    }
})();
