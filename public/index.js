function run() {
	vol = 0.8;
	// video player dialog
	var $control = $('#control');
	$control.find('button').each(function(){
		$(this).button({text:false, icons:{primary:"ui-icon-"+$(this).attr('class')}});
	});
	var $progress = $('#progress').progressbar().height(8);
	var $volume = $('#volume').buttonset();
	var $videodialog = $('#videodialog');
	$videodialog.dialog({autoOpen:false, modal:true, position:[0,0]});
	var $player = $('#player');
	// Delete button binding
	$('.delete').click(function(e){
		var row = $(this).closest('tr');
		if (!confirm('Are you sure?')) return;
		var filename = row.data("url");
		$.get("/delete?pathname="+filename, function() {
			row.remove();
			return;
		});
	}).button({text: false, icons: {primary: "ui-icon-trash"}});
	// start buttons / event handling
	$('.playbuttons').each(function(){
		$('a.link', this).button({icons:{primary:'ui-icon-play'}});
		$('a.2x', this).button({text:false, icons:{primary:'ui-icon-arrow-4-diag'}})
			.parent().buttonset();
	}).click(function(e){
		var row = $(e.target).closest("tr");
		var cls = $(e.target).closest('a').attr('class').match("2x") ? "playing-2x" : "playing";
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
				$(this).jPlayer("setMedia", {m4v: row.data("url") }).jPlayer("play");
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
				$videodialog.dialog("option", {title: row.data("title") + " / " + dur});
			},
			size: {width: w, height: h},
			//nativeVideoControls: {all: /.*/},
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
		return false;
	});
	// buttonize all links
	$('a.url').button({text: false, icons: {primary: 'ui-icon-video'}})
	.next().button({text: false, icons: {primary: 'ui-icon-script'}})
	.parent().buttonset();
	$('#ontv').button({icons:{primary:'ui-icon-extlink'}});
}
