function GroupChatWindow(roomId, self){
	this._eventsListener = {};
	this.roomId = roomId;
	this.self = self;
	this.init();
}


GroupChatWindow.prototype.init = function(){
	var me = this;
	
	var tpl = __inline('./xmeet-chatWindow.tpl');
	var nodes = _.dom.create(tpl);
	document.body.appendChild(nodes[0]);

	_.dom.on('.chat-send', 'click', function(e){
		me.sendMessage();
	});

	_.dom.on('.chat-input', 'keydown', function(e){
		if(e.which == 13){
			me.sendMessage();
			e.stopPropagation();
			e.preventDefault();
		}
		me.startTyping();
	});
};


GroupChatWindow.prototype.sendMessage = function(){
	var me = this;

	var input = _.dom.get('.chat-input')[0];
	var message = input.innerHTML;
	if(message == "") return;
	var effectContainer = _.dom.get(".chat-effect-container")[0];
	var sendButton = _.dom.get(".chat-send")[0];
	var messageElements = me.addMessage(message, me.self, null, true);
	var messageContainer = messageElements.container;
	var messagesContainer = _.dom.get(".chat-messages")[0];
	var messageBubble = messageElements.bubble;

	var oldInputHeight = 48;
	input.innerHTML = '';

	var newInputHeight = 48;
	var inputHeightDiff = newInputHeight-oldInputHeight;

	var messageEffect = _.dom.create('<div class="chat-message-effect"></div>')[0];
	messageEffect.appendChild(messageBubble.cloneNode(true));
	effectContainer.appendChild(messageEffect);
	_.dom.css(effectContainer, {left: 0, top: 0});
	me.setFilter('url(#goo)');

	var messagePos = _.dom.offset(messageBubble);
	var effectPos =  _.dom.offset(messageEffect);
	var pos = {
		x: messagePos.left - effectPos.left,
		y:messagePos.top - effectPos.top
	}

	var startingScroll = messagesContainer.scrollTop;
	var curScrollDiff = 0;
	var effectYTransition;
	var setEffectYTransition = function(dest, dur, ease){
		return TweenLite.to(
			messageEffect, dur, {
				y: dest,
				ease: ease,
				onUpdate: function(){
					var curScroll = messagesContainer.scrollTop;
					var scrollDiff = curScroll - startingScroll;
					if(scrollDiff > 0){
						curScrollDiff += scrollDiff;
						startingScroll = curScroll;

						var time = effectYTransition.time();
						effectYTransition.kill();
						effectYTransition = setEffectYTransition(pos.y - curScrollDiff, 0.8 - time, Power2.easeOut);
					}
				}
			}
		);
	}

	effectYTransition = setEffectYTransition(pos.y, 0.8, Power2.easeInOut);

	TweenLite.to(
		messageEffect, 0.6, {
			delay: 0.2,
			x: pos.x,
			ease: Quad.easeInOut,
			onComplete: function(){
			}
		}
	);

	TweenLite.from(
		messageBubble, 0.2,{
			delay: 0.65,
			opacity: 0,
			ease: Quad.easeInOut,
			onComplete: function(){
				TweenLite.killTweensOf(messageEffect);
				effectContainer.removeChild(messageEffect);

				me.dispatch('send', {
					message: message,
					from: me.self
				});
				// me.receiveMessage("hello,Ok", {name: "路人甲"});
			}
		}
	);
}

GroupChatWindow.prototype.addMessage = function(message, user, time, isSelf){
	var messagesContainer= _.dom.get(".chat-messages")[0]
	var msgList = _.dom.get('.chat-messages-list')[0];
	var messageContainer = _.dom.create('<li class="chat-message chat-message-other"></li>')[0];
	msgList.appendChild(messageContainer);

	var messageBubble = _.dom.create('<div class="chat-message-bubble"></div>')[0];
	messageBubble.innerHTML = '<p class="user">'+ user.name +'<i></i>'+ time +'</p><p class="msg">' + message + '</p>';
	messageContainer.appendChild(messageBubble);

	var oldScroll = messagesContainer.scrollTop;
	messagesContainer.scrollTop = 9999999;

	var newScroll = messagesContainer.scrollTop;
	var scrollDiff = newScroll - oldScroll;
	TweenLite.fromTo(
		msgList, 0.4, {
			y: scrollDiff
		},{
			y: 0,
			ease:Quint.easeOut
		}
	);
	return {
		container: messageContainer,
		bubble: messageBubble
	};
};

GroupChatWindow.prototype.receiveMessage = function(message, user, time){
	var me = this;
	if(user.id == me.self.id) return;
	var messageElements = me.addMessage(message, user, time, false),
		messageContainer = messageElements.container,
		messageBubble = messageElements.bubble;

	TweenLite.set(messageBubble,{
		transformOrigin: "60px 50%"
	});
	TweenLite.from(messageBubble, 0.4,{
		scale:0,
		ease:Back.easeOut
	});
	TweenLite.from(messageBubble, 0.4, {
		x:-100,
		ease:Quint.easeOut
	});
}


GroupChatWindow.prototype.startTyping = function(){
	var me = this;
	if(me.isTyping) return;

	me.isTyping = true;
	var effectContainer = _.dom.get(".chat-effect-container")[0],
		infoContainer = _.dom.get(".chat-info-container")[0];

	var dots= _.dom.create('<div class="chat-effect-dots"></div>')[0];
	_.dom.css(dots, {top: -30, left:10});
	effectContainer.appendChild(dots);

	me.setFilter('url(#goo)');
	for (var i = 0; i < 3; i++) {
		var dot= _.dom.create('<div class="chat-effect-dot">')[0];
		_.dom.css(dot, {left: i*20});
		dots.appendChild(dot);
		TweenLite.to(dot, 0.3, {
			delay: -i*0.1,
			y:30,
			yoyo: true,
			repeat: -1,
			ease:Quad.easeInOut
		});
	}

	var info = _.dom.create('<div class="chat-info-typing">')[0];
	info.innerHTML = "正在输入";
	_.dom.css(info, {transform: "translate3d(0, 30px, 0)" });
	infoContainer.appendChild(info);
	TweenLite.to(info, 0.3, {
		y: 0
	});
};

GroupChatWindow.prototype.StoppedTyping = function(){
	var me = this;
	if(!me.isTyping) return;

	me.isTyping = false;
	var effectContainer = _.dom.get(".chat-effect-container")[0],
		infoContainer = _.dom.get(".chat-info-container")[0];

	var dots= _.dom.get(".chat-effect-dots")[0];
	TweenLite.to(dots, 0.3, {
		y: 40,
		ease: Quad.easeIn,
	});

	var info = _.dom.get(".chat-info-typing")[0];
	TweenLite.to(info, 0.3, {
		y: 30,
		ease: Quad.easeIn,
		onComplete:function(){
			effectContainer.removeChild(dots);
			infoContainer.removeChild(info);
			me.setFilter('none');
		}
	});
};

GroupChatWindow.prototype.setFilter = function(value){
	var effectContainer = _.dom.get(".chat-effect-container")[0];
	_.dom.css(effectContainer, {"-webkit-filter": value});
};


GroupChatWindow.prototype.on = function(eventType, fn){
	var me = this;
	me._eventsListener[eventType] = fn;
};

GroupChatWindow.prototype.dispatch = function(eventType, param){
	var me = this;
	var fn = me._eventsListener[eventType];
	fn && fn(param);
};

window.GroupChatWindow = GroupChatWindow;