import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<ConfirmDialogComponent>) {}

  ngOnInit() {
  }

  public confirm(){
    this.data.confirm();
    this.dialogRef.close();
  }

  public reject(){
    this.data.reject();
    this.dialogRef.close();
  }

}
