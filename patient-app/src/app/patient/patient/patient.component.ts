import { PatientAddEditComponent } from './../patient-add-edit/patient-add-edit.component';
import { ConfirmDialogComponent } from './../../confirm-dialog/confirm-dialog.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PatientService } from 'src/app/services/patient.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { CoreService } from 'src/app/core/core.service';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {
  title = 'evital-app';
  displayedColumns: string[] = [
    'id',
    'firstName',
    'lastName',
    'email',
    'dob',
    'gender',
    'bloodgrp',
    'mobile',
    'zipCode',
    'action',
  ];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private _bottomSheet: MatBottomSheet,
              private patientService: PatientService,
              private coreService: CoreService,
              private dialog: MatDialog) {}

  ngOnInit(): void {
    this.getPatientList();
  }

  openAddEditPatientForm() {
    const btmSheetRef = this._bottomSheet.open(PatientAddEditComponent);
    btmSheetRef.afterDismissed().subscribe({
      next: (val) => {
        if(val) {
          this.getPatientList();
        }
      }
    });
  }

  getPatientList() {
    this.patientService.getPatientList().subscribe({
      next: (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.log("Error: " + err);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deletePatient(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: {}
    });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.patientService.deletePatient(id).subscribe({
            next: (res) => {
              this.coreService.openSnackBar('Patient Deleted Successfully!!', 'Ok');
              this.getPatientList();
            },
            error: (err) => {
              console.log("Error: " + err);
            }
          });
        }
      });
  }

  openEditPatientForm(data: any) {
    const btmSheetRef  = this._bottomSheet.open(PatientAddEditComponent, {
      data,
    });
    btmSheetRef.afterDismissed().subscribe({
      next: (val) => {
        if(val) {
          this.getPatientList();
        }
      }
    });
  }

}
