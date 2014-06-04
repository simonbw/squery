var print = console.log.bind(console);

$(function() {
	print('Document Ready');

	$('ul:first-of-type>li').addClass('a b');
	$('ul:nth-of-type(2)>li:first-of-type').addClass('a');
	$('ul:nth-of-type(2)>li:first-of-type').siblings().addClass('b');
	$('ul:nth-of-type(3)').children(':nth-of-type(3)').addClass('a');
	$('ul').append('<li>5</li>');
	$('ul').append($('<li>', {
		'innerHTML': '6'
	}));
	$('ul:nth-of-type(3)').children().hide();
	$('ul:nth-of-type(3)').children(':nth-of-type(3)').show();
});