/* 饼图文组件对象 */
var H5ComponentPie = function (name, cfg) {
  var component = new H5ComponentBase(name, cfg);

  // 绘制网格线
  var w = cfg.width,
      h = cfg.height;

  // 加入画布（网格线背景）
  var cns = document.createElement('canvas');
  var cxt = cns.getContext('2d');
  cns.width = cxt.width = w;
  cns.height = cxt.height = h;
  $(cns).css('zIndex',1);
  component.append(cns);

  var r = w/2;

  // 加入底图层
  cxt.beginPath();
  cxt.fillStyle = "#eee";
  cxt.strokeStyle = "#eee";
  cxt.lineWidth = 1;
  cxt.arc(r, r, r, 0, 2*Math.PI);
  cxt.fill();
  cxt.stroke();

  // 绘制数据层
  var cns = document.createElement('canvas');
  var cxt = cns.getContext('2d');
  cns.width = cxt.width = w;
  cns.height = cxt.height = h;
  $(cns).css('zIndex',2);
  component.append(cns);

  var colors = [
    "#58C9B9",
    "#D1B6E1",
    "#C5E99B",
    "#F68657",
    "#E3E36A"
  ];
  var sAngel = 1.5 * Math.PI;  //设置开始角度在 12点位置
  var eAngel = 0;              //结束角度
  var aAngel = Math.PI*2;      //100%的圆结束的角度 2pi = 360


  var step = cfg.data.length;
  for (var i=0; i<step; i++) {
    var item = cfg.data[i];
    var color = item[2] || ( item[2] = colors.pop() );

    eAngel = sAngel + aAngel * item[1];
    cxt.beginPath();
    cxt.fillStyle = color;
    cxt.strokeStyle = color;
    cxt.lineWidth = .1;
    cxt.moveTo(r,r);
    cxt.arc(r, r, r, sAngel, eAngel);
    cxt.fill();
    cxt.stroke();
    sAngel = eAngel;

    //加入所有项目文本及百分比
    var text = $('<div class="text">');
    text.text(cfg.data[i][0]);
    var per = $('<div class="per">');
    per.text(cfg.data[i][1] * 100 + '%');
    text.append(per);

    var x = r + Math.sin(.5*Math.PI - sAngel) * r;
    var y = r + Math.cos(.5*Math.PI - sAngel) * r;

    if (x>w/2) {
      text.css('left',x/2);
    } else {
      text.css('right',(w-x)/2);
    }
    if (y>h/2) {
      text.css('top',y/2);
    } else {
      text.css('bottom',(h-y)/2);
    }
    if(cfg.data[i][2]) {
      text.css('color',cfg.data[i][2]);
    }
    text.css('opacity',0);

    component.append(text);
  }

  // 加如蒙版层
  var cns = document.createElement('canvas');
  var cxt = cns.getContext('2d');
  cns.width = cxt.width = w;
  cns.height = cxt.height = h;
  $(cns).css('zIndex',3);
  component.append(cns);

  // 生长动画
  cxt.fillStyle = "#eee";
  cxt.strokeStyle = "#eee";
  cxt.lineWidth = 1;


  var draw = function (per) {
    cxt.clearRect(0,0,w,h);
    cxt.beginPath();
    cxt.moveTo(r,r);
    if(per <=0) {
      cxt.arc(r,r,r,0,2*Math.PI);
      component.find('.text').css('opacity',0);
    } else {
      cxt.arc(r, r, r, sAngel, sAngel + 2*Math.PI * per,true);
    }
    cxt.fill();
    cxt.stroke();

    if (per >=1) {
      component.find('.text').css('transition','all 0s');
      H5ComponentPie.reSort(component.find('.text'));
      component.find('.text').css('transition','all 1s');
      component.find('.text').css('opacity',1);
      cxt.clearRect(0,0,w,h);
    }
  }

  draw(0);
  component.on('onLoad',function () {
    //饼图生长动画
    var s = 0;
    for (i=0; i<100; i++) {
      setTimeout(function () {
        s += 0.01;
        draw(s);
      },i*10 + 500);
    }
  })

  component.on('onLeave',function () {
    //饼图退场动画
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

// 重排
H5ComponentPie.reSort = function (list) {
  // 检测相交
  var compare = function (domA,domB) {
    // 元素的位置，不用left，因为有时候left为auto
    var offsetA = $(domA).offset();
    var offsetB = $(domB).offset();
    // domA的坐标投影
    var shadowA_x = [offsetA.left,$(domA).width() + offsetA.left];
    var shadowA_y = [offsetA.top,$(domA).height() + offsetA.top];
    // domB的坐标投影
    var shadowB_x = [offsetB.left,$(domB).width() + offsetB.left];
    var shadowB_y = [offsetB.top,$(domB).height() + offsetB.top];

//---------此块逻辑有一半错误，只处理了纵向，没处理x轴--------------
    //检测是否相交
    var intersect_x = (
      (shadowA_x[0] > shadowB_x[0] && shadowA_x[0] < shadowB_x[1])
      ||
      (shadowA_x[1] > shadowB_x[0] && shadowA_x[1] < shadowB_x[1])
    );
    var intersect_y = (
      (shadowA_y[0] > shadowB_y[0] && shadowA_y[0] < shadowB_y[1])
      ||
      (shadowA_y[1] > shadowB_y[0] && shadowA_y[1] < shadowB_y[1])
    );
//--------------------------------------
    return intersect_x && intersect_y;
  }

  //错开重排
  var reset = function (domA,domB) {
    if($(domA).css('top') != 'auto'){
      $(domA).css('top',parseInt($(domA).css('top')) + $(domB).height());
    }
    if($(domA).css('bottom') != 'auto'){
      $(domA).css('bottom',parseInt($(domA).css('bottom')) + $(domB).height());
    }
  }

  // 定义将要重拍的元素
  var willReset = [list[0]];
  $.each (list,function (i,domTarget) {
    if(compare(willReset[willReset.length - 1],domTarget)) {
      willReset.push(domTarget); //不会把自身加入对比
    }
  });

  if(willReset.length > 1) {
    $.each(willReset,function (i,domA) {
      if(willReset[i+1]){
        reset(domA,willReset[i+1]);
      }
    });
    H5ComponentPie.reSort(willReset);
  }
}
