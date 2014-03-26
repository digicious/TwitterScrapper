$(document).ready(function(){

	if( $(window).width() < 325 )
	{
		$("#columns").css("width","100%");
	}
	
	
	$("figure img").click( function(){
		if( parseInt($(this).css("height")) != 200)
		{
			$(this).css("height","200px");
		}
		else{
			$("figure img").css("height","200px");
			$(this).css("height","auto");
		}
	});

	 	  // Create the dropdown base
      $("<select />").appendTo("nav");
      
      // Create default option "Go to..."
      $("<option />", {
         "selected": "selected",
         "value"   : "",
         "text"    : "Go to..."
      }).appendTo("nav select");
      
      // Populate dropdown with menu items
      $("nav a").each(function() {
       var el = $(this);
       $("<option />", {
           "value"   : el.attr("href"),
           "text"    : el.text()
       }).appendTo("nav select");
      });
      
	   // To make dropdown actually work
	   // To make more unobtrusive: http://css-tricks.com/4064-unobtrusive-page-changer/
      $("nav select").change(function() {
        window.location = $(this).find("option:selected").val();
      });
	 

});

function addToStorage(elemId, item)
{
	var value = $.jStorage.get("itemsILike");
	if(!value)
	{
		value = [];
	}
	var itemCount = value.length;
	value = jQuery.grep(value, function(value) {  return value.url != item.url});
	if( value.length < itemCount)
	{
		// Item is removed.
		$(elemId).css("-webkit-filter","grayscale(100%)");
	}
	else
	{
		// Item has to be added
		$(elemId).css("-webkit-filter","grayscale(0%)");
		value.push(item);
	}

	$.jStorage.set("itemsILike",value);

	return false;
}
