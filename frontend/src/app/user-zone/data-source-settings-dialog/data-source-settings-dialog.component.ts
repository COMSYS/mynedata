import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-data-source-settings-dialog',
  templateUrl: './data-source-settings-dialog.component.html',
  styleUrls: ['./data-source-settings-dialog.component.css']
})
export class DataSourceSettingsDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data, private dialogRef: MatDialogRef<DataSourceSettingsDialogComponent>) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
