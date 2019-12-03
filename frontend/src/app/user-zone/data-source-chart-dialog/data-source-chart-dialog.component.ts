import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-data-source-chart-dialog',
  templateUrl: './data-source-chart-dialog.component.html',
  styleUrls: ['./data-source-chart-dialog.component.css']
})
export class DataSourceChartDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data, private dialogRef: MatDialogRef<DataSourceChartDialogComponent>) { }

  ngOnInit() {
  }

  closeDialog() {
      this.dialogRef.close();
  }

  getChartPath() {
    return `../../../assets/demo/chart_${this.data['img']}.PNG`;
  }

}
