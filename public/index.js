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
		(function() {row.fadeToggle('slow', arguments.callee);})(); //animate
	});
	var control = $('#control').remove();
	$('.player').each(function(){
		var container = $(this);
		var url = $('a.link', this).attr('href');
		container.flowplayer("flowplayer/flowplayer-3.2.5.swf", {
			clip: { url: url, provider: 'nginx' },
			plugins: { nginx: { url: '/flowplayer/flowplayer.pseudostreaming-3.2.5.swf' } }
		});
	}).click(function(e){
		$('.player').removeClass("playing").removeClass("playing-2x");
		if ("2x" == $(e.target).attr('class')) {
			$(this).addClass("playing-2x")
		} else {
			$(this).addClass("playing")
		}
		$(this).after(control);
		control.click(function(e){
			var player = $f();
			var time = player.getTime();
			switch (e.target.id) {
			case "start": time = 0.0; break;
			case "revL":  time -= 30.0; break;
			case "rev":   time -= 10.0; break;
			case "fwd":   time += 10.0; break;
			case "fwdL":  time += 30.0; break;
			default: return
			}
			player.seek(time);
		});
	});
}
