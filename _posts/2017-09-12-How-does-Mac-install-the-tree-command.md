---
title: Mac下如何安装tree命令
category: tutorial
tag: [Mac,tutorial]
---

# Mac 下如何安装tree命令
##0.目录
[TOC]
##1.序言
经常使用Linux的童鞋可能都会知道`tree`这个命令，它可以以树形结构显示文件目录结构，非常适合用于给别人介绍我们文件目录的组成框架，今天就来给大家介绍一下在Mac上如何安装`tree`命令。
网上的方式大致有三种，第一种是通过find命令格式化输出，第二种是通过brew安装，第三种是从tree官网下载并编译，本文介绍第三种方式安装。
##2.下载
从tree命令的[官网](http://mama.indstate.edu/users/ice/tree/)源码，得到

```bash
tree-1.7.0.tar
```
使用tar命令解压

```bash
tar -zxvf tree
```
进入解压后的文件夹，osx系统需要修改目录下的`Makefile`文件。找到55行左右的下面内容，去掉注释即可。

```vim
 55 # Uncomment for OS X:
 56 CC=cc
 57 CFLAGS=-O2 -Wall -fomit-frame-pointer -no-cpp-precomp
 58 LDFLAGS=
 59 MANDIR=/usr/share/man/man1
 60 OBJS+=strverscmp.o
```
##3.编译
执行`make`编译，然后将命令拷贝到`/usr/local/bin/`下。

```bash
make
sudo cp tree /usr/local/bin/
```
##4.测试

```bash
➜  ~ tree --help
usage: tree [-acdfghilnpqrstuvxACDFJQNSUX] [-H baseHREF] [-T title ]
	[-L level [-R]] [-P pattern] [-I pattern] [-o filename] [--version]
	[--help] [--inodes] [--device] [--noreport] [--nolinks] [--dirsfirst]
	[--charset charset] [--filelimit[=]#] [--si] [--timefmt[=]<f>]
	[--sort[=]<name>] [--matchdirs] [--ignore-case] [--] [<directory list>]
  ------- Listing options -------
  -a            All files are listed.
  -d            List directories only.
  -l            Follow symbolic links like directories.
  -f            Print the full path prefix for each file.
  -x            Stay on current filesystem only.
  -L level      Descend only level directories deep.
  -R            Rerun tree when max dir level reached.
  -P pattern    List only those files that match the pattern given.
  -I pattern    Do not list files that match the given pattern.
  --ignore-case Ignore case when pattern matching.
  --matchdirs   Include directory names in -P pattern matching.
  --noreport    Turn off file/directory count at end of tree listing.
  --charset X   Use charset X for terminal/HTML and indentation line output.
  --filelimit # Do not descend dirs with more than # files in them.
  --timefmt <f> Print and format time according to the format <f>.
  -o filename   Output to file instead of stdout.
  -------- File options ---------
  -q            Print non-printable characters as '?'.
  -N            Print non-printable characters as is.
  -Q            Quote filenames with double quotes.
  -p            Print the protections for each file.
  -u            Displays file owner or UID number.
  -g            Displays file group owner or GID number.
  -s            Print the size in bytes of each file.
  -h            Print the size in a more human readable way.
  --si          Like -h, but use in SI units (powers of 1000).
  -D            Print the date of last modification or (-c) status change.
  -F            Appends '/', '=', '*', '@', '|' or '>' as per ls -F.
  --inodes      Print inode number of each file.
  --device      Print device ID number to which each file belongs.
  ------- Sorting options -------
  -v            Sort files alphanumerically by version.
  -t            Sort files by last modification time.
  -c            Sort files by last status change time.
  -U            Leave files unsorted.
  -r            Reverse the order of the sort.
  --dirsfirst   List directories before files (-U disables).
  --sort X      Select sort: name,version,size,mtime,ctime.
  ------- Graphics options ------
  -i            Don't print indentation lines.
  -A            Print ANSI lines graphic indentation lines.
  -S            Print with CP437 (console) graphics indentation lines.
  -n            Turn colorization off always (-C overrides).
  -C            Turn colorization on always.
  ------- XML/HTML/JSON options -------
  -X            Prints out an XML representation of the tree.
  -J            Prints out an JSON representation of the tree.
  -H baseHREF   Prints out HTML format with baseHREF as top directory.
  -T string     Replace the default HTML title and H1 header with string.
  --nolinks     Turn off hyperlinks in HTML output.
  ---- Miscellaneous options ----
  --version     Print version and exit.
  --help        Print usage and this help message and exit.
  --            Options processing terminator.
```

```bash
➜  zhuyuncheng.github.io git:(master) tree -L 1
.
├── CHANGELOG.md
├── CNAME
├── Gemfile
├── Gemfile.lock
├── LICENSE.txt
├── README.md
├── Rakefile
├── _config.yml
├── _data
├── _includes
├── _layouts
├── _pages
├── _posts
├── _sass
├── _site
├── assets
├── baidu_verify_xunqDqAFoK.html
├── banner.js
├── bdunion.txt
├── googleab844277b1722da4.html
├── index.html
├── minimal-mistakes-jekyll.gemspec
└── package.json

8 directories, 15 files
```


