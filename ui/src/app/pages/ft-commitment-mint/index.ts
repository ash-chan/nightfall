import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import UserService from '../../services/user.service';
import FtCommitmentService from '../../services/ft-commitment.service';
import { UtilService } from '../../services/utils/util.service';
/**
 *  Mint coin component, which is used for rendering the page of Mint ERC-20 token commitment.
 */
@Component({
  selector: 'ft-commitment-mint',
  templateUrl: './index.html',
  providers: [FtCommitmentService, UserService, UtilService],
  styleUrls: ['./index.css'],
})
export default class FtCommitmentMintComponent implements OnInit {
  /**
   * Flag for http request
   */
  isRequesting = false;
  /**
   * To store the random hex string.
   */
  serialNumber = '';
  /**
   * Form object to collect mint details.
   */
  mintCoinForm: FormGroup;
  /**
   * To store the ERC-20 token count.
   */
  coinCount;
  /**
   * Fungeble Token name , read from ERC-20 contract.
   */
  ftName: string;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private ftCommitmentService: FtCommitmentService,
    private userService: UserService,
    private utilService: UtilService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.ftName = localStorage.getItem('ftName');
    this.createForm();
    this.getFTokenInfo();
  }

  /**
   * Method to list down all ERC-20 tokens.
   */
  getFTokenInfo() {
    this.userService.getFTokenInfo().subscribe(
      data => {
        this.coinCount = data['data']['balance'];
      },
      error => {
        console.log('error in user get', error);
      },
    );
  }

  /**
   * Method to create Mint form
   */
  createForm() {
    this.mintCoinForm = this.fb.group({
      A: ['', Validators.required],
    });
  }

  /**
   * Method to Mint ERC-20 token commitemnt.
   */
  mintFTCommitment() {
    const coinToMint = this.mintCoinForm.controls['A'].value;
    if (!coinToMint) { return; }
    if (coinToMint > this.coinCount) {
      return this.toastr.error('You do not have enough ERC-20 tokens');
    }
    this.isRequesting = true;
    const hexValue = (this.mintCoinForm.controls['A'].value).toString(16);
    const hexString = '0x' + hexValue.padStart(32, '0');
    console.log('Hexstring::', hexString);
    this.ftCommitmentService.mintFTCommitment(hexString, localStorage.getItem('publickey')).subscribe(tokenDetails => {
      this.isRequesting = false;
      this.toastr.success('Coin Minted is ' + tokenDetails['data']['coin']);
      this.router.navigate(['/overview'], { queryParams: { selectedTab: 'coins' } });
    }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', 'Error');
      },
    );
  }
}
