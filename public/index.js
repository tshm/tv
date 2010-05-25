function run() {
	var control = $('#control').remove();
	$('.player').each(function(){
		var container = $(this);
		var url = $('a.link', this).attr('href');
		container.flowplayer("flowplayer/flowplayer-3.1.3.swf", {
			clip: { url: url, provider: 'nginx' },
			plugins: { nginx: { url: '/flowplayer/flowplayer.pseudostreaming-3.1.3.swf' } }
		});
	}).click(function(e){
		//console.log( e.target );
		$(".playing").removeClass("playing").removeClass("playing-2x");
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
