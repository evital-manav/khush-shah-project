import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { CoreService } from 'src/app/core/core.service';
import { PatientService } from 'src/app/services/patient.service';


@Component({
  selector: 'app-patient-add-edit',
  templateUrl: './patient-add-edit.component.html',
  styleUrls: ['./patient-add-edit.component.css'],
})
export class PatientAddEditComponent implements OnInit {
  patientForm!: FormGroup;

  bloodGroup: string[] = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
  ];
  constructor(private formBuilder: FormBuilder,
              private patientService: PatientService,
              private bottomSheet: MatBottomSheetRef<PatientAddEditComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
              private coreService: CoreService) { }

  ngOnInit(): void {
    this.patientForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z]+$')]],
      lastName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z]+$')]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      bloodgrp: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$'), Validators.maxLength(10)]],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$'), Validators.maxLength(6)]],
    });

    this.patientForm.patchValue(this.data); // for getting value of update data
  }

  onSubmit() {
    if (this.patientForm.valid) {
      if (this.data) {
        this.patientService.updatePatient(this.data.id, this.patientForm.value)
        .subscribe({
          next: (val: any) => {
            // alert("Patient Updated Succesfully!!");
            this.coreService.openSnackBar('Patient Updated Succesfully!!', 'Ok');
            this.bottomSheet.dismiss(true);
          }, error: (error: any) => {
            console.log('Error: ' + error);
          }
        });
      } else {
        this.patientService.addPatient(this.patientForm.value).subscribe({
          next: (val: any) => {
            // alert("Patient Added Succesfully!!");
            this.coreService.openSnackBar('Patient Added Succesfully!!', 'Ok');
            this.bottomSheet.dismiss(true);
          }, error: (error: any) => {
            console.log('Error: ' + error);
          }
        });
      }
    }
  }

  onCancel() {
    this.bottomSheet.dismiss();
  }

  onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, ''); // remove non-numeric characters
    if (input.value.length > 10) {
      input.value = input.value.slice(0, 10);
    }
    this.patientForm.get('mobile')!.setValue(input.value);
  }

  onZipCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '')
    if (input.value.length > 6) {
      input.value = input.value.slice(0, 6);
    }
    this.patientForm.get('zipCode')!.setValue(input.value);
  }
};
