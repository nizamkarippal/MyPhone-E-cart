// removing product from cart
function removeFromCart(productId){
    $.ajax({
          url : '/cart',
          method : 'delete',
          data : {
                id : productId,
          },
          
          success : (res) => {
            console.log('ajax work');
                if (res.success === "removed") {
                     $('#cart').load(location.href + ' #cart');
                     
                    }
          },
    });
};




// add count of products in cart
function addCount(cartId, i, ramCapacity, productId){
      $.ajax({
            url : '/cart/count',
            type : 'put',
            data : {
                  cartId : cartId, // products._id in cart
                  ramCapacity : ramCapacity,
                  productId : productId, // products._name._id in cart
            },
            success : (res) => {
                if(res.data.message === 'countAdded' ){
                      $("#cart").load(location.href + " #cart")
                }else if(res.data.message === 'outOfStock'){
                  swal.fire({
                        icon: 'error',
                        title: 'Out of Stock',
                        text: 'Quantity in Cart exceeds the available stock quantity',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'OK'
                      });
                }
            } 
      });
};




// reduce count of products in cart 
function reduceCount(cartId, i){
      $.ajax({
            url : '/cart/count',
            method : 'delete',
            data : {
                  cartId : cartId,
            },
            success : (res) => {
                  $(`#cart`).load(location.href + " #cart")
            }
      });
}


// ===============================


// checking out of stock while proceeding to checkout
function proceedToCheckout(event, userCart, quantityInStock){
      event.preventDefault();
      const cart = JSON.parse(userCart);
      const stock = JSON.parse(quantityInStock)

      let outOfStock = false;
      cart.products.forEach((product, i) =>  {
            if(product.quantity > stock[i]){
                  outOfStock = true;
            }
      });

      if(outOfStock === true){
            swal.fire({
                  icon: 'error',
                  title: 'Out of Stock',
                  text: 'Quantity in Cart exceeds the available stock quantity',
                  confirmButtonColor: '#3085d6',
                  confirmButtonText: 'OK'
                });
      } else{
            window.location = '/cart/checkout'
      }
}




