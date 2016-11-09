var H5_loading = function (images,firstPage) {
  var id = this.id;

  if (this._images === undefined) { //第一次进入
    this._images = (images || []).length;
    this._loaded = 0;

    window[id] = this;
    //把当前对象存储在全局对象 window中，用来进行某个图片加载完成后的回调

    for (s in images) {
      var item = images[s];
      var img = new Image;
      img.src = item;
      img.onload = function () {
      // 当img【下载完成】后才会执行 loader()，
      // 给img绑定onload事件不会造成阻塞，会继续执行之后的代码
        window[id].loader();
      }
    }
    $('#rate').text('0%');          // 初始化 0%；
    return this;                    // 第一走到这return，之后的代码不会再执行
  } else {
    this._loaded ++;
    $('#rate').text(((this._loaded/this._images * 100) >>0) + '%');
    // 一直到 _loaded = _images时 才不会执行return，方可继续执行之后的代码
    if (this._loaded < this._images) {
      return this;
    }
  }
  window[id] = null;

  this.el.fullpage({
    onLeave:function(index,nextIndex,direction){
      $(this).find('.h5_component').trigger('onLeave');
    },
    afterLoad:function(anchorLink,index){
      $(this).find('.h5_component').trigger('onLoad');
    }
  });
  this.page[0].find('.h5_component').trigger('onLoad');
  this.el.show();
  if(firstPage) {
    $.fn.fullpage.moveTo(firstPage);
  }
}
