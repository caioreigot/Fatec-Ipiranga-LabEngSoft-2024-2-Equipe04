import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { LikeInformationState } from 'src/app/models/LikeInformationState';
import { Post } from 'src/app/models/Post';
import { BackendService } from 'src/app/shared/services/backend.service';
import { LocalStorageService } from 'src/app/shared/services/local-storage.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html'
})
export class FeedComponent {

  @ViewChild('likesInformationContainer')
  likesInformationContainer: ElementRef<HTMLDivElement> | null = null;

  posts: Post[] = [];
  postsPreSearch: Post[] = [];

  currentProfilePicture: string | null = null;
  postOptionsMenuActive: number | null = null;

  activePostIndex: number | null = null;
  selectedReaction: string | null = null;
  lastSelectedReactionPostIndex: number | null = null;

  fetchingPosts: boolean = true;
  
  postsReacted: { [key: string]: string } = {};
  postsReactedImages: { [key: string]: string } = {};

  publishPostAttachment: File | null = null;
  publishPostAttachmentURL: string | ArrayBuffer | null | undefined = null;

  likesInformationState: LikeInformationState[] | null = null

  searchMode: boolean = false;
  followingPostsMode: BehaviorSubject<boolean> = new BehaviorSubject(false);

  postCommentSectionOpenedId: string | null = null;
  commentsToShow: any[] = [];

  reactions = [
    { type: 'like', imageName: 'like-solid.svg' },
    { type: 'heart', imageName: 'heart.svg' },
    { type: 'haha', imageName: 'smiley-laughing-solid.svg' },
    { type: 'congrats', imageName: 'hands-clapping-duotone.svg' },
    { type: 'fire', imageName: 'ball-on-fire.svg' },
  ];

  constructor(
    private backendService: BackendService,
    private localStorage: LocalStorageService,
    private snackbarService: SnackbarService,
    private renderer: Renderer2,
    private route: ActivatedRoute,
  ) {
    this.backendService.getProfilePicture().subscribe({
      next: (response) => {
        if (response.imageURL != null) {
          this.currentProfilePicture = response.imageURL;
          this.localStorage.saveProfilePictureUrl(response.imageURL);
        }
      }
    });

    for (let reaction of this.reactions) {
      this.postsReactedImages[reaction.type] = 'assets/' + reaction.imageName;
    }

    this.route.url.subscribe(urlSegments => {
      const routeName = urlSegments[0]?.path;
      this.searchMode = routeName === 'search';
      this.getPosts(this.searchMode);
    });

    this.followingPostsMode.subscribe((isFollowingPostsMode) => {
      if (this.searchMode) return;

      if (isFollowingPostsMode) {
        this.handlePostsResponse(this.backendService.getFollowingPosts());
      } else {
        this.handlePostsResponse(this.backendService.getPosts());
      }
    });
  }

  getReactionImageUrl(reactionName: string) {
    for (let i = 0; i < this.reactions.length; i++) {
      const reaction = this.reactions[i];

      if (reaction.type == reactionName) {
        return 'assets/' + reaction.imageName;
      }
    }

    return null;
  }

  getPosts(searchMode: boolean = false) {
    this.handlePostsResponse(this.backendService.getPosts(), searchMode);
  }
  
  handlePostsResponse(postsResponse: Observable<Post[]>, searchMode: boolean = false) {
    postsResponse.pipe(
      finalize(() => {
        this.fetchingPosts = false;
      })
    ).subscribe((posts) => {
      posts.forEach((post) => {
        post.likes.forEach((postLike) => {
          if (postLike.userEmail == this.localStorage.getLoggedUserEmail()) {
            let reactionImageName = null;

            this.reactions.forEach((reaction) => {
              if (reaction.type == postLike.reaction) {
                reactionImageName = reaction.imageName;
              }
            });

            if (!reactionImageName) {
              return;
            }

            this.postsReacted[post.id] = 'assets/' + reactionImageName;
          }
        });
      });

      if (!searchMode) {
        this.posts = posts.reverse();
      }

      this.postsPreSearch = [...posts];
    });
  }

  searchInFeed(text: string) {
    if (text.trim() == '' && this.searchMode) {
      return;
    }

    this.posts = this.postsPreSearch.filter((post) => {
      return post.text.toLowerCase().includes(text.toLowerCase());
    });
  }

  showReactions(index: number, event: TouchEvent | MouseEvent) {
    event.preventDefault();  // Evita o menu de contexto ao segurar o botão
    this.activePostIndex = index;
    this.disableScroll();
  }

  showLikesInfo(event: any, post: Post) {
    const likeInformation: LikeInformationState[] = [];
    
    post.likes.forEach((like) => {
      let founded = false;
  
      for (let i = 0; i < likeInformation.length; i++) {
        const item = likeInformation[i];
  
        if (item.reaction === like.reaction) {
          item.amount += 1;
          founded = true;
        }
      }
  
      if (!founded) {
        likeInformation.push({
          reaction: like.reaction,
          amount: 1
        });
      }
    });
  
    if (this.likesInformationContainer?.nativeElement) {
      const targetRect = event.target.getBoundingClientRect();
      
      this.likesInformationContainer.nativeElement.style.position = 'absolute';
      this.likesInformationContainer.nativeElement.style.left = `${window.scrollX + targetRect.left}px`;
      this.likesInformationContainer.nativeElement.style.top = `${(window.scrollY + targetRect.top - this.likesInformationContainer.nativeElement.offsetHeight) - 60}px`;
  
      this.likesInformationState = likeInformation;
    }
  }  

  selectReaction(event: MouseEvent | TouchEvent, postId: string | null, postIndex?: number, reaction?: any) {
    const isRemovingLike = postIndex == null && reaction == null && this.lastSelectedReactionPostIndex == null && this.selectedReaction == null;

    if (isRemovingLike) {
      if (postId) {
        for (let post of this.posts) {
          const postHasReaction = this.postsReacted[post.id] != null;
          
          if (post.id == postId && postHasReaction) {
            delete this.postsReacted[post.id];
            post.likes = post.likes.filter((postLike) => postLike.userEmail != this.localStorage.getLoggedUserEmail())
            
            this.backendService.unlikePost(postId).subscribe();
          }
        }
      }
    }

    this.activePostIndex = null;
    this.enableScroll();

    if (postId && !isRemovingLike) {
      for (let post of this.posts) {
        if (post.id == postId) {
          const isChangingReaction = this.postsReacted[post.id] != null;

          // Se não estiver trocando a reação, adiciona
          if (!isChangingReaction) {
            post.likes.push({ userEmail: this.localStorage.getLoggedUserEmail()!, reaction: reaction?.type || this.selectedReaction });
          // Se estiver trocando reação, não dá push, ao invés disso, atualiza
          } else {
            post.likes.forEach((like) => {
              if (like.userEmail == this.localStorage.getLoggedUserEmail()) {
                like.reaction = reaction?.type || this.selectedReaction;
              }
            });
          }
        }
      }
    }

    // Pra compatibilidade com desktop
    if (postIndex != null && reaction != null && postId != null) {
      this.setPostReaction(postId, reaction.type);
    }

    // Pra compatibilidade com mobile
    if (this.lastSelectedReactionPostIndex != null && this.selectedReaction != null && postId != null) {
      this.setPostReaction(postId, this.selectedReaction)
    }
  }

  hoverReaction(reaction: any, event: MouseEvent | TouchEvent) {
    const target = event.target as HTMLElement;
    this.selectedReaction = reaction.type;
    this.renderer.setStyle(target, 'transform', 'scale(1.6)');
  }

  leaveReaction(event: MouseEvent | TouchEvent) {
    const target = event.target as HTMLElement;
    this.selectedReaction = null;
    this.renderer.setStyle(target, 'transform', 'scale(1)');
  }

  touchMoving(postIndex: number, event: TouchEvent) {
    if (!event.targetTouches || event.targetTouches.length == 0) {
      return;
    }

    const hoverElement = document.elementFromPoint(event.targetTouches[0].clientX, event.targetTouches[0].clientY);

    // Se o dedo estiver encima de uma reação
    if (hoverElement?.classList.contains('reaction-img')) {
      this.selectedReaction = hoverElement.id;
      
      // Reseta o efeito de zoom em todas as reações daquele container
      hoverElement.parentElement?.childNodes.forEach((child: any) => {
        if (child != null && child.id != this.selectedReaction) {
          try { this.renderer.setStyle(child, 'transform', 'scale(1)'); } catch(e) {}
        }
      })

      // Deixa a reação em hover com um efeito de zoom
      if (hoverElement != null) {
        this.renderer.setStyle(hoverElement, 'transform', 'scale(1.6)');
        this.selectedReaction = hoverElement.id;
      }

      this.lastSelectedReactionPostIndex = postIndex;
    // Se o dedo não estiver acima de uma reação
    } else {
      // Reseta o efeito de zoom em todas as reações daquele container
      document.getElementById(`reaction-container-${postIndex}`)?.childNodes.forEach((child: any) => {
        if (child != null) {
          try { this.renderer.setStyle(child, 'transform', 'scale(1)'); } catch(e) {}
        }
      })

      this.selectedReaction = null;
      this.lastSelectedReactionPostIndex = null;
    }
  }

  setPostReaction(postId: string, reaction: string) {
    this.postsReacted[postId] = this.getReactionImageUrl(reaction)!;

    const reactionsImages: { [key: string]: string } = {}
    for (let reaction of this.reactions) {
      reactionsImages[reaction.type] = reaction.imageName;
    }

    this.backendService.likePost(postId, reaction).subscribe()

    this.selectedReaction = null;
    this.lastSelectedReactionPostIndex = null;
  }

  onSelectAttachment(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.publishPostAttachment = event.target.files[0];
      
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (event) => {
        this.publishPostAttachmentURL = event.target?.result;
      }

      event.target.value = '';
    }
  }

  publishPost(textToPublish: string) {
    // Se não tiver attachment
    if (this.publishPostAttachment == null) {
      this.backendService.publishPost(textToPublish).subscribe({
        next: (response) => {
          this.publishPostAttachment = null;

          this.getPosts();
        },
        error: (response: HttpErrorResponse) => {
          this.snackbarService.showErrorMessage(response.error.message[0]);
        }
      })

      return;
    // Se tiver attachment
    } else {
      if (this.publishPostAttachment.size > 5 * 1024 * 1024) {
        this.snackbarService.showErrorMessage('O arquivo deve ter no máximo 5MB');
        return;
      }

      this.backendService.publishPost(textToPublish, this.publishPostAttachment).subscribe({
        next: (response) => {
          this.publishPostAttachment = null;
          this.publishPostAttachmentURL = null;

          this.getPosts();
        },
        error: (response: HttpErrorResponse) => {
          this.snackbarService.showErrorMessage(response.error.message[0]);
        }
      });
    }
  }

  onRemovePostAttachmentClick() {
    this.publishPostAttachment = null;
    this.publishPostAttachmentURL = null
  }

  openPostOptionsMenu(index: number) {
    if (this.postOptionsMenuActive == index) {
      this.postOptionsMenuActive = null;
      return;
    }

    const loggedUserFullname = this.localStorage.getUserPayload()?.fullname;
    if (loggedUserFullname && this.posts[index].author != loggedUserFullname) {
      return;
    }

    this.postOptionsMenuActive = index;
  }

  closeCommentsContainer(event: any) {
    if (event.target.id == 'comments-container') {
      this.unloadAndCloseComments();
    }
  }

  sendComment(text: string) {
    if (text.trim() == '') {
      this.snackbarService.showErrorMessage('O comentário não pode estar vazio.')
      return;
    }

    if (!this.postCommentSectionOpenedId) {
      this.snackbarService.showErrorMessage('Houve uma falha ao enviar a mensagem...')
      return;
    }

    this.backendService.comment(text, this.postCommentSectionOpenedId).subscribe({
      next: (value) => {
        this.commentsToShow.push(value);
      }
    });
  }

  deletePost(postId: string) {
    this.postOptionsMenuActive = null;

    this.backendService.deletePost(postId).subscribe((response: any) => {
      this.snackbarService.showSuccessMessage(response.message);

      this.getPosts();
    });
  }

  loadAndOpenComments(postId: string) {
    this.postCommentSectionOpenedId = postId;

    this.backendService.getComments(postId).subscribe({
      next: (commentsToShow: any) => {
        this.commentsToShow = commentsToShow;
      }
    });
  }

  unloadAndCloseComments() {
    this.postCommentSectionOpenedId = null;
    this.commentsToShow = [];
  }

  share() {
    this.snackbarService.showErrorMessage('Feature ainda não implementada');
  }

  private disableScroll() {
    document.body.style.overflow = 'hidden';
  }

  private enableScroll() {
    document.body.style.overflow = '';
  }
}
