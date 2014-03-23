
var current_token = "0000";
var TEMPO = 1;

var tmr_fala;


var twitter = require('ntwitter');
var http = require('http');
var fs = require('fs');

var sys = require('sys')
var exec = require('child_process').exec;


var config = require('./config.json');


var twit = new twitter(config);

console.log("OK");




var fala = function(){
	exec("afplay fala.mp3 -r 0.9", null);
	if (tmr_fala) clearTimeout(tmr_fala);
	tmr_fala = setTimeout(fala, TEMPO * 60000);
}

var download_and_play_audio = function() {

	var codigo_espacado = "";
		codigo_espacado += current_token[0] + " ";
		codigo_espacado += current_token[1] + " ";
		codigo_espacado += current_token[2] + " ";
		codigo_espacado += current_token[3] + "...";

	console.log("CÓDIGO: " + codigo_espacado);

	var txt = "O código é ";
		txt += codigo_espacado + "... ";
		txt += "Repetindo...";
		txt += codigo_espacado + ". ";

	var url = "http://translate.google.com.br/translate_tts?ie=UTF-8&q=%0&tl=pt-br&total=1&idx=0&textlen=%1&client=t&prev=input"

	var file = fs.createWriteStream("fala.mp3");
	var request = http.get(url.replace("%0", txt).replace("%1", txt.length), function(response) {
		response.pipe(file);	
	  	fala(); //play audio
	});	
}

var generate_new_code = function() {
	current_token = Math.random().toString(10).substring(7, 3);
	download_and_play_audio();
}

var call_server = function() {
	var options = {
		host: 'vaibrasil.luisleao.com.br',
		port: 80,
		path: '/glass'
	};

	http.get(options, function(resp){
		resp.on('data', function(chunk){
			//do something with chunk
			//console.log("RETORNO: ", chunk);
		});
	}).on("error", function(e){
		console.log("Got error: " + e.message);
	});	
}

var new_follower = function(follower) {

	console.log("NEW FOLLOW: ", follower.screen_name);
	//TODO: seguir de volta
	//TODO: enviar DM

}

var new_mention = function(tweet) {
	console.log("NEW MENTION: ", tweet.user.screen_name, " - ", tweet.text);

	if (tweet.text.indexOf(current_token) >= 0) {
		//TODO: chamar url
		call_server();
		generate_new_code();

	} else {
		//TODO: enviar DM com instruções
		console.log("NAO FOI DESSA VEZ!");
	}
	//TODO: gerar token
	//TODO: 

		// id: 447448793391562750,
		//   id_str: '447448793391562752',
		//   text: '@luisleao teste',
		//   source: '<a href="http://twitter.com/download/android" rel="nofollow">Twitter for Android</a>',
		//   truncated: false,
		//   in_reply_to_status_id: null,
		//   in_reply_to_status_id_str: null,
		//   in_reply_to_user_id: 10095682,
		//   in_reply_to_user_id_str: '10095682',
		//   in_reply_to_screen_name: 'luisleao',
		//   user: 
		//    { id: 14510334,
		//      id_str: '14510334',
		//      name: 'sms2blog - log',
		//      screen_name: 'sms2blog_log',
		//      location: '',


}


var mention_me = function(tweet) {
	//entities.user_mentions[n].screen_name == "luisleao"
	if (!tweet.entities || !tweet.entities.user_mentions)
		return false
	for (idx in tweet.entities.user_mentions) {
		if (tweet.entities.user_mentions[idx].screen_name === "luisleao")
			return true;
	}
	return false;
}



twit.stream(
	'user',
	{ with: "user" },
	function(stream) {

		stream.on('data', function(tweet) {



			if (tweet.event && tweet.event === "follow" && tweet.source.screen_name != "luisleao") {
				new_follower(tweet.source);

			} else if (tweet.friends) {
				// chamado pelo
				console.log("Recebi amigos ", tweet.friends.length);

			} else {
				// TWEETS (filtro MENTION)
				// > user.screen_name!=="luisleao"
				// > ignorar se tiver retweeted_status
				// > in_reply_to_screen_name == null
				// > entities.user_mentions[n].screen_name == "luisleao"

				var me_mencionou = mention_me(tweet);
				var valida = tweet.user.screen_name!=="luisleao" && !tweet.retweeted_status && !tweet.in_reply_to_screen_name && me_mencionou;

				//console.log("mencionou? ", me_mencionou, " ", valida);
				//console.log("NOT luisleao ", tweet.user.screen_name!=="luisleao", tweet.user.screen_name);
				//console.log("retweeted_status ", !tweet.retweeted_status);
				//console.log("retweeted_status ", !tweet.in_reply_to_screen_name);


				if (valida) {

					new_mention(tweet);
				} else {
					console.log(tweet);
				}
			}

			// } else {
			// 	console.log(tweet);
			// }

		});

		stream.on('end', function (response) {
			// Handle a disconnection
			console.log("END");
		});

		stream.on('destroy', function (response) {
		// Handle a 'silent' disconnection from Twitter, no end/error event fired
			console.log("DESTROY");
		});

	}
);


//function puts(error, stdout, stderr) { sys.puts(stdout) }
exec("ls -la", function(){}); //puts);





generate_new_code();

