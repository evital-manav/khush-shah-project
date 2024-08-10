import { Router } from '@angular/router';
import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { AuthService } from './../auth/auth.service';
import { MedicinesService } from './../services/medicine.service';
import { Medicine, SearchMedicinesResponse, User } from '../interface/app.interface';
import { UserService } from '../services/user.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  username: string = '';
  searchResults: Medicine[] = [];
  searchQuery: string = '';
  errorMessage: string = '';
  userProfile: User | null = null;
  showProfile: boolean = false;
  searchPerformed: boolean = false;
  isPanelOpen: boolean = false;
  cartItems: any[] = [];
  selectedIndex: number = -1;
  selectedMedicine: any;
  hoveredMedicine: any = null;

  @ViewChildren('resultRow') resultRows!: QueryList<ElementRef>;
  @ViewChild('searchResultsPanel') searchResultsPanel?: ElementRef;

  constructor(
    private authService: AuthService,
    private medicinesService: MedicinesService,
    private router: Router,
    private userService: UserService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.fetchCurrentUser();
  }

  fetchCurrentUser(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userService.getUserById(currentUser.id).subscribe(user => {
        this.userProfile = user;
        this.username = user.name;
      });
    } else {
      this.username = 'Guest';
    }
  }

  toggleProfile(event: Event): void {
    event.stopPropagation();
    this.showProfile = !this.showProfile;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-info-card') && !target.closest('.user-profile-card') ) {
      this.showProfile = false;
    }
    if (this.searchResultsPanel && !this.searchResultsPanel.nativeElement.contains(event.target)) {
      this.closePanel();
    }
  }

  closePanel() {
    this.isPanelOpen = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedIndex = -1;
  }

  onSearch(): void {
    this.searchPerformed = true;

    if (this.searchQuery.trim()) {
      this.medicinesService.searchMedicines(this.searchQuery).subscribe(
        (response: SearchMedicinesResponse) => {
          if (response && response.data && response.data.result) {
            this.searchResults = response.data.result.slice(0,14);
            this.errorMessage = this.searchResults.length === 0 ? 'Results not found. Please contact admin - admin.rx@evital.in' : '';
            this.checkStockStatus();
          } else {
            this.searchResults = [];
            this.errorMessage = 'No results found. Please contact admin - admin.rx@evital.in';
          }
        },
        error => {
          this.errorMessage = 'An error occurred while searching. Please try again.';
          this.searchResults = [];
        }
      );
    } else {
      this.searchResults = [];
      this.errorMessage = '';
      this.selectedIndex = -1;
    }
  }

  checkStockStatus(): void {
    const medicineIds = this.searchResults.map(m => m.medicine_id); // Extract medicine IDs
    const latitude = 12.970612;
    const longitude = 77.6382433;
    const distance = 10;

    this.medicinesService.checkMedicineAvailability(medicineIds, latitude, longitude, distance).subscribe(
      (response) => {
        if (response && response.data && response.data.availability) {
          const availabilityMap = new Map(response.data.availability.map(m => [m.medicine_id, m.in_stock]));
          this.searchResults = this.searchResults.map(medicine => ({
            ...medicine,
            in_stock: availabilityMap.get(medicine.medicine_id) || 'no'
          }));
        }
      },
      (error) => {
        this.errorMessage = 'Error fetching stock status';
      }
    );
  }

  addToCart(medicine: Medicine): void {
    this.cartService.addToCart(medicine);
    this.searchResults = [];
    this.searchQuery = '';
    this.selectedIndex = -1;
  }

  viewMedicineDetails(medicineId: string) {
    this.medicinesService.getMedicineDetails(medicineId).subscribe(
      (response) => {
        if (response.data) {
          this.selectedMedicine = response.data;
        } else {
          this.errorMessage = 'No details found for this medicine ID';
          this.selectedMedicine = null;
        }
      },
      (error) => {
        this.errorMessage = 'Error fetching medicine details';
        this.selectedMedicine = null;
      }
    );
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.searchResults.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        this.selectedIndex = (this.selectedIndex === null || this.selectedIndex >= this.searchResults.length - 1)
          ? 0
          : this.selectedIndex + 1;
        this.scrollToSelected();
        break;
      case 'ArrowUp':
        this.selectedIndex = (this.selectedIndex === null || this.selectedIndex <= 0)
          ? this.searchResults.length - 1
          : this.selectedIndex - 1;
        this.scrollToSelected();
        break;
      case 'Enter':
        if (this.selectedIndex !== null) {
          const selectedMedicine = this.searchResults[this.selectedIndex];
          if (selectedMedicine.in_stock === 'yes') {
            this.addToCart(selectedMedicine);
          }
        }
        break;
      case 'Escape':
        this.closePanel();
        break;
    }
  }

  scrollToSelected(): void {
    if (this.selectedIndex !== null && this.selectedIndex >= 0 && this.selectedIndex < this.searchResults.length) {
      const row = this.resultRows.toArray()[this.selectedIndex];
      if (row) {
        row.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        console.error('No row found for index:', this.selectedIndex);
      }
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    this.handleKeyboardEvent(event);
  }

  onHoverMedicine(medicine: any) {
    this.hoveredMedicine = medicine;
  }

  onLeaveMedicine() {
    this.hoveredMedicine = null;
  }

  onRowClick(medicine: Medicine): void {
    if (medicine.in_stock === 'yes') {
      this.addToCart(medicine);
    }
  }
}
