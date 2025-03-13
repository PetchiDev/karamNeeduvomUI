import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DonationService, Donation } from 'src/app/Services/donation.service';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  donations: Donation[] = [];
  donationForm: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess = false;
  
  constructor(
    private fb: FormBuilder,
    private donationService: DonationService
  ) {
    this.donationForm = this.fb.group({
      itemName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      location: ['', Validators.required],
      contact: ['', Validators.required,Validators.minLength(10)],
      file: [null]
    });
  }
  ngOnInit(): void {
    this.fetchDonations();
  }
  fetchDonations(): void {
    this.donationService.getDonations().subscribe({
      next: (data: Donation[]) => {
        this.donations = data;
      },
      error: (error) => {
        console.error('Failed to fetch donations:', error);
      }
    });
  }
  @ViewChild('fileInput') fileInput?: ElementRef;
  removeFile(event: Event): void {
    event.stopPropagation(); // Prevent triggering the parent div's click event
    this.selectedFile = null;
    this.donationForm.patchValue({ file: null });
    // Reset the file input so the same file can be selected again if needed
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
  // Modified onFileChange method for better drop support
  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPEG or PNG)');
        return;
      }
      if (file.size > maxSize) {
        alert('File size should not exceed 5MB');
        return;
      }
      this.selectedFile = file;
      this.donationForm.patchValue({ file: file });
    }
  }
  submitDonation(): void {
    if (this.donationForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.donationForm.controls).forEach(key => {
        const control = this.donationForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = false;
    const formData = new FormData();
    formData.append('ItemName', this.donationForm.get('itemName')?.value);
    formData.append('Description', this.donationForm.get('description')?.value);
    formData.append('Location', this.donationForm.get('location')?.value);
    formData.append('ContactNumber', this.donationForm.get('contact')?.value);
    if (this.selectedFile) {
      formData.append('File', this.selectedFile, this.selectedFile.name);
    }
    this.donationService.submitDonation(formData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (data: Donation[]) => {
          this.donations = data;
          this.resetForm();
          this.fetchDonations();
          this.submitSuccess = true;
          setTimeout(() => this.submitSuccess = false, 5000);
        },
        error: (error) => {
          this.submitError = error.message || 'An error occurred while submitting your donation';
        }
      });
  }

  navigateLocation(location: any) {
    window.open('https://www.google.com/maps/search/?api=1&query=' + location, '_blank');
  }
  resetForm(): void {
    this.donationForm.reset();
    this.selectedFile = null;
  }
  // Form validation getters
  get itemNameControl() { return this.donationForm.get('itemName'); }
  get descriptionControl() { return this.donationForm.get('description'); }
  get locationControl() { return this.donationForm.get('location'); }
  get ContactControl() { return this.donationForm.get('contact'); }
}
