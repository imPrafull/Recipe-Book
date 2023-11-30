import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private toastr: ToastrService,
  ) { }

  show(message: string, cssClass: string) {
    this.toastr.show(message, undefined, {
      timeOut: 2000,
      tapToDismiss: false,
      positionClass: 'toast-top-center',
      disableTimeOut: false,
      toastClass: 'ngx-toastr custom-toast ' + cssClass,
    })
  }
}
