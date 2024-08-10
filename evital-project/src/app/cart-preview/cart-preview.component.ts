import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { Medicine } from '../interface/app.interface';

@Component({
  selector: 'app-cart-preview',
  templateUrl: './cart-preview.component.html',
  styleUrls: ['./cart-preview.component.css']
})
export class CartPreviewComponent implements OnInit {
  cart: Medicine[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(cart => {
      this.cart = cart;
    });
  }
}
