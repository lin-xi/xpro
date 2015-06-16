<div class="xmeet-chat-window">
	<div class="window-title">
		<img width="48" height="48" src="api/img/chat.png"/>
		<span class="title">交流群</span>
		<span class="setting"></span>
	</div>
	<div id="" class="window-body chat-messages">
		<div class="chat-messages-list"></div>
	</div>

	<div class="chat-input-bar">
		<div class="chat-info-container">
		</div>
		<div class="chat-effect-container">
			<div class="chat-effect-bar"></div>
		</div>
		<div class="chat-input-wrapper">
			<button class="chat-input-tool">
				<i class="icon-emotion"></i>
			</button>
			<div class="chat-input" contenteditable="true"></div>
			<button class="chat-send">
				<i class="icon-send" style="transform: translate3d(0px, 0px, 0px);"></i>
			</button>
		</div>
	</div>

	<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="800">
	  <defs>
	    <filter id="goo">
			<feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"></feGaussianBlur>
			<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo"></feColorMatrix>
			<feComposite in="SourceGraphic" in2="goo"></feComposite>
	    </filter>
	  </defs>
	</svg>
</div>