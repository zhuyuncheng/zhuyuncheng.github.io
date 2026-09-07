---
layout: page
title: 技术笔记
permalink: /tech/
comment: false
---

<div class="channel-page channel-page--tech">
  <p class="channel-page__eyebrow">TECH / BUILD</p>
  <p class="channel-page__intro">把问题拆开，把方法留下。这里记录后端、系统设计、测试与工程实践。</p>
  <div class="channel-page__list">
    {% for post in site.posts %}
      {% unless post.categories contains 'travel' %}
        <article>
          <time>{{ post.date | date: '%Y.%m.%d' }}</time>
          <div><h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2><p>{{ post.excerpt | strip_html | strip | truncate: 150 }}</p></div>
          <a class="channel-page__arrow" href="{{ post.url | relative_url }}" aria-label="阅读 {{ post.title }}"><i class="fas fa-arrow-right"></i></a>
        </article>
      {% endunless %}
    {% endfor %}
  </div>
</div>
