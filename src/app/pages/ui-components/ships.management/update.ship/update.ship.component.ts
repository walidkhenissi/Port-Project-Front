import {Component} from '@angular/core';
import {BoatActivityType} from "../../../../models/boat.activity.type";
import {BoatService} from "../../../../services/boat.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {forkJoin} from "rxjs";
import {GenericService} from "../../../../services/generic.service";

@Component({
  selector: 'app-update.ship',
  templateUrl: './update.ship.component.html',
  styleUrls: ['./update.ship.component.scss']
})
export class UpdateShipComponent {
  boatActivityType: BoatActivityType = new BoatActivityType();
  ship: any = new Object();
  updateForm: FormGroup;
  boatActivityTypes: Array<any> = [];
  shipId: number;
  shipOwnerId: number;
  tab:number;

  constructor(
    private route: ActivatedRoute,
    private shipService: BoatService,
    private genericService: GenericService,
    private router: Router) {
    this.route.params.subscribe((params) => {
      this.shipId = params['id'];
      this.shipOwnerId = params['shipOwnerId'];
      this.tab= params['tab'];
    });
    this.ship.boatActivityType={};
  }

  ngOnInit(): void {
    this.updateForm = new FormGroup({
      nameControl: new FormControl('', Validators.required),
      serialNumberControl: new FormControl('', Validators.required),
      activityTypeControl: new FormControl("")
    });
    if (this.shipId) {
      forkJoin(
        this.shipService.getOne(this.shipId),
        this.genericService.find('BoatActivityType')
      ).subscribe(([response1, response2]: Array<any>) => {
        this.ship = response1.data;
        this.ship.boatActivityType = this.ship.boatActivityType || {};
        this.boatActivityTypes = response2.data;
      });
    } else {
      this.ship.boatActivityType = {};
      this.ship.shipOwnerId=this.shipOwnerId;
      this.genericService.find('BoatActivityType').subscribe((response: any) => {
        console.log(response.data);
        this.boatActivityTypes = response.data;
        console.log(this.boatActivityTypes);
      });
    }
  }

  addShip() {
    this.shipService.create(this.ship)
      .subscribe(
        data => {
          this.router.navigate(['/ui-components/update-shipowner', this.shipOwnerId, this.tab]);
        },
        // Managing Get_User errors
        error => {
          console.log(error);
        });
  }

  updateShip(): void {
    this.shipService.update(this.ship).subscribe(
      (result: any) => {
        if (result.error) {
          console.error('Error updating ship:', result.error);
        } else {
          console.log('Ship updated successfully');
          this.router.navigate(['/ui-components/update-shipowner', this.shipOwnerId, this.tab]);
        }
      },
      (error) => {
        console.error('Error updating ship:', error);
        // Handle errors or show error messages
      }
    );
  }
}
