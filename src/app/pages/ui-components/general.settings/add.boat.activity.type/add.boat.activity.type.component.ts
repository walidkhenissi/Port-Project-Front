import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {BoatActivityType} from 'src/app/models/boat.activity.type';
import {BoatService} from 'src/app/services/boat.service';
import {GenericService} from "../../../../services/generic.service";
import {MatDialog} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {forkJoin, Observable} from "rxjs";
import {BoatActivityTypeService} from "../../../../services/boat-activity-type.service";

@Component({
  selector: 'app-add.boat.activity.type',
  templateUrl: './add.boat.activity.type.component.html',
  styleUrls: ['./add.boat.activity.type.component.scss']
})
export class AddBoatActivityTypeComponent {

  boatActivitytype: any = new Object();
  boatActivitytypeList: Array<any>;
  activityTypeId: number;
  updateForm: FormGroup;
  tab:number;

  constructor(
    private route: ActivatedRoute,
    private boatActivityTypeService: BoatActivityTypeService,
    private router: Router,
    private genericService: GenericService,
    private dialog: MatDialog
  ) {
    this.route.params.subscribe((params) => {
      this.activityTypeId = params['id'];
      this.tab = params['tab'];
    });
    this.updateForm = new FormGroup({
      activityNameFormControl: new FormControl('', Validators.required)
    });
    if (this.activityTypeId) {
      forkJoin(
        this.boatActivityTypeService.getOne(this.activityTypeId),
        this.genericService.find('BoatActivityType')
      ).subscribe(([response1, response2]: Array<any>) => {
        this.boatActivitytype = response1.data;
        this.boatActivitytypeList = response2.data;
      });
    } else {
      this.genericService.find('BoatActivityType').subscribe((response: any) => {
        this.boatActivitytypeList = response.data;
      });
    }
  }

  save() {
    let request: Observable<any>;
    if (this.activityTypeId)
      request = this.boatActivityTypeService.update(this.boatActivitytype);
    else
      request = this.boatActivityTypeService.create(this.boatActivitytype);
    request.subscribe(
      data => {
        this.router.navigate(['/ui-components/general-settings', this.tab]);
      },
      // Managing Get_User errors
      error => {
        console.log(error);
      });
  }

  public isValidForm() {
    return this.boatActivitytype.name ? true : false;

  }
}
