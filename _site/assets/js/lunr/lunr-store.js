var store = [{
        "title": "我的第一篇博客（测试）",
        "excerpt":"1 代码 public class SeyHello{\tpublic static void main(String[] args){\t\tSystem.out.println(\"Hello Markdown\");\t}}2 表格             Default aligned      Left aligned      Center aligned      Right aligned                  First body part      Second cell      Third cell      fourth cell              Second line      foo      strong      baz              Third line      quux      baz      bar                  Second body                                   2 line                                       Footer row                           ","categories": ["first-category"],
        "tags": ["first-blog"],
        "url": "http://localhost:4000/first-category/Ivan/",
        "teaser":"http://localhost:4000/assets/image/IMG_0276.png"},{
        "title": "如何利用GitHub Pages搭建自己的静态博客",
        "excerpt":"序言                                            序言 近期在Github上搭建了自己的个人博客，踩了好多的坑，但是回头发现其实就是很简单的一件事，所以在此把它记录下来，希望给需要的人带来帮助。   注意：本文的介绍主要是面向有一定的开发基础的童鞋，但是考虑到没有基础的童鞋，我在本文的介绍的过程中也会提及到，如何简单的高效的搭建自己的个人博客。 原理 GitHub Pages的原理其实就是在我们注册Github账号之后，会默认给我们分配一个二级域名，以username.github.io的形式存在，当我们创建repository仓库并且在settings -&gt; GitHub Pages -&gt; Source下指定了编译分支后，Github采用Jekyll编译这个username.github.io域名下的所有资源，编译成功之后可以通过username.github.io/repository_name这种形式的URL来访问。   ps： 如果repository仓库的名称以username.github.io的形式命名，系统默认编译GitHub Pages的master分支，这样我们就可以通过username.github.io来直接访问主页。 注册Github 首先，我们需要到Github主页注册自己的Github账号，在打开的页面中输入自己的注册信息，点击Sign up for Github按钮完成注册。 登陆成功之后，进入主页点击Create new...按钮，选择New reponsitory选项进入Create a new repository页面，Repository name对应的文本框中输入仓库的名称，通常会以username.github.io方式来命名，这样系统默认直接编译master分支。   注意：如果创建的仓库的名字不是默认的username.github.io，而是其他的名字，一定要在当前仓库的settings -&gt; GitHub Pages -&gt; Source指定要编译的源，或者创建gh-pages分支。         If your site repository doesn’t have a master or gh-pages branch, your GitHub Pages publishing source is set to None and your site is not published.         在settings -&gt; GitHub Pages页面同样可以选择主题样式（推荐）。               至此，我们可以通过username.github.io来访问我们主页啦，默认寻找仓库下面的index.html页面。例如:zhuyuncheng.github.io  到了这里似乎已经完成了我们的搭建，但是距离我们真正的博客还有一定的差距，下面我会介绍Jekyll，更好的完成我们博客搭建。 Jekyll jekyll是一个基于ruby开发的，专用于构建静态网站的程序。它能够将一些动态的组件：模板、liquid代码等构建成静态的页面集合，Github-Page全面引入jekyll作为其构建引擎，这也是学习jekyll的主要动力。同时，除了jekyll引擎本身，它还提供一整套功能，比如web server。我们用jekyll –server启动本地调试就是此项功能。读者可能已经发现，在启动server后，之前我们的项目目录下会多出一个_site目录。jekyll默认将转化的静态页面保存在_site目录下，并以某种方式组织。使用jekyll构建博客是十分适合的，因为其内建的对象就是专门为blog而生的，在后面的逐步介绍中读者会体会到这一点。但是需要强调的是，jekyll并不是博客软件，跟workpress之类的完全两码事，它仅仅是个一次性的模板解析引擎，它不能像动态服务端脚本那样处理请求。Jekyll是如何工作的 |-- _config.yml|-- _includes|-- _layouts|   |-- default.html|   |-- post.html|-- _posts|   |-- 2017-08-13-open-source-is-good.html|   |-- 2017-04-26-hello-world.html|-- _site`-- index.html_config.yml: 保存配置，该配置将影响jekyll构造网站的各种行为。_includes：该目录下的文件可以用来作为公共的内容被其他文章引用，就跟C语言include头文件的机制完全一样，jekyll在解析时会对{ % include file.ext %}标记扩展成对应的在_includes文件夹中的文件。_layouts：该目录下的文件作为主要的模板文件。_posts：文章或网页应当放在这个目录中，但需要注意的是，文章的文件名必须是YYYY-MM-DD-link。_site：jekyll默认的转化结果存放的目录。   Jekyll语法：https://alfred-sun.github.io/blog/2015/01/10/jekyll-liquid-syntax-documentation/    Jekyll安装   注意：    &nbsp;&nbsp;&nbsp;&nbsp;如果想要本地用Jekyll编译测试的，可以安装Jekyll。   &nbsp;&nbsp;&nbsp;&nbsp;如果只是单纯的搭建一个博客而已，我个人推荐Github线上编译，直接push上去代码，等待一会儿，Github即可自己编译提交的代码，通过前面提到的URL访问即可（建议清空缓存再访问）。     Jekyll 是基于Ruby的，所以首先需要安装Ruby。      安装Ruby Linux(Debian 或 Ubuntu)$ sudo apt-get install ruby-fullLinux(CentOS、Fedora 或 RHEL)$ sudo yum install rubyHomebrew（OS X）$ brew install rubyWindows 通过RubyDevKit安装，从这个页面下载DevKit：http://rubyinstaller.org/downloads/ 解压完成之后，用cmd进入到刚才解压的目录下，运行下面命令，该命令会生成config.yml。$ ruby dk.rb initconfig.yml文件实际上是检测系统安装的ruby的位置并记录在这个文件中，以便稍后使用。但上面的命令只针对使用rubyinstall安装的ruby有效，如果是其他方式安装的话，需要手动修改config.yml。我生成的config.yml文件内容如下： # This configuration file contains the absolute path locations of all# installed Rubies to be enhanced to work with the DevKit. This config# file is generated by the 'ruby dk.rb init' step and may be modified# before running the 'ruby dk.rb install' step. To include any installed# Rubies that were not automagically discovered, simply add a line below# the triple hyphens with the absolute path to the Ruby root directory.## Example:## ---# - C:/ruby19trunk# - C:/ruby192dev#---- C:/Ruby193最后，执行如下命令，执行安装： $ ruby setup.rb或者 $ ruby setup.rb install可以通过执行一下命令查看ruby是否安装成功，出现以下信息则已经安装成功了，显示目前安装Ruby的版本号，这个版本号建议是2.2以上的版本，因为2.2以下的版本不在维护。 $ ruby -vruby 2.4.0p0 (2016-12-24 revision 57164) [x86_64-darwin16]安装Jekyll 执行下面gem命令即可全自动搞定： $ gem install jekyll安装好了之后我们可以进入我们需要jekyll编译的项目目录下面执行 $ jekyll --server --safejekyll 会默认在localhost的4000端口监听Http请求，可以通过http://localhost:4000/index.html访问项目的主页。 jekyll不安装采用线上编译 直接提交代码之后，进入commits页面可以看到提交的记录，每条记录黄色的标记就是正在部署jekyll中，绿色的对号说明部署成功了，编译失败会以红色的叉号标注，并且会邮件通知编译失败。   ","categories": ["blog"],
        "tags": ["blog","github pages"],
        "url": "http://localhost:4000/blog/how-to-build-a-static-blog/",
        "teaser":"http://localhost:4000/assets/image/IMG_0276.png"},{
        "title": "巧用Java枚举--我有一个大胆的想法",
        "excerpt":"1.引言                                            1.引言2.基本使用3.带有构造方法的枚举4.带有抽象方法的枚举5.枚举类实现单例模式1.引言 Java枚举 对于开发者来说，可能并不陌生，在真正的开发中是非常常用的，它是一种基本数据类型，隶属于两种基础类型 (值类型、引用类型) 的值类型。它定义的是一种规范，就是要让某个类型变量的取值只能是若干个固定值中的一个，调用它就要符合它定义的规范，可以让编译器在编译时识别程序中填写的非法值，一定程度上避免了非法值类型错误。   举个栗子：     要定义星期几的变量,如果用普通变量 1–7 ，分别表示星期一到星期日，但有人可能写成 int weekday=0;，这种错误只能到运行时才能发现，编译是没问题的。但如果用枚举代替普通变量，就可将错误在编译时识别。 枚举的本身就是一个类，它的定义与普通的类非常相似，每一个枚举变量都相当于当前枚举类的一个实例对象，下面我将介绍枚举类的使用。 2.基本使用 实例： /** * Created by xiaofengzi on 2017/8/19. * 定义枚举测试类 */public class EnumDemo01 {    public static void main(String[] args) {        //得到WeekDay的实例        WeekDay weekDay = WeekDay.FRI;        //使用1：toString()方法        System.out.println(weekDay);//输出：FRI        //使用2：name()方法        System.out.println(weekDay.name());//输出：FRI        //使用3：ordinal()方法        System.out.println(weekDay.ordinal());//输出：5        //使用4：枚举变量的反射        System.out.println(weekDay.valueOf(\"SUN\"));//输出：SUN        //使用5：获取枚举的长度        System.out.println(weekDay.values().length);//输出：7    }}/** * 定义枚举类 */enum WeekDay {    SUN, MON, TUE, WED, THI, FRI, SAT;}3.带有构造方法的枚举 带有构造方法的枚举有两点要求： 枚举变量要定义在最前面构造方法是private ，可以不写，Jvm编译完成之后就是private   前面提到过，每一个枚举变量都相当于当前枚举类的一个实例对象，所以当使用某一个枚举变量的时候会得到该枚举类的实例对象，并且只初始化一次，其他枚举变量都将会实例化并缓存，以后使用时可以直接使用，无需再次实例化。  与普通类一样，枚举变量采用哪一个构造方法，也是根据参数的类型与个数而定。  实例： /** * Created by xiaofengzi on 2017/8/19. * 定义枚举测试类 */public class EnumDemo02 {    public static void main(String[] args) {        WeekDay mon = WeekDay.FRI;        System.out.println(\"----第一次使用某一变量，初始化完成，并且缓存所有----\");        WeekDay sun = WeekDay.SUN;//本次不再实例化构造方法，而是直接从缓存中得到实例对象    }}/** * 定义枚举类 */enum WeekDay {    SUN(1, 2), MON(1), TUE(), WED, THI, FRI, SAT;    //构造方法1：    WeekDay() {        System.out.println(\"Construction 1 method init...\");    }    //构造方法2    WeekDay(int day) {        System.out.println(\"Construction 2 method init...\");    }    //构造方法3    WeekDay(int day, int day2) {        System.out.println(\"Construction 3 method init...\");    }}输出结果： Construction 3 method init...Construction 2 method init...Construction 1 method init...Construction 1 method init...Construction 1 method init...Construction 1 method init...Construction 1 method init...----第一次初始化，并且缓存所有----  由此，我们可以得出结论：     枚举变量在使用的时候只初始化一次，一次即初始化所有枚举变量  再次使用枚举变量时不再实例化，而是从缓存中获取  4.带有抽象方法的枚举 枚举类中的逻辑方法，肯定会涉及到所有的枚举变量，要进行逻辑判断就必须要使用大量的if…else语句。而使用抽象方法就可以将if…else语句转移成一个个独立的类。   例如：     下面的红绿灯枚举类中，若要计算下一个灯的颜色，普通的写法肯定要判断，如果当前“红灯”那么下一个灯为“绿灯”；如果当前为“绿灯”那么下一个灯为“黄灯”……；而如果使用抽象方法则可将一系列判断转移为一个个独立的类。 实例： /** * Created by xiaofengzi on 2017/8/20. * 定义红绿灯枚举类 */public enum TrafficLamp {    //\"{}\"表示一个匿名子类，所以就可以重写枚举的抽象方法。这里将if..else转化为了3个匿名子类    RED(30) {        @Override        public TrafficLamp nextLamp() {            return GREEN;        }    },    GREEN(45) {        @Override        public TrafficLamp nextLamp() {            return YELLOW;        }    },    YELLOW(5) {        @Override        public TrafficLamp nextLamp() {            return RED;        }    };    //定义交通灯的持续时间    private int time;    //抽象方法-计算下一个灯的颜色    public abstract TrafficLamp nextLamp();    //构造方法    TrafficLamp(int time) {        this.time = time;    }}5.枚举类实现单例模式   好吧，前面介绍了那么多，大胆的想法终于来了，我们可以总结思考一下，   1.每一个枚举变量都相当于当前枚举类的一个实例对象   2.枚举类只实例化一次，而且是在第一次使用时才会创建实例（懒汉式）   3.枚举类的构造方法是私有的（private）         好吧，总结以上三点，假如1只定义一个枚举变量（即一个对象），那么枚举不就可以实现了一个单例模式嘛？   实例： /** * Created by xiaofengzi on 2017/8/20. */public enum Singleton {    INSTANCE;//只创建一个枚举变量，即一个实例对象    //单例类的方法    public void whateverMethod() {    }}/** * Singleton test class */class SingletonDemo01 {    public static void main(String[] args) {        Singleton instance01 = Singleton.INSTANCE;        Singleton instance02 = Singleton.INSTANCE;        System.out.println(instance01 == instance02); //返回ture，明显是一个对象    }}  单例模式分为懒汉式和饿汉式两种，考虑到内存资源和多线程安全的情况，衍生出了很多类型的单例模式，懒汉式直接加锁、静态内部类登记式、双检锁/双重校验锁等，在一定程度上，这些都不属于单例模式，比如双重校验锁的内存写入无序问题，再或者通过反射强行实例化私有构造方法newInstance().     通过枚举这种方式可以很好的避免这些问题，它不仅能避免多线程同步问题，而且还自动支持序列化机制，防止反序列化重新创建新的对象，绝对防止多次实例化，最重要的是，代码简洁很多，这种方式是&lt;&lt;Effective Java&gt;&gt; 作者 Josh Bloch 提倡的方式。不过，由于 JDK1.5 之后才加入 enum 特性，用这种方式写不免让人感觉生疏，在实际工作中，也很少用。 ","categories": ["Java"],
        "tags": ["Enum"],
        "url": "http://localhost:4000/java/enumeration/",
        "teaser":"http://localhost:4000/assets/image/IMG_0276.png"},{
        "title": "爱在心头口难开",
        "excerpt":"\tfor(;;);\tconsole.log(\"I love you!\");","categories": ["emotion"],
        "tags": [],
        "url": "http://localhost:4000/emotion/love-you/",
        "teaser":"http://localhost:4000/assets/image/IMG_0276.png"},{
        "title": "Mac下如何安装tree命令",
        "excerpt":"indexMac 下如何安装tree命令 0.目录 Mac 下如何安装tree命令0.目录1.序言2.下载3.编译4.测试1.序言 经常使用Linux的童鞋可能都会知道tree这个命令，它可以以树形结构显示文件目录结构，非常适合用于给别人介绍我们文件目录的组成框架，今天就来给大家介绍一下在Mac上如何安装tree命令。网上的方式大致有三种，第一种是通过find命令格式化输出，第二种是通过brew安装，第三种是从tree官网下载并编译，本文介绍第三种方式安装。 2.下载 从tree命令的官网源码，得到 tree-1.7.0.tar使用tar命令解压 tar -zxvf tree进入解压后的文件夹，osx系统需要修改目录下的Makefile文件。找到55行左右的下面内容，去掉注释即可。  55 # Uncomment for OS X: 56 CC=cc 57 CFLAGS=-O2 -Wall -fomit-frame-pointer -no-cpp-precomp 58 LDFLAGS= 59 MANDIR=/usr/share/man/man1 60 OBJS+=strverscmp.o3.编译 执行make编译，然后将命令拷贝到/usr/local/bin/下。 makesudo cp tree /usr/local/bin/4.测试 ➜  ~ tree --helpusage: tree [-acdfghilnpqrstuvxACDFJQNSUX] [-H baseHREF] [-T title ]    [-L level [-R]] [-P pattern] [-I pattern] [-o filename] [--version]    [--help] [--inodes] [--device] [--noreport] [--nolinks] [--dirsfirst]    [--charset charset] [--filelimit[=]#] [--si] [--timefmt[=]&lt;f&gt;]    [--sort[=]&lt;name&gt;] [--matchdirs] [--ignore-case] [--] [&lt;directory list&gt;]  ------- Listing options -------  -a            All files are listed.  -d            List directories only.  -l            Follow symbolic links like directories.  -f            Print the full path prefix for each file.  -x            Stay on current filesystem only.  -L level      Descend only level directories deep.  -R            Rerun tree when max dir level reached.  -P pattern    List only those files that match the pattern given.  -I pattern    Do not list files that match the given pattern.  --ignore-case Ignore case when pattern matching.  --matchdirs   Include directory names in -P pattern matching.  --noreport    Turn off file/directory count at end of tree listing.  --charset X   Use charset X for terminal/HTML and indentation line output.  --filelimit # Do not descend dirs with more than # files in them.  --timefmt &lt;f&gt; Print and format time according to the format &lt;f&gt;.  -o filename   Output to file instead of stdout.  -------- File options ---------  -q            Print non-printable characters as &#39;?&#39;.  -N            Print non-printable characters as is.  -Q            Quote filenames with double quotes.  -p            Print the protections for each file.  -u            Displays file owner or UID number.  -g            Displays file group owner or GID number.  -s            Print the size in bytes of each file.  -h            Print the size in a more human readable way.  --si          Like -h, but use in SI units (powers of 1000).  -D            Print the date of last modification or (-c) status change.  -F            Appends &#39;/&#39;, &#39;=&#39;, &#39;*&#39;, &#39;@&#39;, &#39;|&#39; or &#39;&gt;&#39; as per ls -F.  --inodes      Print inode number of each file.  --device      Print device ID number to which each file belongs.  ------- Sorting options -------  -v            Sort files alphanumerically by version.  -t            Sort files by last modification time.  -c            Sort files by last status change time.  -U            Leave files unsorted.  -r            Reverse the order of the sort.  --dirsfirst   List directories before files (-U disables).  --sort X      Select sort: name,version,size,mtime,ctime.  ------- Graphics options ------  -i            Don&#39;t print indentation lines.  -A            Print ANSI lines graphic indentation lines.  -S            Print with CP437 (console) graphics indentation lines.  -n            Turn colorization off always (-C overrides).  -C            Turn colorization on always.  ------- XML/HTML/JSON options -------  -X            Prints out an XML representation of the tree.  -J            Prints out an JSON representation of the tree.  -H baseHREF   Prints out HTML format with baseHREF as top directory.  -T string     Replace the default HTML title and H1 header with string.  --nolinks     Turn off hyperlinks in HTML output.  ---- Miscellaneous options ----  --version     Print version and exit.  --help        Print usage and this help message and exit.  --            Options processing terminator.➜  zhuyuncheng.github.io git:(master) tree -L 1.├── CHANGELOG.md├── CNAME├── Gemfile├── Gemfile.lock├── LICENSE.txt├── README.md├── Rakefile├── _config.yml├── _data├── _includes├── _layouts├── _pages├── _posts├── _sass├── _site├── assets├── baidu_verify_xunqDqAFoK.html├── banner.js├── bdunion.txt├── googleab844277b1722da4.html├── index.html├── minimal-mistakes-jekyll.gemspec└── package.json8 directories, 15 files","categories": ["tutorial"],
        "tags": ["Mac","tutorial"],
        "url": "http://localhost:4000/tutorial/How-does-Mac-install-the-tree-command/",
        "teaser":"http://localhost:4000/assets/image/IMG_0276.png"},{
        "title": "如何利用ACE创建在线代码编辑器",
        "excerpt":"# 如何利用ACE创建在线代码编辑器如何利用ACE创建在线代码编辑器 0.目录 如何利用ACE创建在线代码编辑器0.目录1.序言2.Demo3.方法介绍4.总结1.序言 笔者工作原因需要在web页面中嵌入Python代码编辑器，于是在Github上找到ACE这样优秀的开源代码，希望对读者嵌入自己的代码编辑器有所帮助。 ACE是一个开源的、独立的、基于浏览器的代码编辑器，可以嵌入到任何web页面或JavaScript应用程序中。ACE支持超过60种语言语法高亮，并能够处理代码多达400万行的大型文档。ACE开发团队称，ACE在性能和功能上可以媲美本地代码编辑器（如Sublime Text、TextMate和Vim等）。 ACE官网：https://ace.c9.io/#nav=aboutGithub：https://github.com/ajaxorg/aceCDN资源：http://www.bootcdn.cn/ace/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;https://cdnjs.com/libraries/ace/ 2.Demo 效果展示图:￼ 代码如下: &lt;!DOCTYPE html&gt;&lt;html&gt;&lt;head&gt;    &lt;title&gt;ACE-Test&lt;/title&gt;    &lt;script src=&quot;http://cdn.bootcss.com/ace/1.2.4/ace.js&quot;&gt;&lt;/script&gt;    &lt;script src=&quot;http://cdn.bootcss.com/ace/1.2.4/ext-language_tools.js&quot;&gt;&lt;/script&gt;&lt;/head&gt;&lt;body&gt;&lt;!--代码输入框（这里高度必须要设置，否则无法显示）--&gt;&lt;pre id=&quot;code&quot; class=&quot;ace_editor&quot; style=&quot;min-height:400px&quot;&gt;&lt;textarea class=&quot;ace_text-input&quot;&gt;def say_hello(name):    print(&#39;hello {}&#39;.format(name))say_hello(&#39;zhuyuncheng.top&#39;)&lt;/textarea&gt;&lt;/pre&gt;&lt;script&gt;    //初始化对象    editor = ace.edit(&quot;code&quot;);        //设置风格和语言（更多风格和语言，请到github上相应目录查看）    theme = &quot;monokai&quot;    language = &quot;python&quot;    editor.setTheme(&quot;ace/theme/&quot; + theme);    editor.session.setMode(&quot;ace/mode/&quot; + language);        //字体大小    editor.setFontSize(18);        //设置只读（true时只读，用于展示代码）    editor.setReadOnly(false);         //自动换行,设置为off关闭    editor.setOption(&quot;wrap&quot;, &quot;free&quot;);    //启用提示菜单    ace.require(&quot;ace/ext/language_tools&quot;);    editor.setOptions({        enableBasicAutocompletion: true,        enableSnippets: true,        enableLiveAutocompletion: true    });    //获取代码    function getCode(){        console.log(editor.getValue());    }    //搜索功能Control + F    editor.find(&#39;needle&#39;,{        backwards: false,        wrap: false,        caseSensitive: false,        wholeWord: false,        regExp: false    });    editor.findNext();    editor.findPrevious();&lt;/script&gt;&lt;/body&gt;&lt;/html&gt;当然我们还可以切换语言，只需要执行 editor.session.setMode(&quot;ace/mode/&quot; + language);￼ 3.方法介绍 1.初始化对象： editor = ace.edit(&quot;code&quot;);2.设置主题： editor.setTheme(&quot;ace/theme/twilight&quot;);点击查看更多主题 3.设置编程语言模式： editor.getSession().setMode(&quot;ace/mode/javascript&quot;);4.设置并获取内容： editor.setValue(&quot;the new text here&quot;); // or session.setValueeditor.getValue(); // or session.getValue5.在光标处插入： editor.insert(&quot;Something cool&quot;);6.获取当前的光标行和列： editor.selection.getCursor();7.获取总行数： editor.session.getLength();8.设置字体大小： editor.setFontSize(18);// ordocument.getElementById(&#39;editor&#39;).style.fontSize=&#39;12px&#39;;9.将编辑器设置为只读：： editor.setReadOnly(true);  // false to make it editable10.搜索： editor.find(&#39;needle&#39;,{    backwards: false,    wrap: false,    caseSensitive: false,    wholeWord: false,    regExp: false});editor.findNext();editor.findPrevious();搜索参数： needle：查找的字符串或正则表达式backwards：从当前光标向后搜索，默认为falsewrap：当搜索结束时，是否将搜索返回到开头，默认为falsecaseSensitive：搜索是否应该区分大小写，默认为falsewholeWord：搜索是否只匹配整个单词，默认为falseregExp：搜索是否是正则表达式，默认为falsestart：开始搜索范围或光标位置skipCurrent：是否在搜索中包括当前行,默认为false11.执行替换： editor.find(&#39;foo&#39;);editor.replace(&#39;bar&#39;);editor.replaceAll(&#39;bar&#39;); //editor.replaceAll uses the needle set earlier by editor.find(&#39;needle&#39;, ...12.监听onchange事件： editor.getSession().on(&#39;change&#39;, function(e) {    // e.type, etc});13.监听selection更改事件： editor.getSession().selection.on(&#39;changeSelection&#39;, function(e) {});14.监听cursor更改事件： editor.getSession().selection.on(&#39;changeCursor&#39;, function(e){});15.添加新的命令和键盘： editor.commands.addCommand({    name: &#39;myCommand&#39;,    bindKey: {win: &#39;Ctrl-M&#39;,  mac: &#39;Command-M&#39;},    exec: function(editor) {        //...    },    readOnly: true // false if this command should not apply in readOnly mode});4.总结 尽管ACE已经实现了很多本地代码编辑器的功能，如语法高亮、代码提示等，但是还有一些是web页面中无法满足的，比如代码语法检查(目前只支持JavaScript／CoffeeScript／CSS／XQuery)，代码的编译解析运行，还需要后端接口的支持等。本次介绍的算是ACE的入门指南，如果还想要继续了解ACE其他的惊艳之处，可以移步官网API。 ","categories": ["js"],
        "tags": ["Editor","ACE"],
        "url": "http://localhost:4000/js/How-to-use-ACE-to-create-code-editor/",
        "teaser":"http://localhost:4000/assets/image/IMG_0276.png"}]
