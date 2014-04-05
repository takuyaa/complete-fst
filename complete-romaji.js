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

	    'ga': 'ガ',
	    'gi': 'ギ',
	    'gu': 'グ',
	    'ge': 'ゲ',
	    'go': 'ゴ',

	    'za': 'ザ',
	    'zi': ['ジ', 'ヂ'],
	    'zu': ['ズ', 'ヅ'],
	    'ze': 'ゼ',
	    'zo': 'ゾ',

	    'da': 'ダ',
	    'de': 'デ',
	    'do': 'ド',

	    'ba': 'バ',
	    'bi': 'ビ',
	    'bu': 'ブ',
	    'be': 'ベ',
	    'bo': 'ボ',

	    'pa': 'パ',
	    'pi': 'ピ',
	    'pu': 'プ',
	    'pe': 'ペ',
	    'po': 'ポ',

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

	    'gya': 'ギャ',
	    'gyu': 'ギュ',
	    'gyo': 'ギョ',

	    'zya': ['ジャ', 'ヂャ'],
	    'zyu': ['ジュ', 'ヂュ'],
	    'zyo': ['ジョ', 'ヂョ'],

	    'bya': 'ビャ',
	    'byu': 'ビュ',
	    'byo': 'ビョ',

	    'pya': 'ピャ',
	    'pyu': 'ピュ',
	    'pyo': 'ピョ',

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

        'gga': 'ッガ',
	    'ggi': 'ッギ',
	    'ggu': 'ッグ',
	    'gge': 'ッゲ',
	    'ggo': 'ッゴ',

	    'zza': 'ッザ',
	    'zzi': ['ッジ', 'ッヂ'],
	    'zzu': ['ッズ', 'ッヅ'],
	    'zze': 'ッゼ',
	    'zzo': 'ッゾ',

	    'dda': 'ッダ',
	    'dde': 'ッデ',
	    'ddo': 'ッド',

	    'bba': 'ッバ',
	    'bbi': 'ッビ',
	    'bbu': 'ッブ',
	    'bbe': 'ッベ',
	    'bbo': 'ッボ',

	    'ppa': 'ッパ',
	    'ppi': 'ッピ',
	    'ppu': 'ップ',
	    'ppe': 'ッペ',
	    'ppo': 'ッポ',

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

	    'ggya': 'ッギャ',
	    'ggyu': 'ッギュ',
	    'ggyo': 'ッギョ',

	    'zzya': ['ッジャ', 'ッヂャ'],
	    'zzyu': ['ッジュ', 'ッヂュ'],
	    'zzyo': ['ッジョ', 'ッヂョ'],

	    'bbya': 'ッビャ',
	    'bbyu': 'ッビュ',
	    'bbyo': 'ッビョ',

	    'ppya': 'ッピャ',
	    'ppyu': 'ッピュ',
	    'ppyo': 'ッピョ',

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

	    'ga': 'ガ',
	    'gi': 'ギ',
	    'gu': 'グ',
	    'ge': 'ゲ',
	    'go': 'ゴ',

	    'za': 'ザ',
	    'zi': 'ジ',
	    'zu': 'ズ',
	    'ze': 'ゼ',
	    'zo': 'ゾ',

	    'da': 'ダ',
	    'di': 'ヂ',
	    'du': 'ヅ',
	    'de': 'デ',
	    'do': 'ド',

	    'ba': 'バ',
	    'bi': 'ビ',
	    'bu': 'ブ',
	    'be': 'ベ',
	    'bo': 'ボ',

	    'pa': 'パ',
	    'pi': 'ピ',
	    'pu': 'プ',
	    'pe': 'ペ',
	    'po': 'ポ',

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

	    'gya': 'ギャ',
	    'gyu': 'ギュ',
	    'gyo': 'ギョ',

	    'zya': 'ジャ',
	    'zyu': 'ジュ',
	    'zyo': 'ジョ',

        'dya': 'ヂャ',
	    'dyu': 'ヂュ',
	    'dyo': 'ヂョ',

        'bya': 'ビャ',
	    'byu': 'ビュ',
	    'byo': 'ビョ',

	    'pya': 'ピャ',
	    'pyu': 'ピュ',
	    'pyo': 'ピョ',

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

	    'gga': 'ッガ',
	    'ggi': 'ッギ',
	    'ggu': 'ッグ',
	    'gge': 'ッゲ',
	    'ggo': 'ッゴ',

	    'zza': 'ッザ',
	    'zzi': 'ッジ',
	    'zzu': 'ッズ',
	    'zze': 'ッゼ',
	    'zzo': 'ッゾ',

	    'dda': 'ッダ',
	    'ddi': 'ッヂ',
	    'ddu': 'ッヅ',
	    'dde': 'ッデ',
	    'ddo': 'ッド',

	    'bba': 'ッバ',
	    'bbi': 'ッビ',
	    'bbu': 'ッブ',
	    'bbe': 'ッベ',
	    'bbo': 'ッボ',

	    'ppa': 'ッパ',
	    'ppi': 'ッピ',
	    'ppu': 'ップ',
	    'ppe': 'ッペ',
	    'ppo': 'ッポ',

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

	    'ggya': 'ッギャ',
	    'ggyu': 'ッギュ',
	    'ggyo': 'ッギョ',

	    'zzya': 'ッジャ',
	    'zzyu': 'ッジュ',
	    'zzyo': 'ッジョ',

        'ddya': 'ッヂャ',
	    'ddyu': 'ッヂュ',
	    'ddyo': 'ッヂョ',

        'bbya': 'ッビャ',
	    'bbyu': 'ッビュ',
	    'bbyo': 'ッビョ',

	    'ppya': 'ッピャ',
	    'ppyu': 'ッピュ',
	    'ppyo': 'ッピョ',

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

	    'ga': 'ガ',
	    'gi': 'ギ',
	    'gu': 'グ',
	    'ge': 'ゲ',
	    'go': 'ゴ',

	    'za': 'ザ',
	    'zi': ['ジ', 'ヂ'],
	    'zu': ['ズ', 'ヅ'],
	    'ze': 'ゼ',
	    'zo': 'ゾ',

	    'da': 'ダ',
	    'de': 'デ',
	    'do': 'ド',

	    'ba': 'バ',
	    'bi': 'ビ',
	    'bu': 'ブ',
	    'be': 'ベ',
	    'bo': 'ボ',

	    'pa': 'パ',
	    'pi': 'ピ',
	    'pu': 'プ',
	    'pe': 'ペ',
	    'po': 'ポ',

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

	    'gya': 'ギャ',
	    'gyu': 'ギュ',
	    'gyo': 'ギョ',

	    'zya': ['ジャ', 'ヂャ'],
	    'zyu': ['ジュ', 'ヂュ'],
	    'zyo': ['ジョ', 'ヂョ'],

	    'bya': 'ビャ',
	    'byu': 'ビュ',
	    'byo': 'ビョ',

	    'pya': 'ピャ',
	    'pyu': 'ピュ',
	    'pyo': 'ピョ',

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

	    'gga': 'ッガ',
	    'ggi': 'ッギ',
	    'ggu': 'ッグ',
	    'gge': 'ッゲ',
	    'ggo': 'ッゴ',

	    'zza': 'ッザ',
	    'zzi': ['ッジ', 'ッヂ'],
	    'zzu': ['ッズ', 'ッヅ'],
	    'zze': 'ッゼ',
	    'zzo': 'ッゾ',

	    'dda': 'ッダ',
	    'dde': 'ッデ',
	    'ddo': 'ッド',

	    'bba': 'ッバ',
	    'bbi': 'ッビ',
	    'bbu': 'ッブ',
	    'bbe': 'ッベ',
	    'bbo': 'ッボ',

	    'ppa': 'ッパ',
	    'ppi': 'ッピ',
	    'ppu': 'ップ',
	    'ppe': 'ッペ',
	    'ppo': 'ッポ',

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

	    'ggya': 'ッギャ',
	    'ggyu': 'ッギュ',
	    'ggyo': 'ッギョ',

	    'zzya': ['ッジャ', 'ッヂャ'],
	    'zzyu': ['ッジュ', 'ッヂュ'],
	    'zzyo': ['ッジョ', 'ッヂョ'],

	    'bbya': 'ッビャ',
	    'bbyu': 'ッビュ',
	    'bbyo': 'ッビョ',

	    'ppya': 'ッピャ',
	    'ppyu': 'ッピュ',
	    'ppyo': 'ッピョ',

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

	    'ja': 'ジャ',
	    'ji': 'ジ',
	    'ju': 'ジュ',
	    'jo': 'ジョ',

	    'di': 'ヂ',
	    'du': 'ヅ',

	    'dya': 'ヂャ',
	    'dyu': 'ヂュ',
	    'dyo': 'ヂョ',

	    'kwa': 'クヮ',
	    'gwa': 'グヮ',
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

	    'jja': 'ッジャ',
	    'jji': 'ッジ',
	    'jju': 'ッジュ',
	    'jjo': 'ッジョ',

	    'ddi': 'ッヂ',
	    'ddu': 'ッヅ',

	    'ddya': 'ッヂャ',
	    'ddyu': 'ッヂュ',
	    'ddyo': 'ッヂョ',

	    'kkwa': 'ックヮ',
	    'ggwa': 'ッグヮ',
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

	    'ga': 'ガ',
	    'gi': 'ギ',
	    'gu': 'グ',
	    'ge': 'ゲ',
	    'go': 'ゴ',

	    'za': 'ザ',
	    'zi': ['ジ', 'ヂ'],
	    'zu': ['ズ', 'ヅ'],
	    'ze': 'ゼ',
	    'zo': 'ゾ',

	    'da': 'ダ',
	    'de': 'デ',
	    'do': 'ド',

	    'ba': 'バ',
	    'bi': 'ビ',
	    'bu': 'ブ',
	    'be': 'ベ',
	    'bo': 'ボ',

	    'pa': 'パ',
	    'pi': 'ピ',
	    'pu': 'プ',
	    'pe': 'ペ',
	    'po': 'ポ',

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

	    'gya': 'ギャ',
	    'gyu': 'ギュ',
	    'gyo': 'ギョ',

	    'zya': ['ジャ', 'ヂャ'],
	    'zyu': ['ジュ', 'ヂュ'],
	    'zyo': ['ジョ', 'ヂョ'],

	    'bya': 'ビャ',
	    'byu': 'ビュ',
	    'byo': 'ビョ',

	    'pya': 'ピャ',
	    'pyu': 'ピュ',
	    'pyo': 'ピョ',

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

	    'gga': 'ッガ',
	    'ggi': 'ッギ',
	    'ggu': 'ッグ',
	    'gge': 'ッゲ',
	    'ggo': 'ッゴ',

	    'zza': 'ッザ',
	    'zzi': ['ッジ', 'ッヂ'],
	    'zzu': ['ッズ', 'ッヅ'],
	    'zze': 'ッゼ',
	    'zzo': 'ッゾ',

	    'dda': 'ッダ',
	    'dde': 'ッデ',
	    'ddo': 'ッド',

	    'bba': 'ッバ',
	    'bbi': 'ッビ',
	    'bbu': 'ッブ',
	    'bbe': 'ッベ',
	    'bbo': 'ッボ',

	    'ppa': 'ッパ',
	    'ppi': 'ッピ',
	    'ppu': 'ップ',
	    'ppe': 'ッペ',
	    'ppo': 'ッポ',

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

	    'ggya': 'ッギャ',
	    'ggyu': 'ッギュ',
	    'ggyo': 'ッギョ',

	    'zzya': ['ッジャ', 'ッヂャ'],
	    'zzyu': ['ッジュ', 'ッヂュ'],
	    'zzyo': ['ッジョ', 'ッヂョ'],

	    'bbya': 'ッビャ',
	    'bbyu': 'ッビュ',
	    'bbyo': 'ッビョ',

	    'ppya': 'ッピャ',
	    'ppyu': 'ッピュ',
	    'ppyo': 'ッピョ',

        // Others

        "n'": 'ン',
        'n': 'ン',
        ' ': ' '
    };

    /**
     * Romaji to Katakana convert table, based on BS 4812 : 1972 (英国規格 ヘボン式)
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

	    'ga': 'ガ',
	    'gi': 'ギ',
	    'gu': 'グ',
	    'ge': 'ゲ',
	    'go': 'ゴ',

	    'za': 'ザ',
	    'ji': ['ジ', 'ヂ'],
	    'zu': ['ズ', 'ヅ'],
	    'ze': 'ゼ',
	    'zo': 'ゾ',

	    'da': 'ダ',
	    'de': 'デ',
	    'do': 'ド',

	    'ba': 'バ',
	    'bi': 'ビ',
	    'bu': 'ブ',
	    'be': 'ベ',
	    'bo': 'ボ',

	    'pa': 'パ',
	    'pi': 'ピ',
	    'pu': 'プ',
	    'pe': 'ペ',
	    'po': 'ポ',

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

	    'gya': 'ギャ',
	    'gyu': 'ギュ',
	    'gyo': 'ギョ',

	    'ja': ['ジャ', 'ヂャ'],
	    'ju': ['ジュ', 'ヂュ'],
	    'jo': ['ジョ', 'ヂョ'],

	    'bya': 'ビャ',
	    'byu': 'ビュ',
	    'byo': 'ビョ',

	    'pya': 'ピャ',
	    'pyu': 'ピュ',
	    'pyo': 'ピョ',

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

	    'gga': 'ッガ',
	    'ggi': 'ッギ',
	    'ggu': 'ッグ',
	    'gge': 'ッゲ',
	    'ggo': 'ッゴ',

	    'zza': 'ッザ',
	    'jji': ['ッジ', 'ッヂ'],
	    'zzu': ['ッズ', 'ッヅ'],
	    'zze': 'ッゼ',
	    'zzo': 'ッゾ',

	    'dda': 'ッダ',
	    'dde': 'ッデ',
	    'ddo': 'ッド',

	    'bba': 'ッバ',
	    'bbi': 'ッビ',
	    'bbu': 'ッブ',
	    'bbe': 'ッベ',
	    'bbo': 'ッボ',

	    'ppa': 'ッパ',
	    'ppi': 'ッピ',
	    'ppu': 'ップ',
	    'ppe': 'ッペ',
	    'ppo': 'ッポ',

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

	    'ggya': 'ッギャ',
	    'ggyu': 'ッギュ',
	    'ggyo': 'ッギョ',

	    'jja': ['ッジャ', 'ッヂャ'],
	    'jju': ['ッジュ', 'ッヂュ'],
	    'jjo': ['ッジョ', 'ッヂョ'],

	    'bbya': 'ッビャ',
	    'bbyu': 'ッビュ',
	    'bbyo': 'ッビョ',

	    'ppya': 'ッピャ',
	    'ppyu': 'ッピュ',
	    'ppyo': 'ッピョ',

        // Others

        "n'": 'ン',
        'n': 'ン',
        ' ': ' '
    };

    /**
     * Romaji to Katakana convert table, based on パスポート式
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
	    'ko': ['コ', 'コウ'],

	    'sa': 'サ',
	    'shi': 'シ',
	    'su': ['ス', 'スウ'],
	    'se': 'セ',
	    'so': ['ソ', 'ソウ'],

	    'ta': 'タ',
	    'chi': 'チ',
	    'tsu': ['ツ', 'ツウ'],
	    'te': 'テ',
	    'to': ['ト', 'トウ'],

	    'na': 'ナ',
	    'ni': 'ニ',
	    'nu': ['ヌ', 'ヌウ'],
	    'ne': 'ネ',
	    'no': ['ノ', 'ノウ'],

	    'ha': 'ハ',
	    'hi': 'ヒ',
	    'fu': ['フ', 'フウ'],
	    'he': 'ヘ',
	    'ho': ['ホ', 'ホウ'],

	    'ma': 'マ',
	    'mi': 'ミ',
	    'mu': ['ム', 'ムウ'],
        'me': 'メ',
	    'mo': ['モ', 'モウ'],

	    'ya': 'ヤ',
	    'yu': ['ユ', 'ユウ'],
	    'yo': ['ヨ', 'ヨウ'],

	    'ra': 'ラ',
	    'ri': 'リ',
	    'ru': ['ル', 'ルウ'],
	    're': 'レ',
	    'ro': ['ロ', 'ロウ'],

	    'wa': 'ワ',

	    'ga': 'ガ',
	    'gi': 'ギ',
	    'gu': ['グ', 'グウ'],
	    'ge': 'ゲ',
	    'go': ['ゴ', 'ゴウ'],

	    'za': 'ザ',
	    'ji': ['ジ', 'ヂ'],
	    'zu': ['ズ', 'ヅ', 'ズウ', 'ヅウ'],
	    'ze': 'ゼ',
	    'zo': ['ゾ', 'ゾウ'],

	    'da': 'ダ',
	    'de': 'デ',
	    'do': ['ド', 'ドウ'],

	    'ba': 'バ',
	    'bi': 'ビ',
	    'bu': ['ブ', 'ブウ'],
	    'be': 'ベ',
	    'bo': ['ボ', 'ボウ'],

	    'pa': 'パ',
	    'pi': 'ピ',
	    'pu': ['プ', 'プウ'],
	    'pe': 'ペ',
	    'po': ['ポ', 'ポウ'],

	    // 拗音

	    'kya': 'キャ',
	    'kyu': ['キュ', 'キュウ'],
	    'kyo': ['キョ', 'キョウ'],

	    'sha': 'シャ',
	    'shu': ['シュ', 'シュウ'],
	    'sho': ['ショ', 'ショウ'],

	    'cha': 'チャ',
	    'chu': ['チュ', 'チュウ'],
	    'cho': ['チョ', 'チョウ'],

	    'nya': 'ニャ',
	    'nyu': ['ニュ', 'ニュウ'],
	    'nyo': ['ニョ', 'ニョウ'],

	    'hya': 'ヒャ',
	    'hyu': ['ヒュ', 'ヒュウ'],
	    'hyo': ['ヒョ', 'ヒョウ'],

	    'mya': 'ミャ',
	    'myu': ['ミュ', 'ミュウ'],
	    'myo': ['ミョ', 'ミョウ'],

	    'rya': 'リャ',
	    'ryu': ['リュ', 'リュウ'],
	    'ryo': ['リョ', 'リョウ'],

	    'gya': 'ギャ',
	    'gyu': ['ギュ', 'ギュウ'],
	    'gyo': ['ギョ', 'ギョウ'],

	    'ja': ['ジャ', 'ヂャ'],
	    'ju': ['ジュ', 'ヂュ', 'ジュウ', 'ヂュウ'],
	    'jo': ['ジョ', 'ヂョ', 'ジョウ', 'ヂョウ'],

	    'bya': 'ビャ',
	    'byu': ['ビュ', 'ビュウ'],
	    'byo': ['ビョ', 'ビョウ'],

	    'pya': 'ピャ',
	    'pyu': ['ピュ', 'ピュウ'],
	    'pyo': ['ピョ', 'ピョウ'],

        // 促音

        'kka': 'ッカ',
        'kki': 'ッキ',
        'kku': ['ック', 'ックウ'],
        'kke': 'ッケ',
        'kko': ['ッコ', 'ッコウ'],

        'ssa': 'ッサ',
	    'sshi': 'ッシ',
        'ssu': ['ッス', 'ッスウ'],
        'sse': 'ッセ',
        'sso': ['ッソ', 'ッソウ'],

	    'tta': 'ッタ',
	    'tchi': 'ッチ',
	    'ttsu': ['ッツ', 'ッツウ'],
	    'tte': 'ッテ',
	    'tto': ['ット', 'ットウ'],

	    'nna': 'ッナ',
	    'nni': 'ッニ',
	    'nnu': ['ッヌ', 'ッヌウ'],
	    'nne': 'ッネ',
	    'nno': ['ッノ', 'ッノウ'],

        'hha': 'ッハ',
	    'hhi': 'ッヒ',
	    'ffu': ['ッフ', 'ッフウ'],
	    'hhe': 'ッヘ',
	    'hho': ['ッホ', 'ッホウ'],

	    'mma': 'ッマ',
	    'mmi': 'ッミ',
	    'mmu': ['ッム', 'ッムウ'],
        'mme': 'ッメ',
	    'mmo': ['ッモ', 'ッモウ'],

	    'yya': 'ッヤ',
	    'yyu': ['ッユ', 'ッユウ'],
	    'yyo': ['ッヨ', 'ッヨウ'],

	    'rra': 'ッラ',
	    'rri': 'ッリ',
	    'rru': ['ッル', 'ッルウ'],
	    'rre': 'ッレ',
	    'rro': ['ッロ', 'ッロウ'],

	    'wwa': 'ッワ',

	    'gga': 'ッガ',
	    'ggi': 'ッギ',
	    'ggu': ['ッグ', 'ッグウ'],
	    'gge': 'ッゲ',
	    'ggo': ['ッゴ', 'ッゴウ'],

	    'zza': 'ッザ',
	    'jji': ['ッジ', 'ッヂ'],
	    'zzu': ['ッズ', 'ッヅ', 'ッズウ', 'ッヅウ'],
	    'zze': 'ッゼ',
	    'zzo': ['ッゾ', 'ッゾウ'],

	    'dda': 'ッダ',
	    'dde': 'ッデ',
	    'ddo': ['ッド', 'ッドウ'],

	    'bba': 'ッバ',
	    'bbi': 'ッビ',
	    'bbu': ['ッブ', 'ッブウ'],
	    'bbe': 'ッベ',
	    'bbo': ['ッボ', 'ッボウ'],

	    'ppa': 'ッパ',
	    'ppi': 'ッピ',
	    'ppu': ['ップ', 'ップウ'],
	    'ppe': 'ッペ',
	    'ppo': ['ッポ', 'ッポウ'],

	    // 促音 + 拗音

	    'kkya': 'ッキャ',
	    'kkyu': ['ッキュ', 'ッキュウ'],
	    'kkyo': ['ッキョ', 'ッキョウ'],

	    'ssha': 'ッシャ',
	    'sshu': ['ッシュ', 'ッシュウ'],
	    'ssho': ['ッショ', 'ッショウ'],

        'tcha': 'ッチャ',
	    'tchu': ['ッチュ', 'ッチュウ'],
	    'tcho': ['ッチョ', 'ッチョウ'],

	    'nnya': 'ッニャ',
	    'nnyu': ['ッニュ', 'ッニュウ'],
	    'nnyo': ['ッニョ', 'ッニョウ'],

	    'hhya': 'ッヒャ',
	    'hhyu': ['ッヒュ', 'ッヒュウ'],
	    'hhyo': ['ッヒョ', 'ッヒョウ'],

	    'mmya': 'ッミャ',
	    'mmyu': ['ッミュ', 'ッミュウ'],
	    'mmyo': ['ッミョ', 'ッミョウ'],

	    'rrya': 'ッリャ',
	    'rryu': ['ッリュ', 'ッリュウ'],
	    'rryo': ['ッリョ', 'ッリョウ'],

	    'ggya': 'ッギャ',
	    'ggyu': ['ッギュ', 'ッギュウ'],
	    'ggyo': ['ッギョ', 'ッギョウ'],

	    'jja': ['ッジャ', 'ッヂャ'],
	    'jju': ['ッジュ', 'ッヂュ', 'ッジュウ', 'ッヂュウ'],
	    'jjo': ['ッジョ', 'ッヂョ', 'ッジョウ', 'ッヂョウ'],

	    'bbya': 'ッビャ',
	    'bbyu': ['ッビュ', 'ッビュウ'],
	    'bbyo': ['ッビョ', 'ッビョウ'],

	    'ppya': 'ッピャ',
	    'ppyu': ['ッピュ', 'ッピュウ'],
	    'ppyo': ['ッピョ', 'ッピョウ'],

        // OH 長音

        'oh': ['オウ', 'オオ'],

        'koh': ['コウ'],
        'soh': ['ソウ'],
        'toh': ['トウ'],
        'noh': ['ノウ'],
        'hoh': ['ホウ'],
        'moh': ['モウ'],
        'yoh': ['ヨウ'],
        'roh': ['ロウ'],

        'goh': ['ゴウ'],
        'zoh': ['ゾウ'],
        'doh': ['ドウ'],
        'boh': ['ボウ'],
        'poh': ['ポウ'],

        'kyoh': ['キョウ'],
        'shoh': ['ショウ'],
        'choh': ['チョウ'],
        'nyoh': ['ニョウ'],
        'hyoh': ['ヒョウ'],
        'myoh': ['ミョウ'],
        'ryoh': ['リョウ'],
        'gyoh': ['ギョウ'],
        'joh': ['ジョウ'],
        'byoh': ['ビョウ'],
        'pyoh': ['ピョウ'],

        // 促音 + OH 長音

        'kkoh': ['ッコウ'],
        'ssoh': ['ッソウ'],
        'ttoh': ['ットウ'],
        'nnoh': ['ッノウ'],
        'hhoh': ['ッホウ'],
        'mmoh': ['ッモウ'],
        'yyoh': ['ッヨウ'],
        'rroh': ['ッロウ'],

        'ggoh': ['ッゴウ'],
        'zzoh': ['ッゾウ'],
        'ddoh': ['ッドウ'],
        'bboh': ['ッボウ'],
        'ppoh': ['ッポウ'],

        'kkyoh': ['ッキョウ'],
        'sshoh': ['ッショウ'],
        'tchoh': ['ッチョウ'],
        'nnyoh': ['ッニョウ'],
        'hhyoh': ['ッヒョウ'],
        'mmyoh': ['ッミョウ'],
        'rryoh': ['ッリョウ'],
        'ggyoh': ['ッギョウ'],
        'jjoh': ['ッジョウ'],
        'bbyoh': ['ッビョウ'],
        'ppyoh': ['ッピョウ'],

        'n': 'ン',
        ' ': ' ',

        'mma': 'ンマ',
	    'mmi': 'ンミ',
	    'mmu': 'ンム',
	    'mme': 'ンメ',
	    'mmo': 'ンモ',

	    'mba': 'ンバ',
	    'mbi': 'ンビ',
	    'mbu': 'ンブ',
	    'mbe': 'ンベ',
	    'mbo': 'ンボ',

	    'mpa': 'ンパ',
	    'mpi': 'ンピ',
	    'mpu': 'ンプ',
	    'mpe': 'ンペ',
	    'mpo': 'ンポ'
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
