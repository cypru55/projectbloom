from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render_to_response,redirect
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout


@login_required(login_url='/login/')
def index(request):
    return render_to_response('dashboard/index.html', context_instance=RequestContext(request))

