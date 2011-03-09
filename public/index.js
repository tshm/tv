function run() {
	$('.delete').click(function(e){
		var row = $(this).closest('tr');
		if (!confirm('Are you sure?')) return;
		$('.playing', row).unload();
		var filename = $('a.flv', row).attr('href');
		$.get("/delete?pathname="+filename, function() {
			row.stop().remove();
			return;
		});
	}).button({text: false, icons: {primary: "ui-icon-trash"}});
	var control = $('#control').remove();
	$('.player').each(function(){
		var container = $(this);
		var url = $('a.link', this).button({icons:{primary:'ui-icon-play'}}).attr('href');
		$('a.2x', this).button({text: false, icons:{primary:'ui-icon-arrow-4-diag'}}).parent().buttonset();
		container.flowplayer("flowplayer/flowplayer-3.2.7.swf", {
			clip: { url: url, provider: 'nginx' },
			plugins: { nginx: { url: '/flowplayer/flowplayer.pseudostreaming-3.2.7.swf' } }
		});
	}).click(function(e){
		$('.player').removeClass("playing").removeClass("playing-2x");
		if ($(e.target).closest('a').attr('class').match("2x")) {
			$(this).addClass("playing-2x")
		} else {
			$(this).addClass("playing")
		}
		$(this).after(control);
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
		}).find('button').button();
	});
	// buttonize all links
	$('a.flv').button({text: false, icons: {primary: 'ui-icon-video'}})
	.next().button({text: false, icons: {primary: 'ui-icon-script'}})
	.parent().buttonset();
	$('#ontv').button({icons:{primary:'ui-icon-extlink'}});
}
