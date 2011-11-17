function run() {
	// video player dialog
	var control = $('#control').find('button').button();
	var videodialog = $('#videodialog');
	videodialog.dialog({autoOpen:false, modal:true, position:[0,0]});
	var player = $('#player');
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
		videodialog.dialog("option", {
			width: player.width() + 30, 
			title: row.data("title"),
			close: function() { player.jPlayer("destroy"); }
		});
		videodialog.dialog("open");
		// setup player
		player.jPlayer({
			ready: function () {
				$(this).jPlayer("setMedia", { m4v: row.data("url") });
				$(this).jPlayer("play");
			},
			//size: {width: w, height: h},
			size: {cssClass: cls},
			swfPath: "/jplayer",
			supplied: "m4v"
		});
		return false;
	});
	// buttonize all links
	$('a.url').button({text: false, icons: {primary: 'ui-icon-video'}})
	.next().button({text: false, icons: {primary: 'ui-icon-script'}})
	.parent().buttonset();
	$('#ontv').button({icons:{primary:'ui-icon-extlink'}});
}
