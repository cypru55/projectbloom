"""projectbloom URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.contrib import admin
from . import views as projectbloom_views
from dashboard import views as dashboard_views

urlpatterns = [
    # The home page view is in app, this page is a JavaScript Application writen in Angular js
	url(r'^$', dashboard_views.index, name='home_page'),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
	url(r'^api/', include('api.urls')),
    url(r'^login/$', projectbloom_views.login_user),
    url(r'^logout/$', 'django.contrib.auth.views.logout',
                          {'next_page': '/login/'}),
    url(r'^docs/', include('rest_framework_swagger.urls')),
    url(r'^admin/', include(admin.site.urls)),

]
