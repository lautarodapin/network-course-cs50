from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.db.models import F
from django.db.models.query import QuerySet
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.conf import settings
import json
from .models import User, Post, Comment


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect("/")
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")

@csrf_exempt
def api_login(request):
    if request.method == "POST":

        data = json.loads(request.body)
        # Attempt to sign user in
        username = data.get("username")
        password = data.get("password")
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return JsonResponse({"message":"Login successful as %s" % username}, status=200)
        else:
            return JsonResponse({"message":"Invalid username and/or password"}, status=400)
    else:
        return JsonResponse({"message":"Invalid route"}, status=404)

def api_logout(request):
    logout(request)
    return JsonResponse({"message":"Logout successfuly"}, status=200)

def logout_view(request):
    logout(request)
    return HttpResponseRedirect("/")


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect("/")
    else:
        return render(request, "network/register.html")


@csrf_exempt
def post_view(request, pk=None):
    print(request.GET)
    print(request.POST)
    posts : QuerySet[Post] = Post.objects.all().order_by("-created_at")
    following = request.GET.get("following")
    if following is not None: # ? Filter parameter ?following=
        posts = posts.filter(user__username__in=following.split(','))
    username = request.GET.get("username")
    if username is not None:
        posts = posts.filter(user__username=username)

    # ! Pagination
    paginator = Paginator(posts, settings.PAGINATION)

    # ! Put method
    if request.method ==  "PUT" and not request.user.is_anonymous:
        data = json.loads(request.body)
        post:Post = posts.get(pk=data.get("post_id"))
        like = data.get("like")
        content = data.get("content")
        if post:
            if like:
                post.likes = F("likes") + int(like)
                post.save()
                post.refresh_from_db()
                return JsonResponse({"message":"Likes was successfuly updated", "likes":post.likes }, status=200)
            if content:
                if request.user != post.user:
                    return JsonResponse({"message":"Only the owner can edit this post"}, status=403)
                post.content = content
                post.save()
                return JsonResponse({"message":"Content was successfuly updated", "content":post.content}, status=200)
            return JsonResponse({"message":"No attributes"}, status=400)
        return JsonResponse({"message":"Post not found"}, status=400)
    elif request.method == "POST" and request.user.is_authenticated:
        print("POST!!")
        print(request.POST)
        print(request.body)
        data = json.loads(request.body)
        content = data.get("content")
        post = Post.objects.create(content=content, user=request.user)
        return JsonResponse({"message":"Post created successfully!", "post":post.serialize()}, status=201)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    data = {
        "posts":[post.serialize() for post in page_obj],
        "paginator":{
            "current":page_obj.number,
            "has_previus":page_obj.has_previous(),
            "has_next":page_obj.has_next(),
            "has_other_pages":page_obj.has_other_pages(),
            "start_index":page_obj.start_index(),
            "end_index":page_obj.end_index(),
            "num_pages":page_obj.paginator.num_pages,
        }
    }
    return JsonResponse(data=data, safe=False)


@csrf_exempt
@login_required
def comment_view(request):
    user:User = request.user
    data = json.loads(request.body)
    print(request.POST)
    print(request.body)
    print(data)
    comment = data.get("comment")
    post_id = data.get("post_id")
    if comment and post_id and user:
        comment = Comment.objects.create(user=user, comment=comment, post_id=post_id)
        return JsonResponse({"message":"Created successfully", "comment":comment.serialize()}, status=201)
    return JsonResponse({"message":"Error"}, status=400)


@csrf_exempt
@login_required
def follow_view(request):
    if request.method == "POST" and request.user.is_authenticated:
        data = json.loads(request.body)
        print(request.body)
        print(data)
        user_id = data.get("user")
        follow = data.get("follow")
        if user_id is not None and follow is not None:
            user_id = int(user_id)
            follow = bool(follow)
            user:User = request.user
            if follow:
                user.following.add(user_id)
            else:
                user.following.remove(user_id)
            user.save()
            return JsonResponse({"message":"Success"}, status=200)
        return JsonResponse({"message":"Missing user or follow"}, status=400)
    return JsonResponse({"message":"error"}, status=400)


@csrf_exempt
# @login_required
def user_view(request):
    print(request.GET)
    username = request.GET.get("username")
    user_id = request.GET.get("user_id")
    if username or user_id:
        if username:
            user :User = User.objects.get(username=username)
        elif user_id:
            user :User = User.objects.get(pk=user_id)
        data = {}
        data["user"] = user.serialize()
        posts = user.posts.all().order_by("-created_at")
        paginator = Paginator(posts, settings.PAGINATION)
        page_number = request.GET.get("page", 1)
        page_obj = paginator.get_page(page_number)
        data["posts"] = [post.serialize() for post in page_obj.object_list]
        data["paginator"] = {
            "current":page_obj.number,
            "has_previus":page_obj.has_previous(),
            "has_next":page_obj.has_next(),
            "has_other_pages":page_obj.has_other_pages(),
            "start_index":page_obj.start_index(),
            "end_index":page_obj.end_index(),
            "num_pages":page_obj.paginator.num_pages,
        }
        return JsonResponse(data)
    if not request.user.is_authenticated:
        return JsonResponse({})
    return JsonResponse({"user":request.user.serialize()})

