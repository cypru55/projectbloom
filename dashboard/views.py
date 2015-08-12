from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render_to_response,redirect
from django.template import RequestContext


# Create your views here.
def dashboard(request):
    return render_to_response('dashboard/index.html', context_instance=RequestContext(request))