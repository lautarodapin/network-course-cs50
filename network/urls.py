
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("following/", views.index, name="following"),

    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("posts/", views.post_view, name="post-list"),

    path("comment/", views.comment_view, name="comment"),

    path("follow/", views.follow_view, name="follow"),

    path("user/", views.user_view, name="user"),
]
