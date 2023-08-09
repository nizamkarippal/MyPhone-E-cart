function checkCoupon() {
    event.preventDefault(); // Prevent default form submission
    $.ajax({
      url: "/cart/checkout",
      method: "put",
      data: {
        couponCode: $("#couponCode").val(),
      },
      success: (res) => {
        $("#cartdiv2").load(location.href + (" #cartdiv2"));
        $("#couponMessage").html(res.data.couponCheck);
        $("#couponDiscount").html(res.data.discountPrice);
        $("#inputCouponDiscount").val(res.data.discountPrice);
        $("#finalPrice").html(res.data.finalPrice);
        $("#inputFinalPrice").val(res.data.finalPrice);
      },
    });
  };

