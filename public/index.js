function run() {
	// video player dialog
	var control = $('#control').find('button').button();
	var videodialog = $('#videodialog');
	videodialog.dialog({autoOpen:false, modal:true, position:[0,0]});
	var playerelem = $('#player');
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
		playerelem.removeClass("playing").removeClass("playing-2x");
		if ($(e.target).closest('a').attr('class').match("2x")) {
			playerelem.addClass("playing-2x")
		} else {
			playerelem.addClass("playing")
		}
		videodialog.dialog("open");
		videodialog.dialog("option", {
			width: playerelem.width() + 30, 
			title: row.data("title")
		});
		playerelem.flowplayer("flowplayer/flowplayer-3.2.7.swf", {
			clip: { url: row.data("url"), provider: 'nginx' },
			plugins: { nginx: { url: '/flowplayer/flowplayer.pseudostreaming-3.2.7.swf' } }
		});
		control.click(function(e){
			var player = $f();
			var time = player.getTime();
			switch (e.target.id) {
			case "start": time  =  0.0; break;
			case "revL":  time -= 30.0; break;
			case "rev":   time -= 10.0; break;
			case "fwd":   time += 10.0; break;
			case "fwdL":  time += 30.0; break;
			default: return;
			}
			player.seek(time);
		});
		return false;
	});
	// buttonize all links
	$('a.url').button({text: false, icons: {primary: 'ui-icon-video'}})
	.next().button({text: false, icons: {primary: 'ui-icon-script'}})
	.parent().buttonset();
	$('#ontv').button({icons:{primary:'ui-icon-extlink'}});
}
