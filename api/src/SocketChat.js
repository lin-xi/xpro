function SocketChat(name, roomId, roomName) {
	this._eventsListener = {};
	this.name = name;
	this.room = {
		id: roomId,
		name: roomName
	};
	this.init();
}

SocketChat.prototype.init = function () {
	var me = this;
	// ws://meet.xpro.im:8080/xgate/websocket/{$xnest_id}?nickname={$nickname}
	// var url = "{{url}}/{{$xnest_id}}?nickname={{$nickname}}";
	// url = _.render(url, {
	// 	url: me.url,
	// 	xnest_id: room.id,
	// 	nickname: user.name
	// });

	var config = {
		wsUrl: 'ws://meet.xpro.im:8080/xgate/websocket/'
	};
	var url = config.wsUrl + md5(location.host + me.room.id) + '?nickname=' + me.name;
	var socket = me.socket = new WebSocket(url);
	socket.onopen = function (e) {
		console.log('open');
	};
	socket.onmessage = function (e) {
		me.parseMessage(JSON.parse(e.data));
	};
	socket.onerror = function (e) {
		console.log(e);
	};
	socket.onclose = function (e) {};
};

SocketChat.prototype.send = function (messsage) {
	this.socket.send(messsage);
};

SocketChat.prototype.parseMessage = function (data) {
	var me = this;
	switch (data.type) {
		case 'self':
			me.dispatch('connected', wrapData('connected'));
			break;
		case 'member_count':
			//do nothing
			break;
		case 'members':
			me.dispatch('members', wrapData('members'));
			break;
		case 'join':
			me.dispatch('joined', wrapData('joined'));
			break;
		case 'leave':
			me.dispatch('leaved', wrapData('leaved'));
			break;
		case 'changename':
			me.dispatch('changeName', wrapData('changeName'));
			break;
		case 'normal':
			me.dispatch('receive', wrapData('receive'));
			break;
	}

	function wrapData(type) {
		return {
			type: type,
			roomId: data.xnest,
			from: data.from,
			content: data.payload,
			time: data.send_time
		};
	}
};

SocketChat.prototype.on = function (eventType, fn) {
	var me = this;
	me._eventsListener[eventType] = fn;
};

SocketChat.prototype.dispatch = function (eventType, param) {
	var me = this;
	var fn = me._eventsListener[eventType];
	fn && fn(param);
};

window.SocketChat = SocketChat;