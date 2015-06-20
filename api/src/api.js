(function (window) {

	var sock, win, members;

	function GroupChat(roomId, roomName) {
		this.roomId = roomId;
		this.roomName = roomName;
		this.initialize();
	}

	GroupChat.prototype.initialize = function () {
		var me = this;
		_.loadCss('http://meet.xpro.im/v2/api/xmeet.api.css');
		// _.loadCss('api/xmeet.api.css');

		var tpl_chat = __inline('./xmeet-chat.tpl');
		var nodes = _.dom.create(tpl_chat);
		document.body.appendChild(nodes[0]);

		_.dom.on('.xmeet-chat-logo img', 'click', function (e) {
			// _.dom.toggle('.xmeet-chat-room');
			_.dom.hide('.xmeet-chat-logo');
			var name = me.name = generateName();
			if (win) {
				win.show();
			} else {
				me.createChatWindow(name);
			}
		});

		// var tpl_room = __inline('./xmeet-room.tpl');
		// var nodes = _.dom.create(tpl_room);
		// document.body.appendChild(nodes[0]);
		// var name = generateName();
		// _.dom.get('.xmeet-chat-room .name')[0].value = name;
		// _.dom.on('#room-enter', 'click', function (e) {
		// 	_.dom.toggle('.xmeet-chat-room');
		// 	me.createChatWindow(name);
		// });
	};

	GroupChat.prototype.createChatWindow = function (name) {
		var me = this;
		if (!sock) {
			sock = new SocketChat(me.name, me.roomId, me.roomName);
			sock.on('connected', function (data) {
				win = new GroupChatWindow(data.roomId, me.roomName, {
					uid: data.from,
					name: name
				});
				me.bindChatEvent();
			});

			sock.on('members', function (data) {
				members = {};
				for (var i = data.content.length; i > 0; i--) {
					var u = data.content[i - 1];
					members[u.pid] = {
						uid: u.pid,
						name: u.nickname
					};
				}
				win && win.updateUsers(members);
			});

			sock.on('joined', function (data) {
				members[data.from] = {
					uid: data.from,
					name: data.content
				};
				var u = members[data.from];
				win && win.receiveNotice(u.name + '&nbsp;&nbsp;轻轻的来了', u);
				win && win.updateUsers(members);
			});

			sock.on('leaved', function (data) {
				var user = members[data.from];
				win && win.receiveNotice(user.name + '&nbsp;&nbsp;悄悄的走了', user);
				delete members[data.from];
				win && win.updateUsers(members);
			});

			sock.on('receive', function (data) {
				var u = members[data.from];
				if (u) {
					win && win.receiveMessage(data.content, u, data.time);
				}
			});
		}
	};

	GroupChat.prototype.bindChatEvent = function () {
		win.on('send', function (data) {
			sock.send(data.message);
		});

		win.on('hide', function (data) {
			_.dom.show('.xmeet-chat-logo');
		});
	};

	function generateName() {
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
			'Beatles': '比特斯', //甲壳虫
			'Eagle': '伊格',
			'Goat': '勾特',
			'Python': '派森',
			'Cobra': '科波拉',
			'Monkey': '芒可',
			'Octopus': '奥克托帕斯', //章鱼
			'Tortoise': '托特斯',
			'Horse': '霍斯',
			'Panda': '胖达',
			'Kaola': '考拉',
			'Boar': '伯恩', //野猪
			'Squirrel': '斯奎尔',
			'Rabbit': '拉比特',
			'Sardine': '沙丁', //沙丁鱼
			'Salmon': '莎尔蒙', //鲑鱼
			'Sloth': '斯洛兹', //树懒
			'buffalo': '巴伐罗', //水牛
			'gnu': '格鲁', //角马
			'jellyfish': '杰丽菲诗',
			'shark': '沙奎尔',
			'crocodile': '克拉克戴尔', //
			'penguin': '平格温',
			'pigeon': '匹金',
			'bat': '波特', //蝙蝠
			'lizard': '李札特', //蜥蜴
			'mosquito': '马斯奎特', //蚊子
			'frog': '弗洛格', //蚊子
			'squid': '斯奎德', //乌贼
			'lobster': '罗伯斯特', //龙虾
			'ant': '安特',
			'butterfly': '巴特弗莱',
			'flamingo': '弗拉明戈', //火烈鸟
			'peacock': '皮科克', //孔雀
			'swan': '斯万', //天鹅
			'spider': '斯派德尔', //蜘蛛
			'owl': '欧尔',
			'ostrich': '奥斯纯齐', //鸵鸟
			'camel': '凯梅尔',
			'crab': '克拉伯',
			'mongoose': '芒古斯', //猫鼬
			'deer': '迪尔',
			'antelope': '艾迪路普', //羚羊
			'mustang': '木斯唐', //野马
		};
		var keys = Object.keys(names);
		return names[keys[Math.floor(keys.length * Math.random())]];
	}

	function getTemplate(name, fn) {
		_.ajax.get('/api/' + name, null, function (text) {
			fn(text);
		});
	}

	var xmeet = {
		Chat: function (roomId, roomName) {
			var groupChat = new GroupChat(roomId, roomName);
		}
	};

	window.XMeet = xmeet;

	//boot
	window.onload = function () {
		var scripts = document.getElementsByTagName('script');
		for (var i = 0; i < scripts.length; i++) {
			var s = scripts[i];
			var src = s.getAttribute('src');
			if (src && src.indexOf('xmeet.api.js') != -1) {
				var params = {};
				var paramsStr = src.split('?');
				if (paramsStr.length > 0) {
					var ps = paramsStr[1].split('&');
					for (var i = 0, len = ps.length; i < len; i++) {
						var kvs = ps[i].split('=');
						var k = kvs[0] == 'roomid' ? 'roomId' : kvs[0];
						k = kvs[0] == 'roomname' ? 'roomName' : kvs[0];
						params[k] = kvs[1];
					}
				}
				var roomId = params['roomId'] || _.md5();
				var roomName = params['roomName'] || '';
				new XMeet.Chat(roomId, roomName);
				break;
			}
		}
	}

})(window);