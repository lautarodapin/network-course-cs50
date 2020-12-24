
from django.urls import path, re_path

from . import views

urlpatterns = [
    # path("", views.index, name="index"),
    path("api/following/", views.index, name="following"),

    path("api/logout/", views.api_logout),
    path("accounts/login/", views.login_view, name="login"),
    path("accounts/logout/", views.logout_view, name="logout"),
    path("accounts/register/", views.register, name="register"),

    path("api/posts/", views.post_view, name="post-list"),

    path("api/comment/", views.comment_view, name="comment"),

    path("api/follow/", views.follow_view, name="follow"),

    path("api/user/", views.user_view, name="user"),

    re_path(r'^(?:.*)/?$', views.index, name="index"),
]
