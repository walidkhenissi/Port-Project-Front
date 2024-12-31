import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {BeneficiaryService} from "../../../../services/beneficiary.service";
import {GenericService} from "../../../../services/generic.service";
import {GridsStateService} from "../../../../services/grids-state.service";
import {MatDialog} from "@angular/material/dialog";
import {Observable} from "rxjs";
import {ArticleService} from "../../../../services/article.service";

@Component({
  selector: 'app-update-article',
  templateUrl: './update-article.component.html',
  styleUrls: ['./update-article.component.scss']
})
export class UpdateArticleComponent {

  articleId: number;
  tab: number;
  updateForm: FormGroup;
  article: any = new Object();

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private genericService: GenericService,
    private gridsStateService: GridsStateService,
    private router: Router,
    private dialog: MatDialog) {
    this.route.params.subscribe((params) => {
      this.articleId = params['id'];
      this.tab = params['tab'];
    });
  }

  ngOnInit(): void {
    this.updateForm = new FormGroup({
      articleNameFormControl: new FormControl('', Validators.required),
    });
    if (this.articleId)
      this.articleService.getOne(this.articleId).subscribe((response: any) => {
        this.article = response.data;
      });
  }

  save() {
    let request: Observable<any>;
    if (this.articleId)
      request = this.articleService.update(this.article);
    else
      request = this.articleService.create(this.article);
    request.subscribe((response: any) => {
        this.goBack();
      },
      // Managing Get_User errors
      (response: any) => {
        console.log(response);
      });
  }

  goBack() {
    this.router.navigate(['/ui-components/general-settings', this.tab]);
  }

  isValidForm() {
    return this.updateForm.valid;
  }

}
