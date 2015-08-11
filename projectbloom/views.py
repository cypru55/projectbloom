#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Author: archer
# @Date:   2015-08-03 17:37:19
# @Last Modified 2015-08-03


from django.http import *
from django.shortcuts import render_to_response,redirect
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout

# home page
@login_required(login_url='/login/')
def index(request):
    return render_to_response('projectbloom/website-base.html', context_instance=RequestContext(request))

def login_user(request):
    logout(request)
    username = password = ''
    if request.POST:
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return HttpResponseRedirect('/')
    return render_to_response('projectbloom/login.html', context_instance=RequestContext(request))
