// ============= ajax call for filtering products ========================//
function filter(filterBy, Id, listingName){
  
  $.ajax({
    url:'/products',
    type:'patch',
    data : {
      filterBy : filterBy,
      Id : Id,
      listingName : listingName,
    },
    success : (res) => {
      
      if(res.success == "clear"){
        $('#productContainer').load(location.href + ' #productContainer');
        $("#searchInput").val("");
      }else{
        $('#productContainer').load(location.href + ' #productContainer'); 
     }
      if(res.success == 0){
        $('#searchInput').val('');
      }
    }
  });
}


  // ============= ajax call for removing filter [all products] =========================//

function removeFilter(filterBy){
  
    $.ajax({
      url : '/products',
      type : 'patch',
      data : {
        filterBy : filterBy,
     
      },
      success : (res) => {
        console.log(res);
        $('#productContainer').load(location.href + ' #productContainer');
       
      }
    })
  }



  function sortBy(event, order) {
   
    const liElements = document.querySelectorAll('.dropdown-item');
    liElements.forEach((li) => {
      li.classList.remove('active');
    });
  
    event.target.classList.add('active');
  
    $.ajax({
      url: '/products',
      type: 'post',
      data: {
        sortBy: order,
      },
      success: (res) => {
       
        $('#productContainer').load(location.href + ' #productContainer');
      },
    });
  }

  //================ AJAX Call for Seraching ===============================//


function search(){
    const searchInput = $('#searchInput').val();
   
    $.ajax({
      url:'/products',
      type : 'put',
      data : {
        searchInput : searchInput,
      },
      success: (res) => {
        
        $('#productContainer').load(location.href + ' #productContainer');
      }
    });
  }



