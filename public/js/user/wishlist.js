
// removing product from wishlist 
function removeFromWishlist(productId){
 
        $.ajax({
          url : '/wishlist',
          method : 'delete',
          data : {
            id : productId,
          },
          success : (res) => {
            if(res.data.deleted){
              $("#wishlist").load(location.href + " #wishlist");
            }
          }
        });
  
}

// adding products to cart from wishlist
function addToCartFromWishlist(productId, productDetails){
  const ramCapacity = $('#ramCapacitySelect').val();
  const romPrice = JSON.parse(productDetails).find((item) => item.ramCapacity == ramCapacity);
  const romCapacity = romPrice.romCapacity;
  const price = romPrice.price;
  console.log('reached');
  $.ajax({
    url: "/cart",
    method: "post",
    data: {
      id: productId,
      price : price,
      ramCapacity : ramCapacity,
      romCapacity : romCapacity,
    },
    success: (res) => {
      if (res.success === "countAdded") {
        Swal.fire({
          toast: true,
          icon: "success",
          position: "top-right",
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
          animation: true,
          title: "Count added in cart",
        });
        window.location.href = '/cart'
      } else if (res.success === "addedToCart") {
        Swal.fire({
          toast: true,
          icon: "success",
          position: "top-right",
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
          animation: true,
          title: "Added to cart",
        });
        window.location.href = '/cart'
      } else {
        window.location.href = "/login";
      }
    },
  });
}