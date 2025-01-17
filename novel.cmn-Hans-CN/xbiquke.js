﻿/**
 * 批量下載 笔趣阁 小说 的工具。 Download xbiquke novels.
 */

'use strict';

require('../work_crawler_loader.js');

// ----------------------------------------------------------------------------

CeL.run('application.net.work_crawler.sites.PTCMS');

// ----------------------------------------------------------------------------

var crawler = CeL.PTCMS({
	base_URL : 'http://www.xbiquke.net/',
	// must_browse_first : true,

	search_URL : 'search?keyword=',
	parse_search_result : 'biquge',

	// 取得作品的章節資料。 get_work_data()
	work_URL : function(work_id) {
		return (work_id / 1000 | 0) + '_' + work_id + '/';
	},
	extract_work_data : function(work_data, html, get_label,
	//
	extract_work_data) {
		var text = html.between('<div id="info">', '</div>');
		extract_work_data(work_data, text, /<p>([^：]+)：([\s\S]+?)<\/p>/g);
		Object.assign(work_data, {
			title : get_label(text.between('<h1>', '</h1>')),
			author : work_data['作  者'],
			image : html.between('<div id="fmimg">', '</div>').between('<img ')
					.between('src="', '"'),
			last_update : work_data.最后更新,
			latest_chapter : work_data.最新章节,
			status : work_data.书籍状态
		});
	},

	// 取得包含章節列表的文字範圍。
	get_chapter_list_contents : function(html) {
		return html.between('<div id="list"', '</div>');
	},

	PATTERN_ads_1 : new RegExp('(?:一秒记住|记住网址|首发网址)(?:'
			+ generate_bi_width_pattern('http://') + ')?(?:'
			+ generate_bi_width_pattern('m.xbiquke.net/') + '?)', 'g'),
	remove_ads : function(text) {
		// http://www.xbiquke.net/29_29775/21316959.html
		text = text.replace(/(?:\s|&nbsp;)*<p\s+class="[^"]*">\s*/g, '<p>')
				.replace(/\s*<\/p>\s*<br\s*\/?>/g, '</p>').replace(
						this.PATTERN_ads_1, '');
		var matched = text.match(new RegExp('(.{0,20}'
				+ generate_bi_width_pattern('m.xbiquke.net/') + '?)'));
		if (matched)
			CeL.warn('remove_ads: 發現廣告標記: ' + matched[1]);
		return text;
	}
});

// https://zh.wikipedia.org/wiki/全形和半形
// bi-width forms
function generate_bi_width_pattern(halfwidth_string) {
	return halfwidth_string.chars().map(function(char) {
		var fullwidth;
		var charCode = char.charCodeAt(0);
		// https://github.com/rockonyu/StringToWide/blob/master/StringToWide/StringExtension.cs
		// https://www.firbug.com/a/202107/438874.html
		// 半形符號轉全形
		// 全形空格為12288，半形空格為32
		// 其他字元半形(33-126)與全形(65281-65374)的對應關係是：均相差 65248 (0xFEE0)
		if (char === ' ') {
			fullwidth = '　';
		} else if (32 < charCode && charCode < 127) {
			// 全形 = 半形 + 0xfee0
			fullwidth = String.fromCharCode(charCode + 0xfee0);
		} else {
			return char;
		}

		// assert: !!fullwidth === true
		return '[' + char + fullwidth + ']';
	}).join('');
}

// ----------------------------------------------------------------------------

// CeL.set_debug(3);

start_crawler(crawler, typeof module === 'object' && module);
