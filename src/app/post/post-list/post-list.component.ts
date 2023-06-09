import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Post } from 'src/app/model/post.model';
import { User } from 'src/app/model/user.model';
import { PostService } from 'src/app/service/post.service';
import { UserService } from 'src/app/service/user.service';

type Profile = Partial<Omit<User, "password">>

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit {
  page = 0
  limit = 2
  posts: Post[] = []
  user: Profile = {}
  warning: string = ""
  response: { status?: string, message?: string } = {}

  constructor(private readonly postService: PostService, private readonly userService: UserService, private readonly router: Router) { }

  ngOnInit(): void {
    let token = localStorage.getItem("token")
    console.log("post-list Init")
    if (token) {
      this.user = this.userService.GetCurrentUser()
      this.postService.GetAllPost(0, this.limit).subscribe((res: any) => {
        this.posts = res
      }, (_: HttpErrorResponse) => {
        this.router.navigate(["/auth/login"])
      })
    }
  }

  onLoadMore() {
    this.page = this.page + 1
    this.postService.GetAllPost(this.limit * this.page, this.limit).subscribe((res: any) => {
      if (res) {
        this.posts = [...this.posts, ...res]
      } else {
        this.warning = "You have seen everything."
      }
    }, (_: HttpErrorResponse) => {
      localStorage.removeItem("token")
      this.router.navigate(["/auth/login"])
    })
  }

  onDeletePost(_id: string) {
    this.postService.DeletePost(_id).subscribe(
      (res: any) => {
        this.response = { status: "success", message: res.message }
      },
      (err: HttpErrorResponse) => {
        this.response = { status: "warning", message: err.error.message }
      }
    )
    this.posts = this.posts.filter((post) => post._id !== _id)
  }

}
