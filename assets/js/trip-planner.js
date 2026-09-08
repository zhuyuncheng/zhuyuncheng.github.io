(function () {
  'use strict';
  const days = [
    ['09.23','北京 → 潍坊','d1','潍坊老家','520–580 km · 预计全天 8–10 小时',[
      ['06:30','出发 / 满电','早餐后出发，导航目的地设为老家实际地址。90–100% 电量；北京城区位置不同会影响总里程。'],['08:30','第一次服务区休息','行驶约 90–120 分钟就休息 20 分钟，换尿裤、喝水、走动；不等充电才停车。'],['10:30','沧州补能 + 午饭','优先顺路高速快充；免费闪充候选为沧州天成郡府，属于城区站，须检查绕行。建议补至 85–90%，保守按 400 km 续航核算。'],['12:00','继续前往潍坊','宝宝午睡期间继续行驶，中途按驾驶员状态休息。到下一站预计电量不足 20% 时，在滨州再补一次。'],['16:00','到家 / 不加景点','这是含休息的计划到达时刻，遇堵车可延后；当天只团聚吃饭。']], '午饭选服务区热食或沧州停车方便的商场；两成人预算 100–160 元，宝宝带熟悉的主食。','长途日不要为了免费桩增加大量绕行；滨州城区闪充为第二备选。','雨天降速并增加 1–2 小时缓冲，无法舒适完成时在途中住宿。'],
    ['09.24','潍坊 · 陪家人','d2','潍坊老家','市内短途', [['09:00','睡醒再出门','前一天长途后恢复，上午附近公园活动 45–60 分钟。'],['11:30','家中午饭','保持平时饭点；午后 12:30–14:30 留给午睡。'],['15:30','可选风筝文化体验','风筝博物馆只作短访候选，开放时间与预约另行核对；也可完全留在家里。']], '尝肉火烧、和乐，宝宝以软面、蒸蛋为主。','家中停车，整理车内儿童活动用品。','下雨就留在家里，不补打卡。'],
    ['09.25','中秋 · 团圆日','d3','潍坊老家','不安排跨城', [['09:30','陪长辈 / 采购','选择一个轻松活动，避免上午塞满。'],['12:00','团圆午饭','保留饭后午睡；晚上不安排长距离开车。'],['17:00','散步赏月','根据天气在住处附近走走，宝宝按平时作息休息。']], '团圆餐为主；海鲜熟透，整粒坚果与整颗葡萄不直接给宝宝。','确认车上儿童座椅固定、胎压和补胎工具。','室内团圆活动。'],
    ['09.26','潍坊 · 整备出发','d4','潍坊老家','半天活动 + 整备', [['09:00','十笏园周边可选','停留约 60–90 分钟，园内台阶较多，推车和背带组合。'],['12:30','午睡 / 收行李','分出当天随手包和酒店大行李，避免路上翻箱。'],['16:30','补能至 90%','恒信时代广场闪充站候选，先在 App 查开放与权益。'],['19:00','确认明日路线','检查蓬莱阁预约、烟台酒店最晚入住及停车入口。']], '老潍县家常菜，晚饭清淡。','潍坊补能是明日跨城前的重要一步。','取消短游，只做补能和行李整理。'],
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
  const related={
    d1:[['闪充','c-cangzhou','沧州主补能','休息、午饭与补能合并。'],['闪充','c-binzhou','滨州备选闪充','到达电量偏低时执行。']],
    d2:[['景点','a-weifang','潍坊轻松日','十笏园或风筝博物馆二选一。'],['闪充','c-weifang','潍坊出发前补能','26 日晚优先充至 90%。']],
    d5:[['景点','a-penglai','蓬莱阁与水城','本日唯一主景点。'],['住宿','h-yantai-b','烟台世茂希尔顿','海边与老城便利。'],['闪充','c-penglai','蓬莱备选闪充','仅电量不够才充。'],['美食','f-yantai','蓬莱 / 烟台吃饭','小面、水饺和清淡家常菜。']],
    d6:[['景点','a-yantaishan','烟台山与朝阳街','上午短步行。'],['景点','a-fisher','渔人码头','午睡后短停，大风即删。'],['景点','a-yangma','养马岛环岛','日落自驾备选。'],['住宿','h-yantai-b','烟台住宿基地','回房午睡优先。']],
    d7:[['景点','a-haiyuan','海源公园','入住后的低强度散步。'],['景点','a-banyue','半月湾','清晨 / 日落备选。'],['住宿','h-weihai-b','威海蓝海御华','连续住三晚更舒适。'],['闪充','c-weihai','威海北站闪充','顺路或电量偏低时使用。']],
    d8:[['景点','a-liugong','刘公岛','船班与天气决定当天节奏。'],['住宿','h-weihai-b','威海住宿基地','离岛后直接回酒店。'],['美食','f-weihai','韩乐坊餐饮区','室内有餐椅的餐厅优先。']],
    d9:[['景点','a-naxianghai','那香海钻石沙滩','国庆首日早到，只玩沙。'],['景点','a-chengshan','成山头','晴天无大风的升级项。'],['景点','a-jinshi','金石湾艺术园区','与成山头二选一。'],['闪充','c-rongcheng','荣成备选闪充','深入荣成时备用。']],
    d10:[['闪充','c-laixi','莱西途中补能','先比较高速桩绕行成本。'],['住宿','h-qingdao-b','青岛海景花园','停车与亲子服务更稳。'],['景点','a-olympic','奥帆中心','入住后只走一段。'],['景点','a-xiaomai','小麦岛','日落备选。']],
    d11:[['景点','a-zhanqiao','栈桥','早到远观即可。'],['景点','a-xiaoyushan','小鱼山','状态好再上坡。'],['住宿','h-qingdao-a','栈桥海景亚朵','老城步行便利。'],['美食','f-qingdao','青岛老城吃饭','不排网红长队。']],
    d12:[['景点','a-underwater','青岛海底世界','早场主任务。'],['景点','a-badaguan','八大关','午睡后平缓短走。'],['景点','a-xiaomai','小麦岛日落','状态好再去。'],['闪充','c-qingdao','青岛市内闪充','住宿期间补能兜底。']],
    d13:[['住宿','h-qingdao-b','青岛退房点','检查证件和充电线。'],['闪充','c-weifang','潍坊返京前补能','回家后补至 90–100%。']],
    d14:[['闪充','c-binzhou','滨州返京主补能','以车机 SOC 决定。'],['闪充','c-cangzhou','沧州弹性补能','不明显绕行才使用。']]
  };
  const candidateGroups={
    'charge-north':{title:'长途补能',type:'充电',options:[
      {id:'c-cangzhou',name:'A · 沧州天成郡府闪充',meta:'免费闪充优先',pro:'可把午饭、休息、补能合并',con:'需要下高速进城，拥堵时绕行成本高'},
      {id:'c-binzhou',name:'B · 滨州黄河二路闪充',meta:'更靠近潍坊',pro:'适合前半程耗电偏高时兜底',con:'同为城区站，不能替代顺路高速桩'}]},
    'charge-weifang-ready':{title:'出发前补能',type:'充电',options:[
      {id:'c-weifang',name:'A · 恒信时代广场闪充',meta:'补至 90–100%',pro:'次日跨城无需临时找桩',con:'需提前确认权益和空闲枪位'},
      {id:null,name:'B · 家附近补能',meta:'路线最省事',pro:'不专程绕路，收行李更从容',con:'不一定能用免费闪充权益'}]},
    'charge-return':{title:'返京补能',type:'充电',options:[
      {id:'c-binzhou',name:'A · 滨州主补能',meta:'更早建立余量',pro:'保守、安全，后程仍可在沧州追加',con:'若出发满电可能充电偏早'},
      {id:'c-cangzhou',name:'B · 沧州主补能',meta:'减少一次停车',pro:'更接近北京，单次补能利用率高',con:'堵车或低温时前段余量更紧'}]},
    'attraction-penglai':{title:'当天主景点',type:'景点',options:[
      {id:'a-penglai',name:'A · 蓬莱阁与水城',meta:'经典人文 · 2–3 小时',pro:'山东代表性强，路线成熟',con:'台阶多、节假日人流大'},
      {id:'a-penglai-ocean',name:'B · 蓬莱海洋极地世界',meta:'室内亲子 · 3–4 小时',pro:'两岁宝宝参与感更强，天气影响小',con:'票价较高且假期馆内拥挤'},
      {id:'a-sanxian',name:'C · 三仙山',meta:'园林建筑 · 2–3 小时',pro:'建筑与园林很出片，步行节奏自由',con:'园区大，和蓬莱阁同日容易超量'},
      {id:'a-yantaishan',name:'D · 直接去烟台山',meta:'轻松慢游 · 1–1.5 小时',pro:'少一次停车，离烟台酒店近',con:'会放弃蓬莱这一站'}]},
    'hotel-yantai':{title:'烟台连住酒店',type:'酒店',options:[
      {id:'h-yantai-a',name:'A · 百纳瑞汀酒店',meta:'老城便利型',pro:'靠近烟台山、朝阳街，步行更方便',con:'节日周边车流和停车压力较大'},
      {id:'h-yantai-b',name:'B · 世茂希尔顿酒店',meta:'亲子舒适型',pro:'早餐与服务更稳定，午睡回房方便',con:'价格通常更高'}]},
    'food-penglai':{title:'午餐落点',type:'美食',options:[
      {id:'f-penglai',name:'A · 蓬莱阁外小面 / 水饺',meta:'人均约 40–70 元',pro:'游完直接吃，不增加跨城饥饿等待',con:'景区周边热门店可能排队'},
      {id:'f-yantai',name:'B · 到烟台老城再吃',meta:'人均约 60–100 元',pro:'餐厅选择更多，环境与餐椅更稳',con:'宝宝饭点可能被 80 km 车程推迟'}]},
    'charge-penglai':{title:'蓬莱补能',type:'充电',options:[
      {id:null,name:'A · 电量够就跳过',meta:'推荐默认',pro:'不为免费电打断午睡和换城节奏',con:'需保证到烟台后仍有 20% 以上'},
      {id:'c-penglai',name:'B · 利群广场闪充',meta:'2 把闪充枪',pro:'免费权益可用，吃饭时补能',con:'枪少，排队会侵占游玩时间'}]},
    'attraction-yantai':{title:'烟台半日玩法',type:'景点',options:[
      {id:'a-yantaishan',name:'A · 烟台山—朝阳街',meta:'城市人文 · 推车友好',pro:'离酒店近，随时可回房午睡',con:'假日老城停车紧张'},
      {id:'a-yangma',name:'B · 养马岛环岛',meta:'海岸自驾 · 2–3 小时',pro:'山海照片更出片，自驾体验好',con:'风大、堵车时体验明显下降'},
      {id:'a-fisher',name:'C · 渔人码头短停',meta:'轻量打卡 · 45–60 分钟',pro:'对两岁宝宝最轻松，进退自由',con:'内容较少，不适合作为全天主景点'},
      {id:'a-suo',name:'D · 所城里夜游',meta:'老街夜景 · 1 小时',pro:'适合晚饭后散步，和烟台山衔接',con:'商业化较强，推车需避开人流'},
      {id:'a-changyu',name:'E · 张裕酒文化博物馆',meta:'室内人文 · 1.5 小时',pro:'雨天稳定、离老城酒店近',con:'幼儿互动性一般'}]},
    'food-yantai':{title:'烟台正餐',type:'美食',options:[
      {id:'f-yantai',name:'A · 朝阳街 / 所城里周边',meta:'焖子 · 鲅鱼水饺',pro:'景点、吃饭、散步一次完成',con:'网红店多，需避开长队'},
      {id:'f-yantai-east',name:'B · 莱山商圈亲子餐',meta:'商场餐厅 · 有餐椅',pro:'停车、洗手间、宝宝餐更稳定',con:'本地烟火气弱一些'}]},
    'hotel-weihai':{title:'威海三晚酒店',type:'酒店',options:[
      {id:'h-weihai-a',name:'A · 抱海大酒店',meta:'自驾效率型',pro:'去刘公岛和荣成方向更顺，停车稳',con:'装修与亲子配套相对传统'},
      {id:'h-weihai-b',name:'B · 蓝海御华大饭店',meta:'连住舒适型',pro:'房间与早餐更适合连续住三晚',con:'前往火炬八街距离更远'}]},
    'charge-weihai':{title:'换城补能',type:'充电',options:[
      {id:'c-yantai',name:'A · 烟台电视台闪充',meta:'离烟台酒店较近',pro:'退房前补好，到威海后不再找桩',con:'若走北线可能需要绕路'},
      {id:'c-weihai',name:'B · 威海北站闪充',meta:'到达后补能',pro:'抵达威海再按实际 SOC 决定',con:'与海滨酒店并不完全顺路'},
      {id:null,name:'C · 暂不补能',meta:'SOC 充足时',pro:'85–100 km 换城无需强行充电',con:'次日活动前需重新评估'}]},
    'food-weihai':{title:'威海晚餐',type:'美食',options:[
      {id:'f-weihai',name:'A · 韩乐坊餐饮区',meta:'韩餐 · 海鲜 · 选择多',pro:'下雨也好逛，家庭选择面广',con:'热门时段停车和排队较难'},
      {id:'f-weihai-mall',name:'B · 威高广场亲子餐',meta:'稳定省心型',pro:'餐椅、卫生间和宝宝餐更可靠',con:'地方特色不如街区明显'}]},
    'attraction-weihai':{title:'登岛日主任务',type:'景点',options:[
      {id:'a-liugong',name:'A · 刘公岛',meta:'半日 · 船班制约',pro:'历史与海岛体验完整，值得记录',con:'排队、风浪和船班对带娃要求高'},
      {id:'a-haiyuan',name:'B · 海源公园',meta:'渔港慢走 · 1 小时',pro:'不坐船，宝宝状态不好可随时撤',con:'人文内容弱，仪式感不如登岛'},
      {id:'a-banyue',name:'C · 半月湾',meta:'免费海岸 · 1 小时',pro:'日出日落都适合家庭照片',con:'大风时体感差'},
      {id:'a-huoju',name:'D · 火炬八街',meta:'城市海景 · 45 分钟',pro:'地标辨识度高，适合短打卡',con:'假日拥堵停车难，商业感强'}]},
    'attraction-rongcheng':{title:'荣成主景点',type:'景点',options:[
      {id:'a-naxianghai',name:'A · 那香海钻石沙滩',meta:'玩沙亲子型',pro:'两岁宝宝参与感强，免费区域灵活',con:'国庆人多，单独看景丰富度一般'},
      {id:'a-chengshan',name:'B · 成山头',meta:'地标山海型',pro:'景观最有目的地感，照片值得留存',con:'路更远、风更大、台阶更多'},
      {id:'a-jinshi',name:'C · 金石湾艺术园区',meta:'拍照慢游型',pro:'家庭合照场景丰富，节奏松弛',con:'内容偏审美打卡，宝宝游乐性弱'}]},
    'charge-rongcheng':{title:'荣成补能',type:'充电',options:[
      {id:null,name:'A · 威海满电往返',meta:'推荐默认',pro:'不深入荣成城区，路线最短',con:'出发时建议至少 80–85%'},
      {id:'c-rongcheng',name:'B · 荣成兴飞闪充',meta:'返程兜底',pro:'深度游成山头时更安心',con:'离那香海并不近，可能明显绕行'}]},
    'food-rongcheng':{title:'荣成午餐',type:'美食',options:[
      {id:'f-rongcheng',name:'A · 荣成城区海鲜家常菜',meta:'人均约 70–120 元',pro:'热菜选择多，适合深度游后休息',con:'从那香海过去会增加里程'},
      {id:'f-weihai',name:'B · 返回威海再吃',meta:'熟悉稳妥型',pro:'餐厅选择多，直接回酒店午睡',con:'需要自带宝宝垫餐，饭点偏晚'}]},
    'charge-qingdao':{title:'威海去青岛补能',type:'充电',options:[
      {id:'c-laixi',name:'A · 莱西南京北路闪充',meta:'跨城途中候选',pro:'可把午饭与补能合并',con:'属于城区站，须比较高速桩绕行'},
      {id:'c-qingdao',name:'B · 到青岛市区再充',meta:'抵达后安排',pro:'按真实到达 SOC 决策，不提前绕路',con:'晚高峰找桩可能更耗时'},
      {id:null,name:'C · 顺路高速快充',meta:'效率优先',pro:'不用下高速，通常总耗时更短',con:'不一定享受免费闪充权益'}]},
    'hotel-qingdao':{title:'青岛三晚酒店',type:'酒店',options:[
      {id:'h-qingdao-a',name:'A · 栈桥海景亚朵',meta:'老城步行型',pro:'栈桥、大学路、海底世界都更近',con:'停车位紧张，去崂山方向较慢'},
      {id:'h-qingdao-b',name:'B · 海景花园大酒店',meta:'亲子自驾型',pro:'停车与服务更稳，靠近东部海岸',con:'游老城需要打车，往返午睡成本高'}]},
    'attraction-qingdao-east':{title:'抵达后散步',type:'景点',options:[
      {id:'a-olympic',name:'A · 奥帆中心',meta:'夜景城市型',pro:'路面平缓、吃饭方便、夜景稳定',con:'商业感较强，假日人多'},
      {id:'a-xiaomai',name:'B · 小麦岛日落',meta:'草地海岸型',pro:'照片更自然，宝宝可短时放电',con:'停车和海风不确定'},
      {id:'a-mayfourth',name:'C · 五四广场',meta:'地标夜景 · 45 分钟',pro:'交通方便、平地推车友好',con:'内容单一，节假日人多'}]},
    'attraction-qingdao-old':{title:'老城主打卡',type:'景点',options:[
      {id:'a-zhanqiao',name:'A · 栈桥—中山路',meta:'经典地标 · 平缓',pro:'第一次到青岛辨识度最高',con:'国庆人流密集'},
      {id:'a-xiaoyushan',name:'B · 大学路—小鱼山',meta:'城市俯瞰 · 文艺街区',pro:'照片层次丰富，老城气质更强',con:'有坡度，推车体验一般'},
      {id:'a-badaguan',name:'C · 八大关慢走',meta:'建筑海岸 · 1.5 小时',pro:'树荫多，路线可长可短',con:'景点分散，打卡感不如栈桥集中'},
      {id:'a-signalhill',name:'D · 信号山公园',meta:'老城俯瞰 · 1 小时',pro:'能一次看清红瓦老城与海岸线',con:'坡度明显，建议使用背带'},
      {id:'a-cathedral',name:'E · 圣弥厄尔教堂',meta:'建筑打卡 · 30–45 分钟',pro:'与中山路顺路、停留灵活',con:'开放时间和宗教活动可能影响参观'}]},
    'attraction-qingdao-family':{title:'亲子主景点',type:'景点',options:[
      {id:'a-underwater',name:'A · 青岛海底世界',meta:'室内 · 约 2–3 小时',pro:'宝宝参与感最强，雨天也能玩',con:'门票高、节假日拥挤'},
      {id:'a-polar',name:'B · 极地海洋公园',meta:'表演互动 · 3–4 小时',pro:'亲子互动和演出更丰富',con:'价格高、一天只建议选一个海洋馆'},
      {id:'a-badaguan',name:'C · 八大关 + 第二海水浴场',meta:'免费慢游型',pro:'节奏自由，午睡不受预约约束',con:'天气依赖强，互动性较弱'},
      {id:'a-xiaomai',name:'D · 小麦岛公园',meta:'免费日落型',pro:'空间开阔，适合家庭影像记录',con:'大风时不适合久留'},
      {id:'a-mayfourth',name:'E · 五四广场夜景',meta:'免费城市型',pro:'推车友好，晚饭后短走即可',con:'不适合作为全天唯一主景点'}]},
    'food-qingdao':{title:'青岛正餐',type:'美食',options:[
      {id:'f-qingdao',name:'A · 老城家常菜',meta:'锅贴 · 排骨米饭',pro:'本地味更浓，和老城路线自然衔接',con:'停车困难，热门店排队长'},
      {id:'f-qingdao-east',name:'B · 香港中路 / 奥帆商圈',meta:'亲子环境型',pro:'停车、餐椅、宝宝餐更稳',con:'价格偏高，旅行烟火气稍弱'}]}
  };
  const choicePlans={
    d1:{groups:['charge-north'],sequence:['a-beijing','@charge-north','a-weifang']},
    d4:{groups:['charge-weifang-ready'],sequence:['a-weifang','@charge-weifang-ready','a-weifang']},
    d5:{groups:['attraction-penglai','food-penglai','charge-penglai','hotel-yantai'],sequence:['a-weifang','@attraction-penglai','@food-penglai','@charge-penglai','@hotel-yantai']},
    d6:{groups:['attraction-yantai','food-yantai','hotel-yantai'],sequence:['@hotel-yantai','@attraction-yantai','@food-yantai','@hotel-yantai']},
    d7:{groups:['charge-weihai','food-weihai','hotel-weihai'],sequence:['@hotel-yantai','@charge-weihai','@food-weihai','@hotel-weihai']},
    d8:{groups:['attraction-weihai','food-weihai','hotel-weihai'],sequence:['@hotel-weihai','@attraction-weihai','@food-weihai','@hotel-weihai']},
    d9:{groups:['attraction-rongcheng','food-rongcheng','charge-rongcheng','hotel-weihai'],sequence:['@hotel-weihai','@attraction-rongcheng','@food-rongcheng','@charge-rongcheng','@hotel-weihai']},
    d10:{groups:['charge-qingdao','hotel-qingdao','attraction-qingdao-east','food-qingdao'],sequence:['@hotel-weihai','@charge-qingdao','@hotel-qingdao','@attraction-qingdao-east','@food-qingdao','@hotel-qingdao']},
    d11:{groups:['attraction-qingdao-old','food-qingdao','hotel-qingdao'],sequence:['@hotel-qingdao','@attraction-qingdao-old','@food-qingdao','@hotel-qingdao']},
    d12:{groups:['attraction-qingdao-family','food-qingdao','hotel-qingdao'],sequence:['@hotel-qingdao','@attraction-qingdao-family','@food-qingdao','@hotel-qingdao']},
    d13:{groups:['hotel-qingdao','charge-weifang-ready'],sequence:['@hotel-qingdao','a-weifang','@charge-weifang-ready']},
    d14:{groups:['charge-return'],sequence:['a-weifang','@charge-return','a-beijing']}
  };
  document.addEventListener('DOMContentLoaded',function(){
    const root=document.querySelector('.roadtrip'); if(!root)return;
    root.classList.add('planner-app','planner-v2');
    const hero=root.querySelector('.roadtrip-hero');
    hero.innerHTML='<div class="planner-v2-hero"><div><p class="roadtrip-eyebrow">2026.09.23—10.06 · TWO ADULTS + ONE TODDLER</p><h1>山东半岛<br><span>自驾决策台</span></h1><p>你负责选择想去的地方，我负责把景点、吃饭、补能和酒店串成一条能开的路线。</p></div><div class="planner-v2-stats"><span><b>14</b>天行程</span><span><b>6</b>座城市</span><span><b>820</b>km 标称续航</span><span><b>2</b>岁宝宝</span></div></div>';
    const nav=document.createElement('nav'); nav.className='planner-nav'; nav.setAttribute('aria-label','攻略工作台');
    nav.innerHTML='<b><i></i>半岛旅行 OS <small>所有选择自动保存</small></b><div>'+[['journey','路线编排'],['attractions','景点图鉴'],['stays','酒店'],['charging','补能'],['food','美食'],['toolkit','带娃工具']].map(x=>'<button type="button" data-view="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
    hero.after(nav);
    const workspace=document.createElement('section');workspace.className='planner-workspace';workspace.id='planner-workspace';
    workspace.innerHTML='<aside class="planner-days" aria-label="选择日期"><header><span>TRIP</span><b>14 天</b></header></aside><main class="planner-detail" aria-live="polite"></main><aside class="planner-map"></aside>';
    nav.after(workspace);
    const toolkit=document.createElement('section'); toolkit.className='roadtrip-section trip-toolkit'; toolkit.id='toolkit';
    toolkit.innerHTML='<div class="roadtrip-section__head"><div><p class="roadtrip-eyebrow">FAMILY TOOLKIT</p><h2>带娃出发，少一点临场慌张</h2></div><p>建议出发前截图保存</p></div><div class="toolkit-grid"><article><span>车上随身包</span><h3>尿裤 · 湿巾 · 水杯 · 熟悉零食</h3><p>再放一条薄毯、换洗衣物、晕车袋和一个新玩具。每 90–120 分钟主动停车，不等宝宝闹。</p></article><article><span>海边安全</span><h3>防晒 · 防风 · 防蚊 · 防滑鞋</h3><p>海风大时减少停留；不让宝宝独自靠近礁石和浪线，海鲜确认熟透并先少量尝试。</p></article><article><span>应急位置</span><h3>医院、药店、母婴室先收藏</h3><p>每天入住后把最近医院和 24 小时药店加入高德收藏；商场优先解决热水、餐椅和卫生间。</p></article><article><span>假期判断</span><h3>大风 / 暴雨就删户外</h3><p>刘公岛停航、海边大风、青岛老城拥堵都不硬扛。保留酒店和午睡，行程不会因此失败。</p></article></div><div class="backup-attractions"><strong>备选打卡库</strong><p>养马岛环岛（顺路 / 日落） · 所城里（夜游） · 半月湾（清晨 / 日落） · 成山头（值得专程） · 金石湾艺术园区（家庭合照） · 小麦岛（日落）。地图中可筛选景点，按风力和宝宝状态替换。</p></div><div class="trip-journal"><label for="trip-journal-text"><strong>旅行记录 · 写给回来的自己</strong><small>内容只保存在本机浏览器</small></label><textarea id="trip-journal-text" rows="4" placeholder="今天宝宝最开心的瞬间……"></textarea><button type="button" class="roadtrip-btn roadtrip-btn--small" id="save-journal">保存今天记录</button><span id="journal-status" role="status"></span></div>';
    root.querySelector('#checklist').after(toolkit);
    const mapSection=root.querySelector('#route-map');workspace.querySelector('.planner-map').append(mapSection);
    mapSection.querySelector('h2').textContent='高德 · 当天路线';
    const mapNote=document.createElement('p');mapNote.className='route-map-note';mapNote.textContent='站内显示路线规划与逐路段详情；真正驾车时点击分段入口，在高德 App 开始导航。';mapSection.append(mapNote);
    root.querySelector('#day-by-day').hidden=true;
    const detail=workspace.querySelector('.planner-detail');
    const dayNav=workspace.querySelector('.planner-days');
    const pointLabels={'a-beijing':'北京出发','a-weifang':'潍坊老家'};
    function optionKey(option){return option.id||'__skip__';}
    function selectedOptions(groupId){
      const group=candidateGroups[groupId]; let saved=null, keys=[];
      try{saved=localStorage.getItem('trip-choice-v2-'+groupId);}catch(e){}
      if(saved){try{keys=JSON.parse(saved);}catch(e){keys=[saved];}}
      if(!Array.isArray(keys)||!keys.length)keys=[optionKey(group.options[0])];
      const selected=keys.map(function(key){return group.options.find(function(option){return optionKey(option)===key;});}).filter(Boolean);
      return selected.length?selected:[group.options[0]];
    }
    function compiledRoute(plan){
      return plan.sequence.reduce(function(result,token){
        const choices=token.charAt(0)==='@'?selectedOptions(token.slice(1)):[{id:token,name:pointLabels[token]||token}];
        choices.forEach(function(option){if(option&&option.id)result.push(option);});return result;
      },[]);
    }
    function renderComposer(day){
      const plan=choicePlans[day]; if(!plan)return;
      const groupsHtml=plan.groups.map(function(groupId){
        const group=candidateGroups[groupId], selected=selectedOptions(groupId), isSingle=group.type==='酒店';
        return '<section class="choice-group"><header><span>'+group.type+'</span><h4>'+group.title+'</h4></header><div>'+group.options.map(function(option){
          const active=selected.indexOf(option)>-1;
          return '<button type="button" class="choice-option'+(active?' is-selected':'')+'" data-choice-group="'+groupId+'" data-choice-id="'+optionKey(option)+'" aria-pressed="'+active+'"><span class="choice-check">'+(isSingle?'○':'＋')+'</span><b>'+option.name+'</b><small>'+option.meta+'</small><em>优：'+option.pro+'</em><i>劣：'+option.con+'</i></button>';
        }).join('')+'</div><p class="choice-hint">'+(isSingle?'单选 · 连住期间自动沿用':'多选 · 再点一次取消，选择顺序即路线顺序')+'</p></section>';
      }).join('');
      const route=compiledRoute(plan);
      const summary='<div class="choice-result"><div><span>已为你串成当天路线</span><b>'+route.map(function(option,index){return '<mark>'+(index+1)+'</mark>'+(option.name||option.id);}).join('<i>→</i>')+'</b></div><button type="button" data-build-route>按我的选择规划路线</button></div>';
      detail.querySelector('.planner-summary-anchor').insertAdjacentHTML('afterend','<section class="trip-composer"><div class="trip-composer__head"><div><small>BUILD YOUR DAY</small><h3>选完即成路线</h3></div><p>景点、美食、充电可多选；酒店单选。地图会按照你的选择重新计算。</p></div>'+groupsHtml+summary+'</section>');
      detail.querySelectorAll('[data-choice-group]').forEach(function(button){button.onclick=function(){
        const groupId=button.dataset.choiceGroup, group=candidateGroups[groupId], key=button.dataset.choiceId;
        let keys=selectedOptions(groupId).map(optionKey);
        if(group.type==='酒店'||key==='__skip__')keys=[key];
        else{keys=keys.filter(function(item){return item!=='__skip__';});const at=keys.indexOf(key);if(at>-1)keys.splice(at,1);else keys.push(key);if(!keys.length)keys=[optionKey(group.options[0])];}
        try{localStorage.setItem('trip-choice-v2-'+groupId,JSON.stringify(keys));}catch(e){}
        selectDay(days.findIndex(function(item){return item[2]===day;}));
      };});
      const build=detail.querySelector('[data-build-route]'); if(build)build.onclick=function(){
        const chosen=compiledRoute(plan);
        window.dispatchEvent(new CustomEvent('trip:compose',{detail:{day:day,ids:chosen.map(function(option){return option.id;})}}));
      };
    }
    days.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML='<small>'+d[0]+' · D'+(i+1)+'</small><strong>'+d[1]+'</strong>';b.onclick=()=>selectDay(i);dayNav.append(b);});
    function selectDay(i){
      const d=days[i];Array.from(dayNav.querySelectorAll(':scope > button')).forEach((b,j)=>{b.classList.toggle('selected',i===j);b.setAttribute('aria-pressed',String(i===j));});
      detail.innerHTML='<header class="planner-day-head"><div><p class="roadtrip-eyebrow">DAY '+String(i+1).padStart(2,'0')+' · '+d[0]+'</p><h2>'+d[1]+'</h2><p class="planner-sub">'+d[4]+' · '+d[3]+'</p></div><strong>'+(i+1)+'<small>/14</small></strong></header><div class="planner-mode"><span>今天的节奏</span><button type="button" class="selected" data-mode="full">充足</button><button type="button" data-mode="normal">普通</button><button type="button" data-mode="light">低电量</button><button type="button" data-mode="rain">下雨</button></div><div class="planner-metrics"><span>驾驶 <b>'+d[4].split('·')[0].trim()+'</b></span><span>建议主任务 <b>'+d[5][Math.min(1,d[5].length-1)][1]+'</b></span><span>不可牺牲 <b>午睡</b></span></div><div class="planner-summary-anchor"></div><details class="planner-schedule"><summary>查看建议时间表 <small>不影响你上面的自由选择</small></summary><div class="planner-timeline">'+d[5].map((s,k)=>'<article data-stop-index="'+k+'"><time>'+s[0]+'</time><div><h3>'+s[1]+'</h3><p>'+s[2]+'</p></div></article>').join('')+'</div></details><div class="planner-rain" hidden><h3>雨天替代</h3><p>'+d[8]+'</p><p>保留已订住宿与午睡，室外项目直接删除。</p></div><details class="planner-notes"><summary>吃饭、停车与风险提示</summary><h3>吃什么</h3><p>'+d[6]+'</p><h3>开车与停车</h3><p>'+d[7]+'</p></details><div class="planner-memory"><label>留一句旅行记录</label><textarea rows="2" placeholder="宝宝今天最开心的瞬间……"></textarea><button type="button" class="roadtrip-btn roadtrip-btn--small">保存</button><span></span></div><div class="planner-next"><button type="button" id="prev-day" '+(i===0?'disabled':'')+'>← 前一天</button><button type="button" id="next-day" '+(i===13?'disabled':'')+'>后一天 →</button></div>';
      const relatedHtml=(related[d[2]]||[]).map(x=>'<article><small>'+x[0]+'</small><h3>'+x[2]+'</h3><p>'+x[3]+'</p><button type="button" data-related-map="'+x[1]+'">地图定位</button>'+(x[0]==='景点'?'<button type="button" data-related-view="attractions">详细介绍</button>':'')+'</article>').join('');
      if(choicePlans[d[2]])renderComposer(d[2]);
      else detail.querySelector('.planner-notes').insertAdjacentHTML('afterend','<section class="planner-related"><h3>今天关联的景点、住宿、补能与美食</h3><div>'+relatedHtml+'</div></section>');
      detail.querySelectorAll('[data-related-map]').forEach(b=>b.onclick=()=>window.dispatchEvent(new CustomEvent('trip:point',{detail:b.dataset.relatedMap})));
      detail.querySelectorAll('[data-related-view]').forEach(b=>b.onclick=()=>showView(b.dataset.relatedView));
      detail.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{detail.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('selected',b===x));const mode=b.dataset.mode;detail.querySelector('.planner-rain').hidden=mode!=='rain';detail.querySelector('.planner-timeline').hidden=mode==='rain';detail.querySelectorAll('.planner-timeline article').forEach((a,k)=>a.hidden=mode==='light'&&k>2||mode==='normal'&&k>3);});
      const memory=detail.querySelector('.planner-memory textarea'), memoryKey='roadtrip-memory-'+d[2]; try{memory.value=localStorage.getItem(memoryKey)||'';}catch(e){} detail.querySelector('.planner-memory button').onclick=()=>{try{localStorage.setItem(memoryKey,memory.value);detail.querySelector('.planner-memory span').textContent='已保存';}catch(e){}};
      detail.querySelector('#prev-day').onclick=()=>selectDay(i-1);detail.querySelector('#next-day').onclick=()=>selectDay(i+1);
      window.dispatchEvent(new CustomEvent('trip:day',{detail:d[2]}));
      if(choicePlans[d[2]])setTimeout(function(){const chosen=compiledRoute(choicePlans[d[2]]);window.dispatchEvent(new CustomEvent('trip:compose',{detail:{day:d[2],ids:chosen.map(function(option){return option.id;})}}));},180);
    }
    const sections=['attractions','stays','charging','food','budget','checklist','toolkit'];
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
    const journal=toolkit.querySelector('#trip-journal-text'), journalStatus=toolkit.querySelector('#journal-status');
    try{journal.value=localStorage.getItem('roadtrip-journal')||'';}catch(e){}
    toolkit.querySelector('#save-journal').onclick=function(){try{localStorage.setItem('roadtrip-journal',journal.value);journalStatus.textContent='已保存';setTimeout(function(){journalStatus.textContent='';},1800);}catch(e){journalStatus.textContent='浏览器未允许本地保存';}};
    showView('journey');selectDay(4);
  });
})();
