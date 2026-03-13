import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api-service.service';
import { throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DynamicFormComponent } from "../dynamic-form/dynamic-form.component";
import { Router } from '@angular/router';
import { GradingDataService } from '../../services/grading-data.service';
import { AuthService } from '../../services/auth-service.service';

/**
 * Component that shows the generated grading PDF and enables to download or edit it.
 */
@Component({
    selector: 'app-show-grading',
    standalone: true,
    templateUrl: './show-grading.component.html',
    styleUrl: './show-grading.component.scss',
    imports: [ CommonModule, PdfViewerModule, DynamicFormComponent]
})
export class ShowGradingComponent implements OnInit{
  pdfUrl = '';
  formJsonConfig!: JSON;

  /**
   * The constructor of the component. Here are also given all needed services to inject as parameters.
   * 
   * @param api Service that handles the api communication with the backend.
   * @param router Enables naviagtion between pages.
   * @param gradingDataService Service for the grading data.
   * @param authService Service that handles the user and its authentication.
   */
  constructor(private api: ApiService, 
    public router: Router, 
    private gradingDataService: GradingDataService, 
    private authService: AuthService
  ) {}

  /**
   * Function that is called when the component is created. It gets the PDF from the backend so that it can be displayed.
   */
  ngOnInit(): void {
    var mediaType = 'application/pdf';
    this.api.getPDF(this.authService.getUsername()).subscribe(
        (response) => {
            var blob = new Blob([response], { type: mediaType });
            this.pdfUrl  = window.URL.createObjectURL(blob);
        },
        e => { throwError(e); }
    );
  }

  /**
   * Function that handles the download of the PDF.
   */
  public downloadPDF(): any {
    var PDFLink = document.createElement('a');
    PDFLink.href = this.pdfUrl;

    window.open(this.pdfUrl, '_blank');
  }

  /**
   * Function that handles the possibility to edit the grading data.
   */
  public editData() {
    this.router.navigate(['/gradingSystem']);
  }

  /**
   * Function that handles the grading of a new thesis.
   */
  public gradeNewThesis() {
    if (confirm('Do you want to grade a new thesis? The existing data will be deleted!')) {
      this.gradingDataService.clearStoredGeneralData();
      this.gradingDataService.clearStoredGradingData();
      this.router.navigate(['/generalDataInput']);
    }
  }
}
