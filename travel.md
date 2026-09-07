---
layout: page
title: 旅行攻略
permalink: /travel/
comment: false
---

<div class="channel-page channel-page--travel">
  <p class="channel-page__eyebrow">TRAVEL / ROAM</p>
  <p class="channel-page__intro">不只收藏目的地，也记录一条真正可以出发的路线。攻略中的价格与开放信息，请在出发前再次核对。</p>
  <div class="travel-filter" aria-label="旅行攻略维度">
    <span><i class="fas fa-map-marker-alt"></i> 目的地</span>
    <span><i class="far fa-calendar"></i> 季节</span>
    <span><i class="fas fa-wallet"></i> 预算</span>
    <span><i class="far fa-clock"></i> 时长</span>
  </div>
  <div class="travel-grid">
    {% for post in site.categories.travel %}
      <article class="travel-card">
        {% if post.cover %}<a href="{{ post.url | relative_url }}"><img src="{{ post.cover | relative_url }}" alt="{{ post.title }}"> </a>{% endif %}
        <div class="travel-card__body">
          <p class="section-kicker">{{ post.destination }} · {{ post.duration }}</p>
          <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
          <p>{{ post.excerpt | strip_html | strip | truncate: 130 }}</p>
          <ul class="trip-meta"><li>{{ post.season }}</li><li>{{ post.budget }}</li><li>{{ post.pace }}</li></ul>
        </div>
      </article>
    {% endfor %}
  </div>
</div>
