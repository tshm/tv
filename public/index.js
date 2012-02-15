var Item = function(hash) {
	var self = this;
	// properties
	self.ch = hash.ch;
	self.title = hash.title;
	self.mpgname = hash.mpgname;
	self.url = hash.url;
	var date = new Date(hash.time);
	self.time = $.datepicker.formatDate("m/d/yy ", date) + date.toLocaleTimeString();
};
// methods
Item.prototype.play = function(item, event) {
	var self = this;
	console.log([item, event]);
	var cls = "playing" + $(event.target).closest('a').data('size');
	$player.attr({style: "", class: cls});
	var w = $player.width(), h = $player.height();
	$videodialog.dialog("option", {
		width: $player.width() + 30, 
		close: function() { $player.jPlayer("destroy"); }
	});
	$videodialog.dialog("open");
	// setup player
	$player.jPlayer({
		ready: function () {
			$(this).jPlayer("setMedia", {m4v: self.url }).jPlayer("play");
		},
		click: function(e) {
			$(this).jPlayer(e.jPlayer.status.paused ? "play" : "pause");
		},
		timeupdate: function(e) {
			var stat = e.jPlayer.status;
			$progress.progressbar({value: stat.currentPercentAbsolute});
		},
		progress: function(e) {
			var stat = e.jPlayer.status;
			var dur = $.jPlayer.convertTime(stat.duration);
			console.log(stat);
			$videodialog.dialog("option", {title: self.title + " / " + dur});
		},
		size: {width: w, height: h},
		swfPath: "/jplayer",
		supplied: "m4v"
	});
	// control
	$control.find('button').click(function(e) {
		var stat = $player.data("jPlayer").status;
		if ("volume" == this.parentNode.id) {
			vol += ("volup" == this.id ? +0.1 : -0.1);
			if (vol < 0.0) vol = 0.0;
			if (1.0 < vol) vol = 1.0;
			$('#volume button').attr('title', vol);
			$player.jPlayer("volume", vol);
		} else {
			var time = stat.currentTime;
			switch(this.id) {
				case "start": time  =  0.0; break;
				case "revL":  time -= 30.0; break;
				case "rev":   time -= 10.0; break;
				case "fwd":   time += 10.0; break;
				case "fwdL":  time += 30.0; break;
				default: return;
			}
			$player.jPlayer(stat.paused ? "pause" : "play", time);
		}
	});
};
Item.prototype.remove = function() {
	if (!confirm('Are you sure?')) return;
	viewModel.items.remove(this);
	$.post('/delete', {path: this.url});
};

// The main ViewModel
var ViewModel = function() {
	var self = this;
	self.items = ko.observableArray();
	// button markup
	self.markup = function(elem) {
		var tr = $(elem[1]);  // foreach includes <TextNode>'s
		tr.find('a.play').button({icons:{primary:'ui-icon-play'}});
		tr.find('a.play2x').button({text:false, icons:{primary:'ui-icon-arrow-4-diag'}})
		.parent().buttonset();
		tr.find('a.url').button({text: false, icons: {primary: 'ui-icon-video'}})
		.next().button({text: false, icons: {primary: 'ui-icon-script'}})
		.parent().buttonset();
		tr.find('.delete').button({text: false, icons: {primary: "ui-icon-trash"}});
	};
};
var viewModel = new ViewModel();
ko.applyBindings(viewModel);

$(function() {
	var $form = $('form');
	$form.find('input').button();
	$.get('/items', function(data) {
		if (!data) {
			$form.show();
			return;
		}
		$('#list').show();
		for (var i=0, o; o = data[i]; i++) {
			viewModel.items.push(new Item(o));
		}
	});
	vol = 0.8;
	// video player dialog
	$control = $('#control');
	$control.find('button').each(function(){
		$(this).button({text:false, icons:{primary:"ui-icon-"+$(this).attr('class')}});
	});
	$progress = $('#progress').progressbar().height(8);
	$volume = $('#volume').buttonset();
	$videodialog = $('#videodialog');
	$videodialog.dialog({autoOpen:false, modal:true, position:[0,0]});
	$player = $('#player');
});
