(function () {
  'use strict';
  const days = [
    ['09.23','北京 → 潍坊','d1','潍坊老家','520–580 km · 预计全天 8–10 小时',[
      ['06:30','出发 / 满电','早餐后出发，导航目的地设为老家实际地址。90–100% 电量；北京城区位置不同会影响总里程。'],['08:30','第一次服务区休息','行驶约 90–120 分钟就休息 20 分钟，换尿裤、喝水、走动；不等充电才停车。'],['10:30','沧州补能 + 午饭','优先顺路高速快充；免费闪充候选为沧州天成郡府，属于城区站，须检查绕行。建议补至 85–90%，保守按 400 km 续航核算。'],['12:00','继续前往潍坊','宝宝午睡期间继续行驶，中途按驾驶员状态休息。到下一站预计电量不足 20% 时，在滨州再补一次。'],['16:00','到家 / 不加景点','这是含休息的计划到达时刻，遇堵车可延后；当天只团聚吃饭。']], '午饭选服务区热食或沧州停车方便的商场；两成人预算 100–160 元，宝宝带熟悉的主食。','长途日不要为了免费桩增加大量绕行；滨州城区闪充为第二备选。','雨天降速并增加 1–2 小时缓冲，无法舒适完成时在途中住宿。'],
    ['09.24','潍坊 · 陪家人','d2','潍坊老家','市内短途', [['09:00','睡醒再出门','前一天长途后恢复，上午附近公园活动 45–60 分钟。'],['11:30','家中午饭','保持平时饭点；午后 12:30–14:30 留给午睡。'],['15:30','可选风筝文化体验','风筝博物馆只作短访候选，开放时间与预约另行核对；也可完全留在家里。']], '尝肉火烧、和乐，宝宝以软面、蒸蛋为主。','家中停车，整理车内儿童活动用品。','下雨就留在家里，不补打卡。'],
    ['09.25','中秋 · 团圆日','d2','潍坊老家','不安排跨城', [['09:30','陪长辈 / 采购','选择一个轻松活动，避免上午塞满。'],['12:00','团圆午饭','保留饭后午睡；晚上不安排长距离开车。'],['17:00','散步赏月','根据天气在住处附近走走，宝宝按平时作息休息。']], '团圆餐为主；海鲜熟透，整粒坚果与整颗葡萄不直接给宝宝。','确认车上儿童座椅固定、胎压和补胎工具。','室内团圆活动。'],
    ['09.26','潍坊 · 整备出发','d2','潍坊老家','半天活动 + 整备', [['09:00','十笏园周边可选','停留约 60–90 分钟，园内台阶较多，推车和背带组合。'],['12:30','午睡 / 收行李','分出当天随手包和酒店大行李，避免路上翻箱。'],['16:30','补能至 90%','恒信时代广场闪充站候选，先在 App 查开放与权益。'],['19:00','确认明日路线','检查蓬莱阁预约、烟台酒店最晚入住及停车入口。']], '老潍县家常菜，晚饭清淡。','潍坊补能是明日跨城前的重要一步。','取消短游，只做补能和行李整理。'],
    ['09.27','蓬莱 → 烟台','d5','烟台 · 第 1 晚','约 330 km · 换城日', [['07:00','潍坊出发','途中安排一次 20 分钟休息。'],['10:30','蓬莱阁主景区','成人参考 100 元；只走主阁与水城，不叠加索道、三仙山和海洋馆。推车不适合全部台阶路段。'],['12:00','蓬莱午饭','小面或鲅鱼水饺；景区外找可停车餐厅。'],['13:00','前往烟台 / 午睡','约 80–90 km，车上睡眠不足时入住后继续休息。'],['16:30','酒店附近海边','只走 30–45 分钟，18:00 左右吃晚饭。']], '午饭蓬莱小面 + 水饺，晚饭烟台家常菜；两成人全天 250–350 元。','蓬莱北关路利群广场闪充为候选，电量充足可跳过；停车入口当天导航核准。','取消蓬莱阁，直接到烟台酒店休息，节省一次露天活动。'],
    ['09.28','烟台 · 慢看山海','d6','烟台 · 第 2 晚','市内约 20–40 km', [['09:00','烟台山—朝阳街','步行 60–90 分钟，灯塔与额外项目另查票价；不把登高作为必选。'],['11:30','朝阳街附近午饭','避开正午排队，选有儿童椅的室内餐厅。'],['12:30','回酒店午睡','完整留到 14:30，不夹购物。'],['16:00','渔人码头散步','拍照约 45 分钟，风大就提前结束。'],['18:00','晚饭 / 明日补能','烟台电视台闪充在莱山方向，仅顺路时去；不要为充电来回穿城。']], '鲅鱼水饺、焖子作为本地尝鲜；宝宝清汤面和蒸蛋。','两处景点均用周边公共停车场；白天优先打车，减少挪车。','烟台市博物馆为室内候选，先核对预约与闭馆日；否则酒店休息。'],
    ['09.29','烟台 → 威海 · 安顿','d7','威海 · 第 1 晚','约 85–100 km', [['09:00','早餐后退房','当天不赶船班，避免跨城加登岛挤压午睡。'],['10:30','到威海 / 寄存行李','酒店未到入住时间先寄存，提前问能否早入住。'],['11:30','酒店附近午饭','饭后办理入住。'],['12:30','午睡到 14:30','优先保证宝宝作息。'],['16:00','海源公园','散步与看渔船 45–60 分钟，不攀爬礁石。']], '酒店附近家常菜或海菜包子，全天餐费规划 250–350 元。','有需求可选择威海北站闪充，属城区站；先看与酒店的距离再决定。','公园取消，入住与附近商场午饭即可。'],
    ['09.30','威海 · 刘公岛','d8','威海 · 第 2 晚','登岛半日 · 船班受天气影响', [['08:00','到客运中心','提前预约，预留停车、安检、候船时间；随身带证件和宝宝所需证明。'],['09:00','乘船 / 博物院','成人参考 122 元含往返船；2 岁符合官方低龄免票范围。'],['10:30','缩短岛上动线','以一个博物馆为主，观光车额外收费另查，不强求环岛。'],['12:00','准备离岛','排队和船班可能延迟，带宝宝主食以免错过饭点。'],['14:00','酒店午睡','下午不再安排火炬八街等远端目的地。']], '岛上只作简餐备选，带足水和宝宝主食；晚上酒店附近吃。','客运中心停车以现场指示为准，停车费未核定。','停航就用海源公园或酒店休息替代，保持原酒店不动。'],
    ['10.01','荣成 · 那香海','d9','威海 · 第 3 晚','缩短至那香海往返 · 约 100–140 km', [['08:00','提前出发','国庆首日预留堵车，出发前观察导航预计时间。'],['09:30','那香海沙滩','只玩沙、不安排下海；走可通行的平缓区域，停留 60–90 分钟。'],['11:30','午饭','找室内热饭，别让宝宝在海风里久坐。'],['12:30','回威海 / 午睡','直接返回，取消沉船、海草房的多点连刷。'],['16:00','酒店周边自由活动','宝宝状态好再散步。']], '选择可停车的家常菜；海鲜问清计价单位与重量，全天 300–400 元。','荣成兴飞在荣成城区，距离那香海并不近，仅深入荣成时备用；本日优先威海出发前补能。','大风雨天取消荣成，留在威海；无需执着假期第一天跑景点。'],
    ['10.02','威海 → 青岛','d10','青岛 · 第 1 晚','约 270–310 km · 预留 5–6 小时', [['08:30','早餐后退房','建议至少 85% 出发；按保守续航判断途中是否需补电。'],['10:30','服务区休息','换尿裤、走动；导航到达电量偏低就充电。'],['12:00','午饭 / 莱西候选补能','南京北路闪充属于城区站，可能明显绕行，先比较高速桩与出城路线。'],['14:30','青岛入住','停车后以酒店休息为主。'],['17:00','五四广场 / 奥帆外侧','只选一段步道，不把两个景点都走完。']], '途中简餐 100–160 元，青岛晚餐 180–260 元。','大车提前确认酒店地库限高与车位；不承诺酒店现场一定有空桩。','天气差直接入住，不追加夜景。'],
    ['10.03','青岛 · 老城','d11','青岛 · 第 2 晚','建议停车后打车 / 步行', [['08:00','栈桥远观','人多时在海岸边拍照即可，不必走到桥端。'],['09:30','大学路附近慢走','选一条短路线，台阶多时用背带。'],['11:00','提前午饭','居民区家常菜，避免网红店长队。'],['12:30','酒店午睡','把往返酒店时间算在午睡前。'],['16:00','可选小鱼山','仅宝宝状态和天气合适时去；登高可直接删掉。']], '锅贴、排骨米饭、鲅鱼饺子轮换；两成人全天 300–400 元。','老城停车紧张，避免多次挪车；选一个停车点后步行或打车。','老城散步取消，择近商场用餐与酒店亲子时间。'],
    ['10.04','青岛 · 海底世界','d12','青岛 · 第 3 晚','一个付费主景点', [['08:30','预约早场入园','官网成人通票参考 170 元；宝宝免费范围和所需凭证在购票页确认。'],['10:30','结束主馆参观','不为演出久等，拥挤时提前离开。'],['11:30','午饭','景区外正常餐厅，提前备一份宝宝主食。'],['12:30','酒店午睡','下午留空。'],['16:00','可选八大关外侧','只走 30–45 分钟平缓路，收费建筑不必进入。']], '午餐面食或家常菜，晚上可选一顿正式海鲜餐，预算另加 100–200 元。','景区停车需排队，优先打车；前夜确认早场票，别到现场才买。','大雨海底世界仍可视情况保留，取消八大关；出行受阻则申请按规则退票。'],
    ['10.05','青岛 → 潍坊','d13','潍坊老家','约 165–200 km', [['09:00','退房前整理','检查证件、充电线和宝宝安抚物。'],['10:00','出发回潍坊','中途按需休息一次。'],['13:00','到家吃饭午睡','当天不再加景点。'],['17:00','返京准备','补至 90–100%，复查轮胎与导航路线，预留 10 月 7 日机动。']], '回家吃饭，路上简餐备用。','潍坊补电优先；返京不要从低 SOC 出发。','按天气增加路上缓冲。'],
    ['10.06','潍坊 → 北京','d14','北京家中','520–580 km · 全天驾驶日', [['06:30','满电出发','返程高峰不一定避开，预留全天。'],['08:30','服务区休息','每 90–120 分钟主动休息。'],['10:00','滨州 / 沧州补能决策','按车机预测到达 SOC 选择，不预设一次一定够；先看顺路高速桩。'],['12:00','午饭 + 第二次弹性补能','城区免费闪充仅在绕行可接受时使用。'],['16:00','预计到京','视实际拥堵调整，不以赶到时间代替休息。']], '服务区热食 + 自带宝宝主食，餐费规划 150–250 元。','始终以 20% 到达余量判断下一段；10 月 7 日保留为返程缓冲。','遇到大雨或疲劳，途中休息或住宿。']
  ];
  document.addEventListener('DOMContentLoaded',function(){
    const root=document.querySelector('.roadtrip'); if(!root)return;
    root.classList.add('planner-app');
    const hero=root.querySelector('.roadtrip-hero');
    hero.querySelector('h1').innerHTML='山东半岛，<span>一家三口慢慢走。</span>';
    const nav=document.createElement('nav'); nav.className='planner-nav'; nav.setAttribute('aria-label','攻略工作台');
    nav.innerHTML='<b>半岛旅行计划 <small>2026 秋</small></b><div>'+[['journey','每日行程'],['stays','酒店对比'],['charging','补能计划'],['food','吃饭攻略'],['budget','预算清单']].map(x=>'<button type="button" data-view="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
    hero.after(nav);
    const workspace=document.createElement('section');workspace.className='planner-workspace';workspace.id='planner-workspace';
    workspace.innerHTML='<aside class="planner-days" aria-label="选择日期"></aside><section class="planner-detail" aria-live="polite"></section><aside class="planner-map"></aside>';
    nav.after(workspace);
    const mapSection=root.querySelector('#route-map');workspace.querySelector('.planner-map').append(mapSection);
    const mapNote=document.createElement('p');mapNote.className='route-map-note';mapNote.style.color='#67766d';mapNote.textContent='点击标记查看地址并打开高德导航。全览虚线为行程示意，不是实时驾车路线；部分酒店与景点为区域定位，导航请按名称确认入口。';mapSection.append(mapNote);
    root.querySelector('#day-by-day').hidden=true;
    const detail=workspace.querySelector('.planner-detail');
    const dayNav=workspace.querySelector('.planner-days');
    days.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML='<small>'+d[0]+' · D'+(i+1)+'</small><strong>'+d[1]+'</strong>';b.onclick=()=>selectDay(i);dayNav.append(b);});
    function selectDay(i){
      const d=days[i];Array.from(dayNav.children).forEach((b,j)=>{b.classList.toggle('selected',i===j);b.setAttribute('aria-pressed',String(i===j));});
      detail.innerHTML='<p class="roadtrip-eyebrow">DAY '+String(i+1).padStart(2,'0')+' / '+d[0]+'</p><h2>'+d[1]+'</h2><p class="planner-sub">'+d[4]+'<br>住宿：'+d[3]+'</p><div class="planner-mode"><button type="button" class="selected" data-mode="normal">推荐安排</button><button type="button" data-mode="rain">雨天 / 状态不佳</button></div><div class="planner-timeline">'+d[5].map(s=>'<article><time>'+s[0]+'</time><div><h3>'+s[1]+'</h3><p>'+s[2]+'</p></div></article>').join('')+'</div><div class="planner-rain" hidden><h3>当天替代安排</h3><p>'+d[8]+'</p><p>保留已订住宿，上午 10 点前决定是否取消室外项目；午睡时段不挪作补打卡。</p></div><div class="planner-notes"><h3>吃什么 · 预算是计划值</h3><p>'+d[6]+'</p><h3>开车与停车</h3><p>'+d[7]+'</p></div><div class="planner-next"><button type="button" id="prev-day" '+(i===0?'disabled':'')+'>← 前一天</button><button type="button" id="next-day" '+(i===13?'disabled':'')+'>后一天 →</button></div>';
      detail.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{detail.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('selected',b===x));const rain=b.dataset.mode==='rain';detail.querySelector('.planner-timeline').hidden=rain;detail.querySelector('.planner-rain').hidden=!rain;});
      detail.querySelector('#prev-day').onclick=()=>selectDay(i-1);detail.querySelector('#next-day').onclick=()=>selectDay(i+1);
      window.dispatchEvent(new CustomEvent('trip:day',{detail:d[2]}));
    }
    const sections=['stays','charging','food','budget','checklist'];
    function showView(view){workspace.hidden=view!=='journey';sections.forEach(id=>{root.querySelector('#'+id).hidden=!(id===view||(view==='budget'&&id==='checklist'));});nav.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b.dataset.view===view));window.dispatchEvent(new Event('trip:resize'));}
    nav.querySelectorAll('button').forEach(b=>b.onclick=()=>showView(b.dataset.view));
    root.querySelectorAll('[data-map-id]').forEach(b=>b.addEventListener('click',()=>showView('journey'),true));
    hero.querySelectorAll('a').forEach(a=>{a.href='#planner-workspace';a.onclick=()=>showView('journey');});
    root.querySelectorAll('.roadtrip-snapshot,.roadtrip-notice,.roadtrip-final-note').forEach(e=>e.hidden=true);
    root.querySelectorAll('.hotel-card').forEach((card,i)=>{const button=document.createElement('button');button.className='hotel-select';button.type='button';button.textContent='选作住宿方案';try{if(localStorage.getItem('trip-hotel-'+Math.floor(i/2))===String(i))button.textContent='✓ 已选此方案';}catch(e){}card.append(button);button.onclick=()=>{card.parentElement.querySelectorAll('.hotel-select').forEach(b=>b.textContent='选作住宿方案');button.textContent='✓ 已选此方案';try{localStorage.setItem('trip-hotel-'+Math.floor(i/2),String(i));}catch(e){}};});
    const hotels=root.querySelectorAll('.hotel-card');
    hotels[1].querySelector('.hotel-links a').href='https://hotels.ctrip.com/hotels/8899814.html';
    hotels[2].querySelector('.hotel-links a').href='https://hotels.ctrip.com/hotels/640579.html';
    root.querySelector('#stays .roadtrip-section__head > p').textContent='房价为预算估算，不是指定入住日期的实时报价';
    const source=document.createElement('p');source.className='booking-tip';source.innerHTML='参考与复核：<a href="https://www.hilton.com/zh-hans/hotels/yntjrhi-hilton-yantai/hotel-location/" target="_blank" rel="noopener">烟台希尔顿官方地址</a> · <a href="https://www.qdhdworld.com/" target="_blank" rel="noopener">海底世界票价</a> · <a href="https://www.byd.com/cn/charge-station" target="_blank" rel="noopener">比亚迪官方查站</a>。闪充站来自 2026-09-07 第三方公开快照，投运和免费权益需在官方 App 再确认。';root.querySelector('#charging').append(source);
    showView('journey');selectDay(4);
  });
})();
