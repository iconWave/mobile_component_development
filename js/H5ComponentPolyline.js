/* 折线图文组件对象 */
var H5ComponentPolyline = function (name, cfg) {
  var component = new H5ComponentBase(name, cfg);

  // 绘制网格线
  var w = cfg.width,
      h = cfg.height;

  // 加入画布（网格线背景）
  var cns = document.createElement('canvas');
  var cxt = cns.getContext('2d');
  cns.width = cxt.width = w;
  cns.height = cxt.height = h;
  component.append(cns);

  // 水平线网格线分割成10份
  var step = 10;
  cxt.beginPath();
  cxt.lineWidth = 1;
  cxt.strokeStyle = "#aaaaaa";

  window.cxt = cxt;

  for (var i=0; i<step+1; i++) {
    var y = (h/step) * i;
    cxt.moveTo(0,y);
    cxt.lineTo(w,y);
  }

  // 垂直网格线（根据项目的个数去分）
  step = cfg.data.length + 1;
  var text_w = w / step >> 0;  // >>为不要小数的偷懒写法
  for (var i=0; i<step+1; i++) {
    var x = (w/step) * i;
    cxt.moveTo(x,0);
    cxt.lineTo(x,h);

    // x轴 选项名
    if(cfg.data[i]) {
      var text = $('<div class="text">');
      text.text(cfg.data[i][0]);
      text.css('width',text_w/2).css('left',x/2 + text_w/4);
      component.append(text);
    }
  }
  cxt.stroke();


  // 加入画布 （数据层）
  var cns = document.createElement('canvas');
  var cxt = cns.getContext('2d');
  cns.width = cxt.width = w;
  cns.height = cxt.height = h;
  component.append(cns);

  /**
   * 绘制折线
   * @param {float} per 0到1之间的数据，会根据这个值绘制最终数据对应的中间状态
   *
   */
  var draw = function (per) {
    cxt.clearRect(0,0,w,h);

    cxt.beginPath();
    cxt.lineWidth = 3;
    cxt.strokeStyle = '#ff8878';

    var x = 0,
        y = 0;
    var row_w = ( w / (cfg.data.length+1) );
    // 画点
    for(i in cfg.data) {
      var item = cfg.data[i];

      x = row_w * i + row_w;  // +row_w是为了横坐标右移一格
      y = h - h * item[1] * per;    // 没有做动画前的设置 y = h * (1-item[1]);
      cxt.moveTo(x,y);
      cxt.arc(x,y,5,0,2*Math.PI);
    }
    // 连线
    // 移动画笔到第一个数据的点位置
    cxt.moveTo( row_w, h - h*cfg.data[0][1]*per); //没有做动画前的moveTo的y值 h*(1-cfg.data[0][1])
    for(i in cfg.data) {
      var item = cfg.data[i];
      x = row_w * i + row_w;
      y = h - h * item[1] * per;    // 没有做动画前的设置 y = h * (1-item[1]);
      cxt.lineTo(x,y);
    }
    cxt.stroke();
    // 绘制阴影
    cxt.lineWidth = 1;
    cxt.lineTo(x,h);
    cxt.lineTo(row_w,h);
    cxt.fillStyle = 'rgba(255, 136, 120, 0.52)'
    cxt.fill();
    // 写数据
    for(i in cfg.data) {
      var item = cfg.data[i];
      x = row_w * i + row_w;
      y = h - h * item[1] * per;    // 没有做动画前的设置 y = h * (1-item[1]);
      cxt.fillStyle = item[2] ? item[2] : '#595959';
      cxt.fillText(((item[1]*100)>>0)+'%', x-10, y-10);
    }
    cxt.stroke();
  }


  component.on('onLoad',function () {
    //折线生长动画
    var s = 0;
    for (i=0; i<100; i++) {
      setTimeout(function () {
        s += 0.01;
        draw(s);
      },i*10 + 500);
    }
  })

  component.on('onLeave',function () {
    //折线退场动画
    var s = 1;
    for (i=0; i<100; i++) {
      setTimeout(function () {
        s -= 0.01;
        draw(s);
      },i*10);
    }
  })

  return component;
}
