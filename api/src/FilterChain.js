var Filter = {
	emotionOut: function(input){
		return input.replace(/\<img src="http:\/\/meet.xpro.im\/v2\/api\/img\/emotion\/(\d+).gif" width="24px" height="24px"\>/g, function(s0, s1){
			return '#'+s1+':';
		});
	},
	emotionIn: function(input){
		return input.replace(/#(\d+):/g, function(s0, s1){
			if(s1-0<133 && s1-0>0){
				return '<img src="http://meet.xpro.im/v2/api/img/emotion/' + s1 + '.gif" width="24px" height="24px"\>';
			} else {
				return s0;
			}
		});
	}
};

function FilterChain(input) {
	this.input = input;
}
FilterChain.prototype.filter = function(name){
	var fn = Filter[name];
	if(fn){
		this.input = fn(this.input);
	}
	return new FilterChain(this.input);
};
FilterChain.prototype.toString = function(){
	return this.input;
};

window.FilterChain = FilterChain;