// Copyright (c) 2014 Takuya Asano All Rights Reserved.

describe('Romaji2Katakana', function () {
    var converter;  // target object
    before(function(done) {
        converter = Romaji2Katakana.converter([
            Romaji2Katakana.iso,
            Romaji2Katakana.iso_strict,
            Romaji2Katakana.kunrei,
            Romaji2Katakana.kunrei_2,
            Romaji2Katakana.hepburn_bs,
            Romaji2Katakana.passport
        ]);
        done();
    });
    describe('convert', function () {
        it('ndが含まれるローマ字で要素が1つだけのArrayを返す', function () {
	        expect(converter.convert('kanda').length).to.eql(1);
        });
        it('ndが含まれるローマ字で正しいカタカナを返す', function () {
	        expect(converter.convert('kanda')).to.include('カンダ');
        });
        it('junが含まれるローマ字で正しいカタカナを返す', function () {
	        expect(converter.convert('jun')).to.include('ジュン');
        });
        it('beが含まれるローマ字で正しいカタカナを返す', function () {
	        expect(converter.convert('kabe')).to.include('カベ');
        });
        it('nの次に母音があるローマ字で正しいカタカナを返す', function () {
	        expect(converter.convert('asano')).to.include('アサノ');
	        expect(converter.convert('shinichiro')).to.include('シンイチロウ');
        });
        it('nnの次に母音が含まれるローマ字で正しいカタカナを返す', function () {
	        expect(converter.convert('tanno')).to.include('タンノ');
            expect(converter.convert('kannari')).to.include('カンナリ');
        });
        it('ziが含まれるローマ字で複数の要素を持つArrayを返す', function () {
	        expect(converter.convert('zi').length).to.be.at.least(2);
        });
        it('dyaが含まれるローマ字', function () {
	        expect(converter.convert('dya')).to.include('ヂャ');
        });
        it('パスポート式の長音', function () {
	        expect(converter.convert('sho')).to.include('ショウ');
	        expect(converter.convert('itiro')).to.include('イチロウ');
        });
        it('ohを含むパスポート式の長音', function () {
	        expect(converter.convert('oho')).to.include('オホ');
	        expect(converter.convert('oh')).to.include('オウ');
	        expect(converter.convert('yoh')).to.include('ヨウ');
        });
        it('ヘボン式のローマ字', function () {
	        expect(converter.convert('shi')).to.include('シ');
	        expect(converter.convert('shoko')).to.include('ショウコ');
	        expect(converter.convert('ichiro')).to.include('イチロウ');
        });
        it('ヘボン式のmをンに変換する', function () {
	        expect(converter.convert('hombo')).to.include('ホンボ');
        });
        it('訓令式・日本式・ヘボン式の組み合わせのローマ字', function () {
	        expect(converter.convert('shizidya')).to.include('シヂヂャ');
        });
    });
});
