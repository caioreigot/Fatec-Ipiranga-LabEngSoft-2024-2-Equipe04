import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/shared/services/backend.service';
import { LocalStorageService } from 'src/app/shared/services/local-storage.service';
import { SnackbarService } from 'src/app/shared/services/snackbar.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  profile: {
    id: string;
    fullname: string,
    first_name: string;
    last_name: string;
    following: boolean;
    profile_picture_url: string | null;
    soccer_role: string | null,
    attachments: string[],
    posts: any[]
  } | null = null

  itsOwnProfile: boolean = false;
  
  uploadImagePreviewURL: string | ArrayBuffer | null = null;
  isUploadPictureModalOpen: boolean = false;
  isEditModalOpen: boolean = false;

  loadingProfile = true;
  
  roleSelected = ''
  advertiserChecked = false;
  disableSelect = new FormControl(false);

  inPublications = true;
  inGallery = false;

  @ViewChild('profilePictureInput') profilePictureInput: ElementRef | undefined;

  constructor(
    private backend: BackendService,
    private snackbar: SnackbarService,
    private localStorage: LocalStorageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.url.subscribe(urlSegments => {
      const userid = urlSegments[1]?.path;

      if (userid == 'me') {
        this.itsOwnProfile = true;
      }
      
      this.backend.getProfile(userid).subscribe({
        next: (response) => {
          this.profile = response;
          this.loadingProfile = false;
          this.itsOwnProfile = response.own_profile;

          this.localStorage.saveProfilePictureUrl(response.profile_picture_url);
        }
      });
    });
  }

  onSelectFile(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (event) => {
        if (!event.target?.result) return;
        this.uploadImagePreviewURL = event.target.result;
      }
    }
  }

  setUploadPictureModalVisibility(isVisible: boolean) {
    this.uploadImagePreviewURL = null;
    this.isUploadPictureModalOpen = isVisible;
  }

  onConfirmProfilePic() {
    this.isUploadPictureModalOpen = false;

    if (this.profilePictureInput?.nativeElement) {
      const file = this.profilePictureInput.nativeElement.files?.[0];
      
      if (file) {
        const formData = new FormData();
        formData.set('file', file);
        
        this.backend.uploadProfilePicture(formData).subscribe((response) => {
          if (this.profile) {
            this.profile.profile_picture_url = response.imageURL;
          }

          this.localStorage.saveProfilePictureUrl(response.imageURL);
          this.snackbar.showSuccessMessage('Foto de perfil atualizada com sucesso!');
        });
      }
    }
  }

  toggleFollow() {
    if (this.profile) {
      this.backend.toggleFollow(this.profile.id).subscribe((response) => {
        if (this.profile) {
          this.profile.following = !this.profile.following;
        }
      });
    }
  }

  onConfirmEditRole() {
    let role = this.roleSelected?.trim()

    if (!role && !this.advertiserChecked) {
      this.snackbar.showErrorMessage('Por favor, selecione alguma função');
      return;
    } else if (this.advertiserChecked) {
      role = 'Anunciante'
    }

    this.setEditInfoModalVisibility(false);
    
    this.backend.updateSoccerRole(role).subscribe(() => {
      this.snackbar.showSuccessMessage('Perfil atualizado com sucesso!');
    });

    if (this.profile) {
      this.profile.soccer_role = role;
    }
  }
  
  setEditInfoModalVisibility(isVisible: boolean) {
    this.isEditModalOpen = isVisible;
  }

  logout() {
    this.localStorage.clearProfilePictureUrl();
    this.localStorage.clearToken();
    this.router.navigate(['/login']);
  }
}
