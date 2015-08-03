#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Author: archer
# @Date:   2015-08-03 17:37:19
# @Last Modified 2015-08-03


from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse

# home page
def index(request):
    return HttpResponse("It works, you are at home page")
