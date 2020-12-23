from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.humanize.templatetags.humanize import naturalday, naturaltime

class DateMixin(models.Model):
    class Meta:
        abstract = True
    
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True)
    mod_at = models.DateTimeField(auto_now=True, auto_now_add=False)

class User(AbstractUser):
    following = models.ManyToManyField(to="self", related_name="followers", blank=True, symmetrical=False)

    def serialize(self):
        return dict(
            id=self.pk,
            username=self.username,
            following=[following.username for following in self.following.all()[:10]] if self.following.exists() else [],
            followers=[following.username for following in self.followers.all()[:10]] if self.followers.exists() else [],
            is_authenticated=self.is_authenticated,
        )


class Post(DateMixin, models.Model):
    content = models.TextField()
    likes = models.IntegerField(default=0)
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")

    def serialize(self):
        return dict(
            id=self.pk,
            content=self.content,
            user=self.user.serialize(),
            likes=self.likes,
            created_at=self.created_at.strftime("%d-%m-%Y %H:%M:%S"),
            mod_at=self.mod_at.strftime("%d-%m-%Y %H:%M:%S"),
            humanize_created_at=naturaltime(self.created_at),
            comments=[comment.serialize() for comment in reversed(self.comments.order_by("-created_at")[:20])] if self.comments.exists() else []
        )


class Comment(DateMixin, models.Model):
    comment = models.TextField()
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="comments")
    post = models.ForeignKey("Post", related_name="comments", on_delete=models.CASCADE)

    def serialize(self):
        return dict(
            id=self.pk,
            comment=self.comment,
            user=self.user.serialize(),
            post_id=self.post_id,
            created_at=self.created_at.strftime("%d-%m-%Y %H:%M:%S"),
            humanize_created_at=naturaltime(self.created_at),
            mod_at=self.mod_at.strftime("%d-%m-%Y %H:%M:%S"),
        )