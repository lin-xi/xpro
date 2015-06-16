(function (window) {
	
	var sock, win, members;

	function GroupChat(){
		this.initialize();
	}

	GroupChat.prototype.initialize = function(){
		var me = this;
		_.loadCss('api/xmeet.api.css');
		
		var tpl_chat = __inline('./xmeet-chat.tpl');
		var nodes = _.dom.create(tpl_chat);
		document.body.appendChild(nodes[0]);

		_.dom.on('.xmeet-chat-logo img', 'click', function(e){
			_.dom.toggle('.xmeet-chat-room');
		});
		
		var tpl_room = __inline('./xmeet-room.tpl');
		var nodes = _.dom.create(tpl_room);
		document.body.appendChild(nodes[0]);
		var name = generateName();
		_.dom.get('.xmeet-chat-room .name')[0].value = name;
		_.dom.on('#room-enter', 'click', function(e){
			_.dom.toggle('.xmeet-chat-room');
			me.createChatWindow(name);
		});
	};

	GroupChat.prototype.createChatWindow = function(name){
		var me = this;
		if(!sock){
			sock = new SocketChat('交流群');
			sock.on('connected', function(data){
				win = new GroupChatWindow(data.roomId, {
					uid: data.from,
					name: name
				});
				me.bindChatEvent();
			});

			sock.on('members', function(data){
				members = {};
				for(var i=data.content.length; i>0; i--){
					var u = data.content[i-1];
					members[u.pid] = {
						uid: u.pid,
						name: u.nickname
					};
				}
			});

			sock.on('joined', function(data){
				members[data.from] = {
					uid: data.from,
					name: data.content
				};
			});

			sock.on('receive', function(data){
				var u = members[data.from];
				if(u){
					win.receiveMessage(data.content, u, data.time);
				}
			});
		}
	};

	GroupChat.prototype.bindChatEvent = function(){
		win.on('send', function(data){
			sock.send(data.message);
		});
	};

	function generateName(){
		var names = {
			'Cat': '凯特',
			'Dog': '多格',
			'Zebra': '泽布拉',
			'Rihno': '蕾哈娜', 
			'Elephant': '爱丽芬', 
			'Hippo': '黑普', 
			'Giraffe': '格拉菲', 
			'Duck': '达克', 
			'Leopard': '莱昂帕多', 
			'Goose': '古斯', 
			'Lion': '莱恩', 
			'Fox': '福克斯', 
			'Wolf': '沃尔夫', 
			'Tigger': '泰格',
			'Beatles': '比特斯',    //甲壳虫
			'Eagle': '伊格',
			'Goat': '勾特',
			'Python': '派森',
			'Cobra': '科波拉',
			'Monkey': '芒可',
			'Octopus': '奥克托帕斯',  //章鱼
			'Tortoise': '托特斯',
			'Horse': '霍斯',
			'Panda': '胖达',
			'Kaola': '考拉',
			'Boar': '伯恩',       //野猪
			'Squirrel': '斯奎尔',
			'Rabbit': '拉比特',
			'Sardine': '沙丁',   //沙丁鱼
			'Salmon': '莎尔蒙',  //鲑鱼
			'Sloth': '斯洛兹',  //树懒
			'buffalo': '巴伐罗',  //水牛
			'gnu': '格鲁',  //角马
			'jellyfish': '杰丽菲诗',
			'shark': '沙奎尔',
			'crocodile': '克拉克戴尔',  //
			'penguin': '平格温',
			'pigeon': '匹金',
			'bat': '波特',  //蝙蝠
			'lizard': '李札特',  //蜥蜴
			'mosquito': '马斯奎特',  //蚊子
			'frog': '弗洛格',  //蚊子
			'squid': '斯奎德',  //乌贼
			'lobster': '罗伯斯特',  //龙虾
			'ant': '安特',
			'butterfly': '巴特弗莱',
			'flamingo': '弗拉明戈',  //火烈鸟
			'peacock': '皮科克',  //孔雀
			'swan': '斯万',  //天鹅
			'spider': '斯派德尔',  //蜘蛛
			'owl': '欧尔',
			'ostrich': '奥斯纯齐', //鸵鸟
			'camel': '凯梅尔',
			'crab': '克拉伯',
			'mongoose': '芒古斯', //猫鼬
			'deer': '迪尔',
			'antelope': '艾迪路普',  //羚羊
			'mustang': '木斯唐',  //野马
		};
		var keys = Object.keys(names);
		return names[keys[Math.floor(keys.length*Math.random())]];
	}

	function getTemplate(name, fn){
		_.ajax.get('/api/'+ name, null, function(text){
			fn(text);
		});
	}

	var xmeet = {
		GroupChat: function(){
			var groupChat = new GroupChat();
		}
	};

	window.XMeet = xmeet;
})(window);

















